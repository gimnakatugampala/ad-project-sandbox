import { notFound } from "next/navigation";

import { AdvertisementStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import { getCurrentUser } from "@/lib/authorization";
import { UserStatus } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";

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
        user: {
          status: UserStatus.ACTIVE,
        },
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
orderBy: [
  {
    isPrimary: "desc",
  },
  {
    createdAt: "asc",
  },
],
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
          email: true,
        },
      },
    },
  });

if (!advertisement) {
  notFound();
}

const primaryImage = advertisement.images[0];
const additionalImages = advertisement.images.slice(1);

const formattedPrice = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 2,
}).format(Number(advertisement.price));

  return (
  <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

    <Link
  href="/ads"
  className="inline-flex text-sm font-medium text-muted-foreground transition hover:text-foreground"
>
  ← Back to advertisements
</Link>
    

   <article className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
      <div className="mb-4">
       <div className="flex flex-wrap gap-2">


      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        {advertisement.category.name}
      </span>

      <span className="rounded-full border px-3 py-1 text-xs font-medium">
        {advertisement.location.name}
      </span>
    </div>
    <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight">
  {advertisement.title}
</h1>
      </div>

   <p className="mt-4 text-3xl font-bold">
  {formattedPrice}
</p>
      {advertisement.images.length > 0 ? (
<section>
  <h2 className="sr-only">
    Advertisement images
  </h2>

  {primaryImage ? (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted shadow-sm">
      <Image
        src={primaryImage.filePath}
        alt={`${advertisement.title} main image`}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 65vw"
      />
    </div>
  ) : (
    <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border bg-muted">
      <p className="text-muted-foreground">
        No images available
      </p>
    </div>
  )}

{additionalImages.length > 0 && (
  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
    {additionalImages.map((image, index) => (
      <div
        key={image.id}
        className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted"
      >
        <Image
          src={image.filePath}
          alt={`${advertisement.title} image ${index + 2}`}
          fill
          className="object-cover transition duration-300 hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      </div>
    ))}
  </div>
)}


  </section>
) : (
  <div className="mt-6 flex aspect-video items-center justify-center rounded-lg bg-muted">
    <p className="text-muted-foreground">
      No images available
    </p>
  </div>
)}

<div className="lg:sticky lg:top-24 lg:self-start">
  <div className="rounded-2xl border bg-card p-6 shadow-sm">


  
    <section className="mt-6 border-t pt-6">
  <h2 className="text-lg font-semibold">
    Description
  </h2>

  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
    {advertisement.description}
  </p>
</section>

     <section className="mt-6 border-t pt-6">
  <h2 className="text-lg font-semibold">
    Seller information
  </h2>

  {canViewSellerContact ? (
    <div className="mt-4 rounded-xl bg-muted/50 p-4">
      <p className="font-medium">
        {advertisement.user.name ?? "Registered seller"}
      </p>

      {advertisement.user.email && (
        <Button asChild className="mt-4 w-full">
          <a href={`mailto:${advertisement.user.email}`}>
            Contact seller
          </a>
        </Button>
      )}
    </div>
  ) : currentUser ? (
    <div className="mt-4 rounded-xl border bg-muted/40 p-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Your account is currently restricted. Seller contact
        information is unavailable.
      </p>
    </div>
  ) : (
    <div className="mt-4 rounded-xl border bg-muted/40 p-4">
      <p className="text-sm leading-6 text-muted-foreground">
        Sign in to view the seller’s contact information.
      </p>

      <Button asChild className="mt-4 w-full">
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(
            `/ads/${advertisement.id}`
          )}`}
        >
          Sign in to contact seller
        </Link>
      </Button>
    </div>
  )}
</section>

      <p className="mt-6 text-sm text-muted-foreground">
        Submitted{" "}
        {advertisement.createdAt.toLocaleDateString(
          "en-LK"
        )}
      </p>

      </div>
      </div>
    </article>
  </main>
);
}