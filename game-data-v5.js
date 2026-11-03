// 낚멍 v5 데이터: 신규 낚싯대·미끼, 희귀 낚싯대 상자 전용, 6단계 어항(외관 3→6→1→4→2→5),
// 상자 등급별 옵션 구간, 부적 합성, 도감 업적·어항 조합 패시브
(function(D){
const R=D.RODS;
R.push({k:'coral',n:'산호 낚싯대',price:3000,size:1.22,speed:.88,luck:.02,fixed:{bait:10},desc:'미끼 미소모 +10% 고정'},
       {k:'sakura',n:'벚꽃 낚싯대',price:4000,size:1.25,speed:.80,luck:.02,fixed:{quick:5},desc:'빠른입질 +5% 고정 · 꽃잎 효과'},
       {k:'star',n:'별빛 낚싯대',price:9000,size:1.40,speed:.82,luck:.05,fixed:{luck:10},desc:'행운 +10% 고정 · 별빛 발광'});
R.sort((a,b)=>a.price-b.price); // bamboo carbon silver coral sakura gold star dragon
['gold','star','dragon'].forEach(k=>{const r=R.find(x=>x.k===k);r.boxOnly=true;});
R.find(r=>r.k==='gold').desc+=' · 행운 상자 전용';R.find(r=>r.k==='dragon').desc+=' · 행운 상자 전용';R.find(r=>r.k==='star').desc+=' · 행운 상자 전용';
Object.assign(D.GEAR.slots,{coral:1,sakura:2,star:2});Object.assign(D.GEAR.mul,{coral:.15,sakura:.2,star:.27});
D.GEAR.synthCoin=(ri,star)=>120*(ri+1)*(star+1);
D.BAITS.push({k:'corn',n:'옥수수',price:120,qty:20,speed:.9,size:1,boost:{carp:1.6,leather:1.4,tteokbungeo:1.4},desc:'잉어 ×1.6, 향어·떡붕어 ×1.4'},
 {k:'nightlure',n:'야광 미노우 루어',price:1200,qty:0,speed:.9,size:1.1,nightOnly:true,boost:{catfish:1.5,eel:1.5,trout:1.5},desc:'영구. 밤에만 메기·뱀장어·송어 ×1.5'},
 {k:'frog',n:'개구리 루어',price:1500,qty:0,speed:.95,size:1.15,boost:{snakehead:2.5,bass:1.5,crucian:.6,chambungeo:.6,pirami:.6},desc:'영구. 가물치 ×2.5, 배스 ×1.5, 소형어 ×0.6'});
// 상자 등급별 낚싯대·미끼
D.BOX.rodPool=[['bamboo','carbon','coral'],['carbon','coral','silver'],['silver','sakura'],['sakura','gold'],['gold','star'],['star','dragon']];
D.BOX.baitPool=[['corn',15],['shrimp',15],['shrimp',25],['golden',8],['golden',15],['golden',25]];
// 상자 등급별 옵션 구간 (부적: 옵션 신화 상한 대비 / 장비: 기본옵션 품질 · 추가옵션 상한 대비)
D.CHARM.band=[[.10,.25],[.20,.40],[.32,.55],[.45,.70],[.60,.85],[.78,1.00]];
D.GEAR.qBand=[[.90,.98],[.92,1.02],[.95,1.05],[.98,1.08],[1.01,1.11],[1.04,1.14]];
D.GEAR.xBand=[[.30,.55],[.40,.65],[.50,.75],[.60,.85],[.70,.95],[.80,1.00]];
D.GEAR.shopTier=1; // 상점 구매 = 고급 상자 구간
// 부적 합성
D.CHARM.synth={need:5,mythNeed:3,coin:[100,300,800,2000,5000,10000]};
// 어항 6단계 (외관 시안 번호: 사용자 지정 3→6→1→4→2→5)
D.TANKS=[{k:'s',n:'기본 원통 어항',price:0,cap:5,design:3},{k:'m',n:'통나무·돌 어항',price:400,cap:12,design:6},{k:'l',n:'원목 캐비닛 어항',price:1500,cap:25,design:1},
 {k:'xl',n:'한옥 목조 수조',price:5000,cap:40,design:4},{k:'xxl',n:'화이트 림리스 아쿠아리움',price:12000,cap:60,design:2},{k:'royal',n:'레트로 스틸 로열 수족관',price:30000,cap:100,design:5}];
// 패시브 (도감 업적 + 어항 조합) — 부적 합산 상한과 별도의 패시브 상한
D.PASSIVE={cap:{luck:12,treasure:25,quick:10,big:4,expert:12,bait:15,merchant:8,appraise:12,master:20}};
const sp=(S,k)=>(S.dex||{})[k]||{n:0,gr:[0,0,0,0,0]},disc=S=>Object.keys(S.dex||{}).filter(k=>S.dex[k].n).length,comp=S=>D.FISH.filter(f=>sp(S,f.k).gr.every(x=>x)).length,
 hasG=(S,ks,g)=>ks.every(k=>sp(S,k).gr.slice(g).some(x=>x)),cnt=(S,g)=>(S.stats&&S.stats.g[g])||0;
D.ACH=[
 {id:'n5',n:'첫 발견 5종',d:'어종 5종 발견',p:S=>[disc(S),5],e:{luck:2}},
 {id:'n10',n:'호수 탐험가',d:'어종 10종 발견',p:S=>[disc(S),10],e:{quick:2}},
 {id:'n15',n:'박물학자',d:'어종 15종 발견',p:S=>[disc(S),15],e:{merchant:2}},
 {id:'n19',n:'호수 도감 완성',d:'19종 모두 발견',p:S=>[disc(S),19],e:{treasure:8}},
 {id:'common5',n:'흔한 물고기 박사',d:'흔한 어종 5종(참붕어·붕어·피라미·블루길·떡붕어) 고급↑',p:S=>[['chambungeo','crucian','pirami','bluegill','tteokbungeo'].filter(k=>hasG(S,[k],1)).length,5],e:{bait:4}},
 {id:'c1',n:'첫 완성',d:'한 어종 5등급 모두 낚기',p:S=>[comp(S),1],e:{big:1}},
 {id:'c3',n:'완성 수집가',d:'5등급 완성 3종',p:S=>[comp(S),3],e:{luck:2}},
 {id:'c7',n:'등급 마스터',d:'5등급 완성 7종',p:S=>[comp(S),7],e:{expert:3}},
 {id:'c12',n:'호수의 현자',d:'5등급 완성 12종',p:S=>[comp(S),12],e:{appraise:4}},
 {id:'c19',n:'전설의 낚시꾼',d:'19종 모두 5등급 완성',p:S=>[comp(S),19],e:{master:10}},
 {id:'l1',n:'첫 전설',d:'전설 등급 1마리',p:S=>[cnt(S,3)+cnt(S,4),1],e:{treasure:3}},
 {id:'l10',n:'전설 사냥꾼',d:'전설 이상 10마리',p:S=>[cnt(S,3)+cnt(S,4),10],e:{treasure:4}},
 {id:'l50',n:'전설 수집가',d:'전설 이상 50마리',p:S=>[cnt(S,3)+cnt(S,4),50],e:{treasure:5}},
 {id:'m1',n:'첫 신화',d:'신화 등급 1마리',p:S=>[cnt(S,4),1],e:{master:4}},
 {id:'m5',n:'신화의 손',d:'신화 5마리',p:S=>[cnt(S,4),5],e:{luck:3}},
 {id:'m20',n:'신화 그 자체',d:'신화 20마리',p:S=>[cnt(S,4),20],e:{big:2}},
 {id:'night',n:'밤의 어종 세트',d:'메기·뱀장어·동자개·무지개송어 발견',p:S=>[['catfish','eel','donjagae','trout'].filter(k=>sp(S,k).n).length,4],e:{quick:3}},
 {id:'native',n:'한국 고유종',d:'쏘가리·꺽지 희귀↑',p:S=>[['mandarin','kkeokji'].filter(k=>hasG(S,[k],2)).length,2],e:{expert:3}},
 {id:'carass',n:'붕어 가족',d:'붕어·떡붕어·참붕어 전설↑',p:S=>[['crucian','tteokbungeo','chambungeo'].filter(k=>hasG(S,[k],3)).length,3],e:{bait:6}},
 {id:'alien',n:'외래종 퇴치반',d:'블루길·배스 신화',p:S=>[['bluegill','bass'].filter(k=>hasG(S,[k],4)).length,2],e:{merchant:3}}];
// 어항 조합: 어종이 모두 어항에 있으면 발동. 효과 = 기본값 × 등급배수(조합 물고기 중 '가장 낮은' 등급 기준)
D.COMBO={mult:[1,1.4,1.8,2.6,3.5],list:[
 {id:'bung',n:'붕어 삼형제',ks:['crucian','tteokbungeo','chambungeo'],e:{bait:3}},
 {id:'silver',n:'은빛 여울',ks:['gangjunchi','kkeuri','pirami'],e:{quick:2}},
 {id:'carp',n:'잉어의 왕',ks:['carp','leather','nuchi'],e:{big:.8}},
 {id:'bottom',n:'바닥 친구들',ks:['moraemuji','donjagae','nuchi'],e:{appraise:2.5}},
 {id:'alien',n:'외래종 관리',ks:['bluegill','bass','trout'],e:{merchant:1.5}},
 {id:'native',n:'한국 고유종',ks:['kkeokji','mandarin'],e:{expert:2.5}},
 {id:'night',n:'밤의 사냥꾼',ks:['catfish','eel','donjagae'],e:{luck:2.5}},
 {id:'predator',n:'호수의 맹어',ks:['snakehead','bass','mandarin'],e:{treasure:5}}]};
D.TOGGLE_LABEL='시간 흐름';
})(window.NK_DATA);
