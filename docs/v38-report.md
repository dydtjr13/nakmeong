# 피쉬코지(FISH COZY) v38 보고서

- 작업일: 2026-11-06 (Asia/Seoul)
- 라이브: [github.io](https://dydtjr13.github.io/nakmeong/) · fishcozy.com은 HTTPS 인증서 대기 중
- 실시간 워커: [https://fishcozy-realtime.mi1ku.workers.dev](https://fishcozy-realtime.mi1ku.workers.dev)
- 캐시: `realtime.js?v37` · `game-v2.js?v37` · `ui-v2.css?v37`
- 기반: v37
- 커밋: `c54ccb2` (PR [#2](https://github.com/dydtjr13/nakmeong/pull/2) 머지)
- PC 저장: 생략 (사이트만 보면 됨)

---

## 한눈에 보기

| # | 무엇을 | 결과 |
|---|---|---|
| 1 | 실시간 멀티 | 같은 호숫가에 들어온 **실유저**가 서로 보이고 채팅해요 |
| 2 | 서버 | 호숫가 **4곳** · 각 방 **열린 WebSocket 50개** (봇 제외) |
| 3 | 정원 | 51번째는 **거절** · 시작 화면 버튼도 막힘 · `0/50` 실접속 표시 |
| 4 | 동기화 | 닉·캐릭터·위치·방향·앉은 자리·낚시 상태(`off`/`cast`/`bite`) |
| 5 | 채팅 | 말풍선 + 이모티콘 · 이름표 **초록 점** / 채팅 `●`로 봇과 구분 |
| 6 | 자리 | 실유저가 앉은 자리는 봇이 안 앉음 · 다른 실유저가 먼저면 앉기 거절 |
| 7 | 장애 | WebSocket 실패 시 **예전처럼 봇과 혼자** 플레이 |
| 8 | 주소 | 기본 `fishcozy-realtime.mi1ku.workers.dev` · `?rt=` / `localStorage.nk_rt_base` · `off`면 끔 |

---

## 1. 어떻게 쓰나요

1. [github.io 피쉬코지](https://dydtjr13.github.io/nakmeong/) 열기  
2. 시작 화면에서 **호숫가 1~4** 중 하나 고르기 (`n/50`이 실시간 인원)  
3. 같은 호숫가를 다른 브라우저/시크릿으로 들어가면 서로 보여요  
4. 채팅·이모티콘은 말풍선으로 전달돼요  

로컬만 쓰려면 워커를 `npm run dev`로 띄운 뒤  
`nakmeong.html?rt=http://127.0.0.1:8787` 로 들어가면 됩니다.

---

## 2. 기술 요약

- 코드: `workers/realtime/` (게시판 API 워커와 **분리**)
- 방 하나 = Durable Object 하나 (호숫가 4개)
- 클라이언트: `realtime.js` + 게임 쪽 presence/채팅 연동
- 헬스: `/health` · 서버 목록: `/servers` (지금 4곳 전부 `0/50`)

배포(이미 원격 배포됨):

```bash
cd workers/realtime
npm install
npx wrangler login   # 새 환경일 때만
npm run deploy
```

확인:

```bash
npm test
npm run test:live   # 두 소켓 채팅 · 자리 거절 · 서버 분리 · 51번째 거절
```

---

## 3. 아직 없는 것

- 계정 로그인
- 낚시·거래의 **서버 판정**
- 찌까지 포함한 애니메이션 동기화
- `api.fishcozy.com` 과 실시간 워커 연결
- fishcozy.com **HTTPS 인증서** (GitHub Pages 대기) → 그동안은 github.io 사용

---

## 4. 진행 중

- 관리자 진입: 로그인 `admin` / `1q2w3e4r` (변경 가능) · 일반 유저에게 숨김 → 작업 중이면 끝나면 이어서 보고할게요

---

## 링크

- PR: [https://github.com/dydtjr13/nakmeong/pull/2](https://github.com/dydtjr13/nakmeong/pull/2)
- 실시간 워커: [https://fishcozy-realtime.mi1ku.workers.dev/servers](https://fishcozy-realtime.mi1ku.workers.dev/servers)
- 게임: [https://dydtjr13.github.io/nakmeong/](https://dydtjr13.github.io/nakmeong/)
