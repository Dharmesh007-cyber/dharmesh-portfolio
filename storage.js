const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/messages.json');

// Ensure data directory and file exist
function ensureDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf8');
}

function getMessages() {
  ensureDB();
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function saveMessage(entry) {
  ensureDB();
  const messages = getMessages();
  const idx = messages.findIndex(m => m.id === entry.id);
  if (idx >= 0) {
    messages[idx] = entry;
  } else {
    messages.unshift(entry);
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(messages, null, 2), 'utf8');
  return entry;
}

function deleteMessage(id) {
  ensureDB();
  const messages = getMessages().filter(m => m.id !== id);
  fs.writeFileSync(DB_PATH, JSON.stringify(messages, null, 2), 'utf8');
}

function updateMessage(id, updates) {
  ensureDB();
  const messages = getMessages();
  const idx = messages.findIndex(m => m.id === id);
  if (idx < 0) return null;
  messages[idx] = { ...messages[idx], ...updates };
  fs.writeFileSync(DB_PATH, JSON.stringify(messages, null, 2), 'utf8');
  return messages[idx];
}

module.exports = { getMessages, saveMessage, deleteMessage, updateMessage };
