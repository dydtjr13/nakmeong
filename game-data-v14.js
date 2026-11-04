// v14 데이터: 미끼 영웅↑ 제외 · 용왕은 신화 상자 전용 · 보물탐지/감정의달인 300% · 계절 한정 어종 4종 · 관리자 밸런스 덮어쓰기
(function(D){
 D.BOX.baitMaxTier=2; // 0일반 1고급 2희귀까지만 미끼 (영웅·전설·신화 X)
 for(let t=0;t<5;t++)D.BOX.rodPool[t]=D.BOX.rodPool[t].filter(k=>k!=='dragon');
 D.BOX.rodPool[5]=['star','dragon'];
 D.CHARM.opts.treasure.total=300;D.CHARM.opts.master.total=300;
 // 낚싯대 추가옵션 하한·상한: 상자 등급 밴드 × 옵션 최대치 (합성 시에도 상한 고정)
 D.GEAR.optRange=(g,k)=>{const mx=D.CHARM.opts[k].cap*D.GEAR.mul[g.k],xb=D.GEAR.xBand[g.tier==null?1:g.tier];return [Math.round(mx*xb[0]*10)/10,Math.round(mx*10)/10];};
 const T=k=>D.FISH.find(f=>f.k===k);
 const SF=[['sakura_trout','벚꽃송어','trout','cherry',null,'#f4a6c4','봄 · 벚꽃 바람 때만 출현'],
  ['rainbow_ayu','무지개은어','kkeuri','storm','summer','#7fd4d0','여름 · 소나기 때만 출현'],
  ['maple_mandarin','단풍쏘가리','mandarin','leaf',null,'#e8743a','가을 · 낙엽 때만 출현'],
  ['ice_smelt','얼음빙어','pirami','snow',null,'#bcd8ee','겨울 · 함박눈 때만 출현']];
 SF.forEach(([k,n,src,wx,season,col,desc])=>{if(T(k))return;const o=Object.assign({},T(src),{k,n,col,desc,wx,season,img:'img/fish/'+k+'.png',src:'v14 계절 한정',w:8,rare:true,limited:true});
  o.base=Math.round(T(src).base*1.6*10)/10;if(o.ev)o.ev=Math.round(T(src).ev*1.6);D.FISH.push(o);});
 // 관리자 모드 밸런스 덮어쓰기 (localStorage nk_admin_bal)
 try{const B=JSON.parse(localStorage.getItem('nk_admin_bal')||'null');if(B){if(B.boxBase!=null)D.BOX.base=B.boxBase;if(B.tiers)B.tiers.forEach((w,i)=>{if(D.BOX.tiers[i])D.BOX.tiers[i].w=w;});
  if(B.caps)for(const k in B.caps)if(D.CHARM.opts[k])D.CHARM.opts[k].total=B.caps[k];if(B.fish)for(const k in B.fish){const f=T(k);if(f){if(B.fish[k].w!=null)f.w=B.fish[k].w;if(B.fish[k].base!=null)f.base=B.fish[k].base;}}
  if(B.txp!=null)D.TX.p=B.txp;if(B.coinMul)D.SHOP_SELL_RATE*=B.coinMul;}}catch(e){}
})(window.NK_DATA);
