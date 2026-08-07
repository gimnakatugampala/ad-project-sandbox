import { requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { CreateAdForm } from "@/components/advertisements/create-ad-form";
import Link from "next/link";

export default async function AddNew(){

    await requireUser()

    // Categories Load
    const categoryQuery = prisma.category.findMany({
        where: {
            parentId: null,
              isDeleted: false,

        },
        select: {
            id: true,
            name: true,
            children: {
                where: {
                isDeleted: false,
                },
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: "asc",
            },
            },
        },
        orderBy: {
            name: "asc",
        },
        });


        // Location
        const locationQuery = prisma.location.findMany({
          where: {
            isDeleted: false,
        },
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        },
        });

        const [categories, locations] = await Promise.all([
            categoryQuery,
            locationQuery,
            ]);

  return (
   
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12">
    <Link
        href="/ads"
        className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
    >
        ← Back to advertisements
    </Link>

    <div className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight">
        Post an advertisement
        </h1>

        <p className="mt-2 max-w-2xl text-muted-foreground">
        Provide clear information and good-quality images to help
        buyers understand what you are offering.
        </p>
    </div>

    <div className="mt-8">
        <CreateAdForm
        categories={categories}
        locations={locations}
        />
    </div>
    </main>
        
    
  )
}

