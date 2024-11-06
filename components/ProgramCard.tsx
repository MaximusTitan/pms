import { useState } from "react";
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

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const router = useRouter();

  return (
    <Card className="dark:bg-neutral-800">
      <CardHeader>
        <CardTitle className="text-xl text-rose-500">{program.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Commission:</span>{" "}
            {program.commission_value} {program.currency}
          </p>
          <p>
            <span className="font-semibold">Type:</span>{" "}
            {program.commission_type}
          </p>
          <p>
            <span className="font-semibold">Recurring:</span>{" "}
            {program.recurring_commission ? "Yes" : "No"}
          </p>
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
          onClick={() => router.push(`/admin/programs/${program.id}/manage`)}
          className="w-full bg-rose-500 hover:bg-rose-600"
        >
          Manage Program
        </Button>
      </CardFooter>
    </Card>
  );
}
