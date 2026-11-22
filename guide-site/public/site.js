/* 피쉬코지 가이드 (guide.fishcozy.com) — v176
   게임과 완전히 분리된 정적 페이지. 게임 서버에서는 읽기만 해요
   (실시간 인원 /servers · 게시판 /posts). 글쓰기는 게임 안에서. */
(function () {
  const qs = new URLSearchParams(location.search);
  const GAME = qs.get('game') || 'https://fishcozy.com/';
  const API = (qs.get('api') || 'https://fishcozy-board-api.mi1ku.workers.dev').replace(/\/$/, '');
  const RT = (qs.get('rt') || 'https://fishcozy-realtime.mi1ku.workers.dev').replace(/\/$/, '');
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } } };

  /* ── 밝게 · 어둡게 */
  const mq = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => { const t = document.documentElement.dataset.theme; return t ? t === 'dark' : mq.matches; };
  const paintMeta = () => { const m = document.querySelector('meta[name="theme-color"]'); if (m) m.content = isDark() ? '#17304a' : '#fffaf3'; };
  $('themeBtn').addEventListener('click', () => { const nx = isDark() ? 'light' : 'dark'; document.documentElement.dataset.theme = nx; store.set('fcg_theme', nx); paintMeta(); });
  mq.addEventListener && mq.addEventListener('change', paintMeta); paintMeta();

  /* ── 라이브 낚시터 */
  const MAPS = { lake: { n: '호숫가', img: 'img/lake.jpg' }, canal: { n: '운하', img: 'img/canal.jpg' }, moon: { n: '달', img: 'img/moon.jpg' } };
  let map = 'lake', liveOn = false, SRV = null;
  const stage = $('stage'), img = $('stageImg');
  const watchURL = (m) => { const u = new URL(GAME, location.href); u.searchParams.set('uiprev', 'watch'); u.searchParams.set('map', m); return u.toString(); };
  function setLive(on) {
    liveOn = on; const old = stage.querySelector('iframe'); if (old) old.remove();
    $('stageOv').hidden = on; $('stopBtn').hidden = !on;
    if (on) { const f = document.createElement('iframe'); f.title = MAPS[map].n + ' 라이브 화면'; f.src = watchURL(map); f.setAttribute('loading', 'eager'); f.setAttribute('tabindex', '-1'); stage.appendChild(f); }
  }
  document.querySelectorAll('.tabs [data-map]').forEach((b) => b.addEventListener('click', () => {
    map = b.dataset.map; document.querySelectorAll('.tabs [data-map]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    img.src = MAPS[map].img; img.alt = MAPS[map].n + ' 낚시터 게임 화면'; paintCnt(); if (liveOn) setLive(true);
  }));
  $('playBtn').addEventListener('click', () => setLive(true));
  $('stopBtn').addEventListener('click', () => setLive(false));
  /* 화면 밖으로 나가면 라이브를 멈춰서 데이터·배터리를 아껴요 */
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { es.forEach((e) => { if (!e.isIntersecting && liveOn) setLive(false); }); }, { threshold: 0 }).observe(stage);

  function paintCnt() {
    const el = $('liveCnt'); if (!SRV) { el.hidden = true; return; }
    const sum = (k) => SRV.reduce((s, r) => s + (r[k] | 0), 0);
    const all = sum('n'), lake = sum('lake'), moon = sum('moon');
    el.textContent = map === 'moon' ? `달에서 ${moon}명` : map === 'lake' ? `지금 ${all}명 접속 · 호숫가 ${lake}명` : `지금 ${all}명 접속 중`;
    el.hidden = false;
  }
  async function loadSrv() {
    try { const r = await fetch(RT + '/servers', { cache: 'no-store' }); const j = await r.json(); if (j && j.ok && Array.isArray(j.servers)) { SRV = j.servers; paintCnt(); } } catch (e) { /* 인원은 못 불러와도 괜찮아요 */ }
  }
  loadSrv(); setInterval(() => { if (!document.hidden) loadSrv(); }, 60000);

  /* ── 처음이라면 (게임 속 할아버지 낚시 수업 장) */
  const STEPS = [
    { ch: '첫걸음', img: 'img/fish-bluegill.png', t: '앉아서 첫 물고기', s: ['반짝이는 빈 의자(또는 데크 끝)까지 걸어가요', '<b>낚시 시작</b> → 머리 위 <b>!</b>가 뜨면 바로 눌러요', '<b>어항</b>·<b>가방</b>을 열어 봐요'] },
    { ch: '준비', img: 'img/feat-coins-gold.png', t: '상점과 도감', s: ['<b>상점</b>에서 미끼 하나 사 보기', '좋은 미끼일수록 큰 물고기', '<b>도감</b>에서 만난 물고기 확인'] },
    { ch: '생활', img: 'img/cook-ico-skewer.png', t: '상자 · 요리 · 자동 낚시', s: ['<b>행운 상자</b> 열기', '의자 옆 <b>그릴</b>에서 생선 굽기', '바쁠 땐 <b>자동 낚시</b>'] },
    { ch: '성장', img: 'img/feat-cauldron.png', t: '레벨 · 합성 · 모험', s: ['레벨 숫자를 눌러 <b>레벨 길</b> 보상 보기', '같은 물고기 3마리로 <b>합성</b>', '물고기 3마리를 <b>모험</b>에 보내기'] },
    { ch: '함께', img: 'img/feat-flower.png', t: '펫 · 채팅 · 새 낚시터', s: ['상자에서 나온 <b>펫</b> 데리고 다니기', '채팅으로 인사하기', 'Lv.30 <b>운하</b>, Lv.70 <b>달</b>로'] }
  ];
  $('steps').innerHTML = STEPS.map((s, i) => `<li class="step"><div class="n"><span>${i + 1}</span><em class="chip o">${esc(s.ch)}</em></div><img src="${s.img}" alt="" loading="lazy"><b>${esc(s.t)}</b><ul>${s.s.map((x) => `<li>${x}</li>`).join('')}</ul></li>`).join('');

  /* ── 공략 · 가이드북 (게임 BOOK 과 같은 내용) */
  const BOOK = [
    { c: '낚시', t: '물고기 낚기', s: ['빈 데크 의자에 앉아요', '<b>낚시 시작</b> → 기다려요', '머리 위 <b>!</b>가 뜨면 바로 눌러요'], tip: '좋은 미끼와 낚싯대를 쓰면 큰 물고기가 잘 물어요', img: 'img/fish-bass.png' },
    { c: '낚시', t: '자동 낚시', s: ['자동 낚시 이용권을 얻어요', '<b>자동 낚시</b> 버튼으로 켜요', '어항이 차면 멈춰요'], tip: '이용권 시간은 켜 둔 동안만 흘러요', img: 'img/feat-coins.png' },
    { c: '어항', t: '어항 보기', s: ['아래 <b>어항</b> 버튼', '물고기를 눌러 자세히 봐요', '필요 없는 물고기는 팔아요'], tip: '잠금(🔒)을 걸면 실수로 팔지 않아요', img: 'img/tanks-m.png' },
    { c: '상점', t: '상점 쓰기', s: ['아래 <b>상점</b> 버튼', '미끼·낚싯대·꾸미기를 골라요', '가방에서 장착해요'], tip: '상점에서 산 물건은 30% 값에 되팔 수 있어요', img: 'img/feat-coins-gold.png' },
    { c: '상자', t: '행운 상자', s: ['낚시하다 보면 상자가 나와요', '<b>상자</b> 버튼으로 열어요', '등급이 높을수록 좋은 게 나와요'], tip: '신화 상자에서는 아주 드물게 로봇 캐릭터 이용권이 나와요', img: 'img/feat-chest.png' },
    { c: '요리', t: '그릴 요리', s: ['의자에 앉으면 <b>그릴</b> 버튼', '구울 물고기를 골라요', '먹으면 배부름과 효과가 생겨요'], tip: '다 익었을 때 뒤집으면 더 맛있어요', img: 'img/cook-ico-skewer.png' },
    { c: '합성', t: '물고기 합성', s: ['같은 물고기·같은 별 <b>3마리</b>', '<b>합성</b>을 눌러 별 올리기', '가끔 <b>변이</b>(블랙~무지개)'], tip: '재료 등급이 높을수록 변이가 잘 나오고 정수도 더 받아요', img: 'img/feat-cauldron.png' },
    { c: '합성', t: '합성 등급 보상', s: ['재료 등급: 일반 → 고급 → 희귀 → 전설 → 신화 → 초월', '등급이 높을수록 <b>정수</b>를 더 받아요', '등급별 첫 ★5에 <b>「○○ 별 장인」</b> 칭호'], tip: '희귀 이상은 변이 확률이 ×1.2, 신화·초월은 ×1.5예요', img: 'img/box-t4.png' },
    { c: '모험', t: '물고기 모험', s: ['물고기 <b>3마리</b>를 골라요', '지도에서 갈 곳을 골라요', '돌아오면 보상 받기'], tip: '합성 촉매는 모험에서만 얻어요', img: 'img/feat-piece.png' },
    { c: '펫', t: '펫', s: ['상자에서 가끔 펫이 나와요', '<b>가방 › 펫</b>에서 데리고 다녀요', '펫도 레벨이 올라요'], tip: '펫 낚시 이용권이 있으면 펫이 대신 낚아요', img: 'img/feat-flower.png' },
    { c: '도감', t: '도감', s: ['아래 <b>도감</b> 버튼', '만난 물고기가 기록돼요', '별과 변이도 모아요'], tip: '처음 보는 물고기는 그림자로 보여요', img: 'img/fish-bluegill.png' },
    { c: '낚시터', t: '운하 · 달', s: ['Lv.30: 불빛 가득한 <b>운하</b>', 'Lv.70: 헬멧 쓰고 <b>달</b>', '맵마다 물고기가 달라요'], tip: '운하에서는 소원 연등을 띄울 수 있어요', img: 'img/fish-chamdom.png' }
  ];
  const TCATS = ['전체', ...new Set(BOOK.map((b) => b.c))];
  let tc = store.get('fcg_tc') || '전체'; if (!TCATS.includes(tc)) tc = '전체';
  const plain = (h) => h.replace(/<[^>]+>/g, '');
  function drawTips() {
    const q = $('tipQ').value.trim();
    $('tipCats').innerHTML = TCATS.map((c) => `<button type="button" class="${!q && c === tc ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
    const L = BOOK.filter((b) => q ? plain(b.t + ' ' + b.s.join(' ') + ' ' + b.tip + ' ' + b.c).includes(q) : (tc === '전체' || b.c === tc));
    $('tipList').innerHTML = L.length ? L.map((b) => `<article class="tip"><div class="hd"><img src="${b.img}" alt="" loading="lazy"><div><span class="chip b">${esc(b.c)}</span><b>${esc(b.t)}</b></div></div><ol>${b.s.map((x) => `<li>${x}</li>`).join('')}</ol><div class="tp">💡 ${esc(b.tip)}</div></article>`).join('') : `<div class="empty">「${esc(q)}」에 맞는 공략이 없어요</div>`;
  }
  $('tipCats').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; tc = b.dataset.c; store.set('fcg_tc', tc); $('tipQ').value = ''; drawTips(); });
  $('tipQ').addEventListener('input', drawTips);
  drawTips();

  /* ── 게시판 (읽기 전용) */
  const BCATS = ['전체', '공지', '업데이트', '자유', '질문', '자랑', '공략', '건의', '버그제보'];
  const BCOL = { 공지: 'r', 업데이트: 'p', 자유: 'g', 질문: 'b', 자랑: 'y', 공략: 'o', 건의: 'g', 버그제보: 'r' };
  let bc = '전체', bdSeq = 0;
  const when = (t) => { let n = +t || Date.parse(t) || 0; if (n && n < 1e12) n *= 1000; if (!n) return ''; const d = new Date(n), now = Date.now(), m = Math.floor((now - n) / 60000); if (m < 1) return '방금'; if (m < 60) return m + '분 전'; if (m < 1440) return Math.floor(m / 60) + '시간 전'; return (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; };
  function drawBCats() { $('bdCats').innerHTML = BCATS.map((c) => `<button type="button" class="${c === bc ? 'on' : ''}" data-c="${esc(c)}">${esc(c)}</button>`).join(''); }
  async function loadPosts() {
    const my = ++bdSeq; const box = $('bdList'); box.innerHTML = '<div class="empty">글을 불러오는 중…</div>';
    try {
      const u = API + '/posts?limit=15' + (bc === '전체' ? '' : '&cat=' + encodeURIComponent(bc));
      const r = await fetch(u, { cache: 'no-store' }); const j = await r.json(); if (my !== bdSeq) return;
      const L = (j && j.posts) || [];
      box.innerHTML = L.length ? L.map((p) => `<button type="button" class="post" data-id="${esc(p.id)}"><span class="chip ${BCOL[p.cat] || 'g'}">${esc(p.cat)}</span><span class="t">${esc(p.title)}</span>${p.comment_count ? `<span class="cm">${p.comment_count | 0}</span>` : ''}<span class="w">${esc(p.nick)} · ${when(p.created_at)}</span></button>`).join('') : '<div class="empty">아직 글이 없어요</div>';
    } catch (e) { if (my === bdSeq) box.innerHTML = '<div class="empty">게시판을 불러오지 못했어요 · 잠시 후 다시 열어 주세요</div>'; }
  }
  $('bdCats').addEventListener('click', (e) => { const b = e.target.closest('[data-c]'); if (!b) return; bc = b.dataset.c; drawBCats(); loadPosts(); });
  $('bdList').addEventListener('click', (e) => { const b = e.target.closest('.post'); if (b) openPost(b.dataset.id); });
  let lastFocus = null;
  function closeDlg() { $('postDlg').hidden = true; document.body.style.overflow = ''; if (lastFocus) try { lastFocus.focus(); } catch (e) { /* ignore */ } }
  async function openPost(id) {
    lastFocus = document.activeElement; const d = $('postDlg'), body = $('pdBody');
    body.innerHTML = '<div class="empty">불러오는 중…</div>'; d.hidden = false; document.body.style.overflow = 'hidden'; $('pdX').focus();
    try {
      const r = await fetch(API + '/posts/' + encodeURIComponent(id), { cache: 'no-store' }); const j = await r.json();
      if (!j || !j.ok || !j.post) throw new Error('none');
      const p = j.post, cms = j.comments || [];
      const im = p.img ? (/^https?:/.test(p.img) ? p.img : API + p.img) : '';
      body.innerHTML = `<div class="pdH"><span class="chip ${BCOL[p.cat] || 'g'}">${esc(p.cat)}</span><span class="pdMeta">${esc(p.nick)} · ${when(p.created_at)}</span><h3 id="pdT">${esc(p.title)}</h3></div>${im ? `<img class="pdImg" src="${esc(im)}" alt="">` : ''}<div class="pdTxt">${esc(p.body)}</div><div class="cms"><h4>댓글 ${cms.length}</h4>${cms.length ? cms.map((c) => `<div class="c"><b>${esc(c.nick)}</b><small>${when(c.created_at)}</small><div>${esc(c.body)}</div></div>`).join('') : '<span class="mut">아직 댓글이 없어요</span>'}</div><a class="cta sm pdGo" href="${esc(GAME)}">게임에서 댓글 달기</a>`;
    } catch (e) { body.innerHTML = '<div class="empty">글을 불러오지 못했어요</div>'; }
  }
  $('pdX').addEventListener('click', closeDlg);
  $('postDlg').addEventListener('click', (e) => { if (e.target === $('postDlg')) closeDlg(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('postDlg').hidden) closeDlg(); });
  drawBCats(); loadPosts();

  /* ── 업데이트 */
  const UPD = [
    { v: 'v225', d: '11월 22일', t: '🐾 앉으면 펫이 데크 바닥에 보여요', img: 'img/upd-v225-petdeck.jpg', s: ['의자에 앉아 낚시할 때, 낚싯대 빛 때문에 펫이 가려지던 것을 고쳤어요', '펫이 의자 옆이 아니라 데크 바닥(물 반대쪽)에 서서, 빛 밖에서도 잘 보여요', '호숫가·운하 데크와 캠프 의자 모두 같아요'] },
    { v: 'v224', d: '11월 22일', t: '🦈 부캉이 정보 창 흔들림 고침', s: ['슈퍼 초월급 「부산 부캉이」를 낚았을 때 정보 창이 가끔 위아래로 흔들리던 문제를 고쳤어요', '상어 이모티콘 그림이 없어서, 그림으로 바꿨다가 다시 글자로 되돌리기를 반복하던 것이 원인이에요', '같은 종류의 다른 슈퍼 초월 물고기(금빛잉어·혹등고래·가오리·철갑상어)는 이모티콘 그림이 있어 흔들리지 않았어요'] },
    { v: 'v223', d: '11월 22일', t: '🪵 합성할 물고기가 없으면 알려 줘요', img: 'img/upd-v223-mbnone.jpg', s: ['합성판에서 같은 물고기를 합치다 보면, 그 물고기를 더 합칠 수 없을 때 알려 줘요', '예: 향어를 합치고 있는데 판과 보유에 더 합칠 향어가 없으면 「더 합성할 향어가 없어요」라고 나와요', '같은 상태에서는 한 번만 보여요 · 다른 물고기는 그대로 합칠 수 있어요'] },
    { v: 'v222', d: '11월 22일', t: '👑 슈퍼 초월 컷인 창은 직접 닫을 때까지', img: 'img/upd-v222-st-cutin.jpg', s: ['슈퍼 초월급 물고기를 낚았을 때 뜨는 축하 창이, 이제 「닫기」를 누를 때까지 화면에서 사라지지 않아요', '창 오른쪽 아래의 「닫기」 버튼을 눌러 닫아요 · 축하하기 버튼은 그대로예요'] },
    { v: 'v221', d: '11월 22일', t: '🎉 슈퍼 초월 축하가 바로 올라가요', img: 'img/upd-v221-stc.jpg', s: ['다른 사람이 슈퍼 초월급을 낚았을 때, 축하하기를 바로 눌러도 축하 인원이 빠지지 않고 잘 올라가요', '예전에는 너무 빨리 누르면 축하가 안 올라갈 때가 있었어요'] },
    { v: 'v220', d: '11월 22일', t: '🖥 화면 설정 버튼', img: 'img/upd-v220-screen.jpg', s: ['오른쪽 위 메뉴(≡) 바로 왼쪽에 화면 설정 버튼이 생겼어요 · 지금 모드가 아이콘으로 보여요 (전체화면·작은 창일 때 주황)', '누르면 「전체화면」과 「작은 창」 미리보기 중 골라서 아래 버튼으로 바로 바꿀 수 있어요', '「작은 창 설정」으로 기존 작은 창 설정(자동으로 켜기 등)도 그대로 열려요 · 아이폰처럼 전체화면이 안 되는 곳은 방법을 알려 줘요'] },
    { v: 'v219', d: '11월 22일', t: '🖼 작은 창(PiP) 이전 방식으로 되돌림', s: ['작은 창(PiP)이 v218 이전과 같은 방식으로 돌아갔어요', '작은 창 설정 창의 「창 내리면 자동으로 작은 창」 켜기·끄기와 안내 문구도 예전 그대로예요'] },
    { v: 'v218', d: '11월 22일', t: '🖼 작은 창(PiP) 고침', s: ['휴대폰에서 창을 내릴 때 이상한 창이 먼저 뜨고 한 번 더 내려야 작은 창이 되던 문제를 고쳤어요', '휴대폰은 창을 내리기 전에 메뉴 › 「작은 창」 › 「지금 작은 창으로 보기」를 누르면 바로 작은 창이 돼요 (휴대폰 브라우저는 창을 내릴 때 자동으로 띄우는 걸 막아요)', 'PC 크롬·엣지: 소리가 켜진 채로 다른 탭으로 옮기면 작은 창이 자동으로 떠요 (처음 한 번 「허용」) · 창 최소화 때는 미리 버튼을 눌러 주세요', '파이어폭스·사파리도 버튼으로 작은 창을 열 수 있어요'] },
    { v: 'v217', d: '11월 22일', t: '📱 이어하기 화면 작은 폰 정리', s: ['달·운하에서 이어서 들어갈 때 작은 폰(360×640 등)에서 「다음 · 캐릭터 고르기」 버튼이 화면 아래로 잘리던 문제를 고쳤어요'] },
    { v: 'v216', d: '11월 22일', t: '🎁 운영자 보상 창이 더 잘 보여요', s: ['운영자가 보낸 보상을 받을 때, 아이템마다 아이콘·이름·수량이 카드로 보여요', '골드·강화석·상자(등급)·경험치·이용권·미끼·부적·낚싯대·장비·탈것·펫·캐릭터·칭호가 한눈에 구분돼요', '보낸 말(사유)은 위쪽 상자에 따로 적혀 있어요'] },
    { v: 'v215', d: '11월 22일', t: '💰 합성판 판매 숫자 맞춤', img: 'img/upd-v215-sell.jpg', s: ['판매 모드에서 「N마리 팔기」 숫자가 실제로 팔리는 물고기 수와 같아졌어요 · 잠긴 물고기는 세지 않아요 (확인 창 숫자와 같아요)', '골라 둔 잠긴 물고기는 회색 테두리 · 🚫 · 「판매 안 됨」으로 보여요 · 「판에서 빼기」는 그대로 돼요', '잠긴 물고기만 골랐으면 팔기 버튼이 「🔒 팔 수 없어요」로 꺼져요'] },
    { v: 'v214', d: '11월 22일', t: '🧭 물고기 모험 시간 · 잠금 물고기도 출발', img: 'img/adv-time.png', s: ['모험 기본 시간이 1.5배로 늘었어요 (바위 협곡 45분 · 폭포 1시간 30분 · 벚꽃 강 2시간 15분 · 얼음 호수 3시간 · 보물섬 7시간 30분)', '좋은 물고기를 보낼수록 시간이 줄어요 · 등급·별·변이가 높을수록 많이 줄고, 3마리 합쳐 최대 33%까지 줄면 예전 시간과 같아져요', '물고기 칸의 ⏱ −%가 줄어드는 시간, 아래 「원정 시간」 줄에 실제 걸리는 시간이 보여요 · 이미 떠난 원정대는 원래 시간 그대로예요', '🔒 잠금 물고기(합성판 변이 포함)도 모험에 보낼 수 있어요 · 다녀와도 잠금은 그대로라 팔기·방생·합성은 계속 막혀요', '「길 잃은 아기 물고기」 이벤트의 「집까지 데려다 준다」 설명을 실제 보상에 맞게 「지도 조각 +1 확정」으로 고쳤어요'] },
    { v: 'v213', d: '11월 22일', t: '🦈 운하에 슈퍼 초월급 「부산 부캉이」', img: 'img/fish-bukang.png', s: ['운하에서 등불 혹등고래와 같은 확률로 만날 수 있는 슈퍼 초월급 흑상어예요 (자동 낚시는 제외)', '북항의 밤 불빛을 비늘에 담은 모습이에요 · 어항에 두면 골드 +5%', '낚으면 다른 슈퍼 초월과 같이 빛기둥·점프 연출과 전체 서버 공지, 축하 창이 나와요'] },
    { v: 'v212', d: '11월 22일', t: '🪵 합성판 「💰 판매」 버튼', s: ['합성판 아래 「💰 판매·방생」 버튼이 「💰 판매」로 바뀌었어요 · 합성판에서는 팔기만 해요 (방생 없음)', '판매 모드는 그대로예요: 팔 물고기를 눌러 고르고 「팔기」 → 확인 창에서 받을 골드를 보고 팔아요 · 잠긴 물고기는 팔지 않아요'] },
    { v: 'v211', d: '11월 22일', t: '🌙 다시 들어오면 마지막 맵에서 시작', s: ['달이나 운하에서 창을 닫았다가 다시 들어오면 그 맵에서 이어서 시작해요 (예전엔 늘 호숫가로 시작했어요)', '시작 화면에 「마지막에 있던 곳 · 여기서 이어서」 칸이 보여요 · 아래 「또는 호숫가로」에서 호숫가를 고를 수도 있어요', '달은 Lv.50이 안 되거나, 맵이 닫혔거나 가득 차면 원래 있던 호숫가로 시작해요'] },
    { v: 'v210', d: '11월 22일', t: '🪵 합성판 「↩ 모두 빼기」 버튼', s: ['합성판 아래에 「↩ 모두 빼기」 버튼이 생겼어요 · 누르면 판 위 물고기가 한 번에 보유 목록으로 돌아가요', '물고기는 원래 있던 어항(어항 3개)에 그대로 있어요 · 팔거나 방생하지 않아요', '판이 비어 있으면 버튼이 흐려져요 · 합성하는 도중에 눌러도 합성 결과는 그대로 남아요'] },
    { v: 'v209', d: '11월 21일', t: '🧭 물고기 모험 「보물 항로」 지도', s: ['모험 지도가 섬을 1→4단계로 잇는 항로로 바뀌었어요 · 성공한 곳까지 금색 길이 이어져요', '지금 갈 수 있는 가장 높은 단계에 「다음 추천!」이 떠요 · 열자마자 그곳에 보낼 준비가 돼 있어요', '장소마다 골드 범위 · 지도 조각 % · 상자 % · 촉매 %가 숫자로 보여요', '✨ 추천 편성으로 가장 센 3마리가 들어가고, 물고기마다 성공 확률이 얼마나 오르는지(+%) 보여요 · 칸을 누르면 바꿔요', '장소마다 성공 도장(성공 횟수)이 쌓여요', '오른쪽(폰은 지도 아래)에 원정대 3칸 · 돌아온 배는 「보상 받기」, 도중 이벤트는 「도중 이벤트!」 버튼으로 골라요'] },
    { v: 'v208', d: '11월 21일', t: '🐟 낚시 카드 기본 = 오른쪽 알림 카드', s: ['낚시 성공 카드의 기본 모양이 G · 오른쪽 알림 카드가 됐어요 (설정에서 직접 고른 분은 그대로)', '폰에서 할아버지 목표 창에 가려 낚시 카드가 안 보이던 문제를 고쳤어요 · 카드가 목표 창 바로 아래에 떠요'] },
    { v: 'v207', d: '11월 21일', t: '☰ 폰 목록 저장·설정 사라짐 고침', s: ['폰에서 ☰ 목록이 화면보다 길어지면(맵 이동 뒤 등) 저장·설정·후원이 화면 밖 옆 칸으로 밀려 안 보이던 문제를 고쳤어요', '목록이 길면 줄 간격이 조금 줄고, 저장·설정은 목록 아래에 늘 보여요 · 나머지는 목록을 밀어서 봐요'] },
    { v: 'v206', d: '11월 21일', t: '👑 슈퍼 초월급 축하 창 고침', s: ['슈퍼 초월급 물고기를 낚았을 때 낚은 사람과 같은 방 사람들 모두에게 축하(추천) 창이 다시 떠요 · 「축하하기」를 누르면 숫자가 올라가요', '서버 연결이 늦으면 7초 뒤 내 화면에라도 공지가 떠요', '「🔄 새 업데이트」 알림 띠가 공지를 가리지 않게 공지 아래로 내려가요'] },
    { v: 'v206', d: '11월 21일', t: '🐠 어항 규칙 초월 등급 · ☰ 목록 · 저장 코드 동기화', s: ['어항 「넣을 물고기」 규칙에 ✨초월 · 👑슈퍼 초월급 등급과 💎귀한 어종 · 👑매우 귀한 어종(슈퍼 초월급 물고기)이 생겼어요', '☰ 목록 안 숫자(합성·모험·미션)가 줄 모서리가 아니라 이름 옆에 보이고, 목록을 닫아 두면 ☰ 버튼에 빨간 점이 떠요', '가로 화면 폰에서 ☰ 목록 아래쪽 저장·설정이 잘리던 문제를 고쳤어요 (목록을 밀어서 내려요)', '설정 › 저장 코드 복사가 12자리 저장 코드를 복사해요 · 다른 기기에서 그 코드로 불러오면 같은 진행으로 함께 저장돼요', '다른 계정 저장 코드를 불러올 때 원래 계정 저장을 덮어쓰고 동기화가 끊기던 문제를 고쳤어요'] },
    { v: 'v205', d: '11월 21일', t: '🪵 합성판 크게 · 🌈 무지개 공지 · 타격감', s: ['모바일에서 합성판이 화면 크기에 맞춰 꽉 차게 커져요 (작은 폰도 판이 크게 보여요)', '합성판 물고기가 별 단계와 상관없이 같은 크기로 크게 보여요 · 단계는 테두리 색과 ★ 표시로 구분해요', '합성으로 🌈 무지개 물고기를 만들면 모든 서버에 알림이 가요 (★5 알림은 이제 보내지 않아요)', '어항 3개를 쓰면 세 어항의 물고기가 모두 합성판에 나오고, 합성한 물고기는 원래 있던 어항으로 돌아가요', '한 단계 더 올라가는 확률(1%)은 ★1~★4에서만 · ★5부터는 한 단계씩 올라가요', 'PC에서도 합성할 때 판이 쿵 울리고 둘레 칸이 튕겨요 (화면 전체는 흔들리지 않아요)'] },
    { v: 'v204', d: '11월 21일', t: '🪵 합성판 별 단계 · 거르기 · 낚싯대 손', s: ['합성판 물고기가 별이 오를수록 커지고 테두리 색이 바뀌어요 (★1 흰색 → ★2 초록 → ★3 파랑 → ★4 보라 → ★5 주황) · 왼쪽 위에 작은 ★ 표시', '보유 물고기를 [전체] [★1]~[★5] [변이]로 골라 볼 수 있어요 · ★2 이상 물고기도 목록에 나와요', '방금 합성한 물고기를 바로 옮기거나 다시 합칠 수 있어요', '한 단계 더 올라가는 확률은 ★1~★5에서 1%예요 · 블랙부터는 한 단계씩만 올라가요', '모든 캐릭터가 낚싯대 손잡이를 손(앞발)으로 꼭 쥐어요 (크리스마스 캐릭터 포함)'] },
    { v: 'v203', d: '11월 20일', t: '🎄 한정 캐릭터 이벤트 켜기 고침', s: ['운영자가 크리스마스 이벤트를 켜면 캐릭터 고르기에 🎄 한정 탭이 바로 보여요'] },
    { v: 'v202', d: '11월 20일', t: '🎄 크리스마스 한정 캐릭터', s: ['12월 1일~31일에만 얻을 수 있는 한정 캐릭터 3종: 반짝코 루돌프 · 선물자루 산타 · 눈송이 눈사람', '⛄ 눈사람: 12월에 7일 출석 · 🦌 루돌프: ❄️ 눈송이 300개 교환 · 🎅 산타: 12월 24~25일 물고기 100마리 또는 ❄️ 800개 교환', '❄️ 눈송이는 물고기 1마리마다 1개(하루 60개까지)와 그날 첫 접속 10개로 모여요', '이벤트가 끝나도 얻은 캐릭터는 계속 쓸 수 있어요 (캐릭터 고르기 🎄 한정 탭)'] },
    { v: 'v201', d: '11월 20일', t: '🔊 소리·레벨·합성판 정리', s: ['합성 소리가 잘 들리게 효과음 크기를 모두 다시 맞췄어요 (효과음은 「전체 소리 × 효과음」 크기를 따라요)', 'Lv90부터 다음 레벨까지 필요한 경험치가 크게 늘어요 (지금 레벨은 내려가지 않아요)', '경험치 알림이 화면 가운데에 뜨지 않아요: 낚시 카드·컷인·작은 알림 안이나 레벨 표시 아래에 보여요', '합성판에서는 운하로·호숫가로·지구로 버튼이 숨고, 행운 상자 알림은 빈 자리로 옮겨져요'] },
    { v: 'v200', d: '11월 20일', t: '🪵 합성판 레벨', s: ['합성을 많이 할수록 합성판이 커져요: 누적 1,000회 6×6 · 10,000회 7×7', '판 위쪽 「판 Lv」 표시에 다음 크기까지 남은 횟수가 보여요 (누르면 안내 창)', '판이 커져도 원래 물고기는 같은 자리에 그대로 있어요'] },
    { v: 'v199', d: '11월 20일', t: '🎣 운하 던지기·꾸미기 버튼', s: ['운하에서 내가 바라보는 정면으로 낚싯대를 던져요 (정면이 물이 아니면 의자 방향)', '합성판이나 다른 창을 열면 데크 꾸미기 버튼이 가리지 않아요'] },
    { v: 'v198', d: '11월 20일', t: '🐉 용왕 이상 낚싯대 새 모습', s: ['용왕·신화·초월 낚싯대가 굵어지고, 끝에 용머리와 여의주가 달려요', '여의주 뒤로 등급 색 광륜이 떠서 멀리서도 등급이 보여요', '발밑에 빛 고리가 깔려요 (초월은 빛기둥까지)', '내 낚싯대는 낚싯줄도 등급 색으로 빛나고, 던질 때 찌 뒤에 빛 꼬리가 생겨요'] },
    { v: 'v197', d: '11월 20일', t: '🖼 작은 창·메뉴·알림 정리', s: ['☰ 메뉴를 열면 알림과 떠 있는 버튼보다 위에 보여요', '합성판을 열면 알림이 판·목록·버튼을 가리지 않는 빈 자리로 작게 옮겨져요', '작은 창(PiP)이 창을 내린 동안에도 1초에 60번 부드럽게 움직여요', 'PC 크롬·엣지는 작은 창이 새 창으로 떠서 자유롭게 옮기고 크기를 바꿀 수 있어요 · 화면을 누르면 챔질'] },
    { v: 'v196', d: '11월 20일', t: '✨ 초월 부적 (쌍잉어 성운)', s: ['신화 위 새 등급 「초월 부적」: 기본 옵션 3줄(신화 최대치의 100~130%) + 진행 보조 2줄(⭐ 경험치 · 🎁 상자 행운)', '초월 공명: 초월 부적 1개마다 9가지 옵션이 모두 올라가고, 상한 돌파로 합산 상한도 +4%씩 (6개 +24%)', '6칸 모두 초월 부적을 낄 수 있어요 · 6개면 거의 모든 옵션이 꽉 차요', '행운 상자마다 1/5,000 · 신화 3개 합성 때 1% 확률 · 얻으면 전체 서버 공지', '분해: 🪙25,000 · 💎30 (두 번 확인) · 모두 합성·일괄 분해에서는 빠져요'] },
    { v: 'v195', d: '11월 20일', t: '⭐ 합성판 교환소·변이 도감', s: ['합성판에서 바로 별 조각 교환소를 열 수 있어요', '변이 도감 5칸과 5종 완성 보상을 합성판에서 볼 수 있어요', '★5를 만들면 같은 호숫가에 알림이 가고, 등급마다 처음 ★5에 칭호를 받아요', '판이 가득 차서 합칠 게 없을 때도 알림창이 떠요'] },
    { v: 'v194', d: '11월 20일', t: '🪵 합성판 편의 기능', s: ['판의 물고기를 오른쪽 클릭(모바일은 꾹 누르기)하면 보유 물고기로 돌아가요', '5초 동안 가만히 있으면 합칠 수 있는 물고기를 흔들어 알려줘요', '합성할 물고기가 없으면 알림창이 떠요', '테스트 중에는 합성 횟수가 무제한이에요', '정리 버튼이 항상 보여요'] },
    { v: 'v193', d: '11월 20일', t: '🌟 응원 버튼 · 상점 할인 · 합성판 서버', s: ['슈퍼 초월급 컷인: 다른 사람 화면 30초 · 응원 버튼 고침', '장비의 상점 할인이 실제 가격에 들어가요', '가방 효과 합계 글씨를 잘 보이게 고쳤어요', '다른 기기·브라우저로 들어와도 마지막 위치에서 시작해요', '새 합성판: 하루 횟수를 서버가 세요 (연결이 없으면 기본 30회)', '새 합성판: 물고기를 누르면 그 물고기를 모두 판에 넣어요'] },
    { v: 'v192', d: '11월 20일', t: '🪵 새 합성판 (테스트)', s: ['나무 작업대 합성판을 테스트 기능에 넣었어요 (지금 합성은 그대로예요)'] },
    { v: 'v191', d: '11월 20일', t: '🎁 지급·교환소', s: ['운영자 지급을 접속하지 않았을 때 받아도 다음 접속 때 받아요 (운하에 있어도 받아요)', '별 조각 교환소: 강화석 꾸러미 ×10 · 크기 변화 이용권(1시간) · 부적 옵션 다시 뽑기권 · 전설 행운 상자', '물고기 자랑 때 닉네임·칭호가 가려지지 않아요', '동물 캐릭터도 이모션을 해요', '어항 여러 마리 선택에서 등급·별·변이로 한 번에 골라요'] },
    { v: 'v190', d: '11월 20일', t: '🏮 새 소원 오브젝트', s: ['운하 소원 연등이 둥근 한지 연등으로 바뀌었어요', '호숫가 소원 돛단배는 하얀 돛 나무배 (최대 20척, 돛에 닉네임)', '달에서도 「⭐ 소원 별」로 하늘의 별 하나에 소원을 걸 수 있어요', '맵마다 다른 소원 카드와 띄우기 창'] },
    { v: 'v189', d: '11월 20일', t: '⭐ 별 조각 · 모루', s: ['신화 행운 상자를 별 조각 50개로 횟수 제한 없이 바꿀 수 있어요', '낚싯대 모루 합성은 같은 낚싯대 대신 별 조각으로 ★+1 (높은 등급·높은 별일수록 많이)', '어항을 위아래로도 돌려 보고 더 멀리서 볼 수 있어요', '운하 둘러보기가 운하 위를 따라 날아요'] },
    { v: 'v188', d: '11월 20일', t: '🐠 어항 3개 · 운하', s: ['어항 3개를 쓰면 위 정보줄에 3개를 합친 물고기 수·크기가 보여요', '대표 어항이 가득 차도 다른 어항에 자리가 있으면 규칙대로 넣어요 (팔지 않아요)', '운하 둘러보기가 호숫가처럼 운하 전체를 크게 한 바퀴 돌아요', '이모션은 움직이지 않는 동안 계속돼요 (같은 이모션을 다시 누르면 멈춰요)', '운하에 있는 사람도 서버 인원에 들어가요'] },
    { v: 'v186', d: '11월 20일', t: '🕺 이모션 버튼', s: ['모바일에서 채팅창을 닫아 두거나 작은 채팅창일 때도 🕺 이모션 버튼이 따로 떠 있어요'] },
    { v: 'v185', d: '11월 20일', t: '🛠 미션·관리 개선', s: ['일일 미션 「골드 벌기」에 자동 판매·거래·펫 골드 주머니로 번 골드도 들어가요', '다시 들어오면 시간과 상관없이 있던 자리에서 시작해요', '관리자·운영자의 슈퍼 초월급 테스트 낚시가 다시 돼요'] },
    { v: 'v184', d: '11월 19일', t: '👑 슈퍼 초월급 물고기', s: ['맵마다 한 종, 아주 드물게 나오는 슈퍼 초월급 물고기 (호숫가 · 운하 · 달)', '낚으면 빛기둥과 점프 연출, 전체 서버에 몇 번째인지 공지돼요', '다른 서버 사람도 🎉로 축하할 수 있어요', '어항에 두면 골드·경험치 같은 작은 효과가 생겨요'] },
    { v: 'v183', d: '11월 19일', t: '이모션 9가지 · 요트 4인승 · 연등 이름', s: ['채팅창 옆 🕺로 춤·웃기·울기·박수·인사·졸기·낚싯대 자랑 등 9가지 이모션', '요트가 조금 작아지고 4명이 같이 타요', '운하 연등 위에 띄운 사람 닉네임이 빛나는 글씨로', '거북이가 물가 어디서든 물로 들어가고 거북이 위에서 낚시해요 (달 포함)'] },
    { v: 'v182', d: '11월 19일', t: '소원 돛단배 · 메뉴 정리 · 노 젓기', s: ['호숫가에서도 ⛵ 소원 돛단배를 띄워요 (연등과 같은 10,000골드)', '오른쪽 위 메뉴가 ☰ 하나로 깔끔하게 · 설정에서 오른쪽 서랍으로 바꿀 수 있어요', '노 젓는 보트가 진짜로 노를 저어요 · 배 위에서 손을 내리고 타요', 'UFO에 끝까지 빨려 들어가요 · 작은 창에 채팅이 보여요'] },
    { v: 'v181', d: '11월 19일', t: '달 점프 · 운하 둘러보기 · 어항', s: ['달에서는 점프하면 붕~ 오래 떠 있어요', '운하 자동 둘러보기가 끊기지 않고 부드럽게', '휴대폰에서 어항 3칸이 한 줄에 다 보여요', '작은 창이 창을 내려도 더 부드럽게 (30프레임)'] },
    { v: 'v180', d: '11월 19일', t: '달의 지구 · UFO · 작은 창', s: ['달에서 지구가 천천히 돌아요 · 지구를 누르면 소개가 떠요', 'UFO 빨아들이기가 훨씬 높이, 빙글빙글 · 끌려가는 사람 화면에서도 보여요', '작은 창이 게임과 같은 속도로 · 두 번째부터 안 뜨던 문제 해결', '합성 정수가 조금 덜 나와요'] },
    { v: 'v179', d: '11월 19일', t: '요리 · 작은 창 · 운하 의자', s: ['합성 별(★)이 높은 물고기로 구우면 효과가 더 세져요 (★5 ×1.8)', '작은 창이 게임을 느리게 하지 않아요 · 게임으로 돌아오면 저절로 닫혀요', '운하 의자 앞에서 「앉기」가 제대로 떠요'] },
    { v: 'v178', d: '11월 18일', t: '진짜 라이브 관전', s: ['홈페이지 라이브 화면에 지금 낚시 중인 사람들이 그대로 보여요', '카메라가 20초마다 다른 사람을 따라가요 · 관전자는 서버 인원에 안 들어가요'] },
    { v: 'v177', d: '11월 18일', t: '뒤로가기 · 작은 창 개선', s: ['휴대폰 뒤로가기를 누르면 바로 나가지 않고 확인 창이 떠요', '작은 창(PiP)이 더 잘 열리고, 작은 창의 ⏸ 버튼으로 챔질돼요', '게임 메뉴에 「홈페이지」 버튼이 생겼어요'] },
    { v: 'v176', d: '11월 18일', t: '가이드 홈페이지 열림', s: ['처음 시작 안내 · 공략 · 게시판을 한곳에', '낚시터 라이브 화면 (호숫가 · 운하 · 달)'] },
    { v: 'v174', d: '11월 18일', t: '합성 등급 보상', s: ['재료 등급이 높을수록 정수와 변이 확률이 올라요', '등급별 첫 ★5에 「별 장인」 칭호', '새 업데이트 확인 후 멈추던 문제 해결'] },
    { v: 'v173', d: '11월 18일', t: '가로 화면 자동 낚시', s: ['휴대폰 가로 모드에서도 자동 낚시 버튼이 보여요'] },
    { v: 'v172', d: '11월 18일', t: '새 캐릭터 6명 · 로봇 이용권', s: ['Lv.15 ~ 53 사이 새 친구 6명', '유령은 Lv.85, 로봇은 신화 상자 이상에서 드물게 이용권', '게스트 닉네임이 나1, 나2 … 처럼 모두 달라져요'] }
  ];
  $('updList').innerHTML = UPD.map((u) => `<article class="u"><span class="v">${u.v} · ${u.d}</span><b>${esc(u.t)}</b>${u.img?`<img class="uimg" src="${esc(u.img)}" alt="">`:''}<ul>${u.s.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></article>`).join('');
})();
