import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { PDF_GENERATOR } from "../config.js";
import { response } from "../sharedcode/response/response-handler.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

type GeneratePDFBody = {
  preview?: unknown;
  template?: unknown;
  templateName?: string;
  documentDefinitionId?: unknown;
  data?: unknown;
};

export const generatePDF = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  const { preview, template, templateName, documentDefinitionId, data } = (await req.json()) as GeneratePDFBody;
  if (!preview) {
    return new HTTPError(400, "Preview must provided").toHTTPResponse();
  }
  if (!template) {
    return new HTTPError(400, "Template must be provided").toHTTPResponse();
  }
  if (!documentDefinitionId) {
    return new HTTPError(400, "DocumentDefinitionId must be provided").toHTTPResponse();
  }
  if (!data) {
    return new HTTPError(400, "Data must be provided").toHTTPResponse();
  }

  const requestData = {
    preview,
    template,
    documentDefinitionId,
    data
  };

  if (!PDF_GENERATOR.PDF_GENERATOR_ENDPOINT) {
    return new HTTPError(500, "PDF_GENERATOR_ENDPOINT is not configured").toHTTPResponse();
  }

  const headers: Record<string, string> = {};
  if (PDF_GENERATOR.PDF_GENERATOR_X_FUNCTIONS_KEY) {
    headers["x-functions-key"] = PDF_GENERATOR.PDF_GENERATOR_X_FUNCTIONS_KEY;
  }

  const responseRequest: Response = await fetch(PDF_GENERATOR.PDF_GENERATOR_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(requestData)
  });

  if (!responseRequest.ok) {
    const errorData: string = await responseRequest.text();
    logger.error("Failed to create a PDF using Template {TemplateName}. Status: {Status}: {StatusText}: {@ErrorData}", templateName, responseRequest.status, responseRequest.statusText, errorData);
    return new HTTPError(responseRequest.status, `Error from PDF Generator: ${responseRequest.statusText}`).toHTTPResponse();
  }

  const responseData: unknown = await responseRequest.json();
  logger.info("Generated a PDF from Template '{TemplateName}'", templateName);

  return response(responseData);
};

app.http("generatePDF", {
  authLevel: "anonymous",
  handler: generatePDF,
  methods: ["POST"],
  route: "generatePDF"
});
