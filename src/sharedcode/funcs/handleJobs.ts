import type { InvocationContext } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import type { BlobFile } from "@vtfk/azure-blob-client";
import * as blobClient from "@vtfk/azure-blob-client"; // TODO: Remove in favor of @vestfoldfylke/azure-blob-client
import type { ArchiveAttachment } from "../../types/archive.js";
import type { DispatchDocument } from "../../types/dispatches.js";
import type { CreateCaseDocumentTask, CreateStatisticsTask, IssueDispatchTask, JobDocument, JobTask, SyncRecipientTask, UploadAttachmentTask } from "../../types/jobs.js";
import type { FunctionResponse, HTTPErrorResponse } from "../../types/response.js";
import type { StatisticsResult } from "../../types/statistics.js";
import getDb from "../connections/masseutsendelseDB.js";
import { alertTeams } from "../helpers/alertTeams.js";
import { addAttachment, createCaseDocument, dispatchDocuments, syncRecipient } from "../helpers/archive.js";
import { createStatistics } from "../helpers/statistics.js";
import Dispatches from "../models/dispatches.js";
import Jobs from "../models/jobs.js";
import { errorResponse, response } from "../response/response-handler.js";
import HTTPError from "../vtfk-errors/httperror.js";

type AttachmentPayload = {
  base64?: string;
  blobPath?: string;
  format?: string;
  title?: string;
  [key: string]: unknown;
};

type ResolvedAttachment = AttachmentPayload & { base64: string };

const normalizeBase64Data = (data: string): string => {
  if (typeof data !== "string") {
    return data;
  }

  if (data.startsWith("data:") && data.includes(",")) {
    return data.substring(data.indexOf(",") + 1);
  }

  return data;
};

const resolveAttachmentBase64 = async (attachment: AttachmentPayload | undefined): Promise<ResolvedAttachment> => {
  if (!attachment) {
    throw new Error("Attachment payload is missing");
  }

  if (attachment.base64) {
    return {
      ...attachment,
      base64: normalizeBase64Data(attachment.base64)
    };
  }

  if (!attachment.blobPath) {
    throw new Error("Attachment is missing both base64 and blobPath");
  }

  const file: BlobFile | undefined = await blobClient.get(attachment.blobPath);
  if (!file?.data) {
    throw new Error(`No blob data found for ${attachment.blobPath}`);
  }

  return {
    ...attachment,
    base64: normalizeBase64Data(file.data)
  };
};

