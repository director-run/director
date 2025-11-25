import { AppError, ErrorCode } from "@director.run/utilities/error";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import type { PlaybookTarget } from "../playbooks/playbook-schema";
import {
  type PlaybookInsertParams,
  type PlaybookPromptInsertParams,
  type PlaybookServerInsertParams,
  accountTable,
  playbookPromptsTable,
  playbookServersTable,
  playbooksTable,
  sessionTable,
  userTable,
  verificationTable,
} from "./schema";
import * as schema from "./schema";

export class Database {
  private pool: Pool;
  private db: ReturnType<typeof drizzle>;

  private constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema });
  }

  public static create(connectionString: string): Database {
    return new Database(connectionString);
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }

  public async getPlaybookById(id: string, userId: string) {
    const playbook = await this.db
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
    return await this.db
      .select()
      .from(playbooksTable)
      .where(eq(playbooksTable.userId, userId));
  }

  public async createPlaybook(
    playbook: Omit<PlaybookInsertParams, "id"> & { id?: string },
  ) {
    const id = playbook.id || crypto.randomUUID();
    return (
      await this.db
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
    await this.db
      .update(playbooksTable)
      .set({ ...playbook, updatedAt: new Date() })
      .where(and(eq(playbooksTable.id, id), eq(playbooksTable.userId, userId)));
  }

  public async deletePlaybook(id: string, userId: string) {
    await this.db
      .delete(playbooksTable)
      .where(and(eq(playbooksTable.id, id), eq(playbooksTable.userId, userId)));
  }

  public async deleteAllPlaybooks() {
    await this.db.delete(playbooksTable);
  }

  public async reset() {
    // Delete in order to respect foreign key constraints
    await this.db.delete(verificationTable);
    await this.db.delete(sessionTable);
    await this.db.delete(accountTable);
    await this.db.delete(playbooksTable);
    await this.db.delete(userTable);
  }

  public async createDummyUser() {
    // Use onConflictDoNothing to avoid errors if user already exists
    await this.db
      .insert(userTable)
      .values({
        id: "dummy-user-id",
        name: "dummy@example.com",
        email: "dummy@example.com",
        emailVerified: true,
        status: "ACTIVE",
      })
      .onConflictDoNothing();
  }

  public async activateUser(userId: string) {
    await this.db
      .update(userTable)
      .set({ status: "ACTIVE" })
      .where(eq(userTable.id, userId));
  }

  // Server operations
  public async getServers(playbookId: string) {
    return await this.db
      .select()
      .from(playbookServersTable)
      .where(eq(playbookServersTable.playbookId, playbookId));
  }

  public async getServerByName(playbookId: string, name: string) {
    const servers = await this.db
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
      await this.db.insert(playbookServersTable).values(server).returning()
    )[0];
  }

  public async updateServer(
    playbookId: string,
    serverName: string,
    server: Partial<PlaybookServerInsertParams>,
  ) {
    await this.db
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
    await this.db
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
    return await this.db
      .select()
      .from(playbookPromptsTable)
      .where(eq(playbookPromptsTable.playbookId, playbookId));
  }

  public async getPromptByName(playbookId: string, name: string) {
    const prompts = await this.db
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
      await this.db.insert(playbookPromptsTable).values(prompt).returning()
    )[0];
  }

  public async updatePrompt(
    playbookId: string,
    promptName: string,
    prompt: Partial<PlaybookPromptInsertParams>,
  ) {
    await this.db
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
    await this.db
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
