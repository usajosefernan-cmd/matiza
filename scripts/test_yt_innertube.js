async function test() {
  const videoId = 'RIdWFv0Mv44';
  
  console.log('Sending request to InnerTube API (ANDROID) for video:', videoId);
  const response = await fetch('https://www.youtube.com/youtubei/v1/player', {
    method: 'POST',
    body: JSON.stringify({
      videoId: videoId,
      context: {
        client: {
          clientName: 'ANDROID',
          clientVersion: '17.31.35',
          androidSdkVersion: 30
        }
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  console.log('InnerTube status:', response.status);
  const data = await response.json();
  
  const playabilityStatus = data.playabilityStatus || {};
  console.log('Playability Status:', playabilityStatus.status);
  console.log('Reason:', playabilityStatus.reason);
  
  const captions = data.captions || {};
  console.log('Has captions:', !!captions.playerCaptionsTracklistRenderer);
  
  if (captions.playerCaptionsTracklistRenderer) {
    const tracks = captions.playerCaptionsTracklistRenderer.captionTracks || [];
    console.log('Caption tracks found:', tracks.length);
    for (const track of tracks) {
      console.log(`- Lang: ${track.languageCode}, Kind: ${track.kind || 'manual'}, URL: ${track.baseUrl}`);
    }
    
    // Probar a descargar la primera
    if (tracks.length > 0) {
      const track = tracks.find(t => t.languageCode === 'es') || tracks[0];
      const subResp = await fetch(track.baseUrl + '&fmt=srv1');
      const xml = await subResp.text();
      console.log('XML length:', xml.length);
      if (xml.length > 0) {
        console.log('XML snippet:', xml.substring(0, 300));
      }
    }
  }
}

test().catch(console.error);
