import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";

import { deleteAdvertisement } from "@/app/actions/advertisement-actions";


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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main>


    <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-semibold">
        My advertisements
      </h1>

      <p className="text-sm text-muted-foreground">
        View and manage the advertisements you have submitted.
      </p>
    </div>

    <Button asChild>
      <Link href="/ads/new">Create advertisement</Link>
    </Button>
  </div>

  {advertisements.length === 0 && (
  <div className="rounded-lg border p-8 text-center">
    <h2 className="font-medium">
      You have not created any advertisements
    </h2>

    <p className="mt-2 text-sm text-muted-foreground">
      Create your first advertisement to get started.
    </p>

    <Button asChild className="mt-4">
      <Link href="/ads/new">Create advertisement</Link>
    </Button>
  </div>
)}


<div className="space-y-4">
  {advertisements.map((advertisement) => (
    <article
      key={advertisement.id}
      className="rounded-lg border p-5"
    >
     <h2 className="text-lg font-semibold">
      {advertisement.title}
    </h2>

    <p className="text-sm text-muted-foreground">
      {advertisement.category.name}
      {" · "}
      {advertisement.location.name}
    </p>

    <p className="mt-3 font-medium">
      LKR {advertisement.price.toString()}
    </p>

    <span className="rounded-full border px-2 py-1 text-xs font-medium">
  {advertisement.status}
</span>

<p className="text-xs text-muted-foreground">
  Submitted{" "}
  {advertisement.createdAt.toLocaleDateString()}
</p>

<p className="mt-3 line-clamp-2 text-sm">
  {advertisement.description}
</p>
<form
  action={deleteAdvertisement.bind(
    null,
    advertisement.id
  )}
  className="mt-4"
>
  <Button type="submit" variant="destructive">
    Remove advertisement
  </Button>
</form>
    </article>
  ))}
</div>


    </main>
  );
}