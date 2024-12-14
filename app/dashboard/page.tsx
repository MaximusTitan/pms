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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
            className="w-full cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(item.link)}
          >
            <CardContent className="p-4 sm:p-6 text-left">
              <p className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-rose-300 via-rose-500 to-rose-700 font-sans">
                <CountUp end={item.value || 0} duration={1} />
              </p>
              <p className="text-md sm:text-lg font-medium text-gray-600 dark:text-neutral-400 mt-2">
                {item.title}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Chart */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-2 space-y-2 sm:space-y-0 border-b py-4 sm:py-5">
            <div className="flex-1 text-center sm:text-left">
              <CardTitle className="text-lg sm:text-xl">
                Lead Status Chart
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Showing Demo and Sale leads over time
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={timeRange}
                onValueChange={(value: "30d" | "90d" | "180d") => {
                  setTimeRange(value);
                }}
              >
                <SelectTrigger
                  className="w-full sm:w-40 rounded-lg"
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
              <Select
                value={dataFilter}
                onValueChange={(value: "All" | "Lead" | "Demo" | "Sale") =>
                  setDataFilter(value)
                }
              >
                <SelectTrigger
                  className="w-full sm:w-40 rounded-lg"
                  aria-label="Select Data Filter"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="All" className="rounded-lg">
                    All
                  </SelectItem>
                  <SelectItem value="Lead" className="rounded-lg">
                    Leads
                  </SelectItem>
                  <SelectItem value="Demo" className="rounded-lg">
                    Demos
                  </SelectItem>
                  <SelectItem value="Sale" className="rounded-lg">
                    Sales
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-w-16 aspect-h-9 h-64 sm:h-80 w-full"
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
                  {(dataFilter === "All" || dataFilter === "Lead") && (
                    <Line
                      dataKey="Lead"
                      type="monotone"
                      stroke={chartConfig.Lead.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  {(dataFilter === "All" || dataFilter === "Demo") && (
                    <Line
                      dataKey="Demo"
                      type="monotone"
                      stroke={chartConfig.Demo.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
                  {(dataFilter === "All" || dataFilter === "Sale") && (
                    <Line
                      dataKey="Sale"
                      type="monotone"
                      stroke={chartConfig.Sale.color}
                      strokeWidth={2}
                      dot={false}
                    />
                  )}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Latest Leads */}
        <Card className="w-full hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Latest Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {latestLeads
                .filter((lead) => lead.first_name)
                .map((lead) => (
                  <li key={lead.id} className="py-2 border-b last:border-none">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                      {lead.first_name} {lead.last_name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
                      Email: {lead.email}
                    </p>
                  </li>
                ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full text-sm sm:text-base text-rose-500 hover:bg-rose-500 hover:text-white"
              onClick={() => router.push("/leads")}
            >
              View All Leads
            </Button>
          </CardFooter>
        </Card>

        {/* Latest Programs */}
        <Card className="w-full hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Latest Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {latestPrograms.map((program) => (
                <li key={program.id} className="py-2 border-b last:border-none">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                    {program.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
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
              className="w-full text-sm sm:text-base text-rose-500 hover:bg-rose-500 hover:text-white"
              onClick={() => router.push("/programs")}
            >
              View All Programs
            </Button>
          </CardFooter>
        </Card>

        {/* Reports Summary */}
        {reportNumbers && (
          <Card className="w-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">
                Reports Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-800 dark:text-white text-sm sm:text-base">
                  <span className="font-semibold">Total Leads:</span>{" "}
                  {reportNumbers.totalLeads}
                </p>
                <p className="text-gray-800 dark:text-white text-sm sm:text-base">
                  <span className="font-semibold">Total Demos:</span>{" "}
                  {reportNumbers.totalDemos}
                </p>
                <p className="text-gray-800 dark:text-white text-sm sm:text-base">
                  <span className="font-semibold">Total Sales:</span>{" "}
                  {reportNumbers.totalSales}
                </p>
                <p className="text-gray-800 dark:text-white text-sm sm:text-base">
                  <span className="font-semibold">Active Programs:</span>{" "}
                  {reportNumbers.activePrograms}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full text-sm sm:text-base text-rose-500 hover:bg-rose-500 hover:text-white"
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
