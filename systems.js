// 낚멍 순수 로직 v4 (브라우저·node 공용) — 부적 / 상자 / 장비(낚싯대) 옵션·합성·강화
(function(root){
const SYS={};
const R1=x=>Math.round(x*10)/10;
SYS.gearOf=S=>(S.gear||[]).find(g=>g.id===S.rodId)||null;
SYS.makeGear=(D,k,id,rnd=Math.random,tier)=>{const G=D.GEAR;tier=tier==null?(G.shopTier||1):tier;const qb=G.qBand?G.qBand[tier]:G.q;const g={id,k,tier,q:Math.round((qb[0]+(qb[1]-qb[0])*rnd())*1000)/1000,star:0,enh:0,extra:[],lock:false};for(let i=0;i<G.slots[k];i++)SYS.addExtra(D,g,rnd);g.br=Math.round(rnd()*1000)/1000;SYS.gearGrade(D,g);return g;};
// v22: 기본옵션 랜덤(표기 수치의 하한~상한) + 옵션 수치 합으로 등급(일반~신화)
SYS.GRADES=[['일반','#9aa3ad'],['고급','#5fc48a'],['희귀','#4ea3ea'],['영웅','#a066e0'],['전설','#f4a62a'],['신화','#ef5f8f']];SYS.GRADE_CUT=[.35,.65,.83,.93,.98];
SYS.bRange=D=>D.GEAR.bRange||[.85,1.15];SYS.baseMul=(D,g)=>{if(!g||g.br==null)return 1;const r=SYS.bRange(D);return r[0]+(r[1]-r[0])*g.br;};
SYS.gearScore=(D,g)=>{const xb=D.GEAR.xBand?D.GEAR.xBand[g.tier==null?1:g.tier]:[.4,1],xs=g.extra.map(e=>{const mx=SYS.extraMax(D,g,e.k)||1;return Math.max(0,Math.min(1,(e.v/mx-xb[0])/((xb[1]-xb[0])||1)));}),br=g.br==null?.5:g.br;if(!xs.length)return br;const xr=xs.reduce((a,b)=>a+b,0)/xs.length,m=.6*br+.4*xr,sd=Math.sqrt((.36+.16/xs.length)/12),z=(m-.5)/sd,t=1/(1+.3275911*Math.abs(z)/Math.SQRT2),e=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-.284496736)*t+.254829592)*t*Math.exp(-z*z/2);return .5*(1+Math.sign(z)*e);};
SYS.gearGrade=(D,g)=>{if(g.gr==null){const s=SYS.gearScore(D,g);g.gr=SYS.GRADE_CUT.filter(c=>s>=c).length;}return g.gr;};
SYS.slotCount=(D,g)=>D.GEAR.slots[g.k]+D.GEAR.starSlot.filter(s=>g.star>=s).length;
SYS.extraMax=(D,g,ok)=>D.CHARM.opts[ok].cap*D.GEAR.mul[g.k];
SYS.addExtra=(D,g,rnd=Math.random)=>{const pool=D.GEAR.pool.filter(k=>!g.extra.some(e=>e.k===k));if(!pool.length)return;const k=pool[Math.floor(rnd()*pool.length)];const xb=D.GEAR.xBand?D.GEAR.xBand[g.tier==null?1:g.tier]:[.4,1];g.extra.push({k,v:R1(SYS.extraMax(D,g,k)*(xb[0]+(xb[1]-xb[0])*rnd()))});};
SYS.gearStats=(D,g)=>{const r=D.RODS.find(x=>x.k===(g?g.k:'bamboo')),m=g?(D.GEAR.fixedBase?SYS.baseMul(D,g):g.q)*(1+D.GEAR.starBonus*g.star):1;
  const B=SYS.enhBonus(D,g?g.enh:0);return {k:r.k,n:r.n,id:g&&g.id,star:g?g.star:0,enh:g?g.enh:0,q:g?g.q:1,size:(1+(r.size-1)*m)*(1+B.size),speed:1-(1-r.speed)*m,luck:r.luck*m+B.luck,coin:(r.coin||0)*m+B.coin,box:(r.box||0)+B.box,price:r.price,bt:B};};
