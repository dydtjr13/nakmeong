const pw=require('playwright-core');(async()=>{const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1600,height:520}});p.on('pageerror',e=>console.log('ERR',e.message));
for(const k of ['human','animal']){await p.goto('http://localhost:8787/mockups-v14/chars-src.html?k='+k);await p.waitForFunction(()=>document.title==='done',null,{timeout:60000});await p.screenshot({path:'/workspace/nakmeong/mockups-v14/chars-'+k+'.jpg',type:'jpeg',quality:88});}
await b.close();})();
