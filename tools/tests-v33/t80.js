const {chromium}=require('/home/box/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1280,height:800}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message||e)));
 await p.goto('http://localhost:8787/nakmeong.html?solo=1',{waitUntil:'domcontentloaded',timeout:120000});
 await p.evaluate(()=>{
   localStorage.clear();
   localStorage.setItem('nk_solo','1');
   localStorage.setItem('nk_tut25',JSON.stringify({i:0,b:null,v:2,chk:1,paid:{},granted:{},boxGot:0}));
   localStorage.setItem('nk_tut25',JSON.stringify({i:0,b:null,v:2,chk:1,paid:{},granted:{}}));
   localStorage.setItem('nk_ui25',JSON.stringify({tutOff:0}));
 });
 await p.reload({waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>{const g=document.getElementById('go');return g&&!g.disabled;},{timeout:180000});
 await p.evaluate(()=>{const n=document.getElementById('stNick');if(n){n.value='솔로테스터';n.dispatchEvent(new Event('input'));}document.getElementById('go').click();});
 await p.waitForTimeout(2500);

 // ---- Tutorial reward flow unit-ish via NK_TUT ----
 const tut=await p.evaluate(()=>{
  const T=window.NK_TUT;if(!T)return {err:'no TUT'};
  T.reset();
  const S=NKV2.S;const co0=S.coins;
  // force complete step 0 (hello) by marking tap
  const P=T.P();P.b=P.b||{caught:0,earned:0,_tap:0};P.b._tap=1;
  // run complete manually
  const beforeI=P.i, beforeCo=S.coins, beforePaid=Object.assign({},P.paid);
  T.complete();
  const after=T.P();
  const r1={i:after.i, coDelta:S.coins-beforeCo, paid:after.paid, last:window.__tutLastReward, steps:T.STEPS.length};

  // wear grant flow: jump to wearHat
  const wi=T.STEPS.findIndex(s=>s.id==='wearHat');
  T.jump(wi);
  const grantPaid=!!T.P().granted.wearHat;
  const hasHat=(S.wear||[]).some(w=>w.k==='hat1');
  // equip hat
  const hat=(S.wear||[]).find(w=>w.k==='hat1');
  if(hat){S.wear.forEach(w=>{if(w.slot==='hat')w.eq=false;});hat.eq=true;NKV2.save();}
  const co1=S.coins;
  // tick-like complete
  T.complete();
  const r2={i:T.P().i, granted:grantPaid, hasHat, coDelta:S.coins-co1, paidWear:!!T.P().paid.wearHat, wearStill:(S.wear||[]).some(w=>w.k==='hat1')};

  // sell earned path
  const si=T.STEPS.findIndex(s=>s.id==='sell');
  T.jump(si);
  const e0=S.earned||0;S.earned=e0+10;S.coins+=10;NKV2.save();
  const co2=S.coins;T.complete();
  const r3={i:T.P().i, paidSell:!!T.P().paid.sell, coDelta:S.coins-co2};

  return {r1,r2,r3,nSteps:T.STEPS.length,solo:NKV2.SOLO(),skey:NKV2.SKEY()};
 });

 // ---- Solo save roundtrip ----
 const save1=await p.evaluate(()=>{
  const S=NKV2.S;S.coins=7777;S.caught=42;S.nick='솔로테스터';S.xp=1234;NKV2.save();
  return {key:NKV2.SKEY(), coins:S.coins, caught:S.caught, raw:localStorage.getItem(NKV2.SKEY())?JSON.parse(localStorage.getItem(NKV2.SKEY())).coins:null};
 });
 await p.reload({waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>{const g=document.getElementById('go');return g&&!g.disabled;},{timeout:180000});
 const save2=await p.evaluate(()=>{
  const cont=document.getElementById('stCont');
  const S=JSON.parse(localStorage.getItem('nakmeong_solo')||'{}');
  return {contShow:cont&&cont.style.display!=='none', contText:cont&&cont.innerText, coins:S.coins, caught:S.caught, nick:S.nick, solo:localStorage.getItem('nk_solo'), skeyPresent:!!localStorage.getItem('nakmeong_solo')};
 });
 await p.evaluate(()=>document.getElementById('go').click());
 await p.waitForTimeout(1500);
 const save3=await p.evaluate(()=>({coins:NKV2.S.coins,caught:NKV2.S.caught,nick:NKV2.S.nick,skey:NKV2.SKEY()}));

 // settings UI has tutJump
 await p.evaluate(()=>{NKV2.openSet();});
 await p.waitForTimeout(400);
 const setui=await p.evaluate(()=>({
  jump:!!document.getElementById('tutJump'),
  go:!!document.getElementById('tutGo'),
  solo:!!document.getElementById('soloOn'),
  opts:document.getElementById('tutJump')?document.getElementById('tutJump').options.length:0
 }));
 await p.screenshot({path:'/workspace/nakmeong/shots/v33/set-tut.jpg',quality:82});

 const out={tut,save1,save2,save3,setui,errs};
 fs.writeFileSync('/workspace/nakmeong/shots/v33/t80.json',JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,2));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