// v11 강화 돌파 보너스(+5/+10/+15/+20 누적)
SYS.enhBonus=(D,lv)=>{const o={size:0,luck:0,coin:0,box:0};((D.ENH&&D.ENH.bt)||[]).forEach(b=>{if(lv>=b.lv)for(const k in o)o[k]+=b[k]||0;});return o;};
SYS.charmSum=(D,S,noPassive)=>{const o={};for(const k in D.CHARM.opts)o[k]=0;(S.equip||[]).forEach(id=>{const c=(S.charms||[]).find(x=>x.id===id);if(c)c.opts.forEach(p=>o[p.k]+=p.v);});
  const g=SYS.gearOf(S);if(g){g.extra.forEach(e=>o[e.k]+=e.v);const fx=(D.RODS.find(r=>r.k===g.k)||{}).fixed;if(fx)for(const k in fx)o[k]+=fx[k];}
  for(const k in o)o[k]=R1(Math.min(o[k],D.CHARM.opts[k].total));
  if(D.PASSIVE&&!noPassive){const P=SYS.passives(D,S).sum;for(const k in o)o[k]=R1(o[k]+P[k]);}return o;};
SYS.makeCharm=(D,tier,id,rnd=Math.random)=>{const C=D.CHARM,keys=Object.keys(C.opts),n=C.tierOpts[tier],opts=[];const pool=keys.slice();
  for(let i=0;i<n;i++){const k=pool.splice(Math.floor(rnd()*pool.length),1)[0];if(C.band){const b=C.band[tier];opts.push({k,v:R1(C.opts[k].cap*(b[0]+(b[1]-b[0])*rnd()))});}else{const mx=C.opts[k].cap*C.tierMul[tier];const lo=tier===5?.75:C.rollMin;opts.push({k,v:R1(mx*(lo+(1-lo)*rnd()))});}}
  return {id,tier,opts,lock:false};};
SYS.rollTier=(D,masterPct=0,rnd=Math.random)=>{const ws=D.BOX.tiers.map((t,i)=>t.w*(i>=2?1+masterPct/100:1));let s=rnd()*ws.reduce((a,b)=>a+b,0);for(let i=0;i<ws.length;i++){s-=ws[i];if(s<0)return i;}return 0;};
SYS.boxChance=(D,ch)=>D.BOX.base*(1+ch.treasure/100);
SYS.openBox=(D,S,rnd=Math.random,src)=>{const ch=SYS.charmSum(D,S),tier=src==='streak'&&D.BOX.streakTiers?SYS.rollTier({BOX:{tiers:D.BOX.streakTiers.map(w=>({w}))}},ch.master,rnd):Math.max(typeof src==='string'&&src.slice(0,2)==='lv'?+src.slice(2):0,SYS.rollTier(D,ch.master,rnd)),out=[],RW=src==='streak'&&D.BOX.streakReward||D.BOX.reward;
  const one=()=>{let x=rnd();
    if((x-=RW.charm)<0){const c=SYS.makeCharm(D,tier,S.nid++,rnd);S.charms.push(c);out.push({type:'charm',c});return;}
    if((x-=RW.rod)<0){const k=SYS.boxRod(D,tier,rnd),g=SYS.makeGear(D,k,S.nid++,rnd,tier);S.gear.push(g);out.push({type:'rod',g});return;}
    if((x-=RW.bait)<0&&tier<=(D.BOX.baitMaxTier==null?9:D.BOX.baitMaxTier)){const [k,n]=D.BOX.baitPool[tier];S.baits[k]=Math.max(0,S.baits[k]||0)+n;out.push({type:'bait',k,n});return;}
    const st=D.BOX.stones[tier],co=D.BOX.coins[tier];S.stones=(S.stones||0)+st;S.coins+=co;out.push({type:'stone',st,co});};
  one();if(rnd()<ch.appraise/100){one();out[out.length-1].bonus=true;}
  // v27: 초월 낚싯대(천룡·화룡)는 상자 등급과 상관없이 상자 1개마다 각각 1/10,000 따로 굴림
  if(D.BOX.txRod){const x=rnd();if(x<D.BOX.txRod*2){const k=x<D.BOX.txRod?'heaven':'fire',g=SYS.makeGear(D,k,S.nid++,rnd,5);S.gear.push(g);out.push({type:'rod',g,tx:true});}}
  return {tier,out};};
