import { AppError, ErrorCode } from "@director.run/utilities/error";
import { and, eq } from "drizzle-orm";
import type { PlaybookTarget } from "../playbooks/playbook-schema";
import type { DatabaseConnection } from "./index";
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

export class PlaybookDbStore {
  constructor(private readonly dbConnection: DatabaseConnection) {}

  public async getPlaybookById(id: string, userId: string) {
    const playbook = await this.dbConnection.db
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
    return await this.dbConnection.db
      .select()
      .from(playbooksTable)
      .where(eq(playbooksTable.userId, userId));
  }

  public async createPlaybook(
    playbook: Omit<PlaybookInsertParams, "id"> & { id?: string },
  ) {
    const id = playbook.id || crypto.randomUUID();
    return (
      await this.dbConnection.db
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
    await this.dbConnection.db
      .update(playbooksTable)
      .set({ ...playbook, updatedAt: new Date() })
      .where(and(eq(playbooksTable.id, id), eq(playbooksTable.userId, userId)));
  }

  public async deletePlaybook(id: string, userId: string) {
    await this.dbConnection.db
      .delete(playbooksTable)
      .where(and(eq(playbooksTable.id, id), eq(playbooksTable.userId, userId)));
  }

  public async deleteAllPlaybooks() {
    await this.dbConnection.db.delete(playbooksTable);
  }

  public async deleteAllUsers() {
    // Delete in order to respect foreign key constraints
    await this.dbConnection.db.delete(verificationTable);
    await this.dbConnection.db.delete(sessionTable);
    await this.dbConnection.db.delete(accountTable);
    await this.dbConnection.db.delete(playbooksTable);
    await this.dbConnection.db.delete(userTable);
  }

  public async createDummyUser() {
    // Use onConflictDoNothing to avoid errors if user already exists
    await this.dbConnection.db
      .insert(userTable)
      .values({
        id: "dummy-user-id",
        email: "dummy@example.com",
        name: "Dummy User",
        emailVerified: true,
      })
      .onConflictDoNothing();
  }

  // Server operations
  public async getServers(playbookId: string) {
    return await this.dbConnection.db
      .select()
      .from(playbookServersTable)
      .where(eq(playbookServersTable.playbookId, playbookId));
  }

  public async getServerByName(playbookId: string, name: string) {
    const servers = await this.dbConnection.db
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
      await this.dbConnection.db
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
    await this.dbConnection.db
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
    await this.dbConnection.db
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
    return await this.dbConnection.db
      .select()
      .from(playbookPromptsTable)
      .where(eq(playbookPromptsTable.playbookId, playbookId));
  }

  public async getPromptByName(playbookId: string, name: string) {
    const prompts = await this.dbConnection.db
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
      await this.dbConnection.db
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
    await this.dbConnection.db
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
    await this.dbConnection.db
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
