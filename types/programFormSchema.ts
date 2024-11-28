import { z } from "zod";

export const programFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  additional_links: z.array(z.string().url("Invalid URL")), // Removed .optional()
  commission_type: z.enum(["fixed", "percentage"]),
  commission_value: z.number().min(0, "Commission value must be non-negative"),
  currency: z.string().min(1, "Currency is required"),
  recurring_commission: z.boolean(),
  media_files: z.object({
    images: z.array(z.string().url()),
    videos: z.array(z.string().url()),
    pdfs: z.array(z.string().url()),
  }),
});

export type ProgramFormData = z.infer<typeof programFormSchema>;

// ...existing code...
