import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface PageProps {
  params: {
    programId: string;
  };
}

export default async function CreativesPage({ params }: PageProps) {
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
      <h1>Creatives for Program {program?.name}</h1>
      <p>Creatives management content goes here.</p>
    </div>
  );
}
