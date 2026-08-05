"use server";

import { revalidatePath } from "next/cache";

import {
  AdvertisementStatus,
  ModerationDecision,
} from "@/generated/prisma/enums";
import { requireModerator } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import {z} from "zod";
import { rejectAdvertisementSchema } from "@/validations/moderation";
import { RejectAdvertisementState } from "@/types/moderation-action";

export async function approveAdvertisement( 
    advertisementId: string,
    _formData: FormData
) : Promise<void>{

        const moderator = await requireModerator();

        if (!advertisementId || advertisementId.trim().length === 0) {
            throw new Error("A valid advertisement ID is required.");
        }

        try {

            await prisma.$transaction(async(tx) => {

                  const updateResult = await tx.advertisement.updateMany({
                        where: {
                        id: advertisementId,
                        status: AdvertisementStatus.PENDING,
                        isDeleted: false,
                        },
                        data: {
                        status: AdvertisementStatus.ACTIVE,
                        },
                    });

                      if (updateResult.count !== 1) {
                            throw new Error(
                            "This advertisement is no longer available for approval."
                            );
                        }


                await tx.moderation.create({
                    data:{
                        advertisementId,
                        moderatorId: moderator.id,
                        decision: ModerationDecision.APPROVED,
                        note: null,
                    }
                })

            })
            
        } catch (error) {
            console.error("APPROVE ADVERTISEMENT ERROR:", error);

    throw new Error(
      "The advertisement could not be approved. It may already have been reviewed."
    );
        }

          revalidatePath("/moderator");
  revalidatePath("/my-ads");
}

export async function rejectAdvertisement(
     advertisementId: string,
    _previousState: RejectAdvertisementState,
    formData: FormData
): Promise<RejectAdvertisementState>  {
      const moderator = await requireModerator();

    if (!advertisementId || advertisementId.trim().length === 0) {
    return {
      fieldErrors: {},
      message: "A valid advertisement ID is required.",
    };
  }


  const validationResult = rejectAdvertisementSchema.safeParse({
    note: formData.get("note"),
  });


    if (!validationResult.success) {
    const errors = z.flattenError(
      validationResult.error
    ).fieldErrors;

    return {
      fieldErrors: {
        note: errors.note,
      },
      message: "Please correct the highlighted field.",
    };
  }


   try {
    await prisma.$transaction(async (tx) => {
      const updateResult =
        await tx.advertisement.updateMany({
          where: {
            id: advertisementId,
            status: AdvertisementStatus.PENDING,
            isDeleted: false,
          },
          data: {
            status: AdvertisementStatus.REJECTED,
          },
        });

    if (updateResult.count !== 1) {
        throw new Error(
          "The advertisement is no longer available for rejection."
        );
      }

         await tx.moderation.create({
        data: {
          advertisementId,
          moderatorId: moderator.id,
          decision: ModerationDecision.REJECTED,
          note: validationResult.data.note,
        },
      });
    });


  } catch (error) {
        console.error("REJECT ADVERTISEMENT ERROR:", error);

    return {
      fieldErrors: {},
      message:
        "The advertisement could not be rejected. It may already have been reviewed.",
    };
  }

  revalidatePath("/moderator");
  revalidatePath("/my-ads");
  revalidatePath(`/ads/${advertisementId}`);

   return {
    fieldErrors: {},
    message: null,
  };

}