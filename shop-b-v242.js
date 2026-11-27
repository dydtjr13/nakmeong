// ─────────────────────────────────────────────────────────────
// v242 🛒 상점 B안 (시안 /workspace/shop-redesign-mock · 사용자 승인 t168u)
//  · PC(폭 900px 이상): 왼쪽 카테고리 · 가운데 카드 그리드 · 오른쪽 큰 미리보기
//  · 휴대폰: 위쪽 5×2 카테고리 칸 · 2열 카드 · 누르면 아래에서 올라오는 상세 창
//  · 기존 상점(game-v2.js _renderShop + 데크·펫·탈것 패치)을 탭마다 그대로 그린 뒤 숨겨 두고,
//    그 화면을 읽어 새 카드로 보여 줘요. 구매·장착·판매 버튼은 숨겨 둔 원래 버튼을 눌러요
//    → 가격·확률·되팔기 30%·확인 창은 예전과 똑같아요
//  · 행운 상자 · 물고기 팔기 · 밸런스표(관리자)는 예전 화면을 그대로 가운데에 보여 줘요
//  · 끄기: 관리자 설정 shopB = off 이면 예전 상점
// ─────────────────────────────────────────────────────────────
(function(){'use strict';
if(window.NK_PREV)return;
const B=()=>window.__nkShop; /* 게임 코드(game-v2.js)는 시작 준비 뒤에 늦게 돌아요 → 다리가 생길 때까지 기다려요 */
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const CATS=[['rec','⭐','추천','추천'],['rod','🎣','낚싯대','낚싯대'],['bait','🪱','미끼','미끼'],['fly','🚗','탈것','탈것'],['pet','🐾','펫','펫'],['deco','🪑','데크 꾸미기','꾸미기'],['tank','🐠','어항','어항'],['wear','👕','장비','장비'],['box','🎁','행운 상자','상자']];
const RAW={box:1,sell:1,bal:1};
const SUBS={rod:[['all','전체'],['shop','상점'],['box','상자에서']],bait:[['all','전체'],['cnt','소모품'],['perm','영구 루어']],fly:[['all','전체'],['sky','✈️ 하늘'],['ani','🐾 동물'],['land','🚗 땅·물']],deco:[['all','전체'],['plank','판 색'],['sign','간판'],['obj','소품']],wear:[['all','전체'],['hat','모자'],['cloth','옷'],['shoe','신발'],['glove','장갑']]};
const ST={cat:null,last:null,q:'',fBuy:false,fOwn:false,sort:'rec',sub:{},sel:{},sheet:false,col:{},M:null,orig:null};
const on=()=>{try{return String(B().uiOpt('shopB','on'))!=='off';}catch(e){return true;}};
const mob=()=>innerWidth<900;
const num=t=>{const m=String(t||'').replace(/,/g,'').match(/\d+/);return m?+m[0]:0;};
const fmt=n=>(+n||0).toLocaleString();
const shortP=n=>n>=1e8?(Math.round(n/1e7)/10+'억').replace('.0',''):n>=1e4?(Math.round(n/1e3)/10+'만').replace('.0',''):fmt(n);
const txt=e=>e?e.textContent.replace(/\s+/g,' ').trim():'';
const coins=()=>{try{return +B().S.coins||0;}catch(e){return 0;}};

// ── 원래 버튼 분류 ──
function act(b){const d=Object.keys(b.dataset).join(' '),t=txt(b);
 let k='use';if(b.classList.contains('sellb')||/sell/i.test(d))k='sell';else if(/buy|bx/i.test(d)||/구매|사기|하나 더/.test(t))k='buy';
 return {k,t,dis:!!b.disabled,el:b};}
function acts(root){return [...root.querySelectorAll('button')].filter(b=>!b.dataset.robsw&&!b.dataset.close&&!b.dataset.tab).map(act);}
function visOf(el){const v=el.querySelector('.tkimgw img, img.sico, img.wimg, img.robim, .nbsv img, img[data-flyimg], img, .sico, svg');return v||null;}
function cloneVis(v){if(!v)return null;const c=v.cloneNode(true);if(c.classList){c.classList.remove('sico','wimg','tkimg','rimg','robim');}const fit=el=>{if(!el||!el.tagName)return;if(/^(IMG|SVG|CANVAS)$/.test(el.tagName)){el.removeAttribute('width');el.removeAttribute('height');if(el.style){el.style.width='100%';el.style.height='100%';el.style.maxWidth='100%';el.style.maxHeight='100%';el.style.objectFit='contain';el.style.objectPosition='center';}}if(el.tagName==='IMG'){el.loading='eager';el.draggable=false;}};fit(c);if(c.querySelectorAll)c.querySelectorAll('img,svg,canvas').forEach(fit);if(c.tagName==='IMG'){c.onerror=()=>{c.onerror=null;setTimeout(()=>{if(v.src&&v.src!==c.src)c.src=v.src;else c.style.visibility='hidden';},80);};}return c;}
const OWNW=/이걸로|사용$|장착|교체|타는 중|사용중|사용 중|보유 중/;
const EQW=/타는 중|사용중|사용 중/;

// ── 탭 화면 → 카드 목록 ──
function parse(k,h){const body=h.querySelector('.tabs')?h.querySelector('.tabs').nextElementSibling:null;const out=[];if(!body)return {items:out,body,notes:[]};
 const notes=[...body.querySelectorAll(':scope > p.small.muted, :scope > p.small')].map(txt).filter(Boolean);
 let i=0;const add=o=>{o.tab=k;o.id=k+':'+(o.key||o.name)+':'+(i++);o.acts=o.acts||[];const A=o.acts;
  o.buy=A.find(a=>a.k==='buy'&&!a.dis)||null;o.buyAny=A.find(a=>a.k==='buy')||null;o.use=A.find(a=>a.k==='use'&&!a.dis)||null;o.sell=A.filter(a=>a.k==='sell');
  if(o.own==null)o.own=A.some(a=>a.k==='use'&&OWNW.test(a.t))||o.sell.length>0;if(o.eq==null)o.eq=A.some(a=>a.dis&&EQW.test(a.t));out.push(o);};
 if(k==='fly'){body.querySelectorAll('.flyc').forEach(c=>{const hb=c.querySelector('.flyh b'),hs=c.querySelector('.flyh small');const name=txt(hb).replace(/^\S+\s/,s=>/[\u3131-\uD79D]/.test(s)?s:''),desc=txt(hs);
   const ground=c.classList.contains('robc'),ani=/등에 타요/.test(desc),sub=!ground?'sky':ani?'ani':'land';
   if(ground){const sw=[...c.querySelectorAll('[data-robsw]')];const nm=txt(c.querySelector('.robn')).replace(/\s*보유$/,'');const pr=num(txt(c.querySelector('.robi small')));const ac=acts(c.querySelector('.robgo')||c);
    const cols=sw.length?sw.map(b=>({name:b.title,dot:getComputedStyle(b).getPropertyValue('--rc').trim()||b.style.getPropertyValue('--rc'),own:b.classList.contains('own'),on:b.classList.contains('on'),sw:b,pr:b.classList.contains('on')?pr:null})):[];
    add({key:name,name,desc,sub,vis:visOf(c),price:pr,cols,colRob:1,curCol:nm,acts:ac,own:ac.some(a=>a.k==='use'||a.k==='sell')||!!c.querySelector('.robo'),eq:ac.some(a=>a.dis&&EQW.test(a.t))});}
   else{const opts=[...c.querySelectorAll('.flyo')].map(o=>{const ac=acts(o);return {name:txt(o.querySelector('b')),pr:num(txt(o.querySelector('small'))),img:o.querySelector('img'),acts:ac,own:ac.some(a=>a.k!=='buy'),on:o.classList.contains('on')};});
    const any=opts.some(o=>o.own),eq=opts.some(o=>o.on);
    add({key:name,name,desc,sub,vis:(opts.find(o=>o.on)||opts.find(o=>o.own)||opts[0]||{}).img,price:Math.min(...opts.map(o=>o.pr)),priceMax:Math.max(...opts.map(o=>o.pr)),opts,acts:[].concat(...opts.map(o=>o.acts)),own:any,eq});}});
  return {items:out,body,notes};}
 body.querySelectorAll('.dki').forEach(c=>add({key:'dk'+txt(c.querySelector('b')),name:txt(c.querySelector('b')),desc:'데크 판 색 · 앉아 있는 동안 모두에게 보여요',sub:'plank',vis:c.querySelector('svg,img'),price:num(txt(c.querySelector('small'))),free:/무료/.test(txt(c.querySelector('small'))),acts:acts(c)}));
 body.querySelectorAll('.nbshop').forEach(c=>add({key:'nb',name:txt(c.querySelector('.nbsi b')).replace(/^💡\s*/,''),desc:txt(c.querySelector('.nbsi small')),sub:'sign',vis:c.querySelector('.nbsv img'),wide:1,price:num(txt(c.querySelector('.nbsb span'))),acts:acts(c)}));
 body.querySelectorAll('.wsi').forEach(c=>{const ws=c.closest('.wshop'),lk=ws&&ws.classList.contains('lk');const d=txt(c.querySelector('small'));const slot=/^모자/.test(d)?'hat':/^옷/.test(d)?'cloth':/^신발/.test(d)?'shoe':'glove';const set=ws?txt(ws.querySelector('.wsh b')):'';
  const lvm=set.match(/Lv\.(\d+)/);add({key:txt(c.querySelector('b')),name:txt(c.querySelector('b')),desc:d,sub:slot,set,setFx:ws?txt(ws.querySelector('.wsh small')):'',vis:c.querySelector('img'),price:num(txt(c.querySelector('.p'))),lock:lk?('Lv.'+(lvm?lvm[1]:'')):'',ownTxt:txt(c.querySelector('.own')),own:!!c.querySelector('.own'),acts:acts(c)});});
 body.querySelectorAll('.item').forEach(c=>{const name=txt(c.querySelector('h4'));const pe=c.querySelector('.p, .price');const pt=txt(pe);const box=!!c.querySelector('.boxonly');
  const lt=c.querySelector('.lvtag');const lock=lt&&lt.classList.contains('no')?txt(lt).replace(/^🔒\s*/,'').replace(/\s*(착용|사용)$/,''):'';
  const smalls=[...c.querySelectorAll('.small')];const desc=txt(smalls.find(s=>s.classList.contains('muted')&&s.tagName==='DIV'))||'';const info=smalls.filter(s=>!s.classList.contains('muted')).map(txt).filter(Boolean).join(' · ');
  const src=txt([...c.querySelectorAll('span.small.muted')].pop());const ac=acts(c);
  let sub='';if(k==='rod')sub=box?'box':'shop';else if(k==='bait')sub=/영구/.test(desc)||/보유: ∞/.test(info)?'perm':'cnt';else if(k==='deco')sub='obj';
  const own=k==='rod'?num(info.match(/보유 (\d+)개/)?info.match(/보유 (\d+)개/)[1]:0)>0:k==='bait'?/보유: (∞|[1-9])/.test(info):k==='tank'?ac.some(a=>/교체|사용중|하나 더/.test(a.t)):undefined;
  const eq=k==='rod'?/장착중/.test(info):undefined;
  const badge=[...c.querySelectorAll('.ptr,.tknew')].map(txt);
  add({key:name,name,desc,info,src,sub,vis:visOf(c),price:pt&&/무료/.test(pt)?0:num(pt),free:/무료/.test(pt),box,lock,acts:ac,own,eq,badge,grade:txt(c.querySelector('.ptr')),gc:c.style.getPropertyValue('--c')});});
 return {items:out,body,notes};}

// ── 모든 탭 그리기 ──
function build(orig,ctx,args){const sh=$('shop');const tab0=B().tab;
 if(ST.cat==null||ST.last!==tab0){ST.cat=tab0;}
 const H={};let tabs=[];
 const take=()=>{const h=document.createElement('div');h.className='nkb-h';while(sh.firstChild)h.appendChild(sh.firstChild);return h;};
 orig.apply(ctx,args);const t1=B().tab;tabs=[...sh.querySelectorAll('.tabs [data-tab]')].map(b=>b.dataset.tab);H[t1]=take();
 for(const k of tabs){if(H[k])continue;B().tab=k;try{orig.apply(ctx,args);}catch(e){console.warn('상점 탭',k,e);}H[k]=take();}
 B().tab=t1;if(ST.cat!=='rec'&&!tabs.includes(ST.cat))ST.cat=t1;ST.last=t1;
 const M={tabs,H,P:{}};for(const k of tabs)if(!RAW[k])M.P[k]=parse(k,H[k]);ST.M=M;
 const close=H[t1].querySelector('[data-close]');ST.closeBtn=close;
 draw();}

// ── 목록 고르기 ──
const subN=o=>{const S=SUBS[o.tab];const x=S&&o.sub&&S.find(y=>y[0]===o.sub);return x?x[1].replace(/^\S+\s/,m=>/[가-힣]/.test(m)?m:''):'';};
function list(){const M=ST.M;let L=[];const q=ST.q.trim().toLowerCase();
 if(q){for(const k in M.P)L=L.concat(M.P[k].items);L=L.filter(o=>(o.name+' '+o.desc+' '+(o.info||'')+' '+(o.set||'')+' '+(o.opts||[]).map(x=>x.name).join(' ')+' '+(o.cols||[]).map(x=>x.name).join(' ')+' '+catN(o.tab)+' '+subN(o)).toLowerCase().includes(q));}
 else if(ST.cat==='rec'){const per={rod:2,bait:2,fly:3,pet:2,deco:2,tank:2,wear:3};for(const k of Object.keys(per)){if(!M.P[k])continue;L=L.concat(M.P[k].items.filter(o=>o.buy&&!o.lock&&!o.own&&(o.price||0)<=Math.max(coins()*1.5,1000)).slice(0,per[k]));}}
 else{L=(M.P[ST.cat]||{items:[]}).items.slice();const s=ST.sub[ST.cat]||'all';if(s!=='all')L=L.filter(o=>o.sub===s);}
 if(ST.fBuy)L=L.filter(o=>o.buy&&!o.lock&&(o.price||0)<=coins());if(ST.fOwn)L=L.filter(o=>o.own);
 if(ST.sort==='low')L.sort((a,b)=>(a.price||0)-(b.price||0));else if(ST.sort==='high')L.sort((a,b)=>(b.price||0)-(a.price||0));
 return L;}
const catN=k=>(CATS.find(c=>c[0]===k)||[,,k==='sell'?'물고기 팔기':k==='bal'?'밸런스표':k])[2];

// ── 카드 ──
function badges(o){const b=[];if(o.badge)o.badge.forEach(t=>{if(/NEW/.test(t))b.push(`<i class="bd new">NEW</i>`);else if(t)b.push(`<i class="bd g" style="--gc:${esc(o.gc||'#9aa3ad')}">${esc(t)}</i>`);});if(o.box)b.push('<i class="bd box">상자</i>');return b.join('');}
function ownTag(o){if(o.eq)return `<i class="own eq">✔ ${o.tab==='fly'?'타는 중':'사용 중'}</i>`;if(o.own)return '<i class="own">✔ 보유</i>';return '';}
function priceH(o){if(o.box)return `<span class="pr boxw">🎁 ${esc(o.src||'행운 상자')}</span>`;if(o.free||(!o.price&&!o.opts))return '<span class="pr free">무료</span>';
 const p=o.opts&&o.priceMax>o.price?shortP(o.price)+'~':shortP(o.price);return `<span class="pr"><i class="coin"></i>${p}</span>`;}
function mainBtn(o){if(o.box)return '';if(o.lock&&!o.own)return `<span class="lv">🔒 ${esc(o.lock)}</span>`;
 if(o.opts||o.cols&&o.cols.length>1)return `<button type="button" class="nb ${o.own?'ok':''}" data-nkpick="${esc(o.id)}">${o.own?'보기':'색 고르기'}</button>`;
 if(o.use)return `<button type="button" class="nb ok" data-nkgo="${esc(o.id)}" data-a="use">${esc(o.use.t.replace('이걸로',o.tab==='fly'?'타기':'쓰기'))}</button>`;
 if(o.buy)return `<button type="button" class="nb" data-nkgo="${esc(o.id)}" data-a="buy">${esc(/하나 더/.test(o.buy.t)?'하나 더':o.buy.t.replace(/\s*\(.*\)$/,''))}</button>`;
 if(o.eq)return `<span class="nb off">${o.tab==='fly'?'타는 중':'사용 중'}</span>`;
 if(o.own)return '<span class="nb off">보유 중</span>';
 if(o.buyAny)return '<span class="nb off">골드 부족</span>';return '';}
function swH(o){if(o.opts)return `<div class="sw">${o.opts.slice(0,6).map(x=>`<i class="si ${x.own?'own':''}"><img src="${esc(x.img&&x.img.src||'')}" alt=""></i>`).join('')}${o.opts.length>6?`<em>+${o.opts.length-6}</em>`:''}</div>`;
 if(o.cols&&o.cols.length>1)return `<div class="sw">${o.cols.slice(0,7).map(x=>`<i class="sd ${x.own?'own':''}" style="background:${esc(x.dot||'#ccc')}"></i>`).join('')}${o.cols.length>7?`<em>+${o.cols.length-7}</em>`:''}</div>`;return '<div class="sw"></div>';}
function card(o,sel){return `<div class="cd ${sel?'sel':''} ${o.lock&&!o.own?'lk':''}" data-nksel="${esc(o.id)}"><div class="th"><span class="bdg">${badges(o)}</span>${ownTag(o)}<span class="vi" data-vis="${esc(o.id)}"></span></div><b class="nm">${esc(o.name)}</b><small class="fx">${esc(o.tab==='wear'?o.desc:o.desc||o.info||'')}</small>${swH(o)}<div class="ft">${priceH(o)}${mainBtn(o)}</div></div>`;}
const byId=id=>{for(const k in ST.M.P){const o=ST.M.P[k].items.find(x=>x.id===id);if(o)return o;}return null;};

// ── 상세 ──
function stats(s){const r={};String(s||'').replace(/(빠른입질|대어|희귀어종)\s*\+?(\d+)%/g,(m,a,b)=>{r[a]=+b;return m;});return r;}
function compare(o){if(o.tab!=='rod'||o.eq||o.box)return '';const cur=(ST.M.P.rod||{items:[]}).items.find(x=>x.eq);if(!cur)return '';const a=stats(cur.desc),b=stats(o.desc);const ks=['빠른입질','대어','희귀어종'].filter(k=>(b[k]||0)!==(a[k]||0));if(!ks.length)return '';
 return `<div class="nkcmp">지금 쓰는 <b>${esc(cur.name)}</b>보다 ${ks.map(k=>{const d=(b[k]||0)-(a[k]||0);return `<span class="${d>0?'up':'dn'}">${k} ${d>0?'+':''}${d}%</span>`;}).join(' ')}</div>`;}
function optCur(o){if(!o.opts)return null;const i=ST.col[o.key];const x=o.opts[i!=null&&o.opts[i]?i:Math.max(0,o.opts.findIndex(y=>y.on)>=0?o.opts.findIndex(y=>y.on):o.opts.findIndex(y=>y.own))];return x||o.opts[0];}
function where(o){return {fly:'가방 › 탈것',pet:'가방 › 펫',deco:'데크에 앉아 꾸미기',tank:'어항'}[o.tab]||'';}
function detH(o){if(!o)return `<div class="dempty"><b>🛒</b></div>`;
 const x=optCur(o);const A=x?x.acts:o.acts;const buy=A.find(a=>a.k==='buy'),use=A.find(a=>a.k==='use'),sells=A.filter(a=>a.k==='sell');const pr=x?x.pr:o.price;
 const tags=String(o.desc||'').split(/\s*·\s*|,\s*/).filter(Boolean).slice(0,6).map(t=>`<i class="tg">${esc(t)}</i>`).join('');
 const colH=o.opts?`<div class="cols">${o.opts.map((y,i)=>`<button type="button" class="col ${y===x?'on':''}" data-nkcol="${i}"><img src="${esc(y.img&&y.img.src||'')}" alt=""><b>${esc(y.name)}</b><small>${y.own?'✔ 보유':shortP(y.pr)}</small></button>`).join('')}</div>`
  :o.cols&&o.cols.length>1?`<div class="cols dots">${o.cols.map((y,i)=>`<button type="button" class="col ${y.on?'on':''}" data-nkrob="${i}"><i style="background:${esc(y.dot||'#ccc')}"></i><b>${esc(y.name)}</b><small>${y.own?'✔ 보유':y.on?shortP(o.price):''}</small></button>`).join('')}</div>`:'';
 const lvl=o.lock?`<i class="tg lk">🔒 ${esc(o.lock)}부터 ${o.tab==='bait'?'사용':'착용'}</i>`:'';
 const after=buy&&!buy.dis&&pr>0?`사고 나면 남는 골드 <b>${fmt(coins()-pr)}</b>`:buy&&pr>coins()?`<span class="short">골드가 <b>${fmt(pr-coins())}</b> 모자라요</span>`:'';
 let btns='';
 if(o.box)btns=`<div class="srcbox">🎁 ${esc(o.src||'행운 상자에서 나와요')}</div>`;
 if(use)btns+=`<button type="button" class="buy ok" data-nkact="use" ${use.dis?'disabled':''}>${esc(use.t.replace('이걸로',o.tab==='fly'?'이 색으로 타기':'이걸로 쓰기'))}</button>`;
 if(buy)btns+=`<button type="button" class="buy" data-nkact="buy" ${buy.dis?'disabled':''}><i class="coin"></i>${pr?fmt(pr):''} ${esc(buy.t.replace(/^구매$/,'구매'))}</button>`;
 if(!use&&!buy&&!o.box)btns+=`<button type="button" class="buy off" disabled>${o.eq?(o.tab==='fly'?'타는 중':'사용 중'):o.own?'보유 중':'지금은 살 수 없어요'}</button>`;
 sells.forEach((s,i)=>{btns+=`<button type="button" class="sellx" data-nkact="sell" data-i="${i}">🪙 ${fmt(num(s.t.split('🪙').pop()))}에 팔기</button>`;});
 const extra=[o.info,o.set?o.set+' · '+o.setFx:'',o.ownTxt].filter(Boolean).map(t=>`<div class="inf">${esc(t)}</div>`).join('');
 return `<div class="big ${o.wide?'wide':''}"><span class="vi" data-vis="${esc(o.id)}" data-big="1"></span></div>
  <div class="dt"><h3>${esc(o.name)}${x?` <small>${esc(x.name)}</small>`:''}</h3><div class="tags">${lvl}${tags}</div>${compare(o)}${extra}${colH}</div>
  <div class="dbot">${o.box?'':`<div class="dpr">${pr?`<i class="coin"></i><b>${fmt(pr)}</b>`:'<b class="free">무료</b>'}</div>`}${btns}<div class="after">${after}${where(o)?`${after?' · ':''}사면 <b>${esc(where(o))}</b>에서 써요`:''}</div></div>`;}

// ── 화면 ──
function counts(k){const P=ST.M.P[k];return P?P.items.length:0;}
function catsShown(){return CATS.filter(c=>c[0]==='rec'||ST.M.tabs.includes(c[0]));}
function draw(){const sh=$('shop');const M=ST.M;const m=mob();const cat=ST.cat;const raw=RAW[cat];
 const cs=catsShown();const gold=coins();
 const nav=cs.map(c=>`<button type="button" class="sn ${!ST.q&&cat===c[0]?'on':''}" data-nkcat="${c[0]}"><span class="e">${c[1]}</span><span class="t">${m?c[3]:c[2]}</span>${!m&&counts(c[0])?`<span class="c">${counts(c[0])}</span>`:''}</button>`).join('');
 const sellB=M.tabs.includes('sell')?`<button type="button" class="sn sellnav ${cat==='sell'&&!ST.q?'on':''}" data-nkcat="sell"><span class="e">💰</span><span class="t">${m?'팔기':'물고기 팔기'}</span></button>`:'';
 const balB=M.tabs.includes('bal')&&!m?`<button type="button" class="sn ${cat==='bal'?'on':''}" data-nkcat="bal"><span class="e">📊</span><span class="t">밸런스표</span></button>`:'';
 const subs=!ST.q&&SUBS[cat]?`<div class="subs">${SUBS[cat].map(([s,n])=>{const c=s==='all'?counts(cat):(M.P[cat]?M.P[cat].items.filter(o=>o.sub===s).length:0);if(s!=='all'&&!c)return '';return `<button type="button" class="sub ${(ST.sub[cat]||'all')===s?'on':''}" data-nksub="${s}">${n} <i>${c}</i></button>`;}).join('')}</div>`:'';
 const tools=raw&&!ST.q?'':`<div class="tool"><label class="search"><span>🔍</span><input type="search" id="nkbQ" placeholder="이름·효과로 찾기 (예: 대어, 하늘)" value="${esc(ST.q)}" autocomplete="off" enterkeyhint="search">${ST.q?'<button type="button" class="qx" data-nkqx="1">×</button>':''}</label>${m?'':fl()}</div>${m?`<div class="frow">${fl()}</div>`:''}`;
 function fl(){return `<button type="button" class="fchip ${ST.fBuy?'on':''}" data-nkf="buy">${ST.fBuy?'✔ ':''}살 수 있는 것만</button><button type="button" class="fchip ${ST.fOwn?'on':''}" data-nkf="own">${ST.fOwn?'✔ ':''}보유 중</button><label class="sort"><select id="nkbSort"><option value="rec" ${ST.sort==='rec'?'selected':''}>기본순</option><option value="low" ${ST.sort==='low'?'selected':''}>가격 낮은순</option><option value="high" ${ST.sort==='high'?'selected':''}>가격 높은순</option></select></label>`;}
 const head=`<div class="hd"><h2>🛒 <span>호숫가 작은 상점</span></h2><span class="sp"></span><span class="pill"><i class="coin"></i>${fmt(gold)}</span><button type="button" class="x" data-nkx="1" aria-label="닫기">×</button></div>`;
 sh.innerHTML=`<div class="nkb ${m?'m':'pc'} ${raw&&!ST.q?'raw':''}" role="dialog" aria-label="상점">${head}<div class="bd0">${m?`<div class="mcats">${nav}${sellB}</div>`:`<nav class="side">${nav}<span class="sp"></span><div class="sdiv"></div>${balB}${sellB}</nav>`}<div class="main">${tools}${subs}<div class="gw" id="nkbGW"></div></div>${m||raw&&!ST.q?'':'<aside class="det" id="nkbDet"></aside>'}</div>${m?'<div class="dim2" id="nkbDim"></div><div class="sheet" id="nkbSheet"></div>':''}<div class="nkb-src" hidden></div></div>`;
 const src=sh.querySelector('.nkb-src');for(const k in M.H)src.appendChild(M.H[k]);
 drawGrid();bind();}
function drawGrid(){const sh=$('shop'),gw=$('nkbGW');if(!gw)return;const cat=ST.cat;
 if(RAW[cat]&&!ST.q){const body=ST.M.H[cat]&&ST.M.H[cat].querySelector('.tabs')?ST.M.H[cat].querySelector('.tabs').nextElementSibling:null;gw.innerHTML='';const w=document.createElement('div');w.className='rawb rw-'+cat;if(body){w.appendChild(body);}gw.appendChild(w);return;}
 const L=list();const selId=ST.sel[ST.q?'q':cat];let sel=L.find(o=>o.id===selId)||null;if(!sel&&!mob()&&L.length)sel=L[0];
 const notes=!ST.q&&cat!=='rec'&&ST.M.P[cat]?ST.M.P[cat].notes:[];
 const hd=ST.q?`<div class="hint">「${esc(ST.q)}」 찾은 결과 <b>${L.length}개</b></div>`:cat==='rec'?'<div class="hint">⭐ 추천</div>':'';
 gw.innerHTML=`${hd}${L.length?`<div class="grid">${L.map(o=>card(o,sel&&o.id===sel.id)).join('')}</div>`:`<div class="empty">${ST.q?'찾는 물건이 없어요':ST.fBuy||ST.fOwn?'해당하는 물건이 없어요':'아직 물건이 없어요'}</div>`}${notes.map(n=>`<p class="note">${esc(n)}</p>`).join('')}`;
 fillVis(gw);ST.cur=sel;if(!mob())drawDet(sel);else drawSheet();
 gw.querySelectorAll('[data-nksel]').forEach(c=>c.onclick=e=>{if(e.target.closest('button'))return;pick(c.dataset.nksel);});
 gw.querySelectorAll('[data-nkpick]').forEach(b=>b.onclick=()=>pick(b.dataset.nkpick));
 gw.querySelectorAll('[data-nkgo]').forEach(b=>b.onclick=()=>{const o=byId(b.dataset.nkgo);if(!o)return;const a=b.dataset.a==='use'?o.use:o.buy;if(a&&a.el&&!a.el.disabled){ST.sel[ST.q?'q':ST.cat]=o.id;a.el.click();}});}
function fillVis(root){root.querySelectorAll('[data-vis]').forEach(s=>{const o=byId(s.dataset.vis);if(!o)return;let v=o.vis;if(s.dataset.big&&o.opts){const x=optCur(o);if(x&&x.img)v=x.img;}const c=cloneVis(v);s.innerHTML='';if(c)s.appendChild(c);else s.textContent='🎁';});}
function pick(id){const o=byId(id);if(!o)return;ST.sel[ST.q?'q':ST.cat]=id;const gw=$('nkbGW');gw.querySelectorAll('.cd').forEach(c=>c.classList.toggle('sel',c.dataset.nksel===id));ST.cur=o;if(mob()){ST.sheet=true;drawSheet();}else drawDet(o);}
function bindDet(root,o){if(!o)return;fillVis(root);
 root.querySelectorAll('[data-nkcol]').forEach(b=>b.onclick=()=>{ST.col[o.key]=+b.dataset.nkcol;mob()?drawSheet():drawDet(o);});
 root.querySelectorAll('[data-nkrob]').forEach(b=>b.onclick=()=>{const c=o.cols[+b.dataset.nkrob];if(c&&c.sw&&!c.on){ST.keepSheet=mob();c.sw.click();}});
 root.querySelectorAll('[data-nkact]').forEach(b=>b.onclick=()=>{const x=optCur(o);const A=x?x.acts:o.acts;const a=b.dataset.nkact==='sell'?A.filter(y=>y.k==='sell')[+b.dataset.i||0]:A.find(y=>y.k===b.dataset.nkact);if(a&&a.el&&!a.el.disabled){ST.keepSheet=mob()&&b.dataset.nkact!=='sell';a.el.click();}});
 const xb=root.querySelector('[data-nkshx]');if(xb)xb.onclick=()=>{ST.sheet=false;drawSheet();};}
function drawDet(o){const d=$('nkbDet');if(!d)return;d.innerHTML=detH(o);bindDet(d,o);}
function drawSheet(){const s=$('nkbSheet'),dm=$('nkbDim');if(!s)return;const o=ST.cur;const show=ST.sheet&&o;s.classList.toggle('show',!!show);dm.classList.toggle('show',!!show);
 if(show){s.innerHTML=`<div class="grab"></div><button type="button" class="shx" data-nkshx="1" aria-label="닫기">×</button>${detH(o)}`;bindDet(s,o);}else s.innerHTML='';
 dm.onclick=()=>{ST.sheet=false;drawSheet();};}
function bind(){const sh=$('shop');const R=()=>{const gw=$('nkbGW');if(gw)gw.scrollTop=0;B().render();};
 sh.querySelectorAll('[data-nkcat]').forEach(b=>b.onclick=()=>{const k=b.dataset.nkcat;ST.q='';ST.sheet=false;ST.cat=k;if(k!=='rec'){B().tab=k;ST.last=k;}R();});
 sh.querySelectorAll('[data-nksub]').forEach(b=>b.onclick=()=>{ST.sub[ST.cat]=b.dataset.nksub;sh.querySelectorAll('[data-nksub]').forEach(x=>x.classList.toggle('on',x===b));const gw=$('nkbGW');gw.scrollTop=0;drawGrid();});
 sh.querySelectorAll('[data-nkf]').forEach(b=>b.onclick=()=>{if(b.dataset.nkf==='buy')ST.fBuy=!ST.fBuy;else ST.fOwn=!ST.fOwn;b.classList.toggle('on');b.textContent=(b.classList.contains('on')?'✔ ':'')+(b.dataset.nkf==='buy'?'살 수 있는 것만':'보유 중');drawGrid();});
 const so=$('nkbSort');if(so)so.onchange=()=>{ST.sort=so.value;drawGrid();};
 const q=$('nkbQ');if(q){let t=0;q.oninput=()=>{clearTimeout(t);t=setTimeout(()=>{const had=!!ST.q;ST.q=q.value;if(!!ST.q!==had){const pos=q.selectionStart;B().render();const q2=$('nkbQ');if(q2){q2.focus();try{q2.setSelectionRange(pos,pos);}catch(e){}}}else drawGrid();},160);};}
 const qx=sh.querySelector('[data-nkqx]');if(qx)qx.onclick=()=>{ST.q='';B().render();};
 const x=sh.querySelector('[data-nkx]');if(x)x.onclick=()=>{ST.sheet=false;if(ST.closeBtn)ST.closeBtn.click();else B().closeM('shop');};
 if(ST.keepSheet&&mob()){ST.sheet=true;ST.keepSheet=false;drawSheet();}}

let wrapped=false;const hook=()=>{if(wrapped||!B())return false;wrapped=true;B().wrap(orig=>{ST.orig=orig;return function(){if(!on()){const sh=$('shop');const r=orig.apply(this,arguments);return r;}try{return build(orig,this,arguments);}catch(e){console.warn('상점 B안 오류 → 예전 상점',e);return orig.apply(this,arguments);}};});return true;};
if(!hook()){const iv=setInterval(()=>{if(hook())clearInterval(iv);},100);}
let rw=0,lastM=null;addEventListener('resize',()=>{clearTimeout(rw);rw=setTimeout(()=>{const sh=$('shop');if(!sh||!sh.classList.contains('show')||!on())return;if(lastM!==mob()){lastM=mob();B().render();}},200);});lastM=mob();
window.NK_SHOPB={state:ST,on};
})();
