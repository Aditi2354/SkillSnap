// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` in dev to avoid multiple clients
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["error", "warn"], // add "query" if you want verbose logs
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
