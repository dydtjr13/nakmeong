// 낚멍 v3 — 행운 상자 · 행운 부적 · 낚싯대 강화 데이터 (물고기 등급과 별개 6단계)
Object.assign(window.NK_DATA||(window.NK_DATA={}),{
 BOX:{
  base:0.005,                       // 낚시 성공 1회당 상자 드롭 0.5%
  tiers:[{n:'일반',c:'#aab4c0',w:60},{n:'고급',c:'#5fc48a',w:25},{n:'희귀',c:'#4ea3ea',w:10},{n:'영웅',c:'#e0607e',w:4},{n:'전설',c:'#f4a62a',w:0.9},{n:'신화',c:'#c46cf2',w:0.1}],
  charmRate:0.7,                    // 70% 부적, 30% 강화석 + 골드
  stones:[1,2,3,5,8,12],            // 등급별 강화석
  coins:[50,120,300,800,2000,5000]  // 등급별 동봉 골드
 },
 CHARM:{
  slots:3,
  tierOpts:[1,1,2,2,3,3],           // 등급별 옵션 개수
  tierMul:[.25,.40,.55,.70,.85,1.0],// 등급별 옵션 상한 배수 (신화=100%)
  rollMin:.4,                       // 각 옵션은 (상한×배수)의 40~100% 사이에서 굴림
  // cap: 부적 1개 기준 신화 상한(%), total: 부적 3개 합산 상한(%)
  opts:{
   luck:    {n:'행운',       cap:25,total:40,  cat:'낚시',d:'희귀 어종(향어·가물치·쏘가리) 출현 가중치 +'},
   treasure:{n:'보물탐지',   cap:60,total:100, cat:'낚시',d:'행운 상자 드롭 확률 +(상대%)'},
   quick:   {n:'빠른입질',   cap:20,total:35,  cat:'낚시',d:'입질 대기시간 -'},
   big:     {n:'대물사냥꾼', cap:12,total:15,  cat:'낚시',d:'물고기 크기 분포 +'},
   expert:  {n:'어종전문가', cap:20,total:30,  cat:'낚시',d:'고가 어종(배스·가물치·쏘가리) 출현 가중치 +'},
   bait:    {n:'미끼전문가', cap:30,total:50,  cat:'낚시',d:'미끼 소모하지 않을 확률'},
   merchant:{n:'상인',       cap:15,total:20,  cat:'경제',d:'상점 판매가 +'},
   appraise:{n:'보물감정',   cap:25,total:40,  cat:'경제',d:'상자 개봉 시 추가 보상 확률'},
   master:  {n:'감정의달인', cap:50,total:80,  cat:'경제',d:'상자 희귀 이상 등급 가중치 +'}
  }
 },
 ENH:{max:10,rate:[100,95,90,80,70,60,50,40,30,20],size:.015,speed:.02,dropFrom:5,dropChance:.5,stonePrice:400,
  stone:lv=>lv+1, coin:lv=>100*(lv+1)*(lv+1)},
 AUTO_DEFAULT:{on:false,th:30,keepNew:true}
});
