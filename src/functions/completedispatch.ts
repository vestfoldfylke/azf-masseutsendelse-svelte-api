import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { auth } from "../sharedcode/auth/auth.js";
import getDb from "../sharedcode/connections/masseutsendelseDB.js";
import Dispatches from "../sharedcode/models/dispatches.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { Requestor } from "../types/auth.js";
import type { DispatchDocument } from "../types/dispatches.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

type CompleteDispatchBody = {
  e18Id?: string;
};

export const completeDispatch = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    const id: string | undefined = req.params.id;
    if (!id) {
      return new HTTPError(400, "You cannot complete a dispatch without providing an id").toHTTPResponse();
    }

    const requestor: Requestor = await auth(req);

    await getDb();

    const existingDispatch: DispatchDocument | null = await Dispatches.findById(id).lean();
    if (!existingDispatch) {
      logger.error("Dispatch with Id {Id} could not be found", id);
      return new HTTPError(404, `Dispatch with id ${id} could not be found`).toHTTPResponse();
    }
    if (existingDispatch.status !== "approved") {
      logger.error("Dispatch with Id {Id} cannot be completed since it's not approved ({Status})", id, existingDispatch.status);
      return new HTTPError(400, "Cannot complete a dispatch that is not approved").toHTTPResponse();
    }

    const completedData: Partial<DispatchDocument> = {
      status: "completed",
      owners: [],
      excludedOwners: [],
      matrikkelUnitsWithoutOwners: [],
      modifiedTimestamp: new Date(),
      modifiedBy: requestor.name,
      modifiedByEmail: requestor.email,
      modifiedByDepartment: requestor.department,
      modifiedById: requestor.id
    };

    const requestBody = (await req.json()) as CompleteDispatchBody | null;
    if (requestBody?.e18Id) {
      completedData.e18Id = requestBody.e18Id;
    }

    const updatedDispatch: DispatchDocument | null = await Dispatches.findByIdAndUpdate(id, completedData, { returnDocument: "after" });
    logger.info("Dispatch with Id {Id} has been completed by {User}", id, requestor.email);

    return response(updatedDispatch);
  } catch (err) {
    logger.errorException(err, "Failed to put completed dispatch");
    return errorResponse(err, "Failed to put completed dispatch", 400);
  }
};

app.http("completeDispatch", {
  authLevel: "anonymous",
  handler: completeDispatch,
  methods: ["PUT"],
  route: "dispatches/{id}/complete"
});
