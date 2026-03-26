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
