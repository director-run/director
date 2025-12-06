import fs from "node:fs";
import path from "node:path";
import { env } from "../config";

export function saveAuthToken(sessionCookie: string): void {
  const dirPath = path.dirname(env.AUTH_TOKEN_FILE);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(env.AUTH_TOKEN_FILE, sessionCookie, { mode: 0o600 });
}

export function getAuthToken(): string | null {
  try {
    if (fs.existsSync(env.AUTH_TOKEN_FILE)) {
      return fs.readFileSync(env.AUTH_TOKEN_FILE, "utf-8");
    }
  } catch (_error) {
    // Ignore errors
  }
  return null;
}

export function clearAuthToken(): void {
  try {
    if (fs.existsSync(env.AUTH_TOKEN_FILE)) {
      fs.unlinkSync(env.AUTH_TOKEN_FILE);
    }
  } catch (_error) {
    // Ignore errors
  }
}
