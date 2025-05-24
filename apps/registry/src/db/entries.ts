import { count, eq, inArray } from "drizzle-orm";
import { isGithubRepo } from "../enrichment/github";
import { DatabaseConnection } from "./index";
import { type EntryCreateParams, entriesTable } from "./schema";

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

    return entry[0];
  }

  public async deleteAllEntries(): Promise<void> {
    await this.db.db.delete(entriesTable);
  }

  public async getAllEntries() {
    return await this.db.db.select().from(entriesTable);
  }

  public async addEntry(entry: EntryCreateParams) {
    await this.db.db.insert(entriesTable).values(entry);
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
    const entries = await this.getAllEntries();
    const enriched = entries.filter((e) => e.isEnriched);
    const notEnriched = entries.filter((e) => !e.isEnriched);
    const notGithub = entries.filter((e) => !isGithubRepo(e.homepage));

    return {
      total: entries.length,
      enriched: enriched.length,
      notEnriched: notEnriched.length,
      notGithub: notGithub.length,
    };
  }

  public async paginateEntries(params: {
    pageIndex: number;
    pageSize: number;
  }) {
    const { pageIndex, pageSize } = params;
    const offset = pageIndex * pageSize;

    const [entries, totalCount] = await Promise.all([
      this.db.db
        .select({
          id: entriesTable.id,
          name: entriesTable.name,
          title: entriesTable.title,
          description: entriesTable.description,
          // createdAt: entriesTable.createdAt,
          // isOfficial: entriesTable.isOfficial,
          // isEnriched: entriesTable.isEnriched,
          transport: entriesTable.transport,
          homepage: entriesTable.homepage,
          // source_registry: entriesTable.source_registry,
          // categories: entriesTable.categories,
          tools: entriesTable.tools,
          parameters: entriesTable.parameters,
        })
        .from(entriesTable)
        .limit(pageSize)
        .offset(offset),
      this.db.db
        .select({ count: count() })
        .from(entriesTable)
        .then((result) => result[0].count),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      entries,
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
    options: AddEntriesOptions = {},
  ) {
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
        return;
      }

      await this.db.db.transaction(async (tx) => {
        await tx.insert(entriesTable).values(newEntries);
      });
    } else {
      await this.db.db.transaction(async (tx) => {
        await tx.insert(entriesTable).values(entries);
      });
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
}
