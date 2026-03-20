import { NextResponse } from 'next/server';
import { loginUser } from '@/app/actions';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const result = await loginUser(username, password);

    if (result.error) {
      return NextResponse.json({ error: result.error, concurrentSession: (result as any).concurrentSession ?? false }, { status: 401 });
    }

    return NextResponse.json({ success: true, token: result.token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
