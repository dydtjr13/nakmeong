/* v188 소원 오브젝트 — 사용자가 고른 시안 그대로 (wish-mock v1)
   🏮 운하: A 둥근 한지 연등 · ⛵ 호숫가: A 하얀 돛 나무배 (돛에 닉네임 1~2줄) · ⭐ 달: B 가는 십자 빛 (하늘에 원래 있던 별)
   + 맵별 소원 카드(#wishCard2) · 띄우기 창(#wishM2)
   그리기만 맡아요. 서버(/wishes) · 10,000골드 · 한 사람당 하나 · 2일 · 삭제 · 비속어 가리기는 game-v2.js mkWish 그대로예요. THREE r147 */
(function(){
const NKW=window.NKWISH=window.NKWISH||{};
const T=()=>window.THREE;
const FONT='"Jua","Noto Sans KR","Apple SD Gothic Neo",system-ui,sans-serif';NKW.FONT=FONT;
// 결정적 난수 (id → 0..1)
NKW.hh=(n,k)=>{let x=Math.sin(n*12.9898+k*78.233)*43758.5453;return x-Math.floor(x);};
NKW.canvas=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');f(x,w,h);return c;};
NKW.tex=(c,srgb)=>{const t=new (T().CanvasTexture)(c);if(srgb)t.encoding=T().sRGBEncoding;t.anisotropy=4;return t;};
// 부드러운 빛 번짐
let _glow=null;NKW.glowTex=()=>_glow||(_glow=NKW.tex(NKW.canvas(128,128,(x)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.12,'rgba(255,255,255,.75)');g.addColorStop(.35,'rgba(255,255,255,.22)');g.addColorStop(.7,'rgba(255,255,255,.05)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);})));
// 여러 지오메트리를 하나로 (부위 번호 aPart 붙여서) — 인스턴스 1번 그리기로 끝나요
NKW.merge=(parts)=>{const THREE_=T();let n=0;const gs=parts.map(p=>{let g=p.g.index?p.g.toNonIndexed():p.g;if(!g.attributes.uv){g.setAttribute('uv',new THREE_.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));}if(!g.attributes.normal)g.computeVertexNormals();n+=g.attributes.position.count;return [g,p];});
 const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2),A=new Float32Array(n),Q=new Float32Array(n*2),C=new Float32Array(n*3);let o=0;
 for(const [g,p] of gs){const c=g.attributes.position.count;P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);A.fill(p.part,o,o+c);
  const col=p.col?new THREE_.Color(p.col).convertSRGBToLinear():new THREE_.Color(1,1,1);for(let i=0;i<c;i++){C[(o+i)*3]=col.r;C[(o+i)*3+1]=col.g;C[(o+i)*3+2]=col.b;}
  if(p.nuv){for(let i=0;i<c;i++){const q=p.nuv(g.attributes.position.getX(i),g.attributes.position.getY(i),g.attributes.position.getZ(i));Q[(o+i)*2]=q[0];Q[(o+i)*2+1]=q[1];}}else for(let i=0;i<c;i++){Q[(o+i)*2]=-1;Q[(o+i)*2+1]=-1;}
  o+=c;}
 const G=new THREE_.BufferGeometry();G.setAttribute('position',new THREE_.BufferAttribute(P,3));G.setAttribute('normal',new THREE_.BufferAttribute(N,3));G.setAttribute('uv',new THREE_.BufferAttribute(U,2));G.setAttribute('aPart',new THREE_.BufferAttribute(A,1));G.setAttribute('nuv',new THREE_.BufferAttribute(Q,2));G.setAttribute('color',new THREE_.BufferAttribute(C,3));G.computeBoundingSphere();return G;};
// 인스턴스별 값 (씨앗 · 색 · 내 것 표시 · 이름 칸)
NKW.instAttr=(G,name,size,max)=>{const a=new (T().InstancedBufferAttribute)(new Float32Array(max*size),size);a.setUsage(T().DynamicDrawUsage);G.setAttribute(name,a);return a;};
// 이름 칸 묶음 (40칸 캔버스 한 장) — 돛·깃발에 닉네임을 그려요
/* 글꼴: Jua(웹 글꼴)가 그 글자까지 받아졌는지 · 아직이면 받은 뒤 다시 그려요 (캔버스는 기다려 주지 않아서) */
NKW.fontOk=s=>{try{return !document.fonts||document.fonts.check('400 40px "Jua"',String(s||'가'));}catch(e){return true;}};
NKW.fontWant=(s,cb)=>{try{document.fonts.load('400 40px "Jua"',String(s||'가')).then(()=>cb(),()=>{});}catch(e){}};
NKW.nickAtlas=(cols,rows,cw,ch,draw)=>{const c=document.createElement('canvas');c.width=cols*cw;c.height=rows*ch;const x=c.getContext('2d');const t=NKW.tex(c,true);const map=new Map();let free=[...Array(cols*rows).keys()];
 const paint=(cell,l)=>{const cx=(cell%cols)*cw,cy=Math.floor(cell/cols)*ch;x.save();x.clearRect(cx,cy,cw,ch);x.beginPath();x.rect(cx,cy,cw,ch);x.clip();x.translate(cx,cy);const lay=draw(x,cw,ch,l);x.restore();t.needsUpdate=true;return lay||null;};
 const A={tex:t,cols,rows,map,get(l){const key=l.id;let e=map.get(key);if(e&&e.nick===l.nick&&!e.stale)return e;const cell=e?e.cell:free.shift();if(cell==null)return null;const ok=NKW.fontOk(l.nick);e={cell,nick:l.nick,lay:paint(cell,l)};map.set(key,e);if(!ok){const e2=e;NKW.fontWant(l.nick,()=>{e2.stale=true;});}return e;},
  /* 화면에 없는 배의 칸은 돌려받아요 (칸이 모자라 다른 닉네임이 보이는 일 없게) */drop(keep){for(const [k,v] of map)if(!keep.has(k)){map.delete(k);free.push(v.cell);}},
  dispose(){t.dispose();map.clear();}};
 return A;};
// 글자를 칸에 맞게
NKW.fitFont=(x,s,maxW,px,w)=>{let f=px;x.font=`${w||400} ${f}px ${FONT}`;while(f>10&&x.measureText(s).width>maxW){f-=2;x.font=`${w||400} ${f}px ${FONT}`;}return f;};
// 이름표 (가까운 몇 개만 · 스프라이트) — style(x,W,H,l)로 그려요
NKW.tags=(scene,opt)=>{const TH=T(),TAGS=new Map();let tT=0;
 function mk(l){const c=NKW.canvas(opt.W||512,opt.H||128,(x,W,H)=>opt.draw(x,W,H,l));const t=NKW.tex(c,true);const sp=new TH.Sprite(new TH.SpriteMaterial({map:t,transparent:true,depthWrite:false,fog:false}));sp.scale.set(opt.w,opt.w*(opt.H||128)/(opt.W||512),1);sp.renderOrder=6;sp.userData.key=l.nick+'|'+(l.mine?1:0);if(!NKW.fontOk(l.nick))NKW.fontWant(l.nick,()=>{sp.userData.key='';});scene.add(sp);return sp;}
 return {map:TAGS,tick(L,cam,vis,now){if(now-tT>400){tT=now;const cp=cam.position;const sel=L.filter(l=>l.wx!=null).map(l=>[l,Math.hypot(l.wx-cp.x,l.wy-cp.y,l.wz-cp.z)]).filter(q=>q[1]<opt.far).sort((a,b)=>(b[0].mine-a[0].mine)||(a[1]-b[1])).slice(0,opt.n||12).map(q=>q[0]);
   for(const [id,sp] of TAGS)if(!sel.includes(sp.userData.l)){scene.remove(sp);sp.material.map.dispose();sp.material.dispose();TAGS.delete(id);}
   for(const l of sel){let sp=TAGS.get(l.id);if(sp&&sp.userData.key!==l.nick+'|'+(l.mine?1:0)){scene.remove(sp);sp.material.map.dispose();sp.material.dispose();TAGS.delete(l.id);sp=null;}if(!sp){sp=mk(l);TAGS.set(l.id,sp);}sp.userData.l=l;}}
  for(const sp of TAGS.values()){const l=sp.userData.l;if(l.wx==null){sp.visible=false;continue;}sp.position.set(l.wx+(opt.dx||0),l.wy+opt.y,l.wz);sp.visible=vis;if(opt.layer!=null)sp.layers.set(opt.layer);}},
  clear(){for(const sp of TAGS.values()){scene.remove(sp);sp.material.map.dispose();sp.material.dispose();}TAGS.clear();}};};
// 화면 좌표 고르기 (손가락 크기 안에서 가장 가까운 것)
NKW.pick=(L,cam,dom,cx,cy,rad)=>{const v=new (T().Vector3)(),rc=dom.getBoundingClientRect();let best=null,bd=rad;for(const l of L){if(l.wx==null)continue;v.set(l.wx,l.wy+(l.py||0),l.wz).project(cam);if(v.z>1||v.z<-1)continue;const sx=rc.left+(v.x+1)/2*rc.width,sy=rc.top+(1-v.y)/2*rc.height,d=Math.hypot(sx-cx,sy-cy);if(d<bd){bd=d;best=l;}}return best;};
NKW.leftTxt=(at,life)=>{const ms=Math.max(0,(at||Date.now())+(life||2*864e5)-Date.now()),h=Math.floor(ms/36e5);return h>=24?`${Math.floor(h/24)}일 ${h%24}시간 남음`:h>0?`${h}시간 남음`:`${Math.max(1,Math.ceil(ms/6e4))}분 남음`;};
})();

