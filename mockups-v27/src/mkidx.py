import glob,os
head=open('../mockups-v26/index.html').read().split('<body>')[0].replace('v26','v27')+'<body>'
def gal(items,cls=''):return f'<div class="gal {cls}">'+''.join(f'<figure><img src="{s}" alt="{c}" loading="lazy"><figcaption>{c}</figcaption></figure>' for s,c in items if os.path.exists(s))+'</div>'
def sec(t,p,g):return f'<div class="sec"><h2>{t}</h2><p>{p}</p>{g}</div>'
A=[(f,os.path.basename(f)[:-4]) for f in sorted(glob.glob('applied/*.jpg'))]
S=[sec('✅ 게임에 적용된 것','하단 메뉴(도감·후원 아이콘) · 합성 S1 · 화질 비교 · 모바일 UI 편집 패널 (PC·모바일 스크린샷).',gal(A))]
S.append(sec('<span class="no">4</span>러버덕 5종 — 직접 만든 로우폴리 오리','원본 에셋(JDSherbert)은 수정 금지 조건이라, 외부 에셋 없이 도형으로 새로 만든 오리 위에 변형했어요. 마음에 들면 게임에 넣고 더 늘릴게요. <span class="rec">추천 딸기 · 개구리 · 유니콘</span>',gal([('img/duck-base.jpg','기본 (직접 만든 오리)'),('img/duck-pirate.jpg','① 해적 오리'),('img/duck-straw.jpg','② 딸기 오리'),('img/duck-astro.jpg','③ 우주비행사 오리'),('img/duck-frog.jpg','④ 개구리 모자 오리'),('img/duck-uni.jpg','⑤ 유니콘 오리')])))
S.append(sec('<span class="no">7</span>장비 40종 (모자·옷·신발·장갑 × 10)','10레벨마다 하나, 단계가 오를수록 테두리 색·광택·장식이 화려해져요. 아이콘 png 40개는 <code>mockups-v27/img/eq/</code>.',gal([('img/eqAll.jpg','장비 40종 한눈에')])))
S.append(sec('가방 — 효과 합계 (유물 포함)','장비 4칸이 늘어도 효과를 한 표에서 보도록: 낚싯대 · 장비 · 부적(유물) · 합계. <span class="rec">추천 B1-A (PC) · 모바일 B1-A</span>',gal([('img/bagA.jpg','B1-A 장착 칸 아래 합계 표 (추천)'),('img/bagB.jpg','B1-B 3단 (합계 칸 따로)'),('img/bagC.jpg','B1-C 알약 한 줄 + 자세히 팝업')])+gal([('img/bagM.jpg','B1-A 모바일')],'m')))
S.append(sec('장착 장비 창 + 내 캐릭터','배경은 실제 게임 렌더 캡처예요(게임 안에서는 작은 카메라로 내 캐릭터만 따로 그려서 넣을 수 있어요). <span class="rec">추천 E1</span>',gal([('img/eqA.jpg','E1 캐릭터 배경 + 칸 (추천)'),('img/eqB.jpg','E2 캐릭터 크게 + 칸 양옆'),('img/eqC.jpg','E3 실루엣 (현행 방식)')])+gal([('img/eqM.jpg','E1 모바일')],'m')))
S.append(sec('상자 창','행운 상자는 현행 화면 그대로, “부적 관리”는 현행 행운 부적 화면으로. <span class="rec">추천 X1</span>',gal([('img/boxA.jpg','X1 상자 → 부적 관리 누르면 현행 부적 화면 (추천)'),('img/boxB.jpg','X2 탭 2개'),('img/boxC.jpg','X3 열기 결과에 바로가기')])+gal([('img/boxM.jpg','X1 모바일 (상자)'),('img/boxM2.jpg','X1 모바일 (부적 관리)')],'m')))
S.append(sec('<span class="no">5</span>모바일 UI 편집 개선안','U1은 이번에 게임에 넣었어요. <span class="rec">추천 U1 + U2</span>',gal([('img/uiA.jpg','U1 패널 (적용됨)'),('img/uiB.jpg','U2 배치 프리셋'),('img/uiC.jpg','U3 전체 크기 슬라이더')],'m')))
open('index.html','w').write(head+'<div class="wrap" style="max-width:1200px;margin:auto;padding:16px"><h1>피쉬레스트 v27 시안</h1><p><a href="../docs/v27-보고서.html">📄 v27 보고서</a></p>'+''.join(S)+'</div><script src="lb.js"></script><script>window.NK_EMOJI_BASE="../icons/emoji/";</script><script src="../emoji.js"></script></body></html>')
