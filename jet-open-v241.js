/* v241 🛩️ 오픈 전투기 (테스트) — 시안 /workspace/mount-upgrade-mock/jet (물고기·별 지운 판) · Three.js r147 프로시저럴
 * 사용: const g = JET_OPEN.build('ace')  // 'ace' | 'crimson' | 'aurora'
 *  - 좌표: +z 가 앞(기수), y 위, 단위는 게임 FLY.jet.sc(1.6) 곱하기 전 값
 *  - userData: seat(탑승 위치), flame(애프터버너 그룹), fly/tilt/jet=1, hideRider=0(캐릭터 보이는 오픈 콕핏)
 *  - 재질은 색 시안마다 8개 이하 → 게임의 slimGroup(재질별 합치기) 후 메시 ≈ 재질 수
 */
(function(root){
let T = null;
const PAL = {
 ace:     {n:'로열 에이스',   main:'#f3f5fa', belly:'#2c55c9', acc:'#1f3f9e', trim:'#f2bf45', dark:'#262a35', seat:'#3a2a1e', glass:'#bfe6ff',
           rim:'#9fc4ff', glow:['#ffffff','#8fe3ff','#3f8cff'], nav:['#ff4a5a','#3dff9a'], fish:'#ffffff', star:'#f2bf45', radome:'#cfd6e2', fin:'#2c55c9', spine:'#2c55c9', band:'#f2bf45', tipW:'#2c55c9'},
 crimson: {n:'크림슨 스텔스', main:'#1c1d25', belly:'#2a0d14', rimK:.22, acc:'#e0193a', trim:'#ff3b5c', dark:'#0e0f13', seat:'#2a1015', glass:'#ffd6dc',
           rim:'#ff4a6a', glow:['#fff4f0','#ff7a5a','#ff1f4a'], nav:['#ff2a4a','#ff9a3a'], fish:'#ff3b5c', star:'#ff3b5c', radome:'#30333d'},
 aurora:  {n:'오로라 스타파이터', main:'#7b4fe0', belly:'#38d9f5', acc:'#ff7ad9', band:'#ff7ad9', trim:'#d9e3f0', dark:'#241c3d', seat:'#2b2350', glass:'#e4dcff',
           rim:'#7ff6ff', glow:['#ffffff','#ff8af0','#7a5cff'], nav:['#ff6ad5','#5ff2ff'], fish:'#ffffff', star:'#fff3a8', radome:'#dfe6f0', grad:'#3fe6ff'}
};
const C = c => new T.Color(c);
const MC = {};
function mats(key){
 if(MC[key]) return MC[key];
 T = T || root.THREE;
 const P = PAL[key]||PAL.ace;
 const rim = (m, col, k) => { m.onBeforeCompile = sh => {
   sh.uniforms.rimC = {value: C(col)}; sh.uniforms.rimK = {value: k};
   sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 rimC; uniform float rimK;')
    .replace('#include <output_fragment>', '#include <output_fragment>\n{ vec3 nn = normalize(vNormal); vec3 vv = normalize(vViewPosition); float fr = pow(1.0 - clamp(abs(dot(nn, vv)), 0.0, 1.0), 2.6); gl_FragColor.rgb += rimC * fr * rimK; }');
  }; m.customProgramCacheKey = () => 'jetv2rim'; return m; };
 const M = {
  paint: rim(new T.MeshStandardMaterial({color:'#ffffff', vertexColors:true, metalness:.28, roughness:.34}), P.rim, P.rimK!=null?P.rimK:.42),
  trim:  rim(new T.MeshStandardMaterial({color:P.trim, metalness:.45, roughness:.28, emissive:C(P.trim), emissiveIntensity:key==='crimson'?.55:.12}), '#ffffff', .35),
  dark:  new T.MeshStandardMaterial({color:P.dark, metalness:.35, roughness:.55, side:T.DoubleSide}),
  seat:  new T.MeshStandardMaterial({color:P.seat, metalness:.05, roughness:.8}),
  glass: rim(new T.MeshStandardMaterial({color:P.glass, metalness:.3, roughness:.04, transparent:true, opacity:.5, depthWrite:false, side:T.DoubleSide}), '#ffffff', 1.0),
  glowCore: new T.MeshBasicMaterial({color:P.glow[0]}),
  glowAdd: new T.MeshBasicMaterial({color:'#ffffff', vertexColors:true, transparent:true, opacity:.8, blending:T.AdditiveBlending, depthWrite:false, side:T.DoubleSide}),
  lights: new T.MeshBasicMaterial({color:'#ffffff', vertexColors:true})
 };
 M.P = P; return MC[key] = M;
}
/* ---------- geometry helpers ---------- */
const cat = (p0,p1,p2,p3,t) => { const t2=t*t, t3=t2*t; return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3); };
const sp = (v,e) => Math.sign(v)*Math.pow(Math.abs(v),e);
function setColor(geo, fn){ const p=geo.attributes.position, n=geo.attributes.normal, a=new Float32Array(p.count*3), c=new T.Color();
 for(let i=0;i<p.count;i++){ const r=fn(p.getX(i),p.getY(i),p.getZ(i), n?n.getY(i):0, n?n.getX(i):0); c.set(r); a[i*3]=c.r; a[i*3+1]=c.g; a[i*3+2]=c.b; }
 geo.setAttribute('color', new T.BufferAttribute(a,3)); return geo; }
const solid = (geo,col) => setColor(geo, ()=>col);
function flip(geo){ // 좌우 대칭 복제용: x 뒤집고 감김 순서 뒤집기
 const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.scale(-1,1,1);
 for(const k in g.attributes){ const at=g.attributes[k], s=at.itemSize, arr=at.array; for(let i=0;i<at.count;i+=3){ for(let j=0;j<s;j++){ const a=(i+1)*s+j, b=(i+2)*s+j, t=arr[a]; arr[a]=arr[b]; arr[b]=t; } } at.needsUpdate=true; }
 g.computeVertexNormals(); return g; }
/* 단면을 이어 붙이는 동체(로프트). st: [{z,w,ht,hb,y,x,n}] (z 오름차순) */
function loft(st, o={}){
 const seg=o.seg||32, per=o.per||6, a0=o.a0!=null?o.a0:-Math.PI/2, a1=o.a1!=null?o.a1:Math.PI*1.5, full=o.a0==null, gr=o.grow||1, add=o.add||0;
 const keys=['z','w','ht','hb','y','x','n'], S=st.map(s=>Object.assign({y:0,x:0,n:2,hb:s.ht},s));
 const rings=[];
 for(let i=0;i<S.length-1;i++){ const p0=S[Math.max(0,i-1)], p1=S[i], p2=S[i+1], p3=S[Math.min(S.length-1,i+2)];
  for(let k=0;k<per;k++){ const t=k/per, r={}; keys.forEach(q=>r[q]=cat(p0[q],p1[q],p2[q],p3[q],t)); rings.push(r); } }
 rings.push(Object.assign({},S[S.length-1]));
 if(o.z0!=null||o.z1!=null){ /* 일부 구간만 (띠 데칼) */ }
 const pos=[], idx=[], cols=seg+1;
 const R = rings.filter(r=>(o.z0==null||r.z>=o.z0-1e-6)&&(o.z1==null||r.z<=o.z1+1e-6));
 R.forEach(r=>{ for(let j=0;j<=seg;j++){ const th=a0+(a1-a0)*j/seg, c=Math.cos(th), s=Math.sin(th), e=2/r.n;
   const w=Math.max(.001,r.w)*gr+add, h=(s>=0?r.ht:r.hb)*gr+add; pos.push(r.x+w*sp(c,e), r.y+h*sp(s,e), r.z); } });
 for(let i=0;i<R.length-1;i++) for(let j=0;j<seg;j++){ const a=i*cols+j, b=a+1, c=a+cols, d=c+1; idx.push(a,b,c, b,d,c); }
 const g=new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos,3)); g.setIndex(idx);
 if(o.capStart){ const r=R[0], ci=pos.length/3; pos.push(r.x, r.y, r.z); for(let j=0;j<seg;j++) idx.push(ci, j+1, j); g.setAttribute('position', new T.Float32BufferAttribute(pos,3)); g.setIndex(idx); }
 g.computeVertexNormals();
 if(full){ const n=g.attributes.normal; for(let i=0;i<R.length;i++){ const a=i*cols, b=a+seg; const x=n.getX(a)+n.getX(b), y=n.getY(a)+n.getY(b), z=n.getZ(a)+n.getZ(b), l=Math.hypot(x,y,z)||1; n.setXYZ(a,x/l,y/l,z/l); n.setXYZ(b,x/l,y/l,z/l);} }
 return g; }
