import { getDb } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM consultations WHERE id = ${id} AND user_id = ${user.id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Consulta não encontrada' });
    return res.json(rows[0]);
  }

  if (req.method === 'PUT') {
    const rows = await sql`SELECT * FROM consultations WHERE id = ${id} AND user_id = ${user.id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Consulta não encontrada' });

    const current = rows[0];
    const b = req.body;

    const val = (key) => {
      if (b[key] === undefined) return current[key];
      return typeof b[key] === 'object' ? JSON.stringify(b[key]) : b[key];
    };

    await sql`
      UPDATE consultations SET
        transcription = ${val('transcription')},
        anamnesis = ${val('anamnesis')},
        hypotheses = ${val('hypotheses')},
        exams = ${val('exams')},
        treatment = ${val('treatment')},
        patient_summary = ${val('patient_summary')},
        status = ${val('status')},
        audio_duration_seconds = ${val('audio_duration_seconds')},
        session_title = ${val('session_title')}
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    return res.json({ success: true });
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM consultations WHERE id = ${id} AND user_id = ${user.id}`;
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).end();
}