(function(){
const NKW=window.NKWISH=window.NKWISH||{};
const STY={
 A:{nm:'둥근 한지 연등',tints:['#ffd49a','#ffc29c','#ffe3a6','#ffb07e','#ffd0b0'],frame:'#7a2418',tas:'#d8322a',glow:3.4,scale:1.25,glowC:'#ffb45a'},
};
NKW.LANTERN_STYLES=STY;
function paperTex(k){return NKW.canvas(512,256,(x,W,H)=>{const r=(()=>{let s=k.charCodeAt(0)*99;return()=>{s=(s*16807)%2147483647;return s/2147483647;};})();
 x.fillStyle='#f4ece0';x.fillRect(0,0,W,H);
 // 한지 섬유: 짧은 곡선 결 수백 개 (밝게/어둡게)
 for(let i=0;i<900;i++){const px=r()*W,py=r()*H,l=6+r()*22,a=r()*6.28;x.strokeStyle=r()<.5?`rgba(255,255,255,${.25+r()*.35})`:`rgba(150,120,90,${.05+r()*.12})`;x.lineWidth=.6+r()*1.2;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+Math.cos(a+1)*l*.5,py+Math.sin(a+1)*l*.5,px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke();}
 for(let i=0;i<60;i++){x.fillStyle=`rgba(255,255,255,${.12+r()*.2})`;x.beginPath();x.ellipse(r()*W,r()*H,4+r()*14,2+r()*6,r()*3,0,7);x.fill();}
 if(k==='A'){// 대나무 살 12줄 + 위아래 붉은 띠 + 매화 가지
  for(let i=0;i<12;i++){const px=i/12*W;const g=x.createLinearGradient(px-6,0,px+6,0);g.addColorStop(0,'rgba(90,50,20,0)');g.addColorStop(.5,'rgba(90,50,20,.42)');g.addColorStop(1,'rgba(90,50,20,0)');x.fillStyle=g;x.fillRect(px-6,0,12,H);}
  for(const [y,h] of [[10,14],[H-24,14]]){x.fillStyle='rgba(190,40,30,.85)';x.fillRect(0,y,W,h);x.fillStyle='rgba(255,210,120,.7)';x.fillRect(0,y+h,W,2);x.fillRect(0,y-2,W,2);}
  for(let s=0;s<3;s++){const ox=s*W/3+40,oy=150;x.strokeStyle='rgba(80,45,25,.55)';x.lineWidth=3;x.lineCap='round';x.beginPath();x.moveTo(ox,oy+50);x.quadraticCurveTo(ox+30,oy+10,ox+90,oy-40);x.moveTo(ox+40,oy+5);x.quadraticCurveTo(ox+60,oy+15,ox+80,oy+8);x.stroke();
   for(const [fx,fy,fs] of [[ox+90,oy-40,11],[ox+60,oy-14,9],[ox+80,oy+8,8],[ox+28,oy+22,7]]){for(let p=0;p<5;p++){const a=p/5*6.28;x.fillStyle='rgba(235,90,110,.55)';x.beginPath();x.arc(fx+Math.cos(a)*fs*.62,fy+Math.sin(a)*fs*.62,fs*.5,0,7);x.fill();}x.fillStyle='rgba(255,220,120,.9)';x.beginPath();x.arc(fx,fy,fs*.28,0,7);x.fill();}}}
});}
function geo(k){const T=THREE,P=[];const add=(g,part)=>P.push({g,part});
 if(k==='A'){const pts=[];for(let i=0;i<=18;i++){const a=-1.32+i/18*2.64;pts.push(new T.Vector2(.52*Math.cos(a)*(1+.04*Math.cos(a*2)),.44*Math.sin(a)));}
  add(new T.LatheGeometry(pts,28),0);
  const ct=new T.CylinderGeometry(.15,.13,.06,20);ct.translate(0,.455,0);add(ct,1);const cb=new T.CylinderGeometry(.13,.16,.06,20);cb.translate(0,-.455,0);add(cb,1);
  const hk=new T.TorusGeometry(.05,.012,6,14);hk.translate(0,.54,0);add(hk,1);
  const cord=new T.CylinderGeometry(.01,.01,.12,5);cord.translate(0,-.54,0);add(cord,2);const kn=new T.SphereGeometry(.038,10,8);kn.translate(0,-.61,0);add(kn,2);
  const ts=new T.CylinderGeometry(.022,.075,.34,14,3,true);ts.translate(0,-.8,0);add(ts,5);}
 return NKW.merge(P);}
const VS=`attribute float aPart;attribute float aSeed;attribute vec3 aTint;attribute float aMine;uniform float uT;varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying float vPart;varying float vSeed;varying vec3 vTint;varying float vMine;varying vec3 vL;
void main(){vUv=uv;vPart=aPart;vSeed=aSeed;vTint=aTint;vMine=aMine;vec3 p=position;vL=p;
 if(aPart>1.5&&aPart<2.5||aPart>4.5&&aPart<5.5){float d=max(0.,-p.y-.4);p.x+=sin(uT*1.9+aSeed*6.)*.07*d;p.z+=cos(uT*1.5+aSeed*4.)*.05*d;}
 vec4 w=modelMatrix*instanceMatrix*vec4(p,1.);vN=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal);vV=cameraPosition-w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const FS=`uniform float uT;uniform sampler2D uPaper;uniform vec3 uFrame;uniform vec3 uTas;uniform float uK;varying vec2 vUv;varying vec3 vN;varying vec3 vV;varying float vPart;varying float vSeed;varying vec3 vTint;varying float vMine;varying vec3 vL;
void main(){vec3 N=normalize(vN),V=normalize(vV);float face=abs(dot(N,V));
 float fl=.86+.09*sin(uT*8.3+vSeed*17.)+.05*sin(uT*21.+vSeed*5.)+.04*sin(uT*1.3+vSeed*3.);fl*=1.+.12*vMine;
 vec3 col;float a=1.;
 if(vPart<.5||vPart>6.5){vec3 tx=texture2D(uPaper,vPart>6.5?vec2(.5,.95):vUv).rgb;float k=pow(face,1.25);float vert=clamp(1.15-abs(vUv.y-.42)*1.5,0.,1.);
  vec3 hot=mix(vTint,vec3(1.,.97,.88),.62),edge=vTint*vec3(.86,.5,.32);col=mix(edge,hot,clamp(k*vert*1.15,0.,1.))*fl;col*=mix(vec3(1.),tx/vec3(.957,.925,.878),.95);col+=vec3(1.,.82,.55)*pow(k,7.)*.16*fl*vert;if(!gl_FrontFacing)col*=1.08;}
 else if(vPart<1.5){col=uFrame*(.55+.35*face)+vTint*.12*fl;}
 else if(vPart<2.5){col=uTas*(.7+.3*face)+vec3(.12,.03,.0)*fl;}
 else if(vPart<3.5){float y=clamp((vL.y+.5)*2.,0.,1.);col=mix(vec3(1.,.95,.7),vec3(1.,.6,.2),.3)*(1.15+.25*sin(uT*14.+vSeed*9.))*fl;}
 else if(vPart<4.5){float k=pow(face,1.1);vec3 tip=vTint,base=vec3(1.,.96,.92);vec3 c=mix(base,tip,smoothstep(.3,1.,vUv.y));float vein=.92+.08*sin((vUv.x-.5)*40.);c*=vein;vec3 edge=c*vec3(.85,.55,.6);col=mix(edge,c*1.05,clamp(k*1.1,0.,1.))*fl;col+=vec3(1.,.85,.6)*(1.-vUv.y)*.18*fl;if(!gl_FrontFacing)col*=.92;}
 else if(vPart<5.5){float s=.75+.25*sin(vUv.x*110.+vSeed);col=uTas*s*(.65+.35*face)*(.95+.15*(1.-vUv.y))+vec3(.1,.02,0.)*fl;}
 else {col=mix(vec3(.2,.45,.25),vec3(.45,.7,.35),vUv.y)*(.6+.4*face)+vec3(.12,.1,0.)*fl;}
 gl_FragColor=vec4(col*uK,a);}`;
const GVS=`attribute float aSize;attribute float aSeed;attribute vec3 aCol;uniform float uT;uniform float uPx;varying vec3 vC;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float fl=.9+.06*sin(uT*8.3+aSeed*17.)+.04*sin(uT*21.+aSeed*5.);gl_PointSize=aSize*uPx/max(.5,-mv.z)*fl;vC=aCol;vA=fl;}`;
const GFS=`uniform sampler2D uG;uniform float uK;varying vec3 vC;varying float vA;void main(){vec4 t=texture2D(uG,gl_PointCoord);gl_FragColor=vec4(vC*t.a*vA*uK,1.);}`;
NKW.lanternKit=(style,opt={})=>{const T=THREE,S=STY[style],MAX=opt.max||40;const G=geo(style);
 const aSeed=NKW.instAttr(G,'aSeed',1,MAX),aTint=NKW.instAttr(G,'aTint',3,MAX),aMine=NKW.instAttr(G,'aMine',1,MAX);
 const ptex=NKW.tex(paperTex(style));const U={uT:{value:0},uPaper:{value:ptex},uFrame:{value:new T.Color(S.frame)},uTas:{value:new T.Color(S.tas)},uK:{value:1}};
 const mesh=new T.InstancedMesh(G,new T.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:FS,side:T.DoubleSide}),MAX);mesh.frustumCulled=false;mesh.count=0;mesh.layers.enable(1);
 const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(new Float32Array(MAX*3),3));const pS=new T.BufferAttribute(new Float32Array(MAX),1),pSe=new T.BufferAttribute(new Float32Array(MAX),1),pC=new T.BufferAttribute(new Float32Array(MAX*3),3);pg.setAttribute('aSize',pS);pg.setAttribute('aSeed',pSe);pg.setAttribute('aCol',pC);
 const GU={uT:U.uT,uPx:{value:600},uG:{value:NKW.glowTex()},uK:{value:1}};
 const pts=new T.Points(pg,new T.ShaderMaterial({uniforms:GU,vertexShader:GVS,fragmentShader:GFS,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));pts.frustumCulled=false;pts.layers.enable(1);pts.renderOrder=3;
 const _o=new T.Object3D(),_c=new T.Color(),_g=new T.Color(S.glowC);
 return {style,S,mesh,pts,objs:[mesh,pts],
  /* L: [{id,nick,mine,wx,wy,wz,rx,ry,rz,sc}] — 위치는 바깥(mkWish step)에서 정해요 */
  update(L,t,cam,R){U.uT.value=t;const H=R?R.domElement.height:innerHeight;GU.uPx.value=H/(2*Math.tan(cam.fov*Math.PI/360));const pa=pg.attributes.position;let i=0;
   for(const l of L){if(i>=MAX)break;_o.position.set(l.wx,l.wy,l.wz);_o.rotation.set(l.rx||0,l.ry||0,l.rz||0);_o.scale.setScalar((l.sc||1)*S.scale);_o.updateMatrix();mesh.setMatrixAt(i,_o.matrix);
    const sd=NKW.hh(l.id,5);aSeed.setX(i,sd*10);_c.set(S.tints[Math.floor(NKW.hh(l.id,6)*S.tints.length)]);aTint.setXYZ(i,_c.r,_c.g,_c.b);aMine.setX(i,l.mine?1:0);
    pa.setXYZ(i,l.wx,l.wy+(style==='B'?.05:-.02)*S.scale,l.wz);pS.setX(i,S.glow*(l.sc||1)*(l.mine?1.2:1));pSe.setX(i,sd*10);const gc=_c.clone().lerp(_g,.55);pC.setXYZ(i,gc.r*.55,gc.g*.42,gc.b*.3);i++;}
   mesh.count=i;mesh.instanceMatrix.needsUpdate=true;aSeed.needsUpdate=aTint.needsUpdate=aMine.needsUpdate=true;pa.needsUpdate=pS.needsUpdate=pSe.needsUpdate=pC.needsUpdate=true;pg.setDrawRange(0,i);},
  setVisible(v){mesh.visible=pts.visible=v;},
  dispose(){G.dispose();ptex.dispose();mesh.material.dispose();pg.dispose();pts.material.dispose();}};};
// 연등 이름표: v183에서 고른 '빛나는 닉네임' 그대로 · 조금 더 부드럽게
NKW.lanternTag=(x,W,H,l)=>{const nk=String(l.nick||'').slice(0,10);NKW.fitFont(x,nk,W-64,60,400);x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
 x.lineWidth=9;x.strokeStyle='rgba(120,50,10,.5)';x.shadowColor='rgba(255,140,40,.9)';x.shadowBlur=18;x.strokeText(nk,W/2,H/2);x.shadowColor=l.mine?'rgba(255,150,40,1)':'rgba(255,170,70,.95)';x.shadowBlur=24;x.fillStyle=l.mine?'#ffe2a8':'#fff6d8';x.fillText(nk,W/2,H/2);x.fillText(nk,W/2,H/2);x.shadowBlur=6;x.shadowColor='rgba(110,45,0,.55)';x.fillText(nk,W/2,H/2);};
})();

(function(){
const NKW=window.NKWISH=window.NKWISH||{};
const STY={
 A:{nm:'하얀 돛 나무배',hull:'#d79a5c',trim:'#7a4a2a',sail:'#fbf6ea',sail2:'#f2ece0',flag:'#e8504a',lampC:'#ffcf7a',capC:'#3a3030',lamp:[0,.56,-.53],belly:1,wide:1,rise:0,nickOn:'sail'},
};
NKW.BOAT_STYLES=STY;
function hull(S){const T=THREE,N=16,M=12,pos=[],uv=[],idx=[];const W=t=>.25*S.wide*(t<.55?(.64+.36*Math.sin(t/.55*Math.PI/2)):Math.pow(Math.cos((t-.55)/.45*Math.PI/2),.8)),D=t=>.15*(t<.5?.85+.3*t:1.0-.7*(t-.5)),Y=t=>.13+(.07+S.rise)*Math.pow(t,3)+.02*(1-t);
 for(let s=0;s<=N;s++){const t=s/N,z=-.5+t*1.06,w=W(t),d=D(t),yt=Y(t);for(let m=0;m<=M;m++){const a=-Math.PI/2+m/M*Math.PI,sa=Math.sin(a);pos.push(w*Math.sign(sa)*Math.pow(Math.abs(sa),.7),yt-(yt+d)*Math.pow(Math.cos(a),.8),z);uv.push(m/M,t);}}
 for(let s=0;s<N;s++)for(let m=0;m<M;m++){const a=s*(M+1)+m,b=a+1,c=a+M+1,d=c+1;idx.push(a,c,b,b,c,d);}
 // 뒤판(트랜섬)
 const c0=pos.length/3;pos.push(0,(Y(0)-D(0))/2,-.5);uv.push(.5,.02);for(let m=0;m<M;m++)idx.push(c0,m+1,m);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const top=s=>{const t=s/16;return [W(t),Y(t),-.5+t*1.06];};return {g,top,W,Y};}
function tri(a,b,c,R,C,bel){// 돛: 삼각/사각을 격자로 (nuv = 돛 안 좌표)
 const T=THREE,pos=[],nuv=[],idx=[];for(let r=0;r<=R;r++){const v=r/R;for(let k=0;k<=C;k++){const u=k/C;const p=c?(a.clone().lerp(b,v)).lerp(a.clone().lerp(b,v).add(c.clone().sub(a).multiplyScalar(1-v)),u):null;pos.push(p.x,p.y,p.z);nuv.push(u,v);}}
 for(let r=0;r<R;r++)for(let k=0;k<C;k++){const i=r*(C+1)+k;idx.push(i,i+C+1,i+1,i+1,i+C+1,i+C+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(nuv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function quad(p00,p10,p01,p11,R,C){const T=THREE,pos=[],uv=[],idx=[];for(let r=0;r<=R;r++){const v=r/R;for(let k=0;k<=C;k++){const u=k/C;const a=p00.clone().lerp(p10,u),b=p01.clone().lerp(p11,u),p=a.lerp(b,v);pos.push(p.x,p.y,p.z);uv.push(u,v);}}
 for(let r=0;r<R;r++)for(let k=0;k<C;k++){const i=r*(C+1)+k;idx.push(i,i+C+1,i+1,i+1,i+C+1,i+C+2);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
function rod(p0,p1,r,seg){const T=THREE,d=p1.clone().sub(p0),L=d.length(),g=new T.CylinderGeometry(r,r,L,seg||6);g.translate(0,L/2,0);const q=new T.Quaternion().setFromUnitVectors(V3(0,1,0),d.normalize());g.applyQuaternion(q);g.translate(p0.x,p0.y,p0.z);return g;}
function geo(k){const T=THREE,S=STY[k],P=[];const add=(g,part,col,nuvF)=>P.push({g,part,col,nuv:nuvF});
 const H=hull(S);add(H.g,0,S.hull);
 // 뱃전 테두리
 for(const sd of [-1,1]){const pts=[];for(let s=0;s<=16;s++){const [w,y,z]=H.top(s);pts.push(V3(sd*w,y+.008,z));}add(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.018,5,false),2,S.trim);}
 {const [w0,y0]=H.top(0);add(rod(V3(-w0,y0,-.5),V3(w0,y0,-.5),.018,5),2,S.trim);}
 const th=new T.BoxGeometry(.4*S.wide,.025,.08);th.translate(0,.07,-.06);add(th,2,S.trim);
 const asNuv=g=>{const a=g.attributes.uv;return (x,y,z)=>null;};
 if(k==='A'){add(rod(V3(0,0,.06),V3(0,1.3,.06),.022,6),2,S.trim);add(rod(V3(0,.24,.06),V3(0,.24,-.5),.016,5),2,S.trim);
  const sail=tri(V3(0,.27,.04),V3(0,1.25,.04),V3(0,.27,-.47),9,8);add(sail,3,S.sail,'uv');
  const jib=tri(V3(0,.2,.5),V3(0,1.05,.08),V3(0,.24,.13),6,5);add(jib,8,S.sail2,'uv');
  add(rod(V3(0,1.06,.08),V3(0,.16,.54),.004,3),7,'#5a4a3a');
  const fl=tri(V3(0,1.31,.05),V3(0,1.23,.05),V3(0,1.27,-.17),2,4);add(fl,4,S.flag,'uv');
  add(rod(V3(0,.1,-.44),V3(0,.64,-.44),.014,5),2,S.trim);add(rod(V3(0,.64,-.44),V3(0,.64,-.54),.01,4),2,S.trim);
  const lg=new T.CylinderGeometry(.04,.036,.075,8);lg.translate(0,.56,-.53);add(lg,5,S.lampC);const lc=new T.ConeGeometry(.05,.035,8);lc.translate(0,.615,-.53);add(lc,6,S.capC);const lb=new T.CylinderGeometry(.042,.042,.012,8);lb.translate(0,.518,-.53);add(lb,6,S.capC);}
 // nuv: 'uv' 표시가 있으면 지오메트리 uv를 그대로 이름 좌표로
 for(const p of P){if(p.nuv==='uv'){const u=(p.g.index?p.g.toNonIndexed():p.g).attributes.uv;let i=0;p.g=p.g.index?p.g.toNonIndexed():p.g;p.nuv=null;p.uvAsN=true;}}
 const G=NKW.merge(P);{// uv → nuv 복사 (돛·깃발·삼각돛)
  const A=G.attributes.aPart.array,U=G.attributes.uv.array,Q=G.attributes.nuv.array;for(let i=0;i<A.length;i++){if(A[i]===3||A[i]===4||A[i]===8){Q[i*2]=U[i*2];Q[i*2+1]=U[i*2+1];}}}
 return G;}
/* 닉네임 칸: 256×256 한 칸 = 돛 아래쪽 0.51×0.51 (실제 돛 비율 그대로 · 글자가 찌그러지지 않아요)
   칸 좌표: X 0=돛대 쪽 → 1=돛 뒤끝, Y 0=돛 아래 → 1=위. 삼각돛이라 높이 Y에서 쓸 수 있는 폭은 1-SLOPE*Y */
const NC=8,NR=4,CW=256,CH=256,SAIL={z0:.04,y0:.27,w:.51,h:.98},SLOPE=SAIL.w/SAIL.h;
const NK_M={mast:.075,edge:.07,bot:.085};
/* 두 줄 나누기: 한글은 앞줄이 하나 더 많게 (6자 3+3 · 7자 4+3 · 10자 5+5) · 영문·숫자는 단어가 바뀌는 곳(FishCozy|99, Fish|Cozy)이 가운데 근처면 거기서 */
const ckind=c=>/[0-9]/.test(c)?'d':/[A-Z]/.test(c)?'U':/[a-z]/.test(c)?'l':/[A-Za-z]/.test(c)?'l':'k';
function nickSplit(nk){const ch=[...nk],n=ch.length,mid=Math.ceil(n/2);let at=mid,bd=9;
 for(let i=1;i<n;i++){const a=ckind(ch[i-1]),b=ckind(ch[i]);const brk=a!==b&&!(a==='U'&&b==='l');if(!brk)continue;const d=Math.abs(i-mid);if(d<=2&&d<bd&&i>=2&&n-i>=2){bd=d;at=i;}}
 return [ch.slice(0,at).join(''),ch.slice(at).join('')];}
/* 글자 크기 고르기: 줄마다 잉크 상자 오른쪽 위 모서리가 빗변 안쪽에 들어오는 가장 큰 크기 */
function nickLayout(x,nk,W,H){const F=NKW.FONT,m=NK_M;
 const fit=(lines,fMax)=>{for(let f=fMax;f>=12;f--){x.font=`400 ${f}px ${F}`;const lh=f*1.08,N=lines.length,out=[];let ok=true;
   for(let i=0;i<N&&ok;i++){const s=lines[i],mt=x.measureText(s),asc=mt.actualBoundingBoxAscent||f*.8,dsc=mt.actualBoundingBoxDescent||f*.12,w=mt.width;
    const base=H*(1-m.bot)-dsc-(N-1-i)*lh;/* 아래 줄부터 쌓아요 (캔버스 y) */const yTop=(H-(base-asc))/H,yBot=(H-(base+dsc))/H;
    const avail=(1-SLOPE*yTop-m.edge)-m.mast;if(w/W>avail||yTop>.97){ok=false;break;}
    const cx=m.mast+avail/2;out.push({s,f,cx,base,yTop,yBot,w:w/W});}
   if(ok)return {f,lines:out};}
  return null;};
 const n=[...nk].length;let L1=fit([nk],n<=2?70:n<=4?60:56),L=L1;
 if(n>=5){const L2=fit(nickSplit(nk),56);/* 한글처럼 넓은 글자는 두 줄 · 영문·숫자처럼 좁은 글자는 한 줄에 읽기 좋은 크기(30px↑)로 들어가면 한 줄 */
  const narrow=L1&&L1.lines[0].w*W<n*L1.f*.72;L=(narrow&&L1&&L1.f>=30)||!L2?L1:L2;}
 return L;}
const heart=(x,cx,cy,r)=>{x.beginPath();x.moveTo(cx,cy+r*.9);x.bezierCurveTo(cx-r*1.35,cy-r*.1,cx-r*.75,cy-r*1.15,cx,cy-r*.45);x.bezierCurveTo(cx+r*.75,cy-r*1.15,cx+r*1.35,cy-r*.1,cx,cy+r*.9);x.fill();};
function nickDraw(){return (x,W,H,l)=>{const nk=String(l.nick||'').trim().slice(0,10)||'낚시꾼';const L=nickLayout(x,nk,W,H);if(!L)return null;
 x.textAlign='center';x.textBaseline='alphabetic';x.font=`400 ${L.f}px ${NKW.FONT}`;x.fillStyle='rgba(30,50,90,.92)';
 for(const q of L.lines)x.fillText(q.s,q.cx*W,q.base);
 const top=L.lines[0],bot=L.lines[L.lines.length-1];
 /* 밑줄 물결: 아래 줄 밑 (빈 곳이 있을 때만) */const uy=bot.base+L.f*.2;if(uy<H*(1-NK_M.bot*.35)){const hw=Math.min(bot.w*W*.42,W*.2);x.strokeStyle='rgba(30,50,90,.5)';x.lineWidth=Math.max(2,L.f*.06);x.lineCap='round';x.beginPath();x.moveTo(bot.cx*W-hw,uy);x.quadraticCurveTo(bot.cx*W,uy+L.f*.16,bot.cx*W+hw,uy);x.stroke();}
 /* 작은 하트: 위 줄 위 (빗변 안에 들어갈 때만) */const hr=Math.max(5,L.f*.2),hy=top.base-L.f*.95-hr*.4,hyN=(H-hy+hr)/H;if(hy-hr>H*.03&&top.cx+hr/W<1-SLOPE*hyN-NK_M.edge){x.fillStyle='rgba(232,80,74,.9)';heart(x,top.cx*W,hy,hr);}
 /* 셰이더가 쓰는 값: 위 줄 가운데 · 아래 줄 가운데 · 두 줄 나누는 높이 (뒤에서 봐도 글자가 같은 자리에 바로 보이게 줄마다 뒤집어요) */
 const split=L.lines.length>1?(top.yBot+bot.yTop)/2:2;return {f:L.f,n:L.lines.length,lines:L.lines.map(q=>q.s),lay:[top.cx,bot.cx,split]};};}
NKW.nickPaint=(x,nk)=>nickDraw()(x,CW,CH,{nick:nk});
NKW.nickLayout=(nk)=>{const c=document.createElement('canvas');c.width=CW;c.height=CH;const x=c.getContext('2d');const r=nickDraw()(x,CW,CH,{nick:nk});
 /* 확인용: 돛 밖(빗변·가장자리)으로 나간 잉크 픽셀 수 */const d=x.getImageData(0,0,CW,CH).data;let out=0,mir=0;
 for(let py=0;py<CH;py++)for(let px=0;px<CW;px++){const a=d[(py*CW+px)*4+3];if(a<8)continue;const X=(px+.5)/CW,Y=1-(py+.5)/CH;if(X<0.01||X>1-SLOPE*Y-.01||Y<.01)out++;
  const cx=r&&r.lay?(Y<r.lay[2]?r.lay[1]:r.lay[0]):.5,Xm=2*cx-X;if(Xm<0.01||Xm>1-SLOPE*Y-.01)mir++;}
 return Object.assign({},r,{out,mir,px:r&&r.f,worldH:r&&+(r.f/CH*SAIL.w).toFixed(3)});};
const PATCH=(S,k,U)=>sh=>{Object.assign(sh.uniforms,U);
 sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
attribute float aPart;attribute vec2 nuv;attribute float aCell;attribute vec3 aLay;attribute float aSeed;uniform float uT;uniform float uBelly;varying float vPart;varying vec2 vNuv;varying float vCell;varying vec3 vLay;varying float vSeed;varying vec2 vUv0;varying vec3 vLoc;`).replace('#include <begin_vertex>',`#include <begin_vertex>
vPart=aPart;vNuv=nuv;vCell=aCell;vLay=aLay;vSeed=aSeed;vUv0=uv;vLoc=position;
if(aPart>2.5&&aPart<3.5||aPart>7.5){float fx=nuv.x,fy=nuv.y;transformed.x+=uBelly*.075*sin(3.1416*fx)*(.35+.65*(1.-fy))*(.85+.15*sin(uT*1.3+aSeed))+sin(uT*2.2+fy*4.+fx*3.+aSeed)*.006;}
if(aPart>3.5&&aPart<4.5){float fx=nuv.x;transformed.x+=sin(uT*6.5+fx*7.+aSeed)*.035*fx;transformed.y+=sin(uT*5.+fx*5.+aSeed)*.008*fx;}`);
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
uniform sampler2D uNick;uniform float uT;uniform float uNight;uniform vec3 uSail2;uniform vec3 uLamp;varying float vPart;varying vec2 vNuv;varying float vCell;varying vec3 vLay;varying float vSeed;varying vec2 vUv0;varying vec3 vLoc;
float nh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec4 nickAt(vec2 nu){if(vCell<0.||nu.x<0.||nu.x>1.||nu.y<0.||nu.y>1.)return vec4(0.);vec2 c=vec2(mod(vCell,${NC}.),floor(vCell/${NC}.));vec2 q=vec2((c.x+clamp(nu.x,.003,.997))/${NC}.,1.-(c.y+1.-clamp(nu.y,.003,.997))/${NR}.);return texture2D(uNick,q);}`).replace('#include <color_fragment>',`#include <color_fragment>
if(vPart<.5){float pl=fract(vUv0.x*9.);float seam=smoothstep(0.,.07,pl)*smoothstep(1.,.93,pl);float gr=.92+.08*sin(vUv0.y*90.+sin(vUv0.x*40.)*3.+nh(floor(vUv0*vec2(9.,1.)))*6.);
  vec3 c=diffuseColor.rgb*gr*(.82+.18*seam);
  if(!gl_FrontFacing)c*=vec3(.62,.56,.5);diffuseColor.rgb=c;}
