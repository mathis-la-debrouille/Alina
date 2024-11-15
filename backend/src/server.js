// server.js
const fastify = require('fastify')({ logger: true });
const alinasRoutes = require('./routes/alinas');
const askRoutes = require('./routes/askRoute');
const userRoutes = require('./routes/userRoutes');
const cors = require('@fastify/cors');

//MQTTS
const aedes = require('aedes');
const { createServer } = require('aedes-server-factory');
// Create MQTT broker
const mqttBroker = aedes();

// Create the MQTT server listening on 8883 (behind the ALB)
const mqttsServer = createServer(mqttBroker);

// Listen for MQTT connections on port 8883
mqttsServer.listen(8883, () => {
  console.log('MQTTS server is running behind the ALB on mqtts://mqtt.alina.massiveusage.com:443');
});

// Log events
mqttBroker.on('clientReady', (client) => {
  console.log(`Client connected: ${client.id}`);
});

mqttBroker.on('clientDisconnect', (client) => {
  console.log(`Client disconnected: ${client.id}`);
});

mqttBroker.on('publish', (packet, client) => {
  if (client) {
    console.log(`Message published by ${client.id}:`, packet.payload.toString());
  }
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
