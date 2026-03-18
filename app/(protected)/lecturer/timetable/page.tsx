import React from 'react';
import Link from 'next/link';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';

/** Ensure this page always runs with current URL params (no stale cache). */
export const dynamic = 'force-dynamic';

/** Build query string for lecturer timetable with optional day, intake, course. */
function buildTimetableQuery(params: {
  day?: string;
  intake?: string;
  course?: string;
}): string {
  const q = new URLSearchParams();
  if (params.day) q.set('day', params.day);
  if (params.intake) q.set('intake', params.intake);
  if (params.course) q.set('course', params.course);
  return q.toString();
}

/**
 * Display model for a single timetable slot on the lecturer timetable.
 */
interface LecturerTimetableSlot {
  id: string;
  classId: string | null;
  subjectName: string | null;
  time: string;
  venue: string | null;
  lecturer: string | null;
  day: string | null;
  start: string | null;
  end: string | null;
}

function normalizeDay(day: string | null): string | null {
  if (!day) return null;
  const trimmed = day.trim();
  if (trimmed.length >= 3) return trimmed.slice(0, 3);
  return trimmed;
}

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const DAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;

/**
 * Map raw TimetableSlot rows into lecturer-facing slot objects.
 */
function mapToLecturerSlots(rows: unknown[]): LecturerTimetableSlot[] {
  return (rows || []).map((row) => {
    const typedRow = row as {
      TimetableSlotID: string;
      Day: string | null;
      Start: string | null;
      End: string | null;
      Facility?: { Name?: string | null } | null;
      Class?: {
        ClassID?: string | null;
        Subject?: { Name?: string | null } | null;
        Lecturer?: { LecturerCode?: string | null } | null;
      } | null;
    };
    const cls = typedRow.Class ?? null;
    const start = typedRow.Start ?? '';
    const end = typedRow.End ?? '';
    const timeStr = start && end ? `${start} – ${end}` : start || end || '—';
    return {
      id: typedRow.TimetableSlotID,
      classId: cls?.ClassID ?? null,
      subjectName: cls?.Subject?.Name ?? null,
      time: timeStr,
      venue: typedRow.Facility?.Name ?? null,
      lecturer: cls?.Lecturer?.LecturerCode ?? null,
      day: typedRow.Day,
      start: typedRow.Start,
      end: typedRow.End,
    };
  });
}

/**
 * Filter slots by intake and course using ClassRegistration -> Enrollment.
 */
function filterSlotsByIntakeAndCourse(
  rows: unknown[],
  intakeFilter: string,
  courseFilter: string
): unknown[] {
  const intake = intakeFilter.trim().toLowerCase();
  const course = courseFilter.trim().toLowerCase();
  if (!intake && !course) return rows;

  return (rows || []).filter((row) => {
    const typedRow = row as {
      Class?: {
        ClassRegistration?: {
          Enrollment?: {
            Intake?: string | null;
            Course?: { CourseID?: string | null; Name?: string | null } | null;
          } | null;
        }[];
      } | null;
    };
    const rawRegs = typedRow.Class?.ClassRegistration;
    const regs = Array.isArray(rawRegs) ? rawRegs : rawRegs ? [rawRegs] : [];
    const matches = regs.some((r) => {
      const en = r.Enrollment ?? null;
      if (!en) return false;
      const enIntake = (en.Intake ?? '').trim().toLowerCase();
      const enCourseId = (en.Course?.CourseID ?? '').trim().toLowerCase();
      const enCourseName = (en.Course?.Name ?? '').trim().toLowerCase();
      const intakeOk = !intake || enIntake === intake;
      const courseOk =
        !course ||
        enCourseId === course ||
        enCourseName === course;
      return intakeOk && courseOk;
    });
    return matches;
  });
}

/**
 * Extract unique intakes and courses from timetable slot rows (from ClassRegistration -> Enrollment).
 */
