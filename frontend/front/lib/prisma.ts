import { PrismaClient } from "@prisma/client";

/**
 * PrismaClient singleton on globalThis so dev HMR doesn't open a connection
 * per reload. On Vercel each function instance reuses one client.
 */
const globalForPrisma = globalThis as typeof globalThis & {
  __skillschoolPrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.__skillschoolPrisma ??
  new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__skillschoolPrisma = prisma;
}
