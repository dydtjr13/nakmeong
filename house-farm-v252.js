// ─────────────────────────────────────────────────────────────
// v252 🏡 하우징 섬 + 🌱 농사 (사용자 승인 t178u: 영상 시안 그대로)
//  · 하우징 섬 = 안1 미국 주택가(메이플길·파인길) 집터 50칸 · 집터·텃밭은 내 화면 기준(개인 인스턴스)
//  · v253: 섬도 실시간 방(21)에 들어가요 — 다른 낚시꾼이 보이고 채팅·이모트를 나눠요.
//          다른 사람 텃밭은 그 사람 집터가 내 집터와 겹치지 않을 때만 보여요 (같은 집터면 숨겨요 · 같은 집터를 여러 명이 고르면 먼저 보인 1명)
//  · v253: 텃밭 크게 보기는 다가가면 자동이 아니라 텃밭을 눌러야 켜져요 (움직이거나 텃밭 밖을 누르면 꺼져요)
//  · 가는 길: 호숫가 「🏡 하우징 섬」 → 무료 전용 배 → 섬 선착장 / 돌아올 때는 늘 출발한 호숫가 서버로
//  · 농사: Lv.10, 집터 옆 농사 땅(2,500골드·4칸) → 텃밭 5단계(4·6·9·16·25칸) · 작물 14종 · 실제 시간으로 자라요(서버 시각 기준)
//  · 저장: S.farm(땅·칸·씨앗) · S.crops(수확한 작물 = 나중에 요리 재료)
//  집·꾸미기·우편함 바로가기·친구 집 방문은 다음 단계예요.
// ─────────────────────────────────────────────────────────────
(function(){'use strict';
const W=window;const $=id=>document.getElementById(id);
const GC={},GN={miniToast:'mini'};const G=k=>{if(GC[k])return GC[k];const h=W.__nkHF;if(!h)return undefined;try{return h[GN[k]||k];}catch(e){return undefined;}};// game-v2 다리(window.__nkHF)로 읽기
const LOG=(...a)=>{try{if(W.__nkFarmLog)console.log('[farm]',...a);}catch(e){}};
// ── 작물 14종 (README-작물시안 · data.py 제안값) dur=초, seed=씨앗값, y=칸당 수확, sell=판매(개당, 0=판매 불가)
const CROPS=[
 {k:'onion',n:'파',lv:10,dur:1800,seed:15,y:2,sell:30,eff:'⭐ 경험치'},
 {k:'chili',n:'고추',lv:12,dur:5400,seed:50,y:2,sell:100,eff:'💰 골드 주머니'},
 {k:'perilla',n:'깻잎',lv:15,dur:2400,seed:10,y:2,sell:25,eff:'🍀 행운'},
 {k:'potato',n:'감자',lv:18,dur:10800,seed:40,y:3,sell:60,eff:'🎁 상자'},
 {k:'corn',n:'옥수수',lv:20,dur:7200,seed:25,y:3,sell:40,eff:'🎣 빠른 입질'},
 {k:'radish',n:'무',lv:22,dur:7200,seed:30,y:2,sell:70,eff:'⭐ 경험치'},
 {k:'carrot',n:'당근',lv:25,dur:5400,seed:20,y:2,sell:55,eff:'🎣 빠른 입질'},
 {k:'garlic',n:'마늘',lv:28,dur:14400,seed:40,y:3,sell:80,eff:'💰 골드 주머니'},
 {k:'dropwort',n:'미나리',lv:30,dur:3600,seed:15,y:2,sell:35,eff:'⭐ 경험치'},
 {k:'tomato',n:'토마토',lv:33,dur:9000,seed:30,y:3,sell:55,eff:'🎁 상자'},
 {k:'strawberry',n:'딸기',lv:35,dur:21600,seed:0,y:2,sell:0,eff:'🍀 행운',box:1},
 {k:'pumpkin',n:'호박',lv:40,dur:14400,seed:60,y:2,sell:160,eff:'🎁 상자'},
 {k:'cabbage',n:'배추',lv:45,dur:10800,seed:40,y:2,sell:110,eff:'⭐ 경험치'},
 {k:'ginger',n:'생강',lv:50,dur:18000,seed:60,y:3,sell:130,eff:'💰 골드 주머니'}];
const CR={};CROPS.forEach(c=>{c.xp=Math.max(3,Math.round(c.dur/600)+2);CR[c.k]=c;});
// 텃밭 단계 (BALANCE_HOUSING_FARM.md 3-2)
const STAGES=[null,{lv:10,cost:2500,n:4},{lv:14,cost:6500,n:6},{lv:20,cost:22000,n:9},{lv:37,cost:120000,n:16},{lv:52,cost:300000,n:25}];
const LV_MIN=10,OX=-760,BERRY_P=.025;
const IMG=(k,s)=>'img/farm/'+k+'_s'+s+'.webp',ICO=k=>'img/farm/item_'+k+'.webp';
const fmt=s=>{s=Math.max(0,Math.ceil(s));if(s<60)return s+'초';if(s<3600){const m=Math.floor(s/60),r=s%60;return m+'분'+(r&&m<10?' '+r+'초':'');}const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h+'시간'+(m?' '+m+'분':'');};
const fmtD=s=>{const h=Math.floor(s/3600),m=Math.round(s%3600/60);return h?(h+'시간'+(m?' '+m+'분':'')):m+'분';};
const num=n=>(+n||0).toLocaleString('ko-KR');
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const coinI='<span class="hfC">🪙</span>';
// ── 게임 상태 ──
const S_=()=>G('S');const lv=()=>{try{return +G('myLv')()||1;}catch(e){return 1;}};
const saveG=()=>{try{G('save')();}catch(e){}};const hudG=()=>{try{G('hud')();}catch(e){}};
const toastG=(h,ms)=>{try{G('toast')(h,ms||2200);}catch(e){}};const mini=(h,ms)=>{try{G('miniToast')(h,ms||2000);}catch(e){toastG(h,ms);}};
const sfx=k=>{try{W.__nkHF.coin();}catch(e){}};
function F(){const S=S_();if(!S)return null;if(S.farm&&typeof S.farm==='object'){const f=S.farm;f.plots=Array.isArray(f.plots)?f.plots:[];f.seeds=f.seeds||{};f.lv=Math.max(1,Math.min(5,f.lv|0||1));return f;}return null;}
function crops(){const S=S_();if(!S.crops||typeof S.crops!=='object')S.crops={};return S.crops;}
// ── 시계: 서버 시각 기준 (기기 시계를 바꿔도 덜 흔들리게) ──
let SKEW=null;try{const v=sessionStorage.getItem('nk_farmSkew');if(v!=null&&v!=='')SKEW=+v;}catch(e){}
function now(){const RT=W.NK_RT;if(RT&&RT.mode==='on'&&Number.isFinite(+RT.clockSkew))return Date.now()-RT.clockSkew;return Date.now()-(SKEW||0);}
async function syncClock(){try{const t0=Date.now();const r=await fetch(location.pathname+'?t='+t0,{method:'HEAD',cache:'no-store'});const d=r.headers.get('date');const t1=Date.now();if(!d)return;const sv=Date.parse(d)+500;if(!Number.isFinite(sv))return;SKEW=Math.round((t0+t1)/2-sv);if(Math.abs(SKEW)<1500)SKEW=0;try{sessionStorage.setItem('nk_farmSkew',String(SKEW));}catch(e){}LOG('skew',SKEW);}catch(e){}}
function plotInfo(p){if(!p||!p.c||!CR[p.c])return {st:0};const c=CR[p.c];let el=(now()-(+p.t0||0))/1000;if(el<0)el=0;const k=Math.min(1,el/c.dur);return {c,st:k>=1?3:k<.45?1:2,k,left:c.dur-el};}
const nPlots=()=>{const f=F();return f?STAGES[f.lv].n:0;};
const unlocked=c=>lv()>=c.lv;
// ── 오래된 칸 자리 정리 · 타임스탬프 이상값 ──
function sanitize(){const f=F();if(!f)return;const n=nPlots(),t=now();f.plots.length=Math.max(f.plots.length,0);for(let i=0;i<f.plots.length;i++){const p=f.plots[i];if(!p)continue;if(!CR[p.c]){f.plots[i]=null;continue;}if(!(+p.t0>0)||+p.t0>t+86400e3)p.t0=t;}if(f.plots.length>25)f.plots.length=25;void n;}
W.NK_FARM_DATA={CROPS,CR,STAGES,now,plotInfo,F,crops};

// ═════════════ 호숫가: 「🏡 하우징 섬」 버튼 ═════════════
const HB=!!W.__nkHOUSEBOOT;
function islandOn(){try{const u=G('uiOpt');if(typeof u==='function'&&String(u('houseIsl','on'))==='off')return false;}catch(e){}return true;}
function curCh(){try{const RT=W.NK_RT;const v=+(RT&&RT.serverId&&RT.serverId())||+G('CFG').ch||1;return v>=1&&v<=4?v:1;}catch(e){return 1;}}
function sailFx(txt){let el=$('hfSail');if(!el){el=document.createElement('div');el.id='hfSail';el.innerHTML='<div class="hfs-sky"></div><div class="hfs-sea"><i></i><i></i><i></i></div><div class="hfs-boat">⛵</div><b></b>';document.body.appendChild(el);}el.querySelector('b').textContent=txt;requestAnimationFrame(()=>el.classList.add('on'));}
function houseSwitch(to){const S=S_();if(!S)return;
 try{if(G('mySeat'))G('standUp')();}catch(e){}try{const fi=G('fishing');if(fi&&fi.state!=='off')G('endFish')();}catch(e){}
 const SS=sessionStorage;const tips=to?['집터를 골라 농사 땅을 사면 그 자리가 내 집터가 돼요','작물은 게임을 꺼 둔 동안에도 자라요','다 자란 작물은 시들지 않아요','딸기 씨앗은 상자에서 가끔 나와요','Lv.35부터 집을 지을 수 있어요 (곧 열려요)']:['많은 어종을 크게 낚으면 이 주의 낚시왕!','어항이 가득 차면 상점에 팔아요','배 위에서도 멈추면 낚시할 수 있어요'];
 try{if(to){SS.setItem('nk_house','1');SS.setItem('nk_houseFrom',String(curCh()));}else{SS.removeItem('nk_house');const f=+SS.getItem('nk_houseFrom')||1;const CFG=G('CFG');if(CFG)CFG.ch=f;try{localStorage.setItem('nk_cfg',JSON.stringify(Object.assign({},JSON.parse(localStorage.getItem('nk_cfg')||'{}'),{ch:f})));}catch(_){}}
  SS.setItem('nk_autogo',String(Date.now()));SS.setItem('nk_autoTxt',to?'⛵ 하우징 섬으로 가는 중…':'🏞 호숫가로 돌아가요…');SS.setItem('nk_autoTip',tips[Math.random()*tips.length|0]);}catch(e){}
 try{S.vehRide=0;}catch(e){}saveG();sailFx(to?'⛵ 무료 배를 타고 하우징 섬으로 가요…':'⛵ 호숫가로 돌아가요…');setTimeout(()=>location.reload(),1300);}
function askGo(){if(lv()<LV_MIN){toastG('🏡 하우징 섬은 Lv.'+LV_MIN+'부터 갈 수 있어요',2000);return;}
 const cb=G('confirmBox');const html='<h3>🏡 하우징 섬</h3><p>선착장의 <b>무료 전용 배</b>를 타고 하우징 섬으로 갈까요?<br><small class="muted">섬에서 집터를 골라 농사 땅을 사고 작물을 키울 수 있어요. 돌아올 때는 지금 호숫가로 와요.</small></p>';
 if(cb)cb(html,()=>houseSwitch(true));else if(confirm('하우징 섬으로 갈까요?'))houseSwitch(true);}
function lakeBtn(){let b=$('houseBtn');const st=G('started'),am=G('anyModal');const show=!HB&&islandOn()&&st&&!G('SKYBOOT')&&!G('SEABOOT')&&!(am&&am())&&lv()>=LV_MIN&&!W.NK_PREV&&!(W.NK_SPEC||document.body.classList.contains('watch'));
 if(!show){if(b)b.style.display='none';return;}if(!b){b=document.createElement('button');b.id='houseBtn';b.type='button';b.innerHTML='🏡 하우징 섬';b.onclick=askGo;document.body.appendChild(b);}b.style.display='';}
if(!HB)setInterval(()=>{try{lakeBtn();}catch(e){}},500);

// 딸기 씨앗: 상자를 열 때 2.5%로 한 번 더 굴려 1개 (Lv.35 · 농사 땅이 있을 때)
W.__nkBoxFxWrap=function(orig){return function(list){try{const f=F();if(f&&lv()>=CR.strawberry.lv&&Array.isArray(list)){let n=0;list.forEach(()=>{if(Math.random()<BERRY_P)n++;});if(n){f.seeds.strawberry=(f.seeds.strawberry|0)+n;saveG();setTimeout(()=>mini('🍓 딸기 씨앗 '+n+'개를 얻었어요 · 하우징 섬 텃밭에 심을 수 있어요',3200),2600);}}}catch(e){}return orig.apply(this,arguments);};};
{const iv2=setInterval(()=>{const h=W.__nkHF;if(!h)return;clearInterval(iv2);try{h.wrapBoxFx(W.__nkBoxFxWrap);}catch(e){console.warn('[farm] boxFx',e);}},200);}

if(!HB){return;}
// ═════════════ 하우징 섬 ═════════════
document.body.classList.add('houseB');W.NK_NODUCK=1;
const T=W.THREE;let I=null,ISL=null,LAND=null,SLOTS=[],farmG=null,FB=null,soilKey='',plotsV=[],cropRoot=null,markers=null,boat=null;
const lw=(s,lx,lz)=>{const c=Math.cos(s.ry),sn=Math.sin(s.ry);return [OX+s.x+lx*c+lz*sn,s.z-lx*sn+lz*c];};
const inPoly=(x,z,pts)=>{let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,zi]=pts[i],[xj,zj]=pts[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))ins=!ins;}return ins;};
const segD=(px,pz,a,c)=>{const dx=c[0]-a[0],dz=c[1]-a[1],t=Math.max(0,Math.min(1,((px-a[0])*dx+(pz-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(px-a[0]-dx*t,pz-a[1]-dz*t);};
const edgeD=(x,z,pts)=>{let m=1e9;for(let i=0;i<pts.length;i++)m=Math.min(m,segD(x,z,pts[i],pts[(i+1)%pts.length]));return m;};
let PIER=null;
function onLand(wx,wz){if(!LAND)return false;const x=wx-OX,z=wz;if(PIER&&x<PIER.x1&&x>PIER.x0&&Math.abs(z-PIER.z)<1.1)return true;return inPoly(x,z,LAND)&&edgeD(x,z,LAND)>1.2;}
function groundY(wx,wz){return onLand(wx,wz)?.1:-.2;}
// ── 섬 만들기 ──
function buildIsland(){
 const mine=(F()||{}).lot|0;
 const plots=[];for(let i=0;i<50;i++)plots.push({vacant:true});
 I=W.NK_ISLAND50.build(T,{layout:'street',plots,mode:'merged',chunk:28,treeGrid:3.6});
 ISL=I.group;ISL.position.x=OX;ISL.userData.noMerge=1;ISL.name='houseIsland';
 ISL.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});
 G('scene').add(ISL);
 LAND=I.layout.lands[0];SLOTS=I.slots;
 const pr=I.layout.piers[0];if(pr){const ex=pr.x+Math.sin(pr.ry)*pr.L;PIER={x0:Math.min(pr.x,ex)-.5,x1:Math.max(pr.x,ex)+2,z:pr.z,end:[ex,pr.z],start:[pr.x,pr.z]};}
 // 무료 전용 배 (선착장 끝에 묶여 있어요)
 try{const B=W.NK_HOUSE.Builder(T);B.at(0,0,0,0,()=>{B.boxB('plankD',1.1,.32,2.6,0,-.05,0);B.box('plank',1.0,.06,2.4,0,.28,0);B.box('white',1.16,.08,2.64,0,.3,0);B.box('plank',.95,.06,.3,0,.36,.5);B.box('plank',.95,.06,.3,0,.36,-.6);B.rod('logD',.03,[.5,.4,0],[.95,.55,.5],3);B.rod('logD',.03,[-.5,.4,0],[-.95,.55,-.5],3);B.cylB('red',.12,.12,.08,8,0,.32,1.15);});
  const st=B.done();boat=new T.Mesh(st.geo,W.NK_HOUSE.atlas(T).mat);if(PIER){boat.position.set(OX+PIER.end[0]-.6,.02,PIER.end[1]+1.6);boat.rotation.y=Math.PI/2;}G('scene').add(boat);}catch(e){console.warn('[farm] boat',e);}
 // 빈 집터 표시 (농사 땅 구입 가능) — 점선 사각형 하나로 그려요
 buildMarkers();
 W.__nkHouseY=groundY;
 // 걷기: 섬 땅 위에서만 · 내 텃밭 울타리는 못 들어가요
 try{W.__nkHF.wrapWalk(_w=>function(x,z){if(x<-600){if(!onLand(x,z))return false;if(farmG){const lp=farmLocal(x,z),h=farmHalf()+.35;if(Math.abs(lp[0])<h&&Math.abs(lp[1])<h)return false;}if(rfBlock(x,z))return false;return true;}return _w.apply(this,arguments);});}catch(e){console.warn('[farm] walk',e);}
 try{const cam=G('cam');cam.far=Math.max(cam.far,700);cam.updateProjectionMatrix();}catch(e){}
 LOG('island',JSON.stringify(I.info));}
function farmLocal(x,z){const s=SLOTS[(F().lot|0)-1];const [fx,fz]=lw(s,0,-9.0);const dx=x-fx,dz=z-fz,c=Math.cos(s.ry),sn=Math.sin(s.ry);return [dx*c-dz*sn,dx*sn+dz*c];}
function farmHalf(){const n=Math.round(Math.sqrt(nPlots()))||2;const cols=nPlots()===6?3:n;return cols*1.14/2+.55;}
// 숨기기: 호숫가 풍경은 섬에서 안 보여요 (새로 생기는 것도 1초마다)
const HID=[];function hideLake(){const sc=G('scene');if(!sc)return;const keep=new Set([ISL,boat,cropRoot,markers&&markers.g,farmG]);try{const VW=G('VW'),PW=G('PETW');if(VW&&VW.me)keep.add(VW.me);if(PW&&PW.me)keep.add(PW.me);}catch(e){}
 const chs=new Set();try{(G('chars')||[]).forEach(c=>{if(c&&c.o){chs.add(c.o);if(c.tag)chs.add(c.tag);}});}catch(e){}
 const B=new T.Box3();sc.children.forEach(o=>{if(!o.visible||keep.has(o)||chs.has(o)||o.isLight||o.isCamera)return;if(o===G('bob')||o===G('line'))return;try{B.setFromObject(o);if(B.isEmpty())return;if(B.max.x>-400&&B.min.x<400){o.visible=false;HID.push(o);}}catch(e){}});}

// ═════════════ 텃밭 ═════════════
const TL=new T.TextureLoader();const TEX={};
function tex(k,s){const n=k+'_s'+s;if(TEX[n])return TEX[n];const t=TL.load(IMG(k,s),x=>{x.userData.ok=1;});t.encoding=T.sRGBEncoding;t.anisotropy=4;return TEX[n]=t;}
function cvTex(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;}
let shTex,ringTex,dotTex,dashTex;
function mkTex(){shTex=cvTex(128,128,x=>{const g=x.createRadialGradient(64,64,4,64,64,62);g.addColorStop(0,'rgba(40,24,10,.55)');g.addColorStop(.55,'rgba(40,24,10,.32)');g.addColorStop(1,'rgba(40,24,10,0)');x.fillStyle=g;x.fillRect(0,0,128,128);});
 ringTex=cvTex(128,128,x=>{const g=x.createRadialGradient(64,64,30,64,64,62);g.addColorStop(0,'rgba(255,230,120,0)');g.addColorStop(.6,'rgba(255,225,110,.9)');g.addColorStop(1,'rgba(255,220,100,0)');x.fillStyle=g;x.fillRect(0,0,128,128);});
 dotTex=cvTex(32,32,x=>{const g=x.createRadialGradient(16,16,0,16,16,15);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.5,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,32,32);});
 dashTex=cvTex(256,256,x=>{x.fillStyle='rgba(255,250,235,.30)';x.beginPath();x.roundRect?x.roundRect(10,10,236,236,26):x.rect(10,10,236,236);x.fill();x.setLineDash([22,14]);x.strokeStyle='#fff';x.lineWidth=8;x.beginPath();x.roundRect?x.roundRect(10,10,236,236,26):x.rect(10,10,236,236);x.stroke();});}
const UT={value:0};
function windMat(cut,tint){const m=new T.MeshBasicMaterial({alphaTest:.35,side:T.DoubleSide,color:tint,fog:true});
 m.userData.u={uT:UT,uPh:{value:0},uAmp:{value:.045},uCut:{value:cut?1:0}};
 m.onBeforeCompile=s=>{Object.assign(s.uniforms,m.userData.u);
  s.vertexShader='uniform float uT,uPh,uAmp;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloat hw=pow(uv.y,1.6);transformed.x+=(sin(uT*2.1+uPh)*1.0+sin(uT*3.7+uPh*1.9)*.35)*uAmp*hw;transformed.z+=sin(uT*1.6+uPh*.7)*uAmp*.5*hw;');
  s.fragmentShader='uniform float uCut;\n'+s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n#ifdef USE_MAP\nif(uCut>.5){vec3 cc=diffuseColor.rgb;float l=dot(cc,vec3(.3,.59,.11));if(vUv.y<.4&&cc.r>cc.g*1.05&&l<.2)discard;}\n#endif');};
 m.customProgramCacheKey=()=>'hfwind'+(cut?1:0);return m;}
let PG=null,PTS=null,PTSG=null;const PARTS=[];// 파티클 {x,y,z,vx,vy,vz,t,life,r,g,b}
function lotOf(n){return SLOTS[n-1];}
function farmPos(){const f=F();const s=lotOf(f.lot);return {s,p:lw(s,0,-9.0)};}
function buildFarmObj(rise){const f=F();if(!f)return;const sc=G('scene');
 if(!farmG){farmG=new T.Group();farmG.name='myFarm';sc.add(farmG);}
 const {s,p}=farmPos();farmG.position.set(p[0],0,p[1]);farmG.rotation.y=s.ry;
 soilKey='';refreshSoil(true);
 if(!cropRoot){cropRoot=new T.Group();cropRoot.name='farmCrops';sc.add(cropRoot);}
 while(plotsV.length)disposePlot(plotsV.pop());
 for(let i=0;i<nPlots();i++)plotsV.push(mkPlot(i));
 if(rise){farmG.userData.rise=performance.now();}
 updMarkers();}
function refreshSoil(force){const f=F();if(!f||!farmG)return;const n=nPlots();const st=[];for(let i=0;i<n;i++){const p=f.plots[i];st.push(p&&p.c?'watered':'tilled');}const key=n+':'+st.join(',');if(!force&&key===soilKey)return;soilKey=key;
 if(FB){farmG.remove(FB.group);FB.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
 FB=W.NK_FARM.build(T,{style:'fence',size:n,plots:st.map(s=>({state:s}))});FB.group.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});farmG.add(FB.group);}
