export type Requestor = {
  name: string;
  id: string;
  department: string;
  email: string;
};

export type PrincipalClaim = {
  typ: string;
  val: string;
};

export type PrincipalHeader = {
  claims?: PrincipalClaim[];
  role_typ?: string;
};

export type Identity = {
  name?: string | undefined;
  oid?: string | undefined;
  upn?: string | undefined;
  roles: string[];
  department?: string | undefined;
};
