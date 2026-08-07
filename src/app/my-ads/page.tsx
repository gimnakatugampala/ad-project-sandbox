import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ImageOff,
  MapPin,
  PackageOpen,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

import { deleteAdvertisement } from "@/app/actions/advertisement-actions";
import {
  AdvertisementStatus,
  ModerationDecision,
} from "@/generated/prisma/enums";

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

function getStatusBadgeVariant(status: AdvertisementStatus) {
  switch (status) {
    case AdvertisementStatus.ACTIVE:
      return "default" as const;
    case AdvertisementStatus.REJECTED:
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export default async function MyAdsPage() {
  const user = await requireUser();

  const advertisements = await prisma.advertisement.findMany({
    where: {
      userId: user.id,
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      status: true,
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
      images: {
        select: {
          id: true,
          filePath: true,
        },
        take: 1,
      },
      moderations: {
        where: {
          decision: ModerationDecision.REJECTED,
        },
        select: {
          note: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const pendingCount = advertisements.filter(
    (advertisement) => advertisement.status === AdvertisementStatus.PENDING
  ).length;

  const activeCount = advertisements.filter(
    (advertisement) => advertisement.status === AdvertisementStatus.ACTIVE
  ).length;

  const rejectedCount = advertisements.filter(
    (advertisement) => advertisement.status === AdvertisementStatus.REJECTED
  ).length;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            My advertisements
          </h1>
          <p className="mt-2 text-muted-foreground">
            Track the status of your listings and manage what you&apos;ve
            posted.
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/ads/new">Post an advertisement</Link>
        </Button>
      </div>

      {advertisements.length > 0 && (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md sm:gap-4">
          <div className="rounded-lg border p-4">
            <p className="text-2xl font-semibold tabular-nums">
              {activeCount}
            </p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-2xl font-semibold tabular-nums">
              {pendingCount}
            </p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-2xl font-semibold tabular-nums">
              {rejectedCount}
            </p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </div>
        </div>
      )}

      {advertisements.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <PackageOpen className="h-6 w-6 text-muted-foreground" />
          </div>

          <h2 className="mt-4 font-medium">
            You haven&apos;t posted anything yet
          </h2>

          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first advertisement and it will appear here once
            you submit it.
          </p>

          <Button asChild className="mt-6">
            <Link href="/ads/new">Create advertisement</Link>
          </Button>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {advertisements.map((advertisement) => {
          const image = advertisement.images[0];
          const rejection = advertisement.moderations[0];

          return (
            <article
              key={advertisement.id}
              className="overflow-hidden rounded-xl border transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row">
                <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:h-28 sm:w-28">
                  {image ? (
                    <Image
                      src={image.filePath}
                      alt={advertisement.title}
                      fill
                      sizes="(min-width: 640px) 112px, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold">
                        {advertisement.title}
                      </h2>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <span>{advertisement.category.name}</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {advertisement.location.name}
                        </span>
                      </div>
                    </div>

                    <Badge variant={getStatusBadgeVariant(advertisement.status)}>
                      {advertisement.status}
                    </Badge>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                    {advertisement.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">
                        {currencyFormatter.format(Number(advertisement.price))}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        Submitted {dateFormatter.format(advertisement.createdAt)}
                      </p>
                    </div>

                    <form
                      action={deleteAdvertisement.bind(null, advertisement.id)}
                    >
                      <Button type="submit" variant="destructive" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>

                  {advertisement.status === AdvertisementStatus.PENDING && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 shrink-0" />
                      Waiting for moderator review.
                    </p>
                  )}

                  {advertisement.status === AdvertisementStatus.ACTIVE && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Live and publicly visible.
                    </p>
                  )}

                  {advertisement.status === AdvertisementStatus.REJECTED && (
                    <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                      <p className="flex items-center gap-1.5 font-medium text-destructive">
                        <XCircle className="h-4 w-4 shrink-0" />
                        Advertisement rejected
                      </p>
                      <p className="mt-2 text-sm">
                        {rejection?.note ?? "No rejection reason was provided."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}