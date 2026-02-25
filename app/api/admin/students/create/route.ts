import { createClerkSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST: Create a new student with enrollment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, userId, intake, courseId } = body;

    // Validation
    if (!studentId || !userId || !intake || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // Create student
    const { data: studentData, error: studentError } = await supabase
      .from('Student')
      .insert([
        {
          StudentID: studentId,
          UserID: userId,
        },
      ])
      .select()
      .single();

    if (studentError) throw studentError;

    // Create enrollment
    const { error: enrollmentError } = await supabase
      .from('Enrollment')
      .insert([
        {
          StudentID: studentData.StudentID,
          CourseID: courseId,
          Intake: intake,
        },
      ]);

    if (enrollmentError) throw enrollmentError;

    return NextResponse.json({ success: true, student: studentData });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create student' },
      { status: 500 }
    );
  }
}