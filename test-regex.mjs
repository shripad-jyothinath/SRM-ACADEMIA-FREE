import fs from 'fs';

const response = fs.readFileSync('probe-out.html', 'utf8');

const match = response.match(/pageSanitizer\.sanitize\('(.*)'\);/s);

if (!match) {
  console.log("Regex FAILED to match!");
} else {
  console.log("Regex matched! Length:", match[1].length);
}
