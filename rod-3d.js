// 낚멍 v5 낚싯대 3D 외형 (장착 시 캐릭터 손에 표시). 길이·마디색·밴드·릴·끝 발광
(function(){
const P={bamboo:{len:2.0,seg:['#b08850','#8a6438'],grip:'#6a4a30'},carbon:{len:2.3,seg:['#2c2c34','#34343e'],band:'#3a7ad8',reel:{c:'#3a7ad8',r:.07}},
 silver:{len:2.4,seg:['#d8dde4','#b8c0c8'],band:'#9aa4b0',reel:{c:'#e8ecf0',r:.08}},coral:{len:2.3,seg:['#5fc8c0','#3fa8a0'],band:'#f0d0a0',reel:{c:'#f4c8b8',r:.1,shell:1}},
 sakura:{len:2.4,seg:['#f4b8c8','#e89ab0'],band:'#e8c45a',reel:{c:'#f8d0dc',r:.08},tip:'#ffd0e0'},gold:{len:2.5,seg:['#f2c04a','#e0a830'],band:'#c83a3a',reel:{c:'#f2c04a',r:.085},tip:'#fff2a0'},
 star:{len:2.6,seg:['#2a3a7a','#1f2a5a'],band:'#e8c45a',reel:{c:'#2a3a7a',r:.085},tip:'#fff6a0'},dragon:{len:2.7,seg:['#3f9a6a','#2f7a52'],band:'#e8c45a',reel:{c:'#2f7a52',r:.09},tip:'#fff8c0',orb:1},
 galaxy:{len:2.65,seg:['#3a2a8a','#5a3ab8'],band:'#d8dcf0',reel:{c:'#c8ccdc',r:.09},tip:'#fff6a0'},abyss:{len:2.75,seg:['#e8e2d0','#2a6a9a'],band:'#7fe0f0',reel:{c:'#2a6a9a',r:.095},tip:'#a0f4ff',orb:1},
 heaven:{len:2.8,seg:['#f6f4ec','#e8e2d0'],band:'#e8c45a',reel:{c:'#f6f4ec',r:.095},tip:'#8af4e0',orb:1},fire:{len:2.8,seg:['#e8401c','#ff8a1c'],band:'#e8c45a',reel:{c:'#c8201c',r:.095},tip:'#ffd060',orb:1},master:{len:2.75,seg:['#fbf8f2','#f1ece2'],band:'#ff8fb8',reel:{c:'#fbf8f2',r:.095},tip:'#9ff0ff',orb:1}};// v26
const glowCache={};function glowTex(c){if(glowCache[c])return glowCache[c];const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'#fff');gr.addColorStop(.3,c);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return glowCache[c]=new THREE.CanvasTexture(cv);}
window.NK_ROD3D=function(k,star){const o=P[k]||P.bamboo,g=new THREE.Group(),n=5,L=new THREE.MeshLambertMaterial;
 const segM=o.seg.map(c=>new THREE.MeshLambertMaterial({color:c}));for(let i=0;i<n;i++){const r0=.05-.032*i/n,r1=.05-.032*(i+1)/n,h=o.len/n,m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,h,6),segM[i%2]);m.position.y=h*(i+.5);g.add(m);
  if(o.band&&i<n-1){const b=new THREE.Mesh(new THREE.CylinderGeometry(r1*1.45,r1*1.45,.035,6),new THREE.MeshLambertMaterial({color:o.band}));b.position.y=h*(i+1);g.add(b);}}
 const grip=new THREE.Mesh(new THREE.CylinderGeometry(.07,.075,.36,6),new THREE.MeshLambertMaterial({color:o.grip||o.band||'#6a4a30'}));grip.position.y=.16;g.add(grip);
 if(o.reel){const rm=new THREE.MeshLambertMaterial({color:o.reel.c});const rl=o.reel.shell?new THREE.Mesh(new THREE.SphereGeometry(o.reel.r,8,5,0,Math.PI*2,0,Math.PI/2),rm):new THREE.Mesh(new THREE.CylinderGeometry(o.reel.r,o.reel.r,.06,10),rm);rl.rotation.z=Math.PI/2;rl.position.set(.08,.42,0);g.add(rl);}
 if(o.tip){const t=new THREE.Mesh(new THREE.SphereGeometry(o.orb?.07:.04,8,6),new THREE.MeshBasicMaterial({color:o.tip}));t.position.y=o.len;g.add(t);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(o.tip),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar((o.orb?.5:.28)*(1+(star||0)*.08));sp.position.y=o.len;g.add(sp);g.userData.glow=sp;}
 const tip=new THREE.Object3D();tip.position.y=o.len;g.add(tip);g.userData.tip=tip;g.scale.setScalar(1/2.2);return g;};
