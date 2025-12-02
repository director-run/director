import { AppError, ErrorCode } from "@director.run/utilities/error";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { PlaybookTarget } from "../playbooks/playbook-schema";
import {
  type PlaybookInsertParams,
  type PlaybookPromptInsertParams,
  type PlaybookServerInsertParams,
  apikeyTable,
  playbookPromptsTable,
  playbookServersTable,
  playbooksTable,
  userTable,
} from "./schema";
import * as schema from "./schema";

export class Database {
  private pool: Pool;
  private _drizzle: ReturnType<typeof drizzle>;

  private constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this._drizzle = drizzle(this.pool, { schema });
  }

  public static create(connectionString: string): Database {
    return new Database(connectionString);
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  /** Direct access to drizzle instance for advanced operations */
  public get drizzle() {
    return this._drizzle;
  }

  public async getPlaybookById(id: string, userId: string) {
    const playbook = await this._drizzle
      .select()
      .from(playbooksTable)
      .where(and(eq(playbooksTable.id, id), eq(playbooksTable.userId, userId)))
      .limit(1);

    if (playbook.length === 0) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Playbook with id '${id}' not found`,
      );
    }

    return playbook[0];
  }

  public async getPlaybookWithDetails(id: string, userId: string) {
    const playbook = await this.getPlaybookById(id, userId);
    const servers = await this.getServers(id);
    const prompts = await this.getPrompts(id);

    return {
      ...playbook,
      servers: servers.map((s) => this.serverRowToTarget(s)),
      prompts: prompts.map((p) => ({
        name: p.name,
        title: p.title,
        description: p.description ?? undefined,
        body: p.body,
      })),
    };
  }

  public async getAllPlaybooks(userId: string) {
    return await this._drizzle
      .select()
      .from(playbooksTable)
      .where(eq(playbooksTable.userId, userId));
  }

  public async createPlaybook(
    playbook: Omit<PlaybookInsertParams, "id"> & { id?: string },
  ) {
    const id = playbook.id || crypto.randomUUID();
    return (
      await this._drizzle
        .insert(playbooksTable)
        .values({ ...playbook, id })
        .returning()
    )[0];
  }

  public async updatePlaybook(
    id: string,
    userId: string,
    playbook: Partial<PlaybookInsertParams>,
  ) {
    await this._drizzle
      .update(playbooksTable)
      .set({ ...playbook, updatedAt: new Date() })
      .where(and(eq(playbooksTable.id, id), eq(playbooksTable.userId, userId)));
  }

  public async deletePlaybook(id: string, userId: string) {
    await this._drizzle
      .delete(playbooksTable)
      .where(and(eq(playbooksTable.id, id), eq(playbooksTable.userId, userId)));
  }

  public async activateUser(userId: string) {
    await this._drizzle
      .update(userTable)
      .set({ status: "ACTIVE" })
      .where(eq(userTable.id, userId));
  }

  public async getUser(userId: string) {
    const users = await this._drizzle
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    return users[0] ?? null;
  }

  public async updateUserEncryptedApiKey(
    userId: string,
    encryptedApiKey: string,
  ) {
    await this._drizzle
      .update(userTable)
      .set({ encryptedApiKey })
      .where(eq(userTable.id, userId));
  }

  // API key operations
  public async getApiKeysByUserId(userId: string) {
    return await this._drizzle
      .select()
      .from(apikeyTable)
      .where(eq(apikeyTable.userId, userId));
  }

  public async deleteApiKey(keyId: string) {
    await this._drizzle.delete(apikeyTable).where(eq(apikeyTable.id, keyId));
  }

  // Server operations
  public async getServers(playbookId: string) {
    return await this._drizzle
      .select()
      .from(playbookServersTable)
      .where(eq(playbookServersTable.playbookId, playbookId));
  }

  public async getServerByName(playbookId: string, name: string) {
    const servers = await this._drizzle
      .select()
      .from(playbookServersTable)
      .where(
        and(
          eq(playbookServersTable.playbookId, playbookId),
          eq(playbookServersTable.name, name),
        ),
      )
      .limit(1);

    if (servers.length === 0) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Server '${name}' not found in playbook '${playbookId}'`,
      );
    }

    return servers[0];
  }

  public async addServer(server: PlaybookServerInsertParams) {
    return (
      await this._drizzle
        .insert(playbookServersTable)
        .values(server)
        .returning()
    )[0];
  }

  public async updateServer(
    playbookId: string,
    serverName: string,
    server: Partial<PlaybookServerInsertParams>,
  ) {
    await this._drizzle
      .update(playbookServersTable)
      .set({ ...server, updatedAt: new Date() })
      .where(
        and(
          eq(playbookServersTable.playbookId, playbookId),
          eq(playbookServersTable.name, serverName),
        ),
      );
  }

  public async removeServer(playbookId: string, serverName: string) {
    await this._drizzle
      .delete(playbookServersTable)
      .where(
        and(
          eq(playbookServersTable.playbookId, playbookId),
          eq(playbookServersTable.name, serverName),
        ),
      );
  }

  // Prompt operations
  public async getPrompts(playbookId: string) {
    return await this._drizzle
      .select()
      .from(playbookPromptsTable)
      .where(eq(playbookPromptsTable.playbookId, playbookId));
  }

  public async getPromptByName(playbookId: string, name: string) {
    const prompts = await this._drizzle
      .select()
      .from(playbookPromptsTable)
      .where(
        and(
          eq(playbookPromptsTable.playbookId, playbookId),
          eq(playbookPromptsTable.name, name),
        ),
      )
      .limit(1);

    if (prompts.length === 0) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        `Prompt '${name}' not found in playbook '${playbookId}'`,
      );
    }

    return prompts[0];
  }

  public async addPrompt(prompt: PlaybookPromptInsertParams) {
    return (
      await this._drizzle
        .insert(playbookPromptsTable)
        .values(prompt)
        .returning()
    )[0];
  }

  public async updatePrompt(
    playbookId: string,
    promptName: string,
    prompt: Partial<PlaybookPromptInsertParams>,
  ) {
    await this._drizzle
      .update(playbookPromptsTable)
      .set({ ...prompt, updatedAt: new Date() })
      .where(
        and(
          eq(playbookPromptsTable.playbookId, playbookId),
          eq(playbookPromptsTable.name, promptName),
        ),
      );
  }

  public async removePrompt(playbookId: string, promptName: string) {
    await this._drizzle
      .delete(playbookPromptsTable)
      .where(
        and(
          eq(playbookPromptsTable.playbookId, playbookId),
          eq(playbookPromptsTable.name, promptName),
        ),
      );
  }

  // Helper to convert server rows to PlaybookTarget
  public serverRowToTarget(
    server: Awaited<ReturnType<typeof this.getServers>>[0],
  ): PlaybookTarget {
    if (server.type === "http") {
      return {
        type: "http",
        name: server.name,
        url: server.url || "",
        headers: server.headers ?? undefined,
        tools: server.tools ?? undefined,
        prompts: server.prompts ?? undefined,
        disabled: server.disabled || false,
      };
    } else {
      return {
        type: "stdio",
        name: server.name,
        command: server.command || "",
        args: server.args || [],
        env: server.env ?? undefined,
        tools: server.tools ?? undefined,
        prompts: server.prompts ?? undefined,
        disabled: server.disabled || false,
      };
    }
  }

  // Helper to convert PlaybookTarget to server insert params
  public targetToServerInsertParams(
    playbookId: string,
    target: PlaybookTarget,
  ): PlaybookServerInsertParams {
    if (target.type === "http") {
      return {
        playbookId,
        name: target.name,
        type: "http",
        url: target.url,
        headers: target.headers,
        command: null,
        args: null,
        env: null,
        tools: target.tools,
        prompts: target.prompts,
        disabled: target.disabled,
      };
    } else {
      return {
        playbookId,
        name: target.name,
        type: "stdio",
        url: null,
        headers: null,
        command: target.command,
        args: target.args,
        env: target.env,
        tools: target.tools,
        prompts: target.prompts,
        disabled: target.disabled,
      };
    }
  }
}
