// v241 ✈️ 버블 전투기 (테스트) — 시안 /workspace/mount-mock-jet (별 무늬 지운 판) · 절차적 모델. 앞 +z, 위 +y, 로컬 단위(게임에서 sc 1.6 곱함)
window.JET_BUBBLE=(function(){
let T=null,BU=null;
const PAL={
 ace:{n:'로열 골드 에이스',base:'#16204a',base2:'#0b1230',belly:'#cfd6e6',acc:'#f3c24c',acc2:'#fff0b8',trim:'#20242e',glass:'#ffd77a',glassOp:.30,flame:['#7fe7ff','#2a8cff','#ffffff'],nav:'#ffe9a8',strip:'#ffd35a',met:.55,rough:.32,stripeMet:1,irid:0,dark:1},
 aurora:{n:'오로라 펄',grad:['#86ecd2','#bcd0ff','#cdb2ff','#ffa6d6'],fx:'aurora',base:'#f3f0fb',base2:'#dcd6f5',belly:'#ffffff',acc:'#7ef2d6',acc2:'#c99bff',trim:'#3a3f5a',glass:'#a8f0ff',glassOp:.28,flame:['#ff8ff0','#8a5cff','#ffffff'],nav:'#b9fff0',strip:'#7ef2d6',met:.15,rough:.22,stripeMet:.3,irid:1,dark:0},
 phoenix:{n:'크림슨 피닉스',fx:'fire',base:'#c4142c',base2:'#6e0716',belly:'#2a1d22',acc:'#ffb43a',acc2:'#ffe27a',trim:'#1d1a1f',glass:'#ffb36b',glassOp:.30,flame:['#ffcf5a','#ff4a1c','#fff4d0'],nav:'#ffd27a',strip:'#ff9a3a',met:.35,rough:.28,stripeMet:.9,irid:0,dark:1},
 grey:{n:'(기존) 회색',base:'#8f9aa8',base2:'#6e7987',belly:'#d4dae2',acc:'#ff6b4a',acc2:'#ffd0c0',trim:'#3a3d46',glass:'#9fdcf5',glassOp:.3,flame:['#ffcf6a','#ff7a2a','#fff'],nav:'#fff',strip:'#ff6b4a',met:.4,rough:.4,stripeMet:.4,irid:0,dark:1}
};
// ---------- 유틸 ----------
const lerp=(a,b,t)=>a+(b-a)*t;
function cr(tab,s){// 균등 노트 캐트멀롬
 const n=tab.length-1,f=Math.max(0,Math.min(n,s*n)),i=Math.min(n-1,Math.floor(f)),t=f-i;
 const p0=tab[Math.max(0,i-1)],p1=tab[i],p2=tab[i+1],p3=tab[Math.min(n,i+2)];
 return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);}
const sp=(c,e)=>Math.sign(c)*Math.pow(Math.abs(c),e);
// 단면 로프트: F(s)->{z,w,yt,yb,yc,n} , 둘레 seg개, 길이 ns개
function loft(F,ns,seg,o){o=o||{};const P=[],UV=[],I=[];
 for(let j=0;j<=ns;j++){const s=j/ns,f=F(s);for(let i=0;i<=seg;i++){const u=i/seg,th=-Math.PI/2+u*Math.PI*2,c=Math.cos(th),sn=Math.sin(th),e=2/f.n;
  const x=f.w*sp(c,e),y=f.yc+(sn>0?f.yt:f.yb)*sp(sn,e);P.push(x,y,f.z);UV.push(u,s);}}
 for(let j=0;j<ns;j++)for(let i=0;i<seg;i++){const a=j*(seg+1)+i,b=a+seg+1;I.push(a,a+1,b,b,a+1,b+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();return g;}
// 에어포일 날개 로프트 (스팬 +x 방향, 앞전 +z). opt:{x0,y0,z0,span,c0,c1,sweep,th,dih,twist,ns,nc}
function wing(o){const P=[],UV=[],I=[];const nc=o.nc||14,ns=o.ns||8;const ring=nc*2;
 const af=x=>5*o.th*(0.2969*Math.sqrt(x)-0.126*x-0.3516*x*x+0.2843*x*x*x-0.1036*x*x*x*x);
 for(let j=0;j<=ns;j++){const t=j/ns,c=lerp(o.c0,o.c1,t),le=o.z0-o.sweep*t*o.span,x=o.x0+t*o.span,yb=o.y0+t*o.span*Math.tan(o.dih||0);const tipK=t>=1?0.12:1;
  for(let i=0;i<ring;i++){const k=i<nc?i/nc:(ring-i)/nc;const xc=(1-Math.cos(k*Math.PI))/2;const up=i<nc?1:-1;const th=af(Math.max(xc,1e-4))*c*tipK*(up);
   P.push(x,yb+th,le-xc*c);UV.push(xc,t);}}
 for(let j=0;j<ns;j++)for(let i=0;i<ring;i++){const a=j*ring+i,b=a+ring,a1=j*ring+(i+1)%ring,b1=a1+ring;I.push(a,b,a1,b,b1,a1);}
 // 끝 캡
 const base=P.length/3;const tj=ns*ring;const cx=P[tj*3],cy=P[tj*3+1];for(let i=1;i<ring-1;i++)I.push(tj,tj+i+1,tj+i);
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
 if(o.flip){g.scale(-1,1,1);const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t2=ix[i];ix[i]=ix[i+1];ix[i+1]=t2;}g.computeVertexNormals();}
 return g;}
function mirror(g){const m=g.clone();m.scale(-1,1,1);const ix=m.index.array;for(let i=0;i<ix.length;i+=3){const t2=ix[i];ix[i]=ix[i+1];ix[i+1]=t2;}m.computeVertexNormals();return m;}
function lathe(pts,seg,ridge){const g=new T.LatheGeometry(pts.map(p=>new T.Vector2(p[0],p[1])),seg||24);if(ridge){const P=g.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),a=Math.atan2(z,x),r=Math.hypot(x,z),k=1+ridge*Math.max(0,Math.cos(a*14));P.setX(i,x*k);P.setZ(i,z*k);}g.computeVertexNormals();}return g;}
const M=(geo,fn)=>{fn&&fn(geo);return geo;};
function nonIdx(g){return g.index?g.toNonIndexed():g;}
function merge(list){const L=list.map(g=>{g=nonIdx(g);if(!g.attributes.uv){g.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));}['color','uv2','tangent'].forEach(a=>g.deleteAttribute&&g.attributes[a]&&g.deleteAttribute(a));return g;});return BU.mergeBufferGeometries(L,false);}
// ---------- 환경맵 (모델이 직접 가지고 다님: 게임 씬엔 environment가 없어요) ----------
// v241: 환경맵을 렌더러와 상관없는 HDR 데이터 텍스처로 만들어요 (게임 화면 · 상점 그림 · 다른 렌더러에서 모두 같은 반사)
let ENVT=null;
function envMap(){if(ENVT)return ENVT;const W=256,H=128,D=new Uint16Array(W*H*4),hf=T.DataUtils.toHalfFloat;
 const B=[[0,8,2,6,3,3.2],[6,3,4,2.5,4,2.0],[-7,2.5,-3,3,1.6,1.6],[2,1.2,-8,8,.5,1.4]].map(([x,y,z,w,h,i])=>{const d=Math.hypot(x,y,z);return {d:[x/d,y/d,z/d],c:Math.cos(Math.atan(Math.max(w,h)*.5/d)),i};});
 const mix=(a,b,t)=>a.map((v,k)=>v+(b[k]-v)*t);
 for(let j=0;j<H;j++){const th=((j+.5)/H-.5)*Math.PI,cy=Math.cos(th),y=Math.sin(th);for(let i=0;i<W;i++){const ph=((i+.5)/W-.5)*Math.PI*2,x=Math.cos(ph)*cy,z=Math.sin(ph)*cy;
  let c=y>0?mix([1,.93,.86],[.36,.55,.85],Math.pow(y,.55)):mix([.7,.651,.602],[.22,.24,.28],Math.pow(-y,.4));c=c.map(v=>v*1.15);
  for(const b of B){if(x*b.d[0]+y*b.d[1]+z*b.d[2]>b.c){c=[b.i,b.i,b.i];break;}}
  const o=(j*W+i)*4;D[o]=hf(c[0]);D[o+1]=hf(c[1]);D[o+2]=hf(c[2]);D[o+3]=hf(1);}}
 const t=new T.DataTexture(D,W,H,T.RGBAFormat,T.HalfFloatType);t.mapping=T.EquirectangularReflectionMapping;t.magFilter=t.minFilter=T.LinearFilter;t.needsUpdate=true;return ENVT=t;}
