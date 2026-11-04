const pw=require('playwright-core');(async()=>{const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const O='/workspace/nakmeong/mockups-v13/';
for(const [W,H,tag] of [[1280,720,'d'],[390,844,'m']]){const MOB=tag==='m';const p=await b.newPage({viewport:{width:W,height:H},...(MOB?{isMobile:true,hasTouch:true}:{})});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_cfg','{"lay":"a","bots":12}')});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.click('#go');await p.waitForTimeout(1500);
await p.evaluate(()=>{const d=NKV2.decks[0];NKV2.setPos(d.tip.x,d.tip.z);setInterval(()=>{NKV2.time.t=.12},100);document.querySelectorAll('#dc').forEach(e=>e.style.visibility='hidden');});await p.waitForTimeout(2500);
await p.screenshot({path:O+`base-${tag}.jpg`,quality:85,type:'jpeg'});
await p.evaluate(()=>{const P=NKV2.me().o.position;window._cam=[P.x*1.25,P.y+9,P.z*1.25+0.01];});
for(const season of ['spring','summer','autumn','winter']){
 await p.evaluate(season=>{const T=NKV2.THREE,sc=NKV2.scene;window._orig=window._orig||new Map();
  const rec=(c,key)=>{if(!_orig.has(key))_orig.set(key,c.clone());return _orig.get(key);};
  const map=(c0)=>{const h={};c0.getHSL(h);const c=c0.clone();const green=h.h>.17&&h.h<.45&&h.s>.15;const sand=h.h>.08&&h.h<=.17&&h.l>.55;
   if(season==='spring'&&green){if(h.l>.45)c.setHSL(.27,h.s*.9,Math.min(.82,h.l+.06));}
   if(season==='spring'&&green&&Math.random()<0){}
   if(season==='autumn'&&green){c.setHSL(.05+(h.l*.12),Math.min(1,h.s+.15),h.l*.95);}
   if(season==='winter'&&green){c.setHSL(.58,.12,Math.min(.97,.82+h.l*.15));}
   if(season==='winter'&&sand){c.setHSL(.58,.1,.93);}
   return c;};
  let n=0;sc.traverse(o=>{if(!o.isMesh&&!o.isInstancedMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>{if(!m||!m.color)return;const c0=rec(m.color,m.uuid);m.color.copy(map(c0));n++;});
   const ca=o.geometry&&o.geometry.attributes&&o.geometry.attributes.color;if(ca){const k='g'+o.geometry.uuid;if(!_orig.has(k))_orig.set(k,ca.array.slice());const a=_orig.get(k),c=new T.Color();for(let i=0;i<ca.count;i++){c.setRGB(a[i*3],a[i*3+1],a[i*3+2]);const r=map(c);ca.array[i*3]=r.r;ca.array[i*3+1]=r.g;ca.array[i*3+2]=r.b;}ca.needsUpdate=true;}
   if(o.isInstancedMesh&&o.instanceColor){const k='i'+o.uuid;if(!_orig.has(k))_orig.set(k,o.instanceColor.array.slice());const a=_orig.get(k),c=new T.Color(),ia=o.instanceColor.array;for(let i=0;i<o.count;i++){c.setRGB(a[i*3],a[i*3+1],a[i*3+2]);const r=map(c);ia[i*3]=r.r;ia[i*3+1]=r.g;ia[i*3+2]=r.b;}o.instanceColor.needsUpdate=true;}});
  // extras
  if(window._extra){sc.remove(_extra);}const g=new T.Group();window._extra=g;sc.add(g);
  const P=NKV2.me().o.position;
  if(season==='winter'){// 눈 파티클 + 데크 전구 + 트리
   const N=2500,pos=new Float32Array(N*3);for(let i=0;i<N;i++){{const L=Math.hypot(P.x,P.z),ux=P.x/L,uz=P.z/L,f=-3-Math.random()*45,sd=(Math.random()-.5)*60;pos[i*3]=P.x+ux*f-uz*sd;pos[i*3+1]=Math.random()*20;pos[i*3+2]=P.z+uz*f+ux*sd;}}const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(pos,3));g.add(new T.Points(ge,new T.PointsMaterial({color:0xffffff,size:.12})));
   const cols=[0xff4d4d,0xffd24d,0x4dff88,0x4db8ff];NKV2.decks.forEach(d=>{for(let i=0;i<=6;i++){const t=i/6,x=d.entry.x+(d.tip.x-d.entry.x)*t,z=d.entry.z+(d.tip.z-d.entry.z)*t;const s=new T.Mesh(new T.SphereGeometry(.09,8,6),new T.MeshBasicMaterial({color:cols[i%4]}));s.position.set(x,1.25,z);g.add(s);}});
   const tr=new T.Group();[[1.6,2.2,0],[1.25,1.8,1.4],[.85,1.4,2.6]].forEach(([r,h,y])=>{const c=new T.Mesh(new T.ConeGeometry(r,h,7),new T.MeshLambertMaterial({color:0x2f7a4a}));c.position.y=y+h/2;tr.add(c);});const st=new T.Mesh(new T.OctahedronGeometry(.35),new T.MeshBasicMaterial({color:0xffd84d}));st.position.y=4.5;tr.add(st);for(let i=0;i<24;i++){const a=i*2.4,y=.6+i*.14,r=1.5-y*.3;const s=new T.Mesh(new T.SphereGeometry(.13,8,6),new T.MeshBasicMaterial({color:cols[i%4]}));s.position.set(Math.cos(a)*r,y,Math.sin(a)*r);tr.add(s);}
   const L=Math.hypot(P.x,P.z),ux=P.x/L,uz=P.z/L;tr.position.set(P.x+ux*6-uz*7,.3,P.z+uz*6+ux*7);g.add(tr);
   sc.background=new T.Color(0xdfe9f2);sc.fog.color.set(0xe8eef4);
  }else if(season==='spring'){const N=700,pos=new Float32Array(N*3);for(let i=0;i<N;i++){{const L=Math.hypot(P.x,P.z),ux=P.x/L,uz=P.z/L,f=-3-Math.random()*40,sd=(Math.random()-.5)*50;pos[i*3]=P.x+ux*f-uz*sd;pos[i*3+1]=Math.random()*12;pos[i*3+2]=P.z+uz*f+ux*sd;}}const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(pos,3));g.add(new T.Points(ge,new T.PointsMaterial({color:0xffb7d0,size:.16})));
   // 벚꽃 나무
   for(let k=0;k<6;k++){const sd=[-14,-10,-7,7,10,14][k],L0=Math.hypot(P.x,P.z),ux=P.x/L0,uz=P.z/L0,o=6+(k%2)*3;const t=new T.Group();const tk=new T.Mesh(new T.CylinderGeometry(.15,.22,1.6,6),new T.MeshLambertMaterial({color:0x8a5a3c}));tk.position.y=.8;t.add(tk);const cr=new T.Mesh(new T.IcosahedronGeometry(1.2,0),new T.MeshLambertMaterial({color:0xffb3cf,flatShading:true}));cr.position.y=2.2;t.add(cr);t.position.set(P.x+ux*o-uz*sd,.2,P.z+uz*o+ux*sd);g.add(t);}
   sc.background=new T.Color(0xfbe7f0);sc.fog.color.set(0xf8e8ef);
  }else if(season==='autumn'){const N=600,pos=new Float32Array(N*3);for(let i=0;i<N;i++){{const L=Math.hypot(P.x,P.z),ux=P.x/L,uz=P.z/L,f=-3-Math.random()*40,sd=(Math.random()-.5)*50;pos[i*3]=P.x+ux*f-uz*sd;pos[i*3+1]=Math.random()*12;pos[i*3+2]=P.z+uz*f+ux*sd;}}const ge=new T.BufferGeometry();ge.setAttribute('position',new T.BufferAttribute(pos,3));g.add(new T.Points(ge,new T.PointsMaterial({color:0xe8743a,size:.15})));
   sc.background=new T.Color(0xf6e2c8);sc.fog.color.set(0xf3dfc6);}
  else{sc.fog.color.set(0xcfe6ef);}
 },season);
 await p.waitForTimeout(1200);await p.screenshot({path:O+`season-${season}-${tag}.jpg`,quality:85,type:'jpeg'});
 await p.evaluate(()=>{document.querySelectorAll('#hud,.hud,#dock,#chat,#bottom,.chatbox').forEach(e=>e.style.visibility='hidden');const P=NKV2.me().o.position,L=Math.hypot(P.x,P.z),ux=P.x/L,uz=P.z/L;NKV2.setCam(P.x+ux*14-uz*10,P.y+12,P.z+uz*14+ux*10,P.x-ux*6,0,P.z-uz*6);});await p.waitForTimeout(900);
 await p.screenshot({path:O+`season-${season}-${tag}-wide.jpg`,quality:85,type:'jpeg'});
 await p.evaluate(()=>{document.querySelectorAll('#hud,.hud,#dock,#chat,#bottom,.chatbox').forEach(e=>e.style.visibility='');NKV2.setCam();});
}
await p.close();}
await b.close();})();
