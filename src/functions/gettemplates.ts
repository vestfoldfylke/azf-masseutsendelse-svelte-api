import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { auth } from "../sharedcode/auth/auth.js";
import getDb from "../sharedcode/connections/masseutsendelseDB.js";
import Templates from "../sharedcode/models/templates.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";
import type { TemplateDocument } from "../types/templates.js";

export const getTemplates = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    await auth(req);
    await getDb();

    const templates: TemplateDocument[] | null = await Templates.find({});
    if (!templates) {
      logger.error("No templates found in the database");
      return new HTTPError(404, "No templates found in the database").toHTTPResponse();
    }

    logger.info("Returning {TemplateCount} templates", templates.length);
    return response(templates);
  } catch (err) {
    logger.errorException(err, "Failed to get templates");
    return errorResponse(err, "Failed to get templates", 400);
  }
};

app.http("getTemplates", {
  authLevel: "anonymous",
  handler: getTemplates,
  methods: ["GET"],
  route: "templates"
});
