import { joinURL } from "@director.run/utilities/url";
import { and, asc, count, eq, inArray, or, sql } from "drizzle-orm";
import { env } from "../config";
import { DatabaseConnection } from "./index";
import {
  type EntryCreateParams,
  type EntryState,
  entriesTable,
} from "./schema";

/**
 * Resolves a relative icon path to an absolute URL using BASE_URL.
 */
function resolveIconUrl(icon: string | null): string | null {
  if (!icon) {
    return null;
  }
  if (icon.startsWith("/")) {
    return joinURL(env.BASE_URL, icon);
  }
  return icon;
}

export class EntryStore {
  constructor(private readonly db: DatabaseConnection) {}

  public async getEntryByName(name: string) {
    const entry = await this.db.db
      .select()
      .from(entriesTable)
      .where(eq(entriesTable.name, name))
      .limit(1);

    if (entry.length === 0) {
      throw new Error(`No entry found with name: ${name}`);
    }

    return {
      ...entry[0],
      icon: resolveIconUrl(entry[0].icon),
    };
  }

  public async getIconsAndDescriptionsForEntries(names: string[]) {
    const entries = await this.db.db
      .select({
        name: entriesTable.name,
        icon: entriesTable.icon,
        description: entriesTable.description,
      })
      .from(entriesTable)
      .where(inArray(entriesTable.name, names));
    return entries.map((entry) => ({
      ...entry,
      icon: resolveIconUrl(entry.icon),
    }));
  }

  public async deleteAllEntries(): Promise<void> {
    await this.db.db.delete(entriesTable);
  }

  public async getAllEntries() {
    return await this.db.db.select().from(entriesTable);
  }

  public async addEntry(entry: EntryCreateParams) {
    return (await this.db.db.insert(entriesTable).values(entry).returning())[0];
  }

  public async deleteEntry(id: string) {
    await this.db.db.delete(entriesTable).where(eq(entriesTable.id, id));
  }

  public async updateEntry(id: string, entry: Partial<EntryCreateParams>) {
    await this.db.db
      .update(entriesTable)
      .set(entry)
      .where(eq(entriesTable.id, id));
  }

  public async getStatistics() {
    const entries = await this.db.db
      .select({
        id: entriesTable.id,
        isEnriched: entriesTable.isEnriched,
        isConnectable: entriesTable.isConnectable,
        lastConnectionError: entriesTable.lastConnectionError,
        lastConnectionAt: entriesTable.lastConnectionAttemptedAt,
        tools: entriesTable.tools,
        state: entriesTable.state,
      })
      .from(entriesTable);

    return {
      total: entries.length,
      enriched: entries.filter((e) => e.isEnriched).length,
      connectionAttempted: entries.filter((e) => e.lastConnectionAt).length,
      connectable: entries.filter((e) => e.isConnectable).length,
      connectableError: entries.filter((e) => e.lastConnectionError).length,
      published: entries.filter((e) => e.state === "published").length,
      archived: entries.filter((e) => e.state === "archived").length,
      draft: entries.filter((e) => e.state === "draft").length,
      tools: entries.filter((e) => e.tools?.length).length,
    };
  }

  public async paginateEntries(params: {
    pageIndex: number;
    pageSize: number;
    searchQuery?: string;
    state?: EntryState | EntryState[];
  }) {
    const { pageIndex, pageSize, state } = params;
    const offset = pageIndex * pageSize;

    let whereSql;
    if (params.searchQuery && state) {
      const search = or(
        sql`${entriesTable.name} ILIKE ${"%" + params.searchQuery + "%"}`,
        sql`${entriesTable.description} ILIKE ${"%" + params.searchQuery + "%"}`,
      );
      if (Array.isArray(state)) {
        whereSql = and(search, inArray(entriesTable.state, state));
      } else {
        whereSql = and(search, eq(entriesTable.state, state));
      }
    } else if (params.searchQuery) {
      whereSql = or(
        sql`${entriesTable.name} ILIKE ${"%" + params.searchQuery + "%"}`,
        sql`${entriesTable.description} ILIKE ${"%" + params.searchQuery + "%"}`,
      );
    } else if (state) {
      if (Array.isArray(state)) {
        whereSql = inArray(entriesTable.state, state);
      } else {
        whereSql = eq(entriesTable.state, state);
      }
    } else {
      whereSql = undefined;
    }

    const [entries, totalCount] = await Promise.all([
      this.db.db
        .select({
          id: entriesTable.id,
          name: entriesTable.name,
          title: entriesTable.title,
          description: entriesTable.description,
          transport: entriesTable.transport,
          homepage: entriesTable.homepage,
          isOfficial: entriesTable.isOfficial,
          isConnectable: entriesTable.isConnectable,
          lastConnectionAttemptedAt: entriesTable.lastConnectionAttemptedAt,
          tools: entriesTable.tools,
          parameters: entriesTable.parameters,
          icon: entriesTable.icon,
          state: entriesTable.state,
        })
        .from(entriesTable)
        .where(whereSql)
        .orderBy(asc(entriesTable.name))
        .limit(pageSize)
        .offset(offset),
      this.db.db
        .select({ count: count() })
        .from(entriesTable)
        .where(whereSql)
        .then((result) => result[0].count),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      entries: entries.map((entry) => ({
        ...entry,
        icon: resolveIconUrl(entry.icon),
      })),
      pagination: {
        pageIndex,
        pageSize,
        totalItems: totalCount,
        totalPages,
        hasNextPage: pageIndex < totalPages - 1,
        hasPreviousPage: pageIndex > 0,
      },
    };
  }

  public async addEntries(
    entries: EntryCreateParams[],
    options: AddEntriesOptions = {
      ignoreDuplicates: true,
      state: "draft",
    },
  ): Promise<{ status: "success"; countInserted: number }> {
    if (options.ignoreDuplicates) {
      const existingEntries = await this.db.db
        .select({ name: entriesTable.name })
        .from(entriesTable)
        .where(
          inArray(
            entriesTable.name,
            entries.map((entry) => entry.name),
          ),
        );

      const existingNames = new Set(existingEntries.map((entry) => entry.name));
      const newEntries = entries.filter(
        (entry) => !existingNames.has(entry.name),
      );

      if (newEntries.length === 0) {
        return {
          status: "success",
          countInserted: newEntries.length,
        };
      }

      await this.db.db.transaction(async (tx) => {
        await tx
          .insert(entriesTable)
          .values(
            newEntries.map((entry) => ({ ...entry, state: options.state })),
          );
      });

      return {
        status: "success",
        countInserted: newEntries.length,
      };
    } else {
      await this.db.db.transaction(async (tx) => {
        await tx
          .insert(entriesTable)
          .values(
            entries.map((entry) =>
              options.state !== undefined
                ? { ...entry, state: options.state }
                : entry,
            ),
          );
      });

      return {
        status: "success",
        countInserted: entries.length,
      };
    }
  }

  public async countEntries(): Promise<number> {
    const result = await this.db.db
      .select({ count: count() })
      .from(entriesTable);
    return result[0].count;
  }
}

interface AddEntriesOptions {
  ignoreDuplicates?: boolean;
  state?: EntryState;
}
