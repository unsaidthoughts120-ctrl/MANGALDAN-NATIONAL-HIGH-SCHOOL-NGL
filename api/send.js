export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message, topic } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: "Server not configured properly." });
  }

  const text = `
💌 *New Anonymous Message!*

${topic ? `🧩 *Topic:* ${topic}\n` : ""}
📝 *Message:*
${message}

⏰ ${new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" })}
`;

  try {
    const tg = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "Markdown"
      })
    });

    const data = await tg.json();
    if (!tg.ok) throw new Error(data.description);

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("Telegram error:", e);
    return res.status(500).json({ error: "Failed to send Telegram message." });
  }
}
