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

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
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
  );
};

export default LatestLeads;
