import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listProxies = async () => {
  return prisma.proxy.findMany();
};
