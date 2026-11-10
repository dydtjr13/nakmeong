// v109 ── 🧱 새 탈것·캐릭터·펫 만들기 (관리자 › 🧪 테스트 기능) · v110 구역 나누기 · ✨ 다듬기 · 저장/불러오기
// 건축 모드: 마인크래프트처럼 블럭 쌓기 (왼쪽 클릭 쌓기 · 꾹 눌러 끌면 영역 채우기 · 오른쪽 클릭 지우기 · 오른쪽 끌기 돌리기)
// 상세 조정 모드: 묶음(몸통·머리·다리·꼬리)마다 회전 중심·회전·크기·역할 · 타는 자리 · 전체 크기
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const VB = () => (window.NK89 && window.NK89.VB) || null;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const toast = (a, b) => { try { VB().toast(a, b); } catch (e) { /* ignore */ } };
  const DRAFT = 'nk_vb_drafts';
  const MAXB = 6000;
  const SW = ['#f4f1ea', '#d9d2c5', '#9aa3ad', '#5c6470', '#2c2a30', '#f2b8c6', '#e8708a', '#c8323a', '#f08a4b', '#f5c63c', '#fff0b0', '#c9a37a', '#8a5a3a', '#5a3a24', '#a8d86e', '#4f9a52', '#2f6b4a', '#9fe0d8', '#3f8f8a', '#8fc8f0', '#3d7fd1', '#2a3f7a', '#b98be0', '#6e4aa8'];
  const ROLE = { '': '역할 없음', leg: '다리 (걸을 때 앞뒤로)', arm: '팔 (걸을 때 앞뒤로)', head: '머리 (끄덕끄덕)', tail: '꼬리 (좌우로 흔들)' };
  const BONE = { torso: '몸통', head: '머리', 'arm-left': '왼팔', 'arm-right': '오른팔', 'leg-left': '왼다리', 'leg-right': '오른다리' };
  // v110 구역(몸 부분) — 왼쪽 = +x (앞이 +z 일 때)
  const PARTS = {
    veh: [['', '몸통', {}], ['h', '머리', { head: 1 }], ['t', '꼬리', { tail: 1 }], ['lfl', '앞다리 왼', { leg: 0 }], ['lfr', '앞다리 오른', { leg: Math.PI }], ['lbl', '뒷다리 왼', { leg: Math.PI }], ['lbr', '뒷다리 오른', { leg: 0 }], ['wl', '날개 왼', {}], ['wr', '날개 오른', {}], ['e', '장식', {}]],
    chr: [['', '기타 (몸통에 붙어요)', {}], ['b', '몸통', { bone: 'torso' }], ['h', '머리', { head: 1, bone: 'head' }], ['al', '왼팔', { arm: 0, bone: 'arm-left' }], ['ar', '오른팔', { arm: Math.PI, bone: 'arm-right' }], ['ll', '왼다리', { leg: Math.PI, bone: 'leg-left' }], ['lr', '오른다리', { leg: 0, bone: 'leg-right' }]],
  };
  const MIRP = { lfl: 'lfr', lfr: 'lfl', lbl: 'lbr', lbr: 'lbl', wl: 'wr', wr: 'wl', al: 'ar', ar: 'al', ll: 'lr', lr: 'll' };
  const partsOf = () => PARTS[E.d && E.d.t === 'chr' ? 'chr' : 'veh'];
  const GC = ['#e8708a', '#3d7fd1', '#f5c63c', '#4f9a52', '#b98be0', '#f08a4b', '#3f8f8a', '#8a5a3a', '#c8323a', '#2a3f7a'];

  // ── 상태
  const E = {
    k: null, d: null, V: {}, mode: 'build', tool: 'add', brush: 1, sm: 2, size: 1, er: 1, col: 0, mir: true, gid: '', sel: '', walk: false, tint: false, ppl: true,
    undo: [], redo: [], R: null, sc: null, cam: null, root: null, ghost: null, raf: 0, yaw: 0.9, pit: 0.45, dist: 6, tgt: null, t: 0, occ: null, dirtyT: 0,
  };
  const ck = (x, y, z) => x + ',' + y + ',' + z;

  // ── 데이터 ↔ 편집 형태
  function load(d) {
    const V = VB();
    E.d = JSON.parse(JSON.stringify(d));
    delete E.d.vox;
    E.d.groups = E.d.groups || {};
    E.d.pal = E.d.pal && E.d.pal.length ? E.d.pal : SW.slice(0, 8);
    E.V = {};
    const vox = d.vox || {};
    for (const g of ['', ...Object.keys(E.d.groups)]) {
      const m = new Map();
      for (const b of V.vbDec(vox[g] || '')) m.set(ck(b[0], b[1], b[2]), b);
      E.V[g] = m;
    }
    E.occ = null;
    if (!E.d.groups[E.gid] && E.gid !== '') E.gid = '';
    E.sel = '';
  }
  function data() {
    const V = VB(), d = JSON.parse(JSON.stringify(E.d));
    d.vox = {};
    for (const g in E.V) if (E.V[g].size) d.vox[g] = V.vbEnc([...E.V[g].values()]);
    return d;
  }
  const count = () => { let n = 0; for (const g in E.V) n += E.V[g].size; return n; };
  function snap() { return JSON.stringify(data()); }
  function push() { E.undo.push(snap()); if (E.undo.length > 60) E.undo.shift(); E.redo = []; }
  function changed(full) {
    E.occ = null;
    scene();
    if (full) ui(); else side();
    clearTimeout(E.dirtyT);
    E.dirtyT = setTimeout(saveDraft, 600);
  }
  function drafts() { try { return JSON.parse(localStorage.getItem(DRAFT) || '{}') || {}; } catch (e) { return {}; } }
  function saveDraft() { if (!E.k) return; try { const o = drafts(), d = data(); d.at = Date.now(); o[E.k] = d; localStorage.setItem(DRAFT, JSON.stringify(o)); localStorage.setItem('nk_vb_last', E.k); } catch (e) { toast('내 컴퓨터에 저장할 공간이 모자라요', 1600); } }

  // 칸 → 어떤 블럭이 차지하는지
  function occ() {
    if (E.occ) return E.occ;
    const o = new Map();
    for (const g in E.V) for (const [key, b] of E.V[g]) { const s = b[3]; for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) for (let k = 0; k < s; k++) o.set(ck(b[0] + i, b[1] + j, b[2] + k), [g, key]); }
    return (E.occ = o);
  }
  function colIdx(hex) {
    const pal = E.d.pal;
    let i = pal.indexOf(hex);
    if (i >= 0) return i;
    if (pal.length < 64) { pal.push(hex); return pal.length - 1; }
    // 64색이 넘으면 가장 가까운 색
    const c = new THREE.Color(hex); let bi = 0, bd = 9;
    pal.forEach((h, j) => { const q = new THREE.Color(h), dd = (q.r - c.r) ** 2 + (q.g - c.g) ** 2 + (q.b - c.b) ** 2; if (dd < bd) { bd = dd; bi = j; } });
    return bi;
  }
  const inR = (v) => v >= -64 && v <= 63;
  function canPut(x, y, z, s) { const o = occ(); for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) for (let k = 0; k < s; k++) { if (!inR(x + i) || !inR(y + j) || !inR(z + k) || y + j < 0) return false; if (o.has(ck(x + i, y + j, z + k))) return false; } return true; }
  function put(x, y, z, s, c, gid) {
    if (count() >= MAXB) return false;
    if (!canPut(x, y, z, s)) return false;
    const G = gid != null && E.V[gid] ? gid : E.gid; if (!E.V[G]) E.V[G] = new Map();
    const b = [x, y, z, s, c]; E.V[G].set(ck(x, y, z), b);
    const o = occ(); for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) for (let k = 0; k < s; k++) o.set(ck(x + i, y + j, z + k), [G, ck(x, y, z)]);
    return true;
  }
  function delCell(x, y, z) { const h = occ().get(ck(x, y, z)); if (!h) return false; E.V[h[0]].delete(h[1]); E.occ = null; return true; }
  function grpCell(x, y, z) { const h = occ().get(ck(x, y, z)); if (!h || h[0] === E.gid) return false; const b = E.V[h[0]].get(h[1]); E.V[h[0]].delete(h[1]); E.V[E.gid].set(h[1], b); E.occ = null; return true; }
  const mx = (x, s) => -x - s; // 좌우 대칭 칸 (x=0 경계 기준)

  // ── 기본 모양
  function boxFill(m, x0, y0, z0, w, h, l, c) { for (let x = x0; x < x0 + w; x++) for (let y = y0; y < y0 + h; y++) for (let z = z0; z < z0 + l; z++) m.set(ck(x, y, z), [x, y, z, 1, c]); }
  function tpl(kind, t) {
    const V = VB();
    const d = { v: 1, t, n: t === 'chr' ? '새 캐릭터' : t === 'pet' ? '새 펫' : '새 탈것', vu: t === 'chr' ? 0.07 : t === 'pet' ? 0.035 : 0.1, seat: [0, 1.25, 0], zoom: 1, pal: t === 'chr' ? ['#f2d2b6', '#3d7fd1', '#2a3f7a', '#5a3a24', '#2c2a30', '#f4f1ea'] : ['#c9a37a', '#8a5a3a', '#2c2a30', '#f4f1ea', '#e8708a', '#5a3a24'], groups: {}, vox: {} };
    const M = {};
    const g = (id, q) => { d.groups[id] = q; M[id] = new Map(); return M[id]; };
    M[''] = new Map();
    if (kind === 'animal') {
      boxFill(M[''], -5, 6, -9, 10, 7, 18, 0);
      const h = g('h', { nm: '머리', head: 1, p: [0, 1.15, 0.85] }); boxFill(h, -4, 10, 9, 8, 7, 7, 0); boxFill(h, -2, 10, 16, 4, 3, 2, 1); boxFill(h, -3, 14, 15, 2, 1, 1, 2); boxFill(h, 1, 14, 15, 2, 1, 1, 2);
      [['lfr', -5, 6, Math.PI], ['lfl', 2, 6, 0], ['lbr', -5, -8, 0], ['lbl', 2, -8, Math.PI]].forEach(([id, x, z, ph]) => { const m = g(id, { nm: PARTS.veh.find((q) => q[0] === id)[1], leg: ph, p: [(x + 1.5) * 0.1, 0.6, (z + 1.5) * 0.1] }); boxFill(m, x, 0, z, 3, 6, 3, 0); boxFill(m, x, 0, z, 3, 1, 3, 1); });
      const tl = g('t', { nm: '꼬리', tail: 1, p: [0, 1.1, -0.9] }); boxFill(tl, -1, 10, -14, 2, 2, 5, 1);
      d.seat = [0, 1.3, -0.1];
    } else if (kind === 'pet') {
      d.pal = ['#f0b070', '#fff1dc', '#2b2230', '#f29ab0', '#c47a3a', '#ffffff'];
      boxFill(M[''], -4, 5, -6, 8, 6, 12, 0); boxFill(M[''], -3, 5, -5, 6, 1, 9, 1);
      const h = g('h', { nm: '머리', head: 1, p: [0, 0.38, 0.2] }); boxFill(h, -4, 9, 5, 8, 7, 7, 0); boxFill(h, -2, 9, 12, 4, 3, 1, 1); boxFill(h, -3, 13, 12, 2, 1, 1, 2); boxFill(h, 1, 13, 12, 2, 1, 1, 2); boxFill(h, -4, 16, 7, 2, 2, 2, 0); boxFill(h, 2, 16, 7, 2, 2, 2, 0);
      [['lfl', 1, 3, 0], ['lfr', -3, 3, Math.PI], ['lbl', 1, -5, Math.PI], ['lbr', -3, -5, 0]].forEach(([id, x, z, ph]) => { const m = g(id, { nm: PARTS.veh.find((q) => q[0] === id)[1], leg: ph, p: [(x + 1) * 0.035, 0.175, (z + 1) * 0.035] }); boxFill(m, x, 0, z, 2, 5, 2, 0); });
      const tl = g('t', { nm: '꼬리', tail: 1, p: [0, 0.35, -0.21] }); boxFill(tl, -1, 9, -10, 2, 2, 4, 4);
    } else if (kind === 'chr') {
      const b = g('b', { nm: '몸통', bone: 'torso', p: [0, 0.84, 0] }); boxFill(b, -4, 12, -2, 8, 10, 4, 1);
      const h = g('h', { nm: '머리', head: 1, bone: 'head', p: [0, 1.54, 0] }); boxFill(h, -4, 22, -4, 8, 8, 8, 0); boxFill(h, -4, 28, -4, 8, 2, 8, 3); boxFill(h, -2, 25, 4, 1, 1, 1, 4); boxFill(h, 1, 25, 4, 1, 1, 1, 4);
      const al = g('al', { nm: '왼팔', arm: 0, bone: 'arm-left', p: [0.35, 1.5, 0] }); boxFill(al, 4, 12, -1, 2, 10, 2, 1); boxFill(al, 4, 12, -1, 2, 2, 2, 0);
      const ar = g('ar', { nm: '오른팔', arm: Math.PI, bone: 'arm-right', p: [-0.35, 1.5, 0] }); boxFill(ar, -6, 12, -1, 2, 10, 2, 1); boxFill(ar, -6, 12, -1, 2, 2, 2, 0);
      const ll = g('ll', { nm: '왼다리', leg: Math.PI, bone: 'leg-left', p: [0.14, 0.84, 0] }); boxFill(ll, 0, 0, -2, 4, 12, 4, 2); boxFill(ll, 0, 0, -2, 4, 2, 5, 4);
      const lr = g('lr', { nm: '오른다리', leg: 0, bone: 'leg-right', p: [-0.14, 0.84, 0] }); boxFill(lr, -4, 0, -2, 4, 12, 4, 2); boxFill(lr, -4, 0, -2, 4, 2, 5, 4);
    } else {
      boxFill(M[''], -3, 0, -3, 6, 1, 6, 0);
    }
    for (const id in M) if (M[id].size) d.vox[id] = V.vbEnc([...M[id].values()]);
    if (!d.vox['']) d.vox[''] = '';
    return d;
  }
  const newKey = () => 'x' + Date.now().toString(36).slice(-6) + Math.floor(Math.random() * 36).toString(36);

  // ── 열기 · 닫기
  function open(k) {
    const V = VB(); if (!V) return;
    css();
    let m = $('vbEd');
    if (!m) { m = document.createElement('div'); m.id = 'vbEd'; document.body.appendChild(m); }
    m.classList.add('show'); document.body.classList.add('vbOpen');
    const dr = drafts();
    let last = ''; try { last = localStorage.getItem('nk_vb_last') || ''; } catch (e) { /* ignore */ }
    const k0 = k || E.k || (dr[last] ? last : '') || Object.keys(dr).sort((a, b) => (dr[b].at || 0) - (dr[a].at || 0))[0] || Object.keys(V.VBX.map)[0];
    if (k0 && (dr[k0] || V.vbGet(k0))) { E.k = k0; load(dr[k0] || V.vbGet(k0)); if (!dr[k0]) saveDraft(); }
    else { E.k = newKey(); load(tpl('animal', 'veh')); saveDraft(); }
    E.undo = []; E.redo = [];
    ui(); gl(); fit();
  }
  function close() { const m = $('vbEd'); if (m) m.classList.remove('show'); document.body.classList.remove('vbOpen'); cancelAnimationFrame(E.raf); E.raf = 0; saveDraft(); }

  // ── 화면
  function grpName(id) { if (!id) return E.d.t === 'chr' ? '기타' : '몸통'; const q = E.d.groups[id]; return (q && q.nm) || '묶음'; }
  function grpCol(id) { const ids = ['', ...Object.keys(E.d.groups)]; return GC[Math.max(0, ids.indexOf(id)) % GC.length]; }
  function projList() {
    const V = VB(), dr = drafts(), keys = new Set([...Object.keys(dr), ...Object.keys(V.VBX.map)]);
    return [...keys].map((k) => { const d = dr[k] || V.vbGet(k); return `<option value="${k}" ${k === E.k ? 'selected' : ''}>${d.t === 'chr' ? '🧍' : '🐾'} ${esc(d.n || k)}${V.VBX.map[k] ? ' · 게임에 있음' : ''}</option>`; }).join('');
  }
  function ui() {
    const m = $('vbEd'); if (!m) return;
    if (!m.querySelector('#vbCv')) {
      m.innerHTML = `<div class="vbWin"><div class="vbTop"></div><div class="vbBody"><div class="vbL"></div><div class="vbView"><canvas id="vbCv"></canvas><div class="vbInfo"></div><div class="vbHint"></div><div class="vbOrb"><button type="button" data-orb="l" aria-label="왼쪽으로 돌리기">⟲</button><button type="button" data-orb="r" aria-label="오른쪽으로 돌리기">⟳</button><button type="button" data-orb="u" aria-label="위에서 보기">⤒</button><button type="button" data-orb="f" aria-label="전체 보기">⤢</button></div></div><div class="vbR"></div></div></div>`;
      m.querySelectorAll('[data-orb]').forEach((b) => (b.onclick = () => { const o = b.dataset.orb; if (o === 'l') E.yaw += 0.5; else if (o === 'r') E.yaw -= 0.5; else if (o === 'u') E.pit = E.pit > 1.2 ? 0.45 : 1.45; else fit(); }));
      m.addEventListener('contextmenu', (e) => { if (e.target.id === 'vbCv') e.preventDefault(); });
    }
    const d = E.d, chr = d.t === 'chr';
    const TI = { veh: '🐾', chr: '🧍', pet: '🐶' };
    m.querySelector('.vbTop').innerHTML = `<b class="vbT">🧱 만들기</b>
      <span class="vbNm" title="${esc(d.n)}">${TI[d.t] || '🐾'} ${esc(d.n)}</span>
      <button type="button" data-vbsave>💾 저장</button><button type="button" data-vbload>📂 불러오기</button>
      <button type="button" data-vbnewm>＋ 새로 만들기</button>
      <span class="vbSeg"><button type="button" data-vbm="build" class="${E.mode === 'build' ? 'on' : ''}">🧱 건축</button><button type="button" data-vbm="part" class="${E.mode === 'part' ? 'on' : ''}">🏷 구역 나누기</button><button type="button" data-vbm="detail" class="${E.mode === 'detail' ? 'on' : ''}">🎛 상세 조정</button></span>
      <button type="button" data-vbu ${E.undo.length ? '' : 'disabled'} aria-label="되돌리기" title="되돌리기 (Ctrl+Z)">↶</button><button type="button" data-vbr ${E.redo.length ? '' : 'disabled'} aria-label="다시하기" title="다시하기 (Ctrl+Y)">↷</button>
      <button type="button" data-vbphoto>📷 사진으로 모양</button>
      <span class="vbSp"></span>
      <button type="button" class="acc" data-vbreg>✅ 게임에 등록</button>
      <button type="button" data-vbx aria-label="닫기">✕</button>`;
    const q = (s) => m.querySelector(s);
    q('[data-vbsave]').onclick = saveDlg; q('[data-vbload]').onclick = loadDlg; q('[data-vbnewm]').onclick = () => newDlg();
    m.querySelectorAll('[data-vbm]').forEach((b) => (b.onclick = () => { E.mode = b.dataset.vbm; if (E.mode === 'detail' && !E.sel) E.sel = E.gid; changed(true); }));
    q('[data-vbu]').onclick = undo; q('[data-vbr]').onclick = redo;
    q('[data-vbphoto]').onclick = photoDlg;
    q('[data-vbreg]').onclick = regDlg;
    q('[data-vbx]').onclick = close;
    m.querySelector('.vbHint').textContent = E.mode === 'build'
      ? '왼쪽 클릭 쌓기 · 꾹 눌러 끌기 = 영역 · 오른쪽 클릭 지우기 · 오른쪽 끌기 돌리기 · 휠 확대 · 가운데 끌기 옮기기'
      : E.mode === 'part' ? '블럭을 눌러 지금 구역으로 칠하기 · 꾹 눌러 끌기 = 영역 · 오른쪽 끌기 돌리기 · 휠 확대'
      : '구역을 눌러 고르기 · 끌어서 돌리기 · 휠 확대 · 「걷기 보기」로 움직임 확인';
    left(); side();
    void chr;
  }
  function left() {
    const L = $('vbEd') && $('vbEd').querySelector('.vbL'); if (!L) return;
    if (E.mode === 'build') {
      const pal = E.d.pal;
      L.innerHTML = `<h5>도구</h5><div class="vbTools">
        <button type="button" data-vbt="add" class="${E.tool === 'add' ? 'on' : ''}">🧱 쌓기</button><button type="button" data-vbt="del" class="${E.tool === 'del' ? 'on' : ''}">🧽 지우기</button>
        <button type="button" data-vbt="pick" class="${E.tool === 'pick' ? 'on' : ''}">💧 색 집기</button><button type="button" data-vbsm2>✨ 다듬기</button></div>
        <h5>블럭 크기 <small>1~4칸</small></h5><div class="vbNum">${[1, 2, 3, 4].map((s) => `<button type="button" data-vbs="${s}" class="${E.size === s ? 'on' : ''}">${s}</button>`).join('')}</div>
        <h5>지우개 크기</h5><div class="vbNum">${[1, 2, 3, 5].map((s) => `<button type="button" data-vbe="${s}" class="${E.er === s ? 'on' : ''}">${s}</button>`).join('')}</div>
        <label class="vbChk"><input type="checkbox" data-vbmir ${E.mir ? 'checked' : ''}> ⇋ 좌우 대칭으로 쌓기</label>
        <label class="vbChk"><input type="checkbox" data-vbtint ${E.tint ? 'checked' : ''}> 🏷 구역 색으로 보기</label>
        <label class="vbChk"><input type="checkbox" data-vbppl ${E.ppl ? 'checked' : ''}> 🧍 사람 크기 같이 보기</label>
        <h5>블럭 색</h5><div class="vbPal">${pal.map((c, i) => `<button type="button" data-vbc="${i}" class="${E.col === i ? 'on' : ''}" style="background:${c}" aria-label="색 ${i + 1}"></button>`).join('')}</div>
        <div class="vbPal more">${SW.filter((c) => !pal.includes(c)).map((c) => `<button type="button" data-vbsw="${c}" style="background:${c}" aria-label="색 추가"></button>`).join('')}</div>
        <label class="vbCus">직접 고르기 <input type="color" value="${pal[E.col] || '#cccccc'}" data-vbcus></label>`;
      L.querySelectorAll('[data-vbt]').forEach((b) => (b.onclick = () => { E.tool = b.dataset.vbt; left(); }));
      L.querySelectorAll('[data-vbs]').forEach((b) => (b.onclick = () => { E.size = +b.dataset.vbs; left(); }));
      L.querySelectorAll('[data-vbe]').forEach((b) => (b.onclick = () => { E.er = +b.dataset.vbe; left(); }));
      L.querySelector('[data-vbmir]').onchange = (e) => { E.mir = e.target.checked; };
      L.querySelector('[data-vbsm2]').onclick = smoothDlg;
      L.querySelector('[data-vbtint]').onchange = (e) => { E.tint = e.target.checked; scene(); };
      L.querySelector('[data-vbppl]').onchange = (e) => { E.ppl = e.target.checked; scene(); };
      L.querySelectorAll('[data-vbc]').forEach((b) => (b.onclick = () => { E.col = +b.dataset.vbc; if (E.tool !== 'add') E.tool = 'add'; left(); }));
      L.querySelectorAll('[data-vbsw]').forEach((b) => (b.onclick = () => { E.col = colIdx(b.dataset.vbsw); E.tool = 'add'; left(); }));
      const cu = L.querySelector('[data-vbcus]');
      cu.onchange = () => { E.col = colIdx(cu.value); E.tool = 'add'; left(); };
    } else if (E.mode === 'part') {
      const P = partsOf(), extra = Object.keys(E.d.groups).filter((id) => !P.some((q) => q[0] === id));
      L.innerHTML = `<h5>칠할 구역</h5><div class="vbParts">${P.map(([id, n]) => `<button type="button" data-vbp="${id}" class="${E.gid === id ? 'on' : ''}"><i style="background:${grpCol(id)}"></i>${n}<small>${(E.V[id] || new Map()).size || ''}</small></button>`).join('')}${extra.map((id) => `<button type="button" data-vbp="${id}" class="${E.gid === id ? 'on' : ''}"><i style="background:${grpCol(id)}"></i>${esc(grpName(id))}<small>${E.V[id].size || ''}</small></button>`).join('')}</div>
        <h5>붓 크기</h5><div class="vbNum">${[1, 2, 3, 5].map((s) => `<button type="button" data-vbb="${s}" class="${E.brush === s ? 'on' : ''}">${s}</button>`).join('')}</div>
        <label class="vbChk"><input type="checkbox" data-vbmir ${E.mir ? 'checked' : ''}> ⇋ 반대쪽도 같이 (왼 ↔ 오른)</label>
        <p class="vbNote">누른 곳부터 블럭이 이어진 데까지 한 번에 칠해져요 (다리 옆을 누르면 그 다리 두께만큼)</p>
        <button type="button" class="vbWide acc" data-vbauto>🤖 자동으로 나누기</button>
        <button type="button" class="vbWide" data-vbclear>모두 ${E.d.t === 'chr' ? '기타' : '몸통'}으로 되돌리기</button>`;
      L.querySelectorAll('[data-vbp]').forEach((b) => (b.onclick = () => { E.gid = b.dataset.vbp; ensurePart(E.gid); left(); side(); scene(); }));
      L.querySelectorAll('[data-vbb]').forEach((b) => (b.onclick = () => { E.brush = +b.dataset.vbb; left(); }));
      L.querySelector('[data-vbmir]').onchange = (e) => { E.mir = e.target.checked; };
      L.querySelector('[data-vbauto]').onclick = () => { push(); const n = autoSplit(); changed(true); toast(n ? `🤖 ${n}개 구역으로 나눴어요 · 틀린 곳은 칠해서 고쳐요` : '나눌 곳을 찾지 못했어요 · 직접 칠해 주세요', 2200); };
      L.querySelector('[data-vbclear]').onclick = () => { push(); const all = new Map(); for (const g in E.V) for (const [k, b] of E.V[g]) all.set(k, b); E.V = { '': all }; for (const id in E.d.groups) E.V[id] = new Map(); E.gid = ''; changed(true); };
    } else {
      const d = E.d, z = d.zoom || 1;
      L.innerHTML = `<h5>${d.t === 'chr' ? '🧍 캐릭터' : '🐾 탈것'} 전체</h5>
        <label class="vbF">이름<input type="text" maxlength="14" value="${esc(d.n)}" data-vbn></label>
        ${row('전체 크기', 'zoom', 0, z, 0.4, 2.5, 0.01)}
        ${row('칸 cm', 'vu', 0, Math.round((d.vu || 0.1) * 100), 2, 30, 1)}
        ${d.t !== 'veh' ? '' : `<h5>타는 자리 <button type="button" class="vbMini" data-vbseat>자동</button></h5>${['좌우', '높이', '앞뒤'].map((n, j) => row(n, 'seat', j, d.seat[j], -3, 4, 0.01)).join('')}`}
        <label class="vbChk"><input type="checkbox" data-vbwalk ${E.walk ? 'checked' : ''}> 🚶 걷기 보기</label>
        <label class="vbChk"><input type="checkbox" data-vbppl ${E.ppl ? 'checked' : ''}> 🧍 사람 크기 같이 보기</label>
        <p class="vbNote">건축 모드에서는 회전·크기가 풀린 원래 자리로 보여요</p>`;
      const n = L.querySelector('[data-vbn]'); n.onfocus = () => push(); n.oninput = () => { d.n = n.value.replace(/[<>]/g, '').slice(0, 14); }; n.onchange = () => changed(true);
      L.querySelector('[data-vbwalk]').onchange = (e) => { E.walk = e.target.checked; };
      L.querySelector('[data-vbppl]').onchange = (e) => { E.ppl = e.target.checked; scene(); };
      const st = L.querySelector('[data-vbseat]'); if (st) st.onclick = () => { push(); autoSeat(); changed(); left(); };
      bindNums(L);
    }
  }
  const row = (lab, key, i, v, min, max, step) => `<label class="vbRow"><span>${lab}</span><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-vn="${key}" data-vi="${i}"><input type="number" min="${min}" max="${max}" step="${step}" value="${+(+v).toFixed(3)}" data-vn="${key}" data-vi="${i}"></label>`;
  function bindNums(P) {
    P.querySelectorAll('[data-vn]').forEach((el) => {
      el.onpointerdown = el.onfocus = () => { if (!el._p) { push(); el._p = 1; } };
      el.onchange = () => { el._p = 0; topBtns(); E.dirtyT = setTimeout(saveDraft, 400); };
      el.oninput = () => {
        const k = el.dataset.vn, j = +el.dataset.vi, v = +el.value; if (!Number.isFinite(v)) return;
        const d = E.d, q = d.groups[E.sel];
        if (k === 'zoom') d.zoom = v; else if (k === 'vu') { const r = v / 100 / (d.vu || 0.1); d.vu = v / 100; d.seat = d.seat.map((x) => +(x * r).toFixed(3)); for (const g of Object.values(d.groups)) g.p = g.p.map((x) => +(x * r).toFixed(3)); } else if (k === 'seat') d.seat[j] = v;
        else if (q && k === 'p') q.p[j] = v; else if (q && k === 'r') { q.r = q.r || [0, 0, 0]; q.r[j] = (v * Math.PI) / 180; } else if (q && k === 's') q.s = v;
        P.querySelectorAll(`[data-vn="${k}"][data-vi="${j}"]`).forEach((x) => { if (x !== el) x.value = v; });
        E.occ = null; scene();
      };
    });
  }
  function side() {
    const R = $('vbEd') && $('vbEd').querySelector('.vbR'); if (!R) return;
    const d = E.d, ids = ['', ...Object.keys(d.groups)].filter((id) => !id || (E.V[id] && E.V[id].size) || E.mode === 'detail'), cur = E.mode === 'detail' ? E.sel : E.gid;
    if (E.mode !== 'detail') {
      const n = count();
      R.innerHTML = `<h5>구역 <small>${E.mode === 'build' ? '눌러서 구역 나누기로' : '지금 칠하는 구역'}</small></h5><div class="vbGs">${ids.map((id) => { const c = (E.V[id] || new Map()).size; return `<button type="button" data-vbg="${id}" class="${E.mode === 'part' && cur === id ? 'on' : ''}"><i style="background:${grpCol(id)}"></i>${esc(grpName(id))}<small>${c}</small></button>`; }).join('')}</div>
        <p class="vbNote">${E.mode === 'build' ? '새 블럭은 붙인 블럭과 같은 구역에 들어가요. 다 만든 뒤 「🏷 구역 나누기」에서 머리·다리·꼬리를 칠해서 나눠요' : '「🤖 자동으로 나누기」로 먼저 나눈 뒤, 틀린 곳만 칠해서 고치면 빨라요'}</p>
        <hr><h5>✨ 다듬기</h5><p class="vbNote">대충 만든 모양의 튀어나온 블럭·구멍·모서리를 정리하고 얼룩진 색을 맞춰요</p>
        <div class="vbNum">${[[1, '약하게'], [2, '보통'], [3, '세게']].map(([v, t]) => `<button type="button" data-vbsm="${v}" class="${E.sm === v ? 'on' : ''}">${t}</button>`).join('')}</div>
        <button type="button" class="vbWide acc" data-vbsmgo>✨ 다듬기</button>
        <p class="vbNote">블럭 ${n.toLocaleString()} / ${MAXB.toLocaleString()}</p>`;
      R.querySelectorAll('[data-vbg]').forEach((b) => (b.onclick = () => { E.gid = b.dataset.vbg; E.mode = 'part'; changed(true); }));
      R.querySelectorAll('[data-vbsm]').forEach((b) => (b.onclick = () => { E.sm = +b.dataset.vbsm; side(); }));
      R.querySelector('[data-vbsmgo]').onclick = () => doSmooth(E.sm);
      info(); topBtns(); return;
    }
    let h = `<h5>구역 <small>눌러서 고치기</small></h5><div class="vbGs">${ids.map((id) => { const q = d.groups[id] || {}, n = (E.V[id] || new Map()).size; const tag = q.leg != null ? '다리' : q.arm != null ? '팔' : q.head ? '머리' : q.tail ? '꼬리' : ''; return `<button type="button" data-vbg="${id}" class="${cur === id ? 'on' : ''}"><i style="background:${grpCol(id)}"></i>${esc(grpName(id))}${tag ? `<em>${tag}</em>` : ''}<small>${n}</small></button>`; }).join('')}</div>
      <div class="vbGb"><button type="button" data-vbgadd>＋ 새 구역</button>${cur ? '<button type="button" data-vbgdel>구역 풀기</button>' : ''}</div>`;
    if (E.mode === 'detail' && E.sel && d.groups[E.sel]) {
      const q = d.groups[E.sel], r = q.r || [0, 0, 0], role = q.leg != null ? 'leg' : q.arm != null ? 'arm' : q.head ? 'head' : q.tail ? 'tail' : '';
      h += `<hr><h5>${esc(grpName(E.sel))}</h5>
        <label class="vbF">이름<input type="text" maxlength="12" value="${esc(q.nm || '')}" data-vbgn></label>
        <label class="vbF">역할<select data-vbrole>${Object.entries(ROLE).map(([k, n]) => `<option value="${k}" ${k === role ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        ${role === 'leg' || role === 'arm' ? `<label class="vbF">걷는 박자<select data-vbph><option value="0" ${!(q[role] > 1) ? 'selected' : ''}>먼저 앞으로</option><option value="3.142" ${q[role] > 1 ? 'selected' : ''}>나중에 앞으로</option></select></label>` : ''}
        ${d.t === 'chr' ? `<label class="vbF">캐릭터 뼈<select data-vbbone><option value="">없음</option>${Object.entries(BONE).map(([k, n]) => `<option value="${k}" ${q.bone === k ? 'selected' : ''}>${n}</option>`).join('')}</select></label>` : ''}
        <h5>회전 중심 <button type="button" class="vbMini" data-vbpiv>자동</button></h5>${['좌우', '위아래', '앞뒤'].map((n, j) => row(n, 'p', j, q.p[j], -4, 5, 0.01)).join('')}
        <h5>회전 (도)</h5>${['앞뒤로', '좌우로', '옆으로'].map((n, j) => row(n, 'r', j, Math.round((r[j] * 180) / Math.PI), -180, 180, 1)).join('')}
        ${row('크기', 's', 0, q.s || 1, 0.2, 3, 0.01)}
        <h5>블럭 옮기기 <small>한 칸씩</small></h5><div class="vbMv">${[['x', -1, '◀ 왼쪽'], ['x', 1, '오른쪽 ▶'], ['y', 1, '▲ 위'], ['y', -1, '▼ 아래'], ['z', 1, '앞으로'], ['z', -1, '뒤로']].map(([a, s, n]) => `<button type="button" data-vbmv="${a}${s}">${n}</button>`).join('')}</div>`;
    } else if (E.mode === 'detail') {
      h += `<hr><p class="vbNote">${E.sel === '' ? '몸통은 움직이지 않아요. 다리·머리·꼬리 묶음을 고르면 회전 중심과 역할을 정할 수 있어요' : ''}</p>`;
    }
    R.innerHTML = h;
    R.querySelectorAll('[data-vbg]').forEach((b) => (b.onclick = () => { E.sel = b.dataset.vbg; side(); scene(); }));
    R.querySelector('[data-vbgadd]').onclick = () => {
      push(); let i = 1; while (d.groups['g' + i]) i++;
      const id = 'g' + i; d.groups[id] = { nm: '묶음 ' + i, p: [0, 0.5, 0] }; E.V[id] = new Map();
      E.sel = id;
      changed(true);
    };
    const gd = R.querySelector('[data-vbgdel]');
    if (gd) gd.onclick = () => { const id = cur; if (!id) return; push(); for (const [k, b] of E.V[id]) E.V[''].set(k, b); delete E.V[id]; delete d.groups[id]; for (const q of Object.values(d.groups)) if (q.par === id) delete q.par; E.gid = ''; E.sel = ''; changed(true); };
    if (E.mode === 'detail' && E.sel && d.groups[E.sel]) {
      const q = d.groups[E.sel];
      const gn = R.querySelector('[data-vbgn]'); gn.onfocus = () => push(); gn.oninput = () => { q.nm = gn.value.replace(/[<>]/g, '').slice(0, 12); }; gn.onchange = () => side();
      R.querySelector('[data-vbrole]').onchange = (e) => { push(); delete q.leg; delete q.arm; delete q.head; delete q.tail; const v = e.target.value; if (v === 'leg') q.leg = 0; else if (v === 'arm') q.arm = 0; else if (v === 'head') q.head = 1; else if (v === 'tail') q.tail = 1; autoPivot(E.sel); changed(); };
      const ph = R.querySelector('[data-vbph]'); if (ph) ph.onchange = () => { push(); if (q.leg != null) q.leg = +ph.value; else q.arm = +ph.value; changed(); };
      const bn = R.querySelector('[data-vbbone]'); if (bn) bn.onchange = () => { push(); if (bn.value) q.bone = bn.value; else delete q.bone; changed(); };
      R.querySelector('[data-vbpiv]').onclick = () => { push(); autoPivot(E.sel); changed(); };
      R.querySelectorAll('[data-vbmv]').forEach((b) => (b.onclick = () => { push(); moveGroup(E.sel, b.dataset.vbmv[0], +b.dataset.vbmv.slice(1)); changed(); }));
      bindNums(R);
    }
    info(); topBtns();
  }
  function topBtns() { const m = $('vbEd'); if (!m) return; const u = m.querySelector('[data-vbu]'), r = m.querySelector('[data-vbr]'); if (u) u.disabled = !E.undo.length; if (r) r.disabled = !E.redo.length; }
  function info() { const el = $('vbEd') && $('vbEd').querySelector('.vbInfo'); if (!el) return; const n = count(), vu = E.d.vu || 0.1; let b = bounds(); const sz = b ? [(b[3] - b[0] + 1) * vu * (E.d.zoom || 1), (b[4] - b[1] + 1) * vu * (E.d.zoom || 1), (b[5] - b[2] + 1) * vu * (E.d.zoom || 1)] : [0, 0, 0]; el.innerHTML = `블럭 <b>${n.toLocaleString()}</b> / ${MAXB.toLocaleString()} · 크기 ${sz.map((v) => v.toFixed(1)).join(' × ')}m`; el.classList.toggle('warn', n > MAXB * 0.9); }
  function bounds(id) { let b = null; const gs = id == null ? Object.keys(E.V) : [id]; for (const g of gs) for (const v of E.V[g].values()) { const s = v[3]; if (!b) b = [v[0], v[1], v[2], v[0] + s - 1, v[1] + s - 1, v[2] + s - 1]; else { b[0] = Math.min(b[0], v[0]); b[1] = Math.min(b[1], v[1]); b[2] = Math.min(b[2], v[2]); b[3] = Math.max(b[3], v[0] + s - 1); b[4] = Math.max(b[4], v[1] + s - 1); b[5] = Math.max(b[5], v[2] + s - 1); } } return b; }
  function autoPivot(id) {
    const q = E.d.groups[id], b = bounds(id), vu = E.d.vu || 0.1; if (!q || !b) return;
    const cx = ((b[0] + b[3] + 1) / 2) * vu, cz = ((b[2] + b[5] + 1) / 2) * vu;
    if (q.leg != null || q.arm != null) q.p = [+cx.toFixed(3), +((b[4] + 1) * vu).toFixed(3), +cz.toFixed(3)];
    else if (q.head) q.p = [+cx.toFixed(3), +(b[1] * vu).toFixed(3), +(b[2] * vu).toFixed(3)];
    else if (q.tail) q.p = [+cx.toFixed(3), +(((b[1] + b[4] + 1) / 2) * vu).toFixed(3), +((b[5] + 1) * vu).toFixed(3)];
    else q.p = [+cx.toFixed(3), +(((b[1] + b[4] + 1) / 2) * vu).toFixed(3), +cz.toFixed(3)];
  }
  function autoSeat() { const b = bounds(''), vu = E.d.vu || 0.1; if (!b) return; E.d.seat = [+(((b[0] + b[3] + 1) / 2) * vu).toFixed(3), +((b[4] + 1) * vu).toFixed(3), +(((b[2] + b[5] + 1) / 2) * vu).toFixed(3)]; }
  function moveGroup(id, ax, s) {
    const m = E.V[id], vu = E.d.vu || 0.1, a = { x: 0, y: 1, z: 2 }[ax], nm = new Map();
    for (const b of m.values()) { const nb = b.slice(); nb[a] += s; if (!inR(nb[a]) || (a === 1 && nb[1] < 0)) return toast('더 옮길 수 없어요', 1200); nm.set(ck(nb[0], nb[1], nb[2]), nb); }
    E.V[id] = nm; const q = E.d.groups[id]; if (q) q.p[a] = +(q.p[a] + s * vu).toFixed(3);
  }

  // ── 3D
  function gl() {
    const cv = $('vbCv'); if (!cv) return; const T = THREE;
    if (!E.R || E.R.domElement !== cv) {
      try { if (E.R) E.R.dispose(); } catch (e) { /* ignore */ }
      E.R = new T.WebGLRenderer({ canvas: cv, antialias: true }); E.R.outputEncoding = T.sRGBEncoding;
      E.sc = new T.Scene(); E.sc.background = new T.Color('#e6eef0');
      E.sc.add(new T.HemisphereLight(0xffffff, 0x8a8070, 0.8)); const dl = new T.DirectionalLight(0xffffff, 0.75); dl.position.set(3, 7, 5); E.sc.add(dl); const d2 = new T.DirectionalLight(0xffffff, 0.25); d2.position.set(-4, 3, -3); E.sc.add(d2);
      E.cam = new T.PerspectiveCamera(35, 1, 0.05, 200); E.tgt = new T.Vector3(0, 1, 0);
      input(cv);
    }
    const loop = () => {
      E.raf = requestAnimationFrame(loop);
      const m = $('vbEd'); if (!m || !m.classList.contains('show')) return;
      const w = cv.clientWidth, h = cv.clientHeight;
      if (cv.width !== Math.round(w * devicePixelRatio) || cv.height !== Math.round(h * devicePixelRatio)) { E.R.setPixelRatio(devicePixelRatio); E.R.setSize(w, h, false); E.cam.aspect = w / Math.max(1, h); E.cam.updateProjectionMatrix(); }
      E.cam.position.set(E.tgt.x + Math.sin(E.yaw) * Math.cos(E.pit) * E.dist, E.tgt.y + Math.sin(E.pit) * E.dist, E.tgt.z + Math.cos(E.yaw) * Math.cos(E.pit) * E.dist); E.cam.lookAt(E.tgt);
      E.t += 0.016;
      if (E.root && E.mode === 'detail') {
        const u = E.root.userData, wk = E.walk;
        (u.legs || []).forEach((l) => { l.p.userData.r0 = l.p.userData.r0 ?? l.p.rotation.x; l.p.rotation.x = l.p.userData.r0 + (wk ? Math.sin(E.t * 8 + l.ph) * 0.5 : 0); });
        (u.arms || []).forEach((l) => { l.p.userData.r0 = l.p.userData.r0 ?? l.p.rotation.x; l.p.rotation.x = l.p.userData.r0 + (wk ? Math.sin(E.t * 8 + l.ph) * 0.6 : 0); });
        if (u.tail) { u.tail.userData.r0 = u.tail.userData.r0 ?? u.tail.rotation.y; u.tail.rotation.y = u.tail.userData.r0 + (wk ? Math.sin(E.t * 6) * 0.4 : 0); }
        (u.heads || []).forEach((hd) => { hd.userData.r0 = hd.userData.r0 ?? hd.rotation.x; hd.rotation.x = hd.userData.r0 + (wk ? Math.sin(E.t * 8) * 0.06 : 0); });
        if (E.box) E.box.update();
      }
      E.R.render(E.sc, E.cam);
    };
    cancelAnimationFrame(E.raf); loop(); scene();
  }
  let ppl = null;
  function person() {
    if (ppl) return ppl; const T = THREE, g = new T.Group(), m = new T.MeshLambertMaterial({ color: '#7f8fa3', transparent: true, opacity: 0.35, depthWrite: false });
    const body = new T.Mesh(new T.CapsuleGeometry(0.3, 0.75, 4, 12), m); body.position.y = 0.75; g.add(body);
    const head = new T.Mesh(new T.SphereGeometry(0.38, 16, 12), m); head.position.y = 1.62; g.add(head);
    return (ppl = g);
  }
  function scene() {
    if (!E.sc) return; const T = THREE, V = VB(), d = E.d, vu = d.vu || 0.1;
    for (const o of [...E.sc.children]) if (o.userData.vbTmp) { E.sc.remove(o); o.traverse((x) => { if (x.geometry && !x.userData.keep) x.geometry.dispose(); }); }
    E.box = null;
    const add = (o) => { o.userData.vbTmp = 1; E.sc.add(o); return o; };
    // 바닥 격자 (블럭 칸 크기)
    const n = Math.min(80, Math.round(6 / vu)), grid = new T.GridHelper(n * vu, n, 0xb8a88a, 0xd6cab2); grid.position.set(0, 0.002, 0); add(grid);
    const fl = new T.Mesh(new T.PlaneGeometry(n * vu, n * vu), new T.MeshLambertMaterial({ color: '#efe6d6' })); fl.rotation.x = -Math.PI / 2; fl.userData.floor = 1; add(fl);
    // 앞쪽 표시
    const ar = new T.Mesh(new T.ConeGeometry(0.12, 0.3, 3), new T.MeshBasicMaterial({ color: '#c8501e' })); ar.rotation.x = Math.PI / 2; ar.position.set(0, 0.02, (n * vu) / 2 - 0.25); add(ar);
    // 모델
    const raw = E.mode !== 'detail';
    const dd = Object.assign({}, d, raw ? { zoom: 1 } : {});
    const vox = {}; for (const g in E.V) vox[g] = [...E.V[g].values()];
    E.root = V.vbBuild(dd, { vox, raw, edit: 1, tint: E.mode === 'part' || (raw && E.tint) ? (id) => grpCol(id) : null });
    add(E.root);
    if (E.ppl) { const p = person(); p.position.set((bounds() ? (bounds()[3] + 1) * vu * (raw ? 1 : d.zoom || 1) : 0) + 0.9, 0, 0); add(p); p.traverse((x) => { x.userData.keep = 1; }); }
    if (!raw) {
      if (d.t !== 'chr') { const st = new T.Mesh(new T.BoxGeometry(0.34, 0.06, 0.34), new T.MeshBasicMaterial({ color: '#ff5a8a', transparent: true, opacity: 0.7 })); st.position.fromArray(E.root.userData.seat); add(st); }
      const G = E.root.userData.G;
      if (E.sel && G[E.sel]) {
        const tg = G[E.sel]; E.box = new T.BoxHelper(tg, 0xff5a1f); add(E.box);
        const pv = new T.Mesh(new T.SphereGeometry(0.06, 12, 8), new T.MeshBasicMaterial({ color: '#ff5a1f', depthTest: false })); pv.renderOrder = 9; tg.add(pv); pv.userData.vbTmp = 1;
      }
    } else if (false) {
      // 지금 묶음을 살짝 표시
      const b = bounds(E.gid); if (b) { const h = new T.Box3(new T.Vector3(b[0] * vu, b[1] * vu, b[2] * vu), new T.Vector3((b[3] + 1) * vu, (b[4] + 1) * vu, (b[5] + 1) * vu)); add(new T.Box3Helper(h, 0x3d7fd1)); }
    }
    E.ghost = add(new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: '#3d7fd1', transparent: true, opacity: 0.35, depthWrite: false })));
    E.ghost.visible = false;
    const ge = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1, 1, 1)), new T.LineBasicMaterial({ color: '#1f4f8a' })); E.ghost.add(ge);
    info();
  }
  function fit() {
    const b = bounds(), vu = E.d.vu || 0.1, z = E.mode !== 'detail' ? 1 : E.d.zoom || 1;
    if (!b || !E.tgt) { if (E.tgt) E.tgt.set(0, 0.8, 0); E.dist = 6; return; }
    const c = [((b[0] + b[3] + 1) / 2) * vu * z, ((b[1] + b[4] + 1) / 2) * vu * z, ((b[2] + b[5] + 1) / 2) * vu * z], r = Math.max((b[3] - b[0] + 1), (b[4] - b[1] + 1), (b[5] - b[2] + 1)) * vu * z;
    E.tgt.set(c[0], c[1], c[2]); E.dist = Math.max(2, r * 2.4);
  }

  // ── 마우스
  function ray(e) { const cv = $('vbCv'), r = cv.getBoundingClientRect(), v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), rc = new THREE.Raycaster(); rc.setFromCamera(v, E.cam); return rc; }
  // 맞은 칸 (in: 블럭 안 · out: 쌓을 칸 · ax/sg: 맞은 면)
  function hit(e) {
    const rc = ray(e), vu = E.d.vu || 0.1, meshes = []; E.root.traverse((o) => { if (o.isMesh) meshes.push(o); });
    const h = rc.intersectObjects(meshes, false)[0];
    if (h && h.face) {
      const n = h.face.normal.clone(), p = h.point, ax = Math.abs(n.x) > 0.5 ? 0 : Math.abs(n.y) > 0.5 ? 1 : 2, sg = Math.sign(n.getComponent(ax));
      const pin = p.clone().addScaledVector(n, -vu * 0.5), pout = p.clone().addScaledVector(n, vu * 0.5);
      return { in: [Math.floor(pin.x / vu), Math.floor(pin.y / vu), Math.floor(pin.z / vu)], out: [Math.floor(pout.x / vu), Math.floor(pout.y / vu), Math.floor(pout.z / vu)], ax, sg };
    }
    const pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), q = new THREE.Vector3();
    if (rc.ray.intersectPlane(pl, q)) { const c = [Math.floor(q.x / vu), 0, Math.floor(q.z / vu)]; return { in: null, out: c, ax: 1, sg: 1, floor: 1 }; }
    return null;
  }
  // 쌓을 블럭 시작 칸 (크기 s: 맞은 면 반대쪽으로 붙이고 옆으로는 가운데)
  function origin(h, s) { const o = h.out.slice(); for (let a = 0; a < 3; a++) { if (a === h.ax) { if (h.sg < 0) o[a] -= s - 1; } else o[a] -= Math.floor((s - 1) / 2); } return o; }
  // 끌기: 시작 면에 붙은 판 위의 칸
  function planeCell(e, st) {
    const rc = ray(e), vu = E.d.vu || 0.1, ax = st.ax, layer = st.layer, nrm = new THREE.Vector3(); nrm.setComponent(ax, 1);
    const pl = new THREE.Plane(nrm, -(layer + 0.5) * vu), q = new THREE.Vector3(); if (!rc.ray.intersectPlane(pl, q)) return null;
    const c = [Math.floor(q.x / vu), Math.floor(q.y / vu), Math.floor(q.z / vu)]; c[ax] = layer; return c;
  }
  function rectCells(a, b, ax, step) { const out = [], u = (ax + 1) % 3, v = (ax + 2) % 3, u0 = Math.min(a[u], b[u]), u1 = Math.max(a[u], b[u]), v0 = Math.min(a[v], b[v]), v1 = Math.max(a[v], b[v]); for (let i = u0; i <= u1; i += step) for (let j = v0; j <= v1; j += step) { const c = a.slice(); c[u] = i; c[v] = j; out.push(c); } return out; }
  function showGhost(min, max, col) {
    const g = E.ghost; if (!g) return; const vu = E.d.vu || 0.1;
    g.visible = true; g.scale.set((max[0] - min[0] + 1) * vu, (max[1] - min[1] + 1) * vu, (max[2] - min[2] + 1) * vu); g.position.set(((min[0] + max[0] + 1) / 2) * vu, ((min[1] + max[1] + 1) / 2) * vu, ((min[2] + max[2] + 1) / 2) * vu);
    g.material.color.set(col);
  }
  function input(cv) {
    let dn = null;
    cv.onpointerdown = (e) => {
      cv.setPointerCapture(e.pointerId);
      dn = { b: e.button, x: e.clientX, y: e.clientY, mv: 0, lx: e.clientX, ly: e.clientY, h: null };
      if (E.mode === 'build' && e.button === 0) { const h = hit(e); if (h) { dn.h = h; const tool = E.tool; const c = tool === 'add' ? origin(h, E.size) : h.in || h.out; dn.st = { ax: h.ax, sg: h.sg, layer: c[h.ax], c0: c, g: (h.in && (occ().get(ck(...h.in)) || [''])[0]) || '' }; } }
      if (E.mode === 'part' && e.button === 0) { const h = hit(e); if (h && h.in) { dn.h = h; dn.st = { ax: h.ax, sg: h.sg, layer: h.in[h.ax], c0: h.in }; } }
    };
    cv.onpointermove = (e) => {
      if (!dn) { if (E.mode !== 'detail') hover(e); return; }
      const dx = e.clientX - dn.lx, dy = e.clientY - dn.ly; dn.mv += Math.abs(dx) + Math.abs(dy); dn.lx = e.clientX; dn.ly = e.clientY;
      const orbit = E.mode === 'detail' ? dn.b === 0 || dn.b === 2 : dn.b === 2 || e.altKey;
      if (orbit) { E.yaw -= dx * 0.01; E.pit = Math.max(-0.1, Math.min(1.5, E.pit + dy * 0.01)); return; }
      if (dn.b === 1) { const r = new THREE.Vector3(), u = new THREE.Vector3(); E.cam.matrixWorld.extractBasis(r, u, new THREE.Vector3()); const k = E.dist * 0.0015; E.tgt.addScaledVector(r, -dx * k).addScaledVector(u, dy * k); return; }
      if (E.mode === 'part' && dn.b === 0 && dn.st && dn.mv > 6) { const c = planeCell(e, dn.st); if (!c) return; dn.c1 = c; const a = dn.st.c0, mn = [0, 1, 2].map((i) => Math.min(a[i], c[i])), mxv = [0, 1, 2].map((i) => Math.max(a[i], c[i])); showGhost(mn, mxv, grpCol(E.gid)); return; }
      if (E.mode === 'build' && dn.b === 0 && dn.st && dn.mv > 6) {
        const c = planeCell(e, dn.st); if (!c) return; dn.c1 = c;
        const s = E.tool === 'add' ? E.size : 1, a = dn.st.c0, mn = [0, 1, 2].map((i) => Math.min(a[i], c[i])), mxv = [0, 1, 2].map((i) => Math.max(a[i], c[i]) + (E.tool === 'add' ? s - 1 : 0));
        if (E.tool === 'grp') { mn[dn.st.ax] = -64; mxv[dn.st.ax] = 63; const b = bounds(); if (b) { mn[dn.st.ax] = b[dn.st.ax]; mxv[dn.st.ax] = b[dn.st.ax + 3]; } }
        showGhost(mn, mxv, E.tool === 'del' ? '#e8505a' : E.tool === 'grp' ? grpCol(E.gid) : E.d.pal[E.col]);
      }
    };
    cv.onpointerup = (e) => {
      const d0 = dn; dn = null; if (!d0) return;
      if (E.mode === 'detail') { if (d0.mv < 5 && d0.b === 0) pickGroup(e); return; }
      if (E.mode === 'part') { if (d0.b !== 0) return; if (d0.mv > 6 && d0.st && d0.c1) { paintArea(d0.st, d0.c1); return; } if (d0.mv < 6 && d0.h) paint(d0.h); return; }
      if (d0.b === 2 && d0.mv < 5) { const h = hit(e); if (h && h.in) erase(h.in); return; }
      if (d0.b !== 0 || e.altKey) return;
      if (d0.mv > 6 && d0.st && d0.c1) { area(d0.st, d0.c1); return; }
      if (d0.mv < 6 && d0.h) click(d0.h);
    };
    cv.onpointerleave = () => { if (E.ghost) E.ghost.visible = false; };
    cv.onwheel = (e) => { e.preventDefault(); E.dist = Math.max(0.8, Math.min(30, E.dist * (e.deltaY > 0 ? 1.1 : 0.9))); };
  }
  function hover(e) {
    if (!E.root) return; const h = hit(e); if (!h) { E.ghost.visible = false; return; }
    if (E.mode === 'part') { if (!h.in) { E.ghost.visible = false; return; } const r = E.brush, o = h.in.map((v, i) => (i === h.ax ? v : v - Math.floor((r - 1) / 2))), m2 = o.map((v, i) => (i === h.ax ? v : v + r - 1)); showGhost(o, m2, grpCol(E.gid)); return; }
    if (E.tool === 'add') { const o = origin(h, E.size), s = E.size; showGhost(o, [o[0] + s - 1, o[1] + s - 1, o[2] + s - 1], E.d.pal[E.col] || '#3d7fd1'); }
    else if (E.tool === 'del' && h.in) { const r = E.er, o = h.in.map((v) => v - Math.floor((r - 1) / 2)); showGhost(o, [o[0] + r - 1, o[1] + r - 1, o[2] + r - 1], '#e8505a'); }
    else if (h.in) showGhost(h.in, h.in, E.tool === 'grp' ? grpCol(E.gid) : '#ffffff');
    else E.ghost.visible = false;
  }
  function click(h) {
    if (E.tool === 'add') {
      const o = origin(h, E.size), s = E.size; push();
      const hg = h.in && occ().get(ck(...h.in)), g = hg ? hg[0] : '', g2 = MIRP[g] && E.V[MIRP[g]] ? MIRP[g] : g;
      let ok = put(o[0], o[1], o[2], s, E.col, g);
      if (E.mir) { const x2 = mx(o[0], s); if (x2 !== o[0]) ok = put(x2, o[1], o[2], s, E.col, g2) || ok; }
      if (!ok) { E.undo.pop(); if (count() >= MAXB) toast(`블럭은 ${MAXB.toLocaleString()}개까지예요`, 1600); return; }
      changed();
    } else if (E.tool === 'del') { if (h.in) erase(h.in); }
    else if (E.tool === 'pick') { if (!h.in) return; const o = occ().get(ck(...h.in)); if (!o) return; E.col = E.V[o[0]].get(o[1])[4]; E.tool = 'add'; left(); toast('💧 색을 집었어요', 900); }
    else if (E.tool === 'grp') { if (!h.in) return; push(); let ok = grpCell(...h.in); if (E.mir) { const c = h.in.slice(); c[0] = -c[0] - 1; ok = grpCell(...c) || ok; } if (!ok) { E.undo.pop(); return; } changed(true); }
  }
  function erase(c) {
    const r = E.er, o = c.map((v) => v - Math.floor((r - 1) / 2)); push(); let ok = false;
    for (let i = 0; i < r; i++) for (let j = 0; j < r; j++) for (let k = 0; k < r; k++) { ok = delCell(o[0] + i, o[1] + j, o[2] + k) || ok; if (E.mir) ok = delCell(-(o[0] + i) - 1, o[1] + j, o[2] + k) || ok; }
    if (!ok) { E.undo.pop(); return; } changed(true);
  }
  function area(st, c1) {
    push(); let n = 0; const ax = st.ax;
    if (E.tool === 'add') {
      const s = E.size, g = st.g || ''; for (const c of rectCells(st.c0, c1, ax, s)) { if (put(c[0], c[1], c[2], s, E.col, g)) n++; if (E.mir) { const x2 = mx(c[0], s); if (x2 !== c[0] && put(x2, c[1], c[2], s, E.col, MIRP[g] && E.V[MIRP[g]] ? MIRP[g] : g)) n++; } }
    } else if (E.tool === 'del') {
      const r = E.er; for (const c of rectCells(st.c0, c1, ax, 1)) for (let k = 0; k < r; k++) { const q = c.slice(); q[ax] -= k * (st.sg || 1); if (delCell(...q)) n++; if (E.mir && delCell(-q[0] - 1, q[1], q[2])) n++; }
    } else if (E.tool === 'grp') {
      const b = bounds(); if (b) for (const c of rectCells(st.c0, c1, ax, 1)) for (let t = b[ax]; t <= b[ax + 3]; t++) { const q = c.slice(); q[ax] = t; if (grpCell(...q)) n++; if (E.mir && grpCell(-q[0] - 1, q[1], q[2])) n++; }
    }
    if (E.ghost) E.ghost.visible = false;
    if (!n) { E.undo.pop(); return; }
    changed(E.tool === 'grp' || E.tool === 'del');
  }
  function pickGroup(e) {
    const rc = ray(e), meshes = []; E.root.traverse((o) => { if (o.isMesh && o.userData.vbg != null) meshes.push(o); });
    const h = rc.intersectObjects(meshes, false)[0]; E.sel = h ? h.object.userData.vbg : ''; side(); scene();
  }
  function undo() { if (!E.undo.length) return; E.redo.push(snap()); const d = JSON.parse(E.undo.pop()); load(d); changed(true); }
  function redo() { if (!E.redo.length) return; E.undo.push(snap()); const d = JSON.parse(E.redo.pop()); load(d); changed(true); }

  // ── 새로 만들기
  function newDlg(t0) {
    const V = VB();
    V.confirmBox(`<h3>＋ 새로 만들기</h3><p class="small muted">무엇을 만들까요?</p>
      <div class="vbSeg vbKind"><button type="button" data-nk="veh" class="${(t0 || 'veh') === 'veh' ? 'on' : ''}">🐾 탈것</button><button type="button" data-nk="pet" class="${t0 === 'pet' ? 'on' : ''}">🐶 펫</button><button type="button" data-nk="chr" class="${t0 === 'chr' ? 'on' : ''}">🧍 캐릭터</button></div>
      <div class="vbPick"><label><input type="radio" name="vbtp" value="base" checked> <span data-nkb>기본 모양에서 시작</span></label>
      <label><input type="radio" name="vbtp" value="empty"> 빈 판에서 쌓기</label>
      <label><input type="radio" name="vbtp" value="photo"> 📷 사진으로 모양 잡기</label></div>`, () => {
      const v = (document.querySelector('input[name=vbtp]:checked') || {}).value || 'empty', t = E._nk || 'veh';
      saveDraft(); E.k = newKey(); load(tpl(v === 'photo' || v === 'empty' ? 'empty' : t === 'chr' ? 'chr' : t === 'pet' ? 'pet' : 'animal', t)); E.undo = []; E.redo = []; E.mode = 'build'; E.gid = ''; saveDraft(); changed(true); fit();
      if (v === 'photo') setTimeout(photoDlg, 50);
    });
    E._nk = t0 || 'veh';
    const m = $('confirm'), lab = { veh: '네발 동물 기본 모양', pet: '작은 동물 기본 모양 (펫 크기)', chr: '기본 사람 모양 (머리·몸·팔·다리)' };
    const sync = () => { m.querySelectorAll('[data-nk]').forEach((b) => b.classList.toggle('on', b.dataset.nk === E._nk)); const l = m.querySelector('[data-nkb]'); if (l) l.textContent = lab[E._nk]; };
    m.querySelectorAll('[data-nk]').forEach((b) => (b.onclick = () => { E._nk = b.dataset.nk; sync(); })); sync();
  }

  // ── 구역 나누기 (v110)
  function ensurePart(id) {
    if (!id) return; if (!E.V[id]) E.V[id] = new Map();
    if (!E.d.groups[id]) { const pr = partsOf().find((q) => q[0] === id); E.d.groups[id] = Object.assign({ nm: pr ? pr[1] : '구역', p: [0, 0.5, 0] }, pr ? JSON.parse(JSON.stringify(pr[2])) : {}); }
  }
  function assignCell(x, y, z, gid) { const h = occ().get(ck(x, y, z)); if (!h || h[0] === gid) return false; const b = E.V[h[0]].get(h[1]); E.V[h[0]].delete(h[1]); E.V[gid].set(h[1], b); E.occ = null; return true; }
  // 누른 칸부터 블럭이 이어진 데까지 (맞은 면 안쪽 방향으로)
  function paintRun(c, ax, sg, gid) {
    const o = occ(); let n = 0, q = c.slice();
    // 겉면 찾기: 조금 바깥에서 안쪽으로
    q[ax] += sg * 2; let k = 0; while (!o.has(ck(...q)) && k < 6) { q[ax] -= sg; k++; }
    while (o.has(ck(...q)) && inR(q[ax])) { if (assignCell(q[0], q[1], q[2], gid)) n++; q[ax] -= sg; }
    return n;
  }
  function paintAt(c, ax, sg) {
    const gid = E.gid; ensurePart(gid); const r = E.brush, u = (ax + 1) % 3, v = (ax + 2) % 3, off = Math.floor((r - 1) / 2); let n = 0; const touched = new Set([gid]);
    for (let i = 0; i < r; i++) for (let j = 0; j < r; j++) {
      const q = c.slice(); q[u] += i - off; q[v] += j - off; n += paintRun(q, ax, sg, gid);
      if (E.mir) { const g2 = MIRP[gid] || gid; ensurePart(g2); touched.add(g2); const m2 = q.slice(); m2[0] = -m2[0] - 1; n += paintRun(m2, ax, ax === 0 ? -sg : sg, g2); }
    }
    touched.forEach((g) => { if (g) autoPivot(g); });
    return n;
  }
  function paint(h) { push(); const n = paintAt(h.in, h.ax, h.sg); if (!n) { E.undo.pop(); return; } changed(true); }
  function paintArea(st, c1) {
    push(); let n = 0; const b0 = E.brush; E.brush = 1;
    for (const c of rectCells(st.c0, c1, st.ax, 1)) n += paintAt(c, st.ax, st.sg);
    E.brush = b0; if (E.ghost) E.ghost.visible = false;
    if (!n) { E.undo.pop(); return; } changed(true);
  }
  // 낱칸으로 풀기 / 다시 묶기
  function unpack() { const out = new Map(); for (const g in E.V) for (const b of E.V[g].values()) { const s = b[3]; for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) for (let k = 0; k < s; k++) out.set(ck(b[0] + i, b[1] + j, b[2] + k), { x: b[0] + i, y: b[1] + j, z: b[2] + k, g, c: b[4] }); } return out; }
  function repack(cells) { const by = {}; for (const id of ['', ...Object.keys(E.d.groups)]) by[id] = new Map(); for (const q of cells.values()) { if (!by[q.g]) by[q.g] = new Map(); by[q.g].set(ck(q.x, q.y, q.z), [q.x, q.y, q.z, 1, q.c]); } E.V = {}; for (const g in by) E.V[g] = pack(by[g]); E.occ = null; }
  function autoSplit() {
    const C = unpack(); if (!C.size) return 0; const b = bounds(); const has = (x, y, z) => C.has(ck(x, y, z)); const set = (q, g) => { q.g = g; };
    for (const q of C.values()) q.g = '';
    const used = new Set();
    if (E.d.t === 'chr') {
      const H = b[4] - b[1] + 1, yh = b[1] + Math.round(H * 0.72), yl = b[1] + Math.round(H * 0.42);
      for (const q of C.values()) {
        if (q.y >= yh) set(q, 'h'); else if (q.y < yl) set(q, q.x >= 0 ? 'll' : 'lr');
        else { // 가운데: x=0 에서 이어진 줄 = 몸통, 나머지 = 팔
          let inT = false; const dir = q.x >= 0 ? -1 : 1; let x = q.x; inT = true; while (x !== 0 && x !== -1) { x += dir; if (!has(x, q.y, q.z)) { inT = false; break; } } set(q, inT ? 'b' : q.x >= 0 ? 'al' : 'ar');
        }
      }
    } else {
      const comps = (y) => { const seen = new Set(), L = []; for (const q of C.values()) { if (q.y !== y || seen.has(ck(q.x, y, q.z))) continue; const st = [[q.x, q.z]]; seen.add(ck(q.x, y, q.z)); let n = 0; while (st.length) { const [x, z] = st.pop(); n++; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = ck(x + dx, y, z + dz); if (C.has(k) && !seen.has(k)) { seen.add(k); st.push([x + dx, z + dz]); } } } L.push(n); } return L.length; };
      let legTop = -999; const y0 = b[1], H = b[4] - b[1] + 1;
      if (comps(y0) >= 2) { legTop = y0; while (legTop + 1 < y0 + H * 0.6 && comps(legTop + 1) >= 2) legTop++; }
      const midZ = (b[2] + b[5] + 1) / 2;
      if (legTop >= y0) {
        // 다리 덩어리 (3D, 다리 구간 안에서만)
        const seen = new Set(), L = [];
        for (const q of C.values()) { if (q.y !== y0 || seen.has(ck(q.x, q.y, q.z))) continue; const st = [q], mem = []; seen.add(ck(q.x, q.y, q.z)); while (st.length) { const p = st.pop(); mem.push(p); for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) { const k = ck(p.x + dx, p.y + dy, p.z + dz), r = C.get(k); if (r && r.y <= legTop && !seen.has(k)) { seen.add(k); st.push(r); } } } L.push(mem); }
        for (const mem of L) {
          const parts = mem.some((p) => p.x >= 0) && mem.some((p) => p.x < 0) && mem.length > 6 ? [mem.filter((p) => p.x >= 0), mem.filter((p) => p.x < 0)] : [mem];
          for (const pm of parts) { if (!pm.length) continue; const cz = pm.reduce((a, p) => a + p.z + 0.5, 0) / pm.length, cx = pm.reduce((a, p) => a + p.x + 0.5, 0) / pm.length; const id = (cz >= midZ ? 'lf' : 'lb') + (cx >= 0 ? 'l' : 'r'); pm.forEach((p) => set(p, id)); used.add(id); }
        }
      }
      const top = Math.max(legTop, y0 - 1), len = b[5] - b[2] + 1, hz = b[5] - Math.round(len * 0.3), yMid = top + Math.max(1, Math.round((b[4] - top) * 0.35)), tz = b[2] + Math.round(len * 0.18);
      const wAt = {}; for (const q of C.values()) if (q.y > top) { const w = wAt[q.z] || (wAt[q.z] = [99, -99]); w[0] = Math.min(w[0], q.x); w[1] = Math.max(w[1], q.x); }
      let wMax = 1; for (const z in wAt) wMax = Math.max(wMax, wAt[z][1] - wAt[z][0] + 1);
      for (const q of C.values()) { if (q.y <= top) continue; if (q.z >= hz && q.y >= yMid) set(q, 'h'); else if (q.z <= tz && wAt[q.z] && wAt[q.z][1] - wAt[q.z][0] + 1 < wMax * 0.5) set(q, 't'); }
    }
    const ids = new Set([...C.values()].map((q) => q.g)); ids.forEach((id) => ensurePart(id));
    repack(C); ids.forEach((id) => { if (id) autoPivot(id); });
    if (E.d.t === 'veh') autoSeat();
    return [...ids].filter((id) => E.V[id] && E.V[id].size).length;
  }

  // ── ✨ 다듬기 (v110): 튀어나온 블럭 빼기 · 작은 구멍 메우기 · 모서리 둥글게 · 얼룩진 색 맞추기
  function smoothDlg() { E.mode = 'build'; side(); doSmooth(E.sm); }
  function doSmooth(level) {
    const C = unpack(); if (!C.size) return; push();
    const N6 = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], N26 = []; for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) if (x || y || z) N26.push([x, y, z]);
    const passes = level >= 3 ? 2 : 1, corner = level === 1 ? 0 : level === 2 ? 7 : 8;
    for (let it = 0; it < passes; it++) {
      const cur = new Map(C), cand = new Set();
      for (const q of cur.values()) for (const [dx, dy, dz] of N6) { const k = ck(q.x + dx, q.y + dy, q.z + dz); if (!cur.has(k) && q.y + dy >= 0) cand.add(k); }
      // 구멍 메우기: 6면 중 4면 이상이 막힌 빈칸
      for (const k of cand) { const [x, y, z] = k.split(',').map(Number); const nb = N6.map(([dx, dy, dz]) => cur.get(ck(x + dx, y + dy, z + dz))).filter(Boolean); if (nb.length >= 4) { const cnt = {}; nb.forEach((r) => { const key = r.g + '|' + r.c; cnt[key] = (cnt[key] || 0) + 1; }); const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0].split('|'); C.set(k, { x, y, z, g: best[0], c: +best[1] }); } }
      // 튀어나온 블럭 · 모서리
      for (const [k, q] of cur) { const n6 = N6.filter(([dx, dy, dz]) => cur.has(ck(q.x + dx, q.y + dy, q.z + dz))).length; if (n6 <= 1 && q.y > 0) { C.delete(k); continue; } if (corner && q.y > 0) { const n26 = N26.filter(([dx, dy, dz]) => cur.has(ck(q.x + dx, q.y + dy, q.z + dz))).length; if (n26 <= corner && n6 <= 3) C.delete(k); } }
    }
    // 색 맞추기: 겉면 블럭 중 주변과 혼자 다른 색
    const snap0 = new Map(C);
    for (const q of C.values()) { const nb = N6.map(([dx, dy, dz]) => snap0.get(ck(q.x + dx, q.y + dy, q.z + dz))).filter(Boolean); if (nb.length === 6 || nb.some((r) => r.c === q.c)) continue; const cnt = {}; nb.forEach((r) => { cnt[r.c] = (cnt[r.c] || 0) + 1; }); const best = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0]; if (best && best[1] >= (level >= 2 ? 2 : 3)) q.c = +best[0]; }
    if (C.size > MAXB * 1.6) { E.undo.pop(); toast('블럭이 너무 많아져요', 1600); return; }
    const before = count(); repack(C); if (count() > MAXB) { const d = JSON.parse(E.undo.pop()); load(d); toast(`다듬으면 블럭이 ${MAXB.toLocaleString()}개를 넘어요`, 1800); changed(true); return; }
    changed(true); toast(`✨ 다듬었어요 (블럭 ${before.toLocaleString()} → ${count().toLocaleString()}) · 마음에 안 들면 ↶`, 2200);
  }

  // ── 저장 · 불러오기 (v110)
  function saveDlg() {
    const V = VB();
    V.confirmBox(`<h3>💾 저장</h3><p class="small muted">이 컴퓨터(브라우저)에 저장해요 · 만드는 중에도 자동으로 저장돼요. 다른 컴퓨터에서 이어서 하려면 「파일로 내보내기」로 받아 두세요</p>
      <label class="vbF" style="text-align:left">이름<input type="text" id="vbSn" maxlength="14" value="${esc(E.d.n)}"></label>
      <p><button type="button" class="sm" data-vbcopy>📄 다른 이름으로 하나 더 저장</button> <button type="button" class="sm" data-vbfile>⬇ 파일로 내보내기</button></p>`, () => { E.d.n = ($('vbSn').value || E.d.n).replace(/[<>]/g, '').slice(0, 14); saveDraft(); ui(); toast('💾 저장했어요', 1200); });
    const m = $('confirm');
    m.querySelector('[data-vbcopy]').onclick = () => { m.classList.remove('show'); E.d.n = ($('vbSn').value || E.d.n).replace(/[<>]/g, '').slice(0, 12) + ' 2'; E.k = newKey(); saveDraft(); ui(); toast('📄 새 이름으로 하나 더 저장했어요', 1400); };
    m.querySelector('[data-vbfile]').onclick = () => { const d = data(); d.n = ($('vbSn').value || d.n).slice(0, 14); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d)], { type: 'application/json' })); a.download = (d.n || 'block') + '.json'; document.body.appendChild(a); a.click(); a.remove(); };
  }
  function loadDlg() {
    const V = VB(); saveDraft(); const dr = drafts(), all = {};
    for (const k in dr) all[k] = { d: dr[k], where: '내 컴퓨터' };
    for (const k in V.VBX.local) all[k] = { d: all[k] ? all[k].d : V.VBX.local[k], where: (all[k] ? '내 컴퓨터 · ' : '') + '내 화면에서만' };
    for (const k in V.VBX.map) all[k] = { d: all[k] ? all[k].d : V.VBX.map[k], where: (all[k] ? all[k].where + ' · ' : '') + '게임에 있음' };
    const TI = { veh: '🐾 탈것', chr: '🧍 캐릭터', pet: '🐶 펫' }, ks = Object.keys(all).sort((a, b) => ((all[b].d.at || 0) - (all[a].d.at || 0)));
    V.confirmBox(`<h3>📂 불러오기</h3><div class="vbLd">${ks.map((k) => { const x = all[k], nb = Object.values(x.d.vox || {}).reduce((a, v) => a + Math.round(v.length * 0.75 / 4), 0); return `<div class="vbLr ${k === E.k ? 'on' : ''}"><button type="button" class="vbLo" data-ldo="${k}"><b>${esc(x.d.n || k)}</b><small>${TI[x.d.t] || TI.veh} · 블럭 ${nb.toLocaleString()} · ${x.where}${x.d.at ? ' · ' + new Date(x.d.at).toLocaleDateString() : ''}</small></button>${dr[k] ? `<button type="button" class="vbLx" data-ldx="${k}" aria-label="지우기">지우기</button>` : ''}</div>`; }).join('') || '<p class="small muted">저장된 것이 없어요</p>'}</div>
      <p><button type="button" class="sm" data-ldfile>⬆ 파일에서 불러오기</button><input type="file" accept=".json,application/json" data-ldin hidden></p>`, () => {});
    const m = $('confirm'), yes = $('cfYes'); if (yes) yes.style.display = 'none';
    const done = () => { if (yes) yes.style.display = ''; m.classList.remove('show'); };
    const no = $('cfNo'); if (no) { no.textContent = '닫기'; const o = no.onclick; no.onclick = () => { if (yes) yes.style.display = ''; no.textContent = '취소'; o && o(); }; }
    m.querySelectorAll('[data-ldo]').forEach((b) => (b.onclick = () => { const k = b.dataset.ldo, d = all[k] && all[k].d; if (!d) return; done(); E.k = k; load(d); E.undo = []; E.redo = []; E.mode = 'build'; saveDraft(); changed(true); fit(); toast(`📂 「${d.n}」을(를) 불러왔어요`, 1400); }));
    m.querySelectorAll('[data-ldx]').forEach((b) => (b.onclick = () => { const k = b.dataset.ldx; if (!confirm(`「${(dr[k] || {}).n || k}」을(를) 이 컴퓨터에서 지울까요? (게임에 등록된 것은 그대로예요)`)) return; const o = drafts(); delete o[k]; try { localStorage.setItem(DRAFT, JSON.stringify(o)); } catch (e) { /* ignore */ } b.closest('.vbLr').remove(); }));
    const fi = m.querySelector('[data-ldin]'); m.querySelector('[data-ldfile]').onclick = () => fi.click();
    fi.onchange = () => { const f = fi.files[0]; if (!f) return; f.text().then((t) => { try { const d = JSON.parse(t); if (!d || typeof d.vox !== 'object') throw 0; done(); E.k = newKey(); load(d); E.undo = []; E.redo = []; saveDraft(); changed(true); fit(); toast('📂 파일에서 불러왔어요', 1400); } catch (e) { toast('이 편집기 파일이 아니에요', 1600); } }); };
  }

  // ── 사진 → 블럭 (옆모습 사진: 배경을 지우고 → 두께를 줘서 둥글게 → 사진 색)
  function photoDlg() {
    const V = VB();
    V.confirmBox(`<h3>📷 사진으로 모양 잡기</h3><p class="small muted">옆에서 찍은 사진(배경이 단순하거나 투명한 그림)을 넣으면 비슷한 블럭 모양을 만들어요. 다 만든 뒤 블럭으로 조금씩 고치면 돼요</p>
      <input type="file" accept="image/*" id="vbPf">
      <canvas id="vbPv" width="200" height="120" class="vbPv"></canvas>
      <div class="vbPf">
      <label>가로 블럭 <select id="vbPw"><option>24</option><option selected>32</option><option>40</option><option>48</option></select></label>
      <label>실제 길이 <select id="vbPl"><option value="1.6">1.6m</option><option value="2.2">2.2m</option><option value="2.8" selected>2.8m</option><option value="3.6">3.6m</option></select></label>
      <label>몸 두께 <select id="vbPt"><option value=".16">얇게</option><option value=".24" selected>보통</option><option value=".32">두껍게</option></select></label>
      <label>얼굴 방향 <select id="vbPd"><option value="1">오른쪽</option><option value="-1">왼쪽</option></select></label>
      <label>색 수 <select id="vbPk"><option>6</option><option selected>10</option><option>16</option></select></label>
      <label>배경 지우기 <select id="vbPb"><option value="28">약하게</option><option value="44" selected>보통</option><option value="64">세게</option></select></label>
      </div><label class="vbChk"><input type="checkbox" id="vbPg" checked> 다리를 찾아 따로 나누기 (걸을 때 움직여요)</label>`, () => {
      const im = E._pimg; if (!im) { toast('사진을 먼저 골라 주세요', 1500); return; }
      const o = { w: +$('vbPw').value, len: +$('vbPl').value, th: +$('vbPt').value, dir: +$('vbPd').value, k: +$('vbPk').value, bg: +$('vbPb').value, legs: $('vbPg').checked };
      const r = fromPhoto(im, o); if (!r) { toast('사진에서 모양을 찾지 못했어요 · 배경이 단순한 사진으로 해 보세요', 2400); return; }
      { let n = 0; for (const g in r.V) n += r.V[g].size; if (n > MAXB) { toast(`블럭이 ${n.toLocaleString()}개라 너무 많아요 · 가로 블럭을 줄이거나 얇게 해 보세요`, 2600); return; } }
      push(); E.d.vu = r.vu; E.d.pal = r.pal; E.d.groups = r.groups; E.V = r.V; E.gid = ''; E.sel = ''; E.col = 0; if (E.d.t !== 'chr') { autoSeat(); } E.mode = 'build'; changed(true); fit();
      toast(`📷 블럭 ${count().toLocaleString()}개로 만들었어요 · 마음에 안 들면 ↶`, 2400);
    });
    E._pimg = null;
    const f = $('vbPf'), pv = $('vbPv');
    const redraw = () => { const im = E._pimg; if (!im) return; const o = { w: +$('vbPw').value, bg: +$('vbPb').value }; const s = sample(im, Math.min(80, o.w * 2)), M = mask(s, o.bg), x = pv.getContext('2d'); x.clearRect(0, 0, 200, 120); const k = Math.min(200 / s.w, 120 / s.h); for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) { const a = (j * s.w + i) * 4; x.fillStyle = M[j * s.w + i] ? `rgb(${s.d[a]},${s.d[a + 1]},${s.d[a + 2]})` : '#eee'; x.fillRect(i * k, j * k, Math.ceil(k), Math.ceil(k)); } };
    f.onchange = () => { const file = f.files[0]; if (!file) return; const im = new Image(); im.onload = () => { E._pimg = im; redraw(); }; im.src = URL.createObjectURL(file); };
    ['vbPw', 'vbPb'].forEach((id) => ($(id).onchange = redraw));
  }
  function sample(im, w) { const h = Math.max(4, Math.min(80, Math.round((w * im.naturalHeight) / im.naturalWidth))), cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, w, h); return { w, h, d: x.getImageData(0, 0, w, h).data }; }
  function mask(s, thr) {
    const { w, h, d } = s, M = new Uint8Array(w * h); let tr = 0;
    for (let i = 0; i < w * h; i++) if (d[i * 4 + 3] < 128) tr++;
    if (tr > w * h * 0.04) { for (let i = 0; i < w * h; i++) M[i] = d[i * 4 + 3] >= 128 ? 1 : 0; }
    else {
      // 테두리 색과 비슷한 곳을 바깥부터 채워서 배경으로 봐요
      const bg = new Uint8Array(w * h), st = [], near = (i, j) => { const a = i * 4, b = j * 4; return Math.abs(d[a] - d[b]) + Math.abs(d[a + 1] - d[b + 1]) + Math.abs(d[a + 2] - d[b + 2]) < thr * 1.6; };
      for (let x = 0; x < w; x++) { st.push([x, 0, x]); st.push([x + (h - 1) * w, 0, x + (h - 1) * w]); }
      for (let y = 0; y < h; y++) { st.push([y * w, 0, y * w]); st.push([y * w + w - 1, 0, y * w + w - 1]); }
      while (st.length) { const [i, , ref] = st.pop(); if (bg[i] || !near(i, ref)) continue; bg[i] = 1; const x = i % w, y = (i / w) | 0; if (x > 0) st.push([i - 1, 0, i]); if (x < w - 1) st.push([i + 1, 0, i]); if (y > 0) st.push([i - w, 0, i]); if (y < h - 1) st.push([i + w, 0, i]); }
      for (let i = 0; i < w * h; i++) M[i] = bg[i] ? 0 : 1;
    }
    // 가장 큰 덩어리만 남기기
    const lab = new Int32Array(w * h).fill(-1), sizes = []; let id = 0;
    for (let i = 0; i < w * h; i++) { if (!M[i] || lab[i] >= 0) continue; let n = 0; const st = [i]; lab[i] = id; while (st.length) { const j = st.pop(); n++; const x = j % w, y = (j / w) | 0; for (const k of [x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1, y > 0 ? j - w : -1, y < h - 1 ? j + w : -1]) if (k >= 0 && M[k] && lab[k] < 0) { lab[k] = id; st.push(k); } } sizes.push(n); id++; }
    if (!sizes.length) return M; const big = Math.max(...sizes);
    for (let i = 0; i < w * h; i++) if (M[i] && sizes[lab[i]] < big * 0.06) M[i] = 0;
    return M;
  }
  function kmeans(px, K) {
    let C = []; for (let i = 0; i < K; i++) C.push(px[Math.floor(((i + 0.5) / K) * px.length)].slice());
    let asg = new Int32Array(px.length);
    for (let it = 0; it < 12; it++) {
      const sum = C.map(() => [0, 0, 0, 0]);
      for (let p = 0; p < px.length; p++) { const q = px[p]; let bi = 0, bd = 1e9; for (let j = 0; j < C.length; j++) { const c = C[j], dd = (q[0] - c[0]) ** 2 + (q[1] - c[1]) ** 2 + (q[2] - c[2]) ** 2; if (dd < bd) { bd = dd; bi = j; } } asg[p] = bi; const s = sum[bi]; s[0] += q[0]; s[1] += q[1]; s[2] += q[2]; s[3]++; }
      C = sum.map((s, j) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : C[j]));
    }
    return { C, asg };
  }
  function fromPhoto(im, o) {
    const s0 = sample(im, o.w), M0 = mask(s0, o.bg);
    // 모양이 있는 곳만 잘라내기
    let x0 = s0.w, x1 = -1, y0 = s0.h, y1 = -1; for (let y = 0; y < s0.h; y++) for (let x = 0; x < s0.w; x++) if (M0[y * s0.w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (x1 < 0 || x1 - x0 < 3 || y1 - y0 < 3) return null;
    const W = x1 - x0 + 1, H = y1 - y0 + 1, at = (x, y) => (x >= 0 && y >= 0 && x < W && y < H ? M0[(y + y0) * s0.w + x + x0] : 0), px = (x, y) => { const a = ((y + y0) * s0.w + x + x0) * 4; return [s0.d[a], s0.d[a + 1], s0.d[a + 2]]; };
    // 가장자리까지 거리 (둥근 몸 두께)
    const D = new Float32Array(W * H); for (let i = 0; i < W * H; i++) D[i] = at(i % W, (i / W) | 0) ? 1e9 : 0;
    const pass = (xs, ys, nb) => { for (const y of ys) for (const x of xs) { const i = y * W + x; if (!D[i]) continue; for (const [dx, dy, c] of nb) { const X = x + dx, Y = y + dy, v = X < 0 || Y < 0 || X >= W || Y >= H ? 0 : D[Y * W + X]; if (v + c < D[i]) D[i] = v + c; } } };
    const rx = [...Array(W).keys()], ry = [...Array(H).keys()];
    pass(rx, ry, [[-1, 0, 1], [0, -1, 1], [-1, -1, 1.41], [1, -1, 1.41]]); pass(rx.slice().reverse(), ry.slice().reverse(), [[1, 0, 1], [0, 1, 1], [1, 1, 1.41], [-1, 1, 1.41]]);
    let dmax = 1; for (const v of D) if (v < 1e8) dmax = Math.max(dmax, v);
    const Tmax = Math.max(2, Math.round(H * o.th * 1.1));
    // 가장자리 픽셀은 배경색이 섞여 있어서, 안쪽(가장자리에서 먼) 이웃 색을 써요
    const pxIn = (x, y) => { if (D[y * W + x] > 1.5) return px(x, y); let bx = x, by = y, bd = D[y * W + x]; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const v = D[Y * W + X]; if (v < 1e8 && v > bd) { bd = v; bx = X; by = Y; } } return px(bx, by); };
    // 색
    const all = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y)) all.push(pxIn(x, y));
    const { C, asg } = kmeans(all, Math.min(o.k, all.length));
    const hex = (c) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
    const pal = C.map(hex); const cidx = new Int32Array(W * H).fill(-1); { let p = 0; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (at(x, y)) cidx[y * W + x] = asg[p++]; }
    // 다리 찾기: 아래 40% 띠에서 바닥에 닿은 좁은 덩어리
    const legOf = new Int32Array(W * H).fill(-1), legs = [];
    if (o.legs) {
      // 맨 아래 줄부터 위로: 한 줄에 덩어리가 2개 이상인 곳까지가 다리 구간
      const runs = (y) => { let n = 0, inn = false; for (let x = 0; x < W; x++) { const v = at(x, y); if (v && !inn) n++; inn = !!v; } return n; };
      const r0 = runs(H - 1); let top = H; if (r0 >= 2) for (let y = H - 1; y >= 0 && runs(y) >= r0; y--) top = y;
      if (top < H - 1 && top > H * 0.35) {
        const lab = new Int32Array(W * H).fill(-1); let id = 0;
        for (let y = top; y < H; y++) for (let x = 0; x < W; x++) {
          const i = y * W + x; if (!at(x, y) || lab[i] >= 0) continue; const st = [i], mem = []; lab[i] = id;
          while (st.length) { const j = st.pop(); mem.push(j); const X = j % W, Y = (j / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = X + dx, ny = Y + dy; if (nx < 0 || nx >= W || ny < top || ny >= H) continue; const k = ny * W + nx; if (at(nx, ny) && lab[k] < 0) { lab[k] = id; st.push(k); } } }
          const xs = mem.map((j) => j % W), ys = mem.map((j) => (j / W) | 0), w = Math.max(...xs) - Math.min(...xs) + 1;
          if (Math.max(...ys) >= H - 2 && mem.length >= 2 && w <= W * 0.35) legs.push({ mem, cx: (Math.max(...xs) + Math.min(...xs)) / 2, w, top: top - 1 });
          id++;
        }
      }
      if (legs.length < 2 || legs.length > 6) legs.length = 0;
      else { legs.sort((a, b) => (b.cx - a.cx) * o.dir); legs.forEach((L, li) => L.mem.forEach((j) => { legOf[j] = li; })); }
    }
    const vu = +(o.len / W).toFixed(3), V = { '': new Map() }, groups = {}, cx = W / 2;
    const zOf = (x) => Math.round((x - cx) * o.dir), yOf = (y) => H - 1 - y;
    const halfAt = (x, y) => { const v = D[y * W + x]; return Math.max(1, Math.round(Tmax * Math.sqrt(Math.min(1, v / Math.max(2, dmax * 0.8))))); };
    const add = (g, x, y, z, c) => { if (!inR(x) || !inR(y) || !inR(z)) return; V[g].set(ck(x, y, z), [x, y, z, 1, c]); };
    // 몸통
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!at(x, y) || legOf[i] >= 0) continue; const hf = halfAt(x, y), c = cidx[i]; for (let X = -hf; X < hf; X++) add('', X, yOf(y), zOf(x), c); }
    // 다리 (왼쪽·오른쪽 한 쌍씩)
    legs.forEach((L, li) => {
      const hw = Math.max(1, Math.round(L.w / 2)), cxi = Math.max(0, Math.min(W - 1, Math.round(L.cx))), above = L.top >= 0 && at(cxi, L.top) ? halfAt(cxi, L.top) : Tmax, off = Math.max(hw, above - hw);
      [1, -1].forEach((side, si) => {
        const id = 'l' + (li * 2 + si + 1); V[id] = new Map();
        groups[id] = { nm: '다리' + (li * 2 + si + 1), leg: (li + si) % 2 ? Math.PI : 0, p: [0, 0, 0] };
        L.mem.forEach((j) => { if (legOf[j] !== li) return; const x = j % W, y = (j / W) | 0; for (let X = off - hw; X < off + hw; X++) { const xx = side > 0 ? X : -X - 1; add(id, xx, yOf(y), zOf(x), cidx[j]); } });
      });
    });
    // 안쪽은 2칸짜리 큰 블럭으로 묶어서 블럭 수를 줄여요
    for (const g in V) V[g] = pack(V[g]);
    const r = { vu, pal, groups, V };
    // 회전 중심 자동
    const keep = E.V, kd = E.d; E.V = V; E.d = Object.assign({}, E.d, { vu, groups }); for (const id in groups) autoPivot(id); E.V = keep; E.d = kd;
    return r;
  }
  function pack(m) {
    const has = (x, y, z) => m.has(ck(x, y, z)), deep = (x, y, z) => has(x, y, z) && has(x + 1, y, z) && has(x - 1, y, z) && has(x, y + 1, z) && has(x, y - 1, z) && has(x, y, z + 1) && has(x, y, z - 1);
    const out = new Map(), used = new Set(), keys = [...m.values()].sort((a, b) => a[1] - b[1] || a[2] - b[2] || a[0] - b[0]);
    for (const b of keys) {
      const [x, y, z] = b, k = ck(x, y, z); if (used.has(k)) continue;
      let ok = true; for (let i = 0; i < 2 && ok; i++) for (let j = 0; j < 2 && ok; j++) for (let l = 0; l < 2 && ok; l++) { const q = ck(x + i, y + j, z + l); if (used.has(q) || !deep(x + i, y + j, z + l)) ok = false; }
      if (ok) { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let l = 0; l < 2; l++) used.add(ck(x + i, y + j, z + l)); out.set(k, [x, y, z, 2, b[4]]); }
    }
    for (const b of keys) { const k = ck(b[0], b[1], b[2]); if (!used.has(k)) out.set(k, b); }
    // 2칸 안쪽에서 아무도 안 보는 1칸 블럭은 빼요 (면이 안 보여요)
    return out;
  }

  // ── 게임에 등록
  function regDlg() {
    const V = VB(), d = E.d, sp = d.shop || {}, pub = !!V.VBX.map[E.k], G = V.grades();
    if (d.t === 'chr') {
      const worn = V.worn() === E.k;
      V.confirmBox(`<h3>🧍 캐릭터 등록</h3><p>「${esc(d.n)}」을(를) 서버에 올릴까요?</p><p class="small muted">올리면 이 캐릭터를 입은 사람이 다른 유저 화면에도 블럭 캐릭터로 보여요 · 지금은 관리자 › 편집기 상자에서 입어 볼 수 있어요</p>
        <p><button type="button" class="sm" data-rwear>${worn ? '🧍 원래 캐릭터로 돌아가기' : '🧍 내 캐릭터로 입어보기'}</button>${pub ? ' <button type="button" class="sm" data-rdel>서버에서 빼기</button>' : ''}</p>`, () => publish(false));
      const m = $('confirm'), yes = $('cfYes'); if (yes) yes.textContent = '✅ 서버에 올리기';
      m.querySelector('[data-rwear]').onclick = () => { m.classList.remove('show'); if (worn) { V.wear(null); toast('원래 캐릭터로 돌아왔어요', 1400); return; } if (!V.vbGet(E.k)) { V.VBX.local[E.k] = data(); } V.wear(E.k); toast('🧍 입었어요 · 편집기를 닫으면 내 캐릭터가 바뀌어 있어요 (다른 사람에게 보이려면 서버에 올려 주세요)', 2600); };
      const dl = m.querySelector('[data-rdel]'); if (dl) dl.onclick = () => { m.classList.remove('show'); const RT = window.NK_RT; if (RT && RT.setVbx && RT.setVbx(E.k, null)) toast('서버에서 뺐어요', 1600); else toast('서버에 연결된 상태에서만 할 수 있어요', 2000); };
      return;
    }
    const pet = d.t === 'pet', loc = !!V.VBX.local[E.k];
    V.confirmBox(`<h3>✅ 게임에 등록 <small class="muted">${pet ? '🐶 펫' : '🐾 탈것'}</small></h3>
      <div class="vbReg">
      <label class="vbF">이름<input type="text" id="vbRn" maxlength="14" value="${esc(d.n)}"></label>
      <div class="vbF">얻는 방법<span class="vbSeg"><button type="button" data-rh="shop" class="${sp.how !== 'box' ? 'on' : ''}">상점에서 팔기</button><button type="button" data-rh="box" class="${sp.how === 'box' ? 'on' : ''}">행운 상자에서</button></span></div>
      <label class="vbF rshop">가격 (골드)<input type="number" id="vbRp" min="0" step="${pet ? 1000 : 100000}" value="${sp.pr != null ? sp.pr : pet ? 30000 : 3000000}"></label>
      <label class="vbF ${pet ? '' : 'rbox'}">${pet ? '등급 <small class="muted">(상자로 얻으면 이 등급 이상 상자에서 나와요)</small>' : '나오는 상자'}<select id="vbRg">${(pet ? [0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5]).map((g) => `<option value="${g}" ${(sp.g != null ? sp.g : pet ? 2 : 3) === g ? 'selected' : ''}>${G[g][0]}${pet ? '' : ' 상자 이상'}</option>`).join('')}</select></label>
      <label class="vbF rbox">확률 (상자 1개당 %)<input type="number" id="vbRq" min="0" max="100" step="0.05" value="${sp.p != null ? sp.p : 0.2}"></label>
      <label class="vbF" ${pet ? 'style="display:none"' : ''}>속도 +%<input type="number" id="vbRs" min="0" max="150" step="5" value="${sp.spd != null ? sp.spd : 30}"></label>
      </div><p class="small muted">「모든 유저」를 누르면 서버에 올라가요 · ${pet ? '펫' : '탈것'} 테스트 기능이 켜진 유저에게 보여요${pub ? ' · 이미 게임에 있어요 (덮어써요)' : ''}</p>
      <p><button type="button" class="sm" data-rlocal>👁 내 화면에서만 보기</button>${loc ? ' <button type="button" class="sm" data-rloff>내 화면에서 빼기</button>' : ''}${pub ? ' <button type="button" class="sm" data-rdel>게임에서 빼기</button>' : ''}</p>`, () => { take(); publish(false); });
    const m = $('confirm'); let how = sp.how === 'box' ? 'box' : 'shop';
    const sh = () => { m.querySelectorAll('.rshop').forEach((x) => (x.style.display = how === 'shop' ? '' : 'none')); m.querySelectorAll('.rbox').forEach((x) => (x.style.display = how === 'box' ? '' : 'none')); m.querySelectorAll('[data-rh]').forEach((b) => b.classList.toggle('on', b.dataset.rh === how)); };
    m.querySelectorAll('[data-rh]').forEach((b) => (b.onclick = () => { how = b.dataset.rh; sh(); })); sh();
    const yes = $('cfYes'); if (yes) yes.textContent = '✅ 모든 유저에게';
    function take() { d.n = ($('vbRn').value || d.n).replace(/[<>]/g, '').slice(0, 14) || '새 탈것'; d.shop = { how, pr: Math.max(0, +$('vbRp').value || 0), g: +$('vbRg').value, p: Math.max(0, Math.min(100, +$('vbRq').value || 0)), spd: Math.max(0, Math.min(150, +$('vbRs').value || 0)) }; saveDraft(); }
    m.querySelector('[data-rlocal]').onclick = () => { take(); m.classList.remove('show'); publish(true); };
    const lo = m.querySelector('[data-rloff]'); if (lo) lo.onclick = () => { m.classList.remove('show'); delete V.VBX.local[E.k]; V.vbSaveLocal(); V.vbReg(); toast('내 화면에서 뺐어요', 1400); };
    const dl = m.querySelector('[data-rdel]'); if (dl) dl.onclick = () => { m.classList.remove('show'); if (!confirm(`「${d.n}」을(를) 게임에서 뺄까요? (산 사람 가방에서도 안 보여요)`)) return; const RT = window.NK_RT; if (RT && RT.setVbx && RT.setVbx(E.k, null)) toast('게임에서 뺐어요', 1600); else toast('서버에 연결된 상태에서만 할 수 있어요', 2000); };
  }
  function publish(local) {
    const V = VB(), dd = data();
    if (!dd.vox[''] && !Object.keys(dd.vox).length) { toast('블럭을 먼저 쌓아 주세요', 1600); return; }
    const len = Object.values(dd.vox).reduce((a, v) => a + v.length, 0);
    if (len > 36000) { toast('블럭이 너무 많아요 · 조금 줄여 주세요', 2200); return; }
    if (local) { dd.at = Date.now(); V.VBX.local[E.k] = dd; V.vbSaveLocal(); V.vbReg(); saveDraft(); toast(dd.t === 'pet' ? '👁 내 화면에서만 상점 › 🐾 펫에 보여요 (새로고침해도 남아요)' : '👁 내 화면에서만 상점 › 🚗 탈것에 보여요 (새로고침해도 남아요)', 2600); ui(); return; }
    const RT = window.NK_RT; if (!RT || RT.status() !== 'on' || !RT.setVbx) { toast('서버에 연결된 상태에서만 모든 유저에게 등록할 수 있어요', 2200); return; }
    if (RT.setVbx(E.k, dd)) { delete V.VBX.local[E.k]; V.vbSaveLocal(); saveDraft(); toast(`✅ 「${dd.n}」을(를) ${dd.t === 'chr' ? '서버에 저장했어요' : '게임에 등록했어요'}`, 2200); setTimeout(ui, 800); }
  }

  // ── 단축키
  addEventListener('keydown', (e) => {
    const m = $('vbEd'); if (!m || !m.classList.contains('show')) return;
    if ($('confirm') && $('confirm').classList.contains('show')) return;
    const tag = (e.target && e.target.tagName) || ''; if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'z') { e.preventDefault(); e.stopImmediatePropagation(); if (e.shiftKey) redo(); else undo(); return; }
    if ((e.ctrlKey || e.metaKey) && k === 'y') { e.preventDefault(); e.stopImmediatePropagation(); redo(); return; }
    if (e.key === 'Escape') { e.stopImmediatePropagation(); close(); return; }
    if (E.mode !== 'build') return;
    if (k.length === 1 && '1234'.includes(k)) { E.size = +k; left(); }
    else if (k === 'b') { E.tool = 'add'; left(); } else if (k === 'e') { E.tool = 'del'; left(); } else if (k === 'i') { E.tool = 'pick'; left(); } else if (k === 'g') { E.mode = 'part'; changed(true); }
    else if (k === 'm') { E.mir = !E.mir; left(); }
    e.stopImmediatePropagation();
  }, true);
  // 편집기가 열려 있으면 게임 쪽 키(이동 등)는 막아요
  ['keydown', 'keyup'].forEach((t) => addEventListener(t, (e) => { const m = $('vbEd'); if (!m || !m.classList.contains('show')) return; if ($('confirm') && $('confirm').classList.contains('show')) return; const tag = (e.target && e.target.tagName) || ''; if (/INPUT|TEXTAREA|SELECT/.test(tag)) return; if (e.ctrlKey || e.metaKey) return; e.stopImmediatePropagation(); }, true));

  // ── 모양 (CSS)
  function css() {
    if ($('vbCss')) return; const s = document.createElement('style'); s.id = 'vbCss';
    s.textContent = `body.vbOpen #confirm{z-index:2700!important}#vbEd{position:fixed;inset:0;z-index:2600;display:none;background:rgba(40,30,20,.45)}#vbEd.show{display:flex}
#vbEd .vbWin{margin:auto;width:min(1400px,100vw);height:min(900px,100dvh);background:#f6efe3;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;font-size:13px;color:#3a2f25;box-shadow:0 10px 40px rgba(0,0,0,.3)}
#vbEd .vbTop{display:flex;align-items:center;gap:6px;padding:8px 10px;background:#fffaf0;border-bottom:1.5px solid #e9dcc6;flex-wrap:wrap}
#vbEd .vbT{font-size:16px;margin-right:4px;white-space:nowrap}#vbEd .vbSp{flex:1}
#vbEd button{font:inherit;border:1.5px solid #e2d3bb;background:#fff;border-radius:9px;padding:6px 10px;cursor:pointer;color:#3a2f25;white-space:nowrap}
#vbEd button:disabled{opacity:.4;cursor:default}#vbEd button.acc{background:#1f6f6a;border-color:#1f6f6a;color:#fff;font-weight:700}
#vbEd select,#vbEd input[type=text],#vbEd input[type=number]{font:inherit;border:1.5px solid #e2d3bb;border-radius:8px;padding:5px 6px;background:#fff;color:#3a2f25;min-width:0}
#vbEd .vbTop select{max-width:200px}
.vbSeg{display:inline-flex;background:#efe3d0;border-radius:10px;padding:3px;gap:3px}.vbSeg button{border:0!important;background:transparent!important;padding:5px 10px!important}.vbSeg button.on{background:#1f6f6a!important;color:#fff!important;font-weight:700}
#vbEd .vbBody{flex:1;min-height:0;display:grid;grid-template-columns:220px minmax(0,1fr) 260px}
#vbEd .vbL,#vbEd .vbR{overflow:auto;padding:8px 10px;background:#fbf6ec}#vbEd .vbR{border-left:1.5px solid #e9dcc6}#vbEd .vbL{border-right:1.5px solid #e9dcc6}
#vbEd h5{margin:10px 0 6px;font-size:13px;display:flex;align-items:center;gap:6px}#vbEd h5 small{color:#7a6650;font-weight:400;font-size:11.5px}
#vbEd .vbTools{display:grid;grid-template-columns:1fr 1fr;gap:5px}#vbEd .vbTools button,#vbEd .vbNum button{padding:6px 4px}
#vbEd .vbTools button.on,#vbEd .vbNum button.on,#vbEd .vbGs button.on{background:#1f6f6a;border-color:#1f6f6a;color:#fff}
#vbEd .vbNum{display:grid;grid-template-columns:repeat(4,1fr);gap:5px}
#vbEd .vbChk{display:flex;align-items:center;gap:6px;margin:6px 0;cursor:pointer}
#vbEd .vbPal{display:grid;grid-template-columns:repeat(8,1fr);gap:4px}#vbEd .vbPal button{aspect-ratio:1;padding:0;border-radius:6px;border:2px solid rgba(0,0,0,.08)}#vbEd .vbPal button.on{outline:3px solid #1f6f6a;outline-offset:1px}
#vbEd .vbPal.more{margin-top:6px;opacity:.85}#vbEd .vbCus{display:flex;align-items:center;justify-content:space-between;margin-top:8px}#vbEd .vbCus input{width:44px;height:28px;padding:0;border:0;background:none}
#vbEd .vbView{position:relative;min-width:0}#vbEd #vbCv{width:100%;height:100%;display:block;touch-action:none;cursor:crosshair}
#vbEd .vbInfo{position:absolute;left:10px;top:8px;background:rgba(255,250,240,.9);border-radius:8px;padding:4px 8px;font-size:12px}#vbEd .vbInfo.warn{color:#b8323a}
#vbEd .vbHint{position:absolute;left:10px;right:10px;bottom:8px;text-align:center;font-size:12px;color:#5a4a3a;background:rgba(255,250,240,.85);border-radius:8px;padding:4px 8px;pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#vbEd .vbOrb{position:absolute;right:8px;top:8px;display:flex;gap:4px}#vbEd .vbOrb button{width:34px;height:34px;padding:0;font-size:16px}
#vbEd .vbGs{display:flex;flex-direction:column;gap:4px}#vbEd .vbGs button{display:flex;align-items:center;gap:6px;text-align:left}#vbEd .vbGs i{width:10px;height:10px;border-radius:50%;flex:none}
#vbEd .vbGs em{font-style:normal;font-size:11px;background:#efe3d0;color:#5a4a3a;border-radius:6px;padding:1px 5px}#vbEd .vbGs button.on em{background:rgba(255,255,255,.25);color:#fff}#vbEd .vbGs small{margin-left:auto;opacity:.7}
#vbEd .vbGb{display:flex;gap:5px;margin-top:6px}#vbEd .vbGb button{flex:1;padding:5px 4px}
#vbEd hr{border:0;border-top:1.5px solid #e9dcc6;margin:10px 0}
#vbEd .vbF{display:flex;flex-direction:column;gap:4px;margin:6px 0}
#vbEd .vbRow{display:grid;grid-template-columns:62px minmax(0,1fr) 58px;align-items:center;gap:5px;margin:3px 0}#vbEd .vbRow span{font-size:12px;color:#5a4a3a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#vbEd .vbRow input[type=number]{padding:3px 4px;font-size:12px}#vbEd .vbRow input[type=range]{accent-color:#1f6f6a;min-width:0;width:100%}
#vbEd .vbMini{padding:2px 8px!important;font-size:11.5px;margin-left:auto}
#vbEd .vbMv{display:grid;grid-template-columns:1fr 1fr;gap:4px}#vbEd .vbMv button{padding:5px 4px}
#vbEd .vbNote{font-size:12px;color:#7a6650;margin:8px 0}
#vbEd .vbNm{font-weight:700;max-width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 4px}
#vbEd .vbParts{display:flex;flex-direction:column;gap:4px}#vbEd .vbParts button{display:flex;align-items:center;gap:6px;text-align:left;padding:5px 8px}#vbEd .vbParts i{width:10px;height:10px;border-radius:50%;flex:none}#vbEd .vbParts small{margin-left:auto;opacity:.7}#vbEd .vbParts button.on{background:#1f6f6a;border-color:#1f6f6a;color:#fff}
#vbEd .vbWide{width:100%;margin-top:6px}
#confirm .vbKind{margin:6px auto 2px}#confirm .vbKind button{border:0;padding:6px 12px;border-radius:8px;background:transparent}#confirm .vbKind button.on{background:#1f6f6a;color:#fff}
#confirm .vbLd{max-height:46vh;overflow:auto;display:flex;flex-direction:column;gap:6px;text-align:left;margin:8px 0}
#confirm .vbLr{display:flex;gap:6px;align-items:stretch}#confirm .vbLr.on .vbLo{border-color:#1f6f6a}
#confirm .vbLo{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;text-align:left;border:1.5px solid #e2d3bb;background:#fff;border-radius:10px;padding:7px 10px;cursor:pointer}#confirm .vbLo small{color:#7a6650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#confirm .vbLx{border:1.5px solid #e2d3bb;background:#fff;border-radius:10px;padding:0 10px;cursor:pointer;color:#b8323a;white-space:nowrap}
#confirm .vbPick{display:flex;flex-direction:column;gap:8px;text-align:left;margin:10px 0}
#confirm .vbPv{display:block;margin:8px auto;background:#f6efe3;border-radius:8px;max-width:100%}
#confirm .vbPf{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;text-align:left;font-size:13px}#confirm .vbPf label{display:flex;flex-direction:column;gap:3px}
#confirm .vbReg{display:flex;flex-direction:column;gap:2px;text-align:left}#confirm .vbReg .vbF{display:flex;flex-direction:column;gap:4px;margin:5px 0}
#confirm .vbSeg button{font:inherit;cursor:pointer;border-radius:8px}
#confirm .vbChk{display:flex;gap:6px;align-items:center;justify-content:center;margin-top:8px;font-size:13px}
@media (max-width:900px){#vbEd .vbBody{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) auto auto}#vbEd .vbView{order:-1;min-height:300px}#vbEd .vbL,#vbEd .vbR{max-height:34dvh;border:0}#vbEd .vbWin{border-radius:0}#vbEd .vbHint{display:none}#vbEd .vbInfo{top:48px}}`;
    document.head.appendChild(s);
  }

  window.NK_VBED = { open, close, E, tpl, fromPhoto, data, load };
})();
