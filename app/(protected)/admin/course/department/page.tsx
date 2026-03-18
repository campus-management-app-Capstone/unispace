
import Link from "next/link";
import { Pencil, Trash2, ArrowRight } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * fetch departments from Supabase
 * and displays total course count for the department
 */
export default async function DepartmentPage() {
  const supabase = createServerSupabaseClient();

  /* fetch all departments */
  const { data: departments, error: deptError } = await supabase
    .from("Department")
    .select("DepartmentID, Name")
    .order("Name");

  /* fetch course counts per department in a separate query */
  const { data: courses } = await supabase
    .from("Course")
    .select("DepartmentID");

  if (deptError) {
    console.error("Department fetch error:", deptError);
    return (
      <div className="flex h-48 items-center justify-center text-sm text-destructive">
        Failed to load departments: {deptError.message}
      </div>
    );
  }

  /* map department ID to course count */
  const courseCountMap = new Map<string, number>();
  courses?.forEach((c) => {
    if (c.DepartmentID) {
      courseCountMap.set(c.DepartmentID, (courseCountMap.get(c.DepartmentID) ?? 0) + 1);
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Department Directory
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage university faculties, their departments, and associated academic programs.
        </p>
      </div>

      {/* department listing table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Department Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Courses
              </TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {!departments || departments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  No departments found.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => {
                const courseCount = courseCountMap.get(dept.DepartmentID) ?? 0;

                return (
                  <TableRow key={dept.DepartmentID}>
                    <TableCell>
                      <p className="font-medium text-foreground">{dept.Name}</p>
                    </TableCell>

                    <TableCell>
                      <Link href={`/admin/course/department/${dept.DepartmentID}`}>
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 cursor-pointer"
                        >
                          {courseCount} Active
                          <ArrowRight className="size-3" />
                        </Badge>
                      </Link>
                    </TableCell>

                    
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
