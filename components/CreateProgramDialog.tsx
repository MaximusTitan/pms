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
    currentStep,
    errors,
    loading,
    handleFileChange,
    handleCreateProgram,
    handleNextStep,
    handlePreviousStep,
  } = useCreateProgram(onSuccess);

  const renderStep = () => {
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
              <Label className={cn(errors.landing_page_url && "text-red-500")}>
                Landing Page URL *
              </Label>
              <Input
                value={formData.landing_page_url}
                onChange={(e) =>
                  setFormData({ ...formData, landing_page_url: e.target.value })
                }
                className={cn(errors.landing_page_url && "border-red-500")}
              />
              {errors.landing_page_url && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.landing_page_url}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label className={cn(errors.commission_type && "text-red-500")}>
                Commission Type *
              </Label>
              <Select
                onValueChange={(value: "fixed" | "percentage") =>
                  setFormData({ ...formData, commission_type: value })
                }
                value={formData.commission_type}
              >
                <SelectTrigger
                  className={cn(errors.commission_type && "border-red-500")}
                >
                  <SelectValue placeholder="Select commission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Commission</SelectItem>
                  <SelectItem value="percentage">
                    Percentage per Transaction
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.commission_type && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.commission_type}
                </p>
              )}
            </div>

            <div>
              <Label className={cn(errors.commission_value && "text-red-500")}>
                Commission Value *
              </Label>
              <Input
                type="number"
                value={formData.commission_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission_value: parseFloat(e.target.value) || 0,
                  })
                }
                className={cn(errors.commission_value && "border-red-500")}
              />
              {errors.commission_value && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.commission_value}
                </p>
              )}
            </div>

            <div>
              <Label className={cn(errors.currency && "text-red-500")}>
                Currency *
              </Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
                value={formData.currency}
              >
                <SelectTrigger
                  className={cn(errors.currency && "border-red-500")}
                >
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-red-500 mt-1">{errors.currency}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring_commission}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    recurring_commission: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="recurring">Enable Recurring Commission</Label>
            </div>
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] dark:bg-neutral-950">
        <DialogHeader>
          <DialogTitle>Create New Program</DialogTitle>
        </DialogHeader>

        {renderStep()}

        <div className="flex justify-between mt-4">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={loading}
            >
              Previous
            </Button>
          )}
          <Button
            className="bg-rose-500 hover:bg-rose-600 text-white ml-auto"
            onClick={currentStep < 3 ? handleNextStep : handleCreateProgram}
            disabled={loading}
          >
            {currentStep < 3 ? (
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
