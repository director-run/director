import { AbstractClient } from "@director.run/mcp/client/abstract-client";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import { StdioClient } from "@director.run/mcp/client/stdio-client";
import type { OAuthProviderFactory } from "@director.run/mcp/oauth/oauth-provider-factory";
import {
  ProxyServer,
  type ProxyTarget,
} from "@director.run/mcp/proxy/proxy-server";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { Telemetry } from "@director.run/utilities/telemetry";
import {
  PROMPT_MANAGER_TARGET_NAME,
  type Prompt,
  PromptManager,
} from "../capabilities/prompt-manager";
import type { Database } from "../db/database";
import {
  type PlaybookHTTPTarget,
  PlaybookHTTPTargetSchema,
  type PlaybookParams,
  type PlaybookPlainObject,
  PlaybookSchema,
  type PlaybookStdioTarget,
  PlaybookStdioTargetSchema,
  type PlaybookTarget,
  PlaybookTargetSchema,
} from "./playbook-schema";

// Re-export all types and schemas
export type {
  PlaybookHTTPTarget,
  PlaybookStdioTarget,
  PlaybookTarget,
  PlaybookParams,
  PlaybookPlainObject,
};
export {
  PlaybookHTTPTargetSchema,
  PlaybookStdioTargetSchema,
  PlaybookTargetSchema,
  PlaybookSchema,
};

export class Playbook extends ProxyServer {
  private _database: Database;
  private _telemetry?: Telemetry;
  private _oAuthHandler?: OAuthProviderFactory;
  private _description?: string;
  private _name: string; // TODO: change to 'displayName'
  private _userId: string;

  constructor(
    attributes: PlaybookParams,
    params: {
      oAuthHandler?: OAuthProviderFactory;
      database: Database;
      telemetry?: Telemetry;
    },
  ) {
    super({
      id: attributes.id,
      servers: [
        ...attributes.servers.map((server) =>
          createClientForTarget({
            target: server,
            oAuthHandler: params?.oAuthHandler,
          }),
        ),
        new PromptManager(attributes.prompts),
      ],
    });

    this._name = attributes.name;
    this._description = attributes.description;
    this._userId = attributes.userId;
    this._oAuthHandler = params.oAuthHandler;
    this._database = params.database;
    this._telemetry = params.telemetry;
  }

  public get description() {
    return this._description;
  }

  get name() {
    return this._name;
  }

  get userId() {
    return this._userId;
  }

  get streamablePath() {
    return `/playbooks/${this.id}/mcp`;
  }

  public async addTarget(
    server: PlaybookTarget | ProxyTarget,
    params: { throwOnError: boolean } = { throwOnError: true },
  ): Promise<ProxyTarget> {
    await this.trackEvent("server_added");

    let target: ProxyTarget;

    if (server instanceof AbstractClient) {
      target = server;
    } else {
      target = createClientForTarget({
        target: server,
        oAuthHandler: this._oAuthHandler,
      });
    }

    await super.addTarget(target, params);
    await this.persistToConfig();

    return target;
  }

  public async removeTarget(serverName: string): Promise<ProxyTarget> {
    await this.trackEvent("server_removed");

    const removedTarget = await super.removeTarget(serverName);

    await this.persistToConfig();
    return removedTarget;
  }

  public async updateTarget(
    serverName: string,
    attributes: Partial<Pick<PlaybookTarget, "tools" | "disabled">>,
  ): Promise<ProxyTarget> {
    const target = await super.updateTarget(serverName, attributes);
    await this.persistToConfig();

    return target;
  }

  public async addPrompt(prompt: Prompt) {
    const promptManager = (await super.getTarget(
      PROMPT_MANAGER_TARGET_NAME,
    )) as PromptManager;
    const newPrompt = await promptManager.addPromptEntry(prompt);

    await this.persistToConfig();
    await this.sendListChangedEvents();

    return newPrompt;
  }

  public async removePrompt(promptName: string) {
    const promptManager = (await super.getTarget(
      PROMPT_MANAGER_TARGET_NAME,
    )) as PromptManager;
    await promptManager.removePromptEntry(promptName);

    await this.persistToConfig();
    await this.sendListChangedEvents();

    return true;
  }

  public async updatePrompt(
    promptName: string,
    prompt: Partial<Pick<Prompt, "title" | "description" | "body">>,
  ) {
    const promptManager = (await super.getTarget(
      PROMPT_MANAGER_TARGET_NAME,
    )) as PromptManager;
    const updatedPrompt = await promptManager.updatePrompt(promptName, prompt);

    await this.persistToConfig();
    await this.sendListChangedEvents();

    return updatedPrompt;
  }

  public async listPrompts(): Promise<Prompt[]> {
    const promptManager = (await super.getTarget(
      PROMPT_MANAGER_TARGET_NAME,
    )) as PromptManager;
    return promptManager.promptList;
  }

