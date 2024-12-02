export type Program = {
  id: string;
  name: string;
  overview?: string;
  media_files: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  additional_links: any; // Stored as JSONB
}