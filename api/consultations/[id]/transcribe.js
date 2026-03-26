import { getDb } from '../../lib/db.js';
import OpenAI from 'openai';
import { IncomingForm } from 'formidable';
import { readFileSync, unlinkSync } from 'fs';

export const config = {
  maxDuration: 60,
  api: { bodyParser: false },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({ maxFileSize: 50 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const { id } = req.query;
  const sql = getDb();

  try {
    const { fields, files } = await parseForm(req);
    const audioFile = files.audio?.[0] || files.audio;
    const duration = parseInt(fields.duration?.[0] || fields.duration || '0', 10);

    if (!audioFile) {
      return res.status(400).json({ error: 'Nenhum arquivo de áudio recebido' });
    }

    if (duration > 0 && duration < 2) {
      return res.status(400).json({ error: 'Gravação muito curta. Grave pelo menos 3 segundos.' });
    }

    console.log(`[transcribe] id=${id}, fileSize=${audioFile.size}, duration=${duration}`);

    await sql`UPDATE consultations SET status = 'processing', audio_duration_seconds = ${duration} WHERE id = ${id}`;

    // Read file and create a File object for OpenAI
    const buffer = readFileSync(audioFile.filepath);
    const file = new File([buffer], audioFile.originalFilename || 'recording.webm', {
      type: audioFile.mimetype || 'audio/webm',
    });

    // Cleanup temp file
    try { unlinkSync(audioFile.filepath); } catch (e) { /* ignore */ }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'text',
    });

    console.log(`[transcribe] transcription length=${transcription.length}`);

    if (!transcription || transcription.trim().length === 0) {
      await sql`UPDATE consultations SET status = 'error', error_message = 'Transcrição vazia' WHERE id = ${id}`;
      return res.status(400).json({ error: 'Não foi possível transcrever o áudio. Tente gravar novamente.' });
    }

    await sql`UPDATE consultations SET transcription = ${transcription} WHERE id = ${id}`;

    return res.json({ transcription });
  } catch (error) {
    console.error('[transcribe] Error:', error?.message || error);
    await sql`UPDATE consultations SET status = 'error', error_message = ${error?.message || 'Erro na transcrição'} WHERE id = ${id}`;
    return res.status(500).json({ error: `Falha na transcrição: ${error?.message || 'Erro desconhecido'}` });
  }
}
