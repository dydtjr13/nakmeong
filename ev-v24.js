// v24: 이벤트 시작 알림 + 진행 중 표시 (모바일 기본 E2 → E3, PC 기본 R1 레드). 관리자 › 🧪 테스트에서 스타일 바꾸기
(function(){const LSK='nk_ev_st',SEEN='nk_ev_seen';const DEF={ms:'e2',mo:'e3',ps:'r1',po:'r1'};
 const st=()=>Object.assign({},DEF,JSON.parse(localStorage.getItem(LSK)||'{}'));
 const mob=()=>innerWidth<700;let root,pv=0,shownKey='',startT=0,lastSig='';
 const pad=n=>String(n).padStart(2,'0'),left=ms=>{if(ms==null)return '';ms=Math.max(0,ms);const s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return d?`${d}일 ${h}시간`:`${h}:${pad(m)}:${pad(s%60)}`;};
 const kst=t=>{const x=new Date(t+9*36e5);return `${x.getUTCMonth()+1}/${x.getUTCDate()} ${pad(x.getUTCHours())}:${pad(x.getUTCMinutes())}`;};
 function info(){if(pv&&Date.now()<pv)return {coin:2,box:1.5,from:pv-10000,to:pv+86400000*2-3600000,on:true,key:'pv'};const V=window.NKV2&&NKV2.V14;if(!V||!V.evMul)return null;const m=V.evMul();if(!m.on)return null;const e=V.evInfo?V.evInfo():{};return {coin:m.coin,box:m.box,from:e.from||0,to:e.to||0,on:true,key:[e.from,e.coin,e.box].join('|')};}
 const pills=e=>`${e.coin>1?`<span class="pl">🪙 골드 ×${e.coin}</span>`:''}${e.box>1?`<span class="pl b">🎁 상자 ×${e.box}</span>`:''}`;
 const ttl=e=>e.coin>1&&e.box>1?`골드 ×${e.coin} · 상자 ×${e.box} 이벤트`:e.coin>1?`골드 ×${e.coin} 이벤트`:`상자 ×${e.box} 이벤트`;
 const sh=e=>e.coin>1?'×'+e.coin:'🎁×'+e.box;
 function html(v,ph,e){const L=e.to?left(e.to-Date.now()):'',per=e.to&&e.from?Math.max(0,Math.min(100,(e.to-Date.now())/(e.to-e.from)*100)):100,until=e.to?kst(e.to)+'까지':'종료 시간 없음';
  if(v==='e1')return ph==='start'?`<div class="bn">🎉 <b>${ttl(e)} 시작!</b>${pills(e)}<small>${until}</small><span class="x" data-evx>×</span></div>`:`<div class="ch">🎉 <b class="lg">${ttl(e).replace(' 이벤트','')}</b><b class="sh">${sh(e)}</b>${L?` <i>${L}</i>`:''}</div>`;
  if(v==='e2')return ph==='start'?`<div class="cd" data-evx><div class="em">🎉</div><b>${ttl(e)} 시작!</b><div class="r">${pills(e)}</div><small>${until} · 누르면 닫혀요</small><div class="t"><i></i></div></div>`:`<div class="pb"><i style="width:${per}%"></i></div><div class="ch">🎉 ${sh(e)}${L?` <i>${L}</i>`:''}</div>`;
  if(v==='e3')return ph==='start'?`<div class="sd" data-evx><b>🎉 이벤트가 시작됐어요</b><div class="r">${pills(e)}</div><small>${until}</small></div>`:`<div class="rg" title="${ttl(e)} · ${L} 남음" style="--p:${per}%"><span>🎉</span><em>${sh(e)}</em>${L?`<small>${L}</small>`:''}</div>`;
  if(v==='e4')return ph==='start'?`<div class="rb">🎉 ${ttl(e)} 진행 중 ${pills(e)} <span>· ${until}</span></div>`:`<div class="fx">🎉 ${sh(e)}${L?` <i>${L}</i>`:''}</div>`;
  // PC 레드 계열 (E2 시작 + E4 진행 중을 화면 안 가리게)
  if(ph==='start')return `<div class="cd" data-evx><div class="em">🎉</div><div><b>${ttl(e)} 시작!</b><div class="r">${pills(e)}<small>${until}</small></div></div><span class="x">×</span><div class="t"><i></i></div></div>`;
  if(v==='r1')return `<div class="ch">🎉 <b>${ttl(e).replace(' 이벤트','')}</b>${L?`<i>${L}</i>`:''}</div>`;
  if(v==='r2')return `<div class="rb"><i style="width:${per}%"></i></div><div class="ch">🎉 ${sh(e)}${L?` <i>${L}</i>`:''}</div>`;
  if(v==='r3')return `<div class="mc"><b>🎉 ${ttl(e)}</b>${L?`<i>${L} 남음</i>`:''}<div class="bar"><i style="width:${per}%"></i></div></div>`;
  return '';}
 function tick(){const e=info(),S=st(),m=mob();if(!root){root=document.createElement('div');root.id='evx';document.body.appendChild(root);root.addEventListener('click',ev=>{if(ev.target.closest('[data-evx]')){startT=0;draw(e0,true);}});}
  e0=e;if(!e){if(lastSig){root.innerHTML='';root.className='';lastSig='';}return;}
  const seen=localStorage.getItem(SEEN);if(e.key!==shownKey&&(e.key==='pv'||seen!==e.key)){shownKey=e.key;startT=Date.now()+(e.key==='pv'?4500:4000);if(e.key!=='pv')localStorage.setItem(SEEN,e.key);}
  draw(e);}
 let e0=null;function draw(e,force){if(!e)return;const S=st(),m=mob(),ph=Date.now()<startT?'start':'on',v=m?(ph==='start'?S.ms:S.mo):(ph==='start'?S.ps:S.po);
  if(v==='off'){root.innerHTML='';lastSig='off';return;}const sig=v+ph+(ph==='on'?Math.floor(Date.now()/1000):'')+(m?'m':'p');if(sig===lastSig&&!force)return;lastSig=sig;
  const vv=!m&&ph==='start'&&/^r/.test(v)?v:v;root.className='evx '+(m?'mob ':'pc ')+vv+' '+ph+(/^r/.test(vv)?' red':'');root.innerHTML=html(vv,ph,e);}
 // v86: 이벤트 알림에 마우스를 올리면(모바일은 누르면) 어떤 이벤트인지 자세히 보여 줘요
 function tipHTML(e){const L=e.to?left(e.to-Date.now()):'';return `<b class="et">🎉 ${ttl(e)}</b><ul>${e.coin>1?`<li><span>🪙</span><div><b>골드 ×${e.coin}</b><small>물고기를 팔 때 받는 골드가 ${e.coin}배예요 (판매·자동 판매 모두)</small></div></li>`:''}${e.box>1?`<li><span>🎁</span><div><b>행운 상자 ×${e.box}</b><small>낚시할 때 행운 상자가 나올 확률이 ${e.box}배예요</small></div></li>`:''}</ul><div class="tm">${e.from?`<span>시작 ${kst(e.from)}</span>`:''}<span>${e.to?`끝 ${kst(e.to)} · <b>${L} 남음</b>`:'끝나는 시간 없음'}</span></div><small class="ft">모든 호숫가 · 모든 유저에게 똑같이 적용돼요</small>`;}
 let tip=null,tipT=0;function tipShow(){const e=info();if(!e||!root||!root.firstElementChild){tipHide();return;}if(!tip){tip=document.createElement('div');tip.id='evTip';document.body.appendChild(tip);}tip.innerHTML=tipHTML(e);const ch=[...root.children].filter(x=>x.getBoundingClientRect().width>0),r=ch.length?ch.map(x=>x.getBoundingClientRect()).reduce((a,b)=>({left:Math.min(a.left,b.left),right:Math.max(a.right,b.right),top:Math.min(a.top,b.top),bottom:Math.max(a.bottom,b.bottom),width:Math.max(a.right,b.right)-Math.min(a.left,b.left)})):root.getBoundingClientRect(),w=Math.min(300,innerWidth-16);tip.style.width=w+'px';let x=r.left+r.width/2-w/2;x=Math.max(8,Math.min(innerWidth-w-8,x));tip.style.left=x+'px';const below=r.bottom+10+170<innerHeight;tip.style.top=(below?r.bottom+10:Math.max(8,r.top-10-tip.offsetHeight))+'px';tip.classList.add('on');}
 function tipHide(){if(tip)tip.classList.remove('on');}
 document.addEventListener('mouseover',ev=>{if(root&&ev.target.closest&&ev.target.closest('#evx')&&!ev.target.closest('[data-evx]'))tipShow();});
 document.addEventListener('mouseout',ev=>{if(root&&ev.target.closest&&ev.target.closest('#evx')&&!(ev.relatedTarget&&ev.relatedTarget.closest&&ev.relatedTarget.closest('#evx')))tipHide();});
 document.addEventListener('click',ev=>{if(!mob())return;if(ev.target.closest&&ev.target.closest('#evx')&&!ev.target.closest('[data-evx]')){tipShow();clearTimeout(tipT);tipT=setTimeout(tipHide,4500);}else tipHide();});
 setInterval(()=>{if(tip&&tip.classList.contains('on'))tipShow();},1000);
 setInterval(tick,500);
 window.NK_EV={st,set(o){localStorage.setItem(LSK,JSON.stringify(Object.assign(st(),o)));lastSig='';tick();},preview(){pv=Date.now()+10000;shownKey='';lastSig='';tick();},_left:left};
})();
// v50: 게시판 — board-v24.html (목록 → 글 보기 → 글쓰기, 서버 D1)
(function(){let ov;const close=()=>{if(ov){ov.remove();ov=null;}};
 function open(){close();const S=(window.NKV2&&NKV2.S)||{},m=innerWidth<700,v=m?'m':'4';ov=document.createElement('div');ov.id='boardOv';ov.className='v'+v;window.NK_BOARD_API=window.NK_BOARD_API||localStorage.getItem('nk_board_api')||'https://fishcozy-board-api.mi1ku.workers.dev';ov.innerHTML=`<iframe src="board-v24.html?v=${v}&api=${encodeURIComponent(window.NK_BOARD_API)}&cb=v113" title="게시판" allowtransparency="true"></iframe>`;document.body.appendChild(ov);}
 addEventListener('message',e=>{if(e.data==='nkBoardClose')close();});addEventListener('keydown',e=>{if(e.key==='Escape'&&ov)close();});
 const add=()=>{const sy=document.getElementById('mSys');if(!sy){setTimeout(add,500);return;}if(document.getElementById('bBoard'))return;const b=document.createElement('button');b.id='bBoard';b.title='게시판';b.innerHTML='<b class="mi">📋</b><small class="ml">게시판</small>';b.onclick=e=>{e.stopPropagation();open();};sy.insertBefore(b,sy.firstChild);if(window.NK_EMOJI)try{NK_EMOJI.parse(b);}catch(_){}};add();
 window.NK_BOARD={open,close};})();

