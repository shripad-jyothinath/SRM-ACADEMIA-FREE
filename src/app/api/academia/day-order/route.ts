import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getDayOrder } from 'reddy-api-srm';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('srm_session')?.value;
    if (!cookie) return NextResponse.json({ error: 'Unauthorized: No session cookie found. Please log in again.' }, { status: 401 });

    const data = await getDayOrder(cookie) as any;
    
    if (data && data.error) {
      console.error('[API DayOrder Error] SRM backend returned an error:', data);
      return NextResponse.json({ 
        error: data.error || 'Failed to fetch Day Order from SRM',
        details: 'Your session cookie might be invalid, or you might need to accept terms in the core SRM portal.',
        status: data.status || 500
      }, { status: data.status || 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API DayOrder Exception]', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
