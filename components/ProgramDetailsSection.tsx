"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import MediaManager from "@/app/admin/programs/[programid]/manage/MediaManager";

export interface Program {
  id: string;
  name: string;
  overview?: string;
  additional_links: {
    title: string;
    url: string;
    description?: string;
  }[];
  media_files: {
    images?: string[];
    videos?: string[];
    pdfs?: string[];
  };
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ProgramDetailsSectionProps {
  program: Program;
}

export const ProgramDetailsSection: React.FC<ProgramDetailsSectionProps> = ({
  program,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Link
          href="/admin/programs"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Programs
        </Link>
        <h1 className="text-2xl font-bold">{program.name}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-700">{program.overview}</p>
              {program.additional_links.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Additional Links:</h3>
                  {program.additional_links.map((link, index) => (
                    <div key={index} className="border-b pb-4 mb-4">
                      <h4 className="font-bold">{link.title}</h4>
                      <a
                        href={link.url}
                        className="text-blue-500"
                        target="_blank"
                      >
                        {link.url}
                      </a>
                      {link.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {link.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Program Creatives</CardTitle>
          </CardHeader>
          <CardContent>
            <MediaManager mediaFiles={program.media_files} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};
