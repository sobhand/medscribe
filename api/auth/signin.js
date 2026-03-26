import { getDb } from '../../lib/db.js';
import { signToken } from '../../lib/auth.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  const sql = getDb();
  const rows = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}`;

  if (rows.length === 0) {
    return res.status(401).json({ error: 'Email ou senha incorretos' });
  }

  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    return res.status(401).json({ error: 'Email ou senha incorretos' });
  }

  const token = signToken({
    id: user.id,
    name: user.name,
    email: user.email,
    crm: user.crm,
    specialty: user.specialty,
  });

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, crm: user.crm, specialty: user.specialty },
  });
}
