"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
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
import CreateNewSubjectForm, {
  type subjectFormValues,
} from "@/components/CreateNewSubjectForm";

/** Shape of a syllabus entry joined with subject + course details */
interface SubjectWithCourse {
  SyllabusID: string;
  SubjectID: string;
  Name: string;
  CourseID: string;
  CourseName: string;
  Duration: number;
  Semester: number;
  LecturerCodes: string[];
}

interface Course {
  CourseID: string;
  Name: string;
  TotalSemester: number;
}

/** Shape of a lecturer option usable when assigning lecturers to a subject */
interface LecturerForSubject {
  LecturerID: string;
  LecturerCode: string;
  Name: string;
}

const ITEMS_PER_PAGE = 7;

/**
 * SubjectPage — client-side subject repository
 * Fetches subjects + courses from Supabase and provides
 * search, code filter, course filter, and pagination.
 */
export default function SubjectPage() {
  const [subjects, setSubjects] = useState<SubjectWithCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<LecturerForSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [codeFilter, setCodeFilter] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Reusable fetch — pulls subjects + courses from Supabase */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const supabase = createBrowserSupabaseClient();

    const [syllabusRes, courseRes, lecturerTeachRes] = await Promise.all([
      supabase
        .from("Syllabus")
        .select("SyllabusID, SubjectID, CourseID, Semester, Subject(Name, Duration)")
        .order("SubjectID"),
      supabase
        .from("Course")
        .select("CourseID, Name, TotalSemester")
        .order("Name"),
      supabase
        .from("LecturerTeach")
        .select("SubjectID, Lecturer(LecturerCode)"),
    ]);

    // Fetch lecturers via the existing admin API so that Clerk names are resolved on the server.
    try {
      const lecturerResponse = await fetch("/api/admin/lecturers/list");
      if (lecturerResponse.ok) {
        const lecturerPayload = await lecturerResponse.json();
        const lecturerOptions: LecturerForSubject[] = (lecturerPayload.lecturers ?? []).map(
          (lecturer: {
            LecturerID: string;
            LecturerCode: string;
            Name: string;
          }) => ({
            LecturerID: lecturer.LecturerID,
            LecturerCode: lecturer.LecturerCode,
            Name: lecturer.Name,
          })
        );
        setLecturers(lecturerOptions);
      }
    } catch (err) {
      console.error("Failed to fetch lecturers for subject assignment:", err);
    }

    const courseMap = new Map<string, string>();
    (courseRes.data ?? []).forEach((c) => courseMap.set(c.CourseID, c.Name));

    const lecturerMap = new Map<string, string[]>();
    type LecturerTeachRow = {
      SubjectID: string | null;
      Lecturer: { LecturerCode: string | null } | null;
    };
    (lecturerTeachRes.data ?? []).forEach((row: LecturerTeachRow) => {
      const subjectId = row.SubjectID ?? undefined;
      const lecturerCode = row.Lecturer?.LecturerCode ?? undefined;
      if (!subjectId || !lecturerCode) return;

      const existing = lecturerMap.get(subjectId) ?? [];
      if (!existing.includes(lecturerCode)) {
        lecturerMap.set(subjectId, [...existing, lecturerCode]);
      }
    });

    const seen = new Set<string>();
    const merged: SubjectWithCourse[] = [];

    for (const s of syllabusRes.data ?? []) {
      const dedupeKey = `${s.SubjectID}::${s.CourseID}::${s.Semester}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const subject = s.Subject as { Name: string; Duration: number | null } | null;
      merged.push({
        SyllabusID: s.SyllabusID,
        SubjectID: s.SubjectID,
        Name: subject?.Name ?? "",
        CourseID: s.CourseID ?? "",
        Duration: subject?.Duration ?? 0,
        Semester: s.Semester ?? 0,
        CourseName: courseMap.get(s.CourseID ?? "") ?? "Unassigned",
        LecturerCodes: lecturerMap.get(s.SubjectID) ?? [],
      });
    }

    setSubjects(merged);
    setCourses(courseRes.data ?? []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Apply search + filters */
  const filteredSubjects = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const code = codeFilter.toLowerCase().trim();

    return subjects.filter((s) => {
      const matchesSearch =
        !query ||
        s.Name.toLowerCase().includes(query) ||
        s.SubjectID.toLowerCase().includes(query);
      const matchesCode =
        !code || s.SubjectID.toLowerCase().includes(code);
      const matchesCourse =
        selectedCourse === "all" || s.CourseID === selectedCourse;
      return matchesSearch && matchesCode && matchesCourse;
    });
  }, [subjects, searchQuery, codeFilter, selectedCourse]);

  /** Pagination helpers */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE)
  );

  const paginatedSubjects = useMemo(
    () =>
      filteredSubjects.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredSubjects, currentPage]
  );

  /** Insert a new subject into Subject table, then assign it via Syllabus */
  const handleCreateSubject = useCallback(
    async (data: subjectFormValues) => {
      setIsSubmitting(true);
      try {
        const supabase = createBrowserSupabaseClient();

        // Persist subject core details.
        const { error: subjectError } = await supabase
          .from("Subject")
          .upsert(
            { SubjectID: data.SubjectID, Name: data.Name, Duration: data.Duration },
            { onConflict: "SubjectID", ignoreDuplicates: true }
          );
        if (subjectError) throw subjectError;

        // Link subject to course and semester in Syllabus.
        const { error: syllabusError } = await supabase.from("Syllabus").insert({
          SubjectID: data.SubjectID,
          CourseID: data.CourseID,
          Semester: data.Semester,
        });
        if (syllabusError) throw syllabusError;

        // Assign selected lecturers to this subject in LecturerTeach (many-to-many).
        const lecturerTeachRows =
          data.LecturerIDs?.map((lecturerID) => ({
            SubjectID: data.SubjectID,
            LecturerID: lecturerID,
          })) ?? [];

        if (lecturerTeachRows.length > 0) {
          const { error: lecturerTeachError } = await supabase
            .from("LecturerTeach")
            .insert(lecturerTeachRows);
          if (lecturerTeachError) throw lecturerTeachError;
        }

        toast.success("Subject created and assigned successfully.");
        setIsDialogOpen(false);
        await fetchData();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create subject.";
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
    setCodeFilter("");
    setSelectedCourse("all");
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleCourseChange = useCallback((value: string) => {
    setSelectedCourse(value);
    setCurrentPage(1);
  }, []);

  const hasActiveFilters =
    searchQuery !== "" || codeFilter !== "" || selectedCourse !== "all";

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

  /** Format duration as readable string */
  function formatDuration(duration: number): string {
    if (Number.isInteger(duration)) return `${duration} hr${duration > 1 ? "s" : ""}`;
    return `${duration} hrs`;
  }

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Subject Repository
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and view all academic subjects available in the curriculum.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4" />
          Create New Subject
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Search by name or keyword */}
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Search Subjects
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or keyword..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>



        {/* Course filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Course
          </label>
          <Select value={selectedCourse} onValueChange={handleCourseChange}>
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

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="default"
            onClick={handleClearFilters}
            className="gap-2"
          >
            <SlidersHorizontal className="size-4" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Subject table */}
      <div className="rounded-lg border bg-card">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[17%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Code
              </TableHead>
              <TableHead className="w-[29%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Subject Name
              </TableHead>
              <TableHead className="w-[20%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Course Assigned
              </TableHead>
              <TableHead className="w-[20%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Lecturers
              </TableHead>
              <TableHead className="w-[15%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Duration
              </TableHead>
              <TableHead className="w-[12%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Semester
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
            ) : paginatedSubjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No subjects found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSubjects.map((subject) => (
                <TableRow key={subject.SyllabusID}>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">

                      <span className="font-medium text-foreground">
                        {subject.SubjectID}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className="font-medium text-foreground">
                        {subject.Name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">
                    <Badge
                      variant="secondary"
                      className="bg-sky-100 text-sky-700 border-0"
                    >
                        {subject.CourseName}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {subject.LecturerCodes.length === 0 ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        subject.LecturerCodes.map((code) => (
                          <Badge
                            key={code}
                            variant="outline"
                            className="border-slate-200 bg-slate-50 text-xs font-medium"
                          >
                            {code}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-3">
                      {formatDuration(subject.Duration)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Badge variant="outline">
                        Sem {subject.Semester}
                      </Badge>
                    </div>
                  </TableCell>

                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        {!isLoading && filteredSubjects.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  filteredSubjects.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredSubjects.length}
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

      {/* Create subject dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new subject to the repository and assign lecturers.
            </DialogDescription>
          </DialogHeader>
          <CreateNewSubjectForm
            courses={courses}
            lecturers={lecturers}
            onSubmit={handleCreateSubject}
            isSubmitting={isSubmitting}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}