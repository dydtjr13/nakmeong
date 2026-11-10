// 이모지 → 로컬 SVG(Twemoji, CC-BY 4.0) 치환: 윈도우 등에서 폰트 미지원 시 □/× 로 깨지는 문제 방지
(function(){
const RX=/(?:[\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF\u2300-\u23FF\u25A0-\u25FF\u3297\u3299]\uFE0F?(?:\u200D[\u{1F000}-\u{1FAFF}\u2600-\u27BF]\uFE0F?)*)/gu;
const code=e=>{let c=[...e].map(x=>x.codePointAt(0));if(!c.includes(0x200D))c=c.filter(x=>x!==0xFE0F);return c.map(x=>x.toString(16)).join('-');};
const url=e=>(window.NK_EMOJI_BASE||'icons/emoji/')+code(e)+'.svg';
const TXT=new Set(['★','☆','✦','✧','■','□','▲','▼','◆','●','○','▶','◀','✓','✕','✗','▸','▾','◐','◑','▴','⌘','◂','▿','▵','◇','▪','▫','◻','◼']);// 한글 기본 폰트(맑은 고딕 등)에 있는 기호는 텍스트 유지
const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,OPTION:1,TITLE:1};
// v86: SVG가 없으면 PNG, 그것도 없으면 글자 그대로 (깨진 그림 대신)
function emjErr(){const im=this;if(!im._p){im._p=1;im.src=(window.NK_EMOJI_BASE||'icons/emoji/').replace(/emoji\/$/,'emoji-png/')+code(im.alt)+'.png';}else{im.onerror=null;try{im.replaceWith(document.createTextNode(im.alt));}catch(e){}}}
function conv(node){const t=node.nodeValue;const ms=t.match(RX);if(!ms||ms.every(x=>TXT.has(x)))return;RX.lastIndex=0;const f=document.createDocumentFragment();let i=0,m;
 while((m=RX.exec(t))){if(TXT.has(m[0]))continue;if(m.index>i)f.appendChild(document.createTextNode(t.slice(i,m.index)));const im=document.createElement('img');im.className='emj';im.alt=m[0];im.draggable=false;im.onerror=emjErr;im.src=url(m[0]);f.appendChild(im);i=m.index+m[0].length;}
 if(i<t.length)f.appendChild(document.createTextNode(t.slice(i)));node.parentNode.replaceChild(f,node);}
function walk(root){if(root.nodeType===3){if(root.parentNode&&!SKIP[root.parentNode.nodeName])conv(root);return;}if(root.nodeType!==1||SKIP[root.nodeName])return;
 const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),L=[];let n;while((n=w.nextNode()))if(!SKIP[n.parentNode.nodeName])L.push(n);L.forEach(conv);}
window.NK_iconize=walk;
// 캔버스(이름표/말풍선)용: 텍스트를 이모지 이미지와 섞어 그림
// v9: 캔버스용은 PNG(128px) 사용 — Safari/Firefox는 width/height 없는 SVG를 drawImage 시 그리지 않음
const urlPng=e=>(window.NK_EMOJI_BASE||'icons/emoji/').replace(/emoji\/$/,'emoji-png/')+code(e)+'.png';
const cache={};window.NK_emojiImg=(e,cb)=>{const u=urlPng(e);if(!cache[u]){const im=new Image();im.onload=()=>{im._ok=1;(im._cb||[]).forEach(f=>f());im._cb=[];};im.onerror=()=>{if(!im._fb){im._fb=1;im.src=url(e);}};im._cb=[];im.src=u;cache[u]=im;}const im=cache[u];if(!im._ok&&cb)im._cb.push(cb);return im._ok?im:null;};
window.NK_fillTextEmoji=(x,str,cx,cy,size,redraw)=>{const parts=[];let i=0,m;RX.lastIndex=0;while((m=RX.exec(str))){if(TXT.has(m[0]))continue;if(m.index>i)parts.push(str.slice(i,m.index));parts.push({e:m[0]});i=m.index+m[0].length;}if(i<str.length)parts.push(str.slice(i));
 const wOf=p=>typeof p==='string'?x.measureText(p).width:size*1.1;const tw=parts.reduce((a,p)=>a+wOf(p),0);let px=cx-tw/2;const al=x.textAlign;x.textAlign='left';
 for(const p of parts){if(typeof p==='string'){x.fillText(p,px,cy);}else{const im=window.NK_emojiImg(p.e,redraw);if(im)x.drawImage(im,px+size*.05,cy-size*.85,size,size);}px+=wOf(p);}x.textAlign=al;return tw;};
document.addEventListener('DOMContentLoaded',()=>{walk(document.body);new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')walk(m.target);else m.addedNodes.forEach(walk);}}).observe(document.body,{childList:true,subtree:true,characterData:true});});
})();
