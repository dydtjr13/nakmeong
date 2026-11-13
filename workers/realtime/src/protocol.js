/** 피쉬코지 실시간 프로토콜. Durable Object와 단위 테스트가 같이 씁니다. */

export const SERVERS = [
  { id: 1, name: "물병자리" },
  { id: 2, name: "물고기자리" },
  { id: 3, name: "양자리" },
  { id: 4, name: "황소자리" },
];

// v146: 달에 간 유저가 어느 서버(별자리)에서 왔는지 — 서버 목록 인원에 달 인원까지 합쳐요
export function cleanHome(v) { const n = Math.round(Number(v)); return n >= 1 && n <= 14 && n !== 7 && n !== 8 ? n : 0; }
export function cleanHomes(o) { const h = {}; if (o && typeof o === "object") for (const k of Object.keys(o).slice(0, 20)) { const id = cleanHome(k), n = Math.max(0, Math.min(1000, o[k] | 0)); if (id && n) h[id] = n; } return h; }

export const CAP = 100; // v141: 호숫가·달 한 곳에 100명까지
export const POSE_MS = 90;
export const CHAT_MS = 700;
export const HELLO_MS = 20000;
export const MAX_MSG = 900;
/** 공지·이벤트·밸런스·금칙어처럼 본문이 긴 운영 메시지. 채팅·포즈는 MAX_MSG. */
export const MAX_OPS = 48000;
const OPS = new Set(["world", "notice", "event", "balance", "grant", "grants", "sanc", "gift", "prof", "stage", "play", "cue", "recover", "recoverAck", "loss", "losses", "game", "gameNow", "titles", "staff", "vmod", "vbx"]);

const FISH = new Set(["off", "cast", "bite", "catch"]);
/** v52: 서버 인증된 관리자 소켓만 보낼 수 있는 운영 메시지 */
export const ADMIN_OPS = new Set(["world", "notice", "event", "balance", "grant", "grants", "sanc", "gift", "prof", "stage", "play", "cue", "recover", "game", "gameNow", "gameGet", "titles", "staff", "staffAdd", "repDone", "vmod", "vbx"]);
function cleanId(v, max) {
  return String(v == null ? "" : v).replace(/[^\w.-]/g, "").slice(0, max || 40);
}
function cleanCred(v, max) {
  return typeof v === "string" ? v.slice(0, max) : "";
}
const ANIMS = new Set(["idle", "walk", "sit", "holding-right"]);