const handleSyncRecipients = async (jobId: string, jobName: string, jobTasks: SyncRecipientTask[], functionName: string): Promise<void> => {
  try {
    const updatedTask: SyncRecipientTask[] = [];
    let numbOfFailedTasks: number = 0;

    logger.info("Checking each syncRecipientTask");
    for (const task of jobTasks) {
      const jobDocument: JobDocument | null = await Jobs.findOne({ _id: jobId });
      if (!jobDocument) {
        logger.error("Current Job: {JobName}, no job document found.", jobName);
        // noinspection ExceptionCaughtLocallyJS - Intentional
        throw new Error(`Document not found for Job ${jobName}`);
      }

      const syncRecipients: SyncRecipientTask[] = jobDocument.tasks.syncRecipients;
      const currentTaskIndex: number = syncRecipients.findIndex((t: SyncRecipientTask) => t.ssn === task.ssn);
      logger.info("Working with {JobName} task with index: {CurrentTaskIndex}.", jobName, currentTaskIndex);

      if (task.status === "waiting" || task.status === "inprogress" || task.status === "failed") {
        if (task.status === "failed" && task.retry === 7) {
          logger.error("The {JobName} task with index: {CurrentTaskIndex} have failed {TaskRetry} times. Whole job is set to failed", jobName, currentTaskIndex, task.retry);
          const filter = { _id: jobId };
          const update = {
            "status.syncRecipients": "failed"
          };
          await Jobs.findOneAndUpdate(filter, update, {
            returnDocument: "after"
          });
        }

        try {
          logger.info("Syncing recipient using: {Method}", task.method);
          const response: unknown = await syncRecipient(task.ssn, task.method);
          logger.info("Recipient synced");
          if (currentTaskIndex !== -1) {
            const target: SyncRecipientTask | undefined = syncRecipients[currentTaskIndex];
            if (target?.status === "completed") {
              updatedTask.push(target);
            } else if (target) {
              target.status = "completed";
              updatedTask.push({ ...target, response });
            }
          } else {
            logger.error("Failed Syncing recipient using: {Method} in job: {Job} with mongoDB id: {JobId}", task.method, jobName, jobId);
            await alertTeams(`Failed Syncing recipient using: ${task.method} in job: ${jobName}`, "error", "syncRecipients", null, jobId, functionName);
          }
        } catch (error) {
          try {
            logger.info("Handling the failed {JobName} task, updating", jobName);
            numbOfFailedTasks += 1;
            const errorMessage: string = error instanceof HTTPError ? error.message : error instanceof Error ? error.message : JSON.stringify(error);
            await alertTeams(JSON.stringify(errorMessage ?? error), "error", "syncRecipients", null, jobId, functionName);
            logger.errorException(
              error,
              "The job: {Job} with mongoDB id: {JobId} failed. Task with the index {CurrentTaskIndex} failed. Check the teams warning for more info!",
              jobName,
              jobId,
              currentTaskIndex
            );

            const target: SyncRecipientTask | undefined = syncRecipients[currentTaskIndex];
            if (target?.retry) {
              target.retry += 1;
            }
            const errorObj = {
              msg: errorMessage ?? error,
              retry: target?.retry ? target.retry : 1
            };
            logger.warn("{JobName} task with the index: {CurrentTaskIndex} is set to failed with ErrorObj: {@ErrorObj}", jobName, currentTaskIndex, errorObj);
            if (target) {
              target.status = "failed";
              updatedTask.push({ ...target, ...errorObj });
            }
          } catch (innerError) {
            logger.errorException(innerError, "Failed pushing the job: {Job} with mongoDB id: {JobId} to mongoDB!", jobName, jobId);
            await alertTeams(JSON.stringify(innerError), "error", "syncRecipients", null, jobId, functionName);
          }
        }
      } else if (task.status === "completed") {
        const target: SyncRecipientTask | undefined = syncRecipients[currentTaskIndex];
        if (target) {
          updatedTask.push(target);
        }
      }
    }

    const filter = { _id: jobId };
    const update = {
      "status.syncRecipients": numbOfFailedTasks === 0 ? "completed" : "inprogress",
      "tasks.syncRecipients": updatedTask
    };
    logger.info("Updating the job with the id: {JobId}", jobId);
    await Jobs.findOneAndUpdate(filter, update, {
      returnDocument: "after"
    });
  } catch (error) {
    logger.errorException(error, "Failed pushing the job: {Job} with mongoDB id: {JobId} to mongoDB!", jobName, jobId);
    await alertTeams(JSON.stringify(error), "error", "syncRecipients", null, jobId, functionName);
  }
};

