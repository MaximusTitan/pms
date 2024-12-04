"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search, ArrowUpDown } from "lucide-react"; // Add this import
import Link from "next/link"; // Add this import

interface Affiliate {
  id: number;
  full_name: string;
  work_email: string;
  affiliate_id: string;
  status: string;
  send_welcome_email: boolean;
  created_at: string;
}

export function AffiliateUI() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    status: "pending",
    full_name: "",
    work_email: "",
    password: "",
    affiliate_id: "",
    send_welcome_email: true,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAffiliates, setSelectedAffiliates] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Affiliate | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Add new state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [editAffiliateData, setEditAffiliateData] = useState<Affiliate | null>(
    null
  );

  useEffect(() => {
    const fetchAffiliates = async () => {
      try {
        const { data, error } = await supabase
          .from("affiliates")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;
        console.log("Fetched affiliates:", data); // Debug log
        setAffiliates(data || []);
      } catch (err) {
        console.error("Failed to load affiliates", err);
        setError("Failed to load affiliates. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("affiliates")
        .insert([
          {
            status: formData.status,
            full_name: formData.full_name,
            work_email: formData.work_email,
            password: formData.password, // Note: In production, hash this password
            affiliate_id: formData.affiliate_id,
            send_welcome_email: formData.send_welcome_email,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      // Fix: Add new affiliates at the beginning of the array
      setAffiliates([...affiliates, ...(data || [])]);
      setShowAddForm(false);
      setFormData({
        status: "pending",
        full_name: "",
        work_email: "",
        password: "",
        affiliate_id: "",
        send_welcome_email: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add affiliate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const paginateData = (items: Affiliate[]) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return {
      items: items.slice(startIndex, endIndex),
      totalPages: Math.ceil(items.length / pageSize),
    };
  };

  // Modify handleStatusUpdate to a general update function
  const handleAffiliateUpdate = async (updatedAffiliate: Affiliate) => {
    try {
      const { error } = await supabase
        .from("affiliates")
        .update({
          full_name: updatedAffiliate.full_name,
          work_email: updatedAffiliate.work_email,
          affiliate_id: updatedAffiliate.affiliate_id,
          status: updatedAffiliate.status,
          // Include other fields as necessary
        })
        .eq("id", updatedAffiliate.id);

      if (error) throw error;

      setAffiliates((prevAffiliates) =>
        prevAffiliates.map((affiliate) =>
          affiliate.id === updatedAffiliate.id ? updatedAffiliate : affiliate
        )
      );
      setIsEditing(false);
      setEditAffiliateData(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update affiliate"
      );
    }
  };

  const getFilteredAffiliates = (items: Affiliate[]) => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase().trim();
    return items.filter(
      (affiliate) =>
        affiliate.full_name.toLowerCase().includes(query) ||
        affiliate.work_email.toLowerCase().includes(query) ||
        affiliate.affiliate_id.toLowerCase().includes(query)
    );
  };

  const handleSort = (field: keyof Affiliate) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedItems = (items: Affiliate[]) => {
    if (!sortField) return items;

    return [...items].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Special handling for dates
      if (
        sortField === "created_at" &&
        typeof aValue === "string" &&
        typeof bValue === "string"
      ) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const renderTableContent = (items: Affiliate[]) => {
    const filteredItems = getFilteredAffiliates(items);
    const sortedItems = getSortedItems(filteredItems);
    const { items: paginatedItems, totalPages } = paginateData(sortedItems);

    const SortableHeader = ({
      field,
      children,
    }: {
      field: keyof Affiliate;
      children: React.ReactNode;
    }) => (
      <TableHead>
        <button
          onClick={() => handleSort(field)}
          className="flex items-center space-x-1 hover:opacity-80"
        >
          <span>{children}</span>
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </TableHead>
    );

    return (
      <div className="space-y-4">
        {/* Add tip */}
        <div className="mb-4 text-sm text-muted-foreground">
          Tip: Click on a partner's name to open their management panel.
        </div>

        {/* Add search bar */}
        <div className="flex justify-end mb-4">
          <div className="relative w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or affiliate ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No affiliates found matching your search
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="full_name">Full Name</SortableHeader>
                  <SortableHeader field="work_email">Work Email</SortableHeader>
                  <SortableHeader field="affiliate_id">
                    Affiliate ID
                  </SortableHeader>
                  <SortableHeader field="status">Status</SortableHeader>
                  <SortableHeader field="created_at">Created At</SortableHeader>
                  {/* Remove the Edit column header */}
                  {/* <TableHead>Edit</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((affiliate) => (
                  <TableRow key={affiliate.id}>
                    <TableCell>
                      <Link
                        href={`/admin/affiliates/${affiliate.affiliate_id}/manage`}
                      >
                        {affiliate.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>{affiliate.work_email}</TableCell>
                    <TableCell>{affiliate.affiliate_id}</TableCell>
                    <TableCell>
                      <Select
                        value={affiliate.status}
                        onValueChange={(value) =>
                          handleAffiliateUpdate({ ...affiliate, status: value })
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">
                            <span className="flex items-center">
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                              Active
                            </span>
                          </SelectItem>
                          <SelectItem value="disabled">
                            <span className="flex items-center">
                              <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                              Disabled
                            </span>
                          </SelectItem>
                          <SelectItem value="pending">
                            <span className="flex items-center">
                              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                              Pending
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(
                        affiliate.created_at.replace(" ", "T")
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    {/* Remove the Edit button cell */}
                    {/* 
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(true);
                          setEditAffiliateData(affiliate);
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell> 
                    */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between">
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  <PaginationItem className="flex items-center">
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>
    );
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Affiliates</span>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              Add New Affiliate
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="disabled">Disabled</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                {renderTableContent(affiliates)}
              </TabsContent>
              <TabsContent value="active">
                {renderTableContent(
                  affiliates.filter((a) => a.status === "enabled")
                )}
              </TabsContent>
              <TabsContent value="pending">
                {renderTableContent(
                  affiliates.filter((a) => a.status === "pending")
                )}
              </TabsContent>
              <TabsContent value="disabled">
                {renderTableContent(
                  affiliates.filter((a) => a.status === "disabled")
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {showAddForm && (
        <div className="fixed inset-0 bg-neutral-400 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
          <Card className="w-full max-w-lg bg-neutral-50 border-neutral-400">
            <CardHeader>
              <CardTitle>Add New Affiliate</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="John Doe"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="work_email">Work Email</Label>
                  <Input
                    id="work_email"
                    name="work_email"
                    type="email"
                    placeholder="email@yourcompany.com"
                    value={formData.work_email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="affiliate_id">Affiliate ID</Label>
                  <Input
                    id="affiliate_id"
                    name="affiliate_id"
                    placeholder="john-doe"
                    value={formData.affiliate_id}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Be careful. This cannot be changed later.
                  </p>
                </div>
                <div>
                  <Label>Send Welcome Email</Label>
                  <RadioGroup
                    name="send_welcome_email"
                    value={formData.send_welcome_email ? "yes" : "no"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        send_welcome_email: value === "yes",
                      })
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="welcome-yes" />
                      <Label htmlFor="welcome-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="welcome-no" />
                      <Label htmlFor="welcome-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add New Affiliate"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {isEditing && editAffiliateData && (
        <div className="fixed inset-0 bg-neutral-400 bg-opacity-50 backdrop-blur-sm flex justify-center items-center">
          <Card className="w-full max-w-lg bg-neutral-50 border-neutral-400">
            <CardHeader>
              <CardTitle>Edit Affiliate</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAffiliateUpdate(editAffiliateData);
                }}
                className="space-y-6"
              >
                <div>
                  <Label htmlFor="edit_status">Status</Label>
                  <Select
                    name="status"
                    value={editAffiliateData.status}
                    onValueChange={(value) =>
                      setEditAffiliateData({
                        ...editAffiliateData,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enabled">Enabled</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_full_name">Full Name</Label>
                  <Input
                    id="edit_full_name"
                    name="full_name"
                    value={editAffiliateData.full_name}
                    onChange={(e) =>
                      setEditAffiliateData({
                        ...editAffiliateData,
                        full_name: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_work_email">Work Email</Label>
                  <Input
                    id="edit_work_email"
                    name="work_email"
                    type="email"
                    value={editAffiliateData.work_email}
                    onChange={(e) =>
                      setEditAffiliateData({
                        ...editAffiliateData,
                        work_email: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_affiliate_id">Affiliate ID</Label>
                  <Input
                    id="edit_affiliate_id"
                    name="affiliate_id"
                    value={editAffiliateData.affiliate_id}
                    onChange={(e) =>
                      setEditAffiliateData({
                        ...editAffiliateData,
                        affiliate_id: e.target.value,
                      })
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Be cautious when changing the Affiliate ID.
                  </p>
                </div>
                {/* Add other fields as necessary */}
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditAffiliateData(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    Update Affiliate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
