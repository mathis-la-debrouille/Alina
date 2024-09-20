// routes/alinas.js
const db = require('../db');

async function alinasRoutes(fastify, options) {
  // Route pour récupérer toutes les entrées dans la table alinas
  fastify.get('/alinas', async (request, reply) => {
    db.all("SELECT * FROM alinas", [], (err, rows) => {
      if (err) {
        reply.send(err);
      } else {
        reply.send(rows);
      }
    });
  });

  // Route pour créer une nouvelle Alina
  fastify.post('/alinas', async (request, reply) => {
    const { hard_name, last_know_ip, is_online } = request.body;

    // Validation de base
    if (!hard_name || !last_know_ip || is_online === undefined) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    db.run(
      "INSERT INTO alinas (hard_name, last_know_ip, is_online) VALUES (?, ?, ?)",
      [hard_name, last_know_ip, is_online],
      function (err) {
        if (err) {
          return reply.send(err);  // Utilisation de return ici pour ne pas exécuter reply deux fois
        }

        // Réponse après l'insertion réussie
        reply.send({ id: this.lastID, hard_name, last_know_ip, is_online });
      }
    );
  });

  // Route pour modifier une Alina existante
  fastify.put('/alinas/:id', async (request, reply) => {
    const { id } = request.params;
    const { hard_name, last_know_ip, is_online } = request.body;

    // Validation de base
    if (!hard_name || !last_know_ip || is_online === undefined) {
      reply.status(400).send({ error: 'Missing required fields' });
      return;
    }

    db.run(
      "UPDATE alinas SET hard_name = ?, last_know_ip = ?, is_online = ? WHERE id = ?",
      [hard_name, last_know_ip, is_online, id],
      function (err) {
        if (err) {
          reply.send(err);
        } else if (this.changes === 0) {
          reply.status(404).send({ error: 'Alina not found' });
        } else {
          reply.send({ message: 'Alina updated successfully' });
        }
      }
    );
  });

  // Initialisation de la table Alina si elle n'existe pas encore
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS alinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hard_name TEXT,
      last_know_ip TEXT,
      is_online BOOLEAN
    )`);
  });
}

module.exports = alinasRoutes;
