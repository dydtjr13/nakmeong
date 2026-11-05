// v24: 이벤트 시작 알림 + 진행 중 표시 (모바일 기본 E2 → E3, PC 기본 R1 레드). 관리자 › 🧪 테스트에서 스타일 바꾸기
(function(){const LSK='nk_ev_st',SEEN='nk_ev_seen';const DEF={ms:'e2',mo:'e3',ps:'r1',po:'r1'};
 const st=()=>Object.assign({},DEF,JSON.parse(localStorage.getItem(LSK)||'{}'));
 const mob=()=>innerWidth<700;let root,pv=0,shownKey='',startT=0,lastSig='';
 const pad=n=>String(n).padStart(2,'0'),left=ms=>{if(ms==null)return '';ms=Math.max(0,ms);const s=Math.floor(ms/1000),d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return d?`${d}일 ${h}시간`:`${h}:${pad(m)}:${pad(s%60)}`;};
 const kst=t=>{const x=new Date(t+9*36e5);return `${x.getUTCMonth()+1}/${x.getUTCDate()} ${pad(x.getUTCHours())}:${pad(x.getUTCMinutes())}`;};
 function info(){if(pv&&Date.now()<pv)return {coin:2,box:1.5,from:pv-10000,to:pv+86400000*2-3600000,on:true,key:'pv'};const V=window.NKV2&&NKV2.V14;if(!V||!V.evMul)return null;const m=V.evMul();if(!m.on)return null;const e=V.evInfo?V.evInfo():{};return {coin:m.coin,box:m.box,from:e.from||0,to:e.to||0,on:true,key:[e.from,e.coin,e.box].join('|')};}
 const pills=e=>`${e.coin>1?`<span class="pl">🪙 코인 ×${e.coin}</span>`:''}${e.box>1?`<span class="pl b">🎁 상자 ×${e.box}</span>`:''}`;
 const ttl=e=>e.coin>1&&e.box>1?`코인 ×${e.coin} · 상자 ×${e.box} 이벤트`:e.coin>1?`코인 ×${e.coin} 이벤트`:`상자 ×${e.box} 이벤트`;
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
 setInterval(tick,500);
 window.NK_EV={st,set(o){localStorage.setItem(LSK,JSON.stringify(Object.assign(st(),o)));lastSig='';tick();},preview(){pv=Date.now()+10000;shownKey='';lastSig='';tick();},_left:left};
})();
// v24: 게시판 (PC 기본 P4 · 모바일 B1/B2/B5 확정안) — 아직 서버가 없어 시안 화면을 창으로 띄워요
(function(){let ov;const close=()=>{if(ov){ov.remove();ov=null;}};
 function open(){close();const S=(window.NKV2&&NKV2.S)||{},m=innerWidth<700,v=m?'m':(S.boardPC||'4');ov=document.createElement('div');ov.id='boardOv';ov.className='v'+v;ov.innerHTML=`<iframe src="board-v24.html?v=${v}" title="게시판" allowtransparency="true"></iframe>`;document.body.appendChild(ov);}
 addEventListener('message',e=>{if(e.data==='nkBoardClose')close();});addEventListener('keydown',e=>{if(e.key==='Escape'&&ov)close();});
 const add=()=>{const sy=document.getElementById('mSys');if(!sy){setTimeout(add,500);return;}if(document.getElementById('bBoard'))return;const b=document.createElement('button');b.id='bBoard';b.title='게시판';b.innerHTML='<b class="mi">📋</b><small class="ml">게시판</small>';b.onclick=e=>{e.stopPropagation();open();};sy.insertBefore(b,sy.firstChild);if(window.NK_EMOJI)try{NK_EMOJI.parse(b);}catch(_){}};add();
 window.NK_BOARD={open,close};})();
