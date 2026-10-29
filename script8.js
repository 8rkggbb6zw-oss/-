// Everdawn, part 5 of 5 (see the note at the top of script.js). More for you, the player, carrying on from script7.js
// (which was nearly full): it joins on after the other parts, so it shares all their variables

EVERDAWN_PARTS.push(function (THREE) {
  // ---- Victorian Vengeance's blood rubies: a band of ruby round where its skirt meets the corset, like blood poured
  // round it, with drips of ruby running down the skirt from it, each a different length and ending in a faceted drop,
  // and a few drops fallen below them ----
  var rubyEnv = (function () {                                         // (something for the rubies to reflect: soft light above, a few bright lights to sparkle in, dark below)
    var faces = [];
    for (var f = 0; f < 6; f++) {
      var c = document.createElement('canvas'); c.width = c.height = 32; var g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 32);
      gr.addColorStop(0, f === 3 ? '#0c0607' : '#5a4c4a'); gr.addColorStop(1, f === 2 ? '#6a5c58' : '#0e0708'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32);
      g.fillStyle = '#fff'; for (var k = 0; k < 3; k++) { g.beginPath(); g.arc((f * 11 + k * 13) % 28 + 2, (f * 7 + k * 9) % 14 + 3, 1.6 + k % 2, 0, Math.PI * 2); g.fill(); }
      faces.push(c);
    }
    var t = new THREE.CubeTexture(faces); t.needsUpdate = true; return t;
  })();
  function bloodRubies(file, part) {
    return function () {
      var grp = new THREE.Group(), sk = null, cz = 0, N = 96, D = 30, drips = [];
      var ruby = new THREE.MeshStandardMaterial({ color: 0x700010, emissive: 0x1e0004, roughness: 0.03, metalness: 0.62, envMap: rubyEnv, envMapIntensity: 2.4, flatShading: true });   // (deep crimson, catching the light in its facets)
      var smooth = ruby.clone(); smooth.side = THREE.DoubleSide;     // (the band, cut in facets like the drops)
      var R = 7, bpos = new Float32Array((N + 1) * R * 3), idx = [];
      for (var i = 0; i < N; i++) for (var r = 0; r < R - 1; r++) { var a = i * R + r, b = a + R; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      var bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(bpos, 3)); bg.setIndex(idx);
      var band = new THREE.Mesh(bg, smooth); band.frustumCulled = false; band.castShadow = true; grp.add(band);
      var bead = new THREE.IcosahedronGeometry(1, 1);
      for (var j = 0; j < D; j++) {                                    // (each drip: a different length; some with a second bead partway, some with a drop fallen below)
        var len = 0.005 + 0.034 * Math.pow(Math.abs(Math.sin(j * 2.31 + 0.7)), 1.5), w0 = 0.0036 + 0.002 * Math.abs(Math.sin(j * 1.7)), d = new THREE.Group(), pts = [new THREE.Vector2(0, 0.003)];
        for (var n = 0; n <= 10; n++) { var t = n / 10; pts.push(new THREE.Vector2(w0 * (0.78 + 0.5 * Math.pow(1 - t, 3)) + 0.0004 * Math.sin(t * 7 + j), -t * len)); }
        pts.push(new THREE.Vector2(0, -len)); d.add(new THREE.Mesh(new THREE.LatheGeometry(pts.reverse(), 9), ruby));
        var end = new THREE.Mesh(bead, ruby), er = w0 * 1.15; end.scale.set(er, er * 1.25, er); end.position.y = -len - er * 0.6; d.add(end);   // (the drop at its end)
        if (j % 3 === 1 && len > 0.025) { var mid = new THREE.Mesh(bead, ruby), mr = w0 * 0.85; mid.scale.set(mr, mr * 1.3, mr); mid.position.y = -len * 0.5; d.add(mid); }
        if (j % 4 === 2) { var fall = new THREE.Mesh(bead, ruby), fr = w0 * 0.8; fall.scale.set(fr, fr * 1.3, fr); fall.position.y = -len - 0.012 - 0.008 * (j % 3); d.add(fall); }   // (a drop fallen below it)
        d.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
        grp.add(d); drips.push(d);
      }
      var v = new THREE.Vector3(), w = new THREE.Vector3(), o = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), m4 = new THREE.Matrix4(), side = new THREE.Vector3(), q = new THREE.Quaternion(), tilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -0.46), pts = [], c = [];
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
      band.onBeforeRender = function () {                              // (each frame: the band where the corset's edge is now, and the drips hanging from it down the skirt)
        if (!sk || !pts.length) return;
        pts.forEach(function (p, i) { sk.boneTransform(p.a, c[i]); sk.boneTransform(p.b, w); c[i].lerp(w, p.t); });
        for (var r = 0; r < 2; r++) for (var i = 0; i < N; i++) c[i].lerp(w.copy(c[(i + N - 1) % N]).add(c[(i + 1) % N]).multiplyScalar(0.5), 0.5);
        for (var i = 0; i <= N; i++) {
          v.copy(c[i % N]); o.set(v.x, 0, v.z - cz).normalize();
          var h = 0.0075 + 0.0018 * Math.sin(i * 0.9) + 0.0012 * Math.sin(i * 2.3);   // (poured, so a little uneven)
          for (var r = 0; r < R; r++) { var a = -Math.PI / 2 + r / (R - 1) * Math.PI, out = pts[i % N].out + 0.008 * Math.cos(a), y = v.y - 0.008 + h * Math.sin(a) * (a < 0 ? 1.3 : 1);   // (just outside the skirt's top, over the seam)
            bpos.set([v.x + o.x * out, y, v.z + o.z * out], (i * R + r) * 3); }
        }
        bg.attributes.position.needsUpdate = true; bg.computeVertexNormals();
        drips.forEach(function (d, j) {
          var f = (j + 0.5) / D * N, i0 = Math.floor(f) % N, p = pts[i0]; v.copy(c[i0]).lerp(c[(i0 + 1) % N], f - Math.floor(f)); o.set(v.x, 0, v.z - cz).normalize();
          d.position.copy(v).addScaledVector(o, p.out + 0.002).addScaledVector(up, -0.01);
          side.crossVectors(up, o); m4.makeBasis(side, up, o); tilt.setFromAxisAngle(side.set(1, 0, 0), -p.lean - 0.08); d.quaternion.setFromRotationMatrix(m4).multiply(tilt);   // (running down the skirt as steeply as it flares there)
        });
      };
      return [{ dress: true, obj: grp, setup: setup }];
    };
  }
  var vv = CLOTH_STOCK.filter(function (c) { return c.id === 'cloth_victorian_vengeance'; })[0];
  if (vv) { var vvWear = vv.wear; vv.wear = function () { return vvWear().concat(bloodRubies('Victorian Vengeance.vrm', 'CLOTH_01')()); }; }   // (worn, along with its frills: its blood rubies)
});
