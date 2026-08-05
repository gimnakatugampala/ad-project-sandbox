import { notFound } from "next/navigation";

import { AdvertisementStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

type AdvertisementDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdvertisementDetailsPage({
  params,
}: AdvertisementDetailsPageProps) {
  const { id } = await params;

  const advertisement =
  await prisma.advertisement.findFirst({
    where: {
      id,
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

      user: {
        select: {
          name: true,
        },
      },
    },
  });

if (!advertisement) {
  notFound();
}

  return (
  <main className="mx-auto max-w-4xl p-6">
    <article className="rounded-xl border p-6">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {advertisement.category.name}
          {" · "}
          {advertisement.location.name}
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {advertisement.title}
        </h1>
      </div>

      <p className="text-2xl font-semibold">
        LKR {advertisement.price.toString()}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">
          Description
        </h2>

        <p className="mt-2 whitespace-pre-wrap">
          {advertisement.description}
        </p>
      </section>

      <section className="mt-8 border-t pt-5">
        <h2 className="font-semibold">
          Seller information
        </h2>

        <p className="mt-2 text-muted-foreground">
          {advertisement.user.name ?? "Registered seller"}
        </p>
      </section>

      <p className="mt-6 text-sm text-muted-foreground">
        Submitted{" "}
        {advertisement.createdAt.toLocaleDateString(
          "en-LK"
        )}
      </p>
    </article>
  </main>
);
}