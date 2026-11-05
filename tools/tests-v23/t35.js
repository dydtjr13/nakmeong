// v23 기능 테스트 (피쉬레스트)
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const R={},errs=[];const O='/workspace/nakmeong/shots/v23/';require('fs').mkdirSync(O,{recursive:true});
const open=async(W,H,url,pre)=>{const p=await b.newPage({viewport:{width:W,height:H},isMobile:W<700,hasTouch:W<700,deviceScaleFactor:W<700?2:1});p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8787/'+url);await p.evaluate(pre||(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:9,deckW:'W1'}));}));await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});return p;};
const go=async p=>{await p.evaluate(()=>{document.querySelector('.stB').dataset.step=3;document.getElementById('go').click();});await p.waitForTimeout(2200);};
const C=p=>p.evaluate(()=>document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show')));
let p=await open(1280,760,'nakmeong.html');
R.title=await p.evaluate(()=>document.title);R.h1=await p.evaluate(()=>document.querySelector('#start h1').textContent);
await p.screenshot({path:O+'start-pc.jpg',quality:80});
await go(p);const ev=(f,a)=>p.evaluate(f,a);
R.logo=await ev(()=>getComputedStyle(document.querySelector('#hud .logo')).display);
R.dc0=await ev(()=>getComputedStyle(document.getElementById('dc')).display);
await p.screenshot({path:O+'hud-pc-nologo.jpg',quality:80,clip:{x:0,y:0,width:1280,height:140}});
await ev(()=>{document.getElementById('bSet').click();});await p.waitForTimeout(300);
R.perfBox=await ev(()=>{const c=document.getElementById('perfOn');return c?c.checked:null;});
await ev(()=>{for(const b of document.querySelectorAll('#set .slay>aside>*')){b.click();const c=document.getElementById('perfOn');if(c&&c.offsetParent)break;}document.getElementById('perfOn').scrollIntoView({block:'center'});});await p.waitForTimeout(200);
{const bx=await p.evaluate(()=>{const r=document.getElementById('perfOn').closest('p').getBoundingClientRect();return {x:Math.max(0,r.x-10),y:Math.max(0,r.y-10),width:Math.min(1270,r.width+20),height:r.height+90};});await p.screenshot({path:O+'set-perf-full.jpg',quality:82,clip:bx});}
await ev(()=>{const c=document.getElementById('perfOn');c.checked=true;window.__t=1;c.onchange({target:c});});await C(p);await p.waitForTimeout(600);
R.dc1=await ev(()=>getComputedStyle(document.getElementById('dc')).display);
await ev(()=>{const c=NKV2.S;c.perfOn=false;NKV2.applyHud();});
// 부적: 고정핀 + 호버 툴팁 + NEW
R.pin=await ev(()=>{const S=NKV2.S;S.xp=NKV2.LV.cum[20];const keys=['luck','quick','big'];S.charms=[0,1,2,3,4,5,6].map(i=>({id:9000+i,tier:i%3+1,opts:[{k:keys[i%3],v:2+i},{k:keys[(i+1)%3],v:1+i}],lock:false}));S.charms[6].nw=1;const ns=NKV2.lvCharmSlots();S.equip=S.charms.slice(0,ns).map(c=>c.id);S.presets=[S.equip.slice(),[],[]];
 document.getElementById('bBag').click();document.querySelector('#bag [data-btab="charm"]').click();document.querySelector('#bag [data-csel="9005"]').click();const sl=[...document.querySelectorAll('#bag .bslot[data-slot]')];sl[1].click();
 return {cpin:document.querySelectorAll('#bag .bslot .cpin').length,txt:/교체 대상/.test([...document.querySelectorAll('#bag .bslot')].map(x=>x.textContent).join('')),nw:document.querySelectorAll('#bag .btile .nwb').length};});
await p.waitForTimeout(300);
{const bx=await p.evaluate(()=>{const r=document.querySelector('#bag .bslots').getBoundingClientRect();return {x:r.x-6,y:r.y-6,width:r.width+12,height:r.height+12};});await p.screenshot({path:O+'charm-pin.jpg',quality:85,clip:bx});}
const t9006=await p.$('#bag [data-csel="9006"]');await t9006.hover();await p.waitForTimeout(400);
R.ctip=await ev(()=>({tip:document.getElementById('tip').className,txt:document.getElementById('tip').textContent,nwLeft:document.querySelectorAll('#bag .btile .nwb:not(.gone)').length,flag:NKV2.S.charms[6].nw}));
{const bx=await p.evaluate(()=>{const r=document.querySelector('#bag .blist').getBoundingClientRect(),t=document.getElementById('tip').getBoundingClientRect();const x=Math.min(r.x,t.x)-6,y=Math.min(r.y,t.y)-6;return {x,y,width:Math.max(r.right,t.right)-x+6,height:Math.min(500,Math.max(r.bottom,t.bottom)-y+6)};});await p.screenshot({path:O+'charm-hover-tip.jpg',quality:85,clip:bx});}
await C(p);
// 상자 10개 개봉 결과: 툴팁 + NEW
await ev(()=>{NKV2.giveBox(10);NKV2.bagTab('box');NKV2.openM('bag');document.getElementById('openBox10').click();});await p.waitForTimeout(2600);
R.box=await ev(()=>({cells:document.querySelectorAll('#boxFx .ritem').length,tips:document.querySelectorAll('#boxFx .ritem[data-tip]').length,nw:document.querySelectorAll('#boxFx .nwb:not(.gone)').length}));
const ri=await p.$('#boxFx .ritem[data-nwk]');if(ri){await ri.hover();await p.waitForTimeout(500);}
R.box2=await ev(()=>({nw:document.querySelectorAll('#boxFx .nwb:not(.gone)').length,tip:document.getElementById('tip').textContent}));
await p.screenshot({path:O+'box10-hover.jpg',quality:82});
await ev(()=>{const o=document.getElementById('fxOk');o&&o.click();});await C(p);
// 일반 유저 공지: 남은 시간 숨김
await ev(()=>{localStorage.setItem('nk_admin_ann',JSON.stringify([{t:Date.now(),msg:'오늘 22시부터 30분간 서버 점검이 있어요. 잠시 후 다시 접속해 주세요!',until:Date.now()+6e5,ch:'all'}]));});
await p.close();
p=await open(1280,760,'nakmeong.html',()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:9,deckW:'W1'}));localStorage.setItem('nk_admin_ann',JSON.stringify([{t:Date.now(),msg:'오늘 22시부터 30분간 서버 점검이 있어요. 잠시 후 다시 접속해 주세요!',until:Date.now()+6e5,ch:'all'}]));});await go(p);await p.waitForTimeout(1500);
R.annUser=await p.evaluate(()=>{const a=document.getElementById('annBar');if(!a)return null;const r=a.getBoundingClientRect(),x=a.querySelector('button').getBoundingClientRect();return {left:!!a.querySelector('.annLeft'),inside:x.right<=r.right&&x.left>=r.left&&x.top>=r.top&&x.bottom<=r.bottom};});
await p.close();
// 모바일 공지 X 위치 + 시작 화면
p=await open(390,844,'nakmeong.html',()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:9,deckW:'W1'}));localStorage.setItem('nk_admin_ann',JSON.stringify([{t:Date.now(),msg:'오늘 22시부터 30분간 서버 점검이 있어요. 잠시 후 다시 접속해 주세요!',until:Date.now()+6e5,ch:'all'}]));});await p.screenshot({path:O+'m-start.jpg',quality:78});await go(p);await p.waitForTimeout(1500);
R.annMob=await p.evaluate(()=>{const a=document.getElementById('annBar');if(!a)return null;const r=a.getBoundingClientRect(),x=a.querySelector('button').getBoundingClientRect();return {inside:x.right<=r.right+.5&&x.left>=r.left&&x.right<=innerWidth,w:Math.round(r.width)};});
{const bx=await p.evaluate(()=>{const r=document.getElementById('annBar').getBoundingClientRect();return {x:0,y:Math.max(0,r.y-60),width:390,height:r.height+120};});await p.screenshot({path:O+'m-ann.jpg',quality:82,clip:bx});}
R.full=await p.evaluate(()=>!!window.NK_FULL&&typeof NK_FULL.note()==='string');
await p.close();
// 관리자: 테스트 탭(이동속도) · 이벤트 · 뒤로 가기 · 공지 미리보기
p=await open(1280,860,'nakmeong.html?admin',()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:9,deckW:'W1'}));localStorage.setItem('nk_admin_ann',JSON.stringify([{t:Date.now(),msg:'오늘 22시부터 30분간 서버 점검이 있어요. 잠시 후 다시 접속해 주세요!',until:Date.now()+6e5,ch:'all'}]));});await go(p);const e3=(f,a)=>p.evaluate(f,a);
await e3(()=>{NKV2.V14.admin();document.querySelector('#admin [data-at="test"]').click();});await p.waitForTimeout(300);
await e3(()=>{const c=document.querySelector('#admin #tMvO');c.checked=true;c.onchange({target:c});});await p.waitForTimeout(200);
await e3(()=>document.querySelector('#admin [data-mv="1"]').click());await p.waitForTimeout(200);
R.adMv=await e3(()=>+NKV2.mvMul().toFixed(2));
await p.screenshot({path:O+'admin-test-speed.jpg',quality:82});
await e3(()=>document.querySelector('#admin [data-at="ev"]').click());await p.waitForTimeout(300);
await e3(()=>{const q=s=>document.querySelector('#admin '+s);q('[data-evs="10"]').click();q('[data-evh="30"]').click();q('#evCoin').value='2';q('#evCoin').dispatchEvent(new Event('input'));});await p.waitForTimeout(200);
R.evSum=await e3(()=>document.getElementById('evSum').textContent);R.evSec=await e3(()=>document.getElementById('evFt').step);
await p.screenshot({path:O+'admin-event.jpg',quality:82});
await e3(()=>{document.querySelector('#admin [data-ad="evsave"]').click();document.getElementById('cfYes').click();});await p.waitForTimeout(300);
R.evSaved=await e3(()=>{const e=JSON.parse(localStorage.getItem('nk_admin_ev')||'{}');return {coin:e.coin,dur:Math.round((e.to-e.from)/6e4),later:Math.round((e.from-Date.now())/6e4)};});
await e3(()=>document.querySelector('#admin [data-at="dash"]').click());await p.waitForTimeout(200);
await e3(()=>document.querySelector('#admin [data-chv="2"]').click());await p.waitForTimeout(200);
await e3(()=>document.querySelector('#admin [data-goU]').click());await p.waitForTimeout(200);
R.back=await e3(()=>!!document.querySelector('#admin [data-adback]'));
await p.screenshot({path:O+'admin-user-back.jpg',quality:82,clip:{x:0,y:0,width:1280,height:330}});
await e3(()=>document.querySelector('#admin [data-adback]').click());await p.waitForTimeout(200);
R.backTo=await e3(()=>document.querySelector('#admin [data-at].on').dataset.at);
await C(p);await p.waitForTimeout(1200);
R.annAdm=await e3(()=>{const a=document.getElementById('annBar');return a?!!a.querySelector('.annLeft'):null;});
await p.close();
console.log(JSON.stringify(R));console.log('errs',errs);
const ok=R.title.includes('피쉬레스트')&&R.h1.includes('피쉬레스트')&&R.logo==='none'&&R.dc0==='none'&&R.dc1==='block'&&R.perfBox===false&&R.pin.cpin===1&&!R.pin.txt&&R.pin.nw===1&&R.ctip.tip==='show'&&/%/.test(R.ctip.txt)&&R.ctip.nwLeft===0&&!R.ctip.flag&&R.box.tips===R.box.cells&&R.box.cells>=10&&R.box2.nw===R.box.nw-1&&R.annUser&&!R.annUser.left&&R.annUser.inside&&R.annMob&&R.annMob.inside&&R.full&&R.adMv===2&&/30분/.test(R.evSum)&&R.evSec==='1'&&R.evSaved.coin===2&&R.evSaved.dur===30&&R.evSaved.later>=9&&R.back&&R.backTo==='dash'&&R.annAdm===true&&!errs.length;
console.log(ok?'PASS':'FAIL');await b.close();})();
