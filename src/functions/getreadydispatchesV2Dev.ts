import { app, type HttpRequest, type InvocationContext } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { getReadyDispatchesV2 } from "../sharedcode/funcs/getReadyDispatchesV2.js";
import { alertTeams } from "../sharedcode/helpers/alertTeams.js";
import { errorResponse } from "../sharedcode/response/response-handler.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

export const getReadyDispatches = async (req: HttpRequest, context: InvocationContext): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    return await getReadyDispatchesV2(req, context);
  } catch (err) {
    await alertTeams(err, "error", "getreadydispatchesV2Dev failed", null, "no id found", context.functionName);
    logger.errorException(err, "Failed to get ready dispatches V2 (Dev)");
    return errorResponse(err, "Failed to get ready dispatches V2", 400);
  }
};

app.http("getReadyDispatches", {
  authLevel: "anonymous",
  handler: getReadyDispatches,
  methods: ["GET"],
  route: "readyDispatches"
});
