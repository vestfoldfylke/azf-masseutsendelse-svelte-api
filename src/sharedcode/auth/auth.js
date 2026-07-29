const { logger } = require("@vestfoldfylke/loglady");
const HTTPError = require("../vtfk-errors/httperror");
const readPrincipal = require("./lib/azuread");

const testUser = {
  name: "timetrigger",
  id: "timetrigger",
  department: "timetrigger",
  email: "timetrigger@telemarkfylke.no"
};

/**
 * Auth's the request using the Easy Auth X-MS-CLIENT-PRINCIPAL header.
 * @param {object} req Azure function request
 */
async function auth(req) {
  if (process.env.NODE_ENV?.toLowerCase() === "test") {
    // Return a default timetrigger user in test mode since no auth header is provided
    return testUser;
  }

  const principalHeader = req.headers.get("x-ms-client-principal");
  if (!principalHeader) {
    if (process.env.NODE_ENV?.toLowerCase() !== "development") {
      throw new HTTPError(401, "X-MS-CLIENT-PRINCIPAL header is missing");
    }

    // Return a dev user in development mode - for testing against web without Easy Auth in front
    logger.warn("Using a development user based on AUTH_DEVELOPMENT_* env variables");
    return {
      name: process.env.AUTH_DEVELOPMENT_NAME ?? testUser.name,
      id: process.env.AUTH_DEVELOPMENT_ID ?? testUser.id,
      department: process.env.AUTH_DEVELOPMENT_DEPARTMENT ?? testUser.department,
      email: process.env.AUTH_DEVELOPMENT_EMAIL ?? testUser.email
    };
  }

  const identity = await readPrincipal(principalHeader);

  const requestor = {};
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

  return requestor;
}

module.exports.auth = auth;
