"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  Users,
  Search,
  Minus,
  Plus,
  UserCircle2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import type { Tables } from "@/types/supabase";

/** Subject option derived from Supabase `Subject` table for module search suggestions */
interface SubjectOption {
  id: string;
  code: string;
  name: string;
}

/** Shape of the lecturer teaser used for the staffing card */
interface LecturerPreview {
  id: string;
  name: string;
  title: string;
  department: string;
  currentLoadHours: number;
  maxLoadHours: number;
}

/** Class registration form for creating class sections for subjects */
function ClassRegistrationPage() {
  const [moduleQuery, setModuleQuery] = useState("");
  const [academicYear, setAcademicYear] = useState("2023/2024 - Semester 1");
  const [intake, setIntake] = useState("");
  const [classId, setClassId] = useState("");
  const [classType, setClassType] = useState<"lecture" | "tutorial" | "lab">(
    "lecture",
  );
  const [enrollmentLimit, setEnrollmentLimit] = useState<number>(30);
  const [lecturerQuery, setLecturerQuery] = useState("");
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerPreview | null>(
    null,
  );
  const [isActive, setIsActive] = useState(true);
  const [availableIntakes, setAvailableIntakes] = useState<string[]>([]);
  const [lecturers, setLecturers] = useState<LecturerPreview[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(true);

  /** Load intakes, lecturers, classes, and subjects from Supabase for form options */
  const loadReferenceData = useCallback(async () => {
    try {
      setIsLoadingReferenceData(true);
      const supabase = createBrowserSupabaseClient();

      const [enrollmentRes, lecturerRes, classRes, subjectRes] =
        await Promise.all([
          supabase
            .from("Enrollment")
            .select("Intake")
            .order("Intake", { ascending: false }),
          supabase
            .from("Lecturer")
            .select("LecturerID, LecturerCode, Department(Name)")
            .order("LecturerCode"),
          supabase.from("Class").select("ClassID, LecturerID"),
          supabase.from("Subject").select("SubjectID, Name").order("SubjectID"),
        ]);

      if (
        enrollmentRes.error ||
        lecturerRes.error ||
        classRes.error ||
        subjectRes.error
      ) {
        toast.error("Failed to load reference data for class registration.");
        setIsLoadingReferenceData(false);
        return;
      }

      const enrollmentRows = (enrollmentRes.data ?? []) as Tables<"Enrollment">[];
      const lecturerRows = (lecturerRes.data ?? []) as (Tables<"Lecturer"> & {
        Department?: { Name?: string | null } | null;
      })[];
      const classRows = (classRes.data ?? []) as Tables<"Class">[];
      const subjectRows = (subjectRes.data ?? []) as Tables<"Subject">[];

      const uniqueIntakes = Array.from(
        new Set(enrollmentRows.map((row) => row.Intake)),
      )
        .filter((value): value is string => Boolean(value))
        .sort()
        .reverse();

      setAvailableIntakes(uniqueIntakes);
      if (!intake && uniqueIntakes.length > 0) {
        setIntake(uniqueIntakes[0]);
      }

      const lecturerClassCount = new Map<string, number>();
      for (const classRow of classRows) {
        const key = classRow.LecturerID;
        if (!key) continue;
        lecturerClassCount.set(key, (lecturerClassCount.get(key) ?? 0) + 1);
      }

      const lecturerPreviews: LecturerPreview[] = lecturerRows.map((row) => {
        const departmentName = row.Department?.Name ?? "Unknown Department";
        const baseName = row.LecturerCode
          ? `Lecturer ${row.LecturerCode}`
          : row.LecturerID;
        const classCount = lecturerClassCount.get(row.LecturerID) ?? 0;
        const perClassHours = 2;
        const currentLoadHours = classCount * perClassHours;
        const maxLoadHours = 15;

        return {
          id: row.LecturerID,
          name: baseName,
          title: `Lecturer · ${departmentName}`,
          department: departmentName,
          currentLoadHours,
          maxLoadHours,
        };
      });

      setLecturers(lecturerPreviews);
      if (!selectedLecturer && lecturerPreviews.length > 0) {
        setSelectedLecturer(lecturerPreviews[0]);
      }

      const subjectOptions: SubjectOption[] = subjectRows.map((row) => ({
        id: row.SubjectID,
        code: row.SubjectID,
        name: row.Name,
      }));
      setSubjects(subjectOptions);
      setIsLoadingReferenceData(false);
    } catch {
      toast.error("Unexpected error while loading class reference data.");
      setIsLoadingReferenceData(false);
    }
  }, [intake, selectedLecturer]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadReferenceData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadReferenceData]);

  /** Handle primary form submission; backend integration should be wired via API route */
  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    const payload = {
      moduleQuery,
      academicYear,
      intake,
      classId,
      classType,
      enrollmentLimit,
      lecturerId: selectedLecturer?.id ?? null,
      isLoadingReferenceData,
      isActive,
    };

    // TODO: Replace console.log with API call to persist the new class in backend.
    // Complex validation and allocation rules should live in the backend service.
    console.log("Create class payload", payload);
  }

  /** Update selected lecturer based on simple name search */
  function handleLecturerSearchChange(value: string): void {
    setLecturerQuery(value);
    if (!value.trim()) {
      setSelectedLecturer(lecturers[0] ?? null);
      return;
    }

    const match = lecturers.find((lecturer) =>
      lecturer.name.toLowerCase().includes(value.toLowerCase()),
    );

    setSelectedLecturer(match ?? lecturers[0] ?? null);
  }

  const enrollmentLimitDisplay = Number.isNaN(enrollmentLimit)
    ? 0
    : Math.max(0, enrollmentLimit);

  const lecturerLoadPercentage =
    selectedLecturer && selectedLecturer.maxLoadHours > 0
      ? Math.min(
          100,
          Math.round(
            (selectedLecturer.currentLoadHours / selectedLecturer.maxLoadHours) *
              100,
          ),
        )
      : 0;

  return (
    <form
      className="mx-auto flex w-full max-w-5xl flex-col gap-6"
      onSubmit={handleSubmit}
    >
      {/* Page heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Create Class Section
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure class details, logistics, and staffing for this subject.
        </p>
      </div>

      {/* Course details */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
            <BookOpen className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Course Details
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Identify the module, academic year, and intake for this class.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="module">Module</Label>
            <Select
              value={moduleQuery}
              onValueChange={(value) => setModuleQuery(value)}
            >
              <SelectTrigger id="module">
                <SelectValue placeholder="Select module" />
              </SelectTrigger>
              <SelectContent>
                {subjects.length === 0 ? (
                  <SelectItem value="__no-modules" disabled>
                    {isLoadingReferenceData
                      ? "Loading modules..."
                      : "No modules found"}
                  </SelectItem>
                ) : (
                  subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <span className="font-medium">{subject.code}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {subject.name}
                      </span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="academic-year">Academic Year</Label>
            <Select
              value={academicYear}
              onValueChange={(value) => setAcademicYear(value)}
            >
              <SelectTrigger id="academic-year">
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023/2024 - Semester 1">
                  2023/2024 - Semester 1
                </SelectItem>
                <SelectItem value="2023/2024 - Semester 2">
                  2023/2024 - Semester 2
                </SelectItem>
                <SelectItem value="2024/2025 - Semester 1">
                  2024/2025 - Semester 1
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="intake">Intake</Label>
            <Select value={intake} onValueChange={(value) => setIntake(value)}>
              <SelectTrigger id="intake">
                <SelectValue placeholder="Select intake" />
              </SelectTrigger>
              <SelectContent>
                {availableIntakes.length === 0 ? (
                  <SelectItem value="__no-intakes" disabled>
                    {isLoadingReferenceData ? "Loading intakes..." : "No intakes found"}
                  </SelectItem>
                ) : (
                  availableIntakes.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="class-id">Class ID</Label>
            <Input
              id="class-id"
              placeholder="e.g. CS101-01"
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logistics */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
            <CalendarDays className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Logistics</CardTitle>
            <p className="text-xs text-muted-foreground">
              Define class type and enrollment capacity.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Class Type</Label>
            <div className="inline-flex rounded-full border bg-muted/40 p-1">
              {(["lecture", "tutorial", "lab"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setClassType(type)}
                  className={`min-w-[90px] rounded-full px-4 py-1.5 text-sm capitalize transition-colors ${
                    classType === type
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-background/60"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Enrollment Limit</Label>
            <div className="inline-flex items-center gap-3 rounded-lg border bg-background px-3 py-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 rounded-full"
                onClick={() =>
                  setEnrollmentLimit((current) => Math.max(0, current - 1))
                }
                aria-label="Decrease enrollment limit"
              >
                <Minus className="size-4" />
              </Button>
              <Input
                type="number"
                min={0}
                value={enrollmentLimitDisplay}
                onChange={(event) =>
                  setEnrollmentLimit(Number(event.target.value) || 0)
                }
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-8 rounded-full"
                onClick={() =>
                  setEnrollmentLimit((current) => current + 1)
                }
                aria-label="Increase enrollment limit"
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Standard room capacity: 45
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Staffing assignment */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 space-y-0">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
            <Users className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Staffing Assignment
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Assign a lecturer and review current teaching load.
            </p>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="lecturer-search">Assign Lecturer</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="lecturer-search"
                placeholder="Search faculty..."
                value={lecturerQuery}
                onChange={(event) =>
                  handleLecturerSearchChange(event.target.value)
                }
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
                Lecturers are fetched from Supabase. Extend this lookup to your
                lecturer directory API for richer profiles if needed.
            </p>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Selected Lecturer Status
            </p>
            {selectedLecturer ? (
              <div className="space-y-3 rounded-lg bg-background p-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <UserCircle2 className="size-6 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      {selectedLecturer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedLecturer.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedLecturer.department}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Teaching Load</span>
                    <span>
                      {selectedLecturer.currentLoadHours} /{" "}
                      {selectedLecturer.maxLoadHours} hrs ({lecturerLoadPercentage}
                      %)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${lecturerLoadPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No lecturer selected. Start typing to search for a lecturer.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer actions */}
      <div className="flex flex-col-reverse items-start justify-between gap-4 border-t pt-4 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Switch
            id="active-status"
            checked={isActive}
            onCheckedChange={(value) => setIsActive(value)}
          />
          <Label htmlFor="active-status" className="text-sm font-medium">
            Active Status
          </Label>
        </div>

        <div className="flex w-full justify-end gap-3 md:w-auto">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">Save Class Section</Button>
        </div>
      </div>
    </form>
  );
}

export default ClassRegistrationPage;