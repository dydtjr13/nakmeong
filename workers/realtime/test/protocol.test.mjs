import test from "node:test";
import assert from "node:assert/strict";
import {
  CAP,
  SERVERS,
  allowPose,
  defaultWorld,
  normalizeWorld,
  originAllowed,
  parseClient,
  quantizeKey,
  reduce,
  lakeTargets,
  mergeGrant,
  mergeSanc,
  nickProblem,
  nickTaken,
  sanitizeBalance,
  sanitizeEvent,
  sanitizeGift,
  sanitizeNotice,
  sanitizeNick,
  sanitizeProf,
  sanitizeWorld,
  seasonSlot,
  sharedBot,
  sharedDucks,
  sharedWeather,
  worldFraction,
} from "../src/protocol.js";

test("4 servers, 50 real users each", () => {
  assert.equal(SERVERS.length, 4);
  assert.deepEqual(SERVERS.map((s) => s.id), [1, 2, 3, 4]);
  assert.equal(CAP, 50);
});

test("nick and chat are trimmed and stripped", () => {
  assert.equal(sanitizeNick("  <b>호수</b>  "), "b호수/b");
  assert.equal(sanitizeNick("<>"), "낚시꾼");
  assert.equal(sanitizeNick("가나다라마바사아자차카"), "가나다라마바사아자차");
  const chat = parseClient(JSON.stringify({ t: "chat", text: "  안녕<b>  " }));
  assert.equal(chat.text, "안녕b");
  assert.equal(chat.text.includes("<"), false);
  assert.equal(parseClient("{"), null);
  assert.equal(parseClient(JSON.stringify({ t: "nope" })), null);
  assert.equal(parseClient("x".repeat(901)), null);
});

test("sanitizeNick strips markup", () => {
  assert.equal(sanitizeNick("  <script> "), "script");
  assert.equal(sanitizeNick("물고기왕자"), "물고기왕자");
});

test("parseClient keeps pose fields and drops junk", () => {
  const pose = parseClient(JSON.stringify({
    t: "pose", nick: "민물", x: 1.25, z: -3, y: 0.4, d: 1, fish: "cast", anim: "walk", seat: 4, ki: 2, lv: 9,
  }));
  assert.equal(pose.t, "pose");
  assert.equal(pose.seat, 4);
  assert.equal(parseClient(JSON.stringify({ t: "emote", text: "" })), null);
  assert.equal(parseClient(JSON.stringify({ t: "emote", text: "🐟" })).text, "🐟");
});

test("seat key collides only when sitting on the same spot", () => {
  assert.equal(quantizeKey(1.22, -3.1), quantizeKey(1.05, -3.2));
  assert.notEqual(quantizeKey(0, 0), quantizeKey(1.6, 0));
});

test("second sitter is denied and chat is rate limited", () => {
  const hello = parseClient(JSON.stringify({
    t: "hello", nick: "하나", x: 3, z: 4, y: 0.66, d: 0, fish: "off", anim: "sit", seat: 2, ki: 1, lv: 4,
  }));
  const a = reduce({ id: "a", ready: false }, hello, 1000, []);
  assert.equal(a.first, true);
  assert.equal(a.att.seatKey, quantizeKey(3, 4));
  assert.equal(a.pub.nick, "하나");

  const moved = parseClient(JSON.stringify({
    t: "pose", x: 3.4, z: 4.2, y: 0.66, fish: "off", anim: "sit", seat: 2,
  }));
  const a2 = reduce(a.att, moved, 1200, []);
  assert.equal(a2.att.seatKey, a.att.seatKey, "small sit fidget keeps the claimed spot");

  const b = reduce({ id: "b", ready: false }, hello, 1000, [{ id: "a", seatKey: a2.att.seatKey }]);
  assert.equal(b.denied, true);
  assert.equal(b.att.seat, null);
  assert.equal(b.att.seatKey, null);
  assert.equal(b.pub.anim, "idle");

  const chat = parseClient(JSON.stringify({ t: "chat", text: "안녕" }));
  const c1 = reduce(a.att, chat, 2000, []);
  assert.equal(c1.event.text, "안녕");
  const c2 = reduce(c1.att, chat, 2100, []);
  assert.equal(c2.drop, true);
  const c3 = reduce(c1.att, chat, 2000 + 700, []);
  assert.equal(c3.drop, false);
});

test("pose throttle keeps important state changes", () => {
  const base = { fish: "off", anim: "idle", seat: null, lastPose: 1000 };
  const still = { fish: "off", anim: "idle", seat: null };
  assert.equal(allowPose(1050, base, still), false);
  assert.equal(allowPose(1090, base, still), true);
  assert.equal(allowPose(1039, base, { fish: "cast", anim: "holding-right", seat: null }), false);
  assert.equal(allowPose(1040, base, { fish: "cast", anim: "holding-right", seat: null }), true);
});

