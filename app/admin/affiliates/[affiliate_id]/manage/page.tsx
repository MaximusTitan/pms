"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Affiliate {
  id: number;
  full_name: string;
  work_email: string;
  affiliate_id: string;
  status: string;
  send_welcome_email: boolean;
  created_at: string;
}

export default function ManageAffiliatePage() {
  const router = useRouter();
  const { affiliate_id } = useParams();
  const supabase = createClient();

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    status: "",
    full_name: "",
    work_email: "",
    affiliate_id: "",
  });

  useEffect(() => {
    const fetchAffiliate = async () => {
      try {
        const { data, error } = await supabase
          .from("affiliates")
          .select("*")
          .eq("affiliate_id", affiliate_id)
          .single();

        if (error) throw error;
        setAffiliate(data);
        setFormData({
          status: data.status,
          full_name: data.full_name,
          work_email: data.work_email,
          affiliate_id: data.affiliate_id,
        });
      } catch (err) {
        setError("Failed to load affiliate details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (affiliate_id) {
      fetchAffiliate();
    }
  }, [affiliate_id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({
          status: formData.status,
          full_name: formData.full_name,
          work_email: formData.work_email,
          affiliate_id: formData.affiliate_id,
        })
        .eq("id", affiliate?.id);

      if (error) throw error;
      router.push("/admin/affiliates");
    } catch (err) {
      setError("Failed to update affiliate.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !affiliate) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Manage Affiliate</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-6">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="work_email">Work Email</Label>
              <Input
                id="work_email"
                name="work_email"
                type="email"
                value={formData.work_email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="affiliate_id">Affiliate ID</Label>
              <Input
                id="affiliate_id"
                name="affiliate_id"
                value={formData.affiliate_id}
                onChange={handleChange}
                required
                disabled
              />
              <p className="text-sm text-muted-foreground mt-1">
                Affiliate ID cannot be changed.
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/affiliates")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-rose-500 hover:bg-rose-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Affiliate"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
