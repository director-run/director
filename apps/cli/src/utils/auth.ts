import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const AUTH_TOKEN_FILE = path.join(os.homedir(), ".director", "auth");

export function saveAuthToken(sessionCookie: string): void {
  const dirPath = path.dirname(AUTH_TOKEN_FILE);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(AUTH_TOKEN_FILE, sessionCookie, { mode: 0o600 });
}

export function getAuthToken(): string | null {
  try {
    if (fs.existsSync(AUTH_TOKEN_FILE)) {
      return fs.readFileSync(AUTH_TOKEN_FILE, "utf-8");
    }
  } catch (_error) {
    // Ignore errors
  }
  return null;
}

export function clearAuthToken(): void {
  try {
    if (fs.existsSync(AUTH_TOKEN_FILE)) {
      fs.unlinkSync(AUTH_TOKEN_FILE);
    }
  } catch (_error) {
    // Ignore errors
  }
}
