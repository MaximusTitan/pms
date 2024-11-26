"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Program = {
  id: string;
  name: string;
  created_at: string;
  media_files: any;
  additional_links: any;
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: affiliateData, error: affiliateError } = await supabase
          .from("affiliates")
          .select("id")
          .eq("work_email", user.email)
          .single();

        if (affiliateError) throw affiliateError;

        const { data: programs, error: programsError } = await supabase
          .from("programs")
          .select(
            `
            *,
            affiliate_programs!inner(*)
          `
          )
          .eq("affiliate_programs.affiliate_id", affiliateData.id);

        if (programsError) throw programsError;
        setPrograms(programs);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch programs"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, [supabase]);

  const handleProgramClick = (programId: string) => {
    router.push(`/programs/${programId}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">My Programs</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <div
            key={program.id}
            className="p-4 border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleProgramClick(program.id)}
          >
            <h2 className="text-xl font-semibold mb-2">{program.name}</h2>
            <p className="text-sm text-gray-600">
              Added: {new Date(program.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
