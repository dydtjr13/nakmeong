// v201: 🎄 크리스마스 한정 캐릭터 3종 — 반짝코 루돌프 · 선물자루 산타 · 눈송이 눈사람 (시안 B v2 확정 모양)
// 동물 블록 빌더(chars-v18)와 같은 규칙: 발밑 원점, 'arm-right'·'head'·'leg' 이름 노드. chars-v18.js 바로 뒤, chars-round-v29.js 앞에 불러요.
// 얻는 방법은 xmas-ev-v201.js (12월 이벤트). 여기서는 모양만 만들어요.
(function(){if(!window.NK_CHARS||!window.THREE||window.NK_XMAS)return;
const BoxG=THREE.BoxGeometry,ConeG=THREE.ConeGeometry,CylG=THREE.CylinderGeometry; // v2: 원본 생성자(분할 수 그대로 쓰려고)
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:new THREE.Color(c).convertSRGBToLinear(),roughness:.85,metalness:0,flatShading:true},o));
const mesh=(g,c,p,x=0,y=0,z=0,mo)=>{const m=new THREE.Mesh(g,M(c,mo));m.position.set(x,y,z);m.castShadow=true;if(p)p.add(m);return m;};
const box=(w,h,d,c,p,x,y,z,mo)=>mesh(new THREE.BoxGeometry(w,h,d),c,p,x,y,z,mo);
// v2: 모서리가 둥근 상자(털 테두리·목걸이용)
function rboxG(w,h,d,r){const g=new BoxG(w,h,d,6,4,6),a=g.attributes.position,v=new THREE.Vector3(),c=new THREE.Vector3(),I=new THREE.Vector3(w/2-r,h/2-r,d/2-r),nI=I.clone().negate();for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i);c.copy(v).clamp(nI,I);v.sub(c);if(v.lengthSq()>0)v.normalize().multiplyScalar(r);v.add(c);a.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();return g;}
const rbox=(w,h,d,r,c,p,x,y,z,mo)=>mesh(rboxG(w,h,d,r),c,p,x,y,z,mo);
// v2: 몸(타원체)에 딱 맞는 띠 — 위·아래 높이에서 몸 둘레를 계산해 원뿔대로(뜨지도 파묻히지도 않게)
function band(p,c,cx,cy,cz,rx,ry,rz,y0,y1,pad,mo){const k=y=>Math.sqrt(Math.max(0,1-((y-cy)/ry)**2));const yb=Math.min(y0,y1),yt=Math.max(y0,y1),ym=(yb+yt)/2;let kb=k(yb),kt=k(yt),km=k(ym);const lin=(kb+kt)/2,bul=Math.max(0,km-lin);const rT=rx*kt+pad+bul*rx,rB=rx*kb+pad+bul*rx;const m=new THREE.Mesh(new CylG(rT,rB,yt-yb,28),M(c,mo));m.scale.z=rz/rx;m.position.set(cx,ym,cz);m.castShadow=true;p.add(m);return m;}
// v2: 끝이 휘는 매끈한 원뿔(산타 모자) — 밑면은 평평하게 두고 위로 갈수록 옆으로 휘어요. 끝 좌표를 돌려줘요
function bentCone(p,c,rx,rz,h,bx,bz,x,y,z){const g=new ConeG(1,h,24,8),a=g.attributes.position;for(let i=0;i<a.count;i++){const yy=a.getY(i),t=(yy+h/2)/h,e=t*t;a.setXYZ(i,a.getX(i)*rx+bx*e,yy+h/2,a.getZ(i)*rz+bz*e);}g.computeVertexNormals();const m=new THREE.Mesh(g,M(c));m.position.set(x,y,z);m.castShadow=true;p.add(m);return new THREE.Vector3(x+bx,y+h,z+bz);}
const ball=(r,c,p,x,y,z,det=1,mo)=>mesh(new THREE.IcosahedronGeometry(r,det),c,p,x,y,z,mo);
const cyl=(r1,r2,h,c,p,x,y,z,s=8,mo)=>mesh(new THREE.CylinderGeometry(r1,r2,h,s),c,p,x,y,z,mo);
const cone=(r,h,c,p,x,y,z,s=4,mo)=>mesh(new THREE.ConeGeometry(r,h,s),c,p,x,y,z,mo);
const tor=(r,t,c,p,x,y,z,arc=Math.PI*2,mo)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,6,20,arc),M(c,mo));m.position.set(x,y,z);m.castShadow=true;p.add(m);return m;};
function eyes(h,y,z,sp=.2,s=1){[-sp,sp].forEach(x=>{box(.1*s,.15*s,.04,'#221a26',h,x,y,z);box(.04*s,.05*s,.02,'#ffffff',h,x+.025*s,y+.04*s,z+.025);});}
function blush(h,y,z,sp=.32,s=1){[-sp,sp].forEach(x=>box(.12*s,.06*s,.02,'#f29a8a',h,x,y,z));}
function legs(g,c,w=.22,h=.34,sp=.2,boot){[-sp,sp].forEach(x=>{const p=new THREE.Group();p.name='leg';p.position.set(x,h,0);g.add(p);box(w,h,w+.04,c,p,0,-h/2,0);if(boot)box(w+.04,h*.42,w+.1,boot,p,0,-h*.79,.03);});}
function arms(g,c,y=.8,cuff,mit){[-.44,.44].forEach(x=>{const a=new THREE.Group();a.position.set(x,y,.02);a.rotation.z=x>0?-.28:.28;g.add(a);box(.18,.36,.2,c,a,0,0,0);if(cuff)box(.2,.08,.22,cuff,a,0,-.15,0);if(mit)box(.17,.12,.19,mit,a,0,-.24,0);});}
// ── 효과용 공용 텍스처/재질 (캐릭터마다 새로 만들지 않아요)
const FX={};function glowTex(){if(FX.gt)return FX.gt;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return FX.gt=new THREE.CanvasTexture(c);}
function flakeTex(){if(FX.ft)return FX.ft;const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d');x.strokeStyle='#fff';x.lineWidth=3;x.lineCap='round';x.translate(16,16);for(let i=0;i<3;i++){x.rotate(Math.PI/3);x.beginPath();x.moveTo(-12,0);x.lineTo(12,0);x.stroke();}const g=x.createRadialGradient(0,0,0,0,0,7);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(-8,-8,16,16);return FX.ft=new THREE.CanvasTexture(c);}
const now=()=>performance.now()/1000;
function glow(p,x,y,z,col,size,pulse){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(),color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));s.position.set(x,y,z);s.scale.setScalar(size);s.renderOrder=5;s.userData.xfx=1;
 if(pulse)s.onBeforeRender=()=>{const t=now(),k=.72+.28*Math.sin(t*3.2);s.material.opacity=.3+.4*k;s.scale.setScalar(size*(.86+.18*k));};p.add(s);return s;}
