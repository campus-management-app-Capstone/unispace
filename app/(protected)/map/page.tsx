"use client";

import React from 'react'
import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { rawMap, x, p, sp, e, pa, pb, pc, pd, f, c, o } from "@/data/map";
import Image from "next/image";
import { navigationLogic } from "@/lib/navigation";


// Color
const getCellColor = (cell, above, below, left, right) => {
  // empty
  if (cell === e) return "bg-transparent";
  // borders
  if (cell === x) return "bg-black";
  // paths, sidepath, entrance
  if (cell === p || cell === sp || cell.startsWith("E")) {
    return "bg-gray-200";
  }

  // parking
  const parkingCells = [pa, pb, pc, pd];
  if (parkingCells.includes(cell) || parkingCells.includes(above) || parkingCells.includes(below) || parkingCells.includes(left) || parkingCells.includes(right)) return "bg-gray-400";

  // building
  if (cell === f || above === f || below === f || left === f || right === f) return "bg-blue-200"; // Facility
  if (cell === c || above === c || below === c || left === c || right === c) return "bg-orange-200"; // Classroom
  if (cell === o || above === o || below === o || left === o || right === o) return "bg-purple-200"; // Office

  // Default
  return "bg-green-200 text-xs font-bold text-center flex items-center justify-center border border-green-300";
};

// navigation
// const [path, setPath] = useState([]);

// const navigate = () => {

//   const startNode = { x: 1, y: 1, z: 1 };
//   const endNode = { x: 20, y: 15, z: 1 };


//   const result = navigationLogic(startNode, endNode);


//   // if (result) setPath(result);
// };


// Main
const page = () => {
  const [currentFloor, setCurrentFloor] = useState(1); // Default G

  const notRender = ["Main Entrance", "ATM", "Stair", "Lift", "Toilet", "facility", "classroom", "office", "border", "path", "sidepath", "parkingA", "parkingB", "parkingC", "parkingD", "empty"];

  // Map Array Index to Floor Name
  const floorLabels = ["B1", "G", "L1", "L2", "L3", "L4", "L5"];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center ">

      {/* small background design */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-400/30 blur-[80px] mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-400/30 blur-[100px] mix-blend-multiply"></div>
      <div className="absolute bottom-1 right-0 w-[400px] h-[400px] rounded-full bg-pink-300/30 blur-[80px] mix-blend-multiply opacity-70"></div>

      {/* search bar */}
      <div className="flex flex-col gap-3 w-[90%] mb-6">
        {/* 1. Start Point Input */}
        <div className="relative group">
          {/* Icon: Hollow Blue Circle */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[3px] border-blue-500 bg-transparent z-10"></div>

          {/* Connecting Line (Dotted) */}
          <div className="absolute left-[1.1rem] top-8 h-6 border-l-2 border-dotted border-gray-300"></div>

          <input
            type="text"
            placeholder="Starting Point (e.g. Lobby)"
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          // onChange={(e) => setStart(e.target.value)} 
          />
        </div>

        {/* 2. Destination Input */}
        <div className="relative group">
          {/* Icon: Red Location Pin */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>

          <input
            type="text"
            placeholder="Where to? (e.g. Library)"
            className="w-full pl-9 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          // onChange={(e) => setEnd(e.target.value)}
          />
        </div>

        {/* 3. Search */}
        <button
          className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
        // onClick={handleSearch}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          Find Path
        </button>

      </div>

      {/* map container */}
      <div className="flex-grow relative bg-gray-50 overflow-hidden cursor-move w-full h-[600px] shadow-lg">
        <div className="absolute top-1/100 left-4 z-10 w-15 h-15 rounded-full bg-white/40 backdrop-blur-md shadow-sm p-2 flex items-center justify-center">
          <Image
            src={`/icons/Compass.png`}  // Path starts from 'public' folder
            alt="Compass"
            fill                   // This makes it fill the parent container (24px)
            className="object-contain " // Keeps aspect ratio perfect
          />
        </div>

        {/* Floor Select */}
        {/* <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 bg-white p-2 rounded-lg shadow">
          {rawMap.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFloor(index)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${currentFloor === index
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {floorLabels[index] || `Floor ${index}`}
            </button>
          ))}
        </div> */}

        <div className="absolute top-1/5 left-4 z-10 flex flex-col items-center gap-2 bg-white p-2 rounded-lg shadow-md border border-gray-200 w-16">

          {/* Up Button */}
          <button
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label="Up"
            onClick={() => setCurrentFloor((prev) => Math.min(6, prev + 1))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>

          {/* Floor */}
          <span className="text-sm font-bold text-gray-800 select-none py-1">
            {floorLabels[currentFloor]}
          </span>

          {/* Down Button */}
          <button
            className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label="Down"
            onClick={() => setCurrentFloor((prev) => Math.max(0, prev - 1))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

        </div>

        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={4}
          centerOnInit={true}
          limitToBounds={false} // Allows dragging freely
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              {/* Zoom Buttons for Desktop */}
              <div className="absolute bottom-10 right-4 z-20 flex flex-col gap-2">
                <button onClick={() => zoomIn()} className="relative bg-white p-2 rounded shadow text-xl">+</button>
                <button onClick={() => zoomOut()} className="relative bg-white p-2 rounded shadow text-xl">-</button>
                <button onClick={() => resetTransform()} className="relative bg-white p-2 rounded shadow text-xs">Reset</button>
              </div>

              <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                {/* render map */}
                <div className="flex flex-col bg-white border border-gray-300 shadow-xl p-1">
                  {rawMap[currentFloor].map((row, rowIndex) => (
                    <div key={rowIndex} className="flex">
                      {row.map((cell, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`relative w-6 h-6 flex-shrink-0 ${getCellColor(cell, rawMap[currentFloor]?.[rowIndex - 1]?.[colIndex], rawMap[currentFloor]?.[rowIndex + 1]?.[colIndex], rawMap[currentFloor]?.[rowIndex]?.[colIndex - 1], rawMap[currentFloor]?.[rowIndex]?.[colIndex + 1])}`}
                          title={`${cell} (${colIndex},${rowIndex})`} // for checking
                        >
                          {/* render name */}
                          {
                            !cell.startsWith("E") && !notRender.includes(cell) ? (
                              <span className={`text-[20px] font-bold text-gray-900 z-10 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
                                {cell}
                              </span>
                            ) : null
                          }

                          {
                            cell === "Lift" || cell === "Stair" || cell === "Toilet" || cell === "ATM" || cell === "Main Entrance" ? (
                              <div className="relative w-full h-full p-1">
                                <Image
                                  src={`/icons/${cell}.svg`}  // Path starts from 'public' folder
                                  alt={cell}
                                  fill                   // This makes it fill the parent container (24px)
                                  className="object-contain" // Keeps aspect ratio perfect
                                />
                              </div>
                            ) : null
                          }
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}

export default page
