import { logger } from "@vestfoldfylke/loglady";
import { ARCHIVE } from "../../config.js";
import HTTPError from "../vtfk-errors/httperror.js";
import getEntraIdToken from "./get-entraid-token.js";

export async function callArchive<T = unknown>(endpoint: string, payload: unknown): Promise<T> {
  if (!ARCHIVE.ARCHIVE_SCOPE) {
    throw new Error("ARCHIVE_SCOPE is not configured");
  }

  const bearer: string = await getEntraIdToken(ARCHIVE.ARCHIVE_SCOPE);
  const response: Response = await fetch(`${ARCHIVE.ARCHIVE_ENDPOINT}/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearer}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData: string = await response.text();
    logger.error("Failed calling archive service with Endpoint {Endpoint}. Status: {Status}: {StatusText}: {@ErrorData}", endpoint, response.status, response.statusText, errorData);
    throw new HTTPError(response.status, `Error calling archive service: ${response.statusText}`, undefined, [errorData]);
  }

  return (await response.json()) as T;
}
