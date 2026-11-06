const ALLOWED = new Set([
  'https://fishcozy.com',
  'https://www.fishcozy.com',
  'https://dydtjr13.github.io',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
  'http://localhost:5500',
  'null', // file:// iframe edge
]);

function corsHeaders(origin) {
  const o = origin && (ALLOWED.has(origin) || /^https:\/\/([a-z0-9-]+\.)?dydtjr13\.github\.io$/i.test(origin) || /^http:\/\/localhost(:\d+)?$/i.test(origin))
    ? origin
    : 'https://fishcozy.com';
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(origin) },
  });
}

function bad(msg, status, origin) {
  return json({ ok: false, error: msg }, status || 400, origin);
}

function id(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function cleanNick(n) {
  return String(n || '낚시꾼').replace(/[<>]/g, '').trim().slice(0, 10) || '낚시꾼';
}

function cleanText(s, max) {
  return String(s || '').replace(/\0/g, '').trim().slice(0, max);
}

function isAdmin(req, env) {
  const key = env.ADMIN_KEY;
  if (!key) return false;
  return req.headers.get('X-Admin-Key') === key;
}

async function listPosts(db, url) {
  const cat = url.searchParams.get('cat');
  const limit = Math.min(100, Math.max(1, +(url.searchParams.get('limit') || 50)));
  const offset = Math.max(0, +(url.searchParams.get('offset') || 0));
  let rows;
  if (cat) {
    rows = await db.prepare(
      `SELECT p.*, (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) AS comment_count
       FROM posts p WHERE p.cat=? ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    ).bind(cat, limit, offset).all();
  } else {
    rows = await db.prepare(
      `SELECT p.*, (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) AS comment_count
       FROM posts p ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
    ).bind(limit, offset).all();
  }
  return rows.results || [];
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    try {
      if (path === '/health' || path === '/') {
        return json({ ok: true, service: 'fishcozy-board-api', brand: 'FISH COZY' }, 200, origin);
      }
      if (!env.DB) return bad('DB binding missing', 500, origin);

      if (request.method === 'GET' && path === '/posts') {
        const posts = await listPosts(env.DB, url);
        return json({ ok: true, posts }, 200, origin);
      }

      const postOne = path.match(/^\/posts\/([^/]+)$/);
      if (request.method === 'GET' && postOne) {
        const pid = decodeURIComponent(postOne[1]);
        const post = await env.DB.prepare('SELECT * FROM posts WHERE id=?').bind(pid).first();
        if (!post) return bad('not found', 404, origin);
        const cms = await env.DB.prepare(
          'SELECT * FROM comments WHERE post_id=? ORDER BY created_at ASC'
        ).bind(pid).all();
        return json({ ok: true, post, comments: cms.results || [] }, 200, origin);
      }

      if (request.method === 'POST' && path === '/posts') {
        const body = await request.json().catch(() => null);
        if (!body) return bad('invalid json', 400, origin);
        const title = cleanText(body.title, 60);
        const text = cleanText(body.body, 2000);
        const cat = cleanText(body.cat, 40) || '💬 자유';
        const nick = cleanNick(body.nick);
        if (!title || !text) return bad('title and body required', 400, origin);
        const pid = id('p');
        const ts = Date.now();
        await env.DB.prepare(
          'INSERT INTO posts (id,cat,title,body,nick,created_at,updated_at) VALUES (?,?,?,?,?,?,?)'
        ).bind(pid, cat, title, text, nick, ts, ts).run();
        return json({ ok: true, post: { id: pid, cat, title, body: text, nick, created_at: ts, updated_at: ts } }, 201, origin);
      }

      const cmPath = path.match(/^\/posts\/([^/]+)\/comments$/);
      if (request.method === 'POST' && cmPath) {
        const pid = decodeURIComponent(cmPath[1]);
        const exists = await env.DB.prepare('SELECT id FROM posts WHERE id=?').bind(pid).first();
        if (!exists) return bad('post not found', 404, origin);
        const body = await request.json().catch(() => null);
        if (!body) return bad('invalid json', 400, origin);
        const text = cleanText(body.body, 200);
        const nick = cleanNick(body.nick);
        if (!text) return bad('body required', 400, origin);
        const cid = id('c');
        const ts = Date.now();
        await env.DB.prepare(
          'INSERT INTO comments (id,post_id,nick,body,created_at) VALUES (?,?,?,?,?)'
        ).bind(cid, pid, nick, text, ts).run();
        return json({ ok: true, comment: { id: cid, post_id: pid, nick, body: text, created_at: ts } }, 201, origin);
      }

      if (request.method === 'DELETE' && postOne) {
        if (!isAdmin(request, env)) return bad('admin key required', 401, origin);
        const pid = decodeURIComponent(postOne[1]);
        await env.DB.prepare('DELETE FROM comments WHERE post_id=?').bind(pid).run();
        await env.DB.prepare('DELETE FROM posts WHERE id=?').bind(pid).run();
        return json({ ok: true }, 200, origin);
      }

      const cmDel = path.match(/^\/comments\/([^/]+)$/);
      if (request.method === 'DELETE' && cmDel) {
        if (!isAdmin(request, env)) return bad('admin key required', 401, origin);
        await env.DB.prepare('DELETE FROM comments WHERE id=?').bind(decodeURIComponent(cmDel[1])).run();
        return json({ ok: true }, 200, origin);
      }

      return bad('not found', 404, origin);
    } catch (e) {
      return bad(String(e && e.message || e), 500, origin);
    }
  },
};
