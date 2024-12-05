import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Program } from "@/types/program";
import { createClient } from "@/utils/supabase/client";

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);

  const getAdminEmails = () => {
    const emails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
    return emails.split(",").map((email) => email.trim());
  };

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const authorizedEmails = getAdminEmails();

      const isAdminUser = authorizedEmails.includes(user?.email || "");

      setIsAdmin(isAdminUser);
    };
    fetchUser();
  }, [supabase]);

  const handleManageClick = () => {
    const programPath = isAdmin
      ? `/admin/programs/${program.id}/manage` // Pass isAdmin as a query parameter
      : `/programs/view/${program.id}`;
    console.log("Navigating to:", programPath, "Program ID:", program.id);
    router.push(programPath);
  };

  return (
    <Card className="dark:bg-neutral-800">
      <CardHeader>
        <CardTitle className="text-xl text-rose-500">{program.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {program.overview && (
            <p className="text-sm text-gray-700">{program.overview}</p>
          )}
          {program.additional_links.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Additional Links:</h3>
              {program.additional_links.map((link, index) => (
                <div key={index} className="border-b pb-2 mb-2">
                  <p className="font-bold">{link.title}</p>
                  <a href={link.url} className="text-blue-500" target="_blank">
                    {link.url}
                  </a>
                  {link.description && (
                    <p className="text-sm text-gray-600">{link.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          {program.media_files && (
            <div>
              <span className="font-semibold">Media Files:</span>
              <ul className="list-disc list-inside">
                {program.media_files.images &&
                  program.media_files.images.length > 0 && (
                    <li>{program.media_files.images.length} Images</li>
                  )}
                {program.media_files?.videos &&
                  program.media_files.videos.length > 0 && (
                    <li>{program.media_files.videos.length} Videos</li>
                  )}
                {program.media_files?.pdfs &&
                  program.media_files.pdfs.length > 0 && (
                    <li>{program.media_files.pdfs.length} PDFs</li>
                  )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleManageClick}
          className="w-full bg-rose-500 hover:bg-rose-600"
        >
          {isAdmin ? "Manage Program" : "View Program"}
        </Button>
      </CardFooter>
      {/* If needed, pass isAdmin to MediaManager or other components */}
    </Card>
  );
}
