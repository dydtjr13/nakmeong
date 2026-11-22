// ─────────────────────────────────────────────────────────────
// v184 슈퍼 초월급 물고기 + v213 부산 부캉이
//  · 호숫가 천년 금빛잉어 · 운하 등불 혹등고래 · 운하 부산 부캉이 · 하늘섬 구름 가오리 · 달 성운 철갑상어
//  · 입질(어둠·찌 쿵·맵별 효과·⚠ 경고·지금 챔질!) → 낚기(빛기둥·점프·슬로모션·무지개 카드·서버 공지)
//  · 어항(오라·반짝이) · 도감(슈퍼 초월 칸 S01~S05 + 상세)
//  · game-v2.js 의 훅: NKST.roll / onCast / onBite / onMiss / onCatch / dexSection, 등급 6 = D.STX
//  · 테스트: 관리자 › 테스트 기능 › 「👑 슈퍼 초월급」 상자에서 「다음 입질」 (관리자·운영자만 · 공지·순위에 안 올라가요)
//  · 확률: 기본 1/300,000 번 던질 때 (일반 초월보다 약 20배 드물게) · 관리자가 바꿀 수 있어요 (play.stRate) · 자동 낚시에서는 안 나와요
// ─────────────────────────────────────────────────────────────
(function(){'use strict';
const D=window.NK_DATA;if(!D)return;
const I=()=>window.__nkInt;
const $=id=>document.getElementById(id);
const SP=[
 {k:'st_carp', no:'S01',n:'천년 금빛잉어', map:'lake', mapN:'호숫가',min:180,max:260,base:60000,col:'#e9b832',glow:'#ffd34d',a:'#ffe27a',b:'#ff9f2e',theme:'gold',  icon:'🌟',
  eff:'어항에 있으면 골드 +5%',when:'호숫가에서 낚시할 때 (자동 낚시 제외)',rate:20000,size:3.4,
  flav:'천 년 동안 호숫가를 지켜 온 잉어예요. 비늘마다 구름 무늬가 새겨져 있고, 지느러미는 비단처럼 흩날려요.'},
 {k:'st_whale',no:'S02',n:'등불 혹등고래',map:'canal',mapN:'운하',  min:1100,max:1520,base:90000,col:'#24407a',glow:'#ffb347',a:'#ffc36b',b:'#3a64c8',theme:'lantern',icon:'🏮',
  eff:'어항에 있으면 경험치 +5%',when:'운하에서 낚시할 때 (자동 낚시 제외)',rate:25000,size:9,
  flav:'등에 붙은 따개비가 등불처럼 빛나는 고래예요. 운하의 밤길을 밝혀 준다는 이야기가 있어요.'},
 {k:'st_bukang',no:'S05',n:'부산 부캉이',map:'canal',mapN:'운하', min:280,max:360,base:90000,col:'#1c2a4a',glow:'#ffb347',a:'#ffc36b',b:'#24407a',theme:'harbor',icon:'🦈',src:'v213 슈퍼 초월',
  eff:'어항에 있으면 골드 +5%',when:'운하에서 낚시할 때 (자동 낚시 제외)',rate:25000,size:6.2,
  flav:'북항의 밤빛을 비늘에 담은 흑상어예요. 항구의 불빛이 몸에 송송 떠 있고, 등줄기 융기선이 따뜻하게 빛나요.'},
 {k:'st_ray',  no:'S03',n:'구름 가오리',  map:'sky',  mapN:'하늘섬',min:500,max:720,base:80000,col:'#9fd8ff',glow:'#c8ecff',a:'#ffffff',b:'#9fd0ff',theme:'rainbow',icon:'☁️',
  eff:'어항에 있으면 행운 상자 +5%',when:'하늘섬이 열리면 만날 수 있어요',rate:22000,soon:1,size:6,
  flav:'구름 속을 헤엄치는 가오리예요. 날개 끝을 따라 무지개 띠가 흐르고, 지나간 자리에 작은 구름이 남아요.'},
 {k:'st_stur', no:'S04',n:'성운 철갑상어',map:'moon', mapN:'달',    min:400,max:560,base:100000,col:'#5b3fa8',glow:'#b48cff',a:'#c9a8ff',b:'#5ad8ff',theme:'nebula',icon:'🌙',
  eff:'어항에 있으면 골드·경험치 +3%',when:'달에서 낚시할 때 (자동 낚시 제외)',rate:30000,size:6.5,
  flav:'몸에 성운을 품은 철갑상어예요. 등의 갑판이 별처럼 빛나고, 비늘 사이로 별자리 선이 이어져 있어요.'}];
const SPK=k=>SP.find(s=>s.k===k);
/* v184: 어항 효과 — 어항에 있는 동안만 (같은 종 여러 마리여도 한 번만) */
const EFF={gold:{st_carp:.05,st_stur:.03,st_bukang:.05},xp:{st_whale:.05,st_stur:.03},box:{st_ray:.05}};
D.STX={id:6,n:'슈퍼 초월급',c:'#ff9a3c',m:300};
for(const s of SP){if(D.FISH.some(f=>f.k===s.k))continue;D.FISH.push({k:s.k,n:s.n,min:s.min,max:s.max,g:[s.min,s.min,s.min,s.min],scale:30,w:0,base:s.base,col:s.col,img:'img/fish/'+s.k+'.png',sx:1,limited:1,stNo:s.no,stMap:s.map,src:s.src||'v184 슈퍼 초월급'});}
/* v184: 관리자·운영자만 테스트 · 켜기/확률은 모든 유저 같은 값(play) */
const staff=()=>{try{if(window.NK_ADMSET&&NK_ADMSET.staff)return !!NK_ADMSET.staff();return !!((window.NK_ADM&&NK_ADM.ok())||(window.NK_RT&&NK_RT.op));}catch(e){return false;}};
const opt=(k,d)=>{try{return window.NKV2&&NKV2.uiOpt?NKV2.uiOpt(k,d):d;}catch(e){return d;}};
const stOn=()=>!window.NK_PREV&&String(opt('stOn','on'))!=='off';
const RATE0=300000,baseN=()=>{const n=Math.round(+opt('stRate',RATE0));return Number.isFinite(n)&&n>=10000?n:RATE0;};
const rateOf=sp=>Math.round(baseN()*sp.rate/20000);/* 잉어 = 1/N · 고래·부캉이 ×1.25 · 가오리 ×1.1 · 철갑상어 ×1.5 */
const skyOpen=()=>!!window.__nkSkyIsland;/* 하늘섬 맵이 생기면 그 맵에서 true 로 */
const NKST=window.NKST={SP,SPK,tankEff(kind){const E=EFF[kind];if(!E)return 1;let m=1;try{const T=(window.NKV2&&NKV2.S&&NKV2.S.tank)||[];for(const k in E)if(T.some(f=>f.k===k))m+=E[k];}catch(e){}return m;},forced:null,ts:1,rateOf,baseN,staff,stOn,skyOpen,
 force(k){if(!staff()){try{I().toast('관리자·운영자만 테스트할 수 있어요',1500);}catch(e){}return null;}const kk=k&&k.startsWith('st_')?k:'st_'+(k||'carp');if(!SPK(kk))return null;this.forced=kk;return kk;},
 mapNow(spot){try{const it=I();if(skyOpen()&&window.__nkSkyIslandNow&&__nkSkyIslandNow())return 'sky';if(it.SKY().on)return 'moon';const C=it.CNL();if(C&&C.st&&(sessionStorage.getItem('nk_sea')==='1'||(spot&&spot.cnl)))return 'canal';}catch(e){}return 'lake';}};
{const m=/[?&]stforce=([a-z_]+)/.exec(location.search);if(m)setTimeout(()=>{if(staff())NKST.forced=m[1].startsWith('st_')?m[1]:'st_'+m[1];},4000);}

// ── 이미지·텍스처 ──
const IMG={};const img=src=>IMG[src]||(IMG[src]=Object.assign(new Image(),{src}));SP.forEach(s=>{img('img/fish/'+s.k+'.png');img('img/fish/'+s.k+'@2x.png');});
const TEX={};
function cvTex(key,w,h,draw){if(TEX[key])return TEX[key];const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return TEX[key]=t;}
const glowTex=()=>cvTex('glow',128,128,(g,w)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.55)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
const starTex=()=>cvTex('star',128,128,(g)=>{g.translate(64,64);const r=g.createRadialGradient(0,0,0,0,0,40);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?9:62;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.fill();g.globalCompositeOperation='lighter';g.fillStyle=r;g.beginPath();g.arc(0,0,26,0,7);g.fill();});
const ringTex=()=>cvTex('ring',256,256,(g)=>{const r=g.createRadialGradient(128,128,70,128,128,126);r.addColorStop(0,'rgba(255,255,255,0)');r.addColorStop(.55,'rgba(255,255,255,.95)');r.addColorStop(.7,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,256,256);});
const discTex=()=>cvTex('disc',256,256,(g)=>{const r=g.createRadialGradient(128,128,0,128,128,128);r.addColorStop(0,'rgba(255,255,255,.95)');r.addColorStop(.35,'rgba(255,255,255,.55)');r.addColorStop(.7,'rgba(255,255,255,.16)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,256,256);});
const beamTex=()=>cvTex('beam',64,256,(g)=>{const l=g.createLinearGradient(0,0,0,256);l.addColorStop(0,'rgba(255,255,255,0)');l.addColorStop(.55,'rgba(255,255,255,.55)');l.addColorStop(.92,'rgba(255,255,255,1)');l.addColorStop(1,'rgba(255,255,255,.2)');g.fillStyle=l;g.fillRect(0,0,64,256);const h=g.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(0,0,0,.65)');h.addColorStop(.5,'rgba(0,0,0,0)');h.addColorStop(1,'rgba(0,0,0,.65)');g.globalCompositeOperation='destination-out';g.fillStyle=h;g.fillRect(0,0,64,256);});
const lanternTex=()=>cvTex('lant',128,128,(g)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(255,200,110,.9)');r.addColorStop(1,'rgba(255,150,40,0)');g.fillStyle=r;g.fillRect(0,0,128,128);g.fillStyle='#ffb54d';g.strokeStyle='#c4561f';g.lineWidth=5;g.beginPath();g.roundRect(44,36,40,54,12);g.fill();g.stroke();g.fillStyle='#fff3c8';g.fillRect(52,46,24,34);g.fillStyle='#7a3a18';g.fillRect(50,30,28,8);g.fillRect(50,88,28,7);});
const petalTex=()=>cvTex('petal',128,128,(g)=>{g.translate(64,64);g.rotate(.6);const r=g.createRadialGradient(0,0,0,0,0,50);r.addColorStop(0,'rgba(255,250,210,1)');r.addColorStop(.6,'rgba(255,214,90,.95)');r.addColorStop(1,'rgba(255,180,40,0)');g.fillStyle=r;g.beginPath();g.ellipse(0,0,46,22,0,0,7);g.fill();});
const cloudTex=()=>cvTex('cloud',128,128,(g)=>{g.fillStyle='rgba(255,255,255,.95)';for(const [x,y,r] of [[44,72,26],[70,62,32],[94,74,22],[60,82,24]]){const rg=g.createRadialGradient(x,y,0,x,y,r);rg.addColorStop(0,'rgba(255,255,255,1)');rg.addColorStop(.8,'rgba(255,255,255,.85)');rg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,7);g.fill();}});
/* v182.1: 원본 그림 비율 그대로 붙여요 (예전엔 정사각 캔버스에 넣어 세로로 눌렸어요) */
const ASP0={st_carp:1.62,st_whale:2.18,st_bukang:2.09,st_ray:1.07,st_stur:2.77};
const fishTex=(k,lin)=>{const key='fishT_'+k+(lin?'_l':'');if(TEX[key])return TEX[key];const im=img('img/fish/'+k+'@2x.png');const t=new THREE.Texture(im);t.encoding=lin?THREE.LinearEncoding:THREE.sRGBEncoding;t.anisotropy=4;const up=()=>{t.needsUpdate=true;};if(im.complete&&im.naturalWidth)up();else im.addEventListener('load',up);return TEX[key]=t;};
const fishAsp=k=>{const im=img('img/fish/'+k+'@2x.png');return im.naturalWidth?im.naturalWidth/im.naturalHeight:(ASP0[k]||2);};
/* 입체 물고기: 앞면(조명 셰이더) + 두께 슬라이스 + 빛 테두리. 크기는 항상 균일(비율 유지) */
const LIT_VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
const LIT_FS=`uniform sampler2D map;uniform vec2 px;uniform vec3 L;uniform vec3 rim;uniform float sheen;uniform float op;varying vec2 vUv;
float A(vec2 o){return texture2D(map,vUv+o*px).a;}
void main(){vec4 c=texture2D(map,vUv);if(c.a<.04)discard;
 vec2 g=vec2(0.);for(int i=1;i<=3;i++){float r=float(i)*5.;g+=vec2(A(vec2(r,0.))-A(vec2(-r,0.)),A(vec2(0.,r))-A(vec2(0.,-r)))/float(i);}
 vec3 n=normalize(vec3(-g*1.15,1.));float dif=clamp(dot(n,normalize(L)),0.,1.);
 vec3 col=c.rgb*(.78+.42*dif);
 float sp=pow(max(dot(reflect(-normalize(L),n),vec3(0.,0.,1.)),0.),18.);col+=vec3(1.)*sp*.28;
 float e=clamp(1.-n.z,0.,1.);col+=rim*pow(e,.7)*1.1;
 float b=smoothstep(.09,0.,abs(vUv.x*.8+vUv.y*.45-sheen));col+=vec3(1.,.98,.9)*b*.32*c.a;
 gl_FragColor=vec4(col,c.a*op);}`;
function fish3D(sp){const asp=fishAsp(sp.k),W=sp.size,H=W/asp,geo=new THREE.PlaneGeometry(W,H),G=new THREE.Group();
 const front=new THREE.Mesh(geo,new THREE.ShaderMaterial({uniforms:{map:{value:fishTex(sp.k,1)},px:{value:(()=>{const im=img('img/fish/'+sp.k+'@2x.png'),w=im.naturalWidth||880;return new THREE.Vector2(1/w,asp/w);})()},L:{value:new THREE.Vector3(-.45,.75,.6)},rim:{value:new THREE.Color(sp.glow)},sheen:{value:-1},op:{value:1}},vertexShader:LIT_VS,fragmentShader:LIT_FS,side:THREE.FrontSide,transparent:true,depthWrite:true}));front.renderOrder=6;G.add(front);
 const T=Math.min(H*.2,W*.07),N=8,base=new THREE.Color(sp.col),dark=base.clone().multiplyScalar(.42);
 for(let i=1;i<=N;i++){const q=i/N,c=dark.clone().lerp(base,.35*Math.sin(q*Math.PI));const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:fishTex(sp.k),color:c,alphaTest:.5,side:THREE.DoubleSide}));m.position.z=-T*q;m.scale.setScalar(1-.035*Math.sin(q*Math.PI*.5));m.renderOrder=5;G.add(m);}
 const back=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:fishTex(sp.k),color:base.clone().multiplyScalar(.8),alphaTest:.5,side:THREE.FrontSide}));back.position.z=-T-.002;back.rotation.y=Math.PI;G.add(back);
 const edge=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:fishTex(sp.k),color:new THREE.Color(sp.glow),transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));edge.position.z=-T*.5;edge.scale.setScalar(1.07);edge.renderOrder=4;G.add(edge);
 G.userData={front,edge,W,H,T};return G;}

