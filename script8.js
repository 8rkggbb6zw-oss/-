// Everdawn, part 5 of 5 (see the note at the top of script.js). More for you, the player, carrying on from script7.js
// (which was nearly full): it joins on after the other parts, so it shares all their variables

EVERDAWN_PARTS.push(function (THREE) {
  // ---- Victorian Vengeance's jewels: faceted red gems set all round where its skirt meets the corset, and from some of
  // them, glossy red drips running down over the skirt like blood, each ending in a hanging teardrop gem ----
  function corsetJewels(file, part) {
    return function () {
      var grp = new THREE.Group(), sk = null, cz = 0, K = 22, set = [];
      var ruby = new THREE.MeshPhysicalMaterial({ color: 0xc40a1c, emissive: 0x4a0008, roughness: 0.04, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.02, flatShading: true });
      var blood = new THREE.MeshPhysicalMaterial({ color: 0x9a0010, emissive: 0x380006, roughness: 0.06, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03 });   // (glossy, like it's still wet)
      var glint = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
      var gold = new THREE.MeshStandardMaterial({ color: 0x2a2226, roughness: 0.35, metalness: 0.8 });
      // (a cut gem: a flat table on top, sloping crown, its girdle, and a pointed pavilion behind, all in facets)
      var gem = new THREE.LatheGeometry([new THREE.Vector2(0, -0.55), new THREE.Vector2(1, 0), new THREE.Vector2(0.62, 0.32), new THREE.Vector2(0, 0.32)], 8);
      var drop = new THREE.LatheGeometry([new THREE.Vector2(0, 1.6), new THREE.Vector2(0.28, 1.1), new THREE.Vector2(0.75, 0.45), new THREE.Vector2(1, -0.1), new THREE.Vector2(0.8, -0.65), new THREE.Vector2(0.4, -0.95), new THREE.Vector2(0, -1.05)], 8);   // (a teardrop, cut in facets like a briolette)
      for (var j = 0; j < K; j++) {
        var big = j % 2 === 0, g = new THREE.Group(), s = big ? 0.0062 : 0.0042;
        var setting = new THREE.Mesh(new THREE.CylinderGeometry(s * 1.15, s * 1.15, s * 0.5, 10), gold); setting.rotation.x = Math.PI / 2; g.add(setting);   // (its dark setting)
        var stone = new THREE.Mesh(gem, ruby); stone.scale.set(s, s, s); stone.rotation.x = Math.PI / 2; stone.position.z = s * 0.3; g.add(stone);
        var gl = new THREE.Mesh(new THREE.SphereGeometry(s * 0.16, 6, 4), glint); gl.position.set(-s * 0.3, s * 0.3, s * 0.68); g.add(gl);   // (a glint of light on it)
        var d = null;
        if ([2, 5, 6, 9, 13, 14, 17, 20].indexOf(j) >= 0) {             // (from some of them, a drip, each a different length)
          var len = [0.026, 0.044, 0.018, 0.035, 0.05, 0.022, 0.039, 0.03][[2, 5, 6, 9, 13, 14, 17, 20].indexOf(j)];
          d = new THREE.Group();
          var pts = [new THREE.Vector2(0, 0.002)]; for (var n = 0; n <= 12; n++) { var t = n / 12; pts.push(new THREE.Vector2(0.0011 + 0.0024 * Math.pow(1 - t, 2) + 0.0005 * Math.sin(t * 9 + j) + 0.0012 * Math.pow(t, 6), -t * len)); }   // (the drip: wide where it leaves the gem, running thinner, a little uneven, swelling before it falls)
          pts.push(new THREE.Vector2(0, -len - 0.001)); d.add(new THREE.Mesh(new THREE.LatheGeometry(pts.reverse(), 12), blood));
          var tear = new THREE.Mesh(drop, ruby); tear.scale.set(0.0036, 0.0036, 0.0036); tear.position.y = -len - 0.004; d.add(tear);
          var tg = new THREE.Mesh(new THREE.SphereGeometry(0.0006, 6, 4), glint); tg.position.set(-0.0012, -len - 0.003, 0.0032); d.add(tg);
          g.add(d);
        }
        g.traverse(function (m) { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
        grp.add(g); set.push({ g: g, d: d, s: s });
      }
      var v = new THREE.Vector3(), w = new THREE.Vector3(), o = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), m4 = new THREE.Matrix4(), side = new THREE.Vector3(), pts = [];
      function setup() {
        sk = (outfitModel(file) || []).filter(function (m) { return m.material.name.indexOf(part) >= 0; })[0]; if (!sk) return;
        var P = sk.geometry.attributes.position, I = sk.geometry.index, rep = {}, cnt = {}, zs = [];
        function key(k) { var c = Math.round(P.getX(k) * 2e4) + ',' + Math.round(P.getY(k) * 2e4) + ',' + Math.round(P.getZ(k) * 2e4); if (!(c in rep)) rep[c] = k; return rep[c]; }
        for (var i = 0; i < I.count; i += 3) { var t = [key(I.getX(i)), key(I.getX(i + 1)), key(I.getX(i + 2))]; for (var j = 0; j < 3; j++) { var a = t[j], b = t[(j + 1) % 3], e = a < b ? a + '_' + b : b + '_' + a; cnt[e] = (cnt[e] || 0) + 1; } zs.push(P.getZ(t[0])); }
        cz = (Math.max.apply(null, zs) + Math.min.apply(null, zs)) / 2;
        var nb = {}; Object.keys(cnt).forEach(function (e) { if (cnt[e] !== 1) return; var ab = e.split('_').map(Number); (nb[ab[0]] = nb[ab[0]] || []).push(ab[1]); (nb[ab[1]] = nb[ab[1]] || []).push(ab[0]); });
        var loops = [], done = {};                                      // (its open edges; the lowest, round its bottom, is where the skirt meets it)
        Object.keys(nb).forEach(function (s0) {
          var k0 = +s0; if (done[k0]) return; var loop = [k0], prev = -1, cur = k0; done[k0] = 1;
          for (;;) { var nx = (nb[cur] || []).filter(function (n) { return n !== prev; })[0]; if (nx === undefined || nx === k0 || done[nx]) break; loop.push(nx); done[nx] = 1; prev = cur; cur = nx; }
          if (loop.length > 8) loops.push(loop);
        });
        loops.sort(function (a, b) { return a.reduce(function (t, k) { return t + P.getY(k); }, 0) / a.length - b.reduce(function (t, k) { return t + P.getY(k); }, 0) / b.length; });
        var l = loops[0]; if (!l) return;
        var len = [0]; for (var i = 1; i <= l.length; i++) len.push(len[i - 1] + new THREE.Vector3().fromBufferAttribute(P, l[i - 1]).distanceTo(new THREE.Vector3().fromBufferAttribute(P, l[i % l.length])));
        pts = [];                                                       // (the jewels spaced evenly round it, starting from the front)
        var front = 0, fz = -1e9; for (var i = 0; i < l.length; i++) if (P.getZ(l[i]) > fz) { fz = P.getZ(l[i]); front = i; }
        for (var n = 0, i = 0; n < K; n++) { var dd = (len[front] + (n + 0.5) / K * len[l.length]) % len[l.length]; i = 0; while (i < l.length - 1 && len[i + 1] < dd) i++; pts.push({ a: l[i], b: l[(i + 1) % l.length], t: (dd - len[i]) / Math.max(1e-9, len[i + 1] - len[i]) }); }
      }
      grp.children[0].children[1].onBeforeRender = function () {         // (each frame: every jewel where that point of the corset is now, facing out, its drip hanging down the skirt)
        if (!sk || !pts.length) return;
        set.forEach(function (j, n) {
          var p = pts[n]; sk.boneTransform(p.a, v); sk.boneTransform(p.b, w); v.lerp(w, p.t); o.set(v.x, 0, v.z - cz).normalize();
          j.g.position.copy(v).addScaledVector(o, 0.017).addScaledVector(up, -0.006);
          side.crossVectors(up, o); m4.makeBasis(side, up, o); j.g.quaternion.setFromRotationMatrix(m4);
          if (j.d) { j.d.rotation.x = -0.42; j.d.position.set(0, -j.s * 0.6, 0.001); }   // (leaning out a little with the skirt beneath it)
        });
      };
      return [{ dress: true, obj: grp, setup: setup }];
    };
  }
  var vv = CLOTH_STOCK.filter(function (c) { return c.id === 'cloth_victorian_vengeance'; })[0];
  if (vv) { var vvWear = vv.wear; vv.wear = function () { return vvWear().concat(corsetJewels('Victorian Vengeance.vrm', 'CLOTH_01')()); }; }   // (worn, along with its frills: its jewels)
});
