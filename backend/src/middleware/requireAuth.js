const jwt = require('jsonwebtoken');
const db = require('../config/db');

module.exports = async function requireAuth(req, res, next) {
  const authorization = req.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Authentication is required.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(503).json({ message: 'Authentication is not configured.' });
  }

  let claims;
  try {
    claims = jwt.verify(token, secret);
  } catch {
    return res.status(401).json({ message: 'The authentication token is invalid or expired.' });
  }

  if (
    !claims ||
    typeof claims.user_id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      claims.user_id
    ) ||
    typeof claims.session_id !== 'string'
  ) {
    return res.status(401).json({ message: 'The authentication token is invalid.' });
  }

  try {
    const result = await db.query(
      `SELECT 1
       FROM auth_sessions
       WHERE session_id = $1 AND user_id = $2
         AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
      [claims.session_id, claims.user_id]
    );
    if (!result.rows.length) {
      return res.status(401).json({ message: 'The session is invalid or expired.' });
    }

    req.user = claims;
    return next();
  } catch (error) {
    return next(error);
  }
};
