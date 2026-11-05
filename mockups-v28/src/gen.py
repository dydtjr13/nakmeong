# v28 시안 HTML (sheets.html) — 중앙 정렬 요소에 data-c 를 달아 측정(measure.js)
E=lambda c:f'<img class="emj" src="../../icons/emoji-png/{c}.png">'
R=lambda k:f'../../img/rods/{k}.png';Q=lambda t,l:f'../img/eq/{t}{l}.png';CH=lambda t:f'../../img/charms/t{t}.png';BOX='../../img/box/t3.png'
LV=[1,10,20,30,40,50,60,70,80,90];GC=['#aab4c0','#5fc48a','#4ea3ea','#e8b400','#5f9a4a','#30508a','#5ab4e6','#8a6a3a','#c49a2a','#ff7a8a']
SN=['밀짚 소풍','캔버스 산책','체크 캠핑','노랑 우비','호숫가 탐험가','선장','리조트','헤리티지 플라이','요트 클럽','선셋 레이크']
IN={'hat':['밀짚 모자','버킷햇','털모자','어부 비모자','탐험가 모자','선장 모자','파나마 햇','트위드 헌팅캡','보터 햇','선셋 썬햇'],'cloth':['면 티셔츠','줄무늬 셔츠','체크 셔츠','노랑 우비','낚시 조끼','선장 코트','린넨 리조트 셔츠','왁스 필드 재킷','요트 블레이저','선셋 캐시미어 가디건'],'shoe':['짚신','캔버스화','가죽 부츠','노랑 장화','물막이 장화','선장 부츠','보트 슈즈','가죽 웨이딩 부츠','데크 슈즈','선셋 로퍼'],'glove':['면장갑','손가락 장갑','가죽 장갑','고무 장갑','네오프렌 장갑','선장 장갑','썬 피싱 장갑','스웨이드 장갑','세일링 장갑','캐시미어 장갑']}
# 부위 주옵션(경제): 모자=경험치, 옷=판매가, 신발=코인, 장갑=상점 할인 · 값 = 기본 + 레벨 비례
MAIN={'hat':('경험치',lambda l:round(1+l*.17)),'cloth':('판매가',lambda l:round(1+l*.19)),'shoe':('코인 획득',lambda l:round(1+l*.15)),'glove':('상점 할인',lambda l:round(1+l*.09))}
SETFX=['경험치 +3%','판매가 +4%','코인 +5%','비·흐림 날씨에 빠른입질 +5% · 판매가 +5%','상자 획득(보물탐지) +10%','상점 할인 +4% · 경험치 +6%','판매가 +8% · 코인 +8%','대물사냥꾼 +3% · 경험치 +10%','판매가 +10% · 상점 할인 +6%','판매가 +12% · 코인 +12% · 경험치 +10%']
KN={'hat':'👒 모자','cloth':'👕 옷','shoe':'👟 신발','glove':'🧤 장갑'};T=list(IN)
P=[]
# 1) 40종 한눈에
h='<div class="eqs" id="eqAll"><h2>장비 40종 v28 — 10레벨마다 4부위가 한 세트</h2><div class="eqr"><span></span>'+''.join(f'<div class="eqlv">Lv {l}<b style="color:{GC[i]}">{SN[i]}</b></div>' for i,l in enumerate(LV))+'</div>'
for t in T:h+=f'<div class="eqr"><span class="eqh">{KN[t]}</span>'+''.join(f'<div class="eqc" data-c="1" style="--c:{GC[i]}"><img src="{Q(t,l)}" title="{IN[t][i]}"></div>' for i,l in enumerate(LV))+'</div>'
P.append(h+'</div>')
# 2) 세트 카드 10장 (한 장 비교)
h='<div class="sets" id="eqSets"><h2>세트 10종 · 4개를 모두 끼면 세트 효과</h2>'
for i,l in enumerate(LV):
  h+=f'<div class="setc" style="--c:{GC[i]}"><div class="hd">{SN[i]} <small>Lv {l}</small></div><div class="its">'+''.join(f'<div data-c="1"><img src="{Q(t,l)}"></div>' for t in T)+f'</div><div class="fx">✨ 세트: {SETFX[i]}</div><div class="op">'+' · '.join(f'{MAIN[t][0]} +{MAIN[t][1](l)}%' for t in T)+'</div></div>'