test("world clock matches for every joiner and admin pin is shared", () => {
  const now = 1_700_000_000_000;
  const plain = normalizeWorld(null, now);
  assert.equal(plain.dayLen, 150);
  assert.equal(plain.auto, true);
  const joinedEarly = worldFraction(now, plain);
  const joinedLate = worldFraction(now, plain);
  assert.equal(joinedEarly, joinedLate);
  const halfDay = worldFraction(now + 75_000, plain);
  assert.ok(Math.abs(halfDay - ((joinedEarly + 0.5) % 1)) < 1e-9);

  const pinned = sanitizeWorld({
    dayLen: 600, auto: true, t0: now, off: 0.4, freezeT: 0.4,
    wxOv: "snow", wxUntil: 0, seasonOv: "summer", seasonLen: 120,
    seasonOff: 1, seasonT0: now, seasonLink: 1, mapTheme: "xmas",
  }, plain, { bump: true, now });
  assert.equal(pinned.rev, plain.rev + 1);
  assert.equal(pinned.wxOv, "snow");
  assert.equal(pinned.mapTheme, "xmas");
  assert.equal(pinned.seasonOv, "summer");
  assert.equal(pinned.seasonLen, 120);
  assert.equal(pinned.seasonLink, 1);
  assert.ok(Math.abs(worldFraction(now, pinned) - 0.4) < 1e-9);
  assert.ok(Math.abs(worldFraction(now + 300_000, pinned) - 0.9) < 1e-9);
  assert.ok(Math.abs(worldFraction(now + 600_000, pinned) - 0.4) < 1e-9);
  const frozen = sanitizeWorld({ auto: false, freezeT: 0.75 }, pinned, { bump: true, now });
  assert.equal(worldFraction(now + 999_999, frozen), 0.75);
  assert.equal(seasonSlot(now, pinned), 1);
  assert.equal(seasonSlot(now + 120_000, pinned), 2);

  const bad = sanitizeWorld({
    dayLen: 1, wxOv: "hack", mapTheme: "nope", seasonOv: "fall", seasonSpd: 3, off: 99,
  }, pinned, { bump: true, now });
  assert.equal(bad.dayLen, 30);
  assert.equal(bad.wxOv, "snow");
  assert.equal(bad.mapTheme, "xmas");
  assert.equal(bad.seasonOv, "summer");
  assert.equal(bad.seasonSpd, 8);
  assert.equal(bad.off, 10);

  const expired = normalizeWorld({ ...pinned, wxOv: "storm", wxUntil: now - 1000, rev: 4 }, now);
  assert.equal(expired.wxOv, "auto");
  assert.equal(expired.wxUntil, 0);
  assert.equal(defaultWorld().dayLen, 150);
});

test("world set message is parsed and junk world is dropped", () => {
  const ok = parseClient(JSON.stringify({ t: "world", world: { dayLen: 300, wxOv: "aurora" } }));
  assert.equal(ok.t, "world");
  assert.equal(ok.world.dayLen, 300);
  assert.equal(parseClient(JSON.stringify({ t: "world" })), null);
  assert.equal(parseClient(JSON.stringify({ t: "world", world: ["nope"] })), null);
});

test("notice, event, balance, grant and gift are bounded", () => {
  const now = 1_700_000_000_000;
  const note = sanitizeNotice({ msg: "  점검 <b>안내</b>  ", min: 10, ch: "2" }, now);
  assert.equal(note.msg, "점검 b안내/b");
  assert.equal(note.ch, 2);
  assert.equal(note.until, now + 10 * 60000);
  assert.deepEqual(lakeTargets(note.ch), [2]);
  assert.deepEqual(lakeTargets("all"), [1, 2, 3, 4]);
  assert.equal(sanitizeNotice({ off: true, ch: "all", id: "abc" }, now).off, true);
  const ev = sanitizeEvent({ coin: 2, box: 1.5, from: now, to: now + 3600000 }, now);
  assert.deepEqual(ev, { coin: 2, box: 1.5, from: now, to: now + 3600000 });
  assert.equal(sanitizeEvent({ coin: 1, box: 1 }, now), null);
  const bal = sanitizeBalance({ boxBase: 0.2, txp: 0.01, tiers: [1, 2], caps: { luck: 30 }, fish: { carp: { w: 4, base: 12 } }, extra: "no" });
  assert.equal(bal.fish.carp.w, 4);
  assert.equal(bal.extra, undefined);
  assert.equal(sanitizeBalance(null), null);
  const grants = mergeGrant({}, { nick: "달빛", until: now + 60000 }, now);
  assert.equal(grants["달빛"], now + 60000);
  assert.deepEqual(mergeGrant(grants, { nick: "달빛", revoke: true }, now), {});
  const sanc = mergeSanc({}, { nick: "민물", mute: now + 5000, ban: 0, why: "도배" }, now);
  assert.equal(sanc["민물"].why, "도배");
  assert.equal(mergeSanc(sanc, { nick: "민물", mute: 0, ban: 0 }, now)["민물"], undefined);
  const gift = sanitizeGift({ id: "g1", nick: "*", c: 10, s: 0, b: 1, bt: 2, x: 0, msg: "점검", servers: [1, 9, 2] }, now);
  assert.equal(gift.nick, "*");
  assert.deepEqual(gift.servers, [1, 2]);
  assert.equal(sanitizeGift({ nick: "달빛", c: 0 }, now), null);
  assert.equal(sanitizeProf({ enabled: false, words: ["금칙"], allow: [] }).enabled, false);
  const ops = parseClient(JSON.stringify({ t: "notice", notice: { msg: "안녕", min: 5, ch: "all" } }));
  assert.equal(ops.t, "notice");
  assert.equal(parseClient(JSON.stringify({ t: "event", event: null })).event, null);
  assert.equal(parseClient("x".repeat(50000)), null);
});

