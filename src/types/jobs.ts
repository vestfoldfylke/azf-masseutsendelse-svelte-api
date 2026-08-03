import type { Document, Types } from "mongoose";
import type { ArchiveContact } from "./archive.js";

export type JobTaskStatus = "waiting" | "inprogress" | "completed" | "failed";

export type JobStatuses = {
  syncRecipients: JobTaskStatus;
  createCaseDocument: JobTaskStatus;
  uploadAttachments: JobTaskStatus;
  issueDispatch: JobTaskStatus;
  createStatistics: JobTaskStatus;
};

export type SyncRecipientMethod = "SyncPrivatePerson" | "SyncEnterprise";

export type SyncRecipientTask = {
  method: SyncRecipientMethod;
  retry: number;
  status: JobTaskStatus;
  ssn: string;
  response?: unknown;
  msg?: unknown;
};

export type CaseDocumentAttachment = {
  title: string;
  format: string;
  base64?: string;
  blobPath?: string | undefined;
  versionFormat?: string;
  secure?: boolean;
};

export type CaseDocumentParameter = {
  title: string;
  caseNumber: string;
  date: string;
  contacts: ArchiveContact[];
  attachments: CaseDocumentAttachment[];
  accessCode: string;
  accessGroup: string;
  paragraph: string;
  responsiblePersonEmail: string;
};

export type CreateCaseDocumentTask = {
  method: "archive";
  retry?: number;
  status?: JobTaskStatus;
  response?: unknown;
  data: {
    system: string;
    template: string;
    parameter: CaseDocumentParameter;
  };
};

export type UploadAttachmentTask = {
  dataMapping: string;
  retry?: number;
  status?: JobTaskStatus;
  response?: unknown;
  error?: unknown;
  data: {
    system: string;
    template: string;
    parameter: CaseDocumentAttachment;
  };
};

export type IssueDispatchTask = {
  dataMapping: string;
  retry?: number;
  status?: JobTaskStatus;
  response?: unknown;
  data: {
    method: string;
    service: string;
  };
};

export type CreateStatisticsTask = {
  status: JobTaskStatus;
  privatepersons: number;
  enterprises: number;
  response?: unknown;
};

export type JobTask = SyncRecipientTask[] | CreateCaseDocumentTask[] | UploadAttachmentTask[] | IssueDispatchTask[] | CreateStatisticsTask[];

export type JobTasks = {
  syncRecipients: SyncRecipientTask[];
  createCaseDocument: CreateCaseDocumentTask[];
  uploadAttachments: UploadAttachmentTask[];
  issueDispatch: IssueDispatchTask[];
  createStatistics: CreateStatisticsTask[] | string;
};

export type Job = {
  _id: Types.ObjectId;
  title: string;
  approvedTimeStamp: Date;
  jobCreatedTimeStamp: Date;
  delayUntil?: string;
  status: JobStatuses;
  tasks: JobTasks;
  failedTasks?: unknown[];
};

export type JobDocument = Job & Document;
