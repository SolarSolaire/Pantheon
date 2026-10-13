const authService = require('../services/authService');
const jwt = require('jsonwebtoken'); // imports jwt for token generation

class AuthController {
    async register(req, res) {
        try {
            const { username, password } = req.body;
            // calls the service to register the user
            const newUser = await authService.registerUser(username, password);
            
            // generates a JWT token for the new user
            const token = jwt.sign({ user_id: newUser.user_id, username: newUser.username }, 'your-secret-key', { expiresIn: '24h' });

            res.status(201).json({ message: 'User registered successfully', user: newUser, token });
        } catch (err) {
            // checks if registration failed and sends error
            res.status(400).json({ error: err.message });
        }
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            // calls the service to authenticate the user credentials
            const user = await authService.authenticateUser(username, password);
            
            // generates a JWT token upon successful authentication
            const token = jwt.sign({ user_id: user.user_id, username: user.username }, 'your-secret-key', { expiresIn: '24h' });

            res.json({ message: 'Logged in successfully', user, token });
        } catch (err) {
            // checks if authentication failed and sends error
            res.status(401).json({ error: err.message });
        }
    }

    async logout(req, res) {
        try {
            // with JWT, logout is primarily handled on the frontend by clearing localStorage, 
            // but we can send a success response
            res.json({ message: 'Logged out successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Logout failed' });
        }
    }
}

module.exports = new AuthController();