function plate(pts, depth, bev, segs){ const sh=new T.Shape(); pts.forEach((p,i)=>i?sh.lineTo(p[0],p[1]):sh.moveTo(p[0],p[1]));
 const g=new T.ExtrudeGeometry(sh,{depth, bevelEnabled:bev>0, bevelThickness:bev, bevelSize:bev*.9, bevelSegments:segs||2, curveSegments:8}); g.translate(0,0,-depth/2); return g; }
function tube(pts, r, closed, rs){ const cv=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(p[0],p[1],p[2])), !!closed, 'centripetal'); return new T.TubeGeometry(cv, Math.max(10,Math.round(pts.length*(closed?2.2:4))), r, rs||8, !!closed); }
function flat(pts){ const sh=new T.Shape(); pts.forEach((p,i)=>i?sh.lineTo(p[0],-p[1]):sh.moveTo(p[0],-p[1])); const g=new T.ShapeGeometry(sh); g.rotateX(-Math.PI/2); return g; }
const xf = (g, o) => { const m=new T.Matrix4(), q=new T.Quaternion().setFromEuler(new T.Euler(...(o.r||[0,0,0]))); m.compose(new T.Vector3(...(o.p||[0,0,0])), q, new T.Vector3(...(o.s||[1,1,1]))); g.applyMatrix4(m); return g; };

