# 배포 기록 · 업데이트 내역 넣는 방법 (모든 봇 공통)

FISH COZY 변경을 main 에 머지(= 배포)할 때는 아래 3가지를 같이 해요.

## 1. 버전 번호
- `git fetch` 뒤 **머지 직전** main 의 `docs/changes/vNNN.md` 최고 번호와, 최근 커밋 제목의 `vNNN`(문서 없이 코드만 들어간 번호)을 둘 다 보고 **둘 중 큰 번호 + 1** 을 써요. 다른 봇이 같은 시간에 머지하면 번호가 겹칠 수 있어요.
- 게임 파일 캐시 표시도 같은 번호로: `nakmeong.html` 의 `파일.js?vNNN` (바꾼 파일만).

## 2. 변경 기록 `docs/changes/vNNN.md` (한국어)
- 무엇이 · 왜 · 파일 · 값 · 확인(PC 1280×720·1920×1080, 모바일 360×640·390×844·412×915) · 남은 점.
- 실제 사이트에서 확인하지 못한 건 "미완료"로 적어요.

## 3. 홈페이지(가이드) 업데이트 내역
- 파일: `guide-site/public/site.js` 의 `const UPD = [` 목록 **맨 위**에 한 줄 추가 (새 것이 위).
  ```js
  { v: 'vNNN', d: '11월 22일', t: '이모지 짧은 제목', s: ['유저가 보는 변화 한 줄', '두 번째 줄'] },
  ```
  - `s` 는 유저 말투(…해요)로, 개발 용어 없이. 글자만 보여요(HTML·이미지 칸 없음, `esc()` 처리).
- `guide-site/public/index.html` 의 `site.js?vNNN` 번호도 올려요 (캐시).
- `guide-site/**` 가 main 에 들어가면 GitHub Actions `deploy-guide.yml` 이 guide.fishcozy.com 에 자동으로 올려요.
- 확인: guide.fishcozy.com 「업데이트」 칸(`#updList`)에 새 항목이 보이는지.
