/** 피쉬코지 실시간 프로토콜. Durable Object와 단위 테스트가 같이 씁니다. */

export const SERVERS = [
  { id: 1, name: "호숫가 1" },
  { id: 2, name: "호숫가 2" },
  { id: 3, name: "호숫가 3" },
  { id: 4, name: "호숫가 4" },
];

export const CAP = 50;
export const POSE_MS = 90;
export const CHAT_MS = 700;
export const HELLO_MS = 20000;
export const MAX_MSG = 900;
/** 공지·이벤트·밸런스·금칙어처럼 본문이 긴 운영 메시지. 채팅·포즈는 MAX_MSG. */
export const MAX_OPS = 48000;
const OPS = new Set(["world", "notice", "event", "balance", "grant", "grants", "sanc", "gift", "prof"]);

const FISH = new Set(["off", "cast", "bite"]);
const ANIMS = new Set(["idle", "walk", "sit", "holding-right"]);

export function sanitizeNick(n) {
  const s = String(n ?? "")
    .replace(/[\u0000-\u001f<>]/g, "")
    .trim()
    .slice(0, 10);
  return s || "낚시꾼";
}

/** 관리자·운영자·GM(대소문자 무시) 포함 닉은 거절. 비어 있지 않으면 사유 문자열. */
export function nickProblem(nick) {
  const s = sanitizeNick(nick).toLowerCase();
  if (s.includes("관리자") || s.includes("운영자") || s.includes("gm")) return "reserved";
  return "";
}

/** 같은 호숫가에 이미 있는 닉(자기 소켓 제외)이면 true. */
export function nickTaken(nick, selfId, peers) {
  const s = sanitizeNick(nick);
  return (peers || []).some((p) => p && p.id !== selfId && sanitizeNick(p.nick) === s);
}

export function cleanText(s, max) {
  return String(s ?? "")
    .replace(/[\u0000-\u001f<>]/g, "")
    .trim()
    .slice(0, max);
}

function num(v, min, max, d) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return d;
  return Math.max(min, Math.min(max, n));
}

export function cleanSeat(v) {
  if (v == null || v === "" || v === false) return null;
  const n = Math.round(Number(v));
  if (!Number.isInteger(n) || n < 0 || n > 240) return null;
  return n;
}

/** 앉아 있는 세계 좌표를 0.5m 격자로 묶어, 같은 자리를 두 실유저가 같이 쓰지 않게 합니다. */
export function quantizeKey(x, z) {
  const qx = Math.round(Number(x) * 2) / 2;
  const qz = Math.round(Number(z) * 2) / 2;
  if (!Number.isFinite(qx) || !Number.isFinite(qz)) return null;
  return `${qx.toFixed(1)},${qz.toFixed(1)}`;
}

export function keysNear(a, b, max = 1) {
  if (!a || !b) return false;
  const [ax, az] = String(a).split(",").map(Number);
  const [bx, bz] = String(b).split(",").map(Number);
  if (![ax, az, bx, bz].every(Number.isFinite)) return false;
  return Math.hypot(ax - bx, az - bz) <= max;
}

export function sanitizePose(msg, prev) {
  const p = prev || {};
  const fish = FISH.has(msg.fish) ? msg.fish : p.fish || "off";
  const anim = ANIMS.has(msg.anim) ? msg.anim : p.anim || "idle";
  return {
    x: +num(msg.x, -130, 130, p.x ?? 0).toFixed(2),
    z: +num(msg.z, -130, 130, p.z ?? 0).toFixed(2),
    y: +num(msg.y, -1, 8, p.y ?? 0.4).toFixed(2),
    d: +num(msg.d, -7, 7, p.d ?? 0).toFixed(2),
    fish,
    anim,
    seat: cleanSeat(msg.seat),
    ki: Math.max(0, Math.min(40, Math.round(num(msg.ki, 0, 40, p.ki ?? 0)))),
    lv: Math.max(1, Math.min(99, Math.round(num(msg.lv, 1, 99, p.lv ?? 1)))),
  };
}

