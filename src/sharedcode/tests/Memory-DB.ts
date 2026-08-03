import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongodb: MongoMemoryServer | undefined;

export const connect = async (): Promise<void> => {
  mongodb = await MongoMemoryServer.create();
  const uri: string = mongodb.getUri();
  process.env.URI = uri;
  await mongoose.connect(uri);
};

export const closeDatabase = async (): Promise<void> => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongodb?.stop();
};

export const clearDatabase = async (): Promise<void> => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany();
    }
  }
};
