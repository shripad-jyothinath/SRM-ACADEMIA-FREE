import axios from 'axios';
import fs from 'fs';

async function test() {
  const cookie = "_iamadt_client_10002227248=c6797e7d373de130f137dae05c063f11e053e1bc3e976f30ebacb7c447f19662b55081ca2e7dc761f9532e24115cab98; _iambdt_client_10002227248=73e59f585f0a0899604f8062ad7ef388a16bf310ec9d2d4168c953d03357ba8d93d281a5eae810983aa12d8e267050a5160c4903aedc97ec05694a4794a907c9; _z_identity=true;";
  
  const request = await axios("https://academia.srmist.edu.in/srm_university/academia-academic-services/page/My_Time_Table_2023_24", {
      headers: {
          accept: "*/*",
          "accept-language": "en-US,en;q=0.9",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest",
          cookie,
          Referer: "https://academia.srmist.edu.in/",
          "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      method: "GET",
  });
  
  console.log("Axios Status:", request.status);
  console.log("Axios HTML Length:", request.data.length);
  fs.writeFileSync("axios-probe.html", request.data);
}
test().catch(console.error);
