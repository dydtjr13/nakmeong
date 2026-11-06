# 피쉬레스트(FISHREST) v32 보고서

- 작업일: 2026-11-06 (Asia/Seoul)
- 라이브: https://dydtjr13.github.io/nakmeong/
- 시안: [mockups-v32](../mockups-v32/) (lightbox)
- 기반: v31 (게시판 로컬 · 가방 B1-A · 펭귄·눈사람)

## 적용 항목

| # | 내용 | 상태 |
|---|---|---|
| 1 | 가방 낚싯대 효과 합계 세로 확대 (max 780px + 좌측 스크롤) | ✅ |
| 2 | 장비 탭 아이콘 — **C안(티셔츠)** 적용, A/B/D 시안 | ✅ + 시안 |
| 3 | 낚싯대 타일·장착칸 테두리 = `R.rc` / `SYS.GRADES` 등급색 | ✅ |
| 4 | 게시판 실사용 — nick 키 `nakmeong_v2`, P4/P5 글쓰기 버튼, 상단 로컬 바, 모바일 안내 | ✅ 테스트 증거 |
| 5 | 이벤트 예약·매년 반복 | 🎨 시안만 (E1~E3) |
| 6 | 보상 일괄 지급 `giftBanner` (이벤트형 배너) | ✅ |
| 7 | 칭호 nametag 색 — `titleStyle`로 레벨창과 동일 보라/금 | ✅ 픽셀 검증 |
| 8 | 가방/상점/어항 오픈 끊김 — 셸 먼저 show + rAF 렌더 + 이미지 프리로드 | ✅ |
| 9 | 전체 최적화 (핫패스 주의, 회귀) | ✅ 소폭 |
| 10 | 장비 ℹ 위치 — **I1 헤더 우측 주황** 적용, I2/I3 시안 | ✅ + 시안 |
| 11 | ℹ 모달의 깨진 「세트 비교 시안 크게 보기」 제거 | ✅ |

## 시안 (사용자 확인 후 적용)

| 항목 | 파일 | 비고 |
|---|---|---|
| 낚싯대 호버 H1~H4 | `mockups-v32/img/rod-hover-variants.png` | ★강·고유옵션·옵션·추가옵션 구성. **미적용** |
| 이벤트 예약/반복 | `mockups-v32/img/event-schedule-variants.png` | E1 캘린더 · E2 타임라인 · E3 템플릿. **미적용** |
| 장비 아이콘 A/B/D | `wear-icon-variants.png` | C만 적용 |
| ℹ 버튼 I2/I3 | `info-btn-variants.png` | I1만 적용 |

## 러버덕

- **공룡(dino)만** LIST·기본 kinds·설정 체크에 추가 (인게임+순환)
- 닭/꿀벌/천사/산타/악마 등 **미적용**

## 게시판 원인·수정

1. 기본 레이아웃 **P4에 글쓰기 버튼 없음** → P4/P5 헤더에 ✏️ 주입
2. mock 바가 창 아래라 안 보임 → **상단**으로 이동 + tip
3. nick이 잘못된 키 `nk` 참조 → **`nakmeong_v2`**
4. 모바일 `v=m`은 이미지만 → 로컬 안내 블록 추가

테스트(t70): 글 1건·댓글 1건 localStorage 저장, nick=`테스터`.

## 칭호

- 레벨 칭호에 `{bg:'#6a4fc0', fg:'#fff', bd:'#5a3fb0'}` (99는 금색)
- canvas `drawTag`·rankDom `TST` 모두 색 적용
- t71: 태그 픽셀 보라 603샘플, `ttl.bg="#6a4fc0"`

## 회귀 요약

- 게시판 글/댓글 ✅ · 칭호 색 ✅ · 등급 테두리 `#5fc48a` ✅
- 장비 아이콘 `img/eq/tab-wear.png` ✅ · 깨진 세트비교 링크 없음 ✅
- 공룡 LIST ✅ · 가방 오픈 ~182ms ✅ · pageerror 0

## 커밋·백업·PC

- Pages 커밋 `c6beb73` (origin/main) · 로컬 체인 f127eac→e682415→a3b2989
- 백업: `/workspace/nakmeong-backups/nakmeong-v32-stepN.zip`
- PC: `C:\Users\이용석\Desktop\게임개발\낚멍\낚멍 그록봇\nakmeong-v32\`

## 시안 대기 (사용자 선택 필요)

1. 낚싯대 호버 H1~H4 중 적용안
2. 이벤트 예약 E1/E2/E3 중 적용안
3. 장비 아이콘 A/B/D 교체 여부 (현재 C)
4. ℹ I2/I3 교체 여부 (현재 I1)
