const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Accept-Encoding': 'identity'
};

async function test() {
  const videoId = 'RIdWFv0Mv44';
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  
  // 1. Fetch watch page and get cookies
  const resp = await fetch(url, { headers: BROWSER_HEADERS });
  const html = await resp.text();
  
  const cookies = resp.headers.get('set-cookie');
  console.log('Cookies received:', cookies ? cookies.substring(0, 100) + '...' : 'none');
  
  // Extract captionTracks
  const idx = html.indexOf('"captionTracks"');
  if (idx === -1) {
    console.log('No captionTracks');
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
  
  // 2. Fetch track URL with cookies
  const headers = { ...BROWSER_HEADERS };
  if (cookies) {
    headers['Cookie'] = cookies.split(',').map(c => c.split(';')[0]).join('; ');
  }
  
  const subResp = await fetch(track.baseUrl, { headers });
  const xml = await subResp.text();
  console.log('XML status:', subResp.status);
  console.log('XML length:', xml.length);
  if (xml.length > 0) {
    console.log('XML snippet:', xml.substring(0, 300));
  }
}

test().catch(console.error);
