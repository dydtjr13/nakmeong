// 피쉬코지 🛷 산타 썰매 v2 (v236 적용) — Three.js r147 순수 프로시저럴
// 박스(BoxGeometry) 0개: 곡선 튜브 · 압출(베벨) · 회전체(Lathe) · 구 로만 만들어요.
// 계약(기존 VEHB.V.santa 와 동일): 앞쪽 = +z, 바닥 y=0, 게임에서 ×1.7 스케일
//   userData.seat=[0,.92,-.45] (플레이어 자리) · userData.legs=[{p,ph}] (다리 피벗) · userData.heads=[머리 그룹] · userData.pose='sit'
// 사용: game-v2.js VEHB.V.santa(lite) → SLEIGH_V2(THREE,{lite}) · 내 썰매 = 기본, 다른 유저 썰매 = lite(가벼운 버전)
(function(root){
function SLEIGH_V2(T,opt){
 T=T||root.THREE;opt=opt||{};const LITE=!!opt.lite,LQ=LITE?.5:1;/* lite: 멀리 있는 다른 유저용 가벼운 버전 */const V3=(x,y,z)=>new T.Vector3(x,y,z),V2=(x,y)=>new T.Vector2(x,y);
 const C=SLEIGH_V2._c||(SLEIGH_V2._c={});
 // ── 환경맵(작은 그라데이션 1장) : 황금·광택 도장이 검게 죽지 않게 ──
 const env=C.env||(C.env=(()=>{const cv=document.createElement('canvas');cv.width=256;cv.height=128;const x=cv.getContext('2d');const g=x.createLinearGradient(0,0,0,128);
  g.addColorStop(0,'#cfe3ff');g.addColorStop(.42,'#fff4dc');g.addColorStop(.5,'#ffd9a0');g.addColorStop(.56,'#bfc8d6');g.addColorStop(1,'#eef2f6');x.fillStyle=g;x.fillRect(0,0,256,128);
  x.fillStyle='rgba(255,255,255,.95)';[[40,30,10],[150,22,14],[210,40,8]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill();});
  const t=new T.CanvasTexture(cv);t.mapping=T.EquirectangularReflectionMapping;t.encoding=T.sRGBEncoding;return t;})());
 const M=C.m||(C.m={});
 const LIN=o=>{o=Object.assign({},o);for(const k of ['color','emissive'])if(typeof o[k]==='string')o[k]=new T.Color(o[k]).convertSRGBToLinear();return o;};
 const mat=(k,o)=>M[k]||(M[k]=new T.MeshStandardMaterial(LIN(o)));
 const lac=mat('lac',{color:'#cc1a26',roughness:.26,metalness:.12,envMap:env,envMapIntensity:.9});
 const lacD=mat('lacD',{color:'#8a1420',roughness:.5,metalness:.05,envMap:env,envMapIntensity:.5});
 const gold=mat('gold',{color:'#ffd86a',roughness:.28,metalness:.62,envMap:env,envMapIntensity:1.2});
 const velvet=mat('vel',{color:'#9c1a2e',roughness:.95,metalness:0});
 const fur=mat('fur',{color:'#fbf7ef',roughness:1,metalness:0});
 const holly=mat('holly',{color:'#1d6b3a',roughness:.45,metalness:0,side:T.DoubleSide,envMap:env,envMapIntensity:.4});
 const berry=mat('berry',{color:'#d3122a',roughness:.25,metalness:0,envMap:env,envMapIntensity:.7});
 const glow=M.glow||(M.glow=new T.MeshBasicMaterial(LIN({color:'#ffd27a'})));
 const flame=M.flame||(M.flame=new T.MeshBasicMaterial(LIN({color:'#fff3c4'})));
 const glass=mat('glass',{color:'#ffcf7a',roughness:.1,metalness:0,emissive:'#ffb44a',emissiveIntensity:.9,transparent:true,opacity:.55,depthWrite:false});
 const brown=mat('dbr',{color:'#c48e5e',roughness:.8}),brownD=mat('dbrd',{color:'#8e6246',roughness:.8}),cream=mat('dcr',{color:'#e9d3b0',roughness:.9});
 const antler=mat('ant',{color:'#dcc39b',roughness:.7}),hoof=mat('hoof',{color:'#33241c',roughness:.6}),ink=mat('ink',{color:'#1d1517',roughness:.3,envMap:env,envMapIntensity:.6});
 const rnose=M.rnose||(M.rnose=new T.MeshStandardMaterial(LIN({color:'#ff3030',emissive:'#ff1a1a',emissiveIntensity:1.1,roughness:.3})));
 const leather=mat('lea',{color:'#6e3a24',roughness:.6,metalness:.05});
 const skin=mat('skin',{color:'#f8d2b4',roughness:.8}),suit=mat('suit',{color:'#d8222f',roughness:.65}),boot=mat('boot',{color:'#231a1a',roughness:.4,envMap:env,envMapIntensity:.4}),pink=mat('pink',{color:'#f29a9a',roughness:.9});
 const sack=mat('sack',{color:'#a8643c',roughness:.95});
 const gc={em:mat('gem',{color:'#16865a',roughness:.35,envMap:env,envMapIntensity:.6}),bl:mat('gbl',{color:'#2b5fc0',roughness:.35,envMap:env,envMapIntensity:.6}),pu:mat('gpu',{color:'#7c3fb0',roughness:.35,envMap:env,envMapIntensity:.6}),wh:mat('gwh',{color:'#f6f2ea',roughness:.4,envMap:env,envMapIntensity:.5}),gd:gold};
 const silver=mat('sil',{color:'#e3e8ef',roughness:.25,metalness:.7,envMap:env,envMapIntensity:1.1});
 const g=new T.Group(),legs=[],heads=[];
 const add=(geo,m,p,par,r,s)=>{const o=new T.Mesh(geo,m);if(p)o.position.set(p[0],p[1],p[2]);if(r)o.rotation.set(r[0]||0,r[1]||0,r[2]||0);if(s)(typeof s==='number')?o.scale.setScalar(s):o.scale.set(s[0],s[1],s[2]);(par||g).add(o);return o;};
 const tube=(pts,r,m,seg,rs,par,closed)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>V3(p[0],p[1],p[2])),!!closed,'centripetal'),Math.max(2,Math.round((seg||32)*.8*LQ)),r,Math.min(rs||8,r<.02?4:r<.03?5:LITE?6:8),!!closed),m,null,par);
 const sph=(r,m,p,s,par,ws,hs)=>add(new T.SphereGeometry(r,Math.max(5,Math.round((ws||10)*(LITE?.7:1))),Math.max(4,Math.round((hs||8)*(LITE?.7:1)))),m,p,par,null,s);
 // 해시 노이즈(같은 위치 = 같은 값 → 이음매 안 갈라짐)
 const hn=(x,y,z)=>{const s=Math.sin(x*12.9898+y*78.233+z*37.719)*43758.5453;return s-Math.floor(s);};
 const fluff=(geo,amt)=>{const p=geo.attributes.position,n=geo.attributes.normal;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=(Math.sin(x*33+y*13)*Math.sin(z*29+x*11)*.6+Math.sin(y*41+z*17)*.4)*amt*.55;p.setXYZ(i,x+n.getX(i)*k,y+n.getY(i)*k,z+n.getZ(i)*k);}geo.computeVertexNormals();return geo;};
 const furTube=(pts,r,par,seg)=>{const geo=new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>V3(...p)),false,'centripetal'),Math.round((seg||28)*.75*LQ),r,LITE?6:8,false);fluff(geo,r*.4);return add(geo,fur,null,par);};
 const lathe=(prof,seg,m,p,par,r)=>add(new T.LatheGeometry(prof.map(a=>V2(a[0],a[1])),seg||16),m,p,par,r);
 // 둥근 모서리 사각형을 압출(베벨)한 쿠션 — 가로 w, 세로 d, 두께 h (y 방향)
 const rrShape=(w,d,r)=>{const s=new T.Shape(),x=-w/2,y=-d/2;s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+d-r);s.quadraticCurveTo(x+w,y+d,x+w-r,y+d);s.lineTo(x+r,y+d);s.quadraticCurveTo(x,y+d,x,y+d-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;};
 const pillow=(w,d,h,m,b,q)=>{b=b==null?Math.min(w,d,h)*.45:b;q=q||3;const geo=new T.ExtrudeGeometry(rrShape(w-2*b,d-2*b,Math.min(w-2*b,d-2*b)*.3),{depth:Math.max(.001,h-2*b),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:q,curveSegments:q});geo.translate(0,0,-(h-2*b)/2);geo.rotateX(-Math.PI/2);return new T.Mesh(geo,m);};
 // ═════ 1. 썰매 옆판: 곡선 실루엣(S자 + 앞 소용돌이 + 뒤 꼬리) ═════
 const OUT=[[-1.50,.36],[-.6,.33],[.4,.33],[.95,.36],[1.20,.48],[1.31,.70],[1.27,.95],[1.13,1.08],[.99,1.04],[.93,.93],[.78,.89],[.45,.86],[.05,.90],[-.30,.97],[-.60,1.09],[-.78,1.27],[-.94,1.31],[-1.07,1.17],[-1.25,1.04],[-1.47,1.05],[-1.62,1.13],[-1.71,1.02],[-1.66,.72],[-1.59,.47]];
 const outC=new T.CatmullRomCurve3(OUT.map(p=>V3(p[0],p[1],0)),true,'centripetal');const OP=outC.getSpacedPoints(LITE?56:84);
 const sideShape=new T.Shape(OP.slice(0,-1).map(p=>V2(p.x,p.y)));
 const sideGeo=new T.ExtrudeGeometry(sideShape,{depth:.035,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:2,curveSegments:1});
 sideGeo.rotateY(-Math.PI/2);// shape x→z, 두께 → -x
 const PX=.6;
 [-1,1].forEach(sd=>{const m=add(sideGeo,lac);m.position.x=sd>0?PX+.0175:-PX+.0175;
  // 금색 몰딩: 실루엣 테두리 그대로 따라가는 튜브(바깥면 + 안쪽면)
  {const pts=OP.map(p=>V3(sd*(PX+.0),p.y,p.x));add(new T.TubeGeometry(new T.CatmullRomCurve3(pts,true,'centripetal'),LITE?64:110,.036,LITE?5:6,true),gold);}
  // 옆판 장식: 금색 별 + 소용돌이 필리그리 + 하얀 눈꽃
  const star=new T.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2+Math.PI/2,r=i%2?.055:.13;i?star.lineTo(Math.cos(a)*r,Math.sin(a)*r):star.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
  const sg=new T.ExtrudeGeometry(star,{depth:.01,bevelEnabled:true,bevelThickness:.012,bevelSize:.01,bevelSegments:2});const st=add(sg,gold,[sd*(PX+.045),.62,.3]);st.rotation.y=sd*Math.PI/2;
  if(!LITE)for(const zz of [-.25,.85]){const sw=[];for(let i=0;i<=26;i++){const t=i/26,a=t*Math.PI*2.3,r=.14*(1-t*.78);sw.push([sd*(PX+.045),.6+Math.sin(a)*r*.75,zz+(zz<0?-1:1)*(.02-Math.cos(a)*r)]);}tube(sw,.011,gold,40,5);}
  // 별 양옆 덩굴선
  tube([[sd*(PX+.045),.48,-.05],[sd*(PX+.045),.5,.12],[sd*(PX+.045),.56,.2]],.01,gold,10,5);tube([[sd*(PX+.045),.56,.4],[sd*(PX+.045),.5,.48],[sd*(PX+.045),.48,.65]],.01,gold,10,5);
  // 뒤 짐칸 옆 눈꽃
  if(!LITE){const fl=new T.Group();for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const arm=add(new T.CylinderGeometry(.007,.007,.16,5),fur,[Math.sin(a)*.08,Math.cos(a)*.08,0],fl,[0,0,-a]);for(const s2 of [-1,1]){add(new T.CylinderGeometry(.006,.006,.05,4),fur,[Math.sin(a)*.11+Math.sin(a+s2*.9)*.02,Math.cos(a)*.11+Math.cos(a+s2*.9)*.02,0],fl,[0,0,-a-s2*.9]);}}
  sph(.016,fur,[0,0,0],null,fl,8,6);fl.position.set(sd*(PX+.045),.74,-1.36);fl.rotation.y=sd*Math.PI/2;g.add(fl);}
 });
 // ═════ 2. 썰매 통(바닥·앞 대시·뒤 벽): 곡선 단면을 x로 압출 ═════
 {const P=new T.CatmullRomCurve3([[1.18,.98],[1.17,.72],[1.08,.5],[.9,.42],[.2,.41],[-1.0,.41],[-1.5,.43],[-1.62,.6],[-1.63,.98]].map(p=>V3(p[0],p[1],0)),false,'centripetal').getSpacedPoints(60);
  const th=.04,A=[],B=[];for(let i=0;i<P.length;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],tx=b.x-a.x,ty=b.y-a.y,l=Math.hypot(tx,ty);A.push(V2(P[i].x,P[i].y));B.push(V2(P[i].x+ty/l*th,P[i].y-tx/l*th));}
  const sh=new T.Shape(A.concat(B.reverse()));const geo=new T.ExtrudeGeometry(sh,{depth:2*PX-.04,bevelEnabled:false,curveSegments:1});geo.rotateY(-Math.PI/2);geo.translate(PX-.02,0,0);add(geo,lacD);
  // 대시 위 금 테두리 + 뒤 벽 위 금 테두리
  tube([[-PX+.02,.99,1.18],[0,1.0,1.2],[PX-.02,.99,1.18]],.024,gold,12,6);tube([[-PX+.02,.99,-1.63],[0,1.0,-1.65],[PX-.02,.99,-1.63]],.024,gold,12,6);}
 // 뒤 벽 바깥 장식: 금 별 + 양쪽 소용돌이
 {const st=new T.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2+Math.PI/2,r=i%2?.05:.12;i?st.lineTo(Math.cos(a)*r,Math.sin(a)*r):st.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
  const sgb=new T.ExtrudeGeometry(st,{depth:.01,bevelEnabled:true,bevelThickness:.012,bevelSize:.01,bevelSegments:2});add(sgb,gold,[0,.72,-1.69],null,[0,Math.PI,0]);
  for(const sd of [-1,1]){const sw=[];for(let i=0;i<=22;i++){const t=i/22,a=t*Math.PI*2.2,r=.12*(1-t*.75);sw.push([sd*(.2+.02-Math.cos(a)*r),.7+Math.sin(a)*r*.7,-1.69]);}tube(sw,.011,gold,30,5);}}
 // ═════ 3. 썰매 날: 앞이 우아하게 말려 올라가는 황금 곡선 + 곡선 지지대 ═════
 const RX=.5;
 const RUN=[[-1.86,.24],[-1.84,.1],[-1.7,.035],[-1.2,.03],[0,.03],[1.0,.03],[1.42,.07],[1.68,.24],[1.8,.5],[1.76,.75],[1.62,.86],[1.47,.82],[1.42,.68],[1.5,.6],[1.6,.65]];
 [-1,1].forEach(sd=>{tube(RUN.map(p=>[sd*RX,p[1],p[0]]),.04,gold,76,7);
  sph(.05,gold,[sd*RX,.65,1.6],null,null,10,8);sph(.045,gold,[sd*RX,.24,-1.86],null,null,10,8);
  // S자 지지대 (날 → 썰매 바닥)
  for(const z of [-1.25,-.35,.6])tube([[sd*RX,.05,z+.06],[sd*(RX+.05),.15,z],[sd*(RX+.03),.25,z-.05],[sd*(PX-.06),.36,z-.02]],.022,gold,14,6);
  // 앞 소용돌이 → 옆판 앞쪽 연결
  tube([[sd*RX,.78,1.66],[sd*(RX+.04),.85,1.45],[sd*(PX-.03),.82,1.28]],.018,gold,12,6);
 });
 // 날 사이 가로대 (곡선)
 for(const z of [-1.25,.6])tube([[-RX,.13,z],[0,.2,z],[RX,.13,z]],.018,gold,10,5);
 // ═════ 4. 좌석: 벨벳 쿠션 + 하얀 털 트리밍 + 단추 등받이 ═════
 const bench=(z,top,d)=>{const base=pillow(1.12,d,top-.42,lac,.04);base.position.set(0,(top-.42)/2+.42,z);g.add(base);
  const cu=pillow(1.1,d+.04,.13,velvet,.055);cu.position.set(0,top+.03,z);g.add(cu);
  furTube([[-.56,top+.02,z+d/2+.03],[0,top+.035,z+d/2+.05],[.56,top+.02,z+d/2+.03]],.042,null,22);};
 bench(-.45,.88,.56);// 플레이어 자리 (seat y .92 → 쿠션 윗면 ≈ .97)
 bench(.42,.74,.46); // 산타 자리
 // 등받이: 휘어진 벨벳 쿠션 + 금 단추 + 털 테두리
 {const geo=new T.ExtrudeGeometry(rrShape(1.0,.42,.12),{depth:.06,bevelEnabled:true,bevelThickness:.05,bevelSize:.05,bevelSegments:4,curveSegments:6});
  const p=geo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,p.getZ(i)-x*x*.22+ (Math.abs(x)<.45&&Math.abs(y)<.18?0:0));}geo.computeVertexNormals();
  const br=add(geo,velvet,[0,1.18,-.84],null,[-.22,0,0]);
  // 뒤판(래커)
  const bg=new T.ExtrudeGeometry(rrShape(1.14,.66,.16),{depth:.03,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:2,curveSegments:6});const pb=bg.attributes.position;for(let i=0;i<pb.count;i++){const x=pb.getX(i);pb.setZ(i,pb.getZ(i)-x*x*.22);}bg.computeVertexNormals();add(bg,lac,[0,1.1,-.93],null,[-.22,0,0]);
  for(const [x,y] of [[-.3,.08],[0,.08],[.3,.08],[-.15,-.08],[.15,-.08]]){const zc=-.84+.11-x*x*.22;const yy=1.18+y*Math.cos(.22),zz=zc-y*Math.sin(.22);sph(.022,gold,[x,yy,zz],null,null,8,6);}
  const tp=[];for(let i=0;i<=12;i++){const x=-.55+i/12*1.1;tp.push([x,1.43,-.84-.33*Math.sin(.22)-.06-x*x*.22]);}furTube(tp,.05,null,26);}
 // ═════ 5. 앞 장식: 리스(호랑가시) + 금 방울 + 발광 랜턴 ═════
 const leafShape=(()=>{const s=new T.Shape();s.moveTo(0,0);const L=.11,W=.035;const pts=[];for(let i=0;i<=8;i++){const t=i/8,w=Math.sin(t*Math.PI)*W*(i%2?1.25:.8);pts.push([t*L,w]);}pts.forEach(p=>s.lineTo(p[0],p[1]));for(let i=8;i>=0;i--){const t=i/8,w=Math.sin(t*Math.PI)*W*(i%2?1.25:.8);s.lineTo(t*L,-w);}return s;})();
 const leafGeo=new T.ShapeGeometry(leafShape,2);{const p=leafGeo.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,-y*y*4+Math.sin(x*25)*.004);}leafGeo.computeVertexNormals();}
 const sprig=(par,p,rot,sc,n)=>{const h=new T.Group();h.position.set(...p);h.rotation.set(...rot);h.scale.setScalar(sc||1);par.add(h);n=n||3;for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+.3;const l=add(leafGeo,holly,[0,0,0],h,[0,0,a]);l.rotation.x=.35;}for(const [x,y] of [[.012,.01],[-.014,.008],[0,-.016]])sph(.019,berry,[x,y,.02],null,h,7,5);return h;};
 // 앞 대시 중앙 리스
 {const w=new T.Group();w.position.set(0,.78,1.235);w.rotation.x=-.18;g.add(w);
  const tg=new T.TorusGeometry(.15,.045,7,22);fluff(tg,.02);add(tg,holly,null,w);
  for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const l=add(leafGeo,holly,[Math.cos(a)*.15,Math.sin(a)*.15,.035],w,[0,0,a+1.4]);l.scale.setScalar(.8);}
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.2;sph(.02,berry,[Math.cos(a)*.17,Math.sin(a)*.17,.05],null,w,7,5);}
  // 빨간 리본
  const bow=new T.Group();bow.position.set(0,-.15,.06);w.add(bow);for(const s of [-1,1]){add(new T.TorusGeometry(.045,.016,6,14),berry,[s*.045,0,0],bow,[0,0,0],[1,.7,.6]);tube([[s*.01,-.01,0],[s*.04,-.07,.01],[s*.03,-.12,0]],.012,berry,8,5,bow);}sph(.022,berry,[0,0,.005],null,bow,8,6);}
 // 금 방울 (앞 소용돌이 끝에 매달림)
 const bellGeo=new T.LatheGeometry([[0,.0],[.04,.006],[.03,.05],[.016,.083],[0,.09]].map(a=>V2(a[0],a[1])),9);
 const bell=(par,p,s)=>{const b=new T.Group();b.position.set(...p);b.scale.setScalar(s||1);par.add(b);add(bellGeo,gold,[0,-.09,0],b);sph(.012,brownD,[0,-.088,0],null,b,5,4);return b;};
 [-1,1].forEach(sd=>{tube([[sd*(PX+.01),1.06,1.13],[sd*(PX+.03),.98,1.17],[sd*(PX+.04),.92,1.18]],.006,leather,6,4);bell(g,[sd*(PX+.04),.935,1.18],1.3);sprig(g,[sd*(PX+.02),1.08,1.1],[0,sd*Math.PI/2,0],1);});
 // 랜턴: 금 고리 기둥 + 회전체 등 + 발광 유리
 {const L=new T.Group();g.add(L);
  tube([[-.52,.98,1.0],[-.56,1.25,1.06],[-.56,1.52,1.12],[-.5,1.62,1.24],[-.44,1.58,1.33]],.017,gold,24,6,L);
  const lt=new T.Group();lt.position.set(-.44,1.36,1.33);L.add(lt);
  tube([[0,.2,0],[0,.24,0]],.006,gold,2,4,lt);add(new T.TorusGeometry(.022,.006,5,12),gold,[0,.255,0],lt,[0,Math.PI/2,0]);
  lathe([[0,.2],[.03,.195],[.075,.15],[.085,.13],[.06,.125]],14,gold,[0,0,0],lt);
  add(new T.CylinderGeometry(.06,.06,.17,14,1,true),glass,[0,.04,0],lt);
  lathe([[.06,-.045],[.085,-.06],[.075,-.09],[.03,-.1],[0,-.105]],14,gold,[0,0,0],lt);
  for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;add(new T.CylinderGeometry(.007,.007,.18,5),gold,[Math.cos(a)*.062,.04,Math.sin(a)*.062],lt);}
  add(new T.SphereGeometry(.025,8,8),flame,[0,.02,0],lt,null,[1,1.6,1]);add(new T.CylinderGeometry(.008,.01,.05,6),fur,[0,-.02,0],lt);
  // 부드러운 빛 번짐(스프라이트 · 점조명 없음 → 멀티에서 셰이더 재컴파일·부하 없음)
  const gt=C.glowTex||(C.glowTex=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,214,140,.9)');gr.addColorStop(.35,'rgba(255,180,90,.35)');gr.addColorStop(1,'rgba(255,160,60,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new T.CanvasTexture(cv);})());
  const sp=new T.Sprite(new T.SpriteMaterial({map:gt,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));sp.scale.setScalar(.55);sp.position.set(0,.04,0);lt.add(sp);
  g.userData.glow=sp;}
 // ═════ 6. 뒤 짐칸: 선물 자루 + 둥근 선물 상자들 (크기·각도 제각각) ═════
 {const P=new T.Group();g.add(P);
  // 선물 자루: 회전체 + 주름 + 금 끈
  const prof=[[0,0],[.2,.01],[.3,.06],[.34,.18],[.33,.32],[.26,.44],[.13,.53],[.075,.58],[.09,.62],[.15,.67],[.17,.71],[.12,.72]];
  const sg=new T.LatheGeometry(prof.map(a=>V2(a[0],a[1])),24);{const p=sg.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),r=Math.hypot(x,z),k=1+(y>.6?Math.sin(a*6)*.13*Math.min(1,(y-.6)/.06):Math.sin(a*5+y*6)*.04)+Math.sin(x*23+z*17)*Math.sin(y*19)*.025;p.setXYZ(i,x*k,y,z*k);}sg.computeVertexNormals();}
  const SG=new T.Group();SG.position.set(.19,.43,-1.29);SG.rotation.set(-.1,.4,.06);P.add(SG);add(sg,sack,null,SG,null,[.84,1.45,.84]);
  add(new T.TorusGeometry(.07,.019,6,16),gold,[0,.835,0],SG,[Math.PI/2,0,0]);
  tube([[.06,.83,.03],[.12,.72,.1],[.15,.6,.12]],.011,gold,8,5,SG);sph(.022,gold,[.15,.59,.12],null,SG,8,6);
  // 자루에서 삐죽 나온 지팡이 사탕
  {const cc=[];for(let i=0;i<=14;i++){const t=i/14;cc.push(t<.75?[.0,t/.75*.42,0]:[Math.sin((t-.75)/.25*Math.PI)*-.07,.42+Math.sin((t-.75)/.25*Math.PI*.5)*.06,0]);}
   const grp=new T.Group();grp.position.set(.2,1.18,-1.36);grp.rotation.set(-.35,0,.35);P.add(grp);tube(cc,.022,fur,30,8,grp);
   const sp2=[];for(let i=0;i<=60;i++){const t=i/60,c=new T.CatmullRomCurve3(cc.map(q=>V3(...q))).getPoint(t),a=t*Math.PI*14;sp2.push([c.x+Math.cos(a)*.017,c.y,c.z+Math.sin(a)*.017]);}if(!LITE)tube(sp2,.008,berry,70,4,grp);}
  // 선물 상자 = 모서리 둥근 상자 + 두 줄 리본 + 입체 매듭(고리 2개 + 꼬리)
  const gift=(w,h,d,body,rib,p,rot)=>{const G=new T.Group();G.position.set(...p);G.rotation.set(...rot);P.add(G);const b=pillow(w,d,h,body,Math.min(w,h,d)*.16,2);b.position.y=h/2;G.add(b);
   const b1=pillow(w+.012,.05,h+.012,rib,.012,1);b1.position.y=h/2;G.add(b1);const b2=pillow(.05,d+.012,h+.012,rib,.012,1);b2.position.y=h/2;G.add(b2);
   const bow=new T.Group();bow.position.y=h+.005;G.add(bow);const s=Math.min(w,d)*.9;
   for(const sd of [-1,1]){const lp=add(new T.TorusGeometry(s*.17,s*.055,5,12),rib,[sd*s*.15,s*.08,0],bow,[0,0,sd*.55],[1,.75,.55]);}
   for(const sd of [-1,1])tube([[0,.01,0],[sd*s*.12,.0,s*.15],[sd*s*.2,-.005,s*.3]],s*.03,rib,8,5,bow);
   sph(s*.06,rib,[0,s*.04,0],null,bow,8,6);return G;};
  gift(.36,.32,.34,gc.em,gold,[-.3,.43,-1.24],[0,.25,0]);
  gift(.26,.22,.26,gc.bl,silver,[-.3,.75,-1.26],[.05,-.45,.1]);
  gift(.17,.15,.17,gc.pu,gold,[-.27,.97,-1.29],[-.08,.5,-.12]);
  // 원통 선물(모자 상자) + 리본
  {const G=new T.Group();G.position.set(.43,.43,-.99);G.scale.setScalar(.95);G.rotation.y=.4;P.add(G);add(new T.CylinderGeometry(.13,.13,.18,20),gold,[0,.09,0],G);add(new T.CylinderGeometry(.138,.138,.045,20),gold,[0,.185,0],G);
   add(new T.TorusGeometry(.137,.012,5,22),berry,[0,.1,0],G,[Math.PI/2,0,0]);for(const sd of [-1,1])add(new T.TorusGeometry(.04,.013,6,14),berry,[sd*.035,.225,0],G,[0,0,sd*.55],[1,.75,.55]);sph(.018,berry,[0,.215,0],null,G,8,6);}
  sprig(P,[.0,1.35,-.98],[-.6,0,0],1.1,3);
 }
 // ═════ 7. 산타 할아버지 (둥근 몸 · 앞자리에서 고삐를 잡음) ═════
 {const S=new T.Group();S.position.set(.28,.8,.4);S.rotation.y=-.06;g.add(S);// 오른쪽에 앉아 플레이어 낚싯대 길을 비워요
  lathe([[0,0],[.22,.01],[.27,.08],[.28,.2],[.25,.32],[.19,.42],[.12,.47],[0,.48]],18,suit,[0,0,0],S);
  furTube((()=>{const a=[];for(let i=0;i<=20;i++){const t=i/20*Math.PI*2;a.push([Math.cos(t)*.255,.035,Math.sin(t)*.255]);}return a;})(),.035,S,30);
  add(new T.TorusGeometry(.272,.03,6,28),ink,[0,.18,0],S,[Math.PI/2,0,0]);
  {const bk=pillow(.11,.04,.08,gold,.012);bk.position.set(0,.18,.27);S.add(bk);}
  furTube([[0,.04,.27],[0,.24,.29],[0,.44,.17]],.03,S,10);
  // 다리 + 장화
  for(const sd of [-1,1]){tube([[sd*.11,.06,.05],[sd*.12,.04,.28],[sd*.12,-.08,.4]],.085,suit,10,10,S);add(new T.SphereGeometry(.075,12,10),boot,[sd*.12,-.2,.44],S,null,[1,.75,1.5]);add(new T.CylinderGeometry(.075,.075,.14,12),boot,[sd*.12,-.13,.4],S);}
  // 팔 (고삐 잡기)
  for(const sd of [-1,1]){tube([[sd*.2,.38,.0],[sd*.27,.28,.12],[sd*.18,.2,.3]],.065,suit,12,10,S);furTube([[sd*.21,.17,.27],[sd*.17,.23,.33]],.045,S,6);sph(.055,boot,[sd*.16,.21,.36],null,S,10,8);}
  // 머리
  const H=new T.Group();H.position.set(0,.6,0);S.add(H);
  sph(.17,skin,[0,0,0],null,H,14,10);
  const bd=new T.SphereGeometry(.16,14,10,0,Math.PI*2,Math.PI*.35,Math.PI*.65);fluff(bd,.03);add(bd,fur,[0,-.03,.04],H,null,[1.05,1.15,1]);
  for(const sd of [-1,1]){add(new T.SphereGeometry(.05,10,8),fur,[sd*.045,-.03,.16],H,[0,0,sd*-.4],[1.2,.6,.7]);sph(.028,pink,[sd*.09,.0,.135],null,H,8,6);sph(.019,ink,[sd*.06,.05,.155],null,H,8,6);add(new T.CapsuleGeometry?new T.CapsuleGeometry(.012,.04,3,6):new T.SphereGeometry(.02,6,4),fur,[sd*.065,.095,.15],H,[0,0,Math.PI/2+sd*.2]);}
  sph(.035,pink,[0,.01,.175],null,H,10,8);
  // 모자: 휘어진 원뿔(회전체 후 굽힘) + 털 테두리 + 방울
  const hg=new T.LatheGeometry([[0,0],[.17,0],[.15,.08],[.11,.18],[.07,.27],[.03,.34],[0,.37]].map(a=>V2(a[0],a[1])),16);{const p=hg.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setZ(i,p.getZ(i)-y*y*1.6);p.setY(i,y*(1-y*.5));}hg.computeVertexNormals();}
  add(hg,suit,[0,.1,-.01],H,[-.15,0,0]);
  furTube((()=>{const a=[];for(let i=0;i<=20;i++){const t=i/20*Math.PI*2;a.push([Math.cos(t)*.17,.0,Math.sin(t)*.17]);}return a;})(),.04,H,30).position.set(0,.11,-.01);
  sph(.05,fur,[0,.34,-.27],null,H,10,8).geometry=fluff(new T.SphereGeometry(.05,10,8),.015);
  heads.push(H);}
 // ═════ 8. 순록 3마리 (둥근 몸 · 2마디 다리 · 가지 뿔 · 하네스) — 앞장은 빨간 코 루돌프 ═════
 const deerGeo=C['deer'+LITE]||(C['deer'+LITE]=(()=>{const D={};
  const bp=new T.SplineCurve([[0,-.5],[.13,-.46],[.21,-.36],[.245,-.2],[.25,-.04],[.27,.13],[.265,.27],[.21,.39],[.12,.47],[0,.5]].map(a=>V2(a[0],a[1]))).getPoints(14);D.body=new T.LatheGeometry(bp,LITE?12:22);D.body.rotateX(Math.PI/2);D.body.scale(.92,1,1);
  D.neck=new T.CylinderGeometry(.095,.15,.5,12,1,true);
  D.head=new T.SphereGeometry(1,LITE?8:11,LITE?6:8);D.ear=new T.ConeGeometry(.05,.13,7);D.ear.scale(1,1,.45);
  D.up=new T.CylinderGeometry(.075,.052,.36,9);D.up.translate(0,-.18,0);D.lo=new T.CylinderGeometry(.05,.034,.34,8);D.lo.translate(0,-.17,0);D.hf=new T.CylinderGeometry(.036,.046,.06,8);
  D.knee=new T.SphereGeometry(.05,6,4);D.thigh=new T.SphereGeometry(1,LITE?7:9,LITE?5:7);D.thigh.scale(.1,.2,.13);D.fet=new T.SphereGeometry(.042,6,4);D.fet.scale(1,.7,1);
  const A=[];const am=(pts,r)=>{if(!LITE||A.length<2)A.push(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>V3(...p)),false,'centripetal'),LITE?5:8,r,LITE?4:5,false));};
  am([[0,0,0],[.06,.12,-.02],[.13,.25,-.06],[.16,.36,-.13],[.14,.45,-.21]],.021);am([[.08,.15,-.03],[.15,.22,.04],[.2,.27,.06]],.016);am([[.14,.29,-.08],[.22,.36,-.04],[.27,.4,-.02]],.014);am([[.15,.38,-.15],[.1,.46,-.1],[.08,.5,-.06]],.012);
  D.ant=A;
  D.tail=new T.SphereGeometry(.06,8,6);fluff(D.tail,.02);
  D.collar=new T.TorusGeometry(.15,.028,6,18);D.strap=new T.TorusGeometry(.265,.026,5,22);
  return D;})());
 function deer(x,z,s,rud,ph0){const d=new T.Group();d.position.set(x,0,z);d.scale.setScalar(s);g.add(d);const D=deerGeo;
  add(D.body,brown,[0,.84,0],d);
  add(new T.SphereGeometry(.2,12,9),brown,[0,.84,.3],d,null,[.95,1.05,.75]);// 가슴
  add(new T.SphereGeometry(.2,12,8),cream,[0,.665,-.02],d,null,[.8,.3,1.5]);// 배
  const nk=add(D.neck,brown,[0,1.07,.42],d,[.62,0,0]);
  const hd=new T.Group();hd.position.set(0,1.3,.55);d.add(hd);heads.push(hd);
  add(D.head,brown,[0,.04,.04],hd,[.25,0,0],[.13,.13,.17]);add(D.head,brown,[0,-.02,.19],hd,[.15,0,0],[.085,.08,.11]);add(D.head,cream,[0,-.05,.22],hd,[.15,0,0],[.07,.05,.09]);
  if(rud){add(D.head,rnose,[0,-.0,.3],hd,null,[.05,.05,.05]);const gt=C.rg||(C.rg=(()=>{const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d'),gr=x.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,90,90,.85)');gr.addColorStop(.4,'rgba(255,40,40,.3)');gr.addColorStop(1,'rgba(255,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new T.CanvasTexture(cv);})());const sp=new T.Sprite(new T.SpriteMaterial({map:gt,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));sp.scale.setScalar(.32);sp.position.set(0,0,.31);hd.add(sp);}
  else add(D.head,ink,[0,.0,.29],hd,null,[.035,.03,.03]);
  for(const sd of [-1,1]){sph(.024,ink,[sd*.085,.07,.12],null,hd,8,6);sph(.008,fur,[sd*.09,.08,.135],null,hd,5,4);
   add(D.ear,brown,[sd*.12,.12,-.02],hd,[0,0,sd*-1.1]);
   const an=new T.Group();an.position.set(sd*.05,.14,-.02);an.scale.set(sd,1,1);hd.add(an);D.ant.forEach(a=>add(a,antler,null,an));}
  // 다리: 엉덩이 피벗(기존 애니 그대로) · 허벅지 → 무릎 → 정강이 → 발굽
  [[-.13,.3],[.13,.3],[-.13,-.3],[.13,-.3]].forEach(([lx,lz],i)=>{const p=new T.Group();p.position.set(lx,.76,lz);d.add(p);const bk=lz<0;
   add(D.thigh,brown,[0,-.04,bk?-.02:.0],p,null,bk?[1,1.15,1.15]:[.9,1,1]);// 허벅지 근육 (몸통과 이어짐)
   add(D.up,brown,[0,-.02,0],p,[bk?-.14:.05,0,0]);if(!LITE)add(D.knee,brownD,[0,-.36,bk?-.05:.02],p);add(D.lo,brownD,[0,-.36,bk?-.05:.02],p,[bk?.14:-.03,0,0]);add(D.hf,hoof,[0,-.73,bk?.0:.01],p);legs.push({p,ph:((lx<0)===(lz>0)?0:Math.PI)+(ph0||0)});});
  add(D.tail,fur,[0,1.02,-.5],d);
  // 하네스: 목걸이 + 금방울 · 몸통 끈 + 금 버클 + 빨간 안장 천
  add(D.collar,berry,[0,1.0,.38],d,[Math.PI/2+.62,0,0],[1,1,1]);for(let i=LITE?0:-1;i<=(LITE?0:1);i++){const a=i*.55;bell(d,[Math.sin(a)*.15,.93-Math.cos(a)*.04,.48+Math.cos(a)*.03],.8);}
  add(D.strap,leather,[0,.84,.08],d,null,[.95,1.04,1]);
  {const bk=pillow(.07,.03,.07,gold,.01,1);bk.position.set(.25,.82,.08);bk.rotation.z=Math.PI/2;d.add(bk);if(!LITE)bell(d,[0,.6,.08],.9);}
  return d;}
 const dl=deer(-.42,2.3,.95,false,0),dr=deer(.42,2.3,.95,false,.7),dlead=deer(0,3.7,.95,true,1.4);
 // 끌줄: 썰매 앞 → 순록 쌍 → 앞장 순록 (가죽, 살짝 처짐) · 고삐: 산타 손 → 앞 순록 목
 for(const sd of [-1,1]){tube([[sd*.3,.5,1.22],[sd*.36,.62,1.6],[sd*.42,.78,2.0],[sd*.42,.8,2.08]],.016,leather,16,5);
  tube([[sd*.42,.82,2.62],[sd*.25,.85,3.0],[sd*.06,.84,3.35],[0,.86,3.45]],.014,leather,16,5);
  tube([[.28+sd*.15,1.01,.77],[.14+sd*.3,.97,1.4],[sd*.42,1.0,2.1],[sd*.42,1.1,2.62]],.009,berry,20,4);}

 // ── 드로우콜 줄이기: 움직이는 부품(다리 피벗·머리)은 게임의 slimGroup 이 못 합치므로, 그룹마다 정점색 메시 1개로 미리 구워요 ──
 const VC=M.vc||(M.vc=new T.MeshStandardMaterial({vertexColors:true,roughness:.75,metalness:0}));
 const bakeGrp=grp=>{grp.updateMatrixWorld(true);const inv=new T.Matrix4().copy(grp.matrixWorld).invert(),L=[],dead=[];
  grp.traverse(o=>{if(!o.isMesh||o===grp)return;const m=o.material;if(m.emissive&&m.emissive.getHex()>0||m.transparent||m.map)return;let gg=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();gg.applyMatrix4(new T.Matrix4().multiplyMatrices(inv,o.matrixWorld));L.push([gg,m.color]);dead.push(o);});
  if(L.length<2)return;let n=0;L.forEach(([gg])=>n+=gg.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),Cc=new Float32Array(n*3);let w=0;
  for(const [gg,c] of L){const a=gg.attributes.position,b=gg.attributes.normal;for(let i=0;i<a.count;i++,w++){P[w*3]=a.getX(i);P[w*3+1]=a.getY(i);P[w*3+2]=a.getZ(i);N[w*3]=b.getX(i);N[w*3+1]=b.getY(i);N[w*3+2]=b.getZ(i);Cc[w*3]=c.r;Cc[w*3+1]=c.g;Cc[w*3+2]=c.b;}gg.dispose();}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(P,3));geo.setAttribute('normal',new T.BufferAttribute(N,3));geo.setAttribute('color',new T.BufferAttribute(Cc,3));geo.computeBoundingSphere();
  dead.forEach(o=>o.parent.remove(o));grp.add(new T.Mesh(geo,VC));};
 legs.forEach(l=>bakeGrp(l.p));heads.forEach(bakeGrp);
 g.userData.seat=[0,.92,-.45];g.userData.legs=legs;g.userData.heads=heads;g.userData.pose='sit';g.userData.v2=1;
 return g;}
root.SLEIGH_V2=SLEIGH_V2;if(typeof module!=='undefined')module.exports=SLEIGH_V2;
})(typeof window!=='undefined'?window:globalThis);
