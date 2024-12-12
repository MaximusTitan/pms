"use client";
import React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CopyLinkButtonProps {
  link: string;
  className?: string;
}

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  link,
  className,
}) => {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        toast("Link copied to clipboard", {
          description: "The affiliate link has been copied successfully.",
        });
      })
      .catch((err) => {
        toast("Failed to copy link", {
          description: "There was an issue copying the link to clipboard.",
        });
      });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={`${className}`}
    >
      <Copy className="h-2 w-2" />
    </Button>
  );
};
