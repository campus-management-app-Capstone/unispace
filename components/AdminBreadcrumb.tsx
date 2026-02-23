"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/** mapping the routing */
const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  course: "Course",
  courselist: "Course List",
  department: "Department",
  subject: "Subject",
  syllabus: "Syllabus",
  class: "Class",
  classregistration: "Class Registration",
  student: "Student",
  lecturer: "Lecturer",
  facility: "Facility",
  survey: "Survey",
  announcement: "Announcement",
};


function resolveLabel(segment: string): string {
  return (
    SEGMENT_LABELS[segment.toLowerCase()] ??
    segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

/**
 * reads the current pathname and builds a trail from /admin onwards.
 */
export default function AdminBreadcrumb() {
  const pathname = usePathname();

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((seg) => seg !== "(protected)");

  const crumbs = segments.map((segment, index) => ({
    label: resolveLabel(segment),
    href: "/" + segments.slice(0, index + 1).join("/"),
  }));

  if (crumbs.length <= 1) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin" className="flex items-center gap-1">
              <Home className="size-3.5" />
              <span>Admin</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* afterward crumbs after the "admin" root */}
        {crumbs.slice(1).map((crumb, index) => {
          const isLast = index === crumbs.length - 2;

          return (
            <Fragment key={crumb.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
