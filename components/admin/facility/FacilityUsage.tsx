"use client";

type Props = {
  mostBooked: string;
  totalBookings: number;
};

export default function FacilityUsage({ mostBooked, totalBookings }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow-md p-5 border">
        <p className="text-sm text-gray-500">Most Booked Facility</p>
        <h2 className="text-2xl font-bold mt-2">{mostBooked || "N/A"}</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 border">
        <p className="text-sm text-gray-500">Total Bookings</p>
        <h2 className="text-2xl font-bold mt-2">{totalBookings}</h2>
      </div>
    </div>
  );
}