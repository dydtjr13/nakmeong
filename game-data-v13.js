// 낚멍 v13 밸런스: 도감 재정렬(흔함→희귀, 같은 희귀도는 가격순) · 가격 재설정 · 합산효과 순서 · 상인 상한 200%
(function(D){
 // 평균 판매가 ∝ (30/출현가중치)^1.15 (밤 전용 ×1.2), 전체 평균 판매가는 v12와 동일하게 유지
 const NB={chambungeo:8,crucian:2.5,pirami:7,bluegill:4.5,tteokbungeo:8.5,kkeuri:14,nuchi:13,carp:9.5,bass:13.5,moraemuji:18.5,donjagae:15.5,gangjunchi:20.5,leather:26.5,catfish:24.5,snakehead:45,trout:37,mandarin:33,kkeokji:58.5,eel:110.5};
 D.FISH.forEach(f=>{f.gb=f.base;if(NB[f.k]!=null)f.base=NB[f.k];}); // gb: 진행도 게이트용 기존 기준값(게이트 구간 유지)
 const EV=f=>{let s=0;for(let i=0;i<200;i++){const cm=f.min+(f.max-f.min)*Math.pow((i+.5)/200,1.6)*.85;s+=f.base*Math.pow(cm/f.min,1.5);}return s/200;};
 D.FISH.forEach(f=>f.ev=Math.round(EV(f)));
 D.FISH.sort((a,b)=>b.w-a.w||a.ev-b.ev);
 // 합산효과·옵션 표시 순서: 낚시 → 경제
 const O=D.CHARM.opts,ord=['quick','big','luck','expert','bait','treasure','appraise','master','merchant'],no={};ord.forEach(k=>{if(O[k])no[k]=O[k];});Object.keys(O).forEach(k=>{if(!no[k])no[k]=O[k];});D.CHARM.opts=no;
 ['treasure','appraise','master'].forEach(k=>no[k].cat='경제');
 no.merchant.total=200;
})(window.NK_DATA);
