// 피쉬코지 v47: 오리는 원 궤도 대신 물결에 실려 천천히 떠다님(world-sync.js ducks). v30: 러버덕 순환 스폰(첫 base · 셔플 순차 · 최대 시 페이드) · 8종(펭귄·눈사람 포함)(기본+해적·딸기·우주비행사·개구리·유니콘, duck-var-v28.js) — 하늘에서 떨어져 첨벙! 후 호수를 둥둥 유영. 설정: 생성 간격·최대 수(최대 30)
// 3D 모델: JDSherbert "3D Rubber Duck Asset Pack" (상업 이용 가능 · 작가 표기 필수)
(function(){const U=()=>window.NK_UI25,G=()=>window.NKV2;let T,scene,IM=[],VG={},ducks=[],fx=[],last=0,nextT=0,rMax=8,ok=false;const MAX=32;
 // v49: 실시간 접속 중에는 서버 play 값(없으면 NK_SYNC.DUCK_DEF)만 쓴다 → 모든 유저가 같은 오리
 const UG=k=>{const RT=window.NK_RT,DD=window.NK_SYNC&&NK_SYNC.DUCK_DEF;if(RT&&RT.status&&RT.status()==='on'&&k!=='duckSnd'){const P=RT.play||{};if(k in P)return P[k];return DD?DD[k]:undefined;}const v=U().get(k);return v!=null?v:(DD?DD[k]:undefined);};
 const conf=()=>({ord:UG('duckOrd')==='seq'?'seq':'rand',on:!window.NK_NODUCK&&UG('duckOn')!==0,every:+(UG('duckEvery')||45),max:Math.min(MAX,Math.max(0,+(UG('duckMax')??8))),size:(()=>{const v=UG('duckSize');return v==null||String(v)==='rand'?'rand':(+v||1);})(),speed:+(UG('duckSpeed')??1),snd:U().get('duckSnd')!==0,kinds:(()=>{const allow=new Set((window.NK_DUCKV&&NK_DUCKV.LIST||[]).map(x=>x[0]));const raw=String(UG('duckKinds')??'base,pirate,straw,astro,frog,uni,penguin,snowman,dino').split(',').filter(k=>allow.has(k));return raw.length?raw:['base','pirate','straw','astro','frog','uni','penguin','snowman','dino'];})()});
 function geo(){const M=window.NK_DUCK_MESH,b=atob(M.pos),p=new Float32Array(M.n*3),dv=new DataView(new ArrayBuffer(b.length));for(let i=0;i<b.length;i++)dv.setUint8(i,b.charCodeAt(i));for(let i=0;i<M.n*3;i++)p[i]=dv.getInt16(i*2,true)/32767;
  const out={};for(const k in M.g){const s=atob(M.g[k]),d=new DataView(new ArrayBuffer(s.length));for(let i=0;i<s.length;i++)d.setUint8(i,s.charCodeAt(i));const idx=new Uint16Array(s.length/2);for(let i=0;i<idx.length;i++)idx[i]=d.getUint16(i*2,true);
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setIndex(new T.BufferAttribute(idx,1));g.computeVertexNormals();out[k]=g;}return out;}
 function init(){const g=G();if(!g||!g.scene||!g.THREE||!window.NK_DUCK_MESH)return false;T=g.THREE;scene=g.scene;const GE=geo(),VV=window.NK_DUCKV.build(T,GE);
  for(const v in VV){const P=VV[v],L=[];['body','beak','eyes'].forEach(k=>L.push(new T.InstancedMesh(GE[k],new T.MeshLambertMaterial({color:P[k]}),MAX)));P.acc.forEach(([g,m])=>L.push(new T.InstancedMesh(g,m,MAX)));L.forEach(m=>{m.count=0;m.visible=false;m.frustumCulled=false;scene.add(m);IM.push(m);});VG[v]=L;}
  const tips=(g.decks||[]).map(d=>d.tip?Math.hypot(d.tip.x,d.tip.z):99);rMax=Math.max(4,Math.min(...tips,30)-1.1);return true;}
 const rnd=(a,b)=>a+Math.random()*(b-a),WY=-.1,DUCK_BASE=1.3; // v48: 랜덤이 아니면 모든 오리를 같은 크기로 (DUCK_BASE×선택 배율)
 // v30: 순환 스폰 — 첫 마리 무조건 base, 이후 켜진 종류 중복없이 셔플 순차, 라운드 끝나면 재셔플. 최대 도달 시 가장 오래된 것부터 페이드아웃 후 새 종류.
 let cycleQ=[],cycleI=0,everSpawned=0,duckWas=null,duckArm=0;
 function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function refillCycle(){const K=conf().kinds.filter(k=>VG[k]);const rest=K.filter(k=>k!=='base');shuffle(rest);cycleQ=rest.length?rest.slice():(K.length?K.slice():['base']);cycleI=0;}
 let seqI=0;function nextKind(){const K=conf().kinds.filter(k=>VG[k]);if(!K.length)return 'base';if(conf().ord==='seq'){const k=K[seqI%K.length];seqI++;return k;}
  if(everSpawned===0&&VG.base&&K.includes('base')){everSpawned=1;refillCycle();return 'base';}
  everSpawned++;if(!cycleQ.length||cycleI>=cycleQ.length)refillCycle();
  // 호수에 같은 종류가 너무 많으면 다음으로
  for(let n=0;n<cycleQ.length;n++){const k=cycleQ[(cycleI+n)%cycleQ.length];const cnt=ducks.filter(d=>d.v===k&&d.st!=='fade').length;if(cnt<Math.max(2,Math.ceil((conf().max||8)/Math.max(1,K.length)))){cycleI=(cycleI+n+1)%Math.max(1,cycleQ.length);if(cycleI===0&&n+1>=cycleQ.length)refillCycle();return k;}}
  const k=cycleQ[cycleI%cycleQ.length];cycleI++;return k;}
 function spawn(forceV){let r=Math.sqrt(Math.random())*rMax*.85,a=Math.random()*Math.PI*2;try{const m=G().me,o=(typeof m==='function'?m():m),p=o&&(o.o?o.o.position:o.position);if(p&&Math.random()<.65){a=Math.atan2(p.z,p.x)+rnd(-.35,.35);r=rMax*rnd(.55,.92);}}catch(e){}
  const v=forceV||nextKind();const sz=String(conf().size)==='rand'?rnd(.65,1.85):1;ducks.push({x:Math.cos(a)*r,z:Math.sin(a)*r,y:rnd(13,18),vy:0,st:'fall',yaw:Math.random()*6.28,tY:Math.random()*6.28,sp:rnd(.25,.45),s:sz,ph:Math.random()*6.28,spin:rnd(-3,3),v,born:performance.now(),fade:1});}
 function splash(x,z){const ring=new T.Mesh(new T.RingGeometry(.2,.32,28).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.8,depthWrite:false}));ring.position.set(x,WY+.03,z);scene.add(ring);
  const n=14,pg=new T.BufferGeometry(),pa=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){pa[i*3]=x;pa[i*3+1]=WY;pa[i*3+2]=z;const a=Math.random()*6.28,s=rnd(.8,1.8);vel.push([Math.cos(a)*s,rnd(2.2,3.6),Math.sin(a)*s]);}pg.setAttribute('position',new T.BufferAttribute(pa,3));
  const pts=new T.Points(pg,new T.PointsMaterial({color:'#e8f6ff',size:.12,transparent:true,opacity:.9,depthWrite:false}));scene.add(pts);fx.push({ring,pts,vel,t:0});
  if(U().get('duckSnd')!==0)try{const ac=window.__duckAC||(window.__duckAC=new (window.AudioContext||window.webkitAudioContext)()),o=ac.createOscillator(),gn=ac.createGain(),vol=(G().S&&G().S.vol!=null?G().S.vol:.2);o.type='sine';o.frequency.setValueAtTime(520,ac.currentTime);o.frequency.exponentialRampToValueAtTime(140,ac.currentTime+.18);gn.gain.setValueAtTime(.25*vol,ac.currentTime);gn.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.25);o.connect(gn).connect(ac.destination);o.start();o.stop(ac.currentTime+.26);}catch(e){}}
 // v77: 🦆 오리 놀이 — ③ 부딪히면 합체(최대 3단계, 왕관) · ⑤ 엄마 오리 따라 줄서기 (항상)
 //      🧪 ① 미끄럼틀 섬 · ② 물길 · ④ 분수 점프 (관리자 › 테스트 기능 › 오리 놀이 시설)
 // 실시간 호수에서는 모두 같은 시각(서버 시각)과 같은 오리 배치로 계산해서, 접속한 사람끼리 거의 같은 장면을 봐요
 // 같은 단계끼리 부딪혀야 다음 단계 · 오리 32마리면 32→16→8→4→2→1 이라 5단계(크기 ×1.2씩, 5단계 ≈ ×2.5)가 끝. 3단계부터 왕관, 5단계는 큰 금왕관
 const FUN_MAXL=5,FUN_COL=['#ffffff','#fff3a0','#bfe8ff','#ffd34a','#ff9ad0','#c8a8ff'];
 const FUN={lv:{},abs:{},lastM:0,crown:null,fac:null,facK:'',rides:{},disp:{},pop:{},tags:[],gone:{}};const MERGE_MS=1400;
 const nowS=()=>{const RT=window.NK_RT;const sk=RT&&Number.isFinite(+RT.clockSkew)?+RT.clockSkew:0;return Date.now()-sk;};
 const funOpt=()=>{try{return String(G().uiOpt?G().uiOpt('duckFun','off'):'off');}catch(e){return 'off';}};
 function burst(x,y,z,col,n){const g=new T.BufferGeometry(),pa=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){pa[i*3]=x;pa[i*3+1]=y;pa[i*3+2]=z;const a=Math.random()*6.28,s=rnd(.6,1.6);vel.push([Math.cos(a)*s,rnd(1.5,3),Math.sin(a)*s]);}g.setAttribute('position',new T.BufferAttribute(pa,3));
  const pts=new T.Points(g,new T.PointsMaterial({color:col,size:.2,transparent:true,opacity:1,depthWrite:false}));scene.add(pts);const ring=new T.Mesh(new T.RingGeometry(.2,.32,28).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:col,transparent:true,opacity:.7,depthWrite:false}));ring.position.set(x,WY+.04,z);scene.add(ring);fx.push({ring,pts,vel,t:0});}
 function crownMesh(){if(FUN.crown)return FUN.crown;const g=new T.CylinderGeometry(.24,.22,.16,10,1,true);const m=new T.InstancedMesh(g,new T.MeshLambertMaterial({color:'#ffd34a',side:T.DoubleSide}),MAX);m.count=0;m.frustumCulled=false;scene.add(m);
  const pg=new T.ConeGeometry(.06,.16,5);const pk=new T.InstancedMesh(pg,new T.MeshLambertMaterial({color:'#ffd34a'}),MAX*5);pk.count=0;pk.frustumCulled=false;scene.add(pk);FUN.crown={m,pk};return FUN.crown;}
 // 시설(테스트): 미끄럼틀 섬 · 물길 · 분수
 function buildFac(k){if(FUN.facK===k)return;if(FUN.fac){scene.remove(FUN.fac);FUN.fac=null;}FUN.rides={};FUN.facK=k;if(k==='off')return;const g=new T.Group();FUN.fac=g;scene.add(g);
  const M=(c,o)=>new T.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o||{})),add=(geo,m,x,y,z,ry)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);if(ry)o.rotation.y=ry;g.add(o);return o;};
  const R0=rMax;
  if(k==='slide'||k==='all'){const a=-2.4,ix=Math.cos(a)*R0*.5,iz=Math.sin(a)*R0*.5;add(new T.CylinderGeometry(2.6,3,.6,22),M('#e8d29a'),ix,-.05,iz);add(new T.CylinderGeometry(2.1,2.5,.3,22),M('#9fd27a'),ix,.35,iz);
   [[-.6,-.6],[.6,-.6],[-.6,.6],[.6,.6]].forEach(([p,q])=>add(new T.CylinderGeometry(.1,.1,3.2,8),M('#f6c95a'),ix+p,1.9,iz+q));add(new T.BoxGeometry(1.6,.18,1.6),M('#ff9a6a'),ix,3.5,iz);add(new T.ConeGeometry(1.2,1,6),M('#ff7a7a'),ix,4.25,iz);
   for(let i=0;i<6;i++)add(new T.BoxGeometry(.8,.07,.22),M('#fff3d6'),ix-1,.6+i*.48,iz);
   const pts=[[ix+.5,3.55,iz+.5],[ix+1.9,3.1,iz+1.4],[ix+3,2.4,iz+.3],[ix+2.7,1.6,iz-1.4],[ix+4.1,.9,iz-2.3],[ix+5.8,0,iz-1.8]].map(p=>new T.Vector3(...p));const cv=new T.CatmullRomCurve3(pts);
   g.add(new T.Mesh(new T.TubeGeometry(cv,70,.48,12,false),new T.MeshLambertMaterial({color:'#ff86b4',side:T.DoubleSide,flatShading:true})));
   const up=new T.CatmullRomCurve3([new T.Vector3(ix-1.6,WY,iz),new T.Vector3(ix-1,.9,iz),new T.Vector3(ix-1,2.6,iz),new T.Vector3(ix,3.62,iz)]);
   FUN.rides.slide={every:50000,approach:3500,legs:[[up,3500],[new T.CatmullRomCurve3(pts.map(p=>p.clone().add(new T.Vector3(0,.12,0)))),2600]],entry:[ix-1.6,iz]};}
  if(k==='flume'||k==='all'){const R=R0*.78,a0=-.6,a1=.55,Y=1.05,P=[];for(let i=0;i<=30;i++){const a=a0+(a1-a0)*i/30;P.push(new T.Vector3(Math.cos(a)*R,Y+Math.sin(i/30*Math.PI)*.5,Math.sin(a)*R));}const cv=new T.CatmullRomCurve3(P),L=cv.getLength(),N=Math.ceil(L/.55),wood=M('#c98e5c'),side=M('#a8724a'),wat=new T.MeshLambertMaterial({color:'#8fd3ea',transparent:true,opacity:.85});
   for(let i=0;i<N;i++){const t=(i+.5)/N,p=cv.getPoint(t),tt=cv.getTangent(t),ry=Math.atan2(tt.x,tt.z),len=L/N+.03;add(new T.BoxGeometry(1.3,.1,len),wood,p.x,p.y-.28,p.z,ry);[-1,1].forEach(sd=>add(new T.BoxGeometry(.1,.42,len),side,p.x+Math.cos(ry)*.62*sd,p.y-.1,p.z-Math.sin(ry)*.62*sd,ry));add(new T.BoxGeometry(1.14,.05,len),wat,p.x,p.y-.17,p.z,ry);if(i%5===0)add(new T.CylinderGeometry(.08,.08,p.y+.2,6),side,p.x,p.y/2-.4,p.z);}
   const s=cv.getPoint(0),e=cv.getPoint(1);const wh=new T.Group();wh.position.set(s.x,1.1,s.z);wh.rotation.y=Math.atan2(s.x,s.z);g.add(wh);wh.add(new T.Mesh(new T.TorusGeometry(1.25,.1,8,22),side));for(let i=0;i<8;i++){const b=new T.Mesh(new T.BoxGeometry(.16,2.5,.1),wood);b.rotation.z=i*Math.PI/8;wh.add(b);}FUN.wheel=wh;
   const fall=new T.Mesh(new T.PlaneGeometry(1.1,1.2),new T.MeshBasicMaterial({color:'#e9fbff',transparent:true,opacity:.7,side:T.DoubleSide}));fall.position.set(e.x*1.03,.4,e.z*1.03);fall.rotation.y=Math.atan2(e.x,e.z);g.add(fall);
   const up=new T.CatmullRomCurve3([new T.Vector3(s.x*.9,WY,s.z*.9),new T.Vector3(s.x*.97,.6,s.z*.97),new T.Vector3(s.x,Y-.05,s.z)]);
   FUN.rides.flume={every:35000,approach:3000,legs:[[up,2200],[new T.CatmullRomCurve3(P.map(p=>p.clone().add(new T.Vector3(0,-.08,0)))),9000],[new T.CatmullRomCurve3([e.clone().setY(Y-.1),new T.Vector3(e.x*1.08,.3,e.z*1.08),new T.Vector3(e.x*1.1,WY,e.z*1.1)]),800]],entry:[s.x*.9,s.z*.9]};}
  if(k==='fountain'||k==='all'){const x=0,z=0;add(new T.CylinderGeometry(1.4,1.6,.4,20),M('#e8e2d4'),x,-.02,z);add(new T.CylinderGeometry(1.05,1.05,.22,20),new T.MeshLambertMaterial({color:'#8fd3ea',transparent:true,opacity:.85}),x,.12,z);
   const col=new T.Mesh(new T.CylinderGeometry(.22,.4,1,14,1,true),new T.MeshLambertMaterial({color:'#bfeefd',transparent:true,opacity:.6,side:T.DoubleSide}));col.position.set(x,.5,z);g.add(col);FUN.col=col;
   const hop=new T.CatmullRomCurve3([new T.Vector3(x,.2,z),new T.Vector3(x,3.2,z),new T.Vector3(x+.8,3.6,z+.4),new T.Vector3(x+2.4,.6,z+1.2),new T.Vector3(x+2.8,WY,z+1.4)]);
   FUN.rides.fountain={every:28000,approach:4000,legs:[[hop,2400]],entry:[x,z],jet:1};}}
 function rideAt(r,now,ducksA){const k=Math.floor(now/r.every),st=k*r.every,tot=r.approach+r.legs.reduce((a,l)=>a+l[1],0);const e=now-st;if(e>tot+600)return null;
  if(!r.pick||r.pick.k!==k){let best=null,bd=1e9;for(const d of ducksA){if(d.st!=='swim'||d._r.hide||d._r.busy)continue;const dd=Math.hypot(d.x-r.entry[0],d.z-r.entry[1]);if(dd<bd){bd=dd;best=d;}}r.pick=best?{k,id:best.key}:{k,id:null};}
  return {e,tot};}
 function funApply(dt,t){const now=nowS();ducks.forEach(d=>d._r=null);const A=ducks.filter(d=>d.st!=='fade');A.forEach(d=>{if(d.key==null)d.key='l'+(FUN.uid=(FUN.uid||0)+1);d._r={x:d.x,y:d.y,z:d.z,yaw:d.yaw,sc:1,hide:false,busy:false};});
  const K=new Map(A.map(d=>[d.key,d]));
  // ③ 합체: 가까워지면 큰 쪽(키가 앞선 쪽)으로 흡수, 2분 뒤 다시 톡 나와요
  for(const k in FUN.abs){const a=FUN.abs[k];if(now>a.until||!K.has(k)||!K.has(a.into)){if(K.has(k)&&K.has(a.into)){const d=K.get(a.into);burst(d.x,WY+.3,d.z,'#ffffff',10);const p=FUN.disp[a.into];FUN.disp[k]={x:p?p.x:d.x,z:p?p.z:d.z,sc:.3};}if(FUN.lv[a.into]!=null)FUN.lv[a.into]=Math.min(FUN.lv[a.into],a.prevW!=null?a.prevW:Math.max(0,FUN.lv[a.into]-1));delete FUN.abs[k];}}
  // v80: 낚인 오리는 5분 동안 숨어요 (내 화면에서만)
  for(const d of A){const g=FUN.gone[d.key];if(g&&now<g)d._r.hide=true;else if(g)delete FUN.gone[d.key];}
  // v79: 합체는 순간이동 대신 1.4초 동안 헤엄쳐 들어가며 작아지고, 끝나면 반짝 + '합체! Lv.N' 글자
  for(const d of A){const ab=FUN.abs[d.key];if(!ab)continue;const e=now-(ab.t0||0),w=K.get(ab.into);
   if(ab.t0&&e<MERGE_MS&&w){const f=e/MERGE_MS,k=f*f*(3-2*f);d._r.x+=(w.x-d.x)*k;d._r.z+=(w.z-d.z)*k;d._r.yaw=Math.atan2(w.x-d.x,w.z-d.z);d._r.sc=1-.75*k;d._r.busy=true;continue;}
   d._r.hide=true;if(!ab.fx&&w){ab.fx=1;burst(w.x,WY+.5,w.z,FUN_COL[ab.lv||1],18+(ab.lv||1)*4);tag(w.key,'합체! Lv.'+((ab.lv||1)+1),FUN_COL[ab.lv||1]);FUN.pop[w.key]=now;}}
  // v83: 🧪 합체·엄마 따라다니기 켜고 끄기 (관리자 › 🦆 오리)
  const optOn=k=>{try{return String(G().uiOpt?G().uiOpt(k,'on'):'on')!=='off';}catch(e){return true;}};
  if(optOn('duckMerge')&&now-FUN.lastM>6000)for(let i=0;i<A.length;i++){const a=A[i];if(a._r.hide||a.st!=='swim')continue;for(let j=i+1;j<A.length;j++){const b=A[j];if(b._r.hide||b.st!=='swim')continue;const la=FUN.lv[a.key]||0,lb=FUN.lv[b.key]||0;if(la!==lb||la>=FUN_MAXL)continue;if(Math.hypot(a.x-b.x,a.z-b.z)<1.5*Math.pow(1.2,la)){const [w,l]=String(a.key)<String(b.key)?[a,b]:[b,a];FUN.abs[l.key]={into:w.key,until:now+300000,prevW:la,t0:now,lv:la+1};FUN.lv[w.key]=la+1;FUN.lastM=now;i=A.length;break;}}}
  const PEND={};for(const k in FUN.abs){const ab=FUN.abs[k];if(!ab.fx&&ab.t0)PEND[ab.into]=ab.lv-1;}for(const d of A){const L=FUN.lv[d.key]||0;const shown=PEND[d.key]!=null?PEND[d.key]:L;let sc=shown?Math.pow(1.2,shown):1;const pe=now-(FUN.pop[d.key]||0);if(pe<700)sc*=1+.35*Math.sin(pe/700*Math.PI);if(!d._r.busy)d._r.sc=sc;}
  // ⑤ 엄마 오리 따라 줄서기: 4분마다 100초 동안, 가장 큰 오리를 가까운 오리 넷이 따라가요
  const W=240000,wk=Math.floor(now/W),we=now-wk*W,DUR=100000;
  if(we<DUR&&optOn('duckFamily')){const fa=Math.min(1,we/5000,(DUR-we)/5000);const pool=A.filter(d=>!d._r.hide&&d.st==='swim');if(pool.length>=3){let mom=pool.slice().sort((a,b)=>(b.s*Math.pow(1.2,FUN.lv[b.key]||0))-(a.s*Math.pow(1.2,FUN.lv[a.key]||0))||String(a.key).localeCompare(String(b.key)))[0];
    // v79: 엄마·아기 오리는 줄서기 시작 때 한 번만 정해요 (매 순간 다시 고르면 줄이 바뀌며 툭 튀었어요)
    if(FUN.famK!==wk||!FUN.fam||!K.has(FUN.fam.mom)||FUN.fam.kids.some(k=>!K.has(k)||(K.get(k)._r||{}).hide)){FUN.famK=wk;FUN.fam={mom:mom.key,kids:pool.filter(d=>d!==mom).sort((a,b)=>Math.hypot(a.x-mom.x,a.z-mom.z)-Math.hypot(b.x-mom.x,b.z-mom.z)).slice(0,4).map(d=>d.key)};}
    const mom2=K.get(FUN.fam.mom);if(mom2&&!mom2._r.hide)mom=mom2;const kids=FUN.fam.kids.map(k=>K.get(k)).filter(d=>d&&d!==mom&&!d._r.hide);const fw=[Math.sin(mom.yaw),Math.cos(mom.yaw)];
    kids.forEach((d,i)=>{const gap=(1.1+i*1.05)*Math.max(.9,mom.s*.8),sw=Math.sin(now/600+i)*.18;const tx=mom.x-fw[0]*gap+fw[1]*sw,tz=mom.z-fw[1]*gap-fw[0]*sw;d._r.x+=(tx-d._r.x)*fa;d._r.z+=(tz-d._r.z)*fa;if(fa>.5)d._r.yaw=mom.yaw;d._r.busy=true;d._r.sc=Math.min(d._r.sc,.85);});
    kids.forEach(d=>{const r=Math.hypot(d._r.x,d._r.z),lim=rMax*.95;if(r>lim){d._r.x*=lim/r;d._r.z*=lim/r;}});    mom._r.busy=true;if(fa>=1&&FUN.heartK!==wk){FUN.heartK=wk;burst(mom.x,WY+.8,mom.z,'#ff7aa2',16);}}}
  // 🧪 시설
  const fk=funOpt();buildFac(fk);if(FUN.wheel)FUN.wheel.rotation.x+=dt*.8;
  for(const id in FUN.rides){const r=FUN.rides[id],w=rideAt(r,now,A);if(!w||!r.pick||!r.pick.id)continue;const d=K.get(r.pick.id);if(!d||d._r.hide)continue;d._r.busy=true;let e=w.e;
   const s0=r.legs[0][0].getPoint(0);if(e<r.approach){const f=e/r.approach;d._r.x+=(s0.x-d._r.x)*f;d._r.z+=(s0.z-d._r.z)*f;d._r.yaw=Math.atan2(s0.x-d.x,s0.z-d.z);continue;}e-=r.approach;
   let done=true;for(const [cv,ms] of r.legs){if(e<ms){const p=cv.getPoint(e/ms),tg=cv.getTangent(e/ms);d._r.x=p.x;d._r.y=p.y;d._r.z=p.z;d._r.yaw=Math.atan2(tg.x,tg.z);done=false;if(r.jet&&FUN.col){FUN.col.scale.y=Math.max(1,p.y+.6);FUN.col.position.y=FUN.col.scale.y/2;}break;}e-=ms;}
   if(done){const last=r.legs[r.legs.length-1][0].getPoint(1);d._r.x=last.x;d._r.z=last.z;if(!r.spl||r.spl!==r.pick.k){r.spl=r.pick.k;splash(last.x,last.z);}if(r.jet&&FUN.col){FUN.col.scale.y=1;FUN.col.position.y=.5;}}}
  smoothAll(A,dt);tagStep(dt,K);
  return A;}
 // v79: 화면 위치를 한 번 더 부드럽게 — 설정 변경·가족 줄서기·합체 해제 때 툭 튀지 않고 헤엄쳐 가요.
 // 서로 너무 붙은 오리는 살짝 밀어내서 한 곳에 뭉쳐 보이지 않게 해요 (보이는 위치만, 공유 경로는 그대로).
 function smoothAll(A,dt){const V=A.filter(d=>d._r&&!d._r.hide);
  for(const d of V){const r=d._r;let p=FUN.disp[d.key];if(!p)p=FUN.disp[d.key]={x:r.x,z:r.z,sc:r.sc};
   const dx=r.x-p.x,dz=r.z-p.z,l=Math.hypot(dx,dz);if(l<.15||d.st!=='swim'){p.x=r.x;p.z=r.z;}else{const m=Math.min(l,(.5+l*2.2)*dt)/l;p.x+=dx*m;p.z+=dz*m;if(l>.6)r.yaw=Math.atan2(dx,dz);}
   p.sc=(p.sc==null?r.sc:p.sc)+(r.sc-(p.sc==null?r.sc:p.sc))*Math.min(1,dt*4);}
  for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++){const a=V[i],b=V[j];if(a._r.busy||b._r.busy||a.st!=='swim'||b.st!=='swim')continue;const pa=FUN.disp[a.key],pb=FUN.disp[b.key],dx=pa.x-pb.x,dz=pa.z-pb.z,l=Math.hypot(dx,dz)||1e-3,mn=.95*Math.max(.8,(a.s+b.s)*.5*(pa.sc+pb.sc)*.5);
   if(l<mn){const k=Math.min(.5,(mn-l)*dt*1.5)/l;pa.x+=dx*k;pa.z+=dz*k;pb.x-=dx*k;pb.z-=dz*k;}}
  for(const d of V){const p=FUN.disp[d.key],r=Math.hypot(p.x,p.z),lim=rMax*.97;if(r>lim){p.x*=lim/r;p.z*=lim/r;}d._r.x=p.x;d._r.z=p.z;d._r.sc=p.sc;}
  for(const k in FUN.disp)if(!A.some(d=>d.key===k&&d._r&&!d._r.hide)&&!FUN.abs[k])delete FUN.disp[k];}
 // 합체 글자: 오리 머리 위로 떠올랐다 사라지는 스프라이트
 function tag(key,txt,col){const c=document.createElement('canvas');c.width=256;c.height=72;const g=c.getContext('2d');g.font='800 38px Pretendard,"Noto Sans KR",sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineWidth=8;g.strokeStyle='rgba(60,40,20,.85)';g.strokeText(txt,128,38);g.fillStyle=col==='#ffffff'?'#fff3a0':col;g.fillText(txt,128,38);
  const tx=new T.CanvasTexture(c),sp=new T.Sprite(new T.SpriteMaterial({map:tx,transparent:true,depthTest:false,depthWrite:false}));sp.scale.set(3.6,1.02,1);sp.renderOrder=999;scene.add(sp);FUN.tags.push({key,sp,t:0});}
 function tagStep(dt,K){for(let i=FUN.tags.length-1;i>=0;i--){const g=FUN.tags[i];g.t+=dt;const d=K.get(g.key),p=FUN.disp[g.key]||d;if(p)g.sp.position.set(p.x,WY+1.3+g.t*.45,p.z);g.sp.material.opacity=Math.min(1,g.t*4,(2.6-g.t)/.6);if(g.t>2.6||!d){scene.remove(g.sp);g.sp.material.map.dispose();g.sp.material.dispose();FUN.tags.splice(i,1);}}}
 const mtx=()=>new T.Matrix4(),q=()=>new T.Quaternion();let M4,Q4,E4,S4,P4;
 function step(t){requestAnimationFrame(step);if(!ok){ok=init();if(!ok)return;M4=mtx();Q4=q();E4=new T.Euler();S4=new T.Vector3();P4=new T.Vector3();last=t;}
  const dt=Math.min(.05,(t-last)/1000);last=t;  const c=conf(),go=document.getElementById('go'),started=go&&!go.offsetParent;
  const RT=window.NK_RT,SY=window.NK_SYNC,lake=!!(RT&&SY&&RT.status&&RT.status()==='on'&&RT.world&&+RT.world.ambSeed);
  if(duckWas===false&&c.on)duckArm=Date.now();
  if(!c.on)duckArm=0;
  duckWas=!!c.on;
  if(lake){if(!c.on){ducks.length=0;everSpawned=0;cycleQ=[];cycleI=0;}
   else{const everyMs=Math.max(1000,Math.round((+c.every||300)*1000));const play=RT.play||{},serverSince=+play.duckSince||0,skew=Number.isFinite(+RT.clockSkew)?+RT.clockSkew:0;
    let since=0,now=Date.now();
    if(duckArm>0){const armServer=duckArm-skew;if(serverSince>=armServer-5000){since=serverSince;now=Date.now()-skew;}else since=duckArm;}
    else if(serverSince>0){since=serverSince;now=Date.now()-skew;}
    const lay=SY.ducks(now,RT.world,{rMax:rMax,every:everyMs,max:c.max,speed:+c.speed||0,size:c.size,kinds:c.kinds,ord:c.ord,on:1,since:since||0});ducks.length=0;lay.forEach(s=>{const face=s.head!=null?s.head:(+c.speed>0?-s.yaw:s.yaw);const age=+s.age||0,drop=1500,falling=!!since&&age<drop;const ph=s.ph!=null?+s.ph:s.i;ducks.push({key:'s'+s.i,x:s.x,z:s.z,y:falling?14*(1-age/drop):WY-.04+Math.sin(ph*2.1)*.035,vy:0,st:falling?'fall':'swim',yaw:face,tY:face,sp:.3,s:s.s,ph,spin:0,v:s.v,born:0,fade:1,sync:1});});}}
  else if(!c.on){ducks.length=0;everSpawned=0;cycleQ=[];cycleI=0;}
  else if(started&&t>nextT){
   if(ducks.filter(d=>d.st!=='fade').length>=c.max){ // 최대 → 가장 오래된 것 페이드 후 새 등장
    const alive=ducks.filter(d=>d.st!=='fade').sort((a,b)=>(a.born||0)-(b.born||0));
    if(alive[0]&&alive[0].st!=='fade')alive[0].st='fade';
   }
   if(ducks.filter(d=>d.st!=='fade').length<c.max){spawn();nextT=t+c.every*1000*(everSpawned>1?1:.15);}
   else nextT=t+400;
  }
  if(!lake&&c.kinds.length)for(const d of ducks)if(!c.kinds.includes(d.v)&&d.st!=='fade')d.v=c.kinds.includes('base')?'base':c.kinds[0];
  if(!lake)for(let i=ducks.length-1;i>=0;i--){const d=ducks[i];
   if(d.st==='fade'){d.fade=(d.fade??1)-dt*.7;d.y+=dt*.15;d.s*=1-dt*.35;if(d.fade<=0){ducks.splice(i,1);continue;}continue;}
   if(d.st==='fall'){d.vy-=18*dt;d.y+=d.vy*dt;d.yaw+=d.spin*dt;if(d.y<=WY){d.y=WY;d.st='sink';d.sv=d.vy*.12;splash(d.x,d.z);}}
   else if(d.st==='sink'){d.sv+=9*dt;d.y+=d.sv*dt;if(d.y>=WY&&d.sv>0){d.y=WY;d.st='swim';}}
   else{d.ph+=dt;if(Math.random()<dt*.06)d.tY=d.yaw+rnd(-.9,.9);const r=Math.hypot(d.x,d.z);if(r>rMax*.9)d.tY=Math.atan2(-d.x,-d.z);for(const e of ducks){if(e===d||e.st==='fade')continue;const dx=d.x-e.x,dz=d.z-e.z,l=Math.hypot(dx,dz);if(l<1.1&&l>0)d.tY=Math.atan2(dx,dz);}
    let da=((d.tY-d.yaw+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;d.yaw+=da*Math.min(1,dt*.35);const dv=(SY&&SY.duckSpeed?SY.duckSpeed(c.speed):c.speed*.1)*(d.sp/.35);d.x+=Math.sin(d.yaw)*dv*dt+Math.sin(d.ph*.09)*dv*.15*dt;d.z+=Math.cos(d.yaw)*dv*dt+Math.cos(d.ph*.07)*dv*.15*dt;d.y=WY-.04+Math.sin(d.ph*2.1)*.035;}}
  try{funApply(dt,t);}catch(e){if(!FUN.err){FUN.err=1;console.warn('[duckfun]',e);}}const CR=crownMesh();let cn=0;
  const CN={};for(const v in VG)CN[v]=0;ducks.forEach(d=>{const r=d._r||{x:d.x,y:d.y,z:d.z,yaw:d.yaw,sc:1};if(r.hide)return;const sw=d.st==='swim'&&!(r.y>d.y+.2);E4.set(sw?Math.sin(d.ph*2.1+1)*.08:(d.st==='fall'?Math.sin(t/120)*.3:0),r.yaw,sw?Math.sin(d.ph*1.7)*.07:0);Q4.setFromEuler(E4);const sm=(String(c.size)==='rand'?d.s:DUCK_BASE*(+c.size||1))*(r.sc||1);S4.set(sm,sm,sm);P4.set(r.x,r.y,r.z);M4.compose(P4,Q4,S4);const L=VG[d.v]||VG.base,i=CN[d.v in VG?d.v:'base']++;L.forEach(m=>m.setMatrixAt(i,M4));
   if((FUN.lv[d.key]||0)>=3&&cn<MAX){const hy=r.y+sm*1.02,ck=(FUN.lv[d.key]>=5?1.45:FUN.lv[d.key]>=4?1.2:1);P4.set(r.x,hy,r.z);S4.set(sm*ck,sm*ck,sm*ck);M4.compose(P4,Q4,S4);CR.m.setMatrixAt(cn,M4);for(let j=0;j<5;j++){const a=j/5*6.28+r.yaw;const px=r.x+Math.cos(a)*.22*sm,pz=r.z+Math.sin(a)*.22*sm;P4.set(px,hy+.12*sm,pz);M4.compose(P4,Q4,S4);CR.pk.setMatrixAt(cn*5+j,M4);}cn++;}});
  CR.m.count=cn;CR.pk.count=cn*5;CR.m.instanceMatrix.needsUpdate=CR.pk.instanceMatrix.needsUpdate=true;
  for(const v in VG)VG[v].forEach(m=>{m.count=CN[v];m.visible=CN[v]>0;m.instanceMatrix.needsUpdate=true;});
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;const k=f.t/.9;f.ring.scale.setScalar(1+k*5);f.ring.material.opacity=.8*(1-k);const a=f.pts.geometry.attributes.position;for(let j=0;j<f.vel.length;j++){f.vel[j][1]-=9*dt;a.array[j*3]+=f.vel[j][0]*dt;a.array[j*3+1]=Math.max(WY,a.array[j*3+1]+f.vel[j][1]*dt);a.array[j*3+2]+=f.vel[j][2]*dt;}a.needsUpdate=true;f.pts.material.opacity=.9*(1-k);
   if(k>=1){scene.remove(f.ring,f.pts);f.ring.geometry.dispose();f.ring.material.dispose();f.pts.geometry.dispose();f.pts.material.dispose();fx.splice(i,1);}}}
 document.addEventListener('change',e=>{if(e.target.classList&&e.target.classList.contains('duckK')){const v=[...document.querySelectorAll('.duckK:checked')].map(x=>x.value);U().set('duckKinds',v.join(','));}});
 requestAnimationFrame(step);
 window.NK_DUCK={caught:(key)=>{const d=ducks.find(x=>x.key===key);const p=FUN.disp[key]||d;if(p){splash(p.x,p.z);burst(p.x,WY+.4,p.z,'#fff3a0',16);}FUN.gone[key]=nowS()+300000;const L=FUN.lv[key]||0;if(L)FUN.lv[key]=0;for(const k in FUN.abs)if(FUN.abs[k].into===key)FUN.abs[k].until=0;return L;},visible:()=>ducks.filter(d=>d._r&&!d._r.hide&&d.st==='swim').map(d=>({key:d.key,x:d._r.x,z:d._r.z,sc:d._r.sc||1,s:d.s,lv:FUN.lv[d.key]||0,busy:!!d._r.busy})),count:()=>ducks.filter(d=>d.st!=='fade').length,drop:(n=1,v)=>{for(let i=0;i<n&&ducks.filter(d=>d.st!=='fade').length<MAX;i++)spawn(v);},clear:()=>{ducks.length=0;everSpawned=0;cycleQ=[];cycleI=0;},list:()=>ducks,fun:()=>FUN,rMax:()=>rMax,cycle:()=>({q:cycleQ.slice(),i:cycleI,n:everSpawned})};})();
