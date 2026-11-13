// v151 🛥 새 배: 요트 · 카타마란 (사용자 사진을 참고한 오리지널 로우폴리 모델) · 노 젓는 보트(Kenney Watercraft Kit, CC0)
window.NK_BOAT2 = (function () {
  const M = (T, c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .5, metalness: .05 }, o || {}));
  const box = (T, g, w, h, d, m, x, y, z, rx, ry, rz) => { const b = new T.Mesh(new T.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.rotation.set(rx || 0, ry || 0, rz || 0); b.castShadow = true; g.add(b); return b; };
  // 위에서 본 배 모양(뒤 z=-L/2 · 앞 z=+L/2 뾰족)을 위로 밀어 올린 선체
  function hullShape(T, L, W, bow) {
    const s = new T.Shape(), h = L / 2;
    s.moveTo(-W / 2, -h); s.lineTo(W / 2, -h); s.lineTo(W / 2, h - bow);
    s.quadraticCurveTo(W / 2, h - bow * .2, 0, h); s.quadraticCurveTo(-W / 2, h - bow * .2, -W / 2, h - bow); s.closePath();
    return s;
  }
  function slab(T, shape, y0, y1, m, inset) {
    const g = new T.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 2, curveSegments: 14 });
    g.rotateX(Math.PI / 2); g.translate(0, y1, 0);
    const me = new T.Mesh(g, m); me.castShadow = true; if (inset) me.scale.set(inset, 1, inset); return me;
  }
  function yacht(T, cc) {
    const NAVY = cc === 'navy', g = new T.Group(), W = M(T, '#fbfbf8', { roughness: .32 }), HL = NAVY ? M(T, '#22385e', { roughness: .3 }) : W, DK = M(T, '#1d2430', { roughness: .25, metalness: .3 }), GL = M(T, '#33465c', { roughness: .08, metalness: .4 }),
      TK = M(T, '#d9a873', { roughness: .8 }), CR = M(T, '#e9e0cf', { roughness: .7 }), ST = M(T, '#c8ced6', { metalness: .7, roughness: .25 });
    const L = 6.2, B = 1.9;
    // 선체: 아래 남색 띠 + 흰 몸통 (뒤로 갈수록 약간 낮게)
    const hs = hullShape(T, L, B, 1.9);
    const keel = slab(T, hullShape(T, L * .96, B * .86, 1.8), -.28, -.05, DK); g.add(keel);
    const body = slab(T, hs, -.08, .62, HL); g.add(body);
    // 선체 옆 검은 줄 · 창
    [-1, 1].forEach(q => {
      box(T, g, .02, .05, L * .8, DK, q * (B / 2 + .045), .1, -.15);
      box(T, g, .02, .2, .55, DK, q * (B / 2 + .045), .32, -.6);
      for (let i = 0; i < 3; i++) { const p = new T.Mesh(new T.CircleGeometry(.055, 10), DK); p.position.set(q * (B / 2 + .05), .32, .4 + i * .32); p.rotation.y = q * Math.PI / 2; g.add(p); }
      box(T, g, .02, .12, .5, DK, q * (B / 2 - .12), .42, 2.1, 0, q * -.38, 0);
    });
    // 갑판 · 뒤 수영 데크 · 앞 티크 선베드
    box(T, g, B - .16, .04, L * .55, W, 0, .66, -.3);
    box(T, g, B * .95, .06, .45, TK, 0, -.02, -L / 2 - .2);
    const bow = slab(T, hullShape(T, 1.6, 1.25, .9), .66, .7, TK); bow.position.z = 1.85; g.add(bow);
    // 앞 갑판 의자 (지붕 없는 곳) — 흰 몸체 + 크림 쿠션 + 티크 팔걸이
    { const ch = new T.Group(); ch.position.set(0, .7, 1.45); g.add(ch);
      box(T, ch, .66, .12, .62, W, 0, .06, 0); box(T, ch, .56, .07, .52, CR, 0, .15, .02);
      box(T, ch, .66, .5, .1, W, 0, .36, -.3, -.22, 0, 0); box(T, ch, .54, .38, .05, CR, 0, .38, -.24, -.22, 0, 0);
      [-1, 1].forEach(q => { box(T, ch, .08, .16, .5, TK, q * .33, .2, 0); }); }
    // 선실 (짙은 유리창)
    const cab = slab(T, hullShape(T, 3.0, 1.6, 1.0), .66, 1.28, W); cab.position.z = -.25; g.add(cab);
    [-1, 1].forEach(q => box(T, g, .02, .32, 2.1, GL, q * .815, .98, -.45));
    const ws = box(T, g, 1.25, .5, .05, GL, 0, 1.05, 1.05, -1.0, 0, 0);
    box(T, g, 1.52, .05, 2.6, W, 0, 1.31, -.45);
    // 플라이브리지 (위층) · 하드탑 · 기둥
    box(T, g, 1.4, .1, 1.6, W, 0, 1.38, -1.0);
    box(T, g, .9, .34, .1, W, 0, 1.6, -.25);
    box(T, g, .5, .38, .5, CR, 0, 1.6, -1.25);
    [-.55, .55].forEach(x => { const p = box(T, g, .07, .95, .07, W, x, 1.9, -.4, -.25, 0, 0); });
    const top = box(T, g, 1.6, .07, 1.75, W, 0, 2.38, -1.0);
    [[-.32, .14], [.32, .14]].forEach(([x]) => { const d = new T.Mesh(new T.SphereGeometry(.15, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), W); d.position.set(x, 2.42, -1.1); g.add(d); });
    box(T, g, .06, .4, .06, ST, 0, 2.6, -1.25); box(T, g, .45, .04, .06, ST, 0, 2.78, -1.25);
    // 난간
    [-1, 1].forEach(q => { const r = new T.Mesh(new T.CylinderGeometry(.018, .018, 2.4, 6), ST); r.rotation.x = Math.PI / 2; r.position.set(q * .82, .92, 1.25); g.add(r); for (let i = 0; i < 5; i++) box(T, g, .02, .26, .02, ST, q * .82, .79, .2 + i * .5); });
    g.userData.seat = [0, .9, 1.47];
    return g;
  }
  function cat(T, cc) {
    const CO = cc === 'coral', g = new T.Group(), W = M(T, '#f6f6f2', { roughness: .35 }), TL = M(T, CO ? '#d9654c' : '#2f6f6a'), TL2 = M(T, CO ? '#e8846a' : '#3d847c'), CRM = M(T, '#e9dcc2', { roughness: .8 }),
      YL = M(T, '#f1b83a'), NV = M(T, '#22303a', { roughness: .4 }), DK = M(T, '#1b2228', { roughness: .3, metalness: .2 });
    // 양쪽 뜬 몸통 (앞이 뾰족)
    [-1, 1].forEach(q => {
      const p = new T.Group(); p.position.x = q * .78; g.add(p);
      const hs = hullShape(T, 3.3, .55, .9);
      const bot = slab(T, hs, -.22, .02, NV); p.add(bot);
      const top = slab(T, hs, .0, .26, W); p.add(top);
      box(T, p, .02, .06, 2.0, YL, q * .3, .12, .1); box(T, p, .02, .04, 1.6, TL, q * .3, .05, -.1);
      const nose = new T.Mesh(new T.SphereGeometry(.12, 10, 8), YL); nose.scale.set(1, .6, 1.4); nose.position.set(0, .2, 1.42); p.add(nose);
    });
    // 가운데 갑판 · 쿠션
    box(T, g, 1.5, .1, 2.2, W, 0, .32, -.05);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) box(T, g, .62, .08, .5, TL2, -.36 + i * .72, .41, .55 + j * .52);
    box(T, g, .6, .06, .4, W, 0, .46, 1.12); box(T, g, .28, .02, .22, DK, 0, .5, 1.12);
    // 의자 2개 + 가운데 조종대
    [-1, 1].forEach(q => {
      const s = new T.Group(); s.position.set(q * .42, .4, -.45); g.add(s);
      box(T, s, .52, .14, .5, TL, 0, .1, 0); box(T, s, .42, .05, .38, CRM, 0, .19, .02);
      box(T, s, .52, .6, .14, TL, 0, .42, -.22, -.12, 0, 0); box(T, s, .36, .38, .03, CRM, 0, .44, -.14, -.12, 0, 0);
      box(T, s, .07, .22, .44, TL, -.28, .28, 0); box(T, s, .07, .22, .44, TL, .28, .28, 0);
    });
    box(T, g, .2, .42, .5, NV, 0, .58, -.4); box(T, g, .04, .16, .04, DK, 0, .86, -.3);
    const kn = new T.Mesh(new T.SphereGeometry(.05, 8, 6), DK); kn.position.set(0, .95, -.3); g.add(kn);
    // 뒤쪽 아치 기둥 + 차양 (태양광 지붕)
    [-1, 1].forEach(q => {
      const c = new T.CatmullRomCurve3([new T.Vector3(q * .72, .36, -1.05), new T.Vector3(q * .74, 1.3, -1.1), new T.Vector3(q * .7, 1.95, -.75), new T.Vector3(q * .68, 2.05, -.2)]);
      const t = new T.Mesh(new T.TubeGeometry(c, 20, .055, 8), W); t.castShadow = true; g.add(t);
    });
    const can = new T.Mesh(new T.BoxGeometry(1.6, .05, 1.45), DK); can.position.set(0, 2.07, -.45); can.rotation.x = -.08; g.add(can);
    box(T, g, 1.66, .06, .08, W, 0, 2.07, .28, -.08, 0, 0);
    for (let i = 0; i < 4; i++) box(T, g, 1.5, .005, .01, M(T, '#46535e'), 0, 2.1, -1.0 + i * .33, -.08, 0, 0);
    // 타월
    const tw = new T.Mesh(new T.CylinderGeometry(.08, .08, .5, 10), TL); tw.rotation.z = Math.PI / 2; tw.position.set(.35, .52, .9); g.add(tw);
    g.userData.seat = [-.42, .62, -.5]; g.userData.seat2 = [.42, .62, -.5];
    return g;
  }
  // 노 젓는 보트: Kenney 모델을 한 번 불러와서 복사해요
  let RB = null, RBW = [];
  function rowb(T) {
    const g = new T.Group();
    const put = (sc) => { const o = sc.clone(true); g.add(o); };
    if (RB) put(RB); else { RBW.push(put); if (RBW.length === 1 && T.GLTFLoader) new T.GLTFLoader().load('assets/kenney/watercraft/boat-row-large.glb', (x) => { const s = x.scene; s.traverse((o) => { if (o.isMesh) { o.castShadow = true; if (o.material && o.material.map) o.material.map.encoding = T.sRGBEncoding; } }); const bb = new T.Box3().setFromObject(s), sz = bb.getSize(new T.Vector3()), k = 2.6 / Math.max(sz.x, sz.z); s.scale.setScalar(k); s.position.y = -bb.min.y * k - .32; if (sz.x > sz.z) s.rotation.y = Math.PI / 2; RB = s; RBW.splice(0).forEach((f) => f(RB)); }); }
    g.userData.seat = [0, .02, -.15];
    return g;
  }
  return { yacht, cat, rowb };
})();