function getFilterOptions(rows: unknown[]): { intakes: string[]; courses: { id: string; name: string }[] } {
  const intakesSet = new Set<string>();
  const coursesMap = new Map<string, string>();

  (rows || []).forEach((row) => {
    const typedRow = row as {
      Class?: {
        ClassRegistration?: {
          Enrollment?: {
            Intake?: string | null;
            Course?: { CourseID?: string | null; Name?: string | null } | null;
          } | null;
        }[];
      } | null;
    };
    const regs = typedRow.Class?.ClassRegistration ?? [];
    regs.forEach((r) => {
      const en = r.Enrollment ?? null;
      if (en?.Intake) intakesSet.add(en.Intake.trim());
      const c = en?.Course;
      if (c?.CourseID) coursesMap.set(c.CourseID, (c.Name ?? c.CourseID).trim());
    });
  });

  const intakes = Array.from(intakesSet).sort();
  const courses = Array.from(coursesMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { intakes, courses };
}

function TimetableErrorMessage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

/**
 * Lecturer timetable page: shows classes the lecturer teaches.
 * Optional filters: Intake, Course. Day selector then full-width class cards.
 */
export default async function LecturerTimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string; intake?: string; course?: string }>;
}) {
  try {
    const { userId } = await auth();
    if (!userId) redirect('/sign-in');

    const user = await currentUser();
    const userRole = (user?.publicMetadata?.role as string) ?? undefined;
    if (userRole !== 'lecturer') {
      return (
        <TimetableErrorMessage
          title="Lecturer Timetable"
          message="You are not registered as a lecturer. This page is for lecturers only."
        />
      );
    }

    const supabase = createServerSupabaseClient();
    const { data: lecturer, error: lecturerError } = await supabase
      .from('Lecturer')
      .select('LecturerID')
      .eq('UserID', userId)
      .maybeSingle();

    if (lecturerError) {
      return (
        <TimetableErrorMessage
          title="Lecturer Timetable"
          message="Unable to load lecturer record. Please try again."
        />
      );
    }
    if (!lecturer) {
      return (
        <TimetableErrorMessage
          title="Lecturer Timetable"
          message="Your lecturer record was not found. Please contact support."
        />
      );
    }

    const { data: lecturerClasses } = await supabase
      .from('Class')
      .select('ClassID')
      .eq('LecturerID', lecturer.LecturerID);
    const lecturerClassIds = new Set(
      (lecturerClasses ?? []).map((c) => c.ClassID).filter(Boolean)
    );

    // Fetch all timetable slots (with enrollment info) so we can show full course timetable when filter is applied
    const { data: allSlotRows } = await supabase
      .from('TimetableSlot')
      .select(
        `
      TimetableSlotID,
      ClassID,
      Day,
      Start,
      End,
      Facility ( Name ),
      Class (
        ClassID,
        Subject ( Name ),
        Lecturer ( LecturerCode ),
        ClassRegistration (
          Enrollment (
            Intake,
            Course ( CourseID, Name )
          )
        )
      )
    `
      )
      .not('ClassID', 'is', null)
      .order('Day', { ascending: true })
      .order('Start', { ascending: true });

    const resolved = await searchParams;
    const intakeParam = typeof resolved.intake === 'string' ? resolved.intake : '';
    const courseParam = typeof resolved.course === 'string' ? resolved.course : '';
    const hasCourseOrIntakeFilter = !!(intakeParam.trim() || courseParam.trim());

    if (!hasCourseOrIntakeFilter && lecturerClassIds.size === 0) {
      return (
        <TimetableErrorMessage
          title="Lecturer Timetable"
          message="You are not assigned to any classes yet. Use Intake and Course filters to view another course's timetable."
        />
      );
    }

    const rows = allSlotRows ?? [];

    // Filter options: all intakes and courses that appear in the timetable (so lecturer can select any course)
    const { intakes, courses } = getFilterOptions(rows);

    // No filter: show only classes this lecturer teaches. With filter: show full timetable for that course/intake (all lecturers)
    const rowsToShow = hasCourseOrIntakeFilter
      ? filterSlotsByIntakeAndCourse(rows, intakeParam, courseParam)
      : rows.filter((row) => {
          const r = row as { ClassID?: string | null; Class?: { ClassID?: string | null } | null };
          const classId = r.ClassID ?? r.Class?.ClassID ?? null;
          return classId != null && classId !== '' && lecturerClassIds.has(classId);
        });

    const allSlots = mapToLecturerSlots(rowsToShow);

    const slotsByDay: Record<string, LecturerTimetableSlot[]> = DAY_ORDER.reduce(
      (acc, key) => {
        acc[key] = [];
        return acc;
      },
      {} as Record<string, LecturerTimetableSlot[]>
    );
    allSlots.forEach((slot) => {
      const norm = normalizeDay(slot.day);
      if (norm && slotsByDay[norm]) slotsByDay[norm].push(slot);
    });
    DAY_ORDER.forEach((key) => {
      slotsByDay[key] = (slotsByDay[key] ?? []).sort((a, b) =>
        (a.start ?? '').localeCompare(b.start ?? '')
      );
    });

    const dayParam = typeof resolved.day === 'string' ? resolved.day.trim() : '';
    const availableDays = WEEK_DAYS.filter((d) => (slotsByDay[d] ?? []).length > 0);
    const defaultDay = availableDays[0] ?? 'Mon';
    const requestedDay: (typeof WEEK_DAYS)[number] | null =
      dayParam && WEEK_DAYS.includes(dayParam as (typeof WEEK_DAYS)[number])
        ? (dayParam as (typeof WEEK_DAYS)[number])
        : null;
    const selectedDay = requestedDay ?? defaultDay;
    const selectedSlots = slotsByDay[selectedDay] ?? [];

    const queryForDay = (day: string) =>
      buildTimetableQuery({
        day,
        intake: resolved.intake,
        course: resolved.course,
      });

    const selectedCourseName =
      resolved.course && courses.length > 0
        ? courses.find((c) => c.id === resolved.course)?.name ?? resolved.course
        : null;
    const hasFilters = !!(resolved.intake || resolved.course);

    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Lecturer Timetable</h1>
          <p className="text-sm text-gray-600">
            By default, only your classes are shown. Select Intake and Course then Apply to view the full timetable for that course (all subjects and lecturers).
          </p>
        </div>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {/* Filters: Intake, Course, Clear */}
          <form
            method="GET"
            action="/lecturer/timetable"
            className="flex flex-wrap items-center gap-3"
          >
            <input type="hidden" name="day" value={selectedDay} />
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="intake" className="text-sm font-medium text-gray-700">
                Intake
              </label>
              <select
                id="intake"
                name="intake"
                defaultValue={resolved.intake ?? ''}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none"
              >
                <option value="">All</option>
                {intakes.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="course" className="text-sm font-medium text-gray-700">
                Course
              </label>
              <select
                id="course"
                name="course"
                defaultValue={resolved.course ?? ''}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-800 focus:outline-none"
              >
                <option value="">All</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Apply
            </button>
            <Link
              href="/lecturer/timetable"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Clear
            </Link>
          </form>

          {/* Day selector */}
          <div className="grid w-full grid-cols-5 gap-2">
            {WEEK_DAYS.map((dayKey, index) => {
              const isActive = dayKey === selectedDay;
              const hasSlots = (slotsByDay[dayKey] ?? []).length > 0;
              const dayHref = `/lecturer/timetable?${queryForDay(dayKey)}`;
              return (
                <Link
                  key={dayKey}
                  href={dayHref}
                  className={`flex w-full items-center justify-center rounded-lg border px-2 py-2.5 text-sm font-medium transition-colors sm:px-3 ${
                    isActive
                      ? 'border-gray-800 bg-gray-800 text-white'
                      : hasSlots
                        ? 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 text-gray-400'
                  }`}
                >
                  {DAY_HEADERS[index]}
                </Link>
              );
            })}
          </div>

          {/* Show which timetable is being displayed */}
          {hasFilters ? (
            <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <span className="font-medium">Showing full course timetable: </span>
              {[
                selectedCourseName && `Course: ${selectedCourseName}`,
                resolved.intake && `Intake: ${resolved.intake}`,
                `${selectedDay} only`,
              ]
                .filter(Boolean)
                .join(' · ')}
              <span className="ml-1 text-gray-500">(all timetable slots for this course)</span>
            </div>
          ) : (
            <div className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              <span className="font-medium">Showing your classes only.</span>
              <span className="ml-1 text-gray-500">Select Intake and Course then Apply to view the full timetable for a course.</span>
            </div>
          )}

          {/* Full-width class cards */}
          <div className="w-full space-y-3">
            {selectedSlots.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                <p className="font-medium text-gray-700">No class today.</p>
                <p className="mt-1">No classes scheduled for {selectedDay}.</p>
                {hasFilters ? (
                  <p className="mt-2">
                    No slots match the selected Intake and Course. Try another day or{' '}
                    <Link href="/lecturer/timetable" className="font-medium text-gray-700 underline hover:text-gray-900">
                      clear filters
                    </Link>
                    .
                  </p>
                ) : (
                  <p className="mt-2">(Showing your classes only.)</p>
                )}
              </div>
            ) : (
              selectedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex w-full flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-col gap-0.5">
                    {slot.classId && (
                      <p className="font-semibold text-red-600">{slot.classId}</p>
                    )}
                    <p className="font-medium text-gray-900">
                      {slot.subjectName ?? '—'}
                    </p>
                    <p className="text-sm text-gray-600">{slot.time}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 sm:shrink-0">
                    <span>{slot.venue ?? '—'}</span>
                    <span>{slot.lecturer ?? '—'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    );
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'digest' in err &&
      String((err as { digest?: string }).digest).startsWith('NEXT_')
    ) {
      throw err;
    }
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
          ? String((err as { message?: unknown }).message)
          : 'Something went wrong loading the timetable.';
    return (
      <TimetableErrorMessage title="Lecturer Timetable" message={message} />
    );
  }
}
