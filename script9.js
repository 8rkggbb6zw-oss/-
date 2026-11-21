// Everdawn, part 6 of 6 (see the note at the top of script.js). More of the game, carrying on from script8.js (which was
// nearly full): it joins on after the other parts, so it shares all their variables

EVERDAWN_PARTS.push(function (THREE) {
  // ===== Reel & Wing's front porch, dressed in detail: its floor of painted boards, two fluted columns with carved brackets
  // holding up the awning, railings of turned balusters on newel posts, and everything sitting on it: a slatted bench with a
  // cushion, pillows, a folded blanket and a tackle box; a staved barrel of fishing rods and bug nets with a coil of rope;
  // a stack of roped buoys; a wire crab pot with its bait bag and float; a brass lantern on a scrolled iron bracket by the
  // door, lit after dark; and two terracotta pots of agave on their saucers ====
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
    var bench = G(sg, -1.45, 0, FZ - 0.32, 0), sageM = rMat(0x86a184, { roughness: 0.6 }), legG = new THREE.LatheGeometry([[0, 0], [0.022, 0], [0.022, 0.03], [0.016, 0.06], [0.02, 0.16], [0.016, 0.3], [0.02, 0.34], [0, 0.34]].map(function (v) { return new THREE.Vector2(v[0], v[1]); }), 12);
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
    var tb = G(sg, -0.75, 0, FZ - 0.25, 0.3); P(tb, new THREE.BoxGeometry(0.32, 0.14, 0.18), rMat(0x3a6a4a, { roughness: 0.45 }), 0, 0.07, 0); P(tb, new THREE.BoxGeometry(0.33, 0.035, 0.19), rMat(0x2e5a3c, { roughness: 0.45 }), 0, 0.157, 0);   // (a tackle box at the bench's end)
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
    R.bugNetProp(barrel, 0.08, 0.3, 0.06, 0.05, -0.18, 0xd8a868); R.bugNetProp(barrel, -0.06, 0.3, -0.05, -0.12, 0.2, 0xff9ac8);
    var coil = G(sg, 1.05, 0, FZ - 0.25, 0); for (var cl = 0; cl < 5; cl++) Q(P(coil, new THREE.TorusGeometry(0.12 - cl * 0.012, 0.014, 6, 26), R.ropeM, 0, 0.014 + cl * 0.022, 0, Math.PI / 2, 0, cl * 0.4));   // (a coil of rope)

    // ---- the buoys, stacked and tied with rope; the crab pot, wire on a frame with its bait bag and a float ----
    R.buoy(sg, 2.0, 0.2, FZ - 0.25, 1, 0); R.buoy(sg, 2.0, 0.2, FZ - 0.62, 0.9, 2); R.buoy(sg, 1.98, 0.5, FZ - 0.45, 0.85, 1);
    [[2.0, 0.36, FZ - 0.25], [2.0, 0.36, FZ - 0.62]].forEach(function (b) { Q(P(sg, new THREE.TorusGeometry(0.17, 0.008, 5, 22), R.ropeM, b[0], b[1] - 0.12, b[2], Math.PI / 2, 0, 0)); });
    var trap = G(sg, -2.0, 0, BD + 0.42, 0.3), wire = rMat(0x4a5048, { metalness: 0.4, roughness: 0.6 }), TW = 0.5, TH = 0.27, TD = 0.36;
    [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { P(trap, new THREE.CylinderGeometry(0.006, 0.006, TH, 5), wire, sx * TW / 2, TH / 2, sz * TD / 2); [0.006, TH].forEach(function (yy) { P(trap, new THREE.CylinderGeometry(0.006, 0.006, TW, 5), wire, 0, yy, sz * TD / 2, 0, 0, Math.PI / 2); P(trap, new THREE.CylinderGeometry(0.006, 0.006, TD, 5), wire, sx * TW / 2, yy, 0, Math.PI / 2, 0, 0); }); }); });   // (the frame)
    var meshT = R.netT.clone(); meshT.needsUpdate = true; meshT.wrapS = meshT.wrapT = THREE.RepeatWrapping; meshT.repeat.set(5, 3);
    Q(P(trap, new THREE.BoxGeometry(TW, TH, TD), new THREE.MeshStandardMaterial({ color: 0x5a6058, map: meshT, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.7 }), 0, TH / 2, 0));   // (the wire mesh)
    var bait = P(trap, new THREE.SphereGeometry(0.05, 10, 8), rMat(0xe08040, { roughness: 0.9 }), 0, 0.12, 0); bait.scale.set(1, 1.3, 1);
    Q(P(trap, new THREE.TorusGeometry(0.07, 0.025, 6, 14, Math.PI), wire, 0.12, TH, 0, 0, 0, 0)); R.buoy(trap, -0.36, 0.08, 0.15, 0.55, 2); Q(P(trap, new THREE.CylinderGeometry(0.005, 0.005, 0.2, 4), R.ropeM, -0.25, 0.12, 0.08, 0, 0, 1.2));

    // ---- the lantern by the door: a scrolled iron bracket, a brass lantern hanging from it with glass panes and a candle ----
    var lan = G(sg, 0.72, 1.62, BD + 0.02, 0), lanGlowM = new THREE.MeshStandardMaterial({ color: 0xffe0a0, emissive: 0xffb050, emissiveIntensity: 0.3, transparent: true, opacity: 0.5, roughness: 0.1 }), flameM = new THREE.MeshBasicMaterial({ color: 0xffd070 });
    P(lan, new THREE.BoxGeometry(0.08, 0.14, 0.02), R.ironM, 0, 0.18, 0.01); var scr = new THREE.TubeGeometry(new THREE.CubicBezierCurve3(new THREE.Vector3(0, 0.22, 0.02), new THREE.Vector3(0, 0.3, 0.12), new THREE.Vector3(0, 0.3, 0.2), new THREE.Vector3(0, 0.2, 0.22)), 16, 0.008, 5); P(lan, scr, R.ironM, 0, 0, 0);
    P(lan, new THREE.TorusGeometry(0.02, 0.004, 5, 12), R.ironM, 0, 0.2, 0.22);
    var lb = G(lan, 0, 0, 0.22, 0); P(lb, new THREE.ConeGeometry(0.085, 0.07, 4), R.brassM, 0, 0.14, 0, 0, Math.PI / 4, 0); P(lb, new THREE.CylinderGeometry(0.018, 0.022, 0.03, 8), R.brassM, 0, 0.19, 0);
    P(lb, new THREE.BoxGeometry(0.13, 0.015, 0.13), R.brassM, 0, 0.1, 0); P(lb, new THREE.BoxGeometry(0.12, 0.02, 0.12), R.brassM, 0, -0.1, 0); P(lb, new THREE.CylinderGeometry(0.03, 0.05, 0.03, 4), R.brassM, 0, -0.125, 0, 0, Math.PI / 4, 0);
    [-1, 1].forEach(function (sx) { [-1, 1].forEach(function (sz) { P(lb, new THREE.BoxGeometry(0.012, 0.2, 0.012), R.brassM, sx * 0.055, 0, sz * 0.055); }); });
    Q(P(lb, new THREE.BoxGeometry(0.105, 0.19, 0.105), lanGlowM, 0, 0, 0)); P(lb, new THREE.CylinderGeometry(0.016, 0.016, 0.07, 10), rMat(0xf6f0e0, { roughness: 0.6 }), 0, -0.055, 0); var flame = Q(P(lb, new THREE.ConeGeometry(0.009, 0.03, 8), flameM, 0, 0.0, 0));
    // ---- the potted agaves: terracotta pots with a rolled rim on saucers, dark soil, curving pointed leaves ----
    var potG = new THREE.LatheGeometry([[0, 0.01], [0.11, 0.01], [0.15, 0.24], [0.17, 0.25], [0.175, 0.29], [0.155, 0.3], [0.15, 0.27], [0, 0.27]].map(function (v) { return new THREE.Vector2(v[0], v[1]); }), 28), potM = new THREE.MeshStandardMaterial({ color: 0xc06a44, roughness: 0.85 });
    var leafG = new THREE.PlaneGeometry(0.05, 0.42, 1, 8), lp = leafG.attributes.position; for (i = 0; i < lp.count; i++) { var ly = lp.getY(i) + 0.21, t = ly / 0.42; lp.setX(i, lp.getX(i) * (1 - t) * 1.2); lp.setY(i, ly); lp.setZ(i, t * t * 0.14); } leafG.computeVertexNormals();
    var leafM = new THREE.MeshStandardMaterial({ color: 0x5f9a62, side: THREE.DoubleSide, roughness: 0.55 }), leafM2 = new THREE.MeshStandardMaterial({ color: 0x7aae78, side: THREE.DoubleSide, roughness: 0.55 });
    [[-0.95, FZ - 0.22], [0.95, FZ - 0.22]].forEach(function (pp) { var pot = G(sg, pp[0], 0, pp[1], rnd() * 6);
      P(pot, new THREE.CylinderGeometry(0.17, 0.15, 0.025, 24), potM, 0, 0.012, 0); P(pot, potG, potM, 0, 0.0, 0); P(pot, new THREE.CircleGeometry(0.148, 20), rMat(0x3a2a1e, { roughness: 1 }), 0, 0.268, 0, -Math.PI / 2, 0, 0);
      for (var lf = 0; lf < 14; lf++) { var la = lf * 2.4, tilt = 0.25 + (lf % 3) * 0.25, leaf = G(pot, 0, 0.27, 0, la); var m = P(leaf, leafG, lf % 2 ? leafM : leafM2, 0, 0, 0.02, -tilt, 0, 0); m.scale.setScalar(0.75 + (lf % 4) * 0.12); } });   // (a rosette of curving leaves)

    // ---- at night the lantern is lit, its candle flickering ----
    updateCarpenter = (function (base) { return function (t, night) { base.apply(this, arguments); var nt = night || 0, fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 7.3);
      lanGlowM.emissiveIntensity = 0.2 + nt * 1.4 * fl; flame.visible = nt > 0.15; flame.scale.y = fl; }; })(updateCarpenter);
  })();
});
