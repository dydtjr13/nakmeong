// v19 회귀: 간략화 OFF에서 봇이 로그아웃→재접속 후 다시 보이는지 + 이동/줌/회전 중 메시 가시성
const pw=require('playwright-core');(async()=>{const W=+(process.argv[2]||1280),H=+(process.argv[3]||720),MOB=W<700;
const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:W,height:H},...(MOB?{isMobile:true,hasTouch:true}:{})});const ev=(f,a)=>p.evaluate(f,a);p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8787/nakmeong.html');await ev(()=>{localStorage.clear();});await p.addInitScript(()=>{if(!sessionStorage.k){sessionStorage.k=1;localStorage.clear();}const K=Object.keys(localStorage).find(k=>k.startsWith('nk'))||'__';});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,{timeout:180000});await p.evaluate(()=>{const s=document.querySelector('.stB');if(s)s.dataset.step=3;});await p.click('#go');await p.waitForTimeout(1500);
await ev(()=>{NKV2.S.farLOD=false;localStorage.setItem('nakmeong_v2',JSON.stringify(NKV2.S));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,{timeout:180000});await p.evaluate(()=>{const s=document.querySelector('.stB');if(s)s.dataset.step=3;});await p.click('#go');await p.waitForTimeout(1500);console.log('farLOD',await ev(()=>NKV2.S.farLOD),'simps',await ev(()=>NKV2.chars.filter(c=>c.simp).length));
// 모든 봇 강제 로그아웃 → 재접속
await ev(()=>NKV2.bots.forEach(b=>{b.on=true;b.pt=0;}));await p.waitForTimeout(500);
console.log(await ev(()=>NKV2.bots.map(b=>(b.on?1:0)+''+(b.c.o.visible?1:0)).join(' ')));await ev(()=>NKV2.bots.forEach(b=>{b.pt=0;}));await p.waitForTimeout(500);
console.log(await ev(()=>NKV2.bots.map(b=>(b.on?1:0)+''+(b.c.o.visible?1:0)).join(' ')));
const r=await ev(()=>{const on=NKV2.bots.filter(b=>b.on);return {on:on.length,hidden:on.filter(b=>!b.c.o.visible).length,culled:NKV2.chars.filter(c=>{let x=0;c.o.traverse(m=>{if(m.isMesh&&m.frustumCulled)x++;});return x;}).length};});
// 이동·줌·회전
for(let i=0;i<6;i++){await p.keyboard.down('KeyW');await p.waitForTimeout(400);await p.keyboard.up('KeyW');await p.mouse.wheel(0,i%2?-600:600);await p.waitForTimeout(200);}
const r2=await ev(()=>NKV2.bots.filter(b=>b.on&&!b.c.o.visible).length);
console.log(MOB?'mobile':'desktop','online',r.on,'hiddenOnline',r.hidden,'afterMove',r2,'charsWithCulledMesh',r.culled, (r.hidden||r2)?'FAIL':'PASS');await b.close();})();
