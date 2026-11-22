// Everdawn, part 6 of 6 (see the note at the top of script.js). More of the game, carrying on from script8.js (which was
// nearly full): it joins on after the other parts, so it shares all their variables

EVERDAWN_PARTS.push(function (THREE) {
  // ===== Reel & Wing's front porch, dressed in detail: its floor of painted boards, two fluted columns with carved brackets
  // holding up the awning, railings of turned balusters on newel posts, and everything sitting on it: a slatted bench with a
  // cushion, pillows, a folded blanket and a tackle box; a staved barrel of fishing rods and bug nets with a coil of rope;
  // a brass lantern on a scrolled iron bracket by the
  // door and its twin on the other side, lit after dark; detailed windows with flower boxes and a panelled door; and two terracotta pots of agave on their saucers ====
  (function () {
    if (!rwShop) return;
    var R = rwShop, sg = R.sg, G = R.G, P = R.P, Q = R.Q, rnd = R.rnd, BD = R.BD, PZ = R.PZ, FZ = PZ - 0.1;
    var paintT = cpTex(128, 128, function (g, w, h) { g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, h); for (var i = 0; i < 260; i++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '170,156,134,' : '255,255,250,') + (rnd() * 0.18).toFixed(2) + ')'; g.fillRect(rnd() * w, rnd() * h, 2 + rnd() * 14, 1); }
      for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(150,130,104,0.35)'; g.fillRect(rnd() * w, rnd() * h, 3 + rnd() * 8, 1 + rnd() * 2); } }, [2, 2]);   // (old paint, worn here and there)
    var paintM = new THREE.MeshStandardMaterial({ map: paintT, roughness: 0.62 });

    // ---- the floor: painted boards running out from the house, worn pale where feet go, nail heads in rows ----
    var floorT = cpTex(512, 256, function (g, w, h) { var n = 16, bw = w / n, i;
      for (i = 0; i < n; i++) { var c = new THREE.Color('#bfb4a2').offsetHSL(0, 0, (rnd() - 0.5) * 0.05); g.fillStyle = '#' + c.getHexString(); g.fillRect(i * bw, 0, bw, h);
        for (var k = 0; k < 10; k++) { g.strokeStyle = 'rgba(' + (rnd() < 0.6 ? '110,96,80,' : '240,234,222,') + (0.06 + rnd() * 0.12).toFixed(2) + ')'; g.lineWidth = 0.6 + rnd(); var x = i * bw + 2 + rnd() * (bw - 4); g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (rnd() - 0.5) * 3, h); g.stroke(); }
        g.fillStyle = 'rgba(40,32,24,0.65)'; g.fillRect(i * bw, 0, 1.5, h); g.fillStyle = 'rgba(255,250,240,0.25)'; g.fillRect(i * bw + 1.5, 0, 1, h);   // (the gap between boards)
        var j = rnd() * h; g.fillStyle = 'rgba(40,32,24,0.6)'; g.fillRect(i * bw, j, bw, 1.2);   // (a butt joint)
        g.fillStyle = 'rgba(70,64,58,0.8)'; [j - 5, j + 5, h * 0.25, h * 0.75].forEach(function (ny) { g.beginPath(); g.arc(i * bw + bw / 2, ny, 1.1, 0, 7); g.fill(); }); }
      var gr = g.createRadialGradient(w / 2, h * 0.5, 10, w / 2, h * 0.5, w * 0.35); gr.addColorStop(0, 'rgba(240,232,214,0.35)'); gr.addColorStop(1, 'rgba(240,232,214,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);   // (worn pale down the middle)
      for (i = 0; i < 400; i++) { g.fillStyle = 'rgba(214,190,140,' + (rnd() * 0.5).toFixed(2) + ')'; g.fillRect(rnd() * w, rnd() * h, 1, 1); } });   // (sand walked in)
    Q(P(sg, new THREE.PlaneGeometry(4.72, PZ - BD + 0.04), new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.82 }), 0, 0.003, (BD + PZ) / 2, -Math.PI / 2, 0, 0)).receiveShadow = true;

    // ---- the columns: a moulded plinth, a fluted shaft swelling gently, a capital, and a carved bracket each way ----
    var shaftG = new THREE.CylinderGeometry(0.058, 0.068, 1.86, 40, 12, true), sp = shaftG.attributes.position;
    for (var i = 0; i < sp.count; i++) { var x = sp.getX(i), y = sp.getY(i), z = sp.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z), en = 1 + 0.03 * Math.cos(y / 0.93 * 1.2), fl = Math.cos(a * 16) > 0.55 ? 0.9 : 1;   // (entasis and sixteen flutes)
      if (Math.abs(y) > 0.86) fl = 1; sp.setX(i, Math.cos(a) * r * en * fl); sp.setZ(i, Math.sin(a) * r * en * fl); }
    shaftG.computeVertexNormals();
    var brS = new THREE.Shape(); brS.moveTo(0, 0); brS.lineTo(0.34, 0); brS.quadraticCurveTo(0.3, -0.04, 0.22, -0.08); brS.bezierCurveTo(0.12, -0.12, 0.08, -0.2, 0.06, -0.3); brS.quadraticCurveTo(0.05, -0.34, 0.02, -0.34); brS.lineTo(0, -0.34); brS.lineTo(0, 0);
    var brH = new THREE.Path(); brH.absarc(0.13, -0.09, 0.035, 0, Math.PI * 2, true); brS.holes.push(brH);   // (a scroll with a round cut-out)
    var brG = new THREE.ExtrudeGeometry(brS, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 12 }); brG.translate(0, 0, -0.015);
    [-2.3, 2.3].forEach(function (px) { var c = G(sg, px, 0, FZ, 0);
      P(c, new THREE.BoxGeometry(0.2, 0.14, 0.2), paintM, 0, 0.07, 0); P(c, new THREE.BoxGeometry(0.17, 0.03, 0.17), paintM, 0, 0.155, 0); P(c, new THREE.TorusGeometry(0.075, 0.014, 8, 24), paintM, 0, 0.19, 0, Math.PI / 2, 0, 0);   // (plinth and base mouldings)
      P(c, shaftG, paintM, 0, 0.2 + 0.93, 0);
      P(c, new THREE.TorusGeometry(0.064, 0.012, 8, 24), paintM, 0, 2.06, 0, Math.PI / 2, 0, 0); P(c, new THREE.CylinderGeometry(0.09, 0.066, 0.06, 20), paintM, 0, 2.1, 0); P(c, new THREE.BoxGeometry(0.18, 0.035, 0.18), paintM, 0, 2.145, 0);   // (capital)
      P(c, brG, paintM, 0, 2.165, 0, 0, px < 0 ? 0 : Math.PI, 0);   // (a bracket along the beam, toward the door)
      P(c, brG, paintM, 0, 2.165, 0, 0, Math.PI / 2, 0); });   // (and one back toward the house)

    // ---- the railings: a moulded handrail, a bottom rail on blocks, turned balusters, newel posts with panels and ball caps ----
    var balG = new THREE.LatheGeometry([[0, 0], [0.024, 0], [0.024, 0.03], [0.017, 0.045], [0.014, 0.07], [0.026, 0.2], [0.03, 0.26], [0.02, 0.36], [0.013, 0.45], [0.018, 0.48], [0.012, 0.5], [0.012, 0.56], [0.022, 0.58], [0.022, 0.62], [0, 0.62]].map(function (v) { return new THREE.Vector2(v[0], v[1]); }), 14);
    var balIM = new THREE.InstancedMesh(balG, paintM, 80), bn = 0, bo = new THREE.Object3D();
    var hrS = new THREE.Shape(); hrS.moveTo(-0.045, 0); hrS.lineTo(0.045, 0); hrS.lineTo(0.045, 0.02); hrS.quadraticCurveTo(0.045, 0.06, 0, 0.065); hrS.quadraticCurveTo(-0.045, 0.06, -0.045, 0.02); hrS.lineTo(-0.045, 0);
    function rail(x0, z0, x1, z1) { var L = Math.hypot(x1 - x0, z1 - z0), a = Math.atan2(z1 - z0, x1 - x0), g = G(sg, (x0 + x1) / 2, 0, (z0 + z1) / 2, -a);
      var hg = new THREE.ExtrudeGeometry(hrS, { depth: L, bevelEnabled: false, curveSegments: 6 }); hg.translate(0, 0, -L / 2); P(g, hg, paintM, 0, 0.8, 0, 0, Math.PI / 2, 0);   // (the handrail, rounded on top)
      P(g, new THREE.BoxGeometry(L, 0.035, 0.07), paintM, 0, 0.785, 0); P(g, new THREE.BoxGeometry(L, 0.045, 0.06), paintM, 0, 0.13, 0);   // (the rails)
      for (var b = -L / 2 + 0.1; b <= L / 2 - 0.09 && bn < 80; b += 0.115) { bo.position.set(b, 0.155, 0); bo.rotation.set(0, rnd() * 6, 0); bo.scale.set(1, 1, 1); bo.updateMatrix(); g.updateMatrix(); balIM.setMatrixAt(bn++, new THREE.Matrix4().multiplyMatrices(g.matrix, bo.matrix)); } }
    function newel(x, z) { var n = G(sg, x, 0, z, 0); P(n, new THREE.BoxGeometry(0.13, 0.9, 0.13), paintM, 0, 0.45, 0);
      [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(function (a) { Q(P(n, new THREE.BoxGeometry(0.08, 0.5, 0.008), new THREE.MeshStandardMaterial({ map: paintT, color: 0xe4d8c0, roughness: 0.62 }), Math.sin(a) * 0.066, 0.42, Math.cos(a) * 0.066, 0, a, 0)); });   // (recessed panels)
      P(n, new THREE.BoxGeometry(0.17, 0.03, 0.17), paintM, 0, 0.915, 0); P(n, new THREE.BoxGeometry(0.15, 0.04, 0.15), paintM, 0, 0.95, 0); P(n, new THREE.CylinderGeometry(0.035, 0.05, 0.04, 14), paintM, 0, 0.99, 0); P(n, new THREE.SphereGeometry(0.06, 18, 14), paintM, 0, 1.06, 0); P(n, new THREE.BoxGeometry(0.16, 0.06, 0.16), paintM, 0, 0.03, 0); }
    rail(-2.3, BD + 0.08, -2.3, FZ - 0.08); rail(2.3, BD + 0.08, 2.3, FZ - 0.08); rail(-2.22, FZ, -0.78, FZ); rail(0.78, FZ, 2.22, FZ);
    newel(-0.72, FZ); newel(0.72, FZ); balIM.count = bn; balIM.castShadow = true; balIM.receiveShadow = true; sg.add(balIM);

    // ---- the bench: turned legs, a slatted seat and back with a curved top rail, scrolled arms, a cushion with piping,
    // two striped pillows, a folded blanket over one arm and a tackle box at its end ----
    var bench = G(sg, -1.45, 0, BD + 0.49, 0),   // (its back against the wall, under the window box)
      sageM = rMat(0x86a184, { roughness: 0.6 }), legG = new THREE.LatheGeometry([[0, 0], [0.022, 0], [0.022, 0.03], [0.016, 0.06], [0.02, 0.16], [0.016, 0.3], [0.02, 0.34], [0, 0.34]].map(function (v) { return new THREE.Vector2(v[0], v[1]); }), 12);
    [[-0.58, 0.14], [0.58, 0.14], [-0.58, -0.14], [0.58, -0.14]].forEach(function (l) { P(bench, legG, paintM, l[0], 0, l[1]); });
    P(bench, new THREE.BoxGeometry(1.24, 0.04, 0.05), paintM, 0, 0.36, 0.15); P(bench, new THREE.BoxGeometry(1.24, 0.04, 0.05), paintM, 0, 0.36, -0.15);   // (aprons)
    for (var s = 0; s < 5; s++) P(bench, new THREE.BoxGeometry(1.2, 0.025, 0.055), sageM, 0, 0.395, -0.13 + s * 0.065);   // (seat slats)
    [-0.58, 0.58].forEach(function (bx) { P(bench, new THREE.BoxGeometry(0.04, 0.52, 0.04), paintM, bx, 0.62, -0.17); });   // (back posts)
    var tr = new THREE.Shape(); tr.moveTo(-0.6, 0); tr.lineTo(0.6, 0); tr.lineTo(0.6, 0.05); tr.quadraticCurveTo(0, 0.14, -0.6, 0.05); tr.lineTo(-0.6, 0);
    var trG = new THREE.ExtrudeGeometry(tr, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }); trG.translate(0, 0, -0.02); P(bench, trG, sageM, 0, 0.82, -0.17);   // (curved top rail)
    for (s = 0; s < 9; s++) P(bench, new THREE.BoxGeometry(0.06, 0.36, 0.018), sageM, -0.48 + s * 0.12, 0.62, -0.17);   // (back slats)
    [-0.62, 0.62].forEach(function (ax) { var arm = new THREE.Shape(); arm.moveTo(-0.17, 0); arm.lineTo(0.15, 0); arm.quadraticCurveTo(0.22, 0, 0.22, 0.04); arm.quadraticCurveTo(0.22, 0.07, 0.15, 0.06); arm.lineTo(-0.17, 0.05); arm.lineTo(-0.17, 0);
      var ag = new THREE.ExtrudeGeometry(arm, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 }); ag.translate(0, 0, -0.025); P(bench, ag, paintM, ax, 0.6, 0, 0, -Math.PI / 2, 0);
      P(bench, legG, paintM, ax, 0.38, 0.15).scale.set(0.8, 0.65, 0.8); });   // (scrolled arms on spindles)
    var cushG = new THREE.BoxGeometry(1.14, 0.07, 0.3, 12, 2, 6), cp = cushG.attributes.position;   // (a plump cushion, rounded at its edges)
    for (i = 0; i < cp.count; i++) { var cx = cp.getX(i) / 0.57, cz = cp.getZ(i) / 0.15, cy = cp.getY(i); cp.setY(i, cy * (1 - 0.45 * Math.max(cx * cx, cz * cz) * Math.max(cx * cx, cz * cz)) + (cy > 0 ? 0.012 * (1 - cx * cx) * (1 - cz * cz) : 0)); }
    cushG.computeVertexNormals();
    var cushT = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#d8cdb4'; g.fillRect(0, 0, w, h); for (var k = 0; k < 400; k++) { g.fillStyle = 'rgba(' + (rnd() < 0.5 ? '150,140,120,' : '255,252,240,') + (rnd() * 0.3).toFixed(2) + ')'; g.fillRect(rnd() * w, rnd() * h, 1, 1); } }, [6, 2]);
    P(bench, cushG, new THREE.MeshStandardMaterial({ map: cushT, roughness: 0.95 }), 0, 0.445, 0);
    var strT = cpTex(64, 64, function (g, w, h) { for (var k = 0; k < 8; k++) { g.fillStyle = ['#2f5f6a', '#f2ebdc', '#c8704a', '#f2ebdc'][k % 4]; g.fillRect(k * w / 8, 0, w / 8, h); } });
    [[-0.35, 0.3], [0.38, -0.25]].forEach(function (pl, k) { var pg = new THREE.SphereGeometry(0.1, 20, 14), pp = pg.attributes.position; for (var q = 0; q < pp.count; q++) { var px = pp.getX(q), py = pp.getY(q); pp.setX(q, px * (1 + 0.45 * Math.abs(py) / 0.1)); pp.setY(q, py * (1 + 0.45 * Math.abs(px) / 0.1)); } pg.computeVertexNormals();   // (a pillow: square-ish with plump corners)
      var pm = P(bench, pg, new THREE.MeshStandardMaterial({ map: strT, roughness: 0.9 }), pl[0], 0.58, -0.12, -0.25, 0, pl[1] * 0.5); pm.scale.set(1, 1, 0.38); });
    var bkG = new THREE.BoxGeometry(0.22, 0.05, 0.34, 4, 2, 4), bp = bkG.attributes.position; for (i = 0; i < bp.count; i++) bp.setY(i, bp.getY(i) + 0.012 * Math.sin(bp.getX(i) * 20) * Math.sin(bp.getZ(i) * 12)); bkG.computeVertexNormals();
    var blT = cpTex(64, 64, function (g, w, h) { g.fillStyle = '#b8a88e'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(122,60,40,0.8)'; g.lineWidth = 3; for (var k = 4; k < w; k += 16) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, h); g.stroke(); g.beginPath(); g.moveTo(0, k); g.lineTo(w, k); g.stroke(); } }, [2, 2]);
    P(bench, bkG, new THREE.MeshStandardMaterial({ map: blT, roughness: 1 }), 0.63, 0.66, 0.02);   // (a folded plaid blanket over the arm)
    var tb = G(sg, -1.95, 0, FZ - 0.2, 0.5); P(tb, new THREE.BoxGeometry(0.32, 0.14, 0.18), rMat(0x3a6a4a, { roughness: 0.45 }), 0, 0.07, 0); P(tb, new THREE.BoxGeometry(0.33, 0.035, 0.19), rMat(0x2e5a3c, { roughness: 0.45 }), 0, 0.157, 0);   // (a tackle box at the bench's end)
    P(tb, new THREE.TorusGeometry(0.05, 0.008, 6, 14, Math.PI), rMat(0x222222), 0, 0.175, 0); [-0.08, 0.08].forEach(function (lx) { P(tb, new THREE.BoxGeometry(0.03, 0.03, 0.01), R.brassM, lx, 0.13, 0.096); });

    // ---- the barrel: staves, iron hoops with rivets, a tilted lid, fishing rods with cork grips, reels and line, two bug nets, a coil of rope ----
    var stT = cpTex(128, 64, function (g, w, h) { var n = 12; for (var k = 0; k < n; k++) { var c = new THREE.Color('#8a6440').offsetHSL(0, 0, (rnd() - 0.5) * 0.08); g.fillStyle = '#' + c.getHexString(); g.fillRect(k * w / n, 0, w / n, h); g.fillStyle = 'rgba(40,26,14,0.7)'; g.fillRect(k * w / n, 0, 1.2, h);
      for (var j = 0; j < 6; j++) { g.fillStyle = 'rgba(50,34,20,' + (rnd() * 0.3).toFixed(2) + ')'; g.fillRect(k * w / n + rnd() * w / n, 0, 1, h); } } });
    var barrel = G(sg, 1.55, 0, FZ - 0.35, 0.3); P(barrel, R.barrelGeo, new THREE.MeshStandardMaterial({ map: stT, roughness: 0.8, side: THREE.DoubleSide }), 0, 0, 0);
    [0.06, 0.2, 0.4, 0.54].forEach(function (hy) { var PR = [[0, 0.18], [0.15, 0.22], [0.3, 0.23], [0.45, 0.22], [0.6, 0.18]], k = Math.min(3, Math.floor(hy / 0.15)), rr = PR[k][1] + (PR[k + 1][1] - PR[k][1]) * (hy - PR[k][0]) / 0.15 + 0.003; P(barrel, new THREE.TorusGeometry(rr, 0.01, 6, 30), R.ironM, 0, hy, 0, Math.PI / 2, 0, 0);   // (hoops hugging the staves)
      for (var rv = 0; rv < 6; rv++) { var ra = rv / 6 * Math.PI * 2; Q(P(barrel, new THREE.SphereGeometry(0.007, 6, 4), R.ironM, Math.cos(ra) * (rr + 0.008), hy, Math.sin(ra) * (rr + 0.008))); } });
    var lid = P(barrel, new THREE.CylinderGeometry(0.19, 0.19, 0.025, 24), new THREE.MeshStandardMaterial({ map: stT, roughness: 0.8 }), 0.07, 0.62, -0.12, 0.35, 0, 0.1);   // (the lid, propped aside)
    [[0.05, 0.03, 0.12, -0.1, 0xe4dcf6], [-0.07, 0.05, -0.15, 0.08, 0xd8a868], [0.02, -0.08, 0.05, 0.16, 0x9a6e44]].forEach(function (r) { var rod = G(barrel, r[0], 0.3, r[1], 0); rod.rotation.set(r[2], 0, r[3]);
      P(rod, new THREE.CylinderGeometry(0.006, 0.014, 1.6, 8), rMat(r[4], { roughness: 0.35 }), 0, 0.9, 0); P(rod, new THREE.CylinderGeometry(0.019, 0.02, 0.22, 10), rMat(0xc8a070, { roughness: 0.9 }), 0, 0.12, 0);   // (blank and cork grip)
      P(rod, new THREE.CylinderGeometry(0.021, 0.021, 0.02, 10), R.brassM, 0, 0.24, 0); P(rod, new THREE.CylinderGeometry(0.036, 0.036, 0.03, 16), R.brassM, 0.03, 0.34, 0, 0, 0, Math.PI / 2); P(rod, new THREE.BoxGeometry(0.005, 0.045, 0.008), R.ironM, 0.05, 0.36, 0.02);   // (reel and handle)
      [0.55, 0.8, 1.05, 1.3, 1.6].forEach(function (gy) { Q(P(rod, new THREE.TorusGeometry(0.008, 0.0022, 4, 10), R.brassM, 0.012, gy, 0, 0, Math.PI / 2, 0)); });   // (line guides)
      Q(P(rod, new THREE.CylinderGeometry(0.0012, 0.0012, 1.35, 3), rMat(0xf4f4f0), 0.014, 1.02, 0)); });   // (the line)
    // (two real bug nets standing in it, made just like the one in your bag: a turned wooden handle, a leather grip, a brass
    // ferrule, a woven willow hoop and a deep, soft mesh bag with a cuff, one with a pink bow)
    [[0.07, 0.04, 0.1, -0.16, 1.5], [-0.06, -0.05, -0.12, 0.2, 3.9]].forEach(function (n) { if (typeof pickupModel !== 'function') return; var m = pickupModel('bugNet'), hd = m && m.getObjectByName('netHandle'); if (!hd) return;
      hd.parent.remove(hd); var h = G(barrel, n[0], 0.32, n[1], n[4]); h.rotation.x = n[2]; h.rotation.z = n[3]; hd.position.set(0, 0.2, 0); hd.rotation.set(0, 0, 0); hd.scale.setScalar(0.62); h.add(hd);
      hd.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); });
    var coil = G(sg, 1.05, 0, FZ - 0.25, 0); for (var cl = 0; cl < 5; cl++) Q(P(coil, new THREE.TorusGeometry(0.12 - cl * 0.012, 0.014, 6, 26), R.ropeM, 0, 0.014 + cl * 0.022, 0, Math.PI / 2, 0, cl * 0.4));   // (a coil of rope)


    // ---- the front of the shop, in detail: both windows, their flower boxes, the door, and a lantern either side of it ----
    // (the old plainer windows and door are put away; these are built in their place)
    sg.children.forEach(function (o) { if (!o.isGroup || o.rotation.y !== 0) return; var p = o.position;
      if ((Math.abs(Math.abs(p.x) - 1.3) < 0.01 && Math.abs(p.y - 0.95) < 0.01 && Math.abs(p.z - (BD + 0.05)) < 0.01) || (Math.abs(p.x) < 0.01 && Math.abs(p.y) < 0.01 && Math.abs(p.z - (BD - 0.04)) < 0.01)) o.visible = false; });
    var WZ = BD;   // (the face of the front wall)
    var trimM = paintM, sashM = new THREE.MeshStandardMaterial({ map: paintT, color: 0xf6f0e2, roughness: 0.55 }), sageDoorM = new THREE.MeshStandardMaterial({ map: paintT, color: 0x8aa488, roughness: 0.58 }), sageDkM = new THREE.MeshStandardMaterial({ map: paintT, color: 0x6f8a6e, roughness: 0.6 });
    var paneM = new THREE.MeshStandardMaterial({ color: 0xb8d8e8, transparent: true, opacity: 0.28, roughness: 0.04, metalness: 0.4, depthWrite: false });
    var reflT = cpTex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0.2, 'rgba(255,255,255,0)'); gr.addColorStop(0.42, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.1)'); gr.addColorStop(0.58, 'rgba(255,255,255,0.35)'); gr.addColorStop(0.7, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    var reflM = new THREE.MeshBasicMaterial({ map: reflT, transparent: true, opacity: 0.55, depthWrite: false });
    var roomT = cpTex(128, 144, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5a4a3a'); gr.addColorStop(1, '#2e2620'); g.fillStyle = gr; g.fillRect(0, 0, w, h);   // (a glimpse of the shop inside: a shelf of jars, a hanging net)
      g.fillStyle = '#6e5238'; g.fillRect(10, 58, w - 20, 5); ['#c8704a', '#3aa8a8', '#e8b84a', '#9a7ac8', '#e8806a'].forEach(function (c, k) { g.fillStyle = c; g.fillRect(18 + k * 20, 40, 12, 18); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(20 + k * 20, 42, 3, 12); });
      g.strokeStyle = 'rgba(220,210,190,0.5)'; g.lineWidth = 1; for (var k = 0; k < 8; k++) { g.beginPath(); g.moveTo(70 + k * 5, 78); g.lineTo(80 + k * 2, 120); g.stroke(); }
      [[0, 1], [w, -1]].forEach(function (c) { var x0 = c[0]; g.fillStyle = '#efe6d2'; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + c[1] * 34, 0); g.quadraticCurveTo(x0 + c[1] * 20, 70, x0 + c[1] * 8, 88); g.quadraticCurveTo(x0 + c[1] * 22, 110, x0 + c[1] * 30, h); g.lineTo(x0, h); g.closePath(); g.fill();   // (curtains tied back)
        g.strokeStyle = 'rgba(170,150,120,0.5)'; for (var f = 0; f < 4; f++) { g.beginPath(); g.moveTo(x0 + c[1] * (6 + f * 7), 0); g.quadraticCurveTo(x0 + c[1] * (4 + f * 3), 70, x0 + c[1] * 6, 88); g.stroke(); }
        g.fillStyle = '#c8704a'; g.fillRect(x0 + (c[1] > 0 ? 0 : -16), 84, 16, 6); }); });
    var roomM = new THREE.MeshStandardMaterial({ map: roomT, roughness: 1, emissive: 0xffd8a0, emissiveMap: roomT, emissiveIntensity: 0 });
    var hingeM = rMat(0x2a2624, { metalness: 0.5, roughness: 0.5 });
    function box(par, w, h, d, m, x, y, z) { return P(par, new THREE.BoxGeometry(w, h, d), m, x, y, z); }
    function sash(par, w, h, z, ry) {   // (one sash: stiles, rails, glazing bars, four panes)
      var s = G(par, 0, ry, z, 0), st = 0.04;
      box(s, st, h, 0.035, sashM, -w / 2 + st / 2, h / 2, 0); box(s, st, h, 0.035, sashM, w / 2 - st / 2, h / 2, 0); box(s, w, st, 0.035, sashM, 0, st / 2, 0); box(s, w, st * 0.8, 0.035, sashM, 0, h - st * 0.4, 0);
      Q(box(s, 0.014, h - st * 1.8, 0.022, sashM, 0, h / 2, 0)); Q(box(s, w - st * 2, 0.014, 0.022, sashM, 0, h / 2, 0));   // (glazing bars)
      Q(P(s, new THREE.PlaneGeometry(w - st * 2, h - st * 1.8), paneM, 0, h / 2, -0.004)); Q(P(s, new THREE.PlaneGeometry(w - st * 2, h - st * 1.8), reflM, 0, h / 2, -0.002)).renderOrder = 2; return s; }
    function shutter(par, x, y, w, h) {   // (a louvred shutter: stiles, three rails, angled louvres, strap hinges)
      var s = G(par, x, y, WZ + 0.025, 0); box(s, 0.03, h, 0.025, sageDoorM, -w / 2 + 0.015, h / 2, 0); box(s, 0.03, h, 0.025, sageDoorM, w / 2 - 0.015, h / 2, 0);
      [0.02, h / 2, h - 0.02].forEach(function (ry) { box(s, w, 0.04, 0.025, sageDoorM, 0, ry, 0); });
      for (var k = 0; k < 2; k++) for (var l = 0; l < 8; l++) { var yy = (k ? h / 2 + 0.035 : 0.05) + l * (h / 2 - 0.08) / 8 + 0.012; Q(P(s, new THREE.BoxGeometry(w - 0.06, 0.03, 0.008), sageDkM, 0, yy, 0, -0.6, 0, 0)); }
      [0.1, h - 0.1].forEach(function (hy) { Q(box(s, 0.07, 0.012, 0.006, hingeM, (x < 0 ? 1 : -1) * (w / 2 - 0.035), hy, 0.016)); }); return s; }   // (strap hinges on the side by the window)
    function flowerBox(par, x, y, w) {   // (a planked box on scrolled brackets, full of geraniums, petunias, daisies and alyssum, ivy trailing over)
      var b = G(par, x, y, WZ + 0.12, 0), bh = 0.16, bd = 0.2;
      for (var k = 0; k < 3; k++) box(b, w, bh / 3 - 0.004, 0.02, sageDoorM, 0, -bh + (k + 0.5) * bh / 3, bd / 2);   // (front planks)
      box(b, w + 0.03, 0.02, bd + 0.03, sashM, 0, 0.005, 0.005); box(b, w + 0.02, 0.02, bd + 0.02, sashM, 0, -bh - 0.005, 0.005);   // (cap and base trim)
      [-1, 1].forEach(function (sd) { box(b, 0.02, bh, bd, sageDoorM, sd * w / 2, -bh / 2, 0); var br = new THREE.Shape(); br.moveTo(0, 0); br.lineTo(0, -0.14); br.quadraticCurveTo(0.03, -0.14, 0.04, -0.1); br.bezierCurveTo(0.05, -0.05, 0.12, -0.04, 0.15, 0); br.lineTo(0, 0);
        var bg = new THREE.ExtrudeGeometry(br, { depth: 0.022, bevelEnabled: false }); bg.translate(0, 0, -0.011); P(b, bg, sashM, sd * (w / 2 - 0.08), -bh - 0.012, -bd / 2 + 0.005, 0, -Math.PI / 2, 0); });   // (brackets)
      box(b, w - 0.02, 0.01, bd - 0.02, rMat(0x3a2a1e, { roughness: 1 }), 0, -0.012, 0);   // (soil)
      var leafG2 = new THREE.SphereGeometry(0.03, 8, 6), leafCols = [0x3f7a3a, 0x4e8a42, 0x5e9a4a], petal = new THREE.SphereGeometry(0.012, 6, 4);
      for (k = 0; k < Math.round(w / 0.045); k++) { var lx = -w / 2 + 0.03 + k * 0.045; Q(P(b, leafG2, rMat(leafCols[k % 3], { roughness: 0.75 }), lx, 0.02, (rnd() - 0.5) * 0.12)).scale.set(1.2, 0.6, 1); }   // (a bed of leaves)
      for (k = 0; k < 4; k++) { var gx = -w / 2 + 0.1 + k * (w - 0.2) / 3, gz = (rnd() - 0.5) * 0.06, gm = rMat([0xd83a3a, 0xe85a8a, 0xd83a3a, 0xf06a50][k], { roughness: 0.6 });   // (geraniums: a ball of little florets on a stalk)
        Q(P(b, new THREE.CylinderGeometry(0.004, 0.004, 0.1, 4), rMat(0x4e8a42), gx, 0.07, gz)); for (var f = 0; f < 14; f++) { var fa = rnd() * 6.3, fb = rnd() * 3.1; Q(P(b, petal, gm, gx + Math.cos(fa) * Math.sin(fb) * 0.04, 0.13 + Math.cos(fb) * 0.03, gz + Math.sin(fa) * Math.sin(fb) * 0.04)); }
        for (f = 0; f < 3; f++) Q(P(b, new THREE.CircleGeometry(0.035, 10), rMat(0x4a8a3e, { roughness: 0.7, side: THREE.DoubleSide }), gx + (f - 1) * 0.04, 0.05, gz + 0.03, -1.1, 0, 0)); }   // (round geranium leaves)
      for (k = 0; k < 5; k++) { var px = -w / 2 + 0.05 + k * (w - 0.1) / 4 + 0.04, pc = rMat([0x8a4ac8, 0xc85ab8, 0x8a4ac8, 0xf0f0f0, 0xc85ab8][k], { roughness: 0.6, side: THREE.DoubleSide });   // (petunias: open trumpets)
        Q(P(b, new THREE.ConeGeometry(0.03, 0.035, 10, 1, true), pc, px, 0.055, 0.06 + (k % 2) * 0.02, Math.PI + 0.5, 0, (rnd() - 0.5) * 0.6)); Q(P(b, new THREE.SphereGeometry(0.005, 5, 4), rMat(0xf0e070), px, 0.05, 0.075)); }
      for (k = 0; k < 6; k++) { var dx = -w / 2 + 0.08 + k * (w - 0.16) / 5, dz = -0.05 + (k % 2) * 0.03; for (var pt = 0; pt < 10; pt++) { var pa = pt / 10 * Math.PI * 2; Q(P(b, new THREE.BoxGeometry(0.022, 0.003, 0.007), rMat(0xfafaf4), dx + Math.cos(pa) * 0.012, 0.1, dz + Math.sin(pa) * 0.012, 0, -pa, 0)); } Q(P(b, new THREE.SphereGeometry(0.008, 8, 5), rMat(0xf0c030), dx, 0.102, dz)).scale.y = 0.5; Q(P(b, new THREE.CylinderGeometry(0.002, 0.002, 0.08, 3), rMat(0x4e8a42), dx, 0.06, dz)); }   // (daisies)
      for (k = 0; k < 7; k++) Q(P(b, new THREE.SphereGeometry(0.022, 8, 6), rMat(0xfcfaf4, { roughness: 0.9 }), -w / 2 + 0.06 + k * (w - 0.12) / 6, 0.012, bd / 2 - 0.02)).scale.set(1.3, 0.6, 1);   // (white alyssum tumbling at the front)
      for (k = 0; k < 4; k++) { var ix = -w / 2 + 0.08 + k * (w - 0.16) / 3, pts = []; for (var q = 0; q <= 8; q++) pts.push(new THREE.Vector3(ix + Math.sin(q * 0.8 + k) * 0.02, 0.0 - q * 0.03 - q * q * 0.002, bd / 2 + 0.02 + Math.sin(q * 0.5) * 0.012));   // (ivy trailing over the front)
        var cv = new THREE.CatmullRomCurve3(pts); Q(P(b, new THREE.TubeGeometry(cv, 12, 0.0025, 4), rMat(0x3a5a2a), 0, 0, 0)); for (q = 1; q < 9; q++) { var pp2 = cv.getPoint(q / 9); var lf = Q(P(b, new THREE.CircleGeometry(0.016, 5), rMat(q % 2 ? 0x3f7a3a : 0x5e9a4a, { side: THREE.DoubleSide, roughness: 0.6 }), pp2.x + (q % 2 ? 0.012 : -0.012), pp2.y, pp2.z + 0.006, -0.2, q % 2 ? 0.5 : -0.5, q * 0.7)); } }
      return b; }
    [-1.3, 1.3].forEach(function (wx) { var W = 0.72, H = 0.8, Y = 0.95, w = G(sg, wx, 0, 0, 0);
      Q(P(w, new THREE.PlaneGeometry(W, H), roomM, 0, Y + H / 2, WZ - 0.095));   // (the shop inside, glimpsed)
      box(w, W, 0.02, 0.1, sashM, 0, Y + 0.01, WZ - 0.05); box(w, 0.02, H, 0.1, sashM, -W / 2 + 0.01, Y + H / 2, WZ - 0.05); box(w, 0.02, H, 0.1, sashM, W / 2 - 0.01, Y + H / 2, WZ - 0.05); box(w, W, 0.02, 0.1, sashM, 0, Y + H - 0.01, WZ - 0.05);   // (the jambs)
      sash(w, W - 0.04, H / 2 + 0.01, WZ - 0.055, Y + H / 2 - 0.005); sash(w, W - 0.04, H / 2 + 0.01, WZ - 0.025, Y + 0.01);   // (top sash set back, bottom sash forward)
      box(w, 0.05, 0.012, 0.016, R.brassM, 0, Y + H / 2 + 0.008, WZ - 0.003); [-0.18, 0.18].forEach(function (lx) { Q(P(w, new THREE.TorusGeometry(0.012, 0.003, 4, 10, Math.PI), R.brassM, lx, Y + 0.035, WZ - 0.003)); });   // (sash lock and lifts)
      [-1, 1].forEach(function (sd) { box(w, 0.075, H + 0.08, 0.03, trimM, sd * (W / 2 + 0.0375), Y + H / 2, WZ + 0.015); for (var fl = -1; fl <= 1; fl++) Q(box(w, 0.006, H - 0.04, 0.004, rMat(0xd8ccb4), sd * (W / 2 + 0.0375) + fl * 0.018, Y + H / 2, WZ + 0.031)); });   // (fluted side casings)
      box(w, W + 0.2, 0.1, 0.035, trimM, 0, Y + H + 0.06, WZ + 0.017); box(w, W + 0.26, 0.025, 0.07, trimM, 0, Y + H + 0.122, WZ + 0.035); box(w, W + 0.22, 0.02, 0.05, trimM, 0, Y + H + 0.145, WZ + 0.025);   // (head casing, drip cap and crown)
      var sill = box(w, W + 0.22, 0.035, 0.13, trimM, 0, Y - 0.02, WZ + 0.06); sill.rotation.x = 0.08; box(w, W + 0.12, 0.05, 0.025, trimM, 0, Y - 0.065, WZ + 0.012);   // (sloped sill, apron under it)
      [-1, 1].forEach(function (sd) { shutter(w, sd * (W / 2 + 0.075 + 0.105), Y - 0.02, 0.21, H + 0.04);
        var dog = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.012, 0.02, 0.01), new THREE.Vector3(0, 0.04, 0.02), new THREE.Vector3(-0.012, 0.06, 0.01), new THREE.Vector3(0, 0.08, 0)]), 12, 0.004, 4); Q(P(w, dog, hingeM, sd * (W / 2 + 0.075 + 0.23), Y + 0.12, WZ + 0.005)); });   // (shutter dogs holding them open)
      flowerBox(w, 0, Y - 0.105, W + 0.1); });
    // (the door: sage green, stiles and rails with four raised panels below, a brass porthole above, a brass knob on a
    // rosette, a keyhole, a letter slot and a kick plate, three black hinges; a threshold; a casing of fluted pilasters on
    // plinth blocks under a frieze and cornice, with a carved fish leaping over it)
    var dr = G(sg, 0, 0, WZ - 0.05, 0), DW = 0.9, DH = 1.96;
    box(dr, DW, DH, 0.045, sageDoorM, 0, DH / 2 + 0.02, 0);
    [-1, 1].forEach(function (sd) { box(dr, 0.12, DH, 0.012, sageDoorM, sd * (DW / 2 - 0.06), DH / 2 + 0.02, 0.028); });   // (stiles)
    [0.08, 0.74, 1.12, 1.9].forEach(function (ry, k) { box(dr, DW - 0.24, [0.14, 0.1, 0.1, 0.12][k], 0.012, sageDoorM, 0, ry + 0.02, 0.028); });   // (rails)
    [[-0.17, 0.42], [0.17, 0.42], [-0.17, 0.93], [0.17, 0.93]].forEach(function (pn, k) { var ph = k < 2 ? 0.5 : 0.25; box(dr, 0.26, ph, 0.012, sageDkM, pn[0], pn[1] - (k < 2 ? 0 : 0) + 0.02, 0.022); var rp = P(dr, new THREE.BoxGeometry(0.2, ph - 0.06, 0.02), sageDoorM, pn[0], pn[1] + 0.02, 0.03); });   // (raised panels in their bevelled fields)
    P(dr, new THREE.CircleGeometry(0.16, 28), roomM, 0, 1.5, 0.026); Q(P(dr, new THREE.CircleGeometry(0.16, 28), paneM, 0, 1.5, 0.03)); Q(P(dr, new THREE.CircleGeometry(0.16, 28), reflM, 0, 1.5, 0.031)).renderOrder = 2;
    P(dr, new THREE.TorusGeometry(0.175, 0.03, 12, 40), R.brassM, 0, 1.5, 0.036); P(dr, new THREE.TorusGeometry(0.2, 0.01, 8, 40), R.brassM, 0, 1.5, 0.03);
    for (var bo2 = 0; bo2 < 10; bo2++) { var ba2 = bo2 / 10 * Math.PI * 2; Q(P(dr, new THREE.SphereGeometry(0.011, 8, 6), R.brassM, Math.cos(ba2) * 0.2, 1.5 + Math.sin(ba2) * 0.2, 0.04)); }   // (porthole ring and bolts)
    P(dr, new THREE.CylinderGeometry(0.035, 0.035, 0.008, 16), R.brassM, 0.34, 1.02, 0.03, Math.PI / 2, 0, 0); P(dr, new THREE.CylinderGeometry(0.008, 0.01, 0.04, 8), R.brassM, 0.34, 1.02, 0.05, Math.PI / 2, 0, 0); P(dr, new THREE.SphereGeometry(0.03, 16, 12), R.brassM, 0.34, 1.02, 0.08);   // (rosette and knob)
    P(dr, new THREE.BoxGeometry(0.035, 0.07, 0.006), R.brassM, 0.34, 0.93, 0.033); Q(P(dr, new THREE.CircleGeometry(0.006, 8), hingeM, 0.34, 0.94, 0.037)); Q(box(dr, 0.004, 0.014, 0.002, hingeM, 0.34, 0.928, 0.037));   // (keyhole escutcheon)
    box(dr, 0.26, 0.05, 0.008, R.brassM, 0, 0.76, 0.036); Q(box(dr, 0.22, 0.012, 0.002, hingeM, 0, 0.76, 0.041));   // (letter slot)
    box(dr, DW - 0.04, 0.16, 0.006, R.brassM, 0, 0.1, 0.026);   // (kick plate)
    [0.25, 1.0, 1.75].forEach(function (hy) { box(dr, 0.05, 0.1, 0.008, hingeM, -DW / 2 + 0.01, hy, 0.024); Q(P(dr, new THREE.CylinderGeometry(0.008, 0.008, 0.1, 8), hingeM, -DW / 2 - 0.005, hy, 0.024)); });   // (hinges)
    box(sg, 1.04, 0.03, 0.14, rMat(0x8a6a48, { roughness: 0.7 }), 0, 0.015, WZ + 0.03);   // (threshold)
    [-1, 1].forEach(function (sd) { var cx = sd * 0.51; box(sg, 0.075, 0.12, 0.05, trimM, cx, 0.06, WZ + 0.025); box(sg, 0.065, 1.92, 0.035, trimM, cx, 0.12 + 0.96, WZ + 0.018);   // (plinth and pilaster)
      for (var fl = -1; fl <= 1; fl++) Q(box(sg, 0.007, 1.8, 0.004, rMat(0xd8ccb4), cx + fl * 0.016, 1.08, WZ + 0.037)); box(sg, 0.08, 0.04, 0.045, trimM, cx, 2.06, WZ + 0.022); });   // (flutes and capital)
    box(sg, 1.12, 0.11, 0.035, trimM, 0, 2.135, WZ + 0.017); box(sg, 1.2, 0.025, 0.065, trimM, 0, 2.2, WZ + 0.032); box(sg, 1.16, 0.02, 0.05, trimM, 0, 2.222, WZ + 0.025);   // (frieze and cornice)
    var fsh = new THREE.Shape(); fsh.moveTo(-0.18, 0); fsh.quadraticCurveTo(-0.02, 0.1, 0.13, 0.01); fsh.lineTo(0.22, 0.07); fsh.quadraticCurveTo(0.2, 0, 0.22, -0.07); fsh.lineTo(0.13, -0.01); fsh.quadraticCurveTo(-0.02, -0.1, -0.18, 0);
    var fishM = rMat(0x5e6e5c, { roughness: 0.5 }); P(sg, new THREE.ExtrudeGeometry(fsh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3 }), fishM, 0, 2.33, WZ + 0.035, 0, 0, 0.12);   // (the carved fish over the door)
    Q(P(sg, new THREE.SphereGeometry(0.01, 8, 6), R.brassM, -0.12, 2.335, WZ + 0.065)); for (var sc2 = 0; sc2 < 4; sc2++) Q(P(sg, new THREE.TorusGeometry(0.02, 0.003, 4, 8, Math.PI), rMat(0x4e5e4c), -0.06 + sc2 * 0.04, 2.33 + sc2 * 0.005, WZ + 0.065, 0, 0, -Math.PI / 2));   // (eye and scales)
    // (a lantern either side of the door, each the mirror of the other: a shaped iron backplate, an arm curling out with a
    // scroll beneath it, a short chain; a brass lantern with a vented, crowned cap and a finial, bevelled glass in a frame,
    // a candle with wax drips on a drip-cup, and a pointed finial below; lit after dark, the candle flickering)
    var lanGlowM = new THREE.MeshStandardMaterial({ color: 0xfff0c8, emissive: 0xffb050, emissiveIntensity: 0.3, transparent: true, opacity: 0.35, roughness: 0.05 }), flameM = new THREE.MeshBasicMaterial({ color: 0xffd070 }), flames = [], lanLights = [];
    var waxM = rMat(0xf6f0e0, { roughness: 0.6 });
    [-1, 1].forEach(function (sd) { var lan = G(sg, sd * 0.62, 1.58, WZ, 0);
      var bp = new THREE.Shape(); bp.moveTo(-0.035, -0.09); bp.lineTo(0.035, -0.09); bp.quadraticCurveTo(0.045, 0, 0.035, 0.09); bp.quadraticCurveTo(0, 0.13, -0.035, 0.09); bp.quadraticCurveTo(-0.045, 0, -0.035, -0.09);
      P(lan, new THREE.ExtrudeGeometry(bp, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1 }), R.ironM, 0, 0.18, 0); [0.12, 0.25].forEach(function (y) { Q(P(lan, new THREE.SphereGeometry(0.007, 6, 5), R.brassM, 0, y, 0.016)); });   // (backplate and screws)
      P(lan, new THREE.TubeGeometry(new THREE.CubicBezierCurve3(new THREE.Vector3(0, 0.22, 0.012), new THREE.Vector3(0, 0.27, 0.1), new THREE.Vector3(0, 0.28, 0.18), new THREE.Vector3(0, 0.25, 0.22)), 18, 0.008, 6), R.ironM, 0, 0, 0);   // (the arm)
      var curl = []; for (var k = 0; k <= 20; k++) { var t = k / 20, a = t * Math.PI * 2.2, r = 0.045 * (1 - t * 0.75); curl.push(new THREE.Vector3(0, 0.17 + Math.sin(a) * r, 0.06 + Math.cos(a) * r * 0.9 + t * 0.04)); } P(lan, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(curl), 30, 0.005, 5), R.ironM, 0, 0, 0);   // (a scroll curling under it)
      for (k = 0; k < 2; k++) Q(P(lan, new THREE.TorusGeometry(0.012, 0.003, 4, 10), R.ironM, 0, 0.235 - k * 0.02, 0.22, 0, k * Math.PI / 2, 0)).scale.y = 1.5;   // (the chain)
      var lb = G(lan, 0, 0.06, 0.22, sd * 0.0);
      P(lb, new THREE.TorusGeometry(0.012, 0.003, 5, 10), R.brassM, 0, 0.21, 0); P(lb, new THREE.SphereGeometry(0.012, 10, 8), R.brassM, 0, 0.19, 0);   // (ring and finial)
      P(lb, new THREE.CylinderGeometry(0.03, 0.04, 0.025, 4), R.brassM, 0, 0.168, 0, 0, Math.PI / 4, 0); P(lb, new THREE.ConeGeometry(0.092, 0.06, 4), R.brassM, 0, 0.13, 0, 0, Math.PI / 4, 0);   // (crown and cap)
      for (k = 0; k < 4; k++) { var va = k / 4 * Math.PI * 2; Q(box(lb, 0.03, 0.008, 0.004, hingeM, Math.sin(va) * 0.052, 0.115, Math.cos(va) * 0.052)).rotation.y = va; }   // (vents)
      box(lb, 0.135, 0.016, 0.135, R.brassM, 0, 0.098, 0); box(lb, 0.125, 0.018, 0.125, R.brassM, 0, -0.098, 0);
      [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { box(lb, 0.012, 0.19, 0.012, R.brassM, sx * 0.058, 0, sz * 0.058); }); });   // (corner posts)
      for (k = 0; k < 4; k++) { var ga = k / 4 * Math.PI * 2, gp = G(lb, Math.sin(ga) * 0.056, 0, Math.cos(ga) * 0.056, ga); Q(box(gp, 0.1, 0.18, 0.004, lanGlowM, 0, 0, 0)); Q(box(gp, 0.1, 0.006, 0.006, R.brassM, 0, 0, 0.002)); }   // (glass panes, a bar across each)
      P(lb, new THREE.CylinderGeometry(0.03, 0.022, 0.012, 14), R.brassM, 0, -0.082, 0); P(lb, new THREE.CylinderGeometry(0.014, 0.015, 0.07, 12), waxM, 0, -0.04, 0);   // (drip cup and candle)
      for (k = 0; k < 4; k++) Q(P(lb, new THREE.SphereGeometry(0.004, 6, 4), waxM, Math.cos(k * 1.7) * 0.014, -0.01 - k * 0.012, Math.sin(k * 1.7) * 0.014)).scale.y = 2.2;   // (drips)
      Q(P(lb, new THREE.CylinderGeometry(0.0015, 0.0015, 0.01, 4), hingeM, 0, 0.0, 0)); var fl = Q(P(lb, new THREE.SphereGeometry(0.009, 10, 8), flameM, 0, 0.018, 0)); fl.scale.set(1, 2.2, 1); flames.push(fl);
      P(lb, new THREE.ConeGeometry(0.05, 0.04, 4), R.brassM, 0, -0.127, 0, Math.PI, Math.PI / 4, 0); P(lb, new THREE.SphereGeometry(0.01, 8, 6), R.brassM, 0, -0.152, 0);   // (base and drop finial)
      var pl = new THREE.PointLight(0xffc070, 0, 3.2, 2); pl.position.set(0, 0.02, 0); lb.add(pl); lanLights.push(pl); });
    // ---- the potted agaves: terracotta pots with a rolled rim on saucers, dark soil, curving pointed leaves ----
    var potG = new THREE.LatheGeometry([[0, 0.01], [0.11, 0.01], [0.15, 0.24], [0.17, 0.25], [0.175, 0.29], [0.155, 0.3], [0.15, 0.27], [0, 0.27]].map(function (v) { return new THREE.Vector2(v[0], v[1]); }), 28), potM = new THREE.MeshStandardMaterial({ color: 0xc06a44, roughness: 0.85 });
    // (the agaves: each leaf a thick, folded blade, broad at its base and tapering to a sharp dark tip, arching out and down,
    // blue-green deepening at the base, a pale cream edge and a faint bloom; a rosette of them in three rings, the inner ones
    // standing upright and still curled, the outer ones spreading wide over the rim; small pebbles over the soil)
    function agaveLeaf(len, wid, arch) { var nl = 10, pos = [], col = [], idx = [], c = new THREE.Color(), cB = new THREE.Color(0x3e7a5e), cM = new THREE.Color(0x6fa08a), cT = new THREE.Color(0x8ab09a), cE = new THREE.Color(0xe8e0b0), cTip = new THREE.Color(0x3a2a1a);
      for (var k = 0; k <= nl; k++) { var t = k / nl, w = wid * Math.pow(1 - t, 0.8) * (0.6 + 0.4 * Math.sin(Math.min(1, t * 3) * Math.PI / 2)), y = len * t * (1 - arch * 0.35 * t), z = arch * len * t * t * 0.55, fold = w * 0.35;
        [[-w, fold * 0.2, 1], [0, 0, 0], [w, fold * 0.2, 1], [0, -fold * 0.6, 0]].forEach(function (q, e) { pos.push(q[0], y + (e === 3 ? 0 : 0), z + q[1] - (e === 3 ? 0.006 : 0));
          c.copy(cB).lerp(cM, Math.min(1, t * 2)).lerp(cT, Math.max(0, t * 2 - 1)); if (q[2]) c.lerp(cE, 0.45 * (1 - t)); if (t > 0.9) c.lerp(cTip, (t - 0.9) * 8); col.push(c.r, c.g, c.b); }); }
      for (k = 0; k < nl; k++) { var a = k * 4; idx.push(a, a + 4, a + 1, a + 1, a + 4, a + 5, a + 1, a + 5, a + 2, a + 2, a + 5, a + 6, a, a + 3, a + 4, a + 3, a + 7, a + 4, a + 2, a + 6, a + 3, a + 3, a + 6, a + 7); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; }
    var leafMat = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.5 }), pebM2 = [0xd8d0c4, 0xa49c90, 0x7a746e, 0xe8e2d6].map(function (c) { return rMat(c, { roughness: 0.6 }); });
    [[-0.95, FZ - 0.22], [0.95, FZ - 0.22]].forEach(function (pp) { var pot = G(sg, pp[0], 0, pp[1], rnd() * 6);
      P(pot, new THREE.CylinderGeometry(0.17, 0.15, 0.025, 24), potM, 0, 0.012, 0); P(pot, potG, potM, 0, 0.0, 0); P(pot, new THREE.CircleGeometry(0.148, 20), rMat(0x3a2a1e, { roughness: 1 }), 0, 0.268, 0, -Math.PI / 2, 0, 0);
      for (var pb = 0; pb < 22; pb++) { var pa = rnd() * 6.3, pr = 0.04 + rnd() * 0.1; Q(P(pot, new THREE.SphereGeometry(0.012 + rnd() * 0.008, 8, 6), pebM2[pb % 4], Math.cos(pa) * pr, 0.272, Math.sin(pa) * pr)).scale.y = 0.6; }   // (pebbles over the soil)
      [[5, 0.18, 0.045, 0.2, 0.35], [8, 0.3, 0.06, 0.6, 0.85], [11, 0.36, 0.07, 1.0, 1.35]].forEach(function (ring, ri) { for (var lf = 0; lf < ring[0]; lf++) { var la = lf / ring[0] * Math.PI * 2 + ri * 0.5 + rnd() * 0.2, l = ring[1] * (0.85 + rnd() * 0.3);
        var lv = G(pot, 0, 0.275, 0, la); var m = P(lv, agaveLeaf(l, ring[2], ring[3]), leafMat, 0, 0, 0.01 + ri * 0.015, ring[4] * 0.75, 0, (rnd() - 0.5) * 0.15); m.castShadow = true; } }); });
    // ---- the doormat, in detail: a thick coir mat, its bristles packed in rows, a woven dark-brown border and a rope edging
    // round it, a leaping fish and two little waves worked into the middle, and its corners rounded and a little scuffed ----
    sg.children.forEach(function (o) { var gp = o.geometry && o.geometry.parameters; if (o.isMesh && gp && gp.width === 0.9 && gp.depth === 0.5 && gp.height === 0.015) o.visible = false; });   // (the old flat mat)
    var coirT = cpTex(512, 288, function (g, w, h) { var k; g.fillStyle = '#b48a54'; g.fillRect(0, 0, w, h);
      for (k = 0; k < 9000; k++) { var x = rnd() * w, y = rnd() * h, c = 120 + rnd() * 80 | 0; g.strokeStyle = 'rgba(' + c + ',' + (c * 0.72 | 0) + ',' + (c * 0.42 | 0) + ',' + (0.35 + rnd() * 0.5).toFixed(2) + ')'; g.lineWidth = 0.8 + rnd(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 3, y + (rnd() - 0.5) * 3); g.stroke(); }   // (bristles)
      for (k = 0; k < h; k += 6) { g.fillStyle = 'rgba(60,40,20,0.12)'; g.fillRect(0, k, w, 1.5); }   // (the rows they're set in)
      g.lineWidth = 26; g.strokeStyle = '#4e3420'; g.strokeRect(22, 22, w - 44, h - 44); g.lineWidth = 3; g.strokeStyle = '#c8a060'; g.strokeRect(40, 40, w - 80, h - 80);   // (a dark woven border with a pale line)
      for (k = 0; k < 60; k++) { g.fillStyle = 'rgba(30,20,10,0.35)'; g.fillRect(22 + rnd() * (w - 44), rnd() < 0.5 ? 12 + rnd() * 18 : h - 30 + rnd() * 18, 2, 6); }
      g.save(); g.translate(w / 2, h / 2 - 6); g.rotate(-0.2); g.fillStyle = '#3c5a5a'; g.beginPath(); g.ellipse(0, 0, 70, 28, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(58, 0); g.lineTo(104, -32); g.lineTo(96, 0); g.lineTo(104, 32); g.closePath(); g.fill();   // (a leaping fish)
      g.fillStyle = '#b48a54'; g.beginPath(); g.arc(-42, -6, 6, 0, 7); g.fill(); g.strokeStyle = '#b48a54'; g.lineWidth = 3; g.beginPath(); g.arc(-26, 0, 22, -1.1, 1.1); g.stroke(); for (k = 0; k < 4; k++) { g.beginPath(); g.arc(4 + k * 14, 0, 12, -1, 1); g.stroke(); } g.restore();
      g.strokeStyle = '#3c5a5a'; g.lineWidth = 6; [0, 1].forEach(function (r2) { g.beginPath(); for (var x2 = 140; x2 <= w - 140; x2 += 4) { var y2 = h - 72 + r2 * 16 + Math.sin(x2 * 0.06 + r2) * 6; if (x2 === 140) g.moveTo(x2, y2); else g.lineTo(x2, y2); } g.stroke(); });   // (waves)
      var gr = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.4); gr.addColorStop(0, 'rgba(40,26,12,0.18)'); gr.addColorStop(1, 'rgba(40,26,12,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });   // (worn darker where feet wipe)
    var ms = new THREE.Shape(), MW = 0.92, MD = 0.52, cr = 0.05; ms.moveTo(-MW / 2 + cr, -MD / 2); ms.lineTo(MW / 2 - cr, -MD / 2); ms.quadraticCurveTo(MW / 2, -MD / 2, MW / 2, -MD / 2 + cr); ms.lineTo(MW / 2, MD / 2 - cr); ms.quadraticCurveTo(MW / 2, MD / 2, MW / 2 - cr, MD / 2); ms.lineTo(-MW / 2 + cr, MD / 2); ms.quadraticCurveTo(-MW / 2, MD / 2, -MW / 2, MD / 2 - cr); ms.lineTo(-MW / 2, -MD / 2 + cr); ms.quadraticCurveTo(-MW / 2, -MD / 2, -MW / 2 + cr, -MD / 2);
    var mg = new THREE.ExtrudeGeometry(ms, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.006, bevelSegments: 2 }), muv = mg.attributes.uv; for (i = 0; i < muv.count; i++) muv.setXY(i, muv.getX(i) / MW + 0.5, muv.getY(i) / MD + 0.5);
    mg.rotateX(-Math.PI / 2); var coirM = new THREE.MeshStandardMaterial({ map: coirT, bumpMap: coirT, bumpScale: 0.004, roughness: 1 }); var matM = P(sg, mg, coirM, 0, 0.004, BD + 0.42, 0, 0.03, 0); matM.castShadow = false;
    var ep = ms.getSpacedPoints(70).map(function (p2) { return new THREE.Vector3(p2.x, 0.027, -p2.y); }); ep.pop(); Q(P(sg, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ep, true), 140, 0.009, 6, true), R.ropeM, 0, 0.004, BD + 0.42, 0, 0.03, 0));   // (the rope edging)
    // (walking round them: the bench's new place against the wall; nothing where the crab pot and buoys were)
    var sx0 = sg.position.x, sz0 = sg.position.z;
    [[-1.45, PZ - 0.42], [-1.0, PZ - 0.42], [-1.9, PZ - 0.42], [2.0, PZ - 0.5], [-2.0, BD + 0.4]].forEach(function (o) { for (var k = solids.length - 1; k >= 0; k--) if (Math.abs(solids[k].x - sx0 - o[0]) < 0.02 && Math.abs(solids[k].z - sz0 - o[1]) < 0.02) solids.splice(k, 1); });
    solids.push({ x: sx0 - 1.45, z: sz0 + BD + 0.49, r: 0.3 }, { x: sx0 - 0.95, z: sz0 + BD + 0.49, r: 0.25 }, { x: sx0 - 1.95, z: sz0 + BD + 0.49, r: 0.25 }, { x: sx0 - 1.95, z: sz0 + FZ - 0.2, r: 0.18 });
    // ---- at night the lantern is lit, its candle flickering ----
    updateCarpenter = (function (base) { return function (t, night) { base.apply(this, arguments); var nt = night || 0, fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3);
      lanGlowM.emissiveIntensity = 0.2 + nt * 1.4 * fl; flames.forEach(function (f, k) { f.visible = nt > 0.15; f.scale.y = 2.2 * (0.85 + 0.15 * Math.sin(t * 11 + k * 2)); }); lanLights.forEach(function (l) { l.intensity = nt * 0.55 * fl; }); roomM.emissiveIntensity = nt * 0.35; }; })(updateCarpenter);
  })();
});