function plotWorld(i){const v=new T.Vector3();const [x,z]=FB.plotPos(i);v.set(x,.16,z);farmG.updateMatrixWorld(true);return farmG.localToWorld(v);}
// v253: 칸마다 새로 만들던 그림자·반짝 고리·누르기 상자 지오메트리/재질을 함께 써요 (25칸 × 넓히기·다시 만들기 때 GPU 자원이 쌓이지 않게)
let SHG=null,RGG=null,HTG=null,SHM=null,RGM=null,HTM=null;
function shared(){if(SHG)return;SHG=new T.PlaneGeometry(1,1);RGG=new T.PlaneGeometry(1.25,1.25);HTG=new T.BoxGeometry(1.05,.5,1.05);SHM=new T.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false});RGM=new T.MeshBasicMaterial({map:ringTex,transparent:true,depthWrite:false,blending:T.AdditiveBlending});HTM=new T.MeshBasicMaterial({visible:false});}
const SHARED=o=>o===SHG||o===RGG||o===HTG||o===PG||o===SHM||o===RGM||o===HTM;
function mkPlot(i){shared();const gr=new T.Group();cropRoot.add(gr);const w=plotWorld(i);gr.position.copy(w);
 const sh=new T.Mesh(SHG,SHM);sh.rotation.x=-Math.PI/2;sh.position.y=.012;gr.add(sh);
 const cg=new T.Group();gr.add(cg);
 const main=new T.Mesh(PG,windMat(false,0xfbf6ef)),s1=new T.Mesh(PG,windMat(true,0xc9d2bd)),s2=new T.Mesh(PG,windMat(true,0xc9d2bd));s1.renderOrder=s2.renderOrder=1;cg.add(s1,s2,main);
 const ring=new T.Mesh(RGG,RGM);ring.rotation.x=-Math.PI/2;ring.position.y=.01;gr.add(ring);
 const hit=new T.Mesh(HTG,HTM);hit.position.y=.25;hit.userData.plot=i;gr.add(hit);
 const ry=(farmG.rotation.y||0)+(((i*37)%11)/11-.5)*.5;
 return {i,gr,sh,cg,main,s1,s2,ring,hit,ph:i*1.73,ry,key:'',pop:0,lift:0,h:0};}
