import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface ChartDataPoint {
  date: string;
  Lead: number;
  Demo: number;
  Sale: number;
}

interface ChartSectionProps {
  chartData: ChartDataPoint[];
  chartConfig: ChartConfig;
  timeRange: "30d" | "90d" | "180d";
  setTimeRange: (value: "30d" | "90d" | "180d") => void;
  dataFilter: "All" | "Lead" | "Demo" | "Sale";
  setDataFilter: (value: "All" | "Lead" | "Demo" | "Sale") => void;
}

const ChartSection: React.FC<ChartSectionProps> = ({
  chartData,
  chartConfig,
  timeRange,
  setTimeRange,
  dataFilter,
  setDataFilter,
}) => {
  return (
    <div className="mb-6 sm:mb-8">
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
        <CardFooter>{/* Optional footer content */}</CardFooter>
      </Card>
    </div>
  );
};

export default ChartSection;
