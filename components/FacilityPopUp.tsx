"use client"

import React, { useEffect, useState } from 'react'
import { X, Clock, CheckCircle2, Ban, Circle, CalendarDays, ChevronLeft, ChevronRight, Timer, ChevronDownIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"
import { toast } from 'react-toastify'


const FacilityPopUp = ({ facility, onClose }) => {
    // gym no need to choose time, only date, the transaction mention the date of paying entry
    // badminton, basketball need to choose time, one hour RM5, transaction mention the date (choose the fixed time slot)
    // study room need to choose the time, but the entry is free (choose the fixed time slot)
    // classroom, lab, audi cannot choose, only show occupied time

    const [date, setDate] = React.useState<Date>(new Date());
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isBooking, setIsBooking] = useState(false);

    // for classroom, lab
    const [weeklySchedule, setWeeklySchedule] = useState({
        Mon: [], Tue: [], Wed: [], Thu: [], Fri: []
    });

    // gym need datepicker, no need time

    // badminton, basketball, study room
    const [timeSlots, setTimeSlots] = useState([
        { time: '08:00 - 09:00', status: "Available" },
        { time: '09:00 - 10:00', status: "Available" },
        { time: '10:00 - 11:00', status: "Available" },
        { time: '11:00 - 12:00', status: "Available" },
        { time: '12:00 - 13:00', status: "Available" },
        { time: '13:00 - 14:00', status: "Available" },
        { time: '14:00 - 15:00', status: "Available" },
        { time: '15:00 - 16:00', status: "Available" },
        { time: '16:00 - 17:00', status: "Available" },
        { time: '17:00 - 18:00', status: "Available" },
        { time: '18:00 - 19:00', status: "Available" },
        { time: '19:00 - 20:00', status: "Available" },
        { time: '20:00 - 21:00', status: "Available" },
        { time: '21:00 - 22:00', status: "Available" }
    ])

    const fetchFacilityAvailability = async (facilityID, type) => {
        try {
            // format the date to solve UTC problem
            const year = date?.getFullYear();
            const month = date?.getMonth() + 1;
            const day = date?.getDate();
            const response = await fetch("/api/facility/occupied", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    facilityID: facilityID,
                    type: type,
                    selectedDate: `${year}-${month}-${day}`
                })
            });

            const result = await response.json();
            const occupiedSess = result.data;

            if (response.ok && result.success) {
                console.log(JSON.stringify(result.data));

                //for facility
                if (type === "Facility") {
                    // disable session before current time
                    const now = new Date();
                    const isToday =
                        date.getFullYear() === now.getFullYear() &&
                        date.getMonth() === now.getMonth() &&
                        date.getDate() === now.getDate();
                    const currentHour = now.getHours();

                    // disabled booked session
                    const bookedStrings = occupiedSess.map(sess => {
                        const startDate = new Date(sess.StartTime);
                        const endDate = new Date(sess.EndTime);
                        const startHour = startDate.getHours() < 10 ? `0${startDate.getHours()}:00` : `${startDate.getHours()}:00`;
                        const endHour = endDate.getHours() < 10 ? `0${endDate.getHours()}:00` : `${endDate.getHours()}:00`;
                        return `${startHour} - ${endHour}`;
                    });

                    // Update slot
                    setTimeSlots((prevSlots) =>
                        prevSlots.map((slot) => {
                            // Check booked
                            if (bookedStrings.includes(slot.time)) {
                                return { ...slot, status: "Occupied" };
                            }

                            // check before current
                            // get the first two digit from "08:00 - 09:00" 
                            const slotStartHour = parseInt(slot.time.substring(0, 2));

                            // the selected date is today and the hour is before
                            if (isToday && slotStartHour <= currentHour) {
                                return { ...slot, status: "Occupied" };
                            }

                            // no booked and no before current
                            return { ...slot, status: "Available" };
                        })
                    );
                }
                else if (type === "Classroom" || type === "Lab") {
                    const schedule = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };

                    // helper to format time
                    const formatTime = (timeStr) => {
                        const [hourStr, min] = timeStr.split(':');
                        return `${hourStr}:${min}`; // "14:00"
                    };

                    // push to schedule
                    result.data.forEach(slot => {
                        if (schedule[slot.Day]) {
                            schedule[slot.Day].push({
                                start: formatTime(slot.Start),
                                end: formatTime(slot.End),
                                rawStart: slot.Start // to sort the time
                            });
                        }
                    });

                    // Sort class in ascending
                    Object.keys(schedule).forEach(day => {
                        schedule[day].sort((a, b) => a.rawStart.localeCompare(b.rawStart));
                    });

                    setWeeklySchedule(schedule);
                }
            } else {
                console.log(result.error);
            }
        } catch (err) {
            console.error("fetch facility availability crashed:", err);
        }
    }

    useEffect(() => {
        console.log(JSON.stringify(selectedSlots));
    }, [selectedSlots])

    const handleBooking = async () => {
        const id = toast.loading("Booking...");
        setIsBooking(true);

        try {
            // process payment
            //counting cost gym is fix to 5, other is 5 per hour
            const cost = facility.Name === "Gym" ? 5 : (selectedSlots.length) * 5;

            const response = await fetch("/api/wallet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: cost,
                    type: "Payment",
                    for: "Booking",
                })
            })
            const result = await response.json();

            if (!response.ok && result.error) {
                console.error("Failed to Pay:", result.error);
                toast.update(id, {
                    render: "Failed to Pay",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
                setIsBooking(false);
                return;
            }

        } catch (error) {
            console.error("Failed to Pay:", error);
            toast.update(id, {
                render: "Failed to Pay",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
            setIsBooking(false);
            return;
        }

        try {
            // process booking
            // format the date to solve UTC problem
            const year = date?.getFullYear();
            const month = date?.getMonth() + 1;
            const day = date?.getDate();
            const formatDate = `${year}-${month}-${day}`

            const booking = [];
            if (facility.Name === "Gym") {
                booking.push({
                    "FacilityID": facility.FacilityID,
                    "StartTime": `${formatDate} 00:00:00`,
                    "EndTime": `${formatDate} 23:59:59`
                })
            } else {
                for (const selected of selectedSlots) {
                    // "08:00 - 09:00"
                    const timeString = timeSlots[selected].time;

                    // split it into two ["08:00", "09:00"]
                    const [startPart, endPart] = timeString.split(' - ');

                    // push to the booking array
                    booking.push({
                        "FacilityID": facility.FacilityID,
                        "StartTime": `${formatDate} ${startPart}:00`,
                        "EndTime": `${formatDate} ${endPart}:00`
                    });
                }
            }

            const response = await fetch("/api/facility/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    booking
                })
            });

            const result = await response.json();

            if (result.success && response.ok) {
                toast.update(id, {
                    render: "Booking Complete.",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
                setIsBooking(false);
                fetchFacilityAvailability(facility.FacilityID, facility.Type)

            } else {
                console.log(result.error);
                toast.update(id, {
                    render: "Booking Failed.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
                setIsBooking(false);
            }
        } catch (err) {
            console.error("fetch facility availability crashed:", err);
            toast.update(id, {
                render: "Booking Failed.",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
            setIsBooking(false);
        }
    }


    useEffect(() => {
        fetchFacilityAvailability(facility.FacilityID, facility.Type);
    }, [date])
    useEffect(() => {
        console.log(date);
    }, [date])

    const toggleSlot = (index) => {
        if (timeSlots[index].status === 'Occupied') return
        setSelectedSlots(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        )
    }

    const slotStyle = (status, index) => {
        const isSelected = selectedSlots.includes(index)
        if (status === 'Occupied') return 'bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 opacity-60 cursor-not-allowed uppercase'
        if (isSelected) return 'bg-primary/10 border border-primary cursor-pointer ring-1 ring-primary/30'
        return 'bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary/50 cursor-pointer transition-colors'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden my-auto">

                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                            {facility?.Name ?? 'Book Facility'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="cursor-pointer p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-4 shrink-0"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[70vh] p-6 space-y-7">

                    {/* Date Selector */}
                    {facility.Type === "Facility" ?
                        // for facility only
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4 text-primary" />
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Select Date</h3>
                                </div>
                            </div>

                            {/* datepicker */}
                            <div className="grid grid-cols-7 gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            data-empty={!date}
                                            className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                                        >
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            defaultMonth={date}
                                            disabled={(date) => {
                                                const now = new Date();
                                                // Create a clean "midnight" Date object using the CURRENT UTC Year, Month, and Day
                                                const todayInUTC = new Date(
                                                    now.getUTCFullYear(),
                                                    now.getUTCMonth(),
                                                    now.getUTCDate()
                                                );

                                                // Disable any calendar day that comes strictly before today in GMT+0
                                                return date < todayInUTC;
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </section>
                        : null}

                    {/* Time Slots for facility and timetable for classroom, lab, audi, gym*/}
                    {(facility.Name === "Gym") ? null :
                        (facility.Type === "Classroom" || facility.Type === "Lab") ?
                            //timetable
                            <section>
                                <div className="flex items-center gap-2 mb-5">
                                    <CalendarDays className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-base">Weekly Timetable</h3>
                                </div>

                                <div className="flex flex-col gap-3">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                                        <div key={day} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3">
                                                {day === 'Thu' ? 'Thursday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Mon' ? 'Monday' : 'Friday'}
                                            </h4>

                                            {/* if no classes */}
                                            {weeklySchedule[day].length === 0 ? (
                                                <p className="text-sm font-medium text-slate-400 italic">No classes scheduled.</p>
                                            ) : (
                                                /* If there are classes, draw the occupied red blocks */
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {weeklySchedule[day].map((slot, i) => (
                                                        <div key={i} className="flex items-center gap-2.5 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 px-3 py-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
                                                            <Ban className="w-4 h-4 shrink-0 opacity-70" />
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold tracking-wide">
                                                                    {slot.start} - {slot.end}
                                                                </span>
                                                                <span className="text-[10px] font-medium opacity-70 uppercase">Occupied</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            :

                            // timeslot (facility)
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">Daily Timeline</h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <span className="w-2 h-2 rounded-full bg-primary inline-block" /> Selected
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" /> Available
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                            <span className="w-2 h-2 rounded-full bg-rose-300 inline-block" /> Occupied
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {timeSlots.map((slot, i) => (
                                        <div
                                            key={i}
                                            onClick={() => toggleSlot(i)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${slotStyle(slot.status, i)}`}
                                        >
                                            {/* icon */}
                                            {slot.status === 'Occupied' ? (
                                                <Ban className="w-4 h-4 text-rose-400 shrink-0" />
                                            ) : selectedSlots.includes(i) ? (
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                            ) : (
                                                <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                                            )}
                                            <div>
                                                {/* time */}
                                                <p className={`text-xs font-bold tracking-wide
                                                   ${slot.status === 'Occupied' ? 'text-rose-500 dark:text-rose-400' :
                                                        selectedSlots.includes(i) ? 'text-primary' :
                                                            'text-slate-700 dark:text-slate-200'}`}>
                                                    {slot.time}
                                                </p>
                                                {/* status word */}
                                                <p className={`text-[10px] mt-0.5 capitalize
                                                   ${slot.status === 'Occupied' ? 'text-rose-400 uppercase' :
                                                        selectedSlots.includes(i) ? 'text-primary/70 uppercase' :
                                                            'text-slate-400 uppercase'}`}>
                                                    {selectedSlots.includes(i) && slot.status !== 'Occupied' ? 'Selected' : slot.status}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>}
                </div>

                {/* Footer */}
                {(facility.Type === "Classroom" || facility.Type === "Lab") ? null :
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-500">Total Booking Cost</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                RM {facility.Name === "Gym" ? "5/day" : "5/hour"} <span className="text-sm font-normal text-slate-400"></span>
                            </p>
                        </div>
                        <button
                            className="cursor-pointer px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all text-sm flex items-center gap-2"
                            disabled={isBooking}
                            onClick={() => handleBooking()}
                        >
                            <CalendarDays className="w-4 h-4" />
                            Book Selected Slot
                        </button>
                    </div>
                }
            </div>
        </div>
    )
}

export default FacilityPopUp