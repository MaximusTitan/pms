"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  LineChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Lead {
  id: number;
  hs_lead_status: string | null;
  create_date: string | null;
  partner_id: string | null;
}

const client = createClient();

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

interface ChartDataPoint {
  date: string;
  Lead: number;
  Demo: number;
  Sale: number;
}

const ReportsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "180d">("90d");
  const [partnerId, setPartnerId] = useState<string>("all");
  const [partnerIds, setPartnerIds] = useState<string[]>([]);

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
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const query = client
          .from("leads")
          .select("hs_lead_status, create_date, partner_id")
          .order("create_date", { ascending: true });

        if (partnerId !== "all") {
          query.eq("partner_id", partnerId);
        }

        const { data, error } = await query;

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

    fetchLeads();
  }, [timeRange, partnerId]);

  useEffect(() => {
    const categorizeLeads = () => {
      const endDate = new Date();
      let startDate = new Date();
      if (timeRange === "30d") {
        startDate.setDate(endDate.getDate() - 30);
      } else if (timeRange === "180d") {
        startDate.setDate(endDate.getDate() - 180);
      } else {
        startDate.setDate(endDate.getDate() - 90);
      }

      const filteredLeads = leads.filter((lead) => {
        if (!lead.create_date) return false;
        const leadDate = new Date(lead.create_date);
        return leadDate >= startDate && leadDate <= endDate;
      });

      const aggregation: {
        [key: string]: { Lead: number; Demo: number; Sale: number };
      } = {};

      filteredLeads.forEach((lead) => {
        if (!lead.create_date) return;
        const date = new Date(lead.create_date);
        const dateKey = date.toISOString().split("T")[0];

        if (!aggregation[dateKey]) {
          aggregation[dateKey] = { Lead: 0, Demo: 0, Sale: 0 };
        }

        aggregation[dateKey].Lead += 1;

        if (lead.hs_lead_status === "Orientation scheduled") {
          aggregation[dateKey].Demo += 1;
        } else if (lead.hs_lead_status === "Lead transformed") {
          aggregation[dateKey].Sale += 1;
        }
      });

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

  // Calculate totals
  const totalLead = chartData.reduce((sum, data) => sum + data.Lead, 0);
  const totalDemo = chartData.reduce((sum, data) => sum + data.Demo, 0);
  const totalSale = chartData.reduce((sum, data) => sum + data.Sale, 0);

  if (loading) return <p className="p-4 text-center">Loading reports...</p>;
  if (error)
    return <p className="p-4 text-center text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports Management</h1>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Partner ID</label>
            <Select
              value={partnerId}
              onValueChange={(value: string) => setPartnerId(value)}
            >
              <SelectTrigger
                className="w-[160px] rounded-lg"
                aria-label="Select Partner"
              >
                <SelectValue placeholder="Select Partner" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all" className="rounded-lg">
                  All
                </SelectItem>
                {partnerIds.map((partner) => (
                  <SelectItem
                    key={partner}
                    value={partner}
                    className="rounded-lg"
                  >
                    {partner}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time Range</label>
            <Select
              value={timeRange}
              onValueChange={(value: "30d" | "90d" | "180d") => {
                setTimeRange(value);
              }}
            >
              <SelectTrigger
                className="w-[160px] rounded-lg"
                aria-label="Select Time Range"
              >
                <SelectValue placeholder="Select range" />
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
          </div>
        </div>
      </div>
      <div className="flex justify-around mb-4 text-sm text-gray-600">
        <div>Total Lead: {totalLead}</div>
        <div>Total Demo: {totalDemo}</div>
        <div>Total Sale: {totalSale}</div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <Card>
          <CardHeader className="border-b pb-4">
            <CardTitle>Lead Status Chart</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[400px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
