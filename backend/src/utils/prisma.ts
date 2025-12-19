import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as prismaPkg from '@prisma/client';

const { PrismaClient: AnyPrismaClient } = prismaPkg as any;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// Fallback: if PrismaClient is missing, throw clear error at startup
if (!AnyPrismaClient) {
  throw new Error('PrismaClient is not exported from @prisma/client. Check Prisma version and regenerate client.');
}

const prisma = new AnyPrismaClient({ adapter });

export default prisma;