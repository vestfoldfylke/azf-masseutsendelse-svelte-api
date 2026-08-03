import { app, type HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import allowedExtensions from "../sharedcode/allowedExtensions.json" with { type: "json" };
import { auth } from "../sharedcode/auth/auth.js";
import getDb from "../sharedcode/connections/masseutsendelseDB.js";
import { removeBlob, saveBlob, UNALLOWED_PATH_CHARACTERS } from "../sharedcode/helpers/blob.js";
import { getDiff } from "../sharedcode/helpers/get-diff.js";
import Dispatches from "../sharedcode/models/dispatches.js";
import { errorResponse, response } from "../sharedcode/response/response-handler.js";
import { validate } from "../sharedcode/validators/dispatches.js";
import HTTPError from "../sharedcode/vtfk-errors/httperror.js";
import type { Requestor } from "../types/auth.js";
import type { Diff, Dispatch, DispatchAttachment, DispatchDocument } from "../types/dispatches.js";
import type { FunctionResponse, HTTPErrorResponse } from "../types/response.js";

export const editDispatches = async (req: HttpRequest): Promise<FunctionResponse | HTTPErrorResponse> => {
  try {
    const requestBody = (await req.json()) as Partial<Dispatch>;
    const id: string | undefined = req.params.id;
    if (!id) {
      return new HTTPError(400, "You cannot edit a dispatch without providing an id").toHTTPResponse();
    }

    await getDb();

    const existingDispatch: DispatchDocument | null = await Dispatches.findById(id).lean();
    if (!existingDispatch) {
      return new HTTPError(404, `Dispatch with id ${id} could not be found`).toHTTPResponse();
    }

    const requestDiff: Diff = getDiff(existingDispatch as unknown as Record<string, unknown>, requestBody as unknown as Record<string, unknown>, ["polygons", "stats"]);
    const requestDiffKeys: string[] = Object.keys(requestDiff);

    delete requestBody._id;

    const requestor: Requestor = await auth(req);

    requestBody.modifiedBy = requestor.name;
    requestBody.modifiedById = requestor.id;
    requestBody.modifiedTimestamp = new Date();
    requestBody.modifiedByEmail = requestor.email;
    requestBody.modifiedByDepartment = requestor.department;

    const unsets: Record<string, number> = {};
    if (Object.keys(requestBody).length === 2 && !requestBody.template) {
      unsets.template = 1;
    }
    if (requestBody.attachments && !requestBody.template) {
      unsets.template = 1;
    }

    if (existingDispatch.status === "inprogress" && requestBody.status !== "completed") {
      return new HTTPError(400, "No changes can be done to a running dispatch except setting it to completed").toHTTPResponse();
    }
    if (existingDispatch.status === "inprogress" && requestBody.status === "completed") {
      const result: DispatchDocument | null = await Dispatches.findByIdAndUpdate(id, { status: "completed" }, { returnDocument: "after" });
      return response(result, 201);
    }

    if (existingDispatch.status === "inprogress" || existingDispatch.status === "completed") {
      return new HTTPError(400, "No changes can be done to running or completed dispatches").toHTTPResponse();
    }

    requestBody.validatedArchivenumber = existingDispatch.validatedArchivenumber;

    if (existingDispatch.status === "notapproved" && requestBody.status === "approved") {
      requestBody.approvedBy = requestor.name;
      requestBody.approvedById = requestor.id;
      requestBody.approvedByEmail = requestor.email;
      requestBody.approvedTimestamp = new Date();
      logger.info("ApprovedBy: {Approver}", requestBody.approvedBy);
    }

    if (requestBody.status === "notapproved") {
      requestBody.approvedBy = "";
      requestBody.approvedById = "";
      delete requestBody.approvedTimestamp;

      if (existingDispatch.status === "approved" && requestBody.status === "notapproved") {
        logger.info("Approval retracted");
      }
    }

    await validate(requestBody as Dispatch);
    if (requestBody.archivenumber) {
      requestBody.validatedArchivenumber = requestBody.archivenumber;
    }

    if (requestBody.attachments && Array.isArray(requestBody.attachments) && requestBody.attachments.length > 0) {
      requestBody.attachments.forEach((i: DispatchAttachment) => {
        const split: string[] = i.name.split(".");
        if (split.length === 1) {
          throw new HTTPError(400, "All filenames must have an extension");
        }

        const extension: string = split[split.length - 1] ?? "";
        if (!allowedExtensions.includes(extension.toLowerCase())) {
          throw new HTTPError(400, `The file extension ${extension} is not allowed`);
        }

        UNALLOWED_PATH_CHARACTERS.forEach((char: string) => {
          if (i.name.includes(char)) {
            throw new HTTPError(400, `${i.name} cannot contain illegal character ${char}`);
          }
        });
      });
    }

    const updatedDispatch: DispatchDocument | null = await Dispatches.findByIdAndUpdate(id, { ...requestBody, $unset: unsets }, { returnDocument: "after" });

    if (process.env.NODE_ENV !== "test") {
      const existingNames: string[] = existingDispatch.attachments ? existingDispatch.attachments.map((i) => i.name) : [];
      const requestNames: string[] = requestBody.attachments ? requestBody.attachments.map((i) => i.name) : [];

      if (requestBody.attachments) {
        const attachmentsToAdd: DispatchAttachment[] = requestBody.attachments.filter((i: DispatchAttachment) => !existingNames.includes(i.name) || i.data);
        const attachmentsToRemove: string[] = existingNames.filter((i: string) => !requestNames.includes(i));

        for (const i of attachmentsToAdd) {
          if (i.data) {
            await saveBlob(`${id}/${i.name}`, i.data);
          }
        }

        for (const i of attachmentsToRemove) {
          await removeBlob(`${id}/${i}`);
        }
      }
    }

    logger.info("Dispatch with Id {Id} has been edited by {User} with the following properties edited: {@RequestDiff}", id, requestor.email, requestDiffKeys);
    return response(updatedDispatch);
  } catch (err) {
    logger.errorException(err, "Failed to edit dispatches");
    return errorResponse(err, "Failed to edit dispatches", 400);
  }
};

app.http("editDispatches", {
  authLevel: "anonymous",
  handler: editDispatches,
  methods: ["PUT"],
  route: "dispatches/{id}"
});
