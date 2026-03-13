import React from 'react';
import Link from 'next/link';
import { createClerkSupabaseClient } from '@/lib/supabase';

/**
 * Shape of a timetable slot used in the calendar view.
 */
interface IntakeTimetableSlot {
  id: string;
  day: string | null;
  start: string | null;
  end: string | null;
  facilityName: string | null;
  subjectName: string | null;
  classId: string | null;
  classGroup: string | null;
  classType: string | null;
}

/**
 * Parse `/admin/timetable/[timetableID]` where timetableID encodes:
 * `${courseId}__${semester}__${intake}`.
 */
function parseTimetableId(value: string) {
  const decoded = decodeURIComponent(value);
  const [courseId, semesterRaw, intake] = decoded.split('__');

  const semester = Number(semesterRaw ?? '');
  return {
    courseId: courseId ?? '',
    semester: Number.isFinite(semester) ? semester : null,
    intake: intake ?? '',
    raw: decoded,
  };
}

/**
 * Map raw Supabase rows into timetable slots filtered by course + semester + intake.
 */
function mapIntakeSlots(
  rows: unknown[],
  filters: {
    courseId: string | null;
    intake: string | null;
    semester: number | null;
  }
) {
  const semesterFilter = filters.semester;
  const intakeFilter = filters.intake ? filters.intake.toLowerCase() : null;
  const courseFilter = filters.courseId ? filters.courseId.toLowerCase() : null;

  const slots: IntakeTimetableSlot[] = [];

  (rows || []).forEach((row) => {
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
          Syllabus?: { Semester?: number | null; CourseID?: string | null }[];
        } | null;
        ClassRegistration?: {
          Enrollment?: {
            Intake?: string | null;
            Course?: { CourseID?: string | null; Name?: string | null } | null;
          } | null;
        }[];
      } | null;
    };

    const timetableClass = typedRow.Class || null;
    const subject = timetableClass?.Subject || null;
    const syllabusArray = subject?.Syllabus || [];
    const semesters = (syllabusArray as { Semester?: number | null }[])
      .map((syllabus) => syllabus.Semester ?? null)
      .filter((value): value is number => typeof value === 'number');

    const registrations = timetableClass?.ClassRegistration || [];

    // Filter by intake and course using enrollment information when available.
    if (intakeFilter || courseFilter) {
      const matchesEnrollment = registrations.some((registration) => {
        const enrollment = registration.Enrollment ?? null;
        if (!enrollment) return false;

        const enrollmentIntake = (enrollment.Intake ?? '').toLowerCase();
        const enrollmentCourseId = (enrollment.Course?.CourseID ?? '').toLowerCase();

        const intakeMatches =
          !intakeFilter || (enrollmentIntake && enrollmentIntake === intakeFilter);
        const courseMatches =
          !courseFilter || (enrollmentCourseId && enrollmentCourseId === courseFilter);

        return intakeMatches && courseMatches;
      });

      if (!matchesEnrollment) {
        return;
      }
    }

    // Only filter by semester if we have both a filter and semester info on the subject.
    if (semesterFilter !== null && semesters.length > 0 && !semesters.includes(semesterFilter)) {
      return;
    }

    slots.push({
      id: typedRow.TimetableSlotID,
      day: typedRow.Day,
      start: typedRow.Start,
      end: typedRow.End,
      facilityName: typedRow.Facility?.Name ?? null,
      subjectName: subject?.Name ?? null,
      classId: timetableClass?.ClassID ?? null,
      classGroup: timetableClass?.Group ?? null,
      classType: timetableClass?.Type ?? null,
    });
  });

  return slots;
}

/**
 * Admin timetable detail page shows the timetable for a specific course + intake + semester
 * in a day-based layout with a weekday selector.
 */
const TimetableDetailPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ timetableID: string }>;
  searchParams: Promise<{ day?: string }>;
}) => {
  const supabase = await createClerkSupabaseClient();
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { courseId, semester, intake } = parseTimetableId(resolvedParams.timetableID);

  const { data: scheduleRows } = await supabase
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
              Name
            )
          )
        )
      )
    `
    )
    .order('Day', { ascending: true });

  const intakeSlots = mapIntakeSlots(scheduleRows || [], {
    courseId,
    intake,
    semester,
  });

  const courseName =
    (scheduleRows || [])
      .map((row) => {
        const typedRow = row as {
          Class?: {
            ClassRegistration?: { Enrollment?: { Course?: { CourseID?: string | null; Name?: string | null } | null } | null }[];
          } | null;
        };

        const registrations = typedRow.Class?.ClassRegistration ?? [];
        const matching = registrations.find((registration) => {
          const enrollmentCourse = registration.Enrollment?.Course ?? null;
          return (enrollmentCourse?.CourseID ?? '').toLowerCase() === courseId.toLowerCase();
        });

        return matching?.Enrollment?.Course?.Name ?? null;
      })
      .find((value): value is string => Boolean(value)) ?? courseId;

  const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const normalizeDay = (day: string | null) => {
    if (!day) return null;
    const trimmed = day.trim();
    if (trimmed.length >= 3) {
      return trimmed.slice(0, 3);
    }
    return trimmed;
  };

  const slotsByDay: Record<string, IntakeTimetableSlot[]> = dayOrder.reduce(
    (acc, key) => {
      acc[key] = [];
      return acc;
    },
    {} as Record<string, IntakeTimetableSlot[]>
  );

  intakeSlots.forEach((slot) => {
    const normalized = normalizeDay(slot.day);
    if (!normalized) return;
    if (!slotsByDay[normalized]) {
      slotsByDay[normalized] = [];
    }
    slotsByDay[normalized].push(slot);
  });

  dayOrder.forEach((key) => {
    slotsByDay[key] = (slotsByDay[key] || []).sort((a, b) => {
      const aStart = a.start ?? '';
      const bStart = b.start ?? '';
      return aStart.localeCompare(bStart);
    });
  });

  const availableDays = dayOrder.filter((key) => slotsByDay[key]?.length > 0);
  const initialDay = availableDays[0] ?? dayOrder[0];
  const selectedDayParam =
    typeof resolvedSearchParams.day === 'string' ? resolvedSearchParams.day : undefined;
  const selectedDay = selectedDayParam && dayOrder.includes(selectedDayParam)
    ? selectedDayParam
    : initialDay;

  const selectedSlots = slotsByDay[selectedDay] ?? [];

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            Timetable: {courseId} - Semester {semester}
          </h1>
          <p className="text-sm text-gray-600">
            Weekly class schedule for <span className="font-medium">{courseName}</span> intake{' '}
            <span className="font-medium">{intake || 'All'}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/timetable"
            className="inline-flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Back to overview
          </Link>
        </div>
      </div>

      <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <header className="space-y-2 border-b border-gray-100 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-medium uppercase text-gray-500">
                Intake
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {intake || 'All'}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-medium uppercase text-gray-500">
                Week
              </p>
              <p className="text-sm text-gray-900">
                Weekly view (all days)
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {dayOrder.map((dayKey) => {
              const isActive = dayKey === selectedDay;
              const hasSlots = (slotsByDay[dayKey] || []).length > 0;

              return (
                <Link
                  key={dayKey}
                  href={{
                    pathname: `/admin/timetable/${encodeURIComponent(resolvedParams.timetableID)}`,
                    query: { day: dayKey },
                  }}
                  className={[
                    'inline-flex min-w-[3rem] items-center justify-center rounded-full px-3 py-1 text-xs font-medium',
                    isActive
                      ? 'bg-gray-900 text-white'
                      : hasSlots
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      : 'bg-gray-50 text-gray-400',
                  ].join(' ')}
                >
                  {dayKey}
                </Link>
              );
            })}
          </div>
        </header>

        {selectedSlots.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">
            No classes scheduled for {selectedDay}.
          </p>
        ) : (
          <div className="space-y-3">
            {selectedSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex flex-col gap-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-gray-900">
                    {slot.subjectName || 'Unassigned subject'}
                  </p>
                  <p className="text-xs text-gray-600">
                    {slot.start && slot.end ? `${slot.start} – ${slot.end}` : 'Time not set'}
                    {slot.classId && (
                      <>
                        {' · '}
                        {slot.classId}
                        {slot.classGroup ? ` (${slot.classGroup})` : ''}
                      </>
                    )}
                    {slot.classType ? ` · ${slot.classType}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1 text-xs text-gray-600 md:items-end">
                  <span>{slot.facilityName || 'Facility not set'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TimetableDetailPage;

