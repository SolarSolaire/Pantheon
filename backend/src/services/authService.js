const pool = require('../config/db'); // imports the database connection pool
const bcrypt = require('bcrypt'); // imports bcrypt for hashing passwords

class AuthService {
    async registerUser(username, password) {
        // checks if username already exists in the database
        const existing = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (existing.rows.length > 0) {
            throw new Error('Username already taken');
        }

        // hashes the user password for secure storage
        const hashedPassword = await bcrypt.hash(password, 10);

        // inserts the new user into the database and returns their details
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING user_id, username, created_at',
            [username, hashedPassword]
        );
        return result.rows[0];
    }

    async authenticateUser(username, password) {
        // checks if the user exists in the database
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            throw new Error('Invalid username or password');
        }

        const user = result.rows[0];
        
        // checks if the entered password matches the stored hash
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new Error('Invalid username or password');
        }

        return { user_id: user.user_id, username: user.username };
    }

    async logout(req) {
        // checks and destroys the active user session
        return new Promise((resolve, reject) => {
            req.session.destroy(err => {
                if (err) reject(err);
                else resolve(true);
            });
        });
    }
}

module.exports = new AuthService();