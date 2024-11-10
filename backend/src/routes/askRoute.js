// routes/askRoute.js
const { askChatGPT, askForVocal } = require('../asksystem'); // Import du module asksystem.js
const { transcribeAudio } = require('../audioService'); // Import audio transcription service
const fastifyMultipart = require('@fastify/multipart');

async function askRoutes(fastify, options) {
  // Register the multipart plugin for file uploads
  fastify.register(fastifyMultipart);

  // Route for interacting with ChatGPT
  fastify.post('/ask', async (request, reply) => {
    const { prompt, withVocalAnswer } = request.body;

    if (!prompt) {
      return reply.status(400).send({ error: 'Prompt is required' });
    }

    if (!withVocalAnswer) {
      try {
        const gptResponse = await askChatGPT(prompt);
        return reply.send({ response: gptResponse });
      } catch (error) {
        console.error('Error during GPT request:', error);
        return reply.status(500).send({ error: 'Error during ChatGPT request' });
      }
    }

    try {
      const vocalResponse = await askForVocal(prompt);
      reply.send({ response: vocalResponse });
    } catch (error) {
      console.error('Error during vocal request:', error);
      reply.status(500).send({ error: 'Error during ChatGPT vocal request' });
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
