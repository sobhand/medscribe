const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');
const { getDb } = require('../db/setup');

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// Upload audio
router.post('/:id/audio', upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No audio file provided' });

  const db = getDb();
  const consultation = db.prepare('SELECT id FROM consultations WHERE id = ?').get(req.params.id);
  if (!consultation) {
    fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Consultation not found' });
  }

  // Rename file with proper extension
  const ext = path.extname(req.file.originalname) || '.webm';
  const newPath = req.file.path + ext;
  fs.renameSync(req.file.path, newPath);

  // Store audio path in a simple way (update status)
  db.prepare('UPDATE consultations SET status = ? WHERE id = ?').run('processing', req.params.id);

  res.json({ success: true, audioPath: newPath });
});

// Transcribe audio
router.post('/:id/transcribe', async (req, res) => {
  try {
    const { audioPath } = req.body;
    if (!audioPath) return res.status(400).json({ error: 'audioPath is required' });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      language: 'pt',
      response_format: 'text',
    });

    const db = getDb();
    db.prepare('UPDATE consultations SET transcription = ? WHERE id = ?')
      .run(transcription, req.params.id);

    // Clean up audio file
    try { fs.unlinkSync(audioPath); } catch (e) { /* ignore */ }

    res.json({ transcription });
  } catch (error) {
    console.error('Transcription error:', error);
    const db = getDb();
    db.prepare('UPDATE consultations SET status = ? WHERE id = ?').run('error', req.params.id);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

module.exports = router;
