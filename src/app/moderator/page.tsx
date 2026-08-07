import { AdvertisementStatus } from "@/generated/prisma/enums";
import { requireModerator } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { approveAdvertisement } from "@/app/actions/moderation-actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { RejectAdvertisementForm } from "@/components/moderation/reject-advertisement-form";
import { Badge } from "@/components/ui/badge";


export default async function ModeratorPage(){
    const moderator = await requireModerator();


    const pendingAdvertisements =
    await prisma.advertisement.findMany({
        where: {
        status: AdvertisementStatus.PENDING,
        isDeleted: false,
        },
        select: {
        id: true,
        title: true,
        description: true,
        price: true,
        createdAt: true,
        user: {
            select: {
            name: true,
            email: true,
            },
        },
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
        },
        orderBy: {
        createdAt: "asc",
        },
    });



    return(
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Moderator dashboard
      </h1>

      <p className="mt-2 text-muted-foreground">
        Review advertisements before they become publicly visible.
      </p>
    </div>

    <Badge variant="secondary" className="w-fit">
      {pendingAdvertisements.length} pending
    </Badge>
  </div>

  <p className="mt-3 text-sm text-muted-foreground">
    Signed in as {moderator.email ?? "Moderator"}
  </p>

       {pendingAdvertisements.length === 0 ? (
  <div className="mt-8 rounded-2xl border bg-card p-10 text-center shadow-sm">
    <h2 className="text-lg font-semibold">
      Moderation queue is empty
    </h2>

    <p className="mt-2 text-sm text-muted-foreground">
      There are currently no advertisements waiting for review.
    </p>
  </div>
) : 
       pendingAdvertisements.map((advertisement) => {
        const formattedPrice = new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            maximumFractionDigits: 2,
            }).format(Number(advertisement.price));


          return (<article
                key={advertisement.id}
                className="overflow-hidden rounded-2xl border bg-card shadow-sm p-3"
                >

                <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">
                            {advertisement.category.name}
                        </Badge>

                        <Badge variant="secondary">
                            {advertisement.location.name}
                        </Badge>
                        </div>

                        <h2 className="mt-4 text-2xl font-bold tracking-tight">
                        {advertisement.title}
                        </h2>

                        <p className="mt-3 text-2xl font-semibold">
                        {formattedPrice}
                        </p>

                        <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                        {advertisement.description}
                        </p>
                </div>


                {advertisement.images[0] ? (
                <div className="mt-6">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border bg-muted">
                    <Image
                        src={advertisement.images[0].filePath}
                        alt={`${advertisement.title} main image`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 65vw"
                    />
                    </div>

                    {advertisement.images.length > 1 && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {advertisement.images.slice(1).map((image, index) => (
                        <div
                            key={image.id}
                            className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
                        >
                            <Image
                            src={image.filePath}
                            alt={`${advertisement.title} image ${index + 2}`}
                            fill
                            className="object-cover"
                            sizes="25vw"
                            />
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                ) : (
                <div className="mt-6 flex aspect-video items-center justify-center rounded-xl border bg-muted">
                    <p className="text-sm text-muted-foreground">
                    No images were uploaded.
                    </p>
                </div>
                )}

                <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Seller
                        </p>

                        <p className="mt-1 font-medium">
                        {advertisement.user.name ?? "Registered seller"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Email
                        </p>

                        <p className="mt-1 break-all text-sm">
                        {advertisement.user.email ?? "Not available"}
                        </p>
                    </div>
                    </div>

                    <p className="mt-5 text-xs text-muted-foreground">
                        Submitted{" "}
                        {advertisement.createdAt.toLocaleDateString("en-LK", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                        </p>

       <aside className="border-t bg-muted/30 p-5 sm:p-6 lg:border-l lg:border-t-0">
       <h3 className="text-lg font-semibold">
            Moderation decision
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review the title, description, price, seller and images before
            making a final decision.
            </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
               <form
                action={approveAdvertisement.bind(
                    null,
                    advertisement.id
                )}
                className="mt-6"
                >
                <Button type="submit" className="w-full">
                    Approve advertisement
                </Button>
                </form>

                <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs uppercase text-muted-foreground">
                    Or reject
                </span>
                <div className="h-px flex-1 bg-border" />
                </div>

                <RejectAdvertisementForm
                    advertisementId={advertisement.id}
                />
                </div>
                </aside>
            </article>)
})}

        </main>
    )

}