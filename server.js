const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const db = new Database('data.db');

app.use(express.json());
app.use(express.static('public'));

// Add color column if it doesn't exist
db.exec(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  color TEXT DEFAULT NULL
)`);

// Migration: add color column to existing table if missing
try {
  db.exec(`ALTER TABLE messages ADD COLUMN color TEXT DEFAULT NULL`);
} catch (e) { /* column already exists, ignore */ }

app.get('/messages', (req, res) => {
  const rows = db.prepare('SELECT * FROM messages').all();
  res.json(rows);
});

app.post('/messages', (req, res) => {
  const { text, color } = req.body;
  const result = db.prepare('INSERT INTO messages (text, color) VALUES (?, ?)').run(text, color || null);
  res.json({ id: result.lastInsertRowid, text, color });
});

app.put('/messages/:id', (req, res) => {
  const { text, color } = req.body;
  db.prepare('UPDATE messages SET text = ?, color = ? WHERE id = ?').run(text, color || null, req.params.id);
  res.json({ success: true });
});

app.delete('/messages/:id', (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));