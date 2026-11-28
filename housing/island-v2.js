// NK_ISLAND50 — 피쉬코지 하우징 섬 시안 v2 (집+텃밭 50세트). house-v1.js + farm-v1.js + island-v1.js(부품 P) 위에서 동작, Three.js r147
// 집터 1칸(로컬): 집 원점, 앞 = +z(길 쪽). 앞마당 z 0~+7.5(인도 경계), 뒤뜰 텃밭 z≈-10, 뒤 경계 -13.5
(function(){
const TAU=Math.PI*2,rnd=s=>{const x=Math.sin(s*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const IP=()=>NK_ISLAND.P,K=()=>NK_HOUSE.K;
const LOT={w:12,front:6.5,back:12.5,houseZ:-1.4,farmZ:-9.0};const OFF=12.3;
// ── 그리는 부품 ──
const Q={
 // 띠(길·인도): pts 폴리라인, closed면 고리
 band(b,pts,w,c,y,closed){const n=pts.length,m=closed?n:n-1;for(let i=0;i<m;i++){const [x0,z0]=pts[i],[x1,z1]=pts[(i+1)%n],dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);b.box(c,L+.02,.05,w,(x0+x1)/2,y,(z0+z1)/2,0,Math.atan2(-dz,dx),0);}
  for(let i=0;i<n;i++){if(!closed&&(i===0||i===n-1))continue;b.cyl(c,w/2,w/2,.05,14,pts[i][0],y,pts[i][1]);}},
 dashes(b,pts,closed,c){const n=pts.length,m=closed?n:n-1;let acc=0;for(let i=0;i<m;i++){const [x0,z0]=pts[i],[x1,z1]=pts[(i+1)%n],dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);for(let t=acc;t<L;t+=3.2){const k=t/L;b.box(c||'stoneW',1.4,.02,.18,x0+dx*k,.135,z0+dz*k,0,Math.atan2(-dz,dx),0);}acc=(acc+3.2-(L%3.2))%3.2;}},
 // 길 = 인도(넓은 밝은 띠) + 차도(가운데) + 점선
 road(b,pts,closed,o){o=o||{};const w=o.w||5.6;if(o.walk!==false)Q.band(b,pts,11.6,'sand',.06,closed);Q.band(b,pts,o.walk===false?w+1.2:8.8,o.walk===false?'stoneW':'grassD',.075,closed);Q.band(b,pts,w+.5,'stoneW',.09,closed);Q.band(b,pts,w,'stoneD',.1,closed);if(o.dash!==false)Q.dashes(b,pts,closed,'butter');},
 picket(b,x0,x1,z,h){h=h||.75;const L=x1-x0;for(let x=x0;x<=x1+1e-3;x+=.42)b.box('white',.12,h,.06,x,h/2,z);b.box('white',L,.07,.05,(x0+x1)/2,h*.72,z+.04);b.box('white',L,.07,.05,(x0+x1)/2,h*.32,z+.04);},
 hedge(b,x,z0,z1,seed){for(let z=z0;z<=z1;z+=1.25){const r=.55+rnd(seed+z)*.2;b.ico(rnd(seed+z*3)<.5?'leafD':'leaf',r,x,r*.75,z,1.0,.8,1.15,1);}},
 // 집 번호 우편함 (빨간 깃발: mine이면 올림)
 mailbox(b,x,z,n,mine){b.at(x,0,z,0,()=>{b.cylB('logD',.06,.06,1.05,5,0,0,0);b.box(mine?'red':'roofT',.36,.3,.56,0,1.18,0);b.cyl(mine?'red':'roofT',.18,.18,.56,8,0,1.32,0,Math.PI/2,0,0);
  b.box('white',.02,.2,.34,.19,1.16,0);if(mine){b.rod('yellow',.02,[.2,1.2,-.2],[.2,1.75,-.2],3);b.box('yellow',.02,.22,.3,.2,1.65,-.05);}else b.box('red',.02,.24,.08,.2,1.25,-.22);});},
 lot(b,s,p,hs,far){// far=true → 먼 집터: 꽃·울타리 살·벤치·우편함·데크 소품 생략(가벼운 버전)
  const k=K(),P=IP(),side=s.n%2?1:-1;
  b.box('grass',LOT.w-.3,.03,6.2,0,.03,3.4);
  if(!far){for(let z=3.1;z<6.3;z+=.7)b.cyl(((z*10)|0)%2?'stoneW':'plankG',.42,.44,.06,8,0,.06,z);
   Q.picket(b,-LOT.w/2+.3,-1.1,6.1);Q.picket(b,1.1,LOT.w/2-.3,6.1);Q.mailbox(b,1.7,6.45,s.n,p.mine);
   k.flowers(b,-2.6,2.2,6,.3,s.n);k.flowers(b,2.6,2.2,6,.3,s.n+3);k.bush(b,.45,side*4.4,4.9,'leafD',4);}
  else{b.box('stoneW',.9,.05,3.2,0,.06,4.7);[-1,1].forEach(sd=>b.box('white',LOT.w/2-1.4,.55,.08,sd*(LOT.w/4+.4),.3,6.1));}
  if(!p.noTree)k.tree(b,side*-4.2,4.0,1.0+rnd(s.n)*.2,['leaf','leafL','leaf'][s.n%3]);
  if(s.back!=='park')k.tree(b,side*4.3,-11.0,.85,'leafD');
  if(!far)Q.hedge(b,LOT.w/2-.1,s.back==='park'?-7:-12,-3.5,s.n*7.1);else{const z0=s.back==='park'?-7:-12;for(let z=z0;z<=-3.5;z+=2.6)b.ico(((z*3)|0)%2?'leaf':'leafD',.75,LOT.w/2-.1,.55,z,1,.8,1.5,0);}
  b.box('moss',LOT.w-.6,.025,6.6,0,.025,-8.9);
  if(!far)b.at(side*-5.0,0,-6.6,side>0?.4:-.4,()=>k.bench(b,s.n%3?'shutT':'shutR'));
  const style=p.style||'A',stage=p.stage||3,roof=p.roof||'R';if(!p.vacant){const g=houseVar(b.T,style,stage,roof);hs.push({o:g,x:0,z:LOT.houseZ,ry:0,house:{style,stage,roof}});}
  else{P.vacant(b,0,0,-2.0);}
  if(p.farm!==false&&!p.vacant){const plots=p.plots||NK_ISLAND.demoPlots(p.farmSize||9,s.n*13+5);hs.push({farmDef:{style:'fence',size:p.farmSize||9,plots},x:0,z:LOT.farmZ,ry:0});}
  if(s.back==='lake'&&!p.vacant){const L=s.deckL||3.4;if(!far)P.deck(b,side*-4.5,-11.6,Math.PI,L,{sign:false});else{b.box('plank',1.3,.08,L,side*-4.5,.24,-11.6-L/2);b.box('plankD',2.4,.09,1.9,side*-4.5,.25,-11.6-L-.8);}}
 },
 // 가벼운 텃밭 (먼 집터용): 흙판 + 고랑 + 작물 덩어리 + 울타리 몇 개
 farmLite(b,plots,size){const n=Math.round(Math.sqrt(size)),pit=1.14,half=n*pit/2+.45;b.box('dirtR',half*2,.06,half*2,0,.05,0);
  const CC={lemon:'lemonL',daepa:'leafL',garlic:'garlic',potato:'leaf',tomato:'red',dill:'dill',chili:'red',radish:'leafL',ginger:'leaf',onion:'onionP',basil:'basil',minari:'minari',wasabi:'wasabiL',mushroom:'mushS'};
  for(let i=0;i<n*n;i++){const c=i%n,r=(i/n)|0,x=(c-(n-1)/2)*pit,z=(r-(n-1)/2)*pit,q=plots[i]||{};b.box('dirtT',.9,.05,.9,x,.09,z);if(q.crop&&q.stage>0){const s=.18+q.stage*.07;b.ico(q.stage>=4?(CC[q.crop]||'leaf'):(q.stage>=2?'leaf':'leafL'),s,x,.1+s*.7,z,1,.9,1,0);}}
  [[-half,-half],[half,-half],[half,half],[-half,half]].forEach(([x,z],i,a)=>{b.cylB('logL',.07,.08,.8,4,x,0,z);const q=a[(i+1)%4];b.box('logL',Math.hypot(q[0]-x,q[1]-z)||.1,.07,.06,(x+q[0])/2,.55,(z+q[1])/2,0,Math.atan2(-(q[1]-z),q[0]-x),0);});},
 // 공용 요리 정자 (합성판 작업대)
 pavilion(b,x,z,ry){const k=K();b.at(x,0,z,ry||0,()=>{b.cyl('stoneW',4.2,4.4,.2,6,0,.1,0);for(let i=0;i<6;i++){const a=i/6*TAU;b.cylB('logD',.13,.15,2.6,6,Math.cos(a)*3.4,.2,Math.sin(a)*3.4);}
  b.cone('roofR',5.0,1.9,6,0,3.75,0);b.cone('roofRD',.5,.6,6,0,4.9,0);b.cyl('logD',4.3,4.3,.18,6,0,2.82,0);
  b.boxB('plank',2.6,.9,1.5,0,.2,0);for(let i=0;i<3;i++)for(let j=0;j<3;j++)b.box(((i+j)%2)?'paper':'stoneW',.6,.04,.32,-.75+i*.75,1.13,-.45+j*.45);
  b.cylB('metal',.25,.2,.4,8,1.6,.2,.9);k.crate(b,-1.7,.9,.8,.2);k.barrel(b,1.8,-1.2);b.at(0,2.4,3.4,0,()=>k.lantern(b,{gs:2.4}),1);
  b.at(0,0,4.6,0,()=>{b.cylB('logD',.06,.07,1.4,6,0,0,0);b.box('plank',1.5,.55,.07,0,1.45,0);b.box('dark',1.0,.07,.02,0,1.5,.05);});});},
 // 섬 안내판 (집 번호 지도)
 mapBoard(b,x,z,ry){b.at(x,0,z,ry||0,()=>{[-1.4,1.4].forEach(s=>b.cylB('logD',.1,.12,2.6,6,s,0,0));b.box('plankD',3.4,2.0,.14,0,1.8,0);b.box('skyw',3.0,1.6,.04,0,1.8,.09);b.box('grass',2.2,1.1,.03,0,1.8,.11);
  for(let i=0;i<10;i++)b.box(i===3?'red':'roofR',.16,.16,.03,-.9+(i%5)*.45,1.55+((i/5)|0)*.5,.13);b.box('stoneW',2.0,.12,.03,0,1.8,.12);b.cone('roofG',2.4,.6,4,0,3.1,0,0,Math.PI/4,0);});},
 // 내 집 표시 핀 (떠 있는 금색 집 아이콘)
 pin(b,x,z,h){b.at(x,h||8.5,z,0,()=>{b.cone('gold',.55,1.05,14,0,0,0,Math.PI,0,0);b.sph('gold',.64,0,.78,0,1,1,1,14,10);b.sph('white',.3,0,.82,0,1.12,1.12,1.12,12,8);b.sph('red',.2,0,.82,0,1.35,1.35,1.35,10,6);b.glow(0,.6,0,6,'#ffd86a');});},
 lamp(b,x,z){b.at(x,0,z,0,()=>K().lampPost(b,3.0,'black'));},
 streetTree(b,x,z,i,c){b.cyl('dirt',.7,.7,.07,8,x,.12,z);if(!c){K().tree(b,x,z,1.25,['leaf','leafL','leaf'][i%3]);return;}const s=1.25;b.cylB('logD',.12*s,.18*s,1.4*s,6,x,0,z);b.ico(c[0],.95*s,x,2.05*s,z,1,.9,1,1);b.ico(c[1],.65*s,x+.55*s,1.75*s,z+.2*s,1,.9,1,1);b.ico(c[0],.55*s,x-.45*s,2.45*s,z+.25*s,1,.9,1,1);},
};

// 지붕 색 바꾸기 (A 통나무집 그대로, 지붕 색만: 꾸미기 요소)
const ROOFS={R:['roofR','roofRD'],T:['roofT','roofTD'],G:['roofG','leafD'],O:['roofO','roofRD'],P:['roofP','dark']};const VC={};
function houseVar(T,style,stage,roof){const g=NK_HOUSE.build(T,{style,stage}).group;if(!roof||roof==='R')return g;const A=NK_HOUSE.atlas(T),[u0,v0]=A.uv('roofR'),[u1,v1]=A.uv('roofRD'),[a0,b0]=A.uv(ROOFS[roof][0]),[a1,b1]=A.uv(ROOFS[roof][1]);
 g.traverse(m=>{if(!m.isMesh||m.material!==A.mat)return;const key=m.geometry.uuid+roof;if(!VC[key]){const G=m.geometry.clone(),uv=G.attributes.uv;for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);if(Math.abs(u-u0)<1e-5&&Math.abs(v-v0)<1e-5)uv.setXY(i,a0,b0);else if(Math.abs(u-u1)<1e-5&&Math.abs(v-v1)<1e-5)uv.setXY(i,a1,b1);}VC[key]=G;}m.geometry=VC[key];});return g;}
