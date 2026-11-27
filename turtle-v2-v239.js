// 피쉬코지 🐢 새 바다거북 탈것 (v239 · FLY.turtle2) — Three.js r147 순수 프로시저럴 (외부 이미지·모델 없음)
// 사용: const g=TURTLE_V2('emerald'); g.userData.setMode(0~1); g.userData.tick(dt,time,moving)
//  - 기존 TURTLE_C3와 같은 userData 규약(body, limbs, mode, seatL, seat, pose, head, hp, setMode, tick, tail)
//  - 좌석 높이·위치(seatL = 0, SY+1.27, -0.1)는 기존과 같아서 탑승 자세·낚싯대 위치가 그대로예요
//  - 색 4종: emerald(기본) · coral(산호·옥빛) · gold(황금 전설) · aurora(밤바다 오로라, 빛나는 등갑 선)
(function(){
const T=THREE,V=(x,y,z)=>new T.Vector3(x,y,z);
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);},lerp=(a,b,t)=>a+(b-a)*t,cl=(x,a,b)=>Math.min(b,Math.max(a,x));
const C=h=>new T.Color(h);

// ── 색 4종 ──
const PAL={
 emerald:{n:'에메랄드 바다거북',sc:['#1f7a64','#2a937a','#1b6c5a'],ring:'#e9c77e',groove:'#0e2d28',rim:'#d8b06c',rimD:'#c39553',plast:'#f3e2b0',plastD:'#d9c08a',
  skin:'#7cc59d',skinD:'#4f9877',cream:'#f6e9c6',spot:.83,cheek:'#ff9a9a',cloth:'#fbf3e3',trim:'#e0604f',trim2:'#f2c45a',cushion:'#f4b448',cushionT:'#ffd27a',bolster:'#e0604f',
  flower:'#ff8fa6',fc:'#ffd54a',gold:'#e3b24c',glow:'#000000',glowAmt:0,foam:'#eafcff'},
 coral:{n:'산호·옥빛 힐링 거북',sc:['#5fc4b0','#78d3bf','#52b6a4'],ring:'#fff2d6',groove:'#2a6c66',rim:'#ff9888',rimD:'#ee7d72',plast:'#fff3e3',plastD:'#f2d9c4',
  skin:'#a3e2d4',skinD:'#68bdaf',cream:'#fff2e4',spot:.84,cheek:'#ff86a0',cloth:'#fff8f2',trim:'#9a80e0',trim2:'#ffd27a',cushion:'#ffb3c3',cushionT:'#ffd0da',bolster:'#9a80e0',
  flower:'#ffffff',fc:'#ffcf4d',gold:'#f0c766',glow:'#c7fff4',glowAmt:.22,foam:'#f2fffd'},
 gold:{n:'황금 전설 거북',sc:['#dc9f34','#e8b44a','#cf9029'],ring:'#fff1b8',groove:'#4e2c0c',rim:'#7e3420',rimD:'#682816',plast:'#f7e4b2',plastD:'#dcc08a',
  skin:'#a9c98c',skinD:'#76a062',cream:'#f8ecc8',spot:.8,cheek:'#ff9d8a',cloth:'#7a2a3a',trim:'#f1c65a',trim2:'#fff0b0',cushion:'#c23a4b',cushionT:'#d9566a',bolster:'#f1c65a',
  flower:'#fff3c2',fc:'#e3a92e',gold:'#f0c050',glow:'#ffcf6a',glowAmt:.38,foam:'#fff8e6'},
 aurora:{n:'밤바다 오로라 거북',sc:['#1c3d7a','#25518f','#19346a'],ring:'#86f7e2',groove:'#081230',rim:'#3b2f7c',rimD:'#2e2466',plast:'#dfe6ff',plastD:'#b9c4ea',
  skin:'#93bfe6',skinD:'#6a86c8',cream:'#e9f0ff',spot:.8,cheek:'#ff9fd2',cloth:'#ebe7ff',trim:'#4fd6c3',trim2:'#b9a8ff',cushion:'#8a7cf0',cushionT:'#a89cff',bolster:'#4fd6c3',
  flower:'#b9f3ff',fc:'#fff6a8',gold:'#d8e4ff',glow:'#56f0d4',glowAmt:1.0,foam:'#d9fbff'}};

// ── 등갑 무늬: 척추판 5 · 늑판 4쌍 (보로노이) + 가장자리 연갑 22칸 ──
const RX=1.08,RZ=1.30,H=.86,RM=.83,NM=22,SY=.74;
const SEEDS=[[0,.6],[0,.3],[0,0],[0,-.3],[0,-.58],[.5,.44],[.56,.15],[.56,-.15],[.49,-.43],[-.5,.44],[-.56,.15],[-.56,-.15],[-.49,-.43]];
function pat(u,v){const rr=Math.hypot(u,v);
 if(rr>RM){const ph=Math.atan2(u,v),a=ph/(2*Math.PI)*NM+.5,c=Math.floor(a),f=a-c;return {cell:100+((c%NM)+NM)%NM,e:Math.min(Math.min(f,1-f)*2*Math.PI/NM*rr,rr-RM),d1:0,mg:1};}
 let i1=0,d1=1e9;SEEDS.forEach((s,i)=>{const d=Math.hypot(u-s[0],v-s[1]);if(d<d1){d1=d;i1=i;}});
 let e=RM-rr;const s=SEEDS[i1];SEEDS.forEach((t,j)=>{if(j===i1)return;const nx=t[0]-s[0],ny=t[1]-s[1],L=Math.hypot(nx,ny);e=Math.min(e,(((s[0]+t[0])/2-u)*nx+((s[1]+t[1])/2-v)*ny)/L);});
 return {cell:i1,e,d1,mg:0};}
