import React from 'react';
import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { getClassWithStudents, updateClass } from '@/lib/database';
import type { TablesUpdate } from '@/types/supabase';

/**
 * Props for the dynamic admin class detail page.
 */
interface ClassIdPageProps {
  params: {
    classid: string;
  };
}

/**
 * Server action for updating core class details from the class detail page.
 */
async function updateClassAction(formData: FormData) {
  'use server';

  const classId = String(formData.get('ClassID') || '').trim();
  if (!classId) {
    return;
  }

  const type = String(formData.get('Type') || '').trim();
  const group = String(formData.get('Group') || '').trim();

  const updates: TablesUpdate<'Class'> = {};

  if (type) {
    updates.Type = type;
  }

  if (group) {
    updates.Group = group;
  }

  if (Object.keys(updates).length === 0) {
    return;
  }

  await updateClass(classId, updates);
  revalidatePath(`/(protected)/admin/course/class/${encodeURIComponent(classId)}`);
}

/**
 * ClassIdPage renders the admin view for a single class and its students.
 */
const ClassIdPage = async ({ params }: ClassIdPageProps) => {
  const classRecord = await getClassWithStudents(params.classid);

  if (!classRecord) {
    notFound();
  }

  const subject = classRecord.Subject;
  const lecturer = classRecord.Lecturer;

  const registrations = (classRecord.ClassRegistration || []) as Array<{
    ClassRegistrationID: string;
    Enrollment: {
      EnrollmentID: string;
      Intake: string;
      Student: {
        StudentID: string;
        StudentCode: string;
      } | null;
    } | null;
  }>;

  const students = registrations
    .map((reg) => reg.Enrollment?.Student)
    .filter((s): s is { StudentID: string; StudentCode: string } => Boolean(s));

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">
          Class Details: {classRecord.ClassID}
        </h1>
        <p className="text-sm text-gray-600">
          {subject?.Name || 'Unknown subject'} — Group {classRecord.Group}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            General Information
          </h2>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Class Type</dt>
              <dd className="font-medium text-gray-900">
                {classRecord.Type || 'Not specified'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Duration</dt>
              <dd className="font-medium text-gray-900">
                {subject?.Duration ? `${subject.Duration} hrs / Week` : '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Assigned Lecturer</dt>
              <dd className="font-medium text-gray-900">
                {lecturer?.LecturerCode || classRecord.LecturerID}
              </dd>
            </div>
          </dl>

          <form
            action={updateClassAction}
            className="mt-4 space-y-3 rounded-md bg-gray-50 p-3 text-sm"
          >
            <input type="hidden" name="ClassID" value={classRecord.ClassID} />
            <div className="flex flex-col gap-1">
              <label
                htmlFor="Group"
                className="text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                Group
              </label>
              <input
                id="Group"
                name="Group"
                defaultValue={classRecord.Group}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="Type"
                className="text-xs font-medium uppercase tracking-wide text-gray-600"
              >
                Class Type
              </label>
              <select
                id="Type"
                name="Type"
                defaultValue={classRecord.Type || 'Lecture'}
                className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
              >
                <option value="Lecture">Lecture</option>
                <option value="Tutorial">Tutorial</option>
                <option value="Lab">Lab</option>
              </select>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md bg-black px-4 text-xs font-medium uppercase tracking-wide text-white hover:bg-gray-900"
              >
                Save Changes
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Students In This Class
            </h2>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              {students.length} Students
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  <th className="py-2 pr-4">Student ID</th>
                  <th className="py-2 pr-4">Student Code</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.StudentID}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-2 pr-4 font-medium text-gray-900">
                      {student.StudentID}
                    </td>
                    <td className="py-2 pr-4 text-gray-800">
                      {student.StudentCode}
                    </td>
                  </tr>
                ))}

                {students.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="py-6 text-center text-sm text-gray-500"
                    >
                      No students are currently assigned to this class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClassIdPage;