if(vPart>2.5&&vPart<3.5||vPart>7.5){vec2 nu=vNuv;float w=.94+.06*sin(nu.x*260.)*sin(nu.y*260.);vec3 c=diffuseColor.rgb*w;
  float seam=1.-.1*smoothstep(.03,0.,abs(fract(nu.y*5.)-.5)-.47);c*=seam;c*=1.-.18*smoothstep(.06,0.,min(min(nu.x,1.-nu.x),nu.y));
  if(vPart<3.5){vec2 q=vec2((${SAIL.z0}-vLoc.z)/${SAIL.w},(vLoc.y-${SAIL.y0})/${SAIL.w});if(gl_FrontFacing){float cx=q.y<vLay.z?vLay.y:vLay.x;q.x=2.*cx-q.x;}vec4 t=nickAt(q);c=mix(c,t.rgb,t.a);}
  diffuseColor.rgb=c;}
`).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
float fl=.88+.08*sin(uT*9.+vSeed*13.)+.04*sin(uT*23.+vSeed*3.);
if(vPart>4.5&&vPart<5.5){float gl=mix(.55,2.6,uNight)*fl;totalEmissiveRadiance+=uLamp*gl;}
if(vPart>2.5&&vPart<4.5||vPart>7.5){totalEmissiveRadiance+=diffuseColor.rgb*mix(.3,.1,uNight)+uLamp*uNight*.07*fl;}
if(vPart<.5||vPart>1.5&&vPart<2.5){totalEmissiveRadiance+=diffuseColor.rgb*mix(.16,.05,uNight);}`);};
const WVS=`attribute float aSeed;attribute float aMove;varying vec2 vP;varying float vS;varying float vM;void main(){vP=position.xz;vS=aSeed;vM=aMove;gl_Position=projectionMatrix*viewMatrix*modelMatrix*instanceMatrix*vec4(position,1.);}`;
const WFS=`uniform float uT;uniform float uNight;uniform vec3 uLampW;uniform vec2 uLampP;varying vec2 vP;varying float vS;varying float vM;
void main(){vec2 p=vP;float a=0.;
 float r=length(p*vec2(1.25,.8));for(int k=0;k<3;k++){float f=fract(uT*.22+vS+float(k)/3.);float rad=.45+f*1.6;a+=(1.-f)*(1.-f)*smoothstep(.05,0.,abs(r-rad))*.55;}
 float e=length(p*vec2(1./.33,1./.62));a+=smoothstep(.22,0.,abs(e-1.05))*.35*(.75+.25*sin(uT*3.+vS*9.));
 float d=-p.y-.45;if(d>0.){float hw=.2+d*.32;float ln=smoothstep(.07+d*.03,0.,abs(abs(p.x)-hw));float br=.55+.45*sin(d*13.-uT*4.+vS*5.);a+=ln*br*exp(-d*.75)*.6*vM;float mid=smoothstep(hw,0.,abs(p.x))*exp(-d*1.1)*.12*vM;a+=mid;}
 vec3 col=mix(vec3(1.),vec3(.75,.85,1.),uNight)*a*mix(.75,.35,uNight);
 vec2 lp=p-uLampP;float lg=exp(-dot(lp*vec2(3.,1.2),lp*vec2(3.,1.2))*2.2)*(.75+.25*sin(lp.y*22.-uT*2.5+vS))*uNight;col+=uLampW*lg*.9;
 float al=clamp(max(a*mix(.75,.35,uNight),lg*.8),0.,1.);gl_FragColor=vec4(col/max(al,.001)*al,al);}`;