const handleCreateCaseDocument = async (jobId: string, jobName: string, jobTasks: CreateCaseDocumentTask[], functionName: string): Promise<void> => {
  let currentCase: CreateCaseDocumentTask | undefined;

  try {
    const jobDocument: JobDocument | null = await Jobs.findOne({ _id: jobId });
    if (!jobDocument) {
      logger.error("Current Job: {JobName}, no job document found.", jobName);
      // noinspection ExceptionCaughtLocallyJS - Intentional
      throw new Error(`Document not found for Job ${jobName}`);
    }

    //const currentCase: CreateCaseDocumentTask | undefined = jobDocument.tasks.createCaseDocument[0];
    currentCase = jobDocument.tasks.createCaseDocument[0];
    const issueDispatchCopy: IssueDispatchTask[] = jobDocument.tasks.issueDispatch;
    const uploadAttachmentsCopy: UploadAttachmentTask[] = jobDocument.tasks.uploadAttachments;

    if (!currentCase) {
      // noinspection ExceptionCaughtLocallyJS - Intentional
      throw new Error(`createCaseDocument task not found for Job ${jobName}`);
    }

    if (Number.isInteger(currentCase.retry)) {
      (currentCase.retry as number) += 1;
    } else {
      currentCase.retry = 0;
    }

    const firstCurrentTask: CreateCaseDocumentTask | undefined = jobTasks[0];
    if (!firstCurrentTask) {
      logger.error("Current Job: {JobName}, first task not found.", jobName);
      // noinspection ExceptionCaughtLocallyJS - Intentional
      throw new Error(`Task not found for Job ${jobName}`);
    }

    if (firstCurrentTask.retry === 7) {
      const filter = { _id: jobId };
      const update = {
        "status.createCaseDocument": "failed"
      };
      await Jobs.findOneAndUpdate(filter, update, {
        returnDocument: "after"
      });
      logger.warn("Job with name {JobName} has 7 failed attempts. Setting status as failed", jobName);

      return;
    }

    logger.info("Creating the case object");

    const caseAttachments: ArchiveAttachment[] = [];

    if (Array.isArray(firstCurrentTask.data.parameter.attachments) && firstCurrentTask.data.parameter.attachments.length > 0) {
      const resolvedAttachments: ResolvedAttachment[] = [];
      for (const attachment of firstCurrentTask.data.parameter.attachments) {
        resolvedAttachments.push(await resolveAttachmentBase64(attachment as AttachmentPayload));
      }

      caseAttachments.push(...resolvedAttachments.map((a: ResolvedAttachment) => ({ base64: a.base64, format: a.format ?? "", title: a.title ?? "" })));
    }

    logger.info("Trying to create the case document");
    const caseDoc = (await createCaseDocument(
      firstCurrentTask.method,
      firstCurrentTask.data.parameter.title,
      firstCurrentTask.data.parameter.caseNumber,
      firstCurrentTask.data.parameter.date,
      firstCurrentTask.data.parameter.contacts,
      caseAttachments,
      firstCurrentTask.data.parameter.paragraph,
      firstCurrentTask.data.parameter.responsiblePersonEmail
    )) as { DocumentNumber: string };

    logger.info("Case document created");
    currentCase.response = caseDoc;
    currentCase.status = "completed";

    for (const dispatch of issueDispatchCopy) {
      dispatch.dataMapping = caseDoc.DocumentNumber;
    }
    for (const attachment of uploadAttachmentsCopy) {
      attachment.dataMapping = caseDoc.DocumentNumber;
    }

    const filter = { _id: jobId };
    const update = {
      "status.createCaseDocument": "completed",
      "tasks.createCaseDocument": [currentCase],
      "tasks.issueDispatch": issueDispatchCopy,
      "tasks.uploadAttachments": uploadAttachmentsCopy
    };
    logger.info("Updating job with id: {JobId}", jobId);
    await Jobs.findOneAndUpdate(filter, update, {
      returnDocument: "after"
    });
    logger.info("Job with id: {JobId} updated", jobId);
  } catch (error) {
    logger.errorException(error, "Failed pushing the job: {Job} with mongoDB id: {JobId} to mongoDB!", jobName, jobId);
    await alertTeams(JSON.stringify(error), "error", "createCaseDocument", null, jobId, functionName);

    if (currentCase) {
      currentCase.status = "failed";

      const filter = { _id: jobId };
      const update = {
        "tasks.createCaseDocument": [currentCase]
      };
      logger.info("Updating job with id: {JobId}", jobId);
      await Jobs.findOneAndUpdate(filter, update, {
        returnDocument: "after"
      });
      logger.info("Job with id: {JobId} updated", jobId);
    }

    throw error;
  }
};