const TXC={};
// ---------- 캔버스 텍스처 ----------
function cv(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');f(x,w,h);return c;}
function tex(c,srgb){const t=new T.CanvasTexture(c);if(srgb)t.encoding=T.sRGBEncoding;t.anisotropy=8;t.needsUpdate=true;return t;}
function star(x,cx,cy,r,ri,rot){x.beginPath();for(let i=0;i<10;i++){const a=rot-Math.PI/2+i*Math.PI/5,rr=i%2?ri:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}x.closePath();}
// 동체 텍스처: u=둘레(0 아래 → .25 +x옆 → .5 위 → .75 -x옆), v=길이(0 꼬리 → 1 코). 캔버스 가로=v(길이), 세로=u
function bodyTex(p){const W=2048,H=1024;
 const vx=v=>v*W,uy=u=>u*H;
 const col=cv(W,H,(x)=>{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,p.belly);g.addColorStop(.08,p.belly);g.addColorStop(.15,p.base2);g.addColorStop(.30,p.base);g.addColorStop(.70,p.base);g.addColorStop(.85,p.base2);g.addColorStop(.92,p.belly);g.addColorStop(1,p.belly);x.fillStyle=g;x.fillRect(0,0,W,H);
  if(p.grad){x.save();x.globalCompositeOperation='multiply';const gg=x.createLinearGradient(W,0,0,0);p.grad.forEach((c,i)=>gg.addColorStop(i/(p.grad.length-1),c));x.fillStyle=gg;x.fillRect(0,0,W,H);x.restore();}
  if(p.fx==='aurora'){x.save();x.globalCompositeOperation='source-over';for(let k=0;k<3;k++){const gg=x.createLinearGradient(0,0,0,H);const cs=[['rgba(126,242,214,0)','rgba(60,220,180,.75)'],['rgba(160,110,255,0)','rgba(160,110,255,.7)'],['rgba(255,110,200,0)','rgba(255,110,200,.65)']][k];
    [.25,.75].forEach(uc=>{x.fillStyle=cs[1];x.beginPath();x.moveTo(vx(.08),uy(uc));for(let v=.08;v<=.92;v+=.02)x.lineTo(vx(v),uy(uc+Math.sin(v*9+k*1.7)*.035+(k-1)*.04));for(let v=.92;v>=.08;v-=.02)x.lineTo(vx(v),uy(uc+Math.sin(v*9+k*1.7+.6)*.035+(k-1)*.04+.022));x.closePath();x.fill();});}
   x.restore();} // t166: 반짝이 별 무늬 삭제
  // 등줄기 쌍 스트라이프 (코→꼬리, 조종석 부분은 캐노피에 가려짐)
  const S=(u0,u1,c)=>{x.fillStyle=c;x.fillRect(vx(.0),uy(u0),vx(1),uy(u1-u0));};
  S(.468,.478,p.acc);S(.522,.532,p.acc);S(.483,.517,p.acc2+'00');
  // 옆구리 스피드 라인 (양쪽 대칭: +x옆 u .25 , -x옆 u .75)
  [.25,.75].forEach(uc=>{const sg=uc<.5?1:-1;x.save();x.fillStyle=p.acc;x.beginPath();x.moveTo(vx(.15),uy(uc+sg*.035));x.lineTo(vx(.86),uy(uc-sg*.005));x.lineTo(vx(.88),uy(uc-sg*.0));x.lineTo(vx(.86),uy(uc+sg*.012));x.lineTo(vx(.2),uy(uc+sg*.055));x.closePath();x.fill();
   x.fillStyle=p.acc2;x.beginPath();x.moveTo(vx(.3),uy(uc+sg*.062));x.lineTo(vx(.78),uy(uc+sg*.02));x.lineTo(vx(.78),uy(uc+sg*.028));x.lineTo(vx(.32),uy(uc+sg*.072));x.closePath();x.fill();x.restore();
   // t166: 옆구리 별 엠블럼 삭제
   // 숫자 07 (코 옆) — 방향 맞춤: +x옆은 그대로, -x옆은 뒤집기
   x.save();x.translate(vx(.80),uy(uc-sg*.045));x.rotate(sg>0?Math.PI:0);x.scale(1,1.0);x.font='900 64px sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle=p.trim;x.strokeText('07',0,0);x.fillStyle=p.acc2;x.fillText('07',0,0);x.restore();
  });
  // 코 끝 레이돔 색
  const rg=x.createLinearGradient(vx(.9),0,vx(1),0);rg.addColorStop(0,p.base+'00');rg.addColorStop(.25,p.trim);rg.addColorStop(1,p.trim);x.fillStyle=rg;x.fillRect(vx(.9),0,vx(.1),H);
  if(p.fx==='fire'){[.25,.75].forEach(uc=>{const sg=uc<.5?1:-1;for(let k=0;k<7;k++){const v0=.50-k*.055,len=.16+k*.012,amp=.05+k*.008;const gg=x.createLinearGradient(vx(v0),0,vx(v0-len),0);gg.addColorStop(0,'#ffe27a');gg.addColorStop(.5,'#ffb43a');gg.addColorStop(1,'rgba(255,90,30,0)');x.fillStyle=gg;x.beginPath();const ub=uc+sg*(.10-.02*Math.sin(k));x.moveTo(vx(v0+.03),uy(ub));x.quadraticCurveTo(vx(v0-len*.4),uy(ub-sg*amp*1.4),vx(v0-len),uy(ub-sg*amp*.4));x.quadraticCurveTo(vx(v0-len*.5),uy(ub-sg*amp*.3),vx(v0),uy(ub+sg*.01));x.closePath();x.fill();}});}
  // 조종석 우물 (캐노피 아래 어두운 실내)
  {const v0=.425,v1=.775,u0=.355,u1=.645;const g2=x.createLinearGradient(0,uy(u0),0,uy(u1));g2.addColorStop(0,'#2a2f3a');g2.addColorStop(.5,'#151820');g2.addColorStop(1,'#2a2f3a');x.fillStyle=g2;x.beginPath();x.ellipse(vx((v0+v1)/2),uy(.5),vx((v1-v0)/2),uy((u1-u0)/2),0,0,Math.PI*2);x.fill();
   x.strokeStyle='rgba(255,255,255,.08)';x.lineWidth=3;for(let i=1;i<6;i++){x.beginPath();x.moveTo(vx(v0+(v1-v0)*i/6),uy(u0+.03));x.lineTo(vx(v0+(v1-v0)*i/6),uy(u1-.03));x.stroke();}}
  // 꼬리 쪽 열 그을림
  const hg=x.createLinearGradient(0,0,vx(.12),0);hg.addColorStop(0,'rgba(20,14,10,.55)');hg.addColorStop(1,'rgba(20,14,10,0)');x.fillStyle=hg;x.fillRect(0,0,vx(.12),H);
  // 패널 라인
  x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=2.2;
  [.12,.27,.42,.70,.84].forEach(v=>{x.beginPath();x.moveTo(vx(v),0);x.lineTo(vx(v),H);x.stroke();});
  [.14,.36,.64,.86].forEach(u=>{x.beginPath();x.moveTo(0,uy(u));x.lineTo(W,uy(u));x.stroke();});
  // 접근 패널 · 리벳
  x.strokeStyle='rgba(0,0,0,.22)';x.lineWidth=1.6;[[.33,.30],[.33,.70],[.5,.2],[.5,.8],[.18,.4],[.18,.6]].forEach(([v,u])=>{x.strokeRect(vx(v)-40,uy(u)-22,80,44);});
  x.fillStyle='rgba(0,0,0,.25)';for(let v=.13;v<.9;v+=.012){[.143,.357,.643,.857].forEach(u=>{x.beginPath();x.arc(vx(v),uy(u)+4,1.6,0,7);x.fill();});}
  // 경고 문구
  x.fillStyle=p.dark?'rgba(255,255,255,.55)':'rgba(40,40,60,.5)';x.font='bold 14px sans-serif';x.fillText('NO STEP',vx(.40),uy(.44));x.fillText('NO STEP',vx(.40),uy(.57));x.fillText('FISH COZY AIR',vx(.30),uy(.505));
 });
 const orm=cv(W,H,(x)=>{// R:-, G:roughness, B:metalness
  x.fillStyle=`rgb(0,${Math.round(p.rough*255)},${Math.round(p.met*255)})`;x.fillRect(0,0,W,H);
  x.drawImage(col,0,0);const d=x.getImageData(0,0,W,H),a=d.data;const ac=new T.Color(p.acc),A=[ac.r*255,ac.g*255,ac.b*255];const ac2=new T.Color(p.acc2),A2=[ac2.r*255,ac2.g*255,ac2.b*255];
  for(let i=0;i<a.length;i+=4){const dd=Math.abs(a[i]-A[0])+Math.abs(a[i+1]-A[1])+Math.abs(a[i+2]-A[2]),d2=Math.abs(a[i]-A2[0])+Math.abs(a[i+1]-A2[1])+Math.abs(a[i+2]-A2[2]);const lum=(a[i]+a[i+1]+a[i+2])/3;
   let r=p.rough,m=p.met;if(dd<60||d2<60){r=.2;m=p.stripeMet;}const px=(i/4)%W;if(px>W*.9){r=.5;m=.1;}if(lum<40&&!(dd<60)){r=.6;}
   a[i]=0;a[i+1]=r*255;a[i+2]=m*255;a[i+3]=255;}x.putImageData(d,0,0);});
 const bump=cv(W,H,(x)=>{x.fillStyle='#fff';x.fillRect(0,0,W,H);x.strokeStyle='#000';x.lineWidth=3;[.12,.27,.42,.70,.84].forEach(v=>{x.beginPath();x.moveTo(vx(v),0);x.lineTo(vx(v),H);x.stroke();});[.14,.36,.64,.86].forEach(u=>{x.beginPath();x.moveTo(0,uy(u));x.lineTo(W,uy(u));x.stroke();});x.lineWidth=2;[[.33,.30],[.33,.70],[.5,.2],[.5,.8],[.18,.4],[.18,.6]].forEach(([v,u])=>{x.strokeRect(vx(v)-40,uy(u)-22,80,44);});});
 // 텍스처 좌표 변환: canvas x=v, y=u 이므로 uv 를 (v,u)로 바꿔서 매핑 (geometry 쪽에서 swap)
 return {map:tex(col,1),orm:tex(orm),bump:tex(bump)};}
