// 튜토리얼 100단계 생성 — 경험치는 단계마다 30+6k, 코인 50+30k, 10단계마다 상자(1+⌊k/30⌋개, 등급 하한 k≥30 고급 · k≥60 희귀 · k=100 영웅)
const S=[];const r5=x=>Math.round(x/5)*5;
const rw=(k,extra)=>{const o={xp:30+6*k,co:50+30*k};if(k%10===0){const n=1+Math.floor(k/30),t=k>=100?3:k>=60?2:k>=30?1:0;o.box=Array(n).fill('lv'+t);}return Object.assign(o,extra||{});};
const add=(k,o)=>{S.push(Object.assign({},o,{rw:rw(k,o.rwx)}));delete S[S.length-1].rwx;};
add(1,{id:'t1tap',cat:'기본',ic:'👋',t:'할아버지 눌러 보기',say:'어서 와, 꼬마 낚시꾼! 할아버지를 <b>한 번 눌러</b> 보렴. 누르면 이 목표 창이 접혔다 펴진단다.',goal:{k:'tutTap',n:1}});
add(2,{id:'t2seat',cat:'기본',ic:'🪑',t:'낚시 의자에 앉기',say:'데크 끝 <b>의자</b> 가까이 가서 <b>앉기</b>를 눌러 보렴. 앉으면 이 데크 어항이 네 어항이 돼.',goal:{k:'seat',n:1}});
add(3,{id:'t3fish',cat:'낚시',ic:'🎣',t:'첫 물고기 낚기',say:'<b>낚시 시작</b>을 누르면 찌를 던져. 찌가 <b>쏙</b> 들어가면 그때 다시 눌러! 너무 빨리 누르면 놓친단다.',goal:{k:'catch',n:1}});
add(4,{id:'t4ten',cat:'낚시',ic:'🐟',t:'물고기 10마리 낚기',say:'감 잡았지? <b>10마리</b>를 낚으면 할아버지가 <b>카본 낚싯대</b>를 줄게!',goal:{k:'catch',n:10},rwx:{rod:'carbon',xp:200}});
add(5,{id:'t5rod',cat:'장비',ic:'🎣',t:'카본 낚싯대 장착하기',say:'받은 <b>카본 낚싯대</b>를 🎒가방 › 낚싯대에서 <b>장착</b>해 보렴. 입질이 더 빨라져.',goal:{k:'rodEq',n:1,rod:'carbon'}});
add(6,{id:'t6bag',cat:'UI',ic:'🎒',t:'가방 열어 보기',say:'아래 메뉴의 <b>가방</b>에는 상자·부적·장비가 모여.',goal:{k:'openBag',n:1}});
add(7,{id:'t7shop',cat:'UI',ic:'🛒',t:'상점 열어 보기',say:'<b>상점</b>에서 미끼·낚싯대·행운 상자를 살 수 있어.',goal:{k:'openShop',n:1}});
add(8,{id:'t8sell',cat:'경제',ic:'💰',t:'물고기 팔기',say:'상점 › <b>판매</b>에서 물고기를 팔면 코인이 생겨.',goal:{k:'sell',n:1}});
add(9,{id:'t9tank',cat:'UI',ic:'🐠',t:'어항 열어 보기',say:'낚은 물고기는 <b>어항</b>에서 헤엄쳐. 한 번 구경해 봐.',goal:{k:'openTank',n:1}});
add(10,{id:'t10dex',cat:'UI',ic:'📖',t:'도감 열어 보기',say:'📖 <b>도감</b>에서 만난 물고기를 모아 볼 수 있어. 열 번째 임무 기념 <b>행운 상자</b>도 줄게!',goal:{k:'openDex',n:1}});
add(11,{id:'t11box',cat:'수집',ic:'🎁',t:'행운 상자 1개 열기',say:'받은 <b>행운 상자</b>를 🎒가방 › 상자에서 <b>열어</b> 보렴. 뭐가 나올까?',goal:{k:'boxOpen',n:1}});
add(12,{id:'t12bait',cat:'장비',ic:'🪱',t:'떡밥으로 바꿔 끼우기',say:'선물 떡밥을 끼워 봐. 상점 › 미끼에서 <b>장착</b>!',goal:{k:'bait',n:1},grant:{bait:{paste:10}}});
add(13,{id:'t13hat',cat:'장비',ic:'👒',t:'밀짚 모자 쓰기',say:'밀짚 모자를 가방에 넣어 뒀어. 가방 › 장비에서 <b>장착</b>!',goal:{k:'wearEq',n:1,slot:'hat'},grant:{wear:'hat1'}});
add(14,{id:'t14cloth',cat:'장비',ic:'👕',t:'면 티셔츠 입기',say:'이번엔 <b>면 티셔츠</b>를 입어 보렴.',goal:{k:'wearEq',n:1,slot:'cloth'},grant:{wear:'cloth1'}});
add(15,{id:'t15shoe',cat:'장비',ic:'👢',t:'짚신 신기',say:'발에는 <b>짚신</b>!',goal:{k:'wearEq',n:1,slot:'shoe'},grant:{wear:'shoe1'}});
add(16,{id:'t16glove',cat:'장비',ic:'🧤',t:'면장갑 끼기',say:'<b>면장갑</b>까지 끼면 소풍 세트 효과가 켜져!',goal:{k:'wearEq',n:1,slot:'glove'},grant:{wear:'glove1'}});
add(17,{id:'t17c15',cat:'낚시',ic:'🎣',t:'15마리 더 낚기',say:'새 장비로 <b>15마리</b> 더!',goal:{k:'catch',n:15}});
add(18,{id:'t18dex3',cat:'수집',ic:'📖',t:'도감 3종 채우기',say:'여러 종류를 낚으면 도감이 채워져. <b>3종</b>!',goal:{k:'dex',n:3}});
add(19,{id:'t19lv4',cat:'성장',ic:'🏅',t:'Lv.4 되기',say:'경험치를 모아 <b>레벨 4</b>가 되어 보자.',goal:{k:'lv',n:4}});
add(20,{id:'t20c20',cat:'낚시',ic:'🐟',t:'20마리 더 낚기',say:'호수가 너를 반기네. <b>20마리</b>! 스무 번째 임무 상자도 준비했어.',goal:{k:'catch',n:20}});
add(21,{id:'t21set',cat:'UI',ic:'⚙️',t:'설정 열어 보기',say:'⚙️ <b>설정</b>에서 소리·화면을 내 맘대로 바꿀 수 있어.',goal:{k:'openSet',n:1}});
add(22,{id:'t22co',cat:'경제',ic:'🪙',t:'코인 1,000 모으기',say:'판매와 보상으로 <b>1,000 코인</b>을 모아 봐.',goal:{k:'coins',n:1000}});
add(23,{id:'t23c25',cat:'낚시',ic:'🎣',t:'25마리 더 낚기',say:'꾸준함이 월척을 불러. <b>25마리</b>!',goal:{k:'catch',n:25}});
add(24,{id:'t24dex5',cat:'수집',ic:'📖',t:'도감 5종',say:'도감에 <b>5종</b>을 채워 보자.',goal:{k:'dex',n:5}});
add(25,{id:'t25enh',cat:'장비',ic:'⚒️',t:'낚싯대 +1 강화',say:'강화석으로 낚싯대를 <b>+1</b> 강화해 보렴. 가방 › 낚싯대 › 강화.',goal:{k:'enh',n:1},grant:{stone:2}});
add(26,{id:'t26c30',cat:'낚시',ic:'🐟',t:'30마리 더 낚기',say:'이제 꽤 능숙해졌어. <b>30마리</b>!',goal:{k:'catch',n:30}});
add(27,{id:'t27lv6',cat:'성장',ic:'🏅',t:'Lv.6 되기',say:'<b>레벨 6</b>! 조금씩 성장하는 기분이지?',goal:{k:'lv',n:6}});
add(28,{id:'t28sell',cat:'경제',ic:'💰',t:'한 번 더 판매하기',say:'어항이 차면 상점 › 판매!',goal:{k:'sell',n:1}});
add(29,{id:'t29dex7',cat:'수집',ic:'📖',t:'도감 7종',say:'도감 <b>7종</b>이면 호수 친구가 꽤 많아.',goal:{k:'dex',n:7}});
add(30,{id:'t30c35',cat:'낚시',ic:'🎣',t:'35마리 더 낚기',say:'서른 번째 임무! <b>35마리</b> 낚으면 고급 상자 2개!',goal:{k:'catch',n:35}});
const SAY={catch:['손맛이 좋지? <b>{n}마리</b> 더!','오늘도 물결이 잔잔해. <b>{n}마리</b>!','큰 놈이 올지도 몰라. <b>{n}마리</b>!','꾸준함이 최고야. <b>{n}마리</b>!','할아버지도 젊을 땐 이만큼 낚았지. <b>{n}마리</b>!'],
 dex:['도감 <b>{n}종</b>을 채워 보자.','새로운 친구를 찾아봐. 도감 <b>{n}종</b>!'],lv:['<b>레벨 {n}</b>까지 가 보자.','<b>Lv.{n}</b>이면 더 좋은 장비를 쓸 수 있어.'],
 coins:['<b>{n} 코인</b>을 모아 보렴.','장비 살 돈을 모아 두자. <b>{n} 코인</b>!'],enh:['낚싯대를 <b>+{n}</b>까지 강화해 보렴.'],boxOpen:['행운 상자를 <b>{n}개</b> 열어 봐.']};
