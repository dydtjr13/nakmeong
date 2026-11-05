# v26 시안 HTML 생성 (sheets.html) — 이모지는 게임과 같은 Twemoji png 사용
E=lambda c:f'<img class="emj" src="../../icons/emoji-png/{c}.png">'
R=lambda k:f'../../img/rods/{k}.png'
BOX='../../img/box/t0.png';CH='../../img/charms/t3.png'
F=[]
def frame(id,dev,inner,bg='clean',dim=False):F.append(f'<div class="frame {dev}" id="{id}" style="background-image:url(../img/bg-{dev}-{bg}.jpg)">{"<div class=dim></div>" if dim else ""}{inner}</div>')
def dock(order,on=None,bdg=None):
  ic={'shop':(E('1f6d2'),'상점'),'tank':(E('1f420'),'어항'),'auto':(E('1f916'),'자동낚시'),'box':(f'<img class="bx" src="{BOX}">','상자'),'bag':(E('1f392'),'가방'),'dex':(E('1f4d6'),'도감')}
  return '<div class="dock">'+''.join(f'<div class="it {"on" if k==on else ""}"><span class="ic">{ic[k][0]}</span>{ic[k][1]}{f"<i class=bd>{bdg[k]}</i>" if bdg and k in bdg else ""}</div>' for k in order)+'</div>'
ORD=['shop','tank','auto','box','bag']
# ── 8. 하단 메뉴 ──
frame('menuPC1','pc','<div class="tag">M1 · 도감은 위 메뉴 줄 맨 앞</div>'+dock(ORD,bdg={'box':3,'bag':'N'})+'<div class="dexTop" style="left:838px;top:8px"><span class="ic">'+E('1f4d6')+'</span>도감 <small>12/23</small></div><div class="cover" style="left:820px;top:6px;width:10px;height:0"></div><div class="note">왼쪽부터 상점 · 어항 · 자동낚시 · 상자 · 가방. 도감은 오른쪽 위 메뉴 줄 맨 앞으로 올려요(수집률 같이 표시).</div>')
frame('menuPC2','pc','<div class="tag">M2 · 도감은 낚시 정보 줄 아래 알약</div>'+dock(ORD,bdg={'box':3})+'<div class="dexTop" style="left:10px;top:116px"><span class="ic">'+E('1f4d6')+'</span>도감 <small>12/23</small></div><div class="note">도감을 왼쪽 위 정보 묶음(상태바 · 낚시 정보) 바로 아래에 둬요. 날씨 카드가 뜨면 그 아래로 밀려요.</div>')
mob=lambda pos:''.join(f'<div class="dexSq" style="left:{x}px;top:{y}px;width:44px;height:44px;border-radius:50%;flex-direction:column;font-size:18px">{ic}</div>' for (x,y,ic) in pos)
arc=[(230,724,E('1f6d2')),(226,672,E('1f420')),(252,626,E('1f916')),(298,604,f'<img src="{BOX}" style="width:28px">'),(346,612,E('1f392'))]
lab=''.join(f'<div style="position:absolute;left:{x-6}px;top:{y+44}px;width:56px;text-align:center;font-size:9.5px;font-weight:900;color:#fff;text-shadow:0 1px 2px #000a">{t}</div>' for (x,y,_),t in zip(arc,['상점','어항','자동','상자','가방']))
frame('menuM1','m','<div class="tag">M1 모바일 · 낚시 버튼 둘레</div>'+mob(arc)+lab+'<div class="dexSq" style="left:300px;top:9px">'+E('1f4d6')+'</div><div class="note">낚시 버튼 둘레에 상점→가방 순서(왼쪽 아래→오른쪽 위). 도감은 위 메뉴(☰) 왼쪽 네모 버튼.</div>')
frame('menuM2','m','<div class="tag">M2 모바일 · 아래 한 줄</div>'+dock(ORD,bdg={'box':3}).replace('class="dock"','class="dock" style="bottom:8px;transform:translateX(-50%) scale(.92)"')+'<div class="dexSq" style="left:300px;top:9px">'+E('1f4d6')+'</div><div class="note">아래 한 줄 독(PC와 같은 순서). 조이스틱·낚시 버튼은 독 위로 70px 올려요.</div>')
# ── 가방 (디아블로식) ──
def doll(mob=False):
  s=62 if mob else 74
  if mob: pos={'hat':(141,14),'rod':(30,96),'cloth':(141,96),'glove':(252,96),'shoe':(141,196)}
  else: pos={'hat':(128,18),'rod':(18,140),'cloth':(128,140),'glove':(238,140),'shoe':(128,270)}
  nm={'hat':('1f3a9','모자'),'cloth':('1f9e5','옷'),'glove':('1f9e4','장갑'),'shoe':('1f97e','신발')}
  h='<div class="doll"><b style="font-size:13px">장착 장비</b><div class="sil"></div>'
  for k,(x,y) in pos.items():
    if k=='rod':h+=f'<div class="slot rod" style="left:{x}px;top:{y}px"><img src="{R("heaven")}"></div><div style="position:absolute;left:{x-6}px;top:{y+s+4}px;width:{s+12}px;text-align:center;font-size:10px;font-weight:800">낚싯대</div>'
    else:h+=f'<div class="slot lock" style="left:{x}px;top:{y}px"><span class="ic">{E(nm[k][0])}</span>{nm[k][1]}</div>'
  if not mob:h+='<div class="stat">천룡 낚싯대 <span class="rgb" style="--rc:#ff2d8a">초월</span> ★2 +7<br>⚡빠른입질 <b>58%</b> · 📏대어 <b>79%</b> · 🌟희귀 <b>136%</b><br>✦초월 물고기 <b>0.066%</b></div>'
  return h+'</div>'
