// NK_ISLAND — 피쉬코지 하우징 섬 시안 v1 (house-v1.js + farm-v1.js 위에서 동작, Three.js r147)
// 섬 = 지형·길·다리·광장·선착장·개인 데크(정적 1메시) + 집터(집+텃밭) + 멀리 있는 집은 임포스터
(function(){
const TAU=Math.PI*2,rnd=s=>{const x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function glowPoints(T,glows){if(!glows.length)return null;const g=new T.BufferGeometry(),p=new Float32Array(glows.length*3),c=new Float32Array(glows.length*3),sz=new Float32Array(glows.length),col=new T.Color();
 glows.forEach((q,i)=>{p.set([q[0],q[1],q[2]],i*3);col.set(q[4]);c.set([col.r,col.g,col.b],i*3);sz[i]=q[3];});
 g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('color',new T.BufferAttribute(c,3));g.setAttribute('gsize',new T.BufferAttribute(sz,1));
 const pts=new T.Points(g,NK_HOUSE._glowMat(T));pts.frustumCulled=false;pts.renderOrder=5;return pts;}
// ── 부품 ──
const P={
 land(b,pts,o){o=o||{};const T=b.T,s=new T.Shape();pts.forEach((p,i)=>i?s.lineTo(p[0],-p[1]):s.moveTo(p[0],-p[1]));
  const mk=(c,d,bs,bt,y)=>{const g=new T.ExtrudeGeometry(s,{depth:d,bevelEnabled:bs>0,bevelSize:bs,bevelThickness:bt,bevelSegments:1,curveSegments:3,steps:1});g.rotateX(-Math.PI/2);b.g(g,c,0,y,0);};
  mk('water',.005,o.sea==null?5:o.sea,.004,-.105);mk('sea',.005,o.sea==null?2.2:o.sea*.5,.004,-.1);mk('sand',.05,1.7,.06,-.1);mk('grassD',.02,.35,.03,-.03);mk('grass',.02,0,0,.02);},
 ring(cx,cz,r,n,amp,seed,sx,sz){const out=[];for(let i=0;i<n;i++){const a=i/n*TAU;const k=1+amp*(Math.sin(a*3+seed)*.5+Math.sin(a*5+seed*2.3)*.3+Math.sin(a*7+seed*.7)*.2);out.push([cx+Math.cos(a)*r*k*(sx||1),cz+Math.sin(a)*r*k*(sz||1)]);}return out;},
 path(b,pts,w,c){c=c||'sand';for(let i=0;i<pts.length-1;i++){const [x0,z0]=pts[i],[x1,z1]=pts[i+1],dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);b.box(c,L,.05,w,(x0+x1)/2,.055,(z0+z1)/2,0,Math.atan2(-dz,dx),0);}
  pts.forEach(([x,z])=>b.cyl(c,w/2,w/2,.05,10,x,.055,z));},
 stones(b,a,c,n){for(let i=0;i<n;i++){const t=(i+.5)/n,x=a[0]+(c[0]-a[0])*t,z=a[1]+(c[1]-a[1])*t;b.cyl(i%2?'stone':'stoneW',.32,.34,.07,7,x+(rnd(i+x)-.5)*.25,.06,z,0,i,0);}},
 // 다리: a→c 아치, 폭 w
 bridge(b,a,c,w,h){const dx=c[0]-a[0],dz=c[1]-a[1],L=Math.hypot(dx,dz);h=h==null?Math.min(1.4,L*.09):h;
  b.at(a[0],0,a[1],Math.atan2(-dz,dx),()=>{const n=Math.max(6,Math.round(L/.42)),y=t=>.12+h*Math.sin(Math.PI*t);
   for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,x0=t0*L,x1=t1*L,ya=y(t0),yb=y(t1),ang=Math.atan2(yb-ya,x1-x0);b.box(i%2?'plank':'plankD',(x1-x0)*1.04,.1,w,(x0+x1)/2,(ya+yb)/2,0,0,0,ang);}
   [-1,1].forEach(s=>{b.box('logD',L,.12,.14,L/2,.02,s*w/2*.85);let prev=null;const m=Math.max(3,Math.round(L/1.6));for(let i=0;i<=m;i++){const t=i/m,x=t*L,yy=y(t);b.cylB('logD',.06,.07,.85,6,x,yy-.05,s*(w/2+.02));b.cyl('logL',.08,.08,.06,6,x,yy+.82,s*(w/2+.02));const top=[x,yy+.7,s*(w/2+.02)];if(prev)b.rod('rope',.025,prev,top,4);prev=top;}});
   [0,L].forEach(x=>[-1,1].forEach(s=>b.cylB('logD',.13,.15,1.0,7,x,-.2,s*(w/2+.1))));});},
 // 개인 낚시 데크: 원점에서 +z 로 L
 deck(b,x,z,ry,L,o){o=o||{};b.at(x,0,z,ry,()=>{const W=1.3,n=Math.round(L/.3);for(let i=0;i<n;i++)b.box(i%3?'plank':'plankD',W,.08,.27,0,.24,.15+i*.3);
  b.box('plankD',2.4,.09,1.9,0,.25,L+.8);for(let i=0;i<6;i++)b.box(i%2?'plank':'plankG',.38,.03,1.86,-1.0+i*.4,.3,L+.8);
  [[-W/2,0],[W/2,0],[-W/2,L*.5],[W/2,L*.5],[-1.15,L+1.7],[1.15,L+1.7],[-1.15,L],[1.15,L]].forEach(([px,pz])=>b.cylB('logD',.07,.08,1.15,6,px,-.7,pz));
  b.cylB('logD',.07,.08,1.1,6,-1.15,.3,L+1.7);b.at(-1.15,1.4,L+1.7,0,()=>NK_HOUSE.K.lantern(b,{gs:2.0}));
  NK_HOUSE.K.crate(b,.8,L+.4,.7,.3);b.cylB('metal',.17,.14,.32,8,.25,.3,L+.35);b.cylB('sea',.15,.15,.02,8,.25,.6,L+.35);NK_HOUSE.K.fish(b,'fishB',.22,.25,.66,L+.35,.6);
  b.rod('logD',.025,[.6,.32,L+1.2],[1.25,1.65,L+2.6],4);b.rod('fwhite',.006,[1.25,1.65,L+2.6],[1.3,-.05,L+3.0],3);b.cyl('red',.05,.05,.08,6,1.3,-.04,L+3.0);
  if(o.sign!==false){b.cylB('logD',.05,.06,.9,6,-.85,.3,L+.1);b.box('plank',.5,.34,.06,-.85,1.15,L+.1);}});},
 pond(b,x,z,rx,rz){b.g(new b.T.CylinderGeometry(1,1,.05,22),'sand',x,.045,z,0,0,0,rx+.55,1,rz+.55);b.g(new b.T.CylinderGeometry(1,1,.05,22),'waterD',x,.06,z,0,0,0,rx,1,rz);b.g(new b.T.CylinderGeometry(1,1,.05,22),'water',x,.07,z,0,0,0,rx-.25,1,rz-.25);
  for(let i=0;i<4;i++){const a=i*1.9+.4;b.cyl('leafL',.28,.28,.02,8,x+Math.cos(a)*rx*.55,.1,z+Math.sin(a)*rz*.55);}
  for(let i=0;i<5;i++){const a=i*.35+2.5;b.cone('leafD',.06,.9,4,x+Math.cos(a)*(rx+.2),.5,z+Math.sin(a)*(rz+.2));b.cyl('mushS',.05,.05,.22,5,x+Math.cos(a)*(rx+.2),.98,z+Math.sin(a)*(rz+.2));}},
 boat(b,x,y,z,ry,o){o=o||{};const T=b.T;b.at(x,y,z,ry,()=>{b.g(new T.SphereGeometry(1,14,6,0,TAU,Math.PI/2,Math.PI/2),o.c||'shutT',0,.42,0,0,0,0,1.45,.5,.62);
  b.g(new T.CylinderGeometry(1,1,.06,16),'white',0,.43,0,0,0,0,1.47,1,.64);b.g(new T.CylinderGeometry(1,1,.05,16),'plank',0,.38,0,0,0,0,1.32,1,.52);
  b.box('plankD',.3,.06,1.0,-.45,.5,0);b.box('plankD',.3,.06,1.0,.55,.5,0);
  [-1,1].forEach(s=>b.rod('logL',.03,[0,.55,s*.5],[.2,.15,s*1.2],4));
  if(o.lamp!==false){b.rod('logD',.03,[1.05,.4,0],[1.35,1.6,0],4);b.at(1.43,1.15,0,0,()=>NK_HOUSE.K.lantern(b,{gs:2.2}),.9);}});},
 // 선착장 (섬 쪽): 원점=물가, +z 로 L
 pier(b,x,z,ry,L){b.at(x,0,z,ry,()=>{const W=3.0,n=Math.round(L/.32);for(let i=0;i<n;i++)b.box(i%4?'plank':'plankD',W,.1,.29,0,.26,.16+i*.32);
  for(let k=0;k<=Math.round(L/2.4);k++){const zz=Math.min(L-.1,k*2.4+.1);[-1,1].forEach(s=>{b.cylB('logD',.11,.13,1.6,7,s*(W/2+.05),-.8,zz);b.cyl('logL',.12,.12,.06,7,s*(W/2+.05),.83,zz);});}
  [-1,1].forEach(s=>{b.cylB('logD',.07,.08,2.4,6,s*(W/2+.05),.3,L-.2);b.at(s*(W/2+.05),2.75,L-.2,0,()=>NK_HOUSE.K.lantern(b,{gs:2.6}));});
  b.cylB('logD',.07,.08,1.8,6,-W/2-.3,.0,1.2);b.box('plank',1.5,.6,.08,-W/2-.3,1.65,1.25);b.box('plankD',1.58,.08,.1,-W/2-.3,1.98,1.25);NK_HOUSE.K.fish(b,'fishO',.45,-W/2-.6,1.65,1.31,0);b.box('dark',.5,.06,.02,-W/2+.05,1.72,1.3);b.box('dark',.4,.06,.02,-W/2+.05,1.58,1.3);
  b.rod('rope',.03,[W/2+.05,.85,L-.2],[W/2+1.0,.5,L+.4],4);P.boat(b,W/2+1.6,-.18,L+.2,-Math.PI/2+.2);
  NK_HOUSE.K.crate(b,-.8,L-1.2,.8,.2);NK_HOUSE.K.barrel(b,-1.0,L-2.1);});},
 plaza(b,x,z,r){const K=NK_HOUSE.K;b.cyl('stone',r+.3,r+.3,.06,30,x,.05,z);b.cyl('stoneW',r,r,.07,30,x,.06,z);for(let i=0;i<14;i++){const a=i/14*TAU;b.cyl('sand',.5,.5,.075,6,x+Math.cos(a)*r*.62,.065,z+Math.sin(a)*r*.62,0,a,0);}
  b.cylB('stone',2.0,2.15,.55,16,x,.05,z);b.cylB('waterD',1.75,1.75,.03,16,x,.56,z);b.cylB('water',1.7,1.7,.03,16,x,.58,z);b.cylB('stoneW',.3,.42,1.4,8,x,.5,z);b.cylB('stone',.75,.6,.18,10,x,1.85,z);b.cylB('sea',.62,.62,.04,10,x,2.0,z);
  b.at(x,2.6,z,.6,()=>K.fish(b,'gold',1.1,0,0,0,0));
  for(let i=0;i<4;i++){const a=i/4*TAU+TAU/8;b.at(x+Math.cos(a)*(r-1.2),.1,z+Math.sin(a)*(r-1.2),Math.atan2(Math.cos(a),Math.sin(a))+Math.PI,()=>K.bench(b,'shutT'));
   const a2=a+TAU/8;b.at(x+Math.cos(a2)*(r-.4),.1,z+Math.sin(a2)*(r-.4),0,()=>K.lampPost(b,2.6,'black'));}
  // 게시판
  b.at(x+Math.cos(-2.2)*(r+1.4),0,z+Math.sin(-2.2)*(r+1.4),Math.atan2(Math.cos(-2.2),Math.sin(-2.2))+Math.PI,()=>{b.cylB('logD',.08,.09,2.1,6,-1,0,0);b.cylB('logD',.08,.09,2.1,6,1,0,0);b.box('plankD',2.3,1.3,.1,0,1.45,0);b.box('paper',.6,.7,.02,-.55,1.45,.06);b.box('pink',.5,.45,.02,.15,1.55,.06);b.box('mint',.45,.55,.02,.72,1.4,.06);b.cone('roofR',1.6,.5,4,0,2.35,0,0,Math.PI/4,0);});},
 tree(b,x,z,s,i){const c=['leaf','leafL','leafD','leaf'][i%4];if(i%5===4){b.cylB('logD',.1*s,.16*s,1.6*s,6,x,0,z);for(let k=0;k<3;k++)b.cone(k%2?'leafD':'leaf',(1.0-k*.25)*s,1.1*s,7,x,(1.8+k*.6)*s,z);}else NK_HOUSE.K.tree(b,x,z,s,c);},
 vacant(b,x,z,ry){b.at(x,0,z,ry||0,()=>{b.box('dirtR',8,.04,7,0,.06,0);for(let i=0;i<5;i++)b.box('dirtT',7.4,.03,.18,0,.09,-2.6+i*1.3);[[-4,-3.5],[4,-3.5],[4,3.5],[-4,3.5]].forEach(([px,pz],i,a)=>{b.cylB('logL',.07,.08,.8,5,px,0,pz);const q=a[(i+1)%4];b.rod('rope',.02,[px,.65,pz],[q[0],.65,q[1]],3);});
  b.cylB('logD',.06,.07,1.3,6,2.6,0,4.1);b.box('plank',1.2,.6,.07,2.6,1.25,4.1);b.box('butter',1.0,.12,.02,2.6,1.35,4.15);b.box('dark',.7,.06,.02,2.6,1.15,4.15);b.cylB('logD',.03,.03,1.5,4,-3.5,0,3.8);b.box('red',.5,.32,.02,-3.25,1.3,3.8);});},
 rocks(b,pts){pts.forEach((p,i)=>b.ico(i%3?'stone':'stoneW',.35+rnd(i)*.4,p[0],.02,p[1],1.3,.55,1.1,0,i));}
};

// ── 배치안 ──
// 집터 슬롯: {x,z,ry(앞=+z 회전), kind:'land'|'shore', side(텃밭 방향 ±1), ...}
const fwd=a=>Math.atan2(Math.cos(a),Math.sin(a));// 각도 a 방향(바깥)으로 앞(+z)을 향하게
const LAYOUTS={
 ring:{name:'안1 원형 호숫가 섬',build(){const L={lands:[P.ring(0,0,36,96,.03,1.3)],plaza:[0,0,6.5],slots:[],paths:[],bridges:[],piers:[],ponds:[],keep:[],rocks:[]};
  const D=Math.PI/180;
  for(let k=0;k<6;k++){const a=k*60*D,r=21;L.slots.push({kind:'land',x:Math.cos(a)*r,z:Math.sin(a)*r,ry:fwd(a),side:k%2?1:-1,a,stones:12.2,farmAt:[8.6,2.4],pondZ:8.8});}
  const cs={0:-1,1:1,2:-1,3:1,4:-1,5:1};for(let k=0;k<6;k++){const a=k*60*D,r=38.8;L.slots.push({kind:'shore',x:Math.cos(a)*r,z:Math.sin(a)*r,ry:fwd(a),side:cs[k],a});}
  const RR=a=>33+Math.sin(a*3)*.6;const rp=[];for(let i=0;i<=90;i++){const a=i/90*TAU;rp.push([Math.cos(a)*RR(a),Math.sin(a)*RR(a)]);}L.paths.push(rp);
  [90,210,330].forEach(dg=>{const a=dg*D,pts=[];[[6.4,0],[12,3],[20,-2.5],[27,1.5],[RR(a),0]].forEach(([r,o])=>pts.push([Math.cos(a+o*D)*r,Math.sin(a+o*D)*r]));L.paths.push(pts);});
  const pa=90*D;L.piers.push({x:0,z:36.2,ry:0,L:11});L.paths.push([[0,RR(pa)],[0,36.6]]);
  L.view={cam:[40,50,80],tgt:[1,0,5],fov:40,top:46};return L;}},
 river:{name:'안2 강줄기(만) 마을',build(){const pts=[],add=(x,z)=>pts.push([x,z]);
  // U 모양: 서쪽으로 열린 만(灣)
  for(let x=-62;x<=46;x+=4)add(x,-31+Math.sin(x*.21)*1.3);for(let a=-80;a<=80;a+=10)add(48+Math.cos(a*Math.PI/180)*20,Math.sin(a*Math.PI/180)*31);for(let x=46;x>=-62;x-=4)add(x,31+Math.sin(x*.17+1)*1.3);
  add(-64,26);add(-64,12);add(-60,8.2);for(let x=-56;x<=24;x+=4)add(x,7.5+Math.sin(x*.3)*.5);add(29,6);add(32,0);add(29,-6);for(let x=24;x>=-56;x-=4)add(x,-7.5+Math.sin(x*.27+2)*.5);add(-60,-8.2);add(-64,-12);add(-64,-26);
  const L={lands:[pts],plaza:[48,0,7.5],slots:[],paths:[],bridges:[],piers:[],ponds:[],keep:[],rocks:[],water:[]};
  const xs=[-50,-28,-6,16];xs.forEach((x,i)=>L.slots.push({kind:'land',x,z:-19,ry:0,side:-1,riverDeck:true}));
  const xs2=[-50,-28,-6,16];xs2.forEach((x,i)=>L.slots.push({kind:'shore',x,z:33.4,ry:0,side:-1}));
  L.slots.push({kind:'land',x:38,z:-19,ry:0,side:-1,riverDeck:false});L.slots.push({kind:'shore',x:38,z:33.4,ry:0,side:-1});
  L.paths.push([[-60,-10.4],[28,-10.4],[40,-6],[48,0]]);L.paths.push([[-60,10.4],[28,10.4],[40,6],[48,0]]);
  xs2.concat([38]).forEach(x=>L.paths.push([[x,10.4],[x,29.2]]));L.paths.push([[-60,-10.4],[-60,-24]]);
  L.bridges.push([[-36,-8.2],[-36,8.2]],[[8,-8.2],[8,8.2]]);
  L.piers.push({x:66,z:0,ry:Math.PI/2,L:10});L.paths.push([[55,0],[66.5,0]]);
  L.view={cam:[34,62,98],tgt:[-2,0,4],fov:42,top:66};return L;}},
 archi:{name:'안3 군도형 (작은 섬 + 다리)',build(){const L={lands:[P.ring(0,0,13,48,.05,2.2)],plaza:[0,0,6.8],slots:[],paths:[],bridges:[],piers:[],ponds:[],keep:[],rocks:[]};
  for(let k=0;k<8;k++){const a=(k+.5)/8*TAU,r=39,cx=Math.cos(a)*r,cz=Math.sin(a)*r,C=k%2===1,side=k%4<2?1:-1,ry=fwd(a);L.lands.push(P.ring(cx,cz,11.6,48,.05,k*1.7+.5));
   const tx=Math.cos(ry),tz=-Math.sin(ry),sh=C?0:-side*3.2,ro=C?14.0:-.8;
   L.slots.push({kind:C?'shore':'land',x:cx+Math.cos(a)*ro+tx*sh,z:cz+Math.sin(a)*ro+tz*sh,ry,side,a,isle:[cx,cz],stones:C?0:7.5});
   L.bridges.push([[Math.cos(a)*12.6,Math.sin(a)*12.6],[Math.cos(a)*28.0,Math.sin(a)*28.0]]);
   L.paths.push([[Math.cos(a)*6.8,Math.sin(a)*6.8],[Math.cos(a)*13.0,Math.sin(a)*13.0]]);
   const e=[Math.cos(a)*27.6,Math.sin(a)*27.6];L.paths.push([e,[cx-Math.cos(a)*5+tx*(C?0:1.6*side),cz-Math.sin(a)*5+tz*(C?0:1.6*side)]]);if(C)L.paths.push([[cx-Math.cos(a)*5,cz-Math.sin(a)*5],[cx+Math.cos(a)*7.8,cz+Math.sin(a)*7.8]]);}
  L.piers.push({x:0,z:12.8,ry:0,L:13});L.paths.push([[0,6.8],[0,13.2]]);
  L.view={cam:[34,64,96],tgt:[0,0,6],fov:42,top:56};return L;}}
};

// ── 집터 1칸 (로컬: 집 원점, 앞 +z) ──
function plotLocal(T,b,s,p,hs){// b=정적 빌더(이미 집터 변환 적용), hs=집/텃밭 Object3D 목록에 push
 const side=s.side||1,K=NK_HOUSE.K,info={};
 if(p.vacant){if(s.kind==='shore'){P.vacant(b,0,0,-6.2);b.cylB('logD',.12,.14,1.6,7,-1.2,-.9,-1.6);b.cylB('logD',.12,.14,1.6,7,1.2,-.9,-1.6);}else P.vacant(b,0,0,0);return {vacant:true,farm:null};}
 const style=p.style||(s.kind==='shore'?'C':'A'),stage=p.stage||3;
 const h=NK_HOUSE.build(T,{style,stage});const g=h.group;hs.push({o:g,x:0,z:0,ry:0,house:{style,stage}});
 let farm=p.farm===undefined?(s.kind==='shore'?'raft':'fence'):p.farm;const fsz=p.farmSize||9;
 if(s.kind==='shore'){// 물 위 집 → 땅 쪽(-z) 산책 데크, 옆에 뗏목 텃밭, 반대쪽 개인 낚시 데크
  for(let i=0;i<14;i++)b.box(i%3?'plank':'plankD',1.2,.08,.28,0,.24,-2.6-i*.3);[[-.6,-3],[.6,-3],[-.6,-5.6],[.6,-5.6]].forEach(([x,z])=>b.cylB('logD',.06,.07,1.0,6,x,-.7,z));
  if(farm){const F=NK_FARM.build(T,{style:farm,size:fsz,plots:p.plots||demoPlots(fsz,(s.x*7+s.z*3)|0)});hs.push({o:F.group,x:side*9.6,z:.8,ry:0,farm:F});info.farm=[side*9.6,.8,F];
   b.box('plank',3.4,.08,1.0,side*5.7,.2,-.3);b.box('plankD',3.4,.04,.08,side*5.7,.26,-.8);b.box('plankD',3.4,.04,.08,side*5.7,.26,.2);}
  P.deck(b,-side*7.4,-3.6,0,3.6);info.deck=[-side*7.4,3.0];
  b.at(-1.4,0,-6.6,0,()=>K.mailbox(b));}
 else{// 땅 위 집 → 옆 텃밭, 앞마당 연못(또는 강가) 개인 낚시 데크
  if(farm){const fa=s.farmAt||[9.3,.6];const F=NK_FARM.build(T,{style:farm,size:fsz,plots:p.plots||demoPlots(fsz,(s.x*7+s.z*3)|0)});hs.push({o:F.group,x:side*fa[0],z:fa[1],ry:0,farm:F});info.farm=[side*fa[0],fa[1],F];}
  P.stones(b,[0,4.6],[0,s.stones||10.5],Math.round(((s.stones||10.5)-4.6)/.75));
  if(s.riverDeck){P.deck(b,-side*4.2,10.6,0,3.0);info.deck=[-side*4.2,13.0];}
  else{const pz=s.pondZ||9.6;P.pond(b,-side*5.2,pz,3.0,2.1);P.deck(b,-side*5.2,pz-2.6,0,1.0,{sign:false});info.deck=[-side*5.2,pz-1.0];}
  b.at(1.5,0,6.0,0,()=>K.mailbox(b));NK_HOUSE.K.flowers(b,-2.4,5.6,4,.3,Math.abs(s.x*3+s.z|0));}
 return info;}
function demoPlots(n,seed){const out=[];for(let i=0;i<n;i++){const k=Math.abs(seed+i*7)%17;out.push(k<2?{state:'tilled'}:{crop:NK_FARM.ORDER[(Math.abs(seed)+i*5)%12],stage:Math.min(4,(k+i)%5+ (k%3===0?1:0)),watered:k%3===0});}return out;}

const NK_ISLAND={LAYOUTS,P,demoPlots,
 // o: {layout:'ring'|'river'|'archi', plots:[{style,stage,farm,farmSize,vacant}], mode:'merged'|'separate', lod:{cam:[x,y,z],near:45,bake}}
 build(T,o){o=o||{};const L=LAYOUTS[o.layout||'ring'].build(),mode=o.mode||'merged',A=NK_HOUSE.atlas(T);
  const S=NK_HOUSE.Builder(T),items=[],poi=[];const t0=performance.now();
  // 물(호수)
  S.cyl('waterD',260,260,.06,48,0,-.11,0);
  L.lands.forEach(pts=>P.land(S,pts));
  if(L.plaza){P.plaza(S,...L.plaza);poi.push({type:'plaza',x:L.plaza[0],z:L.plaza[1],r:L.plaza[2]});}
  L.paths.forEach(p=>P.path(S,p,1.7,'sand'));
  L.bridges.forEach(([a,c])=>{P.bridge(S,a,c,2.0);poi.push({type:'bridge',x:(a[0]+c[0])/2,z:(a[1]+c[1])/2});});
  L.piers.forEach(p=>{P.pier(S,p.x,p.z,p.ry,p.L);const ex=p.x+Math.sin(p.ry)*p.L,ez=p.z+Math.cos(p.ry)*p.L;poi.push({type:'pier',x:ex,z:ez,x0:p.x,z0:p.z});});
  const plots=o.plots||[];const slotInfo=[];
  L.slots.forEach((s,i)=>{const p=plots[i]||{vacant:true};const hs=[];let inf;
   S.at(s.x,0,s.z,s.ry,()=>{inf=plotLocal(T,S,s,p,hs);});
   const c=Math.cos(s.ry),sn=Math.sin(s.ry),W=(lx,lz)=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c];
   hs.forEach(h=>{const [wx,wz]=W(h.x,h.z);h.o.position.set(wx,0,wz);h.o.rotation.y=s.ry+(h.ry||0);h.slot=i;items.push(h);});
   const si={n:i+1,kind:s.kind,x:s.x,z:s.z,ry:s.ry,vacant:!!inf.vacant,style:p.style||(s.kind==='shore'?'C':'A'),stage:p.stage,farm:inf.farm?W(inf.farm[0],inf.farm[1]):null,farmStyle:inf.farm?inf.farm[2].info:null,deck:inf.deck?W(inf.deck[0],inf.deck[1]):null,front:W(0,s.kind==='shore'?-6.5:8)};slotInfo.push(si);poi.push(Object.assign({type:'plot'},si));});
  // 나무·덤불 (빈 땅에만)
  const keep=[];slotInfo.forEach(si=>{keep.push([si.x,si.z,si.vacant?6.5:7.2]);if(si.farm)keep.push([si.farm[0],si.farm[1],5.2]);if(si.deck)keep.push([si.deck[0],si.deck[1],4.6]);keep.push([si.front[0],si.front[1],2.6]);});if(L.plaza)keep.push([L.plaza[0],L.plaza[1],L.plaza[2]+3]);
  const segD=(px,pz,a,c)=>{const dx=c[0]-a[0],dz=c[1]-a[1],t=Math.max(0,Math.min(1,((px-a[0])*dx+(pz-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(px-a[0]-dx*t,pz-a[1]-dz*t);};
  const inPoly=(x,z,pts)=>{let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,zi]=pts[i],[xj,zj]=pts[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))ins=!ins;}return ins;};
  const edgeD=(x,z,pts)=>{let m=1e9;for(let i=0;i<pts.length;i++){m=Math.min(m,segD(x,z,pts[i],pts[(i+1)%pts.length]));}return m;};
  let nt=0;for(let gx=-80;gx<=80;gx+=3.6)for(let gz=-60;gz<=60;gz+=3.6){const k=gx*13.1+gz*7.7,x=gx+(rnd(k)-.5)*2.6,z=gz+(rnd(k+3)-.5)*2.6;
   const land=L.lands.find(pts=>inPoly(x,z,pts));if(!land)continue;const ed=edgeD(x,z,land);if(ed<1.6)continue;
   if(keep.some(([kx,kz,r])=>Math.hypot(x-kx,z-kz)<r))continue;if(L.paths.some(p=>p.some((q,i)=>i<p.length-1&&segD(x,z,q,p[i+1])<2.2)))continue;
   if(L.piers.some(p=>Math.hypot(x-p.x,z-p.z)<5))continue;if(L.bridges.some(([a,c])=>segD(x,z,a,c)<3))continue;
   const r=rnd(k+9);if(r<.42){P.tree(S,x,z,.9+rnd(k+5)*.55,nt++);}else if(r<.5)NK_HOUSE.K.bush(S,.45+rnd(k+1)*.3,x,z,r<.42?'leaf':'leafL',r<.45?4:0);else if(r<.6)NK_HOUSE.K.flowers(S,x,z,3,.35,Math.abs(k|0));else if(r<.64&&ed<5)S.ico('stone',.5,x,.05,z,1.3,.6,1.1);}
  L.lands.forEach((pts,li)=>{for(let i=0;i<pts.length;i+=5){const [x,z]=pts[i];if(keep.some(([kx,kz,r])=>Math.hypot(x-kx,z-kz)<r-2))continue;if(L.piers.some(p=>Math.hypot(x-p.x,z-p.z)<6))continue;if(L.bridges.some(([a,c])=>segD(x,z,a,c)<3.5))continue;if(rnd(i+li*31)<.5)S.ico(rnd(i)<.5?'stone':'stoneW',.4+rnd(i+2)*.45,x,.0,z,1.3,.55,1.1,0,i);}});
  const st=S.done();const tBuild=performance.now()-t0;
  // ── 조립 ──
  const root=new T.Group();root.name='NK_ISLAND';const statMesh=new T.Mesh(st.geo,A.mat);statMesh.receiveShadow=true;statMesh.castShadow=true;statMesh.name='island-static';root.add(statMesh);
  const sg=glowPoints(T,st.glows);if(sg)root.add(sg);
  const lod=o.lod||null;let impostor=null,nImp=0,nNear=0;
  if(lod&&lod.bake){impostor=NK_HOUSE.impostorField(T,lod.bake,items.length);}
  const near=[],far=[];items.forEach(h=>{if(h.house&&impostor){const d=Math.hypot(h.o.position.x-lod.cam[0],h.o.position.z-lod.cam[2]);if(d>lod.near){far.push(h);return;}}near.push(h);});
  far.forEach(h=>{impostor.set(nImp++,h.house.style+h.house.stage,h.o.position.x,h.o.position.z,h.o.rotation.y);});
  nNear=near.filter(h=>h.house).length;
  const t1=performance.now();
  if(mode==='separate'){near.forEach(h=>root.add(h.o));}
  else{// 재질별로 합치기: 아틀라스 1 + 유리 1 + 불빛 1
   const tmp=new T.Group();near.forEach(h=>tmp.add(h.o));tmp.updateMatrixWorld(true);const buckets=new Map();
   tmp.traverse(m=>{if(!(m.isMesh||m.isPoints)||m.isInstancedMesh)return;const k=m.material.uuid;if(!buckets.has(k))buckets.set(k,{mat:m.material,pts:m.isPoints,geos:[]});const g=m.geometry.clone();g.applyMatrix4(m.matrixWorld);buckets.get(k).geos.push(g);});
   buckets.forEach(bk=>{const g=T.BufferGeometryUtils.mergeBufferGeometries(bk.geos,false);if(!g){console.log('merge fail');return;}const m=bk.pts?new T.Points(g,bk.mat):new T.Mesh(g,bk.mat);if(bk.pts){m.frustumCulled=false;m.renderOrder=5;}else{m.castShadow=bk.mat===A.mat;m.receiveShadow=true;}m.name=bk.pts?'plots-glow':'plots';root.add(m);});}
  const tMerge=performance.now()-t1;
  if(impostor&&nImp){root.add(impostor.mesh);}
  let tris=st.geo.attributes.position.count/3;root.traverse(m=>{if(m.isMesh&&!m.isInstancedMesh&&m!==statMesh)tris+=m.geometry.attributes.position.count/3;});
  return {group:root,layout:L,slots:slotInfo,poi,impostor,info:{layout:o.layout||'ring',name:LAYOUTS[o.layout||'ring'].name,slots:L.slots.length,houses:items.filter(h=>h.house).length,near:nNear,impostors:nImp,mode,tris:Math.round(tris),staticTris:st.geo.attributes.position.count/3,staticParts:st.parts,msBuild:+tBuild.toFixed(1),msMerge:+tMerge.toFixed(1)}};},
 // ── 공용 호숫가 데크 + 연결물 ──
 publicDeck(T,o){o=o||{};const A=NK_HOUSE.atlas(T),K=NK_HOUSE.K,b=NK_HOUSE.Builder(T);
  b.cyl('waterD',200,200,.06,40,0,-.11,0);
  const shore=[];for(let x=-60;x<=60;x+=4)shore.push([x,-6+Math.sin(x*.23)*1.2]);shore.push([60,-40],[-60,-40]);P.land(b,shore,{sea:3});
  // 메인 데크
  const D0=-34,D1=26;for(let x=D0;x<D1;x+=.34)b.box(((x*3)|0)%4?'plank':'plankD',.32,.12,7.2,x+.17,.28,-1.2);
  for(let x=D0;x<=D1;x+=3){[-4.8,2.4].forEach(z=>b.cylB('logD',.13,.15,1.4,7,x,-.9,z));}
  for(let x=D0;x<D1;x+=1.5){if(x>-30&&x<-27||x>-14&&x<-11||x>4&&x<7)continue;b.cylB('logD',.06,.07,.9,6,x,.34,2.45);}b.box('logL',D1-D0,.1,.14,(D0+D1)/2,1.22,2.45);
  // 낚시 돌출부 3곳
  [-28.5,-12.5,5.5].forEach((x,i)=>{for(let z=2.4;z<9;z+=.32)b.box(((z*3)|0)%3?'plank':'plankD',3.6,.1,.3,x,.27,z+.16);[-1.75,1.75].forEach(s=>{for(let z=3;z<=9;z+=3)b.cylB('logD',.11,.13,1.4,7,x+s,-.9,z);b.box('logL',.12,.1,6.6,x+s,1.0,5.7);for(let z=3;z<=9;z+=1.5)b.cylB('logD',.06,.07,.7,6,x+s,.34,z);});
   b.at(x+1.75,0,9.2,0,()=>{b.cylB('logD',.07,.08,2.4,6,0,.3,0);b.at(0,2.75,0,0,()=>K.lantern(b,{gs:2.4}));});K.barrel(b,x-1.2,8.2);b.at(x,.33,3.4,0,()=>K.bench(b,i%2?'shutR':'shutT'));});
  for(let x=-31;x<24;x+=9){b.at(x,.33,-4.2,0,()=>K.lampPost(b,2.8,'black'));}
  [-22,-4,14].forEach((x,i)=>{b.at(x,.33,-3.3,0,()=>K.bench(b,['shutT','shutR','shutT'][i]));K.crate(b,x+2.3,-3.6,.9,.3);});
  b.at(-18,.33,-3.6,0,()=>{[-1,1].forEach(s=>b.rod('logD',.05,[s*.7,0,-.3],[s*.7,1.5,0],5));b.cyl('logD',.04,.04,1.6,5,0,1.45,0,0,0,Math.PI/2);for(let i=0;i<5;i++)K.fish(b,['fishO','fishB','fishY'][i%3],.28,-.5+i*.25,1.1,0,0);});
  // 깃발 줄
  for(let k=0;k<3;k++){const x0=-30+k*18;for(let i=0;i<9;i++){const t=i/8,x=x0+t*14,y=3.0-Math.sin(t*Math.PI)*.5;b.cone(['red','yellow','fblue','fpink','mint'][i%5],.2,.4,3,x,y-.25,-4.25,Math.PI,0,0);}b.rod('rope',.02,[x0,3.05,-4.25],[x0+7,2.55,-4.25],3);b.rod('rope',.02,[x0+7,2.55,-4.25],[x0+14,3.05,-4.25],3);}
  // 뭍: 나무·상점 느낌 가판대
  for(let i=0;i<26;i++){const x=-56+i*4.4+(rnd(i)-.5)*2,z=-12-rnd(i+4)*20;P.tree(b,x,z,1.0+rnd(i+2)*.6,i);}
  [[-24,-9],[0,-9.5]].forEach(([x,z],i)=>{b.boxB('plankD',3.2,1.0,1.4,x,0,z);b.box(i?'roofT':'roofR',3.8,.12,2.0,x,2.5,z+.2,.15,0,0);[-1.5,1.5].forEach(s=>b.cylB('logD',.07,.08,2.5,6,x+s,0,z+.6));K.fish(b,'fishO',.5,x-.6,1.15,z+.2,0);K.fish(b,'fishB',.5,x+.5,1.15,z+.2,0);K.crate(b,x+2.2,z+.6,.8,.4);});
  // 멀리 보이는 하우징 섬 실루엣 (저폴리)
  const fi=[74,-27];P.land(b,P.ring(fi[0],-fi[1],15,40,.05,3.1),{sea:3});for(let i=0;i<12;i++){const a=i/12*TAU;P.tree(b,fi[0]+Math.cos(a)*11,-fi[1]+Math.sin(a)*10,1.5,i);}b.cylB('logD',.2,.2,4,6,fi[0]-13,-.5,-fi[1]-4);b.at(fi[0]-13,4,-fi[1]-4,0,()=>NK_HOUSE.K.lantern(b,{gs:5}),2);
  [[-5,-2,'roofR'],[4,-3,'roofT'],[0,4,'roofR'],[6,4,'roofT'],[-6,5,'roofG']].forEach(([dx,dz,c])=>{b.boxB(c==='roofT'?'skyw':'cream',3.0,2.4,2.8,fi[0]+dx,0,-fi[1]+dz);b.cone(c,2.6,1.8,4,fi[0]+dx,3.3,-fi[1]+dz,0,Math.PI/4,0);b.box('glass',.6,.6,.05,fi[0]+dx,1.3,-fi[1]+dz+1.42);});
  const base=b.done();const baseMesh=new T.Mesh(base.geo,A.mat);baseMesh.receiveShadow=true;baseMesh.castShadow=true;const grp=new T.Group();grp.add(baseMesh);const bg=glowPoints(T,base.glows);if(bg)grp.add(bg);
  // 연결물 (데크 오른쪽 끝 26~34)
  const c=NK_HOUSE.Builder(T),kind=o.connector||'sign';
  for(let x=D1;x<D1+7;x+=.34)c.box(((x*3)|0)%4?'plank':'plankD',.32,.12,7.2,x+.17,.28,-1.2);[-4.8,2.4].forEach(z=>[D1+3,D1+6.8].forEach(x=>c.cylB('logD',.13,.15,1.4,7,x,-.9,z)));
  const cx=D1+3.6,cz=-.6;let hot=[cx,2.4,cz];
  if(kind==='sign'){// 이정표 + 우편함 + 꽃 화분
   c.at(cx,.34,cz,0,()=>{c.cylB('logD',.11,.13,3.2,7,0,0,0);c.cone('roofR',.32,.3,6,0,3.35,0);
    [['mint',2.55,.1],['butter',2.0,-.25],['peach',1.45,.35]].forEach(([col,y,ry],i)=>c.at(0,y+.3,0,ry,()=>{c.box(col,2.2,.5,.12,1.05,0,.13);c.cone(col,.36,.36,3,2.32,0,.13,0,0,-Math.PI/2);c.box('dark',1.1,.07,.02,.95,.06,.2);c.box('dark',.8,.07,.02,.8,-.1,.2);K.fish(c,['fishO','fishB','fishY'][i],.3,.25,0,.21,0);}));
    c.at(-.9,0,.9,.3,()=>K.mailbox(c));c.cylB('brick',.38,.3,.5,10,.8,0,1.3);K.bush(c,.38,.8,1.3,'leaf',5);c.at(-1.1,0,-1.5,0,()=>K.lampPost(c,2.6,'black'));});hot=[cx+.8,3.2,cz];}
  if(kind==='ferry'){// 나룻배 선착장
   for(let z=2.4;z<8.5;z+=.32)c.box('plank',2.4,.1,.3,cx+1.2,.27,z+.16);[2.6,5.6,8.4].forEach(z=>[-1,1].forEach(s=>{c.cylB('logD',.11,.13,1.6,7,cx+1.2+s*1.25,-.9,z);c.cyl('logL',.12,.12,.06,7,cx+1.2+s*1.25,.73,z);}));
   P.boat(c,cx+3.6,-.18,6.4,Math.PI/2-.1);c.rod('rope',.03,[cx+2.45,.75,6.4],[cx+3.2,.45,5.6],4);
   c.at(cx-.8,.34,1.6,0,()=>{c.cylB('logD',.09,.1,2.7,6,0,0,0);c.box('logD',1.2,.1,.1,.5,2.6,0);c.rod('rope',.015,[1,2.6,0],[1,2.2,0],3);c.cylB('gold',.2,.13,.32,8,1,1.9,0);c.box('plank',1.1,.65,.08,-.0,1.6,.1);c.box('dark',.7,.06,.02,0,1.68,.15);c.box('dark',.5,.06,.02,0,1.52,.15);});
   c.at(cx+.1,.34,8.6,0,()=>{c.cylB('logD',.07,.08,2.2,6,0,0,0);c.at(0,2.55,0,0,()=>K.lantern(c,{gs:2.6}));});hot=[cx+3.6,1.6,6.4];}
  if(kind==='gate'){// 등불 아치 게이트 + 물 위 디딤돌 등불
   c.at(cx+.4,.34,cz,Math.PI/2,()=>{[-1.6,1.6].forEach(s=>{c.cylB('logD',.18,.22,3.4,8,s,0,0);c.cylB('stone',.32,.36,.3,8,s,0,0);});c.box('roofR',4.4,.28,.5,0,3.4,0);c.box('logD',3.9,.18,.3,0,2.8,0);c.box('plank',1.6,.5,.08,0,3.05,.2);
    [-1.1,0,1.1].forEach(x=>{c.rod('rope',.015,[x,2.7,0],[x,2.3,0],3);c.at(x,1.98,0,0,()=>K.lantern(c,{gs:2.4}),1.0);});c.tor('fpink',.5,.08,0,3.42,.28,0,0,0,5,12,Math.PI);});
   for(let i=0;i<6;i++){const x=cx+3.8+i*2.2,z=cz+Math.sin(i*.9)*1.2;c.cyl(i%2?'stone':'stoneW',.55,.6,.25,8,x,-.02,z);if(i%2===0){c.cylB('leafL',.35,.35,.03,8,x+.6,-.05,z+1.0);c.at(x+.6,.0,z+1.0,0,()=>{c.cylB('lamp',.12,.15,.2,8,0,0,0);c.glow(0,.15,0,2.0,'#ffc870');});}}hot=[cx+.4,4.2,cz];}
  const cr=c.done();const conn=new T.Group();const cm=new T.Mesh(cr.geo,A.mat);cm.castShadow=cm.receiveShadow=true;cm.name='connector';conn.add(cm);const cg=glowPoints(T,cr.glows);if(cg)conn.add(cg);
  return {base:grp,conn,hot,spot:[cx,0,cz],info:{connector:kind,baseTris:base.geo.attributes.position.count/3,connTris:cr.geo.attributes.position.count/3,connParts:cr.parts,connGlows:cr.glows.length}};}
};
(typeof window!=='undefined'?window:globalThis).NK_ISLAND=NK_ISLAND;
})();
