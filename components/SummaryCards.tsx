import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import CountUp from "react-countup";
import { useRouter } from "next/navigation";

interface SummaryCardsProps {
  reportNumbers: {
    totalLeads: number;
    totalDemos: number;
    totalSales: number;
    activePrograms: number;
  };
  router: any;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  reportNumbers,
  router,
}) => {
  const cards = [
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {cards.map((item) => (
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
  );
};

export default SummaryCards;
