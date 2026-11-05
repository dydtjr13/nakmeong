// draw call 측정: 데크 모양 × 봇 수, 데스크톱 1280x720, 카메라 기본(내 데크) + 전경
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('ERR',e.message));const out=[];
const OFF=process.argv[3]==='off';const combos=(process.argv[2]||'_:9,_:50,W1:9,W1:50,W2:50,W3:50,W4:50').split(',');
for(const c of combos){const [w,n]=c.split(':');await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(([w,n,OFF])=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({lay:'a',bots:+n,deckW:w==='_'?'':w}));if(OFF)localStorage.setItem('nakmeong_v2',JSON.stringify({farLOD:false}));},[w,n,OFF]);await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.evaluate(()=>{const s=document.querySelector('.stB');if(s)s.dataset.step=3;});await p.click('#go');await p.waitForTimeout(4000);
 const m=await p.evaluate(async()=>{const R=NKV2.R;R.info.autoReset=false;const sm=async()=>{let a=[];for(let i=0;i<20;i++){R.info.reset();await new Promise(r=>requestAnimationFrame(r));a.push(R.info.render.calls);}a.sort((x,y)=>x-y);return a[10];};const near=await sm();NKV2.setCam(0,70,60,0,0,0);await new Promise(r=>setTimeout(r,300));const wide=await sm();NKV2.setCam(null);
  let meshes=0,charMeshes=0;NKV2.scene.traverse(o=>{if(o.isMesh&&o.visible)meshes++;});NKV2.chars.forEach(c=>c.o.traverse(o=>{if(o.isMesh)charMeshes++;}));R.info.autoReset=true;return {near,wide,meshes,charMeshes,chars:NKV2.chars.length,tri:R.info.render.triangles};});
 out.push([c,m]);console.log(c,JSON.stringify(m));}
await b.close();})();
