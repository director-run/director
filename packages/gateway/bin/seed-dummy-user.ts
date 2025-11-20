#!/usr/bin/env bun
import { createStore } from "../src/db/store";
import { DATABASE_URL } from "../src/env";

const store = createStore({ connectionString: DATABASE_URL });

await store.playbooks.createDummyUser();

console.log("Dummy user created successfully");

await store.close();
