// 낚멍 v2 게임 데이터 (밸런스 조정은 이 파일만 수정)
window.NK_DATA = {
  DECK_COUNT_DEFAULT: 10,          // 데크 수 (URL ?decks=20 으로도 변경 가능, 최대 20)
  START_COINS: 200,
  GRADES: [ // 등급: 이름, 색, 가격 배수
    {id:0,n:'일반',c:'#aab4c0',m:1},
    {id:1,n:'고급',c:'#5fc48a',m:2},
    {id:2,n:'희귀',c:'#4ea3ea',m:4},
    {id:3,n:'전설',c:'#f4a62a',m:10},
    {id:4,n:'신화',c:'#c46cf2',m:30}],
  // min/max: 게임 내 크기 범위(cm), g: 등급 하한 [고급, 희귀, 전설, 신화], scale: 지수분포 스케일(작을수록 대어가 드묾)
  // w: 기본 출현 가중치, base: 최소 크기일 때 일반 등급 기본가(골드)
  FISH: [
    {k:'crucian',n:'붕어',  min:8,  max:64,  g:[20,30.3,40,50], scale:7,  w:30,base:10,col:'#b9b48a',img:'img/fish/crucian.png',
      src:'FishBase Carassius auratus: 보통 10cm·최대 48cm / 낚시춘추 국내 최대 64cm(1988 송악지) / 월척=30.3cm, 4짜=40cm(영남일보)'},
    {k:'carp',   n:'잉어',  min:20, max:111, g:[40,60,80,100], scale:15, w:14,base:15,col:'#d2a25a',img:'img/fish/carp.png',
      src:'FishBase Cyprinus carpio: 보통 31cm·최대 129cm / 낚시춘추 국내 최대 111cm(1997 의암호)'},
    {k:'leather',n:'향어',  min:25, max:101, g:[40,50,70,90], scale:12, w:8, base:14,col:'#6f7f96',img:'img/fish/leather.png',
      src:'향어(이스라엘잉어) 보통 약 50cm(어식백세/램프쿡) / 국내 낚시 최대 101cm(나무위키, 낚시 기록)'},
    {k:'bluegill',n:'블루길',min:6, max:41,  g:[15,20,25,30], scale:5,  w:22,base:6, col:'#6fa6c8',img:'img/fish/bluegill.png',
      src:'FishBase Lepomis macrochirus: 보통 19.1cm·최대 41cm'},
    {k:'bass',   n:'배스',  min:15, max:64,  g:[30,40,50,58], scale:9,  w:14,base:18,col:'#7fa05a',img:'img/fish/bass.png',
      src:'FishBase Micropterus salmoides: 보통 40cm·최대 97cm / 국내 최대 63.5~63.9cm(전주 아중지) / 50cm 이상 런커'},
    {k:'snakehead',n:'가물치',min:30,max:100, g:[50,70,85,95], scale:13, w:6, base:30,col:'#6b5e48',img:'img/fish/snakehead.png',
      src:'FishBase Channa argus: 최대 100cm, 최대 체중 9.5kg'},
    {k:'mandarin',n:'쏘가리',min:15,max:68,  g:[25,35,45,55], scale:7,  w:6, base:40,col:'#c6a453',img:'img/fish/mandarin.png',
      src:'국립생물자원관: 보통 20cm 내외 / 경북 민물고기연구센터: 보통 20~30cm·최대 60cm 가까이 / 낚시춘추 국내 최대 67.6cm(2010 북한강)'}],
  // 가격 = base × (크기/min)^1.5 × 등급배수 (반올림)
  RODS: [
    {k:'bamboo', n:'대나무 낚싯대', price:0,     size:1.00, speed:1.00, luck:0,    desc:'기본 낚싯대'},
    {k:'carbon', n:'카본 낚싯대',   price:300,   size:1.15, speed:0.92, luck:0,    desc:'대어 확률 소폭↑, 입질 8% 빠름'},
    {k:'silver', n:'은빛 릴낚싯대', price:1500,  size:1.30, speed:0.85, luck:0.03, desc:'대어↑, 희귀 어종 +3%'},
    {k:'gold',   n:'황금 낚싯대',   price:6000,  size:1.50, speed:0.78, luck:0.06, desc:'대어↑↑, 희귀 어종 +6%'},
    {k:'dragon', n:'용왕의 낚싯대', price:20000, size:1.75, speed:0.70, luck:0.10, desc:'신화급 기대, 희귀 어종 +10%'}],
  // 미끼: qty 묶음 수량(0=무한), speed 입질 대기 배수, size 크기 배수, boost 어종별 가중치 배수
  BAITS: [
    {k:'worm',  n:'지렁이',    price:0,   qty:0,  speed:1.00, size:1.00, boost:{},                             desc:'기본 미끼 (무한)'},
    {k:'paste', n:'떡밥',      price:100, qty:20, speed:0.70, size:1.00, boost:{crucian:2,carp:2,leather:2},  desc:'입질 30% 빠름, 붕어·잉어·향어 ×2'},
    {k:'shrimp',n:'민물새우',  price:150, qty:20, speed:0.85, size:1.05, boost:{mandarin:2.5,bass:2,snakehead:2}, desc:'쏘가리 ×2.5, 배스·가물치 ×2'},
    {k:'lure',  n:'스푼 루어', price:800, qty:0,  speed:0.90, size:1.10, boost:{bass:3,snakehead:3,mandarin:2,bluegill:0.5}, desc:'영구. 배스·가물치 ×3, 크기 +10%'},
    {k:'golden',n:'황금 떡밥', price:600, qty:10, speed:0.50, size:1.20, boost:{},                             desc:'입질 2배 빠름, 크기 +20%'}],
  TANKS: [
    {k:'s', n:'기본 어항',    price:0,    cap:5},
    {k:'m', n:'중형 어항',    price:400,  cap:12},
    {k:'l', n:'대형 어항',    price:1500, cap:25},
    {k:'xl',n:'파노라마 수족관',price:5000,cap:50}],
  SHOP_SELL_RATE: 0.6,  // 상점 즉시 판매 = 가치의 60%
  BOT_BUY_INTERVAL: [20, 45], // 봇이 내 어항을 둘러보는 주기(초)
  SOUNDS: {
    day: [
      {f:'sounds/day1_morning_birds_lake', n:'아침 새소리 호숫가'},
      {f:'sounds/day2_forest_breeze_stream', n:'숲 바람 + 시냇물'},
      {f:'sounds/day3_summer_cicada_lake', n:'여름 매미 호수'},
      {f:'sounds/day4_afternoon_pond', n:'오후의 연못'}],
    night: [
      {f:'sounds/night1_frog_chorus', n:'청개구리 합창'},
      {f:'sounds/night3_toad_pond', n:'밤 연못 합창'},
      {f:'sounds/night4_campfire_crickets', n:'모닥불 + 귀뚜라미'}]}
};
