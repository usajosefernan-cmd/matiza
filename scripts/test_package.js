import { YoutubeTranscript } from 'youtube-transcript';

console.log('Fetching transcript with youtube-transcript...');
YoutubeTranscript.fetchTranscript('RIdWFv0Mv44')
  .then(data => {
    console.log('Success!');
    console.log('Segments count:', data.length);
    const fullText = data.map(d => d.text).join(' ');
    console.log('Snippet:', fullText.substring(0, 300));
  })
  .catch(err => {
    console.error('Error fetching transcript:', err);
  });
