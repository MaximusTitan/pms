"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import OnboardingPage from "./OnboardingPage"; // Import the onboarding component
import { Button } from "@/components/ui/button";
import CountUp from "react-countup";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import { CardDescription } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp } from "lucide-react";

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
    color: "hsl(var(--chart-3))", // Choose a color for Leads
  },
  Demo: {
    label: "Demo",
    color: "hsl(var(--chart-1))",
  },
  Sale: {
    label: "Sale",
    color: "hsl(var(--chart-2))",
  },
};

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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "180d">("90d");
  const [error, setError] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 p-6">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white">
        Partner Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Leads",
            value: reportNumbers.totalLeads,
            link: "/leads",
          },
          {
            title: "Total Demos",
            value: reportNumbers.totalDemos,
            link: "/reports",
          },
          {
            title: "Total Sales",
            value: reportNumbers.totalSales,
            link: "/reports",
          },
          {
            title: "Active Programs",
            value: reportNumbers.activePrograms,
            link: "/programs",
          },
        ].map((item) => (
          <Card
            key={item.title}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(item.link)}
          >
            <CardContent className="p-6 text-center">
              <p className="text-lg font-medium text-gray-600 dark:text-neutral-400">
                {item.title}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                <CountUp end={item.value || 0} duration={1} />
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1 text-center sm:text-left">
              <CardTitle>Lead Status Chart</CardTitle>
              <CardDescription>
                Showing Demo and Sale leads over time
              </CardDescription>
            </div>
            <Select
              value={timeRange}
              onValueChange={(value: "30d" | "90d" | "180d") => {
                setTimeRange(value);
              }}
            >
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select Time Range"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
                <SelectItem value="90d" className="rounded-lg">
                  Last 90 days
                </SelectItem>
                <SelectItem value="180d" className="rounded-lg">
                  Last 180 days
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[400px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="Lead"
                    type="monotone"
                    stroke={chartConfig.Lead.color}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="Demo"
                    type="monotone"
                    stroke={chartConfig.Demo.color}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="Sale"
                    type="monotone"
                    stroke={chartConfig.Sale.color}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            {/* <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Trending up by 5.2% this month{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  Showing total leads for the selected time range
                </div>
              </div>
            </div> */}
          </CardFooter>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest Leads */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Latest Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {latestLeads
                .filter((lead) => lead.first_name)
                .map((lead) => (
                  <li key={lead.id} className="py-2 border-b last:border-none">
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      Email: {lead.email}
                    </p>
                  </li>
                ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/leads")}
            >
              View All Leads
            </Button>
          </CardFooter>
        </Card>

        {/* Latest Programs */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Latest Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {latestPrograms.map((program) => (
                <li key={program.id} className="py-2 border-b last:border-none">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {program.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Created At:{" "}
                    {new Date(program.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/programs")}
            >
              View All Programs
            </Button>
          </CardFooter>
        </Card>

        {/* Reports Summary */}
        {reportNumbers && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Reports Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-800 dark:text-white">
                  <span className="font-semibold">Total Leads:</span>{" "}
                  {reportNumbers.totalLeads}
                </p>
                <p className="text-gray-800 dark:text-white">
                  <span className="font-semibold">Total Demos:</span>{" "}
                  {reportNumbers.totalDemos}
                </p>
                <p className="text-gray-800 dark:text-white">
                  <span className="font-semibold">Total Sales:</span>{" "}
                  {reportNumbers.totalSales}
                </p>
                <p className="text-gray-800 dark:text-white">
                  <span className="font-semibold">Active Programs:</span>{" "}
                  {reportNumbers.activePrograms}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/reports")}
              >
                View Detailed Reports
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
