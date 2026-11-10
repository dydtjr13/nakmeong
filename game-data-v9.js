// 낚멍 v9: 영구 루어 가격 상향 (tools/sim-bait.js 기준, 초반 회수 약 55~70분)
(function(D){const P={lure:6000,nightlure:8000,frog:12000};D.BAITS.forEach(b=>{if(P[b.k])b.price=P[b.k];});})(window.NK_DATA);
