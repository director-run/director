import { get, set } from "lodash";
import { z } from "zod";
import { type ConfigStorage } from "./config-storage";

export class Config<TSchema extends Record<string, z.ZodType>> {
  private schema: TSchema;
  private storage: ConfigStorage;

  constructor(params: { schema: TSchema; storage: ConfigStorage }) {
    this.schema = params.schema;
    this.storage = params.storage;
  }

  get data() {
    return this.storage.getData();
  }

  async init(): Promise<void> {
    await this.storage.init();
    this.validateAndSetData(this.storage.getData());
  }

  async set<K extends keyof TSchema & string>(
    key: K,
    value: z.infer<TSchema[K]>,
  ): Promise<void> {
    if (!(key in this.schema)) {
      throw new Error(`Key "${key}" is not allowed`);
    }

    // Validate against the schema
    const schema = this.schema[key];
    const parsed = schema.parse(value); // Throws if invalid

    const currentData = this.storage.getData();
    set(currentData, key, parsed);
    this.storage.setData(currentData);

    await this.storage.persist();
  }

  get<K extends keyof TSchema & string>(
    key: K,
  ): z.infer<TSchema[K]> | undefined {
    if (!(key in this.schema)) {
      throw new Error(`Key "${key}" is not allowed`);
    }

    const value = get(this.storage.getData(), key);

    // If value exists, return it
    if (value !== undefined) {
      return value as z.infer<TSchema[K]>;
    }

    // If value doesn't exist, check if schema has a default
    const schema = this.schema[key];
    const result = schema.safeParse(undefined);

    if (result.success) {
      return result.data as z.infer<TSchema[K]>;
    }

    return undefined;
  }

  async purge(): Promise<void> {
    await this.storage.purge();
    this.validateAndSetData(this.storage.getData());
  }

  private validateAndSetData(data: Record<string, unknown>) {
    const validatedData = { ...data };

    for (const key in this.schema) {
      const value = get(validatedData, key);
      if (value !== undefined) {
        const keySchema = this.schema[key];
        try {
          const parsed = keySchema.parse(value);
          set(validatedData, key, parsed);
        } catch (error) {
          throw new Error(
            `Invalid data for key "${key}": ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }
    }

    this.storage.setData(validatedData);
  }
}
