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
  $('updList').innerHTML = UPD.map((u) => `<article class="u"><span class="v">${u.v} · ${u.d}</span><b>${esc(u.t)}</b><ul>${u.s.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></article>`).join('');
})();
