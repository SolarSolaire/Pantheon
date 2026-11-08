const db = require('../config/db');
const bcrypt = require('bcrypt');

const SESSION_DURATION_HOURS = 24;

class AuthService {
  async registerUser(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = await db.query(
        `INSERT INTO users (username, password)
         VALUES ($1, $2)
         RETURNING user_id, username, created_at`,
        [username, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') throw new Error('Username already taken');
      throw error;
    }
  }

  async authenticateUser(username, password) {
    const result = await db.query(
      'SELECT user_id, username, password FROM users WHERE username = $1',
      [username]
    );
    if (!result.rows.length) throw new Error('Invalid username or password');

    const user = result.rows[0];
    if (!(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid username or password');
    }
    return { user_id: user.user_id, username: user.username };
  }

  async createSession(userId) {
    const result = await db.query(
      `INSERT INTO auth_sessions (user_id, expires_at)
       VALUES ($1, CURRENT_TIMESTAMP + ($2 * INTERVAL '1 hour'))
       RETURNING session_id, expires_at`,
      [userId, SESSION_DURATION_HOURS]
    );
    return result.rows[0];
  }

  async logout(sessionId) {
    await db.query(
      `UPDATE auth_sessions
       SET revoked_at = CURRENT_TIMESTAMP
       WHERE session_id = $1 AND revoked_at IS NULL`,
      [sessionId]
    );
  }

  async getProfile(userId) {
    const result = await db.query(
      'SELECT user_id, username, created_at FROM users WHERE user_id = $1',
      [userId]
    );
    return result.rows[0] || null;
  }

  async updateProfile(userId, username) {
    try {
      const result = await db.query(
        `UPDATE users
         SET username = $2
         WHERE user_id = $1
         RETURNING user_id, username, created_at`,
        [userId, username]
      );
      return result.rows[0] || null;
    } catch (error) {
      if (error.code === '23505') throw new Error('Username already taken');
      throw error;
    }
  }
}

module.exports = new AuthService();
