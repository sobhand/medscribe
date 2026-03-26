import { getDb } from '../../lib/db.js';
import OpenAI from 'openai';

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
    const { audioBase64, mimeType, duration } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Nenhum áudio recebido' });
    }

    const dur = parseInt(duration || '0', 10);
    if (dur > 0 && dur < 2) {
      return res.status(400).json({ error: 'Gravação muito curta.' });
    }

    const bufferSize = Math.ceil(audioBase64.length * 3 / 4);
    console.log(`[transcribe] id=${id}, base64Len=${audioBase64.length}, bufferSize=${bufferSize}, duration=${dur}`);

    await sql`UPDATE consultations SET status = 'processing', audio_duration_seconds = ${dur} WHERE id = ${id}`;

    // Convert base64 to buffer then to File for OpenAI
    const buffer = Buffer.from(audioBase64, 'base64');
    const file = new File([buffer], 'recording.webm', {
      type: 'audio/webm',
    });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'text',
    });

    console.log(`[transcribe] result length=${transcription.length}, text="${transcription.substring(0, 80)}"`);

    if (!transcription || transcription.trim().length === 0) {
      await sql`UPDATE consultations SET status = 'error', error_message = 'Transcrição vazia' WHERE id = ${id}`;
      return res.status(400).json({ error: 'Não foi possível transcrever. Tente gravar novamente.' });
    }

    await sql`UPDATE consultations SET transcription = ${transcription} WHERE id = ${id}`;
    return res.json({ transcription });
  } catch (error) {
    console.error('[transcribe] Error:', error?.message || error);
    await sql`UPDATE consultations SET status = 'error', error_message = ${error?.message || 'Erro'} WHERE id = ${id}`;
    return res.status(500).json({ error: `Falha na transcrição: ${error?.message || 'Erro desconhecido'}` });
  }
}
