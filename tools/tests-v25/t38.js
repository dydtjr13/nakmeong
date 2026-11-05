// v25 UI: 튜토리얼 D2/D4, XP A2/A4, 자동낚시 Lv1, 전체화면 버튼
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const O='/workspace/nakmeong/shots/v25/';const R={};const errs=[];
for(const [W,H,tag] of [[1280,720,'pc'],[390,844,'m']]){const p=await b.newPage({viewport:{width:W,height:H},isMobile:W<700,hasTouch:W<700});p.on('pageerror',e=>errs.push(tag+':'+e.message));const ev=(f,a)=>p.evaluate(f,a);
await p.goto('http://localhost:8787/nakmeong.html');await ev(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({deckW:'W1'}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await ev(()=>document.getElementById('go').click());await p.waitForTimeout(2500);
const r={};r.tut=await ev(()=>{const e=document.getElementById('tq25');return e&&e.style.display!=='none'&&e.className;});
r.autoOK=await ev(()=>{document.getElementById('bAutoFish')&&0;return NKV2.myLv();});
await p.screenshot({path:O+`tut-d2-${tag}.jpg`,quality:72});
// 앉기 → 1단계 완료
await ev(()=>{const st=NKV2.SEATS.find(s=>s.kind==='stool'&&!s.occ.length);NKV2.sitOn(st);});await p.waitForTimeout(1500);r.step=await ev(()=>NK_TUT.P().i);
// 이미지 클릭 → 접기
await ev(()=>document.querySelector('#tq25 [data-tq=npc]').click());await p.waitForTimeout(400);r.fold=await ev(()=>document.getElementById('tq25').className);r.imgStill=await ev(()=>!!document.querySelector('#tq25 img'));r.bbGone=await ev(()=>!document.querySelector('#tq25 .bb'));
await p.screenshot({path:O+`tut-d2-fold-${tag}.jpg`,quality:72});await ev(()=>document.querySelector('#tq25 [data-tq=npc]').click());
// XP A2
await ev(()=>{NKV2._n.toast&&0;NKV2.addXP(18,'붕어 32.4cm');});await p.waitForTimeout(350);r.xpA2=await ev(()=>{const r=document.getElementById('xpF').getBoundingClientRect();return [r.left,r.top,r.width].map(Math.round);});await p.screenshot({path:O+`xp-a2-${tag}.jpg`,quality:72});
await ev(()=>NK_UI25.set('xp','A4'));await p.waitForTimeout(2600);await ev(()=>NKV2.addXP(18,'붕어 32.4cm'));await p.waitForTimeout(350);r.xpA4=await ev(()=>{const r=document.getElementById('xpF').getBoundingClientRect();return [r.left,r.top,r.width].map(Math.round);});await p.screenshot({path:O+`xp-a4-${tag}.jpg`,quality:72});
// D4
await ev(()=>NK_UI25.set(innerWidth<700?'tutM':'tutPC','D4'));await p.waitForTimeout(800);await p.screenshot({path:O+`tut-d4-${tag}.jpg`,quality:72});
// 자동낚시 Lv1
await ev(()=>{document.getElementById('bAutoFish')?document.getElementById('bAutoFish').click():document.getElementById('bAuto').click();});await p.waitForTimeout(500);r.auto=await ev(()=>!!NKV2.S.autoFish);
// 설정 화면
await ev(()=>document.getElementById('bSet').click());await p.waitForTimeout(600);r.full=await ev(()=>{const b=document.getElementById('fullNow');b.scrollIntoView({block:'center'});return b.textContent+' | '+b.parentElement.innerText.slice(0,200);});await p.waitForTimeout(300);await p.screenshot({path:O+`set-full-${tag}.jpg`,quality:72});
R[tag]=r;await p.close();}
console.log(JSON.stringify(R,null,1),'errs',errs);await b.close();})();
