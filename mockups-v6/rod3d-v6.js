// 낚멍 v6 시안: 낚싯대 3D 외형 재디자인 (게임 미적용). NK_ROD3D(k,star)와 같은 인터페이스
(function(){
const T=THREE,mc={};
const M=(c,o={})=>{const k=c+JSON.stringify(o);if(mc[k])return mc[k];const m=new T.MeshPhongMaterial(Object.assign({color:c,shininess:o.metal?120:40,specular:o.metal?'#ffffff':'#333333'},o.emi?{emissive:o.emi,emissiveIntensity:o.ei||.6}:{},{flatShading:!!o.flat}));if(T.Color.prototype.convertSRGBToLinear&&window.NK_LIN){m.color.convertSRGBToLinear();m.specular.convertSRGBToLinear();if(o.emi)m.emissive.convertSRGBToLinear();}return mc[k]=m;};
const glowT={};function glow(c){if(glowT[c])return glowT[c];const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'#fff');g.addColorStop(.35,c);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return glowT[c]=new T.CanvasTexture(cv);}
const SP=(c,s)=>{const p=new T.Sprite(new T.SpriteMaterial({map:glow(c),transparent:true,depthWrite:false,blending:T.AdditiveBlending}));p.scale.setScalar(s);return p;};
const cyl=(r0,r1,h,m,seg=10)=>new T.Mesh(new T.CylinderGeometry(r1,r0,h,seg),m);
function starShape(r1,r2,n=5){const s=new T.Shape();for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=i/(n*2)*Math.PI*2+Math.PI/2;i?s.lineTo(Math.cos(a)*r,Math.sin(a)*r):s.moveTo(Math.cos(a)*r,Math.sin(a)*r);}return s;}
// 공통 빌더: 블랭크(구간별 색), 그립, 릴, 가이드, 팁
function build(o){const g=new T.Group(),L=o.len,n=o.segs.length;let y=0;
 // 그립
 const gr=cyl(o.gripR||.075,(o.gripR||.075)*.9,o.gripL||.5,M(o.grip,o.gripO||{}));gr.position.y=(o.gripL||.5)/2;g.add(gr);
 if(o.butt){const b=new T.Mesh(new T.SphereGeometry(.085,12,8),M(o.butt,{metal:1}));b.position.y=0;b.scale.y=.6;g.add(b);}
 if(o.wrap)for(let i=0;i<4;i++){const w=new T.Mesh(new T.TorusGeometry((o.gripR||.075)*1.02,.005,5,18),M(o.wrap,o.wrapO||{}));w.rotation.x=Math.PI/2;w.position.y=.1+i*.11;g.add(w);}
 // 리일시트(금속 링)
 const rs=cyl(.06,.06,.16,M(o.seat||'#888',{metal:1}));rs.position.y=(o.gripL||.5)+.08;g.add(rs);y=(o.gripL||.5)+.16;
 // 블랭크
 const rest=L-y;for(let i=0;i<n;i++){const h=rest/n,r0=.05-.034*i/n,r1=.05-.034*(i+1)/n;const s=cyl(r0,r1,h,M(o.segs[i],o.segO||{}),o.flat?6:10);s.position.y=y+h/2;g.add(s);
  if(o.band){const b=cyl(r1*1.6,r1*1.6,.03,M(o.band,{metal:1}));b.position.y=y+h;g.add(b);}
  // 가이드(라인 고리)
  if(o.guide&&i<n){const gd=new T.Mesh(new T.TorusGeometry(.03-.015*i/n,.006,6,14),M(o.guide,{metal:1}));gd.position.set(.055,y+h*.6,0);g.add(gd);const st=cyl(.005,.005,.04,M(o.guide,{metal:1}),4);st.rotation.z=Math.PI/2;st.position.set(.03,y+h*.6,0);g.add(st);}
  y+=h;}
 // 릴
 if(o.reel){const R=o.reel,rg=new T.Group();rg.position.set(.12,(o.gripL||.5)+.08,0);
  const ft=cyl(.014,.014,.1,M(R.c,{metal:1}),6);ft.rotation.z=Math.PI/2;ft.position.x=-.06;rg.add(ft);
  if(R.type==='spin'){const body=cyl(R.r*.8,R.r,.14,M(R.c,{metal:1}),16);body.position.set(.03,0,0);rg.add(body);const sp=cyl(R.r*.85,R.r*.85,.07,M(R.s||'#fff',{metal:1}),16);sp.position.set(.03,.1,0);rg.add(sp);const lip=new T.Mesh(new T.TorusGeometry(R.r*.85,.01,6,18),M(R.k||'#333',{metal:1}));lip.rotation.x=Math.PI/2;lip.position.set(.03,.14,0);rg.add(lip);
   const h=cyl(.008,.008,.1,M(R.h||R.c,{metal:1}),6);h.rotation.x=Math.PI/2;h.position.set(.03,-.02,.07);rg.add(h);const kn=new T.Mesh(new T.SphereGeometry(.02,8,6),M(R.k||'#333'));kn.position.set(.03,-.06,.12);rg.add(kn);}
  else{const sd=cyl(R.r,R.r,.09,M(R.c,{metal:1}),20);sd.rotation.x=Math.PI/2;sd.position.x=.03;rg.add(sd);[-.046,.046].forEach(z=>{const rim=new T.Mesh(new T.TorusGeometry(R.r,.013,6,22),M(R.s||'#e8c45a',{metal:1}));rim.position.set(.03,0,z);rg.add(rim);});const hub=cyl(.025,.025,.11,M(R.s||'#e8c45a',{metal:1}),10);hub.rotation.x=Math.PI/2;hub.position.x=.03;rg.add(hub);
   const h=cyl(.008,.008,.09,M(R.c,{metal:1}),6);h.rotation.z=Math.PI/2;h.position.set(.03,0,.06);h.position.y=-.0;rg.add(h);const kn=new T.Mesh(new T.SphereGeometry(.022,8,6),M(R.k||'#333'));kn.position.set(.08,0,.07);rg.add(kn);}
  if(R.shell){const sh=new T.Mesh(new T.SphereGeometry(R.r*1.05,12,6,0,Math.PI*2,0,Math.PI/2),M(R.shell,{flat:1}));sh.rotation.x=Math.PI/2;sh.position.set(.03,0,.05);rg.add(sh);for(let i=0;i<7;i++){const rb=new T.Mesh(new T.TorusGeometry(R.r*1.03,.006,4,10,Math.PI),M('#e8a08a'));rb.rotation.set(0,0,i/7*Math.PI);rb.position.set(.03,0,.055);rg.add(rb);}}
  if(R.orb){const ob=new T.Mesh(new T.SphereGeometry(.045,14,10),M(R.orb,{emi:R.orb,ei:.8}));ob.position.set(.03,0,.07);rg.add(ob);const sp=SP(R.orb,.16);sp.position.copy(ob.position);rg.add(sp);}
  g.add(rg);}
 // 팁 장식
 const tip=new T.Object3D();tip.position.y=L;g.add(tip);g.userData.tip=tip;
 if(o.tipFx)o.tipFx(g,L);
 if(o.deco)o.deco(g,L,y);
 g.scale.setScalar(1/2.2);return g;}
