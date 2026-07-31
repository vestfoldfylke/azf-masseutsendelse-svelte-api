import type { HttpRequest, InvocationContext } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import dayjs, { type Dayjs } from "dayjs";
import { MISC, PDF_GENERATOR } from "../../config.js";
import type { Dispatch, DispatchAttachment, DispatchDocument, DispatchOwner } from "../../types/dispatches.js";
import type { CaseDocumentAttachment, Job, JobDocument } from "../../types/jobs.js";
import type { FunctionResponse } from "../../types/response.js";
import getDb from "../connections/masseutsendelseDB.js";
import { alertTeams } from "../helpers/alertTeams.js";
import Dispatches from "../models/dispatches.js";
import Jobs from "../models/jobs.js";
import { response } from "../response/response-handler.js";
import HTTPError from "../vtfk-errors/httperror.js";

type DispatchPerson = {
  ssn: string;
};

type DispatchBusiness = {
  orgnr: string;
};

type FileMetadata = {
  title: string;
  format: string;
};

type PreparedDispatchFile = {
  title: string;
  format: string;
  versionFormat?: string;
  base64?: string;
  blobPath?: string;
};

const extractFileMetadata = (filename: string | undefined): FileMetadata => {
  if (!filename || typeof filename !== "string") {
    throw new HTTPError(400, "Attachment filename is missing or invalid");
  }

  const dotIndex: number = filename.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === filename.length - 1) {
    throw new HTTPError(400, `Attachment ${filename} is missing a valid file extension`);
  }

  return {
    title: filename.substring(0, dotIndex),
    format: filename.substring(dotIndex + 1)
  };
};

