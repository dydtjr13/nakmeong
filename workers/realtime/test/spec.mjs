/**
 * v177: 홈페이지 라이브 관전(?spec=1) 확인 — wrangler dev 로컬 서버에 붙어서
 *  ① 관전자는 인원(n)에 안 들어가요  ② 관전자는 들어오자마자 welcome(spec) + 지금 있는 사람 목록을 받아요
 *  ③ 다른 사람의 입장·움직임·퇴장 방송을 받아요  ④ 관전자가 보내는 건 모두 무시돼요 (닉·채팅 불가)
 *  ⑤ 인사(hello) 없이도 끊기지 않아요  ⑥ 운하(20)·달(7) 방도 관전돼요
 *   npm run test:spec
 */
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

const PORT = 8792;
const ORIGIN = `http://127.0.0.1:${PORT}`;
const BASE = `ws://127.0.0.1:${PORT}`;
const ok = (c, m) => { if (!c) throw new Error(m); console.log("  ✓ " + m); };

function connect(path, origin = "https://fishcozy.com") {
  const ws = new WebSocket(`${BASE}${path}`, { headers: { Origin: origin } });
  const inbox = []; let waiters = [];
  ws.on("message", (buf) => { let m; try { m = JSON.parse(String(buf)); } catch { return; } if (waiters.length) waiters.shift()(m); else inbox.push(m); });
  const ready = new Promise((res, rej) => { const t = setTimeout(() => rej(new Error("open timeout " + path)), 8000); ws.once("open", () => { clearTimeout(t); res(); }); ws.once("error", (e) => { clearTimeout(t); rej(e); }); });
  const next = (ms = 3000, want) => new Promise((res, rej) => {
    const pick = () => { const i = inbox.findIndex((m) => !want || want(m)); if (i >= 0) return inbox.splice(i, 1)[0]; return null; };
    const got = pick(); if (got) return res(got);
    const t = setTimeout(() => { waiters = waiters.filter((w) => w !== w0); rej(new Error("message timeout " + path)); }, ms);
    const w0 = (m) => { if (!want || want(m)) { clearTimeout(t); res(m); } else { inbox.push(m); waiters.push(w0); } };
    waiters.push(w0);
  });
  return { ws, ready, next, inbox, send: (o) => ws.send(typeof o === "string" ? o : JSON.stringify(o)), close: () => { try { ws.close(); } catch { /* ignore */ } } };
}
const hello = (nick, extra = {}) => ({ t: "hello", nick, ki: 1, lv: 3, x: 10, z: 12, y: 0.4, d: 0.2, fish: "off", anim: "idle", seat: null, ...extra });
const count = async (id) => { const j = await (await fetch(`${ORIGIN}/servers`)).json(); const r = j.servers.find((s) => s.id === id); return r ? r.n : -1; };

