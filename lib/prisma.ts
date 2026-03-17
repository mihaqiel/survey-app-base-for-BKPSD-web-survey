import { PrismaClient } from "@prisma/client";

// Hardcoded URL to bypass system environment variable override
// Replace YOURPASSWORD with your actual database password
const DATABASE_URL = "postgresql://postgres.vsidxaoyreydzsmzdplk:BKPSDMsurvey2026@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: { url: DATABASE_URL },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;