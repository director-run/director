import { get, set } from "lodash";
import { z } from "zod";

export abstract class TypedStore<TSchema extends Record<string, z.ZodType>> {
  private _data: Record<string, unknown> = {};
  private schema: TSchema;

  constructor(config: { schema: TSchema; data?: Record<string, unknown> }) {
    this.schema = config.schema;
    this._data = validateAndParseData(config.schema, config.data ?? {});
  }

  protected abstract init(): Promise<void>;
  protected abstract readData(): Promise<Record<string, unknown>>;
  protected abstract writeData(data: Record<string, unknown>): Promise<void>;

  get data(): Record<string, unknown> {
    return this._data;
  }

  set<K extends keyof TSchema & string>(
    key: K,
    value: z.infer<TSchema[K]>,
  ): void {
    if (!(key in this.schema)) {
      throw new Error(`Key "${key}" is not allowed`);
    }

    // Validate against the schema
    const schema = this.schema[key];
    const parsed = schema.parse(value); // Throws if invalid

    set(this._data, key, parsed);
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
}

export class InMemoryTypedStore<
  TSchema extends Record<string, z.ZodType>,
> extends TypedStore<TSchema> {
  private _dataa?: Record<string, unknown>;

  constructor(config: { schema: TSchema; data?: Record<string, unknown> }) {
    super({ schema: config.schema, data: config.data });
    this._dataa = config.data;
  }

  init() {
    return Promise.resolve();
  }

  readData() {
    if (!this._dataa) {
      throw new Error("Data not initialized");
    }
    return Promise.resolve(this._dataa);
  }

  writeData(data: Record<string, unknown>) {
    this._dataa = data;
    return Promise.resolve();
  }
}

function validateAndParseData<TSchema extends Record<string, z.ZodType>>(
  schema: TSchema,
  data: Record<string, unknown>,
): Record<string, unknown> {
  const validatedData = { ...data };

  for (const key in schema) {
    const value = get(validatedData, key);
    if (value !== undefined) {
      const keySchema = schema[key];
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

  return validatedData;
}
