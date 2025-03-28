import { PrismaClient } from "@prisma/client";
import { DATABASE_URL } from "../env";

export function getPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  });
}