P.append(h+'</div>')
# 3) 세트별 한 장 (크게)
for i,l in enumerate(LV):P.append(f'<div class="big4" id="set{l}" style="--c:{GC[i]}"><h2 style="margin:0">Lv {l} · {SN[i]} 세트</h2><div class="its">'+''.join(f'<div data-c="1"><img src="{Q(t,l)}">{IN[t][i]}<small style="color:#8a7a96">{MAIN[t][0]} +{MAIN[t][1](l)}%</small></div>' for t in T)+f'</div><div style="font-weight:900;color:#c25a1c">✨ 4세트: {SETFX[i]}</div></div>')
F=[]
def frame(id,dev,inner):F.append(f'<div class="frame {dev}" id="{id}" style="background-image:url(../img/bg-{dev}-clean.jpg)"><div class="dim"></div>{inner}</div>')
def doll(m=False):
  c=lambda k,l,cl='':f'<div class="ds {cl}" data-c="1" style="--c:{GC[LV.index(l)]}"><img src="{Q(k,l)}"></div>'
  rod=f'<div class="ds on" data-c="1" style="--c:#ff2d8a"><img src="{R("heaven")}"></div>'
  return f'<div class="doll" data-c="doll"><div class="dh">장착 장비</div><div class="dg"><i></i>{c("hat",60,"on")}<i></i>{rod}{c("cloth",60,"on")}{c("glove",60,"on")}<i></i>{c("shoe",60,"on")}<i></i></div></div>'
def grid(n,sel=None,eq=True):
  L=[(R(k),'#ff2d8a' if k in('heaven','fire') else '#c46cf2') for k in ['heaven','fire','abyss','dragon','galaxy','star','gold','coral']]+[(Q(t,l),GC[LV.index(l)]) for l in (90,80,70,60) for t in T]
  return '<div class="gl">'+''.join(f'<div data-c="1" class="{"sel" if i==sel else ""}" style="--c:{c}"><img src="{s}"><i>+{i%5}</i></div>' for i,(s,c) in enumerate(L[:n]))+'</div>'
