export type JsonResponse = {
  status: number;
  headers: { "Content-Type": string };
  jsonBody: unknown;
};

export type TextResponse = {
  status: number;
  headers: { "Content-Type": string };
  body: string;
};

export type FunctionResponse = JsonResponse | TextResponse;

export type HTTPErrorBody = {
  statusCode: number;
  statusName: string;
  message: string;
  title: string | undefined;
  errors: string[] | null;
};

export type HTTPErrorResponse = {
  status: number;
  headers: { "Content-Type": string };
  jsonBody: {
    error: HTTPErrorBody;
    documentation?: unknown;
  };
};
