/* 피쉬코지 호숫가 동기화. workers/realtime/src/protocol.js 의 mix32·sharedWeather·sharedDucks·sharedBot 과 같은 식.
   서버 world.ambSeed 가 있으면 날씨·오리·봇 배치가 입장 시각과 상관없이 같다. */
(function () {
  function mix32(a, b) {
    let x = (Math.imul(a >>> 0, 0x9e3779b1) ^ (b >>> 0)) >>> 0;
    x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0;
    x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0;
    return (x ^ (x >>> 16)) >>> 0;
  }
  function worldFraction(now, world) {
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
  function weather(now, world) {
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
  function ducks(now, world, opt) {
    const o = opt || {};
    if (o.on === 0 || o.on === false) return [];
    const every = Math.max(1000, Math.round(o.every || 300000));
    const max = Math.max(0, Math.min(30, Math.round(o.max != null ? o.max : 9)));
    const rMax = o.rMax > 0 ? o.rMax : 8;
    const kinds = Array.isArray(o.kinds) && o.kinds.length ? o.kinds : DUCK_KINDS;
    const spd = o.speed == null ? 0.5 : Math.max(0, Number(o.speed) || 0);
    const rate = 0.12 * (spd / 0.5);
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
      const ang0 = ((h % 10000) / 10000) * Math.PI * 2;
      const rad = (0.28 + ((h2 % 1000) / 1000) * 0.62) * rMax;
      const yaw = ang0 + (age / 1000) * rate;
      out.push({ i, x: Math.cos(yaw) * rad, z: Math.sin(yaw) * rad, yaw, head: rate > 0 ? -yaw : yaw, s: DUCK_SIZES[h % DUCK_SIZES.length], v: kinds[h2 % kinds.length], st: "swim", age });
    }
    return out;
  }
  function pickQuietDeck(spots, people) {
    const list = Array.isArray(spots) ? spots.filter((d) => d && d.i != null) : [];
    if (!list.length) return null;
    const folks = Array.isArray(people) ? people.filter(Boolean) : [];
    const near = (d) => {
      const r = d.r > 0 ? d.r : 7;
      let n = 0;
      for (const p of folks) {
        if (p.deck != null && +p.deck === +d.i) { n += 1; continue; }
        const x = +p.x, z = +p.z;
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
  const BOT_KINDS = [1, 0, 3, 7, 2, 8, 4, 10, 5, 9, 6, 11, 12, 13, 14, 15, 16];
  function bot(i, now, world) {
    const seed = Math.round(Number(world && world.ambSeed) || 1);
    const h = mix32(seed, 2000 + (i | 0));
    const h2 = mix32(seed, 3000 + (i | 0));
    const t = Number(now) || 0;
    const ang = ((h % 10000) / 10000) * Math.PI * 2 + (((t / 1000) % 80) / 80) * 0.4;
    const rad = 16 + (h2 % 900) / 100;
    return { i: i | 0, ki: BOT_KINDS[h % BOT_KINDS.length], x: Math.cos(ang) * rad, z: Math.sin(ang) * rad, yaw: ang + Math.PI };
  }
  window.NK_SYNC = { mix32, weather, ducks, bot, pickQuietDeck };
})();
