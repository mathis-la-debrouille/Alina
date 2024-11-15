const axios = require('axios');
require('dotenv').config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function askChatGPT(prompt) {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  console.log("testing prompt");
  console.log(prompt);

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o',
        messages: [
          {"role": "system", "content": "Répond normalement"},
          {"role": "user", "content": prompt}
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error while making request to ChatGPT:', error);
    throw new Error('Failed to connect to ChatGPT');
  }
}

async function askForVocal(gptResponse)
{
  console.log("GROS Check")
  try {
    const voiceResponse = await axios.post(
      'https://api.elevenlabs.io/v1/text-to-speech/cgSgspJ2msm6clMCkdW9',
      {
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0
        },
        text: gptResponse
      },
      {
        headers: {
          Accept: "audio/mpeg",
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json'
        },
        responseType: "stream"
      }
    );
    const filePath = path.join(__dirname, 'generated-voice.mp3');

    // Create a write stream and pipe the response data to it
    const writeStream = fs.createWriteStream(filePath);
    voiceResponse.data.pipe(writeStream);

    // Return a promise that resolves when the stream is finished writing
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });


    // Read the MP3 file to buffer for uploading
    const fileBuffer = fs.readFileSync(filePath);

    // Upload the file to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME, // Your S3 bucket name
      Key: `generated-voices/${Date.now()}-voice.mp3`, // Unique file name
      Body: fileBuffer,
      ContentType: 'audio/mpeg',
      ACL: 'public-read'
    };

    const s3Response = await s3.upload(uploadParams).promise();

    // Return the S3 URL or a success response
    return {
      message: "File uploaded successfully",
      fileUrl: s3Response.Location // This is the URL of the uploaded file
    };
  } catch (error) {
    console.error('Error while making request to elevenlabs:', error);
    throw new Error('Failed to connect to elevenlabs');
  }
}

module.exports = { askChatGPT, askForVocal };
