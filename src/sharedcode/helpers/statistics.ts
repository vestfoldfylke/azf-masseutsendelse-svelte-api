import { logger } from "@vestfoldfylke/loglady";
import { STATISTICS } from "../../config.js";
import type { StatisticsResult } from "../../types/statistics.js";

export const createStatistics = async (department: string, id: string, privatePersons: number, enterprises: number): Promise<StatisticsResult | undefined> => {
  const payload = {
    system: "Masseutsendelse",
    engine: "azf-masseutsendelse-api",
    company: "SMM",
    department,
    description: "Viser antall bedrifter og privatpersoner som er varslet.",
    externalId: id,
    privatepersons: privatePersons,
    enterprises,
    type: "SMM - Masseutsendelse"
  };

  if (!STATISTICS.STATISTICS_URL || !STATISTICS.STATISTICS_KEY) {
    logger.error("STATISTICS_URL or STATISTICS_KEY is missing");
    return undefined;
  }

  const response: Response = await fetch(`${STATISTICS.STATISTICS_URL}/stats`, {
    method: "POST",
    headers: {
      "x-functions-key": STATISTICS.STATISTICS_KEY
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData: string = await response.text();
    logger.error("Failed to insert statistics. Status: {Status}: {StatusText}: {@ErrorData}", response.status, response.statusText, errorData);
    return undefined;
  }

  const data = (await response.json()) as StatisticsResult | StatisticsResult[];
  if (!Array.isArray(data)) {
    return data;
  }

  if (data.length === 0) {
    return undefined;
  }

  if (data.length > 1) {
    logger.error("Failed to insert statistics");
    throw new Error("Was not able to create statistics");
  }

  return data[0];
};
