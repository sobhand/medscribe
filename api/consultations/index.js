import { getDb } from '../lib/db.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const sql = getDb();

  if (req.method === 'POST') {
    const { doctor_name, doctor_crm, session_title } = req.body;
    if (!doctor_name || !doctor_crm) {
      return res.status(400).json({ error: 'doctor_name and doctor_crm are required' });
    }

    const id = uuidv4();
    await sql`
      INSERT INTO consultations (id, doctor_name, doctor_crm, session_title, status)
      VALUES (${id}, ${doctor_name}, ${doctor_crm}, ${session_title || null}, 'recording')
    `;

    return res.status(201).json({ id, status: 'recording' });
  }

  if (req.method === 'GET') {
    const rows = await sql`
      SELECT id, doctor_name, doctor_crm, created_at, audio_duration_seconds,
             status, patient_summary, session_title, error_message
      FROM consultations
      ORDER BY created_at DESC
    `;
    return res.json(rows);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
