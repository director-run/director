import { HTTPClient } from "@director.run/mcp/client/http-client";
import {
  OAuthProviderFactory,
  type OAuthProviderFactoryParams,
} from "@director.run/mcp/oauth/oauth-provider-factory";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { Telemetry } from "@director.run/utilities/telemetry";
import type { Database } from "../db/database";
import { Playbook, type PlaybookParams, type PlaybookTarget } from "./playbook";

const logger = getLogger("PlaybookStore");

export class PlaybookStore {
  private playbooks: Map<string, Playbook> = new Map();
  private database: Database;
  private telemetry: Telemetry;
  private _oauth?: OAuthProviderFactoryParams;

  private constructor(params: {
    database: Database;
    telemetry?: Telemetry;
    oauth?: OAuthProviderFactoryParams;
  }) {
    this.database = params.database;
    this.telemetry = params.telemetry || Telemetry.noTelemetry();
    this._oauth = params.oauth;
  }

  public static async create({
    database,
    telemetry,
    oauth,
  }: {
    database: Database;
    telemetry?: Telemetry;
    oauth?: OAuthProviderFactoryParams;
  }): Promise<PlaybookStore> {
    logger.debug("initializing PlaybookStore");
    const store = new PlaybookStore({
      database,
      telemetry,
      oauth,
    });
    await store.initialize();
    logger.debug("initialization complete");
    return store;
  }

  private async initialize(): Promise<void> {
    // Load from database
    const database = this.database;
    const dbPlaybooks = await database.getAllPlaybooks("");
    const playbooks = await Promise.all(
      dbPlaybooks.map(async (dbPlaybook) => {
        const servers = await database.getServers(dbPlaybook.id);
        const prompts = await database.getPrompts(dbPlaybook.id);
        return {
          id: dbPlaybook.id,
          name: dbPlaybook.name,
          description: dbPlaybook.description ?? undefined,
          userId: dbPlaybook.userId,
          servers: servers.map((s) => database.serverRowToTarget(s)),
          prompts: prompts.map((p) => ({
            name: p.name,
            title: p.title,
            description: p.description ?? undefined,
            body: p.body,
          })),
        };
      }),
    );

    for (const playbookConfig of playbooks) {
      const playbookId = playbookConfig.id;
      logger.debug({ message: `initializing ${playbookId}`, playbookId });

      await this.initializeAndAddPlaybook({
        id: playbookId,
        name: playbookConfig.name,
        description: playbookConfig.description ?? undefined,
        userId: playbookConfig.userId,
        servers: playbookConfig.servers,
        prompts: playbookConfig.prompts,
      });
    }
  }

  public async get(playbookId: string, userId: string): Promise<Playbook> {
    // Check if already in memory
    let playbook = this.playbooks.get(playbookId);

    // If not in memory, try to load from database
    if (!playbook) {
      const dbPlaybook = await this.database.getPlaybookWithDetails(
        playbookId,
        userId,
      );

      playbook = await this.initializeAndAddPlaybook({
        id: dbPlaybook.id,
        name: dbPlaybook.name,
        description: dbPlaybook.description ?? undefined,
        userId: dbPlaybook.userId,
        servers: dbPlaybook.servers,
        prompts: dbPlaybook.prompts,
      });
    }

    // Verify user owns this playbook
    if (playbook.userId !== userId) {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        `You do not have permission to access this playbook.`,
      );
    }

    return playbook;
  }

  public getByIdOnly(playbookId: string) {
    const server = this.playbooks.get(playbookId);
    if (!server) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `playbook '${playbookId}' not found or failed to initialize.`,
      );
    }

    return server;
  }

  async delete(playbookId: string, userId: string) {
    this.telemetry.trackEvent("playbook_deleted");
    const playbook = await this.get(playbookId, userId);
    for (const server of playbook.targets) {
      if (server instanceof HTTPClient && (await server.isAuthenticated())) {
        await server.logout();
      }
    }
    await playbook.close();
    await this.database.deletePlaybook(playbookId, userId);
    this.playbooks.delete(playbookId);

    logger.info(`successfully deleted playbook configuration: ${playbookId}`);
  }

  async closeAll() {
    logger.info("cleaning up all playbooks...");
    await Promise.all(
      Array.from(this.playbooks.values()).map((playbook) => playbook.close()),
    );
    logger.info("finished cleaning up all playbooks.");
  }

  /**
   * Clears the in-memory cache. For use in test environments only.
   */
  clearCache() {
    this.playbooks.clear();
  }

  public async getAll(userId: string): Promise<Playbook[]> {
    // Load user's playbooks from database that aren't in memory yet
    const dbPlaybooks = await this.database.getAllPlaybooks(userId);

    for (const dbPlaybook of dbPlaybooks) {
      if (!this.playbooks.has(dbPlaybook.id)) {
        const servers = await this.database.getServers(dbPlaybook.id);
        const prompts = await this.database.getPrompts(dbPlaybook.id);

        await this.initializeAndAddPlaybook({
          id: dbPlaybook.id,
          name: dbPlaybook.name,
          description: dbPlaybook.description ?? undefined,
          userId: dbPlaybook.userId,
          servers: servers.map((s) => this.database.serverRowToTarget(s)),
          prompts: prompts.map((p) => ({
            name: p.name,
            title: p.title,
            description: p.description ?? undefined,
            body: p.body,
          })),
        });
      }
    }

    return Array.from(this.playbooks.values()).filter(
      (playbook) => playbook.userId === userId,
    );
  }

  public async onAuthorizationSuccess(
    factoryId: string,
    providerId: string,
    code: string,
    userId: string,
  ) {
    const playbook = await this.get(factoryId, userId);
    const target = await playbook.getTarget(providerId);

    if (target instanceof HTTPClient) {
      await target.completeAuthFlow(code);
    } else {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `target ${providerId} is not an HTTP client`,
      );
    }
  }

  public async create({
    id,
    name,
    description,
    servers,
    userId,
  }: {
    id?: string;
    name: string;
    description?: string;
    servers?: PlaybookTarget[];
    userId: string;
  }): Promise<Playbook> {
    this.telemetry.trackEvent("playbook_created");

    const dbPlaybook = await this.database.createPlaybook({
      id,
      name,
      description,
      userId,
    });
    const playbookId = dbPlaybook.id;

    // Create servers
    for (const server of servers ?? []) {
      await this.database.addServer(
        this.database.targetToServerInsertParams(playbookId, server),
      );
    }

    const playbook = await this.initializeAndAddPlaybook({
      name,
      description,
      userId,
      servers: servers ?? [],
      id: playbookId,
    });
    logger.info({
      message: `Created new playbook`,
      playbookId,
      userId,
    });
    return playbook;
  }

  private async initializeAndAddPlaybook(playbookParams: PlaybookParams) {
    const playbook = await Playbook.fromConfig(playbookParams, {
      oAuthHandler: this._oauth
        ? new OAuthProviderFactory({
            ...this._oauth,
            id: playbookParams.id,
          })
        : undefined,
      database: this.database,
    });

    this.playbooks.set(playbook.id, playbook);

    return playbook;
  }
}
