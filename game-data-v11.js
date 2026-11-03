// 낚멍 v11 밸런스: 입질 대기(힐링 템포)·낚싯대 성격·강화 +20·상자 선물(100회/일 10개)
(function(D){
 // 입질 대기(초) = 기본 범위 × 대기배수(낚싯대·강화·부적·미끼), 최소 5초. 가짜 입질(찌 흔들림) 확률
 D.BITE={base:[11,23],min:5,fake:.55,early:'fail'};
 // 낚싯대 성격: speed(입질), size(크기), luck(희귀), coin(판매가), box(상자)
 const R={bamboo:{size:1,speed:1,luck:0,coin:0,desc:'기본 낚싯대'},
  carbon:{size:1.05,speed:.9,luck:0,coin:0,desc:'⚡입질형 · 입질 대기 -10%'},
  silver:{size:1.3,speed:.96,luck:.01,coin:0,desc:'📏크기형 · 대어 +30%'},
  coral:{size:1.12,speed:.88,luck:.01,coin:.15,fixed:{bait:10},desc:'🪙코인형 · 판매가 +15%, 미끼 미소모 +10%'},
  sakura:{size:1.15,speed:.76,luck:.02,coin:.05,fixed:{quick:5},desc:'⚡입질형 · 입질 대기 -24%, 빠른입질 +5%'},
  gold:{size:1.45,speed:.84,luck:.04,coin:.25,box:.1,desc:'🪙코인·크기형 · 판매가 +25%, 대어 +45%, 상자 +10% · 상자 전용'},
  star:{size:1.3,speed:.66,luck:.12,coin:.1,box:.2,fixed:{luck:10},desc:'🌟희귀형 · 희귀 어종 +120%, 입질 -34%, 상자 +20% · 상자 전용'},
  dragon:{size:1.7,speed:.6,luck:.12,coin:.3,box:.25,desc:'🐉만능 최강 · 대어 +70%, 입질 -40%, 희귀 +120%, 판매가 +30% · 상자 전용'}};
 D.RODS.forEach(r=>Object.assign(r,R[r.k]||{}));
 // 강화 +20: 단계당 크기 +1%·대기 -1.2%, 돌파 보너스, 실패 패널티 구간별
 const rate=[100,95,90,85,80, 70,62,55,48,42, 35,30,26,22,18, 15,12,10,8,6],st=[1,1,2,2,3, 3,4,5,6,7, 9,10,12,14,16, 18,21,24,27,30];
 Object.assign(D.ENH,{max:20,rate,size:.01,speed:.012,stone:lv=>st[lv],coin:lv=>Math.round(150*(lv+1)*(lv+1)/10)*10,stonePrice:0,noBuy:true,
  fail:lv=>lv<10?{p:0,floor:0}:lv<15?{p:.3,floor:10}:{p:.5,floor:15},
  failTxt:lv=>lv<10?'유지':lv<15?'30% 하락(최저 +10)':'50% 하락(최저 +15)',
  bt:[{lv:5,n:'+5 돌파',luck:.02,d:'희귀 어종 +20%'},{lv:10,n:'+10 돌파',coin:.1,d:'판매가 +10%'},{lv:15,n:'+15 돌파',box:.15,d:'상자 확률 +15%'},{lv:20,n:'+20 돌파',size:.1,coin:.1,luck:.03,d:'크기 +10%·판매가 +10%·희귀 +30% · 금빛 오라'}]});
 // 상자 선물: 낚시 성공 100회마다 1개, 하루 최대 10개
 D.BOX.streakEvery=100;D.BOX.dailyCap=10;
})(window.NK_DATA);
// 상자 낚싯대 곡선 재조정(입질 느려짐·상자 감소 반영): 황금 ≈8h(1일) · 별빛 ≈32h(4일) · 용왕 ≈120h(15일), 하루 8시간 기준
(function(D){D.BOX.reward=Object.assign({},D.BOX.reward,{charm:.45,stone:.18,rod:.25,bait:.12});if(D.BOX.streakReward)D.BOX.streakReward=Object.assign({},D.BOX.streakReward,{charm:.42,stone:.08,rod:.25,bait:.25});
 D.BOX.rodPool[1]=['carbon','coral','silver','gold'];D.BOX.rodPool[3]=['sakura','gold','star','dragon'];D.BOX.rodKeep={gold:.6,star:.68,dragon:.25,gold_fb:'sakura',star_fb:'gold',dragon_fb:'star'};})(window.NK_DATA);
