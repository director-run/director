import os from "os";
import { Analytics } from "@segment/analytics-node";
import { machineId as getMachineId } from "node-machine-id";

export class Telemetry {
  private analytics: Analytics;
  private machineId!: string;
  private enabled: boolean;
  private traits: Record<string, unknown>;

  constructor(params: {
    writeKey: string;
    enabled: boolean;
    traits?: Record<string, unknown>;
  }) {
    this.analytics = new Analytics({ writeKey: params.writeKey });
    this.enabled = params.enabled;
    this.traits = params.traits || {};
  }

  private async initialize() {
    if (this.machineId) {
      return;
    }

    this.machineId = await getMachineId();

    if (this.enabled) {
      // console.log("ANALYTICS IDENTIFY", this.machineId);
      this.analytics.identify({
        userId: this.machineId,
        traits: {
          ...this.traits,
          os: os.platform(),
          osVersion: os.release(),
          arch: os.arch(),
        },
      });
    }
  }

  public static noTelemetry() {
    return new Telemetry({
      writeKey: "--",
      enabled: false,
    });
  }

  async trackEvent(event: string, properties: Record<string, unknown> = {}) {
    await this.initialize();

    if (this.enabled) {
      // console.log("ANALYTICS TRACK", event, properties, this.machineId);
      this.analytics.track({
        userId: this.machineId,
        event,
        properties,
      });
    }
  }
}
