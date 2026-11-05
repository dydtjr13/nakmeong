// v22 기능 테스트
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const R={},errs=[];const O='/workspace/nakmeong/shots/v22/';require('fs').mkdirSync(O,{recursive:true});
const open=async(W,H,url,pre)=>{const p=await b.newPage({viewport:{width:W,height:H},isMobile:W<700,hasTouch:W<700});p.on('pageerror',e=>errs.push(e.message));await p.goto('http://localhost:8787/'+url);await p.evaluate(pre||(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:9,deckW:'W1'}));}));await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});return p;};
const go=async p=>{await p.evaluate(()=>{document.querySelector('.stB').dataset.step=3;document.getElementById('go').click();});await p.waitForTimeout(2200);};
// 데스크톱 일반 유저
let p=await open(1280,760,'nakmeong.html');await go(p);const ev=(f,a)=>p.evaluate(f,a);
R.speed1=await ev(()=>{NKV2.S.moveOv=0.9;return NKV2.mvMul();});
R.speed50=await ev(()=>{NKV2.S.xp=NKV2.LV.cum[50];return +NKV2.mvMul().toFixed(3);});
R.setNoSlider=await ev(()=>{document.getElementById('bSet')?.click();const has=!!document.getElementById('mvS');document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));return has;});
// 낚싯대 구매 → 등급
R.rod=await ev(()=>{const S=NKV2.S;S.coins=1e6;document.getElementById('bShop').click();const btn=document.querySelector('#shop [data-buyrod="carbon"]');btn.click();const g=S.gear[S.gear.length-1];const lab=document.querySelector('#tq')?.textContent||'';document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));return {br:g.br,gr:g.gr,toast:/\[(일반|고급|희귀|영웅|전설|신화)\]/.test(lab)};});
await ev(()=>{const S=NKV2.S;S.xp=NKV2.LV.cum[20];NKV2.V14&&0;document.getElementById('bBag').click();document.querySelector('#bag [data-btab="gear"]').click();});await p.waitForTimeout(400);
R.gearLabel=await ev(()=>document.querySelectorAll('#bag .ggr').length);await p.screenshot({path:O+'bag-rod-grade.jpg',quality:82});
// 판매 → 로그
R.sellLog=await ev(()=>{const b=[...document.querySelectorAll('#bag [data-gsell]')].find(x=>!x.disabled);if(!b)return 'no';b.click();return NKV2.ILOG.all().filter(e=>e.type==='sell'&&e.cat==='rod').length;});
// 부적 교체 대상 고정
R.pin=await ev(()=>{const S=NKV2.S;S.charms=[0,1,2,3].map(i=>({id:9000+i,tier:i%3,opts:[{k:Object.keys(NKV2._n?{}:{})[0]||'luck',v:2+i}],lock:false}));return 1;});
R.pin=await ev(()=>{const S=NKV2.S,ok=Object.keys(S.charmSum||{});const k0=document.querySelector('#bag [data-btab="charm"]');return !!k0;});
await ev(()=>{const S=NKV2.S;const opt=Object.keys(window.NK_D?window.NK_D.CHARM.opts:{});});
R.pinRes=await ev(()=>{const S=NKV2.S;const D=window.D||window.NK_DATA;const keys=['luck','quick','big'];S.charms=[0,1,2,3,4,5,6].map(i=>({id:9000+i,tier:i%3,opts:[{k:keys[i%3],v:2+i}],lock:false}));const ns=NKV2.lvCharmSlots();S.equip=S.charms.slice(0,ns).map(c=>c.id);S.presets=[S.equip.slice(),[],[]];
 document.querySelector('#bag [data-btab="charm"]').click();document.querySelector('#bag [data-csel="9006"]').click();const before=[...document.querySelectorAll('#bag .bslot')].findIndex(x=>x.classList.contains('tgt'));
 const other=[...document.querySelectorAll('#bag .bslot[data-slot]')].find((x,i)=>i!==before);const oi=[...document.querySelectorAll('#bag .bslot')].indexOf(other);other.click();
 const pinned=[...document.querySelectorAll('#bag .bslot')].findIndex(x=>x.classList.contains('tgt'));document.querySelector('#bag [data-csel="9006"]').click();document.querySelector('#bag [data-csel="9005"]').click();const after=[...document.querySelectorAll('#bag .bslot')].findIndex(x=>x.classList.contains('tgt'));
 return {before,oi,pinned,after,label:document.querySelector('#bag .bslot.tgt .tg')?.textContent};});
