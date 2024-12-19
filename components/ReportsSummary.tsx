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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-4" />
                Total Leads
              </TableCell>
              <TableCell>{reportNumbers.totalLeads}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <span className="inline-block w-2 h-2 bg-rose-500 rounded-full mr-4" />
                Total Demos
              </TableCell>
              <TableCell>{reportNumbers.totalDemos}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-4" />
                Total Sales
              </TableCell>
              <TableCell>{reportNumbers.totalSales}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-4" />
                Active Programs
              </TableCell>
              <TableCell>{reportNumbers.activePrograms}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
