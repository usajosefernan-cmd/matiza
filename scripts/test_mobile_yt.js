async function test() {
  const videoId = 'RIdWFv0Mv44';
  const url = `https://m.youtube.com/watch?v=${videoId}`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
    }
  });
  const html = await resp.text();
  console.log('Mobile HTML length:', html.length);
  console.log('Includes captionTracks:', html.includes('captionTracks'));
}
test().catch(console.error);
