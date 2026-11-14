// 윤슬 운하 v1 (시안) — Three.js r147 · 게임에 옮기기 쉽게 seatown-v151.js 와 같은 build(T, opt) 모양
// 상태: day 낮 · sunset 노을 · night 밤(별빛 고래) · rain 비 · rainbow 비 갠 뒤(무지개) · aurora 밤+행운(오로라)
// 사용: const C=NK_CANAL.build(THREE,{ox:0,fishAtlas:'fish/atlas.png'}); scene.add(C.group); C.attach(scene);
//       매 프레임 C.update(dt,camera,renderer) → C.mirror(renderer,scene,camera) → renderer.render(scene,camera)
// v160: 게임 적용판 — 낚시 의자 · 걷기/땅 높이/물 판정(walk·ground·water) · 장애물 · 거울 반사 끄기(opt.noMirror)
window.NK_CANAL=(function(){
const L=h=>{const c=new THREE.Color(h);c.convertSRGBToLinear();return c;};
// ── 상태별 값 (색은 화면에 보이는 sRGB 값으로 적어요) ──
const S0={
 day:    {skyTop:'#5aa6e8',skyMid:'#9dd0f4',skyHor:'#e6f2f6',fog:'#cfe4ee',fogN:60,fogF:420,sun:'#fff4dc',sunI:1.05,sx:-150,sy:230,sz:-200,disc:'#fffbe8',discS:0,glow:.25,
          hemS:'#cfe8ff',hemG:'#8a8060',hemI:.62,amb:.18,lights:0,stars:0,whale:0,lotus:.0,skyLant:0,swirl:0,rain:0,wet:0,rainbow:0,aurora:0,flies:0,beam:0,bigWhale:.0,
          deep:'#3d86b8',shal:'#5fb3d6',mirror:.55,wave:.6,nacre:.35,glint:.5,cloud:'#ffffff',cloudO:.95,quay:'#c9bba6'},
 sunset: {skyTop:'#8a7ab8',skyMid:'#f4a08e',skyHor:'#ffd08a',fog:'#f4b892',fogN:50,fogF:380,sun:'#ffb47a',sunI:1.0,sx:0,sy:50,sz:-470,disc:'#fff0c0',discS:1,glow:1,
          hemS:'#ffc8a8',hemG:'#6a4a5a',hemI:.6,amb:.2,lights:.45,stars:0,whale:0,lotus:1,skyLant:0,swirl:0,rain:0,wet:0,rainbow:0,aurora:0,flies:0,beam:0,bigWhale:0,
          deep:'#5a5c9a',shal:'#e8a08a',mirror:.92,wave:.28,nacre:.6,glint:1,cloud:'#ffb0a0',cloudO:.9,quay:'#c8a89a'},
 night:  {skyTop:'#0c0d2e',skyMid:'#231c58',skyHor:'#47357a',fog:'#251f4e',fogN:40,fogF:360,sun:'#9fb0ff',sunI:.2,sx:-120,sy:150,sz:-460,disc:'#f4f2ff',discS:.28,glow:.25,
          hemS:'#4a4a9a',hemG:'#201830',hemI:.3,amb:.07,lights:1,stars:1,whale:1,lotus:.7,skyLant:1,swirl:1,rain:0,wet:0,rainbow:0,aurora:0,flies:0,beam:.5,bigWhale:0,
          deep:'#0c1240',shal:'#16225a',mirror:.78,wave:.4,nacre:.45,glint:.25,cloud:'#3a3070',cloudO:.7,quay:'#6a6488'},
 rain:   {skyTop:'#7c8a9c',skyMid:'#a2adb8',skyHor:'#c4cbd0',fog:'#aab4bc',fogN:22,fogF:230,sun:'#dfe6ee',sunI:.45,sx:60,sy:200,sz:-200,disc:'#ffffff',discS:0,glow:0,
          hemS:'#c8d2dc',hemG:'#6a6a6a',hemI:.75,amb:.22,lights:.55,stars:0,whale:0,lotus:0,skyLant:0,swirl:0,rain:1,wet:1,rainbow:0,aurora:0,flies:0,beam:0,bigWhale:0,
          deep:'#4c6f88',shal:'#6f93a8',mirror:.7,wave:.8,nacre:.45,glint:.1,cloud:'#8c96a2',cloudO:1,quay:'#8f8678'},
 rainbow:{skyTop:'#4f9ee8',skyMid:'#a8d6f6',skyHor:'#eaf4f4',fog:'#d6e8ee',fogN:60,fogF:420,sun:'#fff2d0',sunI:1.15,sx:40,sy:120,sz:400,disc:'#ffffff',discS:0,glow:0,
          hemS:'#d8ecff',hemG:'#8a8268',hemI:.65,amb:.2,lights:.2,stars:0,whale:0,lotus:0,skyLant:0,swirl:0,rain:0,wet:.65,rainbow:1,aurora:0,flies:0,beam:0,bigWhale:0,
          deep:'#3f8cc0',shal:'#62b6d8',mirror:.7,wave:.42,nacre:.9,glint:.6,cloud:'#ffffff',cloudO:1,quay:'#ae9f8c'},
 snowy:  {skyTop:'#aeb9c6',skyMid:'#cdd5de',skyHor:'#e6eaee',fog:'#dbe2e8',fogN:34,fogF:280,sun:'#f4f6fa',sunI:.7,sx:60,sy:200,sz:-200,disc:'#ffffff',discS:0,glow:0,
          hemS:'#eef2f8',hemG:'#9aa0a8',hemI:.82,amb:.24,lights:.4,stars:0,whale:0,lotus:0,skyLant:0,swirl:0,rain:0,wet:.25,rainbow:0,aurora:0,flies:0,beam:0,bigWhale:0,
          deep:'#58768c',shal:'#86a2b6',mirror:.66,wave:.3,nacre:.3,glint:.12,cloud:'#e2e6ec',cloudO:1,quay:'#e4e8ec'},
 aurora: {skyTop:'#07102a',skyMid:'#12245a',skyHor:'#2a3f7a',fog:'#16244e',fogN:40,fogF:380,sun:'#a0c8ff',sunI:.3,sx:-120,sy:150,sz:-460,disc:'#f4f2ff',discS:0,glow:0,
          hemS:'#3a6a8a',hemG:'#14202a',hemI:.32,amb:.07,lights:.9,stars:1,whale:0,lotus:.5,skyLant:0,swirl:.5,rain:0,wet:0,rainbow:0,aurora:1,flies:1,beam:1,bigWhale:1,
          deep:'#0a1840',shal:'#132a62',mirror:.85,wave:.3,nacre:.4,glint:.15,cloud:'#24305a',cloudO:.15,quay:'#5a6478'}};
const COLK=['skyTop','skyMid','skyHor','fog','sun','disc','hemS','hemG','deep','shal','cloud','quay'];
function prep(s){const o={};for(const k in s)o[k]=COLK.includes(k)?L(s[k]):s[k];return o;}

function build(T,opt){opt=opt||{};const OX=opt.ox||0;
const ST={};for(const k in S0)ST[k]=prep(S0[k]);
const cur=prep(S0.day),from=prep(S0.day);let to=ST.day,tB=1,tD=1,curName='day';
let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};const R=(a,b)=>a+(b-a)*rnd();
const OBS=[],DECKR=[];const ob=(x,z,r)=>OBS.push([x,z,r]);
const root=new T.Group();root.name='canal';root.position.x=OX;
const U={t:{value:0}};const MM={};
const M=(c,o)=>{const k=c+JSON.stringify(o||{});return MM[k]||(MM[k]=new T.MeshStandardMaterial(Object.assign({color:L(c),roughness:.85,metalness:0,flatShading:true},o||{})));};
const add=(g,geo,m,x,y,z,ry)=>{const o=new T.Mesh(geo,typeof m==='string'?M(m):m);o.position.set(x,y,z);if(ry)o.rotation.y=ry;o.castShadow=o.receiveShadow=true;g.add(o);return o;};
const bx=(g,w,h,d,m,x,y,z,ry)=>add(g,new T.BoxGeometry(w,h,d),m,x,y,z,ry);
const BG=T.BufferGeometryUtils;const merge=a=>BG.mergeBufferGeometries(a.map(g=>g.index?g.toNonIndexed():g));
function inst(geo,mat,list,shadow){const m=new T.InstancedMesh(geo,mat,list.length);const o=new T.Object3D();list.forEach((p,i)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(p[6]||0,p[3]||0,p[7]||0);o.scale.set(p[4]?p[4][0]:1,p[4]?p[4][1]:1,p[4]?p[4][2]:1);o.updateMatrix();m.setMatrixAt(i,o.matrix);if(p[5])m.setColorAt(i,L(p[5]));});if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=m.receiveShadow=shadow!==false;root.add(m);return m;}
function canvasTex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;fn(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t;}
const glowTex=canvasTex(64,64,(x)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);});
const CW=7,QY=.7;// 운하 반폭 · 물가 높이
// ── 하늘 ──
const skyU={top:{value:cur.skyTop},mid:{value:cur.skyMid},hor:{value:cur.skyHor},sunD:{value:new T.Vector3(0,.05,-1)},sunC:{value:cur.sun},glow:{value:0}};
const sky=new T.Mesh(new T.SphereGeometry(900,32,16),new T.ShaderMaterial({uniforms:skyU,side:T.BackSide,depthWrite:false,fog:false,
 vertexShader:'varying vec3 vW;void main(){vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}',
 fragmentShader:'uniform vec3 top,mid,hor,sunC,sunD;uniform float glow;varying vec3 vW;void main(){vec3 d=normalize(vW);float y=d.y;vec3 c=y<0.?hor:mix(hor,mid,smoothstep(0.,.16,y));c=mix(c,top,smoothstep(.16,.62,y));float s=max(dot(d,normalize(sunD)),0.);c+=sunC*glow*(pow(s,6.)*.55+pow(s,40.)*.6);gl_FragColor=vec4(c,1.);\n#include <encodings_fragment>\n}'}));
sky.renderOrder=-10;sky.userData.mirror=1;
// 별
const starsU={op:{value:0},t:U.t};{const n=1100,p=new Float32Array(n*3),r=new Float32Array(n);for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,e=.06+Math.pow(rnd(),.8)*1.4;p[i*3]=Math.cos(a)*Math.cos(e)*820;p[i*3+1]=Math.sin(e)*820;p[i*3+2]=Math.sin(a)*Math.cos(e)*820;r[i]=rnd();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('r',new T.BufferAttribute(r,1));
 var stars=new T.Points(g,new T.ShaderMaterial({uniforms:starsU,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
  vertexShader:'attribute float r;uniform float t;varying float vA;void main(){vA=(.45+.55*sin(t*(1.+r*2.)+r*40.))*(.35+r*.65);gl_PointSize=1.5+r*2.6;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float op;varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vec3(1.,.97,.9)*smoothstep(.5,.0,d)*vA*op,1.);}'}));stars.renderOrder=-9;}
// 해/달 원반
const disc=new T.Sprite(new T.SpriteMaterial({map:glowTex,color:cur.disc,transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending}));disc.renderOrder=-8;
const discCore=new T.Mesh(new T.CircleGeometry(1,40),new T.MeshBasicMaterial({color:cur.disc,fog:false,transparent:true}));discCore.renderOrder=-7;
// 구름 (낮은 다각형 덩어리)
const cloudM=new T.MeshBasicMaterial({color:cur.cloud,fog:false,transparent:true,opacity:1});
{const parts=[];for(let i=0;i<6;i++){const g=new T.IcosahedronGeometry(R(.6,1.1),0);g.translate(R(-1.6,1.6),R(-.1,.4),R(-.4,.4));parts.push(g);}const cg=merge(parts);cg.scale(1,.55,.5);
 const L2=[];for(let i=0;i<16;i++){let a=-Math.PI/2+R(-1.1,1.1);if(Math.abs(a+Math.PI/2)<.32)a+=Math.sign(a+Math.PI/2||1)*.4;const d=R(380,600);L2.push([Math.cos(a)*d,R(45,140),Math.sin(a)*d,R(0,6),[R(14,30),R(12,22),R(10,20)]]);}
 var clouds=inst(cg,cloudM,L2,false);clouds.renderOrder=-6;clouds.userData.mirror=1;}
