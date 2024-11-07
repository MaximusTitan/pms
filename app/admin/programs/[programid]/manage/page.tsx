import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";

// Import ShadCN UI components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import MediaManager from "./MediaManager"; // Directly import MediaManager

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
            // If the URL is already complete, no need to fetch it again
            if (path.startsWith("https://")) {
              return path; // Return the URL as it is
            }

            // If the path is not a full URL, then get the public URL
            const { data } = supabase.storage
              .from("program-media")
              .getPublicUrl(path);

            // Check if data or data.publicUrl is null
            if (!data?.publicUrl) {
              console.warn(
                `Warning: Could not retrieve public URL for path ${path}`
              );
              return null; // Return null if the public URL is not available
            }

            return data.publicUrl;
          })
        );
      };

      const [images, videos, pdfs] = await Promise.all([
        getUrls(program.media_files.images || []),
        getUrls(program.media_files.videos || []),
        getUrls(program.media_files.pdfs || []),
      ]);

      // Filter out any null values in case there were errors retrieving URLs
      program.media_files = {
        images: images.filter((url) => url !== null),
        videos: videos.filter((url) => url !== null),
        pdfs: pdfs.filter((url) => url !== null),
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
      <Card>
        <CardHeader>
          <CardTitle>{program.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h2 className="font-semibold">Landing Page URL</h2>
              <p>{program.landing_page_url}</p>
            </div>
            <div>
              <h2 className="font-semibold">Commission Details</h2>
              <p>
                {program.commission_value} {program.currency} (
                {program.commission_type})
              </p>
            </div>
            <div>
              <h2 className="font-semibold">Recurring Commission</h2>
              <p>{program.recurring_commission ? "Yes" : "No"}</p>
            </div>
            <div>
              <h2 className="font-semibold">Media Files</h2>
              {/* Pass media files to MediaManager */}
              <MediaManager mediaFiles={program.media_files} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add helper functions
function copyLink(url: string) {
  navigator.clipboard.writeText(url);
}

function editMedia(url: string, type: "images" | "videos" | "pdfs") {
  // Implementation for editing media
}

function addMedia(type: "images" | "videos" | "pdfs") {
  // Implementation for adding new media
}
