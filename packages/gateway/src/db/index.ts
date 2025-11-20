import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export class DatabaseConnection {
  private pool: Pool;
  public readonly db: ReturnType<typeof drizzle>;

  private constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    this.db = drizzle(this.pool, { schema });
  }

  public static create(connectionString: string): DatabaseConnection {
    return new DatabaseConnection(connectionString);
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export { PlaybookDbStore } from "./playbooks";
export { createStore } from "./store";
