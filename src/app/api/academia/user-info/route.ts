import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('srm_session')?.value;
    if (!cookie) return NextResponse.json({ error: 'Unauthorized: No session cookie found. Please log in again.' }, { status: 401 });

    const response = await fetch("https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance", {
      headers: {
        accept: "*/*",
        cookie,
      },
      method: "GET",
    });

    const body = await response.text();
    const match = body.match(/pageSanitizer\.sanitize\('([\s\S]*?)'\);/);
    
    if (!match || !match[1]) {
      console.error('[API UserInfo Error] Failed to extract payload from SRM portal');
      return NextResponse.json({ 
        error: 'Failed to extract user details',
        details: 'The SRM portal HTML might have changed, or your session is invalid.',
        status: 404
      }, { status: 404 });
    }

    const decodedHtml = match[1]
      .replace(/\\x([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\\\/g, "")
      .replace(/\\'/g, "'");

    const $ = cheerio.load(decodedHtml);
    const getText = (selector: string) => $(selector).text().trim();

    const userInfo = {
      regNumber: getText('td:contains("Registration Number:") + td strong'),
      name: getText('td:contains("Name:") + td strong'),
      mobile: getText('td:contains("Mobile:") + td strong'),
      section: getText('td:contains("Department:") + td strong').split("-")[1]?.replace(/[\(\)Section]/gi, "").trim() || "",
      program: getText('td:contains("Program:") + td strong'),
      department: getText('td:contains("Department:") + td strong').split("-")[0]?.trim() || "",
      semester: getText('td:contains("Semester:") + td strong'),
      batch: getText('td:contains("Batch:") + td strong font'),
    };

    return NextResponse.json({ userInfo, status: 200 });
  } catch (error: any) {
    console.error('[API UserInfo Exception]', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
