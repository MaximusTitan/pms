"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CountUp from "react-countup"; // Add import for CountUp
import { useRouter } from "next/navigation"; // Add import for useRouter

interface Lead {
  id: number;
  hs_lead_status: string | null;
  create_date: string | null;
  partner_id: string | null; // Added partner_id field
  affiliate_id: string; // Add affiliate_id field
  // ...other fields...
}

const client = createClient();

const chartConfig: ChartConfig = {
  Demo: {
    label: "Demo",
    color: "hsl(var(--chart-1))",
  },
  Sale: {
    label: "Sale",
    color: "hsl(var(--chart-2))",
  },
};

interface ChartDataPoint {
  date: string;
  Demo: number;
  Sale: number;
}

const ReportsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "180d">("90d"); // Existing state
  const [partnerId, setPartnerId] = useState<string>("all"); // Initialize partnerId to "all" to represent selecting all partners
  const [partnerIds, setPartnerIds] = useState<string[]>([]); // Ensures partnerIds is an array of strings
  const [affiliateId, setAffiliateId] = useState<string | null>(null); // Add affiliateId state

  useEffect(() => {
    const fetchAffiliateId = async () => {
      try {
        const { data: userData, error: userError } =
          await client.auth.getUser();
        if (userError || !userData.user) throw new Error("Not authenticated");

        const { data: affiliateData, error: affiliateError } = await client
          .from("affiliates")
          .select("affiliate_id") // Select affiliate_id instead of id
          .eq("work_email", userData.user.email)
          .single();

        if (affiliateError || !affiliateData)
          throw new Error("Affiliate not found");

        setAffiliateId(affiliateData.affiliate_id); // Set affiliateId from affiliate_id
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchAffiliateId();
  }, []); // Add useEffect to fetch affiliateId on mount

  useEffect(() => {
    const fetchPartnerIds = async () => {
      try {
        const { data, error } = await client
          .from("leads")
          .select("partner_id")
          .neq("partner_id", null);

        if (error) throw error;
        if (data) {
          const uniquePartners = Array.from(
            new Set(
              (data as Lead[])
                .map((lead) => lead.partner_id)
                .filter(
                  (id): id is string =>
                    typeof id === "string" && /^[A-Z]+$/.test(id)
                )
            )
          );
          setPartnerIds(uniquePartners);
        }
      } catch (err: any) {
        console.error("Error fetching partner IDs:", err.message);
      }
    };

    fetchPartnerIds();
  }, []); // Fetch once on mount

  useEffect(() => {
    if (!affiliateId) return;

    const fetchLeads = async () => {
      try {
        setLoading(true);
        const query = client
          .from("leads")
          .select("hs_lead_status, create_date, partner_id, affiliate_id")
          .eq("affiliate_id", affiliateId); // Filter leads by affiliateId

        if (partnerId !== "all") {
          // Apply filter only if a specific partner is selected
          query.eq("partner_id", partnerId);
        }
        const { data, error } = await query.order("create_date", {
          ascending: true,
        });

        if (error) throw error;
        if (data) {
          setLeads(data as Lead[]);
          // Removed setting partnerIds here
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [timeRange, partnerId, affiliateId]); // Add affiliateId to dependencies

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
      const aggregation: { [key: string]: { Demo: number; Sale: number } } = {};

      filteredLeads.forEach((lead) => {
        if (!lead.create_date) return;
        const date = new Date(lead.create_date);
        const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD

        if (!aggregation[dateKey]) {
          aggregation[dateKey] = { Demo: 0, Sale: 0 };
        }

        if (lead.hs_lead_status === "Orientation scheduled") {
          aggregation[dateKey].Demo += 1;
        } else if (lead.hs_lead_status === "Lead transformed") {
          aggregation[dateKey].Sale += 1;
        }
      });

      // Convert aggregation to chartData array
      const chartDataArray: ChartDataPoint[] = Object.keys(aggregation).map(
        (date) => ({
          date,
          Demo: aggregation[date].Demo,
          Sale: aggregation[date].Sale,
        })
      );

      setChartData(chartDataArray);
    };

    categorizeLeads();
  }, [leads, timeRange]);

  const totalDemos = chartData.reduce((sum, data) => sum + data.Demo, 0);
  const totalSales = chartData.reduce((sum, data) => sum + data.Sale, 0);

  if (loading) return <p className="p-4 text-center">Loading reports...</p>;
  if (error)
    return <p className="p-4 text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      {/* Adjust layout to position Select on the right */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reports Management</h1>
        <Select
          value={partnerId}
          onValueChange={(value: string) => setPartnerId(value)}
        >
          <SelectTrigger
            className="w-[160px] rounded-lg"
            aria-label="Select Partner"
          >
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {/* Add "All" option with a non-empty value */}
            <SelectItem key="all" value="all" className="rounded-lg">
              All
            </SelectItem>
            {/* Existing Partner Options */}
            {partnerIds.map((partner) => (
              <SelectItem key={partner} value={partner} className="rounded-lg">
                {partner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-lg font-semibold">Total Leads</p>
          <p className="text-2xl font-bold">
            <CountUp start={0} end={leads.length} duration={2} />
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-lg font-semibold">Total Demos</p>
          <p className="text-2xl font-bold">
            <CountUp start={0} end={totalDemos} duration={2} />
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-lg font-semibold">Total Sales</p>
          <p className="text-2xl font-bold">
            <CountUp start={0} end={totalSales} duration={2} />
          </p>
        </div>
      </div>

      {/* Existing Charts */}
      <div className="bg-white rounded-lg shadow p-6">
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1 text-center sm:text-left">
              <CardTitle>Lead Status Chart</CardTitle>
              <CardDescription>
                Showing Demo and Sale leads over time
              </CardDescription>
            </div>
            {/* Removed Partner Select from here */}
            <Select
              value={timeRange}
              onValueChange={(value: string) => {
                if (value === "30d" || value === "90d" || value === "180d") {
                  setTimeRange(value);
                }
              }}
            >
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select Time Range"
              >
                <SelectValue placeholder="Last 90 days" />
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
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillDemo" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillSale" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-2))"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-2))"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
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
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }
                        indicator="dot"
                      />
                    }
                  />
                  <Area
                    key="Demo"
                    dataKey="Demo"
                    type="monotone"
                    fill="url(#fillDemo)"
                    stroke={chartConfig.Demo.color}
                  />
                  <Area
                    key="Sale"
                    dataKey="Sale"
                    type="monotone"
                    fill="url(#fillSale)"
                    stroke={chartConfig.Sale.color}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
            {/* New BarChart Container */}
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[400px] w-full mt-8" // Added margin-top for spacing
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
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
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        }
                        indicator="line" // Changed from "bar" to "line"
                      />
                    }
                  />
                  <Bar
                    dataKey="Demo"
                    fill={chartConfig.Demo.color}
                    name="Demo"
                  />
                  <Bar
                    dataKey="Sale"
                    fill={chartConfig.Sale.color}
                    name="Sale"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
