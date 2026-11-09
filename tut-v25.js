// 피쉬레스트 v33: 튜토리얼 50단계 · 완수→보상→다음 한 흐름
// goal.k: seat | catch | bait | sell | dex | lv | wearEq | openBag | openShop | openTank | openDex | openSet | fishBtn | sitNear | coins | boxes | stones | catchG | emote | move
(function(){const $=id=>document.getElementById(id),G=()=>window.NKV2,S=()=>(G()&&G().S)||null;
 // v78: 튜토리얼 100단계 — 생성 규칙: tools/tut-gen-v78.js (경험치 30+6×단계 · 골드 50+30×단계 · 10단계마다 상자)
 const STEPS=[
  {id:"t1tap",cat:"기본",ic:"👋",t:"할아버지 눌러 보기",say:"어서 와, 꼬마 낚시꾼! 할아버지를 <b>한 번 눌러</b> 보렴. 누르면 이 목표 창이 접혔다 펴진단다.",goal:{k:"tutTap",n:1},rw:{xp:36,co:80}},  {id:"t2seat",cat:"기본",ic:"🪑",t:"낚시 의자에 앉기",say:"데크 끝 <b>의자</b> 가까이 가서 <b>앉기</b>를 눌러 보렴. 앉으면 이 데크 어항이 네 어항이 돼.",goal:{k:"seat",n:1},rw:{xp:42,co:110}},  {id:"t3fish",cat:"낚시",ic:"🎣",t:"첫 물고기 낚기",say:"<b>낚시 시작</b>을 누르면 찌를 던져. 찌가 <b>쏙</b> 들어가면 그때 다시 눌러! 너무 빨리 누르면 놓친단다.",goal:{k:"catch",n:1},rw:{xp:48,co:140}},  {id:"t4ten",cat:"낚시",ic:"🐟",t:"물고기 10마리 낚기",say:"감 잡았지? <b>10마리</b>를 낚으면 할아버지가 <b>카본 낚싯대</b>를 줄게!",goal:{k:"catch",n:10},rw:{xp:200,co:170,rod:"carbon"}},  {id:"t5rod",cat:"장비",ic:"🎣",t:"카본 낚싯대 장착하기",say:"받은 <b>카본 낚싯대</b>를 🎒가방 › 낚싯대에서 <b>장착</b>해 보렴. 입질이 더 빨라져.",goal:{k:"rodEq",n:1,rod:"carbon"},rw:{xp:60,co:200}},  {id:"t6bag",cat:"UI",ic:"🎒",t:"가방 열어 보기",say:"아래 메뉴의 <b>가방</b>에는 상자·부적·장비가 모여.",goal:{k:"openBag",n:1},rw:{xp:66,co:230}},  {id:"t7shop",cat:"UI",ic:"🛒",t:"상점 열어 보기",say:"<b>상점</b>에서 미끼·낚싯대·행운 상자를 살 수 있어.",goal:{k:"openShop",n:1},rw:{xp:72,co:260}},  {id:"t8sell",cat:"경제",ic:"💰",t:"물고기 팔기",say:"상점 › <b>판매</b>에서 물고기를 팔면 골드가 생겨.",goal:{k:"sell",n:1},rw:{xp:78,co:290}},  {id:"t9tank",cat:"UI",ic:"🐠",t:"어항 열어 보기",say:"낚은 물고기는 <b>어항</b>에서 헤엄쳐. 한 번 구경해 봐.",goal:{k:"openTank",n:1},rw:{xp:84,co:320}},  {id:"t10dex",cat:"UI",ic:"📖",t:"도감 열어 보기",say:"📖 <b>도감</b>에서 만난 물고기를 모아 볼 수 있어. 열 번째 임무 기념 <b>행운 상자</b>도 줄게!",goal:{k:"openDex",n:1},rw:{xp:90,co:350,box:["lv0"]}},  {id:"t11box",cat:"수집",ic:"🎁",t:"행운 상자 1개 열기",say:"받은 <b>행운 상자</b>를 🎒가방 › 상자에서 <b>열어</b> 보렴. 뭐가 나올까?",goal:{k:"boxOpen",n:1},rw:{xp:96,co:380}},  {id:"t12bait",cat:"장비",ic:"🪱",t:"떡밥으로 바꿔 끼우기",say:"선물 떡밥을 끼워 봐. 상점 › 미끼에서 <b>장착</b>!",goal:{k:"bait",n:1},grant:{bait:{paste:10}},rw:{xp:102,co:410}},  {id:"t13hat",cat:"장비",ic:"👒",t:"밀짚 모자 쓰기",say:"밀짚 모자를 가방에 넣어 뒀어. 가방 › 장비에서 <b>장착</b>!",goal:{k:"wearEq",n:1,slot:"hat"},grant:{wear:"hat1"},rw:{xp:108,co:440}},  {id:"t14cloth",cat:"장비",ic:"👕",t:"면 티셔츠 입기",say:"이번엔 <b>면 티셔츠</b>를 입어 보렴.",goal:{k:"wearEq",n:1,slot:"cloth"},grant:{wear:"cloth1"},rw:{xp:114,co:470}},  {id:"t15shoe",cat:"장비",ic:"👢",t:"짚신 신기",say:"발에는 <b>짚신</b>!",goal:{k:"wearEq",n:1,slot:"shoe"},grant:{wear:"shoe1"},rw:{xp:120,co:500}},  {id:"t16glove",cat:"장비",ic:"🧤",t:"면장갑 끼기",say:"<b>면장갑</b>까지 끼면 소풍 세트 효과가 켜져!",goal:{k:"wearEq",n:1,slot:"glove"},grant:{wear:"glove1"},rw:{xp:126,co:530}},  {id:"t17c15",cat:"낚시",ic:"🎣",t:"15마리 더 낚기",say:"새 장비로 <b>15마리</b> 더!",goal:{k:"catch",n:15},rw:{xp:132,co:560}},  {id:"t18dex3",cat:"수집",ic:"📖",t:"도감 3종 채우기",say:"여러 종류를 낚으면 도감이 채워져. <b>3종</b>!",goal:{k:"dex",n:3},rw:{xp:138,co:590}},  {id:"t19lv4",cat:"성장",ic:"🏅",t:"Lv.4 되기",say:"경험치를 모아 <b>레벨 4</b>가 되어 보자.",goal:{k:"lv",n:4},rw:{xp:144,co:620}},  {id:"t20c20",cat:"낚시",ic:"🐟",t:"20마리 더 낚기",say:"호수가 너를 반기네. <b>20마리</b>! 스무 번째 임무 상자도 준비했어.",goal:{k:"catch",n:20},rw:{xp:150,co:650,box:["lv0"]}},  {id:"t21set",cat:"UI",ic:"⚙️",t:"설정 열어 보기",say:"⚙️ <b>설정</b>에서 소리·화면을 내 맘대로 바꿀 수 있어.",goal:{k:"openSet",n:1},rw:{xp:156,co:680}},  {id:"t22co",cat:"경제",ic:"🪙",t:"골드 1,000 모으기",say:"판매와 보상으로 <b>1,000 골드</b>을 모아 봐.",goal:{k:"coins",n:1000},rw:{xp:162,co:710}},  {id:"t23c25",cat:"낚시",ic:"🎣",t:"25마리 더 낚기",say:"꾸준함이 월척을 불러. <b>25마리</b>!",goal:{k:"catch",n:25},rw:{xp:168,co:740}},  {id:"t24dex5",cat:"수집",ic:"📖",t:"도감 5종",say:"도감에 <b>5종</b>을 채워 보자.",goal:{k:"dex",n:5},rw:{xp:174,co:770}},  {id:"t25enh",cat:"장비",ic:"⚒️",t:"낚싯대 +1 강화",say:"강화석으로 낚싯대를 <b>+1</b> 강화해 보렴. 가방 › 낚싯대 › 강화.",goal:{k:"enh",n:1},grant:{stone:2},rw:{xp:180,co:800}},  {id:"t26c30",cat:"낚시",ic:"🐟",t:"30마리 더 낚기",say:"이제 꽤 능숙해졌어. <b>30마리</b>!",goal:{k:"catch",n:30},rw:{xp:186,co:830}},  {id:"t27lv6",cat:"성장",ic:"🏅",t:"Lv.6 되기",say:"<b>레벨 6</b>! 조금씩 성장하는 기분이지?",goal:{k:"lv",n:6},rw:{xp:192,co:860}},  {id:"t28sell",cat:"경제",ic:"💰",t:"한 번 더 판매하기",say:"어항이 차면 상점 › 판매!",goal:{k:"sell",n:1},rw:{xp:198,co:890}},  {id:"t29dex7",cat:"수집",ic:"📖",t:"도감 7종",say:"도감 <b>7종</b>이면 호수 친구가 꽤 많아.",goal:{k:"dex",n:7},rw:{xp:204,co:920}},  {id:"t30c35",cat:"낚시",ic:"🎣",t:"35마리 더 낚기",say:"서른 번째 임무! <b>35마리</b> 낚으면 고급 상자 2개!",goal:{k:"catch",n:35},rw:{xp:210,co:950,box:["lv1","lv1"]}},  {id:"a31",cat:"낚시",ic:"🎣",t:"35마리 더 낚기",say:"손맛이 좋지? <b>35마리</b> 더!",goal:{k:"catch",n:35},rw:{xp:216,co:980}},  {id:"a32",cat:"수집",ic:"📖",t:"도감 8종",say:"새로운 친구를 찾아봐. 도감 <b>8종</b>!",goal:{k:"dex",n:8},rw:{xp:222,co:1010}},  {id:"a33",cat:"성장",ic:"🏅",t:"Lv.7 되기",say:"<b>레벨 7</b>까지 가 보자.",goal:{k:"lv",n:7},rw:{xp:228,co:1040}},  {id:"a34",cat:"경제",ic:"🪙",t:"골드 3,000 모으기",say:"장비 살 돈을 모아 두자. <b>3,000 골드</b>!",goal:{k:"coins",n:3000},rw:{xp:234,co:1070}},  {id:"a35",cat:"낚시",ic:"🎣",t:"50마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>50마리</b>!",goal:{k:"catch",n:50},rw:{xp:240,co:1100}},  {id:"a36",cat:"낚시",ic:"🎣",t:"55마리 더 낚기",say:"손맛이 좋지? <b>55마리</b> 더!",goal:{k:"catch",n:55},rw:{xp:246,co:1130}},  {id:"a37",cat:"수집",ic:"📖",t:"도감 9종",say:"도감 <b>9종</b>을 채워 보자.",goal:{k:"dex",n:9},rw:{xp:252,co:1160}},  {id:"a38",cat:"성장",ic:"🏅",t:"Lv.8 되기",say:"<b>Lv.8</b>이면 더 좋은 장비를 쓸 수 있어.",goal:{k:"lv",n:8},rw:{xp:258,co:1190}},  {id:"a39",cat:"장비",ic:"⚒️",t:"낚싯대 +2 강화",say:"낚싯대를 <b>+2</b>까지 강화해 보렴.",goal:{k:"enh",n:2},rw:{xp:264,co:1220}},  {id:"a40",cat:"낚시",ic:"🎣",t:"70마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>70마리</b>! 이번 임무를 마치면 <b>상자 2개</b>!",goal:{k:"catch",n:70},rw:{xp:270,co:1250,box:["lv1","lv1"]}},  {id:"a41",cat:"낚시",ic:"🎣",t:"75마리 더 낚기",say:"손맛이 좋지? <b>75마리</b> 더!",goal:{k:"catch",n:75},rw:{xp:276,co:1280}},  {id:"a42",cat:"수집",ic:"📖",t:"도감 9종",say:"새로운 친구를 찾아봐. 도감 <b>9종</b>!",goal:{k:"dex",n:9},rw:{xp:282,co:1310}},  {id:"a43",cat:"성장",ic:"🏅",t:"Lv.9 되기",say:"<b>레벨 9</b>까지 가 보자.",goal:{k:"lv",n:9},rw:{xp:288,co:1340}},  {id:"a44",cat:"수집",ic:"🎁",t:"행운 상자 1개 열기",say:"행운 상자를 <b>1개</b> 열어 봐.",goal:{k:"boxOpen",n:1},rw:{xp:294,co:1370}},  {id:"a45",cat:"낚시",ic:"🎣",t:"95마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>95마리</b>!",goal:{k:"catch",n:95},rw:{xp:300,co:1400}},  {id:"a46",cat:"낚시",ic:"🎣",t:"95마리 더 낚기",say:"손맛이 좋지? <b>95마리</b> 더!",goal:{k:"catch",n:95},rw:{xp:306,co:1430}},  {id:"a47",cat:"수집",ic:"📖",t:"도감 10종",say:"도감 <b>10종</b>을 채워 보자.",goal:{k:"dex",n:10},rw:{xp:312,co:1460}},  {id:"a48",cat:"성장",ic:"🏅",t:"Lv.11 되기",say:"<b>Lv.11</b>이면 더 좋은 장비를 쓸 수 있어.",goal:{k:"lv",n:11},rw:{xp:318,co:1490}},  {id:"a49",cat:"경제",ic:"🪙",t:"골드 9,000 모으기",say:"<b>9,000 골드</b>을 모아 보렴.",goal:{k:"coins",n:9000},rw:{xp:324,co:1520}},  {id:"a50",cat:"낚시",ic:"🎣",t:"115마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>115마리</b>! 이번 임무를 마치면 <b>상자 2개</b>!",goal:{k:"catch",n:115},rw:{xp:330,co:1550,box:["lv1","lv1"]}},  {id:"a51",cat:"낚시",ic:"🎣",t:"120마리 더 낚기",say:"손맛이 좋지? <b>120마리</b> 더!",goal:{k:"catch",n:120},rw:{xp:336,co:1580}},  {id:"a52",cat:"수집",ic:"📖",t:"도감 11종",say:"새로운 친구를 찾아봐. 도감 <b>11종</b>!",goal:{k:"dex",n:11},rw:{xp:342,co:1610}},  {id:"a53",cat:"성장",ic:"🏅",t:"Lv.12 되기",say:"<b>레벨 12</b>까지 가 보자.",goal:{k:"lv",n:12},rw:{xp:348,co:1640}},  {id:"a54",cat:"장비",ic:"⚒️",t:"낚싯대 +3 강화",say:"낚싯대를 <b>+3</b>까지 강화해 보렴.",goal:{k:"enh",n:3},rw:{xp:354,co:1670}},  {id:"a55",cat:"낚시",ic:"🎣",t:"135마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>135마리</b>!",goal:{k:"catch",n:135},rw:{xp:360,co:1700}},  {id:"a56",cat:"낚시",ic:"🎣",t:"140마리 더 낚기",say:"손맛이 좋지? <b>140마리</b> 더!",goal:{k:"catch",n:140},rw:{xp:366,co:1730}},  {id:"a57",cat:"수집",ic:"📖",t:"도감 12종",say:"도감 <b>12종</b>을 채워 보자.",goal:{k:"dex",n:12},rw:{xp:372,co:1760}},  {id:"a58",cat:"성장",ic:"🏅",t:"Lv.13 되기",say:"<b>Lv.13</b>이면 더 좋은 장비를 쓸 수 있어.",goal:{k:"lv",n:13},rw:{xp:378,co:1790}},  {id:"a59",cat:"수집",ic:"🎁",t:"행운 상자 1개 열기",say:"행운 상자를 <b>1개</b> 열어 봐.",goal:{k:"boxOpen",n:1},rw:{xp:384,co:1820}},  {id:"a60",cat:"낚시",ic:"🎣",t:"155마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>155마리</b>! 이번 임무를 마치면 <b>상자 3개</b>!",goal:{k:"catch",n:155},rw:{xp:390,co:1850,box:["lv2","lv2","lv2"]}},  {id:"a61",cat:"낚시",ic:"🎣",t:"160마리 더 낚기",say:"손맛이 좋지? <b>160마리</b> 더!",goal:{k:"catch",n:160},rw:{xp:396,co:1880}},  {id:"a62",cat:"수집",ic:"📖",t:"도감 13종",say:"새로운 친구를 찾아봐. 도감 <b>13종</b>!",goal:{k:"dex",n:13},rw:{xp:402,co:1910}},  {id:"a63",cat:"성장",ic:"🏅",t:"Lv.14 되기",say:"<b>레벨 14</b>까지 가 보자.",goal:{k:"lv",n:14},rw:{xp:408,co:1940}},  {id:"a64",cat:"경제",ic:"🪙",t:"골드 15,000 모으기",say:"장비 살 돈을 모아 두자. <b>15,000 골드</b>!",goal:{k:"coins",n:15000},rw:{xp:414,co:1970}},  {id:"a65",cat:"낚시",ic:"🎣",t:"175마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>175마리</b>!",goal:{k:"catch",n:175},rw:{xp:420,co:2000}},  {id:"a66",cat:"낚시",ic:"🎣",t:"180마리 더 낚기",say:"손맛이 좋지? <b>180마리</b> 더!",goal:{k:"catch",n:180},rw:{xp:426,co:2030}},  {id:"a67",cat:"수집",ic:"📖",t:"도감 14종",say:"도감 <b>14종</b>을 채워 보자.",goal:{k:"dex",n:14},rw:{xp:432,co:2060}},  {id:"a68",cat:"성장",ic:"🏅",t:"Lv.15 되기",say:"<b>Lv.15</b>이면 더 좋은 장비를 쓸 수 있어.",goal:{k:"lv",n:15},rw:{xp:438,co:2090}},  {id:"a69",cat:"장비",ic:"⚒️",t:"낚싯대 +5 강화",say:"낚싯대를 <b>+5</b>까지 강화해 보렴.",goal:{k:"enh",n:5},rw:{xp:444,co:2120}},  {id:"a70",cat:"낚시",ic:"🎣",t:"200마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>200마리</b>! 이번 임무를 마치면 <b>상자 3개</b>!",goal:{k:"catch",n:200},rw:{xp:450,co:2150,box:["lv2","lv2","lv2"]}},  {id:"a71",cat:"낚시",ic:"🎣",t:"200마리 더 낚기",say:"손맛이 좋지? <b>200마리</b> 더!",goal:{k:"catch",n:200},rw:{xp:456,co:2180}},  {id:"a72",cat:"수집",ic:"📖",t:"도감 14종",say:"새로운 친구를 찾아봐. 도감 <b>14종</b>!",goal:{k:"dex",n:14},rw:{xp:462,co:2210}},  {id:"a73",cat:"성장",ic:"🏅",t:"Lv.16 되기",say:"<b>레벨 16</b>까지 가 보자.",goal:{k:"lv",n:16},rw:{xp:468,co:2240}},  {id:"a74",cat:"수집",ic:"🎁",t:"행운 상자 2개 열기",say:"행운 상자를 <b>2개</b> 열어 봐.",goal:{k:"boxOpen",n:2},rw:{xp:474,co:2270}},  {id:"a75",cat:"낚시",ic:"🎣",t:"220마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>220마리</b>!",goal:{k:"catch",n:220},rw:{xp:480,co:2300}},  {id:"a76",cat:"낚시",ic:"🎣",t:"225마리 더 낚기",say:"손맛이 좋지? <b>225마리</b> 더!",goal:{k:"catch",n:225},rw:{xp:486,co:2330}},  {id:"a77",cat:"수집",ic:"📖",t:"도감 15종",say:"도감 <b>15종</b>을 채워 보자.",goal:{k:"dex",n:15},rw:{xp:492,co:2360}},  {id:"a78",cat:"성장",ic:"🏅",t:"Lv.17 되기",say:"<b>Lv.17</b>이면 더 좋은 장비를 쓸 수 있어.",goal:{k:"lv",n:17},rw:{xp:498,co:2390}},  {id:"a79",cat:"경제",ic:"🪙",t:"골드 21,000 모으기",say:"<b>21,000 골드</b>을 모아 보렴.",goal:{k:"coins",n:21000},rw:{xp:504,co:2420}},  {id:"a80",cat:"낚시",ic:"🎣",t:"240마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>240마리</b>! 이번 임무를 마치면 <b>상자 3개</b>!",goal:{k:"catch",n:240},rw:{xp:510,co:2450,box:["lv2","lv2","lv2"]}},  {id:"a81",cat:"낚시",ic:"🎣",t:"245마리 더 낚기",say:"손맛이 좋지? <b>245마리</b> 더!",goal:{k:"catch",n:245},rw:{xp:516,co:2480}},  {id:"a82",cat:"수집",ic:"📖",t:"도감 16종",say:"새로운 친구를 찾아봐. 도감 <b>16종</b>!",goal:{k:"dex",n:16},rw:{xp:522,co:2510}},  {id:"a83",cat:"성장",ic:"🏅",t:"Lv.19 되기",say:"<b>레벨 19</b>까지 가 보자.",goal:{k:"lv",n:19},rw:{xp:528,co:2540}},  {id:"a84",cat:"장비",ic:"⚒️",t:"낚싯대 +6 강화",say:"낚싯대를 <b>+6</b>까지 강화해 보렴.",goal:{k:"enh",n:6},rw:{xp:534,co:2570}},  {id:"a85",cat:"낚시",ic:"🎣",t:"260마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>260마리</b>!",goal:{k:"catch",n:260},rw:{xp:540,co:2600}},  {id:"a86",cat:"낚시",ic:"🎣",t:"265마리 더 낚기",say:"손맛이 좋지? <b>265마리</b> 더!",goal:{k:"catch",n:265},rw:{xp:546,co:2630}},  {id:"a87",cat:"수집",ic:"📖",t:"도감 17종",say:"도감 <b>17종</b>을 채워 보자.",goal:{k:"dex",n:17},rw:{xp:552,co:2660}},  {id:"a88",cat:"성장",ic:"🏅",t:"Lv.20 되기",say:"<b>Lv.20</b>이면 더 좋은 장비를 쓸 수 있어.",goal:{k:"lv",n:20},rw:{xp:558,co:2690}},  {id:"a89",cat:"수집",ic:"🎁",t:"행운 상자 2개 열기",say:"행운 상자를 <b>2개</b> 열어 봐.",goal:{k:"boxOpen",n:2},rw:{xp:564,co:2720}},  {id:"a90",cat:"낚시",ic:"🎣",t:"280마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>280마리</b>! 이번 임무를 마치면 <b>상자 4개</b>!",goal:{k:"catch",n:280},rw:{xp:570,co:2750,box:["lv2","lv2","lv2","lv2"]}},  {id:"a91",cat:"낚시",ic:"🎣",t:"285마리 더 낚기",say:"손맛이 좋지? <b>285마리</b> 더!",goal:{k:"catch",n:285},rw:{xp:576,co:2780}},  {id:"a92",cat:"수집",ic:"📖",t:"도감 18종",say:"새로운 친구를 찾아봐. 도감 <b>18종</b>!",goal:{k:"dex",n:18},rw:{xp:582,co:2810}},  {id:"a93",cat:"성장",ic:"🏅",t:"Lv.21 되기",say:"<b>레벨 21</b>까지 가 보자.",goal:{k:"lv",n:21},rw:{xp:588,co:2840}},  {id:"a94",cat:"경제",ic:"🪙",t:"골드 27,000 모으기",say:"장비 살 돈을 모아 두자. <b>27,000 골드</b>!",goal:{k:"coins",n:27000},rw:{xp:594,co:2870}},  {id:"a95",cat:"낚시",ic:"🎣",t:"305마리 더 낚기",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>305마리</b>!",goal:{k:"catch",n:305},rw:{xp:600,co:2900}},  {id:"a96",cat:"낚시",ic:"🎣",t:"305마리 더 낚기",say:"손맛이 좋지? <b>305마리</b> 더!",goal:{k:"catch",n:305},rw:{xp:606,co:2930}},  {id:"a97",cat:"수집",ic:"📖",t:"도감 19종",say:"도감 <b>19종</b>을 채워 보자.",goal:{k:"dex",n:19},rw:{xp:612,co:2960}},  {id:"a98",cat:"성장",ic:"🏅",t:"Lv.22 되기",say:"<b>Lv.22</b>이면 더 좋은 장비를 쓸 수 있어.",goal:{k:"lv",n:22},rw:{xp:618,co:2990}},  {id:"a99",cat:"장비",ic:"⚒️",t:"낚싯대 +7 강화",say:"낚싯대를 <b>+7</b>까지 강화해 보렴.",goal:{k:"enh",n:7},rw:{xp:624,co:3020}},  {id:"a100",cat:"낚시",ic:"🎉",t:"325마리 더 낚기 (졸업)",say:"할아버지도 젊을 땐 이만큼 낚았지. <b>325마리</b>! 이번 임무를 마치면 <b>상자 4개</b>! 백 번째, 마지막 임무야!",goal:{k:"catch",n:325},rw:{xp:630,co:3050,box:["lv3","lv3","lv3","lv3"]}}
 ];
 const CHECK={
  seat:(g,b,s)=>{try{return (G().mySeat&&G().mySeat())?1:0;}catch(e){return 0;}},
  fishBtn:(g,b,s)=>{try{return (G().nearSpot&&G().nearSpot())||(G().mySeat&&G().mySeat())?1:0;}catch(e){return 0;}},
  catch:(g,b,s)=>Math.max(0,(s.caught||0)-(b.caught||0)),
  bait:(g,b,s)=>s.bait&&s.bait!=='worm'?1:0,
  sell:(g,b,s)=>((s.earned||0)>(b.earned||0))?1:0,
  dex:(g,b,s)=>Object.keys(s.dex||{}).length,
  lv:()=>G().myLv?G().myLv():1,
  wearEq:(g,b,s)=>((s.wear||[]).some(w=>w.eq&&w.slot===g.slot)?1:0),
  openBag:(g,b,s)=> (b._bag||0),
  openShop:(g,b,s)=> (b._shop||0),
  openTank:(g,b,s)=> (b._tank||0),
  openDex:(g,b,s)=> (b._dex||0),
  openSet:(g,b,s)=> (b._set||0),
  coins:(g,b,s)=>s.coins||0,
  boxes:(g,b,s)=>(s.boxes||[]).length,
  boxesEver:(g,b,s)=>Math.max((s.boxes||[]).length,(s._boxGot||0),(b.boxes||0)),
  stones:(g,b,s)=>s.stones||0,
  tutTap:(g,b,s)=>b._tap||0,
  rodEq:(g,b,s)=>{try{const G0=window.NK_SYS.gearOf(s);return G0&&G0.k===g.rod?1:0;}catch(e){return 0;}},
  enh:(g,b,s)=>{try{const G0=window.NK_SYS.gearOf(s);return G0?G0.enh|0:0;}catch(e){return 0;}},
  boxOpen:(g,b,s)=>Math.max(0,(s.boxOpened||0)-(b.boxOpened||0))
 };
 const K='nk_tut25';let P;try{P=JSON.parse(localStorage.getItem(K)||'null');}catch(e){}
 if(!P)P={i:0,b:null,v:3,chk:1,paid:{},granted:{},boxGot:0};
 if(!P.paid)P.paid={};if(!P.granted)P.granted={};if((P.v|0)<3){/* v78: 100단계로 바뀜 — 예전 50단계를 다 끝냈으면 새 단계 30부터, 아니면 진행한 만큼 비슷한 위치로 */const old=P.i|0;P.i=old>=50?30:Math.min(old,29);P.b=null;}P.v=3;
 const sv=()=>{try{localStorage.setItem(K,JSON.stringify(P));}catch(e){}};
 const U=()=>window.NK_UI25,m=()=>innerWidth<700,emo=e=>{try{window.NK_EMOJI&&NK_EMOJI.parse&&NK_EMOJI.parse(e);}catch(_){}};
 const rwTxt=r=>{if(!r)return '';return [r.co&&`🪙 ${r.co}`,r.xp&&`⭐ ${r.xp} XP`,r.bait&&Object.entries(r.bait).map(([k,n])=>`🪱 ${k==='paste'?'떡밥':k}×${n}`).join(' '),r.box&&`🎁 상자 ${r.box.length}`,r.stone&&`💎 ${r.stone}`,r.wear&&`👕 장비`,r.rod&&`🎣 ${(window.NK_DATA&&NK_DATA.RODS.find(x=>x.k===r.rod)||{}).n||'낚싯대'}`].filter(Boolean).join(' · ');};
 function base(){const s=S()||{};return {boxOpened:s.boxOpened||0,caught:s.caught||0,earned:s.earned||0,boxes:(s.boxes||[]).length,_bag:0,_shop:0,_tank:0,_dex:0,_set:0,_tap:0};}
 function give(r,tag){
  if(!r)return {ok:true,note:'empty'};
  const s=S(),g=G();if(!s||!g)return {ok:false,note:'no S'};
  const before={co:s.coins,st:s.stones||0,bx:(s.boxes||[]).length,wear:(s.wear||[]).length,xp:s.xp||0};
  if(r.co)s.coins=(s.coins||0)+r.co;
  if(r.bait){for(const k in r.bait){if(s.baits[k]!==-1)s.baits[k]=(s.baits[k]||0)+r.bait[k];}}
  if(r.box){r.box.forEach(b=>s.boxes.push(b));s._boxGot=(s._boxGot||0)+r.box.length;P.boxGot=(P.boxGot||0)+r.box.length;}
  if(r.stone)s.stones=(s.stones||0)+r.stone;
  if(r.rod){try{const D0=window.NK_DATA,SY=window.NK_SYS;const gr=SY.makeGear(D0,r.rod,s.nid++);s.gear.push(gr);s.rods=s.rods||[];if(!s.rods.includes(r.rod))s.rods.push(r.rod);}catch(e){console.warn(e);}}
  if(r.xp&&g.addXP)g.addXP(r.xp,'튜토리얼');
  if(r.wear){s.wear=s.wear||[];const it=(window.NK_DATA&&NK_DATA.WEAR&&NK_DATA.WEAR.byK[r.wear]);
   if(it&&!s.wear.some(w=>w.k===r.wear)){s.wear.push({id:(s.nid=(s.nid||1)+1),k:r.wear,slot:it.slot,lv:it.lv,eq:false,nw:1});}}
  try{g.save&&g.save();g.applyHud&&g.applyHud();g.hud&&g.hud();}catch(e){}
  const after={co:s.coins,st:s.stones||0,bx:(s.boxes||[]).length,wear:(s.wear||[]).length};
  return {ok:true,tag,before,after,delta:{co:after.co-before.co,st:after.st-before.st,bx:after.bx-before.bx,wear:after.wear-before.wear}};
 }
 function ensureGrant(st){
  if(!st||!st.grant)return;
  const id=st.id;if(P.granted[id])return;
  const r=give(st.grant,'grant:'+id);P.granted[id]=1;sv();
  if(r.ok){try{G()._n&&G()._n.toast(`🎁 튜토리얼 지급: ${rwTxt(st.grant)}`,2200);}catch(e){}}
 }
 function prog(st){const s=S();if(!s||!G())return 0;if(!P.b){P.b=base();sv();}ensureGrant(st);const fn=CHECK[st.goal.k];if(!fn)return 0;return Math.min(st.goal.n,fn(st.goal,P.b,s));}
 let el,last='',busy=false,hooked=false;
 function hookUI(){
  if(hooked)return;hooked=1;
  const mark=k=>{if(!P.b)P.b=base();P.b[k]=1;sv();};
  const wrap=(obj,key,flag)=>{if(!obj)return;const o=obj[key];if(typeof o!=='function'||o._tut33)return;
   obj[key]=function(){try{mark(flag);}catch(e){}return o.apply(this,arguments);};obj[key]._tut33=1;};
  const tryHook=()=>{const g=G();if(!g)return false;
   wrap(g,'openBag','_bag');wrap(g,'openSet','_set');wrap(g,'renderShop','_shop');wrap(g,'renderDex','_dex');
   if(g.tankView)wrap(g.tankView,'open','_tank');
   // also listen DOM
   document.addEventListener('click',e=>{
    const t=e.target.closest&&e.target.closest('#bBag,#bShop,#bTank,#bDex,#bSet,[data-btab],#tq25 [data-tq]');
    if(!t)return;
    if(t.id==='bBag'||t.closest('#bBag'))mark('_bag');
    if(t.id==='bShop'||t.closest('#bShop'))mark('_shop');
    if(t.id==='bTank'||t.closest('#bTank'))mark('_tank');
    if(t.id==='bDex'||t.closest('#bDex'))mark('_dex');
    if(t.id==='bSet'||t.closest('#bSet'))mark('_set');
    if(t.getAttribute&&t.getAttribute('data-tq')){mark('_tap');}
   },true);
   // 모달 감지는 tick에서 폴링 (body 전체 MutationObserver는 핫패스 비용↑)
   return true;
  };
  if(!tryHook()){const iv=setInterval(()=>{if(tryHook())clearInterval(iv);},400);setTimeout(()=>clearInterval(iv),20000);}
 }
 function render(force){if(!el){el=document.createElement('div');el.id='tq25';document.body.appendChild(el);el.addEventListener('click',e=>{const a=e.target.closest('[data-tq]');if(!a)return;e.stopPropagation();const k=a.dataset.tq;
   if(k==='npc'){if(!P.b)P.b=base();P.b._tap=1;sv();if(m())U().set('tutHide',U().get('tutHide')?0:1);else U().set('tutFold',U().get('tutFold')?0:1);render(1);}if(k==='fold'){U().set('tutFold',U().get('tutFold')?0:1);render(1);}});}
  const done=P.i>=STEPS.length,go=document.getElementById('go'),started=go&&!go.offsetParent;
  if(!started||done||(U()&&U().get('tutOff'))){el.style.display='none';return;}el.style.display='';
  const st=STEPS[P.i],n=prog(st),v=m()?(U().get('tutM')||'D2'):(U().get('tutPC')||'D2'),pos=m()?(U().get('tutPosM')||'top'):(U().get('tutPosPC')||'bl'),fold=m()?U().get('tutHide'):U().get('tutFold');
  const key=[P.i,n,v,pos,fold,m()].join('|');if(key===last&&!force)return place();last=key;
  el.className=`${String(v).toLowerCase()} p-${pos} ${m()?'m':'pc'} ${fold?'fold':''}`;const pc=Math.round(n/st.goal.n*100),cnt=st.goal.n>1?` <em>${n}/${st.goal.n}</em>`:'';
  if(v==='D4')el.innerHTML=`<div class="sh" data-tq="fold"><div class="hd"><span class="ic">${st.ic}</span><div><small>지금 할 일 · ${P.i+1}/${STEPS.length}</small><b>${st.t}${cnt}</b></div><span class="rw">${rwTxt(st.rw)}</span></div><div class="pg"><i style="width:${Math.max(4,pc)}%"></i></div>${fold?'':`<div class="nx">${st.say}</div>`}</div>`;
  else el.innerHTML=`<div class="npc"><img data-tq="npc" src="img/chars/h1.jpg" alt="노인 어부" title="눌러서 ${m()?'말풍선 닫기/열기':'목표 접기/펴기'}">${fold?`<span class="dot">${P.i+1}/${STEPS.length}</span>`:`<div class="bb"><b class="who">노인 어부 할아버지 <small>${P.i+1}/${STEPS.length}</small></b><p>${st.say}</p><div class="goal">${st.ic} ${st.t}${cnt}</div><div class="pg"><i style="width:${Math.max(4,pc)}%"></i></div><span class="rw">보상 ${rwTxt(st.rw)}</span></div>`}</div>`;
  emo(el);place();}
 function place(){if(!el||el.style.display==='none')return;el.classList.toggle('hid',!!document.querySelector('.modal.show:not(#start),.cutin:not(.box):not(#uiPvCut)'));const set=(k,v)=>el.style.setProperty(k,v);['top','bottom','left','right'].forEach(k=>el.style.removeProperty(k));
  const vis=id=>{const e=$(id);if(!e||!e.getClientRects().length||getComputedStyle(e).visibility==='hidden')return null;const r=e.getBoundingClientRect();return r.height&&+getComputedStyle(e).opacity>.05?r:null;};
  if(m()){const v=el.classList.contains('d4');const cb=vis('chatBtn'),an=vis('annBar');let top=(cb?cb.bottom:100)+8;
   if(v){set('left','8px');set('top',top+'px');return;}
   if(el.classList.contains('p-bot')){const fb=vis('fishBtn');set('left','8px');set('bottom',(fb?innerHeight-fb.top+70:240)+'px');return;}
   if(an)top=Math.max(top,an.bottom+8);set('left','8px');set('top',top+'px');return;}
  const p=[...el.classList].find(c=>c.startsWith('p-'));const mm=vis('mMain');
  if(el.classList.contains('d4')){set('right','18px');set('top','56px');return;}
  if(p==='p-bl'){const ch=vis('chat');set('left','12px');set('bottom',(ch?innerHeight-ch.top+12:220)+'px');}
  else if(p==='p-r'){set('right','18px');set('top','34%');}
  else{const T=Math.min(mm?mm.top:innerHeight-92,...['fishBtn','bSit','sitBtn'].map(vis).filter(Boolean).map(r=>r.top).filter(t=>t>innerHeight*.4));set('left','50%');set('bottom',(innerHeight-T+48)+'px');}}
 function complete(st){
  if(busy)return;busy=true;
  try{
   const id=st.id;
   if(!P.paid[id]){const r=give(st.rw,'rw:'+id);P.paid[id]=1;sv();
    const TD=window.NK_TUTDONE;if(TD&&TD.on())TD.push({t:st.t,ic:st.ic,cat:st.cat,rw:st.rw,no:STEPS.indexOf(st)+1});
    else{try{G()._n&&G()._n.toast(`✅ 튜토리얼 완료: ${st.t}<br><small>보상 ${rwTxt(st.rw)||'없음'}</small>`,2800);}catch(e){}}
    window.__tutLastReward=r;
   }
   P.i++;P.b=null;sv();
   if(P.i<STEPS.length){P.b=base();ensureGrant(STEPS[P.i]);sv();}
   else{const TD=window.NK_TUTDONE;if(TD&&TD.on())TD.push({all:1});else try{G()._n.toast('🎉 튜토리얼을 모두 마쳤어요! 이제 자유롭게 낚시해요',3200);}catch(e){}}
   last='';render(1);
  }finally{busy=false;}
 }
 function pollModals(){if(!P.b)return;const on=id=>{const e=document.getElementById(id);return e&&e.classList.contains('show');};
  if(on('bag'))P.b._bag=1;if(on('shop'))P.b._shop=1;if(on('tank'))P.b._tank=1;if(on('dex'))P.b._dex=1;if(on('set'))P.b._set=1;}
 function tick(){if(!S()||!G()){return;}hookUI();pollModals();
  // 자동 스킵은 수동 reset/jump 후에만 끄고, 신규는 유지하되 너무 공격적이지 않게: caught>=80 & lv>=10
  if(!P.chk){P.chk=1;if((G().myLv&&G().myLv()>=10)&&((S().caught||0)>=80))P.i=STEPS.length;sv();}
  if(P.i>=STEPS.length){render();return;}
  const st=STEPS[P.i];ensureGrant(st);const n=prog(st);
  if(n>=st.goal.n)complete(st);
  render();}
 setInterval(tick,500);addEventListener('resize',()=>{last='';render(1);});document.addEventListener('nkui25',()=>{last='';render(1);});
 window.NK_TUT={STEPS,CHECK,P:()=>P,reset:()=>{P={i:0,b:null,v:3,chk:1,paid:{},granted:{},boxGot:0};sv();last='';busy=false;render(1);},
  skip:()=>{P.i=STEPS.length;sv();render(1);},
  jump:i=>{i=Math.max(0,Math.min(STEPS.length,+i||0));P.i=i;P.b=null;busy=false;sv();if(i<STEPS.length){P.b=base();ensureGrant(STEPS[i]);sv();}last='';render(1);},
  give,ensureGrant,complete:_=>{if(P.i<STEPS.length)complete(STEPS[P.i]);}};
})();
