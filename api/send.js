import fetch from 'node-fetch';

/**
 * Vercel serverless function to forward anonymous messages to Telegram.
 * Endpoint: /api/send
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, topic } = req.body || {};
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return res.status(500).json({ error: 'Missing Telegram credentials' });
    }

    const escapeMarkdown = s => s.replace(/([_*[`>~])/g, '\\$1');
    const textParts = [];
    if (topic) textParts.push(`*Topic:* ${escapeMarkdown(topic)}`);
    textParts.push(`*Anonymous message:*`);
    textParts.push(escapeMarkdown(message.trim().slice(0, 2000)));
    textParts.push(`\n_Sent on ${new Date().toISOString()}_`);
    const text = textParts.join('\n\n');

    const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });

    const data = await r.json();
    if (!r.ok || !data.ok) {
      console.error('Telegram API error', data);
      return res.status(502).json({ error: 'Failed to send to Telegram' });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
}
