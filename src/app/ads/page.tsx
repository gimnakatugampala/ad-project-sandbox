import { AdvertisementStatus, UserStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type AdsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    location?: string | string[];
    minPrice?: string | string[];
    maxPrice?: string | string[];
  }>;
};

export default async function AdsPage( {searchParams} : AdsPageProps ) {

  const params = await searchParams;

  const keyword = typeof params.q === "string" ? params.q.trim() : "";

  const categoryId = typeof params.category === "string" ? params.category : "";

  const locationId = typeof params.location === "string" ? params.location : "";

  const minPriceInput = typeof params.minPrice === "string" ? params.minPrice.trim(): "";

  const maxPriceInput = typeof params.maxPrice === "string"  ? params.maxPrice.trim() : "";

  const parsedMinPrice = minPriceInput === "" ? undefined : Number(minPriceInput);

  const parsedMaxPrice = maxPriceInput === "" ? undefined : Number(maxPriceInput);

  const minPrice =
  parsedMinPrice !== undefined &&
  Number.isFinite(parsedMinPrice) &&
  parsedMinPrice >= 0
    ? parsedMinPrice
    : undefined;

const maxPrice =
  parsedMaxPrice !== undefined &&
  Number.isFinite(parsedMaxPrice) &&
  parsedMaxPrice >= 0
    ? parsedMaxPrice
    : undefined;


  const hasInvalidPriceRange =
  minPrice !== undefined &&
  maxPrice !== undefined &&
  minPrice > maxPrice;

  const advertisementsQuery = hasInvalidPriceRange
  ? []
  :  await prisma.advertisement.findMany({
    relationLoadStrategy: "join",
    where: {
      status: AdvertisementStatus.ACTIVE,
      isDeleted: false,
        user: {
          status: UserStatus.ACTIVE,
        },
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
      ...(minPrice !== undefined ||
      maxPrice !== undefined
      ? {
      price: {
        ...(minPrice !== undefined
          ? { gte: minPrice }
          : {}),

        ...(maxPrice !== undefined
          ? { lte: maxPrice }
          : {}),
      },
    }
  : {}),
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      createdAt: true,
      images: {
      where: {
        isPrimary: true,
      },
      select: {
        filePath: true,
      },
      take: 1,
    },

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

  const controlClassName =
  "h-11 w-full rounded-lg border bg-background px-3 text-sm shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring";

  return (
  <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div className="mb-8">
    <h1 className="text-3xl font-bold tracking-tight">
      Browse advertisements
    </h1>

    <p className="mt-2 text-muted-foreground">
      Search listings by keyword, category, location and price.
    </p>
  </div>

      <form
  method="GET"
  action="/ads"
  className="mb-8 rounded-2xl border bg-card p-5 shadow-sm"
>
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <input
              className={controlClassName}
                type="search"
                name="q"
                defaultValue={keyword}
                placeholder="Search advertisements"
              />

               <select
               className={controlClassName}
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
            className={controlClassName}
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

          <div>
        {/* <label htmlFor="minPrice">
          Minimum price
        </label> */}

        <input
        className={controlClassName}
          id="minPrice"
          name="minPrice"
          type="number"
          min="0"
          step="0.01"
          defaultValue={minPriceInput}
          placeholder="Minimum price"
        />
      </div>

      <div>
        {/* <label htmlFor="maxPrice">
          Maximum price
        </label> */}

        <input
        className={controlClassName}
          id="maxPrice"
          name="maxPrice"
          type="number"
          min="0"
          step="0.01"
          defaultValue={maxPriceInput}
          placeholder="Maximum price"
        />
      </div>

    <div className="flex flex-wrap gap-3 sm:col-span-2 lg:col-span-5">
              <Button type="submit">
                Search advertisements
              </Button>

                <Button asChild variant="outline">
              <Link href="/ads">
                Clear filters
              </Link>
            </Button>

            </div>



            </div>
            </form>


              {hasInvalidPriceRange && (
          <p role="alert" className="text-sm text-destructive">
            Minimum price cannot be greater than maximum price.
          </p>
        )}


      {advertisements.length === 0 ?  (
           <p>
  {hasInvalidPriceRange
    ? "Please correct the price range."
    : keyword
      ? `No advertisements found for "${keyword}".`
      : "No advertisements match the selected filters."}
</p>
            ) : (
              <>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {advertisements.map((advertisement) => (
                <article
                  key={advertisement.id}
                 className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md p-5"
                >

                {advertisement.images[0] ? (
                  <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-lg">
                    <Image
                      src={advertisement.images[0].filePath}
                      alt={advertisement.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">
                      No image available
                    </p>
                  </div>
                )}

                  <h2 className="text-lg font-semibold leading-tight">
                    {advertisement.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {advertisement.category.name}
                    {" · "}
                    {advertisement.location.name}
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {advertisement.description}
                  </p>

                  <p className="mt-4 text-xl font-bold">
                    LKR {advertisement.price.toString()}
                  </p>

                 <Button asChild className="mt-5 w-full">
                <Link href={`/ads/${advertisement.id}`}>
                  View details
                </Link>
              </Button>

              
                </article>
              ))}
            </div>
            </>
            )}

          
    </main>
  );
}