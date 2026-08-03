import { app, type HttpRequest } from "@azure/functions";
import type { BlobStorageItem } from "@vestfoldfylke/azure-blob-client/dist/types/BlobStorageClient.type.js";
import { logger } from "@vestfoldfylke/loglady";
import { auth } from "../sharedcode/auth/auth.js";
import { getBlob as getStorgeBlob } from "../sharedcode/helpers/blob.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

export const getBlob = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    await auth(req);

    if (!req.params.id) {
      return new HTTPError(400, "dispatchId must be specified").toHTTPResponse();
    }
    if (!req.params.name) {
      return new HTTPError(400, "name must be specified").toHTTPResponse();
    }

    if (process.env.NODE_ENV !== "test") {
      const file: BlobStorageItem | undefined = await getStorgeBlob(`${req.params.id}/${req.params.name}`);
      if (!file?.data) {
        logger.error("No files found for DispatchId: {DispatchId} and Filename: {Filename}", req.params.id, req.params.name);
        return new HTTPError(404, "No files found, check if you passed the right filename and/or the right dispatchId").toHTTPResponse();
      }

      logger.info("Retrieved blob for DispatchId: {DispatchId} and Filename: {Filename}", req.params.id, req.params.name);
      return response(file);
    }

    if (!req.params.file) {
      return new HTTPError(400, "No Files found").toHTTPResponse();
    }

    return response(req.params.file);
  } catch (err) {
    logger.errorException(err, "Failed to get blob");
    return errorResponse(err, "Failed to get blob", 400);
  }
};

app.http("getBlob", {
  authLevel: "anonymous",
  handler: getBlob,
  methods: ["GET"],
  route: "blobs/{id}/{name}"
});
