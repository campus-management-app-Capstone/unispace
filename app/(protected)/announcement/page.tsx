import React from 'react';
import Link from 'next/link';
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Calendar, ChevronLeft, ChevronRight, Megaphone, Users } from 'lucide-react';

import { createClerkSupabaseClient, createServerSupabaseClient } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SurveyInitiateForm from './SurveyInitiateForm';

export const dynamic = 'force-dynamic';

const ITEMS_PER_PAGE = 20;
const SURVEY_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScpgOOEl00Xs7wdqbel4fwKjEkTxlaa8RZ7ra_1lwa1Iv0p7g/viewform?usp=publish-editor';

interface AnnouncementRow {
  AnnouncementID: string;
  Title: string;
  Content: string;
  CreatedAt: string;
  Target: string;
  UserID: string;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildSurveyUrl(classId: string, lecturerName: string) {
  const params = new URLSearchParams();
  params.set('usp', 'publish-editor');
  params.set('class', classId);
  params.set('lecturer', lecturerName);
  return `${SURVEY_FORM_URL.split('?')[0]}?${params.toString()}`;
}

function renderContentWithLinks(content: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, idx) => {
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={`link-${idx}`}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-600 underline-offset-2 hover:underline"
        >
          {part}
        </a>
      );
    }
    return <React.Fragment key={`text-${idx}`}>{part}</React.Fragment>;
  });
}

function buildPageNumbers(totalPages: number, currentPage: number) {
  const pages: Array<number | 'ellipsis'> = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i += 1) pages.push(i);
  } else {
    pages.push(1, 2, 3);
    if (currentPage > 4) pages.push('ellipsis');
    const mid = Math.max(4, Math.min(currentPage, totalPages - 3));
    if (mid > 3 && mid < totalPages - 2) pages.push(mid);
    if (currentPage < totalPages - 3) pages.push('ellipsis');
    pages.push(totalPages - 1, totalPages);
  }
  return Array.from(new Set(pages));
}

async function initiateSurveyAction(formData: FormData) {
  'use server';

  const classId = String(formData.get('classId') || '').trim();
  if (!classId) return;

  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) ?? undefined;
  if (role !== 'lecturer') return;

  const supabaseServer = createServerSupabaseClient();
  const { data: lecturer } = await supabaseServer
    .from('Lecturer')
    .select('LecturerID')
    .eq('UserID', userId)
    .maybeSingle();

  if (!lecturer) return;

  const { data: classRow } = await supabaseServer
    .from('Class')
    .select('ClassID, LecturerID')
    .eq('ClassID', classId)
    .maybeSingle();

  if (!classRow || classRow.LecturerID !== lecturer.LecturerID) return;

  const lecturerName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.username ||
    'Lecturer';

  const { data: existingSurvey } = await supabaseServer
    .from('Announcement')
    .select('AnnouncementID')
    .eq('Target', classId)
    .ilike('Title', `Survey for ${classId}%`)
    .limit(1)
    .maybeSingle();

  if (existingSurvey) {
    return;
  }

  const surveyUrl = buildSurveyUrl(classId, lecturerName);
  const title = `Survey for ${classId} (${lecturerName})`;
  const content = `Please complete the class survey for ${classId}.\nSurvey link: ${surveyUrl}`;

  const supabase = await createClerkSupabaseClient();
  const { error } = await supabase.from('Announcement').insert({
    Title: title,
    Content: content,
    Target: classId,
    UserID: userId,
    CreatedAt: new Date().toISOString(),
  });

  if (error) return;

  revalidatePath('/announcement');
}

