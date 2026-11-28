// ─────────────────────────────────────────────────────────────
// NK_HOUSE v1 — 피쉬코지 하우징 시안 (Three.js r147, 게임 미적용)
// 집 1채 = 메시 1개(아틀라스 머티리얼 1개 공유) + 밤 불빛 Points 1개 → 1~2 드로우콜
// 사용: const H=NK_HOUSE.build(THREE,{style:'A',stage:3,yard:{y1:'bench'}}); scene.add(H.group);
// ─────────────────────────────────────────────────────────────
(function(){
'use strict';
const PAL={
 logL:'#b98552',logD:'#8a5a36',logE:'#e8c995',plank:'#d6a66e',plankD:'#a8784a',plankG:'#bfae94',
 stone:'#b3b7bc',stoneD:'#868c94',stoneW:'#ece8de',
 cream:'#f8e9cc',peach:'#f6bea4',mint:'#a2d4c8',butter:'#f6da86',skyw:'#a9d3e6',pink:'#f4bfcd',lav:'#cbbbe9',white:'#fbf7ee',
 roofR:'#cc5f48',roofRD:'#a64a3a',roofT:'#4f88a6',roofTD:'#3d6f8a',roofG:'#5f9a7a',roofP:'#8f5e86',roofO:'#dc8c4c',
 shutT:'#4f8f8c',shutR:'#cf6b5a',shutB:'#5a7cc4',doorT:'#3f8088',doorR:'#b9533f',
 grass:'#92c96c',grassD:'#6dab52',leaf:'#62a052',leafD:'#3f7c46',leafL:'#a8d470',moss:'#82ad5e',dirt:'#8c6242',sand:'#efd9a8',
 glass:'#c4e6f0',lamp:'#ffe9a6',fire:'#ff9c3c',glowG:'#9cf2da',glowP:'#ffb8f0',
 red:'#ea5b56',yellow:'#ffd34c',fpink:'#ff8cba',fwhite:'#ffffff',fpurp:'#b98cff',orange:'#ff9a4a',fblue:'#7ab8ff',
 metal:'#5f6570',metalL:'#a3abb4',gold:'#eab24a',rope:'#ddc690',dark:'#3b2c28',black:'#2c2c34',
 water:'#63b8d8',waterD:'#3e8fba',waterL:'#a8e0ee',fishO:'#ff8c4c',fishB:'#6cc2ea',fishY:'#ffd862',
 mushR:'#e45a4c',mushB:'#6c8ed8',mushP:'#b47ad8',stem:'#f6e8cc',stemD:'#dcc8a4',dot:'#fff9ef',
 rugR:'#d2665c',rugB:'#5c88c2',rugY:'#f2ca62',bed:'#f8f4ec',blanket:'#7ca4da',blanket2:'#ea9c8c',book1:'#c9514b',book2:'#4b7cb2',book3:'#e9b94b',
 brick:'#c67c5c',iron:'#4b505a',paper:'#f4ecd8',sea:'#7cc6e0',
 // v2 농사
 dirtT:'#86583a',dirtW:'#5e3d2a',dirtR:'#9c6a46',mud:'#6e5a40',paddyW:'#7fc4bc',garlic:'#f6f0e2',onionP:'#b4507a',onionG:'#e6b45c',potato:'#c9965c',ginger:'#dcb274',chiliG:'#4f9a3a',tomatoG:'#8cc04c',
 basil:'#3c8a46',dill:'#b4dc84',minari:'#76c856',stemP:'#d6dc9c',wasabiL:'#3f8c5a',wasabiR:'#9ccc78',mushS:'#9a603c',straw:'#e8cf8a',bamboo:'#a9c862',sparkle:'#fff3a8',lemonL:'#fff07a'
};
// 밤에 빛나는 칸 (emissiveMap). 값=RGB
const GLOW={sparkle:[255,236,140],glass:[255,196,112],lamp:[255,226,150],fire:[255,140,50],glowG:[110,255,205],glowP:[255,150,235],waterL:[60,140,170]};
const NAMES=Object.keys(PAL),G=16,CELL=16;// 16×16 칸 · 칸 16px → 256×256 아틀라스 1장
let AT=null;
function atlas(T){if(AT)return AT;
 const mk=(fn)=>{const c=document.createElement('canvas');c.width=c.height=G*CELL;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,c.width,c.height);
  NAMES.forEach((n,i)=>{const cx=(i%G)*CELL,cy=((i/G)|0)*CELL;x.fillStyle=fn(n);x.fillRect(cx,cy,CELL,CELL);});
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.magFilter=t.minFilter=T.NearestFilter;t.generateMipmaps=false;t.flipY=true;return {t,c};};
 const base=mk(n=>PAL[n]),em=mk(n=>GLOW[n]?`rgb(${GLOW[n].join(',')})`:'#000');
 const uv=n=>{const i=NAMES.indexOf(n);if(i<0)throw new Error('palette '+n);return [((i%G)+.5)/G,1-(((i/G)|0)+.5)/G];};
 const mat=new T.MeshStandardMaterial({map:base.t,emissiveMap:em.t,emissive:0xffffff,emissiveIntensity:0,roughness:.84,metalness:0,flatShading:true});
 mat.name='NK_HOUSE_atlas';
 const gc=document.createElement('canvas');gc.width=gc.height=64;{const x=gc.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.22,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);}
 const gt=new T.CanvasTexture(gc);
 const glowMat=new T.PointsMaterial({map:gt,size:1,vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0,sizeAttenuation:true});
 AT={uv,mat,glowMat,canvas:base.c,emCanvas:em.c,NAMES};return AT;}

// ── 빌더: 파츠를 모아 mergeBufferGeometries 로 1개 지오메트리로 합쳐요 ──
const PROF={round:u=>Math.sqrt(Math.max(0,1-u*u)),bell:u=>1-Math.pow(Math.abs(u),1.6),tri:u=>1-Math.abs(u),soft:u=>Math.pow(Math.max(0,1-u*u),.75)};
function Builder(T){
 const A=atlas(T),parts=[],glows=[],stack=[];let M=new T.Matrix4();
 const E=new T.Euler(),Q=new T.Quaternion(),P=new T.Vector3(),S=new T.Vector3(),V=new T.Vector3();
 const mk=(x,y,z,rx,ry,rz,sx,sy,sz)=>{E.set(rx||0,ry||0,rz||0);Q.setFromEuler(E);P.set(x||0,y||0,z||0);S.set(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz);return new T.Matrix4().compose(P,Q,S);};
 const b={T,parts,glows,
  g(geo,col,x,y,z,rx,ry,rz,sx,sy,sz){let G=geo.index?geo.toNonIndexed():geo;for(const k of Object.keys(G.attributes))if(k!=='position'&&k!=='normal')G.deleteAttribute(k);
   G.applyMatrix4(M.clone().multiply(mk(x,y,z,rx,ry,rz,sx,sy,sz)));const [u,v]=A.uv(col),n=G.attributes.position.count,a=new Float32Array(n*2);for(let i=0;i<n;i++){a[i*2]=u;a[i*2+1]=v;}
   G.setAttribute('uv',new T.BufferAttribute(a,2));G.clearGroups();parts.push(G);return G;},
  at(x,y,z,ry,fn,s){stack.push(M);M=M.clone().multiply(mk(x,y,z,0,ry||0,0,s||1,s||1,s||1));fn();M=stack.pop();},
  atR(x,y,z,rx,ry,rz,fn){stack.push(M);M=M.clone().multiply(mk(x,y,z,rx,ry,rz));fn();M=stack.pop();},
  glow(x,y,z,size,col){V.set(x,y,z).applyMatrix4(M);glows.push([V.x,V.y,V.z,size||1,col||'#ffcf7a']);},
  box(c,w,h,d,x,y,z,rx,ry,rz){return b.g(new T.BoxGeometry(w,h,d),c,x,y,z,rx,ry,rz);},
  boxB(c,w,h,d,x,y,z,ry){return b.g(new T.BoxGeometry(w,h,d),c,x,y+h/2,z,0,ry);},// 바닥 기준
  cyl(c,rt,rb,h,seg,x,y,z,rx,ry,rz){return b.g(new T.CylinderGeometry(rt,rb,h,seg||8),c,x,y,z,rx,ry,rz);},
  cylB(c,rt,rb,h,seg,x,y,z){return b.g(new T.CylinderGeometry(rt,rb,h,seg||8),c,x,y+h/2,z);},
  sph(c,r,x,y,z,sx,sy,sz,ws,hs){return b.g(new T.SphereGeometry(r,ws||10,hs||7),c,x,y,z,0,0,0,sx,sy,sz);},
  ico(c,r,x,y,z,sx,sy,sz,det,ry){return b.g(new T.IcosahedronGeometry(r,det||0),c,x,y,z,0,ry||0,0,sx,sy,sz);},
  cone(c,r,h,seg,x,y,z,rx,ry,rz){return b.g(new T.ConeGeometry(r,h,seg||6),c,x,y,z,rx,ry,rz);},
  tor(c,r,t,x,y,z,rx,ry,rz,rs,ts,arc){return b.g(new T.TorusGeometry(r,t,rs||5,ts||14,arc||Math.PI*2),c,x,y,z,rx,ry,rz);},
  // 지붕 단면(PROF)을 길이 len 만큼 뽑아요. ry=0 이면 박공이 앞(+z)을 봐요. th>0 이면 껍질(지붕), 0 이면 꽉 찬 박공벽
  prof(c,kind,half,h,len,th,x,y,z,ry){const f=PROF[kind],N=kind==='tri'?2:16,s=new T.Shape();
   for(let i=0;i<=N;i++){const u=-1+2*i/N;const X=u*(half+th),Y=f(u)*(h+th*(kind==='tri'?1.4:1));i?s.lineTo(X,Y):s.moveTo(X,Y);}
   if(th>0){for(let i=N;i>=0;i--){const u=-1+2*i/N;s.lineTo(u*half,f(u)*h);}}
   const g=new T.ExtrudeGeometry(s,{depth:len,bevelEnabled:false});g.translate(0,0,-len/2);return b.g(g,c,x,y,z,0,ry||0);},
  // 벽 위(yTop)에 처마(ov)를 둔 지붕 + 박공벽 한 번에
  roof(cRoof,cGable,kind,half,h,len,ov,th,x,yTop,z,ry,lenOv){const k=(half+ov)/half,H=h*k;
   if(cGable)b.prof(cGable,kind,half,h,len-.02,0,x,yTop-.01,z,ry);
   b.prof(cRoof,kind,half+ov,H,len+(lenOv==null?.5:lenOv),th,x,yTop+h-H+.02,z,ry);
   return {yAt:(d)=>yTop+h-H+.02+PROF[kind](Math.min(1,Math.abs(d)/(half+ov)))*(H+th)};},
  rbox(c,w,h,d,r,x,y,z,ry){const s=new T.Shape(),W=w/2,D=d/2;s.moveTo(-W+r,-D);s.lineTo(W-r,-D);s.quadraticCurveTo(W,-D,W,-D+r);s.lineTo(W,D-r);s.quadraticCurveTo(W,D,W-r,D);s.lineTo(-W+r,D);s.quadraticCurveTo(-W,D,-W,D-r);s.lineTo(-W,-D+r);s.quadraticCurveTo(-W,-D,-W+r,-D);
   const g=new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,curveSegments:3});g.rotateX(-Math.PI/2);return b.g(g,c,x,y,z,0,ry||0);},
  arch(c,w,h,d,x,y,z,ry){const s=new T.Shape(),r=w/2;s.moveTo(-r,0);s.lineTo(r,0);s.lineTo(r,h-r);s.absarc(0,h-r,r,0,Math.PI,false);s.lineTo(-r,0);
   const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:false,curveSegments:6});g.translate(0,0,-d/2);return b.g(g,c,x,y,z,0,ry||0);},
  disc(c,r,d,x,y,z,ry,seg){return b.g(new T.CylinderGeometry(r,r,d,seg||14),c,x,y,z,Math.PI/2,ry||0,0);},// 앞(+z)을 보는 원판
  // 두 점 사이 막대
  rod(c,r,a,bb,seg){const d=new T.Vector3(bb[0]-a[0],bb[1]-a[1],bb[2]-a[2]),L=d.length();const g=new T.CylinderGeometry(r,r,L,seg||5);g.translate(0,L/2,0);
   const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());g.applyQuaternion(q);g.translate(a[0],a[1],a[2]);return b.g(g,c);},
  done(){const BG=T.BufferGeometryUtils;const geo=BG.mergeBufferGeometries(parts,false);geo.computeBoundingBox();geo.computeBoundingSphere();return {geo,glows,parts:parts.length};}
 };return b;}

