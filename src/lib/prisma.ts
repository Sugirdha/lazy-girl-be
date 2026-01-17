import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

const shutdown = async () => {
  await prisma.$disconnect();
};

process.on('beforeExit', shutdown);
process.on('SIGINT', async () => {
  await shutdown();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  await shutdown();
  process.exit(0);
});
