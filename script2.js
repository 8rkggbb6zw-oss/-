// Everdawn, part 2 of 2 (see the note at the top of script.js)

EVERDAWN_PARTS.push(function (THREE) {
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
  // ---------- More detail for the barn's walls and floor ----------
  // The walls are repainted in finer detail: every board its own shade, with tight grain, knots and splits, rusty nail
  // streaks, water stains and dust darkening toward the floor, and a bump map that sinks the gaps between boards. Up
  // high, cobwebs in the corners; over the doorway, lucky horseshoes; and an old tin feed sign on the side wall.
  // The floor gets wide worn boards with cut nails, dark gaps, scuffs and stains and a paler path down the middle, and
  // real loose straws lying on it
  (function () {                                                     // (kept to itself, so its names can't clash)
    function canvasOf(w, h, paint) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv.getContext('2d'), w, h); return cv; }
    function R(n) { return isle2Hash(n * 1.618 + 7000); }
    // the wall boards: 10 boards across a 2 m tile
    function wallPaint(g, w, h, bump) {
      var bw = w / 10;
      for (var b = 0; b < 10; b++) {
        var x0 = b * bw, l = 34 + R(b * 3.3) * 14, hue = 24 + R(b * 5.1) * 10, sat = 36 + R(b * 7.7) * 14;
        if (bump) { g.fillStyle = '#9a9a9a'; g.fillRect(x0, 0, bw, h); }
        else {
          var bg = g.createLinearGradient(x0, 0, x0 + bw, 0);
          bg.addColorStop(0, 'hsl(' + hue + ',' + sat + '%,' + (l - 8) + '%)'); bg.addColorStop(0.12, 'hsl(' + hue + ',' + sat + '%,' + l + '%)');
          bg.addColorStop(0.88, 'hsl(' + hue + ',' + sat + '%,' + (l - 2) + '%)'); bg.addColorStop(1, 'hsl(' + hue + ',' + sat + '%,' + (l - 11) + '%)');
          g.fillStyle = bg; g.fillRect(x0, 0, bw, h);
        }
        for (var k = 0; k < 34; k++) {                                 // fine grain, wandering down the board
          var gx = x0 + 4 + R(b * 31 + k * 1.3) * (bw - 8), dark = R(k * 2.7 + b) > 0.4;
          g.strokeStyle = bump ? (dark ? 'rgba(60,60,60,0.35)' : 'rgba(200,200,200,0.2)') : (dark ? 'rgba(55,28,10,' + (0.06 + R(k * 7 + b) * 0.14) + ')' : 'rgba(255,215,160,' + (0.04 + R(k * 7 + b) * 0.07) + ')');
          g.lineWidth = 0.5 + R(k * 3 + b) * 1.4;
          g.beginPath(); g.moveTo(gx, 0);
          for (var y = 0; y <= h; y += 24) g.lineTo(gx + Math.sin(y * 0.012 + k * 1.7 + b) * 3 + Math.sin(y * 0.041 + k) * 1.2, y);
          g.stroke();
        }
        for (var kn = 0; kn < 2; kn++) if (R(b * 9.7 + kn * 3) > 0.45) {   // knots, with the grain swirling round them
          var kx = x0 + bw * (0.25 + R(b * 4.4 + kn) * 0.5), ky = R(b * 6.6 + kn * 5) * h, kr = 5 + R(b * 8.8 + kn) * 7;
          for (var rr = 6; rr > 0; rr--) { g.strokeStyle = bump ? 'rgba(80,80,80,0.3)' : 'rgba(70,35,12,' + (0.08 + rr * 0.04) + ')'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(kx, ky, kr + rr * 3.5, kr * 1.7 + rr * 8, 0, 0, Math.PI * 2); g.stroke(); }
          var kg = g.createRadialGradient(kx, ky, 0, kx, ky, kr); kg.addColorStop(0, bump ? '#303030' : '#24120a'); kg.addColorStop(1, bump ? 'rgba(80,80,80,0.5)' : 'rgba(60,30,10,0.6)');
          g.fillStyle = kg; g.beginPath(); g.ellipse(kx, ky, kr, kr * 1.5, 0, 0, Math.PI * 2); g.fill();
        }
        if (R(b * 12.1) > 0.6) {                                       // a split running along the grain
          var sx = x0 + bw * (0.3 + R(b * 13) * 0.4), sy = R(b * 14) * h * 0.7;
          g.strokeStyle = bump ? '#202020' : 'rgba(20,8,2,0.75)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(sx, sy);
          for (var sp = 1; sp < 8; sp++) g.lineTo(sx + (R(sp + b) - 0.5) * 3, sy + sp * 14);
          g.stroke();
        }
        if (!bump) {
          for (var sm = 0; sm < 60; sm++) { g.fillStyle = 'rgba(255,235,200,' + R(sm * 3 + b) * 0.06 + ')'; g.fillRect(x0 + R(sm + b * 11) * bw, R(sm * 5 + b) * h, 1, 4 + R(sm * 7) * 14); }   // saw marks
          [0.24, 0.76].forEach(function (ny) {                         // nails into the girts behind, each weeping a little rust
            [0.3, 0.7].forEach(function (nx) {
              var cx = x0 + bw * nx, cy = h * ny, st = g.createLinearGradient(cx, cy, cx, cy + 40);
              st.addColorStop(0, 'rgba(120,55,20,0.45)'); st.addColorStop(1, 'rgba(120,55,20,0)'); g.fillStyle = st; g.fillRect(cx - 2, cy, 4, 40);
              g.fillStyle = '#1c1816'; g.beginPath(); g.arc(cx, cy, 3, 0, Math.PI * 2); g.fill();
              g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(cx - 0.8, cy - 0.8, 1.2, 0, Math.PI * 2); g.fill();
            });
          });
        } else {
          [0.24, 0.76].forEach(function (ny) { [0.3, 0.7].forEach(function (nx) { g.fillStyle = '#e0e0e0'; g.beginPath(); g.arc(x0 + bw * nx, h * ny, 3, 0, Math.PI * 2); g.fill(); }); });
        }
        g.fillStyle = bump ? '#000000' : 'rgba(14,6,2,0.9)'; g.fillRect(x0, 0, 4, h);   // the gap between boards
        if (!bump) { g.fillStyle = 'rgba(255,220,170,0.12)'; g.fillRect(x0 + 4, 0, 2, h); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x0 + bw - 3, 0, 3, h); }
      }
      if (!bump) {
        for (var ws = 0; ws < 5; ws++) {                               // old water stains, drip-shaped
          var wx = R(ws * 4.3 + 50) * w, wy = R(ws * 5.9 + 50) * h * 0.6, wg = g.createLinearGradient(0, wy, 0, wy + 220);
          wg.addColorStop(0, 'rgba(40,25,12,0)'); wg.addColorStop(0.3, 'rgba(40,25,12,0.16)'); wg.addColorStop(1, 'rgba(40,25,12,0)');
          g.fillStyle = wg; g.beginPath(); g.ellipse(wx, wy + 110, 16 + R(ws) * 20, 110, 0, 0, Math.PI * 2); g.fill();
        }
      }
    }
    var wallCv = canvasOf(1024, 1024, function (g, w, h) { wallPaint(g, w, h, false); });
    var wallBumpCv = canvasOf(512, 512, function (g, w, h) { wallPaint(g, w, h, true); });
    for (var wn in abWalls) abWalls[wn].g.traverse(function (o) {
      var m = o.material;
      if (!m || !m.map || m.map.image !== abPlankTex.image) return;
      m.map.image = wallCv; m.map.anisotropy = renderer.capabilities.getMaxAnisotropy(); m.map.needsUpdate = true;
      var bt = new THREE.CanvasTexture(wallBumpCv); bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.copy(m.map.repeat);
      m.bumpMap = bt; m.bumpScale = 0.035;
      m.needsUpdate = true;
    });
    // and a dusty shadow along the foot of each wall
    var footCv = canvasOf(8, 64, function (g, w, h) { var fg = g.createLinearGradient(0, 0, 0, h); fg.addColorStop(0, 'rgba(30,18,8,0)'); fg.addColorStop(1, 'rgba(30,18,8,0.55)'); g.fillStyle = fg; g.fillRect(0, 0, w, h); });
    var footMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(footCv), transparent: true, depthWrite: false });
    ['N', 'S', 'E', 'W'].forEach(function (wn2) {
      var len = wn2 === 'N' || wn2 === 'S' ? AB_W : AB_D;
      var segs = wn2 === 'S' ? [[-len / 2, -AB_DOOR_W / 2], [AB_DOOR_W / 2, len / 2]] : [[-len / 2, len / 2]];
      segs.forEach(function (sg) { abWallPart(wn2, new THREE.PlaneGeometry(sg[1] - sg[0], 0.5), footMat, (sg[0] + sg[1]) / 2, 0.51, 0.045).castShadow = false; });
    });
    // cobwebs in the top corners and over a window
    var webCv = canvasOf(256, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(240,240,240,0.55)'; g.lineWidth = 1;
      var spokes = 9;
      var ox = w / 2;                                                  // the web fans down from the middle of its top edge
      for (var s = 0; s < spokes; s++) { var a = 0.15 + s / (spokes - 1) * (Math.PI - 0.3); g.beginPath(); g.moveTo(ox, 0); g.lineTo(ox + Math.cos(a) * w * 0.5, Math.sin(a) * h); g.stroke(); }
      for (var r = 14; r < h; r += 14 + R(r) * 8) {
        g.beginPath();
        for (var s2 = 0; s2 < spokes; s2++) { var a2 = 0.15 + s2 / (spokes - 1) * (Math.PI - 0.3), rr2 = r * (0.92 + R(r + s2) * 0.12), px = ox + Math.cos(a2) * rr2 * 0.5 * w / h, py = Math.sin(a2) * rr2; if (s2) g.lineTo(px, py - 3); else g.moveTo(px, py); }
        g.stroke();
      }
      g.strokeStyle = 'rgba(240,240,240,0.25)'; for (var t = 0; t < 5; t++) { g.beginPath(); g.moveTo(ox + (R(t) - 0.5) * w * 0.6, R(t * 3) * h * 0.3); g.quadraticCurveTo(ox, h * 0.7, ox + (R(t * 5) - 0.5) * w * 0.4, h * (0.6 + R(t * 7) * 0.4)); g.stroke(); }   // stray strands
    });
    var webMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(webCv), transparent: true, depthWrite: false, side: THREE.DoubleSide });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c, k) {     // in each top corner, across the angle
      var web = abPart(new THREE.PlaneGeometry(0.7, 0.5), webMat, c[0] * (AB_W / 2 - 0.3), AB_H - 0.47, c[1] * (AB_D / 2 - 0.3), 0, Math.atan2(-c[0], -c[1]), 0);
      web.castShadow = false; web.renderOrder = 4;
    });
    var winWeb = abWallPart('E', new THREE.PlaneGeometry(0.3, 0.24), webMat, 2.6 + 0.3, AB_WIN_Y + 0.34, 0.07, 0, 0, -0.5); winWeb.castShadow = false;
    // three lucky horseshoes nailed over the doorway, points up
    var shoeMat = new THREE.MeshStandardMaterial({ color: 0x6a6a70, roughness: 0.55, metalness: 0.6 });
    [-0.45, 0, 0.45].forEach(function (hx, k) {
      var shoe = abWallPart('S', new THREE.TorusGeometry(0.07, 0.014, 6, 20, Math.PI * 1.5), shoeMat, hx, AB_DOOR_H + 0.13, 0.215, 0, 0, Math.PI * 0.25 + Math.PI);
      shoe.scale.set(1, 1.15, 0.6);
      for (var n = 0; n < 4; n++) { var na = Math.PI * 1.25 + (n - 1.5) * 0.7; abWallPart('S', new THREE.CylinderGeometry(0.005, 0.005, 0.012, 6), AB.iron, hx + Math.cos(na) * 0.07, AB_DOOR_H + 0.13 + Math.sin(na) * 0.08, 0.225, Math.PI / 2, 0, 0); }
    });
    // an old enamelled tin sign on the side wall, rusting at the edges
    var signCv = canvasOf(256, 160, function (g, w, h) {
      g.fillStyle = '#2f5a3a'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#e8c870'; g.lineWidth = 5; g.strokeRect(10, 10, w - 20, h - 20);
      g.fillStyle = '#f2e6c4'; g.textAlign = 'center'; g.font = 'bold 30px Georgia, serif'; g.fillText('HAPPY HENS', w / 2, 56);
      g.font = 'italic 17px Georgia, serif'; g.fillText('lay golden eggs', w / 2, 84);
      g.fillStyle = '#e8c870'; g.font = 'bold 15px Georgia, serif'; g.fillText('FLUFF & FEATHER FEEDS', w / 2, 120);
      for (var i = 0; i < 160; i++) {                                  // rust and chipped enamel, worst at the edges
        var ex = R(i * 2.3 + 90) * w, ey = R(i * 3.1 + 90) * h, edge = Math.min(ex, w - ex, ey, h - ey);
        if (edge > 26 && R(i * 4.7) > 0.15) continue;
        g.fillStyle = R(i) > 0.5 ? 'rgba(130,60,25,0.75)' : 'rgba(90,40,18,0.6)'; g.beginPath(); g.ellipse(ex, ey, 2 + R(i * 5.3) * 6, 1.5 + R(i * 6.1) * 4, R(i) * 3, 0, Math.PI * 2); g.fill();
      }
    });
    var tinSign = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(signCv), roughness: 0.45, metalness: 0.3 });
    var sg = new THREE.PlaneGeometry(0.5, 0.31, 6, 3), sgp = sg.attributes.position;
    for (var v = 0; v < sgp.count; v++) sgp.setZ(v, Math.sin(sgp.getX(v) * 9) * 0.004 + (isle2Hash(v) - 0.5) * 0.003);   // a bit wavy and dented
    sg.computeVertexNormals();
    abWallPart('E', sg, tinSign, -1.68, 1.65, 0.012);
    [[-0.23, 0.14], [0.23, 0.14], [-0.23, -0.14], [0.23, -0.14]].forEach(function (p) { abWallPart('E', new THREE.CylinderGeometry(0.006, 0.006, 0.006, 6), AB.iron, -1.68 + p[0], 1.65 + p[1], 0.018, Math.PI / 2, 0, 0); });
    // the floor: wide worn boards with cut nails, dark gaps, scuffs, stains and a paler path, with a bump map
    var FPPM = 128, FW = Math.round(AB_W * FPPM), FH = Math.round(AB_D * FPPM);
    function floorPaint(g, w, h, bump) {
      var bw = 0.24 * FPPM;
      for (var c = 0; c * bw < w; c++) {
        var y = -R(c * 7.7 + 300) * 2 * FPPM, n = 0;
        while (y < h) {
          var bl = (1.6 + R(c * 3.1 + n * 1.9 + 300) * 2.4) * FPPM, l = 28 + R(c * 5.3 + n * 2.3) * 13, hue = 24 + R(c * 2.9 + n * 3.7) * 10;
          g.fillStyle = bump ? '#9a9a9a' : 'hsl(' + hue + ',' + (24 + R(c + n * 5) * 12) + '%,' + l + '%)'; g.fillRect(c * bw, y, bw, bl);
          for (var k = 0; k < 16; k++) {
            var gx = c * bw + 3 + R(c * 13 + n * 5 + k) * (bw - 6), dk = R(k + c + n) > 0.45;
            g.strokeStyle = bump ? (dk ? 'rgba(60,60,60,0.3)' : 'rgba(210,210,210,0.2)') : (dk ? 'rgba(40,20,8,' + (0.08 + R(k * 3 + c) * 0.14) + ')' : 'rgba(255,220,170,' + (0.03 + R(k * 5 + c) * 0.06) + ')');
            g.lineWidth = 0.6 + R(k * 9 + n) * 1.3;
            g.beginPath(); g.moveTo(gx, y); g.bezierCurveTo(gx + (R(k * 11 + c) - 0.5) * 8, y + bl * 0.33, gx + (R(k * 13 + c) - 0.5) * 8, y + bl * 0.66, gx + (R(k * 17 + c) - 0.5) * 6, y + bl); g.stroke();
          }
          if (R(c * 19 + n * 7) > 0.55) {                              // a knot
            var kx = c * bw + bw * (0.3 + R(c + n) * 0.4), ky = y + bl * R(c * 3 + n * 9);
            g.fillStyle = bump ? '#404040' : 'rgba(40,18,6,0.8)'; g.beginPath(); g.ellipse(kx, ky, 4, 7, 0, 0, Math.PI * 2); g.fill();
            g.strokeStyle = bump ? 'rgba(70,70,70,0.4)' : 'rgba(50,24,8,0.3)'; g.lineWidth = 1; for (var kr = 1; kr < 4; kr++) { g.beginPath(); g.ellipse(kx, ky, 4 + kr * 3, 7 + kr * 7, 0, 0, Math.PI * 2); g.stroke(); }
          }
          g.fillStyle = bump ? '#000' : 'rgba(12,6,2,0.85)'; g.fillRect(c * bw, y, bw, 3);   // the butt joint, with square cut nails each side
          g.fillStyle = bump ? '#e0e0e0' : '#1a1614';
          [0.28, 0.72].forEach(function (nx) { g.fillRect(c * bw + bw * nx - 2, y + 7, 4, 3); g.fillRect(c * bw + bw * nx - 2, y - 9, 4, 3); });
          if (!bump) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(c * bw + 3, y + 3, bw - 6, 2); }
          y += bl; n++;
        }
        g.fillStyle = bump ? '#000' : 'rgba(10,5,2,0.8)'; g.fillRect(c * bw, 0, 3, h);   // the gap, packed with dirt
      }
      if (bump) return;
      var aisle = g.createLinearGradient(1.9 * FPPM, 0, 7.4 * FPPM, 0);   // the aisle, worn paler by boots
      aisle.addColorStop(0, 'rgba(235,210,165,0)'); aisle.addColorStop(0.45, 'rgba(235,210,165,0.14)'); aisle.addColorStop(1, 'rgba(235,210,165,0)');
      g.fillStyle = aisle; g.fillRect(0, 0, w, h);
      var door = g.createRadialGradient(w / 2, h, 10, w / 2, h, 2.2 * FPPM);   // and darker where muddy boots come in
      door.addColorStop(0, 'rgba(50,32,16,0.3)'); door.addColorStop(1, 'rgba(50,32,16,0)'); g.fillStyle = door; g.fillRect(0, h - 2.2 * FPPM, w, 2.2 * FPPM);
      for (var d = 0; d < 26; d++) {                                   // stains: water rings, an old oil spill
        var dx = R(d * 3.3 + 40) * w, dy = R(d * 4.1 + 40) * h, dr = 18 + R(d) * 60, dg2 = g.createRadialGradient(dx, dy, dr * 0.3, dx, dy, dr);
        dg2.addColorStop(0, 'rgba(30,18,8,' + (0.08 + R(d * 5) * 0.12) + ')'); dg2.addColorStop(0.85, 'rgba(30,18,8,0.05)'); dg2.addColorStop(1, 'rgba(30,18,8,0)');
        g.fillStyle = dg2; g.beginPath(); g.ellipse(dx, dy, dr, dr * (0.6 + R(d * 7) * 0.4), R(d * 9) * 3, 0, Math.PI * 2); g.fill();
      }
      for (var sc = 0; sc < 140; sc++) {                               // scuffs and scrapes
        var sx = R(sc * 2.1 + 500) * w, sy = R(sc * 3.7 + 500) * h, sa = R(sc * 5.3) * Math.PI;
        g.strokeStyle = 'rgba(' + (R(sc) > 0.5 ? '230,200,160' : '30,15,5') + ',' + (0.06 + R(sc * 7) * 0.1) + ')'; g.lineWidth = 1 + R(sc * 9) * 2;
        g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(sa) * (10 + R(sc * 11) * 30), sy + Math.sin(sa) * (10 + R(sc * 11) * 30)); g.stroke();
      }
      for (var i = 0; i < 2600; i++) {                                 // fine chaff, thickest near the stalls and walls
        var px = R(i * 1.31 + 7) * w, py = R(i * 2.17 + 7) * h, near = px < 1.9 * FPPM || px > w - 0.9 * FPPM || py < 0.9 * FPPM;
        if (!near && R(i * 3.7) > 0.3) continue;
        var a = R(i * 5.3) * Math.PI * 2, len = 4 + R(i * 7.1) * 14;
        g.strokeStyle = 'hsl(' + (40 + R(i * 9) * 10) + ',' + (45 + R(i * 11) * 20) + '%,' + (48 + R(i * 13) * 22) + '%)';
        g.lineWidth = 0.8 + R(i * 15) * 1;
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len); g.stroke();
      }
    }
    var floorTex = new THREE.CanvasTexture(canvasOf(FW, FH, function (g, w, h) { floorPaint(g, w, h, false); }));
    floorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var floorBump = new THREE.CanvasTexture(canvasOf(FW / 2, FH / 2, function (g, w, h) { g.scale(0.5, 0.5); floorPaint(g, w * 2, h * 2, true); }));
    AB.floor.map = floorTex; AB.floor.bumpMap = floorBump; AB.floor.bumpScale = 0.025; AB.floor.roughness = 0.82; AB.floor.needsUpdate = true;
    // loose straws lying on the floor, gathered along the stall fronts, the walls, the doorway and round the hay
    var n = 900, im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.004, 0.003, 1, 3), hayWispMat, n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), scl = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color();
    var spots = [[-2.2 + 0.25, 0, 0.35, 4.8], [AB_W / 2 - 0.7, -3.3, 0.6, 1.2], [0, AB_D / 2 - 0.5, 1.4, 0.4], [AB_W / 2 - 0.5, 1.0, 0.4, 3.2], [1.0, 0, 3.0, 4.5]];
    for (var i2 = 0; i2 < n; i2++) {
      var sp2 = spots[i2 < 250 ? 0 : i2 < 380 ? 1 : i2 < 470 ? 2 : i2 < 560 ? 3 : 4];
      var fx = sp2[0] + (R(i2 * 2.3) - 0.5) * 2 * sp2[2], fz = sp2[1] + (R(i2 * 3.9) - 0.5) * 2 * sp2[3];
      if (fx > -1.45 && fx < 1.45 && fz > -4.05 && fz < -3.15) continue;   // (not under the counter)
      e.set(Math.PI / 2 + (R(i2 * 5.1) - 0.5) * 0.25, R(i2 * 6.7) * 6.3, (R(i2 * 7.3) - 0.5) * 0.25); q.setFromEuler(e);
      scl.set(1, 0.06 + R(i2 * 8.9) * 0.12, 1); pos.set(fx, 0.004 + R(i2 * 9.7) * 0.008, fz);
      m.compose(pos, q, scl); im.setMatrixAt(i2, m);
      im.setColorAt(i2, col.setHSL(0.11 + R(i2 * 11) * 0.03, 0.5, 0.45 + R(i2 * 13) * 0.25));
    }
    im.receiveShadow = true; abRoom.add(im);
  })();

  // shelves in the back corner: two thick planks with rounded fronts on wrought-iron scroll brackets. Below: painted
  // feed tins with labels and knobbed lids, and mason jars of seed, grit and sunflower seeds, one with a tag; an oil can.
  // Above: a stack of folded wool blankets (one fringed), a wicker basket of wool yarn with knitting needles, a brass
  // cowbell on its leather strap and a pot of ivy trailing over the edge. Hooks under the bottom shelf hold a grooming
  // brush, a curry comb, a hoof pick and a coiled lead rope
  (function () {                                                     // (kept to itself, so its names can't clash)
    var SX = -2.85, SW = 1.3, SD = 0.32, wall = abWalls.N.g;
    function wp(geo, mat, x, y, z, rx, ry, rz) { return abWallPart('N', geo, mat, x, y, z, rx, ry, rz); }
    function grp(x, y, z, rx, ry, rz) { var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rx || 0, ry || 0, rz || 0); wall.add(g); return g; }
    var shBoard = new THREE.MeshStandardMaterial({ map: abPlankTex.clone(), color: 0xe0c49c, roughness: 0.7 }); shBoard.map.needsUpdate = true; shBoard.map.repeat.set(0.25, 0.6); shBoard.map.rotation = Math.PI / 2;
    var shIron = new THREE.MeshStandardMaterial({ color: 0x1e1e24, roughness: 0.45, metalness: 0.5 });
    [1.15, 1.75].forEach(function (sy) {
      wp(new THREE.BoxGeometry(SW, 0.045, SD - 0.02), shBoard, SX, sy, (SD - 0.02) / 2);               // the plank,
      wp(new THREE.CylinderGeometry(0.0225, 0.0225, SW, 12), shBoard, SX, sy, SD - 0.02, 0, 0, Math.PI / 2);   // its rounded front
      [-0.5, 0.5].forEach(function (bx) {                              // wrought-iron brackets: an L with a scroll in the corner
        var b = grp(SX + bx, sy - 0.0225, 0);
        abPart(new THREE.BoxGeometry(0.018, 0.012, 0.24), shIron, 0, -0.006, 0.12, 0, 0, 0, b);
        abPart(new THREE.BoxGeometry(0.018, 0.22, 0.012), shIron, 0, -0.11, 0.006, 0, 0, 0, b);
        abPart(new THREE.TorusGeometry(0.075, 0.006, 6, 18, Math.PI / 2), shIron, 0, -0.088, 0.088, 0, Math.PI / 2, Math.PI, b);   // the brace curve
        abPart(new THREE.TorusGeometry(0.025, 0.005, 6, 14, Math.PI * 1.6), shIron, 0, -0.04, 0.05, 0, Math.PI / 2, 0.4, b);       // a little curl
        abPart(new THREE.SphereGeometry(0.012, 8, 6), shIron, 0, -0.012, 0.235, 0, 0, 0, b);
        [-0.06, -0.18].forEach(function (s) { abPart(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 8), shIron, 0, s, 0.014, Math.PI / 2, 0, 0, b); });   // screws into the wall
      });
    });
    var LO = 1.15 + 0.0225, HI = 1.75 + 0.0225;                        // the tops of the two shelves
    // feed tins: painted, with paper labels, pressed rings, a lid with a knob, and a few rust spots
    function tinLabel(name, sub, col) {
      return paintTexture(256, 64, function (g, w, h) {
        g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h);
        g.fillStyle = col; g.fillRect(0, 0, w, 6); g.fillRect(0, h - 6, w, 6);
        g.textAlign = 'center'; g.fillStyle = col; g.font = 'bold 22px Georgia, serif'; g.fillText(name, w / 2, 32);
        g.font = 'italic 12px Georgia, serif'; g.fillStyle = '#5a4a3a'; g.fillText(sub, w / 2, 50);
        for (var i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,90,50,' + isle2Hash(i * 3.1 + name.length) * 0.15 + ')'; g.fillRect(isle2Hash(i * 1.7) * w, isle2Hash(i * 2.3) * h, 3, 2); }   // a bit grubby
      });
    }
    [[-3.36, 0xa83a30, '#a83a30', 'CHICK', 'starter crumbs', 0.19], [-3.13, 0x3a6a4a, '#3a6a4a', 'OATS', 'rolled · fresh', 0.21], [-2.9, 0x2f4a6a, '#2f4a6a', 'MINERALS', 'for healthy hooves', 0.17]].forEach(function (tn, k) {
      var paint = new THREE.MeshStandardMaterial({ color: tn[1], roughness: 0.35, metalness: 0.35 }), h = tn[5], x = tn[0], z = 0.15;
      wp(new THREE.CylinderGeometry(0.08, 0.08, h, 24), paint, x, LO + h / 2, z);
      wp(new THREE.CylinderGeometry(0.0808, 0.0808, h * 0.45, 24, 1, true, Math.PI * 0.2, Math.PI * 1.6), new THREE.MeshStandardMaterial({ map: tinLabel(tn[3], tn[4], tn[2]), roughness: 0.85 }), x, LO + h * 0.5, z, 0, Math.PI, 0);
      [0.08, h - 0.03].forEach(function (ry) { wp(new THREE.TorusGeometry(0.0805, 0.003, 4, 24), paint, x, LO + ry, z, Math.PI / 2, 0, 0); });   // pressed rings
      wp(new THREE.CylinderGeometry(0.084, 0.084, 0.022, 24), AB.zinc, x, LO + h + 0.008, z);                       // the lid,
      wp(new THREE.CylinderGeometry(0.012, 0.016, 0.018, 12), shIron, x, LO + h + 0.028, z);                        // its knob
      for (var r = 0; r < 4; r++) { var ra = isle2Hash(k * 9 + r) * 6.3; wp(new THREE.CircleGeometry(0.006 + isle2Hash(r + k) * 0.006, 8), new THREE.MeshStandardMaterial({ color: 0x7a3a1a, roughness: 1 }), x + Math.sin(ra) * 0.0812, LO + 0.02 + isle2Hash(r * 7 + k) * (h - 0.04), z + Math.cos(ra) * 0.0812, 0, ra, 0).castShadow = false; }   // rust spots
    });
    // mason jars: thick glass with a threaded neck, a zinc band and lid, filled with seed, grit and sunflower seeds
    var jarFill = [
      paintTexture(64, 64, function (g, w, h) { g.fillStyle = '#d8b060'; g.fillRect(0, 0, w, h); for (var i = 0; i < 300; i++) { g.fillStyle = isle2Hash(i) > 0.5 ? '#f0d080' : '#a88040'; g.fillRect(isle2Hash(i * 2.1) * w, isle2Hash(i * 3.7) * h, 2, 2); } }),
      paintTexture(64, 64, function (g, w, h) { g.fillStyle = '#9a948a'; g.fillRect(0, 0, w, h); for (var i = 0; i < 300; i++) { g.fillStyle = ['#c8c4bc', '#6a665e', '#b0a898'][i % 3]; g.fillRect(isle2Hash(i * 2.3) * w, isle2Hash(i * 3.1) * h, 2 + isle2Hash(i) * 2, 2); } }),
      paintTexture(64, 64, function (g, w, h) { g.fillStyle = '#3a3430'; g.fillRect(0, 0, w, h); for (var i = 0; i < 90; i++) { var x = isle2Hash(i * 2.9) * w, y = isle2Hash(i * 3.3) * h; g.fillStyle = '#ece4d4'; g.fillRect(x, y, 2, 5); g.fillStyle = '#2a2420'; g.fillRect(x + 1, y, 1, 5); } })
    ];
    var jarGlass = new THREE.MeshStandardMaterial({ color: 0xdff0ec, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.3, depthWrite: false });
    [-2.62, -2.47, -2.32].forEach(function (jx, k) {
      var jh = 0.15 - k * 0.01;
      wp(new THREE.CylinderGeometry(0.044, 0.044, jh * 0.8, 14), new THREE.MeshStandardMaterial({ map: jarFill[k], roughness: 1 }), jx, LO + 0.005 + jh * 0.4, 0.15);   // what's in it
      var pts = []; [[0.0, 0], [0.048, 0.002], [0.052, 0.015], [0.052, jh - 0.03], [0.04, jh - 0.012], [0.04, jh]].forEach(function (p) { pts.push(new THREE.Vector2(p[0], p[1])); });
      wp(new THREE.LatheGeometry(pts, 20), jarGlass, jx, LO, 0.15).renderOrder = 2;
      for (var t = 0; t < 2; t++) wp(new THREE.TorusGeometry(0.041, 0.002, 4, 18), jarGlass, jx, LO + jh - 0.008 - t * 0.006, 0.15, Math.PI / 2, 0, 0);   // the threads
      wp(new THREE.CylinderGeometry(0.045, 0.045, 0.016, 18, 1, true), AB.zinc, jx, LO + jh + 0.004, 0.15);         // the band,
      wp(new THREE.CylinderGeometry(0.044, 0.044, 0.004, 18), new THREE.MeshStandardMaterial({ color: 0xc8a050, roughness: 0.4, metalness: 0.5 }), jx, LO + jh + 0.012, 0.15);   // and a brass lid
    });
    var tagTex = paintTexture(64, 32, function (g, w, h) { g.fillStyle = '#efe4c8'; g.fillRect(0, 0, w, h); g.fillStyle = '#5a3a2a'; g.font = 'italic 13px Georgia, serif'; g.textAlign = 'center'; g.fillText('grit', w / 2, 21); });
    wp(new THREE.PlaneGeometry(0.04, 0.022), new THREE.MeshStandardMaterial({ map: tagTex, roughness: 0.9, side: THREE.DoubleSide }), -2.47 + 0.02, LO + 0.11, 0.2, 0, 0.2, 0.3).castShadow = false;   // a paper tag
    wp(new THREE.TorusGeometry(0.042, 0.0015, 4, 18), hayTwineMat, -2.47, LO + 0.125, 0.15, Math.PI / 2, 0, 0);
    // a little oil can with a long spout
    var oc = grp(-2.82, LO, 0.13, 0, 0.5, 0);
    abPart(new THREE.CylinderGeometry(0.035, 0.045, 0.05, 16), new THREE.MeshStandardMaterial({ color: 0xb83a2a, roughness: 0.4, metalness: 0.4 }), 0, 0.025, 0, 0, 0, 0, oc);
    abPart(new THREE.ConeGeometry(0.035, 0.04, 16), AB.zinc, 0, 0.07, 0, 0, 0, 0, oc);
    abPart(new THREE.CylinderGeometry(0.003, 0.005, 0.12, 6), AB.zinc, 0.03, 0.12, 0, 0, 0, -0.5, oc);
    abPart(new THREE.TorusGeometry(0.02, 0.004, 4, 10, Math.PI), AB.zinc, -0.045, 0.035, 0, 0, 0, Math.PI / 2, oc);
    // the top shelf: folded wool blankets, the bottom one fringed, with their folds showing
    var wool = ['#a83a30', '#4a6a9a', '#e8dcc0'].map(function (c, k) {
      return paintTexture(64, 64, function (g, w, h) {
        g.fillStyle = c; g.fillRect(0, 0, w, h);
        g.fillStyle = 'rgba(0,0,0,0.18)'; for (var y = 0; y < h; y += 16) g.fillRect(0, y, w, 3);   // woven stripes
        if (k === 1) { g.fillStyle = 'rgba(255,255,255,0.35)'; for (var x = 0; x < w; x += 16) g.fillRect(x, 0, 2, h); }
        for (var i = 0; i < 200; i++) { g.fillStyle = 'rgba(255,255,255,' + isle2Hash(i * 1.3 + k) * 0.08 + ')'; g.fillRect(isle2Hash(i * 2.1 + k) * w, isle2Hash(i * 3.7 + k) * h, 2, 1); }
      });
    });
    [0, 1, 2].forEach(function (k) {
      var by = HI + 0.035 + k * 0.068, bm = new THREE.MeshStandardMaterial({ map: wool[k], roughness: 1 });
      wp(ciRoundBox(0.4 - k * 0.02, 0.064, 0.26, 0.03), bm, -3.17 + (isle2Hash(k) - 0.5) * 0.02, by, 0.15, 0, (isle2Hash(k * 3) - 0.5) * 0.08, 0);
      wp(new THREE.BoxGeometry(0.38 - k * 0.02, 0.003, 0.262), new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }), -3.17, by, 0.15).castShadow = false;   // the fold line
    });
    for (var fr = 0; fr < 18; fr++) wp(new THREE.CylinderGeometry(0.003, 0.003, 0.04, 4), new THREE.MeshStandardMaterial({ color: 0x8a2a24, roughness: 1 }), -3.36 + fr * 0.022, HI + 0.015, 0.285, 0.15, 0, 0).castShadow = false;   // a fringe hanging over the edge
    // a wicker basket of yarn, with knitting needles stuck in
    var bk = grp(-2.52, HI, 0.15, 0, 0.3, 0);
    var wick = new THREE.MeshStandardMaterial({ map: siWickerTex, color: 0xd8b070, roughness: 0.95, side: THREE.DoubleSide });
    abPart(new THREE.CylinderGeometry(0.15, 0.115, 0.15, 24, 1, true), wick, 0, 0.075, 0, 0, 0, 0, bk);
    abPart(new THREE.CircleGeometry(0.115, 24), wick, 0, 0.004, 0, -Math.PI / 2, 0, 0, bk);
    abPart(new THREE.TorusGeometry(0.15, 0.012, 6, 28), new THREE.MeshStandardMaterial({ map: siWickerTex, color: 0xb88a50, roughness: 0.95 }), 0, 0.15, 0, Math.PI / 2, 0, 0, bk);   // the rim
    var hdl = new THREE.TorusGeometry(0.15, 0.01, 6, 24, Math.PI); abPart(hdl, new THREE.MeshStandardMaterial({ color: 0xb88a50, roughness: 0.9 }), 0, 0.15, 0, 0, 0, 0, bk);
    for (var hw = 0; hw < 12; hw++) { var ha = hw / 11 * Math.PI; abPart(new THREE.TorusGeometry(0.012, 0.004, 4, 8), new THREE.MeshStandardMaterial({ color: 0xa87840, roughness: 0.9 }), Math.cos(ha) * 0.15, 0.15 + Math.sin(ha) * 0.15, 0, 0, Math.PI / 2, ha, bk); }   // its wrapping
    [[0.05, 0.13, 0.03, 0xf2c14e], [-0.05, 0.13, -0.02, 0xc89aff], [0.0, 0.15, 0.06, 0xf2f0e8], [-0.04, 0.14, 0.07, 0x8ac8a0], [0.06, 0.15, -0.06, 0xe08a9a]].forEach(function (y, k) {   // balls of wool
      var ball = abPart(new THREE.SphereGeometry(0.045, 14, 10), new THREE.MeshStandardMaterial({ color: y[3], roughness: 1 }), y[0], y[1], y[2], 0, 0, 0, bk);
      for (var s = 0; s < 4; s++) abPart(new THREE.TorusGeometry(0.045, 0.002, 4, 20), new THREE.MeshStandardMaterial({ color: y[3], roughness: 1 }), 0, 0, 0, isle2Hash(s + k * 4) * 3, isle2Hash(s * 3 + k) * 3, 0, ball);   // wound strands
    });
    [-1, 1].forEach(function (s) { abPart(new THREE.CylinderGeometry(0.003, 0.003, 0.24, 6), new THREE.MeshStandardMaterial({ color: 0xc89a60, roughness: 0.5 }), s * 0.012, 0.25, 0.03, 0.3 * s, 0, 0.35, bk); abPart(new THREE.SphereGeometry(0.008, 8, 6), new THREE.MeshStandardMaterial({ color: 0xc8506a, roughness: 0.5 }), s * 0.012 - 0.04, 0.36, 0.03 + s * 0.035, 0, 0, 0, bk); });   // needles
    // a brass cowbell on a leather strap
    var cb = grp(-2.27, HI, 0.13, 0, -0.4, 0);
    var cbPts = []; [[0.0, 0.0], [0.035, 0.0], [0.04, 0.012], [0.032, 0.07], [0.022, 0.085], [0.0, 0.088]].forEach(function (p) { cbPts.push(new THREE.Vector2(p[0], p[1])); });
    var bellG = new THREE.LatheGeometry(cbPts, 4); bellG.rotateY(Math.PI / 4); bellG.scale(1, 1, 0.7);
    abPart(bellG, new THREE.MeshStandardMaterial({ color: 0xd8a848, emissive: 0x5a3e0c, emissiveIntensity: 0.3, metalness: 0.55, roughness: 0.35, side: THREE.DoubleSide }), 0, 0.0, 0, Math.PI, 0, 0, cb).position.y = 0.088;
    abPart(new THREE.TorusGeometry(0.012, 0.004, 6, 12), shIron, 0, 0.096, 0, 0, 0, 0, cb);
    var strap = new THREE.CatmullRomCurve3([V3(0, 0.1, 0), V3(0.05, 0.11, 0.02), V3(0.1, 0.02, 0.05), V3(0.05, 0.004, 0.1), V3(-0.05, 0.004, 0.08)]);
    abPart(new THREE.TubeGeometry(strap, 20, 0.008, 4), AB.leather, 0, 0, 0, 0, 0, 0, cb);
    abPart(new THREE.BoxGeometry(0.024, 0.006, 0.02), AB.brass, 0.1, 0.022, 0.05, 0, 0.5, 0, cb);   // its buckle
    // a terracotta pot of ivy trailing over the front edge
    var ivyX = -2.2, ivyZ = 0.16;
    var potPts = []; [[0, 0], [0.04, 0], [0.05, 0.08], [0.058, 0.085], [0.058, 0.1], [0.05, 0.1]].forEach(function (p) { potPts.push(new THREE.Vector2(p[0], p[1])); });
    wp(new THREE.LatheGeometry(potPts, 18), new THREE.MeshStandardMaterial({ color: 0xb8643a, roughness: 0.9, side: THREE.DoubleSide }), ivyX, HI, ivyZ);
    wp(new THREE.CircleGeometry(0.048, 16), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 }), ivyX, HI + 0.09, ivyZ, -Math.PI / 2, 0, 0);
    var ivyLeaf = new THREE.Shape(); ivyLeaf.moveTo(0, 0); ivyLeaf.lineTo(0.012, 0.008); ivyLeaf.lineTo(0.016, 0.02); ivyLeaf.lineTo(0.006, 0.018); ivyLeaf.lineTo(0, 0.03); ivyLeaf.lineTo(-0.006, 0.018); ivyLeaf.lineTo(-0.016, 0.02); ivyLeaf.lineTo(-0.012, 0.008); ivyLeaf.lineTo(0, 0);
    var ivyGeo = new THREE.ShapeGeometry(ivyLeaf), ivyMats = [0x3a6a32, 0x4a7a3a, 0x2f5a2a].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, side: THREE.DoubleSide }); });
    [[0, 1], [0.6, 1.2], [-0.5, 0.8], [1.2, 0.6], [2.4, 0.5], [3.4, 0.4]].forEach(function (vn, k) {   // trailing strands, some spilling down over the front
      var ang = vn[0], len = vn[1], pts = [], down = k < 3;
      for (var t = 0; t <= 6; t++) { var f = t / 6; pts.push(V3(ivyX + Math.sin(ang) * (0.04 + f * 0.12), HI + 0.09 + (down ? (f < 0.4 ? 0.03 : -(f - 0.4) * len * 0.5) : 0.03 + f * 0.04), ivyZ + Math.cos(ang) * (0.04 + f * (down ? 0.16 : 0.08)))); }
      var cv = new THREE.CatmullRomCurve3(pts);
      wp(new THREE.TubeGeometry(cv, 16, 0.0015, 4), ivyMats[0]);
      for (var lf = 1; lf <= 7; lf++) { var p = cv.getPoint(lf / 7.5); wp(ivyGeo, ivyMats[(lf + k) % 3], p.x, p.y, p.z, -0.6 + isle2Hash(lf + k * 7) * 1.2, isle2Hash(lf * 3 + k) * 6.3, isle2Hash(lf * 5 + k) * 0.8 - 0.4).castShadow = false; }
    });
    // hooks under the bottom shelf, hung with grooming tools and a lead rope
    var HY = 1.15 - 0.0225;
    [-3.35, -3.05, -2.7, -2.4].forEach(function (hx, k) {
      wp(new THREE.BoxGeometry(0.02, 0.01, 0.03), shIron, hx, HY - 0.005, 0.27);
      var hk = new THREE.CatmullRomCurve3([V3(hx, HY - 0.01, 0.27), V3(hx, HY - 0.05, 0.27), V3(hx, HY - 0.07, 0.29), V3(hx, HY - 0.06, 0.31)]);
      wp(new THREE.TubeGeometry(hk, 8, 0.004, 5), shIron);
      var hy = HY - 0.065;
      if (k === 0) {                                                   // a grooming brush on a leather loop
        wp(new THREE.TorusGeometry(0.02, 0.003, 4, 10), AB.leather, hx, hy - 0.015, 0.29, 0, 0, 0);
        wp(ciRoundBox(0.12, 0.035, 0.05, 0.012), new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.5 }), hx, hy - 0.06, 0.29, 0, 0, Math.PI / 2);
        wp(new THREE.BoxGeometry(0.03, 0.11, 0.04), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 }), hx + 0.03, hy - 0.06, 0.29);
      } else if (k === 1) {                                            // a rubber curry comb with rings of teeth
        var cc = grp(hx, hy - 0.065, 0.3, Math.PI / 2, 0, 0);
        abPart(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 20), new THREE.MeshStandardMaterial({ color: 0xc83a3a, roughness: 0.7 }), 0, 0, 0, 0, 0, 0, cc).scale.set(1, 1, 0.75);
        [0.035, 0.022].forEach(function (rr) { abPart(new THREE.TorusGeometry(rr, 0.004, 4, 18), new THREE.MeshStandardMaterial({ color: 0xa82a2a, roughness: 0.7 }), 0, -0.012, 0, Math.PI / 2, 0, 0, cc).scale.set(1, 0.75, 1); });
        abPart(new THREE.TorusGeometry(0.03, 0.006, 4, 12, Math.PI), new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.8 }), 0, 0.012, 0, -Math.PI / 2, 0, 0, cc);
      } else if (k === 2) {                                            // a hoof pick
        wp(new THREE.CylinderGeometry(0.008, 0.01, 0.09, 8), new THREE.MeshStandardMaterial({ color: 0x2f6a54, roughness: 0.5 }), hx, hy - 0.05, 0.29);
        wp(new THREE.TorusGeometry(0.008, 0.002, 4, 8), shIron, hx, hy - 0.002, 0.29, 0, 0, 0);
        var pk = new THREE.CatmullRomCurve3([V3(hx, hy - 0.095, 0.29), V3(hx, hy - 0.12, 0.29), V3(hx + 0.02, hy - 0.13, 0.29), V3(hx + 0.03, hy - 0.12, 0.29)]);
        wp(new THREE.TubeGeometry(pk, 8, 0.003, 5), AB.zinc);
      } else {                                                         // a lead rope, coiled, with a brass snap
        wp(new THREE.TorusGeometry(0.07, 0.008, 6, 20), AB.rope, hx, hy - 0.06, 0.3, 0.1, 0, 0);
        wp(new THREE.TorusGeometry(0.065, 0.008, 6, 20), AB.rope, hx + 0.01, hy - 0.065, 0.305, 0.2, 0.15, 0.1);
        wp(new THREE.CylinderGeometry(0.009, 0.009, 0.08, 6), AB.rope, hx + 0.03, hy - 0.16, 0.31);
        wp(new THREE.BoxGeometry(0.014, 0.04, 0.008), AB.brass, hx + 0.03, hy - 0.215, 0.31);
      }
    });
  })();
  abSolids.push([-2.85, ANW + 0.2, 0.35], [-3.35, ANW + 0.2, 0.35]);

  // the counter: barn-red planked panels in a cream frame with X braces, just like the barn outside, under a polished
  // butcher-block top with a rounded front edge, with a toe kick, a brass foot rail and a little welcome plaque. On
  // top: a brass service bell and its card, a jar of bone-shaped treats, a thick ledger lying open with brass corners,
  // an ink bottle and feather quill, a pinstriped cash tin with a stack of Star Coins, kraft paper bags, a receipt
  // spike and a jug of daisies and lavender. A stool behind. Step up to it to see what's for sale
  var ABC_X = 0, ABC_Z = -3.6, ABC_W = 2.6, ABC_D = 0.7, ABC_H = 1.0;
  (function () {                                                     // (everything on it is kept to itself, so its names can't clash)
    var ctRedTex = paintTexture(256, 256, function (g, w, h) {           // barn-red boards, worn back to the wood at the edges
      for (var b = 0; b < 4; b++) {
        var x0 = b * w / 4;
        g.fillStyle = 'hsl(' + (4 + isle2Hash(b + 40) * 4) + ',55%,' + (30 + isle2Hash(b * 3 + 40) * 5) + '%)'; g.fillRect(x0, 0, w / 4, h);
        for (var k = 0; k < 10; k++) { g.strokeStyle = 'rgba(40,10,5,' + (0.08 + isle2Hash(k + b * 9) * 0.1) + ')'; g.lineWidth = 1; var gx = x0 + 4 + isle2Hash(k * 3 + b) * (w / 4 - 8); g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx + (isle2Hash(k * 7) - 0.5) * 6, h); g.stroke(); }
        g.fillStyle = 'rgba(20,5,2,0.8)'; g.fillRect(x0, 0, 2, h);
      }
      for (var i = 0; i < 70; i++) {                                     // scuffs where the paint's worn through
        var wx = isle2Hash(i * 1.7 + 70) * w, wy = (i < 40 ? 0.85 + isle2Hash(i * 2.9) * 0.15 : isle2Hash(i * 2.9)) * h;
        g.fillStyle = 'rgba(170,125,80,' + (0.25 + isle2Hash(i * 4.1) * 0.4) + ')'; g.beginPath(); g.ellipse(wx, wy, 2 + isle2Hash(i * 5.3) * 6, 1 + isle2Hash(i * 6.7) * 2, 0, 0, Math.PI * 2); g.fill();
      }
    });
    ctRedTex.wrapS = ctRedTex.wrapT = THREE.RepeatWrapping;
    var ctRed = new THREE.MeshStandardMaterial({ map: ctRedTex, roughness: 0.6 });
    var ctCream = new THREE.MeshStandardMaterial({ color: 0xf1e8d4, roughness: 0.5 });
    var ctStaveTex = paintTexture(512, 128, function (g, w, h) {         // butcher block: glued staves of oak in different shades
      var x = 0, n = 0;
      while (x < w) {
        var sw = 18 + isle2Hash(n * 3.3 + 7) * 20, l = 34 + isle2Hash(n * 5.1 + 7) * 14;
        g.fillStyle = 'hsl(' + (24 + isle2Hash(n * 2.2) * 8) + ',48%,' + l + '%)'; g.fillRect(0, x * h / w * 0, w, 0); g.fillRect(x, 0, sw, h);
        for (var k = 0; k < 6; k++) { g.strokeStyle = 'rgba(60,25,8,' + (0.1 + isle2Hash(k + n * 7) * 0.12) + ')'; g.lineWidth = 0.8; var gx = x + 2 + isle2Hash(k * 5 + n) * (sw - 4); g.beginPath(); g.moveTo(gx, 0); g.bezierCurveTo(gx + 3, h * 0.3, gx - 3, h * 0.7, gx + 1, h); g.stroke(); }
        g.fillStyle = 'rgba(30,12,4,0.5)'; g.fillRect(x, 0, 1, h);
        x += sw; n++;
      }
      var sheen = g.createLinearGradient(0, 0, w, h); sheen.addColorStop(0, 'rgba(255,240,210,0.08)'); sheen.addColorStop(0.5, 'rgba(255,240,210,0)'); sheen.addColorStop(1, 'rgba(255,240,210,0.06)');
      g.fillStyle = sheen; g.fillRect(0, 0, w, h);
      for (var r = 0; r < 14; r++) { g.strokeStyle = 'rgba(40,20,8,0.12)'; g.lineWidth = 1; g.beginPath(); var rx = isle2Hash(r * 9.1) * w, ry = isle2Hash(r * 7.3) * h; g.arc(rx, ry, 8 + isle2Hash(r) * 10, 0, Math.PI * 2); g.stroke(); }   // faint rings from mugs set down
    });
    ctStaveTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var ctTop = new THREE.MeshStandardMaterial({ map: ctStaveTex, roughness: 0.32, metalness: 0.05 });
    var FZ2 = ABC_Z + ABC_D / 2;                                         // the front face
    abPart(new THREE.BoxGeometry(ABC_W - 0.04, 0.09, ABC_D - 0.1), new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.9 }), ABC_X, 0.045, ABC_Z - 0.02);   // the toe kick
    abPart(new THREE.BoxGeometry(ABC_W, ABC_H - 0.16, ABC_D - 0.04), ctRed, ABC_X, 0.09 + (ABC_H - 0.16) / 2, ABC_Z);   // the body
    function ctPanelFace(cx, cz, ry, pw) {                               // one framed panel with an X brace (cx, cz: its middle, ry: which way it faces)
      var g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = ry; abRoom.add(g);
      var tex = ctRedTex.clone(); tex.needsUpdate = true; tex.repeat.set(pw / 0.6, 1);
      abPart(new THREE.BoxGeometry(pw, 0.66, 0.02), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), 0, 0.49, 0.0, 0, 0, 0, g);   // the boards, set back in the frame
      [[0, 0.86, pw + 0.1, 0.08], [0, 0.13, pw + 0.1, 0.08]].forEach(function (f) { abPart(new THREE.BoxGeometry(f[2], f[3], 0.035), ctCream, f[0], f[1], 0.012, 0, 0, 0, g); });
      var ph = 0.64, ln = Math.hypot(pw - 0.04, ph), an = Math.atan2(ph, pw - 0.04);
      abPart(new THREE.BoxGeometry(ln, 0.065, 0.025), ctCream, 0, 0.49, 0.022, 0, 0, an, g);
      abPart(new THREE.BoxGeometry(ln, 0.065, 0.025), ctCream, 0, 0.49, 0.026, 0, 0, -an, g);
      abPart(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 10), AB.iron, 0, 0.49, 0.04, Math.PI / 2, 0, 0, g);   // a bolt where they cross
      return g;
    }
    [-1, 1].forEach(function (s) { ctPanelFace(ABC_X + s * ABC_W / 4, FZ2 + 0.005, 0, ABC_W / 2 - 0.16); });   // the front
    [-1, 1].forEach(function (s) { ctPanelFace(ABC_X + s * (ABC_W / 2 + 0.005), ABC_Z, s * Math.PI / 2, ABC_D - 0.16); });   // and the ends
    [[-1, 1], [1, 1], [-1, -1], [1, -1], [0, 1]].forEach(function (c) { abPart(new THREE.BoxGeometry(c[0] ? 0.09 : 0.08, ABC_H - 0.1, 0.09), ctCream, ABC_X + c[0] * (ABC_W / 2 - 0.02), 0.05 + (ABC_H - 0.1) / 2, ABC_Z + c[1] * (ABC_D / 2 - 0.02)); });   // corner posts and the middle stile
    // the butcher-block top, with a rounded front edge and a cream moulding under it
    abPart(new THREE.BoxGeometry(ABC_W + 0.16, 0.065, ABC_D + 0.12), ctTop, ABC_X, ABC_H - 0.0325, ABC_Z - 0.01);
    abPart(new THREE.CylinderGeometry(0.0325, 0.0325, ABC_W + 0.16, 16), ctTop, ABC_X, ABC_H - 0.0325, ABC_Z + ABC_D / 2 + 0.05, 0, 0, Math.PI / 2);
    abPart(new THREE.BoxGeometry(ABC_W + 0.06, 0.03, 0.04), ctCream, ABC_X, ABC_H - 0.08, FZ2 + 0.02);
    abPart(new THREE.CylinderGeometry(0.012, 0.012, ABC_W + 0.06, 8), ctCream, ABC_X, ABC_H - 0.1, FZ2 + 0.03, 0, 0, Math.PI / 2);
    // a brass foot rail on three brackets
    abPart(new THREE.CylinderGeometry(0.02, 0.02, ABC_W - 0.2, 14), AB.brass, ABC_X, 0.2, FZ2 + 0.16, 0, 0, Math.PI / 2);
    [-1, 1].forEach(function (s) { abPart(new THREE.SphereGeometry(0.026, 12, 8), AB.brass, ABC_X + s * (ABC_W / 2 - 0.1), 0.2, FZ2 + 0.16); });
    [-1.0, 0, 1.0].forEach(function (bx) { abRod(V3(bx, 0.2, FZ2 + 0.16), V3(bx, 0.24, FZ2 + 0.01), 0.008, AB.brass); abPart(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 12), AB.brass, bx, 0.24, FZ2 + 0.01, Math.PI / 2, 0, 0); });
    // a little oval welcome plaque hung on the middle stile
    var ctWelcome = paintTexture(256, 128, function (g, w, h) {
      g.fillStyle = '#efe2c4'; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#2f5a3a'; g.lineWidth = 5; g.beginPath(); g.ellipse(w / 2, h / 2, w / 2 - 10, h / 2 - 10, 0, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#2f5a3a'; g.font = 'italic bold 40px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Welcome!', w / 2, h / 2 - 4);
      g.fillStyle = '#b8862a'; g.font = '16px Georgia, serif'; g.fillText('❀  ❀  ❀', w / 2, h / 2 + 32);
    });
    var plq = abPart(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 32), new THREE.MeshStandardMaterial({ color: 0x8a5a38, roughness: 0.6 }), ABC_X, 0.62, FZ2 + 0.06, Math.PI / 2, 0, 0); plq.scale.set(1.25, 1, 0.75);
    abPart(new THREE.CircleGeometry(0.135, 32), new THREE.MeshStandardMaterial({ map: ctWelcome, roughness: 0.7 }), ABC_X, 0.62, FZ2 + 0.072, 0, 0, 0).scale.set(1.25, 0.75, 1);
    abRod(V3(ABC_X - 0.08, 0.72, FZ2 + 0.06), V3(ABC_X, 0.8, FZ2 + 0.06), 0.003, AB.iron); abRod(V3(ABC_X + 0.08, 0.72, FZ2 + 0.06), V3(ABC_X, 0.8, FZ2 + 0.06), 0.003, AB.iron);
    abPart(new THREE.SphereGeometry(0.01, 8, 6), AB.brass, ABC_X, 0.8, FZ2 + 0.055);
    var ABT = ABC_H;                                                     // the top surface
    var ctPaper = new THREE.MeshStandardMaterial({ color: 0xf6f0e0, roughness: 0.9 });
    // the service bell: a black base, a polished brass dome with a fluted rim, and its plunger; and a card beside it
    var BX = -1.05, BZ = ABC_Z + 0.16;
    abPart(new THREE.CylinderGeometry(0.052, 0.058, 0.02, 24), new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.3, metalness: 0.4 }), BX, ABT + 0.01, BZ);
    var bellMat = new THREE.MeshStandardMaterial({ color: 0xf0c860, emissive: 0x7a5410, emissiveIntensity: 0.35, metalness: 0.55, roughness: 0.28 });
    abPart(new THREE.SphereGeometry(0.046, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), bellMat, BX, ABT + 0.022, BZ);
    abPart(new THREE.TorusGeometry(0.046, 0.004, 6, 24), bellMat, BX, ABT + 0.022, BZ, Math.PI / 2, 0, 0);
    abPart(new THREE.CylinderGeometry(0.005, 0.005, 0.03, 8), bellMat, BX, ABT + 0.08, BZ);
    abPart(new THREE.SphereGeometry(0.011, 10, 8), new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.3 }), BX, ABT + 0.097, BZ);
    var ctCardTex = paintTexture(128, 64, function (g, w, h) {
      g.fillStyle = '#f6f0e0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a3a2a'; g.lineWidth = 2; g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = '#5a3a2a'; g.font = 'italic 15px Georgia, serif'; g.textAlign = 'center'; g.fillText('Ring for', w / 2, 27); g.fillText('service', w / 2, 46);
    });
    var card = new THREE.Group(); card.position.set(BX + 0.16, ABT, BZ - 0.02); card.rotation.y = -0.3; abRoom.add(card);   // a folded tent card
    [-1, 1].forEach(function (s) { abPart(new THREE.PlaneGeometry(0.11, 0.06), s > 0 ? new THREE.MeshStandardMaterial({ map: ctCardTex, roughness: 0.9, side: THREE.DoubleSide }) : ctPaper, 0, 0.028, s * 0.008, -s * 0.28, s > 0 ? 0 : Math.PI, 0, card); });
    // a glass jar of bone-shaped treats: thick glass, a cork lid, and a paper label tied on with twine
    var JX = -0.62, JZ = ABC_Z + 0.08;
    abPart(new THREE.CylinderGeometry(0.075, 0.075, 0.2, 24, 1, true), AB.glass, JX, ABT + 0.1, JZ).renderOrder = 2;
    abPart(new THREE.CylinderGeometry(0.075, 0.075, 0.012, 24), AB.glass, JX, ABT + 0.006, JZ).renderOrder = 2;
    abPart(new THREE.TorusGeometry(0.068, 0.008, 6, 24), AB.glass, JX, ABT + 0.2, JZ, Math.PI / 2, 0, 0).renderOrder = 2;
    abPart(new THREE.CylinderGeometry(0.066, 0.06, 0.04, 20), new THREE.MeshStandardMaterial({ color: 0xb8875a, roughness: 1 }), JX, ABT + 0.215, JZ);
    var treatMat = [0xc89a60, 0xa8743e, 0xd8b078].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }); });
    for (var tb = 0; tb < 16; tb++) {                                    // little dog-bone biscuits, tumbled in
      var bone = new THREE.Group(); bone.position.set(JX + (isle2Hash(tb * 1.3) - 0.5) * 0.09, ABT + 0.025 + Math.floor(tb / 4) * 0.032 + isle2Hash(tb) * 0.01, JZ + (isle2Hash(tb * 2.9) - 0.5) * 0.09); bone.rotation.set(isle2Hash(tb * 3.1) * 3, isle2Hash(tb * 4.7) * 6, isle2Hash(tb * 5.3) * 3); abRoom.add(bone);
      var tm = treatMat[tb % 3];
      abPart(new THREE.BoxGeometry(0.045, 0.012, 0.014), tm, 0, 0, 0, 0, 0, 0, bone);
      [-1, 1].forEach(function (s) { [-1, 1].forEach(function (t) { abPart(new THREE.SphereGeometry(0.009, 6, 5), tm, s * 0.024, 0, t * 0.007, 0, 0, 0, bone); }); });
    }
    var jarLabel = paintTexture(128, 64, function (g, w, h) {
      g.fillStyle = '#efe2c4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#8a3a2a'; g.lineWidth = 3; g.strokeRect(4, 4, w - 8, h - 8);
      g.fillStyle = '#8a3a2a'; g.font = 'bold 22px Georgia, serif'; g.textAlign = 'center'; g.fillText('Treats', w / 2, 30); g.font = 'italic 12px Georgia, serif'; g.fillText('1 star coin each', w / 2, 50);
    });
    abPart(new THREE.CylinderGeometry(0.077, 0.077, 0.06, 24, 1, true, -0.6, 1.2), new THREE.MeshStandardMaterial({ map: jarLabel, roughness: 0.9 }), JX, ABT + 0.1, JZ).castShadow = false;
    abPart(new THREE.TorusGeometry(0.066, 0.003, 4, 24), hayTwineMat, JX, ABT + 0.18, JZ, Math.PI / 2, 0, 0);
    // the ledger: a thick leather book with brass corners lying open, the pages curling up from the spine, a ribbon hanging out
    var LX = -0.05, LZ = ABC_Z + 0.04, LR = 0.1;
    var ledger = new THREE.Group(); ledger.position.set(LX, ABT, LZ); ledger.rotation.y = LR; abRoom.add(ledger);
    [-1, 1].forEach(function (s) {
      abPart(new THREE.BoxGeometry(0.235, 0.012, 0.33), AB.leather, s * 0.12, 0.006, 0, 0, 0, s * 0.03, ledger);          // the covers
      abPart(new THREE.BoxGeometry(0.22, 0.028, 0.31), ctPaper, s * 0.115, 0.024, 0, 0, 0, s * 0.03, ledger);             // the page block
      [-1, 1].forEach(function (t) { abPart(new THREE.BoxGeometry(0.035, 0.014, 0.035), AB.brass, s * 0.215, 0.007, t * 0.15, 0, Math.PI / 4, 0, ledger); });   // brass corners
    });
    var ctPageTex = paintTexture(256, 160, function (g, w, h) {
      g.fillStyle = '#f6f0e0'; g.fillRect(0, 0, w, h);
      var sp = g.createLinearGradient(w / 2 - 20, 0, w / 2 + 20, 0); sp.addColorStop(0, 'rgba(0,0,0,0)'); sp.addColorStop(0.5, 'rgba(60,40,20,0.25)'); sp.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = sp; g.fillRect(w / 2 - 20, 0, 40, h);
      for (var y = 24; y < h - 8; y += 10) { g.fillStyle = 'rgba(80,110,160,0.35)'; g.fillRect(8, y, w / 2 - 22, 1); g.fillRect(w / 2 + 14, y, w / 2 - 22, 1); }
      g.fillStyle = 'rgba(190,60,60,0.5)'; g.fillRect(30, 8, 1, h - 16); g.fillRect(w / 2 + 34, 8, 1, h - 16);
      g.fillStyle = 'rgba(30,30,70,0.8)'; g.font = 'italic 12px Georgia, serif'; g.fillText('Animals for sale', 36, 18);
      ['Glimmerwings ...... 250', 'more coming soon!'].forEach(function (t, k) { g.font = 'italic 9px Georgia, serif'; g.fillText(t, 34, 42 + k * 20); });
      g.font = 'italic 12px Georgia, serif'; g.fillText('Orders', w / 2 + 40, 18);
      g.font = 'italic 9px Georgia, serif'; g.fillText('(none yet)', w / 2 + 40, 42);
    });
    var pageGeo = new THREE.PlaneGeometry(0.44, 0.3, 16, 1), pgp = pageGeo.attributes.position;
    for (var pv = 0; pv < pgp.count; pv++) { var px = pgp.getX(pv); pgp.setZ(pv, Math.sin(Math.min(Math.abs(px) / 0.22, 1) * Math.PI * 0.5) * 0.012 * (1 - Math.abs(px) / 0.22 * 0.5) + (Math.abs(px) < 0.02 ? -0.006 : 0)); }   // curving up from the spine
    pageGeo.computeVertexNormals();
    abPart(pageGeo, new THREE.MeshStandardMaterial({ map: ctPageTex, roughness: 0.9 }), 0, 0.04, 0, -Math.PI / 2, 0, 0, ledger).castShadow = false;
    abPart(new THREE.BoxGeometry(0.012, 0.002, 0.24), new THREE.MeshStandardMaterial({ color: 0xa82a3a, roughness: 0.6 }), 0.005, 0.042, 0.06, 0.15, 0, 0, ledger);   // the ribbon,
    abPart(new THREE.BoxGeometry(0.012, 0.07, 0.002), new THREE.MeshStandardMaterial({ color: 0xa82a3a, roughness: 0.6 }), 0.005, 0.005, 0.178, 0, 0, 0, ledger);   // hanging over the edge
    abPart(new THREE.CylinderGeometry(0.004, 0.004, 0.16, 6), new THREE.MeshStandardMaterial({ color: 0xe8c040, roughness: 0.5 }), 0.12, 0.045, -0.02, Math.PI / 2, 0.6, 0, ledger);   // a pencil lying on it
    abPart(new THREE.ConeGeometry(0.004, 0.015, 6), new THREE.MeshStandardMaterial({ color: 0xe0c8a0, roughness: 0.8 }), 0.12 + Math.sin(0.6) * 0.087, 0.045, -0.02 + Math.cos(0.6) * 0.087, Math.PI / 2, 0.6, 0, ledger);
    // a square ink bottle with a brass cap off beside it, and a white goose-feather quill
    var IX = 0.36, IZ = ABC_Z - 0.12;
    abPart(ciRoundBox(0.06, 0.05, 0.06, 0.008), new THREE.MeshStandardMaterial({ color: 0x223040, roughness: 0.05, metalness: 0.3, transparent: true, opacity: 0.85 }), IX, ABT + 0.025, IZ);
    abPart(new THREE.CylinderGeometry(0.014, 0.016, 0.018, 12), new THREE.MeshStandardMaterial({ color: 0x223040, roughness: 0.05 }), IX, ABT + 0.058, IZ);
    abPart(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 12), AB.brass, IX + 0.06, ABT + 0.008, IZ + 0.03);
    var quillG = new THREE.Group(); quillG.position.set(IX + 0.005, ABT + 0.065, IZ); quillG.rotation.set(0.2, 0.3, -0.42); abRoom.add(quillG);
    abPart(new THREE.CylinderGeometry(0.002, 0.003, 0.24, 6), ctPaper, 0, 0.12, 0, 0, 0, 0, quillG);   // the shaft
    var vane = new THREE.Shape(); vane.moveTo(0, 0); vane.quadraticCurveTo(0.03, 0.05, 0.022, 0.15); vane.quadraticCurveTo(0.01, 0.19, 0, 0.2); vane.quadraticCurveTo(-0.012, 0.15, -0.014, 0.08); vane.quadraticCurveTo(-0.012, 0.03, 0, 0);
    abPart(new THREE.ShapeGeometry(vane, 8), new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.8, side: THREE.DoubleSide }), 0, 0.05, 0, 0, Math.PI / 2, 0, quillG);   // the feather
    for (var qb = 0; qb < 10; qb++) abPart(new THREE.BoxGeometry(0.001, 0.004, 0.02 + isle2Hash(qb) * 0.008), new THREE.MeshStandardMaterial({ color: 0xe8e2d4, roughness: 0.9 }), 0, 0.07 + qb * 0.014, 0.012, -0.5, 0, 0, quillG);   // its barbs, a little ruffled
    // the cash tin: green enamel with a gold pinstripe, a brass lock plate and handle; and a stack of Star Coins
    var ctTinTex = paintTexture(128, 64, function (g, w, h) {
      g.fillStyle = '#2f5a3a'; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#d8b050'; g.lineWidth = 2; g.strokeRect(6, 6, w - 12, h - 12); g.lineWidth = 1; g.strokeRect(10, 10, w - 20, h - 20);
      g.fillStyle = '#d8b050'; g.font = 'italic 11px Georgia, serif'; g.textAlign = 'center'; g.fillText('Fluff & Feather', w / 2, h / 2 + 4);
    });
    var CTX = 0.78, CTZ = ABC_Z - 0.04;
    abPart(ciRoundBox(0.28, 0.1, 0.2, 0.012), new THREE.MeshStandardMaterial({ color: 0x2f5a3a, roughness: 0.3, metalness: 0.45 }), CTX, ABT + 0.05, CTZ);
    abPart(new THREE.PlaneGeometry(0.24, 0.06), new THREE.MeshStandardMaterial({ map: ctTinTex, roughness: 0.35, metalness: 0.3 }), CTX, ABT + 0.05, CTZ + 0.101);
    abPart(new THREE.PlaneGeometry(0.24, 0.16), new THREE.MeshStandardMaterial({ map: ctTinTex, roughness: 0.35, metalness: 0.3 }), CTX, ABT + 0.101, CTZ, -Math.PI / 2, 0, 0);
    abPart(new THREE.BoxGeometry(0.286, 0.006, 0.206), new THREE.MeshStandardMaterial({ color: 0x24472e, roughness: 0.3, metalness: 0.45 }), CTX, ABT + 0.075, CTZ);   // the lid's seam
    abPart(new THREE.BoxGeometry(0.04, 0.035, 0.004), AB.brass, CTX, ABT + 0.07, CTZ + 0.103);
    abPart(new THREE.BoxGeometry(0.004, 0.012, 0.002), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }), CTX, ABT + 0.068, CTZ + 0.106);   // the keyhole
    abPart(new THREE.TorusGeometry(0.035, 0.005, 6, 14, Math.PI), AB.brass, CTX, ABT + 0.102, CTZ);
    [-1, 1].forEach(function (s) { abPart(new THREE.CylinderGeometry(0.008, 0.008, 0.012, 8), AB.brass, CTX + s * 0.035, ABT + 0.104, CTZ); });
    var coinMat = new THREE.MeshStandardMaterial({ color: 0xf6d060, emissive: 0x8a6010, emissiveIntensity: 0.4, metalness: 0.5, roughness: 0.3 });
    for (var cn = 0; cn < 7; cn++) abPart(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 18), coinMat, CTX - 0.08 + (isle2Hash(cn) - 0.5) * 0.004, ABT + 0.003 + cn * 0.0062, CTZ + 0.18 + (isle2Hash(cn * 3) - 0.5) * 0.004);   // a stack of Star Coins,
    [[0.0, 0.17, 0.3], [0.03, 0.2, 1.1]].forEach(function (c) { abPart(new THREE.CylinderGeometry(0.022, 0.022, 0.006, 18), coinMat, CTX + c[0], ABT + 0.003, CTZ + c[1], 0, c[2], 0); });   // and a couple loose
    var starG = new THREE.Shape(); for (var sk = 0; sk < 10; sk++) { var sa2 = -Math.PI / 2 + sk * Math.PI / 5, sr2 = sk % 2 ? 0.006 : 0.014; if (sk) starG.lineTo(Math.cos(sa2) * sr2, Math.sin(sa2) * sr2); else starG.moveTo(Math.cos(sa2) * sr2, Math.sin(sa2) * sr2); }
    abPart(new THREE.ShapeGeometry(starG), new THREE.MeshStandardMaterial({ color: 0xfff0b0, emissive: 0x8a6a1c, emissiveIntensity: 0.3, metalness: 0.7, roughness: 0.3 }), CTX - 0.08, ABT + 0.0475, CTZ + 0.18, -Math.PI / 2, 0, 0);   // stamped with a star
    // kraft paper bags, folded flat in a pile, one opened up
    [0, 1, 2].forEach(function (k) { abPart(new THREE.BoxGeometry(0.16, 0.004, 0.24), new THREE.MeshStandardMaterial({ color: 0xb08860, roughness: 0.95 }), 0.48 + (isle2Hash(k) - 0.5) * 0.02, ABT + 0.002 + k * 0.004, ABC_Z + 0.17, 0, (isle2Hash(k * 3) - 0.5) * 0.15, 0); });
    var bag = abPart(new THREE.BoxGeometry(0.1, 0.16, 0.06, 1, 4, 1), new THREE.MeshStandardMaterial({ color: 0xb8926a, roughness: 0.95 }), 0.5, ABT + 0.08, ABC_Z - 0.17, 0, 0.3, 0);
    for (var bf = 0; bf < 5; bf++) abPart(new THREE.BoxGeometry(0.102, 0.002, 0.062), new THREE.MeshStandardMaterial({ color: 0x9a7a58, roughness: 1 }), 0.5, ABT + 0.03 + bf * 0.03, ABC_Z - 0.17, 0, 0.3, 0);   // its creases
    // a receipt spike with slips on it
    abPart(new THREE.CylinderGeometry(0.03, 0.035, 0.012, 16), AB.iron, 1.12, ABT + 0.006, ABC_Z + 0.2);
    abPart(new THREE.CylinderGeometry(0.0015, 0.003, 0.14, 6), AB.zinc, 1.12, ABT + 0.08, ABC_Z + 0.2);
    for (var rs = 0; rs < 4; rs++) abPart(new THREE.PlaneGeometry(0.06, 0.08), ctPaper, 1.12, ABT + 0.02 + rs * 0.008, ABC_Z + 0.2, -Math.PI / 2 + (isle2Hash(rs) - 0.5) * 0.2, 0, isle2Hash(rs * 3) * 3).castShadow = false;
    // a little enamel jug of daisies and lavender
    var VX = 1.14, VZ = ABC_Z - 0.16;
    var jugPts = []; [[0.0, 0], [0.042, 0.002], [0.05, 0.03], [0.046, 0.08], [0.034, 0.11], [0.036, 0.13], [0.04, 0.135]].forEach(function (p) { jugPts.push(new THREE.Vector2(p[0], p[1])); });
    abPart(new THREE.LatheGeometry(jugPts, 22), new THREE.MeshStandardMaterial({ color: 0xf2eee4, roughness: 0.3, side: THREE.DoubleSide }), VX, ABT, VZ);
    abPart(new THREE.TorusGeometry(0.046, 0.003, 4, 24), new THREE.MeshStandardMaterial({ color: 0x2f4a7a, roughness: 0.3 }), VX, ABT + 0.135, VZ, Math.PI / 2, 0, 0);   // a blue enamel rim
    abPart(new THREE.TorusGeometry(0.03, 0.006, 6, 12, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: 0xf2eee4, roughness: 0.3 }), VX + 0.05, ABT + 0.08, VZ, 0, 0, -Math.PI * 0.6);   // its handle
    var stemMat = new THREE.MeshStandardMaterial({ color: 0x4a7a3a, roughness: 0.8 }), petalMat2 = new THREE.MeshStandardMaterial({ color: 0xfaf8f0, roughness: 0.7, side: THREE.DoubleSide });
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0xf2c14e, roughness: 0.7 }), lavMat = new THREE.MeshStandardMaterial({ color: 0x9a7ad8, roughness: 0.8 });
    for (var df = 0; df < 9; df++) {
      var da = df / 9 * Math.PI * 2 + 0.3, lean = 0.2 + isle2Hash(df * 2.1) * 0.25, sl3 = 0.17 + isle2Hash(df * 3.3) * 0.08;
      var tip = V3(VX + Math.cos(da) * Math.sin(lean) * sl3, ABT + 0.12 + Math.cos(lean) * sl3, VZ + Math.sin(da) * Math.sin(lean) * sl3);
      abRod(V3(VX + Math.cos(da) * 0.01, ABT + 0.1, VZ + Math.sin(da) * 0.01), tip, 0.0025, stemMat);
      if (df % 3 === 2) {                                                // a sprig of lavender
        for (var lb = 0; lb < 6; lb++) abPart(new THREE.SphereGeometry(0.007, 6, 5), lavMat, tip.x + Math.cos(da) * lb * 0.006, tip.y + lb * 0.009, tip.z + Math.sin(da) * lb * 0.006).scale.set(1, 1.4, 1);
      } else {                                                           // a daisy: a ring of white petals round a yellow eye
        var dg = new THREE.Group(); dg.position.copy(tip); dg.rotation.set(-lean * Math.sin(da) * 0.6, 0, lean * Math.cos(da) * 0.6); abRoom.add(dg);
        for (var pt = 0; pt < 12; pt++) { var pa = pt / 12 * Math.PI * 2, petal = abPart(new THREE.CircleGeometry(0.008, 6), petalMat2, Math.cos(pa) * 0.014, 0, Math.sin(pa) * 0.014, -Math.PI / 2, 0, -pa, dg); petal.scale.set(1.9, 0.6, 1); petal.castShadow = false; }
        abPart(new THREE.SphereGeometry(0.008, 8, 6), eyeMat, 0, 0.002, 0, 0, 0, 0, dg).scale.set(1, 0.5, 1);
      }
    }
    for (var lf2 = 0; lf2 < 4; lf2++) { var la2 = lf2 / 4 * Math.PI * 2; abPart(new THREE.SphereGeometry(0.02, 8, 5), stemMat, VX + Math.cos(la2) * 0.035, ABT + 0.15, VZ + Math.sin(la2) * 0.035, 0, la2, 0.6).scale.set(1, 0.2, 0.45); }   // leaves at the rim
    // a stool behind: a round plank seat on splayed legs with a ring of rungs
    var STX = 0.5, STZ = ABC_Z - 0.75;
    abPart(new THREE.CylinderGeometry(0.17, 0.165, 0.045, 24), ctTop, STX, 0.69, STZ);
    for (var sl2 = 0; sl2 < 3; sl2++) {
      var abSla = sl2 / 3 * Math.PI * 2;
      abRod(V3(STX + Math.cos(abSla) * 0.1, 0.67, STZ + Math.sin(abSla) * 0.1), V3(STX + Math.cos(abSla) * 0.17, 0, STZ + Math.sin(abSla) * 0.17), 0.018, AB.beam);
      var nx2 = (sl2 + 1) / 3 * Math.PI * 2;
      abRod(V3(STX + Math.cos(abSla) * 0.15, 0.22, STZ + Math.sin(abSla) * 0.15), V3(STX + Math.cos(nx2) * 0.15, 0.22, STZ + Math.sin(nx2) * 0.15), 0.01, AB.beam);   // the rungs
    }
  })();
  for (var abCs = -1.1; abCs <= 1.11; abCs += 0.55) abSolids.push([ABC_X + abCs, ABC_Z, 0.42]);

  // the stalls down the left, built like proper horse stalls: solid tongue-and-groove lower walls in a heavy timber
  // frame, black iron bars above up to a capped top rail, posts with iron shoes and ball finials, and a barred gate
  // swung open into each stall on strap hinges. Inside: deep straw heaped against the back wall, a corner manger of
  // feed, a hay rack under the window, a salt lick on its bracket, and a galvanised water bucket on a hook; outside,
  // a wool blanket hung over the front and a brass-framed nameplate slate saying who's coming
  var AB_SX = -2.2;                                                    // the stall fronts
  var SB_LOW = 1.05, SB_TOP = 1.9;                                     // the top of the boarded part, and of the bars
  var abWispList = [], abBars = [], abStallSlates = [];                                    // (the bars are all drawn in one batch)
  var stallBoard = new THREE.MeshStandardMaterial({ map: abPlankTex.clone(), color: 0xe6cfae, bumpMap: abPlankTex, bumpScale: 0.01, roughness: 0.8 });
  stallBoard.map.needsUpdate = true; stallBoard.map.repeat.set(0.9, 0.5);
  var stallIron = new THREE.MeshStandardMaterial({ color: 0x23232a, roughness: 0.4, metalness: 0.55 });
  function abStallRun(x0, z0, x1, z1, parent) {                       // one run of stall wall: boards below, bars above, in a frame
    var ln = Math.hypot(x1 - x0, z1 - z0), an = Math.atan2(-(z1 - z0), x1 - x0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, dx = (x1 - x0) / ln, dz = (z1 - z0) / ln;
    abPart(new THREE.BoxGeometry(ln, SB_LOW - 0.12, 0.045), stallBoard, cx, 0.12 + (SB_LOW - 0.12) / 2, cz, 0, an, 0, parent);   // the boards
    abPart(new THREE.BoxGeometry(ln, 0.12, 0.07), AB.beam, cx, 0.06, cz, 0, an, 0, parent);                    // a kick board at the bottom
    abPart(new THREE.BoxGeometry(ln, 0.1, 0.1), AB.beam, cx, SB_LOW + 0.05, cz, 0, an, 0, parent);             // the middle rail
    abPart(new THREE.BoxGeometry(ln, 0.09, 0.11), AB.beam, cx, SB_TOP + 0.045, cz, 0, an, 0, parent);         // the top rail,
    abPart(new THREE.BoxGeometry(ln, 0.02, 0.13), stallIron, cx, SB_TOP + 0.1, cz, 0, an, 0, parent);         // capped in iron
    abPart(new THREE.BoxGeometry(ln, 0.025, 0.03), stallIron, cx, SB_LOW + 0.11, cz, 0, an, 0, parent);       // the iron channel the bars sit in
    abPart(new THREE.BoxGeometry(ln, 0.025, 0.03), stallIron, cx, SB_TOP - 0.01, cz, 0, an, 0, parent);
    var nb = Math.max(2, Math.round(ln / 0.11));
    for (var b = 1; b < nb; b++) abBars.push({ p: parent, x: x0 + dx * ln * b / nb, z: z0 + dz * ln * b / nb });
    for (var r = 0; r < ln / 0.6; r++) abPart(new THREE.CylinderGeometry(0.012, 0.012, 0.11, 8).rotateX(Math.PI / 2), stallIron, x0 + dx * (0.3 + r * 0.6), SB_LOW + 0.05, z0 + dz * (0.3 + r * 0.6), 0, an, 0, parent);   // bolt heads through the rail
  }
  function abStallPost(x, z, h) {                                      // a post on an iron shoe, with a chamfered cap and a ball finial
    abPart(new THREE.BoxGeometry(0.14, h, 0.14), AB.beam, x, h / 2, z);
    abPart(new THREE.BoxGeometry(0.16, 0.16, 0.16), stallIron, x, 0.08, z);
    abPart(new THREE.CylinderGeometry(0.075, 0.11, 0.06, 4, 1), AB.beam, x, h + 0.03, z, 0, Math.PI / 4, 0);
    abPart(new THREE.CylinderGeometry(0.02, 0.03, 0.05, 10), stallIron, x, h + 0.085, z);
    abPart(new THREE.SphereGeometry(0.045, 14, 10), stallIron, x, h + 0.14, z);
    [SB_LOW + 0.05, SB_TOP + 0.045].forEach(function (ry) { abPart(new THREE.BoxGeometry(0.15, 0.03, 0.15), stallIron, x, ry - 0.06, z); });   // iron bands where the rails meet it
  }
  var PH = SB_TOP + 0.1;                                               // post height
  [-3.9, -1.3, 1.3, 3.9].forEach(function (pz) {                       // the partitions between the stalls
    abStallRun(-AB_W / 2 + 0.03, pz, AB_SX, pz);
    abStallPost(AB_SX, pz, PH);
    abPart(new THREE.BoxGeometry(0.06, PH, 0.16), AB.beam, -AB_W / 2 + 0.05, PH / 2, pz);   // a ledger post against the wall
    for (var abPx = -AB_W / 2 + 0.3; abPx <= AB_SX; abPx += 0.3) abSolids.push([abPx, pz, 0.1]);
  });
  var abPlaid = [['#9a2a2a', '#e8d8b0', '#2a2a2a'], ['#2a3f6a', '#c8a050', '#f0ead8'], ['#2f5a3a', '#d8b860', '#7a2a2a']].map(function (c) {
    return paintTexture(128, 128, function (g, w, h) {                 // wool blankets in tartan
      g.fillStyle = c[0]; g.fillRect(0, 0, w, h);
      [[0, 24, 'rgba(0,0,0,0.25)'], [64, 24, 'rgba(0,0,0,0.25)'], [30, 4, c[1]], [94, 4, c[1]], [46, 2, c[2]], [110, 2, c[2]]].forEach(function (st) {
        g.fillStyle = st[2]; g.globalAlpha = st[2].charAt(0) === 'r' ? 1 : 0.8; g.fillRect(st[0], 0, st[1], h); g.fillRect(0, st[0], w, st[1]);
      });
      g.globalAlpha = 1;
      for (var i = 0; i < 900; i++) { g.fillStyle = 'rgba(255,255,255,' + isle2Hash(i * 1.3 + 77) * 0.06 + ')'; g.fillRect(isle2Hash(i * 2.1 + 77) * w, isle2Hash(i * 3.7 + 77) * h, 2, 1); }   // the wool's weave
    });
  });
  var stallBrass = new THREE.MeshStandardMaterial({ color: 0xd4a84e, emissive: 0x5a3e0c, emissiveIntensity: 0.25, metalness: 0.8, roughness: 0.3 });
  [-2.6, 0, 2.6].forEach(function (sz, k) {
    var z0 = sz - 1.3, z1 = sz + 1.3, FW = 1.16;                       // the fixed front panel's width
    abStallRun(AB_SX, z0 + 0.07, AB_SX, z0 + FW + 0.07);               // the fixed front
    [-1, 1].forEach(function (s) {                                     // an X brace on its boards, facing the aisle
      var bl = Math.hypot(FW - 0.08, SB_LOW - 0.2);
      abPart(new THREE.BoxGeometry(0.03, 0.08, bl), AB.beam, AB_SX + 0.04, 0.12 + (SB_LOW - 0.12) / 2, z0 + 0.07 + FW / 2, s * Math.atan2(SB_LOW - 0.2, FW - 0.08), 0, 0);
    });
    abStallPost(AB_SX, z0 + FW + 0.1, PH);                             // the gate post
    for (var fz = z0 + 0.2; fz <= z0 + 1.25; fz += 0.3) abSolids.push([AB_SX, fz, 0.12]);
    // the gate: a boarded lower half and barred upper half in a frame, braced, swung open into the stall on long
    // strap hinges, with a sliding bolt and a little chain to hold it
    var gate = new THREE.Group(); gate.position.set(AB_SX, 0, z1 - 0.07); gate.rotation.y = 1.05 + k * 0.12; abRoom.add(gate);
    var GW = 1.12, GZ = -0.06 - GW / 2;
    abPart(new THREE.BoxGeometry(0.04, SB_LOW - 0.2, GW), stallBoard, 0, 0.15 + (SB_LOW - 0.2) / 2, GZ, 0, 0, 0, gate);
    [-0.06, -0.06 - GW].forEach(function (gz) { abPart(new THREE.BoxGeometry(0.07, PH - 0.12, 0.08), AB.beam, 0, 0.1 + (PH - 0.12) / 2, gz, 0, 0, 0, gate); });   // stiles
    [0.14, SB_LOW, PH - 0.05].forEach(function (gy) { abPart(new THREE.BoxGeometry(0.07, 0.08, GW), AB.beam, 0, gy, GZ, 0, 0, 0, gate); });                     // rails
    abPart(new THREE.BoxGeometry(0.03, 0.07, Math.hypot(GW - 0.1, SB_LOW - 0.25)), AB.beam, 0.035, 0.6, GZ, Math.atan2(SB_LOW - 0.25, GW - 0.1), 0, 0, gate);   // the brace
    abPart(new THREE.BoxGeometry(0.03, 0.07, Math.hypot(GW - 0.1, SB_LOW - 0.25)), AB.beam, -0.035, 0.6, GZ, Math.atan2(SB_LOW - 0.25, GW - 0.1), 0, 0, gate);
    for (var gb = 1; gb < 10; gb++) abBars.push({ p: gate, x: 0, z: -0.06 - GW * gb / 10 });
    [0.3, SB_LOW, PH - 0.15].forEach(function (hy) {                   // strap hinges, both faces, with their pins on the post
      [-1, 1].forEach(function (f) { abPart(new THREE.BoxGeometry(0.008, 0.045, 0.42), stallIron, f * 0.042, hy, -0.24, 0, 0, 0, gate); });
      abPart(new THREE.CylinderGeometry(0.016, 0.016, 0.09, 8), stallIron, 0, hy, 0.0, 0, 0, 0, gate);
    });
    abPart(new THREE.BoxGeometry(0.03, 0.04, 0.16), stallIron, 0.045, SB_LOW + 0.1, -GW - 0.02, 0, 0, 0, gate);   // the sliding bolt
    abPart(new THREE.SphereGeometry(0.014, 8, 6), stallBrass, 0.07, SB_LOW + 0.1, -GW + 0.03, 0, 0, 0, gate);
    for (var ch = 0; ch < 6; ch++) abPart(new THREE.TorusGeometry(0.012, 0.003, 4, 8), stallIron, 0.045, SB_LOW - 0.02 - ch * 0.022, -GW - 0.06, 0, ch % 2 ? Math.PI / 2 : 0, 0, gate);   // a short chain hanging from it
    var ga = gate.rotation.y;
    [0.4, 0.8, 1.15].forEach(function (t) { abSolids.push([AB_SX - t * Math.sin(ga), z1 - 0.07 - t * Math.cos(ga), 0.1]); });   // (it swings into the stall)
    // deep straw bedding, banked up against the back wall the way grooms leave it
    var bed = new THREE.PlaneGeometry(AB_W / 2 + AB_SX - 0.1, 2.5, 10, 12), bp = bed.attributes.position;
    for (var v = 0; v < bp.count; v++) bp.setZ(v, Math.pow(Math.max(0, -bp.getX(v) / (AB_W / 2 + AB_SX) + 0.1), 2) * 0.5 + isle2Hash(v * 1.3 + k * 50) * 0.05);
    bed.computeVertexNormals();
    var bedM = abPart(bed, AB.straw, (-AB_W / 2 + AB_SX) / 2, 0.012, sz, -Math.PI / 2, 0, 0); bedM.castShadow = false;
    var bank = abPart(new THREE.SphereGeometry(0.5, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.12, 0, sz, 0, 0, 0);
    bank.scale.set(0.5, 0.45, 2.3); bank.castShadow = false;           // the bank of straw along the wall
    [0, 1].forEach(function (L) { abPart(new THREE.PlaneGeometry(1.3, 1.7), AB.straw, -AB_W / 2 + 0.75 + L * 0.3, 0.05 + L * 0.03, sz + 0.2 - L * 0.4, -Math.PI / 2, 0, 0.4 + k + L).castShadow = false; });
    for (var abWs = 0; abWs < 160; abWs++) abWispList.push([-AB_W / 2 + 0.1 + isle2Hash(abWs * 1.9 + k * 300) * (AB_W / 2 + AB_SX - 0.2), sz + (isle2Hash(abWs * 2.3 + k * 300) - 0.5) * 2.4, isle2Hash(abWs * 3.1 + k * 300)]);
    // a hay rack on the wall under the window, with hay poking through
    var rx = -AB_W / 2 + 0.22;
    abPart(new THREE.BoxGeometry(0.04, 0.06, 0.9), AB.beam, rx + 0.18, 1.25, sz);
    abPart(new THREE.BoxGeometry(0.06, 0.06, 0.9), AB.beam, rx - 0.1, 0.9, sz);
    [-0.45, 0.45].forEach(function (ez) { abPart(new THREE.BoxGeometry(0.3, 0.4, 0.03), AB.beam, rx + 0.04, 1.07, sz + ez); });   // its end boards
    for (var abRb = -0.4; abRb <= 0.41; abRb += 0.1) abPart(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 5), AB.iron, rx + 0.04, 1.07, sz + abRb, 0, 0, -0.72);
    var rh = abPart(new THREE.SphereGeometry(0.26, 12, 8), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), rx - 0.02, 1.1, sz, 0, 0, 0.3);
    rh.scale.set(0.5, 0.55, 1.65);
    for (var hw = 0; hw < 12; hw++) abPart(new THREE.CylinderGeometry(0.004, 0.003, 0.18, 3), hayWispMat, rx + 0.12, 0.95 - isle2Hash(hw + k * 20) * 0.1, sz + (isle2Hash(hw * 3 + k) - 0.5) * 0.8, 0.3, 0, -0.4 + isle2Hash(hw * 5) * 0.8).castShadow = false;   // wisps hanging out
    // a corner manger in the back corner by the gate, with feed in it
    var MX = -AB_W / 2 + 0.3, MZ = z1 - 0.3;
    var manger = new THREE.CylinderGeometry(0.34, 0.24, 0.26, 4, 1, true); manger.rotateY(Math.PI / 4);
    abPart(manger, new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.8, side: THREE.DoubleSide }), MX, 0.82, MZ);
    abPart(new THREE.BoxGeometry(0.34, 0.02, 0.34), AB.beam, MX, 0.7, MZ);
    abPart(new THREE.BoxGeometry(0.44, 0.03, 0.44), stallIron, MX, 0.95, MZ, 0, 0, 0).scale.set(1, 1, 1);
    abPart(new THREE.BoxGeometry(0.4, 0.02, 0.4), new THREE.MeshStandardMaterial({ color: 0xc89a50, roughness: 1 }), MX, 0.88, MZ);   // the feed
    for (var oat = 0; oat < 10; oat++) abPart(new THREE.SphereGeometry(0.012, 5, 4), new THREE.MeshStandardMaterial({ color: 0xe0c070, roughness: 1 }), MX + (isle2Hash(oat + k * 9) - 0.5) * 0.3, 0.895, MZ + (isle2Hash(oat * 2 + k) - 0.5) * 0.3).castShadow = false;
    abPart(new THREE.BoxGeometry(0.05, 0.7, 0.05), AB.beam, MX + 0.17, 0.35, MZ - 0.17);              // its leg
    abSolids.push([MX, MZ, 0.3]);
    // a salt lick on a bracket on the wall
    var SLZ = z0 + 0.55;
    abPart(new THREE.BoxGeometry(0.03, 0.2, 0.2), stallIron, -AB_W / 2 + 0.04, 1.0, SLZ);
    abPart(new THREE.BoxGeometry(0.16, 0.02, 0.18), stallIron, -AB_W / 2 + 0.1, 0.9, SLZ);
    abPart(ciRoundBox(0.13, 0.12, 0.14, 0.03), new THREE.MeshStandardMaterial({ color: 0xb8605a, roughness: 0.7 }), -AB_W / 2 + 0.11, 0.97, SLZ);
    // a galvanised water bucket hung on a hook in the front corner
    var bkx = AB_SX - 0.2, bkz = z0 + 0.3, bky = 0.55;
    abPart(new THREE.CylinderGeometry(0.15, 0.12, 0.28, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }), bkx, bky, bkz);
    abPart(new THREE.CircleGeometry(0.12, 18), new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.4, metalness: 0.3 }), bkx, bky - 0.14, bkz, -Math.PI / 2, 0, 0);
    abPart(new THREE.CircleGeometry(0.14, 18), new THREE.MeshStandardMaterial({ color: 0x5a8aa8, roughness: 0.05, metalness: 0.2 }), bkx, bky + 0.08, bkz, -Math.PI / 2, 0, 0);   // water
    [-0.11, 0.12].forEach(function (ry) { abPart(new THREE.TorusGeometry(ry > 0 ? 0.15 : 0.125, 0.006, 5, 24), AB.zinc, bkx, bky + ry, bkz, Math.PI / 2, 0, 0); });
    abPart(new THREE.TorusGeometry(0.15, 0.004, 5, 20, Math.PI), stallIron, bkx, bky + 0.14, bkz, 0, Math.PI / 2, 0);   // its handle,
    abPart(new THREE.BoxGeometry(0.02, 0.18, 0.04), stallIron, AB_SX - 0.03, bky + 0.24, bkz);          // on a hook on the front
    abPart(new THREE.TorusGeometry(0.03, 0.006, 5, 10, Math.PI), stallIron, AB_SX - 0.06, bky + 0.17, bkz, 0, Math.PI / 2, Math.PI);
    // a wool blanket folded over the front's middle rail, on the aisle side
    var blk = new THREE.PlaneGeometry(0.62, 0.62, 6, 10), bkp = blk.attributes.position;
    for (var bv = 0; bv < bkp.count; bv++) {                           // draped: up one side, over the rail, down the other
      var by = bkp.getY(bv) + 0.31, fold = by / 0.62 * Math.PI;
      bkp.setXYZ(bv, bkp.getX(bv), SB_LOW + 0.1 - Math.abs(Math.cos(fold)) * 0.32 + Math.sin(fold) * 0.02, Math.cos(fold) * 0.07 + (isle2Hash(bv + k) - 0.5) * 0.006);
    }
    blk.computeVertexNormals();
    abPart(blk, new THREE.MeshStandardMaterial({ map: abPlaid[k], roughness: 1, side: THREE.DoubleSide }), AB_SX + 0.0, 0, z0 + 0.38, 0, Math.PI / 2, 0).castShadow = false;
    // the nameplate: a slate in a brass frame, with a lucky horseshoe above it
    var NZ = z0 + 0.86;
    abPart(new THREE.BoxGeometry(0.02, 0.22, 0.4), stallBrass, AB_SX + 0.045, 0.62, NZ);
    var slateMat = new THREE.MeshStandardMaterial({ map: abSlateTex, roughness: 0.95 }); abStallSlates.push(slateMat);
    abPart(new THREE.PlaneGeometry(0.36, 0.18), slateMat, AB_SX + 0.057, 0.62, NZ, 0, Math.PI / 2, 0);
    [-1, 1].forEach(function (s) { abPart(new THREE.CylinderGeometry(0.008, 0.008, 0.01, 8), stallBrass, AB_SX + 0.058, 0.62, NZ + s * 0.17, 0, 0, Math.PI / 2); });
    abPart(new THREE.TorusGeometry(0.055, 0.012, 6, 16, Math.PI * 1.5), new THREE.MeshStandardMaterial({ color: 0x8a8e94, roughness: 0.4, metalness: 0.7 }), AB_SX + 0.05, 0.85, NZ, 0, Math.PI / 2, -Math.PI * 0.25);
  });
  (function () {                                                       // all the iron bars, in one batch
    var byParent = [];
    abBars.forEach(function (b) { var e = byParent.filter(function (q) { return q.p === b.p; })[0]; if (!e) { e = { p: b.p, list: [] }; byParent.push(e); } e.list.push(b); });
    var bm = new THREE.Matrix4(), bh = SB_TOP - SB_LOW - 0.11;
    byParent.forEach(function (e) {
      var im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.011, 0.011, bh, 6), stallIron, e.list.length);
      e.list.forEach(function (b, i) { bm.makeTranslation(b.x, SB_LOW + 0.1 + bh / 2, b.z); im.setMatrixAt(i, bm); });
      im.castShadow = true; (e.p || abRoom).add(im);
    });
  })();
  // ---------- Glimmerwings ----------
  // Little magical creatures sold at Fluff & Feather: a round ball of pastel fluff with two pairs of shimmering moth
  // wings, feathery antennae, big shiny eyes and a glowing gem on its brow. You name one when you adopt it, and it
  // moves into a stall in the barn (there are three). Feed it a bundle of hay AND pet it every day, and the next morning
  // there's a softly glowing Glimmer Egg waiting in its straw. Miss either one and it doesn't lay that night
  var GLIM_COST = 250, GLIM_STALLS = [-2.6, 0, 2.6];
  var glimmers = [], glimDay = null, glimNaming = false;
  var GLIM_PALS = [                                                    // a pink fuzzball with rosy-maple wings, a mint one with luna wings, and a cream one with ivory wings
    { name: 'Rosy', fur: 0xf59cc4, fur2: 0xffc4de, feet: 0xf59ab4, ant: 0xe8a0b8, glow: 0xffa8d0, iris: ['#6a3050', '#2a1020'], w: ['#ef9ab8', '#f8dc84', '#fff2dc', '#b04a70', '#d07090'] },
    { name: 'Luna', fur: 0x96e0bc, fur2: 0xc4f4dc, feet: 0x9ad8b8, ant: 0x9ac8a8, glow: 0x9cf0c8, iris: ['#2a5a5a', '#102828'], w: ['#bfe8b4', '#e2f5cf', '#f6fbea', '#d8a040', '#8a5a6a'] },
    { name: 'Cream', fur: 0xfbe6b8, fur2: 0xfff4dc, feet: 0xf0c8a8, ant: 0xd8b890, glow: 0xd4bcff, iris: ['#5a4030', '#20140c'], w: ['#f2e8d4', '#d4bc94', '#fdf8ee', '#7a6050', '#b09070'] }
  ];
  function glimCanvas(w, h, paint) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; paint(cv.getContext('2d'), w, h); return cv; }
  function glimR(n) { return isle2Hash(n * 2.718 + 9100); }
  // the moth wings, painted like real ones: a ground colour of tiny overlapping scales, wavy cross-bands, fine veins,
  // a small spot in the middle, a darker leading edge and a fringe of hairs round the outer margin, with a faint shimmer
  function glimWingTex(pal, lower) {
    return new THREE.CanvasTexture(glimCanvas(512, 512, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      var rx = 20, ry = lower ? 72 : 410;                              // the wing root
      function outline() {
        g.beginPath();
        if (!lower) { g.moveTo(rx, ry); g.bezierCurveTo(120, 230, 330, 40, 492, 50); g.bezierCurveTo(500, 150, 470, 270, 400, 330); g.bezierCurveTo(300, 390, 120, 420, rx, 425); }
        else { g.moveTo(rx, ry); g.bezierCurveTo(170, 50, 380, 120, 420, 270); g.bezierCurveTo(440, 400, 330, 480, 230, 450); g.bezierCurveTo(130, 420, 50, 260, rx, 92); }
        g.closePath();
      }
      outline(); g.save(); g.clip();
      var gr = g.createLinearGradient(rx, ry, lower ? 420 : 490, lower ? 450 : 60);
      gr.addColorStop(0, pal.w[0]); gr.addColorStop(0.55, pal.w[0]); gr.addColorStop(1, pal.w[2]);
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      // a broad band of the second colour across the wing
      g.globalAlpha = 0.85; g.fillStyle = pal.w[1]; g.beginPath();
      if (!lower) { g.moveTo(180, 470); g.bezierCurveTo(240, 330, 300, 200, 360, 10); g.lineTo(460, 10); g.bezierCurveTo(410, 200, 360, 330, 300, 470); }
      else { g.moveTo(150, 512); g.bezierCurveTo(220, 380, 260, 250, 280, 60); g.lineTo(380, 90); g.bezierCurveTo(360, 260, 320, 390, 260, 512); }
      g.closePath(); g.fill(); g.globalAlpha = 1;
      // the scales: thousands of tiny overlapping strokes, all lying the same way
      for (var i = 0; i < 9000; i++) {
        var x = glimR(i * 1.37 + (lower ? 3 : 0)) * w, y = glimR(i * 2.71 + (lower ? 5 : 0)) * h, a = Math.atan2(y - ry, x - rx), l = 3 + glimR(i * 3.3) * 4;
        g.strokeStyle = glimR(i * 4.9) > 0.5 ? 'rgba(255,255,255,' + glimR(i * 5.7) * 0.18 + ')' : 'rgba(60,40,30,' + glimR(i * 6.1) * 0.12 + ')';
        g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      // wavy cross-lines
      g.strokeStyle = 'rgba(70,40,40,0.35)'; g.lineWidth = 2.2;
      [0.35, 0.62, 0.84].forEach(function (f, k) {
        g.beginPath();
        for (var t = 0; t <= 24; t++) {
          var tt = t / 24, px, py;
          if (!lower) { px = rx + (60 + f * 420) * (0.35 + tt * 0.65) - tt * 40; py = ry - tt * (330 + f * 40) + (1 - tt) * 10; }
          else { px = rx + f * 360 * (0.6 + tt * 0.4); py = ry + tt * (300 + f * 80); }
          px += Math.sin(tt * 20 + k) * 5;
          if (t) g.lineTo(px, py); else g.moveTo(px, py);
        }
        g.stroke();
      });
      // veins fanning out from the root
      g.strokeStyle = 'rgba(255,250,235,0.35)'; g.lineWidth = 1.4;
      for (var v = 0; v < 9; v++) {
        var va = lower ? 0.05 + v * 0.17 : -1.35 + v * 0.16;
        g.beginPath(); g.moveTo(rx, ry); g.quadraticCurveTo(rx + Math.cos(va) * 200, ry + Math.sin(va) * 180 + (lower ? 0 : 40), rx + Math.cos(va) * 560, ry + Math.sin(va) * 560); g.stroke();
      }
      // the discal spot, and a darker leading edge on the forewing
      var sx = lower ? 250 : 300, sy = lower ? 250 : 200;
      var es = g.createRadialGradient(sx, sy, 2, sx, sy, lower ? 30 : 24);
      es.addColorStop(0, pal.w[2]); es.addColorStop(0.35, pal.w[3]); es.addColorStop(0.7, 'rgba(60,30,30,0.55)'); es.addColorStop(1, 'rgba(60,30,30,0)');
      g.fillStyle = es; g.beginPath(); g.arc(sx, sy, lower ? 30 : 24, 0, Math.PI * 2); g.fill();
      if (!lower) { var le = g.createLinearGradient(0, 0, 60, 120); g.strokeStyle = pal.w[4]; g.globalAlpha = 0.6; g.lineWidth = 14; g.beginPath(); g.moveTo(rx, ry); g.bezierCurveTo(120, 230, 330, 40, 492, 50); g.stroke(); g.globalAlpha = 1; }
      var sheen = g.createLinearGradient(0, 0, w, h); sheen.addColorStop(0, 'rgba(255,255,255,0)'); sheen.addColorStop(0.5, 'rgba(255,255,255,0.14)'); sheen.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sheen; g.fillRect(0, 0, w, h);
      g.restore();
      // the fringe: fine hairs all round the outer edge
      outline(); g.strokeStyle = 'rgba(80,50,40,0.45)'; g.lineWidth = 2; g.stroke();
      for (var c = 0; c < 420; c++) {
        var cx2 = glimR(c * 7.3 + 11) * w, cy2 = glimR(c * 8.9 + 11) * h;
        if (!g.isPointInPath(cx2, cy2)) continue;
        var dr = Math.atan2(cy2 - ry, cx2 - rx), ex = cx2 + Math.cos(dr) * 14, ey = cy2 + Math.sin(dr) * 14;
        if (g.isPointInPath(ex, ey)) continue;                          // only right at the margin
        g.strokeStyle = c % 3 ? pal.w[2] : 'rgba(120,100,90,0.6)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(cx2, cy2); g.lineTo(cx2 + Math.cos(dr) * 9, cy2 + Math.sin(dr) * 9); g.stroke();
      }
    }));
  }
  var glimHeartTex = new THREE.CanvasTexture(glimCanvas(64, 64, function (g, w, h) {
    g.fillStyle = '#ff7ab6'; g.beginPath(); g.moveTo(32, 54); g.bezierCurveTo(4, 34, 6, 10, 22, 10); g.bezierCurveTo(28, 10, 32, 16, 32, 20); g.bezierCurveTo(32, 16, 36, 10, 42, 10); g.bezierCurveTo(58, 10, 60, 34, 32, 54); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(22, 20, 5, 3, -0.6, 0, Math.PI * 2); g.fill();
  }));
  var glimSparkTex = new THREE.CanvasTexture(glimCanvas(32, 32, function (g, w, h) {
    var sg = g.createRadialGradient(16, 16, 0, 16, 16, 16); sg.addColorStop(0, 'rgba(255,255,255,1)'); sg.addColorStop(0.3, 'rgba(255,240,200,0.8)'); sg.addColorStop(1, 'rgba(255,240,200,0)');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.fillRect(15, 2, 2, 28); g.fillRect(2, 15, 28, 2);
  }));
  // a Glimmer Egg: pearly, with a shimmering band, glowing softly
  var glimEggTex = new THREE.CanvasTexture(glimCanvas(128, 64, function (g, w, h) {
    var gg = g.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, '#fbf6ff'); gg.addColorStop(0.45, '#e6d6ff'); gg.addColorStop(0.55, '#c8f0ec'); gg.addColorStop(1, '#fff0f6');
    g.fillStyle = gg; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 60; i++) { g.fillStyle = ['rgba(255,214,240,0.6)', 'rgba(160,220,255,0.5)', 'rgba(255,240,170,0.6)'][i % 3]; g.beginPath(); g.arc(glimR(i * 3.3) * w, glimR(i * 4.4) * h, 1 + glimR(i) * 2.5, 0, Math.PI * 2); g.fill(); }
  }));
  var glimEggMat = new THREE.MeshStandardMaterial({ map: glimEggTex, emissive: 0xc8a8ff, emissiveIntensity: 0.35, roughness: 0.25, metalness: 0.15 });
  // its pictures in menus: an egg for the bag, and the creature itself for the shop
  var glimEggIcon = glimCanvas(96, 96, function (g, w, h) {
    var glow = g.createRadialGradient(48, 52, 4, 48, 52, 46); glow.addColorStop(0, 'rgba(220,190,255,0.7)'); glow.addColorStop(1, 'rgba(220,190,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    var eg = g.createRadialGradient(40, 36, 4, 48, 52, 34); eg.addColorStop(0, '#ffffff'); eg.addColorStop(0.5, '#e4d2ff'); eg.addColorStop(0.8, '#b8e8e4'); eg.addColorStop(1, '#c8a8f0');
    g.fillStyle = eg; g.beginPath(); g.ellipse(48, 54, 24, 31, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,200,230,0.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(48, 58, 23, 6, 0, 0.1, Math.PI - 0.1); g.stroke();
    g.fillStyle = '#fff'; [[30, 20], [70, 26], [74, 70]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  ITEMS.glimmerEgg = { name: 'Glimmer Egg', price: 90, icon: '🥚', img: glimEggIcon, fill: 86, info: 'A softly glowing egg, laid by a happy Glimmerwing. Feed and pet yours every day for one each morning. Sells for a good price at the shipping bin.' };
  var glimShopIcon = glimCanvas(128, 128, function (g, w, h) {
    var pal = GLIM_PALS[0];
    function wing(cx, cy, rx, ry, rot, c1, c2) { g.save(); g.translate(cx, cy); g.rotate(rot); var wg = g.createLinearGradient(-rx, 0, rx, 0); wg.addColorStop(0, c1); wg.addColorStop(1, c2); g.fillStyle = wg; g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 2; g.stroke(); g.fillStyle = pal.w[3]; g.beginPath(); g.arc(rx * 0.35, 0, ry * 0.3, 0, Math.PI * 2); g.fill(); g.restore(); }
    [-1, 1].forEach(function (s) { wing(64 + s * 34, 50, 30, 18, s * -0.5, pal.w[0], pal.w[1]); wing(64 + s * 30, 78, 20, 13, s * 0.5, pal.w[1], pal.w[2]); });
    g.strokeStyle = '#8a6ac8'; g.lineWidth = 2; [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(64 + s * 8, 40); g.quadraticCurveTo(64 + s * 16, 14, 64 + s * 26, 12); g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(64 + s * 27, 12, 4, 7, s * 0.6, 0, Math.PI * 2); g.fill(); });
    var bg = g.createRadialGradient(56, 58, 6, 64, 70, 36); bg.addColorStop(0, '#fbf6ff'); bg.addColorStop(1, '#cdb4f0');
    g.fillStyle = bg; g.beginPath(); g.arc(64, 72, 34, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff6fb'; g.beginPath(); g.ellipse(64, 84, 20, 16, 0, 0, Math.PI * 2); g.fill();
    [-1, 1].forEach(function (s) { g.fillStyle = '#2a2040'; g.beginPath(); g.ellipse(64 + s * 12, 68, 6, 7.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(64 + s * 12 - 2, 65, 2.2, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,140,180,0.55)'; g.beginPath(); g.ellipse(64 + s * 22, 78, 6, 4, 0, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#b47aff'; g.beginPath(); g.moveTo(64, 46); g.lineTo(69, 52); g.lineTo(64, 58); g.lineTo(59, 52); g.closePath(); g.fill();
    g.strokeStyle = '#6a4a8a'; g.lineWidth = 2; g.beginPath(); g.arc(60, 78, 4, 0.2, Math.PI - 0.2); g.stroke(); g.beginPath(); g.arc(68, 78, 4, 0.2, Math.PI - 0.2); g.stroke();
  }).toDataURL();
  // the stall slates show its name once someone lives there
  function glimSlateTex(name, kindName) {
    return new THREE.CanvasTexture(glimCanvas(256, 128, function (g, w, h) {
      g.fillStyle = '#2c3430'; g.fillRect(0, 0, w, h);
      g.textAlign = 'center'; g.textBaseline = 'middle';
      var size = name.length > 9 ? 28 : 36;
      for (var k = 0; k < 3; k++) { g.fillStyle = 'rgba(250,248,240,' + (0.3 + k * 0.22) + ')'; g.font = 'italic bold ' + size + 'px Georgia, serif'; g.fillText(name, w / 2 + k * 0.6, h / 2 - 10 + k * 0.5); }
      g.fillStyle = 'rgba(200,170,255,0.8)'; g.font = 'italic 16px Georgia, serif'; g.fillText('✧ ' + (kindName || 'Glimmerwing') + ' ✧', w / 2, h / 2 + 30);
    }));
  }
  // building one: a round ball of dense, realistic fur (many thin shells of strands, darker at the roots and pale at the
  // tips, plus loose hairs standing out all round its outline), big glossy eyes, rosy cheeks, a tiny smile, a curl of
  // fluff on top, little feathery antennae, bean toes and a pom of a tail; and two pairs of realistic, glowing moth wings
  var glimHairTex = (function () {                                      // fine strands for the fur shells: each dot is one hair, its brightness how long it is
    var cv = glimCanvas(256, 256, function (g, w, h) {
      var img = g.createImageData(w, h), d = img.data;
      for (var i = 0; i < w * h; i++) { var v = glimR(i * 0.731) * glimR(i * 1.913 + 3); v = Math.pow(v, 0.55); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255; d[i * 4 + 3] = Math.round(v * 255); }
      g.putImageData(img, 0, 0);
    });
    var tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(9, 6);
    tx.minFilter = THREE.LinearFilter; tx.generateMipmaps = false;    // (no blurring away of the strands at a distance)
    return tx;
  })();
  function glimEyeTex(pal) {                                          // an iris: rich colour fading darker to the rim, with a big pupil
    return new THREE.CanvasTexture(glimCanvas(128, 128, function (g, w, h) {
      var ig = g.createRadialGradient(64, 70, 4, 64, 64, 64); ig.addColorStop(0, '#0c0610'); ig.addColorStop(0.38, '#0c0610'); ig.addColorStop(0.42, pal.iris[0]); ig.addColorStop(0.8, pal.iris[1]); ig.addColorStop(1, '#06030a');
      g.fillStyle = ig; g.fillRect(0, 0, w, h);
      for (var r = 0; r < 40; r++) { var a = r / 40 * Math.PI * 2; g.strokeStyle = 'rgba(255,255,255,' + (0.05 + glimR(r) * 0.08) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(64 + Math.cos(a) * 26, 64 + Math.sin(a) * 26); g.lineTo(64 + Math.cos(a) * 58, 64 + Math.sin(a) * 58); g.stroke(); }   // fine radial streaks
      var lo = g.createRadialGradient(64, 104, 2, 64, 104, 40); lo.addColorStop(0, 'rgba(255,230,255,0.35)'); lo.addColorStop(1, 'rgba(255,230,255,0)'); g.fillStyle = lo; g.fillRect(0, 0, w, h);   // light glowing up from below
    }));
  }
  function glimBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body); abRoom.add(root);
    var P = function (geo, mat, x, y, z, rx, ry, rz, parent) { return abPart(geo, mat, x, y, z, rx, ry, rz, parent || body); };
    var furCol = new THREE.Color(pal.fur), furCol2 = new THREE.Color(pal.fur2), rootCol = furCol.clone().multiplyScalar(0.7);
    var NS = 20, shellMats = [];
    for (var k = 0; k < NS; k++) {                                      // each shell keeps only the longer hairs, so they taper to fine tips
      var f = k / (NS - 1), c = rootCol.clone().lerp(furCol, Math.min(1, f * 1.4)).lerp(furCol2, Math.max(0, f - 0.7) * 0.8);
      shellMats.push(new THREE.MeshStandardMaterial({ map: glimHairTex, color: c, transparent: true, alphaTest: 0.06 + f * 0.88, roughness: 1, emissive: c, emissiveIntensity: 0.18 + f * 0.14 }));
    }
    var core = new THREE.MeshStandardMaterial({ color: rootCol, roughness: 1, emissive: rootCol, emissiveIntensity: 0.1 });
    var hairs = [];                                                     // loose hairs standing out, gathered up and drawn in one batch
    function furBall(r, x, y, z, sx, sy, sz, depth, nHairs, avoid) {
      var seg = new THREE.SphereGeometry(r, 32, 24);
      P(seg, core, x, y, z).scale.set(sx, sy, sz);
      for (var k = 0; k < NS; k++) { var fk = 1 + (k + 1) / NS * depth, sh = P(seg, shellMats[k], x, y, z, 0, k * 0.37, 0); sh.scale.set(sx * fk, sy * fk, sz * fk); sh.castShadow = false; }
      for (var hh = 0; hh < nHairs; hh++) {
        var u = glimR(hh * 1.7 + r * 100) * 2 - 1, th = glimR(hh * 2.3 + r * 100) * Math.PI * 2, rr = Math.sqrt(1 - u * u), nx = rr * Math.cos(th), ny = u, nz = rr * Math.sin(th);
        if (avoid && avoid(nx, ny, nz)) continue;
        var at = 0.98 + glimR(hh * 4.3) * 0.12;                         // rooted right at the skin
        hairs.push([x + nx * r * sx * at, y + ny * r * sy * at, z + nz * r * sz * at, nx, ny, nz, r * depth * (1.0 + glimR(hh * 3.1) * 0.35), glimR(hh * 5.9)]);
      }
    }
    var faceDirs = [[-0.36, 0.16, 0.92], [0.36, 0.16, 0.92], [0, -0.05, 1]];
    function onFace(nx, ny, nz) { for (var i = 0; i < faceDirs.length; i++) { var d = faceDirs[i], l = Math.hypot(d[0], d[1], d[2]); if ((nx * d[0] + ny * d[1] + nz * d[2]) / l > 0.94) return true; } return false; }
    var BY = 0.21, BR = 0.17;
    furBall(BR, 0, BY, 0, 1, 0.93, 1, 0.55, 9000, onFace);                // the round, very fluffy body
    furBall(0.055, 0, BY - 0.01, -0.25, 1, 1, 1, 0.9, 700);              // a pom of a tail
    for (var t = 0; t < 5; t++) { var ta = t / 5 * Math.PI * 1.5; furBall(0.024 - t * 0.002, Math.cos(ta) * 0.024, 0.44 + t * 0.012, 0.03 + Math.sin(ta) * 0.024 - t * 0.008, 1, 1, 1, 0.9, 140); }   // a curl of fluff on top
    (function () {                                                     // the loose hairs, each curving a little and drooping at the tip
      var im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0016, 0.0004, 1, 3).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, emissive: furCol, emissiveIntensity: 0.3 }), hairs.length), hc = new THREE.Color();
      var mx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), pos = new THREE.Vector3();
      hairs.forEach(function (hr, i) {
        dir.set(hr[3] + (glimR(i * 5.1) - 0.5) * 0.3, hr[4] + (glimR(i * 6.3) - 0.5) * 0.3 - 0.04, hr[5] + (glimR(i * 7.7) - 0.5) * 0.3).normalize();
        q.setFromUnitVectors(up, dir); sc.set(1, hr[6], 1); pos.set(hr[0], hr[1], hr[2]);
        mx.compose(pos, q, sc); im.setMatrixAt(i, mx);
        im.setColorAt(i, hc.copy(furCol).multiplyScalar(0.9 + hr[7] * 0.1).lerp(furCol2, hr[7] * 0.3));
      });
      im.castShadow = false; body.add(im);
    })();
    function surf(nx, ny, nz, out) { var l = Math.hypot(nx, ny, nz); return V3(nx / l * BR * out, BY + ny / l * BR * 0.93 * out, nz / l * BR * out); }
    // the eyes: big, round and glossy, looking straight ahead, with a coloured iris, a deep pupil and bright catchlights
    var eyeBall = new THREE.MeshStandardMaterial({ color: 0x120a14, roughness: 0.05, metalness: 0.2 }), irisMat = new THREE.MeshStandardMaterial({ map: glimEyeTex(pal), roughness: 0.15, emissive: 0xffffff, emissiveMap: null, emissiveIntensity: 0 });
    var shine = new THREE.MeshBasicMaterial({ color: 0xffffff }), shine2 = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 });
    [-1, 1].forEach(function (s) {
      var c = surf(s * 0.36, 0.16, 0.92, 1.4), ey = new THREE.Group(); ey.position.copy(c); ey.rotation.set(-0.08, s * 0.22, 0); ey.scale.set(1, 1, 0.42); body.add(ey);   // set into the fur, only just showing their glossy fronts
      var ball = P(new THREE.SphereGeometry(0.05, 28, 20), eyeBall, 0, 0, 0, 0, 0, 0, ey); ball.scale.set(1, 1.08, 0.82);
      var iris = P(new THREE.CircleGeometry(0.043, 32), irisMat, 0, -0.002, 0.0415, 0, 0, 0, ey); iris.scale.set(1, 1.08, 1);   // the iris, on the front of the eye
      P(new THREE.SphereGeometry(0.0435, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0.1, transparent: true, opacity: 0.12, depthWrite: false }), 0, 0, 0.012, Math.PI / 2, 0, 0, ey).scale.set(1, 0.75, 1.08);   // a glassy dome over it
      var hl = P(new THREE.CircleGeometry(0.014, 18), shine, -0.014, 0.017, 0.046, 0, 0, 0, ey); hl.scale.set(1, 1.2, 1);   // a big catchlight
      P(new THREE.CircleGeometry(0.0065, 14), shine2, 0.015, -0.016, 0.046, 0, 0, 0, ey);                                     // and a little one
      for (var l = 0; l < 3; l++) P(new THREE.ConeGeometry(0.003, 0.02, 5), new THREE.MeshStandardMaterial({ color: 0x1a0e18 }), s * (0.036 + l * 0.006), 0.03 - l * 0.009, 0.02, 0.4, 0, -s * (1.0 + l * 0.3), ey);   // three little lashes at the outer corner
      var cp = surf(s * 0.6, -0.02, 0.8, 1.48), ch = P(new THREE.CircleGeometry(0.032, 20), new THREE.MeshBasicMaterial({ color: 0xff8fb0, transparent: true, opacity: 0.45, depthWrite: false }), cp.x, cp.y, cp.z, 0, s * 0.64, 0); ch.scale.set(1.3, 0.8, 1); ch.castShadow = false;   // rosy cheeks
    });
    var mp = surf(0, -0.08, 1, 1.45), smile = new THREE.TorusGeometry(0.01, 0.0026, 5, 12, Math.PI);
    [-1, 1].forEach(function (s) { P(smile, new THREE.MeshStandardMaterial({ color: 0x6a2a4a, roughness: 0.6 }), mp.x + s * 0.01, mp.y, mp.z, 0, 0, Math.PI); });   // a tiny 'w' of a smile
    P(new THREE.SphereGeometry(0.007, 10, 8), new THREE.MeshStandardMaterial({ color: 0xff7aa0, roughness: 0.5 }), mp.x, mp.y - 0.011, mp.z + 0.001).scale.set(1.2, 0.7, 0.6);
    // little feathery antennae, curling out
    var antMat = new THREE.MeshStandardMaterial({ color: pal.ant, roughness: 0.6, emissive: pal.glow, emissiveIntensity: 0.35 }), antennae = [];
    [-1, 1].forEach(function (s) {
      var ap = surf(s * 0.3, 0.9, 0.35, 1.25), ag = new THREE.Group(); ag.position.copy(ap); body.add(ag); antennae.push(ag);
      var curve = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(s * 0.02, 0.07, 0.02), V3(s * 0.06, 0.11, 0.03), V3(s * 0.1, 0.11, 0.0), V3(s * 0.1, 0.085, -0.015)]);
      P(new THREE.TubeGeometry(curve, 16, 0.003, 5), antMat, 0, 0, 0, 0, 0, 0, ag);
      var n = 20, barbs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0012, 0.0008, 1, 3), antMat, n * 2), mx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3();
      for (var b = 0; b < n; b++) {
        var tt = 0.12 + b / n * 0.85, p0 = curve.getPoint(tt), tan = curve.getTangent(tt), len = 0.024 * Math.sin(Math.min(1, tt * 1.1) * Math.PI) + 0.005;
        [-1, 1].forEach(function (side, j) {
          dir.set(0, 1, 0).cross(tan).normalize().multiplyScalar(side).add(tan.clone().multiplyScalar(0.5)).normalize();
          q.setFromUnitVectors(up, dir); sc.set(1, len, 1);
          mx.compose(p0.clone().add(dir.clone().multiplyScalar(len / 2)), q, sc); barbs.setMatrixAt(b * 2 + j, mx);
        });
      }
      barbs.castShadow = false; ag.add(barbs);
    });
    // bean toes peeking out under the fluff
    var toeMat = new THREE.MeshStandardMaterial({ color: pal.feet, roughness: 0.55 });
    [-1, 1].forEach(function (s) {
      P(new THREE.SphereGeometry(0.03, 14, 10), toeMat, s * 0.075, 0.022, 0.17).scale.set(1.05, 0.6, 1.3);
      [-1, 0, 1].forEach(function (k) { P(new THREE.SphereGeometry(0.011, 8, 6), toeMat, s * 0.075 + k * 0.016, 0.022, 0.208).scale.set(1, 0.8, 1); });
    });
    // the wings: realistic moth wings, glowing from within, with a soft halo of light round them
    var upTex = glimWingTex(pal, false), loTex = glimWingTex(pal, true), wings = [];
    function wingMat(tex) { return new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.08, side: THREE.DoubleSide, roughness: 0.7, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.3 }); }
    var haloMat = new THREE.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    var upMat = wingMat(upTex), loMat = wingMat(loTex);
    var upHalo = haloMat.clone(); upHalo.alphaMap = upTex; var loHalo = haloMat.clone(); loHalo.alphaMap = loTex;
    var S1 = 0.42, S2 = 0.31;
    var upGeo = new THREE.PlaneGeometry(S1, S1); upGeo.translate(S1 / 2 - 20 / 512 * S1, -S1 / 2 + 410 / 512 * S1, 0);
    var loGeo = new THREE.PlaneGeometry(S2, S2); loGeo.translate(S2 / 2 - 20 / 512 * S2, -S2 / 2 + 72 / 512 * S2, 0);
    [-1, 1].forEach(function (s) {
      [[upGeo, upMat, upHalo, true], [loGeo, loMat, loHalo, false]].forEach(function (wd) {
        var pv = new THREE.Group(); pv.position.set(s * 0.14, wd[3] ? 0.33 : 0.28, wd[3] ? -0.08 : -0.12); pv.scale.x = s; body.add(pv);
        var rz = wd[3] ? -0.35 : -0.7;                                   // the forewings reach out and a little forward, the hindwings out and back
        var wm = abPart(wd[0], wd[1], 0, 0, 0, Math.PI / 2, 0, rz, pv); wm.castShadow = false;
        var halo = abPart(wd[0], wd[2], 0, 0, 0, Math.PI / 2, 0, rz, pv); halo.scale.set(1.1, 1.1, 1); halo.position.y = -0.006; halo.castShadow = false; halo.renderOrder = 3;
        wings.push({ pv: pv, s: s, up: wd[3] });
      });
    });
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.1, 1.1, 1); glow.position.set(0, 0.28, -0.08); root.add(glow);
    var sparks = [];
    for (var sp = 0; sp < 6; sp++) { var sk = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: pal.glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); sk.scale.set(0.05, 0.05, 1); root.add(sk); sparks.push({ s: sk, t: glimR(sp) * 3, x: 0, z: 0 }); }
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.36, 0.135, 1); tag.position.set(0, 0.72, 0); tag.renderOrder = 6; root.add(tag);
    return { root: root, body: body, wings: wings, antennae: antennae, glow: glow, sparks: sparks, gem: [upHalo, loHalo], wingMats: [upMat, loMat], tagCv: tagCv, tagTex: tagTex };
  }
  // ---------- Mooncalves ----------
  // Gentle, cow-like creatures that share the stalls with the Glimmerwings, but not cows: a pearly white, silver or
  // gold coat whose spots are patches of starry night sky, crescent-moon horns, star-bright hooves and a starlight tuft
  // on its tail. Feed it hay and pet it every day, and the next morning it can be milked (you'll need a Milk Pail) for
  // a bottle of shimmering Moonmilk
  var MOON_COST = 600, PAIL_COST = 80;
  var MOON_PALS = [                                                   // moonlight whites: pearly white, silver and pale gold
    { name: 'Pearl', coat: 0xf6f2ea, belly: 0xffffff, nose: 0xe8b8c0, hoof: 0xe0c890, glow: 0xfff2d0, iris: ['#6a5a8a', '#1a1428'] },
    { name: 'Silver', coat: 0xc8ccd6, belly: 0xf0f2f6, nose: 0xc8a8b4, hoof: 0xd8dce8, glow: 0xdce8ff, iris: ['#3a5a8a', '#0e1828'] },
    { name: 'Gold', coat: 0xeadbb6, belly: 0xfff8e8, nose: 0xe0a8a8, hoof: 0xd8b060, glow: 0xffe4a0, iris: ['#7a5a30', '#24160a'] }
  ];
  var moonStarTex = new THREE.CanvasTexture(glimCanvas(64, 64, function (g, w, h) {
    var sg = g.createRadialGradient(32, 32, 0, 32, 32, 32); sg.addColorStop(0, 'rgba(255,255,255,1)'); sg.addColorStop(0.25, 'rgba(255,250,220,0.9)'); sg.addColorStop(1, 'rgba(255,250,220,0)');
    g.fillStyle = sg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.beginPath();
    for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 7 : 18; g[k ? 'lineTo' : 'moveTo'](32 + Math.cos(a) * r, 32 + Math.sin(a) * r); }
    g.closePath(); g.fill();
  }));
  var moonDropTex = new THREE.CanvasTexture(glimCanvas(64, 64, function (g, w, h) {   // a shimmering drop of Moonmilk, floating over it when it's ready
    var gl = g.createRadialGradient(32, 36, 2, 32, 36, 30); gl.addColorStop(0, 'rgba(220,230,255,0.9)'); gl.addColorStop(1, 'rgba(220,230,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, w, h);
    var dg = g.createLinearGradient(20, 14, 44, 54); dg.addColorStop(0, '#ffffff'); dg.addColorStop(1, '#c8d4f4');
    g.fillStyle = dg; g.beginPath(); g.moveTo(32, 10); g.bezierCurveTo(40, 24, 46, 32, 46, 40); g.arc(32, 40, 14, 0, Math.PI); g.bezierCurveTo(18, 32, 24, 24, 32, 10); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(27, 38, 3, 5, -0.4, 0, Math.PI * 2); g.fill();
  }));
  // the items: Moonmilk, and the Milk Pail you need to collect it
  var moonmilkIcon = glimCanvas(96, 96, function (g, w, h) {
    var glow = g.createRadialGradient(48, 56, 4, 48, 56, 46); glow.addColorStop(0, 'rgba(200,215,255,0.6)'); glow.addColorStop(1, 'rgba(200,215,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(230,240,255,0.55)'; g.strokeStyle = 'rgba(140,150,200,0.9)'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(40, 12); g.lineTo(56, 12); g.lineTo(56, 28); g.quadraticCurveTo(70, 34, 70, 48); g.lineTo(70, 82); g.quadraticCurveTo(70, 88, 64, 88); g.lineTo(32, 88); g.quadraticCurveTo(26, 88, 26, 82); g.lineTo(26, 48); g.quadraticCurveTo(26, 34, 40, 28); g.closePath(); g.fill();
    var mg = g.createLinearGradient(26, 44, 70, 88); mg.addColorStop(0, '#ffffff'); mg.addColorStop(0.5, '#e6e8ff'); mg.addColorStop(1, '#cfe0f8');
    g.fillStyle = mg; g.beginPath(); g.moveTo(27, 46); g.lineTo(69, 46); g.lineTo(69, 82); g.quadraticCurveTo(69, 87, 64, 87); g.lineTo(32, 87); g.quadraticCurveTo(27, 87, 27, 82); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(40, 12); g.lineTo(56, 12); g.lineTo(56, 28); g.quadraticCurveTo(70, 34, 70, 48); g.lineTo(70, 82); g.quadraticCurveTo(70, 88, 64, 88); g.lineTo(32, 88); g.quadraticCurveTo(26, 88, 26, 82); g.lineTo(26, 48); g.quadraticCurveTo(26, 34, 40, 28); g.closePath(); g.stroke();
    g.fillStyle = '#b8a0e8'; g.fillRect(38, 6, 20, 9);                // the stopper
    g.fillStyle = '#8a70c8'; g.beginPath(); g.arc(48, 66, 9, 0.6, Math.PI * 2 - 0.6); g.arc(52, 63, 7, Math.PI * 2 - 0.9, 0.9, true); g.fill();   // a crescent on the label
    g.fillStyle = '#fff'; [[18, 30], [78, 40], [76, 76]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  var pailIcon = glimCanvas(96, 96, function (g, w, h) {
    g.strokeStyle = '#6a6a74'; g.lineWidth = 4; g.beginPath(); g.ellipse(48, 34, 30, 26, 0, Math.PI, Math.PI * 2); g.stroke();   // the handle
    var pg = g.createLinearGradient(18, 0, 78, 0); pg.addColorStop(0, '#9aa2ae'); pg.addColorStop(0.35, '#eef2f6'); pg.addColorStop(0.7, '#c4cad4'); pg.addColorStop(1, '#8a929e');
    g.fillStyle = pg; g.beginPath(); g.moveTo(16, 34); g.lineTo(80, 34); g.lineTo(72, 86); g.lineTo(24, 86); g.closePath(); g.fill();
    g.fillStyle = '#dfe4ea'; g.beginPath(); g.ellipse(48, 34, 32, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f8f8ff'; g.beginPath(); g.ellipse(48, 35, 27, 5.5, 0, 0, Math.PI * 2); g.fill();   // milk inside
    g.strokeStyle = 'rgba(80,90,100,0.5)'; g.lineWidth = 2; [52, 70].forEach(function (y) { g.beginPath(); g.moveTo(19 + (y - 34) * 0.15, y); g.lineTo(77 - (y - 34) * 0.15, y); g.stroke(); });
  }).toDataURL();
  ITEMS.moonmilk = { name: 'Moonmilk', price: 160, icon: '🥛', img: moonmilkIcon, fill: 88, info: 'Shimmering silver milk from a happy Mooncalf. Feed and pet yours every day, then milk it the next morning with a Milk Pail. Sells for a good price at the shipping bin.' };
  ITEMS.milkPail = { name: 'Milk Pail', icon: '🪣', img: pailIcon, fill: 86, info: 'For milking your Mooncalves. Keep it in your bag; it never wears out.' };
  var moonShopIcon = glimCanvas(128, 128, function (g, w, h) {      // a little portrait of one, for the shop
    var glow = g.createRadialGradient(64, 60, 4, 64, 64, 64); glow.addColorStop(0, 'rgba(255,244,210,0.8)'); glow.addColorStop(1, 'rgba(255,244,210,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    g.fillStyle = '#efe9e0'; g.strokeStyle = '#c8bca8'; g.lineWidth = 1.5;
    [-1, 1].forEach(function (s) { g.save(); g.translate(64 + s * 30, 44); g.rotate(s * 0.9); g.beginPath(); g.ellipse(0, 0, 11, 22, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = '#f0c4cc'; g.beginPath(); g.ellipse(0, 0, 6, 15, 0, 0, Math.PI * 2); g.fill(); g.restore(); g.fillStyle = '#efe9e0'; });
    g.fillStyle = '#d8c090'; [-1, 1].forEach(function (s) { g.beginPath(); g.ellipse(64 + s * 9, 30, 4, 8, s * 0.3, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#f3efe8'; g.beginPath(); g.ellipse(64, 60, 26, 28, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(64, 84, 15, 16, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#c89aa4'; g.beginPath(); g.ellipse(64, 94, 6, 4, 0, 0, Math.PI * 2); g.fill();
    [-1, 1].forEach(function (s) { g.fillStyle = '#1e1628'; g.beginPath(); g.ellipse(64 + s * 15, 60, 7, 8.5, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(64 + s * 15 - 2.5, 57, 2.6, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#fff4c8'; g.beginPath(); g.arc(64, 22, 9, 0.7, Math.PI * 2 - 0.7); g.arc(68, 20, 7, Math.PI * 2 - 1.0, 1.0, true); g.fill();   // the crescent
    g.fillStyle = '#fff'; [[24, 96], [104, 90], [100, 22]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  // building one: shaped like a gentle young cow (a barrel body on four sturdy legs, a broad soft muzzle, floppy ears
  // sticking out sideways, a tufted tail), but not quite: its coat is pearly white, silver or gold, its spots are
  // patches of night sky full of twinkling stars, its horns are two glowing crescent moons, its hooves shine like stars
  // and the tuft of its tail is a little cloud of starlight
  function moonCoatTex(pal, glowOnly) {                             // the coat with its night-sky spots (or, for glowOnly, just what glows)
    return new THREE.CanvasTexture(glimCanvas(512, 256, function (g, w, h) {
      var coat = new THREE.Color(pal.coat), belly = new THREE.Color(pal.belly);
      if (glowOnly) { g.fillStyle = '#222'; g.fillRect(0, 0, w, h); }
      else {
        var gr = g.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, '#' + coat.clone().multiplyScalar(0.92).getHexString()); gr.addColorStop(0.5, '#' + coat.getHexString()); gr.addColorStop(1, '#' + coat.clone().lerp(belly, 0.7).getHexString());
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
        for (var i = 0; i < 9000; i++) { var x = glimR(i * 1.3 + 90) * w, y = glimR(i * 2.9 + 90) * h; g.strokeStyle = glimR(i * 6.3) > 0.45 ? 'rgba(255,255,255,0.12)' : 'rgba(80,70,60,0.05)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 1); g.stroke(); }
      }
      // the spots: soft-edged blobs like a cow's patches, wrapping round the body (and across the seam)
      var spots = [[70, 70, 60, 46], [200, 60, 70, 50], [330, 90, 55, 60], [450, 60, 64, 44], [140, 150, 50, 40], [390, 165, 46, 36], [260, 140, 36, 30]];
      spots.forEach(function (sp, k) {
        [-w, 0, w].forEach(function (off) {
          g.save(); g.translate(sp[0] + off, sp[1]);
          g.beginPath();
          for (var a = 0; a <= 24; a++) { var an = a / 24 * Math.PI * 2, r = 1 + (glimR(k * 31 + a) - 0.5) * 0.35 + Math.sin(an * 3 + k) * 0.12; g[a ? 'lineTo' : 'moveTo'](Math.cos(an) * sp[2] * r, Math.sin(an) * sp[3] * r); }
          g.closePath();
          if (glowOnly) { g.fillStyle = '#2a2850'; g.fill(); }
          else {
            var sg = g.createRadialGradient(0, 0, 4, 0, 0, Math.max(sp[2], sp[3]) * 1.1);
            sg.addColorStop(0, '#1c1a4c'); sg.addColorStop(0.7, '#2a2160'); sg.addColorStop(1, '#4a3a80');
            g.fillStyle = sg; g.fill();
            var neb = g.createRadialGradient(sp[2] * 0.2, -sp[3] * 0.2, 2, sp[2] * 0.2, -sp[3] * 0.2, sp[2] * 0.7); neb.addColorStop(0, 'rgba(170,120,230,0.35)'); neb.addColorStop(1, 'rgba(170,120,230,0)'); g.fillStyle = neb; g.fill();
          }
          g.save(); g.clip();
          for (var s = 0; s < 40; s++) {                               // stars inside each spot
            var sx = (glimR(k * 50 + s * 1.7) - 0.5) * sp[2] * 2, sy = (glimR(k * 50 + s * 2.9) - 0.5) * sp[3] * 2, sr = 0.6 + glimR(k * 50 + s * 3.7) * 1.6;
            g.fillStyle = 'rgba(255,250,230,' + (0.5 + glimR(s + k) * 0.5) + ')'; g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
            if (sr > 1.8) { g.fillRect(sx - 0.5, sy - sr * 2.4, 1, sr * 4.8); g.fillRect(sx - sr * 2.4, sy - 0.5, sr * 4.8, 1); }   // a few bright twinkling ones
          }
          g.restore(); g.restore();
        });
      });
    }));
  }
  function moonBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body); abRoom.add(root);
    var coatCol = new THREE.Color(pal.coat), bellyCol = new THREE.Color(pal.belly), muzzleCol = new THREE.Color(pal.belly).lerp(new THREE.Color(pal.nose), 0.45);
    var coatMap = moonCoatTex(pal, false), glowMap = moonCoatTex(pal, true);
    coatMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var coat = new THREE.MeshStandardMaterial({ map: coatMap, roughness: 0.75, emissive: 0xffffff, emissiveMap: glowMap, emissiveIntensity: 0.9 });
    var plain = new THREE.MeshStandardMaterial({ color: coatCol, roughness: 0.8, emissive: coatCol, emissiveIntensity: 0.13 });
    var belly = new THREE.MeshStandardMaterial({ color: bellyCol, roughness: 0.8, emissive: bellyCol, emissiveIntensity: 0.16 });
    var nap = new THREE.MeshStandardMaterial({ map: glimHairTex, color: coatCol.clone().lerp(bellyCol, 0.4), transparent: true, alphaTest: 0.62, roughness: 1, emissive: coatCol, emissiveIntensity: 0.12 });
    var seg = new THREE.SphereGeometry(1, 40, 28);
    function part(geo, mat, x, y, z, sx, sy, sz, parent, rx, ry, rz, napped) {
      var m = abPart(geo, mat, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); m.scale.set(sx, sy, sz);
      if (napped) { var v = abPart(geo, nap, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); v.scale.set(sx * 1.02, sy * 1.02, sz * 1.02); v.castShadow = false; }
      return m;
    }
    var BY = 0.45;
    // the body: a deep, round barrel, with a soft pale belly
    part(seg, coat, 0, BY, -0.01, 0.2, 0.195, 0.34, body, 0, 0.4, 0, true);
    part(seg, coat, 0, BY + 0.01, 0.16, 0.19, 0.2, 0.17, body, 0, 2.1, 0, true);        // the chest
    part(seg, coat, 0, BY + 0.02, -0.19, 0.195, 0.2, 0.16, body, 0, 4.0, 0, true);      // the rump
    part(seg, belly, 0, BY - 0.12, 0.0, 0.13, 0.08, 0.26);
    // a short thick neck and a broad, gentle head
    part(seg, plain, 0, BY + 0.07, 0.3, 0.13, 0.14, 0.13, body, 0, 0, 0, true);
    var head = new THREE.Group(); head.position.set(0, BY + 0.13, 0.42); body.add(head);
    part(seg, plain, 0, 0, 0, 0.115, 0.12, 0.12, head, 0, 0, 0, true);
    var muzzleMat = new THREE.MeshStandardMaterial({ color: muzzleCol, roughness: 0.45, emissive: muzzleCol, emissiveIntensity: 0.16 });
    part(seg, muzzleMat, 0, -0.06, 0.1, 0.095, 0.07, 0.075, head);                       // a broad soft muzzle
    [-1, 1].forEach(function (s) { part(seg, new THREE.MeshStandardMaterial({ color: 0x6a4a5a, roughness: 0.5 }), s * 0.035, -0.045, 0.168, 0.013, 0.018, 0.008, head, 0, 0, s * 0.3); });   // nostrils
    var smile = new THREE.TorusGeometry(0.016, 0.003, 5, 14, Math.PI);
    abPart(smile, new THREE.MeshStandardMaterial({ color: 0x6a4a5a, roughness: 0.6 }), 0, -0.088, 0.158, 0.4, 0, Math.PI, head);
    // a fluffy forelock between the horns
    var tuftMats = [0, 1, 2, 3, 4, 5].map(function (k) { return new THREE.MeshStandardMaterial({ map: glimHairTex, color: coatCol.clone().lerp(bellyCol, 0.3), transparent: true, alphaTest: 0.1 + k * 0.15, roughness: 1, emissive: coatCol, emissiveIntensity: 0.2 }); });
    part(seg, plain, 0, 0.09, 0.03, 0.05, 0.035, 0.05, head);
    for (var tk = 0; tk < 6; tk++) { var tf = 1 + (tk + 1) * 0.12, tm = abPart(seg, tuftMats[tk], 0, 0.09, 0.03, 0, tk, 0, head); tm.scale.set(0.05 * tf, 0.035 * tf, 0.05 * tf); tm.castShadow = false; }
    // big gentle eyes, and rosy cheeks
    var eyeBall = new THREE.MeshStandardMaterial({ color: 0x120a14, roughness: 0.04, metalness: 0.2 }), irisMat = new THREE.MeshStandardMaterial({ map: glimEyeTex(pal), roughness: 0.12 });
    var shine = new THREE.MeshBasicMaterial({ color: 0xffffff }), shine2 = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    [-1, 1].forEach(function (s) {
      var ey = new THREE.Group(); ey.position.set(s * 0.068, 0.025, 0.088); ey.rotation.set(-0.05, s * 0.55, 0); ey.scale.set(1, 1, 0.45); head.add(ey);
      abPart(new THREE.SphereGeometry(0.036, 24, 18), eyeBall, 0, 0, 0, 0, 0, 0, ey).scale.set(1, 1.08, 0.85);
      abPart(new THREE.CircleGeometry(0.031, 28), irisMat, 0, -0.002, 0.0305, 0, 0, 0, ey).scale.set(1, 1.08, 1);
      abPart(new THREE.CircleGeometry(0.011, 16), shine, -0.011, 0.014, 0.034, 0, 0, 0, ey).scale.set(1, 1.2, 1);
      abPart(new THREE.CircleGeometry(0.005, 12), shine2, 0.012, -0.012, 0.034, 0, 0, 0, ey);
      for (var l = 0; l < 3; l++) abPart(new THREE.ConeGeometry(0.003, 0.018, 5), new THREE.MeshStandardMaterial({ color: 0x2a1a20 }), s * (0.028 + l * 0.006), 0.026 - l * 0.008, 0.018, 0.4, 0, -s * (1.0 + l * 0.3), ey);
      var ch = abPart(new THREE.CircleGeometry(0.024, 18), new THREE.MeshBasicMaterial({ color: 0xff9ab4, transparent: true, opacity: 0.4, depthWrite: false }), s * 0.088, -0.035, 0.07, 0, s * 0.8, 0, head); ch.scale.set(1.3, 0.8, 1); ch.castShadow = false;
    });
    // floppy ears sticking out sideways, pink inside
    var innerMat = new THREE.MeshStandardMaterial({ color: muzzleCol, roughness: 0.7, emissive: muzzleCol, emissiveIntensity: 0.12 });
    var ears = [];
    [-1, 1].forEach(function (s) {
      var ep = new THREE.Group(); ep.position.set(s * 0.1, 0.045, -0.02); head.add(ep);
      part(seg, plain, s * 0.055, 0, 0, 0.065, 0.024, 0.036, ep, 0, 0, 0, true);
      part(seg, innerMat, s * 0.058, 0.008, 0.006, 0.052, 0.012, 0.026, ep);
      ears.push({ g: ep, s: s });
    });
    // horns: two glowing crescent moons
    var hornMat = new THREE.MeshStandardMaterial({ color: 0xfffbe8, emissive: pal.glow, emissiveIntensity: 1.0, roughness: 0.3 });
    var hornGlows = [];
    [-1, 1].forEach(function (s) {
      var hg = new THREE.Group(); hg.position.set(s * 0.065, 0.095, -0.01); hg.rotation.set(0, 0, -s * 0.25); head.add(hg);
      var crescent = new THREE.TorusGeometry(0.045, 0.012, 10, 24, Math.PI * 0.95);
      var horn = abPart(crescent, hornMat, s * 0.045, 0.0, 0, 0, 0, s > 0 ? 0 : Math.PI * 0.05, hg); horn.scale.set(s, 1, 1);   // curving up and out, then in, like a crescent
      var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      gl.scale.set(0.16, 0.16, 1); gl.position.set(s * 0.045, 0.03, 0); hg.add(gl); hornGlows.push(gl);
    });
    // four sturdy legs, each on a hoof that shines like a star
    var hoofMat = new THREE.MeshStandardMaterial({ color: 0xfffaf0, emissive: pal.glow, emissiveIntensity: 0.9, roughness: 0.3 });
    var legs = [], hoofGlows = [];
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (lp) {
      var front = lp[1] > 0, hip = new THREE.Group(); hip.position.set(lp[0] * 0.11, BY - 0.08, front ? 0.17 : -0.2); body.add(hip);
      part(new THREE.CylinderGeometry(0.04, 0.06, 0.2, 16), coat, 0, -0.08, 0, 1, 1, 1, hip, 0, lp[0] + lp[1], 0, true);
      var knee = new THREE.Group(); knee.position.set(0, -0.19, 0); hip.add(knee);
      part(seg, plain, 0, 0, 0, 0.036, 0.034, 0.036, knee);
      part(new THREE.CylinderGeometry(0.03, 0.036, 0.15, 14), plain, 0, -0.075, 0, 1, 1, 1, knee, 0, 0, 0, true);
      abPart(new THREE.CylinderGeometry(0.036, 0.042, 0.04, 16), hoofMat, 0, -0.165, 0.004, 0, 0, 0, knee);
      var hgl = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonStarTex, color: pal.glow, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
      hgl.scale.set(0.1, 0.1, 1); hgl.position.set(0, -0.165, 0.03); knee.add(hgl); hoofGlows.push(hgl);
      legs.push({ hip: hip, knee: knee, ph: lp[0] * lp[1] > 0 ? 0 : Math.PI, back: !front });
    });
    // a long thin tail with a tuft of starlight at the end
    var tail = new THREE.Group(); tail.position.set(0, BY + 0.13, -0.33); body.add(tail);
    var tc = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0, -0.03, -0.04), V3(0, -0.13, -0.06), V3(0, -0.26, -0.05)]);
    abPart(new THREE.TubeGeometry(tc, 16, 0.009, 6), plain, 0, 0, 0, 0, 0, 0, tail);
    var tuftCol = new THREE.Color(pal.glow);
    var tuftM = [0, 1, 2, 3, 4].map(function (k) { return new THREE.MeshStandardMaterial({ map: glimHairTex, color: 0xffffff, transparent: true, alphaTest: 0.1 + k * 0.17, roughness: 1, emissive: tuftCol, emissiveIntensity: 0.5 }); });
    for (var tt = 0; tt < 5; tt++) { var f2 = 1 + tt * 0.25, tf2 = abPart(seg, tuftM[tt], 0, -0.29, -0.05, 0, tt, 0, tail); tf2.scale.set(0.025 * f2, 0.045 * f2, 0.025 * f2); tf2.castShadow = false; }
    var star = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonStarTex, color: pal.glow, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    star.scale.set(0.11, 0.11, 1); star.position.set(0, -0.3, -0.05); tail.add(star);
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.5, 1.5, 1); glow.position.set(0, 0.5, 0); root.add(glow);
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.42, 0.16, 1); tag.position.set(0, 1.1, 0); tag.renderOrder = 6; root.add(tag);
    return { root: root, body: body, head: head, ears: ears, legs: legs, tail: tail, star: star, coat: coat, hornMat: hornMat, hornGlows: hornGlows, hoofMat: hoofMat, hoofGlows: hoofGlows, glow: glow, tagCv: tagCv, tagTex: tagTex };
  }
  // when it's ready to milk, a shimmering drop of Moonmilk floats over it
  function moonBuildExtras(g) {
    var sz = GLIM_STALLS[g.stall];
    var drop = new THREE.Group(); abRoom.add(drop);
    var ds = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonDropTex, transparent: true, depthWrite: false })); ds.scale.set(0.16, 0.16, 1); drop.add(ds);
    var eg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xd8e0ff, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    eg.scale.set(0.4, 0.4, 1); drop.add(eg);
    g.eggMesh = drop; g.eggGlow = eg;
    var hay = abPart(wbLumpGeo(300 + g.stall, 0.25), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.3, 0.94, sz + 1.0);
    hay.scale.set(0.16, 0.07, 0.16); g.hayMesh = hay;
    g.slate.map = glimSlateTex(g.name, 'Mooncalf'); g.slate.needsUpdate = true;
  }
  // every frame, for a Mooncalf: an unhurried amble, head nodding, ears flicking, tail swishing, the stars in its
  // spots twinkling and its moon horns glowing softly; when petted, it leans in, ears up and tail swishing happily
  function moonAnimate(g, dt, t, moving) {
    var m = g.m;
    if (moving) g.hop += dt * 5.5;
    m.legs.forEach(function (l) {
      var sw = moving ? Math.sin(g.hop + l.ph) : 0;
      l.hip.rotation.x = l.hip.rotation.x * 0.8 + sw * 0.35 * 0.2;
      l.knee.rotation.x = l.knee.rotation.x * 0.8 + (moving ? Math.max(0, Math.sin(g.hop + l.ph + 1.2)) * (l.back ? 0.45 : -0.45) : 0) * 0.2;
    });
    var breathe = 1 + Math.sin(t * 1.3 + g.stall) * 0.012;
    m.body.scale.set(breathe, breathe, 1);
    m.body.position.y = moving ? Math.abs(Math.sin(g.hop)) * 0.01 : 0;
    if (g.pet > 0) { g.pet -= dt; m.head.rotation.set(0.12 + Math.sin(g.pet * 4) * 0.06, Math.sin(g.pet * 5) * 0.15, Math.sin(g.pet * 3) * 0.08); }
    else {
      var graze = Math.max(0, Math.sin(t * 0.21 + g.stall * 2.3) - 0.6) * 2.2;   // now and then it lowers its head to nose at the straw
      m.head.rotation.set(graze * 0.45 + Math.sin(t * 0.7 + g.stall) * 0.05 + (moving ? Math.sin(g.hop * 2) * 0.05 : 0), Math.sin(t * 0.4 + g.stall * 2) * 0.3 * (1 - graze * 0.6), Math.sin(t * 0.33 + g.stall) * 0.06);
    }
    m.ears.forEach(function (e, k) {
      var flick = Math.max(0, Math.sin(t * 0.9 + k * 2.3 + g.stall) - 0.94) * 12;
      e.g.rotation.z = e.s * (-0.25 + Math.sin(t * 1.2 + k) * 0.06 + flick * 0.3 + (g.pet > 0 ? 0.35 : 0));
      e.g.rotation.y = e.s * flick * 0.2;
    });
    m.tail.rotation.z = Math.sin(t * 1.6 + g.stall) * 0.25 + (g.pet > 0 ? Math.sin(t * 9) * 0.35 : 0);
    m.tail.rotation.x = -0.1 + Math.sin(t * 1.1) * 0.05;
    var pulse = 0.5 + Math.sin(t * 1.5 + g.stall * 1.3) * 0.5;
    m.coat.emissiveIntensity = 0.75 + Math.sin(t * 2.6 + g.stall) * 0.25;           // the stars in its spots twinkle
    m.hornMat.emissiveIntensity = 0.8 + pulse * 0.4 + (g.egg ? 0.4 : 0);
    m.hornGlows.forEach(function (h) { h.material.opacity = 0.35 + pulse * 0.25 + (g.egg ? 0.2 : 0); });
    m.hoofGlows.forEach(function (h, k) { h.material.opacity = 0.35 + Math.sin(t * 2.2 + k * 1.7) * 0.2; });
    m.star.material.opacity = 0.6 + Math.sin(t * 3 + g.stall) * 0.3;
    m.glow.material.opacity = 0.12 + pulse * 0.05;
    if (g.egg) { g.eggMesh.position.set(g.x, 1.0 + Math.sin(t * 2) * 0.04, g.z); g.eggGlow.material.opacity = 0.35 + Math.sin(t * 2 + g.stall) * 0.12; }
  }



  function glimDrawTag(g) {
    var c = g.m.tagCv.getContext('2d'), w = 256, h = 96;
    c.clearRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.88)'; c.beginPath(); c.moveTo(24, 6); c.lineTo(w - 24, 6); c.quadraticCurveTo(w - 4, 6, w - 4, 26); c.lineTo(w - 4, h - 26); c.quadraticCurveTo(w - 4, h - 6, w - 24, h - 6); c.lineTo(24, h - 6); c.quadraticCurveTo(4, h - 6, 4, h - 26); c.lineTo(4, 26); c.quadraticCurveTo(4, 6, 24, 6); c.fill();
    c.strokeStyle = '#c8a8f0'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#5a3d9a'; c.font = 'bold 30px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(g.name, w / 2, 34);
    function hay(x, y, on) { c.fillStyle = on ? '#e0b040' : '#cfc8d8'; for (var i = -3; i <= 3; i++) { c.save(); c.translate(x + i * 2, y); c.rotate(i * 0.12); c.fillRect(-1.5, -12, 3, 24); c.restore(); } c.fillStyle = on ? '#a86a2a' : '#b8b0c4'; c.fillRect(x - 9, y - 2, 18, 4); }
    function heart(x, y, on) { c.fillStyle = on ? '#ff6aa8' : '#cfc8d8'; c.beginPath(); c.moveTo(x, y + 10); c.bezierCurveTo(x - 14, y, x - 12, y - 11, x - 5, y - 11); c.bezierCurveTo(x - 2, y - 11, x, y - 8, x, y - 6); c.bezierCurveTo(x, y - 8, x + 2, y - 11, x + 5, y - 11); c.bezierCurveTo(x + 12, y - 11, x + 14, y, x, y + 10); c.fill(); }
    hay(w / 2 - 34, 68, g.fed); heart(w / 2 + 34, 68, g.petted);
    c.fillStyle = g.fed ? '#3a8a4a' : '#a898b8'; c.font = 'bold 16px Fredoka, sans-serif'; c.fillText(g.fed ? '✓' : '•', w / 2 - 14, 70);
    c.fillStyle = g.petted ? '#3a8a4a' : '#a898b8'; c.fillText(g.petted ? '✓' : '•', w / 2 + 54, 70);
    g.m.tagTex.needsUpdate = true;
  }
  // its egg, nestled in the straw, and a bundle of hay in the manger when it's been fed
  function glimBuildExtras(g) {
    var sz = GLIM_STALLS[g.stall];
    var egg = new THREE.Group(); egg.position.set(-3.3, 0.1, sz - 0.6); abRoom.add(egg);   // (sitting up on top of the straw bedding)
    var nest = abPart(new THREE.TorusGeometry(0.085, 0.035, 8, 20), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), 0, 0.015, 0, Math.PI / 2, 0, 0, egg); nest.scale.set(1, 1, 0.6);
    var e = abPart(new THREE.SphereGeometry(0.058, 24, 16), glimEggMat, 0, 0.07, 0, 0.15, 0, 0.1, egg); e.scale.set(1, 1.28, 1);
    var eg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xd8b8ff, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    eg.scale.set(0.45, 0.45, 1); eg.position.y = 0.07; egg.add(eg);
    g.eggMesh = egg; g.eggGlow = eg;
    var hay = abPart(wbLumpGeo(300 + g.stall, 0.25), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.3, 0.94, sz + 1.0);
    hay.scale.set(0.16, 0.07, 0.16); g.hayMesh = hay;
    g.slate.map = glimSlateTex(g.name); g.slate.needsUpdate = true;
  }
  function glimRefresh(g) { g.eggMesh.visible = !!g.egg; g.hayMesh.visible = !!g.fed; glimDrawTag(g); }
  function glimAdd(d) {                                              // d: { kind ('glim' or 'moon'), name, stall, pal, fed, petted, egg }
    var g = { kind: d.kind === 'moon' ? 'moon' : 'glim', name: d.name, stall: d.stall, pal: d.pal, fed: !!d.fed, petted: !!d.petted, egg: !!d.egg };
    g.m = g.kind === 'moon' ? moonBuild(MOON_PALS[g.pal % MOON_PALS.length]) : glimBuild(GLIM_PALS[g.pal % GLIM_PALS.length]);
    g.slate = abStallSlates[g.stall];
    var sz = GLIM_STALLS[g.stall];
    g.x = g.kind === 'moon' ? -3.1 : -3.0; g.z = sz - 0.2; g.tx = g.x; g.tz = g.z; g.face = Math.PI / 2; g.wait = 1 + glimR(g.stall) * 2; g.hop = 0; g.pet = 0; g.flut = glimR(g.stall * 7) * 6;
    if (g.kind === 'moon') moonBuildExtras(g); else glimBuildExtras(g);
    glimmers.push(g); glimRefresh(g);
    return g;
  }
  function glimFreeStall() { for (var s = 0; s < GLIM_STALLS.length; s++) if (!glimmers.some(function (g) { return g.stall === s; })) return s; return -1; }
  // hearts that float up when you pet one
  var glimHearts = [];
  function glimHeartBurst(x, y, z) {
    for (var i = 0; i < 6; i++) {
      var h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimHeartTex, transparent: true, depthWrite: false })); h.scale.set(0.09, 0.09, 1);
      h.position.set(x + (Math.random() - 0.5) * 0.25, y, z + (Math.random() - 0.5) * 0.25); abRoom.add(h);
      glimHearts.push({ s: h, t: -i * 0.12, vx: (Math.random() - 0.5) * 0.15 });
    }
  }
  // every frame: a new day lays eggs; and the Glimmerwings potter about their stalls
  function updateGlimmers(dt) {
    if (glimDay === null) glimDay = state.day;
    if (state.day !== glimDay) {
      var laid = [], milk = [];
      if (state.day > glimDay) glimmers.forEach(function (g) {
        if (g.fed && g.petted && !g.egg) { g.egg = true; (g.kind === 'moon' ? milk : laid).push(g.name); }
        g.fed = false; g.petted = false; glimRefresh(g);
      });
      glimDay = state.day;
      var news = [];
      if (laid.length) news.push(laid.join(' and ') + (laid.length > 1 ? ' each laid' : ' laid') + ' a Glimmer Egg');
      if (milk.length) news.push(milk.join(' and ') + (milk.length > 1 ? ' are' : ' is') + ' ready to milk');
      if (news.length) setTimeout(function () { showToast('✧ ' + news.join(', and ') + '! Visit them at Fluff & Feather.', 3600); }, 4200);
    }
    if (!inBarn) return;
    var t = state.time;
    glimmers.forEach(function (g) {
      var sz = GLIM_STALLS[g.stall], m = g.m;
      g.wait -= dt;
      var moon = g.kind === 'moon';
      if (g.wait <= 0 && g.pet <= 0) {
        if (moon) { g.tx = -3.35 + Math.random() * 0.5; g.tz = sz - 0.55 + Math.random() * 0.75; g.wait = 4 + Math.random() * 6; }   // (bigger, so it ambles about less)
        else { g.tx = -3.5 + Math.random() * 0.85; g.tz = sz - 0.9 + Math.random() * 1.3; g.wait = 2.5 + Math.random() * 4; }
      }
      var dx = g.tx - g.x, dz = g.tz - g.z, d = Math.hypot(dx, dz), moving = d > 0.03 && g.pet <= 0;
      if (moving) { var stp = Math.min(d, dt * (moon ? 0.16 : 0.35)); g.x += dx / d * stp; g.z += dz / d * stp; g.face = Math.atan2(dx, dz); if (!moon) g.hop += dt * 9; }
      else if (!moon) g.hop = 0;
      var cur = m.root.rotation.y, diff = Math.atan2(Math.sin(g.face - cur), Math.cos(g.face - cur));
      m.root.rotation.y = cur + diff * Math.min(1, dt * (moon ? 2 : 5));
      if (moon) { m.root.position.set(g.x, 0, g.z); moonAnimate(g, dt, t, moving); return; }
      var hopY = moving ? Math.abs(Math.sin(g.hop)) * 0.06 : 0, breathe = 1 + Math.sin(t * 2.2 + g.stall) * 0.02;
      m.root.position.set(g.x, hopY, g.z);
      if (g.pet > 0) {                                               // a happy wiggle while being petted
        g.pet -= dt;
        m.body.rotation.z = Math.sin(g.pet * 18) * 0.18; m.body.scale.set(1 + Math.sin(g.pet * 14) * 0.05, 1 - Math.sin(g.pet * 14) * 0.05, 1);
      } else { m.body.rotation.z = 0; m.body.scale.set(breathe, 1 / breathe, breathe); }
      var fast = moving || g.pet > 0, speed = fast ? 14 : 2.2, amp = fast ? 0.5 : 0.1;    // the wings drift gently, and flutter when it moves or is petted
      g.flut += dt * speed;
      m.wings.forEach(function (w) { var lift = (w.up ? 0.38 : 0.24) + (fast ? 0.1 : 0); w.pv.rotation.z = w.s * (lift + Math.sin(g.flut + (w.up ? 0 : 0.5)) * amp); w.pv.rotation.y = w.s * (fast ? Math.sin(g.flut) * 0.2 : 0); });   // held out to the sides, flapping
      m.antennae.forEach(function (a, k) { a.rotation.z = Math.sin(t * 3 + k * 1.3 + g.stall) * 0.12; a.rotation.x = Math.sin(t * 2.3 + k) * 0.08; });
      m.glow.material.opacity = 0.25 + Math.sin(t * 1.7 + g.stall) * 0.07;
      var pulse = 0.5 + Math.sin(t * 2.0 + g.stall * 1.7) * 0.5;      // the wings' glow breathes slowly
      m.gem[0].opacity = m.gem[1].opacity = 0.08 + pulse * 0.12; m.wingMats[0].emissiveIntensity = m.wingMats[1].emissiveIntensity = 0.22 + pulse * 0.2;
      m.sparks.forEach(function (sp, k) {                            // a few sparkles drifting up off its wings
        sp.t += dt * 0.6;
        if (sp.t > 1) { sp.t -= 1 + Math.random() * 1.5; sp.x = (Math.random() - 0.5) * 0.5; sp.z = (Math.random() - 0.5) * 0.4; }
        var vis = sp.t > 0; sp.s.material.opacity = vis ? Math.sin(sp.t * Math.PI) * 0.9 : 0;
        sp.s.position.set(sp.x, 0.25 + Math.max(0, sp.t) * 0.5, sp.z);
      });
      if (g.egg) { g.eggGlow.material.opacity = 0.35 + Math.sin(t * 2 + g.stall) * 0.12; }
    });
    for (var i = glimHearts.length - 1; i >= 0; i--) {
      var h = glimHearts[i]; h.t += dt;
      if (h.t < 0) { h.s.visible = false; continue; }
      h.s.visible = true; h.s.position.y += dt * 0.45; h.s.position.x += h.vx * dt; h.s.material.opacity = Math.max(0, 1 - h.t / 1.3);
      if (h.t > 1.3) { abRoom.remove(h.s); h.s.material.dispose(); glimHearts.splice(i, 1); }
    }
  }
  // reaching one: standing in its stall, or just in front of it in the aisle
  function glimmerInReach() {
    if (!inBarn || glimNaming) return null;
    var lx = player.position.x - AB_X, lz = player.position.z - AB_Z, best = null;
    glimmers.forEach(function (g) { var sz = GLIM_STALLS[g.stall]; if (lx < -2.2 + 0.95 && Math.abs(lz - sz) < 1.25) best = g; });
    return best;
  }
  function glimmerAction() {
    var g = glimmerInReach(); if (!g) return;
    var wx = AB_X + g.x, wz = AB_Z + g.z;
    if (g.kind === 'moon') { mooncalfAction(g, wx, wz); return; }
    if (g.egg) {                                                       // collect its egg
      if (!roomFor(['glimmerEgg'])) { bagFull(); return; }
      addItem('glimmerEgg', 1); g.egg = false; glimRefresh(g); popSound();
      showToast('You collected a Glimmer Egg from ' + g.name + '! ✧', 2200);
      return;
    }
    if (!g.fed) {                                                      // feed it a bundle of hay
      if (!takeItem('hay', 1)) { showToast(g.name + ' is hungry! Buy hay at the counter to feed them 🌾', 2600); return; }
      g.fed = true; glimRefresh(g); popSound(); g.pet = 0.9; g.face = Math.atan2(-3.7 - g.x, GLIM_STALLS[g.stall] + 1.0 - g.z);
      showToast(g.name + ' munches happily on the hay 🌾' + (g.petted ? ' An egg tomorrow morning!' : ' Now give them a pet!'), 2400);
      return;
    }
    if (!g.petted) {                                                   // pet it
      g.petted = true; glimRefresh(g); g.pet = 1.4;
      g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, 0.5, g.z); popSound();
      showToast(g.name + ' coos and flutters their wings 💜 An egg tomorrow morning!', 2400);
      return;
    }
    g.pet = 0.8; glimHeartBurst(g.x, 0.5, g.z);
    showToast(g.name + ' is fed, petted and happy ✧ Come back tomorrow!', 2000);
  }
  function mooncalfAction(g, wx, wz) {                               // milking, feeding and petting a Mooncalf
    if (g.egg) {
      if (!bag.some(function (b) { return b && b.id === 'milkPail'; })) { showToast(g.name + ' is ready to milk! You need a Milk Pail: buy one at the counter 🪣', 2800); return; }
      if (!roomFor(['moonmilk'])) { bagFull(); return; }
      addItem('moonmilk', 1); g.egg = false; glimRefresh(g); popSound(); g.pet = 1.0;
      showToast('You milked ' + g.name + ' and got a bottle of shimmering Moonmilk! 🥛✧', 2400);
      return;
    }
    if (!g.fed) {
      if (!takeItem('hay', 1)) { showToast(g.name + ' is hungry! Buy hay at the counter to feed them 🌾', 2600); return; }
      g.fed = true; glimRefresh(g); popSound(); g.pet = 1.0; g.face = Math.atan2(-3.7 - g.x, GLIM_STALLS[g.stall] + 1.0 - g.z);
      showToast(g.name + ' munches the hay contentedly 🌾' + (g.petted ? ' Moonmilk tomorrow morning!' : ' Now give them a pet!'), 2400);
      return;
    }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 1.6;
      g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, 0.9, g.z); popSound();
      showToast(g.name + ' leans into your hand and hums softly 💜 Moonmilk tomorrow morning!', 2400);
      return;
    }
    g.pet = 1.0; glimHeartBurst(g.x, 0.9, g.z);
    showToast(g.name + ' is fed, petted and happy ✧ Come back tomorrow!', 2000);
  }
  var glimBaseInteract = interact;                                   // pressing Interact near a stall looks after its Glimmerwing
  interact = function () {
    if (glimNaming) return;
    if (!binOpen && !shopOpen && !barnShopOpen && glimmerInReach()) { glimmerAction(); return; }
    return glimBaseInteract();
  };
  var glimBtn = document.createElement('button');
  glimBtn.type = 'button'; glimBtn.className = 'sleep-btn ship-btn';
  canvas.parentNode.appendChild(glimBtn);
  glimBtn.addEventListener('click', function () { glimmerAction(); focusGame(); });
  var glimBtnText = '';
  function updateGlimButton() {
    var g = glimmerInReach(), txt = '';
    if (g && !barnShopOpen) txt = g.egg ? (g.kind === 'moon' ? '🥛 Milk ' + g.name : '🥚 Collect egg') : !g.fed ? '🌾 Feed ' + g.name : !g.petted ? '💜 Pet ' + g.name : '✧ ' + g.name;
    if (txt !== glimBtnText) { glimBtnText = txt; if (txt) glimBtn.innerHTML = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;') + ' <kbd>E</kbd>'; }
    var show = !!txt;
    if (glimBtn.classList.contains('show') !== show) glimBtn.classList.toggle('show', show);
  }
  // naming a new one
  var GLIM_NAMES = ['Pip', 'Luma', 'Mochi', 'Twinkle', 'Nova', 'Biscuit', 'Wisp', 'Pebble', 'Sprout', 'Bramble', 'Maple', 'Poppy', 'Juniper', 'Nimbus', 'Clover', 'Sorrel'];
  var glimNameBox = document.createElement('div');
  glimNameBox.className = 'inventory ship shop';
  glimNameBox.hidden = true;
  glimNameBox.innerHTML = '<div class="inv-head"><b class="glim-title">✧ Name your Glimmerwing</b></div>' +
    '<p class="ship-hint">What would you like to call your new friend? They\'ll move into a stall here at Fluff &amp; Feather.</p>' +
    '<div style="display:flex;gap:8px;margin:4px 0 12px"><input type="text" maxlength="14" autocomplete="off" spellcheck="false" aria-label="Name" style="flex:1;min-width:0;font:inherit;font-size:1.05rem;padding:8px 12px;border-radius:12px;border:2px solid #d9c8f0;background:#fff;color:#4a3a6a">' +
    '<button type="button" class="glim-dice" aria-label="Suggest a name" style="flex:none;padding:6px 12px">🎲</button></div>' +
    '<div class="shop-buy"><button type="button" class="glim-done">Done ✧</button></div>';
  canvas.parentNode.appendChild(glimNameBox);
  var glimNameInput = glimNameBox.querySelector('input'), glimPending = null;
  ['keydown', 'keyup', 'keypress'].forEach(function (ev) { glimNameInput.addEventListener(ev, function (e) { e.stopPropagation(); if (ev === 'keydown' && e.key === 'Enter') glimFinishNaming(); }); });   // typing here doesn't move you or open menus
  function glimSuggest() { var taken = glimmers.map(function (g) { return g.name; }), n; do { n = GLIM_NAMES[Math.floor(Math.random() * GLIM_NAMES.length)]; } while (taken.indexOf(n) >= 0 && taken.length < GLIM_NAMES.length); return n; }
  glimNameBox.querySelector('.glim-dice').addEventListener('click', function () { glimNameInput.value = glimSuggest(); glimNameInput.focus(); });
  glimNameBox.querySelector('.glim-done').addEventListener('click', function () { glimFinishNaming(); });
  function glimStartNaming(stall, kind) {
    glimPending = { kind: kind || 'glim', stall: stall, pal: Math.floor(Math.random() * 3) };
    glimNameBox.querySelector('.glim-title').textContent = '✧ Name your ' + (kind === 'moon' ? 'Mooncalf' : 'Glimmerwing');
    glimNaming = true; walkTarget = null; keys = {};
    glimNameInput.value = glimSuggest(); glimNameBox.hidden = false;
    setTimeout(function () { glimNameInput.focus(); glimNameInput.select(); }, 50);
  }
  function glimFinishNaming() {
    if (!glimPending) return;
    var name = glimNameInput.value.replace(/\s+/g, ' ').replace(/^ | $/g, '') || glimSuggest();
    var g = glimAdd({ kind: glimPending.kind, name: name, stall: glimPending.stall, pal: glimPending.pal });
    glimPending = null; glimNaming = false; glimNameBox.hidden = true; glimNameInput.blur(); focusGame();
    glimHeartBurst(g.x, 0.5, g.z); spellSound();
    showToast('✧ ' + name + ' has moved into stall ' + (g.stall + 1) + '! Feed them hay and pet them every day, and ' + (g.kind === 'moon' ? 'you can milk them each morning (with a Milk Pail).' : 'they\'ll lay a Glimmer Egg each morning.'), 4200);
    if (typeof renderBarnShop === 'function') renderBarnShop();
  }
  function adoptGlimmerwing(kind) {                                  // kind: 'glim' (a Glimmerwing) or 'moon' (a Mooncalf)
    var stall = glimFreeStall(), cost = kind === 'moon' ? MOON_COST : GLIM_COST;
    if (stall < 0) { showToast('All three stalls are full!', 2000); return; }
    if (state.coins < cost) { showToast('Not enough Star Coins', 1800); return; }
    state.coins -= cost; showCoins(true); coinSound(5);
    closeBarnShop();
    glimStartNaming(stall, kind);
  }
  // the chalkboard behind the counter now advertises them
  (function () {
    var g = abChalkTex.image.getContext('2d'), w = abChalkTex.image.width, h = abChalkTex.image.height;
    var bg = g.createLinearGradient(0, 0, w, h); bg.addColorStop(0, '#2c3a34'); bg.addColorStop(1, '#222e2a');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (var s = 0; s < 18; s++) { var cx = isle2Hash(s * 3.1 + 5) * w, cy = isle2Hash(s * 4.7 + 5) * h, cg = g.createRadialGradient(cx, cy, 4, cx, cy, 30 + isle2Hash(s) * 90); cg.addColorStop(0, 'rgba(230,240,235,0.07)'); cg.addColorStop(1, 'rgba(230,240,235,0)'); g.fillStyle = cg; g.fillRect(0, 0, w, h); }
    function chalk(text, x, y, size, col, italic) {
      g.font = (italic ? 'italic ' : '') + 'bold ' + size + 'px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (var k = 0; k < 4; k++) { g.fillStyle = col.replace('A', (0.25 + k * 0.12).toFixed(2)); g.fillText(text, x + (isle2Hash(k * 3 + size) - 0.5) * 2, y + (isle2Hash(k * 5 + size) - 0.5) * 2); }
    }
    chalk('Animals for Sale', w / 2, 58, 52, 'rgba(250,248,240,A)', true);
    g.strokeStyle = 'rgba(250,248,240,0.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2 - 210, 96); g.bezierCurveTo(w / 2 - 80, 88, w / 2 + 80, 104, w / 2 + 210, 94); g.stroke();
    chalk('Glimmerwings \u00b7 250 \u2605', w / 2 + 80, 140, 34, 'rgba(214,190,255,A)', false);
    chalk('lay glowing Glimmer Eggs', w / 2 + 80, 174, 20, 'rgba(240,240,230,A)', true);
    chalk('Mooncalves \u00b7 600 \u2605', w / 2 + 80, 222, 34, 'rgba(190,215,255,A)', false);
    chalk('give shimmering Moonmilk', w / 2 + 80, 256, 20, 'rgba(240,240,230,A)', true);
    chalk('feed with hay & pet every day!', w / 2 + 80, 296, 22, 'rgba(255,214,120,A)', true);
    // a chalk doodle of one: a round fluffy body with moth wings and antennae
    var dx = 150, dy = 220;
    g.lineCap = 'round'; g.lineWidth = 3;
    g.strokeStyle = 'rgba(200,180,255,0.75)';
    [[-1, -0.5], [1, 0.5]].forEach(function (s) { g.save(); g.translate(dx + s[0] * 62, dy - 30); g.rotate(s[1]); g.beginPath(); g.ellipse(0, 0, 50, 30, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(s[0] * 14, 0, 9, 0, Math.PI * 2); g.stroke(); g.restore(); });
    g.strokeStyle = 'rgba(160,230,240,0.7)';
    [-1, 1].forEach(function (s) { g.save(); g.translate(dx + s * 50, dy + 26); g.rotate(-s * 0.5); g.beginPath(); g.ellipse(0, 0, 32, 20, 0, 0, Math.PI * 2); g.stroke(); g.restore(); });
    g.strokeStyle = 'rgba(250,248,240,0.8)'; g.fillStyle = 'rgba(40,52,48,1)';
    g.beginPath(); g.arc(dx, dy, 46, 0, Math.PI * 2); g.fill(); g.stroke();
    for (var f = 0; f < 22; f++) { var fa = f / 22 * Math.PI * 2; g.beginPath(); g.moveTo(dx + Math.cos(fa) * 44, dy + Math.sin(fa) * 44); g.lineTo(dx + Math.cos(fa) * 52, dy + Math.sin(fa) * 52); g.stroke(); }   // fluff
    [-1, 1].forEach(function (s) {
      g.fillStyle = 'rgba(250,248,240,0.85)'; g.beginPath(); g.ellipse(dx + s * 16, dy - 4, 6, 8, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(250,248,240,0.8)'; g.beginPath(); g.moveTo(dx + s * 12, dy - 44); g.quadraticCurveTo(dx + s * 22, dy - 80, dx + s * 40, dy - 86); g.stroke();
      g.beginPath(); g.ellipse(dx + s * 42, dy - 88, 5, 10, s * 0.8, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(255,150,190,0.5)'; g.beginPath(); g.ellipse(dx + s * 28, dy + 10, 8, 5, 0, 0, Math.PI * 2); g.fill();
    });
    g.strokeStyle = 'rgba(250,248,240,0.8)'; g.beginPath(); g.arc(dx - 5, dy + 12, 5, 0.2, Math.PI - 0.2); g.stroke(); g.beginPath(); g.arc(dx + 5, dy + 12, 5, 0.2, Math.PI - 0.2); g.stroke();
    [[46, 300], [w - 50, 60], [w - 60, 300], [40, 60]].forEach(function (p) {
      g.strokeStyle = 'rgba(255,214,120,0.7)'; g.beginPath();
      for (var k = 0; k < 5; k++) { var a = -Math.PI / 2 + k * Math.PI * 4 / 5; g[k ? 'lineTo' : 'moveTo'](p[0] + Math.cos(a) * 12, p[1] + Math.sin(a) * 12); }
      g.closePath(); g.stroke();
    });
    abChalkTex.needsUpdate = true;
  })();
  // saving and loading
  function glimmerSaveData() { return { day: glimDay, list: glimmers.map(function (g) { return { kind: g.kind, name: g.name, stall: g.stall, pal: g.pal, fed: g.fed, petted: g.petted, egg: g.egg }; }) }; }
  function glimmerLoadData(d) {
    glimmers.forEach(function (g) { abRoom.remove(g.m.root); abRoom.remove(g.eggMesh); abRoom.remove(g.hayMesh); g.slate.map = abSlateTex; g.slate.needsUpdate = true; });
    glimmers = [];
    if (d && d.list) d.list.forEach(function (x) { glimAdd(x); });
    glimDay = d && d.day !== undefined && d.day !== null ? d.day : state.day;
  }

  // down the right: feed sacks, a feed bin, a Dutch door, tack on a peg, buckets, nesting boxes and hay bales
  var AEX = AB_W / 2;
  // feed sacks stacked on a pallet, labels out, the top one flopped over; and an open sack of grain beside them,
  // its top rolled down, a scoop stuck in it and a little grain spilled on the floor
  var abSackMat = new THREE.MeshStandardMaterial({ map: burlapTex, bumpMap: burlapTex, bumpScale: 0.025, color: 0xcbb48a, roughness: 1 });
  var PAL_X = AEX - 0.45, PAL_Z = -3.12;
  [-0.38, 0, 0.38].forEach(function (pz) { abPart(new THREE.BoxGeometry(0.72, 0.09, 0.08), AB.beam, PAL_X, 0.045, PAL_Z + pz); });   // the pallet: stringers,
  for (var palB = 0; palB < 6; palB++) abPart(new THREE.BoxGeometry(0.11, 0.025, 0.9), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.08, 0.3, 0.34 + isle2Hash(palB * 3.7) * 0.1), roughness: 0.9 }), PAL_X - 0.3 + palB * 0.12, 0.103, PAL_Z);   // and deck boards
  [[AEX - 0.45, 0.115, -3.38, -1.45, 0, 0], [AEX - 0.45, 0.115, -2.86, -1.7, 1, 0], [AEX - 0.5, 0.48, -3.12, -1.55, 2, 1.2]].forEach(function (sk) {
    var sg = barnSackProtos[sk[4]].clone();
    sg.position.set(sk[0], sk[1], sk[2]); sg.rotation.set(0, sk[3], sk[5]);
    sg.traverse(function (o) {
      if (o.material === sackMat) o.material = abSackMat;               // (a touch darker than outside, so they don't glare in the lamplight)
      if (o.material && o.material.map && sackLabels.indexOf(o.material.map) >= 0) { o.position.z += 0.03; o.scale.set(1.15, 1.15, 1); }   // and the labels stand clear of the cloth
    });
    abRoom.add(sg);
  });
  abSolids.push([PAL_X, PAL_Z, 0.5]);
  var OS_X = AEX - 1.08, OS_Z = -3.5;                                  // the open sack
  var osPts = []; [[0.13, 0], [0.19, 0.03], [0.21, 0.15], [0.205, 0.3], [0.19, 0.4], [0.2, 0.43]].forEach(function (p) { osPts.push(new THREE.Vector2(p[0], p[1])); });
  var osGeo = new THREE.LatheGeometry(osPts, 20), osp = osGeo.attributes.position;
  for (var ov = 0; ov < osp.count; ov++) { var ox = osp.getX(ov), oz = osp.getZ(ov), oy = osp.getY(ov), ow = 1 + (isle2Hash(Math.round(ox * 50) * 3 + Math.round(oz * 50) * 7 + Math.round(oy * 50)) - 0.5) * 0.08; osp.setXYZ(ov, ox * ow, oy, oz * ow); }
  osGeo.computeVertexNormals();
  abPart(osGeo, new THREE.MeshStandardMaterial({ map: burlapTex, color: 0xcbb48a, roughness: 1, side: THREE.DoubleSide }), OS_X, 0, OS_Z);
  abPart(new THREE.TorusGeometry(0.205, 0.035, 8, 22), abSackMat, OS_X, 0.43, OS_Z, Math.PI / 2, 0, 0);   // the rolled-down top
  var osGrain = abPart(wbLumpGeo(77, 0.12), new THREE.MeshStandardMaterial({ color: 0xd8b468, roughness: 1 }), OS_X, 0.39, OS_Z); osGrain.scale.set(0.19, 0.06, 0.19);
  for (var gk = 0; gk < 40; gk++) {                                    // grains on top, and spilled on the floor
    var spill = gk >= 22, ga2 = isle2Hash(gk * 2.3 + 40) * Math.PI * 2, grR = spill ? 0.24 + isle2Hash(gk * 3.1) * 0.25 : isle2Hash(gk * 3.1) * 0.17;
    abPart(new THREE.SphereGeometry(0.007, 5, 4), new THREE.MeshStandardMaterial({ color: isle2Hash(gk) > 0.5 ? 0xe0c070 : 0xc89a50, roughness: 1 }), OS_X + Math.cos(ga2) * grR, spill ? 0.005 : 0.44, OS_Z + Math.sin(ga2) * grR).scale.set(1.6, 0.8, 1);
  }
  var abScoopMat = new THREE.MeshStandardMaterial({ color: 0xc8ced4, roughness: 0.4, metalness: 0.4, side: THREE.DoubleSide });
  function abScoop(x, y, z, rx, ry) {                                  // a tin feed scoop: a cut-away cup with a back and a wooden handle
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rx, ry, 0, 'YXZ'); abRoom.add(g);
    abPart(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 16, 1, true, 0, Math.PI * 1.3), abScoopMat, 0, 0, 0, Math.PI / 2, 0, 0, g);
    abPart(new THREE.CircleGeometry(0.055, 16), abScoopMat, 0, 0, -0.08, 0, 0, 0, g);
    abPart(new THREE.TorusGeometry(0.055, 0.003, 4, 16, Math.PI * 1.3), abScoopMat, 0, 0, 0.08, 0, 0, 0, g);
    abPart(new THREE.CylinderGeometry(0.014, 0.012, 0.12, 8), AB.wood, 0, 0, -0.15, Math.PI / 2, 0, 0, g);
    abPart(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 6), abScoopMat, 0, 0, -0.095, Math.PI / 2, 0, 0, g);
    return g;
  }
  abScoop(OS_X + 0.04, 0.44, OS_Z + 0.02, -0.7, 0.8);
  abSolids.push([OS_X, OS_Z, 0.25]);
  // the feed bin: an ironbound chest of planks on runners, with rope handles and "FEED" stencilled on the front. Its lid
  // stands open on strap hinges, propped with a stick; inside, grain heaped up with a scoop in it
  var FB_Z = -1.95, FB_X = AEX - 0.4, FBW = 0.55, FBL = 0.9, FBH = 0.62;
  var fbBoard = new THREE.MeshStandardMaterial({ map: abPlankTex.clone(), color: 0xd8b890, roughness: 0.8 }); fbBoard.map.needsUpdate = true; fbBoard.map.repeat.set(0.45, 0.3); fbBoard.map.rotation = Math.PI / 2;
  [-1, 1].forEach(function (s) { abPart(new THREE.BoxGeometry(FBW + 0.04, 0.06, 0.07), AB.beam, FB_X, 0.03, FB_Z + s * 0.36); });   // runners
  for (var fbb = 0; fbb < 4; fbb++) {                                  // planked front, back and ends
    var fy = 0.1 + fbb * 0.135 + 0.065;
    [-1, 1].forEach(function (s) {
      abPart(new THREE.BoxGeometry(0.03, 0.128, FBL), fbBoard, FB_X + s * (FBW / 2 - 0.015), fy, FB_Z);
      abPart(new THREE.BoxGeometry(FBW - 0.06, 0.128, 0.03), fbBoard, FB_X, fy, FB_Z + s * (FBL / 2 - 0.015));
    });
  }
  abPart(new THREE.BoxGeometry(FBW - 0.06, 0.02, FBL - 0.06), AB.beam, FB_X, 0.11, FB_Z);            // the floor of it
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) {
    abPart(new THREE.BoxGeometry(0.06, FBH + 0.02, 0.06), AB.beam, FB_X + c[0] * (FBW / 2 - 0.03), 0.06 + FBH / 2, FB_Z + c[1] * (FBL / 2 - 0.03));
    [0.14, FBH - 0.02].forEach(function (cy) {                         // iron corner brackets, with rivets
      abPart(new THREE.BoxGeometry(0.008, 0.07, 0.14), AB.iron, FB_X + c[0] * (FBW / 2 + 0.002), cy, FB_Z + c[1] * (FBL / 2 - 0.07));
      abPart(new THREE.BoxGeometry(0.14, 0.07, 0.008), AB.iron, FB_X + c[0] * (FBW / 2 - 0.07), cy, FB_Z + c[1] * (FBL / 2 + 0.002));
      abPart(new THREE.SphereGeometry(0.007, 6, 4), AB.iron, FB_X + c[0] * (FBW / 2 + 0.007), cy, FB_Z + c[1] * (FBL / 2 - 0.1));
    });
  });
  [0.24, 0.5].forEach(function (by) { abPart(new THREE.BoxGeometry(0.006, 0.04, FBL + 0.01), AB.iron, FB_X - FBW / 2 - 0.004, by, FB_Z); });   // iron bands round the front
  [-1, 1].forEach(function (s) {                                       // rope handles at the ends
    abPart(new THREE.TorusGeometry(0.06, 0.012, 6, 14, Math.PI), AB.rope, FB_X, 0.5, FB_Z + s * (FBL / 2 + 0.01), 0, 0, Math.PI);
    [-1, 1].forEach(function (k) { abPart(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), AB.rope, FB_X + k * 0.06, 0.5, FB_Z + s * (FBL / 2 + 0.01), Math.PI / 2, 0, 0); });
  });
  var fbStencil = paintTexture(256, 96, function (g, w, h) {
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(150,40,30,0.85)'; g.font = 'bold 52px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FEED', w / 2, 40);
    g.font = 'bold 16px Georgia, serif'; g.fillText('OATS · BARLEY · CORN', w / 2, 80);
    g.globalCompositeOperation = 'destination-out';                    // worn, the way stencilled paint goes
    for (var i = 0; i < 160; i++) { g.fillStyle = 'rgba(0,0,0,' + isle2Hash(i * 1.9) * 0.6 + ')'; g.fillRect(isle2Hash(i * 2.7) * w, isle2Hash(i * 3.3) * h, 2 + isle2Hash(i) * 5, 2); }
  });
  abPart(new THREE.PlaneGeometry(0.62, 0.23), new THREE.MeshStandardMaterial({ map: fbStencil, transparent: true, roughness: 0.9, depthWrite: false }), FB_X - FBW / 2 - 0.007, 0.38, FB_Z, 0, -Math.PI / 2, 0).castShadow = false;
  var fbGrain = abPart(wbLumpGeo(91, 0.1), new THREE.MeshStandardMaterial({ color: 0xd8b468, roughness: 1 }), FB_X, FBH - 0.02, FB_Z); fbGrain.scale.set(FBW / 2 - 0.04, 0.07, FBL / 2 - 0.04);
  for (var fgr = 0; fgr < 26; fgr++) abPart(new THREE.SphereGeometry(0.007, 5, 4), new THREE.MeshStandardMaterial({ color: isle2Hash(fgr * 5) > 0.5 ? 0xe0c070 : 0xb88a48, roughness: 1 }), FB_X + (isle2Hash(fgr * 1.3 + 5) - 0.5) * 0.4, FBH + 0.03 + isle2Hash(fgr * 2.9) * 0.02, FB_Z + (isle2Hash(fgr * 3.7 + 5) - 0.5) * 0.7).scale.set(1.6, 0.8, 1);
  abScoop(FB_X - 0.05, FBH + 0.06, FB_Z + 0.12, -0.5, -0.9);
  var fbLid = new THREE.Group(); fbLid.position.set(FB_X + FBW / 2, FBH + 0.08, FB_Z); fbLid.rotation.z = 1.25; abRoom.add(fbLid);   // the lid, standing open
  for (var fbLp = 0; fbLp < 4; fbLp++) abPart(new THREE.BoxGeometry(FBW + 0.04, 0.035, (FBL + 0.04) / 4 - 0.006), fbBoard, -(FBW + 0.04) / 2, 0.02, -FBL / 2 - 0.02 + (fbLp + 0.5) * (FBL + 0.04) / 4, 0, 0, 0, fbLid);
  [-1, 1].forEach(function (s) { abPart(new THREE.BoxGeometry(FBW + 0.04, 0.045, 0.06), AB.beam, -(FBW + 0.04) / 2, 0.025, s * (FBL / 2 - 0.01), 0, 0, 0, fbLid); });   // breadboard ends
  [-0.28, 0.28].forEach(function (hz) {                                // strap hinges, and the hasp
    abPart(new THREE.BoxGeometry(0.34, 0.006, 0.04), AB.iron, -0.17, 0.045, hz, 0, 0, 0, fbLid);
    abPart(new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8), AB.iron, 0, 0.0, hz, Math.PI / 2, 0, 0, fbLid);
  });
  abPart(new THREE.BoxGeometry(0.1, 0.006, 0.04), AB.iron, -FBW + 0.02, 0.045, 0, 0, 0, 0, fbLid);
  abPart(new THREE.TorusGeometry(0.018, 0.004, 5, 10), AB.iron, -FBW - 0.03, 0.045, 0, Math.PI / 2, 0, 0, fbLid);
  abRod(V3(FB_X + FBW / 2 - 0.04, FBH + 0.06, FB_Z + FBL / 2 - 0.08), V3(FB_X + FBW / 2 - 0.02, FBH + 0.5, FB_Z + FBL / 2 - 0.1), 0.012, AB.wood);   // the prop stick
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
  function abRod(a, b, r, mat, parent, seg) {                         // a round bar from point a to point b
    var d = new THREE.Vector3().subVectors(b, a), m = abPart(new THREE.CylinderGeometry(r, r, d.length(), seg || 8), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, 0, 0, 0, parent);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return m;
  }
  function V3(x, y, z) { return new THREE.Vector3(x, y, z); }
  // galvanised pails stacked one inside another: spangled zinc, a rolled rim, two pressed ribs, ears riveted on for
  // a wire handle with a wooden grip (the top one's standing up), and a broom leaning on the wall beside them
  var galvTex = paintTexture(128, 128, function (g, w, h) {           // the crystal "spangle" pattern of hot-dipped zinc
    g.fillStyle = '#b8bec4'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 70; i++) {
      var cx = isle2Hash(i * 1.7 + 610) * w, cy = isle2Hash(i * 2.3 + 610) * h, r = 6 + isle2Hash(i * 3.1) * 14, l = 62 + isle2Hash(i * 4.3) * 22;
      g.fillStyle = 'hsl(205,8%,' + l + '%)'; g.beginPath();
      for (var k = 0; k < 6; k++) { var a = k / 6 * Math.PI * 2 + isle2Hash(i) * 2, rr = r * (0.6 + isle2Hash(i * 7 + k) * 0.5); g[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      g.closePath(); g.fill();
    }
    for (var d = 0; d < 30; d++) { g.fillStyle = 'rgba(90,80,70,' + isle2Hash(d * 9) * 0.12 + ')'; g.fillRect(isle2Hash(d * 5) * w, h * 0.75 + isle2Hash(d * 7) * h * 0.25, 4 + isle2Hash(d) * 10, 2); }   // grime near the bottom
  });
  galvTex.wrapS = THREE.RepeatWrapping; galvTex.repeat.set(3, 1);
  var galv = new THREE.MeshStandardMaterial({ map: galvTex, roughness: 0.4, metalness: 0.35, side: THREE.DoubleSide });
  var galvRim = new THREE.MeshStandardMaterial({ map: galvTex, roughness: 0.35, metalness: 0.4 });
  var PL_X = AEX - 0.32, PL_Z = 1.8;
  [0, 0.065, 0.13].forEach(function (by, k) {
    var pg = new THREE.Group(); pg.position.set(PL_X + k * 0.004, by, PL_Z); pg.rotation.set((k - 1) * 0.02, k * 0.9, (k - 1) * 0.015); abRoom.add(pg);
    abPart(new THREE.CylinderGeometry(0.16, 0.12, 0.28, 24, 1, true), galv, 0, 0.14, 0, 0, 0, 0, pg);
    if (k === 0) abPart(new THREE.CircleGeometry(0.12, 24), galvRim, 0, 0.005, 0, -Math.PI / 2, 0, 0, pg);
    abPart(new THREE.TorusGeometry(0.16, 0.009, 8, 32), galvRim, 0, 0.28, 0, Math.PI / 2, 0, 0, pg);              // the rolled rim
    [0.09, 0.19].forEach(function (ry) { abPart(new THREE.TorusGeometry(0.12 + ry * 0.143, 0.004, 5, 32), galvRim, 0, ry, 0, Math.PI / 2, 0, 0, pg); });   // pressed ribs
    [-1, 1].forEach(function (s) {                                     // the ears, riveted on
      abPart(new THREE.BoxGeometry(0.012, 0.05, 0.035), galvRim, s * 0.158, 0.245, 0, 0, 0, s * 0.14, pg);
      abPart(new THREE.SphereGeometry(0.005, 6, 4), galvRim, s * 0.166, 0.235, 0, 0, 0, 0, pg);
    });
    var up = k === 2, handle = new THREE.Group(); handle.position.set(0, 0.25, 0); handle.rotation.z = up ? 0 : 1.25; pg.add(handle);   // the wire handle
    abPart(new THREE.TorusGeometry(0.165, 0.004, 5, 24, Math.PI), AB.iron, 0, 0, 0, 0, 0, 0, handle);
    abPart(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 10), AB.wood, 0, 0.165, 0, 0, 0, Math.PI / 2, handle);    // its wooden grip
  });
  abSolids.push([PL_X, PL_Z, 0.18]);
  abRod(V3(AEX - 0.14, 1.42, 2.25), V3(AEX - 0.27, 0.22, 2.06), 0.014, AB.wood);   // the broom: a handle,
  var broom = abPart(new THREE.CylinderGeometry(0.05, 0.13, 0.26, 14), new THREE.MeshStandardMaterial({ color: 0xc8a050, roughness: 1 }), AEX - 0.28, 0.12, 2.04, 0.12, 0.6, 0.06);
  broom.scale.set(1, 1, 0.4);
  [0.16, 0.2].forEach(function (sy) { var bw = abPart(new THREE.TorusGeometry(0.075, 0.005, 4, 18), new THREE.MeshStandardMaterial({ color: 0x9a3a2a, roughness: 0.8 }), AEX - 0.28, sy, 2.045, Math.PI / 2 + 0.12, 0, 0.06); bw.scale.set(1, 0.4, 1); bw.rotation.y = 0.6; });   // stitched in red twine
  for (var brs = 0; brs < 16; brs++) abPart(new THREE.CylinderGeometry(0.003, 0.002, 0.08, 3), hayWispMat, AEX - 0.28 + (isle2Hash(brs * 3 + 800) - 0.5) * 0.24, 0.02, 2.04 + (isle2Hash(brs * 5 + 800) - 0.5) * 0.08, (isle2Hash(brs * 7) - 0.5) * 0.6, 0, (isle2Hash(brs * 9) - 0.5) * 0.8).castShadow = false;   // its bristle tips

  // the nesting boxes: a little hen house of four nests on legs, with board sides, dividers and front lips, a shingled
  // lid on iron hinges, perches and a cleated ramp up to them. Each nest is a bowl of straw with a china egg in it,
  // to show the hens where to lay. A painted board on top says what it's for
  var NB_X = AEX - 0.3, NB_Z = 4.05, NBW = 0.48, NBD = 1.0;          // middle, depth (out from the wall) and width
  var nbWood = new THREE.MeshStandardMaterial({ map: abPlankTex.clone(), color: 0xe8cfa8, roughness: 0.8 }); nbWood.map.needsUpdate = true; nbWood.map.repeat.set(0.5, 0.4);
  var nbTrim = new THREE.MeshStandardMaterial({ color: 0x8a5a38, roughness: 0.7 });
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) { abPart(new THREE.BoxGeometry(0.055, 0.62, 0.055), AB.beam, NB_X + c[0] * (NBW / 2 - 0.03), 0.31, NB_Z + c[1] * (NBD / 2 - 0.03)); });   // legs
  [-1, 1].forEach(function (c) { abRod(V3(NB_X - NBW / 2 + 0.03, 0.08, NB_Z + c * 0.47), V3(NB_X + NBW / 2 - 0.03, 0.5, NB_Z + c * 0.47), 0.014, AB.beam); });   // and cross braces
  abPart(new THREE.BoxGeometry(0.03, 0.92, NBD), nbWood, NB_X + NBW / 2 - 0.015, 0.62 + 0.46, NB_Z);   // the back
  [-1, 1].forEach(function (s) { abPart(new THREE.BoxGeometry(NBW, 0.84, 0.03), nbWood, NB_X, 0.62 + 0.42, NB_Z + s * (NBD / 2 - 0.015)); });   // the ends
  [0.62, 1.04].forEach(function (sy, tier) {
    abPart(new THREE.BoxGeometry(NBW, 0.03, NBD), nbWood, NB_X, sy, NB_Z);                              // the floor of each row
    abPart(new THREE.BoxGeometry(NBW - 0.03, 0.38, 0.025), nbWood, NB_X, sy + 0.19, NB_Z);              // the divider
    abPart(new THREE.BoxGeometry(0.03, 0.11, NBD), nbWood, NB_X - NBW / 2 + 0.015, sy + 0.07, NB_Z);    // the front lip, to keep the straw in,
    abPart(new THREE.BoxGeometry(0.035, 0.025, NBD + 0.02), nbTrim, NB_X - NBW / 2 + 0.012, sy + 0.13, NB_Z);   // with a rounded cap
    abPart(new THREE.BoxGeometry(0.03, 0.07, NBD), nbTrim, NB_X - NBW / 2 + 0.015, sy + 0.38, NB_Z);    // a header board over the openings
    [-0.25, 0.25].forEach(function (nz, n) {                           // the nests
      var nest = abPart(new THREE.SphereGeometry(0.17, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1, side: THREE.DoubleSide }), NB_X + 0.02, sy + 0.015, NB_Z + nz, Math.PI, 0, 0);
      nest.scale.set(1, 0.35, 1); nest.position.y = sy + 0.075; nest.castShadow = false;               // a hollow bowl of straw
      var rim = abPart(new THREE.TorusGeometry(0.15, 0.045, 8, 18), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), NB_X + 0.02, sy + 0.07, NB_Z + nz, Math.PI / 2, 0, 0);
      rim.scale.set(1, 1, 0.6); rim.castShadow = false;
      for (var nw = 0; nw < 18; nw++) { var na = nw / 18 * Math.PI * 2; abPart(new THREE.CylinderGeometry(0.003, 0.002, 0.1, 3), hayWispMat, NB_X + 0.02 + Math.cos(na) * 0.17, sy + 0.09, NB_Z + nz + Math.sin(na) * 0.17, Math.sin(na) * 0.9, 0, -Math.cos(na) * 0.9).castShadow = false; }   // stray straws
      var egg = abPart(new THREE.SphereGeometry(0.03, 14, 10), new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.25 }), NB_X + 0.02 + (n - 0.5) * 0.04, sy + 0.07, NB_Z + nz + 0.02, 0, 0, Math.PI / 2 - 0.2);
      egg.scale.set(1, 1.3, 1);                                        // a china egg
    });
  });
  // the lid: sloping down to the front, shingled, on two strap hinges, with a painted board along the front
  var nbLid = new THREE.Group(); nbLid.position.set(NB_X, 1.53, NB_Z); nbLid.rotation.z = 0.32; abRoom.add(nbLid);
  abPart(new THREE.BoxGeometry(NBW + 0.12, 0.03, NBD + 0.08), nbTrim, 0, 0, 0, 0, 0, 0, nbLid);
  for (var sr = 0; sr < 4; sr++) for (var sc = 0; sc < 7; sc++) {     // rows of little cedar shingles, each overlapping the one below
    abPart(new THREE.BoxGeometry(0.17, 0.012, 0.15 - isle2Hash(sr * 7 + sc) * 0.02), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(0.06 + isle2Hash(sr * 9 + sc) * 0.03, 0.35, 0.28 + isle2Hash(sr * 3 + sc * 5) * 0.1), roughness: 0.9 }),
      0.22 - sr * 0.14, 0.025 + sr * 0.004, -NBD / 2 + 0.07 + sc * 0.148 + (sr % 2) * 0.07 - (sr % 2 && sc === 6 ? 0.07 : 0), 0, 0, -0.08, nbLid);
  }
  abPart(new THREE.BoxGeometry(0.04, 0.03, NBD + 0.1), nbTrim, 0.29, 0.04, 0, 0, 0, 0, nbLid);          // the ridge board along the back
  [-0.3, 0.3].forEach(function (hz) { abPart(new THREE.BoxGeometry(0.22, 0.008, 0.035), AB.iron, 0.2, 0.045, hz, 0, 0, 0, nbLid); abPart(new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8), AB.iron, 0.3, 0.02, hz, Math.PI / 2, 0, 0, nbLid); });   // hinges
  var nbSignTex = paintTexture(256, 48, function (g, w, h) {
    g.fillStyle = '#efe2c6'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 12; i++) { g.fillStyle = 'rgba(120,80,40,0.08)'; g.fillRect(0, isle2Hash(i + 50) * h, w, 1); }
    g.fillStyle = '#8a3a2a'; g.font = 'bold 26px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NESTING BOXES', w / 2, h / 2 + 1);
    g.strokeStyle = '#8a3a2a'; g.lineWidth = 2; g.strokeRect(3, 3, w - 6, h - 6);
  });
  abPart(new THREE.BoxGeometry(0.02, 0.1, 0.62), nbTrim, NB_X - NBW / 2 - 0.035, 1.42, NB_Z);
  abPart(new THREE.PlaneGeometry(0.58, 0.085), new THREE.MeshStandardMaterial({ map: nbSignTex, roughness: 0.8 }), NB_X - NBW / 2 - 0.046, 1.42, NB_Z, 0, -Math.PI / 2, 0);
  // perches out front, and a ramp up to the bottom one with cleats nailed across
  [0.5, 0.92].forEach(function (py) {
    abPart(new THREE.CylinderGeometry(0.022, 0.022, NBD - 0.06, 10), AB.pale, NB_X - NBW / 2 - 0.13, py, NB_Z, Math.PI / 2, 0, 0);
    [-1, 1].forEach(function (s) { abPart(new THREE.BoxGeometry(0.15, 0.04, 0.03), nbTrim, NB_X - NBW / 2 - 0.07, py, NB_Z + s * (NBD / 2 - 0.05)); });
  });
  var RAMP = new THREE.Group(); RAMP.position.set(NB_X - NBW / 2 - 0.5, 0, NB_Z - 0.2); RAMP.rotation.z = 0.78; abRoom.add(RAMP);
  abPart(new THREE.BoxGeometry(0.72, 0.025, 0.16), nbWood, 0.36, 0.015, 0, 0, 0, 0, RAMP);
  for (var cl = 0; cl < 6; cl++) abPart(new THREE.BoxGeometry(0.02, 0.018, 0.16), nbTrim, 0.06 + cl * 0.12, 0.036, 0, 0, 0, 0, RAMP);
  abSolids.push([NB_X, NB_Z - 0.3, 0.35], [NB_X, NB_Z + 0.3, 0.35], [NB_X - NBW / 2 - 0.35, NB_Z - 0.2, 0.15]);

  // hay bales stacked in the back corner, with straws sticking out all over, a loose flake leaning against them, a
  // scatter of hay at their feet and a cut length of baling twine; and a sturdy ladder up to the loft, its rungs set
  // through the rails and pegged, with iron hooks over the top plate and a coil of rope hung on it
  var abBales = [[AEX - 0.66, 0, -4.6, 0.03], [AEX - 0.66, 0, -4.1, -0.05], [AEX - 0.68, HB_H, -4.35, 0.08]];
  abBales.forEach(function (bb) {
    var bale = barnBaleProto.clone(); bale.position.set(bb[0], bb[1] + HB_H / 2, bb[2]); bale.rotation.set(0, bb[3], 0); abRoom.add(bale);
  });
  (function () {                                                       // straws poking out of every face
    var n = 420, im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0028, 0.0018, 1, 3), hayWispMat, n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color();
    for (var i = 0; i < n; i++) {
      var bb = abBales[i % 3], face = Math.floor(isle2Hash(i * 1.7 + 300) * 5), u = isle2Hash(i * 2.9 + 300) - 0.5, w = isle2Hash(i * 4.1 + 300) - 0.5;
      var lx = face === 0 ? -HB_L / 2 : face === 1 ? HB_L / 2 : u * HB_L * 0.95, ly = face === 2 ? HB_H / 2 : (face < 2 ? u : w) * HB_H * 0.9, lz = face === 3 ? -HB_W / 2 : face === 4 ? HB_W / 2 : (face === 2 ? w : u) * HB_W * 0.95;
      if (face === 2 && bb[1] === 0 && Math.abs(bb[2] + 4.35) < 0.3) continue;
      pos.set(bb[0] + lx * Math.cos(bb[3]) + lz * Math.sin(bb[3]), bb[1] + HB_H / 2 + ly, bb[2] - lx * Math.sin(bb[3]) + lz * Math.cos(bb[3]));
      e.set((isle2Hash(i * 5.3) - 0.5) * 2.6, isle2Hash(i * 6.1) * 6.3, (isle2Hash(i * 7.9) - 0.5) * 2.6); q.setFromEuler(e);
      sc.set(1, 0.05 + isle2Hash(i * 8.3) * 0.1, 1);
      m.compose(pos, q, sc); im.setMatrixAt(i, m);
      im.setColorAt(i, col.setHSL(0.11 + isle2Hash(i * 11) * 0.03, 0.55, 0.42 + isle2Hash(i * 13) * 0.25));
    }
    im.castShadow = true; abRoom.add(im);
  })();
  var flakeGeo = new THREE.BoxGeometry(0.09, 0.4, 0.44, 2, 6, 6), fkp = flakeGeo.attributes.position;   // a flake pulled off a bale, leaning on the stack
  for (var fk = 0; fk < fkp.count; fk++) fkp.setX(fk, fkp.getX(fk) + (isle2Hash(Math.round(fkp.getY(fk) * 60) * 3 + Math.round(fkp.getZ(fk) * 60) * 7) - 0.5) * 0.03);
  flakeGeo.computeVertexNormals();
  abPart(flakeGeo, [hayEnd, hayEnd, haySide, haySide, haySide, haySide], AEX - 1.2, 0.19, -4.25, 0, 0.15, 0.3);
  var hayLitter = abPart(wbLumpGeo(56, 0.3), AB.straw, AEX - 1.15, 0.02, -4.2, 0, 0.6, 0); hayLitter.scale.set(0.35, 0.03, 0.45); hayLitter.castShadow = false;   // loose hay at their feet
  var twine = new THREE.CatmullRomCurve3([V3(AEX - 1.5, 0.008, -3.9), V3(AEX - 1.4, 0.008, -3.75), V3(AEX - 1.55, 0.008, -3.6), V3(AEX - 1.35, 0.008, -3.5), V3(AEX - 1.25, 0.008, -3.62)]);
  abPart(new THREE.TubeGeometry(twine, 24, 0.004, 5), hayTwineMat, 0, 0, 0).castShadow = false;
  abSolids.push([AEX - 0.66, -4.35, 0.55], [AEX - 1.2, -4.25, 0.15]);
  var LAD_X = 2.35, LAD_T = -0.13;                                     // the ladder leans back against the wall
  function ladPt(h, side) { return V3(LAD_X + side * 0.2, h, ANW + 0.62 - h * 0.13); }
  [-1, 1].forEach(function (s) {
    var rail = abPart(new THREE.BoxGeometry(0.07, 3.1, 0.045), new THREE.MeshStandardMaterial({ color: 0x9a7048, roughness: 0.75 }), LAD_X + s * 0.2, 1.5, ANW + 0.42, LAD_T, 0, 0);
    rail.scale.set(1, 1, 1);
    abPart(new THREE.BoxGeometry(0.075, 0.08, 0.05), AB.iron, LAD_X + s * 0.2, 0.04, ANW + 0.62, LAD_T, 0, 0);   // iron shoes
    var hk = new THREE.CatmullRomCurve3([ladPt(3.0, s), V3(LAD_X + s * 0.2, 3.07, ANW + 0.2), V3(LAD_X + s * 0.2, 3.02, ANW + 0.14)]);   // hooks over the plate
    abPart(new THREE.TubeGeometry(hk, 8, 0.01, 5), AB.iron, 0, 0, 0);
  });
  for (var rungH = 0.3; rungH < 2.9; rungH += 0.3) {                            // the rungs, worn pale on top, pegged at each end
    var rungAt = ladPt(rungH, 0);
    abPart(new THREE.CylinderGeometry(0.019, 0.019, 0.47, 10), AB.pale, rungAt.x, rungAt.y, rungAt.z, 0, 0, Math.PI / 2);
    abPart(new THREE.BoxGeometry(0.3, 0.006, 0.02), new THREE.MeshStandardMaterial({ color: 0xe0c8a0, roughness: 0.6 }), rungAt.x, rungAt.y + 0.017, rungAt.z);
    [-1, 1].forEach(function (s) { abPart(new THREE.CylinderGeometry(0.008, 0.008, 0.02, 6), AB.beam, rungAt.x + s * 0.24, rungAt.y, rungAt.z, 0, 0, Math.PI / 2); });
  }
  var ropeAt = ladPt(1.65, 1);                                             // a coil of rope hung over a rung
  abPart(new THREE.TorusGeometry(0.13, 0.016, 6, 22), AB.rope, ropeAt.x + 0.02, ropeAt.y - 0.12, ropeAt.z + 0.05, 0.1, Math.PI / 2, 0);
  abPart(new THREE.TorusGeometry(0.12, 0.016, 6, 22), AB.rope, ropeAt.x + 0.04, ropeAt.y - 0.14, ropeAt.z + 0.05, 0.25, Math.PI / 2, 0.1);
  abPart(new THREE.CylinderGeometry(0.02, 0.025, 0.06, 8), AB.rope, ropeAt.x + 0.03, ropeAt.y - 0.24, ropeAt.z + 0.05);
  abSolids.push([LAD_X, ANW + 0.4, 0.3]);
  // a wheelbarrow heaped with hay: a pressed steel tray in chipped green paint with a rolled rim, on two ash handles
  // with worn rubber grips, braced to a pair of legs with feet; a spoked wheel with a treaded tyre on an axle between
  // the handles; and the hay piled high, with straws spilling over the sides and a pitchfork stuck in it
  var abWb = new THREE.Group(); abWb.position.set(2.1, 0, 2.9); abWb.rotation.y = -0.6; abRoom.add(abWb);
  var wbPaintTex = paintTexture(256, 128, function (g, w, h) {
    g.fillStyle = '#2f6a54'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 400; i++) { g.fillStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '255,255,255' : '0,0,0') + ',' + isle2Hash(i * 1.7) * 0.05 + ')'; g.fillRect(isle2Hash(i * 2.1 + 9) * w, isle2Hash(i * 3.3 + 9) * h, 3, 2); }
    for (var c = 0; c < 60; c++) {                                     // chips where the bare steel shows through
      var cx = isle2Hash(c * 4.1 + 30) * w, cy = (c < 30 ? isle2Hash(c * 5.3) * 0.25 : 0.25 + isle2Hash(c * 5.3) * 0.75) * h, cr = 1.5 + isle2Hash(c * 6.7) * (c < 30 ? 6 : 3);
      g.fillStyle = '#8a9096'; g.beginPath(); g.ellipse(cx, cy, cr * 1.4, cr, isle2Hash(c) * 3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(140,70,30,0.5)'; g.beginPath(); g.ellipse(cx + 1, cy + 1, cr * 0.7, cr * 0.5, 0, 0, Math.PI * 2); g.fill();   // a bit of rust
    }
    var dirt = g.createLinearGradient(0, h * 0.6, 0, h); dirt.addColorStop(0, 'rgba(70,50,30,0)'); dirt.addColorStop(1, 'rgba(70,50,30,0.45)');
    g.fillStyle = dirt; g.fillRect(0, 0, w, h);
  });
  var wbPaint = new THREE.MeshStandardMaterial({ map: wbPaintTex, roughness: 0.55, metalness: 0.3, side: THREE.DoubleSide });
  var WB_Y = 0.5;                                                      // the middle of the tray
  var tray = new THREE.CylinderGeometry(0.42, 0.28, 0.3, 4, 1, true); tray.rotateY(Math.PI / 4); tray.scale(1, 1, 1.35);
  abPart(tray, wbPaint, 0, WB_Y, 0, 0, 0, 0, abWb);
  abPart(new THREE.BoxGeometry(0.39, 0.015, 0.53), wbPaint, 0, WB_Y - 0.15, 0, 0, 0, 0, abWb);           // its bottom
  var rimG = new THREE.TorusGeometry(0.42, 0.016, 6, 4); rimG.rotateX(Math.PI / 2); rimG.rotateY(Math.PI / 4); rimG.scale(1, 1, 1.35);
  abPart(rimG, new THREE.MeshStandardMaterial({ color: 0x3a7a62, roughness: 0.45, metalness: 0.4 }), 0, WB_Y + 0.15, 0, 0, 0, 0, abWb);   // the rolled rim
  // the handles: from the axle, under the tray, out to the grips
  [-1, 1].forEach(function (s) {
    abRod(V3(s * 0.08, 0.17, -0.66), V3(s * 0.2, 0.36, 0.0), 0.022, AB.wood, abWb);
    abRod(V3(s * 0.2, 0.36, 0.0), V3(s * 0.28, 0.5, 0.86), 0.022, AB.wood, abWb);
    abRod(V3(s * 0.285, 0.505, 0.8), V3(s * 0.3, 0.52, 0.98), 0.03, new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.85 }), abWb);   // worn rubber grips
    abRod(V3(s * 0.21, 0.38, 0.28), V3(s * 0.25, 0.012, 0.36), 0.014, AB.iron, abWb);                  // the leg,
    abPart(new THREE.BoxGeometry(0.05, 0.02, 0.09), AB.iron, s * 0.25, 0.01, 0.37, 0, 0, 0, abWb);         // its foot
    abRod(V3(s * 0.245, 0.06, 0.35), V3(s * 0.12, WB_Y - 0.15, -0.05), 0.008, AB.iron, abWb);            // and a stay up to the tray
    abRod(V3(s * 0.1, 0.21, -0.55), V3(s * 0.15, WB_Y + 0.05, -0.38), 0.009, AB.iron, abWb);             // the front brace
    [-0.2, 0.18].forEach(function (bz) { abPart(new THREE.CylinderGeometry(0.009, 0.009, 0.05, 6), AB.iron, s * (0.2 + bz * 0.04), WB_Y - 0.165, bz, 0, 0, 0, abWb); });   // bolts through the tray
  });
  abRod(V3(-0.2, 0.37, 0.12), V3(0.2, 0.37, 0.12), 0.012, AB.iron, abWb);                                // a cross bar between the handles
  // the wheel
  var WY = 0.17, WZ = -0.66;
  abPart(new THREE.TorusGeometry(0.135, 0.036, 10, 28), new THREE.MeshStandardMaterial({ color: 0x26262a, roughness: 0.9 }), 0, WY, WZ, 0, Math.PI / 2, 0, abWb);   // the tyre
  for (var tt = 0; tt < 28; tt++) { var ta = tt / 28 * Math.PI * 2; abPart(new THREE.BoxGeometry(0.06, 0.012, 0.018), new THREE.MeshStandardMaterial({ color: 0x1e1e22, roughness: 0.95 }), 0, WY + Math.sin(ta) * 0.168, WZ + Math.cos(ta) * 0.168, -ta, 0, 0, abWb); }   // its tread
  abPart(new THREE.TorusGeometry(0.1, 0.012, 6, 24), new THREE.MeshStandardMaterial({ color: 0xb83a2a, roughness: 0.5, metalness: 0.4 }), 0, WY, WZ, 0, Math.PI / 2, 0, abWb);   // a red steel rim
  abPart(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 14), new THREE.MeshStandardMaterial({ color: 0xb83a2a, roughness: 0.5, metalness: 0.4 }), 0, WY, WZ, 0, 0, Math.PI / 2, abWb);   // the hub
  for (var wsp = 0; wsp < 8; wsp++) { var wsa = wsp / 8 * Math.PI * 2; abRod(V3(0, WY, WZ), V3(0, WY + Math.sin(wsa) * 0.1, WZ + Math.cos(wsa) * 0.1), 0.005, AB.zinc, abWb); }   // the spokes
  abPart(new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8), AB.iron, 0, WY, WZ, 0, 0, Math.PI / 2, abWb);   // the axle,
  [-1, 1].forEach(function (s) { abPart(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 6), AB.iron, s * 0.1, WY, WZ, 0, 0, Math.PI / 2, abWb); });   // with nuts
  // the hay, heaped up in lumps, with straws everywhere
  // each lump is a bumpy core of packed hay inside two fluffy shells of loose strands (see-through between the straws)
  var wbHayMat = new THREE.MeshStandardMaterial({ color: 0xb8903e, roughness: 1 });
  var wbFluffTex = abStrawTex.clone(); wbFluffTex.needsUpdate = true; wbFluffTex.wrapS = wbFluffTex.wrapT = THREE.RepeatWrapping; wbFluffTex.repeat.set(2.5, 1.5);
  var wbFluff = new THREE.MeshStandardMaterial({ map: wbFluffTex, transparent: true, alphaTest: 0.4, roughness: 1, side: THREE.DoubleSide });
  function wbLumpGeo(seed, rough) {                                    // a sphere pushed in and out at random, the same along its seam
    var gg = new THREE.SphereGeometry(1, 18, 12), gp = gg.attributes.position;
    for (var v = 0; v < gp.count; v++) {
      var x = gp.getX(v), y = gp.getY(v), z = gp.getZ(v), k = 1 + (isle2Hash(Math.round(x * 40) * 3.1 + Math.round(y * 40) * 7.3 + Math.round(z * 40) * 1.7 + seed) - 0.5) * rough;
      gp.setXYZ(v, x * k, y * k, z * k);
    }
    gg.computeVertexNormals();
    return gg;
  }
  [[0, 0.62, 0, 0.3, 0.16, 0.38], [-0.12, 0.66, -0.15, 0.2, 0.14, 0.2], [0.1, 0.7, 0.1, 0.2, 0.16, 0.22], [0.02, 0.76, -0.02, 0.16, 0.12, 0.18], [0.14, 0.62, -0.25, 0.14, 0.1, 0.14], [-0.15, 0.63, 0.22, 0.15, 0.1, 0.15]].forEach(function (lp, k) {
    var rot = isle2Hash(k * 3) * 6;
    abPart(wbLumpGeo(k * 11, 0.25), wbHayMat, lp[0], lp[1], lp[2], 0, rot, 0, abWb).scale.set(lp[3] * 0.92, lp[4] * 0.9, lp[5] * 0.92);
    [1.0, 1.12].forEach(function (sh, n) {
      var fluff = abPart(wbLumpGeo(k * 11 + n * 5 + 3, 0.3), wbFluff, lp[0], lp[1], lp[2], 0, rot + n, 0, abWb);
      fluff.scale.set(lp[3] * sh, lp[4] * sh, lp[5] * sh); fluff.castShadow = n === 0;
    });
  });
  (function () {
    var n = 320, im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0035, 0.0025, 1, 3), hayWispMat, n), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color();
    for (var i = 0; i < n; i++) {
      var a = isle2Hash(i * 1.3 + 900) * Math.PI * 2, r = Math.sqrt(isle2Hash(i * 2.7 + 900)), over = i % 5 === 0;
      var px = Math.cos(a) * r * (over ? 0.33 : 0.28), pz = Math.sin(a) * r * (over ? 0.43 : 0.38);
      var py = over ? WB_Y + 0.14 : 0.62 + (1 - r) * 0.18 + isle2Hash(i * 3.9) * 0.06;
      e.set((isle2Hash(i * 5.1) - 0.5) * (over ? 3 : 2.2), isle2Hash(i * 6.3) * 6.3, (isle2Hash(i * 7.7) - 0.5) * (over ? 3 : 2.2)); q.setFromEuler(e);
      sc.set(1, 0.08 + isle2Hash(i * 8.9) * 0.14, 1); pos.set(px, py, pz);
      m.compose(pos, q, sc); im.setMatrixAt(i, m);
      im.setColorAt(i, col.setHSL(0.11 + isle2Hash(i * 11) * 0.03, 0.55, 0.45 + isle2Hash(i * 13) * 0.25));
    }
    im.castShadow = true; abWb.add(im);
  })();
  for (var wfl = 0; wfl < 14; wfl++) { var wfA = isle2Hash(wfl * 3.3 + 70) * Math.PI * 2, wfR = 0.45 + isle2Hash(wfl * 4.4) * 0.25; abPart(new THREE.CylinderGeometry(0.003, 0.002, 0.12, 3), hayWispMat, Math.cos(wfA) * wfR * 0.8, 0.006, Math.sin(wfA) * wfR, Math.PI / 2, wfA, 0, abWb).castShadow = false; }   // and some fallen on the floor
  // a pitchfork stuck in the hay
  abRod(V3(0.05, 0.6, 0.05), V3(0.2, 1.55, 0.42), 0.014, AB.wood, abWb);
  abRod(V3(0.04, 0.55, 0.03), V3(0.07, 0.68, 0.09), 0.02, AB.iron, abWb);                               // its ferrule, going into the hay
  abPart(new THREE.TorusGeometry(0.04, 0.008, 6, 12, Math.PI), AB.iron, 0.205, 1.57, 0.43, 0, 0.3, 0, abWb);   // a D handle
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
  // ---------- Fluff & Feather's counter: step up to it inside the barn to buy hay (and, one day, animals) ----------
  var HAY_COST = 12;                                                   // Star Coins a bundle (it sells back for less)
  ITEMS.hay.info = 'A bundle of sweet hay. Buy it at Fluff & Feather, or find it trimming bushes (they have a 50% chance of dropping some).';
  var barnShopOpen = false;
  var barnShopBtn = document.createElement('button');
  barnShopBtn.type = 'button';
  barnShopBtn.className = 'sleep-btn ship-btn';
  barnShopBtn.innerHTML = '🐾 Shop <kbd>E</kbd>';
  canvas.parentNode.appendChild(barnShopBtn);
  var barnShopBox = document.createElement('div');
  barnShopBox.className = 'inventory ship shop';
  barnShopBox.hidden = true;
  barnShopBox.innerHTML = '<div class="inv-head"><b>🐾 Fluff &amp; Feather</b><button type="button" class="inv-close" aria-label="Close the shop">✕</button></div>' +
    '<p class="ship-hint">Welcome to Fluff &amp; Feather! Feed, supplies and magical creatures for your farm.</p>' +
    '<div class="shop-item"><div class="slot shop-pic"></div><div class="shop-text"><b>Hay</b><span>A bundle of sweet, sun-dried hay, fresh from the loft.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + HAY_COST + ' each</span></div></div>' +
    '<div class="shop-buy"><button type="button" data-n="1">Buy 1</button><button type="button" data-n="5">Buy 5</button><button type="button" data-n="10">Buy 10</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic glim-pic"></div><div class="shop-text"><b>Glimmerwing</b><span>A gentle, glowing little creature with shimmering moth wings. Feed it hay and pet it every day, and it lays a Glimmer Egg each morning. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + GLIM_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="glim-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic moon-pic"></div><div class="shop-text"><b>Mooncalf</b><span>A gentle creature with a pearly coat whose spots are patches of starry night sky, crescent-moon horns and star-bright hooves. Feed it hay and pet it every day, and the next morning you can milk it for Moonmilk. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + MOON_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="moon-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic pail-pic"></div><div class="shop-text"><b>Milk Pail</b><span>You need one to milk your Mooncalves. It never wears out.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + PAIL_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="pail-buy">Buy</button></div>' +
    '<p class="ship-hint glim-stalls" style="margin:8px 2px 0"></p>' +
    '<p class="ship-total">You have <img class="coin-icon" alt=""> <b>0</b></p>';
  canvas.parentNode.appendChild(barnShopBox);
  barnShopBox.querySelector('.shop-pic').appendChild(itemPicture('hay'));
  var glimPic = document.createElement('img'); glimPic.src = glimShopIcon; glimPic.alt = ''; glimPic.style.width = '96%'; glimPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.glim-pic').appendChild(glimPic);
  var glimAdoptBtn = barnShopBox.querySelector('.glim-adopt'), glimStallsNote = barnShopBox.querySelector('.glim-stalls');
  glimAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('glim'); });
  var moonPic = document.createElement('img'); moonPic.src = moonShopIcon; moonPic.alt = ''; moonPic.style.width = '96%'; moonPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.moon-pic').appendChild(moonPic);
  barnShopBox.querySelector('.pail-pic').appendChild(itemPicture('milkPail'));
  var moonAdoptBtn = barnShopBox.querySelector('.moon-adopt'), pailBtn = barnShopBox.querySelector('.pail-buy');
  moonAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('moon'); });
  function hasPail() { return bag.some(function (b) { return b && b.id === 'milkPail'; }); }
  pailBtn.addEventListener('click', function () {
    if (hasPail()) { showToast('You already have a Milk Pail', 1800); return; }
    if (state.coins < PAIL_COST) { showToast('Not enough Star Coins', 1800); return; }
    if (!roomFor(['milkPail'])) { bagFull(); return; }
    addItem('milkPail', 1); state.coins -= PAIL_COST; showCoins(true); coinSound(3);
    showToast('Bought a Milk Pail 🪣', 1800); renderBarnShop();
  });
  paintCoinIcons(barnShopBox);
  var barnShopCoins = barnShopBox.querySelector('.ship-total b'), barnBuyBtns = barnShopBox.querySelectorAll('.shop-buy button[data-n]');   // (just the hay buttons)
  function renderBarnShop() {
    barnShopCoins.textContent = state.coins;
    for (var i = 0; i < barnBuyBtns.length; i++) {
      var n = +barnBuyBtns[i].getAttribute('data-n');
      barnBuyBtns[i].innerHTML = 'Buy ' + n + ' · <img class="coin-icon" alt=""> ' + n * HAY_COST;
      barnBuyBtns[i].disabled = state.coins < n * HAY_COST;
    }
    var full = glimFreeStall() < 0;                                    // the Glimmerwing: one for each empty stall
    glimAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + GLIM_COST;
    glimAdoptBtn.disabled = full || state.coins < GLIM_COST;
    moonAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + MOON_COST;
    moonAdoptBtn.disabled = full || state.coins < MOON_COST;
    var gotPail = hasPail();
    pailBtn.innerHTML = gotPail ? 'You have one ✓' : 'Buy · <img class="coin-icon" alt=""> ' + PAIL_COST;
    pailBtn.disabled = gotPail || state.coins < PAIL_COST;
    glimStallsNote.textContent = glimmers.length ? 'Your animals: ' + glimmers.map(function (g) { return g.name + (g.kind === 'moon' ? ' (Mooncalf)' : ' (Glimmerwing)'); }).join(', ') + ' · ' + glimmers.length + ' of 3 stalls' : 'There are 3 empty stalls waiting for your animals.';
    paintCoinIcons(barnShopBox);
  }
  function buyHay(n) {
    var cost = n * HAY_COST;
    if (state.coins < cost) { showToast('Not enough Star Coins', 1800); return; }
    if (!roomFor(['hay'])) { bagFull(); return; }
    addItem('hay', n);
    state.coins -= cost;
    showCoins(true);
    coinSound(n);
    showToast('Bought ' + n + ' Hay 🌾', 1800);
    renderBarnShop();
  }
  for (var bbi = 0; bbi < barnBuyBtns.length; bbi++) barnBuyBtns[bbi].addEventListener('click', function () { buyHay(+this.getAttribute('data-n')); });
  function openBarnShop() { if (barnShopOpen) return; toggleBag(false); barnShopOpen = true; menuOpenedAt = Date.now(); walkTarget = null; barnShopBox.hidden = false; renderBarnShop(); }
  function closeBarnShop() { barnShopOpen = false; barnShopBox.hidden = true; }
  barnShopBox.querySelector('.inv-close').addEventListener('click', function () { closeBarnShop(); focusGame(); });
  barnShopBtn.addEventListener('click', function () { openBarnShop(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && barnShopOpen) closeBarnShop(); });
  function updateBarnShop() {
    var near = atBarnCounter();
    if (barnShopOpen && !atBarnCounter(1.2)) closeBarnShop();          // it stays open until you really walk away from the counter
    if (barnShopOpen && barnShopCoins.textContent !== String(state.coins)) renderBarnShop();   // keep the prices up to date with your coins
    var show = near && !barnShopOpen && !glimNaming;
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
      var isTool = bag[i].id === 'axe' || bag[i].id === 'pickaxe' || bag[i].id === 'trimmers' || bag[i].id === 'hoe' || bag[i].id === 'milkPail'; // tools don't show a count
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
    if (glimNaming) return;
    var bagUp = bagUi.box && !bagUi.box.hidden;
    if (document.body.classList.contains('full') && (bagUp || binOpen || shopOpen || barnShopOpen)) {   // in full screen, a tap outside a menu closes it
      if (!menuJustOpened()) { toggleBag(false); if (binOpen) closeBin(); if (shopOpen) closeShop(); if (barnShopOpen) closeBarnShop(); }
      return;
    }
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
      rocks: mineable.map(function (r) { return r.state === 'whole' || r.gone ? null : (r.state === 'regrowing' ? r.brokeAt : gameMinutes()); }),
      glimmers: glimmerSaveData()                                     // your Glimmerwings
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
    glimmerLoadData(data.glimmers || null);                           // your Glimmerwings (none in older saves)
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
  // In full screen, menus sit beside the button column when there's room, so the buttons (Bag, Teleport...) stay
  // tappable and can close the menu they opened. On a narrow screen there isn't room: the buttons fade while a menu is
  // open, and a tap anywhere outside the menu closes it instead
  var ctlBox = document.querySelector('.controls');
  function layoutMenus() {
    var b = document.body;
    if (!b.classList.contains('full') || !ctlBox) { b.classList.remove('menu-side'); return; }
    var r = ctlBox.getBoundingClientRect(), space = window.innerWidth - r.left + 10, side = window.innerWidth - space >= 330;
    b.style.setProperty('--ctl-space', Math.round(space) + 'px');
    if (b.classList.contains('menu-side') !== side) b.classList.toggle('menu-side', side);
  }
  window.addEventListener('resize', function () { setTimeout(layoutMenus, 60); });
  window.addEventListener('orientationchange', function () { setTimeout(layoutMenus, 300); });
  btnFull.addEventListener('click', function () { setTimeout(layoutMenus, 120); });
  window.addEventListener('keydown', function (e) { if (e.code === 'KeyF') setTimeout(layoutMenus, 120); });
  document.addEventListener('fullscreenchange', function () { setTimeout(layoutMenus, 120); });
  document.addEventListener('webkitfullscreenchange', function () { setTimeout(layoutMenus, 120); });
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
    updateGlimmers(dt);
    updateGlimButton();
    updateBridge(state.time, night);
    updateInterior(dt, state.time);
    updateCrops(dt, night);
    updateWorld(dt, night);
    updateEffects(dt);
    updateCamera(dt);
    updateClinicInterior(state.time);
    cullScene();
    var menuUp = (bagUi.box && !bagUi.box.hidden) || binOpen || shopOpen || barnShopOpen || glimNaming;   // a menu is open: in full screen the button column steps aside, so taps on the menu don't land on the buttons behind it
    if (document.body.classList.contains('menu-open') !== menuUp) document.body.classList.toggle('menu-open', menuUp);
    if (inShop) { camera.updateMatrixWorld(); drawShopView(); }
    if (inClinic) { camera.updateMatrixWorld(); drawClinicView(); }
    if (inBarn) { camera.updateMatrixWorld(); drawBarnView(); }
    renderer.render(indoors ? (inBarn ? abScene : inClinic ? clinicScene : inShop ? shopScene : interiorScene) : scene, camera); // inside the house, the shop or the clinic, only that room is drawn
  }
  renderer.setAnimationLoop(frame);

});

// ---------- Starting up ----------
// Join the two parts back into one game (so they share the same variables, just as if they were one file) and run it
function startGame(THREE) {
  if (EVERDAWN_PARTS.length !== 2) { showToast('Part of the game is missing: check that script.js and script2.js are both there.', 60000); return; }
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
