// v18 밸런스: 상자 기본 확률(보물탐지 300%에서 직접 낚시 시간당 약 17개) + 강화 실패 하락 확률을 레벨이 오를수록 높게
(function(D){D.BOX.base=0.018;
 const dp=lv=>lv<8?0:Math.min(.6,.05+(lv-8)*.05);
 D.ENH.fail=lv=>({p:dp(lv),floor:0});
 D.ENH.failTxt=lv=>{const p=dp(lv);return p?`${Math.round(p*100)}% 확률로 1단계 하락`:'유지';};
 D.ENH.dropP=dp;})(window.NK_DATA);
