/* 초월+ 시안 리그. 관절 피벗으로 접히고, 차체는 로프트 + 베벨 패널.
   게임 본편과는 연결되지 않아요. */
(function () {
  const T = THREE;
  const TAU = Math.PI * 2;
  const P = (x, y, z, rx, ry, rz, sx, sy, sz) => ({
    p: [x, y, z],
    r: [rx || 0, ry || 0, rz || 0],
    s: [sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz]
  });
  function ease(u) { return u * u * (3 - 2 * u); }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function lerpP(a, b, t) {
    return {
      p: a.p.map((v, i) => lerp(v, b.p[i], t)),
      r: a.r.map((v, i) => lerp(v, b.r[i], t)),
      s: a.s.map((v, i) => lerp(v, b.s[i], t))
    };
  }
  function blend(a, b, c, t) {
    if (t < 0.42) return lerpP(a, b, ease(t / 0.42));
    return lerpP(b, c, ease((t - 0.42) / 0.58));
  }
  function applyKF(o, t) {
    const k = o.userData.kf;
    if (!k) return;
    const p = blend(k.bot, k.mid, k.car, t);
    o.position.set(p.p[0], p.p[1], p.p[2]);
    o.rotation.set(p.r[0], p.r[1], p.r[2]);
    o.scale.set(Math.max(1e-4, p.s[0]), Math.max(1e-4, p.s[1]), Math.max(1e-4, p.s[2]));
  }

  function rbox(w, h, d, mat, bevel) {
    const r = Math.min(bevel == null ? Math.min(w, h) * 0.22 : bevel, w * 0.45, h * 0.45);
    const x = w / 2, y = h / 2;
    const s = new T.Shape();
    s.moveTo(-x + r, -y);
    s.lineTo(x - r, -y);
    s.absarc(x - r, -y + r, r, -Math.PI / 2, 0, false);
    s.lineTo(x, y - r);
    s.absarc(x - r, y - r, r, 0, Math.PI / 2, false);
    s.lineTo(-x + r, y);
    s.absarc(-x + r, y - r, r, Math.PI / 2, Math.PI, false);
    s.lineTo(-x, -y + r);
    s.absarc(-x + r, -y + r, r, Math.PI, Math.PI * 1.5, false);
    const geo = new T.ExtrudeGeometry(s, {
      depth: Math.max(0.02, d - r), bevelEnabled: true,
      bevelThickness: r * 0.55, bevelSize: r * 0.42, bevelSegments: 2, curveSegments: 8
    });
    geo.translate(0, 0, -d / 2);
    geo.computeVertexNormals();
    return new T.Mesh(geo, mat);
  }
  function cap(rad, len, mat) {
    const m = new T.Mesh(new T.CapsuleGeometry(rad, Math.max(0.02, len), 5, 12), mat);
    return m;
  }
  function sph(r, mat, a, b) { return new T.Mesh(new T.SphereGeometry(r, a || 22, b || 16), mat); }

  function phys(color, o) {
    o = o || {};
    return new T.MeshPhysicalMaterial({
      color, metalness: o.metal == null ? 0.4 : o.metal, roughness: o.rough == null ? 0.26 : o.rough,
      clearcoat: o.coat == null ? 0.9 : o.coat, clearcoatRoughness: o.coatR == null ? 0.07 : o.coatR,
      envMapIntensity: o.env == null ? 1.15 : o.env
    });
  }
  function metalMat(c, rough) {
    return new T.MeshStandardMaterial({ color: c, metalness: 0.94, roughness: rough == null ? 0.18 : rough });
  }
  function glow(c, n) {
    return new T.MeshStandardMaterial({ color: '#101014', emissive: new T.Color(c), emissiveIntensity: n || 2.4, roughness: 0.35, metalness: 0.05 });
  }

  function wheel(M, rad) {
    const g = new T.Group();
    const spin = new T.Group();
    g.add(spin);
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const t = (i / 14) * Math.PI;
      pts.push(new T.Vector2(rad * 0.98 + Math.sin(t) * rad * 0.045, Math.cos(t) * rad * 0.2));
    }
    const tire = new T.Mesh(new T.LatheGeometry(pts, 28), M.rubber);
    tire.rotation.z = Math.PI / 2;
    spin.add(tire);
    const dish = new T.Mesh(new T.CylinderGeometry(rad * 0.7, rad * 0.62, rad * 0.16, 28), M.rim);
    dish.rotation.z = Math.PI / 2;
    spin.add(dish);
    const lip = new T.Mesh(new T.TorusGeometry(rad * 0.78, rad * 0.028, 8, 32), M.rimBright);
    lip.rotation.y = Math.PI / 2;
    lip.position.x = rad * 0.1;
    spin.add(lip);
    const n = 7;
    for (let k = 0; k < n; k++) {
      const sp = rbox(rad * 0.07, rad * 1.05, rad * 0.035, M.rimBright, rad * 0.012);
      sp.rotation.x = (k / n) * TAU;
      spin.add(sp);
    }
    const hub = new T.Mesh(new T.CylinderGeometry(rad * 0.14, rad * 0.16, rad * 0.2, 16), M.rimBright);
    hub.rotation.z = Math.PI / 2;
    spin.add(hub);
    const capM = new T.Mesh(new T.CylinderGeometry(rad * 0.08, rad * 0.08, rad * 0.22, 12), M.glow);
    capM.rotation.z = Math.PI / 2;
    spin.add(capM);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU;
      const bolt = new T.Mesh(new T.CylinderGeometry(rad * 0.028, rad * 0.028, rad * 0.24, 6), M.rim);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(rad * 0.08, Math.cos(a) * rad * 0.26, Math.sin(a) * rad * 0.26);
      spin.add(bolt);
    }
    g.userData.spin = spin;
    return g;
  }

  function chevron(mat) {
    const g = new T.Group();
    const L = rbox(0.38, 0.075, 0.045, mat, 0.02);
    L.rotation.z = 0.72; L.position.set(-0.1, 0.01, 0.05);
    const R = rbox(0.38, 0.075, 0.045, mat, 0.02);
    R.rotation.z = -0.72; R.position.set(0.1, 0.01, 0.05);
    g.add(L, R);
    return g;
  }

  function lamp(w, h, mat, glowMap) {
    const g = new T.Group();
    const m = rbox(w, h, 0.045, mat, Math.min(h, w) * 0.25);
    g.add(m);
    const sp = new T.Sprite(new T.SpriteMaterial({
      map: glowMap, color: mat.emissive || '#fff', transparent: true,
      blending: T.AdditiveBlending, depthWrite: false, opacity: 0.9
    }));
    sp.scale.set(w * 1.8, Math.max(0.28, h * 5), 1);
    sp.position.z = 0.04;
    sp.userData.lamp = 1;
    g.add(sp);
    return g;
  }

  function shellOf(M, theme, hyLoft, glowMap) {
    const g = new T.Group();
    const L = 1.72, WZ = [1.05, -1.05], WR = 0.32;
    const hySm = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
    const shellMat = theme.id === 'crimson' ? M.accent : M.body;
    const bellyMat = theme.id === 'crimson' ? M.body : M.dark;
    const body = new T.Mesh(hyLoft(s => {
      const z = -L + s * 2 * L;
      const e = s < 0.05 ? Math.max(0.66, Math.sqrt(1 - Math.pow(1 - s / 0.05, 2))) : s > 0.955 ? Math.sqrt(Math.max(0, 1 - Math.pow((s - 0.955) / 0.045, 2))) : 1;
      let w = 0.76 + 0.1 * Math.max(...WZ.map(q => Math.exp(-Math.pow((z - q) / 0.38, 2)))) - 0.18 * hySm(1.05, L, z);
      let yt = 0.4 + 0.2 * hySm(L, 0.25, z), yb = 0.18;
      WZ.forEach(q => { const d = Math.abs(z - q); if (d < WR + 0.06) yb = Math.max(yb, 0.26 + Math.sqrt(Math.max(0, Math.pow(WR + 0.06, 2) - d * d)) * 0.75); });
      const ym = Math.min(yt - 0.04, Math.max(yb + 0.04, 0.36));
      return { z, w: w * Math.max(0.25, e), yt: ym + (yt - ym) * Math.max(0.4, e), yb: ym - (ym - yb) * Math.max(0.4, e), ym };
    }, 56, 32, theme.round ? 2.3 : 3.6), shellMat);
    g.add(body);
    const belly = rbox(1.42, 0.16, 2.7, bellyMat, 0.03);
    belly.position.set(0, 0.2, -0.05);
    g.add(belly);
    const can = new T.Mesh(hyLoft(s => {
      const z = -1.05 + s * 1.55, e = Math.sin(Math.min(1, s) * Math.PI);
      const yt = 0.58 + (theme.round ? 0.4 : 0.28) * Math.pow(Math.sin(Math.pow(s, 1.25) * Math.PI), 0.8);
      return { z, w: (theme.round ? 0.58 : 0.5) * Math.pow(Math.max(0.05, e), 0.42) + 0.02, yt, yb: 0.5, ym: 0.56 };
    }, 32, 24, theme.round ? 2.1 : 2.6), M.glass);
    g.add(can);
    const hood = rbox(0.78, 0.1, 1.55, M.accent, 0.04);
    hood.position.set(0, 0.62, 0.38);
    hood.rotation.x = -0.18;
    g.add(hood);
    const pin = rbox(0.08, 0.025, 1.35, M.rimBright, 0.008);
    pin.position.set(0, 0.7, 0.5);
    pin.rotation.x = -0.52;
    g.add(pin);
    [-1, 1].forEach(sd => {
      const blade = rbox(0.2, 0.16, 1.05, theme.id === 'crimson' ? M.body : M.accent, 0.035);
      blade.position.set(sd * 0.7, 0.4, -0.05);
      blade.rotation.z = sd * -0.35;
      g.add(blade);
      const hl = lamp(0.5, 0.09, M.lamp, glowMap);
      hl.position.set(sd * 0.36, 0.42, 1.78);
      hl.rotation.set(-0.45, sd * 0.42, sd * -0.12);
      g.add(hl);
      const mir = rbox(0.2, 0.045, 0.1, M.accent, 0.015);
      mir.position.set(sd * 0.62, 0.72, 0.35);
      mir.rotation.z = sd * 0.4;
      g.add(mir);
    });
    const tail = lamp(1.35, 0.08, M.tail, glowMap);
    tail.position.set(0, 0.44, -1.72);
    g.add(tail);
    const split = rbox(1.2, 0.045, 0.22, M.dark, 0.012);
    split.position.set(0, 0.16, 1.62);
    g.add(split);
    const lipS = rbox(1.15, 0.02, 0.04, M.rimBright, 0.006);
    lipS.position.set(0, 0.2, 1.72);
    g.add(lipS);
    const mark = new T.Mesh(new T.OctahedronGeometry(0.045), M.lamp);
    mark.scale.set(1, 1.3, 0.45);
    mark.position.set(0, 0.5, 1.58);
    mark.rotation.x = -0.6;
    g.add(mark);
    g.traverse(o => {
      if (o.isMesh && o.material) {
        const base = o.material.opacity > 0.05 && o.material.opacity < 0.98 ? o.material.opacity : 1;
        o.material = o.material.clone();
        o.material.userData.baseOp = base;
        o.material.transparent = true;
        o.material.opacity = 0;
        o.material.depthWrite = false;
      }
      if (o.isSprite) o.userData.lamp = 1;
    });
    return g;
  }

  function build(theme, api) {
    const hyLoft = api.hyLoft;
    const glowMap = api.glowTex();
    const M = {
      armor: phys(theme.armorC, { metal: theme.round ? 0.18 : 0.42, rough: theme.round ? 0.32 : 0.24, coat: theme.round ? 0.65 : 1, coatR: 0.08 }),
      body: phys(theme.bodyC, { metal: theme.id === 'crimson' ? 0.62 : 0.35, rough: 0.22, coat: 1, coatR: 0.05, env: 1.25 }),
      accent: phys(theme.armorC, { metal: 0.22, rough: 0.2, coat: 1, coatR: 0.05, env: 1.1 }),
      dark: new T.MeshStandardMaterial({ color: theme.darkC, metalness: 0.55, roughness: 0.38 }),
      rim: metalMat(theme.silverC, 0.22),
      rimBright: metalMat(theme.id === 'crimson' ? '#eef2f6' : theme.silverC, 0.12),
      rubber: new T.MeshStandardMaterial({ color: '#141418', metalness: 0.08, roughness: 0.86 }),
      glow: glow(theme.glowC, 2.2),
      lamp: glow('#f4fbff', 3.2),
      tail: glow(theme.id === 'cozy' ? '#ff8aa8' : '#ff2d3a', 2.8),
      glass: new T.MeshPhysicalMaterial({
        color: theme.glassC, metalness: 0.05, roughness: 0.04, transparent: true, opacity: 0.48,
        clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.5
      })
    };
    if (theme.cau) {
      M.body.onBeforeCompile = sh => {
        sh.uniforms.uT = { value: 0 };
        M.body.userData.uT = sh.uniforms.uT;
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform float uT;')
          .replace('#include <output_fragment>', `{float cau=sin(normal.x*16.+uT*2.)*sin(normal.z*13.-uT*1.5);outgoingLight+=vec3(.4,.95,.95)*cau*cau*.22;}
#include <output_fragment>`);
      };
      M.body.customProgramCacheKey = () => 'lakecoat';
    }

    const root = new T.Group();
    const bones = [];
    function bone(parent) { const g = new T.Group(); parent.add(g); bones.push(g); return g; }
    function hang(rad, len, mat, y) {
      const m = cap(rad, len, mat);
      m.position.y = y == null ? -(len * 0.5 + rad) : y;
      return m;
    }

    const pelvis = bone(root);
    pelvis.add(cap(0.16, 0.12, M.dark));
    const belt = new T.Mesh(new T.TorusGeometry(0.2, 0.028, 8, 24), M.rim);
    belt.rotation.x = Math.PI / 2;
    pelvis.add(belt);
    pelvis.userData.kf = {
      bot: P(0, 1.05, 0),
      mid: P(0, 0.68, 0.2, 0.7),
      car: P(0, 0.38, 0.05, 1.15, 0, 0, 0.08, 0.08, 0.08)
    };

    const torso = bone(pelvis);
    const tCore = cap(0.2, 0.26, M.dark);
    torso.add(tCore);
    const tPlate = rbox(0.52, 0.5, 0.18, M.armor, 0.07);
    tPlate.position.set(0, 0.02, 0.1);
    torso.add(tPlate);
    torso.userData.kf = {
      bot: P(0, 0.34, 0),
      mid: P(0, 0.28, 0.12, 0.85),
      car: P(0, 0.16, 0.08, 1.2)
    };

    const chest = bone(torso);
    const cPlate = rbox(0.48, 0.4, 0.1, M.armor, 0.05);
    chest.add(cPlate);
    const chev = chevron(M.rimBright);
    chev.scale.set(1.35, 1.45, 1);
    chest.add(chev);
    const core = new T.Mesh(new T.OctahedronGeometry(0.055), M.glow);
    core.position.set(0, -0.02, 0.08);
    chest.add(core);
    chest.userData.kf = {
      bot: P(0, 0.04, 0.22),
      mid: P(0, 0.02, 0.28, -0.95),
      car: P(0, -0.02, 0.32, -1.35)
    };

    const head = bone(torso);
    const helm = sph(0.2, M.armor, 28, 20);
    helm.scale.set(1.05, 0.96, 1.08);
    head.add(helm);
    const face = sph(0.11, M.rim, 18, 14);
    face.scale.set(1.05, 0.82, 0.5);
    face.position.set(0, -0.02, 0.13);
    head.add(face);
    const vis = new T.Mesh(new T.SphereGeometry(0.085, 16, 12), M.glass.clone());
    vis.scale.set(1.35, 0.42, 0.32);
    vis.position.set(0, 0.03, 0.16);
    head.add(vis);
    const slit = rbox(0.16, 0.035, 0.02, M.glow, 0.01);
    slit.position.set(0, 0.03, 0.2);
    head.add(slit);
    [-1, 1].forEach(sd => {
      const horn = new T.Mesh(new T.ConeGeometry(0.05, 0.36, 5), M.dark);
      horn.position.set(sd * 0.07, 0.28, -0.02);
      horn.rotation.z = sd * -0.28;
      head.add(horn);
      const ear = rbox(0.06, 0.12, 0.14, M.rim, 0.02);
      ear.position.set(sd * 0.2, 0.02, 0);
      head.add(ear);
    });
    const crest = rbox(0.05, 0.16, 0.2, M.armor, 0.015);
    crest.position.set(0, 0.3, -0.02);
    head.add(crest);
    if (theme.face) {
      [-1, 1].forEach(sd => {
        const e = sph(0.028, new T.MeshStandardMaterial({ color: '#2a2430', roughness: 0.4 }), 10, 8);
        e.position.set(sd * 0.06, 0.02, 0.2);
        head.add(e);
      });
      const smile = new T.Mesh(new T.TorusGeometry(0.045, 0.01, 6, 10, Math.PI), M.dark);
      smile.rotation.z = Math.PI;
      smile.position.set(0, -0.05, 0.2);
      head.add(smile);
    }
    head.userData.kf = {
      bot: P(0, 0.46, 0.02),
      mid: P(0, 0.38, 0.1, 0.9),
      car: P(0, 0.22, 0.12, 1.25, 0, 0, 0.2, 0.2, 0.2)
    };

    const sockets = {};
    const limbs = { thighL: null, thighR: null, shinL: null, shinR: null, armL: null, armR: null };
    [-1, 1].forEach(s => {
      const side = s < 0 ? 'L' : 'R';
      const sh = bone(torso);
      const paul = sph(0.2, M.armor, 22, 16);
      paul.scale.set(1.2, 0.58, 1.02);
      sh.add(paul);
      const pr = new T.Mesh(new T.TorusGeometry(0.16, 0.022, 8, 20), M.rim);
      pr.rotation.y = Math.PI / 2;
      pr.position.x = s * 0.06;
      sh.add(pr);
      const sockF = new T.Group();
      sockF.position.set(s * 0.2, 0.02, 0);
      sh.add(sockF);
      sockets[s < 0 ? 'FL' : 'FR'] = sockF;
      sh.userData.kf = {
        bot: P(s * 0.4, 0.16, 0),
        mid: P(s * 0.32, 0.1, 0.1, 0.85, 0, s * 0.4),
        car: P(s * 0.2, 0.02, 0.12, 1.5, 0, s * 0.9)
      };

      const arm = bone(sh);
      arm.add(hang(0.075, 0.22, M.dark));
      const aPad = rbox(0.14, 0.26, 0.12, M.armor, 0.04);
      aPad.position.set(s * 0.02, -0.16, 0.05);
      arm.add(aPad);
      const elbow = sph(0.07, M.rim, 12, 10);
      elbow.position.y = -0.3;
      arm.add(elbow);
      limbs['arm' + side] = arm;
      arm.userData.kf = {
        bot: P(0, -0.22, 0.02, 0.15),
        mid: P(0, -0.2, 0.02, 1.2, s * 0.15, s * 0.45),
        car: P(0, -0.16, 0, 2.15, 0, s * 0.5)
      };

      const fore = bone(arm);
      fore.add(hang(0.065, 0.2, M.rim));
      const fPad = rbox(0.12, 0.22, 0.1, M.armor, 0.03);
      fPad.position.set(0, -0.14, 0.04);
      fore.add(fPad);
      fore.userData.kf = {
        bot: P(0, -0.36, 0),
        mid: P(0, -0.34, 0, -1.2),
        car: P(0, -0.3, 0, -2.25)
      };

      const hand = bone(fore);
      hand.add(rbox(0.12, 0.12, 0.1, M.dark, 0.04));
      hand.userData.kf = {
        bot: P(0, -0.28, 0.02),
        mid: P(0, -0.26, 0.02, -0.4),
        car: P(0, -0.2, 0, 0, 0, 0, 0.2, 0.2, 0.2)
      };

      const thigh = bone(pelvis);
      thigh.add(hang(0.09, 0.28, M.dark));
      const tPad = rbox(0.16, 0.3, 0.12, M.armor, 0.04);
      tPad.position.set(s * 0.04, -0.18, 0.06);
      thigh.add(tPad);
      const knee = sph(0.075, M.rim, 12, 10);
      knee.position.y = -0.36;
      thigh.add(knee);
      limbs['thigh' + side] = thigh;
      thigh.userData.kf = {
        bot: P(s * 0.14, -0.06, 0.02),
        mid: P(s * 0.14, -0.04, 0.08, 1.2),
        car: P(s * 0.1, -0.02, 0.1, 1.65)
      };

      const shin = bone(thigh);
      shin.add(hang(0.075, 0.26, M.armor));
      const guard = rbox(0.14, 0.16, 0.05, M.rim, 0.02);
      guard.position.set(0, -0.12, 0.08);
      shin.add(guard);
      const sockR = new T.Group();
      sockR.position.set(s * 0.16, -0.14, 0.02);
      shin.add(sockR);
      sockets[s < 0 ? 'RL' : 'RR'] = sockR;
      limbs['shin' + side] = shin;
      shin.userData.kf = {
        bot: P(0, -0.46, 0),
        mid: P(0, -0.44, 0.02, -1.4),
        car: P(0, -0.4, 0, -2.45)
      };

      const foot = bone(shin);
      const sole = rbox(0.2, 0.07, 0.36, M.rim, 0.02);
      sole.position.set(0, -0.04, 0.06);
      const top = rbox(0.16, 0.08, 0.26, M.armor, 0.025);
      top.position.set(0, 0.03, 0.04);
      foot.add(sole, top);
      foot.userData.kf = {
        bot: P(0, -0.34, 0.04),
        mid: P(0, -0.32, 0.08, 0.45),
        car: P(0, -0.28, 0.06, 0.7)
      };
    });

    const wing = bone(root);
    if (theme.fin) {
      const fin = new T.Mesh(new T.ConeGeometry(0.26, 0.85, 4), M.accent);
      fin.rotation.y = Math.PI / 4;
      wing.add(fin);
      const edge = new T.Mesh(new T.ConeGeometry(0.1, 0.7, 4), M.glow);
      edge.rotation.y = Math.PI / 4;
      wing.add(edge);
      wing.userData.kf = {
        bot: P(0, 1.85, -0.16, 0, 0, 0, 0.8, 1, 0.8),
        mid: P(0, 1.15, -0.35, 0.7),
        car: P(0, 0.78, -1.5, 1.15, 0, 0, 1.15, 0.9, 1.15)
      };
    } else {
      const plate = rbox(1.4, 0.055, 0.34, M.accent, 0.02);
      wing.add(plate);
      const lip = rbox(1.42, 0.025, 0.03, M.glow, 0.008);
      lip.position.set(0, 0.03, -0.16);
      wing.add(lip);
      [-1, 1].forEach(sd => {
        const ep = rbox(0.05, 0.16, 0.34, M.dark, 0.012);
        ep.position.set(sd * 0.68, -0.04, 0);
        wing.add(ep);
      });
      wing.userData.kf = {
        bot: P(0, 1.52, -0.36, -0.5, 0, 0, 0.55, 0.8, 0.7),
        mid: P(0, 1.15, -0.55, -0.1, 0, 0, 0.85, 0.9, 0.85),
        car: P(0, 0.78, -1.42, 0.16, 0, 0, 1.05, 1, 1)
      };
    }

    const shell = shellOf(M, theme, hyLoft, glowMap);
    root.add(shell);

    const wheels = ['FL', 'FR', 'RL', 'RR'].map(id => {
      const mesh = wheel(M, 0.3);
      root.add(mesh);
      const slot = new T.Vector3(id[1] === 'L' ? -0.9 : 0.9, 0.32, id[0] === 'F' ? 1.08 : -1.06);
      return { id, mesh, sock: sockets[id], slot };
    });

    const ring = new T.Mesh(new T.TorusGeometry(0.95, 0.018, 8, 48), new T.MeshBasicMaterial({
      color: theme.glowC, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false
    }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.05;
    ring.renderOrder = 2;
    root.add(ring);
    const ring2 = ring.clone();
    ring2.material = ring.material.clone();
    ring2.scale.setScalar(1.35);
    root.add(ring2);

    const ug = new T.Mesh(new T.PlaneGeometry(2.4, 3.8), new T.MeshBasicMaterial({
      map: glowMap, color: theme.glowC, transparent: true, opacity: 0, blending: T.AdditiveBlending, depthWrite: false
    }));
    ug.rotation.x = -Math.PI / 2;
    ug.position.y = 0.04;
    ug.renderOrder = 2;
    root.add(ug);

    let halo = null;
    if (theme.halo) {
      halo = new T.Mesh(new T.TorusGeometry(0.42, 0.03, 8, 40), glow(theme.glow2C, 2.4));
      halo.rotation.x = Math.PI / 2;
      root.add(halo);
    }
    const wings = [];
    if (theme.energy) {
      const em = new T.MeshBasicMaterial({ color: theme.glowC, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide });
      [-1, 1].forEach(sd => {
        const pl = new T.Mesh(new T.PlaneGeometry(0.9, 0.55), em);
        const g = new T.Group();
        pl.position.x = sd * 0.4;
        g.add(pl);
        root.add(g);
        wings.push(g);
      });
    }

    root.userData = { bones, wheels, shell, wing, ring, ring2, ug, halo, wings, limbs, mats: M, core };
    return root;
  }

  const qA = new T.Quaternion(), qB = new T.Quaternion(), qP = new T.Quaternion();
  const vA = new T.Vector3(), vB = new T.Vector3();

  function tick(root, morph, dt, time, moving, queue) {
    const U = root.userData;
    U.bones.forEach(b => applyKF(b, morph));
    const jog = moving && morph < 0.12 && !(queue && queue.length);
    if (jog && U.limbs.thighL) {
      const s = Math.sin(time * 8);
      U.limbs.thighL.rotation.x += s * 0.55;
      U.limbs.thighR.rotation.x -= s * 0.55;
      U.limbs.shinL.rotation.x += Math.max(0, -s) * 0.65;
      U.limbs.shinR.rotation.x += Math.max(0, s) * 0.65;
      U.limbs.armL.rotation.x -= s * 0.35;
      U.limbs.armR.rotation.x += s * 0.35;
    }
    const dk = ease(clamp01((morph - 0.18) / 0.72));
    root.updateWorldMatrix(true, true);
    U.wheels.forEach(w => {
      w.sock.getWorldPosition(vA);
      vB.copy(w.slot);
      root.localToWorld(vB);
      vA.lerp(vB, dk);
      w.mesh.parent.worldToLocal(vA);
      w.mesh.position.copy(vA);
      w.sock.getWorldQuaternion(qA);
      root.getWorldQuaternion(qB);
      qA.slerp(qB, dk);
      w.mesh.parent.getWorldQuaternion(qP);
      w.mesh.quaternion.copy(qP.invert()).multiply(qA);
      const ws = lerp(0.78, 1.08, dk);
      w.mesh.scale.setScalar(ws);
      const spin = (moving ? (morph > 0.55 ? 12 : 7) : 0.4) * dt;
      w.mesh.userData.spin.rotation.x -= spin;
    });
    const sk = ease(clamp01((morph - 0.25) / 0.6));
    U.shell.visible = sk > 0.02;
    U.shell.traverse(o => {
      if (o.isMesh && o.material && o.material.userData.baseOp != null) {
        const op = o.material.userData.baseOp * sk;
        o.material.opacity = op;
        o.material.transparent = true;
        o.material.depthWrite = op > 0.9;
      }
      if (o.isSprite) o.material.opacity = 0.85 * sk;
    });
    U.ring.material.opacity = 0.28 + Math.sin(time * 2.2) * 0.08 + (1 - morph) * 0.15;
    U.ring.rotation.z = time * 0.35;
    U.ring2.material.opacity = 0.12 + (1 - morph) * 0.08;
    U.ring2.rotation.z = -time * 0.22;
    U.ug.material.opacity = (0.35 + morph * 0.4) * (0.55 + Math.sin(time * 2.4) * 0.15);
    if (U.mats.body.userData.uT) U.mats.body.userData.uT.value = time;
    U.mats.glow.emissiveIntensity = 1.6 + Math.sin(time * 3) * 0.5;
    if (U.halo) {
      U.halo.position.set(0, lerp(2.35, 1.05, morph), lerp(0, -0.15, morph));
      U.halo.rotation.z = time * 0.6;
      U.halo.scale.setScalar(lerp(1, 1.65, morph));
    }
    U.wings.forEach((g, i) => {
      const sd = i === 0 ? -1 : 1;
      const open = 1 - morph;
      g.position.set(sd * 0.2, lerp(1.6, 0.95, morph), lerp(-0.3, -1.4, morph));
      g.rotation.set(lerp(-0.2, 0.25, morph), 0, sd * lerp(0.8, 0.05, morph));
      g.scale.setScalar(Math.max(0.04, open));
    });
    const bob = (1 - morph) * Math.sin(time * 2) * 0.02 + (morph > 0.8 && moving ? Math.abs(Math.sin(time * 14)) * 0.025 : 0);
    return bob;
  }

  window.TXRig = { build, tick };
})();
