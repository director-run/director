#!/usr/bin/env -S node --no-warnings --enable-source-maps

import { env } from "../src/config";

async function seed() {
  const baseUrl = `http://localhost:${env.PORT}`;
  const url = `${baseUrl}/api/management/seed`;

  if (!env.MANAGEMENT_API_KEY) {
    console.error("Error: MANAGEMENT_API_KEY is not set");
    process.exit(1);
  }

  console.log(`Seeding database via ${url}...`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MANAGEMENT_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Seed failed with status ${response.status}: ${error}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log("Seed completed successfully:", result);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