export default async function AnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) ?? undefined;

  if (!role || !['student', 'lecturer', 'admin'].includes(role)) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <p className="text-sm text-gray-600">
          You are not authorized to view announcements.
        </p>
      </div>
    );
  }

  const supabase = createServerSupabaseClient();

  let classIds: string[] = [];
  let lecturerClasses: Array<{
    ClassID: string;
    SubjectName: string | null;
    hasSurvey: boolean;
  }> = [];

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
      const enrollmentIds = (enrollments ?? [])
        .map((e) => e.EnrollmentID)
        .filter(Boolean);

      if (enrollmentIds.length > 0) {
        const { data: regs } = await supabase
          .from('ClassRegistration')
          .select('ClassID')
          .in('EnrollmentID', enrollmentIds);
        classIds = Array.from(
          new Set((regs ?? []).map((r) => r.ClassID).filter(Boolean))
        ) as string[];
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
        .select('ClassID, Subject(Name)')
        .eq('LecturerID', lecturer.LecturerID)
        .order('ClassID', { ascending: true });

      const classList =
        (classes ?? []).map((row) => ({
          ClassID: row.ClassID,
          SubjectName: row.Subject?.Name ?? null,
        })) ?? [];
      classIds = classList.map((c) => c.ClassID);

      let surveyTargets = new Set<string>();
      if (classIds.length > 0) {
        const { data: surveys } = await supabase
          .from('Announcement')
          .select('Title, Target')
          .in('Target', classIds)
          .ilike('Title', 'Survey for %');

        (surveys ?? []).forEach((row) => {
          if (
            row.Target &&
            row.Title &&
            row.Title.startsWith(`Survey for ${row.Target}`)
          ) {
            surveyTargets.add(row.Target);
          }
        });
      }

      lecturerClasses = classList
        .map((row) => ({
          ...row,
          hasSurvey: surveyTargets.has(row.ClassID),
        }))
        .sort((a, b) => {
          if (a.hasSurvey === b.hasSurvey) {
            return a.ClassID.localeCompare(b.ClassID);
          }
          return a.hasSurvey ? 1 : -1;
        });
    }
  }

  const resolvedParams = await searchParams;
  const pageParam = typeof resolvedParams.page === 'string' ? resolvedParams.page : '';
  const page = Math.max(1, Number.parseInt(pageParam, 10) || 1);
  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const allowedTargets = role === 'admin' ? null : ['All', ...classIds];

  const announcementQuery = supabase
    .from('Announcement')
    .select('*', { count: 'exact' })
    .order('CreatedAt', { ascending: false });

  if (allowedTargets && allowedTargets.length > 0) {
    announcementQuery.in('Target', allowedTargets);
  } else if (allowedTargets) {
    announcementQuery.in('Target', ['All']);
  }

  const { data: announcements, count } = await announcementQuery.range(from, to);
  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const pageNumbers = buildPageNumbers(totalPages, page);

  const showingStart = totalCount === 0 ? 0 : from + 1;
  const showingEnd = Math.min(totalCount, page * ITEMS_PER_PAGE);

  const pageHref = (nextPage: number) => `/announcement?page=${nextPage}`;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Megaphone className="size-6 text-slate-700" />
            Announcements
          </h1>
          <p className="text-sm text-slate-600">
            Updates tailored to your classes, plus campus-wide notices.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <span className="font-medium text-slate-900">{totalCount}</span> total
          announcements
        </div>
      </div>

      {role === 'lecturer' && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Initiate Survey
              </h2>
              <p className="text-sm text-slate-600">
                Send a survey announcement to one of your classes.
              </p>
            </div>
          </div>

          {lecturerClasses.length === 0 ? (
            <div className="mt-4 rounded-md border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              You do not have any assigned classes yet. Once a class is assigned, you can initiate a survey here.
            </div>
          ) : (
            <SurveyInitiateForm classes={lecturerClasses} action={initiateSurveyAction} />
          )}
        </section>
      )}

      <section className="space-y-4">
        {announcements && announcements.length > 0 ? (
          (announcements as AnnouncementRow[]).map((announcement) => {
            const targetLabel =
              announcement.Target === 'All'
                ? 'All Students'
                : `Class ${announcement.Target}`;
            return (
              <article
                key={announcement.AnnouncementID}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {announcement.Title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="size-3.5" />
                        {formatDate(announcement.CreatedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3.5" />
                        {targetLabel}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={announcement.Target === 'All' ? 'secondary' : 'outline'}
                    className={
                      announcement.Target === 'All'
                        ? 'bg-slate-100 text-slate-700'
                        : 'border-slate-300 text-slate-700'
                    }
                  >
                    {announcement.Target === 'All' ? 'All' : announcement.Target}
                  </Badge>
                </div>
                <div className="mt-3 whitespace-pre-line text-sm text-slate-700">
                  {renderContentWithLinks(announcement.Content)}
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
            No announcements available.
          </div>
        )}
      </section>

      {totalCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <p>
            Showing <span className="font-medium text-slate-900">{showingStart}</span> to{' '}
            <span className="font-medium text-slate-900">{showingEnd}</span> of{' '}
            <span className="font-medium text-slate-900">{totalCount}</span>
          </p>
          <div className="flex items-center gap-1">
            {page === 1 ? (
              <span className="flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-300">
                <ChevronLeft className="size-4" />
              </span>
            ) : (
              <Button asChild variant="outline" size="icon-sm">
                <Link href={pageHref(page - 1)} aria-label="Previous page">
                  <ChevronLeft className="size-4" />
                </Link>
              </Button>
            )}

            {pageNumbers.map((p, idx) =>
              p === 'ellipsis' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex size-8 items-center justify-center text-sm text-slate-400"
                >
                  ...
                </span>
              ) : (
                <Button
                  key={p}
                  asChild
                  variant={p === page ? 'default' : 'outline'}
                  size="icon-sm"
                >
                  <Link href={pageHref(p)}>{p}</Link>
                </Button>
              )
            )}

            {page === totalPages ? (
              <span className="flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-300">
                <ChevronRight className="size-4" />
              </span>
            ) : (
              <Button asChild variant="outline" size="icon-sm">
                <Link href={pageHref(page + 1)} aria-label="Next page">
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
