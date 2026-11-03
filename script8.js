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
    for (var r = 0, y = 0; y < h; r++) { var hh = 26 + (r * 7) % 12; for (var x = -((r * 37) % 60); x < w; ) { var ww = 44 + ((r * 13 + x) % 36);
      var c = 168 + ((r * 31 + x * 7) % 34); g.fillStyle = 'rgb(' + c + ',' + (c - 16) + ',' + (c - 42) + ')'; g.fillRect(x + 2, y + 2, ww - 4, hh - 4);
      g.fillStyle = 'rgba(255,240,210,0.18)'; g.fillRect(x + 2, y + 2, ww - 4, 3); g.fillStyle = 'rgba(60,40,20,0.18)'; g.fillRect(x + 2, y + hh - 6, ww - 4, 4); x += ww; } y += hh; }
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
    [-1, 1].forEach(function (s) { var gm = lbP(new THREE.ExtrudeGeometry(gab, { depth: 0.28, bevelEnabled: false }), lbStone, s * W - (s > 0 ? 0.14 : -0.14), H, 0, 0, Math.PI / 2, 0); gm.position.x = s > 0 ? W - 0.14 : -W - 0.14; });
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
  var labSolids = [], lbWalls = [], lbHolo = [], lbArms = [], lbChambers = [], LB_COUNTER = [2.4, 1.6], LB_COUNTER_W = 2.0;
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
    // (the lab benches in the middle, a U open toward the door: white cabinets with drawers, pale tops)
    function bench(x, z, lx, lz) {
      p(new THREE.BoxGeometry(lx, 0.82, lz), white, x, 0.41, z); p(new THREE.BoxGeometry(lx + 0.08, 0.05, lz + 0.08), pale, x, 0.85, z);
      var along = lx > lz, n = Math.floor((along ? lx : lz) / 0.55);
      for (var i = 0; i < n; i++) { var o = -(along ? lx : lz) / 2 + 0.275 + i * 0.55; for (var r = 0; r < 3; r++) [-1, 1].forEach(function (sd) {
        var y = 0.2 + r * 0.24; if (along) p(new THREE.BoxGeometry(0.3, 0.02, 0.01), dark, x + o, y, z + sd * (lz / 2 + 0.006)); else p(new THREE.BoxGeometry(0.01, 0.02, 0.3), dark, x + sd * (lx / 2 + 0.006), y, z + o); }); }
      labSolids.push.apply(labSolids, (function () { var a = [], L = along ? lx : lz; for (var t = -L / 2 + 0.4; t <= L / 2 - 0.3; t += 0.6) a.push(along ? [x + t, z, lz / 2 + 0.05] : [x, z + t, lx / 2 + 0.05]); return a; })());
    }
    bench(0, -0.7, 3.6, 0.9); bench(-1.35, 0.55, 0.9, 1.6); bench(1.35, 0.55, 0.9, 1.6);
    // (on the benches: tablets, holographic screens floating above them, bottles, a microscope and a robotic arm)
    [[-0.9, -0.75, 0.2], [0.7, -0.6, -0.2], [-1.35, 0.9, 1.4], [1.35, 0.3, -1.5]].forEach(function (t, i) { var tab = p(new THREE.BoxGeometry(0.42, 0.015, 0.3), dark, t[0], 0.885, t[1], 0, t[2], 0); p(new THREE.PlaneGeometry(0.38, 0.26), new THREE.MeshBasicMaterial({ map: screenTex(i + 3) }), t[0], 0.895, t[1], -Math.PI / 2, 0, -t[2]); });
    [[-1.0, 1.45, -0.7, 0.2, 0], [0.1, 1.5, -0.95, 0, 0], [0.95, 1.45, -0.75, -0.25, 0], [-1.35, 1.4, 0.3, 1.4, 0], [1.35, 1.4, 0.9, -1.4, 0]].forEach(function (h, i) {   // (holograms)
      var m = new THREE.MeshBasicMaterial({ map: screenTex(i * 7 + 1), color: 0xbaf6ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
      var pl = p(new THREE.PlaneGeometry(0.72, 0.46), m, h[0], h[1], h[2], 0, h[3], 0); pl.castShadow = false; lbHolo.push({ m: m, k: i });
      p(new THREE.BoxGeometry(0.62, 0.008, 0.008), cyanM, h[0], h[1] - 0.2, h[2], 0, h[3], 0);
    });
    [[0.45, -0.95], [0.55, -0.88]].forEach(function (b) { p(new THREE.CylinderGeometry(0.045, 0.05, 0.22, 12), rMat(0xc8202a, { roughness: 0.3 }), b[0], 0.98, b[1]); p(new THREE.CylinderGeometry(0.02, 0.03, 0.06, 8), white, b[0], 1.12, b[1]); });
    p(new THREE.CylinderGeometry(0.02, 0.04, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0xe6f6ff, transparent: true, opacity: 0.4 }), 0.68, 1.02, -0.92);
    var MS = new THREE.Group(); MS.position.set(-0.3, 0.875, -0.85); R.add(MS);   // (a white microscope)
    p(new THREE.BoxGeometry(0.2, 0.03, 0.26), white, 0, 0.015, 0, 0, 0, 0, MS); p(new THREE.BoxGeometry(0.05, 0.3, 0.06), white, 0, 0.16, -0.09, 0, 0, 0, MS); p(new THREE.CylinderGeometry(0.025, 0.03, 0.16, 10), dark, 0, 0.27, -0.02, 0.5, 0, 0, MS); p(new THREE.BoxGeometry(0.14, 0.015, 0.12), dark, 0, 0.12, 0.0, 0, 0, 0, MS);
    function arm(x, z, ry) {                                            // (a white robotic arm, its joints dark, its tip glowing)
      var base = new THREE.Group(); base.position.set(x, 0.875, z); base.rotation.y = ry; R.add(base);
      p(new THREE.CylinderGeometry(0.09, 0.11, 0.08, 16), white, 0, 0.04, 0, 0, 0, 0, base);
      var s1 = new THREE.Group(); s1.position.y = 0.08; base.add(s1); p(new THREE.SphereGeometry(0.06, 12, 8), dark, 0, 0, 0, 0, 0, 0, s1); p(new THREE.BoxGeometry(0.07, 0.36, 0.07), white, 0, 0.18, 0, 0, 0, 0, s1);
      var s2 = new THREE.Group(); s2.position.y = 0.36; s1.add(s2); p(new THREE.SphereGeometry(0.05, 12, 8), dark, 0, 0, 0, 0, 0, 0, s2); p(new THREE.BoxGeometry(0.06, 0.3, 0.06), white, 0, 0.15, 0, 0, 0, 0, s2);
      var s3 = new THREE.Group(); s3.position.y = 0.3; s2.add(s3); p(new THREE.SphereGeometry(0.04, 10, 6), dark, 0, 0, 0, 0, 0, 0, s3); p(new THREE.CylinderGeometry(0.025, 0.03, 0.1, 8), white, 0, 0.05, 0, 0, 0, 0, s3); p(new THREE.SphereGeometry(0.018, 8, 6), cyanM, 0, 0.11, 0, 0, 0, 0, s3);
      lbArms.push({ b: base, s1: s1, s2: s2, s3: s3, k: lbArms.length, ry: ry });
    }
    arm(0.2, -0.55, 0); arm(-1.35, 0.1, Math.PI / 2);
    // (along the back wall: a white counter of lab machines, their screens lit)
    p(new THREE.BoxGeometry(LBI_W - 1.4, 0.88, 0.6), white, 0, 0.44, -D + 0.32); p(new THREE.BoxGeometry(LBI_W - 1.3, 0.04, 0.66), pale, 0, 0.9, -D + 0.32);
    [[-2.6, 0.55, 0.5, 0.45], [-1.6, 0.42, 0.62, 0.4], [-0.5, 0.75, 0.7, 0.45], [0.7, 0.6, 0.55, 0.42], [1.8, 0.48, 0.66, 0.42], [2.75, 0.62, 0.45, 0.4]].forEach(function (mc, i) {
      p(new THREE.BoxGeometry(mc[2], mc[1], mc[3]), white, mc[0], 0.92 + mc[1] / 2, -D + 0.32);
      p(new THREE.PlaneGeometry(mc[2] * 0.62, mc[1] * 0.42), new THREE.MeshBasicMaterial({ map: screenTex(i * 11 + 5) }), mc[0] - mc[2] * 0.1, 0.92 + mc[1] * 0.62, -D + 0.32 + mc[3] / 2 + 0.003);
      p(new THREE.BoxGeometry(mc[2] * 0.7, 0.03, 0.02), dark, mc[0], 0.98, -D + 0.32 + mc[3] / 2 + 0.01);
      if (i % 2) p(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8), cyanM, mc[0] + mc[2] * 0.35, 0.92 + mc[1] + 0.06, -D + 0.32);
    });
    for (var bx = -2.8; bx <= 2.8; bx += 0.7) labSolids.push([bx, -D + 0.35, 0.38]);
    // (the left wall: a lit panel where plants grow in a grid of tubes)
    var PW = new THREE.Group(); PW.position.set(-W + 0.06, 1.55, 0.3); PW.rotation.y = Math.PI / 2; R.add(PW);
    p(new THREE.BoxGeometry(2.0, 2.0, 0.08), lightM, 0, 0, 0, 0, 0, 0, PW); p(new THREE.BoxGeometry(1.84, 1.84, 0.06), rMat(0xb8eefa, { emissive: 0x7ad8f0, emissiveIntensity: 0.7, roughness: 0.4 }), 0, 0, 0.02, 0, 0, 0, PW);
    for (var c = 0; c < 6; c++) {
      p(new THREE.CylinderGeometry(0.1, 0.1, 1.7, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide }), -0.75 + c * 0.3, 0, 0.12, 0, 0, 0, PW);
      for (var r2 = 0; r2 < 4; r2++) { var py = -0.65 + r2 * 0.43; p(new THREE.CylinderGeometry(0.06, 0.05, 0.08, 10), white, -0.75 + c * 0.3, py, 0.12, 0, 0, 0, PW);
        for (var lf = 0; lf < 4; lf++) { var la = lf / 4 * Math.PI * 2 + c + r2; p(new THREE.ConeGeometry(0.025, 0.16, 5), rMat([0x4aa860, 0x6cc070, 0x3a9050][(c + r2) % 3]), -0.75 + c * 0.3 + Math.sin(la) * 0.03, py + 0.12, 0.12 + Math.cos(la) * 0.03, Math.cos(la) * 0.5, 0, -Math.sin(la) * 0.5, PW); } }
    }
    // (the right wall: a big window onto a city at night, and before it a row of glass growth chambers)
    var city = cpTex(512, 256, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0f2a'); gr.addColorStop(1, '#2a1a4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect((i * 97) % w, (i * 31) % 70, 1.5, 1.5); }
      for (var b = 0; b < 26; b++) { var bw = 14 + (b * 13) % 22, bh = 60 + (b * 47) % 150, bx2 = (b * 41) % (w - bw); g.fillStyle = ['#141a3a', '#1a1438', '#10203a'][b % 3]; g.fillRect(bx2, h - bh, bw, bh);
        for (var wy = h - bh + 6; wy < h - 4; wy += 7) for (var wx = bx2 + 3; wx < bx2 + bw - 3; wx += 5) if ((wx * 7 + wy * 3 + b) % 5 < 2) { g.fillStyle = ['#ffd890', '#9ae8ff', '#ff8ad8'][(wx + wy) % 3]; g.fillRect(wx, wy, 2, 3); } }
      g.fillStyle = '#ff5ab8'; g.fillRect(w * 0.62, h - 190, 4, 30); g.fillStyle = '#5ae8ff'; g.fillRect(w * 0.3, h - 150, 26, 3);
    });
    var WN = new THREE.Group(); WN.position.set(W - 0.03, 1.6, -0.3); WN.rotation.y = -Math.PI / 2; R.add(WN);
    p(new THREE.PlaneGeometry(4.6, 1.9), new THREE.MeshBasicMaterial({ map: city }), 0, 0, 0, 0, 0, 0, WN);
    [[0, 0.98, 4.7, 0.06], [0, -0.98, 4.7, 0.06], [-2.33, 0, 0.06, 2.0], [2.33, 0, 0.06, 2.0], [0, 0, 0.03, 1.9]].forEach(function (f) { p(new THREE.BoxGeometry(f[2], f[3], 0.05), white, f[0], f[1], 0.02, 0, 0, 0, WN); });
    [-1.6, -0.75, 0.1, 0.95].forEach(function (cz, i) {
      var cx = W - 0.55; p(new THREE.CylinderGeometry(0.26, 0.28, 0.6, 20), white, cx, 0.3, cz); p(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 20), cyanM, cx, 0.61, cz);
      var gm = new THREE.MeshStandardMaterial({ color: 0xd8f8ff, transparent: true, opacity: 0.3, roughness: 0.05, emissive: 0x4ad8ff, emissiveIntensity: 0.25, depthWrite: false });
      p(new THREE.CylinderGeometry(0.24, 0.24, 0.78, 20, 1, true), gm, cx, 1.02, cz); p(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 20), white, cx, 1.44, cz);
      for (var lf = 0; lf < 9; lf++) { var la = lf * 2.39, rr = 0.03 + (lf % 3) * 0.04; p(new THREE.ConeGeometry(0.035, 0.36 + (lf % 4) * 0.06, 5), rMat([0x4ab868, 0x7ad070, 0x5aa8c8, 0xd86ab0][(i + lf) % 4]), cx + Math.sin(la) * rr, 0.85, cz + Math.cos(la) * rr, Math.cos(la) * 0.3, 0, -Math.sin(la) * 0.3); }
      lbChambers.push(gm); labSolids.push([cx, cz, 0.3]);
    });
    // (the counter by the door, for the shop to come: white, with a glowing edge and a tablet)
    p(new THREE.BoxGeometry(LB_COUNTER_W, 1.0, 0.6), white, LB_COUNTER[0], 0.5, LB_COUNTER[1]); p(new THREE.BoxGeometry(LB_COUNTER_W + 0.08, 0.05, 0.68), pale, LB_COUNTER[0], 1.02, LB_COUNTER[1]);
    p(new THREE.BoxGeometry(LB_COUNTER_W, 0.03, 0.02), cyanM, LB_COUNTER[0], 0.9, LB_COUNTER[1] - 0.31);
    p(new THREE.BoxGeometry(0.4, 0.015, 0.28), dark, LB_COUNTER[0] - 0.4, 1.055, LB_COUNTER[1], 0, 0.2, 0); p(new THREE.PlaneGeometry(0.36, 0.24), new THREE.MeshBasicMaterial({ map: screenTex(42) }), LB_COUNTER[0] - 0.4, 1.065, LB_COUNTER[1], -Math.PI / 2, 0, -0.2);
    for (var cbx = -1; cbx <= 1; cbx++) labSolids.push([LB_COUNTER[0] + cbx * 0.7, LB_COUNTER[1], 0.42]);
    // (the doorway out, and a mat before it)
    p(new THREE.PlaneGeometry(1.3, 2.2), rMat(0x3a4250), 0, 1.1, D - 0.02, 0, Math.PI, 0); p(new THREE.PlaneGeometry(1.2, 0.6), rMat(0x5a6476, { roughness: 1 }), 0, 0.006, D - 0.5, -Math.PI / 2, 0, 0);
    R.traverse(function (o) { if (o.isMesh) o.receiveShadow = true; });
  })(labRoom);
  var lbLook = new THREE.Vector3();
  function updateLabInside(t) {
    lbLook.set(camera.position.x - LBI_X, 0, camera.position.z - LBI_Z);
    lbWalls.forEach(function (W) { W.g.visible = lbLook.dot(W.n) < W.d - 0.6; });   // (the wall between you and the camera steps aside)
    lbHolo.forEach(function (h) { h.m.opacity = 0.8 + Math.sin(t * 3 + h.k * 1.7) * 0.06 + (Math.sin(t * 37 + h.k) > 0.97 ? -0.2 : 0); });   // (the holograms shimmer, now and then flickering)
    lbArms.forEach(function (a) { var f = t * 0.7 + a.k * 2; a.b.rotation.y = a.ry + Math.sin(f) * 0.9; a.s1.rotation.z = 0.5 + Math.sin(f * 1.3) * 0.25; a.s2.rotation.z = -1.2 + Math.sin(f * 1.7) * 0.35; a.s3.rotation.z = -0.6 + Math.sin(f * 2.1) * 0.3; });
    lbChambers.forEach(function (g, i) { g.emissiveIntensity = 0.2 + 0.1 * Math.sin(t * 1.5 + i); });
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
        indoors = true; inShop = inClinic = inBarn = inCarp = inCoop = inFbarn = inCloth = false; inLab = true;
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

});
