const express = require('express'); // imports express
const router = express.Router(); // creates an express router
const authController = require('../controllers/authController'); // imports the auth controller
const requireAuth = require('../middleware/requireAuth');

// routes POST requests for user registration
router.post('/register', (req, res) => authController.register(req, res));

// routes POST requests for user login
router.post('/login', (req, res) => authController.login(req, res));

// routes POST requests for user logout
router.post('/logout', requireAuth, (req, res) => authController.logout(req, res));
router.get('/profile', requireAuth, (req, res) => authController.getProfile(req, res));
router.put('/profile', requireAuth, (req, res) => authController.updateProfile(req, res));

module.exports = router;