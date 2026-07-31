import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { ARCHIVE } from "../config.js";
import { auth } from "../sharedcode/auth/auth.js";
import getDb from "../sharedcode/connections/masseutsendelseDB.js";
import Dispatches from "../sharedcode/models/dispatches.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import type { DispatchDocument } from "../types/dispatches.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

export const getDispatches = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    await auth(req);
    await getDb();

    const fullQuery: string | null = req.query.get("full");

    const dispatches: DispatchDocument[] | null = ["true"].includes(fullQuery ?? "")
      ? await Dispatches.find({}).sort({ createdTimestamp: -1 })
      : await Dispatches.find({}).sort({ createdTimestamp: -1 }).select("-owners -excludedOwners -matrikkelUnitsWithoutOwners");

    if (!dispatches) {
      return response([]);
    }

    if (!ARCHIVE.ARCHIVE_SHOW_DISPATCH_URL) {
      logger.info("Returning {DispatchCount} dispatches", dispatches.length);
      return response(dispatches);
    }

    const showUrl: string = ARCHIVE.ARCHIVE_SHOW_DISPATCH_URL;
    const dispatchesWithArchiveUrl: DispatchDocument[] = dispatches.map((dispatch: DispatchDocument) => {
      if (dispatch.archiveUrl?.includes("https://")) {
        return dispatch;
      }

      const archiveShowDispatchUrl: string = showUrl.endsWith("/") ? showUrl.slice(0, -1) : showUrl;
      const currentArchiveUrl: string = dispatch.archiveUrl ?? "";
      const archiveUrl: string = currentArchiveUrl.startsWith("/") ? currentArchiveUrl.slice(1) : currentArchiveUrl;
      dispatch.archiveUrl = `${archiveShowDispatchUrl}/${archiveUrl}`;
      return dispatch;
    });

    logger.info("Returning {DispatchCount} dispatches", dispatchesWithArchiveUrl.length);
    return response(dispatchesWithArchiveUrl);
  } catch (err) {
    logger.errorException(err, "Failed to get dispatches");
    return errorResponse(err, "Failed to get dispatches", 400);
  }
};

app.http("getDispatches", {
  authLevel: "anonymous",
  handler: getDispatches,
  methods: ["GET"],
  route: "dispatches"
});