function disposePlot(P){cropRoot.remove(P.gr);P.gr.traverse(o=>{if(o.geometry&&!SHARED(o.geometry))o.geometry.dispose();if(o.material&&!SHARED(o.material))o.material.dispose();});}
function burst(w,kind){for(let k=0;k<(kind==='buy'?70:kind==='harv'?16:22);k++){const a=Math.random()*6.283,sp=kind==='buy'?2.2+Math.random()*1.4:.6+Math.random()*1.2;const c=kind==='grow'?[.75,.95,.55]:kind==='buy'?[.93,.88,.78]:[.42,.27,.15];const sh=.75+.25*Math.random();
 PARTS.push({x:w.x+(kind==='buy'?Math.cos(a)*2.6:0),y:w.y+.05,z:w.z+(kind==='buy'?Math.sin(a)*2.6:0),vx:Math.cos(a)*sp*.9,vy:(kind==='grow'?.9:1.6)+Math.random()*1.4,vz:Math.sin(a)*sp*.9,t:0,life:kind==='grow'?.6:.8,r:c[0]*sh,g:c[1]*sh,b:c[2]*sh,fl:kind==='grow'});}}
function mkParts(){const N=400;PTSG=new T.BufferGeometry();PTSG.setAttribute('position',new T.BufferAttribute(new Float32Array(N*3),3));PTSG.setAttribute('color',new T.BufferAttribute(new Float32Array(N*3),3));
 PTS=new T.Points(PTSG,new T.PointsMaterial({size:.11,map:dotTex,alphaTest:.3,vertexColors:true,sizeAttenuation:true,transparent:true,depthWrite:false}));PTS.frustumCulled=false;G('scene').add(PTS);}