const domeY=(u,v)=>{const rr=Math.min(1,Math.hypot(u,v));return H*(1-.06*v)*Math.pow(Math.max(0,1-Math.pow(rr,2.3)),.5);};
// 가장자리 물결(뒤쪽 톱니) + 목 자리(앞쪽 살짝 들림)
const scal=(u,v)=>{const ph=Math.atan2(u,v),a=ph/(2*Math.PI)*NM+.5,f=a-Math.floor(a);const back=sm(.1,-.5,Math.cos(ph));return 1+back*.045*Math.sin(Math.PI*f);};
const neckLift=(u,v)=>{const ph=Math.atan2(u,v);return .09*Math.pow(Math.max(0,Math.cos(ph)),14);};
// 무늬 좌표: 위에서 본 반지름(rr) 대신 꼭대기에서 잰 각도(ρ)라서 옆면도 판이 고르게 나눠져요
const patR=(u,v)=>{const rr=Math.hypot(u,v);if(rr<1e-6)return pat(0,0);const r=Math.asin(Math.min(1,rr))*2/Math.PI;return pat(u/rr*r,v/rr*r);};
const surfY=(u,v)=>{const p=patR(u,v);let y=domeY(u,v);if(p.mg){y+=.028*sm(0,.05,p.e);}else{y+=.04*sm(0,.11,p.e)+.022*(1-sm(0,.34,p.d1));}return y;};

// ── 셰이더 조각 ──
const GLSL_PAT=`
uniform vec2 uSeeds[13];uniform vec3 uSc0,uSc1,uSc2,uRing,uGroove,uRim,uRimD,uGlow;uniform float uGlowAmt,uTime;varying vec3 vPat;
float h1(float n){return fract(sin(n*12.9898+4.1)*43758.5453);}
void tpat(vec2 p,out float cell,out float e,out float d1,out float mg){float rr=length(p);
 if(rr>${RM.toFixed(3)}){float ph=atan(p.x,p.y);float a=ph/6.2831853*${NM}.0+.5;float c=floor(a);float f=a-c;e=min(min(f,1.-f)*6.2831853/${NM}.0*rr,rr-${RM.toFixed(3)});cell=100.+mod(c,${NM}.0);d1=0.;mg=1.;return;}
 mg=0.;d1=1e9;int i1=0;vec2 s=uSeeds[0];for(int i=0;i<13;i++){float d=length(p-uSeeds[i]);if(d<d1){d1=d;i1=i;s=uSeeds[i];}}
 e=${RM.toFixed(3)}-rr;for(int j=0;j<13;j++){if(j==i1)continue;vec2 t=uSeeds[j];vec2 n=t-s;e=min(e,dot((s+t)*.5-p,n)/length(n));}cell=float(i1);}
`;
const GLSL_CELL=`
uniform float uSpot,uSpotK;varying vec3 vSP;varying float vSk;
vec3 hh3(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return fract(sin(p)*43758.5453);}
float cell3(vec3 p){vec3 i=floor(p),f=fract(p);float d=8.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){vec3 g=vec3(float(x),float(y),float(z));vec3 r=g+hh3(i+g)*.7+.15-f;d=min(d,dot(r,r));}return sqrt(d);}
`;
function shellMat(P){const m=new T.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:.04});m.extensions={derivatives:true};
 const U={uSeeds:{value:SEEDS.map(s=>new T.Vector2(s[0],s[1]))},uSc0:{value:C(P.sc[0])},uSc1:{value:C(P.sc[1])},uSc2:{value:C(P.sc[2])},uRing:{value:C(P.ring)},uGroove:{value:C(P.groove)},uRim:{value:C(P.rim)},uRimD:{value:C(P.rimD)},uGlow:{value:C(P.glow)},uGlowAmt:{value:P.glowAmt},uTime:{value:0}};
 m.userData.U=U;
 m.onBeforeCompile=s=>{Object.assign(s.uniforms,U);
  s.vertexShader='attribute vec3 pat;varying vec3 vPat;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPat=pat;');
  s.fragmentShader=GLSL_PAT+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  if(vPat.z>.5){float cell,e,d1,mg;tpat(vPat.xy,cell,e,d1,mg);float fw=max(fwidth(e),.0015);float hh=h1(cell);
   vec3 b=mg>.5?mix(uRim,uRimD,hh*.7):(hh<.34?uSc0:(hh<.67?uSc1:uSc2));
   if(mg<.5)b*=1.+.22*(1.-smoothstep(0.,.3,d1));else b*=1.+.12*smoothstep(.0,.08,e);
   float rg=abs(fract(e*30.)-.5)*2.;float ln=1.-smoothstep(.0,.22,rg);b=mix(b,b*.8,ln*.45*smoothstep(.06,.09,e));
   float band=smoothstep(.016-fw,.016+fw,e)*(1.-smoothstep(.038-fw,.038+fw,e));b=mix(b,uRing,band*.9);
   float gr=1.-smoothstep(.011-fw,.011+fw,e);b=mix(b,uGroove,gr);
   diffuseColor.rgb=b;
   totalEmissiveRadiance+=uGlow*uGlowAmt*(band*.9+ln*.1*smoothstep(.06,.09,e)*(1.-mg))*(.75+.25*sin(uTime*2.2+cell*1.7));}`);};
 m.customProgramCacheKey=()=>'tv2shell';return m;}
function skinMat(P,o){o=o||{};const m=new T.MeshStandardMaterial({vertexColors:true,roughness:o.r||.62,metalness:0});
 const U={uSpot:{value:P.spot},uSpotK:{value:o.k||9.}};m.userData.U=U;
 m.onBeforeCompile=s=>{Object.assign(s.uniforms,U);
  s.vertexShader='attribute float sk;varying vec3 vSP;varying float vSk;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvSP=position;vSk=sk;');
  s.fragmentShader=GLSL_CELL+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
  if(vSk>.01){float c=cell3(vSP*uSpotK);float sp=1.-smoothstep(.30,.40,c);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*uSpot,sp*vSk);}`);};
 m.customProgramCacheKey=()=>'tv2skin';return m;}

