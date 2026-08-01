import "server-only";
import { PrismaClient } from "@prisma/client";

let client: PrismaClient | null = null;
let reachability: boolean | null = null;
let reachabilityCheck: Promise<boolean> | null = null;

export function getPrisma(): PrismaClient | null {
  if (reachability === false) return null;
  if (!client) {
    try {
      client = new PrismaClient();
    } catch {
      reachability = false;
      return null;
    }
  }
  return client;
}

export async function isDatabaseReachable(): Promise<boolean> {
  if (reachability !== null) return reachability;
  if (!process.env.DATABASE_URL) {
    reachability = false;
    return false;
  }
  if (!reachabilityCheck) {
    reachabilityCheck = (async () => {
      try {
        const prisma = getPrisma();
        if (!prisma) return false;
        await prisma.$queryRaw`SELECT 1`;
        reachability = true;
      } catch {
        reachability = false;
      }
      return reachability;
    })();
  }
  return reachabilityCheck;
}
