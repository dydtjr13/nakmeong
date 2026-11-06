/* v42 백업 — 칭호 배지·저장 버튼 안내를 되돌릴 때 참고.
   게임 코드는 지우지 않았다. 아래 중 하나로 즉시 예전 동작으로 돌아간다.

   1) 주소 뒤에 ?ui=v42
      예: https://fishcozy.com/nakmeong.html?ui=v42
   2) 브라우저 콘솔 또는 설정 전에
      localStorage.setItem('nk_ui_legacy','v42'); location.reload();
   해제:
      localStorage.removeItem('nk_ui_legacy'); location.reload();

   v42 칭호: Lv99 미만은 보라(#6a4fc0 / 글자 #fff / 테두리 #5a3fb0), Lv99만 금색.
   v42 저장 버튼: 안내 창 없이 바로 저장하고 '저장 완료' 토스트만 띄운다.
*/
(function () {
  window.NK_V42 = {
    titleStyle: function (n, L) {
      if (L >= 99) return { n: n, bg: "#f6c542", fg: "#3a2600", bd: "#fff" };
      return { n: n, bg: "#6a4fc0", fg: "#fff", bd: "#5a3fb0" };
    },
    saveClick: "S.savedAt=Date.now(); save(); toast('💾 저장 완료');",
  };
})();