// 먼 언덕 · 바다 끝 마을 실루엣
{const hm=M('#7a8aa0');const hills=[];for(let i=0;i<9;i++){const g=new T.ConeGeometry(R(30,60),R(14,34),5);g.translate(0,0,0);hills.push(g);}
 [[-160,-430],[-90,-470],[150,-440],[220,-400],[-230,-380],[90,-500],[260,-480]].forEach(([x,z],i)=>{const h=add(root,new T.ConeGeometry(R(40,70),R(12,30),6),M('#8494a8'),x,4,z);h.castShadow=false;h.scale.y=.8;});}
// ── 물 (거울 반사 + 나전 물결 + 금빛 반짝임 + 빗방울 고리) ──
const RT=new T.WebGLRenderTarget(512,512,{encoding:T.LinearEncoding});const texMat=new T.Matrix4();
const wU=Object.assign(T.UniformsUtils.clone(T.UniformsLib.fog),{tRef:{value:RT.texture},texMat:{value:texMat},t:U.t,deep:{value:cur.deep},shal:{value:cur.shal},mirror:{value:.5},wave:{value:.5},nacre:{value:.5},glint:{value:.5},sunD:{value:new T.Vector3()},sunC:{value:cur.sun},rain:{value:0}});
const water=new T.Mesh(new T.PlaneGeometry(1400,1400,1,1),new T.ShaderMaterial({uniforms:wU,fog:true,depthWrite:false,
 vertexShader:'uniform mat4 texMat;varying vec4 vR;varying vec3 vW;\n#include <fog_pars_vertex>\nvoid main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vR=texMat*w;vec4 mvPosition=viewMatrix*w;gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}',
 fragmentShader:`uniform sampler2D tRef;uniform float t,mirror,wave,nacre,glint,rain;uniform vec3 deep,shal,sunD,sunC;varying vec4 vR;varying vec3 vW;
#include <fog_pars_fragment>
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float H(vec2 p){return vn(p*.55+vec2(t*.12,t*.05))*.6+vn(p*1.3-vec2(t*.09,-t*.11))*.3+vn(p*3.1+vec2(t*.2,0.))*.12;}
vec3 hsv(float h,float s,float v){vec3 k=clamp(abs(mod(h*6.+vec3(0,4,2),6.)-3.)-1.,0.,1.);return v*mix(vec3(1),k,s);}
void main(){vec2 p=vW.xz;float e=.08;float h=H(p);vec2 g=vec2(H(p+vec2(e,0))-h,H(p+vec2(0,e))-h)/e;
 // 빗방울 고리
 vec2 rg=vec2(0.);if(rain>.01){for(int k=0;k<2;k++){vec2 q=p*(1.3+float(k)*.7)+float(k)*7.3;vec2 id=floor(q),f=fract(q)-.5;float r0=h2(id+float(k));float ph=fract(t*.9+r0);float d=length(f+vec2(r0-.5,h2(id*1.7)-.5)*.5);float ring=sin((d-ph*.5)*40.)*smoothstep(.06,.0,abs(d-ph*.5))*(1.-ph);rg+=normalize(f+1e-4)*ring*rain;}}
 vec3 N=normalize(vec3(-g.x*wave*.9-rg.x*.6,1.,-g.y*wave*.9-rg.y*.6));vec3 V=normalize(cameraPosition-vW);
 float fr=.18+.82*pow(1.-max(dot(N,V),0.),3.);
 vec2 uv=vR.xy/vR.w+vec2(N.x*.05,N.z*.12)*(wave+.25+rain*.5);vec3 ref=texture2D(tRef,uv).rgb;
 float dist=length(cameraPosition.xz-p);vec3 base=mix(shal,deep,smoothstep(4.,60.,dist)*.7+.3*h);
 vec3 c=mix(base,ref,clamp(mirror*(.55+.45*fr),0.,1.));
 // 나전(자개) 물결: 물결 마루를 따라 분홍·청록·금빛으로 바뀌는 띠
 float band=pow(max(0.,sin(h*14.+p.x*.15+t*.4)),5.)*smoothstep(.15,.9,fr+.25);
 vec3 iri=hsv(fract(h*1.7+p.x*.021+p.y*.013+t*.02),.55,1.);c+=iri*band*nacre*.38;
 // 금빛 반짝임 (해 쪽)
 vec3 Rf=reflect(-V,N);float s=pow(max(dot(Rf,normalize(sunD)),0.),90.);float sp=step(.86,vn(p*9.+t*.7))*pow(max(dot(Rf,normalize(sunD)),0.),18.);
 c+=sunC*glint*(s*1.6+sp*1.4);
 gl_FragColor=vec4(c,1.);
#include <encodings_fragment>
#include <fog_fragment>
}`}));
water.rotation.x=-Math.PI/2;water.position.set(0,0,-500);water.renderOrder=1;water.userData.noMirror=1;water.receiveShadow=false;root.add(water);
// ── 물가 · 벽 · 땅 ──
const quayM=new T.MeshStandardMaterial({color:cur.quay.clone(),roughness:.9,flatShading:true});
[-1,1].forEach(s=>{const q=add(root,new T.BoxGeometry(60,1,174),quayM,s*(CW+30),QY-.5,-43);
 bx(root,.6,2.4,174,'#8a7c6a',s*(CW+.3),QY-1.2,-43);
 // 물가 덮개돌
 const cs=[];for(let z=42;z>-130;z-=1.2)cs.push([s*(CW+.35),QY+.06,z,0,[.95,.14,1.12],rnd()<.5?'#d8ccb8':'#cbbfa8']);inst(new T.BoxGeometry(1,1,1),M('#ffffff'),cs);});
// 왼쪽 등대 곶 · 바위
{const rk=[];for(let i=0;i<26;i++)rk.push([R(-34,-9),R(-.4,1.2),R(-158,-131),R(0,6),[R(2.5,6),R(1.5,3.5),R(2.5,6)],rnd()<.5?'#8d8a86':'#a3a09a']);inst(new T.DodecahedronGeometry(1,0),M('#ffffff'),rk);
 add(root,new T.CylinderGeometry(14,16,1.6,9),M('#7a9a5a'),-22,.3,-146).castShadow=false;}
{const rk=[];for(let i=0;i<14;i++)rk.push([R(10,36),R(-.4,1),R(-140,-131),R(0,6),[R(2,5),R(1.2,3),R(2,4)],'#9a968e']);inst(new T.DodecahedronGeometry(1,0),M('#ffffff'),rk);}
// ── 집 v2 (양쪽 한 줄 · 인스턴싱): 2층 안팎 · 둥근 지붕 · 아치 창 · 꽃 화분 ──
const PAL=['#f6e6c8','#f2b8a0','#8fc4c0','#f4d27a','#e89a8a','#a8d0dc','#f8d8b0','#b8d8a0','#f0b8c4','#fbf4e6','#a8b8e0','#f2e08a'],
 ROOF=['#c8604a','#b0503c','#d88a5a','#8a5a7a','#5a7f96','#c4484a','#4f8a76','#9a6a4a'],SHUT=['#4f8a8a','#c86a5a','#6a8ac8','#7aa86a','#e8b04a'];
const bodyL=[],gabA=[],gabB=[],roofA=[],roofB=[],winL=[],winD=[],frameL=[],trimL=[],doorL=[],doorF=[],boxL=[],flowL=[],chimL=[],awnL=[],shutL=[],rwL=[],rwD=[],rwF=[],potL=[],bushL=[],bandL=[];
const HX=CW+4.6;// 집 앞면 (운하 중심에서)
// 몸통: 세로 모서리가 둥근 상자 (발자국 1×1 · 높이 1, 바닥이 y=0)
const bodyG=(()=>{const r=.14,sh=new T.Shape();sh.moveTo(-.5+r,-.5);sh.lineTo(.5-r,-.5);sh.quadraticCurveTo(.5,-.5,.5,-.5+r);sh.lineTo(.5,.5-r);sh.quadraticCurveTo(.5,.5,.5-r,.5);sh.lineTo(-.5+r,.5);sh.quadraticCurveTo(-.5,.5,-.5,.5-r);sh.lineTo(-.5,-.5+r);sh.quadraticCurveTo(-.5,-.5,-.5+r,-.5);
 const g=new T.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false,curveSegments:3});g.rotateX(-Math.PI/2);return g;})();
// 지붕 단면: A 둥근 아치 · B 끝이 부드러운 종 모양
const PF={A:u=>Math.sqrt(Math.max(0,1-u*u)),B:u=>1-Math.pow(Math.abs(u),1.7)};
function profGeo(f,shell){const N=16,sh=new T.Shape();for(let i=0;i<=N;i++){const u=-1+2*i/N;const x=u*(shell?.58:.5),y=f(u)*(shell?1:.93);i?sh.lineTo(x,y):sh.moveTo(x,y);}
 if(shell){for(let i=N;i>=0;i--){const u=-1+2*i/N;sh.lineTo(u*.47,f(u)*.84-.01);}}
 const dp=shell?1.12:1;const g=new T.ExtrudeGeometry(sh,{depth:dp,bevelEnabled:false});g.translate(0,0,-dp/2);g.rotateY(Math.PI/2);return g;}
const gabAG=profGeo(PF.A,0),gabBG=profGeo(PF.B,0),roofAG=profGeo(PF.A,1),roofBG=profGeo(PF.B,1);
// 아치 창 (너비 1 · 높이 1.5, 가운데 기준, 운하 쪽을 봐요)
const archG=(()=>{const sh=new T.Shape();sh.moveTo(-.5,-.75);sh.lineTo(.5,-.75);sh.lineTo(.5,.25);sh.absarc(0,.25,.5,0,Math.PI,false);sh.lineTo(-.5,-.75);
 const g=new T.ExtrudeGeometry(sh,{depth:1,bevelEnabled:false,curveSegments:8});g.translate(0,0,-.5);g.rotateY(Math.PI/2);return g;})();
const roundG=new T.CylinderGeometry(.5,.5,1,14);roundG.rotateZ(Math.PI/2);
const FLC=['#ff7a9a','#ffd04a','#ff9ad0','#ffffff','#e85a5a','#b88aff'];
function flowers(x,y,z,n,sp){for(let k=0;k<n;k++)flowL.push([x,y+R(-.03,.05),z+(k-(n-1)/2)*sp,0,[.17,.17,.17],FLC[(rnd()*FLC.length)|0]]);}
function house(s,z,w,h,d,col,rc){const fx=s*HX,cx=fx+s*d/2;const kind=rnd()<.5?'A':'B';const rh=w*(kind==='A'?.42:.6);
 bodyL.push([cx,0,z,0,[d,h,w],col]);
 (kind==='A'?gabA:gabB).push([cx,h,z,0,[d,rh,w],col]);(kind==='A'?roofA:roofB).push([cx,h-.05,z,0,[d+.55,rh,w+.1],rc]);
 bandL.push([cx,h-.02,z,0,[d+.16,.2,w+.16],'#fff4e4']);bandL.push([cx,QY+.22,z,0,[d+.12,.45,w+.12],'#c9b49a']);
 if(rnd()<.35)chimL.push([cx+s*R(.5,1.5),h+rh*.55,z+R(-.8,.8),0,[.45,R(1,1.4),.45],'#9a6a5a']);
 // 지붕 둥근 창 (2층 집은 가끔, 1층 집은 자주)
 const two=h>4.6;if(rnd()<(two?.45:.8)){const rs=.62;rwF.push([fx-s*.03,h+rh*.36,z,0,[.1,rs+.16,rs+.16],'#fff6ea']);(rnd()<.75?rwL:rwD).push([fx-s*.07,h+rh*.36,z,0,[.1,rs,rs]]);}
 const cols=Math.max(1,Math.min(3,Math.floor(w/1.65))),fl=two?2:1,sc=SHUT[(rnd()*SHUT.length)|0],sh=rnd()<.45;
 for(let f=0;f<fl;f++)for(let c=0;c<cols;c++){const wz=z-w/2+(c+.5)*w/cols,wy=f?4.15:2.2;
  if(f===0&&c===((cols-1)>>1)){// 아치 문 · 작은 차양 · 문 옆 화분
   doorF.push([fx-s*.03,QY+.8,wz,0,[.1,1.12,1.12],'#fff6ea']);doorL.push([fx-s*.07,QY+.74,wz,0,[.12,.96,.96],rnd()<.5?'#7a4e36':(rnd()<.5?'#3f6a6a':'#a84a4a')]);
   awnL.push([fx-s*.4,QY+1.95,wz,0,[.75,.1,1.3],rnd()<.5?'#c84a4a':'#3a8a8a',0,s*.35]);
   [-1,1].forEach(q=>{const pz=wz+q*.95;potL.push([fx-s*.4,QY+.25,pz,0,[.42,.5,.42],'#c8724a']);bushL.push([fx-s*.4,QY+.72,pz,0,[.36,.34,.36],'#5a9a4a']);flowers(fx-s*.4,QY+.95,pz,2,.2);});
   if(cols===1)continue;continue;}
  const W=.72;const lit=rnd()<.72;(lit?winL:winD).push([fx-s*.06,wy,wz,0,[.1,W,W]]);frameL.push([fx-s*.03,wy,wz,0,[.08,W+.18,W+.18],'#fff6ea']);
  trimL.push([fx-s*.12,wy-.08,wz,0,[.04,W*1.25,.05],'#fff6ea']);trimL.push([fx-s*.12,wy+.05,wz,0,[.04,.05,W],'#fff6ea']);
  if(sh&&f===1){[-1,1].forEach(q=>shutL.push([fx-s*.08,wy-.05,wz+q*(W/2+.2),0,[.06,W*1.3,.3],sc]));}
  if(rnd()<.85){boxL.push([fx-s*.22,wy-.68,wz,0,[.34,.2,W+.2],'#8a5a3a']);flowers(fx-s*.3,wy-.5,wz,4,.2);bushL.push([fx-s*.3,wy-.6,wz,0,[.28,.16,W*.55],'#5a9a4a']);}}}