// ── 소리 (WebAudio 합성) ──
let AC=null,AM=null;
/* v201: 소리 끄기·전체 소리·효과음 크기를 따라요 (예전엔 늘 같은 크기였어요) */function stG(){if(AM)try{AM.gain.value=.55*(window.NK_sfxGain?NK_sfxGain():.8);}catch(e){}}
function ac(){if(AC){stG();return AC;}try{AC=new (window.AudioContext||window.webkitAudioContext)();AM=AC.createGain();AM.gain.value=.55;AM.connect(AC.destination);stG();}catch(e){AC=null;}return AC;}
function osc(f1,f2,dur,type,g,dl=0,dest){const A=ac();if(!A)return;const t=A.currentTime+dl,o=A.createOscillator(),gn=A.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f1,t);if(f2!==f1)o.frequency.exponentialRampToValueAtTime(Math.max(1,f2),t+dur);gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+.012);gn.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(gn).connect(dest||AM);o.start(t);o.stop(t+dur+.05);}
function noise(dur,g,dl=0,ft='lowpass',f1=800,f2=800,q=.8){const A=ac();if(!A)return;const t=A.currentTime+dl,n=Math.floor(A.sampleRate*dur),b=A.createBuffer(1,n,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=A.createBufferSource();s.buffer=b;const fl=A.createBiquadFilter();fl.type=ft;fl.Q.value=q;fl.frequency.setValueAtTime(f1,t);fl.frequency.exponentialRampToValueAtTime(f2,t+dur);const gn=A.createGain();gn.gain.setValueAtTime(.0001,t);gn.gain.exponentialRampToValueAtTime(g,t+.03);gn.gain.exponentialRampToValueAtTime(.0005,t+dur);s.connect(fl).connect(gn).connect(AM);s.start(t);s.stop(t+dur+.05);}
const SFX={
 omen(){osc(55,38,2.2,'sine',.5);noise(2.0,.12,0,'lowpass',300,90);osc(110,82,1.6,'triangle',.08,.1);},
 thud(){osc(90,32,.7,'sine',.9);osc(180,60,.25,'triangle',.25);noise(.5,.35,0,'lowpass',1400,200);noise(.9,.18,.05,'bandpass',2500,600,1.2);},
 theme(th){const N={gold:[784,988,1175,1568],lantern:[523,659,784,1047],harbor:[523,659,784,1047],rainbow:[880,1109,1319,1760],nebula:[659,831,988,1319]}[th]||[784,988,1175,1568];N.forEach((f,i)=>{osc(f,f,1.4,'sine',.09,i*.11);osc(f*2,f*2,.9,'sine',.03,i*.11+.02);});},
 warn(){for(let i=0;i<3;i++){osc(740,740,.16,'square',.07,i*.34);osc(988,988,.16,'square',.07,i*.34+.17);}osc(60,45,1.2,'sine',.4,0);},
 hook(){noise(.35,.5,0,'highpass',600,3000);osc(1200,300,.3,'sawtooth',.08);},
 pillar(){noise(1.6,.35,0,'bandpass',300,5000,1.4);osc(70,30,1.8,'sine',1);osc(140,50,.9,'triangle',.3);[523,659,784,1047,1319,1568,2093].forEach((f,i)=>osc(f,f,1.8,'triangle',.07,.15+i*.06));noise(2.2,.08,.3,'highpass',6000,9000);},
 splash(){noise(.9,.8,0,'lowpass',2600,300);noise(.5,.4,.05,'bandpass',3000,900,1.5);},
 fanfare(){const C=[[523,659,784],[587,740,880],[659,831,988],[784,988,1175,1568]];C.forEach((ch,i)=>ch.forEach(f=>{osc(f,f,i===3?1.8:.42,'sawtooth',.035,i*.22);osc(f,f,i===3?1.9:.45,'triangle',.06,i*.22);}));osc(65,40,1.4,'sine',.6,.66);[2093,2637,3136,4186].forEach((f,i)=>osc(f,f,.5,'sine',.04,.7+i*.08));},
 notice(){osc(988,988,.5,'sine',.24);osc(1319,1319,.8,'sine',.24,.18);osc(1976,1976,.6,'sine',.08,.18);},
 cheer(){for(let i=0;i<6;i++)osc(1400+i*180,1400+i*180,.12,'sine',.12,i*.09);}};/* v201: 물보라·알림·환호가 다른 소리에 묻혀서 크게 */
NKST.SFX=SFX;

// ── 3D 효과 ──
const FX={list:[]};
function addFx(o,upd,life){const sc=window.NKV2&&NKV2.scene;if(!sc)return;sc.add(o);FX.list.push({o,upd,t0:gT(),life});return o;}
const gT=()=>{try{return I().T;}catch(e){return performance.now()/1000;}};
function fxTick(){const t=gT();for(let i=FX.list.length-1;i>=0;i--){const x=FX.list[i],e=t-x.t0;let alive=e<x.life;try{if(alive&&x.upd(e,x)===false)alive=false;}catch(err){alive=false;}if(!alive){x.o.parent&&x.o.parent.remove(x.o);x.o.traverse&&x.o.traverse(m=>{if(m.geometry)m.geometry.dispose();});FX.list.splice(i,1);}}}
function addMat(tex,col,op){return new THREE.MeshBasicMaterial({map:tex,color:new THREE.Color(col),transparent:true,opacity:op==null?1:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});}
function points(n,tex,col,size,init){const pos=new Float32Array(n*3),g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.PointsMaterial({map:tex,color:new THREE.Color(col),size,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true});const p=new THREE.Points(g,m);p.frustumCulled=false;const S=[];for(let i=0;i<n;i++)S.push(init(i));p.userData.S=S;return p;}
let rs=7;const rnd=()=>{rs=(rs*16807)%2147483647;return (rs-1)/2147483646;};
function waterY(){return -.05;}
function bobPos(){const it=I();const b=it.bob;return b?b.position.clone():new THREE.Vector3();}
// 입질: 물빛 · 물결 링 · 맵별 파티클
function biteFx(sp){const p=bobPos(),wy=p.y+.04;const G=new THREE.Group();G.position.set(p.x,wy,p.z);
 const disc=new THREE.Mesh(new THREE.PlaneGeometry(1,1),addMat(discTex(),sp.glow,0));disc.rotation.x=-Math.PI/2;G.add(disc);
 const rings=[0,1,2].map(i=>{const r=new THREE.Mesh(new THREE.PlaneGeometry(1,1),addMat(ringTex(),sp.a,0));r.rotation.x=-Math.PI/2;r.position.y=.02;G.add(r);return r;});
 const th=sp.theme,tex=(th==='lantern'||th==='harbor')?lanternTex():th==='gold'?petalTex():th==='rainbow'?cloudTex():starTex();
 const N=(th==='lantern'||th==='harbor')?34:th==='rainbow'?26:60;const pts=points(N,tex,(th==='lantern'||th==='harbor'||th==='rainbow')?'#ffffff':sp.a,(th==='lantern'||th==='harbor')?1.3:th==='rainbow'?2.2:.55,()=>({r:2+rnd()*7,a:rnd()*6.28,y:((th==='lantern'||th==='harbor')?0.3:0)+rnd()*(th==='rainbow'?3:2.5),v:.2+rnd()*.5,ph:rnd()*6}));G.add(pts);
 let rb=null;if(th==='rainbow'){rb=new THREE.Mesh(new THREE.TorusGeometry(9,.55,8,64,Math.PI),new THREE.MeshBasicMaterial({vertexColors:false,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,color:'#ffffff',map:cvTex('rbw',256,8,(g)=>{const l=g.createLinearGradient(0,0,256,0);['#ff6b8a','#ffb347','#ffe066','#6be28a','#59c3ff','#9a7bff'].forEach((c,i)=>l.addColorStop(i/5,c));g.fillStyle=l;g.fillRect(0,0,256,8);})}));rb.position.set(0,0,-4);G.add(rb);}
 let lines=null;if(th==='nebula'){const v=[];for(let i=0;i<9;i++){v.push((rnd()-.5)*12,1+rnd()*5,(rnd()-.5)*8);}const lg=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(v,3));lines=new THREE.Line(lg,new THREE.LineBasicMaterial({color:'#e8d48a',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));G.add(lines);}
 NKST._bite=G;
 addFx(G,(e)=>{if(NKST._bite!==G){/* 끝 */G.userData.fade=(G.userData.fade||0)+.05;if(G.userData.fade>1)return false;}const f=1-(G.userData.fade||0),k=Math.min(1,e/0.8)*f;
  const s=6+Math.sin(e*3)*.6;disc.scale.set(s*1.6,s*1.6,1);disc.material.opacity=(.55+.25*Math.sin(e*5))*k;
  rings.forEach((r,i)=>{const q=((e*.55+i/3)%1);r.scale.setScalar(1+q*11);r.material.opacity=(1-q)*.85*k;});
  const P=pts.geometry.attributes.position.array;pts.userData.S.forEach((s,i)=>{const a=s.a+e*.12*(i%2?1:-1),y=(th==='lantern'||th==='harbor')?s.y+((e*s.v*.6)%5):th==='gold'?s.y+Math.sin(e*s.v+s.ph)*.4+.3:s.y+Math.sin(e*.8+s.ph)*.3;P[i*3]=Math.cos(a)*s.r;P[i*3+1]=y;P[i*3+2]=Math.sin(a)*s.r;});pts.geometry.attributes.position.needsUpdate=true;pts.material.opacity=k;
  if(rb){rb.material.opacity=.6*k;rb.lookAt(NKV2.cam.position.x,rb.getWorldPosition(new THREE.Vector3()).y,NKV2.cam.position.z);}
  if(lines)lines.material.opacity=.7*k*(.6+.4*Math.sin(e*4));},60);}
// 낚기: 빛기둥 · 물기둥 · 입체 물고기 점프(카메라 줌인) · 물방울 · 수면 그림자
function catchFx(sp){const p=bobPos();p.y=Math.max(p.y,waterY());const G=new THREE.Group();G.position.set(p.x,p.y,p.z);
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(1.4,2.2,70,32,1,true),addMat(beamTex(),sp.glow,0));beam.position.y=35;G.add(beam);
 const core=new THREE.Mesh(new THREE.CylinderGeometry(.45,.7,70,24,1,true),addMat(beamTex(),'#ffffff',0));core.position.y=35;G.add(core);
 const disc=new THREE.Mesh(new THREE.PlaneGeometry(1,1),addMat(discTex(),sp.glow,0));disc.rotation.x=-Math.PI/2;disc.position.y=.06;G.add(disc);
 const wave=new THREE.Mesh(new THREE.PlaneGeometry(1,1),addMat(ringTex(),'#ffffff',0));wave.rotation.x=-Math.PI/2;wave.position.y=.08;G.add(wave);
 const drops=points(160,glowTex(),'#e8fbff',.26,()=>{const a=rnd()*6.28,r=rnd();return {vx:Math.cos(a)*r*5,vz:Math.sin(a)*r*5,vy:6+rnd()*10,d:rnd()*.15};});G.add(drops);
 const spk=points(90,starTex(),sp.a,.9,()=>({a:rnd()*6.28,r:1+rnd()*3.5,y:rnd()*14,v:.5+rnd()}));G.add(spk);
 let cK=0;const F=fish3D(sp),{W,H}=F.userData;
 const halo=new THREE.Mesh(new THREE.PlaneGeometry(W*1.8,W*1.8),addMat(glowTex(),sp.glow,0));halo.renderOrder=3;
 const FG=new THREE.Group(),R=new THREE.Group();R.add(F);FG.add(halo);FG.add(R);G.add(FG);FG.visible=false;
 // 몸에서 떨어지는 물방울 (물고기 앞뒤로 섞여서 깊이감)
 const trail=points(120,glowTex(),'#f2fdff',.2,()=>({life:-1,x:0,y:0,z:0,vx:0,vy:0,vz:0}));G.add(trail);
 // 수면 그림자
 const shTex=cvTex('stShadow',128,128,(g)=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(0,0,0,.75)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,128,128);});
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:shTex,transparent:true,opacity:0,depthWrite:false,color:'#10203a'}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.1;G.add(shadow);
 const splash2=points(90,glowTex(),'#ffffff',.5,()=>{const a=rnd()*6.28,r=rnd();return {vx:Math.cos(a)*r*4,vz:Math.sin(a)*r*4,vy:4+rnd()*7};});G.add(splash2);
 const cam=NKV2.cam,C0=cam.position.clone(),fwd=new THREE.Vector3(0,0,-1).applyQuaternion(cam.quaternion);const dB=Math.max(4,new THREE.Vector3().subVectors(p,C0).dot(fwd)),L0=C0.clone().addScaledVector(fwd,dB);
 const right=new THREE.Vector3(1,0,0).applyQuaternion(cam.quaternion).setY(0).normalize(),toCam=new THREE.Vector3(-right.z,0,right.x);if(toCam.dot(new THREE.Vector3().subVectors(C0,p))<0)toCam.negate();
 const peak=H*.55+W*.22+.6;
 // 줌인 카메라: 물고기가 화면 가로의 PC 52% / 모바일 88% 정도로 크게
 const asp=innerWidth/innerHeight,tanH=Math.tan(cam.fov*Math.PI/360),frac=asp<1?.88:.52,span=W*1.55;let D=span/(frac*2*tanH*asp);D=Math.max(D,(peak+H*.9)/(2*tanH*.9));
 const Lz=p.clone().add(new THREE.Vector3(0,peak*.62,0)),dir=toCam.clone().applyAxisAngle(new THREE.Vector3(0,1,0),.32);
 const Cz=Lz.clone().addScaledVector(dir,D*.97).add(new THREE.Vector3(0,D*.2,0));
 const ss=x=>x<=0?0:x>=1?1:x*x*(3-2*x);let camOn=false;const setC=k=>{cK=k;const P=C0.clone().lerp(Cz,k),Lk=L0.clone().lerp(Lz,k);try{NKV2.setCam(P.x,P.y,P.z,Lk.x,Lk.y,Lk.z);camOn=true;}catch(e){}};
 const camOff=()=>{if(camOn){try{NKV2.setCam(null);}catch(e){}camOn=false;}};NKST._camOff=camOff;
 NKST._jump=FG;let lastE=0;const tw=new THREE.Vector3();
 addFx(G,(e,x)=>{// e = 게임 시간(슬로모션 반영)
  const dt=Math.max(0,Math.min(.05,e-lastE));lastE=e;
  try{const bb=I().bob;if(bb)bb.visible=e>1.3;}catch(_){}
  const k1=Math.min(1,e/.25),fade=e>2.4?Math.max(0,1-(e-2.4)/1.2):1;
  const zk=1-.72*cK;beam.material.opacity=.85*k1*fade*zk;core.material.opacity=k1*fade*zk;beam.scale.set(1+Math.sin(e*9)*.04,Math.min(1,e/.35),1+Math.sin(e*9)*.04);core.scale.y=beam.scale.y;spk.material.size=.9-.55*cK;
  disc.scale.setScalar(8+e*4);disc.material.opacity=.9*fade*(1-.6*cK);wave.scale.setScalar(2+e*16);wave.material.opacity=Math.max(0,1-e/1.6)*(1-.65*cK);
  const P=drops.geometry.attributes.position.array;drops.userData.S.forEach((s,i)=>{const t=Math.max(0,e-s.d);P[i*3]=s.vx*t;P[i*3+1]=Math.max(-.2,s.vy*t-9.8*t*t*.5);P[i*3+2]=s.vz*t;});drops.geometry.attributes.position.needsUpdate=true;drops.material.opacity=Math.max(0,1-e/2.4);
  const Q=spk.geometry.attributes.position.array;spk.userData.S.forEach((s,i)=>{const a=s.a+e*s.v;Q[i*3]=Math.cos(a)*s.r;Q[i*3+1]=(s.y+e*3)%18;Q[i*3+2]=Math.sin(a)*s.r;});spk.geometry.attributes.position.needsUpdate=true;spk.material.opacity=fade;
  // 카메라: 0.12~0.42초 다가가고, 카드가 뜬 뒤(1.15초~) 천천히 돌아와요
  if(e<1.15)setC(ss((e-.12)/.3));else if(e<1.9)setC(1-ss((e-1.15)/.75));else camOff();
  // 점프 경로 (0.1~1.08초, 정점 부근이 슬로모션)
  const j=(e-.1)/.98;
  if(j>0&&j<1){FG.visible=true;const u=j,y=-H*.7+(peak+H*.7)*4*u*(1-u),vy=(peak+H*.7)*4*(1-2*u);
   FG.position.copy(right).multiplyScalar((u-.5)*W*.45).addScaledVector(toCam,Math.sin(u*Math.PI)*.3);FG.position.y=y;
   FG.quaternion.copy(cam.quaternion);
   const roll=Math.atan2(vy*.5,W*.9)*.6;R.rotation.set(0,.34-u*.56,roll);
   const pop=.82+.18*ss(u/.18);F.scale.setScalar(pop);
   halo.material.opacity=.55*Math.min(1,u*5)*Math.min(1,(1-u)*6);
   F.userData.front.material.uniforms.sheen.value=-.3+u*1.9;F.userData.edge.material.opacity=.3+.18*Math.sin(e*14);
   shadow.position.x=FG.position.x;shadow.position.z=FG.position.z;const hh=Math.max(0,y);shadow.scale.set(W*(.9+hh*.05),H*(.6+hh*.03),1);shadow.material.opacity=y>-H*.3?.38*Math.max(.25,1-hh/(peak*1.4)):0;
   FG.getWorldPosition(tw);
   const TP=trail.geometry.attributes.position.array;let born=0;trail.userData.S.forEach((s,i)=>{if(s.life<0&&born<4&&y>0){s.life=.9;s.x=FG.position.x+(rnd()-.5)*W*.7;s.y=y+(rnd()-.5)*H*.5;s.z=FG.position.z+(rnd()-.5)*1.2;s.vx=(rnd()-.5)*1.2;s.vy=rnd()*1.5;s.vz=(rnd()-.5)*1.2;born++;}
    if(s.life>=0){s.life-=dt;s.vy-=9.8*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;if(s.life<0||s.y<0)s.life=-1;}TP[i*3]=s.life>=0?s.x:0;TP[i*3+1]=s.life>=0?s.y:-50;TP[i*3+2]=s.life>=0?s.z:0;});trail.geometry.attributes.position.needsUpdate=true;trail.material.opacity=.95;
  }else FG.visible=false;
  // 다시 떨어질 때 물보라
  const j2=e-1.06;const S2=splash2.geometry.attributes.position.array;splash2.userData.S.forEach((s,i)=>{const t=Math.max(0,j2);S2[i*3]=W*.45*right.x+s.vx*t;S2[i*3+1]=j2>0?Math.max(-.2,s.vy*t-9.8*t*t*.5):-50;S2[i*3+2]=W*.45*right.z+s.vz*t;});splash2.geometry.attributes.position.needsUpdate=true;splash2.material.opacity=j2>0?Math.max(0,1-j2/1.2):0;
  if(e>=4.6){camOff();return false;}return true;},6);}
