const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { getDb } = require('../db/setup');

const router = express.Router();

const PROMPT_PATH = path.join(__dirname, '..', 'prompts', 'clinical-analysis.md');

router.post('/:id/analyze', async (req, res) => {
  try {
    const db = getDb();
    const consultation = db.prepare('SELECT transcription FROM consultations WHERE id = ?')
      .get(req.params.id);

    if (!consultation) return res.status(404).json({ error: 'Consultation not found' });
    if (!consultation.transcription) return res.status(400).json({ error: 'No transcription available' });

    const systemPrompt = fs.readFileSync(PROMPT_PATH, 'utf-8');

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Transcrição da consulta:\n\n${consultation.transcription}`,
        },
      ],
      system: systemPrompt,
    });

    const responseText = message.content[0].text;

    let analysis;
    try {
      analysis = JSON.parse(responseText);
    } catch (e) {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse Claude response as JSON');
      }
    }

    // Update consultation with analysis results
    db.prepare(`
      UPDATE consultations
      SET anamnesis = ?, hypotheses = ?, exams = ?, treatment = ?,
          patient_summary = ?, status = 'completed'
      WHERE id = ?
    `).run(
      JSON.stringify(analysis.anamnesis),
      JSON.stringify(analysis.diagnostic_hypotheses),
      JSON.stringify(analysis.complementary_exams),
      JSON.stringify(analysis.treatment),
      analysis.patient_summary,
      req.params.id
    );

    res.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    const db = getDb();
    db.prepare('UPDATE consultations SET status = ? WHERE id = ?').run('error', req.params.id);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

module.exports = router;
