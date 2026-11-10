// v29: 장비 40종 (모자·옷·신발·장갑 × 10레벨) + 세트 효과. 50=리조트, 60=선장 (서로 교체)
(function(D){
 const LV=[1,10,20,30,40,50,60,70,80,90], T=['hat','cloth','shoe','glove'];
 const SN=['밀짚 소풍','캔버스 산책','체크 캠핑','노랑 우비','호숫가 탐험가','리조트','선장','헤리티지 플라이','요트 클럽','선셋 레이크'];
 const GC=['#aab4c0','#5fc48a','#4ea3ea','#e8b400','#5f9a4a','#5ab4e6','#30508a','#8a6a3a','#c49a2a','#ff7a8a'];
 const IN={hat:['밀짚 모자','버킷햇','털모자','어부 비모자','탐험가 모자','파나마 햇','선장 모자','트위드 헌팅캡','보터 햇','선셋 썬햇'],
  cloth:['면 티셔츠','줄무늬 셔츠','체크 셔츠','노랑 우비','낚시 조끼','린넨 리조트 셔츠','선장 코트','왁스 필드 재킷','요트 블레이저','선셋 캐시미어 가디건'],
  shoe:['짚신','캔버스화','가죽 부츠','노랑 장화','물막이 장화','보트 슈즈','선장 부츠','가죽 웨이딩 부츠','데크 슈즈','선셋 로퍼'],
  glove:['면장갑','손가락 장갑','가죽 장갑','고무 장갑','네오프렌 장갑','썬 피싱 장갑','선장 장갑','스웨이드 장갑','세일링 장갑','캐시미어 장갑']};
 // 주옵션: 모자=경험치, 옷=판매가, 신발=골드, 장갑=상점할인
 const MAIN={hat:['xp',l=>+(1+l*.17).toFixed(1)],cloth:['sell',l=>+(1+l*.19).toFixed(1)],shoe:['coin',l=>+(1+l*.15).toFixed(1)],glove:['shop',l=>+(1+l*.09).toFixed(1)]};
 const MN={xp:'경험치',sell:'판매가',coin:'골드 획득',shop:'상점 할인'};
 const SETFX=[
  {xp:3},{sell:4},{coin:5},{sell:5,quickW:5},{treasure:10},{sell:8,coin:8},{shop:4,xp:6},{big:3,xp:10},{sell:10,shop:6},{sell:12,coin:12,xp:10}];
 const items=[];
 LV.forEach((lv,i)=>T.forEach(slot=>{const [ok,fn]=MAIN[slot];items.push({k:slot+lv,slot,lv,set:i,n:IN[slot][i],sn:SN[i],c:GC[i],img:'img/eq/'+slot+lv+'.png',opt:{[ok]:fn(lv)},optN:MN[ok]+' +'+fn(lv)+'%'});}));
 D.WEAR={slots:['hat','cloth','glove','shoe'],slotN:{hat:'모자',cloth:'옷',glove:'장갑',shoe:'신발'},items,byK:Object.fromEntries(items.map(x=>[x.k,x])),
  sets:SN.map((n,i)=>({i,n,lv:LV[i],c:GC[i],fx:SETFX[i],need:T.map(s=>s+LV[i])})),
  // 상자 드롭: 영웅+ 에서 장비 확률 (레벨대 ≈ 상자 등급)
  boxRate:[0,0,.04,.08,.12,.16], // 일반~신화
  boxLv: [[1],[1,10],[10,20],[20,30,40],[40,50,60],[60,70,80,90]]};
})(window.NK_DATA);
// v77: 입질 대기 최소값 5초 → 2초 (좋은 낚싯대·강화가 끝까지 속도에 반영되게), 자동 낚시 패널티 없앰 (대기·희귀·상자 모두 수동과 같게)
(function(D){if(!D)return;if(D.BITE)D.BITE.min=2;if(D.AUTO)Object.assign(D.AUTO,{waitMul:1,rareMul:1,boxMul:1});})(window.NK_DATA);
// v82: 어항 조합 8개 추가 (8 → 16) — 효과 크기는 기존 조합과 같은 범위, 옵션별 상한은 그대로
(function(D){if(!D||!D.COMBO||D.COMBO._v82)return;D.COMBO._v82=1;const has=k=>(D.FISH||[]).some(f=>f.k===k);
 [{id:'season',n:'사계절 정령',ks:['sakura_trout','rainbow_ayu','maple_mandarin','ice_smelt'],e:{luck:3}},
  {id:'spring',n:'봄 여울',ks:['sakura_trout','gangjunchi','kkeuri'],e:{quick:2}},
  {id:'summer',n:'여름 계곡',ks:['rainbow_ayu','pirami','kkeokji'],e:{bait:3}},
  {id:'autumn',n:'가을 단풍',ks:['maple_mandarin','mandarin','kkeokji'],e:{expert:2}},
  {id:'winter',n:'겨울 얼음낚시',ks:['ice_smelt','crucian','moraemuji'],e:{appraise:2}},
  {id:'bigmouth',n:'큰 입 삼총사',ks:['snakehead','catfish','bass'],e:{big:.6}},
  {id:'eelden',n:'장어 굴',ks:['eel','donjagae','moraemuji'],e:{treasure:4}},
  {id:'pond',n:'연못 정원',ks:['carp','crucian','bluegill'],e:{merchant:1.2}}]
 .forEach(c=>{if(c.ks.every(has)&&!D.COMBO.list.some(x=>x.id===c.id))D.COMBO.list.push(c);});})(window.NK_DATA);
// v96: 대형 어항 4종 (3D 모델은 tank-ext.js 디자인 7~10)
(function(D){if(!D||!D.TANKS||D.TANKS.some(t=>t.k==='grand'))return;D.TANKS.push(
 {k:'grand',n:'그랜드 원형 수족관',price:80000,cap:200,design:7,desc:'황동 왕관 링 · 가운데 돌기둥'},
 {k:'arch',n:'아치 돔 수족관',price:150000,cap:300,design:8,desc:'반원 아치 유리 · 황동 테두리'},
 {k:'pano',n:'파노라마 대형 수조',price:260000,cap:400,design:9,desc:'월넛 캐비닛 · LED 조명'},
 {k:'reef',n:'산호초 벽면 아쿠아리움',price:400000,cap:500,design:10,desc:'알록달록 산호 가득'});})(window.NK_DATA);
