import { count, eq, inArray } from "drizzle-orm";
import { DatabaseConnection } from "./index";
import { type EntryCreateParams, entriesTable } from "./schema";

export interface AddEntriesOptions {
  ignoreDuplicates?: boolean;
}

export class EntryStore {
  private constructor(private readonly db: DatabaseConnection) {}

  public static create(db: DatabaseConnection): EntryStore {
    return new EntryStore(db);
  }

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

  public async getEntries(params: {
    page: number;
    limit: number;
  }) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const entries = await this.db.db
      .select()
      .from(entriesTable)
      .limit(limit)
      .offset(offset);

    return entries;
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
