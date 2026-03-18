import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import WelcomeToast from '@/components/WelcomeToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClerkSupabaseClient } from '@/lib/supabase';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Calendar, Megaphone } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface HomeProfile {
  role: 'student' | 'lecturer';
  displayName: string;
  avatarUrl: string | null;
  secondaryLine: string;
}

interface AnnouncementSummaryRow {
  AnnouncementID: string;
  Title: string;
  CreatedAt: string;
  Target: string;
}

/** Build a friendly name for the Clerk user. */
function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  return (
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    'User'
  );
}

/** Format an ISO date to a compact, readable label. */
function formatAnnouncementDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-SG', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

/** Fetch student/lecturer profile details shown on `/home`. */
async function getHomeProfile(): Promise<HomeProfile> {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const role = (sessionClaims?.metadata?.role as string | undefined) ?? (user?.publicMetadata?.role as string | undefined);
  if (!role || (role !== 'student' && role !== 'lecturer')) redirect('/home');

  const supabase = await createClerkSupabaseClient();
  const displayName = getDisplayName(user);
  const avatarUrl = user?.imageUrl ?? null;

  if (role === 'student') {
    const { data: student } = await supabase
      .from('Student')
      .select('StudentID, StudentCode')
      .eq('UserID', userId)
      .maybeSingle();

    const studentId = student?.StudentID ?? '';
    const studentCode = student?.StudentCode ?? '—';

    const { data: enrollment } = await supabase
      .from('Enrollment')
      .select('Intake')
      .eq('StudentID', studentId || '__missing__')
      .order('Intake', { ascending: false })
      .limit(1)
      .maybeSingle();

    const intake = enrollment?.Intake ?? '—';

    return {
      role: 'student',
      displayName,
      avatarUrl,
      secondaryLine: `${studentCode} | ${intake}`,
    };
  }

  const { data: lecturer } = await supabase
    .from('Lecturer')
    .select('LecturerID, LecturerCode')
    .eq('UserID', userId)
    .maybeSingle();

  const lecturerCode = lecturer?.LecturerCode ?? lecturer?.LecturerID ?? '—';

  return {
    role: 'lecturer',
    displayName,
    avatarUrl,
    secondaryLine: lecturerCode,
  };
}

/** Fetch the most recent announcements visible to the user (student/lecturer). */
async function getRecentAnnouncements(limit: number): Promise<AnnouncementSummaryRow[]> {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string | undefined) ?? undefined;
  if (!role || !['student', 'lecturer', 'admin'].includes(role)) return [];

  const supabase = await createClerkSupabaseClient();

  let classIds: string[] = [];

  if (role === 'student') {
    const { data: student } = await supabase
      .from('Student')
      .select('StudentID')
      .eq('UserID', userId)
      .maybeSingle();

    if (student?.StudentID) {
      const { data: enrollments } = await supabase
        .from('Enrollment')
        .select('EnrollmentID')
        .eq('StudentID', student.StudentID);

      const enrollmentIds = (enrollments ?? []).map((e) => e.EnrollmentID).filter(Boolean);
      if (enrollmentIds.length > 0) {
        const { data: regs } = await supabase
          .from('ClassRegistration')
          .select('ClassID')
          .in('EnrollmentID', enrollmentIds);

        classIds = Array.from(new Set((regs ?? []).map((r) => r.ClassID).filter(Boolean))) as string[];
      }
    }
  }

  if (role === 'lecturer') {
    const { data: lecturer } = await supabase
      .from('Lecturer')
      .select('LecturerID')
      .eq('UserID', userId)
      .maybeSingle();

    if (lecturer?.LecturerID) {
      const { data: classes } = await supabase
        .from('Class')
        .select('ClassID')
        .eq('LecturerID', lecturer.LecturerID);

      classIds = Array.from(new Set((classes ?? []).map((c) => c.ClassID).filter(Boolean))) as string[];
    }
  }

  const allowedTargets = role === 'admin' ? null : ['All', ...classIds];

  const announcementQuery = supabase
    .from('Announcement')
    .select('AnnouncementID, Title, CreatedAt, Target')
    .order('CreatedAt', { ascending: false })
    .limit(limit);

  if (allowedTargets && allowedTargets.length > 0) {
    announcementQuery.in('Target', allowedTargets);
  } else if (allowedTargets) {
    announcementQuery.in('Target', ['All']);
  }

  const { data } = await announcementQuery;
  return (data ?? []) as AnnouncementSummaryRow[];
}

/** Home page dashboard for both student and lecturer (profile + announcements). */
export default async function HomePage() {
  const profile = await getHomeProfile();
  const announcements = await getRecentAnnouncements(6);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <WelcomeToast />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="size-16 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={`${profile.displayName} avatar`}
                  width={64}
                  height={64}
                  className="size-16 object-cover"
                  priority
                />
              ) : (
                <div className="flex size-16 items-center justify-center text-sm font-semibold text-slate-500">
                  {profile.displayName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('') || 'U'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">{profile.displayName}</h1>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {profile.role === 'student' ? 'Student' : 'Lecturer'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{profile.secondaryLine}</p>
            </div>
          </div>

          <Button asChild variant="outline" className="self-start sm:self-auto">
            <Link href="/announcement" className="gap-2">
              <Megaphone className="size-4" />
              View announcements
            </Link>
          </Button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Announcement</h2>
            <p className="text-sm text-slate-600">Latest updates relevant to you.</p>
          </div>
        </div>

        {announcements.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            No announcements available.
          </div>
        ) : (
          <div className="mt-4 divide-y divide-slate-100 rounded-lg border border-slate-200">
            {announcements.map((announcement) => (
              <div key={announcement.AnnouncementID} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{announcement.Title}</p>
                  <p className="text-xs text-slate-500">
                    {announcement.Target === 'All' ? 'All' : `Class ${announcement.Target}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 sm:shrink-0">
                  <Calendar className="size-3.5" />
                  {formatAnnouncementDate(announcement.CreatedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
