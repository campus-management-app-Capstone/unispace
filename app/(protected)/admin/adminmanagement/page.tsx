"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ITEMS_PER_PAGE = 20;

type AdminUser = {
  AdminID: string;
  AdminCode: string;
  UserID: string;
  Name: string;
  Email: string;
  Role: string;
};

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/admins/list");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load admins");
      }

      setAdmins(data.admins || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admins");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAdmins = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return admins
      .filter((admin) => {
        return (
          !query ||
          admin.AdminCode.toLowerCase().includes(query) ||
          admin.Name.toLowerCase().includes(query) ||
          admin.Email.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => a.AdminCode.localeCompare(b.AdminCode));
  }, [admins, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / ITEMS_PER_PAGE));

  const paginatedAdmins = useMemo(() => {
    return filteredAdmins.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredAdmins, currentPage]);

  const handleDeleteAdmin = async (adminId: string, adminCode: string) => {
    const confirmed = confirm(`Delete admin ${adminCode}?\nThis action cannot be undone.`);

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/admins/delete/${adminId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to delete admin");
      }

      toast.success(`Admin ${adminCode} deleted`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete admin");
    }
  };

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Directory</h1>
          <p className="text-sm text-muted-foreground">Manage administrator accounts</p>
        </div>

        <Link href="/admin/adminmanagement/add">
          <Button className="gap-2 transition-colors hover:bg-primary/90">
            <Plus className="size-4" />
            Add Admin
          </Button>
        </Link>
      </div>

      <div className="max-w-md space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search admin..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Code</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
              <TableHead className="text-center w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <div className="h-4 w-32 animate-pulse bg-muted rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                  No admins found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAdmins.map((admin) => (
                <TableRow key={admin.AdminID} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center font-medium">{admin.AdminCode}</TableCell>
                  <TableCell className="text-center">{admin.Name}</TableCell>
                  <TableCell className="text-center">{admin.Email}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/adminmanagement/edit/${admin.AdminID}`}>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="transition-colors hover:bg-blue-50"
                        >
                          <Pencil className="size-4 text-blue-600" />
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => handleDeleteAdmin(admin.AdminID, admin.AdminCode)}
                        className="transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {!isLoading && filteredAdmins.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAdmins.length)}</span>{" "}
              of <span className="font-medium">{filteredAdmins.length}</span>
            </p>

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>

              <Button variant="outline" size="icon-sm" className="min-w-8">
                {currentPage}
              </Button>

              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
