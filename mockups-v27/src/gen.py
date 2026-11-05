# v27 시안 HTML 생성 → sheets.html (스크린샷은 shot.js)
E=lambda c:f'<img class="emj" src="../../icons/emoji-png/{c}.png">'
R=lambda k:f'../../img/rods/{k}.png';Q=lambda t,i:f'../img/eq/{t}{i}.png'
GC=['#aab4c0','#5fc48a','#4ea3ea','#3fb8b0','#f4a62a','#4a5ab8','#6a5cff','#c46cf2','#ef5f8f','#ff2d8a']
GN=['일반','고급','희귀','진귀','영웅','별빛','은하','용왕','심해','초월']
TN={'hat':['밀짚 모자','버킷햇','털모자','어부 비모자','선장 모자','탐험가 모자','은빛 투구','산호 왕관','은하 마법모자','천룡 왕관'],'cloth':['면 티셔츠','줄무늬 셔츠','체크 셔츠','낚시 조끼','노랑 우비','선장 코트','은비늘 갑옷','산호 로브','은하 망토','천룡 갑주'],'shoe':['짚신','캔버스화','가죽 부츠','장화','물막이 장화','선장 부츠','은비늘 부츠','산호 부츠','은하 날개 부츠','천룡 부츠'],'glove':['면장갑','손가락 장갑','가죽 장갑','고무 장갑','네오프렌 장갑','선장 장갑','은비늘 건틀릿','산호 건틀릿','은하 건틀릿','천룡 건틀릿']}
KN={'hat':'🎩 모자','cloth':'👕 옷','shoe':'👢 신발','glove':'🧤 장갑'}
F=[]
def frame(id,dev,inner,bg='clean',dim=True):F.append(f'<div class="frame {dev}" id="{id}" style="background-image:url(../img/bg-{dev}-{bg}.jpg)">{"<div class=dim></div>" if dim else ""}{inner}</div>')
# ── 장비 40종 시트 ──
eq='<div class="eqs" id="eqAll"><h2>장비 40종 (모자·옷·신발·장갑 × 10단계, Lv 1·10·20…90)</h2><div class="eqr"><span></span>'+''.join(f'<div class="eqlv">Lv {max(1,i*10)}<br><b style="color:{GC[i]}">{GN[i]}</b></div>' for i in range(10))+'</div>'
for t in TN:eq+=f'<div class="eqr"><span class="eqh">{KN[t]}</span>'+''.join(f'<div class="eqc" style="--c:{GC[i]}"><img src="{Q(t,i+1)}"><b>{TN[t][i]}</b></div>' for i in range(10))+'</div>'
eq+='</div>'
# ── 가방: 장착 칸 ──
W={'hat':8,'cloth':7,'glove':6,'shoe':9}
def doll(mob=False,cls='',stat=True):
  s=62 if mob else 74
  pos={'hat':(141,14),'rod':(30,96),'cloth':(141,96),'glove':(252,96),'shoe':(141,196)} if mob else {'hat':(128,18),'rod':(18,140),'cloth':(128,140),'glove':(238,140),'shoe':(128,262)}
  h=f'<div class="doll {cls}"><b style="font-size:13px;position:relative">장착 장비</b>'+('' if 'charbg' in cls else '<div class="sil"></div>')
  for k,(x,y) in pos.items():
    if k=='rod':h+=f'<div class="slot rod" style="left:{x}px;top:{y}px"><img src="{R("heaven")}"></div>'
    else:i=W[k];h+=f'<div class="slot has" style="left:{x}px;top:{y}px;--c:{GC[i]}"><img src="{Q(k,i+1)}"></div>'
  return h+'</div>'
ST=[('⚡ 빠른 입질',58,12,9,79),('📏 대어',79,8,14,101),('🌟 희귀',136,20,30,186),('🎁 상자',0,15,22,37),('🪙 코인',0,10,8,18),('✦ 초월',.066,0,.01,.076)]
def tot(rows=ST,dark=False):return '<table class="tot"><tr><th>효과</th><th>낚싯대</th><th>장비</th><th>부적</th><th>합계</th></tr>'+''.join(f'<tr><td>{a}</td><td>{b}%</td><td>{c}%</td><td>{d}%</td><td class="s">{e}%</td></tr>' for a,b,c,d,e in rows)+'</table>'
def inv(n=24,cols=6):
  h=f'<div class="grid" style="grid-template-columns:repeat({cols},1fr)">'
  L=[(t,i) for i in (9,8,7,6,5,4) for t in TN][:n]
  for j in range(n):
    t,i=L[j];h+=f'<div class="cell" style="--c:{GC[i]}"><img src="{Q(t,i+1)}"><span class="pl">+{j%5}</span></div>'
  return h+'</div>'
