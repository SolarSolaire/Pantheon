const express = require('express'); // imports express
const router = express.Router(); // creates an express router
const authController = require('../controllers/authController'); // imports the auth controller

// routes POST requests for user registration
router.post('/register', (req, res) => authController.register(req, res));

// routes POST requests for user login
router.post('/login', (req, res) => authController.login(req, res));

// routes POST requests for user logout
router.post('/logout', (req, res) => authController.logout(req, res));

module.exports = router;