export const WX_OV = ["auto", "clear", "drizzle", "storm", "snow", "cherry", "leaf", "sunset", "firefly", "meteor", "aurora"];
export const SEASON_OV = ["auto", "spring", "summer", "autumn", "winter"];
export const MAP_THEMES = ["base", "xmas"];
export const SEASON_SPD = [0, 1, 2, 4, 8];

export function defaultWorld() {
  return {
    dayLen: 150,
    auto: true,
    off: 0,
    t0: 0,
    freezeT: 0,
    wxOv: "auto",
    wxUntil: 0,
    seasonOv: "auto",
    seasonLen: 0,
    seasonOff: 0,
    seasonT0: 0,
    seasonSpd: 8,
    spdSet: 0,
    seasonLink: 0,
    mapTheme: "base",
    ambSeed: 0,
    bots: 9,
    rev: 1,
    at: 0,
  };
}

function finite(v, d) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : d;
}

function pickEnum(v, list, d) {
  return list.includes(v) ? v : d;
}

/** 호숫가 시드용. 클라이언트 world-sync.js 와 같은 식. */
export function mix32(a, b) {
  let x = (Math.imul(a >>> 0, 0x9e3779b1) ^ (b >>> 0)) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0;
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

/**
 * 호숫가 세계 설정. 하루 길이·시각 오프셋·날씨 강제·계절·맵.
 * bump 하면 rev 를 올리고, 빠진 필드는 prev 를 유지합니다.
 * 클라이언트 worldFrac 과 worldFraction 이 같은 식이어야 합니다.
 */
export function sanitizeWorld(input, prev, opt) {
  const now = opt && Number.isFinite(opt.now) ? opt.now : Date.now();
  const base = { ...defaultWorld(), ...(prev || {}) };
  const src = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const dayLen = Math.round(finite(src.dayLen, base.dayLen));
  const seasonLen = Math.round(finite(src.seasonLen, base.seasonLen));
  let wxUntil = Math.round(finite(src.wxUntil, base.wxUntil));
  const wxOv = pickEnum(src.wxOv, WX_OV, pickEnum(base.wxOv, WX_OV, "auto"));
  if (wxOv === "auto" || wxUntil < 0 || wxUntil > now + 30 * 864e5) wxUntil = wxOv === "auto" ? 0 : (wxUntil > 0 && wxUntil <= now + 30 * 864e5 ? wxUntil : 0);
  if (wxOv === "auto") wxUntil = 0;
  const spdSrc = src.seasonSpd == null ? base.seasonSpd : Math.round(finite(src.seasonSpd, base.seasonSpd));
  const seasonSpd = SEASON_SPD.includes(spdSrc) ? spdSrc : (SEASON_SPD.includes(base.seasonSpd) ? base.seasonSpd : 0);
  const off = finite(src.off, base.off);
  const seasonOff = finite(src.seasonOff, base.seasonOff);
  const t0 = finite(src.t0, base.t0);
  const seasonT0 = finite(src.seasonT0, base.seasonT0);
  let freezeT = finite(src.freezeT, base.freezeT) % 1;
  if (freezeT < 0) freezeT += 1;
  const auto = typeof src.auto === "boolean" ? src.auto : !!base.auto;
  const seasonLink = src.seasonLink == null ? (base.seasonLink ? 1 : 0) : (src.seasonLink ? 1 : 0);
  const bump = !!(opt && opt.bump);
  const spdSet = src.seasonSpd != null ? 1 : (base.spdSet ? 1 : 0);
  let ambSeed = Math.round(finite(src.ambSeed == null ? base.ambSeed : src.ambSeed, 0));
  if (!(ambSeed > 0)) ambSeed = Math.round(finite(base.ambSeed, 0));
  if (!(ambSeed > 0)) ambSeed = mix32(now >>> 0, 0xc0ffee) || 1;
  const botPick = src.bots == null ? base.bots : src.bots;
  let bots = 9;
  if (botPick != null && botPick !== "") {
    const bn = Math.round(Number(botPick));
    bots = Number.isFinite(bn) ? Math.max(0, Math.min(50, bn)) : 9;
  }
  return {
    dayLen: Math.max(30, Math.min(86400, dayLen || 150)),
    auto,
    off: Math.max(-10, Math.min(10, off)),
    t0: Math.max(0, Math.min(now + 36e5, t0)),
    freezeT,
    wxOv,
    wxUntil,
    seasonOv: pickEnum(src.seasonOv, SEASON_OV, pickEnum(base.seasonOv, SEASON_OV, "auto")),
    seasonLen: seasonLen <= 0 ? 0 : Math.max(10, Math.min(86400 * 400, seasonLen)),
    seasonOff: Math.max(-1000, Math.min(1000, seasonOff)),
    seasonT0: Math.max(0, Math.min(now + 36e5, seasonT0)),
    seasonSpd,
    spdSet,
    seasonLink,
    mapTheme: pickEnum(src.mapTheme, MAP_THEMES, pickEnum(base.mapTheme, MAP_THEMES, "base")),
    ambSeed,
    bots,
    rev: bump ? (base.rev | 0) + 1 : Math.max(1, Math.round(finite(src.rev, base.rev || 1))),
    at: bump ? now : Math.max(0, Math.round(finite(src.at, base.at || 0))),
  };
}

export function normalizeWorld(stored, now) {
  const w = sanitizeWorld(stored || {}, defaultWorld(), { bump: false, now });
  const t = Number.isFinite(now) ? now : Date.now();
  if (w.wxUntil && w.wxUntil <= t) {
    w.wxOv = "auto";
    w.wxUntil = 0;
  }
  return w;
}

/** 벽시계 기준 하루 진행도 0~1. auto 가 꺼지면 freezeT. 입장 시각과 무관합니다. */
export function worldFraction(now, world) {
  const w = world || {};
  if (!w.auto) {
    let t = Number(w.freezeT);
    if (!Number.isFinite(t)) t = 0;
    t %= 1;
    if (t < 0) t += 1;
    return t;
  }
  const len = Math.max(30, Math.min(86400, Number(w.dayLen) || 150));
  const t0 = Number.isFinite(+w.t0) ? +w.t0 : 0;
  const off = Number.isFinite(+w.off) ? +w.off : 0;
  let t = ((now - t0) / 1000 / len + off) % 1;
  if (t < 0) t += 1;
  return t;
}

const WX_DAY = ["clear", "clear", "drizzle", "storm", "snow", "cherry", "leaf"];
const WX_NIGHT = ["clear", "firefly", "meteor", "aurora", "clear", "drizzle"];

/** 같은 ambSeed·시각이면 어떤 클라이언트든 같은 날씨. 강제(wxOv)가 우선. */
export function sharedWeather(now, world) {
  const w = world || {};
  const t = Number(now) || 0;
  if (w.wxOv && w.wxOv !== "auto" && (!w.wxUntil || w.wxUntil > t)) {
    return { k: w.wxOv, until: w.wxUntil || 0, forced: true };
  }
  const seed = Math.round(Number(w.ambSeed) || 1);
  const bucket = Math.floor(t / 300000);
  const frac = worldFraction(t, w);
  const night = frac >= 0.66 && frac < 0.96;
  const list = night ? WX_NIGHT : WX_DAY;
  const h = mix32(seed, bucket + (night ? 17 : 3));
  return { k: list[h % list.length], until: (bucket + 1) * 300000, forced: false };
}

const DUCK_KINDS = ["base", "pirate", "straw", "astro", "frog", "uni", "penguin", "snowman", "dino"];
const DUCK_SIZES = [0.72, 1, 1.28, 1.55, 1.9];

/** 간격·최대·크기는 시드와 벽시계로 정해져 중간 입장도 같다. 기본 5분·최대 9·크기 랜덤·느린 회전. */
export function sharedDucks(now, world, opt) {
  const every = Math.max(1000, Math.round((opt && opt.every) || 300000));
  const max = Math.max(0, Math.min(30, Math.round((opt && opt.max) != null ? opt.max : 9)));
  const rMax = (opt && opt.rMax) > 0 ? opt.rMax : 8;
  const seed = Math.round(Number(world && world.ambSeed) || 1);
  const t = Number(now) || 0;
  const elapsed = Math.max(0, t - 1_700_000_000_000);
  const n = Math.min(max, Math.floor(elapsed / every) + 1);
  const out = [];
  for (let i = 0; i < n; i++) {
    const h = mix32(seed, 400 + i);
    const h2 = mix32(seed, 900 + i);
    const age = Math.max(0, elapsed - i * every);
    const ang0 = ((h % 10000) / 10000) * Math.PI * 2;
    const rad = (0.28 + ((h2 % 1000) / 1000) * 0.62) * rMax;
    const yaw = ang0 + (age / 1000) * 0.12;
    out.push({
      i,
      x: Math.cos(yaw) * rad,
      z: Math.sin(yaw) * rad,
      yaw,
      s: DUCK_SIZES[h % DUCK_SIZES.length],
      v: DUCK_KINDS[h2 % DUCK_KINDS.length],
      st: "swim",
    });
  }
  return out;
}

const BOT_KINDS = [1, 0, 3, 7, 2, 8, 4, 10, 5, 9, 6, 11, 12, 13, 14, 15, 16];

/** 봇 i의 종류·위치. 같은 시각·시드면 동일. */
export function sharedBot(i, now, world) {
  const seed = Math.round(Number(world && world.ambSeed) || 1);
  const h = mix32(seed, 2000 + (i | 0));
  const h2 = mix32(seed, 3000 + (i | 0));
  const t = Number(now) || 0;
  const ang = ((h % 10000) / 10000) * Math.PI * 2 + (((t / 1000) % 80) / 80) * 0.4;
  const rad = 16 + (h2 % 900) / 100;
  return {
    i: i | 0,
    ki: BOT_KINDS[h % BOT_KINDS.length],
    x: Math.cos(ang) * rad,
    z: Math.sin(ang) * rad,
    yaw: ang + Math.PI,
  };
}

/** seasonLen 이 있으면 0~3. 없으면 null (실제 날짜·seasonSpd). */
export function seasonSlot(now, world) {
  const w = world || {};
  const len = Math.round(Number(w.seasonLen) || 0);
  if (len < 10) return null;
  const t0 = Number.isFinite(+w.seasonT0) ? +w.seasonT0 : 0;
  const off = Number.isFinite(+w.seasonOff) ? +w.seasonOff : 0;
  let s = Math.floor((now - t0) / 1000 / len + off) % 4;
  if (s < 0) s += 4;
  return s;
}

const EVENT_MUL = [1, 1.2, 1.5, 2, 2.5, 3, 5];

export function lakeTargets(ch) {
  if (ch === "all" || ch == null || ch === "") return [1, 2, 3, 4];
  const n = Math.round(Number(ch));
  return n >= 1 && n <= 4 ? [n] : [1, 2, 3, 4];
}

function snapMul(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 1;
  let best = 1;
  let dist = Infinity;
  for (const m of EVENT_MUL) {
    const d = Math.abs(m - n);
    if (d < dist) { dist = d; best = m; }
  }
  return best;
}

/** 지금 떠 있는 공지. off 이면 대상 호숫가의 공지를 내린다. */
export function sanitizeNotice(input, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  if (input == null) return null;
  if (typeof input !== "object" || Array.isArray(input)) return null;
  const ch = input.ch === "all" || input.ch == null || input.ch === "" ? "all" : (lakeTargets(input.ch).length === 1 ? lakeTargets(input.ch)[0] : "all");
  const id = String(input.id == null ? "" : input.id).replace(/[^\w.-]/g, "").slice(0, 40);
  if (input.off) return { off: true, id, ch };
  const msg = cleanText(input.msg, 120);
  if (!msg) return null;
  const min = Math.max(1, Math.min(1440, Math.round(finite(input.min, 10))));
  let until = Math.round(finite(input.until, 0));
  if (!(until > t) || until > t + 1440 * 60000 + 120000) until = t + min * 60000;
  return { id: id || String(t), msg, min, ch, until, off: false };
}

/** 코인·상자 배율. 끄면 null. 예약(from 이 미래)도 그대로 둔다. */
export function sanitizeEvent(input, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  if (input == null) return null;
  if (typeof input !== "object" || Array.isArray(input)) return null;
  const coin = snapMul(input.coin);
  const box = snapMul(input.box);
  if (coin <= 1 && box <= 1) return null;
  let from = Math.round(finite(input.from, t));
  let to = Math.round(finite(input.to, 0));
  if (from < 0) from = 0;
  if (to < 0) to = 0;
  if (to && to <= from) return null;
  if (to && to <= t) return null;
  return { coin, box, from, to };
}

function cleanKey(k) {
  const s = String(k || "").replace(/[^a-z0-9_]/gi, "").slice(0, 32);
  return s;
}

function nonNeg(v, max) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(max, n);
}