const handleUploadAttachments = async (jobId: string, jobName: string, jobTasks: UploadAttachmentTask[], functionName: string): Promise<void> => {
  let currentTaskIndex: number = -1;

  try {
    const jobDocument: JobDocument | null = await Jobs.findOne({ _id: jobId });
    if (!jobDocument) {
      logger.error("Current Job: {JobName}, no job document found.", jobName);
      // noinspection ExceptionCaughtLocallyJS - Intentional
      throw new Error(`Document not found for Job ${jobName}`);
    }

    const issueDispatchCopy: IssueDispatchTask[] = jobDocument.tasks.issueDispatch;

    const attachments: UploadAttachmentTask[] = [];

    for (const attachmentTask of jobTasks) {
      const parameterData: AttachmentPayload = (attachmentTask.data as { parameter: AttachmentPayload }).parameter;
      const title: string | undefined = parameterData.title;
      currentTaskIndex = jobTasks.findIndex((task: UploadAttachmentTask) => (task.data as { parameter: AttachmentPayload }).parameter.title === title);
      logger.info("Handling current attachment: {Title}, with index: {CurrentTaskIndex}", title, currentTaskIndex);

      const currentTaskAtIndex: UploadAttachmentTask | undefined = jobTasks[currentTaskIndex];
      if (currentTaskAtIndex?.retry !== undefined && currentTaskAtIndex.retry >= 7) {
        try {
          const filter = { _id: jobId };
          const update = {
            "status.uploadAttachments": "failed"
          };
          await Jobs.findOneAndUpdate(filter, update, {
            returnDocument: "after"
          });
        } catch (error) {
          logger.errorException(error, "Failed to update the status of: {JobName} with the job id: {JobId}", jobName, jobId);
          await alertTeams(`Failed to update the status of: ${jobName}`, "error", "uploadAttachments", null, jobId, functionName);
        }

        // noinspection ExceptionCaughtLocallyJS - Intentional
        throw new Error("Task have failed 7 times or more");
      }

      const firstTask: UploadAttachmentTask | undefined = jobTasks[0];
      logger.info("Checking if the first attachment is added");
      if (firstTask?.status === "completed") {
        logger.info("The first attachment is added, handling the rest");
        if (currentTaskAtIndex?.status) {
          if (currentTaskAtIndex.status !== "completed") {
            currentTaskAtIndex.status = "inprogress";
          }
        } else if (currentTaskAtIndex) {
          currentTaskAtIndex.status = "inprogress";
        }
      } else if (currentTaskAtIndex) {
        currentTaskAtIndex.status = "inprogress";
      }

      if (currentTaskAtIndex?.status === "inprogress") {
        logger.info("Adding attachment");
        const resolvedAttachment: ResolvedAttachment = await resolveAttachmentBase64(parameterData);
        const addedAttachment = (await addAttachment(
          attachmentTask.data.system,
          attachmentTask.dataMapping,
          resolvedAttachment.base64,
          resolvedAttachment.format ?? "",
          resolvedAttachment.title ?? ""
        )) as { DocumentNumber: string };
        logger.info("Attachment added");

        const firstDispatch: IssueDispatchTask | undefined = issueDispatchCopy[0];
        if (firstDispatch) {
          firstDispatch.dataMapping = addedAttachment.DocumentNumber;
        }
        currentTaskAtIndex.response = addedAttachment;
        currentTaskAtIndex.status = "completed";
      }
    }

    attachments.push(...jobTasks);

    logger.info("Checking if all the attachments have been added");
    let completedTasks: number = 0;
    for (const task of attachments) {
      if (task.status === "completed") {
        completedTasks += 1;
      }
    }
    logger.info("Number of attachments: {AttachmentCount}, attachments added: {CompletedTasks}", attachments.length, completedTasks);

    logger.info("Updating the changes made to the job with JobId: {JobId}", jobId);
    const filter = { _id: jobId };
    const update = {
      "tasks.issueDispatch": issueDispatchCopy,
      "status.uploadAttachments": attachments.length === completedTasks ? "completed" : "inprogress",
      "tasks.uploadAttachments": attachments
    };
    logger.info("Finding the job and updating the job with JobId {JobId}", jobId);
    await Jobs.findOneAndUpdate(filter, update, {
      returnDocument: "after"
    });
    logger.info("The job with JobId {JobId} have been updated", jobId);
  } catch (error) {
    const currentTaskAtIndex: UploadAttachmentTask | undefined = jobTasks[currentTaskIndex];
    if (currentTaskAtIndex) {
      currentTaskAtIndex.status = "failed";
      if (currentTaskAtIndex.retry) {
        currentTaskAtIndex.retry += 1;
      } else {
        currentTaskAtIndex.retry = 1;
      }
      currentTaskAtIndex.error = { ...(error as object) };

      if (currentTaskAtIndex.retry === 7) {
        const filter = { _id: jobId };
        const update = {
          "status.uploadAttachments": "failed"
        };
        await Jobs.findOneAndUpdate(filter, update, {
          returnDocument: "after"
        });
      }

      if (currentTaskAtIndex.status === "failed") {
        const filter = { _id: jobId };
        const update = {
          "tasks.uploadAttachments": jobTasks
        };
        await Jobs.findOneAndUpdate(filter, update, {
          returnDocument: "after"
        });
      }
    }

    logger.errorException(error, "Failed pushing the job: {Job} with mongoDB id: {JobId} to mongoDB!", jobName, jobId);
    await alertTeams(JSON.stringify(error), "error", "uploadAttachments", null, jobId, functionName);
  }
};

