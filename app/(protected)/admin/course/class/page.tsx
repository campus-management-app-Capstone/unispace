import React from 'react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import {
  ClassWithSubjectAndLecturer,
  createClass,
  deleteClass,
  getAllClassesWithDetails,
} from '@/lib/database';
import { createServerSupabaseClient } from '@/lib/supabase';
import CreateNewClassButton from '@/components/CreateNewClassButton';
import type { TablesInsert } from '@/types/supabase';

/**
 * Props for the server-rendered class repository page.
 */
interface ClassPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

/**
 * Server action for creating a new class from the admin page.
 */
async function createClassAction(formData: FormData) {
  'use server';

  const classId = String(formData.get('ClassID') || '').trim();
  const group = String(formData.get('Group') || '').trim();
  const subjectId = String(formData.get('SubjectID') || '').trim();
  const lecturerId = String(formData.get('LecturerID') || '').trim();
  const type = String(formData.get('Type') || '').trim();

  if (!classId || !group || !subjectId || !lecturerId || !type) {
    return;
  }

  const payload: TablesInsert<'Class'> = {
    ClassID: classId,
    Group: group,
    SubjectID: subjectId,
    LecturerID: lecturerId,
    Type: type,
  };

  await createClass(payload);
  revalidatePath('/(protected)/admin/course/class');
}

/**
 * Server action for deleting a class from the repository.
 */
async function deleteClassAction(formData: FormData) {
  'use server';

  const classId = String(formData.get('ClassID') || '').trim();
  if (!classId) {
    return;
  }

  await deleteClass(classId);
  revalidatePath('/(protected)/admin/course/class');
}

/**
 * Filter classes by search query and class type.
 */
function filterClasses(
  classes: ClassWithSubjectAndLecturer[],
  searchQuery?: string,
  typeFilter?: string
) {
  const query = (searchQuery || '').toLowerCase();
  const type = (typeFilter || '').toLowerCase();

  return classes.filter((item) => {
    const matchesType =
      !type ||
      (item.Type || '').toLowerCase() === type ||
      item.Type?.toLowerCase().includes(type);

    if (!matchesType) {
      return false;
    }

    if (!query) {
      return true;
    }

    const subjectName = item.Subject?.Name || '';
    return (
      item.ClassID.toLowerCase().includes(query) ||
      subjectName.toLowerCase().includes(query)
    );
  });
}

/**
 * ClassPage renders the admin class repository for managing all class sessions.
 */
const ClassPage = async ({ searchParams }: ClassPageProps) => {
  const { q, type } = await searchParams;

  const [classes, supabase] = await Promise.all([
    getAllClassesWithDetails(),
    createServerSupabaseClient(),
  ]);

  const [{ data: lecturers }, { data: subjects }] = await Promise.all([
    supabase
      .from('Lecturer')
      .select('LecturerID, LecturerCode')
      .order('LecturerID', { ascending: true }),
    supabase
      .from('Subject')
      .select('SubjectID, Name')
      .order('SubjectID', { ascending: true }),
  ]);

  const filteredClasses = filterClasses(
    classes,
    q,
    type
  );

  return (
    <div className="mx-auto w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Class Repository</h1>
          <p className="text-sm text-gray-600">
            Manage and view all class sessions for lectures, tutorials, and
            labs.
          </p>
        </div>

        {lecturers && subjects && (
          <div className="flex w-full justify-end sm:w-auto">
            <CreateNewClassButton
              lecturers={lecturers}
              subjects={subjects}
              createAction={createClassAction}
            />
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Search by class ID or subject name..."
              className="h-9 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              name="type"
              defaultValue={type || ''}
              className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-black focus:outline-none"
            >
              <option value="">All Types</option>
              <option value="Lecture">Lecture</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Lab">Lab</option>
            </select>

            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
            >
              Apply Filters
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4">Class ID</th>
                <th className="py-2 pr-4">Subject Name</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Group</th>
                <th className="py-2 pr-4">Lecturer</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((item) => (
                <tr
                  key={item.ClassID}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="py-2 pr-4 font-medium text-gray-900">
                    {item.ClassID}
                  </td>
                  <td className="py-2 pr-4 text-gray-800">
                    {item.Subject?.Name || '-'}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                      {item.Type || '—'}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-800">{item.Group}</td>
                  <td className="py-2 pr-4 text-gray-800">
                    {item.Lecturer?.LecturerCode || item.LecturerID}
                  </td>
                  
                </tr>
              ))}

              {filteredClasses.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-sm text-gray-500"
                  >
                    No classes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
