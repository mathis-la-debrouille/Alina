// audioService.js
const speech = require('@google-cloud/speech');
require('dotenv').config();
const fs = require('fs');

function saveBase64AsFile(base64String, outputPath) {
  const buffer = Buffer.from(base64String, 'base64');
  fs.writeFileSync(outputPath, buffer);
  console.log(`File saved to ${outputPath}`);
}

const client = new speech.SpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // handle newlines if stored as a single-line env var
  },
});

async function transcribeAudio(fileStream) {
  const audioBytes = await streamToBase64(fileStream);

  // Save decoded file for verification
  saveBase64AsFile(audioBytes, './decoded_audio.wav');

  const audio = {
    content: audioBytes,
  };
  
  const config = {
    encoding: 'WAV',       
    languageCode: 'fr-FR',      
    model: 'default',
  };

  const request = {
    audio: audio,
    config: config,
  };

  const [response] = await client.recognize(request);
  console.log(response);
  
  if (response.results.length === 0) {
    throw new Error('No speech detected in audio.');
  }

  const transcription = response.results.map(result => result.alternatives[0].transcript).join('\n');
  return transcription;
}

function streamToBase64(stream) {
  return new Promise((resolve, reject) => { 
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')));
    stream.on('error', reject);
  });
}

module.exports = { transcribeAudio };
