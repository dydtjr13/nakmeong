// 피쉬레스트 v30: 러버덕 순환 스폰(첫 base · 셔플 순차 · 최대 시 페이드) · 8종(펭귄·눈사람 포함)(기본+해적·딸기·우주비행사·개구리·유니콘, duck-var-v28.js) — 하늘에서 떨어져 첨벙! 후 호수를 둥둥 유영. 설정: 생성 간격·최대 수(최대 30)
// 3D 모델: JDSherbert "3D Rubber Duck Asset Pack" (상업 이용 가능 · 작가 표기 필수)
(function(){const U=()=>window.NK_UI25,G=()=>window.NKV2;let T,scene,IM=[],VG={},ducks=[],fx=[],last=0,nextT=0,rMax=8,ok=false;const MAX=30;
 const conf=()=>({on:U().get('duckOn')!==0,every:+(U().get('duckEvery')||45),max:Math.min(MAX,Math.max(0,+(U().get('duckMax')??8))),size:+(U().get('duckSize')||1),speed:+(U().get('duckSpeed')??1),snd:U().get('duckSnd')!==0,kinds:(()=>{const allow=new Set((window.NK_DUCKV&&NK_DUCKV.LIST||[]).map(x=>x[0]));const raw=String(U().get('duckKinds')??'base,pirate,straw,astro,frog,uni,penguin,snowman,dino').split(',').filter(k=>allow.has(k));return raw.length?raw:['base','pirate','straw','astro','frog','uni','penguin','snowman','dino'];})()});
 function geo(){const M=window.NK_DUCK_MESH,b=atob(M.pos),p=new Float32Array(M.n*3),dv=new DataView(new ArrayBuffer(b.length));for(let i=0;i<b.length;i++)dv.setUint8(i,b.charCodeAt(i));for(let i=0;i<M.n*3;i++)p[i]=dv.getInt16(i*2,true)/32767;
  const out={};for(const k in M.g){const s=atob(M.g[k]),d=new DataView(new ArrayBuffer(s.length));for(let i=0;i<s.length;i++)d.setUint8(i,s.charCodeAt(i));const idx=new Uint16Array(s.length/2);for(let i=0;i<idx.length;i++)idx[i]=d.getUint16(i*2,true);
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setIndex(new T.BufferAttribute(idx,1));g.computeVertexNormals();out[k]=g;}return out;}
 function init(){const g=G();if(!g||!g.scene||!g.THREE||!window.NK_DUCK_MESH)return false;T=g.THREE;scene=g.scene;const GE=geo(),VV=window.NK_DUCKV.build(T,GE);
  for(const v in VV){const P=VV[v],L=[];['body','beak','eyes'].forEach(k=>L.push(new T.InstancedMesh(GE[k],new T.MeshLambertMaterial({color:P[k]}),MAX)));P.acc.forEach(([g,m])=>L.push(new T.InstancedMesh(g,m,MAX)));L.forEach(m=>{m.count=0;m.visible=false;m.frustumCulled=false;scene.add(m);IM.push(m);});VG[v]=L;}
  const tips=(g.decks||[]).map(d=>d.tip?Math.hypot(d.tip.x,d.tip.z):99);rMax=Math.max(4,Math.min(...tips,30)-2.2);return true;}
 const rnd=(a,b)=>a+Math.random()*(b-a),WY=-.1;
 // v30: 순환 스폰 — 첫 마리 무조건 base, 이후 켜진 종류 중복없이 셔플 순차, 라운드 끝나면 재셔플. 최대 도달 시 가장 오래된 것부터 페이드아웃 후 새 종류.
 let cycleQ=[],cycleI=0,everSpawned=0;
 function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function refillCycle(){const K=conf().kinds.filter(k=>VG[k]);const rest=K.filter(k=>k!=='base');shuffle(rest);cycleQ=rest.length?rest.slice():(K.length?K.slice():['base']);cycleI=0;}
 function nextKind(){const K=conf().kinds.filter(k=>VG[k]);if(!K.length)return 'base';
  if(everSpawned===0&&VG.base&&K.includes('base')){everSpawned=1;refillCycle();return 'base';}
  everSpawned++;if(!cycleQ.length||cycleI>=cycleQ.length)refillCycle();
  // 호수에 같은 종류가 너무 많으면 다음으로
  for(let n=0;n<cycleQ.length;n++){const k=cycleQ[(cycleI+n)%cycleQ.length];const cnt=ducks.filter(d=>d.v===k&&d.st!=='fade').length;if(cnt<Math.max(2,Math.ceil((conf().max||8)/Math.max(1,K.length)))){cycleI=(cycleI+n+1)%Math.max(1,cycleQ.length);if(cycleI===0&&n+1>=cycleQ.length)refillCycle();return k;}}
  const k=cycleQ[cycleI%cycleQ.length];cycleI++;return k;}
 function spawn(forceV){let r=Math.sqrt(Math.random())*rMax*.85,a=Math.random()*Math.PI*2;try{const m=G().me,o=(typeof m==='function'?m():m),p=o&&(o.o?o.o.position:o.position);if(p&&Math.random()<.65){a=Math.atan2(p.z,p.x)+rnd(-.35,.35);r=rMax*rnd(.55,.92);}}catch(e){}
  const v=forceV||nextKind();const sz=String(conf().size)==='rand'?rnd(.65,1.85):rnd(1.5,2.0);ducks.push({x:Math.cos(a)*r,z:Math.sin(a)*r,y:rnd(13,18),vy:0,st:'fall',yaw:Math.random()*6.28,tY:Math.random()*6.28,sp:rnd(.25,.45),s:sz,ph:Math.random()*6.28,spin:rnd(-3,3),v,born:performance.now(),fade:1});}
 function splash(x,z){const ring=new T.Mesh(new T.RingGeometry(.2,.32,28).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.8,depthWrite:false}));ring.position.set(x,WY+.03,z);scene.add(ring);
  const n=14,pg=new T.BufferGeometry(),pa=new Float32Array(n*3),vel=[];for(let i=0;i<n;i++){pa[i*3]=x;pa[i*3+1]=WY;pa[i*3+2]=z;const a=Math.random()*6.28,s=rnd(.8,1.8);vel.push([Math.cos(a)*s,rnd(2.2,3.6),Math.sin(a)*s]);}pg.setAttribute('position',new T.BufferAttribute(pa,3));
  const pts=new T.Points(pg,new T.PointsMaterial({color:'#e8f6ff',size:.12,transparent:true,opacity:.9,depthWrite:false}));scene.add(pts);fx.push({ring,pts,vel,t:0});
  if(U().get('duckSnd')!==0)try{const ac=window.__duckAC||(window.__duckAC=new (window.AudioContext||window.webkitAudioContext)()),o=ac.createOscillator(),gn=ac.createGain(),vol=(G().S&&G().S.vol!=null?G().S.vol:.2);o.type='sine';o.frequency.setValueAtTime(520,ac.currentTime);o.frequency.exponentialRampToValueAtTime(140,ac.currentTime+.18);gn.gain.setValueAtTime(.25*vol,ac.currentTime);gn.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.25);o.connect(gn).connect(ac.destination);o.start();o.stop(ac.currentTime+.26);}catch(e){}}
 const mtx=()=>new T.Matrix4(),q=()=>new T.Quaternion();let M4,Q4,E4,S4,P4;
 function step(t){requestAnimationFrame(step);if(!ok){ok=init();if(!ok)return;M4=mtx();Q4=q();E4=new T.Euler();S4=new T.Vector3();P4=new T.Vector3();last=t;}
  const dt=Math.min(.05,(t-last)/1000);last=t;const c=conf(),go=document.getElementById('go'),started=go&&!go.offsetParent;
  const RT=window.NK_RT,SY=window.NK_SYNC,lake=!!(RT&&SY&&RT.status&&RT.status()==='on'&&RT.world&&+RT.world.ambSeed);
  if(lake){if(!c.on){ducks.length=0;everSpawned=0;cycleQ=[];cycleI=0;}
   else{const everyMs=Math.max(1000,Math.round((+c.every||300)*1000));const lay=SY.ducks(Date.now(),RT.world,{rMax:rMax,every:everyMs,max:c.max,speed:+c.speed||0,size:c.size,kinds:c.kinds,on:1});ducks.length=0;lay.forEach(s=>{const face=s.head!=null?s.head:(+c.speed>0?-s.yaw:s.yaw);ducks.push({x:s.x,z:s.z,y:WY,vy:0,st:'swim',yaw:face,tY:face,sp:.3,s:s.s,ph:s.i,spin:0,v:s.v,born:0,fade:1,sync:1});});}}
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
   else{d.ph+=dt;if(Math.random()<dt*.25)d.tY=d.yaw+rnd(-1.4,1.4);const r=Math.hypot(d.x,d.z);if(r>rMax*.9)d.tY=Math.atan2(-d.x,-d.z);for(const e of ducks){if(e===d||e.st==='fade')continue;const dx=d.x-e.x,dz=d.z-e.z,l=Math.hypot(dx,dz);if(l<1.1&&l>0)d.tY=Math.atan2(dx,dz);}
    let da=((d.tY-d.yaw+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;d.yaw+=da*Math.min(1,dt*1.2);d.x+=Math.sin(d.yaw)*d.sp*c.speed*dt;d.z+=Math.cos(d.yaw)*d.sp*c.speed*dt;d.y=WY-.04+Math.sin(d.ph*2.1)*.035;}}
  const CN={};for(const v in VG)CN[v]=0;ducks.forEach(d=>{const sw=d.st==='swim';E4.set(sw?Math.sin(d.ph*2.1+1)*.08:(d.st==='fall'?Math.sin(t/120)*.3:0),d.yaw,sw?Math.sin(d.ph*1.7)*.07:0);Q4.setFromEuler(E4);const sm=String(c.size)==='rand'?d.s:d.s*(+c.size||1);S4.set(sm,sm,sm);P4.set(d.x,d.y,d.z);M4.compose(P4,Q4,S4);const L=VG[d.v]||VG.base,i=CN[d.v in VG?d.v:'base']++;L.forEach(m=>m.setMatrixAt(i,M4));});
  for(const v in VG)VG[v].forEach(m=>{m.count=CN[v];m.visible=CN[v]>0;m.instanceMatrix.needsUpdate=true;});
  for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;const k=f.t/.9;f.ring.scale.setScalar(1+k*5);f.ring.material.opacity=.8*(1-k);const a=f.pts.geometry.attributes.position;for(let j=0;j<f.vel.length;j++){f.vel[j][1]-=9*dt;a.array[j*3]+=f.vel[j][0]*dt;a.array[j*3+1]=Math.max(WY,a.array[j*3+1]+f.vel[j][1]*dt);a.array[j*3+2]+=f.vel[j][2]*dt;}a.needsUpdate=true;f.pts.material.opacity=.9*(1-k);
   if(k>=1){scene.remove(f.ring,f.pts);f.ring.geometry.dispose();f.ring.material.dispose();f.pts.geometry.dispose();f.pts.material.dispose();fx.splice(i,1);}}}
 document.addEventListener('change',e=>{if(e.target.classList&&e.target.classList.contains('duckK')){const v=[...document.querySelectorAll('.duckK:checked')].map(x=>x.value);U().set('duckKinds',v.join(','));}});
 requestAnimationFrame(step);
 window.NK_DUCK={count:()=>ducks.filter(d=>d.st!=='fade').length,drop:(n=1,v)=>{for(let i=0;i<n&&ducks.filter(d=>d.st!=='fade').length<MAX;i++)spawn(v);},clear:()=>{ducks.length=0;everSpawned=0;cycleQ=[];cycleI=0;},list:()=>ducks,rMax:()=>rMax,cycle:()=>({q:cycleQ.slice(),i:cycleI,n:everSpawned})};})();
