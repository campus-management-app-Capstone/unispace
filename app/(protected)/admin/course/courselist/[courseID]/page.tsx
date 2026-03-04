"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  FileDown,
  Pencil,
  GraduationCap,
  Clock,
  BarChart3,
  Building2,
  Users,
  CalendarDays,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

/** Course detail fetched from Supabase (Course + Department join) */
interface CourseDetail {
  CourseID: string;
  Name: string;
  Level: string;
  TotalSemester: number;
  DepartmentName: string;
}

/** A single subject entry within a semester */
interface SemesterSubject {
  SubjectID: string;
  Name: string;
  Duration: number;
}

/** A semester group containing its subjects and aggregated credits */
interface SemesterGroup {
  semester: number;
  subjects: SemesterSubject[];
  totalCredits: number;
}

/** An intake group with its student count */
interface IntakeGroup {
  intake: string;
  studentCount: number;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * SemesterSection — Collapsible block showing one semester and its subjects
 * ───────────────────────────────────────────────────────────────────────────── */
function SemesterSection({
  group,
  isOpen,
  onToggle,
}: {
  group: SemesterGroup;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button className="flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/50">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              {group.semester}
            </span>
            <span className="font-semibold text-foreground">
              Semester {group.semester}
            </span>
            <Badge variant="secondary" className="text-xs">
              {group.totalCredits} hrs
            </Badge>
          </div>
          <ChevronDown
            className={`size-5 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-1 rounded-b-lg border border-t-0 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[45%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Subject Name
                </TableHead>
                <TableHead className="w-[25%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Code
                </TableHead>
                <TableHead className="w-[30%] text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Duration (hrs)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.subjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-16 text-center text-sm text-muted-foreground"
                  >
                    No subjects assigned to this semester.
                  </TableCell>
                </TableRow>
              ) : (
                group.subjects.map((subject) => (
                  <TableRow key={subject.SubjectID}>
                    <TableCell className="font-medium text-foreground">
                      {subject.Name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subject.SubjectID}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {subject.Duration}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * CourseDetailPage — displays full course info with collapsible semesters
 * ───────────────────────────────────────────────────────────────────────────── */
export default function CourseDetailPage() {
  const { courseID } = useParams<{ courseID: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [semesters, setSemesters] = useState<SemesterGroup[]>([]);
  const [openSemesters, setOpenSemesters] = useState<Set<number>>(new Set());
  const [totalEnrolled, setTotalEnrolledCount] = useState(0);
  const [intakes, setIntakes] = useState<IntakeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch course + department + syllabus data on mount / courseID change */
  useEffect(() => {
    if (!courseID) return;

    let isCancelled = false;

    async function fetchCourseData() {
      setIsLoading(true);
      const supabase = createBrowserSupabaseClient();

      const { data: courseData, error: courseError } = await supabase
        .from("Course")
        .select("CourseID, Name, Level, TotalSemester, Department(Name)")
        .eq("CourseID", courseID)
        .single();

      if (isCancelled) return;

      if (courseError || !courseData) {
        toast.error("Failed to load course details.");
        setIsLoading(false);
        return;
      }

      const dept = courseData.Department as { Name: string } | null;
      setCourse({
        CourseID: courseData.CourseID,
        Name: courseData.Name,
        Level: courseData.Level,
        TotalSemester: courseData.TotalSemester,
        DepartmentName: dept?.Name ?? "Unknown",
      });

      const { data: syllabusData, error: syllabusError } = await supabase
        .from("Syllabus")
        .select("SubjectID, Semester, Subject(SubjectID, Name, Duration)")
        .eq("CourseID", courseID)
        .order("Semester");

      if (isCancelled) return;

      if (syllabusError) {
        toast.error("Failed to load curriculum data.");
        setIsLoading(false);
        return;
      }

      const semesterMap = new Map<number, SemesterSubject[]>();
      for (let i = 1; i <= courseData.TotalSemester; i++) {
        semesterMap.set(i, []);
      }

      for (const entry of syllabusData ?? []) {
        const sem = entry.Semester ?? 0;
        const subject = entry.Subject as {
          SubjectID: string;
          Name: string;
          Duration: number | null;
        } | null;
        if (!subject || sem === 0) continue;

        const existing = semesterMap.get(sem) ?? [];
        if (!existing.some((s) => s.SubjectID === subject.SubjectID)) {
          existing.push({
            SubjectID: subject.SubjectID,
            Name: subject.Name,
            Duration: subject.Duration ?? 0,
          });
        }
        semesterMap.set(sem, existing);
      }

      const groups: SemesterGroup[] = Array.from(semesterMap.entries())
        .sort(([a], [b]) => a - b)
        .map(([semester, subjects]) => ({
          semester,
          subjects,
          totalCredits: subjects.reduce((sum, s) => sum + s.Duration, 0),
        }));

      setSemesters(groups);
      setOpenSemesters(new Set([1]));

      // Fetch enrollment data for student count & intake breakdown
      const { data: enrollmentData } = await supabase
        .from("Enrollment")
        .select("StudentID, Intake")
        .eq("CourseID", courseID);

      if (isCancelled) return;

      const enrollments = enrollmentData ?? [];
      const uniqueStudents = new Set(enrollments.map((e) => e.StudentID));
      setTotalEnrolledCount(uniqueStudents.size);

      // Group by intake and count distinct students per intake
      const intakeMap = new Map<string, Set<string>>();
      for (const e of enrollments) {
        const existing = intakeMap.get(e.Intake) ?? new Set<string>();
        existing.add(e.StudentID);
        intakeMap.set(e.Intake, existing);
      }

      const intakeGroups: IntakeGroup[] = Array.from(intakeMap.entries())
        .map(([intake, students]) => ({
          intake,
          studentCount: students.size,
        }))
        .sort((a, b) => b.intake.localeCompare(a.intake));

      setIntakes(intakeGroups);
      setIsLoading(false);
    }

    fetchCourseData();

    return () => {
      isCancelled = true;
    };
  }, [courseID]);

  const toggleSemester = useCallback((semester: number) => {
    setOpenSemesters((prev) => {
      const next = new Set(prev);
      if (next.has(semester)) next.delete(semester);
      else next.add(semester);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setOpenSemesters(new Set(semesters.map((g) => g.semester)));
  }, [semesters]);

  const collapseAll = useCallback(() => {
    setOpenSemesters(new Set());
  }, []);

  const totalCredits = semesters.reduce((sum, g) => sum + g.totalCredits, 0);
  const totalSubjects = semesters.reduce(
    (sum, g) => sum + g.subjects.length,
    0
  );

  if (isLoading) {
    return (
      <div className="mx-auto w-full space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">Course not found.</p>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/course/courselist")}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Course List
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/admin/course/courselist")}
              aria-label="Back to course list"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {course.Name}
            </h1>
          </div>
          <p className="ml-11 text-sm text-muted-foreground">
            Code: {course.CourseID} &bull; {course.Level}
          </p>
        </div>

        <div className="ml-11 flex gap-2 sm:ml-0">
          <Button variant="outline" className="gap-2">
            <FileDown className="size-4" />
            Export PDF
          </Button>
          <Button className="gap-2">
            <Pencil className="size-4" />
            Edit Course
          </Button>
        </div>
      </div>

      {/* ── Info bar ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-100">
              <Building2 className="size-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Faculty
              </p>
              <p className="text-sm font-semibold">{course.DepartmentName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-violet-100">
              <Clock className="size-5 text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Duration
              </p>
              <p className="text-sm font-semibold">
                {course.TotalSemester} Semesters
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100">
              <BarChart3 className="size-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Total Hours
              </p>
              <p className="text-sm font-semibold">{totalCredits} hrs</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-100">
              <GraduationCap className="size-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Level
              </p>
              <p className="text-sm font-semibold">{course.Level}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Main content: Curriculum + Sidebar ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — Curriculum Structure */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Curriculum Structure
            </h2>
            <div className="flex gap-2">
              <Button variant="link" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <span className="text-muted-foreground">|</span>
              <Button variant="link" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {semesters.map((group) => (
              <SemesterSection
                key={group.semester}
                group={group}
                isOpen={openSemesters.has(group.semester)}
                onToggle={() => toggleSemester(group.semester)}
              />
            ))}
          </div>
        </div>

        {/* Right — Sidebar summary cards */}
        <div className="space-y-4">
          {/* Course Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Course Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Enrolled
                </span>
                <span className="text-2xl font-bold text-foreground">
                  {totalEnrolled.toLocaleString()}
                </span>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Subjects</p>
                  <p className="text-lg font-semibold">{totalSubjects}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Hours</p>
                  <p className="text-lg font-semibold">{totalCredits}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Semesters</p>
                  <p className="text-lg font-semibold">
                    {course.TotalSemester}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Intakes</p>
                  <p className="text-lg font-semibold">{intakes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Intakes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Active Intakes</CardTitle>
            </CardHeader>
            <CardContent>
              {intakes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No intakes found for this course.
                </p>
              ) : (
                <div className="space-y-3">
                  {intakes.map((group) => (
                    <div
                      key={group.intake}
                      className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
                          <CalendarDays className="size-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {group.intake}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {group.studentCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  );
}
