import { extname } from "node:path";
import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { ObjectId } from "mongodb";
import allowedExtensions from "../sharedcode/allowedExtensions.json" with { type: "json" };
import { auth } from "../sharedcode/auth/auth.js";
import getDb from "../sharedcode/connections/masseutsendelseDB.js";
import { saveBlob, UNALLOWED_PATH_CHARACTERS } from "../sharedcode/helpers/blob.js";
import Dispatches from "../sharedcode/models/dispatches.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import { validate } from "../sharedcode/validators/dispatches.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { Requestor } from "../types/auth.js";
import type { Dispatch, DispatchDocument } from "../types/dispatches.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

export const postDispatches = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    const requestBody = (await req.json()) as Dispatch;

    const requestor: Requestor = await auth(req);

    requestBody._id = new ObjectId();
    requestBody.status = "notapproved";

    requestBody.createdTimestamp = new Date();
    requestBody.createdBy = requestor.name;
    requestBody.createdById = requestor.id;
    requestBody.createdByEmail = requestor.email;
    requestBody.createdByDepartment = requestor.department;
    requestBody.modifiedTimestamp = new Date();
    requestBody.modifiedById = requestor.id;
    requestBody.modifiedBy = requestor.name;
    requestBody.modifiedByEmail = requestor.email;
    requestBody.modifiedByDepartment = requestor.department;

    await validate(requestBody);
    requestBody.validatedArchivenumber = requestBody.archivenumber;

    await getDb();

    if (requestBody.attachments && Array.isArray(requestBody.attachments) && requestBody.attachments.length > 0) {
      for (const blob of requestBody.attachments) {
        for (const char of UNALLOWED_PATH_CHARACTERS) {
          if (blob.name.includes(char)) {
            return new HTTPError(400, `${blob.name} contains the illegal character ${char}`).toHTTPResponse();
          }
        }
      }
    }

    const dispatch = new Dispatches(requestBody);
    const results: DispatchDocument = await dispatch.save();

    if (Array.isArray(requestBody.attachments)) {
      for (const file of requestBody.attachments) {
        if (!file.name) {
          file.name = file._id ?? "";
        }

        const fileExtension: string = extname(file.name).slice(1);

        if (!fileExtension) {
          return new HTTPError(400, "All filenames must have an extension").toHTTPResponse();
        }

        if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
          return new HTTPError(400, `The file extension ${fileExtension} is not allowed`).toHTTPResponse();
        }

        if (file.name?.includes("/")) {
          return new HTTPError(400, 'Illegal character in filename, "/" is not allowed.').toHTTPResponse();
        }

        if (process.env.NODE_ENV !== "test" && file.data) {
          await saveBlob(`${String(requestBody._id)}/${file.name}`, file.data);
        }
      }
    }

    logger.info("Successfully created new dispatch by {User}", requestor.email);
    return response(results);
  } catch (err) {
    logger.errorException(err, "Failed to post dispatches");
    return errorResponse(err, "Failed to post dispatches", 400);
  }
};

app.http("postDispatches", {
  authLevel: "anonymous",
  handler: postDispatches,
  methods: ["POST"],
  route: "dispatches"
});
