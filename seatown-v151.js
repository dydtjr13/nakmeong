// v151 🏘 바닷가 마을 (테스트) — 유럽 운하를 지나 바닷가로. 배에서만 낚시, 바닷가에서는 내릴 수 없어요
window.NK_SEATOWN=(function(){
function build(T,OX,V){V=V||window.__nkSeaV||'';const SNOW=V==='Cs';if(SNOW)V='C';
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
const MM={};const M=(c,o)=>{const k=c+JSON.stringify(o||{});return MM[k]||(MM[k]=new T.MeshStandardMaterial(Object.assign({color:c,roughness:.85,metalness:0,flatShading:true},o||{})));};
const add=(g,geo,m,x,y,z,ry)=>{const o=new T.Mesh(geo,typeof m==='string'?M(m):m);o.position.set(x,y,z);if(ry)o.rotation.y=ry;o.castShadow=o.receiveShadow=true;g.add(o);return o;};
const bx=(g,w,h,d,m,x,y,z,ry)=>add(g,new T.BoxGeometry(w,h,d),m,x,y,z,ry);
// 하늘 · 빛
// 물결 (울퉁불퉁 무늬)
function rip(){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle='#808080';x.fillRect(0,0,512,512);for(let i=0;i<900;i++){const v=110+rnd()*120|0;x.fillStyle=`rgba(${v},${v},${v},.35)`;x.beginPath();x.ellipse(rnd()*512,rnd()*512,6+rnd()*26,2+rnd()*6,rnd()*.4,0,7);x.fill();}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t;}
const RIP=rip();
function water(w,d,col,rep){const t=RIP.clone();t.needsUpdate=true;t.repeat.set(rep,rep*d/w);const m=new T.MeshStandardMaterial({color:col,roughness:.08,metalness:.15,bumpMap:t,bumpScale:.22,transparent:true,opacity:.96});const o=new T.Mesh(new T.PlaneGeometry(w,d),m);o.rotation.x=-Math.PI/2;o.receiveShadow=true;return o;}
// 유럽 운하 집 (좁고 높은 집 · 박공/계단식 지붕 · 흰 창틀 · 꽃 상자)
/* v156: 밤에 켜지는 창문 불빛 (st.night(0~1)로 세기 조절) */const LIT=[];const LITM=(()=>{const m=M('#3b4a5c',{emissive:'#ffc878',emissiveIntensity:0});if(!LIT.includes(m))LIT.push(m);return m;})();
const PAL=['#e9b872','#d8705a','#f1e3c8','#9ec3b8','#c8a0c8','#f0c8a8','#8fb0d8','#e6d48a','#b86a4a','#f4ead8','#a8c890'];
function house(g,x,z,face,w,d,h,col,kind){const H=new T.Group();H.position.set(x,0,z);H.rotation.y=face;g.add(H);
 bx(H,w,h,d,col,0,h/2,0);bx(H,w+.06,.12,d+.06,'#f4efe6',0,h+.02,0);
 // 지붕
 if(kind===0){const s=new T.Shape();s.moveTo(-w/2-.08,0);s.lineTo(w/2+.08,0);s.lineTo(0,w*.75);s.closePath();const ge=new T.ExtrudeGeometry(s,{depth:d+.1,bevelEnabled:false});ge.translate(0,0,-(d+.1)/2);add(H,ge,'#6a4438',0,h+.06,0);}
 else if(kind===1){for(let i=0;i<4;i++){const ww=w*(1-i*.22);bx(H,ww,.42,d*.98,col,0,h+.21+i*.42,.0);bx(H,ww+.06,.06,d,'#f4efe6',0,h+.42+i*.42,0);}const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,w*.7);s.closePath();const ge=new T.ExtrudeGeometry(s,{depth:d*.9,bevelEnabled:false});ge.translate(0,0,-d*.45-.04);add(H,ge,'#5a3a32',0,h,-.06);}
 else{const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,.3);s.quadraticCurveTo(w*.42,w*.62,0,w*.82);s.quadraticCurveTo(-w*.42,w*.62,-w/2,.3);s.closePath();const ge=new T.ExtrudeGeometry(s,{depth:.16,bevelEnabled:false});add(H,ge,col,0,h,d/2-.16);const s2=new T.Shape();s2.moveTo(-w/2+.05,0);s2.lineTo(w/2-.05,0);s2.lineTo(0,w*.7);s2.closePath();const g2=new T.ExtrudeGeometry(s2,{depth:d-.2,bevelEnabled:false});g2.translate(0,0,-d/2);add(H,g2,'#6a4438',0,h,0);bx(H,.06,.4,.06,'#f4efe6',0,h+w*.82+.15,d/2-.08);}
 // 창 (앞면 +z)
 const fl=Math.max(2,Math.floor((h-.6)/1.05));for(let r=0;r<fl;r++){const n=w>2.2?3:2;for(let i=0;i<n;i++){const x0=(i-(n-1)/2)*(w/n),y0=1.0+r*1.05+.35;bx(H,.5,.68,.06,'#f8f6f0',x0,y0,d/2+.01);bx(H,.38,.56,.07,rnd()<.62?LITM:'#3b4a5c',x0,y0,d/2+.02);bx(H,.04,.56,.08,'#f8f6f0',x0,y0,d/2+.03);if(r===0&&rnd()<.75){bx(H,.52,.12,.16,'#7a4a2a',x0,y0-.4,d/2+.1);for(let k=0;k<4;k++){const f=add(H,new T.SphereGeometry(.06,6,4),['#ff6a7a','#ffd25e','#ff9ec4','#ffffff'][(k+i)%4],x0-.18+k*.12,y0-.31,d/2+.14);}}}}
 bx(H,.62,1.05,.08,'#4a3a32',w>2.2?0:-(w/4),.52,d/2+.02);bx(H,.72,.08,.14,'#f4efe6',w>2.2?0:-(w/4),1.08,d/2+.06);return H;}
function tree(g,x,z,s){add(g,new T.CylinderGeometry(.09*s,.13*s,1.4*s,6),'#7a5a3a',x,.7*s,z);const c=add(g,new T.IcosahedronGeometry(.85*s,1),['#5f9a4a','#6aa85a','#4f8a44'][rnd()*3|0],x,1.75*s,z);c.scale.y=1.1;}
function lamp(g,x,z){add(g,new T.CylinderGeometry(.05,.07,2.4,6),'#2d3238',x,1.2,z);const l=add(g,new T.BoxGeometry(.24,.32,.24),new T.MeshStandardMaterial({color:'#fff1c4',emissive:'#ffc66a',emissiveIntensity:1.4}),x,2.5,z);bx(g,.32,.06,.32,'#2d3238',x,2.7,z);}

const root=new T.Group();root.position.set(OX,0,0);
const W=7.2,Q=2.6,CZ0=12,CZ1=-100;
// 운하
{const CANAL=new T.Group();root.add(CANAL);const wa=water(W+.2,CZ0-CZ1+4,'#3f7f86',10);wa.position.set(0,-.05,(CZ0+CZ1)/2);CANAL.add(wa);
 [-1,1].forEach(q=>{const gd=new T.Mesh(new T.PlaneGeometry(60,V?CZ0-CZ1+24:CZ0-CZ1+40),M('#9fbf7a'));gd.rotation.x=-Math.PI/2;gd.position.set(q*(W/2+1+30),.02,V?(CZ0+CZ1)/2+11:(CZ0+CZ1)/2-10);gd.receiveShadow=true;CANAL.add(gd);bx(CANAL,9,.06,V?CZ0-CZ1-2:CZ0-CZ1+20,'#b9b2a6',q*(W/2+Q+5.5),.06,(CZ0+CZ1)/2+(V?1:0));});
 [-1,1].forEach(q=>{bx(CANAL,1.0,1.2,CZ0-CZ1,'#a0583e',q*(W/2+.5),-.5,(CZ0+CZ1)/2);bx(CANAL,Q,.12,CZ0-CZ1,'#c9bba4',q*(W/2+Q/2),.08,(CZ0+CZ1)/2);bx(CANAL,.16,.14,CZ0-CZ1,'#8a7a6a',q*(W/2+.06),.15,(CZ0+CZ1)/2);
  for(let z=CZ0,i=0;z>CZ1+2;i++){const w=1.8+rnd()*1.1,h=3.4+rnd()*2.8,kind=rnd()*3|0;house(CANAL,q*(W/2+Q+1.4),z-w/2,q<0?Math.PI/2:-Math.PI/2,w,2.8,h,PAL[(i*3+(q>0?5:0))%PAL.length],kind);z-=w+.04;}
  for(let z=CZ0-4;z>CZ1+2;z-=7.5){tree(CANAL,q*(W/2+1.0),z,1.15);lamp(CANAL,q*(W/2+.45),z-3.6);}
  for(let z=CZ0-18;z>CZ1+10;z-=17){const b=new T.Group();b.position.set(q*(W/2-.6),0,z+rnd()*4);CANAL.add(b);bx(b,.9,.3,2.6,['#3a6aa8','#2f7a5a','#b8483a'][rnd()*3|0],0,.05,0);bx(b,.75,.08,2.3,'#c9a070',0,.22,0);}});
 // 들어가는 곳 (호숫가 쪽) 막는 수문
 bx(CANAL,W+2,1.6,.6,'#8a5a3e',0,.4,CZ0+1.2);bx(CANAL,W+2.4,.2,.8,'#d8cbb6',0,1.25,CZ0+1.2);
 [-30,-68].forEach(z=>{const s=new T.Shape();s.moveTo(-W/2-1.2,-.6);s.lineTo(W/2+1.2,-.6);s.lineTo(W/2+1.2,2.6);s.lineTo(-W/2-1.2,2.6);s.closePath();const hole=new T.Path();hole.moveTo(-W/2+.3,-.6);hole.absarc(0,-.6,W/2-.3,0,Math.PI,false);s.holes.push(hole);const ge=new T.ExtrudeGeometry(s,{depth:2.4,bevelEnabled:false,curveSegments:24});ge.translate(0,0,-1.2);add(CANAL,ge,'#a8604a',0,0,z);bx(CANAL,W+2.6,.14,2.6,'#d8cbb6',0,2.66,z);[-1,1].forEach(e=>{for(let i=-5;i<=5;i++)bx(CANAL,.07,.5,.07,'#2d3238',i*.75,2.95,z+e*1.15);bx(CANAL,W+2.2,.06,.06,'#2d3238',0,3.2,z+e*1.15);});});}
// v155 시안: 운하 뒤 골목 채우기 + 작은 만(A 항구 · B 등대 해변 · C 절벽 마을)
function winTex(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#ffffff';x.fillRect(0,0,128,128);for(let r=0;r<3;r++)for(let i=0;i<3;i++){const X=12+i*40,Y=12+r*40;x.fillStyle='#e8e2d8';x.fillRect(X-3,Y-3,26,32);x.fillStyle='#4a5868';x.fillRect(X,Y,20,26);x.fillStyle='#e8e2d8';x.fillRect(X+9,Y,2,26);}x.fillStyle='#d8d0c4';x.fillRect(0,124,128,4);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;}
const WT=winTex();
function winEm(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,128,128);const on=[1,1,0,1,0,1,1,1,0];for(let r=0;r<3;r++)for(let i=0;i<3;i++){if(!on[r*3+i])continue;const X=12+i*40,Y=12+r*40;x.fillStyle=['#ffd890','#ffc878','#ffe2a8'][(r+i)%3];x.fillRect(X,Y,20,26);x.fillStyle='#000';x.fillRect(X+9,Y,2,26);}const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;}
const WE=winEm();
function town(g,L){if(!L.length)return;const wg=new T.BoxGeometry(1,1,1);wg.translate(0,.5,0);
 const s=new T.Shape();s.moveTo(-.53,0);s.lineTo(.53,0);s.lineTo(0,.62);s.closePath();const rg=new T.ExtrudeGeometry(s,{depth:1.04,bevelEnabled:false});rg.translate(0,0,-.52);
 const wm=new T.MeshStandardMaterial({map:WT,emissiveMap:WE,emissive:'#ffffff',emissiveIntensity:0,roughness:.85,flatShading:true});LIT.push(wm);const W=new T.InstancedMesh(wg,wm,L.length),R=new T.InstancedMesh(rg,new T.MeshStandardMaterial({roughness:.8,flatShading:true}),L.length);
 const m=new T.Matrix4(),q=new T.Quaternion(),e=new T.Euler(),p=new T.Vector3(),sc=new T.Vector3(),c=new T.Color();
 L.forEach((h,i)=>{e.set(0,h.ry||0,0);q.setFromEuler(e);p.set(h.x,h.y||0,h.z);sc.set(h.w,h.h,h.d);m.compose(p,q,sc);W.setMatrixAt(i,m);W.setColorAt(i,c.set(h.c));
  p.set(h.x,(h.y||0)+h.h,h.z);sc.set(h.w,h.w*(h.rp||.9),h.d);m.compose(p,q,sc);R.setMatrixAt(i,m);R.setColorAt(i,c.set(h.rc||'#8a4a3a'));});
 W.castShadow=W.receiveShadow=R.castShadow=true;R.userData.roof=1;g.add(W);g.add(R);}
const ROOF=['#8a4a3a','#7a3e32','#9a5a44','#6a4438','#b0603e','#5a6a7a'];
function trees(g,L){if(!L.length)return;const tg=new T.CylinderGeometry(.1,.14,1.4,6);tg.translate(0,.7,0);const cg=new T.IcosahedronGeometry(.9,1);cg.translate(0,1.9,0);
 const A=new T.InstancedMesh(tg,M('#7a5a3a'),L.length),B=new T.InstancedMesh(cg,new T.MeshStandardMaterial({roughness:.9,flatShading:true}),L.length),m=new T.Matrix4(),c=new T.Color();
 L.forEach((t,i)=>{m.makeScale(t.s,t.s*(t.sy||1),t.s);m.setPosition(t.x,t.y||0,t.z);A.setMatrixAt(i,m);B.setMatrixAt(i,m);B.setColorAt(i,c.set(t.c||['#5f9a4a','#6aa85a','#4f8a44'][i%3]));});A.castShadow=B.castShadow=true;B.userData.leaf=1;g.add(A);g.add(B);}
function backRows(g){/* 운하 집 뒤로 3줄 · 더 멀리 교회 탑 · 언덕 */const L=[],TR=[];
 [-1,1].forEach(q=>{for(let r=1;r<=3;r++){for(let z=CZ0+4;z>CZ1+2;){const w=2.2+rnd()*1.6;L.push({x:q*(W/2+Q+1.4+r*3.3),z:z-w/2,w,d:3.0,h:4.4+rnd()*2.6+r*.9,ry:Math.PI/2,c:PAL[(r*7+L.length)%PAL.length],rc:ROOF[(L.length*3)%ROOF.length]});z-=w+.05;}}
  for(let z=CZ0;z>CZ1;z-=9+rnd()*6)TR.push({x:q*(W/2+Q+1.4+13+rnd()*4),z,s:1.4+rnd()*.6});
  for(let z=CZ0-6;z>CZ1;z-=4.2){const w=2.6+rnd();L.push({x:q*(W/2+Q+20+rnd()*3),z,w,d:3.4,h:5+rnd()*3,ry:Math.PI/2,c:PAL[(L.length)%PAL.length],rc:ROOF[L.length%ROOF.length]});}});
 town(g,L);trees(g,TR);
 [[-1,-28],[1,-62],[-1,-86]].forEach(([q,z])=>{const x=q*(W/2+Q+11);bx(g,3.2,11,3.2,'#e8dcc8',x,5.5,z);const sp=add(g,new T.ConeGeometry(2.3,5,4),'#4a6a6a',x,13.5,z);sp.rotation.y=Math.PI/4;add(g,new T.CylinderGeometry(.5,.5,.1,16),'#f4efe6',x,8.5,z+1.62).rotation.x=Math.PI/2;});
 [-1,1].forEach(q=>{for(let i=0;i<4;i++){const h=add(g,new T.SphereGeometry(18,10,6,0,Math.PI*2,0,Math.PI/2),['#8aa86a','#7a9a5e','#9ab878'][i%3],q*(48+rnd()*10),-2,CZ0-10-i*22);h.scale.set(1.3,.5+rnd()*.35,1);h.castShadow=false;}});}
function bay(v){const g=new T.Group();root.add(g);const BW=46,BZ=-168,isl=[];
 {const wa=water(160,110,'#3a9ec0',30);wa.position.set(0,-.07,-138);g.add(wa);const far=water(700,420,'#3a92b8',60);far.position.set(0,-.1,BZ-210);g.add(far);}
 const stone='#b8ad9c',top='#d8cdb8';
 const quay=(x0,z0,x1,z1,y)=>{const L=Math.hypot(x1-x0,z1-z0),a=Math.atan2(x1-x0,z1-z0);bx(g,4,(y||.3)+1.2,L,stone,(x0+x1)/2,((y||.3)-1.2)/2,(z0+z1)/2,a);bx(g,4.1,.14,L,top,(x0+x1)/2,(y||.3)+.02,(z0+z1)/2,a);};
 const gnd=(x,z,w,d,c,y)=>{const o=new T.Mesh(new T.PlaneGeometry(w,d),M(c||'#9fbf7a'));o.rotation.x=-Math.PI/2;o.position.set(x,y==null?.04:y,z);o.receiveShadow=true;g.add(o);return o;};
 const L=[],TR=[];const H=(x,z,ry,r,y,w0)=>{const w=w0||2.4+rnd()*1.4;L.push({x,z,w,d:3.2,h:4+rnd()*2.8+(r||0)*.6,ry,y:y||0,c:PAL[(L.length*5+3)%PAL.length],rc:ROOF[(L.length*7)%ROOF.length]});return w;};
 const boat=(x,z,ry,c)=>{const b=new T.Group();b.position.set(x,0,z);b.rotation.y=ry;g.add(b);bx(b,1.1,.36,3.0,c,0,.06,0);bx(b,.9,.08,2.6,'#c9a070',0,.26,0);bx(b,.6,.5,.7,'#f4efe6',0,.5,-.4);};
 const lampP=(x,z)=>lamp(g,x,z);
 const umb=(x,z,c)=>{add(g,new T.CylinderGeometry(.04,.04,2.1,6),'#f4efe6',x,1.05,z);add(g,new T.ConeGeometry(1.2,.5,8),c,x,2.2,z);};
 const light=(x,z,y)=>{const b=y||0;add(g,new T.CylinderGeometry(.75,1,6,12),'#f6f2ea',x,b+3,z);for(let i=0;i<3;i++)add(g,new T.CylinderGeometry(.85-i*.07,.9-i*.07,.6,12),'#d84a3a',x,b+1+i*1.8,z);add(g,new T.CylinderGeometry(.55,.55,.7,10),new T.MeshStandardMaterial({color:'#fff1c4',emissive:'#ffd27a',emissiveIntensity:1.2}),x,b+6.35,z);add(g,new T.ConeGeometry(.8,.8,10),'#d84a3a',x,b+7.1,z);};
 // 운하 입구 양옆 앞쪽 부두
 quay(-BW,CZ1+1,-(W/2+.2),CZ1+1);quay(W/2+.2,CZ1+1,BW,CZ1+1);
 gnd(-(BW+60)/2-2,CZ1+20,BW+40,40);gnd((BW+60)/2+2,CZ1+20,BW+40,40);
 if(v==='A'){/* 항구 마을: 만을 둘러싼 부두 · 3줄 집 · 나무 부두 · 어시장 · 방파제 등대 */
  quay(-BW,CZ1+1,-BW,BZ);quay(BW,CZ1+1,BW,BZ);quay(-BW,BZ,-9,BZ);quay(9,BZ,BW,BZ);
  gnd(-BW-30,-135,56,90);gnd(BW+30,-135,56,90);
  [-1,1].forEach(q=>{for(let r=0;r<5;r++){for(let z=CZ1-2;z>BZ+4;){z-=H(q*(BW+4+r*3.6),z,q<0?Math.PI/2:-Math.PI/2,r,r*.9)+.05;}}
   for(let z=CZ1-6;z>BZ;z-=8)lampP(q*(BW-1.2),z);
   for(let i=0;i<3;i++){const z=CZ1-16-i*18;bx(g,9,.18,1.6,'#a0784e',q*(BW-4.5),.3,z);for(let k=0;k<4;k++)add(g,new T.CylinderGeometry(.12,.12,1.2,6),'#6a4a2e',q*(BW-1-k*2.6),-.2,z+.8);boat(q*(BW-6),z+2.4,0,['#3a6aa8','#2f7a5a','#b8483a','#e8a040'][(i+(q>0?2:0))%4]);boat(q*(BW-9),z-2.2,.1,['#f4efe6','#3a6aa8','#d8705a'][i%3]);}});
  for(let x=-BW;x<BW;){if(Math.abs(x+1.5)<W/2+Q+3.5){x+=1;continue;}const w=H(x+1.5,CZ1+7.5,Math.PI,0,0);x+=w+.05;}
  for(let i=0;i<6;i++){const x=-BW+6+i*6.5+(i>2?W+4:0);if(Math.abs(x)<W/2+2)continue;bx(g,2.2,.9,1.4,'#c9a070',x,.75,CZ1+3.2);const aw=add(g,new T.ConeGeometry(1.7,.6,4),['#d84a3a','#3a6aa8','#e8a040'][i%3],x,1.9,CZ1+3.2);aw.rotation.y=Math.PI/4;aw.scale.z=.7;}
  // 방파제 끝 등대 · 바깥 바다
  light(-9,BZ,1);light(9,BZ,1);
  TR.push(...[0,1,2,3,4,5].map(i=>({x:(i%2?1:-1)*(BW+17),z:-110-i*10,s:1.5})));}
 if(v==='B'){/* 등대 해변: 왼쪽 모래 해변 · 파라솔 · 오른쪽 언덕 마을 · 만 안 작은 섬과 등대 */
  const sand=gnd(-BW-8,-134,30,72,'#ecd9a8',.06);quay(BW,CZ1+1,BW,BZ+6);
  for(let i=0;i<9;i++){const z=-108-i*7;umb(-BW-2+((i%2)*3),z,['#d84a3a','#3a8ac8','#f2c64a','#ff8fb8'][i%4]);bx(g,.7,.15,1.8,'#f4efe6',-BW-3.4+((i%2)*3),.2,z+1.1);}
  gnd(-BW-40,-134,40,90);gnd(BW+30,-135,56,90);
  for(let r=0;r<6;r++)for(let z=CZ1-2;z>BZ+6;){z-=H(BW+4+r*3.6,z,-Math.PI/2,r,r*1.4)+.05;}
  const rk=add(g,new T.CylinderGeometry(7,9,3,8),'#a89c88',18,-.5,-150);rk.scale.set(1,1,.8);add(g,new T.CylinderGeometry(5,6.5,1.4,8),'#8aa86a',18,1.6,-150);light(19,-151,2.2);isl.push([18,-150,9.5]);
  add(g,new T.CylinderGeometry(3,4,1.8,7),'#9a907e',-20,-.2,-160);isl.push([-20,-160,4.6]);
  for(let i=0;i<7;i++){const x=-BW-14+rnd()*8,z=-106-i*9;add(g,new T.CylinderGeometry(.13,.2,4,6),'#9a7a50',x,2,z).rotation.z=.15;for(let k=0;k<5;k++){const lf=add(g,new T.BoxGeometry(2.2,.05,.5),'#4f8a44',x+.3,4,z);lf.rotation.y=k*Math.PI/2.5;lf.rotation.z=-.35;}}
  // 바깥 바다 (뒤) 막는 낮은 바위
  for(let x=-BW;x<=BW;x+=5)if(Math.abs(x)>12)add(g,new T.DodecahedronGeometry(2.2,0),'#9a9488',x,-.3,BZ-1);}
 if(v==='C'){/* v156 절벽 마을 (C 다듬기): 만을 ㄷ자로 감싼 계단식 언덕 — 층마다 길·집·계단, 뒤쪽 가운데 협곡으로 바다와 이어지고 양쪽 끝에 등대, 꼭대기 넓은 언덕에 성당·종탑·나무, 멀리 산 */
  const TW=4.4,TH=2.6,RN=6,yT=r=>r*TH+.4,G=r=>8+r*1.3,cliffC='#c9a77a',paveC='#e4d6b8',grassC='#9fbf7a';
  const lampY=(x,y,z)=>{const gg=new T.Group();gg.position.y=y;g.add(gg);lamp(gg,x,z);};
  const slab=(x0,x1,z0,z1,y,c)=>{if(x1-x0<.2||z1-z0<.2)return;bx(g,x1-x0,y+1.2,z1-z0,cliffC,(x0+x1)/2,(y-1.2)/2,(z0+z1)/2);bx(g,x1-x0+.02,.12,z1-z0+.02,c||paveC,(x0+x1)/2,y+.02,(z0+z1)/2);};
  const FZ=CZ1+2;/* 앞쪽(운하 쪽) 끝 */
  for(let r=0;r<=RN;r++){const y=yT(r),a=BW+r*TW,b=a+TW,zb=BZ-r*TW,zc=zb-TW;
   [-1,1].forEach(q=>{slab(q<0?-b:a,q<0?-a:b,zc,FZ,y);});/* 양옆 층 (뒤 모서리까지) */
   const gp=G(r);slab(-a,-gp,zc,zb,y);slab(gp,a,zc,zb,y);/* 뒤쪽 층 · 가운데 협곡 */}
  /* 꼭대기 넓은 언덕 (밖으로 튀어나오지 않게 층과 딱 맞게) */{const y=yT(RN+1),a=BW+(RN+1)*TW,zb=BZ-(RN+1)*TW,O=34;[-1,1].forEach(q=>slab(q<0?-(a+O):a,q<0?-a:a+O,zb-O,FZ,y,grassC));slab(-a,-G(RN+1),zb-O,zb,y,grassC);slab(G(RN+1),a,zb-O,zb,y,grassC);
   /* 협곡 양쪽 벽 */[-1,1].forEach(q=>{for(let r=0;r<=RN+1;r++){const gp=G(r);bx(g,.6,yT(r)+1.2,TW,'#b8956a',q*(gp+.3),(yT(r)-1.2)/2,BZ-r*TW-TW/2);}});
   /* 언덕 위: 성당 · 종탑 · 집 · 나무 */const cy=y;bx(g,8,6,10,'#f4efe6',-22,cy+3,zb-12);add(g,new T.SphereGeometry(3.4,18,10,0,Math.PI*2,0,Math.PI/2),'#4a7aa8',-22,cy+6,zb-12);add(g,new T.ConeGeometry(.45,1.8,8),'#f2c64a',-22,cy+10.3,zb-12);
   bx(g,3.2,12,3.2,'#efe2c8',22,cy+6,zb-8);const sp=add(g,new T.ConeGeometry(2.4,4.4,4),'#8a4a3a',22,cy+14.2,zb-8);sp.rotation.y=Math.PI/4;add(g,new T.CylinderGeometry(.55,.55,.1,16),'#f4efe6',22,cy+9.6,zb-6.35).rotation.x=Math.PI/2;
   for(let i=0;i<26;i++){const q=i%2?1:-1,x=q*(a+4+rnd()*26),z=FZ-6-rnd()*(FZ-(zb-O)-10);if(rnd()<.55)H(x,z,q<0?Math.PI/2:-Math.PI/2,1,y);else TR.push({x,z,y,s:1.4+rnd()*.5});}
   for(let i=0;i<10;i++){const x=-a+8+i*((2*a-16)/9);if(Math.abs(x)<G(RN+1)+3||Math.abs(x+22)<7||Math.abs(x-22)<4)continue;TR.push({x,z:zb-20-rnd()*10,y,s:1.5});}
   /* 멀리 산 (가운데 협곡 너머 바다는 보이게 비워요) */for(let i=0;i<10;i++){const x=(i%2?1:-1)*(46+Math.floor(i/2)*30+rnd()*8);const m=add(g,new T.ConeGeometry(30+rnd()*16,26+rnd()*16,7),['#8aa86a','#7a9a5e','#9ab878'][i%3],x,y-4,zb-O-30-rnd()*30);m.castShadow=false;}}
  /* 운하 쪽 앞면: 층마다 초록 비탈로 덮어서 절벽 벽이 튀어나와 보이지 않게 */for(let r=0;r<=RN+1;r++){const y=yT(r),a=BW+r*TW,b=r>RN?a+34:a+TW,len=Math.max(1,y*1.25),L=Math.hypot(len,y),ang=Math.atan2(y,len);[-1,1].forEach(q=>{const m=new T.Mesh(new T.BoxGeometry(b-a+.05,.5,L),M(grassC));m.position.set(q*(a+b)/2,y/2-.2,FZ+len/2);m.rotation.x=ang;m.receiveShadow=true;g.add(m);if(r>0&&r%2===0)for(let k=0;k<2;k++){const t=.3+rnd()*.4;TR.push({x:q*(a+1+rnd()*(b-a-2)),z:FZ+len*t,y:y*(1-t)-.2,s:1.2});}});}
  /* 층마다 집 (만을 바라보게) · 계단 · 가로등 · 사이프러스 · 발코니 */const CYP=new T.ConeGeometry(.55,3.4,7),cypM=M('#3f6a3a');
  for(let r=0;r<=RN;r++){const y=yT(r),a=BW+r*TW,zb=BZ-r*TW,hx=TW-1.3;/* 집 깊이 3.0 · 앞 길 1.3 */
   const st=[];for(let k=0;k<3;k++)st.push(FZ-14-k*20-((r*7)%9));
   [-1,1].forEach(q=>{const xh=q*(a+1.3+1.5);for(let z=FZ-2;z>zb+.6;){if(st.some(s=>z<s+1.5&&z>s-4.6)){z-=1;continue;}if(rnd()<.06){const c=new T.Mesh(CYP,cypM);c.position.set(xh,y+1.7,z-1);c.castShadow=true;g.add(c);z-=2.2;continue;}const w0=2.4+rnd()*1.4,w=H(xh,z-w0/2,q<0?Math.PI/2:-Math.PI/2,r%3,y,w0);
     if(rnd()<.3)bx(g,.5,.12,Math.min(1.6,w-.6),PAL[(r*3+Math.round(z))%PAL.length],q*(a+1.3)+q*.05*-1,y+2.6,z-w/2);z-=w+.08;}
    if(r<RN)st.forEach(s=>{for(let i=0;i<6;i++)bx(g,1.0,(i+1)*TH/6,.62,'#d8c9a8',q*(a+TW-.5),y+(i+1)*TH/12,s-i*.62);});
    for(let z=FZ-8;z>zb+3;z-=11)lampY(q*(a+.45),y,z);});
   const zh=zb-1.3-1.5;for(let x=-a+1;x<a-1;){const gp=G(r);if(Math.abs(x)<gp+.6){x=gp+.6;continue;}const w0=2.4+rnd()*1.4;if(Math.abs(x+w0/2)<gp+w0/2+.3){x+=.5;continue;}const w=H(x+w0/2,zh,0,r%3,y,w0);if(rnd()<.3)bx(g,Math.min(1.6,w-.6),.12,.5,PAL[(r+Math.round(x))%PAL.length],x+w0/2,y+2.6,zb-1.3);x+=w+.08;}
   for(let x=-a+5;x<a-3;x+=11)if(Math.abs(x)>G(r)+1)lampY(x,y,zb-.45);}
  /* 부두(층 0) 디테일: 배 · 통 · 나무 상자 · 그물 · 협곡 끝 등대 */
  bx(g,10,.2,3,'#a0784e',-BW+6,.3,-152);boat(-BW+5,-148,Math.PI/2,'#3a6aa8');boat(-BW+9,-156,Math.PI/2,'#d8705a');boat(BW-6,-120,-Math.PI/2,'#2f7a5a');boat(BW-6,-135,-Math.PI/2,'#e8a040');boat(-14,BZ+3,0,'#f4efe6');boat(16,BZ+3.4,.2,'#3a6aa8');
  for(let i=0;i<14;i++){const q=i%2?1:-1,z=-104-i*4.5;if(rnd()<.5)add(g,new T.CylinderGeometry(.32,.32,.7,10),'#8a5a32',q*(BW+.6),.75,z);else bx(g,.7,.6,.7,'#b88a5a',q*(BW+.6),.7,z);}
  [-1,1].forEach(q=>{light(q*(G(0)+1.6),BZ-1.6,.4);});}
 /* 만 앞쪽 양옆 빈 땅 채우기 */[-1,1].forEach(q=>{for(let gx=0;gx<6;gx++)for(let gz=0;gz<5;gz++){const x=q*(W/2+Q+27+gx*5.2),z=CZ1+4+gz*5.5;if(Math.abs(x)>BW+30||(v==='A'&&Math.abs(x)<BW+2&&z<CZ1+10)||v==='C')continue;if(rnd()<.72)H(x,z,q<0?Math.PI/2:-Math.PI/2,1,0);else TR.push({x,z,s:1.3});}});
 town(g,L);trees(g,TR);
 return {sail:(lx,z)=>z<CZ1-1&&z>BZ+2&&Math.abs(lx)<BW-2.5&&!isl.some(([x,zz,r])=>Math.hypot(lx-x,z-zz)<r),fishZone:[OX,-140]};}

/* v156 시안: 눈 내린 마을 — 풀은 눈밭, 지붕·나무·나무 데크엔 눈, 길은 살짝 하얗게, 부두에 반짝이 전구 · 꼭대기 큰 트리 */
function snowify(root){const WH=new T.Color('#f4f7fb'),hsl={},MC=new Map();
 const fix=m=>{if(!m||!m.color||LIT.includes(m)||m.transparent||m.emissiveIntensity>0&&m.emissive&&m.emissive.getHex())return m;if(MC.has(m))return MC.get(m);m.color.getHSL(hsl);let t=0;
  if(hsl.h>.17&&hsl.h<.47&&hsl.s>.12)t=.9;/* 초록 → 눈밭 */else if(hsl.h<.11&&hsl.l<.47&&hsl.s>.15)t=.72;/* 지붕·나무 → 눈 덮임 */else if(hsl.h<.17&&hsl.l>.62&&hsl.s<.45)t=.45;/* 길·돌 → 살짝 하얗게 */
  const n=t?m.clone():m;if(t)n.color.lerp(WH,t);MC.set(m,n);return n;};
 root.traverse(o=>{if(!o.isMesh)return;if(o.isInstancedMesh&&o.instanceColor&&(o.userData.roof||o.userData.leaf)){const a=o.instanceColor.array,c=new T.Color();for(let i=0;i<a.length;i+=3){c.setRGB(a[i],a[i+1],a[i+2]).lerp(WH,o.userData.roof?.78:.62);a[i]=c.r;a[i+1]=c.g;a[i+2]=c.b;}o.instanceColor.needsUpdate=true;return;}
  if(Array.isArray(o.material))o.material=o.material.map(fix);else o.material=fix(o.material);});}
function winterDeco(g,lines,tree){/* 반짝이 전구: 색마다 전구 1개 + 은은한 빛무리 1개 (인스턴스) — 밤에 빛무리가 커져요 */const cols=['#ff5a5a','#ffd36a','#7fe0ff','#9aff9a','#ff9ad8'],P=cols.map(()=>[]);let k=0;
 lines.forEach(([x0,y,z0,x1,z1])=>{const n=Math.max(2,Math.round(Math.hypot(x1-x0,z1-z0)/.7));for(let i=0;i<=n;i++){const t=i/n,sag=Math.abs(Math.sin(t*n*Math.PI/4))*.22;P[(k++)%cols.length].push([x0+(x1-x0)*t,y-sag,z0+(z1-z0)*t]);}});
 if(tree){const [x,y,z]=tree;for(let i=0;i<4;i++){const c=add(g,new T.ConeGeometry(2.6-i*.55,2.4,9),new T.MeshStandardMaterial({color:'#2f6a44',roughness:.8,flatShading:true}),x,y+1.6+i*1.5,z);c.material.color.lerp(new T.Color('#f4f7fb'),.35);}const st=add(g,new T.OctahedronGeometry(.5,0),new T.MeshStandardMaterial({color:'#ffd36a',emissive:'#ffc23a',emissiveIntensity:2.2}),x,y+8.4,z);
  for(let i=0;i<60;i++){const a=i*2.4,h=i/60,r=(2.5-h*2.1)*1.02;P[i%cols.length].push([x+Math.cos(a)*r,y+1.2+h*6.4,z+Math.sin(a)*r]);}}
 const bg=new T.SphereGeometry(.13,8,6),hg=new T.SphereGeometry(.3,10,8),m4=new T.Matrix4(),HALO=[];
 cols.forEach((c,ci)=>{const L=P[ci];if(!L.length)return;const B=new T.InstancedMesh(bg,new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:2.6}),L.length),Hm=new T.MeshBasicMaterial({color:c,transparent:true,opacity:.18,blending:T.AdditiveBlending,depthWrite:false}),Hh=new T.InstancedMesh(hg,Hm,L.length);
  L.forEach((p,i)=>{m4.makeTranslation(p[0],p[1],p[2]);B.setMatrixAt(i,m4);Hh.setMatrixAt(i,m4);});B.frustumCulled=Hh.frustumCulled=false;g.add(B);g.add(Hh);HALO.push(Hm);});
 return HALO;}

