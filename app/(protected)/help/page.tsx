"use client";

import Link from "next/link";
import { Bubble } from "@typebot.io/react";
import { useMemo, useState, type ReactElement } from "react";
import { useUser } from "@clerk/nextjs";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

const iconClass = "help-icon h-5 w-5";

const iconMap: Record<string, string> = {
  map: "/help-icons/map.svg",
  building: "/help-icons/building.svg",
  calendar: "/help-icons/calendar.svg",
  wallet: "/help-icons/wallet.svg",
  car: "/help-icons/car.svg",
  clipboard: "/help-icons/clipboard.svg",
};

const renderIcon = (key: keyof typeof iconMap): ReactElement => (
  <img
    src={iconMap[key]}
    className={iconClass}
    alt=""
    aria-hidden
    width={20}
    height={20}
    style={{ display: "block", visibility: "visible", opacity: 1 }}
  />
);

/* ---------- QUICK LINKS ---------- */

const quickLinks = [
  {
    label: "Campus Map",
    href: "/map",
    description: "Find paths between locations and switch floors.",
    iconKey: "map",
  },
  {
    label: "Facilities",
    href: "/facility",
    description: "Book study rooms, sports facilities, and more.",
    iconKey: "building",
  },
  {
    label: "My Timetable",
    href: "/student/timetable",
    description: "Check your classes by day.",
    iconKey: "calendar",
  },
  {
    label: "Wallet",
    href: "/wallet",
    description: "Top up and review transactions.",
    iconKey: "wallet",
  },
  {
    label: "Parking",
    href: "/parking",
    description: "Manage vehicles and sessions.",
    iconKey: "car",
  },
  {
    label: "Attendance",
    href: "/student/attendance",
    description: "View and mark attendance for your classes.",
    iconKey: "clipboard",
  },
] as const;

/* ---------- HELP SECTIONS ---------- */

const helpSections = [
  {
    title: "Map & Navigation",
    summary:
      "Find routes between campus locations and switch floors.",
    steps: [
      "Pick a start point and destination.",
      "Tap 'Find Path' to generate the route.",
      "Switch floors with B1, G, L1-L5.",
      "Zoom and pan to follow the path.",
    ],
    tips: [
      "Toilets, lifts, and stairs can be destinations but cannot be starting points.",
      "Use the autocomplete list if a place is not found.",
    ],
    iconKey: "map",
  },
  {
    title: "Facility Booking",
    summary:
      "Reserve study rooms, sports courts, and other facilities.",
    steps: [
      "Pick a facility card in Facilities.",
      "Choose a date and slot (Gym is date-only).",
      "Confirm payment from your wallet.",
      "Open 'My Bookings' to review.",
    ],
    tips: [
      "Gym is RM5/day. Other bookable facilities are RM5/hour.",
    ],
    iconKey: "building",
  },
  {
    title: "Wallet & Payments",
    summary:
      "Top up and pay for bookings or parking.",
    steps: [
      "Tap Top Up in Wallet.",
      "Complete payment and verification.",
      "Check balance and transactions.",
    ],
    tips: [
      "Use month/year filters to find older transactions faster.",
      "If a payment fails, return to Wallet and try again.",
    ],
    iconKey: "wallet",
  },
  {
    title: "Parking",
    summary:
      "Check availability, manage vehicles, and pay on exit.",
    steps: [
      "Add a vehicle with plate, make, and model.",
      "Start a session when you park.",
      "End the session to calculate and pay.",
    ],
    tips: [
      "Vehicles with active sessions cannot be deleted.",
      "Availability updates in real time on the Parking page.",
    ],
    iconKey: "car",
  },
  {
    title: "Timetable",
    summary:
      "View classes by day with time and venue.",
    steps: [
      "Open My Timetable.",
      "Select a weekday.",
      "Check each card for time and venue.",
    ],
    tips: [
      "If you see no classes, you may not be enrolled yet.",
    ],
    iconKey: "calendar",
  },
  {
    title: "Attendance",
    summary:
      "View overall attendance and mark with a code.",
    steps: [
      "Open Attendance to see overall status by class.",
      "Tap 'Sign in Attendance'.",
      "Enter the attendance code provided by your lecturer.",
    ],
    tips: [
      "If your code is rejected, recheck the spelling and try again.",
    ],
    iconKey: "clipboard",
  },
] as const;

