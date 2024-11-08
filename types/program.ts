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
  landing_page_url: string;
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
  landing_page_url: z.string().url("Please enter a valid URL"),
  commission_type: z.enum(["fixed", "percentage"]),
  commission_value: z.number().min(0.01, "Commission value must be greater than 0"),
  currency: z.string().min(1, "Currency is required"),
  recurring_commission: z.boolean(),
  media_files: z.object({
    images: z.array(z.string()),
    videos: z.array(z.string()),
    pdfs: z.array(z.string()),
  }),
});

export type ProgramFormData = z.infer<typeof programFormSchema>;