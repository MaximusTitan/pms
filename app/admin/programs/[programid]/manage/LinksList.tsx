"use client";

import React from "react";
import { Trash2, Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AdditionalLinksForm from "./AdditionalLinksForm"; // Ensure import is at the top

interface AdditionalLink {
  title: string;
  url: string;
  description?: string;
}

interface LinksListProps {
  programId: string;
  links: AdditionalLink[];
}

const LinksList: React.FC<LinksListProps> = ({ programId, links }) => {
  const router = useRouter();

  const handleDelete = async (index: number) => {
    const updatedLinks = links.filter((_, i) => i !== index);

    const supabase = await createClient();
    const { error } = await supabase
      .from("programs")
      .update({
        additional_links: updatedLinks,
      })
      .eq("id", programId);

    if (error) {
      console.error("Error deleting link:", error);
    } else {
      router.refresh();
    }
  };

  const handleEdit = (index: number) => {
    // Implement edit functionality here, such as opening an edit form/modal
    console.log(`Edit link at index: ${index}`);
  };

  return (
    <>
      {links.length > 0 ? (
        <ul className="space-y-4">
          {links.map((link, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-1">
                <p className="font-semibold text-blue-600 hover:underline">
                  {link.title}
                </p>
                {link.description && (
                  <p className="text-sm text-gray-700">{link.description}</p>
                )}
              </div>
              <div className="ml-4 flex space-x-2">
                <button
                  onClick={() => handleEdit(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No links available.</p>
      )}

      {/* Display the form to add new links */}
      <AdditionalLinksForm programId={programId} existingLinks={links} />
    </>
  );
};

export default LinksList;
