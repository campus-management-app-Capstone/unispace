"use client";

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { addDays, eachDayOfInterval, isBefore, startOfDay } from "date-fns";

/**
 * Timetable slot shape for rendering in the calendar UI.
 * Day is stored as a weekday label (e.g. Monday/Mon) and time as `HH:mm` or `HH:mm:ss`.
 */
export interface TimetableCalendarSlot {
  id: string;
  day: string | null;
  start: string | null;
  end: string | null;
  title: string;
  location: string | null;
  meta?: {
    classId?: string | null;
    classGroup?: string | null;
    classType?: string | null;
  };
}

function parseTimeToMinutes(time: string) {
  const [hourPart, minutePart] = time.split(":");
  const hours = Number(hourPart ?? "0");
  const minutes = Number(minutePart ?? "0");
  return hours * 60 + minutes;
}

function normalizeWeekdayLabel(value: string) {
  return value.trim().toLowerCase();
}

function weekdayIndexFromLabel(dayLabel: string) {
  const label = normalizeWeekdayLabel(dayLabel);
  const mapping: Record<string, number> = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    tues: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    thur: 4,
    thurs: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };

  return mapping[label] ?? null;
}

function addMinutesToDate(date: Date, minutes: number) {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  next.setUTCMinutes(minutes);
  return next;
}

function buildEventsForRange(
  slots: TimetableCalendarSlot[],
  rangeStart: Date,
  rangeEnd: Date
) {
  const start = startOfDay(rangeStart);
  const end = startOfDay(rangeEnd);

  if (!isBefore(start, end)) return [];

  const daysInRange = eachDayOfInterval({
    start,
    // FullCalendar's end is exclusive; ensure we don't skip the last visible day.
    end: addDays(end, -1),
  });

  const events: {
    id: string;
    title: string;
    start: string;
    end: string;
    extendedProps: Record<string, unknown>;
  }[] = [];

  slots.forEach((slot) => {
    if (!slot.day || !slot.start || !slot.end) return;

    const weekdayIndex = weekdayIndexFromLabel(slot.day);
    if (weekdayIndex === null) return;

    const startMinutes = parseTimeToMinutes(slot.start);
    const endMinutes = parseTimeToMinutes(slot.end);

    daysInRange.forEach((date) => {
      if (date.getUTCDay() !== weekdayIndex) return;

      const startDate = addMinutesToDate(date, startMinutes);
      const endDate = addMinutesToDate(date, endMinutes);

      events.push({
        id: `${slot.id}-${startDate.toISOString()}`,
        title: slot.title,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        extendedProps: {
          location: slot.location,
          ...slot.meta,
          timetableSlotId: slot.id,
        },
      });
    });
  });

  return events;
}

/**
 * Calendar UI that renders repeating weekly timetable slots across the currently visible range.
 */
export function TimetableCalendar({ slots }: { slots: TimetableCalendarSlot[] }) {
  const calendarSlots = useMemo(() => slots, [slots]);

  return (
    <div className="w-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        height="auto"
        timeZone="UTC"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "timeGridDay,timeGridWeek,dayGridMonth",
        }}
        slotMinTime="08:00:00"
        slotMaxTime="18:00:00"
        allDaySlot={false}
        nowIndicator
        weekends={false}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        events={(info, successCallback) => {
          const events = buildEventsForRange(calendarSlots, info.start, info.end);
          successCallback(events);
        }}
        eventContent={(arg) => {
          const classId = (arg.event.extendedProps["classId"] as string | undefined) ?? "";
          const classType = (arg.event.extendedProps["classType"] as string | undefined) ?? "";
          const location =
            (arg.event.extendedProps["location"] as string | undefined) ?? "TBA";

          return (
            <div className="truncate px-1">
              <div className="truncate text-[11px] font-semibold">{arg.event.title}</div>
              <div className="truncate text-[11px] text-gray-700">
                {classId ? `${classId}${classType ? ` · ${classType}` : ""}` : classType || "Class"}
              </div>
              <div className="truncate text-[11px] text-gray-600">{location}</div>
            </div>
          );
        }}
      />
    </div>
  );
}

