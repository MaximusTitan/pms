import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";
import type { Program } from "@/types/database";

export async function GET(req: NextRequest) {
  const programId = req.nextUrl.searchParams.get("programId");
  const supabase = await createClient();

  if (!programId) {
    return new Response(JSON.stringify({ message: "Program ID is required" }), {
      status: 400,
    });
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ message: "User not authenticated" }), {
      status: 403,
    });
  }

  const { data, error } = await supabase
    .from("programs")
    .select("*")
    .eq("id", programId)
    .single();

  if (error) {
    return new Response(
      JSON.stringify({
        message: "Error fetching program details",
        error: error.message,
      }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ program: data }), { status: 200 });
}