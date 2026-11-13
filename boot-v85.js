// v85: 게임보다 먼저 실행돼요.
// ① 미리보기 창(?uiprev=…) — 관리자 화면 안에서 띄우는 휴대폰·시작 화면 미리보기는 저장소에 아무것도 쓰지 않아요 (실제 저장이 덮이지 않게)
// ② 🧪 한 기기 여러 계정 — 같은 브라우저에서 새 계정을 만들거나 다른 계정으로 이어하면, 지금 진행을 이 기기에 따로 보관하고 새 칸으로 바꿔요
(function () {
  var LS;
  try { LS = window.localStorage; } catch (e) { return; }
  var qs = new URLSearchParams(location.search);
  if (qs.has('uiprev')) {
    var mem = new Map(), P = Storage.prototype, g = P.getItem, s = P.setItem, r = P.removeItem;
    // 미리보기는 내 개인 배치 말고 '모든 유저 처음 화면 배치'에서 시작해요
    var hide = { nk_uipos_m: 1, nk_uipos_pc: 1, nk_umv_tip: 0 };
    P.getItem = function (k) { if (this !== LS) return g.call(this, k); if (mem.has(k)) return mem.get(k); if (hide[k]) return null; if (k === 'nk_umv_tip') return '1'; return g.call(this, k); };
    P.setItem = function (k, v) { if (this !== LS) return s.call(this, k, v); mem.set(k, String(v)); };
    P.removeItem = function (k) { if (this !== LS) return r.call(this, k); mem.set(k, null); };
    window.NK_PREV = qs.get('uiprev') || '1';
    // 미리보기는 서버에 아무것도 보내지 않아요 (저장·순위 업로드 막기)
    var of = window.fetch;
    if (of) window.fetch = function (u, o) { var m = o && o.method ? String(o.method).toUpperCase() : 'GET'; if (m !== 'GET' && m !== 'HEAD') return Promise.reject(new Error('preview')); return of.apply(this, arguments); };
    try { navigator.sendBeacon = function () { return true; }; } catch (e) {}
    return;
  }
  var PER = ['nakmeong_solo', 'nakmeong_v2', 'nk_cid', 'nk_save_code', 'nk_recover_seen', 'nk_autofish', 'nk_sptitle'];
  var KS = 'nk_slots';
  function rd() { try { var o = JSON.parse(LS.getItem(KS) || 'null'); if (o && Array.isArray(o.list)) return o; } catch (e) {} return { cur: '', list: [] }; }
  function wr(o) { try { LS.setItem(KS, JSON.stringify(o)); } catch (e) {} }
  function snap() { var o = {}; PER.forEach(function (k) { var v = LS.getItem(k); if (v != null) o[k] = v; }); return o; }
  function metaOf(o) { try { var sv = JSON.parse(o.nakmeong_solo || o.nakmeong_v2 || '{}'); return { nick: sv.nick || '', acct: sv.acct || '', xp: +sv.xp || 0, ch: sv.char | 0 }; } catch (e) { return {}; } }
  function newId() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function ensure() { var st = rd(); if (!st.cur) { st.cur = newId(); var m = metaOf(snap()); m.id = st.cur; m.t = Date.now(); st.list.push(m); wr(st); } return st; }
  var skey = function () { return LS.getItem('nk_solo') !== '0' ? 'nakmeong_solo' : 'nakmeong_v2'; };
  var go = LS.getItem('nk_slot_go');
  if (go) {
    LS.removeItem('nk_slot_go');
    var req = {}; try { req = JSON.parse(go) || {}; } catch (e) {}
    var st = ensure(), cur = snap(), row = st.list.find(function (x) { return x.id === st.cur; });
    var ok = true;
    try { LS.setItem('nk_slot_' + st.cur, JSON.stringify(cur)); } catch (e) { ok = false; }
    if (ok) {
      if (row) { var m = metaOf(cur); for (var k in m) row[k] = m[k]; row.t = Date.now(); }
      var tid = req.to;
      if (tid === 'new' || !st.list.some(function (x) { return x.id === tid; })) { tid = newId(); st.list.push({ id: tid, t: Date.now(), nick: req.nick || '', acct: '', xp: 0, ch: 0 }); }
      PER.forEach(function (k) { LS.removeItem(k); });
      var data = {}; try { data = JSON.parse(LS.getItem('nk_slot_' + tid) || '{}') || {}; } catch (e) {}
      Object.keys(data).forEach(function (k) { if (PER.indexOf(k) >= 0) LS.setItem(k, data[k]); });
      if (req.load) { LS.setItem(skey(), req.load); if (req.code) LS.setItem('nk_save_code', req.code); if (req.cid && /^[\w-]{8,40}$/.test(req.cid)) LS.setItem('nk_cid', req.cid); }
      else if (req.nick && !data.nakmeong_solo && !data.nakmeong_v2) LS.setItem(skey(), JSON.stringify({ nick: req.nick }));
      LS.removeItem('nk_slot_' + tid);
      st.cur = tid; wr(st);
      try { sessionStorage.setItem('nk_slot_msg', JSON.stringify({ to: tid, nick: req.nick || '', mk: !!req.mk, load: !!req.load })); } catch (e) {}
    }
  }
  window.NK_SLOT = {
    list: function () { return ensure().list.slice(); },
    cur: function () { return ensure().cur; },
    touch: function (m) { var st = ensure(), row = st.list.find(function (x) { return x.id === st.cur; }); if (!row) return; var ch = false; for (var k in m) { if (row[k] !== m[k]) { row[k] = m[k]; ch = true; } } if (ch) { row.t = Date.now(); wr(st); } },
    go: function (to, extra) { var o = extra || {}; o.to = to; try { LS.setItem('nk_slot_go', JSON.stringify(o)); } catch (e) { return false; } location.reload(); return true; },
  };
})();