test("bots 0 is kept and ambSeed stays stable", () => {
  const now = 1_700_000_000_000;
  const made = sanitizeWorld({ bots: 0, ambSeed: 42 }, null, { now });
  assert.equal(made.bots, 0);
  assert.equal(made.ambSeed, 42);
  assert.equal(made.seasonSpd, 8);
  const again = sanitizeWorld({}, made, { bump: true, now });
  assert.equal(again.bots, 0);
  assert.equal(again.ambSeed, 42);
  const zero = sanitizeWorld({ bots: 0 }, { bots: 9, ambSeed: 7 }, { now });
  assert.equal(zero.bots, 0);
  assert.equal(zero.ambSeed, 7);
});

test("same lake seed yields the same weather ducks and bots", () => {
  const now = 1_700_000_000_000 + 86_400_000;
  const world = { ambSeed: 99, dayLen: 150, auto: true, off: 0, t0: 0, wxOv: "auto", wxUntil: 0 };
  const a = sharedWeather(now, world);
  const b = sharedWeather(now, world);
  assert.equal(a.k, b.k);
  assert.equal(a.until, b.until);
  const forced = sharedWeather(now, { ...world, wxOv: "snow", wxUntil: now + 60000 });
  assert.equal(forced.k, "snow");
  const ducks = sharedDucks(now, world, { max: 9, every: 300000 });
  const ducks2 = sharedDucks(now, world, { max: 9, every: 300000 });
  assert.deepEqual(ducks, ducks2);
  assert.ok(ducks.length <= 9);
  assert.ok(ducks.length > 0);
  const late = sharedDucks(now + 120000, world, { max: 9, every: 300000 });
  assert.equal(late.length, ducks.length);
  assert.equal(late[0].v, ducks[0].v);
  assert.equal(late[0].s, ducks[0].s);
  const bot = sharedBot(3, now, world);
  assert.deepEqual(bot, sharedBot(3, now, world));
  assert.notDeepEqual(sharedBot(4, now, world).x, bot.x);
});

test("reserved and duplicate nicks are rejected", () => {
  assert.equal(nickProblem("호수관리자"), "reserved");
  assert.equal(nickProblem("GM낚시"), "reserved");
  assert.equal(nickProblem("gm"), "reserved");
  assert.equal(nickProblem("운영자님"), "reserved");
  assert.equal(nickProblem("달빛"), "");
  assert.equal(nickTaken("달빛", "me", [{ id: "other", nick: "달빛" }]), true);
  assert.equal(nickTaken("달빛", "me", [{ id: "me", nick: "달빛" }]), false);
  assert.equal(nickTaken("노을", "me", [{ id: "other", nick: "달빛" }]), false);
});

test("origin allow list matches the pages hosts", () => {
  assert.equal(originAllowed("https://fishcozy.com", "fishcozy-realtime.mi1ku.workers.dev"), true);
  assert.equal(originAllowed("https://www.fishcozy.com", "x"), true);
  assert.equal(originAllowed("https://dydtjr13.github.io", "x"), true);
  assert.equal(originAllowed("http://localhost:8787", "x"), true);
  assert.equal(originAllowed("http://127.0.0.1:5500", "x"), true);
  assert.equal(originAllowed("null", "x"), true);
  assert.equal(originAllowed("https://evil.example", "fishcozy-realtime.mi1ku.workers.dev"), false);
  assert.equal(originAllowed("", "127.0.0.1"), true);
  assert.equal(originAllowed("", "fishcozy-realtime.mi1ku.workers.dev"), false);
});
