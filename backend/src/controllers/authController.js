const authService = require('../services/authService');
const jwt = require('jsonwebtoken');

function createAuthToken(user, sessionId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Authentication is not configured.');
  return jwt.sign(
    { user_id: user.user_id, username: user.username, session_id: sessionId },
    secret,
    { expiresIn: '24h' }
  );
}

async function createSessionResponse(res, user, status = 200) {
  const session = await authService.createSession(user.user_id);
  const token = createAuthToken(user, session.session_id);
  res.status(status).json({ message: 'Authenticated successfully.', user, token });
}

class AuthController {
  async register(req, res) {
    const { username, password } = req.body || {};
    if (
      typeof username !== 'string' ||
      !username.trim() ||
      username.trim().length > 40 ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return res.status(400).json({
        error: 'Use a username of 1–40 characters and a password of at least 8 characters.'
      });
    }

    try {
      const user = await authService.registerUser(username.trim(), password);
      await createSessionResponse(res, user, 201);
    } catch (error) {
      console.error('Could not register user:', error);
      res.status(error.message === 'Username already taken' ? 409 : 500).json({
        error: error.message === 'Username already taken'
          ? error.message
          : 'Registration failed.'
      });
    }
  }

  async login(req, res) {
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
      const user = await authService.authenticateUser(username, password);
      await createSessionResponse(res, user);
    } catch (error) {
      if (error.message === 'Invalid username or password') {
        return res.status(401).json({ error: error.message });
      }
      console.error('Could not log in user:', error);
      res.status(500).json({ error: 'Login failed.' });
    }
  }

  async logout(req, res) {
    try {
      await authService.logout(req.user.session_id);
      res.json({ message: 'Logged out successfully.' });
    } catch (error) {
      console.error('Could not revoke user session:', error);
      res.status(500).json({ error: 'Logout failed.' });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await authService.getProfile(req.user.user_id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      res.json({ user });
    } catch (error) {
      console.error('Could not load user profile:', error);
      res.status(500).json({ message: 'Could not load user profile.' });
    }
  }

  async updateProfile(req, res) {
    const username = req.body?.username;
    if (typeof username !== 'string' || !username.trim() || username.trim().length > 40) {
      return res.status(400).json({ message: 'Username must be between 1 and 40 characters.' });
    }
    try {
      const user = await authService.updateProfile(req.user.user_id, username.trim());
      if (!user) return res.status(404).json({ message: 'User not found.' });
      res.json({ user });
    } catch (error) {
      if (error.message === 'Username already taken') {
        return res.status(409).json({ message: error.message });
      }
      console.error('Could not update user profile:', error);
      res.status(500).json({ message: 'Could not update user profile.' });
    }
  }
}

module.exports = new AuthController();
