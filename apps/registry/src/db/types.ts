import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { entriesTable } from "./schema";

export type EntryCreateParams = InferInsertModel<typeof entriesTable>;
export type EntryGetParams = InferSelectModel<typeof entriesTable>;
