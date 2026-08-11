import { BlobStorageClient } from "@vestfoldfylke/azure-blob-client";
import type { BlobStorageItem } from "@vestfoldfylke/azure-blob-client/dist/types/BlobStorageClient.type.js";
import { STORAGE } from "../../config.js";

if (!STORAGE.AZURE_BLOB_CONNECTIONSTRING || !STORAGE.AZURE_BLOB_CONTAINERNAME) {
  throw new Error("Cannot create BlobStorageClient when azure blob storage is not configured");
}

const blobClient: BlobStorageClient = new BlobStorageClient({
  connectionString: STORAGE.AZURE_BLOB_CONNECTIONSTRING,
  containerName: STORAGE.AZURE_BLOB_CONTAINERNAME
});

export const getBlob = async (path: string, encoding?: BufferEncoding): Promise<BlobStorageItem | undefined> => {
  const blobs: BlobStorageItem[] = await blobClient.get(path, encoding);

  return blobs.length > 0 ? blobs[0] : undefined;
};

export const UNALLOWED_PATH_CHARACTERS: string[] = blobClient.UNALLOWED_PATH_CHARACTERS;

export const saveBlob = (path: string, content: string | object | null): Promise<string> => blobClient.save(path, content);

export const removeBlob = (path: string): Promise<string[]> => blobClient.remove(path);
