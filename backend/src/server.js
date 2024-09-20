// server.js
const fastify = require('fastify')({ logger: true });
const alinasRoutes = require('./routes/alinas');

// Enregistrer les routes
fastify.register(alinasRoutes);

fastify.get('/', async (request, reply) => {
  reply.send({ status: 'Server is up and running!' });
});

// Démarrage du serveur
const start = async () => {
  try {
    await fastify.listen({ port: 3300, host: '0.0.0.0' });
    console.log('Server is listening on http://localhost:3300');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Lancement du serveur
start();
