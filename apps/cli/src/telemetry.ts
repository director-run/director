import { isProduction } from "@director.run/utilities/env";
import { env } from "./env";
import { getMachineId } from "./get-machine-id";

export async function trackEvent(eventName: string) {
  const distinctId = await getMachineId();

  if (isProduction()) {
    await fetch(env.TELEMETRY_URL + "/metrics", {
      method: "POST",
      body: JSON.stringify({
        event: eventName,
        properties: {
          distinct_id: distinctId,
        },
      }),
    });
  }
}
