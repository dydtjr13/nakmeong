// v55: 초성 게임 · 밸런스 게임 이벤트 (순수 함수 — 소켓 I/O 없음)
// 설정(cfg)은 네 호숫가가 같이 쓰고, 진행(run)은 호숫가마다 따로 돌아요.
// 초성 정답은 서버만 알고 있다가 끝날 때 공개해요.

const CHO = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

/** 한글 → 초성 (한글이 아닌 글자는 그대로, 공백 유지) */
export function choseong(s) {
  return [...String(s || "")].map((ch) => {
    const c = ch.charCodeAt(0) - 0xac00;
    return c >= 0 && c <= 11171 ? CHO[Math.floor(c / 588)] : ch;
  }).join("");
}

/** 정답 비교용: 공백·기호 제거, 소문자 */
export function normAns(s) {
  return String(s || "").toLowerCase().replace(/[\s.,!?~'"`·\-_()]/g, "").slice(0, 40);
}

function str(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f<>`\\]/g, "").trim().slice(0, max);
}
function int(v, min, max, d) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : d;
}

export const DEFAULT_CHO = [
  ["붕어", "물고기"], ["잉어", "물고기"], ["쏘가리", "물고기"], ["메기", "물고기"], ["뱀장어", "물고기"], ["가물치", "물고기"],
  ["블루길", "물고기"], ["무지개송어", "물고기"], ["피라미", "물고기"], ["모래무지", "물고기"], ["동자개", "물고기"], ["강준치", "물고기"],
  ["꺽지", "물고기"], ["향어", "물고기"], ["누치", "물고기"], ["끄리", "물고기"], ["빙어", "물고기"], ["떡붕어", "물고기"],
  ["낚싯대", "낚시 도구"], ["떡밥", "미끼"], ["지렁이", "미끼"], ["민물새우", "미끼"], ["옥수수", "미끼"], ["뜰채", "낚시 도구"],
  ["월척", "낚시 용어"], ["손맛", "낚시 용어"], ["입질", "낚시 용어"], ["밑밥", "낚시 용어"], ["찌맞춤", "낚시 용어"], ["러버덕", "피쉬코지"],
].map(([a, c]) => ({ a, c }));

export const DEFAULT_BAL = [
  ["평생 한 가지 낚시만 해야 한다면?", "새벽 낚시만", "밤 낚시만"],
  ["둘 중 하나만 고른다면?", "월척 한 마리", "잔챙이 100마리"],
  ["더 견디기 힘든 낚시는?", "비 오는 날 낚시", "땡볕 낚시"],
  ["잡은 물고기는?", "전부 어항에", "전부 팔아서 골드"],
  ["낚시는 역시", "혼자 조용히", "친구랑 시끌벅적"],
  ["평생 미끼 하나만 쓴다면?", "떡밥", "지렁이"],
  ["가고 싶은 낚시터는?", "고요한 호수", "탁 트인 바다"],
  ["갖고 싶은 건?", "전설 물고기 1마리", "골드 100만"],
  ["호숫가 풍경은?", "오리 100마리", "오리 0마리"],
  ["나는", "아침형 낚시꾼", "저녁형 낚시꾼"],
  ["더 좋은 건?", "입질 많고 작은 물고기", "입질 적고 큰 물고기"],
  ["낚시하다 졸리면?", "낚싯대 들고 버틴다", "자동 낚시 켜고 잔다"],
].map(([q, l, r]) => ({ q, l, r }));

export function defaultGame() {
  return {
    on: 0,
    every: 30,
    dur: 60,
    cho: 1,
    bal: 1,
    rw: { c1: 300, c2: 200, c3: 150, cx: 50, b: 30 },
    choList: DEFAULT_CHO.slice(),
    balList: DEFAULT_BAL.slice(),
    v: 1,
  };
}

/** 관리자 설정 정리 */
export function sanitizeGame(input, prev) {
  const base = prev || defaultGame();
  const x = input && typeof input === "object" ? input : {};
  const rw = Object.assign({}, base.rw, x.rw && typeof x.rw === "object" ? x.rw : {});
  const out = {
    on: "on" in x ? (x.on ? 1 : 0) : base.on,
    every: "every" in x ? int(x.every, 5, 720, 30) : base.every,
    dur: "dur" in x ? int(x.dur, 20, 180, 60) : base.dur,
    cho: "cho" in x ? (x.cho ? 1 : 0) : base.cho,
    bal: "bal" in x ? (x.bal ? 1 : 0) : base.bal,
    rw: { c1: int(rw.c1, 0, 100000, 300), c2: int(rw.c2, 0, 100000, 200), c3: int(rw.c3, 0, 100000, 150), cx: int(rw.cx, 0, 100000, 50), b: int(rw.b, 0, 100000, 30) },
    choList: base.choList,
    balList: base.balList,
    v: (base.v | 0) + 1,
  };
  if (Array.isArray(x.choList)) {
    out.choList = x.choList.slice(0, 400).map((r) => ({ a: str(r && r.a, 20), c: str(r && r.c, 16), h: str(r && r.h, 24) })).filter((r) => normAns(r.a));
  }
  if (Array.isArray(x.balList)) {
    out.balList = x.balList.slice(0, 400).map((r) => ({ q: str(r && r.q, 40), l: str(r && r.l, 20), r: str(r && r.r, 20) })).filter((r) => r.l && r.r);
  }
  return out;
}

/** 다음 문제 고르기: 최근에 나온 문제는 피함 */
export function pickQuestion(cfg, kind, used, rnd) {
  const list = kind === "cho" ? cfg.choList : cfg.balList;
  if (!list || !list.length) return -1;
  const recent = new Set((used && used[kind]) || []);
  const pool = list.map((_, i) => i).filter((i) => !recent.has(i));
  const from = pool.length ? pool : list.map((_, i) => i);
  return from[Math.floor((rnd || Math.random)() * from.length)];
}

export function pushUsed(used, kind, idx, len) {
  const u = Object.assign({ cho: [], bal: [] }, used || {});
  const keep = Math.max(0, Math.min(40, (len | 0) - 1));
  u[kind] = (u[kind] || []).concat(idx).slice(-keep || 0);
  if (!keep) u[kind] = [];
  return u;
}

/** 다음 이벤트 종류 */
export function pickKind(cfg, last) {
  const ok = [];
  if (cfg.cho && cfg.choList.length) ok.push("cho");
  if (cfg.bal && cfg.balList.length) ok.push("bal");
  if (!ok.length) return "";
  if (ok.length === 2 && last) return last === "cho" ? "bal" : "cho";
  return ok[Math.floor(Math.random() * ok.length)];
}

/** 진행 상태 → 유저에게 보낼 공개 정보 (정답 숨김) */
export function publicRun(run, cfg) {
  if (!run) return null;
  const base = { id: run.id, kind: run.kind, start: run.start, end: run.end, done: !!run.done };
  if (run.kind === "cho") {
    const top = run.ok.slice(0, 3).map((x) => ({ n: x.n, ms: x.ms }));
    const pub = Object.assign(base, { cho: run.cho, c: run.c, h: run.h || "", top, n: run.ok.length, rw: [cfg.rw.c1, cfg.rw.c2, cfg.rw.c3, cfg.rw.cx] });
    if (run.done) pub.ans = run.a;
    return pub;
  }
  const l = Object.values(run.picks || {}).filter((s) => s === "l").length;
  const r = Object.values(run.picks || {}).filter((s) => s === "r").length;
  const pub = Object.assign(base, { q: run.q, l: run.l, r: run.r, joined: l + r, rw: cfg.rw.b });
  if (run.done) pub.res = { l, r };
  return pub;
}

/** 초성 보상: 1~3위 지정 금액, 그 뒤 정답 cx */
export function choReward(cfg, rank) {
  return rank === 1 ? cfg.rw.c1 : rank === 2 ? cfg.rw.c2 : rank === 3 ? cfg.rw.c3 : cfg.rw.cx;
}

export function newRun(cfg, kind, idx, now) {
  const id = "g" + now.toString(36) + Math.floor(Math.random() * 1e4).toString(36);
  const end = now + cfg.dur * 1000;
  if (kind === "cho") {
    const it = cfg.choList[idx];
    return { id, kind, idx, start: now, end, a: it.a, cho: it.h || choseong(it.a), c: it.c || "", h: "", ok: [], tried: {} };
  }
  const it = cfg.balList[idx];
  return { id, kind, idx, start: now, end, q: it.q, l: it.l, r: it.r, picks: {}, changed: {} };
}

/** 초성 답 제출. 반환: {ok, rank, ms, coin} 또는 {ok:false} 또는 null(무시) */
export function submitAnswer(run, cfg, who, nick, ans, now) {
  if (!run || run.done || run.kind !== "cho" || now > run.end) return null;
  if (run.ok.some((x) => x.who === who)) return null;
  const t = run.tried[who] || { n: 0, at: 0 };
  if (now - t.at < 400 || t.n >= 40) return null;
  run.tried[who] = { n: t.n + 1, at: now };
  const okA = String(run.a).split("/").map(normAns).filter(Boolean);
  if (!okA.includes(normAns(ans))) return { ok: false };
  const ms = Math.max(0, now - run.start);
  run.ok.push({ who, n: nick, ms });
  const rank = run.ok.length;
  return { ok: true, rank, ms, coin: choReward(cfg, rank) };
}

/** 밸런스 선택. 바꾸기는 한 번만 */
export function submitPick(run, who, side, now) {
  if (!run || run.done || run.kind !== "bal" || now > run.end) return null;
  if (side !== "l" && side !== "r") return null;
  const prev = run.picks[who];
  if (prev === side) return { side };
  if (prev && run.changed[who]) return null;
  if (prev) run.changed[who] = 1;
  run.picks[who] = side;
  return { side };
}
