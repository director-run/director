import { AppError, ErrorCode } from "@director.run/utilities/error";
import { get, set } from "lodash";
import { z } from "zod";
import { type ConfigStorage } from "./config-storage";

export class ConfigBase<TSchema extends Record<string, z.ZodType>> {
  private schema: TSchema;
  protected storage: ConfigStorage;
  protected readonly defaults: Record<string, unknown>;

  constructor(params: {
    schema: TSchema;
    storage: ConfigStorage;
    defaults?: Record<string, unknown>;
  }) {
    this.schema = params.schema;
    this.storage = params.storage;
    this.defaults = params.defaults ?? {};
  }

  get data() {
    return this.storage.getData();
  }

  async init(): Promise<void> {
    await this.storage.init();
    this.validate({ ...this.defaults, ...this.storage.getData() });
  }

  async set<K extends keyof TSchema & string>(
    key: K,
    value: z.infer<TSchema[K]>,
  ): Promise<void> {
    if (!(key in this.schema)) {
      throw new AppError(
        ErrorCode.INVALID_ARGUMENT,
        `Key "${key}" is not allowed`,
        { key },
      );
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
      throw new AppError(
        ErrorCode.INVALID_ARGUMENT,
        `Key "${key}" is not allowed`,
        { key },
      );
    }

    const value = get({ ...this.defaults, ...this.storage.getData() }, key);

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
  }

  private validate(data: Record<string, unknown>) {
    const validatedData = { ...this.defaults, ...data };

    for (const key in this.schema) {
      const value = get(validatedData, key);
      const keySchema = this.schema[key];
      try {
        keySchema.parse(value);
      } catch (error) {
        throw new AppError(
          ErrorCode.INVALID_CONFIGURATION,
          `Invalid data for key "${key}": ${error instanceof Error ? error.message : String(error)}`,
          { key, value },
        );
      }
    }

    // Don't persist defaults to storage - only validate
  }
}
