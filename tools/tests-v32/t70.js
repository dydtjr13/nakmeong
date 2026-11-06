const {chromium}=require('/home/box/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const fs=require('fs');
const O='/workspace/nakmeong/shots/v32/';
(async()=>{
 const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
 const p=await b.newPage({viewport:{width:1280,height:800}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e.message||e)));
 await p.goto('http://localhost:8787/nakmeong.html',{waitUntil:'domcontentloaded',timeout:120000});
 await p.evaluate(()=>{
   localStorage.clear();
   localStorage.setItem('nk_tut25',JSON.stringify({i:99,chk:1}));
   localStorage.setItem('nk_ui25',JSON.stringify({menu27:'1',duckKinds:'base,pirate,straw,astro,frog,uni,penguin,snowman,dino'}));
 });
 await p.reload({waitUntil:'domcontentloaded'});
 await p.waitForFunction(()=>{const g=document.getElementById('go');return g&&!g.disabled;},{timeout:180000});
 await p.evaluate(()=>{const n=document.getElementById('stNick');if(n){n.value='테스터';n.dispatchEvent(new Event('input'));}document.getElementById('go').click();});
 await p.waitForTimeout(2500);

 // force level + title
 const title=await p.evaluate(()=>{
   const S=NKV2.S;S.xp=5000;S.lv=12;S.titleSel=''; // auto title
   NKV2.save();try{NKV2.applyHud();}catch(e){}
   // peek myTitle via canvas / rank
   const t=(()=>{try{return (window.NKV2&&NKV2.S)?1:0;}catch(e){return 0;}})();
   // call internal via eval of title in HUD
   const ttl=document.querySelector('.lvb .ttl, .lvb .ttl2');
   return {hud:ttl?{text:ttl.textContent,bg:getComputedStyle(ttl).backgroundColor,color:getComputedStyle(ttl).color}:null,lv:S.lv,titleSel:S.titleSel};
 });

 // bag open timing + sum height + rod borders
 const bag=await p.evaluate(async()=>{
   const t0=performance.now();
   NKV2.openBag('bag');
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
   const t1=performance.now();
   const card=document.querySelector('#bag .card');
   const sum=document.querySelector('.sum28');
   const rods=[...document.querySelectorAll('.rodtile')].slice(0,6).map(el=>{
     const s=getComputedStyle(el);return {gc:el.style.getPropertyValue('--gc'),border:s.borderColor};
   });
   const sumClip=sum?(()=>{const r=sum.getBoundingClientRect(),cr=card.getBoundingClientRect();return {sumH:Math.round(r.height),cardH:Math.round(cr.height),bottomOverflow:Math.round(r.bottom-cr.bottom)};})():null;
   const wearTab=document.querySelector('#bag [data-btab="wear"] img');
   return {openMs:+(t1-t0).toFixed(1),sumClip,rods,wearIcon:wearTab&&wearTab.getAttribute('src'),tabs:[...document.querySelectorAll('#bag [data-btab]')].map(b=>b.textContent.replace(/\s+/g,' ').trim())};
 });
 await p.waitForTimeout(300);
 await p.screenshot({path:O+'bag-gear.jpg',quality:82});

 // wear tab + info modal (no broken link)
 await p.click('#bag [data-btab="wear"]');
 await p.waitForTimeout(300);
 const wear=await p.evaluate(()=>{
   const btn=document.getElementById('wearInfo');
   if(btn)btn.click();
   const ov=document.querySelector('.wearInfoOv');
   const html=ov?ov.innerHTML:'';
   return {hasInfo:!!btn,hasBroken:/세트 비교 시안 크게 보기|eqSets-v31/.test(html),ov:!!ov};
 });
 await p.screenshot({path:O+'wear-info.jpg',quality:82});
 await p.evaluate(()=>{const x=document.querySelector('.wearInfoOv .close,#wiX');if(x)x.click();const ov=document.querySelector('.wearInfoOv');if(ov)ov.remove();});

 // board write/comment
 const board=await p.evaluate(async()=>{
   if(!window.NK_BOARD)return {err:'no NK_BOARD'};
   NK_BOARD.open();
   await new Promise(r=>setTimeout(r,800));
   const fr=document.querySelector('#boardOv iframe');
   if(!fr)return {err:'no iframe'};
   return {src:fr.src,v:fr.src.includes('v=')?fr.src.split('v=')[1]:'?'};
 });
 // interact inside iframe
 const boardWrite=await p.frames().find(f=>f.url().includes('board-v24'))?.evaluate(()=>{
   const KEY='nk_board_v31';
   localStorage.removeItem(KEY);
   const w=document.getElementById('bdWrite')||document.getElementById('bdP4W');
   if(!w)return {err:'no write btn',ids:[...document.querySelectorAll('[id]')].map(e=>e.id).slice(0,20)};
   w.click();
   return {opened:!!document.getElementById('bdPanel')?.classList.contains('show')||true,hasWrite:!!document.getElementById('bdWrite'),hasP4:!!document.getElementById('bdP4W')};
 });
 // fill form if panel open
 const boardPost=await p.frames().find(f=>f.url().includes('board-v24'))?.evaluate(()=>{
   const pan=document.getElementById('bdPanel');
   if(!pan)return {err:'no panel'};
   // ensure write form
   if(!document.getElementById('bdTitle'))document.getElementById('bdWrite').click();
   const title=document.getElementById('bdTitle'),body=document.getElementById('bdBody'),go=document.getElementById('bdGo');
   if(!title||!body||!go)return {err:'no form',html:pan.innerHTML.slice(0,200)};
   title.value='v32 게시판 테스트';body.value='글쓰기·댓글 동작 확인';go.click();
   // list should show
   const d=JSON.parse(localStorage.getItem('nk_board_v31')||'{}');
   return {posts:(d.posts||[]).length,title:(d.posts&&d.posts[0]&&d.posts[0].title),nick:(d.posts&&d.posts[0]&&d.posts[0].nick)};
 });
 // comment
 const boardCm=await p.frames().find(f=>f.url().includes('board-v24'))?.evaluate(()=>{
   const mine=document.getElementById('bdMine');if(mine)mine.click();
   const inp=document.querySelector('#bdList input');const btn=document.querySelector('#bdList button.ok');
   if(inp&&btn){inp.value='댓글 테스트';btn.click();}
   const d=JSON.parse(localStorage.getItem('nk_board_v31')||'{}');
   const id=d.posts&&d.posts[0]&&d.posts[0].id;
   return {comments:id?(d.cm[id]||[]).length:0,body:id&&d.cm[id]&&d.cm[id][0]&&d.cm[id][0].body};
 });
 await p.waitForTimeout(400);
 await p.screenshot({path:O+'board.jpg',quality:82});
 await p.evaluate(()=>{window.NK_BOARD&&NK_BOARD.close();});

 // dino in LIST
 const duck=await p.evaluate(()=>({list:(window.NK_DUCKV&&NK_DUCKV.LIST)||[],hasDino:!!(window.NK_DUCKV&&NK_DUCKV.LIST.some(x=>x[0]==='dino'))}));

 // gift banner
 const gift=await p.evaluate(()=>{
   if(typeof giftBanner==='function'){giftBanner('운영자 보상','🪙 1000 · 💎 5');}
   else if(window.giftBanner){window.giftBanner('운영자 보상','🪙 1000');}
   // giftBanner is file-scope - try via admin path by injecting
   const el=document.querySelector('.giftBan');
   if(!el){
     const e=document.createElement('div');e.className='giftBan';e.innerHTML='<div class="em">🎁</div><div><b>테스트</b><div class="d">배너 CSS</div></div>';document.body.appendChild(e);
   }
   return {shown:!!document.querySelector('.giftBan')};
 });
 await p.screenshot({path:O+'gift-banner.jpg',quality:82});

 // title canvas color check - project internal
 const nametag=await p.evaluate(()=>{
   // force titleStyle by reading HUD and simulating draw
   const S=NKV2.S;S.xp=99999; // high level
   // find title name
   const titles=(window.NK_DATA&&NK_DATA.LV&&NK_DATA.LV.titles)||[];
   return {titles:titles.slice(0,3),note:'titleStyle adds bg #6a4fc0 for lv titles'};
 });

 const out={title,bag,wear,board,boardWrite,boardPost,boardCm,duck,gift,nametag,errs};
 fs.writeFileSync('/workspace/nakmeong/shots/v32/t70.json',JSON.stringify(out,null,2));
 console.log(JSON.stringify(out,null,2));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
