// 낚멍 v5 어항 외관 빌더 (시안 1~6 → 게임 적용). 수조 바닥 = y0, 받침 높이 sh
// 반환: {g, cyl, R}  g에 프레임·받침·유리·물·모래 포함. 물고기는 호출 측에서 추가
window.NK_TANKX=function(design,o){
 const W=o.W,H=o.H,D=o.D,y0=o.y0,sh=o.sh,k=o.k||1,g=new THREE.Group(),Mc={};
 const M=(c,x)=>{const key=c+JSON.stringify(x||{});return Mc[key]||(Mc[key]=new THREE.MeshLambertMaterial(Object.assign({color:c},x||{})));};
 const box=(w,h,d,m,x,y,z)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);g.add(b);return b;};
 const edge=(c,t)=>[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>box(t*k,H,t*k,M(c),a*W/2,y0+H/2,b*D/2));
 const cyl=design===3||design===7,R=Math.min(W,D)/2*1.05;
 const glassM=new THREE.MeshLambertMaterial({color:'#e6faff',transparent:true,opacity:.16,side:THREE.BackSide,depthWrite:false});
 const waterM=new THREE.MeshLambertMaterial({color:'#8fd3dc',transparent:true,opacity:.24,depthWrite:false}),sandM=M('#f1e0b4');
 if(cyl){const gl=new THREE.Mesh(new THREE.CylinderGeometry(R,R,H,28,1,true),glassM);gl.position.y=y0+H/2;g.add(gl);const w=new THREE.Mesh(new THREE.CylinderGeometry(R*.98,R*.98,H*.9,28),waterM);w.position.y=y0+H*.45;g.add(w);
  const s=new THREE.Mesh(new THREE.CylinderGeometry(R*.98,R*.98,.16*k,28),sandM);s.position.y=y0+.08*k;g.add(s);}
 else{const gl=new THREE.Mesh(new THREE.BoxGeometry(W,H,D),glassM);gl.position.y=y0+H/2;g.add(gl);const w=new THREE.Mesh(new THREE.BoxGeometry(W-.02,H*.9,D-.02),waterM);w.position.y=y0+H*.45;g.add(w);box(W-.02,.16*k,D-.02,sandM,0,y0+.08*k,0);}
 const sy=y0-sh; // 받침 바닥
 if(design===1){const wd=M('#7a4e2e'),wd2=M('#93603a');box(W+.2*k,.14*k,D+.2*k,wd,0,y0+H+.07*k,0);box(W+.2*k,.14*k,D+.2*k,wd,0,y0-.02*k,0);edge('#7a4e2e',.08);
  box(W+.4*k,sh-.1*k,D+.3*k,wd2,0,sy+(sh-.1*k)/2,0);[-1,1].forEach(s=>{box(W/2-.15*k,sh-.4*k,.04*k,M('#a8724a'),s*W/4,sy+(sh-.1*k)/2,D/2+.16*k);box(.06*k,.06*k,.06*k,M('#d8b050'),s*.12*k,sy+(sh-.1*k)/2,D/2+.2*k);});}
 if(design===2){const lm=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W,H,D)),new THREE.LineBasicMaterial({color:'#bfe9f0'}));lm.position.y=y0+H/2;g.add(lm);
  box(W+.1*k,.05*k,D+.1*k,M('#f4f4f2'),0,y0-.03*k,0);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>box(.05*k,sh-.05*k,.05*k,M('#f4f4f2'),a*(W/2-.1*k),sy+(sh-.05*k)/2,b*(D/2-.1*k)));box(W-.4*k,.04*k,D-.3*k,M('#f4f4f2'),0,sy+sh*.3,0);
  box(W*.9,.05*k,.12*k,M('#ffffff',{emissive:'#e8fbff'}),0,y0+H+.08*k,0);}
 if(design===3){const ring=(r,h,y,c)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,28),M(c));m.position.y=y;g.add(m);};ring(R*1.14,.18*k,y0-.05*k,'#9a6a40');ring(R*.9,sh-.15*k,sy+(sh-.15*k)/2,'#b07a4c');ring(R*1.14,.14*k,y0+H+.07*k,'#9a6a40');}
 if(design===4){const dk=M('#3a2a22'),dk2=M('#5a4030');box(W+.2*k,.12*k,D+.2*k,dk,0,y0+H+.06*k,0);box(W+.2*k,.12*k,D+.2*k,dk,0,y0-.02*k,0);edge('#3a2a22',.1);
  const tg=new THREE.CylinderGeometry(.13*k,.13*k,D+.7*k,8,1,false,0,Math.PI),tm=M('#4a5058',{flatShading:true});for(let i=0;i<9;i++){const t=new THREE.Mesh(tg,tm);t.rotation.set(0,Math.PI/2,Math.PI/2);t.position.set(-W/2-.2*k+i*(W+.4*k)/8,y0+H+.28*k,0);g.add(t);}
  box(W+.6*k,.06*k,D+.8*k,dk,0,y0+H+.17*k,0);box(W+.7*k,.12*k,.16*k,M('#3a4048'),0,y0+H+.42*k,0);
  box(W+.3*k,sh-.1*k,D+.2*k,dk2,0,sy+(sh-.1*k)/2,0);for(let i=-6;i<=6;i++)box(.03*k,sh-.3*k,.02*k,dk,i*W/14,sy+(sh-.1*k)/2,D/2+.11*k);for(let j=0;j<4;j++)box(W,.03*k,.02*k,dk,0,sy+.2*k+j*(sh-.3*k)/4,D/2+.11*k);}
 if(design===5){const st=M('#2a2a2e');box(W+.1*k,.08*k,D+.1*k,st,0,y0+H+.04*k,0);box(W+.1*k,.08*k,D+.1*k,st,0,y0,0);edge('#2a2a2e',.06);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>box(.06*k,sh,.06*k,st,a*(W/2),sy+sh/2,b*(D/2)));box(W,.05*k,D,st,0,sy+sh*.25,0);
  box(.05*k,.9*k,.05*k,st,W/2+.1*k,y0+H+.45*k,-.3*k);box(1.1*k,.05*k,.05*k,st,W/2-.45*k,y0+H+.9*k,-.3*k);const shd=new THREE.Mesh(new THREE.ConeGeometry(.22*k,.25*k,12,1,true),M('#2a2a2e',{side:THREE.DoubleSide}));shd.position.set(W/2-1*k,y0+H+.8*k,-.3*k);g.add(shd);
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.07*k,8,6),new THREE.MeshBasicMaterial({color:'#fff0b0'}));bulb.position.set(W/2-1*k,y0+H+.66*k,-.3*k);g.add(bulb);}
 if(design===6){const lg=M('#8a6a48',{flatShading:true});[1,-1].forEach(s=>{const t=new THREE.Mesh(new THREE.CylinderGeometry(.25*k,.25*k,W+.6*k,10),lg);t.rotation.z=Math.PI/2;t.position.set(0,y0-.15*k,s*(D/2-.2*k));g.add(t);});
  box(W+.4*k,.1*k,D+.2*k,M('#a07a52'),0,y0+.02*k,0);edge('#6a4a30',.06);box(W+.1*k,.08*k,D+.1*k,M('#6a4a30'),0,y0+H+.04*k,0);
  const rg=new THREE.DodecahedronGeometry(1,0);let seed=7;const r=()=>(seed=(seed*9301+49297)%233280)/233280;const cols=['#a8a49a','#8f8a80','#c0bab0'];
  for(let i=0;i<22;i++){const m=new THREE.Mesh(rg,M(cols[i%3],{flatShading:true}));const s=(.18+r()*.12)*k;m.scale.setScalar(s);m.position.set((r()-.5)*W,sy+s+r()*(sh-.45*k-s),(r()-.5)*(D-.2*k));g.add(m);}}
 return {g,cyl,R};};