window.NK_ROD3D_P=P;})();
// v195: 용왕 이상 낚싯대 꾸밈 (안3) — 굵은 대·마디 고리·감긴 용·용머리·여의주 + 광륜 + 발밑 오라
// · 장식(불투명)은 게임의 mergeStatic이 낚싯대마다 2덩어리로 합쳐요.
// · 광륜·발밑 오라는 모든 캐릭터를 묶어 한 번에 그려요(인스턴싱) → 사람 수가 늘어도 그리기 호출이 늘지 않아요.
// · 내 낚싯대만: 대 주변 입자, 등급 색 낚싯줄 + 줄 위 반짝임, 던질 때 찌 꼬리.
(function(){
const T=THREE,P=window.NK_ROD3D_P;
const TIER={dragon:1,abyss:2,heaven:3,fire:3,master:3};
const PAL={dragon:{body:'#3f9a6a',belly:'#bfe8a8',metal:'#f0c850',mane:'#ffd24a',glow:'#a8ffb8',orb:'#fff4a8',eye:'#ffe14a'},
 abyss:{body:'#2f78b0',belly:'#d8f0f8',metal:'#e8f0f8',mane:'#7fe8ff',glow:'#7ff0ff',orb:'#e0fcff',eye:'#9ff4ff'},
 heaven:{body:'#f4f0e4',belly:'#ffffff',metal:'#f0c850',mane:'#7ff0d8',glow:'#8ff8e0',orb:'#ffffff',eye:'#40d8c0'},
 fire:{body:'#e0401c',belly:'#ffc070',metal:'#f6c84a',mane:'#ff9a2a',glow:'#ffa040',orb:'#fff2a0',eye:'#fff060'},
 master:{body:'#fbf8f2',belly:'#ffe0ec',metal:'#ff9fc4',mane:'#9ff0ff',glow:'#a8f4ff',orb:'#ffffff',eye:'#ff8fb8'}};
// 등급별 크기 (haloW = 광륜 지름, 월드 단위 · 캐릭터 키 ≈ 1.9)
const SC={1:{thick:1.3,head:.38,haloW:1.3,foot:1.2,ring:1.5},2:{thick:1.45,head:.48,haloW:1.8,foot:1.7,ring:2.1},3:{thick:1.6,head:.6,haloW:2.4,foot:2.4,ring:3.1}};
const FX={on:true,far:42,nearN:12,stats:{ms:0,n:0,inst:0},T:TIER,PAL};window.NK_RODFX=FX;
const cv=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);return t;};
const TX={},tex=(k,f)=>TX[k]||(TX[k]=f());
const tGlow=()=>tex('g',()=>cv(128,128,x=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.22,'rgba(255,255,255,.85)');g.addColorStop(.5,'rgba(255,255,255,.28)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);}));
const tRing=()=>tex('r',()=>cv(256,256,x=>{x.translate(128,128);x.fillStyle='rgba(255,255,255,.14)';x.beginPath();x.arc(0,0,92,0,7);x.fill();x.lineWidth=13;x.strokeStyle='rgba(255,255,255,.95)';x.beginPath();x.arc(0,0,98,0,7);x.stroke();x.lineWidth=5;x.strokeStyle='rgba(50,30,16,.55)';x.beginPath();x.arc(0,0,108,0,7);x.stroke();
  for(let i=0;i<8;i++){x.save();x.rotate(i/8*Math.PI*2);x.fillStyle='rgba(255,255,255,.98)';x.beginPath();x.moveTo(0,-122);x.lineTo(7,-104);x.lineTo(0,-96);x.lineTo(-7,-104);x.fill();x.strokeStyle='rgba(50,30,16,.5)';x.lineWidth=2;x.stroke();x.restore();}}));
const tRays=()=>tex('y',()=>cv(256,256,x=>{x.translate(128,128);for(let i=0;i<12;i++){x.save();x.rotate(i/12*Math.PI*2);const g=x.createLinearGradient(0,0,0,-126);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.moveTo(-(i%2?5:9),0);x.lineTo(0,-(i%2?96:126));x.lineTo(i%2?5:9,0);x.fill();x.restore();}}));
const tDot=()=>tex('d',()=>cv(64,64,x=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.45,'rgba(255,255,255,.9)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);}));
const tFoot=()=>tex('f',()=>cv(512,512,x=>{x.translate(256,256);const g=x.createRadialGradient(0,0,120,0,0,250);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.6,'rgba(255,255,255,.18)');g.addColorStop(.86,'rgba(255,255,255,.75)');g.addColorStop(.93,'rgba(255,255,255,.3)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,256,0,7);x.fill();
  x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=4;x.beginPath();x.arc(0,0,168,0,7);x.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;x.fillStyle='rgba(255,255,255,.95)';x.beginPath();x.arc(Math.cos(a)*168,Math.sin(a)*168,i%3?5:10,0,7);x.fill();}}));
const MC={};const lam=c=>MC['l'+c]||(MC['l'+c]=new T.MeshLambertMaterial({color:c,flatShading:true}));const bas=c=>MC['b'+c]||(MC['b'+c]=new T.MeshBasicMaterial({color:c}));
const GC={};const geo=(k,f)=>GC[k]||(GC[k]=f());
const radAt=(y,L)=>.05-.032*Math.min(1,Math.max(0,y/L));
// 용머리 (머리 길이 ≈ 1). 주둥이 +y(대 방향), 정수리 +z
function head(C,t){const H=new T.Group(),body=lam(C.body),belly=lam(C.belly),metal=lam(C.metal),mane=lam(C.mane),white=bas('#ffffff'),blk=bas('#2a1a10'),eye=bas(C.eye);
 const add=(g,m,p,r,s)=>{const o=new T.Mesh(g,m);o.position.set(p[0],p[1],p[2]);if(r)o.rotation.set(r[0],r[1],r[2]);if(s)o.scale.set(s[0],s[1],s[2]);H.add(o);return o;};
 add(geo('skull',()=>new T.IcosahedronGeometry(.34,0)),body,[0,0,.02],null,[1,1.05,.88]);
 add(geo('snout',()=>new T.CylinderGeometry(.15,.24,.46,6)),body,[0,.36,.03]);
 add(geo('nose',()=>new T.BoxGeometry(.32,.09,.22)),metal,[0,.58,.08]);
 for(const sx of [-1,1])add(geo('nos',()=>new T.BoxGeometry(.06,.04,.05)),blk,[sx*.08,.62,.17]);
 add(geo('jaw',()=>new T.BoxGeometry(.26,.38,.09)),belly,[0,.3,-.2],[-.38,0,0]);
 for(const sx of [-1,1]){
  add(geo('ew',()=>new T.SphereGeometry(.12,7,5)),white,[sx*.2,.12,.2]);
  add(geo('ei',()=>new T.SphereGeometry(.07,6,4)),eye,[sx*.24,.16,.27]);
  add(geo('ep',()=>new T.SphereGeometry(.035,5,3)),blk,[sx*.25,.19,.32]);
  add(geo('brow',()=>new T.BoxGeometry(.2,.06,.1)),metal,[sx*.18,.2,.29],[0,0,sx*.35]);
  const h=add(geo('horn',()=>new T.ConeGeometry(.075,.62,5)),metal,[sx*.17,-.28,.32]);h.lookAt(new T.Vector3(sx*.45,-.95,.8));h.rotateX(Math.PI/2);
  for(let i=0;i<4;i++){const m=add(geo('mn'+i,()=>new T.ConeGeometry(.08-.01*i,.34-.03*i,4)),mane,[sx*(.2+.03*i),-.12-.1*i,.05-.04*i]);m.lookAt(new T.Vector3(sx*(.9+.1*i),-.6-.2*i,-.1));m.rotateX(Math.PI/2);}
  if(t>=3){const w=add(geo('wh',()=>new T.CylinderGeometry(.018,.03,.55,4)),metal,[sx*.24,.5,-.02]);w.rotation.set(-.9,0,sx*-.9);}}
 for(let i=0;i<3;i++){const m=add(geo('mc'+i,()=>new T.ConeGeometry(.09,.4-.05*i,4)),mane,[0,-.18-.12*i,.3-.06*i]);m.lookAt(new T.Vector3(0,-1.2,.9-.2*i));m.rotateX(Math.PI/2);}
 const orb=add(geo('orb',()=>new T.IcosahedronGeometry(.2,1)),bas(C.orb),[0,.78,.02]);
 return H;}
// 낚싯대 모델(g)에 장식을 붙여요 (mergeStatic 전에 불러요). 꾸밈이 없는 낚싯대면 false
FX.deco=function(g,k){const t=TIER[k]|0;if(!FX.on||!t||!g||g.userData.fxT)return false;const o=P[k]||P.bamboo,C=PAL[k]||PAL.dragon,S=SC[t],L=o.len;
 g.children.forEach(m=>{if(!m.isMesh)return;if(m.material.isMeshBasicMaterial)m.visible=false;else if(m.geometry.type==='CylinderGeometry'){m.scale.x*=S.thick;m.scale.z*=S.thick;m.material=lam('#'+m.material.color.getHexString());}});
 if(g.userData.glow)g.userData.glow.visible=false;
 const metal=lam(C.metal),body=lam(C.body),belly=lam(C.belly);
 for(let i=1;i<=5;i++){const y=i===5?L-.02:L/5*i,r=radAt(y,L)*S.thick;const tr=new T.Mesh(new T.TorusGeometry(r*1.35,.022*S.thick,5,10),metal);tr.rotation.x=Math.PI/2;tr.position.y=y;g.add(tr);}
 const y0=t===1?L*.5:L*.22,y1=L-.05,turns=t===1?1.5:t===2?2.3:2.8,pts=[];for(let i=0;i<=48;i++){const q=i/48,y=y0+(y1-y0)*q,a=q*turns*Math.PI*2,r=radAt(y,L)*S.thick+.035;pts.push(new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));}
 const cur=new T.CatmullRomCurve3(pts),tube=new T.TubeGeometry(cur,64,.026*S.thick,5,false);
 {const Pp=tube.attributes.position,uv=tube.attributes.uv,v=new T.Vector3(),c=new T.Vector3();for(let i=0;i<Pp.count;i++){const u=uv.getX(i);v.fromBufferAttribute(Pp,i);c.copy(cur.getPointAt(Math.min(1,u)));v.sub(c).multiplyScalar(.3+.7*Math.min(1,u*2.5)).add(c);Pp.setXYZ(i,v.x,v.y,v.z);}tube.computeVertexNormals();}
 g.add(new T.Mesh(tube,body));
 const nsp=t===1?6:t===2?10:14,up=new T.Vector3(0,1,0);for(let i=1;i<=nsp;i++){const q=i/(nsp+1),p=cur.getPointAt(q),tg=cur.getTangentAt(q),out=new T.Vector3(p.x,0,p.z).normalize();const sp=new T.Mesh(geo('sp'+i%3,()=>new T.ConeGeometry(.02,.075,4)),i%2?metal:belly);sp.scale.setScalar(.8+.5*q);sp.position.copy(p).addScaledVector(out,.028);sp.quaternion.setFromUnitVectors(up,out.clone().addScaledVector(tg,-.6).normalize());g.add(sp);}
 const H=head(C,t);H.position.set(0,L+.02,0);H.scale.setScalar(S.head);g.add(H);
 g.userData.tip.position.set(0,L+.02+.78*S.head,.02*S.head);g.userData.fxT=t;g.userData.fxK=k;return true;};
// ── 묶음 그리기 (모든 캐릭터의 광륜·발밑 오라를 종류별로 1번에) ──
const MAXN=64;const VS_B='attribute vec3 iP;attribute vec4 iD;attribute vec3 iC;varying vec2 vU;varying vec3 vC;varying float vA;void main(){vU=uv;vC=iC;vA=iD.z;vec4 mv=modelViewMatrix*vec4(iP,1.);float c=cos(iD.y),s=sin(iD.y);mv.xy+=vec2(c*position.x-s*position.y,s*position.x+c*position.y)*iD.x;gl_Position=projectionMatrix*mv;}';
const VS_F='attribute vec3 iP;attribute vec4 iD;attribute vec3 iC;varying vec2 vU;varying vec3 vC;varying float vA;void main(){vU=uv;vC=iC;vA=iD.z;float c=cos(iD.y),s=sin(iD.y);vec3 p=position*iD.x;p=vec3(c*p.x+s*p.z,p.y*iD.w,-s*p.x+c*p.z);gl_Position=projectionMatrix*modelViewMatrix*vec4(iP+p,1.);}';
const FS_T='uniform sampler2D map;varying vec2 vU;varying vec3 vC;varying float vA;void main(){vec4 t=texture2D(map,vU);gl_FragColor=vec4(vC*t.rgb,t.a*vA);if(gl_FragColor.a<.004)discard;\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}';
const FS_C='varying vec2 vU;varying vec3 vC;varying float vA;void main(){gl_FragColor=vec4(vC*pow(1.-vU.y,2.)*.4*vA,1.);\n#include <tonemapping_fragment>\n#include <encodings_fragment>\n}';
function batch(base,vs,fs,map,add,order){const G=new T.InstancedBufferGeometry();G.index=base.index;G.setAttribute('position',base.attributes.position);G.setAttribute('uv',base.attributes.uv);
 const iP=new T.InstancedBufferAttribute(new Float32Array(MAXN*3),3),iD=new T.InstancedBufferAttribute(new Float32Array(MAXN*4),4),iC=new T.InstancedBufferAttribute(new Float32Array(MAXN*3),3);[iP,iD,iC].forEach(a=>a.setUsage(T.DynamicDrawUsage));G.setAttribute('iP',iP);G.setAttribute('iD',iD);G.setAttribute('iC',iC);G.instanceCount=0;
 const M=new T.ShaderMaterial({uniforms:map?{map:{value:map}}:{},vertexShader:vs,fragmentShader:fs,transparent:true,depthWrite:false,blending:add?T.AdditiveBlending:T.NormalBlending,side:map?T.FrontSide:T.DoubleSide});
 const m=new T.Mesh(G,M);m.frustumCulled=false;m.renderOrder=order||0;m.userData.n=0;m.userData.put=(p,size,rot,a,col,h)=>{const n=m.userData.n;if(n>=MAXN)return;iP.setXYZ(n,p.x,p.y,p.z);iD.setXYZW(n,size,rot,a,h==null?1:h);iC.setXYZ(n,col.r,col.g,col.b);m.userData.n=n+1;};
 m.userData.flush=()=>{G.instanceCount=m.userData.n;m.visible=m.userData.n>0;iP.needsUpdate=iD.needsUpdate=iC.needsUpdate=true;m.userData.n=0;};return m;}
let B=null;const E=new Map();
function mkB(){const pl=new T.PlaneGeometry(1,1),fl=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2),cy=new T.CylinderGeometry(.75,.9,1.5,16,1,true).translate(0,.75,0);
 B={glow:batch(pl,VS_B,FS_T,tGlow(),1,3),ring:batch(pl,VS_B,FS_T,tRing(),0,3),rays:batch(pl,VS_B,FS_T,tRays(),1,3),foot:batch(fl,VS_F,FS_T,tFoot(),1,2),fring:batch(fl,VS_F,FS_T,tRing(),0,2),col:batch(cy,VS_F,FS_C,null,1,2)};
 const hk=new T.Mesh(new T.BufferGeometry(),new T.MeshBasicMaterial());hk.frustumCulled=false;hk.onBeforeRender=(r,sc,cam)=>upd(r,cam);B.hook=hk;B.list=[hk,B.glow,B.ring,B.rays,B.foot,B.fring,B.col];}
// 게임이 알려주는 것: 내 캐릭터, 낚싯줄, 찌, 낚시 상태
let CTX=null;FX.ctx=o=>{CTX=o;};
FX.attach=function(c,g){if(!g||!g.userData.fxT||!c||!c.o){E.delete(c);return;}if(!B)mkB();const sc=c.o.parent;if(sc&&B.hook.parent!==sc)B.list.forEach(m=>sc.add(m));
 const k=g.userData.fxK,t=g.userData.fxT;E.set(c,{c,g,t,C:PAL[k],S:SC[t],col:{glow:new T.Color(PAL[k].glow),ring:new T.Color(PAL[k].glow),foot:new T.Color(PAL[k].glow).lerp(new T.Color('#ffffff'),.35),metal:new T.Color(PAL[k].metal)},b:0,fade:1,me:null});};
FX.bench=(r,cam,N)=>{const t0=new Date().getTime();for(let i=0;i<N;i++)upd(r,cam,1);return (new Date().getTime()-t0)/N;};
FX.detach=c=>{const e=E.get(c);if(e&&e.me)e.me.dispose();E.delete(c);};
// 내 낚싯대 전용 효과 (대 주변 입자 · 줄 반짝임 · 찌 꼬리)
function mine(e){const t=e.t,C=e.C,g=e.g,L=(P[g.userData.fxK]||P.bamboo).len,sc=e.c.o.parent;const o={};
 if(t>=2){const N=t===2?12:22,pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(new Float32Array(N*3),3));o.pts=new T.Points(pg,new T.PointsMaterial({map:tDot(),color:C.glow,size:t===2?.22:.28,transparent:true,depthWrite:false,opacity:.95}));o.pts.frustumCulled=false;g.add(o.pts);o.pd=[];for(let i=0;i<N;i++)o.pd.push({y:Math.random()*L,a:Math.random()*6.28,r:.08+Math.random()*.16,v:.25+Math.random()*.3});}
 const NP=6+2*t,lg=new T.BufferGeometry();lg.setAttribute('position',new T.BufferAttribute(new Float32Array(NP*3),3));o.lp=new T.Points(lg,new T.PointsMaterial({map:tDot(),color:C.glow,size:.14+.03*t,transparent:true,depthWrite:false,opacity:.95}));o.lp.frustumCulled=false;o.lp.visible=false;sc&&sc.add(o.lp);
 const tg=new T.BufferGeometry();tg.setAttribute('position',new T.BufferAttribute(new Float32Array(30),3));tg.setAttribute('sz',new T.BufferAttribute(new Float32Array(10),1));
 o.tr=new T.Points(tg,new T.ShaderMaterial({uniforms:{c:{value:new T.Color(C.glow)},map:{value:tDot()},k:{value:innerHeight*.5}},vertexShader:'attribute float sz;varying float vA;uniform float k;void main(){vA=sz;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=k*.16*sz/-mv.z;gl_Position=projectionMatrix*mv;}',fragmentShader:'uniform vec3 c;uniform sampler2D map;varying float vA;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(mix(c,vec3(1.),.35),t.a*vA);\n#include <encodings_fragment>\n}',transparent:true,depthWrite:false}));o.tr.frustumCulled=false;o.tr.visible=false;sc&&sc.add(o.tr);o.trH=[];o.L=L;
 o.dispose=()=>{[o.lp,o.tr].forEach(m=>{if(m.parent)m.parent.remove(m);m.geometry.dispose();m.material.dispose();});if(o.pts){if(o.pts.parent)o.pts.parent.remove(o.pts);o.pts.geometry.dispose();o.pts.material.dispose();}};return o;}
