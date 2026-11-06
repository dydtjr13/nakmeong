# 피쉬레스트(FISHREST) v34 보고서

- 작업일: 2026-11-06 (Asia/Seoul)
- 라이브: https://dydtjr13.github.io/nakmeong/
- 캐시 무력화: `nakmeong.html?v34` (스크립트 `?v34`)
- 기반: v33 (`d3e8c76`)
- 커밋: `71afad0`
- 이슈: t56u 「상자 열기 눌러도 아무 반응없고 먹통」

## 요약

1. **원인**: 여러 개 상자 개봉 UI가 **장비(wear)** 보상을 처리하지 못해 `o.co.toLocaleString()`에서 예외 → `#boxFx`가 `show`만 남고 내용·확인 버튼 없이 화면을 가림
2. **수정**: multi 템플릿에 wear tip/셀 추가 · 합계에 장비 수 · `boxFx`/`openN` 예외 방어 · 배경 클릭으로 탈출
3. **검증**: 열기→결과→닫기→다시 열기 · wear 강제 multi · 저장/가방/상점 · pageerror 0

## 원인 상세

| 경로 | 동작 |
|---|---|
| 1개 열기 | `rewardHTML`이 wear 분기 있음 → 정상 |
| N개 열기 | multi `ritem` tip이 charm/rod/bait만 분기, 그 외 `o.co.toLocaleString()` |
| wear 드롭 | 희귀+ 상자 `WEAR.boxRate` (4%~16%) |
| 예외 시점 | `fx.className='show …'` 설정 **이후** HTML 생성 → 빈 오버레이(z-index 99) 고정 |

재현: multi 리스트에 wear 1개만 넣어도 `TypeError: Cannot read properties of undefined (reading 'toLocaleString')`, `cls=show t2 multi`, `innerHTML=""`.

## 수정

**파일**: `game-v2.js`, `nakmeong.html`(캐시 `?v34`)

- `tipR` / `cellR`: wear·안전 폴백
- multi 합계: `👕 장비` 카운트
- `boxFx` body `try/catch` → 실패 시에도 확인 버튼 표시
- `openN`: `openBox`/`boxFx` try/catch, 빈 결과 시 `Math.max` 가드
- 배경 클릭: `open` 전에도 닫기 가능
- wear `nw` 플래그: `o.w`도 신규 표시

## 회귀 (tools/tests-v34)

| 테스트 | 결과 |
|---|---|
| t100 기본 열기/재열기 | OK |
| t102 wear multi 강제 | OK (hasWear, open, close, reopen) |
| t110 boot·soloSave·bag·shop·open1·close1·multiWear·reopen·giveBox·pageerror0 | **12/12 OK**, pageErrs `[]` |

## 산출물

- 보고서: https://dydtjr13.github.io/nakmeong/docs/v34-보고서.html
- 게임: https://dydtjr13.github.io/nakmeong/nakmeong.html?v34
- 백업: `/workspace/nakmeong-backups/nakmeong-v34.zip`
- PC: `C:\Users\이용석\Desktop\게임개발\낚멍\낚멍 그록봇\nakmeong-v34\`

## 남은 리스크

- 새 보상 타입이 multi 템플릿에 또 빠지면 tip 폴백·try/catch로 닫기는 되지만 표시는 단순화됨
- `synthFx`는 별도 close 경로(기존) — 이번 범위 밖
- Pages CDN 캐시: 반드시 `?v34`로 확인

## 시안 대기

없음.

### PC / SHA

- SHA256: `dd946263da22665a102b655d3552361011cc7d11e96413cdb2bdd3a7c5d5ff8e`
- 분할: `nakmeong-v34.zip.000`~`.003` (30MB) + `merge-v34.ps1`
