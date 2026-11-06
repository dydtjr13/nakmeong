// v30 러버덕 시안 전용 — 게임에 넣지 않음. JDSherbert 원본 메시 + 색·소품 (v28 퀄리티)
window.NK_DUCKV30=(function(){
 const LIST=[
  ['chicken','닭'],['bee','꿀벌'],['penguin','펭귄'],['panda','판다'],['ladybug','무당벌레'],
  ['dino','공룡'],['mushroom','버섯'],['chef','요리사'],['witch','마녀'],['magician','마술사'],
  ['crystal','크리스탈'],['angel','천사'],['devil','악마'],['snowman','눈사람'],['vacation','바캉스'],
  ['santa','산타'],['rain','장마']
 ];
 function build(T,GE){
  const L=c=>new T.MeshLambertMaterial({color:c}),Sd=c=>new T.MeshStandardMaterial({color:c,roughness:.35,metalness:.2});
  const merge=list=>{let n=0;const P=[],N=[];list.forEach(([g,m])=>{const q=g.index?g.toNonIndexed():g;q.applyMatrix4(m);q.computeVertexNormals();P.push(q.attributes.position.array);N.push(q.attributes.normal.array);n+=q.attributes.position.count;});const p=new Float32Array(n*3),nn=new Float32Array(n*3);let o=0;P.forEach((a,i)=>{p.set(a,o);nn.set(N[i],o);o+=a.length;});const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(nn,3));return g;};
  const M=(x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
  const sph=(r,w=16,h=12)=>new T.SphereGeometry(r,w,h),cyl=(a,b,h,n=24)=>new T.CylinderGeometry(a,b,h,n),tor=(r,t)=>new T.TorusGeometry(r,t,10,32),cone=(r,h,n=16)=>new T.ConeGeometry(r,h,n);
  const HC=[0,.64,.15];
  const hat=(col,top)=>[[merge([[cyl(.28,.28,.03,28),M(0,.8,HC[2]-.02,0,0,0,1.1,1,.95)],[cyl(.16,.2,.18,24),M(0,.9,HC[2]-.02)]]),L(col)]].concat(top||[]);
  const V={
   chicken:{body:'#fff4d6',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cone(.09,.22,8),M(0,.92,HC[2]+.02)],[cone(.07,.18,8),M(-.1,.88,HC[2]-.02,0,0,-.45)],[cone(.07,.18,8),M(.1,.88,HC[2]-.02,0,0,.45)],[cone(.055,.12,8),M(-.16,.82,HC[2]-.04,0,0,-.7)],[cone(.055,.12,8),M(.16,.82,HC[2]-.04,0,0,.7)]]),L('#e23b4a')],
     [merge([[sph(.07,10,8),M(0,.42,-.44,0,0,0,.65,1,1.5)]]),L('#ff7b1c')]]},
   bee:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.36,.36,.06,28),M(0,.48,.02,Math.PI/2,0,0,1,.5,1)],[cyl(.36,.36,.06,28),M(0,.34,.02,Math.PI/2,0,0,1,.5,1)],[cyl(.34,.34,.05,28),M(0,.20,.02,Math.PI/2,0,0,1,.45,1)]]),L('#2a2230')],
     [merge([[sph(.14,14,12),M(-.36,.58,.02,0,.3,0,.35,1.1,1.7)],[sph(.14,14,12),M(.36,.58,.02,0,-.3,0,.35,1.1,1.7)]]),new T.MeshLambertMaterial({color:'#e8f6ff',transparent:true,opacity:.55})],
     [merge([[cyl(.012,.012,.2,6),M(-.05,.98,HC[2]-.02)],[cyl(.012,.012,.2,6),M(.05,.98,HC[2]-.02)],[sph(.025,8,6),M(-.05,1.08,HC[2]-.02)],[sph(.025,8,6),M(.05,1.08,HC[2]-.02)]]),L('#2a2230')],
     [merge([[cone(.04,.1,8),M(0,.28,-.48,1.1)]]),L('#2a2230')]]},
   penguin:{body:'#2a3142',beak:'#ff9a2a',eyes:'#2a2230',acc:[
     [merge([[sph(.28,20,16),M(0,.38,.18,0,0,0,.85,1.05,.7)]]),L('#f5f7fa')],
     [merge([[sph(.05,10,8),M(-.2,.5,.32)],[sph(.05,10,8),M(.2,.5,.32)]]),L('#ff6b4a')]]},
   panda:{body:'#f5f5f5',beak:'#2a2230',eyes:'#2a2230',acc:[
     [merge([[sph(.11,14,12),M(-.16,.72,HC[2]+.02)],[sph(.11,14,12),M(.16,.72,HC[2]+.02)]]),L('#1a1a22')],
     [merge([[sph(.09,12,10),M(-.14,.7,HC[2]+.1)],[sph(.09,12,10),M(.14,.7,HC[2]+.1)]]),L('#ffffff')],
     [merge([[sph(.04,10,8),M(-.14,.7,HC[2]+.16)],[sph(.04,10,8),M(.14,.7,HC[2]+.16)]]),L('#1a1a22')],
     [merge([[sph(.12,12,10),M(-.28,.78,HC[2]-.05)],[sph(.12,12,10),M(.28,.78,HC[2]-.05)]]),L('#1a1a22')]]},
   ladybug:{body:'#e23b4a',beak:'#2a2230',eyes:'#2a2230',acc:[
     [merge([[sph(.05,10,8),M(-.18,.5,.28)],[sph(.05,10,8),M(.16,.42,.3)],[sph(.045,10,8),M(.05,.55,.22)],[sph(.04,10,8),M(-.05,.35,.32)]]),L('#1a1a22')],
     [merge([[cyl(.01,.01,.2,6),M(-.04,.9,HC[2]),],[cyl(.01,.01,.2,6),M(.04,.9,HC[2])]]),L('#1a1a22')]]},
   dino:{body:'#6ecf5a',beak:'#ff9a2a',eyes:'#2a2230',acc:[
     [merge([[cone(.07,.16,8),M(0,.62,-.36,-.85)],[cone(.065,.15,8),M(0,.52,-.46,-.9)],[cone(.055,.13,8),M(0,.42,-.54,-.95)],[cone(.045,.1,8),M(0,.34,-.6,-1)]]),L('#4aa83a')],
     [merge([[cone(.06,.14,8),M(-.14,.72,HC[2]-.02,0,0,-.2)],[cone(.07,.16,8),M(0,.8,HC[2])],[cone(.06,.14,8),M(.14,.72,HC[2]-.02,0,0,.2)]]),L('#4aa83a')],
     [merge([[sph(.045,10,8),M(-.22,.4,.3,0,0,0,1,.5,.35)],[sph(.045,10,8),M(.22,.4,.3,0,0,0,1,.5,.35)]]),L('#ff8a6a')]]},
   mushroom:{body:'#fff0e0',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[sph(.32,20,14),M(0,.88,HC[2]-.02,0,0,0,1,.55,1)]]),L('#e23b4a')],
     [merge([[sph(.05,10,8),M(-.12,.9,HC[2]+.1)],[sph(.04,10,8),M(.14,.85,HC[2]+.05)],[sph(.035,10,8),M(0,.95,HC[2]-.05)]]),L('#fff4e8')]]},
   chef:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.2,.22,.28,24),M(0,.98,HC[2]-.02)],[cyl(.24,.24,.04,24),M(0,.84,HC[2]-.02)]]),L('#f5f5f5')],
     [merge([[new T.BoxGeometry(.35,.08,.02),M(0,.48,.38)]]),L('#ffffff')]]},
   witch:{body:'#c9a0ff',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cone(.32,.42,20),M(0,1.05,HC[2]-.02)],[cyl(.3,.3,.03,24),M(0,.84,HC[2]-.02)]]),L('#2a2230')],
     [merge([[sph(.04,10,8),M(0,.95,HC[2]+.12)]]),L('#9bff4a')]]},
   magician:{body:'#3a3550',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.2,.2,.22,24),M(0,.96,HC[2]-.02)],[cyl(.28,.28,.03,24),M(0,.84,HC[2]-.02)]]),L('#1a1a22')],
     [merge([[cyl(.2,.2,.04,24),M(0,.9,HC[2]-.02)]]),L('#e23b4a')],
     [merge([[new T.BoxGeometry(.08,.28,.08),M(.35,.55,.2,0,0,.4)]]),L('#1a1a22')]]},
   crystal:{body:'#b8f0ff',beak:'#7ad0ff',eyes:'#2a4460',acc:[
     [merge([[cone(.08,.22,6),M(-.12,.9,HC[2],0,0,-.2)],[cone(.1,.28,6),M(0,.98,HC[2])],[cone(.07,.18,6),M(.14,.88,HC[2],0,0,.25)]]),Sd('#7ef0ff')],
     [merge([[sph(.06,10,8),M(.2,.45,.3)]]),Sd('#ff9cf0')]]},
   angel:{body:'#fff8e8',beak:'#ffb07a',eyes:'#2a2230',acc:[
     [merge([[tor(.17,.028),M(0,.98,HC[2]-.02,Math.PI/2)]]),Sd('#ffd86a')],
     [merge([[sph(.16,16,12),M(-.42,.48,-.08,0,.4,.2,.3,1.15,1.8)],[sph(.14,14,12),M(-.52,.42,-.12,0,.5,.15,.25,1,1.6)],[sph(.16,16,12),M(.42,.48,-.08,0,-.4,-.2,.3,1.15,1.8)],[sph(.14,14,12),M(.52,.42,-.12,0,-.5,-.15,.25,1,1.6)]]),new T.MeshLambertMaterial({color:'#fff',transparent:true,opacity:.78})]]},
   devil:{body:'#ff5a4a',beak:'#ff9a2a',eyes:'#2a2230',acc:[
     [merge([[cone(.055,.22,8),M(-.2,.9,HC[2]-.02,.15,0,-.55)],[cone(.055,.22,8),M(.2,.9,HC[2]-.02,.15,0,.55)]]),L('#2a2230')],
     [merge([[cyl(.02,.02,.26,6),M(0,.32,-.42,-.9)],[sph(.055,8,6),M(0,.18,-.52)]]),L('#2a2230')],
     [merge([[sph(.04,8,6),M(-.18,.52,.3)],[sph(.04,8,6),M(.18,.52,.3)]]),L('#8b1a1a')]]},
   snowman:{body:'#f2f7ff',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.22,.24,.08,20),M(0,.86,HC[2]-.02)],[cyl(.16,.16,.14,16),M(0,.96,HC[2]-.02)]]),L('#2a3550')],
     [merge([[sph(.035,8,6),M(0,.5,.35)],[sph(.03,8,6),M(0,.4,.36)]]),L('#1a1a22')],
     [merge([[cyl(.04,.01,.16,8),M(0,.62,.38,Math.PI/2)]]),L('#ff7b1c')]]},
   vacation:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[new T.BoxGeometry(.42,.06,.18),M(0,.78,HC[2]+.05)],[new T.BoxGeometry(.42,.02,.18),M(0,.78,HC[2]+.05)]]),L('#2a2230')],
     [merge([[new T.BoxGeometry(.42,.02,.18),M(0,.81,HC[2]+.05)]]),L('#3ecf8a')],
     [merge([[cyl(.05,.08,.12,12),M(0,.35,-.42)]]),L('#ff8a4c')]]},
   santa:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cone(.3,.38,22),M(0,1.08,HC[2]-.02)],[cyl(.28,.28,.05,22),M(0,.88,HC[2]-.02)],[sph(.07,12,10),M(0,1.26,HC[2]-.02)]]),L('#e23b4a')],
     [merge([[cyl(.28,.28,.06,22),M(0,.88,HC[2]-.02)],[sph(.08,10,8),M(0,1.26,HC[2]-.02)]]),L('#ffffff')],
     [merge([[sph(.14,14,12),M(0,.48,.34,0,0,0,1.15,.75,.55)],[sph(.05,10,8),M(-.12,.55,.38)],[sph(.05,10,8),M(.12,.55,.38)]]),L('#ffffff')],
     [merge([[tor(.22,.04),M(0,.42,.08,Math.PI/2,0,0,1.15,1,1)]]),L('#e23b4a')]]},
   rain:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[sph(.34,20,14),M(0,.95,HC[2]-.02,0,0,0,1,.45,1)],[cyl(.02,.02,.28,6),M(0,.72,HC[2]-.02)]]),L('#3a6fcf')],
     [merge([[cyl(.18,.2,.04,16),M(0,.78,HC[2]-.02)]]),L('#2a4a8a')],
     [merge([[sph(.025,6,6),M(-.2,.55,.4)],[sph(.02,6,6),M(.15,.48,.42)],[sph(.022,6,6),M(.05,.6,.38)]]),L('#7ec8ff')]]}
  };
  return V;}
 return {LIST,build};})();