// 빈 집터 표시: 점선 판 (내 땅이 없을 때만)
function buildMarkers(){const g=new T.Group();g.name='lotMarks';const geo=new T.PlaneGeometry(5.4,5.4);geo.rotateX(-Math.PI/2);const mat=new T.MeshBasicMaterial({map:dashTex,transparent:true,depthWrite:false,opacity:.85});
 const im=new T.InstancedMesh(geo,mat,SLOTS.length);const O=new T.Object3D();SLOTS.forEach((s,i)=>{const [x,z]=lw(s,0,-9.0);O.position.set(x,.075,z);O.rotation.set(0,s.ry,0);O.updateMatrix();im.setMatrixAt(i,O.matrix);});im.instanceMatrix.needsUpdate=true;im.renderOrder=2;g.add(im);
 G('scene').add(g);markers={g,im,mat};updMarkers();}
function updMarkers(){if(!markers)return;markers.g.visible=!F();}
// v253: 다른 사람 텃밭이 보이는 집터는 점선 표시를 숨겨요
let mkHid='';function markHide(set){if(!markers)return;const k=[...set].sort((a,b)=>a-b).join(',');if(k===mkHid)return;mkHid=k;const O=new T.Object3D();SLOTS.forEach((s,i)=>{const [x,z]=lw(s,0,-9.0);O.position.set(x,.075,z);O.rotation.set(0,s.ry,0);O.scale.setScalar(set.has(s.n)?0:1);O.updateMatrix();markers.im.setMatrixAt(i,O.matrix);});markers.im.instanceMatrix.needsUpdate=true;}
// ── 매 프레임 ──
const v3=new T.Vector3();
function proj(x,y,z){const cam=G('cam');v3.set(x,y,z).project(cam);return [(v3.x+1)/2*innerWidth,(1-v3.y)/2*innerHeight,v3.z];}
const back=u=>{u=Math.max(0,Math.min(1,u));const c1=1.9,c3=c1+1;return 1+c3*Math.pow(u-1,3)+c1*Math.pow(u-1,2);};
let lastT=performance.now();
function frame(){const t=performance.now(),dt=Math.min(.1,(t-lastT)/1000);lastT=t;UT.value=t/1000;const f=F();const cam=G('cam');if(!cam)return;
 // 텃밭 솟아오르기
 if(farmG&&farmG.userData.rise){const u=(t-farmG.userData.rise)/550;const sy=u<1?Math.max(.01,back(u)):1;farmG.scale.set(1,sy,1);if(cropRoot)cropRoot.visible=u>=1;if(u>=1)farmG.userData.rise=0;}
 if(f&&FB&&cropRoot){refreshSoil(false);
  for(const P of plotsV){const p=f.plots[P.i];const inf=plotInfo(p);const x=P.gr.position.x,z=P.gr.position.z,y0=P.gr.position.y;
   let vis=inf.st>0;if(P.harvT){const u=(t-P.harvT)/380;if(u>=1){P.harvT=0;vis=false;}else{vis=true;P.lift=Math.sin(u*Math.PI*.5)*.7;P.sc=1+.25*u;}}else{P.lift=0;P.sc=1;}
   const key=vis?(P.harvT?P.key:(inf.c.k+inf.st)):'';
   if(key!==P.key&&!P.harvT){if(P.key&&key&&P.key[0]!==undefined){const prevSt=+P.key.slice(-1),ns=inf.st;if(ns>prevSt){P.pop=t;if(ns>1)burst(P.gr.position,'grow');}}else if(key)P.pop=t;P.key=key;}
   P.cg.visible=vis;P.sh.visible=vis;const done=inf.st===3&&!P.harvT;P.ring.visible=done;
   if(!vis)continue;const k=P.key.replace(/\d$/,''),st=+P.key.slice(-1);const tx=tex(k,st);const im=tx.image;if(!im||!im.width){P.cg.visible=false;continue;}
   const K=1.14/450,w=im.width*K,h=im.height*K;let pop=1;if(P.pop){const u=(t-P.pop)/420;pop=u<1?(st===1?back(u):.82+.18*back(u)):1;if(u>=1)P.pop=0;}
   const s=(P.sc||1)*pop;
   [P.main,P.s1,P.s2].forEach((m,j)=>{if(m.material.map!==tx){m.material.map=tx;m.material.needsUpdate=true;}const u=m.material.userData.u;u.uPh.value=P.ph+j*1.3;u.uAmp.value=st===1?.025:.05;});
   P.cg.position.set(0,P.lift,0);
   const dx=cam.position.x-x,dz=cam.position.z-z,dy=cam.position.y-y0;const yaw=Math.atan2(dx,dz),el=Math.atan2(dy,Math.hypot(dx,dz));
   // 위에서 내려다봐도 눕지 않게: 앞장을 카메라 쪽으로 기울이고(최대 0.55), 뒷장은 고정 각도로 엇갈려요
   P.main.rotation.order='YXZ';P.main.rotation.set(Math.min(.55,.4*el),yaw,0);P.main.scale.set(w*s,h*s,1);P.main.position.set(Math.sin(yaw)*.02,0,Math.cos(yaw)*.02);
   const side=st>1;P.s1.visible=P.s2.visible=side;if(side){[[P.s1,1.05,-1],[P.s2,-1.05,1]].forEach(([m,da,fl])=>{m.rotation.order='YXZ';m.rotation.set(Math.min(.35,.2*el),P.ry+da,0);m.scale.set(w*s*.88*fl,h*s*.9,1);m.position.set(-Math.sin(yaw)*.05,0,-Math.cos(yaw)*.05);});}
   P.sh.scale.set(w*s*.95,(st===1?.45:.7)*w*s,1);P.h=h*s;}}
 // 반짝이 (다 자란 칸) + 파티클
 if(PTS){const pos=PTSG.attributes.position.array,col=PTSG.attributes.color.array;let n=0;const N=pos.length/3;const add=(x,y,z,r,g,b)=>{if(n>=N)return;pos[n*3]=x;pos[n*3+1]=y;pos[n*3+2]=z;col[n*3]=r;col[n*3+1]=g;col[n*3+2]=b;n++;};
  for(let i=PARTS.length-1;i>=0;i--){const q=PARTS[i];q.t+=dt;if(q.t>q.life){PARTS.splice(i,1);continue;}q.x+=q.vx*dt;q.z+=q.vz*dt;q.y+=q.vy*dt;q.vy-=(q.fl?1.2:4.9)*dt;if(q.y<.12&&!q.fl){q.y=.12;q.vx*=.8;q.vz*=.8;}add(q.x,q.y,q.z,q.r,q.g,q.b);}
  if(f)for(const P of plotsV){if(!P.ring.visible)continue;const tt=t/1000;for(let k=0;k<3;k++){const a=tt*1.1+k*2.094+P.i,ph=(tt*1.3+k*.37+P.i*.21)%1;add(P.gr.position.x+Math.cos(a)*.38,P.gr.position.y+.25+ph*.75,P.gr.position.z+Math.sin(a)*.38,1,.95,.6);}}
  for(let k=n;k<N;k++)pos[k*3+1]=-99;PTSG.attributes.position.needsUpdate=true;PTSG.attributes.color.needsUpdate=true;}
 if(RGM)RGM.opacity=.45+.3*Math.sin(t/250);
 if(markers&&markers.g.visible)markers.mat.opacity=.7+.25*Math.sin(t/200);
 try{rfFrame(t);}catch(e){}
 try{farmCam(dt);}catch(e){}
 chips(t);}
// ── 텃밭 카메라: v253부터 텃밭을 누르거나 씨앗 창을 열면 텃밭이 한눈에 보이게 (움직이거나 텃밭 밖을 누르면 원래대로) ──
//    (v252는 가까이 멈춰 있으면 저절로 켜져서, 텃밭 앞에서 조금만 움직여도 시점이 계속 바뀌었어요)
const FC={k:0,cur:null,lp:null,ly:null,idle:0,cool:0,mine:false,req:false,mvT:0};
const zoomOn=()=>FC.req||panelOpen();
function zoomSet(on){FC.req=!!on;if(on){FC.mvT=0;}}
function followPose(){const h=W.__nkHF;const pp=h.me.o.position,yw=h.yaw,pt=h.pitch,ds=h.dist;const dd=pt<0?ds*Math.max(.3,1+pt*1.1):ds;return [pp.x+Math.sin(yw)*Math.cos(pt)*dd,pp.y+1.6+Math.sin(pt)*dd,pp.z+Math.cos(yw)*Math.cos(pt)*dd,pp.x,pp.y+1.6,pp.z];}
function farmPose(fp,km){km=km||1;const cam=GC.cam,c=farmG.position;const n=nPlots(),cols=n===6?3:Math.round(Math.sqrt(n)),rows=n===6?2:cols;const Wd=Math.max(cols,rows)*1.14+1.6;
 let dx=fp[0]-c.x,dz=fp[2]-c.z;const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const vf=cam.fov*Math.PI/180,asp=innerWidth/innerHeight,hf=2*Math.atan(Math.tan(vf/2)*asp),el=.84;
 const mob=innerWidth<700,po=panelOpen();let D=Math.max(6.2,Wd*1.2/(2*Math.tan(vf/2)),Wd*(mob?1.08:1.25)/(2*Math.tan(hf/2)));if(po&&!mob)D*=1.12;D*=km;
 let tx=c.x,ty=.35,tz=c.z;
 if(po&&!mob){const vw=2*D*Math.tan(hf/2),sh=(384/2)/innerWidth*vw;tx+=dz*sh;tz+=-dx*sh;}
 if(po&&mob){const vh=2*D*Math.tan(vf/2),sh=vh*.27;tx+=dx*sh/Math.sin(el)*.9;tz+=dz*sh/Math.sin(el)*.9;D*=1.05;}
 return [tx+dx*Math.cos(el)*D,ty+Math.sin(el)*D,tz+dz*Math.cos(el)*D,tx,ty,tz];}
