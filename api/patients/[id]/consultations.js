import { getDb } from '../../../lib/db.js';
import { requireAuth } from '../../../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  const sql = getDb();

  // Verify patient belongs to user
  const patient = await sql`SELECT id FROM patients WHERE id = ${id} AND user_id = ${user.id}`;
  if (patient.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });

  const rows = await sql`
    SELECT id, created_at, status, patient_summary, audio_duration_seconds, error_message, session_title
    FROM consultations
    WHERE patient_id = ${id} AND user_id = ${user.id}
    ORDER BY created_at DESC
  `;

  return res.json(rows);
}
