// node tools/sim-time.js [players=300] → 플레이 시간별(10분/30분/1시간/24시간) 기대치 표 (v9 데이터 기준)
// 가상 플레이어 정책: 잡은 물고기 전량 판매, 상자 즉시 개봉, 부적은 등급 높은 6개 장착(나머지 분해),
// 다음 낚싯대 살 돈이 생기면 구매·장착, 남는 코인/강화석으로 강화(비용 2배 이상 보유 시), 미끼는 지렁이 고정.
global.window={};['game-data','game-data-v3','game-data-v4','game-data-v5','game-data-v7','game-data-v8','game-data-v9','game-data-v10','game-data-v11','game-data-v12','game-data-v13','game-data-v14','game-data-v18'].forEach(f=>require('../'+f+'.js'));
const D=window.NK_DATA,SYS=require('../systems.js'),rnd=Math.random,NP=+(process.argv[2]||300);
const GT={},ENHT={5:[],10:[],15:[],20:[]};const MARK=[[600,'10분'],[1800,'30분'],[3600,'1시간'],[28800,'8시간'],[86400,'24시간'],[432000,'120시간']].filter(m=>m[0]<=(+process.env.MAXH||120)*3600),AUTO=!!process.env.AUTO,FIRST={gold:[],star:[],dragon:[],sakura:[],coral:[]},RI=k=>D.RODS.findIndex(r=>r.k===k);
const acc=MARK.map(()=>({g:[0,0,0,0,0],tx:0,txAny:0,box:[0,0,0,0,0,0],coin:0,earned:0,rod:{},enh:0,P:0,charmT:0}));
for(let p=0;p<NP;p++){const S={coins:0,nid:1,charms:[],equip:[],stones:0,gear:[],baits:{},dex:{},tank:[],stats:{g:[0,0,0,0,0]},caught:0,earned:0};
 const g0=SYS.makeGear(D,'bamboo',S.nid++);g0.q=1;g0.enh=0;g0.extra=[];S.gear.push(g0);S.rodId=g0.id;
 let t=0,mi=0,ws,sw,r,M,b=D.BAITS.find(x=>x.k==='worm'),dirty=true,night=false,cnt={g:[0,0,0,0,0],tx:0,box:[0,0,0,0,0,0]};
 const refresh=()=>{r=SYS.gearStats(D,SYS.gearOf(S));M=SYS.mods(D,S,r,b);ws=SYS.weights(D,S,r,b,night);if(AUTO)ws=ws.map((w,j)=>D.FISH[j].rare||D.FISH[j].expert?w*D.AUTO.rareMul:w);sw=ws.reduce((a,c)=>a+c);dirty=false;};
 const manage=()=>{// 장비 성장
  const cur=SYS.gearOf(S),ci=RI(cur.k),nx=D.RODS.slice(ci+1).find(r=>!r.boxOnly);
  if(nx&&S.coins>=nx.price&&RI(nx.k)===ci+1){S.coins-=nx.price;const g=SYS.makeGear(D,nx.k,S.nid++);g.enh=Math.min(cur.enh,3);S.gear=[g];S.rodId=g.id;dirty=true;}
  const g=SYS.gearOf(S);for(let k=0;k<3;k++){if(g.enh>=D.ENH.max)break;const st=D.ENH.stone(g.enh),co=D.ENH.coin(g.enh);if(S.stones>=st&&S.coins>=co*2){SYS.enhTry(D,S);dirty=true;}else break;}
  // 부적: 등급 높은 순 6개
  S.charms.sort((a,b)=>b.tier-a.tier);S.equip=S.charms.slice(0,6).map(c=>c.id);if(S.charms.length>12){SYS.dismantle(D,S,S.charms[6].tier);}};
 for(;mi<MARK.length;){const nt=Math.floor(t/400)%3===2;if(nt!==night){night=nt;dirty=true;}if(dirty)refresh();
  let s=rnd()*sw,f=D.FISH[0];for(let j=0;j<ws.length;j++){s-=ws[j];if(s<0){f=D.FISH[j];break;}}
  const cm=SYS.sizeRoll(D,f,M.size,rnd);let gr=0;f.g.forEach((th,k)=>{if(cm>=th)gr=k+1;});
  const boost=Math.min(D.TX.boostMax,1+M.ch.luck/100+(r.luck||0)*4);let mul=D.GRADES[gr].m;if(rnd()<D.TX.p*boost){cnt.tx++;mul=D.TX.m;}else cnt.g[gr]++;
  const v=Math.round(f.base*Math.pow(cm/f.min,1.5)*mul),c=Math.round(v*M.sell);S.coins+=c;S.earned+=c;S.caught++;S.stats.g[gr]++;
  if(!S.dex[f.k])S.dex[f.k]={n:0,max:0,gr:[0,0,0,0,0]};S.dex[f.k].n++;S.dex[f.k].gr[gr]=1;
  const day=Math.floor(t/28800);if(S.gday!==day){S.gday=day;S.gN=0;}const streak=D.BOX.streakEvery&&(S.caught+1)%D.BOX.streakEvery===0&&(!D.BOX.dailyCap||S.gN<D.BOX.dailyCap);if(streak)S.gN++;for(const src of [rnd()<M.box*(AUTO?D.AUTO.boxMul:1)?'drop':null,streak?'streak':null])if(src){const o=SYS.openBox(D,S,rnd,src==='streak'?'streak':null);cnt.box[o.tier]++;S.gear=S.gear.filter(x=>x.id===S.rodId||RI(x.k)>RI(SYS.gearOf(S).k));const bx=S.gear.find(x=>x.id!==S.rodId);if(bx){bx.enh=Math.max(bx.enh,SYS.gearOf(S).enh);S.rodId=bx.id;S.gear=[bx];}dirty=true;}
  if(S.caught%10===0&&D.GOALS){S.goals=S.goals||{};D.GOALS.forEach(g=>{if(!S.goals[g.id]&&SYS.goalDone(D,S,g)){S.goals[g.id]=1;(GT[g.id]=GT[g.id]||[])[p]=t/3600;S.coins+=g.r.co||0;S.stones+=g.r.st||0;for(let j=0;j<(g.r.bx||0);j++){const o=SYS.openBox(D,S,rnd);cnt.box[o.tier]++;}}});}
  t+=(D.BITE?Math.max(D.BITE.min,(D.BITE.base[0]+rnd()*(D.BITE.base[1]-D.BITE.base[0]))*M.wait)+4:4*M.wait+4)*(AUTO?D.AUTO.waitMul:1);{const ri=RI(SYS.gearOf(S).k),el=SYS.gearOf(S).enh;for(const k in ENHT)if(ENHT[k][p]==null&&el>=+k)ENHT[k][p]=t/3600;for(const k in FIRST)if(FIRST[k][p]==null&&ri>=RI(k))FIRST[k][p]=t/3600;}if(S.caught%10===0){manage();}
  while(mi<MARK.length&&t>=MARK[mi][0]){const A=acc[mi],G=SYS.gearOf(S);cnt.g.forEach((x,i)=>A.g[i]+=x);cnt.box.forEach((x,i)=>A.box[i]+=x);A.tx+=cnt.tx;A.txAny+=cnt.tx>0;A.earned+=S.earned;
   const key=D.RODS[RI(G.k)].n+' +'+G.enh;A.rod[key]=(A.rod[key]||0)+1;A.P+=SYS.progress(D,S,r);A.charmT+=S.charms.slice(0,6).reduce((a,c)=>a+c.tier,0)/6;mi++;}}}
