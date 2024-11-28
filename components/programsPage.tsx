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
    console.log("Fetching public URLs for file paths:", filePaths);
    const promises = filePaths.map((filePath) => {
      const publicData = supabase.storage
        .from("program-media")
        .getPublicUrl(filePath).data;
      // Removed error handling as 'error' does not exist
      return publicData?.publicUrl || filePath;
    });
    const results = await Promise.all(promises);
    console.log("Fetched public URLs:", results);
    return results;
  };

  useEffect(() => {
    async function fetchPrograms() {
      console.log("fetchPrograms called.");
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

        console.log("User authenticated:", user);

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

        console.log("Programs fetched from database:", programsData);

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
          programsData.map(async (program: ProgramData) => {
            console.log("Processing program:", program.id);
            return {
              ...program,
              additional_links: program.additional_links, // Ensure this field is included
              media_files: {
                images: await fetchPublicUrls(
                  program.media_files?.images || []
                ),
                videos: await fetchPublicUrls(
                  program.media_files?.videos || []
                ),
                pdfs: await fetchPublicUrls(program.media_files?.pdfs || []),
              },
            };
          })
        );

        console.log("Programs with public URLs:", programsWithUrls);
        setPrograms(programsWithUrls);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Error fetching programs:", error);

        toast({
          title: "Error",
          description: errorMessage || "Unknown error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        console.log("fetchPrograms completed. Loading state:", loading);
      }
    }

    fetchPrograms();
  }, [supabase, toast]);

  const handleProgramCreated = async (program: Program) => {
    console.log("handleProgramCreated called with program:", program);
    try {
      // Fetch the newly created program data without specifying relationships
      console.log(`Fetching created program with ID: ${program.id}`);
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
        console.warn("No program data returned for ID:", program.id);
        throw new Error("No program data returned");
      }

      console.log("Fetched created program data:", data);

      const programWithUrls = {
        ...data,
        media_files: {
          images: await fetchPublicUrls(data.media_files?.images || []),
          videos: await fetchPublicUrls(data.media_files?.videos || []),
          pdfs: await fetchPublicUrls(data.media_files?.pdfs || []),
        },
      };

      console.log("Program with public URLs:", programWithUrls);
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
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-neutral-900">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-800 dark:text-neutral-200" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 bg-white dark:bg-neutral-900">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
          Affiliate Programs
        </h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-400 dark:hover:bg-rose-500"
        >
          Create New Program
        </Button>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500 dark:text-neutral-400">
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
        onOpenChange={(open) => {
          console.log("CreateProgramDialog open state changed to:", open);
          setIsCreating(open);
        }}
        onSuccess={handleProgramCreated}
      />
    </div>
  );
}
