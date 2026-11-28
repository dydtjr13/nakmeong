/* v250: 진주(캐시 재화) C안 아이콘 — 상단 재화·상점·확인 창·보상·관리자에서 같이 써요 */
(function(){
  const Q='?v250';
  const SRC={
    16:'img/ui/pearl-16.png'+Q,
    32:'img/ui/pearl-32.png'+Q,
    64:'img/ui/pearl-64.png'+Q,
    128:'img/ui/pearl-128.png'+Q,
    256:'img/ui/pearl-256.png'+Q
  };
  const SRCSET='img/ui/pearl-32.png'+Q+' 32w, img/ui/pearl-64.png'+Q+' 64w, img/ui/pearl-128.png'+Q+' 128w, img/ui/pearl-256.png'+Q+' 256w';
  function src(px){
    px=+px||18;
    if(px<=16) return SRC[16];
    if(px<=20) return SRC[32];
    if(px<=32) return SRC[64];
    if(px<=64) return SRC[128];
    return SRC[256];
  }
  function img(px){
    px=Math.max(12, +px||18);
    return '<img class="pearl-ico" src="'+src(px*2)+'" srcset="'+SRCSET+'" sizes="'+px+'px" width="'+px+'" height="'+px+'" alt="진주" draggable="false">';
  }
  function fmt(n){ return (+n||0).toLocaleString('ko-KR'); }
  function amt(n, px){
    return '<span class="pearl-amt">'+img(px==null?18:px)+'<b>'+fmt(n)+'</b></span>';
  }
  function bal(){
    try{
      const S=(window.__nkShop&&__nkShop.S)||(window.NK89&&NK89.S)||window.S;
      return +((S&&S.pearls)||0);
    }catch(e){ return 0; }
  }
  window.NK_PEARL={Q:Q,src:src,img:img,amt:amt,fmt:fmt,bal:bal,SRC:SRC};
})();
