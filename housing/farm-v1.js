// ─────────────────────────────────────────────────────────────
// NK_FARM v1 — 피쉬코지 텃밭 시안 (Three.js r147, 게임 미적용)
// NK_HOUSE 와 같은 팔레트 아틀라스·머티리얼 공유 → 텃밭 1개(9~25칸 + 작물 전부) = 1 드로우콜 (온실 유리 +1)
// const F=NK_FARM.build(THREE,{style:'fence',size:9,plots:[{crop:'tomato',stage:4,watered:true}, ...]}); scene.add(F.group);
// ─────────────────────────────────────────────────────────────
(function(){
'use strict';
const PI=Math.PI;
const rj=(i,k)=>{const x=Math.sin(i*127.1+k*311.7+.5)*43758.5453;return x-Math.floor(x);};
// 납작한 잎 (길이 h, 폭 w) — 원점에서 위로 자라며 yaw 방향으로 tilt 만큼 기울어요
function blade(b,c,x,y,z,h,w,yaw,tilt){b.atR(x,y,z,0,yaw,0,()=>b.atR(0,0,0,tilt,0,0,()=>b.sph(c,h/2,0,h/2,0,w/h*2,1,.16*w/h*2,6,5)));}
function leaf(b,c,x,y,z,len,yaw,lift){// 옆으로 뻗는 둥근 잎
 b.atR(x,y,z,0,yaw,0,()=>b.atR(0,0,0,0,0,lift||0,()=>b.sph(c,len/2,len/2,0,0,1,.18,.55,7,5)));}
function tube(b,c,x,z,h,r,lx,lz){b.rod(c,r,[x,0,z],[x+(lx||0),h,z+(lz||0)],5);}
function seed(b){b.ico('dirtR',.3,0,-.02,0,1.25,.3,1.0,1);for(let i=0;i<3;i++)b.sph('plank',.035,-.1+i*.1,.07,(i%2)*.06-.03,1,.7,1,5,3);}
function sprout(b,c,n){n=n||1;const P=n===1?[[0,0]]:n===3?[[-.22,-.15],[.22,-.15],[0,.2]]:[[-.22,-.2],[.22,-.2],[-.22,.2],[.22,.2]];
 P.forEach(([x,z],i)=>{b.cylB('leaf',.012,.016,.15,4,x,0,z);leaf(b,c||'leafL',x,.15,z,.13,i*1.3,.35);leaf(b,c||'leafL',x,.15,z,.13,i*1.3+PI,.35);});}
const P4=[[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]],P3=[[-.2,-.18],[.22,-.12],[0,.22]];
function star(b,x,y,z,s){s=s||1;[0,PI/2].forEach(ry=>b.atR(x,y,z,0,ry,0,()=>{b.box('sparkle',.07*s,.07*s,.03*s,0,0,0,0,0,PI/4);[0,1,2,3].forEach(k=>b.atR(0,0,0,0,0,k*PI/2,()=>b.cone('sparkle',.035*s,.17*s,4,0,.1*s,0)));}));b.glow(x,y,z,.9*s,'#fff0a0');}
// ── 작물 14종: fn(b,stage) stage 0 씨앗 · 1 새싹 · 2 성장 · 3 꽃/열매 맺힘 · 4 수확 ──
const CROPS={
 lemon:{n:'레몬',en:'Lemon',fn(b,s){const h=[0,0,.3,.42,.46][s],r=[0,0,.22,.3,.34][s];b.cylB('logD',.035,.05,h,6,0,0,0);b.ico('leaf',r,0,h+r*.6,0,1.1,.85,1.1,1);b.ico('leafD',r*.7,r*.45,h+r*.3,.1,1,.8,1);b.ico('leafL',r*.6,-r*.4,h+r*.95,.05,1,.8,1);
  if(s===3)for(let i=0;i<6;i++){const a=i*1.05;b.sph('fwhite',.045,Math.cos(a)*r*.9,h+r*(.5+.3*Math.sin(i)),Math.sin(a)*r*.9,1,1,1,5,3);}
  if(s===4)for(let i=0;i<6;i++){const a=i*1.05+.3;const x=Math.cos(a)*r*.95,z=Math.sin(a)*r*.95,y=h+r*(.35+.35*((i%3)/2));b.sph('yellow',.075,x,y,z,1.25,1,1,8,6);b.cone('lemonL',.025,.05,4,x+.09,y,z,0,0,-PI/2);}}},
 daepa:{n:'대파',en:'Green onion',fn(b,s){const n=[0,0,2,3,4][s],h=[0,0,.32,.52,.78][s];P3.forEach(([x,z],k)=>{for(let i=0;i<n;i++){const a=i*2.1+k,lx=Math.cos(a)*.05,lz=Math.sin(a)*.05,hh=h*(.8+.25*rj(i,k));b.rod('garlic',.035,[x,0,z],[x+lx*.35,hh*.38,z+lz*.35],5);b.rod('leafL',.03,[x+lx*.35,hh*.38,z+lz*.35],[x+lx,hh,z+lz],5);}
  if(s===3&&k===0)b.ico('fwhite',.06,x+.03,h+.05,z,1,1,1,1);});}},
 garlic:{n:'마늘',en:'Garlic',fn(b,s){P4.forEach(([x,z],k)=>{const n=s>=3?4:3,h=[0,0,.26,.4,.36][s];for(let i=0;i<n;i++)blade(b,s===4?'dill':'leafL',x,s===4?.08:0,z,h,.06,i*1.6+k,s===4?.6:.18);
  if(s===3&&k%2===0)b.g(new b.T.TorusGeometry(.06,.01,3,8,PI*1.4),'leafL',x,h+.05,z);if(s===4){b.sph('garlic',.1,x,.07,z,1,.85,1,8,6);b.cone('garlic',.035,.08,5,x,.18,z);for(let i=0;i<4;i++)b.box('stemD',.006,.13,.005,x+Math.cos(i*1.6)*.07,.07,z+Math.sin(i*1.6)*.07);}});}},
 potato:{n:'감자',en:'Potato',fn(b,s){const r=[0,0,.14,.18,.17][s];for(let i=0;i<5;i++){const a=i/5*PI*2,x=Math.cos(a)*r*.9,z=Math.sin(a)*r*.9;b.ico(s===4&&i%2?'dill':i%2?'leafD':'leaf',r,x,r*.9,z,1,.8,1,1);}b.ico('leaf',r*1.05,0,r*1.7,0,1,.8,1,1);
  if(s===3)for(let i=0;i<5;i++){const a=i*1.3;b.ico(i%2?'fpurp':'fwhite',.045,Math.cos(a)*r,r*2.2,Math.sin(a)*r);b.sph('yellow',.02,Math.cos(a)*r,r*2.2+.035,Math.sin(a)*r,1,1,1,4,3);}
  if(s===4)[[.36,.1],[-.3,.28],[.12,.38],[-.34,-.2],[.3,-.3]].forEach(([x,z],i)=>b.sph('potato',.085,x,.04,z,1.25,.75,1,7,5));}},
 tomato:{n:'토마토',en:'Tomato',fn(b,s){const H=[0,0,.4,.78,.86][s];[-.2,.2].forEach((x,k)=>{if(s>=3)b.cylB('plankD',.018,.018,H+.1,4,x+.1,0,-.08);b.rod('leafD',.02,[x,0,0],[x,H,0],4);
  for(let i=0;i<(s===2?2:4);i++){const y=H*(.3+.2*i),a=i*2.2+k;b.ico(i%2?'leaf':'leafD',.13-(i*.012),x+Math.cos(a)*.08,y,Math.sin(a)*.08,1,.75,1,1);}
  if(s===3){for(let i=0;i<3;i++)b.ico('yellow',.035,x+.1*Math.cos(i*2),H*(.5+i*.15),.12,1,1,1);b.sph('tomatoG',.055,x-.08,H*.45,.1,1,1,1,7,5);b.sph('tomatoG',.05,x+.1,H*.6,.06,1,1,1,7,5);}
  if(s===4)for(let i=0;i<5;i++){const y=H*(.3+i*.13),a=i*1.9+k;const px=x+Math.cos(a)*.13,pz=Math.sin(a)*.13+.04;b.sph(i===2?'orange':'red',.07,px,y,pz,1,.9,1,8,6);b.cone('leaf',.03,.03,5,px,y+.065,pz);}});}},
 dill:{n:'딜',en:'Dill',fn(b,s){const n=[0,0,4,5,6][s],H=[0,0,.32,.6,.78][s];for(let i=0;i<n;i++){const a=i/n*PI*2,x=Math.cos(a)*.14,z=Math.sin(a)*.14,h=H*(.75+.3*rj(i,1));b.rod('leafL',.012,[x*.3,0,z*.3],[x,h,z],3);
  for(let k=0;k<3;k++)b.ico('dill',.065-(k*.01),x*(.6+k*.15),h*(.45+k*.2),z*(.6+k*.15),1.3,.7,1.3);
  if(s===4){b.cyl('yellow',.11,.04,.04,8,x,h+.02,z);for(let k=0;k<6;k++)b.sph('yellow',.025,x+Math.cos(k)*.09,h+.04,z+Math.sin(k)*.09,1,1,1,4,3);}
  if(s===3)b.cyl('dill',.08,.03,.03,6,x,h+.02,z);}}},
 chili:{n:'고추',en:'Chili',fn(b,s){const H=[0,0,.32,.5,.55][s];[[-.18,-.1],[.2,.12]].forEach(([x,z],k)=>{b.rod('leafD',.02,[x,0,z],[x,H*.5,z],4);b.ico('leafD',.14,x,H*.55,z,1.1,.7,1.1,1);b.ico('leaf',.12,x+.06,H*.8,z-.04,1,.7,1,1);b.ico('leaf',.1,x-.07,H*.9,z+.05,1,.7,1,1);
  if(s===3){for(let i=0;i<3;i++)b.ico('fwhite',.03,x+Math.cos(i*2.1)*.13,H*.75,z+Math.sin(i*2.1)*.13);for(let i=0;i<2;i++)b.cone('chiliG',.025,.15,5,x+Math.cos(i*3+1)*.12,H*.45,z+Math.sin(i*3+1)*.12,PI);}
  if(s===4)for(let i=0;i<5;i++){const a=i*1.3+k;b.cone(i===4?'chiliG':'red',.032,.2,6,x+Math.cos(a)*.15,H*.38,z+Math.sin(a)*.15,PI+.15,0,.1);}});}},
 radish:{n:'무',en:'Radish',fn(b,s){const L=[0,0,.26,.36,.42][s];for(let i=0;i<6;i++)leaf(b,i%2?'leaf':'leafL',0,s===4?.32:.06,0,L,i/6*PI*2,.7);
  if(s===3)b.cylB('garlic',.11,.11,.08,10,0,0,0);
  if(s===4){b.cylB('garlic',.12,.15,.22,10,0,0,0);b.cylB('leafL',.15,.12,.12,10,0,.2,0);b.cylB('tomatoG',.12,.15,.02,10,0,.32,0);}}},
 ginger:{n:'생강',en:'Ginger',fn(b,s){const n=[0,0,3,5,6][s],H=[0,0,.36,.6,.62][s];for(let i=0;i<n;i++){const a=i/n*PI*2+.4,x=Math.cos(a)*.13,z=Math.sin(a)*.13,h=H*(.8+.3*rj(i,2));b.rod('leafD',.016,[x,0,z],[x*1.3,h,z*1.3],4);for(let k=0;k<3;k++)blade(b,'leaf',x*1.3*(.4+k*.25),h*(.35+k*.22),z*1.3*(.4+k*.25),.22,.05,a+k*PI,1.1);}
  if(s===4)for(let i=0;i<6;i++)b.ico('ginger',.075,Math.cos(i*1.1)*.16,.04,Math.sin(i*1.1)*.16,1.3,.7,1,0,i);}},
 onion:{n:'적양파',en:'Red onion',fn(b,s){P4.forEach(([x,z],k)=>{const n=s>=3?3:2,h=[0,0,.3,.42,.3][s];for(let i=0;i<n;i++){const a=i*2.1+k;if(s===4)b.rod('dill',.022,[x,.15,z],[x+Math.cos(a)*.26,.06,z+Math.sin(a)*.26],4);else b.rod('leafL',.022,[x,0,z],[x+Math.cos(a)*.05,h,z+Math.sin(a)*.05],4);}
  if(s===3)b.sph('onionP',.06,x,.04,z,1,.8,1,7,5);if(s===4){b.sph('onionP',.12,x,.08,z,1,.85,1,9,6);b.cone('onionP',.04,.08,6,x,.2,z);}});}},
 basil:{n:'바질',en:'Basil',fn(b,s){const H=[0,0,.2,.32,.38][s],lv=[0,0,2,3,3][s];[[-.17,-.1],[.18,.12]].forEach(([x,z],k)=>{b.rod('leafD',.018,[x,0,z],[x,H,z],4);
  for(let l=0;l<lv;l++){const y=H*(.25+l*.3),a=l*PI/4+k,len=.25-l*.04;[0,PI/2,PI,PI*1.5].forEach((o,q)=>b.atR(x,y,z,0,a+o,0,()=>b.atR(0,0,0,0,0,.3,()=>b.sph((l+q)%2?'leaf':'basil',len/2,len/2,0,0,1,.42,.72,7,5))));}b.ico('basil',.1,x,H+.04,z,1,.85,1,1);
  if(s===4)for(let i=0;i<2;i++){b.rod('leafD',.012,[x,H*.9,z],[x+(i?.06:-.05),H+.1,z],3);b.cone('fwhite',.035,.16,5,x+(i?.06:-.05),H+.17,z);}});}},
 minari:{n:'미나리',en:'Water dropwort',water:true,fn(b,s){const n=[0,0,5,8,11][s],H=[0,0,.24,.38,.5][s];for(let i=0;i<n;i++){const a=i*2.4,r=.05+.22*Math.sqrt(i/n),x=Math.cos(a)*r,z=Math.sin(a)*r,h=H*(.75+.35*rj(i,3));
  b.rod(i%2?'stemP':'leafL',.016,[x*.5,0,z*.5],[x,h,z],3);for(let k=0;k<3;k++)leaf(b,k===1?'leafL':'minari',x,h,z,.17,a+k*2.1,.35);}}},
 wasabi:{n:'와사비',en:'Wasabi',water:true,fn(b,s){const n=[0,0,4,6,7][s],H=[0,0,.2,.3,.34][s];if(s===4){b.cylB('wasabiR',.08,.06,.2,8,0,0,0);for(let i=0;i<5;i++)b.ico('wasabiR',.035,Math.cos(i*1.3)*.07,.05+i*.03,Math.sin(i*1.3)*.07);}
  for(let i=0;i<n;i++){const a=i/n*PI*2,x=Math.cos(a)*.2,z=Math.sin(a)*.2;b.rod('stemP',.012,[0,s===4?.18:0,0],[x,H,z],3);b.atR(x,H,z,-.6,-a+PI/2,0,()=>b.disc('wasabiL',.14,.015,0,0,0,0,10));}
  if(s>=3)for(let i=0;i<3;i++)b.ico('fwhite',.03,Math.cos(i*2)*.08,H+.08,Math.sin(i*2)*.08);}},
 mushroom:{n:'버섯 (D 버섯집 연결)',en:'Shiitake',log:true,fn(b,s){b.cyl('logD',.16,.16,.75,8,0,.16,0,0,0,PI/2);b.cyl('logE',.12,.12,.77,8,0,.16,0,0,0,PI/2);
  const r=[0,.025,.05,.08,.11][s];if(s===0){for(let i=0;i<5;i++)b.sph('stoneW',.02,-.3+i*.15,.31,.05*(i%2),1,1,1,4,3);return;}
  [[-.24,.3,.07],[0,.31,-.05],[.24,.3,.06],[-.1,.2,.15],[.15,.22,.14]].forEach(([x,y,z],i)=>{b.cylB('stem',r*.35,r*.4,r*.8,5,x,y,z);b.g(new b.T.SphereGeometry(r,9,5,0,PI*2,0,PI/2),'mushS',x,y+r*.75,z,0,0,0,1,.6,1);if(s===4)b.sph('dot',r*.25,x+r*.3,y+r*1.3,z,1,.3,1,4,3);});}},
};
const ORDER=['lemon','daepa','garlic','potato','tomato','dill','chili','radish','ginger','onion','basil','minari','wasabi','mushroom'];
function crop(b,id,st){const C=CROPS[id];if(!C)return;if(st<=0&&!C.log){seed(b);return;}if(st===1&&!C.log){sprout(b,id==='basil'?'basil':id==='minari'?'minari':id==='wasabi'?'wasabiL':'leafL',['daepa','garlic','onion'].includes(id)?4:['lemon','radish','potato','ginger','dill'].includes(id)?1:3);return;}C.fn(b,st);}

// ── 칸(타일) 상태: empty 빈 땅 · tilled 갈아엎음 · watered 물 준 상태 · (stage 4 = 수확 가능 반짝임) ──
const PITCH=1.14,TILE=1.0;
const SIZES={4:[2,2],6:[3,2],9:[3,3],12:[4,3],16:[4,4],25:[5,5]};
function soil(b,style,state,i){const wet=state==='watered';
 if(style==='paddy'){b.boxB('mud',TILE,.06,TILE,0,-.02,0);b.boxB(state==='empty'?'grassD':'paddyW',TILE,.02,TILE,0,.08,0);if(state!=='empty')for(let k=0;k<2;k++)b.tor('waterL',.18+k*.12,.012,.12*(k?-1:1),.105,.1,PI/2,0,0,3,12);return .1;}
 if(style==='raft'){b.boxB('plankG',TILE,.32,TILE,0,0,0);b.boxB('plank',TILE+.04,.05,TILE+.04,0,.3,0);b.boxB(state==='empty'?'dirtR':wet?'dirtW':'dirtT',TILE-.14,.04,TILE-.14,0,.31,0);var y0=.35;}
 else{const bc=style==='greenhouse'?'brick':'plankD';[[0,.46,TILE,.08],[0,-.46,TILE,.08],[.46,0,.08,TILE],[-.46,0,.08,TILE]].forEach(([x,z,w,d])=>b.boxB(bc,w,.2,d,x,0,z));
  b.boxB(state==='empty'?'grassD':wet?'dirtW':'dirtT',TILE-.12,.16,TILE-.12,0,0,0);var y0=.16;
  if(state==='empty'){for(let k=0;k<4;k++)b.cone(k%2?'leafL':'grass',.05,.14,3,(rj(i,k)-.5)*.6,y0+.05,(rj(i,k+5)-.5)*.6);return y0;}}
 if(state!=='empty'){for(let k=-1;k<=1;k++)b.box(wet?'dirtW':'dirtR',TILE-.24,.05,.14,0,y0+.01,k*.27);
  if(wet)[[-.25,.14],[.2,-.12]].forEach(([x,z])=>b.cyl('sea',.06,.06,.01,8,x,y0+.045,z,0,0,0));}
 return y0;}

// ── 텃밭 스타일 4종 (틀·소품) ──
function frame(b,style,cols,rows){const W=cols*PITCH,D=rows*PITCH,K=NK_HOUSE.K;
 if(style==='fence'){b.boxB('sand',W+.9,.04,D+.9,0,-.02,0);const fx=W/2+.75,fz=D/2+.75;K.fence(b,-fx,fz,-.55,fz,'logL');K.fence(b,.55,fz,fx,fz,'logL');K.fence(b,-fx,-fz,fx,-fz,'logL');K.fence(b,-fx,-fz,-fx,fz,'logL');K.fence(b,fx,-fz,fx,fz,'logL');
  // 허수아비 (물고기 들고)
  b.at(fx-.35,0,-fz+.4,-.5,()=>{b.cylB('logD',.04,.05,1.55,6,0,0,0);b.box('logD',.9,.06,.06,0,1.15,0);b.boxB('shutR',.42,.45,.24,0,.85,0);b.box('shutB',.46,.12,.26,0,.86,0);b.sph('straw',.16,0,1.45,0,1,1,1,8,6);b.cylB('straw',.32,.32,.03,12,0,1.53,0);b.cylB('straw',.13,.15,.16,10,0,1.53,0);b.cylB('red',.15,.15,.04,10,0,1.58,0);
   b.sph('black',.022,-.06,1.47,.14,1,1,1,4,3);b.sph('black',.022,.06,1.47,.14,1,1,1,4,3);K.fish(b,'fishO',.4,.45,1.0,.05,PI/2);});
  // 물뿌리개 · 바구니 · 팻말 · 물통
  b.at(-.95,0,fz+.35,.5,()=>{b.cylB('metalL',.13,.15,.26,10,0,0,0);b.rod('metalL',.025,[.1,.1,0],[.32,.3,0],5);b.cyl('metalL',.04,.03,.05,6,.33,.31,0,0,0,-PI/3);b.g(new b.T.TorusGeometry(.11,.018,4,10,PI),'metalL',0,.26,0);});
  b.at(1.1,0,fz+.4,-.3,()=>{b.cylB('straw',.22,.18,.2,10,0,0,0);b.g(new b.T.TorusGeometry(.2,.02,4,10,PI),'plankD',0,.2,0);b.sph('red',.07,-.06,.24,.05,1,1,1,6,4);b.sph('yellow',.07,.07,.23,-.04,1.3,1,1,6,4);b.cylB('garlic',.06,.08,.12,8,.05,.2,.08);b.sph('onionP',.07,-.08,.24,-.08,1,.85,1,6,4);});
  b.at(-fx-.05,0,fz+.05,.6,()=>{b.cylB('logD',.04,.05,1.0,5,0,0,0);b.box('plank',.7,.34,.05,0,.9,.04);b.box('plankD',.72,.05,.06,0,1.08,.04);b.sph('red',.05,-.2,.9,.08,1,1,1,5,4);b.box('leaf',.06,.1,.02,-.2,.97,.08);b.box('dark',.3,.035,.01,.08,.94,.075);b.box('dark',.22,.035,.01,.08,.85,.075);});
  K.barrel(b,fx+.4,fz-.2,'plankD');return;}
 if(style==='raft'){const RW=W+.7,RD=D+.7;for(let i=0;i<Math.round(RD/.3);i++)b.box(i%2?'plank':'plankD',RW,.1,.28,0,.1,-RD/2+.15+i*.3);
  [-RW/2+.25,RW/2-.25].forEach(x=>[-RD/2+.3,RD/2-.3,0].forEach(z=>b.cyl('plankD',.2,.2,.5,8,x,-.02,z,PI/2,0,0)));[-RD/2+.1,RD/2-.1].forEach(z=>b.box('logD',RW+.1,.12,.12,0,.18,z));[-RW/2+.05,RW/2-.05].forEach(x=>b.box('logD',.12,.12,RD+.1,x,.18,0));
  const pts=[[-RW/2,-RD/2],[RW/2,-RD/2],[RW/2,RD/2],[-RW/2,RD/2]];pts.forEach(([x,z])=>b.cylB('logD',.05,.05,.7,5,x,.15,z));
  for(let k=0;k<4;k++){const a=pts[k],c=pts[(k+1)%4];if(k===2)continue;b.rod('rope',.02,[a[0],.75,a[1]],[c[0],.75,c[1]],3);}
  b.at(RW/2,.15,RD/2,0,()=>{b.cylB('logD',.05,.05,1.2,5,0,0,0);b.at(.0,1.2,0,0,()=>K.lantern(b,{c:'iron'}));});
  b.at(-RW/2-.02,.45,0,-PI/2,()=>{b.tor('fwhite',.2,.06,0,0,0,0,0,0,5,12,PI);b.tor('red',.2,.06,0,0,0,0,0,PI,5,12,PI);});
  for(let k=0;k<3;k++)b.tor('waterL',RW/2+.4+k*.35,.02,0,.02,0,PI/2,0,0,3,28);
  b.at(-RW/2+.45,.15,RD/2-.35,.3,()=>{b.cylB('metalL',.13,.15,.26,10,0,0,0);b.rod('metalL',.025,[.1,.1,0],[.32,.3,0],5);b.g(new b.T.TorusGeometry(.11,.018,4,10,PI),'metalL',0,.26,0);});return;}
 if(style==='paddy'){const BW=.16;b.boxB('grassD',W+.9,.08,D+.9,0,-.06,0);for(let i=0;i<=cols;i++)b.boxB('grass',BW,.2,D+BW,-W/2+i*PITCH-.0,0,0);for(let j=0;j<=rows;j++)b.boxB('grass',W+BW,.2,BW,0,0,-D/2+j*PITCH);
  // 대나무 물길 + 시시오도시 + 돌 + 부들 + 밀짚모자 기둥
  const bx=-W/2-.55,bz=-D/2+.2;b.cyl('bamboo',.06,.06,1.4,6,bx+.6,.55,bz-.25,0,0,PI/2-.2);b.cylB('bamboo',.05,.05,.6,6,bx,0,bz-.25);b.cylB('stone',.24,.28,.18,9,bx+1.35,0,bz-.25);b.cylB('paddyW',.2,.2,.02,9,bx+1.35,.17,bz-.25);
  for(let k=0;k<6;k++)b.ico(k%2?'stone':'stoneW',.16,-W/2-.5+((k*.47)%1.2),.0,D/2+.45-k*.0+(k%3)*.1-.2+(k>2?0:0),1.2,.5,1);
  for(let k=0;k<5;k++){const x=W/2+.45,z=-D/2+.3+k*.4;b.rod('leaf',.012,[x,0,z],[x+.02,.75+(k%2)*.15,z],3);b.cylB('mushS',.03,.03,.14,5,x+.02,.6+(k%2)*.15,z);}
  b.at(W/2+.45,0,D/2+.35,0,()=>{b.cylB('logD',.04,.05,1.0,5,0,0,0);b.cylB('straw',.3,.3,.03,12,0,1.0,0);b.cone('straw',.18,.18,10,0,1.1,0);});
  [-1,0,1].forEach(k=>b.cyl('stoneW',.2,.22,.06,8,-W/2-.45,.0,k*.6,0,0,0));return;}
 if(style==='greenhouse'){b.boxB('stone',W+1.2,.05,D+1.6,0,-.03,0);for(let i=0;i<Math.round((W+1.2)/.6);i++)b.box('stoneD',.02,.052,D+1.6,-W/2-.6+i*.6,-.005,0);
  const R=D/2+.7,L=W+1.0;for(let i=0;i<=cols+1;i++){const x=-L/2+i*L/(cols+1);b.g(new b.T.TorusGeometry(R,.04,4,16,PI),'white',x,.0,0,0,PI/2,0);}
  [0,.5,.95,PI-.5,PI-.95,PI/2].forEach(a=>b.cyl('white',.03,.03,L,5,0,Math.sin(a)*R,Math.cos(a)*R,0,0,PI/2));
  for(let i=0;i<cols;i++){const x=-W/2+(i+.5)*PITCH;b.rod('iron',.01,[x,R-.02,0],[x,R-.5,0],3);b.at(x,R-.82,0,0,()=>K.lantern(b,{c:'iron',gs:2.6}));}
  K.lights(b,[-L/2,R*.75,R*.66],[L/2,R*.75,R*.66],12,.18);
  [[-L/2-.35,D/2+.5],[L/2+.35,D/2+.5],[L/2+.35,-D/2-.2]].forEach(([x,z],i)=>{b.cylB('brick',.2,.15,.3,9,x,0,z);b.ico(['basil','dill','leaf'][i],.22,x,.45,z,1,.9,1,1);});
  b.at(-L/2-.4,0,0,PI/2,()=>{b.boxB('plankD',.8,.06,.4,0,.7,0);[-1,1].forEach(s=>b.boxB('plankD',.05,.7,.4,s*.37,0,0));b.cylB('brick',.1,.08,.14,8,-.2,.76,0);b.ico('leafL',.12,-.2,.95,0);b.cylB('metalL',.1,.12,.2,8,.15,.76,0);});
  return {R,L};}
}
function glassGeo(T,cols,rows){const W=cols*PITCH,D=rows*PITCH,R=D/2+.7,L=W+1.0;const g=new T.CylinderGeometry(R-.01,R-.01,L,16,1,true,-PI/2,PI);g.rotateZ(PI/2);
 const BG=T.BufferGeometryUtils;const caps=[-1,1].map(s=>{const c=new T.CircleGeometry(R-.01,16,0,PI);c.rotateY(PI/2);c.translate(s*L/2,0,0);return c;});return BG.mergeBufferGeometries([g.toNonIndexed(),...caps.map(c=>c.toNonIndexed())]);}

let GLASS=null;
function plotPos(cols,rows,i){const c=i%cols,r=(i/cols)|0;return [(c-(cols-1)/2)*PITCH,(r-(rows-1)/2)*PITCH];}
function stateOf(p){if(!p)return 'empty';if(p.state)return p.state;if(!p.crop)return p.tilled?(p.watered?'watered':'tilled'):'empty';return p.watered?'watered':'tilled';}
function buildPlots(b,style,cols,rows,plots,o){for(let i=0;i<cols*rows;i++){const p=plots[i]||{};const [x,z]=plotPos(cols,rows,i);
  b.at(x,0,z,0,()=>{const st=stateOf(p);const y0=soil(b,style,st,i);if(p.crop&&st!=='empty'&&o.crops!==false){b.at(0,y0,0,(rj(i,9)-.5)*.6,()=>crop(b,p.crop,p.stage|0));if((p.stage|0)>=4&&o.sparkle!==false){star(b,.28,y0+.95,.15,1);star(b,-.3,y0+.7,-.1,.7);b.tor('yellow',.44,.012,0,y0+.04,0,PI/2,0,0,3,20);}}});}}

const NK_FARM={CROPS,ORDER,SIZES,PITCH,crop,soil,
 // style: 'fence' 울타리 텃밭 | 'raft' 물 위 뗏목 텃밭 | 'paddy' 논(물 작물) | 'greenhouse' 등불 온실
 // plots: [{crop:'tomato',stage:0~4,watered:bool}] 또는 {state:'empty'|'tilled'|'watered'} · mode 'merge'(1콜) | 'instanced'
 build(T,o){o=o||{};const style=o.style||'fence',size=SIZES[o.size]?o.size:9,[cols,rows]=SIZES[size],plots=o.plots||[],mode=o.mode||'merge';const A=NK_HOUSE.atlas(T);const grp=new T.Group();
  const b=NK_HOUSE.Builder(T);frame(b,style,cols,rows);let calls=0,tris=0,parts=0;const glows=[];
  if(mode==='merge'){buildPlots(b,style,cols,rows,plots,o);}else{buildPlots(b,style,cols,rows,plots,Object.assign({},o,{crops:false}));}
  const r=b.done();const m=new T.Mesh(r.geo,A.mat);m.castShadow=m.receiveShadow=true;grp.add(m);calls++;tris+=r.geo.attributes.position.count/3;parts+=r.parts;r.glows.forEach(g=>glows.push(g));
  if(mode==='instanced'){const by={};plots.forEach((p,i)=>{if(i>=cols*rows||!p.crop||stateOf(p)==='empty')return;const k=p.crop+':'+(p.stage|0);(by[k]=by[k]||[]).push(i);});
   const O=new T.Object3D(),V=new T.Vector3();const y0=style==='paddy'?.1:style==='raft'?.35:.16;
   for(const k in by){const [c,s]=k.split(':');const ib=NK_HOUSE.Builder(T);crop(ib,c,+s);if(+s>=4){star(ib,.28,.95,.15,1);star(ib,-.3,.7,-.1,.7);ib.tor('yellow',.44,.012,0,.04,0,PI/2,0,0,3,20);}const ir=ib.done();
    const im=new T.InstancedMesh(ir.geo,A.mat,by[k].length);im.castShadow=true;by[k].forEach((i,n)=>{const [x,z]=plotPos(cols,rows,i);O.position.set(x,y0,z);O.rotation.set(0,(rj(i,9)-.5)*.6,0);O.updateMatrix();im.setMatrixAt(n,O.matrix);ir.glows.forEach(g=>{V.set(g[0],g[1],g[2]).applyMatrix4(O.matrix);glows.push([V.x,V.y,V.z,g[3],g[4]]);});});
    grp.add(im);calls++;tris+=ir.geo.attributes.position.count/3*by[k].length;parts+=ir.parts*by[k].length;}}
  if(glows.length){const g=new T.BufferGeometry(),p=new Float32Array(glows.length*3),c=new Float32Array(glows.length*3),sz=new Float32Array(glows.length),col=new T.Color();glows.forEach((q,i)=>{p.set([q[0],q[1],q[2]],i*3);col.set(q[4]);c.set([col.r,col.g,col.b],i*3);sz[i]=q[3];});
   g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('color',new T.BufferAttribute(c,3));g.setAttribute('gsize',new T.BufferAttribute(sz,1));const pts=new T.Points(g,NK_HOUSE._glowMat(T));pts.frustumCulled=false;pts.renderOrder=5;grp.add(pts);}
  let glass=null;if(style==='greenhouse'){if(!GLASS)GLASS=new T.MeshStandardMaterial({color:0xcfeefa,transparent:true,opacity:.13,roughness:.1,metalness:.1,depthWrite:false,side:T.DoubleSide});glass=new T.Mesh(glassGeo(T,cols,rows),GLASS);glass.renderOrder=3;grp.add(glass);calls++;}
  return {group:grp,mesh:m,glass,info:{calls,tris,parts,size,cols,rows,mode},plotPos:i=>plotPos(cols,rows,i)};},
 // 성장표/아이콘용: 작물 1개 단계 1개만
 cropMesh(T,id,st,sparkle){const b=NK_HOUSE.Builder(T);crop(b,id,st);if(sparkle&&st>=4){star(b,.28,.95,.15,1);star(b,-.3,.7,-.1,.7);}const r=b.done();const m=new T.Mesh(r.geo,NK_HOUSE.atlas(T).mat);m.castShadow=true;return {mesh:m,tris:r.geo.attributes.position.count/3,parts:r.parts};}};
(typeof window!=='undefined'?window:globalThis).NK_FARM=NK_FARM;
})();
