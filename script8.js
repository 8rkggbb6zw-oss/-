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
    img.src = 'data:image/webp;base64,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';
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
});
