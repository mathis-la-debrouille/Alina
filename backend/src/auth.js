// src/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const secretKey = process.env.JWT_SECRET || 'your_secret_key';

// Generate a JWT for the user
function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, secretKey, { expiresIn: '1h' });
}

// Middleware to protect routes
function authenticate(request, reply, done) {
  const token = request.headers.authorization?.split(' ')[1];
  if (!token) return reply.status(401).send({ error: 'Token required' });

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return reply.status(403).send({ error: 'Invalid token' });
    request.user = decoded;
    done();
  });
}

// Middleware to check admin role
function authorizeAdmin(request, reply, done) {
  if (request.user.role !== 'admin') {
    return reply.status(403).send({ error: 'Admin privileges required' });
  }
  done();
}

module.exports = { generateToken, authenticate, authorizeAdmin };
