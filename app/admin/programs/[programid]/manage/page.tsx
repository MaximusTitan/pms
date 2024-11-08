import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MediaManager from "./MediaManager"; // Directly import MediaManager
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import AffiliateAssignmentForm from "./AffiliateAssignmentForm";

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

type PageProps = {
  params: Promise<{ programid: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Metadata generation function
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

// Fetch program details
async function getProgram(programId: string): Promise<Program | null> {
  if (!programId || programId === "undefined") {
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

export default async function ProgramManagePage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await params;
  const programId = resolvedParams.programid;

  const supabase = await createClient();
  const program = await getProgram(programId);

  // Fetch all affiliates
  const { data: allAffiliates, error: affiliatesError } = await supabase
    .from("affiliates")
    .select<"id,full_name,work_email", Affiliate>("id,full_name,work_email");

  if (affiliatesError) {
    console.error("Error fetching affiliates:", affiliatesError);
    return null;
  }

  // Fetch already assigned affiliates for the program
  const { data: assignedAffiliates, error: assignedAffiliatesError } =
    await supabase
      .from("affiliate_programs")
      .select<
        "affiliate_id,program_id,assigned_at,affiliate:affiliates(id,full_name,work_email)",
        AssignedAffiliate
      >("affiliate_id,program_id,assigned_at,affiliate:affiliates(id,full_name,work_email)")
      .eq("program_id", programId);

  if (assignedAffiliatesError) {
    console.error(
      "Error fetching assigned affiliates:",
      assignedAffiliatesError
    );
    return null;
  }

  if (!program) {
    notFound();
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

      <Card>
        <CardHeader>
          <CardTitle>Assign Affiliate to Program</CardTitle>
        </CardHeader>
        <CardContent>
          <AffiliateAssignmentForm
            programId={programId}
            affiliates={allAffiliates || []}
          />
        </CardContent>
      </Card>

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
              <h2 className="text-2xl font-semibold">Creatives</h2>
              <MediaManager mediaFiles={program.media_files} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Affiliates</CardTitle>
        </CardHeader>
        <CardContent>
          {assignedAffiliates && assignedAffiliates.length > 0 ? (
            <ul className="list-disc list-inside">
              {assignedAffiliates.map((assignment) => (
                <li key={assignment.affiliate_id}>
                  {assignment.affiliate ? (
                    <span>
                      {assignment.affiliate.full_name} (
                      {assignment.affiliate.work_email})
                    </span>
                  ) : (
                    <span>No affiliate details available</span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No affiliates assigned to this program yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
