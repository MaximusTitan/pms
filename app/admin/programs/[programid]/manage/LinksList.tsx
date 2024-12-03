"use client";

import React, { useState } from "react";
import { Trash2, Edit3, Save, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import AdditionalLinksForm from "./AdditionalLinksForm";

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
  const [editedLinks, setEditedLinks] = useState<AdditionalLink[]>(links);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  const handleDelete = async (index: number) => {
    if (editedLinks.length <= 1) {
      alert("At least one link is required.");
      return;
    }

    const updatedLinks = editedLinks.filter((_, i) => i !== index);
    setEditedLinks(updatedLinks);

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

  const handleEditChange = (
    index: number,
    field: keyof AdditionalLink,
    value: string
  ) => {
    const updatedLinks = editedLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    setEditedLinks(updatedLinks);
  };

  const handleSave = async (index: number) => {
    setIsEditing(null);

    const supabase = await createClient();
    const { error } = await supabase
      .from("programs")
      .update({
        additional_links: editedLinks,
      })
      .eq("id", programId);

    if (error) {
      console.error("Error saving link:", error);
    } else {
      router.refresh();
    }
  };

  return (
    <>
      {editedLinks.length > 0 ? (
        <ul className="space-y-4">
          {editedLinks.map((link, index) => (
            <li key={index} className="flex items-start">
              {isEditing === index ? (
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) =>
                      handleEditChange(index, "title", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) =>
                      handleEditChange(index, "url", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={link.description || ""}
                    onChange={(e) =>
                      handleEditChange(index, "description", e.target.value)
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>
              ) : (
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{link.title}</p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-500 hover:underline"
                  >
                    {link.url}
                  </a>
                  {link.description && (
                    <p className="text-sm text-gray-700">{link.description}</p>
                  )}
                </div>
              )}
              <div className="ml-4 flex space-x-2">
                {isEditing === index ? (
                  <>
                    <button
                      onClick={() => handleSave(index)}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsEditing(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(index)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    {editedLinks.length > 1 && (
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No links available.</p>
      )}
      <AdditionalLinksForm programId={programId} existingLinks={editedLinks} />
    </>
  );
};

export default LinksList;
