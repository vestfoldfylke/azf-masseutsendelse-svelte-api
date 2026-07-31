declare module "@vtfk/azure-blob-client" {
  export const unallowedPathCharacters: string[];

  export type BlobFile = {
    data: string;
    type?: string;
    encoding?: string;
    properties?: Record<string, unknown>;
  };

  export type BlobOptions = {
    connectionString?: string;
    containerName?: string;
  };

  export function list(prefix?: string, options?: BlobOptions): Promise<unknown[]>;
  export function get(path: string, options?: BlobOptions): Promise<BlobFile | undefined>;
  export function save(path: string, data: string, options?: BlobOptions): Promise<unknown>;
  export function remove(path: string, options?: BlobOptions): Promise<unknown>;
}
