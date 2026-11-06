// 출처: 톡시도 금칙어 필터 (profanity.js) 이식 — 낚멍 v15
(()=>{
// 톡시도 금칙어 필터 — 띄어쓰기·기호·숫자 끼워넣기(시1발)·반복(씨이이발 → 씨이발 → 씨발 계열)·초성(ㅅㅂ)·리트(f4ck) 우회 대응
// 저장: db.profanity = { enabled, words: [...], allow: [...] } (관리자 콘솔 '금칙어 관리'에서 편집)

// ── 기본 시드 (수백 개: 어근 × 변형) ──
const KO_ROOTS = {
  '씨발': ['씨발', '시발', '씨빨', '시빨', '씨바', '시바', '씨팔', '시팔', '씨벌', '시벌', '씹새', '씹새끼', '씹년', '씹놈', '씹창', '썅', '쌍놈', '쌍년', '쓰발', '쓰벌', '쒸발', '쓉', '씨부랄', '시부랄', '씨부럴', '십알', '십새', '십새끼', '싀발', '싑', '씌발', '띠발', '띠바', 'ㅆㅂ', 'ㅅㅂ', 'ㅆㅃ', 'ㅅㅃ', 'ㅆ발', 'ㅅ발', '씨ㅂ', '시ㅂ', '씨발놈', '씨발년', '씨발새끼', '시발놈', '시발년', '시발새끼', '씨댕', '시댕', '씨뎅'],
  '병신': ['병신', '븅신', '빙신', '병쉰', '병시나', '병딱', '등신', '병신새끼', '빙딱', 'ㅂㅅ', 'ㅄ', 'ㅂ신', '병ㅅ', '머저리', '찐따', '찐다'],
  '좆': ['좆', '좃', '좇같', '좆같', '좃같', '존나', '졸라', '존니', '조낸', '존내', '좆나', '좆까', '좆밥', '좆만', '좆도', '좆망', '좆병신', 'ㅈㄴ', 'ㅈ같', 'ㅈ까', '좁밥', '조까'],
  '개새끼': ['개새끼', '개새기', '개색기', '개색끼', '개쉐이', '개쉑', '개세끼', '개섀끼', '개시키', '개새', '개년', '개놈', '개자식', '개좆', '개씹', '개지랄', '개같은', '개같이', '개돼지', '개호로', '개뼉다구', '새끼야', '색기야', '새꺄', '섀꺄', '쌔끼', '쎄끼', 'ㄱㅅㄲ', 'ㅅㄲ', '개ㅅㄲ'],
  '지랄': ['지랄', '지럴', '즤랄', '찌랄', '지랄하네', '지랄마', '염병', '얌병', '옘병', 'ㅈㄹ'],
  '미친': ['미친놈', '미친년', '미친새끼', '미친개', '미친것', '미췬', '미칀', '미친련', '또라이', '돌아이', '똘아이', '정신병자', '싸이코새끼', 'ㅁㅊ', 'ㅁㅊㄴ'],
  '꺼져': ['꺼져', '꺼지라', '닥쳐', '닥치라', '닥쳐라', '아가리', '아갈', '주둥이닥', '뒤져', '뒤져라', '뒈져', '뒈지', '디져', '디질', '죽어라', '죽여버', '죽인다', '나가뒤져'],
  '니미': ['니미', '니애미', '니에미', '니엄마', '느금', '느금마', '느그애미', '느개비', '니애비', '엠창', '씹할', '씹같', '씹덕새끼', '씹쌔', '엠생', '앰창', '니기미', '니미럴', '느검마', '패드립', '엄창', '부모없', 'ㄴㄱㅁ', 'ㄴㄱㅁ'],
  '성적': ['보지', '보짓', '자지', '잦이', '좆물', '정액', '섹스', '쎅스', '섹1스', '야동', '딸딸이', '딸치', '자위', '강간', '윤간', '성폭행', '보빨', '젖꼭지', '꼬추', '고추빨', '빠구리', '떡치', '떡쳐', '오르가즘', 'sex', '포르노', '창녀', '창년', '걸레년', '갈보', '화냥', '매춘', '원조교제', '조건만남', '몸팔', '섹파', '오피녀', '야한사진', '알몸', '노출사진', '몸매사진'],
  '혐오': ['한남충', '김치녀', '맘충', '틀딱', '급식충', '된장녀', '보슬아치', '꼴페미', '메갈', '한녀', '흑형', '깜둥이', '짱깨', '쪽바리', '조센징', '똥남아', '애자', '장애새끼', '병자새끼', '게이새끼', '호모새끼', '레즈년', '트젠충', '난민충', '전라디언', '과메기', '할매미', '노인충', '페미년', '일베충', '대깨', '틀니', '절뚝이', '벙어리새끼', '귀머거리새끼', '찐따새끼'],
  '기타': ['호로', '호로새끼', '후레자식', '쌍판', '대가리깨', '뻐큐', '빠큐', '퍽큐', '엿먹어', '엿이나', '똥꼬충', '빡대가리', '돌대가리', '닭대가리', '골빈', '저능아', '저능', '빠가', '바보새끼', '멍청한새끼', '쓰레기새끼', '인간쓰레기', '버러지', '벌레새끼', '좆밥새끼', '양아치', '잡놈', '잡년', '썩을놈', '썩을년', '육시랄', '오라질', '빌어먹을', '니가뭔데', '디지고', '주길', '자살해', '목매', '칼빵', '패죽', '쳐죽', '찢어죽'],
};
const EN = ['fuck', 'fucker', 'fucking', 'fuckin', 'fucked', 'fuckoff', 'fuckyou', 'motherfucker', 'mf', 'mfer', 'stfu', 'gtfo', 'wtf', 'fck', 'fuk', 'fuq', 'phuck', 'fvck', 'shit', 'shitty', 'bullshit', 'shithead', 'sht', 'bitch', 'bitches', 'biatch', 'btch', 'bastard', 'asshole', 'ass', 'arse', 'arsehole', 'dumbass', 'jackass', 'cunt', 'dick', 'dickhead', 'cock', 'cocksucker', 'pussy', 'twat', 'wanker', 'prick', 'slut', 'whore', 'hoe', 'skank', 'retard', 'retarded', 'nigger', 'nigga', 'negro', 'chink', 'gook', 'spic', 'kike', 'faggot', 'fag', 'dyke', 'tranny', 'porn', 'porno', 'boobs', 'tits', 'titties', 'nude', 'nudes', 'blowjob', 'handjob', 'rape', 'rapist', 'cum', 'jizz', 'dildo', 'horny', 'milf', 'killyourself', 'kys', 'suck my', 'sonofabitch', 'damn', 'goddamn', 'crap', 'piss', 'pissed', 'douche', 'douchebag', 'moron', 'idiot', 'loser'];
const EN_SUFFIX = ['er', 'ers', 'ing', 'ed', 's', 'face', 'head'];
function buildSeed() {
  const set = new Set();
  for (const list of Object.values(KO_ROOTS)) for (const w of list) { set.add(w); if (/[가-힣]$/.test(w) && w.length >= 2 && !/[ㄱ-ㅎ]/.test(w)) { set.add(w + '아'); set.add(w + '야'); } }
  for (const w of EN) { set.add(w); if (w.length >= 4 && !/\s/.test(w)) for (const s of EN_SUFFIX) set.add(w + s); }
  return [...set];
}
const SEED_ALLOW = ['시발점', '시발역', '시발택시', '시발자동차', '시발로', '시바견', '시바이누', '병신년', '병신춘문예', '신병신고', '자지러', '보지도', '보지마', '보지않', '봤지', '애비뉴', '에미넴', '수박씨발라', '씨발라먹', '고추장', '고추가루', '고춧가루', '풋고추', '청양고추', '젖소', '젖병', '젖먹', '자위대', '개미', '개새우', '좆도마뱀', '존나이', '호로록', '호로비츠', '홍어회', '홍어무침', '홍어삼합', '과메기', '애자일', '꺼져가', '미친듯이', '대가리', '저능력', '알몸김밥', '정액제', '정액권', '정액요금', '보지마', '보지말', '보지못', '안보지', '못보지', '보지요', '걸레질', '걸레로', '물걸레', 'class', 'classic', 'assist', 'assistant', 'assume', 'assignment', 'assess', 'pass', 'passion', 'glass', 'grass', 'mass', 'bass', 'brass', 'embassy', 'massage', 'scunthorpe', 'cocktail', 'cockpit', 'peacock', 'hancock', 'shiitake', 'dickens', 'dickinson', 'therapist', 'grape', 'drape', 'scrape', 'skyscraper', 'cucumber', 'document', 'circumstance', 'title', 'hoes', 'shoe', 'shoes', 'piston', 'crapper', 'analysis', 'shitake', 'hello', 'uranus', 'mfg', 'snigger', 'spice', 'spicy', 'button', 'butter', 'pussycat', 'damnation', 'retardant', 'idiom'];

// ── 정규화 ──
const JAMO_INITIAL = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const LEET = { '0': 'o', '1': 'i', '!': 'i', '|': 'i', '3': 'e', '4': 'a', '@': 'a', '5': 's', '$': 's', '7': 't', '+': 't', '8': 'b', '9': 'g', '€': 'e', 'ø': 'o' };
const collapse = (s) => s.replace(/(.)\1+/g, '$1');
// 모음 늘이기(씨이이발 → 씨발): 앞 글자와 같은 모음의 'ㅇ+모음' 음절 제거
const VOWEL_OF = (ch) => { const c = ch.charCodeAt(0) - 0xAC00; return c >= 0 && c < 11172 ? Math.floor((c % 588) / 28) : -1; };
const BARE = (ch) => { const c = ch.charCodeAt(0) - 0xAC00; return c >= 0 && c < 11172 && Math.floor(c / 588) === 11 && c % 28 === 0; }; // '아/이/으…' (받침 없는 ㅇ초성)
function koStream(text) { // 반환: { s: 정규화 문자열, w: 각 글자의 원래 단어 번호, st: 그 단어의 첫 글자인지 }
  const src = String(text).normalize('NFC'); let s = '', w = [], st = [], wi = 0, fresh = true;
  for (const ch of src) {
    if (/\s/.test(ch)) { if (!fresh) wi++; fresh = true; continue; }
    if (!/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(ch)) continue; // 기호·숫자·영문 제거 (시1발, 씨.발)
    const prev = s[s.length - 1];
    if (prev === ch || (prev && BARE(ch) && VOWEL_OF(ch) === VOWEL_OF(prev))) { fresh = false; continue; } // 반복·모음 늘이기
    s += ch; w.push(wi); st.push(fresh); fresh = false;
  }
  return { s, w, st };
}
const koNorm = (t) => koStream(t).s;
function enTokens(text) {
  const t = String(text).toLowerCase().replace(/([a-z0-9])[*#._\-~]+(?=[a-z0-9])/g, '$1').replace(/[0-9!|@$+€ø]/g, c => LEET[c] || c);
  let toks = t.split(/[^a-z]+/).filter(Boolean);
  // f u c k / f.u.c.k → 한 글자 토큰 이어붙이기
  const merged = []; let run = '';
  for (const k of toks) { if (k.length === 1) run += k; else { if (run) merged.push(run); run = ''; merged.push(k); } }
  if (run) merged.push(run);
  return merged;
}
const enRaw = (w) => String(w).toLowerCase().replace(/[0-9!|@$+€ø]/g, c => LEET[c] || c).replace(/[^a-z]/g, '');
const enNorm = (w) => collapse(enRaw(w));
const isEn = (w) => /^[a-z0-9\s!|@$+]+$/i.test(w);

function compile(conf) {
  const ko = new Set(), en = new Set(), koAllow = [], enAllow = new Set();
  for (const w of conf.words || []) { if (!w) continue; if (isEn(w)) { const n = enRaw(w); if (n) en.add(n); } else { const n = koNorm(w); if (n) ko.add(n); } }
  for (const w of conf.allow || []) { if (!w) continue; if (isEn(w)) enAllow.add(enRaw(w)); else { const n = koNorm(w); if (n) koAllow.push(n); } }
  return { ko: [...ko].sort((a, b) => b.length - a.length), en: [...en].map(r => ({ r, c: collapse(r) })), enAllow: [...enAllow], koAllow: koAllow.sort((a, b) => b.length - a.length) };
}
function makeFilter(getConf) {
  let cache = null, key = '';
  const c = () => { const conf = getConf(); const k = (conf.words || []).length + ':' + (conf.allow || []).length + ':' + (conf.rev || 0); if (k !== key) { cache = compile(conf); key = k; } return cache; };
  function check(text) {
    const conf = getConf(); if (!conf.enabled || !text) return { hit: false, words: [] };
    const C = c(); const words = [];
    const K = koStream(text), mask = new Array(K.s.length).fill(false);
    for (const a of C.koAllow) { let i = -1; while ((i = K.s.indexOf(a, i + 1)) !== -1) for (let j = i; j < i + a.length; j++) mask[j] = true; } // 허용어 구간 제외
    for (const w of C.ko) { let i = -1;
      while ((i = K.s.indexOf(w, i + 1)) !== -1) { const e = i + w.length - 1;
        if (mask.slice(i, e + 1).some(Boolean)) continue;
        if (K.w[i] !== K.w[e] && !K.st[i]) continue; // '다시 발표'처럼 앞 단어의 끝에서 시작해 띄어쓰기를 넘는 경우는 제외
        words.push(w); break; }
      if (words.length > 4) break; }
    for (const raw0 of enTokens(text)) { const raw = raw0.replace(/(.)\1{2,}/g, '$1$1'), tok = collapse(raw);
      if (C.enAllow.includes(raw) || C.enAllow.includes(tok)) continue;
      for (const w of C.en) { const long = w.c.length >= 4;
        if (raw === w.r || (w.c.length >= 3 && tok === w.c) || (long && tok.includes(w.c) && !C.enAllow.some(a => a.includes(w.r) && raw.includes(a)))) { words.push(w.r); break; } }
    }
    return { hit: words.length > 0, words };
  }
  return { check, has: (t) => check(t).hit };
}

// ── 낚멍 연결: 설정은 localStorage nk_prof = {enabled, words, allow, rev} (관리자 모드 '비속어' 탭) ──
const KEY='nk_prof';
function load(){try{const c=JSON.parse(localStorage.getItem(KEY));if(c&&Array.isArray(c.words))return c;}catch(e){}return {enabled:true,words:buildSeed(),allow:SEED_ALLOW.slice(),rev:0};}
let CONF=load();const F=makeFilter(()=>CONF);
function save(){CONF.rev=(CONF.rev||0)+1;localStorage.setItem(KEY,JSON.stringify(CONF));}
function mask(text){if(!F.has(text))return text;let any=false;const out=String(text).split(/(\s+)/).map(t=>{if(/^\s*$/.test(t))return t;if(F.has(t)){any=true;return '*'.repeat(Math.min(6,[...t].length));}return t;}).join('');return any&&!F.has(out)?out:'*** (필터링된 메시지)';}
window.NK_PROF={check:F.check,has:F.has,mask,conf:()=>CONF,save,reset(){CONF={enabled:true,words:buildSeed(),allow:SEED_ALLOW.slice(),rev:(CONF.rev||0)+1};save();},
 add(k,w){w=String(w).trim();if(w&&!CONF[k].includes(w)){CONF[k].unshift(w);save();return true;}return false;},del(k,w){CONF[k]=CONF[k].filter(x=>x!==w);save();},setOn(v){CONF.enabled=!!v;save();},
 replace(c){if(!c||!Array.isArray(c.words)||!c.words.length)return;CONF.enabled=c.enabled!==false;CONF.words=c.words.slice(0,4000);CONF.allow=Array.isArray(c.allow)?c.allow.slice(0,2000):[];CONF.rev=(CONF.rev||0)+1;try{localStorage.setItem(KEY,JSON.stringify(CONF));}catch(e){}},
 koNorm,enTokens};


})();
