"use server";
import {
  verifyUser,
  verifyPassword,
  terminateSessions,
  getAttendance,
  getCalendar,
  getMarks,
  getDayOrder,
  getUserInfo,
} from 'reddy-api-srm';

export async function loginUser(username: string, password: string) {
  const validationResult = await verifyUser(username);
  if (!validationResult.data?.identifier || !validationResult.data?.digest) {
    return { error: 'User not found. Check your email.' };
  }

  let authResult = await verifyPassword({
    identifier: validationResult.data.identifier,
    digest: validationResult.data.digest,
    password,
  });

  const authDataAny = authResult.data as any;

  // AcademiaX: concurrent limit detected via isConcurrentLimit flag OR when reddy-api-srm fails to find auth cookies and returns ";" (which happens during Zoho's new 201 preannouncement/block-sessions intercept)
  const isConcurrentLimit =
    authDataAny?.isConcurrentLimit ||
    (Array.isArray(authDataAny?.cookies) && authDataAny.cookies.length === 1) ||
    authDataAny?.cookies === ";";

  if (isConcurrentLimit) {
    // Try auto-terminating stale sessions and retry
    try {
      await terminateSessions({
        flowId: authDataAny.flowId || null,
        identifier: validationResult.data.identifier,
        digest: validationResult.data.digest,
      });
      await new Promise(resolve => setTimeout(resolve, 1500));
      authResult = await verifyPassword({
        identifier: validationResult.data.identifier,
        digest: validationResult.data.digest,
        password,
      });
    } catch (_) {
      // Ignore terminate failure, we will surface the manual resolution UI
    }
  }

  const cookieValues = (authResult.data as any)?.cookies;

  // If still no valid cookie after terminate+retry, surface the manual resolution option
  if (!cookieValues || cookieValues === ";" || (Array.isArray(cookieValues) && cookieValues.length <= 1)) {
    if (isConcurrentLimit || cookieValues === ";") {
      return {
        error: 'Maximum concurrent sessions limit reached',
        concurrentSession: true
      };
    }
    const msg = (authResult.data as any)?.message;
    return { error: msg ? decodeURIComponent(msg).replace(/&#39;/g, "'") : 'Authentication failed' };
  }

  // Activate the full portal session by visiting redirectFromLogin
  // Without this, the WAF serves the login page for data endpoints (attendance, marks, calendar)
  try {
    await fetch('https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        cookie: cookieValues as string,
        Referer: 'https://academia.srmist.edu.in/',
      },
      cache: 'no-store',
    });
  } catch (_) { }

  return { success: true, token: cookieValues as string };
}

import { parseUserInfo, parseDayOrder, parseAttendance, parseCalendar, parseMarks, parseTimetable } from '@/lib/parsers';

// Advanced native fetcher that manually intercepts 3xx redirects to forcibly preserve the session cookie across domains
async function fetchWithSessionCookie(url: string, token: string, maxRedirects = 5): Promise<Response> {
  let currentUrl = url;
  for (let i = 0; i < maxRedirects; i++) {
    const res = await fetch(currentUrl, {
      method: "GET",
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'x-requested-with': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        cookie: token,
        Referer: 'https://academia.srmist.edu.in/',
      },
      cache: 'no-store',
      redirect: 'manual'
    });

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (location) {
        currentUrl = location.startsWith("http") ? location : new URL(location, currentUrl).href;
        continue; // manually follow the redirect hop
      }
    }

    return res;
  }
  // Fallback to strict standard fetch if redirect limits are magically exceeded
  return fetch(currentUrl, { headers: { cookie: token } });
}

// Backend HTML Promise Map natively intercepts duplicated payload requests (i.e fetchUserInfo and fetchDayOrder hitting My_Time_Table simultaneously) and maps parallel Server action parsers onto the same strict physical browser fetch.
const htmlPromises = new Map<string, Promise<string>>();

