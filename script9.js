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
    // (the flower kit, made once and shared by both boxes: every bloom and leaf as a shape of its own)
    var FL = null;
    function makeFlowerKit() { var K = {}, i;
      function tex(w, h, f) { var t = cpTex(w, h, f); return t; }
      K.stemM = rMat(0x4a7a38, { roughness: 0.7 });
      var leafT = tex(64, 128, function (g, w, h) { g.clearRect(0, 0, w, h); var gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#2f5e2a'); gr.addColorStop(0.5, '#4f8a40'); gr.addColorStop(1, '#2f5e2a'); g.fillStyle = gr;
        g.beginPath(); g.moveTo(w / 2, h); g.quadraticCurveTo(-4, h * 0.45, w / 2, 2); g.quadraticCurveTo(w + 4, h * 0.45, w / 2, h); g.fill(); g.strokeStyle = 'rgba(200,230,170,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 6); g.stroke();
        g.lineWidth = 0.8; for (var k = 1; k < 7; k++) { var y = h - k * h / 8; g.beginPath(); g.moveTo(w / 2, y); g.lineTo(w * 0.18, y - 14); g.moveTo(w / 2, y); g.lineTo(w * 0.82, y - 14); g.stroke(); } });
      K.leafM = new THREE.MeshStandardMaterial({ map: leafT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 }); K.leafG = new THREE.PlaneGeometry(0.03, 0.06); K.leafG.translate(0, 0.03, 0);
      K.gerCols = ['#d8283a', '#f0507a', '#d8283a', '#ff6a4a'].map(function (c) { var t = tex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); for (var k = 0; k < 5; k++) { var a = k / 5 * Math.PI * 2 - Math.PI / 2, cx = w / 2 + Math.cos(a) * w * 0.22, cy = h / 2 + Math.sin(a) * h * 0.22;   // (a floret: five round, overlapping petals)
          var gr = g.createRadialGradient(cx, cy, 1, cx, cy, w * 0.24); gr.addColorStop(0, c); gr.addColorStop(1, new THREE.Color(c).multiplyScalar(0.75).getStyle()); g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, w * 0.22, w * 0.2, a, 0, 7); g.fill();
          g.strokeStyle = 'rgba(120,0,20,0.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, h / 2); g.lineTo(cx + Math.cos(a) * w * 0.12, cy + Math.sin(a) * h * 0.12); g.stroke(); }
        g.fillStyle = 'rgba(255,240,220,0.9)'; g.beginPath(); g.arc(w / 2, h / 2, 3, 0, 7); g.fill(); }); return new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.55 }); });
      K.ger5G = new THREE.PlaneGeometry(0.03, 0.03); K.gerCore = [0xa01828, 0xb8305a, 0xa01828, 0xc04030].map(function (c) { return rMat(c, { roughness: 0.7 }); });
      K.budG = new THREE.SphereGeometry(0.0045, 6, 4); K.budM = rMat(0x7a8a3a, { roughness: 0.7 });
      var gLT = tex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = '#4e8a3e'; g.beginPath(); for (var k = 0; k <= 48; k++) { var a = k / 48 * Math.PI * 2, r = w * 0.46 * (1 + 0.06 * Math.cos(a * 9)); if (a > Math.PI * 1.4 && a < Math.PI * 1.6) r *= 0.55; g[k ? 'lineTo' : 'moveTo'](w / 2 + Math.cos(a) * r, h / 2 - Math.sin(a) * r); } g.fill();
        g.strokeStyle = 'rgba(70,40,30,0.55)'; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, w * 0.27, -0.9 + Math.PI, 0.9 + Math.PI * 2); g.stroke();   // (the dark zone)
        g.strokeStyle = 'rgba(200,230,170,0.5)'; g.lineWidth = 1; for (k = 0; k < 9; k++) { var a2 = k / 9 * Math.PI * 2; g.beginPath(); g.moveTo(w / 2, h * 0.75); g.lineTo(w / 2 + Math.cos(a2) * w * 0.42, h / 2 - Math.sin(a2) * w * 0.42); g.stroke(); } });
      K.gerLeafM = new THREE.MeshStandardMaterial({ map: gLT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.7 }); K.gerLeafG = new THREE.PlaneGeometry(0.06, 0.06);
      var pp = [], N = 14; for (i = 0; i <= N; i++) { var t = i / N; pp.push(new THREE.Vector2(0.003 + Math.pow(t, 2.2) * 0.034, t * 0.03 - Math.pow(t, 3) * 0.008)); }   // (a petunia: a funnel flaring wide)
      K.petG = new THREE.LatheGeometry(pp, 30); var pa = K.petG.attributes.position, pc = new Float32Array(pa.count * 3), v = new THREE.Vector3();
      for (i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); var ang = Math.atan2(v.z, v.x), rr = Math.hypot(v.x, v.z), tt = Math.min(1, rr / 0.037), lobe = 1 + 0.13 * Math.cos(ang * 5) * tt * tt; pa.setX(i, v.x * lobe); pa.setZ(i, v.z * lobe); pa.setY(i, v.y - 0.004 * Math.cos(ang * 5) * tt * tt);
        var vein = Math.pow(Math.abs(Math.cos(ang * 5 / 2)), 30), c = tt < 0.25 ? [1, 0.88, 0.4] : [1 - 0.35 * vein, 1 - 0.35 * vein, 1 - 0.3 * vein]; pc[i * 3] = c[0]; pc[i * 3 + 1] = c[1]; pc[i * 3 + 2] = c[2]; }
      K.petG.setAttribute('color', new THREE.BufferAttribute(pc, 3)); K.petG.computeVertexNormals();
      K.petMs = [0x7a2ab0, 0xd04aa0, 0xf0eaf4, 0x9a3ac8, 0xd04aa0].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, vertexColors: true, side: THREE.DoubleSide, roughness: 0.5 }); });
      K.calyxG = new THREE.ConeGeometry(0.006, 0.012, 5); K.calyxG.rotateX(Math.PI);
      var ray = new THREE.Shape(); ray.moveTo(0, 0); ray.quadraticCurveTo(0.0035, 0.012, 0.002, 0.024); ray.quadraticCurveTo(0, 0.027, -0.002, 0.024); ray.quadraticCurveTo(-0.0035, 0.012, 0, 0);
      K.rayG = new THREE.ShapeGeometry(ray, 4); K.rayG.rotateX(-Math.PI / 2); K.rayG.translate(0, 0, -0.005); K.rayG.rotateY(Math.PI); K.rayM = new THREE.MeshStandardMaterial({ color: 0xfcfcf6, side: THREE.DoubleSide, roughness: 0.6 });
      var eyeT = tex(32, 32, function (g, w, h) { g.fillStyle = '#e0a820'; g.fillRect(0, 0, w, h); for (var k = 0; k < 120; k++) { g.fillStyle = k % 2 ? 'rgba(160,100,10,0.6)' : 'rgba(255,230,120,0.6)'; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
      K.eyeG = new THREE.SphereGeometry(0.0075, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2); K.eyeM = new THREE.MeshStandardMaterial({ map: eyeT, roughness: 0.8 });
      K.alyG = new THREE.SphereGeometry(0.0034, 5, 4); K.alyM = new THREE.MeshStandardMaterial({ color: 0xfefcf6, roughness: 0.9, emissive: 0x303028 });
      var ivT = tex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); g.fillStyle = '#2e5a2a'; g.beginPath(); var P5 = [[0.5, 0.02], [0.66, 0.3], [0.96, 0.36], [0.74, 0.58], [0.82, 0.92], [0.5, 0.74], [0.18, 0.92], [0.26, 0.58], [0.04, 0.36], [0.34, 0.3]];
        P5.forEach(function (p, k) { g[k ? 'lineTo' : 'moveTo'](p[0] * w, p[1] * h); }); g.closePath(); g.fill(); g.strokeStyle = 'rgba(210,230,190,0.6)'; g.lineWidth = 1.2; [[0.5, 0.05], [0.92, 0.37], [0.8, 0.9], [0.2, 0.9], [0.08, 0.37]].forEach(function (p) { g.beginPath(); g.moveTo(w * 0.5, h * 0.72); g.lineTo(p[0] * w, p[1] * h); g.stroke(); }); });
      K.ivyM = new THREE.MeshStandardMaterial({ map: ivT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.45 }); K.ivyG = new THREE.PlaneGeometry(0.032, 0.032); K.ivyStemM = rMat(0x4a3a2a, { roughness: 0.8 });
      return K; }
    // (a window box's planting, the same everywhere: geraniums, petunias, daisies, alyssum, leaves and trailing ivy, laid in
    // group b with the soil's surface at y = 0, the box w long along x and bd deep, its front toward +z. Each bloom is a
    // shape of its own, then all of one kind are joined into a single piece so a box costs only a handful of draws)
    function plantBox(B, w, bd) { var F = FL || (FL = makeFlowerKit()), b = new THREE.Group(), k, f, q; B.add(b);
      // (the planting, done properly: a bed of real leaves; zonal geraniums, each a stalk carrying a round head of five-petalled
        // florets with a few buds, over scalloped leaves with a dark horseshoe band; petunias, flared five-lobed trumpets veined
        // darker into a yellow throat; shasta daisies, a ring of slender white rays round a domed golden eye; sweet alyssum,
        // mounds of tiny white florets spilling over the front; and ivy trailing down with proper lobed leaves)
        for (k = 0; k < Math.round(w / 0.011); k++) { var lx2 = -w / 2 + 0.02 + rnd() * (w - 0.04), lv = G(b, lx2, 0.0, (rnd() - 0.5) * (bd - 0.03), rnd() * 6.3); var lm = P(lv, F.leafG, F.leafM, 0, 0.025, 0.02, -0.9 - rnd() * 0.4, 0, 0); lm.scale.setScalar(0.8 + rnd() * 0.5); lm.castShadow = false; }   // (leaves)
        var nG = Math.max(2, Math.round(w / 0.21)); for (k = 0; k < nG; k++) { var gx = -w / 2 + 0.1 + k * (w - 0.2) / (nG - 1), gz = (rnd() - 0.5) * 0.05, col = F.gerCols[k % F.gerCols.length], top = 0.13 + rnd() * 0.03;   // (geraniums)
          Q(P(b, new THREE.CylinderGeometry(0.003, 0.004, top, 5), F.stemM, gx, top / 2, gz, (rnd() - 0.5) * 0.15, 0, (rnd() - 0.5) * 0.15));
          Q(P(b, new THREE.SphereGeometry(0.022, 12, 8), F.gerCore[k % 4], gx, top + 0.008, gz)).scale.y = 0.8; for (var f = 0; f < 24; f++) { var fa = f * 2.4, fe = Math.acos(1 - (f + 0.5) / 24 * 1.3), fl2 = G(b, gx + Math.sin(fe) * Math.cos(fa) * 0.026, top + 0.008 + Math.cos(fe) * 0.02, gz + Math.sin(fe) * Math.sin(fa) * 0.026, 0);
            fl2.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(Math.sin(fe) * Math.cos(fa), Math.cos(fe), Math.sin(fe) * Math.sin(fa))); Q(P(fl2, F.ger5G, col, 0, 0, 0)); }
          for (f = 0; f < 4; f++) Q(P(b, F.budG, F.budM, gx + (rnd() - 0.5) * 0.03, top + 0.005, gz + (rnd() - 0.5) * 0.03));
          for (f = 0; f < 3; f++) { var gl = G(b, gx + (f - 1) * 0.045, 0.045 + f % 2 * 0.012, gz + 0.03 * (f % 2 ? -1 : 1), f * 2.1); Q(P(gl, F.gerLeafG, F.gerLeafM, 0, 0, 0.03, -1.15, 0, 0)); } }
        var nP = Math.max(2, Math.round(w / 0.11)); for (k = 0; k < nP; k++) { var px = -w / 2 + 0.07 + k * (w - 0.14) / (nP - 1) + 0.03 * (k < nP - 1 ? 1 : -1), pg = G(b, px, 0.04 + (k % 2) * 0.012, 0.05 + (k % 2) * 0.03, rnd() * 6.3);   // (petunias)
          pg.rotation.x = 0.55; Q(P(pg, F.petG, F.petMs[k % F.petMs.length], 0, 0, 0)).scale.setScalar(0.8); Q(P(pg, F.calyxG, F.stemM, 0, -0.004, 0)); }
        var nD = Math.max(2, Math.round(w / 0.165)); for (k = 0; k < nD; k++) { var dx = -w / 2 + 0.06 + k * (w - 0.12) / (nD - 1) + 0.015 * (k < nD - 1 ? 1 : -1), dz = -0.055 + (k % 2) * 0.025, dh = 0.1 + rnd() * 0.03;   // (daisies)
          Q(P(b, new THREE.CylinderGeometry(0.002, 0.0025, dh, 4), F.stemM, dx, dh / 2, dz)); var dg2 = G(b, dx, dh, dz, rnd() * 6.3); dg2.rotation.x = 0.25 + rnd() * 0.2;
          for (var pt = 0; pt < 18; pt++) { var pr = G(dg2, 0, 0, 0, pt / 18 * Math.PI * 2); Q(P(pr, F.rayG, F.rayM, 0, 0, 0, -0.12 - (pt % 2) * 0.06, 0, 0)); }
          Q(P(dg2, F.eyeG, F.eyeM, 0, 0.002, 0)).scale.y = 0.55; }
        var nA = Math.max(2, Math.round(w / 0.14)); for (k = 0; k < nA; k++) { var ax = -w / 2 + 0.05 + k * (w - 0.1) / (nA - 1);   // (sweet alyssum, mounding and spilling over the front)
          for (f = 0; f < 40; f++) { var aa = rnd() * 6.3, ar = Math.sqrt(rnd()) * 0.032; Q(P(b, F.alyG, f % 7 ? F.alyM : F.stemM, ax + Math.cos(aa) * ar, 0.018 + (0.03 - ar) * 0.5, bd / 2 - 0.01 + Math.sin(aa) * ar * 0.7 + (f % 3 === 0 ? 0.012 : 0))); } }
        var nI = Math.max(2, Math.round(w / 0.21)); for (k = 0; k < nI; k++) { var ix = -w / 2 + 0.08 + k * (w - 0.16) / (nI - 1), pts = []; for (var q = 0; q <= 8; q++) pts.push(new THREE.Vector3(ix + Math.sin(q * 0.8 + k) * 0.02, 0.0 - q * 0.03 - q * q * 0.002, bd / 2 + 0.02 + Math.sin(q * 0.5) * 0.012));   // (ivy trailing over the front)
          var cv = new THREE.CatmullRomCurve3(pts); Q(P(b, new THREE.TubeGeometry(cv, 12, 0.0022, 4), F.ivyStemM, 0, 0, 0));
          for (q = 1; q < 10; q++) { var pp2 = cv.getPoint(q / 10), il = G(b, pp2.x + (q % 2 ? 0.008 : -0.008), pp2.y, pp2.z + 0.006, 0); il.rotation.set(-0.25, q % 2 ? 0.45 : -0.45, (q % 2 ? -1 : 1) * 0.5); Q(P(il, F.ivyG, F.ivyM, 0, 0, 0)).scale.setScalar(0.7 + (q % 3) * 0.15); } }
      mergeByMat(b); return b; }
    function mergeByMat(g) { g.updateMatrixWorld(true); var inv = new THREE.Matrix4().copy(g.matrixWorld).invert(), by = new Map(), m4 = new THREE.Matrix4();
      g.traverse(function (o) { if (o.isMesh) { if (!by.has(o.material)) by.set(o.material, []); by.get(o.material).push(o); } });
      var out = [];
      by.forEach(function (list, mat) { var geos = list.map(function (o) { var gg = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); gg.applyMatrix4(m4.multiplyMatrices(inv, o.matrixWorld)); return gg; });
        var names = Object.keys(geos[0].attributes).filter(function (n) { return geos.every(function (gg) { return gg.attributes[n] && gg.attributes[n].itemSize === geos[0].attributes[n].itemSize; }); }), mg = new THREE.BufferGeometry();
        names.forEach(function (n) { var sz = geos[0].attributes[n].itemSize, tot = 0; geos.forEach(function (gg) { tot += gg.attributes[n].array.length; }); var arr = new Float32Array(tot), at = 0; geos.forEach(function (gg) { arr.set(gg.attributes[n].array, at); at += gg.attributes[n].array.length; }); mg.setAttribute(n, new THREE.BufferAttribute(arr, sz)); });
        var mm = new THREE.Mesh(mg, mat); mm.receiveShadow = true; out.push(mm); });
      while (g.children.length) g.remove(g.children[0]); out.forEach(function (mm) { g.add(mm); }); }
    function flowerBox(par, x, y, w) {   // (a planked box on scrolled brackets, full of geraniums, petunias, daisies and alyssum, ivy trailing over)
      var b = G(par, x, y, WZ + 0.12, 0), bh = 0.16, bd = 0.2;
      for (var k = 0; k < 3; k++) box(b, w, bh / 3 - 0.004, 0.02, sageDoorM, 0, -bh + (k + 0.5) * bh / 3, bd / 2);   // (front planks)
      [[0, bd / 2 + 0.005, w + 0.03, 0.03], [0, -bd / 2 + 0.005, w + 0.03, 0.03], [-w / 2, 0.005, 0.03, bd + 0.03], [w / 2, 0.005, 0.03, bd + 0.03]].forEach(function (c) { box(b, c[2], 0.02, c[3], sashM, c[0], 0.005, c[1]); });   // (a rim, the soil open inside) box(b, w + 0.02, 0.02, bd + 0.02, sashM, 0, -bh - 0.005, 0.005);   // (cap and base trim)
      [-1, 1].forEach(function (sd) { box(b, 0.02, bh, bd, sageDoorM, sd * w / 2, -bh / 2, 0); var br = new THREE.Shape(); br.moveTo(0, 0); br.lineTo(0, -0.14); br.quadraticCurveTo(0.03, -0.14, 0.04, -0.1); br.bezierCurveTo(0.05, -0.05, 0.12, -0.04, 0.15, 0); br.lineTo(0, 0);
        var bg = new THREE.ExtrudeGeometry(br, { depth: 0.022, bevelEnabled: false }); bg.translate(0, 0, -0.011); P(b, bg, sashM, sd * (w / 2 - 0.08), -bh - 0.012, -bd / 2 + 0.005, 0, -Math.PI / 2, 0); });   // (brackets)
      box(b, w - 0.02, 0.01, bd - 0.02, rMat(0x3a2a1e, { roughness: 1 }), 0, -0.004, 0);   // (soil)
      plantBox(b, w, bd);
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
    // (the door, built like a real one: a frame of stiles and rails standing proud, and between them raised-and-fielded
    // panels, each sunk in its opening with a bevel rising to a flat field and a small moulding round it; a square glazed
    // panel up top holding the brass porthole; a lock rail with a brass letter plate; two tall panels below; a long brass
    // lock plate with a knob and keyhole, an anchor knocker, three butt hinges with their knuckles showing, and a weatherboard across the foot to throw off the rain; a thin shadow gap all round where it meets the frame)
    var dr = G(sg, 0, 0, WZ - 0.05, 0), DW = 0.93, DH = 1.96, DT = 0.045, FZ2 = DT / 2;
    [-1, 1].forEach(function (sd) { box(sg, 0.025, 2.02, 0.11, trimM, sd * 0.4875, 1.01, WZ - 0.05); }); box(sg, 1.0, 0.025, 0.11, trimM, 0, 2.0, WZ - 0.05);   // (jamb linings round the opening)
    box(sg, 1.06, 0.09, 0.03, trimM, 0, 2.03, WZ + 0.015);   // (the head casing)
    Q(box(sg, 0.95, 1.99, 0.01, rMat(0x241c16, { roughness: 1 }), 0, 1.0, WZ - 0.1));   // (the dark gap behind, so the edges read as a shadow line)
    var stileW = 0.13, railT = 0.13, railL = 0.17, railB = 0.24, yL = 0.86, py0 = 0.02;   // (frame sizes, and where the lock rail sits)
    box(dr, DW, DH, DT * 0.6, sageDkM, 0, py0 + DH / 2, -0.004);   // (the back of the panels)
    [-1, 1].forEach(function (sd) { box(dr, stileW, DH, DT, sageDoorM, sd * (DW / 2 - stileW / 2), py0 + DH / 2, 0); });   // (stiles)
    [[railB, py0 + railB / 2], [railL, py0 + yL], [railT, py0 + DH - railT / 2]].forEach(function (r) { box(dr, DW - stileW * 2, r[0], DT, sageDoorM, 0, r[1], 0); });   // (bottom, lock and top rails)
    var mullW = 0.1; box(dr, mullW, yL - railL / 2 - railB, DT, sageDoorM, 0, py0 + railB + (yL - railL / 2 - railB) / 2, 0);   // (a muntin between the two lower panels)
    function panel(cx, cy, w, h) {   // (a raised and fielded panel in its opening, with a moulding round it)
      var sh = new THREE.Shape(); sh.moveTo(-w / 2 + 0.03, -h / 2 + 0.03); sh.lineTo(w / 2 - 0.03, -h / 2 + 0.03); sh.lineTo(w / 2 - 0.03, h / 2 - 0.03); sh.lineTo(-w / 2 + 0.03, h / 2 - 0.03); sh.closePath();
      var g = new THREE.ExtrudeGeometry(sh, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.028, bevelSegments: 1 }); P(dr, g, sageDoorM, cx, cy, -0.003);   // (bevel rising to the flat field)
      [[0, h / 2, w, 0], [0, -h / 2, w, 0], [w / 2, 0, h, 1], [-w / 2, 0, h, 1]].forEach(function (m) { var mm = P(dr, new THREE.CylinderGeometry(0.008, 0.008, m[2], 6, 1, false, 0, Math.PI), sashM, cx + m[0] * 0.98, cy + m[1] * 0.98, FZ2 - 0.004, 0, 0, m[3] ? 0 : Math.PI / 2); mm.rotation.y = m[3] ? (m[0] > 0 ? Math.PI : 0) : 0; if (!m[3]) mm.rotation.x = m[1] > 0 ? Math.PI / 2 : -Math.PI / 2; });   // (the moulding)
    }
    var lowW = (DW - stileW * 2 - mullW) / 2, lowH = yL - railL / 2 - railB;
    panel(-(mullW + lowW) / 2, py0 + railB + lowH / 2, lowW, lowH); panel((mullW + lowW) / 2, py0 + railB + lowH / 2, lowW, lowH);
    var upW = DW - stileW * 2, upH = DH - railT - yL - railL / 2, upY = py0 + yL + railL / 2 + upH / 2;
    panel(0, upY, upW, upH);   // (the upper panel, round which the porthole sits)
    var PY = upY;
    P(dr, new THREE.CircleGeometry(0.15, 32), roomM, 0, PY, FZ2 + 0.004); Q(P(dr, new THREE.CircleGeometry(0.15, 32), paneM, 0, PY, FZ2 + 0.008)); Q(P(dr, new THREE.CircleGeometry(0.15, 32), reflM, 0, PY, FZ2 + 0.009)).renderOrder = 2;
    P(dr, new THREE.TorusGeometry(0.165, 0.028, 14, 44), R.brassM, 0, PY, FZ2 + 0.014); P(dr, new THREE.TorusGeometry(0.192, 0.009, 8, 44), R.brassM, 0, PY, FZ2 + 0.006);
    for (var bo2 = 0; bo2 < 10; bo2++) { var ba2 = bo2 / 10 * Math.PI * 2; Q(P(dr, new THREE.SphereGeometry(0.01, 8, 6), R.brassM, Math.cos(ba2) * 0.192, PY + Math.sin(ba2) * 0.192, FZ2 + 0.014)); }   // (porthole ring and its bolts)
    box(dr, 0.24, 0.045, 0.008, R.brassM, 0, py0 + yL, FZ2 + 0.004); Q(box(dr, 0.2, 0.012, 0.004, hingeM, 0, py0 + yL, FZ2 + 0.009)); Q(box(dr, 0.21, 0.006, 0.006, R.brassM, 0, py0 + yL + 0.012, FZ2 + 0.01));   // (letter plate and its flap)
    var LX = DW / 2 - stileW / 2; box(dr, 0.05, 0.24, 0.007, R.brassM, LX, py0 + 0.98, FZ2 + 0.0035); [0.08, -0.08].forEach(function (dy) { Q(P(dr, new THREE.SphereGeometry(0.005, 6, 4), R.brassM, LX, py0 + 0.98 + dy, FZ2 + 0.008)); });   // (long lock plate)
    P(dr, new THREE.CylinderGeometry(0.009, 0.012, 0.045, 10), R.brassM, LX, py0 + 1.02, FZ2 + 0.028, Math.PI / 2, 0, 0); P(dr, new THREE.SphereGeometry(0.028, 18, 14), R.brassM, LX, py0 + 1.02, FZ2 + 0.06).scale.z = 0.8;   // (the knob)
    Q(P(dr, new THREE.CircleGeometry(0.006, 10), hingeM, LX, py0 + 0.93, FZ2 + 0.008)); Q(box(dr, 0.004, 0.016, 0.002, hingeM, LX, py0 + 0.918, FZ2 + 0.008));   // (keyhole)
    var kn = G(dr, 0, PY - 0.3, FZ2 + 0.004, 0); P(kn, new THREE.CylinderGeometry(0.018, 0.018, 0.012, 14), R.brassM, 0, 0.06, 0.006, Math.PI / 2, 0, 0);   // (an anchor knocker: its mount, shank, stock and flukes)
    P(kn, new THREE.TorusGeometry(0.012, 0.004, 6, 14), R.brassM, 0, 0.045, 0.014); box(kn, 0.008, 0.1, 0.008, R.brassM, 0, -0.005, 0.016); box(kn, 0.06, 0.008, 0.008, R.brassM, 0, 0.03, 0.016);
    P(kn, new THREE.TorusGeometry(0.035, 0.005, 6, 20, Math.PI), R.brassM, 0, -0.02, 0.016, 0, 0, Math.PI); [-1, 1].forEach(function (sd) { P(kn, new THREE.ConeGeometry(0.009, 0.02, 4), R.brassM, sd * 0.036, -0.012, 0.016, 0, 0, sd * 0.4); });
    var wb = new THREE.Shape(); wb.moveTo(0, 0); wb.lineTo(0, 0.06); wb.lineTo(0.012, 0.06); wb.quadraticCurveTo(0.02, 0.02, 0.05, 0.0); wb.lineTo(0, 0);
    var wbG = new THREE.ExtrudeGeometry(wb, { depth: DW - 0.02, bevelEnabled: false }); wbG.translate(0, 0, -(DW - 0.02) / 2); P(dr, wbG, sageDoorM, 0, py0 + 0.17, FZ2, 0, -Math.PI / 2, 0);   // (the weatherboard)
    [0.28, 1.0, 1.72].forEach(function (hy) { box(dr, 0.045, 0.1, 0.006, hingeM, -DW / 2 + 0.02, py0 + hy, FZ2 + 0.003); P(dr, new THREE.CylinderGeometry(0.009, 0.009, 0.1, 10), hingeM, -DW / 2 - 0.002, py0 + hy, FZ2 + 0.004);
      [-1, 1].forEach(function (e) { Q(P(dr, new THREE.SphereGeometry(0.009, 8, 6), hingeM, -DW / 2 - 0.002, py0 + hy + e * 0.052, FZ2 + 0.004)); }); });   // (butt hinges, knuckles and finials)
    // (a threshold; a casing of fluted pilasters on plinth blocks under a frieze and cornice, with a carved fish leaping over it)
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
    // ---- every other window box in the game, rebuilt as a proper planted box like Reel & Wing's, in its own building's
    // colours: the farmhouse, the seed shop, the clinic, Fluff & Feather, Oak & Ember, the coop and your barn. Each is a box
    // of tongue-and-groove planks with seams and grain, corner posts with nail heads, a moulded rim round the open top
    // showing the soil, a base trim, and scrolled brackets under it (or little feet, for the shop's planters on the ground);
    // the old box and blooms are put away and the same flowers as Reel & Wing's planted in it ----
    (function () {
      function hideIf(par, test) { par.children.forEach(function (o) { if (test(o)) o.visible = false; }); }
      function geoIs(o, type, a, b, c) { var gp = o.geometry && o.geometry.parameters; return !!gp && o.geometry.type === type && Math.abs((gp.width || gp.radius || 0) - a) < 1e-4 && (b === undefined || Math.abs((gp.height || 0) - b) < 1e-4) && (c === undefined || Math.abs((gp.depth || 0) - c) < 1e-4); }
      var plankT = cpTex(128, 64, function (g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); var k;
        for (k = 0; k < 30; k++) { var y = rnd() * h; g.strokeStyle = 'rgba(' + (rnd() < 0.6 ? '120,110,100,' : '255,255,255,') + (0.1 + rnd() * 0.18).toFixed(2) + ')'; g.lineWidth = 0.6 + rnd(); g.beginPath(); g.moveTo(0, y); for (var x = 0; x <= w; x += 8) g.lineTo(x, y + Math.sin(x * 0.05 + k) * 1.5); g.stroke(); }   // (grain)
        for (k = 0; k < 3; k++) { g.fillStyle = 'rgba(30,22,16,0.55)'; g.fillRect(0, k * h / 3, w, 2); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, k * h / 3 + 2, w, 1); }   // (plank seams)
        g.fillStyle = 'rgba(60,50,40,0.25)'; for (k = 0; k < 50; k++) g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 3, 1); }, [1, 1]);
      var nailM2 = rMat(0x5a524a, { metalness: 0.5, roughness: 0.5 }), soilM2 = rMat(0x3a2a1e, { roughness: 1 });
      var mats = new Map(); function plankMat(col) { if (!mats.has(col)) mats.set(col, new THREE.MeshStandardMaterial({ map: plankT, color: col, roughness: 0.75 })); return mats.get(col); }
      function trimMat(col) { return plankMat(new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.18).getHex()); }
      function buildBox(g, w, d, h, col, rimCol, feet) {   // (in g: soil surface at y = 0, the box w along x and d deep, front at +z)
        var M = plankMat(col), TM = trimMat(rimCol === undefined ? col : rimCol), top = 0.015, t = 0.022;
        function bx(sx, sy, sz, m, x, y, z) { var o = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; g.add(o); return o; }
        bx(w, h, t, M, 0, top - h / 2, d / 2 - t / 2); bx(w, h, t, M, 0, top - h / 2, -d / 2 + t / 2); bx(t, h, d - t * 2, M, -w / 2 + t / 2, top - h / 2, 0); bx(t, h, d - t * 2, M, w / 2 - t / 2, top - h / 2, 0); bx(w - t * 2, t, d - t * 2, M, 0, top - h + t / 2, 0);   // (the planks)
        bx(w - t * 2, 0.012, d - t * 2, soilM2, 0, -0.006, 0);   // (soil)
        [[0, d / 2 + 0.006, w + 0.05, 0.034], [0, -d / 2 - 0.006, w + 0.05, 0.034], [w / 2 + 0.006, 0, 0.034, d + 0.012], [-w / 2 - 0.006, 0, 0.034, d + 0.012]].forEach(function (r) { bx(r[2], 0.022, r[3], TM, r[0], top + 0.011, r[1]); });   // (the rim)
        bx(w + 0.03, 0.026, d + 0.03, TM, 0, top - h + 0.013, 0);   // (base trim)
        [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { bx(0.03, h - 0.03, 0.03, TM, sx * (w / 2 - 0.004), top - h / 2, sz * (d / 2 - 0.004)); }); });   // (corner posts)
        [-1, 1].forEach(function (sx) { [0.3, 0.7].forEach(function (f) { var n = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.004, 8), nailM2); n.rotation.x = Math.PI / 2; n.position.set(sx * (w / 2 - 0.004), top - h * f, d / 2 + 0.012); g.add(n); }); });
        if (w > 0.6) bx(0.024, h - 0.05, 0.008, TM, 0, top - h / 2, d / 2 + 0.003);   // (a batten down the middle of the front)
        if (feet) [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { var f = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.05, 10), TM); f.position.set(sx * (w / 2 - 0.08), top - h - 0.02, sz * (d / 2 - 0.06)); g.add(f); }); });
        else [-1, 1].forEach(function (sx) { if (w < 0.3) return; var br = new THREE.Shape(); br.moveTo(0, 0); br.lineTo(0, -0.14); br.quadraticCurveTo(0.03, -0.14, 0.04, -0.1); br.bezierCurveTo(0.05, -0.05, 0.12, -0.04, d * 0.75, 0); br.lineTo(0, 0);   // (scrolled brackets)
          var bg = new THREE.ExtrudeGeometry(br, { depth: 0.022, bevelEnabled: false }); bg.translate(0, 0, -0.011); var o = new THREE.Mesh(bg, TM); o.position.set(sx * (w / 2 - 0.1), top - h, -d / 2); o.rotation.y = -Math.PI / 2; o.castShadow = true; g.add(o); });
      }
      function boxAt(par, x, y, z, w, d, ry, h, col, rimCol, feet) { var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; par.add(g); buildBox(g, w, d, h, col, rimCol, feet); plantBox(g, w - 0.05, d - 0.05); return g; }
      try {   // (the farmhouse: each window's own group holds its box)
        var hm = typeof houseMats !== 'undefined' && houseMats, hset = hm ? [hm.flowerPink, hm.flowerLilac, hm.flowerWhite, hm.flowerBlue, hm.flowerHeart, hm.leaf, hm.leafDark] : [];
        if (hm) { var seenH = []; scene.traverse(function (o) { if (o.isMesh && o.material === hm.soil && geoIs(o, 'BoxGeometry', 0.84, 0.02, 0.2) && seenH.indexOf(o.parent) < 0) seenH.push(o.parent); });
          seenH.forEach(function (w) { hideIf(w, function (o) { if (o.isMesh) return hset.indexOf(o.material) >= 0 || o.material === hm.soil || geoIs(o, 'BoxGeometry', 0.9, 0.18, 0.24) || geoIs(o, 'BoxGeometry', 0.96, 0.035, 0.28); return o.isGroup && o.children.length && o.children.every(function (c) { return c.isMesh && hset.indexOf(c.material) >= 0; }); });
            boxAt(w, 0, -0.45, 0.13, 0.9, 0.24, 0, 0.18, hm.beam.color.getHex()); }); }
      } catch (err) { if (window.console) console.warn(err); }
      try {   // (Oak & Ember, the coop and your barn: cpFlowerBox's troughs)
        if (typeof FB !== 'undefined' && FB) { var boxes = [];
          scene.traverse(function (o) { if (o.isMesh && o.material === FB.soil && boxes.indexOf(o.parent) < 0) boxes.push(o.parent); });
          boxes.forEach(function (g) { var soil = null, plank = null; g.children.forEach(function (o) { if (o.isMesh && o.material === FB.soil) soil = o; else if (o.isMesh && !plank && o.material && o.material.color) plank = o; }); var gw = soil.geometry.parameters.width + 0.06, gd = soil.geometry.parameters.depth + 0.06;
            var col = plank ? plank.material.color.getHex() : 0x8a6a48; hideIf(g, function () { return true; }); boxAt(g, 0, 0.07, 0, gw, gd, 0, 0.16, col); }); }
      } catch (err) { if (window.console) console.warn(err); }
      try {   // (the clinic: its boxes' blooms were drawn all together; those go, and each window's box is rebuilt)
        if (typeof clLeafIM !== 'undefined') { clLeafIM.visible = false; clBloomIM.visible = false;
          var cls = []; scene.traverse(function (o) { if (o.isMesh && typeof CL !== 'undefined' && o.material === CL.soil && o.geometry.parameters && Math.abs(o.geometry.parameters.depth - 0.24) < 1e-4) cls.push(o); });
          cls.forEach(function (o) { var bxw = o.geometry.parameters.width + 0.08, y0 = o.position.y - 0.15;
            hideIf(o.parent, function (c) { return c === o || (c.isMesh && Math.abs(c.position.y - y0) < 1e-3 && geoIs(c, 'BoxGeometry', bxw, 0.3, 0.3)) || (c.isMesh && c.material === CL.teal && geoIs(c, 'BoxGeometry', bxw + 0.04, 0.04, 0.33)); });
            boxAt(o.parent, o.position.x, o.position.y, o.position.z, bxw, 0.3, 0, 0.3, CL.trim.color.getHex(), CL.teal.color.getHex()); }); }
      } catch (err) { if (window.console) console.warn(err); }
      try {   // (the seed shop: its planters on the ground, under the display windows and the side windows)
        if (typeof shopGroup !== 'undefined') { var lists = [pbLeaves, pbPetals, pbCentres, pbLavStems, pbLavBuds].map(function (l) { return l.length; });
          shopGroup.children.forEach(function (o) { if (o.isInstancedMesh && lists.indexOf(o.count) >= 0) o.visible = false; });
          shopGroup.children.slice().forEach(function (o) { var gp = o.geometry && o.geometry.parameters; if (!o.isMesh || o.isInstancedMesh || o.geometry.type !== 'BoxGeometry' || !gp || Math.abs(gp.height - 0.02) > 1e-4) return;
            var lx = gp.width + 0.02, lz = gp.depth + 0.02; if (!((Math.abs(lx - 2.9) < 0.01 && Math.abs(lz - 0.3) < 0.01) || (Math.abs(lx - 0.24) < 0.01 && Math.abs(lz - 1.2) < 0.01))) return;
            var y0 = o.position.y - 0.305, cx = o.position.x, cz = o.position.z, body = null;
            shopGroup.children.forEach(function (c) { if (!c.isMesh || c.isInstancedMesh) return; var cp = c.geometry && c.geometry.parameters; if (!cp || c.geometry.type !== 'BoxGeometry') return;
              var near = Math.abs(c.position.x - cx) < lx / 2 + 0.05 && Math.abs(c.position.z - cz) < lz / 2 + 0.05 && c.position.y > y0 - 0.01 && c.position.y < y0 + 0.35;
              if (near && ((Math.abs(cp.width - lx) < 1e-3 && Math.abs(cp.height - 0.3) < 1e-3) || Math.abs(cp.height - 0.04) < 1e-3)) { c.visible = false; if (Math.abs(cp.height - 0.3) < 1e-3) body = c; } });
            o.visible = false; var col = body && body.material.color ? body.material.color.getHex() : 0xf2ece0, rim = typeof houseMats !== 'undefined' && houseMats.gold ? houseMats.gold.color.getHex() : col;
            if (lx > lz) boxAt(shopGroup, cx, y0 + 0.3, cz, lx, lz, 0, 0.27, col, rim, true);
            else boxAt(shopGroup, cx, y0 + 0.3, cz, lz, lx, cx > 0 ? Math.PI / 2 : -Math.PI / 2, 0.27, col, rim, true); }); }
      } catch (err) { if (window.console) console.warn(err); }
      try {   // (Fluff & Feather: a box under each side window)
        if (typeof barnGroup !== 'undefined' && typeof AM !== 'undefined') { var bws = []; barnGroup.traverse(function (o) { if (o.isMesh && o.material === AM.darkWood && geoIs(o, 'BoxGeometry', 1.0, 0.2, 0.2) && Math.abs(o.position.y + 0.65) < 0.01) bws.push(o); });
          bws.forEach(function (o) { var wg = o.parent; o.visible = false; hideIf(wg, function (c) { return c.isMesh && (geoIs(c, 'SphereGeometry', 0.045) || geoIs(c, 'IcosahedronGeometry', 0.05)); });
            boxAt(wg, 0, -0.56, 0.12, 1.0, 0.22, 0, 0.2, AM.darkWood.color.getHex()); }); }
      } catch (err) { if (window.console) console.warn(err); }
    })();
    // ---- at night the lantern is lit, its candle flickering ----
    updateCarpenter = (function (base) { return function (t, night) { base.apply(this, arguments); var nt = night || 0, fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3);
      lanGlowM.emissiveIntensity = 0.2 + nt * 1.4 * fl; flames.forEach(function (f, k) { f.visible = nt > 0.15; f.scale.y = 2.2 * (0.85 + 0.15 * Math.sin(t * 11 + k * 2)); }); lanLights.forEach(function (l) { l.intensity = nt * 0.55 * fl; }); roomM.emissiveIntensity = nt * 0.35; }; })(updateCarpenter);
  })();
});
