import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

/**
 * DepartmentIdPage
 * page-level server component that displays a single department
 * and all courses that belong to that department
 */
export default async function DepartmentIdPage({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const supabase = createServerSupabaseClient();

  /** unwrap route params from the async Params object */
  const { departmentId } = await params;

  /** fetch the selected department by its DepartmentID */
  const { data: department, error: departmentError } = await supabase
    .from("Department")
    .select("DepartmentID, Name")
    .eq("DepartmentID", departmentId)
    .single();

  /** fetch all courses that are assigned to this department */
  const { data: courses, error: coursesError } = await supabase
    .from("Course")
    .select("CourseID, Name, Level, TotalSemester")
    .eq("DepartmentID", departmentId)
    .order("Name");

  if (departmentError) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Link href="/admin/course/department">
          <Button variant="ghost" size="icon" aria-label="Back to departments">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <p className="text-sm text-destructive">
          Failed to load department: {departmentError.message}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* header with back navigation and department title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/course/department">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Back to department list"
            >
              <ArrowLeft className="size-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {department?.Name ?? "Department"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Department ID: {department?.DepartmentID}
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <GraduationCap className="size-4" />
          {courses?.length ?? 0} Course
          {courses && courses.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {/* list of courses for this department */}
      <div className="rounded-lg border bg-card">
        {/* Mobile list (fits within screen, no horizontal scroll) */}
        <div className="divide-y sm:hidden">
          {!coursesError && courses && courses.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No courses found for this department.
            </div>
          )}

          {coursesError && (
            <div className="px-4 py-8 text-center text-sm text-destructive">
              Failed to load courses: {coursesError.message}
            </div>
          )}

          {!coursesError &&
            courses &&
            courses.map((course) => (
              <div key={course.CourseID} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/course/courselist/${course.CourseID}`}
                      className="block truncate font-medium text-foreground hover:underline"
                    >
                      {course.Name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {course.CourseID}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {course.Level}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total semesters</span>
                  <span className="font-medium text-foreground">
                    {course.TotalSemester}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Desktop table */}
        <div className="hidden w-full overflow-x-auto sm:block">
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[45%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Course Name
                </TableHead>
                <TableHead className="w-[20%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Code
                </TableHead>
                <TableHead className="w-[20%] text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Level
                </TableHead>
                <TableHead className="w-[15%] text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Semesters
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!coursesError && courses && courses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-20 text-center text-sm text-muted-foreground"
                  >
                    No courses found for this department.
                  </TableCell>
                </TableRow>
              )}

              {coursesError && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-20 text-center text-sm text-destructive"
                  >
                    Failed to load courses: {coursesError.message}
                  </TableCell>
                </TableRow>
              )}

              {!coursesError &&
                courses &&
                courses.map((course) => (
                  <TableRow key={course.CourseID}>
                    <TableCell className="font-medium text-foreground">
                      <Link
                        href={`/admin/course/courselist/${course.CourseID}`}
                        className="hover:underline"
                      >
                        {course.Name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.CourseID}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.Level}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {course.TotalSemester}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}