// ── 공통 부품 (로컬 +z 가 바깥쪽) ──
const K={
 window(b,w,h,o){o=o||{};const fc=o.frame||'white';
  if(o.arch){b.arch(fc,w+.18,h+.12,.1,0,-.06,0);b.arch('glass',w,h,.12,0,0,.01);b.box(fc,.05,h*.9,.05,0,h*.45,.08);b.box(fc,w,.05,.05,0,h*.45,.08);}
  else if(o.round){b.disc(fc,w/2+.09,.1,0,0,0,0,16);b.disc('glass',w/2,.12,0,0,.01,0,16);b.box(fc,.05,w*.95,.05,0,0,.08);b.box(fc,w*.95,.05,.05,0,0,.08);}
  else{b.box(fc,w+.16,h+.16,.1,0,h/2,0);b.box('glass',w,h,.12,0,h/2,.01);b.box(fc,.05,h,.05,0,h/2,.08);b.box(fc,w,.05,.05,0,h/2,.08);b.box(fc,w+.3,.07,.2,0,-.03,.07);}
  const yb=o.round?-w/2:0;
  if(o.shut){const sw=o.arch?w*.5:w*.48,sh=o.arch?h*.8:h;[-1,1].forEach(s=>{b.box(o.shut,sw,sh,.06,s*(w/2+sw/2+.1),yb+sh/2,0);b.box('white',sw*.6,.04,.04,s*(w/2+sw/2+.1),yb+sh*.35,.04);b.box('white',sw*.6,.04,.04,s*(w/2+sw/2+.1),yb+sh*.7,.04);});}
  if(o.box){b.box(o.boxc||'plankD',w+.2,.22,.24,0,yb-.15,.16);const fl=['fpink','yellow','fwhite','red','fpurp'];for(let i=0;i<5;i++){b.ico('leaf',.1,-w/2+.05+i*(w-.1)/4,yb-.02,.18,1.2,.8,1);b.ico(fl[(i+(o.seed||0))%5],.07,-w/2+.05+i*(w-.1)/4+.03,yb+.05,.24);}}
  if(o.glow!==false)b.glow(0,(o.round?0:h/2),.25,o.round?.9:1.2,'#ffc878');},
 door(b,w,h,c,o){o=o||{};const fc=o.frame||'white';
  if(o.arch){b.arch(fc,w+.2,h+.1,.1,0,0,0);b.arch(c,w,h,.14,0,0,.01);b.box('dark',.04,h*.8,.02,-w*.18,h*.4,.08);b.box('dark',.04,h*.8,.02,w*.18,h*.4,.08);}
  else if(o.round){b.disc(fc,w/2+.1,.1,0,h/2,0,0,18);b.disc(c,w/2,.14,0,h/2,.01,0,18);b.box('dark',.04,w*.8,.02,0,h/2,.09);}
  else{b.box(fc,w+.18,h+.09,.1,0,(h+.09)/2,0);b.box(c,w,h,.14,0,h/2,.01);b.box('dark',.03,h*.9,.02,-w*.22,h/2,.085);b.box('dark',.03,h*.9,.02,w*.22,h/2,.085);}
  b.sph('gold',.05,w*.3,h*.48,.1,1,1,1,6,4);},
 lantern(b,o){o=o||{};const c=o.c||'iron';b.box(c,.26,.05,.26,0,.0,0);b.box('lamp',.2,.26,.2,0,.16,0);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([i,j])=>b.box(c,.03,.28,.03,i*.11,.16,j*.11));b.cone(c,.2,.14,4,0,.37,0,0,Math.PI/4);b.tor(c,.05,.012,0,.47,0,0,0,0,4,8);b.glow(0,.16,0,o.gs||2.2,'#ffc870');},
 post(b,h,c){b.cylB(c||'logD',.06,.07,h,6,0,0,0);},
 lampPost(b,h,c){b.cylB(c||'iron',.06,.09,h,8,0,0,0);b.cylB(c||'iron',.15,.18,.12,8,0,0,0);b.box(c||'iron',.5,.04,.04,.18,h-.05,0);b.at(.38,h-.55,0,0,()=>K.lantern(b,{c:c||'iron',gs:2.6}));},
 bush(b,r,x,z,c,fl){b.ico(c||'leaf',r,x,r*.7,z,1.1,.85,1.05,1);if(fl){const F=['fpink','yellow','fwhite','red','fpurp','fblue'];for(let i=0;i<fl;i++){const a=i*2.4,rr=r*.75;b.ico(F[Math.abs(i*7+((x*13)|0))%6],.07,x+Math.cos(a)*rr,r*.7+r*.55*Math.sin(i*1.3)*.6+.15,z+Math.sin(a)*rr*.9);}}},
 tree(b,x,z,s,c){s=s||1;b.cylB('logD',.12*s,.18*s,1.4*s,6,x,0,z);b.ico(c||'leaf',.95*s,x,2.05*s,z,1,.9,1,1);b.ico(c==='leafL'?'leaf':'leafD',.65*s,x+.55*s,1.75*s,z+.2*s,1,.9,1,1);b.ico('leafL',.55*s,x-.45*s,2.45*s,z+.25*s,1,.9,1,1);},
 flowers(b,x,z,n,sp,seed){const F=['fpink','yellow','fwhite','red','fpurp','fblue'];for(let i=0;i<n;i++){const px=x+(i-(n-1)/2)*sp,pz=z+((i*37+(seed||0))%5-2)*.06;b.cylB('leaf',.015,.015,.22,3,px,0,pz);b.ico(F[(i+(seed||0))%6],.08,px,.25,pz);b.ico('leafL',.07,px+.06,.08,pz,1,.6,1);}},
 fish(b,c,len,x,y,z,ry){b.at(x,y,z,ry||0,()=>{b.sph(c,len*.36,0,0,0,1.25,.82,.42,8,6);b.cone(c,len*.22,len*.28,4,-len*.56,0,0,0,0,Math.PI/2);b.sph('black',len*.05,len*.28,len*.07,len*.13,1,1,1,4,3);});},
 fence(b,x0,z0,x1,z1,c,gap){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz),n=Math.max(1,Math.round(L/.34)),ry=Math.atan2(-dz,dx);
  b.at(x0,0,z0,ry,()=>{for(let i=0;i<=n;i++){const t=i*L/n;b.box(c||'white',.1,.62,.05,t,.31,0);b.box(c||'white',.07,.07,.05,t,.64,0,0,0,Math.PI/4);}b.box(c||'white',L,.07,.04,L/2,.2,-.04);b.box(c||'white',L,.07,.04,L/2,.46,-.04);});},
 stones(b,pts,c){pts.forEach((p,i)=>b.cyl(i%2?(c||'stone'):'stoneW',p[2]||.28,(p[2]||.28)*1.05,.08,7,p[0],.04,p[1],0,i*.7,0));},
 lights(b,a,bb,n,sag){let prev=null;for(let i=0;i<=n;i++){const t=i/n,x=a[0]+(bb[0]-a[0])*t,z=a[2]+(bb[2]-a[2])*t,y=a[1]+(bb[1]-a[1])*t-Math.sin(t*Math.PI)*(sag||.3);const p=[x,y,z];if(prev)b.rod('black',.012,prev,p,3);prev=p;if(i>0&&i<n){b.sph('lamp',.055,x,y-.06,z,1,1.2,1,6,4);b.glow(x,y-.06,z,.9,i%3===0?'#ffd890':i%3===1?'#ffb0c8':'#a8e8ff');}}},
 barrel(b,x,z,c){b.cylB(c||'plankD',.27,.24,.62,10,x,0,z);b.cylB('metal',.29,.29,.04,10,x,.12,z);b.cylB('metal',.29,.29,.04,10,x,.46,z);b.cylB('plank',.24,.24,.02,10,x,.62,z);},
 crate(b,x,z,s,ry){s=s||1;b.boxB('plank',.55*s,.45*s,.55*s,x,0,z,ry);b.boxB('plankD',.58*s,.07*s,.58*s,x,.38*s,z,ry);b.boxB('plankD',.58*s,.07*s,.58*s,x,0,z,ry);},
 rodRack(b){b.cylB('logD',.05,.05,1.25,5,-.45,0,0);b.cylB('logD',.05,.05,1.25,5,.45,0,0);b.box('logD',1.05,.08,.1,0,1.1,0);b.box('logD',1.05,.08,.18,0,.2,0);
  ['plankD','red','shutB'].forEach((c,i)=>{const x=-.28+i*.28;b.rod(c,.022,[x,.2,.05],[x+.06,2.1,-.08],4);b.cyl('metal',.06,.06,.06,8,x+.012,.62,.06,0,0,Math.PI/2);b.rod('metalL',.008,[x+.06,2.1,-.08],[x+.08,1.5,.05],3);});},
 bench(b,c){b.box(c||'plankD',1.3,.08,.42,0,.42,0);b.box(c||'plankD',1.3,.3,.06,0,.68,-.19,-.12);[-1,1].forEach(s=>{b.box('iron',.06,.42,.38,s*.55,.21,0);});},
 mailbox(b){b.cylB('logD',.05,.05,1.0,5,0,0,0);b.box('roofT',.32,.26,.5,0,1.1,0);b.cyl('roofT',.16,.16,.5,8,0,1.23,0,Math.PI/2,0,0);b.box('red',.03,.25,.1,.18,1.25,-.1);},
};
// ── 콘셉트 4종 · 단계(s) 1~5 누적으로 파츠가 늘어요 ──
const PI=Math.PI;
function onSurf(b,T,c,r,center,radius,sy,theta,phi,flat){// 반구 표면에 납작한 점(버섯 무늬 등)
 const n=new T.Vector3(Math.sin(phi)*Math.cos(theta),Math.cos(phi)/Math.max(sy,.01),Math.sin(phi)*Math.sin(theta)).normalize();
 const p=[center[0]+radius*Math.sin(phi)*Math.cos(theta),center[1]+radius*sy*Math.cos(phi),center[2]+radius*Math.sin(phi)*Math.sin(theta)];
 const e=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),n));
 b.atR(p[0],p[1],p[2],e.x,e.y,e.z,()=>b.sph(c,r,0,0,0,1,flat||.35,1,8,5));}