const trees=[],trunks=[];const tree=(x,z,s,y0)=>{trunks.push([x,(y0||QY)+.9*s,z,0,[.25*s,1.8*s,.25*s],'#7a5a3a']);trees.push([x,(y0||QY)+2.5*s,z,R(0,6),[1.35*s,1.4*s,1.35*s],['#6aa84a','#5a9a48','#7ab858','#4f8f4a'][(rnd()*4)|0]]);};
[-1,1].forEach(s=>{let z=14;while(z>-128){const w=R(4.2,6);if(Math.abs(z+48)<5.5){z-=8;continue;}if(s>0&&z<-55&&z>-68){z-=1;continue;}
 const two=rnd()<.78;house(s,z-w/2,w,two?R(5.1,5.9):R(3.4,3.8),R(5.2,6.4),PAL[(rnd()*PAL.length)|0],ROOF[(rnd()*ROOF.length)|0]);z-=w;
 if(rnd()<.3){const gp=R(2.6,4.2);tree(s*(HX+R(1.4,2.6)),z-gp/2,R(.95,1.25));bushL.push([s*(HX+.6),QY+.4,z-gp/2,0,[.8,.55,1.2],'#5a9a4a']);flowers(s*(HX+.2),QY+.7,z-gp/2,3,.3);z-=gp;}else z-=.06;}
 // 집 뒤 둥근 나무 숲 (지붕보다 낮게 · 틈 사이로 보여요)
 for(let z2=14;z2>-128;z2-=R(4,7))tree(s*(HX+R(8,13)),z2,R(1.1,1.5));});
const UB=new T.BoxGeometry(1,1,1);
inst(bodyG,M('#ffffff'),bodyL);inst(gabAG,M('#ffffff'),gabA);inst(gabBG,M('#ffffff'),gabB);var roofIA=inst(roofAG,M('#ffffff'),roofA),roofIB=inst(roofBG,M('#ffffff'),roofB);inst(UB,M('#ffffff'),chimL);inst(UB,M('#ffffff'),bandL);
inst(archG,M('#ffffff'),frameL,false);inst(UB,M('#ffffff'),trimL,false);inst(archG,M('#ffffff'),doorF,false);inst(archG,M('#ffffff'),doorL,false);inst(UB,M('#ffffff'),awnL);inst(UB,M('#ffffff'),shutL,false);
inst(roundG,M('#ffffff'),rwF,false);inst(UB,M('#ffffff'),boxL,false);inst(new T.IcosahedronGeometry(1,0),M('#ffffff'),flowL,false);inst(new T.IcosahedronGeometry(1,1),M('#ffffff'),bushL,false);
inst(new T.CylinderGeometry(.5,.38,1,8),M('#ffffff'),potL,false);
const winM=new T.MeshStandardMaterial({color:L('#3a5a7a'),emissive:L('#ffa848'),emissiveIntensity:0,roughness:.25,metalness:.1});
const winM2=new T.MeshStandardMaterial({color:L('#3a5a7a'),emissive:L('#ffb050'),emissiveIntensity:0,roughness:.25,metalness:.1});
inst(archG,winM,winL,false);inst(archG,winM2,winD,false);inst(roundG,winM,rwL,false);inst(roundG,winM2,rwD,false);
// ── 나무 · 화분 ──
{const put=(x,z,s)=>tree(x,z,s);
 [-1,1].forEach(s=>{for(let z=10;z>-125;z-=R(11,17)){if(Math.abs(z+48)<6||z>-7)continue;put(s*(CW+2.6),z,R(.85,1.1));ob(s*(CW+2.6),z,.6);}});
 for(let i=0;i<14;i++)put(R(-36,-12),R(-150,-136),R(.8,1.2));for(let i=0;i<8;i++)put(R(12,34),R(-138,-132),R(.8,1.2));
 inst(new T.CylinderGeometry(.5,.6,1,6),M('#ffffff'),trunks);var treeI=inst(new T.IcosahedronGeometry(1,1),M('#ffffff'),trees);}
// ── 가로등 (인스턴싱) ──
const lampHM=new T.MeshStandardMaterial({color:L('#fff0c8'),emissive:L('#ffcf7a'),emissiveIntensity:0,roughness:.4});
const lampPts=[];{const po=[],ar=[],hd=[],cap=[];[-1,1].forEach(s=>{for(let z=8;z>-128;z-=9){const x=s*(CW+1.1);po.push([x,QY+1.6,z,0,[.12,3.2,.12],'#2c2c34']);hd.push([x,QY+3.35,z,0,[.42,.55,.42]]);cap.push([x,QY+3.72,z,0,[.55,.2,.55],'#2c2c34']);lampPts.push(new T.Vector3(x,QY+3.35,z));ob(x,z,.32);}});
 inst(new T.CylinderGeometry(1,1.3,1,6),M('#ffffff'),po);inst(new T.CylinderGeometry(.5,.6,1,6),M('#ffffff'),cap);inst(UB,lampHM,hd,false);}
// 가로등 빛무리 (점 묶음 1번 그리기)
function glowPoints(pts,col,size,u){const g=new T.BufferGeometry();g.setFromPoints(pts);const rr=new Float32Array(pts.length);for(let i=0;i<rr.length;i++)rr[i]=rnd();g.setAttribute('r',new T.BufferAttribute(rr,1));
 const m=new T.ShaderMaterial({uniforms:{op:{value:0},c:{value:L(col)},sz:{value:size},t:U.t,tw:{value:u||0},sc:{value:600}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
  vertexShader:'attribute float r;uniform float sz,t,tw,sc;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vA=1.-tw+tw*(.5+.5*sin(t*(1.5+r*3.)+r*50.));gl_PointSize=sz*sc/-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform float op;uniform vec3 c;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d);a=a*a;gl_FragColor=vec4(c*a*op*vA,1.);}'});
 const p=new T.Points(g,m);p.frustumCulled=false;root.add(p);return p;}
const lampGlow=glowPoints(lampPts,'#ffc870',4.2);
// 가로등 아래 바닥 빛 웅덩이
const poolM=new T.MeshBasicMaterial({map:glowTex,color:L('#ffb860'),transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending});
{const pl=lampPts.map(p=>[p.x+Math.sign(p.x)*.9,QY+.08,p.z,0,[5,5,1]]);const pg=new T.PlaneGeometry(1,1);pg.rotateX(-Math.PI/2);const pm=inst(pg,poolM,pl.map(a=>[a[0],a[1],a[2],0,[a[4][0],1,a[4][1]]]),false);pm.renderOrder=2;}
// ── 아치 돌다리 (z=-48) · 전구 줄 ──
const BZ=-48;{const sh=new T.Shape();sh.moveTo(-10,QY);for(let i=0;i<=24;i++){const x=-10+20*i/24;sh.lineTo(x,QY+2.9*Math.cos(x/10*Math.PI/2)**.6+.05);}sh.lineTo(10,QY);sh.lineTo(10,-1.5);sh.lineTo(5.6,-1.5);
 for(let i=0;i<=20;i++){const a=i/20*Math.PI;sh.lineTo(Math.cos(a)*5.6,-1.5+Math.sin(a)*3.9);}sh.lineTo(-10,-1.5);
 const g=new T.ExtrudeGeometry(sh,{depth:4.2,bevelEnabled:false,curveSegments:2});g.translate(0,0,-2.1);add(root,g,'#c9b89c',0,0,BZ);
 // 아치 테두리 돌
 const vs=[];for(let i=0;i<=16;i++){const a=i/16*Math.PI;vs.push([Math.cos(a)*5.8,-1.5+Math.sin(a)*4.1,BZ+2.15,0,[.7,.5,.12],i%2?'#e0d2b8':'#b8a688',0,a-Math.PI/2]);}inst(UB,M('#ffffff'),vs,false);
 // 난간 기둥 · 전구
 const ps=[],bulbs=[];[-1,1].forEach(sz=>{for(let i=0;i<=16;i++){const x=-9.5+19*i/16,y=QY+2.9*Math.cos(x/10*Math.PI/2)**.6+.05;ps.push([x,y+.45,BZ+sz*1.95,0,[.22,.9,.22],'#d8c8aa']);bulbs.push(new T.Vector3(x,y+1.0,BZ+sz*2.05));if(i<16){const x2=x+19/32,y2=QY+2.9*Math.cos(x2/10*Math.PI/2)**.6+.05;bulbs.push(new T.Vector3(x2,y2+.78,BZ+sz*2.05));}}});
 inst(UB,M('#ffffff'),ps);const rail=[];[-1,1].forEach(sz=>{for(let i=0;i<16;i++){const x=-9.5+19*(i+.5)/16,y=QY+2.9*Math.cos(x/10*Math.PI/2)**.6+.05;const x0=-9.5+19*i/16,x1=x0+19/16,y0=QY+2.9*Math.cos(x0/10*Math.PI/2)**.6,y1=QY+2.9*Math.cos(x1/10*Math.PI/2)**.6;rail.push([x,y+.95,BZ+sz*1.95,0,[1.25,.16,.3],'#e8dcc4',0,Math.atan2(y1-y0,x1-x0)]);}});inst(UB,M('#ffffff'),rail);
 var bulbGlow=glowPoints(bulbs,'#ffd890',.9,.25);var bulbCore=glowPoints(bulbs,'#fff4d0',.35);}
// ── 금빛 종탑 (오른쪽 다리 너머) ──
const TW=new T.Group();TW.position.set(13.4,QY,-61);root.add(TW);
{bx(TW,4.4,1,4.4,'#b8a688',0,.5,0);bx(TW,3.8,13,3.8,'#e8dcc0',0,7,0);for(let i=0;i<3;i++)bx(TW,4.0,.3,4.0,'#c8b89a',0,4+i*4,0);
 bx(TW,4.2,.4,4.2,'#c8b89a',0,13.6,0);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>bx(TW,.6,3.4,.6,'#e8dcc0',a*1.6,15.5,b*1.6));bx(TW,4.4,.5,4.4,'#c8b89a',0,17.4,0);
 add(TW,new T.ConeGeometry(3.1,5.5,4),'#3f7a7a',0,20.4,0,Math.PI/4);add(TW,new T.SphereGeometry(.35,8,6),M('#f2c24a',{metalness:.6,roughness:.3,emissive:L('#6a4a10')}),0,23.4,0);
 const bell=new T.LatheGeometry([[0,1.3],[.5,1.25],[.75,.9],[.9,.3],[1.15,0],[0,0]].map(p=>new T.Vector2(p[0],p[1])),12);add(TW,bell,M('#f2c24a',{metalness:.65,roughness:.3,emissive:L('#5a3a08')}),0,14.6,0);
 // 시계 (숫자 없이 눈금만)
 const cf=add(TW,new T.CircleGeometry(1.35,24),M('#fff8e8'),0,11.2,1.93);cf.castShadow=false;add(TW,new T.TorusGeometry(1.38,.1,4,24),M('#c8a040',{metalness:.5}),0,11.2,1.95);
 const tk=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2;tk.push([Math.cos(a)*1.12,11.2+Math.sin(a)*1.12,15.98-14,0,[.08,.24,.04],'#3a3a40',0,a+Math.PI/2]);}
 tk.forEach(p=>{const m=bx(TW,p[4][0],p[4][1],p[4][2],p[5],p[0],p[1],1.97);m.rotation.z=p[7];});
 const hh=bx(TW,.1,.7,.05,'#2a2a30',0,11.45,2.0);hh.rotation.z=-.9;hh.position.x=.27;const mh=bx(TW,.08,1.0,.05,'#2a2a30',.0,11.65,2.01);mh.rotation.z=.1;}
