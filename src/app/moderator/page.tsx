import { AdvertisementStatus } from "@/generated/prisma/enums";
import { requireModerator } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { approveAdvertisement } from "@/app/actions/moderation-actions";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { RejectAdvertisementForm } from "@/components/moderation/reject-advertisement-form";


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
        },
        orderBy: {
        createdAt: "asc",
        },
    });


    return(
        <main>
        <h1>Moderator Dashboard</h1>
        <p>Moderator: {moderator.email}</p>

       {pendingAdvertisements && pendingAdvertisements.length == 0 ? "No Advertisements yet" : 
       pendingAdvertisements.map((advertisement) => (
            <article key={advertisement.id}>
                <p>{advertisement.title ?? advertisement.title}</p>
                <p>{advertisement.user.name ?? advertisement.user.email}</p>
                <p>{advertisement.price.toString()}</p>

                {advertisement.images.length > 0 ? (
  <div className="my-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
    {advertisement.images.map((image) => (
      <div
        key={image.id}
        className="relative aspect-square overflow-hidden rounded-lg border"
      >
        <Image
          src={image.filePath}
          alt={advertisement.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
      </div>
    ))}
  </div>
) : (
  <p className="my-4 text-sm text-muted-foreground">
    No images were uploaded.
  </p>
)}

       
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <form
                            action={approveAdvertisement.bind(
                            null,
                            advertisement.id
                            )}
                        >
                            <Button type="submit">
                            Approve
                            </Button>
                        </form>

                        <RejectAdvertisementForm
                            advertisementId={advertisement.id}
                        />
                        </div>
            </article>
        ))}

        </main>
    )

}