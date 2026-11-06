// 피쉬레스트 v28: 러버덕 5종 변형 — 원본 JDSherbert “3D Rubber Duck Asset Pack” 메시 그대로 + 색 · 소품(직접 만든 도형)
// 작가 허락(2026-11): “출처만 밝히면 오리 인형 마음대로 사용 가능” · 크레딧: JDSherbert
window.NK_DUCKV=(function(){
 const LIST=[['base','기본 노랑'],['pirate','해적'],['straw','딸기'],['astro','우주비행사'],['frog','개구리'],['uni','유니콘'],['cowboy','카우보이'],['chef','셰프'],['ninja','닌자'],['santa','산타'],['hardhat','안전모'],['mermaid','인어'],['vamp','뱀파이어'],['bee','꿀벌'],['sushi','초밥'],['detective','탐정']];
 function build(T,GE){
  const L=c=>new T.MeshLambertMaterial({color:c}),Sd=c=>new T.MeshStandardMaterial({color:c,roughness:.35,metalness:.15});
  const merge=list=>{let n=0;const P=[],N=[];list.forEach(([g,m])=>{const q=g.index?g.toNonIndexed():g;q.applyMatrix4(m);q.computeVertexNormals();P.push(q.attributes.position.array);N.push(q.attributes.normal.array);n+=q.attributes.position.count;});const p=new Float32Array(n*3),nn=new Float32Array(n*3);let o=0;P.forEach((a,i)=>{p.set(a,o);nn.set(N[i],o);o+=a.length;});const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(nn,3));return g;};
  const M=(x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz));
  const sph=(r,w=16,h=12)=>new T.SphereGeometry(r,w,h),cyl=(a,b,h,n=24)=>new T.CylinderGeometry(a,b,h,n),tor=(r,t)=>new T.TorusGeometry(r,t,10,32);
  const HC=[0,.64,.15];// 머리 중심
  // 몸 표면 점 (딸기 씨앗)
  const bp=GE.body.attributes.position,bn=GE.body.attributes.normal,seeds=[];const used=[];for(let i=0;i<bp.count&&seeds.length<150;i+=1){const v=new T.Vector3().fromBufferAttribute(bp,i),n=new T.Vector3().fromBufferAttribute(bn,i);if(v.y<.08||(v.z>.33&&v.y>.48)||used.some(u=>u.distanceTo(v)<.075))continue;used.push(v);const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),n);const qq=q.clone().multiply(new T.Quaternion().setFromEuler(new T.Euler(0,i,0)));seeds.push([sph(.02,10,6),new T.Matrix4().compose(v.clone().addScaledVector(n,.002),qq,new T.Vector3(.7,.35,1.15))]);}
  const leaf=[];for(let i=0;i<6;i++){const a=i/6*Math.PI*2;leaf.push([sph(.09,12,8),M(HC[0]+Math.sin(a)*.08,.83,HC[2]-.02+Math.cos(a)*.08,0,a,0,.55,.18,1.25).premultiply(new T.Matrix4())]);}
  leaf.forEach((l,i)=>{const a=i/6*Math.PI*2;l[1]=M(Math.sin(a)*.085,.825,HC[2]-.03+Math.cos(a)*.085,-.35*Math.cos(a),a,.35*Math.sin(a)*0,.5,.16,1.3);});
  const V={
   base:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[]},
   pirate:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.27,.27,.025,32),M(0,.815,HC[2]-.02,0,0,0,1.15,1,.95)],[cyl(.15,.18,.16,28),M(0,.9,HC[2]-.02)],[tor(.165,.018),M(0,.83,HC[2]-.02,Math.PI/2)]]),L('#26222e')],
     [merge([[sph(.045,14,10),M(0,.915,HC[2]+.148,0,0,0,1,1,.35)],[cyl(.012,.012,.11,8),M(0,.9,HC[2]+.158,0,0,.7)],[cyl(.012,.012,.11,8),M(0,.9,HC[2]+.158,0,0,-.7)]]),L('#fff4e0')],
     [merge([[cyl(.062,.062,.02,20),M(.172,.625,.335,Math.PI/2-.1,0,-.75)],[tor(.232,.009),new T.Matrix4().compose(new T.Vector3(0,.645,.15),new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(-.18,.051,.17).normalize()),new T.Vector3(1,1,1))]]),L('#16121c')],
     [merge([[tor(.2,.035),M(0,.47,.05,Math.PI/2,0,0,1.25,1,1)],[sph(.05,10,8),M(-.2,.47,-.16,0,0,0,1,.8,1.6)]]),L('#e23b4a')]]},
   straw:{body:'#ff4a5c',beak:'#ffa02a',eyes:'#2a2230',acc:[[merge(seeds),L('#ffe68a')],[merge([...leaf,[cyl(.018,.024,.09,10),M(0,.875,HC[2]-.03,.15)]]),L('#3fb54f')]]},
   astro:{body:'#f3f5fa',beak:'#ff8a2a',eyes:'#2a2230',acc:[
     [sph(.34,32,24).applyMatrix4(M(0,.66,.16)),new T.MeshStandardMaterial({color:'#cfeeff',transparent:true,opacity:.28,roughness:.05,metalness:.1,depthWrite:false})],
     [merge([[tor(.24,.04),M(0,.42,.14,Math.PI/2,0,0,1.05,1.1,1)],[new T.BoxGeometry(.32,.3,.14),M(0,.42,-.36)],[cyl(.012,.012,.14,8),M(.1,.62,-.36)]]),Sd('#b9c0cf')],
     [merge([[sph(.03,10,8),M(.1,.7,-.36)]]),L('#ff3b4e')],[merge([[sph(.035,10,8),M(-.07,.46,-.44)],[sph(.035,10,8),M(.07,.46,-.44)]]),L('#36e07a')],
     [merge([[cyl(.06,.06,.01,20),M(.24,.32,.18,0,0,Math.PI/2-.3)]]),L('#3b6cff')]]},
   frog:{body:'#7fd85a',beak:'#ffb02e',eyes:'#2a2230',acc:[
     [merge([[sph(.105,20,14),M(-.12,.82,HC[2]+.02)],[sph(.105,20,14),M(.12,.82,HC[2]+.02)]]),L('#7fd85a')],
     [merge([[sph(.07,16,12),M(-.12,.84,HC[2]+.09)],[sph(.07,16,12),M(.12,.84,HC[2]+.09)]]),L('#ffffff')],
     [merge([[sph(.038,12,10),M(-.12,.845,HC[2]+.145)],[sph(.038,12,10),M(.12,.845,HC[2]+.145)]]),L('#1b1b24')],
     [merge([[sph(.05,12,8),M(-.205,.55,.31,0,-.6,0,1,.6,.35)],[sph(.05,12,8),M(.205,.55,.31,0,.6,0,1,.6,.35)]]),L('#ff8fb4')]]},
   uni:{body:'#fff3fa',beak:'#ffb0d4',eyes:'#2a2230',acc:[
     [merge([[new T.ConeGeometry(.05,.26,16),M(0,.95,HC[2]+.1,.45)],[tor(.045,.012),M(0,.86,HC[2]+.06,Math.PI/2+.45)],[tor(.035,.01),M(0,.92,HC[2]+.085,Math.PI/2+.45)]]),Sd('#ffd35a')],
     ...[['#ff7ab6',[0,.86,.06]],['#ffb35a',[0,.8,-.05]],['#8ee06a',[0,.72,-.13]],['#6ac8ff',[0,.62,-.18]],['#b48cff',[0,.52,-.22]]].map(([c,p])=>[sph(.085,16,12).applyMatrix4(M(p[0],p[1],p[2],0,0,0,.7,1,1.25)),L(c)]),
     [merge([[sph(.08,14,10),M(0,.5,-.47,.6,0,0,.8,1,1.4)],[sph(.07,14,10),M(0,.42,-.5,.6,0,0,.8,1,1.3)]]),L('#ff9fd0')]]},
   cowboy:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.22,.4,.08,28),M(0,.84,HC[2]-.02,0,0,0,1.1,1,1)],[cyl(.18,.22,.22,24),M(0,.98,HC[2]-.02)],[new T.BoxGeometry(.55,.08,.18),M(0,.84,HC[2]-.02)]]),L('#6b3a1e')],
     [merge([[tor(.22,.035),M(0,.52,.08,Math.PI/2,0,0,1.15,1,1)],[sph(.04,10,8),M(-.18,.5,-.12)]]),L('#c0392b')]]},
   chef:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.22,.22,.08,24),M(0,.82,HC[2]-.02)],[cyl(.2,.26,.34,24),M(0,1.05,HC[2]-.02)],[sph(.22,16,12),M(0,1.24,HC[2]-.02,0,0,0,1,.7,1)]]),L('#f7f7f7')],
     [merge([[new T.BoxGeometry(.18,.04,.06),M(0,.58,.34)]]),L('#3a2a22')]]},
   ninja:{body:'#3a3a48',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.32,.32,.1,24),M(0,.68,.12)],[new T.BoxGeometry(.58,.1,.08),M(0,.68,.34)]]),L('#16161e')],
     [merge([[new T.BoxGeometry(.48,.05,.07),M(0,.9,HC[2]-.02)],[new T.BoxGeometry(.1,.18,.04),M(.26,.82,HC[2]-.02)]]),L('#c0392b')],
     [merge([[sph(.05,10,8),M(-.14,.68,.35)],[sph(.05,10,8),M(.14,.68,.35)]]),L('#111')]]},
   santa:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.05,.28,.32,20),M(0,1.02,HC[2]-.02,.15)],[sph(.07,12,10),M(0,1.2,HC[2]+.02)]]),L('#e74c3c')],
     [merge([[tor(.24,.05),M(0,.84,HC[2]-.02,Math.PI/2)]]),L('#fff')],
     [merge([[sph(.16,14,12),M(0,.52,.28,0,0,0,1.3,.7,1)],[sph(.05,10,8),M(0,.58,.42)]]),L('#fff')]]},
   hardhat:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[sph(.3,20,14),M(0,.92,HC[2]-.02,0,0,0,1.15,.7,1.05)],[cyl(.32,.34,.05,28),M(0,.78,HC[2]-.02)],[new T.BoxGeometry(.12,.06,.2),M(0,.88,HC[2]+.2)]]),L('#f1c40f')]]},
   mermaid:{body:'#ffd8f0',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[new T.ConeGeometry(.09,.14,5),M(-.12,.95,HC[2]+.05)],[new T.ConeGeometry(.09,.14,5),M(.12,.95,HC[2]+.05)],[new T.ConeGeometry(.11,.16,5),M(0,1.02,HC[2]+.08)]]),Sd('#48c9b0')],
     [merge([[sph(.16,16,12),M(0,.28,-.48,.5,0,0,1.2,.55,1.6)],[new T.ConeGeometry(.12,.2,8),M(.16,.18,-.62,1.2)],[new T.ConeGeometry(.12,.2,8),M(-.16,.18,-.62,1.2)]]),Sd('#1abc9c')],
     [merge([[sph(.04,10,8),M(-.18,.58,.3,0,0,0,1,.55,.5)],[sph(.04,10,8),M(.18,.58,.3,0,0,0,1,.55,.5)]]),L('#ff9ec7')]]},
   vamp:{body:'#efe6f5',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[new T.BoxGeometry(.85,.5,.08),M(0,.55,-.22,.35)],[new T.BoxGeometry(.28,.55,.06),M(-.38,.35,-.18,.2)],[new T.BoxGeometry(.28,.55,.06),M(.38,.35,-.18,-.2)]]),L('#1a0508')],
     [merge([[cyl(.018,.006,.1,6),M(-.06,.54,.4,.55)],[cyl(.018,.006,.1,6),M(.06,.54,.4,-.55)]]),L('#fff')],
     [merge([[sph(.055,10,8),M(-.15,.72,.3)],[sph(.055,10,8),M(.15,.72,.3)]]),L('#8b0000')]]},
   bee:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[tor(.38,.07),M(0,.55,0,Math.PI/2,0,0,1,.6,1)],[tor(.3,.07),M(0,.35,0,Math.PI/2,0,0,1,.55,1)]]),L('#2a2230')],
     [merge([[sph(.04,8,6),M(-.08,1.0,HC[2]-.05)],[sph(.04,8,6),M(.08,1.0,HC[2]-.05)],[cyl(.01,.01,.16,6),M(-.08,1.1,HC[2]-.05)],[cyl(.01,.01,.16,6),M(.08,1.1,HC[2]-.05)]]),L('#2a2230')],
     [merge([[sph(.18,12,10),M(-.45,.7,.05,0,0,0,.5,1,1.2)],[sph(.18,12,10),M(.45,.7,.05,0,0,0,.5,1,1.2)]]),new T.MeshStandardMaterial({color:'#cfeeff',transparent:true,opacity:.45,roughness:.2})]]},
   sushi:{body:'#fff5e0',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.45,.45,.14,36),M(0,.48,0)]]),L('#1b1b1b')],
     [merge([[sph(.12,14,10),M(0,.64,.02,0,0,0,1.5,.45,1.1)]]),L('#e74c3c')],
     [merge([[sph(.05,10,8),M(.16,.62,.16)],[sph(.04,8,6),M(-.14,.62,.14)]]),L('#27ae60')]]},
   detective:{body:'#ffd43b',beak:'#ff7b1c',eyes:'#2a2230',acc:[
     [merge([[cyl(.28,.28,.14,24),M(0,.92,HC[2]-.05)],[cyl(.18,.2,.16,20),M(0,1.05,HC[2]-.08)],[new T.BoxGeometry(.1,.12,.22),M(0,.9,HC[2]+.18)]]),L('#5d4037')],
     [merge([[tor(.1,.02),M(.42,.55,.25,Math.PI/2,.4)],[cyl(.02,.08,.02,16),M(.42,.55,.25)],[cyl(.01,.01,.18,6),M(.42,.45,.25)]]),Sd('#d4af37')]]}
  };
  return V;}
 return {LIST,build};})();
