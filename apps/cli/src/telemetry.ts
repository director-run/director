import { Analytics } from "@segment/analytics-node";
import { machineId as getMachineId } from "node-machine-id";
import packageJson from "../package.json";
import { env } from "./env";

const analytics = new Analytics({ writeKey: env.SEGMENT_WRITE_KEY });
const machineId = await getMachineId();

if (env.SEND_TELEMETRY) {
  // console.log("ANALYTICS IDENTIFY", machineId);
  analytics.identify({
    userId: machineId,
  });
}

export function trackEvent(
  event: string,
  properties: Record<string, unknown> = {},
) {
  if (env.SEND_TELEMETRY) {
    // console.log("ANALYTICS TRACK", event, properties);
    analytics.track({
      userId: machineId,
      event,
      properties: {
        ...properties,
        cli_version: packageJson.version,
      },
    });
  }
}
