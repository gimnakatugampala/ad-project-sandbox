import { notFound } from "next/navigation";

import { AdvertisementStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { getCurrentUser } from "@/lib/authorization";
import { UserStatus } from "@/generated/prisma/enums";

import Image from "next/image";

type AdvertisementDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdvertisementDetailsPage({
  params,
}: AdvertisementDetailsPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();
  const canViewSellerContact = currentUser?.status === UserStatus.ACTIVE;

  const advertisement = await prisma.advertisement.findFirst({
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
      images: {
  select: {
    id: true,
    filePath: true,
    isPrimary: true,
    createdAt: true,
  },
  orderBy: {
    createdAt: "asc",
  },
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

      {advertisement.images.length > 0 ? (
  <section className="mt-6">
    <h2 className="sr-only">
      Advertisement images
    </h2>

    <div className="grid gap-4 sm:grid-cols-2">
      {advertisement.images.map((image) => (
        <div
          key={image.id}
          className="relative aspect-[4/3] overflow-hidden rounded-lg border"
        >
          <Image
            src={image.filePath}
            alt={advertisement.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      ))}
    </div>
  </section>
) : (
  <div className="mt-6 flex aspect-video items-center justify-center rounded-lg bg-muted">
    <p className="text-muted-foreground">
      No images available
    </p>
  </div>
)}

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
          {advertisement.user.name ? (canViewSellerContact ?  advertisement.user.name : "*".repeat(advertisement.user.name.length) ):  "Registered seller"}
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