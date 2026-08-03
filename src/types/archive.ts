export type ArchiveContactRole = "Mottaker";

export type ArchiveAttachment = {
  title: string;
  format: string;
  base64: string;
  versionFormat?: string;
};

export type ArchiveContact = {
  ssn: string;
  role: ArchiveContactRole;
};

export type P360Case = {
  URL?: string;
  [key: string]: unknown;
};
