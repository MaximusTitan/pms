"use client";

import { useState, ChangeEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Program {
  id: string;
  name: string;
  landing_page_url: string;
  commission_type: string;
  commission_value: number;
  currency: string;
  recurring_commission: boolean;
  media_files: {
    images: string[];
    videos: string[];
    pdfs: string[];
  };
}

interface FileInputState {
  images: string;
  videos: string;
  pdfs: string;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    name: "",
    landing_page_url: "",
    commission_type: "fixed",
    commission_value: 0,
    currency: "USD",
    recurring_commission: false,
    media_files: {
      images: [],
      videos: [],
      pdfs: [],
    },
  });

  // Add new state for file inputs
  const [fileInputs, setFileInputs] = useState<FileInputState>({
    images: "",
    videos: "",
    pdfs: "",
  });

  const handleCreateProgram = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("programs")
        .insert([formData])
        .select();

      if (error) throw error;

      setPrograms([...programs, data[0]]);
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Program created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create program",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    type: "images" | "videos" | "pdfs"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("program-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("program-media").getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        media_files: {
          ...prev.media_files,
          [type]: [...prev.media_files[type], publicUrl],
        },
      }));

      // Reset the specific file input after successful upload
      setFileInputs((prev) => ({
        ...prev,
        [type]: "",
      }));

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label>Program Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Landing Page URL</Label>
              <Input
                value={formData.landing_page_url}
                onChange={(e) =>
                  setFormData({ ...formData, landing_page_url: e.target.value })
                }
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Commission Type</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, commission_type: value })
                }
                defaultValue={formData.commission_type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select commission type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Commission</SelectItem>
                  <SelectItem value="percentage">
                    Percentage per Transaction
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Commission Value</Label>
              <Input
                type="number"
                value={formData.commission_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission_value: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, currency: value })
                }
                defaultValue={formData.currency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="images">Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "images")}
                disabled={loading}
                value={fileInputs.images}
                key={fileInputs.images} // Force re-render on reset
              />
              {formData.media_files.images.length > 0 && (
                <div className="text-sm text-gray-500">
                  {formData.media_files.images.length} image(s) uploaded
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="videos">Videos</Label>
              <Input
                id="videos"
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, "videos")}
                disabled={loading}
                value={fileInputs.videos}
                key={fileInputs.videos}
              />
              {formData.media_files.videos.length > 0 && (
                <div className="text-sm text-gray-500">
                  {formData.media_files.videos.length} video(s) uploaded
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdfs">PDF Documents</Label>
              <Input
                id="pdfs"
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileChange(e, "pdfs")}
                disabled={loading}
                value={fileInputs.pdfs}
                key={fileInputs.pdfs}
              />
              {formData.media_files.pdfs.length > 0 && (
                <div className="text-sm text-gray-500">
                  {formData.media_files.pdfs.length} PDF(s) uploaded
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Affiliate Programs</h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-rose-500 hover:bg-rose-600 text-white"
        >
          Create New Program
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {programs.map((program) => (
          <Card key={program.id} className="dark:bg-neutral-800">
            <CardHeader>
              <CardTitle className="text-xl text-rose-500">
                {program.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Commission:</span>{" "}
                  {program.commission_value} {program.currency}
                </p>
                <p>
                  <span className="font-semibold">Type:</span>{" "}
                  {program.commission_type}
                </p>
                <p>
                  <span className="font-semibold">Recurring:</span>{" "}
                  {program.recurring_commission ? "Yes" : "No"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[425px] dark:bg-neutral-950">
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
          </DialogHeader>

          {renderStep()}

          <div className="flex justify-between mt-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
            {currentStep < 3 ? (
              <Button
                className="bg-rose-500 hover:bg-rose-600 text-white ml-auto"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                className="bg-rose-500 hover:bg-rose-600 text-white ml-auto"
                onClick={handleCreateProgram}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create Program"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
