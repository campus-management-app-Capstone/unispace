import React from 'react';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';

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
 */
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
 */
function getUnscheduledClasses(classes: UnscheduledClass[]) {
  return classes;
}

/**
 * Admin timetable page to manage and view scheduled and unscheduled classes.
 */
const TimetablePage = async ({
  searchParams,
}: {
  searchParams: Promise<TimetableSearchParams>;
}) => {
  const supabase = await createServerSupabaseClient();
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

  const defaultSemester =
    uniqueSemesters.length > 0 ? uniqueSemesters[uniqueSemesters.length - 1] : null;

  const semesterFilter =
    typeof resolvedSearchParams.semester === 'string' &&
    resolvedSearchParams.semester.trim() !== ''
      ? Number(resolvedSearchParams.semester)
      : defaultSemester;

  const departmentFilter = resolvedSearchParams.department || '';

  const [{ data: scheduleRows }, { data: unscheduledClassRows }, { data: slotClassRows }] =
    await Promise.all([
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
        .order('Day', { ascending: true }),
      supabase
        .from('Class')
        .select(
          `
          ClassID,
          Group,
          Type,
          Subject (
            SubjectID,
            Name
          ),
          Lecturer (
            LecturerID,
            LecturerCode
          )
        `
        )
        .order('ClassID', { ascending: true }),
      supabase
        .from('TimetableSlot')
        .select('ClassID')
        .not('ClassID', 'is', null),
    ]);

  const classIdsWithSlot = new Set<string>(
    (slotClassRows || [])
      .map((row) => row.ClassID as string | null)
      .filter((id): id is string => Boolean(id))
  );

  const allUnscheduledClasses = mapUnscheduledClasses(
    (unscheduledClassRows || []).filter((row) => !classIdsWithSlot.has(row.ClassID))
  );

  const allScheduledSlots = mapScheduledSlots(scheduleRows || []);

  const filteredScheduledSlots = filterScheduledSlots(
    allScheduledSlots,
    intakeQuery,
    semesterFilter,
    departmentFilter
  );

  const filteredUnscheduledClasses = getUnscheduledClasses(allUnscheduledClasses);

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Timetable</h1>
          <p className="text-sm text-gray-600">
            View scheduled timetable slots and remaining unscheduled classes.
          </p>
        </div>

        <div className="flex w-full justify-end sm:w-auto">
          <Link
            href="/admin/timetable/add"
            className="inline-flex h-9 items-center rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50"
          >
            Schedule
          </Link>
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
            <h2 className="text-base font-semibold">Unscheduled classes</h2>
            <p className="text-xs text-gray-500">
              Classes without any timetable slot. Schedule these to complete the timetable.
            </p>
          </header>

          {filteredUnscheduledClasses.length === 0 ? (
            <p className="py-4 text-sm text-gray-500">All classes are scheduled.</p>
          ) : (
            <div className="space-y-2">
              {filteredUnscheduledClasses.map((item) => (
                <div
                  key={item.classId}
                  className="flex flex-col justify-between gap-2 rounded-md border border-dashed border-gray-200 bg-gray-50 px-3 py-2 text-sm sm:flex-row sm:items-center"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-gray-900">
                      {item.classId} {item.group && <span className="text-gray-700">({item.group})</span>}
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.subjectName || 'No subject linked'} ·{' '}
                      {item.type || 'Unspecified type'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>Lecturer: {item.lecturerCode || '-'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <header className="border-b border-gray-100 pb-2">
            <h2 className="text-base font-semibold">Scheduled timetable</h2>
            <p className="text-xs text-gray-500">
              Timetable slots for the selected semester, department, and intake filter.
            </p>
          </header>

          {filteredScheduledSlots.length === 0 ? (
            <p className="py-4 text-sm text-gray-500">
              No timetable slots match the current filters.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredScheduledSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex flex-col justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm sm:flex-row sm:items-center"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-gray-900">
                      {slot.subjectName || 'Unassigned subject'}{' '}
                      {slot.classId && (
                        <span className="text-gray-700">
                          ({slot.classId}
                          {slot.classGroup ? ` · ${slot.classGroup}` : ''})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-600">
                      {slot.day || 'Day not set'} ·{' '}
                      {slot.start && slot.end ? `${slot.start}–${slot.end}` : 'Time not set'} ·{' '}
                      {slot.facilityName || 'Facility not set'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Intakes: {slot.intakes.join(', ') || '—'} · Departments:{' '}
                      {slot.departments.join(', ') || '—'} · Semesters:{' '}
                      {slot.semesters.length > 0 ? slot.semesters.join(', ') : '—'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    {slot.intakes.map((intake) => (
                      <Link
                        key={intake}
                        href={{
                          pathname: `/admin/timetable/${encodeURIComponent(intake)}`,
                          query: {
                            semester:
                              semesterFilter !== null
                                ? String(semesterFilter)
                                : slot.semesters[0]
                                ? String(slot.semesters[0])
                                : undefined,
                          },
                        }}
                        className="rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-medium text-gray-800 hover:bg-gray-100"
                      >
                        View {intake}
                      </Link>
                    ))}
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