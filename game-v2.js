/* 낚멍 v2 — 3D 로우폴리 파스텔 (three.js r147, 일반 script 빌드: file:// 더블클릭 실행 가능) */
(()=>{
let V14=null,V15=null;
THREE.ColorManagement.legacyMode=false;
const D=NK_DATA,$=id=>document.getElementById(id),qs=new URLSearchParams(location.search);
// v12 시안용 숨김 파라미터: ?mock30&decks=30&lr=32&lay=ring|alt|bay (기본 게임은 20데크·LR 24 그대로)
const CFG=Object.assign({lay:'a',bots:9},JSON.parse(localStorage.getItem('nk_cfg')||'{}'));const LAYS={a:['ring',32],b:['alt',26],c:['bay',29],o:['ring',24]};
const MOCK30=qs.has('mock30'),LK=MOCK30?null:(LAYS[CFG.lay]?CFG.lay:'a'),LAY=MOCK30?(qs.get('lay')||'ring'):LAYS[LK][0],DECKS=Math.min(30,Math.max(2,+qs.get('decks')||(MOCK30||LK==='o'?D.DECK_COUNT_DEFAULT:(CFG.decks||25)))),DW=(window.NK_DECKW||{})[CFG.deckW]||null,LR=(MOCK30?(+qs.get('lr')||24):LAYS[LK][1])+(DW?DW.lr:0);
function deckAng(i){if(LAY==='bay'){const G=6,per=Math.ceil(DECKS/G),g=Math.floor(i/per),j=i%per,gw=Math.PI*2/G,sp=gw*.72/per;return -Math.PI/2+g*gw+(j-(per-1)/2)*sp;}return -Math.PI/2+i*Math.PI*2/DECKS;}
const deckOff=i=>LAY==='alt'&&i%2?2.6:0;
const UP=new THREE.Vector3(0,1,0),V=new THREE.Vector3(),Q=new THREE.Quaternion(),SC=new THREE.Vector3(),M4=new THREE.Matrix4();
const rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0];
// ───────── 저장 데이터 ─────────
const SKEY='nakmeong_v2';
const S0={coins:D.START_COINS,tank:[],tankK:'s',tanks:['s'],rod:'bamboo',rods:['bamboo'],bait:'worm',baits:{worm:-1},dex:{},char:0,sDay:0,sNight:2,vol:.2,fpsCap:144,moveMul:1.35,rankTag:true,nid:1,caught:0,earned:0,gear:[],rodId:null,charms:[],equip:[],stones:0,enh:{},boxes:[],auto:null,nick:'',showG:{tree:1,grass:1,flower:1}};
let S=Object.assign({},S0,JSON.parse(localStorage.getItem(SKEY)||'{}'));
const SYS=window.NK_SYS;S.auto=S.auto||Object.assign({},D.AUTO_DEFAULT,{keepNew:false});if(!S.auto.v6){S.auto.v6=1;S.auto.keepNew=false;}const NICK=()=>S.nick||'나';SYS.migrate(D,S);let NIGHT=0;setTimeout(()=>{try{cslotInit();wkRoll();}catch(e){}},0);
const save=()=>{S.savedAt=S.savedAt||Date.now();try{localStorage.setItem(SKEY,JSON.stringify(S));}catch(e){}};
// ───────── v21 레벨 시스템 (v17 기획 · 만렙 99) ─────────
var LV={max:99,need:n=>Math.round(100*Math.pow(n,1.35)),xpG:[10,18,30,60,120,250],
 titles:[[5,'새내기 낚시꾼'],[15,'호숫가 단골'],[25,'물고기 친구'],[35,'낚시 애호가'],[45,'베테랑 낚시꾼'],[55,'프로 낚시꾼'],[65,'강태공'],[75,'전설의 낚시꾼'],[85,'전설의 강태공'],[95,'낚시의 달인'],[99,'낚시의 신']],
 slots:[[1,2],[8,3],[18,4],[32,5],[50,6]],rods:{bamboo:1,carbon:3,silver:8,coral:15,sakura:22,gold:28,star:40,dragon:55},
 baits:{worm:1,paste:1,corn:3,shrimp:5,golden:12,lure:18,nightlure:26,frog:36},auto:10,tankEvery:10,tankAdd:5,
 hReq:[3,6,9,12,15,18,21,24,28,32,36,40],aReq:[44,48,52,56,60,64,70,76,82,90],cum:[0,0]};
for(let n=1;n<LV.max;n++)LV.cum[n+1]=LV.cum[n]+LV.need(n);
function lvOf(xp){let L=1;while(L<LV.max&&xp>=LV.cum[L+1])L++;return L;}
function myLv(){return lvOf(S.xp||0);}
function lvTitle(L){let t='';LV.titles.forEach(([l,n])=>{if(L>=l)t=n;});return t;}
const lvK=()=>S.lvKeep||{rods:[],baits:[],chars:[],auto:false,slots:0};
function lvCharmSlots(){const L=myLv();let n=2;LV.slots.forEach(([l,k])=>{if(L>=l)n=k;});return Math.min(D.CHARM.slotsMax||6,Math.max(n,lvK().slots||0));}
function lvSlotReq(i){const x=LV.slots.find(([l,k])=>k>i);return x?x[0]:1;}
function lvTankBonus(){return Math.floor(myLv()/LV.tankEvery)*LV.tankAdd;}
function lvAutoOK(){return myLv()>=LV.auto||!!lvK().auto;}
function lvRodOK(k){return myLv()>=(LV.rods[k]||1)||lvK().rods.includes(k);}
function lvBaitOK(k){return myLv()>=(LV.baits[k]||1)||lvK().baits.includes(k);}
function lvCharReq(i){if(typeof KINDS==='undefined')return 1;const K=KINDS[i];if(!K||!K.grp||K.grp==='b')return 1;const L=KINDS.map((k,j)=>[k,j]).filter(([k])=>k.grp===K.grp).map(([k,j])=>j),x=L.indexOf(i),R=K.grp==='h'?LV.hReq:LV.aReq;return R[Math.min(x,R.length-1)]||1;}
function lvCharOK(i){return myLv()>=lvCharReq(i)||lvK().chars.includes(i);}
function lvUnlocks(L){const u=[];const K=typeof KINDS!=='undefined'?KINDS:[];K.forEach((k,i)=>{if(k.grp&&k.grp!=='b'&&lvCharReq(i)===L)u.push(['1f9d1',`캐릭터 「${k.n}」`]);});
 LV.slots.forEach(([l,k])=>{if(l===L&&l>1)u.push(['1f9ff',`부적 칸 ${k}개`]);});if(L%LV.tankEvery===0)u.push(['1f420',`어항 칸 +${LV.tankAdd}`]);if(L===LV.auto)u.push(['1f916','자동 낚시']);
 D.RODS.forEach(r=>{if((LV.rods[r.k]||1)===L&&L>1)u.push(['1f3a3',r.n]);});D.BAITS.forEach(b=>{if((LV.baits[b.k]||1)===L&&L>1)u.push(['1fab1',b.n]);});
 const t=LV.titles.find(x=>x[0]===L);if(t)u.push(['1f3f7',`칭호 「${t[1]}」`]);if(L===99)u.push(['1f451','칭호 테두리·이름표 색']);return u;}
function lvBoxMin(L){return L===99?5:Math.min(4,Math.floor(L/10));}
// 기존 플레이어: 누적 기록으로 XP 소급 + 이미 가진 것(낚싯대·미끼·캐릭터·자동 낚시·장착 부적 칸) 유지
if(!S.v21){S.v21=1;const old=(S.caught||0)>0;
 if(old){const g=(S.stats&&S.stats.g)||[];let xp=0;g.forEach((n,i)=>xp+=(n||0)*(LV.xpG[i]||10));xp+=Object.keys(S.dex||{}).length*50+Object.keys(S.goals||{}).length*200+(S.achSeen||[]).length*150;S.xp=Math.round(xp);
  S.lvKeep={rods:[...new Set((S.gear||[]).map(g=>g.k).concat(S.rods||[],[S.rod].filter(Boolean)))],baits:Object.keys(S.baits||{}).filter(k=>S.baits[k]===-1||S.baits[k]>0).concat([S.bait].filter(Boolean)),chars:[S.char||0],auto:true,slots:Math.max((S.equip||[]).length,...(S.presets||[[]]).map(p=>(p||[]).length))};}
 else{S.xp=0;S.lvKeep={rods:[],baits:[],chars:[],auto:false,slots:0};}
 S.lvPaid=lvOf(S.xp||0);if(!S.goalFx||S.goalFx==='D')S.goalFx='G2';S.toastSt=S.toastSt||'T2';if(!S.tankFish||S.tankFish==='3d')S.tankFish='A';}
D.CHARM.slotsMax=D.CHARM.slotsMax||D.CHARM.slots;try{Object.defineProperty(D.CHARM,'slots',{get:lvCharmSlots,configurable:true});}catch(e){}
// ───────── v21 UI: 레벨 HUD·레벨업·보상 로드 / 토스트(T2 기본) / 수집 목표 알림(G2 기본) / 모바일 M3 / 입력 리셋 / 모닥불 C2 ─────────
const EPNG=c=>`<img class="emj" src="icons/emoji-png/${c}.png" alt="" draggable="false">`;
function lvHud(n,why){let el=$('lvB');if(!el){const st=$('mStat');if(!st)return;el=document.createElement('button');el.id='lvB';el.className='lvb';el.title='레벨 · 보상 로드 보기';el.onclick=e=>{e.stopPropagation();lvRoad();};st.insertBefore(el,$('coins'));}
 const L=myLv(),a=LV.cum[L],b=L<LV.max?LV.cum[L+1]:a,cur=(S.xp||0)-a,need=b-a,p=L>=LV.max?100:Math.min(100,cur/need*100),t=lvTitle(L),k=L+'|'+Math.round(p*10)+'|'+t;
 if(el._k!==k){el._k=k;el.classList.toggle('max',L>=99);el.innerHTML=`<span class="lvc" style="--p:${p}%"><span>${L}</span></span><span class="xp"><span class="t"><span>Lv.${L}${t?` <span class="ttl">${t}</span>`:''}</span><span class="n">${L>=LV.max?'MAX':cur.toLocaleString()+'/'+need.toLocaleString()}</span></span><span class="b"><i style="width:${p}%"></i></span></span>`;}
 if(n>0){let f=$('xpF');if(!f){f=document.createElement('div');f.id='xpF';document.body.appendChild(f);}const r=el.getBoundingClientRect();f.style.left=Math.round(r.left)+'px';f.style.top=Math.round(r.bottom+6)+'px';f.innerHTML=`<b>+${n} XP</b>${why?' · '+why:''}`;f.classList.remove('on');void f.offsetWidth;f.classList.add('on');}}
function lvPop(L,co,bx,un,newT){let t=$('lvT');if(!t){t=document.createElement('div');t.id='lvT';document.body.appendChild(t);}t.innerHTML=`⬆ Lv.${L} 달성! 코인 +${co.toLocaleString()}`;t.classList.remove('on');void t.offsetWidth;t.classList.add('on');
 if(S.lvPopOff)return;let m=$('lvUp');if(!m){m=document.createElement('div');m.id='lvUp';document.body.appendChild(m);m.onclick=()=>m.classList.remove('show');}
 const cells=[['1fa99',`코인 ${co.toLocaleString()}`]].concat(bx.length?[['1f381',`행운 상자 ×${bx.length}${Math.max(...bx)>0?` <small>(${TIER(Math.max(...bx)).n} 이상)</small>`:''}`]]:[]).concat(un);
 const nx=lvNext(L);m.innerHTML=`<div class="lvup ${L>=99?'max':''}"><div class="k">LEVEL UP</div><div class="big">${L}</div>${newT?`<div class="nt">새 칭호 「${newT}」</div>`:''}<div class="rw">${cells.slice(0,4).map(([c,n])=>`<div>${EPNG(c)}<span>${n}</span></div>`).join('')}</div>${cells.length>4?`<p class="more">+ ${cells.slice(4).map(x=>x[1]).join(' · ')}</p>`:''}${nx?`<p>다음 보상: Lv.${nx[0]} ${nx[1]}</p>`:''}<small class="muted">눌러서 닫기</small></div>`;
 m.classList.add('show');clearTimeout(m._t);m._t=setTimeout(()=>m.classList.remove('show'),6500);}
function lvNext(L){for(let l=L+1;l<=LV.max;l++){const u=lvUnlocks(l);if(u.length)return [l,u.map(x=>x[1]).join(' · ')];if(l%5===0)return [l,'행운 상자'];}return null;}
function lvRoad(){let m=$('lvRoad');if(!m){m=document.createElement('div');m.id='lvRoad';m.className='modal';document.body.appendChild(m);}const L=myLv(),need=L<LV.max?LV.cum[L+1]-(S.xp||0):0;
 const N=[];for(let l=2;l<=LV.max;l++){const u=lvUnlocks(l);if(u.length||l%5===0)N.push([l,u]);}
 m.innerHTML=`<div class="card road"><button class="close" data-close="lvRoad">×</button><h2>🎣 낚시꾼 레벨 · 보상 로드</h2><p class="small muted">Lv.${L}${lvTitle(L)?' · '+lvTitle(L):''} · ${L<LV.max?`다음 레벨까지 ${need.toLocaleString()} XP`:'만렙 달성!'} · 오늘 획득 ${(S.xpD===new Date().toDateString()?S.xpT||0:0).toLocaleString()} XP</p>
 <div class="nodes">${N.map(([l,u])=>`<div class="nd ${l<=L?'done':''} ${l===N.find(x=>x[0]>L)?.[0]?'cur':''}"><div class="o">${u.length?EPNG(u[0][0]):EPNG('1f381')}</div><b>Lv.${l}</b><span>${u.length?u.map(x=>x[1]).join('<br>'):''}${l%5===0?`${u.length?'<br>':''}<em>🎁 상자${lvBoxMin(l)?' ('+TIER(lvBoxMin(l)).n+'↑)':''}</em>`:''}</span></div>`).join('')}</div>
 <p class="small muted">매 레벨 코인 100×Lv · 5레벨마다 행운 상자(10레벨마다 최소 등급 +1) · XP: 물고기 등급별 10/18/30/60/120(초월 250, 크기 보너스 최대 +30%) · 첫 포획 +50 · 수집 목표 +100~500 · 업적 +150 · 상자 +5 · 어항 조합 +80 · 교류 +2(하루 50) · 자동 낚시 ×0.6</p></div>`;
 m.querySelector('[data-close]').onclick=()=>closeM('lvRoad');openM('lvRoad');const c=m.querySelector('.nd.cur');if(c)c.scrollIntoView({inline:'center',block:'nearest'});}
// 토스트: T2 한 줄 알약 + 색 띠 + 닫기·남은 시간 막대 (기본) / T0 / T1 / T3 / T4 / 기존
const TQC={ok:'#5cb85c',info:'#4a8fe0',warn:'#f0a020',err:'#e05050'};
function tqType(h){const t=h.replace(/<[^>]+>/g,'');if(/부족|없어요|실패|못 |할 수 없|🔒|⛔|❌|불가|필요해요/.test(t))return 'err';if(/가득|주의|소진|⚠|이미/.test(t))return 'warn';if(/성공|완료|구매|획득|저장|달성|해금|ON|열렸|✅|🎉|아꼈/.test(t))return 'ok';return 'info';}
function toastQ(h,ms,st){let w=$('tq');if(!w){w=document.createElement('div');w.id='tq';document.body.appendChild(w);}w.className='s'+st;ms=Math.max(1600,ms);
 const key=h.replace(/<[^>]+>/g,'');const dup=[...w.children].find(e=>e._key===key&&!e.classList.contains('out'));if(dup){dup._arm(ms);return;}
 const ty=tqType(h),parts=h.split(/<br\s*\/?>/i),m=parts[0].match(/^\s*(?:<b>)?\s*((?:\p{Extended_Pictographic}|[\u2600-\u27BF])\uFE0F?)\s*/u);let ic='',tt=parts[0];if(m&&st!=='T2'&&st!=='T4'){ic=m[1];tt=parts[0].replace(m[1],'').trim();}
 const ds=parts.slice(1).join(' ').replace(/<\/?small>/g,''),e=document.createElement('div');e._key=key;e.className='tqi '+ty;e.style.setProperty('--c',TQC[ty]);const pill=st==='T2'||st==='T4',cls=st!=='T1';
 e.innerHTML=pill?`<span class="tx">${tt}${ds?` <small>${ds}</small>`:''}</span><button class="tqx" aria-label="닫기">×</button><i class="tqb"></i>`:`${ic?`<span class="ic">${ic}</span>`:''}<div class="tb"><b>${tt}</b>${ds?`<small>${ds}</small>`:''}</div>${cls?'<button class="tqx" aria-label="닫기">×</button><i class="tqb"></i>':''}`;
 const kill=()=>{if(e.classList.contains('out'))return;clearTimeout(e._t);e.classList.add('out');setTimeout(()=>e.remove(),260);};let left=ms,t0=0;
 e._arm=d=>{clearTimeout(e._t);left=d;t0=performance.now();const b=e.querySelector('.tqb');if(b){b.style.animation='none';void b.offsetWidth;b.style.animation=`tqb ${d}ms linear forwards`;}e._t=setTimeout(kill,d);};
 e.onmouseenter=()=>{clearTimeout(e._t);left-=performance.now()-t0;};e.onmouseleave=()=>{t0=performance.now();e._t=setTimeout(kill,Math.max(400,left));};
 e.onclick=ev=>{ev.stopPropagation();kill();};w.appendChild(e);while(w.children.length>4)w.firstChild.remove();e._arm(ms);}
// 수집 목표·업적 알림 G1~G4 (G2 기본)
function goalG(v,title,sub,rw,kind){let w=$('gq');if(!w){w=document.createElement('div');w.id='gq';document.body.appendChild(w);}w.className='g'+v;const lab=kind==='ach'?'업적 달성':'수집 목표 달성',ic=EPNG(kind==='ach'?'1f451':'1f3c6'),cs=(rw||sub||'').split(/ · |, /).filter(Boolean).map(t=>`<span class="rw">${t}</span>`).join('');
 const e=document.createElement('div');e.className='gqi '+(kind==='ach'?'ach':'goal');
 e.innerHTML=v==='G1'?`${ic}<small>${lab}</small><b>${title}</b>${cs?`<span class="cs">${cs}</span>`:''}`:v==='G3'?`<span class="ic">${ic}</span><div class="tt"><small>${lab}</small><b>${title}</b></div>${cs?`<div class="cs">${cs}</div>`:''}`:
  v==='G4'?`<span class="ic">${ic}</span><div class="tt"><small>${lab}</small><b>${title}</b></div><div class="cs">${cs}</div>`:`<div class="h">${ic}<div><small>${lab}</small><b>${title}</b></div></div>${cs?`<div class="cs">${cs}</div>`:''}<i class="gb"></i>`;
 e.onclick=()=>e.remove();w.appendChild(e);while(w.children.length>3)w.firstChild.remove();setTimeout(()=>{e.classList.add('out');setTimeout(()=>e.remove(),400);},4200);}
// 모바일 M3 (게임패드식) · 채팅 접기
function applyMob(){document.body.classList.toggle('m3',(S.mobLay||'m3')==='m3');}applyMob();
{const cb=document.createElement('button');cb.id='chatBtn';cb.innerHTML='💬<b></b>';cb.onclick=e=>{e.stopPropagation();document.body.classList.toggle('chat-open');cb.querySelector('b').textContent='';};$('hud').appendChild(cb);
 new MutationObserver(()=>{if(!document.body.classList.contains('chat-open')){const b=cb.querySelector('b'),n=(+b.textContent||0)+1;b.textContent=n>9?'9+':n;}}).observe($('log'),{childList:true});
 document.addEventListener('pointerdown',e=>{if(document.body.classList.contains('chat-open')&&!e.target.closest('#chat,#chatBtn'))document.body.classList.remove('chat-open');});}
// 개발용 FPS·draw calls 표시는 ?admin 에서만
document.body.classList.toggle('adm',/[?&]admin\b/.test(location.search));
// 입력 리셋: 포커스 잃음·탭 전환·포인터 취소 시 이동 멈춤
function resetInput(){for(const k in keys)keys[k]=0;joy.x=joy.y=0;const kn=$('joy')&&$('joy').firstElementChild;if(kn)kn.style.left=kn.style.top='36px';drag=null;}
addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetInput();});addEventListener('pointercancel',resetInput);$('joy').addEventListener('touchcancel',resetInput);
// 모닥불 C2: Quaternius "Bonfire"(CC0) 장작·돌 + v20 불꽃·불씨·바닥 빛
function fireC2(){if(!fireMesh||!THREE.GLTFLoader)return;new THREE.GLTFLoader().load('assets/fire/campfire-cc0.glb',g=>{const o=g.scene,bb=new THREE.Box3().setFromObject(o),sz=bb.getSize(new THREE.Vector3()),k=2.4/Math.max(sz.x,sz.z);
  fireMesh.children.forEach(c=>{if((c.isMesh&&c.material.blending!==THREE.AdditiveBlending)||c.isGroup)c.visible=false;});scene.children.forEach(x=>{if(x.userData&&x.userData.prop&&Math.hypot(x.position.x-SH.x,x.position.z-SH.z)<1.2)x.visible=false;});
  o.scale.setScalar(k);o.position.set(SH.x,.3-bb.min.y*k,SH.z);o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});scene.add(o);if(S.mergeOff!==true)mergeStatic(o);fireMesh.userData.c2=o;},undefined,e=>console.warn('fire C2',e));}
// v21: 동물 걷기 — 다리 흔들기 + 몸 들썩임/뒤뚱 (다리 2개만 별도 메시)
function animWalk(c,dt){const w=c.cur==='walk';c.ph=(c.ph||0)+dt*(w?10:0);const k=Math.min(1,dt*12),a=w?Math.sin(c.ph)*.6:0;c.legs.forEach((l,i)=>{l.rotation.x+=((i%2?a:-a)-l.rotation.x)*k;});
 const by=w?Math.abs(Math.sin(c.ph))*(c.legs.length?.05:.09):0,rz=w?Math.sin(c.ph)*(c.legs.length?.05:.12):0;c.rig.position.y+=(by-c.rig.position.y)*k;c.rig.rotation.z+=(rz-c.rig.rotation.z)*k;}
function addXP(n,why){n=Math.round(n);if(!(n>0))return;const L0=myLv();S.xp=(S.xp||0)+n;const td=new Date().toDateString();if(S.xpD!==td){S.xpD=td;S.xpT=0;S.xpSoc=0;}S.xpT+=n;const L1=myLv();try{lvHud(n,why);}catch(e){}if(L1>L0)lvUp(L0,L1);}
function xpCatch(f,F,isNew){const base=LV.xpG[f.g]||10,sz=F&&F.max>F.min?Math.max(0,Math.min(1,(f.cm-F.min)/(F.max-F.min))):0;let x=base*(1+.3*sz);if(S.autoFish)x*=.6;x=Math.round(x)+(isNew?50:0);addXP(x,`${F?F.n:''} ${f.cm}cm${isNew?' <span class="xn">(첫 포획 +50)</span>':''}`);}
function xpSocial(){const td=new Date().toDateString();if(S.xpD!==td){S.xpD=td;S.xpT=0;S.xpSoc=0;}if((S.xpSoc||0)>=50)return;S.xpSoc=(S.xpSoc||0)+2;addXP(2,'교류');}
function lvUp(L0,L1){let co=0,bx=[],un=[];for(let L=L0+1;L<=L1;L++){if(L<=(S.lvPaid||1))continue;co+=100*L;if(L%5===0){S.boxes.push('lv'+lvBoxMin(L));bx.push(lvBoxMin(L));}un=un.concat(lvUnlocks(L));}
 S.lvPaid=Math.max(S.lvPaid||1,L1);S.coins+=co;if(bx.length){S.newBox=(S.newBox||0)+bx.length;try{updBagBadge();}catch(e){}}save();hud();
 say('시스템',`⬆ ${NICK()}님이 Lv.${L1} 달성!${lvTitle(L1)!==lvTitle(L0)?` 칭호 「${lvTitle(L1)}」`:''}`);try{lvPop(L1,co,bx,un,lvTitle(L1)!==lvTitle(L0)?lvTitle(L1):'');}catch(e){console.warn(e);}}
const sellP=f=>Math.round(f.v*SYS.mods(D,S,rod(),bait()).sell*(V14?V14.evMul().coin:1));
const FI=k=>D.FISH.find(f=>f.k===k),rod=()=>SYS.gearStats(D,SYS.gearOf(S)),bait=()=>D.BAITS.find(b=>b.k===S.bait),cap=()=>D.TANKS.find(t=>t.k===S.tankK).cap+lvTankBonus();
const GR=g=>g===5?D.TX:D.GRADES[g];const gradeOf=(f,cm)=>{let g=0;f.g.forEach((t,i)=>{if(cm>=t)g=i+1;});return g;};
const valueOf=(f,cm,g)=>Math.round(f.base*Math.pow(cm/f.min,1.5)*GR(g).m);
const txP=(r,MO)=>D.TX.p*Math.min(D.TX.boostMax,1+(MO.ch?MO.ch.luck:0)/100+(r.luck||0)*4);
function rollFish(r=rod(),b=bait()){const AU0=arguments.length===0&&S.autoFish,ws=SYS.weights(D,S,r,b,NIGHT).map((w,i)=>(AU0&&(D.FISH[i].rare||D.FISH[i].expert)?w*D.AUTO.rareMul:w)*(D.FISH[i].rare?(V14?V14.fx.rareMul():1):1)*(D.FISH[i].night&&NIGHT>.5?(V14?V14.fx.nightMul():1):1)),MO=SYS.mods(D,S,r,b);let s=Math.random()*ws.reduce((a,c)=>a+c,0),f=D.FISH[0];
  for(let i=0;i<ws.length;i++){s-=ws[i];if(s<0){f=D.FISH[i];break;}}
  let cm=Math.round(SYS.sizeRoll(D,f,MO.size)*10)/10,g=gradeOf(f,cm);if(Math.random()<txP(r,MO)||window.__forceTX){window.__forceTX=0;g=5;cm=Math.round(f.max*(D.TX.lo+(D.TX.hi-D.TX.lo)*Math.random())*10)/10;}const v=valueOf(f,cm,g);
  return {id:S.nid++,k:f.k,cm,g,v,price:Math.round(v*1.3),sale:false};}
// ───────── UI 유틸 ─────────
function toast(h,ms=1800){const _st=S.toastSt||'T2';if(!/class="cc[ "]/.test(h)&&!(_st==='old'||_st==='T0'||(_st==='T4'&&/입질|당겨/.test(h))))return toastQ(h,ms,_st);const t=$('toast');t.classList.toggle('t0',_st==='T0'||_st==='T4');t.innerHTML=h;t.style.opacity=1;clearTimeout(t._t);t._t=setTimeout(()=>t.style.opacity=0,ms);}
const bubbles={};
function say(who,txt,mine){if(!mine&&who!=='시스템'&&(S.blocked||[]).includes(who))return;if(who!=='시스템'&&window.NK_PROF)txt=NK_PROF.mask(txt);const p=document.createElement('div');p.className=who==='시스템'?'lg-sys':'lg-chat';p.innerHTML=`<b data-who="${mine?'':who}" style="color:${mine?'#ffd58a':'#bfe6ff'}">${who}</b> ${txt}`;$('log').appendChild(p);$('log').scrollTop=1e6;setBub(mine?'__me':who,txt,false);}
const BUB_MS=5000;function setBub(key,txt,emo){bubbles[key]={txt,emo,t:performance.now()};}
function emote(who,em,mine){if(mine)try{xpSocial();}catch(e){}if(!mine&&(S.blocked||[]).includes(who))return;const p=document.createElement('div');p.className='lg-chat';p.innerHTML=`<b style="color:${mine?'#ffd58a':'#bfe6ff'}">${who}</b> ${em}`;$('log').appendChild(p);$('log').scrollTop=1e6;setBub(mine?'__me':who,em,true);}
const bubbleOf=c=>{const k=c===me?'__me':c.name,b=bubbles[k];if(!b)return null;if(performance.now()-b.t>=BUB_MS){delete bubbles[k];return null;}return b;};
const gc=g=>GR(g).c;
function hud(){try{updStreak();updAutoBtn();lvHud(0);}catch(e){}try{if(me){setCharRod(me,SYS.gearOf(S).k,rod().star);}updMyTankExt();}catch(e){}$('coins').textContent='🪙 '+S.coins.toLocaleString();const b=bait(),q=S.baits[S.bait];
  $('equip').textContent=`🎣 ${rod().n}${rod().star?' ★'+rod().star:''}${rod().enh?' +'+rod().enh:''} · 🪱 ${b.n}${q>0?' ×'+q:''} · 🐠 ${S.tank.length}/${cap()}`;}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeM(b.dataset.close));
function openM(id){document.querySelectorAll('.modal.show').forEach(m=>{if(m.id!=='start')m.classList.remove('show');});$(id).classList.add('show');}
function closeM(id){$(id).classList.remove('show');if(id==='tank')tankView.close();}
const anyModal=()=>!!document.querySelector('.modal.show');
// ───────── 렌더러/씬 ─────────
const R=new THREE.WebGLRenderer({canvas:$('world'),antialias:devicePixelRatio<2,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,1.5));R.setSize(innerWidth,innerHeight);R.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,400);
scene.fog=new THREE.Fog(0xcfe6ef,110,300); // 아주 약한 거리 포그만 (물안개 제거)
const hemi=new THREE.HemisphereLight(0xffffff,0xb8d8a0,.9),sun=new THREE.DirectionalLight(0xffffff,1);sun.position.set(-40,60,25);scene.add(hemi,sun);
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight);});
const PAL=[{sky:'#bfe4f2',gnd:'#cfe6b0',sun:'#fff3dc',si:1.0,hemi:.95,deep:'#6fb6c6',shal:'#b2e0d8',fire:.7,lan:0},
  {sky:'#f6c3a8',gnd:'#d8b8b8',sun:'#ffb17a',si:.85,hemi:.75,deep:'#8f93c6',shal:'#eec0b4',fire:1.5,lan:.6},
  {sky:'#2e3768',gnd:'#2c3a4a',sun:'#a8b6ff',si:.32,hemi:.42,deep:'#26325e',shal:'#41598a',fire:3,lan:2.2}];
const time={t:.05,auto:true,len:150};
function lerpC(a,b,k){return new THREE.Color(a).lerp(new THREE.Color(b),k);}
function palette(){const x=time.t*3,i=Math.floor(x)%3,j=(i+1)%3;let k=x-Math.floor(x);k=k<.65?0:(k-.65)/.35;k=k*k*(3-2*k);const o={};
  for(const key in PAL[0])o[key]=typeof PAL[0][key]==='number'?PAL[i][key]*(1-k)+PAL[j][key]*k:lerpC(PAL[i][key],PAL[j][key],k);o.night=(i==2?1-k:0)+(j==2?k:0);o.name=['낮','노을','밤'][i];return o;}
// ───────── 에셋 로딩 + 팔레트 통일 ─────────
const G={},matCache={},texCache={};
function pastelTex(tex){if(!tex||!tex.image)return tex;if(texCache[tex.uuid])return texCache[tex.uuid];const im=tex.image,c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);
  const d=x.getImageData(0,0,c.width,c.height),p=d.data;for(let i=0;i<p.length;i+=4){const l=(p[i]+p[i+1]+p[i+2])/3;for(let j=0;j<3;j++)p[i+j]=Math.min(255,(p[i+j]*.82+l*.18)*.9+255*.1);}x.putImageData(d,0,0);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.flipY=tex.flipY;t.magFilter=THREE.NearestFilter;t.wrapS=tex.wrapS;t.wrapT=tex.wrapT;return texCache[tex.uuid]=t;}
function pastelMat(m){if(matCache[m.uuid])return matCache[m.uuid];const c=m.color?m.color.clone():new THREE.Color(1,1,1),h={};c.getHSL(h);if(h.h>.36&&h.h<.55)h.h-=(h.h-.33)*.85;c.setHSL(h.h,h.s*.82,.08+h.l*.92);
  const n=new THREE.MeshLambertMaterial({color:c,map:pastelTex(m.map),transparent:m.transparent,opacity:m.opacity,side:m.side});n.name=m.name;return matCache[m.uuid]=n;}
function unify(root){root.traverse(o=>{if(o.isMesh){o.material=Array.isArray(o.material)?o.material.map(pastelMat):pastelMat(o.material);}});}
function b64(s){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;}
function loadAll(){const L=new THREE.GLTFLoader();return Promise.all(Object.keys(NK_GLB).map(k=>new Promise(res=>{try{L.parse(b64(NK_GLB[k]),'',g=>{G[k]=g;unify(g.scene);res();},e=>{console.warn(k,e);res();});}catch(e){console.warn(k,e);res();}})));}
// 정적 소품 인스턴싱 (모델의 메쉬 수 = 드로우콜 수, 개수와 무관)
const VG={tree:[],grass:[],flower:[]};const vgOf=k=>/^tree/.test(k)?'tree':/^(flower|mushroom)/.test(k)?'flower':/^(grass|plant_bush)/.test(k)?'grass':null;
function inst(key,list,base=1){if(!G[key]||!list.length)return[];const root=G[key].scene;root.updateMatrixWorld(true);const out=[];
  root.traverse(o=>{if(!o.isMesh)return;const im=new THREE.InstancedMesh(o.geometry,o.material,list.length);
    list.forEach((p,i)=>{M4.compose(V.set(p[0],p[1],p[2]),Q.setFromAxisAngle(UP,p[3]||0),SC.setScalar((p[4]||1)*base));M4.multiply(o.matrixWorld);im.setMatrixAt(i,M4);});
    im.frustumCulled=false;scene.add(im);out.push(im);const g=vgOf(key);if(g)VG[g].push(im);});return out;}
function place(key,x,y,z,ry=0,s=1){if(!G[key])return new THREE.Group();const o=G[key].scene.clone();o.position.set(x,y,z);o.rotation.y=ry;o.scale.setScalar(s);o.userData.prop=1;scene.add(o);return o;}
// v17: 카메라-캐릭터 사이 소품 반투명
const OCC={t:0,on:new Set(),rc:new THREE.Raycaster()};
function occFade(dt,pp){OCC.t-=dt;if(OCC.t>0)return;OCC.t=.12;const tg=new THREE.Vector3(pp.x,pp.y+1.3,pp.z),d=tg.clone().sub(cam.position),L=d.length();d.normalize();OCC.rc.set(cam.position,d);OCC.rc.far=L-.6;
 const cand=scene.children.filter(o=>o.visible&&o.userData.prop&&o.position.distanceTo(cam.position)<L+14);const hit=new Set();for(const o of cand){if(!o.userData.bb)o.userData.bb=new THREE.Box3().setFromObject(o);if(o.userData.bb.distanceToPoint(cam.position)<4.5)hit.add(o);}for(const h of OCC.rc.intersectObjects(cand,true)){let o=h.object;while(o.parent&&o.parent!==scene)o=o.parent;hit.add(o);}
 const setOp=(o,a)=>o.traverse(m=>{if(!m.isMesh)return;if(!m.userData.fm){m.material=Array.isArray(m.material)?m.material.map(x=>x.clone()):m.material.clone();m.userData.fm=1;}(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>{x.transparent=a<1;x.opacity=a;x.depthWrite=a>=1;});});
 hit.forEach(o=>{if(!OCC.on.has(o)){setOp(o,.28);OCC.on.add(o);}});OCC.on.forEach(o=>{if(!hit.has(o)){setOp(o,1);OCC.on.delete(o);}});}
// ───────── 지형 ─────────
const H=(x,z)=>{const r=Math.hypot(x,z);if(r<LR-1)return -2.2;if(r<LR+2)return -2.2+(r-LR+1)/3*2.5;return .3+Math.max(0,r-(DW?LR+20:52))*.3*(1+Math.sin(x*.15)*Math.cos(z*.12))+Math.sin(x*.25)*Math.cos(z*.2)*.25;};
function buildTerrain(){const g=new THREE.PlaneGeometry(220,220,80,80);g.rotateX(-Math.PI/2);const p=g.attributes.position,col=[],cs=['#b9dc9c','#acd38f','#c2e2a6'].map(c=>new THREE.Color(c)),sand=new THREE.Color('#f1e0b4'),wet=new THREE.Color('#d9c79a');
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r=Math.hypot(x,z);p.setY(i,H(x,z));const c=r<LR+.3?wet:r<LR+3.2?sand:cs[(Math.abs(Math.sin(x*12.9+z*78.2))*3)|0];col.push(c.r,c.g,c.b);}
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));const ng=g.toNonIndexed();ng.computeVertexNormals();scene.add(new THREE.Mesh(ng,new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true})));}
// ───────── 물 셰이더 (잔물결 + 프레넬 반사 + 찌 파문) ─────────
const wU={t:{value:0},deep:{value:new THREE.Color()},shal:{value:new THREE.Color()},sky:{value:new THREE.Color()},bob:{value:new THREE.Vector3(0,0,-99)},night:{value:0},R:{value:LR}};
// v18: 낮 밝기 (시안 2 기본, 1·3·5 선택) — 낮일수록 강하게 적용
const DAYQ={'2':{hemi:.72,si:.82},'1':{hemi:.62,si:.75,f:'saturate(1.15)'},'3':{hemi:.78,si:.88,sunc:'#ffe0b0',f:'saturate(1.08) sepia(.06)'},'5':{hemi:.7,si:.85,sky:'#a9d2e6',f:'saturate(1.12) contrast(1.03)'},'0':{}};const _skyC=new THREE.Color(),_sunC=new THREE.Color();let _fl='';
function dayGrade(p){const q=DAYQ[S.dayQ||'2']||DAYQ['2'],k=Math.max(0,1-(p.night||0)*1.6);if(q.hemi)hemi.intensity*=1-(1-q.hemi)*k;if(q.si)sun.intensity*=1-(1-q.si)*k;if(q.sunc)sun.color.lerp(_sunC.set(q.sunc),k);
 if(q.sky){_skyC.set(q.sky);const sc=scene.background.clone?scene.background.clone().lerp(_skyC,k):_skyC;scene.background=sc;scene.fog.color.copy(sc);wU.sky.value.copy(sc);}
 const f=q.f&&k>.3?q.f:'';if(f!==_fl){_fl=f;R.domElement.style.filter=f;}}
function buildWater(){wU.mode={value:5};const m=new THREE.ShaderMaterial({uniforms:wU,transparent:true,vertexShader:`varying vec3 wp;void main(){vec4 w=modelMatrix*vec4(position,1.);wp=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
fragmentShader:`uniform float t,night,R,mode;uniform vec3 deep,shal,sky,bob;varying vec3 wp;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
float caus(vec2 p){vec2 q=p;float c=0.;for(int i=0;i<3;i++){q+=vec2(sin(q.y*1.3+t*.7),cos(q.x*1.1-t*.6))*.6;c+=abs(sin(q.x+q.y));}return pow(1.-c/3.,6.);}
void main(){vec2 p=wp.xz;float r=length(p);float sh=R-r;
float e=.15;float f0=fbm(p*.35+t*.12),fx=fbm((p+vec2(e,0))*.35+t*.12),fy=fbm((p+vec2(0,e))*.35+t*.12);
float g0=fbm(p*.9-t*.2),gx=fbm((p+vec2(e,0))*.9-t*.2),gy=fbm((p+vec2(0,e))*.9-t*.2);
vec2 n=(vec2(f0-fx,f0-fy)*1.6+vec2(g0-gx,g0-gy)*.9)*(mode==0.?1.:mode==2.?1.:2.4);
float bd=length(p-bob.xz);n+=normalize(p-bob.xz+1e-4)*sin(bd*6.-t*6.)*exp(-bd*.55)*.22*bob.y;
vec3 nn=normalize(vec3(n.x,1.,n.y));vec3 v=normalize(cameraPosition-wp);float fr=pow(1.-max(dot(nn,v),0.),4.);
vec3 L=normalize(vec3(-.5,.45,-.6));vec3 sunc=mix(vec3(1.,.93,.8),vec3(.7,.8,1.),night);
float dz=smoothstep(1.5,16.,sh);vec3 mid=mix(shal,deep,.5);vec3 c=mix(mix(shal*1.04,mid,smoothstep(0.,.5,dz)),deep*.92,smoothstep(.5,1.,dz));float a=.88;
if(mode==1.){c=mix(c,sky*1.02,fr*.55+.06);float sp=pow(max(dot(reflect(-v,nn),L),0.),180.);float soft=pow(max(dot(reflect(-v,nn),L),0.),12.);c+=sunc*(sp*1.1+soft*.06);float sk=step(.985,h(floor(p*6.)+floor(t*3.)))*sp*0.;c+=sk;}
if(mode==2.){float b=floor(dz*4.)/4.;c=mix(shal*1.06,deep*.95,b);c=mix(c,sky,step(.55,fr)*.25+.05);float sp=step(.93,pow(max(dot(reflect(-v,nn),L),0.),40.));c+=sp*.5;
 float fn=fbm(p*1.6+t*.3);float foam=step(sh,.35+fn*.5+sin(t*1.3+r)*.1);float ring=step(abs(sh-(1.2+fn*.5+sin(t*.9)*.2)),.07);c=mix(c,vec3(1.),max(foam,ring*.8)*.92);
 float dk=0.;}
if(mode==3.){c=mix(c,sky,fr*.4+.05);float k=caus(p*.55)*(1.-smoothstep(2.,14.,sh));c+=vec3(.95,1.,.9)*k*.9;float sp=pow(max(dot(reflect(-v,nn),L),0.),90.);c+=sunc*sp*.8;a=mix(.72,.9,dz);}
if(mode==4.){vec3 rv=reflect(-v,nn);float sk=clamp(rv.y,0.,1.);vec3 skyc=mix(sky*1.08,sky*.78+vec3(.0,.05,.12),sk);c=mix(c,skyc,fr*.8+.12);float st=pow(max(dot(rv,L),0.),30.)*smoothstep(.0,.3,fbm(p*3.+t*.8)-.35);c+=sunc*st*1.3;}
if(mode==5.){c=mix(c,sky*1.02,fr*.5+.06);float k=caus(p*.55)*(1.-smoothstep(2.,11.,sh));c+=vec3(.95,1.,.9)*k*.5;float sp=pow(max(dot(reflect(-v,nn),L),0.),180.);c+=sunc*sp;
 float fn=fbm(p*1.4+t*.25);float foam=smoothstep(1.6+fn*1.2,.7+fn*1.2,sh)*(.6+.4*fn);c=mix(c,vec3(1.,1.,.98),foam*.8);a=mix(.78,.9,dz);}
gl_FragColor=vec4(c,a);
#include <encodings_fragment>
}`});const w=new THREE.Mesh(new THREE.CircleGeometry(LR+1.2,72).rotateX(-Math.PI/2),m);w.position.y=-.1;scene.add(w);}
// ───────── 데크 (DECKS 값으로 자동 배치) ─────────
const decks=[];
function buildDecks(){const BOARDS=12,LEN=9,W=3,boardG=new THREE.BoxGeometry(W,.18,LEN/BOARDS-.06),wood=new THREE.MeshLambertMaterial({color:'#dcae80',flatShading:true});
  const boards=new THREE.InstancedMesh(boardG,wood,DECKS*BOARDS),posts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.13,.15,2.8,6),new THREE.MeshLambertMaterial({color:'#b88a62',flatShading:true}),DECKS*6);
  const stand=new THREE.InstancedMesh(new THREE.BoxGeometry(1.3,.6,.7),new THREE.MeshLambertMaterial({color:'#c49468',flatShading:true}),DECKS);
  const glass=new THREE.InstancedMesh(new THREE.BoxGeometry(1.2,.8,.6),new THREE.MeshLambertMaterial({color:'#bfeaf5',transparent:true,opacity:.55}),DECKS);
  const lan=[],buck=[],plant=[];
  for(let i=0;i<DECKS;i++){const a=deckAng(i),ca=Math.cos(a),sa=Math.sin(a),cr=LR-2.5+deckOff(i),cx=ca*cr,cz=sa*cr,ry=-a+Math.PI/2;
    Q.setFromAxisAngle(UP,ry);
    for(let b=0;b<BOARDS;b++){const o=-LEN/2+(b+.5)*LEN/BOARDS;M4.compose(V.set(cx-ca*o,.3+Math.sin(b*7.3+i)*.015,cz-sa*o),Q,SC.set(DW?DW.w/W:1,1,1));boards.setMatrixAt(i*BOARDS+b,M4);}
    [[-1.35,-4],[1.35,-4],[-1.35,0],[1.35,0],[-1.35,4],[1.35,4]].forEach(([sx,o],k)=>{M4.compose(V.set(cx+ca*o-sa*sx*-1*0+(-sa)*sx,-.9,cz+sa*o+ca*sx),Q.identity(),SC.set(1,1,1));posts.setMatrixAt(i*6+k,M4);});
    // 어항 위치(데크 측면 중앙)
    const LW=(x,z)=>[cx-ca*z-sa*x,cz-sa*z+ca*x];const [tx,tz]=DW?LW(DW.tank[0][0],DW.tank[0][1]):[cx+ca*.5-sa*1.0,cz+sa*.5+ca*1.0];if(DW)DWX.push({i,LW,ry});Q.setFromAxisAngle(UP,ry);M4.compose(V.set(tx,.7,tz),Q,SC.set(1,1,1));stand.setMatrixAt(i,M4);M4.compose(V.set(tx,1.4,tz),Q,SC.set(DW&&DW.tw?DW.tw:1,DW&&DW.tw?.8:1,1));glass.setMatrixAt(i,M4);
    if(i===0){myTankPos={x:tx,z:tz,ry};M4.compose(V.set(tx,-50,tz),Q,SC.set(.001,.001,.001));stand.setMatrixAt(0,M4);glass.setMatrixAt(0,M4);}
    if(DW){const lx=DW.lan,l=LW(lx[0],lx[1]),q=LW(DW.prop[0],DW.prop[1]);lan.push([l[0],.38,l[1],ry,1.3]);if(i%2)buck.push([q[0],.38,q[1],a,2.2]);else plant.push([q[0],.38,q[1],a,1.6]);}else{lan.push([cx-ca*3.9+sa*1.25,.38,cz-sa*3.9-ca*1.25,ry,1.3]);if(i%2)buck.push([cx+ca*2+sa*.9,.38,cz+sa*2-ca*.9,a,2.2]);else plant.push([cx+ca*2.5+sa*1,.38,cz+sa*2.5-ca*1,a,1.6]);}
    decks.push({i,a,cx,cz,ca,sa,tip:{x:ca*(cr-3.9),z:sa*(cr-3.9)},entry:{x:ca*(LR+3),z:sa*(LR+3)},tank:{x:tx,z:tz},lantern:{x:lan[i][0],z:lan[i][2]},owner:null});}
  if(DW)buildDW(wood);
  boards.frustumCulled=posts.frustumCulled=stand.frustumCulled=glass.frustumCulled=false;scene.add(boards,posts,stand,glass);stand.userData.tankPick=true;glass.userData.tankPick=true;tankPickers.push(stand,glass);
  inst('ft-lantern',lan);lanGlow=new THREE.InstancedMesh(new THREE.SphereGeometry(.16,8,6),new THREE.MeshBasicMaterial({color:'#fff1c4'}),lan.length);lan.forEach((l,i)=>{M4.makeTranslation(l[0],l[1]+1.85,l[2]);lanGlow.setMatrixAt(i,M4);});lanGlow.frustumCulled=false;scene.add(lanGlow);inst('bucket',buck);inst('pottedPlant',plant);}
// v19: 넓힌 데크 W1~W4 (설정에서 선택, 호수 반지름 +DW.lr). 좌표: x=데크 옆(+는 오른쪽), z=데크 길이(+는 호수 쪽 끝)
const DWX=[],SEATS=[];function buildDW(wood){const ex=DW.ext,nE=ex.length*DWX.length,n=DWX.length;const M=(c)=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
  if(nE){const pl=new THREE.InstancedMesh(new THREE.BoxGeometry(1,.18,1),wood,nE);let k=0;DWX.forEach(d=>{Q.setFromAxisAngle(UP,d.ry);ex.forEach(([x0,x1,z0,z1])=>{const c=d.LW((x0+x1)/2,(z0+z1)/2);M4.compose(V.set(c[0],.3,c[1]),Q,SC.set(x1-x0,1,z1-z0));pl.setMatrixAt(k++,M4);});});pl.frustumCulled=false;scene.add(pl);
   const ps=new THREE.InstancedMesh(new THREE.CylinderGeometry(.11,.13,2.4,6),M('#b88a62'),nE*2);k=0;DWX.forEach(d=>ex.forEach(([x0,x1,z0,z1])=>{const x=x0<0?x0+.15:x1-.15;[z0+.2,z1-.2].forEach(z=>{const c=d.LW(x,z);M4.makeTranslation(c[0],-.8,c[1]);ps.setMatrixAt(k++,M4);});}));ps.frustumCulled=false;scene.add(ps);}
  const seat=new THREE.InstancedMesh(new THREE.CylinderGeometry(.32,.34,.12,10),M('#ffffff'),n*2),leg=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.09,.5,6),M('#8a6a4a'),n*2),cols=['#ff9a6a','#6ab0e8'];
  const st2=new THREE.InstancedMesh(new THREE.BoxGeometry(1.3,.6,.7),M('#c49468'),n),gl2=new THREE.InstancedMesh(new THREE.BoxGeometry(1.2,.8,.6),new THREE.MeshLambertMaterial({color:'#bfeaf5',transparent:true,opacity:.55}),n);
  DWX.forEach((d,j)=>{Q.setFromAxisAngle(UP,d.ry);DW.stool.forEach(([x,z],m)=>{const c=d.LW(x,z);SEATS.push({x:c[0],z:c[1],y:.66,cap:1,occ:[],deck:decks[d.i]||d.i,kind:'stool'});M4.makeTranslation(c[0],.92,c[1]);seat.setMatrixAt(j*2+m,M4);seat.setColorAt(j*2+m,new THREE.Color(cols[m]));M4.makeTranslation(c[0],.62,c[1]);leg.setMatrixAt(j*2+m,M4);});
   const t=d.LW(DW.tank[1][0],DW.tank[1][1]),tw=DW.tw||1;M4.compose(V.set(t[0],.7,t[1]),Q,SC.set(tw,1,1));st2.setMatrixAt(j,M4);M4.compose(V.set(t[0],1.4,t[1]),Q,SC.set(tw,tw>1?.8:1,1));gl2.setMatrixAt(j,M4);});
  [seat,leg,st2,gl2].forEach(m=>{m.frustumCulled=false;scene.add(m);});}
const tankPickers=[];let myTankX=null,myTankPos=null,myTankK=null;
function updMyTankExt(){if(!window.NK_TANKX||!myTankPos||myTankK===S.tankK)return;myTankK=S.tankK;if(myTankX){scene.remove(myTankX);const i=tankPickers.indexOf(myTankX);if(i>=0)tankPickers.splice(i,1);}const T=D.TANKS.find(t=>t.k===S.tankK),x=NK_TANKX(T.design,{W:3.2,H:1.9,D:1.5,y0:1.25,sh:1.25});const g=x.g;g.scale.setScalar(.42);g.position.set(myTankPos.x,.39,myTankPos.z);g.rotation.y=myTankPos.ry;g.traverse(m=>m.userData.myTank=true);scene.add(g);myTankX=g;tankPickers.push(g);}let lanGlow=null;
const inDeck=(x,z)=>decks.some(d=>{const dx=x-d.cx,dz=z-d.cz,al=dx*d.ca+dz*d.sa,sd=-dx*d.sa+dz*d.ca;if(!DW)return Math.abs(al)<4.4&&Math.abs(sd)<1.4;const zz=-al;if(Math.abs(al)<4.4&&Math.abs(sd)<DW.w/2-.1)return true;return DW.ext.some(([x0,x1,z0,z1])=>sd>x0+.1&&sd<x1-.1&&zz>z0&&zz<z1);});
// 어항 안 작은 물고기 (월드 표시용, 인스턴싱)
let worldFish=null;
// ───────── 자연·소셜 공간 ─────────
const obstacles=[];let SH,SHOP,fireL,fireMesh,lanL;
function angGap(a){return decks.some(d=>{let x=Math.abs(((a-d.a)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI);return x<.16;});}
function buildWorld(){const sa=-Math.PI/2+Math.PI/DECKS,sh=Math.PI/2+Math.PI/DECKS;SHOP={x:Math.cos(sa)*(LR+10),z:Math.sin(sa)*(LR+10)};SH={x:Math.cos(sh)*(LR+11),z:Math.sin(sh)*(LR+11)};
  // 공용 쉼터: 모닥불 + 벤치 + 텐트 + 장작
  place('campfire_stones',SH.x,.3,SH.z,0,5);place('campfire_logs',SH.x,.3,SH.z,0,5);
  fireMesh=NK_FIRE(THREE,scene,SH.x,SH.z);mergeStatic(fireMesh);if((S.fireSt||'C2')==='C2')fireC2();
  fireL=new THREE.PointLight(0xff9a50,1,22,1.6);fireL.position.set(SH.x,2,SH.z);scene.add(fireL);obstacles.push([SH.x,SH.z,1.3]);
  const bl=[];for(let k=0;k<5;k++){const a=k/5*Math.PI*2+.3,bx=SH.x+Math.cos(a)*3.6,bz=SH.z+Math.sin(a)*3.6;bl.push([bx,.3,bz,-a-Math.PI/2,2]);[-.55,.55].forEach(t=>SEATS.push({x:bx-Math.sin(a)*t+Math.cos(a)*.12,z:bz+Math.cos(a)*t+Math.sin(a)*.12,y:.62,cap:1,occ:[],kind:'bench',bench:k}));obstacles.push([SH.x+Math.cos(a)*3.6,SH.z+Math.sin(a)*3.6,.8]);}inst('bench',bl);
  const ta=Math.atan2(SH.z,SH.x);place('tent_detailedOpen',SH.x+Math.cos(ta)*7,.3,SH.z+Math.sin(ta)*7,-ta-Math.PI/2,5);obstacles.push([SH.x+Math.cos(ta)*7,SH.z+Math.sin(ta)*7,2.2]);
  place('log_stack',SH.x+Math.cos(ta+.9)*6,.3,SH.z+Math.sin(ta+.9)*6,ta,4);place('lantern-hanging',SH.x,3.2,SH.z,0,0.01);
  // 작은 상점: 노점 2동 + 수레 + 통 + 표지판 + 랜턴
  const oa=Math.atan2(SHOP.z,SHOP.x),ry=-oa-Math.PI/2,ox=-Math.sin(oa),oz=Math.cos(oa);
  place('stall-red',SHOP.x-ox*2.2,.3,SHOP.z-oz*2.2,ry,3.2);place('stall-green',SHOP.x+ox*2.2,.3,SHOP.z+oz*2.2,ry,3.2);
  place('cart',SHOP.x+ox*6+Math.cos(oa)*1,.3,SHOP.z+oz*6+Math.sin(oa)*1,ry+.4,2.6);place('barrel',SHOP.x-ox*5,.3,SHOP.z-oz*5,0,3);place('barrel',SHOP.x-ox*5.8,.3,SHOP.z-oz*4.4,0,3);
  place('signpost',SHOP.x-Math.cos(oa)*3.5,.3,SHOP.z-Math.sin(oa)*3.5,ry,3.5);place('ft-lantern',SHOP.x-Math.cos(oa)*2.5+ox*4.3,.3,SHOP.z-Math.sin(oa)*2.5+oz*4.3,0,1.4);
  obstacles.push([SHOP.x-ox*2.2,SHOP.z-oz*2.2,1.7],[SHOP.x+ox*2.2,SHOP.z+oz*2.2,1.7],[SHOP.x+ox*6,SHOP.z+oz*6,1.6],[SHOP.x-ox*5.4,SHOP.z-oz*4.7,.9]);
  lanL=new THREE.PointLight(0xffd08a,0,12,1.5);scene.add(lanL);
  // 나무 (종류별 InstancedMesh)
  const TT=['tree_oak','tree_default','tree_fat','tree_detailed','tree_pineRoundA','tree_pineDefaultA','tree_oak_fall','tree_default_fall','tree_cone'],TL={};TT.forEach(t=>TL[t]=[]);
  let n=0;while(n<150){const a=Math.random()*Math.PI*2,r=LR+6+Math.pow(Math.random(),.7)*70,x=Math.cos(a)*r,z=Math.sin(a)*r;
    if(Math.hypot(x-SH.x,z-SH.z)<11||Math.hypot(x-SHOP.x,z-SHOP.z)<11||(r<LR+16&&angGap(a))||Math.abs(x)>105||Math.abs(z)>105)continue;
    const s=rand(4.2,6.5);TL[TT[n%TT.length]].push([x,H(x,z)-.1,z,Math.random()*6.3,s]);obstacles.push([x,z,.35*s*.5]);n++;}
  TT.forEach(t=>inst(t,TL[t]));
  const bush={plant_bush:[],plant_bushLarge:[],plant_bushSmall:[]};for(let i=0;i<60;i++){const a=Math.random()*6.3,r=LR+4+Math.random()*40;if(angGap(a))continue;bush[pick(Object.keys(bush))].push([Math.cos(a)*r,H(Math.cos(a)*r,Math.sin(a)*r)-.05,Math.sin(a)*r,a,rand(3,4.5)]);}
  Object.keys(bush).forEach(k=>inst(k,bush[k]));
  // 호숫가 바위
  const RK={rock_largeA:[],rock_largeB:[],rock_smallA:[],rock_smallC:[],stone_largeA:[]};for(let i=0;i<46;i++){const a=Math.random()*6.3;if(angGap(a))continue;const r=LR+rand(-.3,2.6);RK[pick(Object.keys(RK))].push([Math.cos(a)*r,H(Math.cos(a)*r,Math.sin(a)*r)-.1,Math.sin(a)*r,Math.random()*6,rand(2.5,4.5)]);}
  Object.keys(RK).forEach(k=>inst(k,RK[k]));
  // 풀·꽃·버섯
  const GF={grass:[],grass_large:[],grass_leafs:[],grass_leafsLarge:[],flower_purpleA:[],flower_redA:[],flower_yellowA:[],flower_yellowB:[],flower_purpleB:[],mushroom_red:[],mushroom_tanGroup:[]};const gk=Object.keys(GF);
  for(let i=0;i<520;i++){const a=Math.random()*6.3,r=LR+2.5+Math.pow(Math.random(),1.4)*55,x=Math.cos(a)*r,z=Math.sin(a)*r;const k=i%3?gk[i%4]:gk[4+(i%7)];GF[k].push([x,H(x,z)-.03,z,Math.random()*6,rand(3,5)]);}
  gk.forEach(k=>inst(k,GF[k]));
  // 수련잎 + 카누
  const LL={lily_large:[],lily_small:[]};for(let i=0;i<40;i++){const a=Math.random()*6.3,r=rand(LR-9,LR-1);if(angGap(a))continue;LL[i%2?'lily_large':'lily_small'].push([Math.cos(a)*r,-.12,Math.sin(a)*r,Math.random()*6,rand(4,6)]);}
  Object.keys(LL).forEach(k=>inst(k,LL[k]));
  const ca=sh+.5;place('canoe',Math.cos(ca)*(LR+1.5),-.25,Math.sin(ca)*(LR+1.5),-ca,4);
  // 호수 속 물고기 그림자
  if(G.fish){const fm=G.fish.scene.getObjectByProperty('isMesh',true);const sh2=new THREE.InstancedMesh(fm.geometry,new THREE.MeshBasicMaterial({color:'#20384a',transparent:true,opacity:.35}),16);sh2.frustumCulled=false;scene.add(sh2);
    worldFish={m:sh2,d:[...Array(16)].map(()=>({r:rand(3,LR-3),a:Math.random()*6.3,s:rand(.05,.15)*(Math.random()<.5?-1:1),sz:rand(5,10)}))};}}
// ───────── 캐릭터 (Kenney Mini Characters + 애니메이션) ─────────
const KINDS=[{k:'character-male-a',n:'성인 남성',s:1},{k:'character-female-a',n:'성인 여성',s:1},{k:'character-male-a',n:'남자 어린이',s:.72,rc:{'11,6':'#ff7a2a','3,5':'#ff7a2a','3,4':'#ff7a2a'}},{k:'character-female-c',n:'여자 어린이',s:.72},
  {k:'character-male-b',s:1},{k:'character-female-b',s:1},{k:'character-male-e',s:1},{k:'character-female-e',s:1},{k:'character-male-b',n:'밀짚모자 낚시꾼',s:1,hat:'straw',rc:{'11,6':'#5fa8e0','11,7':'#3a78b8'}}];
// v18: 사람 12종 + 동물 10종 추가 (chars-v18.js 모듈) — 밀짚모자 낚시꾼은 기존 8번 그대로
[0,1,2,3].forEach(i=>KINDS[i].th='b'+i);if(window.NK_CHARS){NK_CHARS.humans.forEach(h=>{if(h.prop==='straw'){KINDS[8].th=h.id;return;}KINDS.push({k:h.base,n:h.n,s:h.s,rc:h.rc,prop:h.prop,th:h.id,grp:'h'});});NK_CHARS.animals.forEach(a=>KINDS.push({k:'character-male-a',n:a.n,s:1,animal:a.id,th:a.id,grp:'a'}));}
const chars=[];
// v16: 캐릭터 옷 색 바꾸기(같은 모델·텍스처 칸만 교체) + 밀짚모자
const KTX={};function kRecolor(o,map){const key=JSON.stringify(map);o.traverse(m=>{if(!m.isMesh||m.name!=='body-mesh')return;const mt=m.material.clone();if(!KTX[key]){const img=mt.map.image,cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const x=cv.getContext('2d');x.drawImage(img,0,0);const cw=img.width/16,ch=img.height/8;
 for(const k in map){const [cx,cy]=k.split(',').map(Number),d=x.getImageData(cx*cw,cy*ch,cw,ch),t=new THREE.Color(map[k]);let av=0;for(let i=0;i<d.data.length;i+=4)av+=d.data[i]+d.data[i+1]+d.data[i+2];av/=d.data.length/4;for(let i=0;i<d.data.length;i+=4){const l=(d.data[i]+d.data[i+1]+d.data[i+2])/av;d.data[i]=Math.min(255,t.r*255*l);d.data[i+1]=Math.min(255,t.g*255*l);d.data[i+2]=Math.min(255,t.b*255*l);}x.putImageData(d,cx*cw,cy*ch);}
 const tx=new THREE.CanvasTexture(cv);tx.flipY=mt.map.flipY;tx.encoding=mt.map.encoding;tx.magFilter=mt.map.magFilter;tx.minFilter=mt.map.minFilter;KTX[key]=tx;}mt.map=KTX[key];m.material=mt;});}
function kHat(o,kind){const h=o.getObjectByName('head'),hm=o.getObjectByName('head-mesh');if(!h||!hm)return;o.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(hm),sz=bb.getSize(new THREE.Vector3()),wp=h.getWorldPosition(new THREE.Vector3()),s=1/o.scale.x,r=sz.x*.5*s,y=(bb.max.y-wp.y)*s-r*.12;
 const M=c=>new THREE.MeshStandardMaterial({color:new THREE.Color(c).convertSRGBToLinear(),roughness:.85,flatShading:true}),g=new THREE.Group();
 const b=new THREE.Mesh(new THREE.CylinderGeometry(r*1.55,r*1.6,r*.08,10),M(0xe8c26a));b.position.y=y-r*.32;const t=new THREE.Mesh(new THREE.CylinderGeometry(r*.86,r*.98,r*.48,10),M(0xe8c26a));t.position.y=y-r*.08;const bd=new THREE.Mesh(new THREE.CylinderGeometry(r,r,r*.12,10),M(0xd0503a));bd.position.y=y-r*.24;g.add(b,t,bd);g.traverse(m=>{if(m.isMesh)m.castShadow=true;});h.add(g);}
// v10 낚시 자세: 낚싯대를 캐릭터 루트에 붙이고(손 위치), 오른팔을 앞으로 들어 손이 그립을 잡도록 매 프레임 보정
const ROD_POSE={p:[-.15,.25,.16],rx:.95,rz:.14,arm:-1.0};
function poseRod(c,dt){if(!c.rod.visible||!c.arm)return;const P=ROD_POSE,t=performance.now()/1000;let rx=P.rx,ax=P.arm;
  if(c===me&&castT>=0&&castT<1){const k=castT;rx=k<.3?P.rx+(-.35-P.rx)*(k/.3):-.35+(P.rx+.35)*(1-Math.pow(1-(k-.3)/.7,3));ax=P.arm+(k<.3?-.5*(k/.3):-.5*(1-(k-.3)/.7));}
  else if(c===me&&fishing.state==='bite'){rx=P.rx+.1+.08*Math.sin(t*28);}
  if(c.reelT>0){c.reelT-=dt;const k=Math.sin(Math.min(1,c.reelT/.7)*Math.PI);rx=P.rx-.75*k;ax=P.arm-.35*k;}
  c.rod.rotation.set(rx,0,P.rz);c.arm.rotation.set(ax,0,0);c.rod.position.y=P.p[1]-(ax-P.arm)*.06;}
// v10 말풍선: Canvas 텍스처 대신 HTML 오버레이(DOM)로 표시 → 폰트/이미지 로드 타이밍·WebKit 캔버스 문제와 무관하게 항상 내용이 보임
const _bv=new THREE.Vector3();let BUBS=null;
function domBub(c,bb,dd){c.bub.visible=false;if(!BUBS){BUBS=document.createElement('div');BUBS.id='bubs';const H=document.getElementById('hud');H.parentNode.insertBefore(BUBS,H);}
  let el=c.dbub;if(!bb){if(el)el.style.display='none';return;}
  if(!el){el=c.dbub=document.createElement('div');el.className='bub3';el.innerHTML='<div class="bt"></div>';BUBS.appendChild(el);}
  if(el._t!==bb.t){el._t=bb.t;el.classList.toggle('emo',!!bb.emo);const t=el.firstChild;t.textContent=bb.txt;}
  _bv.set(c.o.position.x,c.o.position.y+c.h+1.12,c.o.position.z).project(cam);
  if(_bv.z>1||Math.abs(_bv.x)>1.2||Math.abs(_bv.y)>1.2){el.style.display='none';return;}
  const ag=(performance.now()-bb.t)/BUB_MS,op=ag>.85?(1-ag)/.15:Math.min(1,ag*12),k=Math.max(.62,Math.min(1.1,13/dd));
  el.style.display='';el.style.opacity=op.toFixed(3);const by=c.rkUp&&c.rkTop!=null?c.rkTop-2:Math.round((1-_bv.y)/2*innerHeight);el.style.transform=`translate(${Math.round((_bv.x+1)/2*innerWidth)}px,${by}px) translate(-50%,-100%) scale(${k.toFixed(3)})`;el.style.zIndex=String(1000-Math.round(dd));}
// v20: 정적 부품 메시 병합 (같은 재질 종류끼리 1개 메시 + 정점색). 동물 캐릭터·낚싯대 draw call 감소, 모양·색은 그대로
function mergeStatic(root){root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(root.matrixWorld).invert(),G=new Map();
 root.traverse(m=>{if(!m.isMesh||m.isSkinnedMesh||m.isInstancedMesh||!m.visible)return;const mt=m.material;if(Array.isArray(mt)||mt.map||mt.transparent||mt.vertexColors||!mt.color||!m.geometry.attributes.position)return;
  for(let p=m.parent;p&&p!==root;p=p.parent)if(p.isBone||!p.visible||p.name==='arm-right'||p.name==='head'||p.name==='leg')return;
  const k=[mt.type,mt.flatShading?1:0,mt.side,mt.emissive?mt.emissive.getHexString()+mt.emissiveIntensity:'',m.castShadow?1:0].join('|');if(!G.has(k))G.set(k,[]);G.get(k).push(m);});
 let n=0;G.forEach(L=>{if(L.length<2)return;const pos=[],nor=[],col=[],M=new THREE.Matrix4(),N=new THREE.Matrix3();
  L.forEach(m=>{const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry;if(!g.attributes.normal)g.computeVertexNormals();M.multiplyMatrices(inv,m.matrixWorld);N.getNormalMatrix(M);const P=g.attributes.position,Q=g.attributes.normal,c=m.material.color,v=new THREE.Vector3();
   for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(M);pos.push(v.x,v.y,v.z);v.fromBufferAttribute(Q,i).applyMatrix3(N).normalize();nor.push(v.x,v.y,v.z);col.push(c.r,c.g,c.b);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  const mt=L[0].material.clone();mt.vertexColors=true;mt.color.set(0xffffff);const mm=new THREE.Mesh(g,mt);mm.castShadow=L[0].castShadow;mm.receiveShadow=L[0].receiveShadow;mm.frustumCulled=false;root.add(mm);L.forEach(m=>m.parent.remove(m));n+=L.length-1;});return n;}
function makeChar(ki,name){const K=KINDS[ki]||KINDS[0],src=K.animal?{scene:null,animations:[]}:G[K.k];let o;
  if(K.animal){o=new THREE.Group();const rig=NK_CHARS.buildAnimal(K.animal);rig.scale.setScalar(1/2.6);o.add(rig);const ar=rig.getObjectByName('arm-right');o.add(ar);ar.position.multiplyScalar(1/2.6);const hd=rig.getObjectByName('head');o.add(hd);hd.position.multiplyScalar(1/2.6);if(S.mergeOff!==true)mergeStatic(rig);o.scale.setScalar(2.6*K.s);scene.add(o);o.userData.rig=rig;}
  else{o=THREE.SkeletonUtils.clone(src.scene);o.scale.setScalar(2.6*K.s);scene.add(o);if(K.rc)kRecolor(o,K.rc);if(K.hat)kHat(o,K.hat);if(K.prop&&window.NK_CHARS){try{const mx=new THREE.AnimationMixer(o),cl=src.animations.find(a=>/idle/i.test(a.name));if(cl){mx.clipAction(cl).play();mx.update(.6);}NK_CHARS.addProp(o,K.prop);mx.stopAllAction();}catch(e){console.warn(e);}}}
  const mixer=new THREE.AnimationMixer(o),acts={};src.animations.forEach(a=>acts[a.name]=mixer.clipAction(a));
  const arm=o.getObjectByName('arm-right');const rodM=new THREE.Group();const rc=new THREE.Mesh(new THREE.CylinderGeometry(.006,.014,.95,5),new THREE.MeshLambertMaterial({color:'#7a5236'}));rc.position.y=.47;rodM.add(rc);
  const reel=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.03,8),new THREE.MeshLambertMaterial({color:'#e8e2d8'}));reel.rotation.z=Math.PI/2;reel.position.y=.12;rodM.add(reel);
  rodM.position.set(ROD_POSE.p[0],ROD_POSE.p[1],ROD_POSE.p[2]);rodM.rotation.x=ROD_POSE.rx;rodM.visible=false;o.add(rodM);
  const tip=new THREE.Object3D();tip.position.y=.95;rodM.add(tip);rc.visible=reel.visible=false;
  const tag=makeTag(name);scene.add(tag);const bub=makeBub();scene.add(bub);
  const c={o,mixer,acts,cur:null,rod:rodM,arm,reelT:0,tip,tag,bub,head:o.getObjectByName('head'),name,h:1.9*K.s,dir:0};c.play=n=>{if(c.cur===n||!acts[n])return;const a=acts[n];a.reset().fadeIn(.2).play();if(c.cur&&acts[c.cur])acts[c.cur].fadeOut(.2);c.cur=n;};if(K.animal){c.rig=o.userData.rig;c.legs=[];c.rig.traverse(m=>{if(m.name==='leg')c.legs.push(m);});c.play=n=>{c.cur=n;};}
  else if(acts['holding-right']&&arm){try{const a=acts['holding-right'];a.play();mixer.update(.5);c.holdQ=arm.quaternion.clone();a.stop();}catch(e){}}c.play('idle');chars.push(c);setCharRod(c,'bamboo',0);return c;}
function setCharRod(c,k,star){if(!window.NK_ROD3D)return;if(c.rodK===k+star)return;c.rodK=k+star;if(c.rodMdl)c.rod.remove(c.rodMdl);const m=NK_ROD3D(k,star);if(S.mergeOff!==true)mergeStatic(m);c.rod.add(m);c.rodMdl=m;c.tip=m.userData.tip;}
const _hv=new THREE.Vector3();function makeBub(){const cv=document.createElement('canvas');cv.width=512;cv.height=176;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true}));sp.renderOrder=10;sp.visible=false;sp.userData={cv,last:null};return sp;}
function drawBub(sp,b){const key=b?(b.emo?'e:':'t:')+b.txt+b.t:'';if(sp.userData.last===key)return;sp.userData.last=key;const x=sp.userData.cv.getContext('2d');x.clearRect(0,0,512,176);if(!b){sp.visible=false;return;}sp.visible=true;
  const rr=(X,Y,W,H,R)=>{x.beginPath();if(x.roundRect)x.roundRect(X,Y,W,H,R);else x.rect(X,Y,W,H);};x.shadowColor='#0003';x.shadowBlur=10;x.shadowOffsetY=3;x.fillStyle='#fffaf3';
  if(b.emo){rr(256-62,14,124,124,62);x.fill();x.shadowColor='transparent';x.beginPath();x.moveTo(244,134);x.lineTo(268,134);x.lineTo(256,156);x.fill();x.strokeStyle='#e6dccb';x.lineWidth=3;x.beginPath();x.arc(256,76,61,0,Math.PI*2);x.stroke();const im=NK_emojiImg(b.txt,()=>{sp.userData.last=null;});if(im)x.drawImage(im,256-40,76-40,80,80);}
  else{x.font='bold 34px sans-serif';const t=[...b.txt].length>16?[...b.txt].slice(0,15).join('')+'…':b.txt;const w=Math.min(496,x.measureText(t).width+48);rr(256-w/2,40,w,76,30);x.fill();x.shadowColor='transparent';x.beginPath();x.moveTo(242,114);x.lineTo(270,114);x.lineTo(256,138);x.fill();x.strokeStyle='#e6dccb';x.lineWidth=2;rr(256-w/2,40,w,76,30);x.stroke();x.fillStyle='#4a4058';x.textAlign='center';NK_fillTextEmoji(x,t,256,90,34,()=>{sp.userData.last=null;});}
  sp.material.map.needsUpdate=true;}
function makeTag(name){const cv=document.createElement('canvas');cv.width=320;cv.height=110;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false,transparent:true}));sp.scale.set(3.4,1.17,1);sp.renderOrder=9;sp.userData={cv,last:null,name};return sp;}
function drawTag(sp,b,rk=0){const _lv=sp.userData.lv||0;if(sp.userData.last===b&&sp.userData.lrk===rk&&sp.userData.llv===_lv)return;sp.userData.last=b;sp.userData.lrk=rk;sp.userData.llv=_lv;const x=sp.userData.cv.getContext('2d');x.clearRect(0,0,320,110);x.font='bold 26px sans-serif';x.textAlign='center';
  if(b){const w=Math.min(300,x.measureText(b).width+30);x.fillStyle='#fffaf3';x.beginPath();if(x.roundRect)x.roundRect(160-w/2,2,w,48,18);else x.rect(160-w/2,2,w,48);x.fill();x.beginPath();x.moveTo(150,50);x.lineTo(170,50);x.lineTo(160,60);x.fill();x.fillStyle='#4a4058';NK_fillTextEmoji(x,[...b].length>14?[...b].slice(0,13).join('')+'…':b,160,36,26,()=>{sp.userData.last=null;});}
  if(rk){const M=['','#f6c542','#b9c4d4','#e5a06e'][rk],nm=sp.userData.name,w=x.measureText(nm).width,cx=160-12,L=cx-w/2-26;x.save();x.shadowColor=M;x.shadowBlur=18;x.fillStyle='#fffdf8';x.beginPath();if(x.roundRect)x.roundRect(L-10,72,w+56,34,17);else x.rect(L-10,72,w+56,34);x.fill();x.restore();x.lineWidth=2.5;x.strokeStyle=M;x.stroke();
   const g=x.createRadialGradient(L+10,85,2,L+13,89,13);g.addColorStop(0,'#fff');g.addColorStop(1,M);x.fillStyle=g;x.beginPath();x.arc(L+13,89,12,0,7);x.fill();x.lineWidth=2;x.strokeStyle=['','#b8860b','#7d8898','#a8643a'][rk];x.stroke();x.fillStyle=['','#7a5200','#4a5464','#6e3a18'][rk];x.font='900 16px sans-serif';x.fillText(rk,L+13,94.5);x.font='bold 26px sans-serif';x.fillStyle='#4a4058';x.fillText(nm,cx+14,98);}
  else{const nm=sp.userData.name,lt=_lv?'Lv.'+_lv:'';x.font='bold 26px sans-serif';const nw=x.measureText(nm).width;x.font='900 17px sans-serif';const lw=lt?x.measureText(lt).width+14:0,tw=nw+(lw?lw+6:0),L0=160-tw/2;
   if(lt){x.fillStyle=_lv>=99?'#f6c542':'#ff8a5c';x.beginPath();if(x.roundRect)x.roundRect(L0,77,lw,26,9);else x.rect(L0,77,lw,26);x.fill();if(_lv>=99){x.lineWidth=2;x.strokeStyle='#fff';x.stroke();}x.fillStyle='#fff';x.textAlign='center';x.fillText(lt,L0+lw/2,96);}
   x.font='bold 26px sans-serif';x.textAlign='center';const cx2=L0+(lw?lw+6:0)+nw/2;x.lineWidth=5;x.strokeStyle=_lv>=99?'#7a4a00cc':'#4a405888';x.strokeText(nm,cx2,98);x.fillStyle=_lv>=99?'#ffe08a':'#fff';x.fillText(nm,cx2,98);}sp.material.map.needsUpdate=true;}
// ───────── 충돌 ─────────
function walk(x,z){const r=Math.hypot(x,z);if(r>90)return false;if(r<LR+.5&&!inDeck(x,z))return false;for(const o of obstacles)if((x-o[0])**2+(z-o[1])**2<o[2]*o[2])return false;
  for(const d of decks){if(Math.hypot(x-d.tank.x,z-d.tank.z)<.55)return false;}return true;}
// ───────── 사운드: 앰비언트(파일) + 효과음(합성) ─────────
const snd={on:true,ctx:null,day:new Audio(),night:new Audio(),rain:new Audio(),rainK:'',rainV:0,force:null,forceT:0};snd.day.loop=snd.night.loop=snd.rain.loop=true;
// v20: 빗소리 (이슬비=빗소리만, 소나기·천둥=비+천둥). 기본 R1 / T1, 설정 > 사운드에서 변경
const RAIN={r:[['r1','R1 부슬비 (기본)'],['r2','R2 창가 빗소리'],['r3','R3 굵은 빗방울']],t:[['t1','T1 보슬비+먼 천둥 (기본)'],['t2','T2 소나기+천둥'],['t3','T3 처마 비+천둥'],['t4','T4 비+천둥+새소리']]};
function updRain(dt){const w=S.__wx,k=w==='drizzle'?(S.rainR||'r1'):w==='storm'?(S.rainT||'t1'):snd.rainForce||'';const ext=snd.day.canPlayType('audio/ogg')?'.ogg':'.mp3';
 if(k&&k!==snd.rainK&&snd.rainV<.02){snd.rainK=k;snd.rain.src='sounds/rain_'+k+ext;if(snd.on)snd.rain.play().catch(()=>{});}
 const tgt=k&&k===snd.rainK&&snd.on&&S.rainOn!==false?(S.vol||0)*.9:0;snd.rainV+=(tgt-snd.rainV)*Math.min(1,dt*.8);const v=Math.max(0,Math.min(1,snd.rainV));if(snd.gRain){snd.rain.volume=1;snd.gRain.gain.value=v;}else snd.rain.volume=v;if(v<.005&&!k&&!snd.rain.paused){snd.rain.pause();snd.rainK='';}}
function setAmb(){const d=D.SOUNDS.day[S.sDay],n=D.SOUNDS.night[S.sNight];const ext=snd.day.canPlayType('audio/ogg')?'.ogg':'.mp3';
  if(!snd.day.src.includes(d.f)){snd.day.src=d.f+ext+'?v8';snd.on&&snd.day.play().catch(()=>{});}if(!snd.night.src.includes(n.f)){snd.night.src=n.f+ext+'?v8';snd.on&&snd.night.play().catch(()=>{});}}
function startAudio(){try{snd.ctx=new (window.AudioContext||window.webkitAudioContext)();snd.m=snd.ctx.createGain();snd.m.gain.value=.5;snd.m.connect(snd.ctx.destination);
  // v9: iOS Safari는 HTMLMediaElement.volume 무시 → 환경음도 WebAudio GainNode 경유 (file://은 교차출처 무음 문제로 제외)
  if(location.protocol!=='file:'){try{const mk=el=>{const g=snd.ctx.createGain();g.gain.value=0;snd.ctx.createMediaElementSource(el).connect(g).connect(snd.ctx.destination);return g;};snd.gDay=mk(snd.day);snd.gNight=mk(snd.night);snd.gRain=mk(snd.rain);snd.wa=true;
   fetch('sounds/sfx/splash-drop.wav').then(r=>r.arrayBuffer()).then(b=>snd.ctx.decodeAudioData(b)).then(buf=>snd.dropBuf=buf).catch(()=>{});}catch(e){snd.wa=false;}}
  const rs=()=>{if(snd.ctx&&snd.ctx.state!=='running')snd.ctx.resume().catch(()=>{});};['pointerdown','touchend','keydown'].forEach(ev=>addEventListener(ev,rs,{passive:true}));
  const nb=snd.ctx.createBuffer(1,snd.ctx.sampleRate,snd.ctx.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;snd.nb=nb;}catch(e){}setAmb();snd.day.play().catch(()=>{});snd.night.play().catch(()=>{});}
function tone(f1,f2,dur,type='sine',g=.15,delay=0){if(!snd.ctx||!snd.on)return;const A=snd.ctx,t=A.currentTime+delay,o=A.createOscillator(),gn=A.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);gn.gain.setValueAtTime(g,t);gn.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(gn).connect(snd.m);o.start(t);o.stop(t+dur+.05);}
function splash(g=.3,f=1100){if(!snd.ctx||!snd.on)return;const A=snd.ctx,s=A.createBufferSource();s.buffer=snd.nb;const fl=A.createBiquadFilter();fl.type='bandpass';fl.frequency.value=f;fl.Q.value=.8;const gn=A.createGain();gn.gain.setValueAtTime(g,A.currentTime);gn.gain.exponentialRampToValueAtTime(.001,A.currentTime+.6);s.connect(fl).connect(gn).connect(snd.m);s.start();s.stop(A.currentTime+.6);}
const sfx={cast(){tone(660,440,.22,'sine',.025);},bite(){tone(880,880,.12,'sine',.07);tone(1320,1320,.18,'sine',.05,.13);},
  reel(){[523,659,784].forEach((f,i)=>tone(f,f,.3,'sine',.045,.1+i*.09));},
  coin(){tone(1568,1568,.08,'square',.05);tone(2093,2093,.25,'square',.05,.08);},fail(){tone(400,200,.3,'sine',.08);},
  drop(){if(!snd.on)return;if(snd.dropBuf&&snd.ctx){const b=snd.ctx.createBufferSource(),g=snd.ctx.createGain();b.buffer=snd.dropBuf;g.gain.value=1.6;b.connect(g).connect(snd.m);b.start();return;}try{const a=sfxDrop.cloneNode();a.volume=Math.max(0,Math.min(1,(S.vol==null?.5:S.vol)*1.2));a.play().catch(()=>{});}catch(e){}}};
const FISH_IMG={};D.FISH.forEach(f=>{const im=new Image();im.decoding='async';im.src=f.img;FISH_IMG[f.k]=im;if(im.decode)im.decode().catch(()=>{});});
const sfxDrop=new Audio('sounds/sfx/splash-drop.wav');sfxDrop.preload='auto';
function updAmb(p){const k=snd.force==='day'?0:snd.force==='night'?1:S.ambOne==='day'?0:S.ambOne==='night'?1:Math.min(1,p.night*1.15);const v=snd.on?S.vol:0,cl=x=>Math.max(0,Math.min(1,x));if(snd.wa){snd.day.volume=snd.night.volume=1;snd.gDay.gain.value=cl(v*(1-k));snd.gNight.gain.value=cl(v*k);}else{snd.day.volume=cl(v*(1-k));snd.night.volume=cl(v*k);}if(snd.m)snd.m.gain.value=cl(v*.625);}
// ───────── 게임 상태 ─────────
let me,yaw=0,pitch=.38,dist=12,drag=null,fishing={state:'off'},nearSpot=null,bob=null,line=null,lineG,castT=-1,castTo=new THREE.Vector3();
const bots=[];const BOT_NAMES=['물멍러','붕어왕','노을소녀','캠핑아재','꼬마강태공','밤낚시','호수요정','쏘가리헌터','루어장인','은빛여울','새벽입질','낚시하는곰','월척꿈나무','바람의찌','모래무지씨','고요한호수','릴감는소리','물안개','별밤조사','떡밥장인','강준치헌터','찌맞춤','초보강태공','손맛중독','잉어사랑','호수산책','물결소리','갈대숲','연잎위개구리','버들치','송사리','물총새','왜가리','청둥오리','노을빛찌','달빛낚시','파란버킷','캠핑의자','모닥불지기','붕어빵','민물요정','손맛장인','느긋한오후','바람개비','연못지기','물수제비','고양이낚시꾼','대물사냥꾼','초록찌','소풍가방'];
const LINES=['안녕하세요~','오늘 입질 좋네요','노을 진짜 예쁘다','모닥불 쬐러 가요','🐟','😊','가물치 잡으신 분?','제 어항 구경 오세요!','소리 너무 힐링돼요','👍','떡밥 쓰니까 빨라요','월척 하고 싶다…'];
function ringRoute(fx,fz,tx,tz){const pts=[],R0=LR+3.2,a0=Math.atan2(fz,fx),a1=Math.atan2(tz,tx);let da=((a1-a0)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;
  const steps=Math.max(1,Math.ceil(Math.abs(da)/.25));if(Math.hypot(fx,fz)<LR+2)pts.push({x:Math.cos(a0)*R0,z:Math.sin(a0)*R0});for(let i=1;i<=steps;i++){const a=a0+da*i/steps;pts.push({x:Math.cos(a)*R0,z:Math.sin(a)*R0});}pts.push({x:tx,z:tz});return pts;}
function botGoal(b){const r=Math.random();let dest;
  seatLeave(b);b.seat=null;if(b.deck&&r<.55){b.goal='fish';const d=b.deck;b.path=ringRoute(b.c.o.position.x,b.c.o.position.z,d.entry.x,d.entry.z);b.path.push({x:d.cx+d.ca*.5,z:d.cz+d.sa*.5});const st=DW&&SEATS.find(x=>x.kind==='stool'&&x.deck===d&&seatFree(x));if(st){seatTake(st,b);b.seat=st;b.path.push({x:st.x,z:st.z});}else b.path.push({x:d.tip.x+d.ca*.6,z:d.tip.z+d.sa*.6});return;}
  if(r<.8){b.goal='rest';const fr=SEATS.filter(x=>x.kind==='bench'&&seatFree(x));if(fr.length>2){const st=pick(fr);seatTake(st,b);b.seat=st;dest={x:st.x,z:st.z};}else{const a=Math.random()*6.3;dest={x:SH.x+Math.cos(a)*5.4,z:SH.z+Math.sin(a)*5.4};}}else{b.goal='shop';dest={x:SHOP.x-Math.cos(Math.atan2(SHOP.z,SHOP.x))*3+rand(-2,2),z:SHOP.z-Math.sin(Math.atan2(SHOP.z,SHOP.x))*3+rand(-2,2)};}
  const p=b.c.o.position;b.path=(Math.hypot(p.x,p.z)<LR+2?[{x:b.deck?b.deck.entry.x:p.x,z:b.deck?b.deck.entry.z:p.z}]:[]).concat(ringRoute(b.deck&&Math.hypot(p.x,p.z)<LR+2?b.deck.entry.x:p.x,b.deck&&Math.hypot(p.x,p.z)<LR+2?b.deck.entry.z:p.z,dest.x,dest.z));}
function makeBots(){const n=Math.min(BOT_NAMES.length,Math.max(0,Math.min(50,+CFG.bots||9))),own=n>9?DECKS-1:Math.min(6,DECKS-1);for(let i=0;i<n;i++){const KO=[1,9,4,21,2,13,5,24,8,10,3,27,6,16,7,22,0,11,12,14,15,17,18,19,20,23,25,26,28,29,30].filter(x=>x<KINDS.length),ki=KO[i%KO.length];const c=makeChar(ki,BOT_NAMES[i]);const deck=i<own?decks[i+1]:null;if(deck)deck.owner=BOT_NAMES[i];
  const _a=Math.random()*6.3,st=deck?deck.entry:{x:SH.x+Math.cos(_a)*rand(5.2,6.5),z:SH.z+Math.sin(_a)*rand(5.2,6.5)};c.o.position.set(st.x,H(st.x,st.z),st.z);
  const tank=[];for(let k=0;k<3+(Math.random()*4|0);k++){const f=rollFish(D.RODS[1+(i%3)],D.BAITS[0]);f.price=Math.round(f.v*rand(1.1,1.6));f.sale=true;tank.push(f);}
  for(let k=0;k<1+(i%2);k++)tank.push(comboFish());setCharRod(c,D.RODS[[1,2,3,4,5,0,6,2,7][i%9]%D.RODS.length].k,i%3);
  bots.push({c,deck,path:[],wait:rand(0,4),goal:null,tank,chat:rand(4,14),fishT:0,tdes:(D.TANKS[1+(i%5)]||D.TANKS[0]).design});}}
// v5: 조합용 어종을 봇이 판매 (유저 간 거래 유도). 등급은 낮을수록 흔함
function comboFish(){const c=pick(D.COMBO.list),k=pick(c.ks),f=FI(k),bd=[f.min,...f.g,f.max];let x=Math.random(),g=x<.45?0:x<.75?1:x<.92?2:x<.99?3:4;const cm=Math.round((bd[g]+(bd[g+1]-bd[g])*rand(.05,.95))*10)/10,gg=gradeOf(f,cm),v=valueOf(f,cm,gg);return {id:S.nid++,k,cm,g:gg,v,price:Math.round(v*rand(1.2,1.8)),sale:true,combo:1};}
let restockT=60;function botRestock(dt){restockT-=dt;if(restockT>0)return;restockT=rand(70,120);const b=pick(bots.filter(b=>b.deck));if(b&&b.tank.length<10){b.tank.push(comboFish());}}
function updBots(dt,T){for(const b of bots){const c=b.c,p=c.o.position;b.chat-=dt;if(b.chat<0){b.chat=rand(10,24);if(Math.random()<.3)emote(c.name,pick(['😊','👍','🐟','❤️','😴','🎉']),false);else say(c.name,pick(LINES));}
  if(b.path.length){const t=b.path[0],dx=t.x-p.x,dz=t.z-p.z,l=Math.hypot(dx,dz);if(l<.25){b.path.shift();continue;}const s=Math.min(l,dt*3.2);p.x+=dx/l*s;p.z+=dz/l*s;{const fx=p.x-SH.x,fz=p.z-SH.z,fr=Math.hypot(fx,fz),FR=1.75;if(fr<FR&&fr>1e-3){const sg=(fx*dz-fz*dx)>0?1:-1;p.x=SH.x+fx/fr*FR-fz/fr*s*sg;p.z=SH.z+fz/fr*FR+fx/fr*s*sg;}}c.dir=Math.atan2(dx,dz);c.play('walk');c.rod.visible=false;
    if(!b.path.length){b.wait=b.goal==='fish'?rand(25,45):rand(8,18);if(b.goal==='fish'&&b.deck)c.dir=b.seat?Math.atan2(-p.x,-p.z):b.deck.a;if(b.goal==='rest'){c.dir=Math.atan2(SH.x-p.x,SH.z-p.z);}if(b.seat){p.x=b.seat.x;p.z=b.seat.z;}}}
  else{b.wait-=dt;if(b.goal==='fish'){c.play(b.seat?'sit':'holding-right');c.rod.visible=true;b.fishT-=dt;if(b.fishT<0){b.fishT=rand(10,20);if(Math.random()<.6){const f=rollFish(D.RODS[1],D.BAITS[0]);f.price=Math.round(f.v*rand(1.1,1.6));f.sale=true;b.tank.push(f);if(b.tank.length>8)b.tank.shift();if(f.g>=2)say(c.name,`${FI(f.k).n} ${f.cm}cm (${GR(f.g).n}) 낚았어요! 🎉`);}}}
    else if(b.goal==='rest'){c.play(b.seat?'sit':'idle');}else c.play('idle');if(b.wait<0)botGoal(b);}
  p.y=b.seat&&!b.path.length?b.seat.y:inDeck(p.x,p.z)?.39:Math.max(H(p.x,p.z),.1);turn(c,dt);}}
function turn(c,dt){let d=((c.dir-c.o.rotation.y)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;c.o.rotation.y+=d*Math.min(1,dt*10);}
// 봇이 내 어항 물고기를 사는 시뮬레이션
let buyT=rand(...D.BOT_BUY_INTERVAL);
function botBuy(dt){buyT-=dt;if(buyT>0)return;buyT=rand(...D.BOT_BUY_INTERVAL);const forSale=S.tank.filter(f=>f.sale&&!f.lock);if(!forSale.length)return;const b=pick(bots);
  for(const f of forSale){const r=f.price/f.v,p=r<=1?.85:r<=1.5?.45:r<=2.5?.12:0;if(Math.random()<p){S.tank=S.tank.filter(x=>x.id!==f.id);S.coins+=f.price;S.earned+=f.price;b.tank.push(Object.assign({},f,{price:Math.round(f.price*1.2)}));save();hud();sfx.coin();
    toast(`💰 ${b.c.name}님이 ${FI(f.k).n} ${f.cm}cm를<br>${f.price.toLocaleString()}코인에 구매했어요!`,2600);say('시스템',`${b.c.name}님이 내 ${FI(f.k).n}(${GR(f.g).n})를 ${f.price}코인에 구매`);if($('tank').classList.contains('show'))tankView.refresh();return;}}
  if(Math.random()<.3)say(b.c.name,'어항 구경 잘 했어요~ 가격이 좀 비싸네요 😅');}
// ───────── 낚시 ─────────
function canFishAt(d){return d&&(d.i===0||!d.owner);}
function fishAction(auto){if(!auto&&anyModal())return;if(!auto&&S.autoFish){if(!fishAction._t||performance.now()-fishAction._t>2500){fishAction._t=performance.now();miniToast('🤖 자동 낚시 중이에요 · 직접 낚으려면 자동 OFF',1800);}return;}
  if(fishing.state==='off'){if(!auto){document.querySelectorAll('.cutin').forEach(e=>e.remove());const t=$('toast');clearTimeout(t._t);t.style.transition='none';t.style.opacity=0;void t.offsetWidth;t.style.transition='';}if(!nearSpot)return toast(DW?'데크 의자에 앉아야 낚시할 수 있어요<br><small>의자 가까이 가서 🪑 앉기</small>':'데크 끝 낚시 포인트로 가세요<br><small>내 데크 또는 빈 데크</small>');
    if(S.tank.length>=cap())toast('어항이 가득 찼어요! 잡으면 상점가 60%로 자동 판매돼요',2000);
    const b=bait(),MO=SYS.mods(D,S,rod(),b);if(S.baits[S.bait]>0&&Math.random()<MO.ch.bait/100){toast('🧿 미끼전문가: 미끼를 아꼈어요!',900);}else if(S.baits[S.bait]>0){S.baits[S.bait]--;if(S.baits[S.bait]===0){toast(b.n+' 소진 → 지렁이로 교체');S.bait='worm';}save();hud();}
    fishing={state:'cast',t:0,bite:Math.max(D.BITE.min,rand(D.BITE.base[0],D.BITE.base[1])*MO.wait*(V14?V14.fx.waitMul():1))*(S.autoFish?D.AUTO.waitMul:1),fakes:fakeTimes(),d:nearSpot};castT=0;castTo.set(nearSpot.ca*(LR-12.5)+rand(-1.5,1.5)*-nearSpot.sa,-.05,nearSpot.sa*(LR-12.5)+rand(-1.5,1.5)*nearSpot.ca);me.dir=Math.atan2(castTo.x-me.o.position.x,castTo.z-me.o.position.z);sfx.cast();return;}
  if(fishing.state==='cast'||fishing.state==='bite'){if(fishing.state==='bite')catchFish();else{toast('앗, 너무 빨랐어요! 찌가 살짝 흔들렸을 뿐이에요 🎣',1300);sfx.fail();endFish();}}}
function endFish(){fishing={state:'off'};castT=-1;bob.visible=line.visible=false;wU.bob.value.y=0;}
function setMB(id,ic,lab){const b=$(id);if(!b)return;const k=ic+'|'+lab;if(b._k===k)return;b._k=k;const kb=b.querySelector('kbd');b.innerHTML=`<b class="mi">${ic}</b><small class="ml">${lab}</small>${kb?kb.outerHTML:''}`;}
// v9 낚시 성공 카드 (설정: D 메달형 기본 / C 등급 헤더 / B 가로 스트립 / A 미니멀)
function catchCard(f,F,G0,o){const st=S.cardStyle||'d',v='🪙 '+f.v.toLocaleString(),chip=`<span class="cc-chip">${G0.n}</span>`,im=`<img class="fi" src="${F.img}" alt="">`;
 const bd=`${o.isNew?'<span class="cc-bd new">✨ 첫 획득</span>':''}${o.rec&&!o.isNew?'<span class="cc-bd rec">📏 최대 기록</span>':''}${o.newG&&!o.isNew?'<span class="cc-bd ng">🏅 새 등급</span>':''}`;
 const where=`<div class="cc-w">${o.where}</div>`;let h;
 if(st==='a')h=`<div class="cc A">${im}<div class="nm">${F.n} ${chip}</div><div class="cm">${f.cm}<small>cm</small></div><div class="v">${v}</div><div class="bds">${bd}</div>${where}</div>`;
 else if(st==='b')h=`<div class="cc B">${im}<div class="m"><div class="nm">${F.n} ${chip}</div><div class="s">${bd||o.where}</div></div><div class="r"><div class="cm">${f.cm}cm</div><div class="v">${v}</div></div></div>`;
 else if(st==='c')h=`<div class="cc C"><div class="hd">${G0.n}</div><div class="bdy">${im}<div class="nm">${F.n}</div><div class="bds">${bd}</div><div class="kv"><div><small>크기</small><b>${f.cm}cm</b></div><div><small>가치</small><b class="v">${v}</b></div></div>${where}</div></div>`;
 else h=`<div class="cc D"><div class="md">${im}</div>${o.isNew?'<div class="rib">NEW</div>':''}${o.rec&&!o.isNew?'<div class="rib rec">기록!</div>':''}<div class="nm">${F.n} ${chip}</div><div class="ln"><span class="cm">${f.cm}cm</span><span class="v">${v}</span></div>${where}</div>`;
 return `<div class="ccw" style="--g:${G0.c}">${h}</div>`;}
// ───────── v10 낚시 10회 상자 진행 · 자동 낚시 · 수집 목표 · 어항 테마 ─────────
function updStreak(){let el=$('streak');if(!el){const st=$('mStat');if(!st)return;el=document.createElement('div');el.id='streak';el.className='pill';el.title='낚시 '+D.BOX.streakEvery+'회마다 행운 상자 1개';st.insertBefore(el,$('equip'));}
  const n=S.streak||0,N=D.BOX.streakEvery,C=D.BOX.dailyCap,g=(S.gDay===new Date().toDateString()?S.gN:0)||0,full=C&&g>=C,k=n+'|'+g;if(el._n===k)return;el._n=k;el.title=`낚시 성공 ${N}회마다 선물 상자 1개 · 하루 최대 ${C}개`;el.classList.toggle('full',!!full);el.innerHTML=full?`<span class="sk-i">🎁</span><b>선물 ${C}/${C} 완료</b>`:`<span class="sk-i">🎁</span><span class="sk-bar"><i style="width:${n/N*100}%"></i></span><b>${n}/${N}</b><small class="sk-d">${g}/${C}</small>`;}
const autoOK=()=>(D.AUTO.gate!=='sub'||S.sub===true)&&lvAutoOK();
function updAutoBtn(){const b=$('bAutoFish');if(!b)return;const on=!!S.autoFish,k=on+'|'+autoOK();if(b._k===k)return;b._k=k;b.classList.toggle('on',on);b.innerHTML=`<b class="mi">🤖</b><small class="ml">자동 ${on?'ON':'OFF'}</small>`;b.classList.toggle('lk',!lvAutoOK());b.title=!lvAutoOK()?`자동 낚시: Lv.${LV.auto}에 열려요`:autoOK()?'자동 낚시: 캐스팅→입질→릴링 자동 (효율 약 80%)':'자동 낚시는 구독 전용이에요';}
let autoCD=0;
function autoTick(dt){if(!S.autoFish)return;autoCD-=dt;
  if(fishing.state==='off'){if(!nearSpot){if(autoCD<=0){if(!anyModal())toast('🤖 자동 낚시: 데크 끝으로 가면 시작해요',1400);autoCD=4;}return;}if(autoCD<=0){autoCD=rand(.6,1);fishAction(true);}}}
function toggleAuto(){if(!lvAutoOK()){toast(`🔒 자동 낚시는 Lv.${LV.auto}에 열려요<br><small>지금 Lv.${myLv()} · 레벨 배지를 누르면 보상 로드</small>`,2200);return;}if(!autoOK()){toast('🔒 자동 낚시는 구독 전용 기능이에요',1600);return;}S.autoFish=!S.autoFish;autoCD=.8;save();updAutoBtn();
  toast(S.autoFish?`🤖 <b>자동 낚시 ON</b><br><small>입질 대기시간 ×${D.AUTO.waitMul} · 희귀 어종 ×${D.AUTO.rareMul} · 자동판매 ${S.auto&&S.auto.on?'적용 중 (가치 '+S.auto.th+' 미만)':'꺼짐(설정에서 켜기)'}</small>`:'🤖 자동 낚시 OFF',1800);}
function checkGoals(){S.goals=S.goals||{};const nw=D.GOALS.filter(g=>!S.goals[g.id]&&SYS.goalDone(D,S,g));if(!nw.length)return;
  nw.forEach((g,i)=>{S.goals[g.id]=Date.now();const r=g.r;setTimeout(()=>addXP(100+Math.min(400,Math.round((r.co||0)/50+(r.bx||0)*50+(r.st||0)*10)),'수집 목표 「'+g.n+'」'),i*2700+600);S.coins+=r.co||0;S.stones=(S.stones||0)+(r.st||0);for(let j=0;j<(r.bx||0);j++)S.boxes.push(Date.now());if(r.th){S.themes=S.themes||['mint'];if(!S.themes.includes(r.th))S.themes.push(r.th);}
    setTimeout(()=>{V14.goalFx(g.n,'',rwTxt(r),'goal');sfx.coin();say('시스템',`🎯 ${NICK()}님이 수집 목표 「${g.n}」 달성!`);},i*2700+300);});save();hud();}
const rwTxt=r=>[r.co?'🪙 '+r.co.toLocaleString():'',r.st?'💎 강화석 '+r.st:'',r.bx?'🎁 상자 '+r.bx:'',r.th?'🖼️ 어항 테마 「'+D.TANK_THEMES.find(t=>t.k===r.th).n+'」':''].filter(Boolean).join(' · ');
let goalCat='전체';
function renderGoals(){const same=renderDex._t===dexTab;renderDex._t=dexTab;return same?keepScroll('dex',_renderGoals):_renderGoals();}
function _renderGoals(){S.goals=S.goals||{};const cats=['전체','세트','도감','누적','등급'],L=D.GOALS.filter(g=>goalCat==='전체'||g.cat===goalCat),done=D.GOALS.filter(g=>S.goals[g.id]).length,TH=S.themes||['mint'];
 $('dex').innerHTML=`<div class="card" style="width:min(1000px,95vw)"><button class="close" data-close="dex">×</button><div class="tabs dtabs"><button data-dtab="dex">📖 도감</button><button data-dtab="ach">🏆 업적·패시브</button><button class="on" data-dtab="goal">🎯 수집 목표</button></div>
 <h2>🎯 수집 목표 <small class="pill">${done}/${D.GOALS.length} 달성</small></h2><p class="small muted">도감 세트를 등급별로 모으고 누적 목표를 채우면 코인·강화석·상자·어항 테마를 받아요. 달성 즉시 자동 지급!</p>
 <div class="gthemes"><b>🖼️ 어항 테마</b>${D.TANK_THEMES.map(t=>{const has=TH.includes(t.k);return `<button class="gth ${has?'':'lock'} ${(S.tankTheme||'mint')===t.k?'on':''}" data-theme="${t.k}" ${has?'':'disabled'} style="--a:${t.top};--b:${t.bot}"><i></i>${t.n}${has?'':' 🔒'}</button>`;}).join('')}</div>
 <div class="tabs gcats">${cats.map(c=>`<button class="${c===goalCat?'on':''}" data-gcat="${c}">${c}</button>`).join('')}</div>
 <div class="glist">${L.map(g=>{const [a,b]=SYS.goalProg(D,S,g),ok=!!S.goals[g.id];return `<div class="goal ${ok?'done':''}"><div class="gi">${ok?'✅':g.cat==='세트'?['🐟','🌟','👑'][g.lv-1]:g.cat==='도감'?'📖':g.cat==='누적'?'🎣':'🌟'}</div><div class="gm"><b>${g.n}</b><div class="small muted">${g.d}${g.ks?' · '+g.ks.map(k=>{const dx=S.dex[k],h=dx&&dx.gr.some((v,i)=>v&&i>=g.minG);return `<span class="${h?'gk on':'gk'}">${dx?FI(k).n:'???'}</span>`;}).join(''):''}</div><div class="gbar"><i style="width:${a/b*100}%"></i></div></div><div class="gr"><div class="small">${a}/${b}</div><div class="grw">${rwTxt(g.r)}</div></div></div>`;}).join('')}</div></div>`;$('dex').querySelector('[data-close]').onclick=()=>closeM('dex');dexTabs();}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-gcat],[data-theme]');if(!t)return;if(t.dataset.gcat){goalCat=t.dataset.gcat;renderGoals();}else if(t.dataset.theme&&!t.disabled){S.tankTheme=t.dataset.theme;save();renderGoals();toast('🖼️ 어항 테마: '+D.TANK_THEMES.find(x=>x.k===S.tankTheme).n,1200);}});
const _thTex={};function themeBg(k){const T=D.TANK_THEMES.find(t=>t.k===k)||D.TANK_THEMES[0];if(_thTex[T.k])return _thTex[T.k];if(T.paint){const cv=document.createElement('canvas');cv.width=cv.height=512;T.paint(cv.getContext('2d'),512,512);const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return _thTex[T.k]=t;}const cv=document.createElement('canvas');cv.width=16;cv.height=256;const x=cv.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,T.top);g.addColorStop(1,T.bot);x.fillStyle=g;x.fillRect(0,0,16,256);
  if(T.stars){cv.width=256;const x2=cv.getContext('2d'),g2=x2.createLinearGradient(0,0,0,256);g2.addColorStop(0,T.top);g2.addColorStop(1,T.bot);x2.fillStyle=g2;x2.fillRect(0,0,256,256);x2.fillStyle='#fff';for(let i=0;i<70;i++){x2.globalAlpha=Math.random()*.8+.2;x2.fillRect(Math.random()*256,Math.random()*170,1.5,1.5);}}
  const t=new THREE.CanvasTexture(cv);t.encoding=THREE.sRGBEncoding;return _thTex[T.k]=t;}
// ───────── v11: 어항 정렬 · 미니 토스트 · 가짜 입질 · 강화 돌파 표 · 어종별 랭킹 · 채팅 탭 ─────────
const TSORT=[['new','최근순'],['vhi','가격 높은순'],['vlo','가격 낮은순'],['ghi','등급 높은순'],['glo','등급 낮은순']];
function rodOptTxt(s){const a=[];if(s.speed<1)a.push(`⚡빠른입질 ${((1-s.speed)*100).toFixed(1)}%`);if(s.size>1)a.push(`📏대어 ${((s.size-1)*100).toFixed(1)}%`);if(s.luck>0)a.push(`🌟희귀어종 ${(s.luck*1000).toFixed(0)}%`);return a.length?a.join(' · '):'옵션 없음';}
function tankSorted(L){const k=S.tankSort||'new';if(k==='new')return L;const a=L.slice();const v=f=>f.v||0;
  if(k==='vhi')a.sort((x,y)=>v(y)-v(x));if(k==='vlo')a.sort((x,y)=>v(x)-v(y));if(k==='ghi')a.sort((x,y)=>y.g-x.g||v(y)-v(x));if(k==='glo')a.sort((x,y)=>x.g-y.g||v(x)-v(y));return a;}
function miniToast(h,ms=2500){let w=$('miniT');if(!w){w=document.createElement('div');w.id='miniT';document.body.appendChild(w);}const e=document.createElement('div');e.className='mt';e.innerHTML=h;w.appendChild(e);while(w.children.length>3)w.firstChild.remove();setTimeout(()=>{e.classList.add('out');setTimeout(()=>e.remove(),400);},ms);}
function fakeTimes(){const n=Math.random()<D.BITE.fake?(Math.random()<.35?2:1):0,a=[];for(let i=0;i<n;i++)a.push(rand(2.5,9));return a.sort((x,y)=>x-y);}
function enhBtTable(lv){const E=D.ENH;if(!E.bt)return '';return `<div class="btrow">${E.bt.map(b=>`<div class="bt ${lv>=b.lv?'on':''}"><b>${b.n}</b><small>${b.d}</small></div>`).join('')}</div>`;}
// 어종별 최대 크기 랭킹 (서버=현재 방의 봇+나, 전체=가상 서버 3곳 합산). 봇 기록은 이름·어종으로 고정 시드 생성
function seedR(str){let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return ()=>((h=Math.imul(h^(h>>>13),1597334677)>>>0)/4294967296);}
const RK_NAMES=['붕어왕','물멍러','밤낚시꾼','잉어사랑','찌맞춤','초보강태공','호수산책','손맛중독','은빛여울','새벽입질','낚시하는곰','월척꿈나무','바람의찌','모래무지씨','고요한호수','릴감는소리','물안개','별밤조사','떡밥장인','강준치헌터'];
// ───────── v12: 주간 랭킹(월 00:00 KST 초기화) · 트로피 카드형 UI ─────────
const KST=9*3600e3;function wkStart(t=Date.now()){const d=new Date(t+KST),day=(d.getUTCDay()+6)%7;return Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate()-day)-KST;}
const wkId=t=>new Date(wkStart(t)+KST).toISOString().slice(0,10);
function wkRoll(){const id=wkId();if(!S.wk){S.wk={id,best:{}};Object.keys(S.dex||{}).forEach(k=>{});}if(S.wk.id!==id){S.wkPrev={id:S.wk.id,best:S.wk.best,ranks:{}};Object.keys(S.wk.best).forEach(k=>{const L=fishRank(k,'srv',S.wkPrev);const m=L.find(x=>x.me);if(m)S.wkPrev.ranks[k]=m.rk;});S.wk={id,best:{}};save();}}
function wkRec(f){wkRoll();const b=S.wk.best[f.k];if(!b||f.cm>b.cm)S.wk.best[f.k]={cm:f.cm,g:f.g};}
function leftTxt(){const ms=wkStart()+7*864e5-Date.now(),d=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4);return d?`${d}일 ${h}시간`:h?`${h}시간 ${m}분`:`${m}분`;}
function fishRank(k,scope,wk){const f=FI(k),L=[],W=wk||S.wk||{id:wkId(),best:{}};const base=scope==='all'?RK_NAMES.concat(RK_NAMES.map(n=>n+'#2'),RK_NAMES.map(n=>n+'#3')):bots.map(b=>b.c.name).concat(RK_NAMES.slice(0,12));
  [...new Set(base)].forEach(n=>{const r=seedR(n+'|'+k+'|'+W.id);if(r()<.25)return;const q=Math.pow(r(),.7);const cm=Math.round((f.min+(f.max-f.min)*(.3+.66*q))*10)/10;L.push({n:n.replace(/#\d/,''),cm,srv:n.includes('#')?'낚멍-'+n.slice(-1):'낚멍-1',g:gradeOf(f,cm)});});
  const b=W.best[k];if(b)L.push({n:NICK(),cm:b.cm,me:true,srv:'낚멍-1',g:b.g});L.sort((a,b)=>b.cm-a.cm);L.forEach((x,i)=>x.rk=i+1);return L;}
let frScope='srv';
function openFishRank(k){wkRoll();const f0=FI(k),f=S.dex[k]?f0:Object.assign({},f0,{n:'???',img:f0.img.replace('.png','_sil.png')}),prev=frScope==='prev',W=prev?S.wkPrev:S.wk;
 let ov=$('frank');if(!ov){ov=document.createElement('div');ov.id='frank';ov.className='modal';document.body.appendChild(ov);}
 const L=W?fishRank(k,prev?'srv':frScope,W):[],me=L.find(x=>x.me),third=L[2],allTime=(S.dex[k]||{}).max;
 const gb=g=>`<span class="gbadge" style="--gc:${GR(Math.max(0,g)).c}">${GR(Math.max(0,g)).n}</span>`;
 const srv=x=>frScope==='all'?`<small class="fr-srv">${x.srv}</small>`:'';
 const sp=()=>Array.from({length:6},(_,i)=>`<i class="fr-sp" style="left:${8+i*15+Math.random()*6}%;top:${15+Math.random()*60}%;animation-delay:${(i*.3).toFixed(1)}s"></i>`).join('');
 const card=x=>`<div class="fr-tc t${x.rk} ${x.me?'me':''}">${x.rk===1?sp():''}<div class="fr-medal m${x.rk}">${x.rk}</div><div class="fr-nm">${x.n}${x.me?' <small>(나)</small>':''}<br>${gb(x.g)}${srv(x)}</div><div class="fr-cm">${x.cm}<small>cm</small></div></div>`;
 const row=x=>`<div class="fr-row ${x.me?'me':''}"><div class="fr-n">${x.rk}</div><div class="fr-nm">${x.n}${x.me?' <small>(나)</small>':''}${srv(x)}</div>${gb(x.g)}<div class="fr-cm">${x.cm}cm</div></div>`;
 const m3=`<span class="fr-medal m3 mini">3</span>`;
 const gap=!W?`<div class="fr-gap">지난주 기록이 아직 없어요 · 이번 주가 첫 시즌이에요</div>`:me?(me.rk<=3?`<div class="fr-gap">🎉 ${prev?'지난주':'이번 주'} <b>${me.rk}위</b>${prev?'로 마감했어요':'! 월요일 0시까지 지켜보세요'}</div>`:`<div class="fr-gap">${m3}${prev?'지난주 3위와':'3위까지'} <b>${Math.round((third.cm-me.cm)*10)/10}cm</b> ${prev?'차이였어요':'남았어요'} · 내 기록 ${me.cm}cm (${me.rk}위)</div>`):`<div class="fr-gap">${prev?'지난주에는 이 어종 기록이 없어요':`이번 주 기록이 아직 없어요 · 3위 기록 <b>${third?third.cm:'-'}cm</b>에 도전!`}</div>`;
 ov.innerHTML=`<div class="card fr-card"><button class="close" id="frClose">×</button><div class="fr-head"><img src="${f.img}"><div><h2>${f.n} 주간 최대 크기 랭킹</h2><div class="small muted">${prev?`지난주 (${S.wkPrev?S.wkPrev.id:''} 시작) 최종 기록`:`⏳ 초기화까지 <b>${leftTxt()}</b> · 매주 월요일 0시(한국시간)`}${allTime?` · 내 역대 최고 ${allTime}cm`:''}</div></div></div>
 <div class="tabs"><button class="${frScope==='srv'?'on':''}" data-frs="srv">🏠 내 서버</button><button class="${frScope==='all'?'on':''}" data-frs="all">🌏 전체 서버</button><button class="${prev?'on':''}" data-frs="prev">📜 지난주</button></div>
 <div class="fr-list">${L.length?`<div class="fr-tops">${L.slice(0,3).map(card).join('')}</div>${L.slice(3,10).map(row).join('')}`:''}</div>
 <div class="fr-mine">${me&&me.rk>10?row(me):''}${gap}</div></div>`;
 ov.classList.add('show');$('frClose').onclick=()=>ov.classList.remove('show');ov.onclick=e=>{if(e.target===ov)ov.classList.remove('show');};
 ov.querySelectorAll('[data-frs]').forEach(b=>b.onclick=()=>{frScope=b.dataset.frs;openFishRank(k);});}
// ───────── v12: 어항 조합 보관함 (조합에 쓰인 물고기는 어항과 분리 보관) ─────────
const comboKs=()=>[...new Set(D.COMBO.list.flatMap(c=>c.ks))];
const better=(a,b)=>!b||a.g>b.g||(a.g===b.g&&a.cm>b.cm);
function cslotInit(){if(S.cslot)return;S.cslot={};comboKs().forEach(k=>{const c=S.tank.filter(f=>f.k===k).sort((a,b)=>b.g-a.g||b.cm-a.cm)[0];if(c){S.cslot[k]=c;S.tank=S.tank.filter(x=>x!==c);c.sale=false;}});}
function cslotUp(f){return comboKs().includes(f.k)&&S.cslot[f.k]&&better(f,S.cslot[f.k]);}
function cslotSwap(id){const f=S.tank.find(x=>x.id==id);if(!f||!comboKs().includes(f.k))return;const old=S.cslot[f.k];S.tank=S.tank.filter(x=>x!==f);f.sale=false;S.cslot[f.k]=f;if(old)S.tank.push(old);save();toast(`🧩 조합 보관함 교체: ${FI(f.k).n} ${f.cm}cm (${GR(f.g).n})${old?`<br><small>기존 ${old.cm}cm는 어항으로 돌아갔어요</small>`:''}`,2000);}
document.addEventListener('click',e=>{const c=e.target.closest&&e.target.closest('[data-frank]');if(c&&$('dex').contains(c))openFishRank(c.dataset.frank);});
(function chatTabs(){const ch=$('chat');if(!ch||$('chTabs'))return;const t=document.createElement('div');t.id='chTabs';t.innerHTML=[['all','전체'],['chat','대화'],['sys','시스템']].map(([k,n],i)=>`<button data-chf="${k}" class="${i?'':'on'}">${n}</button>`).join('');ch.insertBefore(t,ch.firstChild);
 t.onclick=e=>{const b=e.target.closest('[data-chf]');if(!b)return;t.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));ch.dataset.f=b.dataset.chf;$('log').scrollTop=1e6;};})();
// ───────── v13: 상자 획득 알림 · 스크롤 유지 · 서버 1~3위 닉네임(D) ─────────
function boxGot(kind){const n=S.boxes.length;S.newBox=(S.newBox||0)+1;updBagBadge();
 const el=document.createElement('div');el.className='boxget '+(kind==='gift'?'gift':'');el.innerHTML=`<div class="bg-rays"></div><img src="img/box/t3.png" alt=""><div class="bg-t"><b>${kind==='gift'?`선물 상자 도착! <small>오늘 ${S.gN}/${D.BOX.dailyCap}</small>`:'행운 상자 획득!'}</b><small>가방에서 열 수 있어요 · 보유 ${n}개</small></div>`;
 document.body.appendChild(el);setTimeout(()=>el.classList.add('out'),2600);setTimeout(()=>el.remove(),3100);
 if(snd.ctx&&snd.on){[784,988,1175,1568].forEach((f,i)=>tone(f,f*1.01,.35,'triangle',.07,i*.08));tone(2093,2093,.6,'sine',.04,.34);}}
function updBagBadge(){const b=$('bBag');if(!b)return;const n=S.newBox||0;if(n)b.dataset.new=n>9?'9+':n;else delete b.dataset.new;b.classList.toggle('hasnew',!!n);}
function keepScroll(id,fn){const m=$(id);const sv=m?[...m.querySelectorAll('*')].filter(e=>e.scrollTop>0).map(e=>[e.className+'|'+(e.id||''),e.scrollTop]):[];const r=fn();
 if(m&&sv.length){const all=[...m.querySelectorAll('*')];sv.forEach(([k,t])=>{const e=all.find(x=>x.className+'|'+(x.id||'')===k);if(e)e.scrollTop=t;});}return r;}
// 서버 1~3위: 이번 주 어종별 기록 점수(크기/최대 합) 상위 3명 → 닉네임 메달+글로우 (시안 D)
let RK3={},rk3T=0;function calcRK3(){const sc={};D.FISH.forEach(f=>{fishRank(f.k,'srv').forEach(x=>{const k=x.me?'__me':x.n;sc[k]=(sc[k]||0)+x.cm/f.max;});});
 const top=Object.entries(sc).sort((a,b)=>b[1]-a[1]).slice(0,3);RK3={};top.forEach(([k],i)=>RK3[k]=i+1);}
function tagRank(c){if(S.rankTag===false)return 0;return RK3[c===me?'__me':c.name]||0;}
function catchFish(){const f=rollFish(),F=FI(f.k),G0=GR(f.g);S.caught++;const _td=new Date().toDateString();if(S.gDay!==_td){S.gDay=_td;S.gN=0;}let streakBox=false;if(!(D.BOX.dailyCap&&S.gN>=D.BOX.dailyCap)){S.streak=(S.streak||0)+1;if(D.BOX.streakEvery&&S.streak>=D.BOX.streakEvery){S.streak=0;S.gN=(S.gN||0)+1;S.boxes.push(-Date.now());streakBox=true;}}const dx=S.dex[f.k]||(S.dex[f.k]={n:0,max:0,gr:[0,0,0,0,0]});const isNew=!dx.n,newG=!dx.gr[f.g],rec=f.cm>dx.max;dx.n++;dx.gr[f.g]=1;dx.max=Math.max(dx.max,f.cm);wkRec(f);S.stats=S.stats||{g:[0,0,0,0,0]};S.stats.g[f.g]=(S.stats.g[f.g]||0)+1;
  let where;const AU=S.auto;cslotInit();if(comboKs().includes(f.k)&&!S.cslot[f.k]){S.cslot[f.k]=f;where='🧩 조합 보관함에 보관했어요 (어항 칸 차지 안 함)';}
  else if(AU.on&&f.v<AU.th&&!(AU.keepNew&&isNew)){const p=sellP(f);S.coins+=p;S.earned+=p;where=`⚙ 자동판매 (가치 ${f.v} < ${AU.th}) +${p}코인`;}
  else if(S.tank.length<cap()){S.tank.push(f);where='🐠 내 어항에 넣었어요';}else{const p=sellP(f);S.coins+=p;where=`어항이 가득 차서 ${p}코인에 판매`;}
  const bc=SYS.mods(D,S,rod(),bait()).box*(S.autoFish?D.AUTO.boxMul:1)*(V14?V14.fx.boxMul():1)*(V14?V14.evMul().box:1);if(Math.random()<bc){S.boxes.push(Date.now());setTimeout(()=>boxGot('luck'),S.autoFish?900:1400);say('시스템','🎁 행운 상자 획득!');}
  if(streakBox)setTimeout(()=>boxGot('gift'),1600);setTimeout(checkGoals,600);save();hud();V14.catchSfx(f.g);V14.reelFx(f);me.reelT=.7;me.rod.visible=true;endFish();
  if(S.autoFish)autoCD=2.6;if(anyModal())miniToast(`${f.g<2?'🐟':'✨'} <b>${F.n}</b> ${f.cm}cm · <span style="color:${G0.c}">${G0.n}</span> · 🪙${f.v.toLocaleString()}`);else if(f.g<3)toast(catchCard(f,F,G0,{isNew,newG,rec,where}),S.autoFish?2500:3200);
  say('시스템',`${F.n} ${f.cm}cm (${G0.n})를 낚았어요! · ${where}`);if(f.g>=3)legendAlert(NICK(),f,true,{isNew,rec});achCheck(true);xpCatch(f,F,isNew);}
function achCheck(t){try{const C=SYS.passives(D,S).combo||[];S.lvCombo=S.lvCombo||[];C.forEach((x,i)=>{const id=x.id||x.n||String(i);if(x.on&&!S.lvCombo.includes(id)){S.lvCombo.push(id);if(S.v21b)addXP(80,'어항 조합 완성');}});S.v21b=1;}catch(e){}const A=SYS.passives(D,S).ach.filter(a=>a.done).map(a=>a.a.id);if(!S.achSeen){S.achSeen=A;return;}A.filter(x=>!S.achSeen.includes(x)).forEach((id,j)=>{const a=D.ACH.find(x=>x.id===id);if(t)setTimeout(()=>{V14.goalFx(a.n,'',effTxt(a.e),'ach');addXP(150,'업적 「'+a.n+'」');say('시스템',`🏆 업적 '${a.n}' 달성 (${effTxt(a.e)})`);},4200+j*900);});S.achSeen=A;}
const effTxt=e=>Object.entries(e).map(([k,v])=>`${D.CHARM.opts[k].n} +${v}%`).join(', ');
// ───────── 어항 관찰 뷰 (별도 3D 씬) ─────────
function comboPanel(mine,L){cslotInit();const st=SYS.comboState(D,Object.values(S.cslot)),M=D.COMBO.mult;
 if(mine)return `<details class="combo" ${(tankView.comboOpen==null?st.some(x=>x.on):tankView.comboOpen)?'open':''}><summary>🧩 어항 조합 패시브 <small>(${st.filter(x=>x.on).length}/${st.length} 활성)</small></summary><div class="small muted">조합에 쓰인 물고기는 <b>조합 보관함</b>에 따로 보관돼요(어항 칸 차지 안 함, 판매 불가) · 더 좋은 개체가 오면 🔄 교체 · 어종을 모두 모으면 발동 · 효과 = 기본 × 조합 내 <b>최저 등급</b> 배율 (${D.GRADES.map((g,i)=>g.n+' ×'+M[i]).join(' · ')}) · 패시브 상한은 업적과 합산</div>${st.map(x=>`<div class="crow ${x.on?'on':''}" style="--gc:${x.on?GR(x.lv).c:'#ccc'}"><b>${x.c.n}</b> <span class="small">${x.have}/${x.c.ks.length}</span><div class="cks2">${x.c.ks.map(k=>{const sf=S.cslot[k],up=S.tank.filter(f=>f.k===k&&better(f,sf)).sort((a,b)=>b.g-a.g||b.cm-a.cm)[0];return `<div class="cslot ${sf?'h':''}" style="--gc:${sf?GR(sf.g).c:'#ddd'}"><img src="${FI(k).img}" class="${sf?'':'sil'}"><b>${FI(k).n}</b><small>${sf?`${GR(sf.g).n} · ${sf.cm}cm`:'비어 있음'}</small>${up?`<button class="cswap" data-cswap="${up.id}" title="${GR(up.g).n} ${up.cm}cm로 교체">🔄 ${GR(up.g).n} ${up.cm}cm</button>`:''}</div>`;}).join('')}</div><div class="small">${x.on?`✅ ${GR(x.lv).n} 조합 · ${effTxt(x.e)}`:`기본 ${effTxt(x.c.e)} → 신화 조합 시 ×${M[4]}`}</div></div>`).join('')}</details>`;
 const need=new Set();st.forEach(x=>{if(!x.on||x.lv<4)x.c.ks.forEach((k,i)=>{if(x.best[i]<4)need.add(k);});});const n=L.filter(f=>f.sale&&need.has(f.k)).length;
 return n?`<div class="combo small">🧩 내 어항 조합에 쓸 수 있는 물고기 <b>${n}</b>마리 판매 중 (🧩 표시)</div>`:'';}
const tankView={r:null,open(owner){this.owner=owner;if(owner&&owner!=='me')try{xpSocial();}catch(e){}openM('tank');if(!this.r)this.init();this.build();this.refresh();this.on=true;},close(){this.on=false;},
 init(){const cv=$('tankCv');this.r=new THREE.WebGLRenderer({canvas:cv,antialias:true});this.r.setPixelRatio(Math.min(devicePixelRatio,1.5));this.r.outputEncoding=THREE.sRGBEncoding;
  const s=this.s=new THREE.Scene();s.background=new THREE.Color('#e9f6f4');this.cam=new THREE.PerspectiveCamera(40,1,.1,50);const dl=new THREE.DirectionalLight(0xfff2dd,.8);dl.position.set(2,5,3);s.add(new THREE.HemisphereLight(0xffffff,0x9ac6c0,1),dl);
  const W=4,Hh=2.4,Dp=2;this.box={W,H:Hh,D:Dp};this.root=new THREE.Group();s.add(this.root);this.ext=new THREE.Group();this.root.add(this.ext);this.decoG=new THREE.Group();this.root.add(this.decoG);this.zoom=1;
  const deco=(k,x,z,sc,ry=0)=>{if(!G[k])return;const o=G[k].scene.clone();o.position.set(x,.18,z);o.scale.setScalar(sc);o.rotation.y=ry;this.decoG.add(o);};
  deco('rock_largeA',-1.2,-.4,1.6,.5);deco('rock_smallC',1.3,.3,1.8);deco('stone_largeA',.6,-.6,1.2,1);deco('grass_leafsLarge',-1.5,.4,3);deco('grass_leafs',1.6,-.6,3);deco('plant_flatTall',-.3,-.7,3.4);deco('plant_flatTall',1.0,-.75,2.8,1);deco('mushroom_tanGroup',-.8,.6,1.6);
  this.fishG=new THREE.Group();this.root.add(this.fishG);this.yaw=0;this.dragging=null;
  const pts=new Map();let pd0=0,down=null;cv.addEventListener('pointerdown',e=>{this.dragging=e.clientX;pts.set(e.pointerId,e);down={x:e.clientX,y:e.clientY,t:performance.now()};if(pts.size===2){const [a,b]=[...pts.values()];pd0=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);}});
  addEventListener('pointerup',e=>{this.dragging=null;const was=pts.size;pts.delete(e.pointerId);if(down&&was===1&&e.target===cv&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<6&&performance.now()-down.t<350)this.toggleBig();down=null;});
  cv.addEventListener('wheel',e=>{e.preventDefault();this.zoom=Math.min(1.6,Math.max(.5,this.zoom*(e.deltaY>0?1.08:1/1.08)));},{passive:false});
  cv.addEventListener('pointermove',e=>{if(pts.has(e.pointerId))pts.set(e.pointerId,e);if(pts.size===2){const [a,b]=[...pts.values()],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);if(pd0){this.zoom=Math.min(1.6,Math.max(.5,this.zoom*pd0/d));}pd0=d;this.dragging=null;down=null;}});
  cv.addEventListener('pointermove',e=>{if(this.dragging!=null){this.yaw-=(e.clientX-this.dragging)*.006;this.dragging=e.clientX;}});
  this.bub=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(90).map((v,i)=>i%3==1?Math.random()*2.2:(Math.random()-.5)*(i%3?1.8:3.8)),3)),new THREE.PointsMaterial({color:'#ffffff',size:.05,transparent:true,opacity:.7}));this.root.add(this.bub);},
 list(){return this.owner==='me'?S.tank:this.owner.tank;},
 toggleBig(){const t=$('tank');t.classList.toggle('big');const b=$('tankBig');if(b)b.textContent=t.classList.contains('big')?'↙ 원래대로':'⤢ 크게 보기';},
 sizeF(){if(this.owner!=='me')return 1;const i=Math.max(0,D.TANKS.findIndex(t=>t.k===S.tankK));return [.95,1.1,1.25,1.42,1.6,1.8][i]||1;},
 build(){const des=this.owner==='me'?D.TANKS.find(t=>t.k===S.tankK).design:(this.owner.tdes||3);if(this.des!==des&&window.NK_TANKX){this.des=des;this.ext.clear();const cyl=des===3,x=NK_TANKX(des,cyl?{W:2.9,H:2.4,D:2.9,y0:0,sh:1.2}:{W:4,H:2.4,D:2,y0:0,sh:1.2});this.ext.add(x.g);this.box=cyl?{W:2.1,H:2.4,D:2.1}:{W:4,H:2.4,D:2};this.decoG.scale.set(cyl?.62:1,1,cyl?1.1:1);}
  this.sf=this.sizeF();this.root.scale.setScalar(this.sf);this.fishG.clear();this.fish=[];const fm=G.fish.scene;for(const f of this.list()){const F=FI(f.k),o=fm.clone(true);o.traverse(m=>{if(m.isMesh)m.material=new THREE.MeshLambertMaterial({color:F.col,flatShading:true,emissive:new THREE.Color(GR(f.g).c),emissiveIntensity:f.g>=3?.25:0});});
   const sc=(1.6+f.cm/100*7*(f.k==='snakehead'?.8:1))/Math.pow(this.sf||1,.55);o.scale.set(sc*(f.k==='snakehead'?1.5:f.k==='eel'?2.2:f.k==='gangjunchi'||f.k==='trout'?1.25:1),sc,sc);const{W,H,D:Dp}=this.box;o.position.set(rand(-W/2+.5,W/2-.5),rand(.5,H*.8),rand(-Dp/2+.4,Dp/2-.4));this.fishG.add(o);
   this.fish.push({o,f,t:o.position.clone(),v:new THREE.Vector3(rand(-.2,.2),0,rand(-.1,.1)),sp:rand(.25,.55),spT:rand(2,5),pause:0,ph:Math.random()*6,yaw:0,wig:0});}},
 refresh(){const mine=this.owner==='me',L=tankSorted(this.list()),side=$('tankSide');if(this.s)this.s.background=mine?themeBg(S.tankTheme||'mint'):new THREE.Color('#e9f6f4');
  const _st=side.scrollTop;
  side.innerHTML=`<h2>${mine?'🐠 내 어항':'🐠 '+this.owner.c.name+'님의 어항'}</h2><div class="muted small">${mine?`${L.length}/${cap()}칸 · 판매 등록하면 다른 유저(봇)가 구매할 수 있어요`:`보유 코인 🪙${S.coins.toLocaleString()} · 내 어항 ${S.tank.length}/${cap()}`}</div><div style="height:8px"></div>`+(L.length>1?`<div class="tsort"><span class="small muted">정렬</span>${TSORT.map(([k,n])=>`<button class="${(S.tankSort||'new')===k?'on':''}" data-tsort="${k}">${n}</button>`).join('')}</div>`:'')+comboPanel(mine,L)+
   (L.length?'':'<p class="muted">아직 물고기가 없어요. 낚시를 해보세요!</p>')+L.map(f=>{const F=FI(f.k),g=GR(f.g);return `<div class="fcard ${f.lock?'locked':''}" style="--gc:${g.c}" data-id="${f.id}">${f.lock?'<span class="lockbadge" title="잠금됨">🔒</span>':''}<img src="${F.img}"><div class="meta"><b>${F.n}</b> <span class="gbadge" style="--gc:${g.c}">${g.n}</span>${mine&&cslotUp(f)?` <button class="ctag2" data-cswap="${f.id}" data-tip="조합 보관함의 ${S.cslot[f.k].cm}cm(${GR(S.cslot[f.k].g).n})보다 좋아요">🧩🔄 조합 교체</button>`:''}<br>${f.cm}cm · 가치 🪙${f.v.toLocaleString()}<br>`+
   (mine?`<button class="lockb ${f.lock?'on':''}" data-lock="${f.id}" title="잠금: 판매·등록·자동판매 불가">${f.lock?'🔒 잠금됨':'🔓 잠금'}</button> 판매가 <input type="number" min="1" value="${f.price}" data-price="${f.id}" ${f.lock?'disabled':''}> <label><input type="checkbox" data-sale="${f.id}" ${f.sale?'checked':''} ${f.lock?'disabled':''}> 판매중</label><br><button data-sell="${f.id}" ${f.lock?'disabled':''}>상점에 팔기 🪙${sellP(f)}</button>`
   :`판매가 🪙<b>${f.price.toLocaleString()}</b> <button class="acc" data-buy="${f.id}" ${S.coins<f.price||S.tank.length>=cap()?'disabled':''}>구매</button>`)+`</div></div>`;}).join('');
  side.scrollTop=_st;{const dc=side.querySelector('details.combo');if(dc)dc.ontoggle=()=>{tankView.comboOpen=dc.open;};}
  side.querySelectorAll('[data-cswap]').forEach(b=>b.onclick=e=>{e.stopPropagation();cslotSwap(b.dataset.cswap);this.build();this.refresh();});
  side.querySelectorAll('[data-tsort]').forEach(b=>b.onclick=()=>{S.tankSort=b.dataset.tsort;save();this.refresh();});
  side.querySelectorAll('[data-price]').forEach(i=>i.onchange=()=>{const f=S.tank.find(x=>x.id==i.dataset.price);f.price=Math.max(1,Math.round(+i.value||1));save();});
  side.querySelectorAll('[data-lock]').forEach(b=>b.onclick=()=>{const f=S.tank.find(x=>x.id==b.dataset.lock);f.lock=!f.lock;if(f.lock)f.sale=false;save();this.refresh();});
  side.querySelectorAll('[data-sale]').forEach(i=>i.onchange=()=>{S.tank.find(x=>x.id==i.dataset.sale).sale=i.checked;save();});
  side.querySelectorAll('[data-sell]').forEach(b=>b.onclick=()=>{const f=S.tank.find(x=>x.id==b.dataset.sell);S.tank=S.tank.filter(x=>x!==f);const p=sellP(f);S.coins+=p;sfx.coin();save();hud();this.build();this.refresh();});
  side.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{const L2=this.owner.tank,f=L2.find(x=>x.id==b.dataset.buy);if(S.coins<f.price||S.tank.length>=cap())return;S.coins-=f.price;this.owner.tank=L2.filter(x=>x!==f);
   const nf=Object.assign({},f,{id:S.nid++,sale:false,price:Math.round(f.v*1.3)});S.tank.push(nf);const dx=S.dex[f.k]||(S.dex[f.k]={n:0,max:0,gr:[0,0,0,0,0]});dx.gr[f.g]=1;dx.n++;dx.max=Math.max(dx.max,f.cm);
   save();hud();sfx.coin();toast(`🛍 ${FI(f.k).n} ${f.cm}cm 구매 완료!<br><small>도감에도 기록됐어요</small>`);say(this.owner.c.name,'구매 감사합니다~ 😊');this.build();this.refresh();});
  side.querySelectorAll('.fcard').forEach(c=>c.onmouseenter=()=>{const x=this.fish.find(q=>q.f.id==c.dataset.id);if(x)x.hl=1.5;});},
 frame(dt,T){if(!this.on)return;const cv=this.r.domElement,w=cv.clientWidth,h=cv.clientHeight;if(cv.width!==Math.floor(w*this.r.getPixelRatio())){this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix();}
  {const sf=this.sf||1,dist=(3.6+3.1*sf)*this.zoom*Math.max(1,1.45/this.cam.aspect);this.cam.position.set(Math.sin(this.yaw)*dist,2.2*sf*Math.max(.6,this.zoom),Math.cos(this.yaw)*dist);this.cam.lookAt(0,1.05*sf,0);}const{W,H,D:Dp}=this.box;
  for(const x of this.fish){const p=x.o.position,lim=[W/2-.45,H*.86,Dp/2-.32];
   // 목표 갱신·속도 변화·가끔 멈춤
   x.spT-=dt;if(x.spT<0){x.spT=rand(2,5);x.sp=rand(.2,.6);}
   if(x.pause>0)x.pause-=dt;else if(p.distanceTo(x.t)<.3){x.t.set(rand(-lim[0],lim[0]),rand(.45,lim[1]),rand(-lim[2],lim[2]));if(Math.random()<.25)x.pause=rand(1,3);}
   const want=V.subVectors(x.t,p).normalize().multiplyScalar(x.pause>0?0.03:x.sp);want.y*=.5;
   // 벽 회피 (가까울수록 반대 방향으로 밀어냄)
   const av=(c,lo,hi)=>c<lo+.35?(lo+.35-c)*3:c>hi-.35?-(c-hi+.35)*3:0;want.x+=av(p.x,-lim[0]-.1,lim[0]+.1);want.y+=av(p.y,.3,lim[1]+.1);want.z+=av(p.z,-lim[2]-.1,lim[2]+.1);
   const st=want.sub(x.v),mf=.9*dt;if(st.length()>mf)st.setLength(mf);x.v.add(st);p.addScaledVector(x.v,dt);
   p.x=THREE.MathUtils.clamp(p.x,-lim[0]-.1,lim[0]+.1);p.y=THREE.MathUtils.clamp(p.y,.3,lim[1]+.1);p.z=THREE.MathUtils.clamp(p.z,-lim[2]-.1,lim[2]+.1);
   const sp=x.v.length(),hv=Math.hypot(x.v.x,x.v.z);
   // 모델 머리 = -X 방향 → 진행방향으로 머리가 향하도록
   if(hv>.02){const ty=Math.atan2(x.v.z,-x.v.x);let dd=((ty-x.yaw)%(Math.PI*2)+Math.PI*3)%(Math.PI*2)-Math.PI;x.yaw+=dd*Math.min(1,dt*4);}
   x.wig+=dt*(4+sp*18);const wig=Math.sin(x.wig+x.ph)*(.05+sp*.22);
   x.o.rotation.set(0,x.yaw+wig,-Math.atan2(x.v.y,hv+1e-3)*.7);
   if(x.pause>0)p.y+=Math.sin(T*2+x.ph)*.0015;}
  const bp=this.bub.geometry.attributes.position;for(let i=0;i<bp.count;i++){let y=bp.getY(i)+dt*.4;if(y>2.15)y=.2;bp.setY(i,y);}bp.needsUpdate=true;this.r.render(this.s,this.cam);}};
// ───────── 상점 ─────────
let shopTab='rod';
function renderShop(){return keepScroll('shop',_renderShop);}
function _renderShop(){const it=(x,owned,eq,price,onb,extra='')=>`<div class="item">${x._ico||''}<h4>${x.n}</h4><div class="small muted">${x.desc||extra}</div><div class="p">${price<0?'<span class="boxonly">🎁 행운 상자 전용</span>':price?'🪙 '+price.toLocaleString():'무료'}</div>${onb}</div>`;
  let body='';
  if(shopTab==='rod')body=D.RODS.map(r0=>{const r=Object.assign({},r0,{_ico:RIMG(r0.k,'sico')});const n=S.gear.filter(g=>g.k===r.k).length,eq=rod().k===r.k;return it(r,n,eq,r.boxOnly?-1:r.price,`<div class="small">보유 ${n}개${eq?' · 장착중':''} · 추가옵션 ${D.GEAR.slots[r.k]}슬롯</div>${lvRodOK(r.k)?'':`<span class="lvreq">🔒 Lv.${LV.rods[r.k]} 착용</span> `}${r.boxOnly?'<span class="small muted">희귀 이상 상자에서 획득</span>':`<button class="acc" data-buyrod="${r.k}" ${S.coins<r.price||(!r.price&&n)?'disabled':''}>${n?'추가 구매 (합성 재료)':'구매'}</button>`}${n&&!eq&&lvRodOK(r.k)?` <button class="ok" data-eqrod="${r.k}">장착</button>`:''}`,'');}).join('')+`<p class="small muted" style="grid-column:1/-1">황금·별빛·용왕 낚싯대는 행운 상자(희귀 이상)에서만 나와요. 상점 구매품은 ‘고급’ 등급 밴드(품질 ${D.GEAR.qBand[1].map(x=>Math.round(x*100)).join('~')}%)로 굴려지고, 추가옵션이 새로 굴려져요. 같은 낚싯대 2개 → 🎒 가방 › 장비·합성에서 ★ 합성</p>`;
  if(shopTab==='bait')body=D.BAITS.map(b0=>{const b=Object.assign({},b0,{_ico:BIMG(b0.k,'sico')});const q=S.baits[b.k],own=q===-1||q>0,eq=S.bait===b.k;return it(b,own,eq,b.price,`<div class="small">보유: ${q===-1?'∞':q||0}</div>`+(lvBaitOK(b.k)?'':`<span class="lvreq">🔒 Lv.${LV.baits[b.k]}</span> `)+(eq?'<button disabled>사용중</button>':own?`<button class="ok" data-eqbait="${b.k}">사용</button>`:'')+(b.price&&q!==-1?` <button class="acc" data-buybait="${b.k}" ${S.coins<b.price?'disabled':''}>구매${b.qty?' ×'+b.qty:''}</button>`:''));}).join('');
  if(shopTab==='tank')body=D.TANKS.map(t=>{const own=S.tanks.includes(t.k),eq=S.tankK===t.k;return it(t,own,eq,t.price,eq?'<button disabled>사용중</button>':own?`<button class="ok" data-eqtank="${t.k}" ${S.tank.length>t.cap?'disabled':''}>교체</button>`:`<button class="acc" data-buytank="${t.k}" ${S.coins<t.price?'disabled':''}>구매</button>`,`수용량 ${t.cap}마리`);}).join('');
  if(shopTab==='sell')body=S.tank.length?S.tank.map(f=>{const F=FI(f.k),g=GR(f.g);return `<div class="fcard" style="--gc:${g.c}"><img src="${F.img}"><div class="meta"><b>${F.n}</b> <span class="gbadge" style="--gc:${g.c}">${g.n}</span> ${f.cm}cm</div>${f.lock?'<button disabled>🔒 잠금</button>':`<button data-sell="${f.id}">🪙${sellP(f)}</button>`}</div>`;}).join(''):'<p class="muted">팔 물고기가 없어요</p>';
  if(shopTab==='bal')body=balanceTable();
  $('shop').innerHTML=`<div class="card" style="width:min(900px,94vw)"><button class="close" data-close="shop">×</button><h2>🛒 호숫가 작은 상점 <span class="pill small">🪙 ${S.coins.toLocaleString()}</span></h2>
   <div class="tabs">${[['rod','🎣 낚싯대'],['bait','🪱 미끼'],['tank','🐠 어항'],['sell','💰 판매'],['bal','📊 밸런스표']].map(([k,n])=>`<button class="${shopTab===k?'on':''}" data-tab="${k}">${n}</button>`).join('')}</div><div class="${shopTab==='bal'||shopTab==='sell'?'':'grid'}">${body}</div></div>`;
  const q=s=>$('shop').querySelectorAll(s);q('[data-close]').forEach(b=>b.onclick=()=>closeM('shop'));q('[data-tab]').forEach(b=>b.onclick=()=>{shopTab=b.dataset.tab;renderShop();});
  const buy=p=>{if(S.coins<p)return false;S.coins-=p;sfx.coin();return true;},done=()=>{save();hud();renderShop();};
  q('[data-buyrod]').forEach(b=>b.onclick=()=>{const r=D.RODS.find(x=>x.k===b.dataset.buyrod);if(buy(r.price)){const g=SYS.makeGear(D,r.k,S.nid++);S.gear.push(g);if(!S.rods.includes(r.k))S.rods.push(r.k);const cur=rod();if(lvRodOK(r.k)&&D.RODS.findIndex(x=>x.k===r.k)>D.RODS.findIndex(x=>x.k===cur.k)){S.rodId=g.id;S.rod=r.k;}toast(`🎣 ${r.n} 구매! 품질 ${(g.q*100).toFixed(1)}%${g.extra.length?' · '+g.extra.map(e=>D.CHARM.opts[e.k].n+' +'+e.v+'%').join(', '):''}`,2600);}done();});
  q('[data-eqrod]').forEach(b=>b.onclick=()=>{const g=S.gear.filter(x=>x.k===b.dataset.eqrod).sort((a,c)=>c.star-a.star||c.enh-a.enh||c.q-a.q)[0];if(g){S.rodId=g.id;S.rod=g.k;}done();});
  q('[data-buybait]').forEach(b=>b.onclick=()=>{const x=D.BAITS.find(y=>y.k===b.dataset.buybait);if(!lvBaitOK(x.k)){toast(`🔒 ${x.n}은(는) Lv.${LV.baits[x.k]}부터 쓸 수 있어요`,2000);return;}if(buy(x.price)){S.baits[x.k]=x.qty?(Math.max(0,S.baits[x.k]||0)+x.qty):-1;S.bait=x.k;toast('🪱 '+x.n+' 구매!');}done();});
  q('[data-eqbait]').forEach(b=>b.onclick=()=>{if(!lvBaitOK(b.dataset.eqbait)){toast(`🔒 Lv.${LV.baits[b.dataset.eqbait]}부터 쓸 수 있어요`,2000);return;}S.bait=b.dataset.eqbait;done();});
  q('[data-buytank]').forEach(b=>b.onclick=()=>{const t=D.TANKS.find(x=>x.k===b.dataset.buytank);if(buy(t.price)){S.tanks.push(t.k);S.tankK=t.k;toast('🐠 '+t.n+' 설치! ('+t.cap+'칸)');}done();});
  q('[data-eqtank]').forEach(b=>b.onclick=()=>{S.tankK=b.dataset.eqtank;done();});
  q('[data-sell]').forEach(b=>b.onclick=()=>{const f=S.tank.find(x=>x.id==b.dataset.sell);S.tank=S.tank.filter(x=>x!==f);S.coins+=sellP(f);sfx.coin();done();});}
function balanceTable(){return `<h4>등급 기준 (cm)</h4><table class="bal"><tr><th>어종</th>${D.GRADES.map(g=>`<th style="color:${g.c}">${g.n}</th>`).join('')}<th>기본가</th></tr>`+
  D.FISH.map(f=>{const b=[f.min,...f.g,f.max];return `<tr><td>${f.n}</td>${D.GRADES.map((g,i)=>`<td>${b[i]}~${b[i+1]}</td>`).join('')}<td>${f.base}</td></tr>`;}).join('')+`</table>
  <p class="small muted">가격 = 기본가 × (크기/최소크기)^1.5 × 등급배수(${D.GRADES.map(g=>g.n+'×'+g.m).join(', ')}) · 상점 판매는 60%</p>
  <h4>낚싯대</h4><table class="bal"><tr><th>이름</th><th>가격</th><th>빠른입질</th><th>대어</th><th>희귀어종</th><th>옵션 슬롯</th></tr>${D.RODS.map(r=>`<tr><td>${r.n}</td><td>${r.price||'상자'}</td><td>${r.speed<1?'-'+Math.round((1-r.speed)*100)+'%':'–'}</td><td>${r.size>1?'+'+Math.round((r.size-1)*100)+'%':'–'}</td><td>${r.luck?'+'+Math.round(r.luck*1000)+'%':'–'}</td><td>${r.slotN||'–'}${r.k==='dragon'?' (랜덤 1)':''}</td></tr>`).join('')}</table>
  <h4>미끼</h4><table class="bal"><tr><th>이름</th><th>가격</th><th>수량</th><th>입질</th><th>크기</th><th>어종 보너스</th></tr>${D.BAITS.map(b=>`<tr><td>${b.n}</td><td>${b.price}</td><td>${b.qty||'∞'}</td><td>×${b.speed}</td><td>×${b.size}</td><td>${Object.entries(b.boost).map(([k,v])=>FI(k).n+'×'+v).join(', ')||'-'}</td></tr>`).join('')}</table>
  <h4>어항</h4><table class="bal"><tr><th>이름</th><th>가격</th><th>수용</th></tr>${D.TANKS.map(t=>`<tr><td>${t.n}</td><td>${t.price}</td><td>${t.cap}</td></tr>`).join('')}</table>`+balanceV3()+balanceV5();}
function balanceV5(){const C=D.CHARM,T=D.BOX.tiers,G=D.GEAR,O=C.opts,pc=x=>Math.round(x*100),SM=window.NK_SIM;
 return `<h4>🎁 v5 상자 등급별 옵션 밴드 (높은 등급 = 평균·상한 ↑)</h4><table class="bal"><tr><th>항목</th>${T.map(t=>`<th style="color:${t.c}">${t.n}</th>`).join('')}</tr>
 <tr><td>부적 옵션 (cap 대비)</td>${C.band.map(b=>`<td>${pc(b[0])}~${pc(b[1])}%<br><small>평균 ${pc((b[0]+b[1])/2)}%</small></td>`).join('')}</tr>
 <tr><td>부적 옵션 수</td>${C.tierOpts.map(n=>`<td>${n}</td>`).join('')}</tr>
 <tr><td>낚싯대 기본 품질</td>${G.qBand.map(b=>`<td>${pc(b[0])}~${pc(b[1])}%</td>`).join('')}</tr>
 <tr><td>낚싯대 추가옵션 (cap 대비)</td>${G.xBand.map(b=>`<td>${pc(b[0])}~${pc(b[1])}%</td>`).join('')}</tr>
 <tr><td>상자 낚싯대 풀</td>${D.BOX.rodPool.map(p=>`<td><small>${p.map(k=>D.RODS.find(r=>r.k===k).n.replace(' 낚싯대','')).join(', ')}</small></td>`).join('')}</tr>
 <tr><td>합성 (→다음 등급)</td>${T.map((t,i)=>`<td>${i>=5?C.synth.mythNeed+'개→신화':C.synth.need+'개'}<br><small>🪙${C.synth.coin[i].toLocaleString()}</small></td>`).join('')}</tr></table>
 <p class="small muted">상점 구매 낚싯대 = '고급' 밴드. 예) 행운 cap ${O.luck.cap}% → 일반 ${R1x(O.luck.cap*C.band[0][0])}~${R1x(O.luck.cap*C.band[0][1])}% / 신화 ${R1x(O.luck.cap*C.band[5][0])}~${O.luck.cap}%</p>
 <h4>🏆 도감 업적 패시브 (${D.ACH.length}개)</h4><table class="bal"><tr><th>업적</th><th>조건</th><th>보상</th></tr>${D.ACH.map(a=>`<tr><td>${a.n}</td><td>${a.d}</td><td>${effTxt(a.e)}</td></tr>`).join('')}</table>
 <h4>🧩 어항 조합 패시브 (최저 등급 배율 ${D.COMBO.mult.map((m,i)=>GR(i).n+'×'+m).join(' · ')})</h4><table class="bal"><tr><th>조합</th><th>어종</th><th>일반</th><th>신화</th></tr>${D.COMBO.list.map(c=>`<tr><td>${c.n}</td><td>${c.ks.map(k=>FI(k).n).join('+')}</td><td>${effTxt(c.e)}</td><td>${Object.entries(c.e).map(([k,v])=>O[k].n+' +'+R1x(v*D.COMBO.mult[4])+'%').join(', ')}</td></tr>`).join('')}</table>
 <h4>🛡 패시브 상한 (업적+조합 합산, 부적 상한과 별도)</h4><table class="bal"><tr>${Object.keys(O).map(k=>`<th>${O[k].n}</th>`).join('')}</tr><tr>${Object.keys(O).map(k=>`<td>${D.PASSIVE.cap[k]}%</td>`).join('')}</tr></table>`+(SM&&SM.v5?`<h4>📈 v5 시뮬레이션</h4><table class="bal"><tr><th>구성</th><th>코인/회</th><th>기본 대비</th><th>희귀+</th><th>전설+</th><th>상자</th></tr>${SM.v5.map(r=>`<tr><td>${r.name}</td><td>${r.coin.toFixed(0)}</td><td>×${r.x.toFixed(2)}</td><td>${(r.rare*100).toFixed(1)}%</td><td>${(r.leg*100).toFixed(1)}%</td><td>${(r.box*100).toFixed(2)}%</td></tr>`).join('')}</table>`:'');}
function balanceV3(){const C=D.CHARM,T=D.BOX.tiers,E=D.ENH,SM=window.NK_SIM;
 return `<h4>🎁 행운 상자 (낚시 성공 1회당 ${D.BOX.base*100}%)</h4><table class="bal"><tr><th>상자 등급</th>${T.map(t=>`<th style="color:${t.c}">${t.n}</th>`).join('')}</tr><tr><td>확률</td>${T.map(t=>`<td>${t.w}%</td>`).join('')}</tr><tr><td>부적 옵션 수</td>${C.tierOpts.map(n=>`<td>${n}</td>`).join('')}</tr><tr><td>옵션 상한 배수</td>${C.tierMul.map(n=>`<td>${Math.round(n*100)}%</td>`).join('')}</tr><tr><td>강화석(20%)</td>${D.BOX.stones.map(n=>`<td>${n}</td>`).join('')}</tr><tr><td>동봉 코인</td>${D.BOX.coins.map(n=>`<td>${n}</td>`).join('')}</tr></table>
 <h4>🧿 행운 부적 옵션 상한 (부적 1개 / 6개+장비 합산)</h4><table class="bal"><tr><th>옵션</th><th>분류</th><th>효과</th>${T.map(t=>`<th style="color:${t.c}">${t.n}</th>`).join('')}<th>합산 상한</th></tr>${Object.entries(C.opts).map(([k,o])=>`<tr><td>${o.n}</td><td>${o.cat}</td><td class="small">${o.d}</td>${C.tierMul.map(m=>`<td>${Math.round(o.cap*m*10)/10}%</td>`).join('')}<td><b>${o.total}%</b></td></tr>`).join('')}</table>
 <p class="small muted">각 옵션은 (등급 상한)의 40~100% 범위에서 굴림 (신화는 75~100%). 같은 옵션 중복 장착 시 합산 상한에서 잘림. 최대 ${C.slots}개 장착. 분해: 🪙${D.CHARM.dismantle.coin.join('/')} · 💎${D.CHARM.dismantle.stone.join('/')}</p>
 <h4>⚒ 낚싯대 강화 (+0 ~ +${E.max})</h4><table class="bal"><tr><th>시도</th>${E.rate.map((r,i)=>`<th>+${i}→${i+1}</th>`).join('')}</tr><tr><td>성공률</td>${E.rate.map(r=>`<td>${r}%</td>`).join('')}</tr><tr><td>강화석</td>${E.rate.map((r,i)=>`<td>${E.stone(i)}</td>`).join('')}</tr><tr><td>코인</td>${E.rate.map((r,i)=>`<td>${E.coin(i).toLocaleString()}</td>`).join('')}</tr><tr><td>실패 시</td>${E.rate.map((r,i)=>`<td>${E.failTxt?E.failTxt(i):i>=E.dropFrom?'50% 하락':'유지'}</td>`).join('')}</tr></table>
 <p class="small muted">단계당 크기 +${E.size*100}% · 빠른입질 +${E.speed*100}% (+10: 크기 +${E.size*1000}%, 빠른입질 +${E.speed*1000}%) · 파괴 없음 · 강화석은 구매 불가 · 돌파: ${(E.bt||[]).map(b=>b.n+' '+b.d).join(' / ')}</p>`+
 `<h4>🎣 장비(낚싯대) 옵션·합성</h4><table class="bal"><tr><th>낚싯대</th><th>기본 추가옵션 슬롯</th><th>추가옵션 크기(부적 신화 상한 대비)</th><th>최대 슬롯(★4)</th><th>합성 비용 ★0→1 / ★4→5</th></tr>${D.RODS.map((r,i)=>`<tr><td>${r.n}</td><td>${D.GEAR.slots[r.k]}</td><td>${Math.round(D.GEAR.mul[r.k]*100)}% × 40~100%</td><td>${D.GEAR.slots[r.k]+D.GEAR.starSlot.length}</td><td>${D.GEAR.synthCoin(i,0).toLocaleString()} / ${D.GEAR.synthCoin(i,4).toLocaleString()}</td></tr>`).join('')}</table>
 <p class="small muted">기본옵션은 표기 수치 고정 · 합성 ★당 기본옵션 +${D.GEAR.starBonus*100}% · 품질 +2%(최대 115%) · 추가옵션 ×${D.GEAR.starUp} · 추가옵션 풀: ${D.GEAR.pool.map(k=>D.CHARM.opts[k].n).join(', ')} (부적과 합산 상한 공유)<br>강화석 강화(+): 장비 1개에 귀속, 크기·입질 보정 · 합성(★): 같은 장비 2개 소모, 기본옵션·추가옵션 보정 → 두 축이 곱으로 적용</p>`+(SM?`<h4>📈 인플레이션 시뮬레이션 (각 20만 회 낚시, 전량 상점 판매 가정)</h4><table class="bal"><tr><th>구성</th><th>코인/회</th><th>코인/시간</th><th>기본 대비</th><th>희귀+</th><th>전설+</th><th>상자</th></tr>${SM.rows.map(r=>`<tr><td>${r.name}</td><td>${r.coin.toFixed(0)}</td><td>${Math.round(r.perHour).toLocaleString()}</td><td>×${r.x.toFixed(2)}</td><td>${(r.rare*100).toFixed(1)}%</td><td>${(r.leg*100).toFixed(1)}%</td><td>${(r.box*100).toFixed(2)}%</td></tr>`).join('')}</table>
 <p class="small muted">+10 강화 기대 비용: 시도 ${SM.enh.tries.toFixed(0)}회 · 강화석 ${SM.enh.stones.toFixed(0)}개 · 코인 ${Math.round(SM.enh.coins).toLocaleString()} (+강화석 구매 시 ${Math.round(SM.enh.stoneCoin).toLocaleString()}) → 최종 장비 대비 강력한 코인 소각처</p>`:'');}
// ───────── v3: 가방(상자·부적·강화) / 설정(저장·프로필·자동판매·그래픽) ─────────
const TIER=i=>D.BOX.tiers[i];
const charmHTML=c=>`<div class="charm" data-cid="${c.id}" style="--gc:${TIER(c.tier).c}"><div class="cico">${CIMG(c.tier)}</div><div class="meta"><span class="gbadge" style="--gc:${TIER(c.tier).c}">${TIER(c.tier).n} 부적</span>${c.lock?' 🔒':''}<br>${c.opts.map(o=>`<span class="opt" data-tip="${optTip(o.k,c.tier)}">${D.CHARM.opts[o.k].n} <b>+${o.v}%</b></span>`).join(' ')}</div>`;
const gearHTML=(g,btns='')=>{const s=SYS.gearStats(D,g),sl=SYS.slotCount(D,g);return `<div class="charm gear" style="--gc:${['#aab4c0','#5fc48a','#4ea3ea','#3fb8b0','#ef8fb0','#f4a62a','#4a5ab8','#c46cf2'][D.RODS.findIndex(r=>r.k===g.k)]}"><div class="cico">${RIMG(g.k)}</div><div class="meta"><b>${s.n}</b> <span class="star">${'★'.repeat(g.star)}<i>${'☆'.repeat(D.GEAR.starMax-g.star)}</i></span> <span class="plus">+${g.enh}</span>${g.id===S.rodId?' <span class="gbadge" style="--gc:#5fc48a">장착중</span>':''}${g.lock?' 🔒':''}<br>
 <span class="small">기본: ${rodOptTxt(s)}${D.GEAR.fixedBase?'':` · 품질 ${(g.q*100).toFixed(1)}%`}</span><br>${g.extra.map(e=>`<span class="opt" data-tip="${D.CHARM.opts[e.k].n}: ${D.CHARM.opts[e.k].d}
낚싯대 추가옵션 (상자 등급 ${TIER(g.tier||1).n} 굴림) · 범위 ${D.GEAR.optRange?D.GEAR.optRange(g,e.k).join('~'):''}%">${D.CHARM.opts[e.k].n} <b>+${e.v}%</b></span>`).join(' ')}${Array(Math.max(0,sl-g.extra.length)).fill('<span class="opt muted">빈 슬롯</span>').join('')}${sl<D.GEAR.slots[g.k]+D.GEAR.starSlot.length?`<span class="opt muted">🔒 ★${D.GEAR.starSlot.find(x=>x>g.star)} 해금</span>`:''}</div>${btns}</div>`;};
const rewardHTML=(o,t)=>(o.bonus?'<div class="small">✨ 보물감정 추가 보상!</div>':'')+(o.type==='charm'?charmHTML(o.c)+'</div>':o.type==='rod'?gearHTML(o.g):o.type==='bait'?`<div class="charm" style="--gc:${t.c}"><div class="cico">${BIMG(o.k)}</div><div class="meta">${D.BAITS.find(b=>b.k===o.k).n} <b>×${o.n}</b></div></div>`:`<div class="charm" style="--gc:${t.c}"><div class="cico">💎</div><div class="meta">강화석 <b>×${o.st}</b> + 🪙 <b>${o.co}</b></div></div>`);
const RIMG=(k,cls='rimg')=>`<img class="${cls}" src="img/rods/${k}.png" alt="" draggable="false">`,BIMG=(k,cls='rimg')=>`<img class="${cls}" src="img/baits/${k}.png" alt="" draggable="false">`;
const CIMG=t=>`<img class="cimg" src="img/charms/t${t}.png" alt="" draggable="false">`;
const BOXTINT=['grayscale(.75) brightness(1.08)','hue-rotate(80deg) saturate(.9)','hue-rotate(185deg) saturate(1.1)','hue-rotate(255deg) saturate(1.2)','sepia(.5) saturate(2) brightness(1.08)','hue-rotate(280deg) saturate(1.5) brightness(1.12) drop-shadow(0 0 6px #e9b6ff)'];
const BOXIMG=(t,cls='bimg')=>{const d=S.boxDesign||1;return d===1?`<img class="${cls}" src="img/box/t${t}.png" alt="" draggable="false">`:`<img class="${cls}" src="img/box/d${d}.png" style="filter:${BOXTINT[t]}" alt="" draggable="false">`;};
const optTip=(k,tier)=>{const o=D.CHARM.opts[k],b=D.CHARM.band[tier];return `${o.n}: ${o.d}\n${TIER(tier).n} 등급 범위 ${R1x(o.cap*b[0])}% ~ 최대 ${R1x(o.cap*b[1])}%\n(합산 상한 ${o.total}%${D.PASSIVE.cap[k]?` · 패시브 별도 +${D.PASSIVE.cap[k]}%까지`:''})`;};
const R1x=v=>Math.round(v*10)/10;
let bagTab='box',disT=1,synFx=null,CF={opt:'',tier:-1,only:''};let CSEL=null,CSWAP=null;
const disOf=c=>({co:D.CHARM.dismantle.coin[c.tier],st:D.CHARM.dismantle.stone[c.tier]});
function openBag(){S.newBox=0;updBagBadge();renderBag();openM('bag');}
function confirmBox(html,ok){const m=$('confirm');m.innerHTML=`<div class="card center" style="width:min(420px,92vw)">${html}<p><button id="cfNo">취소</button> <button class="acc" id="cfYes">확인</button></p></div>`;m.classList.add('show');$('cfNo').onclick=()=>m.classList.remove('show');$('cfYes').onclick=()=>{m.classList.remove('show');ok();};}
// v8: 부적 드래그 (마우스 즉시 / 터치는 길게 눌러서) — 리스트→슬롯 장착·교체, 슬롯→리스트 해제, 슬롯↔슬롯 순서 교체
let DRG=null,dragJustEnded=0;
document.addEventListener('touchmove',e=>{if(DRG&&DRG.on)e.preventDefault();},{passive:false});
document.addEventListener('click',e=>{if(performance.now()-dragJustEnded<300&&e.target.closest&&e.target.closest('#bag')){e.stopPropagation();e.preventDefault();}},true);
function bagDrag(){const root=$('bag');
 root.querySelectorAll('.btile[data-csel],.bslot[data-slot]').forEach(el=>{el.style.touchAction=el.classList.contains('bslot')?'none':'pan-y';el.draggable=false;
  el.onpointerdown=e=>{if(e.button>0)return;const id=+(el.dataset.csel||el.dataset.slot),from=el.classList.contains('bslot')?'slot':'list';
   DRG={id,from,el,x:e.clientX,y:e.clientY,on:false,pid:e.pointerId,touch:e.pointerType!=='mouse',t0:performance.now()};
   if(DRG.touch)DRG.hold=setTimeout(()=>{if(DRG&&!DRG.on)startDrag(e.clientX,e.clientY);},230);};});
}
function startDrag(x,y){const d=DRG;d.on=true;const g=document.createElement('div');g.className='dghost';g.style.setProperty('--gc',getComputedStyle(d.el).getPropertyValue('--gc'));g.innerHTML=d.el.querySelector('img').outerHTML;document.body.appendChild(g);d.g=g;$('bag').classList.add('dragging',d.from==='slot'?'drag-slot':'drag-list');moveDrag(x,y);if(navigator.vibrate&&d.touch)try{navigator.vibrate(15)}catch(e){}}
function dropTarget(x,y){const els=document.elementsFromPoint(x,y);for(const e of els){const sl=e.closest&&e.closest('.bslot');if(sl)return {type:'slot',el:sl,id:sl.dataset.slot?+sl.dataset.slot:null,idx:[...sl.parentNode.children].indexOf(sl)};if(e.closest&&e.closest('.blist'))return {type:'list',el:e.closest('.blist')};}return null;}
function moveDrag(x,y){const d=DRG;d.g.style.transform=`translate(${x-32}px,${y-32}px) scale(1.08)`;document.querySelectorAll('.dropon').forEach(e=>e.classList.remove('dropon'));const t=dropTarget(x,y);if(t&&!(t.type==='list'&&d.from==='list'))t.el.classList.add('dropon');}
addEventListener('pointermove',e=>{const d=DRG;if(!d||e.pointerId!==d.pid)return;if(!d.on){const m=Math.hypot(e.clientX-d.x,e.clientY-d.y);if(d.touch){if(m>10){clearTimeout(d.hold);DRG=null;}return;}if(m>6)startDrag(e.clientX,e.clientY);else return;}moveDrag(e.clientX,e.clientY);});
addEventListener('pointercancel',e=>{const d=DRG;if(d&&!d.on){clearTimeout(d.hold);DRG=null;}});
addEventListener('pointerup',e=>{const d=DRG;if(!d||e.pointerId!==d.pid)return;clearTimeout(d.hold);DRG=null;if(!d.on)return;dragJustEnded=performance.now();d.g.remove();$('bag').classList.remove('dragging','drag-slot','drag-list');document.querySelectorAll('.dropon').forEach(x=>x.classList.remove('dropon'));
 const t=dropTarget(e.clientX,e.clientY);if(!t)return;const EQ=S.equip,slots=D.CHARM.slots;let msg='';
 if(d.from==='list'&&t.type==='slot'){if(EQ.includes(d.id)){/* 이미 장착: 슬롯 위치 이동 */const i=EQ.indexOf(d.id);if(t.id!=null){const j=EQ.indexOf(t.id);[EQ[i],EQ[j]]=[EQ[j],EQ[i]];msg='🔁 슬롯 위치 교체';}}
  else if(t.id!=null){S.equip=EQ.map(x=>x===t.id?d.id:x);msg='🔁 부적 교체 장착';}else if(EQ.length<slots){EQ.push(d.id);msg='🧿 장착 완료';}}
 else if(d.from==='slot'&&t.type==='slot'){if(t.id!=null&&t.id!==d.id){const i=EQ.indexOf(d.id),j=EQ.indexOf(t.id);[EQ[i],EQ[j]]=[EQ[j],EQ[i]];msg='🔁 슬롯 위치 교체';}else if(t.id==null){const i=EQ.indexOf(d.id);EQ.splice(i,1);EQ.push(d.id);msg='↪ 슬롯 이동';}}
 else if(d.from==='slot'&&t.type==='list'){S.equip=EQ.filter(x=>x!==d.id);msg='장착 해제';}
 if(!msg)return;S.presets[S.preset]=S.equip.slice();CSEL=d.id;CSWAP=null;toast(msg,900);save();hud();renderBag();});
function renderBag(){return keepScroll('bag',_renderBag);}
function _renderBag(){const _c=$('bag').querySelector('.card'),_st=_c?_c.scrollTop:0,_tb=_c&&_c.dataset.tab;const ch=SYS.charmSum(D,S),MO=SYS.mods(D,S,rod(),bait()),lv=SYS.enhLv(S),eqg=SYS.gearOf(S);let body='';
 if(bagTab==='box')body=`<div class="boxrow"><div class="bigbox">${BOXIMG(Math.min(5,Math.floor(Date.now()/2500)%6))}</div><div><b>보유 행운 상자 ${S.boxes.length}개</b><br><span class="small muted">낚시 성공 시 ${(MO.box*100).toFixed(2)}% 확률로 획득 (기본 0.5%${ch.treasure?` · 보물탐지 +${ch.treasure}%`:''})</span><br>
  <button class="acc" id="openBox" ${S.boxes.length?'':'disabled'}>1개 열기</button> <button class="acc" id="openBox10" ${S.boxes.length>=2?'':'disabled'}>${Math.min(10,S.boxes.length)>1?Math.min(10,S.boxes.length):10}개 열기</button> <button id="dbgBox" class="small">🧪 테스트 상자 +1</button> <button id="dbgBox10" class="small">🧪 +10</button></div></div>
  <h4>상자 등급 확률 ${ch.master?`<small>(감정의달인 +${ch.master}% 적용)</small>`:''}</h4><div class="tierbar">${(()=>{const ws=D.BOX.tiers.map((t,i)=>t.w*(i>=2?1+ch.master/100:1)),sm=ws.reduce((a,b)=>a+b);return D.BOX.tiers.map((t,i)=>`<span style="--gc:${t.c}">${t.n}<b>${(ws[i]/sm*100).toFixed(ws[i]/sm<.01?2:1)}%</b></span>`).join('');})()}</div>
  <p class="small muted">보상: 부적 55% · 낚싯대 10% · 미끼 묶음 15% · 강화석+코인 20% (모두 상자 등급 연동) · 보물감정 ${ch.appraise}% 확률로 보상 1회 추가</p>`;
// v18: 교체 대상 자동 선택 = 교체 후 합산 효과가 가장 큰(=잃는 게 가장 적은) 슬롯, 같으면 낮은 등급
function bestSwap(eqC,sel){const score=o=>Object.entries(D.CHARM.opts).reduce((a,[k,x])=>a+(o[k]||0)/x.total,0);let best=null,bs=-1e9;
 eqC.forEach((c,i)=>{const af=SYS.charmSum(D,Object.assign({},S,{equip:S.equip.map(x=>x===c.id?sel.id:x)})),sc=score(af)-c.tier*1e-6-i*1e-9;if(sc>bs){bs=sc;best=c;}});return best;}
if(bagTab==='charm'){const eqC=S.equip.map(id=>S.charms.find(c=>c.id===id)).filter(Boolean),sel=S.charms.find(c=>c.id===CSEL)||null,selEq=sel&&S.equip.includes(sel.id),full=S.equip.length>=D.CHARM.slots;
  const osum=c=>c.opts.reduce((a,o)=>a+o.v/D.CHARM.opts[o.k].total,0);let tgt=null,after=null;
  if(sel&&!selEq){if(!full)after=SYS.charmSum(D,Object.assign({},S,{equip:[...S.equip,sel.id]}));else{tgt=eqC.find(c=>c.id===CSWAP)||bestSwap(eqC,sel);after=SYS.charmSum(D,Object.assign({},S,{equip:S.equip.map(x=>x===tgt.id?sel.id:x)}));}}
  else if(sel&&selEq)after=SYS.charmSum(D,Object.assign({},S,{equip:S.equip.filter(x=>x!==sel.id)}));
  const P=SYS.passives(D,S).sum;
  const sumP=`<div class="bsum"><h3>✨ 합산 효과 <small>장착 ${S.equip.length}/${D.CHARM.slots} · 프리셋 ${S.preset+1}${after?` · <b class="dlh">${selEq?'해제 시':tgt?'교체 시':'장착 시'} 변화 ▲▼</b>`:''}</small></h3><div class="bsg">${Object.entries(D.CHARM.opts).map(([k,o])=>{const v=ch[k],cap=o.total,isF=v>=cap,d=after?Math.round((after[k]-v)*10)/10:0,p=P[k]||0;
   const srcs=[];eqC.forEach((c,ci)=>c.opts.forEach(x=>{if(x.k===k)srcs.push(`<span style="color:${TIER(c.tier).c}">●</span> 슬롯${S.equip.indexOf(c.id)+1} ${TIER(c.tier).n} 부적 <b>+${x.v}%</b>`);}));const gg=SYS.gearOf(S);if(gg){gg.extra.forEach(e=>{if(e.k===k)srcs.push(`🎣 ${rod().n} 추가옵션 <b>+${e.v}%</b>`);});const fx=(D.RODS.find(r=>r.k===gg.k)||{}).fixed;if(fx&&fx[k])srcs.push(`🎣 ${rod().n} 고정옵션 <b>+${fx[k]}%</b>`);}
   const raw=srcs.length?'':'';const tip=`<div class="ttl">${o.n} <small>${o.cat||''}</small></div><div class="tds">${o.d||''}</div><div class="tsrc">${srcs.length?srcs.join('<br>'):'<span class="muted">장착된 부적에 이 옵션이 없어요</span>'}${p?`<br><span style="color:#c08cff">●</span> 도감·어항 패시브 <b>+${p}%</b> <small>(별도)</small>`:''}</div><div class="tcap">합산 상한 ${cap}%${isF?' · <b style="color:#7ee0a4">상한 도달</b>':''}</div>`;
   return `<div class="bso ${v||p||d?'':'zero'}" tabindex="0"><div class="btip">${tip}</div><div class="n"><span>${o.n}${d?`<span class="dl ${d>0?'up':'dn'}">${d>0?'▲ +':'▼ −'}${Math.abs(d)}%</span>`:''}</span><span><b class="${isF?'max':''}">+${v}%</b> <i>/${cap}${isF?' MAX':''}</i></span></div><div class="bgb ${isF?'full':''}"><i style="width:${Math.min(100,v/cap*100)}%"></i>${d>0?`<u style="left:${v/cap*100}%;width:${Math.min(100-v/cap*100,d/cap*100)}%"></u>`:d<0?`<s style="left:${Math.max(0,(v+d)/cap*100)}%;width:${Math.min(v,-d)/cap*100}%"></s>`:''}</div>${p?`<small class="pas">+${p}% 패시브</small>`:''}</div>`;}).join('')}</div></div>`;
  const slots=`<div class="bslots">${Array.from({length:D.CHARM.slotsMax||D.CHARM.slots},(_,i)=>{const c=eqC[i];if(!c&&i>=D.CHARM.slots)return `<div class="bslot empty lock" title="Lv.${lvSlotReq(i)}에 열려요">🔒<span class="lv">Lv.${lvSlotReq(i)}</span></div>`;return c?`<button class="bslot ${tgt&&tgt.id===c.id?'tgt':''} ${sel&&sel.id===c.id?'sel':''}" data-slot="${c.id}" style="--gc:${TIER(c.tier).c}" title="${c.opts.map(o=>D.CHARM.opts[o.k].n+' +'+o.v+'%').join(' · ')}">${CIMG(c.tier)}<span class="lv">${TIER(c.tier).n}</span>${tgt&&tgt.id===c.id?'<span class="tg">교체 대상</span>':''}</button>`:`<div class="bslot empty">＋</div>`;}).join('')}</div>`;
  const LST=S.charms.filter(c=>(!CF.opt||c.opts.some(o=>o.k===CF.opt))&&(CF.tier<0||c.tier===CF.tier)&&(!CF.only||(CF.only==='eq'?S.equip.includes(c.id):CF.only==='lock'?c.lock:!S.equip.includes(c.id))));
  const vv=c=>{const o=c.opts.find(o=>o.k===CF.opt);return o?o.v:0;};LST.sort((a,b)=>CF.opt?vv(b)-vv(a):b.tier-a.tier);
  const mini=(c,lab)=>`<div class="cmpc" style="--gc:${TIER(c.tier).c}">${CIMG(c.tier)}<div><b>${lab} · ${TIER(c.tier).n}</b>${c.opts.map(o=>`<div>${D.CHARM.opts[o.k].n} +${o.v}%</div>`).join('')}</div></div>`;
  const det=!sel?`<div class="bdet empty"><div style="font-size:34px">🧿</div><b>부적을 선택하세요</b><p class="small muted">리스트에서 부적을 누르면 상세 옵션과<br>장착·교체 시 합산 변화(▲▼)가 표시돼요.<br>슬롯이 가득 차면 왼쪽 위 슬롯을 눌러 교체 대상을 고를 수 있어요.</p></div>`
   :`<div class="bdet" style="--gc:${TIER(sel.tier).c}">${charmHTML(sel)}</div>${tgt?`<div class="cmp">${mini(tgt,'장착중')}<b class="ar">→</b>${mini(sel,'선택')}</div><p class="small muted" style="margin:4px 0">위 합산 패널의 ▲▼ = 교체 후 변화 · 다른 슬롯을 눌러 대상 변경</p>`:''}
   <div class="cbtn"><button class="lockb ${sel.lock?'on':''}" data-clock="${sel.id}">${sel.lock?'🔒 잠금됨':'🔓 잠금'}</button>${selEq?`<button class="ok" data-uneq="${sel.id}">장착 해제</button>`:full?`<button class="acc" data-swap="${sel.id}">🔁 이 슬롯과 교체</button>`:`<button class="acc" data-eq="${sel.id}">장착</button>`}<button data-sellc="${sel.id}" ${selEq||sel.lock?'disabled':''}>분해 <small>🪙${disOf(sel).co.toLocaleString()} 💎${disOf(sel).st}</small></button></div></div>`;
  body=`<div class="bagE"><div class="btop">${slots}${sumP}</div><div class="bbot"><div class="blist"><div class="cfilter"><b>🔍 옵션 검색</b> <select id="cfOpt"><option value="">전체 옵션</option>${Object.entries(D.CHARM.opts).map(([k,o])=>`<option value="${k}" ${CF.opt===k?'selected':''}>${o.n}</option>`).join('')}</select>
  <span class="tchips">${[-1,0,1,2,3,4,5].map(i=>`<button class="tc ${CF.tier===i?'on':''}" data-cft="${i}" style="--gc:${i<0?'#3d3548':TIER(i).c}">${i<0?'전체':TIER(i).n}</button>`).join('')}</span>
  <select id="cfOnly"><option value="">모두</option><option value="eq" ${CF.only==='eq'?'selected':''}>장착중</option><option value="free" ${CF.only==='free'?'selected':''}>미장착</option><option value="lock" ${CF.only==='lock'?'selected':''}>잠금</option></select>
  ${CF.opt||CF.tier>=0||CF.only?'<button id="cfReset" class="small">초기화</button>':''}<span class="small muted">${CF.opt?`'${D.CHARM.opts[CF.opt].n}' 값 높은 순`:'등급 높은 순'}</span></div><div class="bscroll">${LST.length?`<div class="bgrid">${LST.map(c=>`<button class="btile ${sel&&sel.id===c.id?'sel':''}" data-csel="${c.id}" style="--gc:${TIER(c.tier).c}">${CIMG(c.tier)}${c.lock?'<span class="k">🔒</span>':''}${S.equip.includes(c.id)?'<span class="eq"></span>':''}</button>`).join('')}</div>`:`<p class="muted" style="padding:10px">${S.charms.length?'조건에 맞는 부적이 없어요.':'부적이 없어요. 행운 상자를 열어보세요!'}</p>`}</div><div class="bfoot"><span>${LST.length}/${S.charms.length}개 표시 · 장착 ${S.equip.length} · 🔒 ${S.charms.filter(c=>c.lock).length}</span><span class="small muted">드래그: 리스트→슬롯 장착 · 슬롯→리스트 해제 · <i class="eqdot"></i> 장착중</span></div></div><div class="bside">${det}</div></div></div>
  <div class="bextra"><div class="presets">프리셋 ${[0,1,2].map(i=>`<button class="${S.preset===i?'on':''}" data-pre="${i}">${i+1}<small>${(S.presets[i]||[]).length}/${D.CHARM.slots}</small></button>`).join('')} <button id="preSave" title="현재 장착 상태를 선택된 프리셋에 저장">💾 현재 장착 → 프리셋 ${S.preset+1} 저장</button> <span class="small muted">전환 시 현재 장착이 자동 저장돼요</span></div>
  <div class="synbar"><b>✨ 부적 합성</b> <span class="small muted">같은 등급 ${D.CHARM.synth.need}개 → 다음 등급 랜덤 1개 · 신화 ${D.CHARM.synth.mythNeed}개 → 다른 신화 1개 · 재료 제외: 🔒 잠금 ${S.charms.filter(c=>c.lock).length}개 · 장착/프리셋 등록 ${S.charms.filter(c=>!c.lock&&(S.equip.includes(c.id)||S.presets.some(p=>p.includes(c.id)))).length}개 · 옵션 합이 낮은 부적부터 소모</span><div class="synrow">${D.BOX.tiers.map((t,i)=>{const need=i>=5?D.CHARM.synth.mythNeed:D.CHARM.synth.need,n=SYS.synthPool(D,S,i).length,cost=D.CHARM.synth.coin[i];return `<button class="syn" style="--gc:${t.c}" data-csyn="${i}" ${n>=need&&S.coins>=cost?'':'disabled'}>${CIMG(i)}<span>${t.n} ${n}/${need}</span><small>→ ${TIER(Math.min(5,i+1)).n} · 🪙${cost.toLocaleString()}</small></button>`;}).join('')}</div></div>
  <div class="disbar">일괄 분해: <select id="disT">${D.BOX.tiers.map((t,i)=>`<option value="${i}" ${i==disT?'selected':''}>${t.n} 이하</option>`).join('')}</select> <button id="disGo">분해</button> <span class="small" id="disPrev">${(()=>{const L=S.charms.filter(c=>c.tier<=disT&&!c.lock&&!S.equip.includes(c.id));return `예상 ${L.length}개 → 🪙 <b>${L.reduce((a,c)=>a+disOf(c).co,0).toLocaleString()}</b> · 💎 <b>${L.reduce((a,c)=>a+disOf(c).st,0)}</b>`;})()}</span> <span class="small muted">장착·잠금 부적 제외</span></div>${(()=>{const P=SYS.passives(D,S).sum,on=Object.entries(P).filter(([k,v])=>v>0);return on.length?`<p class="small">🏆 도감·어항 패시브 (부적 상한과 별도): ${on.map(([k,v])=>`${D.CHARM.opts[k].n} +${v}%`).join(' · ')}</p>`:'';})()}</div>`;}
 if(bagTab==='gear'){const L=S.gear.slice().sort((a,b)=>D.RODS.findIndex(r=>r.k===b.k)-D.RODS.findIndex(r=>r.k===a.k)||b.star-a.star);
  body=`<p class="small muted">같은 낚싯대 2개를 합성하면 ★+1 (최대 ★${D.GEAR.starMax}): 기본옵션 +${D.GEAR.starBonus*100}%/★, 추가옵션 ×${D.GEAR.starUp}, ★${D.GEAR.starSlot.join('·★')}에서 추가옵션 슬롯 해금. 강화석 강화(+)는 장비별로 유지되며 합성 시 높은 쪽을 이어받아요.</p>`+
  L.map(g=>{const mats=S.gear.filter(m=>m!==g&&m.k===g.k&&!m.lock&&m.id!==S.rodId),cost=SYS.synthCost(D,g);return gearHTML(g,`<div class="cbtn"><button class="lockb ${g.lock?'on':''}" data-glock="${g.id}">${g.lock?'🔒':'🔓'}</button>${g.id===S.rodId?'':`<button class="ok" data-geq="${g.id}">장착</button>`}<button data-syn="${g.id}" ${mats.length&&g.star<D.GEAR.starMax&&S.coins>=cost?'':'disabled'} title="재료: 같은 종류 중 품질이 가장 낮은 1개">합성 🪙${cost.toLocaleString()}${mats.length?'':' (재료 없음)'}</button><button data-gsell="${g.id}" ${g.id===S.rodId||g.lock?'disabled':''}>판매 🪙${Math.round(SYS.gearStats(D,g).price*D.GEAR.sellRate)}</button></div>`);}).join('');}
 if(bagTab==='enh'){const E=D.ENH,r=rod();body=`<div class="enh"><div class="rodbig">${RIMG(SYS.gearOf(S).k,"rbig")}</div><div><b>${r.n} ${'★'.repeat(r.star)} <span class="plus">+${lv}</span></b><br><span class="small">크기 +${(lv*E.size*100).toFixed(1)}% · 빠른입질 +${(lv*E.speed*100).toFixed(0)}%</span><br>보유 강화석 💎 <b>${S.stones}</b> · 🪙 ${S.coins.toLocaleString()}</div></div>`+
   (lv>=E.max?'<p><b>최대 강화 달성!</b></p>':`<p>+${lv} → +${lv+1} · 성공률 <b>${E.rate[lv]}%</b> · 비용 💎${E.stone(lv)} + 🪙${E.coin(lv).toLocaleString()}${E.fail(lv).p?` · <span style="color:#d55">실패 시 ${E.failTxt(lv)}</span>`:' · 실패해도 단계 유지'}</p><button class="acc" id="enhGo" ${S.stones<E.stone(lv)||S.coins<E.coin(lv)?'disabled':''}>강화하기</button>`)+
   `<p class="small muted">💎 강화석은 상점에서 살 수 없어요 · 행운 상자·부적 분해·수집 목표로 획득</p>${enhBtTable(lv)}<p class="small muted">강화(+)는 장착 중인 낚싯대 1개에 적용 · 합성(★)과 별개 · 파괴 없음</p>`;}
 $('bag').innerHTML=`<div class="card" data-tab="${bagTab}" style="width:${bagTab==='charm'?'min(1000px,96vw)':'min(780px,94vw)'}"><button class="close" data-close="bag">×</button><h2>🎒 가방 <span class="pill small bagpill">${BOXIMG(3,'')} ${S.boxes.length} · <img src="img/charms/t3.png" alt=""> ${S.charms.length}/${D.CHARM.slots}칸 · ${RIMG(rod().k,'')} ${S.gear.length} · 💎 ${S.stones}</span></h2>
  <div class="tabs">${[['box',BOXIMG(3,''),S.boxes.length,'행운 상자'],['charm','<img src="img/charms/t3.png" alt="">',S.charms.length,'행운 부적'],['gear',RIMG(rod().k,''),S.gear.length,'장비·합성'],['enh','<img src="icons/emoji-png/1f48e.png" alt="">',S.stones||0,'강화']].map(([k,ic,c,n])=>`<button class="${bagTab===k?'on':''}" data-btab="${k}"><span class="tico">${ic}<em class="${c?'':'z'}">${c>99?'99+':c}</em></span>${n}</button>`).join('')}</div>${body}</div>`;
 if(_tb===bagTab)$('bag').querySelector('.card').scrollTop=_st;
 const q=x=>$('bag').querySelectorAll(x),rr=()=>{save();hud();renderBag();};
 q('[data-pre]').forEach(b=>b.onclick=()=>{const i=+b.dataset.pre;S.presets[S.preset]=S.equip.slice();S.preset=i;S.equip=(S.presets[i]||[]).filter(id=>S.charms.some(c=>c.id===id)).slice(0,D.CHARM.slots);toast(`🧿 프리셋 ${i+1} 적용 (${S.equip.length}개 장착)`);rr();});
 const ps=$('preSave');if(ps)ps.onclick=()=>{S.presets[S.preset]=S.equip.slice();toast(`💾 프리셋 ${S.preset+1} 저장`);rr();};
 q('[data-csyn]').forEach(b=>b.onclick=()=>{const t=+b.dataset.csyn,need=t>=5?D.CHARM.synth.mythNeed:D.CHARM.synth.need,used=SYS.synthPool(D,S,t).slice(0,need);
  confirmBox(`<h3>부적 합성</h3><p><b style="color:${TIER(t).c}">${TIER(t).n}</b> 부적 ${need}개 → <b style="color:${TIER(Math.min(5,t+1)).c}">${TIER(Math.min(5,t+1)).n}</b> 랜덤 부적 1개<br>비용 🪙${D.CHARM.synth.coin[t].toLocaleString()}</p><div class="synprev">${used.map(c=>CIMG(c.tier)).join('')}</div><p class="small muted">옵션 합이 낮은 부적부터 소모 · 장착/잠금/프리셋 부적 제외</p>`,()=>{const r=SYS.charmSynth(D,S,t);if(r.r==='ok'){save();hud();renderBag();synthFx(r);}else toast('합성 재료/코인이 부족해요');});});
 q('[data-close]').forEach(b=>b.onclick=()=>closeM('bag'));q('[data-btab]').forEach(b=>b.onclick=()=>{bagTab=b.dataset.btab;renderBag();});
 const openN=n=>{const res=[];for(let i=0;i<n&&S.boxes.length;i++){const bx=S.boxes.shift();res.push(SYS.openBox(D,S,Math.random,bx<0?"streak":typeof bx==="string"?bx:null));}rr();boxFx(res);if(res.length)addXP(5*res.length,"상자 열기");const best=Math.max(...res.map(r=>r.tier));if(best>=4)setTimeout(()=>boxAlert(NICK(),best,true),n>1?1000:1400);};
 const ob=$('openBox');if(ob)ob.onclick=()=>openN(1);const ob10=$('openBox10');if(ob10)ob10.onclick=()=>openN(10);
 const d1=$('dbgBox');if(d1)d1.onclick=()=>{S.boxes.push(Date.now());rr();};const d2=$('dbgBox10');if(d2)d2.onclick=()=>{for(let i=0;i<10;i++)S.boxes.push(Date.now());rr();};
 q('[data-eq]').forEach(b=>b.onclick=()=>{if(S.equip.length<D.CHARM.slots)S.equip.push(+b.dataset.eq);S.presets[S.preset]=S.equip.slice();rr();});
 q('[data-uneq]').forEach(b=>b.onclick=()=>{S.equip=S.equip.filter(x=>x!=b.dataset.uneq);S.presets[S.preset]=S.equip.slice();rr();});
 q('[data-csel]').forEach(b=>b.onclick=()=>{CSEL=+b.dataset.csel;CSWAP=null;renderBag();});
  q('[data-slot]').forEach(b=>b.onclick=()=>{const id=+b.dataset.slot,sc=S.charms.find(c=>c.id===CSEL);if(sc&&!S.equip.includes(sc.id)&&S.equip.length>=D.CHARM.slots)CSWAP=id;else{CSEL=id;CSWAP=null;}renderBag();});
  q('[data-swap]').forEach(b=>b.onclick=()=>{const id=+b.dataset.swap,t=$('bag').querySelector('.bslot.tgt'),tid=t?+t.dataset.slot:null;if(tid==null)return;S.equip=S.equip.map(x=>x===tid?id:x);S.presets[S.preset]=S.equip.slice();CSWAP=null;toast('🔁 부적 교체 완료');rr();});
  if(bagTab==='charm')bagDrag();
  q('[data-clock]').forEach(b=>b.onclick=()=>{const c=S.charms.find(x=>x.id==b.dataset.clock);c.lock=!c.lock;rr();});
 q('[data-sellc]').forEach(b=>b.onclick=()=>{const c=S.charms.find(x=>x.id==b.dataset.sellc);S.charms=S.charms.filter(x=>x!==c);S.presets.forEach((p,i)=>S.presets[i]=p.filter(x=>x!==c.id));S.coins+=D.CHARM.dismantle.coin[c.tier];S.stones+=D.CHARM.dismantle.stone[c.tier];sfx.coin();rr();});
 const ds=$('disT');if(ds)ds.onchange=()=>{disT=+ds.value;renderBag();};
 const co=$('cfOpt');if(co)co.onchange=()=>{CF.opt=co.value;renderBag();};const cn=$('cfOnly');if(cn)cn.onchange=()=>{CF.only=cn.value;renderBag();};q('[data-cft]').forEach(b=>b.onclick=()=>{CF.tier=+b.dataset.cft;renderBag();});const cr=$('cfReset');if(cr)cr.onclick=()=>{CF={opt:'',tier:-1,only:''};renderBag();};
 const dg=$('disGo');if(dg)dg.onclick=()=>{const L=S.charms.filter(c=>c.tier<=disT&&!c.lock&&!S.equip.includes(c.id));if(!L.length)return toast('분해할 부적이 없어요');const co=L.reduce((a,c)=>a+D.CHARM.dismantle.coin[c.tier],0),st=L.reduce((a,c)=>a+D.CHARM.dismantle.stone[c.tier],0);
  confirmBox(`<h3>부적 일괄 분해</h3><p><b>${TIER(disT).n} 이하</b> 부적 <b>${L.length}개</b>를 분해할까요?<br>획득: 🪙 ${co.toLocaleString()} · 💎 ${st}</p><p class="small muted">장착·잠금 부적은 제외됩니다</p>`,()=>{const r=SYS.dismantle(D,S,disT);sfx.coin();toast(`🧿 ${r.n}개 분해 → 🪙${r.co} · 💎${r.st}`);rr();});};
 q('[data-glock]').forEach(b=>b.onclick=()=>{const g=S.gear.find(x=>x.id==b.dataset.glock);g.lock=!g.lock;rr();});
 q('[data-geq]').forEach(b=>b.onclick=()=>{const _g=S.gear.find(x=>x.id==b.dataset.geq);if(_g&&!lvRodOK(_g.k)){toast(`🔒 ${D.RODS.find(r=>r.k===_g.k).n}은(는) Lv.${LV.rods[_g.k]}부터 착용할 수 있어요`,2000);return;}S.rodId=+b.dataset.geq;S.rod=SYS.gearOf(S).k;rr();});
 q('[data-gsell]').forEach(b=>b.onclick=()=>{const g=S.gear.find(x=>x.id==b.dataset.gsell);S.gear=S.gear.filter(x=>x!==g);S.coins+=Math.round(SYS.gearStats(D,g).price*D.GEAR.sellRate);sfx.coin();rr();});
 q('[data-syn]').forEach(b=>b.onclick=()=>{const g=S.gear.find(x=>x.id==b.dataset.syn),m=S.gear.filter(x=>x!==g&&x.k===g.k&&!x.lock&&x.id!==S.rodId).sort((a,b)=>a.star-b.star||a.q-b.q)[0];
  confirmBox(`<h3>장비 합성</h3><p>${SYS.gearStats(D,g).n} ★${g.star} → <b>★${g.star+1}</b><br>재료: ★${m.star} 품질 ${(m.q*100).toFixed(1)}% (소멸)<br>비용 🪙${SYS.synthCost(D,g).toLocaleString()}</p>`,()=>{const r=SYS.synth(D,S,g.id,m.id);if(r.r==='ok'){sfx.coin();toast(`🎣 합성 성공! ★${r.star}${r.added?' · 추가옵션 슬롯 해금!':''}`);}rr();});});
 const eg=$('enhGo');if(eg)eg.onclick=()=>{const r=SYS.enhTry(D,S);rr();if(r.r==='ok'){sfx.coin();toast(`⚒ 강화 성공! <b>+${r.lv}</b>`);}else if(r.r==='drop'){sfx.fail();toast(`💥 강화 실패… +${r.lv}로 하락`);}else if(r.r==='fail'){sfx.fail();toast('강화 실패 (단계 유지)');}};
}
function boxFx(list){const best=Math.max(...list.map(r=>r.tier)),t=TIER(best),fx=$('boxFx');V14.boxSfx(best);fx.style.setProperty('--gc',t.c);fx.className='show t'+best+(list.length>1?' multi':'');
 const body=list.length===1?`<h3 style="color:${t.c}">${t.n} 행운 상자</h3>`+list[0].out.map(o=>rewardHTML(o,t)).join(''):
  `<h3 style="color:${t.c}">행운 상자 ${list.length}개 개봉 · 최고 ${t.n}</h3><div class="rgrid">${list.map(r=>{const tt=TIER(r.tier);return `<div class="rcell" style="--gc:${tt.c}"><span class="gbadge" style="--gc:${tt.c}">${tt.n}</span>${r.out.map(o=>`<div>${o.type==='charm'?CIMG(o.c.tier)+' 부적 '+o.c.opts.length+'옵':o.type==='rod'?RIMG(o.g.k,'cimg')+' '+D.RODS.find(x=>x.k===o.g.k).n.replace(' 낚싯대',''):o.type==='bait'?BIMG(o.k,'cimg')+' '+D.BAITS.find(b=>b.k===o.k).n+' ×'+o.n:'💎×'+o.st+' 🪙'+o.co}${o.bonus?' ✨':''}</div>`).join('')}</div>`;}).join('')}</div>
  <div class="small">${(()=>{const a={charm:0,rod:0,bait:0,st:0,co:0};list.forEach(r=>r.out.forEach(o=>{if(o.type==='stone'){a.st+=o.st;a.co+=o.co;}else a[o.type]++;}));return `합계: 🧿 부적 ${a.charm} · 🎣 낚싯대 ${a.rod} · 🪱 미끼 ${a.bait} · 💎 ${a.st} · 🪙 ${a.co.toLocaleString()}`;})()}</div>`;
 fx.innerHTML=`<div class="rays"></div><div class="fxbox">${BOXIMG(best,'fximg')}${list.length>1?'<small>×'+list.length+'</small>':''}</div><div class="fxres">${body}<button class="acc" id="fxOk">확인</button></div>`;
 setTimeout(()=>{fx.classList.add('open');sfx.reel();if(best>=4)0;},list.length>1?900:1300);
 $('fxOk').onclick=()=>{fx.className='';};}
function synthFx(r){const fx=$('boxFx'),t=TIER(r.c.tier);fx.style.setProperty('--gc',t.c);fx.className='show syn t'+r.c.tier;
 fx.innerHTML=`<div class="rays"></div><div class="synring">${r.used.map((c,i)=>`<div class="sp" style="--a:${i*360/r.used.length}deg">${CIMG(c.tier)}</div>`).join('')}<div class="core">${CIMG(r.c.tier)}</div></div><div class="fxres"><h3 style="color:${t.c}">✨ 합성 성공 · ${t.n} 부적!</h3>${charmHTML(r.c)}</div><button class="acc" id="fxOk">확인</button></div>`;
 sfx.reel();setTimeout(()=>{fx.classList.add('open');sfx.coin();if(r.c.tier>=4)say('시스템',`✨ ${NICK()}님이 ${t.n} 부적을 합성했어요!`);},1500);$('fxOk').onclick=()=>{fx.className='';};}
// ───────── 전설·신화 알림: 내 것 = 중앙 컷인(시안2), 다른 유저 = 상단 리본(시안1) ─────────
function legendAlert(who,f,mine,info){if(f.g<3)return;const F=FI(f.k),G0=GR(f.g),X=f.g===5,M=f.g>=4,cls=X?'X':M?'M':'L';
 if(mine){document.querySelectorAll('.cutin:not(.box)').forEach(e=>e.remove());const _t=$('toast');clearTimeout(_t._t);_t.style.opacity=0;const el=document.createElement('div');el.className='cutin '+cls;el.innerHTML=`${X?'<div class="rays2"></div>':''}<div class="band"><img src="${F.img}"><div><div class="t">${X?'✦ 초월 출현 ✦':M?'✦ 신화 출현 ✦':'★ 전설 출현 ★'}</div><div class="sub">${who} · ${F.n} <b>${f.cm}cm</b> · 🪙${(f.v||0).toLocaleString()}${info&&info.isNew?' · ✨ 도감 신규':''}${info&&info.rec&&!info.isNew?' · 📏 최대 갱신':''}</div></div></div>`;document.body.appendChild(el);
  if(M)document.body.animate([{transform:'translate(0,0)'},{transform:'translate(6px,-4px)'},{transform:'translate(-5px,3px)'},{transform:'translate(0,0)'}],{duration:300,iterations:X?5:3});const life=X?4600:3600;setTimeout(()=>el.classList.add('out'),life);setTimeout(()=>el.remove(),life+600);}
 else{const box=$('ribbons'),el=document.createElement('div');el.className='ribbon '+cls;el.innerHTML=`<img src="${F.img}"><div><div class="big">${X?'🌈':M?'🌌':'🏅'} <b>${who}</b>님이 <span class="gb">${G0.n}</span> <b>${F.n} ${f.cm}cm</b>를 낚았어요!</div><small>방금 전 · ${X?'전체 서버 공지':'같은 서버'}</small></div>`;box.appendChild(el);const life=X?6000:4800;setTimeout(()=>el.classList.add('out'),life);setTimeout(()=>el.remove(),life+600);
  say('시스템',`📢 ${who}님이 ${G0.n} ${F.n} ${f.cm}cm를 낚았어요!`);}}
let botLT=rand(...D.ALERT.botTick);
function boxAlert(who,tier,mine){const t=TIER(tier),M=tier>=5,cls=M?'M':'L';
 if(mine){const el=document.createElement('div');el.className='cutin box '+cls;el.title='클릭하면 닫혀요';el.onclick=()=>{el.classList.add('out');setTimeout(()=>el.remove(),250);};el.innerHTML=`<div class="band">${BOXIMG(tier,'bximg')}<div><div class="t">${M?'✦ 신화 상자 개봉 ✦':'★ 전설 상자 개봉 ★'}</div><div class="sub">${who} · ${t.n} 행운 상자</div></div></div>`;document.body.appendChild(el);setTimeout(()=>el.classList.add('out'),2800);setTimeout(()=>el.remove(),3400);}
 else{const box=$('ribbons'),el=document.createElement('div');el.className='ribbon '+cls;el.innerHTML=`${BOXIMG(tier,'bximg')}<div><div class="big">🎁 <b>${who}</b>님이 <span class="gb">${t.n}</span> <b>행운 상자</b>를 열었어요!</div><small>방금 전 · 같은 서버</small></div>`;box.appendChild(el);setTimeout(()=>el.classList.add('out'),4800);setTimeout(()=>el.remove(),5400);}
 say('시스템',`📢 ${who}님이 ${t.n} 행운 상자를 열었어요!`);}
let botBT=rand(90,200);function botBoxAlert(dt,force){botBT-=dt;if(!force&&botBT>0)return;botBT=rand(90,200);const g=force!=null?force:Math.random()<.15?5:4;boxAlert(pick(bots).c.name,g,false);}
function botLegend(dt,force){botLT-=dt;if(!force&&botLT>0)return;botLT=rand(...D.ALERT.botTick);const x=Math.random();const g=force!=null?force:x<D.ALERT.myth*D.TX.botRate?5:x<D.ALERT.myth?4:x<D.ALERT.legend?3:-1;if(g<0)return;
 const cand=D.FISH.filter(f=>f.w<=14),F=pick(cand),cm=Math.round((g===5?F.max*(D.TX.lo+(D.TX.hi-D.TX.lo)*Math.random()):g===4?F.g[3]+(F.max-F.g[3])*Math.random():F.g[2]+(F.g[3]-F.g[2])*Math.random())*10)/10,b=pick(bots);legendAlert(b.c.name,{k:F.k,cm,g},false);}
const autoTargets=()=>S.tank.filter(f=>!f.lock&&f.v<S.auto.th);const autoPrevTxt=()=>{const L=autoTargets();return `현재 어항 기준 미만: ${L.length}마리 (🪙${L.reduce((a,f)=>a+sellP(f),0).toLocaleString()})`;};
function renderSet(){const r=keepScroll('set',_renderSet);setLayoutA();return r;}
const PV={reelFx:'reel',fishBtnS:'fb',goalFx:'goal'};
function setLayoutA(){const card=$('set').querySelector('.card');if(!card||card.classList.contains('setA'))return;card.classList.add('setA');const h2=card.querySelector('h2'),kids=[...card.children].filter(e=>e!==h2&&!e.classList.contains('close'));
 const secs=[];let curS=null;kids.forEach(e=>{if(e.tagName==='H4'){curS={t:e.textContent.trim(),els:[e]};secs.push(curS);}else if(curS)curS.els.push(e);else{curS={t:'일반',els:[e]};secs.push(curS);}});
 const lay=document.createElement('div');lay.className='slay';const nav=document.createElement('aside');const main=document.createElement('main');lay.append(nav,main);card.appendChild(lay);
 const idx=Math.min(secs.length-1,Math.max(0,secs.findIndex(x=>x.t===S.setTab)));
 secs.forEach((x,i)=>{const sec=document.createElement('section');x.els.forEach(e=>sec.appendChild(e));sec.hidden=i!==(idx<0?0:idx);main.appendChild(sec);const b=document.createElement('button');b.textContent=x.t;b.className=sec.hidden?'':'on';b.onclick=()=>{S.setTab=x.t;main.querySelectorAll('section').forEach(q=>q.hidden=q!==sec);nav.querySelectorAll('button').forEach(q=>q.classList.toggle('on',q===b));main.scrollTop=0;};nav.appendChild(b);});
 let pop=$('pvPop');if(!pop){pop=document.createElement('div');pop.id='pvPop';document.body.appendChild(pop);}
 card.querySelectorAll('select[data-v14]').forEach(sel=>{const k=sel.dataset.v14,pre=PV[k];if(!pre)return;const row=sel.closest('p')||sel;row.classList.add('pvrow');
  const show=()=>{const v=sel.value;if(v==='off'||v==='old'){pop.style.display='none';return;}const r=row.getBoundingClientRect();pop.innerHTML=`<img src="img/preview/${pre}-${v}.jpg" alt=""><small>${sel.options[sel.selectedIndex].text} 미리보기</small>`;pop.style.display='block';pop.style.left=Math.min(innerWidth-300,r.right+12)+'px';pop.style.top=Math.max(8,Math.min(innerHeight-230,r.top-60))+'px';};
  row.addEventListener('mouseenter',show);row.addEventListener('mouseleave',()=>pop.style.display='none');sel.addEventListener('change',show);});}
function _renderSet(){const A=S.auto,g=S.showG;
 $('set').innerHTML=`<div class="card" style="width:min(620px,94vw)"><button class="close" data-close="set">×</button><h2>⚙ 설정 · 저장</h2>
 <h4>👤 프로필 (로컬)</h4><p>닉네임 <input id="nick" maxlength="10" value="${S.nick||''}" placeholder="나"> <button id="nickOk">적용</button><br><span class="small muted">※ 현재는 이 브라우저에만 저장되는 로컬 프로필입니다. 실제 로그인/계정 연동은 서버 단계에서 구현 예정.</span></p>
 <h4>💾 저장</h4><p><button class="acc" id="saveNow">지금 저장</button> <button id="exp">JSON 내보내기</button> <label class="btnlike">JSON 불러오기<input type="file" id="imp" accept=".json" hidden></label> <span class="small muted" id="lastSave">${S.savedAt?'마지막 저장 '+new Date(S.savedAt).toLocaleString('ko-KR'):''}</span></p>
 <h4>⚙ 자동 판매</h4><p><label><input type="checkbox" id="auOn" ${A.on?'checked':''}> 자동판매 켜기</label> · 가치 <input type="number" id="auTh" min="1" value="${A.th}" style="width:70px"> 코인 미만 물고기<br><label><input type="checkbox" id="auNew" ${A.keepNew?'checked':''}> 처음 낚은 어종(도감 첫 등록)은 보관</label> <span class="small muted">· 🔒 잠금 물고기는 항상 제외 · 낚는 즉시 적용</span><br><span class="small" id="auPrev">${autoPrevTxt()}</span> <button id="auBulk">지금 어항에서 일괄 판매</button></p>
 <h4>🧭 상단 메뉴 레이아웃</h4><p class="optrow">${[['b','B · 하단 독 (기본)'],['a','A · 우측 아이콘 + ⚙ 묶음'],['c','C · 좌측 세로 레일'],['d','D · 가방·상점 + 메뉴 패널']].map(([k,n])=>`<label><input type="radio" name="menuS" value="${k}" ${(S.menuStyle||'b')===k?'checked':''}> ${n}</label>`).join(' ')}</p>
 <h4>🎣 낚시 성공 카드</h4><p class="optrow">${[['d','D · 메달형 (기본)'],['c','C · 등급 헤더'],['b','B · 가로 스트립'],['a','A · 미니멀']].map(([k,n])=>`<label><input type="radio" name="cardS" value="${k}" ${(S.cardStyle||'d')===k?'checked':''}> ${n}</label>`).join(' ')} <button id="cardPrev" class="small">미리보기</button></p>
 <h4>✦ 초월 등급 테두리</h4><p><label><input type="radio" name="txs" value="pink" ${S.txStyle!=='rainbow'?'checked':''}> <span class="txsw pk"></span> 진한 핑크 (기본)</label> &nbsp; <label><input type="radio" name="txs" value="rainbow" ${S.txStyle==='rainbow'?'checked':''}> <span class="txsw rb"></span> 무지개 회전</label><br><span class="small muted">초월 등급 도감 카드·컷인·알림 리본에 적용 · 출현 확률 ${(D.TX.p*100).toFixed(4)}% (≈1/${Math.round(1/D.TX.p).toLocaleString()}), 행운 보정 최대 ×${D.TX.boostMax}</span></p>
 <h4>🌊 물·밝기·어항</h4><p class="optrow"><b>호수 물</b><br>${[['5', '5 · 잔물결+빛무늬+물가 거품 (기본)'], ['1', '1 · 잔물결+햇빛 반짝임'], ['3', '3 · 얕은 물 빛무늬'], ['4', '4 · 하늘 반사+햇빛 길']].map(([k,n])=>`<label><input type="radio" name="waterQ" data-v18="waterQ" value="${k}" ${String(S.waterQ||'5')===k?'checked':''}> ${n}</label>`).join(' ')}</p><p class="optrow"><b>낮 밝기</b><br>${[['2', '2 · 조명 약하게 (기본)'], ['1', '1 · 더 어둡게+채도'], ['3', '3 · 따뜻한 오후'], ['5', '5 · 진한 하늘'], ['0', '기존 밝기']].map(([k,n])=>`<label><input type="radio" name="dayQ" data-v18="dayQ" value="${k}" ${String(S.dayQ||'2')===k?'checked':''}> ${n}</label>`).join(' ')}</p><p class="optrow"><b>어항 물고기</b><br>${[['A', 'A · 그림 물고기 (기본)'], ['3d', '3D 물고기'], ['B', 'B · 그림 물고기+테두리·그림자']].map(([k,n])=>`<label><input type="radio" name="tankFish" data-v18="tankFish" value="${k}" ${String(S.tankFish||'A')===k?'checked':''}> ${n}</label>`).join(' ')}</p>
 <h4>🌲 그래픽 테스트</h4><p>${[['tree','나무'],['grass','풀·덤불'],['flower','꽃·버섯']].map(([k,n])=>`<label><input type="checkbox" data-vg="${k}" ${g[k]?'checked':''}> ${n} (${VG[k].length} draw)</label>`).join(' ')}<br><span class="small muted">우하단 FPS · draw calls 표시로 비교하세요</span></p>
 <h4>🎁 행운 상자 아이콘 (테스트)</h4><p>${[1,2,3,4].map(i=>`<label class="bdes"><input type="radio" name="bdes" value="${i}" ${(S.boxDesign||1)===i?'checked':''}> <img src="img/box/${i===1?'t3':'d'+i}.png"> 디자인 ${i}${i===1?' (기본·등급별 원화)':' (등급별 색조 필터)'}</label>`).join('')}</p>
 <h4>🧪 테스트 설정</h4><div class="tset">
  <p>이동 속도 <input type="range" id="mvS" min="1" max="1.5" step=".05" value="${S.moveMul||1.35}"> <b id="mvV">+${Math.round(((S.moveMul||1.35)-1)*100)}%</b> <span class="small muted">(기본 +35%, 범위 +0~50%)</span></p>
  <p><label><input type="checkbox" id="rkTag" ${S.rankTag!==false?'checked':''}> 서버 1~3위 닉네임 메달 표시 (시안 D)</label></p>
  <p>프레임 상한 ${[[60,'60'],[120,'120'],[144,'144 (기본)'],[0,'제한 없음']].map(([v,n])=>`<label><input type="radio" name="fpsC" value="${v}" ${(S.fpsCap==null?0:S.fpsCap)==v?'checked':''}> ${n}</label>`).join(' ')}<br><span class="small muted">모니터 주사율보다 높게는 나오지 않아요 (60Hz 모니터 = 최대 60)</span></p>
  <p>데크 모양 ${[['','현행 (기본)'],['W1','W1 전체 넓게'],['W2','W2 끝만 넓은 T자'],['W3','W3 옆 발코니'],['W4','W4 넓게+가로 어항']].map(([k,n])=>`<label><input type="radio" name="dW" value="${k}" ${(CFG.deckW||'')===k?'checked':''}> ${n}</label>`).join(' ')}<br><small class="muted">W1~W4는 데크끼리 닿지 않게 호수가 커져요 (적용 시 새로고침)</small></p><p>데크 배치 ${[['a','A 큰 원형 (기본·'+(CFG.decks||25)+'데크)'],['b','B 지그재그 2열'],['c','C 만(灣)형 6마을'],['o','기존 20데크']].map(([k,n])=>`<label><input type="radio" name="dLay" value="${k}" ${CFG.lay===k?'checked':''}> ${n}</label>`).join(' ')}</p>
  <p>테스트 봇 <input type="number" id="botN" min="0" max="50" value="${CFG.bots}" style="width:60px">명 (최대 50) <button id="cfgApply">적용 (새로고침)</button><br><span class="small muted">데크 배치·봇 수는 새로고침 후 적용돼요. 진행 상황은 먼저 저장돼요.</span></p></div>
 <h4>🚫 차단 목록</h4><div class="blk">${(S.blocked||[]).length?S.blocked.map(n=>`<span class="pchip">${n}<button data-unb="${encodeURIComponent(n)}" title="차단 해제">해제</button></span>`).join(''):'<span class="muted small">차단한 유저가 없어요 · 캐릭터나 채팅 닉네임을 우클릭하면 차단할 수 있어요</span>'}</div>
 <h4>🧪 v14 시안 테스트</h4><div class="tset">
  ${[['reelFx','낚아 올리는 모션',[['E','E 등급별 (기본)'],['A','A 포물선'],['B','B 줄에 매달림'],['C','C 슬로우'],['D','D 들어 올리기'],['off','끄기']]],
     ['fishBtnS','낚시 버튼',[['F','F 정보형 (기본)'],['A','A 젤리'],['B','B 원형 링'],['C','C 나무'],['D','D 물결'],['E','E 네온']]],
     ['goalFx','수집 목표·업적 알림',[['G2','G2 오른쪽 카드 쌓기 (기본)'],['G1','G1 상단 알약'],['G3','G3 콘솔 업적형'],['G4','G4 가로 리본'],['D','D 카드 뒤집기'],['A','A 트로피 카드'],['B','B 도장'],['C','C 리본'],['off','기존 토스트']]],['toastSt','토스트 알림',[['T2','T2 한 줄 알약 + 닫기·시간 막대 (기본)'],['T1','T1 오른쪽 아래 카드'],['T3','T3 카드 + 닫기·시간 막대'],['T4','T4 혼합 (입질만 가운데)'],['T0','T0 가운데, 글자만 작게'],['old','기존 가운데 큰 글자']]],['mobLay','모바일 화면 배치',[['m3','M3 게임패드식 (기본)'],['old','기존 하단 바']]],['fireSt','모닥불 (다시 시작 시 적용)',[['C2','C2 Quaternius 모닥불 (기본)'],['C1','C1 v20 개선형']]],
     ['catchSfx','낚음 효과음',[['C','C 마림바 (기본)'],['A','A 첨벙+팅'],['B','B 릴+퐁'],['D','D 버블'],['E','E 코인'],['F','F 8비트'],['old','기존']]],
     ['wxOv','날씨 강제 (테스트)',[['auto','자동 (기본)'],['clear','맑음'],['drizzle','이슬비'],['storm','소나기·천둥'],['snow','함박눈'],['cherry','벚꽃 바람'],['leaf','낙엽'],['sunset','노을 색조'],['firefly','반딧불 밤'],['meteor','별똥별 밤'],['aurora','오로라']]],
     ['seasonOv','계절 (테스트)',[['auto','실제 날짜 (기본)'],['spring','봄'],['summer','여름'],['autumn','가을'],['winter','겨울']]],
     ['mapTheme','맵 테마',[['base','기본'],['xmas','크리스마스 (지형만)']]]].map(([k,n,o])=>`<p>${n} <select data-v14="${k}">${o.map(([v,t])=>`<option value="${v}" ${(S[k]||o[0][0])===v?'selected':''}>${t}</option>`).join('')}</select></p>`).join('')}
  <p><label><input type="checkbox" id="farLOD" ${S.farLOD!==false?'checked':''}> 멀리 있는 캐릭터 간략화 (30m 밖)</label> · <label><input type="checkbox" id="wxOn" ${S.wxOn!==false?'checked':''}> 날씨 효과 표시</label></p>
  <p>채널 ${V14.CH.me}/${V14.CH.n} · 인원 ${V14.chPop().map((n,i)=>`ch${i+1} ${n}`).join(' · ')} <button id="adminBtn">🛠 관리자 모드 열기</button></p></div>
 <h4>🧪 디버그</h4><p><button id="dbMyL">내 전설 컷인</button> <button id="dbMyM">내 신화 컷인</button> <button id="dbBotL">봇 전설 리본</button> <button id="dbBotM">봇 신화 리본</button><br><button id="dbBox">행운 상자 +1</button> <button id="dbStone">강화석 +10</button> <button id="dbCoin">코인 +5000</button></p></div>`;
 const rr=()=>{save();hud();renderSet();};$('set').querySelectorAll('[name=bdes]').forEach(r=>r.onchange=()=>{S.boxDesign=+r.value;toast('🎁 상자 아이콘 디자인 '+r.value);rr();});$('set').querySelector('[data-close]').onclick=()=>closeM('set');
 $('nickOk').onclick=()=>{S.nick=$('nick').value.trim().slice(0,10);if(me){scene.remove(me.o);scene.remove(me.tag);const p=me.o.position.clone(),d=me.dir;const i=chars.indexOf(me);if(i>=0)chars.splice(i,1);me=makeChar(S.char,NICK());me.o.position.copy(p);me.dir=d;}toast('닉네임: '+NICK());rr();};
 $('set').querySelectorAll('[data-v14]').forEach(el=>el.onchange=()=>{S[el.dataset.v14]=el.value;if(el.dataset.v14==='mapTheme')V14.applyMap(el.value);if(el.dataset.v14==='catchSfx')V14.catchSfx(3);if(el.dataset.v14==='goalFx')V14.goalFx('미리보기','',"🪙 5,000 · 🎁 상자 2",'goal');if(el.dataset.v14==='toastSt'){toast('✅ 강화 성공! +9');setTimeout(()=>toast('⛔ 합성 재료/코인이 부족해요'),250);}if(el.dataset.v14==='mobLay')applyMob();save();});
 $('set').querySelectorAll('[data-unb]').forEach(b=>b.onclick=()=>{V15.unblock(decodeURIComponent(b.dataset.unb));keepScroll('set',renderSet);});
 $('set').querySelectorAll('[data-v18]').forEach(el=>el.onchange=()=>{S[el.dataset.v18]=el.value;save();});$('farLOD').onchange=e=>{S.farLOD=e.target.checked;save();};$('wxOn').onchange=e=>{S.wxOn=e.target.checked;save();};$('adminBtn').onclick=()=>{closeM('set');V14.admin();};
 $('mvS').oninput=e=>{S.moveMul=+e.target.value;$('mvV').textContent='+'+Math.round((S.moveMul-1)*100)+'%';save();};
 $('rkTag').onchange=e=>{S.rankTag=e.target.checked;save();};
 $('set').querySelectorAll('[name=fpsC]').forEach(r=>r.onchange=()=>{S.fpsCap=+r.value||0;save();toast('프레임 상한: '+(S.fpsCap||'제한 없음'));});
 $('cfgApply').onclick=()=>{const lay=($('set').querySelector('[name=dLay]:checked')||{}).value||CFG.lay,bots=Math.max(0,Math.min(50,Math.round(+$('botN').value||0)));const deckW=($('set').querySelector('[name=dW]:checked')||{}).value||'';localStorage.setItem('nk_cfg',JSON.stringify(Object.assign({},CFG,{lay,bots,deckW})));S.savedAt=Date.now();save();location.reload();};
 $('saveNow').onclick=()=>{S.savedAt=Date.now();save();toast('💾 저장 완료');renderSet();};
 $('exp').onclick=()=>{S.savedAt=Date.now();save();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));a.download=`nakmeong-save-${new Date().toISOString().slice(0,10)}.json`;a.click();};
 $('imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{try{const o=JSON.parse(t);if(typeof o.coins!=='number')throw 0;Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,S0,o);SYS.migrate(D,S);save();hud();toast('📂 불러오기 완료');renderSet();}catch(_){toast('잘못된 세이브 파일');}});};
 $('auOn').onchange=e=>{A.on=e.target.checked;rr();};$('auTh').oninput=e=>{A.th=Math.max(1,+e.target.value||1);save();const z=$('auPrev');if(z)z.textContent=autoPrevTxt();};$('auTh').onchange=e=>{A.th=Math.max(1,+e.target.value||1);rr();};
 const ab=$('auBulk');if(ab)ab.onclick=()=>{const L=autoTargets();if(!L.length)return toast('기준 미만 물고기가 없어요');const sum=L.reduce((a,f)=>a+sellP(f),0);confirmBox(`<h3>어항 일괄 자동판매</h3><p>가치 <b>${A.th}</b>코인 미만 <b>${L.length}마리</b>를 상점가로 팔까요?<br>획득 🪙 <b>${sum.toLocaleString()}</b></p><p class="small muted">🔒 잠금 물고기는 제외</p>`,()=>{const ids=new Set(L.map(f=>f.id));S.tank=S.tank.filter(f=>!ids.has(f.id));S.coins+=sum;S.earned+=sum;sfx.coin();toast(`⚙ ${L.length}마리 일괄 판매 +${sum.toLocaleString()}`);rr();});};$('auNew').onchange=e=>{A.keepNew=e.target.checked;rr();};
 $('set').querySelectorAll('[data-vg]').forEach(i=>i.onchange=()=>{g[i.dataset.vg]=i.checked?1:0;applyVG();rr();});
 const myF=g=>{const F=pick(D.FISH.filter(f=>f.rare));return {k:F.k,g,cm:g===4?F.max:F.g[2]};};$('dbMyL').onclick=()=>{closeM('set');legendAlert(NICK(),myF(3),true);};$('dbMyM').onclick=()=>{closeM('set');legendAlert(NICK(),myF(4),true);};$('dbBotL').onclick=()=>{closeM('set');botLegend(0,3);};$('dbBotM').onclick=()=>{closeM('set');botLegend(0,4);};
 $('dbBox').onclick=()=>{S.boxes.push(Date.now());toast('🎁 상자 +1');rr();};$('dbStone').onclick=()=>{S.stones+=10;rr();};$('dbCoin').onclick=()=>{S.coins+=5000;rr();};}
function applyVG(){for(const k in VG)VG[k].forEach(m=>m.visible=!!S.showG[k]);}
// ───────── 도감 (시안1 '카드 컬렉션' + 시안3 크기 눈금자 적용) ─────────
let dexTab='dex';
function renderDex(){const same=renderDex._t===dexTab;renderDex._t=dexTab;return same?keepScroll('dex',_renderDex):_renderDex();}
function _renderDex(){if(dexTab==='ach')return renderAch();if(dexTab==='goal')return renderGoals();const tot=D.FISH.length*6,got=D.FISH.reduce((a,f)=>a+(S.dex[f.k]?S.dex[f.k].gr.slice(0,6).reduce((x,y)=>x+(y||0),0):0),0),sp=D.FISH.filter(f=>S.dex[f.k]).length;
  $('dex').innerHTML=`<div class="card" style="width:min(1000px,95vw)"><button class="close" data-close="dex">×</button><div class="dexhead"><div class="ring" style="--p:${got/tot*100}"><span>${Math.round(got/tot*100)}%</span></div>
  <div><div class="tabs dtabs"><button class="on" data-dtab="dex">📖 도감</button><button data-dtab="ach">🏆 업적·패시브</button><button data-dtab="goal">🎯 수집 목표</button></div><h2 style="margin:0">📖 낚멍 물고기 도감</h2><div class="small">어종 ${sp}/${D.FISH.length} · 등급 슬롯 ${got}/${tot} · 총 ${S.caught}마리 낚음</div><div class="pips" style="width:270px">${D.GRADES.map(g=>`<i class="on" style="--c:${g.c}" title="${g.n}"></i>`).join('')}<i class="txpip on" title="초월"></i></div><div class="small muted">${D.GRADES.map(g=>g.n).join(' · ')} · <span class="txname">초월</span> (어종별 초월 ${D.FISH.filter(f=>S.dex[f.k]&&S.dex[f.k].gr[5]).length}/${D.FISH.length})</div></div></div>
  <div class="dgrid">${D.FISH.map((f,i)=>{const d=S.dex[f.k];const best=d?d.gr.lastIndexOf(1):-1,c=best>=0?gc(best):'#d8d2ca',bounds=[f.min,...f.g,f.max],span=f.max-f.min;
   return `<div class="dcard ${d?'g'+best:'unk'}" style="--gc:${c}" data-frank="${f.k}" title="클릭: 최대 크기 랭킹"><div class="shine"></div><div class="no">No.${String(i+1).padStart(3,'0')}</div><img src="${d?f.img:f.img.replace('.png','_sil.png')}"><div class="nm">${d?f.n:'???'}</div>
   <div class="small">${d?`최대 <b>${d.max}cm</b> · ${d.n}마리 · 최고 <span class="gbadge" style="--gc:${c}">${GR(best).n}</span>`:'아직 만나지 못한 물고기'}</div>
   <div class="pips">${D.GRADES.map((g,j)=>`<i class="${d&&d.gr[j]?'on':''}" style="--c:${g.c}" title="${g.n} ${bounds[j]}~${bounds[j+1]}cm"></i>`).join('')}<i class="txpip ${d&&d.gr[5]?'on':''}" title="초월 ${Math.round(f.max*D.TX.lo)}~${Math.round(f.max*D.TX.hi)}cm"></i></div>
   <div class="ruler">${D.GRADES.map((g,j)=>`<span style="width:${(bounds[j+1]-bounds[j])/span*100}%;background:${g.c};opacity:${d&&d.gr[j]?1:.28}"></span>`).join('')}${d?`<div class="mk" style="left:calc(${(d.max-f.min)/span*100}% - 1px)"></div>`:''}</div>
   <div class="small muted">${f.min}cm ~ ${f.max}cm${d&&d.gr[5]?` · <b class="txt">초월 ${Math.round(f.max*D.TX.lo)}~${Math.round(f.max*D.TX.hi)}cm</b>`:''}</div>${best===5?'<span class="sp" style="left:8%;top:6%">✦</span><span class="sp" style="left:86%;top:40%;animation-delay:.6s">✦</span><span class="sp" style="left:14%;top:70%;animation-delay:1.1s">✦</span>':''}</div>`;}).join('')}</div><p class="small muted">크기 기준 출처: FishBase, 국립생물자원관, 경북 민물고기연구센터, 낚시춘추 한국 최대어 DB 등 (README 참고)</p></div>`;
  $('dex').querySelector('[data-close]').onclick=()=>closeM('dex');dexTabs();}
function dexTabs(){$('dex').querySelectorAll('[data-dtab]').forEach(b=>b.onclick=()=>{dexTab=b.dataset.dtab;renderDex();});}
function renderAch(){const same=renderDex._t===dexTab;renderDex._t=dexTab;return same?keepScroll('dex',_renderAch):_renderAch();}
function _renderAch(){const P=SYS.passives(D,S),A=P.ach,done=A.filter(a=>a.done).length,O=D.CHARM.opts;
 $('dex').innerHTML=`<div class="card" style="width:min(1000px,95vw)"><button class="close" data-close="dex">×</button><div class="tabs dtabs"><button data-dtab="dex">📖 도감</button><button class="on" data-dtab="ach">🏆 업적·패시브</button><button data-dtab="goal">🎯 수집 목표</button></div>
 <h2>🏆 도감 업적 <small class="pill">${done}/${A.length} 달성</small></h2><p class="small muted">업적·어항 조합 패시브는 부적 합산 상한과 <b>별도</b>로 더해지며, 패시브끼리 옵션별 상한이 있어요 (밸런스 보호).</p>
 <div class="sumgrid">${Object.keys(O).map(k=>`<span class="${P.sum[k]?'on':''}" data-tip="${O[k].n}: ${O[k].d}
업적+조합 원합계 ${R1x(P.raw[k])}% · 상한 ${D.PASSIVE.cap[k]}%">${O[k].n} <b>+${P.sum[k]}%</b><small>/${D.PASSIVE.cap[k]}</small></span>`).join('')}</div>
 <div class="achgrid">${A.map(x=>`<div class="ach ${x.done?'done':''}"><div class="ai">${x.done?'🏆':'🔒'}</div><div><b>${x.a.n}</b><div class="small muted">${x.a.d}</div><div class="bar"><i style="width:${x.c/x.n*100}%"></i></div><div class="small">${x.c}/${x.n} · 보상 <b>${effTxt(x.a.e)}</b></div></div></div>`).join('')}</div>
 <h3>🧩 어항 조합 (현재 내 어항 기준)</h3><div class="achgrid">${P.combo.map(x=>`<div class="ach ${x.on?'done':''}"><div class="ai">🧩</div><div><b>${x.c.n}</b><div class="small muted">${x.c.ks.map(k=>FI(k).n).join(' + ')}</div><div class="small">${x.on?`✅ ${GR(x.lv).n} 조합 · ${effTxt(x.e)}`:`${x.have}/${x.c.ks.length} · 기본 ${effTxt(x.c.e)}`}</div></div></div>`).join('')}</div></div>`;
 $('dex').querySelector('[data-close]').onclick=()=>closeM('dex');dexTabs();}
// ───────── 사운드 선택 UI ─────────
function renderSound(){return keepScroll('sound',_renderSound);}
function _renderSound(){const row=(cat,i,s)=>{const sel=cat==='day'?S.sDay===i:S.sNight===i;return `<div class="snd ${sel?'on':''}"><span>${cat==='day'?'☀️':'🌙'} ${s.n}</span><span><button data-pv="${cat}:${i}">▶ 들어보기</button> ${sel?'<b>✔ 선택됨</b>':`<button class="ok" data-sel="${cat}:${i}">선택</button>`}</span></div>`;};
  $('sound').innerHTML=`<div class="card" style="width:min(560px,94vw)"><button class="close" data-close="sound">×</button><h2>🔊 자연 사운드 시안</h2><p class="small muted">낮/밤 사운드는 시간에 따라 자동으로 크로스페이드돼요. '들어보기'는 15초 동안 해당 소리만 재생.</p>
   <h4>🎚 낮·밤 사운드</h4><div class="ambone">${[['auto','시간 따라 자동 전환'],['day','낮 소리로 통일'],['night','밤 소리로 통일']].map(([v,n])=>`<label><input type="radio" name="ambOne" value="${v}" ${(S.ambOne||'auto')===v?'checked':''}> ${n}</label>`).join(' ')}</div><h4>🌧 빗소리</h4><div class="ambone"><label><input type="checkbox" id="rainOn" ${S.rainOn!==false?'checked':''}> 비 올 때 빗소리 재생</label></div><div class="ambone"><b>빗소리만 (이슬비)</b> ${RAIN.r.map(([k,n])=>`<label><input type="radio" name="rainR" value="${k}" ${(S.rainR||'r1')===k?'checked':''}> ${n}</label>`).join(' ')}</div><div class="ambone"><b>빗소리+천둥 (소나기)</b> ${RAIN.t.map(([k,n])=>`<label><input type="radio" name="rainT" value="${k}" ${(S.rainT||'t1')===k?'checked':''}> ${n}</label>`).join(' ')}</div><p class="small muted">고르면 10초 동안 미리 들려줘요.</p><h4>☀️ 낮</h4>${D.SOUNDS.day.map((s,i)=>row('day',i,s)).join('')}<h4>🌙 밤</h4>${D.SOUNDS.night.map((s,i)=>row('night',i,s)).join('')}
   <p>볼륨 <input type="range" min="0" max="1" step=".05" value="${S.vol}" id="vol"> <button id="mute">${snd.on?'🔇 끄기':'🔊 켜기'}</button></p><p class="small muted">출처: sounds/CREDITS.md (Wikimedia Commons CC0/PD/CC BY)</p></div>`;
  const q=s=>$('sound').querySelectorAll(s);q('[data-close]').forEach(b=>b.onclick=()=>closeM('sound'));
  q('[name=ambOne]').forEach(r=>r.onchange=()=>{S.ambOne=r.value;save();});$('rainOn').onchange=e=>{S.rainOn=e.target.checked;save();};q('[name=rainR],[name=rainT]').forEach(r=>r.onchange=()=>{S[r.name]=r.value;save();snd.rainForce=r.value;snd.rainV=0;snd.rainK='';clearTimeout(snd._rf);snd._rf=setTimeout(()=>snd.rainForce='',10000);});q('[data-sel]').forEach(b=>b.onclick=()=>{const[c,i]=b.dataset.sel.split(':');if(c==='day')S.sDay=+i;else S.sNight=+i;save();setAmb();renderSound();});
  q('[data-pv]').forEach(b=>b.onclick=()=>{const[c,i]=b.dataset.pv.split(':');if(c==='day')S.sDay=+i;else S.sNight=+i;save();setAmb();snd.force=c;snd.forceT=15;(c==='day'?snd.day:snd.night).currentTime=0;(c==='day'?snd.day:snd.night).play().catch(()=>{});renderSound();});
  $('vol').oninput=e=>{S.vol=+e.target.value;save();};$('mute').onclick=()=>{snd.on=!snd.on;renderSound();};}
// ───────── 입력 ─────────
const keys={},joy={x:0,y:0};
addEventListener('keydown',e=>{if(document.activeElement.tagName==='INPUT')return;keys[e.code]=1;
  if(e.code==='Space'){fishAction();e.preventDefault();}if(e.code==='KeyF')anyModal()&&$('tank').classList.contains('show')?closeM('tank'):tankView.open('me');
  if(e.code==='KeyB')$('dex').classList.contains('show')?closeM('dex'):(renderDex(),openM('dex'));if(e.code==='KeyE')interact();if(e.code==='Escape')document.querySelectorAll('.modal.show').forEach(m=>m.id!=='start'&&closeM(m.id));});
addEventListener('keyup',e=>keys[e.code]=0);
function interact(){if(anyModal())return;const p=me.o.position;if(Math.hypot(p.x-SHOP.x,p.z-SHOP.z)<7){renderShop();openM('shop');return;}
  const d=decks.find(d=>Math.hypot(p.x-d.tank.x,p.z-d.tank.z)<2.6);if(d){openTankOf(d);return;}renderShop();openM('shop');}
function openTankOf(d){if(d.i===0)return tankView.open('me');const b=bots.find(b=>b.deck===d);if(b)tankView.open(b);else toast('빈 데크예요. 여기서 낚시할 수 있어요!');}
const ray=new THREE.Raycaster(),mv2=new THREE.Vector2();
$('world').addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,m:0};});
addEventListener('pointermove',e=>{if(!drag)return;if(e.pointerType==='touch'&&e.target.closest&&e.target.closest('#joy'))return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.m+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.006;pitch=Math.max(.12,Math.min(1.25,pitch+dy*.004));drag.x=e.clientX;drag.y=e.clientY;});
addEventListener('pointerup',e=>{if(drag&&drag.m<6&&e.target===$('world')){mv2.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);ray.setFromCamera(mv2,cam);const h=ray.intersectObjects(tankPickers,true)[0];
  if(h&&h.object.userData.myTank)openTankOf(decks[0]);else if(h&&h.instanceId!=null)openTankOf(decks[h.instanceId]);else if(fishing.state!=='off')fishAction();}drag=null;});
let distT=null;$('world').addEventListener('wheel',e=>{e.preventDefault();distT=Math.max(6,Math.min(26,(distT==null?dist:distT)+Math.max(-3,Math.min(3,e.deltaY*.01))));},{passive:false});
if('ontouchstart' in window||navigator.maxTouchPoints>0){const j=$('joy'),k=j.firstElementChild;j.style.display='block';const mv=e=>{const t=e.targetTouches[0],r=j.getBoundingClientRect();let x=(t.clientX-r.left-58)/46,y=(t.clientY-r.top-58)/46;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}joy.x=x;joy.y=y;k.style.left=36+x*36+'px';k.style.top=36+y*36+'px';e.preventDefault();e.stopPropagation();};
  j.addEventListener('touchstart',mv,{passive:false});j.addEventListener('touchmove',mv,{passive:false});j.addEventListener('touchend',()=>{joy.x=joy.y=0;k.style.left=k.style.top='36px';});}
$('fishBtn').onclick=e=>{e.stopPropagation();fishAction();};$('bDex').onclick=()=>{renderDex();openM('dex');};$('bTank').onclick=()=>tankView.open('me');$('bShop').onclick=()=>{renderShop();openM('shop');};
$('bSound').onclick=()=>{renderSound();openM('sound');};$('bSit').onclick=()=>{if(mySeat)standUp();else if(nearSeat)sitOn(nearSeat);else toast('의자 가까이 가면 앉을 수 있어요',1400);};$('bTime').onclick=()=>{time.t=((Math.floor(time.t*3)+1)%3)/3+.02;};$('bAuto').onclick=()=>{time.auto=!time.auto;setMB('bAuto','🕒','시간 흐름 '+(time.auto?'ON':'OFF'));};
['😊','👍','🐟','❤️','😴','🎉'].forEach(em=>{const b=document.createElement('button');b.textContent=em;b.onclick=()=>{emote(NICK(),em,true);if(document.activeElement===$('msg'))$('msg').focus();};$('emo').appendChild(b);});
{const M=$('msg');let pend=false,ign=0;const send=()=>{const v=M.value.trim();if(!v)return false;say(NICK(),v,true);M.value='';return true;};
 M.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();M.value='';M.blur();return;}if(e.key!=='Enter')return;e.stopPropagation();if(e.isComposing||e.keyCode===229){pend=true;return;}e.preventDefault();if(performance.now()<ign)return;if(!send())M.blur();});
 M.addEventListener('compositionend',()=>{if(pend){pend=false;ign=performance.now()+120;setTimeout(send,0);}});
 M.addEventListener('focus',()=>{for(const k in keys)keys[k]=0;});
 addEventListener('keydown',e=>{if(e.key!=='Enter'||e.isComposing)return;const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.tagName==='SELECT'||a.isContentEditable))return;if(!started||anyModal())return;e.preventDefault();M.focus();});}
let sitting=false,mySeat=null,nearSeat=null;
// v20: 의자 — 데크 의자(W1~W4)는 앉아야 낚시 가능, 모닥불 벤치는 2인(자리 2개). 봇은 플레이어 몫 1~2자리를 남겨 둠
const seatFree=st=>st.occ.length<st.cap;
function seatTake(st,who){if(!st||!seatFree(st))return false;st.occ.push(who);return true;}
function seatLeave(who){SEATS.forEach(st=>{const i=st.occ.indexOf(who);if(i>=0)st.occ.splice(i,1);});}
function sitOn(st){if(!seatTake(st,'me'))return;mySeat=st;sitting=true;me.o.position.set(st.x,st.y,st.z);me.dir=st.kind==='bench'?Math.atan2(SH.x-st.x,SH.z-st.z):Math.atan2(-st.x,-st.z);}
function sitUI(){let b=$('sitBtn');if(!b){b=document.createElement('button');b.id='sitBtn';document.body.appendChild(b);b.onclick=e=>{e.stopPropagation();$('bSit').onclick();};}
 const on=!!(nearSeat||mySeat)&&fishing.state==='off'&&!anyModal();b.style.display=on?'':'none';if(on){const fb=$('fishBtn'),r=fb&&fb.style.display!=='none'?fb.getBoundingClientRect():null;b.style.bottom=(r&&r.height?Math.round(innerHeight-r.top+12):150)+'px';}const t=mySeat?'🪑 일어나기':'🪑 앉기'+(nearSeat&&nearSeat.kind==='stool'&&DW?' (낚시 자리)':'');if(b.textContent!==t)b.textContent=t;const sb=$('bSit');if(sb)sb.classList.toggle('ready',!!(nearSeat||mySeat));}
function standUp(){if(mySeat){const st=mySeat;seatLeave('me');mySeat=null;if(me){const p=me.o.position,a=me.dir;let ok=false;for(const r of [1.0,1.35,1.8,2.3]){for(const da of [0,.6,-.6,1.2,-1.2,Math.PI/2,-Math.PI/2,2.2,-2.2,Math.PI]){const x=st.x+Math.sin(a+da)*r,z=st.z+Math.cos(a+da)*r;if(walk(x,z)){p.x=x;p.z=z;ok=true;break;}}if(ok)break;}p.y=inDeck(p.x,p.z)?.39:Math.max(H(p.x,p.z),.1);}}sitting=false;}
// ───────── 시작 화면 ─────────
{const grp=i=>KINDS[i].grp||'b',tabs=[['b','기본'],['h','사람'],['a','동물']];let tab=grp(S.char||0);
 const drawCP=()=>{$('charPick').innerHTML=`<div class="cpt">${tabs.map(([k,n])=>`<span data-cpt="${k}" class="${tab===k?'on':''}">${n} ${KINDS.filter((x,i)=>grp(i)===k&&(i<4||i>7)).length}</span>`).join('')}</div><div class="cpg">${KINDS.map((k,i)=>[i,k]).filter(([i,k])=>grp(i)===tab&&(i<4||i>7)).map(([i,k])=>`<button data-ch="${i}" class="${S.char===i?'sel':''} ${lvCharOK(i)?'':'lk'}" ${lvCharOK(i)?'':`data-lk="🔒 Lv.${lvCharReq(i)}"`} title="${k.n}${lvCharOK(i)?'':' · Lv.'+lvCharReq(i)+'에 열려요'}">${k.th?`<img src="img/chars/${k.th}.jpg" alt="">`:`<i>${['🧔','👩','👦','👧'][i]||'🙂'}</i>`}<span>${k.n}</span></button>`).join('')}</div>`;
  $('charPick').querySelectorAll('[data-cpt]').forEach(b=>b.onclick=()=>{tab=b.dataset.cpt;drawCP();});
  $('charPick').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(!lvCharOK(+b.dataset.ch)){toast(`🔒 「${KINDS[+b.dataset.ch].n}」은(는) Lv.${lvCharReq(+b.dataset.ch)}에 열려요`,1800);return;}S.char=+b.dataset.ch;save();$('charPick').querySelectorAll('button').forEach(x=>x.classList.toggle('sel',x===b));stUpd();});};drawCP();

 // v19: 시작 화면 B(데스크톱) / D(모바일 단계형). 닉네임·서버·캐릭터는 localStorage에 기억
 const stEl=document.querySelector('#start .stB'),mob=()=>innerWidth<700;
 const stUpd=()=>{if(!V14)return;const K=KINDS[S.char]||KINDS[0];$('stImg').src=K.th?`img/chars/${K.th}.jpg`:'img/chars/b0.jpg';$('stName').textContent=K.n;$('stDesc').textContent=K.d||'';const ch=V14.CH;$('go').textContent=mob()?`${K.n}(으)로 시작`:`시작하기 (호숫가 ${ch.me})`;};
 const srvDraw=()=>{const ch=V14.CH,pop=V14.chPop().map((n,i)=>i+1===ch.me?Math.max(n,(+CFG.bots||9)+1):n),cap=40;$('stSrv').innerHTML=pop.map((n,i)=>{const r=Math.min(1,n/cap),full=r>=1;return `<button class="sv ${ch.me===i+1?'on':''}" data-sv="${i+1}" ${full?'disabled':''}><b>호숫가 ${i+1}</b><span class="bar"><i class="${r>.8?'hi':''}" style="width:${Math.round(r*100)}%"></i></span><small>${full?'가득':r>.8?'혼잡':i===0?'추천':n+'명'}</small></button>`;}).join('');
  $('stSrv').querySelectorAll('[data-sv]').forEach(b=>b.onclick=()=>{ch.me=+b.dataset.sv;CFG.ch=ch.me;localStorage.setItem('nk_cfg',JSON.stringify(CFG));srvDraw();stUpd();});};
 const nickChk=()=>{const v=$('stNick').value.trim();$('stNickOk').textContent=v?`"${v}" (으)로 표시돼요`:"비워 두면 '나'로 표시돼요";};
 $('stNick').value=S.nick||'';$('stNick').oninput=()=>{S.nick=$('stNick').value.trim().slice(0,10);save();nickChk();};nickChk();
 const step=n=>{stEl.dataset.step=n;stEl.querySelectorAll('.stSteps span').forEach(x=>x.className=+x.dataset.s<n?'done':+x.dataset.s===n?'on':'');};
 stEl.querySelectorAll('.stNext').forEach(b=>b.onclick=()=>step(+b.dataset.to));
 step(S.nick&&mob()?3:1);const stInit=()=>{if(!V14)return setTimeout(stInit,80);srvDraw();stUpd();};stInit();addEventListener('resize',stUpd);}
$('go').disabled=true;
// ───────── 메인 ─────────
let fpsA=60,camOverride=null;let started=false,T=0,last=performance.now();
function frame(now){if(S.fpsCap&&now-last<1000/S.fpsCap-1.5){requestAnimationFrame(frame);return;}const dt=Math.min((now-last)/1000,.05);last=now;T+=dt;if(time.auto)time.t=(time.t+dt/time.len)%1;const p=palette();setMB('bTime','🌗',p.name);
  if(snd.forceT>0){snd.forceT-=dt;if(snd.forceT<=0)snd.force=null;}NIGHT=p.night;updAmb(p);updRain(dt);
  scene.background=p.sky;scene.fog.color.copy(p.sky);sun.color.copy(p.sun);sun.intensity=p.si;hemi.intensity=p.hemi;hemi.groundColor.copy(p.gnd);wU.deep.value.copy(p.deep);wU.shal.value.copy(p.shal);wU.sky.value.copy(p.sky);wU.night.value=p.night;wU.t.value=T;wU.mode.value=+(S.waterQ||5);dayGrade(p);if(window.NKGRADE)window.NKGRADE(p);
  fireL.intensity=p.fire*(.82+Math.sin(T*13)*.07+Math.sin(T*7.1)*.06+Math.sin(T*23.7)*.04+(Math.random()-.5)*.05);fireMesh.userData.tick(T,dt,p.night);lanL.intensity=p.lan;if(lanGlow)lanGlow.material.color.copy(lerpC('#d8d2c4','#ffd27a',Math.min(1,p.night+p.lan*.3)));
  if(worldFish){worldFish.d.forEach((f,i)=>{f.a+=f.s*dt;M4.compose(V.set(Math.cos(f.a)*f.r,-.85,Math.sin(f.a)*f.r),Q.setFromAxisAngle(UP,-f.a+(f.s>0?-Math.PI/2:Math.PI/2)),SC.setScalar(f.sz));worldFish.m.setMatrixAt(i,M4);});worldFish.m.instanceMatrix.needsUpdate=true;}
  if(started&&me){// 이동
    let mx=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.x,my=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-joy.y;const l=Math.hypot(mx,my);if(l>1){mx/=l;my/=l;}
    const pp=me.o.position;let moving=false;
    if((mx||my)&&fishing.state==='off'&&!anyModal()){if(mySeat||sitting)standUp();const sx=Math.sin(yaw),cz=Math.cos(yaw),dx=-my*sx+mx*cz,dz=-my*cz-mx*sx,sp=5.2*(S.moveMul||1.35)*dt;
      const _stk=!walk(pp.x,pp.z);if(_stk||walk(pp.x+dx*sp,pp.z))pp.x+=dx*sp;if(_stk||walk(pp.x,pp.z+dz*sp))pp.z+=dz*sp;me.dir=Math.atan2(dx,dz);moving=true;}
    pp.y=mySeat?mySeat.y:inDeck(pp.x,pp.z)?.39:Math.max(H(pp.x,pp.z),.1);
    nearSeat=mySeat?null:SEATS.filter(seatFree).map(st=>[st,Math.hypot(pp.x-st.x,pp.z-st.z)]).filter(a=>a[1]<1.6).sort((a,b)=>a[1]-b[1]).map(a=>a[0])[0]||null;sitUI();
    me.play(mySeat?'sit':fishing.state!=='off'?'holding-right':moving?'walk':sitting?'sit':'idle');me.rod.visible=fishing.state!=='off'||nearSpot!=null;turn(me,dt);
    nearSpot=DW?(mySeat&&mySeat.kind==='stool'&&canFishAt(mySeat.deck)?mySeat.deck:null):decks.find(d=>canFishAt(d)&&Math.hypot(pp.x-d.tip.x,pp.z-d.tip.z)<2.4)||null;
    $('fishBtn').style.display=nearSpot||fishing.state!=='off'?'block':'none';V14.fishBtn(fishing.state);$('fishBtn').classList.toggle('far',!(nearSpot||fishing.state!=='off'));
    const nearShop=Math.hypot(pp.x-SHOP.x,pp.z-SHOP.z)<7,nd=decks.find(d=>Math.hypot(pp.x-d.tank.x,pp.z-d.tank.z)<2.6);
    $('prompt').style.display=(nearShop||nd)&&fishing.state==='off'?'block':'none';$('prompt').textContent=nearShop?'E · 상점 열기':nd?(nd.i===0?'F/E · 내 어항 보기':nd.owner?`E · ${nd.owner}님 어항 구경·구매`:'빈 데크 · 낚시 가능'):'';
    // 낚시 진행
    autoTick(dt);
    if(fishing.state==='cast'){fishing.t+=dt;if(fishing.fakes&&fishing.fakes.length&&fishing.t>fishing.fakes[0]&&fishing.t<fishing.bite-1){fishing.fakes.shift();fishing.jig=.55;}if(fishing.t>fishing.bite){fishing.state='bite';sfx.bite();if(!S.autoFish)toast(('ontouchstart' in window||navigator.maxTouchPoints>0)?'❗ 입질! 지금 탭!':'❗ 입질! 지금 클릭/Space!',1100);}}
    if(fishing.jig>0){fishing.jig-=dt;bob.rotation.z=Math.sin(performance.now()/28)*.35*Math.max(0,fishing.jig/.55);bob.scale.setScalar(1+.12*Math.max(0,fishing.jig/.55));}else if(bob.rotation.z){bob.rotation.z=0;bob.scale.setScalar(1);}
    else if(fishing.state==='bite'){fishing.t+=dt;if(S.autoFish&&fishing.t>fishing.bite+(fishing.react||(fishing.react=rand(...D.AUTO.reactSec))))fishAction(true);else if(fishing.t>fishing.bite+5){fishing.state='cast';fishing.bite=fishing.t+rand(4,8);fishing.fakes=[];toast('놓쳤어요… 다시 기다려요',1000);}}
    if(castT>=0){const _pc=castT;castT=Math.min(1,castT+dt*1.4);if(_pc<1&&castT>=1)sfx.drop();const tip=me.tip.getWorldPosition(new THREE.Vector3());bob.visible=line.visible=true;const st=pp.clone().add(V.set(0,3,0));bob.position.lerpVectors(st,castTo,castT);bob.position.y+=Math.sin(castT*Math.PI)*3.5;
      if(castT>=1){const bite=fishing.state==='bite';bob.position.y=-.05+(bite?Math.sin(T*22)*.12-.12:Math.sin(T*2)*.03);wU.bob.value.set(castTo.x,bite?1.6:.5,castTo.z);}
      const a=lineG.attributes.position;a.setXYZ(0,tip.x,tip.y,tip.z);a.setXYZ(1,bob.position.x,bob.position.y,bob.position.z);a.needsUpdate=true;}
    updBots(dt,T);botBuy(dt);botLegend(dt);botRestock(dt);botBoxAlert(dt);
    if(distT!=null){dist+=(distT-dist)*Math.min(1,dt*10);if(Math.abs(distT-dist)<.01){dist=distT;distT=null;}}cam.position.set(pp.x+Math.sin(yaw)*Math.cos(pitch)*dist,pp.y+1.6+Math.sin(pitch)*dist,pp.z+Math.cos(yaw)*Math.cos(pitch)*dist);cam.lookAt(pp.x,pp.y+1.6,pp.z);occFade(dt,pp);}
  for(const c of chars){if(!c._fc){c._fc=1;c.o.traverse(m=>{if(m.isMesh)m.frustumCulled=false;});}if(!c.offline&&!(c.simp&&c.simp.visible)){c.mixer.update(dt);if(c.holdQ&&c.cur==='sit'&&c.rod.visible)c.arm.quaternion.copy(c.holdQ);if(c.rig)animWalk(c,dt);}poseRod(c,dt);c.tag.position.set(c.o.position.x,c.o.position.y+c.h*1.0+.62,c.o.position.z);const dd=cam.position.distanceTo(c.tag.position),far=V14.farLOD(c,dd);const rk=S.rankTag!==false&&!c.offline?tagRank(c):0;V14.layer();const rs=rk?V14.rankDom(c,rk,dd):V14.rankDom(c,0,dd);c.tag.visible=!rs&&!c.offline&&!far;if(!rs){c.tag.userData.lv=c===me?myLv():c.lv||(c.lv=3+Math.floor(seedR(c.name)()*58));drawTag(c.tag,null,0);}c.rkUp=rs;const bb=c.offline||c.muted?null:bubbleOf(c);domBub(c,dd<70?bb:null,dd);}V14.tick(dt,p);
  if(camOverride){cam.position.set(camOverride[0],camOverride[1],camOverride[2]);cam.lookAt(camOverride[3],camOverride[4],camOverride[5]);}R.render(scene,cam);tankView.frame(dt,T);
  fpsA=fpsA*.95+(1/Math.max(dt,1e-3))*.05;$('dc').textContent=`FPS ${fpsA.toFixed(0)} · draw calls ${R.info.render.calls} · tris ${(R.info.render.triangles/1000).toFixed(1)}k · decks ${DECKS}`;window.__nk={calls:R.info.render.calls,tris:R.info.render.triangles};requestAnimationFrame(frame);}
loadAll().then(()=>{buildTerrain();buildWater();buildDecks();buildWorld();applyVG();setInterval(()=>{S.savedAt=Date.now();save();},30000);
  bob=new THREE.Mesh(new THREE.SphereGeometry(.15,8,6),new THREE.MeshLambertMaterial({color:'#ff6a5a',emissive:'#ff3a2a',emissiveIntensity:.3}));bob.visible=false;scene.add(bob);
  lineG=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]);line=new THREE.Line(lineG,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.7}));line.frustumCulled=false;line.visible=false;scene.add(line);
  const d0=decks[0];lanL.position.set(d0.lantern.x,2.2,d0.lantern.z);
  makeBots();$('loading').textContent='준비 완료!';$('go').disabled=false;
  const cam0=()=>{yaw=Math.atan2(Math.cos(d0.a),Math.sin(d0.a));cam.position.set(0,30,-70);cam.lookAt(0,0,0);};cam0();
  $('go').onclick=()=>{me=makeChar(S.char,NICK());me.o.position.set(d0.entry.x,.4,d0.entry.z);me.dir=d0.a+Math.PI;started=true;$('start').classList.remove('show');startAudio();hud();say('시스템','낚멍에 오신 걸 환영해요! 데크 끝에서 낚시를 시작해보세요 🎣');};
  hud();requestAnimationFrame(frame);setTimeout(()=>{try{calcRK3();}catch(e){}},1500);setInterval(()=>{try{calcRK3();}catch(e){}},30000);updBagBadge();
  $('bBag').onclick=openBag;$('bSet').onclick=()=>{renderSet();openM('set');};$('bSave').onclick=()=>{S.savedAt=Date.now();save();toast('💾 저장 완료');};
  addEventListener('contextmenu',e=>e.preventDefault());
  ;(function(){const ap=()=>document.body.classList.toggle('tx-rainbow',S.txStyle==='rainbow');ap();document.addEventListener('change',e=>{if(e.target&&e.target.name==='txs'){S.txStyle=e.target.value;save();ap();}});})();
// ───────── v9 상단 메뉴 레이아웃 (B 기본, 설정에서 A/C/D) ─────────
const MENU={main:[['bDex','📖','도감'],['bTank','🐠','어항'],['bShop','🛒','상점'],['bBag','🎒','가방']],sys:[['bSave','💾','저장'],['bSound','🔊','사운드'],['bSet','⚙️','설정'],['bSit','🪑','앉기'],['bTime','🌗','낮'],['bAuto','🕒','시간 흐름 ON']]};
(function buildMenu(){const top=document.querySelector('#hud .top');[...MENU.main,...MENU.sys].forEach(([id,ic,l])=>{const b=$(id);const kb=b.querySelector('kbd');b.innerHTML=`<b class="mi">${ic}</b><small class="ml">${l}</small>${kb?kb.outerHTML:''}`;b.title=b.title||l;});
 const mk=(id,cls)=>{const d=document.createElement('div');d.id=id;d.className=cls;$('hud').appendChild(d);return d;};
 const st=mk('mStat','mgrp'),mn=mk('mMain','mgrp'),sy=mk('mSys','mgrp');st.appendChild(document.querySelector('#hud .logo'));st.appendChild($('coins'));st.appendChild($('equip'));
 MENU.main.forEach(([id])=>mn.appendChild($(id)));{const ab=document.createElement('button');ab.id='bAutoFish';ab.onclick=e=>{e.stopPropagation();toggleAuto();};mn.insertBefore(ab,$('bShop'));updAutoBtn();}MENU.sys.forEach(([id])=>sy.appendChild($(id)));
 const more=document.createElement('button');more.id='bMore';more.innerHTML='<b class="mi"><i class="hb"></i></b><small class="ml">메뉴</small>';more.onclick=e=>{e.stopPropagation();document.body.classList.toggle('menu-open');};$('hud').appendChild(more);
 document.addEventListener('pointerdown',e=>{if(document.body.classList.contains('menu-open')&&!e.target.closest('#mSys,#bMore,#mMain'))document.body.classList.remove('menu-open');});
 sy.addEventListener('click',e=>{if(e.target.closest('button')&&!e.target.closest('#bTime,#bAuto'))document.body.classList.remove('menu-open');});
 top.style.display='none';})();
function applyMenu(){const m=S.menuStyle||'b';document.body.classList.remove('menu-a','menu-b','menu-c','menu-d','menu-open');document.body.classList.add('menu-'+m);}
applyMenu();
function applyCard(){document.body.dataset.card=S.cardStyle||'d';}applyCard();
document.addEventListener('change',e=>{if(e.target&&e.target.name==='menuS'){S.menuStyle=e.target.value;save();applyMenu();}if(e.target&&e.target.name==='cardS'){S.cardStyle=e.target.value;save();applyCard();}});
document.addEventListener('click',e=>{if(e.target&&e.target.id==='cardPrev'){const F=D.FISH[7],G0=D.GRADES[2];closeM('set');toast(catchCard({cm:47.2,v:186},F,G0,{isNew:true,newG:false,rec:false,where:'🐠 내 어항에 넣었어요'}),2600);}});
// ═════════ v14 ═════════
V14=(()=>{
 const KST=()=>new Date(Date.now()+9*3600e3),SEASONS=['spring','summer','autumn','winter'],SN={spring:'봄',summer:'여름',autumn:'가을',winter:'겨울'};
 const realSeason=()=>{const m=KST().getUTCMonth()+1;return m>=3&&m<=5?'spring':m<=8&&m>=6?'summer':m>=9&&m<=11?'autumn':'winter';};
 const season=()=>S.seasonOv&&S.seasonOv!=='auto'?S.seasonOv:realSeason();
 // ── 날씨 ──
 const WX={clear:'맑음',drizzle:'이슬비',storm:'소나기·천둥',snow:'함박눈',cherry:'벚꽃 바람',leaf:'낙엽',firefly:'반딧불 밤',meteor:'별똥별 밤',aurora:'오로라'};
 const W={k:'clear',until:0,night:null,buffT:0,meteorT:3};
 function rollDay(){const se=season(),r=Math.random();const sea={spring:'cherry',autumn:'leaf',winter:'snow'}[se];
  if(sea&&r<.22)return sea;if(r<(sea?.22:0)+.15)return 'drizzle';if(r<(sea?.22:0)+.15+(se==='summer'?.15:.08))return se==='winter'?'snow':'storm';return 'clear';}
 function rollNight(){const se=season(),r=Math.random(),au=se==='winter'?.04:.02,me=.12,ff=se==='summer'?.40:se==='winter'?0:.25;
  if(r<au)return 'aurora';if(r<au+me)return 'meteor';if(r<au+me+ff)return 'firefly';return null;}
 function cur(){const ov=S.wxOv&&S.wxOv!=='auto'?S.wxOv:null;if(ov)return ov;const night=NIGHT>.5;
  if(performance.now()>W.until){W.k=rollDay();W.until=performance.now()+rand(240,420)*1000;}
  if(night){if(W.night===null){W.night=W.k==='clear'||W.k==='leaf'||W.k==='cherry'?rollNight()||'':'';}if(W.night)return W.night;}else W.night=null;
  return W.k;}
 const fx={waitMul:()=>S.__wx==='drizzle'?.95:1,rareMul:()=>(S.__wx==='storm'?1.1:1)*(W.buffT>0?1.2:1),nightMul:()=>S.__wx==='firefly'?1.1:1,boxMul:()=>S.__wx==='aurora'?1.3:1};
 let cv,cx,P=[],lastK='';
 function ensure(){if(cv)return;cv=document.createElement('canvas');cv.id='wxCv';const H=document.getElementById('hud');H.parentNode.insertBefore(cv,H);cx=cv.getContext('2d');}
 function draw(dt,p){ensure();const w=innerWidth,h=innerHeight;if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}const c=cx,k=S.__wx,t=performance.now()/1000;c.clearRect(0,0,w,h);if(k!==lastK){P=[];lastK=k;}
  const safe=(x,y)=>{const dx=(x-w/2)/(w*.22),dy=(y-h*.55)/(h*.3);return Math.min(1,.2+Math.sqrt(dx*dx+dy*dy)*.8);},area=w*h/(1280*720);
  if(k==='drizzle'||k==='storm'){const n=(k==='storm'?260:110)*area,len=k==='storm'?24:13;while(P.length<n)P.push({x:Math.random()*w,y:Math.random()*h,v:600+Math.random()*400});c.strokeStyle=k==='storm'?'rgba(220,235,255,.5)':'rgba(230,240,255,.38)';c.lineWidth=k==='storm'?1.5:1;c.beginPath();
   for(const q of P){q.y+=q.v*dt;q.x-=q.v*dt*.15;if(q.y>h){q.y=-20;q.x=Math.random()*w*1.1;}if(safe(q.x,q.y)<.45)continue;c.moveTo(q.x,q.y);c.lineTo(q.x+len*.15,q.y-len);}c.stroke();
   c.fillStyle=k==='storm'?'rgba(40,50,70,.2)':'rgba(80,90,110,.08)';c.fillRect(0,0,w,h);if(k==='storm'){const f=t%7;if(f<.12||(f>.28&&f<.34)){c.fillStyle='rgba(255,255,255,.28)';c.fillRect(0,0,w,h);}}}
  if(k==='snow'||k==='cherry'||k==='leaf'){const n=(k==='snow'?150:65)*area;while(P.length<n)P.push({x:Math.random()*w,y:-Math.random()*h,v:40+Math.random()*60,r:k==='snow'?2+Math.random()*3:5+Math.random()*5,a:Math.random()*6,s:Math.random()*2+1});
   for(const q of P){q.y+=q.v*dt;q.a+=dt*q.s;q.x+=Math.sin(q.a)*20*dt+(k==='cherry'?45*dt:0);if(q.y>h+10){q.y=-10;q.x=Math.random()*w;}if(q.x>w+10)q.x=-10;c.globalAlpha=safe(q.x,q.y);
    if(k==='snow'){c.fillStyle='#fff';c.beginPath();c.arc(q.x,q.y,q.r,0,7);c.fill();}else{c.save();c.translate(q.x,q.y);c.rotate(q.a);c.fillStyle=k==='cherry'?'#ffb7d0':['#e8743a','#d9502a','#f0a030'][Math.floor(q.s*2)%3];c.beginPath();if(k==='cherry')c.ellipse(0,0,q.r,q.r*.55,0,0,7);else{c.moveTo(0,-q.r);c.lineTo(q.r*.7,0);c.lineTo(0,q.r);c.lineTo(-q.r*.7,0);}c.fill();c.restore();}}c.globalAlpha=1;}
  if(k==='firefly'){for(let i=0;i<34*area;i++){const x=(i*131+Math.sin(t*.7+i)*40)%w,y=h*.3+((i*71)%(h*.55))+Math.cos(t*.9+i*2)*20,a=(Math.sin(t*2.5+i*1.7)+1)/2;if(safe(x,y)<.4)continue;const g=c.createRadialGradient(x,y,0,x,y,11);g.addColorStop(0,`rgba(230,255,120,${a})`);g.addColorStop(1,'rgba(230,255,120,0)');c.fillStyle=g;c.fillRect(x-11,y-11,22,22);}}
  if(k==='meteor'){W.meteorT-=dt;if(W.meteorT<0){W.meteorT=rand(14,26);W.mT=0;}if(W.mT!=null&&W.mT<.8){W.mT+=dt;const u=W.mT/.8,x=w*.85-u*w*.45,y=h*.02+u*h*.2;const g=c.createLinearGradient(x,y,x+140,y-34);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(1,'rgba(255,255,255,0)');c.strokeStyle=g;c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x+140,y-34);c.stroke();if(W.mT>=.8-dt&&W.buffT<=0){W.buffT=10;miniToast('🌠 별똥별에 소원을 빌었어요! 10초간 행운 +20%',2600);}}}
  if(k==='aurora'){c.globalCompositeOperation='lighter';for(let b=0;b<3;b++){c.beginPath();for(let x=0;x<=w;x+=16){const y=h*.14+b*h*.05+Math.sin(x*.005+t*.5+b*1.7)*h*.06;x?c.lineTo(x,y):c.moveTo(x,y);}c.lineTo(w,0);c.lineTo(0,0);c.closePath();const g=c.createLinearGradient(0,0,0,h*.32);g.addColorStop(0,'rgba(80,255,170,0)');g.addColorStop(1,['rgba(80,255,170,.55)','rgba(120,160,255,.45)','rgba(200,110,255,.38)'][b]);c.fillStyle=g;c.fill();}c.globalCompositeOperation='source-over';}
  // 노을: 다른 날씨 위에 색조 레이어로 겹침 (비·눈이면 50%만)
  const sunset=S.wxOv==='sunset'?1:Math.max(0,1-Math.abs(time.t*3-1.5)*2.2)*(p.name==='노을'?1:.6);if(sunset>.02){const wet=k==='drizzle'||k==='storm'||k==='snow'?.5:1,g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,`rgba(255,120,60,${.32*sunset*wet})`);g.addColorStop(.45,`rgba(255,170,90,${.16*sunset*wet})`);g.addColorStop(1,`rgba(120,60,140,${.12*sunset*wet})`);c.fillStyle=g;c.fillRect(0,0,w,h);}
 }
 let wxLast='';
 function tick(dt,p){S.__season=season();S.__wx=cur();if(S.__wx==='sunset')S.__wx='clear';if(W.buffT>0)W.buffT-=dt;if(S.__wx!==wxLast){if(false)miniToast(`🌦 날씨 변화: <b>${WX[S.__wx]}</b>${{drizzle:' · 입질 대기 −5%',storm:' · 희귀어 +10%'+(S.__season==='summer'?' · 무지개은어 출현':''),firefly:' · 야행성 어종 +10%',meteor:' · 별똥별을 보면 행운 +20%',aurora:' · 상자 드롭 +30%',cherry:' · 벚꽃송어 출현',leaf:' · 단풍쏘가리 출현',snow:' · 얼음빙어 출현'}[S.__wx]||''}`,3000);if(S.__wx==='aurora')say('시스템','🌌 [서버 공지] 하늘에 오로라가 떴어요! 상자 드롭 +30%');wxLast=S.__wx;}
  wxCard(dt);if(S.wxOn!==false)draw(dt,p);else if(cv)cx.clearRect(0,0,cv.width,cv.height);}
 // ── v16 날씨 표시 D (왼쪽 위 작은 카드 + 남은 시간) ── 🌦⛈❄🌸🍂✨🌠🌌
 const WXI={drizzle:'1f326',storm:'26c8',snow:'2744',cherry:'1f338',leaf:'1f342',firefly:'2728',meteor:'1f320',aurora:'1f30c'};
 const WXE={drizzle:'입질 대기 −5%',storm:'희귀어 +10%',firefly:'야행성 어종 +10%',meteor:'별똥별 보면 행운 +20%',aurora:'상자 드롭 +30%',cherry:'벚꽃송어 출현',leaf:'단풍쏘가리 출현',snow:'얼음빙어 출현'};
 let wcT=0,wcEl,wcDur=0,wcK='';function wxCard(dt){wcT-=dt;if(wcT>0)return;wcT=.5;if(!wcEl){wcEl=document.createElement('div');wcEl.id='wxCard';document.getElementById('hud').appendChild(wcEl);}
  const k=S.__wx;if(!k||k==='clear'||S.wxCardOff){wcEl.style.display='none';return;}const ov=S.wxOv&&S.wxOv!=='auto',night=['firefly','meteor','aurora'].includes(k);
  const left=ov||night?null:Math.max(0,(W.until-performance.now())/1000);if(k!==wcK){wcK=k;wcDur=left||1;}
  const e=(WXE[k]||'')+(k==='storm'&&S.__season==='summer'?' · 무지개은어 출현':'');
  wcEl.style.display='';wcEl.innerHTML=`<div class="h"><img src="icons/emoji-png/${WXI[k]}.png" alt=""><b>${WX[k]}</b><small>${ov?'테스트 고정':night?'오늘 밤':Math.floor(left/60)+':'+String(Math.floor(left%60)).padStart(2,'0')}</small></div>${e?`<div class="e">${e}</div>`:''}${left!=null?`<div class="bar"><i style="width:${Math.min(100,left/wcDur*100)}%"></i></div>`:''}`;}
 // ── 크리스마스 맵 (지형·나무 색만, 소품 없음) ──
 const ORIG=new Map();let theme='base';
 function applyMap(th){if(th===theme)return;theme=th;const map=c0=>{if(th!=='xmas')return c0;const h={};c0.getHSL(h);const c=c0.clone();if(h.h>.17&&h.h<.45&&h.s>.12)c.setHSL(.58,.1,Math.min(.97,.84+h.l*.13));else if(h.h>.08&&h.h<=.17&&h.l>.55)c.setHSL(.58,.08,.93);return c;};
  scene.traverse(o=>{if(!o.isMesh)return;if(chars.some(c=>{let p=o;while(p){if(p===c.o)return true;p=p.parent;}return false;}))return;[].concat(o.material).forEach(m=>{if(!m||!m.color||m.isShaderMaterial)return;if(!ORIG.has(m))ORIG.set(m,m.color.clone());m.color.copy(map(ORIG.get(m)));});
   const ca=o.geometry&&o.geometry.attributes&&o.geometry.attributes.color;if(ca){if(!ORIG.has(ca))ORIG.set(ca,ca.array.slice());const a=ORIG.get(ca),c=new THREE.Color();for(let i=0;i<ca.count;i++){c.setRGB(a[i*3],a[i*3+1],a[i*3+2]);const r=map(c);ca.array[i*3]=r.r;ca.array[i*3+1]=r.g;ca.array[i*3+2]=r.b;}ca.needsUpdate=true;}
   if(o.isInstancedMesh&&o.instanceColor){const ic=o.instanceColor;if(!ORIG.has(ic))ORIG.set(ic,ic.array.slice());const a=ORIG.get(ic),c=new THREE.Color();for(let i=0;i<o.count;i++){c.setRGB(a[i*3],a[i*3+1],a[i*3+2]);const r=map(c);ic.array[i*3]=r.r;ic.array[i*3+1]=r.g;ic.array[i*3+2]=r.b;}ic.needsUpdate=true;}});}
 // ── 1~3위: v10 시안 D 인게임 표시 (왕관·칭호·오라) ──
 const TT=['호수의 왕','은빛 낚시꾼','청동 강태공'],CW=['1f451','1f948','1f949'];
 function rankDom(c,rk,dd){let el=c.rkEl;if(!rk||dd>60){if(el)el.style.display='none';return false;}
  if(!el){el=c.rkEl=document.createElement('div');el.className='rk10';BUBS_.appendChild(el);}
  if(el._rk!==rk){el._rk=rk;el.className='rk10 k'+rk;el.innerHTML=`<div class="au"></div><img class="cw" src="icons/emoji-png/${CW[rk-1]}.png"><span class="t">${TT[rk-1]}</span><span class="nn">${c.name===NICK()||c===me?NICK():c.name}</span>`;}
  _bv.set(c.o.position.x,c.o.position.y+c.h+.5,c.o.position.z).project(cam);if(_bv.z>1||Math.abs(_bv.x)>1.2||Math.abs(_bv.y)>1.2){el.style.display='none';return false;}
  const k=Math.max(.6,Math.min(1.1,13/dd));c.rkTop=Math.round((1-_bv.y)/2*innerHeight-el.offsetHeight*k);el.style.display='';el.style.transform=`translate(${Math.round((_bv.x+1)/2*innerWidth)}px,${Math.round((1-_bv.y)/2*innerHeight)}px) translate(-50%,-100%) scale(${k.toFixed(2)})`;el.style.zIndex=String(900-Math.round(dd));return true;}
 let BUBS_;function layer(){if(!BUBS_){BUBS_=document.createElement('div');BUBS_.id='rkL';const H=document.getElementById('hud');H.parentNode.insertBefore(BUBS_,H);}}
 // ── 멀리 있는 캐릭터 간략화 ──
 const FAR=30,simpleGeo=new THREE.CylinderGeometry(.32,.38,1.1,6),headGeo=new THREE.IcosahedronGeometry(.36,0);
 // v20: 원거리 간략 모형을 InstancedMesh 2개(몸·머리)로 일괄 그리기 → 캐릭터당 2 draw call → 전체 2 draw call
 const SIMP={list:[],b:null,h:null,sync(){if(!this.list.length)return;if(!this.b){const n=64;this.b=new THREE.InstancedMesh(simpleGeo,new THREE.MeshLambertMaterial({color:0xffffff}),n);this.h=new THREE.InstancedMesh(headGeo,new THREE.MeshLambertMaterial({color:0xf2d2b6}),n);[this.b,this.h].forEach(m=>{m.frustumCulled=false;m.count=0;scene.add(m);});}
  let k=0;const M=new THREE.Matrix4();for(const c of this.list){if(!c.simp.visible||k>=64)continue;const p=c.simp.position;M.makeTranslation(p.x,p.y+.55,p.z);this.b.setMatrixAt(k,M);this.b.setColorAt(k,c.simp.userData.col);M.makeTranslation(p.x,p.y+1.4,p.z);this.h.setMatrixAt(k,M);k++;}
  this.b.count=this.h.count=k;this.b.instanceMatrix.needsUpdate=this.h.instanceMatrix.needsUpdate=true;if(this.b.instanceColor)this.b.instanceColor.needsUpdate=true;}};
 function farLOD(c,dd){if(S.farLOD===false){if(c.simp)c.simp.visible=false;c.o.visible=!c.offline;return false;}const far=dd>FAR&&c!==me;if(far&&!c.simp){c.simp=new THREE.Object3D();c.simp.visible=false;c.simp.userData.col=new THREE.Color().setHSL((c.name.length*.13)%1,.45,.62);SIMP.list.push(c);}
  if(c.simp){c.simp.visible=far&&!c.offline;c.simp.position.copy(c.o.position);}c.o.visible=!far&&!c.offline;return far;}
 // ── 데크 점유 (접속 중일 때만) + 봇 접속/퇴장 시뮬 ──
 function presence(dt){for(const b of bots){b.on=b.on==null?true:b.on;b.pt=(b.pt==null?rand(120,480):b.pt)-dt;if(b.pt>0)continue;b.pt=b.on?rand(40,140):rand(120,480);b.on=!b.on;b.c.offline=!b.on;
   if(!b.on){seatLeave(b);b.seat=null;if(b.deck){b.deck.owner=null;b.deck=null;}b.path=[];b.c.o.visible=false;if(b.c.dbub)b.c.dbub.style.display='none';if(b.c.rkEl)b.c.rkEl.style.display='none';b.c.tag.visible=false;}
   else{b.c.tag.visible=true;b.c.o.visible=true;const free=decks.filter(d=>d.i!==0&&!d.owner);if(free.length&&Math.random()<.85){const d=pick(free);d.owner=b.c.name;b.deck=d;}b.wait=0;}}}
 // ── 채널 ──
 const CH={n:Math.max(1,Math.min(8,+(CFG.chN||3))),me:Math.max(1,+(CFG.ch||1))};
 const chPop=()=>Array.from({length:CH.n},(_,i)=>i+1===CH.me?chars.filter(c=>!c.offline).length:Math.round(18+((i*37+KST().getUTCHours()*11)%31)));
 let annT=rand(40,90);function serverAnn(dt){annT-=dt;if(annT>0||CH.n<2)return;annT=rand(70,160);const ch=pick(Array.from({length:CH.n},(_,i)=>i+1).filter(i=>i!==CH.me)),f=pick(D.FISH.filter(f=>!f.limited)),nm=pick(['바다사나이','달빛낚시','물비늘','강태공K','여울소년','호수지기']);say('시스템',`📣 [서버 전체] 채널 ${ch} ${nm}님이 주간 ${f.n} 랭킹 ${1+(Math.random()*3|0)}위에 올랐어요!`);}
 // ── 낚아 올리는 모션 (2D 오버레이) ──
 let rc,rx,reels=[];
 function reelFx(f){const v=S.reelFx||'E';if(v==='off')return;if(!rc){rc=document.createElement('canvas');rc.id='reelCv';const H=document.getElementById('hud');H.parentNode.insertBefore(rc,H);rx=rc.getContext('2d');}
  const pw=new THREE.Vector3(castTo.x,0,castTo.z).project(cam),ph=me.o.position.clone().add(new THREE.Vector3(0,me.h+.4,0)).project(cam);
  reels.push({v,f,t:0,wx:(pw.x+1)/2*innerWidth,wy:(1-pw.y)/2*innerHeight,px:(ph.x+1)/2*innerWidth,py:(1-ph.y)/2*innerHeight,d:[],b:0});}
 function reelTick(dt){if(!rc)return;const w=innerWidth,h=innerHeight;if(rc.width!==w||rc.height!==h){rc.width=w;rc.height=h;}rx.clearRect(0,0,w,h);reels=reels.filter(r=>r.t<1.9);
  for(const r of reels){r.t+=dt;const c=rx,img=FISH_IMG[r.f.k],sc=Math.min(w,h)/700,g=r.f.g,col=['#ffffff','#9be27a','#7ab8ff','#ffd24d','#ff6fb0','#ff3fa0'][g]||'#fff';
   const burst=(n,sp)=>{for(let i=0;i<n;i++){const a=-Math.PI/2+(Math.random()-.5)*1.6,v=(200+Math.random()*300)*sp*sc;r.d.push({x:r.wx,y:r.wy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,rr:(2+Math.random()*3)*sc,l:.6+Math.random()*.5});}};
   if(!r.b){r.b=1;burst(r.v==='E'?[10,16,26,50,60,70][g]:22,r.v==='E'?[.6,.75,.9,1.2,1.3,1.4][g]:1);}
   const fishAt=(x,y,rot,s)=>{if(!img||!img.complete)return;c.save();c.translate(x,y);c.rotate(rot);c.scale(s*sc,s*sc);c.drawImage(img,-60,-30,120,60);c.restore();};
   const ring=tt=>{for(let i=0;i<3;i++){const q=tt-i*.08;if(q<0||q>.7)continue;c.strokeStyle=`rgba(255,255,255,${.8*(1-q/.7)})`;c.lineWidth=3*sc;c.beginPath();c.ellipse(r.wx,r.wy,(20+q*120)*sc,(6+q*36)*sc,0,0,7);c.stroke();}};
   const t=r.t,u=Math.min(1,t/1.1),hg=(r.v==='E'?[80,110,140,200,230,240][g]:160)*sc;ring(t);
   if(r.v==='A'||r.v==='E'){if(r.v==='E'&&g>=3&&t<1.4){const a=Math.max(0,1-t/1.4),gr=c.createLinearGradient(0,0,0,r.wy);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,col);c.globalAlpha=a*.6;c.fillStyle=gr;c.fillRect(r.wx-(40+g*10)*sc,0,(80+g*20)*sc,r.wy);c.globalAlpha=1;}
    if(t<1.15)fishAt(r.wx+(r.px-r.wx)*u,r.wy-Math.sin(u*Math.PI)*hg+(r.py-r.wy)*u,-.6+u*1.4,.8+u*.3);
    if(r.v==='E'&&g>=1)for(let j=0;j<g*7;j++){const a=j*2.4+t*3,rr=(40+t*120)*sc;c.fillStyle=col;c.globalAlpha=Math.max(0,1-t/1.5);c.beginPath();c.arc(r.wx+Math.cos(a)*rr,r.wy-30*sc+Math.sin(a)*rr*.5,3*sc,0,7);c.fill();}c.globalAlpha=1;}
   if(r.v==='B'){const e=1-Math.pow(1-Math.min(1,t/1.2),3),x=r.wx+(r.px-r.wx)*e,y=r.wy-e*(r.wy-r.py)-10*sc;c.strokeStyle='#ffffffcc';c.lineWidth=1.5;c.beginPath();c.moveTo(r.px,r.py-30*sc);c.lineTo(x,y-18*sc);c.stroke();if(t<1.5)fishAt(x,y,Math.PI/2+Math.sin(t*16)*.45,.85);}
   if(r.v==='C'){const sl=t<.6?t*.35:.21+(t-.6)*1.1,uu=Math.min(1,sl);if(t<1.5)fishAt(r.wx+uu*20*sc,r.wy-Math.sin(uu*Math.PI*.8)*hg*1.1,-1.1+uu*1.6,1.1);if(t<.6){c.fillStyle='rgba(255,255,255,.1)';c.fillRect(0,0,w,h);}}
   if(r.v==='D'){const uu=Math.min(1,t/.9);if(t<.9)fishAt(r.wx+(r.px-r.wx)*uu,r.wy-Math.sin(uu*Math.PI)*hg*.75+(r.py-50*sc-r.wy)*uu,uu*6.28,.85);else if(t<1.8){const bb=Math.sin(Math.min(1,(t-.9)/.3)*Math.PI)*12*sc;fishAt(r.px,r.py-50*sc-bb,0,1.05);}}
   for(const q of r.d){q.vy+=900*sc*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt;if(q.l>0){c.fillStyle=`rgba(255,255,255,${Math.min(1,q.l*2)})`;c.beginPath();c.arc(q.x,q.y,q.rr,0,7);c.fill();}}}}
 // ── 낚시 버튼 시안 A~F (기호 없음) ──
 function fishBtn(st){const b=$('fishBtn'),v=S.fishBtnS||'F',cls='fb14 v'+v+' s-'+st;if(b.className!==cls)b.className=cls;
  const T={off:['낚시 시작','탭해서 찌 던지기'],cast:['기다리는 중','찌가 흔들리면 탭'],bite:['지금 당겨!','빨리 탭하세요']}[st];const g=st==='off'?0:st==='cast'?Math.min(.85,fishing.t/Math.max(1,fishing.bite)*.85):1;
  const key=v+st+(v==='F'||v==='B'?Math.round(g*20):'');if(b._k===key)return;b._k=key;
  if(v==='F')b.innerHTML=`<b>${T[0]}</b><small>${T[1]}</small><span class="gg"><i style="width:${Math.round(g*100)}%"></i></span>`;else if(v==='B')b.innerHTML=`<span style="--p:${Math.round(g*100)}%">${st==='off'?'던지기':st==='cast'?'대기 중':'당겨!'}</span>`;else b.innerHTML=`<span>${T[0]}</span>`;}
 // ── 수집 목표·업적 알림 시안 A~D ──
 function goalFx(title,sub,rw,kind){const v=S.goalFx||'G2';if(/^G[1-4]$/.test(v))return goalG(v,title,sub,rw,kind);if(v==='off'){toast(`🎯 <b>${title}</b><br>${sub}`,2600);return;}const el=document.createElement('div');el.className='gfx g'+v;
  const ic=kind==='ach'?'1f451':'1f3c6';
  el.innerHTML=v==='A'?`<div class="gA"><img src="icons/emoji-png/1f3c6.png"><div><h4>${kind==='ach'?'업적 달성':'수집 목표 달성'}</h4><b>${title}</b><div class="pg"><i></i></div><p>${rw||sub}</p></div></div>`:
   v==='B'?`<div class="gB"><h4>${title}</h4><p>${rw||sub}</p><div class="stamp">달성<br>완료</div></div>`:
   v==='C'?`<div class="gC"><div class="rib">${kind==='ach'?'업적 달성!':'수집 목표 달성!'}</div><div class="rw"><div>${title}</div><div>${rw||sub}</div></div></div>`:
   `<div class="gD"><div class="fl"><div class="fr"></div><div class="bk"><img src="icons/emoji-png/${ic}.png"><p class="lb">${kind==='ach'?'업적 패시브 해금':'수집 목표 달성'}</p><h4>${title}</h4><div class="ef">${(rw||'').split(' · ').join('<br>')}</div></div></div></div>`;
  el.onclick=()=>el.remove();document.body.appendChild(el);setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),500);},v==='D'?3200:2800);}
 // ── 효과음 (상자=A 차임, 낚음=C 마림바 기본) ──
 let AC,AM,AR;function ac(){if(AC)return AC;AC=new (window.AudioContext||window.webkitAudioContext)();AM=AC.createGain();AM.connect(AC.destination);AR=AC.createConvolver();const L=AC.sampleRate*2,bf=AC.createBuffer(2,L,AC.sampleRate);for(let c=0;c<2;c++){const d=bf.getChannelData(c);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,3);}AR.buffer=bf;const rg=AC.createGain();rg.gain.value=.3;AR.connect(rg);rg.connect(AM);return AC;}
 const hz=n=>440*Math.pow(2,(n-69)/12);
 function tn(n,t,d,o={}){const{type='sine',v=.22,a=.004,rev=.3,bend=0}=o;const os=AC.createOscillator(),g=AC.createGain();os.type=type;os.frequency.setValueAtTime(hz(n),t);if(bend)os.frequency.exponentialRampToValueAtTime(hz(n+bend),t+d);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);os.connect(g);g.connect(AM);if(rev){const s=AC.createGain();s.gain.value=rev;g.connect(s);s.connect(AR);}os.start(t);os.stop(t+d+.05);}
 function ns(t,d,o={}){const{v=.3,f=1200,q=1,type='bandpass',f2=0}=o;const L=Math.ceil(AC.sampleRate*d),bf=AC.createBuffer(1,L,AC.sampleRate),x=bf.getChannelData(0);for(let i=0;i<L;i++)x[i]=Math.random()*2-1;const s=AC.createBufferSource();s.buffer=bf;const fl=AC.createBiquadFilter();fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+d);fl.Q.value=q;const g=AC.createGain();g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(fl);fl.connect(g);g.connect(AM);s.start(t);}
 const MAJ=[0,4,7,12,16,19,24,28,31];
 const CATCH={A:g=>{const t=AC.currentTime+.02;ns(t,.35,{v:.35,f:1800,f2:400,q:1.2});tn(84+g*2,t+.12,.5+g*.15,{rev:.3+g*.08,v:.18});if(g>=2)tn(91+g*2,t+.2,.5,{v:.1,rev:.4});},
  B:g=>{const t=AC.currentTime+.02;for(let x=0;x<.32;x+=.022)ns(t+x,.02,{v:.12,f:3000,q:4});tn(62,t+.36,.18,{v:.3,bend:14});if(g>=1)tn(79+g*2,t+.5,.4+g*.1,{type:'triangle',v:.12});},
  C:g=>{const t=AC.currentTime+.02,m=[72,76,79,84,88,91,96],k=3+Math.min(4,g);for(let i=0;i<k;i++){tn(m[i],t+i*.075,.35+(i===k-1?.4+g*.1:0),{v:.22,a:.002,rev:.25});tn(m[i]+24,t+i*.075,.06,{v:.05,rev:0});}},
  D:g=>{const t=AC.currentTime+.02,k=4+g*2;for(let i=0;i<k;i++)tn(60+Math.random()*12+i*2,t+i*.05,.09,{v:.14,bend:9,rev:.15});tn(76+g*2,t+k*.05+.03,.25,{v:.22,bend:-5});},
  E:g=>{const t=AC.currentTime+.02;for(let i=0;i<1+g;i++){tn(88,t+i*.07,.12,{type:'square',v:.05,rev:.1});tn(95,t+i*.07+.05,.4,{type:'square',v:.05});}},
  F:g=>{const t=AC.currentTime+.02,m=[0,4,7,12,16,19],k=2+Math.min(4,g);for(let i=0;i<k;i++)tn(72+m[i],t+i*.06,.12+(i===k-1?.25:0),{type:'square',v:.06,a:.001,rev:.05});}};
 function vol(){AM.gain.value=Math.max(0,Math.min(1,(S.vol==null?.5:S.vol)*1.6))*(snd.on?1:0);}
 function catchSfx(g){const v=S.catchSfx||'C';if(v==='old'){sfx.reel();return;}try{ac();vol();CATCH[v](g);}catch(e){sfx.reel();}}
 function boxSfx(g){try{ac();vol();const t=AC.currentTime+.02,k=3+g*1.2|0,base=72+g;for(let i=0;i<k;i++)tn(base+MAJ[i],t+i*(.09-g*.006),1.2+g*.3,{type:'triangle',v:.2,rev:.3+g*.1});if(g>=3)for(let i=0;i<6;i++)tn(96+MAJ[i%5],t+k*.08+i*.05,.6,{v:.06,rev:.8});if(g>=5)tn(60,t,2.5,{v:.18,rev:.6});}catch(e){}}
 // ── 창 바깥 클릭 → 닫기 (드래그·입력·안쪽 클릭은 무시) ──
 let downT=null,downXY=null;document.addEventListener('pointerdown',e=>{downT=e.target;downXY=[e.clientX,e.clientY];},true);
 document.addEventListener('click',e=>{const m=e.target;if(!m.classList||!m.classList.contains('modal')||!m.classList.contains('show'))return;if(['start','confirm'].includes(m.id))return;if(downT!==m||!downXY||Math.hypot(e.clientX-downXY[0],e.clientY-downXY[1])>6)return;const sel=getSelection&&String(getSelection());if(sel)return;closeM(m.id);},true);
 // ── 관리자 모드 (로컬 테스트용) ──
 const AD={log:JSON.parse(localStorage.getItem('nk_admin_log')||'[]'),ops:JSON.parse(localStorage.getItem('nk_admin_ops')||'[{"n":"나","r":"최고관리자"}]'),tab:'dash',ev:JSON.parse(localStorage.getItem('nk_admin_ev')||'{}')};
 const alog=t=>{AD.log.unshift(KST().toISOString().slice(5,16).replace('T',' ')+' · '+t);AD.log=AD.log.slice(0,80);localStorage.setItem('nk_admin_log',JSON.stringify(AD.log));};
 function admin(){let m=$('admin');if(!m){m=document.createElement('div');m.id='admin';m.className='modal';document.body.appendChild(m);}
  const tabs=[['dash','대시보드'],['user','유저'],['op','운영자'],['time','시간·날씨'],['map','맵'],['bal','밸런스'],['ev','이벤트·공지'],['prof','비속어'],['deck','데크 배치']];const B=JSON.parse(localStorage.getItem('nk_admin_bal')||'{}');let body='';
  if(AD.tab==='dash'){const pop=chPop();body=`<div class="adgrid"><div><b>${pop.reduce((a,b)=>a+b,0)}</b><span>서버 접속자 (채널 ${CH.n}개)</span></div><div><b>${chars.filter(c=>!c.offline).length}</b><span>현재 채널 ${CH.me} 인원</span></div><div><b>${(S.earned||0).toLocaleString()}</b><span>내 누적 코인</span></div><div><b>${S.boxes.length}</b><span>미개봉 상자</span></div><div><b>${WX[S.__wx]||'-'}</b><span>현재 날씨 (${SN[season()]})</span></div><div><b>${time.len}s</b><span>하루 길이</span></div></div><h4>채널별 인원</h4><p>${pop.map((n,i)=>`채널 ${i+1}: ${n}/50`).join(' · ')}</p><h4>작업 로그</h4><div class="adlog">${AD.log.map(x=>`<div>${x}</div>`).join('')||'<div>기록 없음</div>'}</div>`;}
  if(AD.tab==='user'){body=`<table class="adt"><tr><th>닉네임</th><th>상태</th><th>데크</th><th>작업</th></tr><tr><td>${NICK()} (나)</td><td>접속</td><td>1</td><td><button data-ad="coin">코인 +10,000</button><button data-ad="stone">강화석 +50</button><button data-ad="box">상자 +10</button></td></tr>${bots.map((b,i)=>`<tr><td>${b.c.name}</td><td>${b.on===false?'오프라인':b.c.adMuted?'채팅 금지':'접속'}</td><td>${b.deck?b.deck.i+1:'-'}</td><td><button data-ad="mute" data-i="${i}">${b.c.adMuted?'채팅 허용':'채팅 금지'}</button><button data-ad="kick" data-i="${i}">${b.on===false?'접속시키기':'강제 퇴장'}</button></td></tr>`).join('')}</table>`;}
  if(AD.tab==='op'){body=`<table class="adt"><tr><th>운영자</th><th>역할</th><th></th></tr>${AD.ops.map((o,i)=>`<tr><td>${o.n}</td><td><select data-opr="${i}">${['최고관리자','운영자','모니터'].map(r=>`<option ${o.r===r?'selected':''}>${r}</option>`).join('')}</select></td><td>${i?`<button data-ad="opdel" data-i="${i}">삭제</button>`:''}</td></tr>`).join('')}</table><p><input id="opN" placeholder="닉네임"> <button data-ad="opadd">운영자 추가</button></p><p class="small">권한: 최고관리자 = 전체 · 운영자 = 유저/시간/맵/이벤트 · 모니터 = 조회만</p>`;}
  if(AD.tab==='time'){body=`<p>하루 길이(초) <input type="number" id="adLen" value="${time.len}" style="width:80px"> <button data-ad="len">적용</button> <span class="small">현재 ${time.len}초 = 실제 ${(time.len/60).toFixed(1)}분</span></p><p>현재 시각 <button data-ad="t" data-v=".1">낮</button><button data-ad="t" data-v=".4">노을</button><button data-ad="t" data-v=".75">밤</button> · 시간 흐름 <button data-ad="auto">${time.auto?'ON → 멈추기':'OFF → 흐르기'}</button></p><p>날씨 강제 <select id="adWx"><option value="auto">자동</option>${Object.entries(WX).concat([['sunset','노을 색조만']]).map(([k,n])=>`<option value="${k}" ${S.wxOv===k?'selected':''}>${n}</option>`).join('')}</select> 계절 <select id="adSe"><option value="auto">실제 날짜</option>${SEASONS.map(k=>`<option value="${k}" ${S.seasonOv===k?'selected':''}>${SN[k]}</option>`).join('')}</select></p>`;}
  if(AD.tab==='map'){body=`<p>맵 테마 <label><input type="radio" name="adMap" value="base" ${(S.mapTheme||'base')==='base'?'checked':''}> 기본</label> <label><input type="radio" name="adMap" value="xmas" ${S.mapTheme==='xmas'?'checked':''}> 크리스마스(지형만)</label></p><p>데크 배치 (새로고침) ${[['a','A 원형'],['b','B 지그재그'],['c','C 만형']].map(([k,n])=>`<button data-ad="lay" data-v="${k}">${n}${CFG.lay===k?' ✓':''}</button>`).join('')}</p><p>채널 수 <input type="number" id="adCh" min="1" max="8" value="${CH.n}" style="width:60px"> 봇/채널 <input type="number" id="adBots" min="0" max="49" value="${CFG.bots}" style="width:60px"> <button data-ad="chap">적용 (새로고침)</button></p>`;}
  if(AD.tab==='bal'){const tiers=D.BOX.tiers;body=`<p>상자 기본 드롭 <input id="bBase" type="number" step=".001" value="${D.BOX.base}" style="width:80px"> · 초월 확률 <input id="bTx" type="number" step=".00001" value="${D.TX.p}" style="width:100px"></p><p>상자 등급 가중치 ${tiers.map((t,i)=>`${t.n} <input class="bT" data-i="${i}" type="number" step=".05" value="${t.w}" style="width:60px">`).join(' ')}</p><p>옵션 상한 ${Object.entries(D.CHARM.opts).map(([k,o])=>`${o.n} <input class="bC" data-k="${k}" type="number" value="${o.total}" style="width:60px">`).join(' ')}</p><details><summary>어종 가중치·기본가</summary><table class="adt">${D.FISH.map(f=>`<tr><td>${f.n}</td><td>가중치 <input class="bFw" data-k="${f.k}" type="number" step=".5" value="${f.w}" style="width:60px"></td><td>기본가 <input class="bFb" data-k="${f.k}" type="number" step=".5" value="${f.base}" style="width:70px"></td></tr>`).join('')}</table></details><p><button data-ad="balsave" class="acc">저장 후 새로고침</button> <button data-ad="balreset">기본값으로</button> <button data-ad="balexp">JSON 내보내기</button></p><p class="small">저장 값은 이 브라우저(localStorage nk_admin_bal)에만 적용돼요. 서버 연동 시 같은 JSON을 서버 설정으로 올리면 돼요.</p>`;}
  if(AD.tab==='ev'){body=`<p>코인 배율 <select id="evCoin">${[1,1.5,2,3].map(x=>`<option ${AD.ev.coin==x?'selected':''}>${x}</option>`).join('')}</select> 상자 드롭 배율 <select id="evBox">${[1,1.5,2].map(x=>`<option ${AD.ev.box==x?'selected':''}>${x}</option>`).join('')}</select> <button data-ad="evsave">적용</button></p><p>서버 공지 <input id="evMsg" style="width:60%" placeholder="공지 내용"> <button data-ad="ann">전체 공지</button></p><p>보상 일괄 지급 (전 유저): <button data-ad="giftall">상자 3개 + 코인 3,000</button></p>`;}
  if(AD.tab==='prof'){const P=NK_PROF.conf(),f=(AD.pq||'').trim(),L=k=>P[k].filter(w=>!f||w.includes(f)),tr=AD.ptest||'';
   body=`<div class="adrow"><label class="sw"><input type="checkbox" id="pOn" ${P.enabled?'checked':''}> 비속어 필터 사용</label><span class="muted small">금칙어 ${P.words.length}개 · 허용어 ${P.allow.length}개 · 출처: 톡시도 필터 (띄어쓰기·기호·숫자 끼워넣기·반복·초성·리트 우회 대응)</span></div>
   <div class="adrow"><input id="pTest" placeholder="문장을 넣어 필터 테스트" value="${tr.replace(/"/g,'&quot;')}"><button id="pTestB">테스트</button>${tr?`<span class="pres">${NK_PROF.check(tr).hit?'차단 → '+NK_PROF.mask(tr).replace(/</g,'&lt;'):'통과'}</span>`:''}</div>
   <div class="adrow"><input id="pQ" placeholder="목록 검색" value="${f}"><button id="pReset" class="ghost">기본 목록으로 되돌리기</button></div>
   <div class="pcols">${[['words','금칙어'],['allow','허용어 (오탐 예외)']].map(([k,n])=>`<div class="pcol"><h4>${n} <small>${L(k).length}</small></h4><div class="adrow"><input data-padd="${k}" placeholder="${n} 추가 후 Enter"></div><div class="pchips">${L(k).slice(0,300).map(w=>`<span class="pchip">${w.replace(/</g,'&lt;')}<button data-pdel="${k}" data-w="${encodeURIComponent(w)}" title="삭제">×</button></span>`).join('')}${L(k).length>300?`<span class="muted small">외 ${L(k).length-300}개 · 검색으로 좁혀 보세요</span>`:''}</div></div>`).join('')}</div>`;}
  if(AD.tab==='deck'){const cur=CFG.decks||25;body=`<p class="muted">데크 수를 바꾸면 새로고침 후 적용돼요. 데크마다 2자리예요.</p><div class="adgrid">${[[25,'25데크 × 2자리 = 50명 (기본)'],[30,'30데크 × 2자리 = 60자리 (여유 10)']].map(([n,t])=>`<label class="dopt ${cur===n?'on':''}"><input type="radio" name="adDeck" value="${n}" ${cur===n?'checked':''}> <b>${n}데크</b><span>${t}</span></label>`).join('')}</div><p><button id="adDeckApply">적용 (새로고침)</button> <span class="muted small">현재 ${DECKS}데크</span></p>`;}
  const TI={dash:'📊',user:'👥',op:'🛡️',time:'🌦️',map:'🗺️',bal:'⚖️',ev:'📣',prof:'🚫',deck:'🪵'};
  m.innerHTML=`<div class="card adm adm2 ${S.admDark?'dk':''}"><header><b>🛠 관리자 모드</b><span class="pill">로컬 테스트 · ${AD.ops[0].r}</span><span class="sp"></span><button class="hb" id="admTheme">${S.admDark?'☀️ 라이트':'🌙 다크'}</button><button class="hb" data-close="admin">닫기</button></header><div class="alay"><aside class="adtabs">${tabs.map(([k,n])=>`<button data-at="${k}" class="${AD.tab===k?'on':''}"><span>${TI[k]||'•'}</span>${n}</button>`).join('')}<div class="atip"><b>낚멍 운영 팁</b><p>비속어는 띄어쓰기·숫자 끼워넣기·초성까지 걸러져요</p></div></aside><main class="adb"><h2>${TI[AD.tab]||''} ${(tabs.find(t=>t[0]===AD.tab)||['',''])[1]}</h2>${body}</main></div></div>`;
  m.querySelector('#admTheme').onclick=()=>{S.admDark=!S.admDark;save();keepScroll('admin',admin);};
  const q=s=>m.querySelectorAll(s),g=id=>m.querySelector('#'+id);q('[data-close]').forEach(b=>b.onclick=()=>closeM('admin'));q('[data-at]').forEach(b=>b.onclick=()=>{AD.tab=b.dataset.at;keepScroll('admin',admin);});
  if(AD.tab==='prof'){const re=()=>keepScroll('admin',admin);g('pOn').onchange=e=>{NK_PROF.setOn(e.target.checked);alog('비속어 필터 '+(e.target.checked?'켬':'끔'));re();};
   g('pTestB').onclick=()=>{AD.ptest=g('pTest').value;re();};g('pTest').onkeydown=e=>{if(e.key==='Enter'){AD.ptest=e.target.value;re();}};
   g('pQ').oninput=e=>{AD.pq=e.target.value;clearTimeout(AD._pq);AD._pq=setTimeout(()=>{re();const i=$('admin').querySelector('#pQ');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}},250);};
   g('pReset').onclick=()=>{if(confirm('금칙어·허용어를 기본 목록으로 되돌릴까요?')){NK_PROF.reset();alog('비속어 목록 초기화');re();}};
   q('[data-padd]').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter'&&i.value.trim()){if(NK_PROF.add(i.dataset.padd,i.value))alog((i.dataset.padd==='words'?'금칙어':'허용어')+' 추가: '+i.value.trim());re();}});
   q('[data-pdel]').forEach(b=>b.onclick=()=>{const w=decodeURIComponent(b.dataset.w);NK_PROF.del(b.dataset.pdel,w);alog((b.dataset.pdel==='words'?'금칙어':'허용어')+' 삭제: '+w);re();});}
  if(AD.tab==='deck'){g('adDeckApply').onclick=()=>{const v=+(m.querySelector('[name=adDeck]:checked')||{}).value||25;localStorage.setItem('nk_cfg',JSON.stringify(Object.assign({},CFG,{decks:v})));alog('데크 배치 '+v+'데크로 변경');S.savedAt=Date.now();save();location.reload();};}
  q('[data-opr]').forEach(s=>s.onchange=()=>{AD.ops[+s.dataset.opr].r=s.value;localStorage.setItem('nk_admin_ops',JSON.stringify(AD.ops));alog(`운영자 ${AD.ops[+s.dataset.opr].n} 역할 → ${s.value}`);});
  if(g('adWx'))g('adWx').onchange=e=>{S.wxOv=e.target.value;save();alog('날씨 강제: '+e.target.value);};if(g('adSe'))g('adSe').onchange=e=>{S.seasonOv=e.target.value;save();alog('계절: '+e.target.value);};
  q('[name=adMap]').forEach(r=>r.onchange=()=>{S.mapTheme=r.value;applyMap(r.value);save();alog('맵 테마: '+r.value);});
  q('[data-ad]').forEach(b=>b.onclick=()=>{const a=b.dataset.ad,i=+b.dataset.i,bt=bots[i];
   if(a==='coin'){S.coins+=10000;alog('내 코인 +10,000');}if(a==='stone'){S.stones=(S.stones||0)+50;alog('강화석 +50');}if(a==='box'){for(let j=0;j<10;j++)S.boxes.push(Date.now());S.newBox=(S.newBox||0)+10;updBagBadge();alog('상자 +10');}
   if(a==='mute'){bt.c.adMuted=!bt.c.adMuted;bt.c.muted=bt.c.adMuted||(S.blocked||[]).includes(bt.c.name);alog(`${bt.c.name} 채팅 ${bt.c.muted?'금지':'허용'}`);}if(a==='kick'){bt.pt=0;presence(0);alog(`${bt.c.name} ${bt.on?'접속':'강제 퇴장'}`);}
   if(a==='opadd'){const n=(g('opN').value||'').trim();if(n){AD.ops.push({n,r:'모니터'});localStorage.setItem('nk_admin_ops',JSON.stringify(AD.ops));alog('운영자 추가: '+n);}}if(a==='opdel'){alog('운영자 삭제: '+AD.ops[i].n);AD.ops.splice(i,1);localStorage.setItem('nk_admin_ops',JSON.stringify(AD.ops));}
   if(a==='len'){time.len=Math.max(30,+g('adLen').value||150);S.dayLen=time.len;alog('하루 길이 '+time.len+'초');}if(a==='t'){time.t=+b.dataset.v;alog('시각 변경');}if(a==='auto'){time.auto=!time.auto;alog('시간 흐름 '+(time.auto?'ON':'OFF'));}
   if(a==='lay'||a==='chap'){const c=JSON.parse(localStorage.getItem('nk_cfg')||'{}');if(a==='lay')c.lay=b.dataset.v;else{c.chN=Math.max(1,Math.min(8,+g('adCh').value||1));c.bots=Math.max(0,Math.min(49,+g('adBots').value||0));}localStorage.setItem('nk_cfg',JSON.stringify(Object.assign({lay:CFG.lay,bots:CFG.bots},c)));alog('맵/채널 설정 변경 → 새로고침');save();location.reload();return;}
   if(a==='balsave'){const nb={boxBase:+g('bBase').value,txp:+g('bTx').value,tiers:[...q('.bT')].map(x=>+x.value),caps:{},fish:{}};q('.bC').forEach(x=>nb.caps[x.dataset.k]=+x.value);q('.bFw').forEach(x=>{nb.fish[x.dataset.k]={w:+x.value};});q('.bFb').forEach(x=>{nb.fish[x.dataset.k].base=+x.value;});localStorage.setItem('nk_admin_bal',JSON.stringify(nb));alog('밸런스 저장');save();location.reload();return;}
   if(a==='balreset'){localStorage.removeItem('nk_admin_bal');alog('밸런스 초기화');save();location.reload();return;}if(a==='balexp'){const t=localStorage.getItem('nk_admin_bal')||'{}';navigator.clipboard&&navigator.clipboard.writeText(t);toast('밸런스 JSON을 클립보드에 복사했어요');}
   if(a==='evsave'){AD.ev={coin:+g('evCoin').value,box:+g('evBox').value};localStorage.setItem('nk_admin_ev',JSON.stringify(AD.ev));alog(`이벤트: 코인 ×${AD.ev.coin} · 상자 ×${AD.ev.box}`);}
   if(a==='ann'){const t=(g('evMsg').value||'').trim();if(t){say('시스템','📢 [운영자 공지] '+t);toast('📢 '+t,3000);alog('공지: '+t);}}if(a==='giftall'){for(let j=0;j<3;j++)S.boxes.push(Date.now());S.coins+=3000;updBagBadge();alog('전체 보상 지급');toast('🎁 전체 보상 지급 완료');}
   save();hud();keepScroll('admin',admin);});}
 const evMul=()=>({coin:AD.ev.coin||1,box:AD.ev.box||1});
 if(S.dayLen)time.len=S.dayLen;
 return {tick(dt,p){SIMP.sync();tick(dt,p);if(S.mapTheme&&S.mapTheme!==theme&&started)applyMap(S.mapTheme);presence(dt);serverAnn(dt);reelTick(dt);},rankDom,layer,farLOD,fx,reelFx,fishBtn,goalFx,catchSfx,boxSfx,admin:()=>{admin();openM('admin');},evMul,WX,SN,season,CH,chPop,applyMap};
})();

// ═════════ v15: 차단 (캐릭터·채팅 닉네임 우클릭) ═════════
V15=(()=>{S.blocked=S.blocked||[];const RC=new THREE.Raycaster(),NV=new THREE.Vector2();
 const isB=n=>S.blocked.includes(n);
 function apply(){chars.forEach(c=>{if(c!==me)c.muted=isB(c.name)||!!c.adMuted;});}
 function block(n){if(!n||isB(n))return;S.blocked.push(n);save();apply();miniToast(`🚫 <b>${n}</b> 님을 차단했어요 · 설정에서 해제할 수 있어요`,2600);}
 function unblock(n){S.blocked=S.blocked.filter(x=>x!==n);save();apply();}
 let menu;function show(x,y,n){if(!menu){menu=document.createElement('div');menu.id='ctxM';document.body.appendChild(menu);document.addEventListener('pointerdown',e=>{if(menu&&!menu.contains(e.target))menu.style.display='none';},true);}
  menu.innerHTML=`<div class="cm-h">${n}</div><button data-cm="${isB(n)?'un':'bl'}">${isB(n)?'✅ 차단 해제':'🚫 차단하기'}</button>`;menu.style.display='block';menu.style.left=Math.min(x,innerWidth-170)+'px';menu.style.top=Math.min(y,innerHeight-90)+'px';
  menu.querySelector('[data-cm]').onclick=e=>{e.target.dataset.cm==='un'?unblock(n):block(n);menu.style.display='none';};}
 function hit(e){const r=e.target.getBoundingClientRect();NV.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);RC.setFromCamera(NV,cam);let best=null,bd=1e9;
  for(const c of chars){if(c===me||c.offline||!c.o.visible)continue;const hs=RC.intersectObject(c.o,true);if(hs.length&&hs[0].distance<bd){bd=hs[0].distance;best=c;}
   if(!best){const p=c.o.position.clone();p.y+=c.h*.6;const d=RC.ray.distanceToPoint(p);if(d<.9&&RC.ray.origin.distanceTo(p)<bd){bd=RC.ray.origin.distanceTo(p);best=c;}}}
  return best;}
 $('world').addEventListener('contextmenu',e=>{const c=hit(e);if(c){e.preventDefault();show(e.clientX,e.clientY,c.name);}});
 $('log').addEventListener('contextmenu',e=>{const b=e.target.closest('b[data-who]');if(b&&b.dataset.who){e.preventDefault();show(e.clientX,e.clientY,b.dataset.who);}});
 apply();return {block,unblock,isB,apply,list:()=>S.blocked.slice()};})();

// v18: 어항 그림 물고기 A/B (설정) — 3D 어항은 그대로, 물고기만 도감 그림 판으로
{const TL=new THREE.TextureLoader(),TX={};const tex=k=>{if(!TX[k]){TX[k]=TL.load('img/fish/'+k+'.png');TX[k].encoding=THREE.sRGBEncoding;}return TX[k];};
 const b0=tankView.build.bind(tankView),f0=tankView.frame.bind(tankView);
 tankView.build=function(){b0();const v=S.tankFish||'A';if(v==='3d'||!this.fish)return;this.fish.forEach(F=>{F.o.traverse(m=>{if(m.isMesh)m.visible=false;});const g=new THREE.Group(),mat=new THREE.MeshBasicMaterial({map:tex(F.f.k),transparent:true,alphaTest:.05,side:THREE.DoubleSide,depthWrite:false});
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(1,.5),mat);g.add(pl);if(v==='B'){const ol=new THREE.Mesh(new THREE.PlaneGeometry(1.08,.56),new THREE.MeshBasicMaterial({map:tex(F.f.k),transparent:true,alphaTest:.05,side:THREE.DoubleSide,depthWrite:false}));ol.material.color.setRGB(3,3,3);ol.position.z=-.01;g.add(ol);
   const sh=new THREE.Mesh(new THREE.CircleGeometry(.3,16),new THREE.MeshBasicMaterial({color:0x2a5a60,transparent:true,opacity:.18,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.scale.set(1.4,.6,1);g.add(sh);g.userData.sh=sh;}
  g.scale.setScalar((.55+F.f.cm/100*1.4)/(F.o.scale.x||1));F.o.add(g);F.s2d=g;});};
 const _q=new THREE.Quaternion(),_p=new THREE.Vector3();
 tankView.frame=function(dt,t){f0(dt,t);if(!this.on||!this.fish)return;this.fish.forEach(F=>{const g=F.s2d;if(!g)return;F.o.getWorldQuaternion(_q);g.quaternion.copy(_q.invert().multiply(this.cam.quaternion));g.children[0].rotation.z=Math.sin(t*2+F.ph)*.05;F.o.getWorldPosition(_p);_p.applyMatrix4(this.cam.matrixWorldInverse);if(F.px!=null){const dx=_p.x-F.px;if(Math.abs(dx)>.0015)g.scale.x=Math.abs(g.scale.x)*(dx>0?-1:1);}F.px=_p.x;if(g.userData.sh){F.o.getWorldPosition(_p);g.userData.sh.position.y=-(_p.y-.2)/(g.scale.y*F.o.scale.y);}});};}
window.NKV2={KINDS,fire:()=>fireMesh,LV,myLv,addXP,lvRoad,lvCharmSlots,lvTankBonus,resetInput,keys:()=>keys,SEATS,sitOn,standUp,mySeat:()=>mySeat,nearSeat:()=>nearSeat,SH:()=>SH,_n:{catchCard,toast,boxFx,synthFx,FI,GR,TIER,confirmBox,say,openBox:()=>SYS.openBox(D,S,Math.random,null),achCheck},DW,inDeck,R,cam,hemi,sun,wU,V15,V14,S,chars,decks,ROD_POSE,scene,THREE,openFishRank,miniToast,boxGot,calcRK3,RK3:()=>RK3,project:a=>{const v=new THREE.Vector3(a[0],a[1],a[2]).project(cam);return [Math.round((v.x+1)/2*innerWidth),Math.round((1-v.y)/2*innerHeight)];},snd:()=>snd,emote,applyMenu,botBuyNow:()=>{buyT=0;botBuy(0);},S,D,decks,bots,fishAction,catchFish,tankView,renderShop,renderDex,openM,closeM,time,me:()=>me,setPos:(x,z)=>{me.o.position.set(x,.4,z);},nearSpot:()=>nearSpot,fishing:()=>fishing,save,VG,bag:()=>openBag(),legendAlert,botLegend,boxAlert,botBoxAlert,bagTab:t=>{bagTab=t;renderBag();},openSet:()=>{renderSet();openM('set');},SYS,giveBox:(n=1)=>{for(let i=0;i<n;i++)S.boxes.push(Date.now());save();},setCam:(x,y,z,tx=0,ty=0,tz=0)=>{camOverride=x==null?null:[x,y,z,tx,ty,tz];},setDecks:n=>{},dexTab:t=>{dexTab=t;},synthFx,hud};});
})();

// ───────── v5 툴팁 (마우스 오버 / 모바일 탭) ─────────
(function(){const tp=document.createElement('div');tp.id='tip';document.body.appendChild(tp);let cur=null,tt=0;
 const show=(el,x,y)=>{cur=el;tp.textContent=el.dataset.tip;tp.className='show';const r=tp.getBoundingClientRect();tp.style.left=Math.max(6,Math.min(innerWidth-r.width-6,x+12))+'px';tp.style.top=Math.max(6,(y+18+r.height>innerHeight?y-r.height-12:y+18))+'px';};
 const hide=()=>{cur=null;tp.className='';};
 document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('[data-tip]');if(el)show(el,e.clientX,e.clientY);else if(cur)hide();});
 document.addEventListener('mousemove',e=>{if(cur)show(cur,e.clientX,e.clientY);});
 document.addEventListener('touchstart',e=>{const el=e.target.closest&&e.target.closest('[data-tip]');if(el){const t=e.touches[0];show(el,t.clientX,t.clientY);clearTimeout(tt);tt=setTimeout(hide,2600);}else hide();},{passive:true});})();