// 찌 흔들림 (PHOOK: 찌 위치를 정한 뒤 불려요)
function bobHook(dt){const it=I(),f=it.fishing,b=it.bob;if(!b)return;if(f&&f.st&&f.state==='bite'){const e=(performance.now()-(f.stT||0))/1000;const thud=e<.35?Math.sin(e/.35*Math.PI):0;b.position.y-=.25+thud*.55+Math.abs(Math.sin(e*16))*.12;b.rotation.z=Math.sin(e*31)*.42;b.rotation.x=Math.cos(e*23)*.3;b.scale.setScalar(1.45);}else if(b.scale.x>1.4&&!(f&&f.jig>0)){b.scale.setScalar(1);b.rotation.x=0;}}

// ── 화면(DOM) 연출 ──
function layer(){let L=$('stFx');if(!L){L=document.createElement('div');L.id='stFx';document.body.appendChild(L);}return L;}
function proj(v){const c=NKV2.cam,w=innerWidth,h=innerHeight,q=v.clone().project(c);return {x:(q.x+1)/2*w,y:(1-q.y)/2*h,vis:q.z<1};}
let rafOn=false;function loop(){fxTick();const L=$('stFx');if(L&&L._bob){const p=proj(bobPos());L.style.setProperty('--bx',p.x+'px');L.style.setProperty('--by',p.y+'px');}requestAnimationFrame(loop);}
function start(){if(rafOn)return;rafOn=true;requestAnimationFrame(loop);try{I().PH().push(bobHook);}catch(e){}}
const mob=()=>innerWidth<760;
function badge(t){return `<span class="stb">👑 ${t||'슈퍼 초월급'}</span>`;}
NKST.onCast=function(fs,spot){start();const map=this.mapNow(spot);let k=null,test=false;if(this.forced&&staff()){k=this.forced;this.forced=null;test=true;}else if(stOn()&&!(window.NKV2&&NKV2.S&&NKV2.S.autoFish)){const cands=SP.filter(x=>x.map===map&&(!x.soon||skyOpen()));const hits=cands.filter(s=>Math.random()<1/rateOf(s));if(hits.length)k=hits[Math.floor(Math.random()*hits.length)].k;}
 if(k){fs.st=k;fs.stTest=test;if(test)fs.bite=Math.min(fs.bite,this.demo||2.2);else if(this.demo)fs.bite=this.demo;fs.fakes=[Math.min(1.0,fs.bite*.4)];}};
