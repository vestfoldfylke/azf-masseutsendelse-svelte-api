import { after, before } from "node:test";
import * as dbMem from "./Memory-DB.js";

export const setupDB = (): void => {
  before(async () => {
    await dbMem.connect();
  });

  after(async () => {
    await dbMem.closeDatabase();
  });
};
