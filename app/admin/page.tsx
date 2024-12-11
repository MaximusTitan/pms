"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
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
  create_date: string;
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
    color: "hsl(var(--chart-3))",
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

export default function AdminPage() {
  const supabase = createClient();
  const [latestAffiliates, setLatestAffiliates] = useState<Affiliate[]>([]);
  const [latestLeads, setLatestLeads] = useState<Lead[]>([]);
  const [latestPrograms, setLatestPrograms] = useState<Program[]>([]);
  const [reportNumbers, setReportNumbers] = useState<Report | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "180d">("90d");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch latest affiliates
    const fetchAffiliates = async () => {
      const { data } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setLatestAffiliates(data || []);
    };

    // Fetch latest leads
    const fetchLeads = async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("create_date", { ascending: false })
        .limit(5);
      setLatestLeads(data || []);
    };

    // Fetch latest programs
    const fetchPrograms = async () => {
      const { data } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setLatestPrograms(data || []);
    };

    // Fetch report numbers directly from tables
    const fetchReports = async () => {
      const [
        totalLeadsRes,
        totalDemosRes,
        totalSalesRes,
        activeProgramsRes,
        pendingAffiliatesRes,
      ] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("hs_lead_status", "Orientation scheduled"),
        supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("hs_lead_status", "Lead transformed"),
        supabase.from("programs").select("id", { count: "exact", head: true }),
        supabase
          .from("affiliates")
          .select("id", { count: "exact", head: true }),
      ]);

      setReportNumbers({
        totalLeads: totalLeadsRes.count || 0,
        totalDemos: totalDemosRes.count || 0,
        totalSales: totalSalesRes.count || 0,
        activePrograms: activeProgramsRes.count || 0,
        pendingAffiliates: pendingAffiliatesRes.count || 0,
      });
    };

    fetchAffiliates();
    fetchLeads();
    fetchPrograms();
    fetchReports();
  }, [supabase]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from("leads")
          .select("hs_lead_status, create_date")
          .order("create_date", { ascending: true });

        if (error) throw error;
        if (data) {
          setLeads(data as Lead[]);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchLeads();
  }, []);

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

  return (
    <div className="p-6 bg-neutral-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div
          className="bg-white rounded-lg shadow p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/leads")}
        >
          <p className="text-lg font-semibold text-gray-700">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">
            <CountUp end={reportNumbers?.totalLeads || 0} />
          </p>
        </div>
        <div
          className="bg-white rounded-lg shadow p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/reports")}
        >
          <p className="text-lg font-semibold text-gray-700">Total Demos</p>
          <p className="text-2xl font-bold text-gray-900">
            <CountUp end={reportNumbers?.totalDemos || 0} />
          </p>
        </div>
        <div
          className="bg-white rounded-lg shadow p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/reports")}
        >
          <p className="text-lg font-semibold text-gray-700">Total Sales</p>
          <p className="text-2xl font-bold text-gray-900">
            <CountUp end={reportNumbers?.totalSales || 0} />
          </p>
        </div>
        <div
          className="bg-white rounded-lg shadow p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/programs")}
        >
          <p className="text-lg font-semibold text-gray-700">Active Programs</p>
          <p className="text-2xl font-bold text-gray-900">
            <CountUp end={reportNumbers?.activePrograms || 0} />
          </p>
        </div>
        <div
          className="bg-white rounded-lg shadow p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/affiliates")}
        >
          <p className="text-lg font-semibold text-gray-700">
            Total Affiliates
          </p>
          <p className="text-2xl font-bold text-gray-900">
            <CountUp end={reportNumbers?.pendingAffiliates || 0} />
          </p>
        </div>
      </div>

      {/* Add Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1 text-center sm:text-left">
              <CardTitle>Lead Status Chart</CardTitle>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Latest Affiliates */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            Latest Affiliates
          </h3>
          <ul className="mb-4">
            {latestAffiliates
              .filter((a) => a.full_name)
              .map((affiliate) => (
                <li key={affiliate.id} className="border-b py-2">
                  <p className="font-medium text-gray-900">
                    {affiliate.full_name}
                  </p>
                  {/* Additional Details */}
                  <p className="text-sm text-gray-600">
                    Email: {affiliate.work_email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {affiliate.status}
                  </p>
                </li>
              ))}
          </ul>
          <Button
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-100 text-gray-800"
            onClick={() => (window.location.href = "/admin/affiliates")}
          >
            View All Affiliates
          </Button>
        </div>

        {/* Latest Leads */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            Latest Leads
          </h3>
          <ul className="mb-4">
            {latestLeads
              .filter((l) => l.first_name)
              .map((lead) => (
                <li key={lead.id} className="border-b py-2">
                  <p className="font-medium text-gray-900">
                    {lead.first_name} {lead.last_name}
                  </p>
                  {/* Additional Details */}
                  <p className="text-sm text-gray-600">Email: {lead.email}</p>
                  <p className="text-sm text-gray-600">Phone: {lead.phone}</p>
                </li>
              ))}
          </ul>
          <Button
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-100 text-gray-800"
            onClick={() => (window.location.href = "/admin/leads")}
          >
            View All Leads
          </Button>
        </div>

        {/* Latest Programs */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            Latest Programs
          </h3>
          <ul className="mb-4">
            {latestPrograms.map((program) => (
              <li key={program.id} className="border-b py-2">
                <p className="font-medium text-gray-900">{program.name}</p>
                {/* Additional Details */}
                <p className="text-sm text-gray-600">
                  Created At:{" "}
                  {new Date(program.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  Status: {program.status}
                </p>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-100 text-gray-800"
            onClick={() => (window.location.href = "/admin/programs")}
          >
            View All Programs
          </Button>
        </div>

        {/* Reports Summary */}
        {reportNumbers && (
          <div className="p-6 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Reports Summary
            </h3>
            <div className="space-y-2">
              <p className="text-gray-900">
                <span className="font-semibold">Total Leads:</span>{" "}
                {reportNumbers.totalLeads}
              </p>
              <p className="text-gray-900">
                <span className="font-semibold">Total Demos:</span>{" "}
                {reportNumbers.totalDemos}
              </p>
              <p className="text-gray-900">
                <span className="font-semibold">Total Sales:</span>{" "}
                {reportNumbers.totalSales}
              </p>
              <p className="text-gray-900">
                <span className="font-semibold">Active Programs:</span>{" "}
                {reportNumbers.activePrograms}
              </p>
              <p className="text-gray-900">
                <span className="font-semibold">Total Affiliates:</span>{" "}
                {reportNumbers.pendingAffiliates}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-100 text-gray-800 mt-4"
              onClick={() => (window.location.href = "/admin/reports")}
            >
              View Detailed Reports
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
