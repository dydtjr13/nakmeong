import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
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
  mergeNoticeLog,
  grantUntilFor,
  clientGrantUntil,
  resolveGrantNick,
  pickQuietDeck,
  joinMapPlan,
  mergeSanc,
  nickProblem,
  nickTaken,
  sanitizeBalance,
  sanitizeEvent,
  sanitizeGift,
  sanitizeNotice,
  sanitizeNick,
  sanitizeProf,
  ackRecover,
  mergeLosses,
  mergeRecover,
  pushCue,
  sanitizeCue,
  sanitizeItem,
  sanitizeLoss,
  sanitizePlay,
  sanitizeRecover,
  sanitizeStage,
  sanitizeWorld,
  seasonSlot,
  sharedBot,
  sharedDucks,
  duckSpeed,
  sharedWeather,
  stageEffect,
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
  assert.equal(originAllowed("http://fishcozy.com", "x"), true);
  assert.equal(originAllowed("http://www.fishcozy.com", "x"), true);
  assert.equal(originAllowed("http://dydtjr13.github.io", "x"), true);
  assert.equal(originAllowed("http://localhost:8787", "x"), true);
  assert.equal(originAllowed("http://127.0.0.1:5500", "x"), true);
  assert.equal(originAllowed("null", "x"), true);
  assert.equal(originAllowed("https://evil.example", "fishcozy-realtime.mi1ku.workers.dev"), false);
  assert.equal(originAllowed("http://evil.example", "x"), false);
  assert.equal(originAllowed("http://fishcozy.com.evil.example", "x"), false);
  assert.equal(originAllowed("", "127.0.0.1"), true);
  assert.equal(originAllowed("", "fishcozy-realtime.mi1ku.workers.dev"), false);
});

test("stage keeps deck layout and only reloads when the map changes", () => {
  const now = 1_700_000_000_000;
  const stage = sanitizeStage({ lay: "b", deckW: "W2", decks: 30, chN: 2, bots: 4 }, null, { bump: true, now });
  assert.equal(stage.lay, "b");
  assert.equal(stage.deckW, "W2");
  assert.equal(stage.decks, 30);
  assert.equal(stage.chN, 2);
  assert.equal(stage.bots, 4);
  assert.equal(stage.rev, 1);
  const legacy = sanitizeStage({ lay: "o", decks: 99, chN: 0, bots: 80 }, stage, { bump: true, now });
  assert.equal(legacy.lay, "o");
  assert.equal(legacy.decks, 20);
  assert.equal(legacy.chN, 1);
  assert.equal(legacy.bots, 49);
  assert.equal(legacy.rev, 2);
  const boot = { lay: "a", deckW: "", decks: 25, bots: 9, chN: 4 };
  assert.equal(stageEffect(boot, stage).reload, true);
  assert.equal(stageEffect(boot, { lay: "a", deckW: "", decks: 25, bots: 3, chN: 4 }).reload, false);
  assert.equal(stageEffect(boot, { lay: "a", deckW: "", decks: 25, bots: 3, chN: 4 }).bots, true);
  assert.equal(stageEffect(boot, { lay: "a", deckW: "", decks: 25, bots: 9, chN: 2 }).channels, true);
  assert.equal(parseClient(JSON.stringify({ t: "stage", stage: { lay: "c", bots: 1 } })).t, "stage");
  assert.equal(parseClient(JSON.stringify({ t: "stage", stage: [] })), null);
});

