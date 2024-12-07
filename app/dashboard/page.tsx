"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import OnboardingPage from "./OnboardingPage"; // Import the onboarding component
import { Button } from "@/components/ui/button";
import CountUp from "react-countup";

interface Affiliate {
  id: number;
  full_name: string;
  work_email: string;
  status: string;
  // ...other fields...
}

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  hs_lead_status: string | null;
  // ...other fields...
}

interface Program {
  id: number;
  name: string;
  created_at: string;
  status: string;
  // ...other fields...
}

interface Report {
  totalLeads: number;
  totalDemos: number;
  totalSales: number;
  activePrograms: number;
  pendingAffiliates: number;
}

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  const [affiliateId, setAffiliateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [latestPrograms, setLatestPrograms] = useState<Program[]>([]);
  const [latestLeads, setLatestLeads] = useState<any[]>([]);
  const [reportNumbers, setReportNumbers] = useState({
    totalLeads: 0,
    totalDemos: 0,
    totalSales: 0,
    activePrograms: 0,
    pendingAffiliates: 0,
  });

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
            setPartnerId(affiliateData.affiliate_id); // Ensure partnerId is set
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetching
      }
    };

    fetchUser();
  }, []); // Only run once on mount, when the component is first loaded

  useEffect(() => {
    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",") || [];
    if (adminEmails.includes(userEmail)) {
      router.push("/admin");
    }
  }, [userEmail, router]);

  const fetchProgramDetails = async () => {
    try {
      // Step 1: Get program_id from affiliate_programs table using affiliateId
      const { data: affiliatePrograms, error } = await supabase
        .from("affiliate_programs")
        .select("program_id")
        .eq("affiliate_id", affiliateId);

      if (error) {
        console.error("Error fetching program IDs:", error); // Log the error object
        return;
      }

      console.log("Affiliate Programs Data:", affiliatePrograms); // Log the result data

      if (affiliatePrograms) {
        const programIds = affiliatePrograms.map(
          (program: { program_id: string }) => program.program_id
        );

        if (programIds.length > 0) {
          // Step 2: Fetch details for each program using program_id from programs table
          const { data: programs, error: programError } = await supabase
            .from("programs")
            .select("*")
            .in("id", programIds);

          if (programError) {
            console.error("Error fetching programs:", programError);
            return;
          }

          setLatestPrograms(programs || []); // Set programs to state
        }
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
    }
  };

  useEffect(() => {
    // Only run if partnerId is set
    if (partnerId) {
      const fetchCurrentPartnerDetails = async () => {
        try {
          // Fetch current partner's leads
          const { data: leads } = await supabase
            .from("leads")
            .select("*")
            .eq("partner_id", partnerId)
            .order("create_date", { ascending: false })
            .limit(5);
          setLatestLeads(leads || []);

          // Fetch report numbers
          const [
            totalLeadsRes,
            totalDemosRes,
            totalSalesRes,
            pendingAffiliatesRes,
          ] = await Promise.all([
            supabase
              .from("leads")
              .select("id", { count: "exact", head: true })
              .eq("partner_id", partnerId),
            supabase
              .from("leads")
              .select("id", { count: "exact", head: true })
              .eq("partner_id", partnerId)
              .eq("hs_lead_status", "Orientation scheduled"),
            supabase
              .from("leads")
              .select("id", { count: "exact", head: true })
              .eq("partner_id", partnerId)
              .eq("hs_lead_status", "Lead transformed"),
            supabase
              .from("affiliates")
              .select("id", { count: "exact", head: true })
              .eq("affiliate_id", partnerId),
          ]);

          // Set activePrograms to the length of latestPrograms
          setReportNumbers({
            totalLeads: totalLeadsRes.count || 0,
            totalDemos: totalDemosRes.count || 0,
            totalSales: totalSalesRes.count || 0,
            activePrograms: latestPrograms.length,
            pendingAffiliates: pendingAffiliatesRes.count || 0,
          });
        } catch (error) {
          console.error("Error fetching partner details:", error);
        }
      };

      fetchCurrentPartnerDetails();
    }
  }, [supabase, partnerId, latestPrograms]); // Added latestPrograms to dependencies

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { data: affiliateData, error: affiliateError } = await supabase
          .from("affiliates")
          .select("id")
          .eq("work_email", user.email)
          .single();

        if (affiliateError) throw affiliateError;

        const { data: programs, error: programsError } = await supabase
          .from("programs")
          .select(
            `
            *,
            affiliate_programs!inner(*)
          `
          )
          .eq("affiliate_programs.affiliate_id", affiliateData.id);

        if (programsError) throw programsError;
        setLatestPrograms(programs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPrograms();
  }, [supabase]);

  if (loading) {
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
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
        Partner Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div
          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/leads")}
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Total Leads
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            <CountUp end={reportNumbers?.totalLeads || 0} />
          </p>
        </div>
        <div
          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/reports")}
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Total Demos
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            <CountUp end={reportNumbers?.totalDemos || 0} />
          </p>
        </div>
        <div
          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/reports")}
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Total Sales
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            <CountUp end={reportNumbers?.totalSales || 0} />
          </p>
        </div>
        <div
          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/programs")}
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Active Programs
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            <CountUp end={reportNumbers?.activePrograms || 0} />
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Latest Leads */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-neutral-100">
            Latest Leads
          </h3>
          <ul className="mb-4">
            {latestLeads
              .filter((l) => l.first_name)
              .map((lead) => (
                <li key={lead.id} className="border-b py-2">
                  <p className="font-medium text-gray-900 dark:text-neutral-100">
                    {lead.first_name} {lead.last_name}
                  </p>
                  {/* Additional Details */}
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Email: {lead.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Phone: {lead.phone}
                  </p>
                </li>
              ))}
          </ul>
          <Button
            variant="outline"
            className="w-full border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200"
            onClick={() => (window.location.href = "/leads")}
          >
            View All Leads
          </Button>
        </div>

        {/* Latest Programs */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-neutral-100">
            Latest Programs
          </h3>
          <ul className="mb-4">
            {latestPrograms.map((program) => (
              <li key={program.id} className="border-b py-2">
                <p className="font-medium text-gray-900 dark:text-neutral-100">
                  {program.name}
                </p>
                {/* Additional Details */}
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Created At:{" "}
                  {new Date(program.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200"
            onClick={() => (window.location.href = "/programs")}
          >
            View All Programs
          </Button>
        </div>

        {/* Reports Summary */}
        {reportNumbers && (
          <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-neutral-100">
              Reports Summary
            </h3>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-neutral-100">
                <span className="font-semibold">Total Leads:</span>{" "}
                {reportNumbers.totalLeads}
              </p>
              <p className="text-gray-900 dark:text-neutral-100">
                <span className="font-semibold">Total Demos:</span>{" "}
                {reportNumbers.totalDemos}
              </p>
              <p className="text-gray-900 dark:text-neutral-100">
                <span className="font-semibold">Total Sales:</span>{" "}
                {reportNumbers.totalSales}
              </p>
              <p className="text-gray-900 dark:text-neutral-100">
                <span className="font-semibold">Active Programs:</span>{" "}
                {reportNumbers.activePrograms}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 mt-4"
              onClick={() => (window.location.href = "/reports")}
            >
              View Detailed Reports
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
