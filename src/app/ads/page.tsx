import { AdvertisementStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

type AdsPageProps = {
  searchParams: Promise<{
    q?: string | string[];
  }>;
};

export default async function AdsPage( {searchParams} : AdsPageProps ) {

  const params = await searchParams;

  const keyword = typeof params.q === "string" ? params.q.trim() : "";

const advertisements = await prisma.advertisement.findMany({
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

  return (
    <main>
      <h1>Advertisements</h1>

      {advertisements.length === 0 ?  (
            <p>No active advertisements are currently available.</p>
            ) : (

              <>
              <form method="GET" action="/ads">
              <input
                type="search"
                name="q"
                defaultValue={keyword}
                placeholder="Search advertisements"
              />

              <button type="submit">
                Search
              </button>
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