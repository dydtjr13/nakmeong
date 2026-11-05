// v25 관리자: 컷인 테스트·특별 칭호·UI 편집·튜토리얼 테스트
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));const ev=(f,a)=>p.evaluate(f,a);const O='/workspace/nakmeong/shots/v25/';
await p.goto('http://localhost:8787/nakmeong.html?admin');await ev(()=>localStorage.clear());await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await ev(()=>document.getElementById('go').click());await p.waitForTimeout(2000);
const openT=async()=>{await ev(()=>{document.getElementById('bSet').click();document.getElementById('adminBtn').click();});await p.waitForTimeout(500);await ev(()=>document.querySelector('#admin [data-at=test]').click());await p.waitForTimeout(500);};
const r={};await openT();r.secs=await ev(()=>[...document.querySelectorAll('#admin .adbox h4')].map(h=>h.textContent.slice(0,12)).filter(t=>/컷인|특별|편집|튜토리얼/.test(t)));
await ev(()=>{const g=id=>document.getElementById(id);g('spN').value='호수의 수호자';g('spN').dispatchEvent(new Event('input'));g('spBg').value='#2a3f6a';g('spBg').dispatchEvent(new Event('input'));});
await ev(()=>document.getElementById('spPv').scrollIntoView({block:'center'}));await p.waitForTimeout(200);await p.screenshot({path:O+'admin-sptitle.jpg',quality:72});
await ev(()=>document.getElementById('spGive').click());await p.waitForTimeout(400);r.store=await ev(()=>localStorage.getItem('nk_sptitle'));
// 초월 컷인 버튼
await ev(()=>document.querySelector('[data-cut="5"]').click());await p.waitForTimeout(400);r.cutX=await ev(()=>!!document.querySelector('.cutin.X'));await p.screenshot({path:O+'cut-x-test.jpg',quality:72});await ev(()=>document.querySelector('.cutin')&&document.querySelector('.cutin').click());await p.waitForTimeout(500);
// 프로필 칭호 선택
await ev(()=>document.getElementById('bSet').click());await p.waitForTimeout(500);r.opts=await ev(()=>[...document.querySelectorAll('#ttlSel option')].map(o=>o.textContent));await ev(()=>{const s=document.getElementById('ttlSel');s.value='sp:호수의 수호자';s.dispatchEvent(new Event('change'));});await p.waitForTimeout(300);await ev(()=>document.getElementById('ttlSel').scrollIntoView({block:'center'}));await p.screenshot({path:O+'profile-title.jpg',quality:72});await p.keyboard.press('Escape');await p.waitForTimeout(1200);
r.hud=await ev(()=>{const e=document.querySelector('.ttl2');return e&&[e.textContent,e.getAttribute('style')];});
// UI 편집: 상태바 끌기
await openT();await ev(()=>document.getElementById('uiEd').click());await p.waitForTimeout(500);await p.screenshot({path:O+'ui-edit-on.jpg',quality:72});
const bx=await ev(()=>{const r=document.getElementById('wxCard')||document.getElementById('equip');const q=document.getElementById('equip').getBoundingClientRect();return [q.left+30,q.top+12];});
await p.mouse.move(bx[0],bx[1]);await p.mouse.down();await p.mouse.move(bx[0]+200,bx[1]+150,{steps:6});await p.mouse.up();await p.waitForTimeout(300);r.pos=await ev(()=>NK_UIEDIT.pos());await p.screenshot({path:O+'ui-edit-drag.jpg',quality:72});
await ev(()=>document.querySelector('#uiEditBar [data-u=done]').click());await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await ev(()=>document.getElementById('go').click());await p.waitForTimeout(2500);r.after=await ev(()=>document.getElementById('equip').style.translate);
await ev(()=>NK_UIEDIT.reset());r.reset=await ev(()=>document.getElementById('equip').style.translate);
console.log(JSON.stringify(r,null,1),'errs',errs);await b.close();})();
