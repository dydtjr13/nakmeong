// node tools/sim-box-v27.js → 천룡·화룡(각 1/10,000) 상자 획득 시뮬 + 상자 1만 개까지 걸리는 시간 (레벨대·직접/자동)
const fs=require('fs'),path=require('path');global.window=global;global.localStorage={getItem:()=>null};const R=p=>path.join(__dirname,'..',p);
const h=fs.readFileSync(R('nakmeong.html'),'utf8');[...h.matchAll(/src="(game-data[^"?]*|systems\.js)[^"]*"/g)].map(m=>m[1]).forEach(f=>eval(fs.readFileSync(R(f),'utf8')));
const D=window.NK_DATA,SYS=window.NK_SYS;
// 1) 실제 openBox로 200만 개 열기
const S={coins:0,nid:1,charms:[],equip:[],gear:[],baits:{},stones:0};let N=2e6,c={heaven:0,fire:0},t5={};for(let i=0;i<N;i++){const r=SYS.openBox(D,S,Math.random);r.out.forEach(o=>{if(o.type==='rod'){if(o.tx)c[o.g.k]++;else if(r.tier===5)t5[o.g.k]=(t5[o.g.k]||0)+1;}});S.gear.length=0;S.charms.length=0;}
console.log('200만 상자:',c,'→ 천룡 1/'+Math.round(N/c.heaven),'화룡 1/'+Math.round(N/c.fire),'신화상자 낚싯대',t5);
// 2) 상자/시간: 캐스팅/시 × 상자확률 0.018×(1+보물탐지%) × (자동 0.8) + 연속 낚시 100마리당 1개(하루 10개 상한)
const B=[['초반 Lv1~15 (대나무·부적 없음)',450,364,0],['중반 Lv20~40 (산호~황금·희귀부적, 보물탐지 60%)',629,512,60],['후반 Lv55+ (용왕+10·전설부적, 보물탐지 150%)',705,573,150],['최종 (천룡+10·신화부적, 보물탐지 300%)',769,626,300]];
const rows=B.map(([n,cm,ca,t])=>{const bm=cm*D.BOX.base*(1+t/100),ba=ca*D.BOX.base*(1+t/100)*D.AUTO.boxMul;const day=(b,c)=>b*3+Math.min(10,c*3/100);// 하루 3시간 플레이 기준(연속 상자 포함)
 return {구간:n,'직접 상자/시':bm.toFixed(1),'자동 상자/시':ba.toFixed(1),'직접 1만 개(시간)':Math.round(1e4/bm),'자동 1만 개(시간)':Math.round(1e4/ba),'하루 3시간 직접(일)':Math.round(1e4/day(bm,cm)),'하루 3시간 자동(일)':Math.round(1e4/day(ba,ca))};});
console.table(rows);fs.writeFileSync(R('tools/sim-box-v27.json'),JSON.stringify({c,N,t5,rows},null,1));