export function sanitizeNick(n) {
  const s = String(n ?? "")
    .replace(/[\u0000-\u001f<>"'`&\\]/g, "")
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

// v56: 관리자 특별 칭호 {닉네임: [{n,bd,bg,fg}]} — 네 호숫가 공용
const HEX = (v, d) => (/^#[0-9a-f]{6}$/i.test(String(v || "")) ? String(v).toLowerCase() : d);
export function cleanTitle(t) {
  if (!t || typeof t !== "object" || Array.isArray(t)) return null;
  const n = String(t.n == null ? "" : t.n).replace(/[\u0000-\u001f<>"'`&\\]/g, "").trim().slice(0, 12);
  if (!n) return null;
  return { n, bd: HEX(t.bd, "#ffd27a"), bg: HEX(t.bg, "#3b3346"), fg: HEX(t.fg, "#ffffff") };
}
/** v108 탈것 편집기: 탈것 모양 데이터 (관리자만 · 탈것 12개 · 하나에 조각 240개까지) */
const VM_NUM = (x, lim) => { const n = Number(x); return Number.isFinite(n) ? Math.max(-lim, Math.min(lim, Math.round(n * 1000) / 1000)) : 0; };
const VM_V3 = (a, lim) => (Array.isArray(a) ? [0, 1, 2].map((i) => VM_NUM(a[i], lim)) : undefined);
const VM_COL = (c) => (typeof c === "string" && (/^#[0-9a-f]{6}$/i.test(c) || /^[abc]$/.test(c)) ? c.toLowerCase() : "#cccccc");
const VM_SH = new Set(["box", "cyl", "ball", "dome", "ring"]);
const VM_ID = /^[A-Za-z0-9_]{0,12}$/;
export function sanitizeVmodOne(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  const out = { v: 1, seat: VM_V3(d.seat, 20) || [0, 1.4, 0], pose: d.pose === "sit" ? "sit" : "ride", zoom: Math.max(0.3, Math.min(3, Number(d.zoom) || 1)), pal: {}, groups: {}, parts: [] };
  if (d.pal && typeof d.pal === "object") for (const [k, v] of Object.entries(d.pal).slice(0, 12)) { if (!/^[a-z0-9]{1,12}$/.test(k) || !v || typeof v !== "object") continue; out.pal[k] = { a: VM_COL(v.a), b: VM_COL(v.b), c: VM_COL(v.c) }; }
  if (d.groups && typeof d.groups === "object") for (const [k, q] of Object.entries(d.groups).slice(0, 40)) { if (!VM_ID.test(k) || !k || !q || typeof q !== "object") continue; const o = { p: VM_V3(q.p, 20) || [0, 0, 0] }; const r = VM_V3(q.r, 7); if (r) o.r = r; if (q.s != null) o.s = Math.max(0.05, Math.min(10, Number(q.s) || 1)); if (typeof q.par === "string" && VM_ID.test(q.par) && q.par !== k) o.par = q.par; if (q.leg != null) o.leg = VM_NUM(q.leg, 7); if (q.head) o.head = 1; if (q.tail) o.tail = 1; if (typeof q.nm === "string") o.nm = q.nm.slice(0, 16); out.groups[k] = o; }
  if (Array.isArray(d.parts)) for (const q of d.parts.slice(0, 240)) { if (!q || typeof q !== "object" || !VM_SH.has(q.sh)) continue; const o = { sh: q.sh, s: VM_V3(q.s, 20) || [0.2, 0.2, 0.2], p: VM_V3(q.p, 20) || [0, 0, 0], c: VM_COL(q.c) }; const r = VM_V3(q.r, 7); if (r && r.some((x) => x)) o.r = r; const k = VM_V3(q.k, 10); if (k && k.some((x) => x !== 1)) o.k = k; if (q.e) o.e = 1; if (q.o != null) o.o = Math.max(0.05, Math.min(1, Number(q.o) || 1)); if (typeof q.g === "string" && VM_ID.test(q.g) && (q.g === "" || out.groups[q.g])) o.g = q.g; if (typeof q.only === "string" && /^[a-z0-9]{1,12}$/.test(q.only)) o.only = q.only; out.parts.push(o); }
  for (const [k, q] of Object.entries(out.groups)) if (q.par && !out.groups[q.par]) delete q.par;
  return out.parts.length ? out : null;
}
/** v109 블럭 편집기: 새로 만든 탈것·캐릭터 (관리자만 · 12개 · 하나에 블럭 글 36000자까지) */
const VB_KEY = /^x[a-z0-9]{1,11}$/;
const VB_B64 = /^[A-Za-z0-9+/]*={0,2}$/;
export const VB_MAX = 12;
export function vbxKey(k) { return typeof k === "string" && VB_KEY.test(k) ? k : null; }
export function sanitizeVbxOne(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return null;
  const out = { v: 1, ...(d.vf === 2 ? { vf: 2 } : {}), t: d.t === "chr" || d.t === "pet" ? d.t : "veh", n: String(d.n || "새 탈것").replace(/[<>]/g, "").slice(0, 14), vu: Math.max(0.02, Math.min(0.3, Number(d.vu) || 0.08)), seat: VM_V3(d.seat, 20) || [0, 1.2, 0], zoom: Math.max(0.3, Math.min(3, Number(d.zoom) || 1)), pal: [], groups: {}, vox: {} };
  if (Array.isArray(d.pal)) out.pal = d.pal.slice(0, 64).map((c) => (typeof c === "string" && /^#[0-9a-f]{6}$/i.test(c) ? c.toLowerCase() : "#cccccc"));
  if (d.groups && typeof d.groups === "object") for (const [k, q] of Object.entries(d.groups).slice(0, 24)) { if (!VM_ID.test(k) || !k || !q || typeof q !== "object") continue; const o = { p: VM_V3(q.p, 20) || [0, 0, 0] }; const r = VM_V3(q.r, 7); if (r && r.some((x) => x)) o.r = r; if (q.s != null) o.s = Math.max(0.05, Math.min(10, Number(q.s) || 1)); if (typeof q.par === "string" && VM_ID.test(q.par) && q.par !== k) o.par = q.par; if (q.leg != null) o.leg = VM_NUM(q.leg, 7); if (q.arm != null) o.arm = VM_NUM(q.arm, 7); if (q.head) o.head = 1; if (q.tail) o.tail = 1; if (typeof q.nm === "string") o.nm = q.nm.replace(/[<>]/g, "").slice(0, 12); if (typeof q.bone === "string" && /^[a-z-]{2,16}$/.test(q.bone)) o.bone = q.bone; out.groups[k] = o; }
  for (const q of Object.values(out.groups)) if (q.par && !out.groups[q.par]) delete q.par;
  let tot = 0;
  if (d.vox && typeof d.vox === "object") for (const [k, v] of Object.entries(d.vox).slice(0, 25)) { if (typeof v !== "string" || !VM_ID.test(k) || (k && !out.groups[k]) || !VB_B64.test(v) || v.length % 4) continue; tot += v.length; if (tot > 40000) break; if (v) out.vox[k] = v; }
  if (d.shop && typeof d.shop === "object") { const sp = d.shop; out.shop = { how: sp.how === "box" ? "box" : "shop", pr: Math.max(0, Math.min(1e9, Math.round(Number(sp.pr) || 0))), g: Math.max(0, Math.min(5, Math.round(Number(sp.g) || 0))), p: Math.max(0, Math.min(100, Number(sp.p) || 0)), spd: Math.max(0, Math.min(150, Math.round(Number(sp.spd) || 0))), on: !!sp.on }; }
  return Object.keys(out.vox).length ? out : null;
}
export function sanitizeVmod(input) {
  const out = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const [k, d] of Object.entries(input).slice(0, 12)) { if (!/^[a-z]{2,12}$/.test(k)) continue; const v = sanitizeVmodOne(d); if (v) out[k] = v; }
  return out;
}

export function sanitizeTitles(input) {
  const out = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  for (const [k, list] of Object.entries(input)) {
    const nick = sanitizeNick(k);
    if (!nick || !Array.isArray(list)) continue;
    const rows = list.map(cleanTitle).filter(Boolean).slice(0, 8);
    if (rows.length) out[nick] = rows;
    if (Object.keys(out).length >= 500) break;
  }
  return out;
}

// v55: 물고기 자랑 — 들고 있는 물고기 정보 (없으면 null)
/** v85: 데크 꾸미기 — 앉은 의자 쪽 절반에 놓은 아이템 [종류, 가로 0~100, 세로 0~100, 회전 0~7] 최대 4개 */
export function cleanDeco(v) {
  if (!Array.isArray(v)) return null;
  const out = [];
  for (const it of v.slice(0, 4)) {
    if (!Array.isArray(it)) continue;
    const n = (x, hi) => Math.max(0, Math.min(hi, Math.round(Number(x) || 0)));
    const row = [n(it[0], 15), n(it[1], 100), n(it[2], 100), n(it[3], 7)];
    if (it[4] != null) row.push(n(it[4], 4));
    out.push(row);
  }
  return out.length ? out : null;
}
// v89: 작은 추가 상태 (tk 어항 디자인 · ts 기차 좌석 등) — 영문 소문자 키 4자 · 값 24자 · 최대 6개
export function cleanEx(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out = {};
  let n = 0;
  for (const k of Object.keys(v)) {
    if (n >= 12) break;
    if (!/^[a-z]{1,4}$/.test(k)) continue;
    const x = v[k];
    if (typeof x === "number" && Number.isFinite(x)) out[k] = Math.round(Math.max(-1e6, Math.min(1e6, x)) * 100) / 100;
    else if (typeof x === "string" && k === "nb") { const t = x.replace(/[\u0000-\u001f<>&"'`\\]/g, "").slice(0, 32); if (!t) continue; out[k] = t; }
    else if (typeof x === "string") { const t = x.replace(/[^\w.-]/g, "").slice(0, 24); if (!t) continue; out[k] = t; }
    else continue;
    n++;
  }
  return n ? out : null;
}
export function cleanBrag(b) {
  if (!b || typeof b !== "object" || Array.isArray(b)) return null;
  const k = cleanId(b.k, 24);
  if (!k) return null;
  const cm = Math.round(num(b.cm, 0, 3000, 0) * 10) / 10;
  return {
    k,
    g: Math.max(0, Math.min(5, Math.round(Number(b.g) || 0))),
    cm,
    v: Math.max(0, Math.min(1e8, Math.round(Number(b.v) || 0))),
    at: Math.max(0, Math.min(4e12, Math.round(Number(b.at) || 0))),
    lk: Math.max(0, Math.min(9999, Math.round(Number(b.lk) || 0))),
    s: Math.max(0, Math.min(9, Math.round(Number(b.s) || 0))),
    t: Math.max(0, Math.min(4e12, Math.round(Number(b.t) || 0))),
    vr: ["black", "pink", "red", "gold", "rainbow"].includes(b.vr) ? b.vr : "",
    st: Math.max(0, Math.min(4, Math.round(Number(b.st) || 0))),
  };
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
    // v53: 낚아 올린 순간(fish:"catch")에만 어종·등급을 실어 다른 유저 화면에 물고기를 보여 준다
    fk: fish === "catch" ? String(msg.fk || "").replace(/[^\w-]/g, "").slice(0, 24) : "",
    fg: fish === "catch" ? Math.max(0, Math.min(5, Math.round(Number(msg.fg) || 0))) : 0,
    br: msg.br === undefined ? (p.br || null) : cleanBrag(msg.br),
    tt: msg.tt === undefined ? (p.tt || null) : cleanTitle(msg.tt),
    dc: msg.dc === undefined ? (p.dc || null) : cleanDeco(msg.dc),
    ex: msg.ex === undefined ? (p.ex || null) : cleanEx(msg.ex),
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

const DUCK_SIZES = [0.72, 1, 1.28, 1.55, 1.9];

/** 간격·최대·크기·속도·종류는 시드와 벽시계로 정해져 중간 입장도 같다.
 *  속도 생략 시 0.5(느리게) = 초당 0.12라디안. head 는 진행 방향(접선)이라 부리가 앞을 본다.
 *  on 이 0/false 면 오리를 띄우지 않는다.
 *  since(켠 시각)가 있으면 그 순간 1마리, 이후 every 마다 한 마리씩 max 까지.
 *  since 가 없으면 예전처럼 고정 원점(이미 떠 있던 호수)을 쓴다. */
// v47: 원 궤도(빙글빙글) 대신 물결에 실려 정처 없이 떠다니는 경로.
// 오리마다 시드로 정한 호수 안의 지점들을 부드러운 곡선(Catmull-Rom)으로 잇고, 느린 물결 흔들림을 더한다.
// 서버 시각·ambSeed·since 만으로 위치가 정해지므로 같은 호숫가의 모든 유저가 같은 오리를 같은 자리에서 본다.
// 속도 단위: 초당 호수 좌표 거리. 관리자 값 0 / 0.5 / 1 / 1.5 / 2.5 → 멈춤 / 아주 느리게 / 느리게 / 보통 / 조금 빠르게
const DUCK_SPD = [[0, 0], [0.5, 0.025], [1, 0.05], [1.5, 0.09], [2.5, 0.15]];
export function duckSpeed(spd) {
  // v79: 관리자가 숫자(0~5)로 직접 넣어요. 표의 값 사이는 직선으로 이어요 (2.5 이상은 1당 +0.06, 5에서 초당 0.3).
  const v = Math.min(5, Number(spd));
  if (!Number.isFinite(v) || v <= 0) return 0;
  for (let j = 1; j < DUCK_SPD.length; j++) {
    const [k0, u0] = DUCK_SPD[j - 1], [k1, u1] = DUCK_SPD[j];
    if (v <= k1) return u0 + (u1 - u0) * (v - k0) / (k1 - k0);
  }
  return 0.15 + (v - 2.5) * 0.06;
}
function duckPoint(seed, i, k, R) {
  const h = mix32(mix32(seed, 500 + i), (k | 0) >>> 0);
  const h2 = mix32(h, 77);
  // v79: 지점의 40%는 바깥 고리(데크 끝 가까이), 나머지는 호수 안쪽 전체에 고르게 → 한 곳에 몰리지 않아요
  const u = (h % 100000) / 100000;
  const r = (h >>> 20) % 10 < 4 ? R * (0.8 + 0.15 * u) : Math.sqrt(u) * R * 0.8;
  const a = ((h2 % 100000) / 100000) * Math.PI * 2;
  return [Math.cos(a) * r, Math.sin(a) * r];
}
function cr(p0, p1, p2, p3, f) {
  const f2 = f * f, f3 = f2 * f;
  return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
}
const DUCK_CACHE = new Map();
function duckPos(seed, i, ageMs, R, v, tag) {
  const p0 = duckPoint(seed, i, 0, R);
  if (!(v > 0)) return p0;
  // v83: 일정한 속도 — 예전에는 구간마다 같은 시간을 써서 짧은 구간은 느리고 긴 구간은 빨랐어요.
  //      이제 구간 길이(곡선 길이)만큼 시간을 쓰고, 구간 안에서도 길이 비례로 나아가요. 오리마다 진행을 기억해서 매번 처음부터 세지 않아요.
  const key = seed + "|" + i + "|" + R.toFixed(3) + "|" + v.toFixed(5) + "|" + (tag || "");
  let c = DUCK_CACHE.get(key);
  const age = Math.max(0, ageMs);
  if (!c || age < c.t0) { c = { k: 0, t0: 0, seg: null }; DUCK_CACHE.set(key, c); if (DUCK_CACHE.size > 400) DUCK_CACHE.delete(DUCK_CACHE.keys().next().value); }
  const segOf = (k) => {
    const A = k > 0 ? duckPoint(seed, i, k - 1, R) : p0, B = duckPoint(seed, i, k, R), C = duckPoint(seed, i, k + 1, R), D = duckPoint(seed, i, k + 2, R);
    const L = [0]; let px = B[0], pz = B[1];
    for (let j = 1; j <= 12; j++) { const f = j / 12, x = cr(A[0], B[0], C[0], D[0], f), z = cr(A[1], B[1], C[1], D[1], f); L.push(L[j - 1] + Math.hypot(x - px, z - pz)); px = x; pz = z; }
    return { A, B, C, D, L, ms: Math.max(0.5, L[12]) / v * 1000 };
  };
  if (!c.seg) c.seg = segOf(c.k);
  let guard = 0;
  while (age >= c.t0 + c.seg.ms && guard++ < 5000) { c.t0 += c.seg.ms; c.k += 1; c.seg = segOf(c.k); }
  const sg = c.seg, want = (age - c.t0) / sg.ms * sg.L[12];
  let j = 1; while (j < 12 && sg.L[j] < want) j++;
  const f = ((j - 1) + (sg.L[j] > sg.L[j - 1] ? (want - sg.L[j - 1]) / (sg.L[j] - sg.L[j - 1]) : 0)) / 12;
  let x = cr(sg.A[0], sg.B[0], sg.C[0], sg.D[0], f), z = cr(sg.A[1], sg.B[1], sg.C[1], sg.D[1], f);
  // 물결 흔들림은 아주 작게 (속도가 들쭉날쭉해 보이지 않게)
  const ph = (mix32(seed, 700 + i) % 1000) / 1000 * Math.PI * 2, s = age / 1000;
  const amp = Math.min(0.15, v);
  x += Math.sin(s * 0.05 + ph) * amp;
  z += Math.cos(s * 0.04 + ph * 1.3) * amp;
  const r = Math.hypot(x, z), lim = R * 0.95;
  if (r > lim) { const k = Math.max(0.5 * lim, 2 * lim - r) / r; x *= k; z *= k; }
  return [x, z];
}
export function sharedDucks(now, world, opt) {
  const o = opt || {};
  if (o.on === 0 || o.on === false) return [];
  const every = Math.max(1000, Math.round(o.every || 300000));
  const max = Math.max(0, Math.min(32, Math.round(o.max != null ? o.max : 9)));
  const rMax = o.rMax > 0 ? o.rMax : 8;
  const kinds = Array.isArray(o.kinds) && o.kinds.length ? o.kinds : DUCK_KINDS;
  const v = duckSpeed(o.speed == null ? 0.5 : o.speed);
  const seed = Math.round(Number(world && world.ambSeed) || 1);
  const t = Number(now) || 0;
  const since = Number(o.since);
  const paced = Number.isFinite(since) && since > 0;
  const elapsed = Math.max(0, t - (paced ? since : 1700000000000));
  const n = Math.min(max, Math.floor(elapsed / every) + 1);
  const out = [];
  for (let i = 0; i < n; i++) {
    const h = mix32(seed, 400 + i);
    const h2 = mix32(seed, 900 + i);
    const age = Math.max(0, elapsed - i * every);
    const [x, z] = duckPos(seed, i, age, rMax, v);
    let head = ((h % 10000) / 10000) * Math.PI * 2;
    if (v > 0) {
      const b = duckPos(seed, i, Math.max(0, age - 4000), rMax, v, "h");
      const dx = x - b[0], dz = z - b[1];
      if (dx * dx + dz * dz > 1e-8) head = Math.atan2(dx, dz);
    }
    out.push({ i, x, z, yaw: head, head, ph: i + age / 1000, s: DUCK_SIZES[h % DUCK_SIZES.length], v: kinds[h2 % kinds.length], st: "swim", age });
  }
  return out;
}

/** 데크 점유(실유저·봇)가 가장 적은 자리. 동점이면 사람에서 더 먼 데크. */
export function pickQuietDeck(spots, people) {
  const list = Array.isArray(spots) ? spots.filter((d) => d && d.i != null) : [];
  if (!list.length) return null;
  const folks = Array.isArray(people) ? people.filter(Boolean) : [];
  const near = (d) => {
    const r = d.r > 0 ? d.r : 7;
    let n = 0;
    for (const p of folks) {
      if (p.deck != null && +p.deck === +d.i) { n += 1; continue; }
      const x = +p.x;
      const z = +p.z;
      if (Number.isFinite(x) && Number.isFinite(z) && Math.hypot(x - (+d.x || 0), z - (+d.z || 0)) < r) n += 1;
    }
    return n;
  };
  let min = Infinity;
  for (const d of list) min = Math.min(min, near(d));
  const cands = list.filter((d) => near(d) === min);
  cands.sort((a, b) => {
    const gap = (d) => (folks.length ? Math.min(...folks.map((p) => Math.hypot((+p.x || 0) - (+d.x || 0), (+p.z || 0) - (+d.z || 0)))) : 0);
    const db = gap(b) - gap(a);
    if (Math.abs(db) > 0.01) return db;
    return (+a.i || 0) - (+b.i || 0);
  });
  return cands[0];
}

/** 입장 전 맵이 다르면 들어가기 전에 다시 불러온다. 이미 플레이 중이면 이번 판은 유지. */
export function joinMapPlan(started, boot, stage) {
  if (!stageEffect(boot, stage).reload) return "stay";
  return started ? "keep-round" : "reload-before-enter";
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

/** 지금 떠 있는 공지. off 이면 대상 호숫가의 공지를 내린다. del 이면 그 항목을 지운다. */
export function sanitizeNotice(input, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  if (input == null) return null;
  if (typeof input !== "object" || Array.isArray(input)) return null;
  const ch = input.ch === "all" || input.ch == null || input.ch === "" ? "all" : (lakeTargets(input.ch).length === 1 ? lakeTargets(input.ch)[0] : "all");
  const id = String(input.id == null ? "" : input.id).replace(/[^\w.-]/g, "").slice(0, 40);
  const by = input.by ? sanitizeNick(input.by) : "";
  if (input.del) return { del: true, id, ch, by, off: true };
  const msg = cleanText(input.msg, 120);
  if (input.off && !msg) return { off: true, id, ch, by };
  if (!msg) return null;
  const min = Math.max(1, Math.min(1440, Math.round(finite(input.min, 10))));
  // v81: 끝난 공지를 다시 읽을 때 시간이 새로 늘어나던 문제 — until 이 있으면 그대로 두고(지났으면 지난 대로), 없을 때만 지금+min 분
  //      fix(고정) = 관리자가 내릴 때까지 계속 (10년)
  const fix = !!input.fix;
  let until = Math.round(finite(input.until, 0));
  if (!input.off) {
    if (fix) { if (!(until > t)) until = t + 3650 * 864e5; }
    else if (!(until > 0) || until > t + 1440 * 60000 + 120000) until = t + min * 60000;
  }
  return { id: id || String(t), msg, min, ch, until, off: !!input.off, by, ...(fix ? { fix: true } : {}) };
}

/** 호숫가 공지 목록. 삭제는 id 로 빼고, 내리기는 off. active 는 아직 떠 있는 최신 글. */
export function mergeNoticeLog(prev, note, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  let rows = [];
  for (const item of Array.isArray(prev) ? prev : []) {
    const n = sanitizeNotice(item, t);
    if (n && n.msg && !n.del) rows.push(n);
  }
  const incoming = note ? sanitizeNotice(note, t) : null;
  if (incoming && incoming.del) rows = rows.filter((n) => n.id !== incoming.id);
  else if (incoming && incoming.off && !incoming.msg) {
    rows = rows.map((n) => (!incoming.id || n.id === incoming.id ? { ...n, off: true } : n));
  } else if (incoming && incoming.msg) {
    rows = [incoming, ...rows.filter((n) => n.id !== incoming.id)];
  }
  rows = rows.slice(0, 40);
  const active = rows.find((n) => !n.off && n.until > t) || null;
  return { rows, active };
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

/** 클릭한 소켓 id 가 이 호숫가에 있으면 그 닉이 기준. 없으면 적은 닉. */
export function resolveGrantNick(patch, peers) {
  if (!patch || typeof patch !== "object") return "";
  const id = String(patch.id || "").trim();
  if (id && Array.isArray(peers)) {
    const hit = peers.find((p) => p && String(p.id) === id && p.nick);
    if (hit) return sanitizeNick(hit.nick);
  }
  if (!String(patch.nick || "").trim()) return "";
  return sanitizeNick(patch.nick);
}

export function mergeGrant(prev, patch, now, peers) {
  const t = Number.isFinite(now) ? now : Date.now();
  const next = sanitizeGrants(prev, t);
  if (!patch || (!String(patch.nick || "").trim() && !String(patch.id || "").trim())) return next;
  const nick = resolveGrantNick(patch, peers);
  if (!nick) return next;
  const mins = Math.round(Number(patch.mins));
  let until = Math.round(finite(patch.until, 0));
  if (mins > 0 && mins <= 400 * 24 * 60) until = t + mins * 60000;
  if (patch.revoke || !(until > t)) delete next[nick];
  else next[nick] = until;
  return next;
}

/** 이 클라이언트가 쓸 자동낚시 만료. keys 는 자기 닉만. mine 은 서버가 이 소켓에 적어 준 값.
 *  다른 사람 닉이 keys 에 없으면 그 지급은 따라오지 않는다. */
export function clientGrantUntil(map, keys, now, mine) {
  const t = Number.isFinite(now) ? now : Date.now();
  let best = Math.round(finite(mine, 0));
  if (!(best > t)) best = 0;
  const src = map && typeof map === "object" && !Array.isArray(map) ? map : {};
  for (const key of keys || []) {
    const until = Math.round(finite(src[sanitizeNick(key)], 0));
    if (until > t) best = Math.max(best, until);
  }
  return best > t ? best : 0;
}

/** 대상 닉과 빈 닉 별칭(나·낚시꾼) 중 남아 있는 자동낚시 시각. */
export function grantUntilFor(map, nick, extra) {
  const keys = new Set();
  const add = (n) => {
    if (n == null) return;
    const s = String(n).trim();
    if (!s) return;
    keys.add(sanitizeNick(s));
  };
  add(nick);
  (Array.isArray(extra) ? extra : []).forEach(add);
  if (!String(nick || "").trim()) {
    keys.add("나");
    keys.add("낚시꾼");
  }
  let best = 0;
  const src = map && typeof map === "object" ? map : {};
  for (const k of keys) best = Math.max(best, Math.round(finite(src[k], 0)));
  return best;
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
  // v136: 탈것·펫도 지급 (최대 6개)
  const it = Array.isArray(input.it) ? input.it.slice(0, 6).map((o) => {
    if (!o || typeof o !== "object") return null;
    const ty = o.t === "veh" || o.t === "pet" ? o.t : null;
    const k = String(o.k || "").replace(/[^\w-]/g, "").slice(0, 24);
    if (!ty || !k) return null;
    const r = { t: ty, k };
    if (ty === "veh" && o.c) r.c = String(o.c).replace(/[^\w-]/g, "").slice(0, 16);
    return r;
  }).filter(Boolean) : [];
  if (!(c || s || b || x || it.length)) return null;
  const servers = Array.isArray(input.servers)
    ? [...new Set(input.servers.map((n) => Math.round(Number(n))).filter((n) => (n >= 1 && n <= 4) || n === 7))]
    : null;
  return {
    id,
    nick,
    c,
    s,
    b,
    bt: Math.round(nonNeg(input.bt, 5)),
    x,
    it: it.length ? it : undefined,
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

export const STAGE_LAYS = ["a", "b", "c", "o"];
export const STAGE_DECKW = ["", "W1", "W2", "W3", "W4"];
export const DUCK_KINDS = ["base", "pirate", "straw", "astro", "frog", "uni", "penguin", "snowman", "dino"];
const DUCK_EVERY = [15, 30, 45, 60, 120, 300];
const DUCK_SIZE = [0.6, 0.8, 1, 1.3, 1.6, 2];
const DUCK_SPEED = [0, 0.5, 1, 1.5, 2.5];
const LOSS_TYPES = new Set(["sell", "dis", "synth", "bulk", "trade", "lost"]);
const CATS = new Set(["rod", "charm", "fish"]);
const CUE_ACT = new Set(["reset", "jump", "skip", "next"]);

export function defaultStage() {
  return { lay: "a", deckW: "", decks: 25, chN: 4, bots: 9, rev: 0, at: 0 };
}

function snapList(v, list, d) {
  const n = Number(v);
  if (!Number.isFinite(n)) return d;
  let best = d;
  let dist = Infinity;
  for (const x of list) {
    const dd = Math.abs(x - n);
    if (dd < dist) { dist = dd; best = x; }
  }
  return best;
}

/**
 * 데크 배치·모양·수, 채널 수, 봇 수.
 * 빠진 필드는 prev(없으면 기본값)를 유지하고, bump 하면 rev 를 올립니다.
 * lay 가 o 이면 데크 수는 클라이언트와 같이 20으로 고정합니다.
 */
export function sanitizeStage(input, prev, opt) {
  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    return prev ? sanitizeStage(prev, null, { bump: false, now: opt && opt.now }) : null;
  }
  const now = opt && Number.isFinite(opt.now) ? opt.now : Date.now();
  const base = { ...defaultStage(), ...(prev || {}) };
  const lay = STAGE_LAYS.includes(input.lay) ? input.lay : (STAGE_LAYS.includes(base.lay) ? base.lay : "a");
  const deckW = STAGE_DECKW.includes(input.deckW) ? input.deckW : (STAGE_DECKW.includes(base.deckW) ? base.deckW : "");
  let decks = Math.round(finite(input.decks != null ? input.decks : base.decks, base.decks));
  if (lay === "o") decks = 20;
  else decks = Math.max(2, Math.min(30, decks || 25));
  const chN = Math.max(1, Math.min(8, Math.round(finite(input.chN != null ? input.chN : base.chN, base.chN))));
  const bots = Math.max(0, Math.min(49, Math.round(finite(input.bots != null ? input.bots : base.bots, base.bots))));
  const bump = !!(opt && opt.bump);
  return {
    lay,
    deckW,
    decks,
    chN,
    bots,
    rev: bump ? (base.rev | 0) + 1 : Math.max(0, Math.round(finite(input.rev, base.rev || 0))),
    at: bump ? now : Math.max(0, Math.round(finite(input.at, base.at || 0))),
  };
}

/** 부팅된 맵과 새 스테이지가 어디서 갈리는지. reload 면 메시를 갈아끼우지 않고 다시 들어갑니다. */
export function stageEffect(boot, stage) {
  const b = boot || {};
  const s = stage || {};
  const reload = (b.lay || "a") !== (s.lay || "a")
    || (b.deckW || "") !== (s.deckW || "")
    || (+b.decks || 0) !== (+s.decks || 0);
  return {
    reload,
    bots: (+b.bots || 0) !== (+s.bots || 0),
    channels: (+b.chN || 0) !== (+s.chN || 0),
  };
}

function flag01(v) {
  return v ? 1 : 0;
}

function cleanKinds(v, prev) {
  const allow = new Set(DUCK_KINDS);
  const raw = Array.isArray(v) ? v : String(v == null ? "" : v).split(",");
  const out = [];
  for (const item of raw) {
    const k = String(item || "").replace(/[^a-z]/g, "").slice(0, 16);
    if (!allow.has(k) || out.includes(k)) continue;
    out.push(k);
    if (out.length >= 12) break;
  }
  if (out.length) return out.join(",");
  return prev || "base";
}

/**
 * 이동 속도·오리·튜토리얼 숨김. 패치에 있는 키만 덮어씁니다.
 * null 이면 저장된 값을 지웁니다.
 */
export function sanitizeXpBal(x) {
  if (!x || typeof x !== "object" || Array.isArray(x)) return null;
  const n = (v, lo, hi, d) => { const f = Number(v); return Number.isFinite(f) ? Math.max(lo, Math.min(hi, f)) : d; };
  const ints = (a, len, d) => d.map((dv, i) => Math.round(n(Array.isArray(a) ? a[i] : dv, 0, 100000, dv)));
  const lvMap = (m) => { const o = {}; if (m && typeof m === "object") Object.keys(m).slice(0, 40).forEach((k) => { if (/^\w{1,20}$/.test(k)) o[k] = Math.round(n(m[k], 1, 99, 1)); }); return o; };
  return {
    cv: ["old", "A", "B"].includes(String(x.cv)) ? String(x.cv) : "A",
    cm: Math.round(n(x.cm, 0.1, 5, 1) * 100) / 100,
    bx: ints(x.bx, 6, [10, 20, 50, 120, 300, 800]),
    gm: ints(x.gm, 5, [150, 100, 80, 30, 20]),
    gcap: Math.round(n(x.gcap, 0, 100000, 1000)),
    rc: x.rc ? 1 : 0,
    rp: Math.round(n(x.rp, 0, 100, 70)),
    rmax: Math.round(n(x.rmax, 1, 99, 30)),
    rl: lvMap(x.rl),
    bl: lvMap(x.bl),
  };
}

function sanitizeUiPos(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const out = {};
  for (const k of ["m", "pc"]) {
    const src = v[k];
    if (!src || typeof src !== "object" || Array.isArray(src)) continue;
    const one = {};
    let n = 0;
    for (const id of Object.keys(src)) {
      if (n >= 40 || !/^[A-Za-z][\w-]{0,23}$/.test(id)) continue;
      const a = src[id];
      if (!Array.isArray(a)) continue;
      const dx = Math.round(Math.max(-3000, Math.min(3000, finite(a[0], 0))));
      const dy = Math.round(Math.max(-3000, Math.min(3000, finite(a[1], 0))));
      const sc = Math.round(Math.max(0.5, Math.min(2, finite(a[2], 1))) * 100) / 100;
      one[id] = [dx, dy, sc];
      n++;
    }
    if (n) out[k] = one;
  }
  return Object.keys(out).length ? out : null;
}

function peekKey(k) {
  if (k === "tank") return "tank";
  const t = String(k == null ? "" : k);
  if (/^tx\d{1,7}$/.test(t)) return t;
  return "prof";
}

export function sanitizePlay(input, prev, opt) {
  if (input == null) return null;
  if (typeof input !== "object" || Array.isArray(input)) return prev || null;
  const now = opt && Number.isFinite(opt.now) ? opt.now : Date.now();
  const base = { ...(prev || {}) };
  const out = { ...base };
  if ("moveOn" in input) out.moveOn = !!input.moveOn;
  if ("move" in input) out.move = Math.round(Math.max(0, Math.min(1, finite(input.move, 0))) * 100) / 100;
  // v46: 다른 호숫가로 전달(ingest)될 때 prev 없이 다시 정리하므로, 이미 계산된 duckSince 를 버리지 않는다.
  if (!prev && "duckSince" in input) out.duckSince = Math.max(0, Math.round(finite(input.duckSince, 0)));
  if ("duckOn" in input) {
    const nextOn = flag01(input.duckOn);
    const had = Object.prototype.hasOwnProperty.call(base, "duckOn");
    const prevOn = had ? flag01(base.duckOn) : nextOn;
    out.duckOn = nextOn;
    if (!nextOn) out.duckSince = 0;
    else if (had && !prevOn) out.duckSince = now;
  }
  if ("duckSnd" in input) out.duckSnd = flag01(input.duckSnd);
  // v118: 생성 간격은 관리자가 숫자(초)로 직접 써요 (5초 ~ 24시간)
  if ("duckEvery" in input) { const n = Number(input.duckEvery); out.duckEvery = Number.isFinite(n) && n > 0 ? Math.max(5, Math.min(86400, Math.round(n))) : (Number.isFinite(+base.duckEvery) && +base.duckEvery > 0 ? Math.max(5, Math.min(86400, Math.round(+base.duckEvery))) : 45); }
  // v118: 오리 등장 순서 — rand(랜덤) · seq(고른 순서대로)
  if ("duckOrd" in input) out.duckOrd = input.duckOrd === "seq" ? "seq" : "rand";
  if ("duckMax" in input) out.duckMax = Math.max(0, Math.min(32, Math.round(finite(input.duckMax, base.duckMax != null ? base.duckMax : 8))));
  // v48: "rand"(랜덤)를 숫자 1로 바꾸지 않고 그대로 전달
  if ("duckSize" in input) out.duckSize = String(input.duckSize) === "rand" ? "rand" : snapList(input.duckSize, DUCK_SIZE, base.duckSize === "rand" ? 1 : snapList(base.duckSize, DUCK_SIZE, 1));
  if ("duckSpeed" in input) out.duckSpeed = Math.round(Math.max(0, Math.min(5, finite(input.duckSpeed, base.duckSpeed != null ? +base.duckSpeed : 1.5))) * 100) / 100;
  if ("duckKinds" in input) out.duckKinds = cleanKinds(input.duckKinds, base.duckKinds);
  if ("tutOff" in input) out.tutOff = flag01(input.tutOff);
  if ("donOff" in input) out.donOff = flag01(input.donOff);
  if ("bragOff" in input) out.bragOff = flag01(input.bragOff);
  // v56: 테스트 기능 '인게임 적용' — 모든 유저 기본 화면 시안
  const pickOf = (v, list) => (list.includes(String(v)) ? String(v) : list[0]);
  if ("tankUi" in input) out.tankUi = pickOf(input.tankUi, ["old", "A"]);
  if ("hudSt" in input) out.hudSt = pickOf(input.hudSt, ["old", "H1", "H3", "H4"]);
  if ("mapSt" in input) out.mapSt = pickOf(input.mapSt, ["old", "A", "B", "C", "X", "XM", "GB"]);
  if ("setUi" in input) out.setUi = pickOf(input.setUi, ["old", "A", "B", "C"]);
  if ("mobUi" in input) out.mobUi = pickOf(input.mobUi, ["old", "A", "B", "C", "D"]);
  if ("fuseOn" in input) out.fuseOn = pickOf(input.fuseOn, ["off", "on"]);
  if ("topUi" in input) out.topUi = pickOf(input.topUi, ["old", "A", "B", "C", "D"]);
  if ("uiMove" in input) out.uiMove = pickOf(input.uiMove, ["off", "on"]);
  if ("tutDone" in input) out.tutDone = pickOf(input.tutDone, ["old", "A", "B", "C"]);
  if ("boxShop" in input) {
    const b = input.boxShop;
    if (b && typeof b === "object") out.boxShop = { on: b.on ? 1 : 0, base: Math.max(0, Math.min(10000000, Math.round(finite(b.base, 1500)))), lv: Math.max(0, Math.min(1000000, Math.round(finite(b.lv, 380)))), day: Math.max(0, Math.min(100, Math.round(finite(b.day, 10)))) };
    else delete out.boxShop;
  }
  if ("deck4" in input) out.deck4 = pickOf(input.deck4, ["off", "A", "B"]);
  if ("boxEarly" in input) out.boxEarly = pickOf(input.boxEarly, ["off", "A", "B"]);
  if ("nightGlow" in input) out.nightGlow = pickOf(input.nightGlow, ["off", "A", "B", "C", "D", "E"]);
  if ("duckMerge" in input) out.duckMerge = pickOf(input.duckMerge, ["on", "off"]);
  if ("duckFamily" in input) out.duckFamily = pickOf(input.duckFamily, ["on", "off"]);
  // v85: 계정 칸 · 모험 알림 · 모바일 채팅 · 환영 문구 · 데크 어항 위치 · 데크 꾸미기
  if ("acctSlot" in input) out.acctSlot = pickOf(input.acctSlot, ["off", "on"]);
  if ("advNote" in input) out.advNote = pickOf(input.advNote, ["off", "A", "B"]);
  if ("mChat" in input) out.mChat = pickOf(input.mChat, ["off", "A", "B", "D"]);
  if ("welcome" in input) out.welcome = pickOf(input.welcome, ["off", "A", "B"]);
  if ("deckTank" in input) out.deckTank = pickOf(input.deckTank, ["off", "B", "C", "D"]);
  if ("deckDeco" in input) out.deckDeco = pickOf(input.deckDeco, ["off", "on"]);
  // v86: 부적 열쇠 · 기차 · 아이템 가격
  if ("charmBest" in input) out.charmBest = pickOf(input.charmBest, ["off", "on"]);
  if ("pets" in input) out.pets = pickOf(input.pets, ["off", "on"]);
  if ("trFare" in input) out.trFare = pickOf(input.trFare, ["off", "on"]);
  if ("veh" in input) out.veh = pickOf(input.veh, ["off", "on"]);
  if ("xpPos" in input) out.xpPos = pickOf(input.xpPos, ["A2", "A4"]);
  if ("backAsk" in input) out.backAsk = pickOf(input.backAsk, ["off", "A", "B"]);
  if ("petFx" in input) out.petFx = pickOf(input.petFx, ["off", "on"]);
  if ("bagMob" in input) out.bagMob = pickOf(input.bagMob, ["B", "A", "C", "old"]);
  if ("eqWin" in input) out.eqWin = pickOf(input.eqWin, ["off", "A", "B"]);
  if ("mission" in input) out.mission = pickOf(input.mission, ["off", "on"]);
  if ("msCfg" in input) {
    // v110: 미션마다 보상 여러 개 (rw: 골드·경험치·강화석·정수·상자 등급과 개수) · 이번 달 미션(m)
    const v = input.msCfg, T = ["catch", "rare", "legend", "sell", "box", "social", "fuse", "gold"], R = ["co", "xp", "bx", "st", "ess"];
    const num = (q, lo, hi, d) => { const n = Number(q); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : d; };
    const rwOf = (x) => { const w = x && typeof x.rw === "object" && x.rw ? x.rw : null, o = {}; if (w) { for (const k of ["co", "xp", "st", "ess"]) { const n = num(w[k], 0, 1e8, 0); if (n) o[k] = n; } const bn = num(w.bn, 0, 50, 0); if (bn) { o.bn = bn; o.bg = num(w.bg, 0, 5, 2); } } else if (x && R.includes(x.r)) { const n = num(x.v, 0, 1e8, 0); if (x.r === "bx") { o.bn = 1; o.bg = Math.max(0, Math.min(5, n)); } else if (n) o[x.r] = n; } return o; };
    const row = (x) => x && typeof x === "object" ? { t: T.includes(x.t) ? x.t : "catch", n: num(x.n, 1, 1e7, 10), rw: rwOf(x) } : null;
    const o = {};
    if (v && typeof v === "object") {
      for (const g of ["d", "w", "m"]) if (Array.isArray(v[g])) o[g] = v[g].slice(0, 10).map(row).filter(Boolean);
      if (Array.isArray(v.s)) o.s = v.s.slice(0, 10).map((x) => x && typeof x === "object" ? { d: num(x.d, 1, 31, 7), rw: rwOf(x) } : null).filter(Boolean);
    }
    out.msCfg = o;
  }
  if ("snowFx" in input) out.snowFx = pickOf(input.snowFx, ["off", "on"]);
  if ("snowCfg" in input) {
    const v = input.snowCfg, o = {};
    if (v && typeof v === "object" && !Array.isArray(v)) for (const k of ["base", "nunbal", "blizzard", "hambak", "soft", "powder", "crystal", "glitter", "glow", "sleet", "sakura"]) {
      const x = v[k]; if (!x || typeof x !== "object") continue;
      const num = (q, lo, hi, d) => { const n = Number(q); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, Math.round(n))) : d; };
      o[k] = { on: x.on ? 1 : 0, w: num(x.w, 0, 20, 1), a: num(x.a, 0, 200, 100) };
    }
    out.snowCfg = o;
  }
  // v133: 테스트 기능 중 서버 목록에 빠져 있던 것 — 「인게임 적용」이 버려지고 내 화면(나만 보기)으로 돌아가던 문제
  for (const k of ["jet", "hyper", "taxi", "boat", "star5", "skyIsland", "jump", "camFx", "fitUi", "vbUser", "tankGrp", "wearFuse", "hunger"]) if (k in input) out[k] = pickOf(input[k], ["off", "on"]);
  for (const k of ["moonRabbit", "moonRice", "moonLander", "moonRover", "moonMeteor", "moonJump"]) if (k in input) out[k] = pickOf(input[k], ["on", "off"]);
  if ("moonView" in input) out.moonView = pickOf(input.moonView, ["1", "2", "3"]);
  if ("moonHelm" in input) out.moonHelm = pickOf(input.moonHelm, ["B", "A", "off"]);
  if ("moonSplash" in input) out.moonSplash = pickOf(input.moonSplash, ["B", "A", "C", "old"]);
  if ("moonTourCap" in input) out.moonTourCap = pickOf(input.moonTourCap, ["B", "A", "C", "off"]);
  if ("petRide" in input) out.petRide = pickOf(input.petRide, ["on", "off"]);
  if ("ncPick" in input) out.ncPick = pickOf(input.ncPick, ["ym", "yf", "om", "of"]);
  if ("petFish" in input) out.petFish = pickOf(input.petFish, ["off", "on"]);
  if ("neonBB" in input) out.neonBB = pickOf(input.neonBB, ["off", "on"]);
  if ("lvSt" in input) out.lvSt = pickOf(input.lvSt, ["1", "3", "old"]);
  if ("cook" in input) out.cook = pickOf(input.cook, ["off", "on"]);
  if ("ckPos" in input) out.ckPos = pickOf(input.ckPos, ["ext", "back", "side", "mine", "off"]);
  if ("ckSnd" in input) out.ckSnd = pickOf(input.ckSnd, ["F", "B", "A", "off"]);
  if ("tank3" in input) out.tank3 = pickOf(input.tank3, ["off", "on"]);
  if ("mythChar" in input) out.mythChar = pickOf(input.mythChar, ["off", "on"]);
  if ("tankHide" in input) out.tankHide = pickOf(input.tankHide, ["off", "peer", "all"]);
  if ("profView" in input) out.profView = pickOf(input.profView, ["on", "off"]);
  if ("timeIco" in input) out.timeIco = pickOf(input.timeIco, ["A", "B", "C", "old"]);
  if ("wearShop" in input) out.wearShop = pickOf(input.wearShop, ["off", "on"]);
  if ("sumSt" in input) out.sumSt = pickOf(input.sumSt, ["B", "A", "C", "old"]);
  if ("profSt" in input) out.profSt = pickOf(input.profSt, ["A", "B", "C"]);
  if ("pouchCfg" in input) { const v = input.pouchCfg, o = { gp: [], gl: 1 }; if (v && typeof v === "object") { if (Array.isArray(v.gp)) o.gp = v.gp.slice(0, 6).map((x) => { const n = Number(x); return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n * 10) / 10)) : 0; }); const g = Number(v.gl); if (Number.isFinite(g)) o.gl = Math.max(0, Math.min(20, Math.round(g * 10) / 10)); } out.pouchCfg = o; }
  if ("wearCfg" in input) { const v = input.wearCfg, o = {}; if (v && typeof v === "object") for (const k of ["1", "10", "20", "30", "40"]) { const n = Number(v[k]); if (Number.isFinite(n) && n >= 0) o[k] = Math.min(1e7, Math.round(n)); } out.wearCfg = o; }
  if ("vehCfg" in input) {
    const v = input.vehCfg;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      // v110: 탈것마다 (기본 5종 + 상점 탈것 + 새로 만든 탈것) 확률·속도·얻는 방법·상자 등급·가격
      const n = (x, lo, hi, d) => Math.round(Math.max(lo, Math.min(hi, finite(x, d))) * 100) / 100;
      const KEY = /^[a-z][a-zA-Z0-9]{1,15}$/;
      const map = (o, f) => { const r = {}; if (o && typeof o === "object" && !Array.isArray(o)) for (const [k, x] of Object.entries(o).slice(0, 60)) { if (!KEY.test(k)) continue; const y = f(x); if (y !== undefined) r[k] = y; } return r; };
      const ok = (x) => x !== null && x !== "" && Number.isFinite(Number(x));
      const p = map(v.p, (x) => (ok(x) ? n(x, 0, 100, 0) : undefined)), sp = map(v.s, (x) => (ok(x) ? n(x, 0, 300, 0) : undefined));
      const dp = { sled: 0.4, rudolph: 0.3, dog: 0.3, santa: 0.25, car: 0.25 }, ds = { sled: 20, rudolph: 30, dog: 30, santa: 40, car: 40, carRb: 70 };
      for (const k in dp) if (p[k] == null) p[k] = dp[k];
      for (const k in ds) if (sp[k] == null) sp[k] = ds[k];
      out.vehCfg = {
        p, s: sp,
        cc: (() => { const d = { mint: 55, red: 25, black: 19, rainbow: 1 }, r = {}; for (const k in d) r[k] = n(v.cc && typeof v.cc === "object" ? v.cc[k] : undefined, 0, 1000, d[k]); return r; })(),
        how: map(v.how, (x) => (x === "shop" || x === "box" ? x : undefined)),
        g: map(v.g, (x) => { const y = Math.round(Number(x)); return Number.isFinite(y) ? Math.max(1, Math.min(5, y)) : undefined; }),
        pr: map(v.pr, (x) => { const y = Number(x); return Number.isFinite(y) ? Math.max(0, Math.min(1e10, Math.round(y))) : undefined; }),
      };
    } else delete out.vehCfg;
  }
  if ("petCfg" in input) {
    const v = input.petCfg;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const n = (x, lo, hi, d) => Math.round(Math.max(lo, Math.min(hi, finite(x, d))) * 100) / 100;
      out.petCfg = { ph: n(v.ph, 0, 1e7, 8000), pf: n(v.pf, 0, 1e7, 25000), rr: n(v.rr, 0, 50, 1.5), mr: n(v.mr, 0, 10, 0.05), dupR: n(v.dupR, 0, 1e7, 3000), dupM: n(v.dupM, 0, 1e7, 20000) };
    } else delete out.petCfg;
  }
  if ("trCfg" in input) {
    const v = input.trCfg;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const n = (x, lo, hi, d) => Math.round(Math.max(lo, Math.min(hi, finite(x, d))));
      out.trCfg = { fare: n(v.fare, 0, 100000, 30), xp: n(v.xp, 0, 100000, 12), cap: n(v.cap, 0, 1000, 40) };
    } else delete out.trCfg;
  }
  if ("train" in input) out.train = pickOf(input.train, ["off", "A", "B", "C"]);
  // v89
  if ("resumePos" in input) out.resumePos = pickOf(input.resumePos, ["off", "on"]);
  if ("peerLook" in input) out.peerLook = pickOf(input.peerLook, ["off", "on"]);
  if ("srvAuto" in input) out.srvAuto = pickOf(input.srvAuto, ["off", "on"]);
  if ("wxEach" in input) out.wxEach = pickOf(input.wxEach, ["off", "on"]);
  if ("aurora" in input) out.aurora = pickOf(input.aurora, ["old", "A", "B", "C"]);
  if ("snowSoft" in input) out.snowSoft = pickOf(input.snowSoft, ["off", "A", "B"]);
  if ("rodCard" in input) out.rodCard = pickOf(input.rodCard, ["off", "on"]);
  if ("dcOpt" in input) out.dcOpt = pickOf(input.dcOpt, ["off", "on"]);
  if ("tdef" in input) {
    const v = input.tdef;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const n = (x, lo, hi, d) => Math.max(lo, Math.min(hi, finite(x, d)));
      const e = v.ev && typeof v.ev === "object" && !Array.isArray(v.ev) ? v.ev : {};
      const ev = {};
      for (const k of ["ms", "mo", "ps", "po"]) { const t = String(e[k] == null ? "" : e[k]).replace(/[^\w]/g, "").slice(0, 4); if (t) ev[k] = t; }
      out.tdef = { tm: Math.round(n(v.tm, 0.3, 5, 1) * 100) / 100, tf: Math.round(n(v.tf, 0, 30, 0)), ac: flag01(v.ac), am: flag01(v.am), ev, bd: (String(v.bd == null ? "4" : v.bd).match(/[1-5]/) || ["4"])[0], at: Math.round(n(v.at, 0, 4e12, 0)) };
    } else delete out.tdef;
  }
  if ("prices" in input) {
    const v = input.prices;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const o = {};
      for (const g of ["r", "b", "t", "d", "x"]) {
        const src = v[g];
        if (!src || typeof src !== "object" || Array.isArray(src)) continue;
        const m = {};
        let n = 0;
        for (const [k, val] of Object.entries(src)) {
          if (n >= 80 || !/^[\w-]{1,24}$/.test(k)) continue;
          const x = Math.round(finite(val, NaN));
          if (!Number.isFinite(x) || x < 0 || x > 1e9) continue;
          m[k] = x; n++;
        }
        if (n) o[g] = m;
      }
      if (Object.keys(o).length) out.prices = o; else delete out.prices;
    } else delete out.prices;
  }
  if ("welPos" in input) {
    const w = input.welPos;
    if (w && typeof w === "object" && !Array.isArray(w)) {
      const c = (v, lo, hi, d) => Math.round(Math.max(lo, Math.min(hi, finite(v, d))) * 10) / 10;
      out.welPos = { x: c(w.x, 0, 100, 3), y: c(w.y, 0, 100, 8), w: c(w.w, 240, 900, 440), fs: c(w.fs, 10, 24, 14.5), op: c(w.op, 0.3, 1, 0.96), sp: Math.round(Math.max(0.05, Math.min(3, finite(w.sp, 0.45))) * 100) / 100 };
    } else delete out.welPos;
  }
  if ("tankPlus" in input) out.tankPlus = pickOf(input.tankPlus, ["off", "on"]);
  if ("dexPlus" in input) out.dexPlus = pickOf(input.dexPlus, ["off", "on"]);
  // v84: 관리자 › 화면·시안 ✅ 인게임 적용 — { 키: 값 } (영문 키 · 짧은 값, 최대 40개)
  if ("look" in input) {
    const L = {};
    const src = input.look && typeof input.look === "object" && !Array.isArray(input.look) ? input.look : {};
    for (const k of Object.keys(src).slice(0, 40)) { if (/^[A-Za-z0-9]{1,16}$/.test(k)) { const v = String(src[k] == null ? "" : src[k]).replace(/[^\w.-]/g, "").slice(0, 16); if (v) L[k] = v; } }
    out.look = L;
  }
  if ("duckCatch" in input) out.duckCatch = pickOf(input.duckCatch, ["off", "on"]);
  if ("afPay" in input) out.afPay = pickOf(input.afPay, ["off", "A", "B", "C"]);
  if ("duckFun" in input) out.duckFun = pickOf(input.duckFun, ["off", "slide", "flume", "fountain", "all"]);
  if ("advOn" in input) out.advOn = pickOf(input.advOn, ["off", "on", "fast"]);
  // v70: 관리자가 정한 유저 처음 화면 배치 {m:{id:[dx,dy,scale]}, pc:{...}}
  if ("uiPos" in input) { const v = sanitizeUiPos(input.uiPos); if (v) out.uiPos = v; else delete out.uiPos; }
  // v62: 배경음악
  if ("bgmOn" in input) out.bgmOn = flag01(input.bgmOn);
  if ("bgm" in input) out.bgm = /^[\w-]{1,24}$/.test(String(input.bgm)) ? String(input.bgm) : "shuffle";
  if ("bgmVol" in input) out.bgmVol = Math.round(Math.max(0, Math.min(1, finite(input.bgmVol, 0.6))) * 100) / 100;
  // v58: 경험치·아이템 밸런스 (null 이면 기본값으로)
  if ("xpBal" in input) { const v = sanitizeXpBal(input.xpBal); if (v) out.xpBal = v; else delete out.xpBal; }
  const bump = !!(opt && opt.bump);
  out.rev = bump ? ((base.rev | 0) + 1) : Math.max(0, Math.round(finite(input.rev, base.rev || 0)));
  out.at = bump ? now : Math.max(0, Math.round(finite(input.at, base.at || 0)));
  return out;
}

function safeId(v, now) {
  const s = String(v == null || v === "" ? now : v).replace(/[^\w.-]/g, "").slice(0, 40);
  return s;
}

export function sanitizeCue(input, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const kind = input.kind === "duck" || input.kind === "tut" ? input.kind : null;
  if (!kind) return null;
  const id = safeId(input.id, t);
  if (!id) return null;
  const nick = input.nick == null || input.nick === "" || input.nick === "*" ? "*" : sanitizeNick(input.nick);
  if (kind === "duck") {
    return { id, kind, nick, n: Math.max(1, Math.min(8, Math.round(finite(input.n, 1)))), at: t };
  }
  const act = CUE_ACT.has(input.act) ? input.act : null;
  if (!act) return null;
  return { id, kind, nick, act, i: Math.max(0, Math.min(80, Math.round(finite(input.i, 0)))), at: t };
}

export function pushCue(list, cue, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  const out = (Array.isArray(list) ? list : []).filter((c) => c && c.id && c.at > t - 3 * 60 * 1000);
  if (cue && cue.id && !out.some((c) => c.id === cue.id)) out.push(cue);
  return out.slice(-30);
}

function itemKey(v) {
  return String(v || "").replace(/[^a-z0-9_]/gi, "").slice(0, 24);
}

function itemId(v) {
  const n = Math.round(Number(v));
  if (!Number.isInteger(n) || n < 0 || n > 1e9) return null;
  return n;
}

function optRows(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const o of arr) {
    if (!o || typeof o !== "object" || out.length >= 8) continue;
    const k = itemKey(o.k);
    if (!k) continue;
    out.push({ k, v: Math.round(nonNeg(o.v, 1e6) * 100) / 100 });
  }
  return out;
}

export function sanitizeItem(cat, obj) {
  if (!CATS.has(cat) || !obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  const id = itemId(obj.id);
  const k = itemKey(obj.k);
  if (cat === "fish") {
    if (!k) return null;
    const row = {
      id: id == null ? 1 : id,
      k,
      cm: Math.round(nonNeg(obj.cm, 999) * 10) / 10,
      g: Math.max(0, Math.min(5, Math.round(finite(obj.g, 0)))),
      v: Math.round(nonNeg(obj.v, 1e9)),
      price: Math.round(nonNeg(obj.price, 1e9)),
      sale: !!obj.sale,
      lock: !!obj.lock,
    };
    if (obj.combo) row.combo = 1;
    return row;
  }
  if (cat === "rod") {
    if (!k) return null;
    return {
      id: id == null ? 1 : id,
      k,
      tier: Math.max(0, Math.min(5, Math.round(finite(obj.tier, 1)))),
      q: Math.round(Math.max(0, Math.min(1, finite(obj.q, 1))) * 1000) / 1000,
      br: Math.round(Math.max(0, Math.min(1, finite(obj.br, 0.5))) * 1000) / 1000,
      star: Math.max(0, Math.min(10, Math.round(finite(obj.star, 0)))),
      enh: Math.max(0, Math.min(30, Math.round(finite(obj.enh, 0)))),
      gr: Math.max(0, Math.min(5, Math.round(finite(obj.gr, 0)))),
      lock: false,
      extra: optRows(obj.extra),
    };
  }
  return {
    id: id == null ? 1 : id,
    tier: Math.max(0, Math.min(5, Math.round(finite(obj.tier, 0)))),
    opts: optRows(obj.opts),
    lock: false,
  };
}

export function sanitizeRecover(input, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (!String(input.nick || "").trim() || input.nick === "*") return null;
  const cat = CATS.has(input.cat) ? input.cat : null;
  if (!cat) return null;
  const obj = sanitizeItem(cat, input.obj);
  if (!obj) return null;
  const id = safeId(input.id, t);
  if (!id) return null;
  return {
    id,
    nick: sanitizeNick(input.nick),
    cat,
    obj,
    refund: !!input.refund,
    coins: Math.round(nonNeg(input.coins, 1e9)),
    st: Math.round(nonNeg(input.st, 1e6)),
    at: t,
  };
}

export function mergeRecover(prev, item, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  const out = (Array.isArray(prev) ? prev : []).filter((x) => x && x.id && x.at > t - 7 * 864e5);
  if (item && item.id && !out.some((x) => x.id === item.id)) out.unshift(item);
  return out.slice(0, 80);
}

export function ackRecover(prev, id, nick) {
  const nid = safeId(id, "");
  const who = sanitizeNick(nick);
  if (!nid || !String(nick || "").trim()) return Array.isArray(prev) ? prev : [];
  return (Array.isArray(prev) ? prev : []).filter((x) => !(x && x.id === nid && x.nick === who));
}

export function sanitizeLoss(input, now, nickForce) {
  const tnow = Number.isFinite(now) ? now : Date.now();
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const cat = CATS.has(input.cat) ? input.cat : null;
  if (!cat) return null;
  const obj = sanitizeItem(cat, input.obj);
  if (!obj) return null;
  const id = safeId(input.id, "");
  if (!id) return null;
  let t = Math.round(finite(input.t, tnow));
  if (t < tnow - 40 * 864e5 || t > tnow + 120000) t = tnow;
  const who = sanitizeNick(nickForce || input.who);
  return {
    id,
    t,
    who,
    type: LOSS_TYPES.has(input.type) ? input.type : "sell",
    cat,
    obj,
    coins: Math.round(nonNeg(input.coins, 1e9)),
    st: Math.round(nonNeg(input.st, 1e6)),
  };
}

export function mergeLosses(prev, incoming, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  const out = (Array.isArray(prev) ? prev : []).filter((x) => x && x.id && x.t > t - 30 * 864e5);
  const add = Array.isArray(incoming) ? incoming : (incoming ? [incoming] : []);
  for (const row of add) {
    if (!row || !row.id || out.some((x) => x.id === row.id)) continue;
    out.unshift(row);
  }
  return out.slice(0, 80);
}

const PK_VR = ["", "black", "pink", "red", "gold", "rainbow"];
const pkStr = (v, n) => String(v == null ? "" : v).replace(/[<>]/g, "").slice(0, n);
const pkNum = (v, lo, hi) => { const x = Number(v); return Number.isFinite(x) ? Math.max(lo, Math.min(hi, Math.round(x * 10) / 10)) : 0; };
const pkFish = (f) => Array.isArray(f) ? [pkStr(f[0], 24).replace(/[^\w-]/g, ""), pkNum(f[1], 0, 5), pkNum(f[2], 0, 999), PK_VR.includes(f[3]) ? f[3] : "", pkNum(f[4], 0, 4), Math.round(pkNum(f[5], 0, 1e9))] : null;
export function cleanPeek(d) {
  if (!d || typeof d !== "object" || Array.isArray(d)) return {};
  const o = {};
  for (const k of ["lv", "dex", "dexN", "tot", "days", "sold", "cap", "best5", "tankN", "rodE"]) if (d[k] != null) o[k] = pkNum(d[k], 0, 1e9);
  for (const k of ["tt", "pet", "veh", "rod", "map", "tank", "since", "msg", "set"]) if (d[k] != null) o[k] = pkStr(d[k], k === "msg" ? 60 : 24);
  if (d.best) o.best = pkFish(d.best);
  if (Array.isArray(d.fish)) o.fish = d.fish.slice(0, 120).map(pkFish).filter((f) => f && f[0]);
  if (Array.isArray(d.ach)) o.ach = d.ach.slice(0, 8).map((x) => pkStr(x, 20));
  return o;
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
  if (raw.length > MAX_MSG && !OPS.has(msg.t) && !(msg.t === "pka" && raw.length <= 8000)) return null;
  if (msg.t === "ping") return { t: "ping" };
  // v93: 프로필·어항 엿보기
  // v119: 🚕 택시 요금 요청(tx + 금액) · 답은 {ok, why}만
  if (msg.t === "pk") { const to = cleanId(msg.to, 40); return to ? { t: "pk", to, k: peekKey(msg.k) } : null; }
  if (msg.t === "pka") { const to = cleanId(msg.to, 40); if (!to) return null; const k = peekKey(msg.k); if (k.startsWith("tx")) { const d = msg.d && typeof msg.d === "object" ? msg.d : {}; return { t: "pka", to, k, d: { ok: d.ok ? 1 : 0, ...(d.why === "fare" ? { why: "fare" } : {}) } }; } return { t: "pka", to, k, d: cleanPeek(msg.d) }; }
  // v55: 초성·밸런스 게임
  if (msg.t === "ans") return { t: "ans", id: cleanId(msg.id, 24), a: String(msg.a == null ? "" : msg.a).slice(0, 30) };
  if (msg.t === "pick") return { t: "pick", id: cleanId(msg.id, 24), s: msg.s === "l" || msg.s === "r" ? msg.s : "" };
  if (msg.t === "game") return msg.game && typeof msg.game === "object" && !Array.isArray(msg.game) ? { t: "game", game: msg.game } : null;
  if (msg.t === "gameNow") return { t: "gameNow", kind: msg.kind === "bal" ? "bal" : msg.kind === "stop" ? "stop" : "cho", all: !!msg.all };
  if (msg.t === "gameGet") return { t: "gameGet" };
  if (msg.t === "titles") return msg.titles && typeof msg.titles === "object" && !Array.isArray(msg.titles) ? { t: "titles", titles: msg.titles } : null;
  if (msg.t === "vbx") { const k = vbxKey(msg.k); return k ? { t: "vbx", k, d: msg.d && typeof msg.d === "object" && !Array.isArray(msg.d) ? msg.d : null } : null; }
  if (msg.t === "vmod") return msg.vmod && typeof msg.vmod === "object" && !Array.isArray(msg.vmod) ? { t: "vmod", vmod: msg.vmod } : null;
  if (msg.t === "auth") return { t: "auth", id: cleanCred(msg.id, 64), pw: cleanCred(msg.pw, 128), out: !!msg.out, ...(cleanCred(msg.tok, 120) ? { tok: cleanCred(msg.tok, 120) } : {}) };
  if (msg.t === "world") {
    if (!msg.world || typeof msg.world !== "object" || Array.isArray(msg.world)) return null;
    return { t: "world", world: msg.world };
  }
  if (msg.t === "s5") { const k = String(msg.k == null ? "" : msg.k).replace(/[^\w-]/g, "").slice(0, 20); return k ? { t: "s5", k, g: Math.max(0, Math.min(9, msg.g | 0)) } : null; }
  if (msg.t === "notice") return { t: "notice", notice: msg.notice == null ? null : msg.notice };
  if (msg.t === "event") return { t: "event", event: msg.event == null ? null : msg.event };
  if (msg.t === "balance") return { t: "balance", balance: msg.balance == null ? null : msg.balance };
  if (msg.t === "grant") {
    const id = String(msg.id || "").replace(/[^\w.-]/g, "").slice(0, 40);
    if (!msg.nick && !id) return null;
    return { t: "grant", nick: msg.nick, until: msg.until, revoke: !!msg.revoke, mins: msg.mins, id };
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
  if (msg.t === "stage") {
    if (!msg.stage || typeof msg.stage !== "object" || Array.isArray(msg.stage)) return null;
    return { t: "stage", stage: msg.stage };
  }
  if (msg.t === "play") {
    if (!msg.play || typeof msg.play !== "object" || Array.isArray(msg.play)) return null;
    return { t: "play", play: msg.play };
  }
  if (msg.t === "cue") {
    if (!msg.cue || typeof msg.cue !== "object" || Array.isArray(msg.cue)) return null;
    return { t: "cue", cue: msg.cue };
  }
  if (msg.t === "recover") {
    if (!msg.recover || typeof msg.recover !== "object" || Array.isArray(msg.recover)) return null;
    return { t: "recover", recover: msg.recover };
  }
  if (msg.t === "recoverAck") {
    if (msg.id == null || msg.id === "") return null;
    return { t: "recoverAck", id: msg.id };
  }
  if (msg.t === "loss") {
    if (!msg.loss || typeof msg.loss !== "object" || Array.isArray(msg.loss)) return null;
    return { t: "loss", loss: msg.loss };
  }
  if (msg.t === "losses") {
    if (!Array.isArray(msg.losses)) return null;
    return { t: "losses", losses: msg.losses.slice(0, 20) };
  }
  // v79: 운영자 · 신고
  if (msg.t === "staff") return msg.staff && typeof msg.staff === "object" && !Array.isArray(msg.staff) ? { t: "staff", staff: msg.staff } : null;
  if (msg.t === "staffAdd") {
    const id = cleanId(msg.id, 40);
    return id ? { t: "staffAdd", id, r: cleanText(msg.r || "운영자", 12), p: cleanPerms(msg.p) } : null;
  }
  if (msg.t === "opAuth") {
    const op = String(msg.op || "").replace(/[^\w-]/g, "").slice(0, 32);
    return op && typeof msg.tok === "string" ? { t: "opAuth", op, tok: msg.tok.slice(0, 80), out: !!msg.out } : (msg.out ? { t: "opAuth", out: true } : null);
  }
  if (msg.t === "report") {
    return {
      t: "report", id: cleanId(msg.id, 40), nick: msg.nick == null ? "" : String(msg.nick).slice(0, 40),
      why: cleanText(msg.why || "", 12), memo: cleanText(msg.memo || "", 120),
      lines: (Array.isArray(msg.lines) ? msg.lines : []).slice(-5).map((x) => cleanText(x, 90)),
    };
  }
  if (msg.t === "repDone") return { t: "repDone", id: String(msg.id || "").replace(/[^\w-]/g, "").slice(0, 24), del: !!msg.del };
  if (msg.t === "chat" || msg.t === "emote") {
    const text = cleanText(msg.text, msg.t === "emote" ? 8 : 80);
    if (!text) return null;
    return { t: msg.t, text };
  }
  if (msg.t === "like") {
    const to = cleanId(msg.to, 40);
    return to ? { t: "like", to } : null;
  }
  if (msg.t === "hello" || msg.t === "pose") {
    return {
      t: msg.t,
      br: msg.br === undefined ? undefined : msg.br,
      tt: msg.tt === undefined ? undefined : msg.tt,
      dc: msg.dc === undefined ? undefined : msg.dc,
      ex: msg.ex === undefined ? undefined : msg.ex,
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
      fk: msg.fish === "catch" ? cleanId(msg.fk, 24) : undefined,
      fg: msg.fish === "catch" ? Math.max(0, Math.min(5, Math.round(Number(msg.fg) || 0))) : undefined,
      cid: cleanId(msg.cid, 40),
      home: msg.t === "hello" ? cleanHome(msg.home) : undefined,
      adm: msg.t === "hello" && msg.adm && typeof msg.adm === "object" ? { id: cleanCred(msg.adm.id, 64), pw: cleanCred(msg.adm.pw, 128), ...(cleanCred(msg.adm.tok, 120) ? { tok: cleanCred(msg.adm.tok, 120) } : {}) } : null,
    };
  }
  return null;
}

export function allowPose(now, att, pose) {
  const dt = now - (att.lastPose || 0);
  const bk = (b) => (b ? b.k + b.at + "|" + b.lk : "");
  const tk = (t) => (t ? t.n + t.bg : "");
  const important = att.fish !== pose.fish || att.anim !== pose.anim || att.seat !== pose.seat || bk(att.br) !== bk(pose.br) || tk(att.tt) !== tk(pose.tt) || JSON.stringify(att.dc || null) !== JSON.stringify(pose.dc || null) || JSON.stringify(att.ex || null) !== JSON.stringify(pose.ex || null);
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
    fk: att.fk || "",
    fg: att.fg | 0,
    br: att.br || null,
    tt: att.tt || null,
    dc: att.dc || null,
    ex: att.ex || null,
    anim: att.anim,
    seat: att.seat,
  };
}

const ALLOWED = new Set([
  "https://fishcozy.com",
  "https://www.fishcozy.com",
  "https://dydtjr13.github.io",
  "http://fishcozy.com",
  "http://www.fishcozy.com",
  "http://dydtjr13.github.io",
  // v87: Cloudflare 로 옮긴 사이트 (확인용 주소)
  "https://fishcozy-site.mi1ku.workers.dev",
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

  if (msg.t === "like") {
    if (!att.ready || !msg.to || msg.to === att.id) return { att, drop: true };
    if (now - (att.lastLike || 0) < 1500) return { att, drop: true };
    att.lastLike = now;
    return { att, drop: false, event: { t: "like", id: att.id, nick: att.nick, to: msg.to } };
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

  if (msg.t === "hello" && cleanHome(msg.home)) att.home = cleanHome(msg.home);
  att.nick = nick;
  att.ki = pose.ki;
  att.lv = pose.lv;
  att.x = pose.x;
  att.z = pose.z;
  att.y = pose.y;
  att.d = pose.d;
  att.fish = pose.fish;
  att.fk = pose.fk;
  att.fg = pose.fg;
  att.br = pose.br;
  att.tt = pose.tt;
  att.dc = pose.dc;
  att.ex = pose.ex;
  att.anim = denied && pose.anim === "sit" ? "idle" : pose.anim;
  att.seat = seat;
  att.seatKey = seatKey;
  att.lastPose = now;
  att.ready = true;

  return { att, drop: false, first, denied, pub: publicPeer(att) };
}

// ───────── v79: 운영자(스태프) · 신고 · 도배 자동 제재 ─────────
/** 운영자 권한 키. 관리자 창 탭과 같은 이름이에요. test(테스트·디버그)는 최고관리자만. */
export const STAFF_PERMS = ["dash", "user", "give", "sanc", "rep", "rec", "time", "map", "bal", "ev", "ann", "prof", "look", "lab", "op"];
/** 관리자 전용 메시지 → 필요한 권한(하나라도 있으면 허용) */
export const OP_NEED = {
  sanc: ["sanc"], grant: ["give"], grants: ["give"], gift: ["give"], recover: ["rec"], world: ["time"],
  stage: ["map"], play: ["map", "look", "lab", "bal"], balance: ["bal"], event: ["ev"], cue: ["ev"],
  game: ["ev"], gameNow: ["ev"], gameGet: ["ev"], notice: ["ann"], prof: ["prof"], titles: ["user"],
  staff: ["op"], staffAdd: ["op"], repDone: ["rep", "sanc"],
};
export function opAllowed(perms, t) {
  const need = OP_NEED[t];
  if (!need || !Array.isArray(perms)) return false;
  return need.some((p) => perms.includes(p));
}
export function cleanPerms(p) {
  return [...new Set((Array.isArray(p) ? p : []).filter((x) => STAFF_PERMS.includes(x)))];
}
/** 운영자 목록 { opId: { n, r, p, t } } — 최대 50명 */
export function sanitizeStaff(map) {
  const out = {};
  if (!map || typeof map !== "object" || Array.isArray(map)) return out;
  for (const k of Object.keys(map)) {
    if (Object.keys(out).length >= 50) break;
    const id = String(k).replace(/[^\w-]/g, "").slice(0, 32);
    const row = map[k];
    if (!id || !row || typeof row !== "object") continue;
    const n = sanitizeNick(row.n);
    if (!String(row.n || "").trim()) continue;
    out[id] = { n, r: cleanText(row.r || "운영자", 12) || "운영자", p: cleanPerms(row.p), t: Math.round(finite(row.t, 0)) };
  }
  return out;
}
/** 신고 한 줄: kind = user(유저 신고) | spam(도배 자동 감지) */
export function sanitizeReport(input, now, from) {
  const t = Number.isFinite(now) ? now : Date.now();
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  if (!String(input.nick || "").trim()) return null;
  const kind = input.kind === "spam" ? "spam" : "user";
  const WHY = ["욕설·비하", "도배", "부적절한 닉네임", "사기·거래", "불법 프로그램", "기타"];
  const why = kind === "spam" ? "도배" : (WHY.includes(input.why) ? input.why : "기타");
  const lines = (Array.isArray(input.lines) ? input.lines : []).slice(-5).map((s) => cleanText(s, 90)).filter(Boolean);
  return {
    id: String(input.id || (t.toString(36) + Math.random().toString(36).slice(2, 6))).replace(/[^\w-]/g, "").slice(0, 24),
    t, kind, nick: sanitizeNick(input.nick), from: kind === "spam" ? "자동 감지" : sanitizeNick(from || "낚시꾼"),
    why, memo: cleanText(input.memo || "", 120), lines, sv: Math.max(0, Math.min(4, Math.round(finite(input.sv, 0)))),
    n: Math.max(1, Math.min(999, Math.round(finite(input.n, 1)))), done: input.done ? 1 : 0,
  };
}
/** 최근 14일 · 최대 200건. 같은 사람이 같은 대상 신고를 10분 안에 또 하면 하나로 */
export function mergeReports(prev, incoming, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  const out = (Array.isArray(prev) ? prev : []).filter((x) => x && x.id && x.t > t - 14 * 864e5);
  for (const row of Array.isArray(incoming) ? incoming : (incoming ? [incoming] : [])) {
    if (!row || !row.id || out.some((x) => x.id === row.id)) continue;
    const dup = out.find((x) => x.kind === row.kind && x.nick === row.nick && x.from === row.from && row.t - x.t < 10 * 60e3 && !x.done);
    if (dup) { dup.n = (dup.n | 0) + (row.n | 0 || 1); dup.t = row.t; if (row.lines.length) dup.lines = row.lines; continue; }
    out.unshift(row);
  }
  return out.slice(0, 200);
}
/** 도배 감지: 10초에 5번 이상 · 또는 30초 안에 같은 말 3번.
 *  1~3번째 적발 1분, 4번째부터 5분 채팅 금지. 1시간에 6번 이상이면 악성 도배자로 관리자·운영자에게 알려요. */
export const SPAM = { win: 10e3, max: 5, same: 3, sameWin: 30e3, short: 60e3, long: 5 * 60e3, longAfter: 3, flagAt: 6, hour: 3600e3 };
export function spamStep(rec, text, now) {
  const t = Number.isFinite(now) ? now : Date.now();
  const r = rec && typeof rec === "object" ? rec : {};
  r.ts = (r.ts || []).filter((x) => t - x[0] < SPAM.sameWin);
  r.strikes = (r.strikes || []).filter((x) => t - x < SPAM.hour);
  const key = String(text || "").replace(/\s+/g, "").toLowerCase();
  r.ts.push([t, key]);
  const burst = r.ts.filter((x) => t - x[0] < SPAM.win).length >= SPAM.max;
  const same = key && r.ts.filter((x) => x[1] === key).length >= SPAM.same;
  if (!(burst || same)) return { rec: r, hit: false };
  r.ts = [];
  r.strikes.push(t);
  const n = r.strikes.length;
  const ms = n > SPAM.longAfter ? SPAM.long : SPAM.short;
  const flag = n >= SPAM.flagAt && !(r.flagAt && t - r.flagAt < SPAM.hour);
  if (flag) r.flagAt = t;
  return { rec: r, hit: true, n, ms, flag };
}
