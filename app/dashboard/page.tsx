"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import OnboardingPage from "./OnboardingPage"; // Import the onboarding component

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [affiliateId, setAffiliateId] = useState("");
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const client = await createClient();
        const {
          data: { user },
        } = await client.auth.getUser();
        setUserEmail(user?.email || "");

        if (user?.email) {
          const { data: affiliateData } = await client
            .from("affiliates")
            .select("affiliate_id")
            .eq("work_email", user.email)
            .single();

          if (affiliateData) {
            setAffiliateId(affiliateData.affiliate_id);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
    if (adminEmails.includes(userEmail)) {
      router.push("/admin");
    }
  }, [userEmail, router]);

  if (loading) {
    // Render a loading spinner or blank state while data is loading
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Render the appropriate page based on the affiliateId
  if (!affiliateId) {
    return <OnboardingPage />;
  }

  return (
    <div>
      <h1>Welcome to the App!</h1>
      <p>
        We are glad to have you here. Explore the features and enjoy your
        experience.
      </p>
    </div>
  );
};

export default DashboardPage;
