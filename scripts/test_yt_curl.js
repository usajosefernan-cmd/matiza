const { execSync } = require('child_process');

async function test() {
  const videoId = 'RIdWFv0Mv44';
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    }
  });
  const html = await resp.text();
  const idx = html.indexOf('"captionTracks"');
  if (idx === -1) {
    console.log('No captionTracks found');
    return;
  }
  const startIdx = html.indexOf('[', idx);
  let braceCount = 1;
  let endIdx = startIdx + 1;
  while (braceCount > 0 && endIdx < html.length) {
    const char = html[endIdx];
    if (char === '[') braceCount++;
    else if (char === ']') braceCount--;
    endIdx++;
  }
  const captionTracks = JSON.parse(html.substring(startIdx, endIdx));
  const track = captionTracks.find(t => t.languageCode === 'es') || captionTracks[0];
  
  console.log('Fetching via curl:', track.baseUrl);
  
  // Guardar URL en un archivo y usar curl
  const curlCmd = `curl -s -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36" "${track.baseUrl}"`;
  const output = execSync(curlCmd).toString();
  console.log('Curl output length:', output.length);
  console.log('Curl output sample:', output.substring(0, 300));
}

test().catch(console.error);
