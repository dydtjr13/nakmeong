// 낚멍 공통 모듈: UI, 사운드(WebAudio 합성), 낚시 상태, 시간, 봇, 입력
window.NK = (function(){
const FISH=[{n:'붕어',c:'#c9a24a',r:45,s:'🐟'},{n:'잉어',c:'#d07a3a',r:20,s:'🐟'},{n:'향어',c:'#8a8f7a',r:12,s:'🐟'},{n:'블루길',c:'#4f7fa8',r:30,s:'🐠'},{n:'배스',c:'#5b7a3a',r:18,s:'🐟'},{n:'가물치',c:'#3b3a30',r:8,s:'🐍'},{n:'쏘가리',c:'#b89a52',r:6,s:'🐆'}];
const dex={}; const keys={}; const joy={x:0,y:0};
addEventListener('keydown',e=>{if(document.activeElement.tagName==='INPUT')return;keys[e.code]=1;});
addEventListener('keyup',e=>keys[e.code]=0);
const css=`#nk{position:fixed;inset:0;pointer-events:none;font-family:system-ui,'Apple SD Gothic Neo',sans-serif;color:#fff;z-index:9}
#nk button{pointer-events:auto;border:0;border-radius:14px;padding:8px 12px;background:rgba(20,30,40,.55);color:#fff;font-size:14px;backdrop-filter:blur(4px);cursor:pointer}
#nk .top{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
#nk .title{font-weight:800;font-size:18px;text-shadow:0 2px 6px #0008;margin-right:6px}
#nk #fishBtn{position:absolute;bottom:90px;left:50%;transform:translateX(-50%);font-size:18px;padding:14px 26px;background:#f0a04bcc;display:none}
#nk #chat{position:absolute;left:10px;bottom:10px;width:min(320px,60vw);pointer-events:auto}
#nk #log{max-height:120px;overflow:auto;font-size:13px;background:rgba(0,0,0,.3);border-radius:10px;padding:6px;margin-bottom:4px}
#nk #chat input{width:60%;border:0;border-radius:10px;padding:7px;background:rgba(255,255,255,.85)}
#nk #emo{display:inline-flex;gap:2px}#nk #emo button{padding:5px 6px}
#nk #toast{position:absolute;top:30%;left:50%;transform:translate(-50%,-50%);font-size:26px;font-weight:800;text-shadow:0 3px 10px #000a;transition:opacity .4s;opacity:0;text-align:center}
#nk #dex{position:absolute;right:10px;top:56px;width:220px;background:rgba(15,25,35,.8);border-radius:14px;padding:10px;display:none;pointer-events:auto;font-size:14px}
#nk #dex div{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid #fff2}
#nk #joy{position:absolute;right:30px;bottom:30px;width:110px;height:110px;border-radius:50%;background:rgba(255,255,255,.15);pointer-events:auto;display:none;touch-action:none}
#nk #joy i{position:absolute;left:35px;top:35px;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.6)}
#nk #start{position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;flex-direction:column;pointer-events:auto;font-size:15px;text-align:center}
#nk #start h1{font-size:44px;margin:0 0 8px}`;
let ui={};
function init(o){
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const d=document.createElement('div');d.id='nk';d.innerHTML=`<div class="top"><span class="title">🎣 피쉬레스트 <small style="font-weight:400;font-size:12px">${o.style||''}</small></span>
  <button id="tBtn">🌗 시간: 낮</button><button id="aBtn">⏯ 자동시간 ON</button><button id="dBtn">📖 도감</button><button id="sBtn">🔊</button><button id="sitBtn">🪑 앉기</button></div>
  <div id="dex"></div><div id="toast"></div><button id="fishBtn">🎣 낚시 시작</button>
  <div id="chat"><div id="log"></div><input id="msg" placeholder="채팅 입력 후 Enter"><span id="emo"></span></div><div id="joy"><i></i></div>
  <div id="start"><h1>🎣 피쉬레스트</h1><div>${o.style||''}</div><p>WASD/방향키 이동 · ${o.dragHint||'마우스 드래그 카메라 회전'}<br>데크 끝 낚시 포인트로 가면 [낚시 시작] → 입질(!) 뜨면 클릭/Space</p><button style="font-size:18px;padding:12px 30px">탭해서 시작 (사운드 ON)</button></div>`;
  document.body.appendChild(d);
  ['tBtn','aBtn','dBtn','sBtn','sitBtn','dex','toast','fishBtn','log','msg','emo','joy','start'].forEach(k=>ui[k]=d.querySelector('#'+k));
  ui.start.onclick=()=>{ui.start.remove();audio.start();};
  ui.tBtn.onclick=()=>{time.t=(Math.floor(time.t*3)+1)%3/3+0.01;};
  ui.aBtn.onclick=()=>{time.auto=!time.auto;ui.aBtn.textContent='⏯ 자동시간 '+(time.auto?'ON':'OFF');};
  ui.dBtn.onclick=()=>{ui.dex.style.display=ui.dex.style.display=='block'?'none':'block';renderDex();};
  ui.sBtn.onclick=()=>{audio.toggle();ui.sBtn.textContent=audio.on?'🔊':'🔇';};
  ui.sitBtn.onclick=()=>{api.sitting=!api.sitting;ui.sitBtn.textContent=api.sitting?'🚶 일어나기':'🪑 앉기';};
  ui.fishBtn.onclick=e=>{e.stopPropagation();fishing.action();};
  ['😊','👍','🐟','❤️','😴'].forEach(em=>{const b=document.createElement('button');b.textContent=em;b.onclick=()=>say('나',em,true);ui.emo.appendChild(b);});
  ui.msg.onkeydown=e=>{if(e.key==='Enter'&&ui.msg.value.trim()){say('나',ui.msg.value.trim(),true);ui.msg.value='';ui.msg.blur();}};
  addEventListener('keydown',e=>{if(e.code==='Space'&&document.activeElement.tagName!=='INPUT'){fishing.action();e.preventDefault();}});
  if('ontouchstart' in window||navigator.maxTouchPoints>0){ui.joy.style.display='block';const k=ui.joy.firstChild;
    const mv=e=>{const t=e.touches[0],r=ui.joy.getBoundingClientRect();let x=(t.clientX-r.left-55)/45,y=(t.clientY-r.top-55)/45;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}joy.x=x;joy.y=y;k.style.left=35+x*35+'px';k.style.top=35+y*35+'px';e.preventDefault();};
    ui.joy.addEventListener('touchstart',mv);ui.joy.addEventListener('touchmove',mv);ui.joy.addEventListener('touchend',()=>{joy.x=joy.y=0;k.style.left=k.style.top='35px';});}
  renderDex();
}
function renderDex(){ui.dex.innerHTML='<b>📖 물고기 도감 '+Object.keys(dex).length+'/7</b>'+FISH.map(f=>`<div><span>${dex[f.n]?f.s+' '+f.n:'❔ ???'}</span><span>${dex[f.n]?dex[f.n].n+'마리 · 최대 '+dex[f.n].max+'cm':''}</span></div>`).join('');}
function toast(t,ms=1600){ui.toast.innerHTML=t;ui.toast.style.opacity=1;clearTimeout(ui.tt);ui.tt=setTimeout(()=>ui.toast.style.opacity=0,ms);}
const bubbles=[];
function say(who,txt,me){const p=document.createElement('div');p.innerHTML=`<b style="color:${me?'#ffd27a':'#9fd8ff'}">${who}</b> ${txt}`;ui.log.appendChild(p);ui.log.scrollTop=1e5;bubbles.push({who,txt,t:performance.now()});}
// 입력 벡터 (x: 오른쪽, y: 앞(위))
function move(){let x=(keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.x,y=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-joy.y;const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}return{x,y};}
// 시간: t 0~1, 0=낮 1/3=노을 2/3=밤
const time={t:0.05,auto:true,update(dt){if(this.auto)this.t=(this.t+dt/90)%1;const n=['낮','노을','밤'][Math.floor(this.t*3)];if(ui.tBtn)ui.tBtn.textContent='🌗 시간: '+n;this.name=n;}};
// 세 팔레트를 부드럽게 보간
function lerpC(a,b,k){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const r=((pa>>16)&255)*(1-k)+((pb>>16)&255)*k,g=((pa>>8)&255)*(1-k)+((pb>>8)&255)*k,bl=(pa&255)*(1-k)+(pb&255)*k;return'#'+((1<<24)|(r<<16)|(g<<8)|bl).toString(16).slice(1);}
function palette(P){const x=time.t*3,i=Math.floor(x)%3,j=(i+1)%3;let k=x-Math.floor(x);k=k<.7?0:(k-.7)/.3;k=k*k*(3-2*k);const o={};for(const key in P[0])o[key]=typeof P[0][key]==='number'?P[i][key]*(1-k)+P[j][key]*k:lerpC(P[i][key],P[j][key],k);o.night=(i==2?1-k:0)+(j==2?k:0);return o;}
// 낚시 상태머신
const fishing={state:'off',action(){
  if(this.state==='off'){if(!api.nearSpot)return toast('데크 끝 낚시 포인트로 가세요');this.state='cast';this.t=0;this.bite=2+Math.random()*4;audio.cast();ui.fishBtn.textContent='⏳ 입질 대기… (클릭하면 챔질)';api.onCast&&api.onCast();}
  else if(this.state==='cast'||this.state==='bite'){const ok=this.state==='bite'||Math.random()<.5;if(ok)this.catchFish();else{toast('앗, 너무 빨랐어요! 다시 던져요');this.state='off';api.onReel&&api.onReel(false);this.ui();}}},
 catchFish(){let s=FISH.reduce((a,f)=>a+f.r,0)*Math.random(),f=FISH[0];for(const x of FISH){s-=x.r;if(s<0){f=x;break;}}
  const cm=Math.round(15+Math.random()*(f.n==='가물치'?60:f.n==='잉어'?50:30));const d=dex[f.n]||(dex[f.n]={n:0,max:0});const isNew=!d.n;d.n++;d.max=Math.max(d.max,cm);
  audio.reel();toast(`${f.s} <span style="color:${f.c}">${f.n}</span> ${cm}cm 획득!${isNew?'<br><small>✨ 도감 신규 등록</small>':''}`,2400);renderDex();say('시스템',`${f.n} ${cm}cm를 낚았어요!`);this.state='off';api.onReel&&api.onReel(f);this.ui();},
 update(dt){if(this.state==='cast'){this.t+=dt;if(this.t>this.bite){this.state='bite';audio.bite();toast('❗ 입질! 지금 클릭!',1200);ui.fishBtn.textContent='❗ 낚아올리기!';api.onBite&&api.onBite();}}
  else if(this.state==='bite'){this.t+=dt;if(this.t>this.bite+6){this.state='cast';this.bite=this.t+2+Math.random()*3;ui.fishBtn.textContent='⏳ 입질 대기…';}}
  this.ui();},
 ui(){if(!ui.fishBtn)return;const show=api.nearSpot||this.state!=='off';ui.fishBtn.style.display=show?'block':'none';if(this.state==='off')ui.fishBtn.textContent='🎣 낚시 시작';}};
// 봇(가짜 유저)
const NAMES=['물멍러','붕어왕','노을소녀','캠핑아재','꼬마낚시꾼','밤낚시'];const LINES=['안녕하세요~','여기 붕어 잘 나오네요','노을 진짜 예쁘다','모닥불 쬐러 가요','🐟','😊','가물치 잡으신 분?','어항 구경 오세요!','소리 너무 힐링돼요','👍'];
const bots=[];function makeBots(n,spawn){for(let i=0;i<n;i++){const p=spawn(i);bots.push({name:NAMES[i%6],kind:i%4,x:p.x,y:p.y,tx:p.x,ty:p.y,dir:0,wait:Math.random()*3,chat:5+Math.random()*10,moving:false});}return bots;}
function updateBots(dt,pick,walk){for(const b of bots){b.wait-=dt;b.chat-=dt;if(b.chat<0){b.chat=8+Math.random()*14;say(b.name,LINES[Math.random()*LINES.length|0]);}
  const dx=b.tx-b.x,dy=b.ty-b.y,l=Math.hypot(dx,dy);if(l<.3||b.wait>0){b.moving=false;if(b.wait<=0){b.wait=2+Math.random()*5;const p=pick();b.tx=p.x;b.ty=p.y;}continue;}
  const s=Math.min(l,dt*2.2),nx=b.x+dx/l*s,ny=b.y+dy/l*s;if(walk(nx,ny)){b.x=nx;b.y=ny;b.dir=Math.atan2(dx,dy);b.moving=true;}else{b.wait=1;b.tx=b.x;b.ty=b.y;}}}
function lastBubble(who){for(let i=bubbles.length-1;i>=0;i--)if(bubbles[i].who===who){return performance.now()-bubbles[i].t<4000?bubbles[i].txt:null;}return null;}
// WebAudio 앰비언트
const audio={on:true,start(){const A=this.ctx=new (window.AudioContext||window.webkitAudioContext)();const m=this.master=A.createGain();m.gain.value=.6;m.connect(A.destination);
  const nb=A.createBuffer(1,A.sampleRate*2,A.sampleRate),d=nb.getChannelData(0);let b=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;b=(b+.02*w)/1.02;d[i]=b*3.5;}this.nb=nb;
  const src=(f,q,type,g)=>{const s=A.createBufferSource();s.buffer=nb;s.loop=true;const fl=A.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const gn=A.createGain();gn.gain.value=g;s.connect(fl).connect(gn).connect(m);s.start();return{fl,gn};};
  this.water=src(500,.7,'lowpass',.35);this.wind=src(900,.5,'bandpass',.15);
  const lfo=A.createOscillator(),lg=A.createGain();lfo.frequency.value=.08;lg.gain.value=.12;lfo.connect(lg).connect(this.wind.gn.gain);lfo.start();
  const lfo2=A.createOscillator(),lg2=A.createGain();lfo2.frequency.value=.3;lg2.gain.value=150;lfo2.connect(lg2).connect(this.water.fl.frequency);lfo2.start();
  this.cr=A.createGain();this.cr.gain.value=0;this.cr.connect(m);const o=A.createOscillator();o.frequency.value=4300;const am=A.createGain();am.gain.value=0;const ao=A.createOscillator();ao.type='square';ao.frequency.value=28;const ag=A.createGain();ag.gain.value=.5;ao.connect(ag).connect(am.gain);o.connect(am).connect(this.cr);o.start();ao.start();
  this.timer=setInterval(()=>{if(!this.on)return;const n=time.name;this.cr.gain.setTargetAtTime(n==='밤'?.05:n==='노을'?.02:0,A.currentTime,1);if(n!=='밤'&&Math.random()<.5)this.bird();},900);},
 toggle(){this.on=!this.on;if(this.master)this.master.gain.value=this.on?.6:0;},
 tone(f1,f2,dur,type='sine',g=.15,delay=0){if(!this.ctx)return;const A=this.ctx,t=A.currentTime+delay,o=A.createOscillator(),gn=A.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+dur);gn.gain.setValueAtTime(g,t);gn.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(gn).connect(this.master);o.start(t);o.stop(t+dur);},
 bird(){const b=2000+Math.random()*1500;for(let i=0;i<2+Math.random()*3;i++)this.tone(b,b*1.4,.09,'sine',.04,i*.12);},
 splash(g=.3){if(!this.ctx)return;const A=this.ctx,s=A.createBufferSource();s.buffer=this.nb;const f=A.createBiquadFilter();f.type='bandpass';f.frequency.value=1200;const gn=A.createGain();gn.gain.setValueAtTime(g,A.currentTime);gn.gain.exponentialRampToValueAtTime(.001,A.currentTime+.5);s.connect(f).connect(gn).connect(this.master);s.start();s.stop(A.currentTime+.5);},
 cast(){this.tone(900,300,.35,'triangle',.06);setTimeout(()=>this.splash(.25),450);},
 bite(){this.splash(.4);this.tone(880,880,.15,'sine',.12);this.tone(1320,1320,.2,'sine',.1,.15);},
 reel(){for(let i=0;i<10;i++)this.tone(300+i*40,250,.04,'square',.03,i*.05);setTimeout(()=>{this.splash(.5);[523,659,784].forEach((f,i)=>this.tone(f,f,.3,'sine',.1,i*.1));},500);}};
const api={FISH,dex,keys,joy,init,toast,say,move,time,palette,fishing,makeBots,updateBots,bots,lastBubble,audio,nearSpot:false,sitting:false,lerpC};
return api;})();