// v25→v26: 날씨 카드 정렬 — 크기는 v24 원래대로, 왼쪽 라인만 위 패널(PC #equip · 모바일 골드 알약)에 맞춤. 간격은 레벨창↔정보줄 간격 +2px
(function(){const $=id=>document.getElementById(id);
 function al(){const w=$('wxCard');if(!w||!w.offsetParent)return;const B=document.body;if(B.classList.contains('vshort')||B.classList.contains('mx')||B.classList.contains('tx')){['left','top','width','right','transform'].forEach(k=>w.style.removeProperty(k));return;}
  const set=(k,v)=>w.style.setProperty(k,v,'important');
  if(innerWidth>=700){const e=$('equip'),s=$('mStat');if(!e||!s)return;const r=e.getBoundingClientRect(),q=s.getBoundingClientRect();if(!r.width)return;const gap=Math.max(4,r.top-q.bottom)+2;
   set('left',r.left+'px');set('right','auto');set('top',(r.bottom+gap)+'px');w.style.removeProperty('width');w.style.removeProperty('transform');w.style.removeProperty('box-sizing');}
  else{const pills=[...document.querySelectorAll('#mStat .pill')].filter(p=>p.offsetWidth),m=$('bMore'),lv=document.querySelector('#mStat .lvb'),c=$('chatBtn');if(!pills.length||!m)return;const L=Math.min(...pills.map(p=>p.getBoundingClientRect().left)),R=m.getBoundingClientRect().right,bt=Math.max(m.getBoundingClientRect().bottom,...pills.map(p=>p.getBoundingClientRect().bottom));const gap=(lv&&c)?Math.max(4,c.getBoundingClientRect().top-lv.getBoundingClientRect().bottom)+2:12,sc=.82;
   set('left',L+'px');set('right','auto');set('top',(bt+gap)+'px');set('transform',`scale(${sc})`);set('transform-origin','top left');w.style.removeProperty('width');w.style.removeProperty('box-sizing');}}
 setInterval(al,700);addEventListener('resize',()=>setTimeout(al,50));})();

