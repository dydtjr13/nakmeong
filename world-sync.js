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
  // v47: 원 궤도(빙글빙글) 대신 물결에 실려 정처 없이 떠다니는 경로.
  // 오리마다 시드로 정한 호수 안의 지점들을 부드러운 곡선(Catmull-Rom)으로 잇고, 느린 물결 흔들림을 더한다.
  // 서버 시각·ambSeed·since 만으로 위치가 정해지므로 같은 호숫가의 모든 유저가 같은 오리를 같은 자리에서 본다.
  // 속도 단위: 초당 호수 좌표 거리. 관리자 값 0 / 0.5 / 1 / 1.5 / 2.5 → 멈춤 / 아주 느리게 / 느리게 / 보통 / 조금 빠르게
  const DUCK_SPD = [[0, 0], [0.5, 0.025], [1, 0.05], [1.5, 0.09], [2.5, 0.15]];
  function duckSpeed(spd) {
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
  function ducks(now, world, opt) {
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
        const b = duckPos(seed, i, Math.max(0, age - 4000), rMax, v);
        const dx = x - b[0], dz = z - b[1];
        if (dx * dx + dz * dz > 1e-8) head = Math.atan2(dx, dz);
      }
      out.push({ i, x, z, yaw: head, head, ph: i + age / 1000, s: DUCK_SIZES[h % DUCK_SIZES.length], v: kinds[h2 % kinds.length], st: "swim", age });
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
  // v49: 실시간 접속 중 서버에 오리 설정이 없을 때 모든 유저가 쓰는 같은 기본값
  const DUCK_DEF = { duckOn: 1, duckEvery: 300, duckMax: 9, duckSize: 0.8, duckSpeed: 1.5, duckKinds: DUCK_KINDS.join(",") };
  window.NK_SYNC = { mix32, weather, ducks, duckSpeed, bot, pickQuietDeck, DUCK_DEF };
})();