function puffs(b,x,y,z){b.ico('stoneW',.2,x,y+.25,z,1,.9,1,1);b.ico('stoneW',.26,x+.12,y+.62,z-.05,1,.9,1,1);b.ico('stoneW',.32,x+.3,y+1.05,z-.1,1,.85,1,1);}

// A · 어부 통나무집 ─────────────────────────────
function styleA(b,s){const T=b.T;
 const W=3.6,D=2.8,H0=.3,r=.17,n=7,st=r*1.9;
 b.box('stoneD',W+.5,H0,D+.5,0,H0/2,0);for(let i=0;i<9;i++)b.box(i%2?'stone':'stoneW',.36,.18,.1,-W/2+.05+i*(W-.1)/8,.15,D/2+.27);
 b.box('logD',W-.1,n*st,D-.1,0,H0+n*st/2,0);
 for(let i=0;i<n;i++){const y=H0+r+i*st,c=i%2?'logL':'logD',c2=i%2?'logD':'logL';
  [D/2,-D/2].forEach(z=>{b.cyl(c,r,r,W+.5,7,0,y,z,0,0,PI/2);b.cyl('logE',r*.68,r*.68,W+.54,7,0,y,z,0,0,PI/2);});
  if(i<n-1)[W/2,-W/2].forEach(x=>{b.cyl(c2,r,r,D+.5,7,x,y+st/2,0,PI/2,0,0);b.cyl('logE',r*.68,r*.68,D+.54,7,x,y+st/2,0,PI/2,0,0);});}
 const HW=H0+n*st;
 const rc=s>=2?'roofR':'plankD';
 const rf=b.roof(rc,'plank','tri',D/2+r,1.35,W+.5,.45,.16,0,HW,0,PI/2,.4);
 b.cyl(s>=2?'roofRD':'plankD',.1,.1,W+1.0,6,0,rf.yAt(0)-.02,0,0,0,PI/2);
 if(s===1){b.box('plankD',.7,.06,.5,-.7,rf.yAt(.9)+.02,.9,.66,0,0);b.box('plank',.5,.06,.4,1.1,rf.yAt(-.9)+.02,-.9,-.66,0,0);}// 덧댄 판자
 const ang=Math.atan((1.35*1.29+.22)/(D/2+r+.45));
 if(s>=2)[[-1.2,.75],[.9,1.25],[1.5,-.6],[-.3,-1.4]].forEach(([x,z])=>b.atR(x,rf.yAt(z)-.05,z,z>0?ang:-ang,0,0,()=>b.ico('moss',.26,0,0,0,1.5,.32,1.2,1)));
 const FZ=D/2+r+.02;
 b.at(-.55,H0,FZ,0,()=>K.door(b,.86,1.7,s>=2?'doorR':'plankD',{frame:'logD'}));
 if(s>=2)b.at(-.55,H0+1.95,FZ+.02,0,()=>{b.box('plankD',.9,.32,.06,0,0,0);K.fish(b,'fishO',.42,0,0,.07,0);});
 b.at(.95,H0+.85,FZ,0,()=>K.window(b,s>=2?.62:.5,s>=2?.62:.5,{frame:'logE',shut:s>=2?'shutT':null,box:s>=2,boxc:'plankD'}));
 b.at(.7,H0+.85,-FZ,PI,()=>K.window(b,.55,.55,{frame:'logE'}));if(s>=2)b.at(-W/2-r-.02,H0+.95,.3,-PI/2,()=>K.window(b,.5,.5,{frame:'logE',shut:'shutT'}));
 if(s>=2)b.at(W/2+r+.02,H0+.85,0,PI/2,()=>K.window(b,.6,.6,{frame:'logE',box:true,boxc:'plankD',seed:2}));
 if(s===1){b.cylB('logD',.28,.32,.4,8,1.0,0,2.2);b.cylB('logE',.24,.24,.02,8,1.0,.4,2.2);b.rod('metalL',.03,[1.0,.4,2.2],[1.25,.85,2.3],4);b.box('metal',.06,.18,.14,1.25,.85,2.3);
  b.cylB('metalL',.18,.14,.3,8,-1.5,0,1.9);K.fish(b,'fishB',.3,-1.5,.36,1.9,.4);b.at(-2.0,0,1.5,.4,()=>K.rodRack(b));}
 // 2단계: 앞 데크 · 낚싯대 거치대 · 통
 const DZ0=D/2+.2,DZ1=D/2+1.75,DX=W/2+.5;
 if(s>=2){for(let i=0;i<6;i++)b.box(i%2?'plank':'plankD',DX*2,.1,(DZ1-DZ0)/6-.02,0,H0-.05,DZ0+(i+.5)*(DZ1-DZ0)/6);
  [-DX+.1,DX-.1].forEach(x=>b.cylB('logD',.07,.07,H0,6,x,0,DZ1-.1));
  b.boxB('plankD',1.0,.15,.35,-.55,0,DZ1+.18);
  b.at(-1.75,H0,DZ0+.45,0,()=>K.rodRack(b));b.at(0,H0,0,0,()=>{K.barrel(b,1.95,DZ0+1.15);});
  b.at(1.3,H0,DZ1-.35,0,()=>{b.cylB('metalL',.17,.13,.28,8,0,0,0);K.fish(b,'fishB',.28,0,.33,0,.5);K.fish(b,'fishY',.24,.05,.37,.05,2);});}
 // 3단계: 굴뚝 · 현관 지붕 · 장작 헛간
 if(s>=3){const cx=1.05,cz=-.75,top=rf.yAt(.75)+.9;for(let y=HW-.4,i=0;y<top;y+=.3,i++)b.box(i%2?'stone':'stoneD',.62+(i%3)*.04,.3,.62,cx,y+.15,cz);b.box('stoneD',.8,.12,.8,cx,top+.06,cz);
  puffs(b,cx,top+.1,cz);
  const PZ=DZ1-.12,py=2.0;[-DX+.15,DX-.15].forEach(x=>b.cylB('logD',.07,.08,py-H0,6,x,H0,PZ));b.box('logD',DX*2,.12,.12,0,py,PZ);
  b.box('roofR',DX*2+.3,.1,1.7,0,py+.24,DZ0+.95,-.17,0,0);b.box('roofRD',DX*2+.3,.12,.08,0,py+.1,DZ1+.12);
  const lx=-W/2-.95;[[lx-.5,-1.1],[lx-.5,1.1]].forEach(([x,z])=>b.cylB('logD',.06,.07,1.75,6,x,0,z));b.box('roofR',1.45,.1,2.6,lx-.05,1.95,0,0,0,-.22);
  for(let row=0;row<3;row++)for(let k=0;k<5-row;k++){const y=.16+row*.27,z=-.85+row*.15+k*.33;b.cyl('logD',.13,.13,.85,7,lx,y,z,0,0,PI/2);b.cyl('logE',.1,.1,.87,7,lx,y,z,0,0,PI/2);}}
 // 4단계: 다락 지붕창 · 둥근 다락창 · 울타리 · 텃밭 · 우체통
 if(s>=4){const dx=.35,dz=.7;b.box('logL',1.05,1.0,1.2,dx,rf.yAt(1.2)+.35,dz);b.at(dx,rf.yAt(1.2)+.25,dz+.62,0,()=>K.window(b,.48,.48,{frame:'logE'}));
  b.roof('roofR','plank','tri',.53,.42,1.2,.14,.1,dx,rf.yAt(1.2)+.85,dz,0,.15);
  b.at(W/2+.27,HW+.55,0,PI/2,()=>K.window(b,.46,.46,{frame:'logE',round:true}));
  const FZ2=4.35,FX=3.75;K.fence(b,-FX,FZ2,-.75,FZ2,'white');K.fence(b,.75,FZ2,FX,FZ2,'white');K.fence(b,-FX,1.0,-FX,FZ2,'white');K.fence(b,FX,1.0,FX,FZ2,'white');
  K.stones(b,[[-.55,3.55,.26],[-.4,4.05,.24],[-.6,4.6,.27],[-.45,5.15,.25]]);
  b.at(.95,0,4.75,0,()=>K.mailbox(b));
  const vx=3.0,vz=-1.5;b.boxB('plankD',1.0,.3,1.6,vx,0,vz);b.boxB('dirt',.9,.06,1.5,vx,.27,vz);for(let i=0;i<3;i++){b.ico('leafL',.18,vx-.22,.42,vz-.5+i*.5,1,.75,1,1);b.cone('orange',.07,.22,5,vx+.22,.38,vz-.5+i*.5,PI);b.cone('leaf',.08,.2,4,vx+.22,.52,vz-.5+i*.5);}}
 // 5단계: 전구 줄 · 랜턴 기둥 · 물고기 풍향계 · 나무 · 벤치 · 꽃밭
 if(s>=5){K.lights(b,[-DX+.15,2.02,DZ1-.05],[DX-.15,2.02,DZ1-.05],11,.28);
  [-1.0,1.0].forEach(x=>b.at(x-.0,0,4.35,0,()=>{b.cylB('logD',.07,.08,1.15,6,0,0,0);b.at(0,1.15,0,0,()=>K.lantern(b,{c:'iron'}));}));
  const vx=-1.3,vy=rf.yAt(0);b.cylB('iron',.03,.03,.95,4,vx,vy,0);b.box('iron',.5,.03,.03,vx,vy+.55,0);b.box('iron',.03,.03,.5,vx,vy+.55,0);K.fish(b,'gold',.6,vx,vy+.98,0,.6);
  K.tree(b,-3.6,-2.0,1.1);K.tree(b,3.7,-3.0,.8,'leafL');b.at(-2.55,0,3.55,.25,()=>K.bench(b));
  K.flowers(b,-2.2,4.05,8,.3,1);K.flowers(b,2.2,4.05,8,.3,4);K.bush(b,.45,3.2,1.4,'leaf',6);K.bush(b,.4,-3.2,1.6,'leafD',5);}
}

