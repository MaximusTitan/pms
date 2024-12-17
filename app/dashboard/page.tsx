"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import OnboardingPage from "./OnboardingPage"; // Import the onboarding component
import { ChartConfig } from "@/components/ui/chart";
import SummaryCards from "@/components/SummaryCards";
import ChartSection from "@/components/ChartSection";
import LatestLeads from "@/components/LatestLeads";
import LatestPrograms from "@/components/LatestPrograms";
import ReportsSummary from "@/components/ReportsSummary";

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
  create_date: string | null;
  partner_id: string | null;
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

interface ChartDataPoint {
  date: string;
  Lead: number;
  Demo: number;
  Sale: number;
}

// Chart configuration
const chartConfig: ChartConfig = {
  Lead: {
    label: "Lead",
    color: "hsl(120, 50%, 30%)", // Darker Green
  },
  Demo: {
    label: "Demo",
    color: "hsl(210, 50%, 30%)", // Darker Blue
  },
  Sale: {
    label: "Sale",
    color: "hsl(340, 70%, 50%)", // Reddish Pink
  },
};

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  const [affiliateId, setAffiliateId] = useState<number | null>(null);
  const [id, setId] = useState<number | null>(null);
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "180d">("90d");
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [dataFilter, setDataFilter] = useState<
    "All" | "Lead" | "Demo" | "Sale"
  >("All");

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
            .select("affiliate_id, full_name, id")
            .eq("work_email", user.email)
            .single();

          if (affiliateData) {
            setAffiliateId(affiliateData.affiliate_id);
            setPartnerId(affiliateData.affiliate_id); // Ensure partnerId is set
            setUserName(affiliateData.full_name); // Set the user's full name
            setId(affiliateData.id);
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
        .eq("affiliate_id", id);

      if (error) {
        console.error("Error fetching program IDs:", error.message || error); // Log the error message if available
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
      fetchProgramDetails(); // Add this line to use fetchProgramDetails
    }
  }, [supabase, partnerId]); // Removed latestPrograms from dependencies

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

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("leads")
          .select("hs_lead_status, create_date, partner_id")
          .eq("partner_id", partnerId)
          .order("create_date", { ascending: true });

        if (error) throw error;
        if (data) {
          setLeads(data as Lead[]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (partnerId) {
      fetchLeads();
    }
  }, [partnerId]);

  useEffect(() => {
    const categorizeLeads = () => {
      // Define the date range based on timeRange
      const endDate = new Date();
      let startDate = new Date();
      if (timeRange === "30d") {
        startDate.setDate(endDate.getDate() - 30);
      } else if (timeRange === "180d") {
        startDate.setDate(endDate.getDate() - 180);
      } else {
        startDate.setDate(endDate.getDate() - 90);
      }

      // Filter leads within the date range
      const filteredLeads = leads.filter((lead) => {
        if (!lead.create_date) return false;
        const leadDate = new Date(lead.create_date);
        return leadDate >= startDate && leadDate <= endDate;
      });

      // Aggregate leads by date
      const aggregation: {
        [key: string]: { Lead: number; Demo: number; Sale: number };
      } = {};

      filteredLeads.forEach((lead) => {
        if (!lead.create_date) return;
        const date = new Date(lead.create_date);
        const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

        if (!aggregation[dateKey]) {
          aggregation[dateKey] = { Lead: 0, Demo: 0, Sale: 0 };
        }

        aggregation[dateKey].Lead += 1; // Increment total Leads

        if (
          lead.hs_lead_status &&
          lead.hs_lead_status.toLowerCase() === "orientation scheduled"
        ) {
          aggregation[dateKey].Demo += 1;
        } else if (
          lead.hs_lead_status &&
          lead.hs_lead_status.toLowerCase() === "lead transformed"
        ) {
          aggregation[dateKey].Sale += 1;
        }
      });

      // Convert aggregation to chartData array
      const chartDataArray: ChartDataPoint[] = Object.keys(aggregation).map(
        (date) => ({
          date,
          Lead: aggregation[date].Lead,
          Demo: aggregation[date].Demo,
          Sale: aggregation[date].Sale,
        })
      );

      setChartData(chartDataArray);
    };

    categorizeLeads();
  }, [leads, timeRange]);

  useEffect(() => {
    setReportNumbers((prev) => ({
      ...prev,
      activePrograms: latestPrograms.length,
    }));
  }, [latestPrograms]);

  const isAllDataZero = () => {
    return (
      reportNumbers.totalLeads === 0 &&
      reportNumbers.totalDemos === 0 &&
      reportNumbers.totalSales === 0 &&
      reportNumbers.activePrograms === 0
    );
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-rose-500 dark:text-white">
        Welcome {userName}!
      </h1>

      {/* Summary Cards */}
      <SummaryCards reportNumbers={reportNumbers} router={router} />

      {/* Chart Section */}
      <div className="relative">
        <div className={isAllDataZero() ? "filter blur-sm" : ""}>
          <ChartSection
            chartData={chartData}
            chartConfig={chartConfig}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
            dataFilter={dataFilter}
            setDataFilter={setDataFilter}
          />
        </div>

        {isAllDataZero() && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700">
              <p className="text-gray-800 dark:text-gray-200 text-center">
                No data available yet. Start generating leads to see your
                performance metrics.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Latest Leads */}
        <LatestLeads latestLeads={latestLeads} router={router} />

        {/* Latest Programs */}
        <LatestPrograms latestPrograms={latestPrograms} router={router} />

        {/* Reports Summary */}
        {reportNumbers && (
          <ReportsSummary reportNumbers={reportNumbers} router={router} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
