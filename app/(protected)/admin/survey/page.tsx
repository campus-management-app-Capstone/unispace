import type { LucideIcon } from "lucide-react";
import { AlertCircle, ArrowUpRight, Building2, GraduationCap } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Shape of a survey option shown on the admin survey page.
 */
interface SurveyCardItem {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  icon: LucideIcon;
  accentClassName: string;
  iconClassName: string;
}

const surveyCardItems: SurveyCardItem[] = [
  {
    title: "Lecture Evaluation",
    description:
      "Open the lecturer feedback form to review or share the teaching evaluation survey.",
    href: "https://docs.google.com/forms/d/1A2hCqeEti4otCUoTtFAypesVPHcfQtIzG7bBdaOoO9w/edit",
    ctaLabel: "Open lecture evaluation form",
    icon: GraduationCap,
    accentClassName:
      "border-violet-200 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.18),_transparent_58%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(245,243,255,0.96))]",
    iconClassName: "bg-violet-100 text-violet-700",
  },
  {
    title: "Campus Satisfaction",
    description:
      "Open the campus experience form to collect feedback on facilities, services, and student life.",
    href: "https://docs.google.com/forms/d/1q-gUsbyXC_jY4yihDJE9Zya28wC1gSpo8xNk1206pZ8/edit",
    ctaLabel: "Open campus satisfaction form",
    icon: Building2,
    accentClassName:
      "border-emerald-200 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_58%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(236,253,245,0.96))]",
    iconClassName: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Report Issue",
    description:
      "Open the report issue form to report any issues or feedback on the campus.",
    href: "https://docs.google.com/forms/d/e/1FAIpQLSciYhXQ1QI8jd_hVRRGXJafyyClIh_LY20j6rCnSt6h7_S_EQ/viewform?embedded=true%22",
    ctaLabel: "Open report issue form",
    icon: AlertCircle,
    accentClassName:
      "border-rose-200 bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.18),_transparent_58%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(254,242,242,0.96))]",
    iconClassName: "bg-rose-100 text-rose-700",
  },
];

/**
 * Admin survey page that gives quick access to the main feedback Google Forms.
 */
export default function AdminSurveyPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Survey Management
        </span>
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Admin survey center
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Choose a survey below to open the corresponding Google Form for
            lecturer feedback or campus experience feedback.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {surveyCardItems.map((surveyCardItem) => {
          const SurveyIcon = surveyCardItem.icon;

          return (
            <a
              key={surveyCardItem.title}
              href={surveyCardItem.href}
              target="_blank"
              rel="noreferrer"
              className="group block focus-visible:outline-none"
              aria-label={surveyCardItem.ctaLabel}
            >
              <Card
                className={`h-full border transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ${surveyCardItem.accentClassName}`}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${surveyCardItem.iconClassName}`}
                    >
                      <SurveyIcon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">
                      {surveyCardItem.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-slate-600">
                      {surveyCardItem.description}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 group-hover:bg-slate-800">
                    {surveyCardItem.ctaLabel}
                  </div>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>
    </section>
  );
}