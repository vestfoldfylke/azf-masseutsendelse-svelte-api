import { logger } from "@vestfoldfylke/loglady";
import { ARCHIVE } from "../../config.js";
import type { ArchiveAttachment, ArchiveContact } from "../../types/archive.js";
import { callArchive } from "./call-archive.js";

export const syncRecipient = async (number: string, method: string): Promise<unknown> => {
  logger.info("Validating input");
  if (!number) {
    throw new Error("SSN cannot be empty");
  }
  if (!method) {
    throw new Error("Method cannot be empty");
  }
  if (!ARCHIVE.ARCHIVE_ENDPOINT) {
    throw new Error("Endpoint environment variable cannot be empty, sync recipient");
  }
  if (!ARCHIVE.ARCHIVE_SCOPE) {
    throw new Error("Scope environment variable cannot be empty");
  }

  let data: unknown;
  if (method === "SyncPrivatePerson") {
    logger.info("Syncing private person");
    data = await callArchive(method, { ssn: number });
  } else {
    logger.info("Syncing enterprise person");
    data = await callArchive(method, { orgnr: number });
  }

  logger.info("Handle and return the response");
  if (data && typeof data === "object" && "status" in data && (data as { status: number }).status !== 200 && Array.isArray(data)) {
    return data[0];
  }

  if (!data) {
    return undefined;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return undefined;
    }

    if (data.length > 1) {
      return data[0];
    }

    return data[0];
  }

  return data;
};

export const addAttachment = async (method: string, documentNumber: string, base64: string, format: string, title: string): Promise<unknown> => {
  logger.info("Validating input");
  if (!title) {
    throw new Error("title cannot be empty");
  }
  if (!method) {
    throw new Error("Method cannot be empty");
  }
  if (!base64) {
    throw new Error("base64 cannot be empty");
  }
  if (!format) {
    throw new Error("format cannot be empty");
  }
  if (!documentNumber) {
    throw new Error("DocumentNumber cannot be empty");
  }
  if (!ARCHIVE.ARCHIVE_ENDPOINT) {
    throw new Error("Endpoint environment variable cannot be empty, add attachment");
  }
  if (!ARCHIVE.ARCHIVE_SCOPE) {
    throw new Error("Scope environment variable cannot be empty");
  }

  const payload = {
    system: "archive",
    template: "add-attachment",
    parameter: {
      documentNumber,
      base64,
      format,
      title,
      versionFormat: "P"
    }
  };

  logger.info("Adding attachment");
  let data: unknown = await callArchive(method, payload);

  logger.info("Handle and return the response");
  if (!data) {
    return undefined;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return undefined;
    }

    if (data.length > 1) {
      throw new Error(`Was not able to add attachment with the title ${title}`);
    }

    data = data[0];
  }

  return data;
};

export const createCaseDocument = async (
  method: string,
  title: string,
  caseNumber: string,
  date: string,
  contacts: ArchiveContact[],
  attachments: ArchiveAttachment[],
  paragraph: string,
  responsiblePersonEmail: string
): Promise<unknown> => {
  logger.info("Validating input");
  if (!method) {
    throw new Error("Method cannot be empty");
  }
  if (!title) {
    throw new Error("title cannot be empty");
  }
  if (!caseNumber) {
    throw new Error("caseNumber cannot be empty");
  }
  if (!date) {
    throw new Error("date cannot be empty");
  }
  if (!contacts) {
    throw new Error("contacts cannot be empty");
  }
  if (!responsiblePersonEmail) {
    throw new Error("responsiblePersonEmail cannot be empty");
  }
  if (!ARCHIVE.ARCHIVE_ENDPOINT) {
    throw new Error("Endpoint environment variable cannot be empty, create case doc");
  }
  if (!ARCHIVE.ARCHIVE_SCOPE) {
    throw new Error("Scope environment variable cannot be empty");
  }

  const payload = {
    system: "masseutsendelse",
    template: "utsendelsesdokument",
    parameter: {
      title,
      caseNumber,
      date,
      contacts,
      attachments,
      accessCode: "U",
      accessGroup: "Alle",
      paragraph,
      responsiblePersonEmail
    }
  };
  logger.info("Creating the case document");
  let data: unknown = await callArchive(method, payload);

  logger.info("Handle and return the response");
  if (!data) {
    return undefined;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return undefined;
    }

    if (data.length > 1) {
      throw new Error(`Was not able to create the case with the title: ${title}`);
    }

    data = data[0];
  }

  return data;
};

export const dispatchDocuments = async (documents: string[], method: string): Promise<unknown> => {
  logger.info("Validating input");
  if (!documents) {
    throw new Error("Documents cannot be empty");
  }
  if (documents.length < 0) {
    throw new Error("Documents array must contain minimum one document");
  }
  if (!ARCHIVE.ARCHIVE_ENDPOINT) {
    throw new Error("Endpoint environment variable cannot be empty, dispatch doc");
  }
  if (!ARCHIVE.ARCHIVE_SCOPE) {
    throw new Error("Scope environment variable cannot be empty");
  }

  const payload = {
    service: "DocumentService",
    method: "DispatchDocuments",
    parameter: {
      Documents: [
        {
          DocumentNumber: documents[0]
        }
      ]
    }
  };

  logger.info("Dispatching documents");
  let data: unknown = await callArchive(method, payload);
  logger.info("Handle and return the response");
  if (!data) {
    return undefined;
  }

  if (Array.isArray(data)) {
    if (data[0].Successful !== true) {
      throw new Error(`Was not able to dispatch the documents: ${documents.join(",")}`);
    }

    data = data[0];
  }

  return data;
};
