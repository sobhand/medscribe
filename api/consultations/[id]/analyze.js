import { getDb } from '../../lib/db.js';
import OpenAI from 'openai';
import { CLINICAL_PROMPT } from '../../lib/prompt.js';

export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const { id } = req.query;
  const sql = getDb();

  try {
    const rows = await sql`SELECT transcription FROM consultations WHERE id = ${id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Consulta não encontrada' });

    const transcription = rows[0].transcription;
    if (!transcription || transcription.trim().length < 10) {
      return res.status(400).json({ error: 'Transcrição vazia ou muito curta para análise' });
    }

    console.log(`[analyze] id=${id}, transcription length=${transcription.length}`);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: CLINICAL_PROMPT },
        { role: 'user', content: `Transcrição da consulta:\n\n${transcription}` },
      ],
    });

    const responseText = completion.choices[0].message.content;
    console.log(`[analyze] response length=${responseText.length}`);

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (e) {
      console.error('[analyze] JSON parse failed, raw response:', responseText.substring(0, 500));
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Resposta da IA não é um JSON válido');
      }
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
    await sql`UPDATE consultations SET status = 'error' WHERE id = ${id}`;
    return res.status(500).json({ error: `Falha na análise: ${error?.message || 'Erro desconhecido'}` });
  }
}