// ── 배치안 ──
const ryFace=(dx,dz)=>Math.atan2(dx,dz);// 앞(+z)을 (dx,dz) 쪽으로
function rr(cx,cz,r,n,amp,seed){const o=[];for(let i=0;i<n;i++){const a=i/n*TAU,k=1+amp*(Math.sin(a*3+seed)*.5+Math.sin(a*5+seed*2.3)*.3+Math.sin(a*7+seed*.7)*.2);o.push([cx+Math.cos(a)*r*k,cz+Math.sin(a)*r*k]);}return o;}
function roundRect(x0,z0,x1,z1,r,step,amp){const o=[],C=[[x1-r,z1-r,0],[x0+r,z1-r,1],[x0+r,z0+r,2],[x1-r,z0+r,3]];
 // 시계 반대: 오른쪽 아래 코너부터
 const seg=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.round(L/step));for(let i=0;i<n;i++){const t=i/n;o.push([ax+(bx-ax)*t,az+(bz-az)*t]);}};
 const arc=(cx,cz,a0)=>{for(let i=0;i<8;i++){const a=a0+i/8*Math.PI/2;o.push([cx+Math.cos(a)*r,cz+Math.sin(a)*r]);}};
 seg(x1,z0+r,x1,z1-r);arc(x1-r,z1-r,0);seg(x1-r,z1,x0+r,z1);arc(x0+r,z1-r,Math.PI/2);seg(x0,z1-r,x0,z0+r);arc(x0+r,z0+r,Math.PI);seg(x0+r,z0,x1-r,z0);arc(x1-r,z0+r,Math.PI*1.5);
 return o.map(([x,z],i)=>{const w=amp*(Math.sin(i*.7)*.6+Math.sin(i*1.9+1)*.4);const cx=(x0+x1)/2,cz=(z0+z1)/2,d=Math.hypot(x-cx,z-cz)||1;return [x+(x-cx)/d*w,z+(z-cz)/d*w];});}

