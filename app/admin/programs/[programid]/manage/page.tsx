import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MediaManager from "./MediaManager"; // Client Component
import { ChevronLeft, Trash2, Edit3 } from "lucide-react"; // Import icons
import Link from "next/link";
import AffiliateAssignmentForm from "./AffiliateAssignmentForm"; // Client Component
import LinksList from "./LinksList"; // Client Component
import ProgramManageClient from "./ProgramManageClient"; // Import the new client component

// Add segment configuration
export const dynamic = "force-dynamic";
export const runtime = "edge";

// Add dynamic segment configuration
type PageParams = {
  programid: string;
};

interface Program {
  id: string;
  name: string;
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
  additional_links?: {
    title: string;
    url: string;
    description?: string;
  }[];
}

interface Affiliate {
  id: number;
  full_name: string;
  work_email: string;
}

interface AssignedAffiliate {
  affiliate_id: number;
  program_id: string;
  assigned_at: string;
  affiliate: Affiliate;
}

// Update metadata function to await params
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const program = await getProgram(resolvedParams.programid);
    return {
      title: program ? `Manage ${program.name}` : "Program Not Found",
      description: program ? `Manage program: ${program.name}` : undefined,
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "Program Management",
    };
  }
}

// Strengthen error handling in getProgram
async function getProgram(programId: string): Promise<Program | null> {
  if (!programId || typeof programId !== "string") {
    console.error("Invalid program ID received:", programId);
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      redirect("/login");
    }

    const { data: program, error } = await supabase
      .from("programs")
      .select("*")
      .eq("id", programId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return null;
    }

    // Fetch media URLs for program
    if (program?.media_files) {
      const getUrls = async (paths: string[] = []) =>
        Promise.all(
          paths.map(async (path) =>
            path.startsWith("https://")
              ? path
              : (
                  await supabase.storage
                    .from("program-media")
                    .getPublicUrl(path)
                ).data?.publicUrl || null
          )
        );

      const [images, videos, pdfs] = await Promise.all([
        getUrls(program.media_files.images || []),
        getUrls(program.media_files.videos || []),
        getUrls(program.media_files.pdfs || []),
      ]);

      program.media_files = {
        images: images.filter(Boolean),
        videos: videos.filter(Boolean),
        pdfs: pdfs.filter(Boolean),
      };
    }

    return program;
  } catch (error) {
    console.error("Error in getProgram:", error);
    return null;
  }
}

// Update page component to await params
export default async function ProgramManagePage({
  params,
}: {
  params: Promise<PageParams> | PageParams;
}) {
  try {
    const resolvedParams = await params;
    const program = await getProgram(resolvedParams.programid);

    if (!program) {
      notFound();
      return null;
    }

    return (
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <Link
            href="/admin/programs"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Programs
          </Link>
        </div>

        {/* Program Name at the Top */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{program.name}</CardTitle>
          </CardHeader>
        </Card>

        {/* Display Links with Minimal UI */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent>
            <LinksList
              programId={program.id}
              links={program.additional_links || []}
            />
          </CardContent>
        </Card>

        {/* Media Manager */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Creatives</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaManager mediaFiles={program.media_files} />
          </CardContent>
        </Card>

        {/* Assign and Display Affiliates */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Affiliates</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Render the client component */}
            <ProgramManageClient programId={program.id} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Page render error:", error);
    throw error; // Let Next.js error boundary handle it
  }
}
