export type StorageConfig = {
  AZURE_BLOB_CONNECTIONSTRING: string | undefined;
  AZURE_BLOB_CONTAINERNAME: string | undefined;
  MONGODB_CONNECTIONSTRING: string | undefined;
};

export type GraphConfig = {
  GRAPH_SCOPE: string | undefined;
  GRAPH_URL: string | undefined;
};

export type MatrikkelConfig = {
  MATRIKKEL_BASEURL: string | undefined;
  MATRIKKEL_KEY: string | undefined;
  MATRIKKEL_SCOPE: string | undefined;
};

export type PdfGeneratorConfig = {
  PDF_GENERATOR_ENDPOINT: string | undefined;
  PDF_GENERATOR_X_FUNCTIONS_KEY: string | undefined;
};

export type ArchiveConfig = {
  ARCHIVE_ENDPOINT: string | undefined;
  ARCHIVE_SCOPE: string | undefined;
  ARCHIVE_SHOW_DISPATCH_URL: string | undefined;
};

export type StatisticsConfig = {
  STATISTICS_KEY: string | undefined;
  STATISTICS_URL: string | undefined;
};

export type MsConfig = {
  AZUREAD_ALLOWEDGROUPS: string;
  AZUREAD_SKIP_DEPARTMENT_CHECK: string[];
  AZUREAD_SKIP_DEPARTMENT_NAME: string;
  TEAMS_ALERTS_WEBHOOK_URL: string | undefined;
};

export type MiscConfig = {
  BYPASS_REGISTRATION_THRESHOLD: boolean;
};

export type AppConfig = {
  STORAGE: StorageConfig;
  GRAPH: GraphConfig;
  MATRIKKEL: MatrikkelConfig;
  PDF_GENERATOR: PdfGeneratorConfig;
  ARCHIVE: ArchiveConfig;
  STATISTICS: StatisticsConfig;
  MS: MsConfig;
  MISC: MiscConfig;
};
