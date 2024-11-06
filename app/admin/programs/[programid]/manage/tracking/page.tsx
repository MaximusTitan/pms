import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Program } from "@/types/database";

interface PageProps {
  params: {
    programId: string;
  };
}

export default async function ProgramTrackingPage({ params }: PageProps) {
  const supabase = await createClient();

  // Fetch program details
  const { data: program, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", params.programId)
    .single();

  if (error) {
    console.error("Error fetching program:", error);
    return notFound();
  }

  console.log("Program data:", program);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Manage tracking settings for {program?.name}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">
            Configure tracking parameters and view analytics for this program.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
