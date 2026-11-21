// ─────────────────────────────────────────────────────────────
// v192 🪵 나무 작업대 합성판 (합성 시안 v3 → 인게임)
//  · 아래(PC는 왼쪽) 목록의 물고기를 누르면 합성판의 다음 빈 칸(왼쪽 위부터)에 들어가요. 끌어서 넣지 않아요
//  · 판 안에서 같은 물고기 · 같은 단계를 끌어 겹치면 2개 → 1개 (★1~★5 → 블랙 → 핑크 → 레드 → 황금 → 무지개)
//  · 하루 합성 횟수: 기본 30 + 낚시 50회마다 +5(최대 +80) + 광고 1회 +10(최대 +100) + 후원자 +100 · 이월 없음 · 최대 310 · 자정(한국 시간) 초기화
//  · ⓘ 정보 창: 합성 방법 · 자정 초기화 · 오늘 받은 횟수 내역
//  · PC는 화면 흔들림·멈칫(히트스톱)·줌이 없어요. 팝·파티클·효과음은 그대로. 터치 기기(모바일)는 흔들림·멈칫·진동 유지
//  · v205: PC는 화면 대신 나무판만 짧게 흔들리고 둘레 8칸이 튕기고 판 테두리가 번쩍, 낮은 「쿵」 소리 (pcHit/thud)
//  · v205: 모바일은 판이 화면을 꽉 채워요 (높이가 모자라면 #mbd.mbcmp 작은 배치) · 물고기 크기는 단계와 상관없이 고정 · 🌈 무지개 완성은 전체 서버 공지(mbr)
//  · 물고기 데이터는 기존 그대로(S.tank 의 f.st 0~4 = ★1~★5, f.vr = 변이). 판에는 물고기 id만 적어 둬요 (S.mb.cells)
//  · 켜고 끄기: 관리자 › 테스트 기능 「🪵 나무 작업대 합성판」(mergeBoard: v192부터 off 기본(예전 3마리 합성) / on 새 합성판 — 정식 적용 때 기본값만 on 으로)
//              「🧺 합성판 정리 버튼」(mbTidy: on 기본 / off) — 정리 버튼은 이 한 곳에서 빼요
//  · 연결 지점: NK_MB.adWatched() 광고 1회 끝 · NK_MB.setSupporter(true|false) 후원자 판정 · NK_MB.onCatch() 낚시 1회
// ─────────────────────────────────────────────────────────────
(function(){'use strict';
if(window.NK_PREV)return;
const $=id=>document.getElementById(id);
const MB_CFG={N:5,base:30,fishStep:50,fishAmt:5,fishMax:80,adAmt:10,adMax:100,supAmt:100,luck:.01,luckMaxT:3,adSec:30};/* v205: 2단계 상승은 ★1~★4에서만 1% 고정 · ★5와 변이(블랙~)부터는 한 단계씩 */
const LV=['★1','★2','★3','★4','★5','블랙','핑크','레드','황금','무지개'];
const VK=['black','pink','red','gold','rainbow'];
const IMP=[null,{sh:0,hs:0,pn:10,fl:0,rg:1,vib:[10]},{sh:1.5,hs:20,pn:14,fl:0,rg:1,vib:[12]},{sh:2.5,hs:35,pn:18,fl:.12,rg:1,vib:[15]},{sh:4,hs:55,pn:28,fl:.2,rg:2,vib:[20,30,20]},{sh:6,hs:75,pn:40,fl:.32,rg:2,vib:[30,40,60]},{sh:7,hs:85,pn:48,fl:.38,rg:2,vib:[30,30,30,30,60]},{sh:9,hs:105,pn:60,fl:.48,rg:3,vib:[40,30,80]},{sh:11,hs:135,pn:76,fl:.62,rg:3,vib:[50,30,50,30,120],ray:1},{sh:15,hs:190,pn:110,fl:.85,rg:4,vib:[60,40,60,40,60,40,200],ray:1,rb:1}];
const COL=[['#ffd84d','#fff3b0'],['#ffd84d','#fff3b0'],['#ffcf3a','#fff'],['#ffc12a','#fff'],['#ffb000','#fff6c0'],['#3a3840','#c9c6d6'],['#ff6fa8','#ffd0e2'],['#ff4b3a','#ffb0a0'],['#ffc400','#fff0a0'],['rb','rb']];
const RB=['#ff5f8f','#ffae3d','#ffe24d','#5fe0a0','#4dbdff','#a46bff'];
/* game-v2.js 안쪽 함수는 다리(window.__nkMB)로 빌려 써요 — 이름을 그대로 맞춰 둬서 아래 코드는 게임 코드와 같은 모양이에요 */
const B=()=>window.__nkMB;
const gS=()=>B()?B().S:null,gT=()=>{try{return B().tankView();}catch(e){return null;}};
function fzOn(){return B().fzOn();}function uiOpt(k,d){return B().uiOpt(k,d);}function fzPool(){return B().pool();}function fzRemove(a,k){return B().remove(a,k);}
function FI(k){return B().FI(k);}function fzVK(k){return B().fzVK(k);}function fzS(){return B().fzS();}function fzSP(){return B().fzSP();}function valueOf(f,c,g){return B().valueOf(f,c,g);}function sellP(f){return B().sellP(f);}
function save(){B().save();}function hud(){B().hud();}function toast(h,ms){B().toast(h,ms);}function openM(id){B().openM(id);}function closeM(id){B().closeM(id);}function confirmBox(h,ok){B().confirmBox(h,ok);}
const FZV=new Proxy({},{get:(_,k)=>B().FZV()[k]});
const opt=(k,d)=>{try{return String(uiOpt(k,d));}catch(e){return d;}};
const on=()=>{try{return !!B()&&fzOn()&&opt('mergeBoard','off')==='on';}catch(e){return false;}};
const tidyOn=()=>true;/* v194: 정리 버튼은 항상 보여요 */
const infOn=()=>opt('mbInf','on')==='on';/* v194: ♾️ 테스트 중 무제한 (LAB mbInf) */
const PCL=()=>innerWidth>=900;/* 3단 PC 배치 */
const IMPACT=()=>{try{return matchMedia('(pointer:coarse)').matches;}catch(e){return false;}};/* 모바일(터치)만 흔들림·멈칫·진동 */
/* v193: 서버 연결이 있으면 서버 시각으로 한국 날짜를 정해요 (기기 시계를 바꿔도 하루가 바뀌지 않아요) · 연결이 없으면 마지막으로 서버에서 받은 날짜를 그대로 써요 */
const RTon=()=>{try{return !!(window.NK_RT&&NK_RT.mode==='on'&&typeof NK_RT.clockSkew==='number');}catch(e){return false;}};
const kst=()=>{if(RTon())return new Date(Date.now()-NK_RT.clockSkew+9*3600e3).toISOString().slice(0,10);const S=gS();if(S&&S.mbSrvD)return S.mbSrvD;return new Date(Date.now()+9*3600e3).toISOString().slice(0,10);};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const say=(h,ms)=>{try{toast(h,ms);}catch(e){}};
// ── 하루 횟수 ──
function day(){const S=gS();if(!S)return {d:kst(),used:0,fish:0,ads:0};if(!S.mbd||S.mbd.d!==kst())S.mbd={d:kst(),used:0,fish:0,ads:0};return S.mbd;}
const fishB=n=>Math.min(MB_CFG.fishMax,Math.floor(n/MB_CFG.fishStep)*MB_CFG.fishAmt);
const adB=n=>Math.min(MB_CFG.adMax,n*MB_CFG.adAmt);
/* v193: 후원자는 서버 명단으로만 (기기에 저장된 표시는 안 믿어요) · 서버 연결이 없으면 하루 기본 30회만 */
const SRV={st:null,pf:0,pa:0,t:0,rid:0};
function srvFresh(){return RTon()&&SRV.st&&SRV.st.d===kst();}
function isSup(){return !!(srvFresh()&&SRV.st.sup);}
function total(){const d=day();if(!srvFresh())return MB_CFG.base;return MB_CFG.base+fishB(d.fish)+adB(d.ads)+(isSup()?MB_CFG.supAmt:0);}
function left(){if(infOn())return 9999;return Math.max(0,total()-day().used);}
function offRec(n){const S=gS();if(!S)return;const d=kst();if(!S.mbOff||S.mbOff.d!==d)S.mbOff={d,n:0};S.mbOff.n+=n;}
function srvSync(op){if(!RTon())return false;op=op||{};const S=gS();if(SRV.pf){op.fish=(op.fish|0)+SRV.pf;SRV.pf=0;}if(SRV.pa){op.ad=(op.ad|0)+SRV.pa;SRV.pa=0;}if(S&&S.mbOff&&S.mbOff.n>0){op.off={d:S.mbOff.d,n:S.mbOff.n};S.mbOff=null;}SRV.t=Date.now();op.rid=String(++SRV.rid);try{return NK_RT.mbSync(op);}catch(e){return false;}}
addEventListener('nk-rt-mb',e=>{const m=e.detail||{};if(!m.d)return;SRV.st=m;const S=gS();if(!S)return;S.mbSrvD=m.d;S.mbd={d:m.d,used:m.used|0,fish:m.fish|0,ads:m.ads|0};S.mbSup=!!m.sup;try{save();}catch(_){}if(m.ok===false)bubble('오늘 합성 횟수를 다 썼어요');if(ST.open){try{drawCnt();}catch(_){}}});
/* 접속하면 바로 한 번, 그 뒤로 1분마다 (보낼 게 있거나 합성판이 열려 있을 때) */
setInterval(()=>{try{if(!RTon())return;const S=gS();const due=!SRV.st||SRV.st.d!==kst()||SRV.pf||SRV.pa||(S&&S.mbOff&&S.mbOff.n>0)||(ST.open&&Date.now()-SRV.t>60e3);if(due&&Date.now()-SRV.t>4000)srvSync();}catch(e){}},2000);
// ── 물고기 ↔ 단계 ──
function tierOf(f){if(!f||f.sx)return -1;const vr=f.vr?fzVK(f.vr):'';if(vr){const i=VK.indexOf(vr);return i>=0&&(f.st|0)>=4?5+i:-1;}const s=f.st|0;return s>=0&&s<=4?s:-1;}
function pool(){const M=new Map();try{fzPool().forEach(f=>{if(f&&!f.sx&&FI(f.k)&&tierOf(f)>=0)M.set(f.id,f);});}catch(e){}return M;}
/* v200: 🪵 합성판 레벨 — 누적 합성 횟수가 늘면 판이 커져요 (Lv.1 5×5 → Lv.2 6×6 → Lv.3 7×7)
   기준 횟수는 관리자 › 테스트 기능 「🪵 합성판 레벨 기준」에서 모든 유저에게 (기본 1,000회 · 10,000회) · 켜고 끄기: LAB mbLv */
const LVDEF={l2:1000,l3:10000};
function lvCfg(){let c=null;try{c=B().mbLvCfg();}catch(e){}const l2=c&&+c.l2>0?+c.l2:LVDEF.l2,l3=c&&+c.l3>0?+c.l3:LVDEF.l3;return {l2,l3:Math.max(l2+1,l3)};}
const lvOn=()=>opt('mbLv','on')!=='off';
function tot(){const S=gS();return S?(S.mbTot|0):0;}
function lvl(){if(!lvOn())return 1;const c=lvCfg(),t=tot();return t>=c.l3?3:t>=c.l2?2:1;}
const NN=()=>4+lvl();
/* 판 크기 바꾸기: 물고기는 같은 줄·칸 자리 그대로 (판이 작아지면 남는 물고기는 빈 칸으로, 그래도 넘치면 보유 물고기로) · 연출 중에는 기다려요 */
function mbResize(b,N){const on=b.n||Math.round(Math.sqrt(b.cells.length))||N,old=b.cells,nw=Array(N*N).fill(null),extra=[];old.forEach((id,i)=>{if(id==null)return;const r=Math.floor(i/on),c=i%on;if(r<N&&c<N)nw[r*N+c]=id;else extra.push(id);});extra.forEach(id=>{const j=nw.indexOf(null);if(j>=0)nw[j]=id;});b.cells=nw;b.n=N;}
function mbS(){const S=gS();S.mb=S.mb||{};const b=S.mb;if(!Array.isArray(b.cells)){b.cells=Array(NN()*NN()).fill(null);b.n=NN();}if(!b.n)b.n=Math.round(Math.sqrt(b.cells.length))||5;if(b.cells.length!==b.n*b.n)mbResize(b,b.n);return b;}
function lvGrow(){const b=mbS(),N=NN();if(b.n===N)return false;if(ST.open&&(ST.ev.length||ST.flies.length||ST.drag||ST.hold.size))return false;const up=N>b.n;mbResize(b,N);try{save();}catch(e){}if(ST.open){ST.ov={};ST.hintP=null;layout();requestAnimationFrame(()=>{if(ST.open){layout();draw();slots();}});if(up){bubble(`🎉 합성판이 <b>${N}×${N}</b>로 커졌어요!`,2600);play('pop',6);}}return true;}
function sync(P){const b=mbS(),seen=new Set();let ch=0;b.cells=b.cells.map(id=>{if(id==null)return null;if(!P.has(id)||seen.has(id)){ch=1;return null;}seen.add(id);return id;});return ch;}
/* v204: 보유 물고기 거르기 [전체][★1]~[★5][변이] — 고른 칸은 기기에 기억해요 (S.mbTf) */
const TF=[['all','전체'],['0','★1'],['1','★2'],['2','★3'],['3','★4'],['4','★5'],['v','변이']];
function tfCur(){const S=gS();const v=S&&S.mbTf;return TF.some(x=>x[0]===v)?v:'all';}
function tfHit(tf,t){return tf==='all'||(tf==='v'?t>=5:String(t)===tf);}
function trayList(P,tf){if(tf===undefined)tf=tfCur();const b=mbS(),onB=new Set(b.cells.filter(x=>x!=null)),g={};for(const f of P.values()){if(onB.has(f.id))continue;const t=tierOf(f);/* v204: 무지개는 더 합칠 수 없어서 빼요 */if(t>=9||!tfHit(tf,t))continue;const key=f.k+'|'+t;(g[key]=g[key]||{k:f.k,t,list:[]}).list.push(f);}
 /* v193: 판에 이미 있는 물고기 종류가 먼저, 그다음 많은 순 */
 const kOn=new Set();for(const id of onB){const f=P.get(id);if(f)kOn.add(f.k);}
 return Object.values(g).sort((a,b)=>(kOn.has(b.k)?1:0)-(kOn.has(a.k)?1:0)||b.list.length-a.list.length||a.t-b.t||fnm(a.k).localeCompare(fnm(b.k),'ko'));}
const fnm=k=>{const F=FI(k);return F?F.n:k;};
const fimg=k=>{const F=FI(k);return (F&&F.img)||('img/fish/'+k+'.png');};
function itemHTML(k,t,n){const v=t>=5?FZV[VK[t-5]]:null,vk=t>=5?VK[t-5]:'';const s=t>=5?5:t+1;
 /* v204: 별 단계마다 크기·색 테두리(mt1~mt5) + 왼쪽 위 ★N 표 · 변이(mtv)는 모습 그대로, 크기만 ★5 */
 return `<div class="mbit ${vk?'mv-'+vk+' mtv':'mt'+s}"><img src="${esc(fimg(k))}" alt="" draggable="false" style="${v?'filter:'+v.fx:''}">${v?`<span class="mvb">${v.n}</span>`:`<span class="mtb">★${s}</span>`}<div class="mst"><span class="msf">${'★'.repeat(s)}<i>${'★'.repeat(5-s)}</i></span><span class="msc">★${s}</span></div>${n>1?`<span class="mnb">×${n}</span>`:''}</div>`;}
// ── 상태 ──
const ST={open:false,ev:[],flies:[],shakes:[],pops:[],drag:null,info:false,combo:0,last:-9e9,seen:{},sell:false,sel:new Set(),lad:null,cs:60,raf:0,ov:{},hold:new Set()};
// ── 소리 (게임 효과음 소리 크기·끄기를 따라요) ──
function AC(){try{const s=B().snd();if(s&&s.ctx&&s.on&&s.m)return [s.ctx,s.m];}catch(e){}return null;}
function noiseBuf(c){if(c._mbnb)return c._mbnb;const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0);let s=7;for(let i=0;i<d.length;i++){s=(s*16807)%2147483647;d[i]=s/1073741823-1;}return c._mbnb=b;}
function tn(c,o,t,f0,f1,du,ty,vo,at=.004){const os=c.createOscillator(),g=c.createGain();os.type=ty;os.frequency.setValueAtTime(f0,t);if(f1)os.frequency.exponentialRampToValueAtTime(f1,t+du);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vo,t+at);g.gain.exponentialRampToValueAtTime(.0001,t+du);os.connect(g);g.connect(o);os.start(t);os.stop(t+du+.05);}
function nz(c,o,t,du,vo,fq,q=1,ty='bandpass'){const s=c.createBufferSource();s.buffer=noiseBuf(c);const f=c.createBiquadFilter();f.type=ty;f.frequency.value=fq;f.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(vo,t);g.gain.exponentialRampToValueAtTime(.0001,t+du);s.connect(f);f.connect(g);g.connect(o);s.start(t);s.stop(t+du+.05);}
const NOTE=[523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.5,1567.98,1760];
function play(kind,r=0,cb=0){const a=AC();if(!a)return;const [c,m]=a;let o=c._mbOut;if(!o||o._m!==m){o=c.createGain();o.gain.value=.55;o.connect(m);o._m=m;c._mbOut=o;}const t=c.currentTime+.005,st=2**(cb/12);try{/* v201: 소리 크기를 재서 맞췄어요 — 합성(★1~★5)은 낚음 소리만큼, 놓기·실패는 작은 효과음만큼 */const O=c.createGain();O.gain.value=kind==='pop'?(r<5?2.5:1):({squish:3,place:3.4,deny:2.7,whoosh:5.5})[kind]||1;O.connect(o);setTimeout(()=>{try{O.disconnect();}catch(_){}},3000);
 if(kind==='squish'){tn(c,O,t,180,360,.09,'sine',.35);nz(c,O,t,.06,.12,900,2);return;}
 if(kind==='place'){tn(c,O,t,620,880,.11,'sine',.22);tn(c,O,t+.06,880,1180,.1,'triangle',.12);return;}
 if(kind==='deny'){tn(c,O,t,220,140,.14,'sine',.28);nz(c,O,t,.08,.08,300,1,'lowpass');return;}
 if(kind==='whoosh'){nz(c,O,t,.18,.14,1200,.8);return;}
 const f=NOTE[Math.min(r,9)]*st;tn(c,O,t,f*1.5,f,.16,'sine',.5);nz(c,O,t,.08+r*.012,.25+r*.03,1800+r*250,1.2);
 if(r>=2)tn(c,O,t+.02,f*2,0,.22,'triangle',.18);if(r>=3)[1,1.25,1.5].forEach((q,i)=>tn(c,O,t+.05+i*.05,f*2*q,0,.25,'triangle',.12));
 if(r>=5){tn(c,O,t,110,38,.5+r*.04,'sine',.75,.003);nz(c,O,t,.35,.35,180,.8,'lowpass');}if(r>=6)[0,4,7].forEach(s=>tn(c,O,t+.03,f*.5*2**(s/12),0,.6,'sawtooth',.045,.02));
 if(r>=7)nz(c,O,t+.02,.6,.18,4200,.7,'highpass');if(r>=8)for(let i=0;i<10;i++)tn(c,O,t+.1+i*.045,2000+((i*733)%1400),0,.14,'sine',.07);
 if(r>=9){[0,4,7,12,16,19,24].forEach((s,i)=>tn(c,O,t+.12+i*.075,523*2**(s/12),0,.5,'triangle',.16));tn(c,O,t,70,30,1.1,'sine',.85,.003);}}catch(e){}}