test("play, cue, recover and loss stay bounded to the target nick", () => {
  const now = 1_700_000_000_000;
  const play = sanitizePlay({ moveOn: true, move: 0.5, duckOn: 0, tutOff: 1, duckKinds: "base,nope,pirate" }, null, { bump: true, now });
  assert.equal(play.moveOn, true);
  assert.equal(play.move, 0.5);
  assert.equal(play.duckOn, 0);
  assert.equal(play.tutOff, 1);
  assert.equal(play.duckKinds, "base,pirate");
  assert.equal(play.duckEvery, undefined);
  const next = sanitizePlay({ duckEvery: 20, move: 9 }, play, { bump: true, now });
  assert.equal(next.duckEvery, 15);
  assert.equal(next.move, 1);
  assert.equal(next.duckOn, 0);
  assert.equal(next.rev, play.rev + 1);
  const cue = sanitizeCue({ id: "c1", kind: "tut", act: "jump", i: 3, nick: "*" }, now);
  assert.equal(cue.act, "jump");
  assert.equal(pushCue([], cue, now).length, 1);
  assert.equal(pushCue([cue], cue, now).length, 1);
  assert.equal(sanitizeCue({ kind: "duck", n: 9 }, now).n, 8);
  assert.equal(sanitizeCue({ kind: "tut", act: "nope" }, now), null);
  const rod = sanitizeItem("rod", { id: 4, k: "silver", tier: 2, q: 0.8, br: 0.4, star: 1, enh: 3, extra: [{ k: "luck", v: 2.25 }, { k: "<>", v: 1 }] });
  assert.equal(rod.extra.length, 1);
  assert.equal(rod.extra[0].v, 2.25);
  const rec = sanitizeRecover({ id: "rc1", nick: "달빛", cat: "fish", obj: { id: 7, k: "carp", cm: 12.2, g: 1, v: 30 }, refund: true, coins: 15 }, now);
  assert.equal(rec.nick, "달빛");
  assert.equal(rec.refund, true);
  assert.equal(sanitizeRecover({ nick: "*", cat: "fish", obj: { k: "carp" } }, now), null);
  const pending = mergeRecover([], rec, now);
  assert.equal(ackRecover(pending, "rc1", "민물").length, 1);
  assert.equal(ackRecover(pending, "rc1", "달빛").length, 0);
  const loss = sanitizeLoss({ id: "L1", who: "해커", type: "sell", cat: "fish", obj: { id: 9, k: "carp", cm: 10, g: 0, v: 1 }, coins: 5, t: now }, now, "민물");
  assert.equal(loss.who, "민물");
  assert.equal(mergeLosses([], [loss, loss], now).length, 1);
  assert.equal(parseClient(JSON.stringify({ t: "play", play: { moveOn: false } })).t, "play");
  assert.equal(parseClient(JSON.stringify({ t: "cue", cue: { kind: "duck", n: 1 } })).t, "cue");
  assert.equal(parseClient(JSON.stringify({ t: "recover", recover: { nick: "달빛" } })).t, "recover");
  assert.equal(parseClient(JSON.stringify({ t: "recoverAck", id: "rc1" })).t, "recoverAck");
  assert.equal(parseClient(JSON.stringify({ t: "loss", loss: { id: "L1" } })).t, "loss");
  assert.equal(parseClient(JSON.stringify({ t: "recoverAck" })), null);
});

test("quiet deck prefers the empty side", () => {
  const spots = [
    { i: 0, x: 10, z: 0 },
    { i: 1, x: -10, z: 0 },
    { i: 2, x: 0, z: 10 },
  ];
  const crowded = pickQuietDeck(spots, [
    { x: 10, z: 0.4 },
    { x: 9.2, z: 0 },
    { deck: 0, x: 80, z: 80 },
  ]);
  assert.notEqual(crowded.i, 0);
  const bySeat = pickQuietDeck(spots, [{ deck: 1, x: 0, z: 0 }, { deck: 2, x: 0, z: 0 }]);
  assert.equal(bySeat.i, 0);
});

