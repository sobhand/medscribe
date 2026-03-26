const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/setup');

const router = express.Router();

// Create new consultation
router.post('/', (req, res) => {
  const { doctor_name, doctor_crm } = req.body;
  if (!doctor_name || !doctor_crm) {
    return res.status(400).json({ error: 'doctor_name and doctor_crm are required' });
  }

  const id = uuidv4();
  const db = getDb();
  db.prepare(`
    INSERT INTO consultations (id, doctor_name, doctor_crm, status)
    VALUES (?, ?, ?, 'recording')
  `).run(id, doctor_name, doctor_crm);

  res.status(201).json({ id, status: 'recording' });
});

// List consultations
router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT id, doctor_name, doctor_crm, created_at, audio_duration_seconds,
           status, patient_summary
    FROM consultations
    ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

// Get single consultation
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM consultations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Consultation not found' });

  // Parse JSON fields
  if (row.anamnesis) row.anamnesis = JSON.parse(row.anamnesis);
  if (row.hypotheses) row.hypotheses = JSON.parse(row.hypotheses);
  if (row.exams) row.exams = JSON.parse(row.exams);
  if (row.treatment) {
    try { row.treatment = JSON.parse(row.treatment); } catch (e) { /* keep as string */ }
  }

  res.json(row);
});

// Update consultation
router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM consultations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Consultation not found' });

  const fields = [];
  const values = [];
  const allowed = ['transcription', 'anamnesis', 'hypotheses', 'exams', 'treatment', 'patient_summary', 'status', 'audio_duration_seconds'];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      fields.push(`${key} = ?`);
      const val = typeof req.body[key] === 'object' ? JSON.stringify(req.body[key]) : req.body[key];
      values.push(val);
    }
  }

  if (fields.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

  values.push(req.params.id);
  db.prepare(`UPDATE consultations SET ${fields.join(', ')} WHERE id = ?`).run(...values);

  res.json({ success: true });
});

module.exports = router;
