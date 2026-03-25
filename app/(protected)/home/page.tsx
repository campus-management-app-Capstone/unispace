import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import WelcomeToast from '@/components/WelcomeToast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClerkSupabaseClient, createServerSupabaseClient } from '@/lib/supabase';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Megaphone, UserCheck, Zap, SquareParking } from 'lucide-react';

import WalletWidget from '@/components/WalletWidget'; 
import ParkingWidget from '@/components/ParkingWidget'; 

export const dynamic = 'force-dynamic';

interface HomeProfile {
  role: 'student' | 'lecturer';
  displayName: string;
  avatarUrl: string | null;
  secondaryLine: string;
}

interface TodayClassSlot {
  id: string;
  subjectName: string;
  venue: string;
  start: string;
  end: string;
}

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>) {
  return (
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    'User'
  );
}

/** parse DB time ("13:00:00") into (time: "01:00", period: "PM") */
function parseTimeForUI(timeStr: string | null) {
  if (!timeStr) return { time: '--:--', period: '--' };
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  if (isNaN(h)) return { time: '--:--', period: '--' };

  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const paddedH = displayH < 10 ? `0${displayH}` : `${displayH}`;
  return { time: `${paddedH}:${minutes || '00'}`, period };
}

/** Fetch student/lecturer profile details */
async function getHomeProfile(userId: string, user: Awaited<ReturnType<typeof currentUser>>): Promise<HomeProfile> {
  const sessionClaims = user?.publicMetadata;
  const role = (sessionClaims?.role as string | undefined) ?? (user?.publicMetadata?.role as string | undefined);
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

/** Fetch ONLY today's classes based on Role */
async function getTodaysTimetable(userId: string, role: string): Promise<TodayClassSlot[]> {
  const supabase = createServerSupabaseClient();
  let classIds: string[] = [];

  // Get Class IDs based on role
  if (role === 'student') {
    const { data: student } = await supabase.from('Student').select('StudentID').eq('UserID', userId).maybeSingle();
    if (student) {
      const { data: enrollments } = await supabase.from('Enrollment').select('EnrollmentID').eq('StudentID', student.StudentID);
      const enrollmentIds = (enrollments ?? []).map((e) => e.EnrollmentID);
      if (enrollmentIds.length > 0) {
        const { data: regs } = await supabase.from('ClassRegistration').select('ClassID').in('EnrollmentID', enrollmentIds);
        classIds = Array.from(new Set((regs ?? []).map((r) => r.ClassID).filter(Boolean))) as string[];
      }
    }
  } else if (role === 'lecturer') {
    const { data: lecturer } = await supabase.from('Lecturer').select('LecturerID').eq('UserID', userId).maybeSingle();
    if (lecturer) {
      const { data: classes } = await supabase.from('Class').select('ClassID').eq('LecturerID', lecturer.LecturerID);
      classIds = Array.from(new Set((classes ?? []).map((c) => c.ClassID).filter(Boolean))) as string[];
    }
  }

  if (classIds.length === 0) return [];

  // "Mon", "Tue")
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kuala_Lumpur' });

  // Fetch slots
  const { data: slotRows } = await supabase
    .from('TimetableSlot')
    .select(`
      TimetableSlotID, Day, Start, End,
      Facility ( Name ),
      Class ( Subject ( Name ) )
    `)
    .in('ClassID', classIds)
    .ilike('Day', `${todayStr}%`) // Matches "Mon" or "Monday"
    .order('Start', { ascending: true });

  if (!slotRows) return [];

  // Map to UI Model
  return slotRows.map((row: any) => ({
    id: row.TimetableSlotID,
    subjectName: row.Class?.Subject?.Name ?? 'Unknown Subject',
    venue: row.Facility?.Name ?? 'TBA',
    start: row.Start ?? '',
    end: row.End ?? '',
  }));
}

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const profile = await getHomeProfile(userId, user!);
  const todaysClasses = await getTodaysTimetable(userId, profile.role);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <WelcomeToast />

      {/* --- TOP SECTION: PROFILE --- */}
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

          <Button asChild variant="outline" className="self-start sm:self-auto cursor-pointer">
            <Link href="/announcement" className="gap-2">
              <Megaphone className="size-4" />
              View announcements
            </Link>
          </Button>
        </div>
      </section>

      {/* --- BOTTOM SECTION: BENTO GRID LAYOUT --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Today's Timetable Widget */}
        <div className="md:col-span-2 bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-lg text-slate-900">Today&apos;s Timetable</h3>
            </div>
            {todaysClasses.length > 0 && (
              <Link
                href={profile.role === "student"? "/student/attendance/sign-in" : "/lecturer/attendance"}
                className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-4 py-2 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="size-4" />
                Sign Attendance
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {todaysClasses.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No classes scheduled for today. Take a break!
              </div>
            ) : (
              todaysClasses.map((cls) => {
                const { time, period } = parseTimeForUI(cls.start);

                return (
                  <div key={cls.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between hover:border-slate-200 transition-colors shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex flex-col items-center justify-center text-[10px] font-bold text-slate-500 shrink-0">
                        <span>{time}</span>
                        <span>{period}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{cls.subjectName}</h4>
                        <p className="text-xs text-slate-500">{cls.venue}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Campus Wallet Card */}
        <WalletWidget />

        {/* Parking Slot Widget */}
        <ParkingWidget />

      </div>
    </div>
  );
}