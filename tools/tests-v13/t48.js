const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({lay:'a',bots:12}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.click('#go');await p.waitForTimeout(3000);await p.addStyleTag({content:'#dc{visibility:hidden}'});
const sh=n=>p.screenshot({path:'/workspace/nakmeong/shots/v15-'+n+'.png'});
console.log('decks',await p.evaluate(()=>document.querySelectorAll?NKV2.V14&&0:0));
// bubbles: rank me + say for me & nearest bot
await p.evaluate(()=>{const R=NKV2.RK3();for(const k in R)delete R[k];R.__me=1;window.__nb=NKV2.chars.filter(c=>c!==NKV2.me()&&!c.offline).sort((a,b)=>a.o.position.distanceTo(NKV2.me().o.position)-b.o.position.distanceTo(NKV2.me().o.position))[0];});
await p.keyboard.press('Enter');await p.fill('#msg','안녕하세요 시1발 ㅋㅋ');await p.keyboard.press('Enter');await p.waitForTimeout(600);await sh('1-bubble');
// right click nearest bot
const pos=await p.evaluate(()=>NKV2.project([__nb.o.position.x,__nb.o.position.y+__nb.c?0:__nb.o.position.y+1.2,__nb.o.position.z]));
const pp=await p.evaluate(()=>{const c=__nb;return NKV2.project([c.o.position.x,c.o.position.y+c.h*.6,c.o.position.z]);});
await p.mouse.click(pp[0],pp[1],{button:'right'});await p.waitForTimeout(300);const cm=await p.evaluate(()=>{const m=document.getElementById('ctxM');return m&&m.style.display;});
await sh('2-ctx');if(cm==='block')await p.click('#ctxM [data-cm]');await p.waitForTimeout(300);
await p.click('#bSet');await p.waitForTimeout(500);await p.evaluate(()=>{const c=document.querySelector('#set .card');const h=[...c.querySelectorAll('h4')].find(x=>x.textContent.includes('차단'));if(h)c.scrollTop=h.offsetTop-40;});await sh('3-set-block');await p.evaluate(()=>NKV2.closeM('set'));
await p.evaluate(()=>{NKV2.renderDex();NKV2.openM('dex');});await p.waitForTimeout(400);await p.click('.dcard.unk');await p.waitForTimeout(500);await sh('4-dex-unk');
await p.evaluate(()=>{document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));NKV2.V14.admin();});await p.click('[data-at=prof]');await p.fill('#pTest','씨이이발 f.u.c.k 시발점');await p.click('#pTestB');await p.waitForTimeout(400);await sh('5-admin-prof');
await p.click('[data-at=deck]');await p.waitForTimeout(300);await sh('6-admin-deck');
console.log('ctx',cm,'blocked',await p.evaluate(()=>NKV2.V15.list()),JSON.stringify(errs.slice(0,5)));await b.close();})();