const GVS=`attribute float aSize;attribute float aSeed;uniform float uT;uniform float uPx;uniform float uNight;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float fl=.9+.07*sin(uT*9.+aSeed*13.)+.03*sin(uT*23.+aSeed*3.);gl_PointSize=aSize*uPx/max(.5,-mv.z)*fl*mix(.55,1.,uNight);vA=fl*mix(.18,1.,uNight);}`;
const GFS=`uniform sampler2D uG;uniform vec3 uC;varying float vA;void main(){vec4 t=texture2D(uG,gl_PointCoord);gl_FragColor=vec4(uC*t.a*vA,1.);}`;
NKW.boatKit=(style,opt={})=>{const T=THREE,S=STY[style],MAX=opt.max||40;const G=geo(style);
 const aSeed=NKW.instAttr(G,'aSeed',1,MAX),aCell=NKW.instAttr(G,'aCell',1,MAX),aLay=NKW.instAttr(G,'aLay',3,MAX);
 const atlas=NKW.nickAtlas(NC,NR,CW,CH,nickDraw());let lastL=null;
 const U={uNick:{value:atlas.tex},uT:{value:0},uNight:{value:0},uBelly:{value:S.belly},uSail2:{value:new T.Color(S.sail2).convertSRGBToLinear()},uLamp:{value:new T.Color(S.lampC).convertSRGBToLinear()}};
 const mat=new T.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:0,side:T.DoubleSide});mat.onBeforeCompile=PATCH(S,style,U);mat.customProgramCacheKey=()=>'nkboat'+style;
 const mesh=new T.InstancedMesh(G,mat,MAX);mesh.frustumCulled=false;mesh.count=0;mesh.castShadow=false;
 // 물결: 파문 + 뱃자국 (배 1척 = 사각형 1장)
 const wg=new T.PlaneGeometry(3.4,5.6);wg.rotateX(-Math.PI/2);wg.translate(0,0,-1.6);const wSeed=NKW.instAttr(wg,'aSeed',1,MAX),wMove=NKW.instAttr(wg,'aMove',1,MAX);
 const lampLocal=new T.Vector3(...S.lamp);
 const WU={uT:U.uT,uNight:U.uNight,uLampW:{value:new T.Color(S.lampC)},uLampP:{value:new T.Vector2(lampLocal.x,lampLocal.z)}};
 const wake=new T.InstancedMesh(wg,new T.ShaderMaterial({uniforms:WU,vertexShader:WVS,fragmentShader:WFS,transparent:true,depthWrite:false}),MAX);wake.frustumCulled=false;wake.count=0;wake.renderOrder=2;
 const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(new Float32Array(MAX*3),3));const pS=new T.BufferAttribute(new Float32Array(MAX),1),pSe=new T.BufferAttribute(new Float32Array(MAX),1);pg.setAttribute('aSize',pS);pg.setAttribute('aSeed',pSe);
 const GU={uT:U.uT,uPx:{value:600},uNight:U.uNight,uG:{value:NKW.glowTex()},uC:{value:new T.Color(S.lampC).multiplyScalar(.8)}};
 const pts=new T.Points(pg,new T.ShaderMaterial({uniforms:GU,vertexShader:GVS,fragmentShader:GFS,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));pts.frustumCulled=false;pts.renderOrder=4;
 const _o=new T.Object3D(),_w=new T.Object3D(),_v=new T.Vector3();
 return {style,S,mesh,wake,pts,atlas,objs:[wake,mesh,pts],
  update(L,t,cam,R,ex){if(L!==lastL){lastL=L;atlas.drop(new Set(L.map(l=>l.id)));}U.uT.value=t;U.uNight.value=ex&&ex.night!=null?ex.night:0;GU.uPx.value=(R?R.domElement.height:innerHeight)/(2*Math.tan(cam.fov*Math.PI/360));const pa=pg.attributes.position;let i=0;
   for(const l of L){if(i>=MAX)break;_o.position.set(l.wx,l.wy,l.wz);_o.rotation.set(l.rx||0,l.ry||0,l.rz||0,'YXZ');_o.scale.setScalar(l.sc||1);_o.updateMatrix();mesh.setMatrixAt(i,_o.matrix);
    const sd=NKW.hh(l.id,5)*10;aSeed.setX(i,sd);const e=atlas.get(l),ly=e&&e.lay&&e.lay.lay;aCell.setX(i,ly?e.cell:-1);if(ly)aLay.setXYZ(i,ly[0],ly[1],ly[2]);
    _w.position.set(l.wx,.035,l.wz);_w.rotation.set(0,l.ry||0,0);_w.scale.setScalar(Math.max(.5,l.sc||1)/1.15);_w.updateMatrix();wake.setMatrixAt(i,_w.matrix);wSeed.setX(i,sd*.1);wMove.setX(i,l.rise?.4:1);
    _v.copy(lampLocal).applyMatrix4(_o.matrix);pa.setXYZ(i,_v.x,_v.y,_v.z);pS.setX(i,1.1*(l.sc||1));pSe.setX(i,sd);i++;}
   mesh.count=wake.count=i;mesh.instanceMatrix.needsUpdate=wake.instanceMatrix.needsUpdate=true;aSeed.needsUpdate=aCell.needsUpdate=aLay.needsUpdate=wSeed.needsUpdate=wMove.needsUpdate=true;pa.needsUpdate=pS.needsUpdate=pSe.needsUpdate=true;pg.setDrawRange(0,i);},
  setVisible(v){mesh.visible=wake.visible=pts.visible=v;},
  dispose(){G.dispose();mat.dispose();wg.dispose();wake.material.dispose();pg.dispose();pts.material.dispose();atlas.dispose();}};};
})();

