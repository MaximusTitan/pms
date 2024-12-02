"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useCreateProgram } from "@/hooks/useCreateProgram";
import { Program } from "@/types/program";
import { cn } from "@/lib/utils";

interface CreateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (program: Program) => void;
}

export function CreateProgramDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProgramDialogProps) {
  const {
    formData,
    setFormData,
    fileInputs,
    setFileInputs,
    currentStep,
    errors,
    loading,
    handleFileChange,
    handleCreateProgram: originalHandleCreateProgram,
    handleNextStep,
    handlePreviousStep,
  } = useCreateProgram(onSuccess);

  const handleCreateProgram = async () => {
    console.log("CreateProgramDialog: handleCreateProgram triggered.");
    await originalHandleCreateProgram();
    // No need to reset form here as it's handled in the hook
  };

  const handleAddLink = () => {
    setFormData({
      ...formData,
      additional_links: [
        ...formData.additional_links,
        { title: "", url: "", description: "" },
      ],
    });
  };

  const handleRemoveLink = (index: number) => {
    if (index === 0) {
      // Prevent removing the first link
      return;
    }
    const newLinks = formData.additional_links.filter((_, i) => i !== index);
    setFormData({ ...formData, additional_links: newLinks });
  };

  const totalSteps = 3; // Update the total number of steps

  const renderStep = () => {
    console.log("CreateProgramDialog: Rendering step", currentStep);
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label className={cn(errors.name && "text-red-500")}>
                Program Name *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={cn(errors.name && "border-red-500")}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <Label className={cn(errors.overview && "text-red-500")}>
                Program Overview
              </Label>
              <Input
                value={formData.overview}
                onChange={(e) =>
                  setFormData({ ...formData, overview: e.target.value })
                }
                placeholder="Enter a brief overview of the program"
                className={cn(errors.overview && "border-red-500")}
              />
              {errors.overview && (
                <p className="text-sm text-red-500 mt-1">{errors.overview}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Label className="text-lg font-medium">Additional Links</Label>

            {/* First Link (Mandatory) */}
            <div className="space-y-2 border p-4 rounded">
              <h3 className="font-semibold">Link 1 (Required)</h3>
              <Input
                placeholder="Title"
                value={formData.additional_links[0]?.title || ""}
                onChange={(e) => {
                  const newLinks = [...formData.additional_links];
                  newLinks[0] = { ...newLinks[0], title: e.target.value };
                  setFormData({ ...formData, additional_links: newLinks });
                }}
                className={cn(
                  errors[`additional_links.0.title`] && "border-red-500"
                )}
              />
              {errors[`additional_links.0.title`] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[`additional_links.0.title`]}
                </p>
              )}
              <Input
                placeholder="URL"
                value={formData.additional_links[0]?.url || ""}
                onChange={(e) => {
                  const newLinks = [...formData.additional_links];
                  newLinks[0] = { ...newLinks[0], url: e.target.value };
                  setFormData({ ...formData, additional_links: newLinks });
                }}
                className={cn(
                  errors[`additional_links.0.url`] && "border-red-500"
                )}
              />
              {errors[`additional_links.0.url`] && (
                <p className="text-sm text-red-500 mt-1">
                  {errors[`additional_links.0.url`]}
                </p>
              )}
              <Input
                placeholder="Description"
                value={formData.additional_links[0]?.description || ""}
                onChange={(e) => {
                  const newLinks = [...formData.additional_links];
                  newLinks[0] = {
                    ...newLinks[0],
                    description: e.target.value,
                  };
                  setFormData({ ...formData, additional_links: newLinks });
                }}
              />
            </div>

            {/* Additional Optional Links */}
            {formData.additional_links.slice(1).map((link, index) => (
              <div key={index + 1} className="space-y-2 border p-4 rounded">
                <h3 className="font-semibold">Link {index + 2}</h3>
                <Input
                  placeholder="Title"
                  value={link.title}
                  onChange={(e) => {
                    const newLinks = [...formData.additional_links];
                    newLinks[index + 1].title = e.target.value;
                    setFormData({ ...formData, additional_links: newLinks });
                  }}
                  className={cn(
                    errors[`additional_links.${index + 1}.title`] &&
                      "border-red-500"
                  )}
                />
                {errors[`additional_links.${index + 1}.title`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`additional_links.${index + 1}.title`]}
                  </p>
                )}
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) => {
                    const newLinks = [...formData.additional_links];
                    newLinks[index + 1].url = e.target.value;
                    setFormData({ ...formData, additional_links: newLinks });
                  }}
                  className={cn(
                    errors[`additional_links.${index + 1}.url`] &&
                      "border-red-500"
                  )}
                />
                {errors[`additional_links.${index + 1}.url`] && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors[`additional_links.${index + 1}.url`]}
                  </p>
                )}
                <Input
                  placeholder="Description"
                  value={link.description || ""}
                  onChange={(e) => {
                    const newLinks = [...formData.additional_links];
                    newLinks[index + 1].description = e.target.value;
                    setFormData({ ...formData, additional_links: newLinks });
                  }}
                />
                <Button
                  variant="destructive"
                  onClick={() => handleRemoveLink(index + 1)}
                  className="mt-2"
                >
                  Remove Link
                </Button>
              </div>
            ))}

            <Button onClick={handleAddLink} className="mt-4">
              Add Another Link
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="images">Program Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "images")}
                disabled={loading}
                value={fileInputs.images}
                className="cursor-pointer"
              />
              {formData.media_files.images.length > 0 && (
                <div className="text-sm text-gray-500">
                  {formData.media_files.images.length} image(s) uploaded
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="videos">Program Videos</Label>
              <Input
                id="videos"
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, "videos")}
                disabled={loading}
                value={fileInputs.videos}
                className="cursor-pointer"
              />
              {formData.media_files.videos.length > 0 && (
                <div className="text-sm text-gray-500">
                  {formData.media_files.videos.length} video(s) uploaded
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdfs">Marketing Materials (PDF)</Label>
              <Input
                id="pdfs"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, "pdfs")}
                disabled={loading}
                value={fileInputs.pdfs}
                className="cursor-pointer"
              />
              {formData.media_files.pdfs.length > 0 && (
                <div className="text-sm text-gray-500">
                  {formData.media_files.pdfs.length} PDF(s) uploaded
                </div>
              )}
            </div>

            {loading && (
              <div className="text-sm text-rose-500">
                Uploading file, please wait...
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        console.log(
          "CreateProgramDialog: Dialog open state changed to:",
          openState
        );
        onOpenChange(openState);
      }}
    >
      <DialogContent className="sm:max-w-[425px] dark:bg-neutral-950">
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
        </DialogHeader>

        {renderStep()}

        <div className="flex justify-between mt-4">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={() => {
                console.log("CreateProgramDialog: Previous button clicked.");
                handlePreviousStep();
              }}
              disabled={loading}
            >
              Previous
            </Button>
          )}
          <Button
            className="bg-rose-500 hover:bg-rose-600 text-white ml-auto"
            onClick={() => {
              console.log(
                `CreateProgramDialog: Next/Create button clicked on step ${currentStep}.`
              );
              currentStep < totalSteps
                ? handleNextStep()
                : handleCreateProgram();
            }}
            disabled={loading}
          >
            {currentStep < totalSteps ? (
              "Next"
            ) : loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create Program"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
