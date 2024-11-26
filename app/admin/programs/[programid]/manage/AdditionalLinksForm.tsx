"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface Link {
  title: string;
  url: string;
  description?: string;
}

interface AdditionalLinksFormProps {
  programId: string;
  existingLinks: Link[];
}

export default function AdditionalLinksForm({
  programId,
  existingLinks,
}: AdditionalLinksFormProps) {
  const [links, setLinks] = useState<Link[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const router = useRouter();

  const handleAddLink = () => {
    setIsAdding(true);
    setLinks([{ title: "", url: "", description: "" }]);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setLinks([]);
  };

  const handleChange = (index: number, field: keyof Link, value: string) => {
    const updatedLinks = links.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    setLinks(updatedLinks);
  };

  const handleSubmit = async () => {
    // Filter out empty links
    const newLinks = links.filter((link) => link.title && link.url);
    // Combine existing links with new links
    const updatedLinks = [...existingLinks, ...newLinks];

    const supabase = await createClient();
    const { error } = await supabase
      .from("programs")
      .update({
        additional_links: updatedLinks,
      })
      .eq("id", programId);

    if (error) {
      console.error("Error updating links:", error);
    } else {
      router.refresh();
      setIsAdding(false);
      setLinks([]);
    }
  };

  return (
    <div className="mt-4">
      {!isAdding ? (
        <button
          type="button"
          onClick={handleAddLink}
          className="p-2 bg-rose-500 text-white rounded"
        >
          Add New Link
        </button>
      ) : (
        <div className="mb-4 border p-4 rounded-lg bg-gray-50">
          {links.map((link, index) => (
            <div key={index} className="mb-4">
              <label className="block mb-1 font-semibold">Title</label>
              <input
                type="text"
                placeholder="Title"
                value={link.title}
                onChange={(e) => handleChange(index, "title", e.target.value)}
                className="block w-full mb-2 p-2 border rounded"
              />
              <label className="block mb-1 font-semibold">URL</label>
              <input
                type="url"
                placeholder="URL"
                value={link.url}
                onChange={(e) => handleChange(index, "url", e.target.value)}
                className="block w-full mb-2 p-2 border rounded"
              />
              <label className="block mb-1 font-semibold">Description</label>
              <textarea
                placeholder="Description"
                value={link.description}
                onChange={(e) =>
                  handleChange(index, "description", e.target.value)
                }
                className="block w-full mb-2 p-2 border rounded"
              />
            </div>
          ))}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="p-2 bg-green-500 text-white rounded"
            >
              Save Links
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 bg-gray-300 text-gray-700 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
