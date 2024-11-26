"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import AffiliateAssignmentForm from "./AffiliateAssignmentForm"; // Ensure this is a client component
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Affiliate {
  id: number;
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
        full_name: string;
        work_email: string;
      }
    | {
        id: number;
        full_name: string;
        work_email: string;
      }[];
}

interface ProgramManageClientProps {
  programId: string;
}

const ProgramManageClient: React.FC<ProgramManageClientProps> = ({
  programId,
}) => {
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
          .select("id, full_name, work_email");

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

  return (
    <>
      <AffiliateAssignmentForm
        programId={programId}
        affiliates={allAffiliates}
      />

      {/* Display Assigned Affiliates */}
      {assignedAffiliates && assignedAffiliates.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Assigned Affiliates</h3>
          <ul className="list-disc list-inside">
            {assignedAffiliates.map((assignment) => (
              <li key={assignment.affiliate_id} className="flex items-center">
                <span className="flex-1">
                  {assignment.affiliate
                    ? `${assignment.affiliate.full_name} (${assignment.affiliate.work_email})`
                    : "No affiliate details available"}
                </span>
                <button
                  onClick={() => handleUnassign(assignment.affiliate_id)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
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
