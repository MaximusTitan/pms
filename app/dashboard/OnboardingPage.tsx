"use client";

import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const OnboardingPage: React.FC = () => {
  const [affiliateId, setAffiliateId] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedId = affiliateId.toUpperCase();

    if (formattedId.length < 5) {
      setError("Affiliate ID must be at least 5 characters.");
      return;
    }

    try {
      const client = await createClient();
      const { data: userData, error: userError } = await client.auth.getUser();

      if (userError || !userData.user) {
        setError("Failed to retrieve user information.");
        return;
      }

      const userEmail = userData.user.email;

      const { data, error } = await client
        .from("affiliates")
        .select("*")
        .eq("affiliate_id", formattedId)
        .single();

      if (data) {
        setError("Affiliate ID already exists. Please choose another one.");
        return;
      }

      // Update the affiliate information for the current user
      const { error: updateError } = await client
        .from("affiliates")
        .update({
          affiliate_id: formattedId,
          full_name: fullName,
        })
        .eq("work_email", userEmail);

      if (updateError) {
        setError("Failed to update affiliate information. Please try again.");
      } else {
        setSuccess("Affiliate ID created successfully!");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-rose-500 mb-6">
          Create Your Affiliate ID
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-gray-700">Affiliate ID:</span>
            <input
              type="text"
              value={affiliateId}
              onChange={(e) => setAffiliateId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">Full Name:</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-rose-500 focus:border-rose-500"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-rose-500 text-white py-2 px-4 rounded hover:bg-rose-600 transition"
          >
            Create ID
          </button>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {success && <p className="mt-4 text-green-500">{success}</p>}
      </div>
    </div>
  );
};

export default OnboardingPage;
