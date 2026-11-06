/* 피쉬코지 실시간 멀티플레이 클라이언트.
   기본 주소: https://fishcozy-realtime.mi1ku.workers.dev
   로컬 워커: ?rt=http://127.0.0.1:8787  또는 localStorage.nk_rt_base
   끄기: ?rt=off 또는 localStorage.nk_rt_base = "off"
   연결이 실패하면 게임은 그대로 솔로(봇만)로 플레이됩니다. */
(function () {
  const DEFAULT_BASE = "https://fishcozy-realtime.mi1ku.workers.dev";
  const CAP = 50;
  const qs = new URLSearchParams(location.search);

  function resolveBase() {
    const q = qs.get("rt");
    if (q === "off" || q === "0") return null;
    if (q && /^https?:\/\//i.test(q)) return q.replace(/\/+$/, "");
    try {
      const saved = localStorage.getItem("nk_rt_base");
      if (saved === "off") return null;
      if (saved && /^https?:\/\//i.test(saved)) return saved.replace(/\/+$/, "");
    } catch (e) { /* private mode */ }
    return DEFAULT_BASE;
  }

  const base = resolveBase();
  const peers = new Map();
  const RT = {
    base,
    cap: CAP,
    nServers: 4,
    mode: base ? "idle" : "off",
    phase: base ? "load" : "down",
    servers: null,
    id: "",
    sid: 0,
    n: 0,
    world: null,
    rev: 0,
    list() { return this.servers; },
    failed() { return !this.base || this.phase === "down"; },
    server(id) {
      return (this.servers || []).find((s) => s.id === id) || null;
    },
    status() { return this.mode; },
    serverId() { return this.sid; },
    count() { return this.mode === "on" ? this.n : 0; },
    peers() { return [...peers.values()]; },
  };

  let ws = null;
  let gen = 0;
  let want = false;
  let retry = 0;
  let poseAt = 0;
  let poseSnap = null;
  let poseTimer = 0;
  let pendingPose = null;

  function r2(n) {
    const x = Number(n);
    return Number.isFinite(x) ? Math.round(x * 100) / 100 : 0;
  }

  function wsUrl(id) {
    const u = new URL(base);
    u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
    u.pathname = "/ws/" + id;
    u.search = "";
    u.hash = "";
    return u.toString();
  }

  function emitServers() {
    try { dispatchEvent(new Event("nk-rt-servers")); } catch (e) { /* ignore */ }
  }

  async function refresh(timeoutMs) {
    if (!base) { RT.phase = "down"; emitServers(); return false; }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs || 2500);
    try {
      const res = await fetch(base + "/servers", { cache: "no-store", signal: ctrl.signal });
      if (!res.ok) throw new Error("http " + res.status);
      const body = await res.json();
      if (!body || !body.ok || !Array.isArray(body.servers)) throw new Error("shape");
      RT.servers = body.servers;
      RT.phase = "ok";
      emitServers();
      return true;
    } catch (e) {
      if (!RT.servers) RT.phase = "down";
      emitServers();
      return false;
    } finally {
      clearTimeout(t);
    }
  }
  RT.refresh = refresh;

  function closeSocket() {
    const cur = ws;
    ws = null;
    if (!cur) return;
    cur.onopen = cur.onmessage = cur.onerror = cur.onclose = null;
    try { cur.close(); } catch (e) { /* ignore */ }
  }

  function send(obj) {
    if (!ws || ws.readyState !== 1) return;
    try { ws.send(JSON.stringify(obj)); } catch (e) { /* ignore */ }
  }

  function takeWorld(w) {
    if (!w || typeof w !== "object") return;
    if (w.rev && RT.rev && w.rev < RT.rev) return;
    RT.world = w;
    if (w.rev) RT.rev = w.rev;
    try { dispatchEvent(new CustomEvent("nk-rt-world", { detail: w })); } catch (e) { /* ignore */ }
  }

  function applyWelcome(m) {
    RT.id = m.id || "";
    RT.n = m.n | 0;
    if (m.server) RT.sid = m.server;
    peers.clear();
    (m.peers || []).forEach((p) => { if (p && p.id && p.id !== RT.id) peers.set(p.id, p); });
    if (m.world) takeWorld(m.world);
  }

  function onMessage(m) {
    if (!m || typeof m !== "object") return;
    if (typeof m.n === "number" && (m.t === "welcome" || m.t === "join" || m.t === "leave")) RT.n = m.n;
    if (m.t === "join" && m.peer && m.peer.id !== RT.id) peers.set(m.peer.id, m.peer);
    else if (m.t === "leave" && m.id) peers.delete(m.id);
    else if (m.t === "pose" && m.id && m.id !== RT.id) {
      const prev = peers.get(m.id) || { id: m.id };
      peers.set(m.id, Object.assign(prev, {
        id: m.id, nick: m.nick || prev.nick, ki: m.ki, lv: m.lv,
        x: m.x, z: m.z, y: m.y, d: m.d, fish: m.fish, anim: m.anim, seat: m.seat,
      }));
    }
    else if (m.t === "world" && m.world) takeWorld(m.world);
    else if (m.t === "chat" && m.id !== RT.id) dispatchEvent(new CustomEvent("nk-rt-chat", { detail: m }));
    else if (m.t === "emote" && m.id !== RT.id) dispatchEvent(new CustomEvent("nk-rt-emote", { detail: m }));
    else if (m.t === "seat") dispatchEvent(new CustomEvent("nk-rt-seat", { detail: m }));
  }

  function profileOf(p) {
    p = p || {};
    return {
      t: "hello",
      nick: String(p.nick || "낚시꾼").slice(0, 10),
      ki: p.ki | 0,
      lv: p.lv | 0,
      x: r2(p.x),
      z: r2(p.z),
      y: r2(p.y == null ? 0.4 : p.y),
      d: r2(p.d),
      fish: p.fish || "off",
      anim: p.anim || "idle",
      seat: p.seat == null ? null : p.seat | 0,
    };
  }

  function openSocket(token, serverId, profile, isRetry) {
    return new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(result);
      };
      let sock;
      try { sock = new WebSocket(wsUrl(serverId)); }
      catch (e) {
        RT.mode = "solo";
        want = false;
        finish({ ok: false, reason: "offline" });
        return;
      }
      ws = sock;
      const timer = setTimeout(() => {
        if (token !== gen) { finish({ ok: false, reason: "cancel" }); return; }
        closeSocket();
        RT.mode = "solo";
        want = false;
        finish({ ok: false, reason: "offline" });
      }, 4000);
      sock.onopen = () => { if (token === gen) send(profileOf(profile)); };
      sock.onmessage = (ev) => {
        if (token !== gen) return;
        let m = null;
        try { m = JSON.parse(ev.data); } catch (e) { return; }
        if (!settled) {
          if (m.t === "welcome") {
            applyWelcome(m);
            RT.mode = "on";
            retry = 0;
            finish({ ok: true });
            return;
          }
          if (m.t === "full") {
            closeSocket();
            RT.mode = "solo";
            want = false;
            finish({ ok: false, reason: "full" });
            return;
          }
        }
        onMessage(m);
      };
      sock.onerror = () => {};
      sock.onclose = () => {
        if (ws !== sock) return;
        ws = null;
        if (!settled) {
          refresh(1200).finally(() => {
            if (token !== gen) { finish({ ok: false, reason: "cancel" }); return; }
            const row = RT.server(serverId);
            const reason = row && row.n >= (row.cap || CAP) ? "full" : "offline";
            RT.mode = "solo";
            want = false;
            peers.clear();
            finish({ ok: false, reason });
          });
          return;
        }
        if (!want || token !== gen) return;
        retry += 1;
        if (retry > 3) {
          RT.mode = "solo";
          peers.clear();
          return;
        }
        RT.mode = "connecting";
        setTimeout(() => { if (want && token === gen) openSocket(token, serverId, profile, true); }, 700 * retry);
      };
      if (isRetry) { /* reconnect uses the same listeners */ }
    });
  }

  RT.connect = async function (serverId, profile) {
    gen += 1;
    const token = gen;
    want = true;
    retry = 0;
    RT.sid = serverId | 0;
    RT.profile = profile;
    closeSocket();
    peers.clear();
    poseSnap = null;
    if (!base) {
      RT.mode = "off";
      want = false;
      return { ok: false, reason: "off" };
    }
    RT.mode = "connecting";
    const up = await refresh(1800);
    if (token !== gen) return { ok: false, reason: "cancel" };
    if (!up && !RT.servers) {
      RT.mode = "solo";
      want = false;
      return { ok: false, reason: "offline" };
    }
    const row = RT.server(serverId);
    if (row && row.n >= (row.cap || CAP)) {
      RT.mode = "solo";
      want = false;
      return { ok: false, reason: "full" };
    }
    return openSocket(token, serverId, profile, false);
  };

  RT.pose = function (p) {
    if (RT.mode !== "on" || !p) return;
    const now = Date.now();
    const next = {
      t: "pose",
      x: r2(p.x), z: r2(p.z), y: r2(p.y), d: r2(p.d),
      fish: p.fish || "off",
      anim: p.anim || "idle",
      seat: p.seat == null ? null : p.seat | 0,
      ki: p.ki | 0,
      lv: p.lv | 0,
      nick: String(p.nick || "").slice(0, 10),
    };
    const important = !poseSnap || next.fish !== poseSnap.fish || next.anim !== poseSnap.anim || next.seat !== poseSnap.seat;
    const moved = !poseSnap || Math.hypot(next.x - poseSnap.x, next.z - poseSnap.z) > 0.15 || Math.abs(next.d - poseSnap.d) > 0.35;
    if (!important && !moved && now - poseAt < 5000) return;
    if (important && now - poseAt < 60) { schedule(p, 70); return; }
    if (!important && now - poseAt < 200) { if (moved) schedule(p, 210); return; }
    poseSnap = next;
    poseAt = now;
    send(next);
  };

  function schedule(p, ms) {
    pendingPose = p;
    if (poseTimer) return;
    poseTimer = setTimeout(() => {
      poseTimer = 0;
      const queued = pendingPose;
      pendingPose = null;
      if (queued) RT.pose(queued);
    }, ms);
  }

  RT.chat = function (text) { if (RT.mode === "on") send({ t: "chat", text: String(text || "").slice(0, 80) }); };
  RT.emote = function (text) { if (RT.mode === "on") send({ t: "emote", text: String(text || "").slice(0, 8) }); };
  RT.setWorld = function (world) {
    if (RT.mode !== "on" || !world || typeof world !== "object") return;
    send({ t: "world", world });
  };

  window.NK_RT = RT;
  if (base) {
    refresh(2500);
    setInterval(() => {
      const start = document.getElementById("start");
      if (start && start.classList.contains("show")) refresh(2500);
    }, 8000);
  }
})();
