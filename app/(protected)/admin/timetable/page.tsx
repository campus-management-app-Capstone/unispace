import React from 'react';
import Link from 'next/link';
import { createClerkSupabaseClient } from '@/lib/supabase';
import { ScheduleTimetableButton } from '@/components/admin/timetable/ScheduleTimetableButton';

/**
 * Shape of a scheduled timetable slot with related class and intake details.
 */
interface ScheduledTimetableSlot {
  id: string;
  day: string | null;
  start: string | null;
  end: string | null;
  facilityName: string | null;
  classId: string | null;
  classGroup: string | null;
  classType: string | null;
  subjectName: string | null;
  intakes: string[];
  departments: string[];
  semesters: number[];
}

/**
 * Shape of a timetable overview group (Course + Semester + Intake).
 */
interface TimetableGroup {
  id: string;
  courseId: string;
  courseName: string | null;
  intake: string;
  semester: number;
  departmentNames: string[];
  slotCount: number;
}

/**
 * Shape of an unscheduled class without any timetable slot.
 */
interface UnscheduledClass {
  classId: string;
  group: string;
  type: string | null;
  subjectName: string | null;
  lecturerCode: string | null;
}

/**
 * Search parameters supported by the admin timetable page.
 */
interface TimetableSearchParams {
  q?: string;
  semester?: string;
  department?: string;
}

/**
 * Transform raw Supabase rows into scheduled timetable slots with derived fields.
 */
function mapScheduledSlots(rows: unknown[]): ScheduledTimetableSlot[] {
  return (rows || []).map((row) => {
    const typedRow = row as {
      TimetableSlotID: string;
      Day: string | null;
      Start: string | null;
      End: string | null;
      Facility?: { Name?: string | null } | null;
      Class?: {
        ClassID?: string | null;
        Group?: string | null;
        Type?: string | null;
        Subject?: {
          Name?: string | null;
          Syllabus?: { Semester?: number | null }[];
        } | null;
        ClassRegistration?: {
          Enrollment?: {
            Intake?: string | null;
            Course?: {
              Department?: { Name?: string | null } | null;
            } | null;
          } | null;
        }[];
      } | null;
    };

    const timetableClass = typedRow.Class || null;
    const subject = timetableClass?.Subject || null;
    const syllabusArray = subject?.Syllabus || [];
    const classRegistrations = timetableClass?.ClassRegistration || [];

    const intakes = Array.from(
      new Set(
        classRegistrations
          .map((registration) => registration.Enrollment?.Intake ?? null)
          .filter((value): value is string => Boolean(value))
      )
    );

    const departments = Array.from(
      new Set(
        classRegistrations
          .map((registration) => registration.Enrollment?.Course?.Department?.Name ?? null)
          .filter((value): value is string => Boolean(value))
      )
    );

    const semesters = Array.from(
      new Set(
        (syllabusArray as { Semester?: number | null }[])
          .map((syllabus) => syllabus.Semester ?? null)
          .filter((value): value is number => typeof value === 'number')
      )
    ).sort((a, b) => a - b);

    return {
      id: typedRow.TimetableSlotID,
      day: typedRow.Day,
      start: typedRow.Start,
      end: typedRow.End,
      facilityName: typedRow.Facility?.Name ?? null,
      classId: timetableClass?.ClassID ?? null,
      classGroup: timetableClass?.Group ?? null,
      classType: timetableClass?.Type ?? null,
      subjectName: subject?.Name ?? null,
      intakes,
      departments,
      semesters,
    };
  });
}

/**
 * Transform raw Supabase rows into unscheduled classes without timetable slots.
 * (Currently not used on this page, but kept for future admin views.)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function mapUnscheduledClasses(rows: unknown[]): UnscheduledClass[] {
  return (rows || []).map((row) => {
    const typedRow = row as {
      ClassID: string;
      Group: string;
      Type: string | null;
      Subject?: { Name?: string | null } | null;
      Lecturer?: { LecturerCode?: string | null } | null;
    };

    return {
      classId: typedRow.ClassID,
      group: typedRow.Group,
      type: typedRow.Type ?? null,
      subjectName: typedRow.Subject?.Name ?? null,
      lecturerCode: typedRow.Lecturer?.LecturerCode ?? null,
    };
  });
}

/**
 * Filter scheduled timetable slots by intake, semester, and department.
 */
