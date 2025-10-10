import fs from "fs";
import { existsSync } from "node:fs";
import { get, set } from "lodash";
import YAML from "yaml";
import { z } from "zod";

export abstract class BaseConfig<TSchema extends Record<string, z.ZodType>> {
  private schema: TSchema;
  protected _data?: Record<string, unknown>;

  constructor(params: { schema: TSchema }) {
    this.schema = params.schema;
  }

  get data() {
    return this._data;
  }

  abstract init(): Promise<void>;
  protected abstract persist(): Promise<void>;

  async set<K extends keyof TSchema & string>(
    key: K,
    value: z.infer<TSchema[K]>,
  ): Promise<void> {
    if (!this._data) {
      throw new Error("Data not initialized");
    }

    if (!(key in this.schema)) {
      throw new Error(`Key "${key}" is not allowed`);
    }

    // Validate against the schema
    const schema = this.schema[key];
    const parsed = schema.parse(value); // Throws if invalid

    set(this._data, key, parsed);

    await this.persist();
  }

  get<K extends keyof TSchema & string>(
    key: K,
  ): z.infer<TSchema[K]> | undefined {
    if (!(key in this.schema)) {
      throw new Error(`Key "${key}" is not allowed`);
    }

    const value = get(this._data, key);

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

  protected validateAndSetData(data: Record<string, unknown>) {
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

    this._data = validatedData;
  }
}

export class InMemoryTypedStore<
  TSchema extends Record<string, z.ZodType>,
> extends BaseConfig<TSchema> {
  constructor(params: {
    schema: TSchema;
    data?: Record<string, unknown>;
  }) {
    super({ schema: params.schema });
    this.validateAndSetData(params.data ?? {});
  }

  init() {
    return Promise.resolve();
  }

  persist() {
    return Promise.resolve();
  }
}

export class YAMLTypedStore<
  TSchema extends Record<string, z.ZodType>,
> extends BaseConfig<TSchema> {
  private filePath: string;
  private defaultData: Record<string, unknown>;

  constructor(params: {
    schema: TSchema;
    filePath: string;
    defaultData: Record<string, unknown>;
  }) {
    super({ schema: params.schema });
    this.filePath = params.filePath;
    this.defaultData = params.defaultData;
  }

  async init() {
    if (!existsSync(this.filePath)) {
      await fs.promises.writeFile(
        this.filePath,
        YAML.stringify(this.defaultData),
      );
      this.validateAndSetData(this.defaultData);
    } else {
      const data = await fs.promises.readFile(this.filePath, "utf8");
      this.validateAndSetData(YAML.parse(data));
    }
  }

  async persist() {
    await fs.promises.writeFile(this.filePath, YAML.stringify(this.data));
  }
}