(function(){
const NKW=window.NKWISH=window.NKWISH||{};
const STY={B:{nm:'가는 십자 빛',size:58}};
NKW.STAR_STYLES=STY;
const VS=`attribute float aSeed;attribute float aMine;uniform float uSize;uniform float uDpr;varying float vSeed;varying float vMine;void main(){vSeed=aSeed;vMine=aMine;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=uSize*uDpr*(1.+.25*aMine);}`;
const FS=`uniform float uT;varying float vSeed;varying float vMine;
void main(){vec2 p=gl_PointCoord*2.-1.;p.y=-p.y;float r=length(p);vec3 c;float a=0.;
 float core=exp(-r*r*260.);
 {float an=.12*sin(uT*.25+vSeed*4.);mat2 R=mat2(cos(an),-sin(an),sin(an),cos(an));vec2 q=R*p;
  float g=pow(max(0.,sin(uT*.75+vSeed*6.283)),14.);float L=.7+.3*g;
  float s1=exp(-abs(q.y)*45.)*pow(max(0.,1.-abs(q.x)/L),2.);float s2=exp(-abs(q.x)*45.)*pow(max(0.,1.-abs(q.y)/L),2.);
  vec2 d=mat2(.7071,-.7071,.7071,.7071)*q;float s3=(exp(-abs(d.y)*90.)*pow(max(0.,1.-abs(d.x)/(L*.45)),2.)+exp(-abs(d.x)*90.)*pow(max(0.,1.-abs(d.y)/(L*.45)),2.))*.45;
  float halo=exp(-r*r*14.)*(.16+.14*g);float tw=.75+.25*sin(uT*2.1+vSeed*9.);
  c=vec3(.84,.92,1.)*((s1+s2)*1.05*tw+s3*1.2*tw+halo*1.4)+vec3(1.)*core*(1.2+.6*g);}
 c*=1.+.35*vMine;gl_FragColor=vec4(c,1.);}`;
NKW.starKit=(style,opt={})=>{const T=THREE,S=STY[style],MAX=opt.max||40;
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(MAX*3),3));const aSeed=new T.BufferAttribute(new Float32Array(MAX),1),aMine=new T.BufferAttribute(new Float32Array(MAX),1);g.setAttribute('aSeed',aSeed);g.setAttribute('aMine',aMine);g.setDrawRange(0,0);
 const U={uT:{value:0},uSize:{value:S.size},uDpr:{value:1}};
 const pts=new T.Points(g,new T.ShaderMaterial({uniforms:U,vertexShader:VS,fragmentShader:FS,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));pts.frustumCulled=false;pts.renderOrder=-4;
 let src=null,cand=null,host=null,lastL=null;const _v=new T.Vector3();
 /* 달 하늘(moonBuild의 별 3500개)을 찾아요 · 달을 다시 만들면 새 하늘로 옮겨 가요 */
 function findStars(){const SKY=window.__nkSKY;src=null;if(!SKY||!SKY.skyG)return false;for(const o of SKY.skyG.children){if(o.isPoints&&o!==pts&&o.geometry.attributes.position.count>=1000){src=o;break;}}if(!src)return false;if(host&&host!==src.parent)host.remove(pts);host=src.parent;host.add(pts);
  const pa=src.geometry.attributes.position,D=pa.count?Math.hypot(pa.getX(0),pa.getY(0),pa.getZ(0)):350;cand=[];for(let i=0;i<pa.count;i++){const y=pa.getY(i)/D;if(y>Math.sin(4*Math.PI/180)&&y<Math.sin(24*Math.PI/180))cand.push(i);}return true;}
 const kit={style,S,pts,objs:[],
  bind(L){if(!src&&!findStars())return;lastL=L;const used=new Set(),pa=src.geometry.attributes.position;L.forEach(l=>{let k=Math.floor(NKW.hh(l.id,1)*cand.length);while(used.has(cand[k]))k=(k+1)%cand.length;used.add(cand[k]);l.si=cand[k];l.lx=pa.getX(l.si);l.ly=pa.getY(l.si);l.lz=pa.getZ(l.si);});kit.place(L);},
  place(L){const p=g.attributes.position;let i=0;for(const l of L){if(i>=MAX||l.si==null)continue;p.setXYZ(i,l.lx,l.ly,l.lz);aSeed.setX(i,NKW.hh(l.id,5));aMine.setX(i,l.mine?1:0);i++;}p.needsUpdate=aSeed.needsUpdate=aMine.needsUpdate=true;g.setDrawRange(0,i);},
  update(L,t,cam,R){U.uT.value=t;U.uDpr.value=R?R.getPixelRatio():devicePixelRatio;const SKY=window.__nkSKY;if(src&&SKY&&src.parent!==SKY.skyG)src=null;if(!src||L!==lastL){kit.bind(L);if(!src)return;}host.updateMatrixWorld();for(const l of L){if(l.si==null)continue;_v.set(l.lx,l.ly,l.lz).applyMatrix4(host.matrixWorld);l.wx=_v.x;l.wy=_v.y;l.wz=_v.z;}},
  setVisible(v){pts.visible=v;},dispose(){if(host)host.remove(pts);host=src=null;g.dispose();pts.material.dispose();}};
 return kit;};
})();

