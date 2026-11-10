// v26 낚싯대: L1 천룡·L3 화룡(초월) · L2 은하수(별빛↔용왕 사이 새 등급 '은하') · L4 심해(신화) · 상자 확률 · 초월 물고기 확률 보정 · 10개 합성(단계 올리기)
(function(D){
 const R=D.RODS,at=k=>R.findIndex(r=>r.k===k);
 const NEW=[
  // speed = 입질 대기 배수, size = 대어 배수, luck×10 = 희귀어종 +%
  {after:'star',k:'galaxy',n:'은하수 낚싯대',price:14000,speed:.6,size:1.55,luck:.095,slotN:3,rg:'은하',rc:'#6a5cff'},
  {after:'dragon',k:'abyss',n:'심해 낚싯대',price:35000,speed:.5,size:1.7,luck:.11,slotN:4,rg:'신화',rc:'#ef5f8f',tx:1},
  {after:'abyss',k:'heaven',n:'천룡 낚싯대',price:60000,speed:.45,size:1.75,luck:.13,slotN:5,rg:'초월',rc:'#ff2d8a',tx:1,noSynth:1},
  {after:'heaven',k:'fire',n:'화룡 낚싯대',price:60000,speed:.45,size:1.9,luck:.11,slotN:5,rg:'초월',rc:'#ff2d8a',tx:1,noSynth:1},
  // v103 마스터 낚싯대: 23종 변이 5종 완성 보상 · 레벨 제한 없음 · 초월과 신화 사이
  {after:'fire',k:'master',n:'마스터 낚싯대',price:0,speed:.47,size:1.8,luck:.12,slotN:5,rg:'마스터',rc:'#2fb8a6',tx:1,noSynth:1,reqLv:1,noShop:1}];
 NEW.forEach(o=>{if(at(o.k)>=0)return;const r=Object.assign({coin:0,box:0,boxOnly:true},o);delete r.after;R.splice(at(o.after)+1,0,r);});
 // 기존 상자 전용 낚싯대 등급 표시
 Object.assign(R.find(r=>r.k==='gold'),{rg:'전설',rc:'#f4a62a'});Object.assign(R.find(r=>r.k==='star'),{rg:'별빛',rc:'#4a5ab8'});Object.assign(R.find(r=>r.k==='dragon'),{rg:'용왕',rc:'#c46cf2'});
 // 설명 다시 쓰기
 const RAND={galaxy:1,dragon:1,abyss:2,heaven:2,fire:2,master:2};
 R.forEach(r=>{if(!r.rg)return;const L=[];if(r.speed<1)L.push(`⚡빠른입질 ${Math.round((1-r.speed)*100)}%`);if(r.size>1)L.push(`📏대어 ${Math.round((r.size-1)*100)}%`);if(r.luck)L.push(`🌟희귀어종 ${Math.round(r.luck*1000)}%`);
  if(RAND[r.k])L.push(`🎲랜덤 옵션 ${RAND[r.k]}`);if(r.tx)L.push('✦초월 물고기 0.066%');r.desc=L.join(' · ')+` (옵션 ${r.slotN}슬롯)`;});
 Object.assign(D.GEAR.slots,RAND);Object.assign(D.GEAR.mul,{galaxy:.285,abyss:.33,heaven:.36,fire:.36,master:.345});
 // 상자: 전설 상자에 은하수, 신화 상자에 은하수·용왕·심해·천룡·화룡 (천룡·화룡은 극악)
 D.BOX.rodPool[4]=['gold','star','galaxy'];
 D.BOX.rodPool[5]=['galaxy','dragon','abyss'];
 D.BOX.txRod=1/10000; // v27: 천룡·화룡 각각 상자 1만 개당 1개 (상자 등급과 별개 굴림)
 Object.assign(D.BOX.rodKeep,{galaxy:.35,galaxy_fb:'star',dragon:.3,dragon_fb:'galaxy',abyss:.1,abyss_fb:'dragon',heaven:.05,heaven_fb:'dragon',fire:.05,fire_fb:'dragon'});
 // 초월 물고기: 천룡·화룡·심해 장착 시 기본 확률 0.0066% → 0.066% (행운 보정 최대 ×1.8은 그대로)
 D.TX.rodP={abyss:.00066,heaven:.00066,fire:.00066,master:.00066};
 // 10개 합성(단계 올리기): 상자 전용 낚싯대만 · 초월은 합성 불가
 D.GEAR.up={gold:{to:'star',n:10,coin:5000},star:{to:'galaxy',n:10,coin:20000},galaxy:{to:'dragon',n:10,coin:50000},dragon:{to:'abyss',n:10,coin:100000}};
})(window.NK_DATA);