const LAYOUTS={
 // 안1 미국 주택가: 길 2개(메이플길·파인길) 양쪽으로 집이 쭉. 가운데 가로길, 서쪽 광장+선착장, 동쪽 공원
 street:{name:'안1 미국 주택가 (메이플길·파인길)',build(){const L={lands:[roundRect(-117,-55,106,55,15,4,.8)],roads:[],walks:[],slots:[],plaza:[-100,0,11],piers:[{x:-111,z:0,ry:-Math.PI/2,L:12}],fac:[],streetTrees:[],lamps:[]};
  const XS=[];for(let i=0;i<13;i++)XS.push(-72+i*12);const ZA=-26,ZB=26;
  L.roads.push({pts:[[-85,ZA],[85,ZA]]},{pts:[[-85,ZB],[85,ZB]]},{pts:[[-85,ZA],[-85,ZB]]},{pts:[[85,ZA],[85,ZB]]},{pts:[[0,ZA],[0,ZB]]},{pts:[[-89,0],[-85,0]],dash:false,w:3.6,walk:false});
  const add=(x,z,ry,back,street,n)=>L.slots.push({x,z,ry,back,street,n});
  // 메이플길(북쪽 길 ZA): 북쪽 줄 홀수 1~25(13), 남쪽 줄 짝수 2~24(12)
  let o=1,e=2;XS.forEach(x=>{add(x,ZA-OFF,0,'lake','메이플길',o);o+=2;});XS.filter(x=>x!==0).forEach(x=>{add(x,ZA+OFF,Math.PI,'yard','메이플길',e);e+=2;});
  // 파인길(남쪽 길 ZB): 남쪽 줄 짝수 26~50(13), 북쪽 줄 홀수 27~49(12)
  e=26;o=27;XS.forEach(x=>{add(x,ZB+OFF,Math.PI,'lake','파인길',e);e+=2;});XS.filter(x=>x!==0).forEach(x=>{add(x,ZB-OFF,0,'yard','파인길',o);o+=2;});
  L.slots.sort((a,b)=>a.n-b.n);
  // 가로수·가로등: 집 경계마다(인도 바깥쪽)
  [ZA,ZB].forEach((zz,ri)=>[-1,1].forEach(sd=>{for(let i=0;i<=13;i++){const x=-78+i*12;const z=zz+sd*3.6;(i%2?L.lamps:L.streetTrees).push([x,z]);}}));
  L.fac.push({type:'pavilion',x:95,z:0,ry:-Math.PI/2},{type:'mapBoard',x:-93,z:-8,ry:Math.PI/2+.5});
  L.view={cam:[-20,108,158],tgt:[-6,0,6],fov:42,top:{cx:-5.5,cz:0,half:61}};return L;}},
 // 안2 호숫가 고리길: 둥근 섬을 도는 고리 길. 바깥 31채는 뒤뜰이 호수(개인 데크), 안쪽 19채는 가운데 숲 공원
 ring:{name:'안2 호숫가 고리길 (추천)',build(){const R=56,L={lands:[rr(0,0,83.8,128,.012,1.1)],roads:[],walks:[],slots:[],plaza:[0,0,10],piers:[{x:0,z:82.4,ry:0,L:12}],fac:[],streetTrees:[],lamps:[]};
  const rp=[];for(let i=0;i<120;i++){const a=i/120*TAU;rp.push([Math.cos(a)*R,Math.sin(a)*R]);}L.roads.push({pts:rp,closed:true});
  L.roads.push({pts:[[0,10.5],[0,R]],dash:false,w:3.6,walk:false});L.walks.push([[0,R+3],[0,82.8]]);
  const D=Math.PI/180,cand=[];
  for(let k=0;k<32;k++){const a=(90+k*360/32)*D;if(k===0)continue;cand.push({x:Math.cos(a)*(R+OFF),z:Math.sin(a)*(R+OFF),ry:ryFace(-Math.cos(a),-Math.sin(a)),back:'lake',a:a,ring:'out'});}
  const GAP=[0,7,15];for(let k=0;k<22;k++){const a=(90+k*360/22)*D;if(GAP.includes(k)){if(k)L.walks.push([[Math.cos(a)*(R-4.5),Math.sin(a)*(R-4.5)],[Math.cos(a)*10.5,Math.sin(a)*10.5]]);continue;}cand.push({x:Math.cos(a)*(R-OFF-.6),z:Math.sin(a)*(R-OFF-.6),ry:ryFace(Math.cos(a),Math.sin(a)),back:'park',a:a,ring:'in'});}
  // 번호: 선착장(남쪽)에서 시계 방향으로 고리길을 따라 — 바깥/안 섞어서 각도 순서
  cand.sort((p,q)=>((p.a-90*D+TAU)%TAU)-((q.a-90*D+TAU)%TAU));cand.forEach((s,i)=>{s.n=i+1;s.street='고리길';L.slots.push(s);});
  for(let k=0;k<32;k++){const a=(90+180/32+k*360/32)*D;const p=[Math.cos(a)*(R+3.6),Math.sin(a)*(R+3.6)];(k%2?L.lamps:L.streetTrees).push(p);}
  for(let k=0;k<22;k++){if(GAP.includes(k)||GAP.includes((k+1)%22))continue;const a=(90+180/22+k*360/22)*D;const p=[Math.cos(a)*(R-3.6),Math.sin(a)*(R-3.6)];(k%2?L.streetTrees:L.lamps).push(p);}
  L.fac.push({type:'pavilion',x:-6,z:-19,ry:Math.PI/4},{type:'mapBoard',x:-4.5,z:R+9,ry:.35},{type:'pond',x:21,z:3});
  L.view={cam:[46,108,144],tgt:[0,0,9],fov:42,top:{cx:0,cz:5,half:96}};return L;}},
 // 안3 꽃잎 마을: 가운데 광장에서 막다른 골목 4개(벚꽃·은행·라벤더·단풍). 골목 사이는 작은 만(물)
 clover:{name:'안3 꽃잎 마을 (막다른 골목 4개)',build(){const L={lands:[],roads:[],walks:[],slots:[],plaza:[0,0,12],piers:[],fac:[],streetTrees:[],lamps:[],tint:[]};
  // 섬 윤곽: 극좌표 r(θ)
  const HW=27.5,CX=100,CR=34.5,pts=[];for(let i=0;i<240;i++){const t=i/240*TAU;let d=((t+Math.PI/4)%(Math.PI/2))-Math.PI/4;const ad=Math.abs(d);let r=Math.min(HW/Math.max(.02,Math.sin(ad)),CX/Math.cos(ad));
   const s=CX*Math.sin(ad);if(s<=CR){r=Math.max(r,CX*Math.cos(ad)+Math.sqrt(CR*CR-s*s));}r=Math.max(r,42)+Math.sin(i*.9)*.5;pts.push([Math.cos(t)*r,Math.sin(t)*r]);}
  L.lands.push(pts);
  const NAMES=['벚꽃길','은행길','라벤더길','단풍길'],TC=[['fpink','pink'],['yellow','butter'],['lav','fpurp'],['orange','roofO']];
  let n=1;
  for(let p=0;p<4;p++){const A=p*Math.PI/2,ca=Math.cos(A),sa=Math.sin(A),W=(x,z)=>[x*ca-z*sa,x*sa+z*ca];const RY=r=>r-A;// 로컬 → 월드
   L.roads.push({pts:[W(12.5,0),W(93,0)]});const bulb=[];for(let i=0;i<28;i++){const a=i/28*TAU;bulb.push(W(100+Math.cos(a)*7,Math.sin(a)*7));}L.roads.push({pts:bulb,closed:true,dash:false,bulb:W(100,0)});
   const loc=[];[31.5,43.7,55.9,68.1,80.3].forEach((x,i)=>{if(!(p>=2&&i===0))loc.push({x,z:-OFF,f:[0,1],side:'s'});loc.push({x,z:OFF,f:[0,-1],side:'n'});});
   [-55,0,55].forEach(dg=>{const a=dg*Math.PI/180;loc.push({x:100+Math.cos(a)*20,z:Math.sin(a)*20,f:[-Math.cos(a),-Math.sin(a)],end:1});});
   // 번호: 광장 쪽에서 골목 끝으로, 왼쪽→끝→오른쪽 순서
   const left=loc.filter(q=>q.side==='s').sort((a,b)=>a.x-b.x),end=loc.filter(q=>q.end).sort((a,b)=>Math.atan2(a.z,a.x-100)-Math.atan2(b.z,b.x-100)),right=loc.filter(q=>q.side==='n').sort((a,b)=>b.x-a.x);
   left.concat(end,right).forEach(q=>{const [x,z]=W(q.x,q.z),[fx,fz]=W(q.f[0],q.f[1]);L.slots.push({x,z,ry:ryFace(fx,fz),back:'lake',street:NAMES[p],n:n++,petal:p});});
   for(let x=25.4;x<=87;x+=12.2){[-1,1].forEach((sd,j)=>{const q=W(x,sd*3.6);(((x-25.4)/12.2|0)%2===j?L.streetTrees:L.lamps).push(q);L.tint.push([q[0],q[1],TC[p]]);});}
   if(p>=2){const q=W(31.5,-13),f=W(0,1);L.fac.push({type:p===2?'pavilion':'mapBoard',x:q[0],z:q[1],ry:ryFace(f[0],f[1])});}
  }
  L.piers.push({x:29.4,z:29.4,ry:Math.PI/4,L:12});L.walks.push([[8.5,8.5],[29.7,29.7]]);
  L.view={cam:[66,142,188],tgt:[0,0,9],fov:42,top:{cx:0,cz:0,half:140}};return L;}},
};

