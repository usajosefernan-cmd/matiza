const clients = [
  { name: 'MWEB', version: '2.20240210.05.00' },
  { name: 'TVHTML5', version: '7.20230405.08.01' },
  { name: 'ANDROID_VR', version: '1.50.29' },
  { name: 'WEB_EMBEDDED_PLAYER', version: '1.20240210.05.00' }
];

async function testClient(clientName, clientVersion) {
  const videoId = 'RIdWFv0Mv44';
  try {
    const response = await fetch('https://www.youtube.com/youtubei/v1/player', {
      method: 'POST',
      body: JSON.stringify({
        videoId: videoId,
        context: {
          client: {
            clientName,
            clientVersion,
            hl: 'es',
            gl: 'ES'
          }
        }
      }),
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    });
    const data = await response.json();
    const status = data.playabilityStatus?.status;
    const hasCaptions = !!data.captions?.playerCaptionsTracklistRenderer;
    console.log(`Client ${clientName}: Status = ${status}, Has Captions = ${hasCaptions}`);
    
    if (hasCaptions) {
      const tracks = data.captions.playerCaptionsTracklistRenderer.captionTracks || [];
      console.log(`  -> Tracks count: ${tracks.length}`);
      if (tracks.length > 0) {
        // Intentar descargar la de español
        const track = tracks.find(t => t.languageCode === 'es') || tracks[0];
        const subResp = await fetch(track.baseUrl + '&fmt=srv1');
        const xml = await subResp.text();
        console.log(`  -> Subtitles XML length: ${xml.length}`);
        if (xml.length > 0) {
          console.log(`  -> Sample: ${xml.substring(0, 150)}`);
          return true; // Success!
        }
      }
    }
  } catch (e) {
    console.log(`Client ${clientName}: Error = ${e.message}`);
  }
  return false;
}

async function run() {
  for (const client of clients) {
    const ok = await testClient(client.name, client.version);
    if (ok) {
      console.log('SUCCESSFUL CLIENT FOUND:', client.name);
      break;
    }
  }
}

run().catch(console.error);