let LINE0=null;function lineTint(col){const ln=CTX&&CTX.line&&CTX.line();if(!ln)return;if(!col&&!LINE0)return;if(!ln.userData.m0){ln.userData.m0=ln.material;ln.material=ln.material.clone();}/* 다른 사람 줄(rfMake)은 원래 재질(m0)을 같이 써요 → 내 줄만 물들여요 */if(!LINE0)LINE0=[ln.material.color.clone(),ln.material.opacity];if(col){ln.material.color.copy(col);ln.material.opacity=1;}else{ln.material.color.copy(LINE0[0]);ln.material.opacity=LINE0[1];}}
// 화면 위 버튼(소원 돛단배 등) 뒤로 광륜이 지나가면 흐리게
let UIR=[],uiT=-1;const UISEL='[id^="wishBtn"],#hudTop,.hudTop';function uiRects(now){if(now-uiT<400)return UIR;uiT=now;UIR=[];try{document.querySelectorAll(UISEL).forEach(el=>{if(!el.offsetParent&&getComputedStyle(el).position!=='fixed')return;const r=el.getBoundingClientRect();if(r.width>0&&r.height>0)UIR.push(r);});}catch(_){}return UIR;}
const RK=[],v1=new T.Vector3(),v2=new T.Vector3(),fr=new T.Frustum(),pm=new T.Matrix4(),sph=new T.Sphere(),WHITE=new T.Color('#ffffff');let lastF=-1,lastT=-1;
function wvis(o){for(let p=o;p;p=p.parent){if(!p.visible)return false;if(p.isScene)return true;}return false;}
function upd(r,cam,force){const f=r.info.render.frame;if(f===lastF&&!force)return;lastF=f;const a1=FX.clock?FX.clock():0;const a0=performance.now(),tm=a0/1000,dt=lastT<0?.016:Math.min(.1,Math.max(0,tm-lastT));lastT=tm;
 pm.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse);fr.setFromProjectionMatrix(pm);const meC=CTX&&CTX.me&&CTX.me(),fs=CTX&&CTX.fishing&&CTX.fishing();
 const H=r.domElement.clientHeight||innerHeight,W=r.domElement.clientWidth||innerWidth,ty=Math.tan((cam.fov||50)*Math.PI/360),UI=uiRects(a0);let myE=null,n=0;
 let rk=0;RK.length=0;for(const [c,e] of E){if(c===meC||c.dead||c.rodMdl!==e.g||!e.g.parent)continue;e.g.userData.tip.getWorldPosition(v1);e.dd=v1.distanceTo(cam.position);RK.push(e);}RK.sort((a,b)=>a.dd-b.dd);RK.forEach((e,i)=>e.rank=i);
 for(const [c,e] of E){const g=e.g;if(c.dead||c.rodMdl!==g||!g.parent){if(e.me)e.me.dispose();E.delete(c);continue;}
  const isMe=c===meC;if(isMe)myE=e;else if(e.me){e.me.dispose();e.me=null;}
  if(!wvis(g)){if(e.me){e.me.lp.visible=e.me.tr.visible=false;}continue;}
  const tip=g.userData.tip;tip.getWorldPosition(v1);const d=v1.distanceTo(cam.position);
  if(!isMe&&d>FX.far)continue;sph.center.copy(v1);sph.radius=e.S.haloW;const inH=fr.intersectsSphere(sph);c.o.getWorldPosition(v2);sph.center.copy(v2);sph.radius=e.S.ring;const inF=fr.intersectsSphere(sph);if(!inH&&!inF&&!isMe)continue;n++;
  const fb=isMe&&fs&&fs.state==='bite'?1:0;e.b+=(fb-e.b)*Math.min(1,dt*8);const b=e.b,p=.5+.5*Math.sin(tm*2.2+(e.ph||(e.ph=Math.random()*6)));
  // 광륜이 화면 위 버튼과 겹치면 흐리게
  let fade=1;if(inH&&UI.length){v2.copy(v1).project(cam);const sx=(v2.x+1)/2*W,sy=(1-v2.y)/2*H,rp=e.S.haloW*.5/(d*ty)*H/2;for(const q of UI){const cx=Math.max(q.left,Math.min(sx,q.right)),cy=Math.max(q.top,Math.min(sy,q.bottom));if(Math.hypot(sx-cx,sy-cy)<rp*.85){fade=.22;break;}}}
  e.fade+=(fade-e.fade)*Math.min(1,dt*10);const F=e.fade,lite=!isMe,nearO=lite&&e.rank<FX.nearN,hw=e.S.haloW*(isMe?1:nearO?.72:.5);
  if(inH){B.glow.userData.put(v1,hw*(1+.06*p+b*.35)*(.75+.25*F),0,(.7+.2*p+b*.3)*.9*F,e.col.glow);if(!lite||nearO)B.ring.userData.put(v1,hw*(e.t===1?.55:.62)*(.8+.2*F),tm*.4,(e.t===1?.7:.95)*F,e.col.ring);if(e.t>=3&&!lite)B.rays.userData.put(v1,hw*1.15*(.7+.3*F),-tm*.25,(.55+.25*p+b*.2)*.75*F,e.col.glow);}
  if(inF&&(!lite||nearO)){c.o.getWorldPosition(v2);v2.y+=.03;B.foot.userData.put(v2,e.S.foot*(lite?.8:1),tm*.3,Math.min(1,(.8+.2*Math.sin(tm*1.6))*(1+b*.3)),e.col.foot);v2.y+=.015;if(!lite)B.fring.userData.put(v2,e.S.ring,-tm*.2,.8,e.col.metal);if(e.t>=3&&!lite){v2.y-=.015;B.col.userData.put(v2,1,0,1,e.col.glow,1);}}
  if(isMe){if(!e.me)e.me=mine(e);const o=e.me;
   if(o.pts){const pa=o.pts.geometry.attributes.position.array;o.pd.forEach((q,i)=>{q.y+=dt*q.v*(1+b);if(q.y>o.L+.3){q.y=o.L*.2;q.a=Math.random()*6.28;}q.a+=dt*.8;pa[i*3]=Math.cos(q.a)*q.r;pa[i*3+1]=q.y;pa[i*3+2]=Math.sin(q.a)*q.r;});o.pts.geometry.attributes.position.needsUpdate=true;}
   const ln=CTX&&CTX.line&&CTX.line();if(ln&&ln.visible){const P2=ln.geometry.attributes.position,a=o.lp.geometry.attributes.position.array,m=a.length/3,ax=P2.getX(0),ay=P2.getY(0),az=P2.getZ(0),bx=P2.getX(1)-ax,by=P2.getY(1)-ay,bz=P2.getZ(1)-az;o.lp.visible=true;for(let i=0;i<m;i++){const q=(tm*.4+i/m)%1;a[i*3]=ax+bx*q;a[i*3+1]=ay+by*q;a[i*3+2]=az+bz*q;}o.lp.geometry.attributes.position.needsUpdate=true;}else o.lp.visible=false;
   const bob=CTX&&CTX.bob&&CTX.bob();if(bob&&bob.visible){const l0=o.trH[0];o.trH.unshift(!l0||l0.distanceTo(bob.position)>.02?bob.position.clone():l0.clone());}else o.trH.length=0;if(o.trH.length>10)o.trH.length=10;
   const mv=o.trH.length>3&&o.trH[0].distanceTo(o.trH[3])>.15;o.tr.visible=mv;if(mv){const ta=o.tr.geometry.attributes.position.array,ts=o.tr.geometry.attributes.sz.array;for(let i=0;i<10;i++){const h=o.trH[Math.min(i,o.trH.length-1)];ta[i*3]=h.x;ta[i*3+1]=h.y;ta[i*3+2]=h.z;ts[i]=(1-i/10)*(1-i/10);}o.tr.material.uniforms.k.value=H*.5;o.tr.geometry.attributes.position.needsUpdate=true;o.tr.geometry.attributes.sz.needsUpdate=true;}}}
 lineTint(myE?myE.col.glow:null);
 for(const k of ['glow','ring','rays','foot','fring','col'])B[k].userData.flush();
 const st=FX.stats;if(FX.clock)st.last=FX.clock()-a1;st.ms=st.ms*.95+(performance.now()-a0)*.05;st.n=E.size;st.inst=n;}
})();
