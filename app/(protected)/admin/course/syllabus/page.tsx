import { createServerSupabaseClient } from '@/lib/supabase';
import React from 'react'


const SyllabusPage = async () => {
  const supabase = createServerSupabaseClient();

  /* fetch all syllabus */
  const { data: syllabus, error: syllError } = await supabase
    .from("Syllabus")
    .select("*")

  /* fetch course counts per department in a separate query */
  const { data: courses } = await supabase
    .from("Course")
    .select("DepartmentID");

  if (syllError) {
    console.error("Syllabus fetch error:", syllError);
    return (
      <div className="flex h-48 items-center justify-center text-sm text-destructive">
        Failed to load syllabus: {syllError.message}
      </div>
    );
  }

  /* map department ID to course count */
  const courseCountMap = new Map<string, number>();
  courses?.forEach((c) => {
    if (c.DepartmentID) {
      courseCountMap.set(c.DepartmentID, (courseCountMap.get(c.DepartmentID) ?? 0) + 1);
    }
  });

  
  return (
    <div>SyllabusPage</div>
  )
}

export default SyllabusPage