// ── 화면 ──
function build(){let m=$('mbd');if(m)return m;m=document.createElement('div');m.id='mbd';m.className='modal';
 m.innerHTML=`<div id="mbShk">
<div id="mbSide"><div class="mbttl">🐟 물고기 합성판</div><div class="mbcnt" id="mbCntP"></div><div class="mbsec mbq"><h4><span>🐟 보유 물고기</span><small>많은 순 · 누르면 빈 칸으로</small></h4><div class="mbtf" id="mbTfP" role="group" aria-label="별로 거르기"></div><div class="mbtw"><button class="mbarr" id="mbArrL" type="button" aria-label="앞 물고기">‹</button><div class="mbtray" id="mbQP"></div><button class="mbarr" id="mbArrR" type="button" aria-label="다음 물고기">›</button></div><div class="mbdots" id="mbDotsP"></div></div></div>
<div id="mbMain"><div class="mbhd"><button type="button" class="mbback" data-mbx aria-label="닫기">←</button><div class="mbttl">🐟 물고기 합성판</div><button type="button" class="mbs5" hidden></button><div class="mbpill"><img src="img/feat/coins-gold.png" alt=""><span class="mbcoin"></span></div></div>
<div class="mbcnt mob" id="mbCntM"></div><div class="mbwood" id="mbWood"><div class="mblvp" id="mbLvP"></div><div class="mbgrid" id="mbGrid"></div></div>
<div class="mbsec mbq mob"><h4><span>🐟 보유 물고기</span><button type="button" class="mbdexb" id="mbDexB" hidden></button></h4><div class="mbtf" id="mbTfM" role="group" aria-label="별로 거르기"></div><div class="mbtw"><div class="mbtray" id="mbQM"></div></div><div class="mbdots" id="mbDotsM"></div></div>
<div class="mbbb" id="mbBB"></div></div>
<div id="mbSide2"><div class="mbtop2"><button type="button" class="mbs5" hidden></button><div class="mbpill"><img src="img/feat/coins-gold.png" alt=""><span class="mbcoin"></span></div><button type="button" class="mbx" data-mbx aria-label="닫기">✕</button></div><div class="mbsec" id="mbLadW"><h4 id="mbLadH"></h4><div class="mblad" id="mbLad"></div></div><div class="mbsec mbdexw" id="mbDexW"><h4 id="mbDexH"></h4><div id="mbDex"></div></div></div>
</div><canvas id="mbFx"></canvas><div id="mbFly"></div><div id="mbDrag"></div><div id="mbDim"></div><div id="mbInfo" role="dialog" aria-label="합성 안내"></div>`;
 document.body.appendChild(m);
 m.querySelectorAll('[data-mbx]').forEach(b=>b.onclick=()=>close());
 $('mbDim').onclick=()=>infoClose();
 m.querySelectorAll('.mbtf').forEach(e=>e.addEventListener('click',ev=>{const b=ev.target.closest('[data-tf]');if(b)tfSet(b.dataset.tf);}));$('mbArrL').onclick=()=>trayBy(-1);m.querySelectorAll('.mbs5').forEach(b=>b.onclick=()=>s5Open());$('mbDexB').onclick=()=>dexOpen();$('mbArrR').onclick=()=>trayBy(1);
 ['mbQP','mbQM'].forEach(id=>{const t=$(id);t.addEventListener('scroll',dots,{passive:true});t.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){t.scrollLeft+=e.deltaY;e.preventDefault();}},{passive:false});t.addEventListener('click',e=>{const it=e.target.closest('.mbti');if(it)place(it.dataset.key,it.querySelector('.mbcell'));});});
 const g=$('mbGrid');g.addEventListener('pointerdown',gDown);g.addEventListener('contextmenu',e=>{const c=e.target.closest('.mbcell');if(!c||c.parentNode!==g)return;e.preventDefault();ST.drag=null;$('mbDrag').style.display='none';backOne(+c.dataset.i);});addEventListener('pointermove',gMove);addEventListener('pointerup',gUp);addEventListener('pointercancel',gUp);
 addEventListener('keydown',e=>{if(!ST.open||e.key!=='Escape')return;if(ST.info)infoClose();else close();});
 addEventListener('resize',()=>{if(ST.open){layout();draw();requestAnimationFrame(slots);}});
 new MutationObserver(()=>{const sh=m.classList.contains('show');if(!sh&&ST.open)closed();}).observe(m,{attributes:true,attributeFilter:['class']});
 new MutationObserver(ms=>{if(!ST.open)return;for(const x of ms)for(const n of x.addedNodes){if(n.classList&&n.classList.contains('boxget')){boxSlot(n);continue;}if(ANN.includes(n.id)||n.id==='tq'){requestAnimationFrame(slots);return;}}}).observe(document.body,{childList:true});
 return m;}
