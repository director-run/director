import { createOpenAI } from "@ai-sdk/openai";
import { getLogger } from "@director.run/utilities/logger";
import type { inferRouterOutputs } from "@trpc/server";
import { generateObject } from "ai";
import z from "zod";
import type { RegistryClient } from "../client";
import { env } from "../config";
import { type AppRouter } from "../routers/trpc";
import prompt from "./enrich-transport-prompt.txt";

type Entry =
  inferRouterOutputs<AppRouter>["entries"]["getEntries"]["entries"][number];

const logger = getLogger("enrich/transports");

export async function enrichEntryTransports(registryClient: RegistryClient) {
  // TODO: make sure they have a readme?
  const entries = await registryClient.entries.getEntries.query({
    pageIndex: 0,
    pageSize: 1000,
  });

  const enrichedEntries = [];
  const failedEntries = [];

  for (const entry of entries.entries) {
    const transport = await extractTransportForEntry(registryClient, entry);
    if (!transport) {
      logger.error(`no transport found for ${entry.name}`);
      await registryClient.entries.updateEntry.mutate({
        id: entry.id,
        transport: {
          type: "http",
          url: "https://couldnt-find-a-transport.com",
        },
        parameters: [],
      });
      failedEntries.push(entry);
      continue;
    }

    logger.info(
      `enriching ${entry.name} with transport ${transport.transport.type}`,
    );
    await registryClient.entries.updateEntry.mutate({
      id: entry.id,
      transport: transport.transport,
      parameters: transport.parameters.map((parameter) => ({
        name: parameter.name,
        type: "string",
        description: parameter.description,
        required: parameter.required,
        password: parameter.password,
      })),
    });
    enrichedEntries.push(entry);
  }

  logger.info(
    JSON.stringify(
      {
        total: entries.entries.length,
        enriched: enrichedEntries.length,
        failed: failedEntries.length,
      },
      null,
      2,
    ),
  );
}

const schema = z.object({
  transports: z.array(
    z.object({
      transport: z.union([
        z.object({
          type: z.literal("stdio"),
          command: z.string(),
          args: z.array(z.string()),
          env: z.record(z.string(), z.string()).default({}),
        }),
        z.object({
          type: z.literal("http"),
          url: z.string(),
          headers: z.record(z.string(), z.string()).default({}),
        }),
      ]),
      parameters: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          description: z.string(),
          required: z.boolean(),
          password: z.boolean().optional().default(false),
          example: z.string().optional().default(""),
          default: z.string().optional().default(""),
        }),
      ),
    }),
  ),
});

type ObjectSchema = z.infer<typeof schema>;

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
});

async function extractTransportForEntry(
  registryClient: RegistryClient,
  entry: Entry,
): Promise<ObjectSchema["transports"][number] | null> {
  const { readme } = await registryClient.entries.getEntryByName.query({
    name: entry.name,
  });

  if (!readme) {
    return null;
  }

  const { object } = await generateObject({
    model: openai("gpt-4-turbo"),
    schema,
    prompt: prompt
      .replace("{REPLACE_WITH_README}", readme)
      .replace("{PREFERRED_TRANSPORT}", entry.transport.type),
  });

  const transports = object.transports.map((transport) => {
    transport.parameters = transport.parameters.filter((parameter) => {
      let exists = false;
      if (transport.transport.type === "stdio") {
        if (
          transport.transport.args.some((it) => it.includes(parameter.name))
        ) {
          exists = true;
        }
        if (
          Object.values(transport.transport.env).some((it) =>
            it.includes(parameter.name),
          )
        ) {
          exists = true;
        }
      }

      if (transport.transport.type === "http") {
        if (
          Object.values(transport.transport.headers).some((it) =>
            it.includes(parameter.name),
          )
        ) {
          exists = true;
        }
      }

      return exists;
    });

    return transport;
  });

  const matchingType = transports.find(
    (transport) => transport.transport.type === entry.transport.type,
  );

  return matchingType ?? null;
}
