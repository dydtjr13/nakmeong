// 피쉬레스트 v23: 모바일 가용 화면 최대화 (전체 화면 API · 홈 화면 추가 · visualViewport)
(function(){const d=document,de=d.documentElement,ua=navigator.userAgent,iOS=/iP(hone|od|ad)/.test(ua)||(/Mac/.test(ua)&&navigator.maxTouchPoints>1),
 mob=()=>matchMedia('(pointer:coarse)').matches||innerWidth<=700,
 standalone=()=>matchMedia('(display-mode: standalone),(display-mode: fullscreen)').matches||navigator.standalone===true,
 can=()=>!!(de.requestFullscreen||de.webkitRequestFullscreen)&&(d.fullscreenEnabled!==false),
 isFull=()=>!!(d.fullscreenElement||d.webkitFullscreenElement);
 const go=()=>{if(isFull()||standalone())return true;if(!can())return false;try{const p=(de.requestFullscreen||de.webkitRequestFullscreen).call(de,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{});return true;}catch(e){return false;}};
 const note=()=>!mob()?'PC는 F11 키로도 켜고 끌 수 있어요':standalone()?'홈 화면 앱으로 실행 중이에요 (주소창 없음)':can()?'안드로이드 크롬·삼성 인터넷 등: 전체 화면 지원 (뒤로 가기/아래로 쓸면 해제될 수 있어요)':iOS?'아이폰 Safari는 웹 전체 화면을 막아 둬서, 공유 › 홈 화면에 추가로 열면 주소창 없이 쓸 수 있어요':'이 브라우저는 전체 화면을 지원하지 않아요';
 const vv=()=>{const h=(window.visualViewport?visualViewport.height:innerHeight);de.style.setProperty('--vvh',h+'px');d.body&&d.body.classList.toggle('vshort',mob()&&h<700);d.body&&d.body.classList.toggle('vtiny',mob()&&h<600);};
 addEventListener('resize',vv);window.visualViewport&&visualViewport.addEventListener('resize',vv);addEventListener('DOMContentLoaded',vv);vv();
 window.NK_FULL={go,note,can,standalone,isFull,iOS,auto:S=>{if(mob()&&S&&S.mobFull!==false)go();}};})();
