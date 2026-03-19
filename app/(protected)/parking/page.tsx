"use client"

import ParkingTimer from '@/components/ParkingTimer'
import { getParkingCost } from '@/lib/getParkingCost'
import VehiclePopup from '@/components/VehiclePopup'
import { Delete, Edit, LogOut, ParkingCircle, Plus, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import ParkingCost from '@/components/ParkingCost'
import EditVehicle from '@/components/EditVehicle'

const page = () => {

    const [carInfo, setCarInfo] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [carparkAvailability, setCarparkAvailability] = useState(0);
    const maxCarparkCapacity = 400;
    const [isEndingSession, setIsEndingSession] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // get car park avalability
    const fetchAvailability = async () => {
        try {
            const response = await fetch("/api/parking/get");
            const result = await response.json();

            if (response.ok && result.success) {
                setCarparkAvailability(maxCarparkCapacity - result.count);
            } else {
                console.log("Failed to fetch car park availability");
            }
        } catch (error) {
            console.error("Fetch crashed:", error);
        }
    }

    // make it real time
    useEffect(() => {
        fetchAvailability();

        const intervalId = setInterval(() => {
            fetchAvailability();
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchCarData = async () => {
        const id = toast.loading("Loading…");
        try {

            const response = await fetch("/api/car/get");
            const result = await response.json();

            if (response.ok && result.success) {
                // Sort cars by most recent parking session start time in descending
                // return ans bigger than 0 = b is at front, smaller than 0 means a is at front 
                const sortedCars = result.data.sort((a, b) => {
                    // check if got start time
                    const aTime = a.ParkingSession?.[0]?.Start ? new Date(a.ParkingSession[0].Start).getTime() : 0;
                    const bTime = b.ParkingSession?.[0]?.Start ? new Date(b.ParkingSession[0].Start).getTime() : 0;
                    return bTime - aTime; // to descending order, if b larger, it need to put bfr - , if a bigger, it need to put afr -
                });
                setCarInfo(sortedCars);
                toast.update(id, {
                    render: "Loading completed",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
            } else {
                toast.update(id, {
                    render: (result.error || "Failed to load details."),
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
            }
        } catch (err) {
            console.error("Fetch crashed:", err);
            toast.update(id, {
                render: "Failed to load details.",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
        }
        setIsLoading(false);
    }

    useEffect(() => {
        fetchCarData();
    }
        , []);

    console.log("carInfo: " + JSON.stringify(carInfo));

    const parkPercent = Math.floor((carparkAvailability / maxCarparkCapacity) * 100);
    // const dynamicOffset = 100 - parkPercent;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleDelete = async (car) => {
        const isConfirmed = window.confirm("Are you sure you want to remove this vehicle?");
        if (!isConfirmed) return;

        const activeSession = car.ParkingSession?.[0];
        if (activeSession) {
            toast.error("You car is currently on park!");
            return;
        }

        setIsDeleting(true);
        const id = toast.loading("Deleting ...");
        try {
            const response = await fetch("/api/car/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    RegisteredCarID: car.RegisteredCarID
                })
            });
            const result = await response.json();

            if (response.ok && result.success) {
                toast.update(id, {
                    render: "Delete completed",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
                fetchCarData();
            } else {
                console.log(result.error || "Failed to delete vehicle.");
                toast.update(id, {
                    render: "Failed to delete vehicle",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
            }
        } catch (error) {
            console.error("Fetch crashed:", error);
            toast.update(id, {
                render: "Network error occurred",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
        } finally {
            setIsDeleting(false);
        }
    }

    const handleEndSession = async (car) => {
        setIsEndingSession(true);
        // check is parking?
        const activeSession = car.ParkingSession?.[0];
        if (!activeSession) return;

        // call wallet to process transaction
        // call endsession to insert end
        const id = toast.loading("Processing Payment ...");

        // process payment
        const cost = getParkingCost(activeSession.Start);
        if (cost !== 0) {
            try {

                const response = await fetch("/api/wallet", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: cost,
                        type: "Payment",
                        for: "Parking",
                    })
                })
                const result = await response.json();

                if (!response.ok && result.error) {
                    console.error("Failed to Pay:", result.error);
                    toast.update(id, {
                        render: "Failed to Pay. You might not have enough balance.",
                        type: "error",
                        isLoading: false,
                        autoClose: 2000,
                    });
                    setIsEndingSession(false);
                    return;
                }

            } catch (error) {
                console.error("Failed to Pay:", error);
                toast.update(id, {
                    render: "Failed to Pay. You might not have enough balance.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
                setIsEndingSession(false);
                return;
            }
        }

        // end session after process payment
        try {
            const response = await fetch("/api/parking/endsession", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    RegisteredCarID: car.RegisteredCarID,
                    ParkingSessionID: activeSession.ParkingSessionID
                })
            });
            const result = await response.json();

            if (response.ok && result.success) {
                toast.update(id, {
                    render: "Parking Paid.",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
                fetchCarData();
            } else {
                console.log(result.error || "Failed to end parking session.");
                toast.update(id, {
                    render: "Failed to end parking session.",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
            }
        } catch (error) {
            console.error("End Session crashed:", error);
            toast.update(id, {
                render: "Network error occurred",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
        } finally {
            setIsEndingSession(false);
        }
    }

    const handleParkNow = async (car) => {
        if (carparkAvailability <= 0) {
            toast.error("Parking Slot Full!");
            return
        }

        const id = toast.loading("Parking ...");
        try {
            const response = await fetch("/api/parking/parknow", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    RegisteredCarID: car.RegisteredCarID
                })
            });
            const result = await response.json();

            if (response.ok && result.success) {
                toast.update(id, {
                    render: "Parked",
                    type: "success",
                    isLoading: false,
                    autoClose: 2000,
                });
                fetchCarData();
            } else {
                console.log(result.error || "Failed to Park.");
                toast.update(id, {
                    render: "Failed to Park",
                    type: "error",
                    isLoading: false,
                    autoClose: 2000,
                });
            }
        } catch (error) {
            console.error("Fetch crashed:", error);
            toast.update(id, {
                render: "Network error occurred",
                type: "error",
                isLoading: false,
                autoClose: 2000,
            });
        }
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div
                className="fixed inset-0 z-1 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/parking.jpg')" }}
            />

            <div className="fixed inset-0 z-1 bg-white/70 dark:bg-slate-950/70 backdrop-blur-[1px]" />

            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 z-30">

                <section className="mb-10">
                    <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-8 text-white shadow-xl shadow-primary/20">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-2 text-center md:text-left">
                                <h1 className="text-3xl font-extrabold tracking-tight">Real-time Parking Status</h1>
                            </div>
                            <div className="flex items-center gap-8 bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                                <div className="relative size-24 flex items-center justify-center">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                        <circle className="stroke-white/20" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                                        <circle className="stroke-white" cx="18" cy="18" fill="none" r="16" strokeDasharray="100" strokeDashoffset={parkPercent} strokeWidth="3"></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-bold">{parkPercent}%</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-4xl font-black">{carparkAvailability}</span>
                                    <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">Available Slots</span>
                                    <span className="text-blue-200/70 text-xs mt-1">out of 400 total capacity</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <section>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">My Registered Vehicles</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div className="w-full h-full">
                            <VehiclePopup onVehicleAdded={() => fetchCarData()} />
                        </div>
                        {
                            carInfo.length !== 0 ?

                                carInfo.map((car) => {
                                    const activeSession = car.ParkingSession?.[0];
                                    let cost;
                                    if (activeSession) {

                                    }
                                    return (
                                        <div key={car.RegisteredCarID} className="w-full min-h-[285px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                                            <div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{car.VehicleMade + " " + car.VehicleModel}</h4>
                                                        <p className="text-slate-500 text-sm font-mono tracking-widest uppercase">{car.Carplate}</p>
                                                    </div>
                                                </div>

                                                {activeSession ?
                                                    <div className="space-y-4 my-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">

                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-500 text-sm">Elapsed Time</span>
                                                            <ParkingTimer startTime={activeSession.Start} />
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-slate-500 text-sm">Current Cost</span>
                                                            <ParkingCost startTime={activeSession.Start} />
                                                        </div>
                                                    </div>
                                                    :
                                                    <div className="flex flex-col min-h-[100px] space-y-4 my-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg items-center justify-center">
                                                        <p className="text-slate-500 text-sm">Not parked</p>
                                                    </div>
                                                }

                                            </div>
                                            <div className="flex gap-2">
                                                {activeSession ?
                                                    <button
                                                        disabled={isEndingSession}
                                                        className="cursor-pointer flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-900 dark:text-slate-100 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                                                        onClick={() => handleEndSession(car)}
                                                    >
                                                        <LogOut /> End Session
                                                    </button> :
                                                    <button
                                                        disabled={carparkAvailability <= 0}
                                                        className={`flex-1 font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg 
                                                                ${carparkAvailability <= 0
                                                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' // Full look
                                                                : 'bg-primary hover:bg-blue-600 text-white cursor-pointer shadow-primary/20' // Normal look
                                                            }`
                                                        } onClick={() => handleParkNow(car)}
                                                    >
                                                        <ParkingCircle />
                                                        {carparkAvailability <= 0 ? "Lot Full" : "Park Now"}
                                                    </button>
                                                }
                                                <EditVehicle onVehicleEdited={() => fetchCarData()} car={car} />

                                                <button
                                                    disabled={isDeleting}
                                                    className="px-3 bg-red-100 dark:bg-red-800 text-red-500 hover:bg-red-200 rounded-lg transition-colors cursor-pointer"
                                                    onClick={() => handleDelete(car)}
                                                >
                                                    <Trash />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })

                                : null
                        }

                    </div>
                </section>
            </main>
        </div>
    )
}

export default page