def inv(n=24,sel=None,ck=None,cols=6):
  ks=['heaven','fire','abyss','dragon','galaxy','galaxy','star','star','star','gold','gold','sakura','coral','silver','carbon','bamboo']
  cc={'heaven':'#ff2d8a','fire':'#ff2d8a','abyss':'#ef5f8f','dragon':'#c46cf2','galaxy':'#6a5cff','star':'#4a5ab8','gold':'#f4a62a','sakura':'#ef8fb0','coral':'#3fb8b0','silver':'#4ea3ea','carbon':'#5fc48a','bamboo':'#aab4c0'}
  h='<div class="grid">'
  for i in range(n):
    if i<len(ks):
      k=ks[i];h+=f'<div class="cell {"sel" if sel==i else ""}" style="--c:{cc[k]}"><img src="{R(k)}">{"<i class=eq>장착</i>" if i==0 else ""}<span class="st">{"★"*(2 if i==0 else i%3)}</span><span class="pl">+{(7 if i==0 else i%5)}</span>{f"<i class=ck>✓</i>" if ck and i in ck else ""}</div>'
    else:h+='<div class="cell empty"></div>'
  return h+'</div>'
TABS='<div class="tabs"><span class="on">🎣 낚싯대 16</span><span>🧿 부적 9</span><span>🪱 미끼</span><span>💎 강화석 30</span></div>'
frame('bagPC','pc',f'<div class="tag">가방 B1 · 왼쪽 장비 칸(디아블로식) + 오른쪽 인벤토리</div><div class="win"><h2>{E("1f392")} 가방 <span class="sub">장비 1/5칸 · 낚싯대 16</span><span class="x">×</span></h2><div class="cols">{doll()}<div class="inv">{TABS}{inv(24,sel=4)}<div class="tip"><b class="n">은하수 낚싯대</b> <span class="rgb" style="--rc:#6a5cff">은하</span> ★1 +4 · ⚡빠른입질 40% · 📏대어 55%<br><span class="btn ok">장착</span> <span class="btn">★ 합성</span> <span class="btn">⬆ 단계 올리기</span> <span class="btn">판매 🪙5,600</span></div></div></div></div>',bg='clean',dim=True)
frame('bagM','m',f'<div class="tag">가방 B1 모바일</div><div class="win"><h2>{E("1f392")} 가방 <span class="x">×</span></h2><div class="cols">{doll(True)}<div class="inv">{TABS}{inv(20)}</div></div></div>',bg='clean',dim=True)
# B2: 슬롯 목록형
lst=''.join(f'<div style="display:flex;align-items:center;gap:10px;background:#{"3b3346" if k=="rod" else "2a2433"};border:2px solid {"#ff2d8a" if k=="rod" else "#4a3f58"};border-radius:14px;padding:8px 10px;margin-bottom:8px;color:#fff;font-size:12.5px;font-weight:800">{f"<img src={R(chr(104)+chr(101)+chr(97)+chr(118)+chr(101)+chr(110))} style=width:46px>" if k=="rod" else f"<span style=font-size:26px;opacity:.4>{E(c)}</span>"}<div>{n}<br><small style="color:#bfb4cc;font-weight:600">{d}</small></div></div>' for k,c,n,d in [('rod','','낚싯대','천룡 낚싯대 ★2 +7'),('hat','1f3a9','모자','준비중'),('cloth','1f9e5','옷','준비중'),('glove','1f9e4','장갑','준비중'),('shoe','1f97e','신발','준비중')])
frame('bagPC2','pc',f'<div class="tag">가방 B2 · 장비 칸 세로 목록 + 인벤토리</div><div class="win"><h2>{E("1f392")} 가방 <span class="x">×</span></h2><div class="cols" style="grid-template-columns:250px 1fr"><div class="doll" style="height:100%">{lst}</div><div class="inv">{TABS}{inv(30).replace("repeat(6","repeat(6")}</div></div></div>',dim=True)
# ── 상자 창 ──
def boxwin(mob):
  return f'<div class="win" style="{"height:640px" if mob else "height:480px"}"><h2><img class="emj" src="{BOX}" style="width:26px;height:26px"> 상자 <span class="x">×</span></h2><div class="boxes"><div class="bcard a"><img src="{BOX}"><h3>행운 상자</h3><div class="cnt">×7</div><div class="row"><span class="chip">일반 4</span><span class="chip">고급 2</span><span class="chip">희귀 1</span></div><span class="btn or">1개 열기</span><span class="btn">모두 열기</span></div><div class="bcard b"><img src="{CH}"><h3>행운 부적</h3><div class="cnt">9 <small style="font-size:13px;color:#8a7a96">/ 장착 2칸</small></div><div class="row"><span class="chip">희귀 3</span><span class="chip">영웅 1</span></div><span class="btn ok">부적 관리</span><span class="btn">부적 합성</span></div></div></div>'
