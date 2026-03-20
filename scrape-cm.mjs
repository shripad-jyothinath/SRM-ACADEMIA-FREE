import https from 'https';
import fs from 'fs';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrape() {
  try {
    console.log("Fetching main page...");
    const html = await fetchUrl('https://campusmatrix.vercel.app/');
    
    // Find script tags
    const scriptRegex = /<script[^>]+src="([^"]+)"/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(html)) !== null) {
      // Handle relative paths
      const src = match[1].startsWith('http') ? match[1] : (match[1].startsWith('/') ? `https://campusmatrix.vercel.app${match[1]}` : `https://campusmatrix.vercel.app/${match[1]}`);
      scripts.push(src);
    }
    
    // Also look for link rel=modulepreload
    const preloadRegex = /<link[^>]+href="([^"]+\.js)"/g;
    while ((match = preloadRegex.exec(html)) !== null) {
      const src = match[1].startsWith('http') ? match[1] : (match[1].startsWith('/') ? `https://campusmatrix.vercel.app${match[1]}` : `https://campusmatrix.vercel.app/${match[1]}`);
      if (!scripts.includes(src)) scripts.push(src);
    }

    console.log(`Found ${scripts.length} JS bundles. Extracting text...`);
    
    let allText = '';
    for (const scriptUrl of scripts) {
      console.log(`Fetching ${scriptUrl}...`);
      const js = await fetchUrl(scriptUrl);
      allText += js + '\n';
    }

    // Extract interesting strings (e.g., potential menu items, features)
    // We look for common keywords in SRM apps: attendance, marks, timetable, gpa, cgpa, calc, etc.
    const keywords = ['attendance', 'marks', 'timetable', 'gpa', 'cgpa', 'calculator', 'dashboard', 'profile', 'courses', 'login', 'schedule', 'day order', 'result', 'faculty', 'syllabus', 'fees', 'hostel'];
    
    const foundKeywords = new Set();
    const contextLines = [];
    
    const regex = /"([^"\\]+)"/g; // extract text enclosed in quotes
    while ((match = regex.exec(allText)) !== null) {
      const str = match[1].toLowerCase();
      
      // If the string contains any keyword, and it's reasonably short (like a UI label)
      if (str.length > 2 && str.length < 50) {
        for (const kw of keywords) {
          if (str.includes(kw)) {
            foundKeywords.add(match[1]); // preserve original case
            break; // only add once
          }
        }
      }
    }

    console.log("\n--- EXACT KEYWORD MATCHES (Possible Features / Menu Items) ---");
    const sorted = Array.from(foundKeywords).sort();
    console.log(sorted.join('\n'));
    
    // Also look for React Router paths
    const routeRegex = /path: ?"(\/[^"]*)"/g;
    console.log("\n--- DETECTED ROUTES ---");
    const routes = new Set();
    while ((match = routeRegex.exec(allText)) !== null) {
      routes.add(match[1]);
    }
    console.log(Array.from(routes).join('\n'));
    
    console.log("\nDone parsing bundles.");
    
  } catch (err) {
    console.error("Scrape failed:", err.message);
  }
}

scrape();
