import { AdvertisementStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type AdsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    location?: string | string[];
  }>;
};

export default async function AdsPage( {searchParams} : AdsPageProps ) {

  const params = await searchParams;

  const keyword = typeof params.q === "string" ? params.q.trim() : "";

  const categoryId = typeof params.category === "string" ? params.category : "";

  const locationId = typeof params.location === "string" ? params.location : "";

  const advertisementsQuery = await prisma.advertisement.findMany({
    relationLoadStrategy: "join",
    where: {
      status: AdvertisementStatus.ACTIVE,
      isDeleted: false,
      ...(keyword
      ? {
          OR: [
            {
              title: {
                contains: keyword,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
        ...(categoryId
      ? {
          categoryId,
        }
      : {}),

    ...(locationId
      ? {
          locationId,
        }
      : {}),
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      createdAt: true,

      category: {
        select: {
          name: true,
        },
      },

      location: {
        select: {
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });


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

const [categories, locations, advertisements] =
  await Promise.all([
    categoryQuery,
    locationQuery,
    advertisementsQuery,
  ]);

  return (
    <main>
      <h1>Advertisements</h1>


      {advertisements.length === 0 ?  (
             <p>
              {keyword
                ? `No advertisements found for "${keyword}".`
                : "No active advertisements are currently available."}
            </p>
            ) : (

              <>
              <form method="GET" action="/ads">
              <input
                type="search"
                name="q"
                defaultValue={keyword}
                placeholder="Search advertisements"
              />

               <select
              id="category"
              name="category"
              defaultValue={categoryId}
            >
              <option value="">
                All categories
              </option>

              {categories.map((parent) => (
                <optgroup
                  key={parent.id}
                  label={parent.name}
                >
                  {parent.children.map((child) => (
                    <option
                      key={child.id}
                      value={child.id}
                    >
                      {child.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <select
            id="location"
            name="location"
            defaultValue={locationId}
          >
            <option value="">
              All locations
            </option>

            {locations.map((location) => (
              <option
                key={location.id}
                value={location.id}
              >
                {location.name}
              </option>
            ))}
          </select>

              <button type="submit">
                Search
              </button>

              <Link href="/ads">
              Clear filters
            </Link>
            </form>

           
                          
                        
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {advertisements.map((advertisement) => (
                <article
                  key={advertisement.id}
                  className="rounded-lg border p-5"
                >
                  <h2 className="text-xl font-semibold">
                    {advertisement.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {advertisement.category.name}
                    {" · "}
                    {advertisement.location.name}
                  </p>

                  <p className="mt-4">
                    {advertisement.description}
                  </p>

                  <p className="mt-4 font-semibold">
                    LKR {advertisement.price.toString()}
                  </p>

                  <Link
                  href={`/ads/${advertisement.id}`}
                  className="mt-5 inline-block font-medium underline"
                >
                  View details
                </Link>
                </article>
              ))}
            </div>
            </>
            )}

          
    </main>
  );
}