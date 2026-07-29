const { logger } = require("@vestfoldfylke/loglady");
const HTTPError = require("../../vtfk-errors/httperror");
const { MS, GRAPH } = require("../../../config");
const fetchEntraCred = require("../../helpers/get-entraid-token");

const CLAIM_TYPES = {
  name: ["name", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
  oid: ["oid", "http://schemas.microsoft.com/identity/claims/objectidentifier"],
  upn: ["upn", "preferred_username", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"],
  roles: ["roles", "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
};

const findClaim = (claims, types) => claims.find((c) => types.includes(c.typ))?.val;
const findClaims = (claims, types) => claims.filter((c) => types.includes(c.typ)).map((c) => c.val);

const fetchGraphCred = async () => {
  try {
    return await fetchEntraCred(GRAPH.GRAPH_SCOPE);
  } catch (error) {
    logger.errorException(error, "Not able to contact graph");
    throw new HTTPError(401, "Not able to contact graph");
  }
};

/**
 * Parses the Easy Auth X-MS-CLIENT-PRINCIPAL header, enforces roles/allowed groups
 * and enriches with department from Graph.
 * @param {string} principalHeader Base64-encoded JSON from the X-MS-CLIENT-PRINCIPAL header
 * @returns {Promise<{ name?: string, oid?: string, upn?: string, roles: string[], department?: string }>}
 */
module.exports = async (principalHeader) => {
  if (!principalHeader || typeof principalHeader !== "string") {
    throw new HTTPError(401, "X-MS-CLIENT-PRINCIPAL header is missing or invalid");
  }

  let principal;
  try {
    principal = JSON.parse(Buffer.from(principalHeader, "base64").toString("utf8"));
  } catch (err) {
    logger.errorException(err, "Failed to decode X-MS-CLIENT-PRINCIPAL");
    throw new HTTPError(401, "X-MS-CLIENT-PRINCIPAL header could not be decoded");
  }

  const claims = Array.isArray(principal?.claims) ? principal.claims : [];
  const roleTypes = principal?.role_typ ? [...CLAIM_TYPES.roles, principal.role_typ] : CLAIM_TYPES.roles;

  const identity = {
    name: findClaim(claims, CLAIM_TYPES.name),
    oid: findClaim(claims, CLAIM_TYPES.oid),
    upn: findClaim(claims, CLAIM_TYPES.upn),
    roles: findClaims(claims, roleTypes)
  };

  if (identity.roles.length === 0) {
    throw new HTTPError(401, "No roles could be found in authentication data");
  }

  if (MS.AZUREAD_ALLOWEDGROUPS) {
    const allowedGroups = MS.AZUREAD_ALLOWEDGROUPS.split(",").filter((n) => n);
    const found = identity.roles.some((role) => allowedGroups.includes(role));
    if (!found) {
      throw new HTTPError(401, "Your account is not a member of any allowed groups");
    }
  }

  if (identity.upn && MS.AZUREAD_SKIP_DEPARTMENT_CHECK.includes(identity.upn.toLowerCase())) {
    identity.department = MS.AZUREAD_SKIP_DEPARTMENT_NAME;
  } else {
    const graphCred = await fetchGraphCred();
    const url = `${GRAPH.GRAPH_URL}/users/${identity.upn}?$select=department`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${graphCred}`
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      logger.error("Failed to contact graph with Url {Url}. Status: {Status}: {StatusText}: {@ErrorData}", url, response.status, response.statusText, errorData);
      throw new HTTPError(response.status, "Not able to contact graph");
    }

    const data = await response.json();
    identity.department = data?.department;
  }

  if (!identity.department) {
    logger.error("Could not find the company department for UPN {UPN}", identity.upn);
    throw new HTTPError(401, "Could not find the users company department");
  }

  return identity;
};
