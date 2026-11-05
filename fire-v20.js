// v20: 모닥불 개선 — 겹친 불꽃(가산 혼합, 흔들림), 불씨 파티클, 바닥 빛, 숯·장작 디테일. 반환 그룹.userData.tick(T,dt,night)
(function(){
function flameTex(){const c=document.createElement('canvas');c.width=64;c.height=128;const x=c.getContext('2d');
 const g=x.createRadialGradient(32,92,2,32,80,60);g.addColorStop(0,'rgba(255,255,230,1)');g.addColorStop(.25,'rgba(255,214,110,.95)');g.addColorStop(.55,'rgba(255,128,40,.55)');g.addColorStop(1,'rgba(255,60,10,0)');
 x.fillStyle=g;x.beginPath();x.moveTo(32,2);x.bezierCurveTo(52,40,62,70,58,96);x.bezierCurveTo(54,122,10,122,6,96);x.bezierCurveTo(2,70,12,40,32,2);x.fill();return new THREE.CanvasTexture(c);}
function dotTex(){const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),g=x.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,'rgba(255,240,200,1)');g.addColorStop(.4,'rgba(255,150,60,.8)');g.addColorStop(1,'rgba(255,80,20,0)');x.fillStyle=g;x.fillRect(0,0,32,32);return new THREE.CanvasTexture(c);}
window.NK_FIRE=function(T3,scene,X,Z){const THREE=T3,g=new THREE.Group();g.position.set(X,.3,Z);scene.add(g);
 const ft=flameTex(),dt=dotTex(),L=c=>new THREE.MeshLambertMaterial({color:c,flatShading:true});
 // 숯·장작 (추가 디테일)
 const coal=new THREE.MeshLambertMaterial({color:'#3a2a22',emissive:'#ff5a1a',emissiveIntensity:.55,flatShading:true});
 for(let i=0;i<9;i++){const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.13+(i%3)*.04,0),coal);const a=i*2.4,r=.18+(i%4)*.09;m.position.set(Math.cos(a)*r,.12,Math.sin(a)*r);m.rotation.set(i,i*2,0);g.add(m);}
 const wood=L('#8a5a36'),char=L('#2e221c');for(let i=0;i<4;i++){const lg=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(.085,.1,1.05,7),wood);lg.add(c);const e=new THREE.Mesh(new THREE.CylinderGeometry(.088,.088,.14,7),char);e.position.y=.48;lg.add(e);
  lg.position.set(0,.32,0);lg.rotation.set(.0,i*Math.PI/2+.4,1.05);lg.translateY(-.28);g.add(lg);}
 const stM=[L('#9a948c'),L('#857f78'),L('#aaa49a')];for(let i=0;i<11;i++){const a=i/11*Math.PI*2,m=new THREE.Mesh(new THREE.DodecahedronGeometry(.17+(i%3)*.03,0),stM[i%3]);m.position.set(Math.cos(a)*.78,.1,Math.sin(a)*.78);m.scale.set(1.25,.75,1);m.rotation.set(i*.7,a,i*.3);g.add(m);}
 // 불꽃 레이어
 const F=[];const mk=(s,h,col,o,x,z,ph)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map:ft,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:o}));m.scale.set(s,h,1);m.position.set(x,.2+h*.45,z);m.userData={s,h,x,z,ph,o};g.add(m);F.push(m);};
 mk(1.25,1.9,'#ff6a20',.75,0,0,0);mk(.9,1.5,'#ff9a3a',.85,.12,.05,1.7);mk(.85,1.4,'#ff8a30',.85,-.12,-.06,3.1);mk(.55,1.0,'#ffe08a',.95,0,0,4.4);mk(.32,.6,'#fff6d8',1,0,.02,2.2);
 // 바닥 빛
 const gl=new THREE.Mesh(new THREE.CircleGeometry(2.4,24).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:dt,color:'#ff8a3a',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.35}));gl.position.y=.03;g.add(gl);
 // 불씨
 const N=46,pos=new Float32Array(N*3),E=[];for(let i=0;i<N;i++){E.push({t:Math.random()*2.4,l:1.6+Math.random()*1.4,a:Math.random()*6.3,r:Math.random()*.35,sw:.4+Math.random()*.8});}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));const pts=new THREE.Points(pg,new THREE.PointsMaterial({map:dt,size:.13,color:'#ffb060',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));pts.frustumCulled=false;g.add(pts);
 g.userData.tick=(T,d,night)=>{F.forEach(m=>{const u=m.userData,k=Math.sin(T*9+u.ph)*.5+Math.sin(T*15.3+u.ph*2)*.3+Math.sin(T*23+u.ph)*.2;m.scale.set(u.s*(1+k*.06),u.h*(1+k*.14),1);m.position.set(u.x+Math.sin(T*3+u.ph)*.04,.2+m.scale.y*.45,u.z);m.material.opacity=u.o*(.88+k*.12);});
  gl.material.opacity=(.22+night*.35)*(.9+Math.sin(T*13)*.1);
  for(let i=0;i<N;i++){const e=E[i];e.t+=d;if(e.t>e.l){e.t=0;e.a=Math.random()*6.3;e.r=Math.random()*.35;}const q=e.t/e.l;pos[i*3]=Math.cos(e.a)*e.r+Math.sin(T*e.sw*3+i)*.18*q;pos[i*3+1]=.4+q*3.2;pos[i*3+2]=Math.sin(e.a)*e.r+Math.cos(T*e.sw*2.6+i)*.18*q;}
  pg.attributes.position.needsUpdate=true;pts.material.opacity=.95;};
 return g;};})();