// 날개 텍스처: u=시위(0 앞전→1 뒷전), v=스팬(0 뿌리→1 끝). canvas x=스팬, y=시위
function wingTex(p){const W=1024,H=512;
 const col=cv(W,H,x=>{x.fillStyle=p.base;x.fillRect(0,0,W,H);
  if(p.grad){const gg=x.createLinearGradient(0,0,W,0);p.grad.forEach((c,i)=>gg.addColorStop(i/(p.grad.length-1),c));x.save();x.globalCompositeOperation='multiply';x.fillStyle=gg;x.fillRect(0,0,W,H);x.restore();}
  if(p.fx==='fire'){for(let k=0;k<5;k++){const y0=H*(.25+k*.11);const gg=x.createLinearGradient(0,0,W*.8,0);gg.addColorStop(0,'rgba(255,180,58,.0)');gg.addColorStop(.3,'rgba(255,180,58,.85)');gg.addColorStop(1,'rgba(255,226,122,.0)');x.fillStyle=gg;x.beginPath();x.moveTo(0,y0);x.quadraticCurveTo(W*.4,y0-H*.05,W*.78,y0+H*.08);x.quadraticCurveTo(W*.4,y0+H*.02,0,y0+H*.05);x.fill();}}
  if(p.fx==='aurora'){x.save();x.globalCompositeOperation='source-over';[['rgba(60,220,180,.7)',.3],['rgba(160,110,255,.65)',.5],['rgba(255,110,200,.6)',.7]].forEach(([c,y])=>{x.fillStyle=c;x.beginPath();x.moveTo(0,H*y);for(let i=0;i<=W*.8;i+=16)x.lineTo(i,H*y+Math.sin(i*.012)*14);for(let i=W*.8;i>=0;i-=16)x.lineTo(i,H*y+Math.sin(i*.012+.5)*14+22);x.fill();});x.restore();}
  // 끝 쪽 체크 스트라이프 + 앞전 라인
  x.fillStyle=p.acc;x.fillRect(W*.80,0,W*.07,H);x.fillStyle=p.acc2;x.fillRect(W*.885,0,W*.02,H);
  const g=x.createLinearGradient(0,0,0,H*.12);g.addColorStop(0,p.trim);g.addColorStop(1,p.base);x.fillStyle=g;x.fillRect(0,0,W,H*.08);
  // t166: 날개 별 라운델 삭제
  // 플랩 · 에일러론 패널 라인
  x.strokeStyle='rgba(0,0,0,.3)';x.lineWidth=2.5;x.beginPath();x.moveTo(0,H*.78);x.lineTo(W,H*.78);x.stroke();[.33,.66].forEach(v=>{x.beginPath();x.moveTo(W*v,H*.78);x.lineTo(W*v,H);x.stroke();});
  x.lineWidth=1.5;x.strokeStyle='rgba(0,0,0,.18)';[.2,.4,.6].forEach(u=>{x.beginPath();x.moveTo(0,H*u);x.lineTo(W*.78,H*u);x.stroke();});
 });
 const orm=cv(W,H,x=>{x.fillStyle=`rgb(0,${Math.round(p.rough*255)},${Math.round(p.met*255)})`;x.fillRect(0,0,W,H);x.fillStyle=`rgb(0,50,${Math.round(p.stripeMet*255)})`;x.fillRect(W*.80,0,W*.07,H);x.fillRect(W*.885,0,W*.02,H);x.beginPath();x.arc(W*.55,H*.45,64,0,7);x.fill();});
 return {map:tex(col,1),orm:tex(orm)};}
