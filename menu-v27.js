// 피쉬레스트 v27: 하단 메뉴 재배치 + 후원 버튼
// - 하단 바: 상점 · 어항 · 자동낚시 · 상자 · 가방 (버튼 수·크기·간격은 그대로, 도감 자리에 상자가 들어감)
// - 도감: 아이콘만, 위 메뉴 줄 게시판 왼쪽 / 후원(☕): 도감 왼쪽
// - '하단 메뉴 재배치 백업' = 설정 › 하단 메뉴 › "v26 배치(백업)" 또는 localStorage nk_ui25.menu27=0 → 이 파일이 아무것도 바꾸지 않아 v26 그대로
//   (코드 백업: 커밋 dff6d05 = 재배치 전 마지막 상태)
(function(){const $=id=>document.getElementById(id),U=()=>window.NK_UI25,on=()=>!U()||String(U().get('menu27'))!=='0';
 const ORIG={};
 function don(){let m=$('donM');if(!m){m=document.createElement('div');m.id='donM';m.className='modal';document.body.appendChild(m);m.onclick=e=>{if(e.target===m||e.target.closest('[data-x]'))m.classList.remove('show');};}
  const C=window.NK_DONATE||{};const pay=C.link||C.acct?`${C.qr?`<div class="dqr"><img src="${C.qr}" alt="QR"></div>`:''}${C.acct?`<div class="dacct">${C.acct} <button data-cp>복사</button></div>`:''}${C.link?`<p><a class="btn acc" href="${C.link}" target="_blank" rel="noopener">후원 페이지 열기</a></p>`:''}`:'<div class="dready">후원 방법(QR·계좌·링크)을 준비하고 있어요.</div>';
  m.innerHTML=`<div class="card donw"><button class="close" data-x>×</button><div class="hd">☕ 개발자에게 커피 한 잔</div><p class="msg">피쉬코지는 혼자 만드는 작은 게임이에요.<br>재밌게 즐기셨다면 커피 한 잔으로 응원해 주세요 🙂</p>${pay}<p class="ft">후원은 언제나 선택이에요. 안 해도 모든 기능을 똑같이 즐길 수 있어요.</p></div>`;
  const cp=m.querySelector('[data-cp]');if(cp)cp.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(C.acct);cp.textContent='복사됨';};if(window.NK_EMOJI)try{NK_EMOJI.parse(m);}catch(_){}m.classList.add('show');}
 function apply(){const mn=$('mMain'),sy=$('mSys'),bd=$('bBoard'),dex=$('bDex');if(!mn||!sy||!bd||!dex||!$('bAutoFish'))return setTimeout(apply,400);
  document.body.classList.toggle('mv27',on());
  if(!ORIG.dex){ORIG.dex=dex.innerHTML;ORIG.order=[...mn.children].map(e=>e.id);}
  let box=$('bBox');if(!box){box=document.createElement('button');box.id='bBox';box.title='상자';box.innerHTML='<b class="mi"><img class="bxi" src="img/box/t0.png" alt=""></b><small class="ml">상자</small>';box.onclick=e=>{e.stopPropagation();try{NKV2.openBag('box');}catch(_){try{NKV2.bagTab('box');$('bBag')&&$('bBag').click();}catch(e2){}}};}
  let dn=$('bDon');if(!dn){dn=document.createElement('button');dn.id='bDon';dn.title='후원 (커피 한 잔)';dn.onclick=e=>{e.stopPropagation();don();};}
  const d3=U()&&U().get('donSt')==='d3';dn.className=bd.className+(d3?' d3':'');dn.innerHTML=d3?'<b class="mi">☕</b><span class="dt">커피 한 잔<small>개발자 응원하기</small></span>':'<b class="mi">☕</b><small class="ml">후원</small>';
  if(on()){['bShop','bTank','bAutoFish'].forEach(id=>mn.appendChild($(id)));mn.appendChild(box);mn.appendChild($('bBag'));dex.className=bd.className;sy.insertBefore(dex,bd);sy.insertBefore(dn,dex);}
  else{box.remove();dn.remove();ORIG.order.forEach(id=>$(id)&&mn.appendChild($(id)));dex.className='';}
  if(window.NK_EMOJI)try{NK_EMOJI.parse(dn);NK_EMOJI.parse(box);}catch(_){}}
 document.addEventListener('change',e=>{const k=e.target&&e.target.dataset&&e.target.dataset.u25;if(k==='menu27'||k==='donSt')setTimeout(apply,0);},true);
 window.NK_MENU27={apply,don};setTimeout(apply,600);})();