NKST.onBite=function(fs){const sp=SPK(fs.st);fs.stT=performance.now();const L=layer();L.className='on bite th-'+sp.theme;L._bob=1;document.body.classList.add('stBite');
 L.innerHTML=`<div class="stdim"></div><div class="stbob"><i></i><i></i><i></i><b class="stthud">쿵!</b></div>
  <div class="stwarn"><div class="stripe t"></div><div class="stwb">${badge()}<div class="stwt">⚠ 거대한 입질! ⚠</div><div class="stws">${sp.icon} ${sp.mapN}의 전설이 깨어났어요 — 놓치지 마세요!</div></div><div class="stripe b"></div></div>
  <button class="stnow" type="button">🎣 지금 챔질!<small>${('ontouchstart' in window||navigator.maxTouchPoints>0)?'화면을 탭':'클릭 / Space'}</small></button>`;
 L.querySelector('.stnow').onclick=e=>{e.stopPropagation();I().fishAction();};
 try{$('world').animate([{transform:'translate(0,0)'},{transform:'translate(7px,-5px)'},{transform:'translate(-6px,4px)'},{transform:'translate(3px,2px)'},{transform:'translate(0,0)'}],{duration:340,iterations:2,delay:300});}catch(e){}
 SFX.omen();setTimeout(()=>SFX.thud(),300);setTimeout(()=>{biteFx(sp);SFX.theme(sp.theme);},600);setTimeout(()=>SFX.warn(),1000);
 try{if(navigator.vibrate)navigator.vibrate([60,40,200]);}catch(e){}};