function gradTex(stops,w,h,vert){return tex(cv(w||64,h||256,(x,W,H)=>{const g=vert===false?x.createLinearGradient(0,0,W,0):x.createLinearGradient(0,H,0,0);stops.forEach(([o,c])=>g.addColorStop(o,c));x.fillStyle=g;x.fillRect(0,0,W,H);}),1);}
function glowTex(){return tex(cv(128,128,(x,W,H)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.2,'rgba(255,255,255,.65)');g.addColorStop(.5,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,W,H);}),1);}
function hudTex(p){return tex(cv(256,128,(x,W,H)=>{x.fillStyle='#04121a';x.fillRect(0,0,W,H);x.strokeStyle='#5cffd0';x.lineWidth=3;x.strokeRect(6,6,W*.42,H-12);x.strokeRect(W*.55,6,W*.42,H-12);
 x.beginPath();x.arc(W*.27,H*.5,34,0,7);x.stroke();x.beginPath();x.moveTo(W*.27-40,H*.5);x.lineTo(W*.27+40,H*.5);x.stroke();
 x.fillStyle='#ffd35a';x.font='bold 22px monospace';x.fillText('ALT 042',W*.6,H*.35);x.fillStyle='#5cffd0';x.fillText('SPD 95',W*.6,H*.62);x.fillStyle='#ff7aa8';x.fillRect(W*.6,H*.75,W*.3,8);}),1);}
