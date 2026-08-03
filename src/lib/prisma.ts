import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if(!connectionString){
     throw new Error("DATABASE URL is not found")
}

const adapter = new PrismaPg({
  connectionString,
});


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if(process.env.NODE_ENV == 'development'){
      globalForPrisma.prisma = prisma;
}