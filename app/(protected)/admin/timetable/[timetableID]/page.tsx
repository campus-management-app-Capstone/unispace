import React from 'react';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase';

/**
 * Supported params for the admin timetable detail page.
 */
interface TimetableDetailSearchParams {
  semester?: string;
}

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
  semester: number | null;
}

/**
 * Map raw Supabase rows into intake timetable slots for the calendar.
 */
function mapIntakeSlots(
  rows: unknown[],
  intakeCode: string,
  semesterFilter: number | null
) {
  const lowerIntake = intakeCode.toLowerCase();

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
        Subject?: {
          Name?: string | null;
          Syllabus?: { Semester?: number | null }[];
        } | null;
        ClassRegistration?: {
          Enrollment?: {
            Intake?: string | null;
          } | null;
        }[];
      } | null;
    };

    const timetableClass = typedRow.Class || null;
    const subject = timetableClass?.Subject || null;
    const syllabusArray = subject?.Syllabus || [];
    const classRegistrations = timetableClass?.ClassRegistration || [];

    const semesters = (syllabusArray as { Semester?: number | null }[])
      .map((syllabus) => syllabus.Semester ?? null)
      .filter((value): value is number => typeof value === 'number');

    const matchingRegistrations = (classRegistrations as {
      Enrollment?: { Intake?: string | null };
    }[]).filter((registration) => {
      const intake = registration.Enrollment?.Intake ?? '';
      return intake.toLowerCase() === lowerIntake;
    });

    if (matchingRegistrations.length === 0) {
      return;
    }

    const effectiveSemester =
      semesterFilter !== null
        ? semesterFilter
        : semesters.length > 0
        ? semesters[0]
        : null;

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
      semester: effectiveSemester,
    });
  });

  return slots;
}

/**
 * Admin timetable detail page shows the timetable for a specific intake and semester in a calendar layout.
 */
const TimetableDetailPage = async ({
  params,
  searchParams,
}: {
  params: { timetableID: string };
  searchParams: Promise<TimetableDetailSearchParams>;
}) => {
  const supabase = await createServerSupabaseClient();

  const intakeCode = decodeURIComponent(params.timetableID);
  const resolvedSearchParams = await searchParams;

  const { data: semestersRaw } = await supabase
    .from('Syllabus')
    .select('Semester')
    .not('Semester', 'is', null)
    .order('Semester', { ascending: true });

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
            Intake
          )
        )
      )
    `
    )
    .order('Day', { ascending: true });

  const intakeSlots = mapIntakeSlots(scheduleRows || [], intakeCode, semesterFilter);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const slotsByDay: Record<string, IntakeTimetableSlot[]> = days.reduce(
    (acc, day) => {
      acc[day] = intakeSlots
        .filter((slot) => slot.day === day)
        .sort((a, b) => (a.start || '').localeCompare(b.start || ''));
      return acc;
    },
    {} as Record<string, IntakeTimetableSlot[]>
  );

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            Timetable · {intakeCode}
          </h1>
          <p className="text-sm text-gray-600">
            Calendar view for the selected intake and semester.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <form className="flex items-center gap-2">
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
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Apply
            </button>
          </form>

          <Link
            href="/admin/timetable"
            className="inline-flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Back to overview
          </Link>
        </div>
      </div>

      <section className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <header className="border-b border-gray-100 pb-2">
          <h2 className="text-base font-semibold">
            Weekly calendar
          </h2>
          <p className="text-xs text-gray-500">
            Slots are grouped by weekday with time and venue information.
          </p>
        </header>

        {intakeSlots.length === 0 ? (
          <p className="py-4 text-sm text-gray-500">
            No timetable slots found for this intake and semester.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-5">
            {days.map((day) => (
              <div
                key={day}
                className="flex flex-col rounded-md border border-gray-200 bg-gray-50 p-3"
              >
                <h3 className="mb-2 text-sm font-semibold text-gray-800">
                  {day}
                </h3>
                {slotsByDay[day].length === 0 ? (
                  <p className="py-2 text-xs text-gray-500">No slots.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {slotsByDay[day].map((slot) => (
                      <div
                        key={slot.id}
                        className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs"
                      >
                        <p className="font-medium text-gray-900">
                          {slot.subjectName || 'Unassigned subject'}
                        </p>
                        <p className="text-[11px] text-gray-600">
                          {slot.start && slot.end
                            ? `${slot.start}–${slot.end}`
                            : 'Time not set'}
                          {slot.classId && (
                            <> · {slot.classId}{slot.classGroup ? ` · ${slot.classGroup}` : ''}</>
                          )}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {slot.facilityName || 'Facility not set'}
                        </p>
                        {slot.semester !== null && (
                          <p className="mt-0.5 text-[11px] text-gray-500">
                            Semester {slot.semester}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TimetableDetailPage;

