// v28 가방 B1-A/B1-B: 장착 칸 센터 정렬(DOM 측정, 오차 ≤1px) · 겹침 · PC/모바일 스샷
const {chromium}=require('playwright-core');(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const O='/workspace/nakmeong/shots/v28/';const out={};
for(const [w,h,n] of [[1280,800,'pc'],[390,844,'m'],[360,780,'m360']]){const p=await b.newPage({viewport:{width:w,height:h},isMobile:n!='pc',hasTouch:n!='pc'});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_tut25',JSON.stringify({i:2,chk:1}));localStorage.setItem('nk_ui25',JSON.stringify({duckOn:0}));});await p.reload();await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.evaluate(()=>document.getElementById('go').click());await p.waitForTimeout(2000);
for(const st of ['B1A','B1B']){if(n!='pc'&&st=='B1B')continue;
await p.evaluate(st=>{NK_UI25.set('bagSt',st);document.getElementById('bBag').click();NKV2.bagTab('gear');},st);await p.waitForTimeout(500);
out[n+st]=await p.evaluate(()=>{const R=e=>e.getBoundingClientRect(),d=document.querySelector('.doll28'),g=d.querySelector('.dgrid'),hd=d.querySelector('.dh'),sl=[...d.querySelectorAll('.dslot')],D0=R(d);
 const xs=sl.map(R),L=Math.min(...xs.map(r=>r.left)),Rr=Math.max(...xs.map(r=>r.right)),T=Math.min(...xs.map(r=>r.top)),B=Math.max(...xs.map(r=>r.bottom));
 const cl=R(d.querySelector('[data-ds=cloth]')),hat=R(d.querySelector('[data-ds=hat]')),sh=R(d.querySelector('[data-ds=shoe]')),rod=R(d.querySelector('[data-ds=rod]')),gl=R(d.querySelector('[data-ds=glove]'));
 let ov=0;for(let i=0;i<xs.length;i++)for(let j=i+1;j<xs.length;j++){const a=xs[i],c=xs[j];if(a.left<c.right-.5&&c.left<a.right-.5&&a.top<c.bottom-.5&&c.top<a.bottom-.5)ov++;}
 const card=R(document.querySelector('#bag .card'));const s2=R(document.querySelector('.sum28'));const ovp=(D0.bottom>s2.top+.5&&D0.top<s2.bottom&&D0.right>s2.left+.5&&D0.left<s2.right)?1:0;
 const f=v=>Math.round(v*100)/100;return {padL:f(L-D0.left),padR:f(D0.right-Rr),dx:f((L-D0.left)-(D0.right-Rr)),gapTop:f(T-R(hd).bottom),gapBot:f(D0.bottom-B),dy:f((T-R(hd).bottom)-(D0.bottom-B)),clothCx:f((cl.left+cl.right)/2-(D0.left+D0.right)/2),hatCx:f((hat.left+hat.right)/2-(cl.left+cl.right)/2),shoeCx:f((sh.left+sh.right)/2-(cl.left+cl.right)/2),rowMid:f((rod.top+rod.bottom)/2-(gl.top+gl.bottom)/2),slotOv:ov,dollSumOv:ovp,cardInView:card.left>=0&&card.right<=innerWidth,size:Math.round(xs[0].width)+'x'+Math.round(xs[0].height)};});
await p.screenshot({path:O+'bag-'+st+'-'+n+'.jpg',quality:85});
await (await p.$('.doll28')).screenshot({path:O+'doll-'+st+'-'+n+'.png'});
await p.evaluate(()=>document.querySelector('[data-close=bag]').click());await p.waitForTimeout(300);}
out[n+'err']=errs;await p.close();}
console.log(JSON.stringify(out,null,0));await b.close()})();
