# 피쉬코지(FISH COZY) v35 보고서

- 작업일: 2026-11-06 (Asia/Seoul)
- 라이브: https://dydtjr13.github.io/nakmeong/
- 캐시: `nakmeong.html?v35`
- 기반: v34
- 선택: t58s300 **L 라인아트 물고기** 파비콘 + 표시명 **피쉬코지**

## 요약

1. 표시명 **피쉬레스트(FISHREST) → 피쉬코지(FISH COZY)** (폴더/리포 `nakmeong` 유지)
2. L 라인아트 마크를 favicon / apple-touch / PWA 아이콘으로 적용
3. 시작 화면 카피: *Welcome to FISH COZY · A Cozy Place to Fish* / 바쁜 일상 속 작은 낚시 공간

## 파비콘

| 파일 | 용도 |
|---|---|
| `icons/favicon.ico` (+ 루트 `favicon.ico`) | 브라우저 탭 |
| `icons/favicon-16.png` / `favicon-32.png` | PNG 아이콘 |
| `icons/app-180.png` | apple-touch |
| `icons/app-192.png` / `app-512.png` | manifest PWA |
| `icons/brand-fishcozy-1024.png` | 원본 정리본 |

`nakmeong.html`: `rel=icon` ×3 + `apple-touch-icon?v35`

## 표시명 반영

- title / apple-mobile-web-app-title / HUD 로고(+마크) / 시작 화면 h1·태그라인
- `manifest.webmanifest` name·short_name·description·theme_color
- 도감 제목·환영 메시지·랭킹 서버명·후원 문구·`index.html`·게시판 목 시안 표기
- 과거 보고서/시안 이력 문서는 그대로 둠

## 회귀 (t120)

title·apple title·favicon 링크·apple-touch·로고·시작 h1·brandTag·마크 이미지·아이콘 200·**pageerror0** → 전부 OK

## 산출물

- 보고서: https://dydtjr13.github.io/nakmeong/docs/v35-보고서.html
- 게임: https://dydtjr13.github.io/nakmeong/nakmeong.html?v35
- PC: `C:\Users\이용석\Desktop\게임개발\낚멍\낚멍 그록봇\nakmeong-v35\`

## 남은 리스크

- CDN/브라우저 파비콘 캐시가 강하면 `?v35`·강력 새로고침 필요
- 구버전 로컬 저장 데이터와 무관(이름만 표시 변경)

### PC / SHA

- SHA256: `bb825745936cfbe29c79740797acc60c0e03904c404e2b9b3e53d2de7fc7557d`
- 분할: nakmeong-v35.zip.000~ + merge-v35.ps1