function filterScheduledSlots(
  slots: ScheduledTimetableSlot[],
  intakeQuery: string,
  semesterFilter: number | null,
  departmentFilter: string
) {
  const query = intakeQuery.trim().toLowerCase();
  const department = departmentFilter.trim().toLowerCase();

  return slots.filter((slot) => {
    if (semesterFilter !== null && slot.semesters.length > 0) {
      if (!slot.semesters.includes(semesterFilter)) {
        return false;
      }
    }

    if (department) {
      const hasDepartment = slot.departments.some((name) =>
        name.toLowerCase().includes(department)
      );
      if (!hasDepartment) {
        return false;
      }
    }

    if (!query) {
      return true;
    }

    return slot.intakes.some((intake) =>
      intake.toLowerCase().includes(query)
    );
  });
}

/**
 * Return unscheduled classes (currently independent from intake filters).
 * (Currently not used on this page, but kept for future admin views.)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getUnscheduledClasses(classes: UnscheduledClass[]) {
  return classes;
}

/**
 * Build timetable groups from raw Supabase rows.
 * This groups scheduled slots into timetables by Course + Semester + Intake.
 */
function buildTimetableGroups(
  rows: unknown[],
  intakeQuery: string,
  semesterFilter: number | null,
  departmentFilter: string
) {
  const query = intakeQuery.trim().toLowerCase();
  const departmentQuery = departmentFilter.trim().toLowerCase();

  const groups = new Map<string, TimetableGroup>();

  (rows || []).forEach((row) => {
    const typedRow = row as {
      TimetableSlotID: string;
      Class?: {
        Subject?: {
          Syllabus?: { Semester?: number | null; CourseID?: string | null }[] | null;
        } | null;
        ClassRegistration?: {
          Enrollment?: {
            Intake?: string | null;
            Course?: {
              CourseID?: string | null;
              Name?: string | null;
              Department?: { Name?: string | null } | null;
            } | null;
          } | null;
        }[] | null;
      } | null;
    };

    const syllabusItems = typedRow.Class?.Subject?.Syllabus ?? [];
    const semesters = Array.from(
      new Set(
        (syllabusItems as { Semester?: number | null }[])
          .map((item) => item.Semester ?? null)
          .filter((value): value is number => typeof value === 'number')
      )
    );

    const syllabusCourseId =
      (syllabusItems as { CourseID?: string | null }[])
        .map((item) => item.CourseID ?? null)
        .find((value): value is string => Boolean(value)) ?? null;

    const registrations = typedRow.Class?.ClassRegistration ?? [];
    const hasRegistrations = registrations.length > 0;

    const effectiveSemesters =
      semesters.length > 0
        ? semesters
        : // if no semester from syllabus, we cannot reasonably group
          [];

    if (!hasRegistrations) {
      // No enrollment data yet: fall back to syllabus course + "All" intake,
      // so that admin can still see timetables grouped by course and semester.
      if (!syllabusCourseId || effectiveSemesters.length === 0) {
        return;
      }

      const fallbackIntake = 'All';
      if (query && !fallbackIntake.toLowerCase().includes(query)) {
        // intake search does not match the synthetic "All" intake
        return;
      }

      effectiveSemesters.forEach((semester) => {
        if (semesterFilter !== null && semester !== semesterFilter) return;

        const groupId = `${syllabusCourseId}__${semester}__${fallbackIntake}`;
        const key = groupId.toLowerCase();

        const existing = groups.get(key);
        if (!existing) {
          groups.set(key, {
            id: groupId,
            courseId: syllabusCourseId,
            courseName: null,
            intake: fallbackIntake,
            semester,
            departmentNames: [],
            slotCount: 1,
          });
          return;
        }

        existing.slotCount += 1;
      });
      return;
    }

    registrations.forEach((registration) => {
      const enrollment = registration.Enrollment ?? null;
      const intake = enrollment?.Intake ?? null;
      const course = enrollment?.Course ?? null;
      const courseId = course?.CourseID ?? syllabusCourseId ?? null;
      const courseName = course?.Name ?? null;
      const departmentName = course?.Department?.Name ?? null;

      if (!intake || courseId == null || String(courseId).trim() === '') return;

      if (query && !intake.toLowerCase().includes(query)) return;
      if (departmentQuery && !(departmentName ?? '').toLowerCase().includes(departmentQuery)) {
        return;
      }

      effectiveSemesters.forEach((semester) => {
        if (semesterFilter !== null && semester !== semesterFilter) return;

        const groupId = `${courseId}__${semester}__${intake}`;
        const key = groupId.toLowerCase();

        const existing = groups.get(key);
        if (!existing) {
          groups.set(key, {
            id: groupId,
            courseId,
            courseName,
            intake,
            semester,
            departmentNames: departmentName ? [departmentName] : [],
            slotCount: 1,
          });
          return;
        }

        existing.slotCount += 1;
        if (departmentName && !existing.departmentNames.includes(departmentName)) {
          existing.departmentNames.push(departmentName);
        }
      });
    });
  });

  return Array.from(groups.values()).sort((a, b) => {
    const courseCompare = a.courseId.localeCompare(b.courseId);
    if (courseCompare !== 0) return courseCompare;
    const semesterCompare = a.semester - b.semester;
    if (semesterCompare !== 0) return semesterCompare;
    return a.intake.localeCompare(b.intake);
  });
}

