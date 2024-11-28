import * as z from "zod";

export interface MediaFiles {
  images?: string[];
  videos?: string[];
  pdfs?: string[];
}

export interface Program {
  id: string;
  user_id: string | null;
  name: string;
  additional_links: string[]; // Ensured as required
  commission_type: string;
  commission_value: number;
  currency: string;
  recurring_commission: boolean;
  media_files: MediaFiles | null;
  created_at: string;
  updated_at: string;
}

export interface FileInputState {
  images: string;
  videos: string;
  pdfs: string;
}

export const programFormSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  additional_links: z.array(z.string().url("Invalid URL")), // Removed .optional()
  commission_type: z.enum(["fixed", "percentage"]),
  commission_value: z.number().min(0.01, "Commission value must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  recurring_commission: z.boolean(),
  media_files: z.object({
    images: z.array(z.string().url()),
    videos: z.array(z.string().url()),
    pdfs: z.array(z.string().url()),
  }),
});

export type ProgramFormData = z.infer<typeof programFormSchema>;