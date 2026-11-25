const express = require('express'); // imports express
const router = express.Router(); // creates an express router
const authController = require('../controllers/authController'); // imports the auth controller
const requireAuth = require('../middleware/requireAuth'); // Use your existing middleware

// routes POST requests for user registration
router.post('/register', (req, res) => authController.register(req, res));

// routes POST requests for user login
router.post('/login', (req, res) => authController.login(req, res));

// routes POST requests for user logout
router.post('/logout', requireAuth, (req, res) => authController.logout(req, res));

router.get('/profile', requireAuth, (req, res) => authController.getProfile(req, res));
router.put('/profile', requireAuth, (req, res) => authController.updateProfile(req, res));

// Changed from '/auth/password' to '/password' to prevent '/auth/auth/password'
// Changed middleware to use your existing requireAuth
router.put('/password', requireAuth, (req, res) => authController.updatePassword(req, res));

module.exports = router;