// v132: 서버 설정(관리자가 고른 맵 등)을 게임 파일보다 먼저 받아요 — 처음 들어온 기기에서 기본 맵이 먼저 보였다가 바뀌지 않게
//  · 받은 설정은 nk_play_cache 에 저장 → 게임이 시작하자마자 그 맵으로 바로 만들어요
//  · 크리스마스·보리밭 맵이면 그 맵 파일도 미리 받아 둬요
//  · realtime.js 의 첫 서버 목록 요청이 이 결과를 그대로 써서 요청이 한 번 줄어요
(function () {
  try {
    var qs = new URLSearchParams(location.search);
    if (qs.has('uiprev')) return;
    var q = qs.get('rt'), b = 'https://fishcozy-realtime.mi1ku.workers.dev';
    if (q === 'off' || q === '0') return;
    if (q && /^https?:\/\//i.test(q)) b = q.replace(/\/+$/, '');
    else { var s = null; try { s = localStorage.getItem('nk_rt_base'); } catch (e) {} if (s === 'off') return; if (s && /^https?:\/\//i.test(s)) b = s.replace(/\/+$/, ''); }
    var ctl = window.AbortController ? new AbortController() : null;
    var tm = setTimeout(function () { try { ctl && ctl.abort(); } catch (e) {} }, 4000);
    var PK = { X: 'mapx-xmas', XM: 'mapx-xmas', GB: 'mapx-barley' };
    var p = fetch(b + '/servers', { cache: 'no-store', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(tm); if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (j) {
        if (j && j.play && typeof j.play === 'object') {
          try { localStorage.setItem('nk_play_cache', JSON.stringify(j.play)); } catch (e) {}
          var pk = PK[j.play.mapSt];
          if (pk) { var l = document.createElement('link'); l.rel = 'preload'; l.as = 'script'; l.href = 'assets/' + pk + '.js?v59'; document.head.appendChild(l); }
        }
        return j;
      });
    p.catch(function () {});
    window.NK_PRE_SRV = { at: Date.now(), p: p, base: b };
  } catch (e) {}
})();
