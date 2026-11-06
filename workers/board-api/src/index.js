import { hasProfanity } from "./profanity.js";

const ALLOWED = new Set([
  'https://fishcozy.com',
  'https://www.fishcozy.com',
  'https://dydtjr13.github.io',
  // v50: HTTPS 인증서 발급 전에는 게임이 http 로 열린다
  'http://fishcozy.com',
  'http://www.fishcozy.com',
  'http://dydtjr13.github.io',
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
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key,X-Admin-Token,X-Owner',
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
  return String(n || '낚시꾼').replace(/[\u0000-\u001f<>"'`&\\]/g, '').trim().slice(0, 10) || '낚시꾼';
}
// v52: 운영자 전용 — 게시판 카테고리와 닉네임
const STAFF_CATS = new Set(['공지', '업데이트']);
const catKey = (s) => String(s || '').replace(/[^\uac00-\ud7a3]/g, '');
const reservedNick = (n) => { const s = String(n || '').toLowerCase(); return s.includes('관리자') || s.includes('운영자') || s.includes('gm'); };
async function tokenOk(token, secret) {
  if (!token || !secret) return false;
  const [exp, sig] = String(token).split('.');
  if (!exp || !sig || !(+exp > Date.now())) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const want = [...new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('board:' + exp)))].map((b) => b.toString(16).padStart(2, '0')).join('');
  if (want.length !== sig.length) return false;
  let d = 0;
  for (let i = 0; i < want.length; i++) d |= want.charCodeAt(i) ^ sig.charCodeAt(i);
  return d === 0;
}

function cleanText(s, max) {
  return String(s || '').replace(/\0/g, '').trim().slice(0, max);
}

async function isAdmin(req, env) {
  const key = env.ADMIN_KEY;
  if (key && req.headers.get('X-Admin-Key') === key) return true;
  return tokenOk(req.headers.get('X-Admin-Token'), env.ADMIN_PASSWORD);
}


// ── v54: 스키마 보강(처음 요청 때 1번) ──
let schemaReady = false;
async function ensureSchema(db) {
  if (schemaReady) return;
  const tries = [
    'ALTER TABLE posts ADD COLUMN owner TEXT',
    'ALTER TABLE posts ADD COLUMN reports INTEGER DEFAULT 0',
    'ALTER TABLE posts ADD COLUMN hidden INTEGER DEFAULT 0',
    'ALTER TABLE comments ADD COLUMN owner TEXT',
    'CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY, post_id TEXT NOT NULL, reporter TEXT NOT NULL, reason TEXT, created_at INTEGER NOT NULL)',
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_reports_once ON reports(post_id, reporter)',
    'CREATE TABLE IF NOT EXISTS saves (code TEXT PRIMARY KEY, owner TEXT NOT NULL, data TEXT NOT NULL, size INTEGER NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)',
    'CREATE INDEX IF NOT EXISTS idx_saves_owner ON saves(owner)',
  ];
  for (const sql of tries) { try { await db.prepare(sql).run(); } catch (e) { /* 이미 있음 */ } }
  schemaReady = true;
}

// 글쓴이 확인: 브라우저 고유 id(X-Owner)의 해시만 저장 (원래 값은 서버에도 남기지 않음)
async function ownerOf(req) {
  const raw = String(req.headers.get('X-Owner') || '').replace(/[^\w-]/g, '').slice(0, 64);
  if (raw.length < 8) return '';
  const h = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('fc-owner:' + raw)));
  return [...h].slice(0, 16).map((b) => b.toString(16).padStart(2, '0')).join('');
}
const REPORT_HIDE = 3; // 서로 다른 3명이 신고하면 관리자가 볼 때까지 숨김