// ── 4방향 임포스터 (앞·오른쪽·뒤·왼쪽) ──
function bake4(T,renderer,combos,tile){tile=tile||256;const cols=4,rows=combos.length;const rt=new T.WebGLRenderTarget(cols*tile,rows*tile,{samples:4}); const sc=new T.Scene();sc.add(new T.HemisphereLight(0xeaf4ff,0x8c7a5c,.85));const d=new T.DirectionalLight(0xfff0d8,1.55);d.position.set(9,15,10);sc.add(d);sc.add(new T.AmbientLight(0xffffff,.12));
 const tiles={},prevT=renderer.getRenderTarget(),prevC=renderer.getClearColor(new T.Color()),prevA=renderer.getClearAlpha();renderer.setRenderTarget(rt);renderer.setClearColor(0,0);renderer.clear();
 combos.forEach((c,ri)=>{const h=houseVar(T,c[0],c[1],c[2]||'R');h.traverse(m=>{if(m.isPoints)m.visible=false;});sc.add(h);const bb=new T.Box3().setFromObject(h),bs=bb.getBoundingSphere(new T.Sphere()),R=bs.radius*1.02;
  for(let k=0;k<4;k++){const az=k*Math.PI/2+.42,el=.3;const cam=new T.OrthographicCamera(-R,R,R,-R,.1,R*6);cam.position.set(bs.center.x+Math.sin(az)*Math.cos(el)*R*3,bs.center.y+Math.sin(el)*R*3,bs.center.z+Math.cos(az)*Math.cos(el)*R*3);cam.lookAt(bs.center);
   const x=k*tile,y=ri*tile;rt.viewport.set(x,y,tile,tile);rt.scissor.set(x,y,tile,tile);rt.scissorTest=true;renderer.setRenderTarget(rt);renderer.render(sc,cam);}
  sc.remove(h);tiles[c[0]+c[1]+(c[2]||'R')]={u:0,v:ri/rows,du:1/cols,dv:1/rows,R,cy:bs.center.y,cx:bs.center.x,cz:bs.center.z};});
 rt.scissorTest=false;rt.viewport.set(0,0,cols*tile,rows*tile);renderer.setRenderTarget(prevT);renderer.setClearColor(prevC,prevA);return {texture:rt.texture,tiles,rt,four:true};}