SYS.enhLv=S=>{const g=SYS.gearOf(S);return g?g.enh:0;};
SYS.enhTry=(D,S,rnd=Math.random)=>{const g=SYS.gearOf(S);if(!g)return {r:'none'};const lv=g.enh,E=D.ENH;if(lv>=E.max)return {r:'max'};const st=E.stone(lv),co=E.coin(lv);
  if((S.stones||0)<st||S.coins<co)return {r:'lack',st,co};S.stones-=st;S.coins-=co;
  if(rnd()*100<E.rate[lv]){g.enh=lv+1;return {r:'ok',lv:lv+1};}
  const F=E.fail?E.fail(lv):{p:lv>=E.dropFrom?E.dropChance:0,floor:0};if(F.p>0&&lv-1>=F.floor&&rnd()<F.p){g.enh=lv-1;return {r:'drop',lv:lv-1};}return {r:'fail',lv};};
// 합성: 같은 종류 낚싯대 2개 → 대상 ★+1, 품질 상승, 추가옵션 강화/슬롯 해금. 재료의 강화(+)는 대상에 높은 쪽 유지
SYS.synthCost=(D,g)=>D.GEAR.synthCoin(D.RODS.findIndex(r=>r.k===g.k),g.star);
SYS.synth=(D,S,tid,mid,rnd=Math.random)=>{const t=S.gear.find(g=>g.id===tid),m=S.gear.find(g=>g.id===mid),G=D.GEAR;
  if(!t||!m||t===m||t.k!==m.k)return {r:'bad'};if(m.lock||m.id===S.rodId)return {r:'matlock'};if(t.star>=G.starMax)return {r:'max'};const cost=SYS.synthCost(D,t);if(S.coins<cost)return {r:'lack',cost};
  S.coins-=cost;S.gear=S.gear.filter(g=>g!==m);const before=SYS.slotCount(D,t);t.star++;t.q=Math.min(1.15,Math.round((Math.max(t.q,m.q)+.02)*1000)/1000);t.enh=Math.max(t.enh,m.enh);
  t.extra.forEach(e=>e.v=R1(Math.min(SYS.extraMax(D,t,e.k),e.v*G.starUp)));const added=SYS.slotCount(D,t)-before;for(let i=0;i<added;i++)SYS.addExtra(D,t,rnd);return {r:'ok',star:t.star,added};};
SYS.dismantle=(D,S,maxTier)=>{const L=S.charms.filter(c=>c.tier<=maxTier&&!c.lock&&!S.equip.includes(c.id));let co=0,st=0;L.forEach(c=>{co+=D.CHARM.dismantle.coin[c.tier];st+=D.CHARM.dismantle.stone[c.tier];});
  if(typeof ILOG_HOOK==='function')L.forEach(c=>ILOG_HOOK('dis','charm',c,D.CHARM.dismantle.coin[c.tier],{st:D.CHARM.dismantle.stone[c.tier]}));S.charms=S.charms.filter(c=>!L.includes(c));S.coins+=co;S.stones+=st;return {n:L.length,co,st};};
SYS.mods=(D,S,rod,bait)=>{const ch=SYS.charmSum(D,S),lv=rod.enh||0;
  return {ch,size:rod.size*bait.size*(1+lv*D.ENH.size)*(1+ch.big/100),wait:bait.speed*rod.speed*(1-lv*D.ENH.speed)*(1-ch.quick/100),
   sell:D.SHOP_SELL_RATE*(1+ch.merchant/100)*(1+(rod.coin||0)),box:SYS.boxChance(D,ch)*(1+(rod.box||0))};};
