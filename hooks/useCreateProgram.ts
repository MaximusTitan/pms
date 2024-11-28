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
    additional_links: [], // Ensured as initialized
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
            additional_links: true,
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
    console.log(`handleFileChange called for type: ${type}, file:`, file);
    if (!file) {
      console.log("No file selected.");
      return;
    }

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${type}/${fileName}`;
      console.log(`Uploading file to path: ${filePath}`);

      const { error: uploadError } = await supabase.storage
        .from("program-media")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("program-media")
        .getPublicUrl(filePath);
      
      console.log("File uploaded successfully. Public URL:", publicUrl);

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
      console.error("Error in handleFileChange:", error);
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
    console.log("handleCreateProgram called.");
    if (!validateStep(currentStep)) {
      console.log("Validation failed for step:", currentStep);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching authenticated user...");
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log("User data:", user);
      if (userError || !user) {
        console.error("User authentication error:", userError);
        throw new Error("User not authenticated");
      }

      console.log("Validating form data...");
      const validatedData = programFormSchema.parse(formData);
      // Now additional_links is guaranteed to be defined
      console.log("Validated data:", validatedData);

      console.log("Inserting program into database...");
      const { data, error } = await supabase
        .from("programs")
        .insert([{
          ...validatedData,
          user_id: user.id,
          media_files: validatedData.media_files, 
        }])
        .select();

      console.log("Insert response data:", data);
      if (error) {
        console.error("Insert error:", error);
        throw error;
      }
      if (data && data[0]) {
        console.log("Program created successfully:", data[0]);
        onSuccess(data[0]);
        toast({
          title: "Success",
          description: "Program created successfully",
        });
        // Reset form data after successful creation
        setFormData({
          name: "",
          additional_links: [],
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
        setFileInputs({
          images: "",
          videos: "",
          pdfs: "",
        });
        setCurrentStep(1);
        console.log("Form data and file inputs reset.");
      }
    } catch (error) {
      console.error("Error in handleCreateProgram:", error);
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
        description: error instanceof Error ? error.message : "Failed to create program",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log("handleCreateProgram finished. Loading state:", loading);
    }
  };

  return {
    formData,
    setFormData,
    fileInputs,
    setFileInputs, 
    currentStep,
    errors,
    loading,
    handleFileChange,
    handleCreateProgram,
    handleNextStep,
    handlePreviousStep,
  };
}