// 내리는 눈: 캐릭터 둘레 원기둥 안에서 천천히 (점 36개, 그리기 1번)
function snow(p,n=36,R=.95,H=2.6,col='#ffffff',sz=.13){const pos=new Float32Array(n*3),sd=[];for(let i=0;i<n;i++){const a=Math.random()*6.283,r=.25+Math.random()*R;sd.push([a,r,Math.random()*H,.18+Math.random()*.22,Math.random()*6.283]);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.PointsMaterial({map:flakeTex(),color:col,size:sz,transparent:true,depthWrite:false,opacity:.95,sizeAttenuation:true});const pt=new THREE.Points(g,m);pt.frustumCulled=false;pt.userData.xfx=1;
 pt.onBeforeRender=()=>{const t=now();for(let i=0;i<n;i++){const s=sd[i];let y=(s[2]-t*s[3])%H;if(y<0)y+=H;const a=s[0]+Math.sin(t*.6+s[4])*.25;pos[i*3]=Math.cos(a)*s[1]+Math.sin(t+s[4])*.06;pos[i*3+1]=y+.1;pos[i*3+2]=Math.sin(a)*s[1];}g.attributes.position.needsUpdate=true;};p.add(pt);return pt;}
// 반짝이 (금색 별빛 몇 개가 깜빡)
function twinkle(p,pts,col='#ffe9a0',sz=.2){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts.flat(),3));const m=new THREE.PointsMaterial({map:glowTex(),color:col,size:sz,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9});const pt=new THREE.Points(g,m);pt.userData.xfx=1;pt.frustumCulled=false;
 pt.onBeforeRender=()=>{const k=Math.max(0,Math.sin(now()*1.9));m.opacity=.25+.7*k*k;m.size=sz*(.6+.5*k);};p.add(pt);return pt;}

