import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { ARCHIVE } from "../config.js";
import { auth } from "../sharedcode/auth/auth.js";
import getDb from "../sharedcode/connections/masseutsendelseDB.js";
import Dispatches from "../sharedcode/models/dispatches.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { DispatchDocument } from "../types/dispatches.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

export const getDispatchById = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    await auth(req);

    const id: string | undefined = req.params.id;
    if (!id) {
      return new HTTPError(400, "No dispatch id was provided").toHTTPResponse();
    }

    await getDb();

    const dispatch: DispatchDocument | null = await Dispatches.findById(id);
    if (!dispatch) {
      logger.error("Dispatch with Id {Id} could not be found", id);
      return new HTTPError(404, `Dispatch with id ${id} could not be found`).toHTTPResponse();
    }

    if (!dispatch.archiveUrl?.includes("https://") && ARCHIVE.ARCHIVE_SHOW_DISPATCH_URL) {
      const showUrl: string = ARCHIVE.ARCHIVE_SHOW_DISPATCH_URL;
      const archiveShowDispatchUrl: string = showUrl.endsWith("/") ? showUrl.slice(0, -1) : showUrl;
      const currentArchiveUrl: string = dispatch.archiveUrl ?? "";
      const archiveUrl: string = currentArchiveUrl.startsWith("/") ? currentArchiveUrl.slice(1) : currentArchiveUrl;
      dispatch.archiveUrl = `${archiveShowDispatchUrl}/${archiveUrl}`;
    }

    logger.info("Found dispatch with Id {Id}", id);
    return response(dispatch);
  } catch (err) {
    logger.errorException(err, "Failed to get dispatches by id");
    return errorResponse(err, "Failed to get dispatches by id", 400);
  }
};

app.http("getDispatchById", {
  authLevel: "anonymous",
  handler: getDispatchById,
  methods: ["GET"],
  route: "dispatches/{id}"
});
