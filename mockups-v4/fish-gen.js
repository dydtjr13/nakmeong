// 어종별 로우폴리 물고기 3D 모델 생성기 (시안) — 머리 = -X
window.FISH_SPECS={
 crucian:{n:'붕어',H:.62,W:.32,tail:'fork',dor:[-.1,.55,.25],back:'#7d7a4a',belly:'#e6dcae',pat:'scale'},
 carp:{n:'잉어',H:.5,W:.32,tail:'fork',dor:[-.25,.75,.2],bar:2,back:'#a0783a',belly:'#f0d8a0',pat:'scale'},
 leather:{n:'향어',H:.55,W:.34,tail:'fork',dor:[-.2,.7,.2],bar:2,back:'#6a6a58',belly:'#d8d4c0',pat:'none'},
 bluegill:{n:'블루길',H:.7,W:.26,tail:'round',dor:[-.25,.8,.28],back:'#5a7a6a',belly:'#f0b060',pat:'bars',ear:1},
 bass:{n:'배스',H:.42,W:.3,tail:'cut',dor:[-.2,.7,.25],back:'#5f7a44',belly:'#e8e8d0',pat:'stripe',jaw:1},
 snakehead:{n:'가물치',H:.26,W:.26,tail:'round',dor:[-.4,1.2,.12],anal:[.05,.75],back:'#4a4a38',belly:'#c8c0a0',pat:'blotch',L:1.4},
 mandarin:{n:'쏘가리',H:.4,W:.28,tail:'round',dor:[-.3,.85,.3],spiny:1,back:'#b8a060',belly:'#f0e6c0',pat:'leopard',jaw:1},
 chambungeo:{n:'참붕어',H:.3,W:.2,tail:'fork',dor:[-.05,.4,.2],back:'#8a8a70',belly:'#e0e0d0',pat:'stripe',L:.8},
 pirami:{n:'피라미',H:.3,W:.18,tail:'fork',dor:[0,.35,.22],anal:[.15,.5],back:'#7a8aa0',belly:'#f0f4f8',pat:'pbars',L:.9},
 tteokbungeo:{n:'떡붕어',H:.66,W:.3,tail:'fork',dor:[-.1,.6,.25],back:'#8a8a7a',belly:'#e8e8dc',pat:'scale'},
 nuchi:{n:'누치',H:.34,W:.26,tail:'fork',dor:[-.15,.4,.28],bar:2,snout:1,back:'#a8a090',belly:'#f4f0e8',pat:'none',L:1.1},
 kkeuri:{n:'끄리',H:.32,W:.22,tail:'fork',dor:[0,.35,.24],anal:[.15,.55],back:'#5a7090',belly:'#f0f4f8',pat:'none',jaw:1,L:1.05},
 donjagae:{n:'동자개',H:.3,W:.28,tail:'fork',dor:[-.35,.25,.3],bar:8,back:'#c8a040',belly:'#f0e0a0',pat:'blotch',flat:1},
 moraemuji:{n:'모래무지',H:.24,W:.24,tail:'fork',dor:[-.2,.35,.25],bar:2,snout:1,back:'#c0a878',belly:'#f4ecd8',pat:'row',flat:1,L:1.05},
 gangjunchi:{n:'강준치',H:.3,W:.16,tail:'fork',dor:[.1,.25,.25],anal:[0,.9],back:'#a0a8b0',belly:'#f4f6f8',pat:'none',jaw:2,L:1.3},
 catfish:{n:'메기',H:.26,W:.34,tail:'round',dor:[-.4,.12,.12],anal:[-.2,1.1],bar:4,longbar:1,back:'#4a4838',belly:'#d0c8b0',pat:'mottle',flat:1,L:1.35},
 trout:{n:'무지개송어',H:.34,W:.24,tail:'cut',dor:[-.05,.35,.25],adipose:1,back:'#5a7050',belly:'#f0f0e8',pat:'rainbow',L:1.15},
 kkeokji:{n:'꺽지',H:.42,W:.26,tail:'round',dor:[-.3,.9,.28],spiny:1,back:'#6a6a40',belly:'#d8d0a0',pat:'bars',eyespot:1,L:.85},
 eel:{n:'뱀장어',H:.12,W:.12,tail:'eel',dor:[-.1,1.8,.06],anal:[-.3,1.6],back:'#3a4030',belly:'#e8e0c0',pat:'none',L:2.2}};
