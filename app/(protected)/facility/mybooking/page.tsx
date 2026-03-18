"use client"

import { CalendarDays, Clock, MapPin, Ticket, CheckCircle2, History } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const page = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  
  // filter option
  const [activeFilter, setActiveFilter] = useState("All");
  const filterOptions = ["All", "Upcoming", "Active Now", "Completed"];

  const fetchBookings = async () => {
    const id = toast.loading("Loading...");

    try {
      const response = await fetch("/api/booking/get");
      const result = await response.json();
      const data = result.data;

      if (response.ok && result.success) {
        setBookings(data);
        toast.update(id, {
          render: "Loading Complete.",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(id, {
          render: (result.error || "Failed to load facility."),
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    } catch (error) {
      console.error("Fetch crashed:", error);
      toast.update(id, {
        render: "Failed to load bookings.",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchBookings();
  }, [])

  // format date and time
  const formatDateTime = (startStr, endStr, facilityName) => {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    const date = startDate.toLocaleDateString('en-MY', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });

    // gym have full day entry for RM 5 
    if (facilityName === "Gym") {
      return { date, time: "Full Day Entry" };
    }

    const formatTime = (d) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false});
    return { date, time: `${formatTime(startDate)} - ${formatTime(endDate)}` };
  };

  // determine status based on current time
  const getBookingStatus = (startStr, endStr) => {
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (now > end) {
      return { label: "Completed", color: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700", icon: History };
    }
    if (now >= start && now <= end) {
      return { label: "Active Now", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50", icon: CheckCircle2 };
    }
    return { label: "Upcoming", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/50", icon: Ticket };
  };

  // filter the booking 
  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter === "All") return true;
    
    // Calculate status
    const statusInfo = getBookingStatus(booking.StartTime, booking.EndTime);
    
    // return matched booking
    return statusInfo.label === activeFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <div
        className="fixed inset-0 z-1 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/facilitybg.jpg')" }}
      />

      <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md z-1"></div>

      {/* main */}
      <div className="relative flex justify-center py-5 px-5 z-10 min-h-screen">
        <div className="layout-content-container flex flex-col max-w-[1280px] w-full flex-1">
          
          {/* Header */}
          <div className="flex flex-col gap-4 sm:gap-6 mb-6 mt-4">
            <h1 className="text-slate-900 dark:text-slate-100 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">
              My Bookings
            </h1>
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex gap-2.5 overflow-x-auto pb-4 mb-4 scrollbar-hide">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeFilter === opt
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-105 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* bookings */}
          {filteredBookings.length === 0 ? (
            // no bookings
            <div className="flex flex-col items-center justify-center py-20 px-4 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
              <Ticket className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">No Bookings Found</h3>
              <p className="text-slate-500 dark:text-slate-400 text-center">
                {activeFilter === "All" 
                  ? "You haven't booked any campus facilities yet." 
                  : `You have no ${activeFilter.toLowerCase()} bookings.`}
              </p>
            </div>
          ) : (
            // have bookings
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-20">
              {filteredBookings.map((booking, index) => {
                const { date, time } = formatDateTime(booking.StartTime, booking.EndTime, booking.Facility.Name);
                const status = getBookingStatus(booking.StartTime, booking.EndTime);
                const StatusIcon = status.icon;

                return (
                  <div 
                    key={index} 
                    className="group bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200/60 dark:border-slate-800/60 flex flex-col relative overflow-hidden"
                  >
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`px-3 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </div>
                    </div>

                    {/* Facility Name */}
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-start gap-3">
                      <MapPin className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                      {booking.Facility.Name}
                    </h3>

                    {/* Date & Time Info */}
                    <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-semibold">{date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="text-sm font-semibold">{time}</span>
                      </div>
                    </div>
                    
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}

export default page;