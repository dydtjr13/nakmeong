const {chromium}=require('playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const O='/workspace/nakmeong/shots/v29/';const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(String(e.message)));
await p.goto('http://localhost:8787/nakmeong.html');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('nk_tut25',JSON.stringify({i:99,chk:1}));});await p.reload();
await p.waitForFunction(()=>!document.getElementById('go').disabled,null,{timeout:180000});await p.evaluate(()=>document.getElementById('go').click());await p.waitForTimeout(2000);
const info=await p.evaluate(()=>{
  const D=NK_DATA,S=NKV2.S;S.wear=[];
  ['hat1','cloth1','shoe1','glove1','hat50','cloth60'].forEach(k=>{const it=D.WEAR.byK[k];S.wear.push({id:S.nid++,k,slot:it.slot,lv:it.lv,eq:false});});
  S.wear.filter(w=>w.lv===1).forEach(w=>w.eq=true);
  NKV2.save();NKV2.openBag('bag');
  return {tabs:[...document.querySelectorAll('#bag [data-btab]')].map(b=>b.textContent.trim()),wearN:D.WEAR.items.length,swap50:D.WEAR.byK.hat50.n+'/'+D.WEAR.byK.hat50.sn,swap60:D.WEAR.byK.hat60.n+'/'+D.WEAR.byK.hat60.sn};
});
await p.waitForTimeout(400);await p.screenshot({path:O+'bag-gear.jpg',quality:85});
await p.click('#bag [data-btab="wear"]');await p.waitForTimeout(400);await p.screenshot({path:O+'bag-wear.jpg',quality:85});
const align=await p.evaluate(()=>{const slots=[...document.querySelectorAll('.doll28 .dslot')];return slots.map(s=>{const r=s.getBoundingClientRect(),img=s.querySelector('img.di');const ir=img&&img.getBoundingClientRect();return {slot:s.dataset.ds,err:ir?+(Math.abs((ir.left+ir.width/2)-(r.left+r.width/2))).toFixed(2):null,hasImg:!!img};});});
await p.evaluate(()=>NKV2.openBag('box'));await p.waitForTimeout(300);await p.screenshot({path:O+'box-tabs.jpg',quality:85});
const boxTabs=await p.evaluate(()=>[...document.querySelectorAll('#bag [data-btab]')].map(b=>b.textContent.trim()));
const noSt=await p.evaluate(()=>{const D=NK_DATA,SYS=NKV2.SYS,out={};[0,1,2,3,4,5].forEach(tier=>{let stones=0,wear=0,n=100;const bak=SYS.rollTier;SYS.rollTier=()=>tier;for(let i=0;i<n;i++){const S={nid:1,charms:[],gear:[],baits:{},stones:0,coins:0,wear:[]};const r=SYS.openBox(D,S,Math.random,'x');r.out.forEach(o=>{if(o.type==='stone'&&o.st)stones++;if(o.type==='wear')wear++;});}SYS.rollTier=bak;out[tier]={stones,wear};});return out;});
console.log(JSON.stringify({info,align,boxTabs,noSt,errs},null,1));await b.close();})();
