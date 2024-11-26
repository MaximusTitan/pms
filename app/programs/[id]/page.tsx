"use client";

import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Copy,
  ArrowLeft,
  Link as LinkIcon,
  Image as ImageIcon,
  FileText,
  ExternalLink,
} from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type MediaFile = {
  url: string;
  type: string;
  name: string;
  size?: number;
};

type Link = {
  url: string;
  title: string;
};

type Program = {
  id: string;
  name: string;
  media_files: MediaFile[];
  additional_links: Link[];
  created_at: string;
  updated_at: string;
};

export default function ProgramDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProgram() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: program, error: programError } = await supabase
          .from("programs")
          .select("*")
          .eq("id", params.id)
          .single();

        if (programError) throw programError;
        setProgram(program);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch program"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProgram();
  }, [params.id, supabase]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  };

  const getMediaComponent = (file: MediaFile) => {
    const fileType = file.type.split("/")[0];

    switch (fileType) {
      case "image":
        return (
          <div className="relative h-48 w-full group">
            <Image
              src={file.url}
              alt={file.name}
              fill
              className="object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMedia(file);
                }}
              >
                View Full Size
              </Button>
            </div>
          </div>
        );

      case "video":
        return (
          <div className="relative h-48 w-full">
            <video
              className="h-full w-full object-cover rounded-t-lg"
              controls
              poster={`${file.url}#t=0.1`}
            >
              <source src={file.url} type={file.type} />
              Your browser does not support video playback.
            </video>
          </div>
        );

      case "application":
        if (file.type === "application/pdf") {
          return (
            <div className="relative h-48 w-full bg-gray-100 flex flex-col items-center justify-center">
              <FileText className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">PDF Document</p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(file.url, "_blank");
                }}
              >
                View PDF
              </Button>
            </div>
          );
        }
      // Fall through to default for other application types

      default:
        return (
          <div className="h-48 flex items-center justify-center bg-gray-100">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
        );
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!program) return <div>Program not found</div>;

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Programs
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{program.name}</CardTitle>
        </CardHeader>
      </Card>

      {program.media_files && program.media_files.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" />
              Media Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {program.media_files.map((file, index) => (
                <Card key={index} className="overflow-hidden">
                  {getMediaComponent(file)}
                  <CardContent className="p-4">
                    <p className="font-medium mb-1 truncate">{file.name}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      {formatFileSize(file.size)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(file.url)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy URL
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(file.url, file.name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={!!selectedMedia}
        onOpenChange={() => setSelectedMedia(null)}
      >
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.name}</DialogTitle>
          </DialogHeader>
          {selectedMedia?.type.startsWith("image/") && (
            <div className="relative w-full h-[80vh]">
              <Image
                src={selectedMedia.url}
                alt={selectedMedia.name}
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {program.additional_links && program.additional_links.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <LinkIcon className="mr-2 h-5 w-5" />
              Additional Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {program.additional_links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center">
                    <LinkIcon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">{link.title}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(link.url)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(link.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-gray-600 space-y-1">
            <p>Created: {new Date(program.created_at).toLocaleString()}</p>
            <p>Last updated: {new Date(program.updated_at).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
