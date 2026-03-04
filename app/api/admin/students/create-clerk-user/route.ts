import { NextRequest, NextResponse } from 'next/server';

/**
 * POST: Create a user in Clerk
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 }
      );
    }

    // Call Clerk API to create user
    const clerkResponse = await fetch('https://api.clerk.com/v1/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: [email],
        password,
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || '',
        // Set role in metadata
        public_metadata: {
          role: 'student',
        },
      }),
    });

    if (!clerkResponse.ok) {
      const clerkError = await clerkResponse.json();
      const errorMessage = clerkError.errors?.[0]?.message || 'Failed to create user in Clerk';
      throw new Error(errorMessage);
    }

    const clerkUser = await clerkResponse.json();

    return NextResponse.json({
      success: true,
      userId: clerkUser.id,
      email: clerkUser.email_addresses[0]?.email_address || email,
    });
  } catch (error: any) {
    console.error('Error creating Clerk user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}