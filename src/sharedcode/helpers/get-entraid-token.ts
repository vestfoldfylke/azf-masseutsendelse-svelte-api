import { type AccessToken, DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();

export async function getEntraIdToken(scope: string): Promise<string> {
  if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET || !process.env.AZURE_TENANT_ID) {
    throw new Error("AZURE_TENANT_ID, AZURE_CLIENT_ID, and AZURE_CLIENT_SECRET must be set in environment variables");
  }

  const result: AccessToken = await credential.getToken(scope);
  return result.token;
}

export default getEntraIdToken;
