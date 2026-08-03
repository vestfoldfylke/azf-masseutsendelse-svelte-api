import { STATUS_CODES } from "node:http";
import type { FunctionResponse, HTTPErrorResponse, JsonResponse, TextResponse } from "../../types/response.js";
import HTTPError from "../vtfk-errors/httperror.js";

const httpStatusCodeToDescription = (statusCode: number): string => {
  const status: string | undefined = STATUS_CODES[statusCode];
  if (!status) {
    return "Unknown status code";
  }

  const suffix: "Error" | "" = ((statusCode / 100) | 0) === 4 || ((statusCode / 100) | 0) === 5 ? "Error" : "";
  const statusName: string = status.replace(/error$/i, "").replace(/ /g, "");
  return `${statusName}${suffix}`;
};

export const response = (data: unknown, statusCode = 200): FunctionResponse => {
  if (typeof data === "object" || Array.isArray(data)) {
    return {
      status: statusCode,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      jsonBody: data
    } as JsonResponse;
  }

  return {
    status: statusCode,
    headers: {
      "Content-Type": "plain/text; charset=utf-8"
    },
    body: typeof data === "string" ? data : String(data)
  } as TextResponse;
};

export const errorResponse = (error: Error | HTTPError | string | unknown, title = "", statusCode = 200): HTTPErrorResponse => {
  if (error instanceof HTTPError) {
    return error.toHTTPResponse();
  }

  if (error instanceof Error) {
    return new HTTPError(statusCode, error.message, title || error.name).toHTTPResponse();
  }

  const message: string = ["string", "number", "boolean"].includes(typeof error) ? String(error) : JSON.stringify(error);

  return {
    status: statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    jsonBody: {
      error: {
        statusCode,
        statusName: httpStatusCodeToDescription(statusCode),
        message,
        title: title || "Error",
        errors: null
      }
    }
  };
};
