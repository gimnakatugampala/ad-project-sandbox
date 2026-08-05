import { AdvertisementStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export default async function AdsPage() {

const advertisements = await prisma.advertisement.findMany({
  where: {
    status: AdvertisementStatus.ACTIVE,
    isDeleted: false,
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
    </article>
  ))}
</div>
            )}

          
    </main>
  );
}