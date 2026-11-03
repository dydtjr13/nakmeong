// node tools/sim-balance.js → v5 (상자 밴드·패시브 포함) / v4 인플레이션/강화/합성 시뮬레이션 (19종, 부적 6개, 장비 옵션)
global.window={};require('../game-data.js');require('../game-data-v3.js');require('../game-data-v4.js');require('../game-data-v5.js');const D=window.NK_DATA,SYS=require('../systems.js');
const rnd=Math.random,N=200000;
const BEST=['luck','expert','big','quick','merchant','treasure'];
function mkS(rodK,lv,charmTier,nCharm,star,pas){const S={coins:0,nid:1,charms:[],equip:[],stones:0,gear:[],baits:{},dex:{},tank:[],stats:{g:[0,0,0,0,0]}};
 if(pas){D.FISH.forEach(f=>S.dex[f.k]={n:99,max:f.max,gr:[1,1,1,1,1]});S.stats.g=[999,999,999,999,99];D.COMBO.list.forEach(c=>c.ks.forEach(k=>S.tank.push({k,g:4})));}
 const g=SYS.makeGear(D,rodK,S.nid++);g.q=1;g.enh=lv;g.star=0;g.extra=[];const sl=()=>SYS.slotCount(D,g);g.star=star||0;
 const pool=['luck','expert','quick','treasure','bait'];for(let i=0;i<sl();i++)g.extra.push({k:pool[i],v:Math.round(SYS.extraMax(D,g,pool[i])*.85*10)/10});
 if(star)g.q=Math.min(1.15,1.08+.02*star);S.gear.push(g);S.rodId=g.id;
 if(charmTier!=null)for(let c=0;c<nCharm;c++){const n=D.CHARM.tierOpts[charmTier],ks=[];for(let i=0;i<n;i++)ks.push(BEST[(c*n+i)%BEST.length]);
  S.charms.push({id:S.nid,tier:charmTier,opts:ks.map(k=>({k,v:D.CHARM.opts[k].cap*(D.CHARM.band[charmTier][0]+D.CHARM.band[charmTier][1])/2}))});S.equip.push(S.nid++);}
 return S;}
function run(name,rodK,baitK,lv,ct,nc,star,pas){const S=mkS(rodK,lv,ct,nc||6,star,pas),r=SYS.gearStats(D,SYS.gearOf(S)),b=D.BAITS.find(x=>x.k===baitK),M=SYS.mods(D,S,r,b);
 let coin=0,rare=0,leg=0,box=0;for(const night of [0,1]){const ws=SYS.weights(D,S,r,b,night),sw=ws.reduce((a,c)=>a+c);
 for(let i=0;i<N/2;i++){let s=rnd()*sw,f=D.FISH[0];for(let j=0;j<ws.length;j++){s-=ws[j];if(s<0){f=D.FISH[j];break;}}
  const cm=Math.min(f.max,f.min-Math.log(1-rnd())*f.scale*M.size);let g=0;f.g.forEach((t,k)=>{if(cm>=t)g=k+1;});const v=Math.round(f.base*Math.pow(cm/f.min,1.5)*D.GRADES[g].m);
  coin+=Math.round(v*M.sell);if(g>=2)rare++;if(g>=3)leg++;if(rnd()<M.box)box++;}}
 const sec=4*M.wait+4;return {name,coin:coin/N,perHour:coin/N*3600/sec,rare:rare/N,leg:leg/N,box:box/N};}
const rows=[run('기본(대나무·지렁이)','bamboo','worm',0,null),run('카본+3·일반부적3','carbon','worm',3,0,3),run('은빛+5★1·희귀부적6','silver','paste',5,2,6,1),run('황금+7★2·영웅부적6','gold','shrimp',7,3,6,2),
 run('용+10★3·전설부적6','dragon','shrimp',10,4,6,3),run('용+10★5·신화부적6(최종)','dragon','shrimp',10,5,6,5),run('[분리] 용+0★0·부적없음','dragon','shrimp',0,null),run('[분리] 용+10★5·부적없음','dragon','shrimp',10,null,0,5),run('[분리] 용+0★0·신화부적6','dragon','shrimp',0,5,6,0),run('[v3 비교] 용+10·신화부적3','dragon','shrimp',10,5,3,0),run('[v5] 별빛+7★2·전설부적6','star','shrimp',7,4,6,2),run('[v5] 기본+패시브 만렙','bamboo','worm',0,null,0,0,1),run('[v5] 최종+패시브 만렙(이론상 최대)','dragon','shrimp',10,5,6,5,1)];
const base=rows[0].perHour;rows.forEach(r=>r.x=r.perHour/base);
let st=0,co=0,tr=0;const T=20000;for(let t=0;t<T;t++){const S={coins:1e12,stones:1e9,gear:[{id:1,k:'dragon',enh:0,extra:[],star:0,q:1}],rodId:1};while(S.gear[0].enh<10){const lv=S.gear[0].enh;st+=D.ENH.stone(lv);co+=D.ENH.coin(lv);tr++;SYS.enhTry(D,S);}}
const enh={stones:st/T,coins:co/T,tries:tr/T,stoneCoin:st/T*D.ENH.stonePrice};
// 합성 ★5까지: 같은 장비 2^5=32개 필요(★0 재료 기준 순차 합성 시 5개 추가 필요 → 대상 1+재료 5) 비용
const synth=D.RODS.map((r,i)=>({k:r.k,n:r.n,mats:5,coin:[0,1,2,3,4].reduce((a,s)=>a+D.GEAR.synthCoin(i,s),0),buy:r.price*5}));
// 상자 1000개 기대 보상
const S0={coins:0,nid:1,charms:[],equip:[],stones:0,gear:[],baits:{}};const cnt={charm:0,rod:0,bait:0,stone:0};for(let i=0;i<20000;i++)SYS.openBox(D,S0).out.forEach(o=>cnt[o.type]++);for(const k in cnt)cnt[k]/=20000;
const out={v5:rows.filter(r=>/v5|기본\(|최종\)/.test(r.name)),rows,enh,synth,box:cnt,coinPerBox:S0.coins/20000};
console.table(rows.map(r=>({구성:r.name,'코인/회':r.coin.toFixed(1),'코인/시':r.perHour.toFixed(0),배수:r.x.toFixed(2),'희귀+':(r.rare*100).toFixed(1)+'%','전설+':(r.leg*100).toFixed(2)+'%','상자':(r.box*100).toFixed(2)+'%'})));
console.log('enh',enh,'synth',synth,'box',cnt,out.coinPerBox);
require('fs').writeFileSync(__dirname+'/../sim-result.js','window.NK_SIM='+JSON.stringify(out)+';');
