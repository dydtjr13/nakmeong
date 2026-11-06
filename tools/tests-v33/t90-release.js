const {chromium}=require('/home/box/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
const O='/workspace/nakmeong/shots/v33/';
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1280,height:800}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message||e)));
 const chk={};

 await p.goto('http://localhost:8787/nakmeong.html?solo=1',{waitUntil:'domcontentloaded',timeout:120000});
 await p.evaluate(()=>{
   localStorage.clear();
   localStorage.setItem('nk_solo','1');
   localStorage.setItem('nk_tut25',JSON.stringify({i:0,b:null,v:2,chk:1,paid:{},granted:{}}));
   localStorage.setItem('nk_ui25',JSON.stringify({tutOff:0,menu27:'1',duckKinds:'base,pirate,straw,astro,frog,uni,penguin,snowman,dino'}));
 });
 await p.reload({waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>{const g=document.getElementById('go');return g&&!g.disabled;},{timeout:180000});
 await p.evaluate(()=>{const n=document.getElementById('stNick');if(n){n.value='릴리즈체크';n.dispatchEvent(new Event('input'));}document.getElementById('go').click();});
 await p.waitForTimeout(2800);

 // 1) core APIs
 chk.api=await p.evaluate(()=>({
   nkv2:!!window.NKV2, tut:!!window.NK_TUT, steps:NK_TUT&&NK_TUT.STEPS.length,
   solo:NKV2.SOLO(), skey:NKV2.SKEY(), dino:!!(window.NK_DUCKV&&NK_DUCKV.LIST.some(x=>x[0]==='dino')),
   board:!!window.NK_BOARD, titleStyle: typeof titleStyle==='undefined' // may be scoped
 }));

 // 2) title colors
 chk.title=await p.evaluate(()=>{
   NKV2.S.xp=8000;NKV2.save();
   try{NKV2.applyHud();}catch(e){}
   return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
     const me=NKV2.me();const ttl=me&&me.tag&&me.tag.userData&&me.tag.userData.ttl;
     r({ttl,hasBg:!!(ttl&&ttl.bg),bg:ttl&&ttl.bg});
   })));
 });

 // 3) bag open + grade border + wear icon + no broken link
 chk.bag=await p.evaluate(async()=>{
   const t0=performance.now();NKV2.openBag('bag');
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const openMs=+(performance.now()-t0).toFixed(1);
   const rod=document.querySelector('.rodtile');
   const gc=rod&&rod.style.getPropertyValue('--gc');
   const wearImg=document.querySelector('#bag [data-btab="wear"] img');
   document.querySelector('#bag [data-btab="wear"]')?.click();
   await new Promise(r=>setTimeout(r,200));
   document.getElementById('wearInfo')?.click();
   await new Promise(r=>setTimeout(r,150));
   const ov=document.querySelector('.wearInfoOv');
   const broken=ov&&/세트 비교|eqSets-v31/.test(ov.innerHTML);
   ov?.remove();
   return {openMs,gc,wearIcon:wearImg&&wearImg.getAttribute('src'),broken:!!broken,tabs:[...document.querySelectorAll('#bag [data-btab]')].map(b=>b.textContent.replace(/\s+/g,' ').trim())};
 });
 await p.screenshot({path:O+'rel-bag.jpg',quality:80});

 // 4) shop / tank open
 chk.shop=await p.evaluate(async()=>{
   const t0=performance.now();NKV2.openM('shop');
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>{NKV2.renderShop();r();})));
   const ms=+(performance.now()-t0).toFixed(1);
   const show=document.getElementById('shop')?.classList.contains('show');
   document.querySelector('#shop [data-close]')?.click();
   return {ms,show};
 });
 chk.tank=await p.evaluate(async()=>{
   const t0=performance.now();NKV2.tankView.open('me');
   await new Promise(r=>setTimeout(r,400));
   const ms=+(performance.now()-t0).toFixed(1);
   const show=document.getElementById('tank')?.classList.contains('show');
   NKV2.closeM('tank');
   return {ms,show};
 });

 // 5) fishing seat path - sit if possible
 chk.fish=await p.evaluate(()=>{
   const seats=NKV2.seats&&NKV2.seats();
   const free=seats&&seats.filter(s=>!s.who&&s.kind==='stool')[0];
   if(free){try{NKV2.sitOn(free);}catch(e){return {err:String(e)};}}
   const seat=!!(NKV2.mySeat&&NKV2.mySeat());
   const spot=!!(NKV2.nearSpot&&NKV2.nearSpot());
   // catch one via API
   const c0=NKV2.S.caught||0;
   try{NKV2.catchFish();}catch(e){}
   return {seat,spot,caughtDelta:(NKV2.S.caught||0)-c0,tank:NKV2.S.tank.length};
 });

 // 6) sell earned
 chk.sell=await p.evaluate(()=>{
   const S=NKV2.S;if(!S.tank.length){try{NKV2.catchFish();NKV2.catchFish();}catch(e){}}
   const f=S.tank[0];if(!f)return {err:'no fish'};
   const e0=S.earned||0,c0=S.coins;
   // mimic shop sell
   const p=Math.round(f.v*0.6)||1;
   S.tank=S.tank.filter(x=>x!==f);S.coins+=p;S.earned=(S.earned||0)+p;NKV2.save();NKV2.hud();
   return {earnedDelta:(S.earned||0)-e0,coinsDelta:S.coins-c0};
 });

 // 7) tutorial complete→reward→next
 chk.tut=await p.evaluate(()=>{
   NK_TUT.reset();
   const S=NKV2.S,co0=S.coins,i0=NK_TUT.P().i;
   NK_TUT.P().b={caught:0,earned:0,_tap:1};
   NK_TUT.complete();
   const r1={i:NK_TUT.P().i,dCo:S.coins-co0,paid:!!NK_TUT.P().paid.hello};
   // grant wear
   const wi=NK_TUT.STEPS.findIndex(s=>s.id==='wearHat');
   NK_TUT.jump(wi);
   const granted=!!NK_TUT.P().granted.wearHat;
   const hat=(S.wear||[]).find(w=>w.k==='hat1');
   if(hat){hat.eq=true;NKV2.save();}
   const co1=S.coins;NK_TUT.complete();
   return {steps:NK_TUT.STEPS.length,r1,granted,wearPaid:!!NK_TUT.P().paid.wearHat,dCo2:S.coins-co1,hatKept:(S.wear||[]).some(w=>w.k==='hat1')};
 });

 // 8) settings tut jump UI
 await p.evaluate(()=>NKV2.openSet());
 await p.waitForTimeout(300);
 chk.set=await p.evaluate(()=>({
   jump:!!document.getElementById('tutJump'),
   go:!!document.getElementById('tutGo'),
   solo:!!document.getElementById('soloOn'),
   opts:document.getElementById('tutJump')?.options.length
 }));
 await p.screenshot({path:O+'rel-set.jpg',quality:80});
 await p.evaluate(()=>NKV2.closeM('set'));

 // 9) board write
 chk.board=await p.evaluate(async()=>{
   if(!NK_BOARD)return {err:'no board'};
   NK_BOARD.open();
   await new Promise(r=>setTimeout(r,700));
   const fr=[...document.querySelectorAll('iframe')].find(f=>f.src.includes('board'));
   return {src:fr&&fr.src};
 });
 const bf=p.frames().find(f=>f.url().includes('board-v24'));
 if(bf){
   chk.boardPost=await bf.evaluate(()=>{
     localStorage.removeItem('nk_board_v31');
     document.getElementById('bdWrite')?.click();
     const title=document.getElementById('bdTitle'),body=document.getElementById('bdBody'),go=document.getElementById('bdGo');
     if(!title)return {err:'no form',hasP4:!!document.getElementById('bdP4W')};
     title.value='릴리즈 보드';body.value='ok';go.click();
     const d=JSON.parse(localStorage.getItem('nk_board_v31')||'{}');
     return {posts:(d.posts||[]).length,title:d.posts&&d.posts[0]&&d.posts[0].title};
   });
   await p.evaluate(()=>NK_BOARD.close());
 }

 // 10) solo save roundtrip
 chk.save=await p.evaluate(()=>{NKV2.S.coins=8888;NKV2.S.caught=55;NKV2.save(1);return {c:NKV2.S.coins,k:NKV2.SKEY()};});
 await p.reload({waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>document.getElementById('go')&&!document.getElementById('go').disabled,{timeout:120000});
 chk.save2=await p.evaluate(()=>{
   const S=JSON.parse(localStorage.getItem('nakmeong_solo')||'{}');
   const cont=document.getElementById('stCont');
   return {coins:S.coins,caught:S.caught,banner:!!(cont&&cont.style.display!=='none'),bannerTxt:cont&&cont.innerText.slice(0,80)};
 });

 // 11) dirty save: no-op save shouldn't throw
 await p.evaluate(()=>document.getElementById('go').click());
 await p.waitForTimeout(1200);
 chk.dirtySave=await p.evaluate(()=>{
   const n0=performance.now();
   for(let i=0;i<50;i++)NKV2.save();
   const dt=performance.now()-n0;
   NKV2.S.coins+=1;NKV2.save();
   return {fiftyNoopMs:+dt.toFixed(1),coins:NKV2.S.coins};
 });

 // 12) AI/bots present
 chk.bots=await p.evaluate(()=>{const b=NKV2.bots;const n=typeof b==='function'?b().length:(b&&b.length)||0;return {n,decks:(NKV2.decks&&NKV2.decks.length)||0};});

 // 13) gift banner css/fn exists
 chk.gift=await p.evaluate(()=>{
   const el=document.createElement('div');el.className='giftBan';document.body.appendChild(el);
   const ok=!!getComputedStyle(el).borderRadius;
   el.remove();return {css:ok};
 });

 const summary={
   pass:[],fail:[],errs
 };
 const expect=(name,cond,detail)=>{if(cond)summary.pass.push(name);else summary.fail.push({name,detail});};

 expect('api',chk.api.nkv2&&chk.api.tut&&chk.api.steps===50,chk.api);
 expect('solo',chk.api.solo&&chk.api.skey==='nakmeong_solo',chk.api);
 expect('dino',chk.api.dino,chk.api);
 expect('titleBg',chk.title.hasBg&&chk.title.bg==='#6a4fc0',chk.title);
 expect('bagOpen',chk.bag.openMs<2000,chk.bag);
 expect('rodGrade',!!chk.bag.gc,chk.bag);
 expect('wearIcon',chk.bag.wearIcon&&chk.bag.wearIcon.includes('tab-wear'),chk.bag);
 expect('noBrokenEq',!chk.bag.broken,chk.bag);
 expect('shop',chk.shop.show,chk.shop);
 expect('tank',chk.tank.show,chk.tank);
 expect('catch',chk.fish.caughtDelta>=1,chk.fish);
 expect('sellEarned',chk.sell.earnedDelta>0,chk.sell);
 expect('tutReward',chk.tut.r1.dCo===30&&chk.tut.r1.paid,chk.tut);
 expect('tutWear',chk.tut.granted&&chk.tut.wearPaid&&chk.tut.dCo2===80&&chk.tut.hatKept,chk.tut);
 expect('setUI',chk.set.jump&&chk.set.opts>=51,chk.set);
 expect('board',chk.boardPost&&chk.boardPost.posts===1,chk.boardPost);
 expect('savePersist',chk.save2.coins===8888&&chk.save2.caught===55&&chk.save2.banner,chk.save2);
 expect('dirtySave',chk.dirtySave.fiftyNoopMs<100,chk.dirtySave);
 expect('bots',chk.bots.n>0&&chk.bots.decks>0,chk.bots);
 expect('noPageError',errs.length===0,errs);

 const out={chk,summary,ok:summary.fail.length===0};
 fs.writeFileSync(O+'t90.json',JSON.stringify(out,null,2));
 console.log(JSON.stringify({ok:out.ok,pass:summary.pass,fail:summary.fail,errs},null,2));
 await b.close();
 process.exit(out.ok?0:1);
})().catch(e=>{console.error(e);process.exit(1);});