// v96 대형 어항 4종: 7 그랜드 원형(200) · 8 아치 돔(300) · 9 파노라마(400) · 10 산호초 벽면(500)
(function(){const base=window.NK_TANKX;window.NK_TANKX=function(design,o){const x=base(design,o);if(!(design>=7&&design<=10))return x;
 const g=x.g,W=o.W,H=o.H,D=o.D,y0=o.y0,sh=o.sh,k=o.k||1,sy=y0-sh,Mc={};const M=(c,e)=>{const key=c+JSON.stringify(e||{});return Mc[key]||(Mc[key]=new THREE.MeshLambertMaterial(Object.assign({color:c},e||{})));};
 const box=(w,h,d,m,px,py,pz)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(px,py,pz);g.add(b);return b;};
 const brass=M('#c9a46a'),glassM=new THREE.MeshLambertMaterial({color:'#e6faff',transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}),waterM=new THREE.MeshLambertMaterial({color:'#8fd3dc',transparent:true,opacity:.22,depthWrite:false});
 let seed=design*17;const r=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const plants=(n,w,d,cols)=>{for(let i=0;i<n;i++){const h=(.25+r()*.6)*k;const p=new THREE.Mesh(new THREE.ConeGeometry((.05+r()*.06)*k,h,5),M(cols[i%cols.length]));p.position.set((r()-.5)*w,y0+.14*k+h/2,(r()-.5)*d*.8-d*.1);p.rotation.z=(r()-.5)*.3;g.add(p);}};
 const rocks=(n,w,d)=>{const rg=new THREE.DodecahedronGeometry(1,0);for(let i=0;i<n;i++){const m=new THREE.Mesh(rg,M(['#9a9488','#b6ad9c','#7d776c'][i%3],{flatShading:true}));const sc=(.08+r()*.14)*k;m.scale.set(sc,sc*.6,sc);m.position.set((r()-.5)*w,y0+.14*k,(r()-.5)*d*.7);g.add(m);}};
 if(design===7){const R=Math.min(W,D)/2*1.05;const st=new THREE.Mesh(new THREE.CylinderGeometry(R+.18*k,R+.26*k,sh,40),M('#f6f1e8'));st.position.y=sy+sh/2;g.add(st);
  const t=new THREE.Mesh(new THREE.CylinderGeometry(R+.22*k,R+.22*k,.07*k,40),brass);t.position.y=y0;g.add(t);
  [[y0+H,.06],[y0+H*.5,.03]].forEach(([yy,th])=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(R+.03*k,th*k,8,48),brass);ring.rotation.x=Math.PI/2;ring.position.y=yy;g.add(ring);});
  const pil=new THREE.Mesh(new THREE.CylinderGeometry(.12*k,.16*k,H*.75,8),M('#b6ad9c',{flatShading:true}));pil.position.y=y0+H*.375;g.add(pil);plants(10,R*1.3,R*1.3,['#3f9a5a','#5fbf6a','#e8789c']);rocks(5,R*1.2,R*1.2);}
 if(design===8){box(W+.24*k,sh,D+.24*k,M('#f3eee4'),0,sy+sh/2,0);box(W+.3*k,.08*k,D+.3*k,brass,0,y0,0);const R=W/2,sc=.45;
  const half=(rr,dd,mat)=>{const s0=new THREE.Shape();s0.moveTo(-rr,0);s0.absarc(0,0,rr,Math.PI,0,true);s0.lineTo(-rr,0);const m=new THREE.Mesh(new THREE.ExtrudeGeometry(s0,{depth:dd,bevelEnabled:false,curveSegments:32}),mat);m.scale.y=sc;m.position.set(0,y0+H,-dd/2);g.add(m);};
  half(R,D,glassM);half(R-.04*k,D-.04*k,waterM);[1,-1].forEach(z=>{const a=new THREE.Mesh(new THREE.TorusGeometry(R,.045*k,8,40,Math.PI),brass);a.scale.y=sc;a.position.set(0,y0+H,z*(D/2+.01));g.add(a);});
  [-1,1].forEach(xx=>[-1,1].forEach(zz=>box(.06*k,H,.06*k,brass,xx*W/2,y0+H/2,zz*D/2)));plants(9,W-.4*k,D-.3*k,['#3f9a5a','#e8789c','#5fbf6a']);rocks(5,W-.5*k,D-.3*k);}
 if(design===9){box(W+.2*k,sh,D+.2*k,M('#4a3324'),0,sy+sh/2,0);box(W+.26*k,.08*k,D+.26*k,M('#2e2018'),0,y0,0);[-1,1].forEach(xx=>box(.05*k,sh-.3*k,.02*k,brass,xx*W*.25,sy+sh/2,D/2+.11*k));
  box(W+.12*k,.12*k,D+.12*k,M('#2e2018'),0,y0+H+.06*k,0);box(W-.2*k,.03*k,.08*k,new THREE.MeshBasicMaterial({color:'#bff3ff'}),0,y0+H+.13*k,D/2-.1*k);[-1,1].forEach(xx=>[-1,1].forEach(zz=>box(.05*k,H,.05*k,M('#2e2018'),xx*W/2,y0+H/2,zz*D/2)));
  plants(14,W-.4*k,D-.3*k,['#3f9a5a','#5fbf6a','#2f7a4a']);rocks(7,W-.5*k,D-.3*k);}
 if(design===10){box(W+.2*k,sh,D+.2*k,M('#2b3a4a'),0,sy+sh/2,0);for(let i=0;i<4;i++)box((W-.3*k)/4-.05*k,sh-.3*k,.02*k,M('#3c5068'),-W/2+.15*k+(i+.5)*(W-.3*k)/4,sy+sh/2,D/2+.11*k);
  box(W+.1*k,.1*k,D+.1*k,M('#1f2a36'),0,y0+H+.05*k,0);[-1,1].forEach(xx=>[-1,1].forEach(zz=>box(.05*k,H,.05*k,M('#1f2a36'),xx*W/2,y0+H/2,zz*D/2)));
  for(let i=0;i<18;i++){const c=['#ff7a6b','#ffb36b','#ff8fb8','#b98be0','#6fd3c2'][i%5],t=r();let m;if(t<.4)m=new THREE.Mesh(new THREE.ConeGeometry(.05*k,(.35+r()*.4)*k,5),M(c));else if(t<.75){m=new THREE.Mesh(new THREE.SphereGeometry((.09+r()*.09)*k,8,6),M(c));m.scale.y=.7;}else m=new THREE.Mesh(new THREE.TorusKnotGeometry(.06*k,.022*k,20,5),M(c));m.position.set((r()-.5)*(W-.4*k),y0+.22*k+r()*.2*k,(r()-.5)*(D-.4*k)-.1*k);g.add(m);}rocks(8,W-.4*k,D-.3*k);}
 return x;};})();
