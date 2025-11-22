#!/usr/bin/env bun
import { auth } from "../src/auth";
import { createStore } from "../src/db/store";
import { DATABASE_URL } from "../src/env";

const store = createStore({ connectionString: DATABASE_URL });

await store.purge();

await auth.api.signUpEmail({
  body: {
    email: "user@example.com",
    password: "password",
    name: "user@example.com",
  },
});

await store.close();
process.exit(0);
