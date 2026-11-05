// node tools/sim-tx-v26.js → v26 초월 물고기 기대 수 (1시간·10시간, 직접/자동). 캐스팅/시 = 3600/(4×입질대기+4) (sim-balance와 같은 식), 자동은 입질대기×1.25 + 반응 0.9초
const fs=require('fs'),path=require('path');global.window=global;global.localStorage={getItem:()=>null};const R=p=>path.join(__dirname,'..',p);
const h=fs.readFileSync(R('nakmeong.html'),'utf8');[...h.matchAll(/src="(game-data[^"?]*|systems\.js)[^"]*"/g)].map(m=>m[1]).forEach(f=>eval(fs.readFileSync(R(f),'utf8')));
const D=window.NK_DATA,SYS=window.NK_SYS;const BEST=['luck','expert','big','quick','merchant','treasure'];
function mkS(rodK,lv,charmTier,nCharm,star){const S={coins:0,nid:1,charms:[],equip:[],stones:0,gear:[],baits:{},dex:{},tank:[],stats:{g:[0,0,0,0,0]}};
 const g=SYS.makeGear(D,rodK,S.nid++);g.q=1;g.enh=lv;g.star=star||0;g.extra=[];const pool=['luck','expert','quick','treasure','bait'];for(let i=0;i<SYS.slotCount(D,g);i++)g.extra.push({k:pool[i%pool.length],v:Math.round(SYS.extraMax(D,g,pool[i%pool.length])*.85*10)/10});S.gear.push(g);S.rodId=g.id;
 if(charmTier!=null)for(let c=0;c<nCharm;c++){const n=D.CHARM.tierOpts[charmTier],ks=[];for(let i=0;i<n;i++)ks.push(BEST[(c*n+i)%BEST.length]);S.charms.push({id:S.nid,tier:charmTier,opts:ks.map(k=>({k,v:D.CHARM.opts[k].cap*(D.CHARM.band[charmTier][0]+D.CHARM.band[charmTier][1])/2}))});S.equip.push(S.nid++);}
 return S;}
const C=[['대나무+0 (기본, 비교용)','bamboo','worm',0,null,0,0],['용왕+10★3·전설부적6 (비교용)','dragon','shrimp',10,4,6,3],['심해+0 (부적 없음)','abyss','shrimp',0,null,0,0],['천룡+0 (부적 없음)','heaven','shrimp',0,null,0,0],['화룡+0 (부적 없음)','fire','shrimp',0,null,0,0],['천룡+10★5·신화부적6 (최종)','heaven','shrimp',10,5,6,5]];
const rows=C.map(([n,rk,bk,lv,ct,nc,st])=>{const S=mkS(rk,lv,ct,nc,st),r=SYS.gearStats(D,SYS.gearOf(S)),b=D.BAITS.find(x=>x.k===bk),M=SYS.mods(D,S,r,b);
 const boost=Math.min(D.TX.boostMax,1+M.ch.luck/100+(r.luck||0)*4),p=((D.TX.rodP||{})[rk]||D.TX.p)*boost,cm=3600/(4*M.wait+4),ca=3600/(4*M.wait*D.AUTO.waitMul+4+.9);
 return {구성:n,'기본 확률':(((D.TX.rodP||{})[rk]||D.TX.p)*100).toFixed(4)+'%','보정':'×'+boost.toFixed(2),'1회 확률':(p*100).toFixed(4)+'%','직접 캐스팅/시':cm.toFixed(0),'직접 1시간':(p*cm).toFixed(2),'직접 10시간':(p*cm*10).toFixed(2),'직접 10시간 1마리 이상':((1-Math.pow(1-p,cm*10))*100).toFixed(0)+'%','자동 캐스팅/시':ca.toFixed(0),'자동 1시간':(p*ca).toFixed(2),'자동 10시간':(p*ca*10).toFixed(2),'자동 10시간 1마리 이상':((1-Math.pow(1-p,ca*10))*100).toFixed(0)+'%'};});
console.table(rows);fs.writeFileSync(R('tools/sim-tx-v26.json'),JSON.stringify(rows,null,1));
