"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { toast } from "sonner";

const ITEMS_PER_PAGE = 20;

/** Level badge colour map */
const levelColorMap: Record<string, string> = {
  Undergraduate:
    "bg-sky-100 text-sky-700 border-0",
  Foundation:
    "bg-amber-100 text-amber-700 border-0",
  Diploma:
    "bg-emerald-100 text-emerald-700 border-0",
};

/** Course code badge colour */
export function getCourseCodeColor(courseCode?: string | null) {

  // Ignore null / undefined / empty values
  if (!courseCode) {
    return "bg-gray-100 text-gray-500 border-0";
  }

  // Extract number from course code
  const num = parseInt(courseCode.replace(/\D/g, ""), 10);

  // If no number found, return neutral style
  if (isNaN(num)) {
    return "bg-gray-100 text-gray-500 border-0";
  }

  // Odd / Even colouring
  return num % 2 === 0
    ? "bg-indigo-100 text-indigo-700 border-0"   // even
    : "bg-purple-100 text-purple-700 border-0";  // odd
}

function formatIntake(intake: string) {
  if (!intake) return "";

  const year = intake.slice(0, 4);
  const month = intake.slice(4, 6);

  const months: Record<string, string> = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };

  return `${months[month] ?? month} ${year}`;
}

interface Student {
  StudentID: string;
  StudentCode: string;
  Name: string;
  Email: string;
  CourseID: string;
  CourseName: string;
  Level: string;
  Intake: string;
}

interface Course {
  CourseID: string;
  Name: string;
}

