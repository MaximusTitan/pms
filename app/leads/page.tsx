"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { createClient } from "@/utils/supabase/client";

interface Lead {
  id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  create_date: string | null;
  last_modified_date: string | null;
  raw_data: any;
  created_at: string | null;
  phone: string | null;
  city: string | null;
  school_district: string | null;
  partner_id: string | null;
  kid_s_name: string | null;
  kid_s_grade: string | null;
  lead_source: string | null;
  hs_lead_status: string | null;
}

const client = createClient();

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Lead>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = (await client
          .from<"leads", Lead>("leads")
          .select("*")
          .order(sortField, { ascending: sortOrder === "asc" })) as {
          data: Lead[] | null;
          error: any;
        };

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
  }, [sortField, sortOrder]);

  const filteredLeads = leads.filter(
    (lead) =>
      (lead.first_name &&
        lead.first_name.toLowerCase().includes(search.toLowerCase())) ||
      (lead.last_name &&
        lead.last_name.toLowerCase().includes(search.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()))
  );

  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Lead) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  if (loading) return <p>Loading leads...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Supabase Leads</h1>
        <div className="flex items-center py-4">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("first_name")}>
                  First Name
                </TableHead>
                <TableHead onClick={() => handleSort("last_name")}>
                  Last Name
                </TableHead>
                <TableHead onClick={() => handleSort("email")}>Email</TableHead>
                <TableHead onClick={() => handleSort("created_at")}>
                  Created At
                </TableHead>
                <TableHead onClick={() => handleSort("phone")}>Phone</TableHead>
                <TableHead onClick={() => handleSort("city")}>City</TableHead>
                <TableHead onClick={() => handleSort("school_district")}>
                  School District
                </TableHead>
                <TableHead onClick={() => handleSort("partner_id")}>
                  Partner ID
                </TableHead>
                <TableHead onClick={() => handleSort("kid_s_name")}>
                  Kid's Name
                </TableHead>
                <TableHead onClick={() => handleSort("kid_s_grade")}>
                  Kid's Grade
                </TableHead>
                <TableHead onClick={() => handleSort("lead_source")}>
                  Lead Source
                </TableHead>
                <TableHead onClick={() => handleSort("hs_lead_status")}>
                  Lead Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.first_name}</TableCell>
                  <TableCell>{lead.last_name}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.created_at}</TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.city}</TableCell>
                  <TableCell>{lead.school_district}</TableCell>
                  <TableCell>{lead.partner_id}</TableCell>
                  <TableCell>{lead.kid_s_name}</TableCell>
                  <TableCell>{lead.kid_s_grade}</TableCell>
                  <TableCell>{lead.lead_source}</TableCell>
                  <TableCell>{lead.hs_lead_status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
              />
            </PaginationItem>
            {[...Array(Math.ceil(filteredLeads.length / itemsPerPage))].map(
              (_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (
                    currentPage < Math.ceil(filteredLeads.length / itemsPerPage)
                  )
                    setCurrentPage(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default LeadsPage;
