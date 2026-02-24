import { createClerkSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE: Delete a student and their enrollments
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = await createClerkSupabaseClient();

    // Delete enrollments first (foreign key constraint)
    await supabase
      .from('Enrollment')
      .delete()
      .eq('StudentID', id);

    // Then delete the student
    const { error } = await supabase
      .from('Student')
      .delete()
      .eq('StudentID', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}