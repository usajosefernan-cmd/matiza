const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
};

async function test() {
  const videoId = 'RIdWFv0Mv44';
  const resp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers: BROWSER_HEADERS });
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
  let track = captionTracks.find(t => t.languageCode === 'es') || captionTracks[0];
  
  console.log('Exact Track URL:', track.baseUrl);
  
  // Try 1: fetch without headers
  const subResp = await fetch(track.baseUrl);
  const xml = await subResp.text();
  console.log('xml length:', xml.length);
  console.log('xml start:', xml.substring(0, 400));
}

test().catch(console.error);