function layout(){const N=mbS().n,pc=PCL(),gap=pc?(N>=7?6:8):(N>=7?4:N>=6?5:6);let W;
 const md=$('mbd'),wd=$('mbWood');
 if(pc){md.classList.remove('mbcmp');ST.cmp=false;wd.style.margin='';$('mbMain').style.paddingBottom='';W=Math.min(640,innerWidth-300*2-18*4-16,innerHeight-36-84-12-56-20);}/* 84 = 위쪽 공지 띠 자리 · v205: 큰 화면은 640까지 */
 else{/* v205: 모바일은 판이 화면을 꽉 채우게 — 먼저 보통 배치로 재 보고, 판이 화면 너비만큼 못 커지면 「작은 배치」(횟수 한 줄·목록 낮게·버튼 낮게)로 바꿔서 다시 재요
   판 = min(화면 너비 − 24, 남는 높이) · 남는 높이는 판 위아래로 나눠서 가운데에 · 스크롤이 생기지 않게 */
  const main=$('mbMain'),bb=$('mbBB'),oh=e=>{if(!e||!e.offsetParent)return 0;const c=getComputedStyle(e);return e.offsetHeight+parseFloat(c.marginTop)+parseFloat(c.marginBottom);};
  const fit=()=>{let u=0;for(const ch of main.children){if(ch===wd||ch===bb)continue;u+=oh(ch);}const sh=$('mbShk'),pt=parseFloat(getComputedStyle(sh).paddingTop)||0;return innerHeight-pt-u-(bb?bb.offsetHeight:0)-24-20;};/* 24 = 판 위(판 Lv 띠 16) · 아래(8) · 20 = 나무 테두리 (W는 테두리 안쪽 크기) */
  const want=Math.min(540,innerWidth-44);/* 나무판 바깥 너비 = 화면 − 24 */md.classList.remove('mbcmp');ST.cmp=false;drawCnt();let H=fit();
  if(H<want){md.classList.add('mbcmp');ST.cmp=true;drawCnt();H=fit();}
  W=Math.min(want,H);const ex=Math.max(0,H-W);wd.style.margin=`${Math.round(16+ex/2)}px auto ${Math.floor(8+ex/2)}px`;main.style.paddingBottom=(bb?bb.offsetHeight:0)+'px';}
 /* v200: 판이 커지면(6×6·7×7) 칸을 작게 해서 화면 안에 들어가게 · 가장 작은 칸 28px */W=Math.max(N*28+12+gap*(N-1),W);const cs=Math.floor((W-12-gap*(N-1))/N);ST.cs=cs;const g=$('mbGrid');g.style.gridTemplateColumns=`repeat(${N},${cs}px)`;g.style.setProperty('--cs',cs+'px');g.style.setProperty('--mbBk',Math.max(.5,Math.min(.9,cs/100)).toFixed(3));g.style.gap=gap+'px';
 if(g.children.length!==N*N){g.innerHTML='';for(let i=0;i<N*N;i++){const d=document.createElement('div');d.className='mbcell';d.dataset.i=i;g.appendChild(d);}}
 [...g.children].forEach(d=>{d.style.width=d.style.height=cs+'px';});const fx=$('mbFx'),dp=Math.min(2,devicePixelRatio||1);fx.width=innerWidth*dp;fx.height=innerHeight*dp;}
/* 판이 열려 있는 동안 공지 띠(#stAnn)·알림(#tq)이 판·목록·버튼을 가리지 않게 빈 자리로 옮겨요
   PC: 판 위쪽 띠(작게) · 모바일: 목록과 아래 버튼 사이(작게). 자리가 너무 좁으면 원래 자리 그대로 */
/* v197: 공지 띠(#stAnn) · ★5 띠(#s5ban) · 운영자 공지(#annBar) · 작은 알림(#tq) 모두 판·목록·버튼을 가리지 않는 자리로
   PC: 판 위쪽 빈 띠 · 모바일: 목록과 아래 버튼 사이, 좁으면 맨 위 제목 줄(누르기는 통과) · 크기는 자리에 맞게 줄여요 */
const ANN=['stAnn','s5ban','annBar'];
function natH(el){let t=1e9,bt=-1e9;const sc=parseFloat(el.style.getPropertyValue('--mbS'))||1;[el,...el.querySelectorAll('*')].forEach(c=>{const r=c.getBoundingClientRect();if(r.height>4&&r.width>4){t=Math.min(t,r.top);bt=Math.max(bt,r.bottom);}});if(bt<t)return el.offsetHeight||60;return Math.max(24,Math.min(220,(bt-t)/(document.body.classList.contains('mb-ann')?sc:1)));}
function slots(){const B0=document.body,st=B0.style;const hs={};ANN.forEach(id=>{const e=$(id);if(e)hs[id]=natH(e);});
 const ALL=['mb-ann','mb-annT','mb-annB','mb-tqB','mb-tqT','mb-miniT'],want=new Set(),fin=()=>ALL.forEach(c=>B0.classList.toggle(c,want.has(c)));/* 지웠다 다시 붙이면 띠가 매번 처음부터 움직여요 → 바뀐 것만 */
 if(!ST.open){fin();return;}
 let top=null,bot=null,room;
 if(PCL()){const w=$('mbWood').getBoundingClientRect();top=6;room=w.top-12;}
 else{const q=$('mbMain').querySelector('.mbq.mob').getBoundingClientRect(),bt=$('mbBB').querySelector('button'),bb=bt?bt.getBoundingClientRect().top:innerHeight-60,gap=bb-q.bottom;
  if(gap>=30){bot=Math.round(innerHeight-bb+4);room=gap-8;}else{const hd=$('mbMain').querySelector('.mbhd').getBoundingClientRect();top=Math.max(2,hd.top+2);room=Math.max(30,hd.height-4);}
  /* v201: 작은 알림(#miniT, 창이 열려 있을 때 낚은 물고기)도 아래 버튼을 가리지 않게 맨 위 제목 줄로 */{const hd=$('mbMain').querySelector('.mbhd').getBoundingClientRect();st.setProperty('--mbMiniT',Math.round(Math.max(2,hd.top+(hd.height-38)/2))+'px');want.add('mb-miniT');}
  if(gap>=44){st.setProperty('--mbTqB',Math.round(innerHeight-bb+4)+'px');want.add('mb-tqB');}else{st.setProperty('--mbTqT',Math.round(Math.max(2,$('mbMain').querySelector('.mbhd').getBoundingClientRect().top+2))+'px');want.add('mb-tqT');}}
 /* 동시에 여러 개면 위아래로 나란히 (자리에 다 들어가게 함께 줄여요) */
 const vis=ANN.filter(id=>{const e=$(id);if(!e||!e.children.length)return false;const c=getComputedStyle(e);return c.display!=='none'&&c.visibility!=='hidden'&&!(id==='s5ban'&&!e.classList.contains('on'));});
 const sum=vis.reduce((a,id)=>a+(hs[id]||60),0)+Math.max(0,vis.length-1)*4,sc=Math.max(.35,Math.min(.85,room/(sum||60)));let off=0;
 (top!=null?vis:vis.slice().reverse()).forEach(id=>{const e=$(id);e.style.setProperty('--mbS',sc.toFixed(3));e.style.setProperty('--mbO',Math.round(off)+'px');off+=(hs[id]||60)*sc+4;});
 ANN.filter(id=>!vis.includes(id)).forEach(id=>{const e=$(id);if(e){e.style.setProperty('--mbS',Math.max(.35,Math.min(.85,room/(hs[id]||60))).toFixed(3));e.style.setProperty('--mbO','0px');}});
 if(top!=null){st.setProperty('--mbAnnT',top+'px');want.add('mb-ann');want.add('mb-annT');}else{st.setProperty('--mbAnnB',bot+'px');want.add('mb-ann');want.add('mb-annB');}fin();}
/* v201: 🎁 행운 상자 획득 알림도 판·목록·버튼을 가리지 않는 빈 자리로 — PC: 왼쪽 보유 물고기 아래 · 모바일: 목록과 아래 버튼 사이(좁으면 맨 위 제목 줄, 작게) */
function boxSlot(el){if(!ST.open||!el)return;const set=(k,v)=>el.style.setProperty(k,v,'important');el.classList.add('mbbx');
 if(PCL()){const sd=$('mbSide'),secs=[...sd.querySelectorAll('.mbsec')].filter(e=>e.offsetParent),r=sd.getBoundingClientRect(),lb=(secs[secs.length-1]||sd).getBoundingClientRect(),sc=Math.max(.6,Math.min(.9,(r.width-6)/Math.max(200,el.offsetWidth||330)));
  set('left',Math.round(r.left+r.width/2)+'px');set('top',Math.round(Math.min(lb.bottom+14,innerHeight-110))+'px');set('bottom','auto');set('scale',sc.toFixed(3));return;}
 el.classList.add('mbbxS');const q=$('mbMain').querySelector('.mbq.mob').getBoundingClientRect(),bt=$('mbBB').querySelector('button'),bb=bt?bt.getBoundingClientRect().top:innerHeight-60,gap=bb-q.bottom,h=el.offsetHeight||44;set('left','50%');
 if(gap>=h+8){set('top','auto');set('bottom',Math.round(innerHeight-bb+4)+'px');}else{const hd=$('mbMain').querySelector('.mbhd').getBoundingClientRect();set('top',Math.round(hd.bottom+4)+'px');set('bottom','auto');}}
function fxClear(){const fx=$('mbFx');if(fx){const g2=fx.getContext('2d');g2.setTransform(1,0,0,1,0,0);g2.clearRect(0,0,fx.width,fx.height);}}
function cellEl(i){return $('mbGrid').children[i];}
function draw(){if(!ST.open)return;if(lvGrow())return;const P=pool();if(sync(P))try{save();}catch(e){}ST.P=P;const b=mbS();
 b.cells.forEach((id,i)=>{const e=cellEl(i);if(!e)return;const f=id!=null?P.get(id):null,ov=ST.ov[i],hold=ST.hold.has(i);const h=hold?'':ov?itemHTML(ov.k,ov.t):f?itemHTML(f.k,tierOf(f))+(f.lock&&!f.alk?'':(f.alk?'<span class="mblk" title="자동 잠금(변이)">🔒</span>':'')):'';if(e._h!==h){e.innerHTML=h;e._h=h;}e.className='mbcell'+(hold?' mwait':(!f&&!ov?' mempty':''))+(ST.sell&&f&&ST.sel.has(id)?' msel':'')+(ST.hintP&&ST.hintP.includes(i)&&f?' mbhint':'');});
 drawCnt();drawTray(P);drawLad(P);drawDex(P);drawS5();drawLv();drawBB();
 document.querySelectorAll('#mbd .mbcoin').forEach(e=>{const S=gS(),n=S?S.coins|0:0;/* v195: 모바일 위 줄은 좁아서 900만처럼 줄여요 */e.textContent=!PCL()&&s5On()?shortN(n):n.toLocaleString();});}
