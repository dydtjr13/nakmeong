/* 피쉬코지 실시간 멀티플레이 클라이언트.
   기본 주소: https://fishcozy-realtime.mi1ku.workers.dev
   로컬 워커: ?rt=http://127.0.0.1:8787  또는 localStorage.nk_rt_base
   끄기: ?rt=off 또는 localStorage.nk_rt_base = "off"
   연결이 실패하면 게임은 그대로 솔로(봇만)로 플레이됩니다. */
(function () {
  const DEFAULT_BASE = "https://fishcozy-realtime.mi1ku.workers.dev";
  const CAP = 100;
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
  // v52: 이 브라우저 고유 id — 나갔다 다시 들어올 때 남아 있던 이전 연결을 서버가 정리하는 데 쓴다 (다른 유저에게는 안 보임)
  const CID = (function () {
    try {
      let c = localStorage.getItem("nk_cid");
      if (!c || !/^[\w-]{8,40}$/.test(c)) {
        c = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12)).replace(/[^\w-]/g, "");
        localStorage.setItem("nk_cid", c);
      }
      return c;
    } catch (e) { return ""; }
  })();
  // v52: 관리자 자격은 메모리에만 (재접속 시 다시 확인용). 저장소에 남기지 않는다.
  let admCred = null;
  // v63: 관리자 로그인 유지 (서버가 준 30일 토큰, 비밀번호는 저장하지 않아요)
  const KEEP = "nk_adm_keep";
  const keepGet = () => { try { const t = localStorage.getItem(KEEP) || ""; const exp = +(t.split(".")[0] || 0); if (t && exp > Date.now()) return t; if (t) localStorage.removeItem(KEEP); } catch (e) { /* ignore */ } return ""; };
  const keepSet = (t) => { try { if (t) localStorage.setItem(KEEP, t); else localStorage.removeItem(KEEP); } catch (e) { /* ignore */ } };
  let authWait = null;
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
    stage: null,
    stageRev: 0,
    play: null,
    playRev: 0,
    cues: [],
    recovers: [],
    losses: [],
    list() { return this.servers; },
    failed() { return !this.base || this.phase === "down"; },
    server(id) {
      return (this.servers || []).find((s) => s.id === id) || null;
    },
    status() { return this.mode; },
    serverId() { return this.sid; },
    count() { return this.mode === "on" ? this.n : 0; },
    // v141: 호숫가 1~4 · 달(7) 실접속 인원 (서버가 서로 알려 줘요)
    by: {},
    total() { if (this.mode !== "on") return 0; let t = 0; for (const k in this.by) t += this.by[k] | 0; return Math.max(t, this.n | 0); },
    moonN() { return this.mode === "on" ? (this.by[7] | 0) : 0; },
    // v147: 서버 인원 = 그 서버 호숫가 + 그 서버에서 달로 간 사람
    mh: {},
    srvN(id) { if (this.mode !== "on") return null; const lake = this.sid === id ? (this.n | 0) : (id in this.by ? this.by[id] | 0 : null); if (lake == null) return null; return lake + (this.mh[id] | 0); },
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
      // v132: 첫 요청은 시작 스크립트(boot)가 미리 보낸 결과를 그대로 써요
      let body = null;
      const pre = window.NK_PRE_SRV;
      if (pre && !refresh.usedPre && pre.base === base && Date.now() - pre.at < 15000) {
        refresh.usedPre = true;
        try { body = await Promise.race([pre.p, new Promise((_, rej) => setTimeout(() => rej(new Error("pre timeout")), timeoutMs || 2500))]); } catch (e) { body = null; }
      }
      if (!body) {
        const res = await fetch(base + "/servers", { cache: "no-store", signal: ctrl.signal });
        if (!res.ok) throw new Error("http " + res.status);
        body = await res.json();
      }
      if (!body || !body.ok || !Array.isArray(body.servers)) throw new Error("shape");
      RT.servers = body.servers;
      RT.phase = "ok";
      if (body.play && typeof body.play === "object" && RT.mode !== "on") {
        try { localStorage.setItem("nk_play_cache", JSON.stringify(body.play)); } catch (e) { /* ignore */ }
        RT.prePlay = body.play;
        try { dispatchEvent(new CustomEvent("nk-rt-preplay", { detail: body.play })); } catch (e) { /* ignore */ }
      }
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
  RT.base = base;

  function closeSocket() {
    const cur = ws;
    ws = null;
    if (!cur) return;
    cur.onopen = cur.onmessage = cur.onerror = cur.onclose = null;
    try { cur.close(); } catch (e) { /* ignore */ }
  }

  // v104: 살아 있다는 신호 (서버가 자동으로 pong · 끊긴 줄 모르는 유령 접속을 서버가 정리해요)
  setInterval(() => { try { if (ws && ws.readyState === 1 && RT.mode === "on") ws.send("ping"); } catch (e) { /* ignore */ } }, 20000);
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
    RT.by = m.by && typeof m.by === "object" ? Object.assign({}, m.by) : {};
    RT.mh = m.mh && typeof m.mh === "object" ? Object.assign({}, m.mh) : {};
    peers.clear();
    (m.peers || []).forEach((p) => { if (p && p.id && p.id !== RT.id) peers.set(p.id, p); });
    if (m.nick) RT.serverNick = String(m.nick);
    RT.admin = !!m.admin;
    RT.adminToken = m.admin ? String(m.token || "") : "";
    if (!m.admin) admCred = null;
    if (m.keep) keepSet(m.keep);
    if (!m.admin && keepGet()) setTimeout(() => { if (RT.mode === "on" && !RT.admin) send({ t: "auth", tok: keepGet() }); }, 300);
    if (typeof m.now === "number") { RT.clockSkew = Date.now() - m.now; RT.serverNow = m.now; }
    if (m.world) takeWorld(m.world);
    if (Array.isArray(m.notices)) takeNotices(m.notices, "notice" in m ? m.notice : undefined);
    else if ("notice" in m) takeNotice(m.notice);
    if ("event" in m) takeEvent(m.event);
    if ("balance" in m) takeBalance(m.balance);
    if (m.grants) takeGrants(m.grants, m.now, { me: m.nick || m.me, mine: m.mine });
    if (m.sanc) takeSanc(m.sanc);
    if (m.prof) takeProf(m.prof);
    takeTitles(m.titles);
    if (m.vmod) takeVmod(m.vmod);
    if (m.vbx) takeVbx(m.vbx, true);
    if (m.stage) takeStage(m.stage);
    takePlay(m.play && typeof m.play === "object" ? m.play : {});
    if (m.cues) takeCues(m.cues);
    if (m.recovers) takeRecovers(m.recovers);
    if (m.losses) takeLosses(m.losses);
    if (m.staff) takeStaff(m.staff);
    // v79: 운영자로 등록된 브라우저면 접속할 때 운영자 토큰을 보내요
    RT.op = null;
    { const o = opGet(); if (o) setTimeout(() => { if (RT.mode === "on") send({ t: "opAuth", op: o.op, tok: o.tok }); }, 400); }
    try { dispatchEvent(new CustomEvent("nk-rt-welcome", { detail: m })); } catch (e) { /* ignore */ }
  }

  // ───────── v79: 운영자 · 신고 · 도배 ─────────
  function opGet() { try { const o = JSON.parse(localStorage.getItem("nk_op") || "null"); return o && o.op && o.tok ? o : null; } catch (e) { return null; } }
  function opSet(o) { try { if (o) localStorage.setItem("nk_op", JSON.stringify(o)); else localStorage.removeItem("nk_op"); } catch (e) { /* ignore */ } }
  RT.staff = {};
  RT.reports = [];
  function takeStaff(st) {
    RT.staff = st && typeof st === "object" ? st : {};
    try { dispatchEvent(new CustomEvent("nk-rt-staff", { detail: RT.staff })); } catch (e) { /* ignore */ }
  }
  function takeReports(m) {
    if (Array.isArray(m.all)) RT.reports = m.all.slice();
    else (m.rows || []).forEach((r) => {
      const i = RT.reports.findIndex((x) => x.id === r.id || (x.kind === r.kind && x.nick === r.nick && x.from === r.from && !x.done && r.t - x.t < 600000));
      if (i >= 0) { RT.reports[i] = Object.assign({}, RT.reports[i], r, { n: (RT.reports[i].n | 0) + (r.n | 0 || 1), id: RT.reports[i].id }); const x = RT.reports.splice(i, 1)[0]; RT.reports.unshift(x); }
      else RT.reports.unshift(r);
    });
    RT.reports = RT.reports.slice(0, 200);
    try { dispatchEvent(new CustomEvent("nk-rt-reports", { detail: m })); } catch (e) { /* ignore */ }
  }
  function onStaffMsg(m) {
    if (m.t === "staff") { takeStaff(m.staff); return true; }
    if (m.t === "staffTok") { opSet({ op: m.op, tok: m.tok }); send({ t: "opAuth", op: m.op, tok: m.tok }); return true; }
    if (m.t === "opAuth") {
      RT.op = m.ok ? { op: m.op, r: m.r || "운영자", p: Array.isArray(m.p) ? m.p : [], n: m.n || "" } : null;
      if (!m.ok && (m.revoked || m.gone)) opSet(null);
      try { dispatchEvent(new CustomEvent("nk-rt-op", { detail: RT.op })); } catch (e) { /* ignore */ }
      return true;
    }
    if (m.t === "reports") { takeReports(m); return true; }
    if (m.t === "repDone") {
      if (m.del) RT.reports = RT.reports.filter((x) => x.id !== m.id); else RT.reports.forEach((x) => { if (x.id === m.id) x.done = 1; });
      try { dispatchEvent(new CustomEvent("nk-rt-reports", { detail: m })); } catch (e) { /* ignore */ }
      return true;
    }
    if (m.t === "s5") {
      try { dispatchEvent(new CustomEvent("nk-rt-s5", { detail: m })); } catch (e) { /* ignore */ }
      return true;
    }
    if (m.t === "spam" || m.t === "reportRes" || m.t === "staffAddRes") {
      try { dispatchEvent(new CustomEvent("nk-rt-" + m.t.toLowerCase(), { detail: m })); } catch (e) { /* ignore */ }
      return true;
    }
    return false;
  }
  RT.isOp = function () { return !!RT.op; };
  RT.opCan = function (k) { return !!(RT.admin || (RT.op && RT.op.p.includes(k))); };
  RT.report = function (row) { if (RT.mode !== "on") return false; send(Object.assign({ t: "report" }, row || {})); return true; };
  RT.staffAdd = function (id, r, p) { return RT.mode === "on" ? (send({ t: "staffAdd", id, r, p }), true) : false; };
  RT.setStaff = function (staff) { return RT.mode === "on" ? (send({ t: "staff", staff: staff || {} }), true) : false; };
  RT.repDone = function (id, del) { return RT.mode === "on" ? (send({ t: "repDone", id, del: !!del }), true) : false; };
  RT.opLeave = function () { opSet(null); RT.op = null; if (RT.mode === "on") send({ t: "opAuth", out: true }); try { dispatchEvent(new CustomEvent("nk-rt-op", { detail: null })); } catch (e) { /* ignore */ } };

  function takeNotice(n) {
    RT.notice = n || null;
    try { dispatchEvent(new CustomEvent("nk-rt-notice", { detail: n || null })); } catch (e) { /* ignore */ }
  }
  function takeNotices(list, active) {
    RT.notices = Array.isArray(list) ? list : [];
    if (active !== undefined) RT.notice = active || null;
    try { dispatchEvent(new CustomEvent("nk-rt-notices", { detail: { notices: RT.notices, notice: RT.notice || null } })); } catch (e) { /* ignore */ }
  }
  function takeEvent(e) {
    RT.event = e || null;
    try { dispatchEvent(new CustomEvent("nk-rt-event", { detail: e || null })); } catch (e2) { /* ignore */ }
  }
  function takeBalance(b) {
    RT.balance = b || null;
    try { dispatchEvent(new CustomEvent("nk-rt-balance", { detail: b || null })); } catch (e) { /* ignore */ }
  }
  function takeGrants(g, now, extra) {
    extra = extra || {};
    RT.grants = g && typeof g === "object" ? g : {};
    if (typeof now === "number") { RT.clockSkew = Date.now() - now; RT.serverNow = now; }
    if (extra.me) RT.serverNick = String(extra.me);
    RT.grantMine = Math.round(Number(extra.mine) || 0);
    try { dispatchEvent(new CustomEvent("nk-rt-grants", { detail: RT.grants })); } catch (e) { /* ignore */ }
  }
  function takeSanc(s) {
    RT.sanc = s || {};
    try { dispatchEvent(new CustomEvent("nk-rt-sanc", { detail: s || {} })); } catch (e) { /* ignore */ }
  }
  function takeProf(p) {
    if (!p) return;
    RT.prof = p;
    try { dispatchEvent(new CustomEvent("nk-rt-prof", { detail: p })); } catch (e) { /* ignore */ }
  }
  function takeStage(s) {
    if (!s || typeof s !== "object") return;
    if (s.rev && RT.stageRev && s.rev < RT.stageRev) return;
    RT.stage = s;
    if (s.rev) RT.stageRev = s.rev;
    try { dispatchEvent(new CustomEvent("nk-rt-stage", { detail: s })); } catch (e) { /* ignore */ }
  }
  function takeTitles(t) {
    RT.titles = t && typeof t === "object" ? t : {};
    try { dispatchEvent(new CustomEvent("nk-rt-titles", { detail: RT.titles })); } catch (e) { /* ignore */ }
  }
  function takeVbx(v, all) {
    RT.vbx = all ? (v && typeof v === "object" ? v : {}) : RT.vbx || {};
    try { dispatchEvent(new CustomEvent("nk-rt-vbx", { detail: RT.vbx })); } catch (e) { /* ignore */ }
  }
  function takeVmod(v) {
    RT.vmod = v && typeof v === "object" ? v : {};
    try { dispatchEvent(new CustomEvent("nk-rt-vmod", { detail: RT.vmod })); } catch (e) { /* ignore */ }
  }
  function takePlay(p) {
    if (!p || typeof p !== "object") return;
    if (p.rev && RT.playRev && p.rev < RT.playRev) return;
    RT.play = p;
    if (p.rev) RT.playRev = p.rev;
    // v73: 다음 접속 때 첫 화면부터 관리자 설정(맵 등)이 바로 보이도록 기억
    try { localStorage.setItem("nk_play_cache", JSON.stringify(p)); } catch (e) { /* ignore */ }
    try { dispatchEvent(new CustomEvent("nk-rt-play", { detail: p })); } catch (e) { /* ignore */ }
  }
  function takeCues(list) {
    const rows = Array.isArray(list) ? list : [];
    RT.cues = rows;
    rows.forEach((c) => { try { dispatchEvent(new CustomEvent("nk-rt-cue", { detail: c })); } catch (e) { /* ignore */ } });
  }
  function takeRecovers(list) {
    const rows = Array.isArray(list) ? list : [];
    RT.recovers = rows;
    rows.forEach((r) => { try { dispatchEvent(new CustomEvent("nk-rt-recover", { detail: r })); } catch (e) { /* ignore */ } });
  }
  function takeLosses(list) {
    const rows = Array.isArray(list) ? list : [];
    rows.forEach((row) => {
      if (!row || !row.id || RT.losses.some((x) => x.id === row.id)) return;
      RT.losses.unshift(row);
    });
    RT.losses = RT.losses.slice(0, 80);
    try { dispatchEvent(new CustomEvent("nk-rt-losses", { detail: rows })); } catch (e) { /* ignore */ }
  }

  function onMessage(m) {
    if (!m || typeof m !== "object") return;
    if (onStaffMsg(m)) return;
    if (typeof m.n === "number" && (m.t === "welcome" || m.t === "join" || m.t === "leave")) RT.n = m.n;
    if (m.t === "join" && m.peer && m.peer.id !== RT.id) peers.set(m.peer.id, m.peer);
    else if (m.t === "leave" && m.id) peers.delete(m.id);
    else if (m.t === "pose" && m.id && m.id !== RT.id) {
      const prev = peers.get(m.id) || { id: m.id };
      peers.set(m.id, Object.assign(prev, {
        id: m.id, nick: m.nick || prev.nick, ki: m.ki, lv: m.lv,
        x: m.x, z: m.z, y: m.y, d: m.d, fish: m.fish, fk: m.fk || "", fg: m.fg | 0, anim: m.anim, seat: m.seat, br: m.br || null, tt: m.tt || null, dc: m.dc || null, ex: m.ex || null,
      }));
    }
    else if (m.t === "world" && m.world) takeWorld(m.world);
    else if (m.t === "notice") {
      if (typeof m.now === "number") RT.clockSkew = Date.now() - m.now;
      if (Array.isArray(m.notices)) takeNotices(m.notices, m.notice);
      else takeNotice(m.notice);
    }
    else if (m.t === "event") takeEvent(m.event);
    else if (m.t === "balance") takeBalance(m.balance);
    else if (m.t === "grants") takeGrants(m.grants, m.now, { me: m.me, mine: m.mine });
    else if (m.t === "sanc") takeSanc(m.sanc);
    else if (m.t === "prof") takeProf(m.prof);
    else if (m.t === "gift" && m.gift) dispatchEvent(new CustomEvent("nk-rt-gift", { detail: m.gift }));
    else if (m.t === "stage" && m.stage) takeStage(m.stage);
    else if (m.t === "play" && m.play) takePlay(m.play);
    else if (m.t === "cue" && m.cue) { RT.cues = (RT.cues || []).concat(m.cue).slice(-30); dispatchEvent(new CustomEvent("nk-rt-cue", { detail: m.cue })); }
    else if (m.t === "recover" && m.recover) { dispatchEvent(new CustomEvent("nk-rt-recover", { detail: m.recover })); }
    else if (m.t === "losses" && m.losses) takeLosses(m.losses);
    else if (m.t === "loss" && m.loss) takeLosses([m.loss]);
    else if (m.t === "banned") dispatchEvent(new CustomEvent("nk-rt-banned", { detail: m }));
    else if (m.t === "nick") dispatchEvent(new CustomEvent("nk-rt-nick", { detail: m }));
    else if (m.t === "auth") {
      if (m.ok) { RT.admin = true; RT.adminToken = String(m.token || ""); if (m.keep) keepSet(m.keep); }
      else if (m.tok) keepSet("");
      else if (m.out || m.need) { RT.admin = false; RT.adminToken = ""; }
      if (authWait) { const w = authWait; authWait = null; w({ ok: !!m.ok }); }
      else if (m.need) dispatchEvent(new CustomEvent("nk-rt-auth-need", { detail: m }));
      dispatchEvent(new CustomEvent("nk-rt-auth", { detail: { ok: !!m.ok } }));
    }
    else if (m.t === "cnt" && m.by && typeof m.by === "object") { RT.by = Object.assign({}, m.by); if (RT.sid) RT.by[RT.sid] = Math.max(RT.by[RT.sid] | 0, 0); if (m.mh && typeof m.mh === "object") RT.mh = Object.assign({}, m.mh); }
    else if (m.t === "chat" && m.id !== RT.id) dispatchEvent(new CustomEvent("nk-rt-chat", { detail: m }));
    else if (m.t === "emote" && m.id !== RT.id) dispatchEvent(new CustomEvent("nk-rt-emote", { detail: m }));
    else if (m.t === "titles") takeTitles(m.titles);
    else if (m.t === "vmod") takeVmod(m.vmod);
    else if (m.t === "vbx" && typeof m.k === "string") { RT.vbx = RT.vbx || {}; if (m.d) RT.vbx[m.k] = m.d; else delete RT.vbx[m.k]; takeVbx(null, false); }
    else if (m.t === "game") { RT.game = m.game || null; dispatchEvent(new CustomEvent("nk-rt-game", { detail: RT.game })); }
    else if (m.t === "gameRes") dispatchEvent(new CustomEvent("nk-rt-gameres", { detail: m }));
    else if (m.t === "gamecfg") { RT.gameCfg = m.cfg || null; dispatchEvent(new CustomEvent("nk-rt-gamecfg", { detail: RT.gameCfg })); }
    else if (m.t === "like" && m.to === RT.id) dispatchEvent(new CustomEvent("nk-rt-like", { detail: m }));
    else if (m.t === "pk" || m.t === "pka") dispatchEvent(new CustomEvent("nk-rt-" + m.t, { detail: m }));
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
      home: (p.home | 0) || undefined,
      cid: CID,
      adm: admCred ? { id: admCred.id, pw: admCred.pw } : (keepGet() ? { tok: keepGet() } : undefined),
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
            RT.game = m.game || null;
            setTimeout(() => { try { dispatchEvent(new CustomEvent("nk-rt-game", { detail: RT.game })); } catch (e) { /* ignore */ } }, 0);
            RT.mode = "on";
            retry = 0;
            try { sock.send("ping"); } catch (e) { /* ignore */ }
            finish({ ok: true });
            return;
          }
          if (m.t === "nick" && m.ok === false) {
            if (m.reason === "admin") keepSet("");
            closeSocket();
            RT.mode = "solo";
            want = false;
            finish({ ok: false, reason: "nick", detail: m.reason || "bad" });
            return;
          }
          if (m.t === "banned") {
            closeSocket();
            RT.mode = "solo";
            want = false;
            finish({ ok: false, reason: "banned", until: m.until || 0 });
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
      sock.onclose = (ev) => {
        if (ws !== sock) return;
        ws = null;
        if (ev && ev.code === 4008) { want = false; RT.mode = "solo"; peers.clear(); try { dispatchEvent(new CustomEvent("nk-rt-admonly")); } catch (e) { /* ignore */ } if (!settled) finish({ ok: false, reason: "admin" }); return; }
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
          lostAt = Date.now();
          return;
        }
        RT.mode = "connecting";
        setTimeout(() => { if (want && token === gen) openSocket(token, serverId, Object.assign({}, profile, RT.profile || {}), true); }, 700 * retry);
      };
      if (isRetry) { /* reconnect uses the same listeners */ }
    });
  }

  // v60: 모바일에서 백그라운드로 갔다가 돌아왔을 때 끊긴 연결을 다시 잇기
  let lostAt = 0;
  const resume = () => {
    if (document.hidden || !RT.profile) return;
    if (lostAt) { lostAt = 0; RT.connect(RT.sid, RT.profile).then((r) => { if (r && r.ok) dispatchEvent(new CustomEvent("nk-rt-rejoin")); }); return; }
    if (want && ws && ws.readyState > 1) { try { ws.onclose && ws.onclose(); } catch (e) { /* ignore */ } }
  };
  document.addEventListener("visibilitychange", resume);
  addEventListener("online", resume);
  addEventListener("pageshow", (e) => { if (e.persisted) resume(); });

  RT.connect = async function (serverId, profile) {
    lostAt = 0;
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
      fk: p.fish === "catch" ? String(p.fk || "") : undefined,
      fg: p.fish === "catch" ? p.fg | 0 : undefined,
      anim: p.anim || "idle",
      seat: p.seat == null ? null : p.seat | 0,
      ki: p.ki | 0,
      lv: p.lv | 0,
      nick: String(p.nick || "").slice(0, 10),
      br: p.br || null,
      tt: p.tt || null,
      dc: p.dc || null,
      ex: p.ex || null,
    };
    const bk = (b) => (b ? b.k + b.at + "|" + (b.lk | 0) : "");
    const tk = (t) => (t ? t.n + t.bg : "");
    const important = !poseSnap || next.fish !== poseSnap.fish || next.anim !== poseSnap.anim || next.seat !== poseSnap.seat || bk(next.br) !== bk(poseSnap.br) || tk(next.tt) !== tk(poseSnap.tt) || JSON.stringify(next.dc) !== JSON.stringify(poseSnap.dc) || JSON.stringify(next.ex) !== JSON.stringify(poseSnap.ex);
    const moved = !poseSnap || Math.hypot(next.x - poseSnap.x, next.z - poseSnap.z) > 0.15 || Math.abs(next.d - poseSnap.d) > 0.35;
    if (!important && !moved && now - poseAt < 5000) return;
    if (important && now - poseAt < 60) { schedule(p, 70); return; }
    if (!important && now - poseAt < 200) { if (moved) schedule(p, 210); return; }
    poseSnap = next;
    poseAt = now;
    // v60: 재접속 때 hello 에 지금 닉·위치를 보내도록 최신 상태를 기억
    if (RT.profile) Object.assign(RT.profile, { nick: next.nick || RT.profile.nick, ki: next.ki, lv: next.lv, x: next.x, z: next.z, y: next.y, d: next.d, fish: next.fish === "catch" ? "off" : next.fish, anim: next.anim, seat: next.seat });
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

  /** v52: 관리자 로그인 — 서버가 비밀번호를 확인한다. 성공하면 이 연결만 관리자 권한. */
  RT.auth = function (id, pw) {
    if (RT.mode !== "on" || !ws || ws.readyState !== 1) return Promise.resolve({ ok: false, reason: "offline" });
    return new Promise((resolve) => {
      const t = setTimeout(() => { if (authWait) { authWait = null; resolve({ ok: false, reason: "timeout" }); } }, 6000);
      authWait = (r) => { clearTimeout(t); if (r.ok) admCred = { id: String(id || ""), pw: String(pw || "") }; resolve(r); };
      send({ t: "auth", id: String(id || ""), pw: String(pw || "") });
    });
  };
  /** 시작 화면에서 관리자 닉으로 들어갈 때: 다음 hello 에 자격을 함께 보낸다 */
  RT.setAdminCred = function (id, pw) { admCred = id || pw ? { id: String(id || ""), pw: String(pw || "") } : null; };
  RT.dropAdmin = function () { admCred = null; RT.admin = false; RT.adminToken = ""; };
  RT.logoutAdmin = function () { admCred = null; keepSet(""); RT.admin = false; RT.adminToken = ""; send({ t: "auth", out: 1 }); };
  RT.hasAdminKeep = function () { return !!keepGet(); };
  RT.dropAdminKeep = function () { keepSet(""); };
  RT.isAdmin = function () { return !!RT.admin; };
  RT.chat = function (text) { if (RT.mode === "on") send({ t: "chat", text: String(text || "").slice(0, 80) }); };
  RT.like = function (to) { if (RT.mode === "on" && to) send({ t: "like", to: String(to) }); };
  // v93: 프로필·어항 엿보기
  RT.peek = function (to, k) { if (RT.mode === "on" && to) send({ t: "pk", to: String(to), k: k || "prof" }); };
  RT.peekAns = function (to, k, d) { if (RT.mode === "on" && to) send({ t: "pka", to: String(to), k, d }); };
  RT.s5 = function (k, g) { if (RT.mode === "on") send({ t: "s5", k: String(k || ""), g: g | 0 }); };
  RT.emote = function (text) { if (RT.mode === "on") send({ t: "emote", text: String(text || "").slice(0, 8) }); };
  function opsSend(obj) {
    if (RT.mode !== "on") return false;
    send(obj);
    return true;
  }
  RT.setWorld = function (world) {
    if (RT.mode !== "on" || !world || typeof world !== "object") return false;
    send({ t: "world", world });
    return true;
  };
  // v55: 초성·밸런스 게임
  RT.setTitles = function (titles) { return opsSend({ t: "titles", titles: titles || {} }); };
  RT.setVbx = function (k, d) { return opsSend({ t: "vbx", k, d: d || null }); };
  RT.setVmod = function (vmod) { return opsSend({ t: "vmod", vmod: vmod || {} }); };
  RT.gameAns = function (id, a) { if (RT.mode === "on") send({ t: "ans", id: String(id || ""), a: String(a || "").slice(0, 30) }); };
  RT.gamePick = function (id, s) { if (RT.mode === "on") send({ t: "pick", id: String(id || ""), s }); };
  RT.gameSet = function (cfg) { return opsSend({ t: "game", game: cfg || {} }); };
  RT.gameNow = function (kind, all) { return opsSend({ t: "gameNow", kind: kind || "", all: !!all }); };
  RT.gameGet = function () { return opsSend({ t: "gameGet" }); };
  RT.setNotice = function (notice) { return opsSend({ t: "notice", notice: notice || null }); };
  RT.setEvent = function (event) { return opsSend({ t: "event", event: event || null }); };
  RT.setBalance = function (balance) { return opsSend({ t: "balance", balance: balance || null }); };
  RT.setGrant = function (grant) { return opsSend({ t: "grant", nick: grant && grant.nick, until: grant && grant.until, revoke: !!(grant && grant.revoke), mins: grant && grant.mins, id: grant && grant.id || "" }); };
  RT.setSanc = function (row) { return opsSend({ t: "sanc", nick: row && row.nick, mute: row && row.mute, ban: row && row.ban, why: row && row.why }); };
  RT.setGift = function (gift) { return opsSend({ t: "gift", gift }); };
  RT.setProf = function (prof) { return opsSend({ t: "prof", prof }); };
  RT.setStage = function (stage) { return opsSend({ t: "stage", stage }); };
  RT.setPlay = function (play) { return opsSend({ t: "play", play }); };
  RT.setCue = function (cue) { return opsSend({ t: "cue", cue }); };
  RT.setRecover = function (recover) { return opsSend({ t: "recover", recover }); };
  RT.ackRecover = function (id) { return opsSend({ t: "recoverAck", id }); };
  RT.pushLoss = function (loss) { return opsSend({ t: "loss", loss }); };
  RT.pushLosses = function (losses) { return opsSend({ t: "losses", losses: (losses || []).slice(0, 12) }); };

  window.NK_RT = RT;
  if (base) {
    refresh(2500);
    setInterval(() => {
      const start = document.getElementById("start");
      if (start && start.classList.contains("show")) refresh(2500);
    }, 8000);
  }
})();
