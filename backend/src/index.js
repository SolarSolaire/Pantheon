require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const initializeDatabase = require('./config/initDb');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const userDataRoutes = require('./routes/userDataRoutes');

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
app.use('/api/user-data', userDataRoutes);

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await initializeDatabase();
    const result = await db.query('SELECT NOW()');
    console.log('PostgreSQL connection verified:', result.rows[0].now);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Backend startup failed:', error.message);
    process.exitCode = 1;
    await db.pool.end();
  }
}

startServer();