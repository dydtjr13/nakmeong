// 피쉬레스트 v33: 튜토리얼 50단계 · 완수→보상→다음 한 흐름
// goal.k: seat | catch | bait | sell | dex | lv | wearEq | openBag | openShop | openTank | openDex | openSet | fishBtn | sitNear | coins | boxes | stones | catchG | emote | move
(function(){const $=id=>document.getElementById(id),G=()=>window.NKV2,S=()=>(G()&&G().S)||null;
 const STEPS=[
  // —— 초반: 즉시 가능 ——
  {id:'hello',cat:'기본',ic:'👋',t:'할아버지 인사 듣기',say:'어서 와, 꼬마 낚시꾼! 할아버지를 <b>한 번 눌러</b> 보면 목표가 접혔다 펴진단다.',goal:{k:'tutTap',n:1},rw:{co:30}},
  {id:'walk',cat:'기본',ic:'🚶',t:'낚시 의자에 앉기',say:'데크 끝 <b>의자(스툴)</b> 가까이 가서 <b>앉기</b>를 눌러 보렴.',goal:{k:'seat',n:1},rw:{co:50}},
  {id:'fishBtn',cat:'낚시',ic:'🎯',t:'낚시 버튼 나타나게 하기',say:'의자에 앉으면 화면에 <b>낚시 시작</b> 버튼이 떠. 그대로 앉아 있어 봐!',goal:{k:'fishBtn',n:1},rw:{xp:20}},
  {id:'first',cat:'낚시',ic:'🎣',t:'첫 물고기 낚기',say:'<b>낚시 시작</b>을 누르고, 찌가 <b>쏙</b> 들어가면 다시 눌러!',goal:{k:'catch',n:1},rw:{xp:40,co:40}},
  {id:'openBag',cat:'UI',ic:'🎒',t:'가방 열어 보기',say:'아래 메뉴의 <b>가방</b>을 눌러 봐. 상자·부적·낚싯대가 여기 있어.',goal:{k:'openBag',n:1},rw:{co:40}},
  {id:'openShop',cat:'UI',ic:'🛒',t:'상점 열어 보기',say:'<b>상점</b>에 들어가 보렴. 미끼·낚싯대·판매가 있지.',goal:{k:'openShop',n:1},rw:{co:40}},
  {id:'openTank',cat:'UI',ic:'🐠',t:'어항 열어 보기',say:'잡은 물고기는 <b>어항</b>에 들어가. 한 번 열어 봐!',goal:{k:'openTank',n:1},rw:{co:40}},
  {id:'openDex',cat:'UI',ic:'📖',t:'도감 열어 보기',say:'📖 <b>도감</b>에서 어떤 물고기를 만났는지 볼 수 있어.',goal:{k:'openDex',n:1},rw:{co:40}},
  {id:'three',cat:'낚시',ic:'🐟',t:'물고기 3마리 낚기',say:'감 잡았지? 이번엔 <b>3마리</b>를 더 낚아 보자.',goal:{k:'catch',n:3},rw:{bait:{paste:8},co:60}},
  {id:'bait',cat:'장비',ic:'🪱',t:'떡밥으로 바꿔 끼우기',say:'선물 떡밥을 끼워 봐. 🛒상점 › 미끼에서 <b>장착</b>!',goal:{k:'bait',n:1},rw:{co:100}},
  {id:'sell',cat:'경제',ic:'💰',t:'물고기 팔기',say:'🛒상점 › <b>판매</b>에서 물고기를 팔면 코인이 생겨.',goal:{k:'sell',n:1},rw:{co:120}},
  {id:'openSet',cat:'UI',ic:'⚙️',t:'설정 열어 보기',say:'⚙️ <b>설정</b>에서 튜토리얼 임무도 직접 고를 수 있어.',goal:{k:'openSet',n:1},rw:{co:50}},
  // —— 장비: 입장 시 지급(grant) → 장착이 목표 ——
  {id:'wearHat',cat:'장비',ic:'👒',t:'밀짚 모자 장착',say:'할아버지 밀짚 모자를 가방에 넣어 뒀어. 🎒가방 › 장비에서 <b>장착</b>!',goal:{k:'wearEq',n:1,slot:'hat'},grant:{wear:'hat1'},rw:{co:80,xp:20}},
  {id:'wearCloth',cat:'장비',ic:'👕',t:'면 티셔츠 장착',say:'이번엔 <b>면 티셔츠</b>. 가방 › 장비에서 입어 봐.',goal:{k:'wearEq',n:1,slot:'cloth'},grant:{wear:'cloth1'},rw:{co:80}},
  {id:'wearShoe',cat:'장비',ic:'👢',t:'짚신 장착',say:'발에는 <b>짚신</b>! 가방에서 신어 보렴.',goal:{k:'wearEq',n:1,slot:'shoe'},grant:{wear:'shoe1'},rw:{co:80}},
  {id:'wearGlove',cat:'장비',ic:'🧤',t:'면장갑 장착',say:'마지막으로 <b>면장갑</b>. 네 칸 채우면 소풍 세트 효과가 켜져!',goal:{k:'wearEq',n:1,slot:'glove'},grant:{wear:'glove1'},rw:{co:100,box:['lv0']}},
  {id:'dex3',cat:'수집',ic:'📖',t:'도감 3종 채우기',say:'여러 종류를 낚으면 도감이 채워져. <b>3종</b>!',goal:{k:'dex',n:3},rw:{co:100,xp:50}},
  {id:'catch5',cat:'낚시',ic:'🎣',t:'누적 5마리 더 낚기',say:'손맛이 좋지? <b>5마리</b>만 더!',goal:{k:'catch',n:5},rw:{co:80,bait:{paste:5}}},
  {id:'coins500',cat:'경제',ic:'🪙',t:'코인 500 모으기',say:'판매·보상으로 <b>코인 500</b>을 모아 봐.',goal:{k:'coins',n:500},rw:{box:['lv0'],xp:40}},
  {id:'bagAgain',cat:'UI',ic:'🎒',t:'가방 다시 열기',say:'장비 장착했는지 가방을 한 번 더 확인해 봐.',goal:{k:'openBag',n:1},rw:{co:40}},
  // —— 중반: 가벼운 성장 ——
  {id:'lv2',cat:'성장',ic:'🏅',t:'Lv.2 되기',say:'경험치를 모아 <b>레벨 2</b>가 되어 보자.',goal:{k:'lv',n:2},rw:{co:150}},
  {id:'catch8',cat:'낚시',ic:'🐟',t:'8마리 더 낚기',say:'호수가 너를 반기네. <b>8마리</b>!',goal:{k:'catch',n:8},rw:{co:100,xp:60}},
  {id:'sell2',cat:'경제',ic:'💰',t:'한 번 더 판매하기',say:'상점 › 판매로 또 한 번 팔아 보렴.',goal:{k:'sell',n:1},rw:{co:80}},
  {id:'dex5',cat:'수집',ic:'📖',t:'도감 5종',say:'도감에 <b>5종</b>을 채워 보자.',goal:{k:'dex',n:5},rw:{co:120,box:['lv0']}},
  {id:'openShop2',cat:'UI',ic:'🛒',t:'상점 다시 열기',say:'미끼가 모자라면 상점에서 사면 돼.',goal:{k:'openShop',n:1},rw:{co:40}},
  {id:'lv3',cat:'성장',ic:'🏅',t:'Lv.3 되기',say:'<b>레벨 3</b>! 조금씩 성장하는 기분이지?',goal:{k:'lv',n:3},rw:{co:200,xp:40}},
  {id:'boxes1',cat:'수집',ic:'🎁',t:'행운 상자 1개 갖기',say:'낚시하다 보면 상자가 나와. <b>1개</b>만 모아 봐. (보상으로도 줘!)',goal:{k:'boxes',n:1},rw:{co:80},grant:{box:['lv0']}},
  {id:'openBoxBag',cat:'UI',ic:'🎁',t:'상자 탭 열어 보기',say:'가방을 열고 <b>상자/부적</b> 쪽도 구경해 봐. (상자 모드로 가방 열기)',goal:{k:'openBag',n:1},rw:{co:50}},
  {id:'catch10',cat:'낚시',ic:'🎣',t:'10마리 더 낚기',say:'이제 꽤 능숙해졌어. <b>10마리</b>!',goal:{k:'catch',n:10},rw:{co:120,bait:{paste:10}}},
  {id:'stones1',cat:'성장',ic:'💎',t:'강화석 1개 갖기',say:'강화석은 상자나 보상으로 나와. <b>1개</b>만 가져 봐.',goal:{k:'stones',n:1},rw:{co:100},grant:{stone:3}},
  // —— 후반: 점진적 ——
  {id:'lv4',cat:'성장',ic:'🏅',t:'Lv.4 되기',say:'<b>레벨 4</b>까지 가 보자.',goal:{k:'lv',n:4},rw:{co:220}},
  {id:'dex7',cat:'수집',ic:'📖',t:'도감 7종',say:'도감 <b>7종</b>이면 호수 친구가 꽤 많아.',goal:{k:'dex',n:7},rw:{co:150,box:['lv1']}},
  {id:'coins1200',cat:'경제',ic:'🪙',t:'코인 1,200 모으기',say:'판매로 <b>1,200 코인</b>을 모아 보렴.',goal:{k:'coins',n:1200},rw:{co:100,xp:50}},
  {id:'catch12',cat:'낚시',ic:'🐟',t:'12마리 더 낚기',say:'손맛이 좋아지는 구간이야. <b>12마리</b>!',goal:{k:'catch',n:12},rw:{co:140}},
  {id:'openDex2',cat:'UI',ic:'📖',t:'도감 다시 열기',say:'도감에서 등급 칸도 확인해 봐.',goal:{k:'openDex',n:1},rw:{co:40}},
  {id:'sell3',cat:'경제',ic:'💰',t:'또 판매하기',say:'어항이 차면 상점 › 판매!',goal:{k:'sell',n:1},rw:{co:90}},
  {id:'lv5',cat:'성장',ic:'🏅',t:'Lv.5 되기',say:'<b>레벨 5</b>면 첫 칭호도 열려.',goal:{k:'lv',n:5},rw:{co:300,box:['lv1']}},
  {id:'catch15',cat:'낚시',ic:'🎣',t:'15마리 더 낚기',say:'이제 중급 낚시꾼 코스. <b>15마리</b>!',goal:{k:'catch',n:15},rw:{co:160,xp:80}},
  {id:'dex10',cat:'수집',ic:'📖',t:'도감 10종',say:'도감 <b>10종</b> 달성!',goal:{k:'dex',n:10},rw:{co:200,box:['lv1']}},
  {id:'openSet2',cat:'UI',ic:'⚙️',t:'설정에서 튜토리얼 확인',say:'설정 › 튜토리얼에서 원하는 임무로 <b>이동</b>할 수도 있어.',goal:{k:'openSet',n:1},rw:{co:60}},
  {id:'coins2500',cat:'경제',ic:'🪙',t:'코인 2,500',say:'<b>2,500 코인</b>이면 장비도 여유롭지.',goal:{k:'coins',n:2500},rw:{co:150,stone:2}},
  {id:'catch20',cat:'낚시',ic:'🐟',t:'20마리 더 낚기',say:'꾸준함이 월척을 불러. <b>20마리</b>!',goal:{k:'catch',n:20},rw:{co:200,xp:100}},
  {id:'boxes3',cat:'수집',ic:'🎁',t:'상자 3개 보유·획득',say:'상자 누적 보유/보상이 <b>3개</b>면 OK. (이미 열었어도 보유 기준)',goal:{k:'boxesEver',n:3},rw:{co:120}},
  {id:'lv7',cat:'성장',ic:'🏅',t:'Lv.7 되기',say:'<b>레벨 7</b>! 호숫가 단골이 다 됐네.',goal:{k:'lv',n:7},rw:{co:350,box:['lv1']}},
  {id:'dex12',cat:'수집',ic:'📖',t:'도감 12종',say:'도감 <b>12종</b>. 거의 백과사전이야.',goal:{k:'dex',n:12},rw:{co:220}},
  {id:'catch25',cat:'낚시',ic:'🎣',t:'25마리 더 낚기',say:'마지막 스퍼트 직전. <b>25마리</b>!',goal:{k:'catch',n:25},rw:{co:250,bait:{paste:15}}},
  {id:'coins4000',cat:'경제',ic:'🪙',t:'코인 4,000',say:'<b>4,000 코인</b> 모아 보기.',goal:{k:'coins',n:4000},rw:{co:200,stone:3}},
  {id:'lv8',cat:'성장',ic:'🏅',t:'Lv.8 되기',say:'<b>레벨 8</b>까지 성장!',goal:{k:'lv',n:8},rw:{co:400}},
  {id:'dex15',cat:'수집',ic:'📖',t:'도감 15종',say:'도감 <b>15종</b>이면 충분해.',goal:{k:'dex',n:15},rw:{co:250,box:['lv2']}},
  {id:'finale',cat:'성장',ic:'🎉',t:'Lv.10 되기 (졸업)',say:'마지막! <b>레벨 10</b>이 되면 어엿한 피쉬레스트 낚시꾼이야.',goal:{k:'lv',n:10},rw:{co:500,box:['lv2'],xp:150,stone:5}}
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
  tutTap:(g,b,s)=>b._tap||0
 };
 const K='nk_tut25';let P;try{P=JSON.parse(localStorage.getItem(K)||'null');}catch(e){}
 if(!P)P={i:0,b:null,v:2,chk:1,paid:{},granted:{},boxGot:0};
 if(!P.paid)P.paid={};if(!P.granted)P.granted={};P.v=2;
 const sv=()=>{try{localStorage.setItem(K,JSON.stringify(P));}catch(e){}};
 const U=()=>window.NK_UI25,m=()=>innerWidth<700,emo=e=>{try{window.NK_EMOJI&&NK_EMOJI.parse&&NK_EMOJI.parse(e);}catch(_){}};
 const rwTxt=r=>{if(!r)return '';return [r.co&&`🪙 ${r.co}`,r.xp&&`⭐ ${r.xp} XP`,r.bait&&Object.entries(r.bait).map(([k,n])=>`🪱 ${k==='paste'?'떡밥':k}×${n}`).join(' '),r.box&&`🎁 상자 ${r.box.length}`,r.stone&&`💎 ${r.stone}`,r.wear&&`👕 장비`].filter(Boolean).join(' · ');};
 function base(){const s=S()||{};return {caught:s.caught||0,earned:s.earned||0,boxes:(s.boxes||[]).length,_bag:0,_shop:0,_tank:0,_dex:0,_set:0,_tap:0};}
 function give(r,tag){
  if(!r)return {ok:true,note:'empty'};
  const s=S(),g=G();if(!s||!g)return {ok:false,note:'no S'};
  const before={co:s.coins,st:s.stones||0,bx:(s.boxes||[]).length,wear:(s.wear||[]).length,xp:s.xp||0};
  if(r.co)s.coins=(s.coins||0)+r.co;
  if(r.bait){for(const k in r.bait){if(s.baits[k]!==-1)s.baits[k]=(s.baits[k]||0)+r.bait[k];}}
  if(r.box){r.box.forEach(b=>s.boxes.push(b));s._boxGot=(s._boxGot||0)+r.box.length;P.boxGot=(P.boxGot||0)+r.box.length;}
  if(r.stone)s.stones=(s.stones||0)+r.stone;
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
   const mo=new MutationObserver(()=>{
    if(document.querySelector('#bag.modal.show,#bag.show'))mark('_bag');
    if(document.querySelector('#shop.modal.show,#shop.show'))mark('_shop');
    if(document.querySelector('#tank.modal.show,#tank.show'))mark('_tank');
    if(document.querySelector('#dex.modal.show,#dex.show'))mark('_dex');
    if(document.querySelector('#set.modal.show,#set.show'))mark('_set');
   });
   mo.observe(document.body,{attributes:true,subtree:true,attributeFilter:['class']});
   return true;
  };
  if(!tryHook()){const iv=setInterval(()=>{if(tryHook())clearInterval(iv);},400);setTimeout(()=>clearInterval(iv),20000);}
 }
 function render(force){if(!el){el=document.createElement('div');el.id='tq25';document.body.appendChild(el);el.addEventListener('click',e=>{const a=e.target.closest('[data-tq]');if(!a)return;e.stopPropagation();const k=a.dataset.tq;
   if(k==='npc'){if(!P.b)P.b=base();P.b._tap=1;sv();if(m())U().set('tutHide',U().get('tutHide')?0:1);else U().set('tutFold',U().get('tutFold')?0:1);render(1);}if(k==='fold'){U().set('tutFold',U().get('tutFold')?0:1);render(1);}});}
  const done=P.i>=STEPS.length,go=document.getElementById('go'),started=go&&!go.offsetParent;
  if(!started||done||(U()&&U().get('tutOff'))){el.style.display='none';return;}el.style.display='';
  const st=STEPS[P.i],n=prog(st),v=m()?(U().get('tutM')||'D2'):(U().get('tutPC')||'D2'),pos=m()?(U().get('tutPosM')||'top'):(U().get('tutPosPC')||'bc'),fold=m()?U().get('tutHide'):U().get('tutFold');
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
    try{G()._n&&G()._n.toast(`✅ 튜토리얼 완료: ${st.t}<br><small>보상 ${rwTxt(st.rw)||'없음'}</small>`,2800);}catch(e){}
    window.__tutLastReward=r;
   }
   P.i++;P.b=null;sv();
   if(P.i<STEPS.length){P.b=base();ensureGrant(STEPS[P.i]);sv();}
   else{try{G()._n.toast('🎉 튜토리얼을 모두 마쳤어요! 이제 자유롭게 낚시해요',3200);}catch(e){}}
   last='';render(1);
  }finally{busy=false;}
 }
 function tick(){if(!S()||!G()){return;}hookUI();
  // 자동 스킵은 수동 reset/jump 후에만 끄고, 신규는 유지하되 너무 공격적이지 않게: caught>=80 & lv>=10
  if(!P.chk){P.chk=1;if((G().myLv&&G().myLv()>=10)&&((S().caught||0)>=80))P.i=STEPS.length;sv();}
  if(P.i>=STEPS.length){render();return;}
  const st=STEPS[P.i];ensureGrant(st);const n=prog(st);
  if(n>=st.goal.n)complete(st);
  render();}
 setInterval(tick,500);addEventListener('resize',()=>{last='';render(1);});document.addEventListener('nkui25',()=>{last='';render(1);});
 window.NK_TUT={STEPS,CHECK,P:()=>P,reset:()=>{P={i:0,b:null,v:2,chk:1,paid:{},granted:{},boxGot:0};sv();last='';busy=false;render(1);},
  skip:()=>{P.i=STEPS.length;sv();render(1);},
  jump:i=>{i=Math.max(0,Math.min(STEPS.length,+i||0));P.i=i;P.b=null;busy=false;sv();if(i<STEPS.length){P.b=base();ensureGrant(STEPS[i]);sv();}last='';render(1);},
  give,ensureGrant,complete:_=>{if(P.i<STEPS.length)complete(STEPS[P.i]);}};
})();
