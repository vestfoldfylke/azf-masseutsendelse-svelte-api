import { logger } from "@vestfoldfylke/loglady";
import { MS } from "../../config.js";

export const alertTeams = async (
  error: unknown,
  color: "error" | "completed",
  failedTask: unknown,
  completedJob: string | null,
  jobId: string,
  endpoint: string,
  nonErrorStatusText = "Completed"
): Promise<void> => {
  if (!color) {
    throw new Error("Color must be provided");
  }
  if (!error) {
    throw new Error("Error must be provided");
  }
  if (!failedTask) {
    throw new Error("failedTasks must be provided");
  }
  if (color === "completed" && !completedJob) {
    throw new Error("completedJob must be provided on a completed job");
  }
  if (typeof color !== "string") {
    throw new Error("Color must be of type string");
  }
  if (!MS.TEAMS_ALERTS_WEBHOOK_URL) {
    return;
  }

  const colorHex: string = color === "error" ? "a80c0c" : "1ea80c";

  const environment: string = process.env.NODE_ENV || process.env.APP_NAME || "";

  const teamsMsg = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        contentUrl: null,
        content: {
          $schema: "https://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.5",
          msteams: { width: "full" },
          body: [
            {
              type: "TextBlock",
              text: color === "error" ? `azf-masseutsendelse-api failed ${environment ? `- ${environment}` : ""}` : `azf-masseutsendelse-api finished a job ${environment ? `- ${environment}` : ""}`,
              wrap: true,
              style: "heading",
              color: colorHex
            },
            {
              type: "TextBlock",
              text: `endpoint: ${endpoint}`,
              wrap: true,
              weight: "Bolder",
              size: "Medium"
            },
            {
              type: "TextBlock",
              text: `Task ${color === "error" ? "Failed" : nonErrorStatusText}`,
              wrap: true,
              weight: "Bolder",
              size: "Medium"
            },
            {
              type: "TextBlock",
              text: color === "error" ? JSON.stringify(failedTask) : completedJob,
              wrap: true,
              weight: "Bolder",
              size: "Medium"
            },
            {
              type: "TextBlock",
              text: color === "error" ? JSON.stringify(error) : "Everything is good!",
              wrap: true,
              weight: "Bolder",
              size: "Medium"
            }
          ]
        }
      }
    ]
  };

  const response: Response = await fetch(MS.TEAMS_ALERTS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(teamsMsg)
  });

  if (!response.ok) {
    const errorData: string = await response.text();
    logger.error("Failed to send Teams alert with JobId {JobId}. Status: {Status}: {StatusText}: {@ErrorData}", jobId, response.status, response.statusText, errorData);
    throw new Error(`Failed to send Teams alert: ${response.status} ${response.statusText}`);
  }
};
