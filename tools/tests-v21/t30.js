const pw=require('playwright-core');(async()=>{const W=+(process.argv[2]||1280),H=+(process.argv[3]||720),MOB=W<700,tag=MOB?'m':'d';
const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:W,height:H},...(MOB?{isMobile:true,hasTouch:true}:{})});const ev=(f,a)=>p.evaluate(f,a);p.on('pageerror',e=>console.log('ERR',e.message));
const sh=n=>p.screenshot({path:`/workspace/nakmeong/shots/v11-${tag}-${n}.png`});
await p.goto('http://localhost:8787/nakmeong.html');await ev(()=>localStorage.clear());await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,{timeout:180000});await p.click('#go');await p.waitForTimeout(1500);
await ev(()=>{const S=NKV2.S;NKV2.D.FISH.slice(0,12).forEach((f,i)=>S.dex[f.k]={n:3,max:Math.round((f.min+(f.max-f.min)*(.5+i*.04))*10)/10,gr:[1,1,i%2,i%3?0:1,i==2?1:0,i==1?1:0]});S.caught=150;S.streak=63;S.gDay=new Date().toDateString();S.gN=4;NKV2.hud&&NKV2.hud();});
await ev(()=>{NKV2.dexTab('fish');NKV2.renderDex();NKV2.openM('dex');});await p.waitForTimeout(600);await sh('dex-tx');
await ev(()=>{NKV2.openFishRank(NKV2.D.FISH[3].k);});await p.waitForTimeout(500);await sh('fishrank-srv');
await ev(()=>document.querySelector('[data-frs=all]').click());await p.waitForTimeout(400);await sh('fishrank-all');
await ev(()=>{document.getElementById('frank').classList.remove('show');NKV2.closeM('dex');});
// goals close bug
await ev(()=>{NKV2.dexTab('goal');NKV2.renderDex();NKV2.openM('dex');});await p.waitForTimeout(300);
const thb=await p.$('#dex [data-theme]');if(thb){await thb.click();await p.waitForTimeout(500);}
await ev(()=>{const c=document.querySelector('#dex [data-close]');c&&c.click();});await p.waitForTimeout(400);
console.log('dex open after close:',await ev(()=>document.getElementById('dex').classList.contains('show')),'any modal:',await ev(()=>!!document.querySelector('.modal.show')));
// tank sort
await ev(()=>{const S=NKV2.S;for(let i=0;i<8;i++)NKV2.catchFish();document.querySelectorAll('.cutin,.ribbon').forEach(e=>e.remove());S.tankSort='vhi';NKV2.tankView.open('me');});await p.waitForTimeout(1500);await sh('tank-sort');
const vals=await ev(()=>[...document.querySelectorAll('#tankSide [data-sell]')].map(e=>e.textContent.replace(/\D/g,'')).slice(0,8));console.log('sort vals',vals);
await ev(()=>NKV2.tankView.close?NKV2.tankView.close():document.querySelector('#tank [data-close],#tankClose')?.click());await p.waitForTimeout(500);
await ev(()=>{document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));});await sh('streak');
// chat tabs
await ev(()=>document.querySelector('[data-chf=sys]').click());await p.waitForTimeout(200);await sh('chat-sys');
await ev(()=>document.querySelector('[data-chf=chat]').click());await p.waitForTimeout(200);await sh('chat-talk');
await ev(()=>document.querySelector('[data-chf=all]').click());
// enhance UI
await ev(()=>{NKV2.S.stones=30;NKV2.bag&&NKV2.bagTab&&NKV2.bagTab('enh');NKV2.openM('bag');});await p.waitForTimeout(500);await sh('enh');
await ev(()=>{document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));});
// auto with menu open
await ev(()=>{NKV2.S.xp=20000;NKV2.S.lvPaid=99;});console.log('lv for auto',await ev(()=>NKV2.myLv()));
await ev(()=>{const d=NKV2.decks[0];NKV2.setPos(d.tip.x,d.tip.z);});await p.waitForTimeout(600);
await p.click('#bAutoFish');await p.waitForTimeout(500);await ev(()=>NKV2.openM('dex'));
const c0=await ev(()=>NKV2.S.caught);let mt=false;for(let i=0;i<60&&!mt;i++){await p.waitForTimeout(1000);mt=await ev(()=>!!document.querySelector('#miniT .mt'));}
await sh('auto-menu');console.log('auto in menu caught',c0,'->',await ev(()=>NKV2.S.caught),'mini',mt);
await b.close();})();
