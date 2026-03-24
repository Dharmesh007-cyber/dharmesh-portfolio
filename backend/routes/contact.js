const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { analyzeWithGemini } = require('../services/gemini');
const { saveMessage, getMessages } = require('../services/storage');

// POST /api/contact — receive a new contact message
router.post('/', async (req, res) => {
  const { name, email, subject, message, company } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const entry = {
    id: uuidv4(),
    name,
    email,
    subject: subject || '(No subject)',
    message,
    company: company || '',
    timestamp: new Date().toISOString(),
    analyzed: false,
    geminiAnalysis: null,
    score: 0,
    tags: [],
    priority: 'normal'
  };

  try {
    // Run Gemini analysis in the background
    analyzeWithGemini(entry).then(analysis => {
      entry.geminiAnalysis = analysis;
      entry.analyzed = true;
      entry.score = analysis.score || 0;
      entry.tags = analysis.tags || [];
      entry.priority = analysis.priority || 'normal';
      saveMessage(entry);
    }).catch(err => {
      console.error('Gemini analysis failed:', err.message);
      entry.analyzed = true;
      entry.geminiAnalysis = { error: 'Analysis unavailable', summary: message.slice(0, 120) };
      saveMessage(entry);
    });

    // Save immediately without waiting for analysis
    saveMessage(entry);

    res.json({
      success: true,
      message: "Thanks for reaching out! I'll get back to you soon.",
      id: entry.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process your message.' });
  }
});

module.exports = router;
