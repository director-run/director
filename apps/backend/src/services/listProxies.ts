import { getPrismaClient } from "./getPrismaClient";

const prisma = getPrismaClient();

export const listProxies = async () => {
  return prisma.proxy.findMany();
};
