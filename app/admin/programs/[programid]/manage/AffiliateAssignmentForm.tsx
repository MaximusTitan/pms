"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface Affiliate {
  id: number;
  full_name: string;
  work_email: string;
}

interface AffiliateAssignmentFormProps {
  programId: string;
  affiliates: Affiliate[];
}

const AffiliateAssignmentForm: React.FC<AffiliateAssignmentFormProps> = ({
  programId,
  affiliates,
}) => {
  const [selectedAffiliate, setSelectedAffiliate] = useState<number | null>(
    null
  );
  const [open, setOpen] = useState(false);
  const [assignedAffiliate, setAssignedAffiliate] = useState<Affiliate | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleAffiliateAssignment = async () => {
    setError(null); // Reset error state
    if (selectedAffiliate) {
      const supabase = await createClient();
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
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedAffiliate
              ? affiliates.find(
                  (affiliate) => affiliate.id === selectedAffiliate
                )?.full_name
              : "Select an Affiliate"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search affiliate..." />
            <CommandList>
              <CommandEmpty>No affiliate found.</CommandEmpty>
              <CommandGroup>
                {affiliates.map((affiliate) => (
                  <CommandItem
                    key={affiliate.id}
                    value={`${affiliate.full_name} - ${affiliate.work_email}`}
                    onSelect={() => {
                      setSelectedAffiliate(affiliate.id);
                      setOpen(false);
                    }}
                  >
                    {affiliate.full_name} - {affiliate.work_email}
                    <Check
                      className={cn(
                        "ml-auto",
                        selectedAffiliate === affiliate.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

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
};

export default AffiliateAssignmentForm;
