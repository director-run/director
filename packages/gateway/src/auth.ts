import { getLogger } from "@director.run/utilities/logger";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { encrypt } from "./crypto";
import * as schema from "./db/schema";
import { env } from "./env";

const logger = getLogger("auth");

const pool = new Pool({ connectionString: env.DATABASE_URL });
const db = drizzle(pool, { schema });

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.userTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
      apikey: schema.apikeyTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  trustedOrigins: [env.BASE_URL, ...env.ALLOWED_ORIGINS],
  user: {
    additionalFields: {
      status: {
        type: "string",
        required: false,
        defaultValue: "PENDING",
        input: false, // don't allow user to set status
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Create a default API key for the new user and store encrypted
          try {
            const result = await auth.api.createApiKey({
              body: {
                name: "default",
                userId: user.id,
              },
            });

            if (result.key) {
              // Store the encrypted API key on the user record
              const encryptedKey = encrypt(result.key, env.BETTER_AUTH_SECRET);
              await db
                .update(schema.userTable)
                .set({ encryptedApiKey: encryptedKey })
                .where(eq(schema.userTable.id, user.id));

              logger.debug({
                message: "created and stored default API key for new user",
                userId: user.id,
              });
            }
          } catch (error) {
            logger.error({
              message: "failed to create default API key for new user",
              userId: user.id,
              error,
            });
          }
        },
      },
    },
  },
  plugins: [
    apiKey({
      defaultPrefix: "dk_",
      // Allow API key to be passed via query param as well as header
      customAPIKeyGetter: (ctx) => {
        // First check header
        const headerKey = ctx.headers?.get("x-api-key");
        if (headerKey) {
          return headerKey;
        }
        // Fall back to query parameter
        if (ctx.request?.url) {
          const url = new URL(ctx.request.url);
          const queryKey = url.searchParams.get("key");
          if (queryKey && queryKey.startsWith("dk_")) {
            return queryKey;
          }
        }
        return null;
      },
      // Enable session creation from API keys so middleware can get userId
      enableSessionForAPIKeys: true,
      // Enable rate limiting for API keys to prevent brute force and DoS attacks
      // These limits are generous enough for normal MCP usage while preventing abuse
      // Configurable via API_KEY_RATE_LIMIT_WINDOW_SECONDS and API_KEY_RATE_LIMIT_MAX_REQUESTS
      rateLimit: {
        enabled: true,
        timeWindow: env.API_KEY_RATE_LIMIT_WINDOW_SECONDS * 1000,
        maxRequests: env.API_KEY_RATE_LIMIT_MAX_REQUESTS,
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
