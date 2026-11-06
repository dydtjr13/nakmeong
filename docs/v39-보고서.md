# 피쉬코지(FISH COZY) v39 보고서

- 작업일: 2026-11-06 (Asia/Seoul)
- 라이브: [http://fishcozy.com](http://fishcozy.com) · HTTPS 인증서는 GitHub 발급 대기 중
- 캐시: `game-v2.js?v39` · `ui-v2.css?v39` · `realtime.js?v37`
- 기반: v38
- 커밋: PR [#3](https://github.com/dydtjr13/nakmeong/pull/3) 머지
- PC 저장: 생략

---

## 한눈에 보기

| # | 무엇을 | 결과 |
|---|---|---|
| 1 | 관리자 진입 | 설정 맨 아래 작은 **운영** → 로그인 후에만 관리자 모드 |
| 2 | 아이디 | `admin` 고정 |
| 3 | 처음 비밀번호 | `1q2w3e4r` (화면에 안내 문구 없음) |
| 4 | `?admin` | 붙여도 **패널 안 열림** |
| 5 | 일반 유저 | 「관리자 모드 열기」 **안 보임** |
| 6 | 로그인 후 | 같은 탭에서 새로고침해도 유지 · 「관리자 모드 열기」+로그아웃 표시 |
| 7 | 비밀번호 변경 | 패널 헤더 **비밀번호** · 바꾼 뒤엔 새 비밀번호만 |
| 8 | 저장 | salt + SHA-256 해시만 (평문 저장 안 함) |

---

## 쓰는 방법

1. [http://fishcozy.com/nakmeong.html](http://fishcozy.com/nakmeong.html) 열기  
2. 설정 맨 아래 **운영** 누르기  
3. 아이디 `admin` · 비밀번호 `1q2w3e4r`  
4. 관리자 패널이 바로 열려요  

비밀번호를 바꿨다면 새 비밀번호로만 들어가요.

---

## 링크

- PR: [https://github.com/dydtjr13/nakmeong/pull/3](https://github.com/dydtjr13/nakmeong/pull/3)
- 게임: [http://fishcozy.com/nakmeong.html](http://fishcozy.com/nakmeong.html)
