import React from "react";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MediaManager from "@/app/admin/programs/[programid]/manage/MediaManager";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CopyLinkButton } from "./CopyLinkButton";

type PageProps = {
  params: Promise<{ programid: string }>; // Mark params as a Promise
};

interface Program {
  id: string;
  name: string;
  media_files: {
    images?: string[];
    videos?: string[];
    pdfs?: string[];
  };
  overview?: string;
  additional_links?: {
    title: string;
    url: string;
    description?: string;
  }[];
  created_at: string;
  updated_at: string;
  user_id: string;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params; // Await params
  try {
    const program = await getProgram(params.programid);
    return {
      title: program ? `View ${program.name}` : "Program Not Found",
      description: program ? `View program: ${program.name}` : undefined,
    };
  } catch (error) {
    console.error("Metadata generation error:", error);
    return {
      title: "Program View",
    };
  }
}

async function getProgram(programId: string): Promise<Program | null> {
  if (!programId || typeof programId !== "string") {
    console.error("Invalid program ID received:", programId);
    return null;
  }

  try {
    const supabase = await createClient(); // Added await here
    const { data: program, error } = await supabase
      .from("programs")
      .select("*")
      .eq("id", programId)
      .single();

    if (error || !program) {
      console.error("Database error or program not found:", error);
      return null;
    }

    // Fetch media URLs for program
    if (program.media_files) {
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

export default async function ProgramViewPage(props: PageProps) {
  const params = await props.params; // Await params
  const program = await getProgram(params.programid);

  if (!program) {
    notFound();
    return null;
  }

  const supabase = await createClient(); // Ensure createClient is awaited
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    // Optionally, handle unauthenticated user
  }

  // Fetch the affiliate information for the logged-in user
  const { data: affiliateData, error: affiliateError } = await supabase
    .from("affiliates")
    .select("affiliate_id")
    .eq("work_email", data?.user?.email) // Assuming work_email is unique for affiliate identification
    .single();

  if (affiliateError || !affiliateData) {
    console.error("Error fetching affiliate data:", affiliateError);
    // Optionally handle error or missing affiliate
  }

  const affiliateId = affiliateData?.affiliate_id;

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
  const isAdmin = data?.user?.email
    ? adminEmails.includes(data.user.email)
    : false;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link
          href="/programs"
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
        <CardContent>
          {program.overview && (
            <p className="text-sm text-gray-700">{program.overview}</p>
          )}
        </CardContent>
      </Card>

      {/* Display Links */}
      {program.additional_links && program.additional_links.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Additional Links</CardTitle>
          </CardHeader>
          <CardContent>
            {program.additional_links.map((link, index) => (
              <div key={index} className="border-b pb-2 mb-2">
                <p className="font-bold">{link.title}</p>

                {/* Construct the URL with the affiliate ID */}
                {affiliateId && (
                  <div className="flex items-center space-x-2">
                    {" "}
                    {/* Added flex container with spacing */}
                    <a
                      href={`${link.url}?sourceId=${affiliateId}`}
                      className="text-blue-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.url}?sourceId={affiliateId}
                    </a>
                    <CopyLinkButton
                      link={`${link.url}?sourceId=${affiliateId}`}
                      className="h-4 w-4"
                    />
                  </div>
                )}

                {/* Display description if it exists */}
                {link.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {link.description}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Media Manager */}
      {program.media_files && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Media Files</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaManager
              mediaFiles={program.media_files}
              programId={program.id}
              isAdmin={isAdmin}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
