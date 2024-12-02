import * as z from "zod";

export interface MediaFiles {
  images?: string[];
  videos?: string[];
  pdfs?: string[];
}

export interface Link {
  title: string;
  url: string;
  description?: string;
}

export interface Program {
  id: string;
  user_id: string | null;
  name: string;
  overview?: string;
  additional_links: Link[];
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
  overview: z.string().optional(),
  additional_links: z.array(
    z.object({
      title: z.string().min(1, "Title is required"),
      url: z.string().url("Invalid URL"),
      description: z.string().optional(),
    })
  ),
  media_files: z.object({
    images: z.array(z.string().url()),
    videos: z.array(z.string().url()),
    pdfs: z.array(z.string().url()),
  }),
});

export type ProgramFormData = z.infer<typeof programFormSchema>;