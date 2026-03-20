import readline from 'readline';
import { verifyUser, verifyPassword, getUserInfo, getAttendance, getDayOrder } from 'reddy-api-srm';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

async function main() {
  console.log('\n=== SRM API Direct Test ===\n');

  const email = await ask('Email (e.g. ab1234@srmist.edu.in): ');
  const password = await ask('Password: ');

  console.log('\n[1] Verifying user...');
  const userResult = await verifyUser(email.trim());
  console.log('verifyUser result:', JSON.stringify(userResult, null, 2));

  if (!userResult.data?.identifier || !userResult.data?.digest) {
    console.log('\n❌ User verification failed. Exiting.');
    rl.close(); return;
  }

  console.log('\n[2] Verifying password...');
  const authResult = await verifyPassword({
    identifier: userResult.data.identifier,
    digest: userResult.data.digest,
    password: password.trim(),
  });
  console.log('verifyPassword result:', JSON.stringify(authResult, null, 2));

  const cookies = authResult.data?.cookies;
  if (!cookies) {
    console.log('\n❌ Authentication failed — no cookies returned.');
    rl.close(); return;
  }

  console.log('\n✅ Authenticated!');
  console.log('Cookie value type:', typeof cookies);
  console.log('Cookie value:', JSON.stringify(cookies));

  console.log('\n[3] Fetching getUserInfo with cookie...');
  const userInfo = await getUserInfo(cookies);
  console.log('getUserInfo result:', JSON.stringify(userInfo, null, 2));

  console.log('\n[4] Fetching getDayOrder...');
  const dayOrder = await getDayOrder(cookies);
  console.log('getDayOrder result:', JSON.stringify(dayOrder, null, 2));

  console.log('\n[5] Fetching getAttendance...');
  const attendance = await getAttendance(cookies);
  console.log('getAttendance result (first 2 items):', JSON.stringify(
    Array.isArray(attendance?.data) ? attendance.data.slice(0, 2) : attendance,
    null, 2
  ));

  rl.close();
}

main().catch(e => { console.error('Fatal error:', e); rl.close(); });
