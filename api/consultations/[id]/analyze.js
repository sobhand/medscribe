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
    if (rows.length === 0) return res.status(404).json({ error: 'Consultation not found' });
    if (!rows[0].transcription) return res.status(400).json({ error: 'No transcription available' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      messages: [
        { role: 'system', content: CLINICAL_PROMPT },
        { role: 'user', content: `Transcrição da consulta:\n\n${rows[0].transcription}` },
      ],
    });

    const responseText = completion.choices[0].message.content;

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse GPT response as JSON');
      }
    }

    await sql`
      UPDATE consultations
      SET anamnesis = ${JSON.stringify(analysis.anamnesis)},
          hypotheses = ${JSON.stringify(analysis.diagnostic_hypotheses)},
          exams = ${JSON.stringify(analysis.complementary_exams)},
          treatment = ${JSON.stringify(analysis.treatment)},
          patient_summary = ${analysis.patient_summary},
          status = 'completed'
      WHERE id = ${id}
    `;

    return res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    await sql`UPDATE consultations SET status = 'error' WHERE id = ${id}`;
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
