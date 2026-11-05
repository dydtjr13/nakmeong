// 직접 만든 로우폴리 러버덕 (외부 에셋 없음) + 5가지 변형
window.NK_DUCKLP=function(THREE,v){
 const G=new THREE.Group(),M=c=>new THREE.MeshStandardMaterial({color:c,flatShading:true,roughness:.55}),
 S=(r,c,x,y,z,sx=1,sy=1,sz=1,d=1)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,d),M(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);G.add(m);return m},
 C=(rt,rb,h,c,x,y,z,n=8)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),M(c));m.position.set(x,y,z);G.add(m);return m};
 const P={base:['#ffd23a','#ff8a1f'],pirate:['#ffd23a','#ff8a1f'],straw:['#ff4d5e','#ffb02e'],astro:['#f4f6fa','#ff8a1f'],frog:['#7ed957','#ffb02e'],uni:['#fff2fb','#ffb3d9']}[v];
 S(1,P[0],0,.55,0,1.25,.8,1);S(.62,P[0],.55,1.45,0);S(.28,P[1],1.12,1.36,0,1.3,.45,1);S(.5,P[0],-.95,.85,0,1,.6,.8);// 몸·머리·부리·꼬리
 [-1,1].forEach(s=>{S(.09,'#1b1b24',.92,1.6,.3*s);S(.03,'#fff',.98,1.65,.32*s,1,1,1,0);S(.45,P[0],0,.65,.72*s,1.1,.5,.4)});// 눈·날개
 if(v=='pirate'){C(.5,.62,.3,'#222',.5,2.0,0,6);S(.2,'#222',.5,2.18,0,2.6,.4,.6);S(.1,'#fff',.62,2.1,0,1,1,.4,0);C(.12,.12,.04,'#111',.95,1.62,.3,6).rotation.z=Math.PI/2;S(.15,'#d33',-.2,1.2,.62,1,1,.5)}
 if(v=='straw'){for(let i=0;i<18;i++){const a=i*2.4,f=.15+(i%4)*.18;S(.06,'#ffe680',Math.cos(a)*Math.cos(f)*1.24,.55+Math.sin(f)*.8,Math.sin(a)*Math.cos(f)*.99,1,1,1,0)}[0,1,2,3,4].forEach(i=>{const l=S(.22,'#3bb54a',.5+Math.cos(i*1.26)*.22,2.05,Math.sin(i*1.26)*.22,1.4,.3,.6);l.rotation.y=i*1.26});C(.04,.04,.3,'#2a8a35',.5,2.2,0)}
 if(v=='astro'){const h=new THREE.Mesh(new THREE.IcosahedronGeometry(.85,2),new THREE.MeshStandardMaterial({color:'#bfe6ff',transparent:true,opacity:.35,roughness:.1}));h.position.set(.55,1.5,0);G.add(h);C(.7,.7,.18,'#c9ccd6',.55,.98,0,10);S(.35,'#9aa3b5',-.85,1.1,0,.6,1.2,1);S(.08,'#ff3b3b',-.95,1.55,.18,1,1,1,0);S(.08,'#3bff6e',-.95,1.55,-.18,1,1,1,0)}
 if(v=='frog'){[-1,1].forEach(s=>{S(.24,'#7ed957',.55,2.05,.28*s);S(.12,'#fff',.72,2.12,.32*s);S(.07,'#111',.8,2.14,.34*s)});S(.12,'#ff7aa8',.85,1.45,.42,1,.5,.5);S(.12,'#ff7aa8',.85,1.45,-.42,1,.5,.5)}
 if(v=='uni'){const h=C(0,.14,.7,'#ffd86b',.75,2.25,0,6);h.rotation.z=-.4;['#ff7ab6','#b78cff','#7ad3ff','#8affc1'].forEach((c,i)=>S(.22,c,.15-i*.25,1.95-i*.12,0,.8,1.3,.6));S(.25,'#ff7ab6',-1.3,1.0,0,1.2,.7,.5);S(.25,'#7ad3ff',-1.25,.75,0,1.1,.6,.5)}
 if(v=='base'){} return G}
