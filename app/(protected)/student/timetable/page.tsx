import React from 'react';
import Link from 'next/link';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * Display model for a single timetable slot on the student timetable.
 */
interface StudentTimetableSlot {
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

/**
 * Normalize day string from DB (e.g. "Mon", "Monday") to 3-letter key for grouping.
 */
function normalizeDay(day: string | null): string | null {
  if (!day) return null;
  const trimmed = day.trim();
  if (trimmed.length >= 3) return trimmed.slice(0, 3);
  return trimmed;
}

/**
 * Day order for weekly view; keys match normalized day values from DB.
 */
const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Map raw TimetableSlot rows from Supabase into student-facing slot objects.
 */
function mapToStudentSlots(rows: unknown[]): StudentTimetableSlot[] {
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
 * Renders a simple error message block so we never pass non-serializable objects to the client.
 */
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

/** Weekday keys and display labels for the day selector. */
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;
const DAY_HEADERS = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const;

/**
 * Student timetable page: student selects a day to view that day's classes.
 * Class cards are full width. Uses currentUser() for role and userId; Supabase Student → Enrollments → TimetableSlots.
 */
export default async function StudentTimetablePage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  try {
    const { userId } = await auth();
    if (!userId) {
      redirect('/sign-in');
    }

    const user = await currentUser();
    const userRole = (user?.publicMetadata?.role as string) ?? undefined;

    if (userRole !== 'student') {
      return (
        <TimetableErrorMessage
          title="My Timetable"
          message="You are not registered as a student. Timetable is only available for students."
        />
      );
    }

    // Use server Supabase client for Student lookup (RLS disabled); avoids Clerk JWT affecting the query.
    const supabaseServer = createServerSupabaseClient();
    const { data: student, error: studentError } = await supabaseServer
      .from('Student')
      .select('StudentID')
      .eq('UserID', userId)
      .maybeSingle();

    if (studentError) {
      const errMessage =
        studentError && typeof studentError === 'object' && 'message' in studentError
          ? String((studentError as { message?: unknown }).message)
          : 'Unable to load student record.';
      return (
        <TimetableErrorMessage
          title="My Timetable"
          message={errMessage}
        />
      );
    }

    if (!student) {
      return (
        <TimetableErrorMessage
          title="My Timetable"
          message="Your student record was not found. Please contact support if you believe this is an error."
        />
      );
    }

    // Fetch enrollments for this student to get EnrollmentIDs
    const { data: enrollments } = await supabaseServer
      .from('Enrollment')
      .select('EnrollmentID')
      .eq('StudentID', student.StudentID);

    const enrollmentIds = (enrollments ?? []).map((e) => e.EnrollmentID);
    if (enrollmentIds.length === 0) {
      return (
        <TimetableErrorMessage
          title="My Timetable"
          message="You have no enrollments. Your timetable will appear here once you are enrolled."
        />
      );
    }

    // Get ClassIDs the student is registered for via ClassRegistration
    const { data: classRegistrations } = await supabaseServer
      .from('ClassRegistration')
      .select('ClassID')
      .in('EnrollmentID', enrollmentIds);

    const classIds = Array.from(
      new Set((classRegistrations ?? []).map((r) => r.ClassID).filter(Boolean))
    ) as string[];

    if (classIds.length === 0) {
      return (
        <TimetableErrorMessage
          title="My Timetable"
          message="You are not registered for any classes yet."
        />
      );
    }

    // Fetch timetable slots for those classes with Facility and Class (Subject, Lecturer)
    const { data: slotRows } = await supabaseServer
      .from('TimetableSlot')
      .select(
        `
      TimetableSlotID,
      Day,
      Start,
      End,
      Facility (
        Name
      ),
      Class (
        ClassID,
        Subject (
          Name
        ),
        Lecturer (
          LecturerCode
        )
      )
    `
      )
      .in('ClassID', classIds)
      .order('Day', { ascending: true })
      .order('Start', { ascending: true });

    const allSlots = mapToStudentSlots(slotRows ?? []);

    // Group slots by normalized day
    const slotsByDay: Record<string, StudentTimetableSlot[]> = DAY_ORDER.reduce(
      (acc, key) => {
        acc[key] = [];
        return acc;
      },
      {} as Record<string, StudentTimetableSlot[]>
    );

    allSlots.forEach((slot) => {
      const normalized = normalizeDay(slot.day);
      if (!normalized) return;
      if (slotsByDay[normalized]) {
        slotsByDay[normalized].push(slot);
      }
    });

    // Sort slots within each day by start time
    DAY_ORDER.forEach((key) => {
      slotsByDay[key] = (slotsByDay[key] ?? []).sort((a, b) => {
        const aStart = a.start ?? '';
        const bStart = b.start ?? '';
        return aStart.localeCompare(bStart);
      });
    });

    const resolvedParams = await searchParams;
    const dayParam = typeof resolvedParams.day === 'string' ? resolvedParams.day.trim() : '';
    const availableDays = WEEK_DAYS.filter((d) => (slotsByDay[d] ?? []).length > 0);
    const defaultDay = availableDays[0] ?? 'Mon';
    const selectedDay =
      dayParam && WEEK_DAYS.includes(dayParam as (typeof WEEK_DAYS)[number])
        ? (dayParam as (typeof WEEK_DAYS)[number])
        : defaultDay;
    const selectedSlots = slotsByDay[selectedDay] ?? [];

    return (
      <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">My Timetable</h1>
          <p className="text-sm text-gray-600">
            Select a day to view your scheduled classes.
          </p>
        </div>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          {/* Day selector: MON, TUE, WED, THU, FRI (clickable) */}
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((dayKey, index) => {
              const isActive = dayKey === selectedDay;
              const hasSlots = (slotsByDay[dayKey] ?? []).length > 0;
              return (
                <Link
                  key={dayKey}
                  href={`/student/timetable?day=${dayKey}`}
                  className={`inline-flex min-w-[4rem] items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
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

          {/* Full-width class cards for the selected day */}
          <div className="w-full space-y-3">
            {selectedSlots.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                No classes scheduled for {selectedDay}.
              </p>
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
    // Re-throw Next.js redirect/notFound so they still work
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
          : 'Something went wrong loading your timetable. Please try again.';
    return (
      <TimetableErrorMessage title="My Timetable" message={message} />
    );
  }
}