/** null 이면 코드 기본값으로 되돌린다. */
export function sanitizeBalance(input) {
  if (input == null) return null;
  if (typeof input !== "object" || Array.isArray(input)) return null;
  const tiers = Array.isArray(input.tiers) ? input.tiers.slice(0, 8).map((n) => nonNeg(n, 1e6)) : [];
  const caps = {};
  if (input.caps && typeof input.caps === "object" && !Array.isArray(input.caps)) {
    for (const k of Object.keys(input.caps)) {
      const key = cleanKey(k);
      if (!key || Object.keys(caps).length >= 40) continue;
      caps[key] = nonNeg(input.caps[k], 1e6);
    }
  }
  const fish = {};
  if (input.fish && typeof input.fish === "object" && !Array.isArray(input.fish)) {
    for (const k of Object.keys(input.fish)) {
      const key = cleanKey(k);
      if (!key || Object.keys(fish).length >= 80) continue;
      const row = input.fish[k] || {};
      fish[key] = { w: nonNeg(row.w, 1e7), base: nonNeg(row.base, 1e7) };
    }
  }
  return {
    boxBase: nonNeg(input.boxBase, 1),
    txp: nonNeg(input.txp, 1),
    tiers,
    caps,
    fish,
  };
}

export function sanitizeGrants(map, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  const out = {};
  if (!map || typeof map !== "object" || Array.isArray(map)) return out;
  for (const k of Object.keys(map)) {
    if (Object.keys(out).length >= 200) break;
    const nick = sanitizeNick(k);
    const until = Math.round(finite(map[k], 0));
    if (until > t && until < t + 400 * 864e5) out[nick] = until;
  }
  return out;
}

