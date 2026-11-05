// v20 회귀: 의자 앉기·낚시 규칙 (W1), 모닥불 벤치 2인, 봇 자리 남김
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:720}});const errs=[];p.on('pageerror',e=>errs.push(e.message));const ev=(f,a)=>p.evaluate(f,a);
await p.goto('http://localhost:8787/nakmeong.html');await ev(()=>{localStorage.clear();localStorage.setItem('nk_cfg',JSON.stringify({bots:50,deckW:'W1'}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await ev(()=>document.getElementById('go').click());await p.waitForTimeout(1500);
const r={};const d0=await ev(()=>{const st=NKV2.SEATS.find(s=>s.kind==='stool'&&s.deck===NKV2.decks[0]);const d=NKV2.decks[0];NKV2.setPos(d.tip.x+d.ca*.3,d.tip.z+d.sa*.3);return [st.x,st.z];});await p.waitForTimeout(400);
r.tipNoSeat=await ev(()=>!!NKV2.nearSpot());
await ev(([x,z])=>NKV2.setPos(x+.6,z),d0);await p.waitForTimeout(400);r.btn=await ev(()=>getComputedStyle(document.getElementById('sitBtn')).display!=='none'&&document.getElementById('sitBtn').textContent);
await ev(()=>document.getElementById('sitBtn').click());await p.waitForTimeout(500);r.sat=await ev(()=>!!NKV2.mySeat());r.spotWhenSat=await ev(()=>!!NKV2.nearSpot());
await p.addStyleTag({content:'#dc{visibility:hidden}'});await ev(()=>{const m=NKV2.me().o.position;NKV2.setCam(m.x+3,m.y+2.4,m.z+3.4,m.x,m.y+.8,m.z);});await p.waitForTimeout(700);await p.screenshot({path:'/tmp/t32_seat.png'});await ev(()=>NKV2.setCam(null));
await ev(()=>NKV2.fishAction());await p.waitForTimeout(300);r.fishing=await ev(()=>NKV2.fishing().state);
await ev(()=>NKV2.standUp());
// benches: 2 seats per bench, bots leave >=2 free
await p.waitForTimeout(8000);r.bench=await ev(()=>{const B=NKV2.SEATS.filter(s=>s.kind==='bench');return {seats:B.length,free:B.filter(s=>s.occ.length<s.cap).length,over:NKV2.SEATS.filter(s=>s.occ.length>s.cap).length};});
console.log(JSON.stringify(r),'errs',errs.length?errs:'none',(!r.tipNoSeat&&r.sat&&r.spotWhenSat&&r.fishing!=='off'&&r.bench.seats===10&&r.bench.free>=2&&!r.bench.over)?'PASS':'FAIL');await b.close();})();
