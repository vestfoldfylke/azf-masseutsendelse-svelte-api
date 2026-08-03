import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { MATRIKKEL } from "../config.js";
import { auth } from "../sharedcode/auth/auth.js";
import getAccessToken from "../sharedcode/helpers/get-entraid-token.js";
import { response } from "../sharedcode/response/response-handler.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

export const getMatrikkel = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  await auth(req);

  if (!MATRIKKEL.MATRIKKEL_BASEURL) {
    return new HTTPError(400, "The MatrikkelProxyAPI connection is not configured").toHTTPResponse();
  }
  if (!MATRIKKEL.MATRIKKEL_KEY) {
    return new HTTPError(400, "The MatrikkelProxyAPI connection is missing the APIKey").toHTTPResponse();
  }
  if (!MATRIKKEL.MATRIKKEL_SCOPE) {
    return new HTTPError(400, "The MatrikkelProxyAPI scope is not configured").toHTTPResponse();
  }

  let bearer: string;
  try {
    bearer = await getAccessToken(MATRIKKEL.MATRIKKEL_SCOPE);
  } catch (error) {
    logger.errorException(error, "Something went wrong fetching the access token");
    return new HTTPError(400, "Something went wrong fetching the accessToken").toHTTPResponse();
  }

  const endpoint: string = decodeURIComponent(req.params.endpoint ?? "");
  const requestBody: string = await req.text();
  const responseRequest: Response = await fetch(`${MATRIKKEL.MATRIKKEL_BASEURL}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`,
      "x-functions-key": MATRIKKEL.MATRIKKEL_KEY
    },
    body: requestBody
  });

  if (!responseRequest.ok) {
    const errorData: string = await responseRequest.text();
    logger.error("Failed to POST to MatrikkelProxyAPI Endpoint {Endpoint}, Status: {Status}: {StatusText}: {@ErrorData}", endpoint, responseRequest.status, responseRequest.statusText, errorData);
    return new HTTPError(responseRequest.status, `MatrikkelProxyAPI responded with status ${responseRequest.status}: ${responseRequest.statusText}`).toHTTPResponse();
  }

  const matrikkelData: unknown = await responseRequest.json();
  logger.info("Successfully fetched data from MatrikkelProxyAPI Endpoint {Endpoint}", endpoint);
  return response(matrikkelData);
};

app.http("getMatrikkel", {
  authLevel: "anonymous",
  handler: getMatrikkel,
  methods: ["POST"],
  route: "matrikkel/{endpoint}"
});
