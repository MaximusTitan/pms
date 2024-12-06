"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import CountUp from "react-countup";

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

export default function AdminPage() {
  const supabase = createClient();
  const [latestAffiliates, setLatestAffiliates] = useState<Affiliate[]>([]);
  const [latestLeads, setLatestLeads] = useState<Lead[]>([]);
  const [latestPrograms, setLatestPrograms] = useState<Program[]>([]);
  const [reportNumbers, setReportNumbers] = useState<Report | null>(null);

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

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-black dark:text-white">
        Admin Dashboard
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div
          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/leads")}
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Total Leads
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            <CountUp end={reportNumbers?.totalLeads || 0} />
          </p>
        </div>
        <div
          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/reports")}
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Total Demos
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            <CountUp end={reportNumbers?.totalDemos || 0} />
          </p>
        </div>
        <div
          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/reports")}
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Total Sales
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            <CountUp end={reportNumbers?.totalSales || 0} />
          </p>
        </div>
        <div
          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/programs")}
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Active Programs
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            <CountUp end={reportNumbers?.activePrograms || 0} />
          </p>
        </div>
        <div
          className="bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg p-4 text-center cursor-pointer"
          onClick={() => (window.location.href = "/admin/affiliates")}
        >
          <p className="text-lg font-semibold text-gray-800 dark:text-neutral-200">
            Total Affiliates
          </p>
          <p className="text-2xl font-bold text-black dark:text-white">
            <CountUp end={reportNumbers?.pendingAffiliates || 0} />
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Latest Affiliates */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-neutral-100">
            Latest Affiliates
          </h3>
          <ul className="mb-4">
            {latestAffiliates
              .filter((a) => a.full_name)
              .map((affiliate) => (
                <li key={affiliate.id} className="border-b py-2">
                  <p className="font-medium text-gray-900 dark:text-neutral-100">
                    {affiliate.full_name}
                  </p>
                  {/* Additional Details */}
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Email: {affiliate.work_email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Status: {affiliate.status}
                  </p>
                </li>
              ))}
          </ul>
          <Button
            variant="outline"
            className="w-full border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200"
            onClick={() => (window.location.href = "/admin/affiliates")}
          >
            View All Affiliates
          </Button>
        </div>

        {/* Latest Leads */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-neutral-100">
            Latest Leads
          </h3>
          <ul className="mb-4">
            {latestLeads
              .filter((l) => l.first_name)
              .map((lead) => (
                <li key={lead.id} className="border-b py-2">
                  <p className="font-medium text-gray-900 dark:text-neutral-100">
                    {lead.first_name} {lead.last_name}
                  </p>
                  {/* Additional Details */}
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Email: {lead.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Phone: {lead.phone}
                  </p>
                </li>
              ))}
          </ul>
          <Button
            variant="outline"
            className="w-full border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200"
            onClick={() => (window.location.href = "/admin/leads")}
          >
            View All Leads
          </Button>
        </div>

        {/* Latest Programs */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-neutral-100">
            Latest Programs
          </h3>
          <ul className="mb-4">
            {latestPrograms.map((program) => (
              <li key={program.id} className="border-b py-2">
                <p className="font-medium text-gray-900 dark:text-neutral-100">
                  {program.name}
                </p>
                {/* Additional Details */}
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Created At:{" "}
                  {new Date(program.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Status: {program.status}
                </p>
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200"
            onClick={() => (window.location.href = "/admin/programs")}
          >
            View All Programs
          </Button>
        </div>

        {/* Reports Summary */}
        {reportNumbers && (
          <div className="p-6 bg-neutral-50 dark:bg-neutral-800 rounded-lg shadow dark:shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-neutral-100">
              Reports Summary
            </h3>
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-neutral-100">
                <span className="font-semibold">Total Leads:</span>{" "}
                {reportNumbers.totalLeads}
              </p>
              <p className="text-gray-900 dark:text-neutral-100">
                <span className="font-semibold">Total Demos:</span>{" "}
                {reportNumbers.totalDemos}
              </p>
              <p className="text-gray-900 dark:text-neutral-100">
                <span className="font-semibold">Total Sales:</span>{" "}
                {reportNumbers.totalSales}
              </p>
              <p className="text-gray-900 dark:text-neutral-100">
                <span className="font-semibold">Active Programs:</span>{" "}
                {reportNumbers.activePrograms}
              </p>
              <p className="text-gray-900 dark:text-neutral-100">
                <span className="font-semibold">Total Affiliates:</span>{" "}
                {reportNumbers.pendingAffiliates}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-800 dark:text-neutral-200 mt-4"
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