function drawCnt(){const d=day(),fb=fishB(d.fish),cap=MB_CFG.fishMax/MB_CFG.fishAmt*MB_CFG.fishStep,nxt=d.fish>=cap?null:MB_CFG.fishStep-d.fish%MB_CFG.fishStep,pc=PCL();
 const nxtT=nxt?`다음 <b>+${MB_CFG.fishAmt}회</b>까지 ${nxt}마리`:'낚시 보너스 최대';const ticks=pc?[400,800]:[200,400,600,800];
 const mid=`<div class="mr1"><div class="mic">⚒</div><div><div class="mlb">오늘 남은 합성</div><div class="mnum">${infOn()?'∞<small> 테스트 무제한</small>':`${left()}<small> / ${total()}</small>`}</div></div><button class="mbibtn" type="button" aria-label="합성 정보">i</button></div>`;
 const bar=`<div class="mfbar"><i style="width:${Math.min(100,d.fish/cap*100)}%"></i>${ticks.map(m=>`<s class="${d.fish>=m?'mok':''}" style="left:calc(${m/cap*100}% - 2px)"></s>`).join('')}</div><div class="mticks">${ticks.map(m=>`<span style="left:${m/cap*100}%;${m===cap?'transform:translateX(-80%)':m===200?'transform:translateX(-30%)':''}">${m}회${pc?'':'<br><b>+'+(m/MB_CFG.fishStep*MB_CFG.fishAmt)+'</b>'}</span>`).join('')}</div>`;
 const cmp=!pc&&ST.cmp,barC=`<div class="mfbar"><i style="width:${Math.min(100,d.fish/cap*100)}%"></i>${(pc?[400,800]:[200,400,600,800]).map(m=>`<s class="${d.fish>=m?'mok':''}" style="left:calc(${m/cap*100}% - 1.5px)"></s>`).join('')}</div>`;
 /* v205: 작은 배치 — 남은 횟수·낚시 보너스를 한 줄로 */const midC=`<div class="mr1"><div class="mic">⚒</div><div class="mcm"><div class="mlb">오늘 남은 합성</div><div class="mnum">${infOn()?'∞<small> 무제한</small>':`${left()}<small> / ${total()}</small>`}</div></div><div class="mcf"><span>🎣 ${d.fish}회 · 보너스 <b>${fb}</b>/${MB_CFG.fishMax}</span><span>${nxt?`다음 <b>+${MB_CFG.fishAmt}</b>까지 ${nxt}마리`:'보너스 최대'}</span></div><button class="mbibtn" type="button" aria-label="합성 정보">i</button></div>`;
 const h=cmp?`${midC}${barC}`:pc?`${mid}<div class="mfps"><span>🎣 낚시 ${d.fish}회</span><span>보너스 ${fb}/${MB_CFG.fishMax}</span></div><div class="mfp"><span>${nxtT}</span></div>${bar}`:`${mid}<div class="mfp"><span>🎣 오늘 낚시 ${d.fish}회 · 보너스 ${fb}/${MB_CFG.fishMax}</span><span>${nxtT}</span></div>${bar}`;
 ['mbCntM','mbCntP'].forEach(id=>{const e=$(id);if(cmp&&id==='mbCntP')return;if(e&&e._h!==h){e.innerHTML=h;e._h=h;e.querySelector('.mbibtn').onclick=()=>infoOpen();}});if(ST.info===true)infoBody();}
function trayEl(){return PCL()?$('mbQP'):$('mbQM');}
function tfCounts(P){const b=mbS(),onB=new Set(b.cells.filter(x=>x!=null)),c={all:0,v:0};for(const f of P.values()){if(onB.has(f.id))continue;const t=tierOf(f);if(t<0||t>=9)continue;c.all++;if(t>=5)c.v++;else c[t]=(c[t]|0)+1;}return c;}
function drawTf(P){const c=tfCounts(P),cur=tfCur();const h=TF.map(([k,n])=>{const v=c[k]|0;return `<button type="button" class="mtf ${k===cur?'on':''} ${v?'':'zero'}" data-tf="${k}" aria-pressed="${k===cur}"><span>${n}</span><b>${v>999?'999+':v}</b></button>`;}).join('');document.querySelectorAll('#mbd .mbtf').forEach(e=>{if(e._h!==h){e.innerHTML=h;e._h=h;}});}
function tfSet(k){const S=gS();if(!S||!TF.some(x=>x[0]===k))return;S.mbTf=k;try{save();}catch(e){}ST.tfReset=1;['mbQP','mbQM'].forEach(id=>{const t=$(id);if(t)t.scrollLeft=0;});play('place');draw();}
function drawTray(P){drawTf(P);const L=trayList(P);ST.tray=L;ST.trayA=tfCur()==='all'?L:trayList(P,'all');const h=L.length?`<div class="mbstrip">${L.map(g=>`<button type="button" class="mbti" data-key="${g.k}|${g.t}"><div class="mbcell">${itemHTML(g.k,g.t,g.list.length)}</div><div class="mnm">${esc(fnm(g.k))}</div></button>`).join('')}</div>`:(tfCur()==='all'?`<div class="mbempty">합성할 물고기가 없어요<br><small>낚시로 잡은 물고기가 여기 보여요</small></div>`:`<div class="mbempty">${esc((TF.find(x=>x[0]===tfCur())||['',''])[1])} 물고기가 없어요<br><small>「전체」를 누르면 모두 보여요</small></div>`);
 /* v204: 거르기를 바꾸면 늘 맨 앞부터 — 밀던 스크롤(관성·부드러운 이동)이 남아 있어도 다음 프레임에 한 번 더 맨 앞으로 맞춰서 목록이 빈 것처럼 보이지 않게 */const rs=ST.tfReset;ST.tfReset=0;
 ['mbQP','mbQM'].forEach(id=>{const t=$(id);if(t._h!==h){const sl=rs?0:t.scrollLeft;t.innerHTML=h;t._h=h;t.scrollLeft=Math.min(sl,Math.max(0,t.scrollWidth-t.clientWidth));}else if(rs)t.scrollLeft=0;});if(rs)requestAnimationFrame(()=>{['mbQP','mbQM'].forEach(id=>{const t=$(id);if(t)t.scrollLeft=0;});dots();});dots();}
function dots(){const t=trayEl();if(!t)return;const max=Math.max(0,t.scrollWidth-t.clientWidth),pg=Math.max(1,Math.ceil((max+1)/(t.clientWidth*.8||1))),cur=max<=0?0:Math.round(t.scrollLeft/max*(pg-1));const h=pg<=1?'':Array.from({length:pg},(_,i)=>`<i class="${i===cur?'mon':''}"></i>`).join('');['mbDotsM','mbDotsP'].forEach(id=>{const e=$(id);if(e&&e._h!==h){e.innerHTML=h;e._h=h;}});const L=$('mbArrL'),R=$('mbArrR');if(L){L.disabled=t.scrollLeft<=1;R.disabled=t.scrollLeft>=max-1;}}
function trayBy(dir){const t=trayEl();if(t)t.scrollBy({left:dir*t.clientWidth*.8,behavior:'smooth'});}
function drawLad(P){const b=mbS();let k=ST.lad;if(!k||!FI(k)){const id=b.cells.find(x=>x!=null&&P.get(x));k=id!=null?P.get(id).k:(ST.tray&&ST.tray[0]?ST.tray[0].k:null);}if(!k){$('mbLadW').style.display='none';return;}$('mbLadW').style.display='';
 const h=`<span>📜 ${esc(fnm(k))} 합성 계보</span><small>2개 → 1개</small>`;if($('mbLadH')._h!==h){$('mbLadH').innerHTML=h;$('mbLadH')._h=h;}
 const l=[0,2,4,5,8,9].map(t=>`<div><div class="mbcell">${itemHTML(k,t)}</div>${LV[t]}<em>★1 ${2**t}마리</em></div>`).join('');if($('mbLad')._h!==l){$('mbLad').innerHTML=l;$('mbLad')._h=l;}}
/* v195: ⭐ 별 교환소 · 📖 변이 도감(세트 보상 · 등급 첫 ★5 칭호) */
const s5On=()=>{try{return !!B().s5On();}catch(e){return false;}};
const shortN=n=>n>=1e8?(Math.floor(n/1e7)/10)+'억':n>=1e5?Math.floor(n/1e4).toLocaleString()+'만':n.toLocaleString();
function drawS5(){const on=s5On();let n=0;try{n=B().s5N()|0;}catch(e){}const h=`<img src="img/feat/shard.png" alt=""><span>교환소</span><b>${n}</b>`;document.querySelectorAll('#mbd .mbs5').forEach(b=>{b.hidden=!on;if(b._h!==h){b.innerHTML=h;b._h=h;}});}
function s5Open(){try{B().s5Shop();const m=$('s5x');if(m)m.style.zIndex=95;}catch(e){}}
function dexK(P){return ST.lad&&FI(ST.lad)?ST.lad:(()=>{const b=mbS(),id=b.cells.find(x=>x!=null&&P.get(x));return id!=null?P.get(id).k:(ST.tray&&ST.tray[0]?ST.tray[0].k:null);})();}
function dexN(k){let sp={};try{sp=fzSP()[k]||{};}catch(e){}return {sp,n:VK.filter(v=>sp[v]).length};}
function ttlHTML(){let on=false;try{on=B().fzGrOn();}catch(e){}if(!on)return '';const z=fzS(),g5=z.g5||{};let ch='',got=0;for(let g=0;g<6;g++){let nm='';try{nm=B().GR(g).n;}catch(e){}if(g5[g])got++;ch+=`<i class="${g5[g]?'on':''}">${g5[g]?'✓ ':''}${esc(nm)}</i>`;}
 return `<div class="mdxt"><div class="mdxth"><b>🏅 등급별 첫 ★5 칭호</b><small>${got}/6 · 「등급 별 장인」</small></div><div class="mdxtr">${ch}</div></div>`;}