NKST.onMiss=function(fs){NKST._bite=null;document.body.classList.remove('stBite');const L=layer();L.className='';L.innerHTML='';I().toast('😢 슈퍼 초월급을 놓쳤어요… 다음엔 꼭!',2200);};
NKST.roll=function(){if(!this._catching)return null;const it=I();if(!it)return null;const fs=it.fishing;if(!fs||!fs.st||fs.state!=='bite')return null;const sp=SPK(fs.st),S=window.NKV2.S;const cm=Math.round((sp.min+(sp.max-sp.min)*(.55+Math.random()*.42))*10)/10;const v=Math.round(sp.base*(1+(cm-sp.min)/(sp.max-sp.min))*10);const o={id:S.nid++,k:sp.k,cm,g:6,v,price:Math.round(v*1.3),sale:false,sx:1,lock:true};if(fs.stTest)o.sxTest=1;return o;};
const fmtCm=cm=>cm>=1000?(cm/100).toFixed(1)+'m':Math.round(cm)+'cm';NKST.fmtCm=fmtCm;
const rtOn=()=>{try{return !!(window.NK_RT&&NK_RT.status&&NK_RT.status()==='on');}catch(e){return false;}};
const myId=()=>{try{return String(window.NK_RT&&NK_RT.id||'');}catch(e){return '';}};
NKST.onCatch=function(f,info){const sp=SPK(f.k),L=layer();NKST._bite=null;document.body.classList.remove('stBite');L._bob=1;SFX.hook();
 L.className='on catch th-'+sp.theme;L.innerHTML=`<div class="stflash"></div><div class="stpaat">파앗—!</div><div class="stlb t"></div><div class="stlb b"><span>▶▶ SLOW 0.25×</span></div>`;
 catchFx(sp);setTimeout(()=>SFX.pillar(),60);setTimeout(()=>SFX.splash(),500);
 // 슬로모션 (게임 시간 0.25배)
 document.body.classList.add('stCine');setTimeout(()=>{window.__nkTS=.25;L.classList.add('slow');},380);setTimeout(()=>{window.__nkTS=1;L.classList.remove('slow');},2780);setTimeout(()=>document.body.classList.remove('stCine'),2900);
 /* v184: 진짜 기록 — 테스트는 내 화면에만, 아니면 서버가 전체 서버 몇 번째인지 세서 모든 서버에 공지해요 */
 /* v193: 테스트 낚시도 (순위·횟수 없이) 모든 서버에 공지를 보내서 다른 사람이 축하 버튼을 눌러 볼 수 있어요 */const test=!!f.sxTest,sent=rtOn()&&!!(window.NK_RT.st&&NK_RT.st(f.k,f.cm,test));const t0=Date.now();NKST._mine={k:f.k,cm:f.cm,t:t0,sent,test};
 setTimeout(()=>{SFX.fanfare();card(f,sp,info,test?'test':sent?'wait':'solo');},2900);
 if(!sent)setTimeout(()=>notice({nick:I().NICK(),k:f.k,cm:f.cm,n:0,a:'',local:1,test}),3700);
 /* v206: 보냈는데 서버 공지가 7초 안에 안 돌아오면 (연결 끊김 등) 내 화면에라도 공지 창을 띄워요 */
 else setTimeout(()=>{const m=NKST._mine;if(m&&m.t===t0&&!m.echo)notice({nick:I().NICK(),k:f.k,cm:f.cm,n:0,a:'',local:1,test,noEcho:1});},7000);};