const GN=D.GRADES.map(g=>g.n),BN=D.BOX.tiers.map(t=>t.n),f1=x=>x<10?x.toFixed(2):x<100?x.toFixed(1):Math.round(x).toLocaleString();
const out=MARK.map(([s,n],i)=>{const A=acc[i],top=Object.entries(A.rod).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>`${k}(${Math.round(v/NP*100)}%)`).join(', ');
 return {시간:n,...Object.fromEntries(GN.map((g,j)=>[g,f1(A.g[j]/NP)])),초월:f1(A.tx/NP),'초월≥1 확률':(A.txAny/NP*100).toFixed(1)+'%',...Object.fromEntries(BN.map((b,j)=>['상자·'+b,f1(A.box[j]/NP)])),'누적 코인':Math.round(A.earned/NP).toLocaleString(),'장비(최빈)':top,'진행도':(A.P/NP).toFixed(2),'부적 평균등급':(A.charmT/NP).toFixed(2)};});
const med=a=>{const x=[...a].sort((p,q)=>p-q);return x.length?x[Math.floor(x.length/2)]:null;};
const first=Object.fromEntries(Object.entries(FIRST).map(([k,a0])=>{const a=Array.from({length:NP},(_,i)=>a0[i]==null?1e9:a0[i]);const got=a.filter(x=>x<1e9).length;const m=med(a);return [k,{획득비율:(got/NP*100).toFixed(0)+'%',중앙값h:m<1e9?m.toFixed(1):'>'+(+process.env.MAXH||120)}];}));
console.log(JSON.stringify(out,null,1));const enh=Object.fromEntries(Object.entries(ENHT).map(([k,a0])=>{const a=Array.from({length:NP},(_,i)=>a0[i]==null?1e9:a0[i]);const m=med(a);return ['+'+k,{달성률:(a.filter(x=>x<1e9).length/NP*100).toFixed(0)+'%',중앙값h:m<1e9?m.toFixed(1):'>'+(+process.env.MAXH||120)}];}));console.log('enh',JSON.stringify(enh));out.push({enh});console.log('first',JSON.stringify(first));const goals=D.GOALS.map(g=>{const a=Array.from({length:NP},(_,i)=>(GT[g.id]||[])[i]??1e9),m=med(a),got=a.filter(x=>x<1e9).length;return {목표:g.n,달성률:(got/NP*100).toFixed(0)+'%',중앙값h:m<1e9?m.toFixed(1):'>'+(+process.env.MAXH||120)};});console.table(goals);out.push({goals});out.push({first});
require('fs').writeFileSync(__dirname+'/sim-time-result'+(AUTO?'-auto':'')+'.json',JSON.stringify(out,null,1));