TABS=f'<div class="tabs"><span>🎣 낚싯대</span><span class="on">🎩 장비 24</span><span>🧿 부적</span><span>💎 강화석</span></div>'
H=lambda t,s='':f'<h2>{E("1f392")} {t} <span class="sub">{s}</span><span class="x">×</span></h2>'
frame('bagA','pc','<div class="tag">B1-A · 장착 칸 아래 “합계” 표 (낚싯대+장비+부적)</div>'+f'<div class="win" style="width:1100px;height:640px">{H("가방","장비 5/5칸")}<div class="cols" style="grid-template-columns:360px 1fr"><div style="display:grid;grid-template-rows:350px 1fr;gap:10px">{doll()}<div class="inv" style="padding:8px 10px">{tot()}</div></div><div class="inv">{TABS}{inv(24)}</div></div></div>')
frame('bagB','pc','<div class="tag">B1-B · 3단: 장착 칸 | 효과 합계 | 인벤토리</div>'+f'<div class="win" style="width:1220px;height:600px">{H("가방")}<div class="cols" style="grid-template-columns:330px 330px 1fr">{doll()}<div class="inv"><b>📊 효과 합계</b> <small style="color:#8a7a96">유물(부적) 포함</small>{tot()}<div class="tip">세트 보너스: 천룡 2/4 — <b>희귀 +10%</b></div></div><div class="inv">{TABS}{inv(20,5)}</div></div></div>')
chip=''.join(f'<span>{a} <b>{e}%</b></span>' for a,b,c,d,e in ST)
frame('bagC','pc','<div class="tag">B1-C · 합계는 알약 한 줄 + “자세히” 누르면 표 팝업</div>'+f'<div class="win" style="width:1100px;height:620px">{H("가방")}<div class="cols" style="grid-template-columns:330px 1fr">{doll()}<div class="inv"><div class="chips" style="margin-bottom:8px">{chip} <span style="background:#ff8a4c;color:#fff">자세히 ▸</span></div>{TABS}{inv(18)}</div></div><div class="win" style="left:73%;top:40%;width:420px;box-shadow:0 10px 40px #0007"><h2 style="font-size:16px">📊 효과 합계 <span class="x">×</span></h2>{tot()}</div></div>')
frame('bagM','m','<div class="tag">B1-A 모바일 · 장착 칸 → 합계 표 → 인벤토리 (스크롤)</div>'+f'<div class="win" style="width:370px;height:780px;top:52%;padding:12px">{H("가방")}<div style="position:relative;height:290px">{doll(True).replace("class=\"doll ","style=\"height:290px\" class=\"doll ")}</div><div class="inv" style="margin-top:8px;padding:6px 8px">{tot()}</div><div class="inv" style="margin-top:8px">{inv(10,5)}</div></div>')
# ── 장착 장비 창 + 내 캐릭터 ──
frame('eqA','pc','<div class="tag">E1 · 내 캐릭터(게임 렌더 캡처) 배경 + 장비 칸 (추천)</div>'+f'<div class="win" style="width:1000px;height:600px">{H("장착 장비")}<div class="cols" style="grid-template-columns:360px 1fr">{doll(cls="charbg")}<div class="inv dark" style="background:#2a2433;color:#fff"><b>📊 효과 합계</b>{tot()}</div></div></div>')
frame('eqB','pc','<div class="tag">E2 · 캐릭터 가운데 크게 + 칸은 양옆 (게임 RPG식)</div>'+f'<div class="win" style="width:900px;height:620px">{H("장착 장비")}<div style="position:relative;height:550px;border-radius:18px;overflow:hidden;background:url(../img/char-cap.jpg) center 60%/cover">'+''.join(f'<div class="slot {"rod" if k=="rod" else "has"}" style="left:{x}px;top:{y}px;--c:{GC[W.get(k,9)]}"><img src="{R("heaven") if k=="rod" else Q(k,W[k]+1)}"></div>' for k,x,y in [('hat',40,40),('cloth',40,170),('glove',40,300),('rod',760,40),('shoe',760,170)])+'<div style="position:absolute;left:50%;bottom:14px;transform:translateX(-50%);background:#2a2433dd;color:#fff;border-radius:14px;padding:8px 14px;font-size:12px;font-weight:800">⚡58% · 📏79% · 🌟186% · 🎁37% (합계)</div></div></div>')
frame('eqC','pc','<div class="tag">E3 · 실루엣(지금 방식) — 가볍고 빠름</div>'+f'<div class="win" style="width:760px;height:560px">{H("장착 장비")}<div class="cols" style="grid-template-columns:360px 1fr">{doll()}<div class="inv">{tot()}</div></div></div>')
frame('eqM','m','<div class="tag">E1 모바일</div>'+f'<div class="win" style="width:370px;height:740px;padding:12px">{H("장착 장비")}<div style="position:relative;height:300px">{doll(True,cls="charbg").replace("class=\"doll ","style=\"height:300px\" class=\"doll ")}</div><div class="inv dark" style="margin-top:8px;background:#2a2433;color:#fff">{tot()}</div></div>')
# ── 상자 창 ──
I=lambda f,w:f'<img class="shot" src="../img/{f}" style="width:{w}px">'
frame('boxA','pc','<div class="tag">X1 · 행운 상자는 현행 그대로 + 위 탭 “🧿 부적 관리” → 현행 부적 화면 (추천)</div><div class="flow">'+I('win-box-pc.png',520)+'<span class="ar">→</span>'+I('win-charm-pc.png',600)+'</div><div class="pin" style="left:260px;top:278px;width:72px;height:34px"></div><div class="note" style="bottom:20px">가방을 따로 열지 않아도, 상자 창 안의 “부적 관리”를 누르면 지금 쓰는 행운 부적 화면(장착 칸 + 옵션 검색)이 바로 떠요. 상자 쪽은 지금 화면 그대로.</div>')
frame('boxB','pc','<div class="tag">X2 · 상자 창 하나에 탭 2개: [🎁 행운 상자 | 🧿 부적 관리]</div>'+f'<div class="win" style="width:980px;padding:12px"><div style="margin-bottom:8px"><span class="ub on">🎁 행운 상자 6</span><span class="ub">🧿 부적 관리 9</span></div>{I("win-box-pc.png",950)}</div>')
frame('boxC','pc','<div class="tag">X3 · 상자 열기 결과에 “부적 관리 ▸” 바로가기</div>'+f'<div class="win" style="width:640px">{I("win-box-pc.png",610)}<div class="tip" style="text-align:center">🎉 상자에서 <b>희귀 부적</b>이 나왔어요! <span class="btn ok">🧿 부적 관리 ▸</span> <span class="btn">계속 열기</span></div></div>')
frame('boxM','m','<div class="tag">X1 모바일</div>'+f'<div class="win" style="width:370px;padding:8px"><div style="margin-bottom:6px"><span class="ub on">🎁 상자</span><span class="ub">🧿 부적 관리</span></div>{I("win-box-m.png",352)}</div>')
frame('boxM2','m','<div class="tag">X1 모바일 · 부적 관리 누른 뒤</div>'+f'<div class="win" style="width:370px;padding:8px"><div style="margin-bottom:6px"><span class="ub">🎁 상자</span><span class="ub on">🧿 부적 관리</span></div>{I("win-charm-m.png",352)}</div>')
# ── 모바일 UI 편집 개선안 ──
pre=''.join(f'<div class="bcard" style="padding:10px;margin:6px;display:inline-block;width:150px;text-align:center;background:#fff;border-radius:14px;border:2px solid {"#ff8a4c" if i==0 else "#eadfce"}"><div style="height:120px;border-radius:10px;background:#9fd6ee;position:relative">{g}</div><b style="font-size:13px">{n}</b></div>' for i,(n,g) in enumerate([('기본',''),('왼손잡이','<i style="position:absolute;left:8px;bottom:8px;width:30px;height:30px;border-radius:50%;background:#ff8a4c"></i><i style="position:absolute;right:8px;bottom:8px;width:24px;height:24px;border-radius:50%;background:#fff8"></i>'),('작게(미니)','<i style="position:absolute;right:8px;bottom:8px;width:18px;height:18px;border-radius:50%;background:#ff8a4c"></i>'),('알림 위로','<i style="position:absolute;left:10px;right:10px;top:6px;height:14px;border-radius:6px;background:#fff9"></i>')]))
frame('uiA','m','<div class="tag">U1 · 적용된 패널 (그룹·목록·화살표·크기)</div><img src="../applied/uimob-2.jpg" style="width:390px">',dim=False)
frame('uiB','m','<div class="tag">U2 · 배치 프리셋 4개에서 고르기 → 필요하면 U1로 미세 조정 (추천)</div>'+f'<div class="win" style="width:360px"><h2 style="font-size:17px">🧩 배치 고르기 <span class="x">×</span></h2>{pre}<div class="tip">하나만 누르면 바로 바뀌고, 세부 조정은 “✋ 직접 옮기기”.</div><span class="btn or">✋ 직접 옮기기</span></div>')
frame('uiC','m','<div class="tag">U3 · 전체 크기 슬라이더 하나 + 투명도</div>'+'<div class="win" style="width:340px"><h2 style="font-size:17px">📐 화면 크기 <span class="x">×</span></h2><p>전체 UI 크기 <b>90%</b></p><input type="range" style="width:100%" value="40"><p>창 투명도 <b>80%</b></p><input type="range" style="width:100%" value="80"><div class="tip">창마다 옮기지 않고 한 번에 줄이거나 키워요.</div></div>')
open('sheets.html','w').write('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="sheets.css"><body style="background:#222">'+eq+''.join(F)+'</body>')
print(len(F))
