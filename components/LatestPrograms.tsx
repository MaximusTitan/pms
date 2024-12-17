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

interface Program {
  id: number;
  name: string;
  created_at: string;
}

interface LatestProgramsProps {
  latestPrograms: Program[];
  router: any;
}

const LatestPrograms: React.FC<LatestProgramsProps> = ({
  latestPrograms,
  router,
}) => {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Latest Programs</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          {latestPrograms.map((program) => (
            <li key={program.id} className="py-2 border-b last:border-none">
              <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                {program.name}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-neutral-400">
                Created At: {new Date(program.created_at).toLocaleDateString()}
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
  );
};

export default LatestPrograms;
