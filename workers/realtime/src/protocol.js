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
const OPS = new Set(["world", "notice", "event", "balance", "grant", "grants", "sanc", "gift", "prof", "stage", "play", "cue", "recover", "recoverAck", "loss", "losses", "game", "gameNow", "titles"]);

const FISH = new Set(["off", "cast", "bite", "catch"]);
/** v52: 서버 인증된 관리자 소켓만 보낼 수 있는 운영 메시지 */
export const ADMIN_OPS = new Set(["world", "notice", "event", "balance", "grant", "grants", "sanc", "gift", "prof", "stage", "play", "cue", "recover", "game", "gameNow", "gameGet", "titles"]);
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
  const v = Number(spd);
  if (!Number.isFinite(v) || v <= 0) return 0;
  for (const [k, u] of DUCK_SPD) if (Math.abs(k - v) < 1e-6) return u;
  return Math.min(0.2, v * 0.06);
}
function duckPoint(seed, i, k, R) {
  const h = mix32(mix32(seed, 500 + i), (k | 0) >>> 0);
  const h2 = mix32(h, 77);
  const r = Math.sqrt((h % 100000) / 100000) * R * 0.85;
  const a = ((h2 % 100000) / 100000) * Math.PI * 2;
  return [Math.cos(a) * r, Math.sin(a) * r];
}
function cr(p0, p1, p2, p3, f) {
  const f2 = f * f, f3 = f2 * f;
  return 0.5 * (2 * p1 + (-p0 + p2) * f + (2 * p0 - 5 * p1 + 4 * p2 - p3) * f2 + (-p0 + 3 * p1 - 3 * p2 + p3) * f3);
}
function duckPos(seed, i, ageMs, R, v) {
  const p0 = duckPoint(seed, i, 0, R);
  if (!(v > 0)) return p0;
  const segMs = ((0.9 * R) / v) * 1000;
  const u = Math.max(0, ageMs) / segMs;
  const k = Math.floor(u), f = u - k;
  const A = k > 0 ? duckPoint(seed, i, k - 1, R) : p0;
  const B = duckPoint(seed, i, k, R), C = duckPoint(seed, i, k + 1, R), D = duckPoint(seed, i, k + 2, R);
  let x = cr(A[0], B[0], C[0], D[0], f), z = cr(A[1], B[1], C[1], D[1], f);
  // 물결 흔들림: 아주 느린 옆걸음 (속도에 비례, 멈춤이면 0)
  const ph = (mix32(seed, 700 + i) % 1000) / 1000 * Math.PI * 2, s = ageMs / 1000;
  const amp = Math.min(0.8, 4 * v);
  x += Math.sin(s * 0.09 + ph) * amp;
  z += Math.cos(s * 0.07 + ph * 1.3) * amp;
  const r = Math.hypot(x, z), lim = R * 0.95;
  if (r > lim) { x *= lim / r; z *= lim / r; }
  return [x, z];
}
export function sharedDucks(now, world, opt) {
  const o = opt || {};
  if (o.on === 0 || o.on === false) return [];
  const every = Math.max(1000, Math.round(o.every || 300000));
  const max = Math.max(0, Math.min(30, Math.round(o.max != null ? o.max : 9)));
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
      const b = duckPos(seed, i, Math.max(0, age - 4000), rMax, v);
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
  let until = Math.round(finite(input.until, 0));
  if (!input.off && (!(until > t) || until > t + 1440 * 60000 + 120000)) until = t + min * 60000;
  return { id: id || String(t), msg, min, ch, until, off: !!input.off, by };
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
  if ("duckEvery" in input) out.duckEvery = snapList(input.duckEvery, DUCK_EVERY, snapList(base.duckEvery, DUCK_EVERY, 45));
  if ("duckMax" in input) out.duckMax = Math.max(0, Math.min(30, Math.round(finite(input.duckMax, base.duckMax != null ? base.duckMax : 8))));
  // v48: "rand"(랜덤)를 숫자 1로 바꾸지 않고 그대로 전달
  if ("duckSize" in input) out.duckSize = String(input.duckSize) === "rand" ? "rand" : snapList(input.duckSize, DUCK_SIZE, base.duckSize === "rand" ? 1 : snapList(base.duckSize, DUCK_SIZE, 1));
  if ("duckSpeed" in input) out.duckSpeed = snapList(input.duckSpeed, DUCK_SPEED, snapList(base.duckSpeed, DUCK_SPEED, 1));
  if ("duckKinds" in input) out.duckKinds = cleanKinds(input.duckKinds, base.duckKinds);
  if ("tutOff" in input) out.tutOff = flag01(input.tutOff);
  if ("donOff" in input) out.donOff = flag01(input.donOff);
  if ("bragOff" in input) out.bragOff = flag01(input.bragOff);
  // v56: 테스트 기능 '인게임 적용' — 모든 유저 기본 화면 시안
  const pickOf = (v, list) => (list.includes(String(v)) ? String(v) : list[0]);
  if ("tankUi" in input) out.tankUi = pickOf(input.tankUi, ["old", "A"]);
  if ("hudSt" in input) out.hudSt = pickOf(input.hudSt, ["old", "H1", "H3", "H4"]);
  if ("mapSt" in input) out.mapSt = pickOf(input.mapSt, ["old", "A", "B", "C", "X", "XM", "GB"]);
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
  // v55: 초성·밸런스 게임
  if (msg.t === "ans") return { t: "ans", id: cleanId(msg.id, 24), a: String(msg.a == null ? "" : msg.a).slice(0, 30) };
  if (msg.t === "pick") return { t: "pick", id: cleanId(msg.id, 24), s: msg.s === "l" || msg.s === "r" ? msg.s : "" };
  if (msg.t === "game") return msg.game && typeof msg.game === "object" && !Array.isArray(msg.game) ? { t: "game", game: msg.game } : null;
  if (msg.t === "gameNow") return { t: "gameNow", kind: msg.kind === "bal" ? "bal" : msg.kind === "stop" ? "stop" : "cho", all: !!msg.all };
  if (msg.t === "gameGet") return { t: "gameGet" };
  if (msg.t === "titles") return msg.titles && typeof msg.titles === "object" && !Array.isArray(msg.titles) ? { t: "titles", titles: msg.titles } : null;
  if (msg.t === "auth") return { t: "auth", id: cleanCred(msg.id, 64), pw: cleanCred(msg.pw, 128), out: !!msg.out, ...(cleanCred(msg.tok, 120) ? { tok: cleanCred(msg.tok, 120) } : {}) };
  if (msg.t === "world") {
    if (!msg.world || typeof msg.world !== "object" || Array.isArray(msg.world)) return null;
    return { t: "world", world: msg.world };
  }
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
      adm: msg.t === "hello" && msg.adm && typeof msg.adm === "object" ? { id: cleanCred(msg.adm.id, 64), pw: cleanCred(msg.adm.pw, 128), ...(cleanCred(msg.adm.tok, 120) ? { tok: cleanCred(msg.adm.tok, 120) } : {}) } : null,
    };
  }
  return null;
}

export function allowPose(now, att, pose) {
  const dt = now - (att.lastPose || 0);
  const bk = (b) => (b ? b.k + b.at + "|" + b.lk : "");
  const tk = (t) => (t ? t.n + t.bg : "");
  const important = att.fish !== pose.fish || att.anim !== pose.anim || att.seat !== pose.seat || bk(att.br) !== bk(pose.br) || tk(att.tt) !== tk(pose.tt);
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
  att.anim = denied && pose.anim === "sit" ? "idle" : pose.anim;
  att.seat = seat;
  att.seatKey = seatKey;
  att.lastPose = now;
  att.ready = true;

  return { att, drop: false, first, denied, pub: publicPeer(att) };
}