// B · 둥근 지붕 운하 코티지 ─────────────────────
function styleB(b,s){const W=3.2,D=3.0,H=2.4,Y0=.22;
 b.rbox('stoneD',W+.24,Y0,D+.24,.3,0,0,0);b.rbox(s>=2?'cream':'stoneW',W,H,D,.32,0,Y0,0);b.rbox('white',W+.06,.1,D+.06,.33,0,Y0+H-.1,0);
 const rf=b.roof('roofT','cream','round',W/2,1.3,D,.26,.17,0,Y0+H,0,0,.55);
 const FZ=D/2+.01;
 b.at(0,Y0,FZ,0,()=>K.door(b,.9,1.75,'doorT',{arch:true,frame:'white'}));
 b.at(0,Y0+H+.55,FZ-.0,0,()=>K.window(b,.56,.56,{round:true,frame:'white'}));
 b.boxB('stone',1.3,.12,.4,0,0,FZ+.22);
 b.at(0,Y0+.8,-FZ,PI,()=>K.window(b,.6,.95,{arch:true,frame:'white',shut:s>=2?'shutT':null}));b.at(0,Y0+H+.55,-FZ,PI,()=>K.window(b,.5,.5,{round:true,frame:'white'}));b.at(-W/2-.01,Y0+.8,.2,-PI/2,()=>K.window(b,.55,.9,{arch:true,frame:'white',box:s>=2,boxc:'shutR',seed:4}));
 b.at(W/2+.01,Y0+.8,0,PI/2,()=>K.window(b,.6,.95,{arch:true,frame:'white',shut:s>=2?'shutR':null,box:s>=2,boxc:'shutR',seed:1}));
  const pot=(x,z,c)=>{b.cylB('brick',.17,.13,.32,8,x,0,z);b.ico(c||'leaf',.24,x,.48,z,1,.9,1,1);b.ico('fpink',.07,x+.1,.62,z+.12);b.ico('yellow',.07,x-.12,.58,z+.1);};
 pot(.85,FZ+.35);
 if(s>=2){[-1.05,1.05].forEach((x,i)=>b.at(x,Y0+.85,FZ,0,()=>K.window(b,.52,.8,{arch:true,frame:'white',box:true,boxc:'shutR',seed:i*2})));
  b.at(0,Y0+2.0,FZ,0,()=>{for(let i=0;i<6;i++){const x=-.5+i*.2;b.box(i%2?'white':'roofO',.2,.06,.6,x,0,.27,.38,0,0);b.box(i%2?'white':'roofO',.2,.17,.04,x,-.2,.55);}b.box('roofO',1.24,.05,.05,0,-.1,.55);});
  b.boxB('stone',1.3,.12,.4,0,0,FZ+.6);pot(-.85,FZ+.35,'leafD');}
 if(s>=3){const tx=2.45,tz=-.65,tw=2.1,td=2.3,th=3.9;b.rbox('stoneD',tw+.2,Y0,td+.2,.3,tx,0,tz);b.rbox('peach',tw,th,td,.3,tx,Y0,tz);b.rbox('white',tw+.06,.1,td+.06,.32,tx,Y0+th-.1,tz);
  b.roof('roofR','peach','bell',tw/2,1.5,td,.22,.16,tx,Y0+th,tz,0,.45);
  b.at(tx,Y0+.75,tz+td/2,0,()=>K.window(b,.55,.9,{arch:true,frame:'white',shut:'shutT',box:true,boxc:'shutT',seed:3}));
  b.at(tx,Y0+th+.55,tz+td/2,0,()=>K.window(b,.42,.42,{round:true,frame:'white'}));
  if(s<4)b.at(tx,Y0+2.35,tz+td/2,0,()=>K.window(b,.5,.8,{arch:true,frame:'white',shut:'shutT'}));
  b.at(tx,Y0+.75,tz-td/2,PI,()=>K.window(b,.5,.85,{arch:true,frame:'white'}));b.at(tx,Y0+2.35,tz-td/2,PI,()=>K.window(b,.5,.85,{arch:true,frame:'white',shut:'shutT'}));
  b.at(tx+tw/2,Y0+2.35,tz,PI/2,()=>K.window(b,.5,.8,{arch:true,frame:'white'}));}
 if(s>=4){const tx=2.45,tz=-.65+1.15;b.at(tx,Y0+2.1,tz,0,()=>K.door(b,.62,1.25,'doorT',{arch:true,frame:'white'}));
  b.box('white',1.9,.12,.85,tx,Y0+2.05,tz+.42);for(let i=0;i<8;i++)b.box('white',.06,.5,.06,tx-.88+i*.251,Y0+2.35,tz+.82);b.box('white',1.9,.07,.09,tx,Y0+2.62,tz+.82);
  [-1,1].forEach(sx=>{for(let i=0;i<3;i++)b.box('white',.06,.5,.06,tx+sx*.92,Y0+2.35,tz+.1+i*.3);b.box('white',.09,.07,.85,tx+sx*.92,Y0+2.62,tz+.42);});
  K.flowers(b,tx,tz+.62,6,.26,2);
  for(let k=0;k<7;k++)b.cone('shutR',.07,.25,4,tx-.75+k*.25,Y0+1.9,tz+.82,PI);
  const cx=-.95,cz=-.7,top=rf.yAt(cx)+.75;b.boxB('brick',.5,top-(Y0+H),.5,cx,Y0+H,cz);b.boxB('brick',.62,.12,.62,cx,top,cz);puffs(b,cx,top+.12,cz);
  [-1.25,-2.0].forEach((x,i)=>K.bush(b,.42,x,1.9+i*.25,'leaf',i?4:5));K.bush(b,.38,1.35,2.1,'leafD',3);}
 if(s>=5){const ax=0,az=3.6;[-1,1].forEach(sx=>b.cylB('white',.06,.06,1.7,6,ax+sx*.75,0,az));b.tor('leaf',.75,.1,ax,1.7,az,0,0,0,5,12,PI);
  for(let i=0;i<9;i++){const a=i/8*PI;b.ico(['fpink','red','fwhite'][i%3],.1,ax+Math.cos(a)*.75,1.7+Math.sin(a)*.75,az+.08);}
  [-1,1].forEach(sx=>{for(let k=0;k<3;k++)b.ico('leaf',.13,ax+sx*.75,.4+k*.45,az+.05,1,1.1,1);});
  b.at(-2.55,0,2.2,0,()=>K.lampPost(b,2.6,'black'));K.lights(b,[-2.4,2.55,2.2],[-1.55,Y0+H-.1,1.45],6,.18);K.lights(b,[1.55,Y0+H-.1,1.45],[2.0,Y0+2.6,1.3],4,.12);
  b.at(-2.7,0,.2,PI/2,()=>K.bench(b,'shutT'));
  b.cylB('stoneW',.08,.12,.75,8,2.7,0,2.6);b.cylB('stoneW',.38,.12,.14,10,2.7,.75,2.6);b.cylB('water',.3,.3,.02,10,2.7,.84,2.6);b.ico('yellow',.07,2.85,.92,2.55,1.2,.9,1);
  K.tree(b,-3.3,-2.3,1.05,'leaf');K.flowers(b,-1.7,3.2,5,.26,3);K.flowers(b,1.7,3.2,5,.26,5);K.stones(b,[[0,2.35,.25],[.1,2.95,.24],[-.05,4.2,.26]]);}
}

