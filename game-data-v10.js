// 낚멍 v10 밸런스 (tools/sim-time.js로 검증)
(function(D){
 // (a) 상위 낚싯대: 용왕은 상자 전용 + 매우 낮은 지급(하루 8시간 기준 약 15일=120시간), 별빛·황금도 같은 곡선
 const PR={carbon:300,silver:2000,coral:6000,sakura:12000};D.RODS.forEach(r=>{if(PR[r.k]!=null)r.price=PR[r.k];});
 D.BOX.rodPool[2]=['silver','sakura','gold'];D.BOX.rodPool[3]=['sakura','gold','star'];D.BOX.rodPool[4]=['gold','star','dragon'];D.BOX.rodPool[5]=['star','dragon'];
 D.BOX.rodKeep={gold:.24,star:.16,dragon:.3,gold_fb:'sakura',star_fb:'gold',dragon_fb:'star'};
 // (c) 낚시 10회마다 상자 1개(보상 상자는 등급 분포가 낮음 → 경제 인플레 방지)
 D.BOX.streakEvery=10;D.BOX.streakReward={charm:.5,stone:.08,rod:.1,bait:.32};D.BOX.streakTiers=[72,21,5.5,1.2,.25,.05];
 // (b) 신화: 최대치 근처를 점근 압축하고 기준을 상향 → 출현 수 약 1/5
 D.FISH.forEach(f=>{const s0=f.g[3],M=f.max-s0,sr=f.scale*1.45,y0=1-Math.pow(.2,sr/M),y=Math.min(.85,y0);f.soft=s0;f.g[3]=Math.round((s0+M*y)*10)/10;
  const got=Math.pow(1-y,M/sr);f.mythP=Math.min(1,.2/got);}); // 기준이 최대치에 너무 가까워지는 어종은 추가 판정(mythP)으로 1/5을 맞춤
 // 자동 낚시: 수동 대비 효율 약 80% (입질 대기 ×1.25, 희귀·고가 어종 가중치 ×0.8, 상자 확률 ×0.8)
 D.AUTO={waitMul:1.25,rareMul:.8,boxMul:.8,reactSec:[.6,1.2],
   gate:'free'}; // 'free' = 누구나 사용 / 'sub' = 구독자만(S.sub===true). 나중에 구독제로 팔 때 'sub'로만 바꾸면 됨
})(window.NK_DATA);
// (d) 중반 수집 목표 (1~20시간 구간): 도감 세트 3단계(모두 낚기 → 전설 → 신화) + 누적 목표, 보상 = 코인·강화석·상자·어항 테마
(function(D){const G=[],rw=(co,st,bx,th)=>({co,st,bx,th});
 D.TANK_THEMES=[{k:'mint',n:'민트 연못',top:'#e9f6f4',bot:'#cfeee8'},{k:'sunset',n:'노을 호수',top:'#ffd9b0',bot:'#f6a6a0'},{k:'deep',n:'깊은 물속',top:'#5aa7d8',bot:'#1e4f86'},{k:'sakura',n:'벚꽃 연못',top:'#ffe6ef',bot:'#f7c3d6'},{k:'night',n:'별밤 어항',top:'#1d2550',bot:'#0b1030',stars:1},{k:'gold',n:'황금 수조',top:'#fff4c8',bot:'#f0c860'}];
 D.COMBO.list.forEach(c=>{G.push({id:'set1_'+c.id,lv:1,cat:'세트',n:`${c.n} 모으기`,d:c.ks.length+'종 모두 낚기',t:'set',ks:c.ks,minG:0,r:rw(1000,0,0)});
  G.push({id:'set2_'+c.id,lv:2,cat:'세트',n:`${c.n} · 전설 컬렉션`,d:'모두 전설 등급 이상으로 낚기',t:'set',ks:c.ks,minG:3,r:rw(3000,1,1)});
  G.push({id:'set3_'+c.id,lv:3,cat:'세트',n:`${c.n} · 신화 컬렉션`,d:'모두 신화 등급으로 낚기',t:'set',ks:c.ks,minG:4,r:rw(10000,4,2)});});
 G.find(g=>g.id==='set3_bung').r.th='sunset';G.find(g=>g.id==='set3_carp').r.th='deep';G.find(g=>g.id==='set3_predator').r.th='gold';
 [[10,rw(1000,0,1)],[15,rw(3000,1,1)],[19,rw(8000,2,2,'sakura')]].forEach(([c,r])=>G.push({id:'sp'+c,cat:'도감',n:`어종 ${c}종 발견`,d:`도감에 ${c}종 등록`,t:'species',cnt:c,r}));
 [[500,rw(1500,1,0)],[3000,rw(5000,2,1)],[10000,rw(15000,4,2)],[30000,rw(40000,8,4)]].forEach(([c,r])=>G.push({id:'c'+c,cat:'누적',n:`총 ${c.toLocaleString()}마리`,d:`물고기 ${c.toLocaleString()}마리 낚기`,t:'caught',cnt:c,r}));
 [[10,rw(4000,1,1)],[19,rw(12000,3,2)]].forEach(([c,r])=>G.push({id:'lg'+c,cat:'등급',n:`전설 ${c}종`,d:`${c}종을 전설 등급 이상으로`,t:'gradeSp',g:3,cnt:c,r}));
 [[1,rw(5000,1,1,'night')],[10,rw(15000,4,2)],[19,rw(40000,8,4)]].forEach(([c,r])=>G.push({id:'my'+c,cat:'등급',n:c===1?'첫 신화':`신화 ${c}종`,d:c===1?'신화 등급 물고기 낚기':`${c}종을 신화 등급으로`,t:'gradeSp',g:4,cnt:c,r}));
 D.GOALS=G;})(window.NK_DATA);