SYS.progress=(D,S,rod)=>{const G=D.GATE;if(!G)return 1;const ri=Math.max(0,D.RODS.findIndex(r=>r.k===rod.k)),rr=Math.min(1,ri/Math.max(1,D.RODS.findIndex(r=>r.k==='dragon')))/* v26: 용왕 이후 낚싯대가 늘어도 진행도 기준 유지 */;return Math.min(1,G.wRod*rr+G.wEnh*Math.min(1,(rod.enh||0)/10)+G.wCaught*Math.min(1,(S.caught||0)/G.caughtMax));};
SYS.gateMul=(D,f,P)=>{const G=D.GATE;if(!G||!G.on)return 1;const fb=f.gb!=null?f.gb:f.base,e=fb>=G.hi.base?G.hi.e:fb>=G.mid.base?G.mid.e:1;return e+(1-e)*P;};
SYS.weights=(D,S,rod,bait,night=0)=>{const ch=SYS.charmSum(D,S),N=night>.5,bb=bait.nightOnly&&!N?{}:bait.boost,P=SYS.progress(D,S,rod);return D.FISH.map(f=>{if(f.nightOnly&&!N)return 0;if(f.wx&&(S.__wx!==f.wx||(f.season&&S.__season!==f.season)))return 0;return SYS.gateMul(D,f,P)*f.w*(bb[f.k]||1)*(f.rare?(1+rod.luck*10)*(1+ch.luck/100):1)*(f.expert?1+ch.expert/100:1)*(N&&f.night?f.night:1);});};
// 구버전 세이브 이관
SYS.migrate=(D,S)=>{S.gear=S.gear||[];if(!S.gear.length){(S.rods||['bamboo']).forEach(k=>{const g=SYS.makeGear(D,k,S.nid++);g.q=1;g.enh=(S.enh||{})[k]||0;S.gear.push(g);if(k===S.rod)S.rodId=g.id;});}
  if(!S.gear.find(g=>g.id===S.rodId))S.rodId=S.gear[0].id;if(!S.stats){S.stats={g:[0,0,0,0,0]};for(const k in (S.dex||{}))S.dex[k].gr.forEach((v,j)=>S.stats.g[j]+=v?1:0);}S.presets=S.presets||[[],[],[]];if(S.preset==null)S.preset=0;S.boxDesign=S.boxDesign||1;(S.charms||[]).forEach(c=>{if(c.lock==null)c.lock=false;});};
// ── v5: 패시브 (도감 업적 + 어항 조합) ──
SYS.comboState=(D,tank)=>D.COMBO.list.map(c=>{const best=c.ks.map(k=>{const fs=(tank||[]).filter(f=>f.k===k);return fs.length?Math.max(...fs.map(f=>f.g)):-1;});const on=best.every(g=>g>=0),lv=on?Math.min(4,...best):-1,m=on?D.COMBO.mult[lv]:0;
  const e={};for(const k in c.e)e[k]=R1(c.e[k]*m);return {c,best,on,lv,e,have:best.filter(g=>g>=0).length};});
SYS.passives=(D,S)=>{const sum={};for(const k in D.CHARM.opts)sum[k]=0;S.stats=S.stats||{g:[0,0,0,0,0]};
  const ach=(D.ACH||[]).map(a=>{const [c,n]=a.p(S);const done=c>=n;if(done)for(const k in a.e)sum[k]+=a.e[k];return {a,c:Math.min(c,n),n,done};});
  const combo=D.COMBO?SYS.comboState(D,S.cslot?Object.values(S.cslot):S.tank):[];combo.forEach(x=>{if(x.on)for(const k in x.e)sum[k]+=x.e[k];});
  const raw=Object.assign({},sum);for(const k in sum)sum[k]=R1(Math.min(sum[k],(D.PASSIVE.cap[k]||0)));return {ach,combo,sum,raw};};
