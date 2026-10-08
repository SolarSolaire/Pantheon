const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Your pg pool instance

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Please provide username and password.' });
  }

  try {
    // checks if the user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email is already taken.' });
    }

    // hashes the password securely (10 salt rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // inserts new row into PostgreSQL users table
    const newUserResult = await db.query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, created_at`,
      [username, passwordHash]
    );

    const newUser = newUserResult.rows[0];

    // generates JWT token
    const token = jwt.sign(
      { userId: newUser.id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // sends back success response with token
    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: newUser
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error creating account.' });
  }
});

module.exports = router;