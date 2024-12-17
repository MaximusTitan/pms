import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ReportsSummaryProps {
  reportNumbers: {
    totalLeads: number;
    totalDemos: number;
    totalSales: number;
    activePrograms: number;
  };
  router: any;
}

const ReportsSummary: React.FC<ReportsSummaryProps> = ({
  reportNumbers,
  router,
}) => {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Reports Summary</CardTitle>
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
  );
};

export default ReportsSummary;