// ── v5: 부적 합성 (같은 등급 5개 → 다음 등급 / 신화 3개 → 다른 신화) ──
SYS.synthPool=(D,S,tier)=>S.charms.filter(c=>c.tier===tier&&!c.lock&&!S.equip.includes(c.id)&&!(S.presets||[]).some(p=>p.includes(c.id))).sort((a,b)=>a.opts.reduce((x,o)=>x+o.v/D.CHARM.opts[o.k].cap,0)-b.opts.reduce((x,o)=>x+o.v/D.CHARM.opts[o.k].cap,0));
SYS.charmSynth=(D,S,tier,rnd=Math.random)=>{const need=tier>=5?D.CHARM.synth.mythNeed:D.CHARM.synth.need,pool=SYS.synthPool(D,S,tier),cost=D.CHARM.synth.coin[tier];
  if(pool.length<need)return {r:'lack',need,have:pool.length};if(S.coins<cost)return {r:'coin',cost};const used=pool.slice(0,need);S.coins-=cost;S.charms=S.charms.filter(c=>!used.includes(c));
  const nt=Math.min(5,tier+1),c=SYS.makeCharm(D,nt,S.nid++,rnd);S.charms.push(c);return {r:'ok',used,c,from:tier};};

// v10 크기 굴림: 신화 구간(f.soft 이상)은 최대치로 '점근'하도록 압축 → 최대치 고착(clamp) 질량 제거, 신화 기준 상향이 실제로 작동
SYS.sizeRoll=(D,f,size,rnd=Math.random)=>{let cm=f.min-Math.log(1-rnd())*f.scale*size;const s0=f.soft;if(s0!=null&&cm>s0){const M=f.max-s0;cm=s0+M*(1-Math.exp(-(cm-s0)/M));}if(f.mythP!=null&&f.mythP<1&&cm>=f.g[3]&&rnd()>=f.mythP)cm=f.g[3]-.1-rnd()*.15*(f.g[3]-(f.soft||f.min));return Math.min(f.max,cm);};
// v10 상자 낚싯대: 상위 낚싯대는 keep 확률을 통과해야 지급, 실패 시 한 단계 아래로
SYS.boxRod=(D,tier,rnd=Math.random)=>{const pl=D.BOX.rodPool[tier];let k=pl[Math.floor(rnd()*pl.length)];const K=D.BOX.rodKeep||{},ord=D.RODS.map(r=>r.k);
  for(let i=0;i<8&&K[k]!=null&&rnd()>=K[k];i++){const lower=ord.slice(0,ord.indexOf(k)).filter(x=>K[x]==null||x!==k);k=K[k+'_fb']||lower[lower.length-1];if(!pl.includes(k))break;/* v26: 풀 밖으로 한 번 내려가면 멈춤 */}return k;};

// v10 수집 목표 판정
SYS.goalProg=(D,S,g)=>{const dx=S.dex||{},hasG=(k,m)=>dx[k]&&dx[k].gr.some((v,i)=>v&&i>=m);
  if(g.t==='set'){const n=g.ks.filter(k=>hasG(k,g.minG)).length;return [n,g.ks.length];}
  if(g.t==='species')return [Math.min(g.cnt,D.FISH.filter(f=>dx[f.k]).length),g.cnt];
  if(g.t==='caught')return [Math.min(g.cnt,S.caught||0),g.cnt];
  if(g.t==='gradeSp')return [Math.min(g.cnt,D.FISH.filter(f=>hasG(f.k,g.g)).length),g.cnt];
  if(g.t==='myth')return [Math.min(g.n,((S.stats&&S.stats.g)||[])[4]||0),g.n];return [0,1];};
SYS.goalDone=(D,S,g)=>{const [a,b]=SYS.goalProg(D,S,g);return a>=b;};
root.NK_SYS=SYS;if(typeof module!=='undefined')module.exports=SYS;
})(typeof window!=='undefined'?window:globalThis);
