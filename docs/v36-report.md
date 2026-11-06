# 피쉬코지(FISH COZY) v36 보고서

- 작업일: 2026-11-06 (Asia/Seoul)
- 라이브: https://dydtjr13.github.io/nakmeong/ · 커스텀 도메인 준비 `fishcozy.com`
- 캐시: `nakmeong.html?v36`
- 기반: v35
- 커밋: `7916b4b`

## 요약

1. **게시판 Cloudflare Worker + D1** 추가·배포 (`fishcozy-board-api`)
2. 게임 게시판이 API 우선, 실패 시 **로컬 mock 폴백**
3. `CNAME` = `fishcozy.com` 확인·추가, 표시명 피쉬코지 유지
4. Gabia NS → Cloudflare **Active 전**이라 `api.fishcozy.com`은 후속

## API

| 항목 | 값 |
|---|---|
| workers.dev | https://fishcozy-board-api.mi1ku.workers.dev |
| 예정 커스텀 | `api.fishcozy.com` (NS Active 후 route) |
| D1 | `fishcozy-board` · `a0e990c1-470b-46a1-8525-3a8a68804f17` |
| CORS | fishcozy.com / www / dydtjr13.github.io (+ localhost) |
| Admin | `X-Admin-Key` ← `wrangler secret put ADMIN_KEY` (값 미커밋) |

엔드포인트: `GET /health`, `GET/POST /posts`, `GET /posts/:id`, `POST /posts/:id/comments`, `DELETE` (admin)

코드: `workers/board-api/` (`src/index.js`, `migrations/0001_init.sql`, `wrangler.toml`)

## 게임 연동

- `board-v24.html`: API URL 설정 가능 (`?api=`, `localStorage.nk_board_api`, `parent.NK_BOARD_API`)
- 기본값: workers.dev URL · 실패 시 `nk_board_v31` 로컬
- `ev-v24.js`: iframe에 API 쿼리 전달

## 회귀 (t130)

api health/post/comment · title · CNAME · favicon · board iframe · pageerror0 → **전부 OK**

## DNS / NS

- Zone `fishcozy.com` Cloudflare pending (Gabia NS → `arely` / `braden`)
- Pages CNAME `fishcozy.com` · DNS A/@ · CNAME www 준비됨 (다른 쪽)
- **NS Active 전**엔 커스텀 도메인·`api.fishcozy.com` 미연결 가능

## 산출물

- 보고서: https://dydtjr13.github.io/nakmeong/docs/v36-보고서.html
- PC: `C:\Users\이용석\Desktop\게임개발\낚멍\낚멍 그록봇\nakmeong-v36\`

## 남은 리스크

- NS pending → fishcozy.com / api.fishcozy.com 미활성
- `ADMIN_KEY` 아직 미설정 → 삭제 API 401 (의도)
- workers.dev 첫 배포 직후 잠깐 1042 가능

### PC / SHA

- SHA256: `20c5101f45bd9fb86e1e9adb366ac8d6252485d11228798416793b70e0703aa5`
- 분할: nakmeong-v36.zip.000~ + merge-v36.ps1
