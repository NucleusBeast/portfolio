import { NextRequest, NextResponse } from 'next/server';

// For demo: hardcoded admin credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Set a simple cookie for session (for demo purposes)
    return NextResponse.json({ success: true }, {
      status: 200,
      headers: {
        'Set-Cookie': `admin_auth=1; Path=/; HttpOnly; SameSite=Strict`,
      },
    });
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
}