const P={
 dragon:{len:2.7,grip:'#9a1b1b',gripL:.55,wrap:'#e8c45a',wrapO:{metal:1},butt:'#e8c45a',seat:'#e8c45a',segs:['#b3202a','#1f7a4a','#b3202a','#1f7a4a','#b3202a','#1f7a4a'],segO:{flat:1},band:'#e8c45a',guide:'#e8c45a',
  reel:{c:'#1f7a4a',s:'#e8c45a',r:.1,k:'#b3202a',orb:'#ff3a3a'},
  deco:(g,L)=>{for(let i=0;i<34;i++){const a=i*.62,s=new T.Mesh(new T.ConeGeometry(.016,.045,4),M(i%2?'#2fa86a':'#c8282f',{flat:1}));s.position.set(Math.cos(a)*.052,.85+i*.045,Math.sin(a)*.052);s.rotation.set(Math.sin(a)*1.2,0,-Math.cos(a)*1.2);g.add(s);}},
  tipFx:(g,L)=>{const hd=new T.Group();const h=new T.Mesh(new T.ConeGeometry(.05,.16,6),M('#1f7a4a',{flat:1}));h.rotation.x=-Math.PI/2;hd.add(h);[-1,1].forEach(sx=>{const horn=new T.Mesh(new T.ConeGeometry(.012,.09,5),M('#e8c45a',{metal:1}));horn.position.set(sx*.03,.04,.04);horn.rotation.set(-.6,0,sx*.4);hd.add(horn);});const pearl=new T.Mesh(new T.SphereGeometry(.035,12,8),M('#ffdd55',{emi:'#ff8800',ei:.9}));pearl.position.set(0,0,-.1);hd.add(pearl);const sp=SP('#ff9a3a',.2);sp.position.copy(pearl.position);hd.add(sp);hd.position.y=L+.02;hd.rotation.x=Math.PI/2;g.add(hd);}},
 star:{len:2.6,grip:'#111114',gripL:.52,wrap:'#e8c45a',wrapO:{metal:1},butt:'#e8c45a',seat:'#e8c45a',segs:['#141418','#1a1a20','#141418','#1a1a20','#141418'],band:'#f2c94c',guide:'#f2c94c',reel:{c:'#141418',s:'#f2c94c',r:.095,k:'#f2c94c',type:'spin'},
  deco:(g,L)=>{[1.0,1.45,1.9].forEach((y,i)=>{const st=new T.Mesh(new T.ExtrudeGeometry(starShape(.05,.022),{depth:.015,bevelEnabled:false}),M('#f2c94c',{metal:1,emi:'#7a5a00',ei:.4}));st.position.set(0,y,.045);g.add(st);});},
  tipFx:(g,L)=>{const st=new T.Mesh(new T.ExtrudeGeometry(starShape(.085,.036),{depth:.025,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:1}),M('#ffe066',{emi:'#ffb400',ei:.8}));st.position.set(0,L+.06,-.012);g.add(st);const sp=SP('#ffd84a',.24);sp.position.set(0,L+.06,0);g.add(sp);}},
 gold:{len:2.5,grip:'#7a1020',gripL:.5,wrap:'#ffd76a',wrapO:{metal:1},butt:'#ffd76a',seat:'#ffd76a',segs:['#e8b830','#f2c94c','#e8b830','#f2c94c','#e8b830'],segO:{metal:1},band:'#c0182a',guide:'#ffe9a0',reel:{c:'#e8b830',s:'#c0182a',r:.1,k:'#c0182a'},
  tipFx:(g,L)=>{const gem=new T.Mesh(new T.OctahedronGeometry(.045),M('#e0203a',{emi:'#a00010',ei:.6}));gem.position.y=L+.04;g.add(gem);const sp=SP('#ffd76a',.16);sp.position.y=L+.04;g.add(sp);}},
 sakura:{len:2.4,grip:'#fff4f6',gripL:.48,wrap:'#f48fb1',seat:'#d8b4a0',segs:['#f8c8d8','#f6b4c8','#f8c8d8','#f6b4c8','#f8c8d8'],band:'#c2185b',guide:'#ffffff',reel:{c:'#fbe0e8',s:'#c2185b',r:.085,k:'#8d5a3a'},
  deco:(g,L)=>{for(let i=0;i<4;i++){const f=flower();f.position.set(0,1.0+i*.32,.04);f.rotation.z=i;g.add(f);}},tipFx:(g,L)=>{const f=flower(1.6);f.position.set(0,L,.03);g.add(f);}},
 coral:{len:2.3,grip:'#f6e7cf',gripL:.48,wrap:'#ff8a65',seat:'#2bb3a8',segs:['#2bb3a8','#4cc8b8','#ff9a7a','#ff7f6a'],band:'#fff1d6',guide:'#fff1d6',reel:{c:'#ff8a65',s:'#fff1d6',r:.1,shell:'#ffc4b0'},
  tipFx:(g,L)=>{const pr=new T.Mesh(new T.SphereGeometry(.04,14,10),M('#fffaf0',{metal:1}));pr.position.y=L+.03;g.add(pr);for(let i=0;i<3;i++){const br=cyl(.008,.012,.12,M('#ff6f61'),5);br.position.set(Math.cos(i*2.1)*.03,L-.12,Math.sin(i*2.1)*.03);br.rotation.z=(i-1)*.5;g.add(br);}}},
 silver:{len:2.4,grip:'#2a2f36',gripL:.5,seat:'#d8dde4',segs:['#d8dde4','#c4cbd4','#d8dde4','#c4cbd4','#d8dde4'],segO:{metal:1},guide:'#eef2f6',reel:{c:'#cfd6de',s:'#8a96a4',r:.09,type:'spin',k:'#2a2f36'}},
 carbon:{len:2.3,grip:'#1c1c1c',gripL:.5,seat:'#2f6fd8',segs:['#2a2a30','#34343c','#2a2a30','#34343c','#2a2a30'],band:'#2f6fd8',guide:'#9ab',reel:{c:'#2f6fd8',s:'#1a1a1a',r:.085,type:'spin',k:'#1a1a1a'}},
 bamboo:{len:2.0,grip:'#8a6438',gripL:.4,wrap:'#e8dcc0',seat:'#a07850',segs:['#c9a060','#b8904c','#c9a060','#b8904c','#c9a060','#b8904c'],band:'#7a5a30',guide:null},
};
function flower(s=1){const f=new T.Group();for(let i=0;i<5;i++){const p=new T.Mesh(new T.CircleGeometry(.03*s,8),M('#ffc0d4',{}));p.material.side=T.DoubleSide;p.position.set(Math.cos(i*1.256)*.03*s,Math.sin(i*1.256)*.03*s,0);f.add(p);}const c=new T.Mesh(new T.SphereGeometry(.014*s,6,4),M('#ffd54f'));f.add(c);return f;}
window.NK_ROD3D_V6=(k,star)=>build(P[k]||P.bamboo);window.NK_ROD3D_V6_P=P;})();
