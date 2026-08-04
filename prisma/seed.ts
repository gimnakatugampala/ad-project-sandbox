import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

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

async function main() {

const vehicles = await prisma.category.upsert({
    where: {slug:'where'},
    update: {name: "Vehicles",parentId:null},
    create: {
        name: "Vehicles",
        slug: "vehicles"
    }
})

const subcategories = await prisma.category.upsert({
  where: { slug: "cars" },
  update: {
    name: "Cars",
    parentId: vehicles.id,
  },
  create: {
    name: "Cars",
    slug: "cars",
    parentId: vehicles.id,
  },
});

const locations = await prisma.location.upsert({
    where: {slug: 'colombo'},
    update:{
        name: "Colombo"
    },
    create:{
        name: "Colombo",
        slug: "colombo",
    }
})

}


main()
    .catch((error) => {
        console.error("Database test failed:", error);
    })
    .finally(async() => {
        await prisma.$disconnect();
    })