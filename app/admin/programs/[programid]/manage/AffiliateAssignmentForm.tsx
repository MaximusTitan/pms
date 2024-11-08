"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, XCircle } from "lucide-react";

interface Affiliate {
  id: number;
  full_name: string;
  work_email: string;
}

interface AffiliateAssignmentFormProps {
  programId: string;
  affiliates: Affiliate[];
}

export default function AffiliateAssignmentForm({
  programId,
  affiliates,
}: AffiliateAssignmentFormProps) {
  const [selectedAffiliate, setSelectedAffiliate] = useState<number | null>(
    null
  );
  const [assignedAffiliate, setAssignedAffiliate] = useState<Affiliate | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleAffiliateAssignment = async () => {
    setError(null); // Reset error state
    if (selectedAffiliate) {
      const supabase = createClient();
      const { error } = await supabase
        .from("affiliate_programs")
        .insert([{ affiliate_id: selectedAffiliate, program_id: programId }]);

      if (error) {
        console.error("Error assigning affiliate:", error);
        setError("Failed to assign affiliate. Please try again.");
      } else {
        const assigned = affiliates.find((aff) => aff.id === selectedAffiliate);
        if (assigned) {
          setAssignedAffiliate(assigned);
        }
      }
    }
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={(value) => setSelectedAffiliate(Number(value))}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an Affiliate" />
        </SelectTrigger>
        <SelectContent>
          {affiliates.map((affiliate) => (
            <SelectItem key={affiliate.id} value={affiliate.id.toString()}>
              {affiliate.full_name} - {affiliate.work_email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        onClick={handleAffiliateAssignment}
        disabled={!selectedAffiliate}
        className="w-full"
      >
        Assign to Program
      </Button>

      {assignedAffiliate && (
        <div className="flex items-center text-green-600 space-x-2">
          <CheckCircle className="w-5 h-5" />
          <p>
            Successfully assigned affiliate:{" "}
            <strong>{assignedAffiliate.full_name}</strong>
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center text-red-600 space-x-2">
          <XCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
