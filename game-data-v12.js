// 낚멍 v12 밸런스: 낚싯대 옵션 사용자 지정(빠른입질·대어·희귀어종) — '입질 대기'는 '빠른입질'로 통합
(function(D){
 // speed = 입질 대기 배수(빠른입질 -x% → 1-x), size = 대어 배수, luck×10 = 희귀어종 +%
 const R={bamboo:{speed:1,size:1,luck:0},carbon:{speed:.9,size:1,luck:0},silver:{speed:.85,size:1,luck:0},coral:{speed:.8,size:1,luck:0},
  sakura:{speed:.75,size:1.3,luck:0},gold:{speed:.7,size:1.4,luck:.05},star:{speed:.65,size:1.5,luck:.09},dragon:{speed:.55,size:1.6,luck:.1}};
 const SLOT={bamboo:0,carbon:1,silver:1,coral:1,sakura:2,gold:3,star:3,dragon:4};
 D.RODS.forEach(r=>{const o=R[r.k];if(!o)return;Object.assign(r,o,{coin:0,box:0});delete r.fixed;
  const L=[];if(o.speed<1)L.push(`⚡빠른입질 ${Math.round((1-o.speed)*100)}%`);if(o.size>1)L.push(`📏대어 ${Math.round((o.size-1)*100)}%`);if(o.luck)L.push(`🌟희귀어종 ${Math.round(o.luck*1000)}%`);if(r.k==='dragon')L.push('🎲랜덤 옵션 1');
  r.slotN=SLOT[r.k];r.desc=L.length?L.join(' · ')+(SLOT[r.k]>=3?` (옵션 ${SLOT[r.k]}슬롯)`:''):'옵션 없음';});
 // 랜덤 추가옵션: 용왕만 1개 (기존 판매가·상자 계열은 이 풀로 이동)
 Object.assign(D.GEAR.slots,{bamboo:0,carbon:0,silver:0,coral:0,sakura:0,gold:0,star:0,dragon:1});
 D.BOX.rodKeep.dragon=.3; // 상자 옵션 제거로 박스 수 감소 → 용왕 곡선 보정(120h 중앙값 유지)
 D.GEAR.fixedBase=true; // 기본옵션은 표기 수치 그대로(품질 굴림 미적용), ★합성 보너스만 추가
 D.GEAR.pool=['treasure','merchant','appraise','master','expert','bait'];
})(window.NK_DATA);
