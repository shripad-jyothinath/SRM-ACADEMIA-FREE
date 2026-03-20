import fs from 'fs';

const token = "_iamadt_client_10002227248=3e859b4324c90d9e6b80d9fe252ae61ab31a9e933fc8b40926cc212c1e2a4b805e09bebd1023a8d56ceedbb1a7b3818f; _iambdt_client_10002227248=dd18e18c92e7d865d82e8435603520de9f1eef15a32641d8724589a2bbc91c02575e68ec1a60040a8650711165e967563af1617a0cc96fc57c818e3a2cc298fb; _z_identity=true;";

async function test() {
  console.log("Visiting redirectFromLogin...");
  const res = await fetch('https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36',
        cookie: token,
      },
      redirect: 'manual'
  });
  
  console.log("Status:", res.status);
  console.log("Location:", res.headers.get('location'));
  console.log("Set-Cookie:", res.headers.get('set-cookie'));
}

test().catch(console.error);
