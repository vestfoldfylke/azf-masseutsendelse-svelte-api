import { logger } from "@vestfoldfylke/loglady";
import { GRAPH, MS } from "../../../config.js";
import type { Identity, PrincipalClaim, PrincipalHeader } from "../../../types/auth.js";
import fetchEntraCred from "../../helpers/get-entraid-token.js";
import HTTPError from "../../vtfk-errors/httperror.js";

const CLAIM_TYPES = {
  name: ["name", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
  oid: ["oid", "http://schemas.microsoft.com/identity/claims/objectidentifier"],
  upn: ["upn", "preferred_username", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn"],
  roles: ["roles", "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
} as const;

const findClaim = (claims: PrincipalClaim[], types: readonly string[]): string | undefined => claims.find((c: PrincipalClaim) => types.includes(c.typ))?.val;
const findClaims = (claims: PrincipalClaim[], types: readonly string[]): string[] => claims.filter((c: PrincipalClaim) => types.includes(c.typ)).map((c: PrincipalClaim) => c.val);

const fetchGraphCred = async (): Promise<string> => {
  if (!GRAPH.GRAPH_SCOPE) {
    throw new HTTPError(401, "GRAPH_SCOPE is not configured");
  }

  try {
    return await fetchEntraCred(GRAPH.GRAPH_SCOPE);
  } catch (error) {
    logger.errorException(error, "Not able to contact graph");
    throw new HTTPError(401, "Not able to contact graph");
  }
};

export async function readPrincipal(principalHeader: string): Promise<Identity> {
  if (!principalHeader || typeof principalHeader !== "string") {
    throw new HTTPError(401, "X-MS-CLIENT-PRINCIPAL header is missing or invalid");
  }

  let principal: PrincipalHeader;
  try {
    principal = JSON.parse(Buffer.from(principalHeader, "base64").toString("utf8")) as PrincipalHeader;
  } catch (err) {
    logger.errorException(err, "Failed to decode X-MS-CLIENT-PRINCIPAL");
    throw new HTTPError(401, "X-MS-CLIENT-PRINCIPAL header could not be decoded");
  }

  const claims: PrincipalClaim[] = Array.isArray(principal?.claims) ? principal.claims : [];
  const roleTypes: string[] = principal?.role_typ ? [...CLAIM_TYPES.roles, principal.role_typ] : [...CLAIM_TYPES.roles];

  const identity: Identity = {
    name: findClaim(claims, CLAIM_TYPES.name),
    oid: findClaim(claims, CLAIM_TYPES.oid),
    upn: findClaim(claims, CLAIM_TYPES.upn),
    roles: findClaims(claims, roleTypes)
  };

  if (identity.roles.length === 0) {
    throw new HTTPError(401, "No roles could be found in authentication data");
  }

  if (MS.AZUREAD_ALLOWEDGROUPS) {
    const allowedGroups: string[] = MS.AZUREAD_ALLOWEDGROUPS.split(",").filter((n: string) => n);
    const found: boolean = identity.roles.some((role: string) => allowedGroups.includes(role));
    if (!found) {
      throw new HTTPError(401, "Your account is not a member of any allowed groups");
    }
  }

  if (identity.upn && MS.AZUREAD_SKIP_DEPARTMENT_CHECK.includes(identity.upn.toLowerCase())) {
    identity.department = MS.AZUREAD_SKIP_DEPARTMENT_NAME;
  } else {
    const graphCred: string = await fetchGraphCred();
    const url = `${GRAPH.GRAPH_URL}/users/${identity.upn}?$select=department`;
    const response: Response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${graphCred}`
      }
    });

    if (!response.ok) {
      const errorData: string = await response.text();
      logger.error("Failed to contact graph with Url {Url}. Status: {Status}: {StatusText}: {@ErrorData}", url, response.status, response.statusText, errorData);
      throw new HTTPError(response.status, "Not able to contact graph");
    }

    const data = (await response.json()) as { department?: string };
    identity.department = data?.department;
  }

  if (!identity.department) {
    logger.error("Could not find the company department for UPN {UPN}", identity.upn);
    throw new HTTPError(401, "Could not find the users company department");
  }

  return identity;
}

export default readPrincipal;
