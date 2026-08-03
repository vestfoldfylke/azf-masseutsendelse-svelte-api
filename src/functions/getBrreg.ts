import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { auth } from "../sharedcode/auth/auth.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

export const getBRReg = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  await auth(req);

  const id: string | undefined = req.params.id;
  if (!id) {
    return new HTTPError(400, "No dispatch id was provided").toHTTPResponse();
  }

  const responseRequest: Response = await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!responseRequest.ok) {
    const errorData: string = await responseRequest.text();
    logger.error("Failed to get data for EnhetId {EnhetId} from BRReg. Status: {Status}: {StatusText}: {@ErrorData}", id, responseRequest.status, responseRequest.statusText, errorData);
    return new HTTPError(responseRequest.status, `BRReg responded with status code ${responseRequest.status} for id ${id}: ${responseRequest.statusText}`).toHTTPResponse();
  }

  try {
    const responseData: unknown = await responseRequest.json();
    logger.info("Fetched data for EnhetId {EnhetId} from BRReg", id);

    return response(responseData);
  } catch (err) {
    logger.errorException(err, "Failed to parse BRReg response for EnhetId {EnhetId}", id);
    return errorResponse(err, `Failed to parse BRReg response for EnhetId ${id}`, 500);
  }
};

app.http("getBRReg", {
  authLevel: "anonymous",
  handler: getBRReg,
  methods: ["GET"],
  route: "brreg/{id}"
});
