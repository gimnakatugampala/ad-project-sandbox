import { AdvertisementStatus } from "@/generated/prisma/enums";
import { requireModerator } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { approveAdvertisement } from "@/app/actions/moderation-actions";
import { Button } from "@/components/ui/button";

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