// ---------- 동체 형상 ----------
const L0=-2.15,L1=2.45;// 꼬리 · 코
const TW=[.52,.60,.66,.70,.71,.69,.63,.52,.38,.21,.025],
 TT=[.27,.31,.35,.39,.43,.45,.45,.39,.29,.16,.025],
 TB=[.25,.28,.31,.33,.34,.33,.30,.25,.18,.10,.025],
 TC=[.02,.02,.01,0,0,0,0,-.02,-.04,-.055,-.065],
 TN=[2.8,2.8,2.8,2.7,2.6,2.5,2.4,2.3,2.2,2.1,2.0];
const FUS=s=>({z:L0+s*(L1-L0),w:cr(TW,s),yt:cr(TT,s),yb:cr(TB,s),yc:cr(TC,s),n:cr(TN,s)});
function build(key,R,o){T=T||window.THREE;BU=BU||T.BufferGeometryUtils;o=o||{};key=PAL[key]?key:'ace';const p=PAL[key];const env=envMap();
 const g=new T.Group();g.name='jet-bubble-'+key;
 const tx=TXC[key]||(TXC[key]={bt:bodyTex(p),wt:wingTex(p)}),bt=tx.bt,wt=tx.wt;
 const std=(c,x)=>Object.assign(new T.MeshPhysicalMaterial(Object.assign({color:c,metalness:.4,roughness:.4,envMap:env,envMapIntensity:1},x||{})));
 const paint=std('#ffffff',{map:bt.map,roughnessMap:bt.orm,metalnessMap:bt.orm,bumpMap:bt.bump,bumpScale:.012,metalness:1,roughness:1,clearcoat:.8,clearcoatRoughness:.12,iridescence:p.irid?1:0,iridescenceIOR:1.6,iridescenceThicknessRange:[250,900]});
 const wpaint=std('#ffffff',{map:wt.map,roughnessMap:wt.orm,metalnessMap:wt.orm,metalness:1,roughness:1,clearcoat:.8,clearcoatRoughness:.12,iridescence:p.irid?1:0,iridescenceIOR:1.35,iridescenceThicknessRange:[180,520]});
 const trim=std(p.trim,{metalness:.6,roughness:.38});
 const gold=std(p.acc,{metalness:1,roughness:.18,envMapIntensity:1.3});
 const steel=std('#8a8f99',{metalness:1,roughness:.3});
 const hot=std('#4a4552',{metalness:.95,roughness:.28});
 const glass=new T.MeshPhysicalMaterial({color:p.glass,metalness:0,roughness:.02,transparent:true,opacity:p.glassOp*.6,envMap:env,envMapIntensity:2.6,clearcoat:1,side:T.FrontSide,depthWrite:false,iridescence:.6,iridescenceIOR:1.4,iridescenceThicknessRange:[200,480]});
 const glow=c=>new T.MeshBasicMaterial({color:c,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false});
 const emis=(c)=>new T.MeshBasicMaterial({color:c,toneMapped:false});
 // 동체
 const fus=loft(FUS,46,48);{const uv=fus.attributes.uv;for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,v,1-u);}}
 // 꼬리 막음
 const capS=FUS(0);const cap=new T.CircleGeometry(1,40);cap.scale(capS.w*.98,(capS.yt+capS.yb)/2,1);cap.rotateY(Math.PI);cap.translate(0,capS.yc,capS.z+.001);
 const B={paint:[fus],wing:[],trim:[cap],gold:[],steel:[],hot:[],glass:[],emis:{},glow:{}};
 const addE=(c,geo)=>{(B.emis[c]=B.emis[c]||[]).push(geo);};const addG=(c,geo)=>{(B.glow[c]=B.glow[c]||[]).push(geo);};
 // 주익 + LERX
 const W1={x0:.40,y0:-.06,z0:.42,span:1.42,c0:2.0,c1:.42,sweep:Math.tan(40*Math.PI/180),th:.055,dih:-2*Math.PI/180,ns:10,nc:16};
 const wR=wing(W1);B.wing.push(wR,mirror(wR));
 const lx=wing({x0:.30,y0:-.02,z0:1.45,span:.36,c0:1.2,c1:.15,sweep:2.6,th:.035,dih:0,ns:4,nc:10});B.paint.push(lx,mirror(lx));
 // 카나드
 const cn=wing({x0:.42,y0:.10,z0:1.62,span:.42,c0:.46,c1:.18,sweep:Math.tan(48*Math.PI/180),th:.05,dih:6*Math.PI/180,ns:5,nc:10});B.wing.push(cn,mirror(cn));
 // 수평 꼬리
 const hs=wing({x0:.36,y0:-.03,z0:-1.25,span:.78,c0:.82,c1:.30,sweep:Math.tan(42*Math.PI/180),th:.05,dih:-3*Math.PI/180,ns:6,nc:12});B.wing.push(hs,mirror(hs));
 // 수직 꼬리 2개 (바깥으로 22° 기울임)
 const vt=wing({x0:0,y0:0,z0:0,span:.88,c0:1.05,c1:.36,sweep:Math.tan(44*Math.PI/180),th:.05,ns:7,nc:12});
 vt.rotateZ(Math.PI/2-22*Math.PI/180);vt.translate(.30,.30,-.78);B.wing.push(vt,mirror(vt));
 // 공기흡입구 (옆구리 · 날개 뿌리 아래) — 동체에 붙은 초타원 덕트 + 같은 모양 립 + 안쪽 어두운 팬
 const INT=s=>({z:lerp(-.45,.80,s),w:lerp(.10,.17,Math.min(1,s*1.25)),yt:lerp(.10,.17,Math.min(1,s*1.2)),yb:lerp(.09,.15,Math.min(1,s*1.2)),yc:-.13,n:3.2});
 const it=loft(INT,12,28);it.translate(.52,0,0);B.paint.push(it,mirror(it.clone()));
 const seRing=(w,h,n,r0,r1,seg)=>{const P=[],I=[];for(let i=0;i<=seg;i++){const th=i/seg*Math.PI*2,c=Math.cos(th),sn=Math.sin(th),e=2/n;const x=sp(c,e),y=sp(sn,e);P.push(x*w*r1,y*h*r1,0,x*w*r0,y*h*r0,0);}for(let i=0;i<seg;i++){const a=i*2;I.push(a,a+1,a+2,a+1,a+3,a+2);}const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(P,3));g2.setIndex(I);g2.computeVertexNormals();return g2;};
 const lipG=seRing(.17,.16,3.2,.78,1.02,40);lipG.translate(.52,-.13,.805);B.gold.push(lipG,mirror(lipG.clone()));
 const hole=new T.CircleGeometry(1,28);hole.scale(.135,.125,1);hole.translate(.52,-.13,.70);B.hot.push(hole,mirror(hole.clone()));
 const fan=new T.ConeGeometry(.1,.1,20);fan.rotateX(Math.PI/2);fan.translate(.52,-.13,.73);B.steel.push(fan,mirror(fan.clone()));
 // 쌍발 노즐 (꽃잎 홈 있는 선반 형상)
 const NZX=.27,NZY=.01,NZ0=-2.12;
 const nz=lathe([[.0,.0],[.215,0],[.225,.08],[.215,.22],[.19,.38],[.175,.46],[.155,.46],[.165,.38],[.16,.1],[.0,.1]],28,.04);nz.rotateX(-Math.PI/2);nz.translate(NZX,NZY,NZ0);B.hot.push(nz,mirror(nz.clone()));
 const nr=new T.TorusGeometry(.2,.022,8,28);nr.translate(NZX,NZY,NZ0-.02);B.steel.push(nr,mirror(nr.clone()));
 // 노즐 안쪽 발광 디스크
 const nd=new T.CircleGeometry(.15,24);nd.rotateY(Math.PI);nd.translate(NZX,NZY,NZ0-.18);addE(p.flame[1],nd);addE(p.flame[1],mirror(nd.clone()));
 const nd2=new T.CircleGeometry(.08,20);nd2.rotateY(Math.PI);nd2.translate(NZX,NZY,NZ0-.181);addE(p.flame[2],nd2);addE(p.flame[2],mirror(nd2.clone()));
 // 캐노피 (틴트 버블, 초타원체: 블록 머리 모서리도 안에 들어가요) + 동체에 붙은 금색 테두리
 const CC=[0,.40,.60],CR=[.50,.62,.86],CN=2.6;
 const cg=new T.SphereGeometry(1,40,18,0,Math.PI*2,0,Math.PI*.62);{const P=cg.attributes.position;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i);const t=Math.pow(Math.pow(Math.abs(x/CR[0]),CN)+Math.pow(Math.abs(y/CR[1]),CN)+Math.pow(Math.abs(z/CR[2]),CN),-1/CN);P.setXYZ(i,x*t+CC[0],y*t+CC[1],z*t+CC[2]);}cg.computeVertexNormals();}B.glass.push(cg);
 const inF=(x,y,z)=>{if(z<L0||z>L1)return false;const f=FUS((z-L0)/(L1-L0));const yy=y-f.yc,hy=yy>0?f.yt:f.yb;return Math.pow(Math.abs(x)/f.w,f.n)+Math.pow(Math.abs(yy)/hy,f.n)<=1;};
 const rimPts=[];for(let k=0;k<72;k++){const ph=k/72*Math.PI*2;let last=null;for(let th=0;th<=Math.PI*.62;th+=.004){const dx=Math.sin(th)*Math.cos(ph),dy=Math.cos(th),dz=Math.sin(th)*Math.sin(ph);const t=Math.pow(Math.pow(Math.abs(dx/CR[0]),CN)+Math.pow(Math.abs(dy/CR[1]),CN)+Math.pow(Math.abs(dz/CR[2]),CN),-1/CN);const q=[dx*t+CC[0],dy*t+CC[1],dz*t+CC[2]];if(inF(q[0],q[1],q[2])){last=q;break;}last=q;}rimPts.push(new T.Vector3(last[0],last[1]+.005,last[2]));}
 const rim=(()=>{const cu=new T.CatmullRomCurve3(rimPts,true),N=80,RS=8,r=.026,P=[],I=[],up=new T.Vector3(0,1,0);for(let i=0;i<N;i++){const u=i/N,pt=cu.getPoint(u),tg=cu.getTangent(u),n=new T.Vector3().crossVectors(tg,up).normalize(),b=new T.Vector3().crossVectors(n,tg).normalize();for(let j=0;j<RS;j++){const a=(j+.5)/RS*Math.PI*2;P.push(pt.x+r*(Math.cos(a)*n.x+Math.sin(a)*b.x),pt.y+r*(Math.cos(a)*n.y+Math.sin(a)*b.y),pt.z+r*(Math.cos(a)*n.z+Math.sin(a)*b.z));}}
  for(let i=0;i<N;i++)for(let j=0;j<RS;j++){const a=i*RS+j,b=((i+1)%N)*RS+j,c=((i+1)%N)*RS+(j+1)%RS,d=i*RS+(j+1)%RS;I.push(a,b,d,b,c,d);}const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(P,3));g2.setIndex(I);g2.computeVertexNormals();return g2;})();B.gold.push(rim);
 // 조종석 안쪽: 의자 등받이 · 계기판 · HUD
 
 const seatB=new T.CapsuleGeometry(.2,.2,4,16);seatB.scale(1.15,1,.35);seatB.translate(0,.64,.22);B.trim.push(seatB);
 const dash=new T.CylinderGeometry(.24,.26,.12,24,1,false,-Math.PI/2,Math.PI);dash.scale(1,1,.5);dash.translate(0,.42,1.22);B.trim.push(dash);
 const scr=new T.PlaneGeometry(.38,.13);scr.scale(.8,.8,1);scr.rotateX(-1.0);scr.translate(0,.485,1.15);
 const hudG=new T.PlaneGeometry(.2,.07);hudG.rotateX(-.35);hudG.translate(0,.525,1.30);addG('#5cffd0',hudG);
 // 등줄기 · 안테나 · 피토관
 const pit=new T.CylinderGeometry(.012,.022,.26,8);pit.rotateX(Math.PI/2);pit.translate(0,TC[10],L1+.11);B.steel.push(pit);
 const ant=new T.BoxGeometry(.02,.12,.12);ant.translate(0,.42,-.6);B.trim.push(ant);
 // 날개 끝 레일 + 항법등 (+x = 왼쪽 빨강, -x = 오른쪽 초록)
 const tipX=W1.x0+W1.span,tipZ=W1.z0-W1.sweep*W1.span,tipY=W1.y0+W1.span*Math.tan(W1.dih);
 const rail=new T.CapsuleGeometry(.028,.62,3,10);rail.rotateX(Math.PI/2);rail.translate(tipX+.01,tipY,tipZ-.22);B.steel.push(rail,mirror(rail.clone()));
 const navL=new T.SphereGeometry(.045,12,8);navL.translate(tipX+.02,tipY,tipZ+.12);addE('#ff3d55',navL);const navR=navL.clone();navR.translate(-2*(tipX+.02),0,0);addE('#3dff8a',navR);
 // 꼬리 끝 흰 스트로브
 const vtTop=new T.Vector3(.30+Math.cos(Math.PI/2-22*Math.PI/180)*.88,.30+Math.sin(Math.PI/2-22*Math.PI/180)*.88,-.78-Math.tan(44*Math.PI/180)*.88-.25);
 const stb=new T.SphereGeometry(.035,10,8);stb.translate(vtTop.x,vtTop.y,vtTop.z);addE('#ffffff',stb);addE('#ffffff',mirror(stb.clone()));
 // 옆구리 포메이션 라이트 띠 (발광 스트립)
 [[.75,.0,.12],[-.4,.0,.12]].forEach(([z0])=>{});
 const fsS=s=>FUS(s);[.30,.58,.80].forEach(s=>{const f=fsS(s);const st=new T.BoxGeometry(.012,.04,.26);st.translate(f.w*.985+.006,f.yc+.02,f.z);addE(p.strip,st);addE(p.strip,mirror(st.clone()));});
 // ---------- 메쉬 ----------
 const add=(list,mat,name)=>{if(!list.length)return null;const m=new T.Mesh(merge(list),mat);m.name=name;g.add(m);return m;};
 add(B.paint,paint,'paint');add(B.wing,wpaint,'wing');add(B.trim,trim,'trim');add(B.gold,gold,'gold');add(B.steel,steel,'steel');add(B.hot,hot,'hot');
 const sMat=new T.MeshBasicMaterial({map:hudTex(p),toneMapped:false});const sm=new T.Mesh(scr,sMat);sm.name='screen';g.add(sm);
 // 발광(색별 하나로 합치기 → 버텍스컬러)
 const eL=[];for(const c in B.emis){const col=new T.Color(c);B.emis[c].forEach(geo=>{geo=nonIdx(geo);const n=geo.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b;}geo.setAttribute('color',new T.BufferAttribute(a,3));geo.deleteAttribute('uv');geo.deleteAttribute('normal');eL.push(geo);});}
 const em=new T.Mesh(BU.mergeBufferGeometries(eL),new T.MeshBasicMaterial({vertexColors:true,toneMapped:false}));em.name='emis';g.add(em);
 for(const c in B.glow){const m=new T.Mesh(merge(B.glow[c]),Object.assign(glow(c),{opacity:.32,side:T.DoubleSide}));m.name='hud';g.add(m);}
 const cm=new T.Mesh(merge(B.glass),glass);cm.name='canopy';cm.renderOrder=3;g.add(cm);
 // ---------- 빛 번짐(스프라이트 대신 빌보드 포인트) ----------
 const gt=glowTex();const pts=[[tipX+.02,tipY,tipZ+.12,'#ff3d55',.55],[-(tipX+.02),tipY,tipZ+.12,'#3dff8a',.55],[vtTop.x,vtTop.y,vtTop.z,'#ffffff',.35],[-vtTop.x,vtTop.y,vtTop.z,'#ffffff',.35],[NZX,NZY,NZ0-.2,p.flame[0],.9],[-NZX,NZY,NZ0-.2,p.flame[0],.9]];
 {const P=[],C=[];pts.forEach(q=>{P.push(q[0],q[1],q[2]);const c=new T.Color(q[3]);C.push(c.r,c.g,c.b);});const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(P,3));geo.setAttribute('color',new T.Float32BufferAttribute(C,3));
  const pm=new T.PointsMaterial({size:.7,map:gt,vertexColors:true,transparent:true,blending:T.AdditiveBlending,depthWrite:false,sizeAttenuation:true,toneMapped:false,opacity:.9});const pp=new T.Points(geo,pm);pp.name='glows';g.add(pp);}
 // ---------- 애프터버너 불꽃 (U.flame 은 크기 프록시: 게임 훅이 scale 을 흔들면 길이만 따라가요) ----------
 const proxy=new T.Object3D();proxy.name='flameProxy';g.add(proxy);
 const ft=gradTex([[0,'rgba(255,255,255,1)'],[.25,'rgba(255,255,255,.9)'],[.7,'rgba(255,255,255,.35)'],[1,'rgba(255,255,255,0)']]);
 const fg=new T.Group();fg.name='flame';g.add(fg);
 const fmat=(c,op)=>new T.MeshBasicMaterial({color:c,map:ft,transparent:true,opacity:op,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 const fg2=new T.Group();fg2.position.set(0,NZY,NZ0-.16);fg.add(fg2);
 const two=(mk)=>{const A=mk(),Bq=A.clone();A.translate(NZX,0,0);Bq.translate(-NZX,0,0);return merge([A,Bq]);};
 const cone=(r,l,z)=>()=>{const c=new T.ConeGeometry(r,l,20,1,true);c.rotateX(-Math.PI/2);c.translate(0,0,z);return c;};
 const vc=(geo,c,k,uvTop)=>{geo=nonIdx(geo);const col=new T.Color(c).multiplyScalar(k);const n=geo.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b;}geo.setAttribute('color',new T.BufferAttribute(a,3));if(uvTop){const u=new Float32Array(n*2).fill(.03);geo.setAttribute('uv',new T.BufferAttribute(u,2));}return geo;};
 const FL=[vc(two(cone(.17,1.25,-.62)),p.flame[1],.5),vc(two(cone(.12,.9,-.45)),p.flame[0],.5),vc(two(cone(.065,.45,-.22)),p.flame[2],.7),
  vc(two(()=>merge([0,1,2].map(i=>{const d=new T.SphereGeometry(.05-.01*i,10,6);d.scale(1,1,1.8);d.translate(0,0,-.32-i*.26);return d;}))),p.flame[2],.6,1),
  vc(two(()=>{const r=new T.TorusGeometry(.15,.02,6,24);r.translate(0,0,-.04);return r;}),p.flame[0],.8,1)];
 FL.forEach(g2=>{g2.deleteAttribute('normal');});
 const flm=new T.Mesh(BU.mergeBufferGeometries(FL),new T.MeshBasicMaterial({vertexColors:true,map:ft,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false}));flm.name='flameMesh';fg2.add(flm);
 const flameTick=()=>{const k=proxy.visible?Math.max(.6,proxy.scale.y/1.6||1):0;fg.visible=proxy.visible;fg2.scale.set(1,1,k);};
 // 날개 끝 광선 트레일 (리본)
 const tt=gradTex([[0,'rgba(255,255,255,.9)'],[.15,'rgba(255,255,255,.6)'],[1,'rgba(255,255,255,0)']],8,128);
 const trailG=new T.PlaneGeometry(.035,1.7,1,8);trailG.rotateX(-Math.PI/2);
 const trM=new T.MeshBasicMaterial({color:p.nav,map:tt,transparent:true,opacity:.45,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false});
 const trL=[];[1,-1].forEach(sx=>{const q=trailG.clone();q.translate(sx*(tipX+.02),tipY,tipZ-.2-.85);trL.push(q);const q2=trailG.clone();q2.rotateZ(Math.PI/2);q2.translate(sx*(tipX+.02),tipY,tipZ-.2-.85);trL.push(q2);});
 const tr=new T.Mesh(merge(trL),trM);tr.name='trail';g.add(tr);
 // ---------- userData (기존 전투기와 같은 규칙) ----------
 g.userData.seat=o.seat||[0,.12,.60];g.userData.flame=proxy;g.userData.fly=1;g.userData.tilt=1;g.userData.jet=1;g.userData.slim=1;g.userData.trail=tr;
 g.userData.tick=(dt)=>{flameTick();};
 g.onBeforeRender=()=>{};
 // 각 프레임: 불꽃 길이 갱신 (렌더 직전)
 fg2.children[0].onBeforeRender=flameTick;
 g.userData.parts={paint,glass,canopyGeo:{c:CC,r:CR,n:CN},FUS};
 return g;}
return {build,PAL,FUS};})();
