/* 피쉬코지 🛸 네온 UFO (새 탈것 'ufo2' · 기존 UFO는 그대로) — Three.js r147 · 순수 프로시저럴
   사용: const g = NK_UFO2.build(THREE, 'pearl'|'cosmic'|'pastel');  매 프레임: NK_UFO2.tick(g, dt)
   기존 flyUfo 와 같은 약속을 지켜요: userData.seat / pose='sit' / fly=1 / userData.ufo = {lg, lights, bm, base, B, t}
   → 기존 FHOOK(불빛 회전·끌어당김 빛 길이)·빨아들이기 코드가 그대로 동작해요. 크기 배율은 FLY.ufo.sc=1.75 그대로. */
(function(root){
const PAL={
 chrome:{n:'A 펄 실버 · 민트 네온',hull:['#f7f9fb','#dfe6ee'],hullAcc:'#c9f3ea',low:['#c3ccd8','#8e99a8'],seam:'rgba(70,90,110,.55)',trim:'#e3e9ef',trimM:.85,trimR:.22,
  neon:'#58f2d2',neon2:'#5cd6ff',ports:['#6ff7dc','#ffffff','#63d8ff'],core:'#7ffbe6',glass:'#d6f4ff',frame:'#eef2f6',rim:'#9ff6ff',seat:'#f4f6f8',seatAcc:'#58f2d2',tub:'#3a4757',
  holo:'#7ff6ff',beam:'#b4fbff',halo:'#8ff8ee',stars:0,pearl:1},
 cosmic:{n:'B 딥 코스믹 네이비 · 골드 · 오로라',hull:['#2a2f6e','#1a1d48'],hullAcc:'#6b4bc8',low:['#1b1c3e','#0f1028'],seam:'rgba(232,190,90,.55)',trim:'#e9bd52',trimM:.9,trimR:.25,
  neon:'#b48cff',neon2:'#66f0ff',ports:['#7af7ff','#a77dff','#ff7ad6','#7dffb6'],core:'#c8a2ff',glass:'#d9ccff',frame:'#4a4790',rim:'#c9a6ff',seat:'#2c2558',seatAcc:'#e9bd52',tub:'#15142c',
  holo:'#ffd77a',beam:'#cdb2ff',halo:'#b99aff',stars:1,pearl:0},
 pastel:{n:'파스텔 (기존 보유자 호환)',hull:['#c6f1e4','#a6e3d2'],hullAcc:'#ffd1e3',low:['#8fd6c2','#72bfa9'],seam:'rgba(60,120,110,.45)',trim:'#ffffff',trimM:.15,trimR:.4,
  neon:'#ff9ec4',neon2:'#fff2b8',ports:['#fff6e0','#ffc2dc','#fff6e0'],core:'#ffd0e4',glass:'#eafff8',frame:'#ffffff',rim:'#ffd0e4',seat:'#fff8f0',seatAcc:'#ff9ec4',tub:'#5b8f86',
  holo:'#ffb6d5',beam:'#d6ffe9',halo:'#ffd0e4',stars:0,pearl:0}
};
const C={};const cache=(k,f)=>C[k]||(C[k]=f());
function cv(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);return c;}
function envTex(T){return cache('env',()=>{const c=cv(512,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#8fb8e8');g.addColorStop(.42,'#e8f2ff');g.addColorStop(.5,'#ffffff');g.addColorStop(.56,'#9aa9b8');g.addColorStop(1,'#39424e');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='rgba(255,255,255,.95)';x.fillRect(60,40,90,34);x.fillRect(300,30,140,26);x.fillStyle='rgba(255,246,220,.9)';x.fillRect(200,70,60,20);});
 const t=new T.CanvasTexture(c);t.mapping=T.EquirectangularReflectionMapping;t.encoding=T.sRGBEncoding;return t;});}
/* 선체 패널 텍스처: u=둘레, v=단면 */
function panelTex(T,P,k,low){return cache('pt'+k+low,()=>{const c=cv(1024,256,(x,w,h)=>{const [a,b]=low?P.low:P.hull;const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,b);g.addColorStop(1,a);x.fillStyle=g;x.fillRect(0,0,w,h);
  if(P.pearl&&!low){for(let i=0;i<w;i+=4){const hh=(i/w)*360;x.fillStyle=`hsla(${hh},70%,85%,.10)`;x.fillRect(i,0,4,h);}}
  if(P.stars){x.fillStyle=P.hullAcc;x.globalAlpha=.35;const g2=x.createLinearGradient(0,0,w,0);for(let i=0;i<=6;i++)g2.addColorStop(i/6,i%2?P.hullAcc:'rgba(0,0,0,0)');x.fillStyle=g2;x.fillRect(0,h*.15,w,h*.6);x.globalAlpha=1;
   for(let i=0;i<260;i++){const r=Math.random();x.fillStyle=r<.85?'rgba(255,255,255,.75)':'rgba(255,220,140,.95)';const s=r<.95?1.2:2.4;x.fillRect(Math.random()*w,Math.random()*h,s,s);}}
  x.strokeStyle=P.seam;x.lineWidth=2;const NU=low?12:16;for(let i=0;i<NU;i++){const u=i/NU*w;x.beginPath();x.moveTo(u,low?0:h*.18);x.lineTo(u,h);x.stroke();}
  const vs=low?[.22,.5,.78]:[.2,.55,.82];vs.forEach(v=>{x.beginPath();x.moveTo(0,v*h);x.lineTo(w,v*h);x.stroke();});
  /* 리벳 · 통풍구 */x.fillStyle=P.seam;for(let i=0;i<NU;i++){const u=(i+.5)/NU*w;for(const v of vs){x.beginPath();x.arc(u-26,v*h+6,2.2,0,7);x.arc(u+26,v*h+6,2.2,0,7);x.fill();}
   if(!low&&i%2===0){for(let j=0;j<4;j++)x.fillRect(u-14,h*.62+j*7,28,3);} if(low&&i%3===0){x.fillRect(u-20,h*.32,40,4);x.fillRect(u-20,h*.38,40,4);}}
  if(!low){x.fillStyle=P.neon;x.globalAlpha=.85;for(let i=0;i<NU;i++){const u=(i+.5)/NU*w;x.fillRect(u-3,h*.88,6,10);}x.globalAlpha=1;}});
 const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.wrapS=T.RepeatWrapping;t.anisotropy=4;return t;});}
function holoTex(T,P,k){return cache('ho'+k,()=>{const c=cv(512,256,(x,w,h)=>{x.fillStyle='#000';x.fillRect(0,0,w,h);x.strokeStyle=x.fillStyle=P.holo;x.lineWidth=4;x.globalAlpha=.9;
  x.strokeRect(6,6,w-12,h-12);x.beginPath();x.arc(w*.25,h*.5,70,0,Math.PI*1.6);x.stroke();x.beginPath();x.arc(w*.25,h*.5,48,0,7);x.stroke();x.beginPath();x.moveTo(w*.25,h*.5);x.lineTo(w*.25+44,h*.5-30);x.stroke();
  for(let i=0;i<6;i++){x.globalAlpha=.5+.08*i;x.fillRect(w*.52,h*.22+i*26,40+((i*53)%140),14);}x.globalAlpha=.9;x.font='bold 30px sans-serif';x.fillText('FISH ◎ 128m',w*.52,h*.92);
  x.globalAlpha=.25;for(let y=0;y<h;y+=6)x.fillRect(0,y,w,2);});const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;});}
function beamTex(T){return cache('bt',()=>{const c=cv(64,256,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#ffffff');g.addColorStop(.35,'#9a9a9a');g.addColorStop(1,'#262626');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(255,255,255,.35)';for(let y=10;y<h;y+=22)x.fillRect(0,y,w,5);});const t=new T.CanvasTexture(c);t.wrapS=T.RepeatWrapping;return t;});}
function haloTex(T){return cache('hl',()=>{const c=cv(256,256,(x,w,h)=>{const g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.45,'rgba(255,255,255,.35)');g.addColorStop(.72,'rgba(255,255,255,.6)');g.addColorStop(.8,'rgba(255,255,255,.15)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h);});return new T.CanvasTexture(c);});}
/* 지오메트리 합치기 (BufferGeometryUtils 없이) */
function tf(T,geo,p,r,s){const m=new T.Matrix4().compose(new T.Vector3(...(p||[0,0,0])),new T.Quaternion().setFromEuler(new T.Euler(...(r||[0,0,0]),'YXZ')),new T.Vector3(...(s||[1,1,1])));geo.applyMatrix4(m);return geo;}
function merge(T,list){const G=list.map(g=>g.index?g.toNonIndexed():g);let n=0;G.forEach(g=>n+=g.attributes.position.count);const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let o=0;
 G.forEach(g=>{pos.set(g.attributes.position.array,o*3);if(g.attributes.normal)nor.set(g.attributes.normal.array,o*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count;g.dispose&&g.dispose();});
 const out=new T.BufferGeometry();out.setAttribute('position',new T.BufferAttribute(pos,3));out.setAttribute('normal',new T.BufferAttribute(nor,3));out.setAttribute('uv',new T.BufferAttribute(uv,2));out.computeBoundingSphere();return out;}
const V2=(T,a)=>a.map(q=>new T.Vector2(q[0],q[1]));

function build(T,cc){if(cc==='pearl')cc='chrome';cc=PAL[cc]?cc:'chrome';const P=PAL[cc],g=new T.Group();g.name='ufo2';const env=envTex(T);
 const M=(k,f)=>cache('m'+cc+k,f);
 const hullM=M('hull',()=>new T.MeshStandardMaterial({map:panelTex(T,P,cc,0),metalness:P.stars?.55:.45,roughness:P.stars?.32:.2,envMap:env,envMapIntensity:P.stars?.8:1.1}));
 const lowM=M('low',()=>new T.MeshStandardMaterial({map:panelTex(T,P,cc,1),metalness:.6,roughness:.3,envMap:env,envMapIntensity:.9}));
 const trimM=M('trim',()=>new T.MeshStandardMaterial({color:P.trim,metalness:P.trimM,roughness:P.trimR,envMap:env,envMapIntensity:1.2}));
 const neonM=M('neon',()=>new T.MeshStandardMaterial({color:P.neon,emissive:P.neon,emissiveIntensity:1.1,roughness:.4}));
 const neon2M=M('neon2',()=>new T.MeshStandardMaterial({color:P.neon2,emissive:P.neon2,emissiveIntensity:1.0,roughness:.4}));
 const coreM=new T.MeshStandardMaterial({color:P.core,emissive:P.core,emissiveIntensity:1.3,roughness:.2,transparent:true,opacity:.95});
 const tubM=M('tub',()=>new T.MeshStandardMaterial({color:P.tub,metalness:.3,roughness:.6,side:T.DoubleSide}));
 const seatM=M('seat',()=>new T.MeshStandardMaterial({color:P.seat,metalness:.05,roughness:.55}));
 const glassM=M('glass',()=>{const m=new T.MeshStandardMaterial({color:P.glass,transparent:true,opacity:.14,roughness:.04,metalness:.2,envMap:env,envMapIntensity:1.6,depthWrite:false,side:T.DoubleSide});
  /* 가장자리일수록 진해지는 유리 (프레넬 느낌) */const rc=new T.Color(P.rim);m.onBeforeCompile=sh=>{sh.uniforms.uRim={value:rc};sh.fragmentShader='uniform vec3 uRim;\n'+sh.fragmentShader.replace('#include <output_fragment>','float fr=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.2);diffuseColor.a=mix(diffuseColor.a,.72,fr);outgoingLight+=uRim*fr*.55;\n#include <output_fragment>');};m.customProgramCacheKey=()=>'ufo2glass'+cc;return m;});
 const holoM=M('holo',()=>new T.MeshBasicMaterial({map:holoTex(T,P,cc),transparent:true,opacity:.85,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));
 const portM=M('port',()=>new T.MeshBasicMaterial({color:'#ffffff'}));
 const add=(geo,mat,ro)=>{const m=new T.Mesh(geo,mat);if(ro)m.renderOrder=ro;g.add(m);return m;};
 const SEG=48;
 /* 1 선체: 상부 갑판 / 하부 선체 (부드러운 곡면) */
 const upP=[[1.34,0],[1.335,.022],[1.3,.045],[1.22,.07],[1.17,.082],[1.045,.118],[1.03,.135],[1.015,.152],[.95,.172],[.86,.196],[.78,.217],[.73,.232],[.7,.246]];
 const loP=[[.3,-.335],[.5,-.322],[.7,-.28],[.9,-.205],[.99,-.172],[1.01,-.14],[1.13,-.112],[1.25,-.06],[1.315,-.02],[1.34,0]];
 add(new T.LatheGeometry(V2(T,upP),SEG),hullM);add(new T.LatheGeometry(V2(T,loP),SEG),lowM);
 /* 조종석 안쪽 */
 add(new T.LatheGeometry(V2(T,[[0,.03],[.48,.03],[.6,.07],[.67,.16],[.7,.246]]),40),tubM);
 /* 2 금속 트림 한 덩어리: 조종석 테두리 · 홈 링 · 갑판 리브 · 센서 핀 · 캐노피 프레임 · 안테나 · 하부 리액터 하우징 · 추진 포드 */
 const tr=[];tr.push(tf(T,new T.TorusGeometry(.705,.032,8,SEG),[0,.248,0],[Math.PI/2,0,0]));tr.push(tf(T,new T.TorusGeometry(1.19,.011,4,SEG),[0,.078,0],[Math.PI/2,0,0]));
 tr.push(tf(T,new T.TorusGeometry(1.012,.014,4,SEG),[0,-.142,0],[Math.PI/2,0,0]));
 const NR=16,sl=Math.atan2(.118-.082,1.17-1.045);for(let i=0;i<NR;i++){const a=(i+.5)/NR*Math.PI*2,rm=1.105,L=.13;const b=tf(T,new T.BoxGeometry(.03,.022,L),[0,0,0],[sl,0,0]);b.applyMatrix4(new T.Matrix4().makeRotationY(a+Math.PI/2));b.translate(Math.cos(a)*rm,.112,-Math.sin(a)*rm);tr.push(b);}
 const pinA=[Math.PI*.25,Math.PI*.75,Math.PI*1.25,Math.PI*1.75];pinA.forEach(a=>{tr.push(tf(T,new T.CylinderGeometry(.01,.016,.12,6),[Math.cos(a)*.93,.235,Math.sin(a)*.93]));});
 /* 캐노피 (뒤쪽 반구 · 앞은 열려 있어 낚싯대가 걸리지 않아요) */
 const CR=.845,CY=.19,CZ=-.13,CS=1.58;tr.push(tf(T,new T.TorusGeometry(CR+.01,.02,6,SEG),[0,CY+.005,0],[Math.PI/2,0,0]));
 const fr=[tf(T,new T.TorusGeometry(CR,.022,8,48,Math.PI),[0,CY,CZ],[0,0,0],[1,CS,1])];
 {const q=new T.TorusGeometry(CR,.014,6,24,Math.PI/2);q.scale(1,CS,1);q.rotateY(Math.PI/2);q.translate(0,CY,CZ);fr.push(q);}
 const ANT=[-.42,.42].map(o=>{const a=-Math.PI/2+o,r=.98;return [Math.cos(a)*r,Math.sin(a)*r];});ANT.forEach(([x,z])=>{tr.push(tf(T,new T.CylinderGeometry(.009,.016,.46,6),[x*1.06,.38,z*1.06],[-.38,0,x*-.45]));tr.push(tf(T,new T.CylinderGeometry(.035,.045,.03,10),[x,.16,z]));});
 tr.push(tf(T,new T.TorusGeometry(.33,.045,6,32),[0,-.335,0],[Math.PI/2,0,0]));
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;tr.push(tf(T,new T.LatheGeometry(V2(T,[[0,-.07],[.07,-.065],[.1,-.02],[.09,.03],[0,.05]]),12),[Math.cos(a)*.8,-.27,Math.sin(a)*.8]));}
 add(merge(T,tr),trimM);const frM=M('frame',()=>new T.MeshStandardMaterial({color:P.frame,metalness:.8,roughness:.2,envMap:env,envMapIntensity:1.2}));
 /* 3 네온 한 덩어리: 외곽 에너지 링 · 센서 핀 끝 · 안테나 끝 */
 const ne=[tf(T,new T.TorusGeometry(1.343,.026,6,80),[0,0,0],[Math.PI/2,0,0])];
 pinA.forEach(a=>ne.push(tf(T,new T.SphereGeometry(.026,8,6),[Math.cos(a)*.93,.3,Math.sin(a)*.93])));
 ANT.forEach(([x,z])=>ne.push(tf(T,new T.SphereGeometry(.032,8,6),[x*1.12-x*.0,.6,z*1.12-.0])));
 add(merge(T,ne),neonM);
 /* 4 조종석 홈 안쪽 링 · 추진 포드 빛 */
 const n2=[tf(T,new T.TorusGeometry(.68,.012,4,SEG),[0,.205,0],[Math.PI/2,0,0]),tf(T,new T.TorusGeometry(1.03,.009,4,SEG),[0,.142,0],[Math.PI/2,0,0])];for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4;n2.push(tf(T,new T.CircleGeometry(.065,16),[Math.cos(a)*.8,-.342,Math.sin(a)*.8],[Math.PI/2,0,0]));}
 add(merge(T,n2),neon2M);
 /* 5 순차 발광 포트 (인스턴스 1개 = 24개 불빛) */
 const lg=new T.Group();g.add(lg);const NP=24,pg=new T.SphereGeometry(.045,8,5);pg.scale(.55,1,1.25);const ports=new T.InstancedMesh(pg,portM,NP);const dm=new T.Object3D();
 const pr=1.175,py=-.088,nrm=Math.atan2(.06,.12);for(let i=0;i<NP;i++){const a=i/NP*Math.PI*2;dm.position.set(Math.cos(a)*pr,py,-Math.sin(a)*pr);dm.rotation.set(0,a,-nrm);dm.updateMatrix();ports.setMatrixAt(i,dm.matrix);ports.setColorAt(i,new T.Color(P.ports[i%P.ports.length]));}
 ports.instanceMatrix.needsUpdate=true;lg.add(ports);
 /* 6 조종석: 의자 · 팔걸이 · 계기판 */
 const se=[tf(T,new T.BoxGeometry(.5,.07,.4),[0,.1,-.06]),tf(T,new T.CapsuleGeometry(.22,.06,4,12),[0,.32,-.3],[-.16,0,0],[1.1,1,.32]),
  tf(T,new T.BoxGeometry(.07,.06,.34),[-.3,.22,-.08]),tf(T,new T.BoxGeometry(.07,.06,.34),[.3,.22,-.08]),tf(T,new T.CylinderGeometry(.08,.12,.06,12),[0,.05,-.06])];add(merge(T,se),seatM);
 const sa=[tf(T,new T.BoxGeometry(.03,.3,.09),[-.17,.32,-.26],[-.16,0,0]),tf(T,new T.BoxGeometry(.03,.3,.09),[.17,.32,-.26],[-.16,0,0]),tf(T,new T.BoxGeometry(.48,.012,.36),[0,.138,-.06])];const seatAccM=M('sacc',()=>new T.MeshStandardMaterial({color:P.seatAcc,emissive:P.seatAcc,emissiveIntensity:.35,roughness:.5}));add(merge(T,sa),seatAccM);
 const coG=[tf(T,new T.CylinderGeometry(.64,.64,.08,24,1,false,-.7,1.4),[0,.2,0]),tf(T,new T.CylinderGeometry(.6,.6,.12,24,1,true,-.7,1.4),[0,.12,0])];add(merge(T,coG),tubM);
 const ho=[tf(T,new T.CylinderGeometry(.655,.67,.075,32,1,true,-.62,1.24),[0,.3,0])];
 const holo=add(merge(T,ho),holoM,4);
 /* 7 유리: 뒤쪽 반구 캐노피 + 앞쪽 낮은 바람막이 */
 const gl=[tf(T,new T.SphereGeometry(CR-.004,36,14,Math.PI,Math.PI,0,Math.PI/2),[0,CY,CZ],[0,0,0],[1,CS,1]),tf(T,new T.CylinderGeometry(.76,.71,.13,32,1,true,-.95,1.9),[0,.31,0])];
 add(merge(T,gl),glassM,3);add(merge(T,fr),frM);
 /* 8 하부: 반중력 리액터 코어 + 떠 있는 고리 2개 */
 const core=add(tf(T,new T.SphereGeometry(.27,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2),[0,-.3,0],[0,0,0],[1,.55,1]),coreM);
 const rgM=M('ring',()=>new T.MeshBasicMaterial({color:P.neon2,transparent:true,opacity:.75,blending:T.AdditiveBlending,depthWrite:false}));
 const rA=new T.Mesh(merge(T,[tf(T,new T.TorusGeometry(.46,.012,4,40),[0,0,0],[Math.PI/2,0,0]),...[0,1,2].map(i=>tf(T,new T.BoxGeometry(.09,.012,.024),[Math.cos(i*2.09)*.46,0,Math.sin(i*2.09)*.46],[0,-i*2.09,0]))]),rgM);rA.position.y=-.42;g.add(rA);
 const rB=new T.Mesh(merge(T,[tf(T,new T.TorusGeometry(.6,.009,4,48),[0,0,0],[Math.PI/2,0,0]),...[0,1,2,3].map(i=>tf(T,new T.BoxGeometry(.08,.01,.02),[Math.cos(i*1.57)*.6,0,Math.sin(i*1.57)*.6],[0,-i*1.57,0]))]),rgM);rB.position.y=-.47;g.add(rB);
 /* 9 끌어당김 빛 (기존 코드가 길이를 맞춰요: 원통 · y 아래로 1) */
 const bg=new T.CylinderGeometry(.3,.95,1,32,1,true);bg.translate(0,-.5,0);const bm=new T.Mesh(bg,new T.MeshBasicMaterial({color:P.beam,map:beamTex(T),transparent:true,opacity:.22,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide}));bm.position.y=-.33;bm.visible=false;bm.renderOrder=2;
 /* 10 수면 빛 고리 (날 때만 · 물/땅 높이에 붙어요) */
 const gnd=new T.Group();gnd.visible=false;const hm=new T.MeshBasicMaterial({color:P.halo,map:haloTex(T),transparent:true,opacity:.55,blending:T.AdditiveBlending,depthWrite:false});
 const h1=new T.Mesh(new T.CircleGeometry(1,40),hm);h1.rotation.x=-Math.PI/2;gnd.add(h1);const h2m=new T.MeshBasicMaterial({color:P.halo,transparent:true,opacity:.5,blending:T.AdditiveBlending,depthWrite:false});const h2=new T.Mesh(new T.RingGeometry(.92,1,48),h2m);h2.rotation.x=-Math.PI/2;gnd.add(h2);h1.renderOrder=h2.renderOrder=2;
 g.userData.seat=[0,.13,-.04];g.userData.pose='sit';g.userData.fly=1;
 g.userData.ufo={lg,lights:[],bm,base:P.ports,B:cc==='pastel',t:Math.random()*9};
 g.userData.ufo2={P,ports,NP,rA,rB,core,coreM,holo,gnd,h1,h2,bm,t:0,col:new T.Color()};
 return g;}
/* 매 프레임 (기존 FHOOK 에 한 줄 추가) */
function tick(g,dt,H){const U=g.userData.ufo2;if(!U)return;U.t+=dt;const t=U.t,P=U.P;
 for(let i=0;i<U.NP;i++){const k=.35+.65*Math.pow(Math.max(0,Math.sin(t*3.2-i*.52)),2);U.col.set(P.ports[i%P.ports.length]).multiplyScalar(.45+k*.9);U.ports.setColorAt(i,U.col);}U.ports.instanceColor.needsUpdate=true;
 U.rA.rotation.y=t*.9;U.rB.rotation.y=-t*.55;U.coreM.emissiveIntensity=1.1+.35*Math.sin(t*2.4);U.holo.material.opacity=.72+.12*Math.sin(t*7)+.06*Math.sin(t*23);
 const air=!!(U.bm.visible&&U.bm.parent);if(U.gnd.parent!==g)g.add(U.gnd);U.gnd.visible=air;
 if(air){g.updateMatrixWorld();const wy=g.matrixWorld.elements[13],sc=g.scale.y||1,gy=H?H():.06;U.gnd.position.y=(gy+.03-wy)/sc;const hgt=Math.max(.5,wy-gy);const rad=Math.min(2.6,.9+hgt*.08);U.h1.scale.setScalar(rad);const f=(t*.45)%1;U.h2.scale.setScalar(rad*(.6+f*.9));U.h2.material.opacity=.55*(1-f);U.h1.material.opacity=.45+.1*Math.sin(t*3);}}
const api={build,tick,PAL};root.NK_UFO2=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