/* 서버에서 돌아온 내 기록(전체 서버 n번째) — 승리 카드 칩 · 도감 순위에 넣어요 */
function rankChip(kind,n){return kind==='test'?'<span class="rk">🧪 테스트 낚시 · 공지·순위에 안 올라가요</span>':kind==='solo'?'<span class="rk">🌙 혼자 플레이 기록</span>':n>0?`<span class="rk">🏆 전체 서버 ${n.toLocaleString()}번째</span>`:'<span class="rk wait">🏆 전체 서버 순위 확인 중…</span>';}
function card(f,sp,info,kind){const L=layer();L.classList.add('stcon');const el=document.createElement('div');el.className='stcard';const n0=(NKST._mine&&NKST._mine.n)||0;el.innerHTML=`<div class="strays"></div><div class="stcw"><div class="stcin">
 ${badge()}<div class="stcart"><img src="img/fish/${sp.k}@2x.png" alt=""><i class="s1">✦</i><i class="s2">✦</i><i class="s3">✦</i></div>
 <div class="stcnm">${sp.n}</div><div class="stcsub"><span class="sz">📏 <b>${fmtCm(f.cm)}</b></span><span class="cn">🪙 <b>${(f.v||0).toLocaleString()}</b></span></div><div class="stcchip">${rankChip(kind,n0)}${info&&info.isNew?'<span class="nw">NEW!</span>':''}</div>
 <div class="stcno">No.${sp.no} · ${sp.icon} ${sp.mapN} · ${sp.eff}</div><div class="stcwh">${info&&info.where||''} · 🔒 자동 잠금</div>
 <div class="stcbt"><button type="button" data-a="tank">🐠 어항에서 보기</button><button type="button" data-a="brag">닫기</button></div></div></div>`;
 L.appendChild(el);NKST._card=el;el.dataset.kind=kind;el.onclick=e=>{const a=e.target.closest('[data-a]');if(a&&a.dataset.a==='tank'){close();try{I().tankView().open('me');}catch(_){}}else if(a){close();}};
 function close(){L.className='';L.innerHTML='';NKST._card=null;}NKST.closeCard=close;}
const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const avCol=nm=>{let h=0;for(const ch of String(nm))h=(h*31+ch.charCodeAt(0))|0;return ['#ffb347','#ff7aa8','#6cc28a','#7ab8ff','#a98bff','#ffd23a','#5fd0c0'][Math.abs(h)%7];};
/* v221: 공지 띠를 아직 안 띄운 동안에도 축하(stc)를 받아 두어요. 내가 낚으면 컷인·카드 때문에 띠가 3.7초 뒤에 떠서, 그동안 다른 사람이 누른 축하가 사라졌어요. */
const stcBuf=Object.create(null);NKST._stcBuf=stcBuf;
addEventListener('nk-rt-stc',e=>{const d=e.detail||{},a=String(d.a||'');if(!a)return;const key=d.id||d.nick||'';if(!key)return;const arr=stcBuf[a]||(stcBuf[a]=[]);if(arr.some(x=>(x.id||x.nick)===key))return;arr.push({id:d.id,nick:d.nick,t:Date.now()});const now=Date.now();for(const k of Object.keys(stcBuf)){stcBuf[k]=stcBuf[k].filter(x=>now-x.t<45000);if(!stcBuf[k].length)delete stcBuf[k];}});
/* 공지 띠: 모든 서버 사람에게 똑같이 떠요 · 축하 인원은 실제로 누른 사람 수 */
function notice(ev){const sp=SPK(ev.k);if(!sp)return;SFX.notice();if(NKST._annOff){try{NKST._annOff();}catch(_){}}let box=$('stAnn');if(!box){box=document.createElement('div');box.id='stAnn';document.body.appendChild(box);}box.innerHTML='';
 const mine=ev.local||(ev.id&&ev.id===myId()),who=esc(ev.nick||'누군가'),srvNm=(()=>{try{return ev.srv&&window.SRVN?SRVN(ev.srv):'';}catch(e){return '';}})();
 const el=document.createElement('div');el.className='stann th-'+sp.theme;
 el.innerHTML=`<div class="sa-shine"></div><div class="sa-stars"><i></i><i></i><i></i><i></i><i></i><i></i></div>
 <div class="sa-fish"><span class="sa-rays"></span><img src="img/fish/${sp.k}.png" alt=""></div>
 <div class="sa-mid"><div class="sa-top">${badge()}<span class="sa-meta">${ev.noEcho?'📶 서버 연결 확인 중 · 내 화면에만':ev.test?(ev.a?'🧪 테스트 공지 · 순위에 안 들어가요':'🧪 테스트 · 내 화면에만'):ev.local?'🌙 혼자 플레이':'📢 전체 서버 공지'}<span class="sa-t"> · ${ev.n>0&&!ev.test?'전체 '+ev.n.toLocaleString()+'번째':'방금 전'}${srvNm?' · '+esc(srvNm):''}</span></span></div>
  <div class="sa-msg"><b class="sa-who">${who}</b>님이 ${sp.mapN}에서 <b class="sa-fn">${sp.n} ${fmtCm(ev.cm)}</b>를 낚았어요!</div>
  <div class="sa-ch"><span class="sa-av"></span><span class="sa-ct"></span></div></div>
 <div class="sa-act"><button type="button" class="sa-btn" ${ev.a?'':'disabled'}><span class="sa-ico">🎉</span><span class="sa-lb">${mine?'축하 받는 중':'축하하기'}</span><span class="sa-n"><b>0</b>명</span></button><button type="button" class="sa-x" aria-label="닫기">닫기</button></div>`;
 box.appendChild(el);
 const nb=el.querySelector('.sa-n b'),avs=el.querySelector('.sa-av'),ct=el.querySelector('.sa-ct'),seen=new Set(),shown=[];
 const upd=()=>{const n=seen.size;nb.textContent=n;const nm=shown.slice(-2).map(x=>'<b>'+esc(x)+'</b>').join('·');ct.innerHTML=n?`${nm}${n>Math.min(2,shown.length)?` 외 <b class="sa-k">${n-Math.min(2,shown.length)}</b>명`:''}이 축하하고 있어요`:(ev.a?'첫 번째로 축하해 주세요!':ev.noEcho?'서버에 공지가 닿지 않아 다른 사람에게는 안 보여요':ev.test?'테스트라 다른 사람에게는 보이지 않아요':'혼자 플레이 중이라 공지가 나가지 않았어요');};
 const add=(key,nm,me)=>{if(seen.has(key))return;seen.add(key);const i=document.createElement('i');i.style.background=avCol(nm);i.textContent=String(nm||'?').slice(0,1);if(me)i.className='me';avs.prepend(i);while(avs.children.length>5)avs.lastChild.remove();shown.push(nm);upd();};
 upd();
 const btn=el.querySelector('.sa-btn');
 const fx=()=>{SFX.cheer();const p=document.createElement('span');p.className='sa-plus';p.textContent='+1';btn.appendChild(p);setTimeout(()=>p.remove(),900);for(let i=0;i<10;i++){const c=document.createElement('i');c.className='sa-cf';c.style.setProperty('--dx',(Math.random()*120-60)+'px');c.style.setProperty('--dy',(-30-Math.random()*60)+'px');c.style.background=['#ff5f8f','#ffd23a','#5fe0a0','#4dbdff','#a46bff'][i%5];btn.appendChild(c);setTimeout(()=>c.remove(),900);}};
 btn.onclick=e=>{e.stopPropagation();if(!ev.a||mine||btn.classList.contains('done'))return;btn.classList.add('done');el.querySelector('.sa-lb').textContent='축하했어요';try{NK_RT.stc(ev.a);}catch(_){}add(myId()||'me',I().NICK(),1);fx();};
 const onC=e=>{const d=e.detail||{};if(d.a!==ev.a)return;add(d.id||d.nick,d.nick,d.id===myId());if(mine)fx();};
 if(ev.a)addEventListener('nk-rt-stc',onC);
 /* v221: 공지 띠가 뜨기 전에 도착한 축하도 반영 */
 if(ev.a&&stcBuf[ev.a]){for(const x of stcBuf[ev.a])add(x.id||x.nick,x.nick,x.id===myId());if(mine&&seen.size)fx();}
 /* 슈퍼 초월 컷인 창은 닫기 버튼을 누를 때까지 유지 (자동 닫힘 없음) */NKST._ann=el;
 /* v206: 공지가 떠 있는 동안 '새 업데이트' 알림 같은 위쪽 띠를 공지 아래로 내려요 (겹쳐서 글이 가려지던 문제) */const pos=()=>{try{if(!el.isConnected)return;const b=box.getBoundingClientRect().top+el.offsetTop+el.offsetHeight;/* 들어오는 움직임(transform) 중에도 자리 기준으로 재요 */document.body.style.setProperty('--stAnnB',Math.round(b+8)+'px');document.body.classList.add('stAnnOn');}catch(_){}};pos();requestAnimationFrame(pos);setTimeout(pos,700);
 const off=()=>{removeEventListener('nk-rt-stc',onC);if(NKST._annOff===off)NKST._annOff=null;};NKST._annOff=off;
 const dismiss=()=>{if(!el.isConnected||el.classList.contains('out'))return;el.classList.add('out');off();setTimeout(()=>{el.remove();if(!box.querySelector('.stann'))document.body.classList.remove('stAnnOn');},700);};
 const xb=el.querySelector('.sa-x');if(xb)xb.onclick=e=>{e.stopPropagation();dismiss();};
 if(!ev.test)try{I().say('시스템',`📢 [슈퍼 초월급] ${ev.nick}님이 ${sp.mapN}에서 ${sp.n} ${fmtCm(ev.cm)}를 낚았어요!${ev.n>0?` (전체 서버 ${ev.n}번째)`:''}`);}catch(_){}}
