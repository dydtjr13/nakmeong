// v12 시안: 서버 1~3위 닉네임 위 왕관/칭호/오라 (인게임 DOM 오버레이 시안 — 게임 본편 미적용)
window.CROWN_V={
 a:{n:'A · 왕관 + 메달 닉네임',d:'머리 위 3D 느낌 왕관(1위 금/2위 은/3위 동)과 메달색 닉네임 플레이트'},
 b:{n:'B · 칭호 리본',d:'"블루길 주간 1위" 같은 칭호 리본 — 어종 랭킹과 직접 연결'},
 c:{n:'C · 발밑 오라',d:'캐릭터 발밑 빛 고리 + 떠오르는 반짝이, 닉네임은 작게'},
 d:{n:'D · 미니멀 글로우',d:'닉네임 옆 작은 메달 + 은은한 글로우 — 화면이 복잡할 때도 깔끔'}};
window.crownStyle=`
.cw{position:fixed;left:0;top:0;transform:translate(-50%,-100%);pointer-events:none;text-align:center;font-family:Pretendard,'Noto Sans KR',sans-serif;z-index:5}
.cw .nm{display:inline-block;font-weight:900;font-size:13px;padding:3px 10px;border-radius:10px;background:#fffdf8ee;color:#3d3548;box-shadow:0 2px 8px #0003;white-space:nowrap}
.cw.r1{--m:#f6c542;--m2:#fff1b8}.cw.r2{--m:#8f9cb0;--m2:#eef2f7}.cw.r3{--m:#e09a66;--m2:#ffe6d4}
.va .nm{background:linear-gradient(var(--m2),#fff);box-shadow:0 0 0 2px var(--m),0 3px 10px #0003}
.va .cr{width:34px;height:24px;margin:0 auto 2px;background:linear-gradient(var(--m2),var(--m));clip-path:polygon(0 100%,0 25%,25% 60%,50% 0,75% 60%,100% 25%,100% 100%);filter:drop-shadow(0 1px 0 #0004) drop-shadow(0 0 6px var(--m));animation:cwb 1.6s ease-in-out infinite}
.va.r1 .cr{width:42px;height:30px}
@keyframes cwb{50%{transform:translateY(-4px)}}
.vb .rb{display:inline-block;margin-bottom:3px;padding:3px 12px 3px 10px;font-size:11.5px;font-weight:900;color:#fff;background:linear-gradient(90deg,var(--m),color-mix(in srgb,var(--m) 70%,#000));clip-path:polygon(0 0,100% 0,94% 50%,100% 100%,0 100%,6% 50%);white-space:nowrap;text-shadow:0 1px 2px #0005}
.vb .nm{font-size:12.5px}
.vc .nm{font-size:12px;background:#3d3548cc;color:#fff}.vc .nm b{color:var(--m)}
.aura{position:fixed;transform:translate(-50%,-50%);pointer-events:none;border-radius:50%;z-index:4;background:radial-gradient(closest-side,color-mix(in srgb,var(--m) 95%,#fff) 0,color-mix(in srgb,var(--m) 60%,transparent) 60%,transparent);box-shadow:0 0 0 3px var(--m) inset,0 0 18px var(--m);animation:aup 1.8s ease-in-out infinite}
@keyframes aup{50%{transform:translate(-50%,-50%) scale(1.12);opacity:.75}}
.aura i{position:absolute;width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 6px var(--m);animation:afl 2.2s linear infinite}
@keyframes afl{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-70px);opacity:0}}
.vd .nm{font-size:12px;box-shadow:0 0 12px color-mix(in srgb,var(--m) 80%,transparent),0 2px 6px #0002}
.vd .md{display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,var(--m));color:#fff;font-size:10px;font-weight:900;margin-right:4px;vertical-align:-3px;text-shadow:0 1px 1px #0004}
`;
window.crownHtml=(v,rk,name,fish)=>{const T=['','1위','2위','3위'][rk];
 if(v==='a')return `<div class="cr"></div><div class="nm">${name}</div>`;
 if(v==='b')return `<div class="rb">${fish} 주간 ${T}</div><br><div class="nm">${name}</div>`;
 if(v==='c')return `<div class="nm"><b>${T}</b> ${name}</div>`;
 return `<div class="nm"><span class="md">${rk}</span>${name}</div>`;};
