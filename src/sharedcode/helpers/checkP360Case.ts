import { logger } from "@vestfoldfylke/loglady";
import { ARCHIVE } from "../../config.js";
import type { P360Case } from "../../types/archive.js";
import { callArchive } from "./call-archive.js";

export const getCase = async (caseNumber: string): Promise<P360Case | undefined> => {
  logger.info("Validating input");
  if (!caseNumber) {
    throw new Error("Archive case number cannot be empty");
  }
  if (!ARCHIVE.ARCHIVE_ENDPOINT) {
    throw new Error("Endpoint environment variable cannot be empty, check case");
  }
  if (!ARCHIVE.ARCHIVE_SCOPE) {
    throw new Error("Scope environment variable cannot be empty");
  }

  const payload = {
    service: "CaseService",
    method: "GetCases",
    parameter: {
      CaseNumber: caseNumber
    },
    options: {
      onlyOpenCases: true
    }
  };

  logger.info("Checking if the case number exist and is open");
  let data: P360Case | P360Case[] = await callArchive<P360Case | P360Case[]>("archive", payload);

  logger.info("Handle and return the response");
  if (!data) {
    return undefined;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return undefined;
    }

    if (data.length > 1) {
      throw new Error(`The case number ${caseNumber} matched ${data.length} it must only match one`);
    }

    data = data[0] as P360Case;
  }

  return data;
};
