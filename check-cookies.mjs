import { verifyUser } from 'reddy-api-srm';

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email || !password) {
    console.log("Usage: node check-cookies.mjs <email> <password>");
    return;
  }

  console.log('1. Fetching digest...');
  const userResult = await verifyUser(email);
  if (!userResult.data?.identifier) {
    console.log('User verification failed:', userResult);
    return;
  }

  const { identifier, digest } = userResult.data;
  console.log(`2. Hitting Zoho password endpoint...`);
  
  const url = `https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/primary/${identifier}/password?digest=${digest}&cli_time=${Date.now()}&servicename=ZohoCreator&service_language=en&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
      "cookie": "iamcsrcoo=fae2d8fa-e5a1-4cb0-a5ee-cc40af87e89f; zalb_74c3a1eecc=4cad43ac9848cc7edd20d2313fcde774; zccpn=a6fa7bc8-11c7-44ad-8be8-0aa6b04fad8a; JSESSIONID=3BD0053672AF3D628D983A15AA469D07; cli_rgn=IN; _ga=GA1.3.2061081340.1748689001; iamcsr=fae2d8fa-e5a1-4cb0-a5ee-cc40af87e89f; _zcsr_tmp=fae2d8fa-e5a1-4cb0-a5ee-cc40af87e89f",
      "x-zcsrf-token": "iamcsrcoo=fae2d8fa-e5a1-4cb0-a5ee-cc40af87e89f",
      "Referer": "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&servicename=ZohoCreator&service_language=en&css_url=/49910842/academia-academic-services/downloadPortalCustomCss/login&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin"
    },
    body: `{"passwordauth":{"password":"${password}"}}`,
    redirect: "manual"
  });

  console.log(`\nStatus: ${res.status}`);
  console.log('\n--- RAW HEADERS ---');
  res.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });

  const body = await res.text();
  console.log('\n--- BODY ---');
  console.log(body);
}

main().catch(console.error);
