import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';

export async function GET() {
  const { sessionClaims } = await auth();
  const UserID = sessionClaims?.sub;
  if (!UserID) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {

    // Create Supabase client
    const supabase = createBrowserSupabaseClient();

    // Fetch courses
    const { data: coursesData, error: coursesError } = await supabase
      .from('Course')
      .select('CourseID, Name, Level')
      .order('CourseID', { ascending: true });

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      throw coursesError;
    }

    // Fetch intakes (distinct from Enrollment table)
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from('Enrollment')
      .select('Intake')
      .order('Intake', { ascending: false });

    if (enrollmentsError) {
      console.error('Error fetching intakes:', enrollmentsError);
      throw enrollmentsError;
    }

    const intakes = Array.from(
      new Set((enrollmentsData || []).map((e: any) => e.Intake).filter(Boolean))
    );

    // Return JSON
    return NextResponse.json({
      courses: coursesData || [],
      intakes: intakes || [],
    },
      { status: 200 });
  } catch (err) {
    console.error('Failed to fetch form data:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch form data' },
      { status: 500 }
    );
  }
}