// 피쉬코지 v51: 우측 상단 정리
// - 순서: ☕ 후원 · 🌗 시간 · ≡ 메뉴(아래로 펼침: 도감 · 게시판 · 저장 · 설정)
// - 사운드(설정 › 사운드와 중복) · 앉기 · 시간 흐름(관리자 › 시간·날씨와 중복) 버튼은 숨김 (기존 단축/연결 코드가 쓰므로 DOM 에는 남김)
// - 관리자 › 화면·시안 '후원 버튼 숨기기'(play.donOff)로 모든 유저의 ☕ 를 감출 수 있음
(function () {
  const $ = (id) => document.getElementById(id);
  const DROP = ["bDex", "bBoard", "bSave", "bSet"];
  const HIDE = ["bSound", "bSit", "bAuto"];
  const css = document.createElement("style");
  css.textContent = `
#v51Hold{display:none!important}
#bMenu51 .hb51{display:inline-flex;flex-direction:column;justify-content:center;gap:3px;width:18px;height:18px;vertical-align:middle}#bMenu51 .hb51 i{display:block;height:2.5px;border-radius:2px;background:#5a5468}
#bMenu51.on{background:#ffeede}
#mDrop51{position:absolute;top:calc(100% + 8px);right:0;z-index:60;display:none;flex-direction:column;gap:2px;min-width:168px;padding:6px;background:#fffaf3;border-radius:16px;box-shadow:0 12px 32px rgba(40,30,50,.22)}
#mDrop51.open{display:flex}
#mDrop51>button{display:flex!important;align-items:center;gap:10px;width:100%;height:auto!important;min-height:42px;padding:8px 12px!important;border-radius:12px;background:transparent!important;box-shadow:none!important;justify-content:flex-start;margin:0!important}
#mDrop51>button:hover{background:#ffeede!important}
#mDrop51>button .mi{font-size:18px;width:22px;text-align:center}
#mDrop51>button .ml{display:inline!important;font-size:14px!important;font-weight:700;opacity:1!important;position:static!important;transform:none!important}
#mDrop51>button kbd{margin-left:auto}
body.don-off #bDon{display:none!important}
@media (max-width:700px){#mDrop51{right:-4px;min-width:150px}}`;
  document.head.appendChild(css);

  const donOff = () => {
    try {
      const RT = window.NK_RT;
      if (RT && RT.status && RT.status() === "on") return !!(RT.play && RT.play.donOff);
      return String(window.NK_UI25 && window.NK_UI25.get("donOff")) === "1";
    } catch (e) { return false; }
  };
  function close() { const d = $("mDrop51"), b = $("bMenu51"); if (d) d.classList.remove("open"); if (b) b.classList.remove("on"); }

  function apply() {
    const sy = $("mSys");
    if (!sy || !$("bDon") || !$("bDex") || !$("bBoard") || !$("bTime")) return setTimeout(apply, 400);
    sy.classList.add("v51");
    let hold = $("v51Hold");
    if (!hold) { hold = document.createElement("div"); hold.id = "v51Hold"; document.body.appendChild(hold); }
    HIDE.forEach((id) => { const b = $(id); if (b && b.parentNode !== hold) hold.appendChild(b); });
    let menu = $("bMenu51");
    if (!menu) {
      menu = document.createElement("button");
      menu.id = "bMenu51";
      menu.title = "메뉴";
      menu.innerHTML = '<b class="mi"><i class="hb51"><i></i><i></i><i></i></i></b><small class="ml">메뉴</small>';
      menu.onclick = (e) => { e.stopPropagation(); const d = $("mDrop51"), o = !d.classList.contains("open"); d.classList.toggle("open", o); menu.classList.toggle("on", o); };
    }
    let drop = $("mDrop51");
    if (!drop) {
      drop = document.createElement("div");
      drop.id = "mDrop51";
      drop.addEventListener("click", (e) => { if (e.target.closest("button")) setTimeout(close, 0); });
    }
    menu.className = $("bBoard").className.replace(/\bon\b/, "");
    DROP.forEach((id) => { const b = $(id); if (b && b.parentNode !== drop) drop.appendChild(b); });
    // 순서: 후원 · 시간 · 메뉴
    sy.appendChild($("bDon"));
    sy.appendChild($("bTime"));
    sy.appendChild(menu);
    sy.appendChild(drop);
    [...sy.children].forEach((c) => { if (![ "bDon", "bTime", "bMenu51", "mDrop51", "bOpM" ].includes(c.id)) drop.appendChild(c); });
    // v79: 운영자 모드 버튼은 맨 앞
    if ($("bOpM")) sy.insertBefore($("bOpM"), sy.firstChild);
    document.body.classList.toggle("don-off", donOff());
  }
  document.addEventListener("pointerdown", (e) => { if (!e.target.closest("#mDrop51,#bMenu51")) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  addEventListener("nk-rt-play", () => document.body.classList.toggle("don-off", donOff()));
  addEventListener("nk-rt-welcome", () => document.body.classList.toggle("don-off", donOff()));
  // menu-v27 이 다시 배치하면 그 뒤에 다시 정리
  const hook = () => {
    const M = window.NK_MENU27;
    if (!M || !M.apply) return setTimeout(hook, 300);
    if (M.apply.__v51) return;
    const orig = M.apply;
    M.apply = function () { const r = orig.apply(this, arguments); setTimeout(apply, 0); return r; };
    M.apply.__v51 = 1;
  };
  hook();
  window.NK_MENU51 = { apply, close };
  setTimeout(apply, 800);
})();
