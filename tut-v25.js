// 피쉬레스트 v25: 튜토리얼 퀘스트 (D2 노인 어부 말풍선 기본 / D4 작은 카드)
// 데이터 구조: 단계는 NK_TUT.STEPS 배열에 추가만 하면 됨 (v26+ 50~100단계 확장 대비)
//  {id, cat:카테고리, ic:아이콘, t:목표, say:할아버지 말, goal:{k:검사종류, n:목표치}, rw:{co:코인, xp, bait:{k:n}, box:[상자], stone}}
//  검사종류(goal.k): seat(낚시 자리) catch(시작 후 낚은 수) bait(미끼 교체) sell(판매 수익) dex(도감 종 수) lv(레벨) — CHECK에 추가해 확장
(function(){const $=id=>document.getElementById(id),G=()=>window.NKV2,S=()=>(G()&&G().S)||null;
 const STEPS=[
  {id:'walk',cat:'기본',ic:'🚶',t:'낚시 자리에 앉기',say:'어서 와! 먼저 데크 끝 <b>의자</b>로 가서 앉아 보렴.',goal:{k:'seat',n:1},rw:{co:50}},
  {id:'first',cat:'낚시',ic:'🎣',t:'첫 물고기 낚기',say:'<b>낚시 시작</b>을 누르고, 찌가 <b>쏙</b> 들어가면 다시 눌러!',goal:{k:'catch',n:1},rw:{xp:30}},
  {id:'three',cat:'낚시',ic:'🐟',t:'물고기 3마리 낚기',say:'잘했어! 이번엔 <b>3마리</b>를 더 낚아 볼까?',goal:{k:'catch',n:3},rw:{bait:{paste:5}}},
  {id:'bait',cat:'장비',ic:'🪱',t:'떡밥으로 바꿔 끼우기',say:'선물로 준 <b>떡밥</b>을 끼워 봐. 🛒상점 › 미끼에서 <b>장착</b>!',goal:{k:'bait',n:1},rw:{co:100}},
  {id:'sell',cat:'경제',ic:'💰',t:'물고기 팔기',say:'🛒상점 › <b>판매</b>에서 물고기를 팔면 코인이 생겨.',goal:{k:'sell',n:1},rw:{co:100}},
  {id:'dex',cat:'수집',ic:'📖',t:'도감 3종 채우기',say:'여러 종류를 낚으면 📖<b>도감</b>이 채워진단다. 3종!',goal:{k:'dex',n:3},rw:{box:['lv0']}},
  {id:'lv5',cat:'성장',ic:'🏅',t:'Lv.5 되기',say:'마지막! <b>Lv.5</b>가 되면 이제 어엿한 낚시꾼이야.',goal:{k:'lv',n:5},rw:{co:300,box:['lv1']}}];
 const CHECK={seat:(g,b)=>G().nearSpot&&G().nearSpot()?1:0,catch:(g,b,s)=>Math.max(0,(s.caught||0)-(b.caught||0)),bait:(g,b,s)=>s.bait&&s.bait!=='worm'?1:0,
  sell:(g,b,s)=>((s.earned||0)>(b.earned||0))?1:0,dex:(g,b,s)=>Object.keys(s.dex||{}).length,lv:()=>G().myLv?G().myLv():1};
 const K='nk_tut25';let P;try{P=JSON.parse(localStorage.getItem(K)||'null');}catch(e){}if(!P)P={i:0,b:null,v:1};const sv=()=>localStorage.setItem(K,JSON.stringify(P));
 const U=()=>window.NK_UI25,m=()=>innerWidth<700,emo=e=>{try{window.NK_EMOJI&&NK_EMOJI.parse&&NK_EMOJI.parse(e);}catch(_){}};
 const rwTxt=r=>[r.co&&`🪙 ${r.co}`,r.xp&&`⭐ ${r.xp} XP`,r.bait&&Object.entries(r.bait).map(([k,n])=>`🪱 ${k==='paste'?'떡밥':k} ${n}`).join(' '),r.box&&`🎁 상자 ${r.box.length}`,r.stone&&`💎 강화석 ${r.stone}`].filter(Boolean).join(' · ');
 function base(){const s=S();return {caught:s.caught||0,earned:s.earned||0};}
 function give(r){const s=S(),g=G();if(r.co)s.coins+=r.co;if(r.bait)for(const k in r.bait){if(s.baits[k]!==-1)s.baits[k]=(s.baits[k]||0)+r.bait[k];}if(r.box)r.box.forEach(b=>s.boxes.push(b));if(r.stone)s.stones=(s.stones||0)+r.stone;if(r.xp&&g.addXP)g.addXP(r.xp,'튜토리얼');try{g.save&&g.save();g.applyHud&&g.applyHud();}catch(e){}}
 let el,last='';
 function prog(st){const s=S();if(!s||!G())return 0;if(!P.b){P.b=base();sv();}return Math.min(st.goal.n,CHECK[st.goal.k](st.goal,P.b,s));}
 function render(force){if(!el){el=document.createElement('div');el.id='tq25';document.body.appendChild(el);el.addEventListener('click',e=>{const a=e.target.closest('[data-tq]');if(!a)return;e.stopPropagation();const k=a.dataset.tq;
   if(k==='npc'){if(m())U().set('tutHide',U().get('tutHide')?0:1);else U().set('tutFold',U().get('tutFold')?0:1);render(1);}if(k==='fold'){U().set('tutFold',U().get('tutFold')?0:1);render(1);}});}
  const done=P.i>=STEPS.length,go=document.getElementById('go'),started=go&&!go.offsetParent;
  if(!started||done||U().get('tutOff')){el.style.display='none';return;}el.style.display='';
  const st=STEPS[P.i],n=prog(st),v=m()?U().get('tutM'):U().get('tutPC'),pos=m()?(U().get('tutPosM')||'top'):(U().get('tutPosPC')||'bc'),fold=m()?U().get('tutHide'):U().get('tutFold');
  const key=[P.i,n,v,pos,fold,m()].join('|');if(key===last&&!force)return place();last=key;
  el.className=`${v.toLowerCase()} p-${pos} ${m()?'m':'pc'} ${fold?'fold':''}`;const pc=Math.round(n/st.goal.n*100),cnt=st.goal.n>1?` <em>${n}/${st.goal.n}</em>`:'';
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
 function tick(){if(!S()||!G()){return;}if(!P.chk){P.chk=1;if((G().myLv&&G().myLv()>=5)||(S().caught||0)>=30)P.i=STEPS.length;sv();}if(P.i>=STEPS.length){render();return;}const st=STEPS[P.i],n=prog(st);
  if(n>=st.goal.n){give(st.rw);try{G()._n&&G()._n.toast(`✅ 튜토리얼 완료: ${st.t}<br><small>보상 ${rwTxt(st.rw)}</small>`,2600);}catch(e){}P.i++;P.b=null;sv();if(P.i<STEPS.length){P.b=base();sv();}else{try{G()._n.toast('🎉 튜토리얼을 모두 마쳤어요! 이제 자유롭게 낚시해요',3200);}catch(e){}}}
  render();}
 setInterval(tick,600);addEventListener('resize',()=>{last='';render(1);});document.addEventListener('nkui25',()=>{last='';render(1);});
 window.NK_TUT={STEPS,CHECK,P:()=>P,reset:()=>{P={i:0,b:null,v:1,chk:1};sv();last='';render(1);},skip:()=>{P.i=STEPS.length;sv();render(1);},jump:i=>{P.i=i;P.b=null;sv();last='';render(1);}};})();