NKST.notice=notice;
/* 서버 공지 받기 (나 포함 모든 서버) */
addEventListener('nk-rt-st',e=>{const d=e.detail||{};if(!SPK(d.k))return;const mine=d.id&&d.id===myId();
 if(mine){const S=window.NKV2&&NKV2.S;if(S&&d.n>0&&!d.test){S.stN=S.stN||{};if(!S.stN[d.k])S.stN[d.k]=d.n;try{I().save();}catch(_){}}if(NKST._mine&&NKST._mine.k===d.k){NKST._mine.echo=1;if(!d.test)NKST._mine.n=d.n;}const c=NKST._card;if(c&&!d.test){const ch=c.querySelector('.stcchip .rk');if(ch){ch.outerHTML=rankChip('srv',d.n);}}
  const wait=NKST._mine&&Date.now()-NKST._mine.t<3700?3700-(Date.now()-NKST._mine.t):0;setTimeout(()=>notice(d),wait);return;}
 notice(d);});
// ── 도감: 슈퍼 초월 칸 + 상세 ──
NKST.dexSection=function(){const S=NKV2.S,got=SP.filter(s=>S.dex[s.k]).length;
 return `<div class="stdex"><div class="stdh">${badge()}<b>슈퍼 초월급 물고기</b><span>${got}/${SP.length} 발견</span><small>운하에는 두 종 · 다른 맵은 한 종 · 약 ${baseN().toLocaleString()}번 던질 때 한 번 · 자동 낚시 제외</small></div><div class="stdg">${SP.map(s=>{const d=S.dex[s.k];return `<div class="stdc ${d?'got':'unk'} th-${s.theme}" data-stk="${s.k}"><div class="no">No.${s.no}</div><div class="mp">${s.icon} ${s.mapN}</div><img src="img/fish/${s.k}${d?'':'_sil'}.png" alt=""><div class="nm">${d?s.n:'???'}</div><div class="small">${d?`최대 <b>${fmtCm(d.max)}</b> · ${d.n}마리`:s.soon&&!skyOpen()?'🔒 하늘섬이 열리면 만나요':'아직 만나지 못한 물고기'}</div>${d?'<i class="sp1">✦</i><i class="sp2">✦</i>':''}</div>`;}).join('')}</div></div>`;};
new MutationObserver(()=>{const dx=$('dex');if(!dx)return;dx.querySelectorAll('[data-stk]:not([data-b])').forEach(e=>{e.dataset.b=1;e.onclick=ev=>{ev.stopPropagation();NKST.detail(e.dataset.stk);};});}).observe(document.body,{childList:true,subtree:true});
NKST.detail=function(k){const s=SPK(k),S=NKV2.S,d=S.dex[k];let m=$('stDexD');if(!m){m=document.createElement('div');m.id='stDexD';document.body.appendChild(m);}
 const first=d&&d.t0?new Date(d.t0):new Date();const sz=d?d.max:0,pct=d?Math.round((sz-s.min)/(s.max-s.min)*100):0;
 m.className='show th-'+s.theme;m.innerHTML=`<div class="stdd"><button class="close" type="button">×</button><div class="stdhero"><div class="strays"></div><img src="img/fish/${k}${d?'@2x':'_sil'}.png" alt="">${d?'<i class="s1">✦</i><i class="s2">✦</i><i class="s3">✦</i>':''}<span class="no">No.${s.no}</span></div>
 <div class="stdbd">${badge()}<h3>${d?s.n:'???'} <small>${s.icon} ${s.mapN}</small></h3>
 <div class="stst"><div><b>${d?fmtCm(d.max):'—'}</b><small>최대 크기</small></div><div><b>${d?d.n:0}마리</b><small>낚은 수</small></div><div><b>${d?(first.getMonth()+1)+'/'+first.getDate():'—'}</b><small>처음 낚은 날</small></div><div><b>${S.stN&&S.stN[k]?S.stN[k].toLocaleString()+'번째':'—'}</b><small>전체 서버 기록</small></div></div>
 <div class="strow">📏 <b>크기</b> ${fmtCm(s.min)} ~ ${fmtCm(s.max)}<div class="stbar"><i style="left:${pct}%"></i></div><small>${d?`내 기록 ${fmtCm(sz)} · 상위 ${Math.max(1,100-pct)}%`:'아직 기록이 없어요'}</small></div>
 <div class="strow">📍 <b>나오는 곳</b> ${s.mapN} · ${s.when}${s.soon&&!skyOpen()?'':` · 약 1/${rateOf(s).toLocaleString()}`}</div>
 <div class="strow">🐠 <b>어항 효과</b> ${s.eff}</div>
 <p class="stfl">${d?s.flav:'어딘가에서 빛나는 그림자를 봤다는 소문이 있어요…'}</p>
 </div></div>`;
 m.onclick=e=>{if(e.target===m||e.target.closest('.close'))m.className='';};};

