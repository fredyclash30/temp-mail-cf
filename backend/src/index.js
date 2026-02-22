import { Hono } from 'hono';
import { cors } from 'hono/cors';
import PostalMime from 'postal-mime';

const app = new Hono();

const BLOCKED_USERNAMES = ['admin', 'user', 'root', 'support', 'info', 'test', 'webmaster', 'administrator'];

app.use('/api/*', cors());

app.get('/api/emails/:username', async (c) => {
  const username = c.req.param('username').toLowerCase();
  
  if (BLOCKED_USERNAMES.includes(username)) {
    return c.json({ error: "Username ini tidak diizinkan untuk digunakan." }, 403);
  }
  
  const recipient = `${username}@tzmssamns.tech`;
  
  const { results } = await c.env.DB.prepare(
    "SELECT id, sender, subject, created_at FROM emails WHERE recipient = ? ORDER BY created_at DESC"
  ).bind(recipient).all();
  
  return c.json({ emails: results || [] });
});

app.get('/api/emails/detail/:id', async (c) => {
  const id = c.req.param('id');
  
  const email = await c.env.DB.prepare(
    "SELECT * FROM emails WHERE id = ?"
  ).bind(id).first();
  
  if (!email) {
    return c.json({ error: "Email tidak ditemukan" }, 404);
  }
  
  return c.json({ email });
});

export default {
  fetch: app.fetch,
  
  async email(message, env, ctx) {
    const recipient = message.to;
    const username = recipient.split('@')[0].toLowerCase();
    
    if (BLOCKED_USERNAMES.includes(username)) {
      console.log(`Email ditolak! Username '${username}' berada dalam daftar blacklist.`);
      return; 
    }
    
    const rawEmail = await new Response(message.raw).arrayBuffer();
    const parser = new PostalMime();
    const parsedEmail = await parser.parse(rawEmail);
    
    const id = crypto.randomUUID();
    const sender = parsedEmail.from.address || parsedEmail.from.name;
    const subject = parsedEmail.subject || '(Tanpa Subjek)';
    const bodyText = parsedEmail.text || '';
    const bodyHtml = parsedEmail.html || '';
    
    await env.DB.prepare(
      "INSERT INTO emails (id, recipient, sender, subject, body_text, body_html) VALUES (?, ?, ?, ?, ?, ?)"
    ).bind(id, recipient, sender, subject, bodyText, bodyHtml).run();
  }
};
