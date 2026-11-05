const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome'});const O='/workspace/nakmeong/mockups-v26/img/';const p=await b.newPage({viewport:{width:1400,height:900}});await p.goto('http://localhost:8787/mockups-v26/src/sheets.html');await p.waitForTimeout(800);
for(const id of await p.evaluate(()=>[...document.querySelectorAll('.frame,.dsheet')].map(e=>e.id))){await (await p.$('#'+id)).screenshot({path:O+id+'.jpg',quality:85});}
console.log('ok');await b.close();})();
