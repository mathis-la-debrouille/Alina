const db = require('../db');
const bcrypt = require('bcryptjs');
const { generateToken, authenticate, authorizeAdmin } = require('../auth');

async function userRoutes(fastify, options) {
 // Signup route
  fastify.post('/signup', async (request, reply) => {
    const { firstname, email, password, alina_id } = request.body;

    if (!firstname || !email || !password || !alina_id) {
      return reply.status(400).send({ error: 'Missing required fields' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const role = 'simple'; // Default role for new users

    try {
      // Wrap db.run in a Promise
      const userId = await new Promise((resolve, reject) => {
        db.run(
          "INSERT INTO users (firstname, email, password, alina_id, role) VALUES (?, ?, ?, ?, ?)",
          [firstname, email, hashedPassword, alina_id, role],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      // Generate a token for the new user
      const token = generateToken({ id: userId, firstname, role });

      // Send a response with the token and user info
      return reply.send({
        message: 'User created successfully',
        token,
        id: userId,
        user: {
          id: userId,
          firstname,
          email,
          role
        }
      });
    } catch (error) {
      // Check if the error is due to a unique constraint violation on the email field
      if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE constraint failed: users.email')) {
        return reply.status(409).send({ error: 'Email already exists. Please use a different email.' });
      }
      
      console.error('Error creating user:', error);
      return reply.status(500).send({ error: 'An error occurred during user creation' });
    }
  });



  // Login route
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    try {
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const token = generateToken(user);
      return reply.send({ token, id:user.id });
    } catch (error) {
      console.error('Database error:', error);
      return reply.status(500).send({ error: 'An error occurred while processing your request' });
    }
  });

  // List users (admin-only)
  fastify.get('/users', { preHandler: [authenticate, authorizeAdmin] }, async (request, reply) => {
    try {
      const users = await new Promise((resolve, reject) => {
        db.all("SELECT id, firstname, email, role, alina_id FROM users", [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      return reply.send(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return reply.status(500).send({ error: 'Failed to fetch users' });
    }
  });

  // Update user (admin-only)
  fastify.put('/users/:id', { preHandler: [authenticate, authorizeAdmin] }, async (request, reply) => {
    const { id } = request.params;
    const { firstname, email, password, alina_id, role } = request.body;

    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
    const updateFields = [
      firstname ? "firstname = ?" : null,
      email ? "email = ?" : null,
      hashedPassword ? "password = ?" : null,
      alina_id ? "alina_id = ?" : null,
      role ? "role = ?" : null,
    ].filter(Boolean).join(", ");

    const values = [firstname, email, hashedPassword, alina_id, role, id].filter(Boolean);

    try {
      await new Promise((resolve, reject) => {
        db.run(`UPDATE users SET ${updateFields} WHERE id = ?`, values, function (err) {
          if (err) reject(err);
          else resolve();
        });
      });

      return reply.send({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Error updating user:', error);
      return reply.status(500).send({ error: 'Failed to update user' });
    }
  });

    // update user
    fastify.put('/user/update', { preHandler: [authenticate] }, async (request, reply) => {
    const { email, password, alina_id, alina_config } = request.body;
    const { id } = request.user;

    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
    const updateFields = [
        email ? "email = ?" : null,
        hashedPassword ? "password = ?" : null,
        alina_id ? "alina_id = ?" : null,
        alina_config ? "alina_config = ?" : null,
    ].filter(Boolean).join(", ");

    const values = [email, hashedPassword, alina_id, JSON.stringify(alina_config), id].filter(Boolean);

    try {
        const changes = await new Promise((resolve, reject) => {
        db.run(`UPDATE users SET ${updateFields} WHERE id = ?`, values, function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
        });

        if (changes === 0) {
        return reply.status(404).send({ error: 'User not found or no changes applied.' });
        }

        return reply.send({ message: 'Account updated successfully' });
    } catch (error) {
        console.error('Error updating account:', error);
        return reply.status(500).send({ error: 'Failed to update account' });
    }
    });


  // Delete user (admin-only)
  fastify.delete('/users/:id', { preHandler: [authenticate, authorizeAdmin] }, async (request, reply) => {
    const { id } = request.params;

    try {
      const changes = await new Promise((resolve, reject) => {
        db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
          if (err) reject(err);
          else resolve(this.changes);
        });
      });

      if (changes === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      return reply.status(500).send({ error: 'Failed to delete user' });
    }
  });

    // Health check route (admin-only)
    fastify.get('/health', { preHandler: [authenticate, authorizeAdmin] }, async (request, reply) => {
    try {
        const users = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM users", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
        });

        console.log('Users:', users);
        return reply.send({ status: 'Database is up', users });
    } catch (error) {
        console.error('Health check error:', error);
        return reply.status(500).send({ status: 'Database not reachable', error: error.message });
    }
    });

    // Add an ask to a user (admin-only)
    fastify.post('/user/:userId/ask', { preHandler: [authenticate, authorizeAdmin] }, async (request, reply) => {
    const { userId } = request.params;
    const { question, answer, audio_response_s3_url } = request.body;

    const ask_date = new Date().toISOString();

    try {
        const askId = await new Promise((resolve, reject) => {
        db.run(
            "INSERT INTO asks (user_id, question, answer, audio_response_s3_url, ask_date) VALUES (?, ?, ?, ?, ?)",
            [userId, question, answer, audio_response_s3_url, ask_date],
            function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
            }
        );
        });

        return reply.send({ message: 'Ask created successfully', askId });
    } catch (error) {
        console.error('Error creating ask:', error);
        return reply.status(500).send({ error: 'Failed to create ask' });
    }
    });

    // Get asks for the logged-in user
    fastify.get('/user/:userId/asks', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params;


    console.log("HEYEGHE")

    try {
        const asks = await new Promise((resolve, reject) => {
        db.all("SELECT * FROM asks", (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
        });

        console.log(asks)

        return reply.send({ asks });
    } catch (error) {
        console.error('Error fetching asks:', error);
        return reply.status(500).send({ error: 'Failed to retrieve asks' });
    }
    });


    // Get user by ID, accessible by the user themselves or an admin
    fastify.get('/user/:userId', { preHandler: [authenticate] }, async (request, reply) => {
      const { userId } = request.params;
      const { id: requesterId, role } = request.user; // Extract user ID and role from the token

      // Check if the requester is either an admin or the user themselves
      if (role !== 'admin' && parseInt(userId) !== requesterId) {
        return reply.status(403).send({ error: 'Access denied' });
      }

      try {
        const user = await new Promise((resolve, reject) => {
          db.get("SELECT id, firstname, email, role, alina_id, alina_config FROM users WHERE id = ?", [userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });

        // If user not found
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }

        return reply.send(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        return reply.status(500).send({ error: 'Failed to retrieve user' });
      }
    });
}

module.exports = userRoutes;
