// 시안 공통: 이미지 클릭 시 확대(라이트박스) · ←/→ 이동 · ESC 닫기 · 휠/핀치 확대
(function(){const st=document.createElement('style');st.textContent=`
.lb{position:fixed;inset:0;background:#0a0f18ee;z-index:99999;display:none;align-items:center;justify-content:center;cursor:zoom-out}
.lb.on{display:flex}.lb img{max-width:96vw;max-height:90vh;border-radius:10px;box-shadow:0 10px 50px #000a;transition:transform .15s;cursor:grab}
.lb .cap{position:fixed;bottom:14px;left:0;right:0;text-align:center;color:#fff;font:600 15px system-ui;text-shadow:0 1px 4px #000}
.lb .nv{position:fixed;top:50%;transform:translateY(-50%);width:54px;height:54px;border-radius:50%;border:0;background:#fff3;color:#fff;font-size:28px;cursor:pointer}
.lb .pv{left:14px}.lb .nx{right:14px}.lb .x{position:fixed;top:12px;right:14px;width:44px;height:44px;border-radius:50%;border:0;background:#fff3;color:#fff;font-size:24px;cursor:pointer}
img.zm{cursor:zoom-in}`;document.head.appendChild(st);
const lb=document.createElement('div');lb.className='lb';lb.innerHTML='<img><div class="cap"></div><button class="nv pv">‹</button><button class="nv nx">›</button><button class="x">×</button>';
document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(lb));if(document.body)document.body.appendChild(lb);
const im=lb.querySelector('img'),cap=lb.querySelector('.cap');let list=[],i=0,z=1;
const show=()=>{const t=list[i];im.src=t.dataset.full||t.src;cap.textContent=(t.alt||t.title||'')+`  (${i+1}/${list.length})`;z=1;im.style.transform='';};
document.addEventListener('click',e=>{const t=e.target;if(t.tagName==='IMG'&&!lb.contains(t)&&!t.classList.contains('nolb')){list=[...document.querySelectorAll('img:not(.nolb)')].filter(x=>!lb.contains(x));i=list.indexOf(t);show();lb.classList.add('on');e.preventDefault();}});
lb.addEventListener('click',e=>{if(e.target===lb||e.target.classList.contains('x'))lb.classList.remove('on');else if(e.target.classList.contains('pv')){i=(i-1+list.length)%list.length;show();}else if(e.target.classList.contains('nx')){i=(i+1)%list.length;show();}else if(e.target===im){z=z>1?1:2;im.style.transform=`scale(${z})`;}});
lb.addEventListener('wheel',e=>{e.preventDefault();z=Math.max(1,Math.min(4,z*(e.deltaY<0?1.15:.87)));im.style.transform=`scale(${z})`;},{passive:false});
addEventListener('keydown',e=>{if(!lb.classList.contains('on'))return;if(e.key==='Escape')lb.classList.remove('on');if(e.key==='ArrowLeft'){i=(i-1+list.length)%list.length;show();}if(e.key==='ArrowRight'){i=(i+1)%list.length;show();}});
const obs=()=>document.querySelectorAll('img:not(.nolb)').forEach(x=>x.classList.add('zm'));document.addEventListener('DOMContentLoaded',obs);setTimeout(obs,500);})();
