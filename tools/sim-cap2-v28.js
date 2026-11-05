// 합산 상한 방향성 비교: 현행(hard min) / A 상한 1.6배 / B 옵션 0.6배 / C 상한 1.6배 + 수확체감(무릎=상한 60%)
const rows=require('./sim-cap-v28.json');const r1=v=>Math.round(v*10)/10;
const soft=(x,cap)=>{const K=cap*.6;return x<=K?x:K+(cap-K)*(1-Math.exp(-(x-K)/(cap-K)));};
const out=rows.map(o=>{const bal=2*o.cap+o.rodExtra,all=6*o.cap+o.rodExtra,eq=bal+o.cap*.8/* 장비 4부위+세트 추가분(예상) */;
 return {옵션:o.n,'부적1개 최대':o.cap,'균형 세팅':r1(bal),'몰빵 세팅':r1(all),'장비 추가 후':r1(eq),'현행 상한':o.total,'현행 적용(균형)':r1(Math.min(bal,o.total)),'A 1.6배':r1(Math.min(eq,o.total*1.6)),'B 옵션0.6':r1(Math.min(eq*.6,o.total)),'C 수확체감':r1(soft(eq,o.total*1.6))};});
console.table(out);require('fs').writeFileSync(__dirname+'/sim-cap2-v28.json',JSON.stringify(out,null,1));