// ── 공용 부품
function antler(h,side,s=1,col='#d9b98c',tines=2,by,bx){const a=new THREE.Group();a.position.set(bx!=null?side*bx:side*.3*s,by!=null?by:.38*s,-.02);a.rotation.z=-side*.32;h.add(a);cyl(.045*s,.06*s,.5*s,col,a,0,.25*s,0,6);
 const t1=cyl(.035*s,.045*s,.28*s,col,a,side*.1*s,.32*s,0,6);t1.rotation.z=-side*1.0;if(tines>1){const t2=cyl(.03*s,.04*s,.24*s,col,a,-side*.07*s,.44*s,0,6);t2.rotation.z=side*.75;}
 if(tines>2){const t3=cyl(.03*s,.04*s,.22*s,col,a,side*.12*s,.12*s,.0,6);t3.rotation.z=-side*1.25;const t4=cyl(.028*s,.036*s,.2*s,col,a,0,.56*s,.06*s,6);t4.rotation.x=.5;}return a;}
function bell(p,x,y,z,r=.07){ball(r,'#f2c230',p,x,y,z,1,{metalness:.55,roughness:.35});box(r*.9,r*.25,r*.4,'#9a7020',p,x,y-r*.55,z+r*.3);}
function holly(p,x,y,z,s=1,rot=0){const g=new THREE.Group();g.position.set(x,y,z);g.rotation.z=rot;p.add(g);[-1,1].forEach(q=>{const l=box(.2*s,.09*s,.03*s,'#2f8a3e',g,q*.1*s,0,0);l.rotation.z=q*.35;});[[-.03,.04],[.04,.05],[0,-.02]].forEach(([a,b])=>ball(.045*s,'#d42a2a',g,a*s,b*s,.03*s,0));return g;}

const BKZ=.449; // v2 산타 버클 중심 z (벨트 앞면에 반쯤 묻히게, 측정으로 맞춤)
// v2 눈사람 B 목도리: 몸(타원체)과 머리(구) 사이 목에 맞춘 원뿔대 + 흰 줄 + 몸을 따라 내려오는 꼬리
function snowScarf(g){const R='#d8332e',W='#ffffff',y0=.99,y1=1.11,rB=.392,rT=.312;const m=new THREE.Mesh(new CylG(rT,rB,y1-y0,28),M(R));m.position.y=(y0+y1)/2;m.castShadow=true;g.add(m);
 [.3,.72].forEach(f=>{const y=y0+(y1-y0)*f,r=rB+(rT-rB)*f+.007,s=new THREE.Mesh(new CylG(r-.003*(1-f),r,.026,28),M(W));s.position.y=y;g.add(s);});
 const t=new THREE.Group();t.position.set(.2,SCT.y,SCT.z);t.rotation.x=SCT.a;g.add(t);box(.17,SCT.L,.06,R,t,0,0,0);[-.3,.3].forEach(f=>box(.175,.03,.065,W,t,0,f*SCT.L,0));[-.055,0,.055].forEach(x=>box(.035,.07,.05,R,t,x,-SCT.L/2-.03,0));}
