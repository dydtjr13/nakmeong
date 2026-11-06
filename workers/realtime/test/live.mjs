/**
 * wrangler dev 로컬 Durable Object에 두 브라우저처럼 붙어서
 * 인원, 자리, 채팅, 서버 분리, 정원 50을 확인합니다.
 *
 *   npm run test:live
 */
import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const PORT = 8791;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const BASE = `ws://127.0.0.1:${PORT}`;

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

function connect(server, origin = ORIGIN) {
  const ws = new WebSocket(`${BASE}/ws/${server}`, { headers: { Origin: origin } });
  const inbox = [];
  let waiters = [];
  ws.on("message", (buf) => {
    const raw = Buffer.isBuffer(buf) ? buf.toString() : String(buf);
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    if (waiters.length) waiters.shift()(msg);
    else inbox.push(msg);
  });
  const ready = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`open timeout /ws/${server}`)), 8000);
    ws.once("open", () => { clearTimeout(t); resolve(ws); });
    ws.once("error", (e) => { clearTimeout(t); reject(e); });
  });
  return {
    ws,
    ready,
    next(ms = 3000) {
      if (inbox.length) return Promise.resolve(inbox.shift());
      return new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("message timeout")), ms);
        waiters.push((m) => { clearTimeout(t); resolve(m); });
      });
    },
    send(obj) { ws.send(JSON.stringify(obj)); },
    close() { try { ws.close(); } catch { /* ignore */ } },
  };
}

const hello = (nick, extra = {}) => ({
  t: "hello", nick, ki: 1, lv: 3, x: 10, z: 12, y: 0.4, d: 0.2, fish: "off", anim: "idle", seat: null, ...extra,
});