test("notice delete drops that item for the lake", () => {
  const now = 1_700_000_000_000;
  const posted = mergeNoticeLog([], { id: "n1", msg: "점검", min: 10, ch: 2, by: "호수" }, now);
  assert.equal(posted.active.msg, "점검");
  assert.equal(posted.active.by, "호수");
  assert.equal(posted.rows.length, 1);
  const gone = mergeNoticeLog(posted.rows, { del: true, id: "n1", ch: 2 }, now);
  assert.equal(gone.rows.length, 0);
  assert.equal(gone.active, null);
  const kept = mergeNoticeLog(posted.rows, { off: true, id: "n1", ch: 2 }, now);
  assert.equal(kept.rows.length, 1);
  assert.equal(kept.rows[0].off, true);
  assert.equal(kept.active, null);
});

test("auto fish grant uses server minutes and nick aliases", () => {
  const now = 1_700_000_000_000;
  const skewed = mergeGrant({}, { nick: "달빛", until: now - 60000, mins: 30 }, now);
  assert.equal(skewed["달빛"], now + 30 * 60000);
  assert.equal(grantUntilFor(skewed, "달빛"), now + 30 * 60000);
  assert.equal(grantUntilFor({ 나: now + 60000, 낚시꾼: now + 120000 }, ""), now + 120000);
  assert.equal(parseClient(JSON.stringify({ t: "grant", nick: "달빛", mins: 15, until: 1 })).mins, 15);
});

test("ducks face along travel and follow admin speed kinds and off", () => {
  const now = 1_700_000_000_000 + 86_400_000;
  const world = { ambSeed: 99 };
  const moving = sharedDucks(now, world, { max: 2, every: 300000 });
  const later = sharedDucks(now + 10000, world, { max: 2, every: 300000 });
  assert.equal(moving[0].head, moving[0].yaw);
  assert.notEqual(later[0].x, moving[0].x);
  // v47: 진행 방향을 바라본다 (4초 전 위치 → 지금 위치)
  const back = sharedDucks(now - 4000, world, { max: 2, every: 300000 });
  const dir = Math.atan2(moving[0].x - back[0].x, moving[0].z - back[0].z);
  assert.ok(Math.abs(Math.atan2(Math.sin(dir - moving[0].head), Math.cos(dir - moving[0].head))) < 0.01);
  const stopped = sharedDucks(now, world, { max: 2, every: 300000, speed: 0 });
  const still = sharedDucks(now + 20000, world, { max: 2, every: 300000, speed: 0 });
  assert.equal(stopped[0].x, still[0].x);
  assert.equal(stopped[0].z, still[0].z);
  const pirates = sharedDucks(now, world, { max: 3, every: 300000, kinds: ["pirate"] });
  assert.ok(pirates.every((d) => d.v === "pirate"));
  assert.deepEqual(sharedDucks(now, world, { on: 0, max: 4 }), []);
});

test("turning ducks on spawns one at a time from that moment", () => {
  const now = 1_700_000_000_000 + 5_000_000;
  const world = { ambSeed: 99 };
  const opt = { max: 9, every: 10000, since: now };
  const born = sharedDucks(now, world, opt);
  assert.equal(born.length, 1);
  assert.ok(born[0].age < 50);
  assert.equal(born[0].head, born[0].yaw);
  assert.equal(sharedDucks(now + 9999, world, opt).length, 1);
  assert.equal(sharedDucks(now + 10000, world, opt).length, 2);
  assert.equal(sharedDucks(now + 80000, world, opt).length, 9);
  const stopped = sharedDucks(now, world, { ...opt, speed: 0 });
  assert.equal(stopped[0].head, stopped[0].yaw);
  const later = sharedDucks(now + 10000, world, opt);
  assert.notEqual(later[0].x, born[0].x);
  assert.equal(later[0].head, later[0].yaw);
  assert.deepEqual(sharedDucks(now, world, { on: 0, since: now, max: 9 }), []);
});