const T={catch:n=>`${n}마리 더 낚기`,dex:n=>`도감 ${n}종`,lv:n=>`Lv.${n} 되기`,coins:n=>`코인 ${n.toLocaleString()} 모으기`,enh:n=>`낚싯대 +${n} 강화`,boxOpen:n=>`행운 상자 ${n}개 열기`};
const IC={catch:'🎣',dex:'📖',lv:'🏅',coins:'🪙',enh:'⚒️',boxOpen:'🎁'},CAT={catch:'낚시',dex:'수집',lv:'성장',coins:'경제',enh:'장비',boxOpen:'수집'};
let ci=0;
for(let k=31;k<=100;k++){const j=k-30;let kind,n;
 if(k%10===0||k%5===1){kind='catch';n=r5(30+j*4.2);}
 else if(k%5===2){kind='dex';n=Math.min(19,7+Math.ceil(j/6));}
 else if(k%5===3){kind='lv';n=6+Math.ceil(j/4.4);}
 else if(k%5===4){const s=Math.floor(j/5)%3;if(s===0){kind='coins';n=Math.round((1500+j*400)/500)*500;}else if(s===1){kind='enh';n=Math.min(8,1+Math.ceil(j/12));}else{kind='boxOpen';n=1+Math.floor(j/30);}}
 else {kind='catch';n=r5(30+j*4.2);}
 const say=(SAY[kind][(ci++)%SAY[kind].length]).replace('{n}',kind==='coins'?n.toLocaleString():n)+(k%10===0?` 이번 임무를 마치면 <b>상자 ${1+Math.floor(k/30)}개</b>!`:'')+(k===100?' 백 번째, 마지막 임무야!':'');
 add(k,{id:'a'+k,cat:CAT[kind],ic:k===100?'🎉':IC[kind],t:k===100?`${T[kind](n)} (졸업)`:T[kind](n),say,goal:{k:kind,n}});}
const sum=S.reduce((a,s)=>{a.xp+=s.rw.xp||0;a.co+=s.rw.co||0;a.box+=(s.rw.box||[]).length;if(s.goal.k==='catch')a.fish+=s.goal.n;return a;},{xp:0,co:0,box:0,fish:0});
console.error(S.length,JSON.stringify(sum),S.filter(s=>s.goal.k==='lv').map(s=>s.goal.n).join(','));
process.stdout.write(' const STEPS=[\n'+S.map(s=>'  '+JSON.stringify(s).replace(/"(\w+)":/g,'$1:'))+'\n ];\n');
