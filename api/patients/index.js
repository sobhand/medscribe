import { getDb } from '../../lib/db.js';
import { requireAuth } from '../../lib/auth.js';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  const sql = getDb();

  if (req.method === 'POST') {
    const { name, date_of_birth, sex, cpf, phone, email, blood_type, allergies, chronic_conditions, current_medications, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome do paciente é obrigatório' });
    }

    const id = uuidv4();
    await sql`
      INSERT INTO patients (id, user_id, name, date_of_birth, sex, cpf, phone, email, blood_type, allergies, chronic_conditions, current_medications, notes)
      VALUES (
        ${id}, ${user.id}, ${name.trim()},
        ${date_of_birth || null}, ${sex || null}, ${cpf || null},
        ${phone || null}, ${email || null}, ${blood_type || null},
        ${JSON.stringify(allergies || [])},
        ${JSON.stringify(chronic_conditions || [])},
        ${JSON.stringify(current_medications || [])},
        ${notes || null}
      )
    `;

    return res.status(201).json({ id, name: name.trim() });
  }

  if (req.method === 'GET') {
    const search = req.query.search || '';

    let rows;
    if (search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      rows = await sql`
        SELECT p.*,
          (SELECT COUNT(*) FROM consultations c WHERE c.patient_id = p.id) as consultation_count,
          (SELECT MAX(c.created_at) FROM consultations c WHERE c.patient_id = p.id) as last_consultation_at
        FROM patients p
        WHERE p.user_id = ${user.id} AND LOWER(p.name) LIKE ${q}
        ORDER BY last_consultation_at DESC NULLS LAST, p.created_at DESC
      `;
    } else {
      rows = await sql`
        SELECT p.*,
          (SELECT COUNT(*) FROM consultations c WHERE c.patient_id = p.id) as consultation_count,
          (SELECT MAX(c.created_at) FROM consultations c WHERE c.patient_id = p.id) as last_consultation_at
        FROM patients p
        WHERE p.user_id = ${user.id}
        ORDER BY last_consultation_at DESC NULLS LAST, p.created_at DESC
      `;
    }

    return res.json(rows);
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