const handleIssueDispatch = async (jobId: string, jobName: string, jobTasks: IssueDispatchTask[], functionName: string): Promise<void> => {
  try {
    const jobDocument: JobDocument | null = await Jobs.findOne({ _id: jobId });
    if (!jobDocument) {
      logger.error("Current Job: {JobName}, no job document found.", jobName);
      // noinspection ExceptionCaughtLocallyJS - Intentional
      throw new Error(`Document not found for Job ${jobName}`);
    }

    const issueDispatchCopy: IssueDispatchTask[] = jobDocument.tasks.issueDispatch;

    const documentsArray: string[] = [];

    for (const issueDispatchTask of jobTasks) {
      logger.info("Document(s) to issue: {DataMapping}", issueDispatchTask.dataMapping);
      documentsArray.push(issueDispatchTask.dataMapping);
    }

    logger.info("Dispatching documents: {@DocumentsArray}", documentsArray);
    const dispatchDocument = (await dispatchDocuments(documentsArray, "archive")) as { Successful?: boolean };
    if (dispatchDocument.Successful) {
      logger.info("Dispatch successful for documents: {@DocumentsArray}", documentsArray);
      const firstDispatch: IssueDispatchTask | undefined = issueDispatchCopy[0];
      if (firstDispatch) {
        firstDispatch.status = "completed";
        firstDispatch.response = dispatchDocument;
      }

      try {
        const filter = { _id: jobId };
        const update = {
          "status.issueDispatch": "completed",
          "tasks.issueDispatch": issueDispatchCopy
        };
        logger.info("Updating the job with JobId: {JobId}", jobId);
        await Jobs.findOneAndUpdate(filter, update, {
          returnDocument: "after"
        });
        logger.info("Job with JobId {JobId} updated", jobId);
      } catch (error) {
        logger.errorException(error, "Failed pushing the job: {Job} with mongoDB id: {JobId} to mongoDB!", jobName, jobId);
        await alertTeams(JSON.stringify(error), "error", "issueDispatch", null, jobId, functionName);
      }

      return;
    }

    const firstDispatch: IssueDispatchTask | undefined = issueDispatchCopy[0];
    if (firstDispatch) {
      if (!firstDispatch.retry) {
        firstDispatch.retry = 0;
      }

      logger.error("Dispatch failed for documents: {@DocumentsArray}", documentsArray);
      firstDispatch.status = "failed";
      (firstDispatch.retry as number) += 1;
      firstDispatch.response = dispatchDocument;
    }

    try {
      const filter = { _id: jobId };
      const retryCount: number = firstDispatch?.retry ?? 0;
      const update = {
        "status.issueDispatch": retryCount >= 7 ? "failed" : "waiting",
        "tasks.issueDispatch": issueDispatchCopy
      };
      logger.info("Updating the job with JobId: {JobId}", jobId);
      await Jobs.findOneAndUpdate(filter, update, {
        returnDocument: "after"
      });
      logger.info("Job with JobId {JobId} updated", jobId);
    } catch (error) {
      logger.errorException(error, "Failed pushing the job: {Job} with mongoDB id: {JobId} to mongoDB!", jobName, jobId);
      await alertTeams(JSON.stringify(error), "error", "issueDispatch", null, jobId, functionName);
    }
  } catch (error) {
    logger.errorException(error, "Failed pushing the job: {Job} with mongoDB id: {JobId} to mongoDB!", jobName, jobId);
    await alertTeams(JSON.stringify(error), "error", "issueDispatch", null, jobId, functionName);
  }
};

