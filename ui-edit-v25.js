// 피쉬레스트 v25: 관리자 UI 편집 모드 1차 — 주요 HUD 창을 끌어서 옮기고 저장/초기화 (PC·모바일 따로 저장)
// CSS translate 속성만 쓰므로 기존 위치 계산(transform·left/top)과 충돌하지 않아요. 글자·이미지 바꾸기는 2차(설계만).
(function(){const IDS=[['mStat','상태바'],['equip','낚시 정보'],['wxCard','날씨'],['mSys','메뉴'],['bMore','메뉴 버튼'],['chatBtn','채팅 버튼'],['chat','채팅'],['mMain','하단 메뉴'],['fishBtn','낚시 버튼'],['tq25','튜토리얼'],['joy','조이스틱']];
 const key=()=>'nk_uipos_'+(innerWidth<700?'m':'pc');let P={};const ld=()=>{try{P=JSON.parse(localStorage.getItem(key())||'{}');}catch(e){P={};}};const sv=()=>localStorage.setItem(key(),JSON.stringify(P));
 const $=id=>document.getElementById(id);let on=false,bar=null;
 function apply(){IDS.forEach(([id])=>{const e=$(id);if(!e)return;const v=P[id];e.style.translate=v?`${v[0]}px ${v[1]}px`:'';});}
 function clamp(e,dx,dy){const r=e.getBoundingClientRect(),v=P[e.id]||[0,0],bx=r.left-v[0],by=r.top-v[1];dx=Math.max(-bx,Math.min(innerWidth-r.width-bx,dx));dy=Math.max(-by,Math.min(innerHeight-r.height-by,dy));return [Math.round(dx),Math.round(dy)];}
 let drag=null;
 function down(ev){if(!on)return;const e=ev.target.closest(IDS.map(x=>'#'+x[0]).join(','));if(!e)return;ev.preventDefault();ev.stopPropagation();const v=P[e.id]||[0,0];drag={e,x:ev.clientX,y:ev.clientY,v};e.classList.add('uiDrag');}
 function move(ev){if(!drag)return;ev.preventDefault();const [dx,dy]=clamp(drag.e,drag.v[0]+ev.clientX-drag.x,drag.v[1]+ev.clientY-drag.y);drag.e.style.translate=`${dx}px ${dy}px`;drag.cur=[dx,dy];}
 function up(){if(!drag)return;if(drag.cur){P[drag.e.id]=drag.cur;sv();}drag.e.classList.remove('uiDrag');drag=null;}
 function enter(){on=true;document.body.classList.add('uiedit');IDS.forEach(([id,n])=>{const e=$(id);if(e)e.dataset.uin=n;});
  bar=document.createElement('div');bar.id='uiEditBar';bar.innerHTML='<b>✋ UI 편집 모드</b><span>창을 끌어서 옮기세요 · 자동 저장 ('+(innerWidth<700?'모바일':'PC')+')</span><button data-u="reset">전부 초기화</button><button data-u="done" class="ok">완료</button>';document.body.appendChild(bar);
  bar.onclick=e=>{const u=e.target.dataset.u;if(u==='reset'){P={};sv();apply();}if(u==='done')leave();};}
 function leave(){on=false;document.body.classList.remove('uiedit');bar&&bar.remove();bar=null;}
 addEventListener('pointerdown',down,true);addEventListener('pointermove',move,true);addEventListener('pointerup',up,true);
 ld();const t=setInterval(apply,1500);addEventListener('resize',()=>{ld();apply();});setTimeout(apply,300);
 window.NK_UIEDIT={enter,leave,reset:()=>{P={};sv();apply();},on:()=>on,pos:()=>P,IDS};})();
