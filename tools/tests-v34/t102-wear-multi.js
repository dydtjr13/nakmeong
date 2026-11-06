const {chromium}=require('/home/box/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1280,height:800}});
 const pageErrs=[];p.on('pageerror',e=>pageErrs.push(String(e&&e.message||e)));
 await p.goto('http://localhost:8787/nakmeong.html?solo=1',{waitUntil:'domcontentloaded'});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_solo','1');localStorage.setItem('nk_tut25',JSON.stringify({i:99,chk:1}));});
 await p.reload({waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>document.getElementById('go')&&!document.getElementById('go').disabled,{timeout:180000});
 await p.evaluate(()=>document.getElementById('go').click());
 await p.waitForTimeout(1500);
 const r=await p.evaluate(async()=>{
  const S=NKV2.S,D=window.NK_DATA;
  const wearIt=D.WEAR.items.find(x=>x.lv===10)||D.WEAR.items[0];
  const list=[
    {tier:2,out:[{type:'wear',w:{id:99,k:wearIt.k,nw:1},it:wearIt}]},
    {tier:3,out:[{type:'charm',c:{id:1,tier:3,opts:[{k:'luck',v:1}],nw:1}}]},
    {tier:1,out:[{type:'stone',st:2,co:50}]},
    {tier:2,out:[{type:'bait',k:'shrimp',n:15},{type:'wear',w:{id:100,k:wearIt.k},it:wearIt,bonus:true}]},
  ];
  let err=null;try{NKV2._n.boxFx(list);}catch(e){err=String(e);}
  await new Promise(r=>setTimeout(r,100));
  const fx=document.getElementById('boxFx');
  const mid={err,cls:fx.className,hasWear:fx.innerHTML.includes(wearIt.n),hasOk:!!document.getElementById('fxOk'),len:fx.innerHTML.length};
  await new Promise(r=>setTimeout(r,2300));
  const after={cls:fx.className,open:fx.classList.contains('open')};
  document.getElementById('fxOk').click();
  await new Promise(r=>setTimeout(r,100));
  const closed={cls:document.getElementById('boxFx').className};
  // real multi open with forced wear via monkeypatch
  const orig=NKV2.SYS.openBox;
  let i=0;
  NKV2.SYS.openBox=function(D,S,rnd,src){
    i++;
    if(i===1){const it=wearIt;const w={id:S.nid++,k:it.k,slot:it.slot||'hat',lv:it.lv,eq:false,nw:1};S.wear=S.wear||[];S.wear.push(w);return {tier:2,out:[{type:'wear',w,it}]};}
    return orig(D,S,rnd,src);
  };
  for(let k=0;k<5;k++)S.boxes.push(Date.now());
  NKV2.openBag('box');
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  await new Promise(r=>setTimeout(r,200));
  document.getElementById('openBox10').click();
  await new Promise(r=>setTimeout(r,2500));
  const real={cls:document.getElementById('boxFx').className,ok:!!document.getElementById('fxOk'),wearIn:document.getElementById('boxFx').innerHTML.includes(wearIt.n)};
  document.getElementById('fxOk')?.click();
  await new Promise(r=>setTimeout(r,150));
  NKV2.SYS.openBox=orig;
  // reopen loop
  S.boxes.push(Date.now());
  NKV2.openBag('box');
  await new Promise(r=>setTimeout(r,200));
  document.getElementById('openBox').click();
  await new Promise(r=>setTimeout(r,2400));
  const reopen={cls:document.getElementById('boxFx').className,open:document.getElementById('boxFx').classList.contains('open')};
  document.getElementById('fxOk')?.click();
  return {mid,after,closed,real,reopen};
 });
 console.log(JSON.stringify({r,pageErrs},null,2));
 fs.writeFileSync('/workspace/nakmeong/shots/v34/t102.json',JSON.stringify({r,pageErrs},null,2));
 await p.screenshot({path:'/workspace/nakmeong/shots/v34/wear-multi.jpg',quality:80});
 await b.close();
 process.exit(pageErrs.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
