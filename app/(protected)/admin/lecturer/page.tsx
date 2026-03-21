"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, SlidersHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const ITEMS_PER_PAGE = 20;

type Lecturer = {
  LecturerID: string;
  LecturerCode: string;
  EmployedTime: string;
  Name: string;
  Email: string;
  DepartmentID: string;
  DepartmentName: string;
};

type Department = {
  DepartmentID: string;
  Name: string;
};

function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getDepartmentCodeColor(departmentId?: string | null) {
  if (!departmentId) {
    return "bg-gray-100 text-gray-500 border-0";
  }

  const num = parseInt(departmentId.replace(/\D/g, ""), 10);

  if (Number.isNaN(num)) {
    return "bg-gray-100 text-gray-500 border-0";
  }

  return num % 2 === 0
    ? "bg-indigo-100 text-indigo-700 border-0"
    : "bg-purple-100 text-purple-700 border-0";
}

export default function LecturerManagementPage() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartmentCode, setSelectedDepartmentCode] = useState("all");
  const [selectedDepartmentName, setSelectedDepartmentName] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/lecturers/list");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch lecturers");
      }

      setLecturers(data.lecturers || []);
      setDepartments(data.departments || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load lecturers");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredLecturers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return lecturers
      .filter((lecturer) => {
        const matchesSearch =
          !query ||
          lecturer.LecturerCode.toLowerCase().includes(query) ||
          lecturer.Name.toLowerCase().includes(query) ||
          lecturer.Email.toLowerCase().includes(query);

        const matchesDepartmentCode =
          selectedDepartmentCode === "all" || lecturer.DepartmentID === selectedDepartmentCode;

        const matchesDepartmentName =
          selectedDepartmentName === "all" || lecturer.DepartmentID === selectedDepartmentName;

        return matchesSearch && matchesDepartmentCode && matchesDepartmentName;
      })
      .sort((a, b) => a.LecturerCode.localeCompare(b.LecturerCode));
  }, [lecturers, searchQuery, selectedDepartmentCode, selectedDepartmentName]);

  const totalPages = Math.max(1, Math.ceil(filteredLecturers.length / ITEMS_PER_PAGE));

  const paginatedLecturers = useMemo(() => {
    return filteredLecturers.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredLecturers, currentPage]);

  const pageNumbers = useMemo(() => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);

      if (currentPage > 4) pages.push("ellipsis");

      const mid = Math.max(4, Math.min(currentPage, totalPages - 3));
      if (mid > 3 && mid < totalPages - 2) pages.push(mid);

      if (currentPage < totalPages - 3) pages.push("ellipsis");

      pages.push(totalPages - 1, totalPages);
    }

    return [...new Set(pages)];
  }, [currentPage, totalPages]);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedDepartmentCode !== "all" ||
    selectedDepartmentName !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDepartmentCode("all");
    setSelectedDepartmentName("all");
    setCurrentPage(1);
  };

  const handleDeleteLecturer = async (lecturerId: string, lecturerCode: string) => {
    const confirmed = confirm(
      `Delete lecturer ${lecturerCode}?\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/lecturers/delete/${lecturerId}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to delete lecturer");
      }

      toast.success(`Lecturer ${lecturerCode} deleted`);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete lecturer");
    }
  };

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lecturer Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view all lecturer accounts
          </p>
        </div>

        <Link href="/admin/lecturer/add">
          <Button className="gap-2 transition-colors hover:bg-primary/90">
            <Plus className="size-4" />
            Add Lecturer
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[220px] space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search lecturer..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Department Code</label>
          <Select
            value={selectedDepartmentCode}
            onValueChange={(value) => {
              setSelectedDepartmentCode(value);
              setSelectedDepartmentName(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Codes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Codes</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.DepartmentID} value={department.DepartmentID}>
                  {department.DepartmentID}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Department Name</label>
          <Select
            value={selectedDepartmentName}
            onValueChange={(value) => {
              setSelectedDepartmentName(value);
              setSelectedDepartmentCode(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.DepartmentID} value={department.DepartmentID}>
                  {department.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="gap-2 transition-colors hover:bg-accent"
          >
            <SlidersHorizontal className="size-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lecturer Code</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department Code</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Employed Time</TableHead>
              <TableHead className="text-center w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-4 w-32 animate-pulse bg-muted rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedLecturers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No lecturers found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLecturers.map((lecturer) => (
                <TableRow key={lecturer.LecturerID} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="text-center font-medium">{lecturer.LecturerCode}</TableCell>
                  <TableCell className="text-center">{lecturer.Name}</TableCell>
                  <TableCell className="text-center">{lecturer.Email}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${getDepartmentCodeColor(
                        lecturer.DepartmentID
                      )}`}
                    >
                      {lecturer.DepartmentID}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{lecturer.DepartmentName}</TableCell>
                  <TableCell className="text-center">{formatDate(lecturer.EmployedTime)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/lecturer/edit/${lecturer.LecturerID}`}>
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
                        onClick={() =>
                          handleDeleteLecturer(lecturer.LecturerID, lecturer.LecturerCode)
                        }
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

        {!isLoading && filteredLecturers.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredLecturers.length)}
              </span>{" "}
              of <span className="font-medium">{filteredLecturers.length}</span>
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

              {pageNumbers.map((page, i) =>
                page === "ellipsis" ? (
                  <span key={i} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                )
              )}

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