function field4(T,bake,cap){const g=new T.PlaneGeometry(1,1);g.translate(0,.5,0);const tile=new T.InstancedBufferAttribute(new Float32Array(cap*4),4),ry=new T.InstancedBufferAttribute(new Float32Array(cap),1);g.setAttribute('tile',tile);g.setAttribute('iry',ry);
 const mat=new T.ShaderMaterial({uniforms:Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{map:{value:bake.texture},dim:{value:1}}),fog:true,
  vertexShader:'attribute vec4 tile;attribute float iry;varying vec2 vUv;\n#include <fog_pars_vertex>\nvoid main(){vec4 c=modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.);float s=length(instanceMatrix[0].xyz);vec3 r=normalize(vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]));vec3 w=c.xyz+r*position.x*s+vec3(0.,1.,0.)*position.y*s;'+
  'vec3 vd=cameraPosition-c.xyz;float a=atan(vd.x,vd.z)-iry;float k=mod(floor((a-.42)/1.5707963+.5),4.);vUv=vec2(tile.x+(k+uv.x)*tile.z,tile.y+uv.y*tile.w);vec4 mvPosition=viewMatrix*vec4(w,1.);gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
  fragmentShader:'uniform sampler2D map;uniform float dim;varying vec2 vUv;\n#include <fog_pars_fragment>\nvoid main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;gl_FragColor=vec4(t.rgb*dim,1.);\n#include <encodings_fragment>\n#include <fog_fragment>\n}'});
 const im=new T.InstancedMesh(g,mat,cap);im.count=0;im.frustumCulled=false;im.name='impostors';const O=new T.Object3D();
 return {mesh:im,mat,set(i,key,x,z,r){const t=bake.tiles[key],c=Math.cos(r),s=Math.sin(r);O.position.set(x+t.cx*c+t.cz*s,t.cy-t.R,z-t.cx*s+t.cz*c);O.scale.setScalar(t.R*2);O.updateMatrix();im.setMatrixAt(i,O.matrix);tile.setXYZW(i,t.u,t.v,t.du,t.dv);ry.setX(i,r);tile.needsUpdate=ry.needsUpdate=true;im.instanceMatrix.needsUpdate=true;im.count=Math.max(im.count,i+1);}};}

