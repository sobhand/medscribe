import jwt from 'jsonwebtoken';

const JWT_SECRET = (process.env.JWT_SECRET || 'laudi-dev-secret-change-in-prod').trim();

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, crm: user.crm },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Extract and verify user from Authorization header.
 * Returns user object or null.
 */
export function getUserFromRequest(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Middleware-like helper. Returns user or sends 401.
 */
export function requireAuth(req, res) {
  const user = getUserFromRequest(req);
  if (!user) {
    res.status(401).json({ error: 'Não autorizado. Faça login novamente.' });
    return null;
  }
  return user;
}
