import { getDb } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const sql = getDb();

  if (req.method === 'POST') {
    const { doctor_name, doctor_crm, session_title, patient_id } = req.body;

    const id = uuidv4();
    await sql`
      INSERT INTO consultations (id, user_id, patient_id, doctor_name, doctor_crm, session_title, status)
      VALUES (${id}, ${user.id}, ${patient_id || null}, ${doctor_name || user.name}, ${doctor_crm || user.crm || ''}, ${session_title || null}, 'recording')
    `;

    return res.status(201).json({ id, status: 'recording' });
  }

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, doctor_name, doctor_crm, created_at, audio_duration_seconds,
             status, patient_summary, session_title, error_message
      FROM consultations
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;
    return res.json(rows);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
