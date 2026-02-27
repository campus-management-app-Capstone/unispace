"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import CreateNewCourseForm, {
  type CourseFormValues,
} from "@/components/CreateNewCourseForm";

/** Shape of a course row joined with its department name */
interface CourseWithDepartment {
  CourseID: string;
  Name: string;
  Level: string;
  TotalSemester: number;
  DepartmentID: string;
  DepartmentName: string;
}

interface Department {
  DepartmentID: string;
  Name: string;
}

const ITEMS_PER_PAGE = 5;

/** Level badge colour map */
const levelColorMap: Record<string, string> = {
  Undergraduate:
    "bg-sky-100 text-sky-700 border-0",
  Foundation:
    "bg-amber-100 text-amber-700 border-0",
  Diploma:
    "bg-emerald-100 text-emerald-700 border-0",
};

/**
 * CourseListPage — client-side course directory
 * Fetches courses + departments from Supabase and provides
 * search, department filter, level filter, and pagination.
 */
export default function CourseListPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseWithDepartment[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Reusable fetch — pulls courses + departments from Supabase */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createBrowserSupabaseClient();

    const [courseRes, deptRes] = await Promise.all([
      supabase
        .from("Course")
        .select("CourseID, Name, Level, TotalSemester, DepartmentID")
        .order("Name"),
      supabase.from("Department").select("DepartmentID, Name").order("Name"),
    ]);

    const deptMap = new Map<string, string>();
    (deptRes.data ?? []).forEach((d) => deptMap.set(d.DepartmentID, d.Name));

    const merged: CourseWithDepartment[] = (courseRes.data ?? []).map((c) => ({
      CourseID: c.CourseID,
      Name: c.Name,
      Level: c.Level,
      TotalSemester: c.TotalSemester,
      DepartmentID: c.DepartmentID,
      DepartmentName: deptMap.get(c.DepartmentID) ?? "Unknown",
    }));

    setCourses(merged);
    setDepartments(deptRes.data ?? []);
    setIsLoading(false);
  }, []);

  /** Fetch on mount */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Derive unique levels from fetched courses */
  const uniqueLevels = useMemo(
    () => Array.from(new Set(courses.map((c) => c.Level))).sort(),
    [courses]
  );

  /** Apply search + filters */
  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return courses.filter((c) => {
      const matchesSearch =
        !query ||
        c.Name.toLowerCase().includes(query) ||
        c.CourseID.toLowerCase().includes(query);
      const matchesDept =
        selectedDepartment === "all" ||
        c.DepartmentID === selectedDepartment;
      const matchesLevel =
        selectedLevel === "all" || c.Level === selectedLevel;
      return matchesSearch && matchesDept && matchesLevel;
    });
  }, [courses, searchQuery, selectedDepartment, selectedLevel]);

  /** Pagination helpers */
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / ITEMS_PER_PAGE));
  const paginatedCourses = useMemo(
    () =>
      filteredCourses.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredCourses, currentPage]
  );

  /** Insert a new course into Supabase, then refresh the list */
  const handleCreateCourse = useCallback(
    async (data: CourseFormValues) => {
      setIsSubmitting(true);
      try {
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.from("Course").insert({
          CourseID: data.CourseID,
          Name: data.Name,
          DepartmentID: data.DepartmentID,
          Level: data.Level,
          TotalSemester: data.TotalSemester,
        });

        if (error) throw error;

        toast.success("Course created successfully.");
        setIsDialogOpen(false);
        await fetchData();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create course.";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchData]
  );

  /** Clear all active filters */
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedDepartment("all");
    setSelectedLevel("all");
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleDepartmentChange = useCallback((value: string) => {
    setSelectedDepartment(value);
    setCurrentPage(1);
  }, []);

  const handleLevelChange = useCallback((value: string) => {
    setSelectedLevel(value);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedDepartment !== "all" ||
    selectedLevel !== "all";

  /** Build visible page numbers with ellipsis */
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
  }, [totalPages, currentPage]);

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Course Directory
        </h1>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4" />
          Add New Course
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or code..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Department filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Department
          </label>
          <Select
            value={selectedDepartment}
            onValueChange={handleDepartmentChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.DepartmentID} value={d.DepartmentID}>
                  {d.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Level filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Level
          </label>
          <Select value={selectedLevel} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {uniqueLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="default"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <SlidersHorizontal className="size-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Course table */}
      <div className="rounded-lg border bg-card">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Course Name
              </TableHead>
              <TableHead className="w-[12%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Code
              </TableHead>
              <TableHead className="w-[14%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Level
              </TableHead>
              <TableHead className="w-[20%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Department
              </TableHead>
              <TableHead className="w-[12%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Semesters
              </TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedCourses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No courses found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedCourses.map((course) => (
                <TableRow
                  key={course.CourseID}
                  className="cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/admin/course/courselist/${course.CourseID}`
                    )
                  }
                >
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">
                      
                      <span className="font-medium text-foreground">
                        {course.Name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {course.CourseID}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        levelColorMap[course.Level] ??
                        "bg-gray-100 text-gray-700 border-0"
                      }
                    >
                      {course.Level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {course.DepartmentName}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    {course.TotalSemester}
                  </TableCell>
                  
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredCourses.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredCourses.length}
              </span>{" "}
              results
            </p>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {pageNumbers.map((p, idx) =>
                p === "ellipsis" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="flex size-8 items-center justify-center text-sm text-muted-foreground"
                  >
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === currentPage ? "default" : "outline"}
                    size="icon-sm"
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create course dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new course to the directory.
            </DialogDescription>
          </DialogHeader>
          <CreateNewCourseForm
            departments={departments}
            onSubmit={handleCreateCourse}
            isSubmitting={isSubmitting}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}