// C · 수상 보트하우스 ───────────────────────────
function styleC(b,s){
 if(s===1){for(let i=0;i<6;i++){const x=-1.0+i*.4;b.cyl(i%2?'logL':'logD',.17,.17,3.0,7,x,.1,0,PI/2,0,0);b.cyl('logE',.12,.12,3.04,7,x,.1,0,PI/2,0,0);}
  [-1.1,1.1].forEach(z=>b.box('plankD',2.5,.08,.2,0,.3,z));
  const Y=.3;b.boxB('plankG',1.7,1.45,1.5,0,Y,-.4);for(let i=0;i<5;i++)b.box(i%2?'plank':'plankG',.32,1.45,.04,-.64+i*.32,Y+.72,.37);
  b.boxB('dark',.5,1.0,.04,-.35,Y,.38);b.at(.45,Y+.95,.38,0,()=>K.window(b,.32,.32,{round:true,frame:'metalL'}));
  b.roof('roofT',null,'tri',.85,.6,1.5,.25,.1,0,Y+1.45,-.4,PI/2,.4);
  b.cylB('logD',.04,.04,1.6,5,1.0,Y,.95);b.at(1.0,Y+1.6,.95,0,()=>K.lantern(b,{c:'iron'}));
  b.rod('plankD',.022,[-.9,Y+.1,1.1],[-1.6,Y+1.8,2.2],4);b.rod('metalL',.006,[-1.6,Y+1.8,2.2],[-1.9,0,2.9],3);b.sph('red',.07,-1.9,.03,2.9,1,1,1,6,4);
  b.cylB('metalL',.16,.13,.26,8,.5,Y,.8);K.fish(b,'fishB',.26,.5,Y+.3,.8,.5);return;}
 const PY=1.05,PW=4.4,PD=s>=3?4.4:3.4,PZ=s>=3?.6:.1;
 // 기둥 · 바닥
 const posts=[];for(let i=0;i<4;i++)for(let j=0;j<3;j++)posts.push([-PW/2+.2+i*(PW-.4)/3,PZ-PD/2+.2+j*(PD-.4)/2]);
 posts.forEach(([x,z])=>{b.cylB('logD',.12,.13,PY+.6,7,x,-.6,z);b.cylB('waterL',.2,.2,.04,10,x,0,z);});
 for(let i=0;i<4;i++)b.rod('logD',.04,[-PW/2+.2+i*(PW-.4)/3,.15,PZ-PD/2+.2],[-PW/2+.2+i*(PW-.4)/3,PY-.15,PZ+PD/2-.2],4);
 const nP=Math.round(PD/.32);for(let i=0;i<nP;i++)b.box(i%2?'plank':'plankD',PW,.12,PD/nP-.02,0,PY,PZ-PD/2+(i+.5)*PD/nP);
 const HY=PY+.06,HW=3.0,HD=2.2,HH=2.0,HZ=-.55;
 b.boxB('skyw',HW,HH,HD,0,HY,HZ);for(let k=1;k<6;k++)b.box('white',HW+.03,.035,HD+.03,0,HY+k*HH/6,HZ);
 [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([i,j])=>b.boxB('white',.12,HH,.12,i*HW/2,HY,HZ+j*HD/2));
 const rf=b.roof('roofT','white','tri',HD/2,.95,HW,.38,.14,0,HY+HH,HZ,PI/2,.5);
 for(let k=-4;k<=4;k++)b.box('roofTD',.05,.04,2.2,k*.36,rf.yAt(0)-.55,HZ,0,0,0);
 const FZ=HZ+HD/2+.01;b.at(-.6,HY,FZ,0,()=>K.door(b,.8,1.65,'shutR',{frame:'white'}));
 b.at(.75,HY+.8,FZ,0,()=>K.window(b,.62,.6,{frame:'white',shut:s>=3?'shutT':null,box:s>=3,boxc:'shutT'}));
 b.at(.3,HY+.8,HZ-HD/2-.01,PI,()=>K.window(b,.7,.6,{frame:'white',shut:'shutT'}));b.at(-HW/2-.01,HY+.8,HZ,-PI/2,()=>K.window(b,.6,.6,{frame:'white'}));
 b.at(HW/2+.01,HY+1.0,HZ,PI/2,()=>K.window(b,.42,.42,{round:true,frame:'metalL'}));
 b.at(HW/2+.07,HY+1.0,HZ+.75,PI/2,()=>{b.tor('fwhite',.24,.07,0,0,0,0,0,0,5,12,PI);b.tor('red',.24,.07,0,0,0,0,0,PI,5,12,PI);});
 const LZ=PZ+PD/2;
 b.rod('metalL',.03,[1.3,PY+.06,LZ],[1.3,-.5,LZ+.05],4);b.rod('metalL',.03,[1.75,PY+.06,LZ],[1.75,-.5,LZ+.05],4);for(let k=0;k<5;k++)b.box('metalL',.45,.03,.05,1.525,PY-.12-k*.3,LZ+.02);
 b.at(-1.5,HY,FZ+.35,0,()=>{K.barrel(b,0,0,'plankG');});
 if(s>=3){const RZ=PZ+PD/2-.08;for(let i=0;i<6;i++){const x=-PW/2+.12+i*(PW-.24)/5;if(Math.abs(x-1.52)<.4)continue;b.cylB('logD',.05,.05,.8,5,x,PY,RZ);}
  b.rod('rope',.025,[-PW/2+.12,PY+.75,RZ],[1.1,PY+.75,RZ],4);b.rod('rope',.025,[-PW/2+.12,PY+.75,RZ],[-PW/2+.12,PY+.75,PZ-PD/2+.12],4);
  [-PW/2+.12].forEach(x=>{for(let j=0;j<3;j++)b.cylB('logD',.05,.05,.8,5,x,PY,RZ-j*(PD-.24)/2);});
  const bx=3.15,bz=2.4;b.atR(bx,.05,bz,0,.15,0,()=>{b.g(new b.T.SphereGeometry(.6,10,6,0,PI*2,PI/2,PI/2),'roofR',0,.25,0,0,0,0,.9,.55,2.1);b.g(new b.T.TorusGeometry(.6,.05,4,14),'white',0,.25,0,PI/2,0,0,.9,2.1,1);b.box('plankD',.95,.06,.25,0,.2,.2);b.box('plankD',.85,.06,.22,0,.2,-.55);});
  b.rod('rope',.018,[bx-.2,.35,bz-1.0],[PW/2-.1,PY+.1,1.7],3);
  b.at(-1.3,PY+.06,RZ-.6,PI*.15,()=>{b.box('roofR',.55,.06,.5,0,.4,0);b.box('roofR',.55,.5,.06,0,.68,-.25,-.25);[-1,1].forEach(sx=>{b.rod('metalL',.025,[sx*.25,0,.2],[sx*.25,.4,-.2],4);b.rod('metalL',.025,[sx*.25,0,-.2],[sx*.25,.4,.2],4);});
   b.rod('plankD',.022,[.3,.45,.2],[.9,1.9,1.4],4);b.rod('metalL',.006,[.9,1.9,1.4],[1.2,-1.0,2.2],3);});
  [[1.5,-0],[1.95,.25]].forEach(([x,z])=>{b.boxB('metal',.45,.35,.45,x,PY+.06,PZ+z-.1);b.boxB('rope',.4,.02,.4,x,PY+.42,PZ+z-.1);});}
 if(s>=4){const lx=-.7,lz=HZ,ly=HY+HH;b.boxB('mint',1.5,1.55,1.5,lx,ly-.2,lz);b.box('white',1.56,.08,1.56,lx,ly+1.35,lz);
  b.at(lx,ly+.45,lz+.76,0,()=>K.window(b,.62,.5,{frame:'white',box:true,boxc:'shutT',seed:3}));b.at(lx-.76,ly+.45,lz,-PI/2,()=>K.window(b,.42,.42,{round:true,frame:'white'}));
  b.roof('roofR','white','tri',.75,.6,1.5,.22,.12,lx,ly+1.35,lz,0,.25);
  const sx0=-PW/2,sx1=-5.0;for(let i=0;i<8;i++){const t=i/7,x=sx0+(sx1-sx0)*t-.15,y=PY-.05-t*.75;b.box(i%2?'plank':'plankD',.36,.08,.9,x,y,-.6,0,0,-.21);}
  [[sx0-.8,-1.1],[sx0-.8,-.1],[sx0-1.7,-1.1],[sx0-1.7,-.1]].forEach(([x,z],i)=>b.cylB('logD',.07,.07,1.6-i*.15,6,x,-.4,z));b.rod('rope',.022,[sx0,PY+.7,-1.05],[sx0-1.8,.95,-1.05],3);b.rod('rope',.022,[sx0,PY+.7,-.15],[sx0-1.8,.95,-.15],3);
  const nx=1.75,nz=PZ+PD/2-1.15;b.cylB('logD',.05,.05,1.55,5,nx-.4,PY,nz-.2);b.cylB('logD',.05,.05,1.55,5,nx+.4,PY,nz+.2);
  for(let k=0;k<5;k++){b.rod('rope',.012,[nx-.4,PY+.4+k*.27,nz-.2],[nx+.4,PY+.4+k*.27-.05,nz+.2],3);}for(let k=0;k<5;k++){const t=k/4;b.rod('rope',.012,[nx-.4+.8*t,PY+1.5,nz-.2+.4*t],[nx-.4+.8*t,PY+.4,nz-.2+.4*t],3);}
  b.sph('orange',.1,nx-.1,PY+1.0,nz-.05,1,1,1,6,4);b.sph('fwhite',.1,nx+.15,PY+.75,nz+.08,1,1,1,6,4);}
 if(s>=5){const lx=2.05,lz=PZ+PD/2-.35,y0=PY+.06;for(let k=0;k<5;k++)b.cylB(k%2?'red':'fwhite',.34-k*.025,.36-k*.025,.5,10,lx,y0+k*.5,lz);
  const ty=y0+2.5;b.cylB('black',.4,.4,.08,10,lx,ty,lz);b.cylB('lamp',.24,.24,.42,8,lx,ty+.08,lz);for(let k=0;k<6;k++){const a=k/6*PI*2;b.cylB('black',.02,.02,.42,3,lx+Math.cos(a)*.25,ty+.08,lz+Math.sin(a)*.25);}
  b.cone('red',.38,.38,10,lx,ty+.7,lz);b.sph('gold',.06,lx,ty+.92,lz,1,1,1,6,4);b.glow(lx,ty+.3,lz,4.2,'#ffd27a');
  K.lights(b,[lx,ty-.05,lz],[0,rf.yAt(1.55)-.05,HZ+1.55],9,.35);K.lights(b,[0,rf.yAt(1.55)-.05,HZ+1.55],[-PW/2+.12,PY+.8,PZ+PD/2-.08],6,.2);
  [[-2.6,3.6],[.0,4.9],[-3.5,1.9]].forEach(([x,z],i)=>{b.cyl('leaf',.36,.36,.03,10,x,.03,z);b.cylB('stoneW',.08,.1,.12,6,x,.04,z);b.sph('lamp',.07,x,.22,z,1,1.3,1,6,4);b.glow(x,.24,z,1.4,'#ffcf7a');b.ico('fpink',.07,x+.2,.07,z-.15);});
  for(let k=0;k<6;k++){const t=k/5;b.box(['red','yellow','fblue','fpink','leafL','orange'][k],.18,.2,.02,-.2+t*1.8,rf.yAt(0)+.15-t*.75,HZ+.04,0,0,PI/4);} }
}

