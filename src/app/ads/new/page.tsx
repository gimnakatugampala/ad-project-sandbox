import { requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { CreateAdForm } from "@/components/advertisements/create-ad-form";

export default async function AddNew(){

    await requireUser()

    // Categories Load
    const categoryQuery = prisma.category.findMany({
        where: {
            parentId: null,
        },
        select: {
            id: true,
            name: true,
            children: {
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
    <>
        <CreateAdForm
            categories={categories}
            locations={locations}
            />
    </>
  )
}

