require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// health check & db ping endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await db.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'Pantheon API server is running.',
      dbTime: dbResult.rows[0].now
    });
  } catch (err) {
    console.error('Database connection test failed:', err);
    res.status(500).json({
      status: 'error',
      message: 'API server is running, but database connection failed.',
      error: err.message
    });
  }
});

// mock routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // test connection on server boot
  try {
    const res = await db.query('SELECT NOW()');
    console.log('Aiven DB Connection verified! Server time:', res.rows[0].now);
  } catch (err) {
    console.error('Failed to connect to Aiven DB on startup:', err.message);
  }
});