// ── 지오메트리 도우미 ──
function paint(g,fn,sk){g=g.index?g:g;const p=g.attributes.position,n=p.count,c=new Float32Array(n*3),k=new Float32Array(n);const v=V(),col=new T.Color();
 for(let i=0;i<n;i++){v.fromBufferAttribute(p,i);const r=fn(v,i);col.set(r);c[i*3]=col.r;c[i*3+1]=col.g;c[i*3+2]=col.b;k[i]=typeof sk==='function'?sk(v,i):(sk||0);}
 g.setAttribute('color',new T.BufferAttribute(c,3));g.setAttribute('sk',new T.BufferAttribute(k,1));return g;}
function merge(list){const gs=list.map(g=>{g=g.index?g.toNonIndexed():g;if(!g.attributes.normal)g.computeVertexNormals();return g;});
 const names=['position','normal','color','sk'];const out=new T.BufferGeometry();
 names.forEach(nm=>{const sz=nm==='sk'?1:3;let tot=0;gs.forEach(g=>tot+=g.attributes.position.count);const a=new Float32Array(tot*sz);let o=0;
  gs.forEach(g=>{const at=g.attributes[nm],n=g.attributes.position.count;for(let i=0;i<n;i++)for(let j=0;j<sz;j++)a[(o+i)*sz+j]=at?at.array[i*at.itemSize+j]:(nm==='color'?1:0);o+=n;});out.setAttribute(nm,new T.BufferAttribute(a,sz));});return out;}
let QF=1;const qs=(n,m)=>Math.max(m||3,Math.round(n*QF));
const sph=(r,ws,hs)=>new T.SphereGeometry(r,qs(ws||16,6),qs(hs||12,4));
function mk(g,m,cast){const o=new T.Mesh(g,m);o.castShadow=cast!==false;o.receiveShadow=true;return o;}