/* ---------- build ---------- */
function build(key, opt={}){
 T = T || root.THREE;
 const M=mats(key), P=M.P, g=new T.Group(); g.name='jet-open-'+key;
 const add=(geo, mat, both)=>{ const m=new T.Mesh(geo, mat); g.add(m); if(both){ const m2=new T.Mesh(flip(geo), mat); g.add(m2); } return m; };
 const cMain=C(P.main), cBelly=C(P.belly), cGrad=P.grad?C(P.grad):null, cRad=C(P.radome), cSeat=C(P.seat), tmp=new T.Color();
 const bodyCol=(x,y,z)=>{ // 위 = 메인 · 아래 = 배색 (옆 선에서 또렷이 갈려요) · 오로라는 앞→뒤 그라데이션
   if(z>2.42) return cRad;
   if(y>.12 && Math.pow(x/.44,2)+Math.pow((z-.36)/.63,2)<1) return cSeat;
   let top = cMain; if(cGrad){ const t=Math.min(1,Math.max(0,(1.9-z)/4.0)); top=tmp.copy(cMain).lerp(cGrad,t*.85).clone(); }
   const k = y < -0.06 ? 1 : (y < -0.02 ? (-.02-y)/.04 : 0); return top.clone().lerp(cBelly,k); };
 /* 1) 동체: 유선형 기수 → 넓은 조종석 → 엔진 */
 const FUS=[
  {z:-2.18,w:.44,ht:.22,hb:.22,y:.0,n:2.6},{z:-1.9,w:.47,ht:.24,hb:.24,y:.0,n:2.6},{z:-1.4,w:.52,ht:.27,hb:.27,y:.01,n:2.6},
  {z:-.8,w:.56,ht:.3,hb:.29,y:.02,n:2.5},{z:-.2,w:.56,ht:.33,hb:.3,y:.02,n:2.4},{z:.4,w:.53,ht:.34,hb:.29,y:.02,n:2.3},
  {z:.95,w:.47,ht:.33,hb:.27,y:.03,n:2.2},{z:1.45,w:.38,ht:.28,hb:.23,y:.04,n:2.1},{z:1.9,w:.27,ht:.21,hb:.17,y:.05,n:2.0},
  {z:2.3,w:.15,ht:.12,hb:.1,y:.06,n:2},{z:2.6,w:.06,ht:.05,hb:.045,y:.065,n:2},{z:2.74,w:.006,ht:.006,hb:.006,y:.065,n:2}];
 add(setColor(loft(FUS,{seg:36,per:6,capStart:true}), bodyCol), M.paint);
 const surfY=(x,z)=>{ let i=0; while(i<FUS.length-2&&FUS[i+1].z<z) i++; const a=FUS[i], b=FUS[i+1], t=Math.min(1,Math.max(0,(z-a.z)/(b.z-a.z))), L=q=>a[q]+(b[q]-a[q])*t;
   const w=L('w'), h=L('ht'), n=L('n'), y=L('y'), u=Math.min(.999,Math.abs(x)/w); return y+h*Math.pow(1-Math.pow(u,n),1/n); };
 /* 패널 라인 (얇은 어두운 띠) */
 const lineC='#'+C(P.main).multiplyScalar(.62).getHexString(), lineB='#'+C(P.belly).multiplyScalar(.62).getHexString();
 [[1.62,1.645],[-.95,-.925],[-1.62,-1.6]].forEach(([a,b])=>add(setColor(loft(FUS,{seg:36,per:24,z0:a,z1:b,grow:1.012,add:.002}),(x,y)=>y<-.04?lineB:lineC), M.paint));
 /* 옆 줄무늬 데칼 (기수 → 꼬리) */
 const stripe=(a0,a1)=>add(solid(loft(FUS,{seg:6,per:6,z0:-1.85,z1:2.28,a0,a1,grow:1.01,add:.003}),P.acc), M.paint);
 stripe(.02,.16); stripe(Math.PI-.16,Math.PI-.02);
 /* 등 위 금색 라인 */
 add(loft(FUS,{seg:4,per:6,z0:1.05,z1:2.3,a0:Math.PI/2-.05,a1:Math.PI/2+.05,grow:1.012,add:.003}), M.trim);
 /* 2) 오픈 콕핏: 테두리 · 바닥 · 좌석 · 계기판 · 앞유리 */
 const rimPts=[]; for(let i=0;i<28;i++){ const a=i/28*Math.PI*2, c=Math.cos(a), sn=Math.sin(a), x=.45*sp(c,.75), z=.36+.64*sp(sn,.8); rimPts.push([x, surfY(x,z)+.012, z]); }
 add(tube(rimPts,.042,true,10), M.dark);
 const seatSh=new T.Shape(); seatSh.moveTo(-.27,0); seatSh.lineTo(.27,0); seatSh.quadraticCurveTo(.3,.0,.3,.08); seatSh.lineTo(.27,.5); seatSh.quadraticCurveTo(.25,.62,.1,.63); seatSh.lineTo(-.1,.63); seatSh.quadraticCurveTo(-.25,.62,-.27,.5); seatSh.lineTo(-.3,.08); seatSh.quadraticCurveTo(-.3,0,-.27,0);
 const seatG=new T.ExtrudeGeometry(seatSh,{depth:.06,bevelEnabled:true,bevelThickness:.03,bevelSize:.03,bevelSegments:2,curveSegments:5}); xf(seatG,{p:[0,.3,-.02],r:[-.14,0,0]}); add(seatG, M.seat);   // 등받이(둥근 쿠션)
 const padSh=new T.Shape(); padSh.moveTo(-.16,.4); padSh.lineTo(.16,.4); padSh.quadraticCurveTo(.2,.4,.2,.46); padSh.lineTo(.18,.56); padSh.lineTo(-.18,.56); padSh.lineTo(-.2,.46); padSh.quadraticCurveTo(-.2,.4,-.16,.4);
 const padG=new T.ExtrudeGeometry(padSh,{depth:.02,bevelEnabled:true,bevelThickness:.012,bevelSize:.01,bevelSegments:1,curveSegments:3}); xf(padG,{p:[0,.3,.07],r:[-.14,0,0]}); add(solid(padG,P.acc), M.paint);
 add(tube([[-.3,.8,-.02],[-.2,.93,-.05],[0,.955,-.06],[.2,.93,-.05],[.3,.8,-.02]],.03,false,8), M.trim);      // 등받이 위 금장
 add(xf(new T.BoxGeometry(.5,.12,.14),{p:[0,.42,.98],r:[.5,0,0]}), M.dark);                    // 계기판 덮개
 add(xf(new T.BoxGeometry(.18,.08,.02),{p:[-.12,.47,1.0],r:[.5,0,0]}), M.lights);
 // 앞유리 (감싸는 곡면) + 금색 테두리
 const wsSt=[[.9,.47,.47],[1.04,.44,.4],[1.18,.39,.28],[1.32,.31,.13]];
 const wsPos=[], wsIdx=[], SEG=20; wsSt.forEach(([z,w,h])=>{ const yb=surfY(w,z)-.015; for(let j=0;j<=SEG;j++){ const th=j/SEG*Math.PI, c=Math.cos(th), sn=Math.sin(th); wsPos.push(w*sp(c,.8), yb+h*sp(sn,.8)+ (surfY(0,z)-surfY(w,z))*sp(sn,.8)*.0, z); } });
 for(let i=0;i<wsSt.length-1;i++) for(let j=0;j<SEG;j++){ const a2=i*(SEG+1)+j; wsIdx.push(a2,a2+1,a2+SEG+1, a2+1,a2+SEG+2,a2+SEG+1); }
 const wsG=new T.BufferGeometry(); wsG.setAttribute('position',new T.Float32BufferAttribute(wsPos,3)); wsG.setIndex(wsIdx); wsG.computeVertexNormals(); add(wsG, M.glass);
 const P0=i=>[wsPos[i*3],wsPos[i*3+1],wsPos[i*3+2]];
 const top=[]; for(let j=0;j<=SEG;j+=2) top.push(P0(j)); add(tube(top,.032,false,8), M.trim);
 [0,SEG].forEach(j=>{ const ln=[]; for(let i=0;i<wsSt.length;i++) ln.push(P0(i*(SEG+1)+j)); add(tube(ln,.022,false,6), M.trim); });
 add(tube([P0(SEG/2),P0((SEG+1)+SEG/2),P0(2*(SEG+1)+SEG/2),P0(3*(SEG+1)+SEG/2)],.014,false,6), M.trim);
 // 등 뒤 페어링 (머리받침 → 꼬리)
 add(setColor(loft([{z:-1.95,w:.1,ht:.1,y:.25,n:2.2},{z:-1.4,w:.18,ht:.18,y:.26,n:2.2},{z:-.85,w:.25,ht:.3,y:.26,n:2.3},{z:-.38,w:.29,ht:.48,y:.26,n:2.4},{z:-.05,w:.29,ht:.5,y:.26,n:2.4}],{seg:20,per:5,a0:0,a1:Math.PI}), (x,y,z)=>P.spine||bodyCol(x,y+.5,z)), M.paint);
 add(xf(new T.CylinderGeometry(.007,.013,.17,8),{r:[Math.PI/2,0,0],p:[0,.065,2.8]}), M.trim);   // 피토관
 add(loft(FUS,{seg:36,per:30,z0:2.36,z1:2.4,grow:1.012,add:.002}), M.trim);   // 레이돔 금색 링
 /* 3) 공기흡입구 (옆구리) */
 const INT=[{z:-.7,w:.07,ht:.1,hb:.12,y:-.1,x:.5,n:3},{z:-.1,w:.12,ht:.13,hb:.15,y:-.1,x:.56,n:3.4},{z:.55,w:.14,ht:.15,hb:.16,y:-.1,x:.58,n:3.6},{z:.8,w:.14,ht:.15,hb:.16,y:-.1,x:.58,n:3.6}];
 const intG=setColor(loft(INT,{seg:24,per:5}), (x,y,z)=>bodyCol(x,y,z));
 add(intG, M.paint, true);
 const lip=loft(INT,{seg:24,per:12,z0:.74,z1:.8,grow:1.06,add:.004}); add(lip, M.trim, true);
 const mouth=xf(new T.CircleGeometry(1,24),{p:[.58,-.1,.78],s:[.13,.145,1]}); add(mouth, M.dark, true);
 /* 4) 주익 · LERX · 카나드 · 수평꼬리 · 수직꼬리 2개 */
 const wingPts=[[.42,1.0],[.6,.45],[1.98,-.86],[2.06,-1.1],[1.62,-1.16],[.5,-1.32]];
 const wingG=setColor(xf(plate(wingPts,.05,.03,2),{r:[Math.PI/2,0,0],p:[0,-.02,0]}),(x,y,z,ny)=>ny<-.3?P.belly:(cGrad? '#'+tmp.copy(cMain).lerp(cGrad,Math.min(1,Math.max(0,(1.9-z)/4))*.85).getHexString():P.main));
 add(wingG, M.paint, true);
 // 날개 위 셰브론 줄무늬 + 별 엠블럼
 const chev=flat([[.66,.3],[1.9,-.84],[1.86,-.95],[.6,.14]]); chev.translate(0,.04,0); add(solid(chev,P.acc), M.paint, true);
 const chev2=flat([[.5,-1.12],[1.58,-1.0],[1.6,-1.06],[.5,-1.2]]); chev2.translate(0,.04,0); add(solid(chev2,P.acc), M.paint, true);
 // t166: 날개 별 엠블럼 삭제
 const lerx=[[.36,1.45],[.5,1.0],[.66,.4],[.5,.3]];
 add(setColor(xf(plate(lerx,.04,.02,1),{r:[Math.PI/2,0,0],p:[0,.02,0]}),(x,y,z,ny)=>ny<-.3?P.belly:bodyCol(x,.1,z)), M.paint, true);
 const can=[[.3,1.78],[.86,1.36],[.88,1.24],[.36,1.4]];
 add(setColor(xf(plate(can,.035,.016,1),{r:[Math.PI/2,0,0],p:[0,.06,0]}),(x,y,z,ny)=>ny<-.3?P.belly:P.main), M.paint, true);
 const hst=[[.4,-1.55],[1.28,-2.0],[1.3,-2.3],[.42,-2.25]];
 add(setColor(xf(plate(hst,.04,.018,1),{r:[Math.PI/2,0,0],p:[0,-.02,0]}),(x,y,z,ny)=>ny<-.3?P.belly:P.main), M.paint, true);
 // 수직꼬리: (z,y) 평면 → 바깥으로 18° 기울임
 const fin=[[-1.05,0],[-1.75,.95],[-2.02,1.0],[-2.24,.98],[-2.22,0]];
 const finG=plate(fin.map(p=>[p[0],p[1]]),.05,.02,2); finG.rotateY(-Math.PI/2); // shape x→ -z… 아래에서 위치 맞춤
 const finM=xf(setColor(finG,(x,y,z)=>P.fin||P.main),{r:[0,0,-.32],p:[.34,.26,0]});
 const band=plate([[-1.6,.74],[-1.75,.95],[-2.02,1.0],[-2.24,.98],[-2.235,.74]],.1,.0,1); band.rotateY(-Math.PI/2); xf(solid(band,P.band||P.acc),{r:[0,0,-.32],p:[.34,.26,0]}); add(band, M.paint, true);
 add(finM, M.paint, true);
 const finTip=xf(new T.BoxGeometry(.05,.035,.5),{p:[0,1.0,-2.12]}); xf(finTip,{r:[0,0,-.32],p:[.34,.26,0]}); add(finTip, M.trim, true);
 // t166: 꼬리 물고기 엠블럼 삭제
 /* 5) 트윈 엔진 노즐 + 애프터버너 */
 const noz=[]; [[.2,0],[.205,.05],[.2,.12],[.185,.24],[.19,.3],[.17,.31],[.15,.2],[.13,.05]].forEach(p=>noz.push(new T.Vector2(p[0],p[1])));
 const nozG=new T.LatheGeometry(noz,24); nozG.rotateX(-Math.PI/2); 
 const fl=new T.Group(); fl.name='afterburner';
 [-1,1].forEach(q=>{ const x=q*.21, z=-2.16;
  add(xf(nozG.clone(),{p:[x,0,z]}), M.dark);
  add(xf(new T.TorusGeometry(.196,.014,6,24),{p:[x,0,z-.12]}), M.trim);
  add(xf(new T.TorusGeometry(.192,.012,6,24),{p:[x,0,z-.25]}), M.trim);
  add(xf(new T.CircleGeometry(.13,20),{p:[x,0,z-.06],r:[0,Math.PI,0]}), M.glowCore);
  const cone=(r,l,col0,col1,dz,k0)=>{ const cg=new T.ConeGeometry(r,l,20,4,true); cg.rotateX(-Math.PI/2); cg.translate(x,0,z-.06-l/2-dz); const p=cg.attributes.position,a=new Float32Array(p.count*3),c0=C(col0),c1=C(col1),c=new T.Color();
   for(let i=0;i<p.count;i++){ const t=Math.min(1,Math.max(0,(z-.06-dz-p.getZ(i))/l)); c.copy(c0).lerp(c1,Math.min(1,t*1.6)).multiplyScalar((1-t)*(1-t)*k0); a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b; } cg.setAttribute('color',new T.BufferAttribute(a,3)); const m=new T.Mesh(cg,M.glowAdd); fl.add(m); };
  cone(.14,1.1,P.glow[1],P.glow[2],0,.62); cone(.08,.55,P.glow[0],P.glow[1],0,.8);
  [.34,.6].forEach((d,i)=>{ const s=new T.SphereGeometry(.048-i*.012,10,8); s.scale(1,1,1.7); s.translate(x,0,z-.06-d); solid(s,'#'+C(P.glow[1]).multiplyScalar(.55-i*.15).getHexString()); fl.add(new T.Mesh(s,M.glowAdd)); });
  const hr=new T.TorusGeometry(.17,.03,6,24); hr.translate(x,0,z-.33); solid(hr,'#'+C(P.glow[2]).multiplyScalar(.6).getHexString()); fl.add(new T.Mesh(hr,M.glowAdd));
 });
 g.add(fl);
 /* 6) 미사일 (날개 아래 · 날개 끝) · 항법등 */
 const missile=(x,y,z,L,r)=>{ const parts=[];
  parts.push([xf(new T.CylinderGeometry(r,r,L,14),{r:[Math.PI/2,0,0],p:[x,y,z]}), 'w']);
  parts.push([xf(new T.ConeGeometry(r,r*3.2,14),{r:[Math.PI/2,0,0],p:[x,y,z+L/2+r*1.6]}), 'a']);
  parts.push([xf(new T.CylinderGeometry(r*1.02,r*1.02,L*.08,14),{r:[Math.PI/2,0,0],p:[x,y,z+L*.22]}), 'a']);
  [0,Math.PI/2].forEach(a=>parts.push([xf(new T.BoxGeometry(r*5,.008,L*.16),{r:[0,0,a+Math.PI/4],p:[x,y,z-L/2+L*.1]}), 'a']));
  return parts; };
 const MW=[];
 [[1.12,-.13,-.45,.78,.055],[2.03,-.02,-.98,.62,.04]].forEach(a=>MW.push(...missile(...a)));
 MW.forEach(([geo,c])=>{ setColor(geo,()=>c==='w'?(key==='crimson'?'#3a3d47':'#f4f5f8'):P.acc); add(geo,M.paint,true); });
 add(xf(new T.BoxGeometry(.04,.07,.5),{p:[1.12,-.06,-.5]}), M.dark, true);           // 파일런
 add(xf(new T.BoxGeometry(.03,.03,.62),{p:[2.03,.0,-.98]}), M.dark, true);            // 날개 끝 레일
 // 항법등 (왼쪽 빨강 · 오른쪽 초록) + 은은한 빛무리
 [[1,P.nav[0]],[-1,P.nav[1]]].forEach(([q,c])=>{
  const s=solid(xf(new T.SphereGeometry(.035,10,8),{p:[q*1.97,.04,-.84]}),c); g.add(new T.Mesh(s,M.lights));
  const h=solid(xf(new T.SphereGeometry(.045,10,8),{p:[q*1.97,.04,-.84]}),c); const hm=new T.Mesh(h,M.glowAdd); fl.parent===g&&g.add(hm);
 });
 // 계기판 화면 색
 g.children.forEach(m=>{ if(m.material===M.lights&&!m.geometry.attributes.color) solid(m.geometry,P.glow[1]); });
 /* userData (게임과 같은 규칙) */
 g.userData.seat=[0,-.02,.35]; g.userData.flame=fl; g.userData.fly=1; g.userData.tilt=1; g.userData.jet=1; g.userData.hideRider=0; g.userData.trail=[[2.0,.04,-.9],[-2.0,.04,-.9]];
 g.userData.tick=(dt,t)=>{ const k=1+.07*Math.sin(t*38)+.05*Math.sin(t*23); fl.scale.set(1,1,k); };
 if(opt.pack!==false){ const keep=new Set(); pack(g,keep); }
 g.userData.slim=1; g.userData.keepM=Object.values(M).filter(x=>x&&x.isMaterial);
 return g;
}

