const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1280,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('response',r=>{if(r.status()==404)errs.push(r.url())});p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({lay:'a',bots:20}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.click('#go');await p.waitForTimeout(3000);await p.addStyleTag({content:'#dc{visibility:hidden}'});
const sh=async n=>{await p.screenshot({path:'/workspace/nakmeong/shots/v14-'+n+'.png'});};
await p.evaluate(()=>{const N=NKV2;window.__st=N.S;});
await sh('1-base');console.log(JSON.stringify(errs.filter(e=>e.startsWith('http'))));
// rank: force me rank1
await p.evaluate(()=>{const S=NKV2.S||{};S.wxOv='cherry';});await p.waitForTimeout(3000);await sh('2-cherry');
await p.evaluate(()=>{NKV2.S.wxOv='storm';});await p.waitForTimeout(2500);await sh('3-storm');
await p.evaluate(()=>{NKV2.S.wxOv='aurora';NKV2.S.mapTheme='xmas';NKV2.V14.applyMap('xmas');});await p.waitForTimeout(2500);await sh('4-xmas-aurora');
await p.evaluate(()=>{NKV2.V14.goalFx('봄 수집가','','판매가 +3%','goal');});await p.waitForTimeout(1800);await sh('5-goalD');
await p.evaluate(()=>{document.querySelectorAll('.gfx').forEach(e=>e.remove());NKV2.V14.admin();});await p.waitForTimeout(800);await sh('6-admin');
console.log(JSON.stringify(errs.slice(0,8)));await b.close();})();
