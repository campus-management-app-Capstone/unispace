"use client"

import FacilityPopUp from '@/components/FacilityPopUp';
import { Button } from '@base-ui/react';
import { Book, BookOpenText, Dumbbell, Landmark, Link, MonitorCog, NotebookPen, School, Search, Ticket } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const page = () => {

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState(null);

    const [facility, setFacility] = useState({
        "classrooms": [],
        "labs": [],
        "auditoriums": [],
        "studyRooms": [],
        "sports": []
    });


    const fetchFacility = async () => {
        const id = toast.loading("Loading…");

        try {
            const response = await fetch("/api/facility/get");
            const result = await response.json();
            const data = result.data;

            if (response.ok && result.success) {
                console.log(JSON.stringify(data));

                setFacility({
                    classrooms: data.filter(f => f.Type === "Classroom" && !f.Name.startsWith("Auditorium")),

                    labs: data.filter(f => f.Type === "Lab"),

                    auditoriums: data.filter(f => f.Name.startsWith("Auditorium")),

                    studyRooms: data.filter(f => f.Name.startsWith("Study Room")),

                    sports: data.filter(f => f.Type === "Facility" && !f.Name.startsWith("Study Room"))
                });

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
                render: "Failed to load facility.",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchFacility();
    }, [])

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

            <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 backdrop-blur-[1px] z-1"></div>

            {/* main */}
            <div className="relative flex justify-center py-5 px-5 z-10">
                <div className="layout-content-container flex flex-col max-w-[1280px] w-full flex-1">
                    {/* Hero Section & Search */}
                    <div className="flex flex-col gap-4 sm:gap-6 mb-5 sm:mb-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                            <h1 className="text-slate-900 dark:text-slate-100 text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">
                                Campus Facilities
                            </h1>

                            <Button
                                onClick={() => router.push("/facility/mybooking")}
                                variant="secondary"
                                className="cursor-pointer w-fit shrink-0 flex items-center gap-2 font-bold text-sm shadow-sm hover:shadow transition-all"
                            >
                                <Ticket className="w-4 h-4" />
                                <span>My Bookings</span>
                            </Button>
                        </div>
                        {/*
                        <div className="w-full max-w-3xl mt-2 sm:mt-4">
                            <label className="flex flex-col min-w-0 h-12 sm:h-14 w-full group">
                                <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-focus-within:border-primary transition-all">
                                    <div className="text-slate-400 dark:text-slate-500 flex items-center justify-center pl-3 sm:pl-5">
                                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <input
                                        className="form-input flex w-full min-w-0 flex-1 border-none bg-transparent focus:outline-0 focus:ring-0 h-full placeholder:text-slate-500 px-3 sm:px-4 text-sm sm:text-lg font-normal"
                                        placeholder="Search for classroom, labs, or other facilities..."
                                        value=""
                                    />
                                    <div className="flex items-center pr-2 sm:pr-3">
                                        <button className="bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-primary/20 transition-colors cursor-pointer whitespace-nowrap">
                                            Find
                                        </button>
                                    </div>
                                </div>
                            </label>
                        </div>
                        */}
                    </div>

                    {/* Academic Facilities Section */}
                    <section className="mb-10 sm:mb-16">
                        <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <School className="w-5 h-5 sm:w-6 sm:h-6" />
                                <h2 className="text-slate-900 dark:text-slate-100 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                                    Academic Facilities
                                </h2>
                            </div>
                        </div>

                        <div className="flex flex-col w-full gap-6 sm:gap-8">

                            {/* Classrooms */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
                                    <NotebookPen />
                                    Classrooms
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                                    {facility.classrooms.map((room) => (
                                        <div
                                            key={room.FacilityID}
                                            className="h-20 sm:h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm hover:border-primary transition-colors cursor-pointer"
                                            onClick={() => {
                                                setIsSelecting(true)
                                                setSelectedFacility(room);
                                            }}
                                        >
                                            <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100">{room.Name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Labs */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
                                    <MonitorCog />Labs
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                                    {facility.labs.map((room) => (
                                        <div
                                            key={room.FacilityID}
                                            className="h-20 sm:h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm hover:border-primary transition-colors cursor-pointer px-2"
                                            onClick={() => {
                                                setIsSelecting(true)
                                                setSelectedFacility(room);
                                            }}
                                        >
                                            <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 text-center leading-tight">{room.Name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Auditorium */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
                                    <Landmark />Auditorium
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                                    {facility.auditoriums.map((room) => (
                                        <div
                                            key={room.FacilityID}
                                            className="h-20 sm:h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm hover:border-primary transition-colors cursor-pointer px-2"
                                            onClick={() => {
                                                setIsSelecting(true)
                                                setSelectedFacility(room);
                                            }}
                                        >
                                            <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 text-center leading-tight">{room.Name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Study Rooms */}
                            <div className="flex flex-col gap-3">
                                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
                                    <BookOpenText />Study Rooms
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                                    {facility.studyRooms.map((room) => (
                                        <div
                                            key={room.FacilityID}
                                            className="h-20 sm:h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm hover:border-primary transition-colors cursor-pointer px-2"
                                            onClick={() => {
                                                setIsSelecting(true)
                                                setSelectedFacility(room);
                                            }}
                                        >
                                            <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 text-center leading-tight">{room.Name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Sports Facilities Section */}
                    <section className="mb-10 sm:mb-12">
                        <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
                                <h2 className="text-slate-900 dark:text-slate-100 text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                                    Sports Facilities
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:col-span-full gap-4 sm:gap-6 lg:gap-8">
                            <div className="flex flex-col gap-3">

                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
                                    {facility.sports.map((room) => (
                                        <div
                                            key={room.FacilityID}
                                            className="min-h-[5rem] sm:min-h-[6rem] p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm hover:border-primary transition-colors cursor-pointer"
                                            onClick={() => {
                                                setIsSelecting(true)
                                                setSelectedFacility(room);
                                            }}
                                        >
                                            <span className="text-sm sm:text-lg font-bold text-slate-900 dark:text-slate-100 text-center leading-tight">
                                                {room.Name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                            </div>
                        </div>
                    </section>
                </div>
            </div>
            {
                isSelecting ?
                    <FacilityPopUp
                        facility={selectedFacility}
                        onClose={() => setIsSelecting(false)}
                    />
                    : null
            }

        </main >
    )
}

export default page