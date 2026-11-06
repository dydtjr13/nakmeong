import { DurableObject } from "cloudflare:workers";
import {
  ADMIN_OPS,
  CAP,
  HELLO_MS,
  MAX_OPS,
  SERVERS,
  ackRecover,
  lakeTargets,
  mergeGrant,
  grantUntilFor,
  mergeLosses,
  mergeNoticeLog,
  mergeRecover,
  mergeSanc,
  normalizeWorld,
  originAllowed,
  nickProblem,
  nickTaken,
  parseClient,
  publicPeer,
  pushCue,
  reduce,
  sanitizeBalance,
  sanitizeCue,
  sanitizeNick,
  sanitizeEvent,
  sanitizeGift,
  sanitizeGrants,
  sanitizeLoss,
  sanitizeNotice,
  sanitizePlay,
  sanitizeProf,
  sanitizeRecover,
  sanitizeSancMap,
  sanitizeStage,
  sanitizeWorld,
} from "./protocol.js";

function hostOf(request) {
  const url = new URL(request.url);
  return (request.headers.get("Host") || url.hostname || "").split(":")[0];
}

function corsHeaders(origin) {
  const allow = originAllowed(origin, "");
  const reflected = allow && origin ? origin : "https://fishcozy.com";
  return {
    "Access-Control-Allow-Origin": reflected,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
    "Cache-Control": "no-store",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(origin),
    },
  });
}

/** v52: 관리자 비밀번호 비교 (SHA-256 후 상수 시간 비교) */
async function digest(s) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(s))));
}
async function sameSecret(a, b) {
  const x = await digest(a), y = await digest(b);
  let d = 0;
  for (let i = 0; i < x.length; i++) d |= x[i] ^ y[i];
  return d === 0;
}
/** 게시판 API 가 확인하는 관리자 토큰: `만료시각.HMAC(ADMIN_PASSWORD, "board:만료시각")` */
async function boardToken(secret, ttlMs) {
  const exp = Date.now() + (ttlMs || 12 * 3600e3);
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("board:" + exp)));
  return exp + "." + [...sig].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function messageText(message) {
  if (typeof message === "string") return message.length > MAX_OPS ? null : message;
  if (message instanceof ArrayBuffer) {
    if (message.byteLength > MAX_OPS) return null;
    return new TextDecoder().decode(message);
  }
  return null;
}

