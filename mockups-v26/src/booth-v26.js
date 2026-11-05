// v26 시안 전용(게임에 안 들어감): 직접 만든 로우폴리 음악 부스 3종 — 외부 에셋 없음(저작권 문제 없음)
window.NK_BOOTH=function(T,kind){const g=new T.Group(),M=c=>new T.MeshLambertMaterial({color:c}),B=(w,h,d,c,x,y,z,ry)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);if(ry)m.rotation.y=ry;m.castShadow=true;g.add(m);return m;},
 Cy=(rt,rb,h,c,x,y,z,s=12)=>{const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,s),M(c));m.position.set(x,y,z);g.add(m);return m;};
 const deck=(x,y,z)=>{const p=new T.Group();g.add(p);p.position.set(x,y,z);const b=new T.Mesh(new T.BoxGeometry(.9,.12,.62),M('#2b2530'));p.add(b);
  const rec=new T.Mesh(new T.CylinderGeometry(.24,.24,.03,24),M('#141018'));rec.position.set(-.14,.08,0);p.add(rec);const lab=new T.Mesh(new T.CylinderGeometry(.08,.08,.035,16),M('#ff7b5c'));lab.position.set(-.14,.085,0);p.add(lab);
  const arm=new T.Mesh(new T.BoxGeometry(.03,.03,.36),M('#d8dce4'));arm.position.set(.24,.1,.02);arm.rotation.y=.35;p.add(arm);g.userData.spin=g.userData.spin||[];g.userData.spin.push(rec,lab);return p;};
 const W1='#c8925a',W2='#a8703e',W3='#e8c08a';
 if(kind==='A'){ // A 원목 부스: 카운터 + 지붕 + 턴테이블 2대 + 스피커
  B(3.2,1.0,1.1,W1,0,.5,0);B(3.4,.1,1.3,W3,0,1.05,0);deck(-.7,1.16,0);deck(.7,1.16,0);B(.5,.9,.5,'#3a3240',-2.0,.45,0);B(.5,.9,.5,'#3a3240',2.0,.45,0);
  [[-2,.55],[2,.55]].forEach(([x])=>{Cy(.14,.14,.05,'#8a8494',x,.62,.26,16).rotation.x=Math.PI/2;Cy(.09,.09,.05,'#8a8494',x,.3,.26,16).rotation.x=Math.PI/2;});
  [-1.5,1.5].forEach(x=>{B(.14,2.4,.14,W2,x,1.2,-.6);});B(3.6,.12,1.8,'#e86a4a',0,2.45,-.2);B(3.6,.3,.08,'#fff4e0',0,2.25,.68);
  const s=document.createElement('canvas');s.width=256;s.height=48;const x=s.getContext('2d');x.fillStyle='#fff4e0';x.fillRect(0,0,256,48);x.fillStyle='#c0503a';x.font='bold 30px sans-serif';x.textAlign='center';x.fillText('♪ FISH RADIO ♪',128,35);
  const sm=new T.Mesh(new T.PlaneGeometry(3.4,.6),new T.MeshBasicMaterial({map:new T.CanvasTexture(s)}));sm.position.set(0,1.95,.73);g.add(sm);}
 if(kind==='B'){ // B 오두막형: 작은 나무집 창문 카운터 + 턴테이블 1대 + 꼬마전구
  B(2.6,2.0,2.0,W2,0,1.0,-.3);B(2.0,.9,.1,'#3a2a1c',0,1.35,.71);B(2.8,.1,.5,W3,0,.95,.85);deck(0,1.06,.85);
  const roof=new T.Mesh(new T.ConeGeometry(2.1,1.1,4),M('#5a8a5a'));roof.position.set(0,2.55,-.3);roof.rotation.y=Math.PI/4;g.add(roof);
  for(let i=0;i<9;i++){const b=new T.Mesh(new T.SphereGeometry(.06,8,6),new T.MeshBasicMaterial({color:['#ffd35a','#ff8a6a','#8ad4ff'][i%3]}));b.position.set(-1.3+i*.325,2.0-Math.sin(i/8*Math.PI)*.18,.75);g.add(b);}
  B(.6,.7,.6,'#d8b080',1.7,.35,.7);Cy(.22,.22,.3,'#3a3240',1.7,.85,.7);}
 if(kind==='C'){ // C 원형 무대: 둥근 나무 단상 + 턴테이블 테이블 + 음표 깃발
  Cy(1.8,1.9,.35,W1,0,.17,0,20);Cy(1.6,1.6,.06,W3,0,.37,0,20);B(1.6,.8,.7,'#3a3240',0,.8,-.4);deck(0,1.26,-.4);
  [[-1.4,-1.0],[1.4,-1.0]].forEach(([x,z])=>{B(.1,2.2,.1,W2,x,1.4,z);const f=new T.Mesh(new T.PlaneGeometry(.6,.4),new T.MeshLambertMaterial({color:'#ff8a6a',side:T.DoubleSide}));f.position.set(x+.32,2.3,z);g.add(f);});
  B(.5,.8,.5,'#2b2530',-1.0,.8,.6);B(.5,.8,.5,'#2b2530',1.0,.8,.6);}
 g.userData.tick=dt=>{(g.userData.spin||[]).forEach(r=>r.rotation.y+=dt*3.5);};return g;};