test("duckSince resets only when ducks go from off to on", () => {
  const now = 1_700_000_000_000;
  const off = sanitizePlay({ duckOn: 0 }, null, { bump: true, now });
  assert.equal(off.duckOn, 0);
  assert.equal(off.duckSince, 0);
  const on = sanitizePlay({ duckOn: 1 }, off, { bump: true, now: now + 5000 });
  assert.equal(on.duckOn, 1);
  assert.equal(on.duckSince, now + 5000);
  const tuned = sanitizePlay({ duckEvery: 30, duckSince: 1 }, on, { bump: true, now: now + 9000 });
  assert.equal(tuned.duckSince, now + 5000);
  assert.equal(tuned.duckEvery, 30);
  const again = sanitizePlay({ duckOn: 0 }, tuned, { bump: true, now: now + 12000 });
  assert.equal(again.duckSince, 0);
  const firstOn = sanitizePlay({ duckOn: 1 }, {}, { bump: true, now });
  assert.equal(firstOn.duckSince, undefined);
});

test("autofish grant follows the clicked socket and only that nick", () => {
  const now = 1_700_000_000_000;
  const peers = [{ id: "sock-a", nick: "달빛" }, { id: "sock-b", nick: "민물" }];
  assert.equal(resolveGrantNick({ nick: "옛닉", id: "sock-a" }, peers), "달빛");
  const granted = mergeGrant({}, { nick: "옛닉", id: "sock-a", mins: 20, until: now - 1 }, now, peers);
  assert.equal(granted["달빛"], now + 20 * 60000);
  assert.equal(granted["옛닉"], undefined);
  assert.equal(granted["민물"], undefined);
  assert.equal(clientGrantUntil(granted, ["달빛"], now, 0), now + 20 * 60000);
  assert.equal(clientGrantUntil(granted, ["민물"], now, 0), 0);
  assert.equal(clientGrantUntil(granted, ["옛닉"], now, 0), 0);
  assert.equal(clientGrantUntil({}, ["화면닉"], now, now + 20 * 60000), now + 20 * 60000);
  assert.equal(clientGrantUntil({ 낚시꾼: now + 60000 }, ["나"], now, 0), 0);
  const gone = mergeGrant(granted, { nick: "옛닉", id: "sock-a", revoke: true }, now, peers);
  assert.equal(gone["달빛"], undefined);
  const parsed = parseClient(JSON.stringify({ t: "grant", nick: "달빛", mins: 15, id: "sock a!" }));
  assert.equal(parsed.mins, 15);
  assert.equal(parsed.id, "socka");
});

test("browser duck layout matches the worker", () => {
  const src = readFileSync(new URL("../../../world-sync.js", import.meta.url), "utf8");
  const sandbox = { window: null };
  sandbox.window = sandbox;
  vm.runInNewContext(src, sandbox);
  const now = 1_700_000_000_000 + 80_000;
  const world = { ambSeed: 42 };
  const opt = { max: 4, every: 20000, since: now - 20000, speed: 0.5, kinds: ["pirate"] };
  const plain = (rows) => JSON.parse(JSON.stringify(rows));
  assert.deepEqual(plain(sandbox.NK_SYNC.ducks(now, world, opt)), plain(sharedDucks(now, world, opt)));
  assert.equal(sandbox.NK_SYNC.ducks(now, world, opt).length, 2);
});

test("joining during a map change reloads before enter and does not kick a round", () => {
  const boot = { lay: "a", deckW: "", decks: 25, bots: 9, chN: 4 };
  const next = { lay: "b", deckW: "W1", decks: 30, bots: 9, chN: 4 };
  assert.equal(joinMapPlan(false, boot, next), "reload-before-enter");
  assert.equal(joinMapPlan(true, boot, next), "keep-round");
  assert.equal(joinMapPlan(false, boot, boot), "stay");
});

test("v46: ingest without prev keeps duckSince computed by the origin room", () => {
  const now = 1_700_000_000_000;
  const off = sanitizePlay({ duckOn: 0 }, null, { bump: true, now });
  const stored = sanitizePlay(off, null, { bump: false, now });
  const on = sanitizePlay({ duckOn: 1 }, stored, { bump: true, now: now + 5000 });
  assert.equal(on.duckSince, now + 5000);
  const relayed = sanitizePlay(on, null, { bump: false, now: now + 5001 });
  assert.equal(relayed.duckSince, now + 5000);
  assert.equal(relayed.duckOn, 1);
});

