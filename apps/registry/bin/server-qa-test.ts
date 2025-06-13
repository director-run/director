import type {} from "../src/db/schema";
import { entries } from "../src/seed/entries";
import { runInteractiveTestForEntry } from "./test-entry";

const GATEWAY_URL = "http://reg.local:3673";

async function main() {
  const entry = entries[0];
  await runInteractiveTestForEntry({
    entry,
    gatewayUrl: GATEWAY_URL,
  });
}

main();

// Slack
// Notion
// Github
// Google Workspace
// - Email
// - Calenda
// Postgres
// Dropbox?
// Terminal
// Google Drive
// Google Calendar
// Stripe
// Obsidian
// Filesystem
// A browser one
// Google Maps
// Fetch - Web content fetching and conversion for efficient LLM usage (--ignore-robots-txt)
// Filesystem - Secure file operations with configurable access controls
// Git - Tools to read, search, and manipulate Git repositories
// Memory - Knowledge graph-based persistent memory system
// Sequential Thinking - Dynamic and reflective problem-solving through thought sequences
// Time - Time and timezone conversion capabilities