export function mergeGrant(prev, patch, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  const next = sanitizeGrants(prev, t);
  const nick = sanitizeNick(patch && patch.nick);
  if (!patch || !String(patch.nick || "").trim()) return next;
  if (patch.revoke || !(Number(patch.until) > t)) delete next[nick];
  else next[nick] = Math.round(Number(patch.until));
  return next;
}

export function sanitizeSancMap(map, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  const out = {};
  if (!map || typeof map !== "object" || Array.isArray(map)) return out;
  for (const k of Object.keys(map)) {
    if (Object.keys(out).length >= 200) break;
    const row = map[k] || {};
    const mute = Math.round(finite(row.mute, 0));
    const ban = Math.round(finite(row.ban, 0));
    if (mute <= t && ban <= t) continue;
    out[sanitizeNick(k)] = {
      mute: mute > t ? mute : 0,
      ban: ban > t ? ban : 0,
      why: cleanText(row.why || "", 80),
    };
  }
  return out;
}

export function mergeSanc(prev, patch, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  const next = sanitizeSancMap(prev, t);
  if (!patch || !String(patch.nick || "").trim()) return next;
  const nick = sanitizeNick(patch.nick);
  const mute = Math.round(finite(patch.mute, 0));
  const ban = Math.round(finite(patch.ban, 0));
  if (mute <= t && ban <= t) delete next[nick];
  else next[nick] = { mute: mute > t ? mute : 0, ban: ban > t ? ban : 0, why: cleanText(patch.why || "", 80) };
  return next;
}