  public async update(
    attributes: Partial<Pick<PlaybookParams, "name" | "description">>,
  ) {
    await this.trackEvent("playbook_updated");

    const { name, description } = attributes;
    if (name !== undefined && name !== this._name) {
      if (name.trim() === "") {
        throw new AppError(ErrorCode.BAD_REQUEST, `Name cannot be empty`);
      }

      this._name = name;
    }
    if (description !== undefined && description !== this._description) {
      this._description = description;
    }
    await this.persistToConfig();

    return this;
  }

  static async fromConfig(
    attributes: PlaybookParams,
    params: {
      oAuthHandler?: OAuthProviderFactory;
      database: Database;
      telemetry?: Telemetry;
    },
  ): Promise<Playbook> {
    const playbook = new Playbook(attributes, {
      oAuthHandler: params.oAuthHandler,
      database: params.database,
      telemetry: params.telemetry,
    });
    await playbook.connectTargets();
    return playbook;
  }

  private async trackEvent(event: string): Promise<void> {
    if (this._telemetry) {
      await this._telemetry.trackEvent(event);
    }
  }

  private async persistToConfig(): Promise<void> {
    await this.persistToDatabase();
  }

  private async persistToDatabase(): Promise<void> {
    // Update playbook metadata
    await this._database.updatePlaybook(this.id, this.userId, {
      name: this.name,
      description: this.description,
    });

    // Get current servers from database
    const currentServers = await this._database.getServers(this.id);
    const currentServerNames = new Set(currentServers.map((s) => s.name));

    // Get current servers from memory
    const memoryServers = this.targets.filter(
      (target) => target instanceof HTTPClient || target instanceof StdioClient,
    );
    const memoryServerNames = new Set(memoryServers.map((s) => s.name));

    // Remove servers that are in database but not in memory
    for (const serverName of currentServerNames) {
      if (!memoryServerNames.has(serverName)) {
        await this._database.removeServer(this.id, serverName);
      }
    }

    // Add or update servers that are in memory
    for (const target of memoryServers) {
      const plainObject = await target.toPlainObject();
      const serverParams = this._database.targetToServerInsertParams(
        this.id,
        plainObject,
      );

      if (currentServerNames.has(target.name)) {
        // Update existing server
        await this._database.updateServer(this.id, target.name, serverParams);
      } else {
        // Add new server
        await this._database.addServer(serverParams);
      }
    }

    // Get current prompts from database
    const currentPrompts = await this._database.getPrompts(this.id);
    const currentPromptNames = new Set(currentPrompts.map((p) => p.name));

    // Get current prompts from memory
    const memoryPrompts = await this.listPrompts();
    const memoryPromptNames = new Set(memoryPrompts.map((p) => p.name));

    // Remove prompts that are in database but not in memory
    for (const promptName of currentPromptNames) {
      if (!memoryPromptNames.has(promptName)) {
        await this._database.removePrompt(this.id, promptName);
      }
    }

    // Add or update prompts that are in memory
    for (const prompt of memoryPrompts) {
      if (currentPromptNames.has(prompt.name)) {
        // Update existing prompt
        await this._database.updatePrompt(this.id, prompt.name, {
          title: prompt.title,
          description: prompt.description,
          body: prompt.body,
        });
      } else {
        // Add new prompt
        await this._database.addPrompt({
          playbookId: this.id,
          name: prompt.name,
          title: prompt.title,
          description: prompt.description,
          body: prompt.body,
        });
      }
    }
  }

  public async toPlainObject(): Promise<PlaybookPlainObject> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      userId: this.userId,
      prompts: await this.listPrompts(),
      servers: await Promise.all(
        this.targets
          .filter(
            (target) =>
              target instanceof HTTPClient || target instanceof StdioClient,
          )
          .map((target) =>
            target.toPlainObject({
              connectionInfo: true,
            }),
          ),
      ),
      paths: {
        streamable: this.streamablePath,
      },
    };
  }
}

function createClientForTarget(params: {
  target: PlaybookTarget;
  oAuthHandler?: OAuthProviderFactory;
}) {
  const { target, oAuthHandler } = params;
  switch (target.type) {
    case "http":
      return new HTTPClient(
        {
          url: target.url,
          name: target.name,
          source: target.source,
          tools: target.tools,
          prompts: target.prompts,
          disabled: target.disabled,
          headers: target.headers,
        },
        { oAuthHandler },
      );
    case "stdio":
      return new StdioClient({
        name: target.name,
        command: target.command,
        args: target.args,
        env: target.env,
        source: target.source,
        tools: target.tools,
        prompts: target.prompts,
        disabled: target.disabled,
      });
  }
}
