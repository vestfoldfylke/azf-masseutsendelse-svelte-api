import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { auth } from "../sharedcode/auth/auth.js";
import getDb from "../sharedcode/connections/masseutsendelseDB.js";
import Templates from "../sharedcode/models/templates.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import type { Requestor } from "../types/auth.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";
import type { Template, TemplateDocument } from "../types/templates.js";

export const postTemplate = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    const requestor: Requestor = await auth(req);
    const requestBody = (await req.json()) as Partial<Template>;

    await getDb();

    requestBody.version = 1;
    requestBody.createdTimestamp = new Date();
    requestBody.createdBy = requestor.name;
    requestBody.createdById = requestor.id;
    requestBody.createdByDepartment = requestor.department;
    requestBody.modifiedTimestamp = new Date();
    requestBody.modifiedBy = requestor.name;
    requestBody.modifiedById = requestor.id;
    requestBody.modifiedByDepartment = requestor.department;

    const template = new Templates(requestBody);
    const result: TemplateDocument = await template.save();

    logger.info("Successfully created new Template '{TemplateName}' by {User}", template.name, requestor.email);
    return response(result);
  } catch (err) {
    logger.errorException(err, "Failed to post template");
    return errorResponse(err, "Failed to post template", 400);
  }
};

app.http("postTemplate", {
  authLevel: "anonymous",
  handler: postTemplate,
  methods: ["POST"],
  route: "templates"
});
