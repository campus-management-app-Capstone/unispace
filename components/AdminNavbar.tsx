"use client";

import Link from "next/link";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function AdminNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Course", href: "/admin/course" },
    { label: "Student", href: "/admin/student" },
    { label: "Lecturer", href: "/admin/lecturer" },
    { label: "Facility", href: "/admin/facility" },
    { label: "Survey", href: "/admin/survey" },
    { label: "Announcement", href: "/admin/announcement" },
  ] as const;

  return (
    <header className="relative bg-white border-b border-black">
      <nav className="flex items-center justify-between gap-4 px-4 py-4 flex-nowrap">
        {/* Left: logo  */}
        <Link
          href="/AdminPanel"
          className="shrink-0 text-black font-bold text-lg tracking-tight"
        >
          <Image src="/favicon.ico" alt="logo" width={50} height={50} />
        </Link>

        {/* nav links */}
        <div className="flex items-center gap-8 shrink-0">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-black font-normal text-sm hover:underline"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* hamburger menu + account */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <span className="sr-only">Menu</span>
            <HamburgerIcon />
          </button>
          <UserButton />
        </div>
      </nav>

      {/* burger menu punya dropdown (maye will be more detail) */}
      {menuOpen && (
        <div className="absolute right-4 top-[calc(100%-1px)] bg-white border border-t-0 border-black shadow-md py-2 min-w-[160px] z-10">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 text-black text-sm hover:bg-gray-100"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

/** Hamburger menu icon  */
function HamburgerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="stroke-black"
    >
      <g clipPath="url(#clip0_hamburger_nav)">
        <path
          d="M3 6.00092H21M3 12.0009H21M3 18.0009H21"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_hamburger_nav">
          <rect width="24" height="24" fill="white" transform="translate(0 0.000915527)" />
        </clipPath>
      </defs>
    </svg>
  );
}
