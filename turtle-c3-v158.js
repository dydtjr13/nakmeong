// 피쉬코지 🐢 거북이 탈것 C (로우폴리) v3 — 시안 이미지 기반 코드 3D (Three.js r147)
// 커스텀 BufferGeometry + 정점 색 + flatShading → 부위별 메시 1개씩 (드로우콜 적음)
// 사용: const g=TURTLE_C3(); g.userData.setMode(t 0=지상~1=수상); g.userData.tick(dt,time,moving); 좌석 g.userData.seatL (월드 좌표로 캐릭터 배치)
(function(){
const T=THREE,V=(x,y,z)=>new T.Vector3(x,y,z);
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);},lerp=(a,b,t)=>a+(b-a)*t;
const MAT=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
const COL={};const col=h=>COL[h]||(COL[h]=new T.Color(h));
// ── 기하 빌더 ──
class GB{constructor(){this.p=[];this.c=[];}
 tri(a,b,c,h,ref){if(ref){const n=V().subVectors(b,a).cross(V().subVectors(c,a)),m=a.clone().add(b).add(c).multiplyScalar(1/3);if(n.dot(m.sub(ref))<0){const t=b;b=c;c=t;}}const C=col(h);for(const v of [a,b,c]){this.p.push(v.x,v.y,v.z);this.c.push(C.r,C.g,C.b);}}
 poly(P,h,ref){for(let i=1;i<P.length-1;i++)this.tri(P[0],P[i],P[i+1],h,ref);}
 mesh(cast){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));g.computeVertexNormals();const m=new T.Mesh(g,MAT);m.castShadow=cast!==false;m.receiveShadow=true;return m;}}
const newell=P=>{const n=V(0,0,0);for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];n.x+=(a.y-b.y)*(a.z+b.z);n.y+=(a.z-b.z)*(a.x+b.x);n.z+=(a.x-b.x)*(a.y+b.y);}return n.normalize();};
const cen=P=>P.reduce((s,v)=>s.add(v),V(0,0,0)).multiplyScalar(1/P.length);
// 비늘판: 홈(바탕) 위에 경사진 판을 올려요 (아래 넓게 · 위 좁게)
function plate(gb,P,top,side,o){o=o||{};const C=cen(P);let N=newell(P);if(N.dot(V().subVectors(C,o.ref||V(0,0,0)))<0)N.negate();const ib=o.ib||.93,it=o.it||.8,h=o.h||.06;
 const B=P.map(v=>C.clone().add(v.clone().sub(C).multiplyScalar(ib)).addScaledVector(N,.004)),U=P.map(v=>C.clone().add(v.clone().sub(C).multiplyScalar(it)).addScaledVector(N,h));
 const ref=C.clone().addScaledVector(N,-.4);gb.poly(U,top,ref);for(let i=0;i<P.length;i++){const j=(i+1)%P.length;gb.poly([B[i],B[j],U[j],U[i]],side,ref);}}
