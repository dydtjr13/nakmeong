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

const FISH = new Set(["off", "cast", "bite"]);
const ANIMS = new Set(["idle", "walk", "sit", "holding-right"]);

export function sanitizeNick(n) {
  const s = String(n ?? "")
    .replace(/[\u0000-\u001f<>]/g, "")
    .trim()
    .slice(0, 10);
  return s || "낚시꾼";
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

export function parseClient(raw) {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_MSG) return null;
  let msg;
  try {
    msg = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!msg || typeof msg !== "object" || typeof msg.t !== "string") return null;
  if (msg.t === "ping") return { t: "ping" };
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