// D · 버섯 동화 집 ──────────────────────────────
function styleD(b,s){const T=b.T;const SH=2.15,RB=1.38,RT=1.12;
 b.g(new T.CylinderGeometry(RT,RB,SH,16),'stem',0,SH/2,0);b.cyl('stemD',RB+.12,RB+.2,.22,16,0,.11,0);
 for(let i=0;i<8;i++){const a=i/8*PI*2+.3;b.ico(i%2?'stone':'stoneD',.24,Math.cos(a)*(RB+.2),.12,Math.sin(a)*(RB+.2),1.2,.6,1);}
 const CY=SH-.15,CR=2.15,SY=.72;
 b.g(new T.SphereGeometry(CR,18,8,0,PI*2,0,PI/2),'mushR',0,CY,0,0,0,0,1,SY,1);b.cyl('stemD',CR-.05,CR-.05,.06,18,0,CY-.01,0);b.tor('mushR',CR-.04,.13,0,CY,0,PI/2,0,0,5,22);
 const dots=[[0,.0,.42],[.6,.55,.33],[1.3,.5,.36],[2.0,.55,.3],[2.7,.6,.36],[3.4,.6,.3],[4.1,.5,.36],[4.8,.6,.33],[5.5,.5,.3],[.3,1.1,.26],[1.05,1.05,.24],[1.8,1.15,.27],[2.5,1.05,.22],[3.9,1.1,.25],[5.2,1.15,.24]];
 dots.forEach(([t,p,r])=>onSurf(b,T,'dot',r,[0,CY,0],CR,SY,t+.4,p,.32));
 const rAt=y=>RB+(RT-RB)*y/SH;
 b.at(0,.0,rAt(.8)-.08,0,()=>K.door(b,.88,1.6,s>=2?'doorR':'plankD',{arch:true,frame:'logD'}));b.boxB('stone',1.0,.1,.45,0,0,rAt(0)+.25);
 const sw=(a,y,o)=>b.at(Math.sin(a)*(rAt(y)-.05),y,Math.cos(a)*(rAt(y)-.05),a,()=>K.window(b,o.w||.5,o.w||.5,Object.assign({round:true,frame:'logD'},o)));
 sw(.95,1.35,{w:.5});sw(PI-.5,1.3,{w:.5});sw(PI+.8,.95,{w:.42});sw(-1.9,1.5,{w:.38});
 if(s===1){b.cylB('stemD',.12,.14,.35,7,1.6,0,1.4);b.g(new T.SphereGeometry(.3,10,5,0,PI*2,0,PI/2),'mushR',1.6,.33,1.4,0,0,0,1,.7,1);}
 const mini=(x,z,sc,c)=>{b.cylB('stem',.09*sc,.12*sc,.45*sc,7,x,0,z);b.g(new T.SphereGeometry(.32*sc,10,5,0,PI*2,0,PI/2),c,x,.42*sc,z,0,0,0,1,.75,1);b.sph('dot',.06*sc,x+.12*sc,.6*sc,z+.1*sc,1,.5,1,5,3);};
 if(s>=2){sw(-1.0,1.25,{w:.46,box:true,boxc:'logD',seed:2});
  K.stones(b,[[0,2.05,.28],[.2,2.65,.26],[.0,3.25,.29],[.25,3.85,.26]]);mini(1.85,1.2,1,'mushR');mini(2.3,.6,.7,'mushP');mini(-1.9,1.4,.85,'mushR');
  b.rod('logD',.03,[.55,1.72,rAt(1.7)-.05],[.75,1.72,rAt(1.7)+.25],4);b.at(.75,1.38,rAt(1.7)+.25,0,()=>K.lantern(b,{c:'logD',gs:1.8}));
  for(let i=0;i<9;i++){const a=-1.25+i*.31;b.cylB('logD',.03,.035,.5+(i%2)*.1,4,Math.sin(a)*2.95,0,Math.cos(a)*2.95);}b.g(new T.TorusGeometry(2.95,.025,3,30,2.5),'logD',0,.35,0,PI/2,0,PI/2-1.25);}
 if(s>=3){const mx=2.45,mz=-.55,sh=1.55;b.g(new T.CylinderGeometry(.82,.98,sh,14),'stem',mx,sh/2,mz);b.g(new T.SphereGeometry(1.4,16,7,0,PI*2,0,PI/2),'mushB',mx,sh-.1,mz,0,0,0,1,.7,1);b.tor('mushB',1.36,.1,mx,sh-.1,mz,PI/2,0,0,4,18);
  [[0,.25,.3],[1,.5,.25],[2.1,.45,.28],[3.2,.55,.24],[4.4,.5,.27],[5.4,.5,.25],[.6,1.0,.2],[2.6,1.0,.2]].forEach(([t,p,r])=>onSurf(b,T,'dot',r,[mx,sh-.1,mz],1.4,.7,t,p,.32));
  b.at(mx+Math.sin(.5)*.9,.85,mz+Math.cos(.5)*.9,.5,()=>K.window(b,.42,.42,{round:true,frame:'logD',box:true,boxc:'logD',seed:4}));
  b.cyl('stem',.45,.45,.9,10,1.35,.75,-.35,0,0,PI/2);
  const px=-1.0,pz=-.6,py=CY+CR*SY*.62;b.cylB('iron',.12,.12,.8,8,px,py,pz);b.atR(px-.05,py+.85,pz,0,0,.5,()=>b.cyl('iron',.12,.12,.45,8,0,0,0));b.cylB('iron',.12,.12,.4,8,px-.25,py+1.03,pz);b.cylB('iron',.2,.16,.1,8,px-.25,py+1.43,pz);puffs(b,px-.25,py+1.5,pz);}
 if(s>=4){const ty=CY+CR*SY-.15,sh=1.25;b.g(new T.CylinderGeometry(.55,.72,sh,12),'stem',0,ty+sh/2,0);b.g(new T.SphereGeometry(1.25,14,7,0,PI*2,0,PI/2),'mushP',0,ty+sh-.1,0,0,0,0,1,.75,1);b.tor('mushP',1.22,.09,0,ty+sh-.1,0,PI/2,0,0,4,18);
  [[.2,.3,.22],[1.4,.45,.2],[2.6,.5,.2],[3.8,.45,.2],[5.0,.5,.2],[.8,.0,.24]].forEach(([t,p,r])=>onSurf(b,T,'dot',r,[0,ty+sh-.1,0],1.25,.75,t,p,.32));
  b.at(0,ty+.2,.62,0,()=>K.door(b,.48,.8,'doorR',{arch:true,frame:'logD'}));
  b.g(new T.CylinderGeometry(1.15,1.15,.08,18,1,false,-1.2,2.4),'plank',0,ty+.04,0);for(let i=0;i<9;i++){const a=-1.15+i*.2875;b.cylB('logD',.025,.025,.42,4,Math.sin(a)*1.1,ty,Math.cos(a)*1.1);}
  b.g(new T.TorusGeometry(1.1,.03,3,20,2.3),'logD',0,ty+.42,0,PI/2,0,PI/2-1.15);
  b.rod('rope',.03,[-1.35,0,1.55],[-.95,ty,.8],4);b.rod('rope',.03,[-1.0,0,1.75],[-.6,ty,.95],4);for(let k=1;k<9;k++){const t=k/9;b.rod('plankD',.025,[-1.35+.4*t,ty*t,1.55-.75*t],[-1.0+.4*t,ty*t,1.75-.8*t],3);}
  K.flowers(b,1.2,2.2,4,.25,1);K.flowers(b,-1.4,2.4,3,.25,3);}
 if(s>=5){const gm=(x,z,sc,c)=>{b.cylB('stem',.07*sc,.1*sc,.5*sc,6,x,0,z);b.g(new T.SphereGeometry(.28*sc,10,5,0,PI*2,0,PI/2),c,x,.47*sc,z,0,0,0,1,.8,1);b.glow(x,.6*sc,z,1.6*sc,c==='glowG'?'#7affd8':'#ff9ae8');};
  [[3.0,1.9,1.1,'glowG'],[3.4,1.3,.75,'glowP'],[-2.7,2.1,1.0,'glowP'],[-3.1,1.4,.7,'glowG'],[-2.3,2.7,.6,'glowG'],[1.5,3.4,.7,'glowP'],[-3.4,-1.3,.9,'glowG'],[3.6,-2.2,1.0,'glowP']].forEach(a=>gm(...a));
  for(let i=0;i<18;i++){const a=i/18*PI*2,R=CR-.1,y=CY-.22-((i%2)*.08);b.sph('lamp',.06,Math.cos(a)*R,y,Math.sin(a)*R,1,1.2,1,6,4);if(i%2===0||Math.sin(a)>0)b.glow(Math.cos(a)*R,y,Math.sin(a)*R,.85,i%3?'#ffe08a':'#ffb0d8');}
  for(let i=0;i<18;i++){const a=i/18*PI*2;b.rod('black',.01,[Math.cos(a)*(CR-.1),CY-.15,Math.sin(a)*(CR-.1)],[Math.cos(a+PI/9)*(CR-.1),CY-.15,Math.sin(a+PI/9)*(CR-.1)],3);}
  b.g(new T.CylinderGeometry(1.0,1.05,.06,16),'water',-2.6,.03,-.2,0,0,0,1,1,.7);b.cyl('stone',1.08,1.12,.1,16,-2.6,.02,-.2,0,0,0);b.g(new T.CylinderGeometry(1.0,1.05,.08,16),'water',-2.6,.05,-.2,0,0,0,1,1,.7);
  [[-2.9,-.3],[-2.3,0]].forEach(([x,z])=>b.cyl('leafL',.2,.2,.03,8,x,.1,z));b.ico('fpink',.08,-2.9,.15,-.3);
  b.cylB('logD',.05,.06,1.7,6,2.0,0,2.6);b.sph('lamp',.2,2.0,1.85,2.6,1,1,1,10,7);b.glow(2.0,1.85,2.6,3.0,'#ffe9a6');b.tor('logD',.21,.025,2.0,1.85,2.6,0,0,0,4,12);
  [[1,3.2,2.2],[-1.6,3.4,1.9],[2.6,2.6,-.4],[-2.5,2.9,.9],[.4,4.4,1.2],[-.9,4.9,1.0]].forEach(([x,y,z])=>b.glow(x,y,z,.5,'#eaff9a'));
  K.flowers(b,0,-2.9,9,.3,2);}
}
const STYLES={A:{name:'어부 통나무집',fn:styleA},B:{name:'둥근 지붕 운하 코티지',fn:styleB},C:{name:'수상 보트하우스',fn:styleC},D:{name:'버섯 동화 집',fn:styleD}};
// ── 꾸미기 아이템 (바닥: 원점=바닥 가운데 · 벽: 원점=벽면 · +z 가 방 안쪽/바깥쪽) ──
const ITEMS={
 bed:{n:'침대',slot:'floor',fn(b){b.boxB('logD',1.3,.34,2.1,0,0,0);b.boxB('bed',1.2,.2,1.95,0,.34,0);b.boxB('blanket',1.27,.13,1.3,0,.42,.35);b.box('fwhite',1.28,.05,.16,0,.55,-.3);for(let i=0;i<4;i++)b.box('blanket2',1.28,.135,.08,0,.485,.0+i*.3);
  b.sph('fwhite',.28,0,.66,-.68,1.5,.45,.9,10,6);b.boxB('logD',1.36,.95,.12,0,0,-1.03);b.cyl('logL',.08,.08,1.45,6,0,.97,-1.03,0,0,Math.PI/2);}},
 table:{n:'원목 테이블',slot:'floor',fn(b){b.cylB('logD',.32,.36,.06,10,0,0,0);b.cylB('logD',.07,.09,.7,7,0,0,0);b.cylB('plank',.58,.56,.07,14,0,.7,0);b.cylB('fwhite',.05,.045,.13,8,-.22,.77,.1);
  b.cylB('fwhite',.17,.15,.025,12,.12,.77,-.05);K.fish(b,'fishO',.22,.12,.84,-.05,.4);b.cylB('glass',.06,.05,.16,8,-.1,.77,-.3);b.ico('fpink',.06,-.1,.98,-.3);b.ico('yellow',.05,-.05,.95,-.26);}},
 chair:{n:'의자',slot:'floor',fn(b){b.boxB('plank',.46,.06,.46,0,.4,0);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([i,j])=>b.boxB('logD',.06,.4,.06,i*.19,0,j*.19));b.boxB('logD',.46,.52,.06,0,.46,-.2);b.boxB('rugR',.38,.05,.38,0,.46,.02);}},
 rug:{n:'둥근 러그',slot:'floor',fn(b){b.cylB('rugY',1.25,1.25,.02,22,0,0,0);b.cylB('rugR',1.08,1.08,.025,22,0,0,0);b.cylB('rugY',.72,.72,.03,20,0,0,0);b.cylB('rugB',.42,.42,.035,16,0,0,0);}},
 fishTank:{n:'어항',slot:'floor',fn(b){b.boxB('logD',1.35,.62,.56,0,0,0);b.boxB('plank',1.42,.05,.62,0,.62,0);b.box('sea',1.24,.74,.04,0,1.04,-.22);b.box('waterD',1.24,.74,.4,0,1.04,-.02,0,0,0);b.boxB('sand',1.24,.08,.44,0,.67,0);
  [[-.4,.1],[.45,-.05],[.1,.12]].forEach(([x,z],i)=>{b.cone('leaf',.07,.4+i*.1,4,x,.95+i*.05,z);b.cone('leafL',.05,.3,4,x+.08,.9,z+.03);});b.ico('stone',.1,-.15,.78,.1,1.3,.7,1);
  K.fish(b,'fishO',.26,-.2,1.12,.21,0);K.fish(b,'fishY',.2,.32,.95,.21,Math.PI);K.fish(b,'fishB',.22,.05,1.25,.21,0);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([i,j])=>b.box('metalL',.04,.78,.04,i*.62,1.04,j*.22));b.box('metalL',1.28,.04,.48,0,1.42,0);b.box('lamp',.8,.06,.2,0,1.45,0);b.glow(0,1.1,.2,1.8,'#9ae6ff');}},
 trophy:{n:'트로피 물고기 액자',slot:'wall',fn(b){b.box('logD',1.05,.65,.06,0,0,.03);b.box('plankD',.92,.52,.05,0,0,.07);K.fish(b,'gold',.78,0,.02,.16,0);b.box('gold',.3,.08,.02,0,-.2,.1);}},
 painting:{n:'바다 그림',slot:'wall',fn(b){b.box('logD',.95,.7,.05,0,0,.03);b.box('sea',.82,.57,.05,0,0,.05);b.box('waterD',.82,.2,.052,0,-.18,.051);b.disc('yellow',.09,.02,.18,.12,.08);b.box('fwhite',.18,.1,.02,-.18,-.08,.085);b.box('red',.03,.18,.02,-.18,.02,.085);}},
 shelf:{n:'벽 선반',slot:'wall',fn(b){b.box('plank',1.1,.06,.3,0,0,.15);[-1,1].forEach(s=>b.box('logD',.05,.22,.25,s*.42,-.12,.13));['book1','book2','book3','book2'].forEach((c,i)=>b.boxB(c,.08,.26+(i%2)*.05,.2,-.42+i*.09,.03,.15));
  b.cylB('glass',.08,.08,.2,8,.05,.03,.15);b.cylB('plankD',.085,.085,.04,8,.05,.23,.15);K.fish(b,'fishB',.12,.05,.13,.17,0);b.cylB('brick',.08,.06,.12,8,.35,.03,.15);b.ico('leaf',.11,.35,.2,.15);}},
 net:{n:'어망 장식',slot:'wall',fn(b){for(let i=0;i<6;i++){b.rod('rope',.012,[-.55+i*.22,.45,.04],[-.5+i*.2,-.45,.04],3);b.rod('rope',.012,[-.6,.4-i*.17,.04],[.6,.42-i*.17,.04],3);}b.sph('orange',.08,-.35,.3,.08,1,1,1,6,4);b.sph('fwhite',.08,.3,.1,.08,1,1,1,6,4);
  for(let k=0;k<5;k++)b.box('orange',.05,.18,.02,.15,-.2,.08,0,0,k/5*Math.PI*2);}},
 bunting:{n:'물고기 깃발 줄',slot:'wall',fn(b){for(let i=0;i<7;i++){const t=i/6,x=-1.2+t*2.4,y=-Math.sin(t*Math.PI)*.25;b.at(x,y,.05,0,()=>K.fish(b,['fishO','fishB','fishY','fpink'][i%4],.26,0,-.12,0,0));}b.rod('black',.01,[-1.25,0,.05],[0,-.27,.05],3);b.rod('black',.01,[0,-.27,.05],[1.25,0,.05],3);}},
 rodRack:{n:'낚싯대 거치대',slot:'floor',fn(b){K.rodRack(b);}},
 plant:{n:'화분',slot:'floor',fn(b){b.cylB('brick',.24,.18,.4,10,0,0,0);b.cylB('dirt',.22,.22,.02,10,0,.38,0);b.ico('leaf',.3,0,.66,0,1,.9,1,1);b.ico('leafD',.22,.16,.52,.12,1,1,1);b.ico('leafL',.2,-.14,.85,.06,1,1,1);}},
 plantTall:{n:'큰 잎 화분',slot:'floor',fn(b){b.cylB('stoneW',.26,.2,.45,10,0,0,0);for(let i=0;i<6;i++){const a=i/6*Math.PI*2,h=.9+(i%3)*.25;b.rod('leafD',.02,[0,.4,0],[Math.cos(a)*.3,h,Math.sin(a)*.3],3);b.atR(Math.cos(a)*.42,h+.05,Math.sin(a)*.42,0,-a,.6,()=>b.sph(i%2?'leaf':'leafL',.26,0,0,0,1.2,.12,.7,8,5));}}},
 lanternF:{n:'바닥 랜턴',slot:'floor',fn(b){b.at(0,0,0,0,()=>K.lantern(b,{c:'iron',gs:3.0}),1.6);}},
 stove:{n:'무쇠 난로',slot:'floor',fn(b){[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([i,j])=>b.cylB('iron',.04,.04,.18,4,i*.2,0,j*.2));b.cylB('iron',.36,.36,.62,12,0,.18,0);b.cylB('black',.4,.4,.06,12,0,.8,0);b.disc('fire',.16,.04,0,.42,.35);b.box('iron',.4,.04,.04,0,.6,.37);
  b.cylB('iron',.08,.08,2.3,8,0,.86,-.15);b.cylB('metalL',.13,.11,.16,10,.18,.86,.1);b.rod('metalL',.02,[.29,.98,.1],[.38,1.04,.1],3);b.glow(0,.42,.45,1.8,'#ff9c3c');}},
 bookshelf:{n:'책장',slot:'floor',fn(b){b.boxB('plankD',1.0,1.8,.05,0,0,-.17);[-1,1].forEach(k=>b.boxB('plankD',.06,1.8,.38,k*.47,0,0));b.boxB('plankD',1.0,.06,.4,0,1.8,0);for(let k=0;k<4;k++){b.boxB('plank',.9,.04,.34,0,.06+k*.43,0);for(let i=0;i<7;i++)if((i+k)%5!==3)b.boxB(['book1','book2','book3','leafD','rugY'][(i+k*2)%5],.1,.26+((i*k)%3)*.04,.26,-.36+i*.12,.1+k*.43,.0);}b.ico('leaf',.14,.25,1.98,0);b.cylB('brick',.1,.08,.14,8,.25,1.86,0);}},
 crate:{n:'나무 상자',slot:'floor',fn(b){K.crate(b,0,0,1.1,0);b.at(0,.5,0,.4,()=>K.crate(b,0,0,.7,0));K.fish(b,'fishB',.3,0,.92,0,.2);}},
 // 마당
 bench:{n:'벤치',slot:'yard',fn(b){K.bench(b,'shutT');}},
 mailbox:{n:'우체통',slot:'yard',fn(b){K.mailbox(b);}},
 lampPost:{n:'가로등',slot:'yard',fn(b){K.lampPost(b,2.4,'black');}},
 barrel:{n:'물통',slot:'yard',fn(b){K.barrel(b,0,0);}},
 flowerBed:{n:'꽃밭',slot:'yard',fn(b){b.boxB('plankD',1.3,.22,.6,0,0,0);b.boxB('dirt',1.2,.04,.5,0,.2,0);K.flowers(b,0,0,5,.24,2);b.at(0,.22,0,0,()=>{});}},
 birdbath:{n:'새 물그릇',slot:'yard',fn(b){b.cylB('stoneW',.08,.12,.75,8,0,0,0);b.cylB('stoneW',.38,.12,.14,10,0,.75,0);b.cylB('water',.3,.3,.02,10,0,.84,0);b.ico('yellow',.07,.15,.92,-.05,1.2,.9,1);}},
 smallTree:{n:'작은 나무',slot:'yard',fn(b){K.tree(b,0,0,.75,'leafL');}},
 dryRack:{n:'생선 건조대',slot:'yard',fn(b){[-1,1].forEach(s=>{b.rod('logD',.05,[s*.7,0,-.3],[s*.7,1.5,0],5);b.rod('logD',.05,[s*.7,0,.3],[s*.7,1.5,0],5);});b.cyl('logD',.04,.04,1.6,5,0,1.45,0,0,0,Math.PI/2);for(let i=0;i<5;i++){const x=-.5+i*.25;b.rod('rope',.008,[x,1.45,0],[x,1.25,0],3);b.at(x,1.08,0,0,()=>K.fish(b,['fishO','fishB','fishY'][i%3],.28,0,0,0,0),1);}}},
 sign:{n:'문패 팻말',slot:'yard',fn(b){b.cylB('logD',.05,.06,1.1,6,0,0,0);b.box('plank',.9,.42,.06,0,1.05,.05);b.box('plankD',.94,.06,.07,0,1.28,.05);K.fish(b,'fishO',.34,-.15,1.05,.11,0);b.box('dark',.25,.04,.01,.22,1.1,.09);b.box('dark',.18,.04,.01,.22,1.0,.09);}},
};
// 실내 슬롯 (6×5 방 · 단계별 개방 수) — id, 종류, 위치, 방향
const ROOM_SLOTS=[
 {id:'f1',t:'floor',p:[.3,0,.55],ry:0},{id:'w1',t:'wall',p:[2.2,1.95,-2.43],ry:0},{id:'f2',t:'floor',p:[-2.05,0,-1.48],ry:0},{id:'f3',t:'floor',p:[.95,0,.75],ry:0},
 {id:'f4',t:'floor',p:[2.2,0,-2.15],ry:0},{id:'w2',t:'wall',p:[-2.93,1.75,-1.45],ry:Math.PI/2},{id:'f5',t:'floor',p:[-2.75,0,1.75],ry:Math.PI/2},
 {id:'f6',t:'floor',p:[-2.5,0,.2],ry:Math.PI/2},{id:'w3',t:'wall',p:[-2.05,2.15,-2.43],ry:0},{id:'f7',t:'floor',p:[1.8,0,1.45],ry:-2.3},
 {id:'f8',t:'floor',p:[.8,0,-2.3],ry:0},{id:'w4',t:'wall',p:[-2.93,2.25,1.1],ry:Math.PI/2},{id:'f9',t:'floor',p:[2.65,0,1.95],ry:0},
 {id:'f10',t:'floor',p:[2.6,0,.1],ry:0},{id:'w5',t:'wall',p:[-.4,2.62,-2.43],ry:0}];
