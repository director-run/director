import { isProduction } from "@director.run/utilities/env";
import { os } from "@director.run/utilities/os/index";
import { env } from "./env";

export async function trackEvent(eventName: string) {
  const distinctId = os.getMachineId();

  if (isProduction() && !env.OPT_OUT_TELEMETRY) {
    try {
      await fetch(env.TELEMETRY_URL + "/metrics", {
        method: "POST",
        body: JSON.stringify({
          event: eventName,
          properties: {
            distinct_id: distinctId,
          },
        }),
      });
    } catch (error) {
      console.error(error);
    }
  }
}
