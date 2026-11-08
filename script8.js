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
    var stoneT = cpTex(256, 256, function (g, w, h) { g.fillStyle = '#2a2622'; g.fillRect(0, 0, w, h);
      for (var r = 0, y = 0; y < h; r++) { var hh = 28 + (r * 11) % 14; for (var x = -((r * 29) % 50); x < w; ) { var ww = 40 + ((r * 17 + x) % 40), c = 70 + ((r * 31 + x * 3) % 36); g.fillStyle = 'rgb(' + c + ',' + (c - 6) + ',' + (c - 12) + ')'; g.beginPath(); g.ellipse(x + ww / 2, y + hh / 2, ww / 2 - 2, hh / 2 - 2, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,240,220,0.06)'; g.fillRect(x + 6, y + 4, ww - 12, 3); x += ww; } y += hh; } }, [3, 1.5]);
    var wallM = new THREE.MeshStandardMaterial({ map: stoneT, roughness: 0.95 });
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
      p(new THREE.PlaneGeometry(w[3], H), wallM, 0, H / 2, 0, 0, 0, 0, g);
      for (var ps = -w[3] / 2 + 0.2; ps <= w[3] / 2 - 0.1; ps += w[3] / 3.5) p(new THREE.BoxGeometry(0.2, H, 0.18), beam, ps, H / 2, 0.08, 0, 0, 0, g);
      p(new THREE.BoxGeometry(w[3], 0.22, 0.2), beam, 0, H - 0.11, 0.08, 0, 0, 0, g);
      hdWalls.push({ g: g, n: w[1] ? new THREE.Vector3(0, 0, w[1] < 0 ? -1 : 1) : new THREE.Vector3(w[0] < 0 ? -1 : 1, 0, 0), d: w[1] ? D : W });
    });
    // (the stairs up to the cellar door, a sliver of daylight at the top)
    for (var st = 0; st < 3; st++) p(new THREE.BoxGeometry(1.3, 0.12 * (st + 1), 0.3), rMat(0x4a4640, { roughness: 0.95 }), 0, 0.06 * (st + 1), D - 0.75 + st * 0.3);   // (worn stone steps up to the door)
    p(new THREE.PlaneGeometry(1.1, 0.3), new THREE.MeshBasicMaterial({ color: 0xfff0c8 }), 0, 2.4, D - 0.02, 0, Math.PI, 0);
    // (the Errand Board on the back wall: a cork board in a dark frame, under a lantern, notices pinned all over it)
    var BX = HD_BOARD[0], BZ = -D + 0.06;
    p(new THREE.BoxGeometry(2.1, 1.4, 0.08), beam, BX, 1.55, BZ);
    var corkT = cpTex(256, 176, function (g, w, h) { g.fillStyle = '#9a7048'; g.fillRect(0, 0, w, h); for (var k = 0; k < 1200; k++) { g.fillStyle = k % 2 ? 'rgba(60,36,18,0.35)' : 'rgba(200,160,110,0.3)'; g.fillRect((k * 37) % w, (k * 53) % h, 2, 2); }
      g.fillStyle = '#2a1a10'; g.fillRect(w / 2 - 50, 6, 100, 22); g.fillStyle = '#e8c890'; g.font = 'bold 15px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ERRANDS', w / 2, 17); });
    p(new THREE.PlaneGeometry(1.94, 1.24), new THREE.MeshStandardMaterial({ map: corkT, roughness: 1 }), BX, 1.55, BZ + 0.042);
    var notes = [[-0.62, 1.78, 0.08, 0], [-0.2, 1.42, -0.06, 1], [0.35, 1.72, 0.05, 2], [0.68, 1.36, -0.1, 3], [-0.6, 1.22, 0.12, 4], [0.1, 1.15, 0.03, 5]];
    var noteTex = notes.map(function (n2, k) { return cpTex(96, 128, function (g, w, h) { g.fillStyle = ['#e8dcb8', '#efe2c0', '#ddd0a8'][k % 3]; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,90,50,0.2)'; g.fillRect(0, h - 14, w, 14);
      if (k === 2) { g.fillStyle = '#3a2416'; g.font = 'bold 13px Georgia, serif'; g.textAlign = 'center'; g.fillText('WANTED', w / 2, 18); g.strokeStyle = '#3a2416'; g.lineWidth = 2; g.strokeRect(20, 26, 56, 56); g.beginPath(); g.arc(48, 50, 12, 0, Math.PI * 2); g.moveTo(30, 80); g.quadraticCurveTo(48, 60, 66, 80); g.stroke(); }
      else if (k === 4) { g.strokeStyle = '#6a4a2a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(10, 90); g.bezierCurveTo(30, 40, 60, 100, 86, 30); g.stroke(); g.fillStyle = '#b02a2a'; g.font = 'bold 18px sans-serif'; g.fillText('✕', 74, 40); }   // (a scrap of map, an X on it)
      else { g.fillStyle = 'rgba(40,26,14,0.75)'; for (var l = 0; l < 7; l++) g.fillRect(12, 20 + l * 13, 40 + ((k * 17 + l * 23) % 32), 2.5); }
      if (k % 2 === 0) { g.fillStyle = '#8a1e22'; g.beginPath(); g.arc(w - 18, h - 24, 8, 0, Math.PI * 2); g.fill(); } }); });
    notes.forEach(function (n2, k) { var nm = p(new THREE.PlaneGeometry(0.34, 0.44), new THREE.MeshStandardMaterial({ map: noteTex[k], roughness: 1, side: THREE.DoubleSide }), BX + n2[0], n2[1], BZ + 0.05 + k * 0.002, 0, 0, n2[2]); nm.castShadow = false;
      p(new THREE.SphereGeometry(0.018, 8, 6), rMat([0xb02a2a, 0x2a4ab0, 0xd8b030][k % 3], { roughness: 0.4 }), BX + n2[0] - Math.sin(n2[2]) * 0.18, n2[1] + Math.cos(n2[2]) * 0.18, BZ + 0.075); });
    var dag = new THREE.Group(); dag.position.set(BX + 0.86, 1.95, BZ + 0.08); dag.rotation.z = -0.5; R.add(dag);   // (a dagger stuck through the corner of the board)
    lbP(new THREE.BoxGeometry(0.02, 0.2, 0.006), rMat(0xc8ccd2, { metalness: 0.9, roughness: 0.3, envMap: rubyEnv }), 0, -0.1, 0, 0, 0, 0, dag); lbP(new THREE.BoxGeometry(0.08, 0.015, 0.02), rMat(0x2a2420), 0, 0.005, 0.01, 0, 0, 0, dag); lbP(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8), rMat(0x3a2418), 0, 0.055, 0.01, 0, 0, 0, dag);
    var lantM = rMat(0xffd890, { emissive: 0xffb050, emissiveIntensity: 1.2 }); hdFlames.push(lantM);
    p(new THREE.BoxGeometry(0.04, 0.3, 0.04), rMat(0x1a1612, { metalness: 0.5 }), BX, 2.48, BZ + 0.12); p(new THREE.BoxGeometry(0.14, 0.16, 0.14), lantM, BX, 2.28, BZ + 0.2);
    p(new THREE.ConeGeometry(0.11, 0.08, 4), rMat(0x1a1612, { metalness: 0.5 }), BX, 2.4, BZ + 0.2, 0, Math.PI / 4, 0);
    hideSolids.push([BX - 0.6, -D + 0.35, 0.3], [BX, -D + 0.35, 0.3], [BX + 0.6, -D + 0.35, 0.3]);
    // (the guild's banners either side of the board: black, its mark in crimson)
    var banT = cpTex(128, 256, function (g, w, h) { g.fillStyle = '#141014'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a1018'; g.fillRect(6, 0, 6, h); g.fillRect(w - 12, 0, 6, h); hideSigil(g, w / 2, h * 0.4, 40, '#b0202a', 5);
      g.fillStyle = '#141014'; g.beginPath(); g.moveTo(0, h - 30); g.lineTo(w / 2, h); g.lineTo(w, h - 30); g.lineTo(w, h); g.lineTo(0, h); g.fill(); });
    var banM = new THREE.MeshStandardMaterial({ map: banT, roughness: 0.9, side: THREE.DoubleSide, alphaTest: 0.5 });
    [-1.9, 1.9].forEach(function (bx) { p(new THREE.PlaneGeometry(0.7, 1.5), banM, bx, 1.75, -D + 0.12); p(new THREE.CylinderGeometry(0.015, 0.015, 0.84, 8), rMat(0x2a2016, { metalness: 0.4 }), bx, 2.5, -D + 0.13, 0, 0, Math.PI / 2); [-1, 1].forEach(function (e) { p(new THREE.SphereGeometry(0.025, 8, 6), rMat(0x8a6a2a, { metalness: 0.7 }), bx + e * 0.42, 2.5, -D + 0.13); }); });
    // (the long table: maps, a candle, a dagger driven into the wood, a coin purse, tankards)
    var TX = -1.0, TZ = 0.4;
    p(new THREE.BoxGeometry(2.6, 0.08, 1.0), rMat(0x4a3420, { roughness: 0.85 }), TX, 0.78, TZ);
    [[-1.2, -0.42], [1.2, -0.42], [-1.2, 0.42], [1.2, 0.42]].forEach(function (l) { p(new THREE.BoxGeometry(0.1, 0.76, 0.1), beam, TX + l[0], 0.38, TZ + l[1]); });
    p(new THREE.PlaneGeometry(4.2, 2.4), rMat(0x4a1a1e, { roughness: 1 }), TX, 0.005, TZ, -Math.PI / 2, 0, 0);   // (a worn red rug under it)
    var mapT = cpTex(256, 176, function (g, w, h) { g.fillStyle = '#d8c89a'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(90,60,30,0.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(30, 40); g.bezierCurveTo(80, 10, 150, 60, 220, 30); g.bezierCurveTo(240, 90, 200, 150, 120, 150); g.bezierCurveTo(60, 160, 20, 110, 30, 40); g.stroke();
      g.setLineDash([4, 5]); g.strokeStyle = '#8a2a2a'; g.beginPath(); g.moveTo(60, 120); g.quadraticCurveTo(110, 70, 170, 90); g.stroke(); g.setLineDash([]); g.fillStyle = '#8a2a2a'; g.font = 'bold 22px sans-serif'; g.fillText('✕', 162, 98);
      g.strokeStyle = 'rgba(90,60,30,0.6)'; for (var k = 0; k < 5; k++) { g.beginPath(); g.moveTo(70 + k * 25, 60); g.lineTo(78 + k * 25, 48); g.lineTo(86 + k * 25, 60); g.stroke(); } });
    p(new THREE.PlaneGeometry(1.1, 0.75), new THREE.MeshStandardMaterial({ map: mapT, roughness: 1 }), TX - 0.3, 0.825, TZ, -Math.PI / 2, 0, 0.12);
    p(new THREE.PlaneGeometry(0.5, 0.36), new THREE.MeshStandardMaterial({ map: mapT, roughness: 1 }), TX + 0.75, 0.826, TZ + 0.15, -Math.PI / 2, 0, -0.4);
    var cdl = rMat(0xe8dcc0, { roughness: 0.6 }), flameM = rMat(0xffd890, { emissive: 0xffa040, emissiveIntensity: 1.4 }); hdFlames.push(flameM);
    [[TX + 0.5, TZ - 0.3, 0.16], [TX - 1.05, TZ + 0.3, 0.1]].forEach(function (c) { p(new THREE.CylinderGeometry(0.035, 0.04, 0.012, 12), rMat(0x8a6a2a, { metalness: 0.7 }), c[0], 0.826, c[1]); p(new THREE.CylinderGeometry(0.022, 0.024, c[2], 10), cdl, c[0], 0.83 + c[2] / 2, c[1]); var fl = p(new THREE.SphereGeometry(0.018, 8, 6), flameM, c[0], 0.855 + c[2], c[1]); fl.scale.y = 1.9; fl.castShadow = false; hdHalo(R, c[0], 0.86 + c[2], c[1], 0.32); });
    var dg2 = new THREE.Group(); dg2.position.set(TX + 0.2, 0.9, TZ + 0.25); dg2.rotation.set(0.15, 0.4, 0.1); R.add(dg2);
    lbP(new THREE.BoxGeometry(0.025, 0.22, 0.006), rMat(0xc8ccd2, { metalness: 0.9, roughness: 0.3, envMap: rubyEnv }), 0, -0.04, 0, 0, 0, 0, dg2); lbP(new THREE.BoxGeometry(0.1, 0.016, 0.024), rMat(0x8a6a2a, { metalness: 0.7 }), 0, 0.07, 0, 0, 0, 0, dg2); lbP(new THREE.CylinderGeometry(0.013, 0.013, 0.1, 8), rMat(0x2a1a12), 0, 0.13, 0, 0, 0, 0, dg2); lbP(new THREE.SphereGeometry(0.02, 8, 6), rMat(0x8a6a2a, { metalness: 0.7 }), 0, 0.19, 0, 0, 0, 0, dg2);
    var purse = p(new THREE.SphereGeometry(0.07, 10, 8), rMat(0x5a3a22, { roughness: 0.9 }), TX + 0.95, 0.88, TZ - 0.28); purse.scale.set(1, 0.8, 1); p(new THREE.TorusGeometry(0.03, 0.008, 6, 12), rMat(0x8a6a2a), TX + 0.95, 0.93, TZ - 0.28, Math.PI / 2, 0, 0);
    for (var cn = 0; cn < 5; cn++) p(new THREE.CylinderGeometry(0.018, 0.018, 0.005, 12), rMat(0xd8b040, { metalness: 0.8, roughness: 0.3 }), TX + 0.8 + cn * 0.03, 0.825 + cn * 0.005, TZ - 0.12 + (cn % 2) * 0.02);
    [[TX - 0.85, TZ - 0.25], [TX + 1.1, TZ + 0.3]].forEach(function (m) { p(new THREE.CylinderGeometry(0.045, 0.05, 0.13, 12), rMat(0x6a5a4a, { roughness: 0.6, metalness: 0.3 }), m[0], 0.885, m[1]); p(new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI), rMat(0x6a5a4a, { metalness: 0.3 }), m[0] + 0.05, 0.89, m[1], 0, 0, -Math.PI / 2); });
    [[-1.0, -0.2], [0, -0.2], [-1.0, 1.0], [0, 1.0]].forEach(function (b) { p(new THREE.BoxGeometry(0.45, 0.45, 0.4), beam, TX + b[0] + 0.5, 0.225, TZ + (b[1] < 0 ? -0.75 : 0.75)); });   // (stools)
    for (var tsx = -1.2; tsx <= 1.21; tsx += 0.6) hideSolids.push([TX + tsx, TZ, 0.6]);
    // (the hearth on the right wall: a rough stone fireplace with a fire burning low)
    var FX = W - 0.35;
    p(new THREE.BoxGeometry(0.7, 1.4, 1.6), rMat(0x3a3530, { roughness: 1 }), FX, 0.7, -0.3); p(new THREE.BoxGeometry(0.8, 0.12, 1.8), rMat(0x4a443e, { roughness: 1 }), FX - 0.05, 1.42, -0.3);
    p(new THREE.BoxGeometry(0.1, 0.9, 1.0), rMat(0x0a0806), FX - 0.31, 0.5, -0.3);
    var fireM = rMat(0xffb050, { emissive: 0xff7a20, emissiveIntensity: 1.6, transparent: true, opacity: 0.9 }); hdFlames.push(fireM);
    var fireG = new THREE.Group(); fireG.position.set(FX - 0.45, 0.08, -0.3); R.add(fireG);
    [[0, 0.22, 0.12], [-0.12, 0.16, 0.09], [0.12, 0.17, 0.09], [0.05, 0.12, 0.07]].forEach(function (f, k) { var fl = lbP(new THREE.ConeGeometry(f[2], f[1] * 2.2, 8), fireM, 0, f[1], f[0], 0, 0, 0, fireG); fl.castShadow = false; fl.userData.k = k; });
    [[0.2, 0.4], [-0.2, -0.3], [0, 1.4]].forEach(function (lg2) { lbP(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8), rMat(0x3a2418), 0.0, 0.04, 0, Math.PI / 2, lg2[1], 0, fireG).position.z = lg2[0] * 0.5; });
    hideSolids.push([FX, -0.8, 0.5], [FX, -0.3, 0.5], [FX, 0.2, 0.5]);
    // (a weapon rack on the left wall: swords, an axe, a bow and a round shield)
    var RX = -W + 0.15;
    p(new THREE.BoxGeometry(0.1, 0.08, 1.8), beam, RX, 1.7, -1.2); p(new THREE.BoxGeometry(0.1, 0.08, 1.8), beam, RX, 0.5, -1.2);
    var steelM = rMat(0xb8bcc2, { metalness: 0.9, roughness: 0.3, envMap: rubyEnv }), gripM = rMat(0x3a2418, { roughness: 0.8 });
    [-1.8, -1.45, -1.1].forEach(function (sz) { p(new THREE.BoxGeometry(0.02, 1.0, 0.05), steelM, RX + 0.06, 1.1, sz); p(new THREE.BoxGeometry(0.04, 0.03, 0.2), rMat(0x8a6a2a, { metalness: 0.7 }), RX + 0.06, 1.62, sz); p(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 8), gripM, RX + 0.06, 1.74, sz); });
    p(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 8), gripM, RX + 0.06, 1.1, -0.75); p(new THREE.BoxGeometry(0.03, 0.22, 0.18), steelM, RX + 0.06, 1.55, -0.68);
    var bowC = new THREE.CatmullRomCurve3([new THREE.Vector3(RX + 0.06, 0.5, -0.4), new THREE.Vector3(RX + 0.06, 1.1, -0.2), new THREE.Vector3(RX + 0.06, 1.7, -0.4)]); p(new THREE.TubeGeometry(bowC, 16, 0.015, 6), rMat(0x6a4422), 0, 0, 0);
    p(new THREE.CylinderGeometry(0.002, 0.002, 1.2, 4), rMat(0xe8e0d0), RX + 0.06, 1.1, -0.4);
    var sh = p(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 20), rMat(0x5a3a22, { roughness: 0.8 }), RX + 0.06, 1.1, 0.25, 0, 0, Math.PI / 2); p(new THREE.TorusGeometry(0.31, 0.02, 6, 24), steelM, RX + 0.09, 1.1, 0.25, 0, Math.PI / 2, 0); p(new THREE.SphereGeometry(0.06, 10, 8), steelM, RX + 0.1, 1.1, 0.25);
    hideSolids.push([RX + 0.3, -1.2, 0.35], [RX + 0.3, 0.25, 0.35]);
    // (crates, casks and sacks in the corners, and cobwebs up in them)
    var crateM = rMat(0x5a4430, { roughness: 0.95 });
    [[-W + 0.45, D - 0.5, 0.6, 0], [-W + 0.45, D - 1.1, 0.5, 0.3], [-W + 0.45, D - 0.5, 0.45, 0.1, 0.6], [W - 0.5, D - 0.6, 0.6, 0.2], [W - 1.2, -D + 0.45, 0.55, 0]].forEach(function (c) { p(new THREE.BoxGeometry(c[2], c[2], c[2]), crateM, c[0], (c[4] || 0) + c[2] / 2, c[1], 0, c[3], 0); hideSolids.push([c[0], c[1], c[2] * 0.75]); });
    [[W - 0.55, D - 1.5], [W - 0.55, D - 2.2], [-W + 1.3, -D + 0.5]].forEach(function (k) { p(new THREE.CylinderGeometry(0.32, 0.32, 0.8, 14), rMat(0x5a3a22, { roughness: 0.8 }), k[0], 0.4, k[1]); [0.15, 0.65].forEach(function (hy) { p(new THREE.TorusGeometry(0.325, 0.015, 6, 20), rMat(0x2a2420, { metalness: 0.5 }), k[0], hy, k[1], Math.PI / 2, 0, 0); }); hideSolids.push([k[0], k[1], 0.4]); });
    [[-W + 1.0, D - 0.4], [-W + 1.25, D - 0.55]].forEach(function (sk) { var sa = p(new THREE.SphereGeometry(0.22, 10, 8), rMat(0x8a7a5a, { roughness: 1 }), sk[0], 0.2, sk[1]); sa.scale.set(1, 1.2, 0.9); });
    var webT = cpTex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(230,230,240,0.55)'; g.lineWidth = 1; for (var k = 0; k < 7; k++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(k / 6 * Math.PI / 2) * w, Math.sin(k / 6 * Math.PI / 2) * h); g.stroke(); } for (var r = 10; r < 64; r += 9) { g.beginPath(); g.arc(0, 0, r, 0, Math.PI / 2); g.stroke(); } });
    var webM = new THREE.MeshBasicMaterial({ map: webT, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    [[-W + 0.01, -D + 0.01, Math.PI / 4], [W - 0.01, -D + 0.01, -Math.PI / 4]].forEach(function (c) { var wm = p(new THREE.PlaneGeometry(0.7, 0.7), webM, c[0] + (c[0] < 0 ? 0.25 : -0.25), H - 0.4, c[1] + 0.25, 0, c[2], c[0] < 0 ? 0 : Math.PI / 2); wm.castShadow = false; });
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
    // (the guild's name, carved and darkened, over the board)
    var nameT = cpTex(512, 80, function (g, w, h) { g.fillStyle = '#2a1c12'; g.fillRect(0, 0, w, h); g.strokeStyle = '#6a4a2a'; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = '#c8a060'; g.font = 'bold 34px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('THE HOLLOW FANG', w / 2, h / 2 + 2); hideSigil(g, 36, h / 2, 22, '#b0202a', 3); hideSigil(g, w - 36, h / 2, 22, '#b0202a', 3); });
    p(new THREE.BoxGeometry(1.7, 0.27, 0.05), new THREE.MeshStandardMaterial({ map: nameT, roughness: 0.8 }), 0, 2.68, -D + 0.05);
    var pins = [[-0.62, 1.96], [-0.2, 1.6], [0.35, 1.9], [0.68, 1.54], [-0.6, 1.4], [0.1, 1.33]], thread = rMat(0xb01a20, { roughness: 0.8 });   // (red thread pin to pin)
    [[0, 1], [1, 2], [1, 5], [2, 3], [4, 5]].forEach(function (pr) { var a = pins[pr[0]], b = pins[pr[1]], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      p(new THREE.CylinderGeometry(0.003, 0.003, len, 4), thread, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, -D + 0.135, 0, 0, Math.atan2(b[1] - a[1], b[0] - a[0]) - Math.PI / 2); });
    var lec = new THREE.Group(); lec.position.set(1.25, 0, -D + 0.55); lec.rotation.y = -0.4; R.add(lec);   // (a lectern with the guild's ledger open on it)
    lbP(new THREE.BoxGeometry(0.06, 1.0, 0.06), wood, 0, 0.5, 0, 0, 0, 0, lec); lbP(new THREE.BoxGeometry(0.4, 0.04, 0.3), wood, 0, 0.02, 0, 0, 0, 0, lec); lbP(new THREE.BoxGeometry(0.44, 0.03, 0.32), oak, 0, 1.02, 0.02, 0.5, 0, 0, lec);
    var ledT = cpTex(128, 80, function (g, w, h) { g.fillStyle = '#e8dcb8'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(60,40,20,0.7)'; for (var l = 0; l < 9; l++) { g.fillRect(8, 8 + l * 7.5, 44 - (l % 3) * 8, 1.5); g.fillRect(70, 8 + l * 7.5, 46 - (l % 2) * 10, 1.5); } g.fillStyle = 'rgba(60,40,20,0.3)'; g.fillRect(63, 0, 2, h); });
    lbP(new THREE.BoxGeometry(0.38, 0.02, 0.26), new THREE.MeshStandardMaterial({ map: ledT, roughness: 1 }), 0, 1.05, 0.02, 0.5, 0, 0, lec); lbP(new THREE.BoxGeometry(0.4, 0.02, 0.28), rMat(0x5a1a1a, { roughness: 0.8 }), 0, 1.035, 0.02, 0.5, 0, 0, lec);
    lbP(new THREE.CylinderGeometry(0.003, 0.002, 0.18, 4), rMat(0xf0f0f0), 0.12, 1.1, 0.04, 0.5, 0, 0.9, lec);
    hideSolids.push([1.25, -D + 0.55, 0.3]);
    // (iron wall sconces, candles burning in them)
    [[-W + 0.05, -2.6, Math.PI / 2], [-W + 0.05, 1.5, Math.PI / 2], [W - 0.05, 1.65, -Math.PI / 2], [-3.0, -D + 0.05, 0], [3.0, -D + 0.05, 0]].forEach(function (sc) {
      var g = new THREE.Group(); g.position.set(sc[0], 1.75, sc[1]); g.rotation.y = sc[2]; R.add(g);
      lbP(new THREE.BoxGeometry(0.12, 0.2, 0.02), iron, 0, 0, 0, 0, 0, 0, g); lbP(new THREE.BoxGeometry(0.02, 0.02, 0.16), iron, 0, -0.06, 0.08, 0, 0, 0, g); lbP(new THREE.CylinderGeometry(0.05, 0.04, 0.03, 10), iron, 0, -0.05, 0.16, 0, 0, 0, g);
      candle(0, -0.035, 0.16, 0.12, g); var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffb060, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); gl.position.set(0, 0.12, 0.17); gl.scale.set(0.8, 0.8, 1); g.add(gl); hdHalos.push(gl);
    });
    // (the hearth: a cauldron on an iron crane over the fire, firewood stacked beside, fire irons, the mantel and its things)
    var FX = W - 0.35;
    p(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), iron, FX - 0.1, 0.45, -0.75); p(new THREE.BoxGeometry(0.45, 0.025, 0.025), iron, FX - 0.3, 0.86, -0.75); p(new THREE.CylinderGeometry(0.004, 0.004, 0.28, 4), iron, FX - 0.5, 0.72, -0.3);
    hfCauldron = p(lbLathe([[0, 0], [0.16, 0.02], [0.2, 0.12], [0.19, 0.24], [0.17, 0.27], [0.18, 0.29], [0.16, 0.29]], 18), rMat(0x1a1816, { metalness: 0.5, roughness: 0.5, side: THREE.DoubleSide }), FX - 0.48, 0.3, -0.3);
    p(new THREE.CircleGeometry(0.165, 18), rMat(0x5a8a3a, { emissive: 0x2a5a1a, emissiveIntensity: 0.6, roughness: 0.3 }), FX - 0.48, 0.565, -0.3, -Math.PI / 2, 0, 0);
    p(new THREE.TorusGeometry(0.15, 0.008, 5, 16, Math.PI), iron, FX - 0.48, 0.6, -0.3, 0, Math.PI / 2, 0);
    for (var st = 0; st < 5; st++) { var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xd8e8d0, transparent: true, opacity: 0, depthWrite: false })); sp.position.set(HDI_X + FX - 0.48, 0.65, HDI_Z - 0.3); hideScene.add(sp); hfSteam.push({ s: sp, k: st / 5 }); }
    hfEmbers = rMat(0xff5a1a, { emissive: 0xff3a00, emissiveIntensity: 1.2 });
    for (var em = 0; em < 12; em++) { var e = p(new THREE.SphereGeometry(0.025, 6, 4), hfEmbers, FX - 0.45 + Math.sin(em * 2.1) * 0.12, 0.04, -0.3 + Math.cos(em * 2.1) * 0.25); e.scale.y = 0.4; }
    for (var lg2 = 0; lg2 < 9; lg2++) p(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 8), rMat([0x5a3a22, 0x6a4a2a, 0x4a3018][lg2 % 3], { roughness: 1 }), FX - 0.05 - Math.floor(lg2 / 3) * 0.13 + (lg2 % 2) * 0.06, 0.06 + (lg2 % 3) * 0.11, 0.78, 0, 0, Math.PI / 2);   // (firewood)
    hideSolids.push([FX - 0.1, 0.78, 0.3]);
    [[0, 0.1], [0.06, -0.05], [-0.05, -0.12]].forEach(function (t, k) { p(new THREE.CylinderGeometry(0.008, 0.008, 0.85, 6), iron, FX - 0.42 + t[0], 0.42, -1.3 + t[1], 0.1 + k * 0.05, 0, -0.12); });   // (fire irons, leaning)
    p(new THREE.TorusGeometry(0.03, 0.006, 5, 10), iron, FX - 0.5, 0.86, -1.32);
    var MY = 1.49;
    var skull = new THREE.Group(); skull.position.set(FX - 0.08, MY, -0.75); skull.rotation.y = -Math.PI / 2 + 0.3; R.add(skull);   // (an old skull on the mantel, a candle stuck on it)
    var bone = rMat(0xe0d4b8, { roughness: 0.8 }); lbP(new THREE.SphereGeometry(0.075, 12, 10), bone, 0, 0.08, 0, 0, 0, 0, skull); lbP(new THREE.BoxGeometry(0.08, 0.05, 0.07), bone, 0, 0.025, 0.04, 0, 0, 0, skull);
    [-1, 1].forEach(function (sd) { lbP(new THREE.SphereGeometry(0.02, 8, 6), rMat(0x0a0806), sd * 0.03, 0.085, 0.065, 0, 0, 0, skull); }); lbP(new THREE.ConeGeometry(0.012, 0.02, 3), rMat(0x0a0806), 0, 0.055, 0.075, Math.PI, 0, 0, skull);
    candle(0, 0.15, 0, 0.07, skull);
    candle(FX - 0.1, MY, -0.05, 0.16); candle(FX - 0.05, MY, 0.1, 0.11);
    [[FX - 0.12, 0.3, 0x5ad8a0], [FX - 0.12, 0.42, 0xb04a6a]].forEach(function (j) { p(lbLathe([[0, 0], [0.04, 0], [0.045, 0.05], [0.03, 0.09], [0.02, 0.1], [0, 0.1]], 12), new THREE.MeshStandardMaterial({ color: j[2], transparent: true, opacity: 0.75, roughness: 0.1 }), j[0], MY, j[1]); p(new THREE.CylinderGeometry(0.02, 0.018, 0.02, 8), rMat(0x8a6a4a), j[0], MY + 0.11, j[1]); });
    var ant = new THREE.Group(); ant.position.set(W - 0.03, 2.2, -0.3); ant.rotation.y = -Math.PI / 2; R.add(ant);   // (antlers, mounted on a plaque)
    lbP(new THREE.CylinderGeometry(0.12, 0.12, 0.03, 6), oak, 0, 0, 0.015, Math.PI / 2, 0, 0, ant); lbP(new THREE.SphereGeometry(0.06, 8, 6), bone, 0, 0, 0.06, 0, 0, 0, ant);
    [-1, 1].forEach(function (sd) { var c = new THREE.CatmullRomCurve3([new THREE.Vector3(sd * 0.04, 0.03, 0.07), new THREE.Vector3(sd * 0.2, 0.15, 0.1), new THREE.Vector3(sd * 0.3, 0.38, 0.08)]); lbP(new THREE.TubeGeometry(c, 10, 0.014, 5), bone, 0, 0, 0, 0, 0, 0, ant);
      [0.4, 0.7].forEach(function (u) { var pt = c.getPoint(u); lbP(new THREE.ConeGeometry(0.01, 0.12, 5), bone, pt.x + sd * 0.03, pt.y + 0.06, pt.z, 0, 0, -sd * 0.5, ant); }); });
    var herbC = [0x6a8a4a, 0x8a7a4a, 0x7a5a8a];   // (bundles of herbs drying from the mantel)
    for (var hb = 0; hb < 4; hb++) { var hz = -0.9 + hb * 0.38; p(new THREE.CylinderGeometry(0.002, 0.002, 0.15, 3), rMat(0x8a7450), FX - 0.43, 1.36, hz);
      for (var hs = 0; hs < 6; hs++) { var h = p(new THREE.ConeGeometry(0.012, 0.18, 4), rMat(herbC[hb % 3], { roughness: 0.9 }), FX - 0.43 + Math.sin(hs) * 0.02, 1.2, hz + Math.cos(hs) * 0.02, Math.PI + (hs - 2.5) * 0.08, 0, 0); h.castShadow = false; } }
    // (a bookshelf of old books, scrolls and bottles on the right wall)
    var BKX = W - 0.22, BKZ = -2.3;
    p(new THREE.BoxGeometry(0.03, 2.0, 1.2), wood, BKX + 0.19, 1.0, BKZ); [-0.585, 0.585].forEach(function (e) { p(new THREE.BoxGeometry(0.4, 2.0, 0.03), wood, BKX, 1.0, BKZ + e); }); p(new THREE.BoxGeometry(0.42, 0.04, 1.22), wood, BKX, 2.0, BKZ);   // (an open shelf: back, sides and top)
    var bookC = [0x5a1a1a, 0x1a3a2a, 0x2a2a4a, 0x4a3a1a, 0x3a1a3a, 0x6a4a2a];
    [0.12, 0.6, 1.08, 1.56].forEach(function (sy, sh) { p(new THREE.BoxGeometry(0.38, 0.03, 1.12), oak, BKX - 0.01, sy, BKZ);
      var z = BKZ - 0.5, k = 0; while (z < BKZ + 0.5) { var bw = 0.04 + ((sh * 7 + k * 3) % 4) * 0.012, bh = 0.26 + ((sh + k * 5) % 5) * 0.03, lean = (k * 11 + sh) % 9 === 0 ? 0.25 : 0;
        if ((sh === 1 && k === 4) || (sh === 3 && k === 2)) { for (var sc2 = 0; sc2 < 3; sc2++) p(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 10), parch, BKX - 0.05, sy + 0.05 + sc2 * 0.06, z + 0.06, 0, 0, Math.PI / 2); z += 0.16; k++; continue; }   // (a pile of scrolls)
        if (sh === 2 && k === 6) { [0x5ad8a0, 0x8a3a6a, 0xd8a03a].forEach(function (c, q) { p(lbLathe([[0, 0], [0.03, 0], [0.034, 0.08], [0.012, 0.11], [0.012, 0.14], [0, 0.14]], 10), new THREE.MeshStandardMaterial({ color: c, transparent: true, opacity: 0.8, roughness: 0.1, emissive: c, emissiveIntensity: 0.15 }), BKX - 0.06, sy + 0.015, z + q * 0.07); }); z += 0.22; k++; continue; }
        var bk = p(new THREE.BoxGeometry(0.28, bh, bw), rMat(bookC[(sh * 3 + k) % 6], { roughness: 0.75 }), BKX - 0.04, sy + 0.015 + bh / 2, z + bw / 2, lean, 0, 0);
        p(new THREE.BoxGeometry(0.005, 0.02, bw + 0.002), brass, BKX - 0.181, sy + bh * 0.75, z + bw / 2); z += bw + 0.005 + lean * 0.1; k++; } });
    var sk2 = new THREE.Group(); sk2.position.set(BKX - 0.05, 2.0, BKZ + 0.3); sk2.rotation.y = -Math.PI / 2; R.add(sk2); lbP(new THREE.SphereGeometry(0.06, 10, 8), bone, 0, 0.06, 0, 0, 0, 0, sk2); [-1, 1].forEach(function (sd) { lbP(new THREE.SphereGeometry(0.016, 6, 4), rMat(0x0a0806), sd * 0.025, 0.065, 0.05, 0, 0, 0, sk2); });   // (a small skull on top)
    p(new THREE.CylinderGeometry(0.1, 0.11, 0.18, 12), rMat(0x5a3a22), BKX - 0.05, 2.09, BKZ - 0.3);
    hideSolids.push([BKX - 0.1, BKZ - 0.4, 0.35], [BKX - 0.1, BKZ + 0.4, 0.35]);
    // (an armour stand: leather armour, a hooded cloak and a short sword at its hip)
    var AS = new THREE.Group(); AS.position.set(2.3, 0, -2.4); AS.rotation.y = -0.5; R.add(AS);
    lbP(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 12), wood, 0, 0.025, 0, 0, 0, 0, AS); lbP(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), wood, 0, 0.72, 0, 0, 0, 0, AS); lbP(new THREE.BoxGeometry(0.52, 0.04, 0.04), wood, 0, 1.38, 0, 0, 0, 0, AS);
    var leather = rMat(0x5a3a22, { roughness: 0.75 }), cloakM = rMat(0x1c1820, { roughness: 0.95, side: THREE.DoubleSide });
    lbP(new THREE.CylinderGeometry(0.17, 0.15, 0.5, 12), leather, 0, 1.08, 0, 0, 0, 0, AS); [0.95, 1.18].forEach(function (by) { lbP(new THREE.TorusGeometry(0.162, 0.01, 5, 16), brass, 0, by, 0, Math.PI / 2, 0, 0, AS); });
    lbP(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 12), rMat(0x2a1a10), 0, 0.82, 0, 0, 0, 0, AS); lbP(new THREE.BoxGeometry(0.05, 0.05, 0.02), brass, 0, 0.82, 0.165, 0, 0, 0, AS);
    lbP(new THREE.CylinderGeometry(0.22, 0.32, 1.1, 14, 1, true, Math.PI * 0.62, Math.PI * 1.76), cloakM, 0, 0.88, -0.02, 0, 0, 0, AS);   // (the cloak, hanging open at the front)
    var hood = lbP(new THREE.SphereGeometry(0.14, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.7), cloakM, 0, 1.46, -0.02, -0.4, 0, 0, AS); hood.scale.set(1, 1.1, 1.1);
    var swd = new THREE.Group(); swd.position.set(0.17, 0.75, 0.05); swd.rotation.z = 0.2; AS.add(swd); lbP(new THREE.BoxGeometry(0.04, 0.5, 0.03), rMat(0x2a1a10), 0, -0.2, 0, 0, 0, 0, swd); lbP(new THREE.BoxGeometry(0.12, 0.02, 0.03), brass, 0, 0.06, 0, 0, 0, 0, swd); lbP(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6), rMat(0x3a2418), 0, 0.12, 0, 0, 0, 0, swd);
    hideSolids.push([2.3, -2.4, 0.35]);
    // (a straw target dummy, arrows stuck in it)
    var TD = new THREE.Group(); TD.position.set(2.5, 0, 0.9); TD.rotation.y = -0.9; R.add(TD);
    var straw = rMat(0xc8a860, { roughness: 1 });
    lbP(new THREE.CylinderGeometry(0.04, 0.05, 1.2, 8), wood, 0, 0.6, 0, 0, 0, 0, TD); lbP(new THREE.BoxGeometry(0.5, 0.06, 0.06), wood, 0, 0.12, 0, 0, 0, 0, TD); lbP(new THREE.BoxGeometry(0.06, 0.06, 0.5), wood, 0, 0.12, 0, 0, 0, 0, TD);
    lbP(new THREE.CylinderGeometry(0.2, 0.17, 0.55, 12), straw, 0, 1.05, 0, 0, 0, 0, TD); lbP(new THREE.SphereGeometry(0.13, 12, 10), straw, 0, 1.45, 0, 0, 0, 0, TD); lbP(new THREE.CylinderGeometry(0.035, 0.035, 0.8, 8), straw, 0, 1.18, 0, 0, 0, Math.PI / 2, TD);
    [1.0, 1.2].forEach(function (by) { lbP(new THREE.TorusGeometry(0.19, 0.008, 4, 16), rMat(0x8a7450), 0, by, 0, Math.PI / 2, 0, 0, TD); });
    var tgT = cpTex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); [[30, '#e8dcc0'], [22, '#b02a2a'], [14, '#e8dcc0'], [7, '#b02a2a']].forEach(function (r) { g.fillStyle = r[1]; g.beginPath(); g.arc(32, 32, r[0], 0, Math.PI * 2); g.fill(); }); });
    lbP(new THREE.CircleGeometry(0.15, 16), new THREE.MeshStandardMaterial({ map: tgT, transparent: true, roughness: 1 }), 0, 1.07, 0.201, 0, 0, 0, TD);
    [[0.03, 1.08, -0.1, 0.1], [-0.08, 1.15, 0.15, -0.1], [0.06, 1.48, 0.05, 0.3], [-0.05, 0.98, 0.0, -0.2]].forEach(function (a) { var ar = new THREE.Group(); ar.position.set(a[0], a[1], 0.18); ar.rotation.set(a[2], a[3], 0); TD.add(ar);
      lbP(new THREE.CylinderGeometry(0.005, 0.005, 0.4, 5), rMat(0x8a6a3a), 0, 0, 0.2, Math.PI / 2, 0, 0, ar); [0, Math.PI / 2].forEach(function (fr) { lbP(new THREE.PlaneGeometry(0.03, 0.07), rMat(0xe8e0d0, { side: THREE.DoubleSide }), 0, 0, 0.38, Math.PI / 2, fr, 0, ar); }); });
    hideSolids.push([2.5, 0.9, 0.35]);
    // (a bedroll with furs by the left wall, a pack and a lantern beside it)
    var BR = new THREE.Group(); BR.position.set(-3.75, 0, 1.55); R.add(BR);
    lbP(new THREE.BoxGeometry(0.75, 0.08, 1.7), rMat(0x4a3a5a, { roughness: 1 }), 0, 0.04, 0, 0, 0, 0, BR); var roll = lbP(new THREE.CylinderGeometry(0.11, 0.11, 0.75, 12), rMat(0x5a4a6a, { roughness: 1 }), 0, 0.11, -0.78, 0, 0, Math.PI / 2, BR);
    var fur = rMat(0x8a7a6a, { roughness: 1 }); var fu = lbP(new THREE.BoxGeometry(0.78, 0.05, 1.0), fur, 0.02, 0.1, 0.3, 0, 0.05, 0.04, BR); for (var ft = 0; ft < 14; ft++) { var tf = lbP(new THREE.ConeGeometry(0.03, 0.06, 4), fur, -0.35 + (ft % 7) * 0.12, 0.13, -0.15 + Math.floor(ft / 7) * 0.9, 0, ft, 0.4, BR); tf.castShadow = false; }
    var pack = lbP(new THREE.BoxGeometry(0.3, 0.38, 0.2), rMat(0x5a4028, { roughness: 0.9 }), 0.55, 0.19, -0.75, 0, 0.3, 0, BR); lbP(new THREE.CylinderGeometry(0.1, 0.1, 0.3, 10), rMat(0x4a3a5a), 0.55, 0.42, -0.75, 0, 0.3, Math.PI / 2, BR);
    var bl = new THREE.Group(); bl.position.set(0.5, 0, 0.55); BR.add(bl);   // (a little lantern on the floor by the bedroll, lit)
    var lmM = rMat(0xffd890, { emissive: 0xffa040, emissiveIntensity: 1.3 }); hdFlames.push(lmM);
    lbP(new THREE.BoxGeometry(0.14, 0.02, 0.14), iron, 0, 0.01, 0, 0, 0, 0, bl); lbP(new THREE.BoxGeometry(0.1, 0.14, 0.1), lmM, 0, 0.09, 0, 0, 0, 0, bl); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { lbP(new THREE.BoxGeometry(0.012, 0.16, 0.012), iron, c[0] * 0.055, 0.09, c[1] * 0.055, 0, 0, 0, bl); });
    lbP(new THREE.ConeGeometry(0.09, 0.06, 4), iron, 0, 0.19, 0, 0, Math.PI / 4, 0, bl); lbP(new THREE.TorusGeometry(0.03, 0.005, 5, 10), iron, 0, 0.24, 0, 0, 0, 0, bl);
    var bLight = new THREE.PointLight(0xffb060, 0.5, 3.2, 1.8); bLight.position.set(HDI_X - 3.75 + 0.5, 0.4, HDI_Z + 1.55 + 0.55); hideScene.add(bLight); hdCandles.push(bLight);
    hideSolids.push([-3.75, 1.1, 0.35], [-3.75, 2.0, 0.35]);
    // (a barrel of arrows by the weapon rack)
    p(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 12), rMat(0x5a3a22, { roughness: 0.8 }), -3.95, 0.275, 0.75); [0.08, 0.47].forEach(function (hy) { p(new THREE.TorusGeometry(0.203, 0.01, 5, 16), iron, -3.95, hy, 0.75, Math.PI / 2, 0, 0); });
    for (var aw = 0; aw < 11; aw++) { var aa = aw * 2.4, ar2 = 0.04 + (aw % 3) * 0.05; p(new THREE.CylinderGeometry(0.005, 0.005, 0.7, 4), rMat(0x8a6a3a), -3.95 + Math.cos(aa) * ar2, 0.62, 0.75 + Math.sin(aa) * ar2, Math.sin(aa) * 0.1, 0, Math.cos(aa) * 0.1); p(new THREE.ConeGeometry(0.014, 0.05, 3), rMat([0xe8e0d0, 0x2a2a2a, 0xb02a2a][aw % 3]), -3.95 + Math.cos(aa) * ar2 * 1.4, 0.96, 0.75 + Math.sin(aa) * ar2 * 1.4); }
    hideSolids.push([-3.95, 0.75, 0.3]);
    // (a map of the isles pinned to the left wall)
    var isleT = cpTex(256, 160, function (g, w, h) { g.fillStyle = '#d8c89a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(120,90,50,0.15)'; for (var k = 0; k < 40; k++) g.fillRect((k * 53) % w, (k * 31) % h, 6, 6);
      g.fillStyle = '#9ab070'; [[150, 70, 40], [150, 130, 28], [60, 70, 26]].forEach(function (i) { g.beginPath(); g.ellipse(i[0], i[1], i[2], i[2] * 0.8, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(80,60,30,0.8)'; g.lineWidth = 2; g.stroke(); });
      g.strokeStyle = 'rgba(80,60,30,0.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(110, 72); g.lineTo(86, 72); g.stroke(); g.beginPath(); g.moveTo(150, 110); g.lineTo(150, 102); g.stroke();
      g.fillStyle = '#b01a20'; g.font = 'bold 20px sans-serif'; g.fillText('✕', 40, 62); g.strokeStyle = '#5a3a1a'; g.lineWidth = 1.5; g.beginPath(); g.arc(225, 28, 14, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.moveTo(225, 12); g.lineTo(225, 44); g.moveTo(209, 28); g.lineTo(241, 28); g.stroke(); });
    p(new THREE.PlaneGeometry(1.0, 0.62), new THREE.MeshStandardMaterial({ map: isleT, roughness: 1 }), -W + 0.03, 1.75, -0.05, 0, Math.PI / 2, 0.03);
    [[-0.3, 0.45], [0.3, -0.45], [-0.3, -0.45], [0.3, 0.45]].forEach(function (c) { p(new THREE.SphereGeometry(0.015, 6, 4), brass, -W + 0.05, 1.75 + c[0], -0.05 + c[1]); });
    // (the table: an hourglass, a quill in its inkpot, dice, a hand of cards, a compass and a little iron lockbox)
    var TT = 0.82;
    var hg = new THREE.Group(); hg.position.set(-2.1, TT, 0.1); R.add(hg);
    [0, 0.2].forEach(function (y) { lbP(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 10), oak, 0, y + 0.008, 0, 0, 0, 0, hg); }); [0, 1, 2].forEach(function (k) { var a = k / 3 * Math.PI * 2; lbP(new THREE.CylinderGeometry(0.005, 0.005, 0.2, 5), oak, Math.cos(a) * 0.04, 0.1, Math.sin(a) * 0.04, 0, 0, 0, hg); });
    lbP(lbLathe([[0, 0.015], [0.032, 0.02], [0.03, 0.07], [0.005, 0.1], [0.03, 0.13], [0.032, 0.18], [0, 0.185]], 12), new THREE.MeshStandardMaterial({ color: 0xe8f0ff, transparent: true, opacity: 0.35, roughness: 0.05, depthWrite: false }), 0, 0, 0, 0, 0, 0, hg);
    lbP(new THREE.ConeGeometry(0.026, 0.035, 10), rMat(0xd8b878), 0, 0.035, 0, 0, 0, 0, hg); lbP(new THREE.ConeGeometry(0.022, 0.03, 10), rMat(0xd8b878), 0, 0.15, 0, Math.PI, 0, 0, hg);
    p(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 10), rMat(0x14121a, { roughness: 0.2, metalness: 0.3 }), -1.6, TT + 0.025, 0.82); p(new THREE.CylinderGeometry(0.003, 0.0015, 0.22, 4), rMat(0x3a3a3a), -1.6, TT + 0.13, 0.84, 0.25, 0, 0.1);
    var quill = p(new THREE.PlaneGeometry(0.04, 0.18), rMat(0xf0ece4, { side: THREE.DoubleSide }), -1.6, TT + 0.18, 0.86, 0.25, 0.4, 0.1); quill.castShadow = false;
    [[-0.95, 0.05, 0.3], [-0.88, 0.08, 1.1]].forEach(function (d) { p(new THREE.BoxGeometry(0.03, 0.03, 0.03), bone, d[0], TT + 0.015, d[1], 0, d[2], 0); });
    for (var cd = 0; cd < 5; cd++) { var card = p(new THREE.BoxGeometry(0.06, 0.002, 0.085), rMat(cd === 2 ? 0xb02a2a : 0xf0e8d8), -0.45 + cd * 0.025, TT + 0.002 + cd * 0.001, 0.42 + cd * 0.008, 0, -0.5 + cd * 0.22, 0); }
    var cp = new THREE.Group(); cp.position.set(-1.1, TT + 0.005, 0.32); R.add(cp); lbP(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 16), brass, 0, 0.006, 0, 0, 0, 0, cp); lbP(new THREE.CircleGeometry(0.033, 16), rMat(0xe8dcc0), 0, 0.0125, 0, -Math.PI / 2, 0, 0, cp); lbP(new THREE.BoxGeometry(0.004, 0.002, 0.05), rMat(0xb02a2a), 0, 0.014, 0, 0, 0.6, 0, cp);
    var lb = new THREE.Group(); lb.position.set(-2.12, TT, 0.42); lb.rotation.y = 0.2; R.add(lb); lbP(new THREE.BoxGeometry(0.16, 0.09, 0.11), iron, 0, 0.045, 0, 0, 0, 0, lb); lbP(new THREE.BoxGeometry(0.17, 0.02, 0.12), rMat(0x34302c, { metalness: 0.6 }), 0, 0.1, 0, 0, 0, 0, lb); lbP(new THREE.BoxGeometry(0.03, 0.035, 0.01), brass, 0, 0.06, 0.06, 0, 0, 0, lb);
    // (straw scattered over the floor)
    var strawM = rMat(0xc8a860, { roughness: 1 });
    for (var sw = 0; sw < 80; sw++) { var sx = -W + 0.5 + ((sw * 53) % 80) / 80 * (HDI_W - 1), sz = -D + 0.5 + ((sw * 37) % 60) / 60 * (HDI_D - 1.6); if (sx > -2.6 && sx < 0.6 && sz > -0.4 && sz < 1.2) continue;
      var sp2 = p(new THREE.CylinderGeometry(0.003, 0.003, 0.14, 3), strawM, sx, 0.006, sz, Math.PI / 2, sw, 0); sp2.castShadow = false; }
    R.traverse(function (o) { if (o.isMesh) o.receiveShadow = true; });
  })(hideRoom);
  updateCarpenter = (function (base) { return function (t, night) {     // (the rune and the crow outside; the cauldron's steam and the embers inside)
    base.apply(this, arguments);
    if (inHide) {
      hfSteam.forEach(function (st) { var f = (t * 0.25 + st.k) % 1; st.s.position.y = 0.65 + f * 0.9; st.s.position.x = HDI_X + HDI_W / 2 - 0.83 + Math.sin(f * 6 + st.k * 5) * 0.06; st.s.scale.setScalar(0.15 + f * 0.35); st.s.material.opacity = 0.22 * Math.sin(f * Math.PI); });
      if (hfEmbers) hfEmbers.emissiveIntensity = 1.0 + Math.sin(t * 5) * 0.3 + Math.sin(t * 17) * 0.15;
    } else {
      var hr = state.minutes / 60, nt = hr < 5.5 || hr > 20 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr > 18.5 ? (hr - 18.5) / 1.5 : 0;
      if (hfRune) hfRune.opacity = 0.3 + nt * (0.6 + Math.sin(t * 1.7) * 0.15);   // (the crest: a faint shimmer by day, glowing after dark)
      if (hfRuneGlow) hfRuneGlow.material.opacity = 0.08 + nt * (0.55 + Math.sin(t * 1.7) * 0.12);
      if (hfCrow) { var hd = hfCrow.userData.head; var lookT = Math.floor(t / 2.6); hd.rotation.y = Math.sin(lookT * 12.9898) * 0.9; hd.rotation.x = Math.sin(t * 1.3) * 0.1; }
    }
  }; })(updateCarpenter);
});
