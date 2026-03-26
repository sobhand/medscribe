import { getDb } from '../../lib/db.js';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
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
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    // Update status
    await sql`UPDATE consultations SET status = 'processing' WHERE id = ${id}`;

    // Convert base64 to buffer then to File for OpenAI
    const buffer = Buffer.from(audioBase64, 'base64');
    const file = new File([buffer], 'recording.webm', { type: mimeType || 'audio/webm' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'text',
    });

    await sql`UPDATE consultations SET transcription = ${transcription} WHERE id = ${id}`;

    return res.json({ transcription });
  } catch (error) {
    console.error('Transcription error:', error);
    await sql`UPDATE consultations SET status = 'error' WHERE id = ${id}`;
    return res.status(500).json({ error: 'Transcription failed' });
  }
}