// 모서리 깎은 상자 (taper: y에 따라 x·z 비율) — 머리·목·다리·안장
function cbox(gb,c0,hx,hy,hz,ch,colf,o){o=o||{};const tp=o.taper||0,rot=o.rot;const X=(sx,sy,sz,k)=>{let x,y,z;if(k===0){x=sx*hx;y=sy*(hy-ch);z=sz*(hz-ch);}else if(k===1){x=sx*(hx-ch);y=sy*hy;z=sz*(hz-ch);}else{x=sx*(hx-ch);y=sy*(hy-ch);z=sz*hz;}const s=1-tp*(y/hy);let v=V(x*s,y,z*s);if(rot)v.applyEuler(rot);return v.add(c0);};
 const ref=c0.clone(),S=[1,-1],cf=(n)=>typeof colf==='function'?colf(n):colf;
 for(const sx of S){gb.poly([X(sx,1,1,0),X(sx,1,-1,0),X(sx,-1,-1,0),X(sx,-1,1,0)],cf('x'),ref);}
 for(const sy of S){gb.poly([X(1,sy,1,1),X(1,sy,-1,1),X(-1,sy,-1,1),X(-1,sy,1,1)],cf(sy>0?'top':'bot'),ref);}
 for(const sz of S){gb.poly([X(1,1,sz,2),X(1,-1,sz,2),X(-1,-1,sz,2),X(-1,1,sz,2)],cf(sz>0?'front':'back'),ref);}
 for(const sx of S)for(const sy of S)gb.poly([X(sx,sy,1,0),X(sx,sy,-1,0),X(sx,sy,-1,1),X(sx,sy,1,1)],cf(sy>0?'etop':'ebot'),ref);
 for(const sx of S)for(const sz of S)gb.poly([X(sx,1,sz,0),X(sx,-1,sz,0),X(sx,-1,sz,2),X(sx,1,sz,2)],cf('e'),ref);
 for(const sy of S)for(const sz of S)gb.poly([X(1,sy,sz,1),X(-1,sy,sz,1),X(-1,sy,sz,2),X(1,sy,sz,2)],cf(sy>0?'etop':'ebot'),ref);
 for(const sx of S)for(const sy of S)for(const sz of S)gb.tri(X(sx,sy,sz,0),X(sx,sy,sz,1),X(sx,sy,sz,2),cf(sy>0?'etop':'ebot'),ref);}
// 납작한 판(지느러미): 볼록 윤곽 (x 바깥 · z 앞) + 위아래 경사
function slab(gb,O,th,top,bot,side,inset){const C=O.reduce((s,p)=>[s[0]+p[0]/O.length,s[1]+p[1]/O.length],[0,0]),ref=V(C[0],0,C[1]);const k=inset||.86;
 const In=y=>O.map(p=>V(C[0]+(p[0]-C[0])*k,y,C[1]+(p[1]-C[1])*k)),Ou=O.map(p=>V(p[0],0,p[1]));const A=In(th),Bt=In(-th*.8);
 gb.poly(A,top,ref);gb.poly(Bt,bot,ref);for(let i=0;i<O.length;i++){const j=(i+1)%O.length;gb.poly([A[i],A[j],Ou[j],Ou[i]],side,ref);gb.poly([Ou[i],Ou[j],Bt[j],Bt[i]],bot,ref);}}

// ── 팔레트 (시안 C 이미지에서 추출 · 조명 전 바탕색) ──
const P={groove:'#4a3c22',plate:['#9d8f5c','#978957','#a39562','#928453'],plateS:'#776a42',rim:'#6f5d36',rimS:'#58492b',plast:'#c9b37a',plastD:'#a8925e',
 skin:'#90a862',skinS:'#7b9152',skinD:'#667b44',eye:'#16181a',seat:'#ecb441',seatS:'#d39a2c',seatD:'#b98422'};

