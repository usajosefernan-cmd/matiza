const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  'Accept-Encoding': 'identity'
};

async function test() {
  const videoId = 'RIdWFv0Mv44';
  
  // Try with ucbcb=1 and consent bypass cookies/headers
  const url = `https://www.youtube.com/watch?v=${videoId}&ucbcb=1`;
  console.log('Fetching watch URL with ucbcb=1:', url);
  const resp = await fetch(url, { 
    headers: {
      ...BROWSER_HEADERS,
      'Cookie': 'CONSENT=YES+cb.20210328-17-p0.es+FX+373; SOCS=OTI4OTU3MzMy; YES=1'
    }
  });
  const html = await resp.text();
  
  console.log('HTML length:', html.length);
  const hasCaptionTracks = html.includes('"captionTracks"');
  console.log('Has captionTracks:', hasCaptionTracks);
  
  if (hasCaptionTracks) {
    const idx = html.indexOf('"captionTracks"');
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
    console.log('Caption tracks:', captionTracks);
  } else {
    // Buscar si hay redirección o titulo
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    console.log('Page Title:', titleMatch ? titleMatch[1] : 'No title found');
  }
}

test().catch(console.error);