ACT='<div class="ab"><span class="btn ok">장착</span><span class="btn or">⬆ 강화</span><span class="btn">⚒ 합성</span><span class="btn">판매</span></div>'
SUM='<div class="pane" style="margin-top:10px;font-size:12px"><b>📊 효과 합계</b> 판매가 <b>+28%</b> · 경험치 <b>+22%</b> · 코인 <b>+18%</b> · 빠른입질 <b>+35%</b> …</div>'
H=lambda t,s='':f'<h2>{t} <span class="sub" style="font-size:12px;color:#8a7a96;font-weight:600">{s}</span><span class="x">×</span></h2>'
# 가방 G1: 탭 2개(낚싯대|장비) + 강화·합성은 선택 막대
frame('bagG1','pc',f'<div class="tag">G1 · 가방 = 낚싯대 | 장비 (강화·합성은 고른 아이템 아래 버튼) · 추천</div><div class="w2" style="width:1060px">{H(E("1f392")+" 가방","낚싯대·장비만")}<div class="tb"><span class="on">🎣 낚싯대 8</span><span>👕 장비 16</span></div><div style="display:grid;grid-template-columns:300px 1fr;gap:14px"><div>{doll()}{SUM}</div><div class="pane">{grid(18,sel=0)}{ACT}</div></div></div>')
frame('bagG1m','m',f'<div class="tag">G1 모바일</div><div class="w2" style="width:370px">{H(E("1f392")+" 가방")}<div class="tb"><span class="on">🎣 낚싯대</span><span>👕 장비</span></div>{doll(True)}<div class="pane" style="margin-top:10px">{grid(10,sel=0)}{ACT}</div></div>')
# G2: 필터 칩 + 오른쪽 상세(강화/합성 탭)
det=f'<div class="pane det"><div class="im" data-c="1"><img src="{R("heaven")}"></div><b>천룡 낚싯대 ★2 +7</b><div class="tb" style="justify-content:center"><span class="on">정보</span><span>⬆ 강화</span><span>⚒ 합성</span></div><div style="font-size:12px;line-height:1.6">빠른입질 58% · 대어 79%<br>추가옵션: 보물탐지 +18%</div><span class="btn ok">장착 중</span></div>'
frame('bagG2','pc',f'<div class="tag">G2 · 한 목록 + 필터 칩 + 오른쪽 상세(정보·강화·합성)</div><div class="w2" style="width:1180px">{H(E("1f392")+" 가방")}<div style="display:grid;grid-template-columns:280px 1fr 260px;gap:12px"><div>{doll()}</div><div class="pane"><div class="chips"><span class="on">전체</span><span>🎣 낚싯대</span><span>👒 모자</span><span>👕 옷</span><span>👟 신발</span><span>🧤 장갑</span></div>{grid(18,sel=0)}</div>{det}</div></div>')
# G3: 보관함 | 작업대
anv=f'<div class="pane"><b>⚒ 합성 (모루)</b><div style="display:flex;gap:10px;justify-content:center;align-items:center;margin:10px 0" data-c="row"><div class="ds on" style="width:72px;height:72px"><img src="{R("galaxy")}"></div><b>+</b><div class="ds on" style="width:72px;height:72px"><img src="{R("galaxy")}"></div><b>→</b><div class="ds on" style="width:72px;height:72px;--c:#ffb000"><img src="{R("galaxy")}"></div></div></div><div class="pane" style="margin-top:10px"><b>⬆ 강화</b> +7 → +8 · 성공률 60% · 💎12 🪙8,000 <span class="btn or">강화하기</span></div>'
frame('bagG3','pc',f'<div class="tag">G3 · [보관함 | ⚒ 작업대] — 강화·합성은 작업대 한곳에</div><div class="w2" style="width:1000px">{H(E("1f392")+" 가방")}<div class="tb"><span>📦 보관함</span><span class="on">⚒ 작업대</span></div><div style="display:grid;grid-template-columns:300px 1fr;gap:14px"><div>{doll()}</div><div>{anv}<div class="pane" style="margin-top:10px">{grid(12)}</div></div></div></div>')
# 상자 창 (부적만)
ch6='<div class="ch6">'+''.join(f'<div data-c="1" style="--c:{c}"><img src="{CH(t)}"></div>' for t,c in [(5,'#ff2d8a'),(4,'#c46cf2'),(4,'#c46cf2'),(3,'#f4a62a')])+'<div class="e">＋</div><div class="e">🔒</div></div>'
clist='<div class="gl">'+''.join(f'<div data-c="1" style="--c:{["#aab4c0","#5fc48a","#4ea3ea","#f4a62a","#c46cf2","#ff2d8a"][t]}"><img src="{CH(t)}"></div>' for t in [5,4,4,3,3,3,2,2,1,1,0,0])+'</div>'
bx=f'<div class="bx1" data-c="col"><img src="{BOX}"><b>행운 상자 7개</b><div style="display:flex;gap:6px"><span class="btn or">1개 열기</span><span class="btn">10개 열기</span></div></div>'
csum='<div class="pane" style="font-size:12px;margin-top:10px"><b>✨ 부적 합산</b> 행운 +31% · 보물탐지 +120% · 상인 +22% …</div>'
frame('boxX1','pc',f'<div class="tag">X1 · 상자 창 = [🎁 상자 열기 | 🧿 부적 관리 | ⚒ 부적 합성]</div><div class="w2" style="width:1000px">{H("<img class=emj src="+BOX+"> 상자","부적 관련만")}<div class="tb"><span>🎁 상자 열기</span><span class="on">🧿 부적 관리</span><span>⚒ 부적 합성</span></div><div style="display:grid;grid-template-columns:260px 1fr;gap:14px"><div class="pane"><b>장착 6칸</b><div style="margin-top:10px">{ch6}</div>{csum}</div><div class="pane"><div class="chips"><span class="on">전체</span><span>신화</span><span>전설</span><span>영웅</span><span>옵션 검색 🔍</span></div>{clist}</div></div></div>')
frame('boxX2','pc',f'<div class="tag">X2 · 부적 전용 창 + 위에 “🎁 상자 열기” 버튼만 (추천)</div><div class="w2" style="width:1000px">{H("🧿 부적")}<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div class="chips" style="margin:0"><span class="on">관리</span><span>합성</span><span>분해</span></div><span class="mini"><img src="{BOX}"> 상자 7개 열기</span></div><div style="display:grid;grid-template-columns:260px 1fr;gap:14px"><div class="pane"><b>장착 6칸</b><div style="margin-top:10px">{ch6}</div>{csum}</div><div class="pane">{clist}</div></div></div>')
frame('boxX3','pc',f'<div class="tag">X3 · 흐름형: 왼쪽 상자 열기 → 나온 부적이 오른쪽 목록에 NEW로</div><div class="w2" style="width:1000px">{H("<img class=emj src="+BOX+"> 상자 · 부적")}<div style="display:grid;grid-template-columns:260px 1fr;gap:14px"><div>{bx}<div class="pane" style="margin-top:10px"><b>장착 6칸</b><div style="margin-top:10px">{ch6}</div></div></div><div class="pane">{clist}</div></div></div>')
frame('boxX2m','m',f'<div class="tag">X2 모바일</div><div class="w2" style="width:370px">{H("🧿 부적")}<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div class="chips" style="margin:0"><span class="on">관리</span><span>합성</span><span>분해</span></div><span class="mini"><img src="{BOX}"> 7개 열기</span></div><div class="pane">{ch6}</div><div class="pane" style="margin-top:10px">{clist}</div></div>')
frame('boxX1m','m',f'<div class="tag">X1 모바일</div><div class="w2" style="width:370px">{H("상자")}<div class="tb"><span class="on">🎁 열기</span><span>🧿 관리</span><span>⚒ 합성</span></div>{bx}<div class="pane" style="margin-top:10px">{ch6}</div></div>')
open('sheets.html','w').write('<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="sheets.css"><body style="background:#222;margin:0">'+''.join(f'<div style="padding:20px;display:inline-block">{x}</div>' for x in P)+''.join(F)+'</body>')
print(len(P),len(F))
