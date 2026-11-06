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
  assert.equal(bad.seasonSpd, 0);
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
