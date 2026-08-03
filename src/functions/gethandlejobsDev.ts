import { app, type HttpRequest, type InvocationContext } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { auth } from "../sharedcode/auth/auth.js";
import { handleJobs } from "../sharedcode/funcs/handleJobs.js";
import { errorResponse } from "../sharedcode/response/response-handler.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

export const getHandleJobs = async (req: HttpRequest, context: InvocationContext): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    await auth(req);
  } catch (error) {
    logger.errorException(error, "Auth failed. Aborting handleJobs");
    return errorResponse(error, "Unauthorized", 401);
  }

  return await handleJobs(context, "dev");
};

app.http("getHandleJobs", {
  authLevel: "anonymous",
  handler: getHandleJobs,
  methods: ["GET"],
  route: "handleJobs"
});
