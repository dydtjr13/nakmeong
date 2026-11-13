// v151 🏘 바닷가 마을 (테스트) — 유럽 운하를 지나 바닷가로. 배에서만 낚시, 바닷가에서는 내릴 수 없어요
window.NK_SEATOWN=(function(){
function build(T,OX){
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
const PAL=['#e9b872','#d8705a','#f1e3c8','#9ec3b8','#c8a0c8','#f0c8a8','#8fb0d8','#e6d48a','#b86a4a','#f4ead8','#a8c890'];
function house(g,x,z,face,w,d,h,col,kind){const H=new T.Group();H.position.set(x,0,z);H.rotation.y=face;g.add(H);
 bx(H,w,h,d,col,0,h/2,0);bx(H,w+.06,.12,d+.06,'#f4efe6',0,h+.02,0);
 // 지붕
 if(kind===0){const s=new T.Shape();s.moveTo(-w/2-.08,0);s.lineTo(w/2+.08,0);s.lineTo(0,w*.75);s.closePath();const ge=new T.ExtrudeGeometry(s,{depth:d+.1,bevelEnabled:false});ge.translate(0,0,-(d+.1)/2);add(H,ge,'#6a4438',0,h+.06,0);}
 else if(kind===1){for(let i=0;i<4;i++){const ww=w*(1-i*.22);bx(H,ww,.42,d*.98,col,0,h+.21+i*.42,.0);bx(H,ww+.06,.06,d,'#f4efe6',0,h+.42+i*.42,0);}const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,w*.7);s.closePath();const ge=new T.ExtrudeGeometry(s,{depth:d*.9,bevelEnabled:false});ge.translate(0,0,-d*.45-.04);add(H,ge,'#5a3a32',0,h,-.06);}
 else{const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,.3);s.quadraticCurveTo(w*.42,w*.62,0,w*.82);s.quadraticCurveTo(-w*.42,w*.62,-w/2,.3);s.closePath();const ge=new T.ExtrudeGeometry(s,{depth:.16,bevelEnabled:false});add(H,ge,col,0,h,d/2-.16);const s2=new T.Shape();s2.moveTo(-w/2+.05,0);s2.lineTo(w/2-.05,0);s2.lineTo(0,w*.7);s2.closePath();const g2=new T.ExtrudeGeometry(s2,{depth:d-.2,bevelEnabled:false});g2.translate(0,0,-d/2);add(H,g2,'#6a4438',0,h,0);bx(H,.06,.4,.06,'#f4efe6',0,h+w*.82+.15,d/2-.08);}
 // 창 (앞면 +z)
 const fl=Math.max(2,Math.floor((h-.6)/1.05));for(let r=0;r<fl;r++){const n=w>2.2?3:2;for(let i=0;i<n;i++){const x0=(i-(n-1)/2)*(w/n),y0=1.0+r*1.05+.35;bx(H,.5,.68,.06,'#f8f6f0',x0,y0,d/2+.01);bx(H,.38,.56,.07,'#3b4a5c',x0,y0,d/2+.02);bx(H,.04,.56,.08,'#f8f6f0',x0,y0,d/2+.03);if(r===0&&rnd()<.75){bx(H,.52,.12,.16,'#7a4a2a',x0,y0-.4,d/2+.1);for(let k=0;k<4;k++){const f=add(H,new T.SphereGeometry(.06,6,4),['#ff6a7a','#ffd25e','#ff9ec4','#ffffff'][(k+i)%4],x0-.18+k*.12,y0-.31,d/2+.14);}}}}
 bx(H,.62,1.05,.08,'#4a3a32',w>2.2?0:-(w/4),.52,d/2+.02);bx(H,.72,.08,.14,'#f4efe6',w>2.2?0:-(w/4),1.08,d/2+.06);return H;}
function tree(g,x,z,s){add(g,new T.CylinderGeometry(.09*s,.13*s,1.4*s,6),'#7a5a3a',x,.7*s,z);const c=add(g,new T.IcosahedronGeometry(.85*s,1),['#5f9a4a','#6aa85a','#4f8a44'][rnd()*3|0],x,1.75*s,z);c.scale.y=1.1;}
function lamp(g,x,z){add(g,new T.CylinderGeometry(.05,.07,2.4,6),'#2d3238',x,1.2,z);const l=add(g,new T.BoxGeometry(.24,.32,.24),new T.MeshStandardMaterial({color:'#fff1c4',emissive:'#ffc66a',emissiveIntensity:1.4}),x,2.5,z);bx(g,.32,.06,.32,'#2d3238',x,2.7,z);}

const root=new T.Group();root.position.set(OX,0,0);
const W=7.2,Q=2.6,CZ0=12,CZ1=-100;
// 운하
{const CANAL=new T.Group();root.add(CANAL);const wa=water(W+.2,CZ0-CZ1+4,'#3f7f86',10);wa.position.set(0,-.05,(CZ0+CZ1)/2);CANAL.add(wa);
 [-1,1].forEach(q=>{const gd=new T.Mesh(new T.PlaneGeometry(60,CZ0-CZ1+40),M('#9fbf7a'));gd.rotation.x=-Math.PI/2;gd.position.set(q*(W/2+1+30),.02,(CZ0+CZ1)/2-10);gd.receiveShadow=true;CANAL.add(gd);bx(CANAL,9,.06,CZ0-CZ1+20,'#b9b2a6',q*(W/2+Q+5.5),.06,(CZ0+CZ1)/2);});
 [-1,1].forEach(q=>{bx(CANAL,1.0,1.2,CZ0-CZ1,'#a0583e',q*(W/2+.5),-.5,(CZ0+CZ1)/2);bx(CANAL,Q,.12,CZ0-CZ1,'#c9bba4',q*(W/2+Q/2),.08,(CZ0+CZ1)/2);bx(CANAL,.16,.14,CZ0-CZ1,'#8a7a6a',q*(W/2+.06),.15,(CZ0+CZ1)/2);
  for(let z=CZ0,i=0;z>CZ1+2;i++){const w=1.8+rnd()*1.1,h=3.4+rnd()*2.8,kind=rnd()*3|0;house(CANAL,q*(W/2+Q+1.4),z-w/2,q<0?Math.PI/2:-Math.PI/2,w,2.8,h,PAL[(i*3+(q>0?5:0))%PAL.length],kind);z-=w+.04;}
  for(let z=CZ0-4;z>CZ1+2;z-=7.5){tree(CANAL,q*(W/2+1.0),z,1.15);lamp(CANAL,q*(W/2+.45),z-3.6);}
  for(let z=CZ0-18;z>CZ1+10;z-=17){const b=new T.Group();b.position.set(q*(W/2-.6),0,z+rnd()*4);CANAL.add(b);bx(b,.9,.3,2.6,['#3a6aa8','#2f7a5a','#b8483a'][rnd()*3|0],0,.05,0);bx(b,.75,.08,2.3,'#c9a070',0,.22,0);}});
 // 들어가는 곳 (호숫가 쪽) 막는 수문
 bx(CANAL,W+2,1.6,.6,'#8a5a3e',0,.4,CZ0+1.2);bx(CANAL,W+2.4,.2,.8,'#d8cbb6',0,1.25,CZ0+1.2);
 [-30,-68].forEach(z=>{const s=new T.Shape();s.moveTo(-W/2-1.2,-.6);s.lineTo(W/2+1.2,-.6);s.lineTo(W/2+1.2,2.6);s.lineTo(-W/2-1.2,2.6);s.closePath();const hole=new T.Path();hole.moveTo(-W/2+.3,-.6);hole.absarc(0,-.6,W/2-.3,0,Math.PI,false);s.holes.push(hole);const ge=new T.ExtrudeGeometry(s,{depth:2.4,bevelEnabled:false,curveSegments:24});ge.translate(0,0,-1.2);add(CANAL,ge,'#a8604a',0,0,z);bx(CANAL,W+2.6,.14,2.6,'#d8cbb6',0,2.66,z);[-1,1].forEach(e=>{for(let i=-5;i<=5;i++)bx(CANAL,.07,.5,.07,'#2d3238',i*.75,2.95,z+e*1.15);bx(CANAL,W+2.2,.06,.06,'#2d3238',0,3.2,z+e*1.15);});});}
// 바다 · 마을
const SZ=-150;{const SEA=new T.Group();SEA.position.z=SZ;root.add(SEA);const wa=water(300,200,'#3a9ec0',50);wa.position.set(0,-.05,0);SEA.add(wa);
 // 운하 끝에서 바다로 이어지는 양쪽 방파제
 [-1,1].forEach(q=>{bx(SEA,60,1,1.2,'#9a9488',q*(W/2+30.6),.2,CZ1-SZ+.6);const gd=new T.Mesh(new T.PlaneGeometry(140,20),M('#9fbf7a'));gd.rotation.x=-Math.PI/2;gd.position.set(q*(W/2+70),.02,CZ1-SZ+10);SEA.add(gd);});
 const cliff=add(SEA,new T.CylinderGeometry(26,30,6,9),'#c9a77a',0,-1,-70);cliff.scale.set(2.2,1,.6);
 const hill=add(SEA,new T.CylinderGeometry(18,26,9,8),'#8aa86a',-6,1.5,-80);hill.scale.set(2.4,1,.7);
 add(SEA,new T.BoxGeometry(110,.3,6),'#ecd9a8',0,.05,-52);bx(SEA,110,.8,1.2,'#9a9488',0,.2,-48.6);
 for(let i=0;i<34;i++){const x=-44+i*2.7+rnd()*.6,zz=-58-rnd()*16,yy=1.4+(zz<-64?4:0)+rnd()*.6;const h=house(SEA,x,zz,0,1.8+rnd()*.8,2.2,2.6+rnd()*2.4,PAL[(i*5)%PAL.length],rnd()<.5?0:2);h.position.y=yy;}
 bx(SEA,1.6,.3,16,'#b89070',24,.25,-42);add(SEA,new T.CylinderGeometry(.7,.95,6,12),'#f6f2ea',24,3,-34.5);for(let i=0;i<3;i++)add(SEA,new T.CylinderGeometry(.82-i*.07,.86-i*.07,.6,12),'#d84a3a',24,1+i*1.8,-34.5);add(SEA,new T.CylinderGeometry(.55,.55,.7,10),new T.MeshStandardMaterial({color:'#fff1c4',emissive:'#ffd27a',emissiveIntensity:1.2}),24,6.35,-34.5);add(SEA,new T.ConeGeometry(.8,.8,10),'#d84a3a',24,7.1,-34.5);
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,b=new T.Group();b.position.set(Math.cos(a)*22,0,-14+Math.sin(a)*12);SEA.add(b);add(b,new T.CylinderGeometry(.22,.3,.5,10),'#ff7a3a',0,.15,0);add(b,new T.CylinderGeometry(.23,.23,.08,10),'#ffffff',0,.32,0);}}
// 다닐 수 있는 물 · 낚시할 수 있는 곳 (월드 좌표)
const canSail=(x,z)=>{const lx=x-OX;if(z<=CZ0&&z>=CZ1-1&&Math.abs(lx)<W/2-.7)return true;if(z<CZ1-1&&z>SZ-46&&Math.abs(lx)<95)return z<CZ1-2||Math.abs(lx)<W/2-.7;return false;};
const fishable=(x,z)=>z<CZ1-4&&canSail(x,z);
return {group:root,water:canSail,fishable,spawn:[OX,CZ0-4,Math.PI],fishZone:[OX,SZ-14]};}
return {build};})();
