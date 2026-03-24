require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const contactRoutes = require('./routes/contact');
const inboxRoutes = require('./routes/inbox');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Rate limiter for contact form (max 5 per hour per IP)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many messages sent. Please try again in an hour.' }
});

// Routes
app.use('/api/contact', contactLimiter, contactRoutes);
app.use('/api/inbox', inboxRoutes);

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio running at http://localhost:${PORT}`);
  console.log(`📬 Inbox dashboard at http://localhost:${PORT}/inbox.html`);
  console.log(`\nMake sure to set your .env file with:\n  GEMINI_API_KEY=your_key_here\n`);
});