if(V)backRows(root);const BAY=V?bay(V):null;
// 바다 · 마을
const SZ=-150;if(!BAY){const SEA=new T.Group();SEA.position.z=SZ;root.add(SEA);/* v155: 바다 물이 운하 안쪽(-50~-100)까지 겹쳐서 운하 중간 색이 달라 보이던 문제 → 운하 끝부터 시작 · 살짝 아래 */const wa=water(300,152,'#3a9ec0',38);wa.position.set(0,-.07,-24);SEA.add(wa);
 // 운하 끝에서 바다로 이어지는 양쪽 방파제
 [-1,1].forEach(q=>{bx(SEA,60,1,1.2,'#9a9488',q*(W/2+30.6),.2,CZ1-SZ+.6);const gd=new T.Mesh(new T.PlaneGeometry(140,20),M('#9fbf7a'));gd.rotation.x=-Math.PI/2;gd.position.set(q*(W/2+70),.02,CZ1-SZ+10);SEA.add(gd);});
 const cliff=add(SEA,new T.CylinderGeometry(26,30,6,9),'#c9a77a',0,-1,-70);cliff.scale.set(2.2,1,.6);
 const hill=add(SEA,new T.CylinderGeometry(18,26,9,8),'#8aa86a',-6,1.5,-80);hill.scale.set(2.4,1,.7);
 add(SEA,new T.BoxGeometry(110,.3,6),'#ecd9a8',0,.05,-52);bx(SEA,110,.8,1.2,'#9a9488',0,.2,-48.6);
 for(let i=0;i<34;i++){const x=-44+i*2.7+rnd()*.6,zz=-58-rnd()*16,yy=1.4+(zz<-64?4:0)+rnd()*.6;const h=house(SEA,x,zz,0,1.8+rnd()*.8,2.2,2.6+rnd()*2.4,PAL[(i*5)%PAL.length],rnd()<.5?0:2);h.position.y=yy;}
 bx(SEA,1.6,.3,16,'#b89070',24,.25,-42);add(SEA,new T.CylinderGeometry(.7,.95,6,12),'#f6f2ea',24,3,-34.5);for(let i=0;i<3;i++)add(SEA,new T.CylinderGeometry(.82-i*.07,.86-i*.07,.6,12),'#d84a3a',24,1+i*1.8,-34.5);add(SEA,new T.CylinderGeometry(.55,.55,.7,10),new T.MeshStandardMaterial({color:'#fff1c4',emissive:'#ffd27a',emissiveIntensity:1.2}),24,6.35,-34.5);add(SEA,new T.ConeGeometry(.8,.8,10),'#d84a3a',24,7.1,-34.5);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,b=new T.Group();b.position.set(Math.cos(a)*22,0,-14+Math.sin(a)*12);SEA.add(b);add(b,new T.CylinderGeometry(.22,.3,.5,10),'#ff7a3a',0,.15,0);add(b,new T.CylinderGeometry(.23,.23,.08,10),'#ffffff',0,.32,0);}}
