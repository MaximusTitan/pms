"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import AffiliateAssignmentForm from "./AffiliateAssignmentForm"; // Ensure this is a client component
import { Copy, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // Import the useToast hook

interface Affiliate {
  id: number;
  affiliate_id: string; // Add affiliate_id from affiliates table
  full_name: string;
  work_email: string;
}

interface AssignedAffiliate {
  affiliate_id: number;
  program_id: string;
  assigned_at: string;
  affiliate: Affiliate;
}

interface DatabaseAffiliateProgram {
  affiliate_id: number;
  program_id: string;
  assigned_at: string;
  affiliate: {
    id: number;
    affiliate_id: string;
    full_name: string;
    work_email: string;
  };
}

interface RawDatabaseResponse {
  affiliate_id: number;
  program_id: string;
  assigned_at: string;
  affiliate:
    | {
        id: number;
        affiliate_id: string;
        full_name: string;
        work_email: string;
      }
    | {
        id: number;
        affiliate_id: string;
        full_name: string;
        work_email: string;
      }[];
}

interface ProgramManageClientProps {
  programId: string;
  programUrl: string; // Add the programUrl prop
}

const ProgramManageClient: React.FC<ProgramManageClientProps> = ({
  programId,
  programUrl, // Destructure programUrl
}) => {
  const { toast } = useToast(); // Initialize the toast
  const [allAffiliates, setAllAffiliates] = useState<Affiliate[]>([]);
  const [assignedAffiliates, setAssignedAffiliates] = useState<
    AssignedAffiliate[]
  >([]);

  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("affiliates")
          .select("id, affiliate_id, full_name, work_email"); // Include affiliate_id

        if (error) {
          console.error("Error fetching affiliates:", error);
          return;
        }

        setAllAffiliates(data || []);
      } catch (error) {
        console.error("Error in fetchAffiliates:", error);
      }
    };

    const fetchAssignedAffiliates = async () => {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("affiliate_programs")
          .select(
            `
          affiliate_id,
          program_id,
          assigned_at,
          affiliate:affiliates (
            id,
            affiliate_id,
            full_name,
            work_email
          )
        `
          )
          .eq("program_id", programId);

        if (error) {
          console.error("Error fetching assigned affiliates:", error);
          return;
        }

        if (data) {
          const transformedData: AssignedAffiliate[] = (
            data as RawDatabaseResponse[]
          ).map((item) => ({
            affiliate_id: item.affiliate_id,
            program_id: item.program_id,
            assigned_at: item.assigned_at,
            affiliate: Array.isArray(item.affiliate)
              ? item.affiliate[0]
              : item.affiliate,
          }));

          setAssignedAffiliates(transformedData);
        } else {
          setAssignedAffiliates([]);
        }
      } catch (error) {
        console.error("Error in fetchAssignedAffiliates:", error);
      }
    };

    fetchAffiliates();
    fetchAssignedAffiliates();
  }, [programId]);

  const handleUnassign = async (affiliateId: number) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("affiliate_programs")
        .delete()
        .eq("program_id", programId)
        .eq("affiliate_id", affiliateId);

      if (error) {
        console.error("Error unassigning affiliate:", error);
        return;
      }

      // Update state after successful unassignment
      setAssignedAffiliates((prev) =>
        prev.filter((assignment) => assignment.affiliate_id !== affiliateId)
      );
    } catch (error) {
      console.error("Error in handleUnassign:", error);
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    // Replace alert with toast notification
    toast({
      title: "Copied!",
      description: "URL copied to clipboard.",
      variant: "default",
    });
  };

  return (
    <>
      <AffiliateAssignmentForm
        programId={programId}
        affiliates={allAffiliates}
      />

      {/* Display Assigned Affiliates */}
      {assignedAffiliates && assignedAffiliates.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Assigned Affiliates
          </h3>
          <ul className="space-y-4">
            {assignedAffiliates.map((assignment) => (
              <li
                key={assignment.affiliate_id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm"
              >
                <div>
                  <p className="text-lg text-gray-700">
                    {assignment.affiliate.full_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {assignment.affiliate.work_email}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Display the program URL as a clickable link */}
                  <a
                    href={`${programUrl}?sourceId=${assignment.affiliate.affiliate_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline break-all"
                  >
                    {`${programUrl}?sourceId=${assignment.affiliate.affiliate_id}`}
                  </a>
                  <button
                    onClick={() =>
                      handleCopy(
                        `${programUrl}?sourceId=${assignment.affiliate.affiliate_id}`
                      )
                    }
                    className="text-neutral-500 hover:text-neutral-700"
                    aria-label="Copy URL"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleUnassign(assignment.affiliate_id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Unassign Affiliate"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">
          No affiliates assigned to this program yet.
        </p>
      )}
    </>
  );
};

export default ProgramManageClient;
