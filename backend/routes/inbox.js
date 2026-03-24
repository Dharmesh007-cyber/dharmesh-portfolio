const express = require('express');
const router = express.Router();
const { getMessages, deleteMessage, updateMessage } = require('../services/storage');

// Simple admin token check (set ADMIN_TOKEN in .env)
function authCheck(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  const adminToken = process.env.ADMIN_TOKEN || 'admin123';
  if (token !== adminToken) {
    return res.status(401).json({ error: 'Unauthorized. Provide x-admin-token header.' });
  }
  next();
}

// GET /api/inbox — get all messages, sorted by score desc
router.get('/', authCheck, (req, res) => {
  const messages = getMessages();
  const { filter, sort } = req.query;

  let result = [...messages];

  // Filter by priority
  if (filter && filter !== 'all') {
    result = result.filter(m => m.priority === filter);
  }

  // Sort
  if (sort === 'date') {
    result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else {
    // Default: sort by Gemini score
    result.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  res.json({ total: result.length, messages: result });
});

// GET /api/inbox/:id
router.get('/:id', authCheck, (req, res) => {
  const messages = getMessages();
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) return res.status(404).json({ error: 'Not found' });
  res.json(msg);
});

// DELETE /api/inbox/:id
router.delete('/:id', authCheck, (req, res) => {
  deleteMessage(req.params.id);
  res.json({ success: true });
});

// PATCH /api/inbox/:id — mark read/starred
router.patch('/:id', authCheck, (req, res) => {
  const updated = updateMessage(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

// GET /api/inbox/stats/overview
router.get('/stats/overview', authCheck, (req, res) => {
  const messages = getMessages();
  const stats = {
    total: messages.length,
    high: messages.filter(m => m.priority === 'high').length,
    normal: messages.filter(m => m.priority === 'normal').length,
    low: messages.filter(m => m.priority === 'low').length,
    unread: messages.filter(m => !m.read).length,
    avgScore: messages.length
      ? Math.round(messages.reduce((s, m) => s + (m.score || 0), 0) / messages.length)
      : 0
  };
  res.json(stats);
});

module.exports = router;
