import { app, type InvocationContext, type Timer } from "@azure/functions";
import { logger } from "@vestfoldfylke/loglady";
import { getReadyDispatchesV2 } from "../sharedcode/funcs/getReadyDispatchesV2.js";
import { alertTeams } from "../sharedcode/helpers/alertTeams.js";

const getReadyDispatches = async (_myTimer: Timer, context: InvocationContext): Promise<void> => {
  try {
    await getReadyDispatchesV2({} as never, context);
  } catch (err) {
    await alertTeams(err, "error", "getreadydispatchesV2 failed", null, "no id found", context.functionName);
    logger.errorException(err, "Failed to get ready dispatches V2");
  }
};

app.timer("getReadyDispatchesTimer", {
  schedule: "0 0 12 * * *",
  handler: getReadyDispatches
});
