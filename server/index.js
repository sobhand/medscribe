require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const consultationsRouter = require('./routes/consultations');
const transcriptionRouter = require('./routes/transcription');
const analysisRouter = require('./routes/analysis');
const exportRouter = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api/consultations', consultationsRouter);
app.use('/api/consultations', transcriptionRouter);
app.use('/api/consultations', analysisRouter);
app.use('/api/consultations', exportRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`MedScribe server running on port ${PORT}`);
});