const handleCreateStatistics = async (jobId: string, jobName: string, functionName: string): Promise<void> => {
  try {
    const dispatchDocument: DispatchDocument | null = await Dispatches.findOne({ _id: jobId });
    const jobDocument: JobDocument | null = await Jobs.findOne({ _id: jobId });
    if (!dispatchDocument || !jobDocument) {
      // noinspection ExceptionCaughtLocallyJS - Intentional
      throw new Error(`Dispatch or job document not found for job ${jobName}`);
    }

    logger.info("Creating statistics for job with JobId: {JobId}", jobId);
    const syncRecipients: SyncRecipientTask[] = jobDocument.tasks.syncRecipients;
    const privatePersons: number = syncRecipients.filter((t: SyncRecipientTask) => t.method === "SyncPrivatePerson").length;
    const enterprises: number = syncRecipients.filter((t: SyncRecipientTask) => t.method === "SyncEnterprise").length;

    logger.info("Pushing statistics to the DB");
    const statRes: StatisticsResult | undefined = await createStatistics(dispatchDocument.createdByDepartment, jobId, privatePersons, enterprises);
    if (statRes?.acknowledged) {
      logger.info("Statistics successfully pushed to the DB");
      const jobFilter = { _id: jobId };
      const jobUpdate = {
        "status.createStatistics": "completed",
        "tasks.createStatistics": [
          {
            status: "completed",
            privatepersons: privatePersons,
            enterprises,
            response: statRes
          }
        ]
      };
      logger.info("Updating the job with JobId: {JobId} as completed", jobId);
      await Jobs.findOneAndUpdate(jobFilter, jobUpdate, {
        returnDocument: "after"
      });
      logger.info("The job with JobId {JobId} is updated and all tasks is completed! Removing the job from the jobs collection", jobId);

      await Jobs.findOneAndDelete({ _id: jobId });
      logger.info("The job with JobId {JobId} has successfully been deleted", jobId);

      const dispatchFilter = { _id: jobId };
      const dispatchUpdate = {
        status: "completed",
        owners: [],
        excludedOwners: [],
        matrikkelUnitsWithoutOwners: [],
        completedTimestamp: new Date()
      };
      logger.info("Updating the dispatch as completed and wiping the dispatch for personal information with JobId: {JobId}", jobId);
      await Dispatches.findOneAndUpdate(dispatchFilter, dispatchUpdate, {
        returnDocument: "after"
      });
      logger.info("Successfully updated the dispatch as completed with JobId: {JobId}", jobId);
      await alertTeams([], "completed", [], "Job has been completed and removed from the jobs collection", jobId, functionName);

      return;
    }

    logger.error("Failed pushing statistics to the DB");
    const filter = { _id: jobId };
    const update = {
      "status.createStatistics": "failed",
      "tasks.createStatistics": [
        {
          status: "failed",
          privatepersons: privatePersons,
          enterprises,
          response: statRes
        }
      ]
    };
    logger.info("Updating the job with JobId: {JobId} as failed", jobId);
    await Jobs.findOneAndUpdate(filter, update, {
      returnDocument: "after"
    });
    logger.info("Job with JobId {JobId} updated", jobId);
  } catch (error) {
    logger.errorException(error, "Failed pushing the job: {Job} with mongoDB id: {JobId} to mongoDB!", jobName, jobId);
    await alertTeams(JSON.stringify(error), "error", "createStatistics", null, jobId, functionName);
  }
};