// 텃밭 카메라일 때 내 이름표가 카메라 바로 앞에서 크게 보이지 않게 잠깐 숨겨요
function tagHook(){const o=W.__nkTagY;if(o&&o.__hf)return;const fn=c=>{if(o)try{o(c);}catch(e){}try{const h=W.__nkHF;if(h&&c===h.me&&FC.hid)c.tag.position.y-=500;}catch(e){}};fn.__hf=1;W.__nkTagY=fn;}
// 내 캐릭터가 화면 아래에 잘려 보이지 않도록 다 들어올 때까지 조금씩 멀리 (최대 1.7배)
const _fc={c:null,v:null};
function fitPose(fp){const tp=farmPose(fp);const me=W.__nkHF.me.o.position;if(!_fc.c){_fc.c=new T.PerspectiveCamera();_fc.v=new T.Vector3();}const C=_fc.c,cam=GC.cam;C.fov=cam.fov;C.aspect=innerWidth/innerHeight;C.near=.1;C.far=500;C.updateProjectionMatrix();
 C.position.set(tp[0],tp[1],tp[2]);C.lookAt(tp[3],tp[4],tp[5]);C.updateMatrixWorld();C.matrixWorldInverse.copy(C.matrixWorld).invert();
 let ok=true;for(const hy of [0,1.2,2.6]){_fc.v.set(me.x,me.y+hy,me.z).applyMatrix4(C.matrixWorldInverse);if(-_fc.v.z<5){ok=false;break;}_fc.v.set(me.x,me.y+hy,me.z).project(C);if(_fc.v.y<-.82||Math.abs(_fc.v.x)>.95){ok=false;break;}}
 FC.ok=ok;return tp;}
function farmCam(dt){const h=W.__nkHF;if(!h||!h.me)return;tagHook();const me=h.me.o.position;const f=F();
 const mv=FC.lp?Math.hypot(me.x-FC.lp[0],me.z-FC.lp[1]):0;FC.lp=[me.x,me.z];if(mv>.015)FC.idle=0;else FC.idle+=dt;
 FC.ly=h.yaw;
 // 움직이면(조이스틱·키) 크게 보기를 꺼요 — 순간 흔들림은 무시 (0.12초 넘게 움직일 때)
 if(FC.req&&!panelOpen()){if(mv>.015)FC.mvT+=dt;else FC.mvT=0;if(FC.mvT>.12)zoomSet(false);}
 const near=f&&farmG&&!farmG.userData.rise&&me.distanceTo(farmG.position)<16;if(FC.req&&!near)zoomSet(false);
 const busy=h.camOv&&!FC.mine;
 const want=!busy&&near&&zoomOn()&&!(h.anyModal&&h.anyModal());
 FC.k=Math.max(0,Math.min(1,FC.k+(want?1:-1)*dt/.65));
 const hideMe=FC.k>.35&&!FC.ok;if(hideMe!==!!FC.hid){FC.hid=hideMe;try{h.me.o.visible=!hideMe;}catch(e){}}
 if(FC.k<=0){if(FC.mine){h.setCamOv(null);FC.mine=false;}FC.cur=null;return;}
 const fp=followPose(),tp=fitPose(fp);if(!FC.cur)FC.cur=tp.slice();else{const a=Math.min(1,dt*5);for(let i=0;i<6;i++)FC.cur[i]+=(tp[i]-FC.cur[i])*a;}
 const e=FC.k*FC.k*(3-2*FC.k);const o=[];for(let i=0;i<6;i++)o[i]=fp[i]+(FC.cur[i]-fp[i])*e;h.setCamOv(o);FC.mine=true;}
// ── 칸 위 이름표 (남은 시간·수확!) ──
let chipW=null;const CH=[];
function chips(t){const f=F();if(!chipW){chipW=document.createElement('div');chipW.id='hfChips';document.body.appendChild(chipW);}
 const me=G('me');const near=f&&farmG&&me&&me.o.position.distanceTo(farmG.position)<18&&!panelOpen()&&!(G('anyModal')&&G('anyModal')());chipW.style.display=near?'':'none';
 if(!near)return;const mob=innerWidth<700;
 for(let i=0;i<plotsV.length;i++){const P=plotsV[i];let e=CH[i];if(!e){e=CH[i]=document.createElement('div');e.className='hfc';chipW.appendChild(e);}
  const inf=plotInfo(f.plots[i]);const hy=P.cg.visible?Math.max(.55,P.h)+.28:.55;const [x,y,z]=proj(P.gr.position.x,P.gr.position.y+hy,P.gr.position.z);
  if(z>1||x<-40||x>innerWidth+40||y<-20||y>innerHeight+20||P.harvT){e.style.display='none';continue;}e.style.display='';
  let cls='hfc',html='';if(inf.st===0){cls+=' e';html='＋';}else if(inf.st===3){cls+=' r';html=mob?'수확!':'✨ 수확!';}else{cls+=' g';html=`<b>${fmt(inf.left)}</b><i><u style="width:${Math.round(inf.k*100)}%"></u></i>`;}
  if(e._c!==cls)e.className=e._c=cls;if(e._h!==html)e.innerHTML=e._h=html;e.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;}
 for(let i=plotsV.length;i<CH.length;i++)CH[i].style.display='none';}
// ═════════════ UI ═════════════
let panel=null,selCrop=null,selPlot=-1,contCrop=null,contT=0;
const panelOpen=()=>!!(panel&&panel.classList.contains('on'))||!!($('hfBagP')&&$('hfBagP').classList.contains('on'));
function closePanels(){if(panel)panel.classList.remove('on');const b=$('hfBagP');if(b)b.classList.remove('on');document.body.classList.remove('hfOpen');selPlot=-1;}
function seedCard(c){const f=F();const lk=!unlocked(c),box=c.box,have=box?(f.seeds.strawberry|0):0,dis=lk||(box&&!have);
 const sub=lk?`<span class="lk">🔒 Lv.${c.lv}</span>`:box?`<span class="bx">상자 전용 · 보유 ${have}</span>`:`<span class="pr">${coinI}${num(c.seed)}</span>`;
 return `<button type="button" class="hfsd${dis?' dis':''}${selCrop===c.k?' on':''}${lk?' lock':''}" data-k="${c.k}"><img class="ci" src="${IMG(c.k,3)}" alt=""><b>${c.n}</b><small class="tm">⏱ ${fmtD(c.dur)}</small>${sub}</button>`;}
function openSeed(i){const f=F();if(!f)return;selPlot=i;if(!selCrop||!unlocked(CR[selCrop])||(CR[selCrop].box&&!(f.seeds.strawberry|0)))selCrop=(f.last&&CR[f.last]&&unlocked(CR[f.last])&&!CR[f.last].box)?f.last:'onion';
 if(!panel){panel=document.createElement('div');panel.id='hfSeed';document.body.appendChild(panel);panel.addEventListener('click',onPanel);}
 renderSeed();panel.classList.add('on');document.body.classList.add('hfOpen');}
function renderSeed(){const f=F();const c=CR[selCrop];const st=STAGES[f.lv],nx=STAGES[f.lv+1];
 const can=c&&unlocked(c)&&(!c.box||(f.seeds.strawberry|0)>0)&&(c.box||(S_().coins|0)>=c.seed);
 panel.innerHTML=`<div class="hd"><b>🌱 씨앗 심기</b><span class="sub">${selPlot+1}번 칸 · 텃밭 ${f.lv}단계 ${st.n}칸</span><button type="button" class="x" data-a="x" aria-label="닫기">✕</button></div>
 <div class="gr">${CROPS.map(seedCard).join('')}</div>
 <div class="ft">${c?`<div class="sel"><img class="ci" src="${ICO(c.k)}" alt=""><div><b>${c.n}</b> <small>${c.eff} 요리 재료</small><br><small>⏱ ${fmtD(c.dur)} · 수확 ${c.y}개 · +${c.xp} XP</small></div></div>`:''}
 <button type="button" class="go" data-a="plant" ${can?'':'disabled'}>${c&&c.box?'심기 (씨앗 1개)':'심기 · '+coinI+num(c?c.seed:0)}</button></div>
 ${nx?`<div class="up">다음 단계: ${nx.n}칸 · Lv.${nx.lv} · ${coinI}${num(nx.cost)} <button type="button" data-a="up">텃밭 넓히기</button></div>`:'<div class="up">텃밭이 가장 넓어요 (25칸)</div>'}`;}