// v25: UI 설정 저장소 (XP 알림 위치·튜토리얼 위치 등) — localStorage nk_ui25
window.NK_UI25=(function(){const K='nk_ui25',D0={xp:'A2',tutPC:'D2',tutM:'D2',tutFold:0,tutHide:0,tutPosPC:'bl',duckOn:1,duckEvery:300,duckMax:9,duckSize:'rand',duckSpeed:0.5,menu27:'1',donSt:'icon'};let o;try{o=Object.assign({},D0,JSON.parse(localStorage.getItem(K)||'{}'));}catch(e){o=Object.assign({},D0);}
 return {get:k=>o[k],set:(k,v)=>{o[k]=v;localStorage.setItem(K,JSON.stringify(o));document.dispatchEvent(new CustomEvent('nkui25',{detail:{k,v}}));},all:()=>o};})();
// v25: XP 알림 위치 — A2(낚시 카드 바로 아래 가운데, 기본) / A4(PC 하단 메뉴 위, 모바일 낚시 버튼 왼쪽)
(function(){const $=id=>document.getElementById(id);
 function place(){const x=$('xpF');if(!x)return;const m=innerWidth<700,P=window.NK_RT&&NK_RT.play,v=(P&&(P.xpPos==='A2'||P.xpPos==='A4')&&!document.body.classList.contains('adm'))?P.xpPos:NK_UI25.get('xp'),set=(k,val)=>x.style.setProperty(k,val,'important');const w=x.offsetWidth||120;
  if(v==='A4'){if(x.classList.contains('a2'))x.classList.remove('a2');const tops=['mMain','fishBtn','bSit','sitBtn'].map(id=>$(id)).filter(e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&e.getBoundingClientRect().height).map(e=>e.getBoundingClientRect().top).filter(t=>t>innerHeight*.4),T=tops.length?Math.min(...tops):innerHeight-92;
   if(m){set('left',(innerWidth-w-10)+'px');set('top',(T-(x.offsetHeight||26)-10)+'px');}else{set('left',((innerWidth-w)/2)+'px');set('top',(T-(x.offsetHeight||26)-10)+'px');}set('bottom','auto');set('right','auto');return;}
  const t=$('toast');let y=innerHeight*.26+(m?96:118);if(t){const r=t.getBoundingClientRect(),op=+getComputedStyle(t).opacity;if(op>.05&&r.height)y=r.bottom+8;}
  set('left',((innerWidth-w)/2)+'px');set('top',y+'px');set('bottom','auto');set('right','auto');if(!x.classList.contains('a2'))x.classList.add('a2');}
 let att=null;const hook=x=>{if(att===x)return;att=x;new MutationObserver(()=>{if(x.classList.contains('on')||x.classList.contains('xs'))place();}).observe(x,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});if(x.classList.contains('on'))place();};const go=()=>{const x=$('xpF');if(x)return hook(x);const mo=new MutationObserver(()=>{const y=$('xpF');if(y){mo.disconnect();hook(y);}});mo.observe(document.body,{childList:true});};document.body?go():addEventListener('DOMContentLoaded',go);})();
