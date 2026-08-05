"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { advertisementSchema } from "@/validations/advertisement";
import type { CreateAdvertisementState } from "@/types/advertisement-action";
import z from "zod";
import { AdvertisementStatus } from "@/generated/prisma/enums";

export async function createAdvertisement(
   _previousState: CreateAdvertisementState,
  formData: FormData
) : Promise<CreateAdvertisementState> {
     const user = await requireUser();

      const validationResult = advertisementSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        price: formData.get("price"),
        categoryId: formData.get("categoryId"),
        locationId: formData.get("locationId"),
    });


    if(!validationResult.success){
        const errors = z.flattenError(validationResult.error).fieldErrors;

        return {
            fieldErrors :{
                title: errors.title,
                description: errors.description,
                price: errors.price,
                categoryId: errors.categoryId,
                locationId: errors.locationId,
            },
            message: "Please correct the highlighted fields.",

        }
    }

      const data = validationResult.data;

      const [category, location] = await Promise.all([
        prisma.category.findFirst({
            where:{
                id: data.categoryId,
                parentId: {
                not: null,
                },
            },
             select: {
                id: true,
            },
        }),
        prisma.location.findUnique({
            where :{
                id: data.locationId
            },
            select:{
                id:true
            }
        })
      ])

       const databaseFieldErrors: CreateAdvertisementState["fieldErrors"] = {};

       if(!category){
        databaseFieldErrors.categoryId = [
            "Please select a valid advertisement category."
        ]
       }

       if(!location){
        databaseFieldErrors.locationId = [
            "Please select a valid location."
        ]
       }

       if(!category || !location){
        return {
            fieldErrors: databaseFieldErrors,
            message: "Some of the selected information is invalid.",
        }
       }

       try {

        await prisma.advertisement.create({
            data :{
                title: data.title,
                description: data.description,
                price: data.price,
                categoryId: data.categoryId,
                locationId: data.locationId,
                userId: user.id,
                 status: AdvertisementStatus.PENDING,
            }
        })

       }catch(error){
    console.error("CREATE ADVERTISEMENT ERROR:", error);

        return {
        fieldErrors: {},
        message:
            "The advertisement could not be created. Please try again.",
        };
  
       }

        revalidatePath("/my-ads");
    redirect("/my-ads");
    
}