import { getDb } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  const sql = getDb();

  if (req.method === 'GET') {
    const rows = await sql`SELECT * FROM patients WHERE id = ${id} AND user_id = ${user.id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });
    return res.json(rows[0]);
  }

  if (req.method === 'PUT') {
    const rows = await sql`SELECT * FROM patients WHERE id = ${id} AND user_id = ${user.id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Paciente não encontrado' });

    const current = rows[0];
    const b = req.body;
    const val = (key) => b[key] !== undefined ? (typeof b[key] === 'object' && b[key] !== null ? JSON.stringify(b[key]) : b[key]) : current[key];

    await sql`
      UPDATE patients SET
        name = ${val('name')},
        date_of_birth = ${val('date_of_birth')},
        sex = ${val('sex')},
        cpf = ${val('cpf')},
        phone = ${val('phone')},
        email = ${val('email')},
        blood_type = ${val('blood_type')},
        allergies = ${val('allergies')},
        chronic_conditions = ${val('chronic_conditions')},
        current_medications = ${val('current_medications')},
        notes = ${val('notes')},
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${user.id}
    `;

    return res.json({ success: true });
  }

  if (req.method === 'DELETE') {
    await sql`DELETE FROM patients WHERE id = ${id} AND user_id = ${user.id}`;
    return res.json({ success: true });
  }

  res.setHeader('Allow', 'GET, PUT, DELETE');
  return res.status(405).end();
}
