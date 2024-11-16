const fastify = require('fastify')({ logger: true });
const alinasRoutes = require('./routes/alinas');
const askRoutes = require('./routes/askRoute');
const userRoutes = require('./routes/userRoutes');
const cors = require('@fastify/cors');
require('./mqtt'); // Import the MQTT logic

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
