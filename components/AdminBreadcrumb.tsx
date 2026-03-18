"use client";

import { Fragment } from "react";
import { useEffect, useMemo, useState } from "react";
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
  const [dynamicLastLabel, setDynamicLastLabel] = useState<string | null>(null);

  const segments = useMemo(
    () =>
      pathname
        .split("/")
        .filter(Boolean)
        .filter((seg) => seg !== "(protected)"),
    [pathname]
  );

  useEffect(() => {
    const loadDynamicCode = async () => {
      setDynamicLastLabel(null);

      const section = segments[1];
      const action = segments[2];
      const entityId = segments[3];

      if (action !== "edit" || !entityId) {
        return;
      }

      try {
        if (section === "student") {
          const response = await fetch(`/api/admin/students/${entityId}`);
          const data = await response.json();

          if (response.ok && data?.student?.StudentCode) {
            setDynamicLastLabel(data.student.StudentCode);
          }
        }

        if (section === "lecturer") {
          const response = await fetch(`/api/admin/lecturers/${entityId}`);
          const data = await response.json();

          if (response.ok && data?.lecturer?.LecturerCode) {
            setDynamicLastLabel(data.lecturer.LecturerCode);
          }
        }

        if (section === "adminmanagement") {
          const response = await fetch(`/api/admin/admins/${entityId}`);
          const data = await response.json();

          if (response.ok && data?.admin?.AdminCode) {
            setDynamicLastLabel(data.admin.AdminCode);
          }
        }
      } catch (error) {
        console.error("Failed to resolve breadcrumb code", error);
      }
    };

    loadDynamicCode();
  }, [segments]);

  const crumbs = segments.map((segment, index) => ({
    label:
      index === segments.length - 1 && dynamicLastLabel
        ? dynamicLastLabel
        : resolveLabel(segment),
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