// We use native `fetch` because `axios`-based reddy-api-srm getters fail unpredictably in some Next.js environments
async function srmFetch(url: string, token: string, parser: Function, retried = false, forceRefresh = false): Promise<any> {
  const cacheKey = `${token}:${url}`;

  if (forceRefresh) {
    htmlPromises.delete(cacheKey);
  }

  let fetchPromise = htmlPromises.get(cacheKey);

  if (!fetchPromise) {
    fetchPromise = (async () => {
      const res = await fetchWithSessionCookie(url, token);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      let htmlText = await res.text();

      // If SRM returned the login page, the session isn't activated yet
      // Warm it up by bouncing across redirectFromLogin utilizing the manual redirect tracer
      if (!retried && htmlText.includes('Academia - Academic Web Services Login')) {
        console.log(`[srmFetch] Session token not fully activated on Academic layer. Triggering redirectFromLogin proxy...`);
        try {
          await fetchWithSessionCookie('https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin', token, 10);
        } catch (e) {
          console.error("Redirect boundary error:", e);
        }

        // Retry logic: Bypass the current cache node temporarily and forcefully await a fresh internal pull.
        const retryRes = await fetchWithSessionCookie(url, token);
        if (retryRes.ok) {
          htmlText = await retryRes.text();
        }
      }

      return htmlText;
    })();

    htmlPromises.set(cacheKey, fetchPromise);

    // Garbage Collector constraint: Destroy cache memory signature exactly 60 seconds after execution sequence terminates. Ensures students can forcefully hard-refresh changes natively shortly after.
    setTimeout(() => {
      htmlPromises.delete(cacheKey);
    }, 60000);
  }

  try {
    const htmlText = await fetchPromise;
    return await parser(htmlText);
  } catch (error: any) {
    return { error: error.message || 'Failed to fetch', status: 500 };
  }
}

export async function fetchAttendance(token: string, forceRefresh = false) {
  const data = await srmFetch(
    'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance',
    token,
    parseAttendance,
    false,
    forceRefresh
  );
  if (data?.error) return { error: data.error, status: data.status };
  return data;
}

export async function fetchCalendar(token: string) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  let academicYearString;
  let semesterType;
  if (currentMonth >= 1 && currentMonth <= 6) {
    semesterType = "EVEN";
    academicYearString = `${currentYear - 1}_${currentYear.toString().slice(-2)}`;
  } else {
    semesterType = "ODD";
    academicYearString = `${currentYear}_${(currentYear + 1).toString().slice(-2)}`;
  }
  const dynamicUrl = `https://academia.srmist.edu.in/srm_university/academia-academic-services/page/Academic_Planner_${academicYearString}_${semesterType}`;

  const data = await srmFetch(
    dynamicUrl,
    token,
    parseCalendar
  );
  if (data?.error) return { error: data.error, status: data.status };
  return data;
}

export async function fetchMarks(token: string, forceRefresh = false) {
  const data = await srmFetch(
    'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Attendance',
    token,
    parseMarks,
    false,
    forceRefresh
  );
  if (data?.error) return { error: data.error, status: data.status };
  return data;
}

export async function fetchDayOrder(token: string) {
  const data = await srmFetch(
    'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_2023_24',
    token,
    parseDayOrder
  );
  if (data?.error) return { error: data.error, status: data.status };
  return data;
}

export async function fetchUserInfo(token: string) {
  const data = await srmFetch(
    'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_2023_24',
    token,
    parseUserInfo
  );
  if (data?.error) return { error: data.error, status: data.status };
  return data;
}

export async function fetchTimetable(token: string) {
  const data = await srmFetch(
    'https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_2023_24',
    token,
    parseTimetable
  );
  if (data?.error) return { error: data.error, status: data.status };
  return data;
}

// ==========================================
// MOCK PARENT PORTAL APIS (TO BE IMPLEMENTED)
// ==========================================

export async function loginParent(identifier: string, credential: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a mock parent token
  return { success: true, token: "mock_parent_token_2026", error: null as string | null };
}

export async function fetchParentDashboard(token: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (token !== "mock_parent_token_2026") {
    return { error: 'Invalid parent session', status: 401 };
  }
  
  // Return mock data that mirrors standard student data structure
  return {
    userInfo: {
      name: "John Doe (Ward)",
      program: "B.Tech Computer Science and Engineering",
      registrationNumber: "RA2011003011001",
      section: "A"
    },
    dayOrder: {
      dayOrder: "3"
    },
    timetable: {
      "schedule": {
        "1": [], "2": [], "3": [
          { slot: "P-1", title: "Data Structures", code: "CS101", room: "TP-101" },
          { slot: "P-2", title: "Operating Systems", code: "CS102", room: "TP-102" }
        ], "4": [], "5": []
      }
    },
    dashSummary: {
      marks: "45.00",
      maxMarks: "50.00",
      attendance: "85.20"
    },
    attendanceDetails: [
      { courseCode: "CS101", courseTitle: "Data Structures", attended: "30", conducted: "35" },
      { courseCode: "CS102", courseTitle: "Operating Systems", attended: "28", conducted: "32" }
    ]
  };
}

