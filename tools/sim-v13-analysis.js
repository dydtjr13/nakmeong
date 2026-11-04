// v13 분석: 19(보물탐지/감정의달인), 27(상자 확률), 28(도감 완성 시간)
const D=require('./probe-v13.js'),SYS=require('../systems.js');const out={};
const tiers=D.BOX.tiers;const dist=m=>{const w=tiers.map((t,i)=>t.w*(i>=2?1+m/100:1)),s=w.reduce((a,b)=>a+b);return w.map(x=>+(x/s*100).toFixed(2));};
out.tierNames=tiers.map(t=>t.n);out.master={};[0,50,100,150,200,250,300].forEach(m=>out.master[m]=dist(m));
out.streak=(()=>{const s=D.BOX.streakTiers.reduce((a,b)=>a+b);return D.BOX.streakTiers.map(x=>+(x/s*100).toFixed(2));})();
out.treasure={};for(const cph of [210,275])for(const T of [0,60,120,200,250,300]){const drop=cph*D.BOX.base*(1+T/100);out.treasure[cph+'/'+T]={drop:+drop.toFixed(2),withStreak:+(drop+cph/D.BOX.streakEvery).toFixed(2)};}
// 28: 도감 완성 MC
const RI=k=>D.RODS.findIndex(r=>r.k===k);const sched=[[0,'bamboo',0],[.3,'carbon',0],[.5,'coral',1],[1.1,'sakura',2],[6.4,'gold',6],[29.8,'star',11],[120,'dragon',15]];
function run(cph,mode){const S={charms:[],equip:[],gear:[],dex:{},caught:0};const b=D.BAITS[0];let h=0,got=new Set(),gg={},need=D.FISH.length;const step=1/cph;
 for(let n=0;n<cph*2000;n++){h+=step;const sc=sched.filter(x=>x[0]<=h).pop();if(n%50===0){const g0=SYS.makeGear(D,sc[1],1);g0.q=1;g0.enh=sc[2];g0.extra=[];var r=SYS.gearStats(D,g0);S.caught=n;var ws=SYS.weights(D,S,r,b,(Math.floor(h*3600/400)%3)===2?1:0),sw=ws.reduce((a,b)=>a+b),M=SYS.mods(D,S,r,b);}
  let s=Math.random()*sw,f=D.FISH[0];for(let j=0;j<ws.length;j++){s-=ws[j];if(s<0){f=D.FISH[j];break;}}
  if(mode==='sp'){got.add(f.k);if(got.size===need)return h;}else{const cm=SYS.sizeRoll(D,f,M.size,Math.random);let gr=0;f.g.forEach((th,k)=>{if(cm>=th)gr=k+1;});gg[f.k+gr]=1;if(Object.keys(gg).length===need*5)return h;}}
 return 2000;}
const q=(a,p)=>{a=a.slice().sort((x,y)=>x-y);return +a[Math.floor(a.length*p)].toFixed(1)};
for(const mode of ['sp','gr']){const a=[];for(let i=0;i<(mode==='sp'?300:60);i++)a.push(run(230,mode));out['dex_'+mode]={p50:q(a,.5),p90:q(a,.9)};}
console.log(JSON.stringify(out,null,1));
