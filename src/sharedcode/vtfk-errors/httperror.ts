import { STATUS_CODES } from "node:http";
import type { HTTPErrorResponse } from "../../types/response.js";

const toName = (code: number): string => {
  const suffix: "Error" | "" = ((code / 100) | 0) === 4 || ((code / 100) | 0) === 5 ? "Error" : "";
  const statusName: string = (STATUS_CODES[code] ?? "Unknown").replace(/error$/i, "").replace(/ /g, "");
  return `${statusName}${suffix}`;
};

export class HTTPError extends Error {
  statusCode: number;
  statusName: string;
  title: string | undefined;
  errors: string[] | undefined;
  documentation: unknown;

  constructor(statusCode = 400, message?: string, title?: string, errors: string[] = [], documentation?: unknown) {
    super(message ?? STATUS_CODES[statusCode] ?? "");

    Error.captureStackTrace(this, this.constructor);

    if (title) {
      this.title = title;
    }

    this.statusCode = statusCode;
    this.statusName = toName(statusCode);

    if (errors && Array.isArray(errors) && errors.length > 0) {
      this.errors = errors;
    }

    if (documentation) {
      this.documentation = documentation;
    }
  }

  toHTTPResponse(): HTTPErrorResponse {
    return {
      status: this.statusCode,
      headers: {
        "Content-Type": "application/json"
      },
      jsonBody: {
        error: {
          statusCode: this.statusCode,
          statusName: this.statusName,
          message: this.message,
          title: this.title,
          errors: this.errors ?? null
        },
        documentation: this.documentation ?? {}
      }
    };
  }
}

export default HTTPError;
