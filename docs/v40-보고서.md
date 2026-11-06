# 피쉬코지(FISH COZY) v40 보고서

- 작업일: 2026-11-06 (Asia/Seoul)
- 라이브: [https://fishcozy.com](https://fishcozy.com)
- 캐시: `game-v2.js?v40` · `ui-v2.css?v40` · `realtime.js?v40`
- 기반: v39
- 커밋: PR [#4](https://github.com/dydtjr13/nakmeong/pull/4) 머지 (`0812cc6`)
- PC 저장: 생략
- 실시간: `fishcozy-realtime` Cloudflare v40 재배포

---

## 한눈에 보기

| # | 무엇을 | 결과 |
|---|---|---|
| 0 | 관리자 세계 설정 | 하루 길이·시각·날씨·계절·맵이 **같은 호숫가** 실유저에게 같이 적용 |
| 1 | AI·봇 목록 | 유저 탭·대시보드는 **실접속만** (나 + 같은 서버). 봇·가짜 닉 제거 |
| 2 | `data-uch` | 호숫가 버튼 오타 수정. 다른 호숫가는 인원만, 닉네임은 같은 서버에서만 |
| 3 | 계절 길이 | 시간 탭에 하루 길이와 같은 **타일**. 기존 사이클과 겹치지 않게 저장·동기화 |
| 4 | 레벨 보상 | 해금·안내는 그대로. 코인·상자·강화석은 **보상 로드에서 받기** |
| 5 | 세계 시각 | 입장 시각이 아니라 **벽시계**. 같은 호숫가(혼자일 때도) 낮·밤이 같음 |

---

## 쓰는 방법

1. [https://fishcozy.com](https://fishcozy.com) 새로고침  
2. 설정 맨 아래 **운영** → 아이디 `admin` 로그인  
3. 시간·날씨에서 하루 길이·날씨를 바꾸면 **같은 호숫가**에 반영  
4. 레벨업 보상은 **보상 로드**에서 받기  

실시간 서버에 연결되지 않으면 그 브라우저에만 적용돼요. 밸런스(`nk_admin_bal`)는 이번 전 유저 강제 대상이 아니에요.

---

## 링크

- PR: [https://github.com/dydtjr13/nakmeong/pull/4](https://github.com/dydtjr13/nakmeong/pull/4)
- 게임: [https://fishcozy.com/nakmeong.html](https://fishcozy.com/nakmeong.html)
- 서버 인원: [https://fishcozy-realtime.mi1ku.workers.dev/servers](https://fishcozy-realtime.mi1ku.workers.dev/servers)
