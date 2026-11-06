const {chromium}=require('/home/box/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:1100,height:720}});
 const pageErrs=[];p.on('pageerror',e=>pageErrs.push(String(e&&e.message||e)));
 const ok=[],bad=[]; const check=(n,c)=>{(c?ok:bad).push(n);};
 // API direct
 const health=await (await p.request.get('https://fishcozy-board-api.mi1ku.workers.dev/health')).json();
 check('api_health', health && health.ok);
 const post=await (await p.request.post('https://fishcozy-board-api.mi1ku.workers.dev/posts',{data:{cat:'💬 자유',title:'t130',body:'회귀',nick:'QA'}})).json();
 check('api_post', post && post.ok && post.post && post.post.id);
 const cm=await (await p.request.post('https://fishcozy-board-api.mi1ku.workers.dev/posts/'+post.post.id+'/comments',{data:{body:'댓글ok',nick:'QA'}})).json();
 check('api_comment', cm && cm.ok);
 // page load brand
 await p.goto('http://localhost:8787/nakmeong.html?solo=1&v36=1',{waitUntil:'domcontentloaded'});
 await p.waitForTimeout(1200);
 const title=await p.title();
 check('title_fishcozy', /피쉬코지|FISH COZY/.test(title));
 check('cname', fs.readFileSync('/workspace/nakmeong/CNAME','utf8').trim()==='fishcozy.com');
 check('favicon', await p.evaluate(()=>!!document.querySelector('link[rel~="icon"]')));
 // open board iframe
 await p.evaluate(()=>{window.NK_BOARD&&NK_BOARD.open();});
 await p.waitForTimeout(1500);
 const fr=p.frames().find(f=>f.url().includes('board-v24'));
 check('board_iframe', !!fr);
 if(fr){
  const tip=await fr.evaluate(async()=>{
   await new Promise(r=>setTimeout(r,800));
   return document.querySelector('#bdMock .tip')?.textContent||'';
  });
  check('board_server_tip', /서버|fishcozy-board-api|로컬/.test(tip));
 }
 check('pageerror0', pageErrs.length===0);
 const summary={ok,bad,pageErrs,title,health};
 console.log(JSON.stringify(summary,null,2));
 fs.writeFileSync('/workspace/nakmeong/shots/v36/t130.json',JSON.stringify(summary,null,2));
 await b.close();
 process.exit(bad.length?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
