const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({lay:'a',bots:8}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.click('#go');await p.waitForTimeout(3000);
await p.addStyleTag({content:'#hud,#dc,#chat,#bubs,#rkL,#toast,.mtoast{visibility:hidden!important}'});await p.evaluate(()=>{NKV2.time.auto=false;NKV2.time.t=.1;NKV2.S.wxOv='clear';NKV2.S.wxOn=false;});await p.waitForTimeout(500);
await p.mouse.move(640,400);for(let i=0;i<8;i++){await p.mouse.wheel(0,400);await p.waitForTimeout(60);}
await p.mouse.down();await p.mouse.move(380,330,{steps:12});await p.mouse.up();await p.waitForTimeout(1200);
await p.screenshot({path:'/workspace/nakmeong/mockups-v15/map-0.jpg',type:'jpeg',quality:86});
await p.evaluate(()=>{const T=NKV2.THREE,sc=NKV2.scene;
 let terr;sc.traverse(o=>{if(o.isMesh&&o.geometry.attributes.position.count>30000&&o.material.vertexColors&&!terr)terr=o;});window.__terr=terr;window.__orig=terr.geometry.attributes.position.array.slice();window.__ocol=terr.geometry.attributes.color.array.slice();
 window.__G=null;
 const rnd=(()=>{let s=7;return()=>((s=Math.imul(s^(s>>>15),2246822519)+0x9e3779b9>>>0)/4294967296);})();
 window.__rnd=rnd;
 window.__flat=(fn)=>{const P=terr.geometry.attributes.position,Cc=terr.geometry.attributes.color;P.array.set(__orig);Cc.array.set(__ocol);for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i),r=Math.hypot(x,z);if(r>50){const y=fn?fn(x,z,r,P.getY(i)):.3;P.setY(i,y);}}P.needsUpdate=true;terr.geometry.computeVertexNormals();
  const yAt=(x,z)=>{const r=Math.hypot(x,z);return r>50?(fn?fn(x,z,r,0):.3):null;};const oH=(x,z)=>NKV2.H?NKV2.H(x,z):null;
  if(!window.__props){window.__props=[];NKV2.scene.children.forEach(o=>{if(o===terr||o===window.__G)return;if(o.isInstancedMesh){const M=new THREE.Matrix4(),arr=[];for(let i=0;i<o.count;i++){o.getMatrixAt(i,M);arr.push(M.clone());}__props.push([o,arr]);}else if(Math.hypot(o.position.x,o.position.z)>50)__props.push([o,o.position.y]);});}
  const OH=(x,z)=>{const r=Math.hypot(x,z);return .3+Math.max(0,r-52)*.3*(1+Math.sin(x*.15)*Math.cos(z*.12))+Math.sin(x*.25)*Math.cos(z*.2)*.25;};
  __props.forEach(([o,v])=>{if(o.isInstancedMesh){const p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),M=new THREE.Matrix4();v.forEach((m0,i)=>{m0.decompose(p,q,s);const y=yAt(p.x,p.z);if(y!=null){p.y+=y-OH(p.x,p.z);}M.compose(p,q,s);o.setMatrixAt(i,M);});o.instanceMatrix.needsUpdate=true;}else{const y=yAt(o.position.x,o.position.z);if(y!=null)o.position.y=v+y-OH(o.position.x,o.position.z);}});};
 window.__tint=(fn)=>{const P=terr.geometry.attributes.position,Cc=terr.geometry.attributes.color;for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),r=Math.hypot(x,z);const c=fn(x,y,z,r);if(c){Cc.setXYZ(i,c.r,c.g,c.b);}}Cc.needsUpdate=true;};
 const L=c=>new T.MeshLambertMaterial({color:c,flatShading:true});const LV=()=>new T.MeshLambertMaterial({vertexColors:true,flatShading:true});
 window.__mk={
  ridge(rad,h,col,seed,seg=120){const g=new T.BufferGeometry(),pos=[],cl=[];const c0=new T.Color(col),top=c0.clone().lerp(new T.Color('#ffffff'),.18),bot=c0.clone().multiplyScalar(.86);
   const hh=a=>h*(.45+.3*Math.sin(a*4+seed)+.18*Math.sin(a*9+seed*3)+.07*Math.sin(a*23+seed*5));
   for(let i=0;i<seg;i++){const a0=i/seg*Math.PI*2,a1=(i+1)/seg*Math.PI*2;const P=(a,y,rr)=>[Math.cos(a)*rr,y,Math.sin(a)*rr];
    const A=P(a0,0,rad),B=P(a1,0,rad),C=P(a1,hh(a1),rad+9),D=P(a0,hh(a0),rad+9),E=P(a0,0,rad+22),F=P(a1,0,rad+22);
    const q=(p1,p2,p3,c1,c2,c3)=>{pos.push(...p1,...p2,...p3);[c1,c2,c3].forEach(c=>cl.push(c.r,c.g,c.b));};
    q(A,B,C,bot,bot,top);q(A,C,D,bot,top,top);q(D,C,F,top,top,bot);q(D,F,E,top,bot,bot);}
   g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(cl,3));g.computeVertexNormals();return new T.Mesh(g,new T.MeshLambertMaterial({vertexColors:true,flatShading:true,side:T.DoubleSide}));},
  mountain(x,z,r,h,o={}){const g=new T.ConeGeometry(r,h,o.seg||9,4,false);g.translate(0,h/2,0);const P=g.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i);if(y>0.01&&y<h-.01){const k=1+(rnd()-.5)*.35;P.setX(i,P.getX(i)*k);P.setZ(i,P.getZ(i)*k);P.setY(i,y+(rnd()-.5)*h*.06);}}
   const ng=g.toNonIndexed();ng.computeVertexNormals();const N=ng.attributes.normal,Q=ng.attributes.position,cl=[];const grass=new T.Color(o.base||'#86bf72'),rock=new T.Color(o.rock||'#b3aa9c'),snow=new T.Color('#f4f6fb');
   for(let i=0;i<Q.count;i+=3){const yy=(Q.getY(i)+Q.getY(i+1)+Q.getY(i+2))/3/h,ny=(N.getY(i));let c=yy>.74&&o.snow!==false?snow:yy>.5||(ny<.45&&yy>.25)?rock:grass;if(c===rock&&rnd()<.3)c=rock.clone().multiplyScalar(.88);for(let k=0;k<3;k++)cl.push(c.r,c.g,c.b);}
   ng.setAttribute('color',new T.Float32BufferAttribute(cl,3));const m=new T.Mesh(ng,LV());m.position.set(x,0,z);m.castShadow=true;return m;},
  hill(x,z,r,h,col){const g=new T.SphereGeometry(r,10,6,0,Math.PI*2,0,Math.PI/2);g.scale(1,h/r,1);const m=new T.Mesh(g,L(col));m.position.set(x,-.2,z);return m;},
  trees(n,rmin,rmax,s=1,col='#5fa86a'){const G=new T.Group();const cone=new T.ConeGeometry(1.1*s,3.2*s,6),tr=new T.CylinderGeometry(.22*s,.28*s,1*s,5);const im=new T.InstancedMesh(cone,L(col),n),it=new T.InstancedMesh(tr,L('#8a6a4a'),n),M=new T.Matrix4(),q=new T.Quaternion(),S3=new T.Vector3();
   for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,r=rmin+rnd()*(rmax-rmin),x=Math.cos(a)*r,z=Math.sin(a)*r,k=.7+rnd()*.7;S3.set(k,k,k);M.compose(new T.Vector3(x,.3+2.1*s*k,z),q,S3);im.setMatrixAt(i,M);M.compose(new T.Vector3(x,.3+.5*s*k,z),q,S3);it.setMatrixAt(i,M);im.setColorAt&&im.setColorAt(i,new T.Color(col).offsetHSL((rnd()-.5)*.04,0,(rnd()-.5)*.08));}
   G.add(im,it);return G;},
  rocks(n,r0,r1,col='#a8a8b2'){const g=new T.IcosahedronGeometry(1,0),im=new T.InstancedMesh(g,L(col),n),M=new T.Matrix4(),E=new T.Euler();for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,r=r0+rnd()*(r1-r0),k=.3+rnd()*.9;E.set(rnd()*3,rnd()*3,rnd()*3);M.compose(new T.Vector3(Math.cos(a)*r,-.1+k*.3,Math.sin(a)*r),new T.Quaternion().setFromEuler(E),new T.Vector3(k*1.3,k*.7,k));im.setMatrixAt(i,M);}return im;},
  rocksS(n,r0,r1,col){const m=this.rocks(n,r0,r1,col);const M=new THREE.Matrix4(),S=new THREE.Vector3(.45,.45,.45),Mx=new THREE.Matrix4();for(let i=0;i<n;i++){m.getMatrixAt(i,M);Mx.makeScale(.45,.45,.45);M.multiply(Mx);m.setMatrixAt(i,M);}return m;},
  tufts(n,r0,r1,col='#7cc46a'){const g=new T.ConeGeometry(.12,.9,3),im=new T.InstancedMesh(g,L(col),n),M=new T.Matrix4(),E=new T.Euler();for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,r=r0+rnd()*(r1-r0);E.set((rnd()-.5)*.5,0,(rnd()-.5)*.5);M.compose(new T.Vector3(Math.cos(a)*r,.4,Math.sin(a)*r),new T.Quaternion().setFromEuler(E),new T.Vector3(1,.6+rnd()*.8,1));im.setMatrixAt(i,M);}return im;}};
});
const V={
 A:`__flat((x,z,r)=>.3+Math.max(0,r-60)*.05);const G=new THREE.Group();[[78,14,'#8ec68a',1],[94,26,'#9cc0b4',2.4],[110,42,'#b4bfdc',4.1]].forEach(([r,h,c,s])=>G.add(__mk.ridge(r,h,c,s)));G.add(__mk.trees(120,56,86,1.1,'#6db37a'));return G;`,
 B:`__flat((x,z,r)=>.3+Math.max(0,r-58)*.08);const G=new THREE.Group();for(let i=0;i<14;i++){const a=i/14*Math.PI*2+__rnd()*.2,r=88+__rnd()*18;G.add(__mk.mountain(Math.cos(a)*r,Math.sin(a)*r,16+__rnd()*10,26+__rnd()*26,{snow:__rnd()<.55}));}G.add(__mk.rocks(60,60,80));G.add(__mk.trees(160,56,84,1.1,'#5fa86a'));return G;`,
 C:`__flat((x,z,r)=>.3);const G=new THREE.Group();[[112,56,'#bcc8e0',5],[100,34,'#a9c6c4',1]].forEach(([r,h,c,s])=>G.add(__mk.ridge(r,h,c,s,60)));for(let i=0;i<18;i++){const a=i/18*Math.PI*2,r=72+__rnd()*12;G.add(__mk.hill(Math.cos(a)*r,Math.sin(a)*r,14+__rnd()*8,6+__rnd()*6,['#9fd08a','#8cc47c','#a8d694'][i%3]));}G.add(__mk.trees(140,58,90,1,'#62ad6e'));return G;`,
 D:`__flat((x,z,r)=>.3+Math.max(0,r-58)*.08);const G=new THREE.Group();for(let i=0;i<12;i++){const a=i/12*Math.PI*2+__rnd()*.2,r=92+__rnd()*16;G.add(__mk.mountain(Math.cos(a)*r,Math.sin(a)*r,18+__rnd()*10,28+__rnd()*22,{snow:__rnd()<.5}));}const LR=Math.hypot(...['x','z'].map(()=>0))||0;G.add(__mk.rocksS(110,33.6,36.5,'#b9b4aa'));G.add(__mk.tufts(700,36,58));G.add(__mk.trees(200,48,86,1.05,'#5fa86a'));return G;`};
for(const k of Object.keys(V)){await p.evaluate(src=>{if(window.__G)NKV2.scene.remove(__G);__G=new Function(src)();NKV2.scene.add(__G);},V[k]);await p.waitForTimeout(900);await p.screenshot({path:'/workspace/nakmeong/mockups-v15/map-'+k+'.jpg',type:'jpeg',quality:86});}
console.log(await p.evaluate(()=>{let lr=0;return 'ok'}));await b.close();})();