/* ---------- FAQ ---------- */

const faqItems = [
  {
    question: "The map can't find my location.",
    answer: "Pick from the autocomplete list or check the spelling.",
  },
  {
    question: "My facility booking failed.",
    answer: "Check wallet balance and pick an available slot, then retry.",
  },
  {
    question: "I can't delete my vehicle.",
    answer: "End the active session first, then delete the vehicle.",
  },
  {
    question: "My timetable is empty.",
    answer:
      "You may not be enrolled yet. Check again after enrollment is confirmed.",
  },
] as const;

/* ---------- COMPONENT ---------- */

export default function HelpPage() {
  const [isBotOpen, setIsBotOpen] = useState(true);
  const { user, isLoaded } = useUser();

  const studentName = useMemo(() => {
    if (!user) return undefined;

    return (
      `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
      user.firstName ||
      user.username ||
      undefined
    );
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="relative">
        <div className="relative mx-auto max-w-6xl px-6 py-12 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
              <HelpCircle className="h-4 w-4" />
              UniSpace Help Centre
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Get help with maps, bookings, attendance, and more
            </h1>

            <p className="max-w-2xl text-base text-slate-600">
              Quick links and short guides for the student features you use most.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map(({ label, href, description, iconKey }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                    {renderIcon(iconKey)}
                  </span>

                  <div>
                    <p className="font-semibold">{label}</p>
                    <p className="text-sm text-slate-600">{description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* HELP SECTIONS */}
      <div className="mx-auto max-w-6xl px-6 pb-16 space-y-10">
        <section className="grid gap-6 lg:grid-cols-2">
          {helpSections.map(({ title, summary, steps, tips, iconKey }) => (
            <div
              key={title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                  {renderIcon(iconKey)}
                </span>

                <div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="text-sm text-slate-600">{summary}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Steps
                  </div>

                  <div className="mt-2 space-y-2 text-sm text-slate-700">
                    {steps.map((step, index) => (
                      <div key={step} className="flex gap-2">
                        <span className="text-xs font-bold text-slate-400">
                          {index + 1}
                        </span>
                        <p>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                    <Info className="h-4 w-4 text-amber-500" />
                    Tips
                  </div>

                  <div className="mt-2 space-y-2 text-sm text-slate-700">
                    {tips.map((tip) => (
                      <p key={tip}>{tip}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* TROUBLESHOOTING */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Troubleshooting</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {faqItems.map(({ question, answer }) => (
              <div
                key={question}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />

                  <div>
                    <p className="text-sm font-semibold">{question}</p>
                    <p className="mt-2 text-sm text-slate-600">{answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CHATBOT INFO */}
        <section className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-sm">
          <h2 className="text-xl font-bold">Need guided help?</h2>

          <p className="mt-2 text-sm text-slate-300">
            Use the chatbot in the bottom-right corner to navigate help topics
            step by step.
          </p>
        </section>
      </div>

      {/* TYPEBOT */}
      {isLoaded && (
        <Bubble
          key={studentName ?? "guest"}
          typebot="unispace-help"
          apiHost="https://typebot.io"
          theme={{ button: { backgroundColor: "#1D1D1D" } }}
          isOpen={isBotOpen}
          onOpen={() => setIsBotOpen(true)}
          onClose={() => setIsBotOpen(false)}
          prefilledVariables={studentName ? { name: studentName } : undefined}
        />
      )}
    </div>
  );
}
