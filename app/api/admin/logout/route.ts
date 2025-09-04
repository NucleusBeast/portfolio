import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the admin_auth cookie
  return NextResponse.json({ success: true }, {
    status: 200,
    headers: {
      'Set-Cookie': 'admin_auth=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict',
    },
  });
}

