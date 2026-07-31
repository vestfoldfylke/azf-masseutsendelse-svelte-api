import { app, type InvocationContext, type Timer } from "@azure/functions";
import { handleJobs } from "../sharedcode/funcs/handleJobs.js";

const getHandleJobs = async (_myTimer: Timer, context: InvocationContext): Promise<void> => {
  await handleJobs(context, "auto");
};

app.timer("getHandleJobsTimer", {
  schedule: "0 */10 * * * *",
  handler: getHandleJobs
});
