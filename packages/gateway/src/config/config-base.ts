import { AppError, ErrorCode } from "@director.run/utilities/error";
import { get, isEqual, isMatch, isObject, set } from "lodash";
import { z } from "zod";
import { type ConfigStorage } from "./config-storage";

export class ConfigBase<TSchema extends Record<string, z.ZodType>> {
  private schema: TSchema;
  public readonly storage: ConfigStorage;
  public readonly defaults: Record<string, unknown>;

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

  async push<K extends keyof TSchema & string>(
    key: K,
    item: unknown,
  ): Promise<void> {
    if (!(key in this.schema)) {
      throw new AppError(
        ErrorCode.INVALID_ARGUMENT,
        `Key "${key}" is not allowed`,
        { key },
      );
    }

    const schema = this.schema[key];
    const arraySchema = this.unwrapArraySchema(schema);
    if (!arraySchema) {
      throw new AppError(
        ErrorCode.INVALID_ARGUMENT,
        `Key "${key}" is not an array`,
        { key },
      );
    }

    // Validate element against the array's element schema
    const parsedItem = arraySchema.element.parse(item);

    const currentData = this.storage.getData();
    const currentArray = get({ ...this.defaults, ...currentData }, key) as
      | unknown[]
      | undefined;
    const nextArray = [...(currentArray ?? []), parsedItem];

    set(currentData, key, nextArray);
    this.storage.setData(currentData);
    await this.storage.persist();
  }

  async remove<K extends keyof TSchema & string>(
    key: K,
    selector: unknown,
  ): Promise<void> {
    if (!(key in this.schema)) {
      throw new AppError(
        ErrorCode.INVALID_ARGUMENT,
        `Key "${key}" is not allowed`,
        { key },
      );
    }

    const schema = this.schema[key];
    const arraySchema = this.unwrapArraySchema(schema);
    if (!arraySchema) {
      throw new AppError(
        ErrorCode.INVALID_ARGUMENT,
        `Key "${key}" is not an array`,
        { key },
      );
    }

    const currentData = this.storage.getData();
    const currentArray = get({ ...this.defaults, ...currentData }, key) as
      | unknown[]
      | undefined;
    const safeArray = [...(currentArray ?? [])];

    const filtered = safeArray.filter((element) => {
      // For primitive arrays, remove by deep equality
      if (!isObject(element) || element === null) {
        return !isEqual(element, selector);
      }
      // For object arrays, remove by lodash isMatch
      return !isMatch(element, selector as Record<string, unknown>);
    });

    set(currentData, key, filtered);
    this.storage.setData(currentData);
    await this.storage.persist();
  }

  find<K extends keyof TSchema & string>(
    key: K,
    selector: unknown,
  ): unknown | undefined {
    if (!(key in this.schema)) {
      throw new AppError(
        ErrorCode.INVALID_ARGUMENT,
        `Key "${key}" is not allowed`,
        { key },
      );
    }

    const schema = this.schema[key];
    const arraySchema = this.unwrapArraySchema(schema);
    if (!arraySchema) {
      throw new AppError(
        ErrorCode.INVALID_ARGUMENT,
        `Key "${key}" is not an array`,
        { key },
      );
    }

    const currentData = this.storage.getData();
    const currentArray = get({ ...this.defaults, ...currentData }, key) as
      | unknown[]
      | undefined;
    const safeArray = [...(currentArray ?? [])];

    const found = safeArray.find((element) => {
      if (!isObject(element) || element === null) {
        return isEqual(element, selector);
      }
      return isMatch(element, selector as Record<string, unknown>);
    });

    return found;
  }

  private unwrapArraySchema(
    inputSchema: z.ZodTypeAny,
  ): z.ZodArray<z.ZodTypeAny> | null {
    // Unwrap defaults, optionals, nullables, effects to get to the underlying array schema
    // Handle chains like ZodDefault<ZodOptional<ZodArray<...>>>
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (inputSchema instanceof z.ZodArray) {
        return inputSchema;
      }
      if (inputSchema instanceof z.ZodDefault) {
        const def = (
          inputSchema as unknown as {
            _def: { innerType: z.ZodTypeAny };
          }
        )._def;
        inputSchema = def.innerType;
        continue;
      }
      if (
        inputSchema instanceof z.ZodOptional ||
        inputSchema instanceof z.ZodNullable
      ) {
        const def = (
          inputSchema as unknown as {
            _def: { innerType: z.ZodTypeAny };
          }
        )._def;
        inputSchema = def.innerType;
        continue;
      }
      if (inputSchema instanceof z.ZodEffects) {
        const def = (
          inputSchema as unknown as { _def: { schema: z.ZodTypeAny } }
        )._def;
        inputSchema = def.schema;
        continue;
      }
      return null;
    }
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
