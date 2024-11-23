import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function middleware(request) {
  if (request.nextUrl.pathname.startsWith('/api/tasks')) {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      verify(token, process.env.JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/tasks/:path*']
}; 