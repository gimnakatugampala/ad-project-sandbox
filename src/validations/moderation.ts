import { z } from "zod";

export const rejectAdvertisementSchema = z.object({
  note: z
    .string()
    .trim()
    .min(5, "Please provide a rejection reason.")
    .max(500, "The rejection reason cannot exceed 500 characters."),
});