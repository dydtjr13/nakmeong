/* 피쉬코지 초월+ 탈것 시안.
   왼쪽 프리즘 하이퍼카는 game-v2.js flyHyper(홀로그램)와 같은 로프트·펄 셰이더·언더글로우·반짝이.
   오른쪽은 그 위에 로봇↔자동차 변신과 테마 이펙트를 올린 시안. 게임 본편에는 연결되어 있지 않아요. */
(function () {
  window.addEventListener('error', ev => {
    const p = document.createElement('pre');
    p.className = 'err';
    p.textContent = String(ev.message || ev.error || ev);
    p.style.cssText = 'background:#fff;color:#a32020;padding:12px;white-space:pre-wrap';
    document.body.prepend(p);
  });
  if (!window.THREE) {
    document.getElementById('app').innerHTML = '<p>three.js를 불러오지 못했어요.</p>';
    return;
  }
  const T = THREE;
  const TAU = Math.PI * 2;
  const HYU = { t: { value: 0 } };
  const Q = new URLSearchParams(location.search);
  const ONLY = Q.get('only');
  const SHOT = Q.get('shot') === '1';
  if (ONLY) document.body.classList.add('only');
  if (SHOT) document.body.classList.add('shot');
  if (Q.get('rec') === '1') document.body.classList.add('rec');

  function ease(u) { return u * u * (3 - 2 * u); }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function pose(x, y, z, rx, ry, rz, sx, sy, sz) {
    return { p: [x, y, z], r: [rx || 0, ry || 0, rz || 0], s: [sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz] };
  }
  function lerpPose(a, b, t) {
    return {
      p: a.p.map((v, i) => lerp(v, b.p[i], t)),
      r: a.r.map((v, i) => lerp(v, b.r[i], t)),
      s: a.s.map((v, i) => lerp(v, b.s[i], t))
    };
  }
  function applyPose(o, p) {
    o.position.set(p.p[0], p.p[1], p.p[2]);
    o.rotation.set(p.r[0], p.r[1], p.r[2]);
    o.scale.set(Math.max(1e-4, p.s[0]), Math.max(1e-4, p.s[1]), Math.max(1e-4, p.s[2]));
  }
  function blend3(a, b, c, t) {
    if (t < 0.4) return lerpPose(a, b, ease(t / 0.4));
    return lerpPose(b, c, ease((t - 0.4) / 0.6));
  }
  function mp(s, x, y, z, rx, ry, rz, sx, sy, sz) {
    return pose(s * x, y, z, rx || 0, s * (ry || 0), s * (rz || 0), sx, sy, sz);
  }

  function hyMat(key, pal, o) {
    o = o || {};
    const m = new T.MeshStandardMaterial({ color: o.base || '#ffffff', metalness: 0.12, roughness: 0.42 });
    const C = pal.map(c => new T.Color(c));
    m.onBeforeCompile = sh => {
      sh.uniforms.uHT = HYU.t;
      sh.uniforms.uC1 = { value: C[0] };
      sh.uniforms.uC2 = { value: C[1] };
      sh.uniforms.uC3 = { value: C[2] };
      sh.uniforms.uMx = { value: o.mix == null ? 0.5 : o.mix };
      sh.uniforms.uIr = { value: o.ir == null ? 0.42 : o.ir };
      sh.uniforms.uGl = { value: o.gl == null ? 1 : o.gl };
      sh.uniforms.uCau = { value: o.cau ? 1 : 0 };
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uHT,uMx,uIr,uGl,uCau;uniform vec3 uC1,uC2,uC3;')
        .replace('#include <output_fragment>', `{vec3 V_=normalize(vViewPosition);vec3 N_=normalize(normal);float fr=1.0-clamp(dot(N_,V_),0.,1.);
 float h=fract(fr*1.1+N_.y*.32+N_.x*.22+uHT*.035);vec3 ic=h<.3333?mix(uC1,uC2,h*3.):h<.6667?mix(uC2,uC3,(h-.3333)*3.):mix(uC3,uC1,(h-.6667)*3.);
 vec3 R_=(vec4(reflect(-V_,N_),0.)*viewMatrix).xyz;float hz=smoothstep(-.04,.05,R_.y)*(1.-smoothstep(.05,.42,R_.y));float sk=smoothstep(.25,.95,R_.y);
 float lu=dot(outgoingLight,vec3(.3,.59,.11));outgoingLight=ic*(uMx+uIr*lu)+vec3(1.)*hz*.42*uGl+mix(ic,vec3(1.),.5)*sk*.16*uGl+pow(fr,3.)*mix(uC3,vec3(1.),.3)*.35;
 float cau=sin(N_.x*16.+uHT*2.2)*sin(N_.z*13.-uHT*1.7);outgoingLight+=vec3(.45,.95,.95)*cau*cau*.22*uCau;}
#include <output_fragment>`);
    };
    m.customProgramCacheKey = () => 'txp' + key + (o.cau ? 'c' : '');
    return m;
  }
  function std(c, metal, rough) {
    return new T.MeshStandardMaterial({ color: c, metalness: metal, roughness: rough });
  }
  /* 기본색은 유지하고 가장자리 광택·물빛만 더해요. 하이퍼카 펄 셰이더처럼 색을 통째로 바꾸지 않아요. */
  function sheenMat(color, o) {
    o = o || {};
    const m = new T.MeshStandardMaterial({ color, metalness: o.metal == null ? 0.45 : o.metal, roughness: o.rough == null ? 0.32 : o.rough });
    m.onBeforeCompile = sh => {
      sh.uniforms.uHT = HYU.t;
      sh.uniforms.uRim = { value: new T.Color(o.rim || '#ffffff') };
      sh.uniforms.uGl = { value: o.gl == null ? 1 : o.gl };
      sh.uniforms.uCau = { value: o.cau ? 1 : 0 };
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uHT,uGl,uCau;uniform vec3 uRim;')
        .replace('#include <output_fragment>', `{vec3 V_=normalize(vViewPosition);vec3 N_=normalize(normal);float fr=pow(1.0-clamp(dot(N_,V_),0.,1.),2.4);
 vec3 R_=(vec4(reflect(-V_,N_),0.)*viewMatrix).xyz;float hz=smoothstep(-.02,.06,R_.y)*(1.-smoothstep(.08,.5,R_.y));
 outgoingLight+=uRim*fr*.65*uGl+vec3(1.)*hz*.55*uGl;
 float cau=sin(N_.x*18.+uHT*2.1)*sin(N_.z*14.-uHT*1.6);outgoingLight+=vec3(.55,1.,.95)*cau*cau*.28*uCau;}
#include <output_fragment>`);
    };
    m.customProgramCacheKey = () => 'sheen' + (o.cau ? 'c' : '') + (o.gl || 1);
    return m;
  }
  function glowMat(c, inten) {
    return new T.MeshStandardMaterial({ color: '#141414', emissive: new T.Color(c), emissiveIntensity: inten || 1.6, roughness: 0.4, metalness: 0.05 });
  }

  let GLOW_TX = null, STAR_TX = null, SOFT_TX = null, HEART_TX = null;
  function glowTex() {
    if (GLOW_TX) return GLOW_TX;
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    GLOW_TX = new T.CanvasTexture(c); return GLOW_TX;
  }
  function starTex() {
    if (STAR_TX) return STAR_TX;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 14);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    x.fillStyle = '#fff'; x.beginPath();
    x.moveTo(32, 2); x.lineTo(35, 29); x.lineTo(62, 32); x.lineTo(35, 35); x.lineTo(32, 62); x.lineTo(29, 35); x.lineTo(2, 32); x.lineTo(29, 29); x.closePath(); x.fill();
    STAR_TX = new T.CanvasTexture(c); return STAR_TX;
  }
  function softTex() {
    if (SOFT_TX) return SOFT_TX;
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 8, 64, 64, 64);
    g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    SOFT_TX = new T.CanvasTexture(c); return SOFT_TX;
  }
  function heartTex() {
    if (HEART_TX) return HEART_TX;
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d');
    x.fillStyle = '#fff';
    x.beginPath();
    x.moveTo(32, 54);
    x.bezierCurveTo(4, 36, 6, 16, 20, 14);
    x.bezierCurveTo(28, 12, 32, 20, 32, 20);
    x.bezierCurveTo(32, 20, 36, 12, 44, 14);
    x.bezierCurveTo(58, 16, 60, 36, 32, 54);
    x.fill();
    HEART_TX = new T.CanvasTexture(c); return HEART_TX;
  }

  function hyLoft(F, N, M, pw) {
    const pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const f = F(i / N);
      for (let j = 0; j < M; j++) {
        const t = j / M * TAU, c = Math.cos(t), s = Math.sin(t);
        const ac = Math.pow(Math.abs(c), 2 / pw) * Math.sign(c);
        const as = Math.pow(Math.abs(s), 2 / pw) * Math.sign(s);
        const up = s > 0;
        const x = ac * f.w * (up ? 1 - 0.2 * as : 1);
        const y = up ? f.ym + as * (f.yt - f.ym) : f.ym + as * (f.ym - f.yb);
        pos.push(x, y, f.z);
      }
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
      const a = i * M + j, b = i * M + (j + 1) % M, c = (i + 1) * M + j, d = (i + 1) * M + (j + 1) % M;
      idx.push(a, b, d, a, d, c);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  const hySm = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  function box(w, h, d, mat) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
    m.castShadow = false; return m;
  }
  function cyl(rt, rb, h, mat, seg) {
    return new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 16), mat);
  }
  function sph(r, mat, ws, hs) {
    return new T.Mesh(new T.SphereGeometry(r, ws || 16, hs || 12), mat);
  }

  /* ── 기존 초월: 프리즘 하이퍼카 (game-v2.js flyHyper holo 와 같은 형태) ── */
  function buildHyper() {
    const P = { p: ['#ff7ad9', '#8a8cff', '#5ef0ff'], n: '#ff4fd8', g: '#53e6ff' };
    const g = new T.Group(), L = 1.78;
    const paint = hyMat('holo', P.p, { mix: 0.32, ir: 0.85, gl: 1 });
    const glass = hyMat('hgl', ['#1a1640', '#2e3486', '#1b5f92'], { mix: 0.55, ir: 0.45, gl: 1.3 });
    const dark = std('#1c1b26', 0.5, 0.35);
    const neon = c => glowMat(c, 1.8);
    const WZ = [1.1, -1.08], WR = 0.32;
    const body = new T.Mesh(hyLoft(s => {
      const z = -L + s * 2 * L;
      const e = s < 0.05 ? Math.max(0.7, Math.sqrt(1 - Math.pow(1 - s / 0.05, 2))) : s > 0.955 ? Math.sqrt(Math.max(0, 1 - Math.pow((s - 0.955) / 0.045, 2))) : 1;
      let w = 0.72 + 0.09 * Math.max(...WZ.map(q => Math.exp(-Math.pow((z - q) / 0.4, 2)))) - 0.22 * hySm(1.1, L, z) - 0.05 * hySm(-1.3, -L, z);
      let yt = 0.4 + 0.24 * hySm(L, 0.35, z) - 0.02 * hySm(-1.0, -L, z), yb = 0.19;
      WZ.forEach(q => { const d = Math.abs(z - q); if (d < WR + 0.1) yb = Math.max(yb, 0.3 + Math.sqrt(Math.max(0, Math.pow(WR + 0.1, 2) - d * d)) * 0.9); });
      const ym = Math.min(yt - 0.05, Math.max(yb + 0.03, 0.36));
      return { z, w: w * Math.max(0.25, e), yt: ym + (yt - ym) * Math.max(0.35, e), yb: ym - (ym - yb) * Math.max(0.35, e), ym };
    }, 72, 40, 3.2), paint);
    g.add(body);
    const can = new T.Mesh(hyLoft(s => {
      const z = -1.3 + s * 2.0, u = s, e = Math.sin(Math.min(1, u) * Math.PI);
      const yt = 0.6 + 0.36 * Math.pow(Math.sin(Math.pow(u, 1.5) * Math.PI), 0.85);
      return { z, w: 0.6 * Math.pow(e, 0.4) + 0.02, yt, yb: 0.55, ym: 0.59 };
    }, 40, 32, 2.6), glass);
    g.add(can);
    const sp = new T.Mesh(hyLoft(s => {
      const z = -1.22 + s * 1.62, u = (z + 1.3) / 2.0, e = Math.sin(Math.min(1, s) * Math.PI);
      const yt = 0.6 + 0.36 * Math.pow(Math.sin(Math.pow(u, 1.5) * Math.PI), 0.85) + 0.02;
      return { z, w: 0.12 * Math.pow(e, 0.5) + 0.01, yt, yb: yt - 0.05, ym: yt - 0.03 };
    }, 28, 16, 2.4), paint);
    g.add(sp);
    [-1, 1].forEach(sd => {
      const ai = box(0.05, 0.2, 0.5, dark); ai.position.set(sd * 0.78, 0.44, -0.55); ai.rotation.set(0, sd * -0.08, sd * -0.12); g.add(ai);
      const nl = box(0.03, 0.025, 0.62, neon(P.n)); nl.position.set(sd * 0.8, 0.55, -0.52); nl.rotation.set(-0.12, sd * -0.08, 0); g.add(nl);
      const sl = box(0.03, 0.03, 1.3, neon(P.g)); sl.position.set(sd * 0.77, 0.25, 0); g.add(sl);
      const mr = box(0.16, 0.05, 0.1, paint); mr.position.set(sd * 0.66, 0.71, 0.38); mr.rotation.z = sd * 0.25; g.add(mr);
    });
    [-1, 1].forEach(sd => {
      const a = box(0.3, 0.035, 0.04, neon('#eafcff')); a.position.set(sd * 0.3, 0.46, 1.54); a.rotation.set(-0.3, sd * 0.55, sd * -0.12); g.add(a);
      const b = box(0.16, 0.03, 0.04, neon(P.g)); b.position.set(sd * 0.42, 0.4, 1.47); b.rotation.set(-0.3, sd * 0.75, sd * 0.5); g.add(b);
    });
    const spl = box(0.95, 0.035, 0.2, dark); spl.position.set(0, 0.2, 1.6); g.add(spl);
    const em = new T.Mesh(new T.OctahedronGeometry(0.045), neon('#ffffff')); em.scale.set(1, 1.4, 0.5); em.position.set(0, 0.55, 1.56); em.rotation.x = -0.5; g.add(em);
    const tb = box(0.92, 0.04, 0.04, neon(P.n)); tb.position.set(0, 0.47, -L - 0.03); g.add(tb);
    [-1, 1].forEach(sd => { const tc = box(0.14, 0.07, 0.05, neon('#ff3a6a')); tc.position.set(sd * 0.4, 0.46, -L - 0.04); g.add(tc); });
    const df = box(1.0, 0.08, 0.2, dark); df.position.set(0, 0.22, -1.68); g.add(df);
    for (let i = -2; i <= 2; i++) { const f = box(0.02, 0.08, 0.16, dark); f.position.set(i * 0.2, 0.2, -1.74); g.add(f); }
    const wg = new T.Group(); wg.position.set(0, 0.84, -1.5); g.add(wg);
    const wb = box(1.42, 0.035, 0.28, paint); wb.rotation.x = 0.1; wg.add(wb);
    const we = box(1.42, 0.018, 0.02, neon(P.g)); we.position.set(0, -0.005, -0.15); wg.add(we);
    [-1, 1].forEach(sd => {
      const ep = box(0.025, 0.14, 0.3, paint); ep.position.set(sd * 0.72, -0.04, 0); wg.add(ep);
      const st = box(0.03, 0.24, 0.07, dark); st.position.set(sd * 0.36, -0.14, 0.03); st.rotation.x = -0.2; wg.add(st);
    });
    const wh = [];
    [[-0.72, WZ[0]], [0.72, WZ[0]], [-0.72, WZ[1]], [0.72, WZ[1]]].forEach(([x, z]) => {
      const w = new T.Group(); w.position.set(x, WR, z); const sd = Math.sign(x);
      const tire = new T.Mesh(new T.CylinderGeometry(WR, WR, 0.24, 24), std('#17161d', 0.2, 0.85)); tire.rotation.z = Math.PI / 2; w.add(tire);
      const rim = new T.Mesh(new T.CylinderGeometry(WR * 0.74, WR * 0.74, 0.26, 24), std('#2a2a36', 0.7, 0.3)); rim.rotation.z = Math.PI / 2; w.add(rim);
      for (let k = 0; k < 5; k++) {
        const s = box(0.04, WR * 1.38, 0.07, std('#3a3a4c', 0.8, 0.25));
        s.position.x = sd * 0.135; s.rotation.x = k / 5 * TAU; s.rotation.y = sd * 0.15; w.add(s);
      }
      const ring = new T.Mesh(new T.TorusGeometry(WR * 0.76, 0.014, 6, 32), neon(P.g)); ring.rotation.y = Math.PI / 2; ring.position.x = sd * 0.135; w.add(ring);
      const hub = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.28, 10), std('#d8d8e6', 0.8, 0.2)); hub.rotation.z = Math.PI / 2; w.add(hub);
      g.add(w); wh.push(w);
    });
    const ug = new T.Mesh(new T.PlaneGeometry(2.3, 4.4), new T.MeshBasicMaterial({
      map: glowTex(), color: P.n, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false
    }));
    ug.rotation.x = -Math.PI / 2; ug.position.y = 0.045; ug.renderOrder = 2; g.add(ug);
    const flames = new T.Group(); flames.visible = false;
    [-1, 1].forEach(sd => {
      const ex = new T.Mesh(new T.CylinderGeometry(0.06, 0.07, 0.14, 12), std('#4a4a56', 0.85, 0.28));
      ex.rotation.x = Math.PI / 2; ex.position.set(sd * 0.22, 0.3, -L - 0.02); g.add(ex);
      const cone = new T.Mesh(new T.ConeGeometry(0.11, 0.9, 12, 1, true), new T.MeshBasicMaterial({
        color: P.n, transparent: true, opacity: 0.85, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide
      }));
      cone.geometry.translate(0, 0.45, 0); cone.rotation.x = Math.PI / 2; cone.position.set(sd * 0.22, 0.3, -L - 0.15);
      flames.add(cone);
    });
    g.add(flames);
    g.userData.wheels = wh;
    g.userData.ug = ug;
    g.userData.flames = flames;
    g.userData.ncol = P.n;
    g.userData.gcol = P.g;
    return g;
  }

  function buildConcept(theme) {
    return TXRig.build(theme, { hyLoft, glowTex });
  }

  const THEMES = [
    {
      id: 'crimson', name: '크림슨 센티넬', icon: '🟥', kicker: '시안 A · 레퍼런스',
      lead: '주신 그림과 같은 빨강·검정·은색이에요. 어깨와 종아리의 바퀴가 자동차 바퀴가 되고, 등의 날개가 리어윙으로 펴져요.',
      points: [
        '변신: 웅크려 부품이 접힌 뒤, 검은 차체가 그 자리에 나타나요 (약 1.7초).',
        '이펙트: 빨간 오라가 납작해져 언더글로우가 되고, 변신 때 스파크, 달리면 불씨 꼬리.',
        '기존보다: 패널·갈매기 흉장·은색 휠이 나뉘어 있고, 로봇과 자동차가 같은 부품이에요. 하이퍼카는 변신이 없어요.'
      ],
      stat: '제안 속도 +155% · 정지=로봇 · 이동=자동차 · 옆자리 1명',
      glowC: '#ff3b3b', glow2C: '#ffd0d0',
      armorC: '#d01218', bodyC: '#1a1c24', glassC: '#12151c',
      accentPal: ['#e10600', '#ff5a45', '#4a1014'],
      shell: ['#14161c', '#3a2a32', '#9aa0aa'],
      glassPal: ['#12141c', '#2a3148', '#1a2838'],
      darkC: '#121318', silverC: '#d5d8e0', spokeC: '#c5cad3',
      metal: 0.62, rough: 0.3, mix: 0.28, ir: 0.82, gl: 1.15, pw: 4.0,
      ref: true
    },
    {
      id: 'cozy', name: '코지 퍼프', icon: '💗', kicker: '시안 B · 코지',
      lead: '피쉬코지처럼 동글동글해요. 눈이 있는 작은 로봇이 폴짝 접히면 사탕 광택의 슈퍼카가 돼요.',
      points: [
        '변신: 통통 튀는 스쿼시. 부품이 말랑하게 모이며 동그란 차체가 나와요.',
        '이펙트: 볼터치, 하트·별, 분홍 언더글로우. 서 있으면 살짝 숨 쉬듯 까딱.',
        '기존보다: 표정이 있고 광택이 부드러워요. 하이퍼카의 날카로운 펄과 다른, 따뜻한 최상위 등급.'
      ],
      stat: '제안 속도 +145% · 정지=로봇 · 이동=자동차 · 옆자리 1명',
      glowC: '#ff8aa8', glow2C: '#ffe1a8',
      armorC: '#ff8a84', bodyC: '#fff3ea', glassC: '#ffd0dc',
      accentPal: ['#ffd9cc', '#ff8d86', '#fff7f1'],
      shell: ['#fff1e4', '#ffb7ad', '#fffaf6'],
      glassPal: ['#ffd0dc', '#fff', '#ffb7c8'],
      darkC: '#6a403c', silverC: '#fff6ea', spokeC: '#ffe0c2',
      metal: 0.16, rough: 0.38, mix: 0.5, ir: 0.62, gl: 1.05, pw: 2.15, round: true, face: true, spokes: 5
    },
    {
      id: 'lake', name: '호수의 미라', icon: '🌊', kicker: '시안 C · 호수',
      lead: '호수색 청록과 진주빛이에요. 등지느러미가 리어 핀이 되고, 변신할 때 발밑에 물결이 퍼져요.',
      points: [
        '변신: 물보라 입자와 함께 지느러미가 뒤로 누워 핀이 돼요.',
        '이펙트: 차체에 일렁이는 물빛, 바닥 잔물결, 거품. 달리면 물보라 꼬리.',
        '기존보다: 펄이 무지개 네온이 아니라 수면 빛이고, 오라가 물결 링이에요.'
      ],
      stat: '제안 속도 +150% · 정지=로봇 · 이동=자동차 · 호수 위에서도 같은 연출',
      glowC: '#3ee0d2', glow2C: '#d8fbff',
      armorC: '#128f98', bodyC: '#083e48', glassC: '#062833',
      accentPal: ['#0e7c86', '#bffff6', '#123044'],
      shell: ['#08343c', '#1aa8a0', '#06202a'],
      glassPal: ['#062833', '#1a4a55', '#9fefff'],
      darkC: '#071c22', silverC: '#e7fbff', spokeC: '#b7e7ea',
      metal: 0.48, rough: 0.26, mix: 0.3, ir: 0.8, gl: 1.2, cau: true, pw: 3.1, fin: true
    },
    {
      id: 'aureate', name: '천상 오렐', icon: '✦', kicker: '시안 D · 천상',
      lead: '아이보리와 금이에요. 머리 위 빛고리가 지붕으로 내려오고, 빛의 날개가 리어윙으로 접혀요.',
      points: [
        '변신: 빛의 날개가 접히고, 머리 위 고리가 지붕의 헤일로가 돼요.',
        '이펙트: 금색 입자가 궤도를 돌고, 클리어코트 하이라이트가 하이퍼카보다 강해요.',
        '기존보다: 등급 표식이 초월+ 로 한 단계 위. 오라가 고리와 후광이에요.'
      ],
      stat: '제안 속도 +165% · 정지=로봇 · 이동=자동차 · 옆자리 1명',
      glowC: '#ffd56a', glow2C: '#fff6d4',
      armorC: '#e2b03a', bodyC: '#f6edd8', glassC: '#fff6e6',
      accentPal: ['#f4e2b0', '#e6b23a', '#fffaf0'],
      shell: ['#f7f1e4', '#f0d48a', '#fffdf8'],
      glassPal: ['#fff8e8', '#f3e0a8', '#ffffff'],
      darkC: '#5a4630', silverC: '#fff8e6', spokeC: '#f0d48a',
      metal: 0.28, rough: 0.28, mix: 0.34, ir: 0.9, gl: 1.35, pw: 3.3, halo: true, energy: true, pillar: true, spokes: 8
    }
  ];

  function cardHTML(th) {
    return `<article class="concept" id="c-${th.id}">
      <div class="ch">
        <div>
          <p class="kicker">${th.kicker}</p>
          <h2>${th.icon} ${th.name} <span class="badge plus">초월+</span></h2>
          <p class="desc">${th.lead}</p>
        </div>
        <ol class="pts">${th.points.map(p => `<li>${p}</li>`).join('')}</ol>
      </div>
      <div class="pair">
        <div class="mini old"><b>💎 프리즘 하이퍼카 <span class="badge tx">초월</span></b><small>지금 게임 · 속도 +120% · 변신 없음 · 펄 · 네온 · 언더글로우 · 반짝이 꼬리</small></div>
        <div class="mini new" style="--a:${th.glowC};--b:${th.glow2C}"><b>${th.icon} ${th.name} <span class="badge plus">초월+</span></b><small>${th.stat}</small></div>
      </div>
      <div class="stage" data-stage="${th.id}"><canvas aria-label="${th.name}와 프리즘 하이퍼카를 나란히 비교하는 화면"></canvas>
      <div class="tags">
        <span class="tag"><span class="badge tx">초월</span> 왼쪽 · 지금 게임</span>
        <span class="tag"><span class="badge plus">초월+</span> 오른쪽 · ${th.name}</span>
      </div></div>
      <div class="morph" aria-hidden="true"><span>로봇</span><div class="bar"><i></i></div><span>자동차</span></div>
      <p class="status"></p>
      <div class="ctrls">
        <button type="button" data-act="idle">정지</button>
        <button type="button" data-act="move">이동</button>
        <button type="button" class="pri" data-act="play">변신 재생</button>
        <button type="button" data-act="bot">로봇으로</button>
        <button type="button" data-act="car">자동차로</button>
        <button type="button" data-act="boost">기존 부스터</button>
      </div>
      <p class="hint">기본은 서 있으면 로봇, 「이동」을 누르면 자동차로 변신한 뒤 달려요. 「로봇으로」「자동차로」는 그 모습을 고정해서 정지·이동을 따로 볼 수 있어요. 「기존 부스터」는 왼쪽 하이퍼카의 머플러 불꽃이에요.</p>
      ${th.ref ? `<figure class="ref"><img src="ref-crimson.jpg" alt="빨강·검정·은색 로봇과 같은 배색의 하이퍼카 레퍼런스"><figcaption>참고로 주신 이미지 · 크림슨 센티넬의 배색과 실루엣</figcaption></figure>` : ''}
    </article>`;
  }

  const app = document.getElementById('app');
  const themes = ONLY ? THEMES.filter(t => t.id === ONLY) : THEMES;
  app.innerHTML = themes.map(cardHTML).join('');


  const ENV = new WeakMap();
  function studioEnv(renderer) {
    if (ENV.has(renderer)) return ENV.get(renderer);
    const c = document.createElement('canvas'); c.width = 512; c.height = 256;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 256);
    g.addColorStop(0, '#b9d7ee'); g.addColorStop(0.42, '#f5fbff'); g.addColorStop(0.5, '#ffffff');
    g.addColorStop(0.58, '#e4d0b0'); g.addColorStop(1, '#6d5e48');
    x.fillStyle = g; x.fillRect(0, 0, 512, 256);
    x.fillStyle = 'rgba(255,255,255,.92)';
    x.fillRect(36, 36, 78, 34); x.fillRect(300, 22, 130, 46); x.fillRect(190, 78, 36, 16);
    const tex = new T.CanvasTexture(c);
    tex.mapping = T.EquirectangularReflectionMapping;
    tex.encoding = T.sRGBEncoding;
    const pm = new T.PMREMGenerator(renderer);
    const env = pm.fromEquirectangular(tex).texture;
    pm.dispose();
    ENV.set(renderer, env);
    return env;
  }

  function makeRenderer(canvas) {
    const r = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    r.outputEncoding = T.sRGBEncoding;
    r.setClearColor(0xd7ece8, 1);
    return r;
  }

  function makeScene() {
    const sc = new T.Scene();
    sc.background = new T.Color(0xd7ece8);
    sc.add(new T.HemisphereLight(0xfff6ea, 0xb7c9a4, 0.82));
    const sun = new T.DirectionalLight(0xfff3e4, 0.9); sun.position.set(-7, 11, 6); sc.add(sun);
    const fill = new T.DirectionalLight(0xd5e4f4, 0.32); fill.position.set(6, 4, -3); sc.add(fill);
    const ground = new T.Mesh(new T.CircleGeometry(8.2, 64), new T.MeshLambertMaterial({ color: 0xc9ae8c }));
    ground.rotation.x = -Math.PI / 2; sc.add(ground);
    const wet = new T.Mesh(new T.CircleGeometry(8.2, 64), new T.MeshLambertMaterial({ color: 0xd5c4a4 }));
    wet.rotation.x = -Math.PI / 2; wet.position.y = -0.01; wet.scale.set(1, 1, 1); sc.add(wet);
    return sc;
  }

  function blob() {
    const m = new T.Mesh(new T.CircleGeometry(1.15, 32), new T.MeshBasicMaterial({
      map: softTex(), transparent: true, opacity: 0.9, depthWrite: false
    }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.renderOrder = 1;
    return m;
  }

  function Particles(parent) {
    this.parent = parent;
    this.list = [];
  }
  Particles.prototype.spawn = function (x, y, z, opt) {
    opt = opt || {};
    let p = this.list.find(s => s.life <= 0);
    if (!p) {
      if (this.list.length > 56) return;
      const mat = new T.SpriteMaterial({
        map: opt.heart ? heartTex() : starTex(), transparent: true,
        blending: T.AdditiveBlending, depthWrite: false
      });
      const s = new T.Sprite(mat); s.renderOrder = 4; this.parent.add(s);
      p = { s, life: 0 }; this.list.push(p);
    }
    p.s.position.set(x, y, z);
    p.s.material.color.set(opt.color || '#fff');
    p.s.material.map = opt.heart ? heartTex() : starTex();
    p.s.material.opacity = 1;
    p.s.visible = true;
    p.life = p.max = opt.life || 0.7;
    p.v = opt.v || [0, 0.4, 0];
    p.base = opt.size || 0.22;
  };
  Particles.prototype.burst = function (obj, color, n, heart) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, r = 0.2 + Math.random() * 0.4;
      const v = new T.Vector3((Math.random() - 0.5) * 1.2, 0.4 + Math.random() * 0.8, (Math.random() - 0.5) * 1.2);
      obj.localToWorld(v);
      const origin = obj.getWorldPosition(new T.Vector3());
      this.spawn(origin.x + Math.cos(a) * r, origin.y + 0.6, origin.z + Math.sin(a) * r, {
        color, heart, life: 0.45 + Math.random() * 0.4, size: 0.16 + Math.random() * 0.2,
        v: [(v.x - origin.x) * 1.4, 0.8 + Math.random(), (v.z - origin.z) * 1.4]
      });
    }
  };
  Particles.prototype.tick = function (dt) {
    for (const p of this.list) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.s.visible = false; continue; }
      p.s.position.x += p.v[0] * dt; p.s.position.y += p.v[1] * dt; p.s.position.z += p.v[2] * dt;
      const k = p.life / p.max;
      p.s.material.opacity = k;
      const sc = p.base * (0.6 + k);
      p.s.scale.set(sc, sc, 1);
    }
  };

  function Ripples(parent, color) {
    this.rings = [0, 1, 2].map(() => {
      const m = new T.Mesh(new T.TorusGeometry(0.45, 0.025, 6, 40), new T.MeshBasicMaterial({
        color, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false
      }));
      m.rotation.x = Math.PI / 2; m.position.y = 0.05; m.renderOrder = 2; parent.add(m);
      return { m, t: 0, on: false };
    });
  }
  Ripples.prototype.pulse = function (x, z) {
    const r = this.rings.find(n => !n.on) || this.rings[0];
    r.on = true; r.t = 0; r.m.position.x = x; r.m.position.z = z;
  };
  Ripples.prototype.tick = function (dt) {
    for (const r of this.rings) {
      if (!r.on) continue;
      r.t += dt;
      if (r.t > 1.1) { r.on = false; r.m.material.opacity = 0; continue; }
      const k = r.t / 1.1;
      r.m.scale.setScalar(1 + k * 3.2);
      r.m.material.opacity = (1 - k) * 0.7;
    }
  };

  const stages = [];
  document.querySelectorAll('[data-stage]').forEach(el => {
    const id = el.dataset.stage;
    const theme = THEMES.find(t => t.id === id);
    const canvas = el.querySelector('canvas');
    const article = el.closest('article');
    const renderer = makeRenderer(canvas);
    const scene = makeScene();
    scene.environment = studioEnv(renderer);
    const cam = new T.PerspectiveCamera(30, 1, 0.1, 80);
    const hyper = buildHyper();
    const concept = buildConcept(theme);
    hyper.add(blob());
    concept.add(blob());
    scene.add(hyper, concept);
    const fx = new Particles(scene);
    const rip = theme.id === 'lake' ? new Ripples(scene, theme.glowC) : null;
    const motes = [];
    if (theme.id === 'aureate') {
      for (let i = 0; i < 10; i++) {
        const s = new T.Sprite(new T.SpriteMaterial({ map: starTex(), color: i % 2 ? '#fff6d2' : '#ffd56a', transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
        s.renderOrder = 4; concept.add(s); motes.push(s);
      }
    }
    const st = {
      id, theme, el, article, renderer, scene, cam, hyper, concept, fx, rip, motes,
      morph: 0, form: 'bot', moving: false, queue: [], boost: 0, spin: 0, visible: true,
      crossed: false, auto: true
    };
    const poseQ = Q.get('pose');
    if (poseQ != null) {
      st.morph = poseQ === 'car' ? 1 : poseQ === 'mid' ? 0.45 : poseQ === 'bot' ? 0 : clamp01(+poseQ);
      st.form = st.morph > 0.5 ? 'car' : 'bot';
    }
    if (Q.get('move') === '1') st.moving = true;
    if (Q.get('boost') === '1') st.boost = 2;
    stages.push(st);

    function setForm(to, dur) {
      st.queue = [{ to, dur: dur == null ? 0.7 : dur, from: null, t: 0 }];
      st.form = to > 0.5 ? 'car' : 'bot';
    }
    article.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.act;
        if (a === 'idle') { st.moving = false; if (st.auto) setForm(0, 1.5); }
        else if (a === 'move') { st.moving = true; if (st.auto) setForm(1, 1.55); }
        else if (a === 'bot') { st.auto = false; setForm(0, 1.5); }
        else if (a === 'car') { st.auto = false; setForm(1, 1.5); }
        else if (a === 'play') {
          st.moving = false; st.auto = true; st.form = 'bot';
          st.queue = [
            { to: 0, dur: 0.35, from: null, t: 0 },
            { to: 1, dur: 1.7, from: null, t: 0 },
            { hold: 0.65, t: 0 },
            { to: 0, dur: 1.7, from: null, t: 0 }
          ];
        } else if (a === 'boost') st.boost = 2.2;
        syncBtns(st);
      });
    });
    new IntersectionObserver(ents => { ents.forEach(e => { st.visible = e.isIntersecting; }); }, { threshold: 0.02 }).observe(el);
  });

  function syncBtns(st) {
    const q = (a) => st.article.querySelector(`[data-act="${a}"]`);
    q('idle').classList.toggle('on', !st.moving);
    q('move').classList.toggle('on', st.moving);
    q('bot').classList.toggle('on', st.form === 'bot' && st.morph < 0.5);
    q('car').classList.toggle('on', st.form === 'car' && st.morph > 0.5);
    const form = st.morph > 0.82 ? '자동차' : st.morph < 0.18 ? '로봇' : '변신 중';
    const mv = st.moving ? '이동' : '정지';
    st.article.querySelector('.status').textContent = (st.queue.length ? '변신하는 중 · ' : '') + form + ' · ' + mv + (st.auto ? '' : ' · 모습 고정');
    st.article.querySelector('.morph .bar i').style.width = (st.morph * 100).toFixed(1) + '%';
  }

  function resizeStage(st) {
    const w = st.el.clientWidth || 640, h = st.el.clientHeight || 400;
    st.renderer.setSize(w, h, false);
    const aspect = w / Math.max(1, h);
    st.cam.aspect = aspect;
    const narrow = aspect < 1.2;
    st.cam.fov = narrow ? 34 : 27;
    st.cam.position.set(0, narrow ? 2.85 : 2.15, narrow ? 11.2 : 8.15);
    st.cam.lookAt(0, narrow ? 1.08 : 0.95, 0);
    st.cam.updateProjectionMatrix();
    const x = narrow ? 1.78 : 2.2;
    st.hyper.position.set(-x, 0, 0);
    st.concept.position.set(x, 0, 0);
    st.spread = x;
  }
  window.addEventListener('resize', () => stages.forEach(resizeStage));
  stages.forEach(resizeStage);

  const _v = new T.Vector3();
  function backPoint(obj, y, z) {
    _v.set(0, y, z);
    obj.localToWorld(_v);
    return _v.clone();
  }

  function tickConcept(st, dt, time) {
    const c = st.concept, th = st.theme;
    const bob = TXRig.tick(c, st.morph, dt, time, st.moving, st.queue);
    const baseY = (st._spreadY || 0);
    c.position.y = bob + (th.round && st.queue.length ? Math.sin(st.morph * Math.PI) * 0.12 : 0);
    const k = st.morph;
    if (k > 0.48 && !st.crossed) {
      st.crossed = true;
      st.fx.burst(c, th.glowC, th.round ? 16 : 20, !!th.round);
      if (st.rip) st.rip.pulse(c.position.x, c.position.z);
    }
    if (k < 0.32) st.crossed = false;
    if (st.moving && k > 0.72) {
      st.trail = (st.trail || 0) - dt;
      if (st.trail <= 0) {
        st.trail = 0.045;
        const p = backPoint(c, 0.35, -1.9);
        st.fx.spawn(p.x, p.y, p.z, {
          color: Math.random() < 0.5 ? th.glowC : th.glow2C,
          heart: th.round && Math.random() < 0.45,
          life: 0.55, size: 0.18 + Math.random() * 0.14,
          v: [Math.sin(c.rotation.y) * -0.15, 0.3, -Math.cos(c.rotation.y) * 0.1]
        });
      }
      if (st.rip && Math.random() < dt * 1.4) st.rip.pulse(c.position.x, c.position.z);
    }
    if (st.motes) st.motes.forEach((s, i) => {
      const a = time * 0.8 + i / st.motes.length * Math.PI * 2;
      const rad = 1.05 + k * 0.55;
      s.position.set(Math.cos(a) * rad, 1.15 * (1 - k) + 0.55 * k + Math.sin(time * 2 + i) * 0.1, Math.sin(a) * rad * 0.65);
      const sc = 0.1 + (i % 3) * 0.035;
      s.scale.set(sc, sc, 1);
    });
  }

  function tickHyper(st, dt, time) {
    const g = st.hyper;
    const a = st.moving || st.boost > 0 ? 1 : 0;
    g.userData.wheels.forEach(w => { w.rotation.x -= dt * (st.moving ? 10 : 0) * (st.boost > 0 ? 1.6 : 1); });
    g.userData.ug.material.opacity = 0.42 + Math.sin(time * 2.4) * 0.13 + a * 0.12;
    g.position.y = a ? Math.abs(Math.sin(time * 12)) * 0.02 : 0;
    g.userData.flames.visible = st.boost > 0;
    if (st.boost > 0) {
      st.boost -= dt;
      g.userData.flames.children.forEach((cone, i) => {
        const f = 0.85 + Math.sin(time * 40 + i) * 0.2;
        cone.scale.set(f, f, 0.7 + Math.random() * 0.5);
      });
    }
    if (st.moving) {
      st.htrail = (st.htrail || 0) - dt;
      if (st.htrail <= 0) {
        st.htrail = 0.05;
        const p = backPoint(g, 0.35, -1.9);
        st.fx.spawn(p.x, p.y, p.z, {
          color: Math.random() < 0.5 ? g.userData.ncol : g.userData.gcol,
          life: 0.6, size: 0.2, v: [0, 0.35, 0]
        });
      }
    }
  }

  let last = performance.now(), ready = false;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    HYU.t.value += dt;
    const time = HYU.t.value;
    const yaw = 0.62;
    for (const st of stages) {
      if (!st.visible && ready) continue;
      while (st.queue.length) {
        const q = st.queue[0];
        if (q.hold != null) {
          q.t += dt;
          if (q.t >= q.hold) { st.queue.shift(); continue; }
          break;
        }
        if (q.from == null) q.from = st.morph;
        q.t += dt;
        const u = Math.min(1, q.t / q.dur);
        st.morph = q.from + (q.to - q.from) * ease(u);
        if (u >= 1) { st.morph = q.to; st.queue.shift(); continue; }
        break;
      }
      st.hyper.rotation.y = yaw;
      st.concept.rotation.y = yaw;
      tickHyper(st, dt, time);
      tickConcept(st, dt, time);
      st.fx.tick(dt);
      if (st.rip) st.rip.tick(dt);
      resizeIf(st);
      st.renderer.render(st.scene, st.cam);
      syncBtns(st);
    }
    if (!ready) { ready = true; document.body.dataset.ready = '1'; }
    requestAnimationFrame(frame);
  }
  const sized = new WeakSet();
  function resizeIf(st) {
    const w = st.el.clientWidth, h = st.el.clientHeight;
    if (st._w !== w || st._h !== h) { st._w = w; st._h = h; resizeStage(st); }
  }
  stages.forEach(st => { syncBtns(st); resizeStage(st); st.renderer.render(st.scene, st.cam); });
  requestAnimationFrame(frame);
  window.__TX = { stages, THEMES };
})();