function onPanel(e){const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
 if(a==='x'){closePanels();return;}if(a==='up'){askUp();return;}
 if(a==='plant'){plant(selPlot,selCrop,true);return;}
 if(b.dataset.k){const c=CR[b.dataset.k];if(!unlocked(c)){mini(`🔒 ${c.n} · Lv.${c.lv}에 열려요`,1600);return;}if(c.box&&!(F().seeds.strawberry|0)){mini('🍓 딸기 씨앗은 상자를 열면 가끔 나와요',1800);return;}selCrop=c.k;renderSeed();}}
function plant(i,k,fromPanel){const f=F(),S=S_(),c=CR[k];if(!f||!c||i<0||i>=nPlots())return false;if(f.plots[i]&&f.plots[i].c)return false;if(!unlocked(c))return false;
 if(c.box){if(!(f.seeds.strawberry|0)){mini('🍓 딸기 씨앗이 없어요',1500);return false;}f.seeds.strawberry--;}
 else{if((S.coins|0)<c.seed){toastG('🪙 골드가 모자라요',1500);return false;}S.coins-=c.seed;}
 f.plots[i]={c:k,t0:now()};f.last=k;saveG();hudG();sfx('coin');burst(plotsV[i].gr.position,'plant');
 if(fromPanel){closePanels();const left=emptyIdx();if(left.length&&(!c.box||(f.seeds.strawberry|0)>0)){contCrop=k;contT=performance.now();showCont();}}
 else if(contCrop){contT=performance.now();showCont();}
 return true;}
const emptyIdx=()=>{const f=F();const r=[];for(let i=0;i<nPlots();i++)if(!(f.plots[i]&&f.plots[i].c))r.push(i);return r;};
const readyIdx=()=>{const f=F();const r=[];for(let i=0;i<nPlots();i++)if(plotInfo(f.plots[i]).st===3)r.push(i);return r;};
function showCont(){let e=$('hfCont');if(!e){e=document.createElement('button');e.id='hfCont';e.type='button';document.body.appendChild(e);e.onclick=()=>{contCrop=null;e.classList.remove('on');};}
 const c=CR[contCrop];if(!c){e.classList.remove('on');return;}e.innerHTML=`<img class="ci" src="${ICO(c.k)}" alt=""><span><b>${c.n} 연속 심기</b> · 빈 칸을 누르세요</span><i>✕</i>`;e.classList.add('on');}
function harvest(i,quiet){const f=F(),P=plotsV[i];const inf=plotInfo(f.plots[i]);if(inf.st!==3)return null;const c=inf.c;const n=c.y;const cs=crops();cs[c.k]=(cs[c.k]|0)+n;f.plots[i]=null;f.hv=(f.hv|0)+1;
 P.harvT=performance.now();burst(P.gr.position,'harv');flyIcon(c.k,P.gr.position,n);try{G('addXP')(c.xp,'농사');}catch(e){}saveG();hudG();sfx('coin');
 if(!quiet)mini(`<img class="hfti" src="${ICO(c.k)}" alt=""> <b>${c.n} ×${n}</b> 획득 · +${c.xp} XP${c.box?' <small>(상자 전용 작물)</small>':''}`,2200);
 return {k:c.k,n,xp:c.xp};}
function flyIcon(k,w,n){const [x,y]=proj(w.x,w.y+.6,w.z);const tg=$('hfBag');const r=tg&&tg.offsetParent?tg.getBoundingClientRect():{left:innerWidth/2,top:innerHeight-60,width:0,height:0};
 const e=document.createElement('img');e.src=ICO(k);e.className='hfFly';e.style.left=x+'px';e.style.top=y+'px';document.body.appendChild(e);
 const p=document.createElement('div');p.className='hfPlus';p.textContent='+'+n;p.style.left=x+'px';p.style.top=y+'px';document.body.appendChild(p);
 requestAnimationFrame(()=>{e.style.transform=`translate(${r.left+r.width/2-x}px,${r.top+r.height/2-y}px) scale(.45)`;e.style.opacity='.2';});
 setTimeout(()=>{e.remove();if(tg){tg.classList.remove('bump');void tg.offsetWidth;tg.classList.add('bump');}bagBtn();},700);setTimeout(()=>p.remove(),1100);}
function harvestAll(){const r=readyIdx();if(!r.length)return;const got={};let xp=0;r.forEach((i,k)=>setTimeout(()=>{const h=harvest(i,true);if(h){got[h.k]=(got[h.k]||0)+h.n;xp+=h.xp;}if(k===r.length-1)setTimeout(()=>result(got,xp),450);},k*160));}
function result(got,xp){let e=$('hfRes');if(!e){e=document.createElement('div');e.id='hfRes';document.body.appendChild(e);e.onclick=()=>e.classList.remove('on');}
 e.innerHTML=`<b>🧺 모두 수확 완료!</b><div class="it">${Object.keys(got).map(k=>`<span><img class="ci" src="${ICO(k)}" alt=""><small>${CR[k].n} ×${got[k]}</small></span>`).join('')}</div><small class="xp">+${xp} XP · 가방에 넣었어요</small>`;
 e.classList.remove('on');void e.offsetWidth;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),3200);}
function askUp(){const f=F(),nx=STAGES[f.lv+1];if(!nx)return;if(lv()<nx.lv){mini(`⬆ 텃밭 ${f.lv+1}단계는 Lv.${nx.lv}부터예요`,1800);return;}
 const go=()=>{const S=S_();if((S.coins|0)<nx.cost){toastG('🪙 골드가 모자라요',1500);return false;}S.coins-=nx.cost;f.lv++;saveG();hudG();sfx('coin');closePanels();buildFarmObj(true);burst(farmG.position,'buy');mini(`⬆ 텃밭이 ${nx.n}칸으로 넓어졌어요!`,2200);return true;};
 const cb=G('confirmBox');const html=`<h3>⬆ 텃밭 넓히기</h3><p>텃밭을 <b>${f.lv+1}단계 · ${nx.n}칸</b>으로 넓힐까요?<br>${coinI} <b>${num(nx.cost)}</b><br><small class="muted">심어 둔 작물은 그대로예요 · 남는 골드 🪙 ${num(Math.max(0,(S_().coins|0)-nx.cost))}</small></p>`;if(cb)cb(html,go);}
function askBuy(n){const S=S_();if(F())return;const s=lotOf(n);if(!s)return;const st=STAGES[1];
 if(lv()<st.lv){mini(`🌱 농사는 Lv.${st.lv}부터예요`,1800);return;}
 const cb=G('confirmBox');const html=`<h3>🌱 농사 땅 구입</h3><p><b>${n}번 집터</b> 옆 빈 땅을 사서 텃밭(${st.n}칸)을 만들까요?<br>${coinI} <b>${num(st.cost)}</b> · Lv.${st.lv} 이상 ✓<br><small class="muted">이 집터가 내 자리로 예약돼요. Lv.35부터 같은 자리에 집을 지을 수 있어요(곧 열려요).${(()=>{const o=[...RF.values()].find(r=>r.lot===n);return o?`<br>지금은 ${esc(o.nick)}님 텃밭이 보이는 자리지만, 내 화면에서는 늘 내 텃밭이 보여요.`:'';})()}</small></p>`;
 cb&&cb(html,()=>{if((S.coins|0)<st.cost){toastG('🪙 골드가 모자라요',1500);return false;}S.coins-=st.cost;S.farm={lot:n,lv:1,plots:[],seeds:{},at:now()};saveG();hudG();sfx('coin');buildFarmObj(true);setTimeout(()=>burst(farmG.position,'buy'),60);
  mini('🌱 텃밭이 생겼어요! 빈 칸(＋)을 눌러 씨앗을 심어 보세요',3000);});}
// ── 가방 (수확한 작물) ──
function bagHTML(){const f=F(),cs=crops();const rows=CROPS.map(c=>{const n=cs[c.k]|0;return `<div class="bi${n?'':' z'}"><img class="ci" src="${ICO(c.k)}" alt=""><b>${c.n}</b><small>×${num(n)}</small>${n&&c.sell?`<button type="button" data-sell="${c.k}">팔기 ${coinI}${num(c.sell*n)}</button>`:c.box?'<em>판매 불가</em>':''}</div>`;}).join('');
 const st=f?STAGES[f.lv]:null,nx=f?STAGES[f.lv+1]:null;
 return `<div class="hd"><b>🧺 작물 가방</b><span class="sub">요리 재료로 쓸 수 있어요 (요리는 곧 열려요)</span><button type="button" class="x" data-a="x" aria-label="닫기">✕</button></div>
 <div class="bg">${rows}</div>
 <div class="up">${f?`🌱 내 텃밭: ${f.lot}번 집터 · ${f.lv}단계 ${st.n}칸 · 🍓 딸기 씨앗 ${f.seeds.strawberry|0}개${nx?` <button type="button" data-a="up">넓히기 (Lv.${nx.lv} · ${coinI}${num(nx.cost)})</button>`:''}`:'아직 농사 땅이 없어요 · 마음에 드는 집터의 빈 땅(점선)에서 살 수 있어요'}</div>`;}