// ── 등대 (왼쪽 곶) ──
const LHP=[-11,1,-150];const LH=new T.Group();LH.position.set(...LHP);root.add(LH);
const beamU={op:{value:0},t:U.t};let beam;
{for(let i=0;i<6;i++){const r0=1.9-i*.12,r1=1.9-(i+1)*.12;add(LH,new T.CylinderGeometry(r1,r0,2,10),i%2?'#d84a42':'#f6f2ea',0,1+i*2,0);}
 add(LH,new T.CylinderGeometry(1.7,1.7,.3,12),'#3a3a44',0,12.15,0);const lamp=add(LH,new T.CylinderGeometry(.9,.9,1.6,8),new T.MeshStandardMaterial({color:L('#fff4c8'),emissive:L('#ffe08a'),emissiveIntensity:.6}),0,13.1,0);LH.userData.lamp=lamp;
 add(LH,new T.ConeGeometry(1.2,1.3,8),'#d84a42',0,14.55,0);add(LH,new T.CylinderGeometry(.9,.95,1.2,8),'#f6f2ea',-1.9,.6,1.6);
 const bg=new T.ConeGeometry(2.6,60,16,1,true);bg.translate(0,-30,0);bg.rotateZ(Math.PI/2);
 const bm=new T.ShaderMaterial({uniforms:beamU,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false,
  vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float op;varying vec2 vU;void main(){float a=pow(vU.y,2.2)*op*.22;gl_FragColor=vec4(vec3(1.,.93,.7)*a,1.);}'});
 beam=new T.Group();beam.position.set(0,13.1,0);const b1=new T.Mesh(bg,bm);const b2=new T.Mesh(bg,bm);b2.rotation.y=Math.PI;beam.add(b1,b2);LH.add(beam);beam.userData.noMirror=0;
 var lhGlow=glowPoints([new T.Vector3(LHP[0],LHP[1]+13.1,LHP[2])],'#ffe8a8',22);}
// ── 낚시 데크 (앞쪽 왼편) · 랜턴 · 어항 ──
const DK={x0:-CW,x1:-2.0,z0:-1.4,z1:4.6,y:.62};
{const pl=[];for(let z=DK.z0+.25;z<DK.z1;z+=.52)pl.push([(DK.x0+DK.x1)/2,DK.y,z,0,[DK.x1-DK.x0,.14,.46],rnd()<.5?'#b8814e':'#a8743f']);inst(UB,M('#ffffff'),pl);
 [[DK.x1-.2,DK.z0+.2],[DK.x1-.2,DK.z1-.2],[(DK.x0+DK.x1)/2,DK.z0+.2]].forEach(([x,z])=>bx(root,.36,2.2,.36,'#7a5232',x,DK.y-1.1,z));
 const kn=[];for(let x=DK.x0+.6;x<DK.x1;x+=1.0)kn.push([x,DK.y+.1,DK.z0+.12,0,[.16,.08,.16],'#6a4a30']);inst(UB,M('#ffffff'),kn,false);
 bx(root,DK.x1-DK.x0,.22,.22,'#8a5a36',(DK.x0+DK.x1)/2,DK.y+.02,DK.z0+.05);}
const lampPts2=[];const dLan=new T.Group();dLan.position.set(DK.x0+1.0,DK.y,DK.z0+.5);root.add(dLan);
const dLanM=new T.MeshStandardMaterial({color:L('#fff0c0'),emissive:L('#ffc060'),emissiveIntensity:0,transparent:true,opacity:.92});
{bx(dLan,.18,1.6,.18,'#2c2c34',0,.8,0);bx(dLan,.5,.08,.5,'#2c2c34',0,1.62,0);bx(dLan,.4,.5,.4,dLanM,0,1.92,0);bx(dLan,.52,.1,.52,'#2c2c34',0,2.2,0);}
var dGlow=glowPoints([new T.Vector3(DK.x0+1.0,DK.y+1.92,DK.z0+.5)],'#ffc060',5);ob(DK.x0+1.0,DK.z0+.5,.3);ob(DK.x0+1.1,DK.z0+.9,.6);ob(DK.x0+.7,DK.z0+1.7,.3);DECKR.push([DK.x0,DK.x1,DK.z0,DK.z1,Math.PI]);
// ── 낚시 자리 배치 (opt.seats = 25 여유·코지 | 50 촘촘) ──
const SEATN=+opt.seats===50?50:25,seats=[];
seats.push({pos:new T.Vector3(DK.x1-.9,DK.y+.07,DK.z0+.15),dir:Math.PI,me:1});
if(SEATN===50)seats.push({pos:new T.Vector3(DK.x1-2.4,DK.y+.07,DK.z0+.15),dir:Math.PI});
{const two=SEATN===50,need=two?24:24,slots=[];const SP=two?8.6:8.6;
 for(let k=0;k<20&&slots.length<60;k++){[-1,1].forEach(s=>{const z=(s<0?-9.5:-5)-k*SP;if(z<-125||Math.abs(z+48)<6.5)return;slots.push([s,z]);});}
 slots.sort((a,b)=>b[1]-a[1]);const use=slots.slice(0,need);
 const pl=[],po=[],lp=[],lg=[],lc=[],tg=[],tf=[],pot=[],rug=[],leaf=[],fl=[];const WD=two?4.6:3.2,DP=2.6,DY=.62;
 use.forEach(([s,z],i)=>{const xw=s*CW,xf=s*(CW-DP),cx=(xw+xf)/2;DECKR.push([Math.min(xw,xf-s*.15),Math.max(xw,xf-s*.15),z-WD/2,z+WD/2,s<0?Math.PI/2:-Math.PI/2]);ob(xw-s*.45,z-WD/2+.4,.25);ob(xw-s*.75,z+WD/2-.6,.55);if(!two)ob(xw-s*.5,z+.6,.28);
  for(let q=-WD/2+.25;q<WD/2;q+=.52)pl.push([cx,DY,z+q,0,[DP+.3,.14,.46],rnd()<.5?'#b8814e':'#a8743f']);
  po.push([xf+s*.2,DY-1.1,z-WD/2+.2,0,[.32,2.2,.32],'#7a5232']);po.push([xf+s*.2,DY-1.1,z+WD/2-.2,0,[.32,2.2,.32],'#7a5232']);
  po.push([xf+s*.08,DY+.02,z,0,[.2,.2,WD],'#8a5a36']);
  // 랜턴 (뒤쪽 모서리)
  const lx=xw-s*.45,lz=z-WD/2+.4;lp.push([lx,DY+.8,lz,0,[.16,1.6,.16],'#2c2c34']);lc.push([lx,DY+2.2,lz,0,[.5,.1,.5],'#2c2c34']);lg.push([lx,DY+1.92,lz,0,[.4,.5,.4]]);lampPts2.push(new T.Vector3(lx,DY+1.92,lz));
  const ns=two?2:1;for(let j=0;j<ns;j++){const sz=two?z+(j?1.15:-1.15):z+.2;seats.push({pos:new T.Vector3(s*(CW-DP+.45),DY+.07,sz),dir:s<0?Math.PI/2:-Math.PI/2});}
  // 어항 (자리마다 1개 · 50은 덱마다 1개)
  const tx=xw-s*.75,tz=z+WD/2-.6;tg.push([tx,DY+.5,tz,0,[.7,.7,1.0]]);tf.push([tx,DY+.13,tz,0,[.74,.12,1.04],'#3a5a66']);tf.push([tx,DY+.9,tz,0,[.74,.06,1.04],'#5a8a96']);
  if(!two){ // 코지 소품: 둥근 깔개 · 화분 · 꽃
   rug.push([s*(CW-DP+.75),DY+.08,z+.2,0,[.75,.03,.75],['#e8a0a0','#a0c8e8','#f0d080','#b8a0e0'][i%4]]);
   const px=xw-s*.5,pz=z+.6;pot.push([px,DY+.3,pz,0,[.26,.45,.26],'#f2ece0']);for(let k=0;k<5;k++)leaf.push([px+R(-.08,.08),DY+.85,pz+R(-.08,.08),R(0,6),[1,1,1],'#6aa84a',R(-.4,.4),R(-.4,.4)]);
   for(let k=0;k<3;k++)fl.push([px+R(-.12,.12),DY+1.15,pz+R(-.12,.12),0,[.11,.11,.11],['#ff7a9a','#ffd04a','#ffffff'][k]]);}
 });
 inst(UB,M('#ffffff'),pl);inst(UB,M('#ffffff'),po);inst(new T.CylinderGeometry(1,1.2,1,6),M('#ffffff'),lp);inst(UB,M('#ffffff'),lc);inst(UB,dLanM,lg,false);
 inst(UB,new T.MeshStandardMaterial({color:L('#bfe8f0'),transparent:true,opacity:.3,roughness:.05}),tg,false);inst(UB,M('#ffffff'),tf);
 if(rug.length){inst(new T.CylinderGeometry(1,1,1,16),M('#ffffff'),rug,false);inst(new T.CylinderGeometry(.5,.4,1,8),M('#ffffff'),pot);inst(new T.ConeGeometry(.07,.8,4),M('#ffffff'),leaf,false);inst(new T.IcosahedronGeometry(1,0),M('#ffffff'),fl,false);}
}
var dGlow2=glowPoints(lampPts2,'#ffc060',4);
// v160: 자리마다 게임과 같은 낚시 의자 (호숫가 의자와 같은 높이 비율) · 앉는 높이 y는 의자 위
{const sm=new T.InstancedMesh(new T.CylinderGeometry(.32,.34,.12,10),M('#ffffff'),seats.length),lm=new T.InstancedMesh(new T.CylinderGeometry(.07,.09,.5,6),M('#8a6a4a'),seats.length),o=new T.Object3D(),SC=['#ff9a6a','#6ab0e8','#f2c94a','#8fd08a'];
 seats.forEach((st,i)=>{const b=st.pos.y;o.position.set(st.pos.x,b+.23,st.pos.z);o.updateMatrix();lm.setMatrixAt(i,o.matrix);o.position.y=b+.53;o.updateMatrix();sm.setMatrixAt(i,o.matrix);sm.setColorAt(i,L(SC[i%4]));st.y=b+.57;});
 sm.instanceColor.needsUpdate=true;sm.castShadow=lm.castShadow=true;root.add(sm,lm);}
// 화분
{const pot=add(root,new T.CylinderGeometry(.28,.22,.45,8),'#f2ece0',DK.x0+.7,DK.y+.3,DK.z0+1.7);for(let i=0;i<5;i++){const l=add(root,new T.ConeGeometry(.07,.8,4),'#6aa84a',DK.x0+.7+R(-.1,.1),DK.y+.85,DK.z0+1.7+R(-.1,.1));l.rotation.z=R(-.4,.4);l.rotation.x=R(-.4,.4);}}
// 어항 + 참돔
const fishTex=opt.fishAtlas?new T.TextureLoader().load(opt.fishAtlas):null;if(fishTex)fishTex.encoding=T.sRGBEncoding;
{const tk=new T.Group();tk.position.set(DK.x0+1.1,DK.y+.07,DK.z0+.9);tk.scale.setScalar(.85);root.add(tk);bx(tk,1.3,.12,.8,'#3a5a66',0,.06,0);bx(tk,1.3,.06,.8,'#5a8a96',0,.96,0);
 const gl=new T.Mesh(new T.BoxGeometry(1.24,.84,.74),new T.MeshStandardMaterial({color:L('#bfe8f0'),transparent:true,opacity:.28,roughness:.05}));gl.position.y=.52;tk.add(gl);
 const wq=new T.Mesh(new T.BoxGeometry(1.2,.6,.7),new T.MeshStandardMaterial({color:L('#7fc8e0'),transparent:true,opacity:.35}));wq.position.y=.42;tk.add(wq);
 if(fishTex){const t2=fishTex.clone();t2.needsUpdate=true;t2.repeat.set(.25,1/3);t2.offset.set(.75,1/3);const f=new T.Mesh(new T.PlaneGeometry(.75,.38),new T.MeshBasicMaterial({map:t2,transparent:true,alphaTest:.3}));f.position.set(0,.5,.05);tk.add(f);tk.userData.fish=f;}}
// 물가 갈대·풀 (앞쪽)
{const rd=[];for(let i=0;i<60;i++){const s=rnd()<.6?-1:1;rd.push([s*(CW+R(.6,2.2)),QY+.35,R(-6,9),R(0,3),[R(.6,1),R(.8,1.4),R(.6,1)],rnd()<.5?'#5a9a48':'#7ab85a',R(-.25,.25)]);}
 const gg=merge([0,1,2].map(i=>{const c=new T.ConeGeometry(.08,1,3);c.rotateZ((i-1)*.35);c.translate((i-1)*.12,0,0);return c;}));inst(gg,M('#ffffff'),rd,false);}
// ── 수상 시장 (오른쪽 물가 노점 + 배) ──
function stripeTex(a,b){return canvasTex(64,16,(x,w,h)=>{for(let i=0;i<8;i++){x.fillStyle=i%2?a:b;x.fillRect(i*8,0,8,h);}x.fillStyle='rgba(0,0,0,.15)';x.fillRect(0,h-3,w,3);});}
const stripes=[stripeTex('#e8584a','#fff4e6'),stripeTex('#3a8a8a','#fff4e6'),stripeTex('#3a6ab8','#fff4e6'),stripeTex('#e8a83a','#fff4e6')];
const lanternM=new T.MeshStandardMaterial({color:L('#fff0d8'),emissive:L('#ffb060'),emissiveIntensity:.15,roughness:.6});const lanPts=[];
function stall(x,z,ry,k){ob(x,z-.75,.95);ob(x,z+.75,.95);const g=new T.Group();g.position.set(x,QY,z);g.rotation.y=ry;root.add(g);
 [[-1.2,-.8],[1.2,-.8],[-1.2,.8],[1.2,.8]].forEach(([a,b])=>bx(g,.14,2.6,.14,'#7a5232',a,1.3,b));bx(g,2.6,.9,1.4,'#b8814e',0,.45,.2);bx(g,2.7,.1,1.5,'#d8a870',0,.92,.2);
 const aw=new T.Mesh(new T.BoxGeometry(2.9,.08,2.0),[M('#e8e0d0'),M('#e8e0d0'),new T.MeshStandardMaterial({map:stripes[k%4],roughness:.8}),M('#e8e0d0'),M('#e8e0d0'),M('#e8e0d0')]);aw.position.set(0,2.7,.1);aw.rotation.x=-.18;aw.castShadow=true;g.add(aw);
 const fr=new T.Mesh(new T.BoxGeometry(2.9,.35,.04),new T.MeshStandardMaterial({map:stripes[k%4]}));fr.position.set(0,2.45,1.12);g.add(fr);
 for(let i=0;i<3;i++){const b=add(g,new T.CylinderGeometry(.3,.24,.26,8),'#c8945a',-.8+i*.8,1.1,.25);const col=k%2?['#ff8a3a','#e84a4a','#ffd04a'][i]:'#c8d4dc';for(let j=0;j<5;j++)add(g,new T.IcosahedronGeometry(.11,0),col,-.8+i*.8+R(-.12,.12),1.27,.25+R(-.12,.12)).castShadow=false;}
 if(fishTex&&k%2===0){const t2=fishTex.clone();t2.needsUpdate=true;t2.repeat.set(.25,1/3);t2.offset.set(.0,2/3);const f=new T.Mesh(new T.PlaneGeometry(1.1,.5),new T.MeshBasicMaterial({map:t2,transparent:true,alphaTest:.3}));f.position.set(0,3.25,1.0);g.add(f);bx(g,1.4,.7,.06,'#8a5a36',0,3.25,.96);}
 [-1.2,1.2].forEach(a=>{const l=add(g,new T.SphereGeometry(.22,8,6),lanternM,a,2.2,1.0);l.scale.y=1.3;l.castShadow=false;const v=new T.Vector3(a,2.2,1.0);g.updateMatrixWorld(true);lanPts.push(v.applyMatrix4(g.matrix));});return g;}
stall(CW+2.3,-4.5,-Math.PI/2,0);stall(CW+2.3,-13.5,-Math.PI/2,1);stall(CW+2.3,-16.6,-Math.PI/2,2);stall(-CW-2.3,-23.5,Math.PI/2,3);stall(-CW-2.3,-32.5,Math.PI/2,0);
var lanGlow=glowPoints(lanPts,'#ffb060',1.6);
const boats=[];function boat(x,z,k,awn){const g=new T.Group();g.position.set(x,0,z);root.add(g);
 const sh=new T.Shape();sh.moveTo(-2.2,.0);sh.quadraticCurveTo(-1.2,-.7,0,-.7);sh.quadraticCurveTo(1.2,-.7,2.4,.15);sh.lineTo(2.4,.55);sh.lineTo(-2.3,.55);
 const hg=new T.ExtrudeGeometry(sh,{depth:1.5,bevelEnabled:false});hg.translate(0,0,-.75);const hull=add(g,hg,k%2?'#8a5a36':'#3f6a8a',0,.1,0);bx(g,4.3,.12,1.6,'#c8945a',0,.62,0);
 if(awn){[[-1.4,-.65],[1.4,-.65],[-1.4,.65],[1.4,.65]].forEach(([a,b])=>bx(g,.08,1.5,.08,'#5a3a22',a,1.35,b));const aw=new T.Mesh(new T.BoxGeometry(3.2,.06,1.7),[M('#eee'),M('#eee'),new T.MeshStandardMaterial({map:stripes[(k+1)%4]}),M('#eee'),M('#eee'),M('#eee')]);aw.position.y=2.1;g.add(aw);}
 for(let i=0;i<3;i++){bx(g,.6,.4,.6,'#b8814e',-1+i*.9,.88,R(-.3,.3));for(let j=0;j<4;j++)add(g,new T.IcosahedronGeometry(.1,0),['#ff8a3a','#e84a4a','#ffd04a','#9ad04a'][(i+j)%4],-1+i*.9+R(-.15,.15),1.12,R(-.2,.2)).castShadow=false;}
 g.rotation.y=Math.PI/2+R(-.25,.25);boats.push({g,ph:rnd()*6,z0:z,x0:x});return g;}
boat(1.6,-12,0,1);boat(-1.4,-22,1,1);boat(1.8,-31,2,1);
// 곤돌라 (다리 근처 · 랜턴)
{const g=new T.Group();g.position.set(-1.5,0,-40);root.add(g);const sh=new T.Shape();sh.moveTo(-3,.6);sh.quadraticCurveTo(-1.5,-.3,0,-.35);sh.quadraticCurveTo(1.5,-.3,3,.8);sh.lineTo(2.8,.9);sh.quadraticCurveTo(1.4,.1,0,.1);sh.quadraticCurveTo(-1.4,.1,-2.8,.75);
 const hg=new T.ExtrudeGeometry(sh,{depth:.9,bevelEnabled:false});hg.translate(0,.05,-.45);add(g,hg,'#24242c',0,.1,0);bx(g,1.2,.12,.7,'#8a2a3a',0,.35,0);bx(g,.05,.8,.05,'#2c2c34',2.2,.9,0);
 const gl=add(g,new T.BoxGeometry(.24,.3,.24),lanternM,2.2,1.4,0);gl.castShadow=false;g.rotation.y=Math.PI/2-.2;boats.push({g,ph:2,z0:-40,x0:-1.5,glide:1});var gonG=g;}
// ── 연꽃 등불 (인스턴싱 36개 · 물길 따라 흘러가요) ──
const LOT=36,lotus=[];const petal=(()=>{const a=[];for(let i=0;i<8;i++){const c=new T.ConeGeometry(.15,.42,4);c.translate(0,.21,0);c.rotateZ(-.75);c.translate(.12,0,0);c.rotateY(i/8*Math.PI*2);a.push(c);}for(let i=0;i<6;i++){const c=new T.ConeGeometry(.12,.36,4);c.translate(0,.18,0);c.rotateZ(-.35);c.translate(.06,.03,0);c.rotateY(i/6*Math.PI*2+.3);a.push(c);}return merge(a);})();
const lotM=new T.MeshStandardMaterial({color:L('#ffd8b8'),emissive:L('#ff9a50'),emissiveIntensity:.3,roughness:.6,flatShading:true});const leafG=new T.CylinderGeometry(.55,.55,.04,10);
const lotI=new T.InstancedMesh(petal,lotM,LOT),leafI=new T.InstancedMesh(leafG,M('#4a8a48'),LOT);root.add(lotI,leafI);
for(let i=0;i<LOT;i++)lotus.push({x:R(-3.6,3.6),z:R(-130,6),s:R(1.5,2.2),ph:rnd()*6,v:R(.25,.45)});
const lotPts=new T.BufferGeometry();lotPts.setAttribute('position',new T.BufferAttribute(new Float32Array(LOT*3),3));{const rr=new Float32Array(LOT);for(let i=0;i<LOT;i++)rr[i]=rnd();lotPts.setAttribute('r',new T.BufferAttribute(rr,1));}
const lotGlow=new T.Points(lotPts,lampGlow.material.clone());lotGlow.material.uniforms.c.value=L('#ffb050');lotGlow.material.uniforms.sz.value=2.6;lotGlow.material.uniforms.tw.value=.25;lotGlow.material.uniforms.t=U.t;lotGlow.frustumCulled=false;root.add(lotGlow);
// ── 풍등 (밤) ──
const SKL=30,skl=[];const sklI=new T.InstancedMesh(new T.CylinderGeometry(.42,.3,.75,6),new T.MeshStandardMaterial({color:L('#ffd8a0'),emissive:L('#ff9a40'),emissiveIntensity:1.2}),SKL);root.add(sklI);
for(let i=0;i<SKL;i++)skl.push({x:R(-40,40),z:R(-160,-30),y:R(4,70),v:R(.6,1.1),ph:rnd()*6});
const sklPts=new T.BufferGeometry();sklPts.setAttribute('position',new T.BufferAttribute(new Float32Array(SKL*3),3));{const rr=new Float32Array(SKL);sklPts.setAttribute('r',new T.BufferAttribute(rr,1));}
const sklGlow=new T.Points(sklPts,lampGlow.material.clone());sklGlow.material.uniforms.c.value=L('#ff9a40');sklGlow.material.uniforms.sz.value=5;sklGlow.material.uniforms.t=U.t;sklGlow.frustumCulled=false;root.add(sklGlow);
// ── 별빛 고래 (달 맵 별자리처럼 점 + 선 + 반짝임) ──
const WH=new T.Group();WH.position.set(0,34,-110);root.add(WH);const whU={op:{value:0},t:U.t,sc:{value:600}};
{const top=[[-15,0],[-13,1.6],[-10,3.0],[-6,3.9],[-2,4.1],[2,3.8],[5.5,3.0],[8.5,2.0],[11,1.2],[13,.9]],bot=[[-15,0],[-13.5,-1.4],[-10,-2.8],[-6,-3.4],[-2,-3.3],[2,-2.7],[5.5,-1.8],[8.5,-1.0],[11,-.4],[13,.3]];
 const tail=[[13,.9],[15,2.6],[17.6,3.6],[16.4,1.0],[17.8,-1.6],[15,-.6],[13,.3]],fin=[[-5,-3.3],[-2.5,-6.2],[-.8,-6.6],[-1.2,-4.2],[-1,-3.2]];
 const lines=[],pts=[];const seg=(a)=>{for(let i=0;i<a.length-1;i++){lines.push(a[i],a[i+1]);}a.forEach(p=>pts.push([p[0],p[1],1+rnd()]));};
 seg(top);seg(bot);seg(tail);seg(fin);
 for(let k=0;k<4;k++){const y=-1.2-k*.5;seg([[-12+k*.3,y],[-6,y-.6+k*.05],[0,y-.2]].map(p=>[p[0],p[1]]));}
 pts.push([-11.5,.8,3.2]);// 눈
 for(let i=0;i<70;i++){const x=R(-14,12),yt=3.9*Math.sin(Math.max(0,Math.min(1,(x+15)/28))*Math.PI)*.95;pts.push([x,R(-2.6,yt*.9),rnd()*.7]);}
 const lg=new T.BufferGeometry();lg.setAttribute('position',new T.BufferAttribute(new Float32Array(lines.flatMap(p=>[p[0],p[1],0])),3));
 const wv='uniform float t;varying float vX;vec3 bend(vec3 p){float k=smoothstep(4.,17.,p.x);p.y+=sin(t*.9-p.x*.18)*.5+k*sin(t*.9)*1.6;return p;}';
 const lm=new T.ShaderMaterial({uniforms:whU,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,vertexShader:wv+'void main(){vX=position.x;gl_Position=projectionMatrix*modelViewMatrix*vec4(bend(position),1.);}',
  fragmentShader:'uniform float op;varying float vX;void main(){gl_FragColor=vec4(vec3(.62,.68,1.)*op*.75,1.);}'});
 const LS=new T.LineSegments(lg,lm);LS.frustumCulled=false;WH.add(LS);
 const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(new Float32Array(pts.flatMap(p=>[p[0],p[1],0])),3));pg.setAttribute('r',new T.BufferAttribute(new Float32Array(pts.map(p=>p[2])),1));
 const pm=new T.ShaderMaterial({uniforms:whU,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,vertexShader:wv+'uniform float sc;attribute float r;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(bend(position),1.);vA=.55+.45*sin(t*(1.+r)+r*30.+position.x);gl_PointSize=(1.1+r*1.1)*sc/-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform float op;varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d=length(q);float a=smoothstep(.5,.0,d);a=a*a*.9+smoothstep(.06,.0,abs(q.x))*smoothstep(.5,.0,abs(q.y))*.5+smoothstep(.06,.0,abs(q.y))*smoothstep(.5,.0,abs(q.x))*.5;gl_FragColor=vec4(vec3(.85,.88,1.)*a*vA*op,1.);}'});
 const PS=new T.Points(pg,pm);PS.frustumCulled=false;WH.add(PS);
 // 몸 속 은은한 빛 (반투명)
 const sh=new T.Shape();top.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));tail.slice(1).forEach(p=>sh.lineTo(p[0],p[1]));bot.slice().reverse().forEach(p=>sh.lineTo(p[0],p[1]));
 const fg=new T.ShapeGeometry(sh,8);const fm=new T.ShaderMaterial({uniforms:whU,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,vertexShader:wv+'varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(bend(position),1.);}',
  fragmentShader:'uniform float op;uniform float t;varying vec2 vP;void main(){float g=.5+.5*sin(vP.x*.4-t*.8);vec3 c=mix(vec3(.25,.22,.6),vec3(.45,.55,.95),g)*(.16+.1*smoothstep(-3.,4.,vP.y));gl_FragColor=vec4(c*op,1.);}'});
 const FM=new T.Mesh(fg,fm);WH.add(FM);WH.scale.setScalar(2.5);}
