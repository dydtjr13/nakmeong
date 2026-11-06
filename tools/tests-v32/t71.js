const {chromium}=require('/home/box/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1280,height:800}});
 await p.goto('http://localhost:8787/nakmeong.html',{waitUntil:'domcontentloaded'});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_tut25',JSON.stringify({i:99,chk:1}));});
 await p.reload({waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>{const g=document.getElementById('go');return g&&!g.disabled;},{timeout:120000});
 await p.evaluate(()=>{const n=document.getElementById('stNick');if(n){n.value='색테스트';n.dispatchEvent(new Event('input'));}document.getElementById('go').click();});
 await p.waitForTimeout(2500);
 const r=await p.evaluate(()=>new Promise(res=>{
   const S=NKV2.S;S.xp=8000;NKV2.save();
   NKV2.openBag('bag');
   requestAnimationFrame(()=>requestAnimationFrame(()=>{
     const card=document.querySelector('#bag .card'),sum=document.querySelector('.sum28');
     const cr=card.getBoundingClientRect(),sr=sum.getBoundingClientRect();
     const me=NKV2.me();
     let pix=null;
     if(me&&me.tag&&me.tag.userData&&me.tag.userData.cv){
       const cv=me.tag.userData.cv,x=cv.getContext('2d');
       const row=x.getImageData(140,50,40,20).data;
       let purples=0;
       for(let i=0;i<row.length;i+=4){const r=row[i],g=row[i+1],b=row[i+2];if(r>80&&r<140&&g>50&&g<120&&b>150)purples++;}
       pix={purples,ttl:me.tag.userData.ttl};
     }
     res({overflow:Math.round(sr.bottom-cr.bottom),sumH:Math.round(sr.height),cardH:Math.round(cr.height),pix});
   }));
 }));
 const r2=await p.evaluate(()=>{
   const S=NKV2.S;S.xp=50000;S.titleSel='';
   const titles=(typeof LV!=='undefined'&&LV.titles)||[];
   if(titles[2])S.titleSel='lv:'+titles[2][1];
   NKV2.save();
   try{NKV2.applyHud();}catch(e){}
   return {titles:titles.slice(0,5),sel:S.titleSel};
 });
 // wait a few frames for tag redraw
 await p.waitForTimeout(500);
 const r3=await p.evaluate(()=>{
   const me=NKV2.me();
   if(!me||!me.tag||!me.tag.userData)return null;
   return {ttl:me.tag.userData.ttl,visible:me.tag.visible};
 });
 console.log(JSON.stringify({r,r2,r3},null,2));
 await p.screenshot({path:'/workspace/nakmeong/shots/v32/bag-sum2.jpg',quality:82});
 await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
