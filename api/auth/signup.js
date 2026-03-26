import { getDb } from '../lib/db.js';
import { signToken } from '../lib/auth.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const { name, email, password, crm } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
  }

  const sql = getDb();

  // Check if email exists
  const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase().trim()}`;
  if (existing.length > 0) {
    return res.status(409).json({ error: 'Este email já está cadastrado' });
  }

  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);

  await sql`
    INSERT INTO users (id, name, email, password_hash, crm)
    VALUES (${id}, ${name.trim()}, ${email.toLowerCase().trim()}, ${passwordHash}, ${crm || null})
  `;

  const user = { id, name: name.trim(), email: email.toLowerCase().trim(), crm: crm || null };
  const token = signToken(user);

  return res.status(201).json({ token, user });
}