/**
 * Admin timetable page to manage and view scheduled timetables.
 */
const TimetablePage = async ({
  searchParams,
}: {
  searchParams: Promise<TimetableSearchParams>;
}) => {
  const supabase = await createClerkSupabaseClient();
  const resolvedSearchParams = await searchParams;

  const intakeQuery = resolvedSearchParams.q || '';

  const [{ data: semestersRaw }, { data: departmentsRaw }] = await Promise.all([
    supabase
      .from('Syllabus')
      .select('Semester')
      .not('Semester', 'is', null)
      .order('Semester', { ascending: true }),
    supabase
      .from('Department')
      .select('DepartmentID, Name')
      .order('Name', { ascending: true }),
  ]);

  const uniqueSemesters = Array.from(
    new Set(
      (semestersRaw || [])
        .map((item) => item.Semester as number | null)
        .filter((value): value is number => typeof value === 'number')
    )
  ).sort((a, b) => a - b);

  const semesterFilter =
    typeof resolvedSearchParams.semester === 'string' &&
    resolvedSearchParams.semester.trim() !== ''
      ? Number(resolvedSearchParams.semester)
      : null;

  const departmentFilter = resolvedSearchParams.department || '';

  const [{ data: scheduleRows }] = await Promise.all([
      supabase
        .from('TimetableSlot')
        .select(
          `
          TimetableSlotID,
          Day,
          Start,
          End,
          Facility (
            FacilityID,
            Name
          ),
          Class (
            ClassID,
            Group,
            Type,
            Subject (
              SubjectID,
              Name,
              Duration,
              Syllabus (
                SyllabusID,
                Semester,
                CourseID
              )
            ),
            ClassRegistration (
              Enrollment (
                EnrollmentID,
                Intake,
                Course (
                  CourseID,
                  Name,
                  Department (
                    DepartmentID,
                    Name
                  )
                )
              )
            )
          )
        `
        )
        .not('ClassID', 'is', null)
        .order('Day', { ascending: true }),
    ]);

  const allScheduledSlots = mapScheduledSlots(scheduleRows || []);

  filterScheduledSlots(allScheduledSlots, intakeQuery, semesterFilter, departmentFilter);

  const timetableGroups = buildTimetableGroups(
    scheduleRows || [],
    intakeQuery,
    semesterFilter,
    departmentFilter
  );

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-sm text-gray-600">
            View scheduled timetable slots grouped by course, semester, and intake.
          </p>
        </div>

        <div className="flex w-full justify-end sm:w-auto">
          <ScheduleTimetableButton />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                name="q"
                defaultValue={intakeQuery}
                placeholder="Search by intake code..."
                className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <select
                name="semester"
                defaultValue={semesterFilter ?? ''}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
              >
                <option value="">All Semesters</option>
                {uniqueSemesters.map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>

              <select
                name="department"
                defaultValue={departmentFilter}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
              >
                <option value="">All Departments</option>
                {(departmentsRaw || []).map((dept) => (
                  <option key={dept.DepartmentID} value={dept.Name}>
                    {dept.Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Apply
            </button>
            <Link
              href="/admin/timetable"
              className="inline-flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Clear
            </Link>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <header className="border-b border-gray-100 pb-2">
            <h2 className="text-base font-semibold">Scheduled timetable</h2>
            <p className="text-xs text-gray-500">
              Timetables grouped by course, semester, and intake.
            </p>
          </header>

          {timetableGroups.length === 0 ? (
            <p className="py-4 text-sm text-gray-500">
              No timetable slots match the current filters.
            </p>
          ) : (
            <div className="space-y-2">
              {timetableGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex flex-col justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm sm:flex-row sm:items-center"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-gray-900">
                      {group.courseId}
                      {group.courseName ? <span className="text-gray-700"> ({group.courseName})</span> : null}
                    </p>
                    <p className="text-xs text-gray-600">
                      Semester {group.semester} · Intake {group.intake} · {group.slotCount} slot
                      {group.slotCount === 1 ? '' : 's'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Departments: {group.departmentNames.join(', ') || '—'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <Link
                      href={`/admin/timetable/${encodeURIComponent(group.id)}`}
                      className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-medium text-gray-800 hover:bg-gray-100"
                    >
                      View timetable
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TimetablePage;