async function main() {
  const child = spawn("npx", ["wrangler", "dev", "--port", String(PORT), "--ip", "127.0.0.1"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
    detached: true,
  });
  let log = "";
  const onData = (b) => { log += b.toString(); if (log.length > 80000) log = log.slice(-40000); };
  child.stdout.on("data", onData);
  child.stderr.on("data", onData);
  const stop = () => {
    try { process.kill(-child.pid, "SIGTERM"); } catch { /* already stopped */ }
  };
  process.on("exit", stop);

  try {
    let health = null;
    for (let i = 0; i < 80; i++) {
      try {
        const r = await fetch(`${ORIGIN}/health`, { signal: AbortSignal.timeout(1500) });
        if (r.ok) { health = await r.json(); break; }
      } catch { /* not up yet */ }
      if (child.exitCode != null) break;
      await delay(500);
    }
    if (!health) {
      console.error(log.slice(-4000));
      throw new Error("wrangler dev did not become healthy");
    }
    assert(health.ok && health.service === "fishcozy-realtime", "health payload");
    assert(health.servers === 4 && health.cap === 50, "health cap");

    const cors = await fetch(`${ORIGIN}/servers`, { headers: { Origin: "https://fishcozy.com" } });
    assert(cors.headers.get("access-control-allow-origin") === "https://fishcozy.com", "cors");
    const listed = await cors.json();
    assert(listed.ok && listed.servers.length === 4, "4 servers");
    assert(listed.servers.every((s) => s.n === 0 && s.cap === 50), "empty counts are real sockets");

    const evil = await fetch(`${ORIGIN}/ws/1`, { headers: { Origin: "https://evil.example" } });
    assert(evil.status === 403, `evil origin should be 403, got ${evil.status}`);

    const missing = await fetch(`${ORIGIN}/ws/9`);
    assert(missing.status === 404, "unknown server");

    const a = connect(2);
    await a.ready;
    a.send(hello("민물", { x: 4, z: 6, seat: 1, anim: "sit", y: 0.66 }));
    const welcomeA = await a.next();
    assert(welcomeA.t === "welcome" && welcomeA.server === 2 && welcomeA.cap === 50, "welcome A");
    assert(welcomeA.peers.length === 0, "A is first");
    assert(welcomeA.world && welcomeA.world.dayLen === 150 && welcomeA.world.auto === true, "welcome carries world");

    const b = connect(2);
    await b.ready;
    b.send(hello("달빛", { x: 8, z: 9 }));
    const welcomeB = await b.next();
    const joinForA = await a.next();
    assert(welcomeB.t === "welcome" && welcomeB.peers.some((p) => p.nick === "민물"), `B snapshot has A ${JSON.stringify(welcomeB)}`);
    assert(welcomeB.n === 2, "count is sockets, not bots");
    assert(joinForA.t === "join" && joinForA.peer.nick === "달빛", "A sees B join");
    assert(welcomeB.world && welcomeB.world.dayLen === 150, "B welcome world");

    a.send({
      t: "world",
      world: {
        dayLen: 600, auto: true, off: 0.2, t0: 0, freezeT: 0.2,
        wxOv: "snow", wxUntil: 0, seasonOv: "summer", seasonLen: 90,
        seasonOff: 1, seasonT0: 0, seasonSpd: 0, seasonLink: 0, mapTheme: "xmas",
      },
    });
    const [worldA, worldB] = await Promise.all([a.next(), b.next()]);
    assert(worldA.t === "world" && worldB.t === "world", "world broadcast to both");
    assert(worldA.world.dayLen === 600 && worldB.world.dayLen === 600, "day length synced");
    assert(worldA.world.wxOv === "snow" && worldB.world.wxOv === "snow", "weather synced");
    assert(worldA.world.seasonOv === "summer" && worldB.world.seasonLen === 90, "season synced");
    assert(worldA.world.mapTheme === "xmas" && worldA.world.rev === worldB.world.rev, "map and rev synced");

    const c = connect(4);
    await c.ready;

    a.send({ t: "chat", text: "오늘 입질 좋아요" });
    const chatB = await b.next();
    assert(chatB.t === "chat" && chatB.nick === "민물" && chatB.text === "오늘 입질 좋아요", "chat delivered");
    a.send({ t: "chat", text: "너무 빨라요" });
    await delay(750);
    a.send({ t: "emote", text: "🐟" });
    const emB = await b.next();
    assert(emB.t === "emote" && emB.text === "🐟", "fast second chat dropped, emote kept");

    a.send({ t: "pose", x: 4.4, z: 6.2, y: 0.66, d: 1, fish: "cast", anim: "holding-right", seat: 1, ki: 1, lv: 3 });
    const poseB = await b.next();
    assert(poseB.t === "pose" && poseB.fish === "cast" && poseB.id === welcomeA.id, "pose broadcast");

    b.send({ t: "pose", x: 4, z: 6, y: 0.66, d: 0, fish: "off", anim: "sit", seat: 3, ki: 0, lv: 2 });
    const denied = await b.next();
    assert(denied.t === "seat" && denied.ok === false, "same spot denied");
    const deniedPose = await a.next();
    assert(deniedPose.t === "pose" && deniedPose.seat == null, "others see the seat released");

    c.send(hello("옆서버"));
    const welcomeC = await c.next();
    assert(welcomeC.server === 4 && welcomeC.peers.length === 0, "rooms are isolated");

    const mid = await (await fetch(`${ORIGIN}/servers`)).json();
    const lake2 = mid.servers.find((s) => s.id === 2);
    const lake4 = mid.servers.find((s) => s.id === 4);
    const lake1 = mid.servers.find((s) => s.id === 1);
    assert(lake2.n === 2 && lake4.n === 1 && lake1.n === 0, `counts ${JSON.stringify(mid.servers)}`);

    a.close();
    const left = await b.next();
    assert(left.t === "leave" && left.id === welcomeA.id && left.n === 1, "leave broadcast");
    b.close();
    c.close();
    await delay(300);

    const sockets = [];
    for (let i = 0; i < 50; i++) {
      const s = connect(1);
      sockets.push(s);
    }
    await Promise.all(sockets.map((s) => s.ready));
    const fullList = await (await fetch(`${ORIGIN}/servers`)).json();
    assert(fullList.servers.find((s) => s.id === 1).n === 50, "50 live sockets");
    let rejected = false;
    try {
      const extra = connect(1);
      await extra.ready;
      extra.close();
    } catch {
      rejected = true;
    }
    assert(rejected, "51st socket must be refused");
    sockets[0].close();
    await delay(400);
    const again = connect(1);
    await again.ready;
    again.close();
    sockets.slice(1).forEach((s) => s.close());

    const opts = await fetch(`${ORIGIN}/servers`, { method: "OPTIONS", headers: { Origin: "https://www.fishcozy.com" } });
    assert(opts.status === 204, "preflight");
    assert(opts.headers.get("access-control-allow-origin") === "https://www.fishcozy.com", "www cors");

    console.log("live ok: presence, chat, seat, isolation, cap 50");
  } catch (e) {
    console.error("--- wrangler log ---");
    console.error(log.slice(-5000));
    throw e;
  } finally {
    stop();
    try { await once(child, "exit"); } catch { /* already gone */ }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