function dexHTML(k){const {sp}=dexN(k);const slots=VK.map((v,i)=>`<div class="mdx ${sp[v]?'':'no'}"><div class="mbcell">${itemHTML(k,5+i)}</div><span>${LV[5+i]}${sp[v]?'':' ?'}</span></div>`).join('');let set='';try{set=B().setHTML(k)||'';}catch(e){}return `<div class="mdxr">${slots}</div>${set}${ttlHTML()}`;}
function dexBind(R){try{B().setBind(R);}catch(e){}R.querySelectorAll('[data-fzset]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{const c=$('confirm');if(c)c.style.zIndex=96;draw();if(ST.info==='dex')dexBody();},0)));}
function drawDex(P){const k=dexK(P),W=$('mbDexW'),bt=$('mbDexB');if(!k){W.style.display='none';bt.hidden=true;return;}W.style.display='';const {sp,n}=dexN(k),ready=n>=5;
 const hh=`<span>📖 ${esc(fnm(k))} 변이 도감</span><small>${n}/5</small>`;if($('mbDexH')._h!==hh){$('mbDexH').innerHTML=hh;$('mbDexH')._h=hh;}
 const h=dexHTML(k);if($('mbDex')._h!==h){$('mbDex').innerHTML=h;$('mbDex')._h=h;dexBind($('mbDex'));}
 const bh=`📖 ${esc(fnm(k))} 도감 <b>${n}/5</b>${ready?' <em>🎁</em>':''}`;bt.hidden=false;if(bt._h!==bh){bt.innerHTML=bh;bt._h=bh;}bt.classList.toggle('rdy',ready);ST.dexK=k;if(ST.info==='dex')dexBody();}
function dexBody(){const k=ST.dexK;if(!k)return;const {n}=dexN(k),h=`<div class="minfohd"><div class="mt">📖 ${esc(fnm(k))} 변이 도감 <small>${n}/5</small></div><button class="miclose" type="button">닫기</button></div><div class="mbdexp">${dexHTML(k)}</div>`;const I=$('mbInfo');if(I._dh===h)return;I._dh=h;I.innerHTML=h;I.querySelector('.miclose').onclick=()=>infoClose();dexBind(I);}
function dexOpen(){ST.info='dex';$('mbInfo')._dh='';dexBody();$('mbDim').classList.add('mon');$('mbInfo').classList.add('mon');}
function drawLv(){const e=$('mbLvP');if(!e)return;if(!lvOn()){e.hidden=true;return;}e.hidden=false;const L=lvl(),c=lvCfg(),t=tot(),N=4+L,nx=L===1?c.l2:L===2?c.l3:0;
 const h=`🪵 판 Lv.${L} <span>${N}×${N}</span>${nx?`<em>${(N+1)}×${(N+1)}까지 ${Math.max(0,nx-t).toLocaleString()}회</em>`:'<em>최대</em>'}`;if(e._h!==h){e.innerHTML=h;e._h=h;}e.onclick=()=>infoOpen();}
function drawBB(){const bb=$('mbBB');let h;if(ST.sell){const n=ST.sel.size,P=ST.P||pool();let co=0;ST.sel.forEach(id=>{const f=P.get(id);if(f&&!f.lock)try{co+=sellP(f);}catch(e){}});
  h=`<button type="button" class="mb1" data-bb="back">↩ 판에서 빼기${n?' '+n:''}</button><button type="button" class="mb3" data-bb="sellgo" ${n?'':'disabled'}>💰 ${n?n+'마리 팔기 · '+co.toLocaleString():'고르면 팔기'}</button><button type="button" class="mb0" data-bb="done">닫기</button>`;}
 else h=`${tidyOn()?'<button type="button" class="mb1" data-bb="tidy">🧺 정리</button>':''}<button type="button" class="mb3" data-bb="sell">💰 판매·방생</button>`;
 if(bb._h!==h){bb.innerHTML=h;bb._h=h;bb.querySelectorAll('[data-bb]').forEach(x=>x.onclick=()=>bbAct(x.dataset.bb));}bb.classList.toggle('sellm',ST.sell);}
// ── 정보 창 ──
function adOk(){return opt('afPay','off')!=='off';}/* 광고는 아직 시험 화면이라, 자동 낚시 광고 창(afPay)을 켠 경우에만 보여요 */
function infoBody(){const d=day(),fb=fishB(d.fish),ab=adB(d.ads),sp=isSup()?MB_CFG.supAmt:0,tt=total();
 $('mbInfo').innerHTML=`<div class="minfohd"><div class="mt">ⓘ 합성 안내</div><button class="miclose" type="button">닫기</button></div>
<div class="mistep"><div class="mic">✋</div><p>물고기를 누르면 합성판의 <b>다음 빈 칸</b>으로 들어가요. 왼쪽 위부터 한 줄씩 채워져요.</p></div>
<div class="mistep"><div class="mic">🧩</div><p><b>같은 물고기 · 같은 단계</b>를 끌어서 겹치면 하나로 합쳐져요 (2개 → 1개).</p></div>
<div class="mistep" style="border-bottom:0"><div class="mic">✨</div><p>★1~★4는 운 좋으면 한 단계 더 올라가요 <b>(${Math.round(MB_CFG.luck*100)}%)</b>.<br>★5부터는 한 단계씩만 올라가요.<br>한 번 합칠 때 쓰는 횟수는 <b>1회</b>예요.</p></div>
${lvOn()?(()=>{const c=lvCfg(),t=tot(),L=lvl();return `<div class="milv"><h5><span>🪵 합성판 레벨</span><small>지금까지 합성 ${t.toLocaleString()}회</small></h5>${[[1,5,0],[2,6,c.l2],[3,7,c.l3]].map(([l,n,need])=>`<div class="mrow ${L===l?'mnow':''} ${t>=need?'mok':''}"><span>Lv.${l} · ${n}×${n}</span><b>${need?'누적 '+need.toLocaleString()+'회':'처음'}</b></div>`).join('')}</div>`;})():''}<div class="mireset">🌙 매일 자정(한국 시간)에 초기화돼요.<br>남은 횟수는 다음 날로 넘어가지 않아요.</div>
<div class="mibrk"><h5>오늘 받은 횟수</h5><div class="mrow"><span>기본</span><b>+${MB_CFG.base}</b></div><div class="mrow"><span>낚시 보너스 (${d.fish}회)</span><b>+${fb}</b></div><div class="mrow"><span>광고 보기 (${d.ads}회)</span><b>+${ab}</b></div><div class="mrow"><span>후원자 혜택 (3천원 이상)</span><b>+${sp}</b></div>
<div class="mrow mtot"><span>오늘 총량</span><b>${tt}</b></div><div class="mrow"><span>사용한 횟수</span><b>${Math.min(d.used,tt)}</b></div><div class="mrow mtot"><span>남은 횟수</span><b>${left()}</b></div></div>
${adOk()?`<button type="button" class="miad" ${d.ads*MB_CFG.adAmt>=MB_CFG.adMax?'disabled':''}>▶ 광고 보고 +${MB_CFG.adAmt}회 <small>(오늘 ${Math.min(d.ads,MB_CFG.adMax/MB_CFG.adAmt)}/${MB_CFG.adMax/MB_CFG.adAmt})</small></button>`:''}`;
 $('mbInfo').querySelector('.miclose').onclick=()=>infoClose();const ad=$('mbInfo').querySelector('.miad');if(ad)ad.onclick=()=>adPlay();}
function infoOpen(){ST.info=true;$('mbInfo')._dh='';infoBody();$('mbDim').classList.add('mon');$('mbInfo').classList.add('mon');}
function infoClose(){ST.info=false;$('mbDim').classList.remove('mon');$('mbInfo').classList.remove('mon');}
/* 광고: 자동 낚시 광고와 같은 시험 화면(#afAd 모양)을 써요. 실제 광고 SDK를 붙이면 끝난 순간 NK_MB.adWatched() 만 부르면 돼요 */
function adPlay(){const d=day();if(d.ads*MB_CFG.adAmt>=MB_CFG.adMax)return say('오늘 볼 수 있는 광고를 다 봤어요',1800);let m=$('afAd');if(!m){m=document.createElement('div');m.id='afAd';document.body.appendChild(m);}
 const T=MB_CFG.adSec;m.innerHTML=`<div class="adv0"><div class="adtag">광고 · 테스트 화면</div><div class="adbox0"><div class="adfish">🐟</div><b>여기에 ${T}초 광고가 나와요</b><small>출시 전이라 실제 광고 대신 기다리는 화면이에요</small></div><div class="adbar"><i></i></div><div class="adbt"><span id="adLeft">${T}초</span><button type="button" id="adSkip">끝까지 보면 합성 +${MB_CFG.adAmt}회</button></div></div>`;m.classList.add('on');m.style.zIndex=90;
 const bar=m.querySelector('.adbar i'),lb=m.querySelector('#adLeft'),sk=m.querySelector('#adSkip');sk.disabled=true;const t0=Date.now();
 const iv=setInterval(()=>{const e=(Date.now()-t0)/1000,l=Math.max(0,Math.ceil(T-e));bar.style.width=Math.min(100,e/T*100)+'%';lb.textContent=l?l+'초':'완료';if(l<=0){clearInterval(iv);sk.disabled=false;sk.textContent=`합성 +${MB_CFG.adAmt}회 받기`;sk.onclick=()=>{m.classList.remove('on');m.style.zIndex='';adWatched();};}},250);
 m.onclick=e=>{if(e.target===m&&sk.disabled)say('광고를 끝까지 보면 보상을 받아요',1400);};}
function adWatched(){const d=day();if(d.ads*MB_CFG.adAmt>=MB_CFG.adMax)return false;d.ads++;if(RTon())SRV.pa++;try{save();}catch(e){}if(ST.open){drawCnt();bubble(`광고 보상 · 합성 +${MB_CFG.adAmt}회`);}else say(`🪵 합성 +${MB_CFG.adAmt}회를 받았어요`,2000);return true;}
// ── 판 안 알림 ──
function bubble(msg,ms=1400){const w=$('mbWood');if(!w)return;const r=w.getBoundingClientRect(),d=document.createElement('div');d.className='mbtoast';d.innerHTML=msg;d.style.left=(r.left+r.width/2)+'px';d.style.top=(r.top+Math.min(64,r.height*.18))+'px';$('mbd').appendChild(d);d._t0=performance.now();d._ms=ms;ST.pops.push(d);kick();}
// ── 트레이 → 빈 칸 ──
function place(key,fromEl){if(ST.sell){bubble('판매 모드를 닫고 넣어 주세요');return;}const P=ST.P||pool(),G0=(ST.tray||[]).find(g=>g.k+'|'+g.t===key);if(!G0||!G0.list.length)return;const b=mbS(),i=b.cells.findIndex(x=>x==null);
 const it=fromEl&&fromEl.closest('.mbti');if(i<0){if(it){it.classList.remove('mbshake');void it.offsetWidth;it.classList.add('mbshake');}bubble('빈 칸이 없어요');play('deny');return;}
 /* v193: 한 번 누르면 그 물고기를 모두 판에 넣어요 (빈 칸만큼) */
 const fs=G0.list.slice().sort((a,c)=>(a.v||0)-(c.v||0)),emp=[];b.cells.forEach((x,j)=>{if(x==null)emp.push(j);});const n=Math.min(fs.length,emp.length);
 const r=fromEl?fromEl.getBoundingClientRect():{left:innerWidth/2-27,top:innerHeight-120,width:54,height:54},now=performance.now(),gap=Math.max(28,Math.min(70,700/n));
 for(let q=0;q<n;q++){const f=fs[q],j=emp[q];b.cells[j]=f.id;const c=cellEl(j).getBoundingClientRect();ST.hold.add(j);ST.flies.push({k:f.k,t:tierOf(f),x0:r.left+r.width/2,y0:r.top+r.height/2,x1:c.left+c.width/2,y1:c.top+c.height/2,t0:now+q*gap,dur:320,to:j});}
 ST.lad=fs[0].k;try{save();}catch(e){}if(n<fs.length)bubble(`빈 칸이 모자라서 ${n}마리만 넣었어요`);play('whoosh');draw();kick();}
// ── 판 끌기 ──
function gDown(e){poke();if(e.button===2)return;if(ST.info||!ST.open)return;const c=e.target.closest('.mbcell');if(!c||c.parentNode!==$('mbGrid'))return;const i=+c.dataset.i,b=mbS();settle(i);const id=b.cells[i];if(id==null||ST.hold.has(i))return;e.preventDefault();
 ST.drag={from:i,id,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,moved:false,pid:e.pointerId};
 /* v194: 손가락으로 꾹 누르고 있으면(0.6초) 보유 물고기로 돌려놔요 · 마우스는 오른쪽 클릭 */
 if(e.pointerType!=='mouse'){const d=ST.drag;clearTimeout(ST.lp);ST.lp=setTimeout(()=>{if(ST.drag===d&&!d.moved&&!ST.sell){ST.drag=null;d.lp=1;backOne(i);}},600);}}
/* v194: 판의 물고기 1마리를 보유 물고기로 (오른쪽 클릭·꾹 누르기) */
function backOne(i){if(ST.sell||ST.hold.has(i))return;settle(i);const b=mbS(),id=b.cells[i];if(id==null)return;const P=ST.P||pool(),f=P.get(id);b.cells[i]=null;try{save();}catch(e){}
 const c=cellEl(i),t=document.querySelector('#mbd .mbstrip')||$('mbBB');if(f&&c&&t){const r=c.getBoundingClientRect(),q=t.getBoundingClientRect(),el=document.createElement('div'),cs=ST.cs;el.className='mbcell mbret';el.style.cssText=`position:fixed;left:0;top:0;width:${cs}px;height:${cs}px;--cs:${cs}px;z-index:60;pointer-events:none;transform:translate(${r.left}px,${r.top}px);transition:transform .32s cubic-bezier(.5,0,.6,1),opacity .32s`;el.innerHTML=itemHTML(f.k,tierOf(f));$('mbd').appendChild(el);requestAnimationFrame(()=>requestAnimationFrame(()=>{el.style.transform=`translate(${q.left+q.width/2-cs/2}px,${q.top+q.height/2-cs/2}px) scale(.55)`;el.style.opacity='.2';}));setTimeout(()=>el.remove(),380);}
 play('whoosh');draw();bubble(f?`${esc(fnm(f.k))}${jo(fnm(f.k))} 보유 물고기로 돌려놨어요`:'보유 물고기로 돌려놨어요',1100);}
function gMove(e){const d=ST.drag;if(!d||e.pointerId!==d.pid)return;if(Math.hypot(e.clientX-d.x0,e.clientY-d.y0)>6)clearTimeout(ST.lp);d.x=e.clientX;d.y=e.clientY;if(!d.moved&&Math.hypot(d.x-d.x0,d.y-d.y0)>6){if(ST.sell){return;}d.moved=true;const f=(ST.P||pool()).get(d.id);if(!f){ST.drag=null;return;}const cs=ST.cs;$('mbDrag').innerHTML=`<div class="mbcell" style="width:${cs}px;height:${cs}px;--cs:${cs}px">${itemHTML(f.k,tierOf(f))}</div>`;$('mbDrag').style.display='block';cellEl(d.from).style.opacity=.35;hint(d.from,true);play('squish',0);}
 if(d.moved){const D=$('mbDrag'),cs=ST.cs;D.style.transform=`translate(${d.x-cs*.5}px,${d.y-cs*.75}px) rotate(-6deg) scale(1.15)`;}}
function gUp(e){clearTimeout(ST.lp);const d=ST.drag;if(!d||(e.pointerId!==d.pid))return;ST.drag=null;$('mbDrag').style.display='none';const fe=cellEl(d.from);if(fe)fe.style.opacity='';hint(d.from,false);
 if(!d.moved){if(ST.sell){ST.sel.has(d.id)?ST.sel.delete(d.id):ST.sel.add(d.id);draw();}else{const f=(ST.P||pool()).get(d.id);if(f){ST.lad=f.k;drawLad(ST.P||pool());}}return;}
 const el=document.elementsFromPoint(d.x,d.y).find(x=>x.classList&&x.classList.contains('mbcell')&&x.parentNode===$('mbGrid'));if(!el)return;const to=+el.dataset.i;if(to===d.from)return;settle(to);
 const b=mbS(),P=ST.P||pool(),a=P.get(b.cells[d.from]),c=b.cells[to]!=null?P.get(b.cells[to]):null;if(!a)return;
 if(c&&!ST.hold.has(to)&&!ST.ov[to]&&c.k===a.k&&tierOf(c)===tierOf(a)&&tierOf(a)<9)merge(d.from,to);
 else if(!c&&!ST.hold.has(to)){b.cells[to]=b.cells[d.from];b.cells[d.from]=null;try{save();}catch(e){}draw();}
 else if(c&&c.k===a.k&&tierOf(a)>=9){bubble('무지개는 가장 높은 단계예요');play('deny');}
 else if(c){const t=b.cells[to];b.cells[to]=b.cells[d.from];b.cells[d.from]=t;try{save();}catch(e){}draw();}}
function hint(from,onn){const b=mbS(),P=ST.P||pool(),a=P.get(b.cells[from]);[...$('mbGrid').children].forEach((e,i)=>{e.classList.remove('mok','mdim');if(!onn||i===from||!a)return;const c=b.cells[i]!=null?P.get(b.cells[i]):null;if(!c)return;e.classList.add(c.k===a.k&&tierOf(c)===tierOf(a)&&tierOf(a)<9?'mok':'mdim');});}
// ── v194: 5초 동안 가만히 보고만 있으면 합칠 수 있는 물고기를 살짝 흔들어 보여줘요 · 합칠 게 하나도 없으면 알림창 ──
const jo=w=>{const c=String(w||'').charCodeAt(String(w||'').length-1)-0xAC00;return c>=0&&c<11172&&c%28?'을':'를';};
function pairOnBoard(){const b=mbS(),P=ST.P||pool(),m={};for(let i=0;i<b.cells.length;i++){const id=b.cells[i];if(id==null||ST.hold.has(i)||ST.ov[i])continue;const f=P.get(id);if(!f)continue;const t=tierOf(f);if(t<0||t>=9)continue;const k=f.k+'|'+t;if(m[k]!=null)return [m[k],i];m[k]=i;}return null;}
function trayCan(){/* v195: 판이 꽉 차면 보유 물고기는 넣을 수 없으니 합칠 수 있는 걸로 치지 않아요 */if(!mbS().cells.some(x=>x==null))return null;const L=ST.trayA||ST.tray||[];if(L.some(g=>g.list.length>=2))return L.find(g=>g.list.length>=2);const b=mbS(),P=ST.P||pool(),on=new Set();b.cells.forEach(id=>{const f=id!=null&&P.get(id);if(f)on.add(f.k+'|'+tierOf(f));});return L.find(g=>on.has(g.k+'|'+g.t))||null;}
function poke(){ST.idle=performance.now();if(ST.hintP){ST.hintP.forEach(i=>{const e=cellEl(i);if(e)e.classList.remove('mbhint');});ST.hintP=null;}document.querySelectorAll('#mbd .mbti.mbhint').forEach(e=>e.classList.remove('mbhint'));}
function noneAlert(full){if($('mbNone'))return;const d=document.createElement('div');d.id='mbNone';d.className='mbnone';const tip=IMPACT()?'물고기를 꾹 누르면':'물고기를 오른쪽 클릭하면';const body=full?`<div class="mbni">🧺</div><b>판이 가득 차서 합칠 게 없어요</b><p>${tip} 보유 물고기로 돌아가요<br>판매·방생으로 자리를 비워도 돼요</p>`:`<div class="mbni">🎣</div><b>지금은 합성할 물고기가 없어요</b><p>같은 물고기·같은 별 2마리가 있어야 합성돼요<br>낚시로 물고기를 더 모아 와요</p>`;d.innerHTML=`<div class="mbnc">${body}<button type="button" class="mb3">확인</button></div>`;d.addEventListener('pointerdown',e=>{e.stopPropagation();});d.querySelector('button').onclick=()=>{d.remove();poke();};$('mbd').appendChild(d);play('deny');}
setInterval(()=>{try{if(!ST.open||ST.drag||ST.info||ST.sell||ST.flies.length||ST.ev.length||$('mbNone'))return;const idle=performance.now()-(ST.idle||0);
 if(idle>1200){const pr=pairOnBoard(),tc=pr?null:trayCan(),sig=mbS().cells.join(',')+'#'+(ST.trayA||ST.tray||[]).map(g=>g.k+g.t+'x'+g.list.length).join(',');
  if(!pr&&!tc){if(ST.noneSig!==sig){ST.noneSig=sig;noneAlert(!mbS().cells.some(x=>x==null));}return;}ST.noneSig=null;
  if(idle>5000&&!ST.hintP){if(pr){ST.hintP=pr;const a=cellEl(pr[0]),c=cellEl(pr[1]);if(a&&c){const ra=a.getBoundingClientRect(),rc=c.getBoundingClientRect(),dx=rc.left-ra.left,dy=rc.top-ra.top,L=Math.hypot(dx,dy)||1,m=Math.min(10,ST.cs*.16);a.style.setProperty('--hx',(dx/L*m)+'px');a.style.setProperty('--hy',(dy/L*m)+'px');c.style.setProperty('--hx',(-dx/L*m)+'px');c.style.setProperty('--hy',(-dy/L*m)+'px');a.classList.add('mbhint');c.classList.add('mbhint');}}
   else if(tc){ST.hintP=[];document.querySelectorAll(`#mbd .mbti[data-key="${tc.k}|${tc.t}"]`).forEach(e=>e.classList.add('mbhint'));}}}}catch(e){}},500);
addEventListener('pointerdown',()=>{if(ST.open)poke();},true);
/* v197: 알림이 새로 뜨거나 내용이 바뀌어도 자리를 다시 맞춰요 */setInterval(()=>{try{if(ST.open){slots();/* v200: 연출이 끝나면 판 크기 바꾸기 */if(mbS().n!==NN())draw();}}catch(e){}},400);addEventListener('keydown',()=>{if(ST.open)poke();},true);
// ── 합성 (데이터는 바로 바꾸고, 그림만 0.1~0.3초 늦게 보여요) ──
function merge(from,to){if(left()<=0){bubble('오늘 합성 횟수를 다 썼어요');play('deny');return false;}
 const b=mbS(),P=ST.P||pool(),a=P.get(b.cells[from]),c=P.get(b.cells[to]);if(!a||!c)return false;const t0=tierOf(a);let r=t0+1;if(t0<=MB_CFG.luckMaxT&&r<9&&Math.random()<MB_CFG.luck)r++;
 const nf=makeFish(a,c,r);if(!nf)return false;{const S0=gS();S0.mbTot=(S0.mbTot|0)+1;}if(!infOn()){day().used++;if(srvFresh())srvSync({use:1});else offRec(1);}b.cells[from]=null;b.cells[to]=nf.id;try{save();hud();}catch(e){}
 const now=performance.now(),I0=IMP[r],I=IMPACT()?I0:Object.assign({},I0,{sh:0,hs:0});if(now-ST.last<3000)ST.combo++;else ST.combo=1;ST.last=now;
 const S=gS();S.mbSeen=S.mbSeen||{};const isNew=!S.mbSeen[a.k+'|'+r];S.mbSeen[a.k+'|'+r]=1;ST.lad=a.k;
 const ce=cellEl(to).getBoundingClientRect(),x=ce.left+ce.width/2,y=ce.top+ce.height/2;let sd=to*97+r*13+1;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
 const parts=[...Array(I.pn)].map(()=>{const an=rnd()*Math.PI*2,sp=(140+rnd()*360)*(1+r*.08);return {an,sp,sz:3+rnd()*5+r*.4,c:COL[r][0]==='rb'?RB[Math.floor(rnd()*6)]:(rnd()<.6?COL[r][0]:COL[r][1]),star:rnd()<.5,rot:rnd()*6};});
 ST.ov[to]={k:a.k,t:t0};ST.ev.push({to,k:a.k,r,t0:now,tb:now+110+I.hs,x,y,I,parts,isNew,combo:ST.combo,done:false});play('squish',r);draw();kick();
 B().ms('fuse',1);B().xbal(15,'합성');
 return true;}
/* v205: 🌈 무지개 완성 — 모든 서버 공지 (초월 부적 공지와 같은 띠 자리 #stAnn · 실시간 서버 mbr 메시지) · 혼자 플레이면 내 화면에만 */
const myRtId=()=>{try{return String(window.NK_RT&&NK_RT.id||'');}catch(e){return '';}};
const myNick=()=>{try{const V=window.__nkInt;return (V&&V.NICK&&V.NICK())||(gS()&&gS().nick)||'나';}catch(e){return '나';}};
function rbSay(t){try{const V=window.__nkInt;V&&V.say&&V.say('시스템',t);}catch(e){}}
function rbShout(f){let sent=false;try{sent=!!(window.NK_RT&&NK_RT.mbr&&NK_RT.mbr(f.k));}catch(e){}rbBand({nick:myNick(),k:f.k,me:1,local:sent?0:1});rbSay(`📢 [합성] ${myNick()}님이 합성으로 ${fnm(f.k)}를 🌈 무지개까지 올렸어요!`);}
function rbBand(ev){if(!ev||!FI(ev.k))return;let box=$('stAnn');if(!box){box=document.createElement('div');box.id='stAnn';document.body.appendChild(box);}box.innerHTML='';
 const srv=(()=>{try{return ev.srv&&window.SRVN?SRVN(ev.srv):'';}catch(e){return '';}})(),el=document.createElement('div');el.className='txann mbrann';
 el.innerHTML=`<span class="mbri"><img src="${esc(fimg(ev.k))}" alt="" style="filter:${esc((FZV.rainbow||{}).fx||'')}"></span><div class="ta-m"><small>${ev.local?'🌙 혼자 플레이 · 내 화면에만':'📢 전체 서버 공지'}${srv?' · '+esc(srv):''}</small><b>${esc(ev.nick||'누군가')}</b>님이 합성으로 <b>${esc(fnm(ev.k))}</b>를 <b class="mbrt">🌈 무지개</b>까지 올렸어요!</div>`;
 box.appendChild(el);const dur=ev.me?9000:document.querySelector('.modal.show')?7000:15000;setTimeout(()=>el.classList.add('out'),dur);setTimeout(()=>el.remove(),dur+700);if(ST.open)requestAnimationFrame(slots);}
addEventListener('nk-rt-mbr',e=>{try{const d=e.detail||{};if(d.id&&String(d.id)===myRtId())return;if(!d.k||!FI(d.k))return;rbBand(d);rbSay(`📢 [합성] ${d.nick||'누군가'}님이 합성으로 ${fnm(d.k)}를 🌈 무지개까지 올렸어요!`);}catch(err){}});
function makeFish(a,c,r){const F=FI(a.k);if(!F)return null;const cm=Math.max(+a.cm||0,+c.cm||0),g=Math.max(a.g|0,c.g|0),st=r>=5?4:r,vr=r>=5?VK[r-5]:null;
 let v=0;try{v=Math.round(valueOf(F,cm,g)*(1+.5*st)*(vr?FZV[vr].m:1));}catch(e){v=Math.max(a.v|0,c.v|0)*2;}
 const S=gS(),nf={id:S.nid++,k:a.k,cm,g,v,price:Math.round(v*1.3),sale:false,st,t:Date.now(),mb:1};if(vr){nf.vr=vr;if(S.vrLock!==false){nf.lock=true;nf.alk=1;}}
 /* v205: 어항 3개 — 새 물고기는 겹친 자리 물고기(c)가 있던 어항에 넣어요 (늘 지금 어항에 넣으면 그 어항이 넘쳐요) · c가 빠진 자리라 칸은 늘 있어요 */
 let li=0;try{const L0=B().lists();li=Math.max(0,L0.findIndex(L=>L.some(f=>f.id===c.id)));}catch(e){li=0;}
 try{fzRemove([a.id,c.id],null);}catch(e){S.tank=S.tank.filter(f=>f.id!==a.id&&f.id!==c.id);}
 {let L1=null;try{L1=B().lists()[li];}catch(e){}(Array.isArray(L1)?L1:S.tank).push(nf);}
 try{const z=fzS();z.star=z.star||{};z.star[a.k]=Math.max(z.star[a.k]|0,st);if(vr){const dx=z.dex[a.k]=z.dex[a.k]||{};dx[vr]=1;try{const sp=fzSP();(sp[a.k]=sp[a.k]||{})[vr]=1;}catch(e){}}}catch(e){}
 try{const tv=gT();if(tv&&tv.removeFish){tv.removeFish(a.id);tv.removeFish(c.id);}}catch(e){}
 /* v205: 모두에게 알리는 건 ★5가 아니라 🌈 무지개를 만들었을 때예요 (★5 알림은 뺐어요) · 등급마다 처음 ★5 → 칭호 「등급 별 장인」은 그대로 */
 if(r===9)setTimeout(()=>{try{rbShout(nf);}catch(e){}},900);
 if(tierOf(a)<4&&r>=4){
  try{if(B().fzGrOn()){const z=fzS(),gq=nf.g|0;z.g5=z.g5||{};if(!z.g5[gq]){z.g5[gq]=Date.now();const tn=(B().GR(gq)?B().GR(gq).n:'')+' 별 장인';S.myTitles=S.myTitles||[];if(!S.myTitles.some(x=>x.n===tn))S.myTitles.push({n:tn,c:'⭐ 등급 5성',t:Date.now()});setTimeout(()=>bubble(`🏅 새 칭호 「${esc(tn)}」<br><small>설정 › 프로필 › 칭호에서 골라요</small>`,2600),900);}}}catch(e){}}
 return nf;}
// ── 아래 버튼 ──
function bbAct(k){const b=mbS(),P=ST.P||pool();
 if(k==='tidy'){if(!tidyOn())return;const ids=b.cells.filter(x=>x!=null&&P.get(x));if(!ids.length){bubble('정리할 물고기가 없어요');return;}
  const cnt={},top={};ids.forEach(id=>{const f=P.get(id);cnt[f.k]=(cnt[f.k]|0)+1;top[f.k]=Math.max(top[f.k]|0,tierOf(f));});
  ids.sort((x,y)=>{const a=P.get(x),c=P.get(y);return top[c.k]-top[a.k]||cnt[c.k]-cnt[a.k]||fnm(a.k).localeCompare(fnm(c.k),'ko')||tierOf(c)-tierOf(a);});
  b.cells=b.cells.map((_,i)=>ids[i]!=null?ids[i]:null);try{save();}catch(e){}play('place');draw();bubble('같은 물고기·단계끼리 모았어요');return;}
 if(k==='sell'){ST.sell=true;ST.sel.clear();draw();bubble('팔거나 뺄 물고기를 눌러 골라요',1800);return;}
 if(k==='done'){ST.sell=false;ST.sel.clear();draw();return;}
 if(k==='back'){if(!ST.sel.size){bubble('뺄 물고기를 눌러 골라요');return;}b.cells=b.cells.map(id=>ST.sel.has(id)?null:id);const n=ST.sel.size;ST.sel.clear();try{save();}catch(e){}draw();bubble(`${n}마리를 보유 목록으로 돌려놨어요`);return;}
 if(k==='sellgo'){const fs=[...ST.sel].map(id=>P.get(id)).filter(Boolean),lk=fs.filter(f=>f.lock),ok=fs.filter(f=>!f.lock);if(!ok.length){bubble(lk.length?'잠긴 물고기는 팔 수 없어요 (어항에서 잠금 해제)':'팔 물고기를 골라요',1800);return;}
  let co=0;ok.forEach(f=>{try{co+=sellP(f);}catch(e){}});
  const go=()=>{const S=gS();let tot=0;ok.forEach(f=>{let pz=0;try{pz=sellP(f);}catch(e){}tot+=pz;S.coins+=pz;S.earned=(S.earned||0)+pz;try{B().ilog('sell','fish',f,pz);}catch(e){}});try{fzRemove(ok.map(f=>f.id),null);}catch(e){}try{const tv=gT();ok.forEach(f=>tv&&tv.removeFish&&tv.removeFish(f.id));}catch(e){}
   B().ms('sell',ok.length);ST.sel.clear();try{save();hud();}catch(e){}B().coin();draw();bubble(`🪙 ${ok.length}마리 팔아서 ${tot.toLocaleString()}골드${lk.length?` · 잠긴 ${lk.length}마리는 남겼어요`:''}`,2000);};
  try{confirmBox(`<h3>💰 물고기 팔기</h3><p>${ok.length}마리를 <b>🪙 ${co.toLocaleString()}</b>골드에 팔아요.${lk.length?`<br><small>잠긴 ${lk.length}마리는 팔지 않아요</small>`:''}</p>`,go);const cf=$('confirm');if(cf)cf.style.zIndex=95;}catch(e){go();}return;}}
// ── 연출 루프 ──
function evDone(e){if(e.done)return;e.done=true;delete ST.ov[e.to];draw();play('pop',e.r,Math.min(e.combo-1,7));if(IMPACT()&&navigator.vibrate)try{navigator.vibrate(e.I.vib);}catch(_){}if(!IMPACT())pcHit(e);}
/* v205: PC 타격감 — 화면 전체는 흔들지 않아요(예전 요청). 대신 ① 나무판만 짧게 흔들림 ② 둘레 8칸이 바깥으로 튕겼다 돌아옴 ③ 판 테두리 번쩍 ④ 낮은 「쿵」 소리 (단계가 높을수록 세게) */
function pcHit(e){try{const r=e.r|0,N=mbS().n,row=Math.floor(e.to/N),col=e.to%N,cs=ST.cs,w=$('mbWood');
 const A=Math.min(7,2.2+r*.55),du=230+r*22;if(w&&w.animate){const k=[0,1,2,3,4,5].map(i=>{const q=1-i/5,sx=(i%2?-1:1)*A*q,sy=(i%3===1?1:-1)*A*.45*q;return {transform:`translate(${sx.toFixed(2)}px,${sy.toFixed(2)}px)`};});k.push({transform:'none'});w.animate(k,{duration:du,easing:'ease-out'});
  w.animate([{boxShadow:getComputedStyle(w).boxShadow+`,0 0 0 ${2+Math.min(r,6)}px ${r===9?'rgba(190,140,255,.75)':r>=5?'rgba(255,214,110,.75)':'rgba(255,240,200,.8)'}`},{boxShadow:getComputedStyle(w).boxShadow}],{duration:260+r*20,easing:'ease-out'});}
 const P=cs*(.07+Math.min(r,9)*.012);for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=row+dr,cc=col+dc;if(rr<0||cc<0||rr>=N||cc>=N)continue;const c=cellEl(rr*N+cc),it=c&&c.querySelector('.mbit');if(!it||!it.animate)continue;const l=Math.hypot(dr,dc),dx=dc/l*P,dy=dr/l*P;
  it.animate([{transform:'none'},{transform:`translate(${dx.toFixed(1)}px,${dy.toFixed(1)}px) scale(.94)`,offset:.28},{transform:`translate(${(-dx*.18).toFixed(1)}px,${(-dy*.18).toFixed(1)}px)`,offset:.65},{transform:'none'}],{duration:300+r*15,easing:'ease-out'});}
 thud(r);}catch(err){}}
function thud(r){const a=AC();if(!a)return;const [c,m]=a;let o=c._mbOut;if(!o)return;const t=c.currentTime+.004;try{const O=c.createGain();O.gain.value=2.2;O.connect(o);setTimeout(()=>{try{O.disconnect();}catch(_){}},1500);tn(c,O,t,150+Math.min(r,4)*8,48,.2+Math.min(r,9)*.015,'sine',.55,.003);nz(c,O,t,.07,.2,260,1,'lowpass');}catch(e){}}
/* v204: 방금 합성된 칸을 바로 누르거나 끌거나 겹치면 연출 대기(늘어나는 0.1~0.3초 + 느린 기기에서는 더 길게)를 기다리지 않고 바로 끝내요 — 데이터는 이미 바뀌어 있어요 */
function settle(i){if(!ST.ov[i])return;const now=performance.now();for(const e of ST.ev)if(e.to===i&&!e.done){if(e.tb>now)e.tb=now;evDone(e);}delete ST.ov[i];}
function kick(){if(!ST.raf&&ST.open)ST.raf=requestAnimationFrame(loop);}
function star(g2,x,y,r,rot){g2.save();g2.translate(x,y);g2.rotate(rot);g2.beginPath();for(let i=0;i<10;i++){const rr=i%2?r*.45:r,a=i*Math.PI/5;g2.lineTo(Math.sin(a)*rr,-Math.cos(a)*rr);}g2.closePath();g2.fill();g2.restore();}
function loop(){ST.raf=0;if(!ST.open)return;const t=performance.now(),fx=$('mbFx'),g2=fx.getContext('2d'),dp=fx.width/innerWidth,cs=ST.cs;g2.setTransform(dp,0,0,dp,0,0);g2.clearRect(0,0,innerWidth,innerHeight);let shake=0,busy=false;
 for(const e of ST.ev){const dt=t-e.t0,db=t-e.tb;busy=true;
  if(db<0){const el=cellEl(e.to).querySelector('.mbit');const p=Math.min(1,dt/110),sx=1+.28*Math.sin(p*Math.PI/2),sy=1-.3*Math.sin(p*Math.PI/2);if(el){el.style.transform=`scale(${sx},${sy})`;el.style.filter=dt>110?'brightness(1.7) saturate(.6)':'';}continue;}
  if(!e.done)evDone(e);
  const el2=cellEl(e.to).querySelector('.mbit'),sc=db<90?0.6+0.75*(db/90):Math.max(1,1.35-(db-90)/260*.35);if(el2){el2.style.transform=db<360?`scale(${sc})`:'';el2.style.filter='';}
  const I=e.I,dur=380+I.sh*30;if(I.sh&&db<dur)shake=Math.max(shake,I.sh*(1-db/dur));
  if(I.fl&&db<220){const al=I.fl*(1-db/220);g2.fillStyle=e.r===9?`hsla(${(200+db*1.5)%360},100%,90%,${al*.7})`:e.r===5?`rgba(40,30,60,${al*.8})`:`rgba(255,250,220,${al})`;g2.fillRect(0,0,innerWidth,innerHeight);}
  if(I.ray&&db<900){g2.save();g2.translate(e.x,e.y);g2.rotate(db/900);const al=Math.min(1,db/80)*(1-db/900);for(let i=0;i<14;i++){g2.rotate(Math.PI*2/14);g2.fillStyle=e.r===9?RB[i%6]:'#ffe066';g2.globalAlpha=al*.28;g2.beginPath();g2.moveTo(0,0);g2.lineTo(-22,-300);g2.lineTo(22,-300);g2.fill();}g2.restore();g2.globalAlpha=1;}
  for(let k=0;k<I.rg;k++){const d=db-k*70;if(d<0||d>520)continue;g2.globalAlpha=1-d/520;g2.lineWidth=6-k;g2.strokeStyle=e.r===9?RB[(k*2)%6]:COL[e.r][0];g2.beginPath();g2.arc(e.x,e.y,cs*.45+d*(.55+e.r*.06),0,Math.PI*2);g2.stroke();}g2.globalAlpha=1;
  const pd=db/1000;if(pd<1.1){for(const p of e.parts){const dist=p.sp*(1-Math.exp(-pd*2.2))/2.2,px=e.x+Math.cos(p.an)*dist,py=e.y+Math.sin(p.an)*dist+260*pd*pd;g2.globalAlpha=Math.max(0,1-pd/1.1);g2.fillStyle=p.c;if(p.star)star(g2,px,py,p.sz*1.3,p.rot+pd*6);else{g2.beginPath();g2.arc(px,py,p.sz*.6,0,Math.PI*2);g2.fill();}}g2.globalAlpha=1;}
  if(db<1100){const al=db<900?1:1-(db-900)/200,yy=e.y-cs*.75-Math.min(1,db/200)*18,sc2=db<120?.5+db/120*.7:1.2-Math.min(.2,(db-120)/600),FF='"Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
   g2.globalAlpha=al;g2.textAlign='center';g2.textBaseline='middle';g2.font=`900 ${18+e.r*1.6}px ${FF}`;g2.lineWidth=5;g2.lineJoin='round';g2.strokeStyle=e.r===9?'#7b4bff':e.r>=5?'#3d3027':'#d9542a';g2.fillStyle='#fff';const lab=e.r>=5?LV[e.r]+'!':LV[e.r];g2.save();g2.translate(e.x,yy);g2.scale(sc2,sc2);g2.strokeText(lab,0,0);g2.fillText(lab,0,0);g2.restore();
   if(e.isNew){g2.font=`900 20px ${FF}`;g2.save();g2.translate(Math.min(e.x+cs*.45,innerWidth-40),e.y-cs*.45);g2.rotate(-.2);g2.scale(sc2,sc2);g2.fillStyle='#ff4f5a';g2.strokeStyle='#fff';g2.lineWidth=5;g2.strokeText('NEW!',0,0);g2.fillText('NEW!',0,0);g2.restore();}
   if(e.combo>=2){const w=$('mbWood').getBoundingClientRect();g2.font=`900 ${22+Math.min(e.combo,8)*2}px ${FF}`;g2.save();g2.translate(w.left+w.width/2,Math.max(30,w.top-18));g2.rotate(-.06);g2.scale(sc2,sc2);g2.strokeStyle='#d9542a';g2.lineWidth=6;g2.fillStyle='#fff';g2.strokeText(`콤보 ×${e.combo}!`,0,0);g2.fillText(`콤보 ×${e.combo}!`,0,0);g2.restore();}
   g2.globalAlpha=1;}}
 for(let i=ST.ev.length-1;i>=0;i--)if(t-ST.ev[i].tb>1300){const el=cellEl(ST.ev[i].to)&&cellEl(ST.ev[i].to).querySelector('.mbit');if(el){el.style.transform='';el.style.filter='';}ST.ev.splice(i,1);}
 let fh='';for(const f of ST.flies){busy=true;const dt=t-f.t0;if(dt<0)continue;const p=Math.min(1,dt/f.dur),e=p<.5?2*p*p:1-(-2*p+2)**2/2;
  if(!f.landed&&p>=1){f.landed=true;f.bt=t;ST.hold.delete(f.to);draw();play('place');}
  if(!f.landed){const x=f.x0+(f.x1-f.x0)*e,y=f.y0+(f.y1-f.y0)*e-Math.sin(p*Math.PI)*56,sc=1.08+Math.sin(p*Math.PI)*.18,rot=-8+p*14;fh+=`<div class="mbcell" style="width:${cs}px;height:${cs}px;--cs:${cs}px;transform:translate(${x-cs/2}px,${y-cs/2}px) rotate(${rot}deg) scale(${sc})">${itemHTML(f.k,f.t)}</div>`;}
  else if(t-f.bt<240){const q=(t-f.bt)/240,sc=q<.45?(.62+q/.45*.72):(1.34-(q-.45)/.55*.34),el=cellEl(f.to).querySelector('.mbit');if(el)el.style.transform=`scale(${sc})`;}
  else{const el=cellEl(f.to).querySelector('.mbit');if(el&&!ST.ev.some(v=>v.to===f.to))el.style.transform='';}}
 const fl=$('mbFly');if(fl._h!==fh){fl.innerHTML=fh;fl._h=fh;}for(let i=ST.flies.length-1;i>=0;i--)if(ST.flies[i].landed&&t-ST.flies[i].bt>260)ST.flies.splice(i,1);
 const shk=$('mbShk');if(shake>0){shk.style.transform=`translate(${Math.sin(t*.09)*shake}px,${Math.cos(t*.113)*shake*.8}px)`;busy=true;}else if(shk.style.transform)shk.style.transform='';
 for(let i=ST.pops.length-1;i>=0;i--){const d=ST.pops[i],a=t-d._t0;busy=true;if(a>d._ms){d.remove();ST.pops.splice(i,1);}else d.style.opacity=a<150?a/150:a>d._ms-250?(d._ms-a)/250:1;}
 if(busy)kick();}
// ── 열기·닫기 ──
function open(){if(!on())return false;build();ST.open=true;ST.idle=performance.now();ST.hintP=null;ST.noneSig=null;try{srvSync();}catch(e){}ST.sell=false;ST.sel.clear();ST.ov={};ST.hold.clear();ST.ev=[];ST.flies=[];try{openM('mbd');}catch(e){$('mbd').classList.add('show');}document.body.classList.add('mb-open');layout();draw();layout();draw();fxClear();requestAnimationFrame(()=>{if(ST.open){layout();draw();slots();}});kick();return true;}
function close(){try{closeM('mbd');}catch(e){const m=$('mbd');if(m)m.classList.remove('show');}closed();}
function closed(){if(!ST.open)return;try{const m=$('s5x');if(m)m.style.zIndex='';}catch(e){}ST.open=false;try{const n=$('mbNone');if(n)n.remove();}catch(e){}infoClose();ST.drag=null;ST.ov={};ST.hold.clear();ST.ev=[];ST.flies=[];ST.pops.forEach(d=>d.remove());ST.pops=[];document.body.classList.remove('mb-open');slots();fxClear();const fl=$('mbFly');if(fl){fl.innerHTML='';fl._h='';}const s=$('mbShk');if(s)s.style.transform='';try{save();}catch(e){}}
function badge(){try{if(!on())return 0;const P=pool(),b=mbS(),seen={};let n=0;b.cells.forEach(id=>{const f=id!=null&&P.get(id);if(!f||tierOf(f)>=9)return;const k=f.k+'|'+tierOf(f);seen[k]=(seen[k]|0)+1;});for(const k in seen)n+=seen[k]>>1;return left()>0?n:0;}catch(e){return 0;}}
function onCatch(){try{if(!on())return;SRV.pf++;const d=day();if(!srvFresh())d.fish++;if(ST.open)drawCnt();}catch(e){}}
/* v193: 후원자는 관리자 › 지급 › 💝 후원에서 서버 명단에 올려요 (이 함수는 화면만 다시 그려요) */function setSupporter(v){if(ST.open)draw();}
/* 측정용(읽기 전용): 정렬·겹침 숫자 */
function measure(){if(!$('mbd'))return null;const bx=el=>{if(!el)return null;const r=el.getBoundingClientRect();if(!r.width&&!r.height)return null;return {x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),cx:+(r.x+r.width/2).toFixed(1),cy:+(r.y+r.height/2).toFixed(1),b:+(r.y+r.height).toFixed(1)};};
 const pc=PCL(),vw=innerWidth,vh=innerHeight,mid=vw/2,wood=bx($('mbWood')),bb=bx($('mbBB')),tray=bx((pc?$('mbQP'):$('mbQM')).closest('.mbsec')),cnt=bx(pc?$('mbCntP'):$('mbCntM')),info=ST.info?bx($('mbInfo')):null,main=bx($('mbMain'));
 const ov=(a,b)=>!!(a&&b&&!(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y));const ins=a=>a&&({l:a.x,r:+(vw-a.x-a.w).toFixed(1),t:a.y,b:+(vh-a.y-a.h).toFixed(1)});
 return {vw,vh,pc,impact:IMPACT(),wood,bb,tray,cnt,info,off:{wood:wood&&+(wood.cx-mid).toFixed(1),bb:bb&&+(bb.cx-mid).toFixed(1),tray:pc?null:tray&&+(tray.cx-mid).toFixed(1),cnt:pc?null:cnt&&+(cnt.cx-mid).toFixed(1),info:info&&+(info.cx-mid).toFixed(1)},edge:{wood:ins(wood),bb:ins(bb),tray:ins(tray),cnt:ins(cnt),info:ins(info)},ovl:{info_bb:ov(info,bb),wood_bb:ov(wood,bb),wood_tray:ov(wood,tray),tray_bb:ov(tray,bb),cnt_wood:ov(cnt,wood)}};}
window.NK_MB={lvl,tot,lvCfg,on,open,close,isOpen:()=>ST.open,badge,onCatch,adWatched,setSupporter,isSup,left,total,day:()=>Object.assign({},day()),cfg:MB_CFG,tierOf,measure,draw:()=>draw()};
})();
