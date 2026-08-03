import 'dotenv/config'
import { prisma } from "../src/lib/prisma";




async function main() {
    
    const locationCount = await prisma.location.count();
    
    console.log(`Database connected. Locations: ${locationCount}`);
}


main()
.catch((error) => {
    console.error("Database test failed:", error);
    process.exitCode = 1;
})
.finally(async() => {
 await prisma.$disconnect();
})