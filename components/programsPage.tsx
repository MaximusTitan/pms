"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ProgramCard } from "@/components/ProgramCard";
import { CreateProgramDialog } from "@/components/CreateProgramDialog";
import { Program } from "@/types/program";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const supabase = createClient();

  // Add a helper function to fetch public URLs in parallel
  const fetchPublicUrls = async (filePaths: string[]) => {
    const promises = filePaths.map((filePath) => {
      const { data: publicData } = supabase.storage
        .from("program-media")
        .getPublicUrl(filePath);
      return publicData?.publicUrl || filePath;
    });
    return Promise.all(promises);
  };

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Authentication error:", userError.message);
          toast({
            title: "Authentication Error",
            description: "Please sign in to view your programs",
            variant: "destructive",
          });
          return;
        }

        if (!user) {
          toast({
            title: "Not Authenticated",
            description: "Please sign in to view your programs",
            variant: "destructive",
          });
          return;
        }

        // Fetch programs without specifying relationships
        const { data: programsData, error: programsError } = await supabase
          .from("programs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (programsError) {
          console.error("Database error:", programsError.message);
          throw new Error(`Failed to fetch programs: ${programsError.message}`);
        }

        if (!programsData) {
          console.warn("No programs found");
          setPrograms([]);
          return;
        }

        interface MediaFile {
          images: string[];
          videos: string[];
          pdfs: string[];
        }

        interface ProgramData extends Omit<Program, "media_files"> {
          media_files?: {
            images?: string[];
            videos?: string[];
            pdfs?: string[];
          };
        }

        interface ProgramWithUrls extends Program {
          media_files: MediaFile;
        }

        const programsWithUrls: ProgramWithUrls[] = await Promise.all(
          programsData.map(async (program: ProgramData) => ({
            ...program,
            media_files: {
              images: await fetchPublicUrls(program.media_files?.images || []),
              videos: await fetchPublicUrls(program.media_files?.videos || []),
              pdfs: await fetchPublicUrls(program.media_files?.pdfs || []),
            },
          }))
        );

        setPrograms(programsWithUrls);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error fetching programs:", errorMessage);

        toast({
          title: "Error",
          description: errorMessage || "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, [supabase, toast]);

  const handleProgramCreated = async (program: Program) => {
    try {
      // Fetch the newly created program data without specifying relationships
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", program.id)
        .single();

      if (error) {
        console.error("Error fetching created program:", error.message);
        throw new Error(`Failed to fetch program data: ${error.message}`);
      }

      if (!data) {
        throw new Error("No program data returned");
      }

      const programWithUrls = {
        ...data,
        media_files: {
          images: await fetchPublicUrls(data.media_files?.images || []),
          videos: await fetchPublicUrls(data.media_files?.videos || []),
          pdfs: await fetchPublicUrls(data.media_files?.pdfs || []),
        },
      };

      setPrograms((prevPrograms) => [programWithUrls, ...prevPrograms]);
      setIsCreating(false);

      toast({
        title: "Success",
        description: "Program created successfully",
      });
    } catch (error) {
      console.error("Error handling created program:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      toast({
        title: "Warning",
        description: `Program created but failed to refresh data: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Affiliate Programs</h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white"
        >
          Create New Program
        </Button>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No programs created yet. Create your first program!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => {
            console.log("Rendering program card with ID:", program.id);
            return <ProgramCard key={program.id} program={program} />;
          })}
        </div>
      )}

      <CreateProgramDialog
        open={isCreating}
        onOpenChange={setIsCreating}
        onSuccess={handleProgramCreated}
      />
    </div>
  );
}
