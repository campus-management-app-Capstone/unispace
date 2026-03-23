"use client";

type Props = {
  totalCars: number;
  averageDuration: number; // in hours
  peakHour: string;
};

export default function ParkingUsage({ totalCars, averageDuration, peakHour }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-2xl shadow-md p-5 border">
        <p className="text-sm text-gray-500">Total Registered Cars</p>
        <h2 className="text-2xl font-bold mt-2">{totalCars}</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 border">
        <p className="text-sm text-gray-500">Average Parking Duration</p>
        <h2 className="text-2xl font-bold mt-2">{averageDuration.toFixed(2)} hrs</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 border">
        <p className="text-sm text-gray-500">Peak Parking Hour</p>
        <h2 className="text-2xl font-bold mt-2">{peakHour}</h2>
      </div>
    </div>
  );
}