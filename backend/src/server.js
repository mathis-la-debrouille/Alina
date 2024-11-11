// server.js
const fastify = require('fastify')({ logger: true });
const alinasRoutes = require('./routes/alinas');
const askRoutes = require('./routes/askRoute');
const userRoutes = require('./routes/userRoutes');

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
