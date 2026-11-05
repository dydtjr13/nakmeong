const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const O='/workspace/nakmeong/shots/v24/';const errs=[];const R={};
const open=async(W,H,url,pre)=>{const p=await b.newPage({viewport:{width:W,height:H},isMobile:W<700,hasTouch:W<700});p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8787/'+(url||'nakmeong.html'));await p.evaluate(pre||(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:9,deckW:'W1'}));}));await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:60000});await p.evaluate(()=>{document.querySelector('.stB').dataset.step=3;NKV2.S.mobFull=false;document.getElementById('go').click();});await p.waitForTimeout(3000);return p;};
const only=process.argv[2]||'MPAX';
// 옛 세이브 마이그레이션: 옛 번호 12(=h4 호숫가 할머니, 삭제) → 기본 0 / 옛 9(=h1 노인 어부) → 새 3
if(only.includes('X')){for(const [old,exp] of [[12,0],[9,3],[21,8]]){const p=await open(1280,800,null,(o=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:9,deckW:'W1'}));localStorage.setItem('nakmeong_v2',JSON.stringify({char:o,coins:100,xp:0}));}).toString().replace(/^/,'(')+')('+old+')');R['mig'+old]=await p.evaluate(()=>[NKV2.S.char,NKV2.KINDS[NKV2.S.char].n,NKV2.KINDS.length]);R['mig'+old+'ok']=R['mig'+old][0]===exp;await p.close();}}
if(only.includes('M')){const p=await open(390,844);
 R.kinds=await p.evaluate(()=>NKV2.KINDS.map(k=>k.n+':'+k.lv).join(', '));
 await p.evaluate(()=>{NKV2.S.__wx='snow';NKV2.S.wxOv='snow';});await p.waitForTimeout(1200);await p.evaluate(()=>document.getElementById('bMore').click());await p.waitForTimeout(500);await p.screenshot({path:O+'m-menu-wx.jpg',quality:80,clip:{x:150,y:0,width:240,height:330}});
 R.menuTop=await p.evaluate(()=>{const r=document.querySelector('#mSys button').getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!e.closest('#mSys');});await p.evaluate(()=>document.body.classList.remove('menu-open'));
 await p.screenshot({path:O+'m-auto-a5.jpg',quality:80,clip:{x:150,y:560,width:240,height:284}});
 await p.evaluate(()=>{NKV2.S.boxes=[1,2,3,4,5,6,7,8,9,10,11,12];document.getElementById('bBag').click();});await p.waitForTimeout(600);await p.screenshot({path:O+'m-bag-c1.jpg',quality:80,clip:{x:0,y:150,width:390,height:330}});
 R.badgeClip=await p.evaluate(()=>{const e=document.querySelector('#bag .tabs em:not(.zero)');if(!e)return 'none';const r=e.getBoundingClientRect(),t=document.querySelector('#bag .tabs').getBoundingClientRect();return r.top>=t.top-1;});
 R.obx=await p.evaluate(()=>{const a=document.getElementById('openBox').getBoundingClientRect(),c=document.getElementById('openBox10').getBoundingClientRect();return {gap:Math.round(c.left-a.right),sameRow:Math.abs(a.top-c.top)<2};});
 await p.evaluate(()=>{document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));document.getElementById('bSet').click();});await p.waitForTimeout(500);await p.screenshot({path:O+'m-set-pfx.jpg',quality:80,clip:{x:0,y:40,width:390,height:300}});
 await p.evaluate(()=>{document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));NK_EV.preview();});await p.waitForTimeout(800);await p.screenshot({path:O+'m-ev-e2-start.jpg',quality:80});await p.waitForTimeout(4500);await p.screenshot({path:O+'m-ev-e3-on.jpg',quality:80,clip:{x:0,y:0,width:390,height:300}});
 // X1: 짧은 화면
 await p.setViewportSize({width:390,height:664});await p.waitForTimeout(800);R.vshort=await p.evaluate(()=>document.body.classList.contains('vshort'));await p.screenshot({path:O+'m-x1-short.jpg',quality:80});
 await p.close();}
if(only.includes('P')){const p=await open(1440,860,'nakmeong.html?admin');
 console.log('s1');R.rank=await p.evaluate(()=>{const e=document.querySelector('.rk10 .rlv');return e?e.textContent:null;});
 // 컷인 클릭 닫기 (가방 열린 상태)
 await p.evaluate(()=>{document.getElementById('bBag').click();const F=NKV2.D?null:null;});
 R.cut=await p.evaluate(()=>new Promise(r=>{const n=NKV2._n;try{NKV2.V14&&0;}catch(e){}const el=document.createElement('div');r(1);}));
 await p.evaluate(()=>{NKV2.V14.admin();document.querySelector('#admin [data-at="test"]').click();});await p.waitForTimeout(500);
 await p.screenshot({path:O+'admin-test-v24.jpg',quality:80,fullPage:false});
 console.log('s2');R.lv=await p.evaluate(()=>{const c=s=>document.querySelector('#admin '+s).click();c('[data-lvs="99"]');const a=NKV2.myLv(),mv=NKV2.mvMul();c('[data-lvd="-10"]');const b=NKV2.myLv();c('[data-lvs="1"]');return {a,mv,b,c:NKV2.myLv()};});
 console.log('s3');R.toast=await p.evaluate(()=>{document.querySelector('#admin [data-tfix="5"]').click();return NKV2.S.toastFix;});await p.evaluate(()=>{document.querySelector('#admin [data-tfix="0"]').click();});
 console.log('s4');R.ai=await p.evaluate(()=>new Promise(r=>{const g=id=>document.querySelector('#admin #'+id);g('tAiM').click();g('tAiC').click();setTimeout(()=>{r({move:NKV2.S.aiMove,chat:NKV2.S.aiChat});},1500);}));
 await p.evaluate(()=>{document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));});await p.waitForTimeout(2500);await p.screenshot({path:O+'pc-ai-seated.jpg',quality:78});
 console.log('s5');await p.evaluate(()=>NK_EV.preview());await p.waitForTimeout(900);await p.screenshot({path:O+'pc-ev-r1-start.jpg',quality:80,clip:{x:300,y:0,width:840,height:200}});await p.waitForTimeout(4500);await p.screenshot({path:O+'pc-ev-r1-on.jpg',quality:80,clip:{x:300,y:0,width:840,height:120}});
 console.log('s6');await p.evaluate(()=>NK_BOARD.open());await p.waitForTimeout(1500);await p.screenshot({path:O+'pc-board-p4.jpg',quality:78});
 R.board=await p.evaluate(()=>!!document.querySelector('#boardOv iframe'));await p.evaluate(()=>NK_BOARD.close());
 await p.close();}
console.log(JSON.stringify(R),'errs',JSON.stringify(errs.slice(0,5)));await b.close();})();
