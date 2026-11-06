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
 await p.waitForTimeout(2000);
 const r=await p.evaluate(async()=>{
  const S=NKV2.S;for(let i=0;i<5;i++)S.boxes.push(Date.now());NKV2.save();
  NKV2.openBag('box');
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  await new Promise(r=>setTimeout(r,300));
  const btn=document.getElementById('openBox');
  const before={boxes:S.boxes.length,btn:!!btn,disabled:btn&&btn.disabled};
  btn&&btn.click();
  await new Promise(r=>setTimeout(r,400));
  const fx=document.getElementById('boxFx');
  const mid={cls:fx&&fx.className,htmlLen:fx&&fx.innerHTML.length,boxes:S.boxes.length,inner:fx&&fx.innerHTML.slice(0,180)};
  await new Promise(r=>setTimeout(r,2500));
  const after={cls:fx&&fx.className,hasOpen:fx&&fx.classList.contains('open'),hasShow:fx&&fx.classList.contains('show'),fxOk:!!document.getElementById('fxOk'),boxes:S.boxes.length};
  const ok=document.getElementById('fxOk');if(ok)ok.click();
  await new Promise(r=>setTimeout(r,200));
  const closed={cls:document.getElementById('boxFx').className};
  if(!S.boxes.length)S.boxes.push(Date.now());
  NKV2.openBag('box');
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  await new Promise(r=>setTimeout(r,200));
  document.getElementById('openBox')?.click();
  await new Promise(r=>setTimeout(r,2400));
  const reopen={cls:document.getElementById('boxFx').className,open:document.getElementById('boxFx').classList.contains('open')};
  document.getElementById('fxOk')?.click();
  const fail=[];
  for(let i=0;i<40;i++){
   try{
    const src=i%7===0?'streak':(i%5===0?('lv'+(i%6)):null);
    NKV2.SYS.openBox(window.NK_DATA,S,Math.random,src);
   }catch(e){fail.push(String(e));}
  }
  let boxFxErr=null;
  try{const one=NKV2.SYS.openBox(window.NK_DATA,S,Math.random,null);NKV2._n.boxFx([one]);}catch(e){boxFxErr=String(e);}
  await new Promise(r=>setTimeout(r,100));
  return {before,mid,after,closed,reopen,fail,boxFxErr};
 });
 console.log(JSON.stringify({r,pageErrs},null,2));
 fs.writeFileSync('/workspace/nakmeong/shots/v34/t100.json',JSON.stringify({r,pageErrs},null,2));
 await p.screenshot({path:'/workspace/nakmeong/shots/v34/box.jpg',quality:80});
 await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