// ── 물속 나전빛 물고기 소용돌이 ──
const SWC=new T.Vector3(-.6,-.15,-9),SWN=36;const swU={op:{value:0},t:U.t,map:{value:fishTex}};let swI,swRing;
{const g=new T.PlaneGeometry(1.25,.55);g.rotateX(-Math.PI/2);const cell=new Float32Array(SWN);for(let i=0;i<SWN;i++)cell[i]=i%12;g.setAttribute('cell',new T.InstancedBufferAttribute(cell,1));
 const m=new T.ShaderMaterial({uniforms:swU,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
  vertexShader:'attribute float cell;varying vec2 vU;varying float vC;void main(){vC=cell;vec2 o=vec2(mod(cell,4.)*.25,(2.-floor(cell/4.))/3.);vU=o+uv*vec2(.25,1./3.);gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D map;uniform float op,t;varying vec2 vU;varying float vC;vec3 hsv(float h,float s,float v){vec3 k=clamp(abs(mod(h*6.+vec3(0,4,2),6.)-3.)-1.,0.,1.);return v*mix(vec3(1),k,s);}void main(){vec4 c=texture2D(map,vU);vec3 n=hsv(fract(vC*.13+t*.05+vU.x*2.),.45,1.);vec3 col=mix(c.rgb,n,.45)*(.55+.45*c.a);gl_FragColor=vec4(col*c.a*op*.75*vec3(.75,.95,1.15),1.);}'});
 swI=new T.InstancedMesh(g,m,SWN);swI.frustumCulled=false;swI.userData.noMirror=1;swI.renderOrder=3;root.add(swI);
 const rg=new T.PlaneGeometry(12,12);rg.rotateX(-Math.PI/2);swRing=new T.Mesh(rg,new T.ShaderMaterial({uniforms:swU,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
  vertexShader:'varying vec2 vU;void main(){vU=uv-.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float op,t;varying vec2 vU;vec3 hsv(float h,float s,float v){vec3 k=clamp(abs(mod(h*6.+vec3(0,4,2),6.)-3.)-1.,0.,1.);return v*mix(vec3(1),k,s);}void main(){float r=length(vU)*2.,a=atan(vU.y,vU.x);float sp=pow(max(0.,sin(r*16.-a*2.+t*1.2)),6.)*smoothstep(1.,.15,r)*smoothstep(.0,.15,r);float core=smoothstep(.35,.0,r)*.35;vec3 c=hsv(fract(r*.8-t*.05+a*.08),.55,1.);gl_FragColor=vec4(c*(sp*.55+core)*op,1.);}'}));
 swRing.position.copy(SWC);swRing.position.y=-.05;swRing.userData.noMirror=1;swRing.renderOrder=3;root.add(swRing);}
