// 피쉬코지 v55: 초성 게임 · 밸런스 게임 이벤트 창 + 관리자 › 이벤트 설정
// 서버(실시간 워커)가 문제를 내고 정답을 판정해요. 이 파일은 창을 그리고 답을 보내고 보상을 받기만 해요.
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const RT = () => window.NK_RT;
  const N = () => window.NKV2;
  let cur = null, hidden = "", mini = false, res = {}, wrongAt = 0, typed = "", tick = 0, autoClose = 0;

  // 보상은 게임마다 한 번만
  function got(id) { try { const S = N().S; S.evGot = S.evGot || {}; return !!S.evGot[id]; } catch (e) { return true; } }
  function give(id, coin, why) {
    try {
      const S = N().S; S.evGot = S.evGot || {}; if (S.evGot[id] || !(coin > 0)) return;
      S.evGot[id] = Date.now();
      const keys = Object.keys(S.evGot); if (keys.length > 60) keys.sort((a, b) => S.evGot[a] - S.evGot[b]).slice(0, keys.length - 60).forEach((k) => delete S.evGot[k]);
      S.coins += coin; S.earned = (S.earned || 0) + coin; N().save(); N().hud();
      try { N().snd && N().snd.ctx; } catch (e) { /* ignore */ }
      if (window.NKV2 && NKV2.miniToast) NKV2.miniToast(`🪙 +${coin.toLocaleString()} · ${why}`, 2200);
    } catch (e) { /* ignore */ }
  }

  const fmt = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
  const skew = () => { try { return RT().clockSkew || 0; } catch (e) { return 0; } };
  const left = () => (cur ? cur.end - (Date.now() - skew()) : 0);

  function el() {
    let w = $("gev");
    if (!w) { w = document.createElement("div"); w.id = "gev"; document.body.appendChild(w); }
    return w;
  }

  function render() {
    const w = el();
    if (!cur || hidden === cur.id) { w.className = ""; w.innerHTML = ""; return; }
    const g = cur, done = g.done, L = left(), pct = Math.max(0, Math.min(100, L / (g.end - g.start) * 100)), cho = g.kind === "cho", r = res[g.id] || {};
    const title = cho ? (done ? "⚡ 초성 퀴즈 종료" : "⚡ 초성 퀴즈") : (done ? "⚖️ 밸런스 게임 결과" : "⚖️ 밸런스 게임");
    if (mini && !done) {
      w.className = "gev mini " + (cho ? "" : "bal");
      w.innerHTML = `<button class="gev-pill" data-gv="open">${title} <b>${fmt(L)}</b> ▸</button>`;
      return;
    }
    w.className = "gev " + (cho ? "" : "bal");
    const head = `<div class="gev-h"><b>${title}</b>${done ? "" : `<span class="tm">${fmt(L)}</span><button class="x" data-gv="min" title="접기">—</button>`}<button class="x" data-gv="close" title="닫기">×</button></div>${done ? "" : `<div class="gev-bar"><i style="width:${pct}%"></i></div>`}`;
    let body = "";
    const top3 = () => `<div class="gev-top">${[0, 1, 2].map((i) => { const x = (g.top || [])[i]; return x ? `<div class="${r.ok && r.rank === i + 1 ? "me" : ""}"><span class="md m${i + 1}">${i + 1}</span>${esc(x.n)}<small>${(x.ms / 1000).toFixed(1)}초</small></div>` : `<div class="empty"><span class="md m${i + 1}">${i + 1}</span>?<small>-</small></div>`; }).join("")}</div>`;
    if (cho) {
      if (done) {
        body = `<div class="gev-ans">정답은 <b>${esc(g.ans || "")}</b></div>${top3()}<div class="gev-note">정답 ${g.n || 0}명${r.ok ? ` · 나는 ${r.rank}위 🪙${(r.coin || 0).toLocaleString()}` : ""}</div>`;
      } else if (r.ok) {
        body = `<div class="gev-cat">${esc(g.c ? "주제 · " + g.c : "초성 퀴즈")}</div><div class="gev-cho">${esc(g.cho)}</div><div class="gev-ok">🎉 정답! ${r.rank}위 · ${(r.ms / 1000).toFixed(1)}초 · 🪙${(r.coin || 0).toLocaleString()} 받았어요</div>${top3()}<div class="gev-note">지금까지 정답 ${g.n || 0}명 · 끝나면 정답이 공개돼요</div>`;
      } else {
        const rw = g.rw || [];
        body = `<div class="gev-cat">${esc(g.c ? "주제 · " + g.c : "초성 퀴즈")}</div><div class="gev-cho">${esc(g.cho)}</div>
          <form class="gev-in" data-gv="form"><input id="gevA" maxlength="20" autocomplete="off" placeholder="정답 입력…" value="${esc(typed)}" class="${Date.now() - wrongAt < 600 ? "bad" : ""}"><button class="acc">확인</button></form>
          ${Date.now() - wrongAt < 2500 ? `<div class="gev-bad">❌ 아니에요! 다시 입력해 보세요</div>` : ""}
          <div class="gev-rw"><span>🥇 🪙${rw[0] || 0}</span><span>🥈 🪙${rw[1] || 0}</span><span>🥉 🪙${rw[2] || 0}</span><span>그 뒤 정답 🪙${rw[3] || 0}</span></div>${top3()}`;
      }
    } else {
      const res2 = g.res || null, tot = res2 ? res2.l + res2.r : 0, pl = tot ? Math.round(res2.l / tot * 100) : 50, my = r.picked || "";
      if (done) {
        body = `<div class="gev-q">${esc(g.q)}</div>${tot ? `<div class="gev-res"><div class="rb"><div class="a" style="width:${Math.max(pl, 12)}%">${pl}%</div><div class="b" style="width:${Math.max(100 - pl, 12)}%">${100 - pl}%</div></div><div class="lbl"><span>${esc(g.l)} · ${res2.l}명${my === "l" ? " ✔ 나" : ""}</span><span>${esc(g.r)} · ${res2.r}명${my === "r" ? " ✔ 나" : ""}</span></div></div>` : `<div class="gev-note">아무도 고르지 않았어요</div>`}
          ${my ? `<div class="gev-ok">🪙${(g.rw || 0).toLocaleString()} 참여 보상 받았어요${tot && ((my === "l" && pl >= 50) || (my === "r" && pl <= 50)) ? " · 다수 쪽이에요!" : ""}</div>` : ""}`;
      } else {
        body = `<div class="gev-q">${esc(g.q)}</div><div class="gev-vs"><button data-gv="l" class="l ${my === "l" ? "pick" : ""} ${my === "r" ? "dim" : ""}">${esc(g.l)}${my === "l" ? "<small>✔ 내 선택</small>" : ""}</button><button data-gv="r" class="r ${my === "r" ? "pick" : ""} ${my === "l" ? "dim" : ""}">${esc(g.r)}${my === "r" ? "<small>✔ 내 선택</small>" : ""}</button></div>
          <div class="gev-note">${my ? `결과는 <span class="tm2">${fmt(L)}</span> 뒤에 공개돼요 · 바꾸기는 1번만` : `참여하면 🪙${(g.rw || 0).toLocaleString()} · 지금 ${g.joined || 0}명 참여`}</div>`;
      }
    }
    const focus = document.activeElement && document.activeElement.id === "gevA";
    const caret = focus ? document.activeElement.selectionStart : null;
    w.innerHTML = head + `<div class="gev-b">${body}</div>`;
    if (focus) { const i = $("gevA"); if (i) { i.focus(); try { i.setSelectionRange(caret, caret); } catch (e) { /* ignore */ } } }
    if (window.NK_EMOJI) try { NK_EMOJI.parse(w); } catch (e) { /* ignore */ }
  }

  document.addEventListener("click", (e) => {
    const b = e.target.closest && e.target.closest("#gev [data-gv]");
    if (!b || !cur) return;
    const a = b.dataset.gv;
    if (a === "close") { hidden = cur.id; mini = false; render(); }
    else if (a === "min") { mini = true; render(); }
    else if (a === "open") { mini = false; render(); }
    else if ((a === "l" || a === "r") && !cur.done) {
      const r = res[cur.id] || {};
      if (r.picked === a) return;
      try { RT().gamePick(cur.id, a); } catch (er) { /* ignore */ }
    }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target.closest && e.target.closest("#gev [data-gv=form]");
    if (!f) return;
    e.preventDefault();
    const i = $("gevA"); const v = i ? i.value.trim() : "";
    if (!v || !cur || cur.done) return;
    try { RT().gameAns(cur.id, v); } catch (er) { /* ignore */ }
  });
  document.addEventListener("input", (e) => { if (e.target && e.target.id === "gevA") typed = e.target.value; });
  // 입력 칸에서 누르는 키는 게임 조작(WASD·스페이스)으로 넘어가지 않게
  document.addEventListener("keydown", (e) => { if (e.target && e.target.id === "gevA") e.stopPropagation(); }, true);

  addEventListener("nk-rt-game", (e) => {
    const g = e.detail || null;
    const isNew = g && (!cur || cur.id !== g.id);
    cur = g;
    if (isNew) { mini = false; typed = ""; wrongAt = 0; if (!g.done) { try { NKV2 && NKV2.snd; } catch (er) { /* ignore */ } } }
    if (g && g.done) {
      const r = res[g.id] || {};
      if (g.kind === "bal" && r.picked) give(g.id, g.rw || 0, "밸런스 게임 참여");
      clearTimeout(autoClose); autoClose = setTimeout(() => { if (cur && cur.id === g.id && cur.done) { cur = null; render(); } }, 9000);
    }
    render();
  });
  addEventListener("nk-rt-gameres", (e) => {
    const m = e.detail || {};
    if (!m.id) return;
    const r = res[m.id] = Object.assign(res[m.id] || {}, m);
    if (m.ok === false) { wrongAt = Date.now(); r.ok = false; }
    if (m.ok) { typed = ""; give(m.id, m.coin || 0, `초성 퀴즈 ${m.rank}위`); }
    render();
  });
  // 1초마다 시간·막대만 갱신 (창 전체를 다시 그리면 누르는 중인 버튼이 사라져요)
  setInterval(() => {
    if (!cur || cur.done || cur.id === hidden) return;
    const w = $("gev"); if (!w) return;
    const L = left(), t = fmt(L);
    w.querySelectorAll(".tm,.tm2,.gev-pill b").forEach((e) => { e.textContent = t; });
    const bar = w.querySelector(".gev-bar i"); if (bar) bar.style.width = Math.max(0, Math.min(100, L / (cur.end - cur.start) * 100)) + "%";
    const bad = w.querySelector(".gev-bad"); if (bad && Date.now() - wrongAt > 2500) bad.remove();
  }, 1000);

  // ───────── 관리자 › 이벤트: 초성·밸런스 게임 설정 ─────────
  let cfg = null, wantCfg = 0;
  addEventListener("nk-rt-gamecfg", (e) => { cfg = e.detail || null; const m = $("admin"); if (m && m.classList.contains("show") && window.NKV2 && NKV2.openAdmin) { /* 다음 렌더에 반영 */ } const box = $("gevAdm"); if (box) { box.outerHTML = adminHTML(); bindBox(); } });
  const choTxt = (L) => (L || []).map((x) => [x.a, x.c || "", x.h || ""].join(" | ").replace(/( \| )+$/, "")).join("\n");
  const balTxt = (L) => (L || []).map((x) => [x.q || "", x.l, x.r].join(" | ")).join("\n");
  const parseCho = (t) => t.split("\n").map((s) => s.split("|").map((x) => x.trim())).filter((a) => a[0]).map(([a, c, h]) => ({ a, c: c || "", h: h || "" }));
  const parseBal = (t) => t.split("\n").map((s) => s.split("|").map((x) => x.trim())).filter((a) => a.length >= 3 && a[1] && a[2]).map(([q, l, r]) => ({ q, l, r }));
  function adminHTML() {
    const on = RT() && RT().status && RT().status() === "on";
    if (!on) return `<div class="adbox" id="gevAdm"><h4>🎲 초성·밸런스 게임</h4><p class="small muted">서버에 연결된 상태에서 설정할 수 있어요.</p></div>`;
    if (!cfg) { if (Date.now() - wantCfg > 3000) { wantCfg = Date.now(); try { RT().gameGet(); } catch (e) { /* ignore */ } } return `<div class="adbox" id="gevAdm"><h4>🎲 초성·밸런스 게임</h4><p class="small muted">설정 불러오는 중…</p></div>`; }
    const c = cfg, g = RT().game, run = g && !g.done ? `<span class="tg g">진행 중 · ${g.kind === "cho" ? "초성" : "밸런스"} ${fmt(g.end - (Date.now() - skew()))} 남음</span>` : "";
    return `<div class="adbox" id="gevAdm"><h4>🎲 초성·밸런스 게임 ${c.on ? '<span class="tg g">자동 진행 켜짐</span>' : '<span class="tg">꺼짐</span>'} ${run}</h4>
      <p class="small muted">켜 두면 호숫가마다 정해진 간격(±15%)으로 초성 게임과 밸런스 게임이 번갈아 열려요. 유저 화면 오른쪽 가운데에 창이 떠요. 설정은 네 호숫가에 같이 적용돼요.</p>
      <div class="adform gevf">
        <label><input type="checkbox" id="gvOn" ${c.on ? "checked" : ""}> 자동으로 열기</label>
        <label>간격 <input type="number" id="gvEvery" min="5" max="720" value="${c.every}"> 분마다</label>
        <label>진행 시간 <input type="number" id="gvDur" min="20" max="180" value="${c.dur}"> 초</label>
        <label><input type="checkbox" id="gvCho" ${c.cho ? "checked" : ""}> 초성 게임</label>
        <label><input type="checkbox" id="gvBal" ${c.bal ? "checked" : ""}> 밸런스 게임</label>
      </div>
      <div class="adform gevf"><b class="small">보상(코인)</b>
        <label>초성 1위 <input type="number" id="gvC1" min="0" value="${c.rw.c1}"></label><label>2위 <input type="number" id="gvC2" min="0" value="${c.rw.c2}"></label><label>3위 <input type="number" id="gvC3" min="0" value="${c.rw.c3}"></label><label>그 뒤 정답 <input type="number" id="gvCx" min="0" value="${c.rw.cx}"></label><label>밸런스 참여 <input type="number" id="gvB" min="0" value="${c.rw.b}"></label>
      </div>
      <details class="gevl"><summary>✏️ 초성 문제 ${c.choList.length}개 <small class="muted">한 줄에 하나 · <code>정답 | 주제 | 초성 직접 쓰기(선택)</code> · 정답이 여러 개면 <code>쏘가리/쏘갈이</code></small></summary><textarea id="gvChoL" rows="9" spellcheck="false">${esc(choTxt(c.choList))}</textarea></details>
      <details class="gevl"><summary>✏️ 밸런스 질문 ${c.balList.length}개 <small class="muted">한 줄에 하나 · <code>질문 | 왼쪽 | 오른쪽</code></small></summary><textarea id="gvBalL" rows="9" spellcheck="false">${esc(balTxt(c.balList))}</textarea></details>
      <p><button class="acc" id="gvSave">저장</button> <button id="gvNowC">⚡ 지금 초성 게임 열기</button> <button id="gvNowB">⚖️ 지금 밸런스 게임 열기</button> <button id="gvStop">진행 중인 게임 끝내기</button> <label class="small"><input type="checkbox" id="gvAll" checked> 네 호숫가 모두</label></p></div>`;
  }
  function bindBox() {
    const q = (id) => $(id); if (!q("gvSave")) return;
    const num = (id) => +q(id).value || 0;
    q("gvSave").onclick = () => {
      const next = { on: q("gvOn").checked ? 1 : 0, every: num("gvEvery"), dur: num("gvDur"), cho: q("gvCho").checked ? 1 : 0, bal: q("gvBal").checked ? 1 : 0,
        rw: { c1: num("gvC1"), c2: num("gvC2"), c3: num("gvC3"), cx: num("gvCx"), b: num("gvB") }, choList: parseCho(q("gvChoL").value), balList: parseBal(q("gvBalL").value) };
      if (!next.choList.length && next.cho) return alertT("초성 문제가 하나도 없어요");
      if (!next.balList.length && next.bal) return alertT("밸런스 질문이 하나도 없어요");
      if (RT().gameSet(next)) alertT(`저장했어요 · 초성 ${next.choList.length}개 · 밸런스 ${next.balList.length}개`); else alertT("서버에 연결되어 있지 않아요");
    };
    const all = () => q("gvAll").checked;
    q("gvNowC").onclick = () => { RT().gameNow("cho", all()); alertT("초성 게임을 열었어요"); };
    q("gvNowB").onclick = () => { RT().gameNow("bal", all()); alertT("밸런스 게임을 열었어요"); };
    q("gvStop").onclick = () => { RT().gameNow("stop", all()); alertT("진행 중인 게임을 끝냈어요"); };
  }
  function alertT(t) { try { NKV2.miniToast(t, 1800); } catch (e) { /* ignore */ } }
  window.NK_GAMEEV = { adminHTML, adminBind: () => bindBox(), state: () => ({ cur, res }) };
})();
