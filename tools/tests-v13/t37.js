const pw=require('playwright-core');(async()=>{const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
for(const [lay,bots] of [['a',50],['b',20],['c',20]]){const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(c=>{localStorage.clear();localStorage.setItem('nk_cfg',c)},JSON.stringify({lay,bots}));await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.click('#go');await p.waitForTimeout(6000);
console.log(lay,bots,await p.evaluate(()=>[NKV2.decks.length,NKV2.bots.length,document.querySelector('.fps,#fps')?.textContent]));
await p.evaluate(()=>{document.querySelectorAll('#hud,.hud,#dock,#chat').forEach(e=>e.style.visibility='hidden');NKV2.setCam(0,95,40,0,0,0);});await p.waitForTimeout(1500);await p.screenshot({path:`/workspace/nakmeong/shots/v13-d-layout-${lay}.png`});await p.close();}
await b.close();})();
