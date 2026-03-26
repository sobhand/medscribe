import { getDb } from '../../../lib/db.js';
import { requireAuth } from '../../../lib/auth.js';
import FormData from 'form-data';
import https from 'https';

export const config = {
  maxDuration: 60,
};

function whisperTranscribe(buffer, apiKey) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', buffer, { filename: 'audio.webm', contentType: 'audio/webm' });
    form.append('model', 'whisper-1');
    form.append('language', 'pt');
    form.append('response_format', 'text');

    const req = https.request('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${apiKey}`,
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          try {
            const err = JSON.parse(data);
            reject(new Error(err.error?.message || `Whisper API error ${res.statusCode}`));
          } catch {
            reject(new Error(`Whisper API error ${res.statusCode}: ${data.substring(0, 200)}`));
          }
        } else {
          resolve(data);
        }
      });
    });

    req.on('error', (e) => reject(new Error(`Network error: ${e.message}`)));
    form.pipe(req);
  });
}

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
    // Verify ownership
    const check = await sql`SELECT id FROM consultations WHERE id = ${id} AND user_id = ${user.id}`;
    if (check.length === 0) return res.status(404).json({ error: 'Consulta não encontrada' });

    const { audioBase64, duration } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Nenhum áudio recebido' });
    }

    const dur = parseInt(duration || '0', 10);
    const buffer = Buffer.from(audioBase64, 'base64');

    console.log(`[transcribe] id=${id}, bufferSize=${buffer.length}, duration=${dur}`);

    await sql`UPDATE consultations SET status = 'processing', audio_duration_seconds = ${dur} WHERE id = ${id}`;

    const transcription = await whisperTranscribe(buffer, (process.env.OPENAI_API_KEY || '').trim());

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
