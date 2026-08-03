import { isValidObjectId } from "mongoose";
import type { Diff } from "../../types/dispatches.js";

type DiffableValue = {
  _id?: unknown;
  data?: unknown;
  [key: string]: unknown;
};

const getObjectIdValue = (id: unknown): string => {
  if (isValidObjectId(id)) {
    return String(id);
  }

  return String(id);
};

const isObjectWithKeys = (obj: unknown): obj is DiffableValue => typeof obj === "object" && obj !== null && !Array.isArray(obj) && Object.keys(obj).length > 0;

export const getDiff = (previousObject: Record<string, unknown>, newObject: Record<string, unknown>, excludedKeys: string[] = []): Diff => {
  const diff: Diff = {};
  for (const key of Object.keys(newObject)) {
    if (excludedKeys.includes(key)) {
      continue;
    }

    const previousValue: unknown = previousObject[key];
    const newValue: unknown = newObject[key];

    if (JSON.stringify(newValue) === JSON.stringify(previousValue)) {
      continue;
    }

    if (isObjectWithKeys(previousValue) && isObjectWithKeys(newValue) && previousValue._id && newValue._id) {
      const previousId: string = getObjectIdValue(previousValue._id);
      const newId: string = getObjectIdValue(newValue._id);

      if (previousId === newId && previousValue.data && newValue.data && JSON.stringify(previousValue.data) === JSON.stringify(newValue.data)) {
        continue;
      }
    }

    diff[key] = { from: previousValue, to: newValue };
  }

  return diff;
};