// 다닐 수 있는 물 · 낚시할 수 있는 곳 (월드 좌표)
const canSail=(x,z)=>{const lx=x-OX;if(z<=CZ0&&z>=CZ1-1&&Math.abs(lx)<W/2-.7)return true;if(BAY)return BAY.sail(lx,z);if(z<CZ1-1&&z>SZ-46&&Math.abs(lx)<95)return z<CZ1-2||Math.abs(lx)<W/2-.7;return false;};
const fishable=(x,z)=>z<CZ1-4&&canSail(x,z);
let HALO=[];if(SNOW){snowify(root);{const BW=46,BZ=-168,TW=4.4,TH=2.6,FZ=CZ1+2,G=r=>8+r*1.3,yT=r=>r*TH+.4,L=[];for(let r=0;r<=3;r++){const a=BW+r*TW+1.25,y=yT(r)+3.2,zb=BZ-r*TW-1.25;L.push([-a,y,FZ-2,-a,zb],[a,y,FZ-2,a,zb],[-a,y,zb,-G(r)-.5,zb],[G(r)+.5,y,zb,a,zb]);}
 for(let z=CZ0-2;z>CZ1+3;z-=6){[-1,1].forEach(q=>L.push([q*(W/2+Q+.4),3.6,z,q*(W/2+Q+.4),z-5.2]));}/* 운하 양쪽 */
 HALO=winterDeco(root,L,[-34,18.6,BZ-7*TW-6]);}}
const night=v=>{v=Math.max(0,Math.min(1,+v||0));LIT.forEach(m=>{m.emissiveIntensity=v*1.15;});HALO.forEach(m=>{m.opacity=.06+.22*v;});};night(0);
return {night,group:root,water:canSail,fishable,spawn:[OX,CZ0-4,Math.PI],fishZone:BAY?BAY.fishZone:[OX,SZ-14]};}
return {build};})();