function build(){const g=new T.Group(),body=new T.Group();g.add(body);const U=g.userData;U.body=body;U.limbs=[];U.mode=0;
 const SY=.74;// 땅에서 등껍질 테두리 높이
 // ── 등껍질: 고리 4단 (가장자리 12 · 아래 6 · 위 6 · 꼭대기 6각) ──
 const sh=new GB(),RX=1.04,RZ=1.24,ring=(n,y,s,off)=>{const a=[];for(let i=0;i<n;i++){const t=(i+(off||0))/n*Math.PI*2;a.push(V(Math.sin(t)*RX*s,y,Math.cos(t)*RZ*s));}return a;};
 const r0=ring(12,0,1.06,.5),r1=ring(12,.26,1.0,.5),r2=ring(6,.68,.86,0),r3=ring(6,1.0,.47,.5);
 // r2를 r1 짝수 꼭짓점 방향에 맞춰요 (오각형 판)
 for(let i=0;i<6;i++){const a=r1[2*i];const t=Math.atan2(a.x/RX,a.z/RZ);r2[i]=V(Math.sin(t)*RX*.86,.68,Math.cos(t)*RZ*.86);}
 for(let i=0;i<6;i++){const a=r2[i];const t=Math.atan2(a.x/RX,a.z/RZ);r3[i]=V(Math.sin(t)*RX*.47,1.0,Math.cos(t)*RZ*.47);}
 const ref=V(0,.25,0),top=V(0,1.08,0);
 // 바탕(홈)
 for(let i=0;i<12;i++){const j=(i+1)%12;sh.poly([r0[i],r0[j],r1[j],r1[i]],P.groove,ref);}
 for(let i=0;i<6;i++){const j=(i+1)%6;sh.poly([r1[2*i],r1[2*i+1],r1[(2*i+2)%12],r2[j],r2[i]],P.groove,ref);}
 for(let i=0;i<6;i++){const j=(i+1)%6;sh.poly([r2[i],r2[j],r3[j],r3[i]],P.groove,ref);}
 const capC=V(0,1.05,0);for(let i=0;i<6;i++)sh.tri(r3[i],r3[(i+1)%6],capC,P.groove,ref);
 // 판
 let k=0;const pc=()=>P.plate[(k++*7+3)%4];
 for(let i=0;i<12;i++){const j=(i+1)%12;plate(sh,[r0[i],r0[j],r1[j],r1[i]],P.rim,P.rimS,{ref,ib:.95,it:.84,h:.05});}
 for(let i=0;i<6;i++){const j=(i+1)%6;plate(sh,[r1[2*i],r1[2*i+1],r1[(2*i+2)%12],r2[j],r2[i]],pc(),P.plateS,{ref,ib:.9,it:.76,h:.07});}
 for(let i=0;i<6;i++){const j=(i+1)%6;plate(sh,[r2[i],r2[j],r3[j],r3[i]],pc(),P.plateS,{ref,ib:.9,it:.75,h:.07});}
 plate(sh,r3.map(v=>v.clone().setY(1.02)),pc(),P.plateS,{ref,ib:.92,it:.8,h:.05});
 // 배딱지 (아래)
 const pl=ring(12,-.02,.94,.5),pl2=ring(12,-.14,.72,.5);for(let i=0;i<12;i++){const j=(i+1)%12;sh.poly([r0[i],r0[j],pl[j],pl[i]],P.plastD,ref);sh.poly([pl[i],pl[j],pl2[j],pl2[i]],P.plast,ref);}sh.poly(pl2.slice().reverse(),P.plast,ref);
 const shell=sh.mesh();shell.position.y=SY;body.add(shell);
 // ── 안장: 꼭대기에 노란 방석 + 뒤 등받이 ──
 const st=new GB();const sc=n=>n==='top'||n==='etop'?P.seat:n==='bot'||n==='ebot'?P.seatD:P.seatS;
 cbox(st,V(0,1.11,-.02),.36,.05,.32,.03,sc);cbox(st,V(0,1.26,-.36),.3,.15,.07,.03,sc,{rot:new T.Euler(-.18,0,0)});
 const seat=st.mesh();seat.position.y=SY;body.add(seat);
 U.seatL=new T.Object3D();U.seatL.position.set(0,SY+1.27,-.1);body.add(U.seatL);U.seat=[0,SY+1.27,-.1];U.pose='sit';
 // ── 머리 · 목 (큰 각진 머리 · 앞면 네모 눈) ──
 const hd=new T.Group();hd.position.set(0,SY+.18,1.08);body.add(hd);U.head=hd;U.hp=hd.position.clone();
 const hg=new GB(),skc=n=>n==='top'||n==='etop'?P.skin:n==='bot'||n==='ebot'?P.skinD:n==='front'?P.skin:P.skinS;
 cbox(hg,V(0,-.02,.0),.2,.17,.3,.04,skc,{taper:-.05});// 목
 cbox(hg,V(0,.1,.46),.36,.32,.33,.06,skc);// 머리
 [-1,1].forEach(q=>{cbox(hg,V(q*.17,.2,.795),.05,.055,.012,.008,P.eye);});
 cbox(hg,V(0,-.04,.792),.18,.012,.01,.004,P.skinD);// 입선
 const hm=hg.mesh();hd.add(hm);
 // 꼬리
 const tg=new GB();cbox(tg,V(0,0,-.12),.09,.06,.14,.025,skc,{taper:.2});const tail=tg.mesh();tail.position.set(0,SY+.12,-1.2);tail.rotation.x=.3;body.add(tail);U.tail=tail;
 // ── 다리 4 (굵고 약간 가늘어지는 기둥 · 발 고리) + 지느러미 4 ──
 const legc=n=>n==='top'||n==='etop'?P.skin:n==='bot'||n==='ebot'?P.skinD:P.skinS;
 [[-.7,.62,1],[.7,.62,1],[-.68,-.66,0],[.68,-.66,0]].forEach(([x,z,f])=>{const q=Math.sign(x);
  const lg=new GB();cbox(lg,V(0,-.36,0),.26,.38,.26,.06,legc,{taper:-.1});cbox(lg,V(0,-.74,.03),.3,.05,.32,.03,legc);[-1,0,1].forEach(c=>cbox(lg,V(c*.15,-.765,.35),.045,.03,.035,.012,'#c8bf98'));
  const leg=lg.mesh();
  const fb=new GB(),O=f?[[0,.2],[.4,.24],[.85,.12],[1.18,-.16],[1.08,-.3],[.6,-.26],[0,-.16]]:[[0,.14],[.3,.12],[.58,-.06],[.55,-.22],[.25,-.2],[0,-.12]];
  slab(fb,O,.055,P.skin,P.skinD,P.skinS,.86);const fm=fb.mesh();fm.scale.x=q;const fl=new T.Group();fl.add(fm);fl.rotation.y=q*(f?-.35:-.55);
  const piv=new T.Group();piv.position.set(x,SY+.08,z);body.add(piv);const lgG=new T.Group();lgG.add(leg);leg.position.y=-.02;piv.add(lgG);const flG=new T.Group();flG.add(fl);piv.add(flG);
  U.limbs.push({piv,lgG,flG,q,f,ph:(x<0)===(z>0)?0:Math.PI,y0:SY+.08});});
 U.setMode=t=>{U.mode=t;};
 U.tick=(dt,time,moving)=>{const t=U.mode,e=sm(0,1,t),legT=sm(0,.6,t),finT=sm(.35,1,t),w=moving?1:0;
  body.position.y=lerp(0,-.64,e);
  for(const L of U.limbs){const sw=Math.sin(time*3.0+L.ph);L.lgG.rotation.set(sw*.3*w*(1-legT),0,L.q*legT*1.4);const s=1-legT*.85;L.lgG.scale.set(1-legT*.35,s,1-legT*.35);L.lgG.visible=s>.17;
   L.piv.position.y=L.y0+finT*.05;const fs=Math.max(.02,finT);L.flG.scale.set(fs,1,fs);L.flG.visible=finT>.02;
   const st=Math.sin(time*(L.f?5:6.2)+L.ph*.5)*finT*(moving?1:.4);L.flG.rotation.set(0,L.q*(L.f?st*.5:st*.3),L.q*(L.f?st*.28:.05));}
  body.rotation.z=Math.sin(time*1.7)*.04*e;body.rotation.x=Math.sin(time*1.3+1)*.025*e;body.position.y+=Math.sin(time*2.1)*.025*e+(moving?Math.abs(Math.sin(time*3.0))*.025*(1-e):0);
  hd.position.set(U.hp.x,U.hp.y+e*.1,U.hp.z+e*.05);hd.rotation.x=Math.sin(time*1.6)*.04-e*.08;tail.rotation.y=Math.sin(time*2.4)*.2;};
 return g;}
window.TURTLE_C3=build;
})();