/* 같은 재질끼리 미리 합쳐요 (불꽃 그룹은 따로) — 게임 slimGroup은 건너뛰어요(userData.slim) */
function pack(g, keep){
 const by=new Map(), dead=[]; g.updateMatrixWorld(true);
 g.children.forEach(m=>{ if(!m.isMesh||keep.has(m)) return; const k=m.material; if(!by.has(k)) by.set(k,[]); by.get(k).push(m); });
 for(const [mat,L] of by){ if(L.length<2) continue; const vc=!!mat.vertexColors; let n=0; const parts=L.map(m=>{ let geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone(); geo.applyMatrix4(m.matrix); if(!geo.attributes.normal) geo.computeVertexNormals(); n+=geo.attributes.position.count; return geo; });
  const P=new Float32Array(n*3), N=new Float32Array(n*3), Cc=vc?new Float32Array(n*3):null; let o=0;
  parts.forEach(geo=>{ const c=geo.attributes.position.count; P.set(geo.attributes.position.array.subarray(0,c*3),o*3); N.set(geo.attributes.normal.array.subarray(0,c*3),o*3); if(Cc){ const ca=geo.attributes.color; if(ca) Cc.set(ca.array.subarray(0,c*3),o*3); else Cc.fill(1,o*3,(o+c)*3); } o+=c; geo.dispose(); });
  const G=new T.BufferGeometry(); G.setAttribute('position',new T.BufferAttribute(P,3)); G.setAttribute('normal',new T.BufferAttribute(N,3)); if(Cc) G.setAttribute('color',new T.BufferAttribute(Cc,3)); G.computeBoundingSphere();
  const mm=new T.Mesh(G,mat); g.add(mm); L.forEach(m=>dead.push(m)); }
 dead.forEach(m=>g.remove(m)); }
function stats(o){ let tri=0, mesh=0; const ms=new Set(); o.traverse(m=>{ if(!m.isMesh) return; mesh++; ms.add(m.material.uuid); const gg=m.geometry; tri+=(gg.index?gg.index.count:gg.attributes.position.count)/3; }); return {tri:Math.round(tri), mesh, mats:ms.size}; }
root.JET_OPEN = {build, stats, PAL};
})(typeof window!=='undefined'?window:globalThis);
