import type {} from "../src/db/schema";
import { pureEntries } from "../src/seed/entries";
import { runInteractiveTestForEntry } from "./test-entry";

const GATEWAY_URL = "http://reg.local:3673";

async function main() {
  const entry = pureEntries[pureEntries.length - 1];
  await runInteractiveTestForEntry({
    entry,
    gatewayUrl: GATEWAY_URL,
    openHomepage: true,
  });
}

main();

// Slack

// Postgres
// Dropbox?
// Terminal?
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

// Gmail
// Google Calendar
// Google Drive
// Google Calendar

// -- Notion
// -- Github
// -- Hackernews
