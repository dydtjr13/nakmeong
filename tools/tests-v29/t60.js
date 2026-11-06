// v29: 어항 판매 시 다른 물고기 yaw 유지 / 호수 물고기 없음 / AI 물 밖
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const O='/workspace/nakmeong/shots/v29/';require('fs').mkdirSync(O,{recursive:true});const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_tut25',JSON.stringify({i:99,chk:1}));localStorage.setItem('nk_ui25',JSON.stringify({duckOn:0}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.evaluate(()=>document.getElementById('go').click());await p.waitForTimeout(2500);
const out={};
out.worldFish=await p.evaluate(()=>{try{return !!document.querySelector('canvas')&&!performance.getEntriesByName('wf').length;}catch(e){return null;} /* probe via scene */ const sc=NKV2.scene;let n=0;sc.traverse(o=>{if(o.isInstancedMesh&&o.count===16&&o.material&&o.material.opacity===.35)n++;});return {shadowMeshes:n};});
// seed tank with 5 fish
await p.evaluate(()=>{const S=NKV2.S,D=NKV2.D;for(let i=0;i<5;i++){const f=D.FISH[i%D.FISH.length];S.tank.push({id:S.nid++,k:f.k,cm:20+i,g:0,v:10+i,sale:false,lock:false});}NKV2.save();});
await p.evaluate(()=>{document.getElementById('bTank').click();});await p.waitForTimeout(800);
const before=await p.evaluate(()=>{const tv=NKV2.tankView;return tv.fish.map(x=>({id:x.f.id,yaw:x.yaw,x:x.o.position.x,z:x.o.position.z,ph:x.ph,oid:x.o.uuid}));});
out.beforeN=before.length;
const sellId=before[2].id;
await p.click(`[data-sell="${sellId}"]`);await p.waitForTimeout(50);
const after=await p.evaluate(()=>{const tv=NKV2.tankView;return tv.fish.map(x=>({id:x.f.id,yaw:x.yaw,x:x.o.position.x,z:x.o.position.z,ph:x.ph,oid:x.o.uuid}));});
out.afterN=after.length;out.soldGone=!after.some(x=>x.id==sellId);
out.sameObj=before.filter(b=>b.id!=sellId).every(b=>{const a=after.find(x=>x.id==b.id);return a&&a.oid===b.oid;});
out.posKept=before.filter(b=>b.id!=sellId).every(b=>{const a=after.find(x=>x.id==b.id);return a&&Math.abs(a.x-b.x)<1e-9&&Math.abs(a.z-b.z)<1e-9;});
await p.screenshot({path:O+'tank-after-sell.jpg',quality:85});
// AI water check
out.ai=await p.evaluate(()=>{const LR=NKV2.S&&null;const bots=NKV2.bots,me=NKV2;const rmin=[];for(let i=0;i<90;i++){/* advance via internal if exposed */}
  // force bots to walk
  const B=NKV2.bots;let minR=1e9,inWater=0;B.forEach(b=>{const p=b.c.o.position,r=Math.hypot(p.x,p.z);minR=Math.min(minR,r);if(p.y<.2&&r<30)inWater++;});
  // run many bot updates
  for(let t=0;t<400;t++){B.forEach(b=>{if(!b.path.length){try{/* trigger goal */}catch(e){}}});}
  // call fishAction path indirectly by evaluating ring clamp after forcing positions into lake
  B.forEach(b=>{b.c.o.position.set(5,0.1,5);b.path=[{x:40,z:0}];b.seat=null;});
  return {minRBefore:minR};
});
// force update via requestAnimationFrame wait
await p.evaluate(()=>{const B=NKV2.bots;B.forEach(b=>{b.c.o.position.set(3,.1,3);b.path=[{x:50,z:0},{x:55,z:5}];b.seat=null;b.goal='shop';});});
await p.waitForTimeout(2500);
out.aiAfter=await p.evaluate(()=>{const B=NKV2.bots;return B.slice(0,8).map(b=>{const p=b.c.o.position;return {r:+Math.hypot(p.x,p.z).toFixed(2),y:+p.y.toFixed(2)};});});
out.errs=errs;
console.log(JSON.stringify(out));await b.close();})();
