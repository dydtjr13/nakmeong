// node tools/sim-bait.js → 미끼/장비별 코인·시간, 회수 시간(payback) 비교로 영구 루어 적정가 산정
global.window={};['game-data','game-data-v3','game-data-v4','game-data-v5','game-data-v7','game-data-v8'].forEach(f=>require('../'+f+'.js'));const D=window.NK_DATA,SYS=require('../systems.js');
const N=+(process.env.N||120000);const rnd=Math.random;
function mk(rodK,enh,caught){const S={coins:0,nid:1,charms:[],equip:[],stones:0,gear:[],baits:{},dex:{},tank:[],stats:{g:[0,0,0,0,0]},caught:caught||0};const g=SYS.makeGear(D,rodK,S.nid++);g.q=1;g.enh=enh||0;g.star=0;g.extra=[];S.gear.push(g);S.rodId=g.id;return S;}
function cph(rodK,baitK,enh,caught){const S=mk(rodK,enh,caught),r=SYS.gearStats(D,SYS.gearOf(S)),b=D.BAITS.find(x=>x.k===baitK),M=SYS.mods(D,S,r,b);let coin=0;
 for(const night of [0,1]){const ws=SYS.weights(D,S,r,b,night),sw=ws.reduce((a,c)=>a+c);for(let i=0;i<N/2;i++){let s=rnd()*sw,f=D.FISH[0];for(let j=0;j<ws.length;j++){s-=ws[j];if(s<0){f=D.FISH[j];break;}}
  const cm=Math.min(f.max,f.min-Math.log(1-rnd())*f.scale*M.size);let gg=0;f.g.forEach((t,k)=>{if(cm>=t)gg=k+1;});coin+=Math.round(f.base*Math.pow(cm/f.min,1.5)*D.GRADES[gg].m*M.sell);}}
 const sec=4*M.wait+4,per=coin/N,cost=b.qty?b.price/b.qty:0;return {per,cost,h:(per-cost)*3600/sec,casts:3600/sec};}
const out=[];for(const [rk,enh,c,lab] of [['bamboo',0,0,'초반: 대나무'],['carbon',3,300,'초중반: 카본+3'],['silver',5,800,'중반: 은빛+5'],['gold',7,1500,'후반: 황금+7']]){const base=cph(rk,'worm',enh,c);
 for(const bk of ['worm','paste','shrimp','corn','golden','lure','nightlure','frog']){const x=cph(rk,bk,enh,c);out.push({구간:lab,미끼:D.BAITS.find(b=>b.k===bk).n,'순코인/시':Math.round(x.h),'지렁이 대비 +/시':Math.round(x.h-base.h)});}}
console.table(out);
const rods=D.RODS.map((r,i)=>i?{낚싯대:r.n,가격:r.price,'이전 대비 +코인/시':0}:null).filter(Boolean);
for(let i=1;i<D.RODS.length;i++){const a=cph(D.RODS[i-1].k,'worm',0,0).h,b=cph(D.RODS[i].k,'worm',0,0).h;rods[i-1]['이전 대비 +코인/시']=Math.round(b-a);rods[i-1]['회수(분)']=b>a?Math.round(D.RODS[i].price/(b-a)*60):'∞';}
console.table(rods);