export function sanitizeGift(input, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const nick = input.nick === "*" ? "*" : sanitizeNick(input.nick);
  if (!String(input.nick || "").trim()) return null;
  const id = String(input.id == null ? t : input.id).replace(/[^\w.-]/g, "").slice(0, 40);
  if (!id) return null;
  const c = Math.round(nonNeg(input.c, 1e9));
  const s = Math.round(nonNeg(input.s, 1e6));
  const b = Math.round(nonNeg(input.b, 50));
  const x = Math.round(nonNeg(input.x, 1e8));
  if (!(c || s || b || x)) return null;
  const servers = Array.isArray(input.servers)
    ? [...new Set(input.servers.map((n) => Math.round(Number(n))).filter((n) => n >= 1 && n <= 4))]
    : null;
  return {
    id,
    nick,
    c,
    s,
    b,
    bt: Math.round(nonNeg(input.bt, 5)),
    x,
    msg: cleanText(input.msg || "", 80),
    servers: servers && servers.length ? servers : null,
  };
}

export function sanitizeProf(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (!Array.isArray(input.words) || !input.words.length) return null;
  const words = [];
  for (const w of input.words) {
    const s = cleanText(w, 40);
    if (s && words.length < 4000) words.push(s);
  }
  const allow = [];
  for (const w of (Array.isArray(input.allow) ? input.allow : [])) {
    const s = cleanText(w, 40);
    if (s && allow.length < 2000) allow.push(s);
  }
  if (!words.length) return null;
  return { enabled: input.enabled !== false, words, allow };
}

