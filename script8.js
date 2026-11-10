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
      // (the drips: where round her each runs from, the round drop at its end (its radius), how far down it runs, and how much and how often it
      // wavers from side to side as it runs; spaced unevenly, some long, some short, as poured blood falls)
      var DR = [[2, 0.0082, 0.088, 0.0014, 55], [7.5, 0.006, 0.045, 0.0008, 70], [15, 0.0088, 0.1, 0.0018, 48], [19.5, 0.0058, 0.036, 0.0006, 80], [28, 0.0078, 0.072, 0.0012, 60],
        [35.5, 0.0066, 0.054, 0.001, 66], [41, 0.0086, 0.094, 0.0016, 52], [50, 0.0062, 0.042, 0.0007, 75], [57.5, 0.0084, 0.082, 0.0014, 57], [62.5, 0.0058, 0.034, 0.0006, 84],
        [71, 0.008, 0.076, 0.0013, 62], [79.5, 0.0064, 0.05, 0.0009, 70], [88, 0.0086, 0.09, 0.0016, 50]];
      function sway(r, d) { return r[3] * Math.sin(d * r[4] + r[0]) * Math.min(1, d / 0.025); }   // (a drip wavering a little as it runs)
      function band(x) {                                               // (the blood poured round: a little uneven, and sagging into the top of each drip)
        var b = 0.013 + 0.002 * Math.sin(x * 0.7) + 0.0015 * Math.sin(x * 1.9);
        for (var k = 0; k < DR.length; k++) { var dx = Math.abs(((x - DR[k][0] + N * 1.5) % N) - N / 2); b += 0.006 * Math.exp(-dx * dx / 2.2); }
        return b;
      }
      function half(r, d) {                                            // (how wide a drip is, d down from the corset: pouring out of the band, thinning as it runs, then swelling into the drop at its end)
        var rb = r[1], L = r[2], c0 = L - rb, b = band(r[0]);
        if (d > c0) return Math.sqrt(Math.max(0, rb * rb - (d - c0) * (d - c0)));
        var neck = rb * (0.48 + 0.4 * Math.pow(d / L, 4)); if (d < b + 0.014) neck += Math.pow((b + 0.014 - d) / 0.014, 2) * 0.008; return neck;
      }
      function inside(x, d) { if (d <= band(x)) return true; for (var k = 0; k < DR.length; k++) { var dx = Math.abs(((x - DR[k][0] - sway(DR[k], d) / CL + N * 1.5) % N) - N / 2) * CL; if (d <= DR[k][2] && dx <= half(DR[k], d)) return true; } return false; }
      // (the shape of the design: the band all round and each drip)
      var BX = [], BD = [], BT = [], idx = [], CO = N * 2, RO = 8;            // (BT: how thick the blood stands there: raised and rounded, thinning to its edges)
      for (var i = 0; i <= CO; i++) for (var r = 0; r <= RO; r++) { var x = i / CO * N; BX.push(x); BD.push(band(x) * r / RO + 0.002); BT.push(0.0026 * Math.pow(Math.sin(Math.PI * r / RO), 0.6)); }
      for (var i = 0; i < CO; i++) for (var r = 0; r < RO; r++) { var a = i * (RO + 1) + r, b = a + RO + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
      DR.forEach(function (r) {
        var M = 24, K = 7, o0 = BX.length;
        for (var m = 0; m <= M; m++) { var d = r[2] * m / M, h = half(r, d) * 1.08 / CL; for (var k = 0; k < K; k++) { var u = k / (K - 1) * 2 - 1; BX.push(r[0] + sway(r, d) / CL + u * h); BD.push(d); BT.push(Math.min(0.0034, half(r, d) * 0.55) * Math.pow(Math.max(0, 1 - u * u), 0.6) * (m === M ? 0 : 1)); } }
        for (var m = 0; m < M; m++) for (var k = 0; k < K - 1; k++) { var a = o0 + m * K + k, b = a + K; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      });
      var bpos = new Float32Array(BX.length * 3), bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(bpos, 3)); bg.setIndex(idx);
      var BN = new Float32Array(BX.length * 3), turned = false;                         // (which way the skirt faces under each point, to keep the blood's surface facing out)
      var base = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));   // (unseen: just the shape the stones follow, keeping them in step with the skirt each frame)
      base.frustumCulled = false; grp.add(base);
      // (the stones: a cut rhinestone, flat table on top, facets round, pointed behind; hundreds of them, each its own size, turn and shade of red)
      // (every ruby cut like a real gem: a small flat table ringed by star facets, upper and lower girdle facets round its edge,
      // and a deep pavilion of facets behind; at(t, scale, height) is the shape of its outline)
      function gemCut(M, at, top, bot) {
        var rings = [[0.36, 0.44, 0], [0.52, 0.41, 0.5], [0.67, 0.35, 0], [0.81, 0.27, 0.5], [0.92, 0.17, 0], [0.99, 0.07, 0.5], [1, -0.01, 0], [0.93, -0.12, 0.5], [0.8, -0.26, 0], [0.62, -0.41, 0.5], [0.42, -0.55, 0], [0.22, -0.67, 0.5], [0.06, -0.76, 0]], pos = [];
        var R = rings.map(function (r) { var ring = []; for (var m = 0; m < M; m++) ring.push(at((m + r[2]) / M * Math.PI * 2, r[0], r[1])); return ring; });
        for (var m = 0; m < M; m++) pos.push(top, R[0][m], R[0][(m + 1) % M]);   // (the table)
        for (var r = 0; r < R.length - 1; r++) for (var m = 0; m < M; m++) { var a = R[r][m], b = R[r][(m + 1) % M], c = R[r + 1][m], d = R[r + 1][(m + 1) % M]; pos.push(a, c, b, b, c, d); }
        for (var m = 0; m < M; m++) pos.push(R[R.length - 1][m], bot, R[R.length - 1][(m + 1) % M]);   // (the point at the back)
        var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([].concat.apply([], pos), 3)); g.computeVertexNormals(); return g;
      }
      var cut = gemCut(20, function (t, sc, z) { return [Math.cos(t) * sc, Math.sin(t) * sc, z]; }, [0, 0, 0.445], [0, 0, -0.8]);   // (the round stones: a brilliant cut)
      var stones = [], rnd = 7;
      function rand() { rnd = (rnd * 16807) % 2147483647; return rnd / 2147483647; }
      for (var x = 0; x < N; x += 1.15) {                              // (the rubies set like jewellery: two neat staggered rows round her waist...)
        stones.push({ x: x, d: band(x) * 0.36 + 0.001, s: 0.0021, spin: rand() * 6.3, tip: 0, line: 'top' });
        stones.push({ x: x + 0.575, d: band(x + 0.575) * 0.72 + 0.001, s: 0.0015, spin: rand() * 6.3, tip: 0, line: 'low' });
      }
      DR.forEach(function (r, k) {                                     // (...and down each drip, a line of stones growing smaller towards its teardrop)
        var b = band(r[0]), end = r[2] - r[1] * 2.3;
        for (var d = b + 0.004; d < end;) { var sz = Math.max(0.0009, Math.min(0.0022, half(r, d) * 0.62)); stones.push({ x: r[0] + sway(r, d) / CL, d: d, s: sz, spin: rand() * 6.3, tip: 0, line: 'drip' + k, drop: k }); d += sz * 2.25; }
      });
      var ruby = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0x0c0205, roughness: 0, metalness: 0.78, clearcoat: 1, clearcoatRoughness: 0, envMap: rubyEnv, envMapIntensity: 4, flatShading: true });   // (like a cut gem: each facet dark or flashing with light, rather than glowing all over)
      ruby.side = THREE.DoubleSide;
      var gems = new THREE.InstancedMesh(cut, ruby, stones.length); gems.frustumCulled = false; gems.castShadow = true;
      var col = new THREE.Color();
      stones.forEach(function (st, k) { col.setHSL(0.97 + rand() * 0.01, 0.78 + rand() * 0.1, 0.085 + rand() * 0.05); gems.setColorAt(k, col); });   // (each a slightly different wine red, like the corset)
      var none = new THREE.Matrix4().makeScale(0, 0, 0); for (var k = 0; k < stones.length; k++) gems.setMatrixAt(k, none);   // (hidden until they've found their places)
      grp.add(gems);
      var star = document.createElement('canvas'); star.width = star.height = 64; var sg = star.getContext('2d');   // (now and then a stone twinkles: a little four-pointed star of light)
      [[64, 3], [64, 3], [26, 2], [26, 2]].forEach(function (a, n) { sg.save(); sg.translate(32, 32); sg.rotate(n * Math.PI / 2 + (n > 1 ? Math.PI / 4 : 0)); var g = sg.createLinearGradient(0, 0, a[0] / 2, 0); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); sg.fillStyle = g; sg.beginPath(); sg.moveTo(0, -a[1]); sg.lineTo(a[0] / 2, 0); sg.lineTo(0, a[1]); sg.fill(); sg.restore(); });
      var rg = sg.createRadialGradient(32, 32, 0, 32, 32, 9); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); sg.fillStyle = rg; sg.fillRect(0, 0, 64, 64);
      var tw = stones.filter(function (st, k) { return k % 11 === 5; }).map(function (st) { return { st: st, ph: rand() * 6.3, rate: 1.5 + rand() * 2.5 }; });
      var twinkle = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(star), color: 0xffd8d0, opacity: 0.8, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), tw.length);
      twinkle.frustumCulled = false; for (var k = 0; k < tw.length; k++) twinkle.setMatrixAt(k, none); grp.add(twinkle);
      // (at the end of each drip, a teardrop ruby: a pear cut, round below and pointed up into the drip, with a flat table ringed by
      // star facets, upper and lower girdle facets round its edge, and a deep pavilion of facets behind, coming to a keel)
      var pear = gemCut(48, function (t, sc, z) { var x = Math.sin(t) * Math.pow(Math.sin(t / 2), 1.3) * 0.78, y = Math.cos(t) * 0.92 - 0.12 * Math.sin(t / 2); return [x * sc, (y + 0.1) * sc, z]; }, [0, 0.04, 0.445], [0, -0.02, -0.8]);   // (the teardrop: its point at the top)
      var drops = new THREE.InstancedMesh(pear, ruby, DR.length); drops.frustumCulled = false; drops.castShadow = true;
      DR.forEach(function (r, k) { col.setHSL(0.972, 0.82, 0.11); drops.setColorAt(k, col); drops.setMatrixAt(k, none); }); grp.add(drops);
      // (the settings: each ruby held in a dark antique-silver cup with four little claws; between the stones of each row and down each
      // drip, chain links, like a cup chain; and each teardrop hung from a silver cap and jump ring)
      var silver = new THREE.MeshStandardMaterial({ color: 0x4a4248, metalness: 1, roughness: 0.28, envMap: rubyEnv, envMapIntensity: 2.2 });
      var lines = {}; stones.forEach(function (st, k) { (lines[st.line] = lines[st.line] || []).push(k); });
      var pairs = []; Object.keys(lines).forEach(function (n) { var l = lines[n]; if (n === 'top' || n === 'low') l.sort(function (a, b) { return stones[a].x - stones[b].x; }); for (var i = 0; i < l.length - 1; i++) pairs.push([l[i], l[i + 1]]); if (n === 'top' || n === 'low') pairs.push([l[l.length - 1], l[0]]); });
      Object.keys(lines).forEach(function (n) {                        // (and the top stone of each drip joined on to the nearest stone of the row above it)
        if (n.indexOf('drip') !== 0) return; var f0 = lines[n][0], best = -1, bd = 1e9;
        (lines.low || []).forEach(function (k) { var dx = Math.abs(((stones[k].x - stones[f0].x + N * 1.5) % N) - N / 2); if (dx < bd) { bd = dx; best = k; } });
        if (best >= 0) pairs.push([best, f0]);
      });
      var LP = 8;                                                      // (as many links as each gap needs, up to this)
      var cups = new THREE.InstancedMesh(new THREE.TorusGeometry(1, 0.13, 6, 20), silver, stones.length), claws = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), silver, stones.length * 4);
      var links = new THREE.InstancedMesh(new THREE.TorusGeometry(1, 0.28, 6, 12), silver, pairs.length * LP), bails = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1.4, 10, 1, true), silver, DR.length), rings = new THREE.InstancedMesh(new THREE.TorusGeometry(1, 0.22, 6, 14), silver, DR.length * 2);
      [cups, claws, links, bails, rings].forEach(function (m) { m.frustumCulled = false; for (var k = 0; k < m.count; k++) m.setMatrixAt(k, none); grp.add(m); });
      var SP = stones.map(function () { return { p: new THREE.Vector3(), n: new THREE.Vector3(), s: new THREE.Vector3() }; }), DP = DR.map(function () { return { p: new THREE.Vector3(), n: new THREE.Vector3(), s: new THREE.Vector3(), u: new THREE.Vector3() }; });
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
        // (and then: just where on the skirt itself every bit of the blood lies, so it's sewn to it, following its every ruffle)
        skirtM = skirt; if (!skirtM) return;
        var cb = pts.map(function (p) { return new THREE.Vector3().fromBufferAttribute(P, p.a).lerp(new THREE.Vector3().fromBufferAttribute(P, p.b), p.t); }), tmp = new THREE.Vector3();
        for (var r = 0; r < 2; r++) for (var i = 0; i < N; i++) cb[i].lerp(tmp.copy(cb[(i + N - 1) % N]).add(cb[(i + 1) % N]).multiplyScalar(0.5), 0.5);
        for (var i = 0; i < N; i++) fr[i] = { p: cb[i], o: new THREE.Vector3(cb[i].x, 0, cb[i].z - cz).normalize(), lean: pts[i].lean, out: pts[i].out };
        var probe = new THREE.Mesh(skirtM.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })), ray = new THREE.Raycaster(), SP = skirtM.geometry.attributes.position, used = {};
        var A = new THREE.Vector3(), Bv = new THREE.Vector3(), C = new THREE.Vector3(), bc = new THREE.Vector3();
        function hit(x, d) {
          frame(x, d); ray.set(v.clone().addScaledVector(nrm, 0.03), nrm.clone().negate()); ray.far = 0.09;
          var h = ray.intersectObject(probe)[0], f = h && h.face, pt = h && h.point;
          if (!f) {                                                    // (nothing straight under it: the nearest bit of the skirt instead)
            var best = 1e9, tri = new THREE.Triangle(), cp = new THREE.Vector3(), SI = skirtM.geometry.index; frame(x, d);
            for (var i = 0; i < SI.count; i += 3) { var ia = SI.getX(i), ib = SI.getX(i + 1), ic = SI.getX(i + 2); tri.set(A.fromBufferAttribute(SP, ia), Bv.fromBufferAttribute(SP, ib), C.fromBufferAttribute(SP, ic)); tri.closestPointToPoint(v, cp); var dd = cp.distanceToSquared(v); if (dd < best) { best = dd; f = { a: ia, b: ib, c: ic }; pt = cp.clone(); } }
          }
          A.fromBufferAttribute(SP, f.a); Bv.fromBufferAttribute(SP, f.b); C.fromBufferAttribute(SP, f.c); THREE.Triangle.getBarycoord(pt, A, Bv, C, bc);
          used[f.a] = used[f.b] = used[f.c] = 1; return { a: f.a, b: f.b, c: f.c, u: bc.x, v: bc.y, w: bc.z };
        }
        attB = BX.map(function (x, i) { return hit(x, BD[i]); });
        attS = stones.map(function (st) { return hit(st.x, st.d); });
        attD = DR.map(function (r) { return hit(r[0] + sway(r, r[2] - r[1]) / CL, r[2] - r[1] * 1.05); });
        usedList = Object.keys(used).map(Number); usedList.forEach(function (k) { cache[k] = new THREE.Vector3(); });
      }
      var skirtM = null, attB = [], attS = [], attD = [], usedList = [], cache = {}, ea = new THREE.Vector3(), eb = new THREE.Vector3();
      function spot(x, d, a) {                                         // (where on the skirt that bit of blood is now, and which way the skirt faces there)
        if (!a) return frame(x, d);
        var A = cache[a.a], Bv = cache[a.b], C = cache[a.c];
        v.set(0, 0, 0).addScaledVector(A, a.u).addScaledVector(Bv, a.v).addScaledVector(C, a.w);
        nrm.crossVectors(ea.subVectors(Bv, A), eb.subVectors(C, A)).normalize(); o.set(v.x, 0, v.z - cz); if (nrm.dot(o) < 0) nrm.negate();
        side.crossVectors(up, nrm).normalize(); return v;
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
        if (skirtM) usedList.forEach(function (k) { skirtM.boneTransform(k, cache[k]); });   // (the skirt where it is just now)
        for (var i = 0; i < BX.length; i++) { spot(BX[i], BD[i], attB[i]); v.addScaledVector(nrm, (attB[i] ? 0.0012 : 0) + BT[i]); bpos[i * 3] = v.x; bpos[i * 3 + 1] = v.y; bpos[i * 3 + 2] = v.z; BN[i * 3] = nrm.x; BN[i * 3 + 1] = nrm.y; BN[i * 3 + 2] = nrm.z; }
        bg.attributes.position.needsUpdate = true; bg.computeVertexNormals();
        if (!turned && skirtM) {                                       // (once: every triangle of it turned to face out from the skirt, so it's lit from outside)
          turned = true; var I = bg.index.array, P3 = bpos;
          for (var t = 0; t < I.length; t += 3) {
            var ta = I[t] * 3, tb = I[t + 1] * 3, tc = I[t + 2] * 3;
            ea.set(P3[tb] - P3[ta], P3[tb + 1] - P3[ta + 1], P3[tb + 2] - P3[ta + 2]); eb.set(P3[tc] - P3[ta], P3[tc + 1] - P3[ta + 1], P3[tc + 2] - P3[ta + 2]); ea.cross(eb);
            if (ea.x * BN[ta] + ea.y * BN[ta + 1] + ea.z * BN[ta + 2] < 0) { var sw = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = sw; }
          }
          bg.index.needsUpdate = true; bg.computeVertexNormals();
        }
        stones.forEach(function (st, k) {                              // (every stone lying on the blood, facing out from the skirt, turned its own way)
          spot(st.x, st.d, attS[k]); p3.copy(v).addScaledVector(nrm, st.s * 0.35 + (attS[k] ? 0.0004 : 0));   // (sitting right on the skirt)
          m4.makeBasis(side, w.crossVectors(nrm, side), nrm); q.setFromRotationMatrix(m4).multiply(qs.setFromAxisAngle(zA, st.spin)).multiply(qs.setFromAxisAngle(xA, st.tip));
          m4.compose(p3, q, sc.set(st.s, st.s, st.s)); gems.setMatrixAt(k, m4); SP[k].p.copy(p3); SP[k].n.copy(nrm); SP[k].s.copy(side);
        });
        gems.instanceMatrix.needsUpdate = true;
        var now = performance.now() / 1000;
        tw.forEach(function (t, k) {                                   // (each glint flaring and fading in its own time)
          var st = t.st, g = Math.pow(Math.max(0, Math.sin(now * t.rate + t.ph)), 10); spot(st.x, st.d, attS[stones.indexOf(st)]); p3.copy(v).addScaledVector(nrm, st.s * 0.6 + 0.0006);
          m4.makeBasis(side, w.crossVectors(nrm, side), nrm); q.setFromRotationMatrix(m4).multiply(qs.setFromAxisAngle(zA, t.ph)); m4.compose(p3, q, sc.setScalar(st.s * 3 * g + 1e-6)); twinkle.setMatrixAt(k, m4);
        });
        twinkle.instanceMatrix.needsUpdate = true;
        DR.forEach(function (r, k) {                                   // (each teardrop hanging at its drip's end, its point up into it, facing out from the skirt)
          var rb = r[1]; spot(r[0] + sway(r, r[2] - rb) / CL, r[2] - rb * 1.05, attD[k]); p3.copy(v).addScaledVector(nrm, rb * 0.42 + (attD[k] ? 0.0004 : 0));
          m4.makeBasis(side, w.crossVectors(nrm, side), nrm); q.setFromRotationMatrix(m4); m4.compose(p3, q, sc.set(rb * 1.25, rb * 1.45, rb * 1.1)); drops.setMatrixAt(k, m4); DP[k].p.copy(p3).addScaledVector(w, rb * 1.45 * 1.02); DP[k].n.copy(nrm); DP[k].s.copy(side); DP[k].u.copy(w);
        });
        drops.instanceMatrix.needsUpdate = true;
        stones.forEach(function (st, k) {                              // (each stone's cup and claws)
          var F = SP[k]; w.crossVectors(F.n, F.s); m4.makeBasis(F.s, w, F.n); q.setFromRotationMatrix(m4);
          p3.copy(F.p).addScaledVector(F.n, -st.s * 0.12); m4.compose(p3, q, sc.set(st.s * 1.04, st.s * 1.04, st.s * 1.3)); cups.setMatrixAt(k, m4);
          for (var c4 = 0; c4 < 4; c4++) { var a4 = st.spin + c4 * Math.PI / 2; p3.copy(F.p).addScaledVector(F.s, Math.cos(a4) * st.s * 0.93).addScaledVector(w, Math.sin(a4) * st.s * 0.93).addScaledVector(F.n, st.s * 0.22); m4.compose(p3, q, sc.setScalar(st.s * 0.17)); claws.setMatrixAt(k * 4 + c4, m4); }
        });
        pairs.forEach(function (pr, k) {                               // (links all the way along the gap between each stone and the next, however far apart they are)
          var A = SP[pr[0]], Bq = SP[pr[1]], sa = stones[pr[0]].s, sb = stones[pr[1]].s; ea.subVectors(Bq.p, A.p); var len = ea.length();
          ea.normalize(); nrm.copy(A.n).add(Bq.n).normalize(); side.crossVectors(nrm, ea).normalize();
          var gap = Math.max(0.0004, len - sa * 0.9 - sb * 0.9), n = Math.max(1, Math.min(LP, Math.round(gap / 0.0012))), pitch = gap / n, r0 = Math.max(0.00035, pitch * 0.62);
          for (var h = 0; h < LP; h++) {
            if (h >= n) { links.setMatrixAt(k * LP + h, none); continue; }
            p3.copy(A.p).addScaledVector(ea, sa * 0.9 + pitch * (h + 0.5)).addScaledVector(nrm, -0.0002);
            if (h % 2) m4.makeBasis(ea, nrm, side); else m4.makeBasis(ea, side, nrm); q.setFromRotationMatrix(m4); m4.compose(p3, q, sc.set(r0, r0 * 0.8, r0)); links.setMatrixAt(k * LP + h, m4);
          }
        });
        DR.forEach(function (r, k) {                                   // (each teardrop's cap, and the rings it hangs from)
          var F = DP[k], rb = r[1]; m4.makeBasis(F.s, F.u, F.n); q.setFromRotationMatrix(m4);
          p3.copy(F.p).addScaledVector(F.u, -rb * 0.2); m4.compose(p3, q, sc.set(rb * 0.28, rb * 0.42, rb * 0.28)); bails.setMatrixAt(k, m4);
          for (var h = 0; h < 2; h++) { p3.copy(F.p).addScaledVector(F.u, rb * (0.12 + h * 0.2)); m4.makeBasis(h ? F.s : F.n, F.u, h ? F.n : F.s); q.setFromRotationMatrix(m4); m4.compose(p3, q, sc.setScalar(rb * 0.11)); rings.setMatrixAt(k * 2 + h, m4); }
        });
        [cups, claws, links, bails, rings].forEach(function (m) { m.instanceMatrix.needsUpdate = true; });
      };
      return [{ dress: true, obj: grp, setup: setup }];
    };
  }
  // ---- in the closet, her picture can be turned and looked at closely: drag across it to turn her round, drag up and down
  // when you're in close to look her up and down, and pinch or scroll to zoom in and out ----
  var prSpin = 0, prZoom = 0, prLift = 0, prOpen = -1, prTouch = {};
  function prView(cam) {                                               // (each frame of her picture: the camera moved in and up or down)
    if (prOpen !== menuOpenedAt) { prOpen = menuOpenedAt; prSpin = prZoom = prLift = 0; prHint.style.opacity = 1; }   // (straight on and all of her, each time the closet opens)
    var lim = 0.62 * prZoom; prLift = Math.max(-lim, Math.min(lim, prLift));
    var y = 0.83 + prLift; cam.position.z *= 1 - 0.72 * prZoom; cam.position.y = y + 0.02; prLook.set(0, y, 0);
  }
  clPic.style.touchAction = 'none'; clPic.style.cursor = 'grab';
  var prHint = document.createElement('div'); prHint.className = 'ev-cl-hint'; prHint.textContent = 'Drag to turn her · pinch or scroll to zoom'; clPic.appendChild(prHint);
  var prCss = document.createElement('style'); prCss.textContent = '.ev-cl-hint{position:absolute;left:8px;right:8px;top:6px;text-align:center;font-size:10px;line-height:1.3;color:#5a4a78;background:rgba(255,255,255,.65);border-radius:10px;padding:3px 6px;pointer-events:none;z-index:1;transition:opacity .4s}'; document.head.appendChild(prCss);
  function prPinch() { var t = Object.keys(prTouch).map(function (k) { return prTouch[k]; }); return t.length > 1 ? Math.hypot(t[0].x - t[1].x, t[0].y - t[1].y) : 0; }
  clPic.addEventListener('pointerdown', function (e) { prHint.style.opacity = 0; prTouch[e.pointerId] = { x: e.clientX, y: e.clientY }; prTouch.pinch = undefined; try { clPic.setPointerCapture(e.pointerId); } catch (err) {} clPic.style.cursor = 'grabbing'; e.preventDefault(); });
  clPic.addEventListener('pointermove', function (e) {
    var p = prTouch[e.pointerId]; if (!p) return;
    var n = Object.keys(prTouch).filter(function (k) { return k !== 'pinch'; }).length, dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (n > 1) { var d = prPinch(); if (prTouch.pinch) prZoom = Math.max(0, Math.min(1, prZoom + (d - prTouch.pinch) / 220)); prTouch.pinch = d; return; }   // (two fingers: pinch to zoom)
    prSpin += dx * 0.012; prLift += dy * 0.004 * prZoom;               // (one: turn her; and, in close, look up and down her)
  });
  function prUp(e) { delete prTouch[e.pointerId]; prTouch.pinch = undefined; if (!Object.keys(prTouch).length) clPic.style.cursor = 'grab'; }
  clPic.addEventListener('pointerup', prUp); clPic.addEventListener('pointercancel', prUp);
  window.everdawnPadCloset = function (rx, ry, look, dt, reset) {    // (a controller: asked with nothing, whether the closet's open; told the right stick, the triggers and a click of the right stick)
    if (!closetOpen) return false; if (rx === undefined) return true;
    function dz(v) { return Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82; }
    rx = dz(rx); ry = dz(ry); look = Math.abs(look) < 0.1 ? 0 : look;
    if (rx || ry || look || reset) prHint.style.opacity = 0;
    if (reset) { prSpin = prZoom = prLift = 0; return true; }
    prSpin += rx * 3 * dt; prZoom = Math.max(0, Math.min(1, prZoom - ry * 1.3 * dt)); prLift += look * 0.6 * dt * prZoom;
    return true;
  };
  clPic.addEventListener('wheel', function (e) { prHint.style.opacity = 0; prZoom = Math.max(0, Math.min(1, prZoom - e.deltaY * 0.0015)); e.preventDefault(); }, { passive: false });

  // ---- what she wears underneath: with nothing on (or just a top, or just bottoms), plain black undergarments, from
  // Undergarments.vrm (made in VRoid, painted on her skin there), rather than the dress she started in. Not clothes of
  // their own: never in the shop or the closet, and always on her ----
  (function () {
    var img = new Image(); img.onload = function () { window.EVERDAWN_UNDIES = img; if (you && you.torsoBare) you.torsoBare(0); };   // (painted on her as soon as it's here)
    img.src = 'data:image/webp;base64,UklGRsgnAABXRUJQVlA4ILwnAABwUwGdASpbBOgCPmEwlkgkIyIhI5HoCIAMCWlu++M2oUt46wP/HWG8+vEDSIMrhKmb2l/MxgsE6ofIyucnLx2/c7+LBr6N+an5NuhVsv7IsvJv+C/tHiT/R/7N/dPx69/7GWIj8X+/Ho30Q7x/yf9f/6PqC/if8R/tv8+9Fj4X+w9zrlv/B9AL1K+df7f+3e6XoA9y/+D1Av936ef13wKaAH8r/qX/S9O7/0/13pv/Kf8P/7/9D8Df8l/sH/Y/xPbO/bf2Xv22CXW/r1U+Jn+BX+AHZsHZsHZsHZsHZsHZpz/th+eAIRlKPVKTasVWS+D4JkVnz5dyuFfHNSolaNf5vpMza5K5CqUeqUE9Bdl9Oen2ipH18+r6x3jVlBPpFUpl/sYNePzj3iF7NhCUC66FTA8iGGQiFd/FDIr/+fSgpI78xYqcc9Rweh2e74pMc+1/5ecn//iI//8iO/8tGlrndXDnXs4mVUGjA0hUf0wdJ8JRSj1SkkyakbV22i7liltAAVBZxVI0emQXY0FD9UEgdrxziolVQ8O5MGLGqrfQdxEALomrk+T5KPg6RrqzPDLd6fNKVdO9PwcqzeFDPVZFhOUM9BKJA3CZ+AHZsmlxNh6pQQumB6HV9GafjXsf4zMo7PVT5pSqftIZGFFQbUN5adOfpw3TP9vj1YTPwA7Ng7Ng7Ng7NVDfkBgqNe7TfWKsxT4rHyYuVC5yeYdII7lD212nQbjgxLZ74cAarknduZ3TP+MtxVKPVKPVKPVKPVKPVH521oPENt0nfweCxk6j5ojmrKDxNBT5h0nXFGrNe3xszKvuxmtQ6+Td44Tb+/LUlppGPpBANVypT8AOzYOzYOzYOzYOzYOzbbFJAnI2Zca7WVMaXEOp8GENGFCCPQHDsbPqBct+mBXSepHguu5trYAfqc1HE/k+BqO1uAwsKUeqUeqUeqUeqUeqUeqUeqUeqUegs2nVkY0KMKLP/FqYPNy5AvziS/g4WusCn4Admwdmwdmwdmwdmwdmwdmwdmwdmwdmwdlx5mBA3p8TPwA7Ng7Ng7Ng7Ng7Ng7Ng7Ng7Ng7Ng7Ng7LjzMCFw7IKpR6pR6pR6pR6pR6pR6pR6pR6pR6pR6pR6pQe1f6Ut4rXcaZ45prufFahA9R6UdjT8teLwhyUWAd7NJ8nAich4JvqHKdHffzj9aNBueX2NDqWX+VLf7pBO55T8xjgP8N3R21DOMkCnWy8Mdxnbxfty2tBo/9dhfM2wb94BiNNmsU/4FV2IwFek9G6z6CtEs51eBgnupb/dILcKpNzy+xodObISdsdaLiIw5NQ/Z25lmf+qvFNIRv7mvqvAIXPWAYVHAovH1vqcIjxAgR3H0TteWUJrgAE4AAm//+SXb0tKXLeRWfuYAHBB2HC5zXSORILpzYOzZR4h7TnO4T/HyUeqUeqVaRaPOGHqx4TPwBHM0inxQYoVSj81wFUpHj2oc1KpR6pR6pSCAFfLUOZNhYCqUe0aXsvj91GCHNg7NhGysi00Y0yAVSj1Sj1Sj0MF5h6pR6pR7QEgz1Sj1Sj1Sj4gU/GYbJ8y+Qqn7R6pSOMKUehghzYOzYRvrgnp21Sj1Sj1jieq/SeqnxM/ADs2Ds2Eg6mwdmwdmwdmwdmwdmwdmwdmwdpdG9VPUFCqUeqUeqUeqUeqUeqUjjClHqlHqlHqlHob+XCG5Le+Ds2Ds2Ds2Ds2Ds3wQL6yMXQ29PhOE8yCqUeqUeqVdtfEz8AOzYOzYOzYOzYOzYOzYOzYOzYOzYOzYOzYOzWVOESd4TzIKpR6pR6pR6p+1aQqmLlPwA7Ng7Ng7Ng7Ng7N9JvDuB2bB2bB2bB2bCN+F0oT3dMgqn7R6pR6pR6pR6pR8n7h5M/gB2bB2bB2bB2bGTdJ77w3eyCqUeqUeqUeqUeqUjxWkNz/lxzYOzYOzYOzYOzYOzYO0+mwpR6pR6pR6pR6pR6pSOMptko9Uo9Uo9Uo9Uo9Uo9DBerBqZQqlHqlHqlHqlHqoEIrDcZn4Admwdmwdmwdmw4gkXMnxq3GytjmwdmwdmwdmweHVJkf2k8yCqUeqUeqUeqUeqUgjjiekyydT8AOzYOzYOzYO0t6nNh6pR6pR6pR6pR6pR6pR6pTTn8AOzYOzYOzYOzYR5CfKpR6pR6pR6pR6pR6uUU+JoKe6ienxM/ADs2Ds2DtLb1OMWqnxM/ADs2Ds2Dtmf8c5sxDJ+4Z4OzYOzYOzYOzYRvcdm1U+Jn4AdmwdmwdmwhGWPCbC+H3GxC861T4mfgB2bB2b6Ta5+JQ/GXzQbnl9YqQPvB6Fe3pu329M3umlA8fEz9R2Ds2EI6Y3A4JAdntwghzX/l5vEne3ZZD/wA6PitKawrN9ET1Gg3PJqf5TXmdhD2cnfMJICxHmeeIO+j+Nw2AewY5Ma8ZlBQsfgBXZdPqZtHbb4c0inyOQQNXUqlChqC7q4cgtwafwCoNI8gLSqwS+UfdKAQDRi7p7Y/IlVn7l7EkuRUOwpR6pR6uc98q1iqw9r4bGeOWRR2jP6mmSaKCGa77xn7B2e4LUO4gAbRUQydRxHhCTYjtZGsJtKWeiZKAV7hsht6fEz7g+Irv+WAbYOzYOzYOzYOzYfZaK00o6F5YojPyl4yUBpVRtIiu+7W7lqWQDQEl7YEqLPjf5mIHqup8Ry9O99CWq6hLN5ZOm9V++qfnNQOQnsgqlHqlHqj6uG+TY4bJZ/neG2rCrn4AdmwdmwdmwdrPC1oRi0iVWfucczB2bB2bB2bB2bBsEO7rT+2QoXa6f648UacfhUZsUKpR6pR6pR6pR6pR6pR6pR6pR6pR6pR6pR6pR58ZC/+kJdCZoB8QN6fEz8AOzYOzYOzYOzYOzYOzYOzYOzYOzYOzYOy48zA/e8yCqPrwlBII6C/M1yUX2/meb16AayUnuQWinBHWcIAQVGf5M/ADs2Ds2Ds2AaANnNOZY8YbEa9TEeqFV/741Se5BpGuM7LQ97LuuBT4mfftT78S5i3kuzDzJXY69LMAwiuueeVv955bkvgQcizKiKewIyxViuh2wmlF9GimqnxM/ADstXFVxN2KbTh7/3wYf3l5IE9brkv31M1aqRaMRU3/yntY3DH8LzYi8d1d6ehxRdPthREAbeqkpnJX+7v59e57NZFdVQsi1Q2mI/sO6meHIlUQLwG21TWP40O227FNOybNlxkZxY8VJhsuwJ7ZFU/ClHqlBBhd/hBFebjo/XP7iJypCDrdFx+5U0JeP1oEUpEVBy/DavhnC65Te1+ZQbrVIiwaGC2Lh1RAzEceKVWHYeDmfNvtTZexxG9Ud0fyUsjPB2bB3mZKLXJHAu2xapDbmcVSJxmv+kGepIIel7CpH1JthNyTVlnWAHZyu8ZwoSoHj2GY6iYIdLarCWQJoXolbQHIug5ZExUQ/VYjqR3v+V4OzYOzYOzYOzZM0sL1d/3eqSL5VegsdkSCqUeqUeqUeqbua26rwzXTUz+JStI+rysuPQQBozidPwA7Ng7Ng7Ng7NVwfmkNMtw/+QetYwIKpR6pR6pR6pR6pQYgInhOsoWDZyiTg0/Wcij5DaIlZV5jTcKUeqUeqUeqUeqUlqSAk0dBkqTSutmfgB2bB2bB2bB2bBsDoGDQbe7fPPH9+AA/v4Tm/GB5swXyrRDakK8P+5W7Qeut2u71VpCiBuJNdBiy8RL3poLQFciDK7Ryu9n7MOlurt3a7Q7GKxwAENuYLBb9rL3RvbF6rAoBOafJxSImo18D1nvZOHshSp5/TLZvPfi4kuysnhKaQqK8LqdrkKuaWP8KhD+u/ATrW9jmeqVmQ1YheetCuHjhYb+GhRbWVq1uarPioswLGkenBnpAEoRdlcJZ0EeQW60iBuPKnUkkWdPfwMmKPVCSuTh4nfJ0k9GSIDrm5M5h4TRwsAHy0zMb/kfZGdQqSMdWu9zPXbjdRzPp3ypr3jbisOrGiW7sbUeuiMRJmxAYXg1DMM/3CXMzcRtC29ok00bpF+cDOWUsfFf2E40oDRU8L2T+z7z6tzg/ZiA9vpC9Z1Vq6MWu8yIxCq96eSk3uQ27scxDAOfIfv3nwT/wNZmDLwWqQIsJi4CREfb4h33nnw4WFLRs9ZSizIcfOQHaw2CVOYuAgPI/Xjl/RcNHBOmY9kptsF/68TWyoKDclGuiu86ilFeIEB9383szkt5GEOCcI8d6rD6DHAsCL853aEHZhTKWGGn0lGG9u0YlfWkfsOa1q2XOhmjcSPU+x5AvpcdFhHRQsvp/e8LJHs92Mfxs+XXYu/UojVuY7I9aOvfcX561RPvG7bMiLwALE2BLT7uxD61TwYq3b10+R1ogvs7eqvtRB6WPUbutvKn8pf8VTSMX75LvJvtkCrIPhnVTuCz11l98HLUxw14lK7oyJZeI33V+F4BENqXymX2KPsEr+49vxNn13RIEW0FffkzHZ7UAfRb0Cd5PXiQKwjjRjsMu2UKDM6HrzLS+2yyXOcQZfRdh1PFSEAsfCF9cDYLPwOP3sslznDvuUsu9nBurOMkijgBiHBQ9WmawBYpZyXnQOk9IsVmxEMrGfp/XkyqFKfX+JJEBkKNgsf+oY98cZImCwvFAqEyFTpi/ITUDzaShztk7pK6N4Z+uypQDOGyB79lVEHDLw+HtwqRqUk0pf5nAeklH2HGhN2QolpUN75bXXe8NnxybO7+kVPIUhRkpivNT8P68HaYUQf9fOJecPqS7adzcr7oY0nObKGaAONnqIBsdJPS0XXcvWPfJy9Am6TBLd9tbri5UsX5MOnO1AVpmPdIp1dRXrLVYNcihCBx0IO2lY/UexhGmxEqfXa+rIqvgOQSTK+/GhN7oF9ewAIAXcC8U5sIT9aNqMngX36s/1lwkrJpxDgKV//rI9FHb5P0xkK6N59drykNFIqoumbAoHj6m9gwjHEVQaZp7QBD4l9+JFtmfWvl3G039sj2787LARONJgqyl4gymz7YS5xoVrFBMk4YReNowEPeo9TbNXAAAIN28mRM7BXgYIel+ytqA0GsZF7x5ThtXZH6CVYCq7xkF/7D3o4dy35LTfdKDGMvI74XInigteuTFsLgqYmdhJPDOZg6jgQWfw+N4Hqjr3bgZiCXJefDxrnjbLaXqQPQhoo/sUD5ZosLEnjmqajq5mpOMDfICv+7G2dLD9VHyOO20ICspOx1fe0Mu9S1RRgzhjT7Yd7773gAAP973HXZTRn6eFC18s95VqAyRIY6i0WkQIknZeCwNYFvJsSWur7pkHZhSnpQscQpNVSxCwc3brnLJ45JkBILLgmLPFh5R2+afUAuEGpfFmSHQPreHZrQaLWkLNOPmIZHHoAl3REwODsdjUg3RjMPisqwo+hUs5sjNxqrVKRb3yILb7B+DErm3PhILKA+ji8btlogwOIn+FWAQ1p2esRXa9SIcEo5GBeYaunY1tQSOWT1DXjI0RsXBiYn4Xm0y7mOKyxXuOFn5cVE53q5p2nn978pqTAAAAByYkCGm0VjuaWdTycLEFmGxQDQuGLLzvFO7JxJI311IrlMlgiFiIQcjM96OphvJVDY15xI/iVKZFozv8L/4kpbO9LRfS0MKTHcAonl+OpA2WKnhFMpi0QfsEj93HxxaWY1lC1MoGQd4r9R5IofB9uL+b2UmGEA8zcaKonaZXxeNacFGc27IjGPPReKQiS30Q5fJ0gwrknaDer0dFIVAGTeMexljnURC93/OkEttiZCyKm0SLPpM5L6O6UO0oZ1sXgGJ2CQbyOwzPrX9yOxYotD5mycHWSsrlYhkXKtyaGEUZvz+tpYgEuR0rfT01JUI9BGkHufZxAl7nPjVZArQK5yMyoNLH2vDOo2fhGVRUlpD0WaZO0enerGXjAEIXW0IgAAAHdQUO2aB2nBVFaddei63cy4aVvJP0DQrNC2dedL7eamcrgMTynYS89KJQ57K2r+s24c2kHQ5a6TKtqMi04tPN6g1G0DpUO2J+viyMr/voz8nQgimQopmcpCNikP5Cv5mqi8PA8j9Iam7SQQ3vWPLCl8sYvwdBWGTAkfO08u8VI8QA4ZHLCB7FucNreyQLW8LOSntj+s//muDz/3DNIi6Y36348DN8rHeGTNjMCOK7b81Ebi+ltQvTQ2ovOn0rlUQT9XdBarVHdS+zkLvU67l23p1o+MPOkKxxF2IU3o7VG0soxDxSo4AAAAAAAAFjoBFPmzJ+s2wQfWcMI32+75z1d+IvvVsiGTOR+/A7hWLNTOVbfRlQFNdIBUMN186taAHdq8SP8dp0a//uej5otv/Rm/c0kH6J0CKgAAAAAAAeXb+sgaPsGAAAAAAAZ8USjEigAAAAAAEY8ZyXFtZWHQRG/grpOYPMM2i74as9Qe/N9bW8avkDXyQbKr+8sMXqo33h3VPJLyCUYr4BPqugnGXKDtSqxhBFRoujh7xUoLUYGm6xZwqwp7m8Qk8IeAUMIpP8aOWNmR9BEMQoUoa40PY/594e4sIGUAU+Bij/DKi0MFxAqUnHV47lmZisICKtYfZfuAOQHUSAD5/iwqyKHnPsbcyOdVqK1R7wNwYx9M/Xlh+XIDD+Pc4FkUegPV56IkxYxdjpU9qryjT0Z21uNObE+UPMRRPV+TxDu7j0JinSG0F84p6AeawQxca64heUKwqK7/5v5eho0wXAt71EqcysYr8YGxkxAgIW4v6mTDfj4jWc1dnqcqSc9ymWSO7XRJxhEUg9IRT6tqrE6tzHmtfdcIS4QfNEFgpbNbCYjJ756r2+P6alddwK9RVC3Yu/HOwoXZ7wfaLgsMvQ4wC5XMwAKgbh7jvCUxA2nKajgoUMI9NZZWk79Zb080kxaV4c7IiRm6thdARR03IAMU56euNJuqG4H7tcfUVgmVPZRkx+zRyth0v2G4QqO5X/IO2Z5k7tcvT3BTcZ1eZS0vwBCTP94+1F0WhTDtznuMSFJ2a9JliK+2JQlkF9FBub5V4tk4IDh88ZQ5lJiJmxt8PEE8H5s2n4HqzOmktLT4qdBgRnwg/gu4RNTIlD7jMfOyhITKjJSQH4YfnzLPRAJktk/ETl6WI07a6Hb5+wHeTUInPEcmsbGyDXtO2J/NZ29jW7KLt2yg5f0Sa57LthZ/a98O0YnF8yi6ZwA6zwYzp1cIy8ttye+MWP5yovRuZPwEh3GV90pPFqKEKIqys3Byt7KeeWZiwRK60EqPDAXX7C437X7NfQW/R8CKVY8U0ZF5TNtCVHJ9EhL4vMRbnvlhLd598+prbB2Fwvw3D/PZ3uAXW3Y2x3ewoMoe7ipLSygK0JkcndjCTBVgo8xKotdhDNlhbHVzheYPp7tuHaYgxJFioWUI428ymxrVkPwnjTfWHrRSNowB5qhfx/MepdmZwyYGrUYhVA3sZT+PnFhYpYLelNNQR/gJ31G3NjbA5OiSsHU49BOT6NV37X1eJQTnK0Owgl0ksOCqzdSRds0Q2haqTWu5cHeaVxFBPgmSDP2InDCeLWBN5pY17wEn7ZwKjfFp3Ve8Ck8BMglnI09L9gXVic3UAkwth4FJDVz5jm7oQIcBTGelY4+wvJP0U+/YcKFZ/X09dN1im0wf8S8iT1aewgi4WxZOjKRQrDChrBsLLCyIXnLAa5BuAjx7cDifJNoCwfxAlE2dUQBgPeOFkUVR9oHqVxzya1SE82kFvasNFn5hibsc8+5byaaEdyY4N+p8BBs+hXzOWTwJn7XMwCSI/sQOiX12T4DzVixQ8jaKAESzweEBJHpaGAAF5eHrmQaAAI36JMB+mHVY6iAAUy1wDCAAClC62VdkCNe72/0SD0ABE7M0SmAALBGjoIm0gi/+QAACOzsAAwVw5TkVtYB2R+uS+nEHHED4AA7TjCiAB6nm/x4a/MXGermLpS2w7JZ8ADf7jdGgAelWE1wGRKWF9hJ22MiAAI49BfoIAOoWAXysJHbtGIq4iAApOWEAKCrVZYQLGHkxsVrbw/G0APvs4ZOIAagbVB0UkHOC1ZY1wUEmBFQrL3uKtrLcdoACRrsYROIASz5sPzfblGFEApoxLwqgAJbdqqSUKIAgCwNCursZxw83pI/L2+4jZNEAGcBK29Yc2UAYnDAhDKGy+LoQU1DwsmW+eyKUdQALSIwZ316TezgpvTMEhIKpjlUBX6fwFPGp3KADrZEVydYnvHcGTBs0X3ftU8Ag3kLaXu84vtCt5CnOvJKphX3Msu5mB0Cru/viAmO46P8YjELmT/m1Wp3Vx6CVw2NmnRVGjznrsvC1RMpV0v55TPkLRALroBco74vmE707CrrJtjzrXtQNYMp2uLa+RXx6PxGfgHqGpUjNqBp/GLZ1xYqFAD9TimsDh728t4lCrXt9EHVm4PVx98mUSNgBIBbNYS30gm9BiZP64UEzYXoBsaTP42EZ1lYKELCaEvrEaNsRDAE8XSL/BWGJaVrM6wzcoYiQCeXMIDCJTC6aQPfOp4qTI/t0oNFA10ZQzN+hKuuxucHWPwjdFFTU8NwGEPeLh7DtGQvwc//+Ar0bOvAITDd2cGdz4fCo1ggzEZG1yZVk9Ex0VFuGlOCd9LSwqaCygdXJ8LGv6exLbQwe6nt6iDS8u9ATvBlgZmEfs98lZX4EsEVie8s3/rxqqNqPAGfOEmnaOnJsmaOZadZH2gHN7NCCJZmlvFgeBj0gnyYCqYKJk0Bmd1EmoFQEY1jps5siuEnBiYeJDgK0F1Oq1D8rRq8He+hc0LeaJMz1lMo9rhcNoDOCeADkcs1Ukdzuwp4OniYpfRVGSQsgM9SigpeIxytv0sr91gpycJ/AyH/Tc8Hs9Ivw38VZZsmFUyiRE4VQGRukyOGADa6fkG6uca0dyiOk8GzX+nh/tmEx1LEp7im5fYC6q+I7ECqXxF9fgzzC1rO5KKa+ysL9sbjkGANTyDpM/d38hkwumSFNy8gZlSoU+xDdsvVm8B1L+VZdbYbDslbqHn/Lan/KoTsiYAAL9OiRqERZ0IVNEL5DvGLi0sghnI/mh6l2NqXrOk87MRYQaFnZz9jXyoGXEpSZSsdb1Dctbgk27OUZ98UpsbTXXiZHOkr1Jph46lWJbii59oaJylmxFt5y7GPWB6NJc1VGYCdSh3Ud9dL8oJt44b58wIHz/SH9r7Wrg3j5ErXQ/g4SdGmqbOSKKzVpDXQGx3fdhxC63PX5lhldR/jVEexyKUfADYhlMdFR08en+Llv4/o7No/8K5z5QqDKaX/5tHNG8UxEMahZ/Wfr0sXRYt8pxzeP/ncPiYlPvnLquBPPksWdtp88/Qa6c9RWb0jrHSt4aGaibjVA6igbt73pd0zj4R29H1p8wIHB5gmfVc4vfpByhHdcpm2POzdKZvD18x60TsQTYjFRN0fb40+Zyv7Uc/vb+TOm90RUk8vhBRAAE8UXLuvpy4lGaRRIwEA558p6AYtRPb8n806+aM+4QAAGgb4FEaLLktz/wkzIHA/2OJDjz06gML18kyePQjMBGOVbkTSOdTqmJIMWMoF4t3mxUOLlSn53BNMO15wtK/ocUfAtKVtg+iqVv3nlrdEgRiekVJNC7TVVDgpKpt92rFNCtlV9AJPnj7CkJECtcW5Vs85WVe99wHXI0Zg5w3MfG8gqbS/+xa2dLK4CaacQsZrhQ6LjJxpyijQds62ES1lESIEiv0rMTmPQ4mTQQNtYVzwEWHp65rOFqY3VIAHmkUFGeiaRuZPTm4tXGfFpAoW/nwJhBZWXbJPCac+DO6d4dR7WaO9pFtn6+gtw+E6aIvIypFGhCoNCfZJGkt+s9LX2HkNshgFeJ4kLaUJKQZtCVZS7D+O1sTlAttOos2JGyZEx31BZud0OB8+aQD/a8NzwH7wd6ySW8kGRutlXxv7paIkoAoIUUeWlh82vTkAAAZuRjX2m5JEyhAMf7c/BldpYTUQcc/BbI7OqCB/36Tc48/gJhqcpGt3mTSvEl+YK2ed2//H8B73q/m+z30dS7IAAAAAAAAAQ+WKOkCBcTGedD7/CaoaeTueTe0n8Mq9Q1n5HR5BcWuiyRtVhCY54MMaGXf1s8MCzmOqO27s9Euiw50VXL+CT86A/17tvtSZe+litwIppRCa1hdr+Hmv5I6q3j50CWOTqHC076h6KAAAAAAABjEZ8N+x+d3F4Rn0PdKt/o//4wcfJI1VYyf6GBumRl+qqb8wqgEWIrO647AG8gjfNIk/FIdN7obYeAP4GrLIbqqLoXMlyE3kAAAAAAAODzR4qHEuzZCLnwT1ukui8BGsoWWV4Pl1TMTN0KBoD6q8BSs0m8j2Elb2mN9VkXfWLrFePeI97S6ncCBAOaBiQcusG4/4DwTjLrTSQMjIkw9Q13gzVXXJTpAQE6BW/2HSU+pDDor92A5U9k2beRGr2UYkqjMnhsIH4fsQzHKyCSt0wQ5Uu5CXxksrrXZejz4DnNkKQucI4yAQQi9zFZ1gE3U6jLdXkwtvBzX6+l0RqC8W7xp5jTInvEQWjX4KM0ABkXd/gNnV4YKY86Fyb52NzsKko/TrYPFr0HKAHHwxvRmuSUweznkl1JyX+jCx6yUxicd4stsB3PrwoOTisDEhcwnmO+vNPfw7zeY8tqdQQ26j2N79w2nLedkF3DCju8Qw5gCifKHFbz8SHef6YYIOgGRwgNjpQbMMS3fxZxXQDup2ph5QcoQpAQw8KH0tUThWQ3xUEWCoaV4kPnVfkdKEmJ2So3yDe0a1MFIg6dUs3aPq0AphKOKRpczXRYPMaXzXaVcobA/KUpeBNF1wr21D/dQIY5J0jcCor7XJfBKjDG9Ga8LRms980IslE9CJcCCgQiLIUNuvbYHH9xYO0I/SvSg3aU52q0kJiPkMKtaQmD+uK0mpuLh3cMAhvH+Z0JVq/+wJmrnsfzOcMsMJWN7WsuzTzRN0F3SlDNSzBnvkGVN22+pFG21q2AnXSH+6HPuOdHofzZO8N9W1KxoQrJYf6hxZVLwSYNkqZfqwGftJKaUJCZ1SQQs+DGDoO7vxMykiXPIj6QGeG8FItXqf8yvkOceNirC+ojWV0ZmVZtJEhctPvME2AQzoC+aZ7MJUhtetVKTP+UslKmAH/vDGGF6mFMIz4cNM+dZxGIzac5/eRNon8OU/MjsSRo5jbNiokfFzjCQiuwgusBhs/9UNlsSNeYuVnKNN7TI0TNewU5VWnwSlmxejhfKBS0uIczkc9q7U3rOl30fHaQs6YV5QEZKP+cyTP0wNPefpwDlYi/BstrIUQABP2o4XPfKjxU8HnyWx8hbViDGTW0Pvpc2E9utUKqLDAIQxLyXnv94v458ku3dwi6LnUGSLwS2KUzF1YROekzmW7Wg1rYi6db61WdcHqlFZplQ6VSnhqWpu/KEFz6Bts+bv1Qy4vw5XPgHVu6zoC1XAsm+TNKAukWIAsiKJXhICOWP1h2kBxqSqZ0Zf2AMueGVFPWum2jp84l2XyWw4nLrHUX9EeInlhlIvblg61G7JpvMy4cOtHCeKWr5rKUTE0rda7FcTbwhkvq5WVmc4HCTzLxrW6jI0anErj67BaKRPlYPD+CaVxpSWfDh+mh46H1QEo5B3vOqLWzyaOj8zg+eiQdvJPzj40fzHYwsv+lMb5kMyGhzVbh9h+KO2czWF9tJh+gCNyb6FerC4ogK1ZHty07rN6B8M3fHKjAhIY/y0AbBWkynhFNpWKY1V6dMMEMJpH9fcCbdBKCLVfNbJd9PaMbq2YZ169BBpeuA+rQvCOTVj4DpqH+xmr4GTLuyAzgeHHffHbpN4NCaDewQxNI4RZC8nFXaebD31MdtGtS3e9DS5FFP0ToS4RKyd/LOt72T4fmnq8wS4AmShsRDpiB95MfFNWpuDVdFNGr35hv99pPGlUMC0AgsxMiaYpPg1C8Z+1C+vkxoTmF5a7GnCNLLAyHh27vyQDC0YT6b6FfkNYspPIRpCnDWCWSMe5FfQfBzNtcnbaDkOhfNJq5uWbxbtqlIOoDtjQ/ppAsBZvwoZQGYb1xCyIAUC+iEdM3TNnSw4zf+5T5rpHPEpYq/Yp2372bE4scD4tTV0MS+la8DvspP1GZ/gXeRaM/w3Lu7nXCyopCEs4kXSkfQt7JYIpjuZn5i1b5/jt27JdhYaQOD3Xply9covPgRoHt1+zeogxf5FTs6QIq7NmRU/iSYGVjnCsq6a9oAcBNpz+QHD+67E39U8zADYnSXprb/bE13WbkdUw/aFAprQfjUpGXVucyDehHLvjqXO8hhViXslPnlZ5AIYwDcd5Q5PMiyrHGenD09ncp0sNp8JC+LMF9x+piAAADtf3ed4Yt355XUkAg8utj6/v/DjoM8hVZCN7Mw5HB18Ldf1toQXLPKS770MCyDHqrsCNMwW788rn+E8fkql/jIJO9pkIyHYxRpTcEPf0YrVpzNY6Jjr/lvL1m+e65VtV0tMYbfwL3S3M2vW6TEOjTkEDyrRfSV+3RRvH6jbR3Cl5fo+ncG15fBdljh/Tq3+KwUxpFbwX2hgx/wDLi9NgTUAkpUt0pxcWCJlWqyLG9Df+Rgfvwuf+Mt7KQ303prLeexOBwcECpz2XwhfmR4i5Dg1o3rNbAWoIfjgzT/bQqD/YLP4i5/s42iCilRnvZ8uGVGtr6qaubInNAx85E0qwAAAABBDJrLYFAp57Aavm0w4oWaEgiMXORGmQ77BUaRt6tA2YW/hf2WTXyIl1koP1RWmNQuDq3TcQRqaWderzcGblAFO99Z3/yKkTbYGbPHkvW/aaoYia8XR2l31dEMlgiR+Cfnppu0vOm9XHZMYxTS7lx+eefWSyp0z0KgS0rV2Jp4i0vubN3Q0HDTTa2+gs68S2uN8bYNsr7/wAAB+6CuuGtfKZhbk7+rltRdxSVW05GivgvpJ0l8F15QVZ9Y5FqGIo54EGd2J3Qde/0s8ePxFgcuWaif4ET0g/I8QC//QAXKK8+jzFm1nVGlICBVD35uXpD5jyaK7b3oIqgAAAcmbHu40GUBxUA5GxiamwLD477BTB6TVp61mcVoNrgIlA+vK1n3d9kPdvgR24C+GRf2MlSpBMdd/bdfN/1zfW2h33PMHG+cqD2f53tjpuDURCuJWZrbUKVpoHCrwsOHBjAd03seZyrL96E3eZYt7k4kPdmAEwAABGcv6uW1F3FIv2jGERpSvPoBzZMfxJQ7QG76CXsWbHwiMatcu5LmeXVKb88j8573NSHz5iuK7rMsYpSqJYFFNodPMQHbGyH4XvTOHdyMhxgZAiocOHjzQyeub8EkLua0EwAAEdkh1/SYrkn/b/AbvuBNnHrXnAtoN/RaxHzGMT+aeFWs792cqzsnU1JWwKjtezqCmD7daxrm8ox190HAoFqgdapFGjvF4ygWGa+4E1a4/BTsdE8BOeZVSCfVuXVAemWHds5/P4aVmh5vr/OT9yBclA5XVcqZTOf4k6sf8fvmlBs0FFiiAAAQRoJxfCsylJGceA5dldWID36HFjqGyJ3eHO9+qU/+Uvii5/WBsJuKn3NQYNRoAAVG4PKzdMSRAsSGZHWRnL9MeY5ul7+KzyT2F0AusH7wJz9ACZ71OT1wuZSVYQx6WNQUd1O51HfqETfkZ8ESPW4H+bDIAAAA==';
  })();

  // ---- with her shoes off: barefoot. Her bare feet and shins come from Undergarments.vrm's body (made with no shoes on) ----
  var bareSet = null;
  function barefoot() {
    var f = 'Undergarments.vrm'; outfitModel(f); var o = outfitFiles[f];
    if (!bareSet && o && o.g && you) {
      bareSet = you.shoes(o.g, null); bareSet.bare = true;
      you.meshes.forEach(function (m) {                                // (her own body: its feet, hidden in her boots, left off while she's barefoot, for these)
        if (!/Body_00_SKIN/.test(m.material.name) || !m.geometry.index) return;
        var g = m.geometry, P = g.attributes.position, I = g.index, keep = [];
        for (var i = 0; i < I.count; i += 3) { var a = I.getX(i), b = I.getX(i + 1), c = I.getX(i + 2); if (Math.max(P.getY(a), P.getY(b), P.getY(c)) > 0.19) keep.push(a, b, c); }
        var cut = new THREE.Uint32BufferAttribute(keep, 1); g.userData.cuts = { tall: I, low: I, bare: cut };
      });
    }
    return bareSet;                                                    // (null, her own boots, until the file's arrived)
  }

  var vv = CLOTH_STOCK.filter(function (c) { return c.id === 'cloth_victorian_vengeance'; })[0];
  if (vv) { var vvWear = vv.wear; vv.wear = function () { return vvWear().concat(bloodRubies('Victorian Vengeance.vrm', 'CLOTH_01')()); }; }   // (worn, along with its frills: its blood rubies)
  // ---------- Atom & Alembic, the science lab on the Western Isle ----------
  // A cozy stone laboratory outside, walls of honey stone banded with dark timber under a slate roof with a smoking
  // chimney; inside, bright and modern (see below). Stand by its door and press Interact to go in; walk out through the
  // doorway to leave.
  var LAB_X = -120, LAB_Z = 16, LAB_TURN = 2.03, LAB_HW = 4, LAB_HD = 3.2, LAB_H = 3.0, LAB_FY = 0.15;
  function labWorld(lx, lz) { var c = Math.cos(LAB_TURN), s = Math.sin(LAB_TURN); return { x: LAB_X + lx * c + lz * s, z: LAB_Z - lx * s + lz * c }; }
  function labFront(d) { return labWorld(0, LAB_HD + d); }
  function labLocal(x, z) { var dx = x - LAB_X, dz = z - LAB_Z, c = Math.cos(LAB_TURN), s = Math.sin(LAB_TURN); return [dx * c - dz * s, dx * s + dz * c]; }
  function onLabLot(x, z, m) { var l = labLocal(x, z); return Math.abs(l[0]) < LAB_HW + 2.2 + m && l[1] > -LAB_HD - 2.4 - m && l[1] < LAB_HD + 2.2 + m; }
  var labDoor = labFront(0.2), LB_PTS = [[-98.5, 1.0], [-104, 4.2], [-109, 8.3], [-113, 11.6], [labFront(2.2).x, labFront(2.2).z]];
  var lbLine = stoneCurve(LB_PTS, 70), lbBox = lineBox(lbLine);
  function onLabPath(x, z) { return lineDist(lbLine, lbBox, x, z) < SP_W + 0.6; }
  function labNight() { var hr = state.minutes / 60; return hr < 5.5 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr < 18.5 ? 0 : hr < 20 ? (hr - 18.5) / 1.5 : 1; }
  function lbTex(w, h, paint, rx, ry) { var t = cpTex(w, h, paint); if (rx) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); } return t; }
  var lbStone = new THREE.MeshStandardMaterial({ roughness: 0.92, map: lbTex(256, 256, function (g, w, h) {   // (honey-coloured stone, laid in courses)
    g.fillStyle = '#8a7a64'; g.fillRect(0, 0, w, h);
    var rows = [30, 34, 30, 34, 32, 32, 30, 34];                       // (courses that add up to the full height, so the stone tiles with no seam)
    for (var r = 0, y = 0; r < rows.length; r++) {
      var hh = rows[r], x0 = (r * 37) % 60, ws = [], tot = 0;
      while (tot < w) { var ww = 44 + ((r * 13 + tot * 7) % 36); if (w - tot - ww < 30) ww = w - tot; ws.push(ww); tot += ww; }   // (the last stone ends where the first begins)
      for (var k = 0, x = x0; k < ws.length; x += ws[k], k++) { var c = 168 + ((r * 31 + k * 53) % 34);
        [x, x - w].forEach(function (bx) {                               // (each stone drawn again one width over, so it wraps round the edge)
          g.fillStyle = 'rgb(' + c + ',' + (c - 16) + ',' + (c - 42) + ')'; g.fillRect(bx + 2, y + 2, ws[k] - 4, hh - 4);
          g.fillStyle = 'rgba(255,240,210,0.18)'; g.fillRect(bx + 2, y + 2, ws[k] - 4, 3); g.fillStyle = 'rgba(60,40,20,0.18)'; g.fillRect(bx + 2, y + hh - 6, ws[k] - 4, 4); }); }
      y += hh;
    }
  }, 2, 1.5) });
  var lbSlate = new THREE.MeshStandardMaterial({ roughness: 0.75, map: lbTex(128, 128, function (g, w, h) {   // (dark blue-grey slates, overlapping)
    g.fillStyle = '#2e3440'; g.fillRect(0, 0, w, h);
    for (var r = 0; r < 8; r++) for (var x = (r % 2) * 8; x < w; x += 16) { var c = 56 + ((r * 7 + x) % 22); g.fillStyle = 'rgb(' + c + ',' + (c + 6) + ',' + (c + 18) + ')'; g.fillRect(x + 1, r * 16 + 1, 14, 14); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + 1, r * 16 + 13, 14, 2); }
  }, 3, 2) });
  var lbWood = rMat(0x3e2a1e, { roughness: 0.7 }), lbOak = rMat(0x7a5232, { roughness: 0.65 }), lbIron = rMat(0x1c1a1e, { metalness: 0.6, roughness: 0.4 });
  var lbBrass = rMat(0xd9b05a, { metalness: 0.7, roughness: 0.3, envMap: rubyEnv, envMapIntensity: 2.5, emissive: 0x3a2808 }), lbCopper = rMat(0x5fa38c, { metalness: 0.55, roughness: 0.38 }), lbCopperBright = rMat(0xd0783e, { metalness: 0.7, roughness: 0.3, envMap: rubyEnv, envMapIntensity: 2.5, emissive: 0x3a1608 });
  var lbGlow = rMat(0xffd89a, { emissive: 0xffc070, emissiveIntensity: 0.4, roughness: 0.2 });          // (warm light through the windows)
  var lbGreen = rMat(0x8affc0, { emissive: 0x3cff9a, emissiveIntensity: 0.6, roughness: 0.2 });         // (an alchemist's green glow)
  var labGroup = new THREE.Group(); labGroup.position.set(LAB_X, LAB_FY, LAB_Z); labGroup.rotation.y = LAB_TURN; scene.add(labGroup);
  var lbLamps = [], lbSmoke = [];
  function lbP(geo, m, x, y, z, rx, ry, rz, par) { return cpPart(geo, m, x, y, z, rx, ry, rz, par || labGroup); }
  var lbBlack = rMat(0x18171c, { metalness: 0.75, roughness: 0.32, envMap: rubyEnv, envMapIntensity: 0.9 });   // (blackened wrought iron, with a soft sheen)
  var lbHaloTex = cpTex(128, 128, function (g, w, h) { var r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); r.addColorStop(0, 'rgba(255,236,190,1)'); r.addColorStop(0.18, 'rgba(255,200,120,0.55)'); r.addColorStop(0.5, 'rgba(255,170,80,0.16)'); r.addColorStop(1, 'rgba(255,150,60,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  function lbLamp(par, x, y, z) {                                       // (a wrought-iron carriage lantern on a scrolled wall bracket, a candle burning inside)
    var L = new THREE.Group(); L.position.set(x, y, z); L.scale.setScalar(1.15); par.add(L);
    function P(geo, m, px, py, pz, rx, ry, rz) { return lbP(geo, m, px, py, pz, rx, ry, rz, L); }
    function tube(pts, r, m) { return P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(function (q) { return new THREE.Vector3(q[0], q[1], q[2]); })), 40, r, 6, false), m, 0, 0, 0); }
    // (the backplate on the wall: a shaped iron plate, bolted on)
    var bp = new THREE.Shape(); bp.moveTo(0, -0.17); bp.quadraticCurveTo(0.085, -0.1, 0.055, 0.02); bp.quadraticCurveTo(0.095, 0.12, 0, 0.2); bp.quadraticCurveTo(-0.095, 0.12, -0.055, 0.02); bp.quadraticCurveTo(-0.085, -0.1, 0, -0.17);
    P(new THREE.ExtrudeGeometry(bp, { depth: 0.012, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2, curveSegments: 10 }), lbBlack, 0, 0.33, 0).scale.set(0.72, 0.72, 1);
    [0.42, 0.25].forEach(function (by) { P(new THREE.SphereGeometry(0.01, 8, 6), lbBrass, 0, by, 0.018); });
    // (the bracket: an arm out from the wall, braced underneath by a curving strut with a curl of iron in the corner)
    tube([[0, 0.42, 0.005], [0, 0.425, 0.15], [0, 0.42, 0.31]], 0.011, lbBlack);
    P(new THREE.SphereGeometry(0.018, 10, 8), lbBrass, 0, 0.42, 0.325); P(new THREE.ConeGeometry(0.008, 0.03, 8), lbBrass, 0, 0.42, 0.35, Math.PI / 2, 0, 0);
    tube([[0, 0.21, 0.005], [0, 0.25, 0.08], [0, 0.31, 0.15], [0, 0.4, 0.21]], 0.0085, lbBlack);
    var sp = []; for (var k = 0; k <= 30; k++) { var u = k / 30, ang = Math.PI * 0.5 + u * Math.PI * 3, rr = 0.045 * (1 - u * 0.8); sp.push([0, 0.34 + Math.sin(ang) * rr, 0.075 + Math.cos(ang) * rr]); }
    sp.unshift([0, 0.4, 0.075]); tube(sp, 0.0055, lbBlack);
    [[0.42, 0.24], [0.42, 0.13]].forEach(function (c) { P(new THREE.TorusGeometry(0.012, 0.004, 6, 12), lbBlack, 0, c[0] - 0.012, c[1], 0, Math.PI / 2, 0); });
    // (it hangs from the arm by a hook and two chain links)
    var cz = 0.26;
    P(new THREE.TorusGeometry(0.013, 0.0035, 6, 12), lbBlack, 0, 0.395, cz, 0, 0, 0); P(new THREE.TorusGeometry(0.013, 0.0035, 6, 12), lbBlack, 0, 0.37, cz, 0, Math.PI / 2, 0);
    P(new THREE.TorusGeometry(0.013, 0.0035, 6, 12), lbBlack, 0, 0.345, cz, 0, 0, 0); P(new THREE.TorusGeometry(0.02, 0.005, 8, 16), lbBrass, 0, 0.31, cz, 0, Math.PI / 2, 0);
    // (the top: a brass finial, a little vented chimney cap and a flared, six-sided roof with balls at its corners)
    P(new THREE.SphereGeometry(0.02, 12, 10), lbBrass, 0, 0.28, cz); P(new THREE.CylinderGeometry(0.012, 0.022, 0.03, 12), lbBrass, 0, 0.255, cz);
    P(new THREE.ConeGeometry(0.06, 0.05, 6), lbBlack, 0, 0.215, cz); P(new THREE.CylinderGeometry(0.045, 0.05, 0.035, 6), lbBlack, 0, 0.175, cz);
    for (var v = 0; v < 6; v++) { var va = v * Math.PI / 3 + Math.PI / 6; P(new THREE.BoxGeometry(0.018, 0.016, 0.004), rMat(0x050505), Math.sin(va) * 0.046, 0.175, cz + Math.cos(va) * 0.046, 0, va, 0); }
    P(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 6), lbBlack, 0, 0.152, cz);
    P(new THREE.ConeGeometry(0.135, 0.075, 6, 1, true), lbBlack, 0, 0.112, cz); P(new THREE.CylinderGeometry(0.137, 0.137, 0.012, 6), lbBrass, 0, 0.072, cz);
    for (var c = 0; c < 6; c++) { var ca = c * Math.PI / 3; P(new THREE.SphereGeometry(0.012, 8, 6), lbBrass, Math.sin(ca) * 0.14, 0.072, cz + Math.cos(ca) * 0.14); P(new THREE.ConeGeometry(0.006, 0.03, 6), lbBlack, Math.sin(ca) * 0.14, 0.098, cz + Math.cos(ca) * 0.14); }
    // (the body: six glass panes between slim iron posts, with frames top and bottom and a little band of fretwork)
    P(new THREE.CylinderGeometry(0.1, 0.1, 0.022, 6), lbBlack, 0, 0.055, cz);
    var gl = new THREE.MeshStandardMaterial({ color: 0xfff1d6, transparent: true, opacity: 0.22, metalness: 0, roughness: 0.05, envMap: rubyEnv, envMapIntensity: 1.6, emissive: 0xffb050, emissiveIntensity: 0, side: THREE.DoubleSide, depthWrite: false });
    P(new THREE.CylinderGeometry(0.088, 0.074, 0.19, 6, 1, true), gl, 0, -0.05, cz);
    for (var q = 0; q < 6; q++) { var qa = q * Math.PI / 3; var post = P(new THREE.BoxGeometry(0.011, 0.2, 0.011), lbBlack, Math.sin(qa) * 0.082, -0.05, cz + Math.cos(qa) * 0.082, 0, qa, 0); post.rotation.x = Math.cos(qa) * -0.07; post.rotation.z = Math.sin(qa) * 0.07; }
    P(new THREE.CylinderGeometry(0.086, 0.086, 0.008, 6, 1, true), lbBlack, 0, 0.022, cz);
    for (var fr = 0; fr < 6; fr++) { var fa = fr * Math.PI / 3 + Math.PI / 6; P(new THREE.TorusGeometry(0.012, 0.0028, 5, 10), lbBlack, Math.sin(fa) * 0.083, 0.008, cz + Math.cos(fa) * 0.083, 0, fa, 0); }
    P(new THREE.CylinderGeometry(0.082, 0.082, 0.026, 6), lbBlack, 0, -0.155, cz); P(new THREE.CylinderGeometry(0.084, 0.084, 0.008, 6), lbBrass, 0, -0.142, cz);
    // (underneath: a tapering base with a brass drop finial)
    P(new THREE.ConeGeometry(0.08, 0.06, 6), lbBlack, 0, -0.198, cz, Math.PI, 0, 0); P(new THREE.SphereGeometry(0.017, 12, 10), lbBrass, 0, -0.235, cz); P(new THREE.ConeGeometry(0.008, 0.03, 8), lbBrass, 0, -0.262, cz, Math.PI, 0, 0);
    // (inside: a brass cup, a creamy candle with a drip of wax, a wick and a flickering flame with a bright heart)
    P(new THREE.CylinderGeometry(0.032, 0.026, 0.016, 14), lbBrass, 0, -0.134, cz);
    var wax = rMat(0xf4ead2, { roughness: 0.55, emissive: 0x3a2410, emissiveIntensity: 0.4 });
    P(new THREE.CylinderGeometry(0.018, 0.019, 0.075, 14), wax, 0, -0.088, cz); P(new THREE.SphereGeometry(0.006, 6, 5), wax, 0.016, -0.065, cz + 0.008).scale.set(1, 2.2, 1);
    P(new THREE.CylinderGeometry(0.0015, 0.0015, 0.012, 4), rMat(0x111111), 0, -0.045, cz);
    var m = rMat(0xffe0a0, { emissive: 0xffb040, emissiveIntensity: 0.3, roughness: 0.3 });
    var flame = P(new THREE.SphereGeometry(0.012, 12, 10), m, 0, -0.022, cz); flame.scale.set(1, 1.9, 1); flame.castShadow = false;
    var core = P(new THREE.SphereGeometry(0.0055, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfffbe8 }), 0, -0.028, cz); core.scale.set(1, 1.7, 1);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: lbHaloTex, color: 0xffd090, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); halo.position.set(0, -0.03, cz); halo.scale.set(0.85, 0.85, 1); L.add(halo);
    lbLamps.push({ m: m, g: halo, f: flame, gl: gl });
  }
  // ---- apothecary glassware for the windowsills and the barrel: blown-glass bottles, flasks, jars and vials with glowing
  // potions inside, corks, twine and handwritten labels, and a few other bits of an alchemist's kit ----
  var lbLiquids = [], lbSignM, lbSignLampIn, lbSignGlows = [];
  var lbGlass = new THREE.MeshStandardMaterial({ color: 0xeef6ff, transparent: true, opacity: 0.3, roughness: 0.04, metalness: 0.1, envMap: rubyEnv, envMapIntensity: 2.2, side: THREE.DoubleSide, depthWrite: false });
  var lbCork = rMat(0xa47a4e, { roughness: 0.95 }), lbTwine = rMat(0xc9b48a, { roughness: 1 });
  var lbLabels = ['⚗', '☿', '☉', '☽', '♀', '♃'].map(function (sym, i) { return new THREE.MeshStandardMaterial({ roughness: 0.9, side: THREE.DoubleSide, map: cpTex(128, 64, function (g, w, h) {
    g.fillStyle = ['#efe2c0', '#e8d8b0', '#f2e8cf'][i % 3]; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(120,80,40,0.35)'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#4a2c1a'; g.font = '30px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(sym, 28, h / 2 + 1);
    g.strokeStyle = 'rgba(74,44,26,0.7)'; g.lineWidth = 2; [22, 32, 42].forEach(function (ly, k) { g.beginPath(); g.moveTo(50, ly); for (var x = 50; x < 112 - k * 12; x += 4) g.lineTo(x, ly + Math.sin(x * 0.7 + i + k) * 1.2); g.stroke(); });
    g.fillStyle = 'rgba(140,100,50,0.15)'; g.beginPath(); g.arc(100 - i * 6, 46, 9, 0, Math.PI * 2); g.fill();
  }) }); });
  function lbLiquid(c) { var m = rMat(c, { emissive: c, emissiveIntensity: 0.5, roughness: 0.12, metalness: 0.05 }); lbLiquids.push(m); return m; }
  function lbLathe(pts, segs) { return new THREE.LatheGeometry(pts.map(function (q) { return new THREE.Vector2(q[0], q[1]); }), segs || 20); }
  function lbGlassP(geo, x, y, z, par) { var o = lbP(geo, lbGlass, x, y, z, 0, 0, 0, par); o.renderOrder = 2; o.castShadow = false; return o; }
  function lbBottle(par, kind, x, y, z, c, k, sc) {   // (one piece of glassware standing at x, y, z: k picks its label, sc its size)
    var B = new THREE.Group(); B.position.set(x, y, z); B.scale.setScalar(sc || 1); B.rotation.y = (kind === 'vials' || kind === 'books' ? 0.15 : 1.3) * (k || 0); par.add(B);
    function P(geo, m, px, py, pz, rx, ry, rz) { return lbP(geo, m, px, py, pz, rx, ry, rz, B); }
    if (kind === 'potion') {                                          // (a tall shouldered bottle, corked and tied with twine, with a label)
      lbGlassP(lbLathe([[0, 0], [0.034, 0], [0.04, 0.008], [0.041, 0.11], [0.034, 0.132], [0.014, 0.15], [0.013, 0.183], [0.017, 0.188], [0.016, 0.194], [0, 0.194]]), 0, 0, 0, B);
      P(lbLathe([[0, 0.004], [0.036, 0.004], [0.037, 0.09], [0, 0.09]]), lbLiquid(c), 0, 0, 0);
      P(new THREE.CylinderGeometry(0.0135, 0.0115, 0.034, 12), lbCork, 0, 0.198, 0); P(new THREE.TorusGeometry(0.0145, 0.0022, 5, 14), lbTwine, 0, 0.165, 0, Math.PI / 2, 0, 0);
      P(new THREE.CylinderGeometry(0.0015, 0.0015, 0.05, 4), lbTwine, 0.012, 0.142, 0.012, 0.3, 0, 0.4);
      P(new THREE.CylinderGeometry(0.0425, 0.0425, 0.05, 16, 1, true, -0.65, 1.3), lbLabels[(k || 0) % 6], 0, 0.06, 0);
    } else if (kind === 'erlen') {                                    // (a conical flask, half full and bubbling)
      lbGlassP(lbLathe([[0, 0], [0.058, 0], [0.062, 0.006], [0.021, 0.118], [0.019, 0.152], [0.023, 0.158], [0, 0.158]]), 0, 0, 0, B);
      P(lbLathe([[0, 0.004], [0.055, 0.004], [0.036, 0.058], [0, 0.058]]), lbLiquid(c), 0, 0, 0);
      [[0.012, 0.03, 0.01], [-0.015, 0.045, 0.008], [0.004, 0.07, 0.006]].forEach(function (bb) { P(new THREE.SphereGeometry(bb[2], 8, 6), lbGlass, bb[0], bb[1], 0.01); });
    } else if (kind === 'flask') {                                    // (a round-bottomed flask resting in a cork ring)
      P(new THREE.TorusGeometry(0.03, 0.011, 8, 18), lbCork, 0, 0.011, 0, Math.PI / 2, 0, 0);
      lbGlassP(new THREE.SphereGeometry(0.062, 20, 16), 0, 0.07, 0, B); lbGlassP(new THREE.CylinderGeometry(0.016, 0.017, 0.085, 14, 1, true), 0, 0.165, 0, B);
      P(new THREE.TorusGeometry(0.0175, 0.003, 6, 14), lbGlass, 0, 0.207, 0, Math.PI / 2, 0, 0);
      P(new THREE.SphereGeometry(0.057, 18, 12, 0, Math.PI * 2, Math.PI * 0.42, Math.PI * 0.58), lbLiquid(c), 0, 0.07, 0);
      P(new THREE.CircleGeometry(0.056, 18), lbLiquids[lbLiquids.length - 1], 0, 0.083, 0, -Math.PI / 2, 0, 0);
      P(new THREE.CylinderGeometry(0.015, 0.013, 0.028, 12), lbCork, 0, 0.214, 0);
    } else if (kind === 'jar') {                                      // (a squat jar of glowing crystals under a glass stopper)
      lbGlassP(lbLathe([[0, 0], [0.046, 0], [0.051, 0.01], [0.051, 0.07], [0.04, 0.082], [0.032, 0.088], [0.032, 0.095], [0, 0.095]]), 0, 0, 0, B);
      var cm = lbLiquid(c); for (var q = 0; q < 9; q++) { var qa = q * 2.4; P(new THREE.OctahedronGeometry(0.014 + (q % 3) * 0.004), cm, Math.cos(qa) * 0.026 * (q % 2 ? 1 : 0.5), 0.016 + (q % 4) * 0.011, Math.sin(qa) * 0.026 * (q % 2 ? 1 : 0.5), q, q * 0.7, 0); }
      lbGlassP(new THREE.SphereGeometry(0.02, 14, 10), 0, 0.113, 0, B); P(new THREE.CylinderGeometry(0.034, 0.034, 0.006, 16), lbGlass, 0, 0.097, 0);
      P(new THREE.CylinderGeometry(0.0515, 0.0515, 0.03, 16, 1, true, -0.6, 1.2), lbLabels[((k || 0) + 2) % 6], 0, 0.04, 0);
    } else if (kind === 'vials') {                                    // (a little wooden rack of test tubes)
      P(new THREE.BoxGeometry(0.16, 0.012, 0.05), lbOak, 0, 0.004, 0); P(new THREE.BoxGeometry(0.16, 0.012, 0.05), lbOak, 0, 0.075, 0);
      [-0.075, 0.075].forEach(function (lx) { P(new THREE.BoxGeometry(0.01, 0.085, 0.05), lbWood, lx, 0.04, 0); });
      [-0.045, 0, 0.045].forEach(function (vx, i) { lbGlassP(new THREE.CylinderGeometry(0.011, 0.011, 0.12, 12, 1, true), vx, 0.075, 0, B); lbGlassP(new THREE.SphereGeometry(0.011, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), vx, 0.015, 0, B);
        P(new THREE.CylinderGeometry(0.0095, 0.0095, 0.04 + i * 0.015, 10), lbLiquid([0xff5a9a, 0x5ae0ff, 0xa8ff5a][(i + (k || 0)) % 3]), vx, 0.035 + i * 0.0075, 0); P(new THREE.CylinderGeometry(0.012, 0.01, 0.016, 10), lbCork, vx, 0.14, 0); });
    } else if (kind === 'mortar') {                                   // (a stone mortar with its pestle, a few leaves beside it)
      P(lbLathe([[0, 0], [0.04, 0], [0.05, 0.02], [0.055, 0.05], [0.05, 0.052], [0.042, 0.025], [0, 0.018]], 18), rMat(0x9a958c, { roughness: 0.95, side: THREE.DoubleSide }), 0, 0, 0);
      P(new THREE.CylinderGeometry(0.009, 0.014, 0.1, 10), rMat(0xb8b2a6, { roughness: 0.9 }), 0.015, 0.07, 0, 0, 0, -0.5);
      [[0.07, 0.02, 0.3], [0.075, -0.015, 1.4]].forEach(function (lf) { P(new THREE.SphereGeometry(0.018, 8, 4), rMat(0x5c8a3a, { roughness: 0.8 }), lf[0], 0.003, lf[1], 0, lf[2], 0).scale.set(1, 0.12, 0.45); });
    } else if (kind === 'books') {                                    // (two old leather books, one with brass corners)
      [[0x6b2a32, 0, 0.17, 0.12, 0.03], [0x2d4a5a, 0.032, 0.15, 0.11, 0.026]].forEach(function (bk, i) {
        var bg = new THREE.Group(); bg.position.set(0, bk[1] + bk[4] / 2, 0); bg.rotation.y = i * 0.25; B.add(bg);
        lbP(new THREE.BoxGeometry(bk[2], bk[4], bk[3]), rMat(bk[0], { roughness: 0.7 }), 0, 0, 0, 0, 0, 0, bg); lbP(new THREE.BoxGeometry(bk[2] - 0.01, bk[4] - 0.008, bk[3] - 0.004), rMat(0xeadfc4, { roughness: 1 }), 0.006, 0, 0, 0, 0, 0, bg);
        lbP(new THREE.BoxGeometry(0.004, bk[4] + 0.002, bk[3] + 0.002), lbBrass, -bk[2] / 2 + 0.02, 0, 0, 0, 0, 0, bg);
        if (!i) [[1, 1], [1, -1]].forEach(function (cc) { lbP(new THREE.BoxGeometry(0.018, bk[4] + 0.003, 0.018), lbBrass, cc[0] * (bk[2] / 2 - 0.007), 0, cc[1] * (bk[3] / 2 - 0.007), 0, 0, 0, bg); });
      });
    } else if (kind === 'succulent') {                                // (a small clay pot with a succulent)
      P(new THREE.CylinderGeometry(0.035, 0.026, 0.05, 14), rMat(0xb0623e, { roughness: 0.95 }), 0, 0.025, 0); P(new THREE.CylinderGeometry(0.038, 0.038, 0.01, 14), rMat(0xa85a38, { roughness: 0.95 }), 0, 0.05, 0);
      for (var lf2 = 0; lf2 < 9; lf2++) { var la = lf2 * 2.4, lr = lf2 < 5 ? 0.018 : 0.008; P(new THREE.SphereGeometry(0.012, 8, 6), rMat(0x7fa67a, { roughness: 0.6 }), Math.cos(la) * lr, 0.062 + (lf2 < 5 ? 0 : 0.012), Math.sin(la) * lr, 0, -la, lf2 < 5 ? 1.0 : 0.4).scale.set(0.6, 1.5, 0.6); }
    }
    return B;
  }
  (function (G) {
    var W = LAB_HW, D = LAB_HD, H = LAB_H;
    lbP(new THREE.BoxGeometry(W * 2 + 0.6, 0.3, D * 2 + 0.6), rMat(0x6e6658, { roughness: 0.95 }), 0, -0.05, 0);   // (its stone footing)
    lbP(new THREE.BoxGeometry(2.4, 0.12, 1.6), rMat(0x8a8274, { roughness: 0.95 }), 0, -0.1, D + 1.0);   // (a flagstone landing at the door)
    // (the walls: the front in pieces round the arched doorway, the others whole)
    lbP(new THREE.BoxGeometry(W * 2, H, 0.3), lbStone, 0, H / 2, -D); [-1, 1].forEach(function (s) { lbP(new THREE.BoxGeometry(0.3, H, D * 2), lbStone, s * W, H / 2, 0); });
    [-1, 1].forEach(function (s) { lbP(new THREE.BoxGeometry(W - 0.75, H, 0.3), lbStone, s * (W + 0.75) / 2, H / 2, D); });
    lbP(new THREE.BoxGeometry(1.5, H - 2.25, 0.3), lbStone, 0, 2.25 + (H - 2.25) / 2, D);
    // (dark timber: corner posts, a band round the top, and beams across the gables)
    [[-W, -D], [W, -D], [-W, D], [W, D]].forEach(function (c) { lbP(new THREE.BoxGeometry(0.34, H + 0.05, 0.34), lbWood, c[0], H / 2, c[1]); });
    lbP(new THREE.BoxGeometry(W * 2 + 0.36, 0.22, 0.1), lbWood, 0, H - 0.1, D + 0.17); lbP(new THREE.BoxGeometry(W * 2 + 0.36, 0.22, 0.1), lbWood, 0, H - 0.1, -D - 0.17);
    // (the slate roof, pitched front to back, with stone gables at the ends)
    var RH = 1.7, slope = Math.atan2(RH, D + 0.35), len = Math.hypot(RH, D + 0.35);
    [-1, 1].forEach(function (s) { lbP(new THREE.BoxGeometry(W * 2 + 0.7, 0.14, len + 0.1), lbSlate, 0, H + RH / 2, s * (D + 0.35) / 2, s * slope, 0, 0); });
    lbP(new THREE.BoxGeometry(W * 2 + 0.75, 0.16, 0.2), lbWood, 0, H + RH + 0.02, 0);   // (the ridge)
    var gab = new THREE.Shape(); gab.moveTo(-D, 0); gab.lineTo(D, 0); gab.lineTo(0, RH); gab.lineTo(-D, 0);
    var gabT = lbStone.map.clone(); gabT.needsUpdate = true; gabT.repeat.set(1 / 3.2, 1 / 2); gabT.offset.set(0, 0.5);   // (the gables' stone sized and lined up with the walls below)
    var lbStoneG = new THREE.MeshStandardMaterial({ roughness: 0.92, map: gabT });
    [-1, 1].forEach(function (s) { var gm = lbP(new THREE.ExtrudeGeometry(gab, { depth: 0.28, bevelEnabled: false }), lbStoneG, s * W - (s > 0 ? 0.14 : -0.14), H, 0, 0, Math.PI / 2, 0); gm.position.x = s > 0 ? W - 0.14 : -W - 0.14; });
    // (the chimney, smoking a little green)
    lbP(new THREE.BoxGeometry(0.6, 1.9, 0.6), lbStone, -W + 1.0, H + 1.2, -0.9); lbP(new THREE.BoxGeometry(0.72, 0.14, 0.72), lbWood, -W + 1.0, H + 2.18, -0.9);
    for (var k = 0; k < 6; k++) { var sm = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0xcfe8d8, transparent: true, opacity: 0, depthWrite: false })); G.add(sm); lbSmoke.push({ m: sm, k: k }); }
    // (the front door: oak planks under a dressed-stone arch with a keystone, in a dark timber frame, with wrought-iron strap
    // hinges, clout-nail studs, a little barred speaking window, a brass ring knocker and a latch with a keyhole)
    var door = new THREE.Group(); door.position.set(0, 0, D + 0.12); G.add(door);
    function dP(geo, m, x, y, z, rx, ry, rz) { return lbP(geo, m, x, y, z, rx, ry, rz, door); }
    function archShape(hw, rh, sh) { sh = sh || new THREE.Shape(); sh.moveTo(-hw, 0); sh.lineTo(hw, 0); sh.lineTo(hw, rh); sh.absarc(0, rh, hw, 0, Math.PI, false); sh.lineTo(-hw, 0); return sh; }
    var DHW = 0.54, DRH = 1.5, FR = 0.64;                               // (the door's half-width and the height where its arch begins; the frame's outer edge)
    dP(new THREE.BoxGeometry(1.5, 2.25, 0.06), lbStone, 0, 1.125, -0.13);   // (stone behind, so no gap shows round the arch)
    var plankTex = cpTex(256, 512, function (g, w, h) {                  // (five oak planks: grain, knots, dark seams, weathered at the foot)
      var pw = w / 5;
      for (var i = 0; i < 5; i++) {
        var x0 = i * pw, tone = [0, 10, -8, 6, -4][i]; g.fillStyle = 'rgb(' + (128 + tone) + ',' + (86 + tone * 0.7) + ',' + (52 + tone * 0.4) + ')'; g.fillRect(x0, 0, pw, h);
        for (var k = 0; k < 16; k++) { var gx = x0 + 3 + (k * 37 + i * 11) % (pw - 6), amp = 1.5 + (k % 3), ph = k * 1.7 + i;
          g.strokeStyle = k % 2 ? 'rgba(70,40,18,0.28)' : 'rgba(190,140,90,0.18)'; g.lineWidth = k % 4 ? 1 : 2; g.beginPath();
          for (var y = 0; y <= h; y += 8) { var xx = gx + Math.sin(y * 0.018 + ph) * amp; if (y) g.lineTo(xx, y); else g.moveTo(xx, y); } g.stroke(); }
        var ky = 80 + ((i * 173) % 330); if (i !== 2) { g.save(); g.translate(x0 + pw * (0.35 + (i % 2) * 0.3), ky); for (var r = 9; r > 1; r -= 2) { g.strokeStyle = 'rgba(60,32,14,' + (0.25 + (9 - r) * 0.06) + ')'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(0, 0, r * 0.7, r * 1.8, 0, 0, Math.PI * 2); g.stroke(); } g.fillStyle = 'rgba(50,26,10,0.7)'; g.beginPath(); g.ellipse(0, 0, 2, 4, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
        g.fillStyle = 'rgba(255,220,170,0.12)'; g.fillRect(x0 + 3, 0, 2, h); g.fillStyle = 'rgba(30,15,5,0.25)'; g.fillRect(x0 + pw - 6, 0, 3, h);
        g.fillStyle = '#26160c'; g.fillRect(x0 + pw - 3, 0, 3, h);
      }
      var fg = g.createLinearGradient(0, h, 0, h * 0.78); fg.addColorStop(0, 'rgba(40,26,14,0.55)'); fg.addColorStop(1, 'rgba(40,26,14,0)'); g.fillStyle = fg; g.fillRect(0, h * 0.78, w, h * 0.22);
    });
    plankTex.wrapS = plankTex.wrapT = THREE.RepeatWrapping; plankTex.repeat.set(1 / (DHW * 2), 1 / (DRH + DHW)); plankTex.offset.set(0.5, 0);
    var leafM = new THREE.MeshStandardMaterial({ map: plankTex, bumpMap: plankTex, bumpScale: 0.012, roughness: 0.78, color: 0xe8dccb });
    dP(new THREE.ExtrudeGeometry(archShape(DHW, DRH), { depth: 0.07, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 24 }), leafM, 0, 0, -0.06);
    var frame = archShape(FR, DRH); frame.holes.push(archShape(DHW + 0.01, DRH, new THREE.Path()));
    dP(new THREE.ExtrudeGeometry(frame, { depth: 0.17, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1, curveSegments: 24 }), lbWood, 0, 0, -0.12);
    // (the stone arch: dressed voussoirs fanned round, a proud keystone at the top, and quoined jambs down each side)
    var dressed = [0xb8aa8f, 0xae9f84, 0xc0b296, 0xa89a80].map(function (c) { return rMat(c, { roughness: 0.9 }); });
    for (var vs = 0; vs < 9; vs++) {
      var a0 = vs / 9 * Math.PI + 0.012, a1 = (vs + 1) / 9 * Math.PI - 0.012, key = vs === 4, r0 = FR, r1 = key ? 0.93 : 0.86, vsh = new THREE.Shape();
      vsh.moveTo(r0 * Math.cos(a0), r0 * Math.sin(a0)); vsh.lineTo(r1 * Math.cos(a0), r1 * Math.sin(a0)); vsh.absarc(0, 0, r1, a0, a1, false); vsh.lineTo(r0 * Math.cos(a1), r0 * Math.sin(a1)); vsh.absarc(0, 0, r0, a1, a0, true);
      dP(new THREE.ExtrudeGeometry(vsh, { depth: key ? 0.2 : 0.16, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 6 }), dressed[vs % 4], 0, DRH, -0.06);
    }
    var jy = 0, jn = 0; [0.32, 0.28, 0.31, 0.29, 0.3].forEach(function (jh) { [-1, 1].forEach(function (sd) { var jw = (jn + (sd > 0 ? 1 : 0)) % 2 ? 0.26 : 0.2;
      dP(new THREE.BoxGeometry(jw, jh - 0.018, 0.17), dressed[(jn + (sd > 0 ? 2 : 0)) % 4], sd * (FR + jw / 2 - 0.01), jy + jh / 2, 0.025); }); jy += jh; jn++; });
    dP(new THREE.BoxGeometry(1.7, 0.1, 0.4), rMat(0x9c917d, { roughness: 0.95 }), 0, 0.05, 0.18);   // (a worn stone step)
    dP(new THREE.BoxGeometry(1.3, 0.012, 0.3), rMat(0x8a8070, { roughness: 1 }), 0, 0.106, 0.19);
    // (the strap hinges: long iron straps with spear tips and curls, riveted, swinging on pintles in the frame)
    var strap = new THREE.Shape(); strap.moveTo(-0.6, -0.035); strap.lineTo(0.12, -0.028); strap.lineTo(0.2, -0.05); strap.lineTo(0.31, 0); strap.lineTo(0.2, 0.05); strap.lineTo(0.12, 0.028); strap.lineTo(-0.6, 0.035); strap.lineTo(-0.6, -0.035);
    [0.38, 1.36].forEach(function (hy) {
      dP(new THREE.ExtrudeGeometry(strap, { depth: 0.012, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 1 }), lbBlack, 0, hy, 0.022);
      [1, -1].forEach(function (sd) { dP(new THREE.TorusGeometry(0.028, 0.006, 6, 14, Math.PI * 1.3), lbBlack, 0.05, hy + sd * 0.052, 0.03, 0, 0, sd > 0 ? -0.2 : Math.PI - 0.2); });
      [-0.48, -0.3, -0.12, 0.05, 0.2].forEach(function (rx) { dP(new THREE.SphereGeometry(0.011, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), lbBlack, rx, hy, 0.036, Math.PI / 2, 0, 0); });
      dP(new THREE.CylinderGeometry(0.022, 0.022, 0.12, 10), lbBlack, -DHW - 0.04, hy, 0.03); dP(new THREE.BoxGeometry(0.09, 0.04, 0.012), lbBlack, -DHW - 0.08, hy, 0.055);
      dP(new THREE.SphereGeometry(0.01, 6, 5), lbBlack, -DHW - 0.1, hy, 0.064);
    });
    // (studs: square clout nails down the planks, kept clear of the knocker, the latch and the window)
    var stud = new THREE.ConeGeometry(0.019, 0.016, 4);
    [0.14, 0.7, 0.98, 1.2, 1.62, 1.85].forEach(function (sy) { [-0.432, -0.216, 0, 0.216, 0.432].forEach(function (sx) {
      var half = sy > DRH ? Math.sqrt(Math.max(0, DHW * DHW - (sy - DRH) * (sy - DRH))) - 0.07 : DHW - 0.05;
      if (Math.abs(sx) > half || (Math.abs(sx) < 0.13 && sy > 0.85 && sy < 1.3) || (sx > 0.3 && sy > 0.75 && sy < 1.2) || (Math.abs(sx) < 0.17 && sy > 1.55)) return;
      dP(stud, lbBlack, sx, sy, 0.032, Math.PI / 2, Math.PI / 4, 0); }); });
    // (the speaking window: a little arched grille, warm light behind its iron bars, under a brass hood)
    var gwin = new THREE.Shape(); gwin.moveTo(-0.085, 1.62); gwin.lineTo(0.085, 1.62); gwin.lineTo(0.085, 1.74); gwin.absarc(0, 1.74, 0.085, 0, Math.PI, false); gwin.lineTo(-0.085, 1.62);
    dP(new THREE.ShapeGeometry(gwin, 12), rMat(0xffd89a, { emissive: 0xffb860, emissiveIntensity: 0.55, roughness: 0.3 }), 0, 0, 0.025);
    var gring = new THREE.Shape(); gring.moveTo(-0.11, 1.6); gring.lineTo(0.11, 1.6); gring.lineTo(0.11, 1.74); gring.absarc(0, 1.74, 0.11, 0, Math.PI, false); gring.lineTo(-0.11, 1.6); gring.holes.push(gwin);
    dP(new THREE.ExtrudeGeometry(gring, { depth: 0.016, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 1, curveSegments: 12 }), lbBrass, 0, 0, 0.022);
    [-0.045, 0, 0.045].forEach(function (bx) { dP(new THREE.CylinderGeometry(0.0065, 0.0065, bx ? 0.2 : 0.25, 8), lbBlack, bx, 1.72 + (bx ? -0.005 : 0.01), 0.035); });
    dP(new THREE.CylinderGeometry(0.0065, 0.0065, 0.18, 8), lbBlack, 0, 1.71, 0.035, 0, 0, Math.PI / 2);
    [-0.045, 0, 0.045].forEach(function (bx) { dP(new THREE.SphereGeometry(0.009, 6, 5), lbBrass, bx, 1.71, 0.036); });
    // (the knocker: a brass rosette with a heavy ring hanging from a boss, and a strike plate beneath)
    dP(new THREE.CylinderGeometry(0.068, 0.068, 0.012, 24), lbBrass, 0, 1.12, 0.03, Math.PI / 2, 0, 0);
    for (var pe = 0; pe < 10; pe++) { var pa = pe / 10 * Math.PI * 2; dP(new THREE.SphereGeometry(0.013, 8, 6), lbBrass, Math.cos(pa) * 0.05, 1.12 + Math.sin(pa) * 0.05, 0.038).scale.set(1, 1, 0.6); }
    dP(new THREE.SphereGeometry(0.026, 14, 10), lbBrass, 0, 1.12, 0.042); dP(new THREE.CylinderGeometry(0.009, 0.009, 0.05, 8), lbBrass, 0, 1.105, 0.06, 0.4, 0, 0);
    var ring = dP(new THREE.TorusGeometry(0.075, 0.012, 10, 28), lbBrass, 0, 1.045, 0.075, -0.32, 0, 0);
    dP(new THREE.SphereGeometry(0.022, 12, 8), lbBrass, 0, 0.955, 0.035).scale.set(1, 1, 0.5);
    // (the latch: a long brass escutcheon with a pull handle and a keyhole)
    dP(new THREE.BoxGeometry(0.06, 0.22, 0.01), lbBrass, 0.4, 0.97, 0.03);
    [1.08, 0.86].forEach(function (ey) { dP(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 18), lbBrass, 0.4, ey, 0.03, Math.PI / 2, 0, 0); dP(new THREE.SphereGeometry(0.007, 6, 5), lbBlack, 0.4, ey, 0.037); });
    dP(new THREE.TorusGeometry(0.055, 0.009, 8, 18, Math.PI), lbBrass, 0.4, 1.0, 0.035, 0, -Math.PI / 2, -Math.PI / 2);
    dP(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 10), rMat(0x050505), 0.4, 0.915, 0.037, Math.PI / 2, 0, 0); dP(new THREE.BoxGeometry(0.006, 0.02, 0.006), rMat(0x050505), 0.4, 0.903, 0.037);
    lbLamp(G, -1.22, 1.38, D + 0.15); lbLamp(G, 1.22, 1.38, D + 0.15);
    // (front windows: stone surrounds with a keystone lintel and a deep sill on corbels, oak casements of small panes in front
    // of a warm-lit room with curtains drawn back, and a row of glassware and bits of the alchemist's kit along each sill)
    var lbRoomTex = cpTex(256, 256, function (g, w, h) {
      var bg = g.createRadialGradient(w * 0.5, h * 0.45, 10, w * 0.5, h * 0.5, w * 0.75); bg.addColorStop(0, '#fff0c8'); bg.addColorStop(0.6, '#f0c47a'); bg.addColorStop(1, '#b07a3c'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(120,80,40,0.35)'; g.fillRect(0, 0, w, 26);
      [[96, 0], [168, 1]].forEach(function (sh) {                         // (shelves of bottles inside)
        g.fillStyle = '#6a4424'; g.fillRect(40, sh[0], 176, 8); g.fillStyle = 'rgba(60,30,10,0.35)'; g.fillRect(40, sh[0] + 8, 176, 6);
        for (var b = 0; b < 9; b++) { var bx = 50 + b * 19 + sh[1] * 6, bh = 18 + (b * 7 + sh[1] * 5) % 16, cols = ['#ff6a9a', '#6ad8ff', '#9aff6a', '#c08aff', '#ffc85a', '#5affc0'];
          g.fillStyle = cols[(b + sh[1] * 2) % 6]; g.globalAlpha = 0.75; g.fillRect(bx, sh[0] - bh, 11, bh); g.beginPath(); g.arc(bx + 5.5, sh[0] - bh, 5.5, Math.PI, 0); g.fill(); g.fillRect(bx + 3, sh[0] - bh - 10, 5, 6); g.globalAlpha = 1;
          g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(bx + 2, sh[0] - bh + 2, 2, bh - 4); }
      });
      g.fillStyle = 'rgba(90,255,170,0.35)'; g.beginPath(); g.arc(128, 222, 26, 0, Math.PI * 2); g.fill(); g.fillStyle = '#3a2614'; g.fillRect(70, 236, 116, 20);   // (a glowing flask on a table)
      [[0, 1], [w, -1]].forEach(function (cu) {                          // (velvet curtains, tied back)
        for (var f = 0; f < 6; f++) { var x0 = cu[0] + cu[1] * f * 7; g.fillStyle = f % 2 ? '#5a2a6a' : '#6e3480'; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + cu[1] * 10, 0); g.quadraticCurveTo(x0 + cu[1] * 4, 130, x0 + cu[1] * 12, h); g.lineTo(x0 + cu[1] * 3, h); g.quadraticCurveTo(x0 - cu[1] * 4, 130, x0, 0); g.fill(); }
        g.fillStyle = '#d9b05a'; g.fillRect(cu[1] > 0 ? 0 : w - 46, 138, 46, 7);
      });
    });
    var lbRoomM = new THREE.MeshStandardMaterial({ map: lbRoomTex, emissive: 0xffffff, emissiveMap: lbRoomTex, emissiveIntensity: 0.4, roughness: 0.9 }); lbLiquids.push(lbRoomM);
    var paneGlass = new THREE.MeshStandardMaterial({ color: 0xdfeeff, transparent: true, opacity: 0.16, roughness: 0.03, metalness: 0.2, envMap: rubyEnv, envMapIntensity: 2.4, depthWrite: false });
    var winSets = { '-1': [['potion', -0.4, 0x5affb0, 1], ['flask', -0.2, 0xff5a9a, 0], ['vials', 0.02, 0, 1], ['books', 0.24, 0, 0], ['jar', 0.42, 0x7ab8ff, 3]],
                    '1': [['erlen', -0.4, 0xc08aff, 0], ['mortar', -0.19, 0, 0], ['potion', 0.0, 0xffb84a, 4], ['succulent', 0.2, 0, 0], ['potion', 0.38, 0x5ad8ff, 2, 0.8]] };
    [-1, 1].forEach(function (s) {
      var wx = s * 2.5, WY = 1.65, WZ = D + 0.15;
      lbP(new THREE.PlaneGeometry(1.1, 1.1), lbRoomM, wx, WY, WZ + 0.005);                                  // (the room inside)
      var pg = lbP(new THREE.PlaneGeometry(1.02, 1.02), paneGlass, wx, WY, WZ + 0.06); pg.renderOrder = 2; pg.castShadow = false;   // (the glass, catching the sky)
      // (the casement frame: a deep outer frame, a centre mullion, and two leaves each of six small panes)
      [[0, 0.53, 1.16, 0.07], [0, -0.53, 1.16, 0.07]].forEach(function (f) { lbP(new THREE.BoxGeometry(f[2], f[3], 0.1), lbWood, wx + f[0], WY + f[1], WZ + 0.05); });
      [-0.545, 0.545].forEach(function (fx) { lbP(new THREE.BoxGeometry(0.07, 1.1, 0.1), lbWood, wx + fx, WY, WZ + 0.05); });
      lbP(new THREE.BoxGeometry(0.06, 1.0, 0.09), lbWood, wx, WY, WZ + 0.06);
      [-1, 1].forEach(function (lv) {
        var lx = wx + lv * 0.26;
        [[0, 0.47, 0.46, 0.035], [0, -0.47, 0.46, 0.035]].forEach(function (f) { lbP(new THREE.BoxGeometry(f[2], f[3], 0.05), lbOak, lx + f[0], WY + f[1], WZ + 0.075); });
        [-0.215, 0.215].forEach(function (fx) { lbP(new THREE.BoxGeometry(0.035, 0.96, 0.05), lbOak, lx + fx, WY, WZ + 0.075); });
        lbP(new THREE.BoxGeometry(0.02, 0.92, 0.035), lbOak, lx, WY, WZ + 0.07);
        [-0.155, 0.155].forEach(function (my) { lbP(new THREE.BoxGeometry(0.42, 0.02, 0.035), lbOak, lx, WY + my, WZ + 0.07); });
        lbP(new THREE.SphereGeometry(0.012, 8, 6), lbBrass, wx + lv * 0.05, WY - 0.02, WZ + 0.105); lbP(new THREE.BoxGeometry(0.014, 0.05, 0.008), lbBrass, wx + lv * 0.05, WY - 0.02, WZ + 0.1);   // (a brass catch)
        [0.33, -0.33].forEach(function (hy) { lbP(new THREE.CylinderGeometry(0.008, 0.008, 0.06, 8), lbBlack, wx + lv * 0.505, WY + hy, WZ + 0.105); });   // (hinge knuckles)
      });
      // (the stone surround: quoins up each side, a lintel of three stones with a proud keystone, and a sill on two corbels)
      var qy = 1.02; [0.3, 0.26, 0.3, 0.28].forEach(function (qh, n) { [-1, 1].forEach(function (sd) { var qw = (n + (sd > 0 ? 1 : 0)) % 2 ? 0.2 : 0.15;
        lbP(new THREE.BoxGeometry(qw, qh - 0.016, 0.13), dressed[(n + (sd > 0 ? 1 : 3)) % 4], wx + sd * (0.58 + qw / 2 - 0.01), qy + qh / 2, WZ + 0.05); }); qy += qh; });
      [[-0.48, 0.42, 0.2, 0.13], [0.48, 0.42, 0.2, 0.13], [0, 0.22, 0.26, 0.17]].forEach(function (l, n) { lbP(new THREE.BoxGeometry(l[1] - 0.014, l[2], l[3]), dressed[n], wx + l[0], 2.32 + (n === 2 ? 0.02 : 0), WZ + l[3] / 2 - 0.015); });
      lbP(new THREE.BoxGeometry(1.56, 0.075, 0.34), dressed[2], wx, 1.06, WZ + 0.14); lbP(new THREE.BoxGeometry(1.5, 0.03, 0.03), dressed[1], wx, 1.008, WZ + 0.29);
      [-0.6, 0.6].forEach(function (cx) { lbP(new THREE.BoxGeometry(0.11, 0.13, 0.15), dressed[3], wx + cx, 0.955, WZ + 0.07); lbP(new THREE.BoxGeometry(0.09, 0.05, 0.11), dressed[0], wx + cx, 0.87, WZ + 0.05); });
      winSets[s].forEach(function (it) { lbBottle(labGroup, it[0], wx + it[1], 1.098, WZ + 0.2, it[2], it[3], it[4]); });
    });
    // (the sign over the door, made like the other shops' signs: a dark oak board with the name gilded in gold leaf, a gilded atom
    // and alembic at its ends, in a moulded frame with a gold bead, lit by two brass gooseneck lamps)
    function lbSignPaint(g, w, h, metalOnly) {
      if (metalOnly) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
      else {
        var base = g.createLinearGradient(0, 0, 0, h); base.addColorStop(0, '#5a3420'); base.addColorStop(0.5, '#4a2a18'); base.addColorStop(1, '#3a2012'); g.fillStyle = base; g.fillRect(0, 0, w, h);
        for (var i = 0; i < 300; i++) { var gy = isle2Hash(i * 1.7 + 290) * h, lite = isle2Hash(i * 3.1 + 290) > 0.5;
          g.strokeStyle = lite ? 'rgba(210,150,100,' + (0.04 + isle2Hash(i + 9) * 0.06) + ')' : 'rgba(20,8,2,' + (0.08 + isle2Hash(i + 11) * 0.1) + ')'; g.lineWidth = 0.6 + isle2Hash(i * 5 + 7) * 1.6;
          g.beginPath(); var x0 = isle2Hash(i * 2.3 + 290) * w * 0.7; g.moveTo(x0, gy); g.bezierCurveTo(x0 + 200, gy + (isle2Hash(i * 7 + 3) - 0.5) * 8, x0 + 420, gy - (isle2Hash(i * 9 + 3) - 0.5) * 8, x0 + 300 + isle2Hash(i * 11 + 3) * 600, gy + (isle2Hash(i * 13 + 3) - 0.5) * 5); g.stroke(); }
        g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, h * 0.5 - 1, w, 2);
        var vig = g.createLinearGradient(0, 0, 0, h); vig.addColorStop(0, 'rgba(0,0,0,0.3)'); vig.addColorStop(0.18, 'rgba(0,0,0,0)'); vig.addColorStop(0.82, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.38)'); g.fillStyle = vig; g.fillRect(0, 0, w, h);
      }
      function gold(y0, y1) { if (metalOnly) return '#fff'; var gg = g.createLinearGradient(0, y0, 0, y1); gg.addColorStop(0, '#fff5c8'); gg.addColorStop(0.3, '#ecc054'); gg.addColorStop(0.55, '#a87824'); gg.addColorStop(0.78, '#f2d06c'); gg.addColorStop(1, '#7e5814'); return gg; }
      function gild(text, x, y, size, italic, spacing, maxW) {         // (gold-leaf letters with a shadow, shrunk if need be to fit maxW)
        var chars, widths, total; if (window.everdawnTranslate) text = window.everdawnTranslate(text);   // (in the player's language, since it's drawn a letter at a time)
        do { g.font = (italic ? 'italic ' : '') + 'bold ' + size + 'px Georgia, serif'; chars = text.split(''); widths = chars.map(function (c) { return g.measureText(c).width + (spacing || 0); }); total = widths.reduce(function (a2, b2) { return a2 + b2; }, 0) - (spacing || 0); size -= 4; } while (total > maxW && size > 20);
        size += 4; g.textBaseline = 'middle'; var cx = x - total / 2;
        chars.forEach(function (c, k) {
          if (!metalOnly) { g.save(); g.shadowColor = 'rgba(0,0,0,0.65)'; g.shadowOffsetX = size * 0.04; g.shadowOffsetY = size * 0.06; g.shadowBlur = size * 0.08; g.fillStyle = '#4a3008'; g.fillText(c, cx + 1.5, y + 2); g.restore(); }
          g.fillStyle = gold(y - size * 0.5, y + size * 0.5); g.fillText(c, cx, y);
          if (!metalOnly) { g.strokeStyle = 'rgba(255,248,215,0.5)'; g.lineWidth = 1; g.strokeText(c, cx - 0.6, y - 1); }
          cx += widths[k];
        });
        return total;
      }
      function rrect(m, r) { g.beginPath(); g.moveTo(m + r, m); g.lineTo(w - m - r, m); g.quadraticCurveTo(w - m, m, w - m, m + r); g.lineTo(w - m, h - m - r); g.quadraticCurveTo(w - m, h - m, w - m - r, h - m); g.lineTo(m + r, h - m); g.quadraticCurveTo(m, h - m, m, h - m - r); g.lineTo(m, m + r); g.quadraticCurveTo(m, m, m + r, m); g.stroke(); }
      g.strokeStyle = metalOnly ? '#fff' : gold(0, h); g.lineWidth = 6; rrect(18, 26); g.lineWidth = 2; rrect(32, 18);
      function atom(cx, cy, s) {                                       // (a gilded atom: three orbits and a glowing nucleus)
        g.save(); g.translate(cx, cy); g.strokeStyle = metalOnly ? '#fff' : gold(-s, s); g.lineWidth = s * 0.09;
        for (var i = 0; i < 3; i++) { g.save(); g.rotate(i * Math.PI / 3 + 0.3); g.beginPath(); g.ellipse(0, 0, s, s * 0.36, 0, 0, Math.PI * 2); g.stroke(); g.fillStyle = metalOnly ? '#fff' : gold(-s, s); g.beginPath(); g.arc(s, 0, s * 0.09, 0, Math.PI * 2); g.fill(); g.restore(); }
        g.fillStyle = metalOnly ? '#fff' : gold(-s * 0.2, s * 0.2); g.beginPath(); g.arc(0, 0, s * 0.2, 0, Math.PI * 2); g.fill();
        if (!metalOnly) { g.fillStyle = 'rgba(255,250,225,0.6)'; g.beginPath(); g.arc(-s * 0.06, -s * 0.06, s * 0.07, 0, Math.PI * 2); g.fill(); }
        g.restore();
      }
      function alembic(cx, cy, s) {                                    // (a gilded alembic: a round still with its beak bending down to a little flask)
        g.save(); g.translate(cx, cy); g.fillStyle = metalOnly ? '#fff' : gold(-s, s); g.strokeStyle = g.fillStyle;
        g.beginPath(); g.arc(-s * 0.25, s * 0.3, s * 0.5, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.moveTo(-s * 0.45, -s * 0.12); g.quadraticCurveTo(-s * 0.4, -s * 0.75, -s * 0.05, -s * 0.72); g.quadraticCurveTo(s * 0.12, -s * 0.7, s * 0.05, -s * 0.12); g.fill();   // (the head)
        g.lineWidth = s * 0.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(-s * 0.05, -s * 0.62); g.quadraticCurveTo(s * 0.5, -s * 0.6, s * 0.72, s * 0.1); g.stroke();   // (the beak)
        g.beginPath(); g.moveTo(s * 0.62, s * 0.2); g.lineTo(s * 0.82, s * 0.2); g.lineTo(s * 0.98, s * 0.72); g.lineTo(s * 0.46, s * 0.72); g.closePath(); g.fill();   // (the receiving flask)
        if (!metalOnly) { g.fillStyle = 'rgba(70,40,8,0.55)'; g.beginPath(); g.arc(-s * 0.25, s * 0.42, s * 0.3, 0, Math.PI); g.fill(); g.fillStyle = 'rgba(255,250,225,0.55)'; g.beginPath(); g.arc(-s * 0.42, s * 0.12, s * 0.1, 0, Math.PI * 2); g.fill(); }
        g.restore();
      }
      atom(170, h / 2, 96); alembic(w - 175, h / 2 + 2, 96);
      gild('Atom & Alembic', w / 2, h / 2 - 34, 168, true, 2, w - 640);
      var sub = gild('SCIENCE · ALCHEMY · SUPPLIES', w / 2, h / 2 + 108, 42, false, 10, w - 900);
      g.strokeStyle = metalOnly ? '#fff' : '#c99a3a'; g.lineWidth = 3;
      [-1, 1].forEach(function (d) { var ex = w / 2 + d * (sub / 2 + 40);
        g.beginPath(); g.moveTo(ex, h / 2 + 108); g.lineTo(ex + d * 100, h / 2 + 108); g.stroke();
        g.fillStyle = metalOnly ? '#fff' : '#e3b54c'; g.beginPath(); g.moveTo(ex + d * 116, h / 2 + 98); g.lineTo(ex + d * 126, h / 2 + 108); g.lineTo(ex + d * 116, h / 2 + 118); g.lineTo(ex + d * 106, h / 2 + 108); g.closePath(); g.fill(); });
    }
    var lbSignTex = paintTexture(2048, 360, function (g, w, h) { lbSignPaint(g, w, h, false); }), lbSignMetal = paintTexture(2048, 360, function (g, w, h) { lbSignPaint(g, w, h, true); });
    lbSignTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    lbSignM = new THREE.MeshStandardMaterial({ map: lbSignTex, metalnessMap: lbSignMetal, metalness: 0.35, roughness: 0.4, emissive: 0xe8b54a, emissiveMap: lbSignMetal, emissiveIntensity: 0.25 });
    var SG_Y = H - 0.29, SG_Z = D + 0.2, lbTrim = new THREE.MeshStandardMaterial({ color: 0x3a2012, roughness: 0.55 });
    lbP(new THREE.BoxGeometry(3.0, 0.48, 0.05), new THREE.MeshStandardMaterial({ color: 0x4a2a18, roughness: 0.5 }), 0, SG_Y, SG_Z);
    lbP(new THREE.PlaneGeometry(2.9, 0.43), lbSignM, 0, SG_Y, SG_Z + 0.027).castShadow = false;
    [[0, 0.24, 3.1, 0.05], [0, -0.24, 3.1, 0.05], [-1.525, 0, 0.05, 0.53], [1.525, 0, 0.05, 0.53]].forEach(function (f) {   // (the moulded frame with a gold bead)
      lbP(new THREE.BoxGeometry(f[2], f[3], 0.07), lbTrim, f[0], SG_Y + f[1], SG_Z + 0.035);
      lbP(new THREE.BoxGeometry(f[2] > 1 ? 3.0 : 0.016, f[3] > 0.1 ? 0.43 : 0.016, 0.02), houseMats.gold, f[0] * 0.985, SG_Y + f[1] * 0.9, SG_Z + 0.065);
    });
    lbSignLampIn = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xffd9a0, emissiveIntensity: 0.2, side: THREE.BackSide });
    [-1.05, 1.05].forEach(function (lx) {                              // (brass gooseneck lamps lighting the sign)
      var y0 = SG_Y + 0.265, z0 = SG_Z + 0.05;
      lbP(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12), houseMats.gold, lx, y0 + 0.01, z0);
      var neck = new THREE.CatmullRomCurve3([new THREE.Vector3(lx, y0, z0), new THREE.Vector3(lx, y0 + 0.09, z0 + 0.05), new THREE.Vector3(lx, y0 + 0.12, z0 + 0.2), new THREE.Vector3(lx, y0 + 0.07, z0 + 0.32)]);
      lbP(new THREE.TubeGeometry(neck, 14, 0.011, 6), houseMats.gold, 0, 0, 0);
      lbP(new THREE.ConeGeometry(0.065, 0.075, 14, 1, true), houseMats.gold, lx, y0 + 0.03, z0 + 0.32, 0.5, 0, 0); lbP(new THREE.ConeGeometry(0.061, 0.071, 14, 1, true), lbSignLampIn, lx, y0 + 0.03, z0 + 0.32, 0.5, 0, 0);
      var lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffd08a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); lg.position.set(lx, y0 - 0.02, z0 + 0.3); lg.scale.set(0.55, 0.55, 1); G.add(lg); lbSignGlows.push(lg);
    });
    // (a few things outside: an oak barrel and what sits on it, a crate, and a potted fern)
    (function () {
      var BR = new THREE.Group(); BR.position.set(-W + 0.6, 0, D + 0.75); BR.rotation.y = 0.4; G.add(BR);
      function P(geo, m, x, y, z, rx, ry, rz) { return lbP(geo, m, x, y, z, rx, ry, rz, BR); }
      function rad(y) { var u = (y - 0.38) / 0.38; return 0.285 + 0.05 * (1 - u * u); }   // (the barrel's bulge)
      var stTex = cpTex(512, 128, function (g, w, h) {                  // (sixteen staves: grain, seams, a little wear)
        for (var i = 0; i < 16; i++) { var x0 = i * w / 16, tone = [0, 8, -6, 4, -10, 6, -2, 10][i % 8]; g.fillStyle = 'rgb(' + (140 + tone) + ',' + (94 + tone * 0.7) + ',' + (56 + tone * 0.4) + ')'; g.fillRect(x0, 0, w / 16, h);
          for (var k = 0; k < 7; k++) { g.strokeStyle = k % 2 ? 'rgba(70,40,18,0.3)' : 'rgba(200,150,100,0.2)'; g.lineWidth = 1; g.beginPath(); var gx = x0 + 3 + (k * 5 + i * 3) % 26; g.moveTo(gx, 0); for (var y = 0; y <= h; y += 8) g.lineTo(gx + Math.sin(y * 0.05 + i + k) * 1.5, y); g.stroke(); }
          g.fillStyle = '#2c1a0e'; g.fillRect(x0, 0, 2, h); g.fillStyle = 'rgba(255,220,170,0.15)'; g.fillRect(x0 + 2, 0, 2, h); }
        var dg = g.createLinearGradient(0, h, 0, h * 0.75); dg.addColorStop(0, 'rgba(30,20,10,0.5)'); dg.addColorStop(1, 'rgba(30,20,10,0)'); g.fillStyle = dg; g.fillRect(0, h * 0.75, w, h * 0.25);
      });
      var stM = new THREE.MeshStandardMaterial({ map: stTex, bumpMap: stTex, bumpScale: 0.01, roughness: 0.75, side: THREE.DoubleSide });
      var prof = []; for (var k = 0; k <= 14; k++) { var py = k / 14 * 0.76; prof.push([rad(py), py]); }
      P(lbLathe(prof, 32), stM, 0, 0, 0);
      P(new THREE.CylinderGeometry(rad(0.72) - 0.012, rad(0.72) - 0.012, 0.012, 28), lbOak, 0, 0.72, 0); P(new THREE.CylinderGeometry(rad(0.02) - 0.01, rad(0.02) - 0.01, 0.01, 28), lbOak, 0, 0.02, 0);
      [[-0.09, 0.005], [0.0, 0.004], [0.09, 0.006]].forEach(function (sq) { P(new THREE.BoxGeometry(0.004, 0.003, (rad(0.72) - 0.02) * 2 * Math.cos(Math.asin(sq[0] / rad(0.72)))), rMat(0x2c1a0e), sq[0], 0.727, 0); });   // (the seams of the lid's boards)
      P(new THREE.TorusGeometry(rad(0.76) - 0.006, 0.01, 6, 32), lbOak, 0, 0.758, 0, Math.PI / 2, 0, 0);
      [0.07, 0.2, 0.56, 0.69].forEach(function (hy) {                     // (four iron hoops, riveted)
        P(new THREE.CylinderGeometry(rad(hy + 0.022) + 0.006, rad(hy - 0.022) + 0.006, 0.044, 32, 1, true), lbBlack, 0, hy, 0);
        for (var r = 0; r < 8; r++) { var ra = r / 8 * Math.PI * 2 + hy * 3; P(new THREE.SphereGeometry(0.0065, 6, 5), lbBlack, Math.sin(ra) * (rad(hy) + 0.009), hy, Math.cos(ra) * (rad(hy) + 0.009)); }
      });
      P(new THREE.CylinderGeometry(0.026, 0.022, 0.03, 12), lbCork, 0, 0.38, rad(0.38) + 0.01, Math.PI / 2, 0, 0);   // (the bung, corked)
      var sp = new THREE.Group(); sp.position.set(0, 0.14, rad(0.14)); BR.add(sp);   // (a brass tap near the foot, a drip of potion hanging from it)
      lbP(new THREE.CylinderGeometry(0.024, 0.026, 0.02, 12), lbBrass, 0, 0, 0.004, Math.PI / 2, 0, 0, sp); lbP(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 10), lbBrass, 0, 0, 0.045, Math.PI / 2, 0, 0, sp);
      lbP(new THREE.CylinderGeometry(0.011, 0.008, 0.035, 10), lbBrass, 0, -0.016, 0.078, 0, 0, 0, sp); lbP(new THREE.BoxGeometry(0.05, 0.008, 0.012), lbBrass, 0, 0.022, 0.05, 0, 0, 0, sp);
      lbP(new THREE.SphereGeometry(0.008, 8, 6), lbBrass, -0.026, 0.022, 0.05, 0, 0, 0, sp); lbP(new THREE.SphereGeometry(0.008, 8, 6), lbBrass, 0.026, 0.022, 0.05, 0, 0, 0, sp);
      var drip = lbP(new THREE.SphereGeometry(0.007, 8, 6), lbLiquid(0x5affb0), 0, -0.04, 0.078, 0, 0, 0, sp); drip.scale.set(1, 1.5, 1);
      // (on the lid: a square of linen, a tall potion and a round flask, a jar of crystals, a stub of candle on a brass dish, and a scroll)
      var linen = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#e9dfc8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,120,80,0.25)'; for (var i = 0; i < w; i += 3) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } g.strokeStyle = '#8a3a4a'; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10); });
      P(new THREE.BoxGeometry(0.34, 0.004, 0.34), new THREE.MeshStandardMaterial({ map: linen, roughness: 1 }), 0.02, 0.729, 0.01, 0, 0.5, 0);
      lbBottle(BR, 'potion', -0.09, 0.731, -0.06, 0x5affb0, 0, 1.15); lbBottle(BR, 'flask', 0.1, 0.731, -0.05, 0xff5a9a, 0, 1.05); lbBottle(BR, 'jar', -0.02, 0.731, 0.12, 0x7ab8ff, 5, 0.9);
      P(new THREE.CylinderGeometry(0.04, 0.034, 0.008, 18), lbBrass, 0.14, 0.735, 0.12); P(new THREE.TorusGeometry(0.012, 0.003, 5, 10, Math.PI), lbBrass, 0.182, 0.74, 0.12, 0, 0, 0);
      var wax = rMat(0xf4ead2, { roughness: 0.55 }); P(new THREE.CylinderGeometry(0.015, 0.017, 0.035, 12), wax, 0.14, 0.756, 0.12); P(new THREE.SphereGeometry(0.006, 6, 5), wax, 0.152, 0.748, 0.126).scale.set(1, 1.8, 1);
      P(new THREE.CylinderGeometry(0.0013, 0.0013, 0.008, 4), rMat(0x111111), 0.14, 0.777, 0.12);
      var scroll = new THREE.Group(); scroll.position.set(-0.17, 0.745, 0.1); scroll.rotation.y = 0.9; BR.add(scroll);
      lbP(new THREE.CylinderGeometry(0.014, 0.014, 0.14, 12), rMat(0xe6d6ae, { roughness: 0.9 }), 0, 0, 0, 0, 0, Math.PI / 2, scroll); lbP(new THREE.TorusGeometry(0.0145, 0.002, 4, 12), rMat(0x8a3a4a), 0, 0, 0, 0, Math.PI / 2, 0, scroll);
      lbP(new THREE.SphereGeometry(0.007, 8, 6), rMat(0xa02a2a, { roughness: 0.4 }), 0, 0, 0.015, 0, 0, 0, scroll);
    })();
    // (by the right-hand window: a slatted wooden crate packed with straw, and on it a terracotta pot with a big aloe)
    (function () {
      var CR = new THREE.Group(); CR.position.set(W - 0.7, 0, D + 0.75); CR.rotation.y = 0.3; G.add(CR);
      function P(geo, m, x, y, z, rx, ry, rz) { return lbP(geo, m, x, y, z, rx, ry, rz, CR); }
      var grain = cpTex(256, 64, function (g, w, h) { g.fillStyle = '#a8794a'; g.fillRect(0, 0, w, h);
        for (var k = 0; k < 14; k++) { g.strokeStyle = k % 2 ? 'rgba(90,55,25,0.3)' : 'rgba(220,180,130,0.25)'; g.lineWidth = 1 + (k % 3 === 0); g.beginPath(); var gy = 3 + (k * 17) % (h - 6); g.moveTo(0, gy); for (var x = 0; x <= w; x += 8) g.lineTo(x, gy + Math.sin(x * 0.03 + k) * 1.6); g.stroke(); }
        g.fillStyle = 'rgba(60,35,15,0.5)'; g.beginPath(); g.ellipse(170, 30, 6, 3, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(40,20,8,0.35)'; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2); });
      var slatM = new THREE.MeshStandardMaterial({ map: grain, bumpMap: grain, bumpScale: 0.006, roughness: 0.85 }), postM = rMat(0x7a5232, { roughness: 0.8 });
      var CW = 0.6, CH = 0.45, CD = 0.5;
      P(new THREE.BoxGeometry(CW - 0.06, CH - 0.04, CD - 0.06), rMat(0x1e140c, { roughness: 1 }), 0, CH / 2, 0);   // (the dark inside, seen through the gaps)
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { P(new THREE.BoxGeometry(0.05, CH, 0.05), postM, c[0] * (CW / 2 - 0.025), CH / 2, c[1] * (CD / 2 - 0.025)); });   // (corner posts)
      [0.068, 0.218, 0.368].forEach(function (sy) {                        // (three slats a side, with nails at their ends)
        [-1, 1].forEach(function (sd) {
          P(new THREE.BoxGeometry(CW, 0.12, 0.018), slatM, 0, sy, sd * (CD / 2 + 0.004)); P(new THREE.BoxGeometry(0.018, 0.12, CD - 0.02), slatM, sd * (CW / 2 + 0.004), sy, 0, 0, 0, 0);
          [-1, 1].forEach(function (e) { [-0.03, 0.03].forEach(function (ny) { P(new THREE.SphereGeometry(0.006, 6, 4), lbBlack, e * (CW / 2 - 0.025), sy + ny, sd * (CD / 2 + 0.014)); P(new THREE.SphereGeometry(0.006, 6, 4), lbBlack, sd * (CW / 2 + 0.014), sy + ny, e * (CD / 2 - 0.025)); }); });
        });
      });
      [-0.21, -0.07, 0.07, 0.21].forEach(function (lx, i) { P(new THREE.BoxGeometry(0.125, 0.018, CD + 0.02), slatM, lx, CH + 0.009, 0, 0, 0, i % 2 ? 0.01 : -0.008); });   // (the lid)
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {          // (iron corner straps)
        P(new THREE.BoxGeometry(0.08, 0.1, 0.006), lbBlack, c[0] * (CW / 2 - 0.035), CH - 0.05, c[1] * (CD / 2 + 0.016)); P(new THREE.BoxGeometry(0.006, 0.1, 0.08), lbBlack, c[0] * (CW / 2 + 0.016), CH - 0.05, c[1] * (CD / 2 - 0.035));
        P(new THREE.BoxGeometry(0.08, 0.1, 0.006), lbBlack, c[0] * (CW / 2 - 0.035), 0.05, c[1] * (CD / 2 + 0.016)); P(new THREE.BoxGeometry(0.006, 0.1, 0.08), lbBlack, c[0] * (CW / 2 + 0.016), 0.05, c[1] * (CD / 2 - 0.035));
      });
      var stencil = cpTex(128, 64, function (g, w, h) { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(40,28,40,0.75)'; g.fillStyle = 'rgba(40,28,40,0.75)'; g.lineWidth = 4;   // (a stencilled flask and stars, a little worn)
        g.beginPath(); g.moveTo(56, 10); g.lineTo(56, 26); g.lineTo(42, 52); g.lineTo(86, 52); g.lineTo(72, 26); g.lineTo(72, 10); g.stroke(); g.fillRect(52, 8, 24, 4); g.fillRect(46, 40, 36, 10);
        [[20, 22], [104, 18], [110, 44], [16, 46]].forEach(function (st) { g.save(); g.translate(st[0], st[1]); g.beginPath(); for (var i = 0; i < 10; i++) { var r = i % 2 ? 3 : 7, a = i * Math.PI / 5 - Math.PI / 2; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.fill(); g.restore(); });
        g.globalCompositeOperation = 'destination-out'; for (var k = 0; k < 120; k++) { g.fillRect((k * 37) % w, (k * 23) % h, 2, 2); } });
      P(new THREE.PlaneGeometry(0.26, 0.13), new THREE.MeshStandardMaterial({ map: stencil, transparent: true, roughness: 0.9, depthWrite: false }), 0, 0.218, CD / 2 + 0.0145).renderOrder = 1;
      var straw = rMat(0xe2c46a, { roughness: 0.9 });                     // (straw poking out between the slats)
      [[0.2, 0.29, 1, 0.5], [-0.12, 0.29, 1, -0.6], [0.05, 0.144, 1, 0.9], [-0.26, 0.144, 1, -0.3], [0.31, 0.29, 0, 0.4], [-0.31, 0.144, 0, -0.7], [0.1, 0.44, 1, 1.2], [-0.18, 0.44, -1, -0.5]].forEach(function (st, i) {
        for (var k = 0; k < 3; k++) { var len = 0.05 + ((i + k) % 3) * 0.02, sx = st[2] ? st[0] + k * 0.012 : st[0] + (st[0] > 0 ? 0.01 : -0.01), sz = st[2] ? st[2] * (CD / 2 + 0.01) : (k - 1) * 0.02;
          P(new THREE.CylinderGeometry(0.0018, 0.0012, len, 4), straw, sx, st[1] + k * 0.004, sz, st[2] ? st[2] * (1.2 + k * 0.15) : 0, 0, st[3] + k * 0.3); } });
      // (the pot: a rolled-rim terracotta pot, mottled and bloomed white with age, mossy at the foot, on a matching saucer)
      var potTex = cpTex(256, 128, function (g, w, h) { g.fillStyle = '#b4613c'; g.fillRect(0, 0, w, h);
        for (var k = 0; k < 260; k++) { var x = (k * 53) % w, y = (k * 29) % h, r = 2 + (k % 5); g.fillStyle = k % 3 ? 'rgba(150,70,40,0.25)' : 'rgba(210,130,90,0.22)'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
        var bl = g.createLinearGradient(0, h, 0, h * 0.6); bl.addColorStop(0, 'rgba(240,235,220,0.55)'); bl.addColorStop(1, 'rgba(240,235,220,0)'); g.fillStyle = bl; g.fillRect(0, h * 0.6, w, h * 0.4);
        for (var m = 0; m < 40; m++) { g.fillStyle = 'rgba(70,110,40,' + (0.25 + (m % 3) * 0.12) + ')'; g.beginPath(); g.arc((m * 71) % w, 4 + (m * 7) % 18, 3 + (m % 4) * 2, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = 'rgba(60,25,10,0.25)'; g.fillRect(0, h * 0.8, w, 3); });
      var potM = new THREE.MeshStandardMaterial({ map: potTex, bumpMap: potTex, bumpScale: 0.006, roughness: 0.95, side: THREE.DoubleSide });
      var PB = CH + 0.018;
      P(lbLathe([[0, 0], [0.17, 0], [0.19, 0.008], [0.2, 0.035], [0.188, 0.038], [0.17, 0.016], [0, 0.016]], 32), potM, 0, PB, 0);
      P(lbLathe([[0, 0.012], [0.135, 0.012], [0.15, 0.03], [0.185, 0.3], [0.19, 0.31], [0.215, 0.314], [0.222, 0.33], [0.222, 0.375], [0.214, 0.386], [0.2, 0.386], [0.196, 0.36], [0.19, 0.345], [0, 0.345]], 36), potM, 0, PB, 0);
      var soilTex = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#3b2616'; g.fillRect(0, 0, w, h); for (var k = 0; k < 500; k++) { g.fillStyle = ['rgba(20,12,6,0.6)', 'rgba(90,60,35,0.5)', 'rgba(140,110,80,0.4)'][k % 3]; g.fillRect((k * 37) % w, (k * 61) % h, 1 + k % 3, 1 + k % 2); } });
      P(new THREE.CircleGeometry(0.195, 32), new THREE.MeshStandardMaterial({ map: soilTex, roughness: 1 }), 0, PB + 0.35, 0, -Math.PI / 2, 0, 0);
      var pebM = [0xcfc8bc, 0xa9a196, 0xe2dccf].map(function (c) { return rMat(c, { roughness: 0.7 }); });
      for (var pb = 0; pb < 16; pb++) { var pa = pb * 2.39, pr = 0.09 + (pb % 4) * 0.025; P(new THREE.DodecahedronGeometry(0.011 + (pb % 3) * 0.004), pebM[pb % 3], Math.cos(pa) * pr, PB + 0.355, Math.sin(pa) * pr, pb, pb * 0.5, 0).scale.set(1, 0.6, 1); }
      [[0.13, 0.4], [-0.1, 2.2], [0.05, 4.1]].forEach(function (ms) { P(new THREE.SphereGeometry(0.035, 10, 6), rMat(0x4f7a32, { roughness: 1 }), Math.cos(ms[1]) * ms[0], PB + 0.352, Math.sin(ms[1]) * ms[0]).scale.set(1, 0.25, 0.8); });
      // (the aloe: three rings of thick, toothed, speckled leaves arching out from the middle, reddening at the tips)
      var spec = cpTex(64, 256, function (g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (var k = 0; k < 90; k++) { g.fillStyle = 'rgba(235,250,225,0.9)'; g.beginPath(); g.ellipse((k * 23) % w, 20 + (k * 41) % (h - 60), 2 + k % 2, 1.2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(120,150,110,0.35)'; g.fillRect((k * 29) % w, (k * 13) % h, 1, 3); } });
      spec.wrapS = spec.wrapT = THREE.RepeatWrapping;
      var aloeM = new THREE.MeshStandardMaterial({ map: spec, vertexColors: true, roughness: 0.45, side: THREE.DoubleSide });
      function leafGeo(len, wid, th, tilt, bend) {
        var n = 18, pos = [], col = [], uv = [], idx = [], c0 = new THREE.Color(0xc6dfa8), c1 = new THREE.Color(0x5c9658), c2 = new THREE.Color(0x4a7c4a), c3 = new THREE.Color(0xa8603e);
        var y = 0, z = 0;
        for (var i = 0; i <= n; i++) {
          var t = i / n, a = tilt + bend * t * t, dy = Math.cos(a), dz = Math.sin(a), ny = -dz, nz = dy;   // (n is the leaf's outer, under side)
          var w = wid * Math.pow(1 - t, 0.75) * (i % 2 && t > 0.12 && t < 0.92 ? 1.14 : 0.97) + 0.001, h2 = th * Math.pow(1 - t, 0.7) + 0.0008;
          [[-w, -h2 * 0.5], [0, -h2 * 0.15], [w, -h2 * 0.5], [0, h2 * 0.55]].forEach(function (cs, k) {   // (edge, a shallow groove on top, edge, the rounded back)
            pos.push(cs[0], y + ny * cs[1], z + nz * cs[1]); uv.push(k === 1 || k === 3 ? 0.5 : k ? 1 : 0, t * 2);
            var c = t < 0.35 ? c0.clone().lerp(c1, t / 0.35) : t < 0.8 ? c1.clone().lerp(c2, (t - 0.35) / 0.45) : c2.clone().lerp(c3, (t - 0.8) / 0.2); if (k === 3) c.multiplyScalar(0.85); col.push(c.r, c.g, c.b);
          });
          y += dy * len / n; z += dz * len / n;
        }
        for (var j = 0; j < n; j++) { var A = j * 4, Bq = A + 4; [[0, 1], [1, 2], [2, 3], [3, 0]].forEach(function (e) { idx.push(A + e[0], Bq + e[0], Bq + e[1], A + e[0], Bq + e[1], A + e[1]); }); }
        var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals(); return geo;
      }
      var AL = new THREE.Group(); AL.position.set(0, PB + 0.345, 0); CR.add(AL);
      [[9, 0.44, 0.05, 0.7, 1.0, 0.05, 0], [7, 0.38, 0.045, 0.35, 0.9, 0.035, 0.4], [5, 0.3, 0.038, 0.12, 0.6, 0.02, 0.9], [3, 0.2, 0.03, 0.02, 0.3, 0.008, 1.7]].forEach(function (ring) {
        for (var l = 0; l < ring[0]; l++) { var ang = l / ring[0] * Math.PI * 2 + ring[6], lg = new THREE.Group(); lg.rotation.y = ang; AL.add(lg);
          var lm = lbP(leafGeo(ring[1] * (0.9 + (l % 3) * 0.07), ring[2], ring[2] * 0.55, ring[3] + (l % 2) * 0.08, ring[4]), aloeM, 0, 0, ring[5], 0, 0, 0, lg); lm.rotation.z = ((l * 7) % 5 - 2) * 0.03; }
      });
      // (a little wooden plant stake with a parchment tag)
      var stake = new THREE.Group(); stake.position.set(0.12, PB + 0.345, 0.11); stake.rotation.set(0.1, -0.4, -0.08); CR.add(stake);
      lbP(new THREE.BoxGeometry(0.012, 0.16, 0.006), lbOak, 0, 0.06, 0, 0, 0, 0, stake); lbP(new THREE.BoxGeometry(0.06, 0.04, 0.003), lbLabels[1], 0, 0.13, 0.005, 0, 0, 0, stake);
      lbP(new THREE.TorusGeometry(0.006, 0.0015, 4, 8), lbTwine, 0, 0.152, 0.006, 0, 0, 0, stake);
    })();
    G.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  })(labGroup);
  // (no grass, flowers or pebbles growing up through it or its path; its walls and tower are solid, the doorway open)
  (function () {
    var m4 = new THREE.Matrix4(), v = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    scene.traverse(function (o) {
      if (!o.isInstancedMesh) return; for (var up = o.parent; up; up = up.parent) if (up === labGroup) return;
      o.updateWorldMatrix(true, false); var changed = false;
      for (var i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); v.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld);
        if (Math.abs(v.x - LAB_X) < 26 && Math.abs(v.z - LAB_Z) < 20 && (onLabLot(v.x, v.z, 0) || onLabPath(v.x, v.z))) { o.setMatrixAt(i, zero); changed = true; } }
      if (changed) o.instanceMatrix.needsUpdate = true;
    });
    for (var s = solids.length - 1; s >= 0; s--) if (onLabLot(solids[s].x, solids[s].z, 0.3) || onLabPath(solids[s].x, solids[s].z)) solids.splice(s, 1);
    function wall(lx, lz, r) { var p = labWorld(lx, lz); solids.push({ x: p.x, z: p.z, r: r || 0.33 }); }
    for (var x = -LAB_HW; x <= LAB_HW + 0.01; x += 0.5) { if (Math.abs(x) > 0.75) wall(x, LAB_HD); wall(x, -LAB_HD); }
    for (var z = -LAB_HD; z <= LAB_HD + 0.01; z += 0.5) [-LAB_HW, LAB_HW].forEach(function (x2) { wall(x2, z); });
    wall(0, 0, 2.6);                                                                  // (inside)
    wall(-LAB_HW + 0.6, LAB_HD + 0.75, 0.35); wall(LAB_HW - 0.7, LAB_HD + 0.75, 0.4);              // (the barrel and the fern)
    layTownPath(lbLine);
  })();
  // ---- inside: a bright, modern laboratory. White panelled walls and gleaming floor ringed with light, light strips along
  // the wall tops, a U of white lab benches in the middle with holographic screens floating over them, tablets and a robotic
  // arm at work; machines along the back wall, a wall of plants growing in lit tubes, and by the big window onto a night
  // city, a row of glass growth chambers. The counter by the door is ready for the shop to come ----
  var labScene = new THREE.Scene(); labScene.background = new THREE.Color(0x1a2130);
  var LBI_X = -1200, LBI_Z = 1000, LBI_W = LAB_HW * 2, LBI_D = LAB_HD * 2, LBI_H = 3.2, LBI_EXIT_Z = LBI_D / 2 - 0.6, inLab = false;
  var labRoom = new THREE.Group(); labRoom.position.set(LBI_X, 0, LBI_Z); labScene.add(labRoom);
  labScene.add(new THREE.HemisphereLight(0xeef4ff, 0x7a889c, 0.5));
  var lbSun = new THREE.DirectionalLight(0xffffff, 0.35); lbSun.position.set(LBI_X - 2, 6, LBI_Z + 4); lbSun.target.position.set(LBI_X, 0, LBI_Z); labScene.add(lbSun); labScene.add(lbSun.target);
  var lbLights = [[-2, 0, 0xe8f2ff], [2, 0, 0xe8f2ff], [0, -1.8, 0x9ae8ff]].map(function (p) { var l = new THREE.PointLight(p[2], 0.45, 9); l.position.set(LBI_X + p[0], 2.8, LBI_Z + p[1]); labScene.add(l); return l; });
  var labSolids = [], lbWalls = [], lbHolo = [], lbArms = [], lbChambers = [], lbBubbles = [], lbDna = null, LB_COUNTER = [2.7, 2.3], LB_COUNTER_W = 1.5;
  (function (R) {
    var W = LBI_W / 2, D = LBI_D / 2, H = LBI_H;
    function p(geo, m, x, y, z, rx, ry, rz, par) { return cpPart(geo, m, x, y, z, rx, ry, rz, par || R); }
    var white = rMat(0xe4e8ee, { roughness: 0.35, metalness: 0.05 }), pale = rMat(0xc8ced8, { roughness: 0.3 }), dark = rMat(0x2a3038, { roughness: 0.4, metalness: 0.3 });
    var lightM = new THREE.MeshBasicMaterial({ color: 0xffffff }), cyanM = new THREE.MeshBasicMaterial({ color: 0x9af2ff });
    var screenTex = function (seed, w, h) { return cpTex(w || 256, h || 160, function (g, cw, ch) {   // (a glowing screen of readouts: graphs, a ring gauge, rows of data)
      g.fillStyle = '#062a3a'; g.fillRect(0, 0, cw, ch); g.strokeStyle = '#4ae8ff'; g.fillStyle = '#4ae8ff'; g.lineWidth = 2; g.strokeRect(4, 4, cw - 8, ch - 8);
      g.beginPath(); for (var x = 12; x < cw * 0.55; x += 4) g.lineTo(x, ch * 0.55 - Math.sin(x * 0.07 + seed) * ch * 0.18 - Math.sin(x * 0.19 + seed * 2) * ch * 0.06); g.stroke();
      g.beginPath(); g.arc(cw * 0.78, ch * 0.4, ch * 0.2, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (0.4 + (seed % 5) / 9)); g.stroke(); g.globalAlpha = 0.3; g.beginPath(); g.arc(cw * 0.78, ch * 0.4, ch * 0.2, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1;
      for (var r = 0; r < 4; r++) { g.globalAlpha = 0.5 + r * 0.1; g.fillRect(12, ch * 0.72 + r * 9, 30 + ((seed * 37 + r * 53) % 120), 4); } g.globalAlpha = 1;
      for (var b = 0; b < 6; b++) g.fillRect(cw * 0.62 + b * 14, ch * 0.9 - ((seed * 17 + b * 29) % 30), 8, (seed * 17 + b * 29) % 30);
    }); };
    // (the floor: pale and gleaming, ringed by a line of light)
    p(new THREE.PlaneGeometry(LBI_W, LBI_D), rMat(0x9aa4b4, { roughness: 0.3, metalness: 0.25, envMap: rubyEnv, envMapIntensity: 0.6 }), 0, 0, 0, -Math.PI / 2, 0, 0);
    [[0, -D + 0.55, LBI_W - 1.1, 0.04], [0, D - 0.55, LBI_W - 1.1, 0.04], [-W + 0.55, 0, 0.04, LBI_D - 1.1], [W - 0.55, 0, 0.04, LBI_D - 1.1]].forEach(function (s) { p(new THREE.BoxGeometry(s[2], 0.01, s[3]), lightM, s[0], 0.006, s[1]); });
    // (the walls: white panels, each with a glowing strip along its top; the one between you and the camera steps aside)
    var panel = new THREE.MeshStandardMaterial({ roughness: 0.4, map: lbTex(256, 256, function (g, w, h) { g.fillStyle = '#dde2ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#aeb6c4'; g.fillRect(0, 0, 3, h); g.fillRect(0, h - 3, w, 3); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(4, 0, 4, h); }, 4, 1) });
    [[0, -D, 0, LBI_W], [0, D, Math.PI, LBI_W], [-W, 0, Math.PI / 2, LBI_D], [W, 0, -Math.PI / 2, LBI_D]].forEach(function (w) {
      var g = new THREE.Group(); g.position.set(w[0], 0, w[1]); g.rotation.y = w[2]; R.add(g);
      p(new THREE.PlaneGeometry(w[3], H), panel, 0, H / 2, 0, 0, 0, 0, g);
      p(new THREE.BoxGeometry(w[3] - 0.4, 0.05, 0.05), lightM, 0, H - 0.35, 0.05, 0, 0, 0, g); p(new THREE.BoxGeometry(w[3], 0.12, 0.06), pale, 0, 0.06, 0.03, 0, 0, 0, g);
      lbWalls.push({ g: g, n: w[1] ? new THREE.Vector3(0, 0, w[1] < 0 ? -1 : 1) : new THREE.Vector3(w[0] < 0 ? -1 : 1, 0, 0), d: w[1] ? D : W });
    });
    // (the lab benches in the middle, a U open toward the door: white cabinets on a dark plinth with a glow beneath, drawer
    // and door fronts with brushed-steel handles, and pale tops with a glowing edge under the lip)
    var front = rMat(0xf1f4f8, { roughness: 0.3, metalness: 0.05 }), steel = rMat(0xc8ccd2, { metalness: 0.9, roughness: 0.25, envMap: rubyEnv, envMapIntensity: 1.2 });
    var topM = rMat(0xd6dbe3, { roughness: 0.22, metalness: 0.05, envMap: rubyEnv, envMapIntensity: 0.35 }), glowEdge = new THREE.MeshBasicMaterial({ color: 0x7ae8ff });
    var glassL = new THREE.MeshStandardMaterial({ color: 0xeef6ff, transparent: true, opacity: 0.28, roughness: 0.04, metalness: 0.1, envMap: rubyEnv, envMapIntensity: 2.2, side: THREE.DoubleSide, depthWrite: false });
    function gl(geo, x, y, z, par, rx, ry, rz) { var o = p(geo, glassL, x, y, z, rx, ry, rz, par); o.renderOrder = 2; o.castShadow = false; return o; }
    function bench(x, z, lx, lz, lift) {
      var along = lx > lz, L = along ? lx : lz, T = along ? lz : lx, ty = 0.84 + (lift || 0);
      p(new THREE.BoxGeometry(lx - 0.04, 0.72, lz - 0.04), white, x, 0.44, z);
      p(new THREE.BoxGeometry(lx - 0.14, 0.08, lz - 0.14), dark, x, 0.04, z);
      [-1, 1].forEach(function (sd) { if (along) p(new THREE.BoxGeometry(lx - 0.16, 0.012, 0.012), glowEdge, x, 0.01, z + sd * (lz / 2 - 0.07)); else p(new THREE.BoxGeometry(0.012, 0.012, lz - 0.16), glowEdge, x + sd * (lx / 2 - 0.07), 0.01, z); });
      p(new THREE.BoxGeometry(lx + 0.08, 0.04, lz + 0.08), topM, x, ty, z); p(new THREE.BoxGeometry(lx + 0.02, 0.012, lz + 0.02), white, x, ty - 0.026, z);
      [-1, 1].forEach(function (sd) { if (along) p(new THREE.BoxGeometry(lx, 0.008, 0.008), glowEdge, x, ty - 0.03, z + sd * (lz / 2 + 0.012)); else p(new THREE.BoxGeometry(0.008, 0.008, lz), glowEdge, x + sd * (lx / 2 + 0.012), ty - 0.03, z); });
      var n = Math.floor(L / 0.55), cw = L / n;
      for (var i = 0; i < n; i++) { var o = -L / 2 + cw / 2 + i * cw;
        [-1, 1].forEach(function (sd) {
          var fz = sd * (T / 2 - 0.02 + 0.009);
          function panel(py, ph, vertical) {                               // (a drawer or door front, with its handle)
            if (along) { p(new THREE.BoxGeometry(cw - 0.03, ph - 0.025, 0.018), front, x + o, py, z + fz); }
            else { p(new THREE.BoxGeometry(0.018, ph - 0.025, cw - 0.03), front, x + fz, py, z + o); }
            var hy = vertical ? py : py + ph / 2 - 0.05, hl = vertical ? 0.2 : cw * 0.45;
            if (along) { p(new THREE.BoxGeometry(vertical ? 0.014 : hl, vertical ? hl : 0.014, 0.014), steel, x + o + (vertical ? (i % 2 ? -1 : 1) * (cw / 2 - 0.06) : 0), hy, z + fz + sd * 0.02); }
            else { p(new THREE.BoxGeometry(0.014, vertical ? hl : 0.014, vertical ? 0.014 : hl), steel, x + fz + sd * 0.02, hy, z + o + (vertical ? (i % 2 ? -1 : 1) * (cw / 2 - 0.06) : 0)); }
          }
          if ((i + (sd > 0 ? 1 : 0)) % 3 === 2) panel(0.44, 0.72, true);   // (a tall cupboard door)
          else { panel(0.715, 0.17, false); panel(0.54, 0.18, false); panel(0.255, 0.39, false); }   // (three drawers, the bottom one deep)
        });
      }
      labSolids.push.apply(labSolids, (function () { var a = []; for (var t = -L / 2 + 0.4; t <= L / 2 - 0.3; t += 0.6) a.push(along ? [x + t, z, lz / 2 + 0.05] : [x, z + t, lx / 2 + 0.05]); return a; })());
    }
    bench(0, -0.7, 3.6, 0.9); bench(-1.35, 0.57, 0.9, 1.56, 0.0015); bench(1.35, 0.57, 0.9, 1.56, 0.0015);
    var TY = 0.86;                                                      // (the height of the bench tops)
    // (a service spine along the back bench: a raised glass-edged shelf on slim posts with a strip of sockets, reagent bottles on it)
    p(new THREE.BoxGeometry(3.2, 0.1, 0.1), white, 0, TY + 0.05, -1.02); p(new THREE.BoxGeometry(3.1, 0.004, 0.02), glowEdge, 0, TY + 0.095, -0.966);
    for (var sk = -1.4; sk <= 1.41; sk += 0.4) { p(new THREE.BoxGeometry(0.07, 0.045, 0.006), rMat(0xf8f8f8), sk, TY + 0.05, -0.968); [-0.012, 0.012].forEach(function (dx) { p(new THREE.BoxGeometry(0.006, 0.012, 0.004), dark, sk + dx, TY + 0.05, -0.964); }); p(new THREE.SphereGeometry(0.004, 6, 4), new THREE.MeshBasicMaterial({ color: 0x6aff9a }), sk + 0.028, TY + 0.065, -0.965); }
    [-1.6, -0.5, 0.55, 1.6].forEach(function (px) { p(new THREE.BoxGeometry(0.03, 0.32, 0.03), steel, px, TY + 0.26, -1.04); });
    p(new THREE.BoxGeometry(3.3, 0.025, 0.2), white, 0, TY + 0.42, -1.02); gl(new THREE.BoxGeometry(3.3, 0.06, 0.008), 0, TY + 0.46, -0.92); p(new THREE.BoxGeometry(3.2, 0.006, 0.006), glowEdge, 0, TY + 0.405, -0.925);
    var capCols = [0x2a6ad8, 0xd83a3a, 0x2a6ad8, 0xf0b020, 0x3ab868, 0x2a6ad8, 0xd83a3a, 0x9a5ad8], liqCols = [0x5ad8ff, 0xff5a7a, 0xffd26a, 0x9aff6a, 0xc08aff, 0x5affc8, 0xff9a4a, 0x7ab8ff];
    function reagent(par, x, y, z, k, sc) {                              // (a lab reagent bottle: round-shouldered glass, a ribbed screw cap, a printed label)
      var B = new THREE.Group(); B.position.set(x, y, z); B.scale.setScalar(sc || 1); par.add(B); var amber = k % 3 === 1;
      var bodyM = amber ? new THREE.MeshStandardMaterial({ color: 0xb8742a, transparent: true, opacity: 0.6, roughness: 0.05, envMap: rubyEnv, envMapIntensity: 2, depthWrite: false }) : glassL;
      var gb = p(lbLathe([[0, 0], [0.034, 0], [0.038, 0.006], [0.038, 0.085], [0.03, 0.105], [0.017, 0.115], [0.017, 0.13], [0, 0.13]], 18), bodyM, 0, 0, 0, 0, 0, 0, B); gb.renderOrder = 2;
      p(new THREE.CylinderGeometry(0.035, 0.035, 0.06 + (k % 3) * 0.012, 16), lbLiquid(liqCols[k % 8]), 0, 0.034 + (k % 3) * 0.006, 0, 0, 0, 0, B);
      p(new THREE.CylinderGeometry(0.02, 0.02, 0.028, 14), rMat(capCols[k % 8], { roughness: 0.45 }), 0, 0.142, 0, 0, 0, 0, B);
      for (var rb = 0; rb < 10; rb++) { var ra = rb / 10 * Math.PI * 2; p(new THREE.BoxGeometry(0.003, 0.024, 0.003), rMat(capCols[k % 8], { roughness: 0.5 }), Math.sin(ra) * 0.0205, 0.142, Math.cos(ra) * 0.0205, 0, ra, 0, B); }
      p(new THREE.CylinderGeometry(0.0385, 0.0385, 0.034, 18, 1, true, -0.9, 1.8), labLabel(k), 0, 0.05, 0, 0, 0, 0, B);
      return B;
    }
    var labLabels = []; function labLabel(k) { k = k % 4; if (!labLabels[k]) labLabels[k] = new THREE.MeshStandardMaterial({ roughness: 0.6, side: THREE.DoubleSide, map: cpTex(128, 48, function (g, w, h) {
      g.fillStyle = '#f6f8fa'; g.fillRect(0, 0, w, h); g.fillStyle = ['#2a6ad8', '#d83a3a', '#f0b020', '#3ab868'][k]; g.fillRect(0, 0, w, 10); g.fillStyle = '#2a3038'; for (var r = 0; r < 3; r++) g.fillRect(8, 16 + r * 9, 40 + (k * 17 + r * 23) % 60, 4);
      g.strokeStyle = '#2a3038'; g.lineWidth = 2; g.beginPath(); g.moveTo(w - 30, 38); g.lineTo(w - 20, 18); g.lineTo(w - 10, 38); g.closePath(); g.stroke(); }) }); return labLabels[k]; }
    [-1.45, -1.25, -1.05, -0.3, -0.12, 0.85, 1.05, 1.25, 1.45].forEach(function (bx, i) { reagent(R, bx, TY + 0.434, -1.03, i, 0.95 + (i % 3) * 0.12); });
    [[-0.75, 0.55], [0.15, 0.4], [0.35, 0.45]].forEach(function (bk, i) { var bg = new THREE.Group(); bg.position.set(bk[0], TY + 0.434, -1.04); bg.rotation.z = i === 2 ? 0.25 : 0; R.add(bg);   // (binders on the shelf)
      for (var j = 0; j < 3; j++) { p(new THREE.BoxGeometry(0.045, 0.26, 0.17), rMat([0x2a6ad8, 0xe8ecf2, 0x3ab868, 0xd83a3a][(i + j) % 4], { roughness: 0.5 }), j * 0.05, 0.13, 0, 0, 0, 0, bg); p(new THREE.BoxGeometry(0.03, 0.05, 0.002), rMat(0xffffff), j * 0.05, 0.18, 0.086, 0, 0, 0, bg); } });
    // (tablets standing on little stands)
    function tablet(x, z, ry, seed) {
      var tg = new THREE.Group(); tg.position.set(x, TY, z); tg.rotation.y = ry; R.add(tg);
      p(new THREE.BoxGeometry(0.1, 0.012, 0.09), white, 0, 0.006, 0, 0, 0, 0, tg); p(new THREE.BoxGeometry(0.08, 0.16, 0.01), white, 0, 0.07, -0.04, 0.35, 0, 0, tg);
      var sl = new THREE.Group(); sl.position.set(0, 0.11, 0.0); sl.rotation.x = -0.32; tg.add(sl);
      p(new THREE.BoxGeometry(0.32, 0.22, 0.012), dark, 0, 0, 0, 0, 0, 0, sl); p(new THREE.PlaneGeometry(0.29, 0.19), new THREE.MeshBasicMaterial({ map: screenTex(seed) }), 0, 0, 0.0065, 0, 0, 0, sl);
      p(new THREE.SphereGeometry(0.004, 6, 4), rMat(0x0a0a0a), 0, 0.1, 0.007, 0, 0, 0, sl); p(new THREE.BoxGeometry(0.33, 0.012, 0.016), steel, 0, -0.112, 0.004, 0, 0, 0, sl);
    }
    tablet(-1.45, -0.48, 0.25, 3); tablet(-1.2, 1.1, 1.9, 4); tablet(1.18, 0.62, -1.7, 6);
    // (holograms, each rising from a projector on the bench: a dark puck with a glowing ring and a faint beam of light)
    var beamM = new THREE.MeshBasicMaterial({ color: 0x7ae8ff, transparent: true, opacity: 0.1, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    [[-1.05, 1.5, -0.82, 0.15, 0], [0.15, 1.55, -0.84, 0, 0], [1.0, 1.5, -0.82, -0.15, 0], [-1.58, 1.4, 0.55, 1.5, 0], [1.58, 1.4, 0.3, -1.5, 0]].forEach(function (h, i) {
      var m = new THREE.MeshBasicMaterial({ map: screenTex(i * 7 + 1), color: 0xbaf6ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
      var pl = p(new THREE.PlaneGeometry(0.72, 0.46), m, h[0], h[1], h[2], 0, h[3], 0); pl.castShadow = false; lbHolo.push({ m: m, k: i });
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (c) { var cg = new THREE.Group(); cg.position.set(h[0], h[1], h[2]); cg.rotation.y = h[3]; R.add(cg);   // (bright corner brackets)
        p(new THREE.BoxGeometry(0.07, 0.006, 0.004), cyanM, c[0] * 0.33, c[1] * 0.23, 0, 0, 0, 0, cg); p(new THREE.BoxGeometry(0.006, 0.07, 0.004), cyanM, c[0] * 0.36, c[1] * 0.2, 0, 0, 0, 0, cg); });
      p(new THREE.CylinderGeometry(0.07, 0.08, 0.025, 24), dark, h[0], TY + 0.012, h[2]); p(new THREE.TorusGeometry(0.055, 0.006, 6, 24), cyanM, h[0], TY + 0.026, h[2], Math.PI / 2, 0, 0); p(new THREE.CircleGeometry(0.025, 16), lightM, h[0], TY + 0.026, h[2], -Math.PI / 2, 0, 0);
      var bh = h[1] - 0.23 - TY - 0.03, bm2 = p(new THREE.CylinderGeometry(0.34, 0.03, bh, 4, 1, true), beamM, h[0], TY + 0.03 + bh / 2, h[2], 0, h[3] + Math.PI / 4, 0); bm2.scale.z = 0.06; bm2.castShadow = false;
    });
    // (a white microscope: base with a light, a curved arm, a stage with clips and a slide, a turret of three objectives, focus
    // knobs and binocular eyepieces)
    var MS = new THREE.Group(); MS.position.set(-0.45, TY, -0.5); R.add(MS);
    p(new THREE.BoxGeometry(0.2, 0.035, 0.24), white, 0, 0.018, 0, 0, 0, 0, MS); p(new THREE.CylinderGeometry(0.1, 0.1, 0.035, 20, 1, false, -Math.PI / 2, Math.PI), white, 0, 0.018, 0.12, 0, 0, 0, MS);
    p(new THREE.CircleGeometry(0.022, 16), lightM, 0, 0.037, 0.06, -Math.PI / 2, 0, 0, MS);
    p(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.03, -0.09), new THREE.Vector3(0, 0.2, -0.1), new THREE.Vector3(0, 0.33, -0.06), new THREE.Vector3(0, 0.37, 0.0)]), 20, 0.026, 10), white, 0, 0, 0, 0, 0, 0, MS);
    p(new THREE.BoxGeometry(0.15, 0.012, 0.13), dark, 0, 0.14, 0.05, 0, 0, 0, MS); gl(new THREE.BoxGeometry(0.075, 0.003, 0.026), 0, 0.148, 0.05, MS); p(new THREE.BoxGeometry(0.01, 0.0035, 0.01), rMat(0xff6a9a, { emissive: 0xff3a7a, emissiveIntensity: 0.5 }), 0, 0.1505, 0.05, 0, 0, 0, MS);
    [-0.03, 0.03].forEach(function (cx2) { p(new THREE.BoxGeometry(0.008, 0.004, 0.05), steel, cx2, 0.149, 0.07, 0, cx2 * 4, 0, MS); });
    [-1, 1].forEach(function (sd) { p(new THREE.CylinderGeometry(0.03, 0.03, 0.018, 18), dark, sd * 0.04, 0.12, -0.08, 0, 0, Math.PI / 2, MS); p(new THREE.CylinderGeometry(0.016, 0.016, 0.014, 14), steel, sd * 0.056, 0.12, -0.08, 0, 0, Math.PI / 2, MS); });
    var tur = new THREE.Group(); tur.position.set(0, 0.3, 0.04); tur.rotation.x = 0.25; MS.add(tur);
    lbP(new THREE.CylinderGeometry(0.04, 0.034, 0.025, 20), steel, 0, 0, 0, 0, 0, 0, tur);
    [[0, 0xd83a3a, 0.06], [2.1, 0xf0c020, 0.075], [4.2, 0x2a6ad8, 0.09]].forEach(function (ob) { var ox = Math.sin(ob[0]) * 0.022, oz = Math.cos(ob[0]) * 0.022;
      lbP(new THREE.CylinderGeometry(0.009, 0.012, ob[2], 12), steel, ox, -ob[2] / 2 - 0.01, oz, 0, 0, 0, tur); lbP(new THREE.CylinderGeometry(0.0125, 0.0125, 0.005, 12), rMat(ob[1]), ox, -0.024, oz, 0, 0, 0, tur); });
    p(new THREE.BoxGeometry(0.07, 0.05, 0.1), white, 0, 0.37, 0.0, 0, 0, 0, MS);
    [-0.02, 0.02].forEach(function (ex) { var eg = new THREE.Group(); eg.position.set(ex, 0.39, -0.01); eg.rotation.x = -0.75; eg.rotation.z = -ex * 4; MS.add(eg);
      lbP(new THREE.CylinderGeometry(0.011, 0.012, 0.08, 12), white, 0, 0.04, 0, 0, 0, 0, eg); lbP(new THREE.CylinderGeometry(0.014, 0.013, 0.02, 12), dark, 0, 0.085, 0, 0, 0, 0, eg); });
    // (a hotplate stirrer with a flask of glowing liquid turning on it, and a centrifuge)
    var HP = new THREE.Group(); HP.position.set(1.42, TY, -0.48); HP.rotation.y = -0.3; R.add(HP);
    lbP(new THREE.BoxGeometry(0.2, 0.07, 0.24), white, 0, 0.035, 0, 0, 0, 0, HP); lbP(new THREE.CylinderGeometry(0.08, 0.08, 0.006, 24), dark, 0, 0.073, -0.02, 0, 0, 0, HP);
    lbP(new THREE.PlaneGeometry(0.08, 0.025), new THREE.MeshBasicMaterial({ map: screenTex(77, 128, 40) }), -0.03, 0.04, 0.1205, 0, 0, 0, HP);
    [0.04, 0.075].forEach(function (kx) { lbP(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 14), dark, kx, 0.035, 0.124, Math.PI / 2, 0, 0, HP); });
    lbBottle(HP, 'erlen', 0, 0.076, -0.02, 0x6affd0, 0, 1.4); lbP(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8), lightM, 0, 0.085, -0.02, 0, 0, Math.PI / 2, HP);   // (the stir bar)
    var CF = new THREE.Group(); CF.position.set(-0.02, TY, -0.48); R.add(CF);
    lbP(new THREE.CylinderGeometry(0.12, 0.13, 0.11, 28), white, 0, 0.055, 0, 0, 0, 0, CF); lbP(new THREE.SphereGeometry(0.105, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.45, roughness: 0.05, envMap: rubyEnv, envMapIntensity: 2, depthWrite: false }), 0, 0.11, 0, 0, 0, 0, CF).scale.y = 0.45;
    lbP(new THREE.TorusGeometry(0.115, 0.005, 6, 28), glowEdge, 0, 0.11, 0, Math.PI / 2, 0, 0, CF); lbP(new THREE.PlaneGeometry(0.07, 0.03), new THREE.MeshBasicMaterial({ map: screenTex(91, 128, 48) }), 0, 0.06, 0.126, -0.08, 0, 0, CF);
    // (beakers with graduations, a stack of petri dishes, a pipette stand, test tubes, and a steel sink with a gooseneck tap)
    var gradTex = cpTex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.85)'; for (var y = 8; y < h - 4; y += 8) g.fillRect(w * 0.45, y, y % 16 ? 6 : 12, 1.5); });
    var gradM = new THREE.MeshBasicMaterial({ map: gradTex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    function beaker(par, x, z, r, hgt, col, fill) {
      gl(lbLathe([[0, 0], [r, 0], [r, hgt], [r + 0.006, hgt + 0.004]], 20), x, TY, z, par);
      p(new THREE.CylinderGeometry(r * 0.94, r * 0.94, hgt * fill, 18), lbLiquid(col), x, TY + hgt * fill / 2 + 0.002, z, 0, 0, 0, par);
      p(new THREE.CylinderGeometry(r + 0.001, r + 0.001, hgt * 0.8, 18, 1, true, -0.5, 1), gradM, x, TY + hgt * 0.45, z, 0, 0, 0, par).renderOrder = 3;
    }
    beaker(R, 1.12, 0.12, 0.045, 0.12, 0x5ad8ff, 0.55); beaker(R, 1.22, 0.02, 0.032, 0.085, 0xff6a9a, 0.4); beaker(R, 1.04, 0.0, 0.026, 0.07, 0xffd26a, 0.6);
    for (var pd = 0; pd < 4; pd++) { gl(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 22), 1.5, TY + 0.008 + pd * 0.015, -0.02 + pd * 0.002, R); p(new THREE.CylinderGeometry(0.045, 0.045, 0.006, 20), rMat([0xf2d08a, 0xf2a8b8, 0xd8f0a8, 0xf2d08a][pd], { roughness: 0.6 }), 1.5, TY + 0.006 + pd * 0.015, -0.02 + pd * 0.002); }
    var PP = new THREE.Group(); PP.position.set(1.48, TY, 0.62); R.add(PP);   // (a pipette stand, three pipettes hanging on it)
    lbP(new THREE.BoxGeometry(0.16, 0.012, 0.1), white, 0, 0.006, 0, 0, 0, 0, PP); lbP(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 10), steel, 0, 0.16, -0.03, 0, 0, 0, PP); lbP(new THREE.BoxGeometry(0.15, 0.015, 0.03), white, 0, 0.28, -0.015, 0, 0, 0, PP);
    [-0.05, 0, 0.05].forEach(function (px, i) { var pg2 = new THREE.Group(); pg2.position.set(px, 0.27, 0.0); PP.add(pg2); lbP(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 10), rMat(0xf2f4f8), 0, -0.04, 0, 0, 0, 0, pg2); lbP(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 10), rMat([0x2a6ad8, 0xf0b020, 0xd83a3a][i]), 0, 0.012, 0, 0, 0, 0, pg2); lbP(new THREE.CylinderGeometry(0.006, 0.002, 0.07, 8), rMat(0xd8dce4), 0, -0.12, 0, 0, 0, 0, pg2); });
    lbBottle(R, 'vials', -1.62, TY, 1.12, 0, 1, 1.6); lbBottle(R, 'vials', -1.62, TY, 0.95, 0, 2, 1.6);
    p(new THREE.BoxGeometry(0.46, 0.006, 0.4), steel, 1.35, TY + 0.003, 1.02); p(new THREE.BoxGeometry(0.4, 0.002, 0.34), rMat(0x3a4048, { metalness: 0.8, roughness: 0.35 }), 1.35, TY + 0.0065, 1.02);   // (the sink)
    p(new THREE.CircleGeometry(0.02, 14), dark, 1.35, TY + 0.008, 1.02, -Math.PI / 2, 0, 0);
    p(new THREE.CylinderGeometry(0.022, 0.026, 0.04, 14), steel, 1.62, TY + 0.02, 1.02); p(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(1.62, TY + 0.03, 1.02), new THREE.Vector3(1.62, TY + 0.3, 1.02), new THREE.Vector3(1.56, TY + 0.38, 1.02), new THREE.Vector3(1.46, TY + 0.33, 1.02), new THREE.Vector3(1.44, TY + 0.26, 1.02)]), 24, 0.012, 10), steel, 0, 0, 0);
    p(new THREE.BoxGeometry(0.012, 0.012, 0.09), steel, 1.62, TY + 0.06, 1.07, 0.4, 0, 0);
    // (robotic arms: a bolted base plate, white segments with glowing joint rings and a cable, and a two-fingered gripper)
    function arm(x, z, ry) {
      var base = new THREE.Group(); base.position.set(x, TY, z); base.rotation.y = ry; R.add(base);
      p(new THREE.CylinderGeometry(0.12, 0.12, 0.012, 24), dark, 0, 0.006, 0, 0, 0, 0, base);
      for (var bo = 0; bo < 6; bo++) { var ba = bo / 6 * Math.PI * 2; p(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 8), steel, Math.sin(ba) * 0.1, 0.015, Math.cos(ba) * 0.1, 0, 0, 0, base); }
      p(new THREE.CylinderGeometry(0.085, 0.1, 0.07, 20), white, 0, 0.047, 0, 0, 0, 0, base); p(new THREE.TorusGeometry(0.087, 0.004, 6, 24), cyanM, 0, 0.075, 0, Math.PI / 2, 0, 0, base);
      var s1 = new THREE.Group(); s1.position.y = 0.09; base.add(s1);
      p(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 16), dark, 0, 0, 0, 0, 0, Math.PI / 2, s1); p(new THREE.TorusGeometry(0.056, 0.004, 6, 18), cyanM, 0.051, 0, 0, 0, Math.PI / 2, 0, s1); p(new THREE.TorusGeometry(0.056, 0.004, 6, 18), cyanM, -0.051, 0, 0, 0, Math.PI / 2, 0, s1);
      p(new THREE.CylinderGeometry(0.035, 0.04, 0.34, 14), white, 0, 0.18, 0, 0, 0, 0, s1); p(new THREE.CylinderGeometry(0.006, 0.006, 0.3, 6), dark, 0.038, 0.18, -0.02, 0, 0, 0, s1);
      var s2 = new THREE.Group(); s2.position.y = 0.36; s1.add(s2);
      p(new THREE.CylinderGeometry(0.045, 0.045, 0.09, 16), dark, 0, 0, 0, 0, 0, Math.PI / 2, s2); p(new THREE.TorusGeometry(0.046, 0.004, 6, 18), cyanM, 0.046, 0, 0, 0, Math.PI / 2, 0, s2);
      p(new THREE.CylinderGeometry(0.028, 0.033, 0.28, 14), white, 0, 0.15, 0, 0, 0, 0, s2); p(new THREE.CylinderGeometry(0.005, 0.005, 0.25, 6), dark, 0.032, 0.15, -0.016, 0, 0, 0, s2);
      var s3 = new THREE.Group(); s3.position.y = 0.3; s2.add(s3);
      p(new THREE.SphereGeometry(0.035, 14, 10), dark, 0, 0, 0, 0, 0, 0, s3); p(new THREE.CylinderGeometry(0.024, 0.028, 0.06, 12), white, 0, 0.04, 0, 0, 0, 0, s3); p(new THREE.TorusGeometry(0.025, 0.004, 6, 16), cyanM, 0, 0.07, 0, Math.PI / 2, 0, 0, s3);
      p(new THREE.BoxGeometry(0.06, 0.016, 0.03), dark, 0, 0.08, 0, 0, 0, 0, s3);
      [-1, 1].forEach(function (f) { p(new THREE.BoxGeometry(0.008, 0.05, 0.022), steel, f * 0.022, 0.11, 0, 0, 0, -f * 0.12, s3); p(new THREE.BoxGeometry(0.01, 0.012, 0.024), dark, f * 0.019, 0.134, 0, 0, 0, 0, s3); });
      p(new THREE.SphereGeometry(0.012, 8, 6), cyanM, 0, 0.1, 0, 0, 0, 0, s3);
      lbArms.push({ b: base, s1: s1, s2: s2, s3: s3, k: lbArms.length, ry: ry });
    }
    arm(0.5, -0.5, 0); arm(-1.35, 0.1, Math.PI / 2);
    // (along the back wall: a long counter built like the benches, and on it a row of lab machines: an incubator of petri dishes,
    // a centrifuge, an analyser with a sample carousel, a bioprinter at work, a PCR machine, and a computer workstation. Above
    // them, glass-fronted wall cupboards of bottles lit from beneath, and between them a big wall screen turning a DNA helix)
    var BZ = -D + 0.32, MY = 0.86;                                       // (the counter's middle and its top)
    bench(0, BZ, LBI_W - 1.4, 0.6);
    function sockets(x) { p(new THREE.BoxGeometry(0.12, 0.07, 0.01), rMat(0xf8f8f8), x, 1.05, -D + 0.006); [-0.025, 0.025].forEach(function (dx) { p(new THREE.BoxGeometry(0.008, 0.016, 0.004), dark, x + dx, 1.05, -D + 0.012); }); }
    function cable(x0, y0, z0, x1) { p(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x0, MY + 0.02, -D + 0.08), new THREE.Vector3((x0 + x1) / 2, MY + 0.01, -D + 0.04), new THREE.Vector3(x1, 1.05, -D + 0.012)]), 16, 0.007, 5), dark, 0, 0, 0); }
    function mStatus(x, y, z, col) { p(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshBasicMaterial({ color: col }), x, y, z); }
    // (an incubator: a tall white cabinet with a glass door, shelves of petri dishes glowing inside, a display and a long handle)
    var IX = -2.75, inLit = rMat(0xf4f8fb, { emissive: 0xdff4ff, emissiveIntensity: 0.35 });   // (its shell is open at the front, lit softly inside)
    p(new THREE.BoxGeometry(0.55, 0.78, 0.03), white, IX, MY + 0.39, BZ - 0.255); [-1, 1].forEach(function (sd) { p(new THREE.BoxGeometry(0.04, 0.78, 0.5), white, IX + sd * 0.255, MY + 0.39, BZ - 0.02); });
    p(new THREE.BoxGeometry(0.55, 0.14, 0.5), white, IX, MY + 0.71, BZ - 0.02); p(new THREE.BoxGeometry(0.55, 0.06, 0.5), white, IX, MY + 0.03, BZ - 0.02); p(new THREE.PlaneGeometry(0.47, 0.58), inLit, IX, MY + 0.35, BZ - 0.238);
    gl(new THREE.BoxGeometry(0.47, 0.58, 0.006), IX, MY + 0.35, BZ + 0.234, R); [[0, 0.295, 0.5, 0.02], [0, -0.295, 0.5, 0.02], [-0.245, 0, 0.02, 0.6], [0.245, 0, 0.02, 0.6]].forEach(function (f) { p(new THREE.BoxGeometry(f[2], f[3], 0.02), pale, IX + f[0], MY + 0.35 + f[1], BZ + 0.236); });
    for (var sh = 0; sh < 3; sh++) { var shy = MY + 0.15 + sh * 0.17; p(new THREE.BoxGeometry(0.43, 0.006, 0.35), glassL, IX - 0.02, shy, BZ + 0.05);
      for (var dd = 0; dd < 4; dd++) for (var st = 0; st < 2 + (dd + sh) % 2; st++) { p(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 16), rMat([0xf2d08a, 0xf2a8b8, 0xd8f0a8][(dd + sh) % 3], { emissive: 0x332211, emissiveIntensity: 0.3 }), IX - 0.18 + dd * 0.105, shy + 0.01 + st * 0.014, BZ + 0.12); } }
    p(new THREE.BoxGeometry(0.02, 0.4, 0.03), steel, IX + 0.23, MY + 0.38, BZ + 0.25); p(new THREE.PlaneGeometry(0.14, 0.05), new THREE.MeshBasicMaterial({ map: screenTex(17, 128, 48) }), IX - 0.02, MY + 0.71, BZ + 0.231);
    p(new THREE.BoxGeometry(0.55, 0.012, 0.5), glowEdge, IX, MY + 0.002, BZ - 0.02); mStatus(IX + 0.2, MY + 0.71, BZ + 0.232, 0x6aff9a); sockets(IX); cable(IX + 0.2, MY + 0.4, BZ - 0.27, IX);
    // (a centrifuge: a squat rounded body, a clear domed lid with its rotor inside, an angled control panel)
    var CXp = -1.85; p(new THREE.CylinderGeometry(0.24, 0.26, 0.24, 32), white, CXp, MY + 0.12, BZ); p(new THREE.TorusGeometry(0.24, 0.012, 8, 32), pale, CXp, MY + 0.24, BZ, Math.PI / 2, 0, 0);
    var lid = p(new THREE.SphereGeometry(0.22, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.4, roughness: 0.05, envMap: rubyEnv, envMapIntensity: 2, depthWrite: false }), CXp, MY + 0.24, BZ); lid.scale.y = 0.35; lid.renderOrder = 2;
    p(new THREE.CylinderGeometry(0.15, 0.15, 0.03, 24), steel, CXp, MY + 0.25, BZ); for (var rt2 = 0; rt2 < 8; rt2++) { var ra2 = rt2 / 8 * Math.PI * 2; p(new THREE.CylinderGeometry(0.018, 0.012, 0.05, 10), rMat(0xff9a4a, { emissive: 0x401800, emissiveIntensity: 0.4 }), CXp + Math.sin(ra2) * 0.11, MY + 0.27, BZ + Math.cos(ra2) * 0.11, Math.cos(ra2) * 0.5, 0, -Math.sin(ra2) * 0.5); }
    p(new THREE.BoxGeometry(0.3, 0.1, 0.1), white, CXp, MY + 0.06, BZ + 0.27, -0.5, 0, 0); p(new THREE.PlaneGeometry(0.17, 0.06), new THREE.MeshBasicMaterial({ map: screenTex(29, 128, 48) }), CXp - 0.04, MY + 0.085, BZ + 0.318, -0.5, 0, 0);
    [0.08, 0.12].forEach(function (bxp, i) { p(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12), new THREE.MeshBasicMaterial({ color: i ? 0xff6a6a : 0x6aff9a }), CXp + bxp, MY + 0.08, BZ + 0.3, Math.PI / 2 - 0.5, 0, 0); });
    sockets(CXp); cable(CXp, MY + 0.1, BZ - 0.24, CXp);
    // (an analyser: a big block with side vents, a tall angled touchscreen, a carousel of sample vials on top and a glowing ring)
    var AX = -0.62; p(new THREE.BoxGeometry(0.75, 0.55, 0.5), white, AX, MY + 0.275, BZ - 0.02); p(new THREE.BoxGeometry(0.77, 0.04, 0.52), pale, AX, MY + 0.03, BZ - 0.02);
    for (var vt = 0; vt < 7; vt++) [-1, 1].forEach(function (sd) { p(new THREE.BoxGeometry(0.004, 0.012, 0.32), dark, AX + sd * 0.377, MY + 0.2 + vt * 0.035, BZ - 0.02); });
    var scr = new THREE.Group(); scr.position.set(AX - 0.08, MY + 0.32, BZ + 0.24); scr.rotation.x = -0.25; R.add(scr);
    lbP(new THREE.BoxGeometry(0.48, 0.32, 0.02), dark, 0, 0, 0, 0, 0, 0, scr); lbP(new THREE.PlaneGeometry(0.45, 0.29), new THREE.MeshBasicMaterial({ map: screenTex(53, 256, 170) }), 0, 0, 0.011, 0, 0, 0, scr);
    p(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 28), pale, AX + 0.17, MY + 0.57, BZ - 0.05); p(new THREE.TorusGeometry(0.16, 0.006, 6, 28), glowEdge, AX + 0.17, MY + 0.59, BZ - 0.05, Math.PI / 2, 0, 0);
    for (var cv = 0; cv < 12; cv++) { var ca2 = cv / 12 * Math.PI * 2; gl(new THREE.CylinderGeometry(0.013, 0.013, 0.07, 10), AX + 0.17 + Math.sin(ca2) * 0.12, MY + 0.625, BZ - 0.05 + Math.cos(ca2) * 0.12, R);
      p(new THREE.CylinderGeometry(0.011, 0.011, 0.04, 10), lbLiquid(liqCols[cv % 8]), AX + 0.17 + Math.sin(ca2) * 0.12, MY + 0.61, BZ - 0.05 + Math.cos(ca2) * 0.12); p(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 10), rMat(capCols[cv % 8]), AX + 0.17 + Math.sin(ca2) * 0.12, MY + 0.665, BZ - 0.05 + Math.cos(ca2) * 0.12); }
    p(new THREE.BoxGeometry(0.03, 0.2, 0.03), steel, AX + 0.17, MY + 0.68, BZ - 0.2); p(new THREE.BoxGeometry(0.03, 0.03, 0.15), steel, AX + 0.17, MY + 0.77, BZ - 0.13); p(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 6), steel, AX + 0.17, MY + 0.73, BZ - 0.06);   // (its sampling needle)
    mStatus(AX + 0.3, MY + 0.45, BZ + 0.232, 0x6ae8ff); mStatus(AX + 0.33, MY + 0.45, BZ + 0.232, 0x6aff9a); sockets(AX); cable(AX + 0.3, MY + 0.3, BZ - 0.27, AX);
    // (a bioprinter: a steel frame with a glowing build plate, a print head on its gantry, and a little tissue scaffold being printed)
    var PX = 0.62; p(new THREE.BoxGeometry(0.5, 0.08, 0.45), white, PX, MY + 0.04, BZ); p(new THREE.BoxGeometry(0.5, 0.06, 0.45), white, PX, MY + 0.6, BZ);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c2) { p(new THREE.BoxGeometry(0.025, 0.5, 0.025), steel, PX + c2[0] * 0.235, MY + 0.33, BZ + c2[1] * 0.21); });
    p(new THREE.BoxGeometry(0.3, 0.012, 0.28), rMat(0x2a3038), PX, MY + 0.12, BZ); p(new THREE.BoxGeometry(0.28, 0.003, 0.26), glowEdge, PX, MY + 0.128, BZ);
    p(new THREE.BoxGeometry(0.46, 0.02, 0.02), steel, PX, MY + 0.4, BZ - 0.05); p(new THREE.BoxGeometry(0.06, 0.08, 0.06), white, PX + 0.04, MY + 0.36, BZ - 0.02); p(new THREE.ConeGeometry(0.012, 0.04, 8), steel, PX + 0.04, MY + 0.3, BZ - 0.02, Math.PI, 0, 0);
    for (var ly = 0; ly < 5; ly++) p(new THREE.TorusGeometry(0.05 - ly * 0.004, 0.008, 6, 20), rMat(0xffb0c8, { emissive: 0x803050, emissiveIntensity: 0.4, roughness: 0.6 }), PX + 0.04, MY + 0.14 + ly * 0.014, BZ - 0.02, Math.PI / 2, 0, 0);
    [-0.01, 0.02].forEach(function (cx4, i) { p(new THREE.CylinderGeometry(0.014, 0.014, 0.08, 10), lbLiquid(i ? 0xff8ab0 : 0x8ae8ff), PX + 0.2 + cx4 * 3, MY + 0.68, BZ + 0.1 - i * 0.06); });
    p(new THREE.PlaneGeometry(0.12, 0.04), new THREE.MeshBasicMaterial({ map: screenTex(61, 128, 48) }), PX - 0.12, MY + 0.6, BZ + 0.226); sockets(PX); cable(PX + 0.2, MY + 0.05, BZ - 0.22, PX);
    // (a PCR machine: a white block with a sloping hinged lid, a touchscreen, a strip of status lights; a box of tubes and a pipette beside it)
    var QX = 1.72; p(new THREE.BoxGeometry(0.42, 0.22, 0.45), white, QX, MY + 0.11, BZ); var lidG = new THREE.Group(); lidG.position.set(QX, MY + 0.22, BZ - 0.22); lidG.rotation.x = 0.12; R.add(lidG);
    lbP(new THREE.BoxGeometry(0.4, 0.06, 0.44), pale, 0, 0.03, 0.22, 0, 0, 0, lidG); lbP(new THREE.BoxGeometry(0.2, 0.025, 0.04), steel, 0, 0.03, 0.44, 0, 0, 0, lidG);
    p(new THREE.PlaneGeometry(0.2, 0.08), new THREE.MeshBasicMaterial({ map: screenTex(71, 128, 52) }), QX - 0.06, MY + 0.11, BZ + 0.226);
    for (var sl2 = 0; sl2 < 6; sl2++) mStatus(QX + 0.07 + sl2 * 0.022, MY + 0.06, BZ + 0.227, sl2 < 4 ? 0x6aff9a : 0xffc04a);
    p(new THREE.BoxGeometry(0.16, 0.05, 0.12), rMat(0x2a6ad8, { roughness: 0.5 }), QX + 0.32, MY + 0.025, BZ + 0.1); for (var tb = 0; tb < 12; tb++) p(new THREE.CylinderGeometry(0.008, 0.006, 0.03, 8), rMat([0xfff4c8, 0xffc8d8, 0xc8f0ff][tb % 3]), QX + 0.26 + (tb % 4) * 0.04, MY + 0.06, BZ + 0.065 + Math.floor(tb / 4) * 0.035);
    var pip = new THREE.Group(); pip.position.set(QX + 0.33, MY + 0.015, BZ - 0.1); pip.rotation.set(Math.PI / 2, 0, 0.6); R.add(pip);
    lbP(new THREE.CylinderGeometry(0.013, 0.013, 0.12, 10), rMat(0xf2f4f8), 0, 0, 0, 0, 0, 0, pip); lbP(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 10), rMat(0xf0b020), 0, 0.07, 0, 0, 0, 0, pip); lbP(new THREE.CylinderGeometry(0.005, 0.002, 0.07, 8), rMat(0xd8dce4), 0, -0.095, 0, 0, 0, 0, pip);
    sockets(QX); cable(QX, MY + 0.1, BZ - 0.23, QX);
    // (a computer workstation: a slim monitor on a stand, a keyboard, a mouse on a pad, and a mug of something warm)
    var WX = 2.78; var mon = new THREE.Group(); mon.position.set(WX, MY, BZ - 0.08); mon.rotation.y = -0.2; R.add(mon);
    lbP(new THREE.BoxGeometry(0.18, 0.012, 0.14), steel, 0, 0.006, 0, 0, 0, 0, mon); lbP(new THREE.BoxGeometry(0.04, 0.24, 0.02), steel, 0, 0.12, -0.04, 0, 0, 0, mon);
    lbP(new THREE.BoxGeometry(0.62, 0.36, 0.02), dark, 0, 0.36, -0.02, 0, 0, 0, mon); lbP(new THREE.PlaneGeometry(0.59, 0.33), new THREE.MeshBasicMaterial({ map: screenTex(83, 320, 180) }), 0, 0.36, -0.009, 0, 0, 0, mon);
    var kb = new THREE.Group(); kb.position.set(WX - 0.05, MY + 0.01, BZ + 0.15); kb.rotation.y = -0.15; R.add(kb);
    lbP(new THREE.BoxGeometry(0.38, 0.015, 0.12), rMat(0xf2f4f8), 0, 0, 0, 0.05, 0, 0, kb); for (var kr = 0; kr < 4; kr++) for (var kc = 0; kc < 12; kc++) lbP(new THREE.BoxGeometry(0.022, 0.006, 0.02), rMat(0xdfe3ea), -0.165 + kc * 0.03, 0.01, -0.04 + kr * 0.026, 0, 0, 0, kb);
    p(new THREE.BoxGeometry(0.16, 0.003, 0.14), dark, WX + 0.25, MY + 0.002, BZ + 0.14); var mouse = p(new THREE.SphereGeometry(0.025, 14, 8), rMat(0xf2f4f8), WX + 0.25, MY + 0.008, BZ + 0.14); mouse.scale.set(0.8, 0.45, 1.3);
    p(lbLathe([[0, 0], [0.035, 0], [0.04, 0.09], [0.036, 0.09], [0.031, 0.006], [0, 0.006]], 18), rMat(0x2a6ad8, { roughness: 0.4, side: THREE.DoubleSide }), WX - 0.32, MY, BZ + 0.1);
    p(new THREE.CircleGeometry(0.032, 16), rMat(0x5a3418, { roughness: 0.2 }), WX - 0.32, MY + 0.075, BZ + 0.1, -Math.PI / 2, 0, 0); p(new THREE.TorusGeometry(0.022, 0.006, 6, 12, Math.PI), rMat(0x2a6ad8), WX - 0.28, MY + 0.045, BZ + 0.1, 0, 0, -Math.PI / 2);
    sockets(WX); cable(WX, MY + 0.15, BZ - 0.12, WX);
    // (above: glass-fronted wall cupboards of bottles with a light strip beneath, and a big wall screen between them)
    [[-2.1, 2.0], [2.1, 2.0]].forEach(function (cb) {
      var CB = new THREE.Group(); CB.position.set(cb[0], 2.05, -D + 0.19); R.add(CB);
      lbP(new THREE.BoxGeometry(cb[1], 0.7, 0.02), white, 0, 0, -0.18, 0, 0, 0, CB); [0.34, -0.34].forEach(function (yy) { lbP(new THREE.BoxGeometry(cb[1], 0.03, 0.36), white, 0, yy, -0.01, 0, 0, 0, CB); }); [-1, 1].forEach(function (sd) { lbP(new THREE.BoxGeometry(0.03, 0.7, 0.36), white, sd * (cb[1] / 2 - 0.015), 0, -0.01, 0, 0, 0, CB); });   // (an open shell, so the bottles show through the glass)
      lbP(new THREE.PlaneGeometry(cb[1] - 0.06, 0.64), rMat(0xf4f8fb, { emissive: 0xdff4ff, emissiveIntensity: 0.3 }), 0, 0, -0.168, 0, 0, 0, CB);
      lbP(new THREE.BoxGeometry(cb[1] - 0.1, 0.012, 0.3), glassL, 0, 0.0, 0.0, 0, 0, 0, CB);
      for (var dr2 = 0; dr2 < 4; dr2++) { var dx2 = -cb[1] / 2 + cb[1] / 8 + dr2 * cb[1] / 4; var dg2 = lbP(new THREE.BoxGeometry(cb[1] / 4 - 0.03, 0.64, 0.008), glassL, dx2, 0, 0.175, 0, 0, 0, CB); dg2.renderOrder = 3;
        lbP(new THREE.BoxGeometry(cb[1] / 4 - 0.03, 0.02, 0.012), white, dx2, 0.32, 0.176, 0, 0, 0, CB); lbP(new THREE.BoxGeometry(cb[1] / 4 - 0.03, 0.02, 0.012), white, dx2, -0.32, 0.176, 0, 0, 0, CB);
        lbP(new THREE.BoxGeometry(0.012, 0.12, 0.012), steel, dx2 + (dr2 % 2 ? -1 : 1) * (cb[1] / 8 - 0.05), -0.18, 0.19, 0, 0, 0, CB); }
      for (var rb2 = 0; rb2 < 16; rb2++) reagent(CB, -cb[1] / 2 + 0.12 + (rb2 % 8) * (cb[1] - 0.24) / 7, rb2 < 8 ? -0.33 : 0.008, -0.02, rb2 + (cb[0] > 0 ? 5 : 0), 0.9 + (rb2 % 3) * 0.1);
      lbP(new THREE.BoxGeometry(cb[1] - 0.1, 0.01, 0.02), lightM, 0, -0.355, 0.12, 0, 0, 0, CB);   // (the light strip under it)
    });
    var lightPool = p(new THREE.PlaneGeometry(LBI_W - 1.5, 0.5), new THREE.MeshBasicMaterial({ color: 0xeaf8ff, transparent: true, opacity: 0.12, depthWrite: false, blending: THREE.AdditiveBlending }), 0, MY + 0.003, BZ, -Math.PI / 2, 0, 0); lightPool.castShadow = false;
    var dnaTex = cpTex(512, 288, function (g, w, h) { g.fillStyle = '#061c28'; g.fillRect(0, 0, w, h); g.strokeStyle = '#4ae8ff'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12);
      for (var k = 0; k < 40; k++) { var x = 40 + k * 7.5, ph = k * 0.38, y1 = h / 2 + Math.sin(ph) * 70, y2 = h / 2 - Math.sin(ph) * 70; g.strokeStyle = ['#ff6a9a', '#6ae8ff', '#ffd26a', '#9aff6a'][k % 4]; g.globalAlpha = 0.6 + Math.cos(ph) * 0.3; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y1); g.lineTo(x, y2); g.stroke();
        g.globalAlpha = 1; g.fillStyle = '#c8f6ff'; g.beginPath(); g.arc(x, y1, 4, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x, y2, 4, 0, Math.PI * 2); g.fill(); }
      g.fillStyle = '#4ae8ff'; for (var r3 = 0; r3 < 7; r3++) { g.globalAlpha = 0.4 + r3 * 0.08; g.fillRect(360, 40 + r3 * 26, 60 + (r3 * 37) % 80, 8); } g.globalAlpha = 1;
      g.strokeStyle = '#4ae8ff'; g.lineWidth = 4; g.beginPath(); g.arc(420, 240, 26, -Math.PI / 2, Math.PI * 1.1); g.stroke(); });
    var dnaM = new THREE.MeshBasicMaterial({ map: dnaTex }); dnaTex.wrapS = THREE.RepeatWrapping;
    p(new THREE.BoxGeometry(1.5, 0.9, 0.04), dark, 0, 2.05, -D + 0.03); p(new THREE.PlaneGeometry(1.44, 0.84), dnaM, 0, 2.05, -D + 0.052); p(new THREE.BoxGeometry(1.5, 0.01, 0.01), glowEdge, 0, 1.595, -D + 0.05);
    lbDna = dnaTex;
    // (the left wall: a vertical hydroponic garden. A white alcove frame with a glowing back panel, a bar of pink-violet grow
    // lights above, six clear water columns held in steel clamps between a header pipe and a drain pipe, bubbles rising in them,
    // and in each column four net pots of clay pebbles with roots trailing into the water: lettuces, basil, strawberries, mint,
    // kale and microgreens. A control screen and a water tank with a level gauge beside it, and a drip tray beneath)
    var PW = new THREE.Group(); PW.position.set(-W + 0.06, 1.55, 0.3); PW.rotation.y = Math.PI / 2; R.add(PW);
    function q(geo, m, x, y, z, rx, ry, rz) { return p(geo, m, x, y, z, rx, ry, rz, PW); }
    var steelW = rMat(0xc8ccd2, { metalness: 0.9, roughness: 0.25, envMap: rubyEnv, envMapIntensity: 1.2 }), whiteW = rMat(0xeef1f5, { roughness: 0.3 }), glowW = new THREE.MeshBasicMaterial({ color: 0x7ae8ff });
    var backTex = cpTex(256, 256, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e8fbff'); gr.addColorStop(0.5, '#bff0f6'); gr.addColorStop(1, '#9ee0ea'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1; for (var i = 0; i <= w; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); }
      var rg = g.createRadialGradient(w / 2, h * 0.4, 10, w / 2, h * 0.4, w * 0.7); rg.addColorStop(0, 'rgba(255,255,255,0.5)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, w, h); });
    q(new THREE.BoxGeometry(2.3, 2.3, 0.06), whiteW, 0, 0.0, -0.02);                                   // (the alcove frame)
    [[0, 1.12, 2.3, 0.06], [0, -1.12, 2.3, 0.06], [-1.12, 0, 0.06, 2.3], [1.12, 0, 0.06, 2.3]].forEach(function (f) { q(new THREE.BoxGeometry(f[2], f[3], 0.16), whiteW, f[0], f[1], 0.06); });
    q(new THREE.PlaneGeometry(2.18, 2.18), new THREE.MeshBasicMaterial({ map: backTex }), 0, 0, 0.012);
    [[0, 1.085, 2.18, 0.006], [0, -1.085, 2.18, 0.006], [-1.085, 0, 0.006, 2.18], [1.085, 0, 0.006, 2.18]].forEach(function (f) { q(new THREE.BoxGeometry(f[2], f[3], 0.01), glowW, f[0], f[1], 0.14); });
    var growM = new THREE.MeshBasicMaterial({ color: 0xff8ae8 }), growW = new THREE.MeshBasicMaterial({ color: 0xfff4fb });   // (the grow-light bar)
    q(new THREE.BoxGeometry(2.0, 0.08, 0.14), whiteW, 0, 1.0, 0.2); for (var gl2 = 0; gl2 < 16; gl2++) q(new THREE.BoxGeometry(0.1, 0.012, 0.08), gl2 % 3 === 1 ? growW : growM, -0.9 + gl2 * 0.12, 0.955, 0.2);
    var glowCone = q(new THREE.CylinderGeometry(0.9, 1.15, 1.8, 4, 1, true), new THREE.MeshBasicMaterial({ color: 0xff9af0, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }), 0, 0.05, 0.22, 0, Math.PI / 4, 0); glowCone.scale.z = 0.12; glowCone.castShadow = false;
    [-0.95, 0.95].forEach(function (sx) { q(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), steelW, sx, 1.08, 0.2); });
    // (the plumbing: a header pipe feeding every column, a drain pipe below, and a little pump)
    q(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 16), whiteW, 0, 0.88, 0.13, 0, 0, Math.PI / 2); q(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 16), whiteW, 0, -0.88, 0.13, 0, 0, Math.PI / 2);
    [-0.95, 0.95].forEach(function (sx) { q(new THREE.SphereGeometry(0.032, 12, 8), whiteW, sx, 0.88, 0.13); q(new THREE.SphereGeometry(0.032, 12, 8), whiteW, sx, -0.88, 0.13); });
    q(new THREE.CylinderGeometry(0.02, 0.02, 1.76, 12), whiteW, -1.0, 0, 0.13); q(new THREE.BoxGeometry(0.12, 0.1, 0.1), rMat(0x2a3038, { metalness: 0.4, roughness: 0.4 }), -0.95, -0.95, 0.14); q(new THREE.CircleGeometry(0.012, 10), new THREE.MeshBasicMaterial({ color: 0x6aff9a }), -0.92, -0.93, 0.191);
    var waterM = new THREE.MeshStandardMaterial({ color: 0xbff4ff, transparent: true, opacity: 0.32, roughness: 0.05, emissive: 0x5ad8f0, emissiveIntensity: 0.25, depthWrite: false });
    var tubeG = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.03, envMap: rubyEnv, envMapIntensity: 2, side: THREE.DoubleSide, depthWrite: false });
    var bubbleM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, depthWrite: false });
    var potM = rMat(0xf4f6f8, { roughness: 0.4, side: THREE.DoubleSide }), clayM = [0xc8643a, 0xb85a34, 0xd8784a].map(function (c) { return rMat(c, { roughness: 0.9 }); }), rootM = rMat(0xf2ead2, { roughness: 0.8 });
    function leaf(par, x, y, z, len, wid, col, ry, tilt, curl) {         // (a leaf: a thin, curved oval blade)
      var lg = new THREE.Group(); lg.position.set(x, y, z); lg.rotation.set(0, ry, 0); par.add(lg);
      var o = p(new THREE.SphereGeometry(0.5, 10, 6), col, 0, 0, len * 0.5, 0, 0, 0, lg); o.scale.set(wid, wid * 0.12 + 0.002, len); lg.rotation.x = -tilt; o.rotation.x = curl || 0; o.castShadow = false; lg.userData.len = len; return lg;
    }
    var greens = { lettuce: [0x9ad86a, 0x7ac85a, 0xb8e88a], basil: [0x3f9a3a, 0x4aa844], kale: [0x3a6a4a, 0x4a7a5a], mint: [0x5ab85a, 0x6ac86a], micro: [0x8ad86a, 0xa8e87a] };
    function crop(kind, par, seed) {                                     // (what grows in a pot)
      var k, n, m;
      if (kind === 'lettuce') { n = 11; for (k = 0; k < n; k++) { var a = k * 2.4 + seed, r = k / n; m = rMat(greens.lettuce[k % 3], { roughness: 0.6, side: THREE.DoubleSide }); leaf(par, Math.sin(a) * 0.006, 0.01 + r * 0.02, Math.cos(a) * 0.006, 0.07 - r * 0.025, 0.06 - r * 0.02, m, a, 0.5 + r * 0.6, -0.4); } }
      else if (kind === 'basil') { p(new THREE.CylinderGeometry(0.003, 0.004, 0.12, 5), rMat(0x5a8a3a), 0, 0.06, 0, 0, 0, 0, par); m = rMat(greens.basil[seed % 2], { roughness: 0.35, side: THREE.DoubleSide });
        for (k = 0; k < 4; k++) { [0, Math.PI].forEach(function (sd) { leaf(par, 0, 0.03 + k * 0.03, 0, 0.045 - k * 0.006, 0.028 - k * 0.003, m, sd + k * Math.PI / 2, 0.4, -0.3); }); } }
      else if (kind === 'strawberry') { m = rMat(0x4a9a44, { roughness: 0.5, side: THREE.DoubleSide });
        for (k = 0; k < 3; k++) { var sa = k * 2.1 + seed; var st = leaf(par, 0, 0.01, 0, 0.05, 0.006, rMat(0x6a8a3a), sa, 0.6); [-0.5, 0, 0.5].forEach(function (lo) { leaf(st, 0, 0, st.userData.len, 0.035, 0.026, m, lo, -0.1); }); }
        [[0.03, -0.01, 0.6], [-0.025, -0.02, 2.5]].forEach(function (bb) { var be = p(new THREE.SphereGeometry(0.014, 10, 8), rMat(0xd8202a, { roughness: 0.3 }), bb[0], bb[1], 0.02, 0, 0, Math.PI, par); be.scale.set(1, 1.3, 1);
          p(new THREE.ConeGeometry(0.012, 0.008, 5), rMat(0x4a8a3a), bb[0], bb[1] + 0.017, 0.02, 0, 0, 0, par); for (var sd2 = 0; sd2 < 6; sd2++) p(new THREE.SphereGeometry(0.0018, 4, 3), rMat(0xf2d86a), bb[0] + Math.sin(sd2) * 0.012, bb[1] - 0.004 + (sd2 % 3) * 0.006, 0.02 + Math.cos(sd2) * 0.01, 0, 0, 0, par); }); }
      else if (kind === 'mint') { m = rMat(greens.mint[seed % 2], { roughness: 0.55, side: THREE.DoubleSide });
        for (k = 0; k < 3; k++) { var ma = k * 2.1 + seed, sx = Math.sin(ma) * 0.012, sz = Math.cos(ma) * 0.012; p(new THREE.CylinderGeometry(0.0025, 0.003, 0.09, 5), rMat(0x5a7a3a), sx, 0.045, sz, Math.cos(ma) * 0.2, 0, -Math.sin(ma) * 0.2, par);
          for (var lv = 0; lv < 3; lv++) [0, Math.PI].forEach(function (sd) { leaf(par, sx, 0.03 + lv * 0.025, sz, 0.03, 0.022, m, ma + sd + lv, 0.5, -0.2); }); } }
      else if (kind === 'kale') { m = rMat(greens.kale[seed % 2], { roughness: 0.6, side: THREE.DoubleSide });
        for (k = 0; k < 6; k++) { var ka = k * 1.05 + seed; var kl = leaf(par, 0, 0.01, 0, 0.1, 0.035, m, ka, 0.25, -0.5); for (var fr = 0; fr < 4; fr++) leaf(kl, 0, 0.0, kl.userData.len * (0.3 + fr * 0.18), 0.02 * kl.userData.len / 0.1, 0.016, m, fr % 2 ? 1.3 : -1.3, 0.2); } }
      else { m = rMat(greens.micro[seed % 2], { roughness: 0.5, side: THREE.DoubleSide }); var sm = rMat(0xe8f0d8);
        for (k = 0; k < 16; k++) { var ua = k * 2.39 + seed, ur = 0.008 + (k % 4) * 0.006; p(new THREE.CylinderGeometry(0.0012, 0.0012, 0.035, 3), sm, Math.sin(ua) * ur, 0.018, Math.cos(ua) * ur, 0, 0, 0, par); [0, Math.PI].forEach(function (sd) { leaf(par, Math.sin(ua) * ur, 0.036, Math.cos(ua) * ur, 0.012, 0.01, m, ua + sd, 0.3); }); } }
    }
    var cropRows = [['lettuce', 'basil', 'strawberry', 'mint', 'kale', 'micro'], ['basil', 'lettuce', 'mint', 'strawberry', 'micro', 'kale'], ['strawberry', 'kale', 'lettuce', 'micro', 'basil', 'mint'], ['micro', 'mint', 'kale', 'basil', 'lettuce', 'strawberry']];
    for (var c = 0; c < 6; c++) {
      var cx3 = -0.75 + c * 0.3;
      q(new THREE.CylinderGeometry(0.095, 0.095, 1.7, 18, 1, true), tubeG, cx3, 0, 0.13).renderOrder = 2;            // (the clear column)
      q(new THREE.CylinderGeometry(0.088, 0.088, 0.1, 18), waterM, cx3, -0.79, 0.13).renderOrder = 1;               // (a reservoir of water at its foot)
      for (var dr = 0; dr < 3; dr++) q(new THREE.CylinderGeometry(0.0025, 0.0025, 1.55, 5), waterM, cx3 + (dr - 1) * 0.05, 0.0, 0.13 - 0.06 + (dr % 2) * 0.012).renderOrder = 1;   // (thin trickles of water running down the inside)
      [0.82, -0.82, 0.0].forEach(function (cy) { q(new THREE.TorusGeometry(0.098, 0.009, 6, 20), steelW, cx3, cy, 0.13, Math.PI / 2, 0, 0); q(new THREE.BoxGeometry(0.03, 0.02, 0.06), steelW, cx3, cy, 0.05); });   // (steel clamps)
      q(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 18), whiteW, cx3, 0.86, 0.13); q(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 18), whiteW, cx3, -0.86, 0.13);
      q(new THREE.BoxGeometry(0.1, 0.035, 0.006), rMat(0x2a3038), cx3, -0.93, 0.232); q(new THREE.PlaneGeometry(0.085, 0.022), new THREE.MeshBasicMaterial({ map: screenTex(c * 13 + 9, 96, 32) }), cx3, -0.93, 0.2355);   // (a little readout tag)
      for (var bb2 = 0; bb2 < 5; bb2++) { var bm3 = q(new THREE.SphereGeometry(0.008 + (bb2 % 3) * 0.003, 6, 5), bubbleM, cx3 + ((bb2 * 37) % 9 - 4) * 0.012, -0.83, 0.13 + ((bb2 * 17) % 7 - 3) * 0.01); bm3.castShadow = false; lbBubbles.push({ m: bm3, y0: -0.835, h: 0.08, v: 0.12 + (bb2 % 3) * 0.05, k: (c * 0.37 + bb2 * 0.21) % 1 }); }
      for (var r2 = 0; r2 < 4; r2++) {
        var py = -0.66 + r2 * 0.4, pot = new THREE.Group(); pot.position.set(cx3, py, 0.13); PW.add(pot);   // (each pot sits inside its column, on a clear shelf)
        gl(new THREE.CylinderGeometry(0.088, 0.088, 0.008, 20), cx3, py - 0.044, 0.13, PW);
        lbP(lbLathe([[0, -0.04], [0.035, -0.04], [0.05, 0.02], [0.058, 0.025], [0.058, 0.032], [0.05, 0.032]], 16), potM, 0, 0, 0, 0, 0, 0, pot);   // (a white net pot)
        for (var sl = 0; sl < 6; sl++) { var sla = sl / 6 * Math.PI * 2; lbP(new THREE.BoxGeometry(0.01, 0.04, 0.004), rMat(0x8a9aa8), Math.sin(sla) * 0.043, -0.01, Math.cos(sla) * 0.043, 0, sla, 0, pot); }
        for (var pb = 0; pb < 7; pb++) { var pa = pb * 2.4; lbP(new THREE.SphereGeometry(0.011, 6, 5), clayM[pb % 3], Math.sin(pa) * 0.025 * (pb % 2 ? 1 : 0.5), 0.026, Math.cos(pa) * 0.025 * (pb % 2 ? 1 : 0.5), 0, 0, 0, pot); }
        for (var rt = 0; rt < 4; rt++) { var ra = rt * 1.6 + c; lbP(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(Math.sin(ra) * 0.02, -0.04, Math.cos(ra) * 0.02), new THREE.Vector3(Math.sin(ra) * 0.03, -0.07, Math.cos(ra) * 0.03), new THREE.Vector3(Math.sin(ra + 0.6) * 0.035, -0.1 - rt * 0.01, Math.cos(ra + 0.6) * 0.035)]), 8, 0.0025, 4), rootM, 0, 0, 0, 0, 0, 0, pot); }   // (roots hanging just below the shelf)
        var cg = new THREE.Group(); cg.position.y = 0.03; cg.userData.tubeX = cx3; pot.add(cg); crop(cropRows[r2][c], cg, c * 4 + r2);
        (function (g) {                                                    // (each plant is sized to fit inside its column: no leaf reaches the glass)
          g.updateMatrixWorld(true); var inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), v = new THREE.Vector3(), mr = 0.001, my = 0.001;
          g.traverse(function (o) { if (!o.isMesh) return; var m = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld), ps = o.geometry.attributes.position;
            for (var i = 0; i < ps.count; i++) { v.fromBufferAttribute(ps, i).applyMatrix4(m); mr = Math.max(mr, Math.hypot(v.x, v.z)); my = Math.max(my, v.y); } });
          g.scale.setScalar(Math.min(1.7, 0.078 / mr, 0.24 / my));
        })(cg);
      }
    }
    // (beside it: a control screen on a steel arm, and a nutrient tank with a glowing level gauge)
    var ctl = new THREE.Group(); ctl.position.set(1.42, 0.25, 0.08); PW.add(ctl);
    lbP(new THREE.BoxGeometry(0.06, 0.06, 0.12), steelW, 0, 0, -0.02, 0, 0, 0, ctl); lbP(new THREE.BoxGeometry(0.36, 0.26, 0.025), rMat(0x2a3038, { metalness: 0.3, roughness: 0.4 }), 0, 0, 0.06, 0, 0, 0, ctl);
    lbP(new THREE.PlaneGeometry(0.33, 0.23), new THREE.MeshBasicMaterial({ map: screenTex(64) }), 0, 0, 0.0735, 0, 0, 0, ctl); lbP(new THREE.SphereGeometry(0.006, 6, 4), new THREE.MeshBasicMaterial({ color: 0x6aff9a }), 0.16, -0.115, 0.075, 0, 0, 0, ctl);
    var tank = new THREE.Group(); tank.position.set(1.42, -1.55, 0.2); PW.add(tank);
    lbP(new THREE.BoxGeometry(0.34, 0.52, 0.3), whiteW, 0, 0.26, 0, 0, 0, 0, tank); lbP(new THREE.BoxGeometry(0.36, 0.03, 0.32), rMat(0xc8ced8), 0, 0.53, 0, 0, 0, 0, tank);
    lbP(new THREE.BoxGeometry(0.05, 0.4, 0.006), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false }), -0.1, 0.27, 0.153, 0, 0, 0, tank); lbP(new THREE.BoxGeometry(0.04, 0.26, 0.004), glowW, -0.1, 0.2, 0.152, 0, 0, 0, tank);
    for (var tk = 0; tk < 5; tk++) lbP(new THREE.BoxGeometry(0.018, 0.003, 0.003), rMat(0x2a3038), -0.065, 0.1 + tk * 0.08, 0.154, 0, 0, 0, tank);
    lbP(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 14), rMat(0x2a6ad8, { roughness: 0.4 }), 0.08, 0.57, 0.0, 0, 0, 0, tank); lbP(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8), whiteW, 0.12, 0.8, -0.08, 0, 0, 0, tank);
    lbP(new THREE.BoxGeometry(0.16, 0.08, 0.004), labLabel(0), 0.06, 0.38, 0.152, 0, 0, 0, tank);
    // (a drip tray along the foot of the garden)
    q(new THREE.BoxGeometry(2.1, 0.08, 0.34), whiteW, 0, -1.48, 0.17); q(new THREE.BoxGeometry(2.0, 0.005, 0.28), waterM, 0, -1.445, 0.17); q(new THREE.BoxGeometry(2.08, 0.008, 0.008), glowW, 0, -1.52, 0.345);
    labSolids.push([-W + 0.3, -0.7, 0.35], [-W + 0.3, 0.3, 0.35], [-W + 0.3, 1.3, 0.35], [-W + 0.3, -1.12, 0.3]);
    // (the right wall: a tall window onto a city at night, framed deep in white with slim mullions, a blind rolled up at its
    // head and a lit sill; before it four growth chambers, each a glass column on a pedestal with a control screen, steel struts,
    // a vented lid with hoses to the wall and mist curling at its foot, growing something strange and glowing)
    var city = cpTex(1024, 448, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060a20'); gr.addColorStop(0.55, '#1a1440'); gr.addColorStop(1, '#3a1a50'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 140; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.3 + (i % 5) * 0.12) + ')'; g.fillRect((i * 97) % w, (i * 31) % 150, i % 7 ? 1.2 : 2, i % 7 ? 1.2 : 2); }
      var mg = g.createRadialGradient(w * 0.78, 70, 4, w * 0.78, 70, 70); mg.addColorStop(0, 'rgba(255,248,230,1)'); mg.addColorStop(0.35, 'rgba(255,240,220,0.9)'); mg.addColorStop(0.42, 'rgba(200,190,255,0.25)'); mg.addColorStop(1, 'rgba(120,100,255,0)'); g.fillStyle = mg; g.fillRect(w * 0.78 - 70, 0, 140, 140);
      g.fillStyle = 'rgba(200,190,170,0.35)'; [[8, -6, 5], [-9, 4, 4], [3, 9, 3]].forEach(function (c) { g.beginPath(); g.arc(w * 0.78 + c[0], 70 + c[1], c[2], 0, Math.PI * 2); g.fill(); });
      var haze = g.createLinearGradient(0, h * 0.5, 0, h); haze.addColorStop(0, 'rgba(255,90,200,0)'); haze.addColorStop(1, 'rgba(255,90,200,0.25)'); g.fillStyle = haze; g.fillRect(0, h * 0.5, w, h * 0.5);
      function towers(n, minH, maxH, cols, lit, seed) {
        for (var b = 0; b < n; b++) { var bw = 22 + (b * 13 + seed) % 40, bh = minH + (b * 47 + seed * 3) % (maxH - minH), bx = (b * 61 + seed * 17) % (w - bw); g.fillStyle = cols[b % cols.length]; g.fillRect(bx, h - bh, bw, bh);
          if (b % 3 === 0) { g.fillRect(bx + bw * 0.2, h - bh - 14, bw * 0.6, 14); g.fillRect(bx + bw / 2 - 1, h - bh - 40, 2, 26); g.fillStyle = '#ff3a3a'; g.fillRect(bx + bw / 2 - 2, h - bh - 42, 4, 3); }   // (a crown and an antenna with its red light)
          if (b % 4 === 1) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(bx, h - bh, 3, bh); }
          for (var wy = h - bh + 6; wy < h - 4; wy += 7) for (var wx = bx + 3; wx < bx + bw - 3; wx += 5) if ((wx * 7 + wy * 3 + b + seed) % 7 < lit) { g.fillStyle = ['#ffd890', '#9ae8ff', '#ff8ad8', '#fff4d8'][(wx + wy) % 4]; g.globalAlpha = 0.55 + ((wx * wy) % 5) * 0.09; g.fillRect(wx, wy, 2, 3); g.globalAlpha = 1; } }
      }
      towers(34, 60, 180, ['#1c1a44', '#201848', '#18204a'], 1, 7);          // (the far skyline, dim)
      towers(26, 110, 300, ['#121436', '#161032', '#0e1a34'], 2, 23);        // (the middle towers)
      towers(12, 200, 380, ['#0a0c24', '#0c0a22'], 3, 41);                   // (tall towers close by)
      [[0.18, 230, '#ff4ab8', 10, 46], [0.47, 180, '#4ae8ff', 50, 8], [0.63, 260, '#ffd24a', 8, 40], [0.86, 210, '#9a6aff', 40, 10]].forEach(function (n) {   // (neon signs, glowing)
        g.save(); g.shadowColor = n[2]; g.shadowBlur = 14; g.fillStyle = n[2]; g.fillRect(w * n[0], h - n[1], n[3], n[4]); g.restore(); });
      g.strokeStyle = 'rgba(120,230,255,0.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w * 0.3, h - 170); g.lineTo(w * 0.42, h - 170); g.stroke();   // (a lit skybridge)
      [[0.12, 120, 1], [0.55, 95, -1], [0.7, 140, 1]].forEach(function (f) { var fx = w * f[0], lg = g.createLinearGradient(fx, 0, fx + f[2] * 80, 0); lg.addColorStop(0, 'rgba(255,255,255,0.9)'); lg.addColorStop(1, 'rgba(255,120,200,0)');   // (flying cars, trailing light)
        g.strokeStyle = lg; g.lineWidth = 2; g.beginPath(); g.moveTo(fx, f[1]); g.lineTo(fx + f[2] * 80, f[1] + 4); g.stroke(); g.fillStyle = '#fff'; g.fillRect(fx - 2, f[1] - 1, 4, 3); });
    });
    var WN = new THREE.Group(); WN.position.set(W - 0.03, 1.6, -0.3); WN.rotation.y = -Math.PI / 2; R.add(WN);
    function wq(geo, m, x, y, z, rx, ry, rz) { return p(geo, m, x, y, z, rx, ry, rz, WN); }
    wq(new THREE.PlaneGeometry(4.6, 1.9), new THREE.MeshBasicMaterial({ map: city }), 0, 0, 0.0);   // (the city beyond)
    var pane = wq(new THREE.PlaneGeometry(4.6, 1.9), new THREE.MeshStandardMaterial({ color: 0xcfe8ff, transparent: true, opacity: 0.1, roughness: 0.02, metalness: 0.3, envMap: rubyEnv, envMapIntensity: 1.5, depthWrite: false }), 0, 0, 0.05); pane.renderOrder = 2;
    [[0, 1.0, 4.8, 0.1], [0, -1.0, 4.8, 0.1], [-2.35, 0, 0.1, 2.1], [2.35, 0, 0.1, 2.1]].forEach(function (f) { wq(new THREE.BoxGeometry(f[2], f[3], 0.2), white, f[0], f[1], 0.06); });   // (a deep white reveal)
    [[-1.53, 0], [-0.77, 0], [0, 0], [0.77, 0], [1.53, 0]].forEach(function (m, i) { wq(new THREE.BoxGeometry(i === 2 ? 0.06 : 0.035, 1.9, 0.05), i === 2 ? white : pale, m[0], 0, 0.06); });   // (slim mullions)
    wq(new THREE.BoxGeometry(4.6, 0.03, 0.05), pale, 0, 0.55, 0.06);                                      // (a transom near the top)
    wq(new THREE.CylinderGeometry(0.06, 0.06, 4.6, 20), rMat(0xf0f2f6, { roughness: 0.6 }), 0, 0.88, 0.1, 0, 0, Math.PI / 2); wq(new THREE.BoxGeometry(4.66, 0.14, 0.03), white, 0, 0.9, 0.17);   // (the blind, rolled up in its box)
    wq(new THREE.BoxGeometry(0.3, 0.02, 0.006), pale, 1.9, 0.79, 0.165); wq(new THREE.CylinderGeometry(0.003, 0.003, 0.35, 4), pale, 2.05, 0.62, 0.12);   // (its pull cord)
    wq(new THREE.BoxGeometry(4.8, 0.05, 0.14), topM, 0, -1.03, 0.09); wq(new THREE.BoxGeometry(4.7, 0.008, 0.008), glowEdge, 0, -1.06, 0.16);   // (the sill, a glow beneath it)
    [[-2.0, 'succulent', 0], [-1.15, 'jar', 0x9affd0], [1.2, 'erlen', 0xff8ad8], [2.05, 'succulent', 0]].forEach(function (it, i) { var sg2 = new THREE.Group(); sg2.position.set(it[0], -1.005, 0.1); WN.add(sg2); lbBottle(sg2, it[1], 0, 0, 0, it[2], i, 0.9); });
    // (the growth chambers)
    var mistM = new THREE.MeshBasicMaterial({ color: 0xe8fbff, transparent: true, opacity: 0.07, depthWrite: false });
    var chamberPlants = [
      function (G2, y0) {                                                // (a bioluminescent fern, fronds glowing cyan)
        var m = rMat(0x3ad8c8, { emissive: 0x2ae8ff, emissiveIntensity: 0.5, roughness: 0.5, side: THREE.DoubleSide }); m.userData.glow = 0.55; lbChambers.push(m);
        for (var f = 0; f < 7; f++) { var fa = f / 7 * Math.PI * 2, fg = new THREE.Group(); fg.position.y = y0; fg.rotation.y = fa; G2.add(fg);
          var pts = [], k; for (k = 0; k <= 8; k++) { var u = k / 8; pts.push(new THREE.Vector3(0, u * 0.5, Math.sin(u * 1.6) * 0.16)); } var cv = new THREE.CatmullRomCurve3(pts);
          lbP(new THREE.TubeGeometry(cv, 10, 0.004, 4), m, 0, 0, 0, 0, 0, 0, fg);
          for (k = 1; k < 12; k++) { var pp = cv.getPoint(k / 12), ll = 0.055 * (1 - k / 13); [-1, 1].forEach(function (sd) { var lf = lbP(new THREE.SphereGeometry(0.5, 6, 4), m, pp.x + sd * ll * 0.5, pp.y, pp.z, 0, 0, sd * 0.4, fg); lf.scale.set(ll, 0.004, 0.014); }); }
          if (f % 2) lbP(new THREE.SphereGeometry(0.012, 8, 6), m, 0, 0.12, 0.02, 0, 0, 0, fg); }   // (a curled fiddlehead)
      },
      function (G2, y0) {                                                // (a cluster of glowing mushrooms, caps speckled)
        function p(geo, m, x, y, z, rx, ry, rz) { return lbP(geo, m, x, y, z, rx, ry, rz, G2); }   // (built inside its own chamber)
        var cap = rMat(0xff7ad8, { emissive: 0xff4ab8, emissiveIntensity: 0.5, roughness: 0.4 }), stem = rMat(0xf8eaf4, { emissive: 0x5a2a4a, emissiveIntensity: 0.3 }); cap.userData.glow = 0.5; lbChambers.push(cap);
        [[0, 0, 0.32, 0.09], [0.09, 0.05, 0.22, 0.065], [-0.08, 0.06, 0.18, 0.055], [0.05, -0.1, 0.14, 0.045], [-0.1, -0.06, 0.1, 0.035], [0.12, -0.03, 0.08, 0.03]].forEach(function (mu, i) {
          var mx = mu[0], mz = mu[1], mh = mu[2], mr = mu[3];
          p(new THREE.CylinderGeometry(mr * 0.22, mr * 0.32, mh, 10), stem, mx, y0 + mh / 2, mz, (i % 3 - 1) * 0.08, 0, (i % 2 ? 1 : -1) * 0.06);
          var c2 = p(new THREE.SphereGeometry(mr, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), cap, mx, y0 + mh, mz); c2.scale.y = 0.6; p(new THREE.CircleGeometry(mr * 0.97, 16), rMat(0xf0c8e0, { side: THREE.DoubleSide }), mx, y0 + mh + 0.002, mz, Math.PI / 2, 0, 0);
          for (var sp2 = 0; sp2 < 5; sp2++) { var sa2 = sp2 * 2.4 + i; p(new THREE.SphereGeometry(mr * 0.12, 6, 4), new THREE.MeshBasicMaterial({ color: 0xfff0fa }), mx + Math.sin(sa2) * mr * 0.55, y0 + mh + mr * 0.42, mz + Math.cos(sa2) * mr * 0.55); }
        });
      },
      function (G2, y0) {                                                // (crystal bellflowers: tall stalks hung with glowing violet bells)
        function p(geo, m, x, y, z, rx, ry, rz) { return lbP(geo, m, x, y, z, rx, ry, rz, G2); }   // (built inside its own chamber)
        var stalk = rMat(0x5a8a6a, { roughness: 0.5 }), bell = rMat(0xb88aff, { emissive: 0x8a4aff, emissiveIntensity: 0.5, roughness: 0.2, transparent: true, opacity: 0.9, side: THREE.DoubleSide }); bell.userData.glow = 0.55; lbChambers.push(bell);
        for (var st2 = 0; st2 < 5; st2++) { var sa3 = st2 * 1.26, sx2 = Math.sin(sa3) * 0.06, sz2 = Math.cos(sa3) * 0.06, sh2 = 0.42 + (st2 % 3) * 0.08;
          var cv2 = new THREE.CatmullRomCurve3([new THREE.Vector3(sx2, y0, sz2), new THREE.Vector3(sx2 * 1.5, y0 + sh2 * 0.6, sz2 * 1.5), new THREE.Vector3(sx2 * 2.4, y0 + sh2, sz2 * 2.4)]);
          p(new THREE.TubeGeometry(cv2, 10, 0.005, 5), stalk, 0, 0, 0);
          for (var bl = 0; bl < 4; bl++) { var bp = cv2.getPoint(0.55 + bl * 0.13); p(lbLathe([[0.002, 0.03], [0.012, 0.022], [0.02, 0.005], [0.026, -0.004]], 12), bell, bp.x + sx2 * 0.3, bp.y - 0.02, bp.z + sz2 * 0.3); p(new THREE.SphereGeometry(0.004, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), bp.x + sx2 * 0.3, bp.y - 0.028, bp.z + sz2 * 0.3); }
          for (var lv2 = 0; lv2 < 2; lv2++) { var lp = cv2.getPoint(0.15 + lv2 * 0.2); var lf2 = p(new THREE.SphereGeometry(0.5, 8, 4), stalk, lp.x, lp.y, lp.z, 0, sa3 + lv2 * 2, 0.9); lf2.scale.set(0.02, 0.004, 0.08); } }
      },
      function (G2, y0) {                                                // (a golden spiral succulent studded with glowing seed-orbs)
        function p(geo, m, x, y, z, rx, ry, rz) { return lbP(geo, m, x, y, z, rx, ry, rz, G2); }   // (built inside its own chamber)
        var leafM = rMat(0x7aa86a, { roughness: 0.45 }), orb = rMat(0xffd25a, { emissive: 0xffb020, emissiveIntensity: 0.6, roughness: 0.2 }); orb.userData.glow = 0.6; lbChambers.push(orb);
        for (var lv3 = 0; lv3 < 28; lv3++) { var u2 = lv3 / 28, a3 = lv3 * 2.39996, rr2 = 0.03 + u2 * 0.14, ly2 = y0 + 0.02 + (1 - u2) * 0.12;
          var lfm = p(new THREE.SphereGeometry(0.5, 10, 6), leafM, Math.sin(a3) * rr2 * 0.6, ly2, Math.cos(a3) * rr2 * 0.6, 0, a3, 0); lfm.scale.set(0.035 + u2 * 0.03, 0.02, 0.07 + u2 * 0.09); lfm.rotation.x = -0.6 + u2 * 0.5; lfm.rotation.order = 'YXZ'; }
        for (var ob = 0; ob < 7; ob++) { var oa = ob * 0.9; p(new THREE.SphereGeometry(0.014 + (ob % 3) * 0.004, 10, 8), orb, Math.sin(oa) * 0.04, y0 + 0.2 + (ob % 4) * 0.05, Math.cos(oa) * 0.04); p(new THREE.CylinderGeometry(0.002, 0.002, 0.1, 4), leafM, Math.sin(oa) * 0.03, y0 + 0.15 + (ob % 4) * 0.04, Math.cos(oa) * 0.03); }
      }
    ];
    [-1.6, -0.75, 0.1, 0.95].forEach(function (cz, i) {
      var cx = W - 0.55, CG = new THREE.Group(); CG.position.set(cx, 0, cz); R.add(CG);
      function cp2(geo, m, x, y, z, rx, ry, rz) { return lbP(geo, m, x, y, z, rx, ry, rz, CG); }
      // (the pedestal: a dark plinth, a white drum with vents and a glowing band, a control screen facing the room)
      cp2(new THREE.CylinderGeometry(0.3, 0.31, 0.06, 28), dark, 0, 0.03, 0); cp2(new THREE.CylinderGeometry(0.265, 0.285, 0.52, 28), white, 0, 0.32, 0);
      cp2(new THREE.TorusGeometry(0.27, 0.006, 6, 32), glowEdge, 0, 0.08, 0, Math.PI / 2, 0, 0); cp2(new THREE.CylinderGeometry(0.27, 0.27, 0.04, 28), pale, 0, 0.6, 0);
      for (var vs2 = 0; vs2 < 5; vs2++) cp2(new THREE.BoxGeometry(0.004, 0.012, 0.16), dark, -0.272, 0.18 + vs2 * 0.03, 0, 0, 0, 0);
      var pan = new THREE.Group(); pan.position.set(-0.27, 0.45, 0); pan.rotation.set(0, -Math.PI / 2, 0); CG.add(pan);
      lbP(new THREE.BoxGeometry(0.2, 0.11, 0.02), dark, 0, 0, 0, -0.2, 0, 0, pan); lbP(new THREE.PlaneGeometry(0.18, 0.09), new THREE.MeshBasicMaterial({ map: screenTex(i * 19 + 101, 160, 80) }), 0, 0.002, 0.011, -0.2, 0, 0, pan);
      lbP(new THREE.SphereGeometry(0.007, 6, 4), new THREE.MeshBasicMaterial({ color: [0x6aff9a, 0x6aff9a, 0xffc04a, 0x6aff9a][i] }), 0.085, -0.07, 0.012, 0, 0, 0, pan);
      // (the chamber: glass between steel rings, three slim struts, a dark soil bed glowing faintly, and mist low inside)
      var gm = new THREE.MeshStandardMaterial({ color: 0xd8f8ff, transparent: true, opacity: 0.22, roughness: 0.03, envMap: rubyEnv, envMapIntensity: 1.6, emissive: 0x4ad8ff, emissiveIntensity: 0.2, depthWrite: false, side: THREE.DoubleSide });
      var gc = cp2(new THREE.CylinderGeometry(0.24, 0.24, 0.78, 28, 1, true), gm, 0, 1.01, 0); gc.renderOrder = 2; gc.castShadow = false;
      [0.63, 1.39].forEach(function (ry2) { cp2(new THREE.TorusGeometry(0.245, 0.012, 8, 32), steel, 0, ry2, 0, Math.PI / 2, 0, 0); });
      for (var su = 0; su < 3; su++) { var sa4 = su / 3 * Math.PI * 2 + 0.5; cp2(new THREE.CylinderGeometry(0.008, 0.008, 0.76, 6), steel, Math.sin(sa4) * 0.245, 1.01, Math.cos(sa4) * 0.245); }
      cp2(new THREE.CylinderGeometry(0.23, 0.23, 0.03, 28), rMat(0x2a1c14, { roughness: 1, emissive: 0x0a2a2a, emissiveIntensity: 0.4 }), 0, 0.635, 0);
      for (var ms = 0; ms < 3; ms++) { var mm = cp2(new THREE.SphereGeometry(0.11, 12, 8), mistM, Math.sin(ms * 2.1) * 0.09, 0.69, Math.cos(ms * 2.1) * 0.09); mm.scale.set(1.15, 0.22, 1.15); mm.castShadow = false; mm.renderOrder = 1; }
      chamberPlants[i](CG, 0.65);
      // (the lid: a white cap with a fan grille and a ring of light underneath, hoses running back to the wall)
      cp2(new THREE.CylinderGeometry(0.26, 0.26, 0.07, 28), white, 0, 1.44, 0); cp2(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 28), pale, 0, 1.49, 0);
      cp2(new THREE.CircleGeometry(0.15, 24), dark, 0, 1.507, 0, -Math.PI / 2, 0, 0); [0.05, 0.1, 0.14].forEach(function (gr2) { cp2(new THREE.TorusGeometry(gr2, 0.004, 4, 24), steel, 0, 1.509, 0, Math.PI / 2, 0, 0); });
      for (var fb = 0; fb < 5; fb++) cp2(new THREE.BoxGeometry(0.13, 0.003, 0.03), steel, 0, 1.51, 0, 0, fb / 5 * Math.PI * 2, 0.3);
      cp2(new THREE.TorusGeometry(0.235, 0.006, 6, 32), glowEdge, 0, 1.403, 0, Math.PI / 2, 0, 0);
      [-0.06, 0.06].forEach(function (hz) { cp2(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.12, 1.48, hz), new THREE.Vector3(0.3, 1.62, hz * 1.5), new THREE.Vector3(0.4, 1.56, hz * 2), new THREE.Vector3(0.44, 1.2, hz * 2.5)]), 16, 0.012, 6), hz > 0 ? rMat(0x2a6ad8, { roughness: 0.5 }) : dark, 0, 0, 0); });
      gm.userData.glow = 0.2; lbChambers.push(gm); labSolids.push([cx, cz, 0.32]);
    });
    // (the shop counter by the door, for the shop to come: white, on a dark plinth with a glow beneath, its front fluted with a
    // glowing atom in the middle, a glowing edge under its top, and on it a till tablet, a glass dome over a glowing crystal,
    // a little rack of sample vials and a brass bell)
    var CX = LB_COUNTER[0], CZ = LB_COUNTER[1], CWd = LB_COUNTER_W;
    p(new THREE.BoxGeometry(CWd - 0.04, 0.9, 0.56), white, CX, 0.53, CZ); p(new THREE.BoxGeometry(CWd - 0.14, 0.08, 0.46), dark, CX, 0.04, CZ);
    p(new THREE.BoxGeometry(CWd - 0.16, 0.012, 0.012), glowEdge, CX, 0.01, CZ - 0.23);
    for (var fl = 0; fl < 13; fl++) p(new THREE.CylinderGeometry(0.022, 0.022, 0.78, 10, 1, false, Math.PI / 2, Math.PI), front, CX - CWd / 2 + 0.12 + fl * (CWd - 0.24) / 12, 0.5, CZ - 0.28, 0, Math.PI, 0);
    var atomTex = cpTex(256, 256, function (g, w, h) { g.fillStyle = '#0c2430'; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#7ae8ff'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 10, 0, Math.PI * 2); g.stroke();
      g.save(); g.translate(w / 2, h / 2); g.lineWidth = 7; for (var i = 0; i < 3; i++) { g.save(); g.rotate(i * Math.PI / 3); g.beginPath(); g.ellipse(0, 0, 86, 30, 0, 0, Math.PI * 2); g.stroke(); g.restore(); } g.fillStyle = '#c8faff'; g.beginPath(); g.arc(0, 0, 16, 0, Math.PI * 2); g.fill(); g.restore(); });
    p(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 32), white, CX, 0.55, CZ - 0.31, Math.PI / 2, 0, 0); p(new THREE.CircleGeometry(0.15, 32), new THREE.MeshBasicMaterial({ map: atomTex }), CX, 0.55, CZ - 0.3215, 0, Math.PI, 0);
    p(new THREE.BoxGeometry(CWd + 0.08, 0.05, 0.66), topM, CX, 1.0, CZ); p(new THREE.BoxGeometry(CWd + 0.02, 0.012, 0.6), white, CX, 0.97, CZ);
    p(new THREE.BoxGeometry(CWd + 0.02, 0.01, 0.01), glowEdge, CX, 0.968, CZ - 0.33); p(new THREE.BoxGeometry(CWd - 0.1, 0.02, 0.012), glowEdge, CX, 0.9, CZ - 0.29);
    var CT = 1.025;
    var till = new THREE.Group(); till.position.set(CX - 0.42, CT, CZ + 0.02); till.rotation.y = Math.PI + 0.25; R.add(till);   // (the till: a tablet on a swivel stand, its screen toward you)
    lbP(new THREE.CylinderGeometry(0.06, 0.07, 0.015, 20), white, 0, 0.008, 0, 0, 0, 0, till); lbP(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 10), steel, 0, 0.08, 0, 0, 0, 0, till);
    var tsl = new THREE.Group(); tsl.position.set(0, 0.17, 0); tsl.rotation.x = -0.45; till.add(tsl);
    lbP(new THREE.BoxGeometry(0.3, 0.2, 0.014), dark, 0, 0, 0, 0, 0, 0, tsl); lbP(new THREE.PlaneGeometry(0.27, 0.17), new THREE.MeshBasicMaterial({ map: screenTex(42) }), 0, 0, 0.0075, 0, 0, 0, tsl);
    lbP(new THREE.BoxGeometry(0.1, 0.006, 0.07), dark, 0.2, -0.165, 0.05, 0.45, 0, 0, tsl);   // (a card reader)
    var dome = new THREE.Group(); dome.position.set(CX + 0.05, CT, CZ + 0.05); R.add(dome);   // (a glowing crystal under a glass dome)
    lbP(new THREE.CylinderGeometry(0.085, 0.095, 0.03, 28), white, 0, 0.015, 0, 0, 0, 0, dome); lbP(new THREE.TorusGeometry(0.08, 0.004, 6, 28), glowEdge, 0, 0.031, 0, Math.PI / 2, 0, 0, dome);
    var crys = lbLiquid(0x8affe8); [[0, 0.075, 0, 0.032, 0], [0.025, 0.055, 0.012, 0.018, 0.5], [-0.022, 0.052, -0.01, 0.016, -0.4]].forEach(function (c) { lbP(new THREE.OctahedronGeometry(c[3]), crys, c[0], c[1], c[2], 0, c[4], c[4], dome).scale.y = 1.8; });
    var dg = gl(new THREE.SphereGeometry(0.075, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), 0, 0.03, 0, dome); dg.scale.y = 1.6;
    lbP(new THREE.SphereGeometry(0.012, 10, 8), white, 0, 0.152, 0, 0, 0, 0, dome);
    lbBottle(R, 'vials', CX + 0.42, CT, CZ + 0.08, 0, 2, 1.3);
    var bell = new THREE.Group(); bell.position.set(CX + 0.4, CT, CZ - 0.18); R.add(bell);   // (a brass service bell)
    lbP(new THREE.CylinderGeometry(0.04, 0.042, 0.01, 20), dark, 0, 0.005, 0, 0, 0, 0, bell); lbP(new THREE.SphereGeometry(0.036, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), lbBrass, 0, 0.01, 0, 0, 0, 0, bell);
    lbP(new THREE.CylinderGeometry(0.004, 0.004, 0.012, 8), lbBrass, 0, 0.05, 0, 0, 0, 0, bell); lbP(new THREE.SphereGeometry(0.007, 8, 6), lbBrass, 0, 0.058, 0, 0, 0, 0, bell);
    for (var cbx = -1; cbx <= 1; cbx++) labSolids.push([LB_COUNTER[0] + cbx * 0.7, LB_COUNTER[1], 0.42]);
    // (the doorway out, and a mat before it)
    p(new THREE.PlaneGeometry(1.3, 2.2), rMat(0x3a4250), 0, 1.1, D - 0.02, 0, Math.PI, 0); p(new THREE.PlaneGeometry(1.2, 0.6), rMat(0x5a6476, { roughness: 1 }), 0, 0.006, D - 0.5, -Math.PI / 2, 0, 0);
    R.traverse(function (o) { if (o.isMesh) o.receiveShadow = true; });
  })(labRoom);
  var lbLook = new THREE.Vector3();
  function updateLabInside(t) {
    lbLook.set(camera.position.x - LBI_X, 0, camera.position.z - LBI_Z);
    lbWalls.forEach(function (W) { W.g.visible = lbLook.dot(W.n) < W.d - 0.6; });   // (the wall between you and the camera steps aside)
    if (lbDna) lbDna.offset.x = (t * 0.04) % 1;                       // (the DNA helix on the wall screen turning slowly)
    lbBubbles.forEach(function (b) { var f = (t * b.v + b.k) % 1; b.m.position.y = b.y0 + f * b.h; b.m.scale.setScalar(0.6 + f * 0.6); });   // (bubbles rising up the grow tubes)
    lbHolo.forEach(function (h) { h.m.opacity = 0.8 + Math.sin(t * 3 + h.k * 1.7) * 0.06 + (Math.sin(t * 37 + h.k) > 0.97 ? -0.2 : 0); });   // (the holograms shimmer, now and then flickering)
    lbArms.forEach(function (a) { var f = t * 0.7 + a.k * 2; a.b.rotation.y = a.ry + Math.sin(f) * 0.9; a.s1.rotation.z = 0.5 + Math.sin(f * 1.3) * 0.25; a.s2.rotation.z = -1.2 + Math.sin(f * 1.7) * 0.35; a.s3.rotation.z = -0.6 + Math.sin(f * 2.1) * 0.3; });
    lbChambers.forEach(function (g, i) { var b = g.userData.glow || 0.2; g.emissiveIntensity = b + b * 0.5 * Math.sin(t * 1.5 + i); });   // (the chambers and their glowing plants pulse softly)
    lbLights.forEach(function (l, i) { l.intensity = 0.45 * (1 + Math.sin(t * 2 + i * 2) * 0.02); });
  }
  function updateLabOutside(t) {
    var nt = labNight(); lbGlow.emissiveIntensity = 0.4 + nt * 0.8; lbGreen.emissiveIntensity = 0.6 + nt * 0.6;
    lbLiquids.forEach(function (m) { m.emissiveIntensity = 0.45 + nt * 0.55; });
    if (lbSignM) { lbSignM.emissiveIntensity = 0.25 + nt * 0.45; lbSignLampIn.emissiveIntensity = 0.2 + nt * 1.6; lbSignGlows.forEach(function (gl) { gl.material.opacity = nt * 0.75; }); }
    lbLamps.forEach(function (L, i) { var fl = Math.sin(t * 9 + i * 2) * 0.5 + Math.sin(t * 23 + i) * 0.3; L.m.emissiveIntensity = 0.5 + nt * (1.4 + fl * 0.3); L.f.scale.set(1 - fl * 0.06, 1.9 + fl * 0.18, 1 - fl * 0.06); L.gl.emissiveIntensity = nt * (0.12 + fl * 0.02); L.g.material.opacity = nt * (0.6 + fl * 0.06); });
    lbSmoke.forEach(function (s) { var f = (t * 0.18 + s.k / 6) % 1; s.m.position.set(-LAB_HW + 1.0 + Math.sin(f * 6 + s.k) * 0.15, LAB_H + 2.3 + f * 2.2, -0.9 + f * 0.4); s.m.scale.setScalar(0.6 + f * 1.6); s.m.material.opacity = 0.45 * Math.sin(f * Math.PI); });
  }
  function labDoorUse(goIn) {                                          // through Atom & Alembic's door, in or out
    if (doorBusy) return;
    doorBusy = true; doorArmed = false; walkTarget = null; doorSound(); fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (goIn) {
        indoors = true; inShop = inClinic = inBarn = inCarp = inCoop = inFbarn = inCloth = inHide = false; inLab = true;
        labScene.add(player); player.position.set(LBI_X, 0, LBI_Z + LBI_EXIT_Z - 0.8); facing = Math.PI;
        outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw }; cam.dist = 8; cam.pitch = 0.85; cam.yaw = 0;
      } else {
        indoors = false; inLab = false; scene.add(player);
        var o = labFront(1.6); player.position.set(o.x, 0, o.z); facing = LAB_TURN;
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
      }
      cam.target.set(player.position.x, 0.8, player.position.z);
      fadeBox.style.opacity = 0;
      setTimeout(function () { doorBusy = false; }, 380);
    }, 380);
  }
  window.everdawnLab = { counter: function () { if (!inLab) return false; var lx = player.position.x - LBI_X - LB_COUNTER[0], lz = player.position.z - LBI_Z - LB_COUNTER[1]; return Math.abs(lx) < LB_COUNTER_W / 2 + 0.2 && lz < -0.3 && lz > -1.35; } };   // (for the shop to come: whether you're at its counter)
  clothDrawOnMap = (function (base) { return function (g, K, label) {   // (on the world map: its slate roof and its name)
    base.apply(this, arguments);
    var p = mapXY(LAB_X, LAB_Z); g.save(); g.translate(p[0], p[1]); g.rotate(-LAB_TURN);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(-LAB_HW * K + 6, -LAB_HD * K + 8, LAB_HW * K * 2, LAB_HD * K * 2);
    g.fillStyle = '#3a404c'; g.fillRect(-LAB_HW * K - 3, -LAB_HD * K - 3, LAB_HW * K * 2 + 6, LAB_HD * K * 2 + 6);
    g.fillStyle = '#4c5464'; g.fillRect(-LAB_HW * K, -2, LAB_HW * K * 2, 4);
    g.restore();
    label('Atom & Alembic', LAB_X, LAB_Z, LAB_HD * K + 30);
  }; })(clothDrawOnMap);
  TELEPORTS.push({ name: 'Atom & Alembic', icon: '⚗️', spot: function () { var f = labFront(2.2); return { x: f.x, z: f.z, face: LAB_TURN + Math.PI, view: LAB_TURN }; } });
  DOOR_NAMES.lab = 'Atom & Alembic';
  updateCarpenter = (function (base) { return function (t, night) {
    base.apply(this, arguments);
    if (inLab && player.parent !== labScene) inLab = false;            // (carried home or teleported away from inside: no longer in the lab)
    if (inLab) updateLabInside(t); else updateLabOutside(t);
  }; })(updateCarpenter);
  updateDoors = (function (base) { return function () {
    var px = player.position.x, pz = player.position.z;
    if (inLab) {                                                       // (inside: walking out through the doorway takes her out)
      doorWasIn = true; doorNear = doorHinted = null;
      if (!doorArmed) { if (dist(px, pz, LBI_X, LBI_Z + LBI_EXIT_Z) > 0.85) doorArmed = true; return; }
      if (dist(px, pz, LBI_X, LBI_Z + LBI_EXIT_Z) < 0.5) labDoorUse(false);
      return;
    }
    base.apply(this, arguments);
    if (!indoors && dist(px, pz, labDoor.x, labDoor.z) < DOOR_REACH && !doorNear) doorNear = doorHinted = 'lab';   // (outside: by its door)
  }; })(updateDoors);
  interact = (function (base) { return function () {
    if (!flying && !indoors && doorNear === 'lab' && !doorBusy && !binOpen && !shopOpen && !barnShopOpen) { doorNear = null; walkTarget = null; labDoorUse(true); return; }
    return base.apply(this, arguments);
  }; })(interact);


  // ===== the mailbox, out in front of the farmhouse, just outside the white fence at its front right corner. A turned oak post
  // in a ring of stones with lavender at its foot and ivy climbing it, an iron scroll bracket, and on it a rounded plum-painted
  // mailbox banded in brass, its door (hinged at the bottom) wearing a gilded crescent moon and star, a little red flag on its
  // side. It does nothing yet: window.everdawnMailbox lets the mail come later (raise the flag, open the door) =====
  var MB_X = FENCE_R - 0.4, MB_Z = FENCE_F + 0.62, mbFlagUp = 0, mbFlagT = 0, mbDoorOpen = 0, mbDoorT = 0;
  var MB = new THREE.Group(); MB.position.set(MB_X, 0, MB_Z); house.add(MB);
  (function () {
    function P(geo, m, x, y, z, rx, ry, rz, par) { var o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0); o.castShadow = true; o.receiveShadow = true; (par || MB).add(o); return o; }
    var grainT = cpTex(64, 256, function (g, w, h) { g.fillStyle = '#6a4630'; g.fillRect(0, 0, w, h); for (var k = 0; k < 22; k++) { g.strokeStyle = k % 2 ? 'rgba(40,22,10,0.35)' : 'rgba(150,110,70,0.25)'; g.lineWidth = 1 + (k % 3 === 0); g.beginPath(); var gx = (k * 13) % w; g.moveTo(gx, 0); for (var y = 0; y <= h; y += 8) g.lineTo(gx + Math.sin(y * 0.04 + k) * 2, y); g.stroke(); }
      g.fillStyle = 'rgba(40,20,8,0.6)'; g.beginPath(); g.ellipse(30, 150, 4, 9, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(40,20,8,0.4)'; g.beginPath(); g.ellipse(30, 150, 7, 15, 0, 0, Math.PI * 2); g.stroke(); });
    grainT.wrapS = grainT.wrapT = THREE.RepeatWrapping; grainT.repeat.set(1, 2);
    var oak = new THREE.MeshStandardMaterial({ map: grainT, bumpMap: grainT, bumpScale: 0.004, roughness: 0.75 }), oakD = new THREE.MeshStandardMaterial({ color: 0x3e2618, roughness: 0.8 });
    var paintT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#7a58a0'; g.fillRect(0, 0, w, h); for (var k = 0; k < 60; k++) { g.fillStyle = k % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(30,10,50,0.08)'; g.fillRect(0, (k * 37) % h, w, 1 + k % 2); }   // (brushed paint, a little worn)
      for (var c = 0; c < 18; c++) { g.fillStyle = 'rgba(200,170,120,' + (0.15 + (c % 3) * 0.08) + ')'; g.beginPath(); g.arc((c * 53) % w, (c * 29) % h, 1 + c % 3, 0, Math.PI * 2); g.fill(); } });
    paintT.wrapS = paintT.wrapT = THREE.RepeatWrapping; paintT.repeat.set(4, 4);
    var plum = new THREE.MeshStandardMaterial({ map: paintT, color: 0xb8a0d0, roughness: 0.38, metalness: 0.35, envMap: rubyEnv, envMapIntensity: 0.6 }), plumIn = new THREE.MeshStandardMaterial({ color: 0x2a1a38, roughness: 0.8, side: THREE.BackSide });
    var brass = new THREE.MeshStandardMaterial({ color: 0xd9b05a, metalness: 0.8, roughness: 0.3, envMap: rubyEnv, envMapIntensity: 1.6, emissive: 0x2a1a04 }), iron = houseMats.iron;
    var flagRed = new THREE.MeshStandardMaterial({ color: 0xc8283a, roughness: 0.45, metalness: 0.2 });
    // (its foot: a ring of rounded stones, a bed of soil and a few pansies)
    var stoneM = [0x9a929c, 0xb0a8b4, 0x847c88].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }); });
    for (var st = 0; st < 11; st++) { var sa = st / 11 * Math.PI * 2; var so = P(new THREE.DodecahedronGeometry(0.07 + (st % 3) * 0.012), stoneM[st % 3], Math.sin(sa) * 0.3, 0.03, Math.cos(sa) * 0.3, st, st * 0.7, 0); so.scale.y = 0.6; }
    P(new THREE.CylinderGeometry(0.27, 0.28, 0.05, 20), houseMats.soil, 0, 0.02, 0);
    [[0.12, -0.16], [-0.18, 0.08], [0.2, 0.12]].forEach(function (pz, i) { for (var pt = 0; pt < 5; pt++) { var pa = pt / 5 * Math.PI * 2; var pe = P(new THREE.SphereGeometry(0.022, 8, 5), [houseMats.flowerPink, houseMats.flowerWhite, houseMats.flowerBlue][i], pz[0] + Math.sin(pa) * 0.022, 0.08, pz[1] + Math.cos(pa) * 0.022); pe.scale.y = 0.3; }
      P(new THREE.SphereGeometry(0.01, 6, 4), houseMats.flowerHeart, pz[0], 0.088, pz[1]); });
    // (the post: square oak, chamfered, with turned collars, set on a stone footing)
    P(new THREE.BoxGeometry(0.16, 0.08, 0.16), stoneM[1], 0, 0.05, 0);
    P(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 8), oak, 0, 0.55, 0, 0, Math.PI / 8, 0);
    [0.16, 0.24, 0.92].forEach(function (cy, i) { P(new THREE.CylinderGeometry(0.075, 0.075, i === 1 ? 0.02 : 0.04, 16), oakD, 0, cy, 0); });
    P(new THREE.BoxGeometry(0.22, 0.035, 0.5), oak, 0, 1.06, 0.02); P(new THREE.BoxGeometry(0.24, 0.012, 0.52), oakD, 0, 1.04, 0.02);   // (the board it sits on)
    // (an iron scroll bracket under the front of the board)
    var br = []; for (var k = 0; k <= 24; k++) { var u = k / 24; br.push(new THREE.Vector3(0, 0.82 + u * 0.21, 0.06 + Math.sin(u * Math.PI / 2) * 0.17)); }
    P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(br), 24, 0.008, 6), iron, 0, 0, 0);
    var cur = []; for (var k2 = 0; k2 <= 30; k2++) { var u2 = k2 / 30, a2 = u2 * Math.PI * 2.6, r2 = 0.045 * (1 - u2 * 0.8); cur.push(new THREE.Vector3(0, 0.95 + Math.sin(a2) * r2, 0.12 + Math.cos(a2) * r2)); }
    P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cur), 30, 0.005, 5), iron, 0, 0, 0);
    // (ivy winding up the post: two woody vines spiralling round it, thick at the foot and thinning as they climb, swelling out
    // over the collars, hung with real ivy leaves on little stalks - dark and glossy below, young and light near the tips - and
    // curling tendrils)
    var vineOld = new THREE.MeshStandardMaterial({ color: 0x6a5436, roughness: 0.8 }), vineYoung = new THREE.MeshStandardMaterial({ color: 0x6a8a3c, roughness: 0.7 });
    var ivyTex = cpTex(64, 64, function (g, w, h) { var gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#d8e8d0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(235,250,210,0.95)'; g.lineWidth = 1.6; [[0.5, 0.02], [0.08, 0.36], [0.92, 0.36], [0.0, 0.85], [1.0, 0.85]].forEach(function (v) { g.beginPath(); g.moveTo(w * 0.5, h); g.quadraticCurveTo(w * (0.5 + (v[0] - 0.5) * 0.4), h * (0.6 + v[1] * 0.2), w * v[0], h * v[1]); g.stroke(); }); });
    ivyTex.repeat.set(1, 1); ivyTex.offset.set(0.5, 0);
    var ivyMats = [0x3a8040, 0x4a9446, 0x5aa44c, 0x8ac866].map(function (c) { return new THREE.MeshStandardMaterial({ map: ivyTex, color: c, roughness: 0.4, metalness: 0.05, side: THREE.DoubleSide }); });
    var ivyShape = new THREE.Shape(); ivyShape.moveTo(0, 0);
    [[-0.22, -0.04, -0.42, 0.1], [-0.5, 0.22, -0.32, 0.36], [-0.58, 0.55, -0.4, 0.66], [-0.26, 0.7, -0.14, 0.72], [-0.08, 0.92, 0, 1]].forEach(function (c) { ivyShape.quadraticCurveTo(c[0], c[1], c[2], c[3]); });
    [[0.08, 0.92, 0.14, 0.72], [0.26, 0.7, 0.4, 0.66], [0.58, 0.55, 0.32, 0.36], [0.5, 0.22, 0.42, 0.1], [0.22, -0.04, 0, 0]].forEach(function (c) { ivyShape.quadraticCurveTo(c[0], c[1], c[2], c[3]); });
    var ivyGeo = new THREE.ShapeGeometry(ivyShape, 6);
    function postR(y) { var r = 0.066; [0.16, 0.24, 0.92].forEach(function (cy) { var d = Math.abs(y - cy); if (d < 0.05) r = Math.max(r, 0.066 + 0.016 * (1 - d / 0.05)); }); return r; }   // (out over the collars)
    var ivc;
    [0, Math.PI * 0.9].forEach(function (ph, vi) {
      var pts = [], top = vi ? 0.84 : 1.02, turns = vi ? 1.8 : 2.3;
      for (var k = 0; k <= 60; k++) { var u = k / 60, y = 0.05 + u * (top - 0.05), a = ph + u * Math.PI * 2 * turns + Math.sin(u * 9) * 0.12, r = postR(y) + 0.004 * Math.sin(u * 23); pts.push(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r)); }
      var cv = new THREE.CatmullRomCurve3(pts); if (!vi) ivc = cv;
      [[0, 0.3, 0.0068, vineOld], [0.3, 0.6, 0.0055, vineOld], [0.6, 0.85, 0.0043, vineYoung], [0.85, 1, 0.003, vineYoung]].forEach(function (sg) {   // (thick at the foot, thinner as it climbs)
        var sp = []; for (var k2 = 0; k2 <= 12; k2++) sp.push(cv.getPoint(sg[0] + (sg[1] - sg[0]) * k2 / 12)); P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(sp), 14, sg[2], 6), sg[3], 0, 0, 0); });
      var nl = vi ? 22 : 30;
      for (var lf = 0; lf < nl; lf++) {
        var u2 = 0.05 + lf / nl * 0.93, vp = cv.getPoint(u2), out = new THREE.Vector3(vp.x, 0, vp.z).normalize(), side = lf % 2 ? 1 : -1;
        var tan = cv.getTangent(u2), sideV = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), out).multiplyScalar(side * 0.4);
        var dir = out.clone().add(sideV).normalize(), stalkLen = 0.022 + (1 - u2) * 0.014, tip = vp.clone().add(dir.clone().multiplyScalar(stalkLen)).add(new THREE.Vector3(0, 0.008, 0));
        P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([vp, vp.clone().lerp(tip, 0.5).add(new THREE.Vector3(0, 0.006, 0)), tip]), 4, 0.0016, 4), vineYoung, 0, 0, 0);   // (the leaf's little stalk)
        var sz = 0.085 * (1.15 - u2 * 0.55) * (0.85 + (lf % 3) * 0.12), lg = new THREE.Group(); lg.position.copy(tip); lg.rotation.order = 'YXZ'; lg.rotation.set(0.35 + (lf % 3) * 0.15, Math.atan2(dir.x, dir.z), (lf % 2 ? 1 : -1) * (0.3 + (lf % 4) * 0.12)); MB.add(lg);
        var leafM = ivyMats[u2 > 0.82 ? 3 : u2 > 0.55 ? 2 : lf % 2]; var lm = P(ivyGeo, leafM, 0, 0, 0, 0, 0, 0, lg); lm.scale.set(sz, sz, sz); lm.rotation.x = -0.15; lm.castShadow = true;
      }
      for (var td = 0; td < 3; td++) {                                     // (curling tendrils)
        var tu = 0.2 + td * 0.3 + vi * 0.1, tp = cv.getPoint(tu), to = new THREE.Vector3(tp.x, 0, tp.z).normalize(), tpts = [];
        for (var k3 = 0; k3 <= 14; k3++) { var u3 = k3 / 14, a3 = u3 * Math.PI * 3, r3 = 0.012 * (1 - u3 * 0.7); tpts.push(tp.clone().add(to.clone().multiplyScalar(u3 * 0.025 + Math.cos(a3) * r3)).add(new THREE.Vector3(0, Math.sin(a3) * r3 - u3 * 0.01, 0))); }
        P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tpts), 16, 0.0011, 3), vineYoung, 0, 0, 0);
      }
    });
    // (the mailbox: a rounded tunnel of plum-painted metal, closed at the back, brass bands round it with rivets)
    var MW = 0.12, MH = 0.15, ML = 0.46;
    function tunnel(w, h, sh) { sh = sh || new THREE.Shape(); sh.moveTo(-w, 0); sh.lineTo(w, 0); sh.lineTo(w, h); sh.absarc(0, h, w, 0, Math.PI, false); sh.lineTo(-w, 0); return sh; }
    var boxG = new THREE.Group(); boxG.position.set(0, 1.078, -ML / 2 + 0.02); MB.add(boxG);
    var shell = tunnel(MW, MH); shell.holes.push(tunnel(MW - 0.008, MH, new THREE.Path()));
    P(new THREE.ExtrudeGeometry(shell, { depth: ML, bevelEnabled: false, curveSegments: 20 }), plum, 0, 0, 0, 0, 0, 0, boxG);
    P(new THREE.ShapeGeometry(tunnel(MW - 0.008, MH), 20), plumIn, 0, 0.0, 0.02, 0, 0, 0, boxG);   // (the dark inside)
    P(new THREE.ExtrudeGeometry(tunnel(MW, MH), { depth: 0.012, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2, curveSegments: 20 }), plum, 0, 0, -0.012, 0, 0, 0, boxG);   // (its back)
    P(new THREE.BoxGeometry(MW * 2 - 0.004, 0.006, ML - 0.01), plumIn, 0, 0.004, ML / 2, 0, 0, 0, boxG);
    [0.03, ML / 2, ML - 0.03].forEach(function (bz) { var band = tunnel(MW + 0.006, MH); band.holes.push(tunnel(MW - 0.002, MH, new THREE.Path()));
      P(new THREE.ExtrudeGeometry(band, { depth: 0.014, bevelEnabled: false, curveSegments: 20 }), brass, 0, 0, bz - 0.007, 0, 0, 0, boxG);
      [-1, 1].forEach(function (sd) { P(new THREE.SphereGeometry(0.006, 6, 4), brass, sd * (MW + 0.007), 0.04, bz); P(new THREE.SphereGeometry(0.006, 6, 4), brass, sd * (MW + 0.007), 0.11, bz); }); P(new THREE.SphereGeometry(0.006, 6, 4), brass, 0, MH + MW + 0.007, bz); });
    // (the door, hinged along the bottom, a gilded crescent moon and star on it, a brass latch knob at its top)
    var door = new THREE.Group(); door.position.set(0, 0, ML + 0.004); boxG.add(door);
    P(new THREE.ExtrudeGeometry(tunnel(MW + 0.006, MH + 0.002), { depth: 0.012, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 2, curveSegments: 20 }), plum, 0, 0, 0, 0, 0, 0, door);
    var trim = tunnel(MW, MH); trim.holes.push(tunnel(MW - 0.008, MH - 0.004, new THREE.Path())); P(new THREE.ShapeGeometry(trim, 20), brass, 0, 0.004, 0.0175, 0, 0, 0, door);
    var moon = new THREE.Shape(); moon.absarc(0, 0, 0.055, Math.PI * 0.3, Math.PI * 1.7, false); moon.absarc(0.026, 0, 0.044, Math.PI * 1.55, Math.PI * 0.45, true);
    P(new THREE.ExtrudeGeometry(moon, { depth: 0.004, bevelEnabled: true, bevelSize: 0.002, bevelThickness: 0.002, bevelSegments: 1, curveSegments: 16 }), houseMats.gold, -0.012, 0.13, 0.017, 0, 0, 0, door);
    var star = new THREE.Shape(); for (var sk = 0; sk < 10; sk++) { var sr = sk % 2 ? 0.01 : 0.024, sang = sk * Math.PI / 5 + Math.PI / 2; if (sk) star.lineTo(Math.cos(sang) * sr, Math.sin(sang) * sr); else star.moveTo(Math.cos(sang) * sr, Math.sin(sang) * sr); }
    P(new THREE.ExtrudeGeometry(star, { depth: 0.004, bevelEnabled: true, bevelSize: 0.0015, bevelThickness: 0.0015, bevelSegments: 1 }), houseMats.gold, 0.045, 0.165, 0.017, 0, 0, 0, door);
    [[0.05, 0.08, 0.006], [-0.07, 0.2, 0.005], [0.07, 0.22, 0.004]].forEach(function (d) { P(new THREE.SphereGeometry(d[2], 6, 4), houseMats.gold, d[0], d[1], 0.02, 0, 0, 0, door); });   // (a sprinkle of tiny stars)
    P(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 12), brass, 0, MH + MW - 0.02, 0.025, Math.PI / 2, 0, 0, door); P(new THREE.SphereGeometry(0.014, 12, 8), brass, 0, MH + MW - 0.02, 0.038, 0, 0, 0, door);
    P(new THREE.BoxGeometry(0.04, 0.012, 0.018), brass, 0, MH + MW + 0.004, 0.006, 0, 0, 0, door);   // (the latch tab over the top)
    [-0.07, 0.07].forEach(function (hx) { P(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 8), brass, hx, 0.0, 0.004, 0, 0, Math.PI / 2, door); });   // (hinge knuckles)
    // (the flag, on the right side, on a brass pivot: down for now, up when there's mail)
    var flag = new THREE.Group(); flag.position.set(MW + 0.012, 0.09, 0.12); boxG.add(flag);
    P(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 12), brass, 0, 0, 0, 0, 0, Math.PI / 2, flag);
    P(new THREE.BoxGeometry(0.008, 0.022, 0.24), flagRed, 0.008, 0, 0.11, 0, 0, 0, flag); P(new THREE.BoxGeometry(0.008, 0.075, 0.07), flagRed, 0.008, 0.026, 0.205, 0, 0, 0, flag);
    P(new THREE.SphereGeometry(0.005, 6, 4), brass, 0.014, 0, 0, 0, 0, 0, flag);
    // ---- more detail ----
    // (moss on the stones, and a cluster of little mushrooms among the lavender)
    for (var mo = 0; mo < 6; mo++) { var ma = mo / 6 * Math.PI * 2 + 0.2; var mm = P(new THREE.SphereGeometry(0.04, 8, 5), houseMats.leaf, Math.sin(ma) * 0.3, 0.06, Math.cos(ma) * 0.3); mm.scale.set(1, 0.25, 0.8); }
    [[-0.12, 0.2, 0.05], [-0.09, 0.23, 0.035], [-0.15, 0.17, 0.028]].forEach(function (mu) { P(new THREE.CylinderGeometry(mu[2] * 0.25, mu[2] * 0.35, mu[2] * 1.6, 8), houseMats.flowerWhite, mu[0], 0.045 + mu[2] * 0.8, mu[1]);
      var cp = P(new THREE.SphereGeometry(mu[2], 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc84a5a, roughness: 0.5 }), mu[0], 0.045 + mu[2] * 1.6, mu[1]); cp.scale.y = 0.65;
      for (var dt = 0; dt < 4; dt++) P(new THREE.SphereGeometry(mu[2] * 0.12, 5, 4), houseMats.flowerWhite, mu[0] + Math.sin(dt * 1.6) * mu[2] * 0.55, 0.045 + mu[2] * 1.6 + mu[2] * 0.45, mu[1] + Math.cos(dt * 1.6) * mu[2] * 0.55); });
    // (little white flowers along the ivy)
    for (var fw = 0; fw < 6; fw++) { var fp = ivc.getPoint(0.1 + fw * 0.15); for (var pt2 = 0; pt2 < 5; pt2++) { var pa2 = pt2 / 5 * Math.PI * 2; var pp = P(new THREE.SphereGeometry(0.008, 6, 4), houseMats.flowerWhite, fp.x * 1.12 + Math.sin(pa2) * 0.009, fp.y + Math.cos(pa2) * 0.009, fp.z * 1.12); pp.scale.z = 0.4; } P(new THREE.SphereGeometry(0.004, 5, 4), houseMats.flowerHeart, fp.x * 1.15, fp.y, fp.z * 1.15); }
    // (nail heads at the board, a cap of brass studs on the post's collars)
    [[-0.09, -0.2], [0.09, -0.2], [-0.09, 0.24], [0.09, 0.24]].forEach(function (nh) { P(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8), iron, nh[0], 1.08, nh[1]); });
    for (var bs = 0; bs < 8; bs++) { var ba = bs / 8 * Math.PI * 2; P(new THREE.SphereGeometry(0.006, 6, 4), brass, Math.sin(ba) * 0.077, 0.92, Math.cos(ba) * 0.077); }
    // (a second scroll, curling the other way, on the back of the post)
    var br2 = []; for (var k4 = 0; k4 <= 20; k4++) { var u4 = k4 / 20; br2.push(new THREE.Vector3(0, 0.86 + u4 * 0.17, -0.06 - Math.sin(u4 * Math.PI / 2) * 0.13)); }
    P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(br2), 20, 0.007, 6), iron, 0, 0, 0);
    var cur2 = []; for (var k5 = 0; k5 <= 26; k5++) { var u5 = k5 / 26, a5 = u5 * Math.PI * 2.4, r5 = 0.035 * (1 - u5 * 0.8); cur2.push(new THREE.Vector3(0, 0.96 + Math.sin(a5) * r5, -0.1 - Math.cos(a5) * r5)); }
    P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cur2), 26, 0.0045, 5), iron, 0, 0, 0);
    // (raised panels pressed into the box's sides, a starry stencil on them, and a brass plate with an envelope on the left side)
    var starT = cpTex(128, 64, function (g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(255,220,130,0.85)';
      for (var k = 0; k < 14; k++) { var sx = 8 + (k * 37) % (w - 16), sy = 8 + (k * 23) % (h - 16), sr = k % 4 ? 2.2 : 4; g.save(); g.translate(sx, sy); g.beginPath(); for (var i = 0; i < 10; i++) { var rr = i % 2 ? sr * 0.4 : sr, aa = i * Math.PI / 5; g.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } g.fill(); g.restore(); } });
    var starM = new THREE.MeshStandardMaterial({ map: starT, transparent: true, roughness: 0.4, metalness: 0.5, emissive: 0x3a2a08, depthWrite: false });
    [-1, 1].forEach(function (sd) {
      P(new THREE.BoxGeometry(0.004, 0.1, ML - 0.12), plum, sd * (MW + 0.002), 0.08, ML / 2, 0, 0, 0, boxG);
      [[0.03, ML - 0.12, 0.004], [0.13, ML - 0.12, 0.004]].forEach(function (e) { P(new THREE.BoxGeometry(0.006, e[2], e[1]), brass, sd * (MW + 0.004), e[0], ML / 2, 0, 0, 0, boxG); });
      P(new THREE.PlaneGeometry(ML - 0.14, 0.09), starM, sd * (MW + 0.0045), 0.08, ML / 2, 0, sd * Math.PI / 2, 0, boxG);
    });
    var plate = new THREE.Group(); plate.position.set(-MW - 0.008, 0.08, ML * 0.5); plate.rotation.y = -Math.PI / 2; boxG.add(plate);
    P(new THREE.BoxGeometry(0.09, 0.055, 0.004), brass, 0, 0, 0, 0, 0, 0, plate);
    var env = cpTex(96, 64, function (g, w, h) { g.fillStyle = '#d9b05a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#5a3a14'; g.lineWidth = 4; g.strokeRect(16, 12, w - 32, h - 24); g.beginPath(); g.moveTo(16, 12); g.lineTo(w / 2, h / 2 + 4); g.lineTo(w - 16, 12); g.stroke();
      g.fillStyle = '#c8283a'; g.beginPath(); g.arc(w / 2, h / 2 + 6, 6, 0, Math.PI * 2); g.fill(); });
    P(new THREE.PlaneGeometry(0.08, 0.047), new THREE.MeshStandardMaterial({ map: env, metalness: 0.6, roughness: 0.35, envMap: rubyEnv, envMapIntensity: 1 }), 0, 0, 0.0025, 0, 0, 0, plate);
    [[-0.04, 0.022], [0.04, 0.022], [-0.04, -0.022], [0.04, -0.022]].forEach(function (sc) { P(new THREE.SphereGeometry(0.003, 5, 4), iron, sc[0], sc[1], 0.003, 0, 0, 0, plate); });
    // (inside: a little tray of letters waiting, seen when the door drops open)
    P(new THREE.BoxGeometry(MW * 2 - 0.03, 0.004, ML - 0.08), oakD, 0, 0.012, ML / 2 - 0.02, 0, 0, 0, boxG);
    var letters = []; [[0, 0.02, 0xf2ead8, 0], [0.01, 0.026, 0xe8d8f0, 0.15], [-0.012, 0.031, 0xf8f0e0, -0.1]].forEach(function (lt) { var lg3 = new THREE.Group(); boxG.add(lg3); letters.push(lg3); var l = P(new THREE.BoxGeometry(0.15, 0.004, 0.1), new THREE.MeshStandardMaterial({ color: lt[2], roughness: 0.9 }), lt[0], lt[1], ML - 0.12, 0, lt[3], 0, lg3); P(new THREE.CircleGeometry(0.01, 10), flagRed, lt[0], lt[1] + 0.003, ML - 0.1, -Math.PI / 2, 0, 0, lg3); });   // (only there when you have mail)
    // (the flag gets a gilded star and rivets, and a little stop peg holds it level)
    P(new THREE.CircleGeometry(0.018, 5), houseMats.gold, 0.0125, 0.026, 0.205, 0, Math.PI / 2, 0, flag); P(new THREE.CircleGeometry(0.018, 5), houseMats.gold, 0.0035, 0.026, 0.205, 0, -Math.PI / 2, 0, flag);
    [0.06, 0.15].forEach(function (rz) { P(new THREE.SphereGeometry(0.004, 5, 4), brass, 0.013, 0, rz, 0, 0, 0, flag); });
    P(new THREE.CylinderGeometry(0.004, 0.004, 0.016, 6), brass, MW + 0.01, 0.06, 0.3, 0, 0, Math.PI / 2, boxG);
    // (a little bluebird perched on top)
    var bird = new THREE.Group(); bird.position.set(0.02, MH + MW + 0.012, 0.16); bird.rotation.y = 0.7; boxG.add(bird);
    var blue = new THREE.MeshStandardMaterial({ color: 0x4a7ad8, roughness: 0.6 }), breast = new THREE.MeshStandardMaterial({ color: 0xe88a4a, roughness: 0.7 });
    var body = P(new THREE.SphereGeometry(0.03, 14, 10), blue, 0, 0.028, 0, 0, 0, 0, bird); body.scale.set(0.85, 0.9, 1.25);
    var chest = P(new THREE.SphereGeometry(0.024, 12, 8), breast, 0, 0.022, 0.016, 0, 0, 0, bird); chest.scale.set(0.8, 0.85, 0.8);
    P(new THREE.SphereGeometry(0.02, 12, 8), blue, 0, 0.06, 0.026, 0, 0, 0, bird);
    P(new THREE.ConeGeometry(0.006, 0.016, 6), new THREE.MeshStandardMaterial({ color: 0x2a2018 }), 0, 0.058, 0.05, Math.PI / 2, 0, 0, bird);
    [-1, 1].forEach(function (sd) { P(new THREE.SphereGeometry(0.0035, 6, 4), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.2 }), sd * 0.013, 0.066, 0.038, 0, 0, 0, bird);
      var wg = P(new THREE.SphereGeometry(0.022, 10, 6), new THREE.MeshStandardMaterial({ color: 0x3a62b8, roughness: 0.6 }), sd * 0.022, 0.032, -0.006, 0, 0, 0, bird); wg.scale.set(0.3, 0.7, 1.3);
      P(new THREE.CylinderGeometry(0.0018, 0.0018, 0.014, 4), new THREE.MeshStandardMaterial({ color: 0xc8904a }), sd * 0.01, 0.004, 0.004, 0, 0, 0, bird); });
    var tail = P(new THREE.BoxGeometry(0.02, 0.004, 0.035), blue, 0, 0.03, -0.048, -0.35, 0, 0, bird);
    MB.userData = { door: door, flag: flag, bird: bird, bY: bird.position.y, letters: letters };
  })();
  (function () { var w = houseToWorld(MB_X, MB_Z); solids.push({ x: w.x, z: w.z, r: 0.33 }); })();   // (you can't walk through it)
  updateCarpenter = (function (base) { return function (t, night) {     // (the flag swings up and the door drops open smoothly when asked)
    base.apply(this, arguments);
    mbFlagT += (mbFlagUp - mbFlagT) * 0.12; mbDoorT += (mbDoorOpen - mbDoorT) * 0.15;
    MB.userData.flag.rotation.x = -mbFlagT * Math.PI / 2; MB.userData.door.rotation.x = mbDoorT * 1.45;
    var bd = MB.userData.bird; bd.rotation.y = 0.7 + Math.sin(t * 0.6) * 0.5 * (Math.sin(t * 0.23) > 0 ? 1 : 0.2); bd.position.y = MB.userData.bY + Math.max(0, Math.sin(t * 2.1)) * (Math.sin(t * 0.37) > 0.85 ? 0.02 : 0);   // (the bluebird looks about, and now and then hops)
  }; })(updateCarpenter);
  // ---- using the mailbox: stand by it and press Interact (E, or the controller's Interact button) to open it. It shows your
  // letters; pick one to read it, take any gift that came with it, or throw it away. Nothing sends mail yet: the townsfolk
  // will, through window.everdawnMailbox.deliver({ from, subject, body, gift: { id, count } }). Your mail is saved with the game ----
  var mbMail = [], mbOpen = false, mbReading = -1, mbWorld = houseToWorld(MB_X, MB_Z);
  function mbDist() { return dist(player.position.x, player.position.z, mbWorld.x, mbWorld.z); }
  function nearMailbox(range) { return !indoors && !flying && mbDist() < (range || 1.5); }
  function mailboxFirst() { return nearMailbox() && (!nearBin() || mbDist() <= dist(player.position.x, player.position.z, binWorld.x, binWorld.z)); }   // (beside the bin too: whichever you're closer to)
  var mbCss = document.createElement('style');
  mbCss.textContent = '.inventory.mailbox{width:min(460px,94%)}.mailbox .mb-empty{text-align:center;padding:18px 10px 8px;opacity:.85}.mailbox .mb-empty b{display:block;font-size:2.2em;margin-bottom:6px}' +
    '.mailbox .mb-list{display:flex;flex-direction:column;gap:6px;margin-top:6px}.mailbox .mb-item{display:flex;align-items:center;gap:10px;text-align:left;width:100%;padding:9px 12px;border-radius:12px;border:2px solid rgba(160,120,220,.35);background:rgba(255,255,255,.55);cursor:pointer;font:inherit;color:inherit}' +
    '.mailbox .mb-item.new{border-color:#b07ae8;background:rgba(244,232,255,.9)}.mailbox .mb-item .mb-ic{font-size:1.5em}.mailbox .mb-item .mb-txt{flex:1;min-width:0}.mailbox .mb-item .mb-txt small{display:block;opacity:.7}' +
    '.mailbox .mb-letter{background:#fbf5e6;border-radius:12px;padding:14px 16px;margin-top:6px;box-shadow:inset 0 0 0 2px rgba(180,140,80,.25);color:#3d3157;white-space:pre-wrap;line-height:1.45}.mailbox .mb-letter h4{margin:0 0 2px}.mailbox .mb-letter .mb-from{opacity:.7;margin:0 0 10px}' +
    '.ev-mini-pic{width:28px;height:28px;flex:none;overflow:hidden;display:inline-grid;place-items:center}.ev-mini-pic *{max-width:28px!important;max-height:28px!important;width:auto;height:auto}' +
    '.mailbox .mb-parcel{display:flex;flex-direction:column;gap:4px;margin-top:8px}.mailbox .mb-pitem{display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:10px;background:rgba(255,255,255,.6)}.mailbox .mb-pitem.taken{opacity:.5}.mailbox .mb-pitem>:first-child{width:30px;height:30px;flex:none;overflow:hidden;display:grid;place-items:center}.mailbox .mb-pitem>:first-child>*{max-width:100%;max-height:100%}' +
    '.mailbox .mb-row button.mb-del{background:#d8344a;color:#fff}.mailbox .mb-row button.mb-del:hover,.mailbox .mb-row button.mb-del.ev-padfocus{background:#b81e34}' +
    '.mailbox .mb-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px}.mailbox .mb-row button{padding:8px 14px;border-radius:999px;border:0;background:#8a5ad0;color:#fff;font:inherit;cursor:pointer}.mailbox .mb-row button.mb-quiet{background:rgba(120,90,170,.18);color:inherit}';
  document.head.appendChild(mbCss);
  var mbBtn = document.createElement('button'); mbBtn.type = 'button'; mbBtn.className = 'sleep-btn ship-btn mb-btn'; mbBtn.innerHTML = '📬 Mailbox <kbd>E</kbd>'; canvas.parentNode.appendChild(mbBtn);
  var mbBox = document.createElement('div'); mbBox.className = 'inventory ship mailbox'; mbBox.hidden = true;
  mbBox.innerHTML = '<div class="inv-head"><b>📬 Mailbox</b><button type="button" class="inv-close" aria-label="Close the mailbox">✕</button></div><div class="mb-body"></div>';
  canvas.parentNode.appendChild(mbBox);
  var mbBody = mbBox.querySelector('.mb-body');
  function pcPic(id) { var w = document.createElement('span'); w.className = 'ev-mini-pic'; w.appendChild(itemPicture(id)); return w; }   // (a small item picture, kept to its square)
  function mbEl(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function renderMailbox() {
    mbBody.innerHTML = '';
    if (mbReading >= 0 && mbMail[mbReading]) {                         // (reading one letter)
      var L = mbMail[mbReading], card = mbEl('div', 'mb-letter');
      card.appendChild(mbEl('h4', '', L.subject || 'A letter')); card.appendChild(mbEl('p', 'mb-from', 'From ' + (L.from || 'someone in town')));
      card.appendChild(mbEl('div', '', L.body || '')); mbBody.appendChild(card);
      var row = mbEl('div', 'mb-row');
      if (L.gifts && L.gifts.length) {                                  // (a parcel: everything in it, and a button to take it all)
        var ul = mbEl('div', 'mb-parcel'); L.gifts.forEach(function (G) { if (!ITEMS[G.id]) return; var li = mbEl('div', 'mb-pitem' + (G.taken ? ' taken' : '')); li.appendChild(pcPic(G.id)); li.appendChild(mbEl('span', '', ITEMS[G.id].name + (G.count > 1 ? ' ×' + G.count : '') + (G.taken ? ' ✓' : ''))); ul.appendChild(li); }); mbBody.insertBefore(ul, null);
        if (L.gifts.some(function (G) { return !G.taken; })) { var ta = mbEl('button', '', L.gifts.length > 1 ? 'Take everything' : 'Take it'); ta.type = 'button';
          ta.addEventListener('click', function () { var got = 0, left = 0; L.gifts.forEach(function (G) { if (G.taken || !ITEMS[G.id]) return; if (addItem(G.id, G.count || 1)) { G.taken = true; got++; } else left++; });
            if (got) { coinSound(4); renderBag(); showToast(left ? '🎁 Some of it went into your bag: your bag is full' : '🎁 It all went into your bag', 2200); } else showToast('Your bag is full', 2200); renderMailbox(); }); row.appendChild(ta); }
      }
      if (L.gift && !L.taken && ITEMS[L.gift.id]) { var g = mbEl('button', '', 'Take the gift: ' + ITEMS[L.gift.id].name + (L.gift.count > 1 ? ' ×' + L.gift.count : '')); g.type = 'button';
        g.addEventListener('click', function () { if (addItem(L.gift.id, L.gift.count || 1)) { L.taken = true; coinSound(4); showToast('🎁 ' + ITEMS[L.gift.id].name + ' went into your bag'); renderBag(); } else showToast('Your bag is full', 2200); renderMailbox(); }); row.appendChild(g); }
      var back = mbEl('button', 'mb-quiet', 'Back'); back.type = 'button'; back.addEventListener('click', function () { mbReading = -1; renderMailbox(); }); row.appendChild(back);
      var del = mbEl('button', 'mb-del', 'Delete'); del.type = 'button'; del.addEventListener('click', function () { mbMail.splice(mbReading, 1); mbReading = -1; renderMailbox(); }); row.appendChild(del);
      mbBody.appendChild(row); return;
    }
    if (!mbMail.length) { var em = mbEl('div', 'mb-empty'); em.appendChild(mbEl('b', '', '📭')); em.appendChild(mbEl('p', '', 'Your mailbox is empty.')); em.appendChild(mbEl('p', '', 'Letters and parcels from the townsfolk will arrive here.')); mbBody.appendChild(em); }
    else { var list = mbEl('div', 'mb-list'); mbMail.forEach(function (L, i) { var b = mbEl('button', 'mb-item' + (L.read ? '' : ' new')); b.type = 'button';
      b.appendChild(mbEl('span', 'mb-ic', mbUntaken(L) ? (L.gifts ? '📦' : '🎁') : L.read ? '✉️' : '💌')); var t = mbEl('span', 'mb-txt'); t.appendChild(mbEl('b', '', L.subject || 'A letter')); t.appendChild(mbEl('small', '', 'From ' + (L.from || 'someone in town'))); b.appendChild(t);
      b.addEventListener('click', function () { L.read = true; mbReading = i; renderMailbox(); }); list.appendChild(b); }); mbBody.appendChild(list); }
    var cr = mbEl('div', 'mb-row'), cl = mbEl('button', 'mb-quiet', 'Close'); cl.type = 'button'; cl.addEventListener('click', function () { closeMailbox(); focusGame(); }); cr.appendChild(cl); mbBody.appendChild(cr);
  }
  function openMailbox() {
    if (mbOpen) return;
    toggleBag(false); if (binOpen) closeBin();
    mbOpen = true; menuOpenedAt = Date.now(); walkTarget = null; mbReading = -1; mbBox.hidden = false; renderMailbox();
    mbDoorOpen = 1; doorSound();
  }
  function closeMailbox() { if (!mbOpen) return; mbOpen = false; mbBox.hidden = true; mbDoorOpen = 0; }
  function mbUntaken(L) { return (L.gift && !L.taken) || (L.gifts && L.gifts.some(function (G) { return !G.taken; })); }
  // (a little speech bubble with an envelope floats over the mailbox, bobbing, while there's new mail in it)
  var mbBubble = new THREE.Sprite(new THREE.SpriteMaterial({ map: cpTex(128, 140, function (g, w, h) {
    g.fillStyle = 'rgba(60,30,80,0.25)'; g.beginPath(); g.ellipse(w / 2, 62, 56, 54, 0, 0, Math.PI * 2); g.fill();   // (a soft shadow)
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(w / 2, 58, 54, 52, 0, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(w / 2 - 14, 100); g.lineTo(w / 2 + 14, 100); g.lineTo(w / 2, 134); g.closePath(); g.fill();   // (its tail, pointing down at the box)
    g.strokeStyle = '#b07ae8'; g.lineWidth = 4; g.beginPath(); g.ellipse(w / 2, 58, 52, 50, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff4e0'; g.strokeStyle = '#8a5ad0'; g.lineWidth = 3.5; g.beginPath(); g.rect(30, 38, 68, 44); g.fill(); g.stroke();   // (the envelope)
    g.beginPath(); g.moveTo(30, 38); g.lineTo(64, 64); g.lineTo(98, 38); g.stroke(); g.beginPath(); g.moveTo(30, 82); g.lineTo(54, 60); g.moveTo(98, 82); g.lineTo(74, 60); g.stroke();
    g.fillStyle = '#e8344a'; g.beginPath(); g.moveTo(64, 74); g.bezierCurveTo(52, 64, 54, 54, 64, 60); g.bezierCurveTo(74, 54, 76, 64, 64, 74); g.fill();   // (a little heart seal)
  }), transparent: true, depthWrite: false }));
  mbBubble.scale.set(0.72, 0.79, 1); mbBubble.position.set(0, 2.0, 0); mbBubble.visible = false; mbBubble.renderOrder = 3; MB.add(mbBubble);
  function mbRefresh() {
    var unread = mbMail.some(function (L) { return !L.read || mbUntaken(L); }); mbFlagUp = unread ? 1 : 0; MB.userData.letters.forEach(function (o, i) { o.visible = i < mbMail.length; });
    mbBubble.visible = unread && !mbOpen; if (mbBubble.visible) { var tb = performance.now() / 1000; mbBubble.position.y = 2.0 + Math.sin(tb * 2.4) * 0.07; var sc = 1 + Math.sin(tb * 4.8) * 0.03; mbBubble.scale.set(0.72 * sc, 0.79 * sc, 1); }
  }
  mbBox.querySelector('.inv-close').addEventListener('click', function () { closeMailbox(); focusGame(); });
  mbBtn.addEventListener('click', function () { openMailbox(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && mbOpen) { e.stopImmediatePropagation(); e.preventDefault(); if (mbReading >= 0) { mbReading = -1; renderMailbox(); } else closeMailbox(); } }, true);   // (Escape, or ○ / B on a controller: back, then shut)
  interact = (function (base) { return function () {
    if (mbOpen) { if (!menuJustOpened()) closeMailbox(); return; }
    if (!binOpen && !shopOpen && !barnShopOpen && !doorBusy && mailboxFirst()) { openMailbox(); return; }
    return base.apply(this, arguments);
  }; })(interact);
  updateShipping = (function (base) { return function () {
    base.apply(this, arguments);
    if (mbOpen && !nearMailbox(3.2)) closeMailbox();                   // (it shuts if you walk away)
    var first = !mbOpen && !binOpen && mailboxFirst();
    if ((first || mbOpen) && shipBtn.classList.contains('show')) shipBtn.classList.remove('show');   // (by the mailbox, its button shows rather than the bin's)
    if (mbBtn.classList.contains('show') !== first) mbBtn.classList.toggle('show', first);
    mbRefresh();
  }; })(updateShipping);
  saveGame = (function (base) { return function () {                     // (your letters are kept in the save)
    var r = base.apply(this, arguments);
    try { var d = JSON.parse(localStorage.getItem(SAVE_KEY)); if (d) { d.mail = mbMail; localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } } catch (err) {}
    return r;
  }; })(saveGame);
  loadGame = (function (base) { return function () {
    var r = base.apply(this, arguments);
    try { var d = JSON.parse(localStorage.getItem(SAVE_KEY)); mbMail = d && d.mail ? d.mail : []; } catch (err) { mbMail = []; }
    closeMailbox(); return r;
  }; })(loadGame);
  window.everdawnMailbox = {                                             // (for the townsfolk's mail, when it comes)
    spot: function () { return houseToWorld(MB_X, MB_Z + 0.7); },
    deliver: function (letter) { mbMail.unshift({ from: letter.from, subject: letter.subject, body: letter.body, gift: letter.gift || null, gifts: letter.gifts || null, read: false, day: state.day }); if (mbOpen) renderMailbox(); showToast('📬 You’ve got mail!', 2800); },
    mail: function () { return mbMail; },
    isOpen: function () { return mbOpen; }
  };

  // ===== the shop menus keep their place: picking an item (which redraws the list in some shops) no longer jumps the list,
  // or the whole menu, back to the top. Each shop remembers how far you've scrolled while it's open, and puts the new list
  // back there as it's redrawn; opening a shop again starts at the top =====
  (function () {
    var saved = new WeakMap();
    function shopOf(el) { return el && el.closest ? el.closest('.inventory.shop') : null; }
    document.addEventListener('scroll', function (e) {
      var t = e.target, box = shopOf(t); if (!box) return;
      var s = saved.get(box) || {}; if (t === box) s.box = t.scrollTop; else if (t.classList.contains('shop-tiles')) { s.tiles = t.scrollTop; s.el = t; } saved.set(box, s);
    }, true);
    var mo = new MutationObserver(function (muts) {
      var boxes = []; muts.forEach(function (m) { var b = shopOf(m.target.nodeType === 1 ? m.target : m.target.parentNode); if (b && boxes.indexOf(b) < 0) boxes.push(b); });
      boxes.forEach(function (box) {
        if (box.hidden) { saved.delete(box); return; }                    // (closed: next time it opens at the top)
        var s = saved.get(box); if (!s) return;
        var tiles = box.querySelector('.shop-tiles');
        if (tiles && s.tiles && tiles.scrollTop !== s.tiles) { tiles.scrollTop = s.tiles; s.el = tiles; }   // (a fresh list: back to where you were)
        if (s.box && box.scrollTop !== s.box && box.scrollHeight - box.clientHeight >= s.box - 1) box.scrollTop = s.box;
      });
    });
    function watch(box) { if (!box.__evKeep) { box.__evKeep = true; mo.observe(box, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] }); } }
    [].slice.call(document.querySelectorAll('.inventory.shop')).forEach(watch);
    new MutationObserver(function () { [].slice.call(canvas.parentNode.querySelectorAll('.inventory.shop')).forEach(watch); }).observe(canvas.parentNode, { childList: true });   // (and any shop added later)
  })();

  // ===== Atom & Alembic's shop, at the lab's counter: stand at the counter and press Interact (E, or Interact on a controller)
  // or tap its button. For sale: a Computer (20,000 Star Coins), which comes with its own sleek black desk. It goes into
  // your bag as furniture: inside your house, open Decor Mode to set it down like the rest of your furniture =====
  var LAB_COMPUTER_COST = 20000, labShopOpen = false;
  function buildComputerDesk() {                                         // (a black modern desk with a computer on it, facing +z)
    var g = new THREE.Group(), matte = rMat(0x141418, { roughness: 0.5 }), gloss = rMat(0x0c0c10, { roughness: 0.15, metalness: 0.25, envMap: rubyEnv, envMapIntensity: 0.6 });
    var steel = rMat(0x24242a, { metalness: 0.8, roughness: 0.3, envMap: rubyEnv, envMapIntensity: 0.8 }), edge = rMat(0x2c2c34, { metalness: 0.6, roughness: 0.3 });
    // (the desk: a glossy black top with a slim bevelled edge, on two black steel sled legs joined by a crossbar, a cable tray
    // under the back, and a handle-less drawer unit on the right)
    decorMesh(new THREE.BoxGeometry(1.4, 0.035, 0.7), gloss, 0, 0.755, 0, g); decorMesh(new THREE.BoxGeometry(1.41, 0.012, 0.71), edge, 0, 0.732, 0, g);
    [-0.64, 0.64].forEach(function (lx) {
      decorMesh(new THREE.BoxGeometry(0.04, 0.72, 0.04), steel, lx, 0.37, -0.29, g); decorMesh(new THREE.BoxGeometry(0.04, 0.72, 0.04), steel, lx, 0.37, 0.29, g);
      decorMesh(new THREE.BoxGeometry(0.04, 0.04, 0.62), steel, lx, 0.02, 0, g); decorMesh(new THREE.BoxGeometry(0.04, 0.03, 0.62), steel, lx, 0.715, 0, g);
      [-0.29, 0.29].forEach(function (fz) { decorMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.01, 10), rMat(0x0a0a0a), lx, 0.005, fz, g); });
    });
    decorMesh(new THREE.BoxGeometry(1.24, 0.03, 0.03), steel, 0, 0.18, -0.29, g);
    decorMesh(new THREE.BoxGeometry(0.9, 0.06, 0.12), matte, -0.05, 0.69, -0.24, g);   // (the cable tray)
    var dr = new THREE.Group(); dr.position.set(0.42, 0, 0.0); g.add(dr);
    decorMesh(new THREE.BoxGeometry(0.4, 0.58, 0.6), matte, 0, 0.42, 0, dr);
    [0.6, 0.42, 0.22].forEach(function (dy, i) { decorMesh(new THREE.BoxGeometry(0.38, i === 2 ? 0.26 : 0.16, 0.012), gloss, 0, dy, 0.306, dr); decorMesh(new THREE.BoxGeometry(0.2, 0.006, 0.006), edge, 0, dy + (i === 2 ? 0.12 : 0.07), 0.314, dr); });
    // (under the left of the desk: a black PC tower with a glass side, glowing inside)
    var pc = new THREE.Group(); pc.position.set(-0.45, 0, -0.04); g.add(pc);
    decorMesh(new THREE.BoxGeometry(0.22, 0.46, 0.44), matte, 0, 0.25, 0, pc); decorMesh(new THREE.BoxGeometry(0.004, 0.4, 0.38), new THREE.MeshStandardMaterial({ color: 0x5a3a8a, transparent: true, opacity: 0.55, roughness: 0.05, emissive: 0x6a3ad8, emissiveIntensity: 0.6 }), 0.112, 0.26, 0, pc);
    [0.38, 0.26, 0.14].forEach(function (fy) { decorMesh(new THREE.TorusGeometry(0.045, 0.006, 6, 20), rMat(0xb88aff, { emissive: 0xa070ff, emissiveIntensity: 1 }), 0.1, fy, 0.12, pc).rotation.y = Math.PI / 2; });
    decorMesh(new THREE.BoxGeometry(0.2, 0.008, 0.008), rMat(0x9af2ff, { emissive: 0x6ae8ff, emissiveIntensity: 1.2 }), 0, 0.47, 0.222, pc); decorMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 10), rMat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 1 }), 0.07, 0.43, 0.222, pc).rotation.x = Math.PI / 2;
    [[-0.08, -0.18], [0.08, -0.18], [-0.08, 0.18], [0.08, 0.18]].forEach(function (f) { decorMesh(new THREE.BoxGeometry(0.03, 0.02, 0.03), steel, f[0], 0.01, f[1], pc); });
    // (on the desk: a slim wide monitor on a steel stand, its screen lit, a keyboard, a mouse on a pad, a little speaker either side,
    // a lamp, a mug and a small plant)
    var scrTex = cpTex(512, 256, function (c, w, h) { var gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1a1040'); gr.addColorStop(0.55, '#4a2a8a'); gr.addColorStop(1, '#d86aa8'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      for (var i = 0; i < 60; i++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + (i % 4) * 0.15) + ')'; c.fillRect((i * 97) % w, (i * 53) % (h * 0.6), 2, 2); }
      c.fillStyle = '#fff4d8'; c.beginPath(); c.arc(w * 0.72, h * 0.32, 34, 0, Math.PI * 2); c.fill(); c.fillStyle = '#4a2a8a'; c.beginPath(); c.arc(w * 0.72 + 14, h * 0.32 - 8, 30, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#120a28'; c.beginPath(); c.moveTo(0, h); for (var x = 0; x <= w; x += 16) c.lineTo(x, h - 40 - Math.sin(x * 0.02) * 16 - Math.sin(x * 0.05) * 8); c.lineTo(w, h); c.fill();
      c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(0, h - 18, w, 18); c.fillStyle = 'rgba(255,255,255,0.75)'; [[12, '◐'], [36, '✉'], [60, '♪'], [84, '⚗']].forEach(function (ic) { c.font = '13px sans-serif'; c.fillText(ic[1], ic[0], h - 5); }); c.fillText('9:41', w - 36, h - 5); });
    var mon = new THREE.Group(); mon.position.set(-0.05, 0.773, -0.17); g.add(mon);
    decorMesh(new THREE.BoxGeometry(0.26, 0.012, 0.18), steel, 0, 0.006, 0, mon); decorMesh(new THREE.BoxGeometry(0.05, 0.26, 0.025), steel, 0, 0.14, -0.06, mon);
    decorMesh(new THREE.BoxGeometry(0.84, 0.38, 0.022), gloss, 0, 0.34, -0.04, mon);
    var scr = decorMesh(new THREE.PlaneGeometry(0.81, 0.35), new THREE.MeshStandardMaterial({ map: scrTex, emissive: 0xffffff, emissiveMap: scrTex, emissiveIntensity: 0.9, roughness: 0.25 }), 0, 0.345, -0.028, mon); scr.castShadow = false;
    decorMesh(new THREE.BoxGeometry(0.84, 0.03, 0.006), rMat(0x1c1c22, { roughness: 0.4 }), 0, 0.165, -0.027, mon); decorMesh(new THREE.SphereGeometry(0.004, 6, 4), rMat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.8 }), 0.38, 0.165, -0.023, mon);
    var kb = new THREE.Group(); kb.position.set(-0.1, 0.773, 0.12); g.add(kb);
    decorMesh(new THREE.BoxGeometry(0.44, 0.014, 0.14), matte, 0, 0.007, 0, kb);
    for (var kr = 0; kr < 5; kr++) for (var kc = 0; kc < 14; kc++) decorMesh(new THREE.BoxGeometry(0.024, 0.008, 0.019), gloss, -0.195 + kc * 0.03, 0.017, -0.05 + kr * 0.025, kb);
    decorMesh(new THREE.BoxGeometry(0.42, 0.003, 0.004), rMat(0xb88aff, { emissive: 0xa070ff, emissiveIntensity: 0.8 }), 0, 0.01, 0.071, kb);   // (a glow along its front)
    decorMesh(new THREE.BoxGeometry(0.24, 0.003, 0.2), rMat(0x1e1a2a, { roughness: 0.9 }), 0.25, 0.774, 0.12, g); var mouse = decorMesh(new THREE.SphereGeometry(0.028, 14, 8), gloss, 0.25, 0.78, 0.13, g); mouse.scale.set(0.75, 0.42, 1.25);
    [-0.53, 0.43].forEach(function (sx) { decorMesh(new THREE.BoxGeometry(0.08, 0.16, 0.08), matte, sx, 0.853, -0.2, g); decorMesh(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 16), steel, sx, 0.87, -0.159, g).rotation.x = Math.PI / 2; decorMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 12), steel, sx, 0.81, -0.159, g).rotation.x = Math.PI / 2; });
    var lamp = new THREE.Group(); lamp.position.set(0.58, 0.773, -0.2); g.add(lamp);
    decorMesh(new THREE.CylinderGeometry(0.06, 0.065, 0.012, 20), steel, 0, 0.006, 0, lamp); decorMesh(new THREE.CylinderGeometry(0.008, 0.008, 0.34, 8), steel, 0, 0.17, 0, lamp);
    decorMesh(new THREE.BoxGeometry(0.008, 0.008, 0.2), steel, 0, 0.34, 0.09, lamp); decorMesh(new THREE.BoxGeometry(0.03, 0.012, 0.16), matte, 0, 0.332, 0.15, lamp); decorMesh(new THREE.BoxGeometry(0.022, 0.003, 0.14), rMat(0xfff6e0, { emissive: 0xfff0d0, emissiveIntensity: 1.2 }), 0, 0.325, 0.15, lamp);
    decorMesh(lbLathe([[0, 0], [0.034, 0], [0.038, 0.09], [0.034, 0.09], [0.03, 0.006], [0, 0.006]], 18), rMat(0xf2f2f6, { roughness: 0.35, side: THREE.DoubleSide }), 0.5, 0.773, 0.16, g);
    decorMesh(new THREE.CircleGeometry(0.031, 16), rMat(0x5a3418, { roughness: 0.2 }), 0.5, 0.848, 0.16, g).rotation.x = -Math.PI / 2;
    var pl = new THREE.Group(); pl.position.set(-0.58, 0.773, 0.18); g.add(pl); decorMesh(new THREE.CylinderGeometry(0.045, 0.035, 0.08, 16), rMat(0x2a2a30, { roughness: 0.5 }), 0, 0.04, 0, pl);
    for (var lf = 0; lf < 8; lf++) { var la = lf * 2.4, lm = decorMesh(new THREE.SphereGeometry(0.5, 8, 5), rMat(lf % 2 ? 0x4a9a4a : 0x5aaa5a, { roughness: 0.6 }), Math.sin(la) * 0.02, 0.12, Math.cos(la) * 0.02, pl); lm.scale.set(0.02, 0.09, 0.006); lm.rotation.set(Math.cos(la) * 0.4, la, -Math.sin(la) * 0.4); }
    return g;
  }
  DECOR.decor_computer = { name: 'Computer', icon: '🖥️', w: 1.42, d: 0.72, bumps: [[-0.4, 0, 0.4], [0.4, 0, 0.4]], make: buildComputerDesk };
  ITEMS.decor_computer = { name: 'Computer', icon: '🖥️', info: 'A computer on a sleek black desk. Furniture for your house. Inside, press ' + everdawnKeyName(decorKey || 'KeyG') + ' for Decor Mode to place it.' };
  var compShopIcon = (function () { var c = document.createElement('canvas'); c.width = c.height = 128; var x = c.getContext('2d');   // (a little picture of it for the shop)
    x.fillStyle = '#16161c'; x.fillRect(14, 70, 100, 8); x.fillRect(18, 78, 5, 36); x.fillRect(105, 78, 5, 36); x.fillRect(80, 78, 24, 30);
    var gr = x.createLinearGradient(24, 26, 104, 62); gr.addColorStop(0, '#2a1a60'); gr.addColorStop(1, '#d86aa8'); x.fillStyle = '#0c0c10'; x.fillRect(22, 22, 84, 44); x.fillStyle = gr; x.fillRect(25, 25, 78, 37);
    x.fillStyle = '#fff4d8'; x.beginPath(); x.arc(84, 36, 6, 0, Math.PI * 2); x.fill(); x.fillStyle = '#2a2a32'; x.fillRect(60, 66, 8, 4); x.fillRect(52, 69, 24, 2); x.fillStyle = '#2a2a32'; x.fillRect(36, 66, 30, 3);
    x.fillStyle = '#b88aff'; x.fillRect(30, 26, 0, 0); return c.toDataURL(); })();
  var labShopBtn = document.createElement('button'); labShopBtn.type = 'button'; labShopBtn.className = 'sleep-btn ship-btn'; labShopBtn.innerHTML = '⚗️ Shop <kbd>E</kbd>'; canvas.parentNode.appendChild(labShopBtn);
  var labShopBox = document.createElement('div'); labShopBox.className = 'inventory ship shop'; labShopBox.hidden = true;
  labShopBox.innerHTML = '<div class="inv-head"><b>⚗️ Atom &amp; Alembic</b><button type="button" class="inv-close" aria-label="Close the shop">✕</button></div>' +
    '<p class="ship-hint">Welcome to Atom &amp; Alembic! The finest science and technology for your home.</p>' +
    '<div class="shop-item"><div class="slot shop-pic comp-pic"></div><div class="shop-text"><b>Computer</b><span>A sleek computer with a wide, glowing screen, a lit keyboard and mouse, little speakers and a desk lamp, a PC tower with a glass side glowing violet, a mug and a small plant. It comes with its own modern black desk, with steel legs and a drawer unit. It goes into your bag: inside your house, use Decor Mode to set it down.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + LAB_COMPUTER_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="comp-buy">Buy</button></div>' +
    '<p class="ship-total">You have <img class="coin-icon" alt=""> <b>0</b></p>';
  canvas.parentNode.appendChild(labShopBox);
  (function () { var pic = document.createElement('img'); pic.src = compShopIcon; pic.alt = ''; pic.style.width = '96%'; pic.style.pointerEvents = 'none'; labShopBox.querySelector('.comp-pic').appendChild(pic); })();
  shopCards(labShopBox); labShopBox.querySelector('.shop-card').parentNode.insertBefore(shopHeading('Technology'), labShopBox.querySelector('.shop-card'));
  var labTilesSync = shopCatalogue(labShopBox); labShopBox.classList.add('shop-wide');
  var labShopCoins = labShopBox.querySelector('.ship-total b'), compBuyBtn = labShopBox.querySelector('.comp-buy');
  function renderLabShop() {
    labShopCoins.textContent = state.coins;
    compBuyBtn.innerHTML = 'Buy · <img class="coin-icon" alt=""> ' + LAB_COMPUTER_COST.toLocaleString('en-US'); compBuyBtn.disabled = state.coins < LAB_COMPUTER_COST;
    labTilesSync();
  }
  function openLabShop() { if (labShopOpen) return; toggleBag(false); labShopOpen = true; menuOpenedAt = Date.now(); walkTarget = null; labShopBox.hidden = false; renderLabShop(); }
  function closeLabShop() { labShopOpen = false; labShopBox.hidden = true; }
  labShopBox.querySelector('.inv-close').addEventListener('click', function () { closeLabShop(); focusGame(); });
  labShopBtn.addEventListener('click', function () { openLabShop(); focusGame(); });
  compBuyBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (state.coins < LAB_COMPUTER_COST) { showToast('Not enough Star Coins', 1800); return; }
    if (!addItem('decor_computer', 1)) { showToast('Your bag is full', 1800); return; }
    state.coins -= LAB_COMPUTER_COST; showCoins(true); coinSound(20); renderBag();
    showToast('🖥️ Your Computer is in your bag! Inside your house, use Decor Mode to set it down: it comes with its own black desk', 4200);
    renderLabShop();
  });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && labShopOpen) { e.stopImmediatePropagation(); e.preventDefault(); closeLabShop(); } }, true);   // (Escape, or ○ / B on a controller)
  function atLabCounter(margin) {                                         // (standing at the counter, on the customer's side)
    if (!inLab) return false; var m = margin || 0, lx = player.position.x - LBI_X - LB_COUNTER[0], lz = player.position.z - LBI_Z - LB_COUNTER[1];
    return Math.abs(lx) < LB_COUNTER_W / 2 + 0.2 + m && lz < -0.3 && lz > -1.35 - m;
  }
  interact = (function (base) { return function () {
    if (labShopOpen) { if (!menuJustOpened()) closeLabShop(); return; }
    if (atLabCounter() && !doorBusy) { openLabShop(); return; }
    return base.apply(this, arguments);
  }; })(interact);
  updateCarpenter = (function (base) { return function (t, night) {
    base.apply(this, arguments);
    if (labShopOpen && !atLabCounter(1.0)) closeLabShop();               // (it shuts if you walk away from the counter)
    if (labShopOpen && labShopCoins.textContent !== String(state.coins)) renderLabShop();
    var show = atLabCounter() && !labShopOpen;
    if (labShopBtn.classList.contains('show') !== show) labShopBtn.classList.toggle('show', show);
  }; })(updateCarpenter);

  // ===== the Computer, working: in your house, stand by it and press Interact (E, or Interact on a controller), or tap its
  // button. Its screen shows a desktop with an icon for every shop; click one (with your mouse, or the left stick moves a
  // pointer on a controller, ✕ / A / B clicks, the right stick scrolls) and that shop's menu opens on the screen. What you buy
  // online comes by post: the coins go now, and it all arrives in a parcel in your mailbox the next morning (6 am). Buildings
  // and creatures can't come by post, so those are still ordered in person =====
  var pcOpen = false, pcShop = null, pcOrders = [], pcJustOrdered = false, pcLastDay = null, pcAt = null;
  var PC_SHOPS = [
    { key: 'seed', name: 'Whimsy & Bloom', icon: '🌱', col: '#7ac86a', open: function () { openShop(); }, isOpen: function () { return shopOpen; }, close: function () { closeShop(); } },
    { key: 'barn', name: 'Fluff & Feather', icon: '🐾', col: '#e8a86a', open: function () { openBarnShop(); }, isOpen: function () { return barnShopOpen; }, close: function () { closeBarnShop(); } },
    { key: 'carp', name: 'Oak & Ember', icon: '🪚', col: '#c8885a', open: function () { openCarpShop(); }, isOpen: function () { return carpShopOpen; }, close: function () { closeCarpShop(); } },
    { key: 'cloth', name: 'Thread & Thimble', icon: '🧵', col: '#e88ab8', open: function () { openClothShop(); }, isOpen: function () { return clothShopOpen; }, close: function () { closeClothShop(); } },
    { key: 'lab', name: 'Atom & Alembic', icon: '⚗️', col: '#7ae8ff', open: function () { openLabShop(); }, isOpen: function () { return labShopOpen; }, close: function () { closeLabShop(); } }
  ];
  function pcShopDef(k) { for (var i = 0; i < PC_SHOPS.length; i++) if (PC_SHOPS[i].key === k) return PC_SHOPS[i]; return null; }
  // (while a shop is open on the computer, it counts as "at its counter", what you buy goes on your order, and your bag
  // doesn't need room for it yet)
  nearShop = (function (base) { return function () { return pcShop === 'seed' || base.apply(this, arguments); }; })(nearShop);
  atBarnCounter = (function (base) { return function () { return pcShop === 'barn' || base.apply(this, arguments); }; })(atBarnCounter);
  atCarpCounter = (function (base) { return function () { return pcShop === 'carp' || base.apply(this, arguments); }; })(atCarpCounter);
  clothAtCounter = (function (base) { return function () { return pcShop === 'cloth' || base.apply(this, arguments); }; })(clothAtCounter);
  atLabCounter = (function (base) { return function () { return pcShop === 'lab' || base.apply(this, arguments); }; })(atLabCounter);
  addItem = (function (base) { return function (id, n) {
    if (pcShop) { var sd = pcShopDef(pcShop); pcOrders.push({ shop: sd ? sd.name : 'the shops', id: id, count: n || 1 }); pcJustOrdered = true; return true; }
    return base.apply(this, arguments);
  }; })(addItem);
  roomFor = (function (base) { return function () { return pcShop ? true : base.apply(this, arguments); }; })(roomFor);
  document.addEventListener('click', function (e) {                       // (buildings and creatures can't come by post)
    if (!pcShop) return; var t = e.target && e.target.closest && e.target.closest('button'); if (!t) return;
    if (pcShop === 'carp' && t.matches('.coop-buy, .fbarn-buy, .mill-buy, .silo-buy')) { e.stopImmediatePropagation(); e.preventDefault(); showToast('🏡 Buildings are built on site: visit Oak & Ember in person to order one', 3200); return; }
    if (pcShop === 'barn' && /-adopt\b/.test(t.className)) { e.stopImmediatePropagation(); e.preventDefault(); showToast('🐾 Creatures can’t come by post: visit Fluff & Feather in person to adopt one', 3200); return; }
    setTimeout(function () { if (pcJustOrdered) { pcJustOrdered = false; renderPc(); showToast('🛒 Ordered! It will arrive in your mailbox tomorrow morning', 3000); } }, 0);
  }, true);
  // (the desktop)
  var pcCss = document.createElement('style');
  pcCss.textContent = '.inventory.pc-desk{z-index:5;width:min(780px,96%);padding:12px;background:#111116;border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.45),inset 0 0 0 2px #2a2a34}' +
    '.pc-desk .pc-screen{position:relative;border-radius:12px;overflow:hidden;aspect-ratio:16/9.2;min-height:300px;background:radial-gradient(circle at 78% 26%,#fff4d8 0 4.5%,rgba(255,244,216,.25) 5.5%,transparent 12%),radial-gradient(circle at 81% 23%,#3a2470 0 4.2%,transparent 4.4%),linear-gradient(135deg,#1a1040 0%,#4a2a8a 55%,#d86aa8 100%);color:#fff;font:inherit}' +
    '.pc-desk .pc-hills{position:absolute;left:0;right:0;bottom:34px;height:22%;background:#120a28;clip-path:polygon(0 60%,12% 40%,25% 55%,40% 30%,55% 50%,70% 28%,85% 48%,100% 35%,100% 100%,0 100%)}' +
    '.pc-desk .pc-stars{position:absolute;inset:0;background-image:radial-gradient(1.5px 1.5px at 10% 15%,#fff,transparent),radial-gradient(1.5px 1.5px at 30% 8%,#fff,transparent),radial-gradient(1px 1px at 45% 22%,#fff,transparent),radial-gradient(1.5px 1.5px at 60% 12%,#fff,transparent),radial-gradient(1px 1px at 92% 40%,#fff,transparent),radial-gradient(1px 1px at 20% 35%,#fff,transparent),radial-gradient(1px 1px at 66% 38%,#fff,transparent);opacity:.8}' +
    '.pc-desk .pc-icons{position:absolute;top:14px;left:14px;display:grid;grid-template-columns:repeat(auto-fill,92px);gap:10px;right:14px}' +
    '.pc-desk .pc-icon{display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px 4px;border:0;border-radius:12px;background:transparent;color:#fff;font:inherit;font-size:.82em;cursor:pointer;text-shadow:0 1px 3px rgba(0,0,0,.6)}' +
    '.pc-desk .pc-icon:hover,.pc-desk .pc-icon.ev-padfocus{background:rgba(255,255,255,.16)}.pc-desk .pc-icon .pc-tile{width:54px;height:54px;border-radius:14px;display:grid;place-items:center;font-size:30px;box-shadow:0 4px 12px rgba(0,0,0,.35),inset 0 0 0 2px rgba(255,255,255,.35)}' +
    '.pc-desk .pc-win{position:absolute;right:16px;bottom:46px;width:min(270px,45%);max-height:calc(100% - 170px);overflow:auto;background:rgba(250,246,255,.94);color:#3d3157;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:.85em}' +
    '.pc-desk .pc-win h5{margin:0;padding:8px 12px;background:linear-gradient(90deg,#8a5ad0,#d86aa8);color:#fff;border-radius:12px 12px 0 0;font-size:1em}.pc-desk .pc-win .pc-wb{padding:8px 12px}.pc-desk .pc-win .pc-wb p{margin:4px 0}.pc-desk .pc-ord{display:flex;align-items:center;gap:6px;margin:3px 0}.pc-desk .pc-ord>:first-child{width:26px;height:26px;flex:none;overflow:hidden;display:grid;place-items:center}.pc-desk .pc-ord>:first-child>*{max-width:100%;max-height:100%}' +
    '.pc-desk .pc-bar{position:absolute;left:0;right:0;bottom:0;height:34px;background:rgba(10,6,24,.72);backdrop-filter:blur(6px);display:flex;align-items:center;gap:10px;padding:0 10px;font-size:.85em}' +
    '.pc-desk .pc-bar .pc-orb{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,#b88aff,#d86aa8);display:grid;place-items:center;font-size:13px}.pc-desk .pc-bar .pc-sp{flex:1}' +
    '.pc-desk .pc-bar button{border:0;background:rgba(255,255,255,.14);color:#fff;font:inherit;border-radius:8px;padding:4px 10px;cursor:pointer}.pc-desk .pc-bar button:hover,.pc-desk .pc-bar button.ev-padfocus{background:rgba(255,120,150,.6)}' +
    '.pc-desk .pc-stand{height:16px;width:22%;margin:8px auto 0;background:linear-gradient(#2a2a32,#16161c);border-radius:0 0 10px 10px}' +
    '.ev-pc-ordering .inventory.shop .ship-hint::after{content:"  🛒 Shopping online: what you buy arrives in your mailbox tomorrow morning.";font-weight:600;color:#8a5ad0}';
  document.head.appendChild(pcCss);
  var pcBtn = document.createElement('button'); pcBtn.type = 'button'; pcBtn.className = 'sleep-btn ship-btn'; pcBtn.innerHTML = '🖥️ Computer <kbd>E</kbd>'; canvas.parentNode.appendChild(pcBtn);
  var pcBox = document.createElement('div'); pcBox.className = 'inventory pc-desk ev-cursorbox'; pcBox.hidden = true;
  pcBox.innerHTML = '<div class="pc-screen"><div class="pc-stars"></div><div class="pc-hills"></div><div class="pc-icons"></div><div class="pc-win"></div>' +
    '<div class="pc-bar"><span class="pc-orb">⚗</span><span class="pc-sp"></span><span class="pc-coins"></span><span class="pc-clock"></span><button type="button" class="pc-off" aria-label="Shut down the computer">⏻ Shut down</button></div></div><div class="pc-stand"></div>';
  canvas.parentNode.appendChild(pcBox);
  var pcIcons = pcBox.querySelector('.pc-icons'), pcWin = pcBox.querySelector('.pc-win');
  PC_SHOPS.forEach(function (sd) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pc-icon';
    b.innerHTML = '<span class="pc-tile" style="background:linear-gradient(135deg,' + sd.col + ',#3a2470)">' + sd.icon + '</span><span></span>'; b.lastChild.textContent = sd.name;
    b.addEventListener('click', function (e) { e.stopPropagation(); pcOpenShop(sd.key); }); pcIcons.appendChild(b);
  });
  pcBox.querySelector('.pc-off').addEventListener('click', function (e) { e.stopPropagation(); closePc(); focusGame(); });
  function pcTime() { var m = Math.floor(state.minutes) % 1440, h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm + (h < 12 ? ' AM' : ' PM'); }
  function renderPc() {
    pcBox.querySelector('.pc-coins').textContent = '★ ' + state.coins.toLocaleString('en-US'); pcBox.querySelector('.pc-clock').textContent = pcTime();
    pcWin.innerHTML = '<h5>🛒 Shop online</h5><div class="pc-wb"></div>'; var wb = pcWin.lastChild;
    function para(t) { var p = document.createElement('p'); p.textContent = t; wb.appendChild(p); return p; }
    para('Click a shop to open it. Everything you buy here comes by post: it arrives in your mailbox tomorrow morning.');
    if (pcOrders.length) { para('On its way:').style.fontWeight = '700'; pcOrders.forEach(function (o) { if (!ITEMS[o.id]) return; var r = document.createElement('div'); r.className = 'pc-ord'; r.appendChild(pcPic(o.id)); var sp = document.createElement('span'); sp.textContent = ITEMS[o.id].name + (o.count > 1 ? ' ×' + o.count : ''); r.appendChild(sp); wb.appendChild(r); }); }
    else para('Nothing on its way yet.');
  }
  function pcOpenShop(k) {
    var sd = pcShopDef(k); if (!sd) return;
    pcShop = k; document.body.classList.add('ev-pc-ordering'); sd.open(); menuOpenedAt = Date.now();
  }
  function pcLeaveShop() { if (!pcShop) return; var sd = pcShopDef(pcShop); pcShop = null; document.body.classList.remove('ev-pc-ordering'); if (sd && sd.isOpen()) sd.close(); renderPc(); }
  function openPc() { if (pcOpen) return; toggleBag(false); pcOpen = true; menuOpenedAt = Date.now(); walkTarget = null; pcBox.hidden = false; renderPc(); }
  function closePc() { pcLeaveShop(); pcOpen = false; pcBox.hidden = true; }
  pcBtn.addEventListener('click', function () { openPc(); focusGame(); });
  window.addEventListener('keydown', function (e) {                       // (Escape, or ○ / B: shuts the shop you're looking at, then the computer)
    if (e.code !== 'Escape' || !pcOpen) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (pcShop) pcLeaveShop(); else closePc();
  }, true);
  function inMyHouse() { return indoors && !inShop && !inClinic && !inBarn && !inCarp && !inCoop && !inFbarn && !inCloth && !inLab && !inHide && !decorMode; }
  var pcV = new THREE.Vector3();
  function nearPc() {                                                     // (the computer you're standing by, if any)
    if (!inMyHouse()) return null; var best = null, bd = 1.35;
    decorPlaced.forEach(function (p) { if (p.id !== 'decor_computer' || !p.g) return; p.g.getWorldPosition(pcV); var d = dist(player.position.x, player.position.z, pcV.x, pcV.z); if (d < bd) { bd = d; best = p; } });
    return best;
  }
  interact = (function (base) { return function () {
    if (pcOpen) { if (pcShop) { var sd = pcShopDef(pcShop); if (sd && sd.isOpen() && !menuJustOpened()) pcLeaveShop(); return; } if (!menuJustOpened()) closePc(); return; }
    if (nearPc()) { openPc(); return; }
    return base.apply(this, arguments);
  }; })(interact);
  updateShipping = (function (base) { return function () {
    base.apply(this, arguments);
    var fd = farmDay(); if (pcLastDay === null) pcLastDay = fd;
    if (fd !== pcLastDay) { pcLastDay = fd; pcDeliver(); }               // (a new morning: yesterday's orders arrive)
    if (pcShop) { var sd = pcShopDef(pcShop); if (!sd || !sd.isOpen()) { pcShop = null; document.body.classList.remove('ev-pc-ordering'); renderPc(); } }   // (its shop closed: back to the desktop)
    if (pcOpen && !nearPc()) closePc();                                    // (walked away)
    if (pcOpen && !pcShop && Math.floor(state.minutes) !== pcAt) { pcAt = Math.floor(state.minutes); pcBox.querySelector('.pc-clock').textContent = pcTime(); pcBox.querySelector('.pc-coins').textContent = '★ ' + state.coins.toLocaleString('en-US'); }
    var show = !pcOpen && !!nearPc();
    if (pcBtn.classList.contains('show') !== show) pcBtn.classList.toggle('show', show);
  }; })(updateShipping);
  function pcDeliver() {                                                  // (each shop's orders come in one parcel)
    if (!pcOrders.length) return;
    var byShop = {}; pcOrders.forEach(function (o) { (byShop[o.shop] = byShop[o.shop] || []).push(o); }); pcOrders = [];
    Object.keys(byShop).forEach(function (name) {
      var gifts = []; byShop[name].forEach(function (o) { for (var i = 0; i < gifts.length; i++) if (gifts[i].id === o.id) { gifts[i].count += o.count; return; } gifts.push({ id: o.id, count: o.count }); });
      window.everdawnMailbox.deliver({ from: name, subject: 'Your order has arrived!', body: 'Thank you for shopping with ' + name + '! Your order came this morning. Everything is in the parcel below.', gifts: gifts });
    });
  }
  saveGame = (function (base) { return function () {                      // (orders on their way are kept in the save)
    var r = base.apply(this, arguments);
    try { var d = JSON.parse(localStorage.getItem(SAVE_KEY)); if (d) { d.orders = pcOrders; localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } } catch (err) {}
    return r;
  }; })(saveGame);
  loadGame = (function (base) { return function () {
    var r = base.apply(this, arguments);
    try { var d = JSON.parse(localStorage.getItem(SAVE_KEY)); pcOrders = d && d.orders ? d.orders : []; } catch (err) { pcOrders = []; }
    pcLastDay = null; closePc(); return r;
  }; })(loadGame);

  // ===== keeping the game going: if anything goes wrong in one frame (say a model arriving half-way through a step), three.js
  // would stop the whole game for good, leaving it frozen. Now that frame is skipped and the game carries on. And if the
  // browser takes the graphics card back for a moment (it can, when a tab is in the background or memory runs low), the
  // game waits for it and then picks up again; if it doesn't come back, you're offered a reload =====
  (function () {
    var errs = 0, lastErr = '', told = false;
    renderer.setAnimationLoop(function (t, xr) {
      try { frame(t, xr); }
      catch (err) {
        errs++; var m = err && err.message || String(err);
        if (m !== lastErr && window.console) { console.error('Everdawn: a frame went wrong, carrying on', err); lastErr = m; }
        if (errs > 600 && !told) { told = true; showToast('Something in the game keeps going wrong: saving and reloading the page should fix it', 6000); }
      }
    });
    setInterval(function () { errs = Math.max(0, errs - 30); }, 1000);   // (only a steady stream of errors counts)
    var lostAt = 0, cv = renderer.domElement;
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); lostAt = Date.now(); showToast('The graphics are taking a short break… one moment', 4000);
      setTimeout(function () { if (lostAt && Date.now() - lostAt >= 7900) { showToast('The graphics didn’t come back: save, then reload the page', 60000); } }, 8000); }, false);
    cv.addEventListener('webglcontextrestored', function () { lostAt = 0; showToast('✦ Back again', 1600); }, false);
  })();

  // ===== The Hollow Fang: a secret adventurers' guild, hidden in a thicket in the far north-west corner of the Western Isle, away
  // from every path, its door turned to face the island's edge. From outside it's only an
  // overgrown mound under a dead tree, with an old cellar door half sunk in its side, a rusted lantern on a crooked post and,
  // if you look closely, a fang-and-moon sigil scratched into the door. No path leads there and it isn't on the map. Stand by
  // the door and press Interact to go down; inside, a stone den lit by a hearth and candles: a long table of maps and daggers,
  // a weapon rack, guild banners, crates and casks, and the Errand Board, where guild errands will be posted =====
  var HIDE_X = -128, HIDE_Z = -14, HIDE_TURN = -2.36, inHide = false;
  function hideWorld(lx, lz) { var c = Math.cos(HIDE_TURN), s2 = Math.sin(HIDE_TURN); return { x: HIDE_X + lx * c + lz * s2, z: HIDE_Z - lx * s2 + lz * c }; }
  function hideFront(d) { return hideWorld(0, 1.5 + d); }
  var hideDoor = hideWorld(0, 1.9);
  function hideSigil(g, cx, cy, r, col, lw) {                             // (the guild's mark: a crescent moon pierced by a long fang, in a ring)
    g.save(); g.translate(cx, cy); g.strokeStyle = col; g.fillStyle = col; g.lineWidth = lw; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(-r * 0.08, 0, r * 0.62, Math.PI * 0.35, Math.PI * 1.65); g.arc(r * 0.18, 0, r * 0.5, Math.PI * 1.55, Math.PI * 0.45, true); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(r * 0.12, -r * 0.82); g.quadraticCurveTo(r * 0.42, -r * 0.1, r * 0.06, r * 0.86); g.quadraticCurveTo(r * 0.2, -r * 0.05, r * 0.12, -r * 0.82); g.fill();
    g.restore();
  }
  // ---- outside ----
  var hideGroup = new THREE.Group(); hideGroup.position.set(HIDE_X, 0, HIDE_Z); hideGroup.rotation.y = HIDE_TURN; scene.add(hideGroup);
  var hideWisp = null;
  (function (G) {
    function P(geo, m, x, y, z, rx, ry, rz, par) { return cpPart(geo, m, x, y, z, rx, ry, rz, par || G); }
    var turfT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#4e7a3a'; g.fillRect(0, 0, w, h); for (var k = 0; k < 900; k++) { g.fillStyle = ['rgba(30,60,24,0.5)', 'rgba(110,150,70,0.4)', 'rgba(70,60,40,0.35)'][k % 3]; g.fillRect((k * 37) % w, (k * 61) % h, 1 + k % 2, 2 + k % 3); } }, [3, 3]);
    var turf = new THREE.MeshStandardMaterial({ map: turfT, roughness: 1 });
    var moundG = new THREE.SphereGeometry(2.1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), mp = moundG.attributes.position;   // (the mound, lumpy)
    for (var i = 0; i < mp.count; i++) { var x = mp.getX(i), y = mp.getY(i), z = mp.getZ(i); var n = 1 + Math.sin(x * 2.3 + z * 1.7) * 0.06 + Math.sin(x * 5.1 - z * 3.3) * 0.03; mp.setXYZ(i, x * n, y * n, z * n); }
    moundG.computeVertexNormals();
    var mound = P(moundG, turf, 0, -0.05, -0.95); mound.scale.set(1, 0.62, 0.78);
    var stoneM = [0x6e6a62, 0x5a5650, 0x7a746a].map(function (c) { return rMat(c, { roughness: 0.95 }); });
    var oldWood = rMat(0x4a3a2a, { roughness: 0.95 }), darkWood = rMat(0x2e2418, { roughness: 1 }), rust = rMat(0x5a3a24, { metalness: 0.5, roughness: 0.75 });
    // (the cellar door: an old stone surround half sunk in the mound, and two weathered leaves lying aslant, banded with rusty iron)
    var CD = new THREE.Group(); CD.position.set(0, 0.02, 1.38); CD.rotation.x = -0.75; G.add(CD);
    [[-0.68, 0.55, 0.16, 1.2], [0.68, 0.55, 0.16, 1.2], [0, 1.1, 1.52, 0.16], [0, 0.0, 1.52, 0.14]].forEach(function (b, k) { P(new THREE.BoxGeometry(b[2], b[3], 0.2), stoneM[k % 3], b[0], b[1], 0, 0, 0, 0, CD); });
    P(new THREE.BoxGeometry(1.2, 1.04, 0.05), rMat(0x0a0806), 0, 0.55, -0.06, 0, 0, 0, CD);
    var plankT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#5a4630'; g.fillRect(0, 0, w, h); for (var k = 0; k < 6; k++) { g.fillStyle = 'rgba(20,12,6,0.8)'; g.fillRect(k * (w / 6), 0, 2, h); }
      for (var q = 0; q < 60; q++) { g.strokeStyle = q % 2 ? 'rgba(30,20,10,0.35)' : 'rgba(140,120,90,0.25)'; g.beginPath(); var gx = (q * 23) % w; g.moveTo(gx, 0); g.lineTo(gx + Math.sin(q) * 3, h); g.stroke(); }
      for (var m2 = 0; m2 < 30; m2++) { g.fillStyle = 'rgba(70,110,50,' + (0.25 + (m2 % 3) * 0.12) + ')'; g.beginPath(); g.arc((m2 * 41) % w, h - (m2 * 7) % 30, 3 + m2 % 4, 0, Math.PI * 2); g.fill(); } });   // (moss creeping up from the bottom)
    var leafM = new THREE.MeshStandardMaterial({ map: plankT, roughness: 0.95 });
    // (the two door leaves, built board by board: weathered oak planks with gaps between them, each its own shade, with knots,
    // splits and moss creeping up from the bottom; two battens and a diagonal brace across the back; long iron strap hinges with
    // spear tips and curled ends, nailed through; an iron kick plate at the foot, a ring pull on its rosette and a keyhole plate)
    var boardT = cpTex(64, 256, function (g, w, h) { g.fillStyle = '#7a6044'; g.fillRect(0, 0, w, h);
      for (var q = 0; q < 26; q++) { g.strokeStyle = q % 2 ? 'rgba(40,26,12,0.35)' : 'rgba(170,140,100,0.25)'; g.lineWidth = q % 4 ? 1 : 2; g.beginPath(); var gx = 2 + (q * 13) % (w - 4); g.moveTo(gx, 0); for (var y = 0; y <= h; y += 8) g.lineTo(gx + Math.sin(y * 0.03 + q) * 2.2, y); g.stroke(); }
      [[22, 70], [44, 180]].forEach(function (k) { for (var r = 9; r > 1; r -= 2) { g.strokeStyle = 'rgba(40,22,10,' + (0.25 + (9 - r) * 0.07) + ')'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(k[0], k[1], r * 0.7, r * 1.7, 0, 0, Math.PI * 2); g.stroke(); } g.fillStyle = 'rgba(35,20,8,0.75)'; g.beginPath(); g.ellipse(k[0], k[1], 2, 4, 0, 0, Math.PI * 2); g.fill(); });   // (knots)
      g.fillStyle = 'rgba(255,230,190,0.12)'; g.fillRect(2, 0, 2, h); g.fillStyle = 'rgba(25,14,6,0.3)'; g.fillRect(w - 5, 0, 4, h);   // (light on one edge, shade on the other)
      var fg = g.createLinearGradient(0, h, 0, h * 0.72); fg.addColorStop(0, 'rgba(30,40,20,0.65)'); fg.addColorStop(1, 'rgba(30,40,20,0)'); g.fillStyle = fg; g.fillRect(0, h * 0.72, w, h * 0.28);   // (damp and dark at the foot)
      var tg = g.createLinearGradient(0, 0, 0, h * 0.12); tg.addColorStop(0, 'rgba(30,20,10,0.35)'); tg.addColorStop(1, 'rgba(30,20,10,0)'); g.fillStyle = tg; g.fillRect(0, 0, w, h * 0.12); });
    var boardMs = [0xe8dccb, 0xd8c8b0, 0xf0e2cc, 0xc8b8a0, 0xe0d0b8].map(function (c, k) { var t = boardT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.offset.set((k * 0.37) % 1, (k * 0.23) % 1); return new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 0.006, color: c, roughness: 0.92 }); });
    var battenM = rMat(0x4a3826, { roughness: 0.95 }), ironD = rMat(0x2a221c, { metalness: 0.6, roughness: 0.55 }), crackM = rMat(0x140c06), mossD = rMat(0x3e6a2c, { roughness: 1 });
    var nailG = new THREE.ConeGeometry(0.012, 0.012, 4);
    [-1, 1].forEach(function (sd) {
      var L = new THREE.Group(); L.position.set(sd * 0.6, 0.55, 0.02); CD.add(L);
      P(new THREE.BoxGeometry(0.58, 1.02, 0.02), rMat(0x0e0804), -sd * 0.29, 0, -0.01, 0, 0, 0, L);   // (dark behind the gaps)
      for (var pl = 0; pl < 4; pl++) {                                   // (four planks, a hair apart, none quite the same)
        var px = -sd * (0.075 + pl * 0.144), ph = 1.02 - ((pl * 7 + (sd > 0 ? 3 : 0)) % 4) * 0.008, pd = 0.046 + ((pl + (sd > 0 ? 1 : 0)) % 3) * 0.004;
        P(new THREE.BoxGeometry(0.138, ph, pd), boardMs[(pl + (sd > 0 ? 2 : 0)) % 5], px, (ph - 1.02) / 2, 0.05 - pd / 2, 0, 0, ((pl * 3 + sd) % 3 - 1) * 0.004, L);
        if ((pl + (sd > 0 ? 1 : 0)) % 2 === 0) P(new THREE.BoxGeometry(0.004, 0.16 + pl * 0.03, 0.004), crackM, px + 0.03 * sd, -0.12 + pl * 0.07, 0.051, 0, 0, 0.05 * sd, L);   // (a split in the wood)
      }
      [-0.32, 0.32].forEach(function (by) { P(new THREE.BoxGeometry(0.54, 0.08, 0.024), battenM, -sd * 0.29, by, 0.062, 0, 0, 0, L); });   // (the battens)
      var dl = Math.hypot(0.44, 0.56), da = Math.atan2(0.56, 0.44 * -sd);   // (the diagonal brace between them)
      P(new THREE.BoxGeometry(dl, 0.06, 0.022), battenM, -sd * 0.29, 0, 0.061, 0, 0, da, L);
      [-0.18, 0.18].forEach(function (t) { P(nailG, ironD, -sd * 0.29 + Math.cos(da) * t * dl, Math.sin(da) * t * dl, 0.078, Math.PI / 2, Math.PI / 4, 0, L); });
      [-0.32, 0.32].forEach(function (by) {                               // (the strap hinges, nailed through the battens)
        var strap = new THREE.Shape(); strap.moveTo(0, -0.024); strap.lineTo(0.4, -0.018); strap.lineTo(0.45, -0.034); strap.lineTo(0.52, 0); strap.lineTo(0.45, 0.034); strap.lineTo(0.4, 0.018); strap.lineTo(0, 0.024); strap.lineTo(0, -0.024);
        var sm = P(new THREE.ExtrudeGeometry(strap, { depth: 0.008, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 1 }), rust, 0, by, 0.074, 0, sd > 0 ? Math.PI : 0, 0, L);
        if (sd > 0) sm.position.z = 0.074 + 0.008;
        [1, -1].forEach(function (cv) { P(new THREE.TorusGeometry(0.022, 0.005, 5, 12, Math.PI * 1.25), rust, -sd * 0.43, by + cv * 0.036, 0.08, 0, 0, sd > 0 ? (cv > 0 ? -0.3 : Math.PI + 0.3) : (cv > 0 ? Math.PI + 0.3 : -0.3)); });
        for (var nl = 0; nl < 6; nl++) P(nailG, ironD, -sd * (0.03 + nl * 0.075), by, 0.088, Math.PI / 2, Math.PI / 4, 0, L);
        P(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 8), rust, sd * 0.005, by, 0.06, 0, 0, 0, L);   // (its knuckle)
      });
      P(new THREE.BoxGeometry(0.56, 0.07, 0.008), rust, -sd * 0.29, -0.465, 0.054, 0, 0, 0, L);   // (an iron kick plate)
      for (var kp = 0; kp < 5; kp++) P(new THREE.SphereGeometry(0.007, 6, 4), ironD, -sd * (0.05 + kp * 0.12), -0.465, 0.06, 0, 0, 0, L);
      var rx = -sd * 0.5;                                                 // (a rosette by the inner edge for the ring pull)
      P(new THREE.CylinderGeometry(0.045, 0.045, 0.008, 16), rust, rx, 0.07, 0.056, Math.PI / 2, 0, 0, L);
      for (var pe = 0; pe < 8; pe++) { var pa = pe / 8 * Math.PI * 2; P(new THREE.SphereGeometry(0.008, 6, 4), rust, rx + Math.cos(pa) * 0.036, 0.07 + Math.sin(pa) * 0.036, 0.061, 0, 0, 0, L); }
      if (sd < 0) { P(new THREE.TorusGeometry(0.05, 0.01, 6, 14), rust, rx, 0.02, 0.07, -0.15, 0, 0, L); P(new THREE.CylinderGeometry(0.016, 0.016, 0.02, 8), rust, rx, 0.07, 0.065, Math.PI / 2, 0, 0, L);
        P(new THREE.BoxGeometry(0.05, 0.08, 0.006), rust, rx, -0.13, 0.055, 0, 0, 0, L); P(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 8), crackM, rx, -0.12, 0.059, Math.PI / 2, 0, 0, L); P(new THREE.BoxGeometry(0.005, 0.018, 0.004), crackM, rx, -0.135, 0.059, 0, 0, 0, L); }   // (and a keyhole plate on the left leaf)
    });
    P(new THREE.TorusGeometry(0.05, 0.01, 6, 14), rust, 0.1, 0.62, 0.07, 0, 0, 0, CD); P(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), rust, 0.1, 0.67, 0.06, Math.PI / 2, 0, 0, CD);
    // (roots and ivy trailing over the doorway, moss on the stones)
    // (ivy hanging over the doorway: a woody vine running along the top of the stone surround and over the keystone, and from
    // it six strands trailing down over the doors, brown and thick where they start, green and fine at their tips, waving a
    // little; real ivy leaves on short stalks, veined, glossy dark green below and fresh light green near the tips, side shoots,
    // curling tendrils, little roots gripping the stone and a few clusters of tiny ivy flowers)
    var ivyVein = cpTex(64, 64, function (g, w, h) { var gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#dfeedd'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(235,250,215,0.95)'; g.lineWidth = 1.6; [[0.5, 0.02], [0.08, 0.36], [0.92, 0.36], [0.0, 0.85], [1.0, 0.85]].forEach(function (v) { g.beginPath(); g.moveTo(w * 0.5, h); g.quadraticCurveTo(w * (0.5 + (v[0] - 0.5) * 0.4), h * (0.6 + v[1] * 0.2), w * v[0], h * v[1]); g.stroke(); }); });
    ivyVein.offset.set(0.5, 0);
    var ivyMs = [0x2c5e2e, 0x386e36, 0x4a8040, 0x6aa850].map(function (c) { return new THREE.MeshStandardMaterial({ map: ivyVein, color: c, roughness: 0.45, metalness: 0.05, side: THREE.DoubleSide }); });
    var ivyS = new THREE.Shape(); ivyS.moveTo(0, 0);
    [[-0.22, -0.04, -0.42, 0.1], [-0.5, 0.22, -0.32, 0.36], [-0.58, 0.55, -0.4, 0.66], [-0.26, 0.7, -0.14, 0.72], [-0.08, 0.92, 0, 1]].forEach(function (c) { ivyS.quadraticCurveTo(c[0], c[1], c[2], c[3]); });
    [[0.08, 0.92, 0.14, 0.72], [0.26, 0.7, 0.4, 0.66], [0.58, 0.55, 0.32, 0.36], [0.5, 0.22, 0.42, 0.1], [0.22, -0.04, 0, 0]].forEach(function (c) { ivyS.quadraticCurveTo(c[0], c[1], c[2], c[3]); });
    var ivyGeo = new THREE.ShapeGeometry(ivyS, 5);
    (function () { var ps = ivyGeo.attributes.position; for (var i = 0; i < ps.count; i++) { var x = ps.getX(i), y = ps.getY(i); ps.setZ(i, -Math.abs(x) * 0.25 + Math.sin(y * 3) * 0.04); } ivyGeo.computeVertexNormals(); })();   // (each leaf cupped a little along its midrib)
    var woody = rMat(0x5a4630, { roughness: 0.85 }), stemG = rMat(0x4a6a30, { roughness: 0.7 }), stemY = rMat(0x6a8a3c, { roughness: 0.7 }), rootM = rMat(0x7a6448, { roughness: 1 });
    function stem(cv, u0, u1, r0, r1, n) {                                   // (a stem, thinning from r0 to r1, brown turning green)
      var segs = n || 4; for (var k = 0; k < segs; k++) { var a0 = u0 + (u1 - u0) * k / segs, a1 = u0 + (u1 - u0) * (k + 1) / segs, pts = [];
        for (var q = 0; q <= 6; q++) pts.push(cv.getPoint(a0 + (a1 - a0) * q / 6));
        var f = k / Math.max(1, segs - 1); P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 8, r0 + (r1 - r0) * (k + 0.5) / segs, 5), f < 0.3 ? woody : f < 0.7 ? stemG : stemY, 0, 0, 0, 0, 0, 0, CD); }
    }
    function leaf(at, out, sz, col, tilt, roll) {                           // (an ivy leaf on its stalk, facing out from the door)
      var tip = at.clone().add(new THREE.Vector3(out.x * 0.03, -0.012 + out.y * 0.03, 0.025));
      P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([at, at.clone().lerp(tip, 0.5).add(new THREE.Vector3(0, 0.008, 0.005)), tip]), 4, 0.0018, 4), stemY, 0, 0, 0, 0, 0, 0, CD);
      var lg = new THREE.Group(); lg.position.copy(tip); lg.rotation.order = 'ZXY'; lg.rotation.set(tilt, 0, Math.atan2(-out.x, out.y) + roll); CD.add(lg);
      var lm = P(ivyGeo, ivyMs[col], 0, 0, 0, 0, 0, 0, lg); lm.scale.setScalar(sz);
    }
    function tendril(at, dir, len) { var pts = []; for (var q = 0; q <= 14; q++) { var u = q / 14, a = u * Math.PI * 3.2, r = 0.012 * (1 - u * 0.75); pts.push(at.clone().add(new THREE.Vector3(dir * u * len + Math.cos(a) * r * dir, -u * len * 0.3 + Math.sin(a) * r, 0.01 + u * 0.01))); }
      P(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.0012, 3), stemY, 0, 0, 0, 0, 0, 0, CD); }
    var flowerM = rMat(0xe8e8b8, { roughness: 0.6 }), budM = rMat(0x9ab060, { roughness: 0.6 });
    function flowers(at) { for (var q = 0; q < 9; q++) { var a = q * 2.4, r = 0.012 + (q % 3) * 0.008; P(new THREE.CylinderGeometry(0.001, 0.001, 0.02, 3), stemY, at.x + Math.cos(a) * r * 0.5, at.y + Math.sin(a) * r * 0.5, at.z + 0.012, Math.PI / 2, 0, 0, CD); P(new THREE.SphereGeometry(0.0055, 6, 4), q % 3 ? flowerM : budM, at.x + Math.cos(a) * r, at.y + Math.sin(a) * r, at.z + 0.024, 0, 0, 0, CD); } }
    // (the main vine along the top of the surround, rising over the keystone)
    var topPts = []; for (var t = 0; t <= 24; t++) { var tx = -0.78 + t / 24 * 1.56, over = Math.max(0, 1 - Math.abs(tx) / 0.24); topPts.push(new THREE.Vector3(tx, 1.19 + Math.sin(t * 1.3) * 0.012 + over * 0.12, 0.105 + over * 0.075 + Math.cos(t * 0.9) * 0.006)); }
    var topV = new THREE.CatmullRomCurve3(topPts);
    stem(topV, 0, 0.5, 0.013, 0.01, 4); stem(topV, 0.5, 1, 0.01, 0.007, 4);
    for (var tl = 0; tl < 26; tl++) { var u = 0.02 + tl / 26 * 0.96, pt = topV.getPoint(u), up = tl % 2 ? 1 : -1; if (Math.abs(pt.x) < 0.17) continue; leaf(pt, new THREE.Vector2(Math.sin(tl * 1.7) * 0.6, up), 0.05 + (tl % 3) * 0.012, tl % 4 === 3 ? 3 : tl % 3, 0.25 + (tl % 3) * 0.12, (tl % 2 ? 0.3 : -0.3)); }
    for (var rt = 0; rt < 10; rt++) { var rp = topV.getPoint(0.05 + rt * 0.1); for (var rr = 0; rr < 3; rr++) P(new THREE.CylinderGeometry(0.0012, 0.0008, 0.025, 3), rootM, rp.x + (rr - 1) * 0.006, rp.y - 0.012, rp.z - 0.008, 0.6, 0, (rr - 1) * 0.4, CD); }   // (little roots gripping the stone)
    flowers(topV.getPoint(0.12)); flowers(topV.getPoint(0.83));
    // (six strands trailing down over the doors)
    [[-0.68, 0.62, 0], [-0.47, 0.42, 1], [-0.27, 0.7, 2], [0.27, 0.5, 3], [0.48, 0.78, 4], [0.69, 0.4, 5]].forEach(function (sd) {
      var x0 = sd[0], len = sd[1], k = sd[2], pts = [];
      for (var q = 0; q <= 12; q++) { var u = q / 12; pts.push(new THREE.Vector3(x0 + Math.sin(u * 5 + k) * 0.045 * u + Math.sin(u * 13 + k * 2) * 0.008, 1.19 - u * len, 0.1 + u * 0.02 + Math.sin(u * 7 + k) * 0.006)); }
      var cv = new THREE.CatmullRomCurve3(pts);
      stem(cv, 0, 1, 0.008, 0.0028, 5);
      var nl = Math.round(9 + len * 10);
      for (var lf = 0; lf < nl; lf++) { var u2 = 0.06 + lf / nl * 0.92, lp = cv.getPoint(u2), sdir = lf % 2 ? 1 : -1;
        leaf(lp, new THREE.Vector2(sdir * 0.9, -0.3 + (lf % 3) * 0.2), 0.065 * (1.05 - u2 * 0.55) * (0.85 + (lf % 3) * 0.1), u2 > 0.8 ? 3 : u2 > 0.55 ? 2 : (lf + k) % 2, 0.35 + (lf % 3) * 0.15, sdir * (0.2 + (lf % 4) * 0.1)); }
      [0.3, 0.6].forEach(function (bu, n) { if ((k + n) % 2) return; var bp = cv.getPoint(bu), bd = n % 2 ? 1 : -1, bpts = [];   // (a side shoot or two)
        for (var q2 = 0; q2 <= 6; q2++) { var w = q2 / 6; bpts.push(bp.clone().add(new THREE.Vector3(bd * w * 0.09, -w * 0.07 - w * w * 0.04, 0.01 * w))); }
        var bc = new THREE.CatmullRomCurve3(bpts); stem(bc, 0, 1, 0.003, 0.0018, 2);
        for (var bl = 0; bl < 4; bl++) leaf(bc.getPoint(0.25 + bl * 0.22), new THREE.Vector2(bd, bl % 2 ? 0.4 : -0.5), 0.04 - bl * 0.004, 2 + (bl % 2), 0.4, bd * 0.3); });
      tendril(cv.getPoint(0.45), k % 2 ? 1 : -1, 0.05); tendril(cv.getPoint(0.82), k % 2 ? -1 : 1, 0.04);
      var tp = cv.getPoint(1); P(new THREE.SphereGeometry(0.006, 6, 4), stemY, tp.x, tp.y - 0.004, tp.z, 0, 0, 0, CD);   // (a curled new shoot at its tip)
      if (k === 1 || k === 4) flowers(cv.getPoint(0.35));
    });
    for (var ms = 0; ms < 5; ms++) { var mm = P(new THREE.SphereGeometry(0.06 + (ms % 3) * 0.02, 8, 5), rMat(0x4a7a34, { roughness: 1 }), -0.75 + ms * 0.37, 1.18, 0.1, 0, 0, 0, CD); mm.scale.set(1.4, 0.35, 0.9); }
    // (a crooked dead tree on top of the mound)
    var bark = rMat(0x3a3028, { roughness: 1 });
    function limb(pts, r) { var c = new THREE.CatmullRomCurve3(pts.map(function (q) { return new THREE.Vector3(q[0], q[1], q[2]); })); P(new THREE.TubeGeometry(c, 12, r, 6), bark, 0, 0, 0); return c; }
    limb([[-0.5, 0.9, -0.9], [-0.55, 1.6, -0.95], [-0.4, 2.3, -0.85], [-0.55, 2.9, -0.9]], 0.11);
    limb([[-0.42, 2.0, -0.88], [-0.1, 2.4, -0.7], [0.3, 2.6, -0.6]], 0.045); limb([[-0.48, 2.5, -0.9], [-0.9, 2.9, -1.1], [-1.2, 3.0, -1.0]], 0.04);
    limb([[-0.55, 2.8, -0.9], [-0.35, 3.3, -0.8]], 0.03); limb([[-0.5, 1.4, -0.95], [-0.9, 1.6, -0.6]], 0.035);
    [[-0.5, 0.95, -0.6, 0.6], [-0.8, 0.85, -1.1, 2.0], [-0.2, 0.9, -1.2, 3.8]].forEach(function (rt) { limb([[-0.5, 1.0, -0.9], [rt[0], rt[1], rt[2]], [rt[0] + Math.sin(rt[3]) * 0.4, 0.3, rt[2] + Math.cos(rt[3]) * 0.4]], 0.04); });   // (roots gripping the mound)
    // (a rusted lantern on a crooked post by the door: cold now, but a faint wisp of teal light glows in it after dark)
    var post = new THREE.Group(); post.position.set(1.05, 0, 1.45); post.rotation.z = -0.08; G.add(post);
    function Q(geo, m, x, y, z, rx, ry, rz) { return P(geo, m, x, y, z, rx, ry, rz, post); }
    // (the post: an old split timber, grey with weather, its grain deep, cracks running down it, its top cut at a slant)
    var postT = cpTex(64, 256, function (g, w, h) { g.fillStyle = '#6a5640'; g.fillRect(0, 0, w, h);
      for (var q = 0; q < 24; q++) { g.strokeStyle = q % 2 ? 'rgba(30,20,10,0.4)' : 'rgba(170,150,120,0.28)'; g.lineWidth = q % 4 ? 1 : 2; g.beginPath(); var gx = (q * 11) % w; g.moveTo(gx, 0); for (var y = 0; y <= h; y += 6) g.lineTo(gx + Math.sin(y * 0.04 + q) * 2.5, y); g.stroke(); }
      g.fillStyle = 'rgba(15,10,5,0.75)'; [[18, 40, 110], [44, 120, 90], [30, 200, 50]].forEach(function (c) { g.beginPath(); g.moveTo(c[0], c[1]); for (var y = 0; y < c[2]; y += 6) g.lineTo(c[0] + Math.sin(y * 0.2) * 2, c[1] + y); g.lineTo(c[0] + 2, c[1] + c[2]); for (var y2 = c[2]; y2 > 0; y2 -= 6) g.lineTo(c[0] + 1.5 + Math.sin(y2 * 0.2) * 2, c[1] + y2); g.fill(); });   // (cracks)
      for (var gr = 0; gr < 40; gr++) { g.fillStyle = 'rgba(200,200,190,0.12)'; g.fillRect((gr * 23) % w, (gr * 37) % h, 3, 8); }   // (silvered by weather)
      var bg = g.createLinearGradient(0, h, 0, h * 0.75); bg.addColorStop(0, 'rgba(40,50,25,0.75)'); bg.addColorStop(1, 'rgba(40,50,25,0)'); g.fillStyle = bg; g.fillRect(0, h * 0.75, w, h * 0.25); });
    var postM = new THREE.MeshStandardMaterial({ map: postT, bumpMap: postT, bumpScale: 0.01, roughness: 0.95 });
    Q(new THREE.CylinderGeometry(0.055, 0.07, 1.42, 8), postM, 0, 0.71, 0);
    var cap = Q(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 8), postM, 0, 1.43, 0, 0, 0, 0.35); cap.scale.y = 0.6;   // (a slanted top)
    Q(new THREE.CircleGeometry(0.055, 8), rMat(0x8a7458, { roughness: 1 }), 0.01, 1.455, 0, -Math.PI / 2 + 0.35, 0, 0);
    [0.35, 1.18].forEach(function (by) { Q(new THREE.CylinderGeometry(0.068 - by * 0.008, 0.068 - by * 0.008, 0.035, 10, 1, true), rust, 0, by, 0); for (var r = 0; r < 4; r++) { var ra = r / 4 * Math.PI * 2 + 0.4; Q(new THREE.SphereGeometry(0.007, 6, 4), rust, Math.cos(ra) * 0.064, by, Math.sin(ra) * 0.064); } });   // (two iron bands)
    // (the arm: a squared beam mortised through the post and pegged, with a curved iron brace under it)
    var armT = postT.clone(); armT.needsUpdate = true; armT.wrapS = armT.wrapT = THREE.RepeatWrapping; armT.rotation = Math.PI / 2;
    var armM = new THREE.MeshStandardMaterial({ map: armT, roughness: 0.95, color: 0xd8d0c4 });
    Q(new THREE.BoxGeometry(0.42, 0.055, 0.055), armM, -0.15, 1.32, 0, 0, 0, 0.1); Q(new THREE.BoxGeometry(0.02, 0.055, 0.055), rMat(0x8a7458), -0.36, 1.299, 0, 0, 0, 0.1);
    Q(new THREE.CylinderGeometry(0.01, 0.01, 0.07, 6), oldWood, 0.065, 1.335, 0, Math.PI / 2, 0, 0);   // (the peg)
    Q(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.0, 0.0), new THREE.Vector3(-0.08, 1.16, 0), new THREE.Vector3(-0.2, 1.27, 0)]), 12, 0.009, 6), rust, 0, 0, 0);
    var scroll = []; for (var sc = 0; sc <= 16; sc++) { var u = sc / 16, aa = u * Math.PI * 2.2, rr = 0.03 * (1 - u * 0.7); scroll.push(new THREE.Vector3(-0.05 + Math.cos(aa) * rr, 1.19 + Math.sin(aa) * rr, 0)); }
    Q(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(scroll), 18, 0.005, 5), rust, 0, 0, 0);
    // (a rope wound round the post below the arm, its frayed end hanging)
    var rope = rMat(0x9a8460, { roughness: 1 });
    for (var rw = 0; rw < 4; rw++) Q(new THREE.TorusGeometry(0.066, 0.009, 6, 16), rope, 0, 1.06 + rw * 0.018, 0, Math.PI / 2 + 0.08, 0, rw * 0.3);
    Q(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.06, 1.07, 0.03), new THREE.Vector3(0.09, 0.98, 0.05), new THREE.Vector3(0.08, 0.88, 0.06)]), 8, 0.007, 5), rope, 0, 0, 0);
    for (var fr = 0; fr < 4; fr++) Q(new THREE.CylinderGeometry(0.002, 0.001, 0.04, 3), rope, 0.08 + (fr - 1.5) * 0.006, 0.86, 0.06, 0, 0, (fr - 1.5) * 0.3);
    // (at its foot: stones wedged round it, moss, a clump of grass and ivy starting to climb)
    var stM = [0x6e6a62, 0x5a5650, 0x7a746a].map(function (c) { return rMat(c, { roughness: 0.95 }); });
    for (var ws = 0; ws < 6; ws++) { var wa = ws / 6 * Math.PI * 2; var wst = Q(new THREE.DodecahedronGeometry(0.05 + (ws % 3) * 0.015), stM[ws % 3], Math.cos(wa) * 0.11, 0.03, Math.sin(wa) * 0.11, ws, ws, 0); wst.scale.y = 0.6; }
    for (var mo = 0; mo < 5; mo++) { var ma = mo * 1.3; var mm = Q(new THREE.SphereGeometry(0.04, 6, 4), rMat(0x4a7a34, { roughness: 1 }), Math.cos(ma) * 0.07, 0.06 + mo * 0.03, Math.sin(ma) * 0.07); mm.scale.set(1, 0.6, 0.5); }
    var ivyP = []; for (var iv = 0; iv <= 20; iv++) { var u2 = iv / 20, a2 = u2 * Math.PI * 3; ivyP.push(new THREE.Vector3(Math.cos(a2) * 0.068, 0.04 + u2 * 0.55, Math.sin(a2) * 0.068)); }
    var ivyC = new THREE.CatmullRomCurve3(ivyP); Q(new THREE.TubeGeometry(ivyC, 20, 0.004, 4), rMat(0x4a6a30), 0, 0, 0);
    for (var il = 0; il < 10; il++) { var ip = ivyC.getPoint(0.06 + il * 0.095), iang = Math.atan2(ip.z, ip.x); var lm = Q(new THREE.SphereGeometry(0.5, 6, 4), rMat([0x2f6a34, 0x3e7a3a, 0x5a9a48][il % 3], { roughness: 0.6, side: THREE.DoubleSide }), ip.x * 1.3, ip.y, ip.z * 1.3, 0, -iang, (il % 2 ? 0.5 : -0.5)); lm.scale.set(0.012, 0.035, 0.03); }
    // (the hook and chain it hangs from)
    Q(new THREE.TorusGeometry(0.018, 0.005, 6, 12, Math.PI * 1.4), rust, -0.3, 1.27, 0, 0, Math.PI / 2, -0.3);
    for (var ch = 0; ch < 4; ch++) Q(new THREE.TorusGeometry(0.012, 0.0035, 5, 10), rust, -0.3, 1.24 - ch * 0.021, 0, 0, ch % 2 ? Math.PI / 2 : 0, 0);
    // (the lantern: a rusted six-sided carriage lantern with a peaked, vented roof and a ring on top, panes of old clouded glass, one
    // cracked and one missing, a drip pan beneath with a little finial, and inside a candle burnt down to a stub in its own wax)
    var LX = -0.3, LY = 1.0, rustD = rMat(0x3e2818, { metalness: 0.5, roughness: 0.8 }), rustL = rMat(0x7a4a2a, { metalness: 0.4, roughness: 0.75 });
    Q(new THREE.TorusGeometry(0.016, 0.004, 6, 12), rust, LX, 1.155, 0, 0, Math.PI / 2, 0);
    Q(new THREE.ConeGeometry(0.03, 0.04, 6), rustD, LX, 1.13, 0); Q(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 6), rust, LX, 1.105, 0);
    for (var vt = 0; vt < 6; vt++) { var va = vt / 6 * Math.PI * 2 + Math.PI / 6; Q(new THREE.BoxGeometry(0.012, 0.01, 0.003), rMat(0x050403), LX + Math.sin(va) * 0.03, 1.105, Math.cos(va) * 0.03, 0, va, 0); }
    Q(new THREE.ConeGeometry(0.085, 0.07, 6, 1, true), rust, LX, 1.06, 0); Q(new THREE.CylinderGeometry(0.087, 0.087, 0.01, 6), rustL, LX, 1.025, 0);
    for (var ce = 0; ce < 6; ce++) { var cea = ce / 6 * Math.PI * 2; Q(new THREE.ConeGeometry(0.008, 0.025, 4), rust, LX + Math.sin(cea) * 0.085, 1.035, Math.cos(cea) * 0.085, 0, 0, 0); }   // (little spikes at the roof's corners)
    Q(new THREE.CylinderGeometry(0.064, 0.064, 0.016, 6), rust, LX, 1.012, 0);
    var paneM = new THREE.MeshStandardMaterial({ color: 0x8a9a88, transparent: true, opacity: 0.38, roughness: 0.35, side: THREE.DoubleSide, depthWrite: false });
    var crackT = cpTex(64, 96, function (g, w, h) { g.fillStyle = 'rgba(160,175,160,0.35)'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(240,250,240,0.85)'; g.lineWidth = 1.2; [[20, 30, 50, 10], [20, 30, 8, 80], [20, 30, 56, 70], [36, 50, 60, 52]].forEach(function (c) { g.beginPath(); g.moveTo(c[0], c[1]); g.lineTo(c[2], c[3]); g.stroke(); });
      g.fillStyle = 'rgba(60,50,30,0.35)'; g.fillRect(0, h - 18, w, 18); });
    var crackM = new THREE.MeshStandardMaterial({ map: crackT, transparent: true, roughness: 0.3, side: THREE.DoubleSide, depthWrite: false });
    for (var pn = 0; pn < 6; pn++) { var pa = pn / 6 * Math.PI * 2 + Math.PI / 6; if (pn === 4) continue;   // (one pane gone)
      var pg = Q(new THREE.PlaneGeometry(0.06, 0.13), pn === 1 ? crackM : paneM, LX + Math.sin(pa) * 0.053, 0.94, Math.cos(pa) * 0.053, 0, pa, 0); pg.renderOrder = 2; pg.castShadow = false; }
    for (var lp2 = 0; lp2 < 6; lp2++) { var la = lp2 / 6 * Math.PI * 2; Q(new THREE.BoxGeometry(0.009, 0.15, 0.009), rust, LX + Math.sin(la) * 0.061, 0.94, Math.cos(la) * 0.061); Q(new THREE.SphereGeometry(0.006, 6, 4), rustL, LX + Math.sin(la) * 0.061, 0.94, Math.cos(la) * 0.061); }
    Q(new THREE.CylinderGeometry(0.062, 0.062, 0.006, 6, 1, true), rust, LX, 0.94, 0);
    Q(new THREE.CylinderGeometry(0.066, 0.06, 0.02, 6), rust, LX, 0.862, 0); Q(new THREE.ConeGeometry(0.05, 0.04, 6), rustD, LX, 0.832, 0, Math.PI, 0, 0); Q(new THREE.SphereGeometry(0.012, 8, 6), rustL, LX, 0.808, 0);
    Q(new THREE.TorusGeometry(0.06, 0.004, 4, 6), rustD, LX, 0.874, 0, Math.PI / 2, 0, Math.PI / 6);   // (rust gathered on the rim)
    var stub = rMat(0xd8ccb0, { roughness: 0.7 });   // (the candle stub in its puddle of wax)
    Q(new THREE.CylinderGeometry(0.035, 0.038, 0.008, 12), stub, LX, 0.876, 0); Q(new THREE.CylinderGeometry(0.017, 0.02, 0.035, 10), stub, LX, 0.897, 0);
    [[0.016, 0.89, 0.005], [-0.012, 0.886, 0.012]].forEach(function (d) { var dr = Q(new THREE.SphereGeometry(0.006, 6, 4), stub, LX + d[0], d[1], d[2]); dr.scale.y = 1.8; });
    Q(new THREE.CylinderGeometry(0.0015, 0.0015, 0.012, 4), rMat(0x111111), LX, 0.92, 0);
    hideWisp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0x6affd8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); hideWisp.position.set(-0.3, 0.93, 0); hideWisp.scale.set(0.35, 0.35, 1); post.add(hideWisp);
    // (a mossy fallen log, ferns, toadstools and long grass, so it all looks like part of the wood)
    var lg = P(new THREE.CylinderGeometry(0.2, 0.24, 2.0, 10), bark, 1.5, 0.18, 0.4, 0, 0.6, Math.PI / 2); [-1, 1].forEach(function (e) { P(new THREE.CircleGeometry(0.2, 10), rMat(0x8a7050), 1.5 + Math.cos(0.6) * e * 1.0, 0.18, 0.4 - Math.sin(0.6) * e * 1.0, 0, 0.6 + (e > 0 ? Math.PI / 2 : -Math.PI / 2), 0); });
    for (var ml = 0; ml < 5; ml++) { var mo = P(new THREE.SphereGeometry(0.14, 8, 5), rMat(0x4a7a34, { roughness: 1 }), 1.5 + Math.cos(0.6) * (ml - 2) * 0.35, 0.36, 0.4 - Math.sin(0.6) * (ml - 2) * 0.35); mo.scale.set(1.2, 0.35, 1); }
    var fern = rMat(0x3f7a3a, { roughness: 0.8, side: THREE.DoubleSide });
    [[-1.4, 1.0], [1.5, 0.9], [-1.7, -0.4], [0.9, -1.8], [-0.4, 1.9], [1.9, 0.2]].forEach(function (fp, k) { for (var f = 0; f < 7; f++) { var fa = f / 7 * Math.PI * 2 + k; var fr = P(new THREE.PlaneGeometry(0.12, 0.55), fern, fp[0] + Math.sin(fa) * 0.12, 0.22, fp[1] + Math.cos(fa) * 0.12, -0.9, fa, 0); fr.geometry.translate(0, 0.27, 0); } });
    [[-1.1, 1.35, 0.06], [-1.25, 1.2, 0.04], [1.3, -0.6, 0.05], [0.4, 1.75, 0.035]].forEach(function (t) { P(new THREE.CylinderGeometry(t[2] * 0.3, t[2] * 0.4, t[2] * 1.4, 8), rMat(0xe8dcc0), t[0], t[2] * 0.7, t[1]); var cap = P(new THREE.SphereGeometry(t[2], 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), rMat(0x8a3a2a, { roughness: 0.6 }), t[0], t[2] * 1.4, t[1]); cap.scale.y = 0.6; });
    var tuft = rMat(0x5a8a3a, { roughness: 0.9 });
    for (var tf = 0; tf < 40; tf++) { var ta = tf * 2.39, tr = 0.4 + (tf % 7) * 0.24, tx = Math.sin(ta) * tr * 1.0, tz = -0.55 + Math.cos(ta) * tr * 0.9, ty = Math.max(0, 1.3 * Math.sqrt(Math.max(0, 1 - (tr * tr) / 4.4)) * 0.62 - 0.08);
      if (tz > 0.6 && Math.abs(tx) < 0.9) continue; P(new THREE.ConeGeometry(0.02, 0.22 + (tf % 3) * 0.08, 4), tuft, tx, ty + 0.1, tz, (tf % 5 - 2) * 0.12, 0, (tf % 3 - 1) * 0.15); }
    // (a thicket round it: hawthorn and holly bushes and a few young trees, so from the paths it's only a clump of green)
    var bushM = [0x3e6a34, 0x4a7a3a, 0x355e2e].map(function (c) { return rMat(c, { roughness: 0.9 }); }), berryM = rMat(0xb0202a, { roughness: 0.5 });
    function bush(x, z, r, k) { var bg = new THREE.Group(); bg.position.set(x, 0, z); G.add(bg);
      for (var b = 0; b < 7; b++) { var ba = b * 2.4 + k, br = r * (0.5 + (b % 3) * 0.2); var bl = P(new THREE.IcosahedronGeometry(br, 1), bushM[(b + k) % 3], Math.sin(ba) * r * 0.55, br * 0.8 + (b % 2) * r * 0.25, Math.cos(ba) * r * 0.55, b, b * 0.7, 0, bg); bl.scale.y = 0.85; }
      if (k % 2) for (var e = 0; e < 8; e++) { var ea = e * 2.1 + k; P(new THREE.SphereGeometry(0.035, 6, 4), berryM, Math.sin(ea) * r * 0.9, r * (0.6 + (e % 3) * 0.3), Math.cos(ea) * r * 0.9, 0, 0, 0, bg); } }
    function sapling(x, z, h, k) { P(new THREE.CylinderGeometry(0.06, 0.09, h, 7), bark, x, h / 2, z);
      for (var c2 = 0; c2 < 4; c2++) { var ca = c2 * 1.7 + k; P(new THREE.IcosahedronGeometry(0.55 - c2 * 0.06, 1), bushM[(c2 + k) % 3], x + Math.sin(ca) * 0.3, h + (c2 % 2) * 0.3 - 0.1, z + Math.cos(ca) * 0.3, c2, 0, 0); } }
    [[-2.3, 0.6, 0.6], [-2.6, -0.8, 0.75], [-1.6, -2.3, 0.7], [0.2, -2.8, 0.8], [1.7, -2.2, 0.65], [2.5, -0.9, 0.7], [2.4, 0.9, 0.55], [-1.9, 1.9, 0.5], [2.0, 2.1, 0.5]].forEach(function (b2, k) { bush(b2[0], b2[1], b2[2], k); });
    sapling(-2.9, 0.1, 2.0, 1); sapling(1.1, -3.1, 2.3, 2); sapling(3.0, -0.1, 1.8, 3); sapling(-0.9, -3.0, 1.9, 4);
    G.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  })(hideGroup);
  (function () {                                                          // (the woods cleared just enough round it; you can't walk into the mound)
    allScenery.forEach(function (t) { var u = t.userData; if (u.gone) return; if (dist(u.solid.x, u.solid.z, HIDE_X, HIDE_Z) < 3.4 + u.solidR) { u.gone = true; u.state = 'gone'; u.solid.r = 0; setTreeGrowth(t, 0); } });
    mineable.forEach(function (r) { if (r.gone) return; if (dist(r.x, r.z, HIDE_X, HIDE_Z) < 3.2 + r.size) { r.gone = true; r.state = 'gone'; r.solid.r = 0; setRock(r, 0); } });
    var m4 = new THREE.Matrix4(), v = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0), cMid = hideWorld(0, -0.55);
    scene.traverse(function (o) { if (!o.isInstancedMesh) return; for (var up = o.parent; up; up = up.parent) if (up === hideGroup) return; o.updateWorldMatrix(true, false); var ch = false;
      for (var i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); v.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld); if (Math.hypot(v.x - cMid.x, v.z - cMid.z) < 2.0 || Math.hypot(v.x - hideDoor.x, v.z - hideDoor.z) < 0.9) { o.setMatrixAt(i, zero); ch = true; } }
      if (ch) o.instanceMatrix.needsUpdate = true; });
    [[0, -0.95, 1.7], [-1.2, -0.5, 0.8], [1.2, -0.3, 0.8], [0, 0.55, 0.7], [1.5, 0.4, 0.5], [1.05, 1.45, 0.15], [-2.3, 0.6, 0.5], [-2.6, -0.8, 0.6], [-1.6, -2.3, 0.6], [0.2, -2.8, 0.6], [1.7, -2.2, 0.55], [2.5, -0.9, 0.6], [2.4, 0.9, 0.45], [-1.9, 1.9, 0.4], [2.0, 2.1, 0.4], [-2.9, 0.1, 0.2], [1.1, -3.1, 0.2], [3.0, -0.1, 0.2], [-0.9, -3.0, 0.2]].forEach(function (b) { var w = hideWorld(b[0], b[1]); solids.push({ x: w.x, z: w.z, r: b[2] }); });
  })();
  // ---- inside: a stone den under the wood ----
  var hideScene = new THREE.Scene(); hideScene.background = new THREE.Color(0x0c0a0e);
  var HDI_X = -1400, HDI_Z = 1000, HDI_W = 9, HDI_D = 7, HDI_H = 3.0, HDI_EXIT_Z = HDI_D / 2 - 0.55;
  var hideRoom = new THREE.Group(); hideRoom.position.set(HDI_X, 0, HDI_Z); hideScene.add(hideRoom);
  hideScene.add(new THREE.HemisphereLight(0x8a7a9a, 0x2a1e18, 0.32));
  var hdFire = new THREE.PointLight(0xff8a3a, 1.1, 9, 1.6); hdFire.position.set(HDI_X + HDI_W / 2 - 0.9, 1.0, HDI_Z - 0.3); hideScene.add(hdFire);
  var hdCandles = [[-1.2, 0.2], [0.6, -0.3], [0, -HDI_D / 2 + 0.8]].map(function (c) { var l = new THREE.PointLight(0xffc070, 0.45, 5, 1.8); l.position.set(HDI_X + c[0], 1.5, HDI_Z + c[1]); hideScene.add(l); return l; });
  function hdHalo(par, x, y, z, size) {                                 // (a candle's soft halo of light, and its white-hot core)
    var h = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffb860, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })); h.position.set(x, y, z); h.scale.set(size, size, 1); par.add(h); hdHalos.push(h);
    var c = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xfff6e0, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })); c.position.set(x, y, z); c.scale.set(size * 0.22, size * 0.32, 1); par.add(c);
  }
  var hdHalos = [];
  var hideSolids = [], hdWalls = [], hdFlames = [], HD_BOARD = [0, -HDI_D / 2 + 0.25];
  (function (R) {
    var W = HDI_W / 2, D = HDI_D / 2, H = HDI_H;
    function p(geo, m, x, y, z, rx, ry, rz, par) { return cpPart(geo, m, x, y, z, rx, ry, rz, par || R); }
    // (the walls: rough fieldstone laid in uneven courses, every stone its own shape, size and colour (grey, brown, a few rusty or
    // bluish), lit on its upper side and shadowed below, pitted, flecked and veined, a few cracked or patched with pale lichen;
    // deep, crumbling mortar between them; and a height map so each stone stands out of the wall. It tiles seamlessly)
    var WS = 1024, WH = 512, wsRnd = (function () { var sd = 11; return function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; })();
    var wStones = [], wy = 0, wRows = [58, 72, 64, 80, 60, 76, 52, 50];   // (courses that add up to the full height)
    wRows.forEach(function (rh) { var x = -wsRnd() * 80; while (x < WS) { var ww = 54 + wsRnd() * 110; if (wsRnd() < 0.15) ww *= 0.6;
      var pts = [], n = 14, cx = x + ww / 2, cy = wy + rh / 2, rx = ww / 2 - 4, ry = rh / 2 - 4, wob = wsRnd() * 10;
      for (var k = 0; k < n; k++) { var aa = k / n * Math.PI * 2, r = 1 + (wsRnd() - 0.5) * 0.18 + Math.sin(aa * 3 + wob) * 0.05, sq = Math.pow(Math.abs(Math.cos(aa)), 0.7) * Math.sign(Math.cos(aa)), sq2 = Math.pow(Math.abs(Math.sin(aa)), 0.7) * Math.sign(Math.sin(aa)); pts.push([cx + sq * rx * r, cy + sq2 * ry * r]); }
      var kind = wsRnd(); wStones.push({ pts: pts, cx: cx, cy: cy, rx: rx, ry: ry, col: kind < 0.6 ? [96, 90, 82] : kind < 0.82 ? [104, 88, 70] : kind < 0.92 ? [112, 80, 62] : [80, 88, 96], tone: 0.75 + wsRnd() * 0.5, crack: wsRnd() < 0.2, lichen: wsRnd() < 0.18 });
      x += ww; } wy += rh; });
    function wPath(g, st, ox, oy) { g.beginPath(); st.pts.forEach(function (q, k) { if (k) g.lineTo(q[0] + ox, q[1] + oy); else g.moveTo(q[0] + ox, q[1] + oy); }); g.closePath(); }
    function wWrap(st, f) { [-WS, 0, WS].forEach(function (ox) { [-WH, 0, WH].forEach(function (oy) { if (st.cx + st.rx + ox < -8 || st.cx - st.rx + ox > WS + 8 || st.cy + st.ry + oy < -8 || st.cy - st.ry + oy > WH + 8) return; f(ox, oy); }); }); }
    var stoneT = cpTex(WS, WH, function (g, w, h) {
      g.fillStyle = '#2e2924'; g.fillRect(0, 0, w, h);
      for (var k = 0; k < 7000; k++) { g.fillStyle = ['rgba(70,62,52,0.6)', 'rgba(20,16,12,0.6)', 'rgba(110,100,86,0.35)'][k % 3]; g.fillRect(wsRnd() * w, wsRnd() * h, 1 + k % 3, 1 + k % 2); }   // (gritty, crumbling mortar)
      wStones.forEach(function (st) { wWrap(st, function (ox, oy) {
        var c = st.col, t = st.tone, cx = st.cx + ox, cy = st.cy + oy;
        g.save(); wPath(g, st, ox, oy); g.clip();
        var gr = g.createRadialGradient(cx - st.rx * 0.35, cy - st.ry * 0.45, 2, cx, cy, Math.max(st.rx, st.ry) * 1.15);   // (lit from above, shadowed below)
        gr.addColorStop(0, 'rgb(' + Math.round(c[0] * t + 40) + ',' + Math.round(c[1] * t + 38) + ',' + Math.round(c[2] * t + 34) + ')'); gr.addColorStop(0.55, 'rgb(' + Math.round(c[0] * t) + ',' + Math.round(c[1] * t) + ',' + Math.round(c[2] * t) + ')'); gr.addColorStop(1, 'rgb(' + Math.round(c[0] * t * 0.5) + ',' + Math.round(c[1] * t * 0.5) + ',' + Math.round(c[2] * t * 0.5) + ')');
        g.fillStyle = gr; g.fillRect(cx - st.rx - 6, cy - st.ry - 6, st.rx * 2 + 12, st.ry * 2 + 12);
        for (var q = 0; q < 70; q++) { var px = cx + (wsRnd() - 0.5) * st.rx * 2, py = cy + (wsRnd() - 0.5) * st.ry * 2; g.fillStyle = q % 6 === 0 ? 'rgba(230,225,210,0.3)' : q % 2 ? 'rgba(20,16,12,0.3)' : 'rgba(160,150,135,0.2)'; g.beginPath(); g.arc(px, py, q % 6 === 0 ? 0.9 : 1.4, 0, Math.PI * 2); g.fill(); }   // (pits and flecks)
        g.strokeStyle = 'rgba(30,24,18,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx - st.rx, cy + (wsRnd() - 0.5) * st.ry); g.quadraticCurveTo(cx, cy + (wsRnd() - 0.5) * st.ry * 1.5, cx + st.rx, cy + (wsRnd() - 0.5) * st.ry); g.stroke();   // (a vein)
        if (st.crack) { g.strokeStyle = 'rgba(10,8,5,0.85)'; g.lineWidth = 1.4; g.beginPath(); var kx = cx + (wsRnd() - 0.5) * st.rx, ky = cy - st.ry; g.moveTo(kx, ky); for (var t2 = 0; t2 < 6; t2++) { kx += (wsRnd() - 0.5) * 10; ky += st.ry / 3; g.lineTo(kx, ky); } g.stroke(); }
        if (st.lichen) for (var l = 0; l < 5; l++) { g.fillStyle = 'rgba(' + (170 + l * 8) + ',' + (180 + l * 5) + ',140,' + (0.35 + wsRnd() * 0.3) + ')'; g.beginPath(); g.arc(cx + (wsRnd() - 0.5) * st.rx, cy + (wsRnd() - 0.5) * st.ry, 2 + wsRnd() * 6, 0, Math.PI * 2); g.fill(); }   // (pale lichen)
        g.restore();
        g.strokeStyle = 'rgba(0,0,0,0.45)'; g.lineWidth = 2.5; wPath(g, st, ox, oy); g.stroke();   // (its edge sunk in the mortar)
      }); });
    }, [3, 2]);
    var stoneH = cpTex(WS / 2, WH / 2, function (g, w, h) {             // (the height map: each stone a rounded hump, the mortar deep)
      g.fillStyle = '#181818'; g.fillRect(0, 0, w, h); g.save(); g.scale(0.5, 0.5);
      wStones.forEach(function (st) { wWrap(st, function (ox, oy) { var gr = g.createRadialGradient(st.cx + ox - st.rx * 0.2, st.cy + oy - st.ry * 0.2, 2, st.cx + ox, st.cy + oy, Math.max(st.rx, st.ry)); gr.addColorStop(0, '#f0f0f0'); gr.addColorStop(0.7, '#a8a8a8'); gr.addColorStop(1, '#505050'); wPath(g, st, ox, oy); g.fillStyle = gr; g.fill(); }); });
      g.restore(); }, [3, 2]);
    var wallM = new THREE.MeshStandardMaterial({ map: stoneT, bumpMap: stoneH, bumpScale: 0.035, roughness: 0.92 });
    // (on each wall: damp rising from the floor, moss along its foot, water stains running down from the top, roots pushing in
    // between the stones up near the ceiling, and a few stones jutting out of the wall)
    var dampT = cpTex(16, 128, function (g, w, h) { var gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, 'rgba(14,12,8,0.75)'); gr.addColorStop(0.5, 'rgba(14,12,8,0.3)'); gr.addColorStop(1, 'rgba(14,12,8,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    var dampM = new THREE.MeshBasicMaterial({ map: dampT, transparent: true, depthWrite: false });
    var streakT = cpTex(32, 256, function (g, w, h) { g.clearRect(0, 0, w, h); for (var k = 0; k < 4; k++) { var x = 8 + k * 5, gr = g.createLinearGradient(0, 0, 0, h * (0.5 + k * 0.12)); gr.addColorStop(0, 'rgba(10,10,8,0.55)'); gr.addColorStop(1, 'rgba(10,10,8,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 2, 0); g.quadraticCurveTo(x + 3, h * 0.3, x - 1, h * (0.5 + k * 0.12)); g.lineTo(x + 1, h * (0.5 + k * 0.12)); g.quadraticCurveTo(x + 5, h * 0.3, x + 3, 0); g.fill(); } });
    var streakM = new THREE.MeshBasicMaterial({ map: streakT, transparent: true, depthWrite: false });
    var mossW = cpTex(128, 32, function (g, w, h) { g.clearRect(0, 0, w, h); for (var k = 0; k < 160; k++) { var x = wsRnd() * w, y = h - Math.pow(wsRnd(), 1.6) * h; g.fillStyle = 'rgba(' + (50 + k % 30) + ',' + (90 + k % 40) + ',40,' + (0.5 + wsRnd() * 0.4) + ')'; g.beginPath(); g.arc(x, y, 1 + wsRnd() * 3, 0, Math.PI * 2); g.fill(); } });
    var mossWM = new THREE.MeshStandardMaterial({ map: mossW, transparent: true, roughness: 1, depthWrite: false });
    var rootM = rMat(0x5a4632, { roughness: 1 }), jutM = [0x6a645a, 0x5a5448, 0x7a7266].map(function (c) { return rMat(c, { roughness: 0.95 }); });
    function wallDetail(g, len, k) {
      var dp = p(new THREE.PlaneGeometry(len, 0.9), dampM, 0, 0.45, 0.004, 0, 0, 0, g); dp.renderOrder = 1; dp.castShadow = false;
      for (var mw = 0; mw < Math.round(len / 1.4); mw++) { var mp2 = p(new THREE.PlaneGeometry(0.9 + wsRnd() * 0.6, 0.22), mossWM, -len / 2 + 0.6 + mw * 1.4 + wsRnd() * 0.4, 0.12, 0.006, 0, 0, 0, g); mp2.renderOrder = 2; mp2.castShadow = false; }
      for (var sk = 0; sk < Math.round(len / 2.2); sk++) { var sp2 = p(new THREE.PlaneGeometry(0.22, 1.2 + wsRnd() * 0.8), streakM, -len / 2 + 0.8 + sk * 2.2 + wsRnd() * 0.8, HDI_H - 0.25 - 0.8, 0.005, 0, 0, 0, g); sp2.renderOrder = 1; sp2.castShadow = false; }
      for (var rt = 0; rt < 2 + (k % 2); rt++) { var rx = -len / 2 + 0.9 + wsRnd() * (len - 1.8), pts = [];   // (roots pushing in near the top)
        for (var q = 0; q <= 8; q++) { var u = q / 8; pts.push(new THREE.Vector3(rx + Math.sin(u * 5 + rt) * 0.06, HDI_H - 0.28 - u * (0.4 + wsRnd() * 0.25), 0.015 + Math.sin(u * 3) * 0.02 + u * 0.01)); }
        p(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.012, 5), rootM, 0, 0, 0, 0, 0, 0, g);
        for (var sb = 0; sb < 3; sb++) { var bp = pts[2 + sb * 2], bpts = [bp, bp.clone().add(new THREE.Vector3((sb % 2 ? 1 : -1) * 0.06, -0.05, 0.01)), bp.clone().add(new THREE.Vector3((sb % 2 ? 1 : -1) * 0.1, -0.13, 0.02))]; p(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bpts), 6, 0.004, 4), rootM, 0, 0, 0, 0, 0, 0, g); } }
      for (var js = 0; js < Math.round(len * 1.2); js++) { var jx = -len / 2 + 0.3 + wsRnd() * (len - 0.6), jy = 0.3 + wsRnd() * (HDI_H - 0.9), jr = 0.06 + wsRnd() * 0.07;   // (stones jutting out of the wall)
        var jst = p(new THREE.DodecahedronGeometry(jr, 1), jutM[js % 3], jx, jy, 0.0, js, js * 0.7, 0, g); jst.scale.set(1.3, 0.8, 0.45); }
    }
    // (the floor: old flagstones laid in running rows, each slab its own size and shade, their edges uneven and chipped, worn
    // pale and smooth where feet have passed, some cracked, flecked with mica and darker veins; the joints between them packed
    // with dark grit, with moss and a few weeds in them. A matching height map gives the slabs, joints and cracks real depth.
    // It tiles seamlessly over the room)
    var FS = 1024, fsRnd = (function () { var sd = 7; return function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; })();
    var slabs = [], fy = 0, rowH = [150, 180, 160, 175, 165, 194];   // (rows that add up to the full height, so it tiles)
    rowH.forEach(function (rh, ri) { var x = -fsRnd() * 120, widths = []; while (x < FS) { var ww = 120 + fsRnd() * 160; widths.push([x, Math.min(ww, FS + 200 - x)]); x += ww; }
      widths.forEach(function (wd) { var j = function () { return (fsRnd() - 0.5) * 9; }; slabs.push({ pts: [[wd[0] + 5 + j(), fy + 5 + j()], [wd[0] + wd[1] - 5 + j(), fy + 5 + j()], [wd[0] + wd[1] - 5 + j(), fy + rh - 5 + j()], [wd[0] + 5 + j(), fy + rh - 5 + j()]],
        tone: 0.75 + fsRnd() * 0.5, hue: fsRnd(), worn: fsRnd(), crack: fsRnd() < 0.35, chips: Math.floor(fsRnd() * 4), seed: fsRnd() * 1000, x: wd[0], y: fy, w: wd[1], h: rh }); }); fy += rh; });
    function slabPath(g, sl, ox, oy) { g.beginPath(); sl.pts.forEach(function (q, k) { var px = q[0] + ox, py = q[1] + oy; if (k) g.lineTo(px, py); else g.moveTo(px, py); }); g.closePath(); }
    function eachWrap(f) { [-FS, 0, FS].forEach(function (ox) { [-FS, 0, FS].forEach(function (oy) { f(ox, oy); }); }); }
    var floorT = cpTex(FS, FS, function (g, w, h) {
      g.fillStyle = '#17130f'; g.fillRect(0, 0, w, h);
      for (var k = 0; k < 9000; k++) { g.fillStyle = ['rgba(60,50,38,0.6)', 'rgba(30,24,18,0.7)', 'rgba(90,80,64,0.4)'][k % 3]; g.fillRect(fsRnd() * w, fsRnd() * h, 1 + (k % 3), 1 + (k % 2)); }   // (grit in the joints)
      slabs.forEach(function (sl) { eachWrap(function (ox, oy) {
        if (sl.x + ox > w + 10 || sl.x + sl.w + ox < -10 || sl.y + oy > h + 10 || sl.y + sl.h + oy < -10) return;
        g.save(); slabPath(g, sl, ox, oy); g.clip();
        var v = Math.round(78 * sl.tone), warm = sl.hue < 0.5 ? 6 : -4;
        var cx = sl.x + ox + sl.w * (0.3 + sl.worn * 0.4), cy = sl.y + oy + sl.h * 0.5, gr = g.createRadialGradient(cx, cy, 4, cx, cy, Math.max(sl.w, sl.h) * 0.75);
        gr.addColorStop(0, 'rgb(' + (v + 26 + warm) + ',' + (v + 20) + ',' + (v + 12 - warm) + ')'); gr.addColorStop(0.6, 'rgb(' + (v + warm) + ',' + (v - 5) + ',' + (v - 12 - warm) + ')'); gr.addColorStop(1, 'rgb(' + (v - 22) + ',' + (v - 26) + ',' + (v - 30) + ')');
        g.fillStyle = gr; g.fillRect(sl.x + ox - 10, sl.y + oy - 10, sl.w + 20, sl.h + 20);   // (worn pale in the middle, darker at the edges)
        for (var q = 0; q < 260; q++) { var sx = sl.x + ox + fsRnd() * sl.w, sy = sl.y + oy + fsRnd() * sl.h; g.fillStyle = q % 7 === 0 ? 'rgba(235,230,215,0.35)' : q % 2 ? 'rgba(30,24,18,0.22)' : 'rgba(150,140,120,0.18)'; g.fillRect(sx, sy, q % 7 === 0 ? 1.5 : 2.5, q % 7 === 0 ? 1.5 : 2.5); }   // (flecks of mica and grit)
        g.strokeStyle = 'rgba(40,32,24,0.28)'; g.lineWidth = 1.2; for (var vn = 0; vn < 3; vn++) { g.beginPath(); var vx = sl.x + ox + fsRnd() * sl.w, vy = sl.y + oy; g.moveTo(vx, vy); for (var t = 0; t < 8; t++) { vx += (fsRnd() - 0.5) * 30; vy += sl.h / 8; g.lineTo(vx, vy); } g.stroke(); }   // (veins in the stone)
        if (sl.worn > 0.6) { g.fillStyle = 'rgba(210,200,180,0.08)'; g.beginPath(); g.ellipse(cx, cy, sl.w * 0.3, sl.h * 0.22, 0, 0, Math.PI * 2); g.fill(); }   // (polished by footsteps)
        g.restore();
        g.strokeStyle = 'rgba(255,245,225,0.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(sl.pts[3][0] + ox, sl.pts[3][1] + oy); g.lineTo(sl.pts[0][0] + ox, sl.pts[0][1] + oy); g.lineTo(sl.pts[1][0] + ox, sl.pts[1][1] + oy); g.stroke();   // (a lit top edge...)
        g.strokeStyle = 'rgba(0,0,0,0.4)'; g.beginPath(); g.moveTo(sl.pts[1][0] + ox, sl.pts[1][1] + oy); g.lineTo(sl.pts[2][0] + ox, sl.pts[2][1] + oy); g.lineTo(sl.pts[3][0] + ox, sl.pts[3][1] + oy); g.stroke();   // (...and a shaded bottom one)
        for (var c2 = 0; c2 < sl.chips; c2++) { var cp = sl.pts[c2 % 4]; g.fillStyle = '#1a1510'; g.beginPath(); g.moveTo(cp[0] + ox, cp[1] + oy); g.lineTo(cp[0] + ox + (c2 % 2 ? -1 : 1) * (8 + fsRnd() * 12), cp[1] + oy + 2); g.lineTo(cp[0] + ox + 2, cp[1] + oy + (c2 < 2 ? 1 : -1) * (6 + fsRnd() * 10)); g.fill(); }   // (chipped corners)
        if (sl.crack) { g.strokeStyle = 'rgba(14,10,6,0.85)'; g.lineWidth = 1.6; g.beginPath(); var kx = sl.x + ox + sl.w * (0.2 + fsRnd() * 0.3), ky = sl.y + oy + 4; g.moveTo(kx, ky); for (var t2 = 0; t2 < 10; t2++) { kx += (fsRnd() - 0.3) * 18; ky += sl.h / 10; g.lineTo(kx, ky); if (t2 === 4) { g.stroke(); g.beginPath(); g.moveTo(kx, ky); var bx = kx, by = ky; for (var t3 = 0; t3 < 4; t3++) { bx += 10 + fsRnd() * 8; by += (fsRnd() - 0.5) * 10; g.lineTo(bx, by); } g.stroke(); g.beginPath(); g.moveTo(kx, ky); } } g.stroke(); }   // (a crack, forking)
      }); });
      for (var m = 0; m < 70; m++) { var s2 = slabs[Math.floor(fsRnd() * slabs.length)], e = s2.pts[Math.floor(fsRnd() * 4)]; g.fillStyle = 'rgba(' + (60 + m % 30) + ',' + (100 + m % 40) + ',40,' + (0.35 + fsRnd() * 0.35) + ')';   // (moss tufts in the joints)
        for (var mt = 0; mt < 6; mt++) { g.beginPath(); g.arc(e[0] + (fsRnd() - 0.5) * 22, e[1] + (fsRnd() - 0.5) * 22, 1.5 + fsRnd() * 3, 0, Math.PI * 2); g.fill(); } }
      for (var wd2 = 0; wd2 < 18; wd2++) { var s3 = slabs[Math.floor(fsRnd() * slabs.length)], e2 = s3.pts[Math.floor(fsRnd() * 4)]; g.strokeStyle = 'rgba(90,120,50,0.8)'; g.lineWidth = 1.5;   // (a few little weeds)
        for (var bl = 0; bl < 4; bl++) { g.beginPath(); g.moveTo(e2[0], e2[1]); g.quadraticCurveTo(e2[0] + (bl - 1.5) * 4, e2[1] - 6, e2[0] + (bl - 1.5) * 7, e2[1] - 10 - fsRnd() * 4); g.stroke(); } }
    }, [2.2, 1.7]);
    var floorH = cpTex(FS / 2, FS / 2, function (g, w, h) {              // (the height map: slabs up, joints and cracks down)
      g.fillStyle = '#202020'; g.fillRect(0, 0, w, h); g.save(); g.scale(0.5, 0.5);
      slabs.forEach(function (sl) { eachWrap(function (ox, oy) { if (sl.x + ox > FS + 10 || sl.x + sl.w + ox < -10 || sl.y + oy > FS + 10 || sl.y + sl.h + oy < -10) return;
        var v = 170 + Math.round(sl.tone * 40), gr = g.createLinearGradient(sl.x + ox, sl.y + oy, sl.x + ox + sl.w, sl.y + oy + sl.h); gr.addColorStop(0, 'rgb(' + v + ',' + v + ',' + v + ')'); gr.addColorStop(1, 'rgb(' + (v - 30) + ',' + (v - 30) + ',' + (v - 30) + ')');
        slabPath(g, sl, ox, oy); g.fillStyle = gr; g.fill(); g.strokeStyle = 'rgba(60,60,60,0.9)'; g.lineWidth = 6; g.stroke(); }); });
      g.restore(); }, [2.2, 1.7]);
    var floorM = new THREE.MeshStandardMaterial({ map: floorT, bumpMap: floorH, bumpScale: 0.025, roughness: 0.82, metalness: 0.02 });
    p(new THREE.PlaneGeometry(HDI_W, HDI_D), floorM, 0, 0, 0, -Math.PI / 2, 0, 0);
    // (grime along the foot of the walls, a damp patch where water drips by the stairs, and loose grit and stones)
    var grimeT = cpTex(64, 64, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(8,6,4,0.75)'); gr.addColorStop(1, 'rgba(8,6,4,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    var grimeM = new THREE.MeshBasicMaterial({ map: grimeT, transparent: true, depthWrite: false });
    [[0, -D + 0.18, HDI_W, 0], [0, D - 0.18, HDI_W, Math.PI], [-W + 0.18, 0, HDI_D, Math.PI / 2], [W - 0.18, 0, HDI_D, -Math.PI / 2]].forEach(function (gm) { var pl = p(new THREE.PlaneGeometry(gm[2], 0.36), grimeM, gm[0], 0.004, gm[1], -Math.PI / 2, 0, gm[3]); pl.castShadow = false; pl.renderOrder = 1; });
    var damp = p(new THREE.CircleGeometry(0.55, 28), new THREE.MeshStandardMaterial({ color: 0x0c0a08, transparent: true, opacity: 0.45, roughness: 0.08, metalness: 0.1, envMap: rubyEnv, envMapIntensity: 0.6, depthWrite: false }), -1.25, 0.005, D - 0.85, -Math.PI / 2, 0, 0); damp.scale.set(1.3, 0.75, 1); damp.renderOrder = 1; damp.castShadow = false;
    var pud = p(new THREE.CircleGeometry(0.22, 24), new THREE.MeshStandardMaterial({ color: 0x1a2028, transparent: true, opacity: 0.6, roughness: 0.02, metalness: 0.3, envMap: rubyEnv, envMapIntensity: 1.2, depthWrite: false }), -1.1, 0.006, D - 0.8, -Math.PI / 2, 0, 0.4); pud.scale.set(1.4, 0.8, 1); pud.renderOrder = 2; pud.castShadow = false;
    var gritM = [0x5a5248, 0x4a4238, 0x6e665a, 0x3a342c].map(function (c) { return rMat(c, { roughness: 1 }); });
    for (var gt = 0; gt < 70; gt++) { var ga = fsRnd(), gx = (fsRnd() - 0.5) * (HDI_W - 0.6), gz = (fsRnd() - 0.5) * (HDI_D - 0.6);
      if (Math.abs(gx) < W - 0.9 && Math.abs(gz) < D - 0.9 && ga < 0.6) continue;   // (gathered mostly along the walls, where no one walks)
      var pb = p(new THREE.DodecahedronGeometry(0.012 + fsRnd() * 0.03), gritM[gt % 4], gx, 0.008, gz, gt, gt * 0.7, 0); pb.scale.y = 0.45; pb.castShadow = false; }
    [[3.6, -1.6, 0.09], [-3.5, -0.3, 0.07], [1.4, 2.6, 0.06]].forEach(function (cs, k) { var ch = p(new THREE.DodecahedronGeometry(cs[2], 0), gritM[k], cs[0], cs[2] * 0.4, cs[1], k, k * 1.3, 0.2); ch.scale.y = 0.5; });   // (a few broken bits of stone)
    var beam = rMat(0x3a2a1c, { roughness: 0.9 });
    [[0, -D, 0, HDI_W], [0, D, Math.PI, HDI_W], [-W, 0, Math.PI / 2, HDI_D], [W, 0, -Math.PI / 2, HDI_D]].forEach(function (w) {   // (rough stone walls with timber posts; the one between you and the camera steps aside)
      var g = new THREE.Group(); g.position.set(w[0], 0, w[1]); g.rotation.y = w[2]; R.add(g);
      p(new THREE.PlaneGeometry(w[3], H), wallM, 0, H / 2, 0, 0, 0, 0, g); wallDetail(g, w[3], w[2] * 2 | 0);
      for (var ps = -w[3] / 2 + 0.2; ps <= w[3] / 2 - 0.1; ps += w[3] / 3.5) p(new THREE.BoxGeometry(0.2, H, 0.18), beam, ps, H / 2, 0.08, 0, 0, 0, g);
      p(new THREE.BoxGeometry(w[3], 0.22, 0.2), beam, 0, H - 0.11, 0.08, 0, 0, 0, g);
      hdWalls.push({ g: g, n: w[1] ? new THREE.Vector3(0, 0, w[1] < 0 ? -1 : 1) : new THREE.Vector3(w[0] < 0 ? -1 : 1, 0, 0), d: w[1] ? D : W });
    });
    // (the stairs up to the cellar door, a sliver of daylight at the top)
    for (var st = 0; st < 3; st++) p(new THREE.BoxGeometry(1.3, 0.12 * (st + 1), 0.3), rMat(0x4a4640, { roughness: 0.95 }), 0, 0.06 * (st + 1), D - 0.75 + st * 0.3);   // (worn stone steps up to the door)
    p(new THREE.PlaneGeometry(1.1, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff0c8 }), 0, 2.4, D - 0.02, 0, Math.PI, 0);
    // (the Errand Board, its frame, notices and lantern: see the back wall, in great detail, further down)
    var BX = HD_BOARD[0];
    hideSolids.push([BX - 0.6, -D + 0.35, 0.3], [BX, -D + 0.35, 0.3], [BX + 0.6, -D + 0.35, 0.3]);
    // (the guild's banners either side of the board: see the back-left corner, in great detail, further down)
    // (the long table and the worn rug under it, and everything on the table, all in great detail: see below)
    var TX = -1.0, TZ = 0.4;
    (function () {   // (the long table, the rug under it and everything on the table, all in great detail)
      var TT = 0.82, k, x, y, tr = (function () { var sd = 4242; return function () { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }; })();
      function q(par, geo, m, px, py, pz, rx, ry, rz) { return cpPart(geo, m, px, py, pz, rx, ry, rz, par); }
      function grp(px, py, pz, ry) { var g = new THREE.Group(); g.position.set(px, py, pz); g.rotation.y = ry || 0; R.add(g); return g; }
      function quiet(o) { o.castShadow = false; return o; }
      function rgb(c, f) { return 'rgb(' + Math.round(c[0] * f) + ',' + Math.round(c[1] * f) + ',' + Math.round(c[2] * f) + ')'; }
      var brassM = rMat(0xa8843e, { metalness: 0.8, roughness: 0.32, envMap: rubyEnv }), ironM = rMat(0x2a2624, { metalness: 0.6, roughness: 0.55 }), darkBrass = rMat(0x7a6030, { metalness: 0.75, roughness: 0.4, envMap: rubyEnv });
      var waxM = rMat(0xece2c8, { roughness: 0.55 }), oldWax = rMat(0xd8caa0, { roughness: 0.6 }), wickM = rMat(0x141010, { roughness: 1 }), emberM = rMat(0x401000, { emissive: 0xff5010, emissiveIntensity: 1.2 });
      var flameM = rMat(0xffd890, { emissive: 0xffa040, emissiveIntensity: 1.4 }), flameB = new THREE.MeshBasicMaterial({ color: 0x6080ff, transparent: true, opacity: 0.55 }); hdFlames.push(flameM);
      // ---- the rug: a plain old woven rug, deep wine red with a dark border and a few thin stripes, the weave showing, a little
      // faded and worn where the stools scrape, fringed at both ends ----
      function dia(g, cx, cy, rx, ry) { g.beginPath(); g.moveTo(cx, cy - ry); g.lineTo(cx + rx, cy); g.lineTo(cx, cy + ry); g.lineTo(cx - rx, cy); g.closePath(); }
      var rugT = cpTex(1024, 584, function (g, w, h) { var i, x2, y2;
        [[0, '#2a1416'], [30, '#8a6a44'], [36, '#2a1416'], [52, '#8a6a44'], [56, '#5a1c20'], [66, '#2a1416'], [72, '#6a2226']].forEach(function (b) { g.fillStyle = b[1]; g.fillRect(b[0], b[0], w - b[0] * 2, h - b[0] * 2); });
        for (i = 0; i < 9; i++) { g.fillStyle = i % 3 === 1 ? 'rgba(120,36,40,0.25)' : i % 3 === 2 ? 'rgba(30,6,8,0.15)' : 'rgba(0,0,0,0)'; g.fillRect(72, 72 + i * (h - 144) / 9, w - 144, (h - 144) / 9 + 1); }   // (faint bands where the dye changed)
        for (y2 = 0; y2 < h; y2 += 2) { g.fillStyle = 'rgba(0,0,0,0.13)'; g.fillRect(0, y2, w, 1); }   // (the weave)
        for (x2 = 0; x2 < w; x2 += 3) { g.fillStyle = 'rgba(255,235,215,0.04)'; g.fillRect(x2, 0, 1, h); }
        for (i = 0; i < 30000; i++) { g.fillStyle = i % 3 ? 'rgba(0,0,0,0.15)' : 'rgba(255,230,200,0.06)'; g.fillRect(tr() * w, tr() * h, 1 + (i % 4 === 0), 1); }
        [[-122, -181, 100, 50], [122, -181, 100, 50], [-122, 181, 100, 50], [122, 181, 100, 50]].forEach(function (o) { var ex = w / 2 + o[0], ey = h / 2 + o[1], gr = g.createRadialGradient(ex, ey, 4, ex, ey, o[2]);   // (worn where the stools scrape)
          gr.addColorStop(0, 'rgba(160,110,95,0.3)'); gr.addColorStop(1, 'rgba(160,110,95,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(ex, ey, o[2], o[3], 0, 0, Math.PI * 2); g.fill(); });
        var vg = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.6); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(10,6,4,0.3)'); g.fillStyle = vg; g.fillRect(0, 0, w, h); });
      var rugB = cpTex(512, 292, function (g, w, h) { g.fillStyle = '#909090'; g.fillRect(0, 0, w, h); for (var y2 = 1; y2 < h; y2 += 2) { g.fillStyle = 'rgba(40,40,40,0.5)'; g.fillRect(0, y2, w, 1); } for (var x2 = 0; x2 < w; x2 += 2) { g.fillStyle = 'rgba(60,60,60,0.25)'; g.fillRect(x2, 0, 1, h); } });
      quiet(q(R, new THREE.PlaneGeometry(4.2, 2.4), new THREE.MeshStandardMaterial({ map: rugT, bumpMap: rugB, bumpScale: 0.006, roughness: 1 }), TX, 0.012, TZ, -Math.PI / 2, 0, 0));
      var rugEdge = rMat(0x2a1416, { roughness: 1 });   // (the rug's thickness)
      [[0, -1.195, 4.2, 0.01], [0, 1.195, 4.2, 0.01], [-2.095, 0, 0.01, 2.4], [2.095, 0, 0.01, 2.4]].forEach(function (e) { quiet(q(R, new THREE.BoxGeometry(e[2], 0.012, e[3]), rugEdge, TX + e[0], 0.006, TZ + e[1])); });
      var FN = 64, fr = new THREE.InstancedMesh(new THREE.BoxGeometry(0.075, 0.003, 0.009), rMat(0xc8b898, { roughness: 1 }), FN * 2), fm = new THREE.Matrix4(), fq = new THREE.Quaternion(), fe = new THREE.Euler(), fv = new THREE.Vector3(), fs = new THREE.Vector3();
      for (k = 0; k < FN * 2; k++) { var side = k < FN ? -1 : 1, zr = -1.17 + (k % FN) / (FN - 1) * 2.34, len = 0.8 + tr() * 0.4;   // (the fringe)
        fe.set(0, (tr() - 0.5) * 0.25, -side * 0.12); fq.setFromEuler(fe); fs.set(len, 1, 1); fv.set(TX + side * (2.1 + 0.0375 * len), 0.008, TZ + zr); fm.compose(fv, fq, fs); fr.setMatrixAt(k, fm); }
      fr.receiveShadow = true; R.add(fr);
      // ---- the table: five thick oak planks with gaps between, dark with age, the grain flowing round knots; scratched, gouged and
      // carved (tally marks, a fang, a game of noughts and crosses), ringed by tankards, spotted with wax and ink, a scorch where a
      // candle burned down; cleated ends nailed on, iron corner plates, an apron, eight-sided legs with iron bands, braces and a
      // wedged stretcher underneath ----
      var PW = 1024, PH = 640, SX = PW / 2.4, SZ = PH;
      function tX(xa) { return (xa - TX + 1.2) * SX; } function tZ(za) { return (za - TZ + 0.5) * SZ; }
      var knots = [], grains = [], scr = [], gouge = [], wax = [];
      for (k = 0; k < 5; k++) for (var j = 0; j < 1 + (k % 2); j++) knots.push([60 + tr() * (PW - 120), k * 128 + 30 + tr() * 68]);
      for (k = 0; k < 5; k++) for (j = 0; j < 46; j++) grains.push([k, k * 128 + 4 + tr() * 120, tr() * 6.28, 0.004 + tr() * 0.01, 1 + tr() * 3, tr()]);
      for (k = 0; k < 260; k++) scr.push([tr() * PW, tr() * PH, (tr() - 0.5) * 0.6 + (tr() < 0.2 ? 1.2 : 0), 6 + tr() * 40]);
      for (k = 0; k < 14; k++) gouge.push([tr() * PW, tr() * PH, (tr() - 0.5) * 2.4, 10 + tr() * 22]);
      [[-0.5, 0.05, 10], [-2.05, 0.72, 14], [-1.0, 0.1, 3], [-0.2, 0.85, 3]].forEach(function (c) { for (var i = 0; i < c[2]; i++) wax.push([tX(c[0] + (tr() - 0.5) * 0.24), tZ(c[1] + (tr() - 0.5) * 0.2), 2 + tr() * 5]); });
      function grainY(gr, gx) { var gy = gr[1] + Math.sin(gx * gr[3] + gr[2]) * gr[4]; knots.forEach(function (kk) { var dy = gr[1] - kk[1]; if (Math.abs(dy) < 40 && Math.floor(kk[1] / 128) === gr[0]) gy += (dy >= 0 ? 1 : -1) * 16 * Math.exp(-Math.pow((gx - kk[0]) / 46, 2)) * Math.exp(-dy * dy / 500); }); return Math.max(gr[0] * 128 + 1, Math.min(gr[0] * 128 + 127, gy)); }
      function carve(g, bump, draw) { if (!bump) { g.strokeStyle = 'rgba(200,170,130,0.35)'; g.lineWidth = 1.5; g.save(); g.translate(1, 1.5); draw(); g.restore(); } g.strokeStyle = bump ? 'rgba(30,30,30,0.9)' : 'rgba(25,14,6,0.85)'; g.lineWidth = bump ? 3 : 2.2; draw(); }
      function paintTop(g, bump) {
        var cols = [[96, 66, 40], [86, 59, 36], [102, 72, 45], [82, 57, 35], [92, 63, 39]], i;
        for (i = 0; i < 5; i++) { var c = cols[i], y0 = i * 128;
          if (bump) { g.fillStyle = '#9a9a9a'; g.fillRect(0, y0, PW, 128); }
          else { var lg = g.createLinearGradient(0, y0, 0, y0 + 128); lg.addColorStop(0, rgb(c, 0.62)); lg.addColorStop(0.12, rgb(c, 1)); lg.addColorStop(0.5, rgb(c, 1.08)); lg.addColorStop(0.88, rgb(c, 0.95)); lg.addColorStop(1, rgb(c, 0.6)); g.fillStyle = lg; g.fillRect(0, y0, PW, 128);
            for (var b = 0; b < 30; b++) { g.fillStyle = b % 2 ? 'rgba(30,18,8,0.07)' : 'rgba(170,130,90,0.06)'; g.beginPath(); g.ellipse(tr() * PW, y0 + tr() * 128, 30 + tr() * 90, 4 + tr() * 12, 0, 0, Math.PI * 2); g.fill(); } } }
        grains.forEach(function (gr) { g.strokeStyle = bump ? 'rgba(60,60,60,0.45)' : 'rgba(40,24,12,' + (0.15 + gr[5] * 0.3).toFixed(2) + ')'; g.lineWidth = 0.6 + gr[5] * 1.6; g.beginPath(); for (var gx = 0; gx <= PW; gx += 8) { if (gx) g.lineTo(gx, grainY(gr, gx)); else g.moveTo(gx, grainY(gr, gx)); } g.stroke(); });
        knots.forEach(function (kk) { if (bump) { g.fillStyle = 'rgba(50,50,50,0.8)'; g.beginPath(); g.ellipse(kk[0], kk[1], 9, 5, 0, 0, Math.PI * 2); g.fill(); return; }
          for (var r = 5; r > 0; r--) { g.strokeStyle = 'rgba(40,22,10,' + (0.2 + r * 0.06).toFixed(2) + ')'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(kk[0], kk[1], 4 + r * 5, 2 + r * 2.4, 0, 0, Math.PI * 2); g.stroke(); }
          g.fillStyle = '#2a170a'; g.beginPath(); g.ellipse(kk[0], kk[1], 6, 3.5, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(10,5,2,0.9)'; g.lineWidth = 1; g.beginPath(); g.moveTo(kk[0] + 5, kk[1]); g.lineTo(kk[0] + 22, kk[1] + 2); g.stroke(); });   // (a little check running from it)
        for (i = 0; i < 5; i++) { g.fillStyle = bump ? '#202020' : 'rgba(20,12,6,0.85)'; g.fillRect(0, i * 128, PW, 2); g.fillRect(0, i * 128 + 126, PW, 2);
          [16, PW - 16].forEach(function (nx) { [i * 128 + 34, i * 128 + 94].forEach(function (ny) { if (!bump) { var rg2 = g.createRadialGradient(nx, ny, 1, nx, ny, 9); rg2.addColorStop(0, 'rgba(90,40,10,0.5)'); rg2.addColorStop(1, 'rgba(90,40,10,0)'); g.fillStyle = rg2; g.fillRect(nx - 9, ny - 9, 18, 18); }
            g.fillStyle = bump ? '#d0d0d0' : '#1c1814'; g.beginPath(); g.arc(nx, ny, 3.5, 0, Math.PI * 2); g.fill(); }); }); }   // (the nails, a rusty halo round each)
        g.fillStyle = bump ? '#202020' : 'rgba(20,12,6,0.9)'; g.fillRect(PW * 0.62, 256, 2, 128);   // (a butt joint where the middle plank was pieced)
        if (!bump) { var pg = g.createRadialGradient(PW / 2, PH / 2, 40, PW / 2, PH / 2, PW * 0.55); pg.addColorStop(0, 'rgba(255,220,170,0.08)'); pg.addColorStop(1, 'rgba(0,0,0,0.12)'); g.fillStyle = pg; g.fillRect(0, 0, PW, PH); }
        scr.forEach(function (s) { g.strokeStyle = bump ? 'rgba(40,40,40,0.6)' : 'rgba(190,160,120,0.28)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(s[0] + Math.cos(s[2]) * s[3], s[1] + Math.sin(s[2]) * s[3]); g.stroke(); });
        gouge.forEach(function (s) { carve(g, bump, function () { g.beginPath(); g.moveTo(s[0], s[1]); g.lineTo(s[0] + Math.cos(s[2]) * s[3], s[1] + Math.sin(s[2]) * s[3]); g.stroke(); }); });
        var tx0 = tX(-1.3), tz0 = tZ(-0.045);   // (tally marks, a fang, noughts and crosses: carved by bored adventurers)
        carve(g, bump, function () { for (var t = 0; t < 2; t++) { for (var m = 0; m < 4; m++) { g.beginPath(); g.moveTo(tx0 + t * 40 + m * 7, tz0 - 14); g.lineTo(tx0 + t * 40 + m * 7 + 1, tz0 + 14); g.stroke(); } g.beginPath(); g.moveTo(tx0 + t * 40 - 4, tz0 + 10); g.lineTo(tx0 + t * 40 + 26, tz0 - 10); g.stroke(); } for (var m2 = 0; m2 < 3; m2++) { g.beginPath(); g.moveTo(tx0 + 84 + m2 * 7, tz0 - 14); g.lineTo(tx0 + 85 + m2 * 7, tz0 + 14); g.stroke(); } });
        var fx = tX(-0.62), fz = tZ(0.8);
        carve(g, bump, function () { [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(fx + s * 4, fz - 22); g.quadraticCurveTo(fx + s * 16, fz - 4, fx + s * 6, fz + 22); g.quadraticCurveTo(fx + s * 4, fz + 2, fx + s * 4, fz - 22); g.stroke(); }); g.beginPath(); g.arc(fx, fz - 26, 12, Math.PI * 0.15, Math.PI * 0.85, true); g.stroke(); });
        var ox = tX(0.17), oz = tZ(0.04);
        carve(g, bump, function () { [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(ox + s * 9, oz - 26); g.lineTo(ox + s * 9, oz + 26); g.stroke(); g.beginPath(); g.moveTo(ox - 27, oz + s * 13); g.lineTo(ox + 27, oz + s * 13); g.stroke(); });
          g.beginPath(); g.moveTo(ox - 24, oz - 23); g.lineTo(ox - 13, oz - 16); g.moveTo(ox - 13, oz - 23); g.lineTo(ox - 24, oz - 16); g.stroke(); g.beginPath(); g.ellipse(ox, oz, 5, 7, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(ox + 13, oz + 16); g.lineTo(ox + 24, oz + 23); g.moveTo(ox + 24, oz + 16); g.lineTo(ox + 13, oz + 23); g.stroke(); });
        if (!bump) [[-1.92, 0.24, 0.05, 0.4], [0.15, 0.68, 0.05, 1.8], [-0.25, -0.02, 0.048, 3.1], [-0.95, 0.86, 0.05, 0.9], [0.18, 0.2, 0.046, 4.4], [-1.55, 0.02, 0.05, 2.2]].forEach(function (r) {   // (rings left by tankards)
          g.strokeStyle = 'rgba(35,20,8,0.42)'; g.lineWidth = 3; g.beginPath(); g.ellipse(tX(r[0]), tZ(r[1]), r[2] * SX, r[2] * SZ, 0, r[3], r[3] + 5.2); g.stroke();
          g.strokeStyle = 'rgba(35,20,8,0.18)'; g.lineWidth = 2; g.beginPath(); g.ellipse(tX(r[0]) + 3, tZ(r[1]) + 4, r[2] * SX * 0.92, r[2] * SZ * 0.92, 0, r[3] + 1, r[3] + 4); g.stroke(); });
        wax.forEach(function (wx) { g.fillStyle = bump ? '#d8d8d8' : 'rgba(230,220,195,0.88)'; g.beginPath(); g.ellipse(wx[0], wx[1], wx[2], wx[2] * 1.4, 0, 0, Math.PI * 2); g.fill(); if (!bump) { g.fillStyle = 'rgba(255,255,240,0.5)'; g.beginPath(); g.arc(wx[0] - wx[2] * 0.3, wx[1] - wx[2] * 0.4, wx[2] * 0.35, 0, Math.PI * 2); g.fill(); } });
        if (!bump) { var ix = tX(-1.52), iz = tZ(0.74);   // (ink spilt and spattered by the inkwell)
          g.fillStyle = 'rgba(12,12,26,0.92)'; [[0, 0, 14, 18], [10, 8, 9, 12], [-8, 10, 7, 9], [14, -6, 5, 7]].forEach(function (b) { g.beginPath(); g.ellipse(ix + b[0], iz + b[1], b[2], b[3], 0, 0, Math.PI * 2); g.fill(); });
          for (i = 0; i < 22; i++) { var ia = tr() * 6.28, id = 22 + tr() * 50; g.beginPath(); g.ellipse(ix + Math.cos(ia) * id, iz + Math.sin(ia) * id * 1.4, 1 + tr() * 2.5, 1.4 + tr() * 3, 0, 0, Math.PI * 2); g.fill(); }
          g.fillStyle = 'rgba(120,140,200,0.25)'; g.beginPath(); g.ellipse(ix - 4, iz - 6, 5, 4, 0, 0, Math.PI * 2); g.fill(); }
        var sx2 = tX(-0.72), sz2 = tZ(-0.03), sg2 = g.createRadialGradient(sx2, sz2, 2, sx2, sz2, 34); sg2.addColorStop(0, bump ? 'rgba(20,20,20,0.9)' : 'rgba(8,4,2,0.95)'); sg2.addColorStop(0.5, bump ? 'rgba(60,60,60,0.5)' : 'rgba(30,14,6,0.6)'); sg2.addColorStop(1, 'rgba(60,30,10,0)'); g.fillStyle = sg2; g.beginPath(); g.ellipse(sx2, sz2, 30, 40, 0, 0, Math.PI * 2); g.fill();   // (a scorch where a candle burned down)
      }
      var topT = cpTex(PW, PH, function (g) { paintTop(g, false); }), topB = cpTex(PW / 2, PH / 2, function (g) { g.scale(0.5, 0.5); paintTop(g, true); });
      var topM = new THREE.MeshStandardMaterial({ map: topT, bumpMap: topB, bumpScale: 0.012, roughness: 0.72 });
      function grainTex(vert, base) { return cpTex(128, 128, function (g, w, h) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (var i = 0; i < 40; i++) { var o = (i * 37) % 128; g.strokeStyle = 'rgba(30,18,8,' + (0.15 + (i % 5) * 0.06).toFixed(2) + ')'; g.lineWidth = 0.6 + (i % 3) * 0.5; g.beginPath(); for (var t = 0; t <= 128; t += 8) { var d = o + Math.sin(t / 128 * Math.PI * 2 + i) * 2.5; if (vert) { if (t) g.lineTo(d, t); else g.moveTo(d, t); } else { if (t) g.lineTo(t, d); else g.moveTo(t, d); } } g.stroke(); } }, [1, 1]); }
      var legM = new THREE.MeshStandardMaterial({ map: grainTex(true, '#4a3420'), roughness: 0.85 }), railM = new THREE.MeshStandardMaterial({ map: grainTex(false, '#4a3420'), roughness: 0.85 }), plankSide = new THREE.MeshStandardMaterial({ map: grainTex(false, '#3e2c1a'), roughness: 0.85 });
      var plY = [0, -0.0025, 0.0012, -0.0015, 0.002];
      for (k = 0; k < 5; k++) { var pz = TZ - 0.4 + k * 0.2, ptop = TT + plY[k];
        q(R, new THREE.BoxGeometry(2.4, 0.07, 0.194), plankSide, TX, ptop - 0.0356, pz);
        var pg = new THREE.PlaneGeometry(2.4, 0.194), uv = pg.attributes.uv; for (j = 0; j < uv.count; j++) uv.setY(j, 1 - (k + 1 - uv.getY(j)) / 5);
        quiet(q(R, pg, topM, TX, ptop, pz, -Math.PI / 2, 0, 0)); }
      q(R, new THREE.BoxGeometry(2.38, 0.012, 0.96), rMat(0x1a120a, { roughness: 1 }), TX, TT - 0.072, TZ);   // (dark under the gaps)
      [-1, 1].forEach(function (s) { q(R, new THREE.BoxGeometry(0.1, 0.078, 1.02), legM, TX + s * 1.25, TT - 0.036, TZ);   // (the cleats across the ends, nailed down)
        for (var n = 0; n < 5; n++) q(R, new THREE.CylinderGeometry(0.009, 0.009, 0.004, 8), ironM, TX + s * 1.25, TT + 0.004, TZ - 0.4 + n * 0.2);
        [-1, 1].forEach(function (t) { q(R, new THREE.BoxGeometry(0.12, 0.06, 0.006), ironM, TX + s * 1.24, TT - 0.03, TZ + t * 0.513); q(R, new THREE.BoxGeometry(0.006, 0.06, 0.12), ironM, TX + s * 1.303, TT - 0.03, TZ + t * 0.45);   // (iron corner plates, riveted)
          [-0.035, 0.035].forEach(function (o) { q(R, new THREE.SphereGeometry(0.005, 6, 4), ironM, TX + s * 1.24 + o, TT - 0.03, TZ + t * 0.517); q(R, new THREE.SphereGeometry(0.005, 6, 4), ironM, TX + s * 1.307, TT - 0.03, TZ + t * 0.45 + o); }); }); });
      [-1, 1].forEach(function (t) { q(R, new THREE.BoxGeometry(2.3, 0.12, 0.04), railM, TX, TT - 0.135, TZ + t * 0.44); q(R, new THREE.CylinderGeometry(0.008, 0.008, 2.3, 6), plankSide, TX, TT - 0.192, TZ + t * 0.46, 0, 0, Math.PI / 2); });   // (the apron and its bead)
      [-1, 1].forEach(function (s) { q(R, new THREE.BoxGeometry(0.04, 0.12, 0.84), railM, TX + s * 1.15, TT - 0.135, TZ); });
      [[-1.2, -0.42], [1.2, -0.42], [-1.2, 0.42], [1.2, 0.42]].forEach(function (l) { var lx = TX + l[0], lz = TZ + l[1];   // (the legs: square where the apron joins, then eight-sided, bound with iron, on a square foot)
        q(R, new THREE.BoxGeometry(0.12, 0.13, 0.12), legM, lx, 0.69, lz);
        q(R, new THREE.CylinderGeometry(0.058, 0.064, 0.57, 8), legM, lx, 0.34, lz, 0, Math.PI / 8, 0);
        q(R, new THREE.CylinderGeometry(0.066, 0.06, 0.03, 8), legM, lx, 0.61, lz, 0, Math.PI / 8, 0);
        q(R, new THREE.BoxGeometry(0.13, 0.06, 0.13), legM, lx, 0.03, lz);
        q(R, new THREE.CylinderGeometry(0.069, 0.069, 0.028, 8), ironM, lx, 0.11, lz, 0, Math.PI / 8, 0);
        q(R, new THREE.SphereGeometry(0.005, 6, 4), ironM, lx, 0.11, lz + (l[1] > 0 ? 0.068 : -0.068));
        q(R, new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8), plankSide, lx, 0.71, lz + (l[1] > 0 ? 0.061 : -0.061), Math.PI / 2, 0, 0);   // (the pegs through the joints)
        q(R, new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8), plankSide, lx + (l[0] > 0 ? 0.061 : -0.061), 0.66, lz, 0, 0, Math.PI / 2); });
      [-1, 1].forEach(function (s) { q(R, new THREE.BoxGeometry(0.055, 0.065, 0.84), railM, TX + s * 1.2, 0.17, TZ); q(R, new THREE.BoxGeometry(0.012, 0.075, 0.02), plankSide, TX + s * 1.244, 0.17, TZ, 0, 0, s * 0.08);   // (the stretchers, wedged)
        [-1, 1].forEach(function (t) { q(R, new THREE.BoxGeometry(0.04, 0.22, 0.035), railM, TX + s * 1.1, 0.56, TZ + t * 0.42, 0, 0, s * 0.75); }); });   // (corner braces)
      q(R, new THREE.BoxGeometry(2.5, 0.06, 0.05), railM, TX, 0.17, TZ);
      // ---- on the table ----
      function candle(par, cx, cy, cz, h, r, lean, halo) {   // (a candle: a melted crown, wax runs down its sides, a curled wick; lit, or burnt out)
        var c = new THREE.Group(); c.position.set(cx, cy, cz); c.rotation.set(lean, 0, lean * 0.6); par.add(c);
        q(c, lbLathe([[0, 0], [r, 0], [r * 1.02, h * 0.5], [r, h], [r * 0.9, h + 0.004], [r * 0.7, h - 0.003], [0, h - 0.006]], 16), waxM, 0, 0, 0);
        for (var d = 0; d < 5; d++) { var a = d * 1.33 + 0.4, dl = Math.min(h * 0.7, 0.012 + (d % 3) * 0.012), dr = quiet(q(c, new THREE.SphereGeometry(0.0055, 6, 5), waxM, Math.cos(a) * r, h - dl * 0.6, Math.sin(a) * r)); dr.scale.set(0.9, dl / 0.011 + 1, 0.9); }
        q(c, new THREE.CylinderGeometry(0.0013, 0.0016, halo ? 0.014 : 0.009, 5), wickM, 0, h + 0.002, 0, 0.12, 0, 0.1);
        if (!halo) return;
        quiet(q(c, new THREE.SphereGeometry(0.0022, 6, 4), emberM, 0.0008, h + 0.009, 0.0008));
        quiet(q(c, new THREE.SphereGeometry(0.0135, 10, 8), flameM, 0, h + 0.026, 0)).scale.set(1, 2.1, 1);
        quiet(q(c, new THREE.SphereGeometry(0.006, 8, 6), flameB, 0, h + 0.012, 0)).scale.y = 1.3;
        hdHalo(c, 0, h + 0.028, 0, halo); }
      var cs = grp(-0.5, TT, 0.05, 0.6);   // (a brass chamberstick, a finger ring and thumb rest, old wax pooled in its dish)
      q(cs, lbLathe([[0, 0], [0.068, 0], [0.074, 0.004], [0.075, 0.011], [0.07, 0.012], [0.066, 0.006], [0.03, 0.007], [0, 0.007]], 28), brassM, 0, 0, 0);
      q(cs, lbLathe([[0, 0.006], [0.024, 0.006], [0.02, 0.014], [0.014, 0.022], [0.016, 0.03], [0.022, 0.04], [0.027, 0.048], [0.025, 0.053], [0.02, 0.053], [0.0195, 0.046], [0, 0.046]], 20), brassM, 0, 0, 0);
      q(cs, new THREE.TorusGeometry(0.019, 0.0045, 8, 18), brassM, 0.088, 0.02, 0);
      q(cs, new THREE.CylinderGeometry(0.014, 0.012, 0.003, 12), brassM, 0.095, 0.041, 0, 0, 0, 0.3);
      quiet(q(cs, new THREE.SphereGeometry(0.028, 12, 6), oldWax, 0.032, 0.0065, -0.012)).scale.set(1, 0.12, 0.8);
      candle(cs, 0, 0.046, 0, 0.12, 0.0195, 0, 0.32);
      var c2 = grp(-2.05, TT, 0.72, 0);   // (a candle stuck in a mound of old wax, two burnt-out stubs beside it)
      q(c2, lbLathe([[0, 0], [0.06, 0], [0.055, 0.006], [0.04, 0.014], [0.026, 0.02], [0, 0.022]], 18), oldWax, 0, 0, 0);
      for (k = 0; k < 7; k++) { var wa = k * 0.9, wr = 0.05 + tr() * 0.02; quiet(q(c2, new THREE.SphereGeometry(0.012 + tr() * 0.008, 8, 5), oldWax, Math.cos(wa) * wr, 0.002, Math.sin(wa) * wr)).scale.y = 0.35; }
      candle(c2, -0.012, 0.018, 0.008, 0.1, 0.022, 0.06, 0.28); candle(c2, 0.035, 0.008, -0.025, 0.03, 0.017, 0.15, 0); candle(c2, -0.03, 0.006, 0.035, 0.018, 0.019, -0.1, 0);
      function parch(g, w, h, base, n) { g.fillStyle = base; g.fillRect(0, 0, w, h); var i;   // (old parchment: blotches, fibres, foxing, darkened edges)
        for (i = 0; i < n; i++) { var bx = tr() * w, by = tr() * h, br = 20 + tr() * 90, bg = g.createRadialGradient(bx, by, 1, bx, by, br); bg.addColorStop(0, i % 3 ? 'rgba(150,110,60,0.10)' : 'rgba(255,245,215,0.14)'); bg.addColorStop(1, 'rgba(150,110,60,0)'); g.fillStyle = bg; g.fillRect(bx - br, by - br, br * 2, br * 2); }
        g.strokeStyle = 'rgba(120,90,50,0.12)'; g.lineWidth = 0.6; for (i = 0; i < n * 10; i++) { var fx = tr() * w, fy = tr() * h, fa = tr() * 6.28; g.beginPath(); g.moveTo(fx, fy); g.lineTo(fx + Math.cos(fa) * 8, fy + Math.sin(fa) * 8); g.stroke(); }
        for (i = 0; i < n; i++) { g.fillStyle = 'rgba(140,90,40,0.3)'; g.beginPath(); g.arc(tr() * w, tr() * h, 0.8 + tr() * 2, 0, 6.28); g.fill(); } }
      function edges(g, w, h) { [[0, 0, 0, 40], [0, h, 0, h - 40], [0, 0, 40, 0], [w, 0, w - 40, 0]].forEach(function (e) { var lg = g.createLinearGradient(e[0], e[1], e[2], e[3]); lg.addColorStop(0, 'rgba(90,55,20,0.55)'); lg.addColorStop(1, 'rgba(90,55,20,0)'); g.fillStyle = lg; g.fillRect(0, 0, w, h); });
        for (var i = 0; i < 40; i++) { var t = tr(), s = i % 4, ex = s < 2 ? t * w : (s === 2 ? 0 : w), ey = s < 2 ? (s ? h : 0) : t * h; g.fillStyle = 'rgba(70,40,15,0.5)'; g.beginPath(); g.arc(ex, ey, 3 + tr() * 9, 0, 6.28); g.fill(); } }
      function crease(g, x0, y0, x1, y1) { g.strokeStyle = 'rgba(90,60,30,0.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); g.strokeStyle = 'rgba(255,250,230,0.25)'; g.beginPath(); g.moveTo(x0 + 2, y0 + 2); g.lineTo(x1 + 2, y1 + 2); g.stroke(); }
      function scribble(g, x0, y0, len) { g.strokeStyle = 'rgba(60,40,20,0.8)'; g.lineWidth = 1.3; g.beginPath(); for (var sx = 0; sx < len; sx += 3) { if (sx % 34 < 3) g.moveTo(x0 + sx, y0); else g.lineTo(x0 + sx, y0 + Math.sin(sx * 0.9) * 3 + (sx % 13 < 3 ? -4 : 0)); } g.stroke(); }
      var mapT = cpTex(1024, 698, function (g, w, h) {   // (the big map: the isles, mountains, forests, a river, towns, a compass rose, a sea serpent, a dashed route to a red X, the guild's hideout ringed in red)
        parch(g, w, h, '#d9c597', 90); var i;
        g.strokeStyle = 'rgba(110,80,40,0.10)'; g.lineWidth = 1; for (y = 60; y < h; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } for (x = 60; x < w; x += 70) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
        g.strokeStyle = 'rgba(70,60,50,0.35)'; g.lineWidth = 1.2; for (i = 0; i < 140; i++) { var wx = tr() * w, wy = tr() * h; g.beginPath(); g.moveTo(wx, wy); g.quadraticCurveTo(wx + 5, wy - 4, wx + 10, wy); g.quadraticCurveTo(wx + 15, wy + 4, wx + 20, wy); g.stroke(); }
        function blob(cx, cy, rx, ry, s) { g.beginPath(); for (var b = 0; b <= 64; b++) { var a = b / 64 * Math.PI * 2, r = 1 + Math.sin(a * 3 + s) * 0.12 + Math.sin(a * 7 + s * 2) * 0.07 + Math.sin(a * 13 + s * 3) * 0.04, px = cx + Math.cos(a) * rx * r, py = cy + Math.sin(a) * ry * r; if (b) g.lineTo(px, py); else g.moveTo(px, py); } g.closePath(); }
        var isl = [[420, 330, 250, 170, 1.3], [800, 200, 90, 60, 4.1], [790, 520, 70, 50, 2.2], [150, 560, 60, 40, 5.5], [880, 380, 30, 22, 0.7]];
        isl.forEach(function (I) { [26, 16, 8].forEach(function (lw, n) { g.lineWidth = lw; g.strokeStyle = 'rgba(70,90,100,' + (0.06 + n * 0.05).toFixed(2) + ')'; blob(I[0], I[1], I[2], I[3], I[4]); g.stroke(); }); });
        isl.forEach(function (I) { blob(I[0], I[1], I[2], I[3], I[4]); g.fillStyle = '#e3d2a4'; g.fill(); g.lineWidth = 2.6; g.strokeStyle = '#4a3018'; g.stroke(); });
        for (i = 0; i < 9; i++) { var mx = 290 + i * 30 + Math.sin(i) * 6, my = 270 + Math.sin(i * 0.8) * 18, mh = 26 + (i % 3) * 8; g.fillStyle = '#e3d2a4'; g.beginPath(); g.moveTo(mx - 16, my); g.lineTo(mx, my - mh); g.lineTo(mx + 16, my); g.closePath(); g.fill(); g.strokeStyle = '#4a3018'; g.lineWidth = 1.6; g.stroke();
          g.strokeStyle = 'rgba(74,48,24,0.6)'; g.lineWidth = 1; for (var hl = 1; hl < 5; hl++) { g.beginPath(); g.moveTo(mx + hl * 3, my - mh + hl * mh / 5 + 2); g.lineTo(mx + hl * 3 - 4, my); g.stroke(); } }
        function tree(tx, ty) { g.fillStyle = '#7a8a50'; g.beginPath(); g.arc(tx, ty - 6, 5, 0, 6.28); g.fill(); g.strokeStyle = '#3a3018'; g.lineWidth = 1; g.stroke(); g.beginPath(); g.moveTo(tx, ty - 1); g.lineTo(tx, ty + 3); g.stroke(); }
        [[380, 390, 14], [520, 360, 10], [300, 360, 8], [800, 205, 6], [790, 525, 5]].forEach(function (f) { for (var t = 0; t < f[2]; t++) tree(f[0] + (tr() - 0.5) * 80, f[1] + (tr() - 0.5) * 40); });
        g.strokeStyle = 'rgba(60,90,110,0.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(400, 285); g.bezierCurveTo(430, 330, 380, 380, 440, 420); g.quadraticCurveTo(470, 450, 452, 494); g.stroke();
        [[470, 430], [330, 300], [800, 190], [560, 300]].forEach(function (t) { g.fillStyle = '#c8b080'; g.fillRect(t[0] - 5, t[1] - 4, 10, 7); g.strokeStyle = '#3a2814'; g.lineWidth = 1; g.strokeRect(t[0] - 5, t[1] - 4, 10, 7); g.beginPath(); g.moveTo(t[0] - 6, t[1] - 4); g.lineTo(t[0], t[1] - 10); g.lineTo(t[0] + 6, t[1] - 4); g.stroke(); });
        g.strokeStyle = '#8a2222'; g.lineWidth = 2.4; g.beginPath(); g.arc(270, 250, 16, 0, 6.28); g.stroke();
        g.setLineDash([7, 6]); g.beginPath(); g.moveTo(470, 430); g.bezierCurveTo(600, 520, 650, 600, 770, 520); g.stroke(); g.setLineDash([]);
        g.lineWidth = 4; g.beginPath(); g.moveTo(777, 507); g.lineTo(793, 523); g.moveTo(793, 507); g.lineTo(777, 523); g.stroke();
        function rose(cx, cy, r) { g.strokeStyle = '#4a3018'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, r, 0, 6.28); g.stroke(); g.beginPath(); g.arc(cx, cy, r * 0.86, 0, 6.28); g.stroke();
          for (var t = 0; t < 32; t++) { var a = t / 32 * 6.28, l = t % 4 ? 0.06 : 0.12; g.beginPath(); g.moveTo(cx + Math.cos(a) * r * 0.86, cy + Math.sin(a) * r * 0.86); g.lineTo(cx + Math.cos(a) * r * (0.86 - l), cy + Math.sin(a) * r * (0.86 - l)); g.stroke(); }
          [1, 3, 5, 7, 0, 2, 4, 6].forEach(function (t) { var a2 = t / 8 * 6.28 - Math.PI / 2, L = t % 2 ? r * 0.5 : r * 0.95, wd = t % 2 ? 0.25 : 0.2;
            [[-1, '#4a3018'], [1, '#e8dab0']].forEach(function (sd) { g.fillStyle = (t === 0 && sd[0] < 0) ? '#8a2222' : sd[1]; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a2) * L, cy + Math.sin(a2) * L); g.lineTo(cx + Math.cos(a2 + sd[0] * wd) * r * 0.2, cy + Math.sin(a2 + sd[0] * wd) * r * 0.2); g.closePath(); g.fill(); g.strokeStyle = '#4a3018'; g.lineWidth = 0.8; g.stroke(); }); }); }
        rose(100, 110, 62);
        g.strokeStyle = '#4a3018'; g.lineWidth = 3; for (i = 0; i < 3; i++) { g.beginPath(); g.arc(560 + i * 34, 640, 13, Math.PI, 0); g.stroke(); } g.beginPath(); g.moveTo(658, 640); g.quadraticCurveTo(672, 615, 688, 622); g.lineTo(676, 630); g.stroke();
        g.fillStyle = '#e8d8ac'; g.lineWidth = 2; g.beginPath(); g.moveTo(40, 610); g.quadraticCurveTo(170, 596, 300, 610); g.lineTo(300, 670); g.quadraticCurveTo(170, 656, 40, 670); g.closePath(); g.fill(); g.stroke();
        [40, 300].forEach(function (ex) { g.beginPath(); g.arc(ex, 616, 8, 0, 6.28); g.stroke(); }); scribble(g, 64, 630, 210); scribble(g, 84, 650, 170);
        for (i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#e8d8ac' : '#3a2814'; g.fillRect(760 + i * 34, 656, 34, 8); } g.strokeStyle = '#3a2814'; g.lineWidth = 1; g.strokeRect(760, 656, 136, 8);
        scribble(g, 700, 70, 260); scribble(g, 700, 90, 220); scribble(g, 700, 110, 150);
        crease(g, w / 2, 0, w / 2, h); crease(g, 0, h / 2, w, h / 2);
        g.strokeStyle = 'rgba(110,70,30,0.35)'; g.lineWidth = 4; g.beginPath(); g.ellipse(900, 600, 46, 42, 0, 0.4, 5.9); g.stroke();
        edges(g, w, h); });
      function paper(wd, dp, sx, sy, f) { var gg = new THREE.PlaneGeometry(wd, dp, sx, sy), pp = gg.attributes.position; for (var i = 0; i < pp.count; i++) pp.setZ(i, f(pp.getX(i), pp.getY(i))); gg.computeVertexNormals(); return gg; }
      quiet(q(R, paper(1.1, 0.75, 40, 6, function (px, py) { var e = Math.max(0, Math.abs(px) - 0.43) / 0.12; return e * e * 0.028 + Math.sin(px * 9 + py * 4) * 0.0012; }), new THREE.MeshStandardMaterial({ map: mapT, roughness: 0.95, side: THREE.DoubleSide }), TX - 0.3, TT + 0.004, TZ, -Math.PI / 2, 0, 0.12));
      var planT = cpTex(512, 368, function (g, w, h) {   // (a sketched plan of a dungeon: rooms, corridors, stairs, a pit, a skull, the route and an X; folded in four)
        parch(g, w, h, '#e0cfa2', 30); var i;
        g.strokeStyle = 'rgba(80,90,110,0.15)'; g.lineWidth = 1; for (x = 0; x < w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (y = 0; y < h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
        [[40, 40, 120, 90], [220, 30, 100, 70], [380, 60, 90, 120], [60, 200, 90, 110], [200, 170, 140, 110], [380, 250, 100, 80]].forEach(function (r) { g.fillStyle = 'rgba(120,90,50,0.12)'; g.fillRect(r[0], r[1], r[2], r[3]); g.strokeStyle = '#3a2814'; g.lineWidth = 3; g.strokeRect(r[0], r[1], r[2], r[3]); });
        [[[156, 65], [224, 65]], [[316, 80], [384, 80]], [[100, 126], [100, 204]], [[146, 250], [204, 250]], [[336, 200], [420, 200], [420, 176]], [[300, 276], [300, 290], [384, 290]]].forEach(function (c) { [[12, '#3a2814'], [7, '#d8c597']].forEach(function (s) { g.strokeStyle = s[1]; g.lineWidth = s[0]; g.beginPath(); c.forEach(function (pt, n) { if (n) g.lineTo(pt[0], pt[1]); else g.moveTo(pt[0], pt[1]); }); g.stroke(); }); });
        g.strokeStyle = '#3a2814'; g.lineWidth = 1.2; for (i = 0; i < 6; i++) { g.beginPath(); g.moveTo(54 + i * 6, 96); g.lineTo(54 + i * 6, 120); g.stroke(); }
        for (i = 0; i < 4; i++) { g.fillStyle = '#3a2814'; g.beginPath(); g.arc(400 + (i % 2) * 50, 85 + Math.floor(i / 2) * 70, 4, 0, 6.28); g.fill(); }
        g.beginPath(); g.arc(105, 260, 22, 0, 6.28); g.stroke(); for (i = -20; i < 22; i += 5) { g.beginPath(); g.moveTo(105 + i, 260 - Math.sqrt(484 - i * i)); g.lineTo(105 + i, 260 + Math.sqrt(484 - i * i)); g.stroke(); }
        g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(270, 215, 11, 0, 6.28); g.fill(); g.stroke(); g.fillStyle = '#3a2814'; g.fillRect(264, 211, 4, 4); g.fillRect(272, 211, 4, 4); g.fillRect(267, 222, 6, 5);
        g.strokeStyle = '#8a2222'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(100, 85); g.lineTo(100, 255); g.lineTo(270, 250); g.lineTo(300, 290); g.lineTo(420, 290); g.stroke(); g.setLineDash([]);
        g.beginPath(); g.moveTo(420, 290); g.lineTo(410, 284); g.moveTo(420, 290); g.lineTo(410, 296); g.stroke(); g.lineWidth = 3.5; g.beginPath(); g.moveTo(440, 278); g.lineTo(456, 294); g.moveTo(456, 278); g.lineTo(440, 294); g.stroke();
        scribble(g, 30, 345, 220); scribble(g, 300, 345, 120); crease(g, w / 2, 0, w / 2, h); crease(g, 0, h / 2, w, h / 2);
        g.fillStyle = 'rgba(14,12,22,0.8)'; g.beginPath(); g.ellipse(470, 30, 9, 7, 0.4, 0, 6.28); g.fill(); edges(g, w, h); });
      quiet(q(R, paper(0.5, 0.36, 12, 8, function (px, py) { return 0.006 * Math.max(0, 1 - Math.abs(px) / 0.25) + 0.003 * (1 - Math.abs(py) / 0.18); }), new THREE.MeshStandardMaterial({ map: planT, roughness: 0.95, side: THREE.DoubleSide }), -0.3, TT + 0.002, 0.6, -Math.PI / 2, 0, -0.4));
      var dg = grp(-0.8, TT - 0.028, 0.65, 0.4); dg.rotation.x = 0.18; dg.rotation.z = 0.12;   // (the dagger pinning the map: a bevelled blade with a fuller, curled quillons, a wire-bound grip, a pommel set with garnets)
      var bs = new THREE.Shape(); bs.moveTo(0, 0); bs.lineTo(0.011, 0.028); bs.quadraticCurveTo(0.0135, 0.11, 0.0125, 0.165); bs.lineTo(0.016, 0.176); bs.lineTo(-0.016, 0.176); bs.lineTo(-0.0125, 0.165); bs.quadraticCurveTo(-0.0135, 0.11, -0.011, 0.028); bs.lineTo(0, 0);
      var bgeo = new THREE.ExtrudeGeometry(bs, { depth: 0.002, bevelEnabled: true, bevelThickness: 0.0016, bevelSize: 0.0028, bevelSegments: 1, curveSegments: 6 }); bgeo.translate(0, 0, -0.001);
      q(dg, bgeo, rMat(0xc8ccd2, { metalness: 0.92, roughness: 0.22, envMap: rubyEnv }), 0, 0, 0);
      q(dg, new THREE.BoxGeometry(0.0035, 0.11, 0.0058), rMat(0x8a9098, { metalness: 0.9, roughness: 0.35, envMap: rubyEnv }), 0, 0.105, 0);
      q(dg, new THREE.BoxGeometry(0.1, 0.012, 0.016), darkBrass, 0, 0.182, 0); quiet(q(dg, new THREE.SphereGeometry(0.009, 8, 6), darkBrass, 0, 0.182, 0)).scale.set(1, 1.3, 1.1);
      [-1, 1].forEach(function (s) { q(dg, new THREE.TorusGeometry(0.009, 0.0045, 6, 10, Math.PI), darkBrass, s * 0.05, 0.173, 0, 0, 0, -s * Math.PI / 2); q(dg, new THREE.SphereGeometry(0.005, 6, 4), darkBrass, s * 0.05, 0.164, 0); });
      q(dg, new THREE.CylinderGeometry(0.0105, 0.012, 0.085, 10), rMat(0x2a1810, { roughness: 0.9 }), 0, 0.23, 0);
      for (k = 0; k < 9; k++) { var wy = 0.193 + k * 0.0092; q(dg, new THREE.TorusGeometry(0.012 - (wy - 0.1875) / 0.085 * 0.0015 + 0.0004, 0.0015, 4, 12), brassM, 0, wy, 0, Math.PI / 2 + 0.25, 0, 0); }
      q(dg, new THREE.SphereGeometry(0.017, 12, 10), darkBrass, 0, 0.287, 0).scale.set(1, 0.85, 0.75); q(dg, new THREE.SphereGeometry(0.005, 6, 4), darkBrass, 0, 0.303, 0);
      [-1, 1].forEach(function (s) { q(dg, new THREE.SphereGeometry(0.0055, 8, 6), rMat(0x9a1020, { emissive: 0x300008, roughness: 0.15, metalness: 0.2 }), 0, 0.287, s * 0.0115); });
      var lthT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#5e3c22'; g.fillRect(0, 0, w, h); var i; for (i = 0; i < 400; i++) { g.fillStyle = i % 2 ? 'rgba(30,16,6,0.25)' : 'rgba(150,110,70,0.15)'; g.fillRect(tr() * w, tr() * h, 2, 1); }
        for (i = 0; i < 14; i++) { var cx = tr() * w, cy = tr() * h; g.strokeStyle = 'rgba(25,12,4,0.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + 10, cy + (tr() - 0.5) * 20, cx + 20 + tr() * 20, cy + (tr() - 0.5) * 16); g.stroke(); }
        g.setLineDash([3, 3]); g.strokeStyle = 'rgba(210,180,130,0.75)'; g.lineWidth = 1.2; [w / 2 - 4, w / 2 + 4].forEach(function (sx) { g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx, h); g.stroke(); }); g.setLineDash([]); g.fillStyle = 'rgba(20,10,4,0.5)'; g.fillRect(w / 2 - 1, 0, 2, h); }, [3, 1]);
      var leatherM = new THREE.MeshStandardMaterial({ map: lthT, bumpMap: lthT, bumpScale: 0.002, roughness: 0.85, side: THREE.DoubleSide });
      var pu = grp(-0.05, TT, 0.12, 0.3);   // (a stitched leather coin purse, its drawstring loose, coins spilling out)
      var pb = q(pu, lbLathe([[0, 0], [0.035, 0.002], [0.06, 0.018], [0.07, 0.042], [0.064, 0.068], [0.044, 0.088], [0.024, 0.098], [0.021, 0.104], [0.03, 0.112], [0.04, 0.122], [0.042, 0.13], [0.034, 0.127], [0.024, 0.118], [0.016, 0.114]], 18), leatherM, 0, 0, 0); pb.scale.set(1.08, 1, 0.94);
      var pp2 = pb.geometry.attributes.position; for (k = 0; k < pp2.count; k++) { var vy = pp2.getY(k); if (vy > 0.104) { var ang = Math.atan2(pp2.getZ(k), pp2.getX(k)), ff = 1 + 0.14 * Math.sin(ang * 7) * (vy - 0.104) / 0.026; pp2.setX(k, pp2.getX(k) * ff); pp2.setZ(k, pp2.getZ(k) * ff); pp2.setY(k, vy + 0.004 * Math.sin(ang * 5)); } } pb.geometry.computeVertexNormals();
      q(pu, new THREE.CircleGeometry(0.02, 12), rMat(0x120a04, { roughness: 1 }), 0, 0.106, 0, -Math.PI / 2, 0, 0);
      var cordM = rMat(0x9a7a4a, { roughness: 0.95 }); q(pu, new THREE.TorusGeometry(0.023, 0.0028, 6, 18), cordM, 0, 0.101, 0, Math.PI / 2, 0, 0);
      [[1, 0.2], [-1, 1.2]].forEach(function (t) { var bx = Math.cos(t[1]) * 0.024, bz = Math.sin(t[1]) * 0.024, pts = [new THREE.Vector3(bx, 0.101, bz), new THREE.Vector3(bx * 2.2, 0.09, bz * 2.2), new THREE.Vector3(bx * 3.1, 0.06, bz * 3.1), new THREE.Vector3(bx * 3.4 + 0.01 * t[0], 0.03, bz * 3.4), new THREE.Vector3(bx * 3.6 + 0.03 * t[0], 0.004, bz * 3.6 + 0.02)];
        q(pu, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.0022, 5), cordM, 0, 0, 0); q(pu, new THREE.SphereGeometry(0.005, 6, 5), cordM, pts[4].x, pts[4].y + 0.001, pts[4].z); q(pu, new THREE.ConeGeometry(0.004, 0.012, 5), cordM, pts[4].x + 0.008 * t[0], 0.004, pts[4].z + 0.004, 0, 0, t[0] * Math.PI / 2); });
      function coinTex(base, dark, light, sym) { return cpTex(64, 64, function (g, w, h) { var gr = g.createRadialGradient(24, 22, 2, 32, 32, 32); gr.addColorStop(0, light); gr.addColorStop(0.7, base); gr.addColorStop(1, dark); g.fillStyle = gr; g.fillRect(0, 0, w, h);
        g.strokeStyle = dark; g.lineWidth = 3; g.beginPath(); g.arc(32, 32, 27, 0, 6.28); g.stroke(); g.fillStyle = dark; for (var i = 0; i < 36; i++) { var a = i / 36 * 6.28; g.fillRect(32 + Math.cos(a) * 23 - 0.7, 32 + Math.sin(a) * 23 - 0.7, 1.4, 1.4); }
        if (sym === 0) { g.beginPath(); g.arc(32, 32, 13, 0, 6.28); g.fill(); g.fillStyle = base; g.beginPath(); g.arc(37, 29, 11, 0, 6.28); g.fill(); g.fillStyle = dark; g.beginPath(); for (i = 0; i < 10; i++) { var r = i % 2 ? 2 : 5, b = i / 10 * 6.28 - 1.57; g.lineTo(42 + Math.cos(b) * r, 26 + Math.sin(b) * r); } g.fill(); }
        else if (sym === 1) { g.beginPath(); g.moveTo(20, 40); g.lineTo(18, 24); g.lineTo(25, 32); g.lineTo(32, 20); g.lineTo(39, 32); g.lineTo(46, 24); g.lineTo(44, 40); g.closePath(); g.fill(); }
        else { g.lineWidth = 2.5; g.strokeRect(24, 24, 16, 16); g.beginPath(); g.moveTo(24, 24); g.lineTo(40, 40); g.moveTo(40, 24); g.lineTo(24, 40); g.stroke(); } }); }
      var coinM = [[0xd8b040, '#c8a038', '#6a4a10', '#fff0a0', 0], [0xb8bcc0, '#b0b4b8', '#50545a', '#f0f4f8', 1], [0xb06a3a, '#a8643a', '#4a2410', '#e8a070', 2]].map(function (c) { var t = coinTex(c[1], c[2], c[3], c[4]), face = new THREE.MeshStandardMaterial({ map: t, metalness: 0.7, roughness: 0.3, envMap: rubyEnv, bumpMap: t, bumpScale: 0.0015 }); return [rMat(c[0], { metalness: 0.75, roughness: 0.35, envMap: rubyEnv }), face, face]; });
      var coinG = new THREE.CylinderGeometry(0.016, 0.016, 0.0035, 20);
      function coin(t, cx, cy, cz, rx, rz) { quiet(q(R, coinG, coinM[t], cx, cy, cz, rx || 0, tr() * 6, rz || 0)); }
      for (k = 0; k < 6; k++) coin(0, -0.17 + (tr() - 0.5) * 0.004, TT + 0.00175 + k * 0.0036, 0.2 + (tr() - 0.5) * 0.004);
      for (k = 0; k < 4; k++) coin(1, -0.12 + (tr() - 0.5) * 0.004, TT + 0.00175 + k * 0.0036, 0.27 + (tr() - 0.5) * 0.004);
      [[0, -0.2, 0.28], [0, -0.08, 0.24], [1, -0.22, 0.12], [2, -0.15, 0.31], [0, 0.03, 0.22], [2, -0.1, 0.03], [1, 0.05, 0.05], [0, -0.03, 0.29]].forEach(function (c) { coin(c[0], c[1], TT + 0.00175, c[2]); });
      coin(0, -0.145, TT + 0.01, 0.2, 0.5, 0.2); coin(2, 0.0, TT + 0.016, 0.32, Math.PI / 2, 0); coin(0, -0.046, TT + 0.11, 0.12, 1.1, 0);
      var staveT = cpTex(256, 64, function (g, w, h) { g.fillStyle = '#6a4a2c'; g.fillRect(0, 0, w, h); for (var i = 0; i < 12; i++) { var sx = i * w / 12; g.fillStyle = 'rgba(' + (i % 3 ? 0 : 40) + ',20,8,' + (0.08 + (i % 4) * 0.05).toFixed(2) + ')'; g.fillRect(sx, 0, w / 12, h);
        for (var gl = 0; gl < 5; gl++) { g.strokeStyle = 'rgba(30,18,8,0.3)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(sx + 3 + gl * 4, 0); g.lineTo(sx + 3 + gl * 4 + Math.sin(i + gl) * 2, h); g.stroke(); } g.fillStyle = 'rgba(15,8,2,0.9)'; g.fillRect(sx, 0, 1.5, h); } });
      var t1 = grp(-1.95, TT, 0.2, 0.9), aleM = rMat(0x4a2408, { roughness: 0.15 }), foamM = rMat(0xeee4cc, { roughness: 0.9 });   // (a wooden tankard of staves and iron hoops, full of ale with a head of foam running over)
      q(t1, lbLathe([[0, 0], [0.05, 0], [0.049, 0.07], [0.046, 0.14], [0.041, 0.14], [0.044, 0.07], [0.045, 0.012], [0, 0.012]], 24), new THREE.MeshStandardMaterial({ map: staveT, roughness: 0.8, side: THREE.DoubleSide }), 0, 0, 0);
      q(t1, new THREE.TorusGeometry(0.0505, 0.0035, 6, 28), ironM, 0, 0.022, 0, Math.PI / 2, 0, 0); q(t1, new THREE.TorusGeometry(0.048, 0.0035, 6, 28), ironM, 0, 0.118, 0, Math.PI / 2, 0, 0);
      q(t1, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.044, 0.118, 0), new THREE.Vector3(0.075, 0.12, 0), new THREE.Vector3(0.09, 0.09, 0), new THREE.Vector3(0.085, 0.05, 0), new THREE.Vector3(0.05, 0.03, 0)]), 20, 0.0075, 6), rMat(0x5a3e24, { roughness: 0.8 }), 0, 0, 0);
      quiet(q(t1, new THREE.CircleGeometry(0.0415, 24), aleM, 0, 0.112, 0, -Math.PI / 2, 0, 0)); quiet(q(t1, new THREE.TorusGeometry(0.037, 0.006, 6, 24), foamM, 0, 0.115, 0, Math.PI / 2, 0, 0));
      for (k = 0; k < 10; k++) { var fa = tr() * 6.28, fd = tr() * 0.03; quiet(q(t1, new THREE.SphereGeometry(0.008 + tr() * 0.006, 8, 5), foamM, Math.cos(fa) * fd, 0.115, Math.sin(fa) * fd)).scale.y = 0.4; }
      quiet(q(t1, new THREE.SphereGeometry(0.006, 8, 6), foamM, -0.046, 0.126, 0.012)).scale.set(0.7, 2.6, 0.8);
      var pewM = rMat(0x8c9096, { metalness: 0.7, roughness: 0.35, envMap: rubyEnv, side: THREE.DoubleSide }), t2 = grp(0.12, TT, 0.72, -2.4);   // (a pewter tankard, its hinged lid thrown open)
      q(t2, lbLathe([[0, 0], [0.05, 0], [0.052, 0.004], [0.049, 0.01], [0.046, 0.016], [0.043, 0.03], [0.041, 0.125], [0.045, 0.13], [0.046, 0.138], [0.04, 0.138], [0.038, 0.012], [0, 0.012]], 28), pewM, 0, 0, 0);
      q(t2, new THREE.TorusGeometry(0.0432, 0.0018, 6, 28), pewM, 0, 0.03, 0, Math.PI / 2, 0, 0); q(t2, new THREE.TorusGeometry(0.0415, 0.0016, 6, 28), pewM, 0, 0.1, 0, Math.PI / 2, 0, 0);
      q(t2, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.041, 0.12, 0), new THREE.Vector3(0.07, 0.125, 0), new THREE.Vector3(0.085, 0.095, 0), new THREE.Vector3(0.078, 0.055, 0), new THREE.Vector3(0.06, 0.035, 0), new THREE.Vector3(0.043, 0.03, 0)]), 20, 0.006, 6), pewM, 0, 0, 0);
      q(t2, new THREE.CircleGeometry(0.037, 20), rMat(0x1a1a1c, { roughness: 0.6 }), 0, 0.0125, 0, -Math.PI / 2, 0, 0);
      q(t2, new THREE.CylinderGeometry(0.006, 0.006, 0.016, 10), pewM, 0.05, 0.142, 0, Math.PI / 2, 0, 0);
      var lid = new THREE.Group(); lid.position.set(0.05, 0.142, 0); lid.rotation.z = -1.75; t2.add(lid);
      q(lid, lbLathe([[0, 0.012], [0.02, 0.011], [0.035, 0.006], [0.047, 0.002], [0.048, -0.002], [0, -0.002]], 24), pewM, -0.048, 0, 0); q(lid, new THREE.SphereGeometry(0.006, 8, 6), pewM, -0.048, 0.014, 0); q(lid, new THREE.SphereGeometry(0.007, 8, 6), pewM, 0.004, 0.01, 0);
      var hg = grp(-2.1, TT, 0.1, 0.4), hgW = rMat(0x4a3018, { roughness: 0.7 }), sandM = rMat(0xd8b878, { roughness: 1 });   // (the hourglass: turned caps and spindles, sand trickling through)
      var capG = lbLathe([[0, 0], [0.056, 0], [0.059, 0.005], [0.057, 0.011], [0.052, 0.014], [0.05, 0.019], [0.044, 0.022], [0, 0.022]], 24);
      q(hg, capG, hgW, 0, 0, 0); q(hg, capG, hgW, 0, 0.262, 0, Math.PI, 0, 0);
      var spG = lbLathe([[0.0045, 0.022], [0.0075, 0.03], [0.0045, 0.042], [0.0065, 0.06], [0.004, 0.09], [0.0065, 0.115], [0.0075, 0.131], [0.0065, 0.147], [0.004, 0.172], [0.0065, 0.202], [0.0045, 0.22], [0.0075, 0.232], [0.0045, 0.24]], 10);
      [0, 1, 2].forEach(function (i) { var a = i / 3 * Math.PI * 2; q(hg, spG, hgW, Math.cos(a) * 0.044, 0, Math.sin(a) * 0.044); });
      q(hg, lbLathe([[0, 0.023], [0.031, 0.025], [0.035, 0.04], [0.026, 0.05], [0.012, 0.058], [0, 0.062]], 20), sandM, 0, 0, 0);
      q(hg, lbLathe([[0, 0.131], [0.004, 0.131], [0.02, 0.152], [0.03, 0.17], [0.033, 0.178], [0.02, 0.172], [0.008, 0.165], [0, 0.162]], 20), sandM, 0, 0, 0);
      quiet(q(hg, new THREE.CylinderGeometry(0.0011, 0.0011, 0.069, 4), sandM, 0, 0.0965, 0));
      quiet(q(hg, lbLathe([[0, 0.022], [0.03, 0.024], [0.036, 0.05], [0.034, 0.08], [0.02, 0.11], [0.004, 0.131], [0.02, 0.152], [0.034, 0.182], [0.036, 0.212], [0.03, 0.238], [0, 0.24]], 24), new THREE.MeshStandardMaterial({ color: 0xe8f0ff, transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0.1, envMap: rubyEnv, depthWrite: false }), 0, 0, 0));
      var iw = grp(-1.6, TT, 0.82, 0.3);   // (a faceted glass inkwell, its brass cap off, a quill standing in it, ink dribbled down the neck)
      q(iw, new THREE.CylinderGeometry(0.03, 0.03, 0.026, 8), rMat(0x050508, { roughness: 0.2 }), 0, 0.016, 0);
      q(iw, lbLathe([[0, 0], [0.034, 0], [0.038, 0.003], [0.038, 0.03], [0.034, 0.036], [0.016, 0.044], [0.013, 0.046], [0.013, 0.054], [0.016, 0.056], [0.016, 0.06], [0.011, 0.06], [0.011, 0.05], [0, 0.05]], 8), new THREE.MeshStandardMaterial({ color: 0x1c3028, roughness: 0.08, metalness: 0.2, envMap: rubyEnv, transparent: true, opacity: 0.88 }), 0, 0, 0);
      q(iw, new THREE.CircleGeometry(0.011, 10), rMat(0x050508, { roughness: 0.05 }), 0, 0.052, 0, -Math.PI / 2, 0, 0); q(iw, new THREE.TorusGeometry(0.0155, 0.0018, 6, 16), brassM, 0, 0.057, 0, Math.PI / 2, 0, 0);
      q(iw, lbLathe([[0, 0], [0.018, 0], [0.018, 0.012], [0.015, 0.014], [0, 0.014]], 16), brassM, 0.062, 0.018, 0.01, 0, 0, Math.PI / 2 - 0.1);
      quiet(q(iw, new THREE.SphereGeometry(0.004, 6, 5), rMat(0x050508, { roughness: 0.05 }), 0.0135, 0.046, 0.004)).scale.set(0.6, 2.4, 0.6);
      var featherT = cpTex(64, 256, function (g, w, h) { g.clearRect(0, 0, w, h); g.save(); g.beginPath(); g.moveTo(32, 250); g.bezierCurveTo(12, 200, 6, 90, 26, 6); g.lineTo(32, 2); g.bezierCurveTo(50, 60, 62, 170, 34, 250); g.closePath(); g.clip();
        var fg = g.createLinearGradient(0, 0, 0, h); fg.addColorStop(0, '#f6f2ea'); fg.addColorStop(0.55, '#e8e0d0'); fg.addColorStop(0.9, '#b8b0a4'); fg.addColorStop(1, '#8a8278'); g.fillStyle = fg; g.fillRect(0, 0, w, h);
        for (var i = 0; i < 5; i++) { g.fillStyle = 'rgba(90,80,70,0.22)'; g.fillRect(0, 40 + i * 36, w, 8); }
        g.strokeStyle = 'rgba(120,110,100,0.35)'; g.lineWidth = 0.8; for (y = 0; y < h + 20; y += 2) { g.beginPath(); g.moveTo(32, y); g.lineTo(0, y - 18); g.moveTo(32, y); g.lineTo(64, y - 18); g.stroke(); }
        g.globalCompositeOperation = 'destination-out'; g.strokeStyle = '#000'; g.lineWidth = 2.5; [[60, 1], [130, -1], [170, 1], [200, -1]].forEach(function (s) { g.beginPath(); g.moveTo(32 + s[1] * 3, s[0]); g.lineTo(32 + s[1] * 30, s[0] - 20); g.stroke(); });
        g.restore(); g.strokeStyle = '#d8d0c4'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 256); g.quadraticCurveTo(31, 120, 30, 2); g.stroke(); });
      var qg = new THREE.Group(); qg.position.set(-0.003, 0.03, 0); qg.rotation.set(-0.3, 0, -0.38); iw.add(qg);
      q(qg, new THREE.CylinderGeometry(0.0014, 0.0024, 0.25, 6), rMat(0xe8e0cc, { roughness: 0.5 }), 0, 0.125, 0); q(qg, new THREE.CylinderGeometry(0.0024, 0.0016, 0.03, 6), rMat(0x10101a, { roughness: 0.2 }), 0, 0.012, 0);
      var fgeo = new THREE.PlaneGeometry(0.05, 0.19, 1, 8), fpos = fgeo.attributes.position; for (k = 0; k < fpos.count; k++) fpos.setZ(k, -Math.pow(fpos.getX(k) / 0.025, 2) * 0.004 + Math.sin((fpos.getY(k) + 0.095) / 0.19 * Math.PI) * 0.006); fgeo.computeVertexNormals();
      quiet(q(qg, fgeo, new THREE.MeshStandardMaterial({ map: featherT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.9 }), 0, 0.155, 0, 0, 0.5, 0));
      var pipPos = { 1: [[0.5, 0.5]], 2: [[0.28, 0.28], [0.72, 0.72]], 3: [[0.26, 0.26], [0.5, 0.5], [0.74, 0.74]], 4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]], 5: [[0.26, 0.26], [0.74, 0.26], [0.5, 0.5], [0.26, 0.74], [0.74, 0.74]], 6: [[0.28, 0.24], [0.72, 0.24], [0.28, 0.5], [0.72, 0.5], [0.28, 0.76], [0.72, 0.76]] };
      var dieM = [1, 6, 2, 5, 3, 4].map(function (n) { return new THREE.MeshStandardMaterial({ roughness: 0.55, map: cpTex(64, 64, function (g, w, h) { var gr = g.createRadialGradient(28, 28, 4, 32, 32, 46); gr.addColorStop(0, '#efe6cc'); gr.addColorStop(1, '#c8b890'); g.fillStyle = gr; g.fillRect(0, 0, w, h);   // (bone dice, the pips drilled and inked)
        for (var i = 0; i < 30; i++) { g.fillStyle = 'rgba(120,90,50,0.15)'; g.fillRect(tr() * w, tr() * h, 1, 2); }
        pipPos[n].forEach(function (pp3) { g.fillStyle = n === 1 ? '#8a1a1a' : '#1a1410'; g.beginPath(); g.arc(pp3[0] * w, pp3[1] * h, n === 1 ? 9 : 5.5, 0, 6.28); g.fill(); g.fillStyle = 'rgba(255,255,255,0.25)'; g.beginPath(); g.arc(pp3[0] * w + 1, pp3[1] * h + 1.5, n === 1 ? 7 : 4, 0, Math.PI); g.fill(); }); }) }); });
      var dieG = new THREE.BoxGeometry(0.028, 0.028, 0.028, 3, 3, 3), dpz = dieG.attributes.position, dv = new THREE.Vector3(), dc = new THREE.Vector3();
      for (k = 0; k < dpz.count; k++) { dv.fromBufferAttribute(dpz, k); dc.set(Math.max(-0.0105, Math.min(0.0105, dv.x)), Math.max(-0.0105, Math.min(0.0105, dv.y)), Math.max(-0.0105, Math.min(0.0105, dv.z))); dv.sub(dc); if (dv.lengthSq() > 0) dv.setLength(0.0035); dpz.setXYZ(k, dc.x + dv.x, dc.y + dv.y, dc.z + dv.z); }
      dieG.computeVertexNormals();
      q(R, dieG, dieM, 0.1, TT + 0.014, 0.4, 0, 0.4, 0); q(R, dieG, dieM, 0.17, TT + 0.014, 0.33, Math.PI / 2, 1.1, 0);
      var cup = q(R, lbLathe([[0, 0], [0.034, 0], [0.036, 0.004], [0.036, 0.084], [0.039, 0.088], [0.039, 0.092], [0.033, 0.092], [0.032, 0.006], [0, 0.006]], 20), leatherM, 0.26, TT + 0.036, 0.52, 0, 0, Math.PI / 2);   // (the leather dice cup, tipped over)
      q(R, new THREE.TorusGeometry(0.0365, 0.002, 4, 20), cordM, 0.26 - 0.075, TT + 0.036, 0.52, 0, Math.PI / 2, 0);
      function suit(g, s, sx, sy, r, col) { g.fillStyle = col; g.beginPath();
        if (s === 0) { g.moveTo(sx, sy + r); g.bezierCurveTo(sx - r * 1.6, sy - r * 0.2, sx - r * 0.6, sy - r * 1.3, sx, sy - r * 0.4); g.bezierCurveTo(sx + r * 0.6, sy - r * 1.3, sx + r * 1.6, sy - r * 0.2, sx, sy + r); }
        else if (s === 1) { g.moveTo(sx, sy - r); g.lineTo(sx + r * 0.7, sy); g.lineTo(sx, sy + r); g.lineTo(sx - r * 0.7, sy); }
        else if (s === 2) { g.moveTo(sx, sy - r); g.bezierCurveTo(sx + r * 1.6, sy + r * 0.2, sx + r * 0.6, sy + r * 1.1, sx, sy + r * 0.35); g.bezierCurveTo(sx - r * 0.6, sy + r * 1.1, sx - r * 1.6, sy + r * 0.2, sx, sy - r); g.moveTo(sx, sy + r * 0.2); g.lineTo(sx + r * 0.35, sy + r * 1.1); g.lineTo(sx - r * 0.35, sy + r * 1.1); }
        else { [[0, -0.45], [-0.48, 0.15], [0.48, 0.15]].forEach(function (o) { g.moveTo(sx + o[0] * r + r * 0.42, sy + o[1] * r); g.arc(sx + o[0] * r, sy + o[1] * r, r * 0.42, 0, 6.28); }); g.moveTo(sx, sy); g.lineTo(sx + r * 0.3, sy + r * 1.05); g.lineTo(sx - r * 0.3, sy + r * 1.05); }
        g.closePath(); g.fill(); }
      function cardFace(rank, s, pips) { var col = s < 2 ? '#a8201e' : '#18141a'; return cpTex(96, 140, function (g, w, h) {   // (playing cards: old and yellowed, ranks and suits in the corners)
        g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, h); var ag = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 90); ag.addColorStop(0, 'rgba(150,120,70,0)'); ag.addColorStop(1, 'rgba(150,120,70,0.3)'); g.fillStyle = ag; g.fillRect(0, 0, w, h);
        g.strokeStyle = 'rgba(80,60,40,0.5)'; g.lineWidth = 1; g.strokeRect(5, 5, w - 10, h - 10);
        g.fillStyle = col; g.font = 'bold 16px serif'; g.textAlign = 'center'; g.fillText(rank, 13, 21); suit(g, s, 13, 32, 5, col);
        g.save(); g.translate(w, h); g.rotate(Math.PI); g.fillStyle = col; g.fillText(rank, 13, 21); suit(g, s, 13, 32, 5, col); g.restore();
        if (pips === 'A') suit(g, s, w / 2, h / 2, 22, col);
        else if (pips === 'K') { g.strokeStyle = col; g.strokeRect(22, 28, 52, 84); g.fillStyle = '#c89a3a'; g.beginPath(); g.moveTo(38, 46); g.lineTo(36, 34); g.lineTo(42, 40); g.lineTo(48, 31); g.lineTo(54, 40); g.lineTo(60, 34); g.lineTo(58, 46); g.closePath(); g.fill();
          g.fillStyle = '#e8c8a0'; g.beginPath(); g.arc(48, 56, 9, 0, 6.28); g.fill(); g.fillStyle = '#8a7a6a'; g.beginPath(); g.moveTo(40, 60); g.quadraticCurveTo(48, 76, 56, 60); g.fill();
          g.fillStyle = col; g.beginPath(); g.moveTo(36, 70); g.lineTo(60, 70); g.lineTo(68, 108); g.lineTo(28, 108); g.closePath(); g.fill(); g.fillStyle = '#c89a3a'; g.fillRect(46, 72, 4, 34); suit(g, s, 64, 40, 5, col); }
        else pips.forEach(function (pp4) { suit(g, s, pp4[0] * w, pp4[1] * h, 8, col); }); }); }
      var backT = cpTex(96, 140, function (g, w, h) { g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, h); g.fillStyle = '#6a1418'; g.fillRect(5, 5, w - 10, h - 10); g.save(); g.beginPath(); g.rect(8, 8, w - 16, h - 16); g.clip();
        g.strokeStyle = 'rgba(200,160,80,0.55)'; g.lineWidth = 1; for (var i = -h; i < w + h; i += 10) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.moveTo(i + h, 0); g.lineTo(i, h); g.stroke(); } g.restore();
        g.strokeStyle = '#c8a050'; g.lineWidth = 1.5; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#6a1418'; dia(g, w / 2, h / 2, 22, 30); g.fill(); g.stroke();
        g.fillStyle = '#c8a050'; g.beginPath(); g.arc(w / 2, h / 2, 11, 0, 6.28); g.fill(); g.fillStyle = '#6a1418'; g.beginPath(); g.arc(w / 2 + 5, h / 2 - 3, 9, 0, 6.28); g.fill(); });
      var edgeT = cpTex(16, 64, function (g, w, h) { g.fillStyle = '#e8dcc4'; g.fillRect(0, 0, w, h); for (y = 0; y < h; y += 3) { g.fillStyle = 'rgba(90,60,30,0.35)'; g.fillRect(0, y, w, 1); } });
      var cEdge = rMat(0xe8dcc4, { roughness: 0.8 }), backM = new THREE.MeshStandardMaterial({ map: backT, roughness: 0.7 }), cardG = new THREE.BoxGeometry(0.06, 0.0012, 0.088);
      [['A', 2, 'A'], ['7', 0, [[0.3, 0.22], [0.7, 0.22], [0.5, 0.36], [0.3, 0.5], [0.7, 0.5], [0.3, 0.78], [0.7, 0.78]]], ['K', 1, 'K'], ['3', 3, [[0.5, 0.22], [0.5, 0.5], [0.5, 0.78]]], ['9', 2, [[0.3, 0.2], [0.7, 0.2], [0.3, 0.4], [0.7, 0.4], [0.5, 0.5], [0.3, 0.6], [0.7, 0.6], [0.3, 0.8], [0.7, 0.8]]]].forEach(function (c, i) {
        var a = (i - 2) * 0.22 + 0.3; quiet(q(R, cardG, [cEdge, cEdge, new THREE.MeshStandardMaterial({ map: cardFace(c[0], c[1], c[2]), roughness: 0.7 }), backM, cEdge, cEdge], -0.62 - Math.sin(a) * 0.04, TT + 0.0008 + i * 0.0012, 0.36 - Math.cos(a) * 0.04, 0, a, 0)); });
      var deckEdge = new THREE.MeshStandardMaterial({ map: edgeT, roughness: 0.8 });
      q(R, new THREE.BoxGeometry(0.06, 0.014, 0.088), [deckEdge, deckEdge, backM, backM, deckEdge, deckEdge], -0.4, TT + 0.007, 0.25, 0, 0.3, 0); quiet(q(R, cardG, [cEdge, cEdge, backM, backM, cEdge, cEdge], -0.396, TT + 0.0146, 0.248, 0, 0.42, 0));
      var cp = grp(-1.1, TT + 0.006, 0.32, 0.5);   // (a brass pocket compass, its lid open on a mirror, the needle swinging over an engraved rose)
      q(cp, lbLathe([[0, 0], [0.038, 0], [0.042, 0.003], [0.043, 0.008], [0.041, 0.013], [0.037, 0.014], [0.036, 0.009], [0, 0.009]], 32), brassM, 0, 0, 0);
      var dialT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#ece0c2'; g.fillRect(0, 0, w, h); var c = 64, i; g.strokeStyle = '#3a2a18'; g.lineWidth = 1.5; g.beginPath(); g.arc(c, c, 60, 0, 6.28); g.stroke(); g.beginPath(); g.arc(c, c, 50, 0, 6.28); g.stroke();
        for (i = 0; i < 64; i++) { var a = i / 64 * 6.28, l = i % 8 ? (i % 2 ? 4 : 6) : 10; g.lineWidth = i % 8 ? 0.8 : 1.6; g.beginPath(); g.moveTo(c + Math.cos(a) * 60, c + Math.sin(a) * 60); g.lineTo(c + Math.cos(a) * (60 - l), c + Math.sin(a) * (60 - l)); g.stroke(); }
        [1, 3, 5, 7, 0, 2, 4, 6].forEach(function (t) { var a2 = t / 8 * 6.28 - Math.PI / 2, L = t % 2 ? 26 : 46, wd = t % 2 ? 0.3 : 0.22; [[-1, '#3a2a18'], [1, '#d8c8a0']].forEach(function (sd) { g.fillStyle = (t === 0 && sd[0] < 0) ? '#a02020' : sd[1]; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.cos(a2) * L, c + Math.sin(a2) * L); g.lineTo(c + Math.cos(a2 + sd[0] * wd) * 10, c + Math.sin(a2 + sd[0] * wd) * 10); g.closePath(); g.fill(); }); });
        g.fillStyle = '#a02020'; g.beginPath(); g.moveTo(c, 2); g.lineTo(c + 5, 10); g.lineTo(c - 5, 10); g.closePath(); g.fill(); });
      q(cp, new THREE.CircleGeometry(0.036, 32), new THREE.MeshStandardMaterial({ map: dialT, roughness: 0.6 }), 0, 0.0092, 0, -Math.PI / 2, 0, 0);
      var nd = new THREE.Group(); nd.position.set(0, 0.0112, 0); nd.rotation.y = 0.9; cp.add(nd);
      q(nd, new THREE.ConeGeometry(0.0035, 0.026, 4), rMat(0xb02020, { metalness: 0.3, roughness: 0.4 }), 0, 0, -0.013, -Math.PI / 2, 0, 0).scale.set(1, 1, 0.3); q(nd, new THREE.ConeGeometry(0.0035, 0.026, 4), rMat(0xc8ccd2, { metalness: 0.8, roughness: 0.3, envMap: rubyEnv }), 0, 0, 0.013, Math.PI / 2, 0, 0).scale.set(1, 1, 0.3);
      q(nd, new THREE.SphereGeometry(0.003, 8, 6), brassM, 0, 0.0005, 0);
      quiet(q(cp, new THREE.CircleGeometry(0.037, 32), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.02, metalness: 0.5, envMap: rubyEnv, depthWrite: false }), 0, 0.0128, 0, -Math.PI / 2, 0, 0));
      q(cp, new THREE.TorusGeometry(0.0385, 0.0018, 6, 32), brassM, 0, 0.0132, 0, Math.PI / 2, 0, 0); q(cp, new THREE.CylinderGeometry(0.003, 0.003, 0.016, 8), brassM, -0.043, 0.012, 0, Math.PI / 2, 0, 0);
      q(cp, new THREE.CylinderGeometry(0.004, 0.004, 0.008, 8), brassM, 0, 0.007, -0.045, Math.PI / 2, 0, 0); q(cp, new THREE.TorusGeometry(0.009, 0.0018, 6, 16), brassM, 0, 0.004, -0.058, Math.PI / 2, 0, 0);
      var lidT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#a8843e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(60,40,10,0.6)'; g.lineWidth = 1.2; for (var r = 20; r < 64; r += 8) { g.beginPath(); g.arc(64, 64, r, 0, 6.28); g.stroke(); }
        g.lineWidth = 2; [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(64 + s * 4, 46); g.quadraticCurveTo(64 + s * 16, 62, 64 + s * 6, 84); g.quadraticCurveTo(64 + s * 4, 64, 64 + s * 4, 46); g.stroke(); });
        for (var i = 0; i < 60; i++) { g.strokeStyle = 'rgba(255,240,200,0.15)'; g.lineWidth = 0.6; var sx = tr() * w, sy = tr() * h; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (tr() - 0.5) * 20, sy + (tr() - 0.5) * 20); g.stroke(); } });
      var ld = new THREE.Group(); ld.position.set(-0.043, 0.013, 0); ld.rotation.z = 1.75; cp.add(ld);
      q(ld, new THREE.CylinderGeometry(0.042, 0.042, 0.005, 32), brassM, 0.043, 0.0025, 0); q(ld, new THREE.CircleGeometry(0.04, 32), new THREE.MeshStandardMaterial({ map: lidT, metalness: 0.75, roughness: 0.35, envMap: rubyEnv }), 0.043, 0.0051, 0, -Math.PI / 2, 0, 0);
      q(ld, new THREE.CircleGeometry(0.038, 32), rMat(0xd8dce0, { metalness: 1, roughness: 0.08, envMap: rubyEnv }), 0.043, -0.0001, 0, Math.PI / 2, 0, 0);
      var lb = grp(-2.12, TT, 0.42, 0.2), boxWood = new THREE.MeshStandardMaterial({ map: grainTex(false, '#3a2616'), roughness: 0.8 });   // (an iron-bound strongbox, padlocked, a sealed letter left on its lid)
      q(lb, new THREE.BoxGeometry(0.17, 0.075, 0.115), boxWood, 0, 0.0375, 0); q(lb, new THREE.BoxGeometry(0.174, 0.026, 0.119), boxWood, 0, 0.088, 0); q(lb, new THREE.BoxGeometry(0.172, 0.003, 0.117), rMat(0x0a0604), 0, 0.0755, 0);
      [-0.05, 0.05].forEach(function (sx) { q(lb, new THREE.BoxGeometry(0.014, 0.078, 0.119), ironM, sx, 0.038, 0); q(lb, new THREE.BoxGeometry(0.014, 0.028, 0.123), ironM, sx, 0.088, 0);
        [0.02, 0.055].forEach(function (ry) { [-1, 1].forEach(function (s) { q(lb, new THREE.SphereGeometry(0.003, 6, 4), ironM, sx, ry, s * 0.0605); }); }); [-0.03, 0.03].forEach(function (rz) { q(lb, new THREE.SphereGeometry(0.003, 6, 4), ironM, sx, 0.102, rz); }); });
      [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { [0.011, 0.09].forEach(function (cy) { q(lb, new THREE.BoxGeometry(0.022, 0.022, 0.022), ironM, s * 0.078, cy, t * 0.05); }); });
        q(lb, new THREE.TorusGeometry(0.014, 0.0022, 6, 12, Math.PI), ironM, s * 0.09, 0.05, 0, 0, Math.PI / 2, Math.PI); [-1, 1].forEach(function (t) { q(lb, new THREE.SphereGeometry(0.0035, 6, 4), ironM, s * 0.087, 0.05, t * 0.014); }); });
      q(lb, new THREE.BoxGeometry(0.022, 0.034, 0.004), ironM, 0, 0.078, 0.0615); q(lb, new THREE.TorusGeometry(0.005, 0.0015, 6, 10), ironM, 0, 0.064, 0.064, 0, Math.PI / 2, 0);
      var pl = new THREE.Group(); pl.position.set(0, 0.046, 0.068); lb.add(pl);
      q(pl, new THREE.BoxGeometry(0.026, 0.016, 0.01), darkBrass, 0, 0, 0); q(pl, new THREE.CylinderGeometry(0.013, 0.013, 0.01, 16), darkBrass, 0, -0.008, 0, Math.PI / 2, 0, 0); q(pl, new THREE.TorusGeometry(0.0085, 0.0022, 6, 12, Math.PI), ironM, 0, 0.008, 0);
      q(pl, new THREE.CircleGeometry(0.002, 8), rMat(0x050505), 0, -0.006, 0.0052); q(pl, new THREE.BoxGeometry(0.0015, 0.004, 0.001), rMat(0x050505), 0, -0.009, 0.0052);
      var letterT = cpTex(128, 80, function (g, w, h) { parch(g, w, h, '#e4d4aa', 6); g.strokeStyle = 'rgba(110,80,40,0.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * 0.55); g.lineTo(w, 0); g.moveTo(0, h); g.lineTo(w * 0.42, h * 0.5); g.moveTo(w, h); g.lineTo(w * 0.58, h * 0.5); g.stroke(); g.strokeStyle = 'rgba(80,60,40,0.6)'; g.strokeRect(1, 1, w - 2, h - 2); });
      var sealT = cpTex(32, 32, function (g, w, h) { g.fillStyle = '#7a1014'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b02a2a'; g.lineWidth = 1.5; g.beginPath(); g.arc(16, 16, 11, 0, 6.28); g.stroke(); g.fillStyle = '#4a0808'; [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(16 + s * 2, 8); g.quadraticCurveTo(16 + s * 7, 15, 16 + s * 3, 24); g.lineTo(16 + s * 1.5, 12); g.closePath(); g.fill(); }); });
      var paperM = rMat(0xe0d0a8, { roughness: 1 }), sealM = rMat(0x7a1014, { roughness: 0.35 });
      q(lb, new THREE.BoxGeometry(0.15, 0.003, 0.095), [paperM, paperM, new THREE.MeshStandardMaterial({ map: letterT, roughness: 1 }), paperM, paperM, paperM], 0.005, 0.1035, 0.004, 0, 0.25, 0);
      q(lb, new THREE.CylinderGeometry(0.0145, 0.016, 0.004, 14), sealM, 0.006, 0.107, 0.004); q(lb, new THREE.CylinderGeometry(0.008, 0.009, 0.003, 10), sealM, 0.017, 0.1065, 0.012);
      q(lb, new THREE.CircleGeometry(0.012, 16), new THREE.MeshStandardMaterial({ map: sealT, roughness: 0.35 }), 0.006, 0.1091, 0.004, -Math.PI / 2, 0, 0.6);
    })();
    (function () {   // (the four chairs round the table: rough ladder-back chairs of dark oak, plank seats worn pale in the middle, turned legs
      // braced with stretchers, backs leaning back with slats and an arched top rail cut with a diamond, knobbed finials, iron nails;
      // pulled out at odd angles, a cloak thrown over one and a cushion on another)
      var sd = 909; function cr() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
      function q(par, geo, m, px, py, pz, rx, ry, rz) { return cpPart(geo, m, px, py, pz, rx, ry, rz, par); }
      function grain(base, worn) { return cpTex(128, 256, function (g, w, h) { g.fillStyle = base; g.fillRect(0, 0, w, h); var i;
        if (worn) { var wg = g.createRadialGradient(w / 2, h * 0.45, 6, w / 2, h * 0.45, 70); wg.addColorStop(0, 'rgba(170,130,90,0.35)'); wg.addColorStop(1, 'rgba(170,130,90,0)'); g.fillStyle = wg; g.fillRect(0, 0, w, h); }
        for (i = 0; i < 34; i++) { var o = (i * 37) % 128; g.strokeStyle = 'rgba(25,14,6,' + (0.15 + (i % 5) * 0.07).toFixed(2) + ')'; g.lineWidth = 0.6 + (i % 3) * 0.5; g.beginPath(); for (var t = 0; t <= 256; t += 8) { var d = o + Math.sin(t / 256 * Math.PI * 2 + i) * 3; if (t) g.lineTo(d, t); else g.moveTo(d, t); } g.stroke(); }
        if (worn) for (i = 0; i < 40; i++) { var sx = cr() * w, sy = cr() * h; g.strokeStyle = 'rgba(200,170,130,0.25)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + (cr() - 0.5) * 20, sy + (cr() - 0.5) * 30); g.stroke(); }
        g.fillStyle = 'rgba(15,8,4,0.7)'; g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h); }); }
      var seatM = new THREE.MeshStandardMaterial({ map: grain('#4e3620', true), roughness: 0.75 }), woodM = new THREE.MeshStandardMaterial({ map: grain('#3e2a18', false), roughness: 0.8 }), nailM = rMat(0x1c1a18, { metalness: 0.6, roughness: 0.5 });
      var fLeg = lbLathe([[0.017, 0], [0.022, 0.015], [0.016, 0.05], [0.02, 0.14], [0.024, 0.19], [0.017, 0.23], [0.021, 0.33], [0.019, 0.42], [0.017, 0.44]], 10);
      var rLeg = lbLathe([[0.017, 0], [0.022, 0.015], [0.016, 0.05], [0.02, 0.19], [0.016, 0.3], [0.02, 0.44], [0.018, 0.6], [0.021, 0.7], [0.016, 0.86], [0.019, 0.93], [0.013, 0.96], [0, 0.965]], 10);
      var LEAN = 0.1, slatZ = function (y) { return -0.15 - Math.sin(LEAN) * y; };
      var rail = new THREE.Shape(); rail.moveTo(-0.19, 0); rail.lineTo(0.19, 0); rail.lineTo(0.19, 0.055); rail.quadraticCurveTo(0, 0.11, -0.19, 0.055); rail.lineTo(-0.19, 0);
      var hole = new THREE.Path(); hole.moveTo(0, 0.025); hole.lineTo(0.016, 0.05); hole.lineTo(0, 0.075); hole.lineTo(-0.016, 0.05); hole.lineTo(0, 0.025); rail.holes.push(hole);
      var railG = new THREE.ExtrudeGeometry(rail, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1, curveSegments: 10 }); railG.translate(0, 0, -0.01);
      function chair(cx, cz, ry, extra) { var c = new THREE.Group(); c.position.set(cx, 0, cz); c.rotation.y = ry; R.add(c);
        [-1, 1].forEach(function (s) { q(c, fLeg, woodM, s * 0.18, 0, 0.17, -0.04, 0, s * 0.04); q(c, rLeg, woodM, s * 0.18, 0, -0.15, -LEAN, 0, s * 0.03);   // (legs and back posts, splayed a little)
          q(c, new THREE.SphereGeometry(0.022, 10, 8), woodM, s * 0.18 - s * 0.03 * 0.97, 0.97, slatZ(0.97)); q(c, new THREE.SphereGeometry(0.013, 8, 6), woodM, s * 0.18 - s * 0.03, 0.995, slatZ(1.0));   // (finials)
          q(c, new THREE.CylinderGeometry(0.011, 0.011, 0.32, 8), woodM, s * 0.183, 0.14, 0.01, Math.PI / 2, 0, 0); });   // (side stretchers)
        q(c, new THREE.CylinderGeometry(0.011, 0.011, 0.37, 8), woodM, 0, 0.21, 0.172, 0, 0, Math.PI / 2); q(c, new THREE.CylinderGeometry(0.011, 0.011, 0.37, 8), woodM, 0, 0.21, -0.172, 0, 0, Math.PI / 2); q(c, new THREE.CylinderGeometry(0.01, 0.01, 0.37, 8), woodM, 0, 0.14, 0.01, 0, 0, Math.PI / 2);
        for (var b = 0; b < 3; b++) q(c, new THREE.BoxGeometry(0.143, 0.035, 0.43), seatM, -0.148 + b * 0.148, 0.4575 + (b === 1 ? 0.002 : 0), 0.005, 0, 0, (b - 1) * 0.01);   // (the seat: three planks)
        q(c, new THREE.CylinderGeometry(0.0175, 0.0175, 0.44, 8), seatM, 0, 0.4575, 0.22, 0, 0, Math.PI / 2);   // (its rounded front edge)
        [[0, 0.42, 0.18, 0.38, 0.04, 0.02], [0, 0.42, -0.17, 0.38, 0.04, 0.02], [0.18, 0.42, 0, 0.02, 0.04, 0.32], [-0.18, 0.42, 0, 0.02, 0.04, 0.32]].forEach(function (a) { q(c, new THREE.BoxGeometry(a[3], a[4], a[5]), woodM, a[0], a[1], a[2]); });   // (the apron under it)
        [-0.1, 0, 0.1].forEach(function (nx) { [0.16, -0.16].forEach(function (nz) { q(c, new THREE.CylinderGeometry(0.005, 0.005, 0.003, 6), nailM, nx + (nx < 0 ? -0.02 : nx > 0 ? 0.02 : 0), 0.4765, nz); }); });   // (nails in the seat)
        [0.6, 0.72].forEach(function (sy) { q(c, new THREE.BoxGeometry(0.34, 0.05, 0.018), woodM, 0, sy, slatZ(sy), -LEAN, 0, 0); [-1, 1].forEach(function (s) { q(c, new THREE.SphereGeometry(0.0045, 6, 4), nailM, s * 0.16, sy, slatZ(sy) + 0.01); }); });   // (the slats)
        q(c, railG, woodM, 0, 0.83, slatZ(0.86), -LEAN, 0, 0);   // (the arched top rail, a diamond cut through it)
        if (extra === 'cloak') {   // (a dark wool cloak thrown over the back, hanging down front and back in folds)
          var clT = cpTex(64, 128, function (g, w, h) { g.fillStyle = '#3a4a3c'; g.fillRect(0, 0, w, h); for (var i = 0; i < 600; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,0.2)' : 'rgba(120,140,120,0.08)'; g.fillRect(cr() * w, cr() * h, 1, 2); } g.fillStyle = '#5a1a1c'; g.fillRect(0, h - 6, w, 4); });
          var cg = new THREE.PlaneGeometry(0.44, 1, 12, 30), cp2 = cg.attributes.position, rz0 = slatZ(0.92);
          for (var v = 0; v < cp2.count; v++) { var u = cp2.getX(v), t = cp2.getY(v) + 0.5, fold = (Math.sin(u * 30 + t * 2) * 0.022 + Math.sin(u * 13 + 1) * 0.01) * Math.min(1, Math.abs(t - 0.46) * 4), py, pz;
            if (t < 0.42) { py = 0.93 - (0.42 - t) * 0.75 * (1 + Math.abs(u) * 0.3); pz = rz0 + 0.03 + (0.42 - t) * 0.12 + fold; }
            else if (t < 0.5) { var a = (t - 0.42) / 0.08 * Math.PI; py = 0.93 + Math.sin(a) * 0.03; pz = rz0 + Math.cos(a) * 0.03 + fold * 0.3; }
            else { py = 0.93 - (t - 0.5) * 0.7; pz = rz0 - 0.03 - (t - 0.5) * 0.1 + fold; }
            cp2.setXYZ(v, u * (1 + (Math.abs(py - 0.93)) * 0.4), py, pz); }
          q(c, new THREE.CylinderGeometry(0.014, 0.014, 0.006, 10), rMat(0x9a7a3a, { metalness: 0.8, roughness: 0.35 }), -0.08, 0.86, rz0 + 0.075, Math.PI / 2 - 0.3, 0, 0);   // (a brass clasp)
          cg.computeVertexNormals(); q(c, cg, new THREE.MeshStandardMaterial({ map: clT, roughness: 1, side: THREE.DoubleSide }), 0, 0, 0); }
        if (extra === 'cushion') { var cu = q(c, new THREE.SphereGeometry(0.2, 16, 10), rMat(0x5a1c22, { roughness: 1 }), 0, 0.49, 0.01); cu.scale.set(0.95, 0.15, 0.95);   // (a squashed red cushion, buttoned in the middle)
          q(c, new THREE.SphereGeometry(0.01, 8, 6), rMat(0x2a0a0c), 0, 0.519, 0.01); [[0.18, 0.18], [-0.18, 0.18]].forEach(function (tt) { q(c, new THREE.CylinderGeometry(0.004, 0.004, 0.1, 5), rMat(0x8a6a3a), tt[0], 0.46, tt[1], 0.3, 0, 0); }); }
      }
      chair(TX - 0.5, TZ - 0.78, 0.12, 'cloak'); chair(TX + 0.5, TZ - 0.72, -0.08, ''); chair(TX - 0.5, TZ + 0.8, Math.PI - 0.15, 'cushion'); chair(TX + 0.5, TZ + 0.75, Math.PI + 0.06, '');
    })();
    for (var tsx = -1.2; tsx <= 1.21; tsx += 0.6) hideSolids.push([TX + tsx, TZ, 0.6]);
    // (the fireplace and its fire: see the right wall, in great detail, further down)
    var FX = W - 0.35;
    hideSolids.push([FX, -0.8, 0.5], [FX, -0.3, 0.5], [FX, 0.2, 0.5]);
    // (the weapon rack, swords, axe, bow and shield on the left wall: see the left wall, in great detail, further down)
    var RX = -W + 0.15;
    hideSolids.push([RX + 0.3, -1.2, 0.35], [RX + 0.3, 0.25, 0.35]);
    // (crates, casks and sacks in the corners, and cobwebs up in them)
    hideSolids.push([W - 0.5, D - 0.6, 0.45], [W - 1.2, -D + 0.45, 0.41]);   // (the crates: see the back-right corner, in great detail, further down)
    hideSolids.push([W - 0.55, D - 1.5, 0.4], [W - 0.55, D - 2.2, 0.4], [-W + 1.3, -D + 0.5, 0.4]);   // (the casks: see the back-left corner, in great detail, further down)
    R.traverse(function (o) { if (o.isMesh) o.receiveShadow = true; });
  })(hideRoom);
  // ---- the Errand Board: stand before it and press Interact ----
  var hdBoardOpen = false, hdErrands = [];
  var hdBtn = document.createElement('button'); hdBtn.type = 'button'; hdBtn.className = 'sleep-btn ship-btn'; hdBtn.innerHTML = '📜 Errand Board <kbd>E</kbd>'; canvas.parentNode.appendChild(hdBtn);
  var hdBox = document.createElement('div'); hdBox.className = 'inventory ship mailbox hd-board'; hdBox.hidden = true;
  hdBox.innerHTML = '<div class="inv-head"><b>📜 Errand Board</b><button type="button" class="inv-close" aria-label="Close the Errand Board">✕</button></div><div class="mb-body"></div>';
  canvas.parentNode.appendChild(hdBox);
  function renderBoard() {
    var b = hdBox.querySelector('.mb-body'); b.innerHTML = '';
    var intro = document.createElement('p'); intro.className = 'ship-hint'; intro.textContent = 'The Hollow Fang takes the jobs no one else will. Take an errand from the board, see it done, and the guild will see you rewarded.'; b.appendChild(intro);
    if (!hdErrands.length) { var em = document.createElement('div'); em.className = 'mb-empty'; em.innerHTML = '<b>🗡️</b>'; var p1 = document.createElement('p'); p1.textContent = 'No errands are posted right now.'; var p2 = document.createElement('p'); p2.textContent = 'Check back soon, adventurer.'; em.appendChild(p1); em.appendChild(p2); b.appendChild(em); }
    else { var list = document.createElement('div'); list.className = 'mb-list'; hdErrands.forEach(function (e) { var it = document.createElement('div'); it.className = 'mb-item'; it.textContent = e.title || ''; list.appendChild(it); }); b.appendChild(list); }
    var row = document.createElement('div'); row.className = 'mb-row'; var cl = document.createElement('button'); cl.type = 'button'; cl.className = 'mb-quiet'; cl.textContent = 'Close'; cl.addEventListener('click', function () { closeBoard(); focusGame(); }); row.appendChild(cl); b.appendChild(row);
  }
  function openBoard() { if (hdBoardOpen) return; toggleBag(false); hdBoardOpen = true; menuOpenedAt = Date.now(); walkTarget = null; hdBox.hidden = false; renderBoard(); }
  function closeBoard() { hdBoardOpen = false; hdBox.hidden = true; }
  hdBox.querySelector('.inv-close').addEventListener('click', function () { closeBoard(); focusGame(); });
  hdBtn.addEventListener('click', function () { openBoard(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && hdBoardOpen) { e.stopImmediatePropagation(); e.preventDefault(); closeBoard(); } }, true);
  function atBoard() { return inHide && Math.abs(player.position.x - HDI_X - HD_BOARD[0]) < 1.1 && player.position.z - HDI_Z < HD_BOARD[1] + 1.4; }
  window.everdawnGuild = { errands: function () { return hdErrands; }, post: function (e) { hdErrands.push(e); if (hdBoardOpen) renderBoard(); } };   // (for the guild errands to come)
  // ---- going down and coming back up ----
  function hideDoorUse(goIn) {
    if (doorBusy) return;
    doorBusy = true; doorArmed = false; walkTarget = null; doorSound(); fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (goIn) {
        indoors = true; inShop = inClinic = inBarn = inCarp = inCoop = inFbarn = inCloth = inLab = false; inHide = true;
        hideScene.add(player); player.position.set(HDI_X, 0, HDI_Z + HDI_EXIT_Z - 0.9); facing = Math.PI;
        outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw }; cam.dist = 8; cam.pitch = 0.85; cam.yaw = 0;
      } else {
        indoors = false; inHide = false; closeBoard(); scene.add(player);
        var o = hideFront(1.6); player.position.set(o.x, 0, o.z); facing = HIDE_TURN;
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
      }
      cam.target.set(player.position.x, 0.8, player.position.z);
      fadeBox.style.opacity = 0;
      setTimeout(function () { doorBusy = false; }, 380);
    }, 380);
  }
  DOOR_NAMES.hide = 'The Hollow Fang';
  var hdLook = new THREE.Vector3();
  updateCarpenter = (function (base) { return function (t, night) {
    base.apply(this, arguments);
    if (inHide && player.parent !== hideScene) { inHide = false; closeBoard(); }   // (carried home or teleported away from inside)
    if (inHide) {
      hdLook.set(camera.position.x - HDI_X, 0, camera.position.z - HDI_Z); hdWalls.forEach(function (W) { W.g.visible = hdLook.dot(W.n) < W.d - 0.6; });
      var fl = Math.sin(t * 11) * 0.5 + Math.sin(t * 27) * 0.3; hdFire.intensity = 1.05 + fl * 0.18; hdCandles.forEach(function (l, i) { l.intensity = 0.42 + Math.sin(t * 13 + i * 2) * 0.05; });
      hdFlames.forEach(function (m, i) { m.emissiveIntensity = 2.0 + Math.sin(t * 9 + i) * 0.3; });
      hdHalos.forEach(function (h, i) { h.material.opacity = (h.userData.o || (h.userData.o = h.material.opacity)) * (0.88 + Math.sin(t * 11 + i * 1.7) * 0.08 + Math.sin(t * 29 + i) * 0.04); });   // (the candles' halos flicker)
    } else if (hideWisp) { var hr = state.minutes / 60, nt = hr < 5.5 || hr > 20 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr > 18.5 ? (hr - 18.5) / 1.5 : 0; hideWisp.material.opacity = nt * (0.55 + Math.sin(t * 2.2) * 0.2); }
    if (hdBoardOpen && !atBoard()) closeBoard();
    var show = atBoard() && !hdBoardOpen; if (hdBtn.classList.contains('show') !== show) hdBtn.classList.toggle('show', show);
  }; })(updateCarpenter);
  updateDoors = (function (base) { return function () {
    var px = player.position.x, pz = player.position.z;
    if (inHide) {                                                      // (inside: walking back up the stairs takes her out)
      doorWasIn = true; doorNear = doorHinted = null;
      if (!doorArmed) { if (dist(px, pz, HDI_X, HDI_Z + HDI_EXIT_Z) > 0.85) doorArmed = true; return; }
      if (dist(px, pz, HDI_X, HDI_Z + HDI_EXIT_Z) < 0.5) hideDoorUse(false);
      return;
    }
    base.apply(this, arguments);
    if (!indoors && dist(px, pz, hideDoor.x, hideDoor.z) < DOOR_REACH && !doorNear) doorNear = doorHinted = 'hide';   // (outside: by the cellar door)
  }; })(updateDoors);
  interact = (function (base) { return function () {
    if (hdBoardOpen) { if (!menuJustOpened()) closeBoard(); return; }
    if (atBoard()) { openBoard(); return; }
    if (!flying && !indoors && doorNear === 'hide' && !doorBusy && !binOpen && !shopOpen && !barnShopOpen) { doorNear = null; walkTarget = null; hideDoorUse(true); return; }
    return base.apply(this, arguments);
  }; })(interact);

  // ===== The Hollow Fang, in detail =====
  var hfRune = null, hfRuneGlow = null, hfCrow = null, hfSteam = [], hfEmbers = null, hfCauldron = null;
  // ---- outside: worn flagstones down to the door, an open padlock hanging on a chain, a rune on the lintel that glows after
  // dark, stones poking up through the turf, wildflowers, moss hanging from the dead tree, a crow on its branch, a rope knotted
  // round its trunk, a cold campfire ring, a half-buried crate under ivy, fallen leaves, and a cobweb on the lantern ----
  (function (G) {
    function P(geo, m, x, y, z, rx, ry, rz, par) { return cpPart(geo, m, x, y, z, rx, ry, rz, par || G); }
    var stoneM = [0x6e6a62, 0x5a5650, 0x7a746a, 0x625e58].map(function (c) { return rMat(c, { roughness: 0.95 }); });
    var mossM = rMat(0x4a7a34, { roughness: 1 }), rust = rMat(0x5a3a24, { metalness: 0.55, roughness: 0.7 }), bark = rMat(0x3a3028, { roughness: 1 });
    var CD = null; G.children.forEach(function (c) { if (c.isGroup && Math.abs(c.position.z - 1.38) < 0.01) CD = c; });
    [[0.05, 1.95, 0.42, 0.3], [-0.25, 2.35, 0.36, 1.2], [0.2, 2.7, 0.4, 2.1], [-0.1, 3.1, 0.3, 0.6]].forEach(function (f, k) {   // (flagstones, sunk in the grass, moss in the cracks)
      var fs = P(new THREE.CylinderGeometry(f[2], f[2] * 1.05, 0.06, 7), stoneM[k % 4], f[0], 0.02, f[1], 0, f[3], 0); fs.scale.z = 0.75;
      for (var m = 0; m < 4; m++) { var ma = m * 1.6 + k; var mm = P(new THREE.SphereGeometry(0.05, 6, 4), mossM, f[0] + Math.cos(ma) * f[2] * 0.95, 0.03, f[1] + Math.sin(ma) * f[2] * 0.7); mm.scale.set(1.5, 0.3, 1); }
    });
    if (CD) {
      for (var cl = 0; cl < 4; cl++) P(new THREE.TorusGeometry(0.018, 0.005, 5, 10), rust, 0.1, 0.56 - cl * 0.035, 0.085, 0, cl % 2 ? Math.PI / 2 : 0, 0, CD);   // (a chain through the ring...)
      P(new THREE.BoxGeometry(0.07, 0.06, 0.03), rust, 0.1, 0.39, 0.09, 0, 0, 0.25, CD); P(new THREE.TorusGeometry(0.024, 0.006, 6, 12, Math.PI), rust, 0.1, 0.43, 0.09, 0, 0, 0.6, CD);   // (...and an old padlock, hanging open)
      P(new THREE.CylinderGeometry(0.005, 0.005, 0.01, 6), rMat(0x0a0806), 0.1, 0.385, 0.106, Math.PI / 2, 0, 0, CD);
      [-0.72, 0.72].forEach(function (hx) { [0.2, 0.9].forEach(function (hy) { P(new THREE.BoxGeometry(0.14, 0.05, 0.02), rust, hx * 0.92, hy, 0.06, 0, 0, 0, CD); P(new THREE.CylinderGeometry(0.018, 0.018, 0.07, 8), rust, hx * 0.84, hy, 0.06, 0, 0, 0, CD); }); });   // (hinge straps)
      function crestShapes(g, c, r, carve) {                              // (the crest: a ring of runes round a crescent moon pierced by a long fang)
        g.save(); g.translate(c, c);
        g.lineWidth = r * 0.05; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.stroke(); g.lineWidth = r * 0.03; g.beginPath(); g.arc(0, 0, r * 0.78, 0, Math.PI * 2); g.stroke();
        for (var k = 0; k < 16; k++) { g.save(); g.rotate(k / 16 * Math.PI * 2); g.translate(0, -r * 0.89); g.lineWidth = r * 0.022; g.beginPath();   // (sixteen runes between the rings)
          if (k % 4 === 0) { g.moveTo(-r * 0.04, r * 0.05); g.lineTo(0, -r * 0.05); g.lineTo(r * 0.04, r * 0.05); g.closePath(); g.fill(); }
          else if (k % 4 === 2) { g.arc(0, 0, r * 0.035, 0, Math.PI * 2); g.fill(); }
          else { g.moveTo(0, -r * 0.05); g.lineTo(0, r * 0.05); g.moveTo(-r * 0.03, -r * 0.01); g.lineTo(r * 0.03, r * 0.03); g.stroke(); }
          g.restore(); }
        g.beginPath(); g.arc(-r * 0.06, 0, r * 0.56, Math.PI * 0.32, Math.PI * 1.68); g.arc(r * 0.16, -r * 0.02, r * 0.45, Math.PI * 1.56, Math.PI * 0.44, true); g.closePath(); g.fill();   // (the crescent)
        g.beginPath(); g.moveTo(r * 0.14, -r * 0.7); g.bezierCurveTo(r * 0.36, -r * 0.3, r * 0.3, r * 0.3, r * 0.06, r * 0.74); g.bezierCurveTo(r * 0.16, r * 0.25, r * 0.2, -r * 0.25, r * 0.08, -r * 0.62); g.closePath(); g.fill();   // (the fang)
        if (!carve) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.moveTo(r * 0.15, -r * 0.6); g.bezierCurveTo(r * 0.26, -r * 0.3, r * 0.24, r * 0.1, r * 0.12, r * 0.4); g.lineTo(r * 0.14, -r * 0.6); g.fill(); }   // (a bright edge on the fang)
        [[-r * 0.32, -r * 0.42, 0.05], [-r * 0.42, r * 0.2, 0.035], [r * 0.4, r * 0.42, 0.04]].forEach(function (st) { g.beginPath(); for (var q = 0; q < 8; q++) { var rr = q % 2 ? r * st[2] * 0.4 : r * st[2], aa = q * Math.PI / 4; g.lineTo(st[0] + Math.cos(aa) * rr, st[1] + Math.sin(aa) * rr); } g.closePath(); g.fill(); });   // (three little stars)
        g.restore();
      }
      var carveT = cpTex(256, 256, function (g, w, h) {                  // (the stone face, the crest carved into it)
        var bg = g.createRadialGradient(w * 0.4, h * 0.35, 10, w / 2, h / 2, w * 0.6); bg.addColorStop(0, '#9a948a'); bg.addColorStop(1, '#5e5850'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
        for (var k = 0; k < 500; k++) { g.fillStyle = k % 2 ? 'rgba(40,36,30,0.25)' : 'rgba(220,214,200,0.18)'; g.fillRect((k * 37) % w, (k * 61) % h, 2, 2); }
        g.translate(2, 2); g.fillStyle = g.strokeStyle = 'rgba(255,250,235,0.35)'; crestShapes(g, 126, 110, true); g.translate(-4, -4); g.fillStyle = g.strokeStyle = 'rgba(15,12,10,0.85)'; crestShapes(g, 128, 110, true); });
      var runeT = cpTex(256, 256, function (g, w, h) {                   // (the glowing inlay set into the carving)
        g.clearRect(0, 0, w, h); g.shadowColor = '#5affe0'; g.shadowBlur = 16;
        var gr = g.createRadialGradient(128, 128, 10, 128, 128, 120); gr.addColorStop(0, '#e8fffa'); gr.addColorStop(0.5, '#7affe8'); gr.addColorStop(1, '#2ac8b8'); g.fillStyle = g.strokeStyle = gr; crestShapes(g, 126, 110, false); });
      hfRune = new THREE.MeshBasicMaterial({ map: runeT, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending });
      P(new THREE.BoxGeometry(0.32, 0.32, 0.22), stoneM[2], 0, 1.13, 0.05, 0, 0, 0, CD);   // (a keystone, set proud of the lintel)
      P(new THREE.BoxGeometry(0.34, 0.03, 0.24), stoneM[1], 0, 1.3, 0.05, 0, 0, 0, CD); P(new THREE.BoxGeometry(0.3, 0.025, 0.22), stoneM[1], 0, 0.965, 0.06, 0, 0, 0, CD);
      P(new THREE.CylinderGeometry(0.135, 0.14, 0.03, 40), stoneM[3], 0, 1.13, 0.175, Math.PI / 2, 0, 0, CD);   // (the crest's round boss, its rim moulded)
      P(new THREE.TorusGeometry(0.135, 0.012, 8, 40), stoneM[0], 0, 1.13, 0.19, 0, 0, 0, CD);
      P(new THREE.CircleGeometry(0.128, 40), new THREE.MeshStandardMaterial({ map: carveT, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), 0, 1.13, 0.198, 0, 0, 0, CD);
      var rn = P(new THREE.CircleGeometry(0.128, 40), hfRune, 0, 1.13, 0.203, 0, 0, 0, CD); rn.castShadow = false;
      hfRuneGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0x5affd8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); hfRuneGlow.position.set(0, 0.86, 0.5);   /* (the frame leans back, so this sits on the crest) */ hfRuneGlow.scale.set(0.55, 0.55, 1); CD.add(hfRuneGlow);
      [[-0.12, 1.27], [0.11, 1.29], [0.14, 0.98]].forEach(function (m) { var ms2 = P(new THREE.SphereGeometry(0.035, 6, 4), mossM, m[0], m[1], 0.16, 0, 0, 0, CD); ms2.scale.set(1.4, 0.5, 0.6); });   // (moss on the keystone's corners)
      for (var sc = 0; sc < 8; sc++) P(new THREE.BoxGeometry(0.004, 0.06 + (sc % 3) * 0.02, 0.004), rMat(0x2a2016), -0.32 + sc * 0.012, 0.78 - (sc % 2) * 0.03, 0.073, 0, 0, 0.3 + (sc % 3) * 0.08, CD);   // (claw marks scored into the left door)
    }
    var stones = [[0.9, 0.2], [-1.0, 0.4], [1.5, -0.9], [-1.4, -1.6], [0.4, -2.2], [-1.8, -0.5], [1.2, -1.8], [-0.4, 0.3], [0.2, -1.2], [1.8, -0.2]];   // (stones poking up through the mound)
    function moundY(x, z) { var dx = x / 2.1, dz = (z + 0.95) / (2.1 * 0.78), q = 1 - dx * dx - dz * dz; return q > 0 ? Math.sqrt(q) * 1.3 - 0.05 : -0.05; }
    stones.forEach(function (st, k) { var y = moundY(st[0], st[1]); var o = P(new THREE.DodecahedronGeometry(0.12 + (k % 3) * 0.05), stoneM[k % 4], st[0], y, st[1], k, k * 0.9, 0); o.scale.set(1, 0.55, 0.85); var mm = P(new THREE.SphereGeometry(0.08, 6, 4), mossM, st[0], y + 0.06, st[1]); mm.scale.set(1.2, 0.3, 1); });
    var flowerC = [0xf0f0ff, 0xb090e0, 0xf0d060, 0xe8a0c0];
    for (var fl = 0; fl < 34; fl++) { var fa = fl * 2.39, fr = 0.5 + (fl % 9) * 0.19, fx = Math.sin(fa) * fr, fz = -0.95 + Math.cos(fa) * fr * 0.78; if (fz > 0.8 && Math.abs(fx) < 0.85) continue; var fy = moundY(fx, fz);
      P(new THREE.CylinderGeometry(0.003, 0.003, 0.09, 3), rMat(0x4a7a34), fx, fy + 0.045, fz); P(new THREE.SphereGeometry(0.018, 6, 4), rMat(flowerC[fl % 4], { roughness: 0.6 }), fx, fy + 0.095, fz); }
    var mossH = rMat(0x6a7a4a, { roughness: 1, side: THREE.DoubleSide });   // (grey-green moss hanging from the dead tree's branches)
    [[0.1, 2.5, -0.65], [0.28, 2.58, -0.6], [-1.0, 2.95, -1.05], [-0.75, 2.8, -1.0], [-0.8, 1.58, -0.65], [-0.38, 3.2, -0.82], [-0.2, 2.35, -0.72]].forEach(function (m, k) { for (var sd = 0; sd < 3; sd++) { var len = 0.25 + ((k + sd) % 3) * 0.12; var pl = P(new THREE.PlaneGeometry(0.04, len), mossH, m[0] + sd * 0.03, m[1] - len / 2, m[2] + sd * 0.02, 0, k + sd, 0); pl.castShadow = false; } });
    P(new THREE.TorusGeometry(0.13, 0.018, 6, 16), rMat(0x8a7450, { roughness: 1 }), -0.55, 1.75, -0.95, Math.PI / 2, 0, 0.1); P(new THREE.SphereGeometry(0.035, 8, 6), rMat(0x8a7450, { roughness: 1 }), -0.42, 1.74, -0.88);   // (a rope knotted round the trunk, its end dangling)
    P(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 5), rMat(0x8a7450, { roughness: 1 }), -0.42, 1.5, -0.86, 0.1, 0, 0.08);
    hfCrow = new THREE.Group(); hfCrow.position.set(0.22, 2.6, -0.62); hfCrow.rotation.y = 0.6; G.add(hfCrow);   // (a crow, watching the door)
    var crowM = rMat(0x14121a, { roughness: 0.5, metalness: 0.2 });
    var cb = P(new THREE.SphereGeometry(0.07, 12, 8), crowM, 0, 0.06, 0, 0, 0, 0, hfCrow); cb.scale.set(0.8, 0.85, 1.4);
    var head = new THREE.Group(); head.position.set(0, 0.13, 0.08); hfCrow.add(head); hfCrow.userData.head = head;
    P(new THREE.SphereGeometry(0.045, 10, 8), crowM, 0, 0, 0, 0, 0, 0, head); P(new THREE.ConeGeometry(0.014, 0.06, 6), rMat(0x2a2620), 0, -0.005, 0.06, Math.PI / 2, 0, 0, head);
    [-1, 1].forEach(function (sd) { P(new THREE.SphereGeometry(0.008, 6, 4), rMat(0xd8b040, { emissive: 0x6a4a10, emissiveIntensity: 0.6 }), sd * 0.03, 0.012, 0.03, 0, 0, 0, head); var wg = P(new THREE.SphereGeometry(0.06, 8, 6), crowM, sd * 0.05, 0.07, -0.02, 0, 0, 0, hfCrow); wg.scale.set(0.3, 0.6, 1.3);
      P(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 4), rMat(0x2a2620), sd * 0.025, -0.02, 0.01, 0, 0, 0, hfCrow); });
    var tl = P(new THREE.BoxGeometry(0.06, 0.008, 0.12), crowM, 0, 0.05, -0.13, -0.3, 0, 0, hfCrow);
    var fire = new THREE.Group(); fire.position.set(-1.35, 0, 2.6); G.add(fire);   // (a cold campfire: a ring of stones, ash and burnt logs)
    for (var fs2 = 0; fs2 < 9; fs2++) { var a2 = fs2 / 9 * Math.PI * 2; var rs = P(new THREE.DodecahedronGeometry(0.07 + (fs2 % 3) * 0.015), stoneM[fs2 % 4], Math.cos(a2) * 0.3, 0.04, Math.sin(a2) * 0.3, fs2, fs2, 0, fire); rs.scale.y = 0.7; }
    P(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 14), rMat(0x3a3836, { roughness: 1 }), 0, 0.01, 0, 0, 0, 0, fire);
    [[0, 0.5], [1.1, -0.4], [2.2, 0.2]].forEach(function (lg) { P(new THREE.CylinderGeometry(0.035, 0.04, 0.38, 7), rMat(0x1a1410, { roughness: 1 }), 0, 0.05, 0, Math.PI / 2 - 0.15, lg[0], lg[1] * 0.3, fire); });
    var crate = new THREE.Group(); crate.position.set(2.25, -0.12, -1.35); crate.rotation.set(0.15, 0.7, 0.1); G.add(crate);   // (an old crate half sunk in the earth, ivy over it)
    P(new THREE.BoxGeometry(0.5, 0.42, 0.42), rMat(0x4a3a28, { roughness: 1 }), 0, 0.21, 0, 0, 0, 0, crate);
    [0.08, 0.34].forEach(function (cy) { P(new THREE.BoxGeometry(0.52, 0.04, 0.44), rMat(0x3a2c1e), 0, cy, 0, 0, 0, 0, crate); });
    for (var iv = 0; iv < 9; iv++) { var il = P(new THREE.SphereGeometry(0.5, 6, 4), rMat(0x3a6a34, { roughness: 0.7, side: THREE.DoubleSide }), -0.2 + (iv % 3) * 0.2, 0.43, -0.15 + Math.floor(iv / 3) * 0.15, 0, iv, 0, crate); il.scale.set(0.07, 0.015, 0.06); }
    var leafC = [0x8a5a2a, 0xa86a2a, 0x6a4a22, 0xb88a3a];   // (fallen leaves scattered over the ground)
    for (var lf = 0; lf < 60; lf++) { var la = lf * 2.39, lr = 1.6 + (lf % 11) * 0.17, lx = Math.sin(la) * lr, lz = -0.4 + Math.cos(la) * lr; if (lz > 1.6 && lz < 3.3 && Math.abs(lx) < 0.6) continue;
      var lm = P(new THREE.CircleGeometry(0.045, 5), rMat(leafC[lf % 4], { roughness: 1, side: THREE.DoubleSide }), lx, 0.012 + (lf % 3) * 0.002, lz, -Math.PI / 2 + (lf % 5 - 2) * 0.1, 0, la); lm.scale.y = 1.6; lm.castShadow = false; }
    G.traverse(function (o) { if (o.isMesh && o.castShadow !== false) { o.castShadow = true; o.receiveShadow = true; } });
  })(hideGroup);
  [[-1.35, 2.6, 0.4], [2.25, -1.35, 0.35]].forEach(function (b) { var w = hideWorld(b[0], b[1]); solids.push({ x: w.x, z: w.z, r: b[2] }); });
  // ---- inside: a carved guild sign over the board, red thread linking its notes and a ledger beside it; wall sconces;
  // a cauldron over the fire with firewood and fire irons, a mantel of skull, candles and jars under a set of antlers, herbs
  // drying; a bookshelf of old books, scrolls and bottles; an armour stand with a hooded cloak; a target dummy full of arrows;
  // a bedroll with furs; a barrel of arrows; a map of the isles on the wall; the table covered in an hourglass, quill and ink,
  // dice, cards, a compass and a lockbox; straw on the floor ----
  (function (R) {
    var W = HDI_W / 2, D = HDI_D / 2;
    function p(geo, m, x, y, z, rx, ry, rz, par) { return cpPart(geo, m, x, y, z, rx, ry, rz, par || R); }
    var wood = rMat(0x3a2a1c, { roughness: 0.9 }), oak = rMat(0x5a4028, { roughness: 0.85 }), iron = rMat(0x24201e, { metalness: 0.6, roughness: 0.5 }), brass = rMat(0x9a7a3a, { metalness: 0.75, roughness: 0.35 });
    var steel = rMat(0xb8bcc2, { metalness: 0.9, roughness: 0.3, envMap: rubyEnv }), parch = rMat(0xe0d0a8, { roughness: 1 }), wax = rMat(0xe8dcc0, { roughness: 0.6 });
    var flameM = rMat(0xffd890, { emissive: 0xffa040, emissiveIntensity: 1.4 }); hdFlames.push(flameM);
    function candle(x, y, z, h, par) { p(new THREE.CylinderGeometry(0.02, 0.022, h, 10), wax, x, y + h / 2, z, 0, 0, 0, par); var dr = p(new THREE.SphereGeometry(0.008, 6, 4), wax, x + 0.018, y + h * 0.7, z, 0, 0, 0, par); dr.scale.y = 2;
      var f = p(new THREE.SphereGeometry(0.016, 8, 6), flameM, x, y + h + 0.022, z, 0, 0, 0, par); f.scale.y = 1.9; f.castShadow = false; hdHalo(par || R, x, y + h + 0.025, z, 0.3); }
    // (the guild's name, the red thread and the lectern: see the back wall, in great detail, further down)
    hideSolids.push([1.25, -D + 0.55, 0.3]);
    // (the back-left corner, in great detail, and its like round the den: wrought-iron sconces with scrolled backplates, curled
    // arms and drip pans, the candles running with wax and soot blackening the stone above them; the guild's banners in heavy
    // black wool, the mark embroidered in crimson and gold, hanging in folds from iron rods, their tails tattered and tasselled,
    // moth-eaten; cobwebs spun properly across the top corners, sagging, torn, dusty, a spider in one; and the casks: bulging
    // staves, iron hoops, plank heads with a bung, a brass tap dripping on the corner one, chalk tallies on their sides)
    (function () {
      var sd = 1201; function cr() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
      function q(par, geo, m, x, y, z, rx, ry, rz) { return cpPart(geo, m, x, y, z, rx, ry, rz, par); }
      function quiet(o) { o.castShadow = false; return o; }
      var ironM = rMat(0x2e2824, { metalness: 0.6, roughness: 0.45, envMap: rubyEnv }), waxM = rMat(0xece2c8, { roughness: 0.55, emissive: 0x5a3c18, emissiveIntensity: 0.6 }), oldWax = rMat(0xd8caa0, { roughness: 0.6, emissive: 0x3a2810, emissiveIntensity: 0.5 }), brassM = rMat(0xa8843e, { metalness: 0.8, roughness: 0.3, envMap: rubyEnv });
      var fl = rMat(0xffd890, { emissive: 0xffa040, emissiveIntensity: 1.4 }); hdFlames.push(fl);
      var sootT = cpTex(64, 128, function (g, w, h) { var gr = g.createRadialGradient(w / 2, h * 0.75, 2, w / 2, h * 0.6, h * 0.55); gr.addColorStop(0, 'rgba(8,6,4,0.75)'); gr.addColorStop(0.5, 'rgba(8,6,4,0.35)'); gr.addColorStop(1, 'rgba(8,6,4,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
      var sootM = new THREE.MeshBasicMaterial({ map: sootT, transparent: true, depthWrite: false });
      // ---- the sconces ----
      var plate = new THREE.Shape(); plate.moveTo(0, 0.17); plate.quadraticCurveTo(0.03, 0.12, 0.055, 0.07); plate.quadraticCurveTo(0.07, 0.0, 0.05, -0.07); plate.quadraticCurveTo(0.03, -0.12, 0, -0.15); plate.quadraticCurveTo(-0.03, -0.12, -0.05, -0.07); plate.quadraticCurveTo(-0.07, 0.0, -0.055, 0.07); plate.quadraticCurveTo(-0.03, 0.12, 0, 0.17);
      var plateG = new THREE.ExtrudeGeometry(plate, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.004, bevelSegments: 2, curveSegments: 8 });
      function spiral(s) { var pts = []; for (var i = 0; i <= 24; i++) { var t = i / 24, a = t * Math.PI * 3, r = 0.045 * (1 - t * 0.8); pts.push(new THREE.Vector3(s * (0.06 + r * Math.cos(a)), -0.02 + r * Math.sin(a), 0.006)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.0045, 5); }
      var armG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.06, 0.01), new THREE.Vector3(0, -0.1, 0.06), new THREE.Vector3(0, -0.085, 0.12), new THREE.Vector3(0, -0.055, 0.16)]), 20, 0.008, 6);
      function sconce(x, z, ry) { var g = new THREE.Group(); g.position.set(x, 1.75, z); g.rotation.y = ry; R.add(g);
        q(g, plateG, ironM, 0, 0, 0); [0.12, -0.1].forEach(function (yy) { q(g, new THREE.SphereGeometry(0.008, 6, 5), ironM, 0, yy, 0.012); });
        [-1, 1].forEach(function (s) { q(g, spiral(s), ironM, 0, 0, 0); });
        q(g, armG, ironM, 0, 0, 0); [0.04, 0.1].forEach(function (az) { q(g, new THREE.TorusGeometry(0.011, 0.003, 5, 10), ironM, 0, -0.098 + (az > 0.05 ? 0.005 : 0), az, 0, 0, 0); });
        q(g, lbLathe([[0, -0.006], [0.05, -0.006], [0.058, 0.002], [0.056, 0.008], [0.05, 0.002], [0, 0.0]], 12), ironM, 0, -0.05, 0.16);   // (the drip pan)
        q(g, lbLathe([[0, 0], [0.02, 0], [0.024, 0.025], [0.02, 0.025], [0.017, 0.006], [0, 0.006]], 12), ironM, 0, -0.05, 0.16);   // (the socket)
        quiet(q(g, new THREE.SphereGeometry(0.03, 10, 5), oldWax, 0.012, -0.046, 0.165)).scale.set(1, 0.15, 0.9);
        var dr = quiet(q(g, new THREE.SphereGeometry(0.006, 6, 5), oldWax, 0.052, -0.06, 0.16)); dr.scale.set(0.8, 2.8, 0.8);   // (wax hanging off the pan's lip)
        var h = 0.1 + cr() * 0.04, cy = -0.03; q(g, lbLathe([[0, 0], [0.018, 0], [0.0185, h * 0.5], [0.018, h], [0.016, h + 0.004], [0.012, h - 0.003], [0, h - 0.005]], 12), waxM, 0, cy, 0.16);
        for (var d = 0; d < 4; d++) { var a = d * 1.6 + 0.3, dl = 0.015 + (d % 2) * 0.02, dd = quiet(q(g, new THREE.SphereGeometry(0.005, 6, 5), waxM, Math.cos(a) * 0.018, cy + h - dl * 0.6, 0.16 + Math.sin(a) * 0.018)); dd.scale.set(0.9, dl / 0.01 + 1, 0.9); }
        q(g, new THREE.CylinderGeometry(0.0012, 0.0015, 0.012, 4), rMat(0x141010), 0, cy + h + 0.003, 0.16, 0.1, 0, 0.1);
        var f = quiet(q(g, new THREE.SphereGeometry(0.013, 10, 8), fl, 0, cy + h + 0.024, 0.16)); f.scale.set(1, 2.1, 1);
        hdHalo(g, 0, cy + h + 0.026, 0.16, 0.3);
        var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffb060, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); gl.position.set(0, 0.12, 0.17); gl.scale.set(0.8, 0.8, 1); g.add(gl); hdHalos.push(gl);
        quiet(q(g, new THREE.PlaneGeometry(0.34, 0.6), sootM, 0, 0.26, -0.008)); }   // (soot on the stone above)
      [[-W + 0.05, -2.6, Math.PI / 2], [-W + 0.05, 1.5, Math.PI / 2], [W - 0.05, 1.65, -Math.PI / 2], [-3.0, -D + 0.05, 0], [3.0, -D + 0.05, 0]].forEach(function (s) { sconce(s[0], s[1], s[2]); });
      // ---- the banners ----
      var banT = cpTex(256, 512, function (g, w, h) { var i;
        g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h - 10); for (i = 0; i <= 16; i++) { var t = i / 16, bx = w - t * w, by = h - 10 - (t < 0.5 ? t : 1 - t) * 2 * 90 + (cr() - 0.5) * 14; g.lineTo(bx, by); } g.closePath(); g.save(); g.clip();   // (a swallowtail, ragged along its edge)
        g.fillStyle = '#141016'; g.fillRect(0, 0, w, h);
        for (var y2 = 0; y2 < h; y2 += 2) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, y2, w, 1); } for (var x2 = 0; x2 < w; x2 += 2) { g.fillStyle = 'rgba(255,240,240,0.025)'; g.fillRect(x2, 0, 1, h); }   // (the weave of heavy wool)
        [[10, 14], [w - 24, 14]].forEach(function (b) { g.fillStyle = '#5a1018'; g.fillRect(b[0], 0, b[1], h); g.strokeStyle = '#b08a3a'; g.lineWidth = 1.5; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(b[0] - 2, 0); g.lineTo(b[0] - 2, h); g.moveTo(b[0] + b[1] + 2, 0); g.lineTo(b[0] + b[1] + 2, h); g.stroke(); g.setLineDash([]); });   // (crimson borders stitched in gold)
        g.fillStyle = '#5a1018'; g.fillRect(0, 22, w, 12); g.strokeStyle = '#b08a3a'; g.setLineDash([4, 3]); g.beginPath(); g.moveTo(0, 20); g.lineTo(w, 20); g.moveTo(0, 36); g.lineTo(w, 36); g.stroke(); g.setLineDash([]);
        hideSigil(g, w / 2, h * 0.38, 78, '#c8a04a', 12); hideSigil(g, w / 2, h * 0.38, 78, '#a01c26', 7);   // (the mark: gold couching under crimson)
        for (i = 0; i < 500; i++) { var a = cr() * 6.28, r = 60 + cr() * 30; g.fillStyle = 'rgba(200,160,80,0.25)'; g.fillRect(w / 2 + Math.cos(a) * r * 0.2, h * 0.38 + Math.sin(a) * r * 0.2, 0.8, 0.8); }
        for (i = 0; i < 3; i++) { var dy = h * 0.66 + i * 18; g.strokeStyle = '#b08a3a'; g.lineWidth = 2; g.beginPath(); for (var dx = 30; dx <= w - 30; dx += 12) g.lineTo(dx, dy + ((dx / 12) % 2 ? -5 : 5)); g.stroke(); }   // (a zigzag band of gold)
        var fg = g.createLinearGradient(0, 0, 0, h); fg.addColorStop(0, 'rgba(120,110,100,0.12)'); fg.addColorStop(0.5, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(60,40,30,0.2)'); g.fillStyle = fg; g.fillRect(0, 0, w, h);   // (faded and dusty)
        g.restore(); g.globalCompositeOperation = 'destination-out'; for (i = 0; i < 10; i++) { g.beginPath(); g.arc(20 + cr() * (w - 40), 60 + cr() * (h - 160), 1.5 + cr() * 3.5, 0, 6.28); g.fill(); } g.globalCompositeOperation = 'source-over';   // (moth holes)
        g.strokeStyle = 'rgba(40,30,30,0.9)'; g.lineWidth = 1; for (i = 0; i < 40; i++) { var t2 = cr(), fx = w - t2 * w, fy = h - 10 - (t2 < 0.5 ? t2 : 1 - t2) * 2 * 90; g.beginPath(); g.moveTo(fx, fy - 3); g.lineTo(fx + (cr() - 0.5) * 4, fy + 6 + cr() * 8); g.stroke(); } });   // (frayed threads)
      var banM = new THREE.MeshStandardMaterial({ map: banT, roughness: 0.95, side: THREE.DoubleSide, alphaTest: 0.5 }), rodM = rMat(0x2a2016, { metalness: 0.5, roughness: 0.45 }), goldT = rMat(0xb08a3a, { roughness: 0.7 });
      [-1.9, 1.9].forEach(function (bx) { var bg = new THREE.PlaneGeometry(0.7, 1.5, 14, 24), bp = bg.attributes.position;
        for (var i = 0; i < bp.count; i++) { var x = bp.getX(i), y = bp.getY(i), t = (0.75 - y) / 1.5; bp.setZ(i, Math.sin(x * 17 + bx) * 0.014 * (0.35 + t) + Math.sin(x * 7) * 0.008 + t * 0.03); } bg.computeVertexNormals();   // (hanging in folds, swinging a little out at the foot)
        q(R, bg, banM, bx, 1.75, -D + 0.12);
        q(R, new THREE.CylinderGeometry(0.014, 0.014, 0.86, 10), rodM, bx, 2.52, -D + 0.13, 0, 0, Math.PI / 2);
        [-1, 1].forEach(function (e) { q(R, new THREE.SphereGeometry(0.022, 10, 8), brassM, bx + e * 0.44, 2.52, -D + 0.13); q(R, new THREE.ConeGeometry(0.014, 0.06, 6), brassM, bx + e * 0.48, 2.52, -D + 0.13, 0, 0, -e * Math.PI / 2);   // (spear-point finials)
          q(R, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(bx + e * 0.38, 2.52, -D + 0.13), new THREE.Vector3(bx + e * 0.22, 2.7, -D + 0.08), new THREE.Vector3(bx, 2.78, -D + 0.03)]), 10, 0.005, 4), goldT, 0, 0, 0); });   // (its cord, up to an iron hook)
        q(R, new THREE.CylinderGeometry(0.012, 0.012, 0.03, 8), rodM, bx, 2.78, -D + 0.02, Math.PI / 2, 0, 0);
        [[-0.35, 1.75 - 0.75 + 0.01], [0.35, 1.75 - 0.75 + 0.01]].forEach(function (tp) { var tg = new THREE.Group(); tg.position.set(bx + tp[0] * 0.92, tp[1], -D + 0.14); R.add(tg);   // (gold tassels at its two tails)
          q(tg, new THREE.SphereGeometry(0.014, 8, 6), goldT, 0, 0, 0); q(tg, new THREE.CylinderGeometry(0.006, 0.006, 0.02, 6), goldT, 0, -0.02, 0); q(tg, new THREE.ConeGeometry(0.02, 0.08, 10, 1, true), goldT, 0, -0.065, 0, Math.PI, 0, 0); }); });
      // ---- the cobwebs ----
      var webT = cpTex(256, 256, function (g, w, h) { g.clearRect(0, 0, w, h); var i, j, rad = [];
        for (i = 0; i < 11; i++) rad.push(i / 10 * Math.PI / 2 + (cr() - 0.5) * 0.08);
        g.strokeStyle = 'rgba(232,232,240,0.6)'; g.lineWidth = 1.1; rad.forEach(function (a) { g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a + 0.05) * 130, Math.sin(a + 0.05) * 130, Math.cos(a) * 250, Math.sin(a) * 250); g.stroke(); });
        g.lineWidth = 0.8; for (var r = 14; r < 240; r += 7 + cr() * 6) { g.strokeStyle = 'rgba(230,230,238,' + (0.3 + cr() * 0.3).toFixed(2) + ')';   // (the spiral, sagging between the spokes, broken here and there)
          for (j = 0; j < rad.length - 1; j++) { if (cr() < 0.1) continue; var r1 = r + (cr() - 0.5) * 4, r2 = r + (cr() - 0.5) * 4, am = (rad[j] + rad[j + 1]) / 2; g.beginPath(); g.moveTo(Math.cos(rad[j]) * r1, Math.sin(rad[j]) * r1); g.quadraticCurveTo(Math.cos(am) * (r - 6), Math.sin(am) * (r - 6), Math.cos(rad[j + 1]) * r2, Math.sin(rad[j + 1]) * r2); g.stroke(); } }
        g.strokeStyle = 'rgba(230,230,238,0.45)'; for (i = 0; i < 6; i++) { var sx = 60 + cr() * 150, sy = 60 + cr() * 150; g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(sx + 10, sy + 30, sx + (cr() - 0.5) * 30, sy + 50 + cr() * 40); g.stroke(); }   // (torn strands hanging loose)
        for (i = 0; i < 260; i++) { var da = cr() * Math.PI / 2, dr = cr() * 230; g.fillStyle = 'rgba(200,195,185,' + (0.2 + cr() * 0.4).toFixed(2) + ')'; g.fillRect(Math.cos(da) * dr, Math.sin(da) * dr, 1.5, 1.5); }   // (dust caught in it)
        var dg = g.createRadialGradient(0, 0, 4, 0, 0, 80); dg.addColorStop(0, 'rgba(200,195,185,0.35)'); dg.addColorStop(1, 'rgba(200,195,185,0)'); g.fillStyle = dg; g.fillRect(0, 0, 90, 90); });   // (thick and grey right in the corner)
      var webM = new THREE.MeshBasicMaterial({ map: webT, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      var H = HDI_H;
      [[-W + 0.01, -D + 0.01, Math.PI / 4], [W - 0.01, -D + 0.01, -Math.PI / 4]].forEach(function (c, ci) { var s = c[0] < 0 ? 1 : -1;
        quiet(q(R, new THREE.PlaneGeometry(0.95, 0.95), webM, c[0] + s * 0.33, H - 0.45, c[1] + 0.33, 0, c[2], c[0] < 0 ? 0 : Math.PI / 2));
        quiet(q(R, new THREE.PlaneGeometry(0.5, 0.5), webM, c[0] + s * 0.005, H - 0.3, c[1] + 0.3, 0, s * Math.PI / 2, c[0] < 0 ? Math.PI / 2 : Math.PI));   // (a smaller web on the side wall)
        for (var k = 0; k < 3; k++) quiet(q(R, new THREE.CylinderGeometry(0.0012, 0.0012, 0.25 + k * 0.12, 3), new THREE.MeshBasicMaterial({ color: 0xd8d8e0, transparent: true, opacity: 0.4 }), c[0] + s * (0.25 + k * 0.12), H - 0.55 - k * 0.08, c[1] + 0.22 + k * 0.1));   // (strands hanging down)
        if (!ci) { var sp = new THREE.Group(); sp.position.set(c[0] + s * 0.42, H - 0.62, c[1] + 0.42); sp.rotation.y = c[2]; R.add(sp); var spM = rMat(0x14100e, { roughness: 0.5 });   // (the spider)
          q(sp, new THREE.SphereGeometry(0.018, 8, 6), spM, 0, 0.01, 0.002).scale.set(1, 1.2, 0.8); q(sp, new THREE.SphereGeometry(0.01, 8, 6), spM, 0, -0.016, 0.002);
          for (var lg = 0; lg < 8; lg++) { var ls = lg < 4 ? -1 : 1, li = lg % 4; q(sp, new THREE.CylinderGeometry(0.0012, 0.0012, 0.04, 3), spM, ls * 0.022, -0.012 + li * 0.008, 0.006, 0, 0, ls * (0.9 + li * 0.25)); } } });
      // ---- the casks ----
      var stT = cpTex(256, 64, function (g, w, h) { g.fillStyle = '#5a3a22'; g.fillRect(0, 0, w, h); for (var i = 0; i < 16; i++) { var sx = i * w / 16; g.fillStyle = 'rgba(' + (i % 3 ? 0 : 40) + ',20,8,' + (0.08 + (i % 4) * 0.05).toFixed(2) + ')'; g.fillRect(sx, 0, w / 16, h);
        for (var gl = 0; gl < 4; gl++) { g.strokeStyle = 'rgba(30,18,8,0.3)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(sx + 3 + gl * 3.5, 0); g.lineTo(sx + 3 + gl * 3.5 + Math.sin(i + gl) * 2, h); g.stroke(); } g.fillStyle = 'rgba(15,8,2,0.9)'; g.fillRect(sx, 0, 1.5, h); } });
      var headT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#5a3a22'; g.fillRect(0, 0, w, h); for (var i = 0; i < 5; i++) { g.fillStyle = ['#5a3a22', '#64422a', '#503420'][i % 3]; g.fillRect(i * w / 5, 0, w / 5, h); g.fillStyle = 'rgba(15,8,2,0.85)'; g.fillRect(i * w / 5, 0, 1.5, h); }
        for (i = 0; i < 30; i++) { g.strokeStyle = 'rgba(30,18,8,0.3)'; g.beginPath(); var gx = cr() * w; g.moveTo(gx, 0); g.lineTo(gx + (cr() - 0.5) * 6, h); g.stroke(); } g.fillStyle = 'rgba(20,10,4,0.85)'; g.beginPath(); g.arc(w * 0.68, h * 0.5, 9, 0, 6.28); g.fill(); });
      var chalkT = cpTex(128, 64, function (g, w, h) { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(230,226,215,0.75)'; g.lineWidth = 3; g.lineCap = 'round'; for (var i = 0; i < 4; i++) { g.beginPath(); g.moveTo(14 + i * 10, 14); g.lineTo(16 + i * 10, 50); g.stroke(); } g.beginPath(); g.moveTo(8, 44); g.lineTo(52, 20); g.stroke();
        g.beginPath(); g.moveTo(74, 16); g.lineTo(110, 48); g.moveTo(110, 16); g.lineTo(74, 48); g.stroke(); });
      var staveM = new THREE.MeshStandardMaterial({ map: stT, roughness: 0.8 }), headM = new THREE.MeshStandardMaterial({ map: headT, roughness: 0.85 }), chalkM = new THREE.MeshBasicMaterial({ map: chalkT, transparent: true, depthWrite: false, opacity: 0.85 });
      function cask(x, z, face, tap) { var c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = face; R.add(c);   // (local +z faces the room)
        q(c, lbLathe([[0.29, 0], [0.315, 0.12], [0.33, 0.4], [0.315, 0.68], [0.29, 0.8]], 32), staveM, 0, 0, 0);
        [0.012, 0.788].forEach(function (hy) { q(c, new THREE.CircleGeometry(0.285, 32), headM, 0, hy, 0, hy > 0.4 ? -Math.PI / 2 : Math.PI / 2, 0, 0); q(c, new THREE.TorusGeometry(0.285, 0.012, 5, 32), staveM, 0, hy > 0.4 ? 0.79 : 0.01, 0, Math.PI / 2, 0, 0); });   // (the heads, and the chime round them)
        [[0.04, 0.297], [0.17, 0.318], [0.63, 0.318], [0.76, 0.297]].forEach(function (h2) { q(c, new THREE.TorusGeometry(h2[1], 0.01, 5, 32), ironM, 0, h2[0], 0, Math.PI / 2, 0, 0); for (var r = 0; r < 4; r++) { var ra = r * Math.PI / 2 + 0.4; q(c, new THREE.SphereGeometry(0.006, 5, 4), ironM, Math.cos(ra) * (h2[1] + 0.008), h2[0], Math.sin(ra) * (h2[1] + 0.008)); } });
        q(c, new THREE.CylinderGeometry(0.02, 0.018, 0.02, 10), rMat(0x8a6a4a, { roughness: 1 }), 0.09, 0.795, 0);   // (the bung, a cork in it)
        quiet(q(c, new THREE.PlaneGeometry(0.22, 0.11), chalkM, 0.06, 0.52, 0.333, -0.06, 0, 0.05));
        if (tap) { var t = new THREE.Group(); t.position.set(0, 0.16, 0.31); c.add(t);   // (a brass tap, dripping; a dark puddle under it)
          q(t, new THREE.CylinderGeometry(0.018, 0.022, 0.05, 10), brassM, 0, 0, 0.02, Math.PI / 2, 0, 0); q(t, new THREE.CylinderGeometry(0.012, 0.012, 0.07, 8), brassM, 0, 0, 0.07, Math.PI / 2, 0, 0); q(t, new THREE.CylinderGeometry(0.01, 0.008, 0.035, 8), brassM, 0, -0.02, 0.1); q(t, new THREE.BoxGeometry(0.06, 0.012, 0.012), brassM, 0, 0.025, 0.07);
          q(t, new THREE.SphereGeometry(0.0055, 8, 6), rMat(0x5a2a08, { roughness: 0.05, transparent: true, opacity: 0.85 }), 0, -0.045, 0.1).scale.y = 1.4;
          quiet(q(c, new THREE.CircleGeometry(0.11, 18), rMat(0x1a0c04, { roughness: 0.05, transparent: true, opacity: 0.7 }), 0.02, 0.003, 0.48, -Math.PI / 2, 0, 0)).scale.set(1.3, 0.9, 1);
          q(c, lbLathe([[0, 0], [0.045, 0], [0.05, 0.11], [0.045, 0.11], [0.041, 0.008], [0, 0.008]], 16), rMat(0x8c9096, { metalness: 0.7, roughness: 0.35, envMap: rubyEnv, side: THREE.DoubleSide }), -0.06, 0.8, 0.08); }   // (and a pewter mug left on top)
      }
      cask(-W + 1.3, -D + 0.5, 0.7, true); cask(W - 0.55, D - 1.5, -Math.PI / 2, false); cask(W - 0.55, D - 2.2, -Math.PI / 2 - 0.3, false);
    })();
    // (the right wall, in great detail: the fireplace, of dressed stone blocks with an arched opening and a keystone, soot above
    // it, a firebrick floor and a sooty back, a raised hearthstone in front, a thick oak mantel on carved corbels, the chimney
    // breast rising to the ceiling; the fire: barked logs on iron firedogs, layered flames that flicker, embers and ash; the
    // cauldron hung on a chain from a bar across the opening, its green brew bubbling and dripping over the rim; a stand of fire
    // irons; a stack of split firewood; on the mantel a skull with a candle, brass candlesticks, labelled jars and a clay pipe;
    // the mounted antlers on a carved plaque; bundles of herbs drying; and the straw target dummy, sack-headed and stitched, its
    // chest painted with a target, arrows in it)
    (function () {
      var sd = 2717; function cr() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
      function q(par, geo, m, x, y, z, rx, ry, rz) { return cpPart(geo, m, x, y, z, rx, ry, rz, par); }
      function quiet(o) { o.castShadow = false; return o; }
      function grp(x, y, z, ry, par) { var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; (par || R).add(g); return g; }
      function grainT(base, vert) { return cpTex(128, 128, function (g, w, h) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (var i = 0; i < 30; i++) { var o = (i * 41) % 128; g.strokeStyle = 'rgba(25,14,6,' + (0.12 + (i % 5) * 0.07).toFixed(2) + ')'; g.lineWidth = 0.6 + (i % 3) * 0.5; g.beginPath();
        for (var t = 0; t <= 128; t += 8) { var d = o + Math.sin(t / 128 * Math.PI * 2 + i) * 2.5; if (vert) { if (t) g.lineTo(d, t); else g.moveTo(d, t); } else { if (t) g.lineTo(t, d); else g.moveTo(t, d); } } g.stroke(); } }); }
      var ironM = rMat(0x24201e, { metalness: 0.6, roughness: 0.5 }), brassM = rMat(0xa8843e, { metalness: 0.8, roughness: 0.3, envMap: rubyEnv });
      // ---- the stone of the fireplace ----
      var blockT = cpTex(256, 256, function (g, w, h) { g.fillStyle = '#1e1a16'; g.fillRect(0, 0, w, h); var rows = [40, 30, 36, 34, 42, 38, 36], y = 0;
        rows.forEach(function (rh, ri) { var x = -(ri * 37) % 60; while (x < w) { var bw = 44 + cr() * 50, c = 70 + cr() * 40, tint = cr();
            var draw = function (ox) { var gr = g.createLinearGradient(0, y, 0, y + rh); gr.addColorStop(0, 'rgb(' + Math.round(c + 18) + ',' + Math.round(c + 12 - tint * 6) + ',' + Math.round(c + 4 - tint * 10) + ')'); gr.addColorStop(1, 'rgb(' + Math.round(c - 14) + ',' + Math.round(c - 18) + ',' + Math.round(c - 22) + ')'); g.fillStyle = gr; g.fillRect(x + ox + 2, y + 2, bw - 4, rh - 4);
              for (var s = 0; s < 40; s++) { g.fillStyle = s % 2 ? 'rgba(0,0,0,0.18)' : 'rgba(255,240,220,0.08)'; g.fillRect(x + ox + 2 + cr() * (bw - 4), y + 2 + cr() * (rh - 4), 1.5, 1.5); }
              g.fillStyle = 'rgba(255,240,220,0.12)'; g.fillRect(x + ox + 2, y + 2, bw - 4, 1.5); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(x + ox + 2, y + rh - 3.5, bw - 4, 1.5);
              if (cr() < 0.12) { g.strokeStyle = 'rgba(10,8,6,0.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + ox + bw * 0.3, y + 3); g.lineTo(x + ox + bw * 0.4, y + rh * 0.5); g.lineTo(x + ox + bw * 0.35, y + rh - 3); g.stroke(); } };
            draw(0); if (x + bw > w) draw(-w); x += bw; } y += rh; });
      });
      function stoneM(rx, ry) { var t = blockT.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); return new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 0.01, roughness: 0.95 }); }
      var FX = W - 0.35, FZ = -0.3, FRONT = W - 0.7;   // (the front face of the fireplace)
      q(R, new THREE.BoxGeometry(0.7, 1.4, 0.5), stoneM(1.2, 2.4), W - 0.35, 0.7, FZ - 0.55); q(R, new THREE.BoxGeometry(0.7, 1.4, 0.5), stoneM(1.2, 2.4), W - 0.35, 0.7, FZ + 0.55);   // (the two piers)
      var arch = new THREE.Shape(); arch.moveTo(-0.3, 0.62); arch.lineTo(-0.3, 1.36); arch.lineTo(0.3, 1.36); arch.lineTo(0.3, 0.62); arch.absarc(0, 0.62, 0.3, 0, Math.PI, false);
      var archG = new THREE.ExtrudeGeometry(arch, { depth: 0.7, bevelEnabled: false, curveSegments: 18 }); var am = stoneM(1.6, 1.6); q(R, archG, am, FRONT, 0, FZ, 0, Math.PI / 2, 0);   // (the stone over the arched opening)
      for (var vs = 0; vs < 9; vs++) { var va = vs / 8 * Math.PI, big = vs === 4; q(R, new THREE.BoxGeometry(0.04, big ? 0.16 : 0.12, big ? 0.13 : 0.1), stoneM(0.3, 0.3), FRONT - 0.02, 0.62 + Math.sin(va) * 0.36, FZ + Math.cos(va) * 0.36, va - Math.PI / 2, 0, 0).rotation.set(-(va - Math.PI / 2), 0, 0); }   // (voussoirs round the arch, the keystone proud)
      var sootT = cpTex(64, 128, function (g, w, h) { var gr = g.createRadialGradient(w / 2, h, 4, w / 2, h * 0.8, h * 0.8); gr.addColorStop(0, 'rgba(6,4,2,0.85)'); gr.addColorStop(0.5, 'rgba(6,4,2,0.4)'); gr.addColorStop(1, 'rgba(6,4,2,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
      quiet(q(R, new THREE.PlaneGeometry(0.75, 0.6), new THREE.MeshBasicMaterial({ map: sootT, transparent: true, depthWrite: false }), FRONT - 0.045, 1.08, FZ, 0, -Math.PI / 2, 0));   // (soot above the arch)
      var backT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#100c0a'; g.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 16) for (var x = -(y / 16 % 2) * 16; x < w; x += 32) { g.fillStyle = 'rgba(' + (40 + cr() * 30) + ',22,14,0.6)'; g.fillRect(x + 1, y + 1, 30, 14); } var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(0,0,0,0.9)'); gr.addColorStop(1, 'rgba(60,20,4,0.2)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
      var backM = new THREE.MeshStandardMaterial({ map: backT, roughness: 1 });
      q(R, new THREE.PlaneGeometry(0.6, 0.95), backM, W - 0.08, 0.475, FZ, 0, -Math.PI / 2, 0);   // (the sooty firebrick back)
      q(R, new THREE.PlaneGeometry(0.62, 0.6), new THREE.MeshStandardMaterial({ map: backT, roughness: 1 }), W - 0.39, 0.005, FZ, -Math.PI / 2, 0, Math.PI / 2);   // (the firebrick floor)
      var flagT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#4a4440'; g.fillRect(0, 0, w, h); for (var i = 0; i < 300; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,0.2)' : 'rgba(255,240,220,0.08)'; g.fillRect(cr() * w, cr() * h, 2, 2); } g.strokeStyle = 'rgba(10,8,6,0.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.45, 0); g.lineTo(w * 0.5, h); g.stroke(); var sg = g.createLinearGradient(0, 0, w, 0); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(10,6,4,0.5)'); g.fillStyle = sg; g.fillRect(0, 0, w, h); });
      q(R, new THREE.BoxGeometry(0.36, 0.06, 1.3), [new THREE.MeshStandardMaterial({ map: flagT }), new THREE.MeshStandardMaterial({ map: flagT }), new THREE.MeshStandardMaterial({ map: flagT, roughness: 0.9 }), rMat(0x2a2622), new THREE.MeshStandardMaterial({ map: flagT }), new THREE.MeshStandardMaterial({ map: flagT })], FRONT - 0.18, 0.03, FZ);   // (the hearthstone)
      q(R, new THREE.BoxGeometry(0.3, 1.52, 1.4), stoneM(1, 2.6), W - 0.15, 1.48 + 0.76, FZ);   // (the chimney breast)
      // ---- the mantel ----
      var mantM = new THREE.MeshStandardMaterial({ map: grainT('#3e2a18', false), roughness: 0.8 });
      q(R, new THREE.BoxGeometry(0.82, 0.12, 1.8), mantM, W - 0.4, 1.42, FZ); q(R, new THREE.CylinderGeometry(0.022, 0.022, 1.8, 10), mantM, W - 0.81, 1.39, FZ, Math.PI / 2, 0, 0);   // (a thick oak beam, a rounded nosing)
      var corb = new THREE.Shape(); corb.moveTo(0, 0); corb.lineTo(0.12, 0); corb.quadraticCurveTo(0.12, -0.08, 0.04, -0.1); corb.quadraticCurveTo(0.0, -0.14, 0.0, -0.22); corb.lineTo(0, 0);
      var corbG = new THREE.ExtrudeGeometry(corb, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 }); [FZ - 0.72, FZ + 0.64].forEach(function (cz) { q(R, corbG, mantM, FRONT, 1.36, cz, 0, Math.PI, 0); });   // (carved corbels under its ends)
      // ---- the fire ----
      var barkT = cpTex(64, 128, function (g, w, h) { g.fillStyle = '#3a2618'; g.fillRect(0, 0, w, h); for (var i = 0; i < 26; i++) { var x = cr() * w; g.strokeStyle = 'rgba(12,6,2,0.7)'; g.lineWidth = 1 + cr() * 2; g.beginPath(); g.moveTo(x, 0); for (var y = 0; y <= h; y += 8) g.lineTo(x + Math.sin(y * 0.1 + i) * 3, y); g.stroke(); } for (i = 0; i < 60; i++) { g.fillStyle = 'rgba(120,90,60,0.25)'; g.fillRect(cr() * w, cr() * h, 2, 4); } }, [2, 1]);
      var endT = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#b8905a'; g.fillRect(0, 0, w, h); for (var r = 4; r < 30; r += 2.5) { g.strokeStyle = 'rgba(90,60,30,' + (0.3 + (r % 5) * 0.06).toFixed(2) + ')'; g.lineWidth = 1; g.beginPath(); g.arc(32 + Math.sin(r) * 0.8, 32, r, 0, 6.28); g.stroke(); } g.strokeStyle = '#3a2618'; g.lineWidth = 6; g.beginPath(); g.arc(32, 32, 29, 0, 6.28); g.stroke(); g.strokeStyle = 'rgba(30,20,10,0.6)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(32, 32); g.lineTo(52, 18); g.stroke(); });
      var charT = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#141008'; g.fillRect(0, 0, w, h); for (var i = 0; i < 40; i++) { g.strokeStyle = 'rgba(255,90,20,' + (0.3 + cr() * 0.5).toFixed(2) + ')'; g.lineWidth = 1; g.beginPath(); var x = cr() * w, y = cr() * h; g.moveTo(x, y); g.lineTo(x + 6, y + (cr() - 0.5) * 4); g.stroke(); } });   // (charred, glowing in the cracks)
      var logM = [new THREE.MeshStandardMaterial({ map: barkT, roughness: 1 }), new THREE.MeshStandardMaterial({ map: endT, roughness: 1 }), new THREE.MeshStandardMaterial({ map: endT, roughness: 1 })], burntM = [new THREE.MeshStandardMaterial({ map: charT, emissive: 0xff5010, emissiveMap: charT, emissiveIntensity: 0.9, roughness: 1 }), new THREE.MeshStandardMaterial({ map: charT, roughness: 1 }), new THREE.MeshStandardMaterial({ map: charT, roughness: 1 })];
      var FCX = W - 0.45;   // (the fire's middle)
      [FZ - 0.18, FZ + 0.18].forEach(function (az) { q(R, new THREE.BoxGeometry(0.42, 0.025, 0.025), ironM, FCX + 0.02, 0.12, az); q(R, new THREE.BoxGeometry(0.025, 0.2, 0.025), ironM, FCX - 0.18, 0.1, az); q(R, new THREE.SphereGeometry(0.024, 8, 6), brassM, FCX - 0.18, 0.21, az); [[-0.18, 0.04], [0.2, 0.04]].forEach(function (f) { q(R, new THREE.BoxGeometry(0.06, 0.012, 0.06), ironM, FCX + f[0], 0.006, az); }); q(R, new THREE.BoxGeometry(0.02, 0.12, 0.02), ironM, FCX + 0.2, 0.06, az); });   // (the firedogs)
      quiet(q(R, new THREE.SphereGeometry(0.25, 14, 8), rMat(0x4a4440, { roughness: 1 }), FCX, 0.0, FZ)).scale.set(0.9, 0.16, 1.1);   // (a bed of ash)
      [[0.06, 0.16, -0.12, 0.25], [-0.04, 0.16, 0.13, -0.2], [0.02, 0.27, 0, Math.PI / 2 + 0.2]].forEach(function (lg, k) { q(R, new THREE.CylinderGeometry(0.055, 0.06, 0.46, 12), k === 2 ? logM : burntM, FCX + lg[0], lg[1], FZ + lg[2], k === 2 ? 0 : Math.PI / 2, lg[3], k === 2 ? Math.PI / 2 : 0); });
      hfEmbers = rMat(0xff5a1a, { emissive: 0xff3a00, emissiveIntensity: 1.2 });
      for (var em = 0; em < 22; em++) { var e = quiet(q(R, new THREE.DodecahedronGeometry(0.018 + cr() * 0.014, 0), hfEmbers, FCX + (cr() - 0.5) * 0.3, 0.03, FZ + (cr() - 0.5) * 0.4)); e.scale.y = 0.5; }
      var fOut = new THREE.MeshBasicMaterial({ color: 0xff6a18, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), fIn = new THREE.MeshBasicMaterial({ color: 0xffd060, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), flames = [];
      [[0, 0, 0.11, 0.42], [-0.04, -0.12, 0.08, 0.3], [0.04, 0.12, 0.08, 0.32], [0.03, -0.05, 0.06, 0.24], [-0.03, 0.06, 0.06, 0.26], [0.06, 0.18, 0.05, 0.18], [0.05, -0.18, 0.05, 0.2]].forEach(function (f, k) { var fg = grp(FCX + f[0], 0.16, FZ + f[1], 0); var o = quiet(q(fg, new THREE.ConeGeometry(f[2], f[3], 10, 1, true), fOut, 0, f[3] / 2, 0)); var i = quiet(q(fg, new THREE.ConeGeometry(f[2] * 0.55, f[3] * 0.6, 8), fIn, 0, f[3] * 0.3, 0)); flames.push({ g: fg, k: k }); });
      var fg2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xff8a30, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); fg2.position.set(FCX - 0.1, 0.35, FZ); fg2.scale.set(1.0, 1.0, 1); R.add(fg2);
      // ---- the cauldron, hung on a chain from a bar across the opening ----
      q(R, new THREE.CylinderGeometry(0.012, 0.012, 0.62, 8), ironM, FCX + 0.03, 0.86, FZ, Math.PI / 2, 0, 0);
      for (var ch = 0; ch < 6; ch++) q(R, new THREE.TorusGeometry(0.014, 0.004, 4, 10), ironM, FCX + 0.03, 0.835 - ch * 0.026, FZ, 0, ch % 2 ? Math.PI / 2 : 0, 0);
      q(R, new THREE.TorusGeometry(0.02, 0.005, 5, 10, Math.PI * 1.5), ironM, FCX + 0.03, 0.68, FZ, 0, Math.PI / 2, 0);   // (an S-hook)
      var CX = FCX + 0.03, CY = 0.3, potM = rMat(0x1a1816, { metalness: 0.5, roughness: 0.55, side: THREE.DoubleSide });
      hfCauldron = q(R, lbLathe([[0, 0], [0.08, 0.005], [0.15, 0.03], [0.195, 0.1], [0.205, 0.17], [0.195, 0.23], [0.175, 0.262], [0.17, 0.272], [0.19, 0.282], [0.196, 0.298], [0.178, 0.304], [0.164, 0.29], [0.166, 0.262]], 24), potM, CX, CY, FZ);
      [-1, 1].forEach(function (s) { q(R, new THREE.TorusGeometry(0.022, 0.007, 5, 10), potM, CX, CY + 0.26, FZ + s * 0.19, 0, 0, 0); });
      q(R, new THREE.TorusGeometry(0.19, 0.007, 5, 20, Math.PI), ironM, CX, CY + 0.27, FZ, 0, Math.PI / 2, 0);   // (the bail)
      for (var st = 0; st < 5; st++) { var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xd8e8d0, transparent: true, opacity: 0, depthWrite: false })); sp.position.set(HDI_X + CX, 0.65, HDI_Z + FZ); hideScene.add(sp); hfSteam.push({ s: sp, k: st / 5 }); }   // (steam rising off it)
      var brewT = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#4a9a2a'; g.fillRect(0, 0, w, h); for (var i = 0; i < 30; i++) { var x = cr() * w, y = cr() * h, r = 2 + cr() * 5; g.strokeStyle = 'rgba(200,255,140,0.5)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, r, 0, 6.28); g.stroke(); g.fillStyle = 'rgba(20,60,10,0.4)'; g.beginPath(); g.arc(x + 1, y + 1, r * 0.6, 0, 6.28); g.fill(); } });
      quiet(q(R, new THREE.CircleGeometry(0.167, 24), rMat(0x5a9a3a, { map: brewT, emissive: 0x3a8a1a, emissiveMap: brewT, emissiveIntensity: 0.8, roughness: 0.25 }), CX, CY + 0.265, FZ, -Math.PI / 2, 0, 0));
      var brewM = rMat(0x7ad84a, { emissive: 0x4ab82a, emissiveIntensity: 0.9, roughness: 0.2 }), bubbles = [];
      for (var bb = 0; bb < 6; bb++) { var bu = quiet(q(R, new THREE.SphereGeometry(0.018, 8, 6), brewM, CX + (cr() - 0.5) * 0.2, CY + 0.267, FZ + (cr() - 0.5) * 0.2)); bubbles.push({ m: bu, k: cr() }); }
      [[0.12, 0.6], [-0.1, 2.4]].forEach(function (d) { var a = d[1]; quiet(q(R, new THREE.SphereGeometry(0.012, 8, 6), brewM, CX + Math.cos(a) * 0.198, CY + 0.25, FZ + Math.sin(a) * 0.198)).scale.set(0.8, 3.2, 0.8); });   // (brew slopped over the rim)
      // ---- fire irons on a stand ----
      var fi = grp(FRONT - 0.18, 0, FZ - 0.95, 0);
      q(fi, new THREE.CylinderGeometry(0.09, 0.1, 0.025, 14), ironM, 0, 0.012, 0); q(fi, new THREE.CylinderGeometry(0.012, 0.012, 0.7, 8), ironM, 0, 0.36, 0); q(fi, new THREE.TorusGeometry(0.06, 0.008, 6, 16), ironM, 0, 0.66, 0, Math.PI / 2, 0, 0); q(fi, new THREE.SphereGeometry(0.022, 8, 6), brassM, 0, 0.73, 0);
      [0, 1, 2].forEach(function (k) { var a = k / 3 * Math.PI * 2 + 0.4, tl = grp(Math.cos(a) * 0.06, 0.66, Math.sin(a) * 0.06, 0, fi); tl.rotation.set(Math.sin(a) * 0.08, 0, -Math.cos(a) * 0.08);
        q(tl, new THREE.CylinderGeometry(0.006, 0.006, 0.6, 6), ironM, 0, -0.3, 0); q(tl, new THREE.SphereGeometry(0.014, 8, 6), brassM, 0, 0.06, 0); q(tl, new THREE.TorusGeometry(0.012, 0.004, 4, 8), ironM, 0, 0.0, 0);
        if (k === 0) q(tl, new THREE.TorusGeometry(0.025, 0.005, 4, 10, Math.PI), ironM, 0.025, -0.6, 0, 0, 0, Math.PI);   // (the poker's hook)
        else if (k === 1) q(tl, new THREE.BoxGeometry(0.1, 0.11, 0.008), ironM, 0, -0.64, 0, 0, a, 0);   // (the shovel)
        else { q(tl, new THREE.CylinderGeometry(0.005, 0.005, 0.55, 5), ironM, 0.012, -0.32, 0, 0, 0, 0.04); q(tl, new THREE.SphereGeometry(0.014, 6, 4), ironM, 0.02, -0.62, 0); } });   // (the tongs)
      // ---- the firewood stack ----
      var wood2 = [logM, [new THREE.MeshStandardMaterial({ map: barkT, color: 0xb8a088, roughness: 1 }), logM[1], logM[2]]];
      for (var lw = 0; lw < 9; lw++) { var row = lw < 4 ? 0 : lw < 7 ? 1 : 2, ix = row === 0 ? lw : row === 1 ? lw - 4 : lw - 7; q(R, new THREE.CylinderGeometry(0.055 + cr() * 0.012, 0.06, 0.46 + cr() * 0.06, 9), wood2[lw % 2], W - 0.3 + (cr() - 0.5) * 0.04, 0.06 + row * 0.1, 0.55 + ix * 0.11 + row * 0.055, 0, (cr() - 0.5) * 0.1, Math.PI / 2); }
      hideSolids.push([W - 0.35, 0.82, 0.3]);
      for (var kd = 0; kd < 8; kd++) quiet(q(R, new THREE.CylinderGeometry(0.008, 0.01, 0.35, 5), rMat(0x8a6a44, { roughness: 1 }), W - 0.62 + cr() * 0.08, 0.02 + kd * 0.005, 0.68 + kd * 0.04, Math.PI / 2 + (cr() - 0.5) * 0.3, cr(), 0));   // (kindling)
      // ---- on the mantel ----
      var MY = 1.48, bone = rMat(0xd8ccb0, { roughness: 0.8 }), dark = rMat(0x0a0806, { roughness: 1 });
      var sk = grp(W - 0.42, MY, FZ - 0.45, -Math.PI / 2 + 0.3);   // (the skull, a candle burning on its crown)
      q(sk, new THREE.SphereGeometry(0.072, 16, 12), bone, 0, 0.078, -0.01).scale.set(0.9, 0.95, 1.1); q(sk, new THREE.BoxGeometry(0.08, 0.045, 0.065), bone, 0, 0.033, 0.04); q(sk, new THREE.BoxGeometry(0.072, 0.03, 0.055), bone, 0, 0.009, 0.05, 0.15, 0, 0);
      [-1, 1].forEach(function (s) { q(sk, new THREE.SphereGeometry(0.02, 8, 6), dark, s * 0.027, 0.068, 0.056).scale.set(1, 0.9, 0.6); q(sk, new THREE.SphereGeometry(0.013, 6, 5), bone, s * 0.05, 0.05, 0.034); });
      q(sk, new THREE.ConeGeometry(0.009, 0.018, 3), dark, 0, 0.04, 0.07, Math.PI, 0, 0).scale.set(1, 1, 0.5); for (var tt = 0; tt < 8; tt++) { q(sk, new THREE.BoxGeometry(0.0075, 0.011, 0.006), rMat(0xe8dcc0), -0.026 + tt * 0.0075, 0.02, 0.077); q(sk, new THREE.BoxGeometry(0.0075, 0.01, 0.006), rMat(0xe0d4b8), -0.026 + tt * 0.0075, 0.007, 0.073); }
      candle(0, 0.15, -0.01, 0.07, sk);
      [[FZ - 0.05, 0.16], [FZ + 0.3, 0.11]].forEach(function (c) { var cs = grp(W - 0.42, MY, c[0], 0); q(cs, lbLathe([[0, 0], [0.045, 0], [0.045, 0.01], [0.02, 0.02], [0.014, 0.05], [0.02, 0.06], [0.012, 0.09], [0.022, 0.1], [0.024, 0.11], [0.018, 0.11], [0.015, 0.104], [0, 0.104]], 14), brassM, 0, 0, 0); candle(0, 0.104, 0, c[1], cs); });   // (brass candlesticks)
      [[FZ + 0.48, 0x5ad8a0, 0], [FZ + 0.62, 0xb04a6a, 1]].forEach(function (j) { var jg = grp(W - 0.42, MY, j[0], 0), prof = j[2] ? [[0, 0], [0.035, 0], [0.04, 0.06], [0.03, 0.1], [0.014, 0.12], [0.014, 0.14], [0, 0.14]] : [[0, 0], [0.042, 0], [0.046, 0.05], [0.032, 0.09], [0.02, 0.1], [0, 0.1]];   // (jars, corked and labelled)
        q(jg, lbLathe(prof, 14), new THREE.MeshStandardMaterial({ color: 0xd8e8e0, transparent: true, opacity: 0.35, roughness: 0.05, envMap: rubyEnv, depthWrite: false }), 0, 0, 0);
        q(jg, lbLathe(prof.map(function (p2) { return [p2[0] * 0.85, Math.min(p2[1], 0.06)]; }), 14), rMat(j[1], { emissive: j[1], emissiveIntensity: 0.25, roughness: 0.2 }), 0, 0.004, 0);
        q(jg, new THREE.CylinderGeometry(0.018, 0.016, 0.025, 8), rMat(0x8a6a4a, { roughness: 1 }), 0, prof[prof.length - 2][1] + 0.008, 0); quiet(q(jg, new THREE.PlaneGeometry(0.04, 0.03), rMat(0xe0d0a8, { roughness: 1 }), -0.044, 0.035, 0, 0, -Math.PI / 2, 0)); });
      var pipe = grp(W - 0.5, MY + 0.008, FZ + 0.12, 0.6); q(pipe, lbLathe([[0, 0], [0.016, 0.0], [0.019, 0.035], [0.015, 0.035], [0.012, 0.006], [0, 0.006]], 12), rMat(0xd8ccb8, { roughness: 0.7, side: THREE.DoubleSide }), 0, 0, 0); q(pipe, new THREE.CylinderGeometry(0.004, 0.005, 0.18, 6), rMat(0xd8ccb8, { roughness: 0.7 }), 0.09, 0.008, 0, 0, 0, Math.PI / 2 - 0.1);   // (a clay pipe)
      // ---- the antlers, on a carved plaque on the chimney breast ----
      var ant = grp(W - 0.305, 2.2, FZ, -Math.PI / 2), plq = new THREE.Shape(); plq.moveTo(0, 0.16); plq.quadraticCurveTo(0.12, 0.16, 0.13, 0.04); plq.quadraticCurveTo(0.12, -0.1, 0, -0.17); plq.quadraticCurveTo(-0.12, -0.1, -0.13, 0.04); plq.quadraticCurveTo(-0.12, 0.16, 0, 0.16);
      q(ant, new THREE.ExtrudeGeometry(plq, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.01, bevelSegments: 2 }), mantM, 0, 0, 0);
      q(ant, new THREE.SphereGeometry(0.06, 12, 10), bone, 0, 0.02, 0.07).scale.set(1, 0.9, 1); var snout = q(ant, new THREE.CylinderGeometry(0.025, 0.04, 0.12, 10), bone, 0, -0.05, 0.1, 0.6, 0, 0); [-1, 1].forEach(function (s) { q(ant, new THREE.SphereGeometry(0.014, 6, 5), dark, s * 0.03, 0.03, 0.12); });
      [-1, 1].forEach(function (s) { var c = new THREE.CatmullRomCurve3([new THREE.Vector3(s * 0.035, 0.06, 0.08), new THREE.Vector3(s * 0.12, 0.12, 0.11), new THREE.Vector3(s * 0.22, 0.25, 0.12), new THREE.Vector3(s * 0.28, 0.42, 0.1), new THREE.Vector3(s * 0.27, 0.52, 0.08)]);
        q(ant, new THREE.TubeGeometry(c, 20, 0.014, 6), bone, 0, 0, 0); q(ant, new THREE.TorusGeometry(0.018, 0.008, 5, 10), bone, s * 0.04, 0.065, 0.08, 0, Math.PI / 2, 0);   // (the beam, a burr at its base)
        [[0.15, 0.1, 0.5], [0.4, 0.13, 0.3], [0.62, 0.12, 0.1], [0.8, 0.09, -0.1]].forEach(function (t) { var pt = c.getPoint(t[0]), tc = new THREE.QuadraticBezierCurve3(pt, new THREE.Vector3(pt.x + s * t[1] * 0.3, pt.y + t[1] * 0.6, pt.z + 0.04), new THREE.Vector3(pt.x + s * t[1] * t[2], pt.y + t[1], pt.z + 0.06)); q(ant, new THREE.TubeGeometry(tc, 8, 0.008, 5), bone, 0, 0, 0); }); });   // (tines)
      // ---- herbs drying from the mantel ----
      var herbs = [[0x6a8a4a, 'leaf'], [0x8a6aa8, 'spike'], [0x8a7a4a, 'leaf'], [0xc8a040, 'flower'], [0x5a7a3a, 'leaf']], twine = rMat(0x9a7a4a, { roughness: 1 });
      herbs.forEach(function (hb, k) { var hz = FZ - 0.78 + k * 0.38, hg = grp(FRONT - 0.13, 1.36, hz, 0); q(hg, new THREE.CylinderGeometry(0.0018, 0.0018, 0.08, 3), twine, 0, -0.04, 0); q(hg, new THREE.TorusGeometry(0.014, 0.004, 4, 10), twine, 0, -0.09, 0, Math.PI / 2, 0, 0);
        var hm = rMat(hb[0], { roughness: 0.9, side: THREE.DoubleSide }), stem = rMat(0x5a5a30, { roughness: 1 });
        for (var s = 0; s < 9; s++) { var a = s / 9 * Math.PI * 2, sp = 0.02 + cr() * 0.02, sl = 0.14 + cr() * 0.06, st = grp(0, -0.09, 0, 0, hg); st.rotation.set(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2);
          quiet(q(st, new THREE.CylinderGeometry(0.0015, 0.0015, sl, 3), stem, 0, -sl / 2, 0));
          for (var lf = 0; lf < 4; lf++) { var ly = -0.02 - lf * sl / 4.5;
            if (hb[1] === 'spike') quiet(q(st, new THREE.SphereGeometry(0.006, 5, 4), hm, 0, ly - 0.02, 0)).scale.set(1, 2.4, 1);
            else if (hb[1] === 'flower') { if (lf === 3) quiet(q(st, new THREE.SphereGeometry(0.012, 6, 5), hm, 0, -sl, 0)); else quiet(q(st, new THREE.SphereGeometry(0.005, 5, 4), rMat(0x5a7a3a), 0.008, ly, 0)).scale.set(2, 0.6, 1); }
            else quiet(q(st, new THREE.SphereGeometry(0.008, 5, 4), hm, (lf % 2 ? 1 : -1) * 0.008, ly, 0, 0, a, lf % 2 ? 0.6 : -0.6)).scale.set(0.5, 1.8, 0.2); } } });
      // ---- the target dummy ----
      var TD = grp(2.5, 0, 0.9, -0.9), postM = new THREE.MeshStandardMaterial({ map: grainT('#3a2818', true), roughness: 0.85 });
      [0, Math.PI / 2].forEach(function (r) { q(TD, new THREE.BoxGeometry(0.56, 0.06, 0.07), postM, 0, 0.035, 0, 0, r, 0); }); [0, 1, 2, 3].forEach(function (k) { var a = k * Math.PI / 2; q(TD, new THREE.BoxGeometry(0.03, 0.2, 0.04), postM, Math.cos(a) * 0.1, 0.12, Math.sin(a) * 0.1, Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8); });   // (crossed feet, braced)
      q(TD, lbLathe([[0.045, 0.06], [0.05, 0.12], [0.04, 0.16], [0.04, 1.2], [0, 1.2]], 10), postM, 0, 0, 0);
      var strawT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#b8984e'; g.fillRect(0, 0, w, h); for (var i = 0; i < 700; i++) { var x = cr() * w, y = cr() * h, l = 6 + cr() * 14; g.strokeStyle = cr() < 0.5 ? 'rgba(230,200,120,0.6)' : 'rgba(110,80,30,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (cr() - 0.5) * 3, y + l); g.stroke(); } }, [3, 1]);
      var strawM = new THREE.MeshStandardMaterial({ map: strawT, bumpMap: strawT, bumpScale: 0.004, roughness: 1 }), ropeM = rMat(0x8a6a3a, { roughness: 1 });
      var bodyG = lbLathe([[0.16, 0.78], [0.19, 0.86], [0.205, 1.0], [0.2, 1.15], [0.18, 1.28], [0.12, 1.33], [0.06, 1.35]], 20), bp = bodyG.attributes.position; for (var bi = 0; bi < bp.count; bi++) { var a2 = Math.atan2(bp.getZ(bi), bp.getX(bi)), f = 1 + Math.sin(a2 * 7 + bp.getY(bi) * 20) * 0.04; bp.setX(bi, bp.getX(bi) * f); bp.setZ(bi, bp.getZ(bi) * f); } bodyG.computeVertexNormals();
      q(TD, bodyG, strawM, 0, 0, 0);
      [0.85, 1.02, 1.2].forEach(function (by) { q(TD, new THREE.TorusGeometry(by === 1.02 ? 0.207 : 0.198, 0.01, 5, 20), ropeM, 0, by, 0, Math.PI / 2, 0, 0); });
      q(TD, new THREE.CylinderGeometry(0.04, 0.045, 0.82, 10), strawM, 0, 1.2, 0, 0, 0, Math.PI / 2); [-1, 1].forEach(function (s) { q(TD, new THREE.TorusGeometry(0.043, 0.007, 4, 12), ropeM, s * 0.36, 1.2, 0, 0, Math.PI / 2, 0); for (var sw = 0; sw < 7; sw++) quiet(q(TD, new THREE.CylinderGeometry(0.003, 0.003, 0.08, 3), rMat(0xd8b868), s * (0.43 + cr() * 0.02), 1.2 + (cr() - 0.5) * 0.06, (cr() - 0.5) * 0.06, (cr() - 0.5) * 0.6, 0, s * (Math.PI / 2 + (cr() - 0.5) * 0.6))); });   // (arms, tied off at the ends, straw sprouting)
      var sackT = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#9a8460'; g.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 2) { g.fillStyle = 'rgba(50,36,18,' + (y % 4 ? 0.1 : 0.2) + ')'; g.fillRect(0, y, w, 1); } for (var x = 0; x < w; x += 2) { g.fillStyle = 'rgba(50,36,18,0.1)'; g.fillRect(x, 0, 1, h); } });
      var faceT = cpTex(128, 64, function (g, w, h) { g.fillStyle = '#9a8460'; g.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 2) { g.fillStyle = 'rgba(50,36,18,' + (y % 4 ? 0.1 : 0.2) + ')'; g.fillRect(0, y, w, 1); } g.strokeStyle = '#2a1a10'; g.lineWidth = 2.5; [[52, 24], [76, 24]].forEach(function (e) { g.beginPath(); g.moveTo(e[0] - 5, e[1] - 5); g.lineTo(e[0] + 5, e[1] + 5); g.moveTo(e[0] + 5, e[1] - 5); g.lineTo(e[0] - 5, e[1] + 5); g.stroke(); });   // (stitched X eyes, a stitched mouth)
        g.lineWidth = 1.5; g.beginPath(); g.moveTo(50, 42); g.quadraticCurveTo(64, 48, 78, 42); g.stroke(); for (var s = 0; s < 6; s++) { g.beginPath(); g.moveTo(52 + s * 5, 39); g.lineTo(52 + s * 5, 47); g.stroke(); } });
      q(TD, new THREE.SphereGeometry(0.13, 16, 12), [new THREE.MeshStandardMaterial({ map: faceT, roughness: 1 })][0], 0, 1.47, 0, 0, -Math.PI / 2, 0).scale.set(1, 1.08, 1);
      q(TD, new THREE.TorusGeometry(0.06, 0.012, 5, 14), ropeM, 0, 1.36, 0, Math.PI / 2, 0, 0); quiet(q(TD, new THREE.ConeGeometry(0.07, 0.07, 10, 1, true), new THREE.MeshStandardMaterial({ map: sackT, roughness: 1, side: THREE.DoubleSide }), 0, 1.61, 0, 0, 0, 0.3));   // (the sack tied at the neck, its top gathered)
      var tgT = cpTex(128, 128, function (g, w, h) { g.clearRect(0, 0, w, h); [[60, '#e8dcc0'], [46, '#a8242a'], [32, '#e8dcc0'], [18, '#a8242a'], [6, '#e8dcc0']].forEach(function (r) { g.fillStyle = r[1]; g.beginPath(); g.arc(64, 64, r[0], 0, Math.PI * 2); g.fill(); });   // (a painted target, flaking)
        g.globalCompositeOperation = 'destination-out'; for (var i = 0; i < 40; i++) { g.beginPath(); g.arc(cr() * w, cr() * h, 1 + cr() * 4, 0, 6.28); g.fill(); } g.globalCompositeOperation = 'source-over'; });
      quiet(q(TD, new THREE.CircleGeometry(0.15, 24), new THREE.MeshStandardMaterial({ map: tgT, transparent: true, roughness: 1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), 0, 1.06, 0.207));
      var shaftM = rMat(0x9a7a4a), fletch = [0xe8e0d0, 0xa82222, 0x2a2a2a].map(function (c) { return rMat(c, { side: THREE.DoubleSide, roughness: 0.9 }); });
      [[0.02, 1.07, -0.1, 0.1], [-0.08, 1.15, 0.15, -0.1], [0.05, 1.47, 0.05, 0.3], [-0.05, 0.97, 0.0, -0.2], [0.1, 1.0, 0.1, 0.25]].forEach(function (a, k) { var ar = grp(a[0], a[1], 0.18, 0, TD); ar.rotation.set(a[2], a[3], 0);
        q(ar, new THREE.CylinderGeometry(0.0045, 0.0045, 0.45, 5), shaftM, 0, 0, 0.22, Math.PI / 2, 0, 0); q(ar, new THREE.CylinderGeometry(0.006, 0.005, 0.014, 6), rMat(0x1a1410), 0, 0, 0.445, Math.PI / 2, 0, 0);
        for (var f2 = 0; f2 < 3; f2++) { var fa = f2 / 3 * Math.PI * 2; quiet(q(ar, new THREE.PlaneGeometry(0.016, 0.07), fletch[k % 3], Math.cos(fa) * 0.011, Math.sin(fa) * 0.011, 0.4, Math.PI / 2, 0, 0)).rotation.set(Math.PI / 2, fa, 0, 'YXZ'); }
        for (var sp = 0; sp < 4; sp++) quiet(q(ar, new THREE.CylinderGeometry(0.002, 0.002, 0.05, 3), rMat(0xd8b868), (cr() - 0.5) * 0.03, (cr() - 0.5) * 0.03, 0.01, Math.PI / 2 + (cr() - 0.5), 0, cr())); });   // (straw burst out round each arrow)
      // ---- the fire flickers; the brew bubbles ----
      updateCarpenter = (function (base) { return function (t, night) { base.apply(this, arguments); if (!inHide) return;
        flames.forEach(function (f) { var s = 0.85 + Math.sin(t * 13 + f.k * 1.7) * 0.12 + Math.sin(t * 29 + f.k) * 0.06; f.g.scale.set(1 + Math.sin(t * 7 + f.k) * 0.05, s, 1 + Math.cos(t * 9 + f.k) * 0.05); f.g.rotation.z = Math.sin(t * 5 + f.k * 2) * 0.08; });
        fg2.material.opacity = 0.48 + Math.sin(t * 11) * 0.06;
        bubbles.forEach(function (b) { var ph = (t * 0.7 + b.k) % 1; b.m.scale.setScalar(ph < 0.85 ? 0.3 + ph : Math.max(0.01, (1 - ph) * 7)); }); }; })(updateCarpenter);
    })();
    // (the back-right corner, in great detail: the bookshelf, of dark oak with a carved crown and plinth, plank back and lipped
    // shelves, crammed with old books (tooled spines, raised bands, gilt titles, some leaning, some stacked flat, a pair of iron
    // bookends), scroll piles tied with ribbon, a row of potion bottles corked and labelled, a little web in its top corner; on
    // top, a skull with its jaw and teeth, a candle stub melted onto it, and a glazed lidded jar; and the plank crates, nailed and
    // braced, the guild's mark daubed on them)
    (function () {
      var sd = 2333; function cr() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
      function q(par, geo, m, x, y, z, rx, ry, rz) { return cpPart(geo, m, x, y, z, rx, ry, rz, par); }
      function quiet(o) { o.castShadow = false; return o; }
      function grainT(base, vert, lines) { return cpTex(128, 128, function (g, w, h) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (var i = 0; i < (lines || 30); i++) { var o = (i * 41) % 128; g.strokeStyle = 'rgba(25,14,6,' + (0.12 + (i % 5) * 0.07).toFixed(2) + ')'; g.lineWidth = 0.6 + (i % 3) * 0.5; g.beginPath();
        for (var t = 0; t <= 128; t += 8) { var d = o + Math.sin(t / 128 * Math.PI * 2 + i) * 2.5; if (vert) { if (t) g.lineTo(d, t); else g.moveTo(d, t); } else { if (t) g.lineTo(t, d); else g.moveTo(t, d); } } g.stroke(); } }); }
      var wV = new THREE.MeshStandardMaterial({ map: grainT('#3a2818', true), roughness: 0.85 }), wH = new THREE.MeshStandardMaterial({ map: grainT('#4a3420', false), roughness: 0.85 }), ironM = rMat(0x24201e, { metalness: 0.6, roughness: 0.5 }), brassM = rMat(0xa8843e, { metalness: 0.8, roughness: 0.3, envMap: rubyEnv });
      var BKX = W - 0.22, BKZ = -2.3, sh = new THREE.Group(); sh.position.set(BKX, 0, BKZ); R.add(sh);   // (local: +x is the wall, -x faces the room, z along the wall)
      for (var pk = 0; pk < 6; pk++) q(sh, new THREE.BoxGeometry(0.02, 1.92, 0.196), wV, 0.19, 1.0, -0.5 + pk * 0.2, 0, 0, 0);   // (a back of six planks)
      [-0.585, 0.585].forEach(function (e) { q(sh, new THREE.BoxGeometry(0.4, 2.02, 0.035), wV, 0, 1.01, e); q(sh, new THREE.BoxGeometry(0.02, 1.9, 0.045), wV, -0.2, 1.0, e); });   // (sides, with a beaded front edge)
      q(sh, new THREE.BoxGeometry(0.44, 0.12, 1.24), wH, -0.01, 0.06, 0); q(sh, new THREE.BoxGeometry(0.45, 0.025, 1.25), wV, -0.015, 0.125, 0);   // (the plinth)
      [[2.02, 0.42, 1.22, 0.04], [2.06, 0.46, 1.27, 0.04], [2.1, 0.5, 1.32, 0.035]].forEach(function (c) { q(sh, new THREE.BoxGeometry(c[1], c[3], c[2]), wH, -(c[1] - 0.4) / 2, c[0], 0); });   // (the crown, stepping out)
      for (var dt = 0; dt < 12; dt++) q(sh, new THREE.BoxGeometry(0.02, 0.025, 0.04), wH, -0.225, 2.0 - 0.0, -0.55 + dt * 0.1);   // (dentils under it)
      var shelvesY = [0.14, 0.6, 1.08, 1.56];
      shelvesY.forEach(function (sy) { q(sh, new THREE.BoxGeometry(0.38, 0.03, 1.14), wH, -0.01, sy, 0); q(sh, new THREE.BoxGeometry(0.02, 0.04, 1.14), wH, -0.2, sy + 0.005, 0); });   // (shelves, a lip along each)
      [[2.1, -1], [2.1, 1]].forEach(function (c) { q(sh, new THREE.BoxGeometry(0.03, 0.08, 0.008), ironM, 0.17, c[0] - 0.08, c[1] * 0.6); });
      // (the books)
      var pageT = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#e0d0a8'; g.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 2) { g.fillStyle = 'rgba(120,90,50,' + (0.08 + cr() * 0.1).toFixed(2) + ')'; g.fillRect(0, y, w, 1); } });
      var pageM = new THREE.MeshStandardMaterial({ map: pageT, roughness: 1 });
      var cols = ['#5a1a1a', '#1a3a2a', '#2a2a4a', '#4a3a1a', '#3a1a3a', '#6a4a2a', '#2a1a12', '#1e2e3a'];
      var spines = cols.map(function (c, k) { var tex = cpTex(32, 128, function (g, w, h) { g.fillStyle = c; g.fillRect(0, 0, w, h); var sg = g.createLinearGradient(0, 0, w, 0); sg.addColorStop(0, 'rgba(0,0,0,0.45)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.08)'); sg.addColorStop(1, 'rgba(0,0,0,0.45)'); g.fillStyle = sg; g.fillRect(0, 0, w, h);
          [14, 40, 88, 114].forEach(function (by) { g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, by + 2, w, 2); g.fillStyle = 'rgba(255,240,210,0.18)'; g.fillRect(0, by, w, 2); });   // (raised bands)
          g.fillStyle = '#c8a04a'; for (var t = 0; t < 3; t++) g.fillRect(8 + (t % 2) * 3, 52 + t * 8, 13 - (t % 2) * 4, 2);   // (a gilt title)
          if (k % 3 === 0) { g.strokeStyle = '#c8a04a'; g.lineWidth = 1; g.beginPath(); g.arc(w / 2, 100, 5, 0, 6.28); g.stroke(); }
          for (var s = 0; s < 14; s++) { g.fillStyle = 'rgba(200,180,140,0.18)'; g.fillRect(cr() * w, cr() * h, 2, 1 + cr() * 3); } });   // (scuffed)
        var cov = rMat(new THREE.Color(c).getHex(), { roughness: 0.75 }), sp = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }); return [cov, sp, pageM, pageM, cov, cov]; });   // (spine faces the room; the page edges above and below)
      function book(x, y, z, d, hgt, wd, k, rx, rz) { return q(sh, new THREE.BoxGeometry(d, hgt, wd), spines[k % spines.length], x, y, z, rx || 0, 0, rz || 0); }
      shelvesY.forEach(function (sy, si) { var z = -0.52, k = si * 3, top = sy + 0.015;
        while (z < 0.52) {
          var r = cr();
          if (si === 1 && z > 0.05 && z < 0.2) {   // (a row of potion bottles)
            [[0x5ad8a0, 0], [0x8a3a6a, 1], [0xd8a03a, 2], [0x4a7ad8, 0]].forEach(function (b, bi) { var bz = z + bi * 0.075, px = -0.06;
              var prof = b[1] === 0 ? [[0, 0], [0.03, 0], [0.036, 0.04], [0.03, 0.09], [0.011, 0.11], [0.011, 0.15], [0, 0.15]] : b[1] === 1 ? [[0, 0], [0.022, 0], [0.024, 0.13], [0.01, 0.15], [0.01, 0.18], [0, 0.18]] : [[0, 0], [0.034, 0], [0.036, 0.05], [0.02, 0.07], [0.012, 0.09], [0.012, 0.11], [0, 0.11]];
              q(sh, lbLathe(prof, 14), new THREE.MeshStandardMaterial({ color: 0xd8e8e0, transparent: true, opacity: 0.35, roughness: 0.05, envMap: rubyEnv, depthWrite: false }), px, top, bz);
              var liq = prof.map(function (p2) { return [p2[0] * 0.85, Math.min(p2[1], prof[prof.length - 2][1] * 0.55)]; }); q(sh, lbLathe(liq, 14), rMat(b[0], { emissive: b[0], emissiveIntensity: 0.25, roughness: 0.2, transparent: true, opacity: 0.85 }), px, top + 0.004, bz);
              var nh = prof[prof.length - 2][1]; q(sh, new THREE.CylinderGeometry(0.012, 0.01, 0.025, 8), rMat(0x8a6a4a, { roughness: 1 }), px, top + nh + 0.005, bz);
              quiet(q(sh, new THREE.PlaneGeometry(0.03, 0.025), rMat(0xe0d0a8, { roughness: 1 }), px - (b[1] === 1 ? 0.026 : 0.037), top + 0.045, bz, 0, -Math.PI / 2, 0)); });
            z += 0.32; continue; }
          if (si === 3 && z > -0.2 && z < -0.05 || si === 0 && z > 0.25 && z < 0.4) {   // (a pile of scrolls tied with ribbon)
            for (var sc = 0; sc < 6; sc++) { var row = sc < 3 ? 0 : sc < 5 ? 1 : 2, ix = row === 0 ? sc : row === 1 ? sc - 3 : 0, sy2 = top + 0.03 + row * 0.052, szz = z + 0.03 + ix * 0.06 + row * 0.03;
              q(sh, new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12), rMat([0xe0d0a8, 0xd8c8a0, 0xe8dcb8][sc % 3], { roughness: 1 }), -0.04, sy2, szz, 0, 0, Math.PI / 2);
              q(sh, new THREE.TorusGeometry(0.031, 0.004, 4, 12), rMat([0x8a1a20, 0x2a4a2a, 0x8a6a2a][sc % 3]), -0.04, sy2, szz, 0, Math.PI / 2, 0);
              q(sh, new THREE.CircleGeometry(0.026, 12), rMat(0xc8b890, { roughness: 1 }), -0.191, sy2, szz, 0, -Math.PI / 2, 0); }
            z += 0.24; continue; }
          if (r < 0.12 && z < 0.35) {   // (a few lying flat in a stack)
            var nb = 3 + Math.floor(cr() * 2), yy = top;
            for (var s = 0; s < nb; s++) { var bh2 = 0.035 + cr() * 0.02; book(-0.05 + (cr() - 0.5) * 0.02, yy + bh2 / 2, z + 0.11, 0.24 + cr() * 0.04, bh2, 0.2 - s * 0.012, k++, 0, 0).rotation.y = (cr() - 0.5) * 0.15; yy += bh2; }
            z += 0.24; continue; }
          if (r < 0.2 && si !== 1) { q(sh, new THREE.BoxGeometry(0.12, 0.16, 0.012), ironM, -0.08, top + 0.08, z + 0.006); q(sh, new THREE.BoxGeometry(0.12, 0.012, 0.08), ironM, -0.08, top + 0.006, z + 0.04); z += 0.02; continue; }   // (an iron bookend)
          var bw = 0.03 + cr() * 0.045, bh = 0.24 + cr() * 0.15, bd = 0.22 + cr() * 0.08, lean = cr() < 0.12 ? 0.22 : 0;
          book(-0.19 + bd / 2 + cr() * 0.025, top + bh / 2 + (lean ? -0.01 : 0), z + bw / 2 + lean * 0.12, bd, bh, bw, k++, lean, 0);
          z += bw + 0.004 + lean * 0.2; } });
      var webT = cpTex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(225,225,235,0.5)'; g.lineWidth = 0.8; for (var a = 0; a < 7; a++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a / 6 * Math.PI / 2) * 64, Math.sin(a / 6 * Math.PI / 2) * 64); g.stroke(); } for (var r2 = 8; r2 < 64; r2 += 6 + cr() * 4) { g.beginPath(); g.arc(0, 0, r2, 0.05, Math.PI / 2 - 0.05); g.stroke(); } });
      quiet(q(sh, new THREE.PlaneGeometry(0.25, 0.25), new THREE.MeshBasicMaterial({ map: webT, transparent: true, depthWrite: false, side: THREE.DoubleSide }), -0.05, 1.86, 0.44, 0, Math.PI / 2, Math.PI));   // (a small web in its top corner)
      // (on top: the skull, a candle stub melted onto it, and a glazed jar)
      var bone = rMat(0xd8ccb0, { roughness: 0.8 }), dark = rMat(0x0a0806, { roughness: 1 }), sk = new THREE.Group(); sk.position.set(-0.05, 2.12, 0.3); sk.rotation.y = -Math.PI / 2 - 0.3; sh.add(sk);
      q(sk, new THREE.SphereGeometry(0.065, 16, 12), bone, 0, 0.07, -0.01).scale.set(0.9, 0.95, 1.1);
      q(sk, new THREE.BoxGeometry(0.075, 0.04, 0.06), bone, 0, 0.03, 0.035); q(sk, new THREE.BoxGeometry(0.068, 0.03, 0.05), bone, 0, 0.008, 0.045, 0.15, 0, 0);   // (cheekbones and the jaw)
      [-1, 1].forEach(function (s) { q(sk, new THREE.SphereGeometry(0.018, 8, 6), dark, s * 0.024, 0.06, 0.05).scale.set(1, 0.9, 0.6); q(sk, new THREE.SphereGeometry(0.012, 6, 5), bone, s * 0.045, 0.045, 0.03); });
      q(sk, new THREE.ConeGeometry(0.008, 0.016, 3), dark, 0, 0.036, 0.064, Math.PI, 0, 0).scale.set(1, 1, 0.5);
      for (var tt = 0; tt < 8; tt++) { q(sk, new THREE.BoxGeometry(0.007, 0.01, 0.006), rMat(0xe8dcc0), -0.0245 + tt * 0.007, 0.018, 0.07); q(sk, new THREE.BoxGeometry(0.007, 0.009, 0.006), rMat(0xe0d4b8), -0.0245 + tt * 0.007, 0.006, 0.066); }   // (teeth)
      var wax = rMat(0xe4d8b8, { roughness: 0.6 }); q(sk, new THREE.CylinderGeometry(0.018, 0.02, 0.04, 10), wax, 0, 0.15, -0.01); q(sk, new THREE.CylinderGeometry(0.0015, 0.0015, 0.012, 4), rMat(0x141010), 0, 0.176, -0.01);
      for (var dd = 0; dd < 6; dd++) { var da = dd * 1.05; quiet(q(sk, new THREE.SphereGeometry(0.007, 6, 5), wax, Math.cos(da) * 0.035, 0.11 - (dd % 3) * 0.02, -0.01 + Math.sin(da) * 0.04)).scale.set(0.8, 3, 0.8); }   // (wax run down over the skull)
      var jarT = cpTex(128, 64, function (g, w, h) { g.fillStyle = '#3a4a3a'; g.fillRect(0, 0, w, h); [[14, '#c8b890'], [22, '#2a2420'], [44, '#c8b890']].forEach(function (b) { g.fillStyle = b[1]; g.fillRect(0, b[0], w, 3); }); for (var i = 0; i < 8; i++) { g.strokeStyle = '#c8b890'; g.lineWidth = 1.5; g.beginPath(); g.arc(i * 16 + 8, 33, 5, 0, Math.PI); g.stroke(); } for (i = 0; i < 80; i++) { g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(cr() * w, cr() * h, 2, 1); } });
      var jar = new THREE.Group(); jar.position.set(-0.05, 2.12, -0.32); sh.add(jar); var jm = new THREE.MeshStandardMaterial({ map: jarT, roughness: 0.25, envMap: rubyEnv, envMapIntensity: 0.5 });
      q(jar, lbLathe([[0, 0], [0.06, 0], [0.075, 0.04], [0.08, 0.1], [0.065, 0.16], [0.045, 0.18], [0.045, 0.2], [0, 0.2]], 20), jm, 0, 0, 0); q(jar, lbLathe([[0, 0], [0.05, 0], [0.052, 0.012], [0.03, 0.03], [0.012, 0.035], [0.014, 0.05], [0, 0.055]], 16), jm, 0, 0.2, 0);
      // (the crates)
      var plankM = new THREE.MeshStandardMaterial({ map: grainT('#6a5034', false), roughness: 0.9 }), postM = new THREE.MeshStandardMaterial({ map: grainT('#4a3420', true), roughness: 0.9 }), nailM = rMat(0x1c1a18, { metalness: 0.6, roughness: 0.5 });
      var markT = cpTex(128, 128, function (g, w, h) { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(20,14,10,0.85)'; g.fillStyle = 'rgba(20,14,10,0.85)'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(60, 64, 40, Math.PI * 0.3, Math.PI * 1.7); g.stroke(); g.beginPath(); g.moveTo(72, 22); g.quadraticCurveTo(96, 62, 70, 108); g.quadraticCurveTo(80, 62, 66, 26); g.closePath(); g.fill(); for (var i = 0; i < 30; i++) g.clearRect(cr() * w, cr() * h, 2 + cr() * 5, 1 + cr() * 3); });
      var markM = new THREE.MeshStandardMaterial({ map: markT, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
      function crate(x, z, s, ry) { var c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; R.add(c); var ph = (s - 0.012) / 3 - 0.008;
        for (var f = 0; f < 4; f++) { var fg = new THREE.Group(); fg.rotation.y = f * Math.PI / 2; c.add(fg);
          for (var k = 0; k < 3; k++) { var py = 0.006 + ph / 2 + k * (ph + 0.008); q(fg, new THREE.BoxGeometry(s - 0.04, ph, 0.016), plankM, 0, py, s / 2 - 0.008, 0, 0, (cr() - 0.5) * 0.01);
            [-1, 1].forEach(function (e) { q(fg, new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 6), nailM, e * (s / 2 - 0.045), py, s / 2 + 0.001, Math.PI / 2, 0, 0); }); }
          var dl = Math.hypot(s - 0.12, s - 0.08); q(fg, new THREE.BoxGeometry(0.055, dl, 0.014), postM, 0, s / 2, s / 2 + 0.012, 0, 0, Math.atan2(s - 0.12, s - 0.08) * (f % 2 ? 1 : -1));
          if (f % 2 === 0) quiet(q(fg, new THREE.PlaneGeometry(s * 0.45, s * 0.45), markM, s * 0.18, s * 0.52, s / 2 + 0.021, 0, 0, (cr() - 0.5) * 0.3)); }
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (e) { q(c, new THREE.BoxGeometry(0.045, s, 0.045), postM, e[0] * (s / 2 - 0.022), s / 2, e[1] * (s / 2 - 0.022)); });
        for (var lp = 0; lp < 3; lp++) q(c, new THREE.BoxGeometry(s, 0.018, s / 3 - 0.008), plankM, 0, s + 0.009, -s / 3 + lp * s / 3);
        [-1, 1].forEach(function (e) { q(c, new THREE.BoxGeometry(0.05, 0.016, s - 0.02), postM, e * (s / 2 - 0.06), s + 0.026, 0); });
        return c; }
      crate(W - 1.2, -D + 0.45, 0.55, 0.05); crate(W - 0.5, D - 0.6, 0.6, 0.2);
      var lan = new THREE.Group(); lan.position.set(W - 1.1, 0.572, -D + 0.42); R.add(lan);   // (on the crate: a coil of rope and an oil can)
      var rope = rMat(0x9a7a4a, { roughness: 1 }); for (var rc = 0; rc < 4; rc++) q(lan, new THREE.TorusGeometry(0.1 - rc * 0.004, 0.012, 6, 24), rope, -0.05, 0.012 + rc * 0.022, 0.0, Math.PI / 2, 0, 0);
      q(lan, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.05, 0.08, 0), new THREE.Vector3(0.12, 0.05, 0.05), new THREE.Vector3(0.18, -0.1, 0.12), new THREE.Vector3(0.2, -0.3, 0.2)]), 12, 0.012, 6), rope, 0, 0, 0);
      q(lan, lbLathe([[0, 0], [0.05, 0], [0.05, 0.1], [0.02, 0.13], [0.006, 0.18], [0, 0.18]], 14), rMat(0x5a5a50, { metalness: 0.6, roughness: 0.5 }), 0.15, 0, -0.12);
    })();
    hideSolids.push([(W - 0.22) - 0.1, (-2.3) - 0.4, 0.35], [(W - 0.22) - 0.1, (-2.3) + 0.4, 0.35]);
    hideSolids.push([2.3, -2.4, 0.35]);
    // (the back wall, in great detail: the Errand Board in a heavy pegged frame with iron corners, a carved ERRANDS plaque, old
    // cork pocked with pin holes and torn scraps, nine notices of every sort on brass tacks, a red thread sagging pin to pin, a
    // dagger through one, a ledge of pins, chalk and rolled notices; an iron lantern hanging on a chain from a scrolled bracket;
    // the guild's name carved and gilded on a plank hung from chains; the lectern, turned and footed, its ledger open with a
    // ribbon, an inkpot and quill beside it; and the armour stand: leather cuirass, layered pauldrons, belt and pouches, a heavy
    // hooded cloak in folds, a sheathed short sword)
    (function () {
      var sd = 1777; function cr() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
      function q(par, geo, m, x, y, z, rx, ry, rz) { return cpPart(geo, m, x, y, z, rx, ry, rz, par); }
      function quiet(o) { o.castShadow = false; return o; }
      function grp(x, y, z, ry, par) { var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; (par || R).add(g); return g; }
      function grainT(base, vert) { return cpTex(128, 128, function (g, w, h) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (var i = 0; i < 30; i++) { var o = (i * 41) % 128; g.strokeStyle = 'rgba(25,14,6,' + (0.12 + (i % 5) * 0.07).toFixed(2) + ')'; g.lineWidth = 0.6 + (i % 3) * 0.5; g.beginPath();
        for (var t = 0; t <= 128; t += 8) { var d = o + Math.sin(t / 128 * Math.PI * 2 + i) * 2.5; if (vert) { if (t) g.lineTo(d, t); else g.moveTo(d, t); } else { if (t) g.lineTo(t, d); else g.moveTo(t, d); } } g.stroke(); } }); }
      var frH = new THREE.MeshStandardMaterial({ map: grainT('#3e2a18', false), roughness: 0.85 }), frV = new THREE.MeshStandardMaterial({ map: grainT('#3e2a18', true), roughness: 0.85 });
      var ironM = rMat(0x24201e, { metalness: 0.6, roughness: 0.5 }), brassM = rMat(0xa8843e, { metalness: 0.8, roughness: 0.3, envMap: rubyEnv }), steelM = rMat(0xc0c4ca, { metalness: 0.92, roughness: 0.22, envMap: rubyEnv });
      var BX = HD_BOARD[0], BZ = -D + 0.06, BY = 1.55;
      // ---- the board ----
      [[0, 0.7, 2.14, 0.12], [0, -0.7, 2.14, 0.12]].forEach(function (b) { q(R, new THREE.BoxGeometry(b[2], b[3], 0.1), frH, BX, BY + b[1], BZ); });
      [-1.03, 1.03].forEach(function (bx) { q(R, new THREE.BoxGeometry(0.12, 1.52, 0.1), frV, BX + bx, BY, BZ); });
      q(R, new THREE.BoxGeometry(1.96, 1.3, 0.04), rMat(0x2a1c10, { roughness: 1 }), BX, BY, BZ - 0.02);
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (c) { var cx = BX + c[0] * 1.02, cy = BY + c[1] * 0.69;   // (iron corner plates, riveted; pegs through the joints)
        q(R, new THREE.BoxGeometry(0.16, 0.035, 0.006), ironM, cx - c[0] * 0.04, cy + c[1] * 0.02, BZ + 0.053); q(R, new THREE.BoxGeometry(0.035, 0.16, 0.006), ironM, cx + c[0] * 0.02, cy - c[1] * 0.04, BZ + 0.053);
        [[-0.08, 0.02], [0.02, -0.08], [0.02, 0.02]].forEach(function (o) { q(R, new THREE.SphereGeometry(0.007, 6, 4), ironM, cx + c[0] * o[0], cy + c[1] * o[1], BZ + 0.058); }); });
      var corkT = cpTex(512, 340, function (g, w, h) { g.fillStyle = '#9a7048'; g.fillRect(0, 0, w, h); var i;   // (old cork: granules, pin holes, staining, scraps of torn notices left behind)
        for (i = 0; i < 9000; i++) { var c = 0.6 + cr() * 0.6; g.fillStyle = 'rgba(' + Math.round(150 * c) + ',' + Math.round(104 * c) + ',' + Math.round(64 * c) + ',0.7)'; g.beginPath(); g.arc(cr() * w, cr() * h, 0.8 + cr() * 1.8, 0, 6.28); g.fill(); }
        for (i = 0; i < 400; i++) { g.fillStyle = 'rgba(30,18,8,0.8)'; g.fillRect(cr() * w, cr() * h, 1.5, 1.5); }
        for (i = 0; i < 12; i++) { var bx = cr() * w, by = cr() * h, br = 30 + cr() * 60, bg = g.createRadialGradient(bx, by, 2, bx, by, br); bg.addColorStop(0, 'rgba(50,30,14,0.3)'); bg.addColorStop(1, 'rgba(50,30,14,0)'); g.fillStyle = bg; g.fillRect(bx - br, by - br, br * 2, br * 2); }
        for (i = 0; i < 7; i++) { var sx = cr() * w, sy = 60 + cr() * (h - 80); g.fillStyle = 'rgba(225,212,180,0.85)'; g.beginPath(); g.moveTo(sx, sy); for (var k = 0; k < 6; k++) g.lineTo(sx + (cr() - 0.3) * 24, sy + (cr() - 0.3) * 18); g.closePath(); g.fill(); g.fillStyle = '#5a5048'; g.beginPath(); g.arc(sx + 2, sy + 2, 1.8, 0, 6.28); g.fill(); }
        var vg = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.6); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,18,8,0.4)'); g.fillStyle = vg; g.fillRect(0, 0, w, h); });
      q(R, new THREE.PlaneGeometry(1.94, 1.28), new THREE.MeshStandardMaterial({ map: corkT, bumpMap: corkT, bumpScale: 0.004, roughness: 1 }), BX, BY, BZ + 0.0);
      var plaqT = cpTex(256, 64, function (g, w, h) { g.fillStyle = '#2a1a10'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a4a2a'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8);   // (the plaque: letters carved and gilded)
        g.font = 'bold 34px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#0c0805'; g.fillText('ERRANDS', w / 2 + 2, h / 2 + 3); g.fillStyle = '#d8b068'; g.fillText('ERRANDS', w / 2, h / 2 + 1);
        [18, w - 18].forEach(function (x) { g.fillStyle = '#b08a3a'; g.beginPath(); g.arc(x, h / 2, 4, 0, 6.28); g.fill(); }); });
      var plq = new THREE.Shape(); plq.moveTo(-0.32, -0.08); plq.lineTo(0.32, -0.08); plq.quadraticCurveTo(0.36, 0, 0.32, 0.08); plq.lineTo(-0.32, 0.08); plq.quadraticCurveTo(-0.36, 0, -0.32, -0.08);
      q(R, new THREE.ExtrudeGeometry(plq, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }), frH, BX, BY + 0.54, BZ + 0.005);
      quiet(q(R, new THREE.PlaneGeometry(0.62, 0.15), new THREE.MeshStandardMaterial({ map: plaqT, roughness: 0.7 }), BX, BY + 0.54, BZ + 0.0335));
      function paper(g, w, h, base) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (var i = 0; i < 8; i++) { var bx = cr() * w, by = cr() * h, br = 10 + cr() * 30, bg = g.createRadialGradient(bx, by, 1, bx, by, br); bg.addColorStop(0, 'rgba(140,100,50,0.15)'); bg.addColorStop(1, 'rgba(140,100,50,0)'); g.fillStyle = bg; g.fillRect(bx - br, by - br, br * 2, br * 2); }
        for (i = 0; i < 30; i++) { g.fillStyle = 'rgba(140,90,40,0.25)'; g.fillRect(cr() * w, cr() * h, 1.5, 1.5); } var eg = g.createLinearGradient(0, 0, 0, h); eg.addColorStop(0, 'rgba(110,70,30,0.2)'); eg.addColorStop(0.1, 'rgba(0,0,0,0)'); eg.addColorStop(0.9, 'rgba(0,0,0,0)'); eg.addColorStop(1, 'rgba(110,70,30,0.25)'); g.fillStyle = eg; g.fillRect(0, 0, w, h); }
      function hand(g, x0, y0, len, rows, gap) { g.strokeStyle = 'rgba(40,26,14,0.85)'; g.lineWidth = 1.3; for (var r = 0; r < rows; r++) { var L = len * (0.6 + cr() * 0.4); g.beginPath(); for (var x = 0; x < L; x += 2.5) { if (x % 26 < 2.5) g.moveTo(x0 + x, y0 + r * gap); else g.lineTo(x0 + x, y0 + r * gap + Math.sin(x * 1.1) * 2 + (x % 9 < 2.5 ? -3 : 0)); } g.stroke(); } }
      function torn(g, w, h) { g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(0, h); for (var x = 0; x <= w; x += 6) g.lineTo(x, h - 4 - cr() * 8); g.lineTo(w, h); g.closePath(); g.fill(); g.globalCompositeOperation = 'source-over'; }
      var noteDefs = [
        [-0.62, 1.78, 0.08, 0.34, 0.44, function (g, w, h) { paper(g, w, h, '#e8dcb8'); hand(g, 14, 30, 70, 9, 11); g.fillStyle = '#8a1e22'; g.beginPath(); g.arc(w - 18, h - 22, 8, 0, 6.28); g.fill(); torn(g, w, h); }],
        [-0.2, 1.42, -0.06, 0.32, 0.4, function (g, w, h) { paper(g, w, h, '#efe2c0'); g.strokeStyle = '#3a2416'; g.lineWidth = 2; g.beginPath(); g.moveTo(48, 20); g.lineTo(30, 48); g.lineTo(38, 48); g.lineTo(26, 74); g.lineTo(46, 54); g.lineTo(58, 54); g.lineTo(70, 74); g.lineTo(60, 48); g.lineTo(66, 48); g.closePath(); g.stroke(); g.fillStyle = '#b02a2a'; g.beginPath(); g.arc(42, 40, 2.5, 0, 6.28); g.arc(54, 40, 2.5, 0, 6.28); g.fill(); hand(g, 14, 92, 70, 3, 10); }],   // (a beast, sketched)
        [0.35, 1.72, 0.05, 0.36, 0.46, function (g, w, h) { paper(g, w, h, '#ddd0a8'); g.fillStyle = '#3a2416'; g.font = 'bold 14px Georgia, serif'; g.textAlign = 'center'; g.fillText('WANTED', w / 2, 18); g.strokeStyle = '#3a2416'; g.lineWidth = 2; g.strokeRect(18, 26, 60, 56);   // (the wanted poster: a hooded face, a reward)
          g.fillStyle = '#2a1c12'; g.beginPath(); g.moveTo(30, 80); g.quadraticCurveTo(30, 34, 48, 32); g.quadraticCurveTo(66, 34, 66, 80); g.closePath(); g.fill(); g.fillStyle = '#c8b890'; g.beginPath(); g.ellipse(48, 58, 9, 12, 0, 0, 6.28); g.fill(); g.fillStyle = '#2a1c12'; g.fillRect(42, 54, 4, 2); g.fillRect(50, 54, 4, 2); g.fillRect(45, 65, 6, 1.5);
          g.fillStyle = '#c8a040'; g.beginPath(); g.arc(30, 100, 7, 0, 6.28); g.fill(); g.fillStyle = '#3a2416'; g.font = 'bold 14px Georgia, serif'; g.fillText('500', 58, 105); hand(g, 14, 116, 66, 1, 8); }],
        [0.68, 1.36, -0.1, 0.3, 0.4, function (g, w, h) { paper(g, w, h, '#e4d6b0'); hand(g, 12, 22, 66, 8, 11); g.strokeStyle = '#8a1e22'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(10, 70); g.lineTo(86, 36); g.stroke(); torn(g, w, h); }],   // (a job, struck through: done)
        [-0.6, 1.22, 0.12, 0.3, 0.36, function (g, w, h) { paper(g, w, h, '#e8dcb8'); g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(10, 90); g.bezierCurveTo(30, 40, 60, 100, 86, 30); g.stroke(); g.setLineDash([3, 3]); g.strokeStyle = '#8a1e22'; g.beginPath(); g.moveTo(14, 84); g.quadraticCurveTo(40, 60, 72, 42); g.stroke(); g.setLineDash([]); g.lineWidth = 3; g.beginPath(); g.moveTo(68, 34); g.lineTo(80, 46); g.moveTo(80, 34); g.lineTo(68, 46); g.stroke(); }],   // (a scrap of map)
        [0.1, 1.15, 0.03, 0.34, 0.42, function (g, w, h) { paper(g, w, h, '#efe2c0'); hand(g, 14, 22, 70, 8, 11); g.strokeStyle = '#2a1c12'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(40, 112); g.bezierCurveTo(50, 100, 58, 118, 70, 104); g.stroke(); g.fillStyle = '#8a1e22'; g.beginPath(); g.arc(22, 110, 9, 0, 6.28); g.fill(); g.strokeStyle = '#5a0e10'; g.beginPath(); g.arc(22, 110, 5, 0, 6.28); g.stroke(); }],   // (a contract: signed, sealed)
        [-0.88, 1.5, -0.15, 0.2, 0.26, function (g, w, h) { paper(g, w, h, '#d8c8a0'); hand(g, 10, 20, 70, 6, 14); }],
        [0.82, 1.82, 0.2, 0.22, 0.24, function (g, w, h) { paper(g, w, h, '#e0d2aa'); for (var i = 0; i < 5; i++) { g.strokeStyle = '#3a2416'; g.lineWidth = 1.2; g.strokeRect(12, 18 + i * 20, 10, 10); if (i < 3) { g.beginPath(); g.moveTo(13, 24 + i * 20); g.lineTo(17, 27 + i * 20); g.lineTo(24, 16 + i * 20); g.stroke(); } } hand(g, 30, 24, 54, 5, 20); }],   // (a list, three of five ticked off)
        [-0.28, 1.86, 0.1, 0.26, 0.2, function (g, w, h) { paper(g, w, h, '#efe2c0'); hand(g, 10, 26, 76, 5, 12); torn(g, w, h); }]];
      var tackM = [0xb02a2a, 0x2a4ab0, 0xd8b030, 0x2a8a4a].map(function (c) { return rMat(c, { roughness: 0.35, metalness: 0.3 }); }), pinPts = [];
      noteDefs.forEach(function (n, k) { var t = cpTex(96, Math.round(96 * n[4] / n[3]), n[5]), pg = new THREE.PlaneGeometry(n[3], n[4], 6, 6), pp = pg.attributes.position;
        for (var i = 0; i < pp.count; i++) { var x = pp.getX(i), y = pp.getY(i), cu = Math.max(0, (x / (n[3] / 2) - 0.4) / 0.6) * Math.max(0, (-y / (n[4] / 2) - 0.4) / 0.6); pp.setZ(i, cu * cu * 0.05 * (k % 3 === 1 ? 1 : 0.4)); } pg.computeVertexNormals();   // (a lower corner lifting off the cork)
        var nm = quiet(q(R, pg, new THREE.MeshStandardMaterial({ map: t, roughness: 1, side: THREE.DoubleSide, alphaTest: 0.5 }), BX + n[0], n[1], BZ + 0.012 + k * 0.003, 0, 0, n[2]));
        var tx = BX + n[0] - Math.sin(n[2]) * (n[4] / 2 - 0.035), ty = n[1] + Math.cos(n[2]) * (n[4] / 2 - 0.035); pinPts.push([tx, ty]);
        q(R, new THREE.CylinderGeometry(0.014, 0.012, 0.012, 10), tackM[k % 4], tx, ty, BZ + 0.05, Math.PI / 2, 0, 0); q(R, new THREE.SphereGeometry(0.012, 8, 6), tackM[k % 4], tx, ty, BZ + 0.06).scale.set(1, 1, 0.6); });
      var thread = rMat(0xb01a20, { roughness: 0.8 });   // (red thread, sagging pin to pin)
      [[0, 1], [1, 2], [1, 5], [2, 3], [4, 5], [6, 4], [8, 2]].forEach(function (pr) { var a = pinPts[pr[0]], b = pinPts[pr[1]], m = new THREE.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.03, BZ + 0.064);
        q(R, new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(a[0], a[1], BZ + 0.064), m, new THREE.Vector3(b[0], b[1], BZ + 0.064)), 12, 0.0025, 4), thread, 0, 0, 0); });
      var dag = grp(BX + 0.86, 1.95, BZ + 0.04, 0); dag.rotation.set(0.35, 0, -0.5);   // (a dagger driven through the list into the cork)
      var ds = new THREE.Shape(); ds.moveTo(0, 0); ds.lineTo(0.009, 0.025); ds.lineTo(0.0095, 0.14); ds.lineTo(-0.0095, 0.14); ds.lineTo(-0.009, 0.025); ds.lineTo(0, 0);
      var dgeo = new THREE.ExtrudeGeometry(ds, { depth: 0.002, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0025, bevelSegments: 1 }); dgeo.translate(0, -0.1, -0.001); dgeo.rotateZ(Math.PI); q(dag, dgeo, steelM, 0, 0, 0);
      q(dag, new THREE.BoxGeometry(0.08, 0.012, 0.016), brassM, 0, 0.045, 0); q(dag, new THREE.CylinderGeometry(0.01, 0.011, 0.075, 8), rMat(0x3a2418, { roughness: 0.8 }), 0, 0.09, 0); q(dag, new THREE.SphereGeometry(0.014, 8, 6), brassM, 0, 0.135, 0);
      for (var wr = 0; wr < 6; wr++) q(dag, new THREE.TorusGeometry(0.011, 0.0015, 4, 10), brassM, 0, 0.06 + wr * 0.011, 0, Math.PI / 2 + 0.3, 0, 0);
      q(R, new THREE.BoxGeometry(1.9, 0.025, 0.09), frH, BX, BY - 0.64 - 0.06 + 0.07, BZ + 0.09);   // (a ledge along the foot of the board)
      [[-0.5, 0], [0.55, 0]].forEach(function (b) { q(R, new THREE.BoxGeometry(0.02, 0.06, 0.07), ironM, BX + b[0], BY - 0.66, BZ + 0.08); });
      var ly = BY - 0.63 + 0.0125;
      q(R, new THREE.CylinderGeometry(0.03, 0.03, 0.03, 14), rMat(0x5a5a60, { metalness: 0.6, roughness: 0.4 }), BX - 0.6, ly + 0.015, BZ + 0.09); for (var tk = 0; tk < 6; tk++) q(R, new THREE.SphereGeometry(0.007, 6, 4), tackM[tk % 4], BX - 0.6 + (cr() - 0.5) * 0.03, ly + 0.032, BZ + 0.09 + (cr() - 0.5) * 0.03);   // (a tin of tacks)
      q(R, new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6), rMat(0xe8e4d8, { roughness: 1 }), BX - 0.4, ly + 0.008, BZ + 0.09, 0, 0.4, Math.PI / 2);   // (a stub of chalk)
      [0, 1, 2].forEach(function (s) { q(R, new THREE.CylinderGeometry(0.018, 0.018, 0.22, 10), rMat([0xe0d0a8, 0xd8c8a0, 0xe8dcb8][s], { roughness: 1 }), BX + 0.35 + s * 0.04, ly + 0.018 + (s === 2 ? 0.03 : 0), BZ + 0.09 - (s === 2 ? 0 : 0), 0, 0.15 * s, Math.PI / 2); });   // (rolled notices)
      q(R, new THREE.TorusGeometry(0.019, 0.003, 4, 10), thread, BX + 0.39, ly + 0.018, BZ + 0.09, 0, Math.PI / 2, 0);
      // ---- the lantern over the board, hung on a chain from a scrolled iron bracket ----
      var lb = grp(BX, 2.5, BZ + 0.0, 0);
      q(lb, new THREE.BoxGeometry(0.06, 0.12, 0.012), ironM, 0, 0.02, 0.006); q(lb, new THREE.BoxGeometry(0.018, 0.018, 0.26), ironM, 0, 0.0, 0.13);
      q(lb, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.04, 0.01), new THREE.Vector3(0, -0.07, 0.08), new THREE.Vector3(0, -0.03, 0.16), new THREE.Vector3(0, 0, 0.22)]), 16, 0.006, 5), ironM, 0, 0, 0);   // (the bracket's brace)
      q(lb, new THREE.TorusGeometry(0.03, 0.005, 5, 12), ironM, 0, 0.0, 0.08); q(lb, new THREE.SphereGeometry(0.014, 8, 6), ironM, 0, 0, 0.265);
      for (var ch = 0; ch < 3; ch++) q(lb, new THREE.TorusGeometry(0.012, 0.003, 4, 10), ironM, 0, -0.02 - ch * 0.02, 0.24, 0, ch % 2 ? Math.PI / 2 : 0, 0);   // (chain links)
      var lt = grp(0, -0.29, 0.24, Math.PI / 4, lb), ltM = rMat(0xffd890, { emissive: 0xffb050, emissiveIntensity: 1.3 }); hdFlames.push(ltM);
      q(lt, new THREE.TorusGeometry(0.025, 0.005, 5, 12), ironM, 0, 0.245, 0); q(lt, new THREE.ConeGeometry(0.1, 0.08, 4), ironM, 0, 0.19, 0, 0, 0, 0); q(lt, new THREE.CylinderGeometry(0.02, 0.024, 0.03, 8), ironM, 0, 0.225, 0);
      q(lt, new THREE.BoxGeometry(0.15, 0.016, 0.15), ironM, 0, 0.0, 0); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { q(lt, new THREE.BoxGeometry(0.012, 0.15, 0.012), ironM, c[0] * 0.065, 0.08, c[1] * 0.065); });
      var lsoot = cpTex(32, 64, function (g, w, h) { var sg = g.createLinearGradient(0, 0, 0, h); sg.addColorStop(0, 'rgba(20,14,8,0.7)'); sg.addColorStop(0.35, 'rgba(60,40,20,0.2)'); sg.addColorStop(1, 'rgba(255,240,210,0.1)'); g.fillStyle = sg; g.fillRect(0, 0, w, h); });
      var lgl = new THREE.MeshStandardMaterial({ map: lsoot, transparent: true, depthWrite: false, roughness: 0.1, side: THREE.DoubleSide });
      for (var gp = 0; gp < 4; gp++) { var ga = gp * Math.PI / 2; quiet(q(lt, new THREE.PlaneGeometry(0.128, 0.14), lgl, Math.sin(ga) * 0.064, 0.08, Math.cos(ga) * 0.064, 0, ga, 0)); }
      q(lt, new THREE.CylinderGeometry(0.016, 0.017, 0.07, 10), rMat(0xece2c8, { roughness: 0.55, emissive: 0x5a3c18, emissiveIntensity: 0.6 }), 0, 0.043, 0); quiet(q(lt, new THREE.SphereGeometry(0.013, 8, 6), ltM, 0, 0.1, 0)).scale.set(1, 2, 1);
      hdHalo(lt, 0, 0.1, 0, 0.5);
      // ---- the guild's name: a thick plank, the letters carved deep and gilded, hung from chains ----
      var nameT = cpTex(1024, 160, function (g, w, h) { g.fillStyle = '#2e1e12'; g.fillRect(0, 0, w, h); for (var i = 0; i < 60; i++) { g.strokeStyle = 'rgba(15,8,3,0.4)'; g.lineWidth = 1; g.beginPath(); var yy = cr() * h; g.moveTo(0, yy); g.bezierCurveTo(w * 0.3, yy + (cr() - 0.5) * 10, w * 0.7, yy + (cr() - 0.5) * 10, w, yy + (cr() - 0.5) * 6); g.stroke(); }
        g.strokeStyle = '#7a5a34'; g.lineWidth = 5; g.strokeRect(10, 10, w - 20, h - 20); g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 2; g.strokeRect(17, 17, w - 34, h - 34);
        g.font = 'bold 70px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#0a0604'; g.fillText('THE HOLLOW FANG', w / 2 + 3, h / 2 + 6); g.fillStyle = '#d8b068'; g.fillText('THE HOLLOW FANG', w / 2, h / 2 + 2);
        g.fillStyle = 'rgba(255,240,200,0.35)'; g.fillText('THE HOLLOW FANG', w / 2 - 1, h / 2);
        hideSigil(g, 70, h / 2, 44, '#c8a04a', 7); hideSigil(g, 70, h / 2, 44, '#b0202a', 4); hideSigil(g, w - 70, h / 2, 44, '#c8a04a', 7); hideSigil(g, w - 70, h / 2, 44, '#b0202a', 4);
      });
      var nameEdge = new THREE.MeshStandardMaterial({ map: grainT('#2e1e12', false), roughness: 0.85 }), ng = grp(0, 2.68, -D + 0.07, 0); ng.rotation.z = -0.015;
      q(ng, new THREE.BoxGeometry(1.74, 0.28, 0.05), [nameEdge, nameEdge, nameEdge, nameEdge, new THREE.MeshStandardMaterial({ map: nameT, roughness: 0.75 }), nameEdge], 0, 0, 0);
      [-0.72, 0.72].forEach(function (cx) { q(ng, new THREE.BoxGeometry(0.06, 0.3, 0.008), ironM, cx, 0, 0.03); for (var c = 0; c < 4; c++) q(ng, new THREE.TorusGeometry(0.014, 0.0035, 4, 10), ironM, cx, 0.16 + c * 0.026, 0.0, 0, c % 2 ? Math.PI / 2 : 0, 0); q(ng, new THREE.CylinderGeometry(0.01, 0.01, 0.05, 6), ironM, cx, 0.26, -0.025, Math.PI / 2, 0, 0); });
      // ---- the lectern ----
      var lec = grp(1.25, 0, -D + 0.55, -0.4), lw = new THREE.MeshStandardMaterial({ map: grainT('#3a2818', true), roughness: 0.8 }), lwH = new THREE.MeshStandardMaterial({ map: grainT('#4a3420', false), roughness: 0.8 });
      q(lec, lbLathe([[0, 0], [0.12, 0], [0.12, 0.03], [0.08, 0.05], [0.05, 0.06]], 16), lw, 0, 0, 0);
      for (var ft = 0; ft < 4; ft++) { var fa = ft * Math.PI / 2 + Math.PI / 4; q(lec, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.05, 0), new THREE.Vector3(Math.cos(fa) * 0.12, 0.04, Math.sin(fa) * 0.12), new THREE.Vector3(Math.cos(fa) * 0.2, 0.012, Math.sin(fa) * 0.2)]), 10, 0.016, 6), lw, 0, 0, 0); q(lec, new THREE.SphereGeometry(0.02, 8, 6), lw, Math.cos(fa) * 0.2, 0.012, Math.sin(fa) * 0.2); }   // (four curled feet)
      q(lec, lbLathe([[0.045, 0.05], [0.04, 0.1], [0.05, 0.14], [0.032, 0.2], [0.028, 0.5], [0.036, 0.56], [0.026, 0.62], [0.03, 0.85], [0.042, 0.9], [0.05, 0.94], [0.03, 0.97], [0, 0.97]], 14), lw, 0, 0, 0);   // (the turned column)
      var top = grp(0, 1.0, 0, 0, lec); top.rotation.x = 0.45;
      q(top, new THREE.BoxGeometry(0.46, 0.03, 0.34), lwH, 0, 0, 0); q(top, new THREE.BoxGeometry(0.46, 0.035, 0.025), lwH, 0, 0.025, 0.17);   // (the desk, a lip along its foot)
      q(top, new THREE.BoxGeometry(0.06, 0.06, 0.2), lw, 0, -0.045, 0);
      var ledT = cpTex(256, 160, function (g, w, h) { g.fillStyle = '#ead8b0'; g.fillRect(0, 0, w, h); var i;   // (the ledger: columns of names, dates, sums, a few struck through, entries in red)
        g.strokeStyle = 'rgba(120,60,40,0.4)'; g.lineWidth = 1; for (i = 0; i < 2; i++) { var x0 = i * w / 2 + 10; g.beginPath(); g.moveTo(x0 + 80, 10); g.lineTo(x0 + 80, h - 10); g.stroke(); for (var r = 0; r < 12; r++) { g.beginPath(); g.moveTo(x0, 16 + r * 11.5); g.lineTo(x0 + 108, 16 + r * 11.5); g.stroke(); } }
        for (i = 0; i < 2; i++) { var xx = i * w / 2 + 12; for (var r2 = 0; r2 < 12; r2++) { g.strokeStyle = r2 % 5 === 3 ? 'rgba(150,20,20,0.85)' : 'rgba(40,26,14,0.85)'; g.lineWidth = 1.1; g.beginPath(); for (var x = 0; x < 50 + cr() * 20; x += 2.5) { if (x % 22 < 2.5) g.moveTo(xx + x, 13 + r2 * 11.5); else g.lineTo(xx + x, 13 + r2 * 11.5 + Math.sin(x) * 1.6); } g.stroke(); g.fillStyle = 'rgba(40,26,14,0.85)'; g.fillRect(xx + 84, 10 + r2 * 11.5, 10 + cr() * 8, 2); if (r2 % 4 === 1) { g.strokeStyle = 'rgba(40,26,14,0.7)'; g.beginPath(); g.moveTo(xx, 12 + r2 * 11.5); g.lineTo(xx + 66, 12 + r2 * 11.5); g.stroke(); } } }
        var sg = g.createLinearGradient(w / 2 - 14, 0, w / 2 + 14, 0); sg.addColorStop(0, 'rgba(0,0,0,0)'); sg.addColorStop(0.5, 'rgba(60,40,20,0.45)'); sg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = sg; g.fillRect(w / 2 - 14, 0, 28, h); });
      var cov = rMat(0x4a1418, { roughness: 0.7 });
      q(top, new THREE.BoxGeometry(0.42, 0.012, 0.3), cov, 0, 0.022, 0); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { q(top, new THREE.BoxGeometry(0.04, 0.014, 0.04), brassM, c[0] * 0.195, 0.023, c[1] * 0.135); });   // (its leather cover, brass corners)
      var pgG = new THREE.PlaneGeometry(0.4, 0.27, 16, 2), ppg = pgG.attributes.position; for (var pi = 0; pi < ppg.count; pi++) { var px = ppg.getX(pi); ppg.setZ(pi, 0.012 + Math.abs(Math.sin(px / 0.2 * Math.PI)) * 0.012 - (Math.abs(px) < 0.012 ? 0.008 : 0)); } pgG.computeVertexNormals();   // (the pages, bowed up either side of the spine)
      q(top, new THREE.BoxGeometry(0.39, 0.02, 0.26), rMat(0xd8c8a0, { roughness: 1 }), 0, 0.034, 0); quiet(q(top, pgG, new THREE.MeshStandardMaterial({ map: ledT, roughness: 1, side: THREE.DoubleSide }), 0, 0.034, 0, -Math.PI / 2, 0, 0));
      q(top, new THREE.BoxGeometry(0.012, 0.002, 0.2), rMat(0x8a1a20), 0.005, 0.05, 0.08, 0, 0.1, 0).position.z = 0.2;   // (a ribbon hanging out)
      q(top, new THREE.CylinderGeometry(0.02, 0.024, 0.035, 8), rMat(0x14121a, { roughness: 0.15, metalness: 0.3 }), 0.19, 0.06, 0.15); q(top, new THREE.CylinderGeometry(0.0015, 0.003, 0.2, 5), rMat(0xece4d4), 0.19, 0.14, 0.13, -0.3, 0, -0.3);   // (inkpot and quill on the lip)
      // ---- the armour stand ----
      var AS = grp(2.3, 0, -2.4, -0.5), aw = new THREE.MeshStandardMaterial({ map: grainT('#3a2818', true), roughness: 0.85 });
      for (var sf = 0; sf < 3; sf++) { var sa = sf / 3 * Math.PI * 2; q(AS, new THREE.BoxGeometry(0.06, 0.05, 0.3), aw, Math.sin(sa) * 0.13, 0.025, Math.cos(sa) * 0.13, 0, sa, 0); }   // (three feet)
      q(AS, lbLathe([[0.04, 0.03], [0.05, 0.08], [0.032, 0.14], [0.03, 0.6], [0.04, 0.66], [0.03, 0.72], [0.03, 1.5], [0, 1.5]], 12), aw, 0, 0, 0);
      q(AS, new THREE.BoxGeometry(0.5, 0.04, 0.05), aw, 0, 1.4, 0); [-1, 1].forEach(function (s) { q(AS, new THREE.SphereGeometry(0.03, 8, 6), aw, s * 0.25, 1.4, 0); });
      var lthT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#5a3a22'; g.fillRect(0, 0, w, h); var i; for (i = 0; i < 500; i++) { g.fillStyle = i % 2 ? 'rgba(30,16,6,0.25)' : 'rgba(150,110,70,0.15)'; g.fillRect(cr() * w, cr() * h, 2, 1); }   // (tooled leather: a border of knotwork, stitched seams)
        g.strokeStyle = 'rgba(25,12,4,0.6)'; g.lineWidth = 1.5; for (i = 0; i < 16; i++) { g.beginPath(); g.arc(i * 8 + 4, 14, 4, 0, Math.PI); g.stroke(); g.beginPath(); g.arc(i * 8 + 4, 14, 4, Math.PI, 0); g.stroke(); }
        g.setLineDash([3, 3]); g.strokeStyle = 'rgba(210,180,130,0.7)'; g.lineWidth = 1.2; [6, 22, 64].forEach(function (y) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }); g.beginPath(); g.moveTo(w / 2, 22); g.lineTo(w / 2, h); g.stroke(); g.setLineDash([]); }, [3, 1]);
      var lthM = new THREE.MeshStandardMaterial({ map: lthT, bumpMap: lthT, bumpScale: 0.002, roughness: 0.75, side: THREE.DoubleSide }), cloakM = rMat(0x1c1820, { roughness: 0.95, side: THREE.DoubleSide });
      q(AS, lbLathe([[0.15, 0.82], [0.165, 0.9], [0.175, 1.05], [0.17, 1.2], [0.15, 1.3], [0.08, 1.36], [0.06, 1.37]], 20), lthM, 0, 0, 0).scale.set(1, 1, 0.75);   // (the cuirass)
      [0.9, 1.0, 1.1].forEach(function (yy) { q(AS, new THREE.SphereGeometry(0.007, 6, 4), brassM, 0, yy, 0.13); });
      [-1, 1].forEach(function (s) { for (var pl = 0; pl < 3; pl++) { var pa = q(AS, new THREE.SphereGeometry(0.11 - pl * 0.012, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), lthM, s * (0.19 + pl * 0.03), 1.37 - pl * 0.045, 0, 0, 0, -s * (0.5 + pl * 0.15)); pa.scale.set(1, 0.6, 0.9); } });   // (layered pauldrons)
      q(AS, new THREE.TorusGeometry(0.168, 0.016, 6, 24), rMat(0x2a1a10, { roughness: 0.8 }), 0, 0.84, 0, Math.PI / 2, 0, 0).scale.set(1, 0.76, 1); q(AS, new THREE.BoxGeometry(0.05, 0.045, 0.012), brassM, 0, 0.84, 0.13); q(AS, new THREE.BoxGeometry(0.03, 0.025, 0.014), rMat(0x2a1a10), 0, 0.84, 0.133);   // (belt and buckle)
      [[-0.12, 0.09], [0.13, 0.06]].forEach(function (pu) { q(AS, new THREE.BoxGeometry(0.07, 0.08, 0.04), lthM, pu[0], 0.79, pu[1] + 0.04, 0, pu[0] * 2, 0); q(AS, new THREE.BoxGeometry(0.072, 0.03, 0.042), lthM, pu[0], 0.82, pu[1] + 0.042, -0.15, pu[0] * 2, 0); });   // (pouches)
      var cg = new THREE.CylinderGeometry(0.22, 0.34, 1.1, 28, 10, true, Math.PI * 0.12, Math.PI * 1.76), cpp = cg.attributes.position;   // (the cloak, hanging open, heavy folds)
      for (var ci = 0; ci < cpp.count; ci++) { var cx = cpp.getX(ci), cy = cpp.getY(ci), cz = cpp.getZ(ci), a = Math.atan2(cz, cx), f = 1 + Math.sin(a * 9) * 0.06 * (0.5 - cy / 1.1 + 0.3); cpp.setX(ci, cx * f); cpp.setZ(ci, cz * f); } cg.computeVertexNormals();
      q(AS, cg, cloakM, 0, 0.88, -0.03);
      var hood = q(AS, new THREE.SphereGeometry(0.15, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.7), cloakM, 0, 1.48, -0.03, -0.45, 0, 0); hood.scale.set(1, 1.1, 1.15);
      q(AS, new THREE.TorusGeometry(0.03, 0.006, 6, 14), brassM, 0.1, 1.38, 0.11, 0, 0.3, 0);   // (the cloak's brass clasp)
      var swd = grp(0.17, 0.78, 0.06, 0, AS); swd.rotation.z = 0.2;   // (a short sword in its scabbard at the hip)
      var sc = new THREE.Shape(); sc.moveTo(-0.024, 0); sc.lineTo(-0.02, -0.46); sc.quadraticCurveTo(0, -0.52, 0.02, -0.46); sc.lineTo(0.024, 0); sc.lineTo(-0.024, 0);
      var scg = new THREE.ExtrudeGeometry(sc, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 }); scg.translate(0, 0, -0.005); q(swd, scg, rMat(0x2a1a10, { roughness: 0.7 }), 0, 0.02, 0);
      q(swd, new THREE.BoxGeometry(0.055, 0.05, 0.022), brassM, 0, 0.0, 0); q(swd, new THREE.ConeGeometry(0.022, 0.07, 4), brassM, 0, -0.47, 0, Math.PI, Math.PI / 4, 0).scale.set(1, 1, 0.45);
      q(swd, new THREE.BoxGeometry(0.13, 0.016, 0.024), brassM, 0, 0.04, 0); q(swd, new THREE.CylinderGeometry(0.012, 0.013, 0.1, 8), rMat(0x3a2418), 0, 0.1, 0); q(swd, new THREE.SphereGeometry(0.018, 8, 6), brassM, 0, 0.16, 0);
    })();
    hideSolids.push([2.5, 0.9, 0.35]);
    // (the front-left corner, in great detail: three plank crates, nailed and braced, the guild's mark daubed on them, the top one
    // prised open with straw spilling out; two burlap sacks tied off with rope, one slumped open with grain spilt across the floor;
    // the bedroll: a quilted pad, a plaid blanket thrown back, a shaggy fur over the foot, a linen pillow and a rolled blanket
    // strapped at the head; a leather pack with a buckled flap, side pocket and a tin cup hanging off it; and an iron lantern with
    // glass panes, sooty at the top, a candle burning inside)
    (function () {
      var sd = 313; function cr() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
      function q(par, geo, m, x, y, z, rx, ry, rz) { return cpPart(geo, m, x, y, z, rx, ry, rz, par); }
      function grp(x, y, z, ry, par) { var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; (par || R).add(g); return g; }
      function quiet(o) { o.castShadow = false; return o; }
      function grainT(base, lines, vert) { return cpTex(128, 128, function (g, w, h) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (var i = 0; i < lines; i++) { var o = (i * 41) % 128; g.strokeStyle = 'rgba(25,14,6,' + (0.12 + (i % 5) * 0.07).toFixed(2) + ')'; g.lineWidth = 0.6 + (i % 3) * 0.5; g.beginPath();
        for (var t = 0; t <= 128; t += 8) { var d = o + Math.sin(t / 128 * Math.PI * 2 + i) * 2.5; if (vert) { if (t) g.lineTo(d, t); else g.moveTo(d, t); } else { if (t) g.lineTo(t, d); else g.moveTo(t, d); } } g.stroke(); }
        for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(20,10,4,0.35)'; g.beginPath(); g.ellipse(cr() * w, cr() * h, 4 + cr() * 4, 1.5 + cr() * 2, vert ? Math.PI / 2 : 0, 0, Math.PI * 2); g.fill(); }
        g.fillStyle = 'rgba(10,5,2,0.6)'; if (vert) { g.fillRect(0, 0, 2, h); g.fillRect(w - 2, 0, 2, h); } else { g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2); } }); }
      var plankM = new THREE.MeshStandardMaterial({ map: grainT('#6a5034', 30, false), roughness: 0.9 }), postM = new THREE.MeshStandardMaterial({ map: grainT('#4a3420', 26, true), roughness: 0.9 }), nailM = rMat(0x1c1a18, { metalness: 0.6, roughness: 0.5 });
      var markT = cpTex(128, 128, function (g, w, h) { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(20,14,10,0.85)'; g.fillStyle = 'rgba(20,14,10,0.85)'; g.lineWidth = 7; g.lineCap = 'round';   // (the guild's mark, daubed on in black: a crescent and a fang)
        g.beginPath(); g.arc(60, 64, 40, Math.PI * 0.3, Math.PI * 1.7); g.stroke(); g.beginPath(); g.moveTo(72, 22); g.quadraticCurveTo(96, 62, 70, 108); g.quadraticCurveTo(80, 62, 66, 26); g.closePath(); g.fill();
        for (var i = 0; i < 30; i++) { g.clearRect(cr() * w, cr() * h, 2 + cr() * 5, 1 + cr() * 3); } });   // (flaked where it's worn)
      var markM = new THREE.MeshStandardMaterial({ map: markT, transparent: true, depthWrite: false, roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
      function crate(x, y, z, s, ry, open) { var c = grp(x, y, z, ry), n = 3, ph = (s - 0.012) / n - 0.008;
        for (var sdI = 0; sdI < 4; sdI++) { var a = sdI * Math.PI / 2, f = new THREE.Group(); f.rotation.y = a; c.add(f);   // (each side: three planks with gaps, a diagonal brace, nails)
          for (var k = 0; k < n; k++) { var py = 0.006 + ph / 2 + k * (ph + 0.008); q(f, new THREE.BoxGeometry(s - 0.04, ph, 0.016), plankM, 0, py, s / 2 - 0.008, 0, 0, (cr() - 0.5) * 0.01);
            [-1, 1].forEach(function (e) { [-ph / 4, ph / 4].forEach(function (o) { q(f, new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 6), nailM, e * (s / 2 - 0.045), py + o, s / 2 + 0.001, Math.PI / 2, 0, 0); }); }); }
          var dl = Math.hypot(s - 0.12, s - 0.08); q(f, new THREE.BoxGeometry(0.055, dl, 0.014), postM, 0, s / 2, s / 2 + 0.012, 0, 0, Math.atan2(s - 0.12, s - 0.08) * (sdI % 2 ? 1 : -1));
          if (sdI === 0 || sdI === 3) quiet(q(f, new THREE.PlaneGeometry(s * 0.45, s * 0.45), markM, s * 0.18, s * 0.52, s / 2 + 0.021, 0, 0, (cr() - 0.5) * 0.3)); }
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (e) { q(c, new THREE.BoxGeometry(0.045, s, 0.045), postM, e[0] * (s / 2 - 0.022), s / 2, e[1] * (s / 2 - 0.022)); });   // (corner posts)
        q(c, new THREE.BoxGeometry(s - 0.03, 0.01, s - 0.03), rMat(0x120c08, { roughness: 1 }), 0, s - 0.02, 0);   // (dark inside)
        var lid = new THREE.Group(); c.add(lid);
        if (open) { lid.position.set(-s / 2, s, 0); lid.rotation.z = 0.5; lid.rotation.y = 0.15; }
        else lid.position.set(0, s, 0);
        for (var lp = 0; lp < 3; lp++) { var lz = -s / 3 + lp * s / 3; q(lid, new THREE.BoxGeometry(s, 0.018, s / 3 - 0.008), plankM, open ? s / 2 : 0, 0.009, lz, 0, 0, 0); [-1, 1].forEach(function (e) { q(lid, new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 6), nailM, (open ? s / 2 : 0) + e * (s / 2 - 0.03), 0.0195, lz); }); }
        [-1, 1].forEach(function (e) { q(lid, new THREE.BoxGeometry(0.05, 0.016, s - 0.02), postM, (open ? s / 2 : 0) + e * (s / 2 - 0.06), 0.026, 0); });
        if (open) { var strawM = rMat(0xc8a860, { roughness: 1 });   // (straw spilling out over the rim)
          for (var st = 0; st < 60; st++) { var sx = (cr() - 0.5) * (s - 0.08), sz = (cr() - 0.5) * (s - 0.08); quiet(q(c, new THREE.CylinderGeometry(0.003, 0.003, 0.1 + cr() * 0.12, 3), strawM, sx, s - 0.01 + cr() * 0.03, sz, (cr() - 0.5) * 2.4, cr() * 6, (cr() - 0.5) * 2.4)); }
          for (st = 0; st < 14; st++) { var ea = cr() * 6.28; quiet(q(c, new THREE.CylinderGeometry(0.003, 0.003, 0.12, 3), strawM, Math.cos(ea) * s * 0.5, s - 0.02 - cr() * 0.06, Math.sin(ea) * s * 0.5, 0.3 + cr(), ea, 0.4)); }
          q(c, new THREE.CylinderGeometry(0.03, 0.035, 0.12, 10), rMat(0x2a4a3a, { roughness: 0.15, transparent: true, opacity: 0.85 }), 0.06, s + 0.02, -0.05, 0.2, 0, 0.1);   // (a bottle nestled in the straw)
          q(c, new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8), rMat(0x2a4a3a, { roughness: 0.15 }), 0.068, s + 0.1, -0.045, 0.2, 0, 0.1); q(c, new THREE.CylinderGeometry(0.013, 0.012, 0.02, 8), rMat(0x8a6a4a, { roughness: 1 }), 0.07, s + 0.13, -0.04, 0.2, 0, 0.1); }
      }
      crate(-W + 0.45, 0, D - 0.5, 0.6, 0.02); crate(-W + 0.45, 0, D - 1.1, 0.5, 0.3); crate(-W + 0.47, 0.6, D - 0.52, 0.45, 0.12, true);
      hideSolids.push([-W + 0.45, D - 0.5, 0.45], [-W + 0.45, D - 1.1, 0.38]);
      // (the sacks)
      var burT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#9a8460'; g.fillRect(0, 0, w, h); for (var y2 = 0; y2 < h; y2 += 2) { g.fillStyle = 'rgba(50,36,18,' + (y2 % 4 ? 0.12 : 0.22) + ')'; g.fillRect(0, y2, w, 1); } for (var x2 = 0; x2 < w; x2 += 2) { g.fillStyle = 'rgba(50,36,18,0.12)'; g.fillRect(x2, 0, 1, h); }
        for (var i = 0; i < 500; i++) { g.fillStyle = i % 2 ? 'rgba(200,180,130,0.25)' : 'rgba(40,28,12,0.25)'; g.fillRect(cr() * w, cr() * h, 2, 1); }
        for (i = 0; i < 4; i++) { var bx = cr() * w, by = cr() * h, bg = g.createRadialGradient(bx, by, 2, bx, by, 22); bg.addColorStop(0, 'rgba(40,28,14,0.3)'); bg.addColorStop(1, 'rgba(40,28,14,0)'); g.fillStyle = bg; g.fillRect(bx - 22, by - 22, 44, 44); } }, [4, 3]);
      var burM = new THREE.MeshStandardMaterial({ map: burT, bumpMap: burT, bumpScale: 0.0015, roughness: 1, side: THREE.DoubleSide }), ropeM = rMat(0x9a7a4a, { roughness: 1 });
      function sackGeo(pts, lean, lump) { var gg = lbLathe(pts, 20), pp = gg.attributes.position; for (var i = 0; i < pp.count; i++) { var x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i), a = Math.atan2(z, x), f = 1 + lump * (Math.sin(a * 3 + y * 14) * 0.6 + Math.sin(a * 5 - y * 9) * 0.4);
        pp.setXYZ(i, x * f + y * y * lean, y, z * f * 0.85); } gg.computeVertexNormals(); return gg; }
      var s1 = grp(-W + 1.0, 0, D - 0.4, 0.4);   // (a full sack, tied off at the neck, its top flopped over)
      q(s1, sackGeo([[0, 0], [0.16, 0.005], [0.21, 0.06], [0.23, 0.18], [0.21, 0.3], [0.14, 0.39], [0.065, 0.44], [0.055, 0.47], [0.075, 0.51], [0.095, 0.55], [0.07, 0.58], [0.02, 0.585]], 0.25, 0.05), burM, 0, 0, 0);
      q(s1, new THREE.TorusGeometry(0.062, 0.011, 6, 16), ropeM, 0.05, 0.46, 0, Math.PI / 2, 0, 0);
      q(s1, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.1, 0.46, 0.04), new THREE.Vector3(0.16, 0.4, 0.08), new THREE.Vector3(0.2, 0.3, 0.1), new THREE.Vector3(0.23, 0.2, 0.08)]), 10, 0.009, 5), ropeM, 0, 0, 0);
      q(s1, new THREE.SphereGeometry(0.014, 6, 5), ropeM, 0.23, 0.2, 0.08);
      var s2 = grp(-W + 1.3, 0, D - 0.65, -0.5);   // (a sack slumped open, grain spilt out of it)
      var s2g = q(s2, sackGeo([[0, 0], [0.17, 0.005], [0.22, 0.05], [0.235, 0.13], [0.22, 0.21], [0.19, 0.26], [0.2, 0.29], [0.24, 0.3], [0.27, 0.27], [0.27, 0.22]], -0.3, 0.09), burM, 0, 0, 0); s2g.rotation.z = 0.18;   // (its mouth rolled down and flopping open)
      var grainM = rMat(0xd8b868, { roughness: 0.9 });
      var gtop = quiet(q(s2, new THREE.SphereGeometry(0.17, 14, 8), grainM, -0.04, 0.235, 0)); gtop.scale.set(1, 0.32, 0.85); gtop.rotation.z = 0.18;   // (the grain heaped inside it)
      var gpile = quiet(q(s2, new THREE.SphereGeometry(0.16, 14, 8), grainM, -0.3, 0.0, 0.02)); gpile.scale.set(1.1, 0.18, 0.8);
      var gr = new THREE.InstancedMesh(new THREE.SphereGeometry(0.008, 5, 4), grainM, 160), gm = new THREE.Matrix4(), gq = new THREE.Quaternion(), gv = new THREE.Vector3(), gs = new THREE.Vector3(1, 0.7, 1.4);
      for (var gi = 0; gi < 160; gi++) { var ga = cr() * 6.28, gd = 0.12 + Math.pow(cr(), 0.7) * 0.32; gq.setFromEuler(new THREE.Euler(0, cr() * 6, 0)); gv.set(-0.3 + Math.cos(ga) * gd * 1.2, 0.005, 0.02 + Math.sin(ga) * gd * 0.8); gm.compose(gv, gq, gs); gr.setMatrixAt(gi, gm); }
      s2.add(gr);
      q(s2, new THREE.TorusGeometry(0.03, 0.008, 5, 12, Math.PI * 1.4), ropeM, -0.48, 0.008, 0.18, Math.PI / 2, 0, 0.5);   // (its rope, dropped beside it)
      // (the bedroll)
      var BR = grp(-3.75, 0, 1.55, 0);
      var quiltT = cpTex(128, 256, function (g, w, h) { var cols = ['#4a3a5a', '#5a4466', '#3e3048', '#54405a'];   // (a quilted pad: patches, diamond stitching)
        for (var y2 = 0; y2 < 4; y2++) for (var x2 = 0; x2 < 2; x2++) { g.fillStyle = cols[(x2 + y2) % 4]; g.fillRect(x2 * 64, y2 * 64, 64, 64); }
        g.strokeStyle = 'rgba(200,180,210,0.35)'; g.lineWidth = 1; g.setLineDash([3, 3]); for (var d = -256; d < 256; d += 22) { g.beginPath(); g.moveTo(d, 0); g.lineTo(d + 256, 256); g.stroke(); g.beginPath(); g.moveTo(d + 256, 0); g.lineTo(d, 256); g.stroke(); } g.setLineDash([]);
        g.strokeStyle = 'rgba(20,14,24,0.6)'; g.lineWidth = 1.5; for (y2 = 0; y2 <= 4; y2++) { g.beginPath(); g.moveTo(0, y2 * 64); g.lineTo(w, y2 * 64); g.stroke(); } g.beginPath(); g.moveTo(64, 0); g.lineTo(64, h); g.stroke();
        for (var i = 0; i < 300; i++) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(cr() * w, cr() * h, 2, 1); } });
      var padSide = rMat(0x3a2e44, { roughness: 1 });
      q(BR, new THREE.BoxGeometry(0.75, 0.07, 1.7), [padSide, padSide, new THREE.MeshStandardMaterial({ map: quiltT, roughness: 1 }), padSide, padSide, padSide], 0, 0.035, 0);
      [-1, 1].forEach(function (s) { quiet(q(BR, new THREE.CylinderGeometry(0.035, 0.035, 1.7, 8), padSide, s * 0.375, 0.035, 0, Math.PI / 2, 0, 0)); });   // (its rolled edges)
      var plaidT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#5a2228'; g.fillRect(0, 0, w, h);   // (a wool plaid blanket)
        [[0, 24, 'rgba(30,40,30,0.75)'], [64, 24, 'rgba(30,40,30,0.75)'], [30, 4, 'rgba(200,170,110,0.5)'], [94, 4, 'rgba(200,170,110,0.5)'], [46, 10, 'rgba(20,14,16,0.5)'], [110, 10, 'rgba(20,14,16,0.5)']].forEach(function (b) { g.fillStyle = b[2]; g.fillRect(b[0], 0, b[1], h); g.fillRect(0, b[0], w, b[1]); });
        for (var y2 = 0; y2 < h; y2 += 2) { g.fillStyle = 'rgba(0,0,0,0.1)'; g.fillRect(0, y2, w, 1); } for (var i = 0; i < 400; i++) { g.fillStyle = 'rgba(255,230,210,0.06)'; g.fillRect(cr() * w, cr() * h, 1, 2); } }, [2, 3]);
      var bg0 = new THREE.PlaneGeometry(0.8, 1.15, 16, 24), bp = bg0.attributes.position;
      for (var bi = 0; bi < bp.count; bi++) { var bx = bp.getX(bi), bz = -bp.getY(bi), by = 0.085 + Math.sin(bx * 9 + bz * 4) * 0.008 + Math.sin(bz * 13) * 0.006;
        if (Math.abs(bx) > 0.36) by -= (Math.abs(bx) - 0.36) * 1.6;   // (draped over the sides)
        var fold = bz < -0.47 ? (-0.47 - bz) : 0; if (fold > 0) { by += 0.03 + Math.sin(fold / 0.1 * Math.PI) * 0.025; bz = -0.47 + fold * 0.3; }   // (the top edge turned back)
        bp.setXYZ(bi, bx, -bz, Math.max(0.012, by)); }
      bg0.computeVertexNormals(); q(BR, bg0, new THREE.MeshStandardMaterial({ map: plaidT, roughness: 1, side: THREE.DoubleSide }), 0, 0, 0.27, -Math.PI / 2, 0, 0);
      var pil = q(BR, new THREE.SphereGeometry(0.2, 16, 10), rMat(0xd8ccb0, { roughness: 1 }), 0.02, 0.1, -0.6); pil.scale.set(1.4, 0.32, 0.75); pil.rotation.y = 0.08;   // (a linen pillow, dented)
      quiet(q(BR, new THREE.SphereGeometry(0.07, 10, 6), rMat(0xc8bc9e, { roughness: 1 }), 0.05, 0.155, -0.6)).scale.set(1.6, 0.25, 1);
      q(BR, new THREE.CylinderGeometry(0.11, 0.11, 0.75, 16), new THREE.MeshStandardMaterial({ map: plaidT, roughness: 1 }), 0, 0.11, -0.86, 0, 0, Math.PI / 2);   // (a rolled blanket at the head, strapped)
      [-0.24, 0.24].forEach(function (sx) { q(BR, new THREE.TorusGeometry(0.115, 0.009, 4, 20), rMat(0x3a2414, { roughness: 0.8 }), sx, 0.11, -0.86, 0, Math.PI / 2, 0); q(BR, new THREE.BoxGeometry(0.012, 0.03, 0.03), rMat(0x9a7a3a, { metalness: 0.8, roughness: 0.35 }), sx, 0.2, -0.79); });
      var furT = cpTex(256, 192, function (g, w, h) { g.clearRect(0, 0, w, h); g.save(); g.beginPath(); g.ellipse(w / 2, h / 2, w * 0.44, h * 0.4, 0, 0, Math.PI * 2); g.fillStyle = '#4a3a2a'; g.fill(); g.restore();   // (a shaggy fur, ragged at its edges)
        for (var i = 0; i < 9000; i++) { var a = cr() * 6.28, r = Math.sqrt(cr()) * 1.08, px = w / 2 + Math.cos(a) * r * w * 0.44, py = h / 2 + Math.sin(a) * r * h * 0.4, l = 3 + cr() * (r > 0.9 ? 9 : 5); g.strokeStyle = cr() < 0.5 ? 'rgba(30,22,14,0.6)' : cr() < 0.8 ? 'rgba(110,90,66,0.6)' : 'rgba(170,150,120,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l + 2); g.stroke(); } });
      var fg0 = new THREE.PlaneGeometry(0.85, 0.65, 14, 10), fp = fg0.attributes.position;
      for (var fi = 0; fi < fp.count; fi++) { var fx = fp.getX(fi), fz = fp.getY(fi); fp.setZ(fi, Math.max(0.01, 0.105 + Math.sin(fx * 11) * 0.01 - Math.max(0, Math.abs(fx) - 0.34) * 1.4)); } fg0.computeVertexNormals();
      for (var fl = 0; fl < 4; fl++) { var fsh = 0.7 + fl * 0.12; quiet(q(BR, fg0, new THREE.MeshStandardMaterial({ map: furT, alphaTest: 0.35 + fl * 0.15, color: new THREE.Color(fsh, fsh, fsh), roughness: 1, side: THREE.DoubleSide }), 0.02, fl * 0.006, 0.58, -Math.PI / 2, 0, 0.15)); }
      // (the pack: stiff leather, a flap buckled down with two straps, a side pocket, shoulder straps, a blanket roll on top and a tin cup)
      var lthT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#5a4028'; g.fillRect(0, 0, w, h); for (var i = 0; i < 400; i++) { g.fillStyle = i % 2 ? 'rgba(30,18,8,0.25)' : 'rgba(150,110,70,0.15)'; g.fillRect(cr() * w, cr() * h, 2, 1); }
        for (i = 0; i < 12; i++) { var cx = cr() * w, cy = cr() * h; g.strokeStyle = 'rgba(25,12,4,0.4)'; g.beginPath(); g.moveTo(cx, cy); g.quadraticCurveTo(cx + 10, cy + (cr() - 0.5) * 20, cx + 24, cy + (cr() - 0.5) * 14); g.stroke(); }
        g.setLineDash([3, 3]); g.strokeStyle = 'rgba(210,180,130,0.7)'; g.lineWidth = 1.2; g.strokeRect(5, 5, w - 10, h - 10); g.setLineDash([]); });
      var lthM = new THREE.MeshStandardMaterial({ map: lthT, bumpMap: lthT, bumpScale: 0.002, roughness: 0.85 }), strapM = rMat(0x3a2414, { roughness: 0.8 }), buckM = rMat(0x9a7a3a, { metalness: 0.8, roughness: 0.35 });
      var pk = grp(0.55, 0, -0.75, 0.3, BR);
      q(pk, new THREE.BoxGeometry(0.3, 0.36, 0.18), lthM, 0, 0.18, 0); var top = q(pk, new THREE.CylinderGeometry(0.09, 0.09, 0.3, 14, 1, false, 0, Math.PI), lthM, 0, 0.36, 0, 0, 0, Math.PI / 2); top.scale.set(0.45, 1, 1);
      var flap = new THREE.Shape(); flap.moveTo(-0.15, 0); flap.lineTo(0.15, 0); flap.lineTo(0.15, -0.14); flap.quadraticCurveTo(0, -0.2, -0.15, -0.14); flap.lineTo(-0.15, 0);
      var fgeo = new THREE.ExtrudeGeometry(flap, { depth: 0.008, bevelEnabled: false }); q(pk, fgeo, lthM, 0, 0.38, 0.09, 0, 0, 0);   // (the flap, hanging down the front)
      [-0.07, 0.07].forEach(function (sx) { q(pk, new THREE.BoxGeometry(0.025, 0.2, 0.006), strapM, sx, 0.25, 0.102); q(pk, new THREE.BoxGeometry(0.034, 0.03, 0.008), buckM, sx, 0.2, 0.106); q(pk, new THREE.BoxGeometry(0.01, 0.022, 0.004), strapM, sx, 0.2, 0.112); });
      q(pk, new THREE.BoxGeometry(0.06, 0.16, 0.12), lthM, 0.175, 0.13, 0); q(pk, new THREE.BoxGeometry(0.062, 0.05, 0.122), lthM, 0.176, 0.215, 0, 0, 0, -0.1);   // (a side pocket)
      [-0.08, 0.08].forEach(function (sx) { q(pk, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(sx, 0.34, -0.09), new THREE.Vector3(sx, 0.3, -0.16), new THREE.Vector3(sx * 1.1, 0.12, -0.15), new THREE.Vector3(sx, 0.03, -0.095)]), 12, 0.01, 5), strapM, 0, 0, 0); });
      q(pk, new THREE.CylinderGeometry(0.075, 0.075, 0.34, 14), new THREE.MeshStandardMaterial({ map: plaidT, roughness: 1 }), 0, 0.47, 0, 0, 0, Math.PI / 2); [-0.1, 0.1].forEach(function (sx) { q(pk, new THREE.TorusGeometry(0.078, 0.007, 4, 18), strapM, sx, 0.47, 0, 0, Math.PI / 2, 0); });
      var cup = grp(-0.17, 0.2, 0.02, 0, pk); q(cup, lbLathe([[0, 0], [0.032, 0], [0.034, 0.06], [0.031, 0.06], [0.029, 0.004], [0, 0.004]], 16), rMat(0x8a8c90, { metalness: 0.7, roughness: 0.4, side: THREE.DoubleSide }), 0, -0.03, 0, 0, 0, 0.15); q(cup, new THREE.TorusGeometry(0.016, 0.003, 5, 12, Math.PI), rMat(0x8a8c90, { metalness: 0.7, roughness: 0.4 }), 0.012, 0.02, 0, 0, 0, Math.PI / 2 + 0.15);
      // (the lantern: an iron frame, glass panes sooty at the top, a candle burning inside, a vented cap and a ring to carry it)
      var ln = grp(0.5, 0, 0.55, 0.4, BR), lnIron = rMat(0x24201e, { metalness: 0.6, roughness: 0.5 }), lmM2 = rMat(0xffd890, { emissive: 0xffa040, emissiveIntensity: 1.3 }); hdFlames.push(lmM2);
      q(ln, lbLathe([[0, 0], [0.075, 0], [0.078, 0.008], [0.072, 0.016], [0, 0.016]], 4), lnIron, 0, 0, 0, 0, Math.PI / 4, 0);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { q(ln, new THREE.BoxGeometry(0.01, 0.17, 0.01), lnIron, c[0] * 0.05, 0.1, c[1] * 0.05); });
      var sootT = cpTex(32, 64, function (g, w, h) { var sg = g.createLinearGradient(0, 0, 0, h); sg.addColorStop(0, 'rgba(20,14,8,0.75)'); sg.addColorStop(0.35, 'rgba(60,40,20,0.25)'); sg.addColorStop(1, 'rgba(255,240,210,0.12)'); g.fillStyle = sg; g.fillRect(0, 0, w, h); });
      var glassM = new THREE.MeshStandardMaterial({ map: sootT, transparent: true, roughness: 0.1, depthWrite: false, side: THREE.DoubleSide });
      for (var gp = 0; gp < 4; gp++) { var ga2 = gp * Math.PI / 2; quiet(q(ln, new THREE.PlaneGeometry(0.098, 0.16), glassM, Math.sin(ga2) * 0.049, 0.1, Math.cos(ga2) * 0.049, 0, ga2, 0)); }
      q(ln, new THREE.BoxGeometry(0.004, 0.16, 0.004), lnIron, 0, 0.1, 0.051); q(ln, new THREE.BoxGeometry(0.1, 0.004, 0.004), lnIron, 0, 0.1, 0.051);   // (the door's bars)
      q(ln, new THREE.CylinderGeometry(0.014, 0.015, 0.06, 10), rMat(0xece2c8, { roughness: 0.55 }), 0, 0.046, 0); q(ln, new THREE.CylinderGeometry(0.001, 0.001, 0.01, 4), rMat(0x141010), 0, 0.08, 0);
      quiet(q(ln, new THREE.SphereGeometry(0.011, 8, 6), lmM2, 0, 0.096, 0)).scale.set(1, 2, 1); hdHalo(ln, 0, 0.1, 0, 0.36);
      q(ln, new THREE.ConeGeometry(0.085, 0.07, 4), lnIron, 0, 0.215, 0, 0, Math.PI / 4, 0); q(ln, new THREE.CylinderGeometry(0.02, 0.024, 0.03, 8), lnIron, 0, 0.26, 0);
      for (var vh = 0; vh < 6; vh++) { var va = vh / 6 * Math.PI * 2; q(ln, new THREE.BoxGeometry(0.006, 0.012, 0.002), rMat(0x050403), Math.cos(va) * 0.0225, 0.26, Math.sin(va) * 0.0225, 0, -va + Math.PI / 2, 0); }   // (vent holes)
      q(ln, new THREE.TorusGeometry(0.03, 0.005, 6, 14), lnIron, 0, 0.3, 0);
    })();
    var bLight = new THREE.PointLight(0xffb060, 0.5, 3.2, 1.8); bLight.position.set(HDI_X - 3.75 + 0.5, 0.4, HDI_Z + 1.55 + 0.55); hideScene.add(bLight); hdCandles.push(bLight);
    hideSolids.push([-3.75, 1.1, 0.35], [-3.75, 2.0, 0.35]);
    // (the left wall, in great detail: an oak weapon rack on iron brackets with pegs, holding three swords (one sheathed) and a
    // bearded axe; a recurve bow on its own pegs; the guild's round shield, painted and battered, with an iron rim and boss; a
    // staved barrel full of fletched arrows; and a torn map of the isles nailed up, one corner curling, a red thread between
    // two pins marking a route)
    (function () {
      var sd = 717; function cr() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
      function q(par, geo, m, x, y, z, rx, ry, rz) { return cpPart(geo, m, x, y, z, rx, ry, rz, par); }
      function quiet(o) { o.castShadow = false; return o; }
      function onWall(z, y, out) { var g = new THREE.Group(); g.position.set(-W + (out || 0.06), y, z); g.rotation.y = Math.PI / 2; R.add(g); return g; }   // (local x runs along the wall toward -z, local z points out of it)
      function grainT(base, vert) { return cpTex(128, 128, function (g, w, h) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (var i = 0; i < 30; i++) { var o = (i * 41) % 128; g.strokeStyle = 'rgba(25,14,6,' + (0.12 + (i % 5) * 0.07).toFixed(2) + ')'; g.lineWidth = 0.6 + (i % 3) * 0.5; g.beginPath();
        for (var t = 0; t <= 128; t += 8) { var d = o + Math.sin(t / 128 * Math.PI * 2 + i) * 2.5; if (vert) { if (t) g.lineTo(d, t); else g.moveTo(d, t); } else { if (t) g.lineTo(t, d); else g.moveTo(t, d); } } g.stroke(); } }); }
      var oakM = new THREE.MeshStandardMaterial({ map: grainT('#4e3620', false), roughness: 0.85 }), hafM = new THREE.MeshStandardMaterial({ map: grainT('#6a4a2a', true), roughness: 0.8 });
      var ironM = rMat(0x24201e, { metalness: 0.6, roughness: 0.5 }), steelM = rMat(0xc0c4ca, { metalness: 0.92, roughness: 0.22, envMap: rubyEnv }), darkSteel = rMat(0x7a8088, { metalness: 0.9, roughness: 0.35, envMap: rubyEnv });
      var bronzeM = rMat(0x7a6030, { metalness: 0.8, roughness: 0.35, envMap: rubyEnv }), brassM = rMat(0xa8843e, { metalness: 0.8, roughness: 0.3, envMap: rubyEnv }), leatherM = rMat(0x3a2418, { roughness: 0.85 }), wireM = rMat(0xa8843e, { metalness: 0.8, roughness: 0.35 });
      // ---- the rack: two oak rails on iron brackets, bolted to the wall, a row of pegs on the top rail and a notched rail below ----
      var RZ = -1.3, RL = 1.5;
      [[1.7, 0.09], [0.5, 0.07]].forEach(function (r) { var g = onWall(RZ, r[0], 0.0);
        q(g, new THREE.BoxGeometry(RL, r[1], 0.07), oakM, 0, 0, 0.06); q(g, new THREE.BoxGeometry(RL, 0.012, 0.072), rMat(0x3a2818, { roughness: 0.9 }), 0, r[1] / 2 - 0.006, 0.061);   // (a chamfer along the top)
        [-RL / 2 + 0.12, 0, RL / 2 - 0.12].forEach(function (bx) { q(g, new THREE.BoxGeometry(0.03, r[1] + 0.06, 0.012), ironM, bx, -0.01, 0.1); q(g, new THREE.BoxGeometry(0.03, 0.012, 0.1), ironM, bx, -r[1] / 2 - 0.03, 0.05); q(g, new THREE.CylinderGeometry(0.009, 0.009, 0.006, 6), ironM, bx, 0.01, 0.108, Math.PI / 2, 0, 0); });   // (iron brackets, bolted)
        if (r[0] > 1) [-0.5, -0.15, 0.2, 0.55].forEach(function (px) { [-0.045, 0.045].forEach(function (o) { q(g, new THREE.CylinderGeometry(0.011, 0.013, 0.09, 8), hafM, px + o, 0, 0.13, Math.PI / 2 - 0.15, 0, 0); }); });   // (pegs)
        else for (var nt = 0; nt < 7; nt++) q(g, new THREE.BoxGeometry(0.03, 0.02, 0.04), rMat(0x120c08), -0.6 + nt * 0.2, r[1] / 2 - 0.009, 0.075); });   // (notches for the blade tips)
      // ---- swords ----
      function blade(g, len, wd, m) { var s = new THREE.Shape(); s.moveTo(-wd, 0); s.lineTo(-wd * 0.9, -len * 0.82); s.quadraticCurveTo(-wd * 0.6, -len * 0.95, 0, -len); s.quadraticCurveTo(wd * 0.6, -len * 0.95, wd * 0.9, -len * 0.82); s.lineTo(wd, 0); s.lineTo(-wd, 0);
        var bg = new THREE.ExtrudeGeometry(s, { depth: 0.003, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.005, bevelSegments: 1, curveSegments: 6 }); bg.translate(0, 0, -0.0015); q(g, bg, m || steelM, 0, 0, 0);
        q(g, new THREE.BoxGeometry(wd * 0.35, len * 0.7, 0.0085), darkSteel, 0, -0.03 - len * 0.35, 0); }
      function hilt(g, guard, pommel, gl) {
        if (guard === 'cross') { q(g, new THREE.BoxGeometry(0.2, 0.02, 0.028), bronzeM, 0, 0.01, 0); [-1, 1].forEach(function (s) { q(g, new THREE.SphereGeometry(0.016, 8, 6), bronzeM, s * 0.1, 0.01, 0); }); }
        else if (guard === 'curved') { q(g, new THREE.BoxGeometry(0.06, 0.022, 0.03), steelM, 0, 0.01, 0); [-1, 1].forEach(function (s) { q(g, new THREE.TorusGeometry(0.06, 0.009, 6, 12, Math.PI / 2), steelM, s * 0.03, -0.05, 0, 0, s < 0 ? Math.PI : 0, 0); q(g, new THREE.SphereGeometry(0.012, 6, 5), steelM, s * 0.09, -0.05, 0); }); }
        else { q(g, new THREE.BoxGeometry(0.16, 0.018, 0.024), ironM, 0, 0.01, 0); q(g, new THREE.TorusGeometry(0.035, 0.006, 6, 16), ironM, 0, -0.03, 0); }
        q(g, new THREE.CylinderGeometry(0.016, 0.018, gl, 10), leatherM, 0, 0.02 + gl / 2, 0);
        for (var k = 0; k < 10; k++) q(g, new THREE.TorusGeometry(0.0185 - k * 0.0002, 0.0018, 4, 12), wireM, 0, 0.03 + k * (gl - 0.02) / 10, 0, Math.PI / 2 + 0.3, 0, 0);
        var py = 0.02 + gl + 0.02;
        if (pommel === 'disc') { q(g, new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), bronzeM, 0, py, 0, Math.PI / 2, 0, 0); q(g, new THREE.SphereGeometry(0.012, 8, 6), rMat(0x9a1020, { emissive: 0x300008, roughness: 0.15 }), 0, py, 0.012); }
        else if (pommel === 'ball') { q(g, new THREE.SphereGeometry(0.028, 12, 10), steelM, 0, py, 0); q(g, new THREE.CylinderGeometry(0.008, 0.012, 0.02, 8), steelM, 0, py + 0.03, 0); }
        else { q(g, new THREE.TorusGeometry(0.026, 0.01, 8, 16), ironM, 0, py + 0.01, 0); q(g, new THREE.SphereGeometry(0.012, 8, 6), ironM, 0, py + 0.01, 0); } }
      var s1 = onWall(-1.85, 1.76, 0.1); blade(s1, 0.92, 0.024); hilt(s1, 'cross', 'disc', 0.17);
      var s2 = onWall(-1.5, 1.76, 0.1); s2.rotation.z = 0.02; blade(s2, 0.85, 0.02); hilt(s2, 'curved', 'ball', 0.15);
      var s3 = onWall(-1.15, 1.76, 0.1);   // (the third sword, in its scabbard: leather, a brass locket and chape, a belt strap looped round)
      var sc = new THREE.Shape(); sc.moveTo(-0.032, 0); sc.lineTo(-0.028, -0.8); sc.quadraticCurveTo(-0.02, -0.88, 0, -0.9); sc.quadraticCurveTo(0.02, -0.88, 0.028, -0.8); sc.lineTo(0.032, 0); sc.lineTo(-0.032, 0);
      var scg = new THREE.ExtrudeGeometry(sc, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 6 }); scg.translate(0, 0, -0.006); q(s3, scg, rMat(0x4a2c1a, { roughness: 0.7 }), 0, -0.01, 0);
      q(s3, new THREE.BoxGeometry(0.075, 0.07, 0.026), brassM, 0, -0.045, 0); q(s3, new THREE.ConeGeometry(0.03, 0.12, 4), brassM, 0, -0.86, 0, Math.PI, Math.PI / 4, 0).scale.set(1, 1, 0.4);
      [-0.2, -0.32].forEach(function (yy) { q(s3, new THREE.BoxGeometry(0.072, 0.012, 0.026), brassM, 0, yy, 0); });
      q(s3, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.035, -0.2, 0.012), new THREE.Vector3(0.09, -0.26, 0.02), new THREE.Vector3(0.1, -0.45, 0.025), new THREE.Vector3(0.06, -0.6, 0.02)]), 12, 0.006, 4), leatherM, 0, 0, 0);
      hilt(s3, 'ring', 'wheel', 0.14);
      // ---- the axe: a long haft, its grip bound in leather, a bearded head on an iron socket ----
      var ax = onWall(-0.8, 0.86, 0.11); ax.rotation.z = -0.04;
      q(ax, new THREE.CylinderGeometry(0.016, 0.02, 1.05, 10), hafM, 0, 0.52, 0); q(ax, new THREE.SphereGeometry(0.024, 10, 8), hafM, 0, 0.0, 0).scale.set(1, 0.8, 1);
      for (var k = 0; k < 14; k++) q(ax, new THREE.TorusGeometry(0.021, 0.004, 4, 12), leatherM, 0, 0.06 + k * 0.016, 0, Math.PI / 2 + 0.35, 0, 0);
      var ah = new THREE.Shape(); ah.moveTo(-0.03, 0.06); ah.lineTo(0.05, 0.055); ah.quadraticCurveTo(0.09, 0.08, 0.13, 0.12); ah.quadraticCurveTo(0.165, 0.0, 0.14, -0.13); ah.quadraticCurveTo(0.09, -0.11, 0.06, -0.05); ah.quadraticCurveTo(0.045, -0.02, 0.03, -0.02); ah.lineTo(-0.03, -0.02); ah.lineTo(-0.055, 0.0); ah.lineTo(-0.055, 0.045); ah.lineTo(-0.03, 0.06);
      var ahg = new THREE.ExtrudeGeometry(ah, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 8 }); ahg.translate(0, 0, -0.005); q(ax, ahg, darkSteel, 0, 0.98, 0);
      q(ax, new THREE.CylinderGeometry(0.026, 0.026, 0.09, 10), ironM, 0, 0.99, 0); q(ax, new THREE.SphereGeometry(0.008, 6, 4), ironM, 0, 1.0, 0.026);
      var edge = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0.13, 1.1, 0), new THREE.Vector3(0.165, 0.98, 0), new THREE.Vector3(0.14, 0.85, 0)), 10, 0.003, 4); q(ax, edge, steelM, 0, 0, 0);   // (its edge, honed bright)
      // ---- the bow: a recurve bow of horn and wood, its grip wrapped, strung, on two pegs ----
      var bw = onWall(-0.36, 1.1, 0.09);
      q(bw, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0.04, -0.63, 0), new THREE.Vector3(0, -0.57, 0), new THREE.Vector3(-0.08, -0.38, 0), new THREE.Vector3(-0.15, -0.12, 0), new THREE.Vector3(-0.16, 0, 0), new THREE.Vector3(-0.15, 0.12, 0), new THREE.Vector3(-0.08, 0.38, 0), new THREE.Vector3(0, 0.57, 0), new THREE.Vector3(0.04, 0.63, 0)]), 40, 0.013, 6), rMat(0x5a3418, { roughness: 0.55 }), 0, 0, 0);
      q(bw, new THREE.CylinderGeometry(0.019, 0.019, 0.14, 10), leatherM, -0.16, 0, 0); for (k = 0; k < 6; k++) q(bw, new THREE.TorusGeometry(0.02, 0.0025, 4, 12), wireM, -0.16, -0.06 + k * 0.024, 0, Math.PI / 2, 0, 0);
      [-1, 1].forEach(function (s) { q(bw, new THREE.SphereGeometry(0.009, 6, 5), rMat(0xe8dcc0), 0.04, s * 0.63, 0); q(bw, new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), rMat(0x2a1a10), -0.03, s * 0.47, 0, 0, 0, s * 0.45); });   // (horn tips, and dark bands on the limbs)
      q(bw, new THREE.CylinderGeometry(0.0018, 0.0018, 1.22, 4), rMat(0xe8e0c8, { roughness: 0.6 }), 0.03, 0, 0);
      [-0.25, 0.25].forEach(function (yy) { q(bw, new THREE.CylinderGeometry(0.01, 0.012, 0.1, 8), hafM, -0.13, yy, -0.04, Math.PI / 2, 0, 0); });
      // ---- the guild's shield: round, of planks, painted black with the crimson crescent and fang, battered; an iron rim, a domed
      // boss, rivets, and a leather strap over a peg ----
      var shT = cpTex(256, 256, function (g, w, h) { g.fillStyle = '#5a4028'; g.fillRect(0, 0, w, h); var i;
        for (i = 0; i < 6; i++) { g.fillStyle = ['#5a4028', '#664a2e', '#523a24'][i % 3]; g.fillRect(i * w / 6, 0, w / 6, h); g.fillStyle = 'rgba(15,8,4,0.8)'; g.fillRect(i * w / 6, 0, 2, h); }
        g.save(); g.beginPath(); g.arc(w / 2, h / 2, 118, 0, Math.PI * 2); g.clip(); g.fillStyle = '#16121a'; g.fillRect(0, 0, w, h);
        g.fillStyle = '#8a1a1e'; g.beginPath(); g.arc(w / 2 - 6, h / 2, 70, Math.PI * 0.32, Math.PI * 1.68); g.arc(w / 2 + 16, h / 2 - 2, 56, Math.PI * 1.56, Math.PI * 0.44, true); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(w / 2 + 14, h / 2 - 80); g.bezierCurveTo(w / 2 + 40, h / 2 - 30, w / 2 + 34, h / 2 + 30, w / 2 + 6, h / 2 + 86); g.bezierCurveTo(w / 2 + 16, h / 2 + 26, w / 2 + 16, h / 2 - 30, w / 2 + 4, h / 2 - 78); g.closePath(); g.fillStyle = '#c8c0b0'; g.fill();
        for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(15,8,4,0.8)'; g.fillRect(i * w / 6, 0, 2, h); }
        g.globalCompositeOperation = 'destination-out'; for (i = 0; i < 70; i++) { g.fillStyle = 'rgba(0,0,0,' + (0.4 + cr() * 0.6).toFixed(2) + ')'; g.beginPath(); g.ellipse(cr() * w, cr() * h, 2 + cr() * 9, 1 + cr() * 4, cr() * 3, 0, Math.PI * 2); g.fill(); } g.restore();   // (paint chipped off down to the wood)
        g.globalCompositeOperation = 'source-over';
        for (i = 0; i < 18; i++) { var gx = cr() * w, gy = cr() * h, ga = cr() * 6.28, gl = 10 + cr() * 30; g.strokeStyle = 'rgba(10,6,3,0.85)'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + Math.cos(ga) * gl, gy + Math.sin(ga) * gl); g.stroke(); g.strokeStyle = 'rgba(200,170,130,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(gx + 1, gy + 1); g.lineTo(gx + 1 + Math.cos(ga) * gl, gy + 1 + Math.sin(ga) * gl); g.stroke(); } });   // (sword cuts)
      var shd = onWall(0.25, 1.1, 0.07); shd.rotation.z = 0.06;
      var shFace = new THREE.MeshStandardMaterial({ map: shT, roughness: 0.8 }), shEdge = new THREE.MeshStandardMaterial({ map: grainT('#4a3420', true), roughness: 0.85 });
      q(shd, new THREE.CylinderGeometry(0.32, 0.32, 0.03, 40), [shEdge, shFace, shEdge], 0, 0, 0, Math.PI / 2, 0, 0);
      q(shd, new THREE.TorusGeometry(0.322, 0.016, 8, 48), ironM, 0, 0, 0.004);
      for (k = 0; k < 12; k++) { var ra = k / 12 * Math.PI * 2; q(shd, new THREE.BoxGeometry(0.03, 0.05, 0.012), ironM, Math.cos(ra) * 0.31, Math.sin(ra) * 0.31, 0.018, 0, 0, ra + Math.PI / 2); q(shd, new THREE.SphereGeometry(0.006, 6, 4), steelM, Math.cos(ra) * 0.3, Math.sin(ra) * 0.3, 0.025); }
      q(shd, new THREE.SphereGeometry(0.075, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), darkSteel, 0, 0, 0.015, Math.PI / 2, 0, 0); q(shd, new THREE.TorusGeometry(0.082, 0.01, 6, 24), darkSteel, 0, 0, 0.017);
      for (k = 0; k < 8; k++) { var ba = k / 8 * Math.PI * 2; q(shd, new THREE.SphereGeometry(0.007, 6, 4), steelM, Math.cos(ba) * 0.1, Math.sin(ba) * 0.1, 0.02); }
      q(shd, new THREE.SphereGeometry(0.02, 8, 6), steelM, 0, 0, 0.09).scale.set(1, 1, 0.5);
      q(shd, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.2, 0.25, -0.02), new THREE.Vector3(-0.08, 0.4, -0.02), new THREE.Vector3(0, 0.44, -0.02), new THREE.Vector3(0.08, 0.4, -0.02), new THREE.Vector3(0.2, 0.25, -0.02)]), 16, 0.008, 4), leatherM, 0, 0, 0);
      q(shd, new THREE.CylinderGeometry(0.012, 0.014, 0.08, 8), hafM, 0, 0.44, 0.0, Math.PI / 2, 0, 0);
      // ---- the barrel of arrows: bulging staves, four iron hoops, arrows fletched white, black and red ----
      var stT = cpTex(256, 64, function (g, w, h) { g.fillStyle = '#5a3a22'; g.fillRect(0, 0, w, h); for (var i = 0; i < 14; i++) { var sx = i * w / 14; g.fillStyle = 'rgba(' + (i % 3 ? 0 : 40) + ',20,8,' + (0.08 + (i % 4) * 0.05).toFixed(2) + ')'; g.fillRect(sx, 0, w / 14, h);
        for (var gl = 0; gl < 4; gl++) { g.strokeStyle = 'rgba(30,18,8,0.3)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(sx + 3 + gl * 4, 0); g.lineTo(sx + 3 + gl * 4 + Math.sin(i + gl) * 2, h); g.stroke(); } g.fillStyle = 'rgba(15,8,2,0.9)'; g.fillRect(sx, 0, 1.5, h); } });
      var bar = new THREE.Group(); bar.position.set(-3.95, 0, 0.75); R.add(bar);
      q(bar, lbLathe([[0.17, 0], [0.195, 0.1], [0.208, 0.28], [0.195, 0.46], [0.17, 0.56], [0.155, 0.56], [0.18, 0.46], [0.192, 0.28], [0.18, 0.1], [0.155, 0.02]], 28), new THREE.MeshStandardMaterial({ map: stT, roughness: 0.8, side: THREE.DoubleSide }), 0, 0, 0);
      q(bar, new THREE.CylinderGeometry(0.16, 0.16, 0.02, 20), rMat(0x120c08, { roughness: 1 }), 0, 0.42, 0);
      [[0.035, 0.18], [0.15, 0.2], [0.41, 0.2], [0.525, 0.177]].forEach(function (h2) { q(bar, new THREE.TorusGeometry(h2[1], 0.008, 5, 28), ironM, 0, h2[0], 0, Math.PI / 2, 0, 0); });
      var shaftM = rMat(0x9a7a4a, { roughness: 0.7 }), nockM = rMat(0x1a1410), fletchM = [0xe8e0d0, 0x2a2a2a, 0xa82222].map(function (c) { return rMat(c, { roughness: 0.9, side: THREE.DoubleSide }); });
      for (k = 0; k < 15; k++) { var aa = k * 2.4, ar = 0.03 + (k % 4) * 0.035, arw = new THREE.Group(); arw.position.set(Math.cos(aa) * ar, 0.43, Math.sin(aa) * ar); arw.rotation.set(Math.sin(aa) * 0.14, cr() * 6, -Math.cos(aa) * 0.14); bar.add(arw);
        var al = 0.42 + cr() * 0.08; q(arw, new THREE.CylinderGeometry(0.0045, 0.0045, al, 5), shaftM, 0, al / 2, 0); q(arw, new THREE.CylinderGeometry(0.006, 0.005, 0.014, 6), nockM, 0, al + 0.006, 0);
        for (var f = 0; f < 3; f++) { var fa = f / 3 * Math.PI * 2, fl = quiet(q(arw, new THREE.PlaneGeometry(0.016, 0.075), fletchM[k % 3], Math.cos(fa) * 0.008, al - 0.05, Math.sin(fa) * 0.008, 0, -fa, 0)); fl.position.x = Math.cos(fa) * 0.012; fl.position.z = -Math.sin(fa) * 0.012; fl.rotation.y = fa; }
        q(arw, new THREE.CylinderGeometry(0.0055, 0.0055, 0.03, 5), rMat(0x5a1a1a), 0, al - 0.11, 0); }   // (a wrapped band under the fletching)
      // ---- the map of the isles: torn parchment, nailed up, one corner curling away from the wall ----
      var mT = cpTex(768, 480, function (g, w, h) { var i; g.clearRect(0, 0, w, h);
        g.beginPath(); for (i = 0; i <= 80; i++) { var t = i / 80, px, py, j = (cr() - 0.5) * 9; if (t < 0.25) { px = t * 4 * w; py = 6 + j; } else if (t < 0.5) { px = w - 6 + j; py = (t - 0.25) * 4 * h; } else if (t < 0.75) { px = w - (t - 0.5) * 4 * w; py = h - 6 + j; } else { px = 6 + j; py = h - (t - 0.75) * 4 * h; } if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.closePath(); g.save(); g.clip();
        g.fillStyle = '#d9c597'; g.fillRect(0, 0, w, h);
        for (i = 0; i < 60; i++) { var bx = cr() * w, by = cr() * h, br = 20 + cr() * 70, bg = g.createRadialGradient(bx, by, 1, bx, by, br); bg.addColorStop(0, i % 3 ? 'rgba(150,110,60,0.12)' : 'rgba(255,245,215,0.14)'); bg.addColorStop(1, 'rgba(150,110,60,0)'); g.fillStyle = bg; g.fillRect(bx - br, by - br, br * 2, br * 2); }
        g.strokeStyle = 'rgba(70,60,50,0.35)'; g.lineWidth = 1.2; for (i = 0; i < 90; i++) { var wx = cr() * w, wy = cr() * h; g.beginPath(); g.moveTo(wx, wy); g.quadraticCurveTo(wx + 5, wy - 4, wx + 10, wy); g.quadraticCurveTo(wx + 15, wy + 4, wx + 20, wy); g.stroke(); }
        function blob(cx, cy, rx, ry, s) { g.beginPath(); for (var b = 0; b <= 64; b++) { var a = b / 64 * Math.PI * 2, r = 1 + Math.sin(a * 3 + s) * 0.12 + Math.sin(a * 7 + s * 2) * 0.07 + Math.sin(a * 13 + s * 3) * 0.04; if (b) g.lineTo(cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r); else g.moveTo(cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r); } g.closePath(); }
        var isl = [[450, 210, 120, 90, 1.1], [450, 390, 80, 52, 3.3], [180, 210, 90, 70, 5.2], [650, 120, 40, 30, 2.0]];
        isl.forEach(function (I) { [22, 13, 6].forEach(function (lw, n) { g.lineWidth = lw; g.strokeStyle = 'rgba(70,90,100,' + (0.06 + n * 0.05).toFixed(2) + ')'; blob(I[0], I[1], I[2], I[3], I[4]); g.stroke(); }); });
        isl.forEach(function (I) { blob(I[0], I[1], I[2], I[3], I[4]); g.fillStyle = '#c8cc94'; g.fill(); g.lineWidth = 2.4; g.strokeStyle = '#4a3018'; g.stroke(); });
        g.strokeStyle = '#4a3018'; g.lineWidth = 6; g.setLineDash([]); g.beginPath(); g.moveTo(330, 212); g.lineTo(272, 212); g.moveTo(450, 300); g.lineTo(450, 340); g.stroke();   // (the bridges between the isles)
        g.strokeStyle = '#e8dab0'; g.lineWidth = 2; g.beginPath(); g.moveTo(330, 212); g.lineTo(272, 212); g.moveTo(450, 300); g.lineTo(450, 340); g.stroke();
        for (i = 0; i < 6; i++) { var mx = 410 + i * 18, my = 190 + Math.sin(i) * 8; g.fillStyle = '#e3d2a4'; g.beginPath(); g.moveTo(mx - 10, my); g.lineTo(mx, my - 20); g.lineTo(mx + 10, my); g.closePath(); g.fill(); g.strokeStyle = '#4a3018'; g.lineWidth = 1.3; g.stroke(); }
        function tree(tx, ty) { g.fillStyle = '#6a7a40'; g.beginPath(); g.arc(tx, ty - 5, 4, 0, 6.28); g.fill(); g.strokeStyle = '#3a3018'; g.lineWidth = 0.8; g.stroke(); }
        for (i = 0; i < 26; i++) tree(160 + (cr() - 0.5) * 100, 220 + (cr() - 0.5) * 70); for (i = 0; i < 12; i++) tree(430 + (cr() - 0.5) * 90, 395 + (cr() - 0.5) * 40);
        [[480, 240], [470, 380], [200, 180]].forEach(function (t) { g.fillStyle = '#c8b080'; g.fillRect(t[0] - 5, t[1] - 4, 10, 7); g.strokeStyle = '#3a2814'; g.lineWidth = 1; g.strokeRect(t[0] - 5, t[1] - 4, 10, 7); g.beginPath(); g.moveTo(t[0] - 6, t[1] - 4); g.lineTo(t[0], t[1] - 10); g.lineTo(t[0] + 6, t[1] - 4); g.stroke(); });
        g.strokeStyle = '#8a2222'; g.lineWidth = 2.2; g.beginPath(); g.arc(120, 160, 14, 0, 6.28); g.stroke(); g.lineWidth = 3.5; g.beginPath(); g.moveTo(642, 112); g.lineTo(658, 128); g.moveTo(658, 112); g.lineTo(642, 128); g.stroke();
        g.setLineDash([6, 5]); g.lineWidth = 2; g.beginPath(); g.moveTo(480, 240); g.bezierCurveTo(560, 230, 600, 170, 645, 125); g.stroke(); g.setLineDash([]);
        var cx = 680, cy = 400, r = 48; g.strokeStyle = '#4a3018'; g.lineWidth = 1.3; g.beginPath(); g.arc(cx, cy, r, 0, 6.28); g.stroke();   // (a compass rose)
        [0, 2, 4, 6, 1, 3, 5, 7].forEach(function (t) { var a2 = t / 8 * 6.28 - Math.PI / 2, L = t % 2 ? r * 0.5 : r * 0.92; [[-1, '#4a3018'], [1, '#e8dab0']].forEach(function (s) { g.fillStyle = (t === 0 && s[0] < 0) ? '#8a2222' : s[1]; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a2) * L, cy + Math.sin(a2) * L); g.lineTo(cx + Math.cos(a2 + s[0] * 0.22) * r * 0.2, cy + Math.sin(a2 + s[0] * 0.22) * r * 0.2); g.closePath(); g.fill(); g.lineWidth = 0.7; g.stroke(); }); });
        g.strokeStyle = '#4a3018'; g.lineWidth = 2.5; for (i = 0; i < 3; i++) { g.beginPath(); g.arc(80 + i * 26, 410, 10, Math.PI, 0); g.stroke(); } g.beginPath(); g.moveTo(154, 410); g.quadraticCurveTo(166, 390, 178, 396); g.stroke();   // (a sea serpent)
        g.fillStyle = '#5a4028'; g.beginPath(); g.moveTo(300, 330); g.lineTo(330, 330); g.lineTo(325, 338); g.lineTo(305, 338); g.closePath(); g.fill(); g.strokeStyle = '#3a2814'; g.lineWidth = 1; g.beginPath(); g.moveTo(315, 330); g.lineTo(315, 310); g.stroke(); g.fillStyle = '#e8dab0'; g.beginPath(); g.moveTo(316, 312); g.lineTo(328, 322); g.lineTo(316, 326); g.closePath(); g.fill(); g.stroke();   // (a little ship)
        g.strokeStyle = 'rgba(60,40,20,0.75)'; g.lineWidth = 1.2; [[40, 50, 180], [40, 66, 140], [560, 450, 150]].forEach(function (s) { g.beginPath(); for (var sx = 0; sx < s[2]; sx += 3) { if (sx % 30 < 3) g.moveTo(s[0] + sx, s[1]); else g.lineTo(s[0] + sx, s[1] + Math.sin(sx * 0.9) * 2.5); } g.stroke(); });
        g.strokeStyle = 'rgba(90,60,30,0.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();   // (fold creases)
        [[0, 0, 0, 30], [0, h, 0, h - 30], [0, 0, 30, 0], [w, 0, w - 30, 0]].forEach(function (e) { var lg = g.createLinearGradient(e[0], e[1], e[2], e[3]); lg.addColorStop(0, 'rgba(90,55,20,0.55)'); lg.addColorStop(1, 'rgba(90,55,20,0)'); g.fillStyle = lg; g.fillRect(0, 0, w, h); });
        g.restore(); });
      var mg = new THREE.PlaneGeometry(1.0, 0.62, 20, 12), mp = mg.attributes.position;
      for (k = 0; k < mp.count; k++) { var mx2 = mp.getX(k), my2 = mp.getY(k), cu = Math.max(0, (mx2 - 0.28) / 0.22) * Math.max(0, (-my2 - 0.12) / 0.19); mp.setZ(k, cu * cu * 0.07 + Math.sin(mx2 * 8 + my2 * 5) * 0.003); }   // (its lower corner curling off the wall)
      mg.computeVertexNormals();
      var mw = onWall(-0.05, 1.75, 0.035); mw.rotation.z = 0.03;
      q(mw, mg, new THREE.MeshStandardMaterial({ map: mT, alphaTest: 0.5, roughness: 1, side: THREE.DoubleSide }), 0, 0, 0).castShadow = false;
      [[-0.46, 0.27], [0.46, 0.27], [-0.46, -0.27]].forEach(function (c) { q(mw, new THREE.CylinderGeometry(0.012, 0.012, 0.006, 8), ironM, c[0], c[1], 0.008, Math.PI / 2, 0, 0); });   // (three nails; the fourth corner has worked loose)
      var pA = [480 / 768 - 0.5, 0.31 - 240 / 480 * 0.62], pB = [645 / 768 - 0.5, 0.31 - 125 / 480 * 0.62];   // (red pins at the town and the X, a red thread between them)
      [pA, pB].forEach(function (pp) { q(mw, new THREE.CylinderGeometry(0.0015, 0.0015, 0.03, 4), ironM, pp[0], pp[1], 0.015, Math.PI / 2, 0, 0); q(mw, new THREE.SphereGeometry(0.009, 8, 6), rMat(0xb01a20, { roughness: 0.4 }), pp[0], pp[1], 0.03); });
      var thr = new THREE.Vector3(pB[0] - pA[0], pB[1] - pA[1], 0); q(mw, new THREE.CylinderGeometry(0.0015, 0.0015, thr.length(), 4), rMat(0xb01a20, { roughness: 0.8 }), (pA[0] + pB[0]) / 2, (pA[1] + pB[1]) / 2, 0.026, 0, 0, Math.atan2(thr.y, thr.x) - Math.PI / 2);
    })();
    hideSolids.push([-3.95, 0.75, 0.3]);
    // (straw scattered over the floor)
    var strawM = rMat(0xc8a860, { roughness: 1 });
    for (var sw = 0; sw < 80; sw++) { var sx = -W + 0.5 + ((sw * 53) % 80) / 80 * (HDI_W - 1), sz = -D + 0.5 + ((sw * 37) % 60) / 60 * (HDI_D - 1.6); if (sx > -2.6 && sx < 0.6 && sz > -0.4 && sz < 1.2) continue;
      var sp2 = p(new THREE.CylinderGeometry(0.003, 0.003, 0.14, 3), strawM, sx, 0.006, sz, Math.PI / 2, sw, 0); sp2.castShadow = false; }
    R.traverse(function (o) { if (o.isMesh) o.receiveShadow = true; });
  })(hideRoom);
  updateCarpenter = (function (base) { return function (t, night) {     // (the rune and the crow outside; the cauldron's steam and the embers inside)
    base.apply(this, arguments);
    if (inHide) {
      hfSteam.forEach(function (st) { var f = (t * 0.25 + st.k) % 1; st.s.position.y = 0.65 + f * 0.9; st.s.position.x = HDI_X + HDI_W / 2 - 0.42 + Math.sin(f * 6 + st.k * 5) * 0.06; st.s.scale.setScalar(0.15 + f * 0.35); st.s.material.opacity = 0.22 * Math.sin(f * Math.PI); });
      if (hfEmbers) hfEmbers.emissiveIntensity = 1.0 + Math.sin(t * 5) * 0.3 + Math.sin(t * 17) * 0.15;
    } else {
      var hr = state.minutes / 60, nt = hr < 5.5 || hr > 20 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr > 18.5 ? (hr - 18.5) / 1.5 : 0;
      if (hfRune) hfRune.opacity = 0.3 + nt * (0.6 + Math.sin(t * 1.7) * 0.15);   // (the crest: a faint shimmer by day, glowing after dark)
      if (hfRuneGlow) hfRuneGlow.material.opacity = 0.08 + nt * (0.55 + Math.sin(t * 1.7) * 0.12);
      if (hfCrow) { var hd = hfCrow.userData.head; var lookT = Math.floor(t / 2.6); hd.rotation.y = Math.sin(lookT * 12.9898) * 0.9; hd.rotation.x = Math.sin(t * 1.3) * 0.1; }
    }
  }; })(updateCarpenter);

  // ===== The Hollow Fang's shop, at the long table in the den: stand by the table and press Interact (E, or Interact on a
  // controller) or tap its button. It's the guild's own, so it isn't on the Computer. Nothing is for sale yet: wares go in
  // HF_STOCK below, each { name, icon, price, info, buy: function () { ... return true if bought } } =====
  var HF_STOCK = [], hfShopOpen = false, HF_TABLE = [-1.0, 0.4];
  var hfShopBtn = document.createElement('button'); hfShopBtn.type = 'button'; hfShopBtn.className = 'sleep-btn ship-btn'; hfShopBtn.innerHTML = '🗡️ Guild Shop <kbd>E</kbd>'; canvas.parentNode.appendChild(hfShopBtn);
  var hfShopBox = document.createElement('div'); hfShopBox.className = 'inventory ship mailbox hf-shop'; hfShopBox.hidden = true;
  hfShopBox.innerHTML = '<div class="inv-head"><b>🗡️ Guild Shop</b><button type="button" class="inv-close" aria-label="Close the guild shop">✕</button></div><div class="mb-body"></div>';
  canvas.parentNode.appendChild(hfShopBox);
  function renderHfShop() {
    var b = hfShopBox.querySelector('.mb-body'); b.innerHTML = '';
    var intro = document.createElement('p'); intro.className = 'ship-hint'; intro.textContent = 'Gear for the guild\'s own, and no questions asked. Members only.'; b.appendChild(intro);
    if (!HF_STOCK.length) { var em = document.createElement('div'); em.className = 'mb-empty'; em.innerHTML = '<b>🗡️</b>'; var p1 = document.createElement('p'); p1.textContent = 'Nothing is for sale yet.'; var p2 = document.createElement('p'); p2.textContent = 'Check back soon, adventurer.'; em.appendChild(p1); em.appendChild(p2); b.appendChild(em); }
    else HF_STOCK.forEach(function (it) {
      var row = document.createElement('div'); row.className = 'shop-item'; row.innerHTML = '<div class="slot shop-pic"></div><div class="shop-text"><b></b><span></span><span class="shop-price"><img class="coin-icon" alt=""> </span></div>';
      row.querySelector('.shop-pic').textContent = it.icon || ''; row.querySelector('b').textContent = it.name; row.querySelector('.shop-text span').textContent = it.info || ''; row.querySelector('.shop-price').appendChild(document.createTextNode(it.price.toLocaleString('en-US')));
      var buy = document.createElement('button'); buy.type = 'button'; buy.textContent = 'Buy'; buy.disabled = state.coins < it.price;
      buy.addEventListener('click', function (e) { e.stopPropagation(); if (state.coins < it.price) { showToast('Not enough Star Coins', 1800); return; } if (it.buy && it.buy() === false) return; state.coins -= it.price; showCoins(true); coinSound(10); renderBag(); renderHfShop(); });
      var bw = document.createElement('div'); bw.className = 'shop-buy'; bw.appendChild(buy); b.appendChild(row); b.appendChild(bw); });
    var tot = document.createElement('p'); tot.className = 'ship-total'; tot.innerHTML = 'You have <img class="coin-icon" alt=""> <b></b>'; tot.querySelector('b').textContent = state.coins; b.appendChild(tot);
    var r2 = document.createElement('div'); r2.className = 'mb-row'; var cl = document.createElement('button'); cl.type = 'button'; cl.className = 'mb-quiet'; cl.textContent = 'Close'; cl.addEventListener('click', function () { closeHfShop(); focusGame(); }); r2.appendChild(cl); b.appendChild(r2); paintCoinIcons(b);
  }
  function openHfShop() { if (hfShopOpen) return; toggleBag(false); hfShopOpen = true; menuOpenedAt = Date.now(); walkTarget = null; hfShopBox.hidden = false; renderHfShop(); }
  function closeHfShop() { hfShopOpen = false; hfShopBox.hidden = true; }
  hfShopBox.querySelector('.inv-close').addEventListener('click', function () { closeHfShop(); focusGame(); });
  hfShopBtn.addEventListener('click', function () { openHfShop(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && hfShopOpen) { e.stopImmediatePropagation(); e.preventDefault(); closeHfShop(); } }, true);   // (Escape, or ○ / B on a controller)
  function atHfTable(margin) { if (!inHide) return false; var m = margin || 0; return Math.abs(player.position.x - HDI_X - HF_TABLE[0]) < 2.0 + m && Math.abs(player.position.z - HDI_Z - HF_TABLE[1]) < 1.3 + m; }
  window.everdawnGuildShop = { stock: HF_STOCK, refresh: function () { if (hfShopOpen) renderHfShop(); } };   // (for the wares to come)
  interact = (function (base) { return function () {
    if (hfShopOpen) { if (!menuJustOpened()) closeHfShop(); return; }
    if (atHfTable() && !doorBusy) { openHfShop(); return; }
    return base.apply(this, arguments);
  }; })(interact);
  updateCarpenter = (function (base) { return function (t, night) {
    base.apply(this, arguments);
    if (hfShopOpen && !atHfTable(1.0)) closeHfShop();                     // (it shuts if you walk away from the table)
    if (hfShopOpen) { var hc = hfShopBox.querySelector('.ship-total b'); if (hc && hc.textContent !== String(state.coins)) renderHfShop(); }
    var show = atHfTable() && !hfShopOpen;
    if (hfShopBtn.classList.contains('show') !== show) hfShopBtn.classList.toggle('show', show);
  }; })(updateCarpenter);

  // ===== Seashell Shore: a beach island out to the east, across a third copy of the grand bridge. Where your other islands
  // float in the open sky, this one sits on a real ocean that runs out to the horizon (fading away to the west, so it never
  // laps at your farm): turquoise shallows over rippled sand, deep blue further out, waves rolling in and breaking in foam on
  // the beach. A grassy bluff where the bridge lands, then dunes of beach grass and palms, a pale sand beach, and a weathered
  // boardwalk running out over the dunes and on as a long pier, with a lookout gazebo, striped cabanas, a little lighthouse at
  // the pier's end, a rowboat tied up, buoys bobbing and gulls wheeling overhead =====
  var SEA_Y = -0.55, B3_Z = 2, B3_DX = 2.5, DECK_Y = 0.55;
  function onBridge3(x, z) { return Math.abs(z - B3_Z) < BRIDGE_W / 2 - 0.45 && x > 32 && x < B3_DX + BRIDGE_Z1 + 1; }
  function bridge3Y(x) { return bridgeY(x - B3_DX); }
  function shoreS(x, z) { var dz = z - B3_Z; return Math.min(146 - 0.0085 * dz * dz - x, (50 - Math.abs(dz)) * 1.3) + noise(x * 0.05 + 7, z * 0.05 - 3) * 3.5; }   // (how far in from the shore)
  var BW_DECKS = [[89, 182, B3_Z - 1.5, B3_Z + 1.5], [172, 182, B3_Z - 8, B3_Z + 8], [107, 109.6, B3_Z - 14.6, B3_Z - 1.4], [111, 113.6, B3_Z + 1.4, B3_Z + 16]], GAZ_X = 108.3, GAZ_Z = B3_Z - 18, GAZ_R = 3.6;
  function deckY(x, z, m) {                                            // the boardwalk's height here (m in from its edges), or -99 off it
    m = m || 0;
    if (x > 84 - m && x < 89 + m && Math.abs(z - B3_Z) < 1.5 - m) return 0.06 + (DECK_Y - 0.06) * Math.max(0, Math.min(1, (x - 84) / 5));   // (a ramp up from the bridge)
    for (var i = 0; i < BW_DECKS.length; i++) { var d = BW_DECKS[i]; if (x > d[0] + m && x < d[1] - m && z > d[2] + m && z < d[3] - m) return DECK_Y; }
    if (Math.hypot(x - GAZ_X, z - GAZ_Z) < GAZ_R - m) return DECK_Y;
    return -99;
  }
  function beachH0(x, z) {
    var s = shoreS(x, z), h;
    if (s < 0) h = SEA_Y + s * 0.085 - Math.max(0, -s - 14) * 0.15;   // (the seabed, shelving away and then dropping off)
    else { h = SEA_Y + Math.min(1, s / 9) * 0.68; var du = Math.max(0, Math.min(1, (s - 9) / 12)); du = du * du * (3 - 2 * du);
      h += du * (0.32 + 0.22 * Math.sin(x * 0.35 + z * 0.12) * Math.sin(z * 0.27 - x * 0.08) + noise(x * 0.15, z * 0.15) * 0.15); }   // (the beach, then rolling dunes)
    var wd = Math.max(0, Math.min(1, (82.6 - x) / 2.4)); h = h * (1 - wd) - 5 * wd;   // (the bluff's rocky west face)
    var bl = Math.max(0, Math.min(1, 1 - (Math.hypot(x - 84, z - B3_Z) - 3) / 4)); h = h * (1 - bl) + 0.06 * bl;   // (level where the bridge lands)
    return Math.max(-7, h);
  }
  function beachH(x, z) { var h = beachH0(x, z); if (deckY(x, z, -1.6) > -99) h = Math.min(h, DECK_Y - 0.28); return h; }
  function beachWalk(x, z) { if (x < 82.9 || x > 190 || Math.abs(z - B3_Z) > 62) return false; if (deckY(x, z, 0.35) > -99) return true; return beachH(x, z) > SEA_Y + 0.06; }
  walkable = (function (base) { return function (x, z) { return base(x, z) || onBridge3(x, z) || beachWalk(x, z); }; })(walkable);
  barnRampHeight = (function (base) { return function (x, z) { var b = base(x, z); if (x < 31.5) return b;
    if (onBridge3(x, z)) return b + Math.max(0, bridge3Y(x));
    if (x > 82.5) return b + Math.max(deckY(x, z, 0), Math.max(SEA_Y, beachH(x, z)));
    return b; }; })(barnRampHeight);
  (function () {
    var sd = 6007; function cr() { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; }
    function q(par, geo, m, x, y, z, rx, ry, rz) { return cpPart(geo, m, x, y, z, rx, ry, rz, par); }
    function quiet(o) { o.castShadow = false; return o; }
    function grp(x, y, z, ry, par) { var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; (par || scene).add(g); return g; }
    function gh(x, z) { return Math.max(SEA_Y, beachH(x, z)); }
    var G = new THREE.Group(); scene.add(G);
    // ---- the bridge out: the first bridge copied once more, turned east. First, the grass at its foot is cleared ----
    var m4 = new THREE.Matrix4(), v3 = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    scene.traverse(function (o) { if (!o.isInstancedMesh) return; o.updateWorldMatrix(true, false); var ch = false;
      for (var i = 0; i < o.count; i++) { o.getMatrixAt(i, m4); v3.setFromMatrixPosition(m4).applyMatrix4(o.matrixWorld); if (v3.x > 31.8 && v3.x < 36 && Math.abs(v3.z - B3_Z) < 3.4) { o.setMatrixAt(i, zero); ch = true; } }
      if (ch) o.instanceMatrix.needsUpdate = true; });
    var bridge3 = new THREE.Group(); bridge3.position.set(B3_DX, 0, B3_Z); bridge3.rotation.y = Math.PI / 2; scene.add(bridge3);   // (the first bridge's (x, z) becomes (z + 2.5, 2 - x))
    var copies3 = bridgeOriginals.map(function (o) { var c = o.clone(true); bridge3.add(c); return c; }), sync3 = [];
    bridgeLanterns.forEach(function (l) { var i = bridgeOriginals.indexOf(l.g); if (i >= 0) sync3.push([l.g, copies3[i]]); });
    bridgeDrifters.forEach(function (d) { var i = bridgeOriginals.indexOf(d.m); if (i >= 0) sync3.push([d.m, copies3[i]]); });
    updateBridge2 = (function (base) { return function () { base(); for (var i = 0; i < sync3.length; i++) syncTree(sync3[i][0], sync3[i][1]); }; })(updateBridge2);
    solids.slice(bridgeFirstSolid, bridgeEndSolid).forEach(function (s) { solids.push({ x: B3_DX + s.z, z: B3_Z - s.x, r: s.r }); });
    // ---- the land: bluff, dunes and beach, and the seabed under the shallows ----
    var sandT = cpTex(256, 256, function (g, w, h) { g.fillStyle = '#f2f2f2'; g.fillRect(0, 0, w, h); for (var i = 0; i < 9000; i++) { var c = 200 + Math.floor(cr() * 55); g.fillStyle = 'rgba(' + c + ',' + c + ',' + (c - 10) + ',0.6)'; g.fillRect(cr() * w, cr() * h, 1 + (i % 3 === 0), 1); }
      for (i = 0; i < 300; i++) { g.fillStyle = i % 2 ? 'rgba(120,110,100,0.35)' : 'rgba(255,255,255,0.7)'; g.fillRect(cr() * w, cr() * h, 1.5, 1.5); } }, [1, 1]);
    var TX0 = 79, TX1 = 200, TZ0 = B3_Z - 64, TZ1 = B3_Z + 64, NX = TX1 - TX0, NZ = TZ1 - TZ0, pos = [], col = [], uv = [], idx = [], c = new THREE.Color();
    var cGrass = new THREE.Color(0x86bd5e), cGrass2 = new THREE.Color(0x5e9a48), cSand = new THREE.Color(0xf4e3b8), cSand2 = new THREE.Color(0xe4cb98), cWet = new THREE.Color(0xb49a6c), cUnder = new THREE.Color(0xd4c08a), cRock = new THREE.Color(0x77706a);
    for (var iz = 0; iz <= NZ; iz++) for (var ix = 0; ix <= NX; ix++) { var x = TX0 + ix, z = TZ0 + iz, h = beachH(x, z), s = shoreS(x, z);
      pos.push(x, h, z); uv.push(x * 0.3, z * 0.3);
      if (x < 83 && h < -0.1) c.copy(cRock).multiplyScalar(0.85 + noise(x * 0.9, z * 0.9) * 0.15);
      else if (h < SEA_Y - 0.02) c.copy(cUnder).lerp(cWet, Math.min(1, (SEA_Y - h) / 3) * 0.6).multiplyScalar(1 - Math.min(0.35, (SEA_Y - h) * 0.06));   // (wet sand under the shallows, darker deeper)
      else if (s < 2.6) c.copy(cWet).lerp(cSand2, Math.max(0, s / 2.6));
      else { c.copy(cSand).lerp(cSand2, noise(x * 0.4, z * 0.4) * 0.5 + 0.5); var gg = Math.max(0, Math.min(1, (s - 23) / 8)) * (0.6 + 0.4 * (noise(x * 0.2 + 3, z * 0.2) * 0.5 + 0.5)); if (gg > 0) c.lerp(cGrass, gg).lerp(cGrass2, gg * (noise(x * 0.5 - 4, z * 0.5) * 0.5 + 0.4)); }
      col.push(c.r, c.g, c.b); }
    for (iz = 0; iz < NZ; iz++) for (ix = 0; ix < NX; ix++) { var a = iz * (NX + 1) + ix, b = a + 1, d = a + NX + 1, e = d + 1; idx.push(a, d, b, b, d, e); }
    var tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); tg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); tg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); tg.setIndex(idx); tg.computeVertexNormals();
    var land = new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, map: sandT, roughness: 0.95 })); land.receiveShadow = true; G.add(land);
    // ---- the ocean ----
    var OCX = 132, RINGS = 72, SEGS = 192, opos = [], odep = [], oidx = [];
    function oVert(x, z) { opos.push(x, 0, z); odep.push(x >= TX0 && x <= TX1 && z >= TZ0 && z <= TZ1 ? SEA_Y - beachH(x, z) : 8); }
    oVert(OCX, B3_Z);
    for (var r = 1; r <= RINGS; r++) { var rr = 470 * Math.pow(r / RINGS, 2.1); for (var sg = 0; sg < SEGS; sg++) { var oa = sg / SEGS * Math.PI * 2; oVert(OCX + Math.cos(oa) * rr, B3_Z + Math.sin(oa) * rr); } }
    for (sg = 0; sg < SEGS; sg++) oidx.push(0, 1 + (sg + 1) % SEGS, 1 + sg);
    for (r = 1; r < RINGS; r++) { var i0 = 1 + (r - 1) * SEGS, o0 = 1 + r * SEGS; for (sg = 0; sg < SEGS; sg++) { var A = i0 + sg, B = i0 + (sg + 1) % SEGS, C = o0 + sg, D = o0 + (sg + 1) % SEGS; oidx.push(A, B, C, B, D, C); } }
    var og = new THREE.BufferGeometry(); og.setAttribute('position', new THREE.Float32BufferAttribute(opos, 3)); og.setAttribute('depth', new THREE.Float32BufferAttribute(odep, 1)); og.setIndex(oidx);
    var oU = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {}]); oU.uTime = waterUniforms.uTime; oU.uNight = waterUniforms.uNight; oU.uSky = waterUniforms.uSky; oU.uSunDir = waterUniforms.uSunDir; oU.uSunColor = waterUniforms.uSunColor;
    var oceanMat = new THREE.ShaderMaterial({ uniforms: oU, transparent: true, depthWrite: false, fog: true,
      vertexShader: ['attribute float depth;', 'uniform float uTime;', 'varying float vDepth;', 'varying vec3 vWorld;', '#include <fog_pars_vertex>', 'void main() {', '  vDepth = depth;', '  vec4 w = modelMatrix * vec4(position, 1.0);',
        '  float sw = smoothstep(0.8, 3.5, depth);', '  w.y += sw * (0.09 * sin(w.x * 0.17 + uTime * 1.1) + 0.06 * sin(w.z * 0.23 - uTime * 0.8 + w.x * 0.05));',   // (a slow swell out in the deep)
        '  vWorld = w.xyz;', '  vec4 mvPosition = viewMatrix * w;', '  gl_Position = projectionMatrix * mvPosition;', '  #include <fog_vertex>', '}'].join('\n'),
      fragmentShader: ['uniform float uTime;', 'uniform float uNight;', 'uniform vec3 uSky;', 'uniform vec3 uSunDir;', 'uniform vec3 uSunColor;', 'varying float vDepth;', 'varying vec3 vWorld;', '#include <fog_pars_fragment>',
        'float waves(vec2 p) {', '  return 0.05 * sin(dot(p, vec2(1.0, 0.4)) * 0.9 + uTime * 1.3) + 0.035 * sin(dot(p, vec2(-0.6, 1.0)) * 1.7 + uTime * 1.7)', '    + 0.02 * sin(dot(p, vec2(0.3, -1.0)) * 3.9 + uTime * 2.4) + 0.012 * sin(dot(p, vec2(-1.0, -0.3)) * 7.3 + uTime * 3.1) + 0.006 * sin(dot(p, vec2(0.8, 0.9)) * 13.0 + uTime * 4.0);', '}',
        'void main() {', '  vec2 p = vWorld.xz;', '  float h = waves(p);', '  vec3 n = normalize(vec3(-(waves(p + vec2(0.08, 0.0)) - h) / 0.08, 1.0, -(waves(p + vec2(0.0, 0.08)) - h) / 0.08));',
        '  vec3 v = normalize(cameraPosition - vWorld);', '  float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, v), 0.0), 5.0);',
        '  vec3 col = mix(vec3(0.38, 0.9, 0.84), vec3(0.06, 0.62, 0.76), smoothstep(0.0, 1.4, vDepth));', '  col = mix(col, vec3(0.03, 0.26, 0.5), smoothstep(1.4, 6.0, vDepth));',   // (turquoise shallows, then blue, then deep)
        '  col = mix(col, mix(uSky, vec3(1.0), 0.25), fres * 0.7);', '  float spec = pow(max(dot(n, normalize(uSunDir + v)), 0.0), 220.0) * 2.0;', '  col += uSunColor * spec;',
        '  float lap = 0.07 + 0.06 * sin(uTime * 0.9 + p.y * 0.15);', '  float foam = smoothstep(lap + 0.1, lap, vDepth);',   // (foam where the waves wash up the sand, back and forth)
        '  float surf = smoothstep(0.86, 1.0, sin(vDepth * 5.0 - uTime * 1.5 + sin(p.y * 0.2) * 0.6)) * smoothstep(1.7, 0.4, vDepth) * smoothstep(0.03, 0.25, vDepth);',   // (lines of surf rolling in)
        '  float fn = 0.6 + 0.4 * sin(p.x * 3.1 + p.y * 2.3 + uTime) * sin(p.x * 1.7 - p.y * 2.9);', '  foam = clamp((foam + surf * 0.7) * fn, 0.0, 1.0);',
        '  col = mix(col, vec3(0.96, 0.99, 1.0), foam * 0.85);', '  col *= mix(1.0, 0.55, uNight);',
        '  float alpha = clamp(mix(0.35, 0.95, smoothstep(0.0, 1.8, vDepth)) + fres * 0.25 + spec + foam * 0.5, 0.0, 1.0);', '  float odz = (vWorld.z - 2.0) * 0.8, xe = 122.0 - sqrt(max(0.0, 5625.0 - odz * odz)) + sin(vWorld.z * 0.07) * 4.0 + sin(vWorld.z * 0.19 + 1.0) * 2.0;', '  alpha *= smoothstep(xe - 5.0, xe + 40.0, vWorld.x);',   // (fading away round its western side, toward your island)
        '  gl_FragColor = vec4(col, alpha);', '  #include <fog_fragment>', '}'].join('\n') });
    var ocean = new THREE.Mesh(og, oceanMat); ocean.position.y = SEA_Y; ocean.renderOrder = 1; ocean.frustumCulled = false; G.add(ocean);
    var mists = [];   // (a soft bank of sea mist where the ocean ends, toward your island)
    for (var mi = 0; mi < 26; mi++) { var ma = Math.PI * 0.5 + (mi / 25) * Math.PI, mr = 72 + cr() * 10, ms = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffffff, transparent: true, opacity: 0.32 + cr() * 0.15, depthWrite: false, fog: true })); ms.position.set(122 + Math.cos(ma) * mr, SEA_Y + 0.5 + cr() * 2.5, B3_Z + Math.sin(ma) * mr / 0.8); var msc = 22 + cr() * 18; ms.scale.set(msc * 1.8, msc * 0.55, 1); ms.renderOrder = 2; G.add(ms); mists.push({ s: ms, k: cr() * 6, x: ms.position.x }); }
    // ---- rocks along the bluff's foot and at the ends of the beach ----
    var rockM = [0x7a7268, 0x6a645c, 0x8a8278].map(function (cc) { return rMat(cc, { roughness: 0.95 }); }), mossy = rMat(0x5a7a4a, { roughness: 1 });
    function rock(x, z, s, k) { var y = beachH0(x, z); var rk = q(G, new THREE.DodecahedronGeometry(s, 1), rockM[k % 3], x, Math.max(y, SEA_Y - 0.6) + s * 0.25, z, cr() * 3, cr() * 3, cr() * 3); rk.scale.set(1.2, 0.7, 1); if (k % 3 === 0) quiet(q(G, new THREE.SphereGeometry(s * 0.6, 8, 5), mossy, x, Math.max(y, SEA_Y - 0.6) + s * 0.55, z)).scale.set(1.2, 0.3, 1); solids.push({ x: x, z: z, r: s * 1.1 }); }
    for (var rb = 0; rb < 26; rb++) rock(81.6 + cr() * 1.6, B3_Z - 50 + rb * 4 + cr() * 2, 0.5 + cr() * 0.8, rb);
    [[126, B3_Z - 47], [131, B3_Z - 44], [134, B3_Z - 40], [128, B3_Z + 48], [133, B3_Z + 45], [137, B3_Z + 41], [122, B3_Z - 50], [124, B3_Z + 51]].forEach(function (p2, k) { rock(p2[0], p2[1], 0.6 + cr() * 0.9, k); rock(p2[0] + 1.2, p2[1] + (cr() - 0.5) * 2, 0.3 + cr() * 0.4, k + 1); });
    // ---- the boardwalk and the pier ----
    var plankT = cpTex(256, 32, function (g, w, h) { g.fillStyle = '#b8a58a'; g.fillRect(0, 0, w, h); for (var i = 0; i < 24; i++) { g.strokeStyle = 'rgba(70,56,40,' + (0.15 + cr() * 0.25).toFixed(2) + ')'; g.lineWidth = 0.8; g.beginPath(); var y0 = cr() * h; g.moveTo(0, y0); g.bezierCurveTo(w * 0.3, y0 + (cr() - 0.5) * 6, w * 0.7, y0 + (cr() - 0.5) * 6, w, y0); g.stroke(); }
      for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(60,46,32,0.5)'; g.beginPath(); g.ellipse(cr() * w, cr() * h, 4, 2, 0, 0, 6.28); g.fill(); } g.fillStyle = 'rgba(40,30,20,0.8)'; [6, w - 6].forEach(function (nx) { [8, h - 8].forEach(function (ny) { g.beginPath(); g.arc(nx, ny, 1.6, 0, 6.28); g.fill(); }); }); });
    var plankM = new THREE.MeshStandardMaterial({ map: plankT, roughness: 0.85 }), beamM = rMat(0x7a6650, { roughness: 0.9 }), pileM = rMat(0x6a5a46, { roughness: 0.95 }), wetM = rMat(0x3a4a3a, { roughness: 1 });
    var planks = []; function plank(x, y, z, len, along, tilt) { planks.push([x, y, z, len, along, tilt || 0]); }
    for (var px = 84.1; px < 172; px += 0.24) { var dy = deckY(px, B3_Z, 0); if (dy < -90) continue; var tl = px < 89 ? Math.atan((DECK_Y - 0.06) / 5) : 0; plank(px, dy - 0.025, B3_Z, 3.0, 'z', tl); }
    for (var pz = B3_Z - 7.9; pz < B3_Z + 7.95; pz += 0.24) plank(177, DECK_Y - 0.025, pz, 10, 'x');
    for (pz = B3_Z - 14.5; pz < B3_Z - 1.5; pz += 0.24) plank(108.3, DECK_Y - 0.025, pz, 2.6, 'x');
    for (pz = B3_Z + 1.62; pz < B3_Z + 15.95; pz += 0.24) plank(112.3, DECK_Y - 0.025, pz, 2.6, 'x');
    for (pz = GAZ_Z - GAZ_R + 0.1; pz < GAZ_Z + GAZ_R; pz += 0.24) { var hw = Math.sqrt(Math.max(0, GAZ_R * GAZ_R - (pz - GAZ_Z) * (pz - GAZ_Z))); if (hw > 0.3) plank(GAZ_X, DECK_Y - 0.025, pz, hw * 2, 'x'); }
    var pkM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.05, 1), plankM, planks.length), pq = new THREE.Quaternion(), pe = new THREE.Euler(), ps = new THREE.Vector3(), pv = new THREE.Vector3(), pm = new THREE.Matrix4(), pc = new THREE.Color();
    planks.forEach(function (p2, k) { if (p2[4] === 'z') { pe.set(0, 0, p2[5]); ps.set(0.215, 1, p2[3]); } else { pe.set(0, 0, 0); ps.set(p2[3], 1, 0.215); } pq.setFromEuler(pe); pv.set(p2[0], p2[1], p2[2]); pm.compose(pv, pq, ps); pkM.setMatrixAt(k, pm); var pw = 0.8 + cr() * 0.25; pc.setRGB(pw, pw * (0.97 + cr() * 0.03), pw * (0.93 + cr() * 0.05)); pkM.setColorAt(k, pc); });
    pkM.castShadow = true; pkM.receiveShadow = true; G.add(pkM);
    function beamsAlong(x0, x1, z0, z1, alongX) { [-1, 1].forEach(function (sdd) { if (alongX) q(G, new THREE.BoxGeometry(x1 - x0, 0.14, 0.12), beamM, (x0 + x1) / 2, DECK_Y - 0.12, sdd < 0 ? z0 + 0.06 : z1 - 0.06); else q(G, new THREE.BoxGeometry(0.12, 0.14, z1 - z0), beamM, sdd < 0 ? x0 + 0.06 : x1 - 0.06, DECK_Y - 0.12, (z0 + z1) / 2); }); }
    beamsAlong(89, 172, B3_Z - 1.5, B3_Z + 1.5, true); beamsAlong(172, 182, B3_Z - 8, B3_Z + 8, false); beamsAlong(107, 109.6, B3_Z - 14.6, B3_Z - 1.5, false); beamsAlong(111, 113.6, B3_Z + 1.5, B3_Z + 16, false);
    function piling(x, z, rad) { var top = DECK_Y - 0.1, bot = beachH0(x, z) - 0.6, len = top - bot; q(G, new THREE.CylinderGeometry(rad || 0.11, (rad || 0.11) * 1.08, len, 8), pileM, x, (top + bot) / 2, z);
      if (bot < SEA_Y) { var wl = SEA_Y + 0.12 - bot; q(G, new THREE.CylinderGeometry((rad || 0.11) * 1.06, (rad || 0.11) * 1.12, wl, 8), wetM, x, bot + wl / 2, z); }   // (dark and weedy below the tide line)
      return top; }
    for (px = 90; px < 172; px += 2.6) [-1, 1].forEach(function (sdd) { piling(px, B3_Z + sdd * 1.45); });
    for (px = 172.2; px <= 182; px += 2.45) for (pz = B3_Z - 7.9; pz <= B3_Z + 8; pz += 3.95) piling(px, pz, 0.14);
    for (pz = B3_Z - 14; pz < -0.5 + B3_Z; pz += 2.6) [107.05, 109.55].forEach(function (xx) { piling(xx, pz); });
    for (pz = B3_Z + 3; pz < B3_Z + 16; pz += 2.6) [111.05, 113.55].forEach(function (xx) { piling(xx, pz); });
    for (var ga = 0; ga < 8; ga++) piling(GAZ_X + Math.cos(ga / 8 * Math.PI * 2) * (GAZ_R - 0.2), GAZ_Z + Math.sin(ga / 8 * Math.PI * 2) * (GAZ_R - 0.2), 0.13);
    // (railings: rope looped post to post over the dunes; sturdy wooden rails along the pier)
    var postM = rMat(0x8a7458, { roughness: 0.9 }), ropeM = rMat(0xd8c49a, { roughness: 1 });
    function ropeRail(x0, z0, x1, z1) { var L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.4)), prev = null;
      for (var i = 0; i <= n; i++) { var t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = Math.max(DECK_Y, deckY(x, z, -0.3)); if (y < -90) y = DECK_Y;
        q(G, new THREE.CylinderGeometry(0.06, 0.07, 0.95, 8), postM, x, y + 0.45, z); q(G, new THREE.SphereGeometry(0.075, 8, 6), postM, x, y + 0.95, z);
        if (prev) { var mid = new THREE.Vector3((prev.x + x) / 2, (prev.y + y) / 2 + 0.62, (prev.z + z) / 2); q(G, new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(prev.x, prev.y + 0.86, prev.z), mid, new THREE.Vector3(x, y + 0.86, z)), 10, 0.022, 5), ropeM, 0, 0, 0); }
        prev = { x: x, y: y, z: z }; solids.push({ x: x, z: z, r: 0.12 }); } }
    function woodRail(x0, z0, x1, z1) { var L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(L / 2.6)), ang = Math.atan2(z1 - z0, x1 - x0);
      for (var i = 0; i <= n; i++) { var t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t; q(G, new THREE.BoxGeometry(0.11, 1.0, 0.11), postM, x, DECK_Y + 0.5, z); solids.push({ x: x, z: z, r: 0.1 }); }
      q(G, new THREE.BoxGeometry(L + 0.1, 0.08, 0.14), postM, (x0 + x1) / 2, DECK_Y + 1.0, (z0 + z1) / 2, 0, -ang, 0); q(G, new THREE.BoxGeometry(L, 0.05, 0.06), postM, (x0 + x1) / 2, DECK_Y + 0.55, (z0 + z1) / 2, 0, -ang, 0); }
    [-1, 1].forEach(function (sdd) { var ez = B3_Z + sdd * 1.42;
      ropeRail(89.2, ez, sdd < 0 ? 106.9 : 110.9, ez); ropeRail(sdd < 0 ? 109.7 : 113.7, ez, 136, ez); woodRail(136, ez, 172, ez); });
    ropeRail(106.9, B3_Z - 1.6, 106.9, B3_Z - 14.4); ropeRail(109.7, B3_Z - 1.6, 109.7, B3_Z - 14.4); ropeRail(110.9, B3_Z + 1.6, 110.9, B3_Z + 15.8); ropeRail(113.7, B3_Z + 1.6, 113.7, B3_Z + 15.8);
    woodRail(172, B3_Z - 7.9, 172, B3_Z - 1.6); woodRail(172, B3_Z + 1.6, 172, B3_Z + 7.9); woodRail(172, B3_Z - 7.9, 181.9, B3_Z - 7.9); woodRail(172, B3_Z + 7.9, 181.9, B3_Z + 7.9); woodRail(181.9, B3_Z - 7.9, 181.9, B3_Z + 7.9);
    // (lamp posts along it, strung with lights between)
    var lampIron = rMat(0x2a3a3a, { metalness: 0.5, roughness: 0.45 }), glowM = rMat(0xfff0c8, { emissive: 0xffc870, emissiveIntensity: 0.5 }), lampGlows = [], bulbs = [], bulbM = [0xffd890, 0xffb0c0, 0xa8e0ff, 0xc8ffb0].map(function (cc) { return rMat(cc, { emissive: cc, emissiveIntensity: 0.4 }); });
    var lampPts = [];
    function lamp(x, z) { var y = DECK_Y, l = grp(x, y, z, 0, G); q(l, new THREE.CylinderGeometry(0.11, 0.14, 0.18, 10), lampIron, 0, 0.09, 0); q(l, new THREE.CylinderGeometry(0.045, 0.055, 2.6, 8), lampIron, 0, 1.4, 0);
      q(l, new THREE.TorusGeometry(0.12, 0.016, 5, 14, Math.PI * 1.3), lampIron, 0.12, 2.62, 0, 0, 0, -0.3); q(l, new THREE.CylinderGeometry(0.16, 0.12, 0.05, 8), lampIron, 0, 2.76, 0);
      q(l, new THREE.CylinderGeometry(0.11, 0.08, 0.26, 8), glowM, 0, 2.95, 0); q(l, new THREE.ConeGeometry(0.17, 0.16, 8), lampIron, 0, 3.15, 0); q(l, new THREE.SphereGeometry(0.035, 6, 5), lampIron, 0, 3.25, 0);
      var gs = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc070, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })); gs.position.set(0, 2.95, 0); gs.scale.set(1.6, 1.6, 1); l.add(gs); lampGlows.push(gs);
      solids.push({ x: x, z: z, r: 0.18 }); lampPts.push(new THREE.Vector3(x, y + 2.7, z)); }
    for (px = 92; px < 172; px += 12) lamp(px, B3_Z + ((px / 12 | 0) % 2 ? 1.25 : -1.25));
    lamp(172.4, B3_Z - 7.5); lamp(172.4, B3_Z + 7.5);
    for (var lp = 0; lp < lampPts.length - 2; lp++) { var la = lampPts[lp], lb = lampPts[lp + 1], mid = la.clone().add(lb).multiplyScalar(0.5); mid.y -= 0.55; var cv = new THREE.QuadraticBezierCurve3(la, mid, lb);
      q(G, new THREE.TubeGeometry(cv, 16, 0.008, 3), lampIron, 0, 0, 0); for (var bb = 1; bb < 12; bb++) { var bp = cv.getPoint(bb / 12); bulbs.push(quiet(q(G, new THREE.SphereGeometry(0.04, 6, 5), bulbM[bb % 4], bp.x, bp.y - 0.05, bp.z))); } }
    // (benches)
    var benchM = rMat(0x9a7a58, { roughness: 0.85 }), ironB = rMat(0x2a2a2a, { metalness: 0.5, roughness: 0.5 });
    function bench(x, z, ry) { var b = grp(x, DECK_Y, z, ry, G); for (var sl = 0; sl < 4; sl++) q(b, new THREE.BoxGeometry(1.6, 0.04, 0.09), benchM, 0, 0.45, -0.15 + sl * 0.1); for (sl = 0; sl < 3; sl++) q(b, new THREE.BoxGeometry(1.6, 0.09, 0.035), benchM, 0, 0.6 + sl * 0.12, -0.24, -0.15, 0, 0);
      [-0.7, 0.7].forEach(function (lx) { q(b, new THREE.BoxGeometry(0.05, 0.45, 0.05), ironB, lx, 0.22, -0.18); q(b, new THREE.BoxGeometry(0.05, 0.45, 0.05), ironB, lx, 0.22, 0.15); q(b, new THREE.BoxGeometry(0.05, 0.5, 0.05), ironB, lx, 0.72, -0.25, -0.15, 0, 0); q(b, new THREE.BoxGeometry(0.05, 0.04, 0.42), ironB, lx, 0.62, -0.02); });
      solids.push({ x: x, z: z, r: 0.5 }); }
    bench(150, B3_Z + 1.05, Math.PI); bench(160, B3_Z - 1.05, 0); bench(176, B3_Z + 7.2, Math.PI); bench(176, B3_Z - 7.2, 0);
    // (the lookout gazebo: eight posts, a white railing between, a teal shingled roof, benches round inside, a lantern hanging)
    var gz = grp(GAZ_X, DECK_Y, GAZ_Z, 0, G), whiteM = rMat(0xf2efe6, { roughness: 0.7 });
    var shT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#4a9a9a'; g.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 12) for (var x = -((y / 12) % 2) * 8; x < w; x += 16) { g.fillStyle = 'rgba(' + (40 + cr() * 30) + ',' + (130 + cr() * 40) + ',' + (130 + cr() * 40) + ',1)'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 15, y); g.lineTo(x + 15, y + 10); g.quadraticCurveTo(x + 7.5, y + 14, x, y + 10); g.closePath(); g.fill(); g.strokeStyle = 'rgba(20,60,60,0.6)'; g.stroke(); } }, [3, 2]);
    for (ga = 0; ga < 8; ga++) { var gaa = ga / 8 * Math.PI * 2 + Math.PI / 8, gx = Math.cos(gaa) * (GAZ_R - 0.25), gzz = Math.sin(gaa) * (GAZ_R - 0.25); q(gz, new THREE.BoxGeometry(0.14, 2.5, 0.14), whiteM, gx, 1.25, gzz);
      if (ga !== 1) { var nx = Math.cos(gaa + Math.PI / 4) * (GAZ_R - 0.25), nz = Math.sin(gaa + Math.PI / 4) * (GAZ_R - 0.25), L2 = Math.hypot(nx - gx, nz - gzz), an = Math.atan2(nz - gzz, nx - gx); q(gz, new THREE.BoxGeometry(L2, 0.07, 0.1), whiteM, (gx + nx) / 2, 0.85, (gzz + nz) / 2, 0, -an, 0);
        for (var bl2 = 1; bl2 < 6; bl2++) q(gz, new THREE.BoxGeometry(0.04, 0.8, 0.04), whiteM, gx + (nx - gx) * bl2 / 6, 0.42, gzz + (nz - gzz) * bl2 / 6);
        var bnch = grp((gx + nx) / 2 * 0.82, 0, (gzz + nz) / 2 * 0.82, -an, gz); q(bnch, new THREE.BoxGeometry(L2 * 0.8, 0.05, 0.36), benchM, 0, 0.42, 0); q(bnch, new THREE.BoxGeometry(L2 * 0.8, 0.4, 0.05), benchM, 0, 0.2, 0.14); }
      solids.push({ x: GAZ_X + gx, z: GAZ_Z + gzz, r: 0.15 }); }
    q(gz, new THREE.CylinderGeometry(GAZ_R + 0.1, GAZ_R + 0.1, 0.16, 8), whiteM, 0, 2.55, 0, 0, Math.PI / 8, 0); q(gz, new THREE.ConeGeometry(GAZ_R + 0.5, 1.7, 8), new THREE.MeshStandardMaterial({ map: shT, roughness: 0.75 }), 0, 3.48, 0, 0, Math.PI / 8, 0);
    q(gz, new THREE.SphereGeometry(0.12, 10, 8), whiteM, 0, 4.38, 0); q(gz, new THREE.ConeGeometry(0.05, 0.3, 6), whiteM, 0, 4.6, 0);
    q(gz, new THREE.CylinderGeometry(0.008, 0.008, 0.6, 4), lampIron, 0, 2.15, 0); q(gz, new THREE.CylinderGeometry(0.09, 0.07, 0.2, 8), glowM, 0, 1.8, 0); q(gz, new THREE.ConeGeometry(0.13, 0.12, 8), lampIron, 0, 1.96, 0);
    var gzs = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc070, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })); gzs.position.set(0, 1.8, 0); gzs.scale.set(1.4, 1.4, 1); gz.add(gzs); lampGlows.push(gzs);
    // (the lighthouse at the pier's end: white and red bands, a railed gallery, the lantern room lit, its beam sweeping at night)
    var lh = grp(180, DECK_Y, B3_Z + 5.2, 0, G), bandT = cpTex(16, 128, function (g, w, h) { for (var i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#c8342e' : '#f6f2ea'; g.fillRect(0, i * h / 4, w, h / 4); } }, [1, 1]);
    q(lh, new THREE.CylinderGeometry(1.2, 1.35, 0.4, 16), rMat(0x8a8478, { roughness: 0.9 }), 0, 0.2, 0); q(lh, new THREE.CylinderGeometry(0.75, 1.05, 5.2, 18), new THREE.MeshStandardMaterial({ map: bandT, roughness: 0.6 }), 0, 3.0, 0);
    [[0.3, 1.2], [0.2, 2.6]].forEach(function (wd2) { q(lh, new THREE.BoxGeometry(0.22, 0.34, 0.06), rMat(0x2a3a4a, { roughness: 0.2 }), 0, wd2[1] + 1.0, 0.95 - wd2[0] * 0.3); });
    q(lh, new THREE.CylinderGeometry(1.1, 0.9, 0.16, 18), rMat(0x2a2a2a, { metalness: 0.5 }), 0, 5.66, 0); for (var rl = 0; rl < 16; rl++) { var raa = rl / 16 * Math.PI * 2; q(lh, new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), rMat(0x2a2a2a), Math.cos(raa) * 1.02, 5.98, Math.sin(raa) * 1.02); }
    q(lh, new THREE.TorusGeometry(1.02, 0.025, 4, 32), rMat(0x2a2a2a), 0, 6.23, 0, Math.PI / 2, 0, 0);
    var lightM = rMat(0xfff4d0, { emissive: 0xffe090, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 }); q(lh, new THREE.CylinderGeometry(0.55, 0.55, 0.9, 12), lightM, 0, 6.2, 0);
    for (rl = 0; rl < 6; rl++) { var ra2 = rl / 6 * Math.PI * 2; q(lh, new THREE.BoxGeometry(0.05, 0.9, 0.05), rMat(0x2a2a2a), Math.cos(ra2) * 0.56, 6.2, Math.sin(ra2) * 0.56); }
    q(lh, new THREE.ConeGeometry(0.72, 0.75, 16), rMat(0xc8342e, { roughness: 0.5 }), 0, 7.03, 0); q(lh, new THREE.SphereGeometry(0.1, 8, 6), rMat(0x2a2a2a), 0, 7.45, 0);
    var beamG = new THREE.Group(); beamG.position.set(0, 6.2, 0); lh.add(beamG); var beamM2 = new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    [0, Math.PI].forEach(function (ba) { var bc = new THREE.Mesh(new THREE.ConeGeometry(1.1, 16, 16, 1, true), beamM2); bc.rotation.set(0, 0, Math.PI / 2); bc.position.set(-8, 0, 0); var bg2 = new THREE.Group(); bg2.rotation.y = ba; bg2.add(bc); beamG.add(bg2); });
    solids.push({ x: 180, z: B3_Z + 5.2, r: 1.35 });
    // (a rowboat tied up beside the pier, bobbing; three buoys)
    var boat = grp(158, SEA_Y, B3_Z - 3.6, 0.08, G), hullM = rMat(0xf2efe6, { roughness: 0.6, side: THREE.DoubleSide }), trimM = rMat(0x2a6aa8, { roughness: 0.6 });
    q(boat, new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hullM, 0, 0.28, 0).scale.set(1.7, 0.5, 0.62); q(boat, new THREE.TorusGeometry(1, 0.05, 6, 28), trimM, 0, 0.28, 0, Math.PI / 2, 0, 0).scale.set(1.7, 0.62, 1);
    q(boat, new THREE.SphereGeometry(0.99, 20, 6, 0, Math.PI * 2, Math.PI / 2, 0.25), trimM, 0, 0.27, 0).scale.set(1.71, 0.5, 0.63);
    [-0.6, 0.4].forEach(function (sx) { q(boat, new THREE.BoxGeometry(0.22, 0.04, 1.0), benchM, sx, 0.2, 0); });
    [-1, 1].forEach(function (s) { var oar = grp(-0.1, 0.32, s * 0.45, 0, boat); oar.rotation.set(s * 0.15, 0.35 * s, 0); q(oar, new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6), benchM, 0, 0, 0, 0, 0, Math.PI / 2); q(oar, new THREE.BoxGeometry(0.5, 0.02, 0.16), benchM, -1.15, 0, 0); });
    q(G, new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(159.6, SEA_Y + 0.35, B3_Z - 3.4), new THREE.Vector3(160.4, SEA_Y + 0.2, B3_Z - 2.4), new THREE.Vector3(161, DECK_Y - 0.05, B3_Z - 1.5)), 10, 0.02, 4), ropeM, 0, 0, 0);
    var buoys = [];
    [[150, B3_Z + 7], [166, B3_Z - 9], [190, B3_Z + 3]].forEach(function (bp2, k) { var bu = grp(bp2[0], SEA_Y, bp2[1], 0, G); q(bu, new THREE.SphereGeometry(0.4, 14, 10), rMat(k % 2 ? 0xd83a32 : 0xf2efe6, { roughness: 0.5 }), 0, 0.1, 0).scale.set(1, 0.7, 1); q(bu, new THREE.CylinderGeometry(0.08, 0.2, 0.9, 10), rMat(k % 2 ? 0xf2efe6 : 0xd83a32), 0, 0.65, 0); q(bu, new THREE.SphereGeometry(0.09, 8, 6), rMat(0xffd070, { emissive: 0xffa040, emissiveIntensity: 0.6 }), 0, 1.15, 0); buoys.push({ g: bu, k: k * 2.1 }); });
    // ---- on the land: palms ----
    var leafT = cpTex(256, 64, function (g, w, h) { g.clearRect(0, 0, w, h);   // (a palm frond: a pale midrib, leaflets angled off it, longest in the middle)
      for (var i = 0; i < 31; i++) { var x = 4 + i * 8, L = (h / 2 - 2) * Math.sin(Math.min(1, (x / w) * 1.1) * Math.PI) * 0.98 + 3; [-1, 1].forEach(function (sdd) { g.strokeStyle = i % 3 ? '#3f9040' : '#58a84a'; g.lineWidth = 3.4; g.beginPath(); g.moveTo(x, h / 2); g.quadraticCurveTo(x + 4, h / 2 + sdd * L * 0.5, x + 14, h / 2 + sdd * L); g.stroke(); }); }
      g.strokeStyle = '#c8b870'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); });
    var leafM = new THREE.MeshStandardMaterial({ map: leafT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.7 }), trunkT = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#9a7a54'; g.fillRect(0, 0, w, h); for (var y = 0; y < h; y += 8) { g.fillStyle = 'rgba(60,44,28,0.6)'; g.fillRect(0, y, w, 2); g.fillStyle = 'rgba(200,170,120,0.35)'; g.fillRect(0, y + 2, w, 1); } for (var i = 0; i < 80; i++) { g.fillStyle = 'rgba(60,44,28,0.25)'; g.fillRect(cr() * w, cr() * h, 2, 3); } }, [3, 8]);
    var trunkM = new THREE.MeshStandardMaterial({ map: trunkT, roughness: 0.9 }), nutM = rMat(0x6a4a2a, { roughness: 0.6 }), palms = [];
    var frondG = (function () { var fg = new THREE.PlaneGeometry(2.6, 0.62, 12, 1), fp = fg.attributes.position; for (var i = 0; i < fp.count; i++) { var s = fp.getX(i) + 1.3; fp.setX(i, s); fp.setZ(i, 0.6 * s - 0.42 * s * s); fp.setY(i, fp.getY(i) * (1 - s / 2.6 * 0.4)); } fg.rotateX(-Math.PI / 2); fg.computeVertexNormals(); return fg; })();
    function palm(x, z, ht, lean, ry) { var y0 = beachH0(x, z), p = grp(x, y0, z, ry, G), pts = [];
      for (var i = 0; i <= 6; i++) { var t = i / 6; pts.push(new THREE.Vector3(lean * t * t * ht * 0.35, t * ht, 0)); }
      var cv = new THREE.CatmullRomCurve3(pts); q(p, new THREE.TubeGeometry(cv, 18, 0.15, 8), trunkM, 0, 0, 0); q(p, new THREE.SphereGeometry(0.24, 8, 6), trunkM, 0, 0.1, 0).scale.set(1, 0.6, 1);
      var top = cv.getPoint(1), cw = grp(top.x, top.y, top.z, 0, p);
      for (var f = 0; f < 10; f++) { var fr = grp(0, 0, 0, f / 10 * Math.PI * 2 + cr() * 0.3, cw); fr.rotation.z = 0.15 + (f % 2) * 0.2; quiet(q(fr, frondG, leafM, 0, 0, 0)); }
      for (var n = 0; n < 4; n++) q(cw, new THREE.SphereGeometry(0.12, 10, 8), nutM, Math.cos(n * 1.6) * 0.15, -0.15, Math.sin(n * 1.6) * 0.15);
      palms.push({ c: cw, k: cr() * 6 }); solids.push({ x: x, z: z, r: 0.3 }); }
    [[86, B3_Z - 6, 6, 0.6], [87.5, B3_Z + 7, 5.4, -0.5], [93, B3_Z - 12, 6.5, 0.3], [96, B3_Z + 13, 5.8, 0.5], [101, B3_Z - 5, 6.2, -0.3], [100, B3_Z + 6, 5.6, 0.4], [118, B3_Z - 8, 6.8, 0.7], [121, B3_Z + 8, 6.4, -0.6], [126, B3_Z - 22, 6, 1.1], [124, B3_Z + 27, 6.3, 1.2],
      [131, B3_Z - 14, 5.6, 1.5], [133, B3_Z + 13, 6, 1.4], [115, B3_Z - 30, 6.6, 0.4], [104, B3_Z + 32, 5.9, 0.5], [92, B3_Z - 28, 6.2, 0.2], [110, B3_Z + 24, 5.5, 0.8]].forEach(function (pp) { palm(pp[0], pp[1], pp[2], pp[3], pp[3] > 1 ? 0 : cr() * 6.28); });
    // (beach grass on the dunes, shells and starfish on the sand, driftwood)
    var dg = new THREE.InstancedMesh(tuftGeometry(), new THREE.MeshStandardMaterial({ vertexColors: true, color: 0xe8dc98, side: THREE.DoubleSide, roughness: 0.9 }), 2600), dgn = 0, dm = new THREE.Matrix4(), dq = new THREE.Quaternion(), de = new THREE.Euler(), ds = new THREE.Vector3(), dv = new THREE.Vector3();
    for (var t2 = 0; t2 < 12000 && dgn < 2600; t2++) { var gx2 = 83 + cr() * 70, gz2 = B3_Z - 52 + cr() * 104, s2 = shoreS(gx2, gz2); if (s2 < 10 || deckY(gx2, gz2, -0.5) > -99 || cr() > Math.min(1, (s2 - 10) / 6)) continue;
      de.set((cr() - 0.5) * 0.4, cr() * 6.28, (cr() - 0.5) * 0.4); dq.setFromEuler(de); var sc = 0.7 + cr() * 0.9; ds.set(sc, sc * (1.2 + cr() * 0.8), sc); dv.set(gx2, beachH(gx2, gz2), gz2); dm.compose(dv, dq, ds); dg.setMatrixAt(dgn++, dm); }
    dg.count = dgn; dg.frustumCulled = false; G.add(dg);
    var shellCols = [0xf6dcd0, 0xf2c2b0, 0xfff4e8, 0xe8b8a0, 0xd8c8e8], sh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.07, 0.04, 9), rMat(0xffffff, { roughness: 0.5 }), 320), shn = 0;
    for (t2 = 0; t2 < 4000 && shn < 320; t2++) { var sx2 = 120 + cr() * 32, sz2 = B3_Z - 50 + cr() * 100, ss2 = shoreS(sx2, sz2); if (ss2 < 0.3 || ss2 > 9 || deckY(sx2, sz2, -0.3) > -99) continue;
      de.set((cr() - 0.5) * 0.5, cr() * 6.28, (cr() - 0.5) * 0.5); dq.setFromEuler(de); var shs = 0.6 + cr() * 0.9; ds.set(shs, shs * 0.7, shs * 1.2); dv.set(sx2, beachH(sx2, sz2) + 0.01, sz2); dm.compose(dv, dq, ds); sh.setMatrixAt(shn, dm); pc.setHex(shellCols[shn % 5]); sh.setColorAt(shn, pc); shn++; }
    sh.count = shn; sh.frustumCulled = false; G.add(sh);
    var star = new THREE.Shape(); for (var sp = 0; sp < 10; sp++) { var sa = sp / 10 * Math.PI * 2 - Math.PI / 2, sr = sp % 2 ? 0.035 : 0.1; if (sp) star.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr); else star.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr); }
    var stG = new THREE.ExtrudeGeometry(star, { depth: 0.015, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 }); stG.rotateX(-Math.PI / 2);
    var stars = new THREE.InstancedMesh(stG, rMat(0xffffff, { roughness: 0.7 }), 30), stn = 0, starCols = [0xf08a4a, 0xe8584a, 0xf2b048, 0xb85aa8];
    for (t2 = 0; t2 < 2000 && stn < 30; t2++) { var tx2 = 125 + cr() * 25, tz2 = B3_Z - 45 + cr() * 90, ts2 = shoreS(tx2, tz2); if (ts2 < 0.5 || ts2 > 5) continue; de.set(0, cr() * 6.28, 0); dq.setFromEuler(de); ds.set(1, 1, 1); dv.set(tx2, beachH(tx2, tz2) + 0.005, tz2); dm.compose(dv, dq, ds); stars.setMatrixAt(stn, dm); pc.setHex(starCols[stn % 4]); stars.setColorAt(stn, pc); stn++; }
    stars.count = stn; G.add(stars);
    var driftM = rMat(0xb8b0a4, { roughness: 1 });
    [[138, B3_Z - 26, 0.4], [141, B3_Z + 30, -0.7], [128, B3_Z - 38, 1.2], [136, B3_Z + 20, 2.2]].forEach(function (dw) { var d = grp(dw[0], beachH(dw[0], dw[1]) + 0.1, dw[1], dw[2], G); q(d, new THREE.CylinderGeometry(0.12, 0.17, 2.4, 8), driftM, 0, 0, 0, 0, 0, Math.PI / 2 - 0.05); q(d, new THREE.CylinderGeometry(0.05, 0.08, 0.7, 6), driftM, 0.4, 0.15, 0.15, 0.8, 0, 0.3); q(d, new THREE.CylinderGeometry(0.04, 0.07, 0.5, 6), driftM, -0.7, 0.1, -0.12, -0.9, 0, -0.4); });
    // (beach umbrellas, loungers and towels; a sandcastle)
    var stripeT = function (a, b) { return cpTex(128, 16, function (g, w, h) { for (var i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(i * w / 8, 0, w / 8, h); } }, [1, 1]); };
    [[139, B3_Z - 11, '#e85a5a', 0.3], [140, B3_Z - 21, '#3aa8c8', -0.4], [139.5, B3_Z + 13, '#f2b83a', 0.2], [138.5, B3_Z + 24, '#7a5ab8', -0.2]].forEach(function (u, k) { var y = beachH(u[0], u[1]), ug = grp(u[0], y, u[1], u[3], G);
      q(ug, new THREE.CylinderGeometry(0.03, 0.03, 2.3, 6), rMat(0xe8e0d0), 0, 1.1, 0, 0.12, 0, 0); var can = q(ug, new THREE.ConeGeometry(1.25, 0.5, 8, 1, true), new THREE.MeshStandardMaterial({ map: stripeT(u[2], '#fbf6ea'), side: THREE.DoubleSide, roughness: 0.8 }), 0, 2.25, 0.14, 0.12, 0, 0);
      q(ug, new THREE.SphereGeometry(0.05, 6, 5), rMat(0xe8e0d0), 0, 2.52, 0.17);
      var lo = grp(-1.0, 0, 0.6, 0.25, ug); q(lo, new THREE.BoxGeometry(0.62, 0.05, 1.3), rMat(0xd8c0a0), 0, 0.3, 0); q(lo, new THREE.BoxGeometry(0.62, 0.05, 0.6), rMat(0xd8c0a0), 0, 0.5, -0.78, 0.6, 0, 0); q(lo, new THREE.BoxGeometry(0.56, 0.07, 1.26), rMat(new THREE.Color(u[2]).getHex(), { roughness: 0.9 }), 0, 0.35, 0.02);
      [[-0.27, 0.55], [0.27, 0.55], [-0.27, -0.55], [0.27, -0.55]].forEach(function (lg) { q(lo, new THREE.BoxGeometry(0.04, 0.3, 0.04), rMat(0xb89a74), lg[0], 0.15, lg[1]); });
      quiet(q(ug, new THREE.PlaneGeometry(0.8, 1.6), new THREE.MeshStandardMaterial({ map: stripeT('#fbf6ea', u[2]), roughness: 1 }), 0.9, 0.02, 0.4, -Math.PI / 2, 0, 0.3));
      solids.push({ x: u[0], z: u[1], r: 0.25 }); });
    var cs = grp(141.5, beachH(141.5, B3_Z + 8.5), B3_Z + 8.5, 0.3, G), csM = rMat(0xe4cc98, { roughness: 1 });
    q(cs, new THREE.CylinderGeometry(0.55, 0.65, 0.22, 16), csM, 0, 0.11, 0); q(cs, new THREE.BoxGeometry(0.5, 0.24, 0.5), csM, 0, 0.34, 0);
    [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(function (tp) { q(cs, new THREE.CylinderGeometry(0.1, 0.12, 0.36, 10), csM, tp[0], 0.4, tp[1]); q(cs, new THREE.ConeGeometry(0.11, 0.14, 10), csM, tp[0], 0.65, tp[1]); });
    q(cs, new THREE.CylinderGeometry(0.003, 0.003, 0.28, 3), rMat(0x8a6a4a), 0, 0.6, 0); q(cs, new THREE.PlaneGeometry(0.12, 0.07), rMat(0xe85a5a, { side: THREE.DoubleSide }), 0.06, 0.7, 0); q(cs, new THREE.TorusGeometry(0.75, 0.06, 4, 20), rMat(0xb49a6c), 0, 0.02, 0, Math.PI / 2, 0, 0);   // (a flag, and its moat)
    // (striped cabanas on the dunes at the end of the south walk)
    [[114, '#3aa8a8'], [118.2, '#e8705a'], [122.4, '#e8b83a'], [126.6, '#9a7ac8']].forEach(function (cb) { var cz = B3_Z + 20, y = beachH(cb[0], cz), cg = grp(cb[0], y, cz, 0, G), stM = new THREE.MeshStandardMaterial({ map: stripeT(cb[1], '#fbf6ea'), side: THREE.DoubleSide, roughness: 0.85 });
      q(cg, new THREE.BoxGeometry(2.4, 0.12, 2.4), plankM, 0, 0.06, 0); [[-1.1, -1.1], [1.1, -1.1], [-1.1, 1.1], [1.1, 1.1]].forEach(function (pp) { q(cg, new THREE.BoxGeometry(0.1, 2.2, 0.1), whiteM, pp[0], 1.15, pp[1]); });
      q(cg, new THREE.PlaneGeometry(2.3, 2.0), stM, 0, 1.1, 1.14, 0, Math.PI, 0); [-1, 1].forEach(function (sdd) { q(cg, new THREE.PlaneGeometry(2.3, 2.0), stM, sdd * 1.14, 1.1, 0, 0, sdd * Math.PI / 2, 0); });
      [-1, 1].forEach(function (sdd) { var cu = q(cg, new THREE.PlaneGeometry(0.5, 1.9, 1, 6), stM, sdd * 0.9, 1.1, -1.14, 0, 0, 0); cu.rotation.y = sdd * 0.6; });   // (front curtains tied back)
      q(cg, new THREE.ConeGeometry(1.75, 0.9, 4), stM, 0, 2.7, 0, 0, Math.PI / 4, 0); q(cg, new THREE.SphereGeometry(0.08, 8, 6), whiteM, 0, 3.18, 0);
      for (var vl = 0; vl < 12; vl++) q(cg, new THREE.CircleGeometry(0.1, 8, 0, Math.PI), stM, -1.1 + vl * 0.2, 2.25, -1.17, 0, 0, Math.PI);   // (a scalloped valance)
      solids.push({ x: cb[0], z: cz + 0.6, r: 1.2 }); });
    // (a welcome sign where the bridge lands)
    var signT = cpTex(512, 160, function (g, w, h) { g.fillStyle = '#c8b090'; g.fillRect(0, 0, w, h); for (var i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#bca480' : '#c8b090'; g.fillRect(0, i * h / 4, w, h / 4); g.fillStyle = 'rgba(60,46,30,0.5)'; g.fillRect(0, i * h / 4, w, 2); }
      g.font = 'bold 64px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2a6a8a'; g.fillText('Seashell Shore', w / 2, h / 2 + 4); g.fillStyle = '#f2b83a'; [[40, h / 2], [w - 40, h / 2]].forEach(function (p3) { g.beginPath(); g.moveTo(p3[0], p3[1] + 22); for (var k = 0; k <= 8; k++) { var a2 = Math.PI + k / 8 * Math.PI; g.lineTo(p3[0] + Math.cos(a2) * 24, p3[1] + Math.sin(a2) * 24); } g.closePath(); g.fill(); g.strokeStyle = '#c8862a'; g.lineWidth = 2; for (k = 0; k <= 4; k++) { g.beginPath(); g.moveTo(p3[0], p3[1] + 22); g.lineTo(p3[0] + Math.cos(Math.PI + k / 4 * Math.PI) * 22, p3[1] + Math.sin(Math.PI + k / 4 * Math.PI) * 22); g.stroke(); } }); });
    var sgn = grp(86.5, beachH(86.5, B3_Z + 4.3), B3_Z + 4.3, -Math.PI / 2 + 0.35, G); [-0.9, 0.9].forEach(function (sx) { q(sgn, new THREE.CylinderGeometry(0.06, 0.07, 1.9, 8), driftM, sx, 0.95, 0); });
    q(sgn, new THREE.BoxGeometry(2.1, 0.66, 0.06), [plankM, plankM, plankM, plankM, new THREE.MeshStandardMaterial({ map: signT, roughness: 0.8 }), plankM], 0, 1.45, 0.04); q(sgn, new THREE.TorusGeometry(0.16, 0.025, 6, 16), ropeM, 0, 1.9, 0.07, 0, 0, 0); solids.push({ x: 86.5, z: B3_Z + 4.3, r: 0.4 });
    // (gulls wheeling over the water)
    var gullM = rMat(0xf6f6f2, { roughness: 0.7, side: THREE.DoubleSide }), gullD = rMat(0x5a5a60, { side: THREE.DoubleSide }), gulls = [];
    for (var gl2 = 0; gl2 < 6; gl2++) { var gg2 = grp(0, 0, 0, 0, G); q(gg2, new THREE.SphereGeometry(0.12, 8, 6), gullM, 0, 0, 0).scale.set(2.2, 0.8, 0.9); q(gg2, new THREE.ConeGeometry(0.025, 0.1, 5), rMat(0xf2b83a), 0.3, 0, 0, 0, 0, -Math.PI / 2);
      var wl = [-1, 1].map(function (sdd) { var w = grp(0, 0.02, sdd * 0.08, 0, gg2); quiet(q(w, new THREE.PlaneGeometry(0.28, 0.7), gullM, 0, 0, sdd * 0.35, -Math.PI / 2, 0, 0)); quiet(q(w, new THREE.PlaneGeometry(0.2, 0.18), gullD, 0.02, 0.001, sdd * 0.62, -Math.PI / 2, 0, 0)); return w; });
      gulls.push({ g: gg2, w: wl, cx: 140 + cr() * 40, cz: B3_Z - 20 + cr() * 40, r: 8 + cr() * 14, h: 6 + cr() * 6, sp: (0.25 + cr() * 0.2) * (gl2 % 2 ? 1 : -1), k: cr() * 6 }); }
    // ---- moving: the lights come on at dusk, the lighthouse sweeps, the boat and buoys bob, palms sway, gulls wheel ----
    updateCarpenter = (function (base) { return function (t, night) { base.apply(this, arguments); var nt = night || 0;
      if (inHide || indoors) return;
      lampGlows.forEach(function (gs, i) { gs.material.opacity = 0.12 + nt * (0.75 + Math.sin(t * 3 + i) * 0.04); }); glowM.emissiveIntensity = 0.5 + nt * 1.4; bulbM.forEach(function (bm2, i) { bm2.emissiveIntensity = 0.3 + nt * (1.5 + Math.sin(t * 2 + i * 1.7) * 0.3); });
      lightM.emissiveIntensity = 0.6 + nt * 2.0; beamM2.opacity = nt * 0.09; beamG.rotation.y = t * 0.8;
      boat.position.y = SEA_Y + Math.sin(t * 1.2) * 0.05; boat.rotation.z = Math.sin(t * 0.9) * 0.04; boat.rotation.x = Math.sin(t * 1.1 + 1) * 0.03;
      buoys.forEach(function (b) { b.g.position.y = SEA_Y + Math.sin(t * 1.4 + b.k) * 0.08; b.g.rotation.z = Math.sin(t * 1.1 + b.k) * 0.1; b.g.rotation.x = Math.sin(t * 0.9 + b.k) * 0.08; });
      palms.forEach(function (p) { p.c.rotation.z = Math.sin(t * 0.8 + p.k) * 0.04; p.c.rotation.x = Math.sin(t * 0.6 + p.k * 1.3) * 0.03; });
      mists.forEach(function (m) { m.s.position.x = m.x + Math.sin(t * 0.05 + m.k) * 3; });
      gulls.forEach(function (g) { var a = t * g.sp + g.k; g.g.position.set(g.cx + Math.cos(a) * g.r, g.h + Math.sin(t * 0.7 + g.k) * 0.6, g.cz + Math.sin(a) * g.r); g.g.rotation.set(0, -a - (g.sp > 0 ? Math.PI / 2 : -Math.PI / 2), (g.sp > 0 ? 1 : -1) * 0.25); var fl = Math.sin(t * 6 + g.k) * 0.5; g.w[0].rotation.x = -fl; g.w[1].rotation.x = fl; });
    }; })(updateCarpenter);
    // ---- on the map: the east bridge, and the way to the shore; and in the Teleport list ----
    clothDrawOnMap = (function (base) { return function (g, K, label) { base.apply(this, arguments);
      var a = mapXY(34, B3_Z - BRIDGE_W / 2), b = mapXY(MAP_X1, B3_Z + BRIDGE_W / 2); g.fillStyle = '#d8ccbc'; g.fillRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); g.strokeStyle = 'rgba(80,70,60,0.6)'; g.lineWidth = 2; g.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]);
      var ar = mapXY(MAP_X1 - 1.2, B3_Z); g.fillStyle = '#2a6a8a'; g.beginPath(); g.moveTo(ar[0] + 4, ar[1]); g.lineTo(ar[0] - 30, ar[1] - 24); g.lineTo(ar[0] - 30, ar[1] + 24); g.closePath(); g.fill();
      label('Seashell Shore', MAP_X1 - 7, B3_Z - 7, 0); }; })(clothDrawOnMap);
    TELEPORTS.push({ name: 'Seashell Shore', icon: '🐚', spot: function () { return { x: 90.5, z: B3_Z - 3.2, face: Math.PI / 2, view: Math.PI / 2 }; } });
  })();
});