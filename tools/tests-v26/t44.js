// v26 UI 편집 2차: 테스트 사본·끌기·스냅·방향키·Ctrl+Z·Ctrl+S·크기 조절
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const O='/workspace/nakmeong/shots/v26/';const out={};
for(const [nm,vp,mob] of [['pc',{width:1280,height:720},false],['m',{width:390,height:844},true]]){const p=await b.newPage({viewport:vp,isMobile:mob,hasTouch:mob});const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_tut25',JSON.stringify({i:2,chk:1}));localStorage.setItem('nk_ui25',JSON.stringify({duckOn:0}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.evaluate(()=>document.getElementById('go').click());await p.waitForTimeout(2500);
await p.evaluate(()=>NK_UIEDIT.enter());await p.waitForTimeout(500);
const r={};r.pv=await p.evaluate(()=>[...document.querySelectorAll('[data-uin]')].filter(e=>{const c=getComputedStyle(e);return e.getClientRects().length&&+c.opacity>.05;}).map(e=>e.dataset.uin).join(','));
await p.screenshot({path:O+'uiedit-'+nm+'.jpg',quality:78});
if(nm==='pc'){const bx=await p.evaluate(()=>{const r=document.getElementById('xpF').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];});
 await p.mouse.move(bx[0],bx[1]);await p.mouse.down();await p.mouse.move(bx[0]+120,bx[1]+80,{steps:10});r.guides=await p.evaluate(()=>document.querySelectorAll('#uiGuides i').length);await p.screenshot({path:O+'uiedit-drag.jpg',quality:78});await p.mouse.up();
 r.after=await p.evaluate(()=>JSON.stringify(NK_UIEDIT.pos().xpF));
 await p.keyboard.press('ArrowRight');await p.keyboard.down('Shift');await p.keyboard.press('ArrowDown');await p.keyboard.up('Shift');r.arrow=await p.evaluate(()=>JSON.stringify(NK_UIEDIT.pos().xpF));
 await p.keyboard.press('Control+z');r.undo1=await p.evaluate(()=>JSON.stringify(NK_UIEDIT.pos().xpF));
 r.ctrlS=await p.evaluate(()=>{const e=new KeyboardEvent('keydown',{key:'s',ctrlKey:true,bubbles:true,cancelable:true});document.dispatchEvent(e);return e.defaultPrevented;});r.saved=await p.evaluate(()=>localStorage.getItem('nk_uipos_pc'));
 // 크기: 선택된 xpF 오른쪽 테두리 끌기
 const ed=await p.evaluate(()=>{const r=document.getElementById('xpF').getBoundingClientRect();return [r.right-2,r.top+r.height/2,r.width];});await p.mouse.move(ed[0],ed[1]);r.cursor=await p.evaluate(()=>document.body.style.cursor);await p.mouse.down();await p.mouse.move(ed[0]+ed[2]*.5,ed[1],{steps:6});await p.mouse.up();r.scale=await p.evaluate(()=>JSON.stringify(NK_UIEDIT.pos().xpF));
 await p.evaluate(()=>document.querySelector('#uiEditBar [data-u=done]').click());await p.waitForTimeout(300);r.left=await p.evaluate(()=>({xpF:!!document.getElementById('xpF'),bar:!!document.getElementById('uiEditBar'),pv:document.querySelectorAll('.uiPv').length,store:localStorage.getItem('nk_uipos_pc')}));
 // 실제 XP 알림이 저장 위치로 뜨는지
 await p.evaluate(()=>NKV2.addXP(5,'t'));await p.waitForTimeout(200);r.realXp=await p.evaluate(()=>{const e=document.getElementById('xpF');return e.style.translate+' | '+e.style.scale;});}
out[nm]=r;out[nm+'err']=errs;await p.close();}
console.log(JSON.stringify(out,null,0));await b.close();})();
