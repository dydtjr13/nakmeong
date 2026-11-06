const {chromium}=require('/home/box/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1100,height:720}});
 const pageErrs=[];p.on('pageerror',e=>pageErrs.push(String(e&&e.message||e)));
 await p.goto('http://localhost:8787/nakmeong.html?solo=1&v35=1',{waitUntil:'domcontentloaded'});
 await p.waitForTimeout(1500);
 const r=await p.evaluate(()=>{
  const links=[...document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"]')].map(l=>({rel:l.rel,href:l.getAttribute('href')}));
  return {
   title:document.title,
   apple:document.querySelector('meta[name="apple-mobile-web-app-title"]')?.content,
   logo:document.querySelector('.logo')?.textContent.trim(),
   h1:document.querySelector('#start h1')?.innerText.replace(/\s+/g,' ').trim(),
   tag:document.querySelector('.brandTag')?.textContent,
   links,
   hasMark:!!document.querySelector('.brandMark'),
  };
 });
 const ok=[];const bad=[];
 const check=(n,c)=>{ (c?ok:bad).push(n); };
 check('title_fishcozy', /피쉬코지|FISH COZY/.test(r.title));
 check('apple_title', r.apple==='피쉬코지');
 check('favicon_link', r.links.some(l=>/favicon/.test(l.href||'')));
 check('apple_touch', r.links.some(l=>l.rel.includes('apple-touch')));
 check('logo', /피쉬코지/.test(r.logo||''));
 check('start_h1', /피쉬코지|FISH COZY/.test(r.h1||''));
 check('brand_tag', /FISH COZY/.test(r.tag||''));
 check('brand_mark', r.hasMark);
 check('pageerror0', pageErrs.length===0);
 // icon fetch
 for(const href of ['icons/favicon-32.png','icons/favicon.ico','icons/app-180.png','favicon.ico']){
  const res=await p.goto('http://localhost:8787/'+href);
  check('asset_'+href, res && res.ok());
 }
 await p.goto('http://localhost:8787/nakmeong.html?solo=1&v35=1',{waitUntil:'domcontentloaded'});
 await p.screenshot({path:'/workspace/nakmeong/shots/v35/start-brand.jpg',quality:80});
 const summary={ok,bad,pageErrs,r};
 console.log(JSON.stringify(summary,null,2));
 fs.writeFileSync('/workspace/nakmeong/shots/v35/t120.json',JSON.stringify(summary,null,2));
 await b.close();
 process.exit(bad.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
