import { AbstractOAuthStorage } from "@director.run/mcp/oauth/storage/abstract-oauth-storage";
import { getLogger } from "@director.run/utilities/logger";
import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { and, eq } from "drizzle-orm";
import type { Database } from "./database";
import { oauthCredentialsTable } from "./schema";

const logger = getLogger("oauth/storage/database");

export class DatabaseOAuthStorage extends AbstractOAuthStorage {
  private _database: Database;
  private _userId: string;

  constructor(params: { database: Database; userId: string }) {
    super();
    this._database = params.database;
    this._userId = params.userId;
  }

  async getClientInformation(
    providerId: string,
  ): Promise<OAuthClientInformationFull | undefined> {
    const rows = await this._database.drizzle
      .select({ clientInformation: oauthCredentialsTable.clientInformation })
      .from(oauthCredentialsTable)
      .where(
        and(
          eq(oauthCredentialsTable.userId, this._userId),
          eq(oauthCredentialsTable.providerId, providerId),
        ),
      )
      .limit(1);

    if (rows.length === 0 || !rows[0].clientInformation) {
      logger.debug({
        message: "no client information found in database",
        providerId,
        userId: this._userId,
      });
      return undefined;
    }

    logger.info({
      message: "loaded client information from database",
      providerId,
      userId: this._userId,
    });
    return rows[0].clientInformation as OAuthClientInformationFull;
  }

  async saveClientInformation(
    providerId: string,
    clientInformation: OAuthClientInformationFull,
  ): Promise<void> {
    logger.info({
      message: "saving client information to database",
      providerId,
      userId: this._userId,
    });

    await this._database.drizzle
      .insert(oauthCredentialsTable)
      .values({
        userId: this._userId,
        providerId,
        clientInformation,
      })
      .onConflictDoUpdate({
        target: [
          oauthCredentialsTable.userId,
          oauthCredentialsTable.providerId,
        ],
        set: {
          clientInformation,
          updatedAt: new Date(),
        },
      });
  }

  async getTokens(providerId: string): Promise<OAuthTokens | undefined> {
    const rows = await this._database.drizzle
      .select({ tokens: oauthCredentialsTable.tokens })
      .from(oauthCredentialsTable)
      .where(
        and(
          eq(oauthCredentialsTable.userId, this._userId),
          eq(oauthCredentialsTable.providerId, providerId),
        ),
      )
      .limit(1);

    if (rows.length === 0 || !rows[0].tokens) {
      logger.debug({
        message: "no tokens found in database",
        providerId,
        userId: this._userId,
      });
      return undefined;
    }

    logger.info({
      message: "loaded tokens from database",
      providerId,
      userId: this._userId,
    });
    return rows[0].tokens as OAuthTokens;
  }

  async saveTokens(providerId: string, tokens: OAuthTokens): Promise<void> {
    logger.info({
      message: "saving tokens to database",
      providerId,
      userId: this._userId,
    });

    await this._database.drizzle
      .insert(oauthCredentialsTable)
      .values({
        userId: this._userId,
        providerId,
        tokens,
      })
      .onConflictDoUpdate({
        target: [
          oauthCredentialsTable.userId,
          oauthCredentialsTable.providerId,
        ],
        set: {
          tokens,
          updatedAt: new Date(),
        },
      });
  }

  async deleteTokens(providerId: string): Promise<void> {
    logger.info({
      message: "deleting tokens from database",
      providerId,
      userId: this._userId,
    });

    await this._database.drizzle
      .update(oauthCredentialsTable)
      .set({
        tokens: null,
        codeVerifier: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(oauthCredentialsTable.userId, this._userId),
          eq(oauthCredentialsTable.providerId, providerId),
        ),
      );
  }

  async getCodeVerifier(providerId: string): Promise<string | undefined> {
    const rows = await this._database.drizzle
      .select({ codeVerifier: oauthCredentialsTable.codeVerifier })
      .from(oauthCredentialsTable)
      .where(
        and(
          eq(oauthCredentialsTable.userId, this._userId),
          eq(oauthCredentialsTable.providerId, providerId),
        ),
      )
      .limit(1);

    if (rows.length === 0 || !rows[0].codeVerifier) {
      logger.debug({
        message: "no code verifier found in database",
        providerId,
        userId: this._userId,
      });
      return undefined;
    }

    logger.info({
      message: "loaded code verifier from database",
      providerId,
      userId: this._userId,
    });
    return rows[0].codeVerifier;
  }

  async saveCodeVerifier(
    providerId: string,
    codeVerifier: string,
  ): Promise<void> {
    logger.info({
      message: "saving code verifier to database",
      providerId,
      userId: this._userId,
    });

    await this._database.drizzle
      .insert(oauthCredentialsTable)
      .values({
        userId: this._userId,
        providerId,
        codeVerifier,
      })
      .onConflictDoUpdate({
        target: [
          oauthCredentialsTable.userId,
          oauthCredentialsTable.providerId,
        ],
        set: {
          codeVerifier,
          updatedAt: new Date(),
        },
      });
  }
}
