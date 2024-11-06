import { useState, ChangeEvent } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProgramFormData, FileInputState, Program, programFormSchema } from "@/types/program";
import { ZodError } from "zod";

export function useCreateProgram(onSuccess: (program: Program) => void) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const supabase = createClient();

  const [formData, setFormData] = useState<ProgramFormData>({
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

  const [fileInputs, setFileInputs] = useState<FileInputState>({
    images: "",
    videos: "",
    pdfs: "",
  });

  const validateStep = (step: number): boolean => {
    try {
      setErrors({});
      switch (step) {
        case 1:
          programFormSchema.pick({
            name: true,
            landing_page_url: true,
          }).parse(formData);
          break;
        case 2:
          programFormSchema.pick({
            commission_type: true,
            commission_value: true,
            currency: true,
          }).parse(formData);
          break;
        case 3:
          // File uploads are optional but should be valid if present
          return true;
        default:
          return false;
      }
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
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
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("program-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("program-media")
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        media_files: {
          ...prev.media_files,
          [type]: [...prev.media_files[type], publicUrl],
        },
      }));

      setFileInputs((prev) => ({ ...prev, [type]: "" }));
      toast({ title: "Success", description: "File uploaded successfully" });
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

  const handleCreateProgram = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      const validatedData = programFormSchema.parse(formData);
      const { data, error } = await supabase
        .from("programs")
        .insert([{
          ...validatedData,
          user_id: user.id,
        }])
        .select();

      if (error) throw error;
      onSuccess(data[0]);
      toast({
        title: "Success",
        description: "Program created successfully",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      toast({
        title: "Error",
        description: "Failed to create program",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}