// opt.lite=true → 멀리 있는 다른 유저용 가벼운 버전 (분할 수 60% · 밧줄/조개/꽃/술/파이핑 생략)
function build(key,opt){opt=opt||{};QF=opt.lite?.6:1;const LITE=!!opt.lite;const P=PAL[key]||PAL.emerald;const g=new T.Group(),body=new T.Group();g.add(body);const U=g.userData;U.body=body;U.limbs=[];U.mode=0;U.pal=key||'emerald';
 const M={shell:shellMat(P),skin:skinMat(P),fin:skinMat(P,{k:11}),cloth:new T.MeshStandardMaterial({vertexColors:true,roughness:.85}),
  gold:new T.MeshStandardMaterial({color:P.gold,metalness:.55,roughness:.3,emissive:C(P.gold).multiplyScalar(.18)}),
  eye:new T.MeshStandardMaterial({color:'#121418',roughness:.12,metalness:.1}),hi:new T.MeshBasicMaterial({color:'#ffffff'}),
  foam:new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false}),bub:new T.MeshBasicMaterial({color:P.foam,transparent:true,opacity:.75,depthWrite:false})};
 U.mats=M;
 // ── 등갑 (한 장 메시: 윗면 + 감긴 가장자리 + 배딱지) ──
 const NS=qs(80,40),NR=qs(20,12);const pos=[],pt=[],col=[],idx=[];const cP=C(P.plast),cPD=C(P.plastD),cR=C(P.rimD);
 const rows=[];for(let i=0;i<=NR;i++){const t=i/NR;rows.push({rr:Math.sin(t*Math.PI/2),rho:t,top:1});}
 [[1.0,0,1],[1.03,-.03,1],[1.045,-.07,1],[1.03,-.11,0],[.96,-.14,0],[.8,-.175,0],[.5,-.2,0],[.15,-.21,0]].forEach(r=>rows.push({rr:r[0],y:r[1],top:r[2],lip:1}));
 rows.forEach((R,i)=>{for(let j=0;j<=NS;j++){const ph=j/NS*Math.PI*2,su=Math.sin(ph),sv=Math.cos(ph);let u=su*R.rr,v=sv*R.rr;let x,y,z;
   if(!R.lip){const k=1+(scal(u,v)-1)*sm(.85,1,R.rr);y=surfY(u,v)+neckLift(u,v)*sm(.86,1,R.rr);x=u*RX*k;z=v*RZ*k;
    // 법선 쪽으로 판 볼록 (가장자리는 옆으로)
    const p=patR(u,v),bump=p.mg?.028*sm(0,.05,p.e):0;const side=sm(.85,1,R.rr);x+=su*bump*side*1.2;z+=sv*bump*side*1.2;}
   else{const k=scal(su,sv),ry=R.y+neckLift(su,sv)*(R.top?1:.6);x=su*RX*R.rr*k;z=sv*RZ*R.rr*k;y=ry;if(R.top){const p=pat(su*.999,sv*.999);const b=.028*sm(0,.05,p.e);x+=su*b;z+=sv*b;}}
   pos.push(x,y,z);const pr=R.lip?.999:Math.min(.999,R.rho);pt.push(su*pr,sv*pr,R.top?1:0);
   const cc=R.top?new T.Color(1,1,1):(R.rr>.9?cR:cP.clone().lerp(cPD,.5*Math.abs(Math.sin(ph*6))*sm(.3,.9,R.rr)));col.push(cc.r,cc.g,cc.b);}});
 const W=NS+1;for(let i=0;i<rows.length-1;i++)for(let j=0;j<NS;j++){const a=i*W+j,b=a+1,c=a+W,d=c+1;idx.push(a,c,b,b,c,d);}
 // 아래 중앙 막기
 const cb=pos.length/3;pos.push(0,-.21,0);pt.push(0,0,0);col.push(cP.r,cP.g,cP.b);const lr=(rows.length-1)*W;for(let j=0;j<NS;j++)idx.push(lr+j,cb,lr+j+1);
 const sg=new T.BufferGeometry();sg.setAttribute('position',new T.Float32BufferAttribute(pos,3));sg.setAttribute('pat',new T.Float32BufferAttribute(pt,3));sg.setAttribute('color',new T.Float32BufferAttribute(col,3));sg.setIndex(idx);sg.computeVertexNormals();
 // 이음새(ph=0/2π) 법선 맞추기
 {const n=sg.attributes.normal;for(let i=0;i<rows.length;i++){const a=i*W,b=i*W+NS;const nx=(n.getX(a)+n.getX(b))/2,ny=(n.getY(a)+n.getY(b))/2,nz=(n.getZ(a)+n.getZ(b))/2;n.setXYZ(a,nx,ny,nz);n.setXYZ(b,nx,ny,nz);}n.normalize&&0;}
 const shell=mk(sg,M.shell);shell.position.y=SY;body.add(shell);U.shell=shell;

 // ── 안장: 몸에 맞춰 덮인 담요 + 폭신한 방석 + 등받이 쿠션 + 소품 ──
 const cloth=[],gold=[];const cCl=C(P.cloth),cTr=C(P.trim),cT2=C(P.trim2);
 {const N=qs(18,10),A=[],top=[];const map=(s,t)=>{const q=[s*Math.sqrt(1-t*t/2),t*Math.sqrt(1-s*s/2)];return [lerp(s,q[0],.6),lerp(t,q[1],.6)];};
  const gp=[],gc=[],gi=[],fcol=[];const at=(a,b,off)=>{const u=a*.5,v=b*.43-.04;return [u*RX,SY+domeY(u,v)+.072+off,v*RZ];};
  for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const s=i/N*2-1,t=j/N*2-1,[a,b]=map(s,t);const p=at(a,b,0);gp.push(...p);const m=Math.max(Math.abs(s),Math.abs(t));
   const c=m>.86?cTr:(m>.76&&m<.81?cT2:cCl.clone().lerp(cT2,((i+j)%4===0&&m<.7)?.18:0));gc.push(c.r,c.g,c.b);}
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){const a=i*(N+1)+j,b=a+1,c=a+N+1,d=c+1;gi.push(a,b,c,b,d,c);const s=(i+.5)/N*2-1,t=(j+.5)/N*2-1,m=Math.max(Math.abs(s),Math.abs(t));
   const cc=m>.86?cTr:(m>.72&&m<.79?cT2:((((i+j)%4===1)&&((i-j+40)%4===1)&&m<.66)?cCl.clone().lerp(cT2,.45):cCl));fcol.push(cc,cc);}
  // 두께(옆면)
  const ring=[];for(let i=0;i<N;i++)ring.push([i,0]);for(let j=0;j<N;j++)ring.push([N,j]);for(let i=N;i>0;i--)ring.push([i,N]);for(let j=N;j>0;j--)ring.push([0,j]);
  const base=gp.length/3;ring.forEach(([i,j])=>{const s=i/N*2-1,t=j/N*2-1,[a,b]=map(s,t);const p=at(a*1.01,b*1.01,-.05);gp.push(...p);gc.push(cTr.r*.8,cTr.g*.8,cTr.b*.8);});
  for(let k=0;k<ring.length;k++){const k2=(k+1)%ring.length,[i,j]=ring[k],[i2,j2]=ring[k2];const a=i*(N+1)+j,b=i2*(N+1)+j2;gi.push(a,base+k,b,b,base+k,base+k2);}
  for(let k=fcol.length;k<gi.length/3;k++)fcol.push(C(P.trim).multiplyScalar(.8));
  let bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute(gp,3));bg.setAttribute('color',new T.Float32BufferAttribute(gc,3));bg.setIndex(gi);bg.computeVertexNormals();bg=bg.toNonIndexed();
  {const ca=bg.attributes.color;for(let f=0;f<fcol.length;f++)for(let k=0;k<3;k++)ca.setXYZ(f*3+k,fcol[f].r,fcol[f].g,fcol[f].b);}cloth.push(bg);
  // 술(태슬) 4개
  if(!LITE)[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([s,t])=>{const [a,b]=map(s*.98,t*.98);const p=at(a,b,-.04);const out=V(a*.5*RX,0,(b*.43)*RZ).normalize();
   const cap=sph(.032,8,6);cap.translate(p[0]+out.x*.02,p[1]-.01,p[2]+out.z*.02);gold.push(cap);
   const tz=new T.ConeGeometry(.04,.14,8,1,true);tz.rotateX(Math.PI);tz.translate(p[0]+out.x*.03,p[1]-.1,p[2]+out.z*.03);paint(tz,()=>P.trim);cloth.push(tz);});}
 const seatY=SY+domeY(0,-.077)+.072;const blk=(x,z)=>SY+domeY(x/RX,z/RZ)+.072;// 담요 윗면
 {// 방석: 둥근 상자 + 가운데 단추 눌림
  const cg=sph(1,20,10);const p=cg.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);x=Math.sign(x)*Math.pow(Math.abs(x),.45);z=Math.sign(z)*Math.pow(Math.abs(z),.45);y=Math.sign(y)*Math.pow(Math.abs(y),.8);
   x*=.37;z*=.33;const zz=z-.1;let yy;if(y<0)yy=blk(x,zz)+(1+y)*.065;else{yy=seatY+.065+y*.065;yy-=.022*Math.exp(-(x*x+z*z)/.012);}p.setXYZ(i,x,yy,zz);}
  cg.computeVertexNormals();paint(cg,v=>v.y>seatY+.08?P.cushionT:P.cushion);cloth.push(cg);
  const bt=sph(.03,10,8);bt.scale(1,.55,1);bt.translate(0,seatY+.13-.022,-.1);gold.push(bt);
  // 방석 테두리 파이핑
  const pp=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,c=Math.cos(a),s=Math.sin(a);const ex=Math.sign(c)*Math.pow(Math.abs(c),.45),ez=Math.sign(s)*Math.pow(Math.abs(s),.45);pp.push(V(ex*.372,blk(ex*.372,ez*.332-.1)+.065,ez*.332-.1));}
  if(!LITE){const tg=new T.TubeGeometry(new T.CatmullRomCurve3(pp,true),32,.016,4,true);paint(tg,()=>P.trim2);cloth.push(tg);}
  // 등받이 롤 쿠션 (기존 등받이 자리 z=-.36)
  const by=seatY+.11;const BZ=-.36;const bo=new T.CylinderGeometry(.11,.11,.6,qs(14,8),1,true);bo.rotateZ(Math.PI/2);bo.translate(0,by,BZ);
  paint(bo,v=>{const a=Math.atan2(v.y-by,v.z-BZ);return Math.abs(Math.sin(a*3))>.85?P.trim2:P.bolster;});cloth.push(bo);
  [-1,1].forEach(q=>{const cap=sph(.11,12,6);cap.scale(.35,1,1);cap.translate(q*.3,by,BZ);paint(cap,()=>P.bolster);cloth.push(cap);
   const r=new T.TorusGeometry(.105,.022,qs(6,4),qs(16,8));r.rotateY(Math.PI/2);r.translate(q*.3,by,BZ);gold.push(r);
   const k=sph(.035,8,6);k.translate(q*.345,by,BZ);gold.push(k);});
  U.seatTop=seatY+.13;U.bolsterY=by;}
 // 양옆 밧줄 (등갑을 따라 가장자리까지) + 금색 고리
 if(!LITE)[-1,1].forEach(q=>{const pts=[];for(let i=0;i<=14;i++){const u=q*lerp(.5,.97,i/14),v=-.05;const y=SY+domeY(u,v)+.045+(i>11?-.02*(i-11):0);pts.push(V(u*RX*(i>12?1.03:1),y,v*RZ));}
  const tg=new T.TubeGeometry(new T.CatmullRomCurve3(pts),16,.026,5,false);const rad=6;paint(tg,(v,i)=>{const a=Math.floor(i/rad),b=i%rad;return ((a+b)%4<2)?'#d9b98a':'#b58f5e';});cloth.push(tg);
  const ring=new T.TorusGeometry(.05,.014,6,12);ring.rotateY(Math.PI/2);const e=pts[pts.length-1];ring.translate(e.x+q*.01,e.y-.03,e.z);gold.push(ring);
  // 오른쪽엔 가리비 조개 장식
  if(q>0){const sp=pts[9];const fan=[];for(let k=-3;k<=3;k++){const f=sph(.05,6,4);f.scale(.32,1,.32);f.translate(0,.05,0);f.rotateX(k*.28);fan.push(paint(f,()=>k%2?'#ffd9c7':'#ffc2ae'));}
   const hinge=sph(.025,8,6);hinge.scale(1.6,.8,.6);fan.push(paint(hinge,()=>'#f6b39c'));const sc=merge(fan);sc.rotateZ(-.95);sc.rotateY(0);sc.translate(sp.x+.06,sp.y-.07,sp.z+.05);cloth.push(sc);}});
 // 꽃 한 송이 (담요 앞 왼쪽 모서리)
 if(!LITE){const fu=-.36,fv=.26;const fy=SY+domeY(fu,fv)+.08,fx=fu*RX,fz=fv*RZ;const fl=[];for(let k=0;k<5;k++){const a=k/5*Math.PI*2;const pe=sph(.05,7,4);pe.scale(1,.32,.62);pe.translate(.055,0,0);pe.rotateY(a);fl.push(paint(pe,()=>P.flower));}
  const ce=sph(.028,10,6);ce.scale(1,.6,1);ce.translate(0,.012,0);fl.push(paint(ce,()=>P.fc));
  [0,1].forEach(k=>{const lf=sph(.06,6,3);lf.scale(1,.2,.4);lf.translate(.08,-.012,0);lf.rotateY(2.3+k*1.1);fl.push(paint(lf,()=>P.skinD));});
  const f=merge(fl);f.rotateZ(.25);f.rotateX(-.3);f.translate(fx,fy,fz);cloth.push(f);}
 const clothM=mk(merge(cloth.map(g=>g.attributes.color?g:paint(g,()=>P.cloth)))),goldM=mk(merge(gold.map(g=>paint(g,()=>'#ffffff'))),M.gold);
 clothM.material=M.cloth;body.add(clothM,goldM);
 U.seatL=new T.Object3D();U.seatL.position.set(0,SY+1.27,-.1);body.add(U.seatL);U.seat=[0,SY+1.27,-.1];U.pose='sit';

 // ── 머리 · 목: 부드러운 곡선, 큰 눈 + 반짝임, 미소, 볼터치, 머리 비늘판 ──
 const hd=new T.Group();hd.position.set(0,SY+.2,1.12);body.add(hd);U.head=hd;U.hp=hd.position.clone();
 const cS=C(P.skin),cCr=C(P.cream);const HC=V(0,.17,.5),HR=V(.3,.26,.32);
 const belly=(v,cy,w)=>{const t=sm(cy+w,cy-w,v.y);return cS.clone().lerp(cCr,t);};
 const hp=[];
 {const n=new T.CylinderGeometry(.16,.205,.6,18,5,true);n.rotateX(Math.PI/2);n.rotateX(-.32);n.translate(0,-.02,.12);paint(n,v=>belly(v,-.06+v.z*.3,.08),v=>1);hp.push(n);
  [-.08,.06].forEach((z,k)=>{const w=new T.TorusGeometry(.19-k*.015,.022,qs(6,4),qs(16,8));w.rotateX(-.32);w.translate(0,-.03+z*.32,z+.0);paint(w,v=>belly(v,-.08+z*.3,.08).multiplyScalar(.93),v=>.5);hp.push(w);});
  const h=sph(1,22,14);h.scale(HR.x,HR.y,HR.z);h.translate(HC.x,HC.y,HC.z);paint(h,v=>belly(v,HC.y-.07+(v.z-HC.z)*.15,.06),v=>sm(HC.y-.05,HC.y+.05,v.y));hp.push(h);
  const sn=sph(1,16,10);sn.scale(.205,.15,.17);sn.translate(0,.11,.71);paint(sn,v=>belly(v,.07,.04),v=>sm(.1,.18,v.y)*.6);hp.push(sn);
  // 머리 위 비늘판
  [[0,.44,.52,1.0],[-.11,.41,.44,.8],[.11,.41,.44,.8],[0,.42,.36,.75]].forEach(([x,y,z,s])=>{const pl=sph(.068*s,10,6);pl.scale(1,.22,1.15);
   const nrm=V(x/HR.x/HR.x,(y-HC.y)/HR.y/HR.y,(z-HC.z)/HR.z/HR.z).normalize();
   const q=new T.Quaternion().setFromUnitVectors(V(0,1,0),nrm);pl.applyQuaternion(q);
   const pp=V(x,y,z);const d=V().subVectors(pp,HC);d.x/=HR.x;d.y/=HR.y;d.z/=HR.z;const L=d.length();pp.set(HC.x+d.x/L*HR.x*.985,HC.y+d.y/L*HR.y*.985,HC.z+d.z/L*HR.z*.985);pl.translate(pp.x,pp.y,pp.z);
   paint(pl,()=>C(P.skinD).lerp(cS,.5),0);hp.push(pl);});
  // 볼터치
  [-1,1].forEach(q=>{const c=sph(.07,10,6);c.scale(1,.62,.3);c.rotateY(q*.85);c.translate(q*.205,.09,.72);paint(c,()=>P.cheek,0);hp.push(c);});
  // 미소 + 콧구멍
  const spts=[];for(let i=0;i<=12;i++){const t=i/6-1,x=t*.075,y=.07+.028*t*t;const zz=1-Math.pow(x/.205,2)-Math.pow((y-.11)/.15,2);spts.push(V(x,y,.71+.17*Math.sqrt(Math.max(0,zz))+.002));}
  const sm1=new T.TubeGeometry(new T.CatmullRomCurve3(spts),qs(14,8),.0085,qs(5,3),false);paint(sm1,()=>'#3a2a22',0);hp.push(sm1);
  [-1,1].forEach(q=>{const ns=sph(.012,8,6);{const x=q*.045,y=.15,zz=1-Math.pow(x/.205,2)-Math.pow((y-.11)/.15,2);ns.translate(x,y,.71+.17*Math.sqrt(Math.max(0,zz)));}paint(ns,()=>'#2a3a2e',0);hp.push(ns);});}
 hd.add(mk(merge(hp),M.skin));
 // 눈 (깜빡임용 그룹)
 U.eyes=[];[-1,1].forEach(q=>{const eg=new T.Group();eg.position.set(q*.168,.235,.73);hd.add(eg);
  const eb=sph(.086,14,9);const eyeM=mk(eb,M.eye,false);eg.add(eyeM);
  const h1=sph(.026,10,8);h1.translate(q*-.012,.034,.07);const h2=sph(.012,8,6);h2.translate(q*.03,-.026,.074);const hiM=mk(merge([paint(h1,()=>'#fff'),paint(h2,()=>'#fff')]),M.hi,false);eg.add(hiM);
  // 윗눈꺼풀 라인 (살짝)
  const lid=new T.TorusGeometry(.088,.012,4,qs(12,6),1.9);lid.rotateZ(Math.PI/2-.95+.0);lid.rotateY(q*.15);lid.translate(0,.004,.012);paint(lid,()=>P.skinD,0);eg.add(mk(lid.toNonIndexed?lid:lid,M.skin,false));
  U.eyes.push(eg);});

 // ── 꼬리 ──
 const tgm=new T.ConeGeometry(.11,.36,qs(12,6),2);tgm.rotateX(-Math.PI/2);tgm.translate(0,0,-.16);paint(tgm,v=>belly(v,-.02,.05),1);const tail=mk(tgm,M.skin);tail.position.set(0,SY+.06,-1.24);tail.rotation.x=.25;body.add(tail);U.tail=tail;

 // ── 다리 4 (땅) + 유선형 지느러미 4 (물) ──
 const legProf=[[0,-.8],[.2,-.8],[.265,-.775],[.285,-.7],[.255,-.58],[.225,-.36],[.215,-.12],[.19,.06],[.1,.12],[0,.13]].map(p=>new T.Vector2(p[0],p[1]));
 function finShape(f){const s=new T.Shape();if(f){s.moveTo(0,.2);s.bezierCurveTo(.35,.31,.78,.24,1.08,.03);s.quadraticCurveTo(1.27,-.11,1.15,-.24);s.bezierCurveTo(.9,-.25,.52,-.23,.26,-.19);s.quadraticCurveTo(0,-.16,0,-.06);}
  else{s.moveTo(0,.14);s.bezierCurveTo(.26,.19,.52,.09,.64,-.07);s.quadraticCurveTo(.69,-.21,.53,-.25);s.bezierCurveTo(.35,-.25,.12,-.19,0,-.12);}s.closePath();return s;}
 const finG=[0,1].map(f=>{const g=new T.ExtrudeGeometry(finShape(f),{depth:.02,bevelEnabled:true,bevelThickness:.035,bevelSize:.03,bevelSegments:LITE?1:2,curveSegments:qs(10,5)});g.rotateX(Math.PI/2);g.translate(0,.01,0);
  const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setY(i,p.getY(i)-(f?.08:.05)*x*x);}g.computeVertexNormals();
  paint(g,v=>{const t=sm(f?.55:.3,f?1.2:.66,v.x);const c=cS.clone().lerp(C(P.skinD),.25+.0*t).lerp(cCr,t*.45);if(v.y<-.02*v.x*v.x-.01)c.lerp(cCr,.35);return c;},v=>1);return g;});
 [[-.72,.64,1],[.72,.64,1],[-.68,-.68,0],[.68,-.68,0]].forEach(([x,z,f])=>{const q=Math.sign(x);
  const lp=[];const lg=new T.LatheGeometry(legProf,qs(12,7));paint(lg,v=>{const c=cS.clone().lerp(C(P.skinD),.15);return v.y<-.66?c.lerp(cCr,.35):c;},v=>sm(-.72,-.5,v.y));lp.push(lg);
  [-.5,0,.5].forEach(a=>{const nl=sph(.055,8,5);nl.scale(1,.62,1.1);nl.translate(Math.sin(a)*.25,-.765,Math.cos(a)*.25);paint(nl,()=>P.cream,0);lp.push(nl);});
  const leg=mk(merge(lp),M.skin);
  const fm=mk(finG[f].clone(),M.fin);fm.scale.x=q;const fl=new T.Group();fl.add(fm);fl.rotation.y=q*(f?-.35:-.55);
  const piv=new T.Group();piv.position.set(x,SY+.08,z);body.add(piv);const lgG=new T.Group();lgG.add(leg);leg.position.y=-.02;piv.add(lgG);const flG=new T.Group();flG.add(fl);piv.add(flG);
  U.limbs.push({piv,lgG,flG,q,f,ph:(x<0)===(z>0)?0:Math.PI,y0:SY+.08});});

 // ── 물 효과: 거품 링 + 거품 방울 + 공기방울 ──
 // 물 효과는 body 안에 두고 가라앉은 만큼 되올려요 → 게임이 body 대신 그룹을 내려도 늘 수면 높이에 있어요
 const fx=new T.Group();U.fx=fx;/* 물에 처음 들어갈 때 붙여요 (상점 썸네일 크기 계산에 안 들어가게) */
 {const rg=new T.RingGeometry(1.25,1.9,64,3);rg.rotateX(-Math.PI/2);const p=rg.attributes.position,c=new Float32Array(p.count*4),fc=C(P.foam);
  for(let i=0;i<p.count;i++){const r=Math.hypot(p.getX(i),p.getZ(i)),a=Math.atan2(p.getX(i),p.getZ(i));const t=(r-1.25)/.65;const al=Math.sin(Math.PI*Math.min(1,t*1.15))*(.55+.25*Math.sin(a*9))*(t<.05?0:1);c.set([fc.r,fc.g,fc.b,Math.max(0,al)*.8],i*4);}
  rg.setAttribute('color',new T.BufferAttribute(c,4));const ring=mk(rg,M.foam,false);ring.scale.set(1,1,1.15);ring.renderOrder=2;fx.add(ring);U.foam=ring;
  const fb=new T.InstancedMesh(new T.SphereGeometry(.09,6,4),M.bub,18);fb.castShadow=false;U.fb=fb;fx.add(fb);U.fbd=[];for(let i=0;i<18;i++){const a=i/18*Math.PI*2+Math.random()*.2;U.fbd.push({a,r:1.32+Math.random()*.18,s:.6+Math.random()*.7,p:Math.random()*6});}
  const bb=new T.InstancedMesh(new T.IcosahedronGeometry(.045,0),M.bub,10);bb.castShadow=false;U.bb=bb;fx.add(bb);U.bbd=[];for(let i=0;i<10;i++)U.bbd.push({x:(Math.random()-.5)*1.6,z:-1.2-Math.random()*.5,t:Math.random(),s:.6+Math.random()*.8});}
 const dm=new T.Object3D();
 U.setMode=t=>{U.mode=t;};
 U.tick=(dt,time,moving)=>{const t=U.mode,e=sm(0,1,t),legT=sm(0,.6,t),finT=sm(.35,1,t),w=moving?1:0;
  body.position.y=lerp(0,-.64,e);
  for(const L of U.limbs){const sw=Math.sin(time*3.0+L.ph);L.lgG.rotation.set(sw*.3*w*(1-legT),0,L.q*legT*1.4);const s=1-legT*.85;L.lgG.scale.set(1-legT*.35,s,1-legT*.35);L.lgG.visible=s>.17;
   L.piv.position.y=L.y0+finT*.05;const fs=Math.max(.02,finT);L.flG.scale.set(fs,1,fs);L.flG.visible=finT>.02;
   const st=Math.sin(time*(L.f?4.2:5.6)+L.ph*.5)*finT*(moving?1:.4);L.flG.rotation.set(0,L.q*(L.f?st*.5:st*.3),L.q*(L.f?st*.32-.14:-.04));}
  body.rotation.z=Math.sin(time*1.7)*.04*e;body.rotation.x=Math.sin(time*1.3+1)*.025*e;body.position.y+=Math.sin(time*2.1)*.025*e+(moving?Math.abs(Math.sin(time*3.0))*.025*(1-e):0);
  hd.position.set(U.hp.x,U.hp.y+e*.1,U.hp.z+e*.05);hd.rotation.x=Math.sin(time*1.6)*.04-e*.08;hd.rotation.y=Math.sin(time*.7)*.12*(1-w*.6);tail.rotation.y=Math.sin(time*2.4)*.2;
  // 눈 깜빡임 (4초마다)
  const bl=(time%4.2);const ey=bl<.14?Math.max(.12,Math.abs(bl-.07)/.07):1;U.eyes.forEach(o=>o.scale.y=ey);
  M.shell.userData.U.uTime.value=time;
  // 물 효과
  fx.position.y=-body.position.y+.03;fx.rotation.set(-body.rotation.x,0,-body.rotation.z);fx.visible=e>.05;if(fx.visible&&!fx.parent)body.add(fx);if(fx.visible){U.foam.material.opacity=1;U.foam.scale.set(1+.03*Math.sin(time*2),1,1.15+.03*Math.sin(time*2+1));U.foam.rotation.y=time*.05;
   const k=e*(moving?1:.6);U.fbd.forEach((d,i)=>{const r=d.r+.05*Math.sin(time*1.5+d.p);dm.position.set(Math.sin(d.a)*r*1.0,.02+.02*Math.sin(time*2+d.p),Math.cos(d.a)*r*1.15);const s=d.s*k*(.75+.25*Math.sin(time*3+d.p));dm.scale.set(s,s*.45,s);dm.updateMatrix();U.fb.setMatrixAt(i,dm.matrix);});U.fb.instanceMatrix.needsUpdate=true;
   U.bbd.forEach((d,i)=>{d.t+=(dt||.016)*(moving?1.1:.5);if(d.t>1){d.t=0;d.x=(Math.random()-.5)*1.6;d.z=-1.1-Math.random()*.6;}const s=d.s*e*(1-d.t)*(moving?1:.6);dm.position.set(d.x+Math.sin(d.t*9+i)*.05,.05+d.t*.5,d.z-d.t*.4);dm.scale.setScalar(s);dm.updateMatrix();U.bb.setMatrixAt(i,dm.matrix);});U.bb.instanceMatrix.needsUpdate=true;}};
 U.stats=()=>{let tri=0,mesh=0;g.traverse(o=>{if(o.isMesh){mesh++;const gg=o.geometry;const n=gg.index?gg.index.count/3:gg.attributes.position.count/3;tri+=n*(o.isInstancedMesh?o.count:1);}});return {tri:Math.round(tri),mesh};};
 return g;}
window.TURTLE_V2=build;window.TURTLE_V2_PAL=PAL;window.TURTLE_V2_SURF={surfY,domeY,RX,RZ,SY};
})();
