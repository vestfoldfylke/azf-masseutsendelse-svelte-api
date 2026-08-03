export const createObjectWithOrderedKeys = <T extends Record<string, unknown>>(obj: T, startProperties: string[] = [], endProperties: string[] = []): Record<string, unknown> => {
  if (!obj || typeof obj !== "object") {
    throw new Error("The provided object is not of type object");
  }
  if (!startProperties || !Array.isArray(startProperties)) {
    throw new Error("startProperties is not of type Array");
  }
  if (!endProperties || !Array.isArray(endProperties)) {
    throw new Error("endProperties is not of type Array");
  }

  const unmatchedKeys: string[] = Object.keys(obj).filter((key: string) => !startProperties.includes(key) && !endProperties.includes(key));
  const orderedKeys: string[] = startProperties.concat(unmatchedKeys).concat(endProperties);

  const newObj: Record<string, unknown> = {};
  orderedKeys.forEach((key) => {
    if (obj[key]) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};
