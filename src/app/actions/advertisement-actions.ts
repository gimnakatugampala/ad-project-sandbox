"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { advertisementSchema } from "@/validations/advertisement";
import type { CreateAdvertisementState } from "@/types/advertisement-action";
import z from "zod";
import { AdvertisementStatus } from "@/generated/prisma/enums";

import { mkdir, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

const MAX_AD_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

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

    const images = formData
    .getAll("images")
    .filter(
        (value): value is File =>
        value instanceof File && value.size > 0
    );

if (
  images.length === 0 ||
  images.length > MAX_AD_IMAGES
) {
  return {
    fieldErrors: {
      images: [
        "Please upload between 1 and 5 images.",
      ],
    },
    message: "Please correct the highlighted fields.",
  };
}

const invalidTypeImage = images.find(
  (image) => !IMAGE_EXTENSIONS[image.type]
);

if (invalidTypeImage) {
  return {
    fieldErrors: {
      images: [
        "Only JPG, PNG and WebP images are allowed.",
      ],
    },
    message: "Please correct the highlighted fields.",
  };
}

const oversizedImage = images.find(
  (image) => image.size > MAX_IMAGE_SIZE
);

if (oversizedImage) {
  return {
    fieldErrors: {
      images: [
        "Each image must be 5 MB or smaller.",
      ],
    },
    message: "Please correct the highlighted fields.",
  };
}


const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "ads"
);

await mkdir(uploadDirectory, {
  recursive: true,
});

const savedImages: {
  absolutePath: string;
  publicPath: string;
}[] = [];



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

               for (const image of images) {
  const extension = IMAGE_EXTENSIONS[image.type];
  const filename = `${randomUUID()}${extension}`;

  const absolutePath = path.join(
    uploadDirectory,
    filename
  );

        const publicPath = `/uploads/ads/${filename}`;

        const bytes = await image.arrayBuffer();

        await writeFile(
            absolutePath,
            Buffer.from(bytes)
        );

        savedImages.push({
            absolutePath,
            publicPath,
        });
        }


        await prisma.advertisement.create({
            data :{
                title: data.title,
                description: data.description,
                price: data.price,
                categoryId: data.categoryId,
                locationId: data.locationId,
                userId: user.id,
                 status: AdvertisementStatus.PENDING,
                 
                    images: {
                    create: savedImages.map(
                        (image, index) => ({
                        filePath: image.publicPath,
                        isPrimary: index === 0,
                        })
                    ),
                    },
            }
        })

 

       }catch(error){
          await Promise.allSettled(
    savedImages.map((image) =>
      rm(image.absolutePath, {
        force: true,
      })
    )
  );
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

export async function deleteAdvertisement(
  advertisementId: string,
  _formData: FormData
): Promise<void> {
  const user = await requireUser();

  if (!advertisementId?.trim()) {
    throw new Error("A valid advertisement ID is required.");
  }

  const result = await prisma.advertisement.updateMany({
    where: {
      id: advertisementId,
      userId: user.id,
      isDeleted: false,
    },
    data: {
      isDeleted: true,
    },
  });

  if (result.count !== 1) {
    throw new Error(
      "The advertisement was not found or does not belong to you."
    );
  }

  revalidatePath("/my-ads");
  revalidatePath("/ads");
  revalidatePath(`/ads/${advertisementId}`);
}