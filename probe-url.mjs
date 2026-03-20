import fs from 'fs';
async function test() {
  const tokenFull = "_iamadt_client_10002227248=c6797e7d373de130f137dae05c063f11e053e1bc3e976f30ebacb7c447f19662b55081ca2e7dc761f9532e24115cab98; _iambdt_client_10002227248=73e59f585f0a0899604f8062ad7ef388a16bf310ec9d2d4168c953d03357ba8d93d281a5eae810983aa12d8e267050a5160c4903aedc97ec05694a4794a907c9; _z_identity=true;";
  const res = await fetch("https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_2023_24", {
    headers: {
      "cookie": tokenFull,
    },
  });
  console.log("Status:", res.status);
  const text = await res.text();
  fs.writeFileSync("probe-out.html", text);
  console.log("Length:", text.length);
}
test();
