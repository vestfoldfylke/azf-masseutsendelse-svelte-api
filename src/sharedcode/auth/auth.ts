import type { HttpRequest } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import type { Identity, Requestor } from "../../types/auth.js";
import HTTPError from "../vtfk-errors/httperror.js";
import readPrincipal from "./lib/azuread.js";

const testUser: Requestor = {
  name: "timetrigger",
  id: "timetrigger",
  department: "timetrigger",
  email: "timetrigger@telemarkfylke.no"
};

type AuthLike = {
  headers: {
    get: (name: string) => string | null | undefined;
  };
};

export async function auth(req: HttpRequest | AuthLike): Promise<Requestor> {
  if (process.env.NODE_ENV?.toLowerCase() === "test") {
    return testUser;
  }

  const principalHeader: string | null | undefined = req.headers.get("x-ms-client-principal");
  if (!principalHeader) {
    if (process.env.NODE_ENV?.toLowerCase() !== "development") {
      throw new HTTPError(401, "X-MS-CLIENT-PRINCIPAL header is missing");
    }

    logger.warn("Using a development user based on AUTH_DEVELOPMENT_* env variables");
    return {
      name: process.env.AUTH_DEVELOPMENT_NAME ?? testUser.name,
      id: process.env.AUTH_DEVELOPMENT_ID ?? testUser.id,
      department: process.env.AUTH_DEVELOPMENT_DEPARTMENT ?? testUser.department,
      email: process.env.AUTH_DEVELOPMENT_EMAIL ?? testUser.email
    };
  }

  const identity: Identity = await readPrincipal(principalHeader);

  const requestor: Partial<Requestor> = {};
  if (identity.name) {
    requestor.name = identity.name;
  }
  if (identity.oid) {
    requestor.id = identity.oid;
  }
  if (identity.department) {
    requestor.department = identity.department;
  }
  if (identity.upn) {
    requestor.email = identity.upn;
  }

  return requestor as Requestor;
}
