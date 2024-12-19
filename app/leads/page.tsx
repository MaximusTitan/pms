"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { ChevronUp, ChevronDown, MoreHorizontal } from "lucide-react";

interface Lead {
  id: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  last_modified_date: string | null;
  raw_data: any;
  create_date: string | null;
  phone: string | null;
  city: string | null;
  school_district: string | null;
  partner_id: string | null;
  kid_s_name: string | null;
  kid_s_grade: string | null;
  lead_source: string | null;
  hs_lead_status: string | null;
}

// Define all possible columns
const ALL_COLUMNS: (keyof Lead)[] = [
  "create_date",
  "first_name",
  "phone",
  "email",
  "city",
  "school_district",
  "kid_s_name",
  "kid_s_grade",
  "lead_source",
  "partner_id",
  "hs_lead_status",
];

const client = createClient();

// Add this helper function before the LeadsPage component
const getColumnDisplayName = (column: keyof Lead): string => {
  const displayNames: Record<keyof Lead, string> = {
    create_date: "Date Created",
    first_name: "Name",
    last_name: "Last Name",
    phone: "Phone Number",
    email: "Email Address",
    city: "City",
    school_district: "School District",
    kid_s_name: "Kid's Name",
    kid_s_grade: "Kid's Grade",
    lead_source: "Lead Source",
    partner_id: "Partner ID",
    hs_lead_status: "Lead Status",
    id: "ID",
    last_modified_date: "Last Modified",
    raw_data: "Raw Data",
  };
  return (
    displayNames[column] ||
    column.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [sortField, setSortField] = useState<keyof Lead>("create_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedColumns, setSelectedColumns] = useState<(keyof Lead)[]>([
    "create_date",
    "first_name",
    "phone",
    "email",
    "city",
    "kid_s_name",
  ]);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await client.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("Not authenticated");

        // Get affiliate info for current user
        const { data: affiliateData, error: affiliateError } = await client
          .from("affiliates")
          .select("affiliate_id")
          .eq("work_email", user.email)
          .single();

        if (affiliateError) throw affiliateError;
        if (!affiliateData) throw new Error("Affiliate not found");

        // Get leads for this affiliate
        const { data, error } = await client
          .from("leads")
          .select("*")
          .eq("partner_id", affiliateData.affiliate_id)
          .order(sortField, { ascending: sortOrder === "asc" });

        if (error) throw error;
        setLeads(data as Lead[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [sortField, sortOrder]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return { date: "", time: "" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const filteredLeads = leads.filter(
    (lead) =>
      (lead.first_name &&
        lead.first_name.toLowerCase().includes(search.toLowerCase())) ||
      (lead.last_name &&
        lead.last_name.toLowerCase().includes(search.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase())) ||
      (lead.kid_s_name &&
        lead.kid_s_name.toLowerCase().includes(search.toLowerCase())) ||
      (lead.phone && lead.phone.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: keyof Lead) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const renderSortIcon = (field: keyof Lead) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="inline-block w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="inline-block w-4 h-4 ml-1" />
    );
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      const leftSide = Math.max(2, currentPage - 1);
      const rightSide = Math.min(totalPages - 1, currentPage + 1);

      if (leftSide > 2) pageNumbers.push(-1);

      for (let i = leftSide; i <= rightSide; i++) {
        pageNumbers.push(i);
      }

      if (rightSide < totalPages - 1) pageNumbers.push(-1);
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const handleColumnToggle = (column: keyof Lead) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedColumns(checked ? ALL_COLUMNS : []);
  };

  if (loading) return <p className="p-4 text-center">Loading leads...</p>;
  if (error)
    return <p className="p-4 text-center text-red-500">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 py-6 space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <div className="flex flex-col md:flex-row items-center space-x-0 md:space-x-4 space-y-2 md:space-y-0">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            className="w-full md:max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-rose-500 border-rose-500 hover:bg-rose-500/10"
              >
                Columns <MoreHorizontal className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Select Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedColumns.length === ALL_COLUMNS.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all">Select All</Label>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {ALL_COLUMNS.map((column) => (
                <DropdownMenuItem
                  key={column}
                  onSelect={(e) => e.preventDefault()}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={column}
                      checked={selectedColumns.includes(column)}
                      onCheckedChange={() => handleColumnToggle(column)}
                    />
                    <Label htmlFor={column}>
                      {getColumnDisplayName(column)}
                    </Label>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {selectedColumns.map((field) => (
                <TableHead
                  key={field}
                  onClick={() => handleSort(field)}
                  className="cursor-pointer hover:bg-rose-500/10 transition-colors"
                >
                  {field === "create_date"
                    ? "Date"
                    : field === "first_name"
                      ? "Name"
                      : field === "kid_s_name"
                        ? "Kid's Name"
                        : field === "kid_s_grade"
                          ? "Kid's Grade"
                          : field === "school_district"
                            ? "School Dist"
                            : field === "lead_source"
                              ? "Lead Source"
                              : field === "partner_id"
                                ? "Lead Source Drilldown"
                                : field === "hs_lead_status"
                                  ? "Lead Status"
                                  : field
                                      .replace(/_/g, " ")
                                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  {renderSortIcon(field)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.map((lead) => (
              <TableRow key={lead.id}>
                {selectedColumns.map((field) => (
                  <TableCell key={field}>
                    {field === "create_date" ? (
                      <>
                        <div>{formatDate(lead[field]).date}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(lead[field]).time}
                        </div>
                      </>
                    ) : field === "first_name" ? (
                      <div className="flex flex-col">
                        <span>
                          {`${lead.first_name || ""} ${lead.last_name || ""}`.trim() ||
                            "-"}
                        </span>
                      </div>
                    ) : (
                      lead[field] || ""
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredLeads.length === 0 && (
        <p className="text-center text-gray-500 py-4">No leads found</p>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-4 flex justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) setCurrentPage(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>
            {generatePageNumbers().map((pageNum) =>
              pageNum === -1 ? (
                <PaginationItem key={`ellipsis-${Math.random()}`}>
                  <span className="px-2">...</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === pageNum}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(pageNum);
                    }}
                    className={currentPage === pageNum ? "text-rose-500" : ""}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default LeadsPage;