function openBag(){let e=$('hfBagP');if(!e){e=document.createElement('div');e.id='hfBagP';document.body.appendChild(e);e.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;if(b.dataset.a==='x'){closePanels();return;}if(b.dataset.a==='up'){askUp();return;}if(b.dataset.sell){sell(b.dataset.sell);}});}
 if(panel)panel.classList.remove('on');e.innerHTML=bagHTML();e.classList.add('on');document.body.classList.add('hfOpen');}
function sell(k){const c=CR[k],cs=crops(),n=cs[k]|0;if(!n||!c.sell)return;const sum=n*c.sell;const cb=G('confirmBox');
 cb&&cb(`<h3>🪙 작물 팔기</h3><p><b>${c.n} ×${n}</b>을(를) ${coinI} <b>${num(sum)}</b>에 팔까요?<br><small class="muted">요리 재료로 쓰려면 남겨 두세요</small></p>`,()=>{const S=S_();cs[k]=0;S.coins=(S.coins|0)+sum;try{S.earned=(S.earned||0)+sum;}catch(e){}saveG();hudG();sfx('coin');const b=$('hfBagP');if(b&&b.classList.contains('on'))b.innerHTML=bagHTML();bagBtn();});}
// ── 섬 버튼: 호숫가로 · 작물 가방 · 모두 수확 · 땅 사기 ──
function bagBtn(){const b=$('hfBag');if(!b)return;const n=Object.values(crops()).reduce((a,v)=>a+(v|0),0);const t=`🧺 작물 가방 <i>${num(n)}</i>`;if(b._t!==t)b.innerHTML=b._t=t;}
function hudBtns(){const st=G('started'),am=G('anyModal');const show=st&&!(am&&am());
 let back_=$('houseBack');if(!back_){back_=document.createElement('button');back_.id='houseBack';back_.type='button';back_.innerHTML='⛵ 호숫가로';back_.onclick=()=>{const cb=G('confirmBox');const ch=+sessionStorage.getItem('nk_houseFrom')||1;cb?cb(`<h3>⛵ 호숫가로</h3><p>무료 배를 타고 출발했던 호숫가(${ch}번 서버)로 돌아갈까요?</p>`,()=>houseSwitch(false)):houseSwitch(false);};document.body.appendChild(back_);}
 let bag=$('hfBag');if(!bag){bag=document.createElement('button');bag.id='hfBag';bag.type='button';bag.onclick=()=>{$('hfBagP')&&$('hfBagP').classList.contains('on')?closePanels():openBag();};document.body.appendChild(bag);bagBtn();}
 back_.style.display=bag.style.display=show?'':'none';
 // 아래 가운데 버튼: 모두 수확 / 땅 사기
 let act=$('hfAct');if(!act){act=document.createElement('button');act.id='hfAct';act.type='button';act.onclick=()=>{const a=act.dataset.a;if(a==='all')harvestAll();else if(a==='buy')askBuy(+act.dataset.n);};document.body.appendChild(act);}
 const f=F(),me=G('me');let a='',html='';
 if(show&&me&&!panelOpen()){const p=me.o.position;
  if(f&&farmG&&p.distanceTo(farmG.position)<14){const r=readyIdx();if(r.length){a='all';html=`🧺 모두 수확 <i>${r.length}칸</i>`;}}
  else if(!f){let best=0,bd=9;SLOTS.forEach((s,i)=>{const [x,z]=lw(s,0,-9.0);const d=Math.hypot(p.x-x,p.z-z);if(d<bd){bd=d;best=s.n;}});if(best){a='buy';act.dataset.n=best;html=`🌱 ${best}번 집터 농사 땅 사기 <i>${coinI}${num(STAGES[1].cost)}</i>`;}}}
 act.dataset.a=a;if(act._h!==html)act.innerHTML=act._h=html;act.classList.toggle('on',!!a);
 const ce=$('hfCont');if(ce&&ce.classList.contains('on')&&(!contCrop||performance.now()-contT>9000||!emptyIdx().length)){ce.classList.remove('on');contCrop=null;}}
// ── 탭: 칸 누르기 / 빈 땅 누르기 ──
const RC=new T.Raycaster(),NV=new T.Vector2();let down=null;
function onDown(e){if(e.button>0)return;down={x:e.clientX,y:e.clientY,t:performance.now()};}
function onUp(e){if(!down)return;const d=down;down=null;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>9||performance.now()-d.t>600)return;tapAt(e.clientX,e.clientY);}
function farmHitBox(){if(!farmG)return null;let b=farmG.userData.hitBox;const n=nPlots();if(!b||b.userData.n!==n){if(b){farmG.remove(b);b.geometry.dispose();}const h=farmHalf()*2+.3;b=new T.Mesh(new T.BoxGeometry(h,1.2,h),HTM||new T.MeshBasicMaterial({visible:false}));b.position.y=.6;b.userData.n=n;farmG.add(b);farmG.userData.hitBox=b;}return b;}
function tapAt(cx,cy){const cam=G('cam');NV.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);RC.setFromCamera(NV,cam);const f=F();
 if(f&&plotsV.length&&farmG){const me=G('me');const far=me&&me.o.position.distanceTo(farmG.position)>16;
  const hits=RC.intersectObjects(plotsV.map(P=>P.hit),false);const fb=farmHitBox();const onFarm=hits.length||(fb&&RC.intersectObject(fb,false).length);
  // v253: 크게 보기가 꺼져 있으면 텃밭을 누를 때 먼저 크게 보여 줘요 (그다음부터 칸을 눌러 심기·수확)
  if(onFarm&&!zoomOn()){if(far){mini('🌱 텃밭 가까이 가서 눌러 주세요',1400);return true;}zoomSet(true);if(!tapAt._hint){tapAt._hint=1;mini('🔍 텃밭을 크게 봐요 · 칸을 눌러 심고 수확해요 · 움직이면 돌아가요',2600);}return true;}
  if(hits.length){tapPlot(hits[0].object.userData.plot);return true;}
  if(onFarm)return true;
  if(FC.req&&!panelOpen()){if(rfTap())return true;zoomSet(false);return true;}}
 if(rfTap())return true;
 if(!f&&markers){const h=RC.intersectObject(markers.im,false);if(h.length&&h[0].instanceId!=null){askBuy(SLOTS[h[0].instanceId].n);return true;}}
 return false;}
function tapPlot(i){const f=F();const me=G('me');if(me&&farmG&&me.o.position.distanceTo(farmG.position)>16){mini('🌱 텃밭 가까이 가서 눌러 주세요',1400);return;}
 const inf=plotInfo(f.plots[i]);if(inf.st===3){harvest(i);return;}if(inf.st===0){if(contCrop&&performance.now()-contT<9000&&plant(i,contCrop,false))return;openSeed(i);return;}
 mini(`<img class="hfti" src="${ICO(inf.c.k)}" alt=""> ${inf.c.n} · ${inf.st===1?'새싹':'자라는 중'} · ${fmt(inf.left)} 남았어요`,1600);}
W.NK_FARM_UI={tapAt,tapPlot,openSeed,openBag,harvestAll,plant,askBuy,houseSwitch,plotsV:()=>plotsV,farmG:()=>farmG,proj,zoom:zoomSet,zoomOn,FC,RF:()=>RF,farmCode};

// ═════════════ v253 멀티: 다른 낚시꾼 텃밭 ═════════════
// 내 텃밭 상태를 짧은 글자로 실어 보내요 (pose.ex · 영문 키 · 값 24자 제한이라 25칸을 13+12칸으로 나눠요)
//   hfl = 집터 번호 · hfv = 텃밭 단계 · hfa/hfb = 칸마다 한 글자 (작물 번호×4 + 자람 단계 0~3)
const EXA='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.';
const CIDX={};CROPS.forEach((c,i)=>{CIDX[c.k]=i+1;});
function farmCode(){const f=F();if(!f||!(f.lot>0))return null;const n=nPlots();let q='';for(let i=0;i<n;i++){const inf=plotInfo(f.plots[i]);q+=EXA[inf.st&&CIDX[inf.c.k]?CIDX[inf.c.k]*4+inf.st:0];}
 const o={hfl:f.lot|0,hfv:f.lv|0,hfa:q.slice(0,13)||'A'};if(q.length>13)o.hfb=q.slice(13);return o;}
