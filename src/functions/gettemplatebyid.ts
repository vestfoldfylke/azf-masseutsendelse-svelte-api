import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { auth } from "../sharedcode/auth/auth.js";
import getDb from "../sharedcode/connections/masseutsendelseDB.js";
import Templates from "../sharedcode/models/templates.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";
import type { TemplateDocument } from "../types/templates.js";

export const getTemplateById = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    await auth(req);

    const id: string | undefined = req.params.id;
    if (!id) {
      return new HTTPError(400, "No template id was provided").toHTTPResponse();
    }

    await getDb();

    const template: TemplateDocument | null = await Templates.findById(id);
    console.log("Template:", template);
    if (!template) {
      logger.error("Template with Id {Id} could not be found", id);
      return new HTTPError(400, `Template with id ${id} could not be found`).toHTTPResponse();
    }

    const templateById: TemplateDocument | null = await Templates.findById(id, {}, { returnDocument: "after" });
    console.log("TemplateById:", templateById);
    logger.info("Returning template with Id {Id}", id);

    return response(templateById);
  } catch (err) {
    logger.errorException(err, "Failed to get templates by id");
    return errorResponse(err, "Failed to get template by id", 400);
  }
};

app.http("getTemplateById", {
  authLevel: "anonymous",
  handler: getTemplateById,
  methods: ["GET"],
  route: "templates/{id}"
});
