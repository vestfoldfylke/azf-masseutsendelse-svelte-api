import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { auth } from "../sharedcode/auth/auth.js";
import getDb from "../sharedcode/connections/masseutsendelseDB.js";
import Templates from "../sharedcode/models/templates.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { Requestor } from "../types/auth.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";
import type { Template, TemplateDocument } from "../types/templates.js";

export const putTemplates = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    const requestor: Requestor = await auth(req);
    const requestBody = (await req.json()) as Partial<Template>;

    requestBody.modifiedBy = requestor.name;
    requestBody.modifiedById = requestor.id;
    requestBody.modifiedTimestamp = new Date();
    requestBody.modifiedByDepartment = requestor.department;

    const id: string | undefined = req.params.id;
    if (!id) {
      return new HTTPError(400, "No template id was provided").toHTTPResponse();
    }

    await getDb();

    const existingTemplate: TemplateDocument | null = await Templates.findById(id).lean();
    if (!existingTemplate) {
      logger.error("Template with Id {Id} could not be found", id);
      return new HTTPError(400, `Template with id ${id} could not be found`).toHTTPResponse();
    }

    requestBody.version = existingTemplate.version + 1;

    const updatedTemplate: TemplateDocument | null = await Templates.findByIdAndUpdate(id, requestBody, { returnDocument: "after" });

    logger.info("Returning updated template with Id {Id}", id);
    return response(updatedTemplate);
  } catch (err) {
    logger.errorException(err, "Failed to put templates");
    return errorResponse(err, "Failed to put templates", 400);
  }
};

app.http("putTemplates", {
  authLevel: "anonymous",
  handler: putTemplates,
  methods: ["PUT"],
  route: "templates/{id}"
});
