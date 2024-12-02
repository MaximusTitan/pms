import { z } from "zod";

const linkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Invalid URL"),
  description: z.string().optional(),
});

export const programFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  overview: z.string().optional(),
  additional_links: z
    .array(linkSchema)
    .nonempty({ message: "At least one additional link is required" }),
  media_files: z.object({
    images: z.array(z.string().url()),
    videos: z.array(z.string().url()),
    pdfs: z.array(z.string().url()),
  }),
});

export type ProgramFormData = z.infer<typeof programFormSchema>;

// ...existing code...