// ── 비 ──
const RN=1600;const rainU={op:{value:0},t:U.t,cp:{value:new T.Vector3()}};let rainL;
{const p=new Float32Array(RN*6),s=new Float32Array(RN*2);for(let i=0;i<RN;i++){const x=R(-22,22),y=R(0,22),z=R(-34,6);p.set([x,y,z,x,y,z],i*6);s[i*2]=0;s[i*2+1]=1;}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('e',new T.BufferAttribute(s,1));
 rainL=new T.LineSegments(g,new T.ShaderMaterial({uniforms:rainU,transparent:true,depthWrite:false,fog:false,
  vertexShader:'attribute float e;uniform float t;uniform vec3 cp;varying float vE;void main(){vec3 q=position;q.y=mod(q.y-t*16.,22.);q.x+=cp.x;q.z+=cp.z;q.x+=e*.06;q.y-=e*.8;vE=e;gl_Position=projectionMatrix*modelViewMatrix*vec4(q,1.);}',
  fragmentShader:'uniform float op;varying float vE;void main(){gl_FragColor=vec4(vec3(.85,.9,1.),.38*op*(1.-vE*.6));}'}));rainL.frustumCulled=false;rainL.userData.noMirror=1;root.add(rainL);}
// ── 쌍무지개 ──
const rbU={op:{value:0}};
// v2: 하늘을 크게 가로지르는 부드러운 반투명 쌍무지개 — 띠 가장자리는 종 모양으로 사라지고, 끝은 지평선 안개 속으로 녹아요
function rbow(r0,r1,rev,a){const g=new T.RingGeometry(r0,r1,256,4,0,Math.PI);const m=new T.ShaderMaterial({uniforms:{op:rbU.op,r0:{value:r0},r1:{value:r1},rev:{value:rev},a:{value:a},hz:{value:new T.Color()}},transparent:true,depthWrite:false,fog:false,side:T.DoubleSide,
 vertexShader:'varying vec3 vP;varying vec3 vW;void main(){vP=position;vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`uniform float op,r0,r1,rev,a;uniform vec3 hz;varying vec3 vP;varying vec3 vW;
 vec3 spec(float x){ // 0 보라 → 1 빨강, 색 사이가 부드럽게 섞여요
  vec3 c=vec3(0.);c+=vec3(.55,.35,1.)*exp(-pow((x-.05)/.11,2.));c+=vec3(.2,.45,1.)*exp(-pow((x-.24)/.11,2.));c+=vec3(.25,.9,.4)*exp(-pow((x-.45)/.11,2.));
  c+=vec3(1.,.9,.2)*exp(-pow((x-.63)/.1,2.));c+=vec3(1.,.5,.15)*exp(-pow((x-.79)/.1,2.));c+=vec3(1.,.22,.25)*exp(-pow((x-.95)/.12,2.));return c;}
 void main(){float r=(length(vP.xy)-r0)/(r1-r0);if(rev>.5)r=1.-r;float prof=pow(max(sin(3.14159*clamp(r,0.,1.)),0.),1.15);
  vec3 c=spec(r)*1.32;float ang=atan(vP.y,vP.x);float ends=smoothstep(0.,.5,ang)*smoothstep(3.1416,2.64,ang);
  float lo=smoothstep(-4.,70.,vW.y);float al=prof*ends*lo*op*a;gl_FragColor=vec4(c,min(1.,al*1.05));}`});
 const o=new T.Mesh(g,m);o.position.set(12,-40,-420);o.renderOrder=-4;root.add(o);return o;}
const rb1=rbow(190,238,0,1),rb2=rbow(266,292,1,.6);
// 무지개 안쪽이 살짝 밝아지는 빛
const rbIn=new T.Mesh(new T.CircleGeometry(196,96,0,Math.PI),new T.ShaderMaterial({uniforms:{op:rbU.op},transparent:true,depthWrite:false,fog:false,
 vertexShader:'varying vec3 vP;varying vec3 vW;void main(){vP=position;vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform float op;varying vec3 vP;varying vec3 vW;void main(){float r=length(vP.xy)/196.;float a=smoothstep(.55,1.,r)*smoothstep(1.,.97,r)*smoothstep(0.,80.,vW.y);gl_FragColor=vec4(1.,1.,1.,a*op*.12);}'}));
rbIn.position.set(12,-40,-421);rbIn.renderOrder=-5;root.add(rbIn);
// ── 오로라 v2: 하늘 돔에 그리는 주름진 커튼 (층마다 하늘 평면을 훑어 세로 빛줄기 + 노이즈 흐름, 초록→분홍) ──
const auU={op:{value:0},t:U.t};
const aur=new T.Mesh(new T.SphereGeometry(850,64,24,0,Math.PI*2,0,Math.PI*.52),new T.ShaderMaterial({uniforms:auU,side:T.BackSide,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
 vertexShader:'varying vec3 vW;void main(){vW=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(vW,1.);}',
 fragmentShader:`uniform float op,t;varying vec3 vW;
float h1(float x){return fract(sin(x*127.1)*43758.5453);}
float n1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h1(i),h1(i+1.),f);}
float fb(float x){return n1(x)*.55+n1(x*2.3+5.1)*.3+n1(x*5.7+1.7)*.15;}
// 커튼 하나: 하늘 평면 위 중심선(접히며 흘러요)과 빛줄기
vec3 curtain(vec2 p,float z0,float amp,float fq,float ph,float hi,float pinkish){
 float x=p.x;float c=z0+sin(x*fq+ph+t*.06)*amp+sin(x*fq*2.7-t*.09+ph*2.)*amp*.35+(fb(x*.35+t*.03+ph)-.5)*amp*1.2;
 float d=abs(p.y-c);float w=(.06+.05*fb(x*.8+ph))*(1.+abs(c)*.45);float band=exp(-d*d/(w*w));
 float rays=.18+.82*pow(fb(x*7.+fb(x*.9+t*.12+ph)*4.+t*.18),2.2);rays*=.6+.4*n1(x*26.-t*.5);
 float edge=smoothstep(-9.,-4.,x)*smoothstep(10.,5.,x);
 return vec3(band*rays*edge,hi,pinkish);}
void main(){vec3 d=normalize(vW-cameraPosition);if(d.y<.015){gl_FragColor=vec4(0.);return;}
 vec3 acc=vec3(0.);const int N=36;float jt=fract(sin(dot(d.xz,vec2(1291.7,3197.3)))*43758.5);
 for(int i=0;i<N;i++){float fi=(float(i)+jt)/float(N);float hg=1.+fi*2.;vec2 p=d.xz/d.y*hg*.55+vec2(0.,0.);
  float lw=exp(-fi*2.6);float up=smoothstep(.15,.85,fi);
  vec3 g=vec3(.15,1.,.42),tq=vec3(.2,.95,.75),pk=vec3(1.,.32,.78),vi=vec3(.62,.36,1.);
  // 세 겹 커튼 (가까운 초록 · 가운데 초록분홍 · 먼 분홍)
  vec3 a=curtain(p,-2.6,.6,1.3,0.,0.,0.);vec3 b=curtain(p,-3.8,.8,1.,2.3,0.,0.);vec3 c3=curtain(p,-5.6,.9,.6,4.1,0.,0.);
  float pkL=smoothstep(1.5,-3.5,p.x);// 왼쪽 하늘은 분홍빛이 더 짙어요 (D 시안)
  vec3 colA=mix(mix(g,tq,fi*.6),pk,up*(.55+pkL*.45));
  vec3 colB=mix(mix(g,tq,.3),pk,clamp(up*.8+pkL*.35,0.,1.));
  vec3 colC=mix(pk,vi,fi);
  acc+=(colA*a.x*1.1+colB*b.x*.9+colC*c3.x*.6)*mix(lw,.6*(1.-fi*.8),up);}
 acc*=.62;
 // 하늘에 번지는 은은한 빛
 float el=d.y;acc+=vec3(.05,.35,.22)*smoothstep(.0,.25,el)*smoothstep(.75,.2,el)*.25;
 acc*=smoothstep(.015,.08,d.y);
 gl_FragColor=vec4(acc*op,1.);}`}));
aur.renderOrder=-7;aur.frustumCulled=false;root.add(aur);
// ── 반딧불이 ──
const FF=180;let ffly;{const p=new Float32Array(FF*3),r=new Float32Array(FF);for(let i=0;i<FF;i++){const s=rnd()<.55?-1:1;p.set([s*(CW+R(-.8,4)),QY+R(.3,2.6),R(-40,9)],i*3);r[i]=rnd();}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('r',new T.BufferAttribute(r,1));
 ffly=new T.Points(g,new T.ShaderMaterial({uniforms:{op:{value:0},t:U.t,sc:{value:600}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
  vertexShader:'attribute float r;uniform float t,sc;varying float vA;void main(){vec3 q=position;q.x+=sin(t*.4+r*20.)*.8;q.y+=sin(t*.6+r*13.)*.4;q.z+=cos(t*.35+r*9.)*.8;vec4 mv=modelViewMatrix*vec4(q,1.);vA=pow(.5+.5*sin(t*(1.+r*1.5)+r*40.),2.);gl_PointSize=.55*sc/-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform float op;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);a*=a;gl_FragColor=vec4(vec3(1.,.95,.55)*a*vA*op*1.4,1.);}'}));ffly.frustumCulled=false;root.add(ffly);}
// ── 멀리 고래 (바다 · 숨쉬기 물기둥) ──
const BW=new T.Group();BW.position.set(6,-3,-205);BW.scale.setScalar(1.75);root.add(BW);let spout;
{const bm=M('#5a6a9a');const b=add(BW,new T.SphereGeometry(1,10,7),bm,0,0,0);b.scale.set(7,2.2,2.6);add(BW,new T.SphereGeometry(1,8,6),M('#dfe4f0'),0,-.9,0).scale.set(6,1,2.2);
 const tl=add(BW,new T.BoxGeometry(3,.25,4),bm,8,.6,0);tl.rotation.z=.4;const fn=add(BW,new T.BoxGeometry(1.8,.2,.9),bm,-1,-1.2,2.4);fn.rotation.x=.6;
 const ey=add(BW,new T.SphereGeometry(.22,6,4),'#1a1a24',-5.2,.3,2.2);
 const sp=[];for(let i=0;i<60;i++)sp.push(new T.Vector3(0,0,0));const sg=new T.BufferGeometry().setFromPoints(sp);const rr=new Float32Array(60);for(let i=0;i<60;i++)rr[i]=rnd();sg.setAttribute('r',new T.BufferAttribute(rr,1));
 spout=new T.Points(sg,new T.ShaderMaterial({uniforms:{op:{value:0},k:{value:0},sc:{value:600}},transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false,
  vertexShader:'attribute float r;uniform float k,sc;void main(){float a=r*6.283;float h=k*(4.+r*3.);vec3 q=vec3(cos(a)*k*k*(1.+r)*1.4,h-k*k*2.*r,sin(a)*k*k*(1.+r)*1.4);vec4 mv=modelViewMatrix*vec4(q,1.);gl_PointSize=(1.2+r)*sc/-mv.z;gl_Position=projectionMatrix*mv;}',
  fragmentShader:'uniform float op,k;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);gl_FragColor=vec4(vec3(.75,1.,.9)*a*op*(1.-k)*.9,1.);}'}));spout.position.set(-4,1.6,0);spout.frustumCulled=false;BW.add(spout);}
// ── 빛 ──
const sunL=new T.DirectionalLight(0xffffff,1);sunL.castShadow=true;sunL.shadow.mapSize.set(2048,2048);Object.assign(sunL.shadow.camera,{left:-38,right:38,top:38,bottom:-38,near:1,far:400});sunL.shadow.bias=-.0006;
const sunT=new T.Object3D();root.add(sunT);sunT.position.set(0,0,-18);sunL.target=sunT;
const hemi=new T.HemisphereLight(0xffffff,0x444444,.6),amb=new T.AmbientLight(0xffffff,.2);
const pL=[new T.PointLight(0xffb060,0,9,2),new T.PointLight(0xffc070,0,10,2),new T.PointLight(0xffc070,0,10,2)];pL[0].position.set(DK.x0+1.0,DK.y+2.0,DK.z0+.5);pL[1].position.set(-CW-1.1,QY+3,-1);pL[2].position.set(CW+1.1,QY+3,-10);
root.add(sunL,hemi,amb,...pL);
// ── 상태 전환 ──
function setState(n,dur){if(!ST[n])return;for(const k in cur){if(cur[k] instanceof T.Color)from[k].copy(cur[k]);else from[k]=cur[k];}to=ST[n];curName=n;tD=dur==null?4:dur;tB=tD<=0?1:0;if(tD<=0)apply(1);}
function apply(p){const e=p*p*(3-2*p);for(const k in cur){if(cur[k] instanceof T.Color)cur[k].copy(from[k]).lerp(to[k],e);else cur[k]=from[k]+(to[k]-from[k])*e;}}
let scn=null;function attach(scene){scn=scene;sky.position.x=stars.position.x=OX;scene.add(sky,stars,disc,discCore);[sky,stars,disc,discCore].forEach(o=>o.layers.enable(1));scene.fog=scene.fog||new T.Fog(0xffffff,50,400);}
const _v=new T.Vector3();let time=0;
function update(dt,cam){time+=dt;U.t.value=time;if(tB<1){tB=Math.min(1,tB+dt/tD);apply(tB);}const c=cur;
 skyU.top.value.copy(c.skyTop);skyU.mid.value.copy(c.skyMid);skyU.hor.value.copy(c.skyHor);skyU.sunC.value.copy(c.sun);skyU.glow.value=c.glow;
 const sp=_v.set(c.sx,c.sy,c.sz);skyU.sunD.value.copy(sp).normalize();wU.sunD.value.copy(sp).normalize();wU.sunC.value.copy(c.sun);
 if(scn&&scn.fog){scn.fog.color.copy(c.fog);scn.fog.near=c.fogN;scn.fog.far=c.fogF;}
 const dd=sp.clone().normalize().multiplyScalar(840);disc.position.copy(dd).add(root.position);disc.scale.setScalar(210*c.discS+.001);disc.material.color.copy(c.disc);disc.material.opacity=Math.min(1,c.discS*1.2);
 discCore.position.copy(dd).add(root.position);discCore.lookAt(cam.position);discCore.scale.setScalar(36*c.discS+.001);discCore.material.color.copy(c.disc);discCore.material.opacity=Math.min(1,c.discS*1.5);
 starsU.op.value=c.stars;
 sunL.position.copy(sp).normalize().multiplyScalar(160).add(sunT.position);sunL.color.copy(c.sun);sunL.intensity=c.sunI;hemi.color.copy(c.hemS);hemi.groundColor.copy(c.hemG);hemi.intensity=c.hemI;amb.intensity=c.amb;
 cloudM.color.copy(c.cloud);cloudM.opacity=c.cloudO;
 wU.deep.value.copy(c.deep);wU.shal.value.copy(c.shal);wU.mirror.value=opt.noMirror?0:c.mirror;wU.wave.value=c.wave;wU.nacre.value=c.nacre;wU.glint.value=c.glint;wU.rain.value=c.rain;
 quayM.color.copy(c.quay).lerp(SNOWC,XF.snow*.75);quayM.roughness=.9-c.wet*.6;quayM.metalness=c.wet*.15;
 const li=c.lights;winM.emissiveIntensity=li*1.15;winM.color.setRGB(.06+.1*(1-li),.12+.1*(1-li),.2+.1*(1-li));winM2.emissiveIntensity=li*.12;lampHM.emissiveIntensity=li*1.6;dLanM.emissiveIntensity=li*1.5;lanternM.emissiveIntensity=.15+li*1.3;
 lampGlow.material.uniforms.op.value=li*.9;poolM.opacity=li*.5;bulbGlow.material.uniforms.op.value=li*.8;bulbCore.material.uniforms.op.value=li;dGlow.material.uniforms.op.value=li;dGlow2.material.uniforms.op.value=li;lanGlow.material.uniforms.op.value=li*.8;
 pL[0].intensity=li*1.6;pL[1].intensity=li*.6;pL[2].intensity=li*.5;
 // 연꽃 등불
 const o=new T.Object3D(),lp=lotPts.attributes.position;for(let i=0;i<LOT;i++){const L0=lotus[i];L0.z-=dt*L0.v;if(L0.z<-132)L0.z=6;const k=c.lotus*L0.s*Math.min(1,(6-L0.z)/3);
  o.position.set(L0.x+Math.sin(time*.3+L0.ph)*.3,.03+Math.sin(time*1.2+L0.ph)*.02,L0.z);o.rotation.set(0,time*.1+L0.ph,0);o.scale.setScalar(k+.0001);o.updateMatrix();lotI.setMatrixAt(i,o.matrix);leafI.setMatrixAt(i,o.matrix);lp.setXYZ(i,o.position.x,.3,o.position.z);}
 lotI.instanceMatrix.needsUpdate=leafI.instanceMatrix.needsUpdate=true;lp.needsUpdate=true;lotGlow.material.uniforms.op.value=c.lotus*Math.max(.35,li);lotM.emissiveIntensity=.25+li*.9;
 // 풍등
 const sp2=sklPts.attributes.position;for(let i=0;i<SKL;i++){const q=skl[i];q.y+=dt*q.v;if(q.y>80)q.y=3;o.position.set(q.x+Math.sin(time*.2+q.ph)*2,q.y,q.z);o.rotation.set(0,0,0);o.scale.setScalar(c.skyLant*Math.min(1,(q.y-3)/4)+.0001);o.updateMatrix();sklI.setMatrixAt(i,o.matrix);sp2.setXYZ(i,o.position.x,o.position.y,o.position.z);}
 sklI.instanceMatrix.needsUpdate=true;sp2.needsUpdate=true;sklGlow.material.uniforms.op.value=c.skyLant*.8;
 // 별빛 고래
 whU.op.value=c.whale;WH.position.x=2+Math.sin(time*.04)*10;WH.position.y=31+Math.sin(time*.25)*1.2;WH.visible=c.whale>.01;
 // 물고기 소용돌이
 swU.op.value=c.swirl;swI.visible=swRing.visible=c.swirl>.01;if(swI.visible){for(let i=0;i<SWN;i++){const r=2.2+(i%3)*1.45+Math.sin(i*1.7)*.3,a=time*(.35-(i%3)*.06)+i/SWN*Math.PI*2*3+(i%3);o.position.set(SWC.x+Math.cos(a)*r,SWC.y-(i%3)*.15,SWC.z+Math.sin(a)*r*.9);o.rotation.set(0,-a-Math.PI/2,0);o.scale.setScalar(1.8+(i%4)*.18);o.updateMatrix();swI.setMatrixAt(i,o.matrix);}swI.instanceMatrix.needsUpdate=true;}
 // 비
 rainU.op.value=c.rain;rainL.visible=c.rain>.01;if(cam){rainU.cp.value.set(cam.position.x-OX,0,cam.position.z);}
 rbU.op.value=c.rainbow;rb1.visible=rb2.visible=rbIn.visible=c.rainbow>.01;
 auU.op.value=c.aurora;aur.visible=c.aurora>.01;{const fl=Math.max(c.flies,XF.flies);ffly.material.uniforms.op.value=fl;ffly.visible=fl>.01;}
 beamU.op.value=c.beam;beam.rotation.y=time*.5;LH.userData.lamp.material.emissiveIntensity=.4+c.beam*2;lhGlow.material.uniforms.op.value=c.beam*.8;
 // 멀리 고래: 18초마다 숨 쉬러 올라와요
 const cy=(time%18)/18;const up=Math.sin(Math.min(1,cy/.6)*Math.PI);BW.position.y=-4.2+c.bigWhale*up*4.6;BW.rotation.z=-.08+up*.08;BW.visible=c.bigWhale>.01;const sk=(cy-.18)/.3;spout.material.uniforms.k.value=Math.max(0,Math.min(1,sk));spout.material.uniforms.op.value=c.bigWhale*(sk>0&&sk<1?1:0);
 // 배 흔들림
 for(const b of boats){b.g.position.y=Math.sin(time*1.1+b.ph)*.05;b.g.rotation.z=Math.sin(time*.9+b.ph)*.025;if(b.glide){b.g.position.z=b.z0+Math.sin(time*.05)*6;}}
 const sc=(cam&&window.innerHeight)?(window.__nkCanalH||innerHeight)/(2*Math.tan(cam.fov*Math.PI/360)):600;[lampGlow,dGlow2,bulbGlow,bulbCore,dGlow,lanGlow,lotGlow,sklGlow,lhGlow,ffly,spout].forEach(p=>{p.material.uniforms.sc&&(p.material.uniforms.sc.value=sc);});whU.sc.value=sc;
}
// ── 거울 반사 (물 높이 y=0 · 해상도 절반) ──
const mCam=new T.PerspectiveCamera(),plane=new T.Plane(new T.Vector3(0,1,0),.02),hideL=[];
function mirror(r,scene,cam){const w=r.domElement.width>>1,h=r.domElement.height>>1;if(RT.width!==w||RT.height!==h)RT.setSize(w,h);
 cam.updateMatrixWorld();mCam.copy(cam);const p=cam.position,q=new T.Vector3();cam.getWorldDirection(q);mCam.position.set(p.x,-p.y,p.z);const rm=new T.Matrix4().extractRotation(cam.matrixWorld);mCam.up.set(0,1,0).applyMatrix4(rm).reflect(new T.Vector3(0,1,0));
 const tg=p.clone().add(q);mCam.lookAt(tg.x,-tg.y,tg.z);mCam.projectionMatrix.copy(cam.projectionMatrix);mCam.layers.set(1);mCam.updateMatrixWorld();mCam.matrixWorldInverse.copy(mCam.matrixWorld).invert();
 texMat.set(.5,0,0,.5, 0,.5,0,.5, 0,0,.5,.5, 0,0,0,1);texMat.multiply(mCam.projectionMatrix).multiply(mCam.matrixWorldInverse);
 hideL.length=0;[water,swI,swRing,rainL].forEach(o=>{if(o.visible){o.visible=false;hideL.push(o);}});
 const cp=r.clippingPlanes,rt=r.getRenderTarget(),sh=r.shadowMap.autoUpdate;r.shadowMap.autoUpdate=false;const rbo=rbU.op.value;rbU.op.value=rbo*.45;r.clippingPlanes=[plane];r.setRenderTarget(RT);r.clear();r.render(scene,mCam);rbU.op.value=rbo;r.setRenderTarget(rt);r.clippingPlanes=cp;r.shadowMap.autoUpdate=sh;hideL.forEach(o=>o.visible=true);}
// 힐링 포인트 (자동 둘러보기용) · 카메라 위치 · 바라볼 곳 · 자막
const POI={
 sun:{n:'운하 끝 노을',d:'운하 끝으로 해가 지면 물이 거울처럼 하늘을 비춰요',cam:[-1.5,2.6,7],tg:[0,9,-120]},
 lotus:{n:'흘러가는 연꽃 등불',d:'작은 소원을 담은 등불이 물길을 따라 천천히 흘러가요',cam:[3.5,1.6,-3],tg:[-1,.2,-24]},
 whale:{n:'별빛 고래',d:'밤이 되면 별자리 고래가 마을 지붕 위를 헤엄쳐요',cam:[-2.5,2.2,5],tg:[0,30,-110]},
 swirl:{n:'나전빛 물고기 소용돌이',d:'밤 물속에서 바다 물고기들이 자개빛으로 빙글빙글 돌아요',cam:[-3.5,5.5,1],tg:[-.6,0,-9]},
 rainbow:{n:'비 갠 뒤 쌍무지개',d:'비가 그치면 금빛 종탑 너머로 무지개가 떠요',cam:[-3,2.4,8],tg:[8,22,-140]},
 market:{n:'수상 시장',d:'바다 물고기와 과일을 파는 배와 노점이 모여 있어요',cam:[1,3,4],tg:[7,1.5,-14]},
 aurora:{n:'오로라와 등대',d:'운이 좋은 밤에는 등대 위로 오로라가 흘러요',cam:[1,7,-82],tg:[-6,22,-220]},
 tower:{n:'금빛 종탑',d:'정시마다 종이 울려 물때가 바뀌는 걸 알려줘요',cam:[2,3,-26],tg:[14,13,-63]}};
const TOURS={day:['market','tower','lotus'],sunset:['sun','lotus','tower'],night:['whale','swirl','lotus'],rain:['market','tower'],rainbow:['rainbow','tower','market'],aurora:['aurora','whale','swirl']};
// v161: 계절 (나무 색) · 눈 (지붕·나무·물가가 하얗게) — 날씨 화면(눈·벚꽃·낙엽)은 게임의 날씨 그림을 그대로 써요
const XF={snow:0,flies:0},SNOWC=L('#f2f5f8');let seaK='',snowK=-1;
const keepC=m=>{const a=[];for(let i=0;i<m.count;i++){const c=new T.Color();m.getColorAt(i,c);a.push(c);}return a;};
const TC0=keepC(treeI),RA0=keepC(roofIA),RB0=keepC(roofIB);
const SEAP={spring:['#f6b8cc','#f9cddb','#f2a6c0','#8fc46a'],summer:null,autumn:['#e2863a','#d0602e','#e8b03a','#b8502a'],winter:['#6f8f6a','#5f8360','#7a9874','#58785a']};
function recolor(){const p=SEAP[seaK],w=XF.snow,c=new T.Color();
 TC0.forEach((c0,i)=>{c.copy(p?L(p[(i*7)%p.length]):c0);if(w>0)c.lerp(SNOWC,w*.7);treeI.setColorAt(i,c);});treeI.instanceColor.needsUpdate=true;
 [[roofIA,RA0],[roofIB,RB0]].forEach(([m,a])=>{a.forEach((c0,i)=>{c.copy(c0);if(w>0)c.lerp(SNOWC,w*.8);m.setColorAt(i,c);});m.instanceColor.needsUpdate=true;});}
function setSeason(k,snow,flies){snow=Math.max(0,Math.min(1,+snow||0));XF.flies=+flies||0;const sk=Math.round(snow*20);if(k===seaK&&sk===snowK)return;seaK=k;snowK=sk;XF.snow=snow;recolor();}
// v161: 움직이지 않는 물체는 재질별로 한 덩어리로 합쳐서 그리기 횟수를 줄여요 (배·고래·등대 빛은 빼요)
function mergeIn(box,skip){box.updateMatrixWorld(true);const inv=new T.Matrix4().copy(box.matrixWorld).invert(),mats=new Set(Object.values(MM)),G=new Map();
 const key=mt=>mats.has(mt)?'V|'+[mt.roughness,mt.metalness,mt.emissive?mt.emissive.getHexString()+mt.emissiveIntensity:'',mt.flatShading?1:0,mt.side].join('|'):mt;
 box.traverse(m=>{if(!m.isMesh||Array.isArray(m.material)||m.material.isShaderMaterial||m.material.transparent)return;if(m.isInstancedMesh&&!mats.has(m.material))return;for(let p=m;p&&p!==box;p=p.parent)if(skip.has(p))return;if(skip.has(m))return;const k=key(m.material);if(!G.has(k))G.set(k,[]);G.get(k).push(m);});
 let n=0;const M4=new T.Matrix4(),IM=new T.Matrix4(),C=new T.Color();
 G.forEach((list,k)=>{const vc=typeof k==='string';let cnt=list.reduce((a,m)=>a+(m.isInstancedMesh?m.count:1),0);if(cnt<2)return;const gs=[],keepUV=!vc&&!!list[0].material.map;
  list.forEach(m=>{const base=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();for(const a in base.attributes)if(a!=='position'&&a!=='normal'&&!(keepUV&&a==='uv'))base.deleteAttribute(a);if(!base.attributes.normal)base.computeVertexNormals();
   M4.multiplyMatrices(inv,m.matrixWorld);const N=m.isInstancedMesh?m.count:1;
   for(let i=0;i<N;i++){const g=base.clone();if(m.isInstancedMesh){m.getMatrixAt(i,IM);g.applyMatrix4(new T.Matrix4().multiplyMatrices(M4,IM));C.copy(m.material.color);if(m.instanceColor){const c2=new T.Color();m.getColorAt(i,c2);C.multiply(c2);}}else{g.applyMatrix4(M4);C.copy(m.material.color);}
    if(vc){const nv=g.attributes.position.count,ca=new Float32Array(nv*3);for(let j=0;j<nv;j++){ca[j*3]=C.r;ca[j*3+1]=C.g;ca[j*3+2]=C.b;}g.setAttribute('color',new T.BufferAttribute(ca,3));}gs.push(g);}});
  const mg=BG.mergeBufferGeometries(gs);if(!mg)return;let mt=list[0].material;if(vc){mt=mt.clone();mt.color.set(0xffffff);mt.vertexColors=true;}const mm=new T.Mesh(mg,mt);mm.frustumCulled=false;mm.receiveShadow=mm.castShadow=true;box.add(mm);
  list.forEach(m=>{m.parent.remove(m);if(m.isInstancedMesh)m.dispose();});n+=cnt-1;});return n;}
function mergeStill(){const dyn=[...boats.map(b=>b.g),WH,BW,beam];let n=mergeIn(root,new Set([...dyn,leafI,lotI,sklI,treeI,roofIA,roofIB]));boats.forEach(b=>{n+=mergeIn(b.g,new Set());});return n;}
const merged=mergeStill();
// 물에 비치는 것만 레이어 1 (작은 꽃·화분·풀 같은 건 빼서 거울 그리기를 가볍게)
root.traverse(o=>{if(o.isLight){o.layers.enable(1);return;}if(!(o.isMesh||o.isPoints||o.isLine))return;if(o.isInstancedMesh){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();const e=new T.Matrix4(),q=new T.Vector3(),sc=new T.Vector3(),r=new T.Quaternion();let mx=0;for(let i=0;i<Math.min(o.count,6);i++){o.getMatrixAt(i,e);e.decompose(q,r,sc);mx=Math.max(mx,sc.x,sc.y,sc.z);}if(g.boundingSphere.radius*mx<.45)return;}o.layers.enable(1);});
const deckAt=(x,z)=>{for(const r of DECKR)if(x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3])return r[4];return null;};
// v160: 걷기 · 땅 높이 · 물 판정 (운하 좌표 = 월드 x − OX)
const BRH=lx=>QY+2.9*Math.pow(Math.max(0,Math.cos(lx/10*Math.PI/2)),.6)+.05;
const onDeck=(x,z)=>{for(const r of DECKR)if(x>=r[0]&&x<=r[1]&&z>=r[2]&&z<=r[3])return true;return false;};
function ground(x,z){const ax=Math.abs(x);if(Math.abs(z-BZ)<2.1&&ax<10)return BRH(x);if(onDeck(x,z))return DK.y+.07;if(ax>=CW&&z<44&&z>-130)return ax<CW+.85?QY+.1:QY;return -.05;}
function waterAt(x,z){const ax=Math.abs(x);if(ax>CW-.2||z>40||z<-128)return false;if(Math.abs(z-BZ)<2.3&&ax>5.2)return false;return !onDeck(x,z);}
function walk(x,z){const ax=Math.abs(x);if(z>40||z<-127)return false;const br=Math.abs(z-BZ)<2.1;
 if(br){if(ax<9.6&&Math.abs(Math.abs(z-BZ)-1.95)<.22)return false;if(ax>(Math.abs(z-BZ+0)<5?14:HX-.5))return false;if(ax<10)return true;}
 else if(ax>HX-.5&&!(Math.abs(z-BZ)<5&&ax<14))return false;
 if(ax<CW&&!onDeck(x,z))return false;for(const o of OBS)if((x-o[0])*(x-o[0])+(z-o[1])*(z-o[1])<o[2]*o[2])return false;return true;}
return {group:root,attach,update,mirror,setState,setSeason,deckAt,merged,walk,ground,water:waterAt,obs:OBS,state:()=>curName,states:Object.keys(S0),POI,TOURS,seat:seats[0],seats,seatN:SEATN,spawn:[OX-4,DK.y,2,Math.PI],deck:DK};}
return {build,STATES:S0};})();
