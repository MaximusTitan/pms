import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

// Define TypeScript interface for Program
interface Program {
  id: string;
  name: string;
  landing_page_url: string;
  commission_type: string;
  commission_value: number;
  currency: string;
  recurring_commission: boolean;
  media_files: {
    images?: string[];
    videos?: string[];
    pdfs?: string[];
  };
  created_at: string;
  updated_at: string;
  user_id: string;
}

type PageProps = {
  params: Promise<{ programid: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Add metadata generation
export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const program = await getProgram(resolvedParams.programid);

  return {
    title: program ? `Manage ${program.name}` : "Program Not Found",
  };
}

async function getProgram(programId: string): Promise<Program | null> {
  // Check if we have valid programId
  if (!programId || programId === "undefined") {
    console.error("Invalid program ID received:", programId);
    return null;
  }

  try {
    // Initialize Supabase client
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      redirect("/login");
    }

    // Fetch program with user check
    const { data: program, error } = await supabase
      .from("programs")
      .select("*")
      .eq("id", programId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Record not found
        console.error("Program not found");
        return null;
      }
      console.error("Database error:", error);
      return null;
    }

    // Get public URLs for media files if they exist
    if (program?.media_files) {
      const getUrls = async (paths: string[] = []) => {
        return Promise.all(
          paths.map(async (path) => {
            const { data } = supabase.storage
              .from("program-media")
              .getPublicUrl(path);
            return data.publicUrl;
          })
        );
      };

      const [images, videos, pdfs] = await Promise.all([
        getUrls(program.media_files.images),
        getUrls(program.media_files.videos),
        getUrls(program.media_files.pdfs),
      ]);

      program.media_files = {
        images,
        videos,
        pdfs,
      };
    }

    return program;
  } catch (error) {
    console.error("Error in getProgram:", error);
    return null;
  }
}

export default async function ProgramManagePage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const program = await getProgram(resolvedParams.programid);

  if (!program) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{program.name}</h1>
      <div className="grid gap-4 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold">Landing Page URL</h2>
            <p className="text-gray-600">{program.landing_page_url}</p>
          </div>
          <div>
            <h2 className="font-semibold">Commission Details</h2>
            <p className="text-gray-600">
              {program.commission_value} {program.currency} (
              {program.commission_type})
            </p>
          </div>
          <div>
            <h2 className="font-semibold">Recurring Commission</h2>
            <p className="text-gray-600">
              {program.recurring_commission ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <h2 className="font-semibold">Media Files</h2>
            <ul className="text-gray-600">
              <li>Images: {program.media_files?.images?.length || 0}</li>
              <li>Videos: {program.media_files?.videos?.length || 0}</li>
              <li>PDFs: {program.media_files?.pdfs?.length || 0}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