export function parseClient(raw) {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_OPS) return null;
  let msg;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!msg || typeof msg !== "object" || typeof msg.t !== "string") return null;
  if (raw.length > MAX_MSG && !OPS.has(msg.t)) return null;
  if (msg.t === "ping") return { t: "ping" };
  if (msg.t === "world") {
    if (!msg.world || typeof msg.world !== "object" || Array.isArray(msg.world)) return null;
    return { t: "world", world: msg.world };
  }
  if (msg.t === "notice") return { t: "notice", notice: msg.notice == null ? null : msg.notice };
  if (msg.t === "event") return { t: "event", event: msg.event == null ? null : msg.event };
  if (msg.t === "balance") return { t: "balance", balance: msg.balance == null ? null : msg.balance };
  if (msg.t === "grant") {
    if (!msg.nick) return null;
    return { t: "grant", nick: msg.nick, until: msg.until, revoke: !!msg.revoke };
  }
  if (msg.t === "grants") return { t: "grants", grants: msg.grants };
  if (msg.t === "sanc") {
    if (msg.sanc && typeof msg.sanc === "object") return { t: "sanc", sanc: msg.sanc };
    if (!msg.nick) return null;
    return { t: "sanc", nick: msg.nick, mute: msg.mute, ban: msg.ban, why: msg.why };
  }
  if (msg.t === "gift") {
    if (!msg.gift || typeof msg.gift !== "object") return null;
    return { t: "gift", gift: msg.gift };
  }
  if (msg.t === "prof") {
    if (!msg.prof || typeof msg.prof !== "object") return null;
    return { t: "prof", prof: msg.prof };
  }
  if (msg.t === "chat" || msg.t === "emote") {
    const text = cleanText(msg.text, msg.t === "emote" ? 8 : 80);
    if (!text) return null;
    return { t: msg.t, text };
  }
  if (msg.t === "hello" || msg.t === "pose") {
    return {
      t: msg.t,
      nick: msg.nick,
      ki: msg.ki,
      lv: msg.lv,
      x: msg.x,
      z: msg.z,
      y: msg.y,
      d: msg.d,
      fish: msg.fish,
      anim: msg.anim,
      seat: msg.seat,
    };
  }
  return null;
}

