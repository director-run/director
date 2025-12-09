import fs from "node:fs";
import path from "node:path";
import { login } from "@director.run/gateway/client";
import { input, password as passwordPrompt } from "@inquirer/prompts";
import chalk from "chalk";
import { env } from "../env";

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

export interface LoginFlowResult {
  success: boolean;
  userName?: string;
}

/**
 * Prompts the user for credentials (unless provided via env vars) and attempts
 * to log in. Saves the auth token on success.
 *
 * @returns Result indicating success/failure and user name if successful
 */
export async function runLoginFlow(): Promise<LoginFlowResult> {
  console.log(
    chalk.yellow("\nYour session has expired. Please log in again.\n"),
  );

  const email =
    env.USER_EMAIL ??
    (await input({
      message: "Email:",
      validate: (value) => {
        if (!value.includes("@")) {
          return "Please enter a valid email address";
        }
        return true;
      },
    }));

  const password =
    env.USER_PASSWORD ??
    (await passwordPrompt({
      message: "Password:",
      mask: "*",
    }));

  try {
    const result = await login(env.GATEWAY_URL, { email, password });
    saveAuthToken(result.sessionCookie);
    console.log(chalk.green("\n✓ Logged in successfully!"));
    return { success: true, userName: result.user.email };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown login error";
    console.log(chalk.red(`\n✗ Authentication failed: ${message}`));
    console.log(
      chalk.dim("Please check your credentials and try again with: ") +
        chalk.cyan("director login"),
    );
    return { success: false };
  }
}
