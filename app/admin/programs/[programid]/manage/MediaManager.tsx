"use client";

import React, { useState } from "react";
// Replace Modal import with Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2, Maximize2, XCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input"; // Import the Input component from shadcn UI

interface MediaFiles {
  images?: string[];
  videos?: string[];
  pdfs?: string[];
}

interface MediaManagerProps {
  mediaFiles: MediaFiles;
  programId: string;
  isAdmin: boolean; // Ensure isAdmin is received as a prop
}

const MediaManager: React.FC<MediaManagerProps> = ({
  mediaFiles,
  programId,
  isAdmin, // Destructure isAdmin
}) => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof MediaFiles
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file, type);
    }
  };

  const handleUpload = async (file: File, type: keyof MediaFiles) => {
    try {
      setUploading(true);
      const supabase = createClient();
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("program-media")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("program-media")
        .getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      const updatedMedia = {
        ...mediaFiles,
        [type]: [...(mediaFiles[type] || []), publicUrl],
      };

      const { error } = await supabase
        .from("programs")
        .update({ media_files: updatedMedia })
        .eq("id", programId);

      if (error) {
        throw error;
      }

      // Refresh page to show updated media
      window.location.reload();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string, type: keyof MediaFiles) => {
    try {
      const supabase = createClient();
      const updatedMedia = {
        ...mediaFiles,
        [type]: mediaFiles[type]?.filter((mediaUrl) => mediaUrl !== url),
      };

      const { error } = await supabase
        .from("programs")
        .update({ media_files: updatedMedia })
        .eq("id", programId);

      if (error) {
        throw error;
      }

      // Delete from storage
      const filePath = decodeURIComponent(new URL(url).pathname).split(
        "/program-media/"
      )[1];
      const { error: deleteError } = await supabase.storage
        .from("program-media")
        .remove([filePath]);

      if (deleteError) {
        console.error("Error deleting file from storage:", deleteError);
      }

      // Refresh page to show updated media
      window.location.reload();
    } catch (error) {
      console.error("Error deleting media:", error);
    }
  };

  const handleFullScreen = (url: string, type: string) => {
    setSelectedItem(url);
    setSelectedType(type);
    setIsFullScreen(true);
  };

  return (
    <div>
      <div className="space-y-4">
        {["images", "videos", "pdfs"].map((type) => {
          const mediaArray = mediaFiles[type as keyof MediaFiles] || [];

          return (
            <div key={type} className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold capitalize text-lg mb-4">{type}</h3>
              {isAdmin && ( // Use isAdmin to conditionally render upload input
                <div className="mb-4">
                  <Input
                    type="file"
                    accept={
                      type === "images"
                        ? "image/*"
                        : type === "videos"
                          ? "video/*"
                          : ".pdf"
                    }
                    onChange={(e) =>
                      handleFileChange(e, type as keyof MediaFiles)
                    }
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                </div>
              )}
              {mediaArray.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {mediaArray.map((url, index) => {
                    return (
                      <div
                        key={index}
                        className="group relative rounded-lg overflow-hidden border hover:border-rose-500 transition-all duration-200"
                      >
                        <div className="aspect-video">
                          {type === "images" && (
                            <img
                              src={url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                              onClick={() => handleFullScreen(url, type)}
                            />
                          )}
                          {type === "videos" && (
                            <video
                              src={url}
                              className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                              onClick={() => handleFullScreen(url, type)}
                            />
                          )}
                          {type === "pdfs" && (
                            <div
                              onClick={() => handleFullScreen(url, type)}
                              className="h-full flex items-center justify-center bg-gray-100 cursor-pointer"
                            >
                              <p className="text-sm">PDF {index + 1}</p>
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleFullScreen(url, type)}
                            className="text-white bg-black bg-opacity-50 p-1 rounded"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() =>
                                handleDelete(url, type as keyof MediaFiles)
                              }
                              className="text-white bg-black bg-opacity-50 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No {type} uploaded.</p>
              )}
            </div>
          );
        })}
      </div>

      {isFullScreen && selectedItem && (
        <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
          <DialogContent className="max-w-none w-full h-full p-0">
            <DialogTitle>Media Viewer</DialogTitle>
            {/* Close Button */}
            <button
              onClick={() => setIsFullScreen(false)}
              className="absolute top-2 right-2 text-white z-10"
            >
              <XCircle className="w-6 h-6" />
            </button>
            {/* Display Media */}
            {selectedType === "images" && (
              <img
                src={selectedItem}
                alt="Full Screen"
                className="w-full h-full object-contain"
              />
            )}
            {selectedType === "videos" && (
              <video src={selectedItem} controls className="w-full h-full" />
            )}
            {selectedType === "pdfs" && (
              <object
                data={selectedItem}
                type="application/pdf"
                className="w-full h-full"
                aria-label="PDF Viewer"
              >
                <p>Your browser does not support PDFs.</p>
              </object>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MediaManager;