function glowPoints(T,glows){if(!glows.length)return null;const g=new T.BufferGeometry(),p=new Float32Array(glows.length*3),c=new Float32Array(glows.length*3),sz=new Float32Array(glows.length),col=new T.Color();
 glows.forEach((q,i)=>{p.set([q[0],q[1],q[2]],i*3);col.set(q[4]);c.set([col.r,col.g,col.b],i*3);sz[i]=q[3];});g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('color',new T.BufferAttribute(c,3));g.setAttribute('gsize',new T.BufferAttribute(sz,1));
 const pts=new T.Points(g,NK_HOUSE._glowMat(T));pts.frustumCulled=false;pts.renderOrder=5;return pts;}

const NK_ISLAND50={LAYOUTS,Q,LOT,bake4,field4,houseVar,ROOFS,
 // o: {layout, plots:[{style,stage,mine,vacant,plots}], mode:'merged'|'separate', lod:{cam,nearHouse,nearFarm,bake}, mine:n}
 build(T,o){o=o||{};const key=o.layout||'ring',L=LAYOUTS[key].build(),mode=o.mode||'merged',A=NK_HOUSE.atlas(T),P=IP(),k=K();
  const S=NK_HOUSE.Builder(T),items=[],poi=[];const t0=performance.now();
  S.cyl('waterD',420,420,.06,48,0,-.11,0);
  L.lands.forEach(pts=>P.land(S,pts,{sea:6}));
  if(L.plaza){P.plaza(S,...L.plaza);poi.push({type:'plaza',x:L.plaza[0],z:L.plaza[1],r:L.plaza[2]});}
  L.walks.forEach(p=>P.path(S,p,2.4,'sand'));
  L.roads.forEach(r=>{Q.road(S,r.pts,r.closed,{w:r.w,dash:r.dash,walk:r.walk});if(r.bulb){S.cyl('grass',3.6,3.6,.06,20,r.bulb[0],.13,r.bulb[1]);k.tree(S,r.bulb[0],r.bulb[1],1.2,'leafL');k.flowers(S,r.bulb[0]-1.4,r.bulb[1]+2.2,4,.35,3);}});
  L.piers.forEach(p=>{P.pier(S,p.x,p.z,p.ry,p.L);const ex=p.x+Math.sin(p.ry)*p.L,ez=p.z+Math.cos(p.ry)*p.L;poi.push({type:'pier',x:ex,z:ez,x0:p.x,z0:p.z});});
  const tintAt=(x,z)=>{if(!L.tint)return null;const t=L.tint.find(q=>Math.hypot(q[0]-x,q[1]-z)<.5);return t?t[2]:null;};
  L.streetTrees.forEach(([x,z],i)=>{const t=tintAt(x,z);Q.streetTree(S,x,z,i,t);});L.lamps.forEach(([x,z])=>Q.lamp(S,x,z));
  L.fac.forEach(f=>{if(f.type==='pavilion')Q.pavilion(S,f.x,f.z,f.ry);if(f.type==='mapBoard')Q.mapBoard(S,f.x,f.z,f.ry);if(f.type==='pond')P.pond(S,f.x,f.z,5,3.6);
   if(f.type==='park'){for(let i=0;i<5;i++)k.tree(S,-4+(i%2)*8,-9+i*4.5,1.2,'leafL');S.at(0,.1,0,Math.PI/2,()=>k.bench(S,'shutR'));}poi.push({type:f.type,x:f.x,z:f.z});});
  const plots=o.plots||[];const slotInfo=[];
  const lodD=(x,z)=>o.lod?Math.hypot(x-o.lod.cam[0],o.lod.cam[1]||0,z-o.lod.cam[2]):0;let nFarLot=0;
  L.slots.forEach((s,i)=>{const p=Object.assign({},plots[i]||{});if(o.mine===s.n)p.mine=true;const hs=[];const far=!!(o.lod&&lodD(s.x,s.z)>(o.lod.nearLot||o.lod.nearFarm||40));if(far)nFarLot++;S.at(s.x,0,s.z,s.ry,()=>{Q.lot(S,s,p,hs,far);});
   const c=Math.cos(s.ry),sn=Math.sin(s.ry),W=(lx,lz)=>[s.x+lx*c+lz*sn,s.z-lx*sn+lz*c];
   hs.forEach(h=>{const [wx,wz]=W(h.x,h.z);h.wx=wx;h.wz=wz;h.ry=s.ry;h.slot=i;items.push(h);});
   const si={n:s.n,petal:s.petal,street:s.street,back:s.back,x:s.x,z:s.z,ry:s.ry,vacant:!!p.vacant,stage:p.stage,mine:!!p.mine,house:W(0,LOT.houseZ),farm:W(0,LOT.farmZ),front:W(0,8.5),mail:W(1.7,6.45)};slotInfo.push(si);poi.push(Object.assign({type:'plot'},si));
   if(p.mine){const hp=W(0,LOT.houseZ);Q.pin(S,hp[0],hp[1],(p.stage||3)<=1?6.2:7.3);}});
  // 나무·덤불·꽃 (빈 땅에만)
  const segD=(px,pz,a,c)=>{const dx=c[0]-a[0],dz=c[1]-a[1],t=Math.max(0,Math.min(1,((px-a[0])*dx+(pz-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(px-a[0]-dx*t,pz-a[1]-dz*t);};
  const inPoly=(x,z,pts)=>{let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const [xi,zi]=pts[i],[xj,zj]=pts[j];if(((zi>z)!==(zj>z))&&(x<(xj-xi)*(z-zi)/(zj-zi)+xi))ins=!ins;}return ins;};
  const edgeD=(x,z,pts)=>{let m=1e9;for(let i=0;i<pts.length;i++)m=Math.min(m,segD(x,z,pts[i],pts[(i+1)%pts.length]));return m;};
  const inLot=(x,z,pad)=>L.slots.some(s=>{const dx=x-s.x,dz=z-s.z,c=Math.cos(s.ry),sn=Math.sin(s.ry),lx=dx*c-dz*sn,lz=dx*sn+dz*c;return Math.abs(lx)<LOT.w/2+pad&&lz<LOT.front+pad&&lz>-LOT.back-pad-(s.back==='lake'?4:0);});
  const onRoad=(x,z)=>L.roads.some(r=>{const n=r.pts.length,m=r.closed?n:n-1;for(let i=0;i<m;i++)if(segD(x,z,r.pts[i],r.pts[(i+1)%n])<(r.walk===false?(r.w||5.6)/2+1.5:7.5))return true;return false;})||L.walks.some(p=>segD(x,z,p[0],p[1])<3.5);
  const near=(x,z)=>(L.plaza&&Math.hypot(x-L.plaza[0],z-L.plaza[1])<L.plaza[2]+3.5)||L.piers.some(p=>Math.hypot(x-p.x,z-p.z)<7)||L.fac.some(f=>f.type!=='park'&&Math.hypot(x-f.x,z-f.z)<(f.type==='pond'?8:6.5))||L.streetTrees.concat(L.lamps).some(q=>Math.hypot(x-q[0],z-q[1])<1.8);
  let bbx=[1e9,-1e9,1e9,-1e9];L.lands.forEach(p=>p.forEach(([x,z])=>{bbx=[Math.min(bbx[0],x),Math.max(bbx[1],x),Math.min(bbx[2],z),Math.max(bbx[3],z)];}));
  let nt=0;const G=o.treeGrid||3.3;for(let gx=bbx[0];gx<=bbx[1];gx+=G)for(let gz=bbx[2];gz<=bbx[3];gz+=G){const kk=gx*13.1+gz*7.7,x=gx+(rnd(kk)-.5)*G*.7,z=gz+(rnd(kk+3)-.5)*G*.7;
   const land=L.lands.find(pts=>inPoly(x,z,pts));if(!land)continue;const ed=edgeD(x,z,land);if(ed<2)continue;if(inLot(x,z,.6)||onRoad(x,z)||near(x,z))continue;
   const r=rnd(kk+9);if(r<.46){P.tree(S,x,z,.95+rnd(kk+5)*.5,nt++);}else if(r<.6)k.bush(S,.5+rnd(kk+1)*.3,x,z,rnd(kk+2)<.5?'leaf':'leafD',3);else if(r<.8){const F=['fpink','yellow','fwhite','red','fpurp','fblue'];for(let q=0;q<4;q++)S.ico(F[(Math.abs(kk|0)+q)%6],.12,x+(q-1.5)*.35,.14,z+((q*37)%5-2)*.08,1,1,1,0);S.ico('leaf',.3,x,.05,z,2.2,.4,1.4,0);}else if(r<.84)S.ico('stone',.5,x,.05,z,1.3,.6,1.1);}
  L.lands.forEach((pts,li)=>{for(let i=0;i<pts.length;i+=3){const [x,z]=pts[i];if(inLot(x,z,1)||L.piers.some(p=>Math.hypot(x-p.x,z-p.z)<8))continue;if(rnd(i+li*31)<.45)S.ico(rnd(i)<.5?'stone':'stoneW',.45+rnd(i+2)*.5,x,.0,z,1.3,.55,1.1,0,i);}});
  // ── LOD: 집(가까우면 실메시·멀면 임포스터), 텃밭(가까우면 실메시·멀면 가벼운 텃밭) ──
  const lod=o.lod||null,FL=NK_HOUSE.Builder(T);let impostor=null,nImp=0,nNearH=0,nNearF=0,nLiteF=0;
  if(lod&&lod.bake)impostor=field4(T,lod.bake,items.length);
  const nearObjs=[];
  items.forEach(h=>{const d=lod?Math.hypot(h.wx-lod.cam[0],lod.cam[1]||0,h.wz-lod.cam[2]):0;
   if(h.house){if(impostor&&d>lod.nearHouse){impostor.set(nImp++,h.house.style+h.house.stage+(h.house.roof||'R'),h.wx,h.wz,h.ry);return;}const g=h.o;g.position.set(h.wx,0,h.wz);g.rotation.y=h.ry;nearObjs.push(g);nNearH++;}
   else if(h.farmDef){if(lod&&d>(lod.nearFarm||lod.nearHouse)){FL.at(h.wx,0,h.wz,h.ry,()=>Q.farmLite(FL,h.farmDef.plots,h.farmDef.size));nLiteF++;return;}const F=NK_FARM.build(T,h.farmDef);F.group.position.set(h.wx,0,h.wz);F.group.rotation.y=h.ry;nearObjs.push(F.group);nNearF++;}});
  if(nLiteF)FL.parts.forEach(g=>S.parts.push(g));
  const root=new T.Group();root.name='NK_ISLAND50';let st,nChunks=1;
  if(o.chunk){// 정적 메시를 구역(격자)별로 나눠 합치기 → 화면 밖 구역은 안 그림(절두체 컬링)
   const cs=o.chunk,cells=new Map(),water=S.parts[0];S.parts.forEach((g,i)=>{if(i===0)return;g.computeBoundingBox();const bb=g.boundingBox,cx=Math.floor((bb.min.x+bb.max.x)/2/cs),cz=Math.floor((bb.min.z+bb.max.z)/2/cs),key=cx+','+cz;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(g);});
   const add=(gs,name)=>{const g=T.BufferGeometryUtils.mergeBufferGeometries(gs,false);g.computeBoundingSphere();const m=new T.Mesh(g,A.mat);m.receiveShadow=m.castShadow=true;m.name=name;root.add(m);return g;};
   add([water],'water');cells.forEach((gs,key)=>add(gs,'chunk '+key));nChunks=cells.size;st={geo:{attributes:{position:{count:S.parts.reduce((a,g)=>a+g.attributes.position.count,0)}}},glows:S.glows,parts:S.parts.length};}
  else{st=S.done();const statMesh=new T.Mesh(st.geo,A.mat);statMesh.receiveShadow=statMesh.castShadow=true;statMesh.name='island-static';root.add(statMesh);}
  const tBuild=performance.now()-t0;
  const sg=glowPoints(T,st.glows);if(sg)root.add(sg);
  const t1=performance.now();
  if(mode==='separate'){nearObjs.forEach(g=>root.add(g));}
  else{const tmp=new T.Group();nearObjs.forEach(g=>tmp.add(g));tmp.updateMatrixWorld(true);const buckets=new Map();
   tmp.traverse(m=>{if(!(m.isMesh||m.isPoints)||m.isInstancedMesh)return;const kk=m.material.uuid;if(!buckets.has(kk))buckets.set(kk,{mat:m.material,pts:m.isPoints,geos:[]});let g=m.geometry.clone();if(g.index)g=g.toNonIndexed();g.applyMatrix4(m.matrixWorld);buckets.get(kk).geos.push(g);});
   buckets.forEach(bk=>{const g=T.BufferGeometryUtils.mergeBufferGeometries(bk.geos,false);if(!g)return;const m=bk.pts?new T.Points(g,bk.mat):new T.Mesh(g,bk.mat);if(bk.pts){m.frustumCulled=false;m.renderOrder=5;}else{m.castShadow=bk.mat===A.mat;m.receiveShadow=true;}m.name=bk.pts?'plots-glow':'plots';root.add(m);});}
  const tMerge=performance.now()-t1;if(impostor&&nImp)root.add(impostor.mesh);
  return {group:root,layout:L,slots:slotInfo,poi,impostor,info:{layout:key,name:LAYOUTS[key].name,slots:L.slots.length,houses:items.filter(h=>h.house).length,nearHouses:nNearH,impostors:nImp,nearFarms:nNearF,liteFarms:nLiteF,mode,farLots:nFarLot,chunks:nChunks,staticTris:Math.round(st.geo.attributes.position.count/3),msBuild:+tBuild.toFixed(0),msMerge:+tMerge.toFixed(0)}};},
};
(typeof window!=='undefined'?window:globalThis).NK_ISLAND50=NK_ISLAND50;
})();
