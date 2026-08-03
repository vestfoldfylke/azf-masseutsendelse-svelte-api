import { logger } from "@vestfoldfylke/loglady";
import mongoose from "mongoose";

const uri: string | undefined = process.env.MONGODB_CONNECTIONSTRING;

export const getDb = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!uri) {
    throw new Error("MONGODB_CONNECTIONSTRING is not set");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000
    });
  } catch (err) {
    logger.errorException(err, "Failed to connect to masseutsendelse database");
    throw err;
  }
};

export default getDb;
