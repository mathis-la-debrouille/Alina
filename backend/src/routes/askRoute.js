// routes/askRoute.js
const { askChatGPT, askForVocal } = require('../asksystem'); // Import du module asksystem.js
const { transcribeAudio } = require('../audioService'); // Import audio transcription service
const fastifyMultipart = require('@fastify/multipart');
const { authenticate } = require('../auth'); // Import the authenticate middleware
const db = require('../db');
const mqttClient = require('../mqttClient'); // Import shared MQTT client

async function askRoutes(fastify, options) {
  // Register the multipart plugin for file uploads
  fastify.register(fastifyMultipart);

  // Route for interacting with ChatGPT
  fastify.post('/ask', { preHandler: [authenticate] }, async (request, reply) => {
    const { prompt, withVocalAnswer,  voiceGender, accentOption} = request.body;
    const userId = request.user.id; // Extract user ID from the token

    if (!prompt) {
      return reply.status(400).send({ error: 'Prompt is required' });
    }

    try {
      const alinaId = await new Promise((resolve, reject) => {
        db.get("SELECT alina_id FROM users WHERE id = ?", [userId], (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new Error('User not found'));
          else resolve(row.alina_id);
        });
      });

      if (!alinaId) {
        return reply.status(400).send({ error: 'User does not have an alina_id assigned' });
      }

      // Step 1: Get GPT response
      const gptResponse = await askChatGPT(prompt);
      const answer = gptResponse.choices[0].message.content;

      console.log(answer)

      let audio_response_s3_url = null;

      // Step 2: Generate vocal response if requested
      if (withVocalAnswer) {
        const vocalResponse = await askForVocal(answer, voiceGender, accentOption);
        audio_response_s3_url = vocalResponse.fileUrl; // URL from the vocal response
      }

      console.log("after vocal")
      // Step 3: Save ask in the database, associating it with the user
      const ask_date = new Date().toISOString();
      await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO asks (user_id, question, answer, audio_response_s3_url, ask_date) VALUES (?, ?, ?, ?, ?)",
          [userId, prompt, answer, audio_response_s3_url, ask_date],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      if (withVocalAnswer && audio_response_s3_url && alinaId) {
        const topic = `${alinaId}/audio_receive`;
        mqttClient.publish(topic, JSON.stringify({ audioUrl: audio_response_s3_url }), (err) => {
          if (err) {
            console.error(`Failed to publish to MQTT topic ${topic}:`, err);
          } else {
            console.log(`Published audio URL to MQTT topic ${topic}`);
          }
        });
      }

      // Step 4: Send response with question, answer, and audio_response_s3_url
      return reply.send({
        question: prompt,
        answer: answer,
        audio_response_s3_url: audio_response_s3_url
      });
    } catch (error) {
      console.error('Error during the ChatGPT or vocal process:', error);
      return reply.status(500).send({ error: 'An error occurred while processing your request' });
    }
  });

  // Route for audio transcription
  fastify.post('/listen', async (request, reply) => {
    const data = await request.file();

    // Log the MIME type to troubleshoot
    console.log("Detected MIME type:", data.mimetype);

    // Check for acceptable WAV MIME types
    const allowedMimeTypes = ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/x-pn-wav'];
    if (!data || !allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({ error: 'Only WAV audio files are supported.' });
    }

    try {
      const transcript = await transcribeAudio(data.file); // Pass the file stream to the transcription service
      reply.send({ text: transcript });
    } catch (error) {
      console.error('Error during audio transcription:', error);
      reply.status(500).send({ error: 'Error during audio transcription' });
    }
  });

  // Combined route: transcription -> ChatGPT -> vocal response
  fastify.post('/flow', async (request, reply) => {
    const data = await request.file();

    // Check if the file is a WAV file
    console.log("Detected MIME type:", data.mimetype);
    const allowedMimeTypes = ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/x-pn-wav'];
    if (!data || !allowedMimeTypes.includes(data.mimetype)) {
      return reply.status(400).send({ error: 'Only WAV audio files are supported.' });
    }

    try {
      // Step 1: Transcribe audio to text
      const transcript = await transcribeAudio(data.file);
      console.log('Transcription:', transcript);

      // Step 2: Send transcription to ChatGPT
      let gptResponse = await askChatGPT(transcript);
      console.log('ChatGPT Response:', gptResponse);
      
      gptResponse = gptResponse.choices[0].message.content;

      // Step 3: Generate vocal response from ChatGPT output
      const vocalResponse = await askForVocal(gptResponse);
      console.log('Vocal Response:', vocalResponse);

      // Send the final vocal response
      reply.send({ text: transcript, gptResponse, vocalResponse });
    } catch (error) {
      console.error('Error during flow process:', error);
      reply.status(500).send({ error: 'Error during the flow process' });
    }
  });
}

module.exports = askRoutes;