export default function StudentManagementPage() {

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseCode, setSelectedCourseCode] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedIntake, setSelectedIntake] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [intakes, setIntakes] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    try {

      setIsLoading(true);

      const res = await fetch("/api/admin/students/list");

      if (!res.ok) throw new Error("Failed to fetch students");

      const data = await res.json();

      setStudents(data.students || []);
      setCourses(data.courses || []);
      setIntakes(data.intakes || []);
      setLevels(data.levels || []);

    } catch (err) {
      toast.error("Failed to load students");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter + Search

  const filteredStudents = useMemo(() => {

    const query = searchQuery.toLowerCase().trim();

    return students
      .filter((s) => {

        const matchesSearch =
          !query ||
          s.StudentCode.toLowerCase().includes(query) ||
          s.Name.toLowerCase().includes(query) ||
          s.Email.toLowerCase().includes(query);

        const matchesCourseCode =
          selectedCourseCode === "all" || s.CourseID === selectedCourseCode;

        const matchesCourse =
          selectedCourse === "all" || s.CourseID === selectedCourse;

        const matchesIntake =
          selectedIntake === "all" || s.Intake === selectedIntake;

        const matchesLevel =
          selectedLevel === "all" || s.Level === selectedLevel;

        return matchesSearch && matchesCourseCode && matchesCourse && matchesIntake && matchesLevel;

      })
      .sort((a, b) => a.StudentCode.localeCompare(b.StudentCode));

  }, [students, searchQuery, selectedCourseCode, selectedCourse, selectedIntake, selectedLevel]);

  // Pagination

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  );

  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredStudents, currentPage]);


  // Page Numbers

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
    selectedCourseCode !== "all" ||
    selectedCourse !== "all" ||
    selectedIntake !== "all" ||
    selectedLevel !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCourseCode("all");
    setSelectedCourse("all");
    setSelectedIntake("all");
    setSelectedLevel("all");
    setCurrentPage(1);
  };

  return (
    <div className="mx-auto w-full space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold">Student Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage and view all enrolled students
          </p>
        </div>

        <Link href="/admin/student/add">
          <Button className="gap-2">
            <Plus className="size-4" />
            Add Student
          </Button>
        </Link>

      </div>

      {/* Search + Filters */}

      <div className="flex flex-wrap items-end gap-4">

        {/* Search */}

        <div className="flex-1 min-w-[220px] space-y-1.5">

          <label className="text-xs font-medium text-muted-foreground">
            Search
          </label>

          <div className="relative">

            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />

          </div>

        </div>

        {/* Course Code Filter */}

        <div className="space-y-1.5">

          <label className="text-xs font-medium text-muted-foreground">
            Course Code
          </label>

          <Select
            value={selectedCourseCode}
            onValueChange={(v) => {
              setSelectedCourseCode(v);
              setCurrentPage(1);
            }}
          >

            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Codes" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">All Codes</SelectItem>

              {courses.map((c) => (
                <SelectItem key={c.CourseID} value={c.CourseID}>
                  {c.CourseID}
                </SelectItem>
              ))}

            </SelectContent>

          </Select>

        </div>

        {/* Course Filter */}

        <div className="space-y-1.5">

          <label className="text-xs font-medium text-muted-foreground">
            Course
          </label>

          <Select
            value={selectedCourse}
            onValueChange={(v) => {
              setSelectedCourse(v);
              setCurrentPage(1);
            }}
          >

            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">All Courses</SelectItem>

              {courses.map((c) => (
                <SelectItem key={c.CourseID} value={c.CourseID}>
                  {c.Name}
                </SelectItem>
              ))}

            </SelectContent>

          </Select>

        </div>

        {/* Intake Filter */}

        <div className="space-y-1.5">

          <label className="text-xs font-medium text-muted-foreground">
            Intake
          </label>

          <Select
            value={selectedIntake}
            onValueChange={(v) => {
              setSelectedIntake(v);
              setCurrentPage(1);
            }}
          >

            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Intakes" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">All Intakes</SelectItem>

              {intakes.map((i) => (
                <SelectItem key={i} value={i}>
                  {formatIntake(i)}
                </SelectItem>
              ))}

            </SelectContent>

          </Select>

        </div>

        {/* Level Filters */}

        <div className="space-y-1.5">

          <label className="text-xs font-medium text-muted-foreground">
            Level
          </label>

          <Select
            value={selectedLevel}
            onValueChange={(v) => {
              setSelectedLevel(v);
              setCurrentPage(1);
            }}
          >

            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>

            <SelectContent>

              <SelectItem value="all">All Levels</SelectItem>

              {levels.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}

            </SelectContent>

          </Select>

        </div>

        {/* Clear Filters */}

        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="gap-2"
          >
            <SlidersHorizontal className="size-4" />
            Clear
          </Button>
        )}

      </div>

      {/* Student Table */}

      <div className="rounded-lg border bg-card">

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Code</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Code</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course Name</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Level</TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Intake</TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

            {isLoading ? (

              Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <div className="h-4 w-32 animate-pulse bg-muted rounded" />
                  </TableCell>
                </TableRow>
              ))

            ) : paginatedStudents.length === 0 ? (

              <TableRow>

                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-muted-foreground"
                >
                  No students found.
                </TableCell>

              </TableRow>

            ) : (

              paginatedStudents.map((s) => (

                <TableRow key={s.StudentID} className="hover:bg-muted/50 transition-colors">

                  <TableCell className="text-center font-medium">
                    {s.StudentCode}
                  </TableCell>

                  <TableCell className="text-center">
                    {s.Name}
                  </TableCell>

                  <TableCell className="text-center">
                    {s.Email}
                  </TableCell>

                  <TableCell className="text-center">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-medium ${getCourseCodeColor(s.CourseID)}`}
                    >
                      {s.CourseID}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    {s.CourseName}
                  </TableCell>

                  <TableCell className="text-center">
                    <Badge
                      variant="secondary"
                      className={
                        levelColorMap[s.Level] ??
                        "bg-gray-100 text-gray-700 border-0"
                      }
                    >
                      {s. Level}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-center">
                    {formatIntake(s.Intake)}
                  </TableCell>

                </TableRow>
              ))

            )}

          </TableBody>

        </Table>

        {/* Pagination */}

        {!isLoading && filteredStudents.length > 0 && (

          <div className="flex items-center justify-between border-t px-4 py-3">

            <p className="text-sm text-muted-foreground">

              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {filteredStudents.length}
              </span>

            </p>

            <div className="flex gap-1">

              <Button
                variant="outline"
                size="icon-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>

              {pageNumbers.map((p, i) =>
                p === "ellipsis" ? (
                  <span key={i} className="px-2 text-muted-foreground">...</span>
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