const SCT={y:.877,z:.479,a:-.67,L:.3};
const AN={
 'xm-rud':g=>{const B='#9a6038',D='#5a3620',C='#f6e8d2';legs(g,D,.2,.34,.18,'#3a2418');box(.7,.62,.5,B,g,0,.66,0);const ch=ball(.26,C,g,0,.74,.2,1);ch.scale.set(1.15,1,.55);arms(g,B,.8,null,'#3a2418');ball(.12,C,g,0,.42,-.3,1);
  rbox(.8,.1,.6,.045,'#c8282a',g,0,.985,0);/*v2 목걸이: 몸 모양(네모)에 맞춘 둥근 띠*/[-.2,0,.2].forEach((x,i)=>bell(g,x,.9-(i===1?.04:0),.32+(i===1?.02:0),i===1?.085:.065));{box(.62,.46,.05,'#c8282a',g,0,.76,-.27);box(.64,.05,.06,'#f2c230',g,0,.54,-.28,{metalness:.4,roughness:.4});box(.64,.05,.06,'#f2c230',g,0,.95,-.28,{metalness:.4,roughness:.4});holly(g,0,.76,-.31,1,0).rotation.y=Math.PI;}/*v2 담요: 등에 딱 붙게(기울기 0)*/
  const h=new THREE.Group();h.position.y=1.4;g.add(h);box(.96,.78,.78,B,h,0,0,0);box(.48,.32,.26,C,h,0,-.18,.45);const n=ball(.14,'#ff3a30',h,0,-.08,.62,1,{emissive:new THREE.Color('#ff2a1a'),emissiveIntensity:.9});
  [-1,1].forEach(q=>{const e=box(.28,.12,.08,B,h,q*.57,.12,0);e.rotation.z=q*.45;box(.17,.07,.03,'#e8b896',h,q*.57,.12,.045).rotation.z=q*.45;antler(h,q,1.35,'#e2c08e',3,.33,.36);const bu=cyl(.1,.125,.09,'#c9a272',h,q*.36,.385,-.02,12);bu.rotation.z=-q*.32;});/*v2 뿔: 밑동을 머리 안(.06)으로 박고 뿌리 받침*/holly(h,-.3,.42,.3,.9,.3);eyes(h,.08,.4,.2,1.05);blush(h,-.1,.4,.33);
  glow(h,0,-.08,.74,'#ff5a3a',.5,true);},
 'xm-san':g=>{const R='#d8332e',W='#ffffff',K='#2a2226',S='#f6d4ba';legs(g,R,.24,.34,.2,K);const bd=ball(.48,R,g,0,.72,.02,1);bd.scale.set(1.0,.82,.86);{const st=ball(.48,W,g,0,.72,.035,1);st.scale.set(.22,.82,.86);}/*v2 앞섶: 몸 곡면을 따라가는 흰 띠*/band(g,K,0,.72,.02,.48,.3936,.4128,.57,.69,.014);/*v2 벨트: 허리 둘레에 맞춘 원뿔대*/rbox(.25,.17,.05,.02,'#f2c230',g,0,.63,BKZ,{metalness:.5,roughness:.35});box(.13,.075,.02,K,g,0,.63,BKZ+.02);cyl(.46,.48,.1,W,g,0,.36,0,14);
  arms(g,R,.86,W,K);const sk=new THREE.Group();sk.position.set(.18,.98,-.42);sk.rotation.set(.2,0,-.35);g.add(sk);const sb=ball(.38,'#8a5a3a',sk,0,0,0,1);sb.scale.set(1,1.15,.8);cyl(.1,.16,.12,'#6a4228',sk,0,.42,0,8);box(.24,.18,.18,'#3ab06a',sk,-.08,.45,.02).rotation.z=.3;box(.2,.03,.19,'#f2c230',sk,-.08,.53,.02).rotation.z=.3;box(.18,.16,.16,'#5a8ad8',sk,.1,.43,-.04).rotation.z=-.2;/*v2 선물: 자루 입구에 꽂히게 낮춤*/
  const h=new THREE.Group();h.position.y=1.42;g.add(h);box(.86,.72,.72,S,h,0,.02,0);const bdd=ball(.44,W,h,0,-.3,.18,1);bdd.scale.set(1.1,.9,.62);[-1,1].forEach(q=>{const m=ball(.14,W,h,q*.13,-.1,.42,1);m.scale.set(1.3,.6,.6);m.rotation.z=q*.25;});
  rbox(.9,.3,.34,.06,W,h,0,.08,-.24);/*v2 뒷머리 모서리 둥글게*/ball(.09,'#f0a090',h,0,.0,.42,1);eyes(h,.14,.37,.2);blush(h,.0,.37,.3);box(.22,.06,.04,W,h,-.2,.27,.37).rotation.z=.1;box(.22,.06,.04,W,h,.2,.27,.37).rotation.z=-.1;{const t=new THREE.Group();t.position.y=.4;h.add(t);rbox(.98,.2,.84,.08,W,t,0,0,0);const tip=bentCone(t,R,.42,.36,.82,.34,-.1,0,.06,-.02);ball(.12,W,t,tip.x-.02,tip.y-.04,tip.z+.005,1);}/*v2 모자: 둥근 털 테두리 + 매끈하게 휘는 원뿔 + 끝에 방울*/},
 'xm-snow':g=>{const W='#f6f9ff';const b=ball(.6,W,g,0,.56,0,1);b.scale.set(1.04,.9,1);const sp=cyl(.62,.66,.08,'#e6eef8',g,0,.03,0,16);
  [.46,.68].forEach(y=>{ball(.055,'#2a2a30',g,0,y,.53,0);});
  [-1,1].forEach(q=>{const a=new THREE.Group();a.position.set(q*.48,.86,0);a.rotation.z=q*-.85;g.add(a);cyl(.026,.032,.6,'#6a4a30',a,0,.3,0,5);const f=cyl(.018,.022,.2,'#6a4a30',a,q*.05,.5,0,5);f.rotation.z=-q*.6;box(.14,.14,.1,'#d8332e',a,0,.64,0);});
  snowScarf(g);
  const h=new THREE.Group();h.position.y=1.42;g.add(h);ball(.43,W,h,0,0,0,1);[-.14,.14].forEach(x=>{ball(.06,'#2a2a30',h,x,.08,.38,0);});const n=cone(.065,.38,'#f28a24',h,.02,-.02,.56,8);n.rotation.x=Math.PI/2;n.rotation.z=.1;[-.15,-.075,0,.075,.15].forEach(x=>ball(.032,'#2a2a30',h,x,-.18+Math.abs(x)*.4,.37,0));blush(h,-.06,.38,.25);
  const ht=new THREE.Group();ht.position.set(.04,.34,0);ht.rotation.z=-.14;h.add(ht);cyl(.34,.34,.05,'#2a2a30',ht,0,0,0,14);tor(.34,.026,'#2a2a30',ht,0,0,0).rotation.x=Math.PI/2;/*v2 챙 끝 둥글게*/cyl(.22,.23,.4,'#2a2a30',ht,0,.22,0,14);cyl(.235,.235,.08,'#c8282a',ht,0,.08,0,14);holly(ht,.14,.1,.2,.9,-.2);
  snow(g,36,1.0,2.7,'#ffffff',.13);twinkle(g,[[.45,1.5,.3],[-.5,1.0,.35],[.3,.4,.5],[-.35,1.85,.1]],'#cfe6ff',.22);},
};
const LIST=[
 {id:'xm-rud',n:'반짝코 루돌프',d:'빛나는 코 · 큰 뿔 · 방울 목걸이',hx:2.5},
 {id:'xm-san',n:'선물자루 산타',d:'둥근 배 · 큰 수염 · 선물 자루',hx:2.55},
 {id:'xm-snow',n:'눈송이 눈사람',d:'목도리 · 실크햇 · 내리는 눈',hx:2.0},
];
function buildX(id){const g=new THREE.Group();AN[id](g);const arm=new THREE.Object3D();arm.name='arm-right';arm.position.set(-.44,.95,0);g.add(arm);const head=new THREE.Object3D();head.name='head';head.position.set(0,1.4,0);g.add(head);g.traverse(m=>{if(m.isMesh)m.castShadow=true;});return g;}
const orig=NK_CHARS.buildAnimal;NK_CHARS.buildAnimal=function(id){return AN[id]?buildX(id):orig.apply(this,arguments);};
window.NK_XMAS={LIST,AN,
 // KINDS 맨 뒤에 붙여요 (번호가 밀리지 않게) · grp 'x' = 🎄 한정 탭 · xev = 이벤트로만 열림
 kinds(K){LIST.forEach(x=>{if(K.some(k=>k.oid===x.id))return;K.push({k:'character-male-a',n:x.n,d:x.d,s:1,animal:x.id,oid:x.id,th:x.id,lv:1,grp:'x',xev:x.id,hx:x.hx});});}};
})();
