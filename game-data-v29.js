// v29: 장비 40종 (모자·옷·신발·장갑 × 10레벨) + 세트 효과. 50=리조트, 60=선장 (서로 교체)
(function(D){
 const LV=[1,10,20,30,40,50,60,70,80,90], T=['hat','cloth','shoe','glove'];
 const SN=['밀짚 소풍','캔버스 산책','체크 캠핑','노랑 우비','호숫가 탐험가','리조트','선장','헤리티지 플라이','요트 클럽','선셋 레이크'];
 const GC=['#aab4c0','#5fc48a','#4ea3ea','#e8b400','#5f9a4a','#5ab4e6','#30508a','#8a6a3a','#c49a2a','#ff7a8a'];
 const IN={hat:['밀짚 모자','버킷햇','털모자','어부 비모자','탐험가 모자','파나마 햇','선장 모자','트위드 헌팅캡','보터 햇','선셋 썬햇'],
  cloth:['면 티셔츠','줄무늬 셔츠','체크 셔츠','노랑 우비','낚시 조끼','린넨 리조트 셔츠','선장 코트','왁스 필드 재킷','요트 블레이저','선셋 캐시미어 가디건'],
  shoe:['짚신','캔버스화','가죽 부츠','노랑 장화','물막이 장화','보트 슈즈','선장 부츠','가죽 웨이딩 부츠','데크 슈즈','선셋 로퍼'],
  glove:['면장갑','손가락 장갑','가죽 장갑','고무 장갑','네오프렌 장갑','썬 피싱 장갑','선장 장갑','스웨이드 장갑','세일링 장갑','캐시미어 장갑']};
 // 주옵션: 모자=경험치, 옷=판매가, 신발=코인, 장갑=상점할인
 const MAIN={hat:['xp',l=>+(1+l*.17).toFixed(1)],cloth:['sell',l=>+(1+l*.19).toFixed(1)],shoe:['coin',l=>+(1+l*.15).toFixed(1)],glove:['shop',l=>+(1+l*.09).toFixed(1)]};
 const MN={xp:'경험치',sell:'판매가',coin:'코인 획득',shop:'상점 할인'};
 const SETFX=[
  {xp:3},{sell:4},{coin:5},{sell:5,quickW:5},{treasure:10},{sell:8,coin:8},{shop:4,xp:6},{big:3,xp:10},{sell:10,shop:6},{sell:12,coin:12,xp:10}];
 const items=[];
 LV.forEach((lv,i)=>T.forEach(slot=>{const [ok,fn]=MAIN[slot];items.push({k:slot+lv,slot,lv,set:i,n:IN[slot][i],sn:SN[i],c:GC[i],img:'img/eq/'+slot+lv+'.png',opt:{[ok]:fn(lv)},optN:MN[ok]+' +'+fn(lv)+'%'});}));
 D.WEAR={slots:['hat','cloth','glove','shoe'],slotN:{hat:'모자',cloth:'옷',glove:'장갑',shoe:'신발'},items,byK:Object.fromEntries(items.map(x=>[x.k,x])),
  sets:SN.map((n,i)=>({i,n,lv:LV[i],c:GC[i],fx:SETFX[i],need:T.map(s=>s+LV[i])})),
  // 상자 드롭: 영웅+ 에서 장비 확률 (레벨대 ≈ 상자 등급)
  boxRate:[0,0,.04,.08,.12,.16], // 일반~신화
  boxLv: [[1],[1,10],[10,20],[20,30,40],[40,50,60],[60,70,80,90]]};
})(window.NK_DATA);
