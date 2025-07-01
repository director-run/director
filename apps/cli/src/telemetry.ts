import { exec } from "child_process";
import { createHash } from "crypto";
import { isProduction } from "@director.run/utilities/env";
import { HKEY, enumerateValues } from "registry-js";
import { env } from "./env";

type platform = "darwin" | "win32" | "linux" | "freebsd";

const platformToCmdMap: { [key: string]: string } = {
  darwin: "ioreg -rd1 -c IOPlatformExpertDevice",
  linux:
    "( cat /var/lib/dbus/machine-id /etc/machine-id 2> /dev/null || hostname ) | head -n 1 || :",
  freebsd: "kenv -q smbios.system.uuid || sysctl -n kern.hostuuid",
};

const { platform } = process;

const hash = (guid: string) => createHash("sha256").update(guid).digest("hex");

function format(result: string): string {
  switch (platform) {
    case "darwin":
      return result
        .split("IOPlatformUUID")[1]
        .split("\n")[0]
        .replace(/\=|\s+|\"/gi, "")
        .toLowerCase();
    case "linux":
      return result
        .toString()
        .replace(/\r+|\n+|\s+/gi, "")
        .toLowerCase();
    case "freebsd":
      return result
        .toString()
        .replace(/\r+|\n+|\s+/gi, "")
        .toLowerCase();
    default:
      return result;
  }
}

const execCmd = (cmd: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout) => {
      if (err) {
        return reject(
          new Error(`Error while obtaining machine id: ${err.stack}`),
        );
      }
      return resolve(stdout.toString());
    });
  });
};

const getMachineIdFromRegistry = () => {
  const values = enumerateValues(
    HKEY.HKEY_LOCAL_MACHINE,
    "SOFTWARE\\Microsoft\\Cryptography",
  );
  const machineGuidObj = values?.find((v) => v.name === "MachineGuid");
  if (machineGuidObj) {
    const { data } = machineGuidObj;
    return String(data);
  } else {
    throw new Error("Error while obtaining MachineGuid from registry");
  }
};

export async function getMachineId(original: boolean = false) {
  let result: string;
  if (platform === "win32") {
    result = getMachineIdFromRegistry();
  } else if (["darwin", "linux", "freebsd"].includes(platform)) {
    result = await execCmd(platformToCmdMap[platform]);
  } else {
    throw new Error(`Unsupported platform: ${process.platform}`);
  }

  result = format(result);

  return original ? result : hash(result);
}

export async function trackEvent(eventName: string) {
  const distinctId = await getMachineId();

  if (isProduction()) {
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
