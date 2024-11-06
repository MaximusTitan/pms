"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProgramNavigationProps {
  programId: string;
}

export function ProgramNavigation({ programId }: ProgramNavigationProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "General", href: `/admin/programs/${programId}/manage` },
    {
      name: "Revenue & Payouts",
      href: `/admin/programs/${programId}/manage/revenue`,
    },
    {
      name: "Landing Pages",
      href: `/admin/programs/${programId}/manage/landing-pages`,
    },
    {
      name: "Creatives",
      href: `/admin/programs/${programId}/manage/creatives`,
    },
    {
      name: "Affiliate Tracking",
      href: `/admin/programs/${programId}/manage/tracking`,
    },
  ];

  return (
    <div className="w-64 border-r p-4 space-y-2">
      {menuItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "block px-4 py-2 rounded-md text-sm hover:bg-gray-100",
            pathname === item.href ? "bg-gray-100 font-medium" : ""
          )}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
}