export class LakeRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
    this.env = env;
    this._world = null;
    this._ops = null;
  }

  expireWorld(now) {
    const w = this._world;
    if (!w || !w.wxUntil || w.wxUntil > now || w.wxOv === "auto") return false;
    w.wxOv = "auto";
    w.wxUntil = 0;
    return true;
  }

  async worldGet() {
    if (!this._world) {
      const stored = await this.ctx.storage.get("world");
      const legacySeason = !!(stored && stored.seasonSpd === 0 && !stored.spdSet && !stored.seasonLen && (stored.seasonOv == null || stored.seasonOv === "auto"));
      const src = legacySeason ? Object.assign({}, stored, { seasonSpd: 8, spdSet: 1 }) : stored;
      this._world = normalizeWorld(src);
      if (legacySeason || !stored || !(stored.ambSeed > 0) || typeof stored.bots !== "number") {
        this.ctx.waitUntil(this.ctx.storage.put("world", this._world));
      }
    }
    const now = Date.now();
    if (this.expireWorld(now)) this.ctx.waitUntil(this.ctx.storage.put("world", this._world));
    return this._world;
  }

  async worldSet(patch) {
    const prev = await this.worldGet();
    const next = sanitizeWorld(patch, prev, { bump: true });
    if (next.wxUntil && next.wxUntil <= Date.now()) {
      next.wxOv = "auto";
      next.wxUntil = 0;
    }
    this._world = next;
    await this.ctx.storage.put("world", next);
    return next;
  }

  async opsGet(key, fallback) {
    if (!this._ops) this._ops = {};
    if (!Object.prototype.hasOwnProperty.call(this._ops, key)) {
      const v = await this.ctx.storage.get("ops:" + key);
      this._ops[key] = v === undefined ? fallback : v;
    }
    return this._ops[key];
  }

  async opsPut(key, value) {
    if (!this._ops) this._ops = {};
    this._ops[key] = value;
    if (value == null) await this.ctx.storage.delete("ops:" + key);
    else await this.ctx.storage.put("ops:" + key, value);
  }

  async noticeGet() {
    const log = await this.noticeLog();
    return log.active;
  }

  async noticeLog() {
    const now = Date.now();
    let stored = await this.opsGet("notices", null);
    if (!Array.isArray(stored)) {
      const one = await this.opsGet("notice", null);
      stored = one ? [one] : [];
    }
    return mergeNoticeLog(stored, null, now);
  }

  async eventGet() {
    const e = await this.opsGet("event", null);
    if (!e) return null;
    if (e.to && e.to <= Date.now()) return null;
    return e;
  }

  async welcomeOps() {
    const now = Date.now();
    const recovers = mergeRecover(await this.opsGet("recovers", []), null, now);
    const losses = mergeLosses(await this.opsGet("losses", []), null, now);
    const cues = pushCue(await this.opsGet("cues", []), null, now);
    const notes = await this.noticeLog();
    return {
      notice: notes.active,
      notices: notes.rows,
      event: await this.eventGet(),
      balance: await this.opsGet("balance", null),
      grants: sanitizeGrants(await this.opsGet("grants", {}), now),
      sanc: sanitizeSancMap(await this.opsGet("sanc", {}), now),
      prof: await this.opsGet("prof", null),
      stage: await this.opsGet("stage", null),
      play: await this.opsGet("play", null),
      cues,
      recovers,
      losses: losses.slice(0, 40),
    };
  }

  /** 자기 방은 바로 저장한다. 다른 호숫가는 이 요청이 끝난 뒤에 넘긴다.
   *  요청 안에서 다른 Durable Object 를 await 하면 로컬 런타임이 교착될 수 있다. */
  async fan(fromId, targets, payload) {
    if (targets.includes(fromId)) await this.ingest(payload);
    const rest = targets.filter((id) => id !== fromId);
    if (!rest.length) return;
    const body = JSON.stringify(payload);
    this.ctx.waitUntil(Promise.all(rest.map(async (id) => {
      try {
        const stub = this.env.LAKE.getByName(`lake-${id}`);
        await stub.fetch("https://lake.internal/ops", { method: "POST", body });
      } catch (e) {
        console.log(JSON.stringify({ event: "fan_error", id, message: String(e && e.message || e) }));
      }
    })));
  }

  async ingest(msg) {
    if (!msg || typeof msg !== "object") return;
    const now = Date.now();
    if (msg.t === "notice") {
      const prev = await this.noticeLog();
      const next = mergeNoticeLog(prev.rows, msg.notice, now);
      await this.opsPut("notices", next.rows);
      await this.opsPut("notice", next.active);
      this.broadcast({ t: "notice", notice: next.active, notices: next.rows, now });
      return;
    }
    if (msg.t === "event") {
      const e = sanitizeEvent(msg.event, now);
      await this.opsPut("event", e);
      this.broadcast({ t: "event", event: e });
      return;
    }
    if (msg.t === "balance") {
      const b = sanitizeBalance(msg.balance);
      await this.opsPut("balance", b);
      this.broadcast({ t: "balance", balance: b });
      return;
    }
    if (msg.t === "grants") {
      const g = sanitizeGrants(msg.grants, now);
      await this.opsPut("grants", g);
      this.broadcastGrants(g, now);
      return;
    }
    if (msg.t === "sanc") {
      const s = sanitizeSancMap(msg.sanc, now);
      await this.opsPut("sanc", s);
      this.broadcast({ t: "sanc", sanc: s });
      return;
    }
    if (msg.t === "gift") {
      const g = sanitizeGift(msg.gift, now);
      if (!g) return;
      this.broadcast({ t: "gift", gift: g });
      return;
    }
    if (msg.t === "prof") {
      const p = sanitizeProf(msg.prof);
      if (!p) return;
      await this.opsPut("prof", p);
      this.broadcast({ t: "prof", prof: p });
      return;
    }
    if (msg.t === "stage") {
      const s = sanitizeStage(msg.stage, null, { bump: false, now });
      if (!s) return;
      await this.opsPut("stage", s);
      this.broadcast({ t: "stage", stage: s });
      return;
    }
    if (msg.t === "play") {
      const p = sanitizePlay(msg.play, null, { bump: false, now });
      if (!p) return;
      await this.opsPut("play", p);
      this.broadcast({ t: "play", play: p });
      return;
    }
    if (msg.t === "cue") {
      const c = sanitizeCue(msg.cue, now);
      if (!c) return;
      const list = pushCue(await this.opsGet("cues", []), c, now);
      await this.opsPut("cues", list);
      this.broadcast({ t: "cue", cue: c });
      return;
    }
    if (msg.t === "recover") {
      const r = sanitizeRecover(msg.recover, now);
      if (!r) return;
      const list = mergeRecover(await this.opsGet("recovers", []), r, now);
      await this.opsPut("recovers", list);
      this.broadcast({ t: "recover", recover: r });
      return;
    }
    if (msg.t === "recoverAck") {
      const list = ackRecover(await this.opsGet("recovers", []), msg.id, msg.nick);
      await this.opsPut("recovers", list.length ? list : null);
      this.broadcast({ t: "recoverAck", id: msg.id, nick: msg.nick });
      return;
    }
    if (msg.t === "losses") {
      const rows = [];
      for (const row of (Array.isArray(msg.losses) ? msg.losses : []).slice(0, 20)) {
        const s = sanitizeLoss(row, now, msg.nickForce);
        if (s) rows.push(s);
      }
      if (!rows.length) return;
      const list = mergeLosses(await this.opsGet("losses", []), rows, now);
      await this.opsPut("losses", list);
      this.broadcast({ t: "losses", losses: rows });
    }
  }

  async acceptOps(fromId, msg) {
    const now = Date.now();
    const all = [1, 2, 3, 4];
    if (msg.t === "notice") {
      const n = sanitizeNotice(msg.notice, now);
      if (!n && msg.notice != null && !(msg.notice && (msg.notice.off || msg.notice.del))) return;
      const ch = n ? n.ch : ((msg.notice && msg.notice.ch) || "all");
      await this.fan(fromId, [1, 2, 3, 4], { t: "notice", notice: n || { off: true, ch } });
      return;
    }
    if (msg.t === "event") {
      await this.fan(fromId, all, { t: "event", event: sanitizeEvent(msg.event, now) });
      return;
    }
    if (msg.t === "balance") {
      await this.fan(fromId, all, { t: "balance", balance: sanitizeBalance(msg.balance) });
      return;
    }
    if (msg.t === "grant") {
      const peers = this.readyOthers(null).map((a) => ({ id: a.id, nick: a.nick }));
      const next = mergeGrant(await this.opsGet("grants", {}), msg, now, peers);
      await this.fan(fromId, all, { t: "grants", grants: next });
      return;
    }
    if (msg.t === "sanc") {
      if (msg.sanc && !msg.nick) return;
      const next = mergeSanc(await this.opsGet("sanc", {}), msg, now);
      await this.fan(fromId, all, { t: "sanc", sanc: next });
      return;
    }
    if (msg.t === "gift") {
      const g = sanitizeGift(msg.gift, now);
      if (!g) return;
      await this.fan(fromId, g.servers && g.servers.length ? g.servers : [fromId], { t: "gift", gift: g });
      return;
    }
    if (msg.t === "prof") {
      const p = sanitizeProf(msg.prof);
      if (!p) return;
      await this.fan(fromId, all, { t: "prof", prof: p });
      return;
    }
    if (msg.t === "stage") {
      const prev = await this.opsGet("stage", null);
      const next = sanitizeStage(msg.stage, prev, { bump: true, now });
      if (!next) return;
      await this.fan(fromId, all, { t: "stage", stage: next });
      return;
    }
    if (msg.t === "play") {
      const prev = await this.opsGet("play", null);
      const next = sanitizePlay(msg.play, prev, { bump: true, now });
      if (!next) return;
      await this.fan(fromId, all, { t: "play", play: next });
      return;
    }
    if (msg.t === "cue") {
      const c = sanitizeCue(msg.cue, now);
      if (!c) return;
      await this.fan(fromId, all, { t: "cue", cue: c });
      return;
    }
    if (msg.t === "recover") {
      const r = sanitizeRecover(msg.recover, now);
      if (!r) return;
      await this.fan(fromId, all, { t: "recover", recover: r });
      return;
    }
    if (msg.t === "recoverAck") {
      if (!msg.nick || msg.id == null) return;
      await this.fan(fromId, all, { t: "recoverAck", id: msg.id, nick: msg.nick });
      return;
    }
    if (msg.t === "losses") {
      const rows = [];
      for (const row of (Array.isArray(msg.losses) ? msg.losses : []).slice(0, 20)) {
        const s = sanitizeLoss(row, now, msg.nickForce);
        if (s) rows.push(s);
      }
      if (!rows.length) return;
      await this.fan(fromId, all, { t: "losses", losses: rows, nickForce: msg.nickForce });
    }
  }

  /** v52: 관리자 확인. 10분에 20번 이상 틀리면 이 호숫가는 잠시 모든 로그인 거부 */
  async adminCheck(id, pw) {
    const secret = this.env && this.env.ADMIN_PASSWORD;
    if (!secret || !pw) return false;
    const now = Date.now();
    this._authFails = (this._authFails || []).filter((t) => now - t < 10 * 60e3);
    if (this._authFails.length >= 20) return false;
    const okId = await sameSecret(String(id || "").trim(), (this.env.ADMIN_ID || "admin"));
    const okPw = await sameSecret(pw, secret);
    if (okId && okPw) return true;
    this._authFails.push(now);
    console.log(JSON.stringify({ event: "admin_auth_fail", n: this._authFails.length }));
    return false;
  }

  openSockets(except) {
    return this.ctx.getWebSockets().filter((ws) => ws !== except && ws.readyState === WebSocket.OPEN);
  }

  async occupancy() {
    const st = await this.opsGet("stage", null);
    return { n: this.openSockets().length, cap: CAP, stage: st ? { lay: st.lay, deckW: st.deckW, decks: st.decks, rev: st.rev } : null };
  }

  attachment(ws) {
    try {
      return ws.deserializeAttachment() || null;
    } catch {
      return null;
    }
  }

  readyOthers(except) {
    const out = [];
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except || ws.readyState !== WebSocket.OPEN) continue;
      const att = this.attachment(ws);
      if (att && att.ready) out.push(att);
    }
    return out;
  }

  broadcast(obj, except) {
    const raw = JSON.stringify(obj);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except || ws.readyState !== WebSocket.OPEN) continue;
      try {
        ws.send(raw);
      } catch {
        /* 끊긴 소켓은 닫힘 핸들러가 정리합니다 */
      }
    }
  }

  /** 같은 목록을 뿌리되, 각 소켓에는 그 닉의 만료(mine)와 서버 닉(me)을 붙인다. */
  broadcastGrants(grants, now) {
    const t = Number.isFinite(now) ? now : Date.now();
    for (const ws of this.ctx.getWebSockets()) {
      if (ws.readyState !== WebSocket.OPEN) continue;
      const att = this.attachment(ws);
      const me = att && att.nick ? att.nick : "";
      const mine = me ? grantUntilFor(grants, me, []) : 0;
      try {
        ws.send(JSON.stringify({ t: "grants", grants, now: t, me, mine: mine > t ? mine : 0 }));
      } catch {
        /* 끊긴 소켓은 닫힘 핸들러가 정리합니다 */
      }
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/ops" && request.method === "POST") {
      let body = null;
      try { body = await request.json(); } catch { body = null; }
      await this.ingest(body);
      return Response.json({ ok: true });
    }
    if (request.headers.get("Upgrade") !== "websocket") {
      const occ = await this.occupancy();
      return Response.json({ ok: true, ...occ });
    }
    const n = this.openSockets().length;
    if (n >= CAP) {
      return Response.json({ ok: false, error: "full", n, cap: CAP }, { status: 503 });
    }
    const path = url.pathname.match(/\/ws\/([1-4])$/);
    const server = path ? +path[1] : 0;
    const pair = new WebSocketPair();
    const [client, serverWs] = Object.values(pair);
    this.ctx.acceptWebSocket(serverWs);
    serverWs.serializeAttachment({
      id: crypto.randomUUID(),
      nick: "",
      ki: 0,
      lv: 1,
      x: 0,
      z: 0,
      y: 0.4,
      d: 0,
      fish: "off",
      anim: "idle",
      seat: null,
      seatKey: null,
      ready: false,
      lastPose: 0,
      lastChat: 0,
      server,
      born: Date.now(),
    });
    const alarm = await this.ctx.storage.getAlarm();
    if (!alarm) this.ctx.waitUntil(this.ctx.storage.setAlarm(Date.now() + HELLO_MS));
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    const text = messageText(message);
    if (text == null) return;
    const msg = parseClient(text);
    if (!msg) return;
    const prev = this.attachment(ws);
    if (!prev || !prev.id) {
      try {
        ws.close(1008, "state");
      } catch {
        /* already closing */
      }
      return;
    }
    if (msg.t === "auth" && msg.out) {
      const att = this.attachment(ws) || prev;
      att.admin = 0;
      ws.serializeAttachment(att);
      try { ws.send(JSON.stringify({ t: "auth", ok: false, out: 1 })); } catch { /* ignore */ }
      return;
    }
    if (msg.t === "auth") {
      const tries = (prev.authN | 0) + 1;
      const ok = await this.adminCheck(msg.id, msg.pw);
      const att = this.attachment(ws) || prev;
      att.authN = ok ? 0 : tries;
      if (ok) att.admin = 1;
      ws.serializeAttachment(att);
      const token = ok ? await boardToken(this.env.ADMIN_PASSWORD) : "";
      try { ws.send(JSON.stringify({ t: "auth", ok, token })); } catch { /* ignore */ }
      if (!ok && tries >= 5) { try { ws.close(4006, "auth"); } catch { /* ignore */ } }
      return;
    }
    if (ADMIN_OPS.has(msg.t) && !prev.admin) {
      try { ws.send(JSON.stringify({ t: "auth", ok: false, need: 1 })); } catch { /* ignore */ }
      return;
    }
    if (msg.t === "world") {
      if (!prev.ready) return;
      const world = await this.worldSet(msg.world);
      this.broadcast({ t: "world", world });
      return;
    }
    if (msg.t === "notice" || msg.t === "event" || msg.t === "balance" || msg.t === "grant" || msg.t === "sanc" || msg.t === "gift" || msg.t === "prof" || msg.t === "stage" || msg.t === "play" || msg.t === "cue" || msg.t === "recover") {
      if (!prev.ready) return;
      await this.acceptOps(prev.server, msg);
      return;
    }
    if (msg.t === "recoverAck") {
      if (!prev.ready) return;
      await this.acceptOps(prev.server, { t: "recoverAck", id: msg.id, nick: prev.nick });
      return;
    }
    if (msg.t === "loss" || msg.t === "losses") {
      if (!prev.ready) return;
      const losses = msg.t === "loss" ? [msg.loss] : msg.losses;
      await this.acceptOps(prev.server, { t: "losses", losses, nickForce: prev.nick });
      return;
    }
    let play = msg;
    let helloAdmin = false;
    if (play.t === "hello" || play.t === "pose") {
      const named = play.nick != null && String(play.nick).trim() !== "";
      if (play.t === "hello" || named) {
        const want = sanitizeNick(named ? play.nick : (prev.nick || ""));
        if (play.t === "hello" && play.adm && !prev.admin) {
          if (await this.adminCheck(play.adm.id, play.adm.pw)) helloAdmin = true;
          else {
            try { ws.send(JSON.stringify({ t: "nick", ok: false, reason: "admin" })); } catch { /* ignore */ }
            if (!prev.ready) { try { ws.close(4004, "admin"); } catch { /* ignore */ } return; }
          }
        }
        let why = nickProblem(want);
        if (why === "reserved" && (prev.admin || helloAdmin)) why = "";
        const peers = [];
        for (const other of this.ctx.getWebSockets()) {
          if (other === ws) continue;
          const att = this.attachment(other);
          if (!att || !att.nick) continue;
          // v52: 같은 브라우저(cid)가 다시 들어오면 남아 있던 이전 연결을 정리하고 그 닉을 이어 쓴다
          if (play.cid && att.cid === play.cid && att.id !== prev.id && sanitizeNick(att.nick) === want) {
            att.ready = false;
            try { other.serializeAttachment(att); } catch { /* ignore */ }
            try { other.close(4005, "replaced"); } catch { /* ignore */ }
            this.broadcast({ t: "leave", id: att.id, n: Math.max(0, this.openSockets(other).length - 1) }, other);
            continue;
          }
          peers.push(att);
        }
        if (why || nickTaken(want, prev.id, peers)) {
          try { ws.send(JSON.stringify({ t: "nick", ok: false, reason: why || "dup" })); } catch { /* ignore */ }
          if (!prev.ready) {
            try { ws.close(4004, "nick"); } catch { /* ignore */ }
            return;
          }
          play = Object.assign({}, play, { nick: prev.nick || "" });
        }
      }
    }
    const others = this.readyOthers(ws).map((a) => ({ id: a.id, seatKey: a.seatKey }));
    const next = reduce(prev, play, Date.now(), others);
    if (next.drop) return;
    if (play.cid) next.att.cid = play.cid;
    if (helloAdmin) next.att.admin = 1;
    delete next.att.adm;
    ws.serializeAttachment(next.att);
    if (next.event) {
      if (next.event.t === "chat") {
        const held = sanitizeSancMap(await this.opsGet("sanc", {}), Date.now());
        const banRow = held[next.att.nick];
        if (banRow && banRow.mute > Date.now()) {
          try { ws.send(JSON.stringify({ t: "sanc", sanc: held })); } catch { /* ignore */ }
          return;
        }
      }
      this.broadcast(next.event, ws);
      return;
    }
    const n = this.openSockets().length;
    if (next.first) {
      const sanc = sanitizeSancMap(await this.opsGet("sanc", {}), Date.now());
      const row = sanc[next.att.nick];
      if (row && row.ban > Date.now()) {
        next.att.ready = false;
        ws.serializeAttachment(next.att);
        try { ws.send(JSON.stringify({ t: "banned", until: row.ban, why: row.why || "" })); } catch { /* ignore */ }
        try { ws.close(4003, "banned"); } catch { /* ignore */ }
        return;
      }
      const world = await this.worldGet();
      const ops = await this.welcomeOps();
      const meNick = next.att.nick;
      const nowHello = Date.now();
      const mineUntil = grantUntilFor(ops.grants || {}, meNick, []);
      ws.send(JSON.stringify({
        t: "welcome",
        id: next.att.id,
        server: next.att.server,
        n,
        cap: CAP,
        peers: this.readyOthers(ws).map(publicPeer),
        world,
        now: nowHello,
        nick: meNick,
        mine: mineUntil > nowHello ? mineUntil : 0,
        admin: !!next.att.admin,
        token: next.att.admin ? await boardToken(this.env.ADMIN_PASSWORD) : "",
        ...ops,
      }));
      this.broadcast({ t: "join", n, peer: next.pub }, ws);
      console.log(JSON.stringify({ event: "join", server: next.att.server, n }));
      return;
    }
    if (next.denied) {
      try {
        ws.send(JSON.stringify({ t: "seat", ok: false }));
      } catch {
        /* ignore */
      }
    }
    this.broadcast({ t: "pose", ...next.pub }, ws);
  }

  async webSocketClose(ws, code, reason) {
    const att = this.attachment(ws);
    try {
      ws.close(code || 1000, reason || "bye");
    } catch {
      /* handshake already finished */
    }
    if (!att || !att.ready || !att.id) return;
    const n = this.openSockets(ws).length;
    this.broadcast({ t: "leave", id: att.id, n }, ws);
    console.log(JSON.stringify({ event: "leave", server: att.server, n }));
  }

  async webSocketError(ws, error) {
    console.log(JSON.stringify({ event: "ws_error", message: String(error && error.message || error) }));
    try {
      ws.close(1011, "error");
    } catch {
      /* ignore */
    }
  }

  async alarm() {
    const now = Date.now();
    let pending = false;
    for (const ws of this.ctx.getWebSockets()) {
      const att = this.attachment(ws);
      if (!att || !att.ready) {
        const born = att && att.born ? att.born : 0;
        if (!born || now - born >= HELLO_MS) {
          try {
            ws.close(4001, "hello timeout");
          } catch {
            /* ignore */
          }
        } else pending = true;
      }
    }
    if (pending || this.openSockets().some((ws) => {
      const att = this.attachment(ws);
      return !att || !att.ready;
    })) {
      await this.ctx.storage.setAlarm(Date.now() + HELLO_MS);
    }
  }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const host = hostOf(request);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    try {
      if (path === "/" || path === "/health") {
        return json({
          ok: true,
          service: "fishcozy-realtime",
          brand: "FISH COZY",
          servers: SERVERS.length,
          cap: CAP,
        }, 200, origin);
      }
      if (path === "/servers" && request.method === "GET") {
        const servers = await Promise.all(SERVERS.map(async (s) => {
          const stub = env.LAKE.getByName(`lake-${s.id}`);
          const occ = await stub.occupancy();
          return { id: s.id, name: s.name, n: occ.n, cap: occ.cap || CAP, stage: occ.stage || null };
        }));
        return json({ ok: true, servers }, 200, origin);
      }
      const room = path.match(/^\/ws\/([1-4])$/);
      if (room && request.method === "GET") {
        if (!originAllowed(origin, host)) {
          return json({ ok: false, error: "origin" }, 403, origin);
        }
        if (request.headers.get("Upgrade") !== "websocket") {
          return json({ ok: false, error: "websocket required" }, 426, origin);
        }
        const stub = env.LAKE.getByName(`lake-${room[1]}`);
        return stub.fetch(request);
      }
      return json({ ok: false, error: "not found" }, 404, origin);
    } catch (e) {
      console.log(JSON.stringify({ event: "error", message: String(e && e.message || e) }));
      return json({ ok: false, error: "server" }, 500, origin);
    }
  },
};
