// server.js
const fastify = require('fastify')({ logger: true });
const alinasRoutes = require('./routes/alinas');
const askRoutes = require('./routes/askRoute');
const userRoutes = require('./routes/userRoutes');
const cors = require('@fastify/cors');

const mqtt = require('mqtt');

// MQTT Configuration
const mqttOptions = {
  protocol: 'mqtts', // Secure protocol
  host: 'mqtt.alina.massiveusage.com',
  port: 8883,
  ca: [require('fs').readFileSync('/home/ubuntu/alina/ca.crt')],
};

const mqttClient = mqtt.connect(mqttOptions);

// MQTT Connection
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Subscribe to a test topic
  mqttClient.subscribe('test/topic', (err) => {
    if (err) {
      console.error('Subscription error:', err);
    } else {
      console.log('Subscribed to test/topic');
    }
  });
});

// Handle incoming messages
mqttClient.on('message', (topic, message) => {
  console.log(`Message received on topic ${topic}:`, message.toString());
});

// Error handling
mqttClient.on('error', (err) => {
  console.error('MQTT connection error:', err);
});


fastify.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});
fastify.register(alinasRoutes);
fastify.register(askRoutes);
fastify.register(userRoutes);

fastify.get('/', async (request, reply) => {
  reply.send({ status: 'Server is up and running!' });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3300, host: '127.0.0.1' });
    console.log('Server is listening on http://localhost:3300');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
