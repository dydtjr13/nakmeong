// 피쉬레스트 v26: 관리자 UI 편집 모드 2차
// - 평소엔 숨어 있는 알림(XP·레벨 알림·토스트·컷인·튜토리얼·운영자 공지)을 "테스트 사본"으로 띄워서 같이 옮겨요.
// - 단축키: 끌기 = 자석 스냅(다른 창 가장자리·가운데, 6px) · Shift+끌기 = 가로/세로 한 방향 고정 + 정렬선 모두 표시 · Ctrl(⌘)+끌기 = 스냅 끄고 자유 이동
//           방향키 1px · Shift+방향키 10px · Ctrl+Z 되돌리기 · Ctrl+S 저장(브라우저 저장 막음) · Esc 선택 해제
// - 선택한 창의 테두리(가장자리 8px)에 마우스를 올리면 크기 조절(비율 유지, CSS scale 60~160%)
// 위치는 CSS translate·scale 속성만 써서 기존 transform·left/top 계산과 겹치지 않아요. 저장 키는 v25와 같음(nk_uipos_pc / nk_uipos_m) → v25에서 옮긴 위치 그대로 이어짐.
(function(){
 const IDS=[['mStat','상태바'],['equip','낚시 정보'],['wxCard','날씨'],['mSys','메뉴'],['bMore','메뉴 버튼'],['chatBtn','채팅 버튼'],['chat','채팅'],['mMain','하단 메뉴'],['fishBtn','낚시 버튼'],['tq25','튜토리얼'],['joy','조이스틱'],
  ['xpF','XP 알림'],['lvT','레벨 알림'],['toast','토스트'],['annBar','운영자 공지'],['evx','이벤트 알림'],['cutin','컷인']];
 const NM=Object.fromEntries(IDS);
 // v27 그룹(모바일 목록·탭용)
 const GRP={'위':['mStat','equip','wxCard','mSys','bMore','chatBtn','annBar','evx','lvT'],'아래':['mMain','fishBtn','joy','chat'],'알림':['xpF','toast','cutin','tq25']};
 // 테스트 사본: 숨은 알림을 편집 중에만 진짜 id로 만들어 보여줌(끝나면 지움 → 게임이 필요할 때 다시 만듦)
 const PV={xpF:()=>`<b>+25 XP</b> · 테스트 알림`,lvT:()=>'⬆ Lv.10 달성! 골드 +1,000 (테스트)',toast:()=>'🎣 테스트 토스트 알림',annBar:()=>'<b>📢 운영자 공지</b><span>테스트 공지예요. 위치만 확인하세요.</span>',
  cutin:()=>'<div class="band"><div><div class="t">✦ 테스트 컷인 ✦</div><div class="s">위치 확인용 사본</div></div></div>'};
 const key=()=>'nk_uipos_'+(innerWidth<700?'m':'pc');let P={},SAVED='{}';
 const ld=()=>{try{const own=localStorage.getItem(key());if(own==null){const d=window.NK_UIDEF&&NK_UIDEF();P=d?JSON.parse(JSON.stringify(d)):{};SAVED=JSON.stringify(P);}else{SAVED=own;P=JSON.parse(own);}}catch(e){P={};SAVED='{}';}};// v70: 자기 배치가 없으면 관리자가 정한 처음 화면 배치
 const sv=()=>{SAVED=JSON.stringify(P);localStorage.setItem(key(),SAVED);};
 const $=id=>document.getElementById(id);let on=false,bar=null,sel=null,hist=[],guides=null,made=[],forced=[];
 const elOf=k=>k==='cutin'?document.querySelector('.cutin:not(.box)')||$('uiPvCut'):$(k);
 const keyOf=e=>e.id==='uiPvCut'||e.classList.contains('cutin')?'cutin':e.id;
 function put(e,v){if(!e)return;e.style.translate=v?`${v[0]}px ${v[1]}px`:'';e.style.scale=v&&v[2]&&v[2]!==1?String(v[2]):'';if(e.id==='tq25')e.style.transformOrigin='0 0';}
 function apply(){IDS.forEach(([k])=>{if(k==='cutin'){document.querySelectorAll('.cutin:not(.box)').forEach(e=>put(e,P.cutin));const c=$('uiPvCut');if(c)put(c,P.cutin);}else put($(k),P[k]);});}
 // 동적으로 생기는 알림도 바로 위치 적용
 new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes){if(n.nodeType!==1)continue;const k=n.classList&&n.classList.contains('cutin')&&!n.classList.contains('box')?'cutin':n.id;if(k&&NM[k]&&P[k])put(n,P[k]);if(on&&k&&NM[k])n.dataset.uin=NM[k];}}).observe(document.body,{childList:true});
 const vis=e=>{if(!e||!e.getClientRects().length)return false;const c=getComputedStyle(e);return c.visibility!=='hidden'&&+c.opacity>.05;};
 function previews(){IDS.forEach(([k,n])=>{let e=elOf(k);
   if(!e&&PV[k]){e=document.createElement('div');if(k==='cutin'){e.id='uiPvCut';e.className='cutin';}else e.id=k;e.innerHTML=PV[k]();document.body.appendChild(e);made.push(e);if(k==='xpF'){const L=$('lvB')||$('mStat');if(L){const r=L.getBoundingClientRect();e.style.left=Math.round(r.left)+'px';e.style.top=Math.round(r.bottom+6)+'px';}}}
   if(!e)return;e.dataset.uin=n;if(!vis(e)||PV[k]&&made.includes(e)){if(getComputedStyle(e).display==='none'){forced.push([e,e.style.display]);e.style.display='block';}e.classList.add('uiPv');}});apply();}
 function snap(){hist.push(JSON.stringify(P));if(hist.length>80)hist.shift();}
 function undo(){if(!hist.length){msg('되돌릴 게 없어요');return;}P=JSON.parse(hist.pop());apply();upd();msg('↶ 되돌렸어요');}
 function save(){sv();msg('💾 저장했어요 ('+(innerWidth<700?'모바일':'PC')+')');upd();}
 function msg(t){const m=bar&&bar.querySelector('.um');if(m){m.textContent=t;clearTimeout(m._t);m._t=setTimeout(()=>{m.textContent='';},1600);}}
 function upd(){if(!bar)return;const v=sel?P[keyOf(sel)]||[0,0,1]:null;bar.querySelector('.us').textContent=sel?`${sel.dataset.uin} · x ${v[0]} y ${v[1]} · ${Math.round((v[2]||1)*100)}%`:'창을 누르면 선택돼요';bar.querySelector('[data-u=save]').classList.toggle('dirty',JSON.stringify(P)!==SAVED);}
 function select(e){document.querySelectorAll('.uiSel').forEach(x=>x.classList.remove('uiSel'));sel=e;if(e)e.classList.add('uiSel');upd();const ms=document.querySelector('#uiMob select.uw');if(ms)ms.value=e?keyOf(e):'';flip();}
 function flip(){const m=document.getElementById('uiMob');if(!m||!sel)return;const r=sel.getBoundingClientRect();m.classList.toggle('top',r.bottom>innerHeight*.55);}
 function base(e){const r=e.getBoundingClientRect(),v=P[keyOf(e)]||[0,0,1],s=v[2]||1;return {r,v,s};}
 function clamp(e,dx,dy){const {r,v}=base(e),bx=r.left-v[0],by=r.top-v[1];return [Math.round(Math.max(-bx,Math.min(innerWidth-r.width-bx,dx))),Math.round(Math.max(-by,Math.min(innerHeight-r.height-by,dy)))];}
 // 정렬선 후보: 다른 편집 대상 창의 왼·가운데·오른쪽 / 위·가운데·아래 + 화면 가장자리 8px·가운데
 function lines(me){const X=[8,innerWidth/2,innerWidth-8],Y=[8,innerHeight/2,innerHeight-8];document.querySelectorAll('[data-uin]').forEach(o=>{if(o===me||!vis(o))return;const r=o.getBoundingClientRect();X.push(r.left,r.left+r.width/2,r.right);Y.push(r.top,r.top+r.height/2,r.bottom);});return {X,Y};}
 function drawG(gx,gy){if(!guides){guides=document.createElement('div');guides.id='uiGuides';document.body.appendChild(guides);}guides.innerHTML=gx.map(x=>`<i class="gv" style="left:${Math.round(x)}px"></i>`).join('')+gy.map(y=>`<i class="gh" style="top:${Math.round(y)}px"></i>`).join('');}
 function clearG(){if(guides)guides.innerHTML='';}
 let drag=null;
 function edge(e,x,y){const r=e.getBoundingClientRect(),m=8;const L=Math.abs(x-r.left)<m,R=Math.abs(x-r.right)<m,T=Math.abs(y-r.top)<m,B=Math.abs(y-r.bottom)<m;if(x<r.left-m||x>r.right+m||y<r.top-m||y>r.bottom+m)return '';return (T?'n':B?'s':'')+(L?'w':R?'e':'');}
 function target(ev){return ev.target.closest&&ev.target.closest('[data-uin]');}
 let bd=null;function down(ev){if(on&&ev.target.closest('#uiEditBar>b')){const r=bar.getBoundingClientRect();bd={x:ev.clientX-r.left,y:ev.clientY-r.top};ev.preventDefault();return;}if(!on||ev.target.closest('#uiEditBar'))return;let e=target(ev);const ed=sel&&edge(sel,ev.clientX,ev.clientY);if(ed)e=sel;if(!e)return;if(document.body.classList.contains('uiOne')&&e!==sel){if(ev.target.closest('#uiMob'))return;ev.preventDefault();ev.stopPropagation();return;}ev.preventDefault();ev.stopPropagation();select(e);snap();const {r,v,s}=base(e);
  drag={e,x:ev.clientX,y:ev.clientY,v:[v[0],v[1]],s,ed,r,ax:null};e.classList.add('uiDrag');}
 function move(ev){if(!on)return;if(bd){bar.style.setProperty('left',(ev.clientX-bd.x)+'px','important');bar.style.setProperty('top',(ev.clientY-bd.y)+'px','important');bar.style.setProperty('transform','none','important');return;}if(!drag){if(sel){const ed=edge(sel,ev.clientX,ev.clientY);document.body.style.cursor=ed?{n:'ns-resize',s:'ns-resize',e:'ew-resize',w:'ew-resize',ne:'nesw-resize',sw:'nesw-resize',nw:'nwse-resize',se:'nwse-resize'}[ed]:'';}return;}
  ev.preventDefault();const k=keyOf(drag.e);let ddx=ev.clientX-drag.x,ddy=ev.clientY-drag.y;
  if(drag.ed){// 크기 조절: 가장자리에서 멀어지는 만큼 비율 유지 확대
   const sx=drag.ed.includes('e')?ddx:drag.ed.includes('w')?-ddx:0,sy=drag.ed.includes('s')?ddy:drag.ed.includes('n')?-ddy:0,d=Math.abs(sx)>Math.abs(sy)?sx/drag.r.width:sy/drag.r.height;
   let s=Math.max(.6,Math.min(1.6,drag.s*(1+d)));if(!(ev.ctrlKey||ev.metaKey))s=Math.round(s*20)/20;P[k]=[drag.v[0],drag.v[1],Math.round(s*100)/100];put(drag.e,P[k]);upd();return;}
  if(ev.shiftKey){if(!drag.ax&&Math.hypot(ddx,ddy)>6)drag.ax=Math.abs(ddx)>Math.abs(ddy)?'x':'y';if(drag.ax==='x')ddy=0;if(drag.ax==='y')ddx=0;}else drag.ax=null;
  let [dx,dy]=clamp(drag.e,drag.v[0]+ddx,drag.v[1]+ddy);const gx=[],gy=[];
  if(!(ev.ctrlKey||ev.metaKey)){const {X,Y}=lines(drag.e),r=drag.e.getBoundingClientRect(),cur=P[k]||[0,0],ox=r.left-(cur[0]||0),oy=r.top-(cur[1]||0),w=r.width,h=r.height,T=ev.shiftKey?10:6;
   const bx=(arr,pos)=>{let best=null;arr.forEach(L=>pos.forEach(([p,off])=>{const d=L-p;if(Math.abs(d)<=T&&(!best||Math.abs(d)<Math.abs(best.d)))best={d,L};}));return best;};
   if(drag.ax!=='y'){const b=bx(X,[[ox+dx,0],[ox+dx+w/2,0],[ox+dx+w,0]]);if(b){dx+=Math.round(b.d);gx.push(b.L);}}
   if(drag.ax!=='x'){const b=bx(Y,[[oy+dy,0],[oy+dy+h/2,0],[oy+dy+h,0]]);if(b){dy+=Math.round(b.d);gy.push(b.L);}}
   if(ev.shiftKey){const r2={l:ox+dx,c:ox+dx+w/2,r:ox+dx+w,t:oy+dy,m:oy+dy+h/2,b:oy+dy+h};X.forEach(L=>{if([r2.l,r2.c,r2.r].some(p=>Math.abs(p-L)<1))gx.push(L);});Y.forEach(L=>{if([r2.t,r2.m,r2.b].some(p=>Math.abs(p-L)<1))gy.push(L);});}}
  drawG(gx,gy);P[k]=[dx,dy,(P[k]&&P[k][2])||1];put(drag.e,P[k]);upd();}
 function up(){bd=null;if(!drag)return;drag.e.classList.remove('uiDrag');drag=null;clearG();upd();}
 function key_(ev){if(!on)return;const c=ev.ctrlKey||ev.metaKey,k=ev.key;
  if(c&&(k==='s'||k==='S')){ev.preventDefault();ev.stopPropagation();save();return;}
  if(c&&(k==='z'||k==='Z')){ev.preventDefault();ev.stopPropagation();undo();return;}
  if(k==='Escape'){select(null);return;}
  if(sel&&/^Arrow/.test(k)){ev.preventDefault();ev.stopPropagation();const n=ev.shiftKey?10:1,kk=keyOf(sel),v=P[kk]||[0,0,1];if(!ev.repeat)snap();let dx=v[0]+(k==='ArrowLeft'?-n:k==='ArrowRight'?n:0),dy=v[1]+(k==='ArrowUp'?-n:k==='ArrowDown'?n:0);[dx,dy]=clamp(sel,dx,dy);P[kk]=[dx,dy,v[2]||1];put(sel,P[kk]);upd();}}
 // v27 모바일 편집 패널: 그룹 탭 → 창 목록에서 하나 고르기 → 방향 버튼·크기 버튼으로 조절 (고른 창만 움직여요)
 function nudge(dx,dy){if(!sel)return;const kk=keyOf(sel),v=P[kk]||[0,0,1];snap();let [x,y]=clamp(sel,v[0]+dx,v[1]+dy);P[kk]=[x,y,v[2]||1];put(sel,P[kk]);upd();flip();}
 function size(d){if(!sel)return;const kk=keyOf(sel),v=P[kk]||[0,0,1];snap();P[kk]=[v[0],v[1],Math.max(.6,Math.min(1.6,Math.round(((v[2]||1)+d)*100)/100))];put(sel,P[kk]);upd();}
 function mobPanel(){document.body.classList.add('uiOne');const m=document.createElement('div');m.id='uiMob';let g='위',st=10;
  const list=()=>GRP[g].filter(k=>{const e=elOf(k);return e&&vis(e);});
  const draw=()=>{m.innerHTML=`<div class="ut">${Object.keys(GRP).map(k=>`<button data-g="${k}" class="${k===g?'on':''}">${k}</button>`).join('')}<button data-m="one" class="${document.body.classList.contains('uiOne')?'on':''}" title="고른 창만 움직이기">하나씩</button></div>
   <select class="uw"><option value="">창 고르기 (${list().length}개)</option>${list().map(k=>`<option value="${k}" ${sel&&keyOf(sel)===k?'selected':''}>${NM[k]}</option>`).join('')}</select>
   <div class="upad"><button data-n="0,-1">▲</button><button data-n="-1,0">◀</button><button data-st>${st}px</button><button data-n="1,0">▶</button><button data-n="0,1">▼</button><button data-s="-.05">－</button><button data-s=".05">＋</button><button data-r>↺ 이 창만</button></div>
   <div class="uio"><button data-x>📤 내보내기</button><button data-i>📥 가져오기</button></div>`;
   m.querySelector('select').onchange=e=>{const el=elOf(e.target.value);select(el||null);if(el)el.scrollIntoView&&0;};};
  m.onclick=e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.dataset.g){g=b.dataset.g;draw();return;}if(b.dataset.m){document.body.classList.toggle('uiOne');draw();return;}
   if(b.dataset.n){const [x,y]=b.dataset.n.split(',').map(Number);nudge(x*st,y*st);return;}if('st' in b.dataset){st=st===10?1:st===1?30:10;b.textContent=st+'px';return;}if(b.dataset.s){size(+b.dataset.s);return;}
   if('r' in b.dataset&&sel){snap();delete P[keyOf(sel)];put(sel,null);upd();return;}
   if('x' in b.dataset){const t=btoa(unescape(encodeURIComponent(JSON.stringify(P))));try{navigator.clipboard.writeText(t);}catch(_){}prompt('배치 코드 (복사해서 다른 기기에서 가져오기)',t);return;}
   if('i' in b.dataset){const t=prompt('배치 코드를 붙여넣으세요');if(!t)return;try{const o=JSON.parse(decodeURIComponent(escape(atob(t.trim()))));snap();P=o;apply();upd();msg('📥 가져왔어요 · 저장을 눌러 확정');}catch(_){msg('코드가 올바르지 않아요');}}};
  ['pointerdown','pointermove','pointerup'].forEach(t=>m.addEventListener(t,e=>e.stopPropagation()));draw();document.body.appendChild(m);}
 function enter(){if(on)return;on=true;ld();hist=[];document.body.classList.add('uiedit');previews();
  bar=document.createElement('div');bar.id='uiEditBar';bar.innerHTML=`<b title="끌어서 이 막대를 옮길 수 있어요">✋ UI 편집</b><span class="us"></span><span class="um"></span><button data-u="undo" title="Ctrl+Z">↶ 되돌리기</button><button data-u="reset">전부 초기화</button><button data-u="save" title="Ctrl+S">💾 저장</button><button data-u="done" class="ok">완료</button><small class="uk">끌기 = 자석 정렬 · Shift = 한 방향+정렬선 · Ctrl = 자유 이동 · 방향키 1px (Shift 10px) · 테두리 끌기 = 크기 · Ctrl+Z · Ctrl+S</small>`;document.body.appendChild(bar);if(innerWidth<700||matchMedia('(pointer:coarse)').matches)mobPanel();
  bar.onclick=e=>{const u=e.target.dataset.u;if(u==='undo')undo();if(u==='reset'){snap();P={};apply();upd();}if(u==='save')save();if(u==='done'){if(JSON.stringify(P)!==SAVED)sv();leave();}};upd();}
 function leave(){on=false;document.body.classList.remove('uiOne');const mp=document.getElementById('uiMob');mp&&mp.remove();document.body.classList.remove('uiedit');bar&&bar.remove();bar=null;select(null);clearG();document.body.style.cursor='';made.forEach(e=>e.remove());made=[];forced.forEach(([e,d])=>{e.style.display=d;});forced=[];document.querySelectorAll('.uiPv').forEach(e=>e.classList.remove('uiPv'));document.querySelectorAll('[data-uin]').forEach(e=>delete e.dataset.uin);ld();apply();}
 addEventListener('pointerdown',down,true);addEventListener('pointermove',move,true);addEventListener('pointerup',up,true);addEventListener('keydown',key_,true);
 ld();setInterval(()=>{if(on&&!drag)previews();else if(!drag)apply();},1500);addEventListener('resize',()=>{if(!on)ld();apply();});setTimeout(apply,300);
 window.NK_UIEDIT={reload:(force)=>{if(on&&!force)return;ld();IDS.forEach(([k])=>put(elOf(k),null));apply();},enter,leave,reset:()=>{P={};sv();apply();},on:()=>on,pos:()=>P,IDS,sel:()=>sel,select:id=>select(elOf(id))};
})();