function farmDecode(q){const out=[];for(let i=0;i<q.length;i++){const c=EXA.indexOf(q[i]);if(c<4){out.push(null);continue;}const cr=CROPS[(c>>2)-1];out.push(cr?{k:cr.k,st:Math.max(1,Math.min(3,c&3))}:null);}return out;}
{const _px=W.NK_POSE_EX;W.NK_POSE_EX=()=>{const o=(_px&&_px())||{};try{const c=farmCode();if(c)Object.assign(o,c);}catch(e){}return Object.keys(o).length?o:null;};}
const RF=new Map();// 사람 id → {lot,lv,q,nick,g,fb,crops:[],hit}
const RMAT={};function rMat(k,st){const n=k+st;if(RMAT[n])return RMAT[n];const m=windMat(false,0xf4efe6);m.map=tex(k,st);m.userData.u.uAmp.value=st===1?.02:.04;return RMAT[n]=m;}
function rfLocal(lot,x,z){const s=SLOTS[lot-1];const [fx,fz]=lw(s,0,-9.0);const dx=x-fx,dz=z-fz,c=Math.cos(s.ry),sn=Math.sin(s.ry);return [dx*c-dz*sn,dx*sn+dz*c];}
function rfHalf(lv){const n=STAGES[lv].n,k=Math.round(Math.sqrt(n))||2,cols=n===6?3:k;return cols*1.14/2+.55;}
function rfBlock(x,z){for(const r of RF.values()){if(!r.g)continue;const lp=rfLocal(r.lot,x,z),h=rfHalf(r.lv)+.35;if(Math.abs(lp[0])<h&&Math.abs(lp[1])<h)return true;}return false;}
function rfDrop(r){if(!r.g)return;G('scene').remove(r.g);r.g.traverse(o=>{if(o.geometry&&!SHARED(o.geometry))o.geometry.dispose();});r.g=null;if(r.tag)r.tag.remove();r.tag=null;}
function rfBuild(r){const s=SLOTS[r.lot-1];if(!s)return;const n=STAGES[r.lv].n;const g=new T.Group();g.name='rfFarm';const [x,z]=lw(s,0,-9.0);g.position.set(x,0,z);g.rotation.y=s.ry;
 const st=[];for(let i=0;i<n;i++)st.push(r.cs[i]?'watered':'tilled');
 const fb=W.NK_FARM.build(T,{style:'fence',size:n,plots:st.map(q=>({state:q}))});fb.group.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=true;}});g.add(fb.group);
 shared();const hb=new T.Mesh(new T.BoxGeometry(rfHalf(r.lv)*2+.3,1.2,rfHalf(r.lv)*2+.3),HTM);hb.position.y=.6;g.add(hb);r.hit=hb;
 // 작물: 엇갈린 두 장(위에서 봐도 납작하지 않게) · 재질은 작물·단계마다 하나를 함께 써요
 for(let i=0;i<n;i++){const c=r.cs[i];if(!c)continue;const [px,pz]=fb.plotPos(i);const tx=tex(c.k,c.st),im=tx.image;const K=1.14/450,w=(im&&im.width?im.width:300)*K,h=(im&&im.height?im.height:340)*K;
  const sh=new T.Mesh(SHG,SHM);sh.rotation.x=-Math.PI/2;sh.position.set(px,.172,pz);sh.scale.set(w*.9,(c.st===1?.45:.7)*w,1);g.add(sh);
  for(const a of [0,Math.PI/2]){const m=new T.Mesh(PG,rMat(c.k,c.st));m.position.set(px,.16,pz);m.rotation.y=a+((i*37)%11)/11*.6;m.scale.set(w,h,1);g.add(m);}}
 G('scene').add(g);r.g=g;r.fbKey=n+':'+st.join(',');r.loaded=r.cs.every(c=>!c||(tex(c.k,c.st).image||{}).width);}
function rfTick(){const RT=W.NK_RT;const ps=RT&&RT.status&&RT.status()==='on'&&RT.peers?RT.peers():[];const myLot=(F()||{}).lot|0;const used=new Set();if(myLot)used.add(myLot);const want=new Map();
 // 같은 집터를 여러 명이 골랐으면 접속 번호(id) 순서로 1명만 보여요 · 내 집터와 같으면 늘 내 텃밭
 [...ps].filter(p=>p&&p.id&&p.ex&&p.ex.hfl).sort((a,b)=>String(a.id)<String(b.id)?-1:1).forEach(p=>{const lot=Math.round(+p.ex.hfl);if(!(lot>=1&&lot<=SLOTS.length)||used.has(lot))return;used.add(lot);const lv=Math.max(1,Math.min(5,Math.round(+p.ex.hfv)||1));
  const q=(String(p.ex.hfa||'')+String(p.ex.hfb||'')).slice(0,STAGES[lv].n);want.set(p.id,{lot,lv,q,nick:String(p.nick||'낚시꾼').slice(0,10)});});
 for(const [id,r] of RF){const w=want.get(id);if(!w||w.lot!==r.lot||w.lv!==r.lv){rfDrop(r);RF.delete(id);}}
 for(const [id,w] of want){let r=RF.get(id);if(!r){r={lot:w.lot,lv:w.lv,q:null,nick:w.nick};RF.set(id,r);}r.nick=w.nick;if(r.q!==w.q||!r.loaded){r.q=w.q;r.cs=farmDecode(w.q);rfDrop(r);rfBuild(r);}}
 const hide=new Set(used);if(myLot)hide.delete(myLot);markHide(hide);}
// 이름표: 가까운 다른 사람 텃밭 위에 「○○님 텃밭」 (최대 3개)
let rfW=null;
function rfFrame(t){if(!RF.size){if(rfW)rfW.style.display='none';return;}if(!rfW){rfW=document.createElement('div');rfW.id='hfRF';document.body.appendChild(rfW);}
 const me=G('me');if(!me)return;const am=G('anyModal');const off=panelOpen()||(am&&am())||FC.k>.05;rfW.style.display=off?'none':'';if(off)return;
 const L=[...RF.values()].filter(r=>r.g).map(r=>({r,d:me.o.position.distanceTo(r.g.position)})).filter(o=>o.d<26).sort((a,b)=>a.d-b.d).slice(0,3);const on=new Set(L.map(o=>o.r));
 for(const r of RF.values()){if(!on.has(r)&&r.tag)r.tag.style.display='none';}
 for(const {r} of L){if(!r.tag){r.tag=document.createElement('div');r.tag.className='hfRFt';rfW.appendChild(r.tag);}const h=`🌱 <b>${esc(r.nick)}</b>님 텃밭`;if(r.tag._h!==h)r.tag.innerHTML=r.tag._h=h;
  const [x,y,z]=proj(r.g.position.x,1.9,r.g.position.z);if(z>1||x<-60||x>innerWidth+60||y<-20||y>innerHeight+20){r.tag.style.display='none';continue;}r.tag.style.display='';r.tag.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-100%)`;}}
function rfTap(){for(const r of RF.values()){if(!r.hit)continue;if(RC.intersectObject(r.hit,false).length){const f=F();mini(`🌱 <b>${esc(r.nick)}</b>님의 텃밭이에요${f?` · 내 텃밭은 ${f.lot}번 집터`:''}`,1800);return true;}}return false;}
// ── 시작: 게임이 준비되면 섬을 만들고 그 위로 옮겨요 ──
function spawn(){const me=G('me');const f=F();let x,z,a;
 if(f&&lotOf(f.lot)){const s=lotOf(f.lot);[x,z]=lw(s,3.9,-5.2);const fp=lw(s,0,-9.0);a=Math.atan2(fp[0]-x,fp[1]-z);}
 else if(PIER){x=OX+PIER.start[0]+3;z=PIER.start[1];a=Math.PI/2;}else{x=OX-100;z=0;a=Math.PI/2;}
 me.o.position.set(x,.1,z);me.dir=a;me.o.rotation.y=a;/* 선착장 도착: 광장 가로등이 캐릭터를 가리지 않게 카메라를 살짝 비스듬히 */try{W.__nkHF.setYaw(a+Math.PI+(f&&lotOf(f.lot)?0:.5));}catch(e){}}
function boot(){GC.cam=G('cam');GC.scene=G('scene');mkTex();PG=new T.PlaneGeometry(1,1);PG.translate(0,.5,0);buildIsland();mkParts();if(F()){sanitize();buildFarmObj(false);}hideLake();setInterval(()=>{try{hideLake();}catch(e){}},1000);
 spawn();try{const S=S_();S.vehRide=0;}catch(e){}
 const cv=G('R')&&G('R').domElement||$('world');(cv||document).addEventListener('pointerdown',onDown,{passive:true});(cv||document).addEventListener('pointerup',onUp,{passive:true});
 try{G('FHOOK').push(()=>{try{frame();}catch(e){if(!frame._e){frame._e=1;console.warn('[farm] frame',e);}}});}catch(e){setInterval(frame,33);}
 setInterval(()=>{try{hudBtns();const fi=G('fishing');if(fi&&fi.state!=='off'){G('endFish')();mini('🏡 하우징 섬에서는 낚시를 할 수 없어요',1600);}try{W.NK_HOUSE.setTime(T,+G('NIGHT')||0);}catch(e){}}catch(e){}},300);
 syncClock();
 setInterval(()=>{try{rfTick();}catch(e){if(!rfTick._e){rfTick._e=1;console.warn('[farm] rf',e);}}},700);
 setTimeout(()=>{mini(F()?`🏡 하우징 섬 · ${F().lot}번 집터 내 텃밭`:'🏡 하우징 섬에 왔어요 · 마음에 드는 집터의 빈 땅(점선)에서 농사 땅을 살 수 있어요',3400);},900);
 W.__nkHouseReady=1;}
const iv=setInterval(()=>{try{if(!G('started')||!G('me')||!W.NK_ISLAND50)return;clearInterval(iv);boot();}catch(e){clearInterval(iv);console.warn('[farm] boot',e);}},300);
// 섬에서는 탈것을 타지 않아요 (배가 땅 위에 뜨지 않게)
try{G('PHOOK').push(()=>{try{const S=S_();if(S&&S.vehRide&&W.__nkHouseReady){S.vehRide=0;}}catch(e){}});}catch(e){}
})();