test("v47: ducks drift slowly and stay inside the lake, same on browser and server", async () => {
  const { readFile } = await import("node:fs/promises");
  const vm = await import("node:vm");
  const src = await readFile(new URL("../../../world-sync.js", import.meta.url), "utf8");
  const ctx = { window: {} };
  vm.runInNewContext(src, ctx);
  const SY = ctx.window.NK_SYNC;
  const world = { ambSeed: 4242 };
  const since = 1_700_000_000_000;
  for (const speed of [0, 0.5, 1, 1.5, 2.5]) {
    for (const dt of [0, 1000, 65_000, 3_600_000, 86_400_000]) {
      const opt = { max: 9, every: 30000, speed, rMax: 20, since };
      const a = sharedDucks(since + dt, world, opt);
      const b = JSON.parse(JSON.stringify(SY.ducks(since + dt, world, opt)));
      assert.deepEqual(b, a, `browser/server mismatch speed=${speed} dt=${dt}`);
      for (const d of a) assert.ok(Math.hypot(d.x, d.z) <= 20 * 0.95 + 1e-9, "duck left the lake");
    }
  }
  // 아주 느리게: 10초에 1 이하로만 움직인다
  const o = { max: 1, every: 30000, speed: 0.5, rMax: 20, since };
  const p1 = sharedDucks(since + 600_000, world, o)[0], p2 = sharedDucks(since + 610_000, world, o)[0];
  assert.ok(Math.hypot(p2.x - p1.x, p2.z - p1.z) < 1, "too fast at slowest speed");
  assert.equal(duckSpeed(0), 0);
  assert.ok(duckSpeed(0.5) < duckSpeed(1) && duckSpeed(1) < duckSpeed(1.5) && duckSpeed(1.5) < duckSpeed(2.5));
});

test("v48: duck size keeps rand and fixed sizes as chosen", () => {
  const r = sanitizePlay({ duckSize: "rand" }, null, { bump: true, now: 1 });
  assert.equal(r.duckSize, "rand");
  const f = sanitizePlay({ duckSize: 1 }, r, { bump: true, now: 2 });
  assert.equal(f.duckSize, 1);
  const big = sanitizePlay({ duckSize: 1.3 }, f, { bump: true, now: 3 });
  assert.equal(big.duckSize, 1.3);
  const back = sanitizePlay({ duckSize: "rand" }, big, { bump: true, now: 4 });
  assert.equal(back.duckSize, "rand");
});

test("v52: admin-only ops, auth parsing, nickname hardening, browser id", async () => {
  const { ADMIN_OPS } = await import("../src/protocol.js");
  for (const t of ["world", "notice", "grant", "sanc", "gift", "stage", "play", "recover"]) assert.ok(ADMIN_OPS.has(t), t);
  for (const t of ["hello", "pose", "chat", "emote", "loss", "losses", "recoverAck"]) assert.ok(!ADMIN_OPS.has(t), t);
  const a = parseClient(JSON.stringify({ t: "auth", id: "admin", pw: "x".repeat(300) }));
  assert.equal(a.t, "auth");
  assert.equal(a.pw.length, 128);
  assert.equal(parseClient(JSON.stringify({ t: "auth", out: 1 })).out, true);
  assert.equal(sanitizeNick('a"b<c>d\'e`f&g'), "abcdefg");
  const h = parseClient(JSON.stringify({ t: "hello", nick: "운영자", cid: "abc-123!@#", adm: { id: "admin", pw: "pw" } }));
  assert.equal(h.cid, "abc-123");
  assert.deepEqual(h.adm, { id: "admin", pw: "pw" });
  const p = parseClient(JSON.stringify({ t: "pose", adm: { id: "admin", pw: "pw" } }));
  assert.equal(p.adm, null);
});