(function(){
const NKW=window.NKWISH=window.NKWISH||{};let uid=0;
const ICON={
 canal:{
  A:(i)=>`<radialGradient id="g${i}" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#fffbea"/><stop offset=".5" stop-color="#ffd690"/><stop offset="1" stop-color="#ee8a3e"/></radialGradient><radialGradient id="h${i}"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb04a" stop-opacity="0"/></radialGradient></defs>
   <circle cx="32" cy="31" r="31" fill="url(#h${i})"/><path d="M32 4v5" stroke="#7a2418" stroke-width="1.6"/><rect x="25" y="9" width="14" height="4.5" rx="2" fill="#8a2a1a"/>
   <ellipse cx="32" cy="31" rx="19.5" ry="17.5" fill="url(#g${i})"/>
   <g fill="none" stroke="#b5622a" stroke-opacity=".45" stroke-width="1.1"><path d="M32 13.5c-8 4-8 31 0 35M32 13.5c8 4 8 31 0 35M32 13.5c-16 5-16 30 0 35M32 13.5c16 5 16 30 0 35"/></g>
   <path d="M14.5 26h35M14.5 36h35" stroke="#c8402c" stroke-opacity=".5" stroke-width="1.3"/>
   <g fill="#ee6a86" fill-opacity=".8"><circle cx="23" cy="30" r="2"/><circle cx="26" cy="27.5" r="1.6"/><circle cx="24.5" cy="33.5" r="1.4"/></g><circle cx="23" cy="30" r=".8" fill="#ffd36a"/>
   <rect x="25" y="47.5" width="14" height="4.5" rx="2" fill="#8a2a1a"/><path d="M32 52v3" stroke="#c8282a" stroke-width="1.4"/><circle cx="32" cy="56" r="2.2" fill="#d8322a"/><path d="M29.5 57.5h5l1.6 6h-8.2z" fill="#d8322a"/><path d="M31 58v5.5M33 58v5.5" stroke="#9a1a1a" stroke-width=".6"/>`},
 lake:{
  A:(i)=>`<linearGradient id="g${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6a868"/><stop offset="1" stop-color="#a8642e"/></linearGradient></defs>
   <ellipse cx="32" cy="55" rx="26" ry="4" fill="#7cc8e8" opacity=".55"/><path d="M33 6v40" stroke="#6a3a1e" stroke-width="2"/><path d="M33 8l-3 2.5 3 2.5" fill="#e8504a"/><path d="M33 9L33 44 12 44z" fill="#fffaf0" stroke="#d8cdb8" stroke-width=".8"/><path d="M35 16L35 42 50 42z" fill="#f2ece0" stroke="#d8cdb8" stroke-width=".8"/><path d="M33 3l9 2.5-9 2.5z" fill="#e8504a"/>
   <text x="24" y="38" font-size="5.6" text-anchor="middle" fill="#1e325a" font-family="Jua,system-ui">♥</text><path d="M8 45h48l-6 9H15z" fill="url(#g${i})"/><path d="M8 45h48" stroke="#6a3a1e" stroke-width="2" stroke-linecap="round"/><path d="M11 49.5h42" stroke="#8a5028" stroke-opacity=".45"/>
   <path d="M12 44V33h-3" stroke="#6a3a1e" stroke-width="1.4" fill="none"/><rect x="7" y="33" width="4" height="5" rx="1" fill="#ffcf7a"/><circle cx="9" cy="35.5" r="5" fill="#ffcf7a" opacity=".35"/>`},
 moon:{
  B:(i)=>`<radialGradient id="g${i}"><stop offset="0" stop-color="#dfeaff" stop-opacity=".6"/><stop offset="1" stop-color="#dfeaff" stop-opacity="0"/></radialGradient><linearGradient id="a${i}"><stop offset="0" stop-color="#dfeaff" stop-opacity="0"/><stop offset=".5" stop-color="#f4f8ff"/><stop offset="1" stop-color="#dfeaff" stop-opacity="0"/></linearGradient></defs>
   <circle cx="32" cy="32" r="12" fill="url(#g${i})"/><path d="M4 32h56" stroke="url(#a${i})" stroke-width="1.6"/><path d="M32 4v56" stroke="url(#a${i})" stroke-width="1.6" transform="rotate(0 32 32)"/><path d="M20 20l24 24M44 20L20 44" stroke="#dfeaff" stroke-opacity=".45" stroke-width=".9"/><circle cx="32" cy="32" r="3" fill="#fff"/>`}};
const ESC=t=>String(t==null?'':t).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
NKW.ui={STYLE:{canal:'A',lake:'A',moon:'B'},THEME:{canal:{ic:'🏮',nm:'소원 연등',go:'하늘로 띄우기',j:['을','은','으로'],short:'연등',desc:'내 닉네임과 소원을 적은 연등이 운하 하늘에 떠요',desc2:'다른 사람이 연등을 누르면 내 소원을 볼 수 있어요'},
  lake:{ic:'⛵',nm:'소원 돛단배',go:'호수에 띄우기',j:['를','는','로'],short:'돛단배',desc:'내 닉네임을 돛에 단 작은 배가 호수를 천천히 흘러가요',desc2:'다른 사람이 배를 누르면 내 소원을 볼 수 있어요'},
  moon:{ic:'⭐',nm:'소원 별',go:'별에 소원 걸기',j:['을','은','로'],short:'별',desc:'달 하늘의 별 하나가 내 별이 되어 은은하게 반짝여요',desc2:'다른 사람이 그 별을 누르면 내 소원을 볼 수 있어요'}},
 icon(map,style,px){const i='nkw'+(++uid);return `<svg class="nkwi" viewBox="0 0 64 64" width="${px||56}" height="${px||56}" aria-hidden="true"><defs>${ICON[map][style](i)}</svg>`;},
 css(){if(document.getElementById('nkwCss'))return;const s=document.createElement('style');s.id='nkwCss';s.textContent=CSS;document.head.appendChild(s);},
 card(map,style,l,o={}){NKW.ui.css();let c=document.getElementById('wishCard2');if(!c){c=document.createElement('div');c.id='wishCard2';document.body.appendChild(c);}const TH=NKW.ui.THEME[map];const esc=t=>String(t==null?'':t).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const del=o.del!=null?o.del:l.mine;c.className='nkwc nkwc-'+map;
  c.innerHTML=`<div class="nkwc-deco"></div><div class="nkwc-ic">${NKW.ui.icon(map,style,58)}</div><div class="nkwc-body"><div class="nkwc-who"><b>${esc(l.nick)}</b><span>님의 ${TH.short}${l.mine?' <em>내 소원</em>':''}</span></div><p class="nkwc-txt">${esc(l.text)}</p><div class="nkwc-foot"><span class="nkwc-left">${map==='moon'?'✦':map==='lake'?'〰':'✧'} ${NKW.leftTxt(l.at)}</span><span class="nkwc-btns"><button type="button" class="h" data-wlhide>닫기</button>${del?'<button type="button" class="d" data-wldel>삭제</button>':''}</span></div></div>`;
  requestAnimationFrame(()=>c.classList.add('show'));c.classList.add('show');c.querySelector('[data-wlhide]').onclick=()=>c.classList.remove('show');return c;},
 open(map,style,o={}){NKW.ui.css();let m=document.getElementById('wishM2');if(m)m.remove();m=document.createElement('div');m.id='wishM2';m.className='nkwm nkwm-'+map;const TH=NKW.ui.THEME[map];
  const hero=map==='canal'?`<div class="nkwm-sc">${[[14,56,.75,34],[80,38,.8,30],[30,22,.6,22],[66,66,.55,22],[90,74,.45,18],[8,24,.4,16]].map(([x,y,o2,s])=>`<span class="fl" style="left:${x}%;top:${y}%;opacity:${o2}">${NKW.ui.icon(map,style,s)}</span>`).join('')}<span class="main">${NKW.ui.icon(map,style,74)}</span><i class="water"></i></div>`
   :map==='lake'?`<div class="nkwm-sc"><svg class="hills" viewBox="0 0 360 60" preserveAspectRatio="none"><path d="M0 60V34c30-18 60-26 92-10s62 6 96-10 70-6 100 6 52 14 72 6v34z" fill="#9ed49a"/><path d="M0 60V44c40-10 80-14 130-4s90 2 130-6 70 0 100 6v20z" fill="#7cc27e"/></svg><i class="water"></i><span class="fl" style="left:16%;top:62%;opacity:.55">${NKW.ui.icon(map,style,24)}</span><span class="fl" style="left:80%;top:66%;opacity:.5">${NKW.ui.icon(map,style,20)}</span><span class="main">${NKW.ui.icon(map,style,74)}</span></div>`
   :`<div class="nkwm-sc"><i class="earth"></i><span class="main">${NKW.ui.icon(map,style,78)}</span><svg class="cons" viewBox="0 0 360 120"><path d="M40 30l30 18 26-8 22 20M270 24l24 12 30-6 12 22" fill="none" stroke="#9fb4ff" stroke-opacity=".35" stroke-width="1"/><g fill="#dfe8ff"><circle cx="40" cy="30" r="1.6"/><circle cx="70" cy="48" r="1.6"/><circle cx="96" cy="40" r="1.6"/><circle cx="118" cy="60" r="1.6"/><circle cx="270" cy="24" r="1.6"/><circle cx="294" cy="36" r="1.6"/><circle cx="324" cy="30" r="1.6"/><circle cx="336" cy="52" r="1.6"/></g></svg></div>`;
  const nick=ESC(o.nick||'');
  m.innerHTML=`<div class="nkwm-box"><button type="button" class="x" aria-label="닫기">✕</button>${hero}<div class="nkwm-in"><h3>${TH.ic} ${TH.nm} 띄우기</h3>
   <label class="nkwm-f"><span class="nkwm-nick"><b>${nick}</b> 님의 소원</span><input id="wishIn2" maxlength="20" placeholder="소원을 적어 주세요 (20자)" autocomplete="off" value="${ESC(o.text||'')}"><span class="nkwm-n" id="wishN2">${(o.text||'').length}/20</span></label>
   <div class="nkwm-info">${o.had?`<span class="warn">⚠️ 지금 ${TH.short}${TH.j[1]} 사라지고 새 ${TH.short}${TH.j[2]} 바뀌어요</span>`:`<span>한 사람당 하나</span><span>2일 동안 ${map==='moon'?'반짝여요':'떠 있어요'}</span>`}</div>
   <button type="button" class="go" id="wishGo2" ${o.poor||o.left?'disabled':''}>${o.left?'잠시 뒤에 띄울 수 있어요':o.poor?'골드가 부족해요 (10,000)':`${TH.ic} ${TH.go} <small>🪙 10,000</small>`}</button></div></div>`;
  document.body.appendChild(m);const inp=m.querySelector('input');inp.oninput=()=>{m.querySelector('#wishN2').textContent=inp.value.length+'/20';};const cl=()=>{m.remove();if(o.onClose)o.onClose();};m.querySelector('.x').onclick=cl;m.addEventListener('pointerdown',e=>{if(e.target===m)cl();});return m;},
 measure(){const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return {l:Math.round(b.left*10)/10,t:Math.round(b.top*10)/10,w:Math.round(b.width*10)/10,h:Math.round(b.height*10)/10,cx:Math.round((b.left+b.width/2)*10)/10,cy:Math.round((b.top+b.height/2)*10)/10};};
  const vw=innerWidth,vh=innerHeight,out={vw,vh};for(const [k,s] of [['card','#wishCard2'],['win','#wishM2 .nkwm-box'],['ann','#stAnn'],['btn','#wishBtn'],['btnL','#wishBtnL'],['hud','#hud,.hud,#topL'],['menu','#bnav,#menuBar,.bnav']]){const e=document.querySelector(s);if(e&&e.offsetParent!==null||e&&getComputedStyle(e).position==='fixed'){const q=r(e);if(q&&q.w>0)out[k]=q;}}
  if(out.card)out.cardOff=Math.round((out.card.cx-vw/2)*10)/10;if(out.win){out.winOffX=Math.round((out.win.cx-vw/2)*10)/10;out.winOffY=Math.round((out.win.cy-vh/2)*10)/10;}
  const ov=(a,b)=>a&&b&&!(a.l+a.w<=b.l||b.l+b.w<=a.l||a.t+a.h<=b.t||b.t+b.h<=a.t);out.cardOverAnn=ov(out.card,out.ann);out.cardOverBtn=ov(out.card,out.btn)||ov(out.card,out.btnL);return out;}};
const CSS=`
#wishCard2{position:fixed;z-index:72;left:50%;top:clamp(190px,36vh,330px);transform:translate(-50%,-50%) scale(.94);opacity:0;pointer-events:none;transition:opacity .28s,transform .32s cubic-bezier(.2,1.4,.4,1);
 width:min(calc(100vw - 28px),372px);box-sizing:border-box;display:grid;grid-template-columns:64px 1fr;gap:12px;align-items:center;padding:14px 16px 13px 12px;border-radius:20px;font-family:"Jua","Noto Sans KR",system-ui,sans-serif;overflow:hidden}
#wishCard2.show{opacity:1;transform:translate(-50%,-50%) scale(1);pointer-events:auto}
#wishCard2 .nkwc-deco{position:absolute;inset:0;pointer-events:none;border-radius:inherit}
#wishCard2 .nkwc-ic{position:relative;width:64px;height:64px;display:grid;place-items:center;border-radius:18px}
#wishCard2 .nkwc-ic svg{animation:nkwBob 3.2s ease-in-out infinite;filter:drop-shadow(0 2px 6px rgba(0,0,0,.18))}
@keyframes nkwBob{50%{transform:translateY(-3px) rotate(-2deg)}}
#wishCard2 .nkwc-body{position:relative;min-width:0}
#wishCard2 .nkwc-who{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:4px;row-gap:1px;white-space:nowrap}
#wishCard2 .nkwc-who b{font-size:16px;font-weight:400;white-space:nowrap;word-break:keep-all}
#wishCard2 .nkwc-who span{font-size:12.5px;opacity:.75;flex:none}
#wishCard2 .nkwc-who em{font-style:normal;font-size:11px;padding:1px 7px;border-radius:99px;margin-left:4px;vertical-align:1px}
#wishCard2 .nkwc-txt{margin:5px 0 8px;font-size:15.5px;line-height:1.38;word-break:keep-all;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
#wishCard2 .nkwc-txt:before{content:"“";opacity:.55;margin-right:1px}#wishCard2 .nkwc-txt:after{content:"”";opacity:.55;margin-left:1px}
#wishCard2 .nkwc-foot{display:flex;align-items:center;justify-content:space-between;gap:8px}
#wishCard2 .nkwc-left{font-size:11.5px;opacity:.7;white-space:nowrap}
#wishCard2 .nkwc-btns{display:flex;gap:6px}
#wishCard2 button{border:0;border-radius:11px;padding:6px 12px;font:400 12.5px/1.1 "Jua","Noto Sans KR",system-ui,sans-serif;cursor:pointer;white-space:nowrap}
/* 운하: 한지 + 등불빛 */
.nkwc-canal{background:radial-gradient(120px 90px at 40px 50%,#ffd79a66,transparent 70%),linear-gradient(180deg,#fffaf0,#fdebd2);border:2px solid #e8b886;box-shadow:0 0 0 4px #fff4e255,0 10px 30px #5a2a0a55,0 0 40px #ffb45a40;color:#4a2c17}
.nkwc-canal .nkwc-deco{background:repeating-linear-gradient(97deg,#b0805008 0 2px,transparent 2px 7px),repeating-linear-gradient(13deg,#ffffff30 0 1px,transparent 1px 9px);border-top:5px solid #c8402c;box-shadow:inset 0 -3px 0 #c8402c22}
.nkwc-canal .nkwc-ic{background:radial-gradient(circle,#fff3d8,#ffe2b3 60%,#ffd59a00 72%)}
.nkwc-canal .nkwc-who b{color:#a2391a}.nkwc-canal .nkwc-who em{background:#ffe1c0;color:#a2391a}
.nkwc-canal button.h{background:#f3e3cc;color:#6a4a2a}.nkwc-canal button.d{background:#c8402c;color:#fff}
/* 호숫가: 돛천 + 물결 */
.nkwc-lake{background:linear-gradient(180deg,#fbfdff,#e7f5fb 70%,#d4eef8);border:2px solid #9fcbe0;box-shadow:0 10px 28px #0a3a5a40;color:#1f3a4f}
.nkwc-lake .nkwc-deco{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='12' viewBox='0 0 80 12'%3E%3Cpath d='M0 6c10-6 20-6 30 0s20 6 30 0 20-6 20-6' fill='none' stroke='%2378bcd8' stroke-opacity='.45' stroke-width='2'/%3E%3C/svg%3E") repeat-x left bottom 4px/80px 12px;outline:1.5px dashed #c9a77a99;outline-offset:-7px}
.nkwc-lake .nkwc-ic{background:radial-gradient(circle at 50% 60%,#ffffff,#dff2fa 70%,#dff2fa00 72%)}
.nkwc-lake .nkwc-who b{color:#1e5f8e}.nkwc-lake .nkwc-who em{background:#d8eefa;color:#1e5f8e}
.nkwc-lake button.h{background:#e2eef4;color:#3a5a6e}.nkwc-lake button.d{background:#d9534f;color:#fff}
/* 달: 밤하늘 유리 */
.nkwc-moon{background:radial-gradient(140px 100px at 40px 50%,#ffe7a322,transparent 70%),linear-gradient(160deg,#20295cf2,#0f1434f2);border:1px solid #9fb0ff55;box-shadow:0 10px 32px #00000080,0 0 30px #8fa8ff33,inset 0 1px 0 #ffffff22;color:#e9eeff;backdrop-filter:blur(6px)}
.nkwc-moon .nkwc-deco{background:radial-gradient(1.2px 1.2px at 20% 30%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 70% 20%,#fff 50%,transparent 51%),radial-gradient(1.4px 1.4px at 88% 64%,#ffe7a3 50%,transparent 51%),radial-gradient(1px 1px at 46% 82%,#cfe0ff 50%,transparent 51%),radial-gradient(1px 1px at 60% 50%,#fff 50%,transparent 51%);opacity:.8}
.nkwc-moon .nkwc-ic{background:radial-gradient(circle,#2c3a7a,#1a2250 70%,#1a225000 72%)}
.nkwc-moon .nkwc-who b{color:#ffe7a3}.nkwc-moon .nkwc-who em{background:#ffe7a326;color:#ffe7a3}
.nkwc-moon button.h{background:#ffffff1c;color:#dfe6ff;box-shadow:inset 0 0 0 1px #ffffff22}.nkwc-moon button.d{background:#e5576a;color:#fff}
/* 띄우기 창 */
#wishM2{position:fixed;inset:0;z-index:10050;display:grid;place-items:center;padding:16px;background:#0a0c1aa8;backdrop-filter:blur(2px);font-family:"Jua","Noto Sans KR",system-ui,sans-serif;animation:nkwFade .2s}
@keyframes nkwFade{from{opacity:0}}
#wishM2 .nkwm-box{position:relative;width:min(100%,380px);border-radius:24px;overflow:hidden;box-shadow:0 18px 50px #0008;animation:nkwPop .32s cubic-bezier(.2,1.4,.4,1)}
@keyframes nkwPop{from{transform:scale(.9);opacity:0}}
#wishM2 .x{position:absolute;top:10px;right:12px;z-index:3;width:32px;height:32px;border-radius:50%;border:0;background:#0003;color:#fff;font-size:15px;cursor:pointer}
#wishM2 .nkwm-sc{position:relative;height:132px;overflow:hidden}
#wishM2 .nkwm-sc .main{position:absolute;left:50%;top:54%;transform:translate(-50%,-50%);animation:nkwRise 3.6s ease-in-out infinite}
#wishM2 .nkwm-sc .fl{position:absolute;transform:translate(-50%,-50%);animation:nkwBob 4s ease-in-out infinite}
@keyframes nkwRise{50%{transform:translate(-50%,-58%)}}
#wishM2 .nkwm-in{padding:14px 18px 18px;text-align:center}
#wishM2 h3{margin:0 0 6px;font-size:19px;font-weight:400;white-space:nowrap}
#wishM2 .nkwm-d{margin:0 0 12px;font-size:12.5px;line-height:1.55;opacity:.8;word-break:keep-all}
#wishM2 .nkwm-f{position:relative;display:block;text-align:left}
#wishM2 .nkwm-nick{display:block;font-size:12px;margin:0 0 5px 4px;opacity:.85}
#wishM2 input{width:100%;box-sizing:border-box;height:46px;border-radius:14px;padding:0 54px 0 14px;font:400 16px "Jua","Noto Sans KR",system-ui,sans-serif;outline:none}
#wishM2 .nkwm-n{position:absolute;right:12px;bottom:14px;font-size:11.5px;opacity:.6}
#wishM2 .nkwm-info{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:10px 0 14px;font-size:11.5px}
#wishM2 .nkwm-info span{padding:3px 10px;border-radius:99px}
#wishM2 .go{width:100%;height:50px;border:0;border-radius:15px;font:400 17px "Jua","Noto Sans KR",system-ui,sans-serif;cursor:pointer;white-space:nowrap}
#wishM2 .go small{font-size:13px;opacity:.9;margin-left:4px;padding:2px 8px;border-radius:99px;background:#0002}
#wishM2 .go:disabled{opacity:.5;cursor:default}
.nkwm-canal .nkwm-box{background:linear-gradient(180deg,#fffaf0,#fdeed8);color:#4a2c17}
.nkwm-canal .nkwm-sc{background:radial-gradient(160px 70px at 50% 100%,#ffb45a66,transparent),linear-gradient(180deg,#241c4a,#5a3a6e 58%,#c8706a 100%)}
.nkwm-canal .nkwm-sc .water{position:absolute;left:0;right:0;bottom:0;height:26px;background:linear-gradient(180deg,#3a2c5a,#2a2048);box-shadow:inset 0 2px 0 #ffb45a55}
.nkwm-canal input{border:2px solid #e8c8a0;background:#fffdf8;color:#4a2c17}.nkwm-canal input:focus{border-color:#d8672e}
.nkwm-canal .nkwm-info span{background:#f8e4c8;color:#7a4a24}.nkwm-canal .nkwm-info .warn{background:#ffe0d0;color:#b0401a}
.nkwm-canal .go{background:linear-gradient(180deg,#f08a3e,#d0562a);color:#fff;box-shadow:0 4px 0 #a8401e,0 8px 20px #d0562a55}
.nkwm-lake .nkwm-box{background:linear-gradient(180deg,#fbfdff,#e9f6fb);color:#1f3a4f}
.nkwm-lake .nkwm-sc{background:linear-gradient(180deg,#8fd0ff,#d8f1ff 70%)}
.nkwm-lake .nkwm-sc .hills{position:absolute;left:0;right:0;bottom:34px;width:100%;height:46px}
.nkwm-lake .nkwm-sc .water{position:absolute;left:0;right:0;bottom:0;height:36px;background:linear-gradient(180deg,#6cc0e0,#4aa6cc)}
.nkwm-lake .nkwm-sc .main{top:60%}
.nkwm-lake input{border:2px solid #b8dcec;background:#fff;color:#1f3a4f}.nkwm-lake input:focus{border-color:#2e7fb8}
.nkwm-lake .nkwm-info span{background:#dcf0f8;color:#2a5a78}.nkwm-lake .nkwm-info .warn{background:#ffe6dc;color:#b0401a}
.nkwm-lake .go{background:linear-gradient(180deg,#43a0d8,#2a78b4);color:#fff;box-shadow:0 4px 0 #1e5a8a,0 8px 20px #2a78b455}
.nkwm-moon .nkwm-box{background:linear-gradient(170deg,#1f2858,#10153a);color:#e9eeff;box-shadow:0 18px 50px #000a,0 0 0 1px #9fb0ff33}
.nkwm-moon .nkwm-sc{background:radial-gradient(1.2px 1.2px at 12% 22%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 33% 70%,#fff 50%,transparent 51%),radial-gradient(1.3px 1.3px at 58% 18%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 76% 78%,#cfe0ff 50%,transparent 51%),radial-gradient(1.2px 1.2px at 90% 30%,#fff 50%,transparent 51%),radial-gradient(1px 1px at 46% 88%,#fff 50%,transparent 51%),linear-gradient(180deg,#070a22,#18205a)}
.nkwm-moon .nkwm-sc .earth{position:absolute;left:12%;top:58%;width:34px;height:34px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#8fd0ff,#2a6ac0 60%,#14306a);box-shadow:0 0 14px #5aa0ff66}
.nkwm-moon .nkwm-sc .cons{position:absolute;inset:0;width:100%;height:100%}
.nkwm-moon input{border:1.5px solid #8fa0e066;background:#0b1030;color:#fff}.nkwm-moon input::placeholder{color:#9aa6d8}.nkwm-moon input:focus{border-color:#ffe7a3}
.nkwm-moon .nkwm-info span{background:#ffffff14;color:#c9d4ff}.nkwm-moon .nkwm-info .warn{background:#ff8a7a26;color:#ffc0b0}
.nkwm-moon .go{background:linear-gradient(180deg,#ffe7a3,#f2c45a);color:#3a2a08;box-shadow:0 4px 0 #b8902e,0 0 24px #ffe7a355}
.nkwm-moon .x{background:#ffffff1c}
/* 달: 소원 별 버튼 (연등·돛단배 버튼과 같은 자리) */
#wishBtnM{position:fixed;z-index:56;bottom:calc(178px + env(safe-area-inset-bottom));left:calc(14px + env(safe-area-inset-left));background:#2a3474ee;color:#fff;border:2px solid #ffe7a399;border-radius:999px;padding:6px 14px;font:800 13px/1.2 system-ui,sans-serif;white-space:nowrap;box-shadow:0 4px 14px #0005,0 0 14px #ffe7a333;cursor:pointer}
@media (hover:hover) and (pointer:fine){#wishBtnM{bottom:auto;top:calc(136px + env(safe-area-inset-top));left:50%;transform:translateX(-50%)}}
@media (max-width:420px){#wishCard2{grid-template-columns:56px 1fr;gap:10px;padding:12px 13px 12px 10px}#wishCard2 .nkwc-ic{width:56px;height:56px}#wishCard2 .nkwc-ic svg{width:50px;height:50px}#wishM2 .nkwm-sc{height:118px}}
`;
/* v190: 달 ⭐ 소원 별 버튼 스타일이 카드·창을 처음 열 때만 들어가서, 그 전에는 버튼이 화면 왼쪽 위 구석에 깔려 있었어요 → 처음부터 넣어요 */
try{if(document.head)NKW.ui.css();else addEventListener('DOMContentLoaded',()=>NKW.ui.css());}catch(e){}
})();