async function main() {
  const child = spawn("npx", ["wrangler", "dev", "--port", String(PORT), "--ip", "127.0.0.1"], { cwd: fileURLToPath(new URL("..", import.meta.url)), stdio: ["ignore", "pipe", "pipe"], env: process.env, detached: true });
  let log = ""; const onData = (b) => { log += b; if (log.length > 80000) log = log.slice(-40000); };
  child.stdout.on("data", onData); child.stderr.on("data", onData);
  process.on("exit", () => { try { process.kill(-child.pid, "SIGTERM"); } catch { /* ignore */ } });
  try {
    let up = false;
    for (let i = 0; i < 120 && !up; i++) { try { up = (await fetch(`${ORIGIN}/health`, { signal: AbortSignal.timeout(1500) })).ok; } catch { /* wait */ } if (!up) await delay(500); }
    if (!up) { console.error(log.slice(-4000)); throw new Error("wrangler dev not healthy"); }

    // 플레이어 A 입장
    const a = connect("/ws/2"); await a.ready; a.send(hello("관전테스트A", { x: 4, z: 6 }));
    ok((await a.next(4000, (m) => m.t === "welcome")).t === "welcome", "플레이어 A 입장");
    const n0 = await count(2);

    // 관전자 입장 — hello 없이 welcome 을 받아요
    const s = connect("/ws/2?spec=1"); await s.ready;
    const w = await s.next(4000, (m) => m.t === "welcome");
    ok(w.spec === 1 && w.server === 2, "관전자는 들어오자마자 welcome(spec) 을 받아요");
    ok(Array.isArray(w.peers) && w.peers.some((p) => p.nick === "관전테스트A"), "welcome 에 지금 있는 사람(A)이 있어요");
    ok(!("grants" in w) && !("sanc" in w), "운영 정보(grants·sanc)는 안 보내요");
    ok(await count(2) === n0, `관전자는 인원에 안 들어가요 (${n0})`);
    await delay(150);
    ok(!a.inbox.some((m) => m.t === "join"), "관전자 입장은 다른 사람에게 알리지 않아요");

    // B 입장 → 관전자가 join 을 받아요
    const b = connect("/ws/2"); await b.ready; b.send(hello("관전테스트B", { x: 8, z: 9 }));
    await b.next(4000, (m) => m.t === "welcome");
    const j = await s.next(4000, (m) => m.t === "join");
    ok(j.peer && j.peer.nick === "관전테스트B", "관전자가 B 입장을 받아요");
    ok(w.peers.every((p) => !String(p.id).startsWith("spec-")), "사람 목록에 관전자는 없어요");

    // 움직임 방송
    await delay(200); b.send({ t: "pose", x: 11, z: 13, y: 0.4, d: 1, fish: "off", anim: "walk", seat: null });
    const pz = await s.next(4000, (m) => m.t === "pose");
    ok(pz.x === 11 && pz.z === 13, "관전자가 B 의 움직임을 받아요");

    // 관전자가 보내는 건 모두 무시
    s.send(hello("관전자닉")); s.send({ t: "chat", text: "안녕" }); s.send({ t: "pose", x: 1, z: 1 });
    await delay(600);
    ok(!a.inbox.some((m) => m.t === "join" || m.t === "chat" || (m.t === "pose" && m.x === 1)), "관전자가 보낸 hello·채팅·움직임은 무시돼요");
    ok(await count(2) === n0 + 1, "인원은 A·B 두 명만");
    s.send("ping"); await delay(200);
    ok(s.ws.readyState === 1, "관전자는 ping 을 보내도 연결이 유지돼요");

    // 인사 없이 오래 있어도 끊기지 않아요 (hello timeout 보다 길게)
    await delay(23000);
    ok(s.ws.readyState === 1, "hello 없이 23초(인사 제한 20초 넘게)가 지나도 연결 유지");

    // 퇴장
    b.close();
    const lv = await s.next(5000, (m) => m.t === "leave");
    ok(!!lv.id, "관전자가 B 퇴장을 받아요");

    // 운하(20)·달(7)
    for (const id of [20, 7]) { const x = connect(`/ws/${id}?spec=1`); await x.ready; const ww = await x.next(4000, (m) => m.t === "welcome"); ok(ww.spec === 1 && ww.server === id, `방 ${id} 관전`); x.close(); }
    // 테스트·관리자 방은 관전 불가
    const refused = (path, origin) => new Promise((res) => { const x = new WebSocket(`${BASE}${path}`, { headers: { Origin: origin || "https://fishcozy.com" } }); x.once("unexpected-response", (_q, r) => res(r.statusCode)); x.once("open", () => { x.close(); res(101); }); x.once("error", () => res(-1)); });
    ok(await refused("/ws/8?spec=1") !== 101, "관리자 방(8)은 관전할 수 없어요");
    ok(await refused("/ws/1?spec=1", "https://evil.example") === 403, "모르는 사이트에서는 관전할 수 없어요");
    a.close(); s.close();
    console.log("관전 테스트 통과");
    process.exit(0);
  } catch (e) { console.error("✗", e.message); console.error(log.slice(-3000)); process.exit(1); }
}
main();
