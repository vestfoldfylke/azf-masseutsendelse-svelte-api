export type MockHeaders = {
  get?: ((name: string) => string | null | undefined) | undefined;
  "x-api-key"?: string | undefined;
};

export type MockRequest<TBody = unknown> = {
  headers: MockHeaders;
  json?: () => Promise<TBody>;
  body?: TBody;
  params?: Record<string, unknown>;
};
