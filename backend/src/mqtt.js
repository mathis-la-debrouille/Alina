const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');
const db = require('./db');
const { askForVocal } = require('./asksystem');
const { transcribeAudio } = require('./audioService');

const mqttClient = require('./mqttClient'); // Import shared MQTT client

// Connect to the MQTT broker
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Subscribe to general ESP32 topics
  mqttClient.subscribe('esp32/newClient', (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to esp32/newClient');
    }
  });

  // Wildcard subscription for handling client-specific topics
  mqttClient.subscribe('+/audio_send', (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to +/audio_send');
    }
  });
});

// Handle incoming messages
mqttClient.on('message', async (topic, message) => {
  console.log(`Message received on topic ${topic}:`, message.toString());

  try {
    const topicParts = topic.split('/');
    const clientId = topicParts[0];
    const action = topicParts[1];

    // Handle new client registration
    if (topic === 'esp32/newClient') {
        try {
        const newClientInfo = JSON.parse(message.toString());

        const { firstname, email, password, alina_id } = newClientInfo;

        if (!firstname || !email || !password || !alina_id) {
            console.error('Missing required fields for new client.');
            return;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const role = 'simple';

        const userId = await new Promise((resolve, reject) => {
            db.run(
            "INSERT INTO users (firstname, email, password, alina_id, role) VALUES (?, ?, ?, ?, ?)",
            [firstname, email, hashedPassword, alina_id, role],
            function (err) {
                if (err) {
                if (err.code === 'SQLITE_CONSTRAINT' && err.message.includes('UNIQUE constraint failed: users.email')) {
                    console.error('Email already exists. Skipping user creation.');
                    resolve(null);
                } else {
                    reject(err);
                }
                } else {
                resolve(this.lastID);
                }
            }
            );
        });

        if (userId) {
            console.log(`New user created with ID: ${userId}`);

            const token = generateToken({ id: userId, firstname, role });

            // Optional: Publish the token to a client-specific topic
            const clientTopic = `esp32/${newClientInfo.clientId}/token`;
            mqttClient.publish(clientTopic, JSON.stringify({ token }), (err) => {
            if (err) {
                console.error(`Failed to publish token to ${clientTopic}:`, err);
            } else {
                console.log(`Token published to ${clientTopic}`);
            }
            });
        }
        } catch (err) {
        console.error('Error handling new client registration:', err);
        }
    }

    // Handle audio sent from a client
    if (action === 'audio_send') {
      const audioPath = path.join(__dirname, 'received_audio.wav');
      fs.writeFileSync(audioPath, message); // Save incoming audio data

      // Transcribe the audio
      const transcript = await transcribeAudio(fs.createReadStream(audioPath));
      console.log(`Transcription for ${clientId}:`, transcript);

      // Generate vocal response from the transcription
      const vocalResponse = await askForVocal(transcript);

      // Save the Ask in the database
      const ask_date = new Date().toISOString();
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO asks (user_id, question, answer, audio_response_s3_url, ask_date) VALUES (?, ?, ?, ?, ?)`,
          [clientId, transcript, transcript, vocalResponse.fileUrl, ask_date],
          function (err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Publish the response audio URL to the client-specific topic
      const audioReceiveTopic = `${clientId}/audio_receive`;
      mqttClient.publish(audioReceiveTopic, vocalResponse.fileUrl, (err) => {
        if (err) {
          console.error(`Failed to publish to ${audioReceiveTopic}:`, err);
        } else {
          console.log(`Published audio URL to ${audioReceiveTopic}`);
        }
      });
    }
  } catch (err) {
    console.error(`Error handling message on topic ${topic}:`, err);
  }
});

// Handle MQTT errors
mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});

module.exports = mqttClient;
