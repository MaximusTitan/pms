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
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table"; // Import shadcn table components

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  kid_s_name: string; // Added Kid's Name
  create_date: string; // Added Date
}

interface LatestLeadsProps {
  latestLeads: Lead[];
  router: any;
}

const LatestLeads: React.FC<LatestLeadsProps> = ({ latestLeads, router }) => {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Latest Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Kid&apos;s Name</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {latestLeads
              .filter((lead) => lead.first_name)
              .map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    {lead.first_name} {lead.last_name}
                  </TableCell>
                  <TableCell>{lead.kid_s_name}</TableCell>
                  <TableCell>
                    {new Date(lead.create_date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
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
  );
};

export default LatestLeads;
