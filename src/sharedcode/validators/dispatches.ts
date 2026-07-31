import { logger } from "@vestfoldfylke/loglady";
import type { P360Case } from "../../types/archive.js";
import type { Dispatch } from "../../types/dispatches.js";
import { getCase } from "../helpers/checkP360Case.js";
import HTTPError from "../vtfk-errors/httperror.js";

export const validate = async (dispatch: Dispatch | undefined): Promise<void> => {
  if (!dispatch) {
    logger.error("No dispatch object was provided");
    throw new HTTPError(400, "No dispatch object was provided");
  }

  if ((!dispatch.attachments || dispatch.attachments.length === 0) && (!dispatch.template || Object.keys(dispatch.template).length === 0)) {
    logger.error("Template OR Attachments must be provided");
    throw new HTTPError(400, "Template OR Attachments must be provided");
  }

  if (!dispatch.template && dispatch.attachments && Array.isArray(dispatch.attachments) && dispatch.attachments.length <= 0) {
    logger.error("Attachments cannot be empty when there is no template");
    throw new HTTPError(400, "Attachments cannot be empty when there is no template");
  }

  if (!dispatch.archivenumber) {
    logger.error("No archive number has been provided");
    throw new HTTPError(400, "No archive number has been provided");
  }

  if (dispatch.archivenumber === dispatch.validatedArchivenumber) {
    return;
  }

  try {
    const p360Case: P360Case | undefined = await getCase(dispatch.archivenumber);
    if (!p360Case) {
      throw new HTTPError(400, "Could not find a valid case in the archive system");
    }

    if (p360Case.URL) {
      dispatch.archiveUrl = p360Case.URL;
    }
  } catch (err) {
    logger.errorException(err, "Something went wrong contacting the archive");
    const message: string = err instanceof Error ? err.message : String(err);
    throw new HTTPError(500, `Something went wrong contacting the archive: ${message}`, "Problem contacting the archive");
  }
};
