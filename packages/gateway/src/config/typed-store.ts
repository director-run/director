import { get, set } from "lodash";
import { z } from "zod";

// Define your allowed keys and their schemas
const allowedSchemas = {
  "user.name": z.string(),
  "user.age": z.number().min(0),
  "settings.theme": z.enum(["light", "dark"]),
  "config.maxItems": z.number().int().positive(),
} as const;

type AllowedKey = keyof typeof allowedSchemas;

export class TypedStore {
  private data: Record<string, unknown> = {};

  constructor(data: Record<string, unknown>) {
    this.data = data;
  }

  set<K extends AllowedKey>(
    key: K,
    value: z.infer<(typeof allowedSchemas)[K]>,
  ): void {
    if (!(key in allowedSchemas)) {
      throw new Error(`Key "${key}" is not allowed`);
    }

    // Validate against the schema
    const schema = allowedSchemas[key];
    const parsed = schema.parse(value); // Throws if invalid

    set(this.data, key, parsed);
  }

  get<K extends AllowedKey>(
    key: K,
  ): z.infer<(typeof allowedSchemas)[K]> | undefined {
    if (!(key in allowedSchemas)) {
      throw new Error(`Key "${key}" is not allowed`);
    }

    return get(this.data, key) as
      | z.infer<(typeof allowedSchemas)[K]>
      | undefined;
  }
}

// // Usage
// const store = new TypedStore<keyof typeof allowedSchemas>();

// store.set('user.name', 'Alice'); // ✅ OK
// store.set('user.age', 25); // ✅ OK
// store.set('user.age', -5); // ❌ Throws: validation error
// store.set('forbidden.key', 'value'); // ❌ TypeScript error + runtime error

// const name = store.get('user.name'); // type: string | undefined
// const age = store.get('user.age'); // type: number | undefined
// store.get('forbidden.key'); // ❌ TypeScript error + runtime error
