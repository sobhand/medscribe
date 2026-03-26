import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { id } = req.query;
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM consultations WHERE id = ${id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Consultation not found' });
    return res.json(rows[0]);
  }

  if (req.method === 'PUT') {
    const rows = await sql`SELECT id FROM consultations WHERE id = ${id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Consultation not found' });

    const body = req.body;
    const allowed = ['transcription', 'anamnesis', 'hypotheses', 'exams', 'treatment', 'patient_summary', 'status', 'audio_duration_seconds'];

    // Collect values, stringify objects
    const vals = {};
    for (const key of allowed) {
      if (body[key] !== undefined) {
        vals[key] = typeof body[key] === 'object' ? JSON.stringify(body[key]) : body[key];
      }
    }

    if (Object.keys(vals).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Build SET clause with positional params
    const setClauses = [];
    const params = [];
    let i = 1;
    for (const [key, value] of Object.entries(vals)) {
      setClauses.push(`${key} = $${i}`);
      params.push(value);
      i++;
    }
    params.push(id);

    await sql(`UPDATE consultations SET ${setClauses.join(', ')} WHERE id = $${i}`, params);

    return res.json({ success: true });
  }

  res.setHeader('Allow', 'GET, PUT');
  return res.status(405).end();
}