export function allowPose(now, att, pose) {
  const dt = now - (att.lastPose || 0);
  const important = att.fish !== pose.fish || att.anim !== pose.anim || att.seat !== pose.seat;
  if (important) return dt >= 40;
  return dt >= POSE_MS;
}

export function publicPeer(att) {
  return {
    id: att.id,
    nick: att.nick,
    ki: att.ki,
    lv: att.lv,
    x: att.x,
    z: att.z,
    y: att.y,
    d: att.d,
    fish: att.fish,
    anim: att.anim,
    seat: att.seat,
  };
}

const ALLOWED = new Set([
  "https://fishcozy.com",
  "https://www.fishcozy.com",
  "https://dydtjr13.github.io",
  "null",
]);

export function originAllowed(origin, hostname) {
  const host = String(hostname || "").split(":")[0].toLowerCase();
  const local = host === "localhost" || host === "127.0.0.1";
  if (!origin) return local;
  if (ALLOWED.has(origin)) return true;
  if (/^https:\/\/([a-z0-9-]+\.)?dydtjr13\.github\.io$/i.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
  return false;
}

/**
 * 한 접속의 다음 상태를 계산합니다. 소켓 I/O는 하지 않습니다.
 * others: 이미 ready 인 다른 접속의 {id, seatKey}
 */
export function reduce(prev, msg, now, others) {
  const att = {
    id: "",
    nick: "낚시꾼",
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
    server: 0,
    ...(prev || {}),
  };

  if (!msg || msg.t === "ping") return { att, drop: true };

  if (msg.t === "chat" || msg.t === "emote") {
    if (!att.ready) return { att, drop: true };
    if (now - (att.lastChat || 0) < CHAT_MS) return { att, drop: true };
    att.lastChat = now;
    return {
      att,
      drop: false,
      event: { t: msg.t, id: att.id, nick: att.nick, text: msg.text },
    };
  }

  if (msg.t !== "hello" && msg.t !== "pose") return { att, drop: true };

  const pose = sanitizePose(msg, att);
  const nick = msg.nick != null && msg.nick !== "" ? sanitizeNick(msg.nick) : att.nick || "낚시꾼";
  const first = !att.ready;
  if (!first && !allowPose(now, att, pose)) return { att, drop: true };

  let seat = pose.seat;
  let seatKey = seat == null ? null : quantizeKey(pose.x, pose.z);
  if (seat != null && att.seatKey && keysNear(att.seatKey, seatKey, 1)) seatKey = att.seatKey;
  let denied = false;
  if (seatKey && (others || []).some((o) => o && o.id !== att.id && o.seatKey === seatKey)) {
    seat = null;
    seatKey = null;
    denied = true;
  }

  att.nick = nick;
  att.ki = pose.ki;
  att.lv = pose.lv;
  att.x = pose.x;
  att.z = pose.z;
  att.y = pose.y;
  att.d = pose.d;
  att.fish = pose.fish;
  att.anim = denied && pose.anim === "sit" ? "idle" : pose.anim;
  att.seat = seat;
  att.seatKey = seatKey;
  att.lastPose = now;
  att.ready = true;

  return { att, drop: false, first, denied, pub: publicPeer(att) };
}
