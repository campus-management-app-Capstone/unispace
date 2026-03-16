import React from 'react';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Megaphone,
  School,
  Table2,
  Users,
  Users2,
} from 'lucide-react';

/**
 * Admin Home page displaying quick access cards for core administration modules.
 */
const AdminHomePage = () => {
  /**
   * Card configuration for each admin module on the home page, including icon and target route.
   */
  const adminItems: {
    key: string;
    label: string;
    href: string;
    Icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: 'course', label: 'Course List', href: '/admin/course', Icon: BookOpen },
    { key: 'department', label: 'Department', href: '/admin/course/department', Icon: Building2 },
    { key: 'subject', label: 'Subject', href: '/admin/course/subject', Icon: ClipboardList },
    { key: 'class', label: 'Class', href: '/admin/course/class', Icon: Table2 },
    { key: 'student', label: 'Student', href: '/admin/student', Icon: Users },
    { key: 'lecturer', label: 'Lecturer', href: '/admin/lecturer', Icon: Users2 },
    { key: 'timetable', label: 'Timetable', href: '/admin/timetable', Icon: LayoutDashboard },
    { key: 'facility', label: 'Facility', href: '/admin/facility', Icon: School },
    { key: 'survey', label: 'Survey', href: '/admin/survey', Icon: FileText },
    { key: 'announcement', label: 'Announcement', href: '/announcement', Icon: Megaphone },
    { key: 'admin', label: 'Admin', href: '/admin/adminmanagement', Icon: Activity },
    { key: 'analytics', label: 'Analytics', href: '/admin/analytics', Icon: BarChart3 },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Admin Home</h1>
        <p className="text-sm text-gray-600">
          Manage academic structures, users, timetable, and analytics.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {adminItems.map(({ key, label, href, Icon }) => (
            <Link
              key={key}
              href={href}
              className="flex flex-col items-start gap-3 rounded-xl border border-gray-200 px-3 py-3 transition-colors hover:border-gray-300 hover:bg-gray-50 md:px-4"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-600">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminHomePage;