export const handleJobs = async (context: InvocationContext, runStatus: string): Promise<FunctionResponse | HTTPErrorResponse> => {
  let jobId: string | undefined;

  try {
    logger.info("Connecting to DB");
    await getDb();

    logger.info("Looking for jobs to handle");
    const jobs: JobDocument | null = await Jobs.findOne({
      $or: [
        { "status.syncRecipients": "waiting" },
        { "status.createCaseDocument": "waiting" },
        { "status.uploadAttachments": "waiting" },
        { "status.issueDispatch": "waiting" },
        { "status.createStatistics": "waiting" },
        { "status.syncRecipients": "inprogress" },
        { "status.createCaseDocument": "inprogress" },
        { "status.uploadAttachments": "inprogress" },
        { "status.issueDispatch": "inprogress" },
        { "status.createStatistics": "inprogress" }
      ]
    });

    if (!jobs) {
      logger.info("No jobs found to handle, exit");
      return response("No jobs found");
    }

    const taskArr: Array<Record<string, JobTask>> = [];
    const failedJobs: Array<Record<string, SyncRecipientTask | CreateCaseDocumentTask | UploadAttachmentTask | IssueDispatchTask | CreateStatisticsTask>> = [];
    let stopHandling: boolean = false;

    jobId = String(jobs._id);
    logger.info("Found a job with JobId: {JobId}", jobId);
    logger.info("Checking the job status");

    for (const [jobName, jobStatus] of Object.entries(jobs.status)) {
      const jobTask: JobTask = (jobs.tasks as Record<string, JobTask>)[jobName] as JobTask;

      if (jobStatus === "failed") {
        if (jobName === "syncRecipients" || jobName === "createCaseDocument" || jobName === "uploadAttachments" || jobName === "issueDispatch") {
          logger.warn("The job: {Job} have status failed. Stopping further handling for this job", jobName);
          stopHandling = true;
        }

        for (const task of jobTask) {
          if (task.status === "failed") {
            failedJobs.push({ [jobName]: task });
          }
        }

        logger.info("Updating the failedJobs array for JobId {JobId}", jobId);
        try {
          const filter = { _id: jobId };
          const update = {
            $push: {
              failedTasks: failedJobs
            }
          };
          await Jobs.findOneAndUpdate(filter, update, {
            returnDocument: "after",
            upsert: true
          });
          logger.info("The failedJobs array for JobId {JobId} have been updated", jobId);
          logger.error("The job: {Job} with mongoDB id: {JobId} have failed 7 times and the whole job is stopped!", jobName, jobId);
          await alertTeams("Job failed 7 times, please look at it!", "error", failedJobs, null, jobId, context.functionName);
        } catch (error) {
          await alertTeams(JSON.stringify(error), "error", "pushing failed job to mongodb", null, jobId, context.functionName);
          logger.errorException(error, "Failed pushing the job: {Job} with mongoDB id: {JobId} to mongoDB!", jobName, jobId);
          return errorResponse(error, "Failed pushing the failed job to mongodb", 400);
        }
      }

      if (jobStatus === "waiting" || jobStatus === "inprogress") {
        if (!((jobName === "createCaseDocument" || jobName === "issueDispatch" || jobName === "uploadAttachments") && stopHandling)) {
          logger.info("Pushing task to the task array for Job: {Job}", jobName);
          taskArr.push({ [jobName]: jobTask });

          continue;
        }

        logger.error("The job: {Job} with mongoDB id: {JobId} cannot be handled because StopHandling is true ({StopHandling})", jobName, jobId, stopHandling);
        await alertTeams(
          `Current job: ${jobName} and stopHandling is: ${stopHandling}. DispatchID: ${jobId}. You need to look into it!`,
          "error",
          `${jobName} cannot be handled because StopHandling is true`,
          null,
          jobId,
          context.functionName
        );
      }
    }

    const firstTaskEntry: Record<string, JobTask> | undefined = taskArr[0];
    if (!firstTaskEntry) {
      logger.error("First task entry not found of a total of {TaskCount} tasks. Aborting handling", taskArr.length);
      return response(taskArr, 404);
    }

    for (const [currentJobName, currentJobTasks] of Object.entries(firstTaskEntry)) {
      logger.info("Current Job: {JobName}", currentJobName);
      if (currentJobName === "syncRecipients") {
        await handleSyncRecipients(jobId, currentJobName, currentJobTasks as SyncRecipientTask[], context.functionName);
      } else if (currentJobName === "createCaseDocument") {
        await handleCreateCaseDocument(jobId, currentJobName, currentJobTasks as CreateCaseDocumentTask[], context.functionName);
      } else if (currentJobName === "uploadAttachments") {
        await handleUploadAttachments(jobId, currentJobName, currentJobTasks as UploadAttachmentTask[], context.functionName);
      } else if (currentJobName === "issueDispatch") {
        await handleIssueDispatch(jobId, currentJobName, currentJobTasks as IssueDispatchTask[], context.functionName);
      } else if (currentJobName === "createStatistics") {
        await handleCreateStatistics(jobId, currentJobName, context.functionName);
      } else {
        logger.error("Did not find any tasks to handle, but for some reason we ended up here? JobID: {JobId}, Endpoint: {FunctionName}", jobId, context.functionName);
        await alertTeams("Did not find any tasks to handle, but for some reason we ended up here?", "error", "Unknown", null, jobId, context.functionName);
      }
    }

    return response(taskArr);
  } catch (error) {
    logger.errorException(error, "{RunStatus}: The job with the JobId: {JobId} failed", runStatus, jobId);
    return errorResponse(error, `${runStatus}: The job with the JobId: ${jobId} failed`, 400);
  }
};
