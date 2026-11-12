// 피쉬코지 v136 시안 — 낚싯대 3D 외형 v2 (아이콘 그림과 비슷하게)
// 바뀌는 점: 가이드 고리 · 손잡이(코르크·끝마개) · 릴(스풀·옆판·손잡이·노브) · 낚싯대마다 장식
//  대나무 마디 · 산호 조개 릴과 밧줄 감기 · 벚꽃 꽃잎 · 용 머리 · 불꽃 그라데이션 · 별 무늬와 별 장식 · 초승달 릴 · 빛나는 구슬 · 고리
// 같은 NK_ROD3D(k, star) 모양으로 돌려줘요 (userData.tip · glow) → 게임 코드는 그대로
(function(){
const P={
 bamboo:{len:2.0,seg:['#c49a5c','#a87c44'],node:'#7a5530',grip:'#6a4426',wrap:'#3f2a1a'},
 carbon:{len:2.3,seg:['#23252e','#2c2f3a'],band:'#3a7ad8',guide:'#c8d0dc',grip:'#1b1d24',reel:{c:'#2f63c4',plate:'#dfe6f0',knob:'#1b1d24'}},
 silver:{len:2.4,seg:['#e6eaf0','#c6ced8'],band:'#8a96a6',guide:'#8a96a6',grip:'#3a3f48',reel:{c:'#eef2f6',plate:'#9aa4b0',knob:'#2b2f36'}},
 gold:{len:2.5,seg:['#f4c64e','#e2aa2e'],band:'#c8323a',guide:'#fff1b0',grip:'#b8282e',reel:{c:'#f2c04a',plate:'#c8323a',knob:'#7a1a1e'},tip:'#fff2a0'},
 coral:{len:2.3,seg:['#62cfc6','#3fb0a6'],band:'#f0d6a8',guide:'#f6e6c8',grip:'#3fb0a6',wrap:'#e8cf9a',reel:{c:'#f8d2c0',shell:1},tip:'#c8fff6'},
 sakura:{len:2.4,seg:['#f6c0cf','#eaa0b6'],band:'#e8c45a',guide:'#fff0c0',grip:'#e88aa6',reel:{c:'#f8d4de',plate:'#e8c45a',knob:'#e88aa6'},tip:'#ffd0e0',petal:1},
 star:{len:2.6,seg:['#24357a','#1b285e'],band:'#e8c45a',guide:'#ffe9a0',grip:'#16204a',reel:{c:'#2a3a7a',plate:'#e8c45a',knob:'#e8c45a'},tip:'#fff6a0',dots:'#ffe9a0',charm:'star'},
 dragon:{len:2.7,seg:['#3f9a6a','#2c7a50'],band:'#e8c45a',guide:'#ffe9a0',grip:'#1f5a3a',reel:{c:'#2f7a52',plate:'#e8c45a',knob:'#e8c45a'},tip:'#fff8c0',head:'#3f9a6a',scale:1},
 galaxy:{len:2.65,grad:['#2a1f78','#7a4ad8'],band:'#d8dcf0',guide:'#e8ecff',grip:'#1f1650',reel:{c:'#c8ccdc',moon:1},tip:'#fff6a0',dots:'#ffffff',charm:'star'},
 abyss:{len:2.75,grad:['#f2ecdc','#2a6a9a'],band:'#7fe0f0',guide:'#bff4ff',grip:'#1f4f78',reel:{c:'#2a6a9a',moon:1},tip:'#a0f4ff',orb:1},
 heaven:{len:2.8,seg:['#fbf9f2','#ece6d4'],band:'#e8c45a',guide:'#fff2b0',grip:'#f6f2e6',reel:{c:'#f6f4ec',orbReel:'#8af4e0'},tip:'#8af4e0',orb:1,spark:1},
 fire:{len:2.8,grad:['#b8180e','#ffb02a'],band:'#e8c45a',guide:'#ffe08a',grip:'#7a1a10',reel:{c:'#c8201c',plate:'#e8c45a',knob:'#ffd060'},tip:'#ffd060',orb:1,flame:1,head:'#e8401c'},
 master:{len:2.75,seg:['#fdfbf6','#f1ece2'],band:'#e8c45a',guide:'#ffe9a0',grip:'#f6f1e6',reel:{c:'#fbf8f2',ring:1},tip:'#9ff0ff',orb:1,spark:1}};
const TEX={};
function glowTex(c){if(TEX[c])return TEX[c];const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'#fff');gr.addColorStop(.3,c);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return TEX[c]=new THREE.CanvasTexture(cv);}
function shapeTex(kind,c){const key=kind+c;if(TEX[key])return TEX[key];const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');x.fillStyle=c;x.translate(32,32);
 if(kind==='petal'){for(let i=0;i<5;i++){x.save();x.rotate(i*Math.PI*2/5);x.beginPath();x.ellipse(0,-14,8,14,0,0,Math.PI*2);x.fill();x.restore();}x.fillStyle='#f8e08a';x.beginPath();x.arc(0,0,5,0,7);x.fill();}
 else if(kind==='star'){x.beginPath();for(let i=0;i<10;i++){const r=i%2?11:28,a=-Math.PI/2+i*Math.PI/5;x.lineTo(Math.cos(a)*r,Math.sin(a)*r);}x.closePath();x.fill();}
 else if(kind==='flame'){const g=x.createRadialGradient(0,8,2,0,4,28);g.addColorStop(0,'#fff6c0');g.addColorStop(.35,'#ffb02a');g.addColorStop(.7,'rgba(232,64,28,.7)');g.addColorStop(1,'rgba(232,64,28,0)');x.fillStyle=g;x.beginPath();x.moveTo(0,-30);x.bezierCurveTo(18,-8,22,14,0,28);x.bezierCurveTo(-22,14,-18,-8,0,-30);x.fill();}
 return TEX[key]=new THREE.CanvasTexture(cv);}
const M=(c,o)=>{const m=new THREE.MeshLambertMaterial(Object.assign({},o||{}));m.color=new THREE.Color(c).convertSRGBToLinear();return m;};/* 아이콘처럼 진한 색 */
const lerpC=(a,b,t)=>'#'+new THREE.Color(a).lerp(new THREE.Color(b),t).getHexString();
window.NK_ROD3D_V2=function(k,star){const o=P[k]||P.bamboo,g=new THREE.Group(),n=6,L=o.len,base=.42;
 const rAt=y=>.066-.048*Math.min(1,Math.max(0,(y-base)/(L-base)));
 // 대(블랭크) — 마디마다 색 또는 그라데이션
 for(let i=0;i<n;i++){const y0=base+(L-base)*i/n,y1=base+(L-base)*(i+1)/n,h=y1-y0,col=o.grad?lerpC(o.grad[0],o.grad[1],(i+.5)/n):o.seg[i%2];const m=new THREE.Mesh(new THREE.CylinderGeometry(rAt(y1),rAt(y0),h,8),M(col));m.position.y=(y0+y1)/2;g.add(m);
  if(o.node){const nd=new THREE.Mesh(new THREE.CylinderGeometry(rAt(y1)*1.35,rAt(y1)*1.35,.045,8),M(o.node));nd.position.y=y1;if(i<n-1)g.add(nd);}
  if(o.band&&i<n-1&&i%2===1){const b=new THREE.Mesh(new THREE.CylinderGeometry(rAt(y1)*1.3,rAt(y1)*1.3,.03,8),M(o.band));b.position.y=y1;g.add(b);}
  // 가이드 고리 (낚싯줄 지나는 링)
  if(o.guide&&i>0){const gr=new THREE.Mesh(new THREE.TorusGeometry(.028-.01*i/n,.006,5,10),M(o.guide));gr.position.set(rAt(y0)+.03,y0,0);gr.rotation.y=Math.PI/2;g.add(gr);const st=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.03,4),M(o.guide));st.position.set(rAt(y0)+.012,y0,0);st.rotation.z=Math.PI/2;g.add(st);}}
 // 손잡이: 뒤 손잡이 + 끝마개 + 릴 시트
 const grip=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,.34,10),M(o.grip||'#6a4a30'));grip.position.y=.17;g.add(grip);
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.072,10,6,0,Math.PI*2,Math.PI/2,Math.PI/2),M(o.band||o.node||'#3a2a1a'));cap.position.y=0;g.add(cap);
 if(o.wrap){for(let i=0;i<7;i++){const w=new THREE.Mesh(new THREE.TorusGeometry(.086,.011,4,12),M(o.wrap));w.rotation.x=Math.PI/2;w.position.y=.04+i*.045;g.add(w);}}
 const seat=new THREE.Mesh(new THREE.CylinderGeometry(.05,.055,.1,10),M(o.band||'#555'));seat.position.y=.39;g.add(seat);
 // 릴
 if(o.reel){const R=o.reel,rg=new THREE.Group();rg.position.set(.14,.4,0);rg.scale.setScalar(1.6);g.add(rg);const leg=new THREE.Mesh(new THREE.BoxGeometry(.06,.025,.03),M(R.plate||R.c));leg.position.x=-.05;rg.add(leg);
  if(R.shell){const sh=new THREE.Mesh(new THREE.CircleGeometry(.12,10,0,Math.PI),M(R.c,{side:THREE.DoubleSide}));sh.rotation.z=-Math.PI/2;sh.position.set(.03,0,0);rg.add(sh);for(let i=0;i<5;i++){const rib=new THREE.Mesh(new THREE.BoxGeometry(.11,.008,.012),M('#e8a890'));rib.position.set(.03+.055*Math.sin(i/4*Math.PI),.055*Math.cos(i/4*Math.PI)-0,0.006);rib.rotation.z=Math.PI/2-i/4*Math.PI;rg.add(rib);}}
  else if(R.moon){const mo=new THREE.Mesh(new THREE.TorusGeometry(.085,.03,6,14,Math.PI*1.35),M(R.c));mo.rotation.y=Math.PI/2;mo.rotation.x=.4;mo.position.x=.03;rg.add(mo);}
  else if(R.ring){const ri=new THREE.Mesh(new THREE.TorusGeometry(.09,.018,6,18),M('#e8c45a'));ri.rotation.y=Math.PI/2;ri.position.x=.03;rg.add(ri);const gm=new THREE.Mesh(new THREE.SphereGeometry(.04,10,8),new THREE.MeshBasicMaterial({color:'#9ff0ff'}));gm.position.x=.03;rg.add(gm);}
  else{const sp=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.05,14),M(R.c));sp.rotation.z=Math.PI/2;sp.position.x=.02;rg.add(sp);const pl=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.012,14),M(R.plate||R.c));pl.rotation.z=Math.PI/2;pl.position.x=.05;rg.add(pl);
   if(R.orbReel){const ob=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),new THREE.MeshBasicMaterial({color:R.orbReel}));ob.position.x=.065;rg.add(ob);}
   const arm=new THREE.Mesh(new THREE.BoxGeometry(.012,.12,.02),M(R.plate||'#444'));arm.position.set(.065,.05,0);rg.add(arm);const kb=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),M(R.knob||'#222'));kb.position.set(.08,.11,0);rg.add(kb);}}
 // 장식
 if(o.dots){const dm=new THREE.MeshBasicMaterial({color:o.dots});for(let i=0;i<14;i++){const y=base+.2+(L-base-.3)*i/14,a=i*2.4,r=rAt(y);const d=new THREE.Mesh(new THREE.SphereGeometry(.007,4,3),dm);d.position.set(Math.cos(a)*r,y,Math.sin(a)*r);g.add(d);}}
 if(o.scale){const sm=M('#2a6a46');for(let i=0;i<10;i++){const y=base+.15+i*.17,r=rAt(y);const s=new THREE.Mesh(new THREE.ConeGeometry(.018,.05,4),sm);s.position.set(-r,y,0);s.rotation.z=.9;g.add(s);}}
 if(o.head){const hg=new THREE.Group();hg.position.set(0,L-.05,0);hg.scale.setScalar(1.7);g.add(hg);const hm=M(o.head);const sk=new THREE.Mesh(new THREE.BoxGeometry(.08,.1,.08),hm);hg.add(sk);const sn=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.11),hm);sn.position.set(0,-.01,.08);hg.add(sn);
  const hornM=M('#f4e2a0');[-1,1].forEach(s=>{const h=new THREE.Mesh(new THREE.ConeGeometry(.012,.09,4),hornM);h.position.set(.03*s,.07,-.02);h.rotation.x=-.5;hg.add(h);const e=new THREE.Mesh(new THREE.SphereGeometry(.009,4,3),new THREE.MeshBasicMaterial({color:'#ffe060'}));e.position.set(.04*s,.02,.04);hg.add(e);});
  const wh=new THREE.Mesh(new THREE.ConeGeometry(.01,.12,3),hornM);wh.position.set(.05,-.02,.09);wh.rotation.z=-1.2;hg.add(wh);}
 if(o.petal){for(let i=0;i<7;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:shapeTex('petal','#ffc6d6'),transparent:true,depthWrite:false}));sp.scale.setScalar(.14+Math.random()*.06);sp.position.set((Math.random()-.5)*.35,base+.3+Math.random()*(L-base-.4),(Math.random()-.5)*.35);sp.material.rotation=Math.random()*6;g.add(sp);}}
 if(o.flame){for(let i=0;i<8;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:shapeTex('flame','#ff8a1c'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(.16,.22,1);sp.position.set((Math.random()-.5)*.1,base+.2+(L-base-.3)*i/8,(Math.random()-.5)*.1);g.add(sp);}}
 if(o.spark){for(let i=0;i<6;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex('#fff2b0'),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar(.08);sp.position.set((Math.random()-.5)*.3,base+.5+Math.random()*(L-base-.6),(Math.random()-.5)*.3);g.add(sp);}}
 if(o.charm){const cs=new THREE.Sprite(new THREE.SpriteMaterial({map:shapeTex('star','#ffe060'),transparent:true,depthWrite:false}));cs.scale.setScalar(.22);cs.position.set(.03,L-.22,0);g.add(cs);const ln=new THREE.Mesh(new THREE.CylinderGeometry(.002,.002,.18,3),new THREE.MeshBasicMaterial({color:'#ffffff'}));ln.position.set(.03,L-.12,0);g.add(ln);}
 if(o.tip){const t=new THREE.Mesh(new THREE.SphereGeometry(o.orb?.06:.035,10,8),new THREE.MeshBasicMaterial({color:o.tip}));t.position.y=L;if(!o.head)g.add(t);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(o.tip),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar((o.orb?.5:.28)*(1+(star||0)*.08));sp.position.y=L;g.add(sp);g.userData.glow=sp;}
 const tip=new THREE.Object3D();tip.position.y=L;g.add(tip);g.userData.tip=tip;g.scale.setScalar(1/2.2);return g;};
window.NK_ROD3D_V2_P=P;})();
