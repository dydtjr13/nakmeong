const {chromium}=require('/home/box/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1280,height:800}});
 const pageErrs=[];p.on('pageerror',e=>pageErrs.push(String(e&&e.message||e)));
 const ok=[];const bad=[];
 const check=(n,c)=>{if(c)ok.push(n);else bad.push(n);};
 await p.goto('http://localhost:8787/nakmeong.html?solo=1&v34=1',{waitUntil:'domcontentloaded'});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_solo','1');localStorage.setItem('nk_tut25',JSON.stringify({i:99,chk:1}));});
 await p.reload({waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>document.getElementById('go')&&!document.getElementById('go').disabled,{timeout:180000});
 await p.evaluate(()=>document.getElementById('go').click());
 await p.waitForTimeout(2000);
 check('boot',true);
 check('pageerror0',pageErrs.length===0);
 const r=await p.evaluate(async()=>{
  const S=NKV2.S,out={};
  // save solo
  const k=NKV2.SKEY();out.soloKey=k;S.coins+=123;NKV2.save();
  const raw=localStorage.getItem(k);out.saveOk=!!raw&&raw.includes('"coins"');
  // bag open
  NKV2.openBag('box');await new Promise(r=>setTimeout(r,100));
  out.bag=!!document.getElementById('bag')?.classList.contains('show')||!!document.querySelector('#bag .card');
  // shop
  try{NKV2.renderShop();NKV2.openM('shop');out.shop=!!document.getElementById('shop')?.querySelector('.card')||!!document.querySelector('#shop .card')||document.getElementById('shop')?.innerHTML.length>10;}catch(e){out.shopErr=String(e);}
  NKV2.closeM&&NKV2.closeM('shop');
  // box open loop x3
  for(let i=0;i<8;i++)S.boxes.push(Date.now());
  NKV2.openBag('box');
  await new Promise(r=>setTimeout(r,150));
  document.getElementById('openBox').click();
  await new Promise(r=>setTimeout(r,2400));
  out.open1=document.getElementById('boxFx').classList.contains('open');
  document.getElementById('fxOk')?.click();
  await new Promise(r=>setTimeout(r,100));
  out.close1=document.getElementById('boxFx').className==='';
  // multi with wear force
  const wearIt=NK_DATA.WEAR.items[5]||NK_DATA.WEAR.items[0];
  const orig=NKV2.SYS.openBox;let n=0;
  NKV2.SYS.openBox=function(D,S,rnd,src){n++;if(n<=2){const w={id:S.nid++,k:wearIt.k,slot:wearIt.slot||'hat',lv:wearIt.lv,eq:false,nw:1};(S.wear=S.wear||[]).push(w);return {tier:2,out:[{type:'wear',w,it:wearIt}]};}return orig(D,S,rnd,src);};
  NKV2.openBag('box');await new Promise(r=>setTimeout(r,100));
  document.getElementById('openBox10').click();
  await new Promise(r=>setTimeout(r,2500));
  out.multiOpen=document.getElementById('boxFx').classList.contains('open');
  out.multiWear=document.getElementById('boxFx').innerHTML.includes(wearIt.n);
  document.getElementById('fxOk')?.click();
  await new Promise(r=>setTimeout(r,100));
  out.multiClose=document.getElementById('boxFx').className==='';
  NKV2.SYS.openBox=orig;
  // reopen
  S.boxes.push(Date.now());NKV2.openBag('box');await new Promise(r=>setTimeout(r,100));
  document.getElementById('openBox').click();await new Promise(r=>setTimeout(r,2400));
  out.reopen=document.getElementById('boxFx').classList.contains('open');
  document.getElementById('fxOk')?.click();
  // tut reward path smoke: giveBox
  NKV2.giveBox(1);out.giveBox=S.boxes.length>=1;
  return out;
 });
 check('soloSave',r.saveOk);
 check('bag',r.bag);
 check('shop',r.shop!==false&&!r.shopErr);
 check('open1',r.open1);
 check('close1',r.close1);
 check('multiWearOpen',r.multiOpen&&r.multiWear);
 check('multiClose',r.multiClose);
 check('reopen',r.reopen);
 check('giveBox',r.giveBox);
 check('pageerror0_end',pageErrs.length===0);
 const summary={ok,bad,pageErrs,r};
 console.log(JSON.stringify(summary,null,2));
 fs.writeFileSync('/workspace/nakmeong/shots/v34/t110.json',JSON.stringify(summary,null,2));
 await b.close();
 process.exit(bad.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
