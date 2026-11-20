/* v195 ✨ 초월 부적 — 획득 연출 · 전체 서버 공지 (카드·합산·밸런스 로직은 game-v2.js / systems.js)
   NK_TXC.got(list, how)  : 새 초월 부적을 줄 세워요 (상자/합성 연출이 닫히면 하나씩 보여 줘요) + 공지
   NK_TXC.show(c, how)    : 바로 초월 획득 연출
   NK_TXC.flush()         : 줄 선 연출 보여 주기 (closeBoxFx 에서 불러요) */
(function(){
const V=()=>window.__nkInt||{},D=()=>window.NK_DATA,$=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rtOn=()=>{try{return !!(window.NK_RT&&NK_RT.status&&NK_RT.status()==='on');}catch(e){return false;}};
const myId=()=>{try{return String(window.NK_RT&&NK_RT.id||'');}catch(e){return '';}};
const nick=()=>{try{return (V().NICK&&V().NICK())||'나';}catch(e){return '나';}};
const Q=[];let busy=0,lastMine=null;
const howTxt=h=>{const T=D().CHARM.tx;return h==='syn'?`신화 부적 3개 합성 · ${Math.round(T.synP*100)}% 확률`:h==='gift'?'운영자 지급':`행운 상자 · 1/${Math.round(1/T.box).toLocaleString()} 확률`;};
function cardOf(c){const d=document.createElement('div');try{d.innerHTML=V().charmHTML?V().charmHTML(c):'';}catch(e){}return d.innerHTML;}
function show(c,how){const fx=$('boxFx');if(!fx||!c)return;busy=1;try{clearTimeout(window._boxFxT);}catch(e){}
 fx.style.setProperty('--gc','#7a5cff');fx.className='show open t6 txfx';fx.onclick=null;
 fx.innerHTML=`<div class="rays"></div><div class="txspark">${Array.from({length:14},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div><div class="fxres txres"><div class="txbig"><img class="cimg" src="img/charms/t6.png" alt=""></div><h3 class="tmh">✨ 초월 부적 획득!</h3><p class="small txp">${esc(howTxt(how))} · 🔒 자동 잠금</p>${cardOf(c)}<button class="acc" id="fxOk">확인</button></div>`;
 try{const f=V().sfx&&V().sfx();if(f&&f.coin)f.coin();}catch(e){}
 const ok=$('fxOk');if(ok)ok.onclick=e=>{e.stopPropagation();busy=0;fx.className='';fx.innerHTML='';/* 내 공지 띠는 연출을 닫으면 2.5초 뒤 사라져요 (가방 윗부분을 오래 가리지 않게) */if(lastMine&&lastMine.isConnected){const el=lastMine;setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),700);},2500);}flush();};
 announce(c,how);}
function flush(){if(busy||!Q.length)return;setTimeout(()=>{const fx=$('boxFx');if(busy||!Q.length||(fx&&fx.classList.contains('show')))return;const x=Q.shift();show(x.c,x.how);},80);}
function got(list,how){(list||[]).forEach(c=>{if(c&&c.tier===6)Q.push({c,how});});const fx=$('boxFx');if(!(fx&&fx.classList.contains('show')))flush();}
/* 공지: 실시간 서버가 켜져 있으면 모든 서버에, 아니면 내 화면에만 */
function announce(c,how){const sent=!!(rtOn()&&window.NK_RT.txc&&NK_RT.txc(how==='syn'?'syn':'box'));/* 내 띠는 바로 내 화면에 (서버가 아직 옛 버전이어도 보이게) · 서버에서 돌아온 내 공지는 건너뛰어요 */band({nick:nick(),how,local:sent?0:1,me:1});
 try{V().say&&V().say('시스템',`📢 [초월 부적] ${nick()}님이 ✨ 초월 부적을 얻었어요! (${howTxt(how)})`);}catch(e){}}
function band(ev){let box=$('stAnn');if(!box){box=document.createElement('div');box.id='stAnn';document.body.appendChild(box);}box.innerHTML='';
 const mine=ev.me||ev.local||(ev.id&&ev.id===myId());const el=document.createElement('div');el.className='txann';
 const srv=(()=>{try{return ev.srv&&window.SRVN?SRVN(ev.srv):'';}catch(e){return '';}})();
 el.innerHTML=`<img src="img/charms/t6.png" alt=""><div class="ta-m"><small>${ev.local?'🌙 혼자 플레이 · 내 화면에만':'📢 전체 서버 공지'}${srv?' · '+esc(srv):''}</small><b>${esc(ev.nick||'누군가')}</b>님이 <b>✨ 초월 부적</b>을 얻었어요! <small>${ev.how==='syn'?'신화 3개 합성':'행운 상자'}에서</small></div>`;
 box.appendChild(el);if(mine)lastMine=el;/* 창이 열려 있으면 짧게 (가리는 시간 줄이기) */const modal=!!document.querySelector('.modal.show');const dur=mine?9000:modal?6000:15000;setTimeout(()=>el.classList.add('out'),dur);setTimeout(()=>el.remove(),dur+700);}
addEventListener('nk-rt-txc',e=>{const d=e.detail||{};if(d.id&&d.id===myId())return;band(d);
 try{V().say&&V().say('시스템',`📢 [초월 부적] ${d.nick||'누군가'}님이 ✨ 초월 부적을 얻었어요!`);}catch(_){}});
window.NK_TXC={got,show,flush,band,queue:Q};
})();