window.makeSpeciesFish=function(k,opt={}){const s=FISH_SPECS[k],L=s.L||1,g=new THREE.Group(),ns=opt.seg||22;
 const geo=new THREE.SphereGeometry(1,ns,12);geo.rotateZ(Math.PI/2);const p=geo.attributes.position,col=[],cB=new THREE.Color(s.back),cY=new THREE.Color(s.belly),tmp=new THREE.Color();
 for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const u=(x+1)/2; // 0=머리 1=꼬리
  let h=Math.pow(Math.sin(Math.PI*Math.min(1,Math.pow(u,.8)*1.0)),.75)*s.H;if(s.tail==='eel')h=s.H*(u<.1?Math.sin(u/.1*Math.PI/2):1-.6*u);
  let w=Math.pow(Math.sin(Math.PI*Math.pow(u,.8)),.7)*s.W*(s.flat&&u<.35?1.35:1);if(s.flat&&u<.3)h*=.8;
  const yy=y*h*(y<0&&s.flat?.7:1),zz=z*w;p.setXYZ(i,x*L,yy,zz);
  // 무늬
  const t=(y+1)/2;let c=tmp.copy(cY).lerp(cB,Math.pow(t,1.3));const xx=u;
  if(s.pat==='stripe'&&Math.abs(y)<.18)c.lerp(new THREE.Color('#3a3a30'),.7);
  if(s.pat==='bars'&&Math.sin(xx*30)>.55&&xx>.15&&xx<.8)c.multiplyScalar(.6);
  if(s.pat==='pbars'&&Math.sin(xx*26)>.5&&xx>.2&&xx<.85&&y>-.3)c.lerp(new THREE.Color('#e08a9a'),.5);
  if(s.pat==='blotch'&&Math.sin(xx*22)*Math.cos(y*5)>.45)c.multiplyScalar(.45);
  if(s.pat==='leopard'&&Math.sin(xx*55+y*9)*Math.sin(y*14+xx*8)>.55)c.multiplyScalar(.4);
  if(s.pat==='row'&&Math.abs(y)<.25&&Math.sin(xx*40)>.3)c.multiplyScalar(.45);
  if(s.pat==='mottle'&&Math.sin(xx*40+z*13)*Math.sin(y*11-z*7)>.35&&y>-.2)c.multiplyScalar(.65);
  if(s.pat==='rainbow'){if(Math.abs(y)<.2)c.lerp(new THREE.Color('#e88aa0'),.7);if(y>.2&&Math.sin(xx*70)*Math.sin(z*30)>.6)c.multiplyScalar(.45);}
  if(s.pat==='scale'&&(Math.sin(xx*60)+Math.sin(y*18))>1.5)c.multiplyScalar(.85);
  if(x<-.85+(s.snout?-.05:0))c.multiplyScalar(.92);
  col.push(c.r,c.g,c.b);}
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:.6});g.add(new THREE.Mesh(geo,mat));
 const finM=new THREE.MeshStandardMaterial({color:new THREE.Color(s.back).lerp(new THREE.Color('#ffffff'),.25),flatShading:true,side:THREE.DoubleSide,transparent:true,opacity:.92,roughness:.7});
 const shp=(pts,x,y,z,ry=0)=>{const sh=new THREE.Shape();pts.forEach((q,i)=>i?sh.lineTo(q[0],q[1]):sh.moveTo(q[0],q[1]));const m=new THREE.Mesh(new THREE.ShapeGeometry(sh),finM);m.position.set(x,y,z);m.rotation.y=ry;g.add(m);return m;};
 // 꼬리
 const tx=L*.98,th=Math.max(.22,s.H*.9);
 if(s.tail==='fork')shp([[0,0],[.42,th],[.28,0],[.42,-th]],tx,0,0);else if(s.tail==='cut')shp([[0,0],[.36,th*.9],[.32,0],[.36,-th*.9]],tx,0,0);
 else if(s.tail==='round'){const pts=[[0,0]];for(let a=-1.1;a<=1.1;a+=.2)pts.push([.3*Math.cos(a)+.05,th*.8*Math.sin(a)]);shp(pts,tx,0,0);}else shp([[0,.05],[.25,0],[0,-.05]],tx-.05,0,0);
 // 등지느러미
 const[ds,dl,dh]=s.dor;if(s.spiny){const pts=[[0,0]];for(let i=0;i<=8;i++)pts.push([i/8*dl*L,(i%2?.7:1)*dh*(i<6?1:.6)]);pts.push([dl*L,0]);shp(pts,ds*L,s.H*.85,0);}else shp([[0,0],[dl*L*.25,dh],[dl*L,dh*.4],[dl*L,0]],ds*L,s.H*.82,0);
 if(s.adipose)shp([[0,0],[.08,.06],[.15,0]],.55*L,s.H*.6,0);
 if(s.anal){shp([[0,0],[s.anal[1]*L*.2,-.12],[s.anal[1]*L,-.06],[s.anal[1]*L,0]],s.anal[0]*L,-s.H*.75,0);}else shp([[0,0],[.12,-.14],[.22,-.04],[.2,0]],.4*L,-s.H*.78,0);
 // 가슴·배지느러미
 [1,-1].forEach(sd=>{const m=shp([[0,0],[.18,-.08],[.22,.02]],-.55*L,-s.H*.35,sd*s.W*.85,0);m.rotation.x=sd*.5;const m2=shp([[0,0],[.14,-.12],[.18,0]],-.05*L,-s.H*.8,sd*s.W*.4);});
 // 눈
 const eye=new THREE.Mesh(new THREE.SphereGeometry(.045*(s.H>.5?1.2:1),8,6),new THREE.MeshBasicMaterial({color:'#1a1a1a'}));[1,-1].forEach(sd=>{const e=eye.clone();e.position.set(-.72*L,s.H*(s.flat?.12:.22),sd*s.W*.62);g.add(e);const w=new THREE.Mesh(new THREE.SphereGeometry(.018,6,4),new THREE.MeshBasicMaterial({color:'#fff'}));w.position.set(-.75*L,s.H*(s.flat?.14:.25),sd*s.W*.68);g.add(w);});
 if(s.eyespot)[1,-1].forEach(sd=>{const e=new THREE.Mesh(new THREE.CircleGeometry(.05,10),new THREE.MeshBasicMaterial({color:'#2a3050'}));e.position.set(-.45*L,s.H*.15,sd*s.W*.92);e.rotation.y=sd>0?0:Math.PI;g.add(e);});
 if(s.ear)[1,-1].forEach(sd=>{const e=new THREE.Mesh(new THREE.CircleGeometry(.07,10),new THREE.MeshBasicMaterial({color:'#1a2a4a'}));e.position.set(-.5*L,s.H*.2,sd*s.W*.9);e.rotation.y=sd>0?0:Math.PI;g.add(e);});
 // 수염
 if(s.bar){const bm=new THREE.MeshStandardMaterial({color:s.back});for(let i=0;i<s.bar;i++){const len=s.longbar&&i<2?.7:.18,b=new THREE.Mesh(new THREE.CylinderGeometry(.008,.012,len,4),bm);const sd=i%2?1:-1;b.position.set(-L-.02-len*.3,-.05-(i>>1)*.03,sd*(.05+.03*(i>>1)));b.rotation.z=Math.PI/2-.5;b.rotation.y=sd*.6;g.add(b);}}
 if(s.jaw){const j=new THREE.Mesh(new THREE.ConeGeometry(s.H*.3,.18,6),mat.clone());j.material=new THREE.MeshStandardMaterial({color:s.belly,flatShading:true});j.rotation.z=Math.PI/2;j.position.set(-L-.03,s.jaw===2?.02:-.06,0);g.add(j);}
 return g;};
