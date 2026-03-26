import { getDb } from '../../../lib/db.js';
import { requireAuth } from '../../../lib/auth.js';
import OpenAI from 'openai';
import { CLINICAL_PROMPT, buildContextualPrompt } from '../../../lib/prompt.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const user = requireAuth(req, res);
  if (!user) return;

  const { id } = req.query;
  const sql = getDb();

  try {
    const rows = await sql`SELECT transcription, patient_id FROM consultations WHERE id = ${id} AND user_id = ${user.id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Consulta não encontrada' });

    const transcription = rows[0].transcription;
    if (!transcription || transcription.trim().length < 10) {
      return res.status(400).json({ error: 'Transcrição vazia ou muito curta para análise' });
    }

    // Fetch patient record and history for compounding intelligence
    let patient = null;
    let previousConsultations = [];

    if (rows[0].patient_id) {
      const patientRows = await sql`SELECT * FROM patients WHERE id = ${rows[0].patient_id}`;
      patient = patientRows[0] || null;

      previousConsultations = await sql`
        SELECT patient_summary, anamnesis, hypotheses, treatment, created_at
        FROM consultations
        WHERE patient_id = ${rows[0].patient_id} AND id != ${id} AND status = 'completed'
        ORDER BY created_at DESC LIMIT 5
      `;
    }

    // Build contextual prompt with patient history + doctor specialty
    const systemPrompt = patient || previousConsultations.length > 0 || user.specialty
      ? buildContextualPrompt(patient, previousConsultations, user.specialty)
      : CLINICAL_PROMPT;

    console.log(`[analyze] id=${id}, patient=${patient?.name || 'none'}, history=${previousConsultations.length}, specialty=${user.specialty || 'none'}, promptLen=${systemPrompt.length}`);

    const openai = new OpenAI({ apiKey: (process.env.OPENAI_API_KEY || '').trim() });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Transcrição da consulta:\n\n${transcription}` },
      ],
    });

    const responseText = completion.choices[0].message.content;

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (e) {
      console.error('[analyze] JSON parse failed:', responseText.substring(0, 300));
      throw new Error('Resposta da IA não é um JSON válido');
    }

    await sql`
      UPDATE consultations
      SET anamnesis = ${JSON.stringify(analysis.anamnesis || {})},
          hypotheses = ${JSON.stringify(analysis.diagnostic_hypotheses || [])},
          exams = ${JSON.stringify(analysis.complementary_exams || [])},
          treatment = ${JSON.stringify(analysis.treatment || {})},
          patient_summary = ${analysis.patient_summary || 'Consulta sem resumo'},
          status = 'completed'
      WHERE id = ${id}
    `;

    return res.json(analysis);
  } catch (error) {
    console.error('[analyze] Error:', error?.message || error);
    await sql`UPDATE consultations SET status = 'error', error_message = ${error?.message || 'Erro na análise'} WHERE id = ${id}`;
    return res.status(500).json({ error: `Falha na análise: ${error?.message || 'Erro desconhecido'}` });
  }
}