const SLOT_OPEN={floor:[3,5,7,9,10],wall:[1,2,3,4,5],yard:[1,2,4,6,8]};
const YARD_SLOTS=[[-2.9,3.7,.3],[2.9,3.7,-.3],[-4.1,1.6,.9],[4.1,1.6,-.9],[-1.6,4.7,0],[1.6,4.7,0],[-4.2,-1.4,1.4],[4.2,-1.6,-1.4]].map((a,i)=>({id:'y'+(i+1),t:'yard',p:[a[0],0,a[1]],ry:a[2]}));
function openSlots(list,stage){const c={floor:0,wall:0,yard:0};return list.filter(s=>{c[s.t]++;return c[s.t]<=SLOT_OPEN[s.t][Math.max(1,Math.min(5,stage))-1];});}

function roomShell(b,style){const RW=6,RD=5,WH=3.0;
 b.boxB('logD',RW+.3,.3,RD+.3,0,-.36,0);const n=12;for(let i=0;i<n;i++)b.box(i%2?'plank':'plankD',RW,.06,RD/n-.02,0,-.03,-RD/2+(i+.5)*RD/n);
 if(style==='A'){const r=.19,st=.37;for(let i=0;i<8;i++){const y=r+i*st;b.cyl(i%2?'logL':'logD',r,r,RW+.4,8,0,y,-RD/2-.15,0,0,Math.PI/2);b.cyl(i%2?'logD':'logL',r,r,RD+.3,8,-RW/2-.15,y+st/2,0,Math.PI/2,0,0);b.cyl('logE',r*.7,r*.7,RD+.34,8,-RW/2-.15,y+st/2,0,Math.PI/2,0,0);}}
 else{const wc={B:'cream',C:'skyw',D:'stem'}[style]||'cream',lc={B:'shutT',C:'plankG',D:'stemD'}[style]||'plank';
  b.boxB(wc,RW+.3,WH,.3,0,0,-RD/2-.15);b.boxB(wc,.3,WH,RD,-RW/2-.15,0,0);b.boxB(lc,RW,.9,.05,0,0,-RD/2+.02);b.boxB(lc,.05,.9,RD,-RW/2+.02,0,0);b.box('white',RW,.07,.08,0,.92,-RD/2+.03);b.box('white',.08,.07,RD,-RW/2+.03,.92,0);}
 b.box('logD',RW+.3,.16,.16,0,WH+.05,-RD/2-.15);b.box('logD',.16,.16,RD+.3,-RW/2-.15,WH+.05,0);
 b.at(-.4,1.25,-RD/2+.05,0,()=>{K.window(b,.95,.85,{frame:'white',glow:true});b.box('cream',.32,1.2,.06,-.7,.45,.12);b.box('cream',.32,1.2,.06,.7,.45,.12);b.cyl('logD',.03,.03,1.8,5,0,1.08,.14,0,0,Math.PI/2);});
 return {RW,RD,WH};}

