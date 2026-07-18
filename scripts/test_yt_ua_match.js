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
  console.log('HTML status:', resp.status);
  console.log('HTML Length:', html.length);
  console.log('HTML Sample:', html.substring(0, 1000));
}

test().catch(console.error);
