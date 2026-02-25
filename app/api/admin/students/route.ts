import { createClerkSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET: Fetch all students and enrollments
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClerkSupabaseClient();

    const [studentsRes, enrollmentsRes] = await Promise.all([
      supabase.from('Student').select('*').order('StudentID', { ascending: true }),
      supabase.from('Enrollment').select('*').order('Intake', { ascending: false }),
    ]);

    if (studentsRes.error) throw studentsRes.error;
    if (enrollmentsRes.error) throw enrollmentsRes.error;

    return NextResponse.json({
      students: studentsRes.data || [],
      enrollments: enrollmentsRes.data || [],
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}