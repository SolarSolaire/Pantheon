// server.js
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');

const app = express();

// checks if middleware configuration allows credentials from frontend
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(session({
    secret: 'your-super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// mounts auth routes under /api/auth
app.use('/api/auth', authRoutes);

app.listen(5000, () => {
    console.log('Server running on port 5000');
});