function shapePost(p, me, admin) {
  return { id: p.id, cat: p.cat, title: p.title, body: p.body, nick: p.nick, created_at: p.created_at, updated_at: p.updated_at,
    comment_count: p.comment_count || 0, mine: !!(me && p.owner && p.owner === me), edited: p.updated_at > p.created_at + 1000,
    ...(admin ? { reports: p.reports || 0, hidden: !!p.hidden } : {}) };
}
async function listPosts(db, url, me, admin) {
  const limit = Math.min(100, Math.max(1, +(url.searchParams.get('limit') || 50)));
  const offset = Math.max(0, +(url.searchParams.get('offset') || 0));
  const rows = await db.prepare(
    `SELECT p.*, (SELECT COUNT(*) FROM comments c WHERE c.post_id=p.id) AS comment_count
     FROM posts p ${admin ? '' : 'WHERE COALESCE(p.hidden,0)=0'} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
  ).bind(limit, offset).all();
  return (rows.results || []).map((p) => shapePost(p, me, admin));
}
function profane(...parts) { return parts.some((t) => hasProfanity(t)); }

// ── 짧은 저장 코드: 헷갈리는 글자(0 O 1 I L) 제외 12자 = XXXX-XXXX-XXXX ──
const CODE_ABC = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
function newCode() {
  const b = crypto.getRandomValues(new Uint8Array(12));
  const s = [...b].map((x) => CODE_ABC[x % CODE_ABC.length]).join('');
  return s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8, 12);
}
const cleanCode = (c) => { const s = String(c || '').toUpperCase().replace(/[^0-9A-Z]/g, ''); return s.length === 12 ? s.slice(0, 4) + '-' + s.slice(4, 8) + '-' + s.slice(8) : ''; };
const SAVE_MAX = 400 * 1024;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';
    try {
      if (path === '/health' || path === '/') return json({ ok: true, service: 'fishcozy-board-api', brand: 'FISH COZY' }, 200, origin);
      if (!env.DB) return bad('DB binding missing', 500, origin);
      await ensureSchema(env.DB);
      const db = env.DB;
      const me = await ownerOf(request);
      const admin = await isAdmin(request, env);

      // ─ 저장 코드 ─
      if (path === '/saves' && request.method === 'POST') {
        if (!me) return bad('owner required', 400, origin);
        const text = await request.text();
        if (text.length > SAVE_MAX + 200) return bad('too large', 413, origin);
        let body; try { body = JSON.parse(text); } catch { return bad('invalid json', 400, origin); }
        const data = typeof body.data === 'string' ? body.data : JSON.stringify(body.data || null);
        if (!data || data === 'null' || data.length > SAVE_MAX) return bad('invalid save', 400, origin);
        const now = Date.now();
        const mine = await db.prepare('SELECT code FROM saves WHERE owner=? ORDER BY updated_at DESC LIMIT 1').bind(me).first();
        if (mine) {
          await db.prepare('UPDATE saves SET data=?, size=?, updated_at=? WHERE code=?').bind(data, data.length, now, mine.code).run();
          return json({ ok: true, code: mine.code, updated_at: now }, 200, origin);
        }
        let code = '';
        for (let i = 0; i < 5 && !code; i++) { const c = newCode(); const hit = await db.prepare('SELECT code FROM saves WHERE code=?').bind(c).first(); if (!hit) code = c; }
        if (!code) return bad('try again', 503, origin);
        await db.prepare('INSERT INTO saves (code,owner,data,size,created_at,updated_at) VALUES (?,?,?,?,?,?)').bind(code, me, data, data.length, now, now).run();
        return json({ ok: true, code, updated_at: now }, 201, origin);
      }
      const saveOne = path !== '/saves/mine' && path.match(/^\/saves\/([^/]+)$/);
      if (saveOne && request.method === 'GET') {
        const code = cleanCode(decodeURIComponent(saveOne[1]));
        if (!code) return bad('bad code', 400, origin);
        const row = await db.prepare('SELECT data, updated_at FROM saves WHERE code=?').bind(code).first();
        if (!row) return bad('not found', 404, origin);
        return json({ ok: true, code, data: row.data, updated_at: row.updated_at }, 200, origin);
      }
      if (path === '/saves/mine' && request.method === 'GET') {
        if (!me) return json({ ok: true, code: '', updated_at: 0 }, 200, origin);
        const row = await db.prepare('SELECT code, updated_at FROM saves WHERE owner=? ORDER BY updated_at DESC LIMIT 1').bind(me).first();
        return json({ ok: true, code: row ? row.code : '', updated_at: row ? row.updated_at : 0 }, 200, origin);
      }

      // ─ 게시판 ─
      if (request.method === 'GET' && path === '/posts') return json({ ok: true, posts: await listPosts(db, url, me, admin) }, 200, origin);
      if (request.method === 'GET' && path === '/reports') {
        if (!admin) return bad('admin only', 401, origin);
        const rows = await db.prepare(`SELECT r.post_id, COUNT(*) AS n, MAX(r.created_at) AS last, GROUP_CONCAT(r.reason, ' / ') AS reasons, p.title, p.hidden FROM reports r LEFT JOIN posts p ON p.id=r.post_id GROUP BY r.post_id ORDER BY last DESC LIMIT 100`).all();
        return json({ ok: true, reports: rows.results || [] }, 200, origin);
      }

      const postOne = path.match(/^\/posts\/([^/]+)$/);
      if (request.method === 'GET' && postOne) {
        const pid = decodeURIComponent(postOne[1]);
        const post = await db.prepare('SELECT * FROM posts WHERE id=?').bind(pid).first();
        if (!post || (post.hidden && !admin)) return bad('not found', 404, origin);
        const cms = await db.prepare('SELECT * FROM comments WHERE post_id=? ORDER BY created_at ASC').bind(pid).all();
        return json({ ok: true, post: shapePost(post, me, admin), comments: (cms.results || []).map((c) => ({ id: c.id, post_id: c.post_id, nick: c.nick, body: c.body, created_at: c.created_at, mine: !!(me && c.owner && c.owner === me) })) }, 200, origin);
      }

      if (request.method === 'POST' && path === '/posts') {
        const body = await request.json().catch(() => null);
        if (!body) return bad('invalid json', 400, origin);
        const title = cleanText(body.title, 60), text = cleanText(body.body, 2000), cat = cleanText(body.cat, 40) || '자유', nick = cleanNick(body.nick);
        if (!title || !text) return bad('title and body required', 400, origin);
        if (!admin && (STAFF_CATS.has(catKey(cat)) || reservedNick(nick))) return bad('admin only', 403, origin);
        if (!admin && profane(title, text, nick)) return bad('profanity', 400, origin);
        const pid = id('p'), ts = Date.now();
        await db.prepare('INSERT INTO posts (id,cat,title,body,nick,created_at,updated_at,owner) VALUES (?,?,?,?,?,?,?,?)').bind(pid, cat, title, text, nick, ts, ts, me || null).run();
        return json({ ok: true, post: { id: pid, cat, title, body: text, nick, created_at: ts, updated_at: ts, mine: !!me } }, 201, origin);
      }
      if (request.method === 'PUT' && postOne) {
        const pid = decodeURIComponent(postOne[1]);
        const post = await db.prepare('SELECT * FROM posts WHERE id=?').bind(pid).first();
        if (!post) return bad('not found', 404, origin);
        if (!admin && !(me && post.owner === me)) return bad('not yours', 403, origin);
        const body = await request.json().catch(() => null);
        if (!body) return bad('invalid json', 400, origin);
        const title = cleanText(body.title, 60), text = cleanText(body.body, 2000), cat = cleanText(body.cat, 40) || post.cat;
        if (!title || !text) return bad('title and body required', 400, origin);
        if (!admin && STAFF_CATS.has(catKey(cat))) return bad('admin only', 403, origin);
        if (!admin && profane(title, text)) return bad('profanity', 400, origin);
        const ts = Date.now();
        await db.prepare('UPDATE posts SET title=?, body=?, cat=?, updated_at=? WHERE id=?').bind(title, text, cat, ts, pid).run();
        return json({ ok: true, post: shapePost({ ...post, title, body: text, cat, updated_at: ts }, me, admin) }, 200, origin);
      }
      if (request.method === 'DELETE' && postOne) {
        const pid = decodeURIComponent(postOne[1]);
        const post = await db.prepare('SELECT owner FROM posts WHERE id=?').bind(pid).first();
        if (!post) return bad('not found', 404, origin);
        if (!admin && !(me && post.owner === me)) return bad('not yours', 403, origin);
        await db.prepare('DELETE FROM comments WHERE post_id=?').bind(pid).run();
        await db.prepare('DELETE FROM reports WHERE post_id=?').bind(pid).run();
        await db.prepare('DELETE FROM posts WHERE id=?').bind(pid).run();
        return json({ ok: true }, 200, origin);
      }

      const rpPath = path.match(/^\/posts\/([^/]+)\/report$/);
      if (request.method === 'POST' && rpPath) {
        const pid = decodeURIComponent(rpPath[1]);
        if (!me) return bad('owner required', 400, origin);
        const post = await db.prepare('SELECT id, owner FROM posts WHERE id=?').bind(pid).first();
        if (!post) return bad('not found', 404, origin);
        if (post.owner && post.owner === me) return bad('own post', 400, origin);
        const body = await request.json().catch(() => ({}));
        const reason = cleanText(body && body.reason, 100) || '기타';
        try { await db.prepare('INSERT INTO reports (id,post_id,reporter,reason,created_at) VALUES (?,?,?,?,?)').bind(id('r'), pid, me, reason, Date.now()).run(); }
        catch (e) { return json({ ok: true, already: true }, 200, origin); }
        const n = (await db.prepare('SELECT COUNT(*) AS n FROM reports WHERE post_id=?').bind(pid).first()).n || 0;
        await db.prepare('UPDATE posts SET reports=?, hidden=CASE WHEN ?>=? THEN 1 ELSE COALESCE(hidden,0) END WHERE id=?').bind(n, n, REPORT_HIDE, pid).run();
        return json({ ok: true, reports: n }, 200, origin);
      }
      const unhide = path.match(/^\/posts\/([^/]+)\/unhide$/);
      if (request.method === 'POST' && unhide) {
        if (!admin) return bad('admin only', 401, origin);
        const pid = decodeURIComponent(unhide[1]);
        await db.prepare('UPDATE posts SET hidden=0, reports=0 WHERE id=?').bind(pid).run();
        await db.prepare('DELETE FROM reports WHERE post_id=?').bind(pid).run();
        return json({ ok: true }, 200, origin);
      }

      const cmPath = path.match(/^\/posts\/([^/]+)\/comments$/);
      if (request.method === 'POST' && cmPath) {
        const pid = decodeURIComponent(cmPath[1]);
        const exists = await db.prepare('SELECT id, hidden FROM posts WHERE id=?').bind(pid).first();
        if (!exists || (exists.hidden && !admin)) return bad('post not found', 404, origin);
        const body = await request.json().catch(() => null);
        if (!body) return bad('invalid json', 400, origin);
        const text = cleanText(body.body, 200), nick = cleanNick(body.nick);
        if (!text) return bad('body required', 400, origin);
        if (!admin && reservedNick(nick)) return bad('admin only', 403, origin);
        if (!admin && profane(text, nick)) return bad('profanity', 400, origin);
        const cid = id('c'), ts = Date.now();
        await db.prepare('INSERT INTO comments (id,post_id,nick,body,created_at,owner) VALUES (?,?,?,?,?,?)').bind(cid, pid, nick, text, ts, me || null).run();
        return json({ ok: true, comment: { id: cid, post_id: pid, nick, body: text, created_at: ts, mine: !!me } }, 201, origin);
      }
      const cmDel = path.match(/^\/comments\/([^/]+)$/);
      if (request.method === 'DELETE' && cmDel) {
        const cid = decodeURIComponent(cmDel[1]);
        const c = await db.prepare('SELECT owner FROM comments WHERE id=?').bind(cid).first();
        if (!c) return bad('not found', 404, origin);
        if (!admin && !(me && c.owner === me)) return bad('not yours', 403, origin);
        await db.prepare('DELETE FROM comments WHERE id=?').bind(cid).run();
        return json({ ok: true }, 200, origin);
      }
      return bad('not found', 404, origin);
    } catch (e) {
      return bad(String(e && e.message || e), 500, origin);
    }
  },
};
