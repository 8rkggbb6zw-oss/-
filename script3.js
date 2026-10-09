// Everdawn, part 3 of 3 (see the note at the top of script.js)

EVERDAWN_PARTS.push(function (THREE) {
  siBaskets.forEach(function (b) {                                     // woven baskets of seed packets, and linen boxes with brass label holders
    var bx = b[0], by = b[1], bz = b[2];
    if (b[4] % 2 === 0) {
      var bt = siWickerTex.clone(); bt.needsUpdate = true; bt.repeat.set(4, 1);
      var bm = new THREE.MeshStandardMaterial({ map: bt, roughness: 0.95, side: THREE.DoubleSide });
      siPart(new THREE.CylinderGeometry(0.17, 0.14, 0.15, 16, 1, true), bm, bx, by + 0.075, bz);
      siPart(new THREE.CircleGeometry(0.14, 16), bm, bx, by + 0.004, bz, -Math.PI / 2);
      siPart(new THREE.TorusGeometry(0.17, 0.012, 6, 24), new THREE.MeshStandardMaterial({ color: 0x8a6438, roughness: 0.9 }), bx, by + 0.15, bz, Math.PI / 2, 0, 0);
      for (var bk = 0; bk < 7; bk++) siPart(new THREE.BoxGeometry(0.1, 0.13, 0.01), siPacketMats[(bk + b[4]) % SI_PACKETS.length], bx + (bk % 4 - 1.5) * 0.06, by + 0.14, bz + (bk < 4 ? 0.03 : -0.04), (bk % 2 ? 0.2 : -0.15), (bk - 3) * 0.12, 0);
      [-1, 1].forEach(function (sd) { siPart(new THREE.TorusGeometry(0.035, 0.008, 5, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0x8a6438, roughness: 0.9 }), bx + sd * 0.17, by + 0.13, bz, 0, Math.PI / 2, 0); });
    } else {
      siPart(new THREE.BoxGeometry(0.36, 0.17, 0.3), siLinen, bx, by + 0.085, bz);
      siPart(new THREE.BoxGeometry(0.37, 0.03, 0.31), new THREE.MeshStandardMaterial({ color: 0xded5c3, roughness: 0.95 }), bx, by + 0.17, bz);
      siPart(new THREE.BoxGeometry(0.1, 0.05, 0.006), SI.brass, bx, by + 0.1, bz + 0.153);
      siPart(new THREE.PlaneGeometry(0.08, 0.035), new THREE.MeshStandardMaterial({ map: siJarLabelTex, roughness: 0.9 }), bx, by + 0.1, bz + 0.157);
    }
  });

  // spinner racks of seed packets, and a little black table with an orchid, between the shelves and the counter
  var siRacks = [];
  [[-0.95, -3.35], [-0.2, -3.25]].forEach(function (rp, n) {
    var rack = new THREE.Group(); rack.position.set(rp[0], 0, rp[1]); shopRoom.add(rack); siRacks.push(rack);
    siPart(new THREE.CylinderGeometry(0.22, 0.24, 0.03, 18), SI.black, 0, 0.015, 0, 0, 0, 0, rack);
    siPart(new THREE.CylinderGeometry(0.015, 0.015, 1.83, 8), SI.black, 0, 0.915, 0, 0, 0, 0, rack);
    siPart(new THREE.SphereGeometry(0.03, 8, 6), SI.brass, 0, 1.99, 0, 0, 0, 0, rack);
    for (var t = 0; t < 6; t++) for (var f = 0; f < 4; f++) {           // wire pockets, each holding a couple of seed packets
      var fa = f / 4 * Math.PI * 2, py = 0.65 + t * 0.2, pmat = siPacketMats[(t * 2 + f + n * 3) % SI_PACKETS.length];
      [0, 1].forEach(function (pp) {
        var pocket = siPart(new THREE.BoxGeometry(0.14, 0.18, 0.008), pmat, Math.sin(fa) * (0.1 - pp * 0.015), py + pp * 0.008, Math.cos(fa) * (0.1 - pp * 0.015), 0, 0, 0, rack);
        pocket.rotation.order = 'YXZ'; pocket.rotation.set(-0.14, fa, 0);
      });
      siPart(new THREE.BoxGeometry(0.16, 0.008, 0.035), SI.black, Math.sin(fa) * 0.12, py - 0.085, Math.cos(fa) * 0.12, 0, fa, 0, rack);
      [-1, 1].forEach(function (sd) {                                   // the wire sides of the pocket
        var ox = Math.cos(fa) * sd * 0.075, oz = -Math.sin(fa) * sd * 0.075;
        siPart(new THREE.BoxGeometry(0.004, 0.09, 0.004), SI.black, Math.sin(fa) * 0.13 + ox, py - 0.045, Math.cos(fa) * 0.13 + oz, 0, fa, 0, rack);
      });
      siPart(new THREE.BoxGeometry(0.16, 0.004, 0.004), SI.black, Math.sin(fa) * 0.135, py - 0.01, Math.cos(fa) * 0.135, 0, fa, 0, rack);
    }
    var signTex = paintTexture(128, 64, function (g, w, h) {          // a little sign on top of the rack
      g.fillStyle = '#2f2a33'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#d9a84e'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = '#f2e6c8'; g.textAlign = 'center'; g.font = 'italic bold 22px Georgia, serif'; g.fillText(n ? 'Flowers' : 'Seeds', w / 2, 40);
    });
    var signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6, side: THREE.DoubleSide });
    siPart(new THREE.PlaneGeometry(0.26, 0.13), signMat, 0, 1.9, 0, 0, 0, 0, rack);
    siPart(new THREE.PlaneGeometry(0.26, 0.13), signMat, 0, 1.9, 0, 0, Math.PI / 2, 0, rack);
    siPart(new THREE.CylinderGeometry(0.012, 0.012, 0.04, 6), SI.brass, 0, 1.83, 0, 0, 0, 0, rack);
    shopInSolids.push([rp[0], rp[1], 0.3]);
  });
  siPart(new THREE.BoxGeometry(0.45, 0.03, 0.45), SI.black, 0.6, 0.7, -3.4);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) { siPart(new THREE.BoxGeometry(0.03, 0.7, 0.03), SI.black, 0.6 + c[0] * 0.2, 0.35, -3.4 + c[1] * 0.2); });
  siOrchid(0.6, -3.4, 0.715, 1.2);
  shopInSolids.push([0.6, -3.4, 0.35]);

  // behind the counter: a dark green cabinet with pastel boxes on top, under a black steel-grid glass screen
  var BC_X0 = 1.2, BC_X1 = SIN_W / 2 - 0.05, BC_W = BC_X1 - BC_X0, BC_MID = (BC_X0 + BC_X1) / 2, BC_Z = SNW + 0.3;
  siPart(new THREE.BoxGeometry(BC_W, 1.0, 0.56), SI.green, BC_MID, 0.5, BC_Z);
  siPart(new THREE.BoxGeometry(BC_W + 0.04, 0.04, 0.6), SI.marble, BC_MID, 1.02, BC_Z);
  for (var siBd = 0; siBd < 3; siBd++) {                               // cabinet doors with slim brass pulls
    var dxm = BC_X0 + (siBd + 0.5) * BC_W / 3;
    siPart(new THREE.BoxGeometry(BC_W / 3 - 0.08, 0.82, 0.02), new THREE.MeshStandardMaterial({ color: 0x2c4538, roughness: 0.5 }), dxm, 0.5, BC_Z + 0.285);
    siPart(new THREE.BoxGeometry(0.2, 0.02, 0.03), SI.brass, dxm, 0.82, BC_Z + 0.3);
  }
  [0xc8d6b0, 0xf1e6d0, 0xf0c7a8].forEach(function (c, k) {              // sage, cream and peach storage boxes
    siPart(new THREE.BoxGeometry(BC_W / 3 - 0.06, 0.32, 0.4), new THREE.MeshStandardMaterial({ color: c, roughness: 0.85 }), BC_X0 + (k + 0.5) * BC_W / 3, 1.2, BC_Z - 0.04);
  });
  var GRID_Y0 = 1.4, GRID_Y1 = 3.4, gridMid = (GRID_Y0 + GRID_Y1) / 2;
  siPart(new THREE.PlaneGeometry(BC_W, GRID_Y1 - GRID_Y0), new THREE.MeshStandardMaterial({ color: 0xdfe8ea, roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.55 }), BC_MID, gridMid, SNW + 0.14);
  for (var gx = 0; gx <= 6; gx++) siPart(new THREE.BoxGeometry(0.05, GRID_Y1 - GRID_Y0, 0.05), SI.black, BC_X0 + gx * BC_W / 6, gridMid, SNW + 0.16);
  for (var gy = 0; gy <= 4; gy++) siPart(new THREE.BoxGeometry(BC_W, 0.05, 0.05), SI.black, BC_MID, GRID_Y0 + gy * (GRID_Y1 - GRID_Y0) / 4, SNW + 0.16);
  for (var siBs = 0; siBs < 5; siBs++) shopInSolids.push([BC_X0 + 0.4 + siBs * (BC_W - 0.8) / 4, BC_Z, 0.4]);

  // the counter: white marble tiles on the front and sides, a black top, a till, a white flower, amber bottles and a bowl
  siPart(new THREE.BoxGeometry(CNT_W, 0.95, 0.62), SI.marble, CNT_X, 0.475, CNT_Z);
  siPart(new THREE.BoxGeometry(CNT_W + 0.08, 0.06, 0.72), SI.black, CNT_X, 0.98, CNT_Z + 0.02);
  siPart(new THREE.BoxGeometry(CNT_W - 0.04, 0.06, 0.58), SI.black, CNT_X, 0.03, CNT_Z);
  // ---- things on the counter
  var CT = 1.01;                                                       // the top of the counter
  var ctSteel = new THREE.MeshStandardMaterial({ color: 0xd2d4d8, metalness: 0.8, roughness: 0.28 });
  var ctDark = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.4, metalness: 0.2 });
  // the till: a tablet on a swivel stand, showing the shop's seed menu, with a card reader and a receipt printer
  var ctScreenTex = paintTexture(256, 176, function (g, w, h) {
    g.fillStyle = '#f7f4fb'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5a3d8a'; g.fillRect(0, 0, w, 26);
    g.fillStyle = '#f7d36a'; g.font = 'italic bold 15px Georgia, serif'; g.fillText('Whimsy & Bloom', 10, 18);
    g.fillStyle = '#ffffff'; g.font = '11px sans-serif'; g.textAlign = 'right'; g.fillText('11:00', w - 10, 17); g.textAlign = 'left';
    var tiles = [['#f6d9e2', '#e98ab6', 'Moonbloom'], ['#ece4f6', '#a98ad8', 'Starbell'], ['#f8ead6', '#f0965a', 'Dawn Poppy'], ['#e2efdc', '#8cc76a', 'Glowcress'], ['#f4f2ec', '#c9c3e6', 'Mistlily'], ['#efe6d8', '#b08a5a', 'Tonic']];
    tiles.forEach(function (t, i) {
      var x = 8 + (i % 3) * 56, y = 34 + Math.floor(i / 3) * 62;
      g.fillStyle = t[0]; g.fillRect(x, y, 50, 54);
      g.fillStyle = t[1]; g.beginPath(); g.arc(x + 25, y + 22, 12, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x + 25, y + 22, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3a2a4a'; g.font = '8px sans-serif'; g.textAlign = 'center'; g.fillText(t[2], x + 25, y + 47); g.textAlign = 'left';
    });
    g.fillStyle = '#ffffff'; g.fillRect(178, 34, 70, 116); g.strokeStyle = '#ddd5e8'; g.strokeRect(178, 34, 70, 116);
    g.fillStyle = '#3a2a4a'; g.font = 'bold 10px sans-serif'; g.fillText('Order', 184, 48);
    g.font = '9px sans-serif'; g.fillText('Moonbloom x5', 184, 64); g.fillText('Tonic x1', 184, 78);
    g.fillStyle = '#ddd5e8'; g.fillRect(184, 112, 58, 1);
    g.fillStyle = '#3a2a4a'; g.font = 'bold 10px sans-serif'; g.fillText('Total 58', 184, 126);
    g.fillStyle = '#7a5cc8'; g.fillRect(184, 132, 58, 14); g.fillStyle = '#fff'; g.font = 'bold 9px sans-serif'; g.fillText('PAY', 203, 143);
  });
  var till = new THREE.Group(); till.position.set(CNT_X + 0.6, CT, CNT_Z - 0.1); till.rotation.y = -0.3; shopRoom.add(till);
  siPart(new THREE.CylinderGeometry(0.075, 0.085, 0.015, 24), ctSteel, 0, 0.008, -0.03, 0, 0, 0, till);           // the round base
  siPart(new THREE.CylinderGeometry(0.018, 0.022, 0.17, 12), ctSteel, 0, 0.1, -0.03, 0, 0, 0, till);               // the neck
  siPart(new THREE.SphereGeometry(0.03, 12, 8), ctSteel, 0, 0.19, -0.03, 0, 0, 0, till);                            // the swivel
  var tab = new THREE.Group(); tab.position.set(0, 0.29, -0.01); tab.rotation.x = -0.35; till.add(tab);
  siPart(new THREE.BoxGeometry(0.38, 0.27, 0.014), ctDark, 0, 0, 0, 0, 0, 0, tab);
  siPart(new THREE.BoxGeometry(0.39, 0.28, 0.008), ctSteel, 0, 0, -0.008, 0, 0, 0, tab);
  siPart(new THREE.PlaneGeometry(0.35, 0.24), new THREE.MeshStandardMaterial({ map: ctScreenTex, emissive: 0xffffff, emissiveMap: ctScreenTex, emissiveIntensity: 0.6, roughness: 0.15 }), 0, 0, 0.0075, 0, 0, 0, tab);
  siPart(new THREE.SphereGeometry(0.003, 6, 4), ctSteel, 0, 0.127, 0.008, 0, 0, 0, tab);                           // the camera dot
  var ctKeyTex = paintTexture(64, 112, function (g, w, h) {             // a card reader: little screen and keypad
    g.fillStyle = '#26262a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#9fd0b8'; g.fillRect(8, 8, w - 16, 26); g.fillStyle = '#1d3a2a'; g.font = 'bold 10px sans-serif'; g.fillText('58 ✦', 14, 25);
    for (var k = 0; k < 12; k++) { g.fillStyle = k === 9 ? '#c84a4a' : k === 11 ? '#4aa86a' : '#4a4a50'; g.fillRect(8 + (k % 3) * 17, 42 + Math.floor(k / 3) * 16, 13, 12); }
  });
  var reader = new THREE.Group(); reader.position.set(CNT_X + 0.4, CT, CNT_Z + 0.22); reader.rotation.set(0, 0.25, 0); shopRoom.add(reader);
  siPart(new THREE.BoxGeometry(0.07, 0.022, 0.12), ctDark, 0, 0.011, 0, 0, 0, 0, reader);                          // its cradle
  var rbody = siPart(new THREE.BoxGeometry(0.065, 0.016, 0.115), ctDark, 0, 0.035, -0.01, -0.45, 0, 0, reader);
  siPart(new THREE.PlaneGeometry(0.058, 0.1), new THREE.MeshStandardMaterial({ map: ctKeyTex, roughness: 0.4 }), 0, 0.0085, 0, -Math.PI / 2, 0, 0, rbody);
  var printer = new THREE.Group(); printer.position.set(CNT_X + 1.0, CT, CNT_Z - 0.15); printer.rotation.y = -0.2; shopRoom.add(printer);   // the receipt printer, with a curl of paper
  siPart(new THREE.BoxGeometry(0.13, 0.09, 0.15), new THREE.MeshStandardMaterial({ color: 0xf2f0ec, roughness: 0.5 }), 0, 0.045, 0, 0, 0, 0, printer);
  siPart(new THREE.BoxGeometry(0.135, 0.012, 0.09), ctDark, 0, 0.096, -0.02, 0.1, 0, 0, printer);
  siPart(new THREE.CylinderGeometry(0.035, 0.035, 0.1, 16, 1, true, 0, Math.PI * 1.3), new THREE.MeshStandardMaterial({ color: 0xfbfaf6, roughness: 0.9, side: THREE.DoubleSide }), 0, 0.12, 0.05, 0, 0, Math.PI / 2, printer);
  siPart(new THREE.SphereGeometry(0.004, 6, 4), new THREE.MeshBasicMaterial({ color: 0x44ff88 }), 0.05, 0.07, 0.076, 0, 0, 0, printer);
  // a turned wooden bowl of seed pods, with a little brass scoop
  var ctBowlGeo = new THREE.LatheGeometry([[0, 0], [0.06, 0], [0.065, 0.006], [0.1, 0.03], [0.128, 0.065], [0.132, 0.08], [0.122, 0.08], [0.116, 0.065], [0.09, 0.034], [0.05, 0.016], [0, 0.014]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 32);
  var ctGrainTex = paintTexture(256, 32, function (g, w, h) {
    g.fillStyle = '#9a6a42'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 40; i++) { g.strokeStyle = isle2Hash(i) > 0.5 ? 'rgba(70,40,20,0.35)' : 'rgba(200,150,100,0.3)'; g.lineWidth = 1 + isle2Hash(i * 3) * 2; g.beginPath(); var y = isle2Hash(i * 7) * h; g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y); g.stroke(); }
  });
  ctGrainTex.wrapS = THREE.RepeatWrapping;
  siPart(ctBowlGeo, new THREE.MeshStandardMaterial({ map: ctGrainTex, roughness: 0.45, side: THREE.DoubleSide }), CNT_X - 0.1, CT, CNT_Z + 0.05);
  var ctPodMat = new THREE.MeshStandardMaterial({ color: 0x6a4030, roughness: 0.55 }), ctPodMat2 = new THREE.MeshStandardMaterial({ color: 0x8a5a38, roughness: 0.55 });
  for (var siPod = 0; siPod < 14; siPod++) {                          // seed pods: plump, ridged, with a curly tip
    var pa = siPod * 2.4, pr = siPod < 6 ? 0.03 : siPod < 12 ? 0.065 : 0.0, py = CT + 0.05 + (siPod < 6 ? 0.03 : siPod < 12 ? 0.012 : 0.05);
    var pod = new THREE.Group(); pod.position.set(CNT_X - 0.1 + Math.cos(pa) * pr, py, CNT_Z + 0.05 + Math.sin(pa) * pr); pod.rotation.set(isle2Hash(siPod) * 1.2, pa, 0.6 + isle2Hash(siPod * 3)); shopRoom.add(pod);
    siPart(new THREE.SphereGeometry(0.026, 10, 8), siPod % 2 ? ctPodMat : ctPodMat2, 0, 0, 0, 0, 0, 0, pod).scale.set(0.8, 1.25, 0.8);
    for (var rg = 0; rg < 4; rg++) siPart(new THREE.TorusGeometry(0.0215, 0.0025, 4, 12, Math.PI), ctPodMat, 0, 0, 0, 0, rg * Math.PI / 4, 0, pod).scale.set(1, 1.5, 1);
    siPart(new THREE.ConeGeometry(0.006, 0.025, 6), new THREE.MeshStandardMaterial({ color: 0x4a7a3a }), 0, 0.04, 0, 0.3, 0, 0, pod);
  }
  var scoop = new THREE.Group(); scoop.position.set(CNT_X + 0.04, CT + 0.065, CNT_Z + 0.08); scoop.rotation.set(0, 0.5, -0.45); shopRoom.add(scoop);
  siPart(new THREE.SphereGeometry(0.028, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), SI.brass, 0, 0, 0, 0, 0, Math.PI / 2, scoop).material = new THREE.MeshStandardMaterial({ color: 0xd4a84e, metalness: 0.8, roughness: 0.3, side: THREE.DoubleSide });
  siPart(new THREE.CylinderGeometry(0.005, 0.006, 0.1, 8), SI.wood, 0.075, 0, 0, 0, 0, Math.PI / 2, scoop);
  // a white peace lily in a ceramic pot: long stems, glossy pointed leaves with a midrib, and white hooded flowers
  var lilyX = CNT_X - 1.05, lilyZ = CNT_Z - 0.05;
  siPart(new THREE.LatheGeometry([[0, 0], [0.085, 0], [0.09, 0.01], [0.11, 0.17], [0.118, 0.19], [0.118, 0.205], [0.108, 0.205], [0.104, 0.19], [0, 0.19]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 28), new THREE.MeshStandardMaterial({ color: 0xf6f4f0, roughness: 0.3 }), lilyX, CT, lilyZ);
  siPart(new THREE.CircleGeometry(0.104, 20), new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 1 }), lilyX, CT + 0.188, lilyZ, -Math.PI / 2);
  var lilyLeafTex = paintTexture(64, 160, function (g, w, h) {
    g.beginPath(); g.moveTo(w / 2, h); g.bezierCurveTo(0, h * 0.7, 2, h * 0.25, w / 2, 0); g.bezierCurveTo(w - 2, h * 0.25, w, h * 0.7, w / 2, h); g.closePath();
    var lg = g.createLinearGradient(0, 0, w, 0); lg.addColorStop(0, '#1f4a1c'); lg.addColorStop(0.5, '#3f7a34'); lg.addColorStop(1, '#244f20');
    g.fillStyle = lg; g.fill();
    g.save(); g.clip();
    g.strokeStyle = 'rgba(160,210,130,0.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 4); g.stroke();
    g.strokeStyle = 'rgba(140,190,110,0.3)'; g.lineWidth = 1;
    for (var v = 0; v < 10; v++) { var vy = h - 12 - v * 14; [-1, 1].forEach(function (d) { g.beginPath(); g.moveTo(w / 2, vy); g.quadraticCurveTo(w / 2 + d * 14, vy - 10, w / 2 + d * 26, vy - 26); g.stroke(); }); }
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(w / 2 - 12, 0, 8, h);
    g.restore();
  });
  var lilyLeafMat = new THREE.MeshStandardMaterial({ map: lilyLeafTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.3 });
  var lilyLeafGeo = new THREE.PlaneGeometry(1, 1, 2, 6); lilyLeafGeo.translate(0, 0.5, 0);
  (function () { var lp = lilyLeafGeo.attributes.position; for (var i = 0; i < lp.count; i++) lp.setZ(i, -lp.getX(i) * lp.getX(i) * 0.6 + lp.getY(i) * lp.getY(i) * 0.25); lilyLeafGeo.computeVertexNormals(); })();
  var lilySpathe = new THREE.MeshStandardMaterial({ color: 0xfbfaf4, roughness: 0.35, side: THREE.DoubleSide });
  for (var siLf = 0; siLf < 12; siLf++) {
    var la = siLf * 2.39, lean = 0.35 + isle2Hash(siLf) * 0.35, sl = 0.16 + isle2Hash(siLf * 3) * 0.12;
    var stem = new THREE.Group(); stem.position.set(lilyX, CT + 0.19, lilyZ); stem.rotation.order = 'YXZ'; stem.rotation.set(lean * 0.5, la, 0); shopRoom.add(stem);
    siPart(new THREE.CylinderGeometry(0.004, 0.006, sl, 5), SI.leaf, 0, sl / 2, 0, 0, 0, 0, stem);
    var leaf = siPart(lilyLeafGeo, lilyLeafMat, 0, sl, 0, lean, 0, 0, stem);
    leaf.scale.set(0.07 + isle2Hash(siLf * 5) * 0.02, 0.17 + isle2Hash(siLf * 7) * 0.05, 0.07);
  }
  for (var siFl = 0; siFl < 3; siFl++) {                              // the flowers: a white hood curling round a creamy spike, on a tall stem
    var fa = siFl * 2.1 + 0.4, fh = 0.36 + siFl * 0.05;
    var fl = new THREE.Group(); fl.position.set(lilyX, CT + 0.19, lilyZ); fl.rotation.set(0.18, fa, 0); shopRoom.add(fl);
    siPart(new THREE.CylinderGeometry(0.003, 0.004, fh, 5), SI.leaf, 0, fh / 2, 0, 0, 0, 0, fl);
    var lilyHood = siPart(new THREE.SphereGeometry(0.045, 14, 10, 0, Math.PI * 1.25, 0, Math.PI * 0.75), lilySpathe, 0, fh + 0.045, 0, 0, Math.PI * 0.4, 0, fl);
    lilyHood.scale.set(0.75, 1.45, 0.45);
    siPart(new THREE.CylinderGeometry(0.008, 0.01, 0.055, 8), new THREE.MeshStandardMaterial({ color: 0xf2ecc8, roughness: 0.8 }), 0, fh + 0.035, 0.01, 0, 0, 0, fl);
  }
  // little apothecary bottles of bloom tonic with labels and droppers
  for (var siAb = 0; siAb < 3; siAb++) {
    var ab = new THREE.Group(); ab.position.set(CNT_X + 1.25 - siAb * 0.1, CT, CNT_Z + 0.17); ab.scale.setScalar(0.62); ab.rotation.y = -0.4 + siAb * 0.3; shopRoom.add(ab);
    siPart(siBottleGeo, SI.amber, 0, 0, 0, 0, 0, 0, ab);
    siPart(new THREE.CylinderGeometry(0.0515, 0.0515, 0.075, 18, 1, true), new THREE.MeshStandardMaterial({ map: siTonicTex, roughness: 0.85 }), 0, 0.095, 0, 0, 0, 0, ab);
    siPart(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12), SI.black, 0, 0.245, 0, 0, 0, 0, ab);
    siPart(new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshStandardMaterial({ color: 0x1e1e20, roughness: 0.45 }), 0, 0.27, 0, 0, 0, 0, ab).scale.set(1, 1.5, 1);
  }
  // the big jar of glowing moon seeds, with a cork lid tied with twine and a kraft label
  var siBigJar = siPart(new THREE.CylinderGeometry(0.098, 0.098, 0.16, 24), new THREE.MeshStandardMaterial({ map: siSeedTex, color: 0xe2c8ff, emissive: 0xa45cff, emissiveMap: siSeedTex, emissiveIntensity: 0.6, roughness: 0.7 }), CNT_X + 0.15, CT + 0.085, CNT_Z + 0.12);
  siPart(new THREE.CylinderGeometry(0.098, 0.098, 0.004, 24), new THREE.MeshStandardMaterial({ map: siSeedTex, color: 0xe2c8ff, emissive: 0xa45cff, emissiveIntensity: 0.4 }), CNT_X + 0.15, CT + 0.166, CNT_Z + 0.12);
  siPart(new THREE.LatheGeometry([[0, 0], [0.1, 0], [0.11, 0.01], [0.11, 0.24], [0.1, 0.26], [0.085, 0.27], [0.085, 0.29]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 32), SI.glass, CNT_X + 0.15, CT, CNT_Z + 0.12).castShadow = false;
  siPart(new THREE.CylinderGeometry(0.083, 0.078, 0.05, 24), new THREE.MeshStandardMaterial({ color: 0xb48a5e, roughness: 0.95 }), CNT_X + 0.15, CT + 0.305, CNT_Z + 0.12);   // the cork
  siPart(new THREE.TorusGeometry(0.087, 0.004, 6, 32), new THREE.MeshStandardMaterial({ color: 0xc9b08a, roughness: 1 }), CNT_X + 0.15, CT + 0.28, CNT_Z + 0.12, Math.PI / 2, 0, 0);   // twine
  siPart(new THREE.TorusGeometry(0.087, 0.004, 6, 32), new THREE.MeshStandardMaterial({ color: 0xc9b08a, roughness: 1 }), CNT_X + 0.15, CT + 0.272, CNT_Z + 0.12, Math.PI / 2, 0, 0);
  siPart(new THREE.CylinderGeometry(0.1115, 0.1115, 0.07, 32, 1, true, -0.7, 1.4), new THREE.MeshStandardMaterial({ map: siJarLabelTex, roughness: 0.9, side: THREE.DoubleSide }), CNT_X + 0.15, CT + 0.13, CNT_Z + 0.12);
  // a brass service bell, and a leather ledger with a pen
  siPart(new THREE.CylinderGeometry(0.045, 0.05, 0.012, 20), new THREE.MeshStandardMaterial({ color: 0x3a2a20, roughness: 0.5 }), CNT_X - 0.55, CT + 0.006, CNT_Z + 0.2);
  siPart(new THREE.SphereGeometry(0.04, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), SI.brass, CNT_X - 0.55, CT + 0.012, CNT_Z + 0.2).scale.set(1, 0.85, 1);
  siPart(new THREE.CylinderGeometry(0.004, 0.006, 0.02, 8), SI.brass, CNT_X - 0.55, CT + 0.055, CNT_Z + 0.2);
  siPart(new THREE.SphereGeometry(0.008, 10, 8), SI.brass, CNT_X - 0.55, CT + 0.068, CNT_Z + 0.2);
  var ledger = new THREE.Group(); ledger.position.set(CNT_X - 0.55, CT, CNT_Z - 0.12); ledger.rotation.y = 0.25; shopRoom.add(ledger);
  var ldTex = paintTexture(128, 96, function (g, w, h) {
    g.fillStyle = '#f6f0e2'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(w / 2 - 1, 0, 2, h);
    g.strokeStyle = 'rgba(120,150,200,0.45)'; g.lineWidth = 0.8; for (var y = 12; y < h; y += 8) { g.beginPath(); g.moveTo(4, y); g.lineTo(w - 4, y); g.stroke(); }
    g.strokeStyle = 'rgba(60,40,90,0.7)'; g.lineWidth = 1;
    for (var r = 0; r < 9; r++) [6, w / 2 + 6].forEach(function (x0) { g.beginPath(); g.moveTo(x0, 10 + r * 8); for (var x = 0; x < 30 + isle2Hash(r + x0) * 20; x += 3) g.lineTo(x0 + x, 10 + r * 8 + Math.sin(x * 1.3 + r) * 1.2); g.stroke(); });
  });
  siPart(new THREE.BoxGeometry(0.3, 0.012, 0.22), new THREE.MeshStandardMaterial({ color: 0x6a2f36, roughness: 0.6 }), 0, 0.006, 0, 0, 0, 0, ledger);
  siPart(new THREE.BoxGeometry(0.29, 0.01, 0.21), new THREE.MeshStandardMaterial({ color: 0xf2ecdc, roughness: 0.9 }), 0, 0.016, 0, 0, 0, 0, ledger);
  siPart(new THREE.PlaneGeometry(0.28, 0.2), new THREE.MeshStandardMaterial({ map: ldTex, roughness: 0.9 }), 0, 0.0215, 0, -Math.PI / 2, 0, 0, ledger);
  siPart(new THREE.BoxGeometry(0.005, 0.003, 0.2), new THREE.MeshStandardMaterial({ color: 0x8a2a3a }), 0.02, 0.023, 0.02, 0, 0, 0, ledger);   // the ribbon
  siPart(new THREE.CylinderGeometry(0.005, 0.005, 0.15, 8), SI.black, 0.08, 0.03, -0.02, Math.PI / 2, 0.5, 0, ledger);
  siPart(new THREE.ConeGeometry(0.005, 0.02, 8), SI.brass, 0.08 - Math.sin(0.5) * 0.085, 0.03, -0.02 - Math.cos(0.5) * 0.085, -Math.PI / 2, 0.5, 0, ledger);
  // a stack of kraft paper seed bags and a spool of twine, ready for wrapping
  for (var siKb = 0; siKb < 5; siKb++) siPart(new THREE.BoxGeometry(0.16, 0.006, 0.22), new THREE.MeshStandardMaterial({ color: siKb % 2 ? 0xc9a678 : 0xbf9a6a, roughness: 0.95 }), CNT_X + 0.62, CT + 0.003 + siKb * 0.006, CNT_Z + 0.2, 0, (isle2Hash(siKb) - 0.5) * 0.15, 0);
  siPart(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xd2bc94, roughness: 1 }), CNT_X + 0.88, CT + 0.025, CNT_Z + 0.24);
  siPart(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 16), SI.wood, CNT_X + 0.88, CT + 0.003, CNT_Z + 0.24);
  siPart(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 16), SI.wood, CNT_X + 0.88, CT + 0.053, CNT_Z + 0.24);
  for (var siC = CNT_X - 1.0; siC <= CNT_X + 1.01; siC += 0.67) shopInSolids.push([siC, CNT_Z, 0.45]);

  // a walnut side table with a soft-cornered top, tapered legs on brass feet and a slatted shelf, and an upholstered stool
  var STX = 4.4, STZ = 0.5, ST_H = 0.86;
  var stWalnutTex = ctGrainTex.clone(); stWalnutTex.needsUpdate = true; stWalnutTex.wrapS = stWalnutTex.wrapT = THREE.RepeatWrapping; stWalnutTex.repeat.set(1.2, 6);
  var stWalnut = new THREE.MeshStandardMaterial({ map: stWalnutTex, color: 0x8a5a3c, roughness: 0.38 });
  var stWalnutPlain = new THREE.MeshStandardMaterial({ color: 0x5e3a24, roughness: 0.45 });
  var stBrass = new THREE.MeshStandardMaterial({ color: 0xd8b062, metalness: 0.85, roughness: 0.25 });
  var stTopShape = new THREE.Shape(), stTW = 0.4, stTD = 0.27, stTR = 0.06;
  stTopShape.moveTo(-stTW + stTR, -stTD); stTopShape.lineTo(stTW - stTR, -stTD); stTopShape.quadraticCurveTo(stTW, -stTD, stTW, -stTD + stTR); stTopShape.lineTo(stTW, stTD - stTR); stTopShape.quadraticCurveTo(stTW, stTD, stTW - stTR, stTD);
  stTopShape.lineTo(-stTW + stTR, stTD); stTopShape.quadraticCurveTo(-stTW, stTD, -stTW, stTD - stTR); stTopShape.lineTo(-stTW, -stTD + stTR); stTopShape.quadraticCurveTo(-stTW, -stTD, -stTW + stTR, -stTD);
  var stTopGeo = new THREE.ExtrudeGeometry(stTopShape, { depth: 0.025, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 3, curveSegments: 8 });
  stTopGeo.rotateX(-Math.PI / 2);
  (function () { var uv = stTopGeo.attributes.uv; for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1.2, uv.getY(i) * 1.2); })();
  siPart(stTopGeo, stWalnut, STX, ST_H - 0.025, STZ);
  [[0, -0.22, 0.66, 0.012], [0, 0.22, 0.66, 0.012]].forEach(function (r) { siPart(new THREE.BoxGeometry(r[2], 0.07, 0.022), stWalnutPlain, STX + r[0], ST_H - 0.07, STZ + r[1]); });   // the aprons under the top
  [-1, 1].forEach(function (sd) { siPart(new THREE.BoxGeometry(0.022, 0.07, 0.4), stWalnutPlain, STX + sd * 0.33, ST_H - 0.07, STZ); });
  siPart(new THREE.BoxGeometry(0.008, 0.02, 0.005), stBrass, STX, ST_H - 0.07, STZ + 0.233);       // a little brass drawer pull
  siPart(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 12), stBrass, STX, ST_H - 0.07, STZ + 0.237, Math.PI / 2, 0, 0);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) {          // tapered legs, slightly splayed, on brass feet
    var lx = STX + c[0] * 0.33, lz = STZ + c[1] * 0.2;
    siPart(new THREE.CylinderGeometry(0.022, 0.013, ST_H - 0.1, 10), stWalnutPlain, lx + c[0] * 0.01, (ST_H - 0.1) / 2 + 0.03, lz + c[1] * 0.01, c[1] * 0.025, 0, -c[0] * 0.025);
    siPart(new THREE.CylinderGeometry(0.015, 0.014, 0.035, 10), stBrass, lx + c[0] * 0.02, 0.018, lz + c[1] * 0.02);
  });
  for (var stSl = 0; stSl < 6; stSl++) siPart(new THREE.BoxGeometry(0.62, 0.012, 0.05), stWalnut, STX, 0.26, STZ - 0.16 + stSl * 0.064);   // a slatted lower shelf
  [-1, 1].forEach(function (sd) { siPart(new THREE.BoxGeometry(0.02, 0.025, 0.4), stWalnutPlain, STX + sd * 0.32, 0.25, STZ); });
  var stool = new THREE.Group(); stool.position.set(STX - 0.8, 0, STZ + 0.35); stool.rotation.y = 0.3; shopRoom.add(stool);
  var stVelvet = new THREE.MeshStandardMaterial({ color: 0xc98a9c, roughness: 0.95 });
  var stCushion = new THREE.LatheGeometry([[0, 0], [0.17, 0], [0.182, 0.01], [0.188, 0.035], [0.18, 0.06], [0.15, 0.075], [0.08, 0.082], [0, 0.083]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 36);
  siPart(stCushion, stVelvet, 0, 0.6, 0, 0, 0, 0, stool);                                          // a plump velvet cushion
  siPart(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshStandardMaterial({ color: 0xa86478, roughness: 0.9 }), 0, 0.682, 0, 0, 0, 0, stool).scale.set(1, 0.4, 1);   // a covered button in the middle
  for (var stP = 0; stP < 36; stP++) { var pa2 = stP / 36 * Math.PI * 2; siPart(new THREE.SphereGeometry(0.006, 6, 4), stBrass, Math.cos(pa2) * 0.183, 0.612, Math.sin(pa2) * 0.183, 0, 0, 0, stool); }   // brass nailheads round the edge
  siPart(new THREE.CylinderGeometry(0.17, 0.16, 0.035, 32), stWalnut, 0, 0.583, 0, 0, 0, 0, stool);                                // the walnut seat frame
  for (var stL = 0; stL < 4; stL++) {                                  // four splayed tapered legs with brass feet
    var la2 = stL / 4 * Math.PI * 2 + Math.PI / 4, fx = Math.cos(la2), fz = Math.sin(la2);
    var leg = siPart(new THREE.CylinderGeometry(0.016, 0.01, 0.6, 10), stWalnutPlain, fx * 0.15, 0.29, fz * 0.15, 0, 0, 0, stool);
    leg.rotation.set(fz * 0.12, 0, -fx * 0.12);
    siPart(new THREE.CylinderGeometry(0.011, 0.011, 0.02, 8), stBrass, fx * 0.185, 0.01, fz * 0.185, 0, 0, 0, stool);
  }
  siPart(new THREE.TorusGeometry(0.165, 0.009, 8, 40), stBrass, 0, 0.2, 0, Math.PI / 2, 0, 0, stool);   // a brass foot ring
  shopInSolids.push([STX, STZ, 0.5], [STX - 0.8, STZ + 0.35, 0.25]);

  // a tall leafy plant in the front corner, and a framed print by the counter
  var siCornerX = SIN_W / 2 - 0.55, siCornerZ = SIN_D / 2 - 0.6;
  // an open white ceramic pot with a rim, and soil sitting down inside it
  var siPotMat = new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.35, side: THREE.DoubleSide });
  var siPotPts = [[0, 0.0], [0.2, 0.0], [0.215, 0.02], [0.27, 0.47], [0.285, 0.5], [0.285, 0.53], [0.265, 0.53], [0.252, 0.5], [0.205, 0.06], [0, 0.06]];
  siPart(new THREE.LatheGeometry(siPotPts.map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 32), siPotMat, siCornerX, 0, siCornerZ);
  var siSoilTex = paintTexture(128, 128, function (g, w, h) {
    g.fillStyle = '#3e2c1e'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 900; i++) { var l = isle2Hash(i * 1.9); g.fillStyle = l > 0.5 ? 'rgba(110,80,55,0.5)' : 'rgba(20,12,8,0.5)'; g.fillRect(isle2Hash(i) * w, isle2Hash(i * 2.7) * h, 1 + l * 2, 1 + l * 2); }
  });
  siPart(new THREE.CircleGeometry(0.25, 24), new THREE.MeshStandardMaterial({ map: siSoilTex, roughness: 1 }), siCornerX, 0.45, siCornerZ, -Math.PI / 2).castShadow = false;
  for (var siPb = 0; siPb < 7; siPb++) siPart(new THREE.SphereGeometry(0.018 + isle2Hash(siPb) * 0.012, 7, 5), new THREE.MeshStandardMaterial({ color: 0x8a8278, roughness: 0.9 }), siCornerX + Math.cos(siPb * 2.3) * (0.08 + isle2Hash(siPb * 3) * 0.12), 0.455, siCornerZ + Math.sin(siPb * 2.3) * (0.08 + isle2Hash(siPb * 3) * 0.12)).scale.set(1, 0.6, 1);
  // a fiddle-leaf fig: a slim, slightly crooked trunk with two branches, and big glossy violin-shaped leaves
  var siBarkMat = new THREE.MeshStandardMaterial({ color: 0x6e5a48, roughness: 0.9 });
  function siCurve(pts) { return new THREE.CatmullRomCurve3(pts.map(function (q) { return new THREE.Vector3(siCornerX + q[0], q[1], siCornerZ + q[2]); })); }
  var siTrunk = siCurve([[0, 0.44, 0], [0.025, 0.85, 0.01], [-0.01, 1.35, 0.03], [0.02, 1.95, 0.0]]);
  var siBranches = [siCurve([[0.0, 1.25, 0.03], [0.12, 1.45, 0.06], [0.24, 1.72, 0.1]]), siCurve([[0.02, 1.0, 0.02], [-0.1, 1.2, -0.05], [-0.2, 1.5, -0.12]])];
  siPart(new THREE.TubeGeometry(siTrunk, 24, 0.02, 7), siBarkMat, 0, 0, 0);
  siBranches.forEach(function (c) { siPart(new THREE.TubeGeometry(c, 12, 0.012, 6), siBarkMat, 0, 0, 0); });
  var siLeafTex = paintTexture(128, 192, function (g, w, h) {
    g.beginPath(); g.moveTo(64, 190);                                 // narrow at the stalk, broad and wavy near the tip
    g.bezierCurveTo(34, 172, 14, 124, 12, 84); g.bezierCurveTo(10, 34, 40, 8, 60, 12); g.quadraticCurveTo(64, 16, 68, 12);
    g.bezierCurveTo(88, 8, 118, 34, 116, 84); g.bezierCurveTo(114, 124, 94, 172, 64, 190); g.closePath();
    var lg2 = g.createRadialGradient(64, 90, 6, 64, 100, 80); lg2.addColorStop(0, '#47803a'); lg2.addColorStop(1, '#22451c');
    g.fillStyle = lg2; g.fill();
    g.save(); g.clip();
    g.strokeStyle = 'rgba(190,220,150,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(64, 190); g.quadraticCurveTo(62, 100, 64, 18); g.stroke();   // the pale midrib
    g.strokeStyle = 'rgba(170,205,135,0.35)'; g.lineWidth = 1.5;
    for (var v = 0; v < 7; v++) {                                      // veins curving out and up
      var vy = 170 - v * 22;
      [-1, 1].forEach(function (d) { g.beginPath(); g.moveTo(63, vy); g.quadraticCurveTo(64 + d * 26, vy - 10, 64 + d * 50, vy - 30); g.stroke(); });
    }
    var gloss = g.createLinearGradient(0, 0, w, h); gloss.addColorStop(0.2, 'rgba(255,255,255,0)'); gloss.addColorStop(0.4, 'rgba(255,255,255,0.12)'); gloss.addColorStop(0.6, 'rgba(255,255,255,0)');
    g.fillStyle = gloss; g.fillRect(0, 0, w, h);
    g.restore();
    g.strokeStyle = '#1a3414'; g.lineWidth = 2; g.stroke();
  });
  var siLeafMat = new THREE.MeshStandardMaterial({ map: siLeafTex, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.32, metalness: 0.02 });
  var siLeafDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: siLeafTex, alphaTest: 0.5 });   // so the shadows are leaf-shaped
  var siLeafGeo = new THREE.PlaneGeometry(1, 1, 4, 6);
  siLeafGeo.translate(0, 0.5, 0);
  var siLp = siLeafGeo.attributes.position;
  for (var siLv = 0; siLv < siLp.count; siLv++) {                      // cup the leaf and let its tip droop a little
    var lvx = siLp.getX(siLv), lvy = siLp.getY(siLv);
    siLp.setZ(siLv, -lvx * lvx * 0.35 + lvy * lvy * 0.18);
  }
  siLeafGeo.computeVertexNormals();
  function siFigLeaf(curve, t, n) {
    var at = curve.getPoint(t), lw = 0.2 + isle2Hash(n) * 0.08, ll = 0.28 + isle2Hash(n * 1.7) * 0.1;
    var leaf = new THREE.Group();
    leaf.position.copy(at); leaf.rotation.order = 'YXZ';
    leaf.rotation.set(0.5 + (1 - t) * 0.5 + isle2Hash(n * 3) * 0.2, n * 2.4, (isle2Hash(n * 5) - 0.5) * 0.4);
    shopRoom.add(leaf);
    siPart(new THREE.CylinderGeometry(0.005, 0.006, 0.05, 4), siBarkMat, 0, 0.02, 0, 0, 0, 0, leaf);   // the little leaf stalk
    var m = siPart(siLeafGeo, siLeafMat, 0, 0.04, 0, 0, 0, 0, leaf);
    m.scale.set(lw, ll, lw);
    m.receiveShadow = false; m.customDepthMaterial = siLeafDepth;
  }
  for (var siPl = 0; siPl < 15; siPl++) siFigLeaf(siTrunk, 0.32 + siPl / 14 * 0.68, siPl);
  siBranches.forEach(function (c, k) { for (var j = 0; j < 6; j++) siFigLeaf(c, 0.25 + j / 5 * 0.75, 40 + k * 10 + j); });
  shopInSolids.push([siCornerX, siCornerZ, 0.4]);
  // a framed vintage botanical print of a moonbloom, on aged paper, behind a white mat and glass
  var siPrintTex = paintTexture(512, 672, function (g, w, h) {
    g.fillStyle = '#efe5d0'; g.fillRect(0, 0, w, h);                  // old paper, with speckles and a few foxing spots
    for (var i = 0; i < 2500; i++) { g.fillStyle = 'rgba(120,90,50,' + (isle2Hash(i) * 0.06) + ')'; g.fillRect(isle2Hash(i * 1.3) * w, isle2Hash(i * 2.9) * h, 1.5, 1.5); }
    for (var f = 0; f < 9; f++) { var fx = isle2Hash(f * 5) * w, fy = isle2Hash(f * 7) * h, fr = 4 + isle2Hash(f) * 10; var fg2 = g.createRadialGradient(fx, fy, 0, fx, fy, fr); fg2.addColorStop(0, 'rgba(150,100,50,0.18)'); fg2.addColorStop(1, 'rgba(150,100,50,0)'); g.fillStyle = fg2; g.fillRect(fx - fr, fy - fr, fr * 2, fr * 2); }
    var vig = g.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8); vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(110,80,40,0.25)');
    g.fillStyle = vig; g.fillRect(0, 0, w, h);
    var INK = '#4a3524';
    g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44); g.lineWidth = 0.8; g.strokeRect(28, 28, w - 56, h - 56);
    g.fillStyle = INK; g.textAlign = 'center';
    g.font = 'bold 26px Georgia, serif'; g.fillText('M O O N B L O O M', w / 2, 70);
    g.font = 'italic 20px Georgia, serif'; g.fillText('Lunaflora noctis', w / 2, 96);
    g.font = '13px Georgia, serif'; g.fillText('PL. XII', 64, 56);
    function leaf(x, y, ang, len, wid) {                               // a watercolour leaf, inked, with a midrib and veins
      g.save(); g.translate(x, y); g.rotate(ang);
      g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(wid, -len * 0.25, wid * 0.8, -len * 0.75, 0, -len); g.bezierCurveTo(-wid * 0.8, -len * 0.75, -wid, -len * 0.25, 0, 0);
      var lg3 = g.createLinearGradient(-wid, 0, wid, 0); lg3.addColorStop(0, '#5f8f4a'); lg3.addColorStop(0.5, '#86b06a'); lg3.addColorStop(1, '#4c7a3c');
      g.fillStyle = lg3; g.globalAlpha = 0.85; g.fill(); g.globalAlpha = 1;
      g.strokeStyle = INK; g.lineWidth = 1.2; g.stroke();
      g.lineWidth = 0.9; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -len * 0.95); g.stroke();
      g.lineWidth = 0.5;
      for (var v = 1; v < 7; v++) { var vy = -len * v / 7.5; [-1, 1].forEach(function (d) { g.beginPath(); g.moveTo(0, vy); g.quadraticCurveTo(d * wid * 0.4, vy - len * 0.05, d * wid * 0.62, vy - len * 0.12); g.stroke(); }); }
      g.restore();
    }
    function petal(cx, cy, ang, len, wid, k) {                         // a petal, deep violet at its base fading to pale pink, with fine veins
      g.save(); g.translate(cx, cy); g.rotate(ang);
      g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(wid, -len * 0.2, wid * 1.1, -len * 0.8, 0, -len); g.bezierCurveTo(-wid * 1.1, -len * 0.8, -wid, -len * 0.2, 0, 0);
      var pg = g.createLinearGradient(0, 0, 0, -len); pg.addColorStop(0, '#6a3f9e'); pg.addColorStop(0.45, '#b98ad8'); pg.addColorStop(1, '#f2d6ec');
      g.fillStyle = pg; g.globalAlpha = 0.92; g.fill(); g.globalAlpha = 1;
      g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
      g.strokeStyle = 'rgba(80,40,90,0.45)'; g.lineWidth = 0.6;
      for (var v = -2; v <= 2; v++) { g.beginPath(); g.moveTo(0, -4); g.quadraticCurveTo(v * wid * 0.25, -len * 0.5, v * wid * 0.35, -len * 0.9); g.stroke(); }
      g.restore();
    }
    // the stem, curving up from the bulb, with a side shoot carrying a bud
    g.strokeStyle = '#5a7a3e'; g.lineWidth = 5; g.beginPath(); g.moveTo(w / 2, 540); g.bezierCurveTo(w / 2 - 20, 440, w / 2 + 25, 330, w / 2, 240); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 0.8; g.beginPath(); g.moveTo(w / 2 - 2.5, 540); g.bezierCurveTo(w / 2 - 22, 440, w / 2 + 22, 330, w / 2 - 2.5, 240); g.stroke();
    g.strokeStyle = '#5a7a3e'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2 + 6, 380); g.quadraticCurveTo(w / 2 + 70, 350, w / 2 + 95, 290); g.stroke();
    leaf(w / 2 - 6, 470, -0.9, 120, 30); leaf(w / 2 + 4, 430, 0.95, 110, 28); leaf(w / 2 - 2, 360, -0.7, 95, 24); leaf(w / 2 + 14, 330, 0.6, 80, 20);
    for (var b = 0; b < 3; b++) petal(w / 2 + 95, 292, -0.5 + b * 0.5, 34, 9, b);    // the bud
    g.fillStyle = '#6a8a4a'; g.beginPath(); g.ellipse(w / 2 + 95, 296, 9, 6, 0.3, 0, Math.PI * 2); g.fill(); g.strokeStyle = INK; g.lineWidth = 0.8; g.stroke();
    for (var p = 0; p < 7; p++) petal(w / 2, 238, p / 7 * Math.PI * 2, 78 + isle2Hash(p) * 10, 24, p);   // the open flower
    for (var st = 0; st < 14; st++) {                                   // stamens with golden tips
      var sa = st / 14 * Math.PI * 2, sl = 16 + isle2Hash(st * 3) * 8;
      g.strokeStyle = '#b8902e'; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, 238); g.lineTo(w / 2 + Math.cos(sa) * sl, 238 + Math.sin(sa) * sl); g.stroke();
      g.fillStyle = '#e6b84a'; g.beginPath(); g.arc(w / 2 + Math.cos(sa) * sl, 238 + Math.sin(sa) * sl, 2.4, 0, Math.PI * 2); g.fill();
    }
    g.fillStyle = '#f3d27a'; g.beginPath(); g.arc(w / 2, 238, 6, 0, Math.PI * 2); g.fill(); g.strokeStyle = INK; g.stroke();
    // the bulb and its fine roots
    var bg2 = g.createRadialGradient(w / 2 - 6, 548, 2, w / 2, 556, 24); bg2.addColorStop(0, '#e8d2b0'); bg2.addColorStop(1, '#a87a4e');
    g.fillStyle = bg2; g.beginPath(); g.moveTo(w / 2, 528); g.bezierCurveTo(w / 2 + 28, 540, w / 2 + 26, 572, w / 2, 574); g.bezierCurveTo(w / 2 - 26, 572, w / 2 - 28, 540, w / 2, 528); g.fill();
    g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    g.lineWidth = 0.6;
    for (var r = 0; r < 12; r++) { var rx = w / 2 - 16 + r * 3; g.beginPath(); g.moveTo(rx, 572); g.bezierCurveTo(rx + (isle2Hash(r) - 0.5) * 30, 588, rx + (isle2Hash(r * 2) - 0.5) * 40, 600, rx + (isle2Hash(r * 3) - 0.5) * 50, 612); g.stroke(); }
    // little study drawings: a glowing seed and a single petal, labelled
    g.fillStyle = '#c9a8e8'; g.beginPath(); g.ellipse(100, 560, 14, 20, 0.3, 0, Math.PI * 2); g.fill(); g.strokeStyle = INK; g.lineWidth = 1; g.stroke();
    g.strokeStyle = 'rgba(90,50,120,0.5)'; g.beginPath(); g.moveTo(94, 545); g.quadraticCurveTo(102, 560, 98, 578); g.stroke();
    petal(w - 104, 590, 0.25, 60, 16, 9);
    g.fillStyle = INK; g.font = 'italic 13px Georgia, serif'; g.fillText('fig. 2 — seed', 100, 600); g.fillText('fig. 3 — petal', w - 104, 610);
    g.fillStyle = 'rgba(214,170,70,0.8)';                              // a few gold flecks of magic
    for (var sp2 = 0; sp2 < 12; sp2++) { var sx2 = w / 2 + (isle2Hash(sp2 * 4) - 0.5) * 260, sy2 = 140 + isle2Hash(sp2 * 6) * 160; g.beginPath(); g.arc(sx2, sy2, 1.5 + isle2Hash(sp2) * 1.5, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = INK; g.font = 'italic 14px Georgia, serif'; g.fillText('Whimsy & Bloom · Everdawn', w / 2, h - 40);
  });
  siPrintTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var PRINT_X = -1.2, PRINT_Y = 1.8;
  [[0, 0.385, 0.66, 0.05], [0, -0.385, 0.66, 0.05], [-0.305, 0, 0.05, 0.82], [0.305, 0, 0.05, 0.82]].forEach(function (f) {    // a slim black frame with a gold inner lip
    siWallPart('E', new THREE.BoxGeometry(f[2], f[3], 0.04), SI.black, PRINT_X + f[0], PRINT_Y + f[1], 0.02);
    siWallPart('E', new THREE.BoxGeometry(f[2] > 0.1 ? 0.57 : 0.008, f[3] > 0.1 ? 0.73 : 0.008, 0.01), SI.brass, PRINT_X + f[0] * 0.92, PRINT_Y + f[1] * 0.94, 0.036);
  });
  siWallPart('E', new THREE.PlaneGeometry(0.58, 0.74), new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 0.95 }), PRINT_X, PRINT_Y, 0.012);   // the white mat
  siWallPart('E', new THREE.BoxGeometry(0.4, 0.525, 0.004), new THREE.MeshStandardMaterial({ color: 0xd8d3c8, roughness: 0.95 }), PRINT_X, PRINT_Y, 0.013);   // the mat's bevelled edge
  siWallPart('E', new THREE.PlaneGeometry(0.38, 0.5), new THREE.MeshStandardMaterial({ map: siPrintTex, roughness: 0.85 }), PRINT_X, PRINT_Y, 0.0155);
  siWallPart('E', new THREE.PlaneGeometry(0.58, 0.74), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.08, depthWrite: false }), PRINT_X, PRINT_Y, 0.034);   // the glass

  // the shop front from inside: the two big display windows and the door you came in by
  [-2.425, 2.425].forEach(function (wx) {
    siWindow('S', wx, 0.6 + 0.925, 2.95, 1.85, null, { cols: [1 / 3, 2 / 3], colH: 1.85 - 0.42, rows: [(1.85 - 0.42) / 1.85], topCols: [1 / 6, 0.5, 5 / 6], barMat: siPlum, barW: 0.045 });
    siWallPart('S', new THREE.BoxGeometry(3.05, 0.6, 0.5), SI.white, wx, 0.3, 0.25);
    siWallPart('S', new THREE.BoxGeometry(3.1, 0.035, 0.54), SI.wood, wx, 0.615, 0.25);              // a wooden top on the window seat
  });
  siWallPart('S', new THREE.BoxGeometry(1.3, 2.2, 0.06), siPlum, 0, 1.1, 0.03);
  siWindow('S', 0, 1.5, 0.8, 1.05, siWindowMask, { cols: [0.5], rows: [0.5], barMat: houseMats.gold, sashMat: houseMats.gold, barW: 0.03, noCasing: true, z: 0.055 });
  siWallPart('S', new THREE.BoxGeometry(0.86, 0.6, 0.02), new THREE.MeshStandardMaterial({ color: 0x55405f, roughness: 0.5 }), 0, 0.55, 0.07);   // a raised panel under the door glass
  siWallPart('S', new THREE.SphereGeometry(0.055, 10, 8), SI.brass, -0.45, 1.05, 0.1);
  siPart(new THREE.BoxGeometry(1.0, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x5a5a58, roughness: 1 }), 0, 0.01, SIN_D / 2 - 0.45);
  var SIN_EXIT_Z = SIN_D / 2 - 0.6;

  // white ceiling rails with spotlights, two brass dome lamps over the counter, and vines trailing down
  var RAIL_Y = SIN_H - 0.08;
  [[0, CNT_Z, SIN_W, 0.1], [-3.4, 0, 0.1, SIN_D]].forEach(function (r) {
    siPart(new THREE.BoxGeometry(r[2], 0.1, r[3]), SI.white, r[0], RAIL_Y, r[1]);
  });
  [[-3.4, 2.2, 0.5], [-3.4, -2.6, 0.5], [-3.4, -0.6, -0.4], [-0.3, CNT_Z, 0.4], [-2.0, CNT_Z, -0.4], [4.4, CNT_Z, 0.4]].forEach(function (t) {
    siPart(new THREE.CylinderGeometry(0.05, 0.065, 0.18, 12), SI.white, t[0], RAIL_Y - 0.14, t[1], t[2], 0, 0);
  });
  var siPendGlows = [];
  [CNT_X - 0.6, CNT_X + 0.6].forEach(function (px, k) {
    var py = 2.35 + k * 0.15;
    siPart(new THREE.CylinderGeometry(0.006, 0.006, RAIL_Y - py, 4), SI.black, px, (RAIL_Y + py) / 2, CNT_Z);
    siPart(new THREE.SphereGeometry(0.3, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), SI.brass, px, py - 0.22, CNT_Z).scale.set(1, 0.85, 1);
    siPart(new THREE.SphereGeometry(0.29, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0d0, emissiveIntensity: 0.9, side: THREE.BackSide }), px, py - 0.22, CNT_Z).scale.set(1, 0.85, 1);
    siPart(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8), SI.brass, px, py + 0.04, CNT_Z);
    var pg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffe2b0, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    pg.position.set(px, py - 0.28, CNT_Z); pg.scale.set(0.9, 0.9, 1); shopRoom.add(pg);
    siPendGlows.push(pg);
  });
  var siVines = [];
  [[-3.4, 0.6, 1.2], [-3.4, 1.6, 0.8], [-2.4, CNT_Z, 1.2], [3.6, CNT_Z, 0.8], [4.6, CNT_Z, 1.3], [-0.9, CNT_Z, 0.9], [-3.4, -3.2, 1.1], [-3.4, 2.8, 1.0], [1.0, CNT_Z, 0.7]].forEach(function (vn, k) {
    for (var s = 0; s < 3; s++) {                                       // a few strands per vine, each with little leaves
      var len = vn[2] * (0.6 + isle2Hash(k * 7 + s) * 0.5), ox = (s - 1) * 0.1;
      siPart(new THREE.CylinderGeometry(0.003, 0.003, len, 4), SI.leaf, vn[0] + ox, RAIL_Y - 0.05 - len / 2, vn[1]);
      for (var v = 0; v < len / 0.05; v++) {
        var iv = isle2Hash(k * 31 + s * 7 + v), side = v % 2 ? 1 : -1;
        siVines.push([vn[0] + ox + side * 0.03, RAIL_Y - 0.05 - v * 0.05, vn[1] + (iv - 0.5) * 0.05, 0.7 + iv * 0.5, 0.18, 1.0 + iv * 0.5, iv, 0.6 * side, iv * 6]);
      }
    }
  });
  siInstances(new THREE.SphereGeometry(0.035, 8, 4), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }), siVines, function (q, c) { return c.setHSL(0.25 + q[6] * 0.05, 0.45, 0.32 + q[6] * 0.14); });

  function updateShopGarden(t) {                                       // daylight only comes in through the windows by day
    var hr = state.minutes / 60, nt = hr < 5.5 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr < 18.5 ? 0 : hr < 20 ? (hr - 18.5) / 1.5 : 1;
    shopInSun.intensity = 0.55 * (1 - nt);
  }
  for (var siWn in shopInWalls) shopInWalls[siWn].g.traverse(function (o) { o.castShadow = false; });   // the walls and what's on them don't block the daylight
  var siLook = new THREE.Vector3();
  function updateShopInterior(t) {
    if (!inShop) return;
    for (var wn in shopInWalls) {                                       // hide any wall the camera is behind, so it never blocks the view
      var W = shopInWalls[wn];
      siLook.set(camera.position.x - SIN_X - W.c.x, 0, camera.position.z - SIN_Z - W.c.z);
      W.g.visible = siLook.dot(W.n) > 0;
    }
    SI.glowSeed.emissiveIntensity = 0.8 + Math.sin(t * 2.2) * 0.2;
    updateShopGarden(t);
    siBigJar.rotation.y = t * 0.3;
    siLanternLights.forEach(function (L) { var fl = 1 + Math.sin(t * 13 + L.p) * 0.12 + Math.sin(t * 7.1 + L.p * 2) * 0.08; L.f.scale.set(1, 1.9 * fl, 1); L.g.material.opacity = 0.45 * fl; });
    siRacks[0].rotation.y = Math.sin(t * 0.3) * 0.3;                    // the spinner racks turn a little, as if someone just browsed
    siRacks[1].rotation.y = Math.sin(t * 0.25 + 2) * 0.3;
    siPendGlows.forEach(function (g, k) { g.material.opacity = 0.45 + Math.sin(t * 1.3 + k) * 0.04; });
  }
  function inShopRoom(x, z) { return Math.abs(x - SIN_X) < SIN_W / 2 - 0.35 && Math.abs(z - SIN_Z) < SIN_D / 2 - 0.35; }
  function atShopCounter(margin) {                                    // standing in front of the counter (margin: how far past it still counts)
    if (!inShop) return false;
    var lx = player.position.x - SIN_X - CNT_X, lz = player.position.z - SIN_Z, m = margin || 0;
    return Math.abs(lx) < CNT_W / 2 + 0.4 + m && lz > CNT_Z + 0.3 && lz < CNT_Z + 1.9 + m;
  }

  // ---------- Inside the clinic ----------
  // Its own room, drawn instead of the island while you're inside, just like the farmhouse and Whimsy & Bloom. A bright,
  // friendly doctor's office: a cream-and-mint checked floor, mint beadboard below a white chair rail, and windows that
  // look out on the real square. On the left, the waiting room (a reception desk with a computer, a bell and a jar of
  // lollipops, upholstered chairs, a magazine table on a rug, a water cooler and big leafy plants); on the right, the
  // doctor's corner (a desk with a laptop and stethoscope, a padded exam table with its paper roll behind a curtain on a
  // ceiling track, a sink, a cabinet of glowing tonics, an eye chart, a heart poster and a balance scale). Walk back to
  // the door to leave
  var clinicScene = new THREE.Scene();
  clinicScene.background = new THREE.Color(0x1c1228);
  var CIN_X = 400, CIN_Z = 1000, CIN_W = CLINIC_HW * 2, CIN_D = CLINIC_HD * 2, CIN_H = 3.4;   // far from everything; the same size as the building outside
  var inClinic = false;
  var clinicRoom = new THREE.Group();
  clinicRoom.position.set(CIN_X, 0, CIN_Z);
  clinicScene.add(clinicRoom);
  clinicScene.add(new THREE.HemisphereLight(0xfff6ea, 0x7a8478, 0.5));   // (softer, so the colours don't wash out)
  var ciSun = new THREE.DirectionalLight(0xfff0dc, 0.5);               // daylight slanting in through the windows
  ciSun.position.set(CIN_X - 6, 8, CIN_Z + 5);
  ciSun.target.position.set(CIN_X + 1, 0, CIN_Z - 0.5);
  ciSun.castShadow = true;
  ciSun.shadow.mapSize.set(2048, 2048);
  ciSun.shadow.camera.left = -8; ciSun.shadow.camera.right = 8; ciSun.shadow.camera.top = 7; ciSun.shadow.camera.bottom = -7;
  ciSun.shadow.camera.near = 1; ciSun.shadow.camera.far = 25;
  ciSun.shadow.bias = -0.0006; ciSun.shadow.normalBias = 0.02;
  clinicScene.add(ciSun); clinicScene.add(ciSun.target);
  var ciLamp = new THREE.PointLight(0xfff0dc, 0.36, 13);                // the ceiling lights
  ciLamp.position.set(CIN_X - 2.4, 3.1, CIN_Z + 0.6);
  clinicScene.add(ciLamp);
  var ciLamp2 = new THREE.PointLight(0xfff0dc, 0.36, 13);
  ciLamp2.position.set(CIN_X + 2.6, 3.1, CIN_Z - 0.4);
  clinicScene.add(ciLamp2);
  function ciPart(geo, mat, x, y, z, rx, ry, rz, parent) {            // one piece of the clinic room (x, z from the middle of the floor)
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = !mat.transparent && !mat.emissiveMap;
    m.receiveShadow = true;
    (parent || clinicRoom).add(m);
    return m;
  }
  var ciSolids = [];                                                  // things you bump into (room positions: x, z, radius)

  // painted textures
  // the floor: polished marble-look tiles laid as a checkerboard of warm cream and sage, each tile its own shade with soft
  // grey veining, in narrow grout lines, framed by a border of deep teal tiles and a thin cream inlay round the room
  var CF_PPM = 160, CF_T = 0.4;                                        // canvas pixels per metre, and tile size
  function ciFloorPaint(g, w, h, bumpOnly) {
    var T = CF_T * CF_PPM, B = 0.32 * CF_PPM, GR = 3;                  // tile, border width and grout in pixels
    g.fillStyle = bumpOnly ? '#303030' : '#8a8478'; g.fillRect(0, 0, w, h);   // the grout
    function tile(x, y, tw, th, base, seed) {
      if (bumpOnly) { g.fillStyle = '#f0f0f0'; g.fillRect(x + GR / 2, y + GR / 2, tw - GR, th - GR); g.fillStyle = '#c8c8c8'; g.fillRect(x + GR / 2, y + th - GR / 2 - 2, tw - GR, 2); g.fillRect(x + tw - GR / 2 - 2, y + GR / 2, 2, th - GR); return; }
      var v = (isle2Hash(seed) - 0.5) * 10;
      g.fillStyle = 'hsl(' + base[0] + ',' + base[1] + '%,' + (base[2] + v * 0.5) + '%)'; g.fillRect(x + GR / 2, y + GR / 2, tw - GR, th - GR);
      for (var c = 0; c < 3; c++) {                                    // cloudy patches
        var cx = x + isle2Hash(seed + c * 3.1) * tw, cy = y + isle2Hash(seed + c * 4.7) * th, cg = g.createRadialGradient(cx, cy, 2, cx, cy, tw * 0.5);
        cg.addColorStop(0, 'rgba(255,255,255,0.18)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.fillRect(x + GR / 2, y + GR / 2, tw - GR, th - GR);
      }
      g.save(); g.beginPath(); g.rect(x + GR / 2, y + GR / 2, tw - GR, th - GR); g.clip();
      for (var vn = 0; vn < 2; vn++) {                                 // fine grey veins
        g.strokeStyle = 'rgba(90,90,96,' + (0.05 + isle2Hash(seed + vn * 9) * 0.1) + ')'; g.lineWidth = 0.5 + isle2Hash(seed + vn) * 0.9;
        var px = x + isle2Hash(seed * 1.3 + vn) * tw, py = y; g.beginPath(); g.moveTo(px, py);
        while (py < y + th) { px += (isle2Hash(seed + py * 0.37 + vn) - 0.5) * 14; py += 6; g.lineTo(px, py); }
        g.stroke();
      }
      var sh = g.createLinearGradient(x, y, x + tw, y + th); sh.addColorStop(0, 'rgba(255,255,255,0.14)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.08)');   // a bevelled, polished face
      g.fillStyle = sh; g.fillRect(x, y, tw, th);
      g.restore();
    }
    var n = 0;
    for (var y = B; y < h - B - 1; y += T) for (var x = B; x < w - B - 1; x += T) {   // the checkerboard
      var ci = Math.round((x - B) / T), cj = Math.round((y - B) / T);
      tile(x, y, Math.min(T, w - B - x), Math.min(T, h - B - y), (ci + cj) % 2 ? [140, 18, 70] : [38, 38, 84], ++n * 7.3);
    }
    for (var bx = 0; bx < w; bx += T) { tile(bx, 0, T, B, [172, 40, 28], ++n * 7.3); tile(bx, h - B, T, B, [172, 40, 28], ++n * 7.3); }   // the teal border
    for (var by = B; by < h - B; by += T) { tile(0, by, B, Math.min(T, h - B - by), [172, 40, 28], ++n * 7.3); tile(w - B, by, B, Math.min(T, h - B - by), [172, 40, 28], ++n * 7.3); }
    if (!bumpOnly) { g.strokeStyle = '#efe4cc'; g.lineWidth = 5; g.strokeRect(B - 1, B - 1, w - B * 2 + 2, h - B * 2 + 2); }   // the cream inlay
  }
  var ciFloorTex = paintTexture(Math.round(CIN_W * CF_PPM), Math.round(CIN_D * CF_PPM), function (g, w, h) { ciFloorPaint(g, w, h, false); });
  var ciFloorBump = paintTexture(Math.round(CIN_W * CF_PPM / 2), Math.round(CIN_D * CF_PPM / 2), function (g, w, h) { g.scale(0.5, 0.5); ciFloorPaint(g, w * 2, h * 2, true); });
  ciFloorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var ciBeadTex = paintTexture(256, 128, function (g, w, h) {         // sage beadboard: narrow tongue-and-groove boards, each with a rounded bead and a little brushwork
    for (var x = 0; x < w; x += 16) {
      var l = 70 + isle2Hash(x * 0.37) * 3;
      var bg = g.createLinearGradient(x, 0, x + 16, 0); bg.addColorStop(0, 'hsl(150,20%,' + (l - 12) + '%)'); bg.addColorStop(0.18, 'hsl(150,22%,' + (l + 3) + '%)'); bg.addColorStop(0.3, 'hsl(150,20%,' + l + '%)'); bg.addColorStop(0.85, 'hsl(150,20%,' + (l - 2) + '%)'); bg.addColorStop(1, 'hsl(150,20%,' + (l - 9) + '%)');
      g.fillStyle = bg; g.fillRect(x, 0, 16, h);
      g.fillStyle = 'rgba(30,60,50,0.55)'; g.fillRect(x, 0, 1.5, h);
      g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 2, 0, 1, h);
    }
    for (var i = 0; i < 300; i++) { g.fillStyle = 'rgba(255,255,255,' + isle2Hash(i) * 0.06 + ')'; g.fillRect(isle2Hash(i * 2.2) * w, isle2Hash(i * 3.4) * h, 1, 4 + isle2Hash(i * 5) * 10); }
  });
  ciBeadTex.wrapS = THREE.RepeatWrapping;
  var ciPaperTex = paintTexture(256, 256, function (g, w, h) {        // the upper walls: plain warm cream plaster, with just a faint, soft texture
    g.fillStyle = '#f4eee2'; g.fillRect(0, 0, w, h);
    for (var c = 0; c < 14; c++) {                                     // gentle cloudy variation, as in hand-trowelled plaster
      var cx = isle2Hash(c * 3.7) * w, cy = isle2Hash(c * 5.1) * h, cg = g.createRadialGradient(cx, cy, 4, cx, cy, 40 + isle2Hash(c) * 50);
      cg.addColorStop(0, isle2Hash(c * 2.2) > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(200,185,160,0.08)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = cg; g.fillRect(0, 0, w, h);
    }
    for (var i = 0; i < 1500; i++) { g.fillStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '255,255,255' : '150,130,110') + ',' + isle2Hash(i * 1.7) * 0.04 + ')'; g.fillRect(isle2Hash(i * 2.3) * w, isle2Hash(i * 3.1) * h, 2, 2); }
  });
  ciPaperTex.wrapS = ciPaperTex.wrapT = THREE.RepeatWrapping;
  var ciPlasterTex = paintTexture(128, 128, function (g, w, h) {
    g.fillStyle = '#f7f4ee'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 1200; i++) { g.fillStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '255,255,255' : '150,140,130') + ',' + (isle2Hash(i * 1.7) * 0.06) + ')'; g.fillRect(isle2Hash(i * 2.3) * w, isle2Hash(i * 3.1) * h, 2, 2); }
  });
  ciPlasterTex.wrapS = ciPlasterTex.wrapT = THREE.RepeatWrapping;
  var ciScreenTex = paintTexture(160, 100, function (g, w, h) {       // the reception computer: the day's appointments
    g.fillStyle = '#eef6f4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f6f68'; g.fillRect(0, 0, w, 14);
    g.fillStyle = '#fff'; g.font = 'bold 9px sans-serif'; g.fillText('Appointments', 6, 10);
    for (var r = 0; r < 6; r++) {
      g.fillStyle = r % 2 ? '#dcebe6' : '#f6faf9'; g.fillRect(4, 18 + r * 13, w - 8, 12);
      g.fillStyle = '#5a6a66'; g.font = '8px sans-serif'; g.fillText((9 + r) + ':00', 8, 27 + r * 13);
      g.fillStyle = ['#e0889a', '#8fc7b0', '#a9cbe0'][r % 3]; g.fillRect(40, 21 + r * 13, 40 + isle2Hash(r) * 60, 6);
    }
  });
  var ciLaptopTex = paintTexture(128, 80, function (g, w, h) {        // the doctor's laptop: a heartbeat on the screen
    g.fillStyle = '#122a2a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,200,170,0.25)'; g.lineWidth = 1;
    for (var x = 0; x < w; x += 12) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.strokeStyle = '#6dffcf'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 44);
    [[30, 44], [36, 40], [40, 44], [46, 44], [50, 14], [55, 64], [59, 44], [74, 44], [80, 38], [86, 44], [128, 44]].forEach(function (p) { g.lineTo(p[0], p[1]); });
    g.stroke();
    g.fillStyle = '#6dffcf'; g.font = 'bold 12px sans-serif'; g.fillText('72 ♥', 92, 20);
  });
  var ciHeartTex = paintTexture(512, 700, function (g, w, h) {        // a friendly poster all about the heart: a drawing with labels, facts and tips
    var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#fdf7ee'); bg.addColorStop(1, '#f6ecdc');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f6f68'; g.fillRect(0, 0, w, 84);
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.font = 'bold 40px Georgia, serif'; g.fillText('Your Amazing Heart', w / 2, 50);
    g.fillStyle = '#cfe9e2'; g.font = 'italic 16px Georgia, serif'; g.fillText('a hard-working friend, about the size of your fist', w / 2, 74);
    var cx = 240, cy = 300;
    function tube(pts, col, wid) { g.strokeStyle = col; g.lineWidth = wid; g.lineCap = 'round'; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i += 2) g.quadraticCurveTo(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]); g.stroke(); }
    tube([[cx - 70, 120], [cx - 72, 170], [cx - 60, 220]], '#4a6ad0', 30);                                   // the vena cava, bringing blood home
    tube([[cx + 10, 230], [cx - 10, 130], [cx + 60, 140], [cx + 120, 150], [cx + 110, 230]], '#c8344a', 34); // the aorta's arch
    tube([[cx + 40, 150], [cx + 30, 110], [cx + 20, 100]], '#c8344a', 14); tube([[cx + 70, 145], [cx + 70, 105], [cx + 72, 92]], '#c8344a', 14);   // its branches
    tube([[cx - 20, 250], [cx - 40, 180], [cx - 110, 175]], '#5a7ae0', 26);                                 // the pulmonary artery, off to the lungs
    var hg = g.createRadialGradient(cx - 30, cy - 40, 20, cx, cy, 170); hg.addColorStop(0, '#f48a9a'); hg.addColorStop(0.6, '#d8485e'); hg.addColorStop(1, '#8a1e34');
    g.fillStyle = hg;
    g.beginPath(); g.moveTo(cx - 20, cy - 80); g.bezierCurveTo(cx - 140, cy - 90, cx - 150, cy + 40, cx - 60, cy + 110); g.quadraticCurveTo(cx + 10, cy + 170, cx + 40, cy + 190); g.bezierCurveTo(cx + 90, cy + 120, cx + 160, cy + 40, cx + 120, cy - 50); g.bezierCurveTo(cx + 90, cy - 100, cx + 20, cy - 90, cx - 20, cy - 80); g.fill();
    g.fillStyle = 'rgba(90,110,220,0.28)'; g.beginPath(); g.moveTo(cx - 20, cy - 80); g.bezierCurveTo(cx - 140, cy - 90, cx - 150, cy + 40, cx - 60, cy + 110); g.quadraticCurveTo(cx - 10, cy + 40, cx + 10, cy - 70); g.fill();   // the right side, carrying tired blue blood
    g.strokeStyle = '#7a2a1e'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 10, cy - 70); g.bezierCurveTo(cx - 10, cy + 20, cx + 20, cy + 100, cx + 40, cy + 185); g.stroke();   // the groove between the halves
    g.strokeStyle = 'rgba(255,220,120,0.7)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx + 30, cy - 60); g.bezierCurveTo(cx + 60, cy, cx + 50, cy + 60, cx + 80, cy + 110); g.moveTo(cx - 40, cy - 50); g.bezierCurveTo(cx - 90, cy, cx - 70, cy + 60, cx - 50, cy + 90); g.stroke();   // the coronary vessels
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(cx - 60, cy - 30, 24, 40, 0.5, 0, Math.PI * 2); g.fill();
    function label(text, lx, ly, tx, ty, align) {                      // a label with a leader line
      g.strokeStyle = '#5a5a5a'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(lx, ly); g.lineTo(tx, ty); g.stroke();
      g.fillStyle = '#5a5a5a'; g.beginPath(); g.arc(tx, ty, 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2a2a30'; g.font = 'bold 15px sans-serif'; g.textAlign = align; g.fillText(text, lx + (align === 'left' ? 4 : -4), ly + 5);
    }
    label('Aorta', 420, 128, cx + 110, 150, 'left'); label('Vena cava', 60, 120, cx - 75, 140, 'right');
    label('To the lungs', 66, 200, cx - 105, 178, 'right'); label('Right side', 50, 330, cx - 90, cy, 'right');
    label('Left side', 420, 330, cx + 110, cy + 10, 'left'); label('Ventricles', 420, 430, cx + 50, cy + 120, 'left');
    [[cx + 140, 260, '#c8344a'], [cx - 135, 260, '#4a6ad0']].forEach(function (ar) {   // arrows showing which way the blood flows
      g.fillStyle = ar[2]; g.beginPath(); g.moveTo(ar[0], ar[1] - 14); g.lineTo(ar[0] + 10, ar[1] + 4); g.lineTo(ar[0] - 10, ar[1] + 4); g.fill();
    });
    g.fillStyle = '#ffffff'; g.strokeStyle = '#e0889a'; g.lineWidth = 2;   // a fact box
    g.fillRect(36, 512, w - 72, 56); g.strokeRect(36, 512, w - 72, 56);
    g.fillStyle = '#c8344a'; g.font = 'bold 17px sans-serif'; g.textAlign = 'center'; g.fillText('♥ It beats about 100,000 times a day!', w / 2, 546);
    [['🍎', 'Eat your greens'], ['👟', 'Walk each day'], ['🌙', 'Sleep well']].forEach(function (t, k) {   // three tips, each with a little picture
      var tx = 90 + k * 166, ty = 610;
      g.fillStyle = ['#e6f3e0', '#e6f2fb', '#efe8fb'][k]; g.beginPath(); g.arc(tx, ty, 26, 0, Math.PI * 2); g.fill();
      g.font = '28px sans-serif'; g.fillText(t[0], tx, ty + 10);
      g.fillStyle = '#2f6f68'; g.font = 'bold 14px sans-serif'; g.fillText(t[1], tx, ty + 50);
    });
    g.fillStyle = '#8a7a6a'; g.font = 'italic 12px Georgia, serif'; g.fillText('Everdawn Clinic · Dr. Hazel Bramble', w / 2, h - 12);
  });
  var ciWashTex = paintTexture(512, 384, function (g, w, h) {          // a poster over the sink: how to wash your hands, in four little pictures
    g.fillStyle = '#fbf8f1'; g.fillRect(0, 0, w, h);
    var head = g.createLinearGradient(0, 0, 0, 62); head.addColorStop(0, '#3a8a80'); head.addColorStop(1, '#2a6a62');
    g.fillStyle = head; g.fillRect(0, 0, w, 62);
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 34px Georgia, serif'; g.fillText('Wash Your Hands', w / 2, 30);
    g.font = 'italic 13px Georgia, serif'; g.fillStyle = '#d8f2ea'; g.fillText('four easy steps to keep Everdawn healthy', w / 2, 52);
    function hand(cx, cy, s, rot, flip) {                              // a cartoon hand: palm, four fingers and a thumb
      g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(flip ? -s : s, s);
      g.fillStyle = '#f4caa4'; g.strokeStyle = '#c98e6a'; g.lineWidth = 1.6 / s;
      for (var f = 0; f < 4; f++) { g.beginPath(); g.ellipse(-9 + f * 6, -20 + Math.abs(f - 1.5) * 2.5, 3.2, 9, (f - 1.5) * 0.08, 0, Math.PI * 2); g.fill(); g.stroke(); }
      g.beginPath(); g.ellipse(13, -2, 3.4, 8, -0.9, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.ellipse(0, -2, 13, 12, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillRect(-8, 6, 16, 12); g.beginPath(); g.moveTo(-8, 6); g.lineTo(-8, 18); g.moveTo(8, 6); g.lineTo(8, 18); g.stroke();
      g.fillStyle = '#a8d8e8'; g.fillRect(-9, 16, 18, 8);              // a pale blue cuff
      g.restore();
    }
    function bubbles(cx, cy, n, spread, seed) {
      for (var b = 0; b < n; b++) {
        var bx = cx + (isle2Hash(seed + b) - 0.5) * spread, by = cy + (isle2Hash(seed + b * 2.3) - 0.5) * spread * 0.7, br = 3 + isle2Hash(seed + b * 3.1) * 6;
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.strokeStyle = 'rgba(110,170,210,0.8)'; g.lineWidth = 1.4;
        g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill(); g.stroke();
        g.fillStyle = 'rgba(160,210,240,0.7)'; g.beginPath(); g.arc(bx - br * 0.35, by - br * 0.35, br * 0.25, 0, Math.PI * 2); g.fill();
      }
    }
    var PW = 236, PH = 142;
    [[14, 72], [262, 72], [14, 226], [262, 226]].forEach(function (pp, k) {
      var x = pp[0], y = pp[1], cx = x + PW / 2, cy = y + PH / 2 + 8;
      g.fillStyle = ['#e6f3f8', '#fbe8ee', '#eef6e6', '#fdf3df'][k]; g.fillRect(x, y, PW, PH);
      g.strokeStyle = '#2f6f68'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, PW - 2, PH - 2);
      g.fillStyle = '#2f6f68'; g.beginPath(); g.arc(x + 20, y + 20, 13, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffffff'; g.font = 'bold 16px sans-serif'; g.fillText(String(k + 1), x + 20, y + 21);
      g.fillStyle = '#2f6f68'; g.font = 'bold 16px sans-serif'; g.textAlign = 'left';
      g.fillText(['Wet your hands', 'Add some soap', 'Scrub for 20 seconds', 'Rinse and dry'][k], x + 40, y + 21);
      g.textAlign = 'center';
      if (k === 0) {                                                    // a tap with water running onto two hands
        g.strokeStyle = '#9aa4ac'; g.lineWidth = 9; g.lineCap = 'round';
        g.beginPath(); g.moveTo(cx - 50, cy - 40); g.lineTo(cx - 50, cy - 52); g.quadraticCurveTo(cx - 50, cy - 66, cx - 32, cy - 64); g.lineTo(cx - 8, cy - 58); g.stroke();
        g.strokeStyle = '#7ab8e0'; g.lineWidth = 3;
        for (var s2 = 0; s2 < 4; s2++) { g.beginPath(); g.moveTo(cx - 10 + s2 * 3, cy - 52); g.quadraticCurveTo(cx - 8 + s2 * 4, cy - 30, cx - 6 + s2 * 5, cy - 14); g.stroke(); }
        hand(cx - 20, cy + 14, 1.5, 0.5, false); hand(cx + 18, cy + 14, 1.5, -0.5, true);
        g.fillStyle = '#7ab8e0'; [[-40, 4], [42, 10], [-8, 34], [24, 36]].forEach(function (d) { g.beginPath(); g.moveTo(cx + d[0], cy + d[1] - 6); g.quadraticCurveTo(cx + d[0] + 5, cy + d[1] + 3, cx + d[0], cy + d[1] + 4); g.quadraticCurveTo(cx + d[0] - 5, cy + d[1] + 3, cx + d[0], cy + d[1] - 6); g.fill(); });
      } else if (k === 1) {                                             // a soap pump and a dollop of foam in a palm
        g.fillStyle = '#f2a6bc'; g.fillRect(cx + 34, cy - 30, 34, 58); g.fillStyle = '#e0607a'; g.fillRect(cx + 34, cy - 10, 34, 22);
        g.fillStyle = '#ffffff'; g.fillRect(cx + 44, cy - 44, 14, 14); g.fillRect(cx + 26, cy - 46, 32, 6);
        hand(cx - 18, cy + 16, 1.7, 0.15, false);
        bubbles(cx - 18, cy - 4, 9, 34, 40);
      } else if (k === 2) {                                             // two hands rubbing together in a cloud of bubbles, and a 20-second clock
        hand(cx - 26, cy + 10, 1.5, 0.9, false); hand(cx + 4, cy + 10, 1.5, -0.9, true);
        bubbles(cx - 12, cy, 16, 90, 70);
        var tx = cx + 70, ty = cy - 4;
        g.fillStyle = '#ffffff'; g.strokeStyle = '#2f6f68'; g.lineWidth = 3; g.beginPath(); g.arc(tx, ty, 26, 0, Math.PI * 2); g.fill(); g.stroke();
        g.fillStyle = 'rgba(224,96,122,0.35)'; g.beginPath(); g.moveTo(tx, ty); g.arc(tx, ty, 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 / 3); g.closePath(); g.fill();
        g.fillStyle = '#2f6f68'; g.font = 'bold 18px sans-serif'; g.fillText('20', tx, ty + 1);
        g.font = '10px sans-serif'; g.fillText('sec', tx, ty + 14);
      } else {                                                          // a hand being dried on a striped towel
        g.save(); g.translate(cx + 6, cy + 4); g.rotate(-0.15);
        g.fillStyle = '#ffffff'; g.fillRect(-56, -34, 112, 72);
        g.fillStyle = '#8fc7b0'; g.fillRect(-56, -26, 112, 8); g.fillRect(-56, 22, 112, 8);
        g.strokeStyle = 'rgba(120,140,130,0.4)'; g.lineWidth = 1; for (var tl = -50; tl < 56; tl += 6) { g.beginPath(); g.moveTo(tl, -34); g.lineTo(tl, 38); g.stroke(); }
        g.restore();
        hand(cx - 4, cy - 4, 1.6, -0.3, false);
        g.fillStyle = '#e0607a'; g.font = 'bold 22px sans-serif'; g.fillText('♥', cx + 74, cy - 34);
      }
    });
    g.fillStyle = '#2f6f68'; g.font = 'italic 12px Georgia, serif'; g.fillText('♥  Thank you for keeping our patients safe  ♥', w / 2, h - 7);
  });
  // the diplomas: aged parchment with a filigree border, a crest, a name in a flowing hand, signatures and a gold seal
  // with ribbons. One from the academy, one a licence to practise
  function ciDiplomaPaint(g, w, h, kind) {
    var bg = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.7);
    bg.addColorStop(0, '#fbf3dc'); bg.addColorStop(0.7, '#f1e2bb'); bg.addColorStop(1, '#d9c08a');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 1800; i++) { g.fillStyle = 'rgba(140,100,40,' + isle2Hash(i * 1.7 + kind) * 0.07 + ')'; g.fillRect(isle2Hash(i * 2.3 + kind) * w, isle2Hash(i * 3.1 + kind) * h, 2, 2); }   // the paper's fibres
    var gold = g.createLinearGradient(0, 0, w, h); gold.addColorStop(0, '#d8b04a'); gold.addColorStop(0.5, '#f4dc8a'); gold.addColorStop(1, '#a8802c');
    g.strokeStyle = gold; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    g.strokeStyle = kind ? '#2f6f68' : '#7a2a3a'; g.lineWidth = 2; g.strokeRect(24, 24, w - 48, h - 48);
    g.strokeStyle = gold; g.lineWidth = 1.2;
    for (var x = 30; x < w - 30; x += 12) { g.beginPath(); g.arc(x + 6, 19, 4, Math.PI, 0); g.stroke(); g.beginPath(); g.arc(x + 6, h - 19, 4, 0, Math.PI); g.stroke(); }   // a scalloped border
    [[30, 30, 1, 1], [w - 30, 30, -1, 1], [30, h - 30, 1, -1], [w - 30, h - 30, -1, -1]].forEach(function (c) {   // filigree in each corner
      g.strokeStyle = gold; g.lineWidth = 2;
      for (var k = 0; k < 3; k++) { g.beginPath(); g.arc(c[0] + c[2] * (10 + k * 9), c[1] + c[3] * (10 + k * 9), 8 - k * 2, 0, Math.PI * 2); g.stroke(); }
      g.beginPath(); g.moveTo(c[0], c[1] + c[3] * 40); g.quadraticCurveTo(c[0], c[1], c[0] + c[2] * 40, c[1]); g.stroke();
    });
    var cx = w / 2;
    // the crest: a heart on a shield with a leafy staff and a crescent moon
    g.fillStyle = kind ? '#2f6f68' : '#7a2a3a';
    g.beginPath(); g.moveTo(cx - 22, 38); g.lineTo(cx + 22, 38); g.lineTo(cx + 22, 62); g.quadraticCurveTo(cx + 20, 78, cx, 86); g.quadraticCurveTo(cx - 20, 78, cx - 22, 62); g.closePath(); g.fill();
    g.strokeStyle = gold; g.lineWidth = 2.5; g.stroke();
    g.fillStyle = '#f4dc8a'; g.beginPath(); g.moveTo(cx, 72); g.bezierCurveTo(cx - 14, 62, cx - 9, 50, cx, 56); g.bezierCurveTo(cx + 9, 50, cx + 14, 62, cx, 72); g.fill();
    g.strokeStyle = '#5a8a48'; g.lineWidth = 2; [-1, 1].forEach(function (s) { for (var lf = 0; lf < 4; lf++) { g.beginPath(); g.ellipse(cx + s * (30 + lf * 7), 70 - lf * 8, 6, 2.5, s * 0.8, 0, Math.PI * 2); g.stroke(); } });
    g.fillStyle = '#3a2a1e'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    if (kind === 0) {
      g.font = 'bold 22px Georgia, serif'; g.fillText('MOONVALE ACADEMY OF HEALING', cx, 116);
      g.font = 'italic 15px Georgia, serif'; g.fillText('upon the recommendation of the faculty, hereby confers upon', cx, 144);
      g.font = 'italic bold 38px Georgia, serif'; g.fillStyle = '#2a1e14'; g.fillText('Hazel Bramble', cx, 190);
      g.fillStyle = '#3a2a1e'; g.font = 'italic 15px Georgia, serif'; g.fillText('the degree of', cx, 216);
      g.font = 'bold 30px Georgia, serif'; g.fillStyle = kind ? '#2f6f68' : '#7a2a3a'; g.fillText('Doctor of Medicine', cx, 252);
      g.fillStyle = '#3a2a1e'; g.font = 'italic 13px Georgia, serif'; g.fillText('with all the rights, honours and privileges thereto, this first day of Spring', cx, 278);
    } else {
      g.font = 'bold 21px Georgia, serif'; g.fillText('EVERDAWN BOARD OF HEALERS', cx, 116);
      g.font = 'bold 30px Georgia, serif'; g.fillStyle = '#2f6f68'; g.fillText('Licence to Practise', cx, 154);
      g.fillStyle = '#3a2a1e'; g.font = 'italic 15px Georgia, serif'; g.fillText('Medicine, Herbalism & Gentle Magics, is granted to', cx, 182);
      g.font = 'italic bold 36px Georgia, serif'; g.fillStyle = '#2a1e14'; g.fillText('Dr. Hazel Bramble', cx, 226);
      g.fillStyle = '#3a2a1e'; g.font = '13px Georgia, serif'; g.fillText('Licence No. 0471  ·  Valid in all the floating isles', cx, 256);
      g.font = 'italic 13px Georgia, serif'; g.fillText('In good standing, renewed each Harvest Moon', cx, 278);
    }
    [[cx - 150, 'Dean of Healing'], [cx + 150, kind ? 'Board Registrar' : 'High Herbalist']].forEach(function (sg, k) {   // signatures
      g.strokeStyle = '#1f2a5a'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(sg[0] - 60, 322);
      for (var t = 0; t < 120; t += 3) g.lineTo(sg[0] - 60 + t, 322 + Math.sin(t * 0.35 + k * 2) * (5 + isle2Hash(t + k * 9) * 5) - (t > 90 ? (t - 90) * 0.3 : 0));
      g.stroke();
      g.strokeStyle = '#6a5a4a'; g.lineWidth = 1; g.beginPath(); g.moveTo(sg[0] - 70, 332); g.lineTo(sg[0] + 70, 332); g.stroke();
      g.fillStyle = '#4a3a2a'; g.font = 'italic 11px Georgia, serif'; g.fillText(sg[1], sg[0], 346);
    });
    var sx = cx, sy = 330;                                              // the embossed gold seal, with two ribbons
    g.fillStyle = kind ? '#2f6f68' : '#b03040';
    [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(sx + s * 6, sy + 10); g.lineTo(sx + s * 20, sy + 44); g.lineTo(sx + s * 12, sy + 38); g.lineTo(sx + s * 6, sy + 48); g.lineTo(sx, sy + 14); g.closePath(); g.fill(); });
    g.beginPath();
    for (var p = 0; p <= 32; p++) { var pa = p / 32 * Math.PI * 2, pr = p % 2 ? 26 : 30; g.lineTo(sx + Math.cos(pa) * pr, sy + Math.sin(pa) * pr); }
    var sealG = g.createRadialGradient(sx - 8, sy - 8, 2, sx, sy, 30); sealG.addColorStop(0, '#fff0b0'); sealG.addColorStop(0.5, '#e0b448'); sealG.addColorStop(1, '#9a7020');
    g.fillStyle = sealG; g.fill();
    g.strokeStyle = 'rgba(120,80,20,0.7)'; g.lineWidth = 1.2; g.beginPath(); g.arc(sx, sy, 19, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(120,80,20,0.8)'; g.beginPath(); g.moveTo(sx, sy + 8); g.bezierCurveTo(sx - 12, sy, sx - 8, sy - 10, sx, sy - 4); g.bezierCurveTo(sx + 8, sy - 10, sx + 12, sy, sx, sy + 8); g.fill();
  }
  var ciDiplomaTexA = paintTexture(512, 384, function (g, w, h) { ciDiplomaPaint(g, w, h, 0); });
  var ciDiplomaTexB = paintTexture(512, 384, function (g, w, h) { ciDiplomaPaint(g, w, h, 1); });
  [ciDiplomaTexA, ciDiplomaTexB].forEach(function (t) { t.anisotropy = renderer.capabilities.getMaxAnisotropy(); });
  // a framed certificate: a moulded wooden frame with a gilt inner lip, a cream mat with a bevelled window, and glass
  function ciFancyFrame(name, x, y, w, h, tex, frameMat) {
    var F = 0.045, M = 0.04;                                            // frame width, mat width
    var ow = w + M * 2 + F * 2, oh = h + M * 2 + F * 2;
    [[0, (oh - F) / 2, ow, F], [0, -(oh - F) / 2, ow, F], [-(ow - F) / 2, 0, F, oh], [(ow - F) / 2, 0, F, oh]].forEach(function (b) {
      ciWallPart(name, ciRoundBox(b[2], b[3], 0.04, 0.012), frameMat, x + b[0], y + b[1], 0.02);
    });
    [[0, (h + M * 2) / 2 + 0.004, w + M * 2 + 0.016, 0.008], [0, -(h + M * 2) / 2 - 0.004, w + M * 2 + 0.016, 0.008], [-(w + M * 2) / 2 - 0.004, 0, 0.008, h + M * 2], [(w + M * 2) / 2 + 0.004, 0, 0.008, h + M * 2]].forEach(function (b) {
      ciWallPart(name, new THREE.BoxGeometry(b[2], b[3], 0.012), CI.brass, x + b[0], y + b[1], 0.03);   // the gilt lip
    });
    ciWallPart(name, new THREE.PlaneGeometry(w + M * 2, h + M * 2), new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.95 }), x, y, 0.012);   // the mat
    [[0, h / 2 + 0.003, w + 0.012, 0.006], [0, -h / 2 - 0.003, w + 0.012, 0.006], [-w / 2 - 0.003, 0, 0.006, h], [w / 2 + 0.003, 0, 0.006, h]].forEach(function (b) {
      ciWallPart(name, new THREE.BoxGeometry(b[2], b[3], 0.004), new THREE.MeshStandardMaterial({ color: 0xfffdf6, roughness: 0.9 }), x + b[0], y + b[1], 0.014);   // its bevel
    });
    ciWallPart(name, new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }), x, y, 0.0125);
    ciWallPart(name, new THREE.PlaneGeometry(w + M * 2, h + M * 2), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, opacity: 0.5, roughness: 0.05, metalness: 0.3, depthWrite: false }), x, y, 0.038).renderOrder = 2;   // the glass
  }

  // the eye chart: a backlit light box with a full chart, the line sizes down the sides and a red and green bar at the foot
  var ciEyeTex = paintTexture(512, 896, function (g, w, h) {
    g.scale(2, 2); w = 256; h = 448;                                    // painted at double size, so the small rows stay sharp
    g.fillStyle = '#fdfcf8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f6f68'; g.fillRect(0, 0, w, 30);
    g.fillStyle = '#ffffff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 14px sans-serif'; g.fillText('EVERDAWN EYE CHART', w / 2, 16);
    var rows = ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P', 'F E L O P Z D', 'D E F P O T E C', 'L E F O D P C T'], sz = [72, 46, 34, 27, 22, 17, 14, 11, 9], y = 40;
    var acu = ['200', '100', '70', '50', '40', '30', '25', '20', '15'];
    rows.forEach(function (t, k) {
      y += sz[k] + 8;
      g.fillStyle = '#16161a'; g.font = 'bold ' + sz[k] + 'px Arial, sans-serif'; g.fillText(t, w / 2, y - sz[k] / 2);
      g.fillStyle = '#8a8a90'; g.font = '9px sans-serif'; g.fillText(String(k + 1), 14, y - sz[k] / 2); g.fillText('20/' + acu[k], w - 22, y - sz[k] / 2);
      if (k === 7) { g.fillStyle = '#e0607a'; g.fillRect(28, y + 2, w - 56, 2); }   // the "perfect sight" line
    });
    g.fillStyle = '#d83a3a'; g.fillRect(24, h - 52, (w - 48) / 2, 34);
    g.fillStyle = '#2f9a4a'; g.fillRect(w / 2, h - 52, (w - 48) / 2, 34);
    g.fillStyle = '#16161a'; g.font = 'bold 12px "Courier New", monospace'; g.fillText('O  Z  E', w / 4 + 12, h - 35); g.fillText('F  P  C', w * 0.75 - 12, h - 35);
    g.fillStyle = '#8a8a90'; g.font = '8px sans-serif'; g.fillText('Read the lowest line you can', w / 2, h - 8);
  });
  ciEyeTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  // materials
  var CI = {
    floor: new THREE.MeshStandardMaterial({ map: ciFloorTex, bumpMap: ciFloorBump, bumpScale: 0.012, roughness: 0.28, metalness: 0.04 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf8f7f3, roughness: 0.5 }),
    mint: new THREE.MeshStandardMaterial({ color: 0x9fcab6, roughness: 0.55 }),
    teal: new THREE.MeshStandardMaterial({ color: 0x2f6f68, roughness: 0.45 }),
    tealVinyl: new THREE.MeshStandardMaterial({ color: 0x3f8a80, roughness: 0.35 }),
    coral: new THREE.MeshStandardMaterial({ color: 0xe0889a, roughness: 0.8 }),
    wood: new THREE.MeshStandardMaterial({ color: 0xb88a5a, roughness: 0.55 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x6a4630, roughness: 0.6 }),
    steel: new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.25, metalness: 0.8 }),
    black: new THREE.MeshStandardMaterial({ color: 0x24242a, roughness: 0.4, metalness: 0.3 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd4a84e, emissive: 0x5a3e0c, emissiveIntensity: 0.2, metalness: 0.8, roughness: 0.28 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xeef7ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.28, depthWrite: false }),
    paper: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x3f7a3e, roughness: 0.6, side: THREE.DoubleSide }),
    clay: new THREE.MeshStandardMaterial({ color: 0xc0704a, roughness: 0.85 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x4a3222, roughness: 1 }),
    light: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff6e6, emissiveIntensity: 0.9 })
  };

  var CI_CHROME = new THREE.MeshStandardMaterial({ color: 0xe6eaee, roughness: 0.22, metalness: 0.45 });
  var CI_SEAM = new THREE.MeshStandardMaterial({ color: 0x2c6a62, roughness: 0.5 });
  var CI_KICK = new THREE.MeshStandardMaterial({ color: 0x5a6266, roughness: 0.8 });
  var ciOakTex = paintTexture(256, 256, function (g, w, h) {           // honey oak with long grain and the odd ray fleck
    g.fillStyle = '#c08a52'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 140; i++) {
      var y = isle2Hash(i * 1.3 + 600) * h, dark = isle2Hash(i * 2.9) > 0.45;
      g.strokeStyle = dark ? 'rgba(110,60,25,' + (0.12 + isle2Hash(i) * 0.2) + ')' : 'rgba(240,200,140,' + (0.08 + isle2Hash(i) * 0.12) + ')';
      g.lineWidth = 0.6 + isle2Hash(i * 5.1) * 2.2;
      g.beginPath(); g.moveTo(0, y);
      for (var x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 3 + (isle2Hash(i + x) - 0.5) * 2);
      g.stroke();
    }
    for (var f = 0; f < 50; f++) { g.fillStyle = 'rgba(230,190,130,0.25)'; g.fillRect(isle2Hash(f * 3.3) * w, isle2Hash(f * 4.7) * h, 6 + isle2Hash(f) * 10, 1.5); }
  });
  ciOakTex.wrapS = ciOakTex.wrapT = THREE.RepeatWrapping;
  var CI_OAK = new THREE.MeshStandardMaterial({ map: ciOakTex, roughness: 0.45 });
  var CI_ALU = new THREE.MeshStandardMaterial({ color: 0xd7dade, roughness: 0.3, metalness: 0.4 });
  // the floor and ceiling
  ciPart(new THREE.PlaneGeometry(CIN_W, CIN_D), CI.floor, 0, 0, 0, -Math.PI / 2).castShadow = false;
  ciPart(new THREE.PlaneGeometry(CIN_W, CIN_D), new THREE.MeshStandardMaterial({ color: 0xf6f4f0, roughness: 0.95 }), 0, CIN_H, 0, Math.PI / 2).castShadow = false;   // faces down, so it never blocks the camera above

  // the walls: warm white plaster over mint beadboard, with a white chair rail and skirting. Each wall is its own group
  // (its local +z points into the room). The window openings show the real island outside, drawn live just like the
  // windows in Whimsy & Bloom
  var ciWalls = {};
  var CI_WIN_Y = 2.05, CI_WIN_W = 1.6, CI_WIN_H = 1.5;                 // the same as the windows outside
  var CI_HOLES = { N: [-2.6, 2.6], S: [-2.9, 2.9], W: [0], E: [0] };  // where the windows are along each wall
  function ciWall(name, x, z, ry, len) {
    var wgp = new THREE.Group();
    wgp.position.set(x, 0, z); wgp.rotation.y = ry;
    clinicRoom.add(wgp);
    ciWalls[name] = { g: wgp, c: new THREE.Vector3(x, 0, z), n: new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)) };
    var wallTex = ciPlasterTex.clone(); wallTex.needsUpdate = true; wallTex.repeat.set(len / 1.5, CIN_H / 1.5);
    var plasterMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 });   // plain plaster, for the window reveals
    var paperTex = ciPaperTex.clone(); paperTex.needsUpdate = true; paperTex.repeat.set(len / 1.5, CIN_H / 1.5);
    var paperMat = new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.9 });
    var shape = new THREE.Shape(); shape.moveTo(-len / 2, 0); shape.lineTo(len / 2, 0); shape.lineTo(len / 2, CIN_H); shape.lineTo(-len / 2, CIN_H); shape.lineTo(-len / 2, 0);
    CI_HOLES[name].forEach(function (hx) {
      var x0 = hx - CI_WIN_W / 2, x1 = hx + CI_WIN_W / 2, y0 = CI_WIN_Y - CI_WIN_H / 2, y1 = CI_WIN_Y + CI_WIN_H / 2;
      var hp = new THREE.Path(); hp.moveTo(x0, y0); hp.lineTo(x0, y1); hp.lineTo(x1, y1); hp.lineTo(x1, y0); hp.lineTo(x0, y0);
      shape.holes.push(hp);
      var mask = ciPart(new THREE.PlaneGeometry(CI_WIN_W, CI_WIN_H), siWindowMask, hx, CI_WIN_Y, -0.005, 0, 0, 0, wgp);   // the view outside
      mask.castShadow = false; mask.receiveShadow = false;
      var WT = 0.3;                                                    // the wall's thickness, seen in the sides of the opening
      [[0, CI_WIN_H / 2, CI_WIN_W, 0.02], [0, -CI_WIN_H / 2, CI_WIN_W, 0.02], [-CI_WIN_W / 2, 0, 0.02, CI_WIN_H], [CI_WIN_W / 2, 0, 0.02, CI_WIN_H]].forEach(function (rv) {
        ciPart(new THREE.BoxGeometry(rv[2], rv[3], WT), plasterMat, hx + rv[0], CI_WIN_Y + rv[1], -WT / 2, 0, 0, 0, wgp);
      });
      ciWindowFrame(wgp, hx);
    });
    var shapeGeo = new THREE.ShapeGeometry(shape), sgu = shapeGeo.attributes.uv, sgp = shapeGeo.attributes.position;
    for (var v = 0; v < sgu.count; v++) sgu.setXY(v, sgp.getX(v) / len + 0.5, sgp.getY(v) / CIN_H);   // so the wallpaper tiles evenly
    ciPart(shapeGeo, paperMat, 0, 0, 0, 0, 0, 0, wgp);
    var segs = name === 'S' ? [[-len / 2, -0.73], [0.73, len / 2]] : [[-len / 2, len / 2]];   // (on the front wall, they stop at the door's casing)
    var trim = CI.white;
    segs.forEach(function (sg) {
      var sl = sg[1] - sg[0], cx = (sg[0] + sg[1]) / 2;
      var beadTex = ciBeadTex.clone(); beadTex.needsUpdate = true; beadTex.repeat.set(sl / 1.4, 1);
      ciPart(new THREE.BoxGeometry(sl, 1.0, 0.025), new THREE.MeshStandardMaterial({ map: beadTex, bumpMap: beadTex, bumpScale: 0.01, roughness: 0.5 }), cx, 0.5, 0.0125, 0, 0, 0, wgp);
      // the chair rail: a flat band with a rounded nose and a little bead underneath
      ciPart(new THREE.BoxGeometry(sl, 0.07, 0.035), trim, cx, 1.02, 0.03, 0, 0, 0, wgp);
      ciPart(new THREE.CylinderGeometry(0.022, 0.022, sl, 12), trim, cx, 1.04, 0.05, 0, 0, Math.PI / 2, wgp);
      ciPart(new THREE.CylinderGeometry(0.008, 0.008, sl, 8), trim, cx, 0.983, 0.045, 0, 0, Math.PI / 2, wgp);
      // the skirting: a tall board on a plinth, with a moulded top
      ciPart(new THREE.BoxGeometry(sl, 0.16, 0.035), trim, cx, 0.08, 0.035, 0, 0, 0, wgp);
      ciPart(new THREE.BoxGeometry(sl, 0.03, 0.045), trim, cx, 0.015, 0.04, 0, 0, 0, wgp);
      ciPart(new THREE.CylinderGeometry(0.012, 0.012, sl, 10), trim, cx, 0.165, 0.045, 0, 0, Math.PI / 2, wgp);
      ciPart(new THREE.BoxGeometry(sl, 0.006, 0.004), new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.6 }), cx, 0.12, 0.054, 0, 0, 0, wgp);   // a routed line along it
    });
    // a picture rail
    ciPart(new THREE.BoxGeometry(len, 0.035, 0.025), trim, 0, 2.86, 0.0125, 0, 0, 0, wgp);
    ciPart(new THREE.CylinderGeometry(0.012, 0.012, len, 8), trim, 0, 2.875, 0.025, 0, 0, Math.PI / 2, wgp);
    // the cornice: a stepped crown with a deep cove, and a row of little dentils
    ciPart(new THREE.BoxGeometry(len, 0.05, 0.09), trim, 0, CIN_H - 0.025, 0.045, 0, 0, 0, wgp);
    ciPart(new THREE.CylinderGeometry(0.07, 0.07, len, 12, 1, false, 0, Math.PI / 2), trim, 0, CIN_H - 0.05, 0.0, 0, 0, Math.PI / 2, wgp).rotation.x = Math.PI;
    ciPart(new THREE.BoxGeometry(len, 0.03, 0.03), trim, 0, CIN_H - 0.135, 0.015, 0, 0, 0, wgp);
    var dent = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.03, 0.02), trim, Math.floor(len / 0.07)), dm = new THREE.Matrix4();
    for (var d = 0; d < dent.count; d++) { dm.makeTranslation(-len / 2 + 0.035 + d * 0.07, CIN_H - 0.17, 0.012); dent.setMatrixAt(d, dm); }
    wgp.add(dent);
    return wgp;
  }
  function ciWindowFrame(wgp, hx) {                                   // inside a window: six-over-six sashes, a white casing, a sill and a linen blind
    var W = CI_WIN_W, H = CI_WIN_H, y = CI_WIN_Y;
    ciPart(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, roughness: 0.05, metalness: 0.3, depthWrite: false }), hx, y, 0.03, 0, 0, 0, wgp).renderOrder = 3;
    [1 / 3, 2 / 3].forEach(function (f) { ciPart(new THREE.BoxGeometry(0.03, H, 0.035), CI.white, hx - W / 2 + f * W, y, 0.02, 0, 0, 0, wgp); });
    [0.25, 0.75].forEach(function (f) { ciPart(new THREE.BoxGeometry(W, 0.03, 0.035), CI.white, hx, y - H / 2 + f * H, 0.02, 0, 0, 0, wgp); });
    ciPart(new THREE.BoxGeometry(W, 0.06, 0.06), CI.white, hx, y, 0.03, 0, 0, 0, wgp);
    ciPart(new THREE.BoxGeometry(0.1, 0.025, 0.03), CI.brass, hx, y + 0.045, 0.07, 0, 0, 0, wgp);                       // the sash lock
    var cw = 0.11, d = 0.12;
    [[0, H / 2 + cw / 2, W + cw * 2, cw], [-W / 2 - cw / 2, 0, cw, H], [W / 2 + cw / 2, 0, cw, H]].forEach(function (f) {
      ciPart(new THREE.BoxGeometry(f[2], f[3], d), CI.white, hx + f[0], y + f[1], d / 2, 0, 0, 0, wgp);
    });
    ciPart(new THREE.BoxGeometry(W + cw * 2 + 0.1, 0.05, 0.22), CI.white, hx, y - H / 2 - 0.025, 0.11, 0, 0, 0, wgp);    // the sill
    ciPart(new THREE.BoxGeometry(W + cw * 2, 0.09, 0.03), CI.white, hx, y - H / 2 - 0.09, 0.015, 0, 0, 0, wgp);
    var blind = new THREE.PlaneGeometry(W + 0.06, 0.34, 1, 6), bp = blind.attributes.position;   // a linen roman blind, pulled up in soft folds
    for (var v = 0; v < bp.count; v++) bp.setZ(v, Math.abs(Math.sin((bp.getY(v) + 0.17) / 0.34 * Math.PI * 3)) * 0.04);
    blind.computeVertexNormals();
    ciPart(blind, new THREE.MeshStandardMaterial({ color: 0xefe6d6, roughness: 0.95, side: THREE.DoubleSide }), hx, y + H / 2 - 0.15, 0.07, 0, 0, 0, wgp);
  }
  var CNW = -CIN_D / 2;
  ciWall('N', 0, CNW, 0, CIN_W);
  ciWall('S', 0, -CNW, Math.PI, CIN_W);
  ciWall('W', -CIN_W / 2, 0, Math.PI / 2, CIN_D);
  ciWall('E', CIN_W / 2, 0, -Math.PI / 2, CIN_D);
  function ciWallPart(name, geo, mat, x, y, z, rx, ry, rz) { return ciPart(geo, mat, x, y, z, rx, ry, rz, ciWalls[name].g); }
  function ciFramed(name, x, y, w, h, tex, frameMat) {                 // a framed picture or sign on a wall (x along the wall, from the room's middle)
    ciWallPart(name, new THREE.BoxGeometry(w + 0.08, h + 0.08, 0.03), frameMat || CI.darkWood, x, y, 0.015);
    ciWallPart(name, new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }), x, y, 0.032);
    ciWallPart(name, new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.07, depthWrite: false }), x, y, 0.036);
  }

  // the front door, seen from inside: a teal four-panel door in a moulded white casing with plinth blocks and a crown,
  // six panes of glass (and a transom above) that look out on the square, raised and bevelled lower panels, a brass
  // lever handle on a backplate with a thumb-turn lock, three brass hinges, a kick plate and an oak threshold
  var DR_W = 1.2, DR_H = 2.3;
  var ciDoorTeal = new THREE.MeshStandardMaterial({ color: 0x2f6f68, roughness: 0.38 });
  var ciDoorPanel = new THREE.MeshStandardMaterial({ color: 0x3b7f77, roughness: 0.4 });
  var ciTrim = new THREE.MeshStandardMaterial({ color: 0xf8f6f0, roughness: 0.45 });
  [-1, 1].forEach(function (s) {                                       // the casing: fluted sides on plinth blocks
    ciWallPart('S', ciRoundBox(0.13, 2.55, 0.04, 0.01), ciTrim, s * (DR_W / 2 + 0.075), 1.275, 0.02);
    [-0.035, 0, 0.035].forEach(function (fl) { ciWallPart('S', new THREE.BoxGeometry(0.012, 2.2, 0.006), new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: 0.5 }), s * (DR_W / 2 + 0.075) + fl, 1.33, 0.041); });
    ciWallPart('S', ciRoundBox(0.16, 0.22, 0.055, 0.01), ciTrim, s * (DR_W / 2 + 0.075), 0.11, 0.028);
    ciWallPart('S', ciRoundBox(0.17, 0.17, 0.055, 0.01), ciTrim, s * (DR_W / 2 + 0.075), 2.64, 0.028);                // corner blocks
    ciWallPart('S', new THREE.TorusGeometry(0.04, 0.008, 6, 20), new THREE.MeshStandardMaterial({ color: 0xe6e2d8, roughness: 0.5 }), s * (DR_W / 2 + 0.075), 2.64, 0.057);   // with a carved rosette
  });
  ciWallPart('S', ciRoundBox(DR_W, 0.13, 0.04, 0.01), ciTrim, 0, 2.64, 0.02);                                         // the head casing
  ciWallPart('S', ciRoundBox(DR_W + 0.42, 0.05, 0.1, 0.012), ciTrim, 0, 2.735, 0.05);                                 // its crown
  ciWallPart('S', ciRoundBox(DR_W + 0.34, 0.025, 0.07, 0.008), ciTrim, 0, 2.7, 0.035);
  // the transom light over the door: three panes, looking outside
  ciWallPart('S', new THREE.BoxGeometry(DR_W, 0.3, 0.02), ciTrim, 0, 2.43, 0.01);
  ciPart(new THREE.PlaneGeometry(DR_W - 0.08, 0.22), siWindowMask, 0, 2.43, 0.021, 0, 0, 0, ciWalls.S.g).castShadow = false;
  ciWallPart('S', new THREE.PlaneGeometry(DR_W - 0.08, 0.22), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, opacity: 0.6, roughness: 0.05, depthWrite: false }), 0, 2.43, 0.024).renderOrder = 3;
  [-0.19, 0.19].forEach(function (tx) { ciWallPart('S', new THREE.BoxGeometry(0.025, 0.22, 0.03), ciTrim, tx, 2.43, 0.03); });
  // the door itself: stiles, rails, glass and panels
  ciWallPart('S', ciRoundBox(DR_W, DR_H, 0.05, 0.008), ciDoorTeal, 0, DR_H / 2, 0.045);
  var GL_Y = 1.62, GL_W = 0.78, GL_H = 0.95;
  ciPart(new THREE.PlaneGeometry(GL_W, GL_H), siWindowMask, 0, GL_Y, 0.0705, 0, 0, 0, ciWalls.S.g).castShadow = false;
  ciWallPart('S', new THREE.PlaneGeometry(GL_W, GL_H), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, opacity: 0.6, roughness: 0.05, depthWrite: false }), 0, GL_Y, 0.074).renderOrder = 3;
  [[0, GL_H / 2 + 0.025, GL_W + 0.1, 0.05], [0, -GL_H / 2 - 0.025, GL_W + 0.1, 0.05], [-GL_W / 2 - 0.025, 0, 0.05, GL_H], [GL_W / 2 + 0.025, 0, 0.05, GL_H]].forEach(function (b) {   // a moulded bead round the glass
    ciWallPart('S', ciRoundBox(b[2], b[3], 0.025, 0.008), ciDoorPanel, b[0], GL_Y + b[1], 0.08);
  });
  ciWallPart('S', new THREE.BoxGeometry(0.022, GL_H, 0.022), ciTrim, 0, GL_Y, 0.08);                                   // white glazing bars: two across and three down
  [-GL_H / 6, GL_H / 6].forEach(function (gy) { ciWallPart('S', new THREE.BoxGeometry(GL_W, 0.022, 0.022), ciTrim, 0, GL_Y + gy, 0.08); });
  ciWallPart('S', ciRoundBox(DR_W - 0.16, 0.06, 0.02, 0.008), ciDoorPanel, 0, 1.08, 0.075);                            // the lock rail
  [-0.255, 0.255].forEach(function (px) {                              // two raised, bevelled lower panels
    var PW = 0.4, PH = 0.72, PY = 0.56;
    ciWallPart('S', new THREE.BoxGeometry(PW + 0.04, PH + 0.04, 0.008), new THREE.MeshStandardMaterial({ color: 0x245a54, roughness: 0.45 }), px, PY, 0.072);   // the shadowed groove round it
    ciWallPart('S', ciRoundBox(PW, PH, 0.03, 0.012), ciDoorPanel, px, PY, 0.08);
    ciWallPart('S', ciRoundBox(PW - 0.12, PH - 0.12, 0.012, 0.006), ciDoorTeal, px, PY, 0.097);                         // its raised field
  });
  ciWallPart('S', ciRoundBox(DR_W - 0.12, 0.16, 0.006, 0.004), CI.brass, 0, 0.1, 0.073);                                // the brass kick plate
  [-0.5, 0.5].forEach(function (sx) { [0.05, 0.15].forEach(function (sy) { ciWallPart('S', new THREE.CylinderGeometry(0.006, 0.006, 0.004, 8), CI.brass, sx, sy, 0.077, Math.PI / 2, 0, 0); }); });
  // the handle: a backplate, a curved brass lever, a keyhole, and a thumb-turn lock above
  var HX = -0.46;
  ciWallPart('S', ciRoundBox(0.06, 0.24, 0.012, 0.012), CI.brass, HX, 1.05, 0.077);
  ciWallPart('S', new THREE.CylinderGeometry(0.018, 0.022, 0.04, 14), CI.brass, HX, 1.1, 0.1, Math.PI / 2, 0, 0);
  var lever = new THREE.CatmullRomCurve3([new THREE.Vector3(HX, 1.1, 0.115), new THREE.Vector3(HX + 0.04, 1.1, 0.128), new THREE.Vector3(HX + 0.11, 1.097, 0.13), new THREE.Vector3(HX + 0.14, 1.088, 0.124)]);
  ciPart(new THREE.TubeGeometry(lever, 16, 0.009, 8), CI.brass, 0, 0, 0, 0, 0, 0, ciWalls.S.g);
  ciWallPart('S', new THREE.SphereGeometry(0.012, 10, 8), CI.brass, HX + 0.142, 1.088, 0.123);
  ciWallPart('S', new THREE.BoxGeometry(0.008, 0.022, 0.004), CI.black, HX, 0.995, 0.085);                             // the keyhole
  ciWallPart('S', new THREE.CylinderGeometry(0.022, 0.022, 0.01, 18), CI.brass, HX, 1.3, 0.077, Math.PI / 2, 0, 0);     // the thumb-turn
  ciWallPart('S', ciRoundBox(0.012, 0.04, 0.016, 0.005), CI.brass, HX, 1.3, 0.088);
  [0.3, 1.2, 2.05].forEach(function (hy) {                             // three brass butt hinges on the other side
    ciWallPart('S', ciRoundBox(0.035, 0.1, 0.006, 0.003), CI.brass, DR_W / 2 - 0.01, hy, 0.072);
    ciWallPart('S', new THREE.CylinderGeometry(0.008, 0.008, 0.105, 8), CI.brass, DR_W / 2 + 0.005, hy, 0.074);
    [-0.05, 0.05].forEach(function (cp) { ciWallPart('S', new THREE.SphereGeometry(0.008, 8, 6), CI.brass, DR_W / 2 + 0.005, hy + cp, 0.074); });
  });
  ciPart(new THREE.BoxGeometry(DR_W + 0.1, 0.012, 0.12), CI_OAK, 0, 0.006, CIN_D / 2 - 0.06);                          // the oak threshold
  ciPart(new THREE.CylinderGeometry(0.02, 0.025, 0.035, 12), CI.brass, -0.62, 0.0175, CIN_D / 2 - 0.55);               // a little brass door stop on the floor
  ciPart(new THREE.SphereGeometry(0.02, 10, 8), new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.9 }), -0.62, 0.04, CIN_D / 2 - 0.55);
  var CIN_EXIT_Z = CIN_D / 2 - 0.6;
  // a schoolhouse clock over the door: a teal case with a brass bezel and a domed glass, a painted face with numerals,
  // spade hands and a red second hand that ticks round
  var CLK_Y = 3.03, CLK_R = 0.2;
  var ciClockTex = paintTexture(512, 512, function (g, w, h) {
    var cx = w / 2, cy = h / 2, R = w / 2 - 4;
    var fg = g.createRadialGradient(cx - 60, cy - 60, 20, cx, cy, R); fg.addColorStop(0, '#fffdf6'); fg.addColorStop(1, '#efe6d2');
    g.fillStyle = fg; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2f6f68'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R - 34, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(cx, cy, R - 12, 0, Math.PI * 2); g.stroke();
    for (var m = 0; m < 60; m++) {                                     // minute marks between the two rings, bolder at each hour
      var a = m / 60 * Math.PI * 2, big = m % 5 === 0, r0 = R - 34, r1 = big ? R - 12 : R - 22;
      g.strokeStyle = big ? '#1e1e24' : '#5a5a60'; g.lineWidth = big ? 6 : 2;
      g.beginPath(); g.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0); g.lineTo(cx + Math.sin(a) * r1, cy - Math.cos(a) * r1); g.stroke();
    }
    g.fillStyle = '#1e1e24'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 50px Georgia, serif';
    for (var n = 1; n <= 12; n++) { var na = n / 12 * Math.PI * 2; g.fillText(String(n), cx + Math.sin(na) * (R - 82), cy - Math.cos(na) * (R - 82) + 2); }
    g.fillStyle = '#2f6f68'; g.font = 'italic bold 24px Georgia, serif'; g.fillText('Everdawn', cx, cy - 82);
    g.font = '15px Georgia, serif'; g.fillStyle = '#7a6a5a'; g.fillText('♥  CLINIC  ♥', cx, cy + 86);
  });
  ciClockTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var clkCase = []; [[0.001, -0.03], [CLK_R + 0.03, -0.03], [CLK_R + 0.045, -0.005], [CLK_R + 0.045, 0.03], [CLK_R + 0.03, 0.045], [CLK_R + 0.01, 0.045], [CLK_R + 0.005, 0.01]].forEach(function (q) { clkCase.push(new THREE.Vector2(q[0], q[1])); });
  ciWallPart('S', new THREE.LatheGeometry(clkCase, 48), ciDoorTeal, 0, CLK_Y, 0.03, Math.PI / 2, 0, 0);                // the case
  ciWallPart('S', new THREE.TorusGeometry(CLK_R + 0.012, 0.01, 10, 48), CI.brass, 0, CLK_Y, 0.077);                     // the brass bezel
  ciWallPart('S', new THREE.CircleGeometry(CLK_R + 0.005, 48), new THREE.MeshStandardMaterial({ map: ciClockTex, roughness: 0.6 }), 0, CLK_Y, 0.042);
  function ciHand(len, wide, tail, spade, mat, z) {                    // a clock hand pointing up, turning about its base
    var sh = new THREE.Shape(); sh.moveTo(-wide / 2, -tail); sh.lineTo(wide / 2, -tail); sh.lineTo(wide * 0.35, len * 0.7);
    if (spade) { sh.lineTo(wide * 1.4, len * 0.78); sh.lineTo(0, len); sh.lineTo(-wide * 1.4, len * 0.78); } else sh.lineTo(0, len);
    sh.lineTo(-wide * 0.35, len * 0.7); sh.lineTo(-wide / 2, -tail);
    return ciWallPart('S', new THREE.ExtrudeGeometry(sh, { depth: 0.003, bevelEnabled: false }), mat, 0, CLK_Y, z);
  }
  var ciHourHand = ciHand(0.105, 0.012, 0.02, true, CI.black, 0.046);
  var ciMinHand = ciHand(0.16, 0.008, 0.025, true, CI.black, 0.05);
  var ciSecHand = ciHand(0.17, 0.003, 0.045, false, new THREE.MeshStandardMaterial({ color: 0xd04a5a, roughness: 0.4 }), 0.054);
  ciWallPart('S', new THREE.CylinderGeometry(0.01, 0.01, 0.014, 14), CI.brass, 0, CLK_Y, 0.056, Math.PI / 2, 0, 0);    // the centre cap
  var clkDome = ciWallPart('S', new THREE.SphereGeometry(CLK_R + 0.01, 32, 12, 0, Math.PI * 2, 0, 0.55), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.03, metalness: 0.3, transparent: true, opacity: 0.12, depthWrite: false }), 0, CLK_Y, 0.07 - (CLK_R + 0.01) * Math.cos(0.55), Math.PI / 2, 0, 0);
  clkDome.renderOrder = 3; clkDome.castShadow = false;
  ciWallPart('S', new THREE.PlaneGeometry(CLK_R * 1.6, CLK_R * 1.6), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, opacity: 0.45, roughness: 0.05, depthWrite: false }), 0, CLK_Y, 0.076).renderOrder = 4;   // a glint on the glass


  // ----- the waiting room, on the left -----
  // the reception desk, facing the door: a teal front of raised and bevelled panels between fluted pilasters, a white
  // marble-look transaction ledge on brass brackets with a brass footrail below, a brass "Welcome" plaque, an oak desk
  // top behind, and a drawer pedestal at each end
  var RCP_X = -2.6, RCP_Z = -0.7, RCP_L = 2.6, RF = RCP_Z + 0.35;   // RF: the front face
  var rcpPanel = new THREE.MeshStandardMaterial({ color: 0x3b7f77, roughness: 0.4 }), rcpGroove = new THREE.MeshStandardMaterial({ color: 0x245a54, roughness: 0.45 });
  var rcpTop = new THREE.MeshStandardMaterial({ color: 0xf6f4ef, roughness: 0.18, metalness: 0.02 });
  ciPart(ciRoundBox(RCP_L, 1.0, 0.1, 0.01), CI.teal, RCP_X, 0.5, RCP_Z + 0.3);
  ciPart(new THREE.BoxGeometry(RCP_L - 0.04, 0.1, 0.04), CI_KICK, RCP_X, 0.05, RF + 0.005);                             // the toe kick
  ciPart(ciRoundBox(RCP_L + 0.04, 0.05, 0.05, 0.012), CI.white, RCP_X, 0.125, RF + 0.02);                               // the base moulding
  for (var rp = 0; rp < 4; rp++) {                                     // four raised, bevelled panels
    var rpx = RCP_X - RCP_L / 2 + (rp + 0.5) * RCP_L / 4, rpw = RCP_L / 4 - 0.2;
    ciPart(new THREE.BoxGeometry(rpw + 0.04, 0.66, 0.006), rcpGroove, rpx, 0.53, RF + 0.003);
    ciPart(ciRoundBox(rpw, 0.62, 0.025, 0.01), rcpPanel, rpx, 0.53, RF + 0.012);
    ciPart(ciRoundBox(rpw - 0.12, 0.5, 0.012, 0.006), CI.teal, rpx, 0.53, RF + 0.027);
  }
  for (var pl = 0; pl <= 4; pl++) {                                    // fluted pilasters between them
    var plx = RCP_X - RCP_L / 2 + pl * RCP_L / 4 + (pl === 0 ? 0.04 : pl === 4 ? -0.04 : 0);
    ciPart(ciRoundBox(0.08, 0.72, 0.03, 0.008), CI.teal, plx, 0.52, RF + 0.015);
    [-0.02, 0, 0.02].forEach(function (fl) { ciPart(new THREE.BoxGeometry(0.008, 0.6, 0.004), rcpGroove, plx + fl, 0.52, RF + 0.031); });
    ciPart(ciRoundBox(0.1, 0.035, 0.04, 0.008), CI.white, plx, 0.89, RF + 0.02);
  }
  ciPart(ciRoundBox(RCP_L + 0.04, 0.04, 0.05, 0.01), CI.white, RCP_X, 0.92, RF + 0.02);                                 // the frieze moulding
  ciPart(new THREE.BoxGeometry(RCP_L - 0.04, 0.1, 0.02), CI.white, RCP_X, 0.99, RF + 0.005);
  ciPart(ciRoundBox(RCP_L + 0.2, 0.045, 0.34, 0.015), rcpTop, RCP_X, 1.07, RCP_Z + 0.33);                               // the ledge, with a brass edge
  ciPart(new THREE.BoxGeometry(RCP_L + 0.16, 0.012, 0.012), CI.brass, RCP_X, 1.05, RCP_Z + 0.5);
  [-1.05, -0.35, 0.35, 1.05].forEach(function (bx) {                   // brass brackets under the ledge
    var br = new THREE.Shape(); br.moveTo(0, 0); br.lineTo(0.09, 0); br.quadraticCurveTo(0.02, -0.02, 0, -0.09); br.lineTo(0, 0);
    ciPart(new THREE.ExtrudeGeometry(br, { depth: 0.012, bevelEnabled: false }), CI.brass, RCP_X + bx - 0.006, 1.047, RF + 0.005, 0, -Math.PI / 2, 0);
  });
  ciRod(new THREE.Vector3(RCP_X - RCP_L / 2 + 0.1, 0.2, RF + 0.13), new THREE.Vector3(RCP_X + RCP_L / 2 - 0.1, 0.2, RF + 0.13), 0.016, CI.brass);   // the footrail
  [-1.1, 0, 1.1].forEach(function (fx) {
    ciRod(new THREE.Vector3(RCP_X + fx, 0.2, RF + 0.13), new THREE.Vector3(RCP_X + fx, 0.2, RF + 0.01), 0.01, CI.brass);
    ciPart(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 16), CI.brass, RCP_X + fx, 0.2, RF + 0.01, Math.PI / 2, 0, 0);
  });
  [-1.3, 1.3].forEach(function (ex) { ciPart(new THREE.SphereGeometry(0.022, 12, 8), CI.brass, RCP_X + ex, 0.2, RF + 0.13); });
  var rcpPlaqueTex = paintTexture(256, 64, function (g, w, h) {
    var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#f6dc8a'); bg.addColorStop(0.5, '#c9a24a'); bg.addColorStop(1, '#a8802c');
    g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = '#7a5a1a'; g.lineWidth = 3; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = '#3a2a0a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'italic bold 30px Georgia, serif'; g.fillText('♥ Welcome ♥', w / 2, h / 2 + 2);
  });
  ciPart(new THREE.PlaneGeometry(0.4, 0.1), new THREE.MeshStandardMaterial({ map: rcpPlaqueTex, metalness: 0.5, roughness: 0.3 }), RCP_X, 0.99, RF + 0.016);
  [-1, 1].forEach(function (s) {                                       // the end panels and a drawer pedestal at each end, behind
    ciPart(ciRoundBox(0.1, 1.0, 0.7, 0.01), CI.teal, RCP_X + s * (RCP_L / 2 - 0.05), 0.5, RCP_Z);
    var px = RCP_X + s * (RCP_L / 2 - 0.33);
    ciPart(ciRoundBox(0.44, 0.72, 0.5, 0.01), CI.white, px, 0.38, RCP_Z - 0.1);
    [0.62, 0.42, 0.18].forEach(function (dy, k) {
      ciPart(ciRoundBox(0.4, k === 2 ? 0.26 : 0.17, 0.02, 0.006), CI.mint, px, dy, RCP_Z - 0.36);
      ciPart(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8), CI_CHROME, px, dy + 0.02, RCP_Z - 0.39, 0, 0, Math.PI / 2);
    });
  });
  ciPart(ciRoundBox(RCP_L + 0.1, 0.045, 0.78, 0.01), CI_OAK, RCP_X, 0.78, RCP_Z - 0.02);                                // the oak desk top behind
  ciPart(new THREE.BoxGeometry(RCP_L, 0.26, 0.04), CI.white, RCP_X, 0.92, RCP_Z + 0.2);
  // a cable grommet in the desk top
  ciPart(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 16), CI_KICK, RCP_X - 0.2, 0.805, RCP_Z + 0.08);

  // on the ledge: a brass service bell on a wooden base
  var BL_X = RCP_X + 0.7, BL_Z = RCP_Z + 0.33, BL_Y = 1.0925;
  ciPart(new THREE.CylinderGeometry(0.07, 0.075, 0.025, 24), CI.darkWood, BL_X, BL_Y + 0.0125, BL_Z);
  ciPart(new THREE.TorusGeometry(0.072, 0.004, 6, 28), CI.brass, BL_X, BL_Y + 0.025, BL_Z, Math.PI / 2, 0, 0);
  var bellG = []; for (var bj = 0; bj <= 12; bj++) { var ba = bj / 12 * Math.PI / 2; bellG.push(new THREE.Vector2(Math.sin(ba) * 0.056, Math.cos(ba) * 0.05)); }
  var bellBrass = new THREE.MeshStandardMaterial({ color: 0xf2c860, emissive: 0x6a4a10, emissiveIntensity: 0.35, metalness: 0.75, roughness: 0.22 });   // polished brass, so it gleams
  ciPart(new THREE.LatheGeometry(bellG, 28), bellBrass, BL_X, BL_Y + 0.03, BL_Z);
  ciPart(new THREE.CylinderGeometry(0.006, 0.006, 0.02, 8), bellBrass, BL_X, BL_Y + 0.09, BL_Z);
  ciPart(new THREE.SphereGeometry(0.012, 10, 8), CI.black, BL_X, BL_Y + 0.105, BL_Z).scale.set(1, 0.6, 1);
  // a glass jar of lollipops with a pink lid and a little label
  var JR_X = RCP_X - 0.75, JR_Z = RCP_Z + 0.33;
  var jarPts = []; [[0.001, 0], [0.085, 0], [0.09, 0.01], [0.09, 0.2], [0.075, 0.215], [0.06, 0.22], [0.06, 0.235]].forEach(function (q) { jarPts.push(new THREE.Vector2(q[0], q[1])); });
  ciPart(new THREE.LatheGeometry(jarPts, 28), new THREE.MeshStandardMaterial({ color: 0xeef7ff, roughness: 0.03, metalness: 0.1, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false }), JR_X, BL_Y, JR_Z).renderOrder = 3;
  ciPart(new THREE.CylinderGeometry(0.07, 0.068, 0.03, 24), CI.coral, JR_X, BL_Y + 0.25, JR_Z);
  ciPart(new THREE.SphereGeometry(0.018, 12, 8), CI.coral, JR_X, BL_Y + 0.27, JR_Z);
  var jarLabel = paintTexture(128, 48, function (g, w, h) { g.fillStyle = '#fffaf0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#e0607a'; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = '#c8344a'; g.textAlign = 'center'; g.font = 'italic bold 20px Georgia, serif'; g.fillText('Brave Pops', w / 2, 30); });
  ciPart(new THREE.CylinderGeometry(0.0905, 0.0905, 0.05, 28, 1, true, -0.6, 1.2), new THREE.MeshStandardMaterial({ map: jarLabel, roughness: 0.7, side: THREE.DoubleSide }), JR_X, BL_Y + 0.07, JR_Z);
  for (var lp = 0; lp < 11; lp++) {                                    // lollipops: swirled candy on paper sticks
    var la = lp * 2.4, lr = 0.025 + (lp % 3) * 0.02, lh = 0.05 + (lp % 4) * 0.035;
    var top = new THREE.Vector3(JR_X + Math.cos(la) * lr, BL_Y + lh + 0.06, JR_Z + Math.sin(la) * lr);
    ciRod(new THREE.Vector3(JR_X + Math.cos(la) * lr * 0.5, BL_Y + 0.005, JR_Z + Math.sin(la) * lr * 0.5), top, 0.003, CI.paper);
    var lc = [0xff6a8a, 0xffd04a, 0x7ad0a0, 0x9a8aff, 0xff9a4a][lp % 5];
    var pop = ciPart(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 18), new THREE.MeshStandardMaterial({ color: lc, roughness: 0.15 }), top.x, top.y + 0.02, top.z, Math.PI / 2, la, 0);
    ciPart(new THREE.TorusGeometry(0.015, 0.003, 6, 16), CI.paper, 0, 0.0065, 0, Math.PI / 2, 0, 0, pop);              // the white swirl
  }
  // a sign-in clipboard with a pen on a little chain
  var SN_X = RCP_X + 0.1, SN_Z = RCP_Z + 0.32;
  var signTex = paintTexture(128, 176, function (g, w, h) {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f6f68'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.fillText('Please sign in ♥', w / 2, 18);
    g.strokeStyle = 'rgba(80,100,120,0.4)'; g.lineWidth = 1; g.font = '8px sans-serif'; g.textAlign = 'left';
    g.fillStyle = '#7a7a80'; g.fillText('NAME', 8, 32); g.fillText('TIME', 88, 32);
    for (var r = 0; r < 10; r++) { g.beginPath(); g.moveTo(6, 44 + r * 13); g.lineTo(w - 6, 44 + r * 13); g.stroke(); }
    g.beginPath(); g.moveTo(84, 26); g.lineTo(84, h - 6); g.stroke();
    g.strokeStyle = '#3a4a8a'; g.lineWidth = 1.2;
    for (var n = 0; n < 4; n++) { g.beginPath(); g.moveTo(10, 41 + n * 13); for (var x = 10; x < 40 + isle2Hash(n + 4) * 30; x += 3) g.lineTo(x, 41 + n * 13 + Math.sin(x + n) * 1.6); g.stroke(); g.fillStyle = '#3a4a8a'; g.fillText((8 + n) + ':' + (n * 15 || '00'), 90, 42 + n * 13); }
  });
  var snG = new THREE.Group(); snG.position.set(SN_X, BL_Y, SN_Z); snG.rotation.y = 0.15; clinicRoom.add(snG);
  ciPart(ciRoundBox(0.23, 0.008, 0.32, 0.004), new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.6 }), 0, 0.004, 0, 0, 0, 0, snG);
  ciPart(new THREE.PlaneGeometry(0.2, 0.275), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.9 }), 0, 0.0085, 0.012, -Math.PI / 2, Math.PI, 0, snG);
  ciPart(ciRoundBox(0.1, 0.014, 0.035, 0.005), CI_CHROME, 0, 0.012, -0.14, 0, 0, 0, snG);
  ciPart(new THREE.CylinderGeometry(0.005, 0.005, 0.14, 8), CI.teal, 0.15, 0.007, 0.02, Math.PI / 2, 0.5, 0, snG);
  var chain = new THREE.CatmullRomCurve3([new THREE.Vector3(0.05, 0.012, -0.14), new THREE.Vector3(0.12, 0.006, -0.1), new THREE.Vector3(0.18, 0.006, -0.03)]);
  ciPart(new THREE.TubeGeometry(chain, 10, 0.0015, 4), CI_CHROME, 0, 0, 0, 0, 0, 0, snG);
  // a little white orchid in a teal pot at the end of the ledge
  var OR_X = RCP_X + 1.2, OR_Z = RCP_Z + 0.33;
  ciPart(new THREE.CylinderGeometry(0.05, 0.04, 0.09, 18), CI.teal, OR_X, BL_Y + 0.045, OR_Z);
  ciPart(new THREE.CylinderGeometry(0.046, 0.046, 0.005, 14), new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 1 }), OR_X, BL_Y + 0.085, OR_Z);
  for (var ol = 0; ol < 3; ol++) { var oa = ol * 2.1; var olf = ciPart(new THREE.SphereGeometry(1, 10, 6), new THREE.MeshStandardMaterial({ color: 0x2f5a2c, roughness: 0.4 }), OR_X + Math.cos(oa) * 0.04, BL_Y + 0.095, OR_Z + Math.sin(oa) * 0.04); olf.scale.set(0.06, 0.008, 0.025); olf.rotation.y = -oa; }
  var spike = new THREE.CatmullRomCurve3([new THREE.Vector3(OR_X, BL_Y + 0.09, OR_Z), new THREE.Vector3(OR_X, BL_Y + 0.3, OR_Z), new THREE.Vector3(OR_X - 0.05, BL_Y + 0.36, OR_Z), new THREE.Vector3(OR_X - 0.12, BL_Y + 0.33, OR_Z)]);
  ciPart(new THREE.TubeGeometry(spike, 16, 0.003, 5), CI.leaf, 0, 0, 0);
  for (var of = 0; of < 5; of++) {
    var fp = spike.getPoint(0.55 + of * 0.1), fgp = new THREE.Group(); fgp.position.copy(fp); fgp.position.y -= 0.02; fgp.rotation.set(0, Math.PI / 2, 0.3); clinicRoom.add(fgp);
    for (var op = 0; op < 5; op++) { var opa = op / 5 * Math.PI * 2; var pe = ciPart(new THREE.CircleGeometry(0.016, 10), new THREE.MeshStandardMaterial({ color: 0xfdfbff, roughness: 0.5, side: THREE.DoubleSide }), Math.cos(opa) * 0.013, Math.sin(opa) * 0.013, 0, 0, 0, opa, fgp); pe.scale.set(1.2, 0.85, 1); pe.castShadow = false; }
    ciPart(new THREE.SphereGeometry(0.006, 6, 4), new THREE.MeshStandardMaterial({ color: 0xf2b63a }), 0, 0, 0.004, 0, 0, 0, fgp);
  }
  // a little framed photo of the island, facing the visitors
  var photoTex = paintTexture(128, 96, function (g, w, h) {
    var sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#9fd8ff'); sky.addColorStop(1, '#ffe0f0'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7ac860'; g.beginPath(); g.ellipse(w / 2, h, 70, 30, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#f4b8d8'; g.beginPath(); g.arc(w / 2, 46, 22, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6a4a3a'; g.fillRect(w / 2 - 3, 50, 6, 26);
  });
  var pf = new THREE.Group(); pf.position.set(RCP_X - 1.15, BL_Y, RCP_Z + 0.36); pf.rotation.set(-0.2, 0.25, 0); clinicRoom.add(pf);
  ciPart(ciRoundBox(0.16, 0.13, 0.015, 0.005), CI.brass, 0, 0.065, 0, 0, 0, 0, pf);
  ciPart(new THREE.PlaneGeometry(0.13, 0.1), new THREE.MeshStandardMaterial({ map: photoTex, roughness: 0.5 }), 0, 0.065, 0.008, 0, 0, 0, pf);
  // behind the ledge: a slim computer monitor on a stand, a keyboard with keys, a mouse on a mat, a desk phone, an
  // appointment book, a pen pot, a stack of files in a tray, a stapler and a mug
  var MN_X = RCP_X - 0.2, MN_Z = RCP_Z - 0.2, DT = 0.8025;
  ciPart(ciRoundBox(0.6, 0.37, 0.025, 0.012), CI.black, MN_X, 1.13, MN_Z);
  ciPart(new THREE.PlaneGeometry(0.565, 0.32), new THREE.MeshStandardMaterial({ map: ciScreenTex, emissive: 0xffffff, emissiveMap: ciScreenTex, emissiveIntensity: 0.75, roughness: 0.2 }), MN_X, 1.135, MN_Z - 0.0135, 0, Math.PI, 0);
  ciPart(ciRoundBox(0.6, 0.37, 0.025, 0.012), CI_ALU, MN_X, 1.13, MN_Z + 0.006).scale.set(0.98, 0.98, 0.5);            // its silver back
  ciPart(ciRoundBox(0.06, 0.26, 0.02, 0.008), CI_ALU, MN_X, 0.93, MN_Z + 0.03, -0.12, 0, 0);
  ciPart(ciRoundBox(0.22, 0.012, 0.16, 0.006), CI_ALU, MN_X, DT + 0.006, MN_Z + 0.02);
  var rcpKeys = new THREE.MeshStandardMaterial({ color: 0xf2f2f0, roughness: 0.5 });
  ciPart(ciRoundBox(0.44, 0.016, 0.14, 0.006), CI_ALU, MN_X, DT + 0.008, RCP_Z - 0.46);
  for (var kr = 0; kr < 4; kr++) for (var kc = 0; kc < 15; kc++) ciPart(new THREE.BoxGeometry(0.022, 0.006, 0.022), rcpKeys, MN_X - 0.2 + kc * 0.0285 + (kr % 2) * 0.006, DT + 0.018, RCP_Z - 0.5 + kr * 0.028);
  ciPart(new THREE.BoxGeometry(0.16, 0.006, 0.022), rcpKeys, MN_X, DT + 0.018, RCP_Z - 0.395);                           // the space bar
  ciPart(ciRoundBox(0.2, 0.004, 0.16, 0.01), CI.teal, RCP_X + 0.2, DT + 0.002, RCP_Z - 0.46);                           // the mouse mat and mouse
  ciPart(new THREE.SphereGeometry(0.03, 14, 10), CI.white, RCP_X + 0.2, DT + 0.008, RCP_Z - 0.46).scale.set(0.9, 0.5, 1.4);
  ciPart(new THREE.BoxGeometry(0.002, 0.004, 0.03), CI_KICK, RCP_X + 0.2, DT + 0.023, RCP_Z - 0.48);
  // the desk phone: a body with a keypad and little screen, and a curly corded handset
  var PH_X = RCP_X - 1.0, PH_Z = RCP_Z - 0.3;
  var phG = new THREE.Group(); phG.position.set(PH_X, DT, PH_Z); phG.rotation.y = 0.3; clinicRoom.add(phG);
  ciPart(ciRoundBox(0.2, 0.05, 0.2, 0.015), CI.white, 0, 0.025, 0, -0.15, 0, 0, phG);
  for (var pk = 0; pk < 12; pk++) ciPart(new THREE.BoxGeometry(0.018, 0.006, 0.014), CI_KICK, -0.02 + (pk % 3) * 0.025, 0.05 + 0.006 * Math.floor(pk / 3) * 0.5, 0.06 - Math.floor(pk / 3) * 0.022, -0.15, 0, 0, phG);
  ciPart(new THREE.PlaneGeometry(0.06, 0.025), new THREE.MeshStandardMaterial({ color: 0x9adfc8, emissive: 0x6ac8a8, emissiveIntensity: 0.4 }), 0.06, 0.058, 0.03, -Math.PI / 2 - 0.15, 0, 0, phG);
  ciPart(ciRoundBox(0.2, 0.03, 0.045, 0.014), CI.white, -0.05, 0.07, -0.04, 0, Math.PI / 2, 0, phG);
  [-1, 1].forEach(function (s) { ciPart(ciRoundBox(0.05, 0.035, 0.055, 0.015), CI.white, -0.05, 0.065, -0.04 + s * 0.085, 0, 0, 0, phG); });
  var coil = []; for (var cp = 0; cp <= 60; cp++) { var ct = cp / 60; coil.push(new THREE.Vector3(-0.08 - Math.sin(ct * Math.PI) * 0.06 + Math.cos(cp * 1.6) * 0.008, 0.06 - ct * 0.04 + Math.sin(cp * 1.6) * 0.008, -0.12 + ct * 0.14)); }
  ciPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 140, 0.003, 4), CI.white, 0, 0, 0, 0, 0, 0, phG);
  // an open appointment book
  var bookTex = paintTexture(256, 160, function (g, w, h) {
    g.fillStyle = '#fbf8ef'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(w / 2 - 3, 0, 6, h);
    g.strokeStyle = 'rgba(80,140,170,0.4)'; g.lineWidth = 1;
    for (var r = 0; r < 12; r++) { g.beginPath(); g.moveTo(8, 22 + r * 11); g.lineTo(w / 2 - 8, 22 + r * 11); g.moveTo(w / 2 + 8, 22 + r * 11); g.lineTo(w - 8, 22 + r * 11); g.stroke(); }
    g.fillStyle = '#2f6f68'; g.font = 'bold 11px Georgia, serif'; g.fillText('MONDAY', 10, 14); g.fillText('TUESDAY', w / 2 + 10, 14);
    g.strokeStyle = '#3a4a8a'; for (var n = 0; n < 9; n++) { var px = n % 2 ? w / 2 + 12 : 12, py = 20 + Math.floor(n / 2) * 22; g.beginPath(); g.moveTo(px, py); for (var x = 0; x < 40 + isle2Hash(n) * 50; x += 3) g.lineTo(px + x, py + Math.sin(x + n) * 1.4); g.stroke(); }
    g.fillStyle = '#e0607a'; g.beginPath(); g.arc(w - 20, h - 18, 5, 0, Math.PI * 2); g.fill();
  });
  ciPart(ciRoundBox(0.34, 0.012, 0.23, 0.004), CI.coral, RCP_X + 0.55, DT + 0.006, RCP_Z - 0.32, 0, -0.1, 0);
  ciPart(new THREE.PlaneGeometry(0.32, 0.21), new THREE.MeshStandardMaterial({ map: bookTex, roughness: 0.9 }), RCP_X + 0.55, DT + 0.0125, RCP_Z - 0.32, -Math.PI / 2, 0, -0.1 + Math.PI);
  ciPart(new THREE.BoxGeometry(0.004, 0.002, 0.18), new THREE.MeshStandardMaterial({ color: 0xe0607a }), RCP_X + 0.6, DT + 0.014, RCP_Z - 0.38, 0, -0.1, 0);   // a ribbon bookmark
  // a pen pot, a tray of files, a stapler and a mug of tea
  var PP_X = RCP_X + 0.95, PP_Z = RCP_Z - 0.12;
  ciPart(new THREE.CylinderGeometry(0.035, 0.032, 0.1, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xe0889a, roughness: 0.35, side: THREE.DoubleSide }), PP_X, DT + 0.05, PP_Z);
  ciPart(new THREE.CircleGeometry(0.032, 16), CI_KICK, PP_X, DT + 0.002, PP_Z, -Math.PI / 2, 0, 0);
  [[0.01, 0.005, CI.black, 0.15], [-0.012, 0.008, CI.teal, -0.12], [0.003, -0.012, CI.coral, 0.05], [-0.005, -0.004, CI.brass, -0.2]].forEach(function (pn) {
    ciPart(new THREE.CylinderGeometry(0.0045, 0.0045, 0.15, 8), pn[2], PP_X + pn[0] + pn[3] * 0.06, DT + 0.08, PP_Z + pn[1], pn[3] * 0.6, 0, pn[3]);
  });
  var TR_X = RCP_X + 1.0, TR_Z = RCP_Z - 0.4;
  ciPart(new THREE.BoxGeometry(0.3, 0.006, 0.36), CI_KICK, TR_X, DT + 0.003, TR_Z);
  [[0, 0.18, 0.3, 0.004], [0, -0.18, 0.3, 0.004], [0.15, 0, 0.004, 0.36], [-0.15, 0, 0.004, 0.36]].forEach(function (t) { ciPart(new THREE.BoxGeometry(t[2], 0.05, t[3]), CI_KICK, TR_X + t[0], DT + 0.025, TR_Z + t[1]); });   // the tray's wire sides
  [CI.mint, CI.coral, CI.paper, CI.tealVinyl, CI.paper].forEach(function (m, k) { ciPart(new THREE.BoxGeometry(0.26, 0.008, 0.33), m, TR_X + (isle2Hash(k + 80) - 0.5) * 0.02, DT + 0.01 + k * 0.009, TR_Z, 0, (isle2Hash(k + 70) - 0.5) * 0.08, 0); });
  var stp = new THREE.Group(); stp.position.set(RCP_X - 0.62, DT, RCP_Z - 0.5); stp.rotation.y = 0.6; clinicRoom.add(stp);
  ciPart(ciRoundBox(0.16, 0.02, 0.045, 0.008), CI_KICK, 0, 0.01, 0, 0, 0, 0, stp);
  ciPart(ciRoundBox(0.15, 0.025, 0.04, 0.01), CI.teal, 0.005, 0.035, 0, 0, 0, 0.04, stp);
  var MG_X = RCP_X - 0.62, MG_Z = RCP_Z - 0.25;
  var mugPts2 = [new THREE.Vector2(0.001, 0), new THREE.Vector2(0.034, 0), new THREE.Vector2(0.037, 0.004), new THREE.Vector2(0.039, 0.09), new THREE.Vector2(0.036, 0.092), new THREE.Vector2(0.034, 0.088), new THREE.Vector2(0.033, 0.01)];
  ciPart(new THREE.LatheGeometry(mugPts2, 24), new THREE.MeshStandardMaterial({ color: 0xe0889a, roughness: 0.2, side: THREE.DoubleSide }), MG_X, DT, MG_Z);
  ciPart(new THREE.TorusGeometry(0.022, 0.006, 8, 16, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0xe0889a, roughness: 0.2 }), MG_X + 0.04, DT + 0.045, MG_Z, 0, 0, -Math.PI * 0.6);
  ciPart(new THREE.CircleGeometry(0.033, 20), new THREE.MeshStandardMaterial({ color: 0x8a4a1c, roughness: 0.08 }), MG_X, DT + 0.075, MG_Z, -Math.PI / 2, 0, 0);
  // a swivel office chair: five legs on casters, a gas lift, a tilt mechanism, a padded seat and a curved back with
  // a lumbar pad on a support spine, and padded arm rests
  function ciOfficeChair(x, z, ry) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; clinicRoom.add(g);
    for (var a = 0; a < 5; a++) {
      var an = a / 5 * Math.PI * 2, sx = Math.sin(an), sz = Math.cos(an);
      ciPart(new THREE.BoxGeometry(0.045, 0.035, 0.27), CI_KICK, sx * 0.14, 0.085, sz * 0.14, 0.13, an, 0, g);
      ciPart(new THREE.BoxGeometry(0.03, 0.04, 0.035), CI.black, sx * 0.28, 0.05, sz * 0.28, 0, an, 0, g);              // the caster's fork
      ciPart(new THREE.CylinderGeometry(0.027, 0.027, 0.026, 14), CI.black, sx * 0.29, 0.027, sz * 0.29, 0, an, Math.PI / 2, g);   // and its wheel
      ciPart(new THREE.CylinderGeometry(0.01, 0.01, 0.028, 8), CI_CHROME, sx * 0.29, 0.027, sz * 0.29, 0, an, Math.PI / 2, g);
    }
    ciPart(new THREE.CylinderGeometry(0.05, 0.055, 0.07, 16), CI_KICK, 0, 0.1, 0, 0, 0, 0, g);
    ciPart(new THREE.CylinderGeometry(0.033, 0.033, 0.2, 14), CI.black, 0, 0.23, 0, 0, 0, 0, g);
    ciPart(new THREE.CylinderGeometry(0.024, 0.024, 0.1, 14), CI_CHROME, 0, 0.37, 0, 0, 0, 0, g);
    ciPart(ciRoundBox(0.26, 0.05, 0.24, 0.01), CI_KICK, 0, 0.43, 0, 0, 0, 0, g);                                       // the tilt mechanism
    ciPart(new THREE.BoxGeometry(0.15, 0.012, 0.02), CI.black, 0.18, 0.42, 0.06, 0, 0, -0.15, g);                      // its lever
    ciPart(ciRoundBox(0.5, 0.1, 0.48, 0.045), CI.tealVinyl, 0, 0.5, 0.01, 0, 0, 0, g);                                  // the seat, with a seam round it
    ciPart(new THREE.BoxGeometry(0.42, 0.005, 0.004), CI_SEAM, 0, 0.53, 0.252, 0, 0, 0, g);
    ciPart(ciRoundBox(0.07, 0.36, 0.03, 0.012), CI_KICK, 0, 0.62, -0.26, -0.12, 0, 0, g);                             // the back's spine
    var backShape = ciRoundBox(0.46, 0.46, 0.07, 0.035), bp = backShape.attributes.position;
    for (var v = 0; v < bp.count; v++) bp.setZ(v, bp.getZ(v) + Math.pow(bp.getX(v) / 0.23, 2) * 0.04);   // curved to hug your back
    backShape.computeVertexNormals();
    ciPart(backShape, CI.tealVinyl, 0, 0.88, -0.29, -0.12, 0, 0, g);
    ciPart(ciRoundBox(0.36, 0.1, 0.035, 0.015), CI_SEAM, 0, 0.74, -0.245, -0.12, 0, 0, g);                             // a lumbar pad
    [-1, 1].forEach(function (s) {                                       // arm rests on curved posts
      ciPart(ciRoundBox(0.035, 0.2, 0.05, 0.01), CI_KICK, s * 0.27, 0.58, -0.03, 0, 0, 0, g);
      ciPart(ciRoundBox(0.03, 0.025, 0.12, 0.008), CI_KICK, s * 0.255, 0.48, -0.03, 0, 0, 0, g);
      ciPart(ciRoundBox(0.075, 0.035, 0.26, 0.015), CI.black, s * 0.27, 0.695, 0.0, 0, 0, 0, g);
    });
  }
  ciOfficeChair(RCP_X - 0.3, RCP_Z - 0.85, Math.PI - 0.3);
  ciSolids.push([RCP_X - 0.9, RCP_Z, 0.55], [RCP_X, RCP_Z, 0.55], [RCP_X + 0.9, RCP_Z, 0.55], [RCP_X - 0.3, RCP_Z - 0.85, 0.35]);
  // a hanging "Reception" sign above the desk: a painted teal board in a routed oak frame, with gold-leaf letters, a
  // heart crest and little flourishes on both faces, hanging on brass chains from a ceiling plate
  var ciRecTex = paintTexture(1024, 256, function (g, w, h) {
    var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2c6a62'); bg.addColorStop(1, '#1f544d');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 160; i++) { g.strokeStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '120,190,170' : '10,30,28') + ',' + (0.04 + isle2Hash(i * 2) * 0.05) + ')'; g.lineWidth = 1 + isle2Hash(i * 3) * 2; var y = isle2Hash(i * 1.3) * h; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + 4, w * 0.6, y - 4, w, y + 2); g.stroke(); }   // grain under the paint
    var gold = g.createLinearGradient(0, 40, 0, h - 40); gold.addColorStop(0, '#fff3c0'); gold.addColorStop(0.35, '#e9bb4e'); gold.addColorStop(0.6, '#a87824'); gold.addColorStop(1, '#f0cd68');
    g.strokeStyle = gold; g.lineWidth = 6; g.strokeRect(22, 22, w - 44, h - 44); g.lineWidth = 2; g.strokeRect(36, 36, w - 72, h - 72);
    [[36, 36], [w - 36, 36], [36, h - 36], [w - 36, h - 36]].forEach(function (c) { g.fillStyle = gold; g.beginPath(); g.arc(c[0], c[1], 8, 0, Math.PI * 2); g.fill(); });
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'italic bold 118px Georgia, serif';
    g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillText('Reception', w / 2 + 5, h / 2 + 12);
    g.fillStyle = gold; g.fillText('Reception', w / 2, h / 2 + 6);
    g.strokeStyle = 'rgba(255,248,215,0.5)'; g.lineWidth = 1.5; g.strokeText('Reception', w / 2 - 1, h / 2 + 4);
    [[120, 1], [w - 120, -1]].forEach(function (c) {                   // a heart with a white cross, and a flourish, at each end
      var cx = c[0], cy = h / 2 + 4, s = 36;
      g.fillStyle = '#e0607a'; g.beginPath(); g.moveTo(cx, cy + s * 0.9); g.bezierCurveTo(cx - s * 1.3, cy, cx - s * 0.8, cy - s, cx, cy - s * 0.35); g.bezierCurveTo(cx + s * 0.8, cy - s, cx + s * 1.3, cy, cx, cy + s * 0.9); g.fill();
      g.strokeStyle = gold; g.lineWidth = 4; g.stroke();
      g.fillStyle = '#fff'; g.fillRect(cx - 5, cy - 18, 10, 28); g.fillRect(cx - 14, cy - 9, 28, 10);
    });
  });
  ciRecTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var RS_Y = 2.55, RS_Z = RCP_Z + 0.1, recMat = new THREE.MeshStandardMaterial({ map: ciRecTex, roughness: 0.45, metalness: 0.15 });
  ciPart(ciRoundBox(1.06, 0.29, 0.04, 0.012), CI_OAK, RCP_X, RS_Y, RS_Z);                                               // the oak frame
  ciPart(new THREE.PlaneGeometry(0.98, 0.245), recMat, RCP_X, RS_Y, RS_Z + 0.0205);
  ciPart(new THREE.PlaneGeometry(0.98, 0.245), recMat, RCP_X, RS_Y, RS_Z - 0.0205, 0, Math.PI, 0);
  [-0.4, 0.4].forEach(function (sx) {
    ciPart(new THREE.TorusGeometry(0.018, 0.004, 6, 14), CI.brass, RCP_X + sx, RS_Y + 0.16, RS_Z, 0, Math.PI / 2, 0);   // eye hooks
    for (var ch = RS_Y + 0.19; ch < CIN_H - 0.03; ch += 0.035) ciPart(new THREE.TorusGeometry(0.009, 0.0025, 4, 10), CI.brass, RCP_X + sx, ch, RS_Z, 0, Math.round(ch / 0.035) % 2 ? 0 : Math.PI / 2, 0);   // chain links
    ciPart(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16), CI.brass, RCP_X + sx, CIN_H - 0.006, RS_Z);                // ceiling plates
  });
  // two lateral filing cabinets under the back window: white cases on a plinth with oak tops, mint drawer fronts with
  // recessed panels, brass cup handles, label holders with typed labels and a little lock
  var fileLabels = [['A – F', 'G – M'], ['N – S', 'T – Z']];
  [-3.25, -1.95].forEach(function (fx, ci) {
    var FZ = CNW + 0.27, FF = FZ + 0.25;
    ciPart(ciRoundBox(1.2, 0.8, 0.5, 0.012), CI.white, fx, 0.46, FZ);
    ciPart(new THREE.BoxGeometry(1.14, 0.06, 0.46), CI_KICK, fx, 0.03, FZ - 0.01);
    ciPart(ciRoundBox(1.24, 0.035, 0.54, 0.01), CI_OAK, fx, 0.877, FZ + 0.01);
    [0.27, 0.66].forEach(function (dy, k) {
      ciPart(ciRoundBox(1.12, 0.35, 0.025, 0.008), CI.mint, fx, dy, FF + 0.012);
      ciPart(ciRoundBox(1.0, 0.25, 0.01, 0.005), new THREE.MeshStandardMaterial({ color: 0xa9d2bf, roughness: 0.5 }), fx, dy - 0.02, FF + 0.026);
      ciPart(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 16, 1, true, 0, Math.PI), CI.brass, fx, dy + 0.08, FF + 0.04, 0, 0, Math.PI / 2).scale.set(1, 3, 0.6);   // the cup handle
      ciPart(ciRoundBox(0.14, 0.05, 0.006, 0.004), CI.brass, fx, dy - 0.02, FF + 0.033);
      var lbl = paintTexture(128, 40, function (g, w, h) { g.fillStyle = '#fbf8ef'; g.fillRect(0, 0, w, h); g.fillStyle = '#2a2a30'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 22px "Courier New", monospace'; g.fillText(fileLabels[ci][k], w / 2, h / 2 + 1); });
      ciPart(new THREE.PlaneGeometry(0.115, 0.035), new THREE.MeshStandardMaterial({ map: lbl, roughness: 0.8 }), fx, dy - 0.02, FF + 0.0365);
    });
    ciPart(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12), CI_CHROME, fx + 0.5, 0.82, FF + 0.03, Math.PI / 2, 0, 0);   // the lock
    ciPart(new THREE.BoxGeometry(0.003, 0.012, 0.002), CI.black, fx + 0.5, 0.82, FF + 0.036);
  });
  // books and binders on the left cabinet, between brass bookends: rounded spines, gilt bands, spine labels and
  // slightly different heights and tilts, with two lying flat
  var bookTitles = ['Herbal Remedies', 'Patient Files', 'Anatomy', 'Moon Tonics', 'Records 1', 'Records 2', 'First Aid', 'Island Flora', 'Recipes', 'Appointments', 'Poultices'];
  var bookCols = ['#2f6f68', '#e0889a', '#8fc7b0', '#f6f2e8', '#3f8a80', '#c8344a', '#7a6ad0', '#e9b84a', '#2f4a6a', '#8fc7b0', '#6a4a3a'];
  var bkX = -3.73, BK_Y = 0.895, BK_Z = CNW + 0.25;
  [-1, 1].forEach(function (s) { var be = new THREE.Group(); be.position.set(s < 0 ? -3.79 : -3.79 + 0.98, BK_Y, BK_Z); clinicRoom.add(be); ciPart(new THREE.BoxGeometry(0.008, 0.18, 0.14), CI.brass, 0, 0.09, 0, 0, 0, 0, be); ciPart(new THREE.BoxGeometry(0.1, 0.008, 0.14), CI.brass, -s * 0.05, 0.004, 0, 0, 0, 0, be); });
  for (var bd = 0; bd < 11; bd++) {
    var bw = 0.055 + isle2Hash(bd * 3.3) * 0.03, bh = 0.24 + isle2Hash(bd * 1.7) * 0.08, bdp = 0.2 + isle2Hash(bd * 4.1) * 0.05, lean = bd === 10 ? -0.22 : 0;
    (function (bd, bw, bh, bdp) {
      var spine = paintTexture(48, 192, function (g, w, h) {           // the spine: cloth colour, gilt bands, a title and a label
        g.fillStyle = bookCols[bd]; g.fillRect(0, 0, w, h);
        for (var i = 0; i < 200; i++) { g.fillStyle = 'rgba(0,0,0,' + isle2Hash(i + bd * 9) * 0.08 + ')'; g.fillRect(isle2Hash(i * 2.1 + bd) * w, isle2Hash(i * 3.3 + bd) * h, 2, 1); }
        var light = bookCols[bd] === '#f6f2e8' || bookCols[bd] === '#e9b84a' || bookCols[bd] === '#8fc7b0';
        g.fillStyle = light ? '#6a4a1a' : '#e9c46a';
        [10, 18, h - 22, h - 14].forEach(function (y) { g.fillRect(4, y, w - 8, 3); });
        g.save(); g.translate(w / 2 + 6, h / 2); g.rotate(-Math.PI / 2); g.textAlign = 'center'; g.font = 'bold 15px Georgia, serif'; g.fillText(bookTitles[bd], 0, 0); g.restore();
        g.fillStyle = '#fbf8ef'; g.fillRect(8, h - 52, w - 16, 20); g.fillStyle = '#2a2a30'; g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.fillText(String(bd + 1), w / 2, h - 38);
      });
      var cover = new THREE.MeshStandardMaterial({ map: spine, roughness: 0.7 }), plain = new THREE.MeshStandardMaterial({ color: bookCols[bd], roughness: 0.7 }), pages = new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.9 });
      var g2 = new THREE.Group(); g2.position.set(bkX + bw / 2, BK_Y, BK_Z); g2.rotation.z = lean; clinicRoom.add(g2);
      ciPart(new THREE.BoxGeometry(bw, bh, bdp), [plain, plain, pages, plain, cover, pages], 0, bh / 2, 0, 0, 0, 0, g2);   // pages show on top and at the back
      ciPart(new THREE.CylinderGeometry(bw / 2, bw / 2, bh, 12, 1, false, -Math.PI / 2, Math.PI), cover, 0, bh / 2, bdp / 2 - 0.004, 0, 0, 0, g2).scale.set(1, 1, 0.35);   // the rounded spine
    })(bd, bw, bh, bdp);
    bkX += bw + 0.004 + (bd === 9 ? 0.04 : 0);
  }
  [[0.26, 0.04, CI.teal], [0.25, 0.035, CI.coral]].forEach(function (fb, k) {   // two books lying flat on the other end
    ciPart(ciRoundBox(fb[0], fb[1], 0.19, 0.006), fb[2], -2.82, BK_Y + fb[1] / 2 + k * 0.04, BK_Z, 0, (k - 0.5) * 0.15, 0);
    ciPart(new THREE.BoxGeometry(fb[0] - 0.01, fb[1] - 0.008, 0.002), new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.9 }), -2.82, BK_Y + fb[1] / 2 + k * 0.04, BK_Z - 0.096, 0, (k - 0.5) * 0.15, 0);
  });
  // on the right cabinet: a wooden letter tray with envelopes, a little succulent and a desk tidy of pens
  var LT_X = -1.7, LT_Z = CNW + 0.26;
  ciPart(new THREE.BoxGeometry(0.36, 0.012, 0.28), CI_OAK, LT_X, 0.902, LT_Z);
  [[0, 0.135, 0.36, 0.01], [0, -0.135, 0.36, 0.01], [0.175, 0, 0.01, 0.28], [-0.175, 0, 0.01, 0.28]].forEach(function (t) { ciPart(new THREE.BoxGeometry(t[2], 0.05, t[3]), CI_OAK, LT_X + t[0], 0.92, LT_Z + t[1]); });
  for (var en = 0; en < 6; en++) ciPart(new THREE.BoxGeometry(0.24, 0.005, 0.16), new THREE.MeshStandardMaterial({ color: [0xfbf8ef, 0xf2e6c8, 0xe6f2fb][en % 3], roughness: 0.9 }), LT_X + (isle2Hash(en) - 0.5) * 0.03, 0.912 + en * 0.006, LT_Z + (isle2Hash(en + 3) - 0.5) * 0.04, 0, (isle2Hash(en + 7) - 0.5) * 0.3, 0);
  ciPart(new THREE.BoxGeometry(0.02, 0.002, 0.015), new THREE.MeshStandardMaterial({ color: 0xe0607a }), LT_X + 0.08, 0.95, LT_Z - 0.04);   // a stamp
  ciPart(new THREE.CylinderGeometry(0.04, 0.032, 0.06, 16), CI.clay, -2.3, 0.925, LT_Z);
  for (var su = 0; su < 10; su++) { var sua = su * 2.4, sur = su < 5 ? 0.022 : 0.01; var sl = ciPart(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0x7aae8a, roughness: 0.5 }), -2.3 + Math.cos(sua) * sur, 0.965 + (su < 5 ? 0 : 0.008), LT_Z + Math.sin(sua) * sur); sl.scale.set(0.03, 0.008, 0.012); sl.rotation.set(0, -sua, 0.5); }
  ciSolids.push([-3.25, CNW + 0.27, 0.6], [-1.95, CNW + 0.27, 0.6]);

  // upholstered waiting chairs along the left wall, under the window, with a magazine table on a rug
  // a mid-century armchair: splayed oak legs with brass caps, an oak frame and arms, and a buttoned seat and back cushion
  // piped round the edges
  function ciArmchair(x, z, ry, mat) {
    var g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; clinicRoom.add(g);
    var pipe = new THREE.MeshStandardMaterial({ color: mat.color.clone().multiplyScalar(0.72), roughness: 0.6 });
    var oak = CI_OAK;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {          // tapered legs, splayed out a little
      var lx = c[0] * 0.25, lz = c[1] * 0.22;
      ciPart(new THREE.CylinderGeometry(0.024, 0.014, 0.3, 10), oak, lx + c[0] * 0.012, 0.15, lz + c[1] * 0.012, c[1] * 0.1, 0, -c[0] * 0.1, g);
      ciPart(new THREE.CylinderGeometry(0.0145, 0.013, 0.035, 10), CI.brass, lx + c[0] * 0.026, 0.017, lz + c[1] * 0.026, 0, 0, 0, g);
    });
    ciPart(ciRoundBox(0.6, 0.055, 0.56, 0.015), oak, 0, 0.32, 0, 0, 0, 0, g);                                          // the seat frame
    var seatGeo = ciRoundBox(0.52, 0.12, 0.5, 0.05), sgp = seatGeo.attributes.position;   // the seat cushion, softly domed in the middle
    for (var sv = 0; sv < sgp.count; sv++) if (sgp.getY(sv) > 0.03) sgp.setY(sv, sgp.getY(sv) + 0.018 * Math.max(0, 1 - Math.pow(sgp.getX(sv) / 0.26, 2)) * Math.max(0, 1 - Math.pow(sgp.getZ(sv) / 0.25, 2)));
    seatGeo.computeVertexNormals();
    ciPart(seatGeo, mat, 0, 0.405, 0.02, 0, 0, 0, g);
    [[0, 0.27, 0.46, 0.009], [0, -0.23, 0.46, 0.009], [-0.26, 0.02, 0.009, 0.46], [0.26, 0.02, 0.009, 0.46]].forEach(function (pp) {   // piping all the way round its top edge
      ciPart(ciRoundBox(pp[2], 0.009, pp[3], 0.004), pipe, pp[0], 0.452, pp[1], 0, 0, 0, g);
    });
    [[-0.1, 0.12], [0.1, 0.12], [0, 0.0], [-0.1, -0.12], [0.1, -0.12]].forEach(function (b) {   // buttons on the seat too
      ciPart(new THREE.SphereGeometry(0.009, 8, 6), pipe, b[0], 0.468, b[1] + 0.02, 0, 0, 0, g).scale.set(1, 0.6, 1);
    });
    // stretchers between the legs, and spindles under the arms
    ciRod(new THREE.Vector3(-0.255, 0.1, 0.235), new THREE.Vector3(-0.255, 0.1, -0.235), 0.009, oak, g);
    ciRod(new THREE.Vector3(0.255, 0.1, 0.235), new THREE.Vector3(0.255, 0.1, -0.235), 0.009, oak, g);
    ciRod(new THREE.Vector3(-0.255, 0.1, 0), new THREE.Vector3(0.255, 0.1, 0), 0.009, oak, g);
    [-1, 1].forEach(function (s) {
      ciPart(ciRoundBox(0.04, 0.6, 0.045, 0.012), oak, s * 0.27, 0.62, -0.27, -0.14, 0, 0, g);                         // the back posts
      ciPart(ciRoundBox(0.035, 0.28, 0.035, 0.01), oak, s * 0.29, 0.48, 0.2, 0, 0, s * 0.05, g);                       // the arm supports
      ciPart(ciRoundBox(0.07, 0.035, 0.58, 0.016), oak, s * 0.3, 0.625, -0.01, 0, 0, 0, g);                            // the arms
      ciPart(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 14), oak, s * 0.3, 0.625, 0.275, 0, 0, Math.PI / 2, g);        // their rounded ends
      [-0.16, -0.04, 0.08].forEach(function (sz) { ciPart(new THREE.CylinderGeometry(0.008, 0.011, 0.26, 8), oak, s * 0.29, 0.48, sz, 0, 0, 0, g); });   // turned spindles
    });
    ciPart(ciRoundBox(0.5, 0.04, 0.03, 0.01), oak, 0, 0.88, -0.32, -0.14, 0, 0, g);                                    // a curved top rail
    var bc = ciPart(ciRoundBox(0.48, 0.4, 0.11, 0.05), mat, 0, 0.66, -0.24, -0.14, 0, 0, g);                            // the back cushion, buttoned
    [[-0.12, 0.08], [0.12, 0.08], [0, -0.02], [-0.12, -0.1], [0.12, -0.1]].forEach(function (b) {
      ciPart(new THREE.SphereGeometry(0.011, 8, 6), pipe, b[0], b[1], 0.055, 0, 0, 0, bc);
    });
    [[0, 0.198, 0.42, 0.009], [0, -0.198, 0.42, 0.009], [-0.238, 0, 0.009, 0.36], [0.238, 0, 0.009, 0.36]].forEach(function (pp) {   // piping round the back cushion
      ciPart(ciRoundBox(pp[2], pp[3], 0.009, 0.004), pipe, pp[0], pp[1], 0.05, 0, 0, 0, bc);
    });
    [-0.17, -0.06, 0.06, 0.17].forEach(function (bx) { ciPart(new THREE.CylinderGeometry(0.007, 0.009, 0.34, 8), oak, bx, 0.62, -0.31, -0.14, 0, 0, g); });   // spindles in the back, behind the cushion
  }
  [[0.95, CI.coral], [1.75, CI.tealVinyl], [2.55, CI.coral]].forEach(function (c) { ciArmchair(-CIN_W / 2 + 0.42, c[0], Math.PI / 2, c[1]); ciSolids.push([-CIN_W / 2 + 0.42, c[0], 0.36]); });
  // the coffee table: a round oak top with a moulded edge, a turned pedestal on three splayed feet with brass caps, and a
  // lower shelf with a couple of books. On top: a fan of magazines, a glass bud vase of daisies and lavender, a box of
  // tissues and a bowl of wrapped sweets
  var MAG_X = -3.15, MAG_Z = 1.75, MT_Y = 0.44;
  var ciOakDark = new THREE.MeshStandardMaterial({ map: ciOakTex, color: 0xb88a68, roughness: 0.45 });
  ciPart(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 40), CI_OAK, MAG_X, MT_Y - 0.015, MAG_Z);
  ciPart(new THREE.TorusGeometry(0.34, 0.016, 10, 48), CI_OAK, MAG_X, MT_Y - 0.016, MAG_Z, Math.PI / 2, 0, 0);          // the rounded edge
  ciPart(new THREE.CylinderGeometry(0.29, 0.29, 0.05, 32, 1, true), ciOakDark, MAG_X, MT_Y - 0.055, MAG_Z);            // the apron
  var pedPts = [];                                                     // the turned pedestal: rings, a bulb and a slim neck
  [[0.07, 0.0], [0.075, 0.02], [0.05, 0.035], [0.045, 0.07], [0.065, 0.11], [0.07, 0.14], [0.05, 0.17], [0.035, 0.22], [0.032, 0.28], [0.045, 0.31], [0.05, 0.33], [0.04, 0.35], [0.06, 0.37], [0.06, 0.38]].forEach(function (q) { pedPts.push(new THREE.Vector2(q[0], q[1])); });
  ciPart(new THREE.LatheGeometry(pedPts, 24), ciOakDark, MAG_X, 0.02, MAG_Z);
  for (var tf = 0; tf < 3; tf++) {                                     // three gently curved, splayed feet
    var tfa = tf / 3 * Math.PI * 2 + 0.5, fx = Math.cos(tfa), fz = Math.sin(tfa);
    var foot = new THREE.CatmullRomCurve3([new THREE.Vector3(MAG_X + fx * 0.04, 0.09, MAG_Z + fz * 0.04), new THREE.Vector3(MAG_X + fx * 0.14, 0.06, MAG_Z + fz * 0.14), new THREE.Vector3(MAG_X + fx * 0.25, 0.025, MAG_Z + fz * 0.25)]);
    ciPart(new THREE.TubeGeometry(foot, 12, 0.022, 8), ciOakDark, 0, 0, 0);
    ciPart(new THREE.CylinderGeometry(0.02, 0.018, 0.03, 10), CI.brass, MAG_X + fx * 0.255, 0.015, MAG_Z + fz * 0.255);
  }
  ciPart(new THREE.CylinderGeometry(0.22, 0.22, 0.018, 32), CI_OAK, MAG_X, 0.16, MAG_Z);                                // the lower shelf
  ciPart(new THREE.TorusGeometry(0.22, 0.008, 6, 36), CI.brass, MAG_X, 0.16, MAG_Z, Math.PI / 2, 0, 0);
  [[0.035, CI.teal, 0.1], [0.03, CI.coral, -0.2]].forEach(function (bk, k) {   // books on the shelf
    ciPart(ciRoundBox(0.2, bk[0], 0.15, 0.004), bk[1], MAG_X + 0.08, 0.17 + k * 0.035 + bk[0] / 2, MAG_Z - 0.05, 0, bk[2], 0);
    ciPart(new THREE.BoxGeometry(0.19, bk[0] * 0.8, 0.002), CI.paper, MAG_X + 0.08 + Math.sin(bk[2]) * 0.076, 0.17 + k * 0.035 + bk[0] / 2, MAG_Z - 0.05 + Math.cos(bk[2]) * 0.076, 0, bk[2], 0);
  });
  ciSolids.push([MAG_X, MAG_Z, 0.38]);
  // magazines: proper covers, with white page edges
  var ciMagCovers = [['BLOOM', '#e98ab6', '#fde8f0', 'Spring’s prettiest\nwindow boxes', 0], ['Tides & Tonics', '#4a8ad0', '#e6f2fb', 'Sea air for\nhealthy lungs', 1], ['Herbal Home', '#5a9a5a', '#eef6e6', '20 teas to\ncalm a cold', 2]].map(function (m) {
    return paintTexture(256, 340, function (g, w, h) {
      g.fillStyle = m[2]; g.fillRect(0, 0, w, h);
      if (m[4] === 0) { for (var p = 0; p < 7; p++) { var a = p / 7 * Math.PI * 2; g.fillStyle = 'rgba(233,138,182,0.8)'; g.beginPath(); g.ellipse(w / 2 + Math.cos(a) * 40, 200 + Math.sin(a) * 40, 34, 20, a, 0, Math.PI * 2); g.fill(); } g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(w / 2, 200, 20, 0, Math.PI * 2); g.fill(); }
      else if (m[4] === 1) { var sky = g.createLinearGradient(0, 90, 0, 300); sky.addColorStop(0, '#bfe2f8'); sky.addColorStop(1, '#4a8ad0'); g.fillStyle = sky; g.fillRect(20, 90, w - 40, 210); g.fillStyle = '#ffffff'; for (var wv = 0; wv < 4; wv++) { g.beginPath(); for (var x = 20; x <= w - 20; x += 8) g.lineTo(x, 220 + wv * 22 + Math.sin(x * 0.08 + wv) * 6); g.lineTo(w - 20, 300); g.lineTo(20, 300); g.fill(); g.fillStyle = 'rgba(255,255,255,' + (0.5 - wv * 0.1) + ')'; } g.fillStyle = '#ffe27a'; g.beginPath(); g.arc(190, 140, 24, 0, Math.PI * 2); g.fill(); }
      else { g.fillStyle = '#f6efe2'; g.beginPath(); g.ellipse(w / 2, 240, 70, 40, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#c87a3a'; g.beginPath(); g.ellipse(w / 2, 232, 56, 22, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#f6efe2'; g.lineWidth = 8; g.beginPath(); g.arc(w / 2 + 74, 236, 18, -1.2, 1.2); g.stroke(); for (var lf = 0; lf < 6; lf++) { g.fillStyle = '#6aa055'; g.beginPath(); g.ellipse(60 + lf * 28, 150 + (lf % 2) * 18, 14, 6, lf, 0, Math.PI * 2); g.fill(); } }
      g.fillStyle = m[1]; g.textAlign = 'center'; g.font = 'bold ' + (m[0].length > 8 ? 34 : 54) + 'px Georgia, serif'; g.fillText(m[0], w / 2, 62);
      g.fillStyle = '#2a2a30'; g.font = 'bold 15px sans-serif'; g.textAlign = 'left';
      m[3].split('\n').forEach(function (ln, k) { g.fillText(ln, 16, 100 + k * 18); });
      g.fillStyle = m[1]; g.fillRect(16, h - 40, 60, 4);
      g.fillStyle = '#ffffff'; g.fillRect(w - 64, h - 44, 48, 30); g.fillStyle = '#16161a'; for (var b = 0; b < 20; b++) if (isle2Hash(b + m[4] * 9) > 0.4) g.fillRect(w - 60 + b * 2, h - 40, 1.4, 20);   // a barcode
      g.fillStyle = '#5a5a60'; g.font = '10px sans-serif'; g.fillText('ISSUE ' + (12 + m[4] * 7) + '  ·  2 coins', 16, h - 16);
    });
  });
  var ciPageEdge = new THREE.MeshStandardMaterial({ color: 0xf6f4ee, roughness: 0.9 });
  ciMagCovers.forEach(function (tex, k) {
    var mats = [ciPageEdge, ciPageEdge, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35 }), ciPageEdge, ciPageEdge, ciPageEdge];
    ciPart(new THREE.BoxGeometry(0.17, 0.007, 0.225), mats, MAG_X - 0.1 + k * 0.06, MT_Y + 0.004 + k * 0.0075, MAG_Z + 0.05 + (k - 1) * 0.03, 0, -0.5 + k * 0.38, 0).castShadow = true;
  });
  // a glass bud vase with a little water, five daisies with their own petals, and two sprigs of lavender
  var VZ_X = MAG_X + 0.15, VZ_Z = MAG_Z - 0.14;
  var vasePts = []; [[0.001, 0], [0.04, 0], [0.05, 0.03], [0.045, 0.08], [0.022, 0.13], [0.018, 0.16], [0.024, 0.175], [0.02, 0.178]].forEach(function (q) { vasePts.push(new THREE.Vector2(q[0], q[1])); });
  var waterPts = []; [[0.001, 0.004], [0.038, 0.004], [0.046, 0.03], [0.041, 0.075], [0.001, 0.075]].forEach(function (q) { waterPts.push(new THREE.Vector2(q[0], q[1])); });
  ciPart(new THREE.LatheGeometry(waterPts, 20), new THREE.MeshStandardMaterial({ color: 0xbfe0f0, roughness: 0.05, transparent: true, opacity: 0.45, depthWrite: false }), VZ_X, MT_Y, VZ_Z).renderOrder = 2;
  ciPart(new THREE.LatheGeometry(vasePts, 24), new THREE.MeshStandardMaterial({ color: 0xe8f6ff, roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }), VZ_X, MT_Y, VZ_Z).renderOrder = 3;
  var petals = [], petalGeo = new THREE.SphereGeometry(1, 8, 4);
  for (var dz = 0; dz < 5; dz++) {
    var da = dz * 1.26, lean = 0.22 + (dz % 2) * 0.1, sl = 0.24 + isle2Hash(dz * 3) * 0.06;
    var head = new THREE.Vector3(VZ_X + Math.cos(da) * Math.sin(lean) * sl, MT_Y + 0.05 + Math.cos(lean) * sl, VZ_Z + Math.sin(da) * Math.sin(lean) * sl);
    ciRod(new THREE.Vector3(VZ_X, MT_Y + 0.05, VZ_Z), head, 0.0022, CI.leaf);
    var leafD = ciPart(new THREE.SphereGeometry(1, 8, 4), CI.leaf, VZ_X + Math.cos(da) * 0.03, MT_Y + 0.2, VZ_Z + Math.sin(da) * 0.03); leafD.scale.set(0.006, 0.03, 0.012); leafD.rotation.set(0, -da, 0.5);
    var fg = new THREE.Group(); fg.position.copy(head); fg.lookAt(head.x + Math.cos(da) * 0.6, head.y + 1, head.z + Math.sin(da) * 0.6); clinicRoom.add(fg);
    for (var pt = 0; pt < 13; pt++) {                                  // the white petals, each its own little oval
      var pa = pt / 13 * Math.PI * 2;
      var pm = ciPart(petalGeo, CI.paper, Math.cos(pa) * 0.018, Math.sin(pa) * 0.018, 0.002, 0, 0, pa, fg);
      pm.scale.set(0.015, 0.0045, 0.0015); pm.castShadow = false;
    }
    ciPart(new THREE.SphereGeometry(0.009, 10, 6), new THREE.MeshStandardMaterial({ color: 0xf2b63a, roughness: 0.8 }), 0, 0, 0.004, 0, 0, 0, fg).scale.set(1, 1, 0.55);
  }
  [[0.7, 0.3], [3.6, 0.25]].forEach(function (lv) {                   // lavender sprigs
    var tip = new THREE.Vector3(VZ_X + Math.cos(lv[0]) * Math.sin(lv[1]) * 0.3, MT_Y + 0.05 + Math.cos(lv[1]) * 0.3, VZ_Z + Math.sin(lv[0]) * Math.sin(lv[1]) * 0.3);
    ciRod(new THREE.Vector3(VZ_X, MT_Y + 0.05, VZ_Z), tip, 0.0018, CI.leaf);
    for (var bd = 0; bd < 9; bd++) { var f = 0.72 + bd * 0.035; ciPart(new THREE.SphereGeometry(0.006, 6, 4), new THREE.MeshStandardMaterial({ color: 0x8a6ad0, roughness: 0.8 }), VZ_X + (tip.x - VZ_X) * f + (bd % 2 ? 0.004 : -0.004), MT_Y + 0.05 + (tip.y - MT_Y - 0.05) * f, VZ_Z + (tip.z - VZ_Z) * f).castShadow = false; }
  });
  // a box of tissues with one pulled up, in a teal leaf-print box
  var ciTissueTex = paintTexture(128, 64, function (g, w, h) {
    g.fillStyle = '#2f6f68'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.5)'; for (var i = 0; i < 18; i++) { g.beginPath(); g.ellipse(isle2Hash(i * 3.1) * w, isle2Hash(i * 4.7) * h, 5, 2.2, isle2Hash(i) * 3, 0, Math.PI * 2); g.fill(); }
  });
  var TB_X = MAG_X - 0.12, TB_Z = MAG_Z - 0.17;
  ciPart(ciRoundBox(0.13, 0.07, 0.13, 0.008), new THREE.MeshStandardMaterial({ map: ciTissueTex, roughness: 0.7 }), TB_X, MT_Y + 0.035, TB_Z, 0, 0.3, 0);
  ciPart(new THREE.BoxGeometry(0.06, 0.002, 0.02), CI.white, TB_X, MT_Y + 0.071, TB_Z, 0, 0.3, 0);
  var tissue = new THREE.PlaneGeometry(0.07, 0.07, 6, 6), tsp = tissue.attributes.position;
  for (var tv = 0; tv < tsp.count; tv++) { var ttx = tsp.getX(tv), tty = tsp.getY(tv) + 0.035; tsp.setZ(tv, Math.sin(ttx * 60) * 0.006 + tty * tty * 2); tsp.setX(tv, ttx * (1 - tty * 4)); }
  tissue.computeVertexNormals();
  ciPart(tissue, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, side: THREE.DoubleSide }), TB_X, MT_Y + 0.105, TB_Z, 0, 0.3, 0).castShadow = false;
  // a little glass bowl of sweets in twisted wrappers
  var BW_X = MAG_X + 0.17, BW_Z = MAG_Z + 0.13;
  var bowlPts2 = []; [[0.001, 0], [0.04, 0], [0.065, 0.02], [0.08, 0.045], [0.083, 0.05]].forEach(function (q) { bowlPts2.push(new THREE.Vector2(q[0], q[1])); });
  ciPart(new THREE.LatheGeometry(bowlPts2, 24), new THREE.MeshStandardMaterial({ color: 0xf2e8ff, roughness: 0.03, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false }), BW_X, MT_Y, BW_Z).renderOrder = 3;
  for (var sw = 0; sw < 9; sw++) {
    var swa = sw * 2.4, swr = (sw % 3) * 0.022, sweet = new THREE.Group();
    sweet.position.set(BW_X + Math.cos(swa) * swr, MT_Y + 0.02 + (sw > 5 ? 0.018 : 0), BW_Z + Math.sin(swa) * swr); sweet.rotation.set(0, swa * 1.7, 0.2); clinicRoom.add(sweet);
    var sm = new THREE.MeshStandardMaterial({ color: [0xff6a8a, 0xffd04a, 0x7ad0a0, 0x9a8aff, 0xffffff][sw % 5], roughness: 0.15, metalness: 0.2 });
    ciPart(new THREE.SphereGeometry(0.014, 10, 8), sm, 0, 0, 0, 0, 0, 0, sweet).scale.set(1.3, 1, 1);
    [-1, 1].forEach(function (s) { ciPart(new THREE.ConeGeometry(0.009, 0.016, 6), sm, s * 0.024, 0, 0, 0, 0, s * Math.PI / 2, sweet); });
  }
  // a heart poster over the chairs, in an oak frame with a mat (along the left wall, x on the wall is minus the room's z)
  ciFancyFrame('W', -2.0, 2.05, 0.5, 0.68, ciHeartTex, CI_OAK);
  // a water cooler by the door: a white cabinet with a recessed dispensing alcove, hot and cold taps, indicator lights,
  // a slotted drip tray, side vents, a label, a cup dispenser on its side, and a big ribbed jug of spring water on top
  // with bubbles rising through it now and then
  var WC_X = -1.45, WC_Z = CIN_D / 2 - 0.36, WC_F = WC_Z - 0.165;     // WC_F: its front, facing into the room
  var wcBlue = new THREE.MeshStandardMaterial({ color: 0x4a8ad0, roughness: 0.3 }), wcRed = new THREE.MeshStandardMaterial({ color: 0xd04a5a, roughness: 0.3 });
  ciPart(ciRoundBox(0.32, 0.9, 0.32, 0.025), CI.white, WC_X, 0.47, WC_Z);
  ciPart(ciRoundBox(0.3, 0.04, 0.3, 0.012), CI_KICK, WC_X, 0.02, WC_Z);                                                // the base
  ciPart(ciRoundBox(0.34, 0.05, 0.34, 0.015), CI.white, WC_X, 0.94, WC_Z);                                             // the top collar
  ciPart(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 20), CI_KICK, WC_X, 0.975, WC_Z);
  ciPart(new THREE.BoxGeometry(0.22, 0.26, 0.05), new THREE.MeshStandardMaterial({ color: 0x3a4248, roughness: 0.5 }), WC_X, 0.66, WC_F + 0.02);   // the alcove
  ciPart(new THREE.BoxGeometry(0.2, 0.012, 0.09), CI_CHROME, WC_X, 0.54, WC_F - 0.02);                                 // the drip tray, with slots
  for (var ds = 0; ds < 6; ds++) ciPart(new THREE.BoxGeometry(0.018, 0.004, 0.07), CI_KICK, WC_X - 0.075 + ds * 0.03, 0.547, WC_F - 0.02);
  [[-0.05, wcRed], [0.05, wcBlue]].forEach(function (tp) {              // the taps: a spout and a push paddle each, the hot one with a safety catch
    ciPart(new THREE.CylinderGeometry(0.012, 0.01, 0.05, 10), CI.white, WC_X + tp[0], 0.74, WC_F - 0.005);
    ciPart(ciRoundBox(0.045, 0.06, 0.02, 0.008), tp[1], WC_X + tp[0], 0.775, WC_F - 0.025, 0.25, 0, 0);
    if (tp[1] === wcRed) ciPart(new THREE.BoxGeometry(0.02, 0.01, 0.012), CI.white, WC_X + tp[0], 0.81, WC_F - 0.03);
  });
  [[-0.06, 0xff6a6a], [0.06, 0x6ad0ff]].forEach(function (ld) {        // little indicator lights
    ciPart(new THREE.SphereGeometry(0.007, 8, 6), new THREE.MeshStandardMaterial({ color: ld[1], emissive: ld[1], emissiveIntensity: 1 }), WC_X + ld[0], 0.86, WC_F - 0.003);
  });
  var wcLabelTex = paintTexture(128, 48, function (g, w, h) {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#4a8ad0'; g.beginPath(); g.moveTo(18, 8); g.quadraticCurveTo(30, 24, 18, 38); g.quadraticCurveTo(6, 24, 18, 8); g.fill();
    g.fillStyle = '#2f6f68'; g.font = 'bold 14px Georgia, serif'; g.fillText('Everdawn', 34, 22); g.font = 'italic 11px Georgia, serif'; g.fillText('spring water', 36, 37);
  });
  ciPart(new THREE.PlaneGeometry(0.2, 0.075), new THREE.MeshStandardMaterial({ map: wcLabelTex, roughness: 0.6 }), WC_X, 0.36, WC_F - 0.001, 0, Math.PI, 0);
  for (var wv = 0; wv < 7; wv++) [-1, 1].forEach(function (s) { ciPart(new THREE.BoxGeometry(0.004, 0.012, 0.18), CI_KICK, WC_X + s * 0.161, 0.2 + wv * 0.03, WC_Z); });   // vents down the sides
  // the cup dispenser on its right side, with paper cones stacked inside
  var cupX = WC_X + 0.205;
  ciPart(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xcfe6f2, roughness: 0.1, transparent: true, opacity: 0.45, side: THREE.DoubleSide }), cupX, 0.7, WC_Z - 0.06);
  ciPart(new THREE.CylinderGeometry(0.038, 0.038, 0.03, 16), CI.white, cupX, 0.86, WC_Z - 0.06);
  ciPart(new THREE.TorusGeometry(0.036, 0.006, 6, 16), CI.white, cupX, 0.55, WC_Z - 0.06, Math.PI / 2, 0, 0);
  ciPart(new THREE.BoxGeometry(0.03, 0.08, 0.02), CI.white, cupX - 0.035, 0.7, WC_Z - 0.06);
  for (var cu = 0; cu < 8; cu++) ciPart(new THREE.ConeGeometry(0.03, 0.08, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0xfbfbf6, roughness: 0.9, side: THREE.DoubleSide }), cupX, 0.56 + cu * 0.035, WC_Z - 0.06, Math.PI, 0, 0);
  // the jug: upside down in the collar, with moulded ribs, a grip and a label band, full of water up to an air pocket
  var jugPts = [], waterPts = [];
  [[0.032, 0], [0.034, 0.05], [0.06, 0.08], [0.12, 0.11], [0.145, 0.15], [0.148, 0.38], [0.14, 0.44], [0.1, 0.48], [0.02, 0.495], [0, 0.496]].forEach(function (q) { jugPts.push(new THREE.Vector2(q[0], q[1])); });
  [[0.001, 0.005], [0.028, 0.005], [0.03, 0.05], [0.056, 0.08], [0.115, 0.11], [0.14, 0.15], [0.142, 0.4], [0.001, 0.4]].forEach(function (q) { waterPts.push(new THREE.Vector2(q[0], q[1])); });
  var JUG_Y = 0.985;
  ciPart(new THREE.LatheGeometry(waterPts, 28), new THREE.MeshStandardMaterial({ color: 0x8ec8ee, roughness: 0.05, metalness: 0.05, transparent: true, opacity: 0.5, depthWrite: false }), WC_X, JUG_Y, WC_Z).renderOrder = 2;
  ciPart(new THREE.LatheGeometry(jugPts, 28), new THREE.MeshStandardMaterial({ color: 0xd8eefa, roughness: 0.03, metalness: 0.1, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }), WC_X, JUG_Y, WC_Z).renderOrder = 3;
  [0.19, 0.26, 0.33].forEach(function (ry2) { ciPart(new THREE.TorusGeometry(0.149, 0.005, 6, 32), new THREE.MeshStandardMaterial({ color: 0xc8e6f6, roughness: 0.05, transparent: true, opacity: 0.5, depthWrite: false }), WC_X, JUG_Y + ry2, WC_Z, Math.PI / 2, 0, 0).renderOrder = 3; });
  ciPart(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 28, 1, true), new THREE.MeshStandardMaterial({ map: wcLabelTex, roughness: 0.6, side: THREE.DoubleSide }), WC_X, JUG_Y + 0.225, WC_Z).renderOrder = 4;
  ciPart(new THREE.CylinderGeometry(0.038, 0.038, 0.03, 16), wcBlue, WC_X, JUG_Y + 0.02, WC_Z);                       // the cap, seated in the collar
  var wcBubbles = [];
  for (var bb = 0; bb < 4; bb++) {
    var bub = ciPart(new THREE.SphereGeometry(0.012 + bb * 0.003, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.6, depthWrite: false }), WC_X, JUG_Y + 0.1, WC_Z);
    bub.castShadow = false; bub.renderOrder = 2; wcBubbles.push({ m: bub, p: bb * 0.27, x: (isle2Hash(bb * 3.3) - 0.5) * 0.12, z: (isle2Hash(bb * 5.1) - 0.5) * 0.12 });
  }
  ciSolids.push([WC_X, WC_Z, 0.3]);

  // big leafy monsteras in the corners: split, holey leaves on long curving stems around a moss pole, with an aerial
  // root or two, in a ribbed ceramic pot on a little wooden stand
  var ciMonsteraTex = paintTexture(128, 128, function (g, w, h) {     // the leaf's surface: glossy deep green with paler veins
    var lg = g.createLinearGradient(0, h, 0, 0); lg.addColorStop(0, '#2a5a2c'); lg.addColorStop(1, '#3f7a3a');
    g.fillStyle = lg; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(170,210,140,0.75)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke();   // the midrib
    g.lineWidth = 1.1; g.strokeStyle = 'rgba(150,200,130,0.45)';
    for (var v = 0; v < 9; v++) { var vy = h - 14 - v * 12; [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(w / 2, vy); g.quadraticCurveTo(w / 2 + s * 30, vy - 10, w / 2 + s * 64, vy - 22); g.stroke(); }); }
    for (var i = 0; i < 300; i++) { g.fillStyle = 'rgba(255,255,255,' + isle2Hash(i) * 0.05 + ')'; g.fillRect(isle2Hash(i * 2.2) * w, isle2Hash(i * 3.6) * h, 2, 1); }
  });
  var ciMonsteraMat = new THREE.MeshStandardMaterial({ map: ciMonsteraTex, roughness: 0.35, side: THREE.DoubleSide });
  function ciMonsteraLeaf(L, seed) {                                  // a heart-shaped leaf with slits from the edge and small holes by the midrib
    var shape = new THREE.Shape(), N = 34, slits = [0.28, 0.42, 0.56, 0.7, 0.83];
    function W(u) { return 0.48 * L * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, u))), 0.72); }
    function Y(u) { return -0.06 * L + u * 1.06 * L; }
    var side = function (s, forward) {
      for (var i = 0; i <= N; i++) {
        var u = forward ? 0.04 + (i / N) * 0.96 : 1 - (i / N) * 0.96;
        var slit = -1;
        for (var k = 0; k < slits.length; k++) if (Math.abs(u - slits[k] - (isle2Hash(seed + k + s) - 0.5) * 0.03) < 0.5 / N) slit = k;
        if (slit >= 0 && isle2Hash(seed * 3 + slit + s * 7) > 0.15) {    // cut a slit in toward the midrib
          var du = 0.022, o1 = forward ? -du : du;
          shape.lineTo(s * W(u + o1), Y(u + o1));
          shape.lineTo(s * W(u) * 0.24, Y(u + o1) - 0.07 * L);
          shape.lineTo(s * W(u) * 0.26, Y(u - o1) - 0.07 * L);
          shape.lineTo(s * W(u - o1), Y(u - o1));
        } else shape.lineTo(s * W(u), Y(u));
      }
    };
    shape.moveTo(0, 0.05 * L);                                          // the notch where the stem joins
    side(1, true); side(-1, false);
    shape.lineTo(0, 0.05 * L);
    [0.35, 0.49, 0.63].forEach(function (hu, k) {                       // little oval holes beside the midrib
      [-1, 1].forEach(function (s) {
        if (isle2Hash(seed + k * 5 + s) < 0.3) return;
        var hole = new THREE.Path(); hole.absellipse(s * W(hu) * 0.42, Y(hu) - 0.054 * L, 0.035 * L, 0.018 * L, 0, Math.PI * 2, true, s * 0.5); shape.holes.push(hole);
      });
    });
    var geo = new THREE.ShapeGeometry(shape, 6), p = geo.attributes.position, uv = geo.attributes.uv;
    for (var vi = 0; vi < p.count; vi++) {
      var x = p.getX(vi), y = p.getY(vi);
      uv.setXY(vi, x / L + 0.5, (y + 0.06 * L) / (1.06 * L));
      p.setZ(vi, Math.pow(x / (0.5 * L), 2) * 0.08 * L - Math.pow(Math.max(0, y) / L, 2) * 0.22 * L);   // cupped a little, its tip drooping
    }
    geo.computeVertexNormals();
    return geo;
  }
  var ciStemMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.5 }), ciRootMat = new THREE.MeshStandardMaterial({ color: 0x6a5038, roughness: 0.8 });
  var ciPotMat = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.55 });
  function ciPlant(x, z, s) {
    var STAND = 0.14 * s, potH = 0.38 * s, potR = 0.22 * s;
    // the stand: a ring on four splayed legs
    ciPart(new THREE.TorusGeometry(potR * 0.82, 0.016 * s, 8, 24), CI_OAK, x, STAND, z, Math.PI / 2, 0, 0);
    for (var lg = 0; lg < 4; lg++) { var la = lg / 4 * Math.PI * 2 + 0.785; ciRod(new THREE.Vector3(x + Math.cos(la) * potR * 0.8, STAND, z + Math.sin(la) * potR * 0.8), new THREE.Vector3(x + Math.cos(la) * potR * 1.05, 0, z + Math.sin(la) * potR * 1.05), 0.014 * s, CI_OAK); }
    // the ribbed pot
    var potPts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(potR * 0.72, 0), new THREE.Vector2(potR * 0.78, 0.02 * s), new THREE.Vector2(potR * 0.98, potH * 0.85), new THREE.Vector2(potR, potH), new THREE.Vector2(potR * 1.04, potH), new THREE.Vector2(potR * 1.04, potH + 0.02 * s), new THREE.Vector2(potR * 0.93, potH + 0.02 * s), new THREE.Vector2(potR * 0.9, potH - 0.03 * s)];
    var potGeo = new THREE.LatheGeometry(potPts, 48), pp = potGeo.attributes.position;
    for (var v = 0; v < pp.count; v++) {
      var px = pp.getX(v), pz = pp.getZ(v), r = Math.sqrt(px * px + pz * pz), ang = Math.atan2(pz, px), py = pp.getY(v);
      if (r > 0.01 && py > 0.03 * s && py < potH - 0.01) { var k = 1 + Math.abs(Math.cos(ang * 12)) * 0.035; pp.setX(v, px * k); pp.setZ(v, pz * k); }
    }
    potGeo.computeVertexNormals();
    ciPart(potGeo, ciPotMat, x, STAND, z);
    var soilY = STAND + potH - 0.04 * s;
    ciPart(new THREE.CylinderGeometry(potR * 0.9, potR * 0.9, 0.01, 24), CI.soil, x, soilY, z);
    for (var pb = 0; pb < 14; pb++) { var pa = pb * 2.4, pr = isle2Hash(pb + x) * potR * 0.8; ciPart(new THREE.SphereGeometry(0.012 * s, 6, 4), new THREE.MeshStandardMaterial({ color: pb % 3 ? 0xd8d2c4 : 0xa89a88, roughness: 0.9 }), x + Math.cos(pa) * pr, soilY + 0.006, z + Math.sin(pa) * pr).scale.set(1, 0.6, 1); }   // pebbles on the soil
    // the moss pole, and an aerial root or two
    ciPart(new THREE.CylinderGeometry(0.03 * s, 0.035 * s, 0.6 * s, 10), new THREE.MeshStandardMaterial({ color: 0x6a7a3a, roughness: 1 }), x - 0.03 * s, soilY + 0.3 * s, z - 0.02 * s);
    for (var rt = 0; rt < 2; rt++) {
      var ra = rt * 2.7 + x, root = new THREE.CatmullRomCurve3([new THREE.Vector3(x + Math.cos(ra) * 0.05 * s, soilY + 0.3 * s, z + Math.sin(ra) * 0.05 * s), new THREE.Vector3(x + Math.cos(ra) * 0.08 * s, soilY + 0.15 * s, z + Math.sin(ra) * 0.08 * s), new THREE.Vector3(x + Math.cos(ra) * 0.1 * s, soilY, z + Math.sin(ra) * 0.1 * s)]);
      ciPart(new THREE.TubeGeometry(root, 12, 0.005 * s, 5), ciRootMat, 0, 0, 0);
    }
    // the leaves, each on its own curving stem
    for (var l = 0; l < 12; l++) {
      var a = l * 2.4 + x * 1.3, h = (0.45 + isle2Hash(l + x * 3) * 0.55) * s, out = (0.14 + isle2Hash(l * 2 + z) * 0.2) * s, pitch = -(0.25 + isle2Hash(l * 5 + x) * 0.55);   // tipped outward, so you see their faces
      var start = new THREE.Vector3(x + Math.cos(a) * 0.03 * s, soilY, z + Math.sin(a) * 0.03 * s);
      var end = new THREE.Vector3(x + Math.cos(a) * out, soilY + h, z + Math.sin(a) * out);
      var stem = new THREE.CatmullRomCurve3([start, new THREE.Vector3(x + Math.cos(a) * out * 0.3, soilY + h * 0.6, z + Math.sin(a) * out * 0.3), new THREE.Vector3(x + Math.cos(a) * out * 0.8, soilY + h * 1.02, z + Math.sin(a) * out * 0.8), end]);
      ciPart(new THREE.TubeGeometry(stem, 16, 0.007 * s, 6), ciStemMat, 0, 0, 0);
      var L = (0.38 + isle2Hash(l * 7 + x) * 0.16) * s;
      var leaf = ciPart(ciMonsteraLeaf(L, l * 11 + Math.round(x * 7)), ciMonsteraMat, end.x, end.y, end.z);
      var F = new THREE.Vector3(Math.cos(a) * Math.cos(pitch), Math.sin(pitch), Math.sin(a) * Math.cos(pitch)), R = new THREE.Vector3(-Math.sin(a), 0, Math.cos(a)), Nn = new THREE.Vector3().crossVectors(R, F);
      leaf.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(R, F, Nn));
      ciPart(new THREE.CylinderGeometry(0.012 * s, 0.006 * s, 0.08 * s, 6), new THREE.MeshStandardMaterial({ color: 0x8a9a5a, roughness: 0.7 }), start.x, soilY + 0.04 * s, start.z, 0, 0, 0);   // a papery sheath where the stem leaves the soil
    }
    var newLeaf = new THREE.CatmullRomCurve3([new THREE.Vector3(x, soilY, z), new THREE.Vector3(x + 0.02 * s, soilY + 0.5 * s, z + 0.01 * s), new THREE.Vector3(x + 0.05 * s, soilY + 0.95 * s, z + 0.03 * s)]);   // a brand-new leaf, still rolled up
    ciPart(new THREE.TubeGeometry(newLeaf, 12, 0.006 * s, 6), ciStemMat, 0, 0, 0);
    ciPart(new THREE.ConeGeometry(0.018 * s, 0.16 * s, 10), new THREE.MeshStandardMaterial({ color: 0x8ac860, roughness: 0.4 }), x + 0.055 * s, soilY + 1.02 * s, z + 0.035 * s, 0.1, 0, -0.08);
  }
  ciPlant(-CIN_W / 2 + 0.45, CIN_D / 2 - 0.45, 1.25); ciSolids.push([-CIN_W / 2 + 0.45, CIN_D / 2 - 0.45, 0.35]);
  ciPlant(1.45, CIN_D / 2 - 0.4, 1.1); ciSolids.push([1.45, CIN_D / 2 - 0.4, 0.32]);

  // ----- the doctor's corner, on the right -----
  // the doctor's desk: a mid-century oak desk on tapered legs with a pedestal of drawers, a leather desk mat, a laptop,
  // an angled desk lamp, a stethoscope, a stack of patient folders with a clipboard, a mug of tea on a coaster, a pot of
  // pens, a little succulent, a prescription pad and a brass name plate
  var DD_X = 3.55, DD_Z = 1.55, DD_TOP = 0.785;
  function ciRod(a, b, r, mat, parent) {                               // a round rod from point a to point b
    var d = new THREE.Vector3().subVectors(b, a), m = ciPart(new THREE.CylinderGeometry(r, r, d.length(), 10), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, 0, 0, 0, parent);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return m;
  }
  // the desk itself
  ciPart(ciRoundBox(1.72, 0.045, 0.82, 0.012), CI_OAK, DD_X, DD_TOP - 0.0225, DD_Z);
  ciPart(new THREE.BoxGeometry(1.06, 0.07, 0.03), CI_OAK, DD_X - 0.3, DD_TOP - 0.08, DD_Z + 0.37);                       // the apron under the front edge
  ciPart(new THREE.BoxGeometry(1.06, 0.07, 0.03), CI_OAK, DD_X - 0.3, DD_TOP - 0.08, DD_Z - 0.37);
  ciPart(new THREE.BoxGeometry(0.03, 0.07, 0.72), CI_OAK, DD_X - 0.82, DD_TOP - 0.08, DD_Z);
  [[-0.78, -0.33], [-0.78, 0.33]].forEach(function (l) {                // tapered, splayed legs with brass feet
    var lx = DD_X + l[0], lz = DD_Z + l[1];
    ciPart(new THREE.CylinderGeometry(0.026, 0.014, DD_TOP - 0.06, 12), CI_OAK, lx - 0.02, (DD_TOP - 0.06) / 2, lz + (l[1] > 0 ? 0.02 : -0.02), (l[1] > 0 ? 0.06 : -0.06), 0, 0.06);
    ciPart(new THREE.CylinderGeometry(0.015, 0.013, 0.05, 10), CI.brass, lx - 0.043, 0.025, lz + (l[1] > 0 ? 0.042 : -0.042));
  });
  ciPart(new THREE.BoxGeometry(1.0, 0.32, 0.018), CI_OAK, DD_X - 0.28, 0.56, DD_Z + 0.33);                               // the modesty panel, with a routed line
  ciPart(new THREE.BoxGeometry(0.96, 0.006, 0.004), CI.darkWood, DD_X - 0.28, 0.5, DD_Z + 0.341);
  // the pedestal: three drawers with recessed fronts, brass cup handles and little card holders
  var PED_X = DD_X + 0.56;
  ciPart(ciRoundBox(0.5, DD_TOP - 0.1, 0.74, 0.01), CI_OAK, PED_X, 0.06 + (DD_TOP - 0.1) / 2, DD_Z);
  ciPart(new THREE.BoxGeometry(0.44, 0.05, 0.68), CI.darkWood, PED_X, 0.025, DD_Z - 0.01);
  [[0.6, 0.15], [0.41, 0.19], [0.18, 0.22]].forEach(function (dr) {
    var dy = dr[0], dh = dr[1];
    ciPart(ciRoundBox(0.44, dh - 0.02, 0.025, 0.008), CI.mint, PED_X, dy, DD_Z + 0.372);
    ciPart(new THREE.BoxGeometry(0.38, dh - 0.07, 0.004), new THREE.MeshStandardMaterial({ color: 0xa9d2bf, roughness: 0.5 }), PED_X, dy, DD_Z + 0.386);
    ciPart(new THREE.CylinderGeometry(0.035, 0.035, 0.022, 16, 1, true, 0, Math.PI), CI.brass, PED_X, dy + 0.01, DD_Z + 0.395, 0, 0, Math.PI / 2).scale.set(1, 1.6, 0.6);   // a cup handle
    ciPart(new THREE.BoxGeometry(0.07, 0.025, 0.004), CI.brass, PED_X, dy + dh / 2 - 0.035, DD_Z + 0.39);
    ciPart(new THREE.BoxGeometry(0.055, 0.016, 0.002), CI.paper, PED_X, dy + dh / 2 - 0.035, DD_Z + 0.393);
  });
  // a leather desk mat with stitched edges
  ciPart(ciRoundBox(0.78, 0.006, 0.46, 0.003), new THREE.MeshStandardMaterial({ color: 0x2f5a4a, roughness: 0.6 }), DD_X - 0.12, DD_TOP + 0.003, DD_Z + 0.02);
  [[0, 0.215, 0.74, 0.003], [0, -0.215, 0.74, 0.003], [0.375, 0, 0.003, 0.41], [-0.375, 0, 0.003, 0.41]].forEach(function (st) {
    ciPart(new THREE.BoxGeometry(st[2], 0.002, st[3]), new THREE.MeshStandardMaterial({ color: 0xc9b98a, roughness: 0.8 }), DD_X - 0.12 + st[0], DD_TOP + 0.0065, DD_Z + 0.02 + st[1]);
  });

  // the laptop: an aluminium case with a keyboard and trackpad, and its lid open on a hinge showing a heartbeat
  var ciKeysTex = paintTexture(256, 112, function (g, w, h) {
    g.fillStyle = '#c9cdd2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1c1f24';
    for (var r = 0; r < 5; r++) for (var c = 0; c < 14; c++) {
      var kw = (r === 4 && c > 3 && c < 9) ? 0 : 15;
      if (kw) g.fillRect(6 + c * 17.6 + (r % 2) * 4, 6 + r * 20, kw, 16);
    }
    g.fillRect(6 + 4 * 17.6, 86, 17.6 * 5 - 3, 16);                   // the space bar
  });
  var lapG = new THREE.Group(); lapG.position.set(DD_X - 0.16, DD_TOP + 0.006, DD_Z + 0.02); lapG.rotation.y = 0.2; clinicRoom.add(lapG);
  ciPart(ciRoundBox(0.42, 0.016, 0.29, 0.006), CI_ALU, 0, 0.008, 0, 0, 0, 0, lapG);
  ciPart(new THREE.PlaneGeometry(0.36, 0.13), new THREE.MeshStandardMaterial({ map: ciKeysTex, roughness: 0.5 }), 0, 0.0165, -0.035, -Math.PI / 2, 0, 0, lapG);
  ciPart(new THREE.PlaneGeometry(0.14, 0.085), new THREE.MeshStandardMaterial({ color: 0xc3c7cc, roughness: 0.25 }), 0, 0.0166, 0.085, -Math.PI / 2, 0, 0, lapG);   // the trackpad
  ciPart(new THREE.CylinderGeometry(0.007, 0.007, 0.36, 10), CI_KICK, 0, 0.016, -0.143, 0, 0, Math.PI / 2, lapG);          // the hinge
  var lid = new THREE.Group(); lid.position.set(0, 0.016, -0.143); lid.rotation.x = -0.22; lapG.add(lid);
  ciPart(ciRoundBox(0.42, 0.28, 0.009, 0.005), CI_ALU, 0, 0.14, -0.002, 0, 0, 0, lid);
  ciPart(new THREE.PlaneGeometry(0.405, 0.265), new THREE.MeshStandardMaterial({ color: 0x0c0e10, roughness: 0.2 }), 0, 0.14, 0.0028, 0, 0, 0, lid);   // the black bezel
  ciPart(new THREE.PlaneGeometry(0.38, 0.235), new THREE.MeshStandardMaterial({ map: ciLaptopTex, emissive: 0xffffff, emissiveMap: ciLaptopTex, emissiveIntensity: 0.85, roughness: 0.15 }), 0, 0.142, 0.003, 0, 0, 0, lid).castShadow = false;
  ciPart(new THREE.SphereGeometry(0.003, 6, 4), CI_KICK, 0, 0.268, 0.004, 0, 0, 0, lid);                                // the webcam
  ciPart(new THREE.CircleGeometry(0.022, 16), new THREE.MeshStandardMaterial({ color: 0xf2f4f6, roughness: 0.15, metalness: 0.6 }), 0, 0.15, -0.0072, 0, Math.PI, 0, lid);   // a logo on the back

  // an angled desk lamp: a weighted base with a switch, two arms with springs and joints, and a shade with a warm bulb
  var lampBase = new THREE.Vector3(DD_X + 0.6, DD_TOP, DD_Z - 0.22), elbow = new THREE.Vector3(DD_X + 0.6, DD_TOP + 0.3, DD_Z - 0.32), headP = new THREE.Vector3(DD_X + 0.58, DD_TOP + 0.44, DD_Z - 0.1);
  ciPart(new THREE.CylinderGeometry(0.075, 0.085, 0.03, 24), CI.teal, lampBase.x, DD_TOP + 0.015, lampBase.z);
  ciPart(new THREE.TorusGeometry(0.08, 0.004, 6, 28), CI_CHROME, lampBase.x, DD_TOP + 0.027, lampBase.z, Math.PI / 2, 0, 0);
  ciPart(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 10), CI_KICK, lampBase.x + 0.045, DD_TOP + 0.034, lampBase.z + 0.03);   // the switch
  ciPart(new THREE.SphereGeometry(0.02, 12, 8), CI_CHROME, lampBase.x, DD_TOP + 0.04, lampBase.z);
  ciRod(new THREE.Vector3(lampBase.x, DD_TOP + 0.04, lampBase.z), elbow, 0.008, CI.teal);
  ciRod(new THREE.Vector3(lampBase.x + 0.018, DD_TOP + 0.06, lampBase.z), new THREE.Vector3(elbow.x + 0.018, elbow.y - 0.03, elbow.z), 0.003, CI_CHROME);   // the springs
  ciPart(new THREE.SphereGeometry(0.016, 12, 8), CI_CHROME, elbow.x, elbow.y, elbow.z);
  ciRod(elbow, headP, 0.007, CI.teal);
  ciRod(new THREE.Vector3(elbow.x + 0.016, elbow.y + 0.01, elbow.z + 0.02), new THREE.Vector3(headP.x + 0.016, headP.y - 0.02, headP.z - 0.03), 0.0025, CI_CHROME);
  ciPart(new THREE.SphereGeometry(0.014, 12, 8), CI_CHROME, headP.x, headP.y, headP.z);
  var shadeG = new THREE.Group(); shadeG.position.copy(headP); shadeG.rotation.x = 0.85; clinicRoom.add(shadeG);
  var shadePts = [new THREE.Vector2(0.02, 0.05), new THREE.Vector2(0.03, 0.03), new THREE.Vector2(0.06, -0.02), new THREE.Vector2(0.085, -0.08), new THREE.Vector2(0.088, -0.09)];
  ciPart(new THREE.LatheGeometry(shadePts, 24), new THREE.MeshStandardMaterial({ color: 0x2f6f68, roughness: 0.35, side: THREE.DoubleSide }), 0, 0, 0.04, 0, 0, 0, shadeG);
  ciPart(new THREE.SphereGeometry(0.03, 12, 10), CI.light, 0, -0.04, 0.04, 0, 0, 0, shadeG);
  var lampCord = new THREE.CatmullRomCurve3([new THREE.Vector3(lampBase.x - 0.05, DD_TOP + 0.01, lampBase.z - 0.04), new THREE.Vector3(lampBase.x - 0.15, DD_TOP + 0.004, lampBase.z - 0.12), new THREE.Vector3(lampBase.x - 0.1, DD_TOP + 0.004, DD_Z - 0.4), new THREE.Vector3(lampBase.x - 0.12, DD_TOP - 0.2, DD_Z - 0.43), new THREE.Vector3(lampBase.x - 0.1, 0.01, DD_Z - 0.5)]);
  ciPart(new THREE.TubeGeometry(lampCord, 30, 0.004, 5), CI_KICK, 0, 0, 0);

  // the stethoscope, coiled on the desk: tubing looped round, a chrome chest piece, and the ear tubes with soft tips
  var stG = new THREE.Group(); stG.position.set(DD_X + 0.22, DD_TOP + 0.008, DD_Z + 0.2); stG.rotation.y = 0.5; clinicRoom.add(stG);
  var coil = [];
  coil.push(new THREE.Vector3(0.15, 0.006, 0.07));
  for (var ca = 0; ca <= 16; ca++) { var cang = ca / 16 * Math.PI * 1.75 + 0.3, cr = 0.1 + Math.sin(ca * 0.7) * 0.008; coil.push(new THREE.Vector3(Math.cos(cang) * cr, 0.006 + (ca % 5 === 2 ? 0.006 : 0), Math.sin(cang) * cr)); }
  coil.push(new THREE.Vector3(-0.02, 0.008, -0.13));
  ciPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(coil), 80, 0.0055, 8), new THREE.MeshStandardMaterial({ color: 0x1d2a3a, roughness: 0.35 }), 0, 0, 0, 0, 0, 0, stG);
  ciPart(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 8), CI_CHROME, -0.02, 0.008, -0.14, Math.PI / 2, 0, 0, stG);   // the Y fitting
  [[-0.12, -0.2], [0.07, -0.22]].forEach(function (tip) {              // the chrome ear tubes and their tips
    var ear = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.02, 0.008, -0.15), new THREE.Vector3((tip[0] - 0.02) * 0.5, 0.01, -0.19), new THREE.Vector3(tip[0], 0.01, tip[1])]);
    ciPart(new THREE.TubeGeometry(ear, 16, 0.0035, 6), CI_CHROME, 0, 0, 0, 0, 0, 0, stG);
    ciPart(new THREE.SphereGeometry(0.009, 10, 8), CI_KICK, tip[0], 0.012, tip[1], 0, 0, 0, stG);
  });
  ciPart(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 20), CI_CHROME, 0.17, 0.009, 0.09, 0, 0, 0, stG);               // the chest piece: a diaphragm in a black ring, and a bell
  ciPart(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 20), CI_KICK, 0.17, 0.016, 0.09, 0, 0, 0, stG);
  ciPart(new THREE.CylinderGeometry(0.016, 0.012, 0.016, 16), CI_CHROME, 0.17, 0.024, 0.09, 0, 0, 0, stG);
  ciPart(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8), CI_CHROME, 0.16, 0.009, 0.08, 0, 0.8, Math.PI / 2, stG);

  // a stack of patient folders with papers peeking out, and a clipboard with a chart and a pen on top
  var ciChartTex = paintTexture(128, 176, function (g, w, h) {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f6f68'; g.fillRect(0, 0, w, 18); g.fillStyle = '#ffffff'; g.font = 'bold 10px sans-serif'; g.fillText('PATIENT CHART', 8, 13);
    g.fillStyle = '#e0607a'; g.font = 'bold 12px sans-serif'; g.fillText('♥', w - 18, 13);
    g.strokeStyle = 'rgba(80,100,120,0.35)'; g.lineWidth = 1;
    for (var l = 0; l < 11; l++) { g.beginPath(); g.moveTo(8, 32 + l * 12); g.lineTo(w - 8, 32 + l * 12); g.stroke(); }
    g.strokeStyle = '#3a4a8a'; g.lineWidth = 1.2;
    for (var t = 0; t < 7; t++) { g.beginPath(); g.moveTo(10, 29 + t * 12); for (var x = 10; x < 30 + isle2Hash(t) * 70; x += 4) g.lineTo(x, 29 + t * 12 + Math.sin(x * 0.9 + t) * 1.5); g.stroke(); }   // handwriting
    g.strokeStyle = '#e0607a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(10, 150); [[30, 150], [36, 140], [42, 160], [48, 150], [110, 150]].forEach(function (p) { g.lineTo(p[0], p[1]); }); g.stroke();
  });
  var FOL_X = DD_X - 0.66, FOL_Z = DD_Z + 0.05;
  [[CI.mint, -0.18], [CI.coral, 0.05], [new THREE.MeshStandardMaterial({ color: 0xf2e6c8, roughness: 0.8 }), -0.06]].forEach(function (f, k) {
    var y = DD_TOP + 0.006 + k * 0.014;
    ciPart(new THREE.BoxGeometry(0.25, 0.006, 0.33), f[0], FOL_X, y, FOL_Z, 0, f[1], 0);
    ciPart(new THREE.BoxGeometry(0.23, 0.004, 0.31), CI.paper, FOL_X + 0.012, y + 0.005, FOL_Z - 0.01, 0, f[1] + 0.04, 0);   // the papers inside
    ciPart(new THREE.BoxGeometry(0.07, 0.006, 0.02), f[0], FOL_X - 0.06, y, FOL_Z - 0.175, 0, f[1], 0);                   // its tab
  });
  var clipG = new THREE.Group(); clipG.position.set(FOL_X + 0.01, DD_TOP + 0.05, FOL_Z + 0.01); clipG.rotation.y = 0.12; clinicRoom.add(clipG);
  ciPart(ciRoundBox(0.23, 0.006, 0.32, 0.003), new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.6 }), 0, 0, 0, 0, 0, 0, clipG);
  ciPart(new THREE.PlaneGeometry(0.2, 0.275), new THREE.MeshStandardMaterial({ map: ciChartTex, roughness: 0.9 }), 0, 0.0035, 0.015, -Math.PI / 2, 0, 0, clipG);
  ciPart(ciRoundBox(0.1, 0.012, 0.035, 0.005), CI_CHROME, 0, 0.008, -0.14, 0, 0, 0, clipG);
  ciPart(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 8), CI.teal, 0.06, 0.012, 0.02, Math.PI / 2, 0.4, 0, clipG);   // the pen
  ciPart(new THREE.ConeGeometry(0.004, 0.012, 8), CI_CHROME, 0.06 - Math.sin(0.4) * 0.076, 0.012, 0.02 - Math.cos(0.4) * 0.076, -Math.PI / 2, 0.4, 0, clipG);

  // a mug of tea on a cork coaster, its tea bag tag hanging over the side
  var MUG_X = DD_X + 0.32, MUG_Z = DD_Z - 0.26;
  ciPart(new THREE.CylinderGeometry(0.05, 0.05, 0.006, 20), new THREE.MeshStandardMaterial({ color: 0xb98a5a, roughness: 0.95 }), MUG_X, DD_TOP + 0.003, MUG_Z);
  var mugPts = [new THREE.Vector2(0.001, 0.0), new THREE.Vector2(0.033, 0.0), new THREE.Vector2(0.036, 0.004), new THREE.Vector2(0.038, 0.09), new THREE.Vector2(0.035, 0.092), new THREE.Vector2(0.033, 0.088), new THREE.Vector2(0.032, 0.01)];
  ciPart(new THREE.LatheGeometry(mugPts, 24), new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 0.2, side: THREE.DoubleSide }), MUG_X, DD_TOP + 0.006, MUG_Z);
  ciPart(new THREE.TorusGeometry(0.022, 0.006, 8, 16, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 0.2 }), MUG_X + 0.04, DD_TOP + 0.05, MUG_Z, 0, 0, -Math.PI * 0.6);
  ciPart(new THREE.TorusGeometry(0.038, 0.003, 6, 28), new THREE.MeshStandardMaterial({ color: 0x2f6f68, roughness: 0.4 }), MUG_X, DD_TOP + 0.07, MUG_Z, Math.PI / 2, 0, 0);   // a painted teal stripe round it
  ciPart(new THREE.CircleGeometry(0.032, 20), new THREE.MeshStandardMaterial({ color: 0x8a4a1c, roughness: 0.08 }), MUG_X, DD_TOP + 0.08, MUG_Z, -Math.PI / 2, 0, 0);
  ciRod(new THREE.Vector3(MUG_X - 0.01, DD_TOP + 0.08, MUG_Z - 0.02), new THREE.Vector3(MUG_X - 0.036, DD_TOP + 0.098, MUG_Z - 0.03), 0.0008, CI.paper);
  ciRod(new THREE.Vector3(MUG_X - 0.038, DD_TOP + 0.098, MUG_Z - 0.03), new THREE.Vector3(MUG_X - 0.042, DD_TOP + 0.05, MUG_Z - 0.032), 0.0008, CI.paper);
  ciPart(new THREE.BoxGeometry(0.003, 0.022, 0.018), new THREE.MeshStandardMaterial({ color: 0xffd27a, roughness: 0.8 }), MUG_X - 0.043, DD_TOP + 0.04, MUG_Z - 0.032);

  // a pot of pens, a succulent, a prescription pad and a brass name plate facing the patient's chair
  var PEN_X = DD_X + 0.05, PEN_Z = DD_Z - 0.3;
  ciPart(new THREE.CylinderGeometry(0.035, 0.032, 0.1, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0x3f8a80, roughness: 0.3, side: THREE.DoubleSide }), PEN_X, DD_TOP + 0.05, PEN_Z);
  ciPart(new THREE.CircleGeometry(0.032, 18), CI_KICK, PEN_X, DD_TOP + 0.002, PEN_Z, -Math.PI / 2, 0, 0);
  [[0.012, 0.005, CI.black, 0.15], [-0.012, 0.01, CI.coral, -0.12], [0.004, -0.014, CI.teal, 0.05], [-0.006, -0.004, CI.brass, -0.2]].forEach(function (pn) {
    var tilt = pn[3];
    ciPart(new THREE.CylinderGeometry(0.0045, 0.0045, 0.15, 8), pn[2], PEN_X + pn[0] + tilt * 0.06, DD_TOP + 0.08, PEN_Z + pn[1], tilt * 0.6, 0, tilt);
    ciPart(new THREE.CylinderGeometry(0.0052, 0.0052, 0.025, 8), CI_CHROME, PEN_X + pn[0] + tilt * 0.13, DD_TOP + 0.155, PEN_Z + pn[1] + tilt * 0.05, tilt * 0.6, 0, tilt);
  });
  var SUC_X = DD_X - 0.66, SUC_Z = DD_Z - 0.26;                       // a little succulent in a terracotta pot
  ciPart(new THREE.CylinderGeometry(0.045, 0.034, 0.06, 16), CI.clay, SUC_X, DD_TOP + 0.03, SUC_Z);
  ciPart(new THREE.TorusGeometry(0.045, 0.006, 6, 16), CI.clay, SUC_X, DD_TOP + 0.06, SUC_Z, Math.PI / 2, 0, 0);
  ciPart(new THREE.CylinderGeometry(0.041, 0.041, 0.004, 14), CI.soil, SUC_X, DD_TOP + 0.056, SUC_Z);
  var sucMat = new THREE.MeshStandardMaterial({ color: 0x7aae8a, roughness: 0.5 });
  for (var sl = 0; sl < 14; sl++) {
    var sla = sl * 2.4, ring = sl < 6 ? 0 : sl < 11 ? 1 : 2, sll = 0.04 - ring * 0.01;
    var leafS = ciPart(new THREE.SphereGeometry(1, 8, 6), sucMat, SUC_X + Math.cos(sla) * (0.026 - ring * 0.009), DD_TOP + 0.066 + ring * 0.008, SUC_Z + Math.sin(sla) * (0.026 - ring * 0.009));
    leafS.scale.set(sll, 0.009, 0.014); leafS.rotation.set(0, -sla, 0.5 + ring * 0.35);
  }
  var ciRxTex = paintTexture(96, 128, function (g, w, h) {
    g.fillStyle = '#fbfaf3'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f6f68'; g.fillRect(0, 0, w, 14); g.fillStyle = '#fff'; g.font = 'bold 8px sans-serif'; g.fillText('EVERDAWN CLINIC', 6, 10);
    g.fillStyle = '#2f6f68'; g.font = 'bold italic 26px Georgia, serif'; g.fillText('Rx', 8, 46);
    g.strokeStyle = 'rgba(80,100,120,0.35)'; g.lineWidth = 1;
    for (var l = 0; l < 6; l++) { g.beginPath(); g.moveTo(8, 62 + l * 11); g.lineTo(w - 8, 62 + l * 11); g.stroke(); }
  });
  ciPart(new THREE.BoxGeometry(0.11, 0.012, 0.15), CI.paper, DD_X + 0.5, DD_TOP + 0.006, DD_Z + 0.2, 0, -0.3, 0);
  ciPart(new THREE.PlaneGeometry(0.105, 0.14), new THREE.MeshStandardMaterial({ map: ciRxTex, roughness: 0.9 }), DD_X + 0.5, DD_TOP + 0.0125, DD_Z + 0.2, -Math.PI / 2, 0, -0.3);
  var ciNameTex = paintTexture(256, 48, function (g, w, h) {           // engraved brass
    var bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#f6dc8a'); bg.addColorStop(0.5, '#c9a24a'); bg.addColorStop(1, '#a8802c');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#7a5a1a'; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#3a2a0a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold italic 22px Georgia, serif'; g.fillText('Dr. Hazel Bramble', w / 2, h / 2 + 1);
  });
  var namePlate = new THREE.Group(); namePlate.position.set(DD_X - 0.2, DD_TOP, DD_Z + 0.33); clinicRoom.add(namePlate);
  var npShape = new THREE.Shape(); npShape.moveTo(-0.03, 0); npShape.lineTo(0.03, 0); npShape.lineTo(0.008, 0.055); npShape.lineTo(-0.008, 0.055); npShape.lineTo(-0.03, 0);
  var npGeo = new THREE.ExtrudeGeometry(npShape, { depth: 0.3, bevelEnabled: false }); npGeo.translate(0, 0, -0.15);
  ciPart(npGeo, CI.darkWood, 0, 0, 0, 0, Math.PI / 2, 0, namePlate);
  ciPart(new THREE.PlaneGeometry(0.28, 0.048), new THREE.MeshStandardMaterial({ map: ciNameTex, metalness: 0.6, roughness: 0.3 }), 0, 0.028, 0.0205, -0.37, 0, 0, namePlate);
  ciOfficeChair(DD_X - 0.1, DD_Z - 0.75, 0.15);
  ciArmchair(DD_X - 0.3, DD_Z + 1.05, Math.PI - 0.15, CI.tealVinyl);                                                    // a chair for you, across the desk
  ciSolids.push([DD_X - 0.45, DD_Z, 0.5], [DD_X + 0.4, DD_Z, 0.5], [DD_X - 0.1, DD_Z - 0.75, 0.32], [DD_X - 0.3, DD_Z + 1.05, 0.36]);
  ciFancyFrame('E', DD_Z - 0.35, 2.05, 0.36, 0.27, ciDiplomaTexA, CI.darkWood);                                         // diplomas over the desk (along the right wall, x on the wall is the room's z)
  ciFancyFrame('E', DD_Z + 0.3, 2.05, 0.36, 0.27, ciDiplomaTexB, CI.darkWood);
  // the eye chart in its light box: a teal case with a softly glowing face, a little switch and its cord
  ciWallPart('E', ciRoundBox(0.52, 0.9, 0.07, 0.02), CI.teal, 2.85, 1.72, 0.035);
  ciWallPart('E', new THREE.PlaneGeometry(0.44, 0.77), new THREE.MeshStandardMaterial({ map: ciEyeTex, emissive: 0xffffff, emissiveMap: ciEyeTex, emissiveIntensity: 0.14, roughness: 0.4 }), 2.85, 1.72, 0.0705).castShadow = false;
  ciWallPart('E', new THREE.PlaneGeometry(0.46, 0.79), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0.2, depthWrite: false }), 2.85, 1.72, 0.073).renderOrder = 2;
  ciWallPart('E', new THREE.BoxGeometry(0.03, 0.05, 0.02), CI.white, 2.85 + 0.2, 1.72 - 0.47, 0.06);
  ciWallPart('E', new THREE.BoxGeometry(0.008, 0.6, 0.008), CI.white, 2.85 + 0.2, 1.72 - 0.47 - 0.3, 0.012);
  var ciEyeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xf6fff8, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
  ciEyeGlow.position.set(CIN_W / 2 - 0.12, 1.72, 2.85); ciEyeGlow.scale.set(1.1, 1.4, 1); clinicRoom.add(ciEyeGlow);

  // the exam table under the back window: a white cabinet base with drawers, doors and a pull-out step, a padded teal
  // seat and a raised back rest with stitched seams and piping, chrome grab handles, a roll of paper on a chrome holder
  // pulled out along the top, and a pillow
  var EX_X = 2.65, EX_Z = CNW + 0.6, EX_L = 1.9, EX_D = 0.62, EX_TOP = 0.66;
  function ciRoundBox(w, h, d, r) {                                   // a box with softly rounded edges (w along x, h up, d along z)
    var b = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001), sw = w / 2 - b, sh = h / 2 - b, s = new THREE.Shape();
    var c = Math.min(b, sw, sh) * 0.9;
    s.moveTo(-sw + c, -sh); s.lineTo(sw - c, -sh); s.quadraticCurveTo(sw, -sh, sw, -sh + c); s.lineTo(sw, sh - c); s.quadraticCurveTo(sw, sh, sw - c, sh);
    s.lineTo(-sw + c, sh); s.quadraticCurveTo(-sw, sh, -sw, sh - c); s.lineTo(-sw, -sh + c); s.quadraticCurveTo(-sw, -sh, -sw + c, -sh);
    var g = new THREE.ExtrudeGeometry(s, { depth: d - b * 2, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 4, curveSegments: 6 });
    g.center();
    return g;
  }
  ciPart(new THREE.BoxGeometry(EX_L - 0.2, 0.08, EX_D - 0.1), CI_KICK, EX_X, 0.04, EX_Z - 0.03);                       // the recessed toe kick
  ciPart(ciRoundBox(EX_L - 0.1, EX_TOP - 0.08, EX_D, 0.03), CI.white, EX_X, 0.08 + (EX_TOP - 0.08) / 2, EX_Z);           // the cabinet
  var EXF = EX_Z + EX_D / 2;                                           // its front
  [[-0.66, 0.37, 0.4, 0.42, 'door'], [0.66, 0.37, 0.4, 0.42, 'door'], [0, 0.5, 0.82, 0.16, 'drawer'], [0, 0.31, 0.82, 0.16, 'drawer']].forEach(function (f) {
    ciPart(ciRoundBox(f[2], f[3], 0.025, 0.008), CI.mint, EX_X + f[0], f[1], EXF + 0.012);
    ciPart(new THREE.BoxGeometry(f[2] - 0.08, f[3] - 0.08, 0.006), new THREE.MeshStandardMaterial({ color: 0xa9d2bf, roughness: 0.5 }), EX_X + f[0], f[1], EXF + 0.026);   // a recessed panel
    if (f[4] === 'drawer') {                                            // a long bar pull on stand-offs
      ciPart(new THREE.CylinderGeometry(0.007, 0.007, 0.22, 8), CI_CHROME, EX_X + f[0], f[1] + 0.03, EXF + 0.05, 0, 0, Math.PI / 2);
      [-0.1, 0.1].forEach(function (o) { ciPart(new THREE.CylinderGeometry(0.005, 0.005, 0.025, 6), CI_CHROME, EX_X + f[0] + o, f[1] + 0.03, EXF + 0.038, Math.PI / 2, 0, 0); });
    } else {
      ciPart(new THREE.CylinderGeometry(0.007, 0.007, 0.16, 8), CI_CHROME, EX_X + f[0] - (f[0] > 0 ? 1 : -1) * 0.14, f[1], EXF + 0.05);
      [-0.07, 0.07].forEach(function (o) { ciPart(new THREE.CylinderGeometry(0.005, 0.005, 0.025, 6), CI_CHROME, EX_X + f[0] - (f[0] > 0 ? 1 : -1) * 0.14, f[1] + o, EXF + 0.038, Math.PI / 2, 0, 0); });
    }
  });
  ciPart(ciRoundBox(0.62, 0.045, 0.3, 0.012), CI.white, EX_X, 0.19, EXF + 0.15);                                         // the pull-out step, with a ribbed grip tread
  for (var gr = 0; gr < 6; gr++) ciPart(new THREE.BoxGeometry(0.54, 0.008, 0.022), CI_KICK, EX_X, 0.216, EXF + 0.04 + gr * 0.042);
  ciPart(new THREE.BoxGeometry(0.5, 0.02, 0.012), CI_CHROME, EX_X, 0.175, EXF + 0.3);
  ciPart(new THREE.BoxGeometry(EX_L - 0.04, 0.035, EX_D + 0.04), CI.white, EX_X, EX_TOP + 0.017, EX_Z);                 // the platform the cushions sit on
  // the padded seat and the raised back rest, with stitched seams, piping and a chrome hinge
  var SEAT_L = 1.12, SEAT_X = EX_X + EX_L / 2 - SEAT_L / 2 - 0.05, CUSH_Y = EX_TOP + 0.035 + 0.055;
  ciPart(ciRoundBox(SEAT_L, 0.11, EX_D - 0.02, 0.04), CI.tealVinyl, SEAT_X, CUSH_Y, EX_Z);
  [-1, 1].forEach(function (s) { ciPart(new THREE.BoxGeometry(SEAT_L - 0.08, 0.006, 0.004), CI_SEAM, SEAT_X, CUSH_Y + 0.03, EX_Z + s * (EX_D / 2 - 0.012)); });
  var BACK_L = 0.66, BACK_ANG = 0.5, hingeX = SEAT_X - SEAT_L / 2 - 0.01;
  var back = new THREE.Group(); back.position.set(hingeX, CUSH_Y, EX_Z); back.rotation.z = -BACK_ANG; clinicRoom.add(back);
  ciPart(ciRoundBox(BACK_L, 0.11, EX_D - 0.02, 0.04), CI.tealVinyl, -BACK_L / 2, 0, 0, 0, 0, 0, back);
  [-1, 1].forEach(function (s) { ciPart(new THREE.BoxGeometry(BACK_L - 0.08, 0.006, 0.004), CI_SEAM, -BACK_L / 2, 0.03, s * (EX_D / 2 - 0.012), 0, 0, 0, back); });
  ciPart(new THREE.CylinderGeometry(0.018, 0.018, EX_D - 0.06, 12), CI_CHROME, 0, -0.05, 0, Math.PI / 2, 0, 0, back);   // the hinge
  ciPart(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8), CI_CHROME, hingeX - 0.2, EX_TOP + 0.16, EX_Z, 0, 0, 1.05);   // the strut holding it up
  // the paper: pulled off the roll at the foot, along the seat, and up over the back rest
  var paperMat = new THREE.MeshStandardMaterial({ color: 0xfbfbf8, roughness: 0.95, side: THREE.DoubleSide });
  ciPart(new THREE.PlaneGeometry(SEAT_L + 0.02, 0.5), paperMat, SEAT_X, CUSH_Y + 0.057, EX_Z, -Math.PI / 2, 0, 0).castShadow = false;
  ciPart(new THREE.PlaneGeometry(BACK_L - 0.04, 0.5), paperMat, -BACK_L / 2 + 0.02, 0.057, 0, -Math.PI / 2, 0, 0, back).castShadow = false;
  var drape = new THREE.PlaneGeometry(0.16, 0.5, 8, 1), dp = drape.attributes.position;   // curling over the foot end, down to the roll
  for (var dv = 0; dv < dp.count; dv++) { var dx2 = dp.getX(dv) + 0.08, da = dx2 / 0.16 * Math.PI / 2; dp.setX(dv, Math.sin(da) * 0.08); dp.setZ(dv, -(1 - Math.cos(da)) * 0.08); }
  drape.computeVertexNormals();
  ciPart(drape, paperMat, SEAT_X + SEAT_L / 2 + 0.005, CUSH_Y + 0.057, EX_Z, -Math.PI / 2, 0, 0).castShadow = false;
  var ROLL_X = EX_X + EX_L / 2 + 0.02, ROLL_Y = EX_TOP - 0.02;
  ciPart(new THREE.CylinderGeometry(0.06, 0.06, 0.52, 20), new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.9 }), ROLL_X, ROLL_Y, EX_Z, Math.PI / 2, 0, 0);
  [-1, 1].forEach(function (s) {
    ciPart(new THREE.CylinderGeometry(0.024, 0.024, 0.004, 14), new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.9 }), ROLL_X, ROLL_Y, EX_Z + s * 0.262, Math.PI / 2, 0, 0);   // the cardboard core
    ciPart(new THREE.BoxGeometry(0.012, 0.11, 0.012), CI_CHROME, ROLL_X - 0.04, ROLL_Y + 0.03, EX_Z + s * 0.285, 0, 0, -0.6);   // the holder's arms
    ciPart(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 10), CI_CHROME, ROLL_X, ROLL_Y, EX_Z + s * 0.285, Math.PI / 2, 0, 0);
  });
  [-1, 1].forEach(function (s) {                                       // chrome grab handles at the sides of the seat
    ciPart(new THREE.TorusGeometry(0.06, 0.008, 6, 16, Math.PI), CI_CHROME, SEAT_X - 0.25, EX_TOP + 0.03, EX_Z + s * (EX_D / 2 + 0.01), Math.PI, 0, 0).scale.set(1.4, 1, 1);
  });
  var pillow = ciPart(ciRoundBox(0.34, 0.08, 0.46, 0.04), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }), -BACK_L + 0.22, 0.1, 0, 0, 0, 0, back);   // a plump pillow in a white case
  pillow.scale.set(1, 1, 1);
  ciPart(new THREE.BoxGeometry(0.3, 0.004, 0.47), new THREE.MeshStandardMaterial({ color: 0xcfe3f0, roughness: 0.9 }), -BACK_L + 0.22, 0.142, 0, 0, 0, 0, back);   // its pale blue stripe
  ciSolids.push([EX_X - 0.5, EX_Z, 0.45], [EX_X + 0.5, EX_Z, 0.45], [EX_X, EXF + 0.15, 0.25]);
  // a gas-lift doctor's stool: five legs on casters, a chrome foot ring and a padded seat with piping
  var stool = new THREE.Group(); stool.position.set(1.65, 0, -1.75); clinicRoom.add(stool);
  for (var sa = 0; sa < 5; sa++) {
    var san = sa / 5 * Math.PI * 2, lx2 = Math.sin(san), lz2 = Math.cos(san);
    ciPart(new THREE.BoxGeometry(0.035, 0.03, 0.24), CI_KICK, lx2 * 0.12, 0.085, lz2 * 0.12, 0.12, san, 0, stool);
    ciPart(new THREE.SphereGeometry(0.02, 8, 6), CI_CHROME, lx2 * 0.24, 0.07, lz2 * 0.24, 0, 0, 0, stool);
    ciPart(new THREE.BoxGeometry(0.025, 0.035, 0.03), CI.black, lx2 * 0.245, 0.045, lz2 * 0.245, 0, san, 0, stool);   // the caster fork
    ciPart(new THREE.CylinderGeometry(0.024, 0.024, 0.022, 12), CI.black, lx2 * 0.255, 0.024, lz2 * 0.255, 0, san, Math.PI / 2, stool);   // and its wheel
  }
  ciPart(new THREE.CylinderGeometry(0.045, 0.05, 0.06, 14), CI_KICK, 0, 0.1, 0, 0, 0, 0, stool);
  ciPart(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 12), CI.black, 0, 0.22, 0, 0, 0, 0, stool);
  ciPart(new THREE.CylinderGeometry(0.022, 0.022, 0.16, 12), CI_CHROME, 0, 0.38, 0, 0, 0, 0, stool);
  ciPart(new THREE.TorusGeometry(0.17, 0.009, 8, 32), CI_CHROME, 0, 0.27, 0, Math.PI / 2, 0, 0, stool);                // the foot ring
  for (var fs = 0; fs < 3; fs++) { var fsa = fs / 3 * Math.PI * 2 + 0.3; ciPart(new THREE.CylinderGeometry(0.006, 0.006, 0.15, 6), CI_CHROME, Math.sin(fsa) * 0.09, 0.27, Math.cos(fsa) * 0.09, Math.PI / 2, fsa, 0, stool); }
  ciPart(new THREE.CylinderGeometry(0.13, 0.11, 0.03, 20), CI_KICK, 0, 0.47, 0, 0, 0, 0, stool);                        // the seat pan
  ciPart(new THREE.BoxGeometry(0.02, 0.012, 0.14), CI.black, 0.1, 0.45, 0, 0, 0, 0.2, stool);                          // the height lever
  var seatPts = [];
  for (var sp2 = 0; sp2 <= 10; sp2++) { var sa2 = sp2 / 10 * Math.PI / 2; seatPts.push(new THREE.Vector2(0.15 + Math.sin(sa2) * 0.045, 0.045 - Math.cos(sa2) * 0.045)); }
  for (var sp3 = 0; sp3 <= 10; sp3++) { var sa3 = sp3 / 10 * Math.PI / 2; seatPts.push(new THREE.Vector2(0.15 + Math.cos(sa3) * 0.045, 0.045 + Math.sin(sa3) * 0.045 * 0.9)); }
  seatPts.push(new THREE.Vector2(0.0, 0.094));
  ciPart(new THREE.LatheGeometry(seatPts, 28), CI.tealVinyl, 0, 0.485, 0, 0, 0, 0, stool);
  ciPart(new THREE.TorusGeometry(0.193, 0.006, 6, 40), CI_SEAM, 0, 0.53, 0, Math.PI / 2, 0, 0, stool);                 // the piping round its edge
  ciSolids.push([1.65, -1.75, 0.24]);
  // a blood pressure gauge and a box of gloves on the back wall beside the window
  ciWallPart('N', new THREE.BoxGeometry(0.3, 0.38, 0.05), CI.white, 4.3, 1.55, 0.025);
  ciWallPart('N', new THREE.CylinderGeometry(0.11, 0.11, 0.03, 24), CI.white, 4.3, 1.6, 0.06, Math.PI / 2, 0, 0);
  ciWallPart('N', new THREE.CircleGeometry(0.095, 24), new THREE.MeshStandardMaterial({ color: 0xfbfaf4, roughness: 0.5 }), 4.3, 1.6, 0.076);
  ciWallPart('N', new THREE.BoxGeometry(0.008, 0.08, 0.004), CI.coral, 4.3 + 0.02, 1.62, 0.08, 0, 0, -0.5);
  ciWallPart('N', new THREE.TorusGeometry(0.1, 0.01, 6, 20, Math.PI * 1.4), CI.black, 4.3, 1.32, 0.07, 0, 0, Math.PI);
  ciWallPart('N', new THREE.BoxGeometry(0.26, 0.13, 0.12), CI.white, 4.3, 1.0 + 0.24, 0.07);
  ciWallPart('N', new THREE.BoxGeometry(0.22, 0.04, 0.005), new THREE.MeshStandardMaterial({ color: 0x9ab8ff }), 4.3, 1.27, 0.131);
  // the sink: a white cabinet with shaker doors, a speckled quartz top with an upstand, a deep oval basin, a gooseneck
  // tap with wrist-blade levers, a soap pump, a paper towel dispenser, a sanitiser and a pedal bin. Above it, a wall-
  // mounted patient monitor on a swing arm, and a framed poster about washing your hands
  var SK_X = CIN_W / 2 - 0.3, SK_Z = -2.25, SK_FX = SK_X - 0.29;          // SK_FX: the cabinet's front (it faces into the room, along -x)
  var ciQuartzTex = paintTexture(256, 256, function (g, w, h) {
    g.fillStyle = '#eef0ee'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 2600; i++) { var q = isle2Hash(i * 1.9); g.fillStyle = q > 0.7 ? 'rgba(150,150,150,0.5)' : q > 0.4 ? 'rgba(200,205,200,0.6)' : 'rgba(255,255,255,0.7)'; g.fillRect(isle2Hash(i * 2.3) * w, isle2Hash(i * 3.7) * h, 1 + q * 1.5, 1 + q * 1.5); }
  });
  ciQuartzTex.wrapS = ciQuartzTex.wrapT = THREE.RepeatWrapping;
  var ciQuartz = new THREE.MeshStandardMaterial({ map: ciQuartzTex, roughness: 0.25, metalness: 0.02 });
  var ciCeramic = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.18, side: THREE.DoubleSide });
  ciPart(new THREE.BoxGeometry(0.5, 0.08, 1.16), CI_KICK, SK_X + 0.03, 0.04, SK_Z);
  ciPart(ciRoundBox(0.56, 0.78, 1.2, 0.015), CI.white, SK_X, 0.08 + 0.39, SK_Z);
  [-0.29, 0.29].forEach(function (dz, k) {                              // two shaker doors: a frame, a recessed panel and a long bar pull
    var dzc = SK_Z + dz;
    [[0.305, 0, 0.07, 0.56], [-0.305, 0, 0.07, 0.56], [0, 0.245, 0.68, 0.07], [0, -0.245, 0.68, 0.07]].forEach(function (f) {   // rails and stiles
      ciPart(new THREE.BoxGeometry(0.025, f[2], f[3]), CI.mint, SK_FX - 0.012, 0.46 + f[0], dzc + f[1]);
    });
    ciPart(new THREE.BoxGeometry(0.012, 0.6, 0.44), new THREE.MeshStandardMaterial({ color: 0xa9d2bf, roughness: 0.5 }), SK_FX - 0.006, 0.46, dzc);
    var px = SK_FX - 0.05, pz = dzc + (k ? -0.2 : 0.2);
    ciPart(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 8), CI_CHROME, px, 0.58, pz);
    [-0.08, 0.08].forEach(function (o) { ciPart(new THREE.CylinderGeometry(0.005, 0.005, 0.04, 6), CI_CHROME, px + 0.02, 0.58 + o, pz, 0, 0, Math.PI / 2); });
  });
  var topShape = new THREE.Shape();                                    // the quartz top, with an oval hole for the basin and a rounded front edge
  topShape.moveTo(-0.31, -0.62); topShape.lineTo(0.31, -0.62); topShape.lineTo(0.31, 0.62); topShape.lineTo(-0.31, 0.62); topShape.lineTo(-0.31, -0.62);
  var topHole = new THREE.Path(); topHole.absellipse(-0.04, 0, 0.155, 0.235, 0, Math.PI * 2, true); topShape.holes.push(topHole);
  ciPart(new THREE.ExtrudeGeometry(topShape, { depth: 0.035, bevelEnabled: false, curveSegments: 24 }), ciQuartz, SK_X - 0.01, 0.8675, SK_Z, -Math.PI / 2, 0, 0);
  ciPart(new THREE.CylinderGeometry(0.0175, 0.0175, 1.24, 10), ciQuartz, SK_X - 0.32, 0.885, SK_Z, Math.PI / 2, 0, 0);
  ciPart(new THREE.BoxGeometry(0.02, 0.12, 1.24), ciQuartz, CIN_W / 2 - 0.01, 0.96, SK_Z);                              // the upstand against the wall
  var bowlPts = [];                                                    // a deep oval basin set into the top, with a rolled rim
  for (var bp2 = 0; bp2 <= 12; bp2++) { var bt = bp2 / 12; bowlPts.push(new THREE.Vector2(0.015 + Math.sin(bt * Math.PI / 2) * 0.17, -0.13 + (1 - Math.cos(bt * Math.PI / 2)) * 0.13)); }
  bowlPts.push(new THREE.Vector2(0.195, 0.004), new THREE.Vector2(0.2, 0.012));
  ciPart(new THREE.LatheGeometry(bowlPts, 32), ciCeramic, SK_X - 0.05, 0.9, SK_Z).scale.set(0.82, 1, 1.25);
  ciPart(new THREE.CylinderGeometry(0.025, 0.025, 0.004, 16), CI_CHROME, SK_X - 0.05, 0.773, SK_Z);                       // the drain
  ciPart(new THREE.CylinderGeometry(0.016, 0.016, 0.005, 12), CI.black, SK_X - 0.05, 0.775, SK_Z);
  var tapX = SK_X + 0.2;                                               // the gooseneck tap and its wrist-blade levers
  ciPart(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 16), CI_CHROME, tapX, 0.93, SK_Z);
  var tapCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(tapX, 0.95, SK_Z), new THREE.Vector3(tapX, 1.15, SK_Z), new THREE.Vector3(tapX - 0.06, 1.24, SK_Z), new THREE.Vector3(tapX - 0.16, 1.2, SK_Z), new THREE.Vector3(tapX - 0.2, 1.1, SK_Z)]);
  ciPart(new THREE.TubeGeometry(tapCurve, 30, 0.014, 10), CI_CHROME, 0, 0, 0);
  ciPart(new THREE.CylinderGeometry(0.017, 0.016, 0.03, 12), CI_CHROME, tapX - 0.2, 1.085, SK_Z);
  [-1, 1].forEach(function (s) {
    ciPart(new THREE.CylinderGeometry(0.022, 0.025, 0.05, 12), CI_CHROME, tapX, 0.93, SK_Z + s * 0.13);
    ciPart(new THREE.BoxGeometry(0.018, 0.012, 0.14), CI_CHROME, tapX - 0.04, 0.965, SK_Z + s * 0.18, 0, s * 0.35, 0.15);
  });
  var soapX = SK_X + 0.15, soapZ = SK_Z + 0.46;                       // a pump bottle of pink hand soap
  ciPart(new THREE.CylinderGeometry(0.038, 0.04, 0.13, 16), new THREE.MeshStandardMaterial({ color: 0xf2a6bc, roughness: 0.1, transparent: true, opacity: 0.85 }), soapX, 0.97, soapZ);
  ciPart(new THREE.CylinderGeometry(0.03, 0.032, 0.11, 16), new THREE.MeshStandardMaterial({ color: 0xe0607a, roughness: 0.4 }), soapX, 0.965, soapZ);
  ciPart(new THREE.CylinderGeometry(0.02, 0.025, 0.025, 12), CI.white, soapX, 1.045, soapZ);
  ciPart(new THREE.CylinderGeometry(0.006, 0.006, 0.04, 6), CI.white, soapX, 1.075, soapZ);
  ciPart(new THREE.BoxGeometry(0.06, 0.016, 0.022), CI.white, soapX - 0.02, 1.095, soapZ);
  ciPart(new THREE.BoxGeometry(0.045, 0.03, 0.002), CI.white, soapX - 0.04, 0.97, soapZ, 0, Math.PI / 2, 0);
  // a paper towel dispenser on the wall, with a towel hanging out, and a hand sanitiser beside it (along the right wall, x is the room's z)
  ciWallPart('E', ciRoundBox(0.32, 0.36, 0.12, 0.03), CI.white, SK_Z + 0.68, 1.5, 0.06);
  ciWallPart('E', new THREE.PlaneGeometry(0.2, 0.12), new THREE.MeshStandardMaterial({ color: 0x8aa4b4, roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.6 }), SK_Z + 0.68, 1.56, 0.121);
  ciWallPart('E', new THREE.BoxGeometry(0.2, 0.004, 0.04), CI.black, SK_Z + 0.68, 1.33, 0.1);
  var towel = new THREE.PlaneGeometry(0.18, 0.12, 1, 6), tp2 = towel.attributes.position;
  for (var tv = 0; tv < tp2.count; tv++) tp2.setZ(tv, Math.pow((0.06 - tp2.getY(tv)) / 0.12, 2) * 0.03);
  towel.computeVertexNormals();
  ciWallPart('E', towel, new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 1, side: THREE.DoubleSide }), SK_Z + 0.68, 1.27, 0.105);
  ciWallPart('E', ciRoundBox(0.11, 0.2, 0.08, 0.02), CI.white, SK_Z - 0.75, 1.35, 0.04);
  ciWallPart('E', new THREE.BoxGeometry(0.07, 0.07, 0.01), new THREE.MeshStandardMaterial({ color: 0x7ab8e0, roughness: 0.3 }), SK_Z - 0.75, 1.38, 0.082);
  ciWallPart('E', new THREE.BoxGeometry(0.05, 0.04, 0.03), CI_KICK, SK_Z - 0.75, 1.24, 0.07);
  // a pedal bin beside the sink
  var BIN2_X = CIN_W / 2 - 0.25, BIN2_Z = SK_Z + 0.85;
  ciPart(new THREE.CylinderGeometry(0.13, 0.12, 0.4, 24), CI_CHROME, BIN2_X, 0.2, BIN2_Z);
  ciPart(new THREE.CylinderGeometry(0.135, 0.135, 0.03, 24), CI_CHROME, BIN2_X, 0.415, BIN2_Z);
  ciPart(new THREE.SphereGeometry(0.135, 24, 6, 0, Math.PI * 2, 0, 0.5), CI_CHROME, BIN2_X, 0.37, BIN2_Z);
  ciPart(new THREE.CylinderGeometry(0.125, 0.125, 0.02, 24), CI_KICK, BIN2_X, 0.01, BIN2_Z);
  ciPart(new THREE.BoxGeometry(0.1, 0.015, 0.06), CI.black, BIN2_X - 0.15, 0.03, BIN2_Z, 0, 0, 0.15);
  ciSolids.push([SK_X, SK_Z - 0.35, 0.4], [SK_X, SK_Z + 0.35, 0.4], [BIN2_X, BIN2_Z, 0.18]);

  // the patient monitor on its swing arm: a vital signs screen with heart trace, oxygen and breathing waves, blood
  // pressure and temperature, in a white case with a handle, buttons, a dial and a glowing status light
  var ciVitalsTex = paintTexture(512, 360, function (g, w, h) {
    g.fillStyle = '#071514'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,140,130,0.18)'; g.lineWidth = 1;
    for (var gx = 0; gx < 340; gx += 17) { g.beginPath(); g.moveTo(gx, 34); g.lineTo(gx, h - 8); g.stroke(); }
    for (var gy = 34; gy < h; gy += 17) { g.beginPath(); g.moveTo(0, gy); g.lineTo(340, gy); g.stroke(); }
    g.fillStyle = '#123a36'; g.fillRect(0, 0, w, 28);
    g.fillStyle = '#bff5e8'; g.font = 'bold 15px sans-serif'; g.fillText('EVERDAWN CLINIC   ♥  Bed 1', 10, 19);
    g.fillStyle = '#ffd27a'; g.fillText('11:00', w - 58, 19);
    function trace(y0, col, fn, label) {                               // a waveform across the screen, with its label
      g.strokeStyle = col; g.lineWidth = 2.5; g.beginPath();
      for (var x = 4; x < 336; x++) { var y = y0 + fn(x); if (x === 4) g.moveTo(x, y); else g.lineTo(x, y); }
      g.stroke();
      g.fillStyle = col; g.font = 'bold 13px sans-serif'; g.fillText(label, 8, y0 - 34);
    }
    trace(110, '#6dffb0', function (x) { var p = (x % 80) / 80; return p > 0.4 && p < 0.44 ? -60 * Math.sin((p - 0.4) / 0.04 * Math.PI) : p > 0.44 && p < 0.48 ? 18 * Math.sin((p - 0.44) / 0.04 * Math.PI) : p > 0.6 && p < 0.75 ? -10 * Math.sin((p - 0.6) / 0.15 * Math.PI) : p > 0.25 && p < 0.33 ? -6 * Math.sin((p - 0.25) / 0.08 * Math.PI) : 0; }, 'II   ECG');
    trace(200, '#5fd8ff', function (x) { var p = (x % 80) / 80; return -28 * Math.pow(Math.sin(p * Math.PI), 3) + (p > 0.55 ? -6 * Math.sin((p - 0.55) / 0.45 * Math.PI * 2) : 0); }, 'SpO₂   PLETH');
    trace(290, '#ffe27a', function (x) { return -18 * Math.sin(x / 336 * Math.PI * 4.2); }, 'RESP');
    g.strokeStyle = 'rgba(160,220,210,0.4)'; g.beginPath(); g.moveTo(345, 32); g.lineTo(345, h - 6); g.stroke();
    function vital(y, col, name, val, unit, big) {                     // the big numbers down the right
      g.fillStyle = col; g.font = 'bold 13px sans-serif'; g.fillText(name, 354, y);
      g.font = 'bold ' + (big || 46) + 'px sans-serif'; g.fillText(val, 360, y + (big ? big - 4 : 44));
      g.font = '12px sans-serif'; g.fillText(unit, w - 44, y);
    }
    vital(52, '#6dffb0', 'HR', '72', 'bpm');
    vital(130, '#5fd8ff', 'SpO₂', '98', '%');
    vital(208, '#ff9ab8', 'NIBP', '118/76', 'mmHg', 32);
    vital(270, '#ffe27a', 'RR', '16', '/min', 30);
    g.fillStyle = '#c8b4ff'; g.font = 'bold 13px sans-serif'; g.fillText('TEMP  36.8°C', 354, h - 16);
  });
  var MON_Z = SK_Z - 0.05, MON_Y = 1.66;                              // along the right wall (x on the wall is the room's z)
  ciWallPart('E', ciRoundBox(0.14, 0.2, 0.03, 0.01), CI.white, MON_Z, MON_Y, 0.015);                                    // the wall plate
  ciWallPart('E', new THREE.CylinderGeometry(0.022, 0.022, 0.16, 10), CI_CHROME, MON_Z, MON_Y, 0.1, Math.PI / 2, 0, 0); // the swing arm
  ciWallPart('E', new THREE.CylinderGeometry(0.03, 0.03, 0.06, 12), CI.white, MON_Z, MON_Y, 0.19);
  var mon = new THREE.Group(); mon.position.set(MON_Z, MON_Y, 0.24); mon.rotation.y = -0.18; mon.rotation.x = -0.08; ciWalls.E.g.add(mon);
  ciPart(ciRoundBox(0.56, 0.42, 0.07, 0.03), CI.white, 0, 0, 0, 0, 0, 0, mon);                                         // the case
  ciPart(ciRoundBox(0.46, 0.33, 0.01, 0.01), new THREE.MeshStandardMaterial({ color: 0x1a1f22, roughness: 0.3 }), -0.035, 0.01, 0.033, 0, 0, 0, mon);   // the bezel
  ciPart(new THREE.PlaneGeometry(0.44, 0.31), new THREE.MeshStandardMaterial({ map: ciVitalsTex, emissive: 0xffffff, emissiveMap: ciVitalsTex, emissiveIntensity: 0.95, roughness: 0.15 }), -0.035, 0.01, 0.039, 0, 0, 0, mon).castShadow = false;
  ciPart(new THREE.PlaneGeometry(0.44, 0.31), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, opacity: 0.35, roughness: 0.05, depthWrite: false }), -0.035, 0.01, 0.041, 0, 0, 0, mon).castShadow = false;   // a sheen on the screen
  for (var mb = 0; mb < 4; mb++) ciPart(new THREE.BoxGeometry(0.035, 0.02, 0.012), mb === 0 ? new THREE.MeshStandardMaterial({ color: 0xe0607a, roughness: 0.4 }) : new THREE.MeshStandardMaterial({ color: 0xcfd6d8, roughness: 0.4 }), 0.235, 0.11 - mb * 0.045, 0.037, 0, 0, 0, mon);
  ciPart(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 18), CI_KICK, 0.235, -0.13, 0.04, Math.PI / 2, 0, 0, mon);      // the dial
  ciPart(new THREE.BoxGeometry(0.004, 0.02, 0.004), CI.white, 0.235, -0.12, 0.051, 0, 0, 0, mon);
  var ciMonLed = ciPart(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshStandardMaterial({ color: 0x6dffb0, emissive: 0x6dffb0, emissiveIntensity: 1 }), 0.235, 0.17, 0.037, 0, 0, 0, mon);
  ciPart(new THREE.TorusGeometry(0.1, 0.012, 8, 20, Math.PI), CI.white, 0, 0.21, -0.005, 0, 0, 0, mon).scale.set(1.4, 0.5, 1);   // a carry handle on top
  var cable = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.2, -0.2, -0.02), new THREE.Vector3(-0.22, -0.4, 0.0), new THREE.Vector3(-0.12, -0.55, 0.02), new THREE.Vector3(-0.3, -0.62, 0.0)]);
  ciPart(new THREE.TubeGeometry(cable, 16, 0.006, 6), CI.black, 0, 0, 0, 0, 0, 0, mon);                                // its lead, looped below
  // the poster over the monitor: how to wash your hands, in four little pictures
  ciFramed('E', SK_Z - 0.05, 2.38, 0.56, 0.42, ciWashTex, CI.teal);
  // an apothecary cabinet between the back windows: a cupboard below with shaker doors and a drawer, an oak worktop,
  // and above it a glass-fronted cabinet with a crown, its shelves lined with glowing bottles of tonic (each with a
  // neck, a cork and a little label), round flasks and lidded jars
  var MC_Z = CNW, MCF = MC_Z + 0.5;
  ciPart(new THREE.BoxGeometry(1.24, 0.08, 0.44), CI_KICK, 0, 0.04, MC_Z + 0.24);
  ciPart(ciRoundBox(1.3, 0.8, 0.5, 0.012), CI.white, 0, 0.48, MC_Z + 0.25);
  ciPart(ciRoundBox(1.2, 0.14, 0.02, 0.006), CI.mint, 0, 0.78, MCF + 0.01);                                              // the drawer
  ciPart(new THREE.CylinderGeometry(0.006, 0.006, 0.18, 8), CI_CHROME, 0, 0.78, MCF + 0.04, 0, 0, Math.PI / 2);
  [-0.04, 0.04].forEach(function (o) { ciPart(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 6), CI_CHROME, o * 2, 0.78, MCF + 0.028, Math.PI / 2, 0, 0); });
  [-0.31, 0.31].forEach(function (dx) {                                // two shaker doors with chrome bar pulls
    [[0, 0.25, 0.58, 0.06], [0, -0.25, 0.58, 0.06], [-0.26, 0, 0.06, 0.56], [0.26, 0, 0.06, 0.56]].forEach(function (f) { ciPart(new THREE.BoxGeometry(f[2], f[3], 0.022), CI.mint, dx + f[0], 0.41 + f[1], MCF + 0.011); });
    ciPart(new THREE.BoxGeometry(0.48, 0.46, 0.01), new THREE.MeshStandardMaterial({ color: 0xa9d2bf, roughness: 0.5 }), dx, 0.41, MCF + 0.005);
    ciPart(new THREE.CylinderGeometry(0.006, 0.006, 0.14, 8), CI_CHROME, dx * 0.3, 0.52, MCF + 0.04);
  });
  ciPart(ciRoundBox(1.36, 0.04, 0.54, 0.01), CI_OAK, 0, 0.9, MC_Z + 0.27);
  // the upper cabinet: hollow, so you can see the bottles through its glass doors
  var UC_Y = 1.95, UC_D = 0.32;
  ciPart(new THREE.BoxGeometry(1.2, 1.3, 0.02), new THREE.MeshStandardMaterial({ color: 0xe8f0ec, roughness: 0.8 }), 0, UC_Y, MC_Z + 0.02);   // the back
  [-1, 1].forEach(function (s) { ciPart(new THREE.BoxGeometry(0.03, 1.3, UC_D), CI.white, s * 0.585, UC_Y, MC_Z + UC_D / 2); });
  ciPart(new THREE.BoxGeometry(1.2, 0.03, UC_D), CI.white, 0, UC_Y - 0.635, MC_Z + UC_D / 2);
  ciPart(new THREE.BoxGeometry(1.2, 0.03, UC_D), CI.white, 0, UC_Y + 0.635, MC_Z + UC_D / 2);
  ciPart(ciRoundBox(1.32, 0.05, UC_D + 0.08, 0.012), CI.white, 0, UC_Y + 0.67, MC_Z + UC_D / 2 + 0.03);                  // the crown
  ciPart(ciRoundBox(1.28, 0.03, UC_D + 0.05, 0.008), CI.white, 0, UC_Y + 0.705, MC_Z + UC_D / 2 + 0.015);
  var ciTonics = [], corkMat = new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.9 }), labelMat = new THREE.MeshStandardMaterial({ color: 0xfbf8ef, roughness: 0.8 });
  var jarGlass = new THREE.MeshStandardMaterial({ color: 0xeef7ff, roughness: 0.04, transparent: true, opacity: 0.35, depthWrite: false });
  [1.42, 1.85, 2.28].forEach(function (shy, k) {
    ciPart(new THREE.BoxGeometry(1.14, 0.02, UC_D - 0.02), CI.white, 0, shy - 0.01, MC_Z + UC_D / 2);
    ciPart(new THREE.BoxGeometry(1.14, 0.012, 0.004), CI.brass, 0, shy - 0.012, MC_Z + UC_D - 0.01);
    for (var b = 0; b < 6; b++) {
      var bx = -0.45 + b * 0.18 + (isle2Hash(b + k * 7) - 0.5) * 0.04, bz = MC_Z + 0.15, col = [0xc89aff, 0x7ad0b0, 0xff9ab8, 0x8ac8ff, 0xffd27a][(b + k) % 5], kind = (b + k * 2) % 3;
      var tm = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.5, roughness: 0.12 });
      ciTonics.push(tm);
      if (kind === 0) {                                                // a tall bottle: shoulders, a neck, a lip, a cork and a label
        var bh = 0.16 + isle2Hash(b * 3 + k) * 0.08, pts = [[0.001, 0], [0.04, 0], [0.042, 0.01], [0.042, bh * 0.7], [0.03, bh * 0.82], [0.014, bh * 0.88], [0.014, bh], [0.017, bh + 0.005], [0.014, bh + 0.01]];
        ciPart(new THREE.LatheGeometry(pts.map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 18), tm, bx, shy, bz);
        ciPart(new THREE.CylinderGeometry(0.013, 0.011, 0.03, 10), corkMat, bx, shy + bh + 0.02, bz);
        ciPart(new THREE.CylinderGeometry(0.0425, 0.0425, bh * 0.3, 18, 1, true, -0.7, 1.4), labelMat, bx, shy + bh * 0.38, bz);
      } else if (kind === 1) {                                         // a round-bottomed flask
        ciPart(new THREE.SphereGeometry(0.05, 18, 14), tm, bx, shy + 0.05, bz);
        ciPart(new THREE.CylinderGeometry(0.013, 0.016, 0.07, 12), tm, bx, shy + 0.12, bz);
        ciPart(new THREE.CylinderGeometry(0.015, 0.012, 0.025, 10), corkMat, bx, shy + 0.165, bz);
        ciPart(new THREE.TorusGeometry(0.016, 0.003, 6, 14), CI.brass, bx, shy + 0.146, bz, Math.PI / 2, 0, 0);
      } else {                                                         // a lidded glass jar of dried petals or seeds
        ciPart(new THREE.CylinderGeometry(0.038, 0.038, 0.06, 16), tm, bx, shy + 0.03, bz);
        ciPart(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 18), jarGlass, bx, shy + 0.06, bz).renderOrder = 2;
        ciPart(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 18), CI.white, bx, shy + 0.13, bz);
        ciPart(new THREE.SphereGeometry(0.014, 10, 8), CI.brass, bx, shy + 0.145, bz);
      }
    }
  });
  [-0.3, 0.3].forEach(function (dx) {                                  // the glass doors in white frames, with brass knobs
    ciPart(new THREE.PlaneGeometry(0.54, 1.18), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.2, depthWrite: false }), dx, UC_Y, MC_Z + UC_D + 0.01).renderOrder = 3;
    [[0, 0.6, 0.58, 0.05], [0, -0.6, 0.58, 0.05], [-0.28, 0, 0.05, 1.2], [0.28, 0, 0.05, 1.2], [0, 0.2, 0.54, 0.02], [0, -0.2, 0.54, 0.02]].forEach(function (f) { ciPart(new THREE.BoxGeometry(f[2], f[3], 0.03), CI.white, dx + f[0], UC_Y + f[1], MC_Z + UC_D + 0.01); });
    ciPart(new THREE.SphereGeometry(0.018, 10, 8), CI.brass, dx * 0.15, UC_Y, MC_Z + UC_D + 0.035);
  });
  var mcGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xc8a0ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  mcGlow.position.set(0, 1.9, MC_Z + 0.3); mcGlow.scale.set(1.6, 1.6, 1); clinicRoom.add(mcGlow);
  ciSolids.push([-0.35, MC_Z + 0.3, 0.4], [0.35, MC_Z + 0.3, 0.4]);
  // a doctor's beam scale with a height rod: a platform with a ribbed rubber mat on levelling feet, a white enamel
  // column, a twin beam with engraved marks and sliding weights, a balance pointer, and a chrome measuring rod with
  // a flip-out head piece. You'd stand on it facing into the room
  var SC_X = CIN_W / 2 - 0.45, SC_Z = CIN_D / 2 - 0.5, COL_X = SC_X + 0.2;
  var ciBeamTex = paintTexture(512, 64, function (g, w, h) {            // the engraved beam: marks every step, numbers every ten
    g.fillStyle = '#e8ecee'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2a30'; g.textAlign = 'center'; g.font = 'bold 13px sans-serif';
    for (var t = 0; t <= 100; t++) {
      var x = 12 + t * 4.88, tall = t % 10 === 0 ? 26 : t % 5 === 0 ? 18 : 11;
      g.fillRect(x - 0.8, h - tall - 4, 1.6, tall);
      if (t % 10 === 0) g.fillText(String(t), x, 18);
    }
  });
  var ciRodTex = paintTexture(64, 512, function (g, w, h) {             // the height rod's scale, in centimetres
    g.fillStyle = '#e4e8ea'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2a30'; g.font = 'bold 12px sans-serif'; g.textAlign = 'left';
    for (var c = 0; c <= 100; c++) {
      var y = h - 6 - c * 5, l = c % 10 === 0 ? 30 : c % 5 === 0 ? 20 : 12;
      g.fillRect(0, y - 0.7, l, 1.4);
      if (c % 10 === 0) g.fillText(String(100 + c), 33, y + 4);
    }
  });
  var CI_ENAMEL = new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.25 });
  var CI_RUBBER = new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.95 });
  // the platform
  ciPart(ciRoundBox(0.46, 0.08, 0.52, 0.02), CI_ENAMEL, SC_X, 0.06, SC_Z);
  ciPart(ciRoundBox(0.4, 0.012, 0.44, 0.006), CI_RUBBER, SC_X - 0.01, 0.105, SC_Z);
  for (var rb = 0; rb < 9; rb++) ciPart(new THREE.BoxGeometry(0.36, 0.006, 0.012), new THREE.MeshStandardMaterial({ color: 0x3c4046, roughness: 0.9 }), SC_X - 0.01, 0.113, SC_Z - 0.18 + rb * 0.045);   // the ribs
  ciPart(new THREE.BoxGeometry(0.48, 0.012, 0.54), CI_CHROME, SC_X, 0.025, SC_Z);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) { ciPart(new THREE.CylinderGeometry(0.018, 0.022, 0.02, 12), CI_RUBBER, SC_X + c[0] * 0.2, 0.01, SC_Z + c[1] * 0.23); });   // levelling feet
  // the column, with a little brass maker's plate
  ciPart(ciRoundBox(0.07, 1.22, 0.07, 0.012), CI_ENAMEL, COL_X, 0.1 + 0.61, SC_Z);
  ciPart(ciRoundBox(0.12, 0.08, 0.12, 0.02), CI_ENAMEL, COL_X, 0.12, SC_Z);
  ciPart(new THREE.BoxGeometry(0.004, 0.08, 0.045), CI.brass, COL_X - 0.037, 0.55, SC_Z);
  // the beam head: a housing with two engraved beams and their sliding weights, ending in a pointer loop
  var BH_Y = 1.3, BZ0 = SC_Z + 0.06;                                   // (the beams reach toward the front wall, clear of the eye chart)
  ciPart(ciRoundBox(0.1, 0.16, 0.12, 0.02), CI_ENAMEL, COL_X, BH_Y, SC_Z);
  var beamMat = new THREE.MeshStandardMaterial({ map: ciBeamTex, roughness: 0.3, metalness: 0.3 });
  [[BH_Y + 0.035, 0.18], [BH_Y - 0.03, 0.62]].forEach(function (bm, k) {
    var by = bm[0], len = 0.38;
    ciPart(new THREE.BoxGeometry(0.012, 0.035, len), CI_CHROME, COL_X - 0.06, by, BZ0 + len / 2 - 0.06);
    ciPart(new THREE.PlaneGeometry(len - 0.02, 0.03), beamMat, COL_X - 0.0665, by, BZ0 + len / 2 - 0.06, 0, -Math.PI / 2, 0);
    var pz = BZ0 - 0.06 + len * bm[1];                                // the sliding weight sitting on its notch
    ciPart(ciRoundBox(0.03, 0.05, 0.03, 0.006), k ? CI.black : CI_CHROME, COL_X - 0.06, by + 0.008, pz);
    ciPart(new THREE.BoxGeometry(0.003, 0.012, 0.002), new THREE.MeshStandardMaterial({ color: 0xe0607a }), COL_X - 0.0765, by + 0.008, pz);
  });
  ciPart(new THREE.TorusGeometry(0.035, 0.006, 6, 18), CI_CHROME, COL_X - 0.06, BH_Y, BZ0 + 0.35, 0, Math.PI / 2, 0);   // the trig loop the beam settles in
  ciPart(new THREE.BoxGeometry(0.006, 0.05, 0.006), new THREE.MeshStandardMaterial({ color: 0xe0607a }), COL_X - 0.06, BH_Y, BZ0 + 0.35);     // and its pointer, balanced
  // the height rod rising out of the column, marked in centimetres, with a hinged head piece folded out over the platform
  var ROD_TOP = 2.02;
  ciPart(new THREE.BoxGeometry(0.03, ROD_TOP - BH_Y, 0.022), CI_CHROME, COL_X, (ROD_TOP + BH_Y) / 2 + 0.04, SC_Z);
  ciPart(new THREE.PlaneGeometry(0.02, ROD_TOP - BH_Y - 0.1), new THREE.MeshStandardMaterial({ map: ciRodTex, roughness: 0.35 }), COL_X - 0.0155, (ROD_TOP + BH_Y) / 2 + 0.04, SC_Z, 0, -Math.PI / 2, 0);
  ciPart(new THREE.CylinderGeometry(0.014, 0.014, 0.04, 10), CI_KICK, COL_X - 0.03, BH_Y + 0.14, SC_Z, 0, 0, Math.PI / 2);   // the rod's lock knob
  ciPart(ciRoundBox(0.05, 0.06, 0.04, 0.01), CI_CHROME, COL_X, ROD_TOP + 0.03, SC_Z);                                  // the hinge block
  ciPart(new THREE.SphereGeometry(0.012, 10, 8), CI_KICK, COL_X - 0.03, ROD_TOP + 0.04, SC_Z + 0.025);
  ciPart(ciRoundBox(0.3, 0.012, 0.03, 0.005), CI_CHROME, COL_X - 0.17, ROD_TOP + 0.04, SC_Z);                           // the head piece
  ciPart(ciRoundBox(0.05, 0.02, 0.05, 0.008), CI_RUBBER, COL_X - 0.3, ROD_TOP + 0.03, SC_Z);
  ciSolids.push([SC_X, SC_Z, 0.3]);

  // a ceiling track with privacy curtains round the exam corner: a rounded aluminium rail on little hangers, with
  // curtains pulled back to either end. Each curtain has a white mesh band at the top (so the light gets through), soft
  // pale blue folds with a little leaf print, a hem, and runners clipped onto the rail, and they sway very gently
  var CT_X = 0.9, CT_Z = -0.9, CT_Y = CIN_H - 0.09, CT_R = 0.3;
  var ciRail = new THREE.MeshStandardMaterial({ color: 0xdfe3e6, roughness: 0.35, metalness: 0.35 });
  var railPts = [];
  for (var rz = CNW + 0.02; rz < CT_Z - CT_R; rz += 0.25) railPts.push(new THREE.Vector3(CT_X, CT_Y, rz));
  for (var ra = 0; ra <= 8; ra++) { var rang = Math.PI - ra / 8 * Math.PI / 2; railPts.push(new THREE.Vector3(CT_X + CT_R + Math.cos(rang) * CT_R, CT_Y, CT_Z - CT_R + Math.sin(rang) * CT_R)); }
  for (var rx = CT_X + CT_R + 0.25; rx <= CIN_W / 2 - 0.02; rx += 0.25) railPts.push(new THREE.Vector3(rx, CT_Y, CT_Z));
  railPts.push(new THREE.Vector3(CIN_W / 2 - 0.02, CT_Y, CT_Z));
  ciPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPts, false, 'catmullrom', 0.1), 120, 0.016, 8), ciRail, 0, 0, 0);
  ciPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(railPts, false, 'catmullrom', 0.1), 120, 0.006, 6), CI_KICK, 0, -0.016, 0);   // the slot the runners ride in
  [[CT_X, CNW + 0.8], [CT_X, CT_Z - 0.9], [CT_X + 1.4, CT_Z], [CT_X + 2.7, CT_Z]].forEach(function (hg) {   // hangers down from the ceiling
    ciPart(new THREE.CylinderGeometry(0.008, 0.008, CIN_H - CT_Y, 6), ciRail, hg[0], (CIN_H + CT_Y) / 2, hg[1]);
    ciPart(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 14), ciRail, hg[0], CIN_H - 0.006, hg[1]);
  });
  [[CT_X, CNW + 0.02, 0], [CIN_W / 2 - 0.02, CT_Z, Math.PI / 2]].forEach(function (ec) {   // end stops where the rail meets the walls
    ciPart(new THREE.BoxGeometry(0.06, 0.05, 0.03), ciRail, ec[0], CT_Y, ec[1], 0, ec[2], 0);
  });
  var ciCurtTex = paintTexture(128, 512, function (g, w, h) {         // one curtain, top to bottom: mesh band, header tape, printed fabric, hem
    var MESH = h * 0.17;
    g.clearRect(0, 0, w, h);
    g.strokeStyle = '#ffffff'; g.lineWidth = 2.6;
    for (var x = -MESH; x < w + MESH; x += 9) { g.beginPath(); g.moveTo(x, 10); g.lineTo(x + MESH, MESH + 10); g.moveTo(x + MESH, 10); g.lineTo(x, MESH + 10); g.stroke(); }
    g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, w, 12); g.fillRect(0, MESH + 8, w, 10);             // the header tape and the seam under the mesh
    for (var e = 4; e < w; e += 16) { g.fillStyle = '#c0c6ca'; g.beginPath(); g.arc(e + 4, 6, 2.5, 0, Math.PI * 2); g.fill(); }   // eyelets
    var body = g.createLinearGradient(0, MESH + 18, 0, h); body.addColorStop(0, '#b4d2e4'); body.addColorStop(1, '#9cc0d6');
    g.fillStyle = body; g.fillRect(0, MESH + 18, w, h - MESH - 18);
    for (var y = MESH + 30; y < h - 24; y += 26) for (var lx = (y % 52 ? 6 : 19); lx < w; lx += 26) {   // a little leaf print
      g.save(); g.translate(lx, y); g.rotate(((lx + y) % 3 - 1) * 0.6);
      g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(0, 0, 5, 2.4, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 1; g.beginPath(); g.moveTo(-6, 0); g.lineTo(5, 0); g.stroke();
      g.restore();
    }
    for (var t = 0; t < 900; t++) { g.fillStyle = 'rgba(40,70,90,' + isle2Hash(t) * 0.08 + ')'; g.fillRect(isle2Hash(t * 2.1) * w, MESH + 18 + isle2Hash(t * 3.3) * (h - MESH - 18), 2, 1); }   // the weave
    g.fillStyle = '#8fb4ca'; g.fillRect(0, h - 22, w, 22); g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, h - 22, w, 2);   // the hem
  });
  ciCurtTex.wrapS = THREE.RepeatWrapping; ciCurtTex.repeat.set(3, 1);
  var ciCurtMat = new THREE.MeshStandardMaterial({ map: ciCurtTex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.95 });
  var ciCurtains = [];
  function ciCurtain(x, z, ry, w, folds) {                              // a gathered curtain hanging from its runners, its folds flaring a little toward the hem
    var H = CT_Y - 0.06 - 0.06, geo = new THREE.PlaneGeometry(w, H, folds * 6, 16), p = geo.attributes.position;
    for (var v = 0; v < p.count; v++) {
      var fx = p.getX(v) / w + 0.5, fy = (H / 2 - p.getY(v)) / H;
      p.setZ(v, Math.sin(fx * Math.PI * folds) * (0.05 + fy * 0.03) * (0.8 + 0.2 * Math.sin(fx * 13.7)) + Math.sin(fx * Math.PI * 1.6 + 1) * 0.03 * fy);   // soft, uneven folds
      p.setX(v, p.getX(v) * (1 + fy * 0.06));
    }
    geo.translate(0, -H / 2, 0);                                        // hang it from its top edge, so it sways from the rail
    geo.computeVertexNormals();
    var g = new THREE.Group(); g.position.set(x, CT_Y - 0.06, z); g.rotation.y = ry; clinicRoom.add(g);
    ciPart(geo, ciCurtMat, 0, 0, 0, 0, 0, 0, g).castShadow = false;
    for (var r = 0; r <= folds; r++) {                                  // a runner and a hook at the top of every fold
      var rx2 = (r / folds - 0.5) * w;
      ciPart(new THREE.CylinderGeometry(0.012, 0.012, 0.025, 8), CI.white, rx2, 0.045, 0, Math.PI / 2, 0, 0, g);
      ciPart(new THREE.TorusGeometry(0.012, 0.003, 4, 10), ciRail, rx2, 0.02, 0, 0, Math.PI / 2, 0, g);
    }
    ciCurtains.push(g);
  }
  ciCurtain(CT_X, CNW + 0.5, Math.PI / 2, 0.8, 7);
  ciCurtain(CIN_W / 2 - 0.5, CT_Z, 0, 0.8, 7);
  ciSolids.push([CT_X, CNW + 0.5, 0.22], [CIN_W / 2 - 0.5, CT_Z, 0.25]);

  for (var ciWn in ciWalls) ciWalls[ciWn].g.traverse(function (o) { o.castShadow = false; });   // the walls and what's on them don't block the daylight
  var ciLook = new THREE.Vector3();
  function updateClinicInterior(t) {
    if (!inClinic) return;
    for (var wn in ciWalls) {                                           // hide any wall the camera is behind, so it never blocks the view
      var W = ciWalls[wn];
      ciLook.set(camera.position.x - CIN_X - W.c.x, 0, camera.position.z - CIN_Z - W.c.z);
      W.g.visible = ciLook.dot(W.n) > 0;
    }
    var hr = state.minutes / 60, nt = hr < 5.5 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr < 18.5 ? 0 : hr < 20 ? (hr - 18.5) / 1.5 : 1;
    ciSun.intensity = 0.5 * (1 - nt);                                   // daylight only comes in through the windows by day
    for (var i = 0; i < ciTonics.length; i++) ciTonics[i].emissiveIntensity = 0.45 + Math.sin(t * 1.8 + i) * 0.15;
    mcGlow.material.opacity = 0.3 + Math.sin(t * 1.3) * 0.06;
    for (var wb = 0; wb < wcBubbles.length; wb++) {                     // a bubble glugs up through the water cooler's jug now and then
      var B = wcBubbles[wb], bt = (t * 0.35 + B.p) % 1.6;
      B.m.visible = bt < 1;
      B.m.position.set(WC_X + B.x * (0.4 + bt * 0.6), JUG_Y + 0.06 + bt * 0.33, WC_Z + B.z * (0.4 + bt * 0.6));
    }
    for (var cc = 0; cc < ciCurtains.length; cc++) ciCurtains[cc].rotation.x = Math.sin(t * 0.7 + cc * 2) * 0.012;   // the curtains sway very gently
    ciMonLed.material.emissiveIntensity = (t % 0.83) < 0.12 ? 1.6 : 0.4;   // the monitor's light blinks with each heartbeat
    var mins = state.minutes % 720;                                     // the clock on the wall keeps the island's time
    ciHourHand.rotation.z = -mins / 720 * Math.PI * 2;
    ciMinHand.rotation.z = -(state.minutes % 60) / 60 * Math.PI * 2;
    ciSecHand.rotation.z = -Math.floor(t % 60) / 60 * Math.PI * 2;      // the second hand ticks once a second
  }
  function inClinicRoom(x, z) { return Math.abs(x - CIN_X) < CIN_W / 2 - 0.35 && Math.abs(z - CIN_Z) < CIN_D / 2 - 0.35; }
  // the windows look out on the real island, just like the shop's
  function drawClinicView() {
    renderer.getDrawingBufferSize(shopViewSize);
    if (shopViewTarget.width !== shopViewSize.x || shopViewTarget.height !== shopViewSize.y) shopViewTarget.setSize(shopViewSize.x, shopViewSize.y);
    siWindowMask.uniforms.uSize.value.copy(shopViewSize);
    shopViewMap.makeTranslation(CLINIC_X, 0, CLINIC_Z).multiply(shopViewTmp.makeRotationY(CLINIC_TURN)).multiply(shopViewTmp.makeTranslation(-CIN_X, 0, -CIN_Z));
    shopViewCam.projectionMatrix.copy(camera.projectionMatrix); shopViewCam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    shopViewCam.matrix.multiplyMatrices(shopViewMap, camera.matrixWorld);
    shopViewCam.updateMatrixWorld(true);
    clinicGroup.visible = false;                                      // you're inside it, so don't draw its own outside walls in the way
    renderer.setRenderTarget(shopViewTarget);
    renderer.render(scene, shopViewCam);
    renderer.setRenderTarget(null);
    clinicGroup.visible = true;
  }

  // ---------- Inside Fluff & Feather ----------
  // Its own room, drawn instead of the island while you're inside, just like the clinic and Whimsy & Bloom: the inside
  // of the big red barn. Rough honey-coloured plank walls between heavy timber posts with knee braces, a wide-board
  // floor scattered with straw, and windows (and the big open doorway) that look out on the real island. Down the left,
  // three empty stalls bedded with fresh straw, waiting for their animals; down the right, feed sacks, a feed bin, tack
  // on a peg, buckets, nesting boxes, hay bales and a ladder up to the loft. At the back, the counter where animals
  // will be sold, under a chalkboard and the shop's sign. Walk back out through the doorway to leave
  var abScene = new THREE.Scene();
  abScene.background = new THREE.Color(0x1c1228);
  var AB_X = -400, AB_Z = 1000, AB_W = ANIMAL_HW * 2, AB_D = ANIMAL_HD * 2, AB_H = 3.0;   // far from everything; the same size as the barn outside
  var inBarn = false;
  var abRoom = new THREE.Group();
  abRoom.position.set(AB_X, 0, AB_Z);
  abScene.add(abRoom);
  abScene.add(new THREE.HemisphereLight(0xfff0d8, 0x6a5a48, 0.5));
  var abSun = new THREE.DirectionalLight(0xfff0dc, 0.45);              // daylight slanting in through the windows and the doorway
  abSun.position.set(AB_X - 6, 8, AB_Z + 5);
  abSun.target.position.set(AB_X + 1, 0, AB_Z - 0.5);
  abSun.castShadow = true;
  abSun.shadow.mapSize.set(2048, 2048);
  abSun.shadow.camera.left = -8; abSun.shadow.camera.right = 8; abSun.shadow.camera.top = 8; abSun.shadow.camera.bottom = -8;
  abSun.shadow.camera.near = 1; abSun.shadow.camera.far = 25;
  abSun.shadow.bias = -0.0006; abSun.shadow.normalBias = 0.02;
  abScene.add(abSun); abScene.add(abSun.target);
  var abLamps = [];                                                    // warm lantern light
  [[-3.3, 2.0, 0], [3.3, 2.0, 0], [0, 2.2, -4.2]].forEach(function (lp, k) {
    var L = new THREE.PointLight(0xffc27a, 0.45, 9);
    L.position.set(AB_X + lp[0], lp[1], AB_Z + lp[2]);
    abScene.add(L); abLamps.push({ l: L, p: k * 2.1 });
  });
  function abPart(geo, mat, x, y, z, rx, ry, rz, parent) {            // one piece of the barn room (x, z from the middle of the floor)
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = !mat.transparent && !mat.emissiveMap;
    m.receiveShadow = true;
    (parent || abRoom).add(m);
    return m;
  }
  var abSolids = [];                                                   // things you bump into (room positions: x, z, radius)

  // painted textures
  var abPlankTex = paintTexture(512, 512, function (g, w, h) {        // the walls: rough-sawn boards, each its own shade of honey brown, with grain, knots, gaps and nails
    var bw = w / 10;
    for (var b = 0; b < 10; b++) {
      var x0 = b * bw, l = 36 + isle2Hash(b * 3.3 + 900) * 12, hue = 25 + isle2Hash(b * 5.1 + 900) * 9;
      var bg = g.createLinearGradient(x0, 0, x0 + bw, 0);
      bg.addColorStop(0, 'hsl(' + hue + ',40%,' + (l - 7) + '%)'); bg.addColorStop(0.15, 'hsl(' + hue + ',44%,' + l + '%)');
      bg.addColorStop(0.85, 'hsl(' + hue + ',42%,' + (l - 2) + '%)'); bg.addColorStop(1, 'hsl(' + hue + ',38%,' + (l - 10) + '%)');
      g.fillStyle = bg; g.fillRect(x0, 0, bw, h);
      for (var k = 0; k < 16; k++) {                                   // the grain, wandering down the board
        var gx = x0 + 3 + isle2Hash(b * 17 + k * 1.3 + 900) * (bw - 6);
        g.strokeStyle = isle2Hash(k * 2.7 + b) > 0.45 ? 'rgba(60,30,10,' + (0.08 + isle2Hash(k * 7 + b) * 0.12) + ')' : 'rgba(255,215,160,' + (0.05 + isle2Hash(k * 7 + b) * 0.08) + ')';
        g.lineWidth = 0.6 + isle2Hash(k * 3 + b) * 1.3;
        g.beginPath(); g.moveTo(gx, 0);
        for (var y = 0; y <= h; y += 16) g.lineTo(gx + Math.sin(y * 0.018 + k * 1.7 + b) * 2.2, y);
        g.stroke();
      }
      if (isle2Hash(b * 9.7 + 900) > 0.4) {                            // a knot, with the grain swirling round it
        var kx = x0 + bw * (0.3 + isle2Hash(b * 4.4) * 0.4), ky = isle2Hash(b * 6.6 + 900) * h, kr = 4 + isle2Hash(b * 8.8) * 5;
        for (var r = 4; r > 0; r--) { g.strokeStyle = 'rgba(70,35,12,' + (0.12 + r * 0.05) + ')'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(kx, ky, kr + r * 3, kr * 1.8 + r * 6, 0, 0, Math.PI * 2); g.stroke(); }
        var kg = g.createRadialGradient(kx, ky, 0, kx, ky, kr); kg.addColorStop(0, '#2a1608'); kg.addColorStop(1, 'rgba(60,30,10,0.6)');
        g.fillStyle = kg; g.beginPath(); g.ellipse(kx, ky, kr, kr * 1.5, 0, 0, Math.PI * 2); g.fill();
      }
      for (var s = 0; s < 40; s++) { g.fillStyle = 'rgba(255,235,200,' + isle2Hash(s * 3 + b) * 0.07 + ')'; g.fillRect(x0 + isle2Hash(s + b * 11) * bw, isle2Hash(s * 5 + b) * h, 1, 3 + isle2Hash(s * 7) * 12); }   // saw marks
      g.fillStyle = 'rgba(18,9,3,0.85)'; g.fillRect(x0, 0, 2.5, h);    // the gap between boards
      g.fillStyle = 'rgba(255,220,170,0.12)'; g.fillRect(x0 + 2.5, 0, 1.5, h);
      [0.24, 0.76].forEach(function (ny) {                             // nails into the girts behind
        [0.3, 0.7].forEach(function (nx) {
          g.fillStyle = '#1e1a18'; g.beginPath(); g.arc(x0 + bw * nx, h * ny, 2.2, 0, Math.PI * 2); g.fill();
          g.fillStyle = 'rgba(120,60,30,0.35)'; g.beginPath(); g.arc(x0 + bw * nx + 1, h * ny + 3, 2.5, 0, Math.PI * 2); g.fill();   // a rust streak
        });
      });
    }
  });
  abPlankTex.wrapS = abPlankTex.wrapT = THREE.RepeatWrapping;
  var AF_PPM = 96;                                                     // floor canvas pixels per metre
  var abFloorTex = paintTexture(Math.round(AB_W * AF_PPM), Math.round(AB_D * AF_PPM), function (g, w, h) {
    var bw = 0.24 * AF_PPM;                                            // wide, worn floorboards running front to back
    for (var c = 0; c * bw < w; c++) {
      var y = -isle2Hash(c * 7.7 + 300) * 2 * AF_PPM, n = 0;
      while (y < h) {
        var bl = (1.6 + isle2Hash(c * 3.1 + n * 1.9 + 300) * 2.2) * AF_PPM, l = 30 + isle2Hash(c * 5.3 + n * 2.3) * 11, hue = 26 + isle2Hash(c * 2.9 + n * 3.7) * 9;
        g.fillStyle = 'hsl(' + hue + ',30%,' + l + '%)'; g.fillRect(c * bw, y, bw, bl);
        for (var k = 0; k < 9; k++) {
          var gx = c * bw + 2 + isle2Hash(c * 13 + n * 5 + k) * (bw - 4);
          g.strokeStyle = isle2Hash(k + c + n) > 0.5 ? 'rgba(40,20,8,' + (0.1 + isle2Hash(k * 3 + c) * 0.12) + ')' : 'rgba(255,220,170,' + (0.04 + isle2Hash(k * 5 + c) * 0.06) + ')';
          g.lineWidth = 0.8 + isle2Hash(k * 9 + n) * 1.2;
          g.beginPath(); g.moveTo(gx, y); g.lineTo(gx + (isle2Hash(k * 11 + c) - 0.5) * 5, y + bl); g.stroke();
        }
        g.fillStyle = 'rgba(15,8,3,0.75)'; g.fillRect(c * bw, y, bw, 2.5);   // the butt joint, with two nails each side
        g.fillStyle = '#1a1614';
        [0.3, 0.7].forEach(function (nx) { g.beginPath(); g.arc(c * bw + bw * nx, y + 7, 1.8, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(c * bw + bw * nx, y - 6, 1.8, 0, Math.PI * 2); g.fill(); });
        y += bl; n++;
      }
      g.fillStyle = 'rgba(15,8,3,0.7)'; g.fillRect(c * bw, 0, 2, h);   // the gap between boards
    }
    var aisle = g.createLinearGradient(1.8 * AF_PPM, 0, 7.2 * AF_PPM, 0);   // the aisle, worn paler by boots and hooves
    aisle.addColorStop(0, 'rgba(230,205,160,0)'); aisle.addColorStop(0.45, 'rgba(230,205,160,0.13)'); aisle.addColorStop(1, 'rgba(230,205,160,0)');
    g.fillStyle = aisle; g.fillRect(0, 0, w, h);
    for (var d = 0; d < 40; d++) {                                     // dusty, darker patches
      var dx = isle2Hash(d * 3.3 + 40) * w, dy = isle2Hash(d * 4.1 + 40) * h, dr = 20 + isle2Hash(d) * 70, dg = g.createRadialGradient(dx, dy, 2, dx, dy, dr);
      dg.addColorStop(0, 'rgba(40,25,12,0.18)'); dg.addColorStop(1, 'rgba(40,25,12,0)'); g.fillStyle = dg; g.fillRect(dx - dr, dy - dr, dr * 2, dr * 2);
    }
    for (var i = 0; i < 3800; i++) {                                   // loose straw everywhere, thickest by the stalls and along the walls
      var sx = isle2Hash(i * 1.31 + 7) * w, sy = isle2Hash(i * 2.17 + 7) * h;
      var near = sx < 1.9 * AF_PPM || sx > w - 0.9 * AF_PPM || sy < 0.9 * AF_PPM;
      if (!near && isle2Hash(i * 3.7) > 0.35) continue;
      var a = isle2Hash(i * 5.3) * Math.PI * 2, len = 8 + isle2Hash(i * 7.1) * 22;
      g.strokeStyle = 'hsl(' + (40 + isle2Hash(i * 9) * 10) + ',' + (50 + isle2Hash(i * 11) * 20) + '%,' + (52 + isle2Hash(i * 13) * 22) + '%)';
      g.lineWidth = 1 + isle2Hash(i * 15) * 1.3;
      g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len); g.stroke();
    }
  });
  abFloorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var abStrawTex = paintTexture(256, 256, function (g, w, h) {         // stall bedding: deep straw, ragged at the edges (see-through between strands)
    g.clearRect(0, 0, w, h);
    for (var i = 0; i < 5200; i++) {
      var sx = isle2Hash(i * 1.7 + 11) * w, sy = isle2Hash(i * 2.9 + 11) * h, ex = Math.abs(sx / w - 0.5) * 2, ey = Math.abs(sy / h - 0.5) * 2;
      if (Math.max(ex, ey) > 0.82 + isle2Hash(i * 4.3) * 0.18) continue;
      var a = isle2Hash(i * 5.9) * Math.PI * 2, len = 8 + isle2Hash(i * 7.3) * 26;
      g.strokeStyle = 'hsl(' + (38 + isle2Hash(i * 9) * 12) + ',' + (48 + isle2Hash(i * 11) * 25) + '%,' + (40 + isle2Hash(i * 13) * 32) + '%)';
      g.lineWidth = 1 + isle2Hash(i * 15) * 1.6;
      g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(a) * len, sy + Math.sin(a) * len); g.stroke();
    }
  });
  function abChalkPaint(g, w, h) {                                     // the chalkboard behind the counter
    var bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#2c3a34'); bg.addColorStop(1, '#222e2a');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (var s = 0; s < 18; s++) {                                     // smudges of old chalk, wiped away
      var cx = isle2Hash(s * 3.1 + 5) * w, cy = isle2Hash(s * 4.7 + 5) * h, cr = 30 + isle2Hash(s) * 90, cg = g.createRadialGradient(cx, cy, 4, cx, cy, cr);
      cg.addColorStop(0, 'rgba(230,240,235,0.07)'); cg.addColorStop(1, 'rgba(230,240,235,0)'); g.fillStyle = cg; g.fillRect(0, 0, w, h);
    }
    function chalk(text, x, y, size, col, italic) {                    // chalky letters: drawn a few times, a little offset and faint
      g.font = (italic ? 'italic ' : '') + 'bold ' + size + 'px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (var k = 0; k < 4; k++) { g.fillStyle = col.replace('A', (0.25 + k * 0.12).toFixed(2)); g.fillText(text, x + (isle2Hash(k * 3 + size) - 0.5) * 2, y + (isle2Hash(k * 5 + size) - 0.5) * 2); }
    }
    chalk('Animals for Sale', w / 2, 62, 54, 'rgba(250,248,240,A)', true);
    g.strokeStyle = 'rgba(250,248,240,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2 - 210, 102); g.bezierCurveTo(w / 2 - 80, 94, w / 2 + 80, 110, w / 2 + 210, 100); g.stroke();
    chalk('Coming soon!', w / 2, 158, 46, 'rgba(255,214,120,A)', false);
    chalk('Our first animals are on their way.', w / 2, 214, 24, 'rgba(240,240,230,A)', true);
    chalk('Check back soon, little witch.', w / 2, 248, 24, 'rgba(240,240,230,A)', true);
    g.strokeStyle = 'rgba(250,248,240,0.7)'; g.lineWidth = 3; g.lineCap = 'round';
    function hen(x, y, s) {                                            // little chalk doodles: a hen
      g.beginPath(); g.ellipse(x, y, 34 * s, 26 * s, 0, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(x + 30 * s, y - 28 * s, 13 * s, 0, Math.PI * 2); g.stroke();
      g.strokeStyle = 'rgba(240,120,110,0.75)'; g.beginPath(); g.moveTo(x + 24 * s, y - 40 * s); g.lineTo(x + 28 * s, y - 50 * s); g.lineTo(x + 33 * s, y - 42 * s); g.lineTo(x + 38 * s, y - 50 * s); g.lineTo(x + 40 * s, y - 38 * s); g.stroke();
      g.strokeStyle = 'rgba(255,214,120,0.8)'; g.beginPath(); g.moveTo(x + 42 * s, y - 30 * s); g.lineTo(x + 52 * s, y - 26 * s); g.lineTo(x + 42 * s, y - 22 * s); g.stroke();
      g.beginPath(); g.moveTo(x - 6 * s, y + 24 * s); g.lineTo(x - 8 * s, y + 42 * s); g.moveTo(x + 8 * s, y + 24 * s); g.lineTo(x + 8 * s, y + 42 * s); g.stroke();
      g.strokeStyle = 'rgba(250,248,240,0.7)'; g.beginPath(); g.moveTo(x - 34 * s, y - 6 * s); g.lineTo(x - 50 * s, y - 24 * s); g.lineTo(x - 40 * s, y + 4 * s); g.stroke();
    }
    function sheep(x, y, s) {                                          // and a woolly sheep
      for (var k = 0; k < 9; k++) { var a = k / 9 * Math.PI * 2; g.beginPath(); g.arc(x + Math.cos(a) * 26 * s, y + Math.sin(a) * 16 * s, 12 * s, 0, Math.PI * 2); g.stroke(); }
      g.beginPath(); g.ellipse(x - 40 * s, y - 6 * s, 11 * s, 14 * s, -0.4, 0, Math.PI * 2); g.stroke();
      [-14, -4, 8, 18].forEach(function (lx) { g.beginPath(); g.moveTo(x + lx * s, y + 26 * s); g.lineTo(x + lx * s, y + 44 * s); g.stroke(); });
    }
    hen(92, 196, 1); sheep(w - 96, 190, 1);
    [[46, 290], [w - 60, 286], [w / 2 - 230, 150], [w / 2 + 232, 150]].forEach(function (p) {   // little stars
      g.strokeStyle = 'rgba(255,214,120,0.7)'; g.beginPath();
      for (var k = 0; k < 5; k++) { var a = -Math.PI / 2 + k * Math.PI * 4 / 5; g[k ? 'lineTo' : 'moveTo'](p[0] + Math.cos(a) * 12, p[1] + Math.sin(a) * 12); }
      g.closePath(); g.stroke();
    });
  }
  var abChalkTex = paintTexture(768, 460, abChalkPaint);
  abChalkTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var abSlateTex = paintTexture(256, 128, function (g, w, h) {         // little slates hung on each stall
    g.fillStyle = '#2c3430'; g.fillRect(0, 0, w, h);
    g.font = 'italic bold 30px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (var k = 0; k < 3; k++) { g.fillStyle = 'rgba(250,248,240,' + (0.3 + k * 0.2) + ')'; g.fillText('Coming soon', w / 2 + k * 0.6, h / 2 - 8 + k * 0.5); }
    g.strokeStyle = 'rgba(255,214,120,0.7)'; g.lineWidth = 2; g.beginPath(); g.moveTo(60, 92); g.quadraticCurveTo(128, 100, 196, 90); g.stroke();
  });
  var AB = {
    floor: new THREE.MeshStandardMaterial({ map: abFloorTex, bumpMap: abFloorTex, bumpScale: 0.012, roughness: 0.85 }),
    beam: new THREE.MeshStandardMaterial({ map: abPlankTex.clone(), color: 0x9a7a62, roughness: 0.85 }),   // heavy timbers, darker with age
    wood: new THREE.MeshStandardMaterial({ color: 0x9a7048, roughness: 0.75 }),
    pale: new THREE.MeshStandardMaterial({ color: 0xc09a68, roughness: 0.7 }),
    top: new THREE.MeshStandardMaterial({ color: 0x7a4a28, roughness: 0.38 }),   // the counter's polished top
    reveal: new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.9 }),
    iron: new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.45, metalness: 0.6 }),
    zinc: new THREE.MeshStandardMaterial({ color: 0xd0d6dc, roughness: 0.35, metalness: 0.35 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd4a84e, emissive: 0x5a3e0c, emissiveIntensity: 0.2, metalness: 0.8, roughness: 0.28 }),
    rope: new THREE.MeshStandardMaterial({ color: 0xc8a870, roughness: 1 }),
    leather: new THREE.MeshStandardMaterial({ color: 0x6a3a22, roughness: 0.6 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xf6f0e0, roughness: 0.9 }),
    straw: new THREE.MeshStandardMaterial({ map: abStrawTex, transparent: true, alphaTest: 0.35, roughness: 1, side: THREE.DoubleSide }),
    lamp: new THREE.MeshStandardMaterial({ color: 0xfff0c8, emissive: 0xffbe6a, emissiveIntensity: 1.2, roughness: 0.3 }),
    glass: new THREE.MeshStandardMaterial({ color: 0xeef7ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.25, depthWrite: false })
  };
  AB.beam.map.needsUpdate = true; AB.beam.map.repeat.set(0.3, 1);

  // the floor and ceiling
  abPart(new THREE.PlaneGeometry(AB_W, AB_D), AB.floor, 0, 0, 0, -Math.PI / 2).castShadow = false;
  abPart(new THREE.PlaneGeometry(AB_W, AB_D), new THREE.MeshStandardMaterial({ color: 0x5a3e28, roughness: 1 }), 0, AB_H, 0, Math.PI / 2).castShadow = false;   // faces down, so it never blocks the camera above

  // the walls: plank boards on a frame of heavy posts, a girt and a top plate, with knee braces up at the posts. Each
  // wall is its own group (its local +z points into the room), so it can hide when the camera's behind it. The
  // windows and the doorway look out on the real island, just like the clinic's
  var abWalls = {};
  var AB_WIN_Y = 1.8, AB_WIN = 0.9, AB_DOOR_W = 2.6, AB_DOOR_H = 2.2;  // the same as the windows and doorway outside
  function abWall(name, x, z, ry, len, wins, door, posts) {
    var wgp = new THREE.Group();
    wgp.position.set(x, 0, z); wgp.rotation.y = ry;
    abRoom.add(wgp);
    abWalls[name] = { g: wgp, c: new THREE.Vector3(x, 0, z), n: new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)) };
    var tex = abPlankTex.clone(); tex.needsUpdate = true; tex.repeat.set(len / 2, AB_H / 2);
    var plankMat = new THREE.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 0.015, roughness: 0.9 });
    var shape = new THREE.Shape(), DW2 = AB_DOOR_W / 2;
    shape.moveTo(-len / 2, 0);
    if (door) { shape.lineTo(-DW2, 0); shape.lineTo(-DW2, AB_DOOR_H); shape.lineTo(DW2, AB_DOOR_H); shape.lineTo(DW2, 0); }   // the doorway is a notch out of the bottom
    shape.lineTo(len / 2, 0); shape.lineTo(len / 2, AB_H); shape.lineTo(-len / 2, AB_H); shape.lineTo(-len / 2, 0);
    var WT = 0.22;                                                     // the wall's thickness, seen in the sides of each opening
    wins.forEach(function (hx) {
      var x0 = hx - AB_WIN / 2, x1 = hx + AB_WIN / 2, y0 = AB_WIN_Y - AB_WIN / 2, y1 = AB_WIN_Y + AB_WIN / 2;
      var hp = new THREE.Path(); hp.moveTo(x0, y0); hp.lineTo(x0, y1); hp.lineTo(x1, y1); hp.lineTo(x1, y0); hp.lineTo(x0, y0);
      shape.holes.push(hp);
      var mask = abPart(new THREE.PlaneGeometry(AB_WIN, AB_WIN), siWindowMask, hx, AB_WIN_Y, -0.005, 0, 0, 0, wgp);   // the view outside
      mask.castShadow = false; mask.receiveShadow = false;
      [[0, AB_WIN / 2, AB_WIN, 0.02], [0, -AB_WIN / 2, AB_WIN, 0.02], [-AB_WIN / 2, 0, 0.02, AB_WIN], [AB_WIN / 2, 0, 0.02, AB_WIN]].forEach(function (rv) {
        abPart(new THREE.BoxGeometry(rv[2], rv[3], WT), AB.reveal, hx + rv[0], AB_WIN_Y + rv[1], -WT / 2, 0, 0, 0, wgp);
      });
      abWindowFrame(wgp, hx);
    });
    if (door) {
      var dm = abPart(new THREE.PlaneGeometry(AB_DOOR_W, AB_DOOR_H), siWindowMask, 0, AB_DOOR_H / 2, -0.005, 0, 0, 0, wgp);
      dm.castShadow = false; dm.receiveShadow = false;
      abPart(new THREE.BoxGeometry(AB_DOOR_W, 0.02, WT), AB.reveal, 0, AB_DOOR_H, -WT / 2, 0, 0, 0, wgp);
      [-1, 1].forEach(function (s) { abPart(new THREE.BoxGeometry(0.02, AB_DOOR_H, WT), AB.reveal, s * DW2, AB_DOOR_H / 2, -WT / 2, 0, 0, 0, wgp); });
      abPart(new THREE.BoxGeometry(AB_DOOR_W + 0.5, 0.24, 0.2), AB.beam, 0, AB_DOOR_H + 0.12, 0.1, 0, 0, 0, wgp);   // a heavy header over it
      abPart(new THREE.BoxGeometry(AB_DOOR_W, 0.04, 0.3), AB.beam, 0, 0.02, 0.05, 0, 0, 0, wgp);                    // a worn oak sill
      [-0.9, 0, 0.9].forEach(function (bx) { abPart(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), AB.iron, bx, AB_DOOR_H + 0.12, 0.205, Math.PI / 2, 0, 0, wgp); });   // its bolts
    }
    var shapeGeo = new THREE.ShapeGeometry(shape), sgu = shapeGeo.attributes.uv, sgp = shapeGeo.attributes.position;
    for (var v = 0; v < sgu.count; v++) sgu.setXY(v, sgp.getX(v) / len + 0.5, sgp.getY(v) / AB_H);   // so the boards tile evenly
    abPart(shapeGeo, plankMat, 0, 0, 0, 0, 0, 0, wgp);
    var segs = door ? [[-len / 2, -DW2 - 0.12], [DW2 + 0.12, len / 2]] : [[-len / 2, len / 2]];   // (the girt and kick board stop at the doorway)
    segs.forEach(function (sg) {
      var sl = sg[1] - sg[0], cx = (sg[0] + sg[1]) / 2;
      abPart(new THREE.BoxGeometry(sl, 0.26, 0.04), AB.reveal, cx, 0.13, 0.02, 0, 0, 0, wgp);        // a kick board along the bottom
      abPart(new THREE.BoxGeometry(sl, 0.14, 0.09), AB.beam, cx, 1.0, 0.045, 0, 0, 0, wgp);         // the girt the boards are nailed to
    });
    abPart(new THREE.BoxGeometry(len, 0.22, 0.2), AB.beam, 0, AB_H - 0.11, 0.1, 0, 0, 0, wgp);      // the top plate
    posts.forEach(function (px) {
      abPart(new THREE.BoxGeometry(0.22, AB_H - 0.22, 0.2), AB.beam, px, (AB_H - 0.22) / 2, 0.1, 0, 0, 0, wgp);
      [0.6, 1.4, 2.3].forEach(function (py) { abPart(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), AB.iron, px, py, 0.205, Math.PI / 2, 0, 0, wgp); });   // pegs holding the frame together
      if (Math.abs(px) > len / 2 - 0.3) return;
      [-1, 1].forEach(function (s) {                                   // knee braces up to the plate
        if (door && Math.abs(px + s * 0.4) < DW2) return;
        abPart(new THREE.BoxGeometry(0.12, 0.66, 0.12), AB.beam, px + s * 0.27, AB_H - 0.22 - 0.24, 0.1, 0, 0, -s * Math.PI / 4, wgp);
      });
    });
    return wgp;
  }
  function abWindowFrame(wgp, hx) {                                    // inside a window: a plain wooden casing, cross bars, glass and a deep sill
    var W = AB_WIN, y = AB_WIN_Y;
    abPart(new THREE.PlaneGeometry(W, W), new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, roughness: 0.05, metalness: 0.3, depthWrite: false }), hx, y, 0.03, 0, 0, 0, wgp).renderOrder = 3;
    abPart(new THREE.BoxGeometry(0.04, W, 0.04), AB.pale, hx, y, 0.02, 0, 0, 0, wgp);
    abPart(new THREE.BoxGeometry(W, 0.04, 0.04), AB.pale, hx, y, 0.02, 0, 0, 0, wgp);
    var cw = 0.1;
    [[0, W / 2 + cw / 2, W + cw * 2, cw], [-W / 2 - cw / 2, 0, cw, W], [W / 2 + cw / 2, 0, cw, W]].forEach(function (f) {
      abPart(new THREE.BoxGeometry(f[2], f[3], 0.06), AB.pale, hx + f[0], y + f[1], 0.03, 0, 0, 0, wgp);
    });
    abPart(new THREE.BoxGeometry(W + cw * 2 + 0.08, 0.05, 0.2), AB.pale, hx, y - W / 2 - 0.025, 0.1, 0, 0, 0, wgp);   // the sill
    abPart(new THREE.CylinderGeometry(0.004, 0.004, W - 0.05, 4), AB.rope, hx - W / 2 + 0.06, y + 0.02, 0.07, 0.15, 0, 0, wgp).castShadow = false;   // a cobweb thread in the corner
  }
  var ANW = -AB_D / 2;
  abWall('N', 0, ANW, 0, AB_W, [], false, [-AB_W / 2 + 0.11, -1.6, 1.6, AB_W / 2 - 0.11]);
  abWall('S', 0, -ANW, Math.PI, AB_W, [], true, [-AB_W / 2 + 0.11, -AB_DOOR_W / 2 - 0.11, AB_DOOR_W / 2 + 0.11, AB_W / 2 - 0.11]);
  abWall('W', -AB_W / 2, 0, Math.PI / 2, AB_D, [-2.6, 0, 2.6], false, [-1.3, 1.3]);
  abWall('E', AB_W / 2, 0, -Math.PI / 2, AB_D, [-2.6, 2.6], false, [-1.3, 1.3]);
  function abWallPart(name, geo, mat, x, y, z, rx, ry, rz) { return abPart(geo, mat, x, y, z, rx, ry, rz, abWalls[name].g); }
  var AB_EXIT_Z = AB_D / 2 - 0.6;

  // lanterns on iron brackets on the posts, glowing warm
  var abLanternGlows = [];
  function abLantern(name, px, py) {                                   // px along the wall (wall coordinates), py its height
    abWallPart(name, new THREE.BoxGeometry(0.06, 0.22, 0.03), AB.iron, px, py + 0.2, 0.215);
    var arm = new THREE.CatmullRomCurve3([new THREE.Vector3(px, py + 0.28, 0.22), new THREE.Vector3(px, py + 0.32, 0.36), new THREE.Vector3(px, py + 0.28, 0.48)]);
    abPart(new THREE.TubeGeometry(arm, 10, 0.012, 6), AB.iron, 0, 0, 0, 0, 0, 0, abWalls[name].g);
    var lz = 0.48, ly = py;
    abWallPart(name, new THREE.CylinderGeometry(0.004, 0.004, 0.1, 4), AB.iron, px, ly + 0.23, lz);
    abWallPart(name, new THREE.TorusGeometry(0.025, 0.005, 6, 12), AB.iron, px, ly + 0.19, lz);
    abWallPart(name, new THREE.ConeGeometry(0.08, 0.08, 12), AB.iron, px, ly + 0.14, lz);          // the cap
    abWallPart(name, new THREE.CylinderGeometry(0.075, 0.075, 0.02, 12), AB.iron, px, ly + 0.1, lz);
    abWallPart(name, new THREE.CylinderGeometry(0.06, 0.06, 0.18, 12, 1, true), AB.glass, px, ly, lz);
    abWallPart(name, new THREE.CylinderGeometry(0.08, 0.07, 0.04, 12), AB.iron, px, ly - 0.11, lz);  // the base
    for (var k = 0; k < 4; k++) { var a = k * Math.PI / 2 + 0.4; abWallPart(name, new THREE.CylinderGeometry(0.004, 0.004, 0.2, 4), AB.iron, px + Math.cos(a) * 0.065, ly, lz + Math.sin(a) * 0.065); }   // wire guards
    abWallPart(name, new THREE.CylinderGeometry(0.012, 0.014, 0.05, 8), AB.paper, px, ly - 0.06, lz).castShadow = false;   // the candle
    var flame = abWallPart(name, new THREE.SphereGeometry(0.018, 8, 6), AB.lamp, px, ly - 0.02, lz); flame.scale.set(1, 1.8, 1); flame.castShadow = false;
    var lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc070, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    lg.position.set(px, ly - 0.01, lz); lg.scale.set(0.7, 0.7, 1); abWalls[name].g.add(lg);
    abLanternGlows.push({ g: lg, f: flame, p: abLanternGlows.length * 1.7 });
  }
  abLantern('W', -1.3, 2.05); abLantern('W', 1.3, 2.05);
  abLantern('E', -1.3, 2.05); abLantern('E', 1.3, 2.05);
  abLantern('N', -1.6, 2.2); abLantern('N', 1.6, 2.2);

  // at the back: the shop's sign, and a chalkboard saying the animals are coming soon
  abWallPart('N', new THREE.BoxGeometry(2.36, 0.48, 0.05), new THREE.MeshStandardMaterial({ color: 0x23402e, roughness: 0.5 }), 0, 2.5, 0.03);
  abWallPart('N', new THREE.PlaneGeometry(2.24, 0.4), barnSignMat, 0, 2.5, 0.056);
  [[0, 0.25, 2.42, 0.04], [0, -0.25, 2.42, 0.04], [-1.2, 0, 0.04, 0.54], [1.2, 0, 0.04, 0.54]].forEach(function (f) { abWallPart('N', new THREE.BoxGeometry(f[2], f[3], 0.06), houseMats.gold, f[0], 2.5 + f[1], 0.05); });
  [-0.9, 0.9].forEach(function (cx) { abWallPart('N', new THREE.CylinderGeometry(0.004, 0.004, 0.16, 4), AB.iron, cx, 2.8, 0.05); });   // hung on two chains from the plate
  abWallPart('N', new THREE.BoxGeometry(2.04, 1.24, 0.03), AB.beam, 0, 1.6, 0.015);
  abWallPart('N', new THREE.PlaneGeometry(1.92, 1.14), new THREE.MeshStandardMaterial({ map: abChalkTex, roughness: 0.95 }), 0, 1.6, 0.032);
  [[0, 0.6, 2.06, 0.07], [0, -0.6, 2.06, 0.07], [-1.0, 0, 0.07, 1.27], [1.0, 0, 0.07, 1.27]].forEach(function (f) { abWallPart('N', new THREE.BoxGeometry(f[2], f[3], 0.05), AB.wood, f[0], 1.6 + f[1], 0.035); });
  abWallPart('N', new THREE.BoxGeometry(1.9, 0.025, 0.08), AB.wood, 0, 0.99, 0.06);                 // the chalk ledge
  [[-0.5, 0xf8f6f0], [-0.42, 0xffd6e0], [-0.35, 0xfff0a8]].forEach(function (ch) { abWallPart('N', new THREE.CylinderGeometry(0.008, 0.008, 0.07, 6), new THREE.MeshStandardMaterial({ color: ch[1], roughness: 1 }), ch[0], 1.012, 0.07, 0, 0, Math.PI / 2 + ch[0]); });
  abWallPart('N', new THREE.BoxGeometry(0.12, 0.035, 0.05), new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 1 }), 0.55, 1.02, 0.065);   // the eraser
  // shelves in the back corner, with tins of feed, jars, folded blankets and a basket
  [1.15, 1.75].forEach(function (sy) {
    abWallPart('N', new THREE.BoxGeometry(1.3, 0.04, 0.32), AB.wood, -2.85, sy, 0.16);
    [-3.4, -2.3].forEach(function (bx) { abWallPart('N', new THREE.BoxGeometry(0.03, 0.2, 0.22), AB.iron, bx, sy - 0.12, 0.12); });
  });
  [[-3.35, 0xb83a32, 0.18], [-3.12, 0x3a6a4a, 0.2], [-2.9, 0x2f4a6a, 0.16]].forEach(function (tn) {   // painted feed tins with labels
    abWallPart('N', new THREE.CylinderGeometry(0.08, 0.08, tn[2], 16), new THREE.MeshStandardMaterial({ color: tn[1], roughness: 0.4, metalness: 0.4 }), tn[0], 1.17 + tn[2] / 2, 0.16);
    abWallPart('N', new THREE.CylinderGeometry(0.0805, 0.0805, tn[2] * 0.4, 16, 1, true), AB.paper, tn[0], 1.17 + tn[2] / 2, 0.16);
    abWallPart('N', new THREE.CylinderGeometry(0.083, 0.083, 0.015, 16), AB.zinc, tn[0], 1.17 + tn[2], 0.16);
  });
  [-2.6, -2.45, -2.3].forEach(function (jx, k) {                      // jars of seed and grit
    abWallPart('N', new THREE.CylinderGeometry(0.05, 0.05, 0.14, 12), AB.glass, jx, 1.24, 0.15);
    abWallPart('N', new THREE.CylinderGeometry(0.046, 0.046, 0.09, 12), new THREE.MeshStandardMaterial({ color: [0xd8b060, 0x8a6a4a, 0xc8c0b0][k], roughness: 1 }), jx, 1.215, 0.15);
    abWallPart('N', new THREE.CylinderGeometry(0.053, 0.053, 0.025, 12), AB.zinc, jx, 1.32, 0.15);
  });
  [[0xb84a3a, 0], [0x4a6a8a, 0.07], [0xd8c8a0, 0.14]].forEach(function (bl) {   // folded wool blankets in a stack
    abWallPart('N', ciRoundBox(0.4, 0.07, 0.26, 0.03), new THREE.MeshStandardMaterial({ color: bl[0], roughness: 1 }), -3.15, 1.81 + bl[1], 0.16);
  });
  var abBasket = abWallPart('N', new THREE.CylinderGeometry(0.15, 0.11, 0.16, 16, 1, true), new THREE.MeshStandardMaterial({ map: burlapTex, color: 0xb08850, roughness: 1, side: THREE.DoubleSide }), -2.5, 1.85, 0.16);
  abWallPart('N', new THREE.TorusGeometry(0.15, 0.012, 6, 20, Math.PI), AB.wood, -2.5, 1.93, 0.16);
  abBasket.castShadow = true;
  abSolids.push([-2.85, ANW + 0.2, 0.35], [-3.35, ANW + 0.2, 0.35]);

  // the counter: a plank-fronted bench with X braces and a polished top, with a bell, a ledger and quill, a cash tin and
  // a jar of treats on it, and a stool behind. Step up to it to see what's for sale
  var ABC_X = 0, ABC_Z = -3.6, ABC_W = 2.6, ABC_D = 0.7, ABC_H = 1.0;
  var abCounterFront = abPlankTex.clone(); abCounterFront.needsUpdate = true; abCounterFront.repeat.set(ABC_W / 2, ABC_H / 2);
  abPart(new THREE.BoxGeometry(ABC_W, ABC_H - 0.07, ABC_D - 0.04), new THREE.MeshStandardMaterial({ map: abCounterFront, roughness: 0.85 }), ABC_X, (ABC_H - 0.07) / 2, ABC_Z);
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (c) { abPart(new THREE.BoxGeometry(0.1, ABC_H - 0.07, 0.1), AB.beam, ABC_X + c[0] * (ABC_W / 2 - 0.03), (ABC_H - 0.07) / 2, ABC_Z + c[1] * (ABC_D / 2 - 0.03)); });
  var FZ2 = ABC_Z + ABC_D / 2 + 0.01;
  [0.85, 0.12].forEach(function (ry) { abPart(new THREE.BoxGeometry(ABC_W - 0.1, 0.08, 0.04), AB.beam, ABC_X, ry, FZ2); });   // top and bottom rails
  abPart(new THREE.BoxGeometry(0.08, 0.7, 0.04), AB.beam, ABC_X, 0.485, FZ2);
  [-1, 1].forEach(function (s) {                                       // an X brace in each panel
    var cx = ABC_X + s * ABC_W / 4, pw = ABC_W / 2 - 0.12, ph = 0.65, ln = Math.hypot(pw, ph), an = Math.atan2(ph, pw);
    abPart(new THREE.BoxGeometry(ln, 0.07, 0.03), AB.beam, cx, 0.485, FZ2 + 0.01, 0, 0, an);
    abPart(new THREE.BoxGeometry(ln, 0.07, 0.03), AB.beam, cx, 0.485, FZ2 + 0.012, 0, 0, -an);
  });
  abPart(ciRoundBox(ABC_W + 0.18, 0.07, ABC_D + 0.16, 0.02), AB.top, ABC_X, ABC_H - 0.035, ABC_Z);
  var ABT = ABC_H;                                                     // the top surface
  // a brass service bell
  abPart(new THREE.CylinderGeometry(0.05, 0.055, 0.015, 18), AB.iron, -0.95, ABT + 0.008, ABC_Z + 0.12);
  abPart(new THREE.SphereGeometry(0.045, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), AB.brass, -0.95, ABT + 0.015, ABC_Z + 0.12);
  abPart(new THREE.CylinderGeometry(0.006, 0.006, 0.025, 6), AB.brass, -0.95, ABT + 0.07, ABC_Z + 0.12);
  abPart(new THREE.SphereGeometry(0.01, 8, 6), AB.brass, -0.95, ABT + 0.085, ABC_Z + 0.12);
  // the ledger: open, with ruled pages, and a ribbon
  var abLedgerTex = paintTexture(256, 160, function (g, w, h) {
    g.fillStyle = '#f6f0e0'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(w / 2 - 3, 0, 6, h);
    for (var y = 22; y < h - 8; y += 10) { g.fillStyle = 'rgba(80,110,160,0.35)'; g.fillRect(8, y, w / 2 - 18, 1); g.fillRect(w / 2 + 10, y, w / 2 - 18, 1); }
    g.fillStyle = 'rgba(190,60,60,0.5)'; g.fillRect(28, 8, 1, h - 16); g.fillRect(w / 2 + 30, 8, 1, h - 16);
    g.fillStyle = 'rgba(40,40,60,0.7)'; g.font = 'italic 11px Georgia, serif'; g.fillText('Animals', 34, 18); g.fillText('(none yet)', 36, 38);
  });
  abPart(new THREE.BoxGeometry(0.46, 0.015, 0.32), AB.leather, 0.1, ABT + 0.008, ABC_Z + 0.05, 0, 0.12, 0);
  abPart(new THREE.PlaneGeometry(0.43, 0.29), new THREE.MeshStandardMaterial({ map: abLedgerTex, roughness: 0.9 }), 0.1, ABT + 0.022, ABC_Z + 0.05, -Math.PI / 2, 0, 0.12);
  abPart(new THREE.BoxGeometry(0.012, 0.002, 0.2), new THREE.MeshStandardMaterial({ color: 0xa82a3a, roughness: 0.6 }), 0.1, ABT + 0.025, ABC_Z + 0.19, 0, 0.12, 0);
  abPart(new THREE.CylinderGeometry(0.025, 0.03, 0.05, 12), new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.1, metalness: 0.3 }), 0.45, ABT + 0.025, ABC_Z - 0.08);   // the inkwell
  abPart(new THREE.ConeGeometry(0.004, 0.22, 5), AB.paper, 0.47, ABT + 0.12, ABC_Z - 0.07, 0, 0, -0.35);   // and a quill
  var quill = abPart(new THREE.SphereGeometry(0.03, 10, 6), new THREE.MeshStandardMaterial({ color: 0xf8f4ec, roughness: 0.8 }), 0.5, ABT + 0.17, ABC_Z - 0.07, 0, 0, -0.35);
  quill.scale.set(0.35, 2.4, 0.08);
  // a green cash tin with a brass handle
  abPart(ciRoundBox(0.28, 0.1, 0.2, 0.01), new THREE.MeshStandardMaterial({ color: 0x2f5a3a, roughness: 0.35, metalness: 0.5 }), 0.85, ABT + 0.05, ABC_Z + 0.02);
  abPart(new THREE.TorusGeometry(0.035, 0.006, 6, 12, Math.PI), AB.brass, 0.85, ABT + 0.1, ABC_Z + 0.02);
  abPart(new THREE.BoxGeometry(0.03, 0.02, 0.004), AB.brass, 0.85, ABT + 0.06, ABC_Z + 0.122);
  // a glass jar of treats with a cork lid
  abPart(new THREE.CylinderGeometry(0.07, 0.07, 0.18, 16, 1, true), AB.glass, -0.55, ABT + 0.09, ABC_Z + 0.05).renderOrder = 2;
  abPart(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 14), new THREE.MeshStandardMaterial({ color: 0xb08860, roughness: 1 }), -0.55, ABT + 0.195, ABC_Z + 0.05);
  for (var abTr = 0; abTr < 14; abTr++) abPart(new THREE.SphereGeometry(0.018, 6, 5), new THREE.MeshStandardMaterial({ color: [0x9a6a3a, 0xc8925a, 0x6a4a2a][abTr % 3], roughness: 0.9 }), -0.55 + (isle2Hash(abTr) - 0.5) * 0.08, ABT + 0.02 + Math.floor(abTr / 5) * 0.03, ABC_Z + 0.05 + (isle2Hash(abTr * 3) - 0.5) * 0.08);
  // a little jug of wildflowers
  abPart(new THREE.CylinderGeometry(0.04, 0.05, 0.12, 14), new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.4 }), 1.15, ABT + 0.06, ABC_Z - 0.15);
  for (var abWf = 0; abWf < 7; abWf++) {
    var abWa = abWf / 7 * Math.PI * 2;
    abPart(new THREE.CylinderGeometry(0.003, 0.003, 0.18, 4), new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.8 }), 1.15 + Math.cos(abWa) * 0.02, ABT + 0.19, ABC_Z - 0.15 + Math.sin(abWa) * 0.02, Math.sin(abWa) * 0.3, 0, -Math.cos(abWa) * 0.3);
    abPart(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshStandardMaterial({ color: [0xf2c14e, 0xffffff, 0xc89aff][abWf % 3], roughness: 0.7 }), 1.15 + Math.cos(abWa) * 0.05, ABT + 0.27, ABC_Z - 0.15 + Math.sin(abWa) * 0.05);
  }
  // a stool behind
  abPart(new THREE.CylinderGeometry(0.17, 0.16, 0.05, 18), AB.wood, 0.5, 0.68, ABC_Z - 0.75);
  for (var sl2 = 0; sl2 < 3; sl2++) { var abSla = sl2 / 3 * Math.PI * 2; abPart(new THREE.CylinderGeometry(0.02, 0.025, 0.68, 6), AB.beam, 0.5 + Math.cos(abSla) * 0.12, 0.33, ABC_Z - 0.75 + Math.sin(abSla) * 0.12, Math.sin(abSla) * 0.12, 0, -Math.cos(abSla) * 0.12); }
  for (var abCs = -1.1; abCs <= 1.11; abCs += 0.55) abSolids.push([ABC_X + abCs, ABC_Z, 0.42]);

  // the stalls down the left: plank partitions with posts and caps, a front panel and a gate swung open, deep straw
  // bedding, a hay rack on the wall, a water bucket, and a slate on each one saying who's coming
  var AB_SX = -2.2;                                                    // the stall fronts
  var abWispList = [];
  function abBoardRun(x0, z0, x1, z1, ys, mat, th) {                   // horizontal boards from one point to another
    var ln = Math.hypot(x1 - x0, z1 - z0), an = Math.atan2(-(z1 - z0), x1 - x0);
    ys.forEach(function (by) { abPart(new THREE.BoxGeometry(ln, 0.17, th || 0.04), mat || AB.wood, (x0 + x1) / 2, by, (z0 + z1) / 2, 0, an, 0); });
  }
  function abPost(x, z, h) {
    abPart(new THREE.BoxGeometry(0.12, h, 0.12), AB.beam, x, h / 2, z);
    abPart(new THREE.BoxGeometry(0.16, 0.04, 0.16), AB.beam, x, h + 0.02, z);
    abPart(new THREE.SphereGeometry(0.05, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), AB.beam, x, h + 0.04, z);   // a rounded cap
  }
  [-3.9, -1.3, 1.3, 3.9].forEach(function (pz) {                       // the partitions between them
    abBoardRun(-AB_W / 2 + 0.05, pz, AB_SX, pz, [0.2, 0.4, 0.6, 0.8, 1.0], AB.wood);
    abPart(new THREE.BoxGeometry(AB_W / 2 + AB_SX, 0.08, 0.08), AB.beam, (-AB_W / 2 + AB_SX) / 2, 1.14, pz);   // a top rail
    abPost(AB_SX, pz, 1.3);
    for (var abPx = -AB_W / 2 + 0.3; abPx <= AB_SX; abPx += 0.3) abSolids.push([abPx, pz, 0.1]);
  });
  [-2.6, 0, 2.6].forEach(function (sz, k) {
    var z0 = sz - 1.3, z1 = sz + 1.3;
    abBoardRun(AB_SX, z0 + 0.06, AB_SX, z0 + 1.22, [0.25, 0.5, 0.75, 1.0], AB.wood, 0.05);   // the fixed front panel
    abPost(AB_SX, z0 + 1.25, 1.2);
    for (var fz = z0 + 0.2; fz <= z0 + 1.25; fz += 0.3) abSolids.push([AB_SX, fz, 0.12]);
    // the gate, hinged on the partition post and swung open into the stall
    var gate = new THREE.Group(); gate.position.set(AB_SX, 0, z1 - 0.06); gate.rotation.y = 1.05 + k * 0.12; abRoom.add(gate);
    [0.25, 0.55, 0.85].forEach(function (gy) { abPart(new THREE.BoxGeometry(0.05, 0.12, 1.15), AB.wood, 0, gy, -0.62, 0, 0, 0, gate); });
    [-0.08, -1.16].forEach(function (gz) { abPart(new THREE.BoxGeometry(0.06, 0.95, 0.07), AB.beam, 0, 0.55, gz, 0, 0, 0, gate); });
    abPart(new THREE.BoxGeometry(0.04, 0.08, Math.hypot(1.08, 0.6)), AB.beam, 0.035, 0.55, -0.62, Math.atan2(0.6, 1.08), 0, 0, gate);   // its diagonal
    [0.3, 0.8].forEach(function (hy) { abPart(new THREE.BoxGeometry(0.012, 0.04, 0.3), AB.iron, 0.035, hy, -0.2, 0, 0, 0, gate); });   // strap hinges
    abPart(new THREE.BoxGeometry(0.02, 0.03, 0.12), AB.iron, 0.04, 0.85, -1.08, 0, 0, 0, gate);       // the latch
    var ga = gate.rotation.y;
    [0.4, 0.8, 1.15].forEach(function (t) { abSolids.push([AB_SX - t * Math.sin(ga), z1 - 0.06 - t * Math.cos(ga), 0.1]); });   // (it swings into the stall)
    // deep straw bedding, a little heaped against the back wall
    var bed = new THREE.PlaneGeometry(AB_W / 2 + AB_SX - 0.1, 2.5, 8, 10), bp = bed.attributes.position;
    for (var v = 0; v < bp.count; v++) bp.setZ(v, Math.max(0, (-bp.getX(v) / (AB_W / 2 + AB_SX)) * 0.12) + isle2Hash(v * 1.3 + k * 50) * 0.04);
    bed.computeVertexNormals();
    var bedM = abPart(bed, AB.straw, (-AB_W / 2 + AB_SX) / 2, 0.012, sz, -Math.PI / 2, 0, 0); bedM.castShadow = false;
    var bed2 = abPart(new THREE.PlaneGeometry(1.2, 1.6), AB.straw, -AB_W / 2 + 0.7, 0.04, sz + 0.2, -Math.PI / 2, 0, 0.4 + k);
    bed2.castShadow = false;
    for (var abWs = 0; abWs < 110; abWs++) abWispList.push([-AB_W / 2 + 0.1 + isle2Hash(abWs * 1.9 + k * 300) * (AB_W / 2 + AB_SX - 0.2), sz + (isle2Hash(abWs * 2.3 + k * 300) - 0.5) * 2.4, isle2Hash(abWs * 3.1 + k * 300)]);
    // a hay rack on the wall under the window, with hay poking through
    var rx = -AB_W / 2 + 0.22;
    abPart(new THREE.BoxGeometry(0.04, 0.06, 0.9), AB.beam, rx + 0.18, 1.25, sz);
    abPart(new THREE.BoxGeometry(0.06, 0.06, 0.9), AB.beam, rx - 0.1, 0.9, sz);
    for (var abRb = -0.4; abRb <= 0.41; abRb += 0.1) abPart(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 5), AB.iron, rx + 0.04, 1.07, sz + abRb, 0, 0, -0.72);
    var rh = abPart(new THREE.SphereGeometry(0.26, 12, 8), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), rx - 0.02, 1.1, sz, 0, 0, 0.3);
    rh.scale.set(0.5, 0.55, 1.65);
    // a galvanised water bucket in the front corner
    var bkx = AB_SX - 0.35, bkz = z0 + 0.35;
    abPart(new THREE.CylinderGeometry(0.15, 0.12, 0.28, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }), bkx, 0.14, bkz);
    abPart(new THREE.CircleGeometry(0.14, 18), new THREE.MeshStandardMaterial({ color: 0x5a8aa8, roughness: 0.05, metalness: 0.2 }), bkx, 0.22, bkz, -Math.PI / 2, 0, 0);   // water
    [0.03, 0.26].forEach(function (ry) { abPart(new THREE.TorusGeometry(0.15 - (ry > 0.1 ? 0 : 0.025), 0.006, 5, 24), AB.zinc, bkx, ry, bkz, Math.PI / 2, 0, 0); });
    abPart(new THREE.TorusGeometry(0.15, 0.004, 5, 20, Math.PI), AB.iron, bkx, 0.28, bkz, 0, 0.6, 0);
    abSolids.push([bkx, bkz, 0.15]);
    // the slate on the front panel
    abPart(new THREE.BoxGeometry(0.03, 0.2, 0.38), AB.beam, AB_SX + 0.04, 1.12, z0 + 0.65);
    abPart(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshStandardMaterial({ map: abSlateTex, roughness: 0.95 }), AB_SX + 0.056, 1.12, z0 + 0.65, 0, Math.PI / 2, 0);
    abPart(new THREE.CylinderGeometry(0.003, 0.003, 0.14, 4), AB.rope, AB_SX + 0.05, 1.27, z0 + 0.65, 0, 0, 0);
  });

  // down the right: feed sacks, a feed bin, a Dutch door, tack on a peg, buckets, nesting boxes and hay bales
  var AEX = AB_W / 2;
  [[AEX - 0.42, -3.35, 1.5, 0], [AEX - 0.42, -2.85, 1.7, 1], [AEX - 0.45, -3.1, 1.6, 2]].forEach(function (sk, k) {   // sacks, the top one flopped over
    var sg = barnSackProtos[sk[3]].clone();
    sg.position.set(sk[0], k === 2 ? 0.38 : 0, sk[1]); sg.rotation.set(0, sk[2], k === 2 ? 1.2 : 0);
    abRoom.add(sg);
  });
  abSolids.push([AEX - 0.42, -3.1, 0.45]);
  // the feed bin: a wooden chest with its lid propped open, grain inside and a scoop
  var FB_Z = -1.95, FB_X = AEX - 0.4;
  abPart(new THREE.BoxGeometry(0.55, 0.62, 0.9), AB.wood, FB_X, 0.31, FB_Z);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) { abPart(new THREE.BoxGeometry(0.07, 0.66, 0.07), AB.beam, FB_X + c[0] * 0.26, 0.33, FB_Z + c[1] * 0.43); });
  [0.15, 0.5].forEach(function (by) { abPart(new THREE.BoxGeometry(0.03, 0.06, 0.92), AB.iron, FB_X - 0.28, by, FB_Z); });
  abPart(new THREE.BoxGeometry(0.5, 0.02, 0.85), new THREE.MeshStandardMaterial({ color: 0xd8b060, roughness: 1 }), FB_X, 0.58, FB_Z);   // the grain
  var fbLid = new THREE.Group(); fbLid.position.set(FB_X + 0.28, 0.66, FB_Z); fbLid.rotation.z = 1.2; abRoom.add(fbLid);
  abPart(new THREE.BoxGeometry(0.58, 0.04, 0.94), AB.wood, -0.29, 0.02, 0, 0, 0, 0, fbLid);
  [-0.3, 0.3].forEach(function (lz2) { abPart(new THREE.BoxGeometry(0.58, 0.05, 0.06), AB.beam, -0.29, 0.05, lz2, 0, 0, 0, fbLid); });
  abPart(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }), FB_X - 0.05, 0.63, FB_Z + 0.15, 1.2, 0, 0.3);   // the scoop
  abPart(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 6), AB.wood, FB_X - 0.06, 0.66, FB_Z + 0.25, 1.2, 0, 0.3);
  abSolids.push([FB_X, FB_Z - 0.25, 0.35], [FB_X, FB_Z + 0.25, 0.35]);
  // the Dutch door in the side wall, shut, its top and bottom halves each with a Z brace
  [[0.52, 1.0], [1.52, 1.0]].forEach(function (hf) {
    abWallPart('E', new THREE.BoxGeometry(1.0, 0.98, 0.05), AB.wood, 0, hf[0], 0.04);
    [-0.4, 0.4].forEach(function (ry2) { abWallPart('E', new THREE.BoxGeometry(0.9, 0.09, 0.03), AB.beam, 0, hf[0] + ry2, 0.075); });
    abWallPart('E', new THREE.BoxGeometry(Math.hypot(0.82, 0.7), 0.08, 0.03), AB.beam, 0, hf[0], 0.078, 0, 0, Math.atan2(0.7, 0.82));
    [-0.4, 0.4].forEach(function (hy) { abWallPart('E', new THREE.BoxGeometry(0.3, 0.035, 0.01), AB.iron, -0.36, hf[0] + hy, 0.095); });
  });
  abWallPart('E', new THREE.BoxGeometry(0.14, 0.03, 0.03), AB.iron, 0.4, 1.02, 0.1);                  // the bolt between the halves
  [[-1, 0.56], [1, 0.56]].forEach(function (c) { abWallPart('E', new THREE.BoxGeometry(0.1, 2.1, 0.08), AB.beam, c[0] * c[1], 1.05, 0.05); });   // its frame
  abWallPart('E', new THREE.BoxGeometry(1.22, 0.1, 0.08), AB.beam, 0, 2.08, 0.05);
  // tack on a peg: a coiled rope and a leather halter
  abWallPart('E', new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), AB.beam, 0.88, 1.55, 0.08, Math.PI / 2, 0, 0);
  abWallPart('E', new THREE.TorusGeometry(0.13, 0.018, 6, 24), AB.rope, 0.88, 1.43, 0.12, 0, 0, 0);
  abWallPart('E', new THREE.TorusGeometry(0.11, 0.018, 6, 24), AB.rope, 0.89, 1.42, 0.14, 0.1, 0, 0.2);
  abWallPart('E', new THREE.TorusGeometry(0.1, 0.012, 5, 20), AB.leather, 0.86, 1.36, 0.17, 0.15, 0, 0);
  abWallPart('E', new THREE.TorusGeometry(0.018, 0.005, 5, 10), AB.brass, 0.86, 1.26, 0.18);
  // buckets stacked up, and a broom and a pitchfork leaning on the wall
  [0, 0.07, 0.14].forEach(function (by, k) {
    abPart(new THREE.CylinderGeometry(0.16, 0.12, 0.28, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }), AEX - 0.32, 0.14 + by, 1.8 + k * 0.004);
    abPart(new THREE.TorusGeometry(0.16, 0.006, 5, 24), AB.zinc, AEX - 0.32, 0.28 + by, 1.8, Math.PI / 2, 0, 0);
  });
  abSolids.push([AEX - 0.32, 1.8, 0.18]);
  abPart(new THREE.CylinderGeometry(0.014, 0.014, 1.4, 6), AB.wood, AEX - 0.12, 0.72, 2.2, 0.18, 0, 0.08);   // the broom
  var broom = abPart(new THREE.CylinderGeometry(0.06, 0.13, 0.28, 12), new THREE.MeshStandardMaterial({ color: 0xc8a050, roughness: 1 }), AEX - 0.24, 0.1, 2.08, 0.18, 0, 0.08);
  broom.scale.set(1, 1, 0.45);
  // nesting boxes, empty for now, each with a little bed of straw
  var NB_X = AEX - 0.3, NB_Z = 4.05;
  [-1, 0, 1].forEach(function (k) { abPart(new THREE.BoxGeometry(0.06, 0.7, 0.06), AB.beam, NB_X - 0.2, 0.35, NB_Z + k * 0.48); });
  [0.7, 1.1].forEach(function (sy) {
    abPart(new THREE.BoxGeometry(0.5, 0.03, 1.0), AB.wood, NB_X, sy, NB_Z);
    abPart(new THREE.BoxGeometry(0.5, 0.36, 0.03), AB.wood, NB_X, sy + 0.18, NB_Z - 0.5);
    abPart(new THREE.BoxGeometry(0.5, 0.36, 0.03), AB.wood, NB_X, sy + 0.18, NB_Z + 0.5);
    abPart(new THREE.BoxGeometry(0.5, 0.36, 0.03), AB.wood, NB_X, sy + 0.18, NB_Z);
    abPart(new THREE.BoxGeometry(0.03, 0.12, 1.0), AB.wood, NB_X - 0.24, sy + 0.07, NB_Z);           // a lip to keep the straw in
    [-0.25, 0.25].forEach(function (nz) { abPart(new THREE.PlaneGeometry(0.44, 0.44), AB.straw, NB_X, sy + 0.03, NB_Z + nz, -Math.PI / 2, 0, nz * 3).castShadow = false; });
  });
  abPart(new THREE.BoxGeometry(0.56, 0.04, 1.06), AB.beam, NB_X, 1.48, NB_Z, 0, 0, -0.25);          // a sloped roof so nobody roosts on top
  abPart(new THREE.BoxGeometry(0.05, 0.05, 0.9), AB.wood, NB_X - 0.42, 0.45, NB_Z);                  // a perch rail in front
  [-0.38, 0.38].forEach(function (pz) { abPart(new THREE.BoxGeometry(0.2, 0.04, 0.04), AB.wood, NB_X - 0.33, 0.45, NB_Z + pz); });
  abSolids.push([NB_X, NB_Z - 0.3, 0.35], [NB_X, NB_Z + 0.3, 0.35]);
  // hay bales stacked in the back corner, and a ladder up to the loft
  [[AEX - 0.66, 0, -4.6, 0.03], [AEX - 0.66, 0, -4.1, -0.05], [AEX - 0.68, HB_H, -4.35, 0.08]].forEach(function (bb) {
    var bale = barnBaleProto.clone(); bale.position.set(bb[0], bb[1] + HB_H / 2, bb[2]); bale.rotation.set(0, bb[3], 0); abRoom.add(bale);
  });
  abSolids.push([AEX - 0.66, -4.35, 0.55]);
  var LAD_X = 2.35;
  [-0.2, 0.2].forEach(function (lx) { abPart(new THREE.BoxGeometry(0.06, 3.1, 0.05), AB.wood, LAD_X + lx, 1.5, ANW + 0.42, -0.13, 0, 0); });
  for (var abLr = 0.3; abLr < 2.9; abLr += 0.32) abPart(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 8), AB.pale, LAD_X, abLr, ANW + 0.615 - abLr * 0.13, 0, 0, Math.PI / 2);
  abSolids.push([LAD_X, ANW + 0.4, 0.3]);
  // a wheelbarrow of hay in the aisle near the door
  var abWb = new THREE.Group(); abWb.position.set(2.1, 0, 2.9); abWb.rotation.y = -0.6; abRoom.add(abWb);
  var tray = new THREE.CylinderGeometry(0.42, 0.3, 0.3, 4, 1, true); tray.rotateY(Math.PI / 4); tray.scale(1, 1, 1.35);
  abPart(tray, new THREE.MeshStandardMaterial({ color: 0x3a6a5a, roughness: 0.5, metalness: 0.4, side: THREE.DoubleSide }), 0, 0.5, 0, 0, 0, 0, abWb);
  abPart(new THREE.BoxGeometry(0.4, 0.02, 0.6), new THREE.MeshStandardMaterial({ color: 0x3a6a5a, roughness: 0.5, metalness: 0.4 }), 0, 0.36, 0, 0, 0, 0, abWb);
  var wbHay = abPart(new THREE.SphereGeometry(0.32, 12, 8), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), 0, 0.6, 0, 0, 0, 0, abWb); wbHay.scale.set(1, 0.45, 1.3);
  abPart(new THREE.TorusGeometry(0.16, 0.04, 8, 18), new THREE.MeshStandardMaterial({ color: 0x2a2a2e, roughness: 0.9 }), 0, 0.16, -0.62, 0, Math.PI / 2, 0, abWb);   // the wheel
  abPart(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 8), AB.iron, 0, 0.16, -0.62, 0, 0, Math.PI / 2, abWb);
  [-0.18, 0.18].forEach(function (hx) {
    abPart(new THREE.BoxGeometry(0.04, 0.04, 1.4), AB.wood, hx, 0.36, -0.05, -0.12, 0, 0, abWb);      // the handles
    abPart(new THREE.BoxGeometry(0.03, 0.34, 0.03), AB.iron, hx, 0.17, 0.3, 0, 0, 0, abWb);          // the legs
  });
  abSolids.push([2.1, 2.9, 0.45]);
  // loose wisps of straw in the stalls, in one batch
  (function () {
    var im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.004, 0.003, 1, 3), hayWispMat, abWispList.length), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color();
    abWispList.forEach(function (w, i) {
      e.set(Math.PI / 2 + (isle2Hash(i * 3) - 0.5) * 0.8, isle2Hash(i * 5) * 6.3, (isle2Hash(i * 7) - 0.5) * 0.6); q.setFromEuler(e);
      sc.set(1, 0.08 + w[2] * 0.14, 1); pos.set(w[0], 0.03 + isle2Hash(i * 9) * 0.08, w[1]);
      m.compose(pos, q, sc); im.setMatrixAt(i, m);
      im.setColorAt(i, col.setHSL(0.11 + isle2Hash(i * 11) * 0.03, 0.55, 0.45 + isle2Hash(i * 13) * 0.25));
    });
    im.receiveShadow = true; abRoom.add(im);
  })();

  for (var abWn in abWalls) abWalls[abWn].g.traverse(function (o) { o.castShadow = false; });   // the walls and what's on them don't block the daylight
  var abLook = new THREE.Vector3();
  function updateBarnInterior(t) {
    if (!inBarn) return;
    for (var wn in abWalls) {                                           // hide any wall the camera is behind, so it never blocks the view
      var W = abWalls[wn];
      abLook.set(camera.position.x - AB_X - W.c.x, 0, camera.position.z - AB_Z - W.c.z);
      W.g.visible = abLook.dot(W.n) > 0;
    }
    var hr = state.minutes / 60, nt = hr < 5.5 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr < 18.5 ? 0 : hr < 20 ? (hr - 18.5) / 1.5 : 1;
    abSun.intensity = 0.45 * (1 - nt);                                  // daylight only comes in by day; the lanterns light it at night
    abLamps.forEach(function (L) { L.l.intensity = (0.4 + nt * 0.25) * (1 + Math.sin(t * 9 + L.p) * 0.05 + Math.sin(t * 13.7 + L.p * 2) * 0.04); });
    abLanternGlows.forEach(function (L) { var fl = 1 + Math.sin(t * 11 + L.p) * 0.12 + Math.sin(t * 6.3 + L.p * 2) * 0.08; L.f.scale.set(1, 1.8 * fl, 1); L.g.material.opacity = 0.45 * fl; });
  }
  function inBarnRoom(x, z) { return Math.abs(x - AB_X) < AB_W / 2 - 0.35 && Math.abs(z - AB_Z) < AB_D / 2 - 0.35; }
  function atBarnCounter(margin) {                                     // standing in front of the counter (margin: how far past it still counts)
    if (!inBarn) return false;
    var lx = player.position.x - AB_X - ABC_X, lz = player.position.z - AB_Z, m = margin || 0;
    return Math.abs(lx) < ABC_W / 2 + 0.4 + m && lz > ABC_Z + 0.3 && lz < ABC_Z + 1.9 + m;
  }
  // the windows and the doorway look out on the real island, just like the shop's and the clinic's
  function drawBarnView() {
    renderer.getDrawingBufferSize(shopViewSize);
    if (shopViewTarget.width !== shopViewSize.x || shopViewTarget.height !== shopViewSize.y) shopViewTarget.setSize(shopViewSize.x, shopViewSize.y);
    siWindowMask.uniforms.uSize.value.copy(shopViewSize);
    shopViewMap.makeTranslation(ANIMAL_X, B_FOUND, ANIMAL_Z).multiply(shopViewTmp.makeRotationY(ANIMAL_TURN)).multiply(shopViewTmp.makeTranslation(-AB_X, 0, -AB_Z));   // (the barn's floor sits up on its foundation)
    shopViewCam.projectionMatrix.copy(camera.projectionMatrix); shopViewCam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    shopViewCam.matrix.multiplyMatrices(shopViewMap, camera.matrixWorld);
    shopViewCam.updateMatrixWorld(true);
    barnGroup.visible = false;                                         // you're inside it, so don't draw its own outside walls in the way
    renderer.setRenderTarget(shopViewTarget);
    renderer.render(scene, shopViewCam);
    renderer.setRenderTarget(null);
    barnGroup.visible = true;
  }

  // ---------- The seed shop: step up to the counter inside to buy seeds with Star Coins ----------
  var SEED_COST = 10;
  function shopFront(d) { return { x: SHOP_X + Math.sin(SHOP_TURN) * (SHOP_HD + d), z: SHOP_Z + Math.cos(SHOP_TURN) * (SHOP_HD + d) }; }
  var shopDoor = shopFront(0.12);
  var barnDoor = animalFront(0.12);                                   // and into Fluff & Feather's big doorway
  var clinicDoor = clinicFront(0.12);                                 // and up onto the clinic's porch to its door                                     // walk up the steps to the front door to go in
  function shopStepHeight(x, z) {                                     // how high the shop's front steps lift you
    var dx = x - SHOP_X, dz = z - SHOP_Z, c = Math.cos(SHOP_TURN), si = Math.sin(SHOP_TURN);
    var lx = dx * c - dz * si, lz = dx * si + dz * c;                  // into the shop's own directions
    if (Math.abs(lx) > 1.0 || lz < SHOP_HD - 0.6 || lz > SHOP_HD + 0.58) return 0;
    return lz < SHOP_HD + 0.3 ? 0.3 : 0.15;
  }
  var shopOpen = false;
  function nearShop(margin) { return atShopCounter(margin); }
  var shopBtn = document.createElement('button');
  shopBtn.type = 'button';
  shopBtn.className = 'sleep-btn ship-btn';
  shopBtn.innerHTML = '🌱 Buy seeds <kbd>E</kbd>';
  canvas.parentNode.appendChild(shopBtn);
  var shopBox = document.createElement('div');
  shopBox.className = 'inventory ship shop';
  shopBox.hidden = true;
  shopBox.innerHTML = '<div class="inv-head"><b>🌱 Whimsy &amp; Bloom</b><button type="button" class="inv-close" aria-label="Close the shop">✕</button></div>' +
    '<p class="ship-hint">Welcome, little witch! Every seed here was grown under the moon.</p>' +
    '<div class="shop-item"><div class="slot shop-pic"></div><div class="shop-text"><b>Moonbloom Seed</b><span>Water it every day; after 4 watered days it blooms.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + SEED_COST + ' each</span></div></div>' +
    '<div class="shop-buy"><button type="button" data-n="1">Buy 1</button><button type="button" data-n="5">Buy 5</button><button type="button" data-n="10">Buy 10</button></div>' +
    '<p class="ship-total">You have <img class="coin-icon" alt=""> <b>0</b></p>';
  canvas.parentNode.appendChild(shopBox);
  shopBox.querySelector('.shop-pic').appendChild(itemPicture('seed'));
  paintCoinIcons(shopBox);
  var shopCoins = shopBox.querySelector('.ship-total b'), shopBuyBtns = shopBox.querySelectorAll('.shop-buy button');
  function renderShop() {
    shopCoins.textContent = state.coins;
    for (var i = 0; i < shopBuyBtns.length; i++) {
      var n = +shopBuyBtns[i].getAttribute('data-n');
      shopBuyBtns[i].innerHTML = 'Buy ' + n + ' · <img class="coin-icon" alt=""> ' + n * SEED_COST;
      shopBuyBtns[i].disabled = state.coins < n * SEED_COST;
    }
    paintCoinIcons(shopBox);
  }
  function buySeeds(n) {
    var cost = n * SEED_COST;
    if (state.coins < cost) { showToast('Not enough Star Coins', 1800); return; }
    if (!roomFor(['seed'])) { bagFull(); return; }
    addItem('seed', n);
    state.coins -= cost;
    showCoins(true);
    coinSound(n);
    showToast('Bought ' + n + ' Moonbloom Seed' + (n > 1 ? 's' : '') + ' 🌱', 1800);
    renderShop();
  }
  for (var sbi = 0; sbi < shopBuyBtns.length; sbi++) {
    shopBuyBtns[sbi].addEventListener('click', function () { buySeeds(+this.getAttribute('data-n')); });
  }
  function openShop() { if (shopOpen) return; toggleBag(false); shopOpen = true; menuOpenedAt = Date.now(); walkTarget = null; shopBox.hidden = false; renderShop(); }
  function closeShop() { shopOpen = false; shopBox.hidden = true; }
  shopBox.querySelector('.inv-close').addEventListener('click', function () { closeShop(); focusGame(); });
  shopBtn.addEventListener('click', function () { openShop(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && shopOpen) closeShop(); });
  function updateShop(dt) {
    var near = nearShop();
    if (shopOpen && !nearShop(1.2)) closeShop();                 // it stays open until you really walk away from the counter
    if (shopOpen && shopCoins.textContent !== String(state.coins)) renderShop(); // keep the prices up to date with your coins
    var show = near && !shopOpen;
    if (shopBtn.classList.contains('show') !== show) shopBtn.classList.toggle('show', show);
    updateShopBuilding(state.time);
    updateShopInterior(state.time);
  }
  // ---------- Fluff & Feather's counter: step up to it inside the barn to see the animals for sale (none yet) ----------
  var barnShopOpen = false;
  var barnShopBtn = document.createElement('button');
  barnShopBtn.type = 'button';
  barnShopBtn.className = 'sleep-btn ship-btn';
  barnShopBtn.innerHTML = '🐾 Buy animals <kbd>E</kbd>';
  canvas.parentNode.appendChild(barnShopBtn);
  var barnShopBox = document.createElement('div');
  barnShopBox.className = 'inventory ship shop';
  barnShopBox.hidden = true;
  barnShopBox.innerHTML = '<div class="inv-head"><b>🐾 Fluff &amp; Feather</b><button type="button" class="inv-close" aria-label="Close the shop">✕</button></div>' +
    '<p class="ship-hint">Welcome to Fluff &amp; Feather! This is where you\'ll buy animals for your farm.</p>' +
    '<div class="animal-empty"><span class="animal-empty-icon" aria-hidden="true">🐣</span><b>No animals for sale yet</b><span>Our first animals are still on their way. Check back soon!</span></div>' +
    '<p class="ship-total">You have <img class="coin-icon" alt=""> <b>0</b></p>';
  canvas.parentNode.appendChild(barnShopBox);
  paintCoinIcons(barnShopBox);
  var barnShopCoins = barnShopBox.querySelector('.ship-total b');
  function openBarnShop() { if (barnShopOpen) return; toggleBag(false); barnShopOpen = true; menuOpenedAt = Date.now(); walkTarget = null; barnShopBox.hidden = false; barnShopCoins.textContent = state.coins; }
  function closeBarnShop() { barnShopOpen = false; barnShopBox.hidden = true; }
  barnShopBox.querySelector('.inv-close').addEventListener('click', function () { closeBarnShop(); focusGame(); });
  barnShopBtn.addEventListener('click', function () { openBarnShop(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && barnShopOpen) closeBarnShop(); });
  function updateBarnShop() {
    var near = atBarnCounter();
    if (barnShopOpen && !atBarnCounter(1.2)) closeBarnShop();          // it stays open until you really walk away from the counter
    if (barnShopOpen && barnShopCoins.textContent !== String(state.coins)) barnShopCoins.textContent = state.coins;
    var show = near && !barnShopOpen;
    if (barnShopBtn.classList.contains('show') !== show) barnShopBtn.classList.toggle('show', show);
    updateBarnInterior(state.time);
  }
  // One slot button, for the bag or the hotbar. Tap to select it; press and drag to move it to another slot
  function makeSlot(i, onPick) {
    var slot = document.createElement('button');
    slot.type = 'button';
    slot.className = 'slot' + (bag[i] ? '' : ' empty') + (i === selectedSlot ? ' selected' : '');
    slot.setAttribute('data-slot', i);
    if (bag[i]) {
      slot.appendChild(itemPicture(bag[i].id));
      var isTool = bag[i].id === 'axe' || bag[i].id === 'pickaxe' || bag[i].id === 'trimmers' || bag[i].id === 'hoe'; // tools don't show a count
      slot.setAttribute('aria-label', ITEMS[bag[i].id].name + (isTool ? '' : ', ' + bag[i].count));
      if (!isTool) {
        var count = document.createElement('span');
        count.className = 'count';
        count.textContent = bag[i].count;
        slot.appendChild(count);
      }
      slot.onclick = function () { selectedSlot = i; renderBag(); if (onPick) onPick(i); };
      slot.addEventListener('pointerdown', function (e) { startDrag(i, e); });
    } else {
      slot.setAttribute('aria-label', 'Empty slot');
    }
    return slot;
  }
  function itemPicture(id) {
    if (ITEMS[id].img) {
      var pic = document.createElement('img');
      pic.src = ITEMS[id].img;
      pic.alt = '';
      pic.style.width = (ITEMS[id].fill || 70) + '%'; // how much of the slot the picture fills
      pic.style.pointerEvents = 'none';
      return pic;
    }
    var span = document.createElement('span');
    span.textContent = ITEMS[id].icon;
    span.style.pointerEvents = 'none';
    return span;
  }

  // ---------- Dragging items between slots ----------
  var slotDrag = null; // { from, startX, startY, ghost }
  function startDrag(i, e) {
    slotDrag = { from: i, startX: e.clientX, startY: e.clientY, ghost: null };
  }
  window.addEventListener('pointermove', function (e) {
    if (!slotDrag) return;
    if (!slotDrag.ghost) {
      if (Math.abs(e.clientX - slotDrag.startX) + Math.abs(e.clientY - slotDrag.startY) < 8) return; // a tap, not a drag (yet)
      slotDrag.ghost = document.createElement('div'); // a copy of the item that follows your finger
      slotDrag.ghost.className = 'drag-ghost';
      slotDrag.ghost.appendChild(itemPicture(bag[slotDrag.from].id));
      document.body.appendChild(slotDrag.ghost);
      var src = document.querySelectorAll('[data-slot="' + slotDrag.from + '"]');
      for (var k = 0; k < src.length; k++) src[k].classList.add('dragging');
    }
    slotDrag.ghost.style.left = e.clientX + 'px';
    slotDrag.ghost.style.top = e.clientY + 'px';
    var over = document.querySelectorAll('.slot.drop-target');
    for (var j = 0; j < over.length; j++) over[j].classList.remove('drop-target');
    var target = slotUnder(e.clientX, e.clientY);
    if (target) target.classList.add('drop-target');
  });
  window.addEventListener('pointerup', function (e) {
    if (!slotDrag) return;
    var d = slotDrag;
    slotDrag = null;
    if (!d.ghost) return; // it was just a tap: the slot's click handles it
    document.body.removeChild(d.ghost);
    var target = slotUnder(e.clientX, e.clientY);
    if (target) moveItem(d.from, +target.getAttribute('data-slot'));
    renderBag();
  });
  window.addEventListener('pointercancel', function () {
    if (!slotDrag) return;
    if (slotDrag.ghost) document.body.removeChild(slotDrag.ghost);
    slotDrag = null;
    renderBag();
  });
  function slotUnder(x, y) {
    var el = document.elementFromPoint(x, y);
    while (el && !(el.getAttribute && el.getAttribute('data-slot') !== null)) el = el.parentNode;
    return el && el.getAttribute ? el : null;
  }
  // Moves an item to another slot, swapping with whatever is there (same items stack together)
  function moveItem(from, to) {
    if (from === to || !bag[from]) return;
    if (bag[to] && bag[to].id === bag[from].id) {
      bag[to].count += bag[from].count;
      bag[from] = null;
    } else {
      var held = bag[to];
      bag[to] = bag[from];
      bag[from] = held;
    }
    if (selectedSlot === from) selectedSlot = to;       // the selection follows the item you moved
    else if (selectedSlot === to) selectedSlot = from;
  }
  function renderHotbar() {
    if (!hotUi.slots) return;
    hotUi.slots.innerHTML = '';
    for (var k = 0; k < ROW_SIZE; k++) {
      hotUi.slots.appendChild(makeSlot(hotRow * ROW_SIZE + k));
    }
    if (hotUi.row) hotUi.row.textContent = (hotRow + 1) + '/' + (BAG_SLOTS / ROW_SIZE) + ' ⇅';
  }
  function nextRow() {
    hotRow = (hotRow + 1) % (BAG_SLOTS / ROW_SIZE);
    renderHotbar();
  }
  if (hotUi.row) hotUi.row.addEventListener('click', function () { nextRow(); focusGame(); });
  function stepSlot(dir) { // select the next slot that has something in it, flipping the hotbar to its row
    var at = selectedSlot >= 0 ? selectedSlot : (dir > 0 ? hotRow * ROW_SIZE - 1 : hotRow * ROW_SIZE + ROW_SIZE);
    for (var tries = 0; tries < BAG_SLOTS; tries++) {
      at = (at + dir + BAG_SLOTS) % BAG_SLOTS;
      if (bag[at]) break;
    }
    if (!bag[at]) return;                       // the bag is empty
    selectedSlot = at;
    hotRow = Math.floor(at / ROW_SIZE);
    renderBag();
  }

  function renderBag() {
    renderHotbar();
    if (!bagUi.grid) return;
    bagUi.grid.innerHTML = '';
    for (var i = 0; i < BAG_SLOTS; i++) {
      bagUi.grid.appendChild(makeSlot(i));
    }
    describeSlot();
  }
  function toggleBag(open, onMap) {                                  // onMap: open it on the world map page instead of the bag
    if (!bagUi.box) return;
    var show = open === undefined ? bagUi.box.hidden : !!open;
    if (show) {
      if (typeof binOpen !== 'undefined' && binOpen) closeBin();      // only one menu open at a time
      if (typeof shopOpen !== 'undefined' && shopOpen) closeShop();
      if (typeof barnShopOpen !== 'undefined' && barnShopOpen) closeBarnShop();
      walkTarget = null;
    }
    bagUi.box.hidden = !show;
    if (show) { renderBag(); showMapPage(!!onMap); }                  // the map (if shown) starts on where you are now
    else if (mapPage) showMapPage(false);                             // closing it always goes back to the bag page next time
  }
  // ---------- World map: a second page in the bag ----------
  // Press "Next ›" in the bag to see a map of both islands. Scroll it (or drag it) to look around. It shows your house,
  // the Dawn Tree, the lake and dock, your crops, the shipping bin, the bridge, Whimsy & Bloom, every standing tree,
  // bush and rock, and you, as a little witch's hat, which moves along with you while the map is open
  var MAP_X0 = -142, MAP_X1 = 47, MAP_Z0 = -42, MAP_Z1 = 168, MAP_S = 6;   // the area it covers, and how many pixels per step
  var MAP_W = Math.round((MAP_X1 - MAP_X0) * MAP_S), MAP_H = Math.round((MAP_Z1 - MAP_Z0) * MAP_S);
  var mapPage = false, mapBase = null, mapTimer = null, mapFollow = true;
  var mapHead = bagUi.box ? bagUi.box.querySelector('.inv-head b') : null;
  var mapBtn = document.createElement('button');
  mapBtn.type = 'button'; mapBtn.className = 'inv-close map-btn'; mapBtn.textContent = 'Next ›';
  mapBtn.style.cssText = 'margin-left:auto;margin-right:8px;';
  if (bagUi.close) bagUi.close.parentNode.insertBefore(mapBtn, bagUi.close);
  var mapBox = document.createElement('div');
  mapBox.style.cssText = 'height:min(46vh,320px);overflow:auto;border-radius:12px;box-shadow:inset 0 0 0 2px #fff;background:#cfe8ff;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y;cursor:grab;position:relative;';
  var mapCanvas = document.createElement('canvas');
  mapCanvas.width = MAP_W * 2; mapCanvas.height = MAP_H * 2;           // drawn at double size so it stays sharp
  mapCanvas.style.cssText = 'display:block;width:' + MAP_W + 'px;height:' + MAP_H + 'px;max-width:none;';
  mapBox.appendChild(mapCanvas);
  var mapFind = document.createElement('button');                      // jump back to where you are
  mapFind.type = 'button'; mapFind.className = 'inv-close'; mapFind.textContent = '📍 Find me';
  mapFind.style.cssText = 'font-size:.8rem;padding:3px 10px;';
  var mapKey = document.createElement('div');
  mapKey.className = 'inv-info';
  mapKey.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;font-size:.78rem;';
  mapKey.innerHTML = '<span style="flex-basis:100%;color:#7b4fd6;font-weight:600">📍 Tap a pin to teleport there (' + 20 + ' mana)</span><span><b style="color:#7b4fd6">🧙</b> You</span><span><span style="color:#8a5a3c">■</span> Farm soil</span><span><span style="color:#e98ab6">●</span> Ready to pick</span><span><span style="color:#3f8a3a">●</span> Trees</span><span><span style="color:#8c8c96">●</span> Rocks</span>';
  mapKey.insertBefore(mapFind, mapKey.firstChild);
  mapBox.style.display = mapKey.style.display = 'none';
  if (bagUi.grid) { bagUi.grid.parentNode.insertBefore(mapBox, bagUi.grid.nextSibling); bagUi.grid.parentNode.insertBefore(mapKey, mapBox.nextSibling); }
  (function () {                                                       // drag the map with the mouse (fingers already scroll it)
    var dragAt = null;
    var dragged = false;
    mapBox.addEventListener('mousedown', function (e) { dragAt = { x: e.clientX, y: e.clientY, l: mapBox.scrollLeft, t: mapBox.scrollTop }; dragged = false; mapBox.style.cursor = 'grabbing'; e.preventDefault(); });
    window.addEventListener('mousemove', function (e) { if (dragAt && Math.abs(e.clientX - dragAt.x) + Math.abs(e.clientY - dragAt.y) > 6) dragged = true; });
    mapCanvas.addEventListener('click', function (e) {                // tap a pin to teleport there
      if (dragged) { dragged = false; return; }
      var r = mapCanvas.getBoundingClientRect(), cx = (e.clientX - r.left) * (mapCanvas.width / r.width), cy = (e.clientY - r.top) * (mapCanvas.height / r.height);
      for (var i = 0; i < TELEPORTS.length; i++) {
        var sp3 = TELEPORTS[i].spot(), pp = mapXY(sp3.x, sp3.z);
        if (Math.abs(cx - pp[0]) < 40 && cy > pp[1] - 90 && cy < pp[1] + 26) { teleportTo(i); return; }
      }
    });
    window.addEventListener('mousemove', function (e) { if (!dragAt) return; mapBox.scrollLeft = dragAt.l - (e.clientX - dragAt.x); mapBox.scrollTop = dragAt.t - (e.clientY - dragAt.y); mapFollow = false; });
    window.addEventListener('mouseup', function () { if (dragAt) { dragAt = null; mapBox.style.cursor = 'grab'; } });
    mapBox.addEventListener('touchstart', function () { mapFollow = false; }, { passive: true });
    mapBox.addEventListener('wheel', function () { mapFollow = false; }, { passive: true });
  })();
  function mapXY(x, z) { return [(x - MAP_X0) * MAP_S * 2, (z - MAP_Z0) * MAP_S * 2]; }
  function drawMapBase() {                                            // the land, water, cliffs, paths and bridge, worked out pixel by pixel once
    var BS = 3, bw = Math.round((MAP_X1 - MAP_X0) * BS), bh = Math.round((MAP_Z1 - MAP_Z0) * BS);
    var cv = document.createElement('canvas'); cv.width = bw; cv.height = bh;
    var g = cv.getContext('2d'), img = g.createImageData(bw, bh), d = img.data;
    function land(x, z) { return islandR(x, z) < ISLAND || onIsle2(x, z, 0) || onIsle3(x, z, 0); }
    for (var py = 0; py < bh; py++) for (var px = 0; px < bw; px++) {
      var x = MAP_X0 + (px + 0.5) / BS, z = MAP_Z0 + (py + 0.5) / BS, c, i = (py * bw + px) * 4;
      var main = islandR(x, z) < ISLAND, isle3 = onIsle3(x, z, 0), isle = onIsle2(x, z, 0) || isle3, br = Math.abs(x - BRIDGE_X) < BRIDGE_W / 2 + 0.3 && z > BRIDGE_Z0 - 1.5 && z < BRIDGE_Z1 + 1.5;
      var br2 = Math.abs(z - BRIDGE2_Z) < BRIDGE_W / 2 + 0.3 && x < -(BRIDGE_Z0 - 1.5) && x > -(BRIDGE_Z1 + 1.5);   // the west bridge
      var n = (isle2Hash(px * 7.1 + py * 3.3) - 0.5) * 10, n2 = Math.sin(x * 0.9 + Math.sin(z * 0.7) * 2) * 6 + Math.sin(z * 1.3 + x * 0.4) * 5;   // speckle and soft patches of lighter and darker grass
      if (main && inLake(x, z)) {
        if (onDock(x, z)) c = [170, 122, 80];
        else { var depth = Math.min(1, (WATER_Y - groundHeight(x, z)) / 0.9); c = [150 - depth * 70, 210 - depth * 50, 240 - depth * 10]; n = n * 0.3; n2 = Math.sin(x * 3 + z * 2) * 4; }
      } else if (main || isle) {
        var edge = main ? ISLAND - islandR(x, z) : 4;
        if (main && pathDist(x, z) < PATH_W + 0.25) c = pathDist(x, z) < PATH_W - 0.1 ? [222, 192, 140] : [190, 160, 112];   // the path, with darker worn edges
        else if (main && nearLake(x, z)) c = [196, 206, 150];                                  // a sandy shore round the lake
        else c = isle ? [128, 194, 108] : [122, 188, 100];
        if (edge < 1.4) c = [c[0] - 30, c[1] - 30, c[2] - 26];                                  // the grassy rim at the edge
        if (isle && !onIsle2(x, z, 1.2) && !onIsle3(x, z, 1.2)) c = [96, 156, 82];
        if (isle && stonePathDist(x, z) < SP_W) c = (Math.floor(x * 1.6) + Math.floor(z * 1.6)) % 2 ? [222, 214, 198] : [206, 198, 184];   // the stone path to the shop
      } else if (br || br2) {
        var across = br ? Math.abs(x - BRIDGE_X) : Math.abs(z - BRIDGE2_Z), along = br ? z : x;
        c = across > BRIDGE_W / 2 - 0.15 ? [170, 160, 150] : [210, 200, 186];  // railings and paving
        if (across <= BRIDGE_W / 2 - 0.15 && (Math.floor(along * 1.5) % 2 === 0)) c = [200, 190, 176];
        n = n * 0.4; n2 = 0;
      } else {
        var shadow = land(x - 1.2, z - 1.6) ? 22 : 0;                                          // the islands cast a soft shadow on the clouds below
        var sky = 1 - py / bh * 0.2; c = [Math.round(186 * sky + 40) - shadow, Math.round(222 * sky + 22) - shadow, 255 - shadow * 0.5];
        n2 = Math.sin(x * 0.25 + z * 0.15) * 6;
      }
      d[i] = Math.max(0, Math.min(255, c[0] + n + n2)); d[i + 1] = Math.max(0, Math.min(255, c[1] + n + n2)); d[i + 2] = Math.max(0, Math.min(255, c[2] + n * 0.6 + n2 * 0.5)); d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    var out = document.createElement('canvas'); out.width = MAP_W * 2; out.height = MAP_H * 2;
    var o = out.getContext('2d');
    o.imageSmoothingEnabled = true;
    o.drawImage(cv, 0, 0, out.width, out.height);
    // soft clouds drifting below the islands
    for (var cl = 0; cl < 26; cl++) {
      var cx = isle2Hash(cl * 3.1) * out.width, cy = isle2Hash(cl * 5.3) * out.height, cr = 30 + isle2Hash(cl) * 60;
      var p1 = mapXY(MAP_X0 + cx / (MAP_S * 2), MAP_Z0 + cy / (MAP_S * 2));
      if (land(MAP_X0 + cx / (MAP_S * 2), MAP_Z0 + cy / (MAP_S * 2))) continue;
      for (var pf = 0; pf < 5; pf++) { o.beginPath(); o.arc(p1[0] + (pf - 2) * cr * 0.5, p1[1] + Math.sin(pf * 2) * cr * 0.2, cr * (0.5 + 0.2 * Math.sin(pf + cl)), 0, Math.PI * 2); o.fillStyle = 'rgba(255,255,255,0.35)'; o.fill(); }
    }
    // a compass in the corner
    var cp = mapXY(MAP_X1 - 5, MAP_Z0 + 5);
    o.save(); o.translate(cp[0], cp[1]);
    o.beginPath(); o.arc(0, 0, 34, 0, Math.PI * 2); o.fillStyle = 'rgba(255,255,255,0.85)'; o.fill(); o.strokeStyle = '#b89a5a'; o.lineWidth = 3; o.stroke();
    [0, 1, 2, 3].forEach(function (k) { o.save(); o.rotate(k * Math.PI / 2); o.beginPath(); o.moveTo(0, -28); o.lineTo(7, 0); o.lineTo(-7, 0); o.closePath(); o.fillStyle = k ? '#8a7aa8' : '#7b4fd6'; o.fill(); o.restore(); });
    o.font = 'bold 16px Fredoka, sans-serif'; o.textAlign = 'center'; o.fillStyle = '#4a2f7a'; o.fillText('N', 0, -38);
    o.restore();
    return out;
  }
  function drawMap() {
    if (!mapBase) mapBase = drawMapBase();
    var g = mapCanvas.getContext('2d'), K = MAP_S * 2;
    g.drawImage(mapBase, 0, 0);
    function dot(x, z, r, col, ring) { var p = mapXY(x, z); g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); g.fillStyle = col; g.fill(); if (ring) { g.strokeStyle = ring; g.lineWidth = 1.5; g.stroke(); } }
    function label(text, x, z, dy, size) {
      var p = mapXY(x, z);
      g.font = 'bold ' + (size || 20) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.lineWidth = 6; g.strokeStyle = 'rgba(255,255,255,0.92)'; g.lineJoin = 'round'; g.strokeText(text, p[0], p[1] + (dy || 0));
      g.fillStyle = '#4a2f7a'; g.fillText(text, p[0], p[1] + (dy || 0));
    }
    // your farm soil and crops
    tiles.forEach(function (t) {
      if (!t.soil) return;
      var p = mapXY(t.x, t.z), sz = TILE * K * 0.92;
      g.fillStyle = t.wet ? '#5a3a24' : '#8a5a3c'; g.fillRect(p[0] - sz / 2, p[1] - sz / 2, sz, sz);
      g.strokeStyle = 'rgba(60,35,20,0.5)'; g.lineWidth = 1; for (var f = -1; f <= 1; f++) { g.beginPath(); g.moveTo(p[0] - sz / 2 + 2, p[1] + f * sz / 4); g.lineTo(p[0] + sz / 2 - 2, p[1] + f * sz / 4); g.stroke(); }
      if (t.crop) {
        if (t.stage === 3) { for (var pt = 0; pt < 5; pt++) dot(t.x + Math.cos(pt * 1.26) * 0.18, t.z + Math.sin(pt * 1.26) * 0.18, 3.5, '#f2a6c8'); dot(t.x, t.z, 2.5, '#ffe08a'); }
        else dot(t.x, t.z, 2.5 + t.stage * 1.2, '#6cc062', 'rgba(30,70,30,0.6)');
      }
    });
    // rocks, bushes and trees that are standing right now, with soft shadows
    mineable.forEach(function (r) { if (r.gone || r.state !== 'whole') return; var rr = 2.5 + r.size * 2.2; dot(r.x + 0.15, r.z + 0.2, rr, 'rgba(0,0,0,0.18)'); dot(r.x, r.z, rr, '#9a9aa4', 'rgba(60,60,70,0.6)'); dot(r.x - 0.1, r.z - 0.12, rr * 0.4, 'rgba(255,255,255,0.45)'); });
    trimmable.forEach(function (b) { var u = b.userData; if (u.gone || u.state !== 'standing') return; dot(u.base.x + 0.2, u.base.z + 0.25, 5, 'rgba(0,0,0,0.15)'); dot(u.base.x, u.base.z, 5, '#6fb85e'); dot(u.base.x - 0.12, u.base.z - 0.12, 2.5, '#9ad884'); });
    choppable.forEach(function (t) {
      var u = t.userData; if (u.gone || u.state !== 'standing') return;
      var p = mapXY(u.base.x, u.base.z), sz = (u.size || 1);
      g.beginPath(); g.ellipse(p[0] + 6 * sz, p[1] + 8 * sz, 11 * sz, 8 * sz, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fill();
      if (u.leafy) {                                                    // a round leafy crown made of a few blobs, lit from the top left
        [[0, 0, 9], [-5, -3, 6], [5, -2, 6], [0, 5, 6]].forEach(function (bb) { g.beginPath(); g.arc(p[0] + bb[0] * sz, p[1] + bb[1] * sz, bb[2] * sz, 0, Math.PI * 2); g.fillStyle = '#3f8a3a'; g.fill(); });
        g.beginPath(); g.arc(p[0] - 3 * sz, p[1] - 3 * sz, 4 * sz, 0, Math.PI * 2); g.fillStyle = '#6ab45a'; g.fill();
      } else {                                                          // a pine, seen from above: a dark star of needles
        g.beginPath(); for (var k = 0; k < 16; k++) { var a = k / 16 * Math.PI * 2, rr2 = (k % 2 ? 5 : 10) * sz; g.lineTo(p[0] + Math.cos(a) * rr2, p[1] + Math.sin(a) * rr2); } g.closePath();
        g.fillStyle = '#285a2c'; g.fill(); g.beginPath(); g.arc(p[0] - 1.5, p[1] - 1.5, 3 * sz, 0, Math.PI * 2); g.fillStyle = '#3f7a3a'; g.fill();
      }
    });
    // the house's yard fence, the house, its tower and the cauldron
    g.fillStyle = '#7a5a40';
    fencePosts.forEach(function (fp) { var w = houseToWorld(fp[0], fp[1]), p = mapXY(w.x, w.z); g.fillRect(p[0] - 2.5, p[1] - 2.5, 5, 5); });
    var hp = mapXY(HOUSE_X, HOUSE_Z), hw2 = HW / 2 * K, hd2 = HD / 2 * K;
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(hp[0] - hw2 + 8, hp[1] - hd2 + 10, hw2 * 2, hd2 * 2);
    g.fillStyle = '#6a4aa8'; g.fillRect(hp[0] - hw2 - 4, hp[1] - hd2 - 4, hw2 * 2 + 8, hd2 * 2 + 8);      // the purple roof
    g.fillStyle = '#7d5cc0'; g.fillRect(hp[0] - hw2 - 4, hp[1] - hd2 - 4, hw2 * 2 + 8, hd2 + 4);
    g.strokeStyle = 'rgba(40,20,70,0.35)'; g.lineWidth = 1; for (var rl = 0; rl < 10; rl++) { var ry2 = hp[1] - hd2 - 4 + rl * (hd2 * 2 + 8) / 10; g.beginPath(); g.moveTo(hp[0] - hw2 - 4, ry2); g.lineTo(hp[0] + hw2 + 4, ry2); g.stroke(); }
    g.strokeStyle = '#4a2f7a'; g.lineWidth = 3; g.beginPath(); g.moveTo(hp[0] - hw2 - 4, hp[1]); g.lineTo(hp[0] + hw2 + 4, hp[1]); g.stroke();   // the ridge
    var tw = houseToWorld(TX, TZ), tp = mapXY(tw.x, tw.z);                                              // the round tower
    g.beginPath(); g.arc(tp[0], tp[1], TR * K + 4, 0, Math.PI * 2); g.fillStyle = '#5a3a98'; g.fill(); g.strokeStyle = '#e8b84a'; g.lineWidth = 3; g.stroke();
    g.beginPath(); g.arc(tp[0], tp[1], 4, 0, Math.PI * 2); g.fillStyle = '#e8b84a'; g.fill();
    var cw2 = houseToWorld(CX, CZ); dot(cw2.x, cw2.z, 7, '#1e1e24'); dot(cw2.x, cw2.z, 4.5, '#4ae07e');  // the cauldron
    label('Your House', HOUSE_X, HOUSE_Z, -hd2 - 22);
    // the Dawn Tree, glowing pink
    var dp = mapXY(TREE_X, TREE_Z), dg = g.createRadialGradient(dp[0], dp[1], 4, dp[0], dp[1], TREE_ZONE * K + 10);
    dg.addColorStop(0, 'rgba(255,170,230,0.9)'); dg.addColorStop(1, 'rgba(255,170,230,0)');
    g.fillStyle = dg; g.beginPath(); g.arc(dp[0], dp[1], TREE_ZONE * K + 10, 0, Math.PI * 2); g.fill();
    [[0, 0, 16], [-10, -6, 11], [10, -5, 11], [0, 10, 11], [-9, 7, 9], [9, 7, 9]].forEach(function (bb) { g.beginPath(); g.arc(dp[0] + bb[0], dp[1] + bb[1], bb[2], 0, Math.PI * 2); g.fillStyle = '#ff9be0'; g.fill(); });
    g.beginPath(); g.arc(dp[0] - 5, dp[1] - 5, 7, 0, Math.PI * 2); g.fillStyle = '#ffd6f2'; g.fill();
    label('Dawn Tree', TREE_X, TREE_Z, 36);
    label('Lake', LAKE_X, LAKE_Z, 0);
    var bp = mapXY(binWorld.x, binWorld.z); g.fillStyle = '#1e1e22'; g.fillRect(bp[0] - 8, bp[1] - 6, 16, 12); g.fillStyle = '#555'; g.fillRect(bp[0] - 8, bp[1] - 6, 16, 3);
    label('Shipping Bin', binWorld.x, binWorld.z, 20, 15);
    // the bridge's gateways and its floating lanterns
    [BRIDGE_Z0, BRIDGE_Z1].forEach(function (gz) { var a2 = mapXY(BRIDGE_X - BRIDGE_W / 2 - 0.3, gz), b2 = mapXY(BRIDGE_X + BRIDGE_W / 2 + 0.3, gz); g.fillStyle = '#d8ccbc'; g.fillRect(a2[0] - 6, a2[1] - 6, 12, 12); g.fillRect(b2[0] - 6, b2[1] - 6, 12, 12); });
    [BRIDGE_Z0, BRIDGE_Z1].forEach(function (gz) { var a3 = mapXY(-gz, BRIDGE2_Z - BRIDGE_W / 2 - 0.3), b3 = mapXY(-gz, BRIDGE2_Z + BRIDGE_W / 2 + 0.3); g.fillStyle = '#d8ccbc'; g.fillRect(a3[0] - 6, a3[1] - 6, 12, 12); g.fillRect(b3[0] - 6, b3[1] - 6, 12, 12); });   // and the west bridge's
    for (var bl2 = BRIDGE_Z0 + 6; bl2 < BRIDGE_Z1 - 3; bl2 += 9) { [-1, 1].forEach(function (sd) { var lp = mapXY(-bl2, BRIDGE2_Z + sd * (BRIDGE_W / 2 + 0.9)); var lg = g.createRadialGradient(lp[0], lp[1], 1, lp[0], lp[1], 12); lg.addColorStop(0, 'rgba(200,150,255,0.95)'); lg.addColorStop(1, 'rgba(200,150,255,0)'); g.fillStyle = lg; g.fillRect(lp[0] - 12, lp[1] - 12, 24, 24); }); }
    for (var bl = BRIDGE_Z0 + 6; bl < BRIDGE_Z1 - 3; bl += 9) { [-1, 1].forEach(function (sd) { var lp = mapXY(BRIDGE_X + sd * (BRIDGE_W / 2 + 0.9), bl); var lg = g.createRadialGradient(lp[0], lp[1], 1, lp[0], lp[1], 12); lg.addColorStop(0, 'rgba(200,150,255,0.95)'); lg.addColorStop(1, 'rgba(200,150,255,0)'); g.fillStyle = lg; g.fillRect(lp[0] - 12, lp[1] - 12, 24, 24); }); }
    label('Bridge', BRIDGE_X + 7, (BRIDGE_Z0 + BRIDGE_Z1) / 2, 0);
    label('West Bridge', -(BRIDGE_Z0 + BRIDGE_Z1) / 2, BRIDGE2_Z - 6, 0);
    label('Western Isle', ISLE3_X + 6, ISLE3_Z + 16, 0, 26);
    // Fluff & Feather: its grey gambrel roof with the ridge along it, and the cupola
    var apm = mapXY(ANIMAL_X, ANIMAL_Z);
    g.save(); g.translate(apm[0], apm[1]); g.rotate(-ANIMAL_TURN);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(-ANIMAL_HW * K + 8, -ANIMAL_HD * K + 10, ANIMAL_HW * K * 2, ANIMAL_HD * K * 2);
    g.fillStyle = '#5a625e'; g.fillRect(-ANIMAL_HW * K - 4, -ANIMAL_HD * K - 4, ANIMAL_HW * K, ANIMAL_HD * K * 2 + 8);
    g.fillStyle = '#727a76'; g.fillRect(0, -ANIMAL_HD * K - 4, ANIMAL_HW * K + 4, ANIMAL_HD * K * 2 + 8);
    g.fillStyle = '#f4f0e6'; g.fillRect(-2, -ANIMAL_HD * K - 4, 4, ANIMAL_HD * K * 2 + 8);
    g.fillStyle = '#5fa890'; g.fillRect(-7, -7, 14, 14);
    g.fillStyle = '#b8343a'; g.fillRect(-1.4 * K, ANIMAL_HD * K, 2.8 * K, 5);                 // the red barn doors
    g.restore();
    label('Fluff & Feather', ANIMAL_X, ANIMAL_Z, ANIMAL_HD * K + 34);
    // Whimsy & Bloom: its slate roof, turned the way it faces, with the front steps
    var sp = mapXY(SHOP_X, SHOP_Z);
    g.save(); g.translate(sp[0], sp[1]); g.rotate(-SHOP_TURN);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(-SHOP_HW * K + 8, -SHOP_HD * K + 10, SHOP_HW * K * 2, SHOP_HD * K * 2);
    g.fillStyle = '#4a4e5a'; g.fillRect(-SHOP_HW * K - 3, -SHOP_HD * K - 3, SHOP_HW * K * 2 + 6, SHOP_HD * K * 2 + 6);
    g.fillStyle = '#5c6070'; g.fillRect(-SHOP_HW * K * 0.8, -SHOP_HD * K * 0.8, SHOP_HW * K * 1.6, SHOP_HD * K * 1.6);
    g.strokeStyle = '#e8b84a'; g.lineWidth = 2; g.strokeRect(-SHOP_HW * K * 0.8, -SHOP_HD * K * 0.8, SHOP_HW * K * 1.6, SHOP_HD * K * 1.6);
    g.fillStyle = '#d6cfc4'; g.fillRect(-1 * K, SHOP_HD * K + 3, 2 * K, 0.6 * K);                         // the steps
    g.fillStyle = '#b79ce6'; g.fillRect(-4 * K, SHOP_HD * K - 2, 3 * K, 6); g.fillRect(1 * K, SHOP_HD * K - 2, 3 * K, 6);   // the awnings
    g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fillStyle = '#c89aff'; g.fill();                       // the crystal spire
    g.restore();
    label('Whimsy & Bloom', SHOP_X, SHOP_Z, SHOP_HD * K + 30);              // below the shop, clear of its teleport pin
    // Everdawn Clinic: its coral tiled roof with the ridge along it, the white porch and a heart on the ridge
    var cpm = mapXY(CLINIC_X, CLINIC_Z);
    g.save(); g.translate(cpm[0], cpm[1]); g.rotate(-CLINIC_TURN);
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(-CLINIC_HW * K + 8, -CLINIC_HD * K + 10, CLINIC_HW * K * 2, CLINIC_HD * K * 2);
    g.fillStyle = '#b8583e'; g.fillRect(-CLINIC_HW * K - 3, -(CLINIC_HD + 0.45) * K, CLINIC_HW * K * 2 + 6, (CLINIC_HD + 0.45) * K);
    g.fillStyle = '#d87a5a'; g.fillRect(-CLINIC_HW * K - 3, 0, CLINIC_HW * K * 2 + 6, (CLINIC_HD + 0.45) * K);
    g.fillStyle = 'rgba(255,255,255,0.12)'; for (var tr = -CLINIC_HD; tr < CLINIC_HD; tr += 0.6) g.fillRect(-CLINIC_HW * K - 3, tr * K, CLINIC_HW * K * 2 + 6, 1.5);
    g.fillStyle = '#c0704a'; g.fillRect(-CLINIC_HW * K - 3, -2, CLINIC_HW * K * 2 + 6, 4);                                      // the ridge
    g.fillStyle = '#f4f1ea'; g.fillRect(-1.7 * K, (CLINIC_HD + 0.45) * K, 3.4 * K, 1.3 * K);                                    // the porch
    g.fillStyle = '#d6cfc4'; g.fillRect(-1.5 * K, (CLINIC_HD + 1.75) * K, 3 * K, 0.35 * K);                                     // its step
    g.fillStyle = '#e0607a'; g.beginPath(); g.moveTo(0, 7); g.bezierCurveTo(-11, 0, -7, -8, 0, -3); g.bezierCurveTo(7, -8, 11, 0, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.fillRect(-1.2, -4, 2.4, 7); g.fillRect(-3.5, -1.6, 7, 2.4);
    g.restore();
    label('Everdawn Clinic', CLINIC_X, CLINIC_Z, CLINIC_HD * K + 36);
    label('Town Square', ISLE2_X - 4, ISLE2_Z + 18, 0, 26);
    // teleport pins: a glowing purple marker on each place you can teleport to
    var pinPulse = 1 + Math.sin(Date.now() / 300) * 0.08;
    TELEPORTS.forEach(function (d) {
      var sp2 = d.spot(), pp = mapXY(sp2.x, sp2.z), R = 24 * pinPulse;
      var pg = g.createRadialGradient(pp[0], pp[1] - 40, 4, pp[0], pp[1] - 40, 54); pg.addColorStop(0, 'rgba(200,150,255,0.6)'); pg.addColorStop(1, 'rgba(200,150,255,0)');
      g.fillStyle = pg; g.beginPath(); g.arc(pp[0], pp[1] - 30, 54, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(pp[0], pp[1], 9, 4, 0, 0, Math.PI * 2); g.fillStyle = 'rgba(40,20,70,0.35)'; g.fill();   // its shadow
      g.beginPath(); g.moveTo(pp[0], pp[1]);                                                                          // a teardrop pin
      g.bezierCurveTo(pp[0] - R * 0.5, pp[1] - R * 0.9, pp[0] - R, pp[1] - R * 1.3, pp[0] - R, pp[1] - R * 1.9);
      g.arc(pp[0], pp[1] - R * 1.9, R, Math.PI, 0);
      g.bezierCurveTo(pp[0] + R, pp[1] - R * 1.3, pp[0] + R * 0.5, pp[1] - R * 0.9, pp[0], pp[1]);
      g.closePath(); g.fillStyle = '#7b4fd6'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke();
      g.beginPath(); g.arc(pp[0], pp[1] - R * 1.9, R * 0.72, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.font = Math.round(R * 1.05) + 'px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(d.icon, pp[0], pp[1] - R * 1.88);
      g.font = 'bold 13px Fredoka, sans-serif'; g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,0.95)'; g.strokeText('✨ Teleport', pp[0], pp[1] + 14); g.fillStyle = '#7b4fd6'; g.fillText('✨ Teleport', pp[0], pp[1] + 14);
    });
    // you: a little witch's hat with a pointer showing the way you face (inside, you're shown at the door)
    var you = { x: player.position.x, z: player.position.z };
    if (indoors) you = inBarn ? animalFront(1.5) : inClinic ? clinicFront(1.5) : inShop ? shopFront(1.5) : { x: OUT_DOOR_X, z: OUT_DOOR_Z + 1 };
    var yp = mapXY(you.x, you.z), fa = indoors ? (inBarn ? ANIMAL_TURN : inClinic ? CLINIC_TURN : inShop ? SHOP_TURN : 0) : facing, pulse = 1 + Math.sin(Date.now() / 250) * 0.15;
    var yg = g.createRadialGradient(yp[0], yp[1], 2, yp[0], yp[1], 34 * pulse); yg.addColorStop(0, 'rgba(255,255,255,0.9)'); yg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = yg; g.beginPath(); g.arc(yp[0], yp[1], 34 * pulse, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(yp[0], yp[1]); g.rotate(-fa + Math.PI);
    g.beginPath(); g.moveTo(0, -30); g.lineTo(8, -18); g.lineTo(-8, -18); g.closePath(); g.fillStyle = '#7b4fd6'; g.fill();   // which way you're facing
    g.restore();
    g.beginPath(); g.ellipse(yp[0], yp[1] + 6, 16, 6, 0, 0, Math.PI * 2); g.fillStyle = '#5b3fb0'; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.stroke();   // the hat's brim
    g.beginPath(); g.moveTo(yp[0] - 9, yp[1] + 5); g.quadraticCurveTo(yp[0] - 2, yp[1] - 6, yp[0] + 4, yp[1] - 20); g.lineTo(yp[0] + 9, yp[1] + 5); g.closePath(); g.fillStyle = '#7b4fd6'; g.fill(); g.stroke();
    g.beginPath(); g.arc(yp[0] + 4, yp[1] - 20, 3, 0, Math.PI * 2); g.fillStyle = '#ffe08a'; g.fill();
    label('You', you.x, you.z, 24, 16);
    return yp;
  }
  var mapAutoScroll = false;
  function centreMapOnYou(yp) {
    var l = Math.max(0, Math.round(yp[0] / 2 - mapBox.clientWidth / 2)), t = Math.max(0, Math.round(yp[1] / 2 - mapBox.clientHeight / 2));
    if (Math.abs(mapBox.scrollLeft - l) < 1 && Math.abs(mapBox.scrollTop - t) < 1) return;
    mapAutoScroll = true; mapBox.scrollLeft = l; mapBox.scrollTop = t;
    setTimeout(function () { mapAutoScroll = false; }, 50);
  }
  mapBox.addEventListener('scroll', function () { if (!mapAutoScroll) mapFollow = false; });   // you scrolled to look around: stop following you
  function showMapPage(on) {
    mapPage = on;
    if (bagUi.grid) bagUi.grid.style.display = on ? 'none' : '';
    if (bagUi.info) bagUi.info.style.display = on ? 'none' : '';
    var extras = bagUi.box ? bagUi.box.querySelectorAll('.trash-row') : [];
    for (var i = 0; i < extras.length; i++) extras[i].style.display = on ? 'none' : '';
    mapBox.style.display = on ? 'block' : 'none'; mapKey.style.display = on ? 'flex' : 'none';
    mapBtn.textContent = on ? '‹ Bag' : 'Next ›';
    if (mapHead) mapHead.textContent = on ? '🗺️ World Map' : '🎒 Bag';
    if (mapTimer) { clearInterval(mapTimer); mapTimer = null; }
    if (on) {
      mapFollow = true;
      centreMapOnYou(drawMap());
      mapTimer = setInterval(function () {                              // keep you moving on the map while it's open
        if (!mapPage || !bagUi.box || bagUi.box.hidden) { clearInterval(mapTimer); mapTimer = null; return; }
        var yp = drawMap(); if (mapFollow) centreMapOnYou(yp);
      }, 300);
    }
  }
  mapBtn.addEventListener('click', function () { showMapPage(!mapPage); focusGame(); });
  mapFind.addEventListener('click', function () { mapFollow = true; centreMapOnYou(drawMap()); focusGame(); });
  if (bagUi.open) bagUi.open.addEventListener('click', function () { toggleBag(); focusGame(); });   // (focus back on the game, so Space doesn't press the button again)
  if (bagUi.close) bagUi.close.addEventListener('click', function () { toggleBag(false); focusGame(); });
  renderBag();

  // ---------- Teleport spell ----------
  // Press T (or the Teleport button) to open the world map with glowing pins on your house, the Dawn Tree and every
  // shop. Tap a pin and you vanish in a swirl of sparkles and reappear there. It costs some mana, and works from
  // anywhere, even indoors
  var TELEPORT_COST = 20;
  var TELEPORTS = [
    { name: 'Your House', icon: '🏡', spot: function () { return { x: OUT_DOOR_X, z: OUT_DOOR_Z + 1.3, face: 0, view: 0 }; } },
    { name: 'The Dawn Tree', icon: '🌸', spot: function () { return { x: TREE_X + 2.4, z: TREE_Z + 2.4, face: Math.atan2(-1, -1), view: Math.atan2(1, 1) }; } },
    { name: 'Whimsy & Bloom', icon: '🌱', spot: function () { var f = shopFront(1.8); return { x: f.x, z: f.z, face: SHOP_TURN + Math.PI, view: SHOP_TURN }; } },
    { name: 'Everdawn Clinic', icon: '🩺', spot: function () { var f = clinicFront(2.6); return { x: f.x, z: f.z, face: CLINIC_TURN + Math.PI, view: CLINIC_TURN }; } },
    { name: 'Fluff & Feather', icon: '🐾', spot: function () { var f = animalFront(2.4); return { x: f.x, z: f.z, face: ANIMAL_TURN + Math.PI, view: ANIMAL_TURN }; } }
  ];
  var teleporting = false;
  var tpBtn = document.createElement('button');
  tpBtn.type = 'button'; tpBtn.id = 'btnTeleport'; tpBtn.innerHTML = 'Teleport <kbd>T</kbd>';
  if (ui.btnSpell && ui.btnSpell.parentNode) ui.btnSpell.parentNode.insertBefore(tpBtn, ui.btnSpell.nextSibling);
  function openTeleport() {                                           // the world map, with its teleport pins
    if (teleporting || sleeping || doorBusy) return;
    if (binOpen) closeBin(); if (shopOpen) closeShop(); if (barnShopOpen) closeBarnShop();
    if (bagUi.box && !bagUi.box.hidden && mapPage) { toggleBag(false); return; }   // pressing it again closes the map
    if (bagUi.box && !bagUi.box.hidden) showMapPage(true);            // the bag's already open: flip to its map page
    else toggleBag(true, true);
    if (state.mana < TELEPORT_COST) showToast('Teleporting needs ' + TELEPORT_COST + ' mana. Visit the Dawn Tree to refill it.', 2400);
  }
  function teleportSwirl(x, z) {                                       // a rising spiral of purple and gold sparkles
    burst(x, 0.3, z, 0xc89aff, 26, 2.2, 3.2, -1.5);
    burst(x, 1.0, z, 0xffe08a, 16, 1.6, 2.4, -1);
  }
  function teleportTo(n) {
    if (teleporting || sleeping) return;
    if (state.mana < TELEPORT_COST) { showToast('Not enough mana to teleport (you need ' + TELEPORT_COST + ')', 2000); return; }
    var d = TELEPORTS[n], to = d.spot();
    toggleBag(false);
    teleporting = true; walkTarget = null; keys = {};
    state.mana -= TELEPORT_COST;
    spellSound();
    if (!indoors) teleportSwirl(player.position.x, player.position.z);
    fadeBox.style.background = '#2a1a4a';
    fadeBox.style.transition = 'opacity 0.5s';
    fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (indoors) {                                                  // stepping out of the house or the shop
        indoors = false; inShop = false; inClinic = false; inBarn = false;
        scene.add(player);
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; }
      }
      player.position.set(to.x, 0, to.z);
      facing = to.face;
      cam.target.set(to.x, 0.8, to.z);
      cam.yaw = to.view;                                              // turn the camera to show where you've arrived
      doorArmed = false;                                               // don't walk straight through a door you land beside
      teleportSwirl(to.x, to.z);
      setTimeout(function () {
        fadeBox.style.opacity = 0;
        showToast('✨ ' + d.name, 1600);
        setTimeout(function () { fadeBox.style.transition = 'opacity 0.35s'; fadeBox.style.background = '#120a1c'; teleporting = false; }, 550);
      }, 250);
    }, 550);
  }
  tpBtn.addEventListener('click', function () { openTeleport(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'KeyT' && !e.repeat) openTeleport(); });

  // ---------- Keyboard ----------
  var keys = {};
  var GAME_KEYS = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyE', 'Space', 'KeyQ'];
  window.addEventListener('keydown', function (e) {
    if (GAME_KEYS.indexOf(e.code) === -1) return;
    e.preventDefault();
    keys[e.code] = true;
    walkTarget = null;
    if (e.repeat) return;
    if (e.code === 'KeyE' || e.code === 'Space') interact();
    if (e.code === 'KeyQ') castSpell();
  });
  window.addEventListener('keydown', function (e) { // I opens and closes the bag, Escape closes it
    if (e.repeat) return;
    if (e.code === 'KeyI') toggleBag();
    if (e.code === 'KeyR') nextRow();
    if (e.code === 'Tab') { e.preventDefault(); stepSlot(e.shiftKey ? -1 : 1); } // Tab steps to your next item, Shift+Tab goes back
    // number keys 1-4 pick that slot in the hotbar's current row (pressing it again unselects it)
    var num = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
    if (num >= 0) {
      var pick = hotRow * ROW_SIZE + num;
      selectedSlot = selectedSlot === pick ? -1 : pick;
      renderBag();
    }
    if (e.code === 'Escape') toggleBag(false);
  });
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  window.addEventListener('blur', function () { keys = {}; });

  function focusGame() { canvas.focus({ preventScroll: true }); }
  ui.btnAct.addEventListener('click', function () { interact(); focusGame(); });
  var actionHeld = false; // true while the Interact button is held down
  ui.btnAct.addEventListener('pointerdown', function () { actionHeld = true; });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
    ui.btnAct.addEventListener(ev, function () { actionHeld = false; });
  });
  ui.btnAct.addEventListener('contextmenu', function (e) { e.preventDefault(); }); // no long-press menu on phones
  ui.btnSpell.addEventListener('click', function () { castSpell(); focusGame(); });

  // ---------- Mouse / touch: drag to turn, pinch or scroll to zoom, tap to walk ----------
  var pointers = {}, drag = null, pinch = 0;
  var raycaster = new THREE.Raycaster();
  var ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  function pointerList() { return Object.keys(pointers).map(function (id) { return pointers[id]; }); }

  canvas.addEventListener('pointerdown', function (e) {
    focusGame();
    canvas.setPointerCapture(e.pointerId);
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var list = pointerList();
    if (list.length === 1) {
      drag = { x: e.clientX, y: e.clientY, startX: e.clientX, startY: e.clientY, time: Date.now(), moved: false };
    } else if (list.length === 2) {
      pinch = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
      if (drag) drag.moved = true;
    }
  });

  canvas.addEventListener('pointermove', function (e) {
    if (!pointers[e.pointerId]) return;
    pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    var list = pointerList();
    if (list.length === 2) {
      var d = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
      if (pinch > 0) cam.dist = THREE.MathUtils.clamp(cam.dist * pinch / d, indoors ? 5 : 6, indoors ? 10 : 26);
      pinch = d;
      return;
    }
    if (!drag) return;
    cam.yaw -= (e.clientX - drag.x) * 0.008;
    cam.pitch = THREE.MathUtils.clamp(cam.pitch + (e.clientY - drag.y) * 0.006, 0.25, 1.35);
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6) drag.moved = true;
  });

  function pointerEnd(e) {
    if (!pointers[e.pointerId]) return;
    delete pointers[e.pointerId];
    if (pointerList().length > 0) return;
    if (e.type === 'pointerup' && drag && !drag.moved && Date.now() - drag.time < 450) tapToWalk(e);
    drag = null;
    pinch = 0;
  }
  canvas.addEventListener('pointerup', pointerEnd);
  canvas.addEventListener('pointercancel', pointerEnd);

  function tapToWalk(e) {
    if (binOpen || shopOpen || barnShopOpen) return;                  // a tap while a menu is open doesn't walk you away from it
    var rect = canvas.getBoundingClientRect();
    var ndc = new THREE.Vector2((e.clientX - rect.left) / rect.width * 2 - 1, -(e.clientY - rect.top) / rect.height * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    var hit = new THREE.Vector3();
    if (!raycaster.ray.intersectPlane(ground, hit)) return;
    if (indoors ? !inRoom(hit.x, hit.z) : !walkable(hit.x, hit.z)) return;
    walkTarget = hit;
    if (!indoors) ripple(hit.x, hit.z, 0xffffff, 0.6, 0.45);
  }

  canvas.addEventListener('wheel', function (e) {
    e.preventDefault();
    cam.dist = THREE.MathUtils.clamp(cam.dist * (1 + e.deltaY * 0.001), indoors ? 5 : 6, indoors ? 10 : 26);
  }, { passive: false });

  // ---------- Every frame ----------
  function updatePlayer(dt) {
    var forward = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
    var side = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
    // Movement is relative to where the camera is looking
    var mx = -Math.sin(cam.yaw) * forward + Math.cos(cam.yaw) * side;
    var mz = -Math.cos(cam.yaw) * forward - Math.sin(cam.yaw) * side;

    if (mx === 0 && mz === 0 && walkTarget) {
      mx = walkTarget.x - player.position.x;
      mz = walkTarget.z - player.position.z;
      if (Math.hypot(mx, mz) < 0.15) { walkTarget = null; mx = 0; mz = 0; }
    }

    var moving = mx !== 0 || mz !== 0;
    if (moving) {
      var len = Math.hypot(mx, mz);
      mx /= len; mz /= len;
      var beforeX = player.position.x, beforeZ = player.position.z;
      player.position.x += mx * SPEED * dt;
      player.position.z += mz * SPEED * dt;

      if (indoors) { // inside the farmhouse or the seed shop: stay between the walls and bump into the furniture
        var rx0 = inBarn ? AB_X : inClinic ? CIN_X : inShop ? SIN_X : IN_X, rz0 = inBarn ? AB_Z : inClinic ? CIN_Z : inShop ? SIN_Z : IN_Z;
        var hw = (inBarn ? AB_W : inClinic ? CIN_W : inShop ? SIN_W : ROOM_W) / 2 - 0.35, hd = (inBarn ? AB_D : inClinic ? CIN_D : inShop ? SIN_D : ROOM_D) / 2 - 0.35;
        player.position.x = Math.max(rx0 - hw, Math.min(rx0 + hw, player.position.x));
        player.position.z = Math.max(rz0 - hd, Math.min(rz0 + hd, player.position.z));
        (inBarn ? abSolids : inClinic ? ciSolids : inShop ? shopInSolids : inSolids).forEach(function (o) {
          var dx = player.position.x - (rx0 + o[0]), dz = player.position.z - (rz0 + o[1]);
          var d = Math.hypot(dx, dz), min = o[2] + 0.35;
          if (d < min && d > 0.0001) {
            player.position.x = rx0 + o[0] + dx / d * min;
            player.position.z = rz0 + o[1] + dz / d * min;
          }
        });
      } else {
      if (!walkable(player.position.x, player.position.z)) {        // stay on the land and the bridge: slide along the edge
        if (walkable(player.position.x, beforeZ)) player.position.z = beforeZ;
        else if (walkable(beforeX, player.position.z)) player.position.x = beforeX;
        else { player.position.x = beforeX; player.position.z = beforeZ; }
      }
      solids.forEach(function (o) {
        var dx = player.position.x - o.x, dz = player.position.z - o.z;
        var d = Math.hypot(dx, dz), min = o.r + 0.35;
        if (d < min && d > 0.0001) {
          player.position.x = o.x + dx / d * min;
          player.position.z = o.z + dz / d * min;
        }
      });
      }
      // No walking on water: slide along the shore instead
      if (!indoors && inLake(player.position.x, player.position.z)) {
        if (!inLake(player.position.x, beforeZ)) player.position.z = beforeZ;
        else if (!inLake(beforeX, player.position.z)) player.position.x = beforeX;
        else { player.position.x = beforeX; player.position.z = beforeZ; }
      }
      // Stop tap-walking if something is in the way
      if (walkTarget && Math.hypot(player.position.x - beforeX, player.position.z - beforeZ) < SPEED * dt * 0.2) walkTarget = null;

      var turn = Math.atan2(mx, mz) - facing;
      turn = Math.atan2(Math.sin(turn), Math.cos(turn));
      facing += turn * Math.min(1, dt * 14);
    }
    player.rotation.y = facing;
    var footY = indoors ? 0 : onDock(player.position.x, player.position.z) ? DOCK_Y : onBridge(player.position.x, player.position.z) ? Math.max(groundHeight(player.position.x, player.position.z), bridgeY(player.position.z)) : onBridge2(player.position.x, player.position.z) ? Math.max(groundHeight(player.position.x, player.position.z), bridgeY(-player.position.x)) : groundHeight(player.position.x, player.position.z) + porchHeight(player.position.x, player.position.z) + shopStepHeight(player.position.x, player.position.z) + clinicStepHeight(player.position.x, player.position.z) + barnRampHeight(player.position.x, player.position.z); // up the porch, shop and clinic steps, the barn's ramp, and over the bridge
    var stepUp = footY - player.position.y;                             // ease up and down steps instead of popping, but snap after a door or a teleport
    player.position.y = Math.abs(stepUp) > 0.5 ? footY : player.position.y + stepUp * Math.min(1, dt * 16);
    body.position.y = moving ? Math.abs(Math.sin(state.time * 11)) * 0.09 : body.position.y * 0.8;
    body.rotation.z = moving ? Math.sin(state.time * 11) * 0.06 : body.rotation.z * 0.8;
    hatStar.rotation.y += dt * 2;
  }

  function updateCrops(dt, night) {
    tiles.forEach(function (tile) {
      if (!tile.crop) return;
      if (tile.wet && tile.wetDay !== farmDay()) {   // 6 am: a crop that was watered yesterday grows a day, then the soil dries out
        setWet(tile, false);
        if (tile.stage < 3) {
          tile.growth = Math.min(GROW_DAYS, tile.growth + 1); // tile.growth counts the watered days so far
          var newStage = STAGE_ON_DAY[tile.growth];
          if (newStage !== tile.stage) {
            tile.stage = newStage;
            showStage(tile);
            burst(tile.x, 0.7, tile.z, tile.stage === 3 ? 0xffb3e6 : 0x9be08a, tile.stage === 3 ? 14 : 6, 1.2, 1.6, -2);
          }
        }
      }
      tile.crop.rotation.z = Math.sin(state.time * 1.6 + tile.x * 1.3 + tile.z) * 0.05;
      tile.drop.visible = !tile.wet && tile.stage < 3;
      tile.drop.position.y = 1 + Math.sin(state.time * 3 + tile.x) * 0.08;
    });
    M.petal.emissiveIntensity = 0.3 + night * 0.6 + Math.sin(state.time * 3) * 0.1;
    cropPetalMat.emissiveIntensity = 0.2 + night * 0.5 + Math.sin(state.time * 3) * 0.08; // moonblooms glow brighter at night
    cropGlowMat.opacity = 0.3 + night * 0.4;
  }

  function updateWorld(dt, night) {
    var t = state.time;

    // Dawn Tree glow and mana
    var pulse = 0.5 + Math.sin(t * 2) * 0.5;
    updateDawnTree(dt, t, night, pulse);
    groundPetalMat.emissiveIntensity = 0.35 + night * 0.65 + Math.sin(t * 1.5) * 0.06; // the fallen petals glow, brighter at night
    petalGlowMat.opacity = 0.18 + night * 0.35 + Math.sin(t * 2.3) * 0.05;
    updateFallingPetals(dt, t);
    updateHouse(dt, t, night);
    var sp = sparkles.geometry.attributes.position;
    for (var i = 0; i < 40; i++) {
      var a = i * 2.4 + t * (0.3 + (i % 5) * 0.12), r = 1.6 + (i % 7) * 0.4;
      sp.setXYZ(i, Math.cos(a) * r, 1 + (i % 9) * 0.7 + Math.sin(t * 1.5 + i) * 0.3, Math.sin(a) * r);
    }
    sp.needsUpdate = true;

    var inZone = dist(player.position.x, player.position.z, TREE_X, TREE_Z) < TREE_ZONE;
    state.inTreeZone = inZone;
    var manaBefore = state.mana;
    state.mana = Math.min(MAX_MANA, state.mana + (inZone ? 32 : 1.5) * dt);
    if (inZone && manaBefore < MAX_MANA) {                          // the Dawn Tree is filling you up
      manaFillSound(state.mana / MAX_MANA, dt);
      if (state.mana >= MAX_MANA) manaFullSound();
    } else manaChimeT = 0;
    ui.mana.style.width = (state.mana / MAX_MANA * 100).toFixed(1) + '%';
    var manaText = Math.floor(state.mana + 0.001) + ' / ' + MAX_MANA;   // the number under the bar, like 65 / 100
    if (ui.manaNum && ui.manaNum.textContent !== manaText) ui.manaNum.textContent = manaText;

    // Lake: moving water, bobbing lily pads, the odd ripple
    waterUniforms.uTime.value = t;
    waterUniforms.uNight.value = night;
    waterUniforms.uSky.value.copy(scene.background);
    waterUniforms.uSunDir.value.copy(sun.position).sub(sun.target.position).normalize();
    waterUniforms.uSunColor.value.copy(sun.color).multiplyScalar(sun.intensity);
    lilyPads.forEach(function (pad, n) {
      pad.position.y = WATER_Y + 0.01 + Math.sin(t * 1.4 + n * 1.3) * 0.008;
      pad.rotation.y += dt * 0.02 * (n % 2 ? 1 : -1);
    });
    globeMat.emissiveIntensity = 0.4 + night * 1.4;
    dockLights.forEach(function (glow) { glow.intensity = night * 1.3; });
    boat.position.y = BOAT_Y + Math.sin(t * 1.3) * 0.02; // the boat gently bobs and rocks
    boat.rotation.z = Math.sin(t * 1.1) * 0.03;
    boat.rotation.x = Math.sin(t * 0.9 + 1) * 0.02;
    updateFish(dt, t, night); // magical fish swim, glow and leap
    updateTrees(dt);          // chopped trees fall, stumps wait, and new trees grow back
    forestTime.value = t;     // trees sway in the breeze
    lilyFlowers.forEach(function (flower, n) {
      flower.position.y = WATER_Y + 0.03 + Math.sin(t * 1.4 + n * 2.1) * 0.008;
      flower.rotation.y += dt * 0.05;
    });
    rippleTimer -= dt;
    if (rippleTimer <= 0) {
      rippleTimer = 0.6 + Math.random() * 0.9;
      var re = lakeEdge(Math.random() * Math.PI * 2, 0, ISLAND - 1.3), rf = Math.random() * 0.7;
      var rpx = LAKE_X + re.x * rf, rpz = LAKE_Z + re.z * rf;
      if (groundHeight(rpx, rpz) < WATER_Y - 0.1) ripple(rpx, rpz, 0xffffff, 0.9, 1.6);
    }

    // Fireflies come out at night: they drift lazily, bob up and down, and blink on and off
    fireflies.visible = fireflyCores.visible = night > 0.02;
    if (fireflies.visible) {
      var fp = fireflies.geometry.attributes.position, fc = fireflies.geometry.attributes.color;
      var cp = fireflyCores.geometry.attributes.position, cc = fireflyCores.geometry.attributes.color;
      flyHome.forEach(function (h, n) {
        var fx = h.x + Math.sin(t * 0.31 + h.p) * 1.2 + Math.sin(t * 0.83 + h.p * 3) * 0.35;
        var fz = h.z + Math.cos(t * 0.27 + h.p * 1.7) * 1.2 + Math.cos(t * 0.71 + h.p * 2) * 0.35;
        var fy = Math.max(0.25, h.y + Math.sin(t * 0.9 + h.p * 2) * 0.4 + Math.sin(t * 2.3 + h.p) * 0.08);
        var blink = Math.pow(Math.max(0, Math.sin(t * (0.9 + (h.p % 1) * 0.8) + h.p * 5)), 3); // glows up, then fades out
        var b = Math.min(1, night * 1.4) * (0.1 + blink * 0.9);
        var tint = FLY_TINTS[n % 7 === 6 ? 4 + (n % 2) : n % 4];
        fp.setXYZ(n, fx, fy, fz);
        cp.setXYZ(n, fx, fy, fz);
        fc.setXYZ(n, tint.r * b, tint.g * b, tint.b * b);
        cc.setXYZ(n, (tint.r + 1) * 0.5 * b, (tint.g + 1) * 0.5 * b, (tint.b + 1) * 0.5 * b);
      });
      fp.needsUpdate = fc.needsUpdate = cp.needsUpdate = cc.needsUpdate = true;
    }

    // Highlight the tile in front of you
    var tile = targetTile();
    if (tile && !tile.soil && heldItem() !== 'hoe') tile = null; // on plain grass, only show where you'd dig when you're holding the hoe
    cursor.visible = !!tile;
    if (tile) {
      cursor.position.x = tile.x;
      cursor.position.z = tile.z;
      cursor.material.opacity = 0.45 + Math.sin(t * 5) * 0.25;
      cursor.material.color.set(tile.crop && tile.stage === 3 ? 0xffb3e6 : tile.crop && !tile.wet ? 0x8ec5ff : 0xffffff);
    }
  }

  var spellTime = 0;
  function updateEffects(dt) {
    spellTime += dt;
    updateSpellSparks(dt, spellTime);
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        scene.remove(p.mesh);
        p.mesh.material.dispose();
        particles.splice(i, 1);
        continue;
      }
      p.vel.y += p.gravity * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.material.opacity = p.life / p.max;
    }
    for (var j = waves.length - 1; j >= 0; j--) {
      var w = waves[j];
      w.life -= dt;
      if (w.life <= 0) {
        scene.remove(w.mesh);
        w.mesh.material.dispose();
        waves.splice(j, 1);
        continue;
      }
      var k = 1 - w.life / w.max;
      w.mesh.scale.setScalar(0.2 + k * w.size);
      w.mesh.material.opacity = (1 - k) * 0.9;
    }
  }

  var camGoal = new THREE.Vector3();
  function updateCamera(dt) {
    camGoal.set(player.position.x, 0.8, player.position.z);
    cam.target.lerp(camGoal, 1 - Math.exp(-dt * 6));
    var flat = Math.cos(cam.pitch) * cam.dist;
    camera.position.set(
      cam.target.x + Math.sin(cam.yaw) * flat,
      cam.target.y + Math.sin(cam.pitch) * cam.dist,
      cam.target.z + Math.cos(cam.yaw) * flat
    );
    camera.lookAt(cam.target);
  }

  // ---------- Saving and loading ----------
  // Your game is kept in this browser (localStorage): your bag, the time and day, mana, harvests,
  // the garden, which trees, bushes and rocks are cut down and when, and where you're standing
  var SAVE_KEY = 'everdawn-save-1';
  function saveGame() {
    var px = player.position.x, pz = player.position.z;
    if (indoors) { px = OUT_DOOR_X; pz = OUT_DOOR_Z + 1.0; }          // saved inside the house? you'll load in at the front door
    if (inShop) { var so = shopFront(2.0); px = so.x; pz = so.z; }    // saved inside the shop? you'll load in outside its door
    if (inClinic) { var co = clinicFront(2.3); px = co.x; pz = co.z; } // and the same for the clinic
    if (inBarn) { var bo = animalFront(1.6); px = bo.x; pz = bo.z; }  // and Fluff & Feather
    var data = {
      v: 1,
      state: { mana: state.mana, stamina: state.stamina, harvest: state.harvest, coins: state.coins, minutes: state.minutes, day: state.day, petalDay: state.petalDay },
      bag: bag, selectedSlot: selectedSlot, hotRow: hotRow,
      player: { x: px, z: pz, facing: facing },
      shipBin: shipBin,
      farm: tiles.filter(function (t) { return t.soil; }).map(function (t) { return { c: t.c, r: t.r, crop: !!t.crop, stage: t.stage || 0, growth: t.growth || 0, wet: !!t.wet }; }),
      scenery: allScenery.map(function (t) {                          // when each tree or bush was cut (null = standing)
        var u = t.userData;
        if (u.state === 'standing' || u.gone) return null;
        return u.state === 'regrowing' ? u.felledAt : gameMinutes();
      }),
      rocks: mineable.map(function (r) { return r.state === 'whole' || r.gone ? null : (r.state === 'regrowing' ? r.brokeAt : gameMinutes()); })
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      showToast('Game saved ✦');
    } catch (err) {
      showToast('Could not save here (this browser blocks saving)', 3000);
    }
  }
  function clearTile(tile) {
    if (tile.crop) { scene.remove(tile.crop); tile.crop = null; }
    if (tile.drop) { scene.remove(tile.drop); tile.drop = null; }
    if (tile.soil) { scene.remove(tile.soil); tile.soil = null; uncoverGrass(tile); }
    var ti = tilling.indexOf(tile);
    if (ti >= 0) tilling.splice(ti, 1);
    tile.wet = false; tile.stage = 0; tile.growth = 0;
  }
  function setSceneryCut(t, cutAt) {                                  // puts a tree or bush back to standing, or cut down at a given time
    var u = t.userData;
    if (u.gone) return;                                               // cleared for the path: it stays gone
    if (u.proxy) { scene.remove(u.proxy); u.proxy = null; }           // tidy away a tree that was mid-fall
    if (u.stump) { scene.remove(u.stump); u.stump = null; }
    u.shudderT = undefined;
    if (cutAt === null) {
      u.state = 'standing'; u.hits = 0; u.solid.r = u.solidR; u.grassHidden = false;
      setTreeGrowth(t, 1);
      showHiddenGrass(u.solid, false);
    } else {
      u.state = 'regrowing'; u.felledAt = cutAt; u.shownK = -1; u.grassHidden = false; u.hits = 0;
      u.solid.r = 0;
      setTreeGrowth(t, 0);
      showHiddenGrass(u.solid, true);
    }
  }
  function setRockBroken(r, brokeAt) {
    if (r.gone) return;                                               // cleared for the path: it stays gone
    r.shakeT = undefined;
    if (brokeAt === null) {
      r.state = 'whole'; r.hits = 0; r.solid.r = r.solidR;
      setRock(r, 1);
      showHiddenGrass(r.solid, false);
    } else {
      r.state = 'regrowing'; r.brokeAt = brokeAt; r.shownK = -1; r.grassHidden = false; r.hits = 0;
      r.solid.r = 0;
      setRock(r, 0);
      showHiddenGrass(r.solid, true);
    }
  }
  function loadGame() {
    var data = null;
    try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (err) { data = null; }
    if (!data || data.v !== 1) { showToast('No saved game yet', 2200); return; }
    // the clock, mana and harvests
    state.mana = data.state.mana; state.harvest = data.state.harvest;
    state.stamina = data.state.stamina === undefined ? MAX_STAMINA : Math.min(MAX_STAMINA, data.state.stamina);
    state.minutes = data.state.minutes; state.day = data.state.day; state.petalDay = data.state.petalDay;
    state.coins = data.state.coins || 0; showCoins(false);
    shipBin = data.shipBin || []; lastFarmDay = farmDay(); closeBin();
    // your bag
    for (var i = 0; i < BAG_SLOTS; i++) bag[i] = data.bag[i] ? { id: data.bag[i].id, count: data.bag[i].count } : null;
    selectedSlot = data.selectedSlot; hotRow = data.hotRow || 0;
    renderBag();
    // the garden
    tiles.forEach(clearTile);
    var farm = data.farm;
    if (!farm && data.tiles) {                                        // a save from before the whole island was farm land: just the garden
      farm = [];
      data.tiles.forEach(function (st, n) { if (st) { st.c = n % COLS - COLS / 2; st.r = Math.floor(n / COLS) - ROWS / 2; farm.push(st); } });
    }
    (farm || []).forEach(function (st) {
      var tile = tileByKey(st.c, st.r);
      buildSoil(tile, false);
      if (st.crop) {
        tile.crop = makeCrop(tile);
        tile.stage = st.stage; tile.growth = Math.max(Math.floor(st.growth), [0, 1, 3, 4][st.stage]); // older saves counted growth differently
        showStage(tile);
        tile.drop = place(new THREE.Mesh(dropGeo, M.drop), tile.x, 1, tile.z);
      }
      setWet(tile, st.wet);
    });
    // trees, bushes and rocks
    allScenery.forEach(function (t, n) { setSceneryCut(t, data.scenery[n] === undefined ? null : data.scenery[n]); });
    mineable.forEach(function (r, n) { setRockBroken(r, data.rocks[n] === undefined ? null : data.rocks[n]); });
    tiles.forEach(function (tile) { if (tile.soil) coverGrass(tile); }); // grass stays tucked under your soil
    flushDirty();
    // and you: back outside if you were in the house, standing where you saved
    if (indoors) {
      indoors = false;
      inShop = false;
      inClinic = false;
      inBarn = false;
      scene.add(player);
      if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
    }
    walkTarget = null;
    doorArmed = false;                                                // don't walk straight into the house if you saved by the door
    player.position.set(data.player.x, 0, data.player.z);
    facing = data.player.facing;
    cam.target.set(player.position.x, 0.8, player.position.z);
    popSound();
    showToast('Game loaded ✦');
  }
  document.getElementById('btnSave').addEventListener('click', function () { saveGame(); focusGame(); });
  document.getElementById('btnLoad').addEventListener('click', function () { loadGame(); focusGame(); });

  // Full screen: the game fills the whole screen. Where the browser allows it (computers, Android, iPad) it also hides
  // the browser bars; on iPhone it fills the browser window instead
  var btnFull = document.getElementById('btnFull');
  function realFullscreen() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function setFullScreen(on) {
    document.body.classList.toggle('full', on);
    btnFull.innerHTML = on ? '✕ Exit full screen <kbd>F</kbd>' : '⛶ Full screen <kbd>F</kbd>';
    var root = document.documentElement;
    try {
      if (on && !realFullscreen()) {
        var ask = root.requestFullscreen || root.webkitRequestFullscreen;
        if (ask) { var asked = ask.call(root); if (asked && asked.catch) asked.catch(function () {}); }
      } else if (!on && realFullscreen()) {
        var leave = document.exitFullscreen || document.webkitExitFullscreen;
        if (leave) { var left = leave.call(document); if (left && left.catch) left.catch(function () {}); }
      }
    } catch (err) { /* the browser said no: the game still fills the window */ }
    setTimeout(resize, 50);
  }
  function fullscreenChanged() { if (!realFullscreen() && document.body.classList.contains('full')) setFullScreen(false); } // pressed Esc
  document.addEventListener('fullscreenchange', fullscreenChanged);
  document.addEventListener('webkitfullscreenchange', fullscreenChanged);
  btnFull.addEventListener('click', function () { setFullScreen(!document.body.classList.contains('full')); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'KeyF' && !e.repeat) setFullScreen(!document.body.classList.contains('full')); });

  // Only draw what you can see: every batch of grass, leaves, flowers and stones gets a sphere round all its pieces, and
  // each frame a batch that's off screen, or so far off it's lost in the haze, is skipped. Batches whose pieces move
  // (a tree regrowing, soil being tilled) get their sphere worked out again. Indoors everything stays on, so the
  // windows still show the whole island
  var cullList = [], cullFrustum = new THREE.Frustum(), cullPV = new THREE.Matrix4(), cullM = new THREE.Matrix4(), cullV = new THREE.Vector3(), cullBox = new THREE.Box3(), cullWasIndoors = null;
  function cullMeasure(c) {
    var o = c.o; o.updateMatrixWorld(true); cullBox.makeEmpty();
    for (var i = 0; i < o.count; i++) { o.getMatrixAt(i, cullM); cullV.setFromMatrixPosition(cullM).applyMatrix4(o.matrixWorld); cullBox.expandByPoint(cullV); }
    if (cullBox.isEmpty()) { c.r = -1; return; }
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    cullBox.getBoundingSphere(c.s);
    c.s.radius += o.geometry.boundingSphere.radius * 2 + 1;            // room for each piece's own size
    c.ver = o.instanceMatrix.version; c.cnt = o.count;
  }
  scene.traverse(function (o) { if (o.isInstancedMesh) cullList.push({ o: o, s: new THREE.Sphere(), ver: -1, cnt: -1, far: o.geometry.boundingSphere && o.geometry.boundingSphere.radius > 1 ? 120 : 80 }); });
  cullList.forEach(function (c) { if (!c.o.geometry.boundingSphere) c.o.geometry.computeBoundingSphere(); c.far = c.o.geometry.boundingSphere.radius > 1 ? 120 : 80; cullMeasure(c); });
  var cullTurn = 0;
  function cullScene() {
    if (indoors) {                                                     // inside: put everything back on
      if (cullWasIndoors !== true) { for (var a = 0; a < cullList.length; a++) cullList[a].o.layers.set(0); cullWasIndoors = true; }
      return;
    }
    cullWasIndoors = false;
    camera.updateMatrixWorld();
    cullPV.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    cullFrustum.setFromProjectionMatrix(cullPV);
    var redo = 0;
    for (var i = 0; i < cullList.length; i++) {
      var c = cullList[i];
      if ((c.ver !== c.o.instanceMatrix.version || c.cnt !== c.o.count) && redo < 2 && (i + cullTurn) % 3 === 0) { cullMeasure(c); redo++; }   // re-measure a few changed batches a frame
      var show = c.r !== -1 && cullFrustum.intersectsSphere(c.s) && c.s.center.distanceTo(camera.position) - c.s.radius < c.far;
      c.o.layers.set(show ? 0 : 1);
    }
    cullTurn++;
  }
  setTimeout(function () { if (!mapBase) mapBase = drawMapBase(); }, 2500);   // get the world map ready in the background, so it opens straight away

  var clock = new THREE.Clock();
  cam.target.set(player.position.x, 0.8, player.position.z);

  function frame() {
    var dt = Math.min(clock.getDelta(), 0.05);
    state.time += dt;
    updateClock(dt);
    var night = updateSky();
    updatePlayer(dt);
    updateDoors();
    updateSleepButton();
    updateStamina();
    updateShipping(dt);
    updateShop(dt);
    updateBarnShop();
    updateBridge(state.time, night);
    updateInterior(dt, state.time);
    updateCrops(dt, night);
    updateWorld(dt, night);
    updateEffects(dt);
    updateCamera(dt);
    updateClinicInterior(state.time);
    cullScene();
    var menuUp = (bagUi.box && !bagUi.box.hidden) || binOpen || shopOpen || barnShopOpen;   // a menu is open: in full screen the button column steps aside, so taps on the menu don't land on the buttons behind it
    if (document.body.classList.contains('menu-open') !== menuUp) document.body.classList.toggle('menu-open', menuUp);
    if (inShop) { camera.updateMatrixWorld(); drawShopView(); }
    if (inClinic) { camera.updateMatrixWorld(); drawClinicView(); }
    if (inBarn) { camera.updateMatrixWorld(); drawBarnView(); }
    renderer.render(indoors ? (inBarn ? abScene : inClinic ? clinicScene : inShop ? shopScene : interiorScene) : scene, camera); // inside the house, the shop or the clinic, only that room is drawn
  }
  renderer.setAnimationLoop(frame);

});

// ---------- Starting up ----------
// Join the three parts back into one game (so they all share the same variables, just as if they were one file) and run it
function startGame(THREE) {
  if (EVERDAWN_PARTS.length !== 3) { showToast('Part of the game is missing: check that script.js, script2.js and script3.js are all there.', 60000); return; }
  var src = EVERDAWN_PARTS.map(function (part) { var t = part.toString(); return t.slice(t.indexOf('{') + 1, t.lastIndexOf('}')); }).join('\n');
  new Function('THREE', src)(THREE);
}

(function () {
  if (window.THREE) { startGame(window.THREE); return; }
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = function () { startGame(window.THREE); };
  s.onerror = function () { showToast('Could not load the 3D engine. Check your internet connection.', 60000); };
  document.head.appendChild(s);
})();