const generatePdfFromTemplate = async (dispatch: Dispatch): Promise<PreparedDispatchFile> => {
  if (!dispatch.template) {
    throw new HTTPError(400, "Dispatch has no template");
  }

  const data: Record<string, unknown> = { ...(dispatch.template.data ?? {}) };

  if (Array.isArray(dispatch.attachments) && dispatch.attachments.length > 0) {
    data.attachments = dispatch.attachments;
  }

  data.info = {
    sector: dispatch.createdByDepartment,
    "our-reference": dispatch.archivenumber,
    "our-caseworker": dispatch.createdBy
  };

  logger.info("Creating the pdf request");
  const pdfRequestBody = {
    template: dispatch.template.template,
    documentDefinitionId: dispatch.template.documentDefinitionId ?? "brevmal",
    data
  };

  const legalFilename: string = dispatch.title.replace(/[/\\?%*:|"<>;¤]/g, "");
  logger.info("Making the request to the PDF api");

  if (!PDF_GENERATOR.PDF_GENERATOR_ENDPOINT) {
    throw new HTTPError(500, "PDF_GENERATOR_ENDPOINT is not configured");
  }

  const pdfResponse: Response = await fetch(PDF_GENERATOR.PDF_GENERATOR_ENDPOINT, {
    method: "POST",
    headers: PDF_GENERATOR.PDF_GENERATOR_X_FUNCTIONS_KEY ? { "x-functions-key": PDF_GENERATOR.PDF_GENERATOR_X_FUNCTIONS_KEY } : {},
    body: JSON.stringify(pdfRequestBody)
  });

  if (!pdfResponse.ok) {
    const errorData: string = await pdfResponse.text();
    logger.error("Failed to create a PDF from the template: {Filename}, Status: {Status}: {StatusText}: {@ErrorData}", legalFilename, pdfResponse.status, pdfResponse.statusText, errorData);
    throw new HTTPError(pdfResponse.status, `Could not generate PDF for dispatch ${dispatch.title}`);
  }

  const responseData = (await pdfResponse.json()) as { base64: string };
  logger.info("Successfully created a PDF from the template: {Filename}", legalFilename);

  return {
    title: legalFilename,
    format: "pdf",
    versionFormat: "A",
    base64: responseData.base64
  };
};

const retrieveAttachments = async (dispatch: Dispatch): Promise<PreparedDispatchFile[]> => {
  if (process.env.NODE_ENV === "test") {
    logger.info("Currently in test, will not look for attachments");
    return [
      {
        title: "test",
        format: ".txt",
        base64: "base64"
      }
    ];
  }

  logger.info("Retrieving the attachments if any attachments was added");
  if (!Array.isArray(dispatch.attachments) || dispatch.attachments.length === 0) {
    logger.info("No attachments found");
    return [];
  }

  logger.info("{DispatchAttachmentCount} attachment(s) found", dispatch.attachments.length);
  const attachments: PreparedDispatchFile[] = [];
  for (const attachment of dispatch.attachments as DispatchAttachment[]) {
    logger.info("Preparing attachment reference: {AttachmentName}", attachment.name);
    const fileMetadata: FileMetadata = extractFileMetadata(attachment.name);

    attachments.push({
      title: fileMetadata.title,
      format: fileMetadata.format,
      blobPath: `${String(dispatch._id)}/${attachment.name}`
    });
  }

  return attachments;
};

export const getReadyDispatchesV2 = async (_req: HttpRequest, context: InvocationContext): Promise<FunctionResponse> => {
  const dispatchJobs: Job[] = [];

  logger.info("Connecting to DB");
  await getDb();

  logger.info("Looking for approved dispatches to handle");
  const d: DispatchDocument | null = await Dispatches.findOne<DispatchDocument>({ status: "approved" });
  if (d === null) {
    logger.info("No approved dispatches found");
    return response("No approved dispatches found");
  }

  const dispatches: Dispatch[] = [d.toObject() as Dispatch];
  if (dispatches.length === 0) {
    logger.info("No approved dispatches found");
    return response("No approved dispatches found");
  }

  for (const dispatch of dispatches) {
    if (!dispatch.approvedTimestamp) {
      continue;
    }

    const dispatchId: string = String(dispatch._id);

    logger.info("Found an approved dispatch to handle with DispatchId: {DispatchId}, checking if it has passed the registration threshold", dispatchId);

    if (!MISC.BYPASS_REGISTRATION_THRESHOLD) {
      const registrationThreshold: Dayjs = dayjs(dispatch.approvedTimestamp).set("hour", 23).set("minute", 59).set("second", 59).set("millisecond", 0);
      logger.info("Checking registration threshold, will create job if it is passed.");
      if (dayjs(new Date()).isBefore(registrationThreshold)) {
        logger.info("Registration threshold not passed. Job will not be created at this time");
        continue;
      }
    } else {
      logger.warn("Bypass registration threshold is enabled, jobs will be created for all approved dispatches regardless of the registration threshold");
    }

    const delaySendUntil: Dayjs = dayjs().set("hour", 11).set("minute", 0).set("second", 0).set("millisecond", 0);

    const dispatchFiles: PreparedDispatchFile[] = [];
    const dispatchJob: Job = {
      _id: dispatch._id,
      title: dispatch.title,
      approvedTimeStamp: dispatch.approvedTimestamp,
      jobCreatedTimeStamp: new Date(),
      delayUntil: delaySendUntil.toISOString(),
      status: {
        syncRecipients: "waiting",
        uploadAttachments: "waiting",
        createCaseDocument: "waiting",
        issueDispatch: "waiting",
        createStatistics: "waiting"
      },
      tasks: {
        syncRecipients: [],
        uploadAttachments: [],
        createCaseDocument: [],
        issueDispatch: [],
        createStatistics: ""
      }
    };

    logger.info("Generating PDF from template if a template was used in the dispatch (brevmal)");
    if (dispatch.template?.template) {
      const generatedPdf: PreparedDispatchFile = await generatePdfFromTemplate(dispatch);
      dispatchFiles.push(generatedPdf);
    }

    const attachments: PreparedDispatchFile[] = await retrieveAttachments(dispatch);
    if (attachments.length > 0) {
      dispatchFiles.push(...attachments);
    }

    const personArray: DispatchPerson[] = [];
    const businessArray: DispatchBusiness[] = [];

    logger.info("Creating the archive task, for DispatchId: {DispatchId}", dispatchId);
    for (const owner of dispatch.owners) {
      if (owner._type.toLowerCase().includes("juridisk")) {
        businessArray.push({
          orgnr: owner.nummer
        });

        continue;
      }

      personArray.push({
        ssn: owner.nummer
      });
    }

    logger.info("Creating the archive syncRecipients task, for DispatchId: {DispatchId}", dispatchId);
    personArray.forEach((person: DispatchPerson) => {
      dispatchJob.tasks.syncRecipients.push({
        method: "SyncPrivatePerson",
        retry: 0,
        status: "waiting",
        ssn: person.ssn
      });
    });

    businessArray.forEach((business: DispatchBusiness) => {
      dispatchJob.tasks.syncRecipients.push({
        method: "SyncEnterprise",
        retry: 0,
        status: "waiting",
        ssn: business.orgnr
      });
    });

    logger.info("Creating the archive caseDocument task, for DispatchId: {DispatchId}", dispatchId);
    dispatchJob.tasks.createCaseDocument.push({
      method: "archive",
      data: {
        system: "masseutsendelse",
        template: "utsendelsesdokument",
        parameter: {
          title: dispatch.title,
          caseNumber: dispatch.archivenumber,
          date: new Date().toISOString(),
          contacts: dispatch.owners.map((o: DispatchOwner) => ({ ssn: o.nummer, role: "Mottaker" })),
          attachments: dispatchFiles.length > 0 ? [dispatchFiles[0] as CaseDocumentAttachment] : [],
          accessCode: "U", // U = Alle
          accessGroup: "Alle", // No access restriction
          paragraph: "", // No paragraph
          responsiblePersonEmail: dispatch.createdByEmail
        }
      }
    });

    if (dispatchFiles.length > 1) {
      for (const file of dispatchFiles) {
        logger.info("Creating the archive uploadDocuments task, for attachment: {FileTitle} ({FileFormat}), with DispatchId: {DispatchId}", file.title, file.format, dispatchId);
        dispatchJob.tasks.uploadAttachments.push({
          dataMapping: "parameter.documentNumber=DocumentNumber",
          data: {
            system: "archive",
            template: "add-attachment",
            parameter: {
              secure: false,
              title: file.title,
              format: file.format,
              blobPath: file.blobPath,
              versionFormat: "P"
            }
          }
        });
      }
    }

    logger.info("Creating the archive issueDispatch task, for DispatchId: {DispatchId}", dispatchId);
    dispatchJob.tasks.issueDispatch.push({
      dataMapping: '{"parameter": { "Documents": [ { "DocumentNumber": "{{DocumentNumber}}" }]}}',
      data: {
        method: "DispatchDocuments",
        service: "DocumentService"
      }
    });

    dispatchJobs.push(dispatchJob);
  }

  if (dispatchJobs.length === 0) {
    logger.warn("No jobs to save for the ready dispatch handled 🤔");
    return response({});
  }

  logger.info("Creating a new job and saving it to the Jobs collection");
  const firstJob: Job | undefined = dispatchJobs[0];
  if (!firstJob) {
    logger.error("First job doesn't exist 🤔 even though dispatchJobs has {DispatchJobsCount} elements", dispatchJobs.length);
    return response({});
  }

  const job: JobDocument = new Jobs(firstJob);
  const jobId: string = String(job._id);

  await job.save();
  logger.info("Successfully saved the job to the Jobs collection with the JobId: {JobId}", jobId);

  const dispatchFilter = { _id: job._id };
  const dispatchUpdate = {
    status: "inprogress",
    inProgressTimestamp: Date.now()
  };

  logger.info("Updating the dispatch with DispatchId: {DispatchId} as InProgress", jobId);
  const updatedDispatch: DispatchDocument | null = await Dispatches.findOneAndUpdate(dispatchFilter, dispatchUpdate, {
    returnDocument: "after"
  });

  logger.info("Successfully updated the dispatch with DispatchId: {DispatchId}", jobId);
  await alertTeams([], "completed", [], "Jobs have now been created for the dispatch, everything went well", jobId, context.functionName, "InProgress");

  return response(updatedDispatch);
};
