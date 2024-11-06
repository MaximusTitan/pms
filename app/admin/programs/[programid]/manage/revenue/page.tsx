import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Program } from "@/types/database";

interface PageProps {
  params: {
    programId: string;
  };
}

export default async function RevenuePage({ params }: PageProps) {
  const supabase = createClient();
  // Fetch program details
  const { data: program, error } = await supabase
    .from("programs")

    .select("*")
    .eq("id", params.programId)
    .single();

  if (error || !program) {
    notFound();
  }

  return (
    <div>
      <h1>Revenue & Payouts for Program {program?.name}</h1>
      <p>Revenue and payouts management content goes here.</p>
    </div>
  );
}
