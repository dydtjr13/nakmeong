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
  const watchURL = (m) => { const u = new URL(GAME, location.href); u.searchParams.set('uiprev', 'watch'); u.searchParams.set('rt', 'off'); u.searchParams.set('map', m); return u.toString(); };
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
    { v: 'v176', d: '11월 18일', t: '가이드 홈페이지 열림', s: ['처음 시작 안내 · 공략 · 게시판을 한곳에', '낚시터 라이브 화면 (호숫가 · 운하 · 달)'] },
    { v: 'v174', d: '11월 18일', t: '합성 등급 보상', s: ['재료 등급이 높을수록 정수와 변이 확률이 올라요', '등급별 첫 ★5에 「별 장인」 칭호', '새 업데이트 확인 후 멈추던 문제 해결'] },
    { v: 'v173', d: '11월 18일', t: '가로 화면 자동 낚시', s: ['휴대폰 가로 모드에서도 자동 낚시 버튼이 보여요'] },
    { v: 'v172', d: '11월 18일', t: '새 캐릭터 6명 · 로봇 이용권', s: ['Lv.15 ~ 53 사이 새 친구 6명', '유령은 Lv.85, 로봇은 신화 상자 이상에서 드물게 이용권', '게스트 닉네임이 나1, 나2 … 처럼 모두 달라져요'] }
  ];
  $('updList').innerHTML = UPD.map((u) => `<article class="u"><span class="v">${u.v} · ${u.d}</span><b>${esc(u.t)}</b><ul>${u.s.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></article>`).join('');
})();