function finish(T,res,o){const A=atlas(T);const mesh=new T.Mesh(res.geo,A.mat);mesh.castShadow=mesh.receiveShadow=true;mesh.name='house';
 const grp=new T.Group();grp.add(mesh);let glow=null;
 if(res.glows.length){const g=new T.BufferGeometry(),p=new Float32Array(res.glows.length*3),c=new Float32Array(res.glows.length*3),sz=new Float32Array(res.glows.length),col=new T.Color();
  res.glows.forEach((q,i)=>{p.set([q[0],q[1],q[2]],i*3);col.set(q[4]);c.set([col.r,col.g,col.b],i*3);sz[i]=q[3];});
  g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('color',new T.BufferAttribute(c,3));g.setAttribute('gsize',new T.BufferAttribute(sz,1));
  glow=new T.Points(g,glowMaterial(T));glow.name='glow';glow.frustumCulled=false;glow.renderOrder=5;grp.add(glow);}
 return {group:grp,mesh,glow};}
let GM=null;
function glowMaterial(T){if(GM)return GM;const A=atlas(T);GM=new T.ShaderMaterial({uniforms:{map:{value:A.glowMat.map},op:{value:0},scale:{value:300}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,
 vertexShader:'attribute float gsize;varying vec3 vC;uniform float scale;void main(){vC=color;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=gsize*scale/-mv.z;gl_Position=projectionMatrix*mv;}',
 fragmentShader:'uniform sampler2D map;uniform float op;varying vec3 vC;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(vC*t.a*op,1.);}',vertexColors:true});return GM;}

const CACHE={};
function houseGeo(T,style,stage){const k=style+stage;if(CACHE[k])return CACHE[k];const b=Builder(T);STYLES[style].fn(b,stage);return CACHE[k]=b.done();}

const NK_HOUSE={PAL,STYLES,ITEMS,ROOM_SLOTS,YARD_SLOTS,SLOT_OPEN,PROF,K,atlas,Builder,
 // 집 1채: style 'A'|'B'|'C'|'D', stage 1~5, yard {y1:'bench',...} (마당 꾸미기는 같은 메시에 병합)
 build(T,o){o=o||{};const style=o.style||'A',stage=Math.max(1,Math.min(5,o.stage|0||1));let res;
  const yard=o.yard&&Object.keys(o.yard).length?o.yard:null;
  if(!yard)res=houseGeo(T,style,stage);else{const b=Builder(T);STYLES[style].fn(b,stage);const open=openSlots(YARD_SLOTS,stage);open.forEach(s=>{const it=yard[s.id];if(it&&ITEMS[it])b.at(s.p[0],s.p[1],s.p[2],s.ry,()=>ITEMS[it].fn(b));});res=b.done();}
  const f=finish(T,res,o);const tris=res.geo.attributes.position.count/3;
  return Object.assign(f,{style,stage,info:{tris,parts:res.parts,calls:f.glow?2:1},yardSlots:openSlots(YARD_SLOTS,stage)});},
 // 실내: mode 'merge'(방+소품 1콜) | 'instanced'(방 1콜 + 소품 종류마다 InstancedMesh 1콜)
 buildRoom(T,o){o=o||{};const style=o.style||'A',stage=o.stage||5,deco=o.deco||{},mode=o.mode||'merge';const A=atlas(T);
  const open=openSlots(ROOM_SLOTS,stage);const rb=Builder(T);const dims=roomShell(rb,style);const grp=new T.Group();let calls=0,tris=0,parts=0;const allGlow=[];
  if(mode==='merge'){open.forEach(s=>{const it=deco[s.id];if(it&&ITEMS[it])rb.at(s.p[0],s.p[1],s.p[2],s.ry,()=>ITEMS[it].fn(rb));});const r=rb.done();const f=finish(T,r);grp.add(f.group);calls=f.glow?2:1;tris=r.geo.attributes.position.count/3;parts=r.parts;}
  else{const r=rb.done();const f=finish(T,r);grp.add(f.mesh);calls=1;tris=r.geo.attributes.position.count/3;parts=r.parts;r.glows.forEach(g=>allGlow.push(g));
   const by={};open.forEach(s=>{const it=deco[s.id];if(it&&ITEMS[it])(by[it]=by[it]||[]).push(s);});
   const O=new T.Object3D(),V=new T.Vector3();
   for(const it in by){const ib=Builder(T);ITEMS[it].fn(ib);const ir=ib.done();const im=new T.InstancedMesh(ir.geo,A.mat,by[it].length);im.castShadow=im.receiveShadow=true;im.name='deco:'+it;
    by[it].forEach((s,i)=>{O.position.set(...s.p);O.rotation.set(0,s.ry,0);O.updateMatrix();im.setMatrixAt(i,O.matrix);ir.glows.forEach(g=>{V.set(g[0],g[1],g[2]).applyMatrix4(O.matrix);allGlow.push([V.x,V.y,V.z,g[3],g[4]]);});});
    grp.add(im);calls++;tris+=ir.geo.attributes.position.count/3*by[it].length;parts+=ir.parts*by[it].length;}
   if(allGlow.length){const gf=finish(T,{geo:new T.BufferGeometry().setAttribute('position',new T.BufferAttribute(new Float32Array(9),3)),glows:allGlow});grp.add(gf.glow);calls++;}}
  return {group:grp,slots:open,dims,info:{calls,tris,parts,mode}};},
 // 시간: k=0 낮 · 0.5 노을 · 1 밤 (창문/등불 발광 + 불빛 번짐)
 setTime(T,k){const A=atlas(T);A.mat.emissiveIntensity=Math.max(0,(k-.25)/.75)*1.25;const gm=glowMaterial(T);gm.uniforms.op.value=Math.max(0,(k-.35)/.65);gm.visible=gm.uniforms.op.value>0;},
 setGlowScale(T,px){glowMaterial(T).uniforms.scale.value=px;},
 // 멀리 있는 집: 집 모양을 텍스처 1장(타일)에 미리 찍고, InstancedMesh 빌보드 1개로 전부 그려요 (1콜)
 bakeImpostors(T,renderer,combos,tile,lights){tile=tile||256;const cols=Math.ceil(Math.sqrt(combos.length)),rows=Math.ceil(combos.length/cols);
  const rt=new T.WebGLRenderTarget(cols*tile,rows*tile,{samples:4});const sc=new T.Scene();(lights||[new T.HemisphereLight(0xeaf4ff,0x8a7a60,.9),(()=>{const d=new T.DirectionalLight(0xfff0dc,1.5);d.position.set(5,9,7);return d;})()]).forEach(l=>sc.add(l.clone?l.clone():l));
  const tiles={};const prevT=renderer.getRenderTarget(),prevC=renderer.getClearColor(new T.Color()),prevA=renderer.getClearAlpha();renderer.setRenderTarget(rt);renderer.setClearColor(0,0);renderer.clear();
  const az=.55,el=.32;combos.forEach((c,i)=>{const g=houseGeo(T,c[0],c[1]).geo;const m=new T.Mesh(g,atlas(T).mat);sc.add(m);const bs=g.boundingSphere,R=bs.radius*1.02;
   const cam=new T.OrthographicCamera(-R,R,R,-R,.1,R*6);cam.position.set(bs.center.x+Math.sin(az)*Math.cos(el)*R*3,bs.center.y+Math.sin(el)*R*3,bs.center.z+Math.cos(az)*Math.cos(el)*R*3);cam.lookAt(bs.center);
   const x=(i%cols)*tile,y=((i/cols)|0)*tile;rt.viewport.set(x,y,tile,tile);rt.scissor.set(x,y,tile,tile);rt.scissorTest=true;renderer.setRenderTarget(rt);renderer.render(sc,cam);sc.remove(m);
   tiles[c[0]+c[1]]={u:x/(cols*tile),v:y/(rows*tile),du:1/cols,dv:1/rows,R,cy:bs.center.y,cx:bs.center.x,cz:bs.center.z};});
  rt.scissorTest=false;rt.viewport.set(0,0,cols*tile,rows*tile);renderer.setRenderTarget(prevT);renderer.setClearColor(prevC,prevA);return {texture:rt.texture,tiles,rt};},
 impostorField(T,bake,cap){const g=new T.PlaneGeometry(1,1);g.translate(0,.5,0);const tile=new T.InstancedBufferAttribute(new Float32Array(cap*4),4);g.setAttribute('tile',tile);
  const mat=new T.ShaderMaterial({uniforms:Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{map:{value:bake.texture},dim:{value:1}}),fog:true,
   vertexShader:'attribute vec4 tile;varying vec2 vUv;\n#include <fog_pars_vertex>\nvoid main(){vec4 c=modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.);float s=length(instanceMatrix[0].xyz);vec3 r=normalize(vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]));vec3 w=c.xyz+r*position.x*s+vec3(0.,1.,0.)*position.y*s;vUv=tile.xy+uv*tile.zw;vec4 mvPosition=viewMatrix*vec4(w,1.);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
   fragmentShader:'uniform sampler2D map;uniform float dim;varying vec2 vUv;\n#include <fog_pars_fragment>\nvoid main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;gl_FragColor=vec4(t.rgb*dim,1.);\n#include <encodings_fragment>\n#include <fog_fragment>\n}'});
  const im=new T.InstancedMesh(g,mat,cap);im.count=0;im.frustumCulled=false;const O=new T.Object3D();
  return {mesh:im,set(i,key,x,z,ry){const t=bake.tiles[key];O.position.set(x+t.cx*Math.cos(ry||0),t.cy-t.R,z);O.scale.setScalar(t.R*2);O.rotation.set(0,0,0);O.updateMatrix();im.setMatrixAt(i,O.matrix);tile.setXYZW(i,t.u,t.v,t.du,t.dv);tile.needsUpdate=true;im.instanceMatrix.needsUpdate=true;im.count=Math.max(im.count,i+1);}};},
 openSlots,_glowMat:glowMaterial};
(typeof window!=='undefined'?window:globalThis).NK_HOUSE=NK_HOUSE;
})();
