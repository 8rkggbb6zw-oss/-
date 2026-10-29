// Everdawn, part 5 of 5 (see the note at the top of script.js). More for you, the player, carrying on from script7.js
// (which was nearly full): it joins on after the other parts, so it shares all their variables

EVERDAWN_PARTS.push(function (THREE) {
  // ---- Victorian Vengeance's bejewelled blood: blood poured round where its skirt meets the corset and dripping down
  // the skirt, every bit of it encrusted with little ruby rhinestones of all sizes, packed close and sparkling ----
  var rubyEnv = (function () {                                         // (something for the rubies to reflect: mostly dark, a soft window of light above, and small bright lights to sparkle in)
    var faces = [];
    for (var f = 0; f < 6; f++) {
      var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 64);
      gr.addColorStop(0, f === 3 ? '#050203' : '#2a2224'); gr.addColorStop(0.5, '#0c0809'); gr.addColorStop(1, f === 2 ? '#3a3234' : '#040203'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
      if (f === 2) { g.fillStyle = 'rgba(255,248,240,0.9)'; g.fillRect(18, 18, 28, 28); }   // (a soft light overhead)
      for (var k = 0; k < 6; k++) { var x = (f * 23 + k * 17) % 56 + 4, y = (f * 13 + k * 11) % 40 + 4, r = 1 + (k % 3) * 0.8, rg = g.createRadialGradient(x, y, 0, x, y, r * 3);
        rg.addColorStop(0, '#fff'); rg.addColorStop(0.35, 'rgba(255,255,255,0.7)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); }
      faces.push(c);
    }
    var t = new THREE.CubeTexture(faces); t.needsUpdate = true; return t;
  })();
  function bloodRubies(file, part) {
    return function () {
      var grp = new THREE.Group(), sk = null, cz = 0, N = 96, pts = [], c = [];
      var CL = 0.0071;                                                 // (how far apart the points round her are, in metres, near enough)
      function band(x) { return 0.016 + 0.003 * Math.sin(x * 0.7) + 0.002 * Math.sin(x * 1.9); }   // (the blood poured round: a little uneven)
      // (the drips: where round her each runs from, the round drop at its end (its radius), and how far down it runs)
      var DR = [[3, 0.0078, 0.070], [9.5, 0.0059, 0.044], [14, 0.0089, 0.092], [20.5, 0.0065, 0.053], [26, 0.0081, 0.080], [32.5, 0.0056, 0.039], [38, 0.0085, 0.072], [44.5, 0.0067, 0.058],
        [50, 0.0089, 0.094], [56.5, 0.0059, 0.046], [62, 0.0083, 0.077], [68.5, 0.0063, 0.056], [74, 0.0087, 0.087], [80.5, 0.0056, 0.041], [86, 0.0081, 0.070], [92, 0.0065, 0.051]];
      function half(r, d) {                                            // (how wide a drip is, d down from the corset: a neck that swells into a round drop at its end, and curves out where it leaves the band)
        var rb = r[1], L = r[2], c0 = L - rb, b = band(r[0]);
        if (d > c0) return Math.sqrt(Math.max(0, rb * rb - (d - c0) * (d - c0)));
        var neck = rb * (0.56 + 0.3 * Math.pow(d / L, 2)); if (d < b + 0.01) neck += Math.pow((b + 0.01 - d) / 0.01, 2) * 0.006; return neck;
      }
      function inside(x, d) { if (d <= band(x)) return true; for (var k = 0; k < DR.length; k++) { var dx = Math.abs(((x - DR[k][0] + N * 1.5) % N) - N / 2) * CL; if (d <= DR[k][2] && dx <= half(DR[k], d)) return true; } return false; }
      // (the blood under the stones, deep red, so no black shows between them: the band all round, and each drip)
      var BX = [], BD = [], idx = [], CO = N * 2, RO = 6;
      for (var i = 0; i <= CO; i++) for (var r = 0; r <= RO; r++) { var x = i / CO * N; BX.push(x); BD.push(band(x) * r / RO + 0.002); }
      for (var i = 0; i < CO; i++) for (var r = 0; r < RO; r++) { var a = i * (RO + 1) + r, b = a + RO + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
      DR.forEach(function (r) {
        var M = 16, K = 5, o0 = BX.length;
        for (var m = 0; m <= M; m++) { var d = r[2] * m / M, h = half(r, d) * 1.08 / CL; for (var k = 0; k < K; k++) { BX.push(r[0] + (k / (K - 1) * 2 - 1) * h); BD.push(d); } }
        for (var m = 0; m < M; m++) for (var k = 0; k < K - 1; k++) { var a = o0 + m * K + k, b = a + K; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      });
      var bpos = new Float32Array(BX.length * 3), bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(bpos, 3)); bg.setIndex(idx);
      var base = new THREE.Mesh(bg, new THREE.MeshPhysicalMaterial({ color: 0x5a0000, roughness: 0.12, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, envMap: rubyEnv, envMapIntensity: 1.5, emissive: 0x220000, side: THREE.DoubleSide, flatShading: true }));   // (glossy, like it's still wet)
      base.frustumCulled = false; grp.add(base);
      // (the stones: a cut rhinestone, flat table on top, facets round, pointed behind; hundreds of them, each its own size, turn and shade of red)
      var cut = new THREE.LatheGeometry([new THREE.Vector2(0, -0.78), new THREE.Vector2(0.5, -0.42), new THREE.Vector2(1, 0), new THREE.Vector2(1, 0.07), new THREE.Vector2(0.82, 0.24), new THREE.Vector2(0.56, 0.38), new THREE.Vector2(0, 0.41)], 12);   // (a brilliant cut: pavilion, girdle, crown and star facets, table)
      cut.rotateX(Math.PI / 2);                                        // (its table facing out)
      var stones = [], rnd = 7;
      function rand() { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647; }
      for (var x = 0; x < N; x += 0.36) for (var d = 0.0024; d < 0.1; d += 0.0027 + rand() * 0.0007) {   // (packed close over all the blood)
        var xx = x + (rand() - 0.5) * 0.2; if (!inside(xx, d)) continue;
        var sz = 0.0013 + rand() * 0.0013; if (rand() < 0.05) sz *= 1.6;   // (now and then a bigger feature stone)
        while (sz > 0.0006 && !(inside(xx + sz / CL, d) && inside(xx - sz / CL, d) && inside(xx, d + sz) && inside(xx, Math.max(0.001, d - sz)))) sz *= 0.8;   // (smaller at the edges, so none hang off)
        stones.push({ x: xx, d: d, s: sz, spin: rand() * Math.PI * 2, tip: (rand() - 0.5) * 0.5 });
      }
      var ruby = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0x120000, roughness: 0, metalness: 0.78, clearcoat: 1, clearcoatRoughness: 0, envMap: rubyEnv, envMapIntensity: 4, flatShading: true });   // (like a cut gem: each facet dark or flashing with light, rather than glowing all over)
      var gems = new THREE.InstancedMesh(cut, ruby, stones.length); gems.frustumCulled = false; gems.castShadow = true;
      var col = new THREE.Color();
      stones.forEach(function (st, k) { col.setHSL(rand() * 0.008, 1, 0.2 + rand() * 0.12); gems.setColorAt(k, col); });   // (each a slightly different red)
      var none = new THREE.Matrix4().makeScale(0, 0, 0); for (var k = 0; k < stones.length; k++) gems.setMatrixAt(k, none);   // (hidden until they've found their places)
      grp.add(gems);
      var star = document.createElement('canvas'); star.width = star.height = 64; var sg = star.getContext('2d');   // (now and then a stone twinkles: a little four-pointed star of light)
      [[64, 3], [64, 3], [26, 2], [26, 2]].forEach(function (a, n) { sg.save(); sg.translate(32, 32); sg.rotate(n * Math.PI / 2 + (n > 1 ? Math.PI / 4 : 0)); var g = sg.createLinearGradient(0, 0, a[0] / 2, 0); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); sg.fillStyle = g; sg.beginPath(); sg.moveTo(0, -a[1]); sg.lineTo(a[0] / 2, 0); sg.lineTo(0, a[1]); sg.fill(); sg.restore(); });
      var rg = sg.createRadialGradient(32, 32, 0, 32, 32, 9); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); sg.fillStyle = rg; sg.fillRect(0, 0, 64, 64);
      var tw = stones.filter(function (st, k) { return k % 23 === 5; }).map(function (st) { return { st: st, ph: rand() * 6.3, rate: 1.5 + rand() * 2.5 }; });
      var twinkle = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(star), color: 0xfff0f0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), tw.length);
      twinkle.frustumCulled = false; for (var k = 0; k < tw.length; k++) twinkle.setMatrixAt(k, none); grp.add(twinkle);
      // (at the end of each drip, a teardrop ruby: a pear cut, round below and pointed up into the drip, with a flat table ringed by
      // star facets, upper and lower girdle facets round its edge, and a deep pavilion of facets behind, coming to a keel)
      var pear = (function () {
        var M = 48, rings = [[0.36, 0.44, 0], [0.52, 0.41, 0.5], [0.67, 0.35, 0], [0.81, 0.27, 0.5], [0.92, 0.17, 0], [0.99, 0.07, 0.5], [1, -0.01, 0], [0.93, -0.12, 0.5], [0.8, -0.26, 0], [0.62, -0.41, 0.5], [0.42, -0.55, 0], [0.22, -0.67, 0.5], [0.06, -0.76, 0]], pos = [];
        function at(t, sc, z) { var x = Math.sin(t) * Math.pow(Math.sin(t / 2), 1.3) * 0.78, y = Math.cos(t) * 0.92 - 0.12 * Math.sin(t / 2); return [x * sc, (y + 0.1) * sc, z]; }   // (the teardrop: its point at the top)
        var R = rings.map(function (r) { var ring = []; for (var m = 0; m < M; m++) ring.push(at((m + r[2]) / M * Math.PI * 2, r[0], r[1])); return ring; });
        var top = [0, 0.04, 0.445];
        for (var m = 0; m < M; m++) pos.push(top, R[0][m], R[0][(m + 1) % M]);   // (the table)
        for (var r = 0; r < R.length - 1; r++) for (var m = 0; m < M; m++) { var a = R[r][m], b = R[r][(m + 1) % M], c = R[r + 1][m], d = R[r + 1][(m + 1) % M]; pos.push(a, c, b, b, c, d); }
        var bot = [0, -0.02, -0.8]; for (var m = 0; m < M; m++) pos.push(R[R.length - 1][m], bot, R[R.length - 1][(m + 1) % M]);   // (the keel at the back)
        var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([].concat.apply([], pos), 3)); g.computeVertexNormals(); return g;
      })();
      var drops = new THREE.InstancedMesh(pear, ruby.clone(), DR.length); drops.material.side = THREE.DoubleSide; drops.frustumCulled = false; drops.castShadow = true;
      DR.forEach(function (r, k) { col.setHSL(0.003, 1, 0.27); drops.setColorAt(k, col); drops.setMatrixAt(k, none); }); grp.add(drops);
      var v = new THREE.Vector3(), w = new THREE.Vector3(), o = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3(), dn = new THREE.Vector3(), nrm = new THREE.Vector3();
      var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), qs = new THREE.Quaternion(), sc = new THREE.Vector3(), p3 = new THREE.Vector3(), zA = new THREE.Vector3(0, 0, 1), xA = new THREE.Vector3(1, 0, 0);
      var fr = [];                                                     // (each frame: where each point round her is, and which ways are along, down and out over the skirt there)
      function setup() {
        sk = (outfitModel(file) || []).filter(function (m) { return m.material.name.indexOf(part) >= 0; })[0]; if (!sk) return;
        var P = sk.geometry.attributes.position, I = sk.geometry.index, rep = {}, cnt = {}, zs = [];
        function key(k) { var s = Math.round(P.getX(k) * 2e4) + ',' + Math.round(P.getY(k) * 2e4) + ',' + Math.round(P.getZ(k) * 2e4); if (!(s in rep)) rep[s] = k; return rep[s]; }
        for (var i = 0; i < I.count; i += 3) { var t = [key(I.getX(i)), key(I.getX(i + 1)), key(I.getX(i + 2))]; for (var j = 0; j < 3; j++) { var a = t[j], b = t[(j + 1) % 3], e = a < b ? a + '_' + b : b + '_' + a; cnt[e] = (cnt[e] || 0) + 1; } zs.push(P.getZ(t[0])); }
        cz = (Math.max.apply(null, zs) + Math.min.apply(null, zs)) / 2;
        var nb = {}; Object.keys(cnt).forEach(function (e) { if (cnt[e] !== 1) return; var ab = e.split('_').map(Number); (nb[ab[0]] = nb[ab[0]] || []).push(ab[1]); (nb[ab[1]] = nb[ab[1]] || []).push(ab[0]); });
        var loops = [], done = {};                                      // (its open edges; the lowest, round its bottom, is where the skirt meets it)
        Object.keys(nb).forEach(function (s0) {
          var k0 = +s0; if (done[k0]) return; var loop = [k0], prev = -1, cur = k0; done[k0] = 1;
          for (;;) { var nx = (nb[cur] || []).filter(function (n) { return n !== prev; })[0]; if (nx === undefined || nx === k0 || done[nx]) break; loop.push(nx); done[nx] = 1; prev = cur; cur = nx; }
          if (loop.length > 8) loops.push(loop);
        });
        function meanY(l) { return l.reduce(function (t, k) { return t + P.getY(k); }, 0) / l.length; }
        loops.sort(function (a, b) { return meanY(a) - meanY(b); });
        var l = loops[0]; if (!l) return;
        var len = [0]; for (var i = 1; i <= l.length; i++) len.push(len[i - 1] + new THREE.Vector3().fromBufferAttribute(P, l[i - 1]).distanceTo(new THREE.Vector3().fromBufferAttribute(P, l[i % l.length])));
        pts = []; c = [];
        for (var n = 0, i = 0; n < N; n++) { var dd = n / N * len[l.length]; while (i < l.length - 1 && len[i + 1] < dd) i++; pts.push({ a: l[i], b: l[(i + 1) % l.length], t: (dd - len[i]) / Math.max(1e-9, len[i + 1] - len[i]) }); c.push(new THREE.Vector3()); }
        var skirt = (outfitModel(file) || []).filter(function (m) { return m.material.name.indexOf('CLOTH_02') >= 0; })[0];   // (the skirt round it: how far out its top is, and how steeply it flares, all the way round)
        var S = skirt ? skirt.geometry.attributes.position : null, SI = skirt ? skirt.geometry.index : null;
        function far(a, y0, y1) { var best = -1; if (!S) return best; for (var i = 0; i < SI.count; i++) { var k = SI.getX(i), y = S.getY(k); if (y < y0 || y > y1) continue; var x = S.getX(k), z = S.getZ(k) - cz; if (Math.abs(((Math.atan2(x, z) - a) * 180 / Math.PI + 540) % 360 - 180) < 10) best = Math.max(best, Math.hypot(x, z)); } return best; }
        pts.forEach(function (p) {
          var x = P.getX(p.a), z = P.getZ(p.a) - cz, a = Math.atan2(x, z), rc = Math.hypot(x, z), r0 = far(a, 1.04, 1.07), r1 = far(a, 1.0, 1.04);
          p.out = Math.max(0.012, r0 - rc + 0.006); p.lean = r1 > 0 && r0 > 0 ? Math.atan2(r1 - r0, 0.035) : 0.46;
        });
      }
      function frame(x, t) {                                         // (the point x round her, t down the skirt from the corset's edge)
        x = ((x % N) + N) % N; var i0 = Math.floor(x), i1 = (i0 + 1) % N, f = x - i0, a = fr[i0], b = fr[i1];
        v.copy(a.p).lerp(b.p, f); o.copy(a.o).lerp(b.o, f).normalize(); var lean = a.lean + (b.lean - a.lean) * f, out = a.out + (b.out - a.out) * f;
        side.crossVectors(up, o).normalize(); dn.copy(up).multiplyScalar(-Math.cos(lean)).addScaledVector(o, Math.sin(lean)); nrm.copy(up).multiplyScalar(Math.sin(lean)).addScaledVector(o, Math.cos(lean));
        return v.addScaledVector(o, out).addScaledVector(up, -0.004).addScaledVector(dn, t);
      }
      base.onBeforeRender = function () {
        if (!sk || !pts.length) return;
        pts.forEach(function (p, i) { sk.boneTransform(p.a, c[i]); sk.boneTransform(p.b, w); c[i].lerp(w, p.t); });
        for (var r = 0; r < 2; r++) for (var i = 0; i < N; i++) c[i].lerp(w.copy(c[(i + N - 1) % N]).add(c[(i + 1) % N]).multiplyScalar(0.5), 0.5);
        for (var i = 0; i < N; i++) { var e = fr[i] || (fr[i] = { p: new THREE.Vector3(), o: new THREE.Vector3() }); e.p.copy(c[i]); e.o.set(c[i].x, 0, c[i].z - cz).normalize(); e.lean = pts[i].lean; e.out = pts[i].out; }
        for (var i = 0; i < BX.length; i++) { frame(BX[i], BD[i]); bpos[i * 3] = v.x; bpos[i * 3 + 1] = v.y; bpos[i * 3 + 2] = v.z; }
        bg.attributes.position.needsUpdate = true; bg.computeVertexNormals();
        stones.forEach(function (st, k) {                              // (every stone lying on the blood, facing out from the skirt, turned its own way)
          frame(st.x, st.d); p3.copy(v).addScaledVector(nrm, st.s * 0.35);
          m4.makeBasis(side, w.crossVectors(nrm, side), nrm); q.setFromRotationMatrix(m4).multiply(qs.setFromAxisAngle(zA, st.spin)).multiply(qs.setFromAxisAngle(xA, st.tip));
          m4.compose(p3, q, sc.set(st.s, st.s, st.s)); gems.setMatrixAt(k, m4);
        });
        gems.instanceMatrix.needsUpdate = true;
        var now = performance.now() / 1000;
        tw.forEach(function (t, k) {                                   // (each glint flaring and fading in its own time)
          var st = t.st, g = Math.pow(Math.max(0, Math.sin(now * t.rate + t.ph)), 10); frame(st.x, st.d); p3.copy(v).addScaledVector(nrm, st.s * 0.6);
          m4.makeBasis(side, w.crossVectors(nrm, side), nrm); q.setFromRotationMatrix(m4).multiply(qs.setFromAxisAngle(zA, t.ph)); m4.compose(p3, q, sc.setScalar(st.s * 5 * g + 1e-6)); twinkle.setMatrixAt(k, m4);
        });
        twinkle.instanceMatrix.needsUpdate = true;
        DR.forEach(function (r, k) {                                   // (each teardrop hanging at its drip's end, its point up into it, facing out from the skirt)
          var rb = r[1]; frame(r[0], r[2] - rb * 1.05); p3.copy(v).addScaledVector(nrm, rb * 0.42);
          m4.makeBasis(side, w.crossVectors(nrm, side), nrm); q.setFromRotationMatrix(m4); m4.compose(p3, q, sc.set(rb * 1.25, rb * 1.45, rb * 1.1)); drops.setMatrixAt(k, m4);
        });
        drops.instanceMatrix.needsUpdate = true;
      };
      return [{ dress: true, obj: grp, setup: setup }];
    };
  }
  var vv = CLOTH_STOCK.filter(function (c) { return c.id === 'cloth_victorian_vengeance'; })[0];
  if (vv) { var vvWear = vv.wear; vv.wear = function () { return vvWear().concat(bloodRubies('Victorian Vengeance.vrm', 'CLOTH_01')()); }; }   // (worn, along with its frills: its blood rubies)
});
