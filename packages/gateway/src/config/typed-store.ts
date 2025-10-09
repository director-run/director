import { get, set } from "lodash";
import { z } from "zod";

export class TypedStore<TSchema extends Record<string, z.ZodType>> {
  private _data: Record<string, unknown> = {};
  private schema: TSchema;

  constructor(config: { schema: TSchema; data?: Record<string, unknown> }) {
    this.schema = config.schema;
    this._data = config.data ?? {};
  }

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

// // Usage
// const allowedSchema = {
//   "user.name": z.string().default("Bob"),
//   "user.age": z.number().min(0),
//   "settings.theme": z.enum(["light", "dark"]).default("light"),
//   "config.maxItems": z.number().int().positive(),
// } as const;

// const store = new TypedStore({ schema: allowedSchema });

// store.set('user.name', 'Alice'); // ✅ OK
// store.set('user.age', 25); // ✅ OK
// store.set('user.age', -5); // ❌ Throws: validation error
// store.set('forbidden.key', 'value'); // ❌ TypeScript error + runtime error

// const name = store.get('user.name'); // type: string | undefined (returns "Alice")
// const theme = store.get('settings.theme'); // type: "light" | "dark" | undefined (returns "light" default)
// const age = store.get('user.age'); // type: number | undefined (returns undefined, no default)
// store.get('forbidden.key'); // ❌ TypeScript error + runtime error