await p.screenshot({path:O+'bag-charm-pin.jpg',quality:82});await ev(()=>document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show')));
// LU3 / RD3 / HP1
await ev(()=>{NKV2.lvPop(12,1200,[],[['1f9d1','캐릭터 「항구 선원」'],['1f3a3','은빛 릴낚싯대'],['1f9ff','부적 칸 3개']],'호숫가 단골');});await p.waitForTimeout(600);R.lu3=await ev(()=>!!document.querySelector('#lvUp.show .lu3')&&document.querySelectorAll('#lvUp [data-lugo]').length);await p.screenshot({path:O+'levelup-LU3.jpg',quality:82});
R.lugo=await ev(()=>{document.querySelector('#lvUp [data-lugo]').click();return document.getElementById('shop').classList.contains('show');});await ev(()=>document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show')));
await ev(()=>{document.getElementById('lvB').click();});await p.waitForTimeout(500);R.rd3=await ev(()=>document.querySelectorAll('#lvRoad .rd3 .lc').length+'|'+document.querySelectorAll('#lvRoad .rdt button').length);await p.screenshot({path:O+'road-RD3.jpg',quality:82});
R.rdTab=await ev(()=>{document.querySelector('#lvRoad [data-rdc="5"]').click();return document.querySelector('#lvRoad .rd3 .lc b').textContent;});await ev(()=>document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show')));
R.hp1=await ev(()=>document.body.classList.contains('hp1'));await p.screenshot({path:O+'hud-HP1.jpg',quality:82,clip:{x:0,y:0,width:900,height:150}});
for(const v of ['RD1','RD2','RD4']){await ev(v=>{NKV2.S.roadSt=v;window.RDC=null;document.getElementById('lvB').click();},v);await p.waitForTimeout(400);await p.screenshot({path:O+'road-'+v+'.jpg',quality:80});await ev(()=>document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show')));}
for(const v of ['LU1','LU2','LU4']){await ev(v=>{NKV2.S.lvPopSt=v;NKV2.lvPop(15,1500,[1],[['1f9d1','캐릭터 「노인 어부」']],'');},v);await p.waitForTimeout(600);await p.screenshot({path:O+'levelup-'+v+'.jpg',quality:80});await ev(()=>document.getElementById('lvUp').classList.remove('show'));}
for(const v of ['HP2','HP3']){await ev(v=>{NKV2.S.hudPc=v;NKV2.applyHud();},v);await p.waitForTimeout(300);await p.screenshot({path:O+'hud-'+v+'.jpg',quality:80,clip:{x:0,y:0,width:900,height:150}});}
await p.close();
// 모바일: HM2 메뉴 / 채팅 9+ / 시작 탭 / 핀치
p=await open(390,844,'nakmeong.html');const e2=f=>p.evaluate(f);
R.stTabs=await e2(()=>{const st=document.querySelector('.stB');st.dataset.step=3;const t=document.querySelector('.stSteps span[data-s="1"]');if(!t)return 'no-tab';const vis=t.getBoundingClientRect().height>0;t.click();const a=st.dataset.step;document.querySelector('.stSteps span[data-s="2"]').click();return {vis,to1:a,to2:st.dataset.step};});
await e2(()=>{document.querySelector('.stB').dataset.step=3;});await p.waitForTimeout(300);await p.screenshot({path:O+'m-start-tabs.jpg',quality:80,clip:{x:0,y:0,width:390,height:420}});
await go(p);
R.badge=await e2(()=>{const L=document.getElementById('log');for(let i=0;i<12;i++){const d=document.createElement('div');d.textContent='x'+i;L.appendChild(d);}return new Promise(r=>setTimeout(()=>{const a=document.querySelector('#chatBtn b').textContent;L.appendChild(document.createElement('div'));setTimeout(()=>r([a,document.querySelector('#chatBtn b').textContent]),50);},50));});
R.hm2=await e2(()=>{const m=document.getElementById('bMore').getBoundingClientRect(),g=document.getElementById('streak').getBoundingClientRect();return {menuTop:Math.round(m.top),menuLeft:Math.round(m.left),giftRight:Math.round(g.right),hm2:document.body.classList.contains('hm2')};});
await p.screenshot({path:O+'m-hud-HM2.jpg',quality:82,clip:{x:0,y:0,width:390,height:160}});
await e2(()=>{document.getElementById('bMore').click();});await p.waitForTimeout(300);await p.screenshot({path:O+'m-hud-HM2-menu.jpg',quality:82,clip:{x:0,y:0,width:390,height:420}});await e2(()=>document.body.classList.remove('menu-open'));
await p.waitForTimeout(2500);R.pinch=await e2(()=>new Promise(res=>{const w=document.getElementById('world'),me=NKV2.chars[0].o.position,c=NKV2.cam.position,d0=c.distanceTo(me);const P=(t,id,x,y,el)=>(el||window).dispatchEvent(new PointerEvent(t,{pointerId:id,pointerType:'touch',clientX:x,clientY:y,bubbles:true}));
 P('pointerdown',11,150,400,w);P('pointerdown',12,240,400,w);let k=0;const iv=setInterval(()=>{k++;P('pointermove',11,150-k*6,400);P('pointermove',12,240+k*6,400);if(k>=10){clearInterval(iv);P('pointerup',11,0,0);P('pointerup',12,0,0);setTimeout(()=>res({d0:+d0.toFixed(2),d1:+NKV2.cam.position.distanceTo(me).toFixed(2)}),900);}},30);}));
await p.close();
// 관리자: 유저 정지 600분 / 채팅 금지 / 지급 / 복구 / 밸런스 확인창 / 이벤트 시간 / 공지 시간
p=await open(1280,860,'nakmeong.html?admin');await go(p);const e3=f=>p.evaluate(f);
R.adSpeed=await e3(()=>{NKV2.S.moveOv=1;return NKV2.mvMul();});
await e3(()=>{const S=NKV2.S;S.coins=1e6;document.getElementById('bShop').click();document.querySelector('#shop [data-buyrod="carbon"]').click();document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));document.getElementById('bBag').click();document.querySelector('#bag [data-btab="gear"]').click();[...document.querySelectorAll('#bag [data-gsell]')].find(x=>!x.disabled).click();document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));});
await e3(()=>{NKV2.V14.admin();document.querySelector('#admin [data-at="user"]').click();});
R.ban=await e3(()=>new Promise(r=>{const b=document.querySelector('#admin [data-uo="ban"]');const n=b.dataset.n;b.click();const i=document.querySelector('#admin #sM');i.value='600';i.oninput();const lbl=document.querySelector('#admin #sMv').textContent;document.querySelector('#admin [data-ua="ban"]').click();document.getElementById('cfYes').click();setTimeout(()=>{const bot=NKV2.chars.find(c=>c.name===n);r({n,lbl,off:!!(bot&&bot.offline),row:[...document.querySelectorAll('#admin .adt tr')].find(t=>t.textContent.includes(n))?.textContent.includes('정지')});},400);}));
R.mute=await e3(()=>{const b=[...document.querySelectorAll('#admin [data-uo="mute"]')][1];const n=b.dataset.n;b.click();document.querySelector('#admin #sM').value='14400';document.querySelector('#admin [data-ua="mute"]').click();document.getElementById('cfYes').click();const bot=NKV2.chars.find(c=>c.name===n);return {n,muted:!!(bot&&bot.muted)};});
await p.screenshot({path:O+'admin-user.jpg',quality:82});
R.give=await e3(()=>{const c0=NKV2.S.coins,b0=NKV2.S.boxes.length;document.querySelector('#admin [data-uo="give"]').click();document.querySelector('#admin #gC').value='1234';document.querySelector('#admin #gB').value='2';document.querySelector('#admin [data-ua="give"]').click();document.getElementById('cfYes').click();return [NKV2.S.coins-c0,NKV2.S.boxes.length-b0];});
R.recover=await e3(()=>{document.querySelector('#admin [data-at="rec"]').click();const n0=NKV2.S.gear.length,c0=NKV2.S.coins;const b=document.querySelector('#admin [data-rr]');if(!b)return 'none';b.click();document.getElementById('cfYes').click();return {gear:NKV2.S.gear.length-n0,coin:NKV2.S.coins-c0,done:!!document.querySelector('#admin .rect tr.dn')};});
await p.screenshot({path:O+'admin-recover.jpg',quality:82});
R.bal=await e3(()=>{document.querySelector('#admin [data-at="bal"]').click();const i=document.querySelector('#admin #bBase');const o=i.value;i.value='abc';i.oninput();const bad=i.classList.contains('bad');i.nextElementSibling.click();const rev=i.value===o;i.value='0.03';i.oninput();document.querySelector('#admin [data-ad="balsave"]').click();const conf=document.getElementById('confirm').classList.contains('show')&&document.querySelector('#confirm .balch')?.textContent;return {bad,rev,conf};});
await p.screenshot({path:O+'admin-balance-confirm.jpg',quality:82});await e3(()=>document.getElementById('cfNo').click());
R.ev=await e3(()=>{document.querySelector('#admin [data-at="ev"]').click();document.querySelector('#admin #evCoin').value='2';document.querySelector('#admin [data-evh="3"]').click();document.querySelector('#admin [data-ad="evsave"]').click();document.getElementById('cfYes').click();return NKV2.V14.evMul();});
await p.screenshot({path:O+'admin-event.jpg',quality:82});
R.ann=await e3(()=>{document.querySelector('#admin [data-at="ann"]').click();document.querySelector('#admin #anM').value='점검 안내: 오늘 밤 11시';document.querySelector('#admin #anT').value='5';document.querySelector('#admin [data-ad="ann"]').click();return {bar:!!document.getElementById('annBar'),hist:document.querySelectorAll('#admin .adt tr').length-1};});
await p.screenshot({path:O+'admin-notice.jpg',quality:82});
R.op=await e3(()=>{document.querySelector('#admin [data-at="op"]').click();const i=document.querySelector('#admin #opQ');i.value=NKV2.chars[2].name.slice(0,2);i.dispatchEvent(new Event('input'));return new Promise(r=>setTimeout(()=>{const h=document.querySelector('#admin [data-ops]');if(!h)return r('nohit');h.click();document.querySelector('#admin [data-opq="CS 상담"]').click();document.querySelector('#admin [data-ad="opadd"]').click();r(JSON.parse(localStorage.getItem('nk_admin_ops')).map(o=>o.r+':'+o.p.length));},400));});
await p.screenshot({path:O+'admin-op.jpg',quality:82});
await e3(()=>{document.querySelector('#admin [data-at="dash"]').click();document.querySelector('#admin [data-chv="1"]').click();});await p.waitForTimeout(300);R.chList=await e3(()=>document.querySelectorAll('#admin .chl tr').length-1);await p.screenshot({path:O+'admin-dash.jpg',quality:82});
await e3(()=>{document.querySelector('#admin [data-at="deck"]').click();});await p.hover('#admin .opt.pv:nth-child(4)');await p.waitForTimeout(500);await p.screenshot({path:O+'admin-deck-hover.jpg',quality:82});
await e3(()=>{document.querySelector('#admin [data-at="map"]').click();});await p.hover('#admin .opts .opt.pv >> nth=1');await p.waitForTimeout(500);await p.screenshot({path:O+'admin-map-hover.jpg',quality:82});
await e3(()=>{document.querySelector('#admin [data-at="time"]').click();});await p.waitForTimeout(300);await p.screenshot({path:O+'admin-time.jpg',quality:82});
R.wx=await e3(()=>{document.querySelector('#admin [name=wxD][value="30"]').click();document.querySelector('#admin [data-wx="snow"]').click();return [NKV2.S.wxOv,Math.round((NKV2.S.wxUntil-Date.now())/60000)];});
await p.close();
console.log(JSON.stringify(R,null,0));console.log('errs',errs);
const ok=R.speed1===1.35&&R.speed50>1.4&&!R.setNoSlider&&R.rod.br!=null&&R.rod.gr!=null&&R.rod.toast&&R.gearLabel>0&&R.sellLog>=1&&R.pinRes.pinned===R.pinRes.oi&&R.pinRes.after===R.pinRes.oi&&R.lu3>=2&&R.lugo&&R.hp1&&R.stTabs.vis&&R.stTabs.to1==='1'&&R.stTabs.to2==='2'&&R.badge[0]==='9+'&&R.badge[1]==='9+'&&R.hm2.menuLeft>=R.hm2.giftRight&&R.hm2.menuTop<20&&R.pinch.d1<R.pinch.d0&&R.adSpeed===2&&R.ban.off&&R.ban.lbl.includes('10시간')&&R.mute.muted&&R.give[0]===1234&&R.give[1]===2&&R.recover.gear===1&&R.bal.bad&&R.bal.rev&&R.bal.conf&&R.ev.coin===2&&R.ann.bar&&R.chList>0&&R.wx[0]==='snow'&&!errs.length;
console.log(ok?'PASS':'FAIL');await b.close();})();
