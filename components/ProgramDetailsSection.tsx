"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import MediaManager from "@/components/MediaManager";

export interface Program {
  id: string;
  name: string;
  landing_page_url: string;
  commission_type: string;
  commission_value: number;
  currency: string;
  recurring_commission: boolean;
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
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">
                Landing Page URL
              </h3>
              <p className="mt-1">{program.landing_page_url}</p>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-500">Commission</h3>
              <p className="mt-1">
                {program.commission_value} {program.currency} (
                {program.commission_type})
                {program.recurring_commission && " - Recurring"}
              </p>
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
