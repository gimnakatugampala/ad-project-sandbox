
import { z } from "zod";

export const advertisementSchema = z.object({
    title: z
            .string()
            .trim()
            .min(5,"Title must contain at least 5 characters")
            .max(200,"Title cannot exceed 200 characters"),
    description: z
            .string()
            .trim()
            .min(20, "Description must contain at least 20 characters.")
            .max(5000, "Description cannot exceed 5,000 characters."),
    price: z
            .coerce
            .number()
            .positive("Price must be greater than zero.")
            .max(9_999_999_999.99, "Price is too large."),

    categoryId: z
            .string()
            .trim()
            .min(1, "Please select a category."),

    locationId: z
            .string()
            .trim()
            .min(1, "Please select a location."),
})

export type AdvertisementInput = z.infer<
  typeof advertisementSchema
>;