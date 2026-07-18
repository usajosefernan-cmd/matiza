const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Accept-Encoding': 'identity'
};

async function test() {
  const videoId = 'RIdWFv0Mv44';
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const resp = await fetch(url, { headers: BROWSER_HEADERS });
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
  
  console.log('Fetching track:', track.baseUrl);
  const subResp = await fetch(track.baseUrl, { headers: BROWSER_HEADERS });
  const xml = await subResp.text();
  console.log('XML status:', subResp.status);
  console.log('XML length:', xml.length);
  if (xml.length > 0) {
    console.log('Subtitles XML snippet:', xml.substring(0, 500));
  }
}
test().catch(console.error);
