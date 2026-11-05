// v21 회귀: 레벨·해금·마이그레이션 / 입력 리셋 / 의자 일어서기 / 토스트·알림 / 동물 다리 / 봇-모닥불 / 모닥불 C2
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));const ev=(f,a)=>p.evaluate(f,a);
const boot=async(pre)=>{await p.goto('http://localhost:8787/nakmeong.html');await ev(pre);await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await ev(()=>document.getElementById('go').click());await p.waitForTimeout(2500);};
const r={};
// 1) 기존 세이브 마이그레이션
await boot(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:20,deckW:'W1'}));localStorage.setItem('nakmeong_v2',JSON.stringify({coins:5000,caught:800,stats:{g:[600,150,40,9,1]},dex:{crucian:{n:5,max:30,gr:[1,0,0,0,0]}},gear:[{id:1,k:'bamboo',q:1,enh:0,star:0,extra:[]},{id:2,k:'dragon',q:1,enh:0,star:0,extra:[]}],rodId:2,rod:'dragon',baits:{worm:-1,frog:-1},bait:'frog',autoFish:false,equip:[],charms:[],char:20,nid:10,tankK:'s',tank:[]}));});
r.mig=await ev(()=>{const S=NKV2.S;return {lv:NKV2.myLv(),keepRod:S.lvKeep.rods.includes('dragon'),keepBait:S.lvKeep.baits.includes('frog'),auto:S.lvKeep.auto,goalFx:S.goalFx,toastSt:S.toastSt,tankFish:S.tankFish};});
// 2) 새 플레이어: 레벨업 보상·해금
await boot(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:50,deckW:'W1'}));});
r.new0=await ev(()=>({lv:NKV2.myLv(),slots:NKV2.lvCharmSlots(),tank:NKV2.lvTankBonus(),auto:document.getElementById('bAutoFish').classList.contains('lk')}));
const c0=await ev(()=>NKV2.S.coins);await ev(()=>NKV2.addXP(NKV2.LV.cum[10]-NKV2.S.xp+5,'테스트'));await p.waitForTimeout(600);
r.lv10=await ev(()=>({lv:NKV2.myLv(),boxes:NKV2.S.boxes.filter(x=>typeof x==='string'),pop:document.getElementById('lvUp').classList.contains('show'),slots:NKV2.lvCharmSlots(),tank:NKV2.lvTankBonus(),hud:document.getElementById('lvB').textContent}));r.coinGain=(await ev(()=>NKV2.S.coins))-c0;
await p.screenshot({path:'/tmp/t33_lvup.png'});await ev(()=>document.getElementById('lvUp').click());
// 3) 토스트 T2 / 알림 G2
await ev(()=>{NKV2._n.toast('✅ 강화 성공! +9');NKV2._n.toast('⛔ 합성 재료/코인이 부족해요');});await p.waitForTimeout(300);
r.toast=await ev(()=>{const q=document.querySelectorAll('#tq .tqi');return {n:q.length,x:!!document.querySelector('#tq .tqx'),bar:!!document.querySelector('#tq .tqb'),cls:[...q].map(e=>e.className)}});
await ev(()=>NKV2.V14?NKV2.V14.goalFx('붕어 박사','','🪙 5,000 · 🎁 상자 2','goal'):0);await p.waitForTimeout(300);r.goal=await ev(()=>{const g=document.getElementById('gq');return g?g.className+' '+g.children.length:'none'});
await p.screenshot({path:'/tmp/t33_notif.png'});
// 4) 입력 리셋 (blur)
await ev(()=>{const d=NKV2.decks[0];NKV2.setPos(d.entry.x,d.entry.z);});await p.keyboard.down('KeyS');await p.waitForTimeout(300);await ev(()=>window.dispatchEvent(new Event('blur')));const pa=await ev(()=>{const q=NKV2.me().o.position;return [q.x,q.z]});await p.waitForTimeout(500);const pb=await ev(()=>{const q=NKV2.me().o.position;return [q.x,q.z]});await p.keyboard.up('KeyS');
r.blurStop=Math.hypot(pa[0]-pb[0],pa[1]-pb[1])<.01;
// 5) 의자 앉았다 이동
const st=await ev(()=>{const s=NKV2.SEATS.find(s=>s.kind==='stool'&&s.deck===NKV2.decks[0]);NKV2.setPos(s.x+.6,s.z);return [s.x,s.z]});await p.waitForTimeout(300);await ev(()=>NKV2.sitOn(NKV2.nearSeat()||NKV2.SEATS.find(s=>s.kind==='stool'&&s.deck===NKV2.decks[0])));await p.waitForTimeout(300);
r.sat=await ev(()=>!!NKV2.mySeat());const q0=await ev(()=>{const q=NKV2.me().o.position;return [q.x,q.z]});
for(const k of ['KeyW','KeyA','KeyS']){await p.keyboard.down(k);await p.waitForTimeout(500);await p.keyboard.up(k);}
const q1=await ev(()=>{const q=NKV2.me().o.position;return [q.x,q.z]});r.unstuck=Math.hypot(q0[0]-q1[0],q0[1]-q1[1]);r.seatAfter=await ev(()=>!!NKV2.mySeat());
// 6) 봇-모닥불 거리 / 모닥불 C2
r.fireMin=99;for(let i=0;i<20;i++){await p.waitForTimeout(400);const m=await ev(()=>{const s=NKV2.SH();return Math.min(...NKV2.bots.map(b=>Math.hypot(b.c.o.position.x-s.x,b.c.o.position.z-s.z)))});r.fireMin=Math.min(r.fireMin,m);}
r.c2=await ev(()=>!!(NKV2.fire()&&NKV2.fire().userData.c2));r.calls=await ev(()=>window.__nk.calls);
// 7) 동물 다리
r.animal=await ev(()=>{const a=NKV2.chars.find(c=>c.legs);if(!a)return 'none';return {legs:a.legs.length}});
const ok=r.mig.lv>1&&r.mig.keepRod&&r.mig.keepBait&&r.mig.auto&&r.mig.goalFx==='G2'&&r.mig.tankFish==='A'&&r.new0.lv===1&&r.new0.slots===2&&r.new0.auto&&r.lv10.lv===10&&r.lv10.boxes.length===2&&r.lv10.pop&&r.lv10.slots===3&&r.lv10.tank===5&&r.coinGain>=5400&&r.toast.n===2&&r.toast.x&&r.toast.bar&&/gG2/.test(r.goal)&&r.blurStop&&r.sat&&r.unstuck>.8&&!r.seatAfter&&r.fireMin>1.6&&r.c2&&r.animal!=='none'&&r.animal.legs===2;
console.log(JSON.stringify(r),'errs',errs.length?errs:'none',ok?'PASS':'FAIL');await b.close();})();
