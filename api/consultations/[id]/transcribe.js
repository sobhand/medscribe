import { getDb } from '../../lib/db.js';
import OpenAI from 'openai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
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
    const { audioBase64, mimeType, duration } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    if (duration !== undefined && duration < 2) {
      return res.status(400).json({ error: 'Gravação muito curta. Grave pelo menos 2 segundos.' });
    }

    console.log(`[transcribe] id=${id}, base64Length=${audioBase64.length}, mimeType=${mimeType}, duration=${duration}`);

    // Update status
    await sql`UPDATE consultations SET status = 'processing', audio_duration_seconds = ${duration || 0} WHERE id = ${id}`;

    // Convert base64 to buffer
    const buffer = Buffer.from(audioBase64, 'base64');
    console.log(`[transcribe] buffer size=${buffer.length} bytes`);

    // Create a File object compatible with OpenAI SDK
    const file = new File([buffer], 'recording.webm', { type: 'audio/webm' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'text',
    });

    console.log(`[transcribe] transcription length=${transcription.length}`);

    if (!transcription || transcription.trim().length === 0) {
      await sql`UPDATE consultations SET status = 'error' WHERE id = ${id}`;
      return res.status(400).json({ error: 'Não foi possível transcrever o áudio. Tente gravar novamente com voz mais clara.' });
    }

    await sql`UPDATE consultations SET transcription = ${transcription} WHERE id = ${id}`;

    return res.json({ transcription });
  } catch (error) {
    console.error('[transcribe] Error:', error?.message || error, error?.response?.data || '');
    await sql`UPDATE consultations SET status = 'error' WHERE id = ${id}`;
    return res.status(500).json({ error: `Falha na transcrição: ${error?.message || 'Erro desconhecido'}` });
  }
}
