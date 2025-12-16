import { t } from "@director.run/utilities/trpc";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { oauthApplicationTable, verificationTable } from "../../db/schema";
import { type AuthenticatedGatewayContext, protectedProcedure } from "./index";

/**
 * Router for auth-related operations.
 */
export function createAuthRouter() {
  return t.router({
    /**
     * Get consent info for a consent_code.
     *
     * This is used by the consent page to display the redirect_uri,
     * which is not included in the URL params by better-auth.
     *
     * Returns: { redirectUri, clientId, scope } or null if not found/expired
     */
    getConsentInfo: protectedProcedure
      .input(z.object({ consentCode: z.string() }))
      .query(async ({ ctx, input }) => {
        const { database, userId } = ctx as AuthenticatedGatewayContext;
        const db = database.drizzle;

        // Look up the verification value by consent_code (identifier)
        const result = await db
          .select()
          .from(verificationTable)
          .where(eq(verificationTable.identifier, input.consentCode))
          .limit(1);

        if (!result.length) {
          return null;
        }

        const verification = result[0];

        // Check if expired
        if (new Date(verification.expiresAt) < new Date()) {
          return null;
        }

        // Parse the stored JSON value
        try {
          const value = JSON.parse(verification.value) as {
            clientId: string;
            redirectURI: string;
            scope: string[];
            userId: string;
            requireConsent: boolean;
          };

          // Security: Only return info if the consent belongs to the current user
          if (value.userId !== userId) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Consent does not belong to current user",
            });
          }

          // Fetch the friendly client name from the OAuth application table
          let clientName: string | null = null;
          const appResult = await db
            .select({ name: oauthApplicationTable.name })
            .from(oauthApplicationTable)
            .where(eq(oauthApplicationTable.clientId, value.clientId))
            .limit(1);

          if (appResult.length > 0) {
            clientName = appResult[0].name;
          }

          return {
            redirectUri: value.redirectURI,
            clientId: value.clientId,
            clientName,
            scope: value.scope,
          };
        } catch {
          return null;
        }
      }),
  });
}