frame('boxPC','pc','<div class="tag">상자 창 · 행운 상자 + 행운 부적 2칸</div>'+boxwin(False),dim=True)
frame('boxM','m','<div class="tag">상자 창 모바일</div>'+boxwin(True),dim=True)
# ── 9. 장비 합성 시안 ──
S1=f'<div class="win"><h2>{E("2728")} 합성 · S1 모루형 <span class="sub">인벤토리에서 끌어다 놓기</span><span class="x">×</span></h2><div class="cols">{doll()}<div class="inv"><div class="anvil"><div class="s"><img src="{R("galaxy")}"><small>대상 ★1</small></div><span class="ar">+</span><div class="s"><img src="{R("galaxy")}" style="opacity:.8"><small>재료 ★0</small></div><span class="ar">→</span><div class="s res"><img src="{R("galaxy")}"><small>★2 · 기본 +4%</small></div></div><div style="text-align:center;margin:22px 0 10px"><span class="btn or">합성 🪙1,320</span></div>{inv(18,sel=4)}</div></div></div>'
frame('synS1','pc','<div class="tag">S1 · 모루(대상+재료→결과) — 끌어다 놓기</div>'+S1,dim=True)
pr=lambda k,n,to,c,coin,on=False:f'<div class="pr"><img src="{R(k)}"><div><div class="t">{n} {c}/10 → <b>{to}</b> <small>🪙{coin}</small></div><div class="bar"><i style="width:{min(100,c*10)}%"></i></div></div><span class="btn {"or" if on else "dis"}">{"⬆ 올리기" if on else "모으는 중"}</span></div>'
S2=f'<div class="win"><h2>{E("2b06")} 합성 · S2 단계 올리기 진행표 <span class="x">×</span></h2><div class="cols">{doll()}<div class="inv"><div class="tabs"><span>★ 합성 (2개)</span><span class="on">⬆ 단계 올리기 (10개)</span></div><div class="prog">{pr("gold","황금",".별빛".strip("."),4,"5,000")}{pr("star","별빛","은하수",10,"20,000",True)}{pr("galaxy","은하수","용왕",2,"50,000")}{pr("dragon","용왕","심해",1,"100,000")}</div><div class="tip">천룡 · 화룡(초월)은 합성으로 못 만들어요 — 신화 상자에서만 나와요.<br>재료: ★0 · +0 · 잠금/장착 아닌 것만 자동으로 골라요.</div></div></div></div>'
frame('synS2','pc','<div class="tag">S2 · 진행 막대(10개 모으기) — 지금 적용한 최소 기능의 정식판</div>'+S2,dim=True)
S3=f'<div class="win"><h2>{E("1f392")} 가방 · S3 골라서 합성 <span class="x">×</span></h2><div class="cols">{doll()}<div class="inv">{TABS}{inv(24,ck=[6,7,8])}<div class="selbar">별빛 낚싯대 3개 선택 · ★합성은 2개, 단계 올리기는 10개 <span class="btn or">★ 합성 (2개)</span><span class="btn dis">⬆ 10개 필요</span></div></div></div></div>'
frame('synS3','pc','<div class="tag">S3 · 인벤토리에서 체크 → 아래 막대에서 합성</div>'+S3,dim=True)
S1m=f'<div class="win"><h2>{E("2728")} 합성 <span class="x">×</span></h2><div class="anvil" style="gap:6px"><div class="s" style="width:80px;height:80px"><img src="{R("galaxy")}" style="width:60px"><small>대상</small></div><span class="ar">+</span><div class="s" style="width:80px;height:80px"><img src="{R("galaxy")}" style="width:60px"><small>재료</small></div><span class="ar">→</span><div class="s res" style="width:80px;height:80px"><img src="{R("galaxy")}" style="width:60px"><small>★2</small></div></div><div style="text-align:center;margin:24px 0 10px"><span class="btn or">합성 🪙1,320</span></div><div class="inv">{inv(20,sel=4)}</div></div>'
frame('synM','m','<div class="tag">S1 모바일</div>'+S1m,dim=True)
# ── 10. 후원 버튼 ──
D=[('D1 알약 그라데이션',f'<div class="d1">{E("1f49d")} 후원하기</div>','상단 메뉴 줄·설정 안에 어울려요'),('D2 금화 버튼',f'<div class="d2">{E("1fa99")}</div>','게임 코인과 같은 느낌 · 아이콘만'),('D3 커피 한 잔',f'<div class="d3"><span class="cup">{E("2615")}</span><div>커피 한 잔<small>개발자 응원하기</small></div></div>','따뜻한 톤 · 설명이 붙어 부담이 적어요'),('D4 리본 배지','<div class="d4">♥ 응원해 주세요</div>','이벤트 배너처럼 눈에 띔'),('D5 네모 아이콘',f'<div class="d5">{E("1f49d")}<i>N</i></div>','메뉴 버튼과 같은 모양 · 가장 조용함'),('D6 보라 그라데이션',f'<div class="d6">{E("2728")} 피쉬레스트 후원 <small>›</small></div>','초월 색과 맞춘 고급 느낌')]
DS='<div class="dsheet" id="donate"><h2>10. 후원 버튼 디자인 시안 (위치는 나중에)</h2>'+''.join(f'<div class="dc"><span class="lb">{a}</span>{b}<span class="ds">{c}</span></div>' for a,b,c in D)+'</div>'
open('sheets.html','w').write('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="sheets.css"><body>'+''.join(F)+DS+'</body>')
print(len(F))
