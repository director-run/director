import { HTTPClient } from "@director.run/mcp/client/http-client";
import {
  OAuthProviderFactory,
  type OAuthProviderFactoryParams,
} from "@director.run/mcp/oauth/oauth-provider-factory";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { Telemetry } from "@director.run/utilities/telemetry";
import type { Config } from "../config";
import {
  Playbook,
  type PlaybookParams,
  type PlaybookTarget,
} from "./playbook";

const logger = getLogger("PlaybookStore");

export class PlaybookStore {
  private playbooks: Map<string, Playbook> = new Map();
  private config: Config;
  private telemetry: Telemetry;
  private _oauth?: OAuthProviderFactoryParams;
  private _onPlaybookListChange?: (playbookId: string) => Promise<void>;
  private _onPlaybookRemove?: (playbookId: string) => Promise<void>;

  private constructor(params: {
    config: Config;
    telemetry?: Telemetry;
    oauth?: OAuthProviderFactoryParams;
    onPlaybookListChange?: (playbookId: string) => Promise<void>;
    onPlaybookRemove?: (playbookId: string) => Promise<void>;
  }) {
    this.config = params.config;
    this.telemetry = params.telemetry || Telemetry.noTelemetry();
    this._oauth = params.oauth;
    this._onPlaybookListChange = params.onPlaybookListChange;
    this._onPlaybookRemove = params.onPlaybookRemove;
  }

  public static async create({
    config,
    telemetry,
    oauth,
    onPlaybookListChange,
    onPlaybookRemove,
  }: {
    config: Config;
    telemetry?: Telemetry;
    oauth?: OAuthProviderFactoryParams;
    onPlaybookListChange?: (playbookId: string) => Promise<void>;
    onPlaybookRemove?: (playbookId: string) => Promise<void>;
  }): Promise<PlaybookStore> {
    logger.debug("initializing PlaybookStore");
    const store = new PlaybookStore({
      config,
      telemetry,
      oauth,
      onPlaybookListChange,
      onPlaybookRemove,
    });
    await store.initialize();
    logger.debug("initialization complete");
    return store;
  }

  private async initialize(): Promise<void> {
    let playbooks = await this.config.playbooks.all();

    for (const playbookConfig of playbooks) {
      const playbookId = playbookConfig.id;
      logger.debug({ message: `initializing ${playbookId}`, playbookId });

      await this.initializeAndAddPlaybook({
        id: playbookId,
        name: playbookConfig.name,
        description: playbookConfig.description ?? undefined,
        servers: playbookConfig.servers,
      });
    }
  }

  public get(playbookId: string) {
    const server = this.playbooks.get(playbookId);
    if (!server) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `playbook '${playbookId}' not found or failed to initialize.`,
      );
    }
    return server;
  }

  async delete(playbookId: string) {
    this.telemetry.trackEvent("playbook_deleted");
    const playbook = this.get(playbookId);
    for (const server of playbook.targets) {
      if (server instanceof HTTPClient && (await server.isAuthenticated())) {
        await server.logout();
      }
    }
    await playbook.close();
    await this.config.playbooks.remove(playbookId);
    this.playbooks.delete(playbookId);

    await this._onPlaybookRemove?.(playbookId);
    logger.info(`successfully deleted playbook configuration: ${playbookId}`);
  }

  async purge() {
    await this.closeAll();
    await this.config.purge();
    this.playbooks.clear();
  }

  async closeAll() {
    logger.info("cleaning up all playbooks...");
    await Promise.all(
      Array.from(this.playbooks.values()).map((playbook) => playbook.close()),
    );
    logger.info("finished cleaning up all playbooks.");
  }

  public getAll(): Playbook[] {
    return Array.from(this.playbooks.values());
  }

  public async onAuthorizationSuccess(
    factoryId: string,
    providerId: string,
    code: string,
  ) {
    const playbook = await this.get(factoryId);
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
    name,
    description,
    servers,
  }: {
    name: string;
    description?: string;
    servers?: PlaybookTarget[];
  }): Promise<Playbook> {
    this.telemetry.trackEvent("playbook_created");

    const configEntry = await this.config.playbooks.create({
      name,
      description,
      servers: servers ?? [],
    });
    const playbook = await this.initializeAndAddPlaybook({
      name,
      description,
      servers: servers ?? [],
      id: configEntry.id,
    });
    logger.info({ message: `Created new playbook`, playbookId: configEntry.id });
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
      config: this.config,
    });

    this.playbooks.set(playbook.id, playbook);

    if (this._onPlaybookListChange) {
      playbook.setListChangeListner(this._onPlaybookListChange);
    }

    return playbook;
  }
}
