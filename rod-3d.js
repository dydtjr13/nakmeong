// 낚멍 v5 낚싯대 3D 외형 (장착 시 캐릭터 손에 표시). 길이·마디색·밴드·릴·끝 발광
(function(){
const P={bamboo:{len:2.0,seg:['#b08850','#8a6438'],grip:'#6a4a30'},carbon:{len:2.3,seg:['#2c2c34','#34343e'],band:'#3a7ad8',reel:{c:'#3a7ad8',r:.07}},
 silver:{len:2.4,seg:['#d8dde4','#b8c0c8'],band:'#9aa4b0',reel:{c:'#e8ecf0',r:.08}},coral:{len:2.3,seg:['#5fc8c0','#3fa8a0'],band:'#f0d0a0',reel:{c:'#f4c8b8',r:.1,shell:1}},
 sakura:{len:2.4,seg:['#f4b8c8','#e89ab0'],band:'#e8c45a',reel:{c:'#f8d0dc',r:.08},tip:'#ffd0e0'},gold:{len:2.5,seg:['#f2c04a','#e0a830'],band:'#c83a3a',reel:{c:'#f2c04a',r:.085},tip:'#fff2a0'},
 star:{len:2.6,seg:['#2a3a7a','#1f2a5a'],band:'#e8c45a',reel:{c:'#2a3a7a',r:.085},tip:'#fff6a0'},dragon:{len:2.7,seg:['#3f9a6a','#2f7a52'],band:'#e8c45a',reel:{c:'#2f7a52',r:.09},tip:'#fff8c0',orb:1},
 galaxy:{len:2.65,seg:['#3a2a8a','#5a3ab8'],band:'#d8dcf0',reel:{c:'#c8ccdc',r:.09},tip:'#fff6a0'},abyss:{len:2.75,seg:['#e8e2d0','#2a6a9a'],band:'#7fe0f0',reel:{c:'#2a6a9a',r:.095},tip:'#a0f4ff',orb:1},
 heaven:{len:2.8,seg:['#f6f4ec','#e8e2d0'],band:'#e8c45a',reel:{c:'#f6f4ec',r:.095},tip:'#8af4e0',orb:1},fire:{len:2.8,seg:['#e8401c','#ff8a1c'],band:'#e8c45a',reel:{c:'#c8201c',r:.095},tip:'#ffd060',orb:1},master:{len:2.75,seg:['#fbf8f2','#f1ece2'],band:'#ff8fb8',reel:{c:'#fbf8f2',r:.095},tip:'#9ff0ff',orb:1}};// v26
const glowCache={};function glowTex(c){if(glowCache[c])return glowCache[c];const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'#fff');gr.addColorStop(.3,c);gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return glowCache[c]=new THREE.CanvasTexture(cv);}
window.NK_ROD3D=function(k,star){const o=P[k]||P.bamboo,g=new THREE.Group(),n=5,L=new THREE.MeshLambertMaterial;
 const segM=o.seg.map(c=>new THREE.MeshLambertMaterial({color:c}));for(let i=0;i<n;i++){const r0=.05-.032*i/n,r1=.05-.032*(i+1)/n,h=o.len/n,m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r0,h,6),segM[i%2]);m.position.y=h*(i+.5);g.add(m);
  if(o.band&&i<n-1){const b=new THREE.Mesh(new THREE.CylinderGeometry(r1*1.45,r1*1.45,.035,6),new THREE.MeshLambertMaterial({color:o.band}));b.position.y=h*(i+1);g.add(b);}}
 const grip=new THREE.Mesh(new THREE.CylinderGeometry(.07,.075,.36,6),new THREE.MeshLambertMaterial({color:o.grip||o.band||'#6a4a30'}));grip.position.y=.16;g.add(grip);
 if(o.reel){const rm=new THREE.MeshLambertMaterial({color:o.reel.c});const rl=o.reel.shell?new THREE.Mesh(new THREE.SphereGeometry(o.reel.r,8,5,0,Math.PI*2,0,Math.PI/2),rm):new THREE.Mesh(new THREE.CylinderGeometry(o.reel.r,o.reel.r,.06,10),rm);rl.rotation.z=Math.PI/2;rl.position.set(.08,.42,0);g.add(rl);}
 if(o.tip){const t=new THREE.Mesh(new THREE.SphereGeometry(o.orb?.07:.04,8,6),new THREE.MeshBasicMaterial({color:o.tip}));t.position.y=o.len;g.add(t);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(o.tip),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.setScalar((o.orb?.5:.28)*(1+(star||0)*.08));sp.position.y=o.len;g.add(sp);g.userData.glow=sp;}
 const tip=new THREE.Object3D();tip.position.y=o.len;g.add(tip);g.userData.tip=tip;g.scale.setScalar(1/2.2);return g;};
window.NK_ROD3D_P=P;})();