// ── 어항: 슈퍼 초월 물고기는 그림 + 오라 + 반짝이 ──
function tankPatch(){const tv=I()&&I().tankView&&I().tankView();if(!tv||tv._st)return;tv._st=1;const ob=tv.build.bind(tv);
 tv.build=function(){ob();try{decorate(this);}catch(e){console.warn('[st tank]',e);}};
 requestAnimationFrame(function tk(){try{if(tv.on&&tv.fish)tv.fish.forEach(x=>{const u=x.o&&x.o.userData.st;if(!u)return;const bx=x.stBox;if(bx){const cl=(v,a,b)=>Math.max(a,Math.min(b,v));for(const P of [x.o.position,x.t])if(P){P.x=cl(P.x,-bx.hx,bx.hx);P.z=cl(P.z,-bx.hz,bx.hz);P.y=cl(P.y,Math.min(bx.y0,bx.y1),Math.max(bx.y0,bx.y1));}}const t=performance.now()/1000;const cam=tv.cam;x.o.updateMatrixWorld();const pq=new THREE.Quaternion();x.o.getWorldQuaternion(pq);u.bb.quaternion.copy(pq.invert().multiply(cam.quaternion));const dir=new THREE.Vector3(Math.sin(x.yaw||0),0,Math.cos(x.yaw||0)).applyQuaternion(cam.quaternion.clone().invert());u.fish.scale.x=(x.v&&x.v.x<0?-1:1)*Math.abs(u.fish.scale.x)*(1);u.halo.material.opacity=.75+.2*Math.sin(t*2.2);u.halo.scale.setScalar(1+.06*Math.sin(t*1.7));const P=u.spk.geometry.attributes.position.array;u.spk.userData.S.forEach((s,i)=>{const a=s.a+t*s.v;P[i*3]=Math.cos(a)*s.r;P[i*3+1]=Math.sin(t*s.v*1.3+s.a)*s.r*.5;P[i*3+2]=Math.sin(a)*s.r*.4;});u.spk.geometry.attributes.position.needsUpdate=true;u.spk.material.opacity=.6+.4*Math.sin(t*3);});}catch(e){}requestAnimationFrame(tk);});}
/* v184: 어항 유리 밖으로 나가지 않게 — 어항 안쪽 크기에 맞춰 줄이고, 여러 마리면 높이를 나눠 헤엄쳐요 */
function decorate(tv){const B=tv.box||{W:2.1,H:2.4,D:2.1},SX=(tv.fish||[]).filter(x=>SPK(x.f&&x.f.k));(tv.fish||[]).forEach(x=>{const sp=SPK(x.f&&x.f.k);if(!sp||!x.o)return;const o=x.o;o.traverse(m=>{if(m.isMesh)m.visible=false;});
 const big=sp.k==='st_whale'?3.3:sp.k==='st_bukang'?3.0:sp.k==='st_ray'?2.7:sp.k==='st_stur'?2.8:2.3;const asp=fishAsp(sp.k),lanes=Math.max(1,SX.length),wW=Math.min(big,B.W*.6,(B.H*.78/Math.min(lanes,4))*asp,B.H*.42*asp),wH=wW/asp,W=wW/(o.scale.x||1),H=W/asp*(o.scale.x/o.scale.y);
 const li=SX.indexOf(x),nl=Math.min(lanes,4),ly=nl>1?(B.H*.1+wH/2+(B.H*.8-wH)*(li%nl)/(nl-1)):B.H*.5;x.stBox={hx:Math.max(.05,B.W/2-wW/2-.06),hz:Math.max(.05,(B.D||B.W)/2-wW*.25),y0:Math.max(wH/2+.06,ly-.12),y1:Math.min(B.H-wH/2-.06,ly+.12)};
 const bb=new THREE.Group();const fish=new THREE.Mesh(new THREE.PlaneGeometry(W,H),new THREE.MeshBasicMaterial({map:fishTex(sp.k),transparent:true,alphaTest:.03,side:THREE.DoubleSide,depthWrite:false}));fish.renderOrder=3;
 const halo=new THREE.Mesh(new THREE.PlaneGeometry(W*1.7,W*1.7*(o.scale.x/o.scale.y)),addMat(glowTex(),sp.glow,.85));halo.renderOrder=2;
 const spk=points(34,starTex(),sp.a,.24/(o.scale.x||1),()=>({a:rnd()*6.28,r:W*(.35+rnd()*.35),v:.4+rnd()*.8}));spk.material.sizeAttenuation=true;
 bb.add(halo,fish,spk);o.add(bb);o.userData.st={bb,fish,halo,spk};});}
const tp=setInterval(()=>{if(I()&&I().tankView){tankPatch();clearInterval(tp);}},500);
// ── 관리자 › 테스트 기능: 👑 슈퍼 초월급 상자 (확률 · 켜기 · 테스트 낚시) ──
(window.__nkLabX=window.__nkLabX||[]).push({
 html(){const N=baseN(),on=stOn();const tx=(()=>{try{const D=I().D();return Math.round(1/((D.TX&&D.TX.p)||0.000066));}catch(e){return 15000;}})();
  return `<div class="stadm"><div class="sah"><b>👑 슈퍼 초월급 물고기</b><span class="sast ${on?'on':''}">${on?'켜짐':'꺼짐'}</span><small>일반 초월은 약 1/${tx.toLocaleString()} (낚을 때) · 지금 슈퍼 초월급은 약 1/${N.toLocaleString()} (던질 때)</small></div>
  <div class="sarow"><label>확률 <span>1 /</span><input type="number" min="10000" step="10000" data-stn value="${N}"></label><span class="sapre">${[[100000,'10만'],[300000,'30만 (기본)'],[1000000,'100만']].map(([v,t])=>`<button type="button" data-stp="${v}">${t}</button>`).join('')}</span><button type="button" class="ok" data-stgo>✅ 모든 유저에게 적용</button></div>
  <div class="satb">${SP.map(s=>`<div class="sacell"><img src="img/fish/${s.k}.png" alt=""><b>${s.icon} ${s.n}</b><small>${s.mapN} · ${s.soon&&!skyOpen()?'하늘섬이 생기면':'약 1/'+rateOf(s).toLocaleString()}</small><button type="button" data-stt="${s.k}" ${s.soon&&!skyOpen()?'disabled':''}>🎣 다음 입질로 테스트</button></div>`).join('')}</div>
  <p class="sanote">🎣 테스트: 누르면 창이 닫히고, 그 맵의 낚시 자리에서 던지면 2초 뒤 슈퍼 초월급 입질이 와요 (관리자·운영자만 · 전체 서버 공지·순위에는 안 올라가요). 켜기/끄기는 위 목록의 「👑 슈퍼 초월급 물고기」에서 바꿔요.</p></div>`;},
 bind(root,re){const b=root.querySelector('.stadm');if(!b)return;const inp=b.querySelector('[data-stn]');
  b.querySelectorAll('[data-stp]').forEach(x=>x.onclick=()=>{inp.value=x.dataset.stp;});
  b.querySelector('[data-stgo]').onclick=()=>{const n=Math.max(10000,Math.min(1e8,Math.round(+inp.value||RATE0)));const ok=pubPlay({stRate:n});I().toast(ok?`👑 슈퍼 초월급 확률을 1/${n.toLocaleString()}로 모든 유저에게 적용했어요`:'서버에 연결된 상태에서만 모든 유저에게 적용할 수 있어요',2000);setTimeout(()=>re&&re(),700);};
  b.querySelectorAll('[data-stt]').forEach(x=>x.onclick=()=>{const k=NKST.force(x.dataset.stt);if(!k)return;const sp=SPK(k);try{I().closeM('admin');}catch(e){}I().toast(`🧪 다음 입질이 ${sp.n}예요 — ${sp.mapN} 낚시 자리에서 던져 보세요`,2600);});}});
// v185: 운영자(테스트 기능 권한이 없어도) — 관리자 › 🎉 이벤트 탭 위에 테스트 낚시 버튼만 따로 보여요
(window.__nkEvX=window.__nkEvX||[]).push({
 html(){const R=window.NK_RT;if(!(R&&R.op&&!(R.isAdmin&&R.isAdmin())))return '';
  return `<div class="stadm stop"><div class="sah"><b>👑 슈퍼 초월급 테스트 낚시</b><small>운영자용 · 전체 서버 공지·순위에는 안 올라가요</small></div><div class="satb">${SP.map(s=>`<div class="sacell"><img src="img/fish/${s.k}.png" alt=""><b>${s.icon} ${s.n}</b><small>${s.mapN}</small><button type="button" data-stt="${s.k}" ${s.soon&&!skyOpen()?'disabled':''}>🎣 다음 입질로 테스트</button></div>`).join('')}</div></div>`;},
 bind(root){const b=root.querySelector('.stadm.stop');if(!b)return;b.querySelectorAll('[data-stt]').forEach(x=>x.onclick=()=>{const k=NKST.force(x.dataset.stt);if(!k)return;const sp=SPK(k);try{I().closeM('admin');}catch(e){}I().toast(`🧪 다음 입질이 ${sp.n}예요 — ${sp.mapN} 낚시 자리에서 던져 보세요`,2600);});}});
function pubPlay(o){try{if(window.NKV2&&NKV2.pubPlay)return NKV2.pubPlay(o);}catch(e){}return false;}
})();
