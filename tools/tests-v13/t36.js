const pw=require('playwright-core');(async()=>{const W=+(process.argv[2]||1280),H=+(process.argv[3]||720),MOB=W<700,tag=MOB?'m':'d';
const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:W,height:H},...(MOB?{isMobile:true,hasTouch:true}:{})});const ev=(f,a)=>p.evaluate(f,a);p.on('pageerror',e=>console.log('ERR',e.message));
const sh=n=>p.screenshot({path:`/workspace/nakmeong/shots/v13-${tag}-${n}.png`});
await p.goto('http://localhost:8787/nakmeong.html');await ev(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({lay:'a',bots:+(new URLSearchParams(location.search).get('b')||9)}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,{timeout:180000});await p.click('#go');await p.waitForTimeout(1500);
console.log('decks',await ev(()=>NKV2.decks.length),'bots',await ev(()=>NKV2.bots.length),'vol',await ev(()=>[NKV2.S.vol,NKV2.S.sNight]));
await ev(()=>{const d=NKV2.decks[0];NKV2.setPos(d.tip.x,d.tip.z);});await p.waitForTimeout(800);
// box get
await ev(()=>{NKV2.S.boxes.push(Date.now());NKV2.boxGot('luck');});await p.waitForTimeout(700);await sh('boxget');
await ev(()=>{NKV2.S.gN=3;NKV2.boxGot('gift');});await p.waitForTimeout(700);await sh('boxget-gift');await p.waitForTimeout(2600);
// rank tags
await ev(()=>{const S=NKV2.S;S.wk.best={};NKV2.D.FISH.forEach(f=>S.wk.best[f.k]={cm:f.max*.97,g:4});NKV2.calcRK3();const P=NKV2.me().o.position;const L=Math.hypot(P.x,P.z),ux=P.x/L,uz=P.z/L;NKV2.bots.slice(0,3).forEach((bt,i)=>{bt.wait=99;bt.c.o.position.set(P.x+ux*(1+i),P.y,P.z+uz*(1+i)+(i-1)*.0);});const cx=P.x+ux*1.5,cz=P.z+uz*1.5;NKV2.setCam(cx-uz*7+ux*1.5,P.y+3.6,cz+ux*7+uz*1.5,cx,P.y+.9,cz);});
await p.waitForTimeout(1500);await sh('ranktag');console.log('RK3',await ev(()=>JSON.stringify(NKV2.RK3())));await ev(()=>NKV2.setCam());
// auto fishing click ignore
await p.click('#bAutoFish');await p.waitForTimeout(1500);const st0=await ev(()=>NKV2.fishing().state);await p.mouse.click(W/2,H/2);await p.keyboard.press('Space');await p.waitForTimeout(400);console.log('auto click state',st0,'->',await ev(()=>NKV2.fishing().state));await sh('auto-click');await p.click('#bAutoFish');
// card B
await ev(()=>{NKV2.S.cardStyle='b';NKV2.S.autoFish=false;});await p.waitForTimeout(300);await ev(()=>{NKV2.catchFish();});await p.waitForTimeout(500);await sh('cardB');await p.waitForTimeout(3000);
// settings scroll
await ev(()=>NKV2.openSet());await p.waitForTimeout(400);await ev(()=>{const c=document.querySelector('#set .card');c.scrollTop=c.scrollHeight;});await p.waitForTimeout(200);const s0=await ev(()=>document.querySelector('#set .card').scrollTop);
await ev(()=>document.getElementById('dbCoin').click());await p.waitForTimeout(300);const s1=await ev(()=>document.querySelector('#set .card').scrollTop);console.log('set scroll',s0,'->',s1);await sh('settings');
await ev(()=>{const c=document.querySelector('#set .card');const h=[...c.querySelectorAll('h4')].find(x=>x.textContent.includes('테스트 설정'));c.scrollTop=h.offsetTop-20;});await p.waitForTimeout(200);await sh('settings-test');
await ev(()=>NKV2.closeM('set'));
// shop scroll
await ev(()=>{NKV2.renderShop();NKV2.openM('shop');});await p.waitForTimeout(400);const shopInfo=await ev(()=>{const c=document.querySelector('#shop .card');c.scrollTop=c.scrollHeight;const t=c.scrollTop;const btn=[...c.querySelectorAll('button')].reverse().find(b=>!b.disabled&&!b.dataset.close);if(btn)btn.click();return [t,document.querySelector('#shop .card').scrollTop,btn&&btn.textContent.slice(0,20)];});console.log('shop scroll',shopInfo);await ev(()=>NKV2.closeM('shop'));
// tank: combo collapsed then lock/sell
await ev(()=>{const S=NKV2.S;for(let i=0;i<4;i++)NKV2.catchFish();document.querySelectorAll('.cutin,.ribbon,.boxget').forEach(e=>e.remove());S.tankK='royal';S.tanks.push('royal');NKV2.tankView.open('me');});await p.waitForTimeout(1200);
const tk=await ev(()=>{const side=document.getElementById('tankSide');const dc=side.querySelector('details.combo');dc.open=false;dc.dispatchEvent(new Event('toggle'));side.scrollTop=side.scrollHeight;const t0=side.scrollTop;const lb=side.querySelector('[data-lock],[data-cswap]');if(lb)lb.click();else NKV2.tankView.refresh();const dc2=side.querySelector('details.combo');return [t0,side.scrollTop,dc2.open];});console.log('tank lock: scroll',tk);await p.waitForTimeout(800);await sh('tank-royal');
await ev(()=>{NKV2.S.tankK='s';NKV2.tankView.build();NKV2.tankView.refresh();});await p.waitForTimeout(900);await sh('tank-s');
await b.close();})();
