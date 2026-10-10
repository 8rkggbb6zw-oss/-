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
    { name: 'Pearl', ribbon: 0x8a6ad8, coat: 0xf6f2ea, belly: 0xffffff, nose: 0xe8b8c0, hoof: 0xe0c890, glow: 0xfff2d0, iris: ['#6a5a8a', '#1a1428'] },
    { name: 'Silver', ribbon: 0x4a6ac8, coat: 0xc8ccd6, belly: 0xf0f2f6, nose: 0xc8a8b4, hoof: 0xd8dce8, glow: 0xdce8ff, iris: ['#3a5a8a', '#0e1828'] },
    { name: 'Gold', ribbon: 0xc85a7a, coat: 0xeadbb6, belly: 0xfff8e8, nose: 0xe0a8a8, hoof: 0xd8b060, glow: 0xffe4a0, iris: ['#7a5a30', '#24160a'] }
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
          g.strokeStyle = 'rgba(200,215,255,0.45)'; g.lineWidth = 0.9; g.beginPath();   // a little constellation joining a few of them
          for (var c = 0; c < 5; c++) { var cx = (glimR(k * 77 + c * 1.9) - 0.5) * sp[2] * 1.2, cy = (glimR(k * 77 + c * 3.3) - 0.5) * sp[3] * 1.2; g[c ? 'lineTo' : 'moveTo'](cx, cy); }
          g.stroke();
          for (c = 0; c < 5; c++) { var ox = (glimR(k * 77 + c * 1.9) - 0.5) * sp[2] * 1.2, oy = (glimR(k * 77 + c * 3.3) - 0.5) * sp[3] * 1.2; g.fillStyle = '#fffbe8'; g.beginPath(); g.arc(ox, oy, 1.8, 0, Math.PI * 2); g.fill(); }
          if (k % 3 === 0) { var sh = g.createLinearGradient(-sp[2] * 0.5, -sp[3] * 0.4, sp[2] * 0.1, -sp[3] * 0.1); sh.addColorStop(0, 'rgba(255,240,255,0)'); sh.addColorStop(1, 'rgba(255,250,240,0.9)'); g.strokeStyle = sh; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-sp[2] * 0.5, -sp[3] * 0.4); g.lineTo(sp[2] * 0.1, -sp[3] * 0.1); g.stroke(); }   // a shooting star
          g.restore(); g.restore();
        });
      });
    }));
  }
  function moonEyeTex(pal) {                                         // a big, sparkly iris: deep colour, fine streaks, a dark rim and a tiny star
    return new THREE.CanvasTexture(glimCanvas(256, 256, function (g, w, h) {
      g.fillStyle = '#0a0610'; g.fillRect(0, 0, w, h);
      var ig = g.createRadialGradient(128, 140, 6, 128, 128, 100); ig.addColorStop(0, '#0a0610'); ig.addColorStop(0.5, '#0a0610'); ig.addColorStop(0.6, pal.iris[0]); ig.addColorStop(0.78, pal.iris[0]); ig.addColorStop(0.92, pal.iris[1]); ig.addColorStop(1, '#05030a');
      g.fillStyle = ig; g.beginPath(); g.arc(128, 128, 100, 0, Math.PI * 2); g.fill();
      for (var r = 0; r < 90; r++) { var a = r / 90 * Math.PI * 2 + glimR(r) * 0.05; g.strokeStyle = 'rgba(255,255,255,' + (0.04 + glimR(r * 3.1) * 0.1) + ')'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(128 + Math.cos(a) * 56, 128 + Math.sin(a) * 56); g.lineTo(128 + Math.cos(a) * (80 + glimR(r) * 16), 128 + Math.sin(a) * (80 + glimR(r) * 16)); g.stroke(); }
      var lo = g.createRadialGradient(128, 200, 4, 128, 200, 80); lo.addColorStop(0, 'rgba(255,235,255,0.5)'); lo.addColorStop(1, 'rgba(255,235,255,0)'); g.fillStyle = lo; g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.fill();   // light glowing up from below
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.stroke();   // the dark rim
      g.fillStyle = 'rgba(255,250,230,0.95)'; g.beginPath();            // a tiny star twinkling down in the bottom of the iris
      for (var k = 0; k < 10; k++) { var sa = -Math.PI / 2 + k * Math.PI / 5, sr = k % 2 ? 3 : 8; g[k ? 'lineTo' : 'moveTo'](150 + Math.cos(sa) * sr, 172 + Math.sin(sa) * sr); }
      g.closePath(); g.fill();
      [[104, 176, 2.2], [166, 150, 1.6], [118, 190, 1.3]].forEach(function (d) { g.beginPath(); g.arc(d[0], d[1], d[2], 0, Math.PI * 2); g.fill(); });
    }));
  }
  function moonStarGeo(r, depth) {                                   // a little five-pointed star
    var sh = new THREE.Shape();
    for (var k = 0; k < 10; k++) { var a = Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; if (k) sh.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); else sh.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    return new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: true, bevelThickness: depth * 0.4, bevelSize: r * 0.12, bevelSegments: 2 });
  }
  var moonBlushTex = new THREE.CanvasTexture(glimCanvas(64, 64, function (g, w, h) {
    var bg = g.createRadialGradient(32, 32, 2, 32, 32, 31); bg.addColorStop(0, 'rgba(255,140,170,0.85)'); bg.addColorStop(0.6, 'rgba(255,150,180,0.45)'); bg.addColorStop(1, 'rgba(255,160,190,0)');
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
  }));
  // fur, the same way as the Glimmerwings': many thin shells, each a little further out and keeping only the longer
  // hairs. To keep it quick, all the shells of one part are merged into one mesh, each vertex knowing which shell
  // it's on, and the material throws away hairs too short for that shell
  var moonShellCache = [];
  function moonShellGeo(geo, n, depth) {
    for (var c = 0; c < moonShellCache.length; c++) { var e = moonShellCache[c]; if (e.geo === geo && e.n === n && e.depth === depth) return e.out; }
    var pa = geo.attributes.position.array, na = geo.attributes.normal.array, ua = geo.attributes.uv.array, cnt = geo.attributes.position.count;
    var ia = geo.index ? geo.index.array : null, ic = ia ? ia.length : cnt;
    var P = new Float32Array(cnt * n * 3), N = new Float32Array(cnt * n * 3), U = new Float32Array(cnt * n * 2), T = new Float32Array(cnt * n), I = new Uint32Array(ic * n);
    for (var k = 0; k < n; k++) {
      var fk = 1 + (k + 1) / n * depth, f = n > 1 ? k / (n - 1) : 0, t = 0.06 + f * 0.88;
      for (var v = 0; v < cnt; v++) {
        var o = (k * cnt + v) * 3;
        P[o] = pa[v * 3] * fk; P[o + 1] = pa[v * 3 + 1] * fk; P[o + 2] = pa[v * 3 + 2] * fk;
        N[o] = na[v * 3]; N[o + 1] = na[v * 3 + 1]; N[o + 2] = na[v * 3 + 2];
        U[(k * cnt + v) * 2] = ua[v * 2]; U[(k * cnt + v) * 2 + 1] = ua[v * 2 + 1]; T[k * cnt + v] = t;
      }
      for (var q = 0; q < ic; q++) I[k * ic + q] = (ia ? ia[q] : q) + k * cnt;
    }
    var out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.BufferAttribute(P, 3)); out.setAttribute('normal', new THREE.BufferAttribute(N, 3));
    out.setAttribute('uv', new THREE.BufferAttribute(U, 2)); out.setAttribute('shellT', new THREE.BufferAttribute(T, 1));
    out.setIndex(new THREE.BufferAttribute(I, 1));
    moonShellCache.push({ geo: geo, n: n, depth: depth, out: out });
    return out;
  }
  function moonFurMat(opts) {                                         // a material for merged shells: hairs shorter than the shell vanish, roots a little darker
    var m = new THREE.MeshStandardMaterial(opts);
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = 'attribute float shellT;\nvarying float vShellT;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vShellT = shellT;');
      sh.fragmentShader = 'varying float vShellT;\n' + sh.fragmentShader.replace('#include <alphatest_fragment>', 'if (diffuseColor.a < vShellT) discard;\n  diffuseColor.rgb *= mix(0.7, 1.08, vShellT);');
    };
    return m;
  }
  var moonSegLo = new THREE.SphereGeometry(1, 24, 16);                 // (the fur shells don't need as many faces)
  function moonBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body); abRoom.add(root);
    var coatCol = new THREE.Color(pal.coat), bellyCol = new THREE.Color(pal.belly), muzzleCol = new THREE.Color(pal.belly).lerp(new THREE.Color(pal.nose), 0.5);
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
    // a patch of really full fluff, the Glimmerwings' way: a soft core, many shells of hair (merged into one mesh)
    // and loose hairs standing out of it, each drooping a little
    var fluffMats = {};
    function fluff(x, y, z, sx, sy, sz, parent, col, glowCol, glowI, depth, nHairs, rx, ry) {
      var key = col + '/' + glowCol + '/' + glowI, fm = fluffMats[key];
      if (!fm) {
        var c = new THREE.Color(col);
        fm = fluffMats[key] = { core: new THREE.MeshStandardMaterial({ color: c.clone().multiplyScalar(0.8), roughness: 1, emissive: glowCol, emissiveIntensity: glowI * 0.5 }),
          shell: moonFurMat({ map: glimHairTex, color: c, roughness: 1, emissive: glowCol, emissiveIntensity: glowI }),
          hair: new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, emissive: glowCol, emissiveIntensity: glowI * 1.3 }) };
      }
      var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rx || 0, ry || 0, 0); parent.add(g);
      abPart(moonSegLo, fm.core, 0, 0, 0, 0, 0, 0, g).scale.set(sx * 0.97, sy * 0.97, sz * 0.97);
      var sh = abPart(moonShellGeo(moonSegLo, 20, depth), fm.shell, 0, 0, 0, 0, 0, 0, g); sh.scale.set(sx, sy, sz); sh.castShadow = false;
      if (nHairs) {
        var im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0006, 0.00015, 1, 3).translate(0, 0.5, 0), fm.hair, nHairs), mx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), dir = new THREE.Vector3(), pos = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
        var rAvg = (sx + sy + sz) / 3, seed = (x * 131 + y * 71 + z * 37) * 10;
        for (var h = 0; h < nHairs; h++) {
          var u = glimR(h * 1.7 + seed) * 2 - 1, th = glimR(h * 2.3 + seed) * Math.PI * 2, rr = Math.sqrt(1 - u * u), nx = rr * Math.cos(th), ny = u, nz = rr * Math.sin(th);
          pos.set(nx * sx * 0.98, ny * sy * 0.98, nz * sz * 0.98);
          dir.set(nx / sx + (glimR(h * 5.1 + seed) - 0.5) * 8, ny / sy + (glimR(h * 6.3 + seed) - 0.5) * 8 - 1.5, nz / sz + (glimR(h * 7.7 + seed) - 0.5) * 8).normalize();
          q.setFromUnitVectors(up, dir); sc.set(1, rAvg * depth * (0.55 + glimR(h * 3.1 + seed) * 0.35), 1);
          mx.compose(pos, q, sc); im.setMatrixAt(h, mx);
        }
        im.castShadow = false; g.add(im);
      }
      return g;
    }
    var BY = 0.42;
    // the body, built like a young calf's: a deep chest and shoulders, a straight back, a round barrel and square
    // hindquarters with the hip bones showing, and a soft pale belly
    var bodyParts = [[0, BY, 0, 0.185, 0.18, 0.29, 0.4], [0, BY + 0.02, 0.18, 0.175, 0.19, 0.15, 2.1], [0, BY + 0.02, -0.2, 0.18, 0.185, 0.15, 4.0], [0, BY + 0.13, 0.16, 0.11, 0.06, 0.11, 1.3], [0, BY + 0.12, -0.29, 0.065, 0.05, 0.07, 5.2]];
    bodyParts.forEach(function (b) { part(seg, coat, b[0], b[1], b[2], b[3], b[4], b[5], body, 0, b[6], 0, true); });
    [-1, 1].forEach(function (s) { part(seg, coat, s * 0.115, BY + 0.12, -0.2, 0.05, 0.04, 0.05, body, 0, s * 2, 0, true); });   // hip bones
    part(seg, belly, 0, BY - 0.1, 0.0, 0.135, 0.08, 0.24);
    // the neck, reaching forward and up, with a soft dewlap underneath
    var NRX = 1.1, neckC = V3(0, BY + 0.12, 0.33);
    part(new THREE.CylinderGeometry(0.075, 0.115, 0.26, 24), plain, neckC.x, neckC.y, neckC.z, 1, 1, 1, body, NRX, 0, 0, true);
    part(seg, belly, 0, BY - 0.0, 0.36, 0.05, 0.08, 0.07, body, 0.4, 0, 0, true);
    fluff(0, BY + 0.0, 0.35, 0.075, 0.1, 0.075, body, pal.belly, pal.belly, 0.2, 0.45, 900, 0.4);   // a big fluffy white bib on its chest
    // the head, held a little down: a broad forehead and a tapering muzzle with a moist nose pad
    var head = new THREE.Group(); head.position.set(0, BY + 0.24, 0.47); head.scale.setScalar(1.3); body.add(head);
    part(seg, plain, 0, 0, 0, 0.082, 0.085, 0.09, head, 0, 0, 0, 0.13);                // the skull
    part(seg, plain, 0, 0.03, 0.035, 0.078, 0.055, 0.06, head, 0, 0, 0, true);          // the broad forehead
    var snout = new THREE.CylinderGeometry(0.054, 0.07, 0.06, 24); snout.rotateX(Math.PI / 2);
    part(snout, plain, 0, -0.032, 0.058, 1, 0.82, 1, head, 0.1, 0, 0, 0.07);             // the short, soft muzzle
    part(seg, plain, 0, -0.032, 0.088, 0.054, 0.041, 0.03, head, 0, 0, 0, 0.08);
    var muzzleMat = new THREE.MeshStandardMaterial({ color: muzzleCol, roughness: 0.25, emissive: muzzleCol, emissiveIntensity: 0.14 });
    part(seg, muzzleMat, 0, -0.036, 0.104, 0.047, 0.035, 0.022, head);                  // the soft pink nose pad
    part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }), -0.012, -0.022, 0.121, 0.012, 0.006, 0.003, head, 0, 0, 0.3);   // the shine on its nose
    var nostrilMat = new THREE.MeshStandardMaterial({ color: 0x6a3a50, roughness: 0.4 });
    [-1, 1].forEach(function (s) { part(seg, nostrilMat, s * 0.02, -0.036, 0.123, 0.008, 0.013, 0.005, head, 0, s * 0.3, s * 0.4); });   // little nostrils
    abPart(new THREE.BoxGeometry(0.0015, 0.016, 0.004), nostrilMat, 0, -0.052, 0.121, 0, 0, 0, head);   // the groove under its nose
    part(seg, belly, 0, -0.068, 0.07, 0.038, 0.022, 0.04, head, 0.1, 0, 0);              // the chin
    var mouthMat = new THREE.MeshStandardMaterial({ color: 0x6a4a5a, roughness: 0.6 });
    [-1, 1].forEach(function (s) { abPart(new THREE.TorusGeometry(0.012, 0.0018, 5, 12, Math.PI * 0.9), mouthMat, s * 0.012, -0.06, 0.11, 0.35, 0, Math.PI * 1.05, head); });   // a little w-shaped smile
    var tongue = new THREE.Group(); tongue.position.set(0, -0.062, 0.106); tongue.rotation.x = 0.5; head.add(tongue);
    part(seg, new THREE.MeshStandardMaterial({ color: 0xff8aa8, roughness: 0.35, emissive: 0xff6a90, emissiveIntensity: 0.15 }), 0, 0, 0.006, 0.011, 0.004, 0.012, tongue);   // a tongue, for the odd little blep
    tongue.scale.set(1, 1, 0.01);
    // eyes: big and gentle, dark and glossy, with soft lids and lashes, set on the sides of the head
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0610, roughness: 0.05, metalness: 0.2 });
    var irisMat = new THREE.MeshStandardMaterial({ map: moonEyeTex(pal), roughness: 0.15, emissive: 0xffffff, emissiveMap: null, emissiveIntensity: 0 });
    irisMat.emissiveMap = irisMat.map; irisMat.emissiveIntensity = 0.35;   // a soft inner glow, so they sparkle even in the shade
    var corneaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.02, metalness: 0.1, depthWrite: false });
    var irisGeo = new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, 1.05); irisGeo.rotateX(Math.PI / 2);   // the front of the eyeball, with the iris mapped straight on
    (function () { var ps = irisGeo.attributes.position, uv = irisGeo.attributes.uv, k = 0.46 / Math.sin(1.05); for (var i = 0; i < ps.count; i++) uv.setXY(i, 0.5 + ps.getX(i) * k, 0.5 + ps.getY(i) * k); uv.needsUpdate = true; })();
    var lidMat = new THREE.MeshStandardMaterial({ color: coatCol.clone().multiplyScalar(0.95), roughness: 0.8, emissive: coatCol, emissiveIntensity: 0.12, side: THREE.DoubleSide });
    var lashMat = new THREE.MeshStandardMaterial({ color: 0x241a20, roughness: 0.6 }), lids = [];
    var lidGeo = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42);
    [-1, 1].forEach(function (s) {
      var ey = new THREE.Group(); ey.position.set(s * 0.055, 0.016, 0.062); ey.rotation.set(0.05, s * 0.62, 0); ey.scale.setScalar(1.32); head.add(ey);
      var RX = 0.026, RY = 0.027, RZ = 0.017;
      part(seg, eyeMat, 0, 0, 0, RX, RY, RZ, ey);
      var ir = abPart(irisGeo, irisMat, 0, 0, 0, 0, 0, 0, ey); ir.scale.set(RX * 1.01, RY * 1.01, RZ * 1.01);
      var co = abPart(irisGeo, corneaMat, 0, 0, 0, 0, 0, 0, ey); co.scale.set(RX * 1.06, RY * 1.06, RZ * 1.18); co.castShadow = false;
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.009, 0.009, RZ * 1.02, 0.0065, 0.0075, 0.002, ey);   // a big catchlight
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.002, 0.012, RZ * 1.0, 0.0025, 0.0025, 0.001, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), 0.009, -0.009, RZ * 0.98, 0.0035, 0.003, 0.001, ey);
      var lower = abPart(new THREE.TorusGeometry(1, 0.06, 6, 20, Math.PI * 0.7), lidMat, 0, 0, 0.004, 0, 0, Math.PI * 1.15, ey); lower.scale.set(RX * 1.02, RY * 1.02, RZ);   // the soft lower lid
      var lg = new THREE.Group(); ey.add(lg); lids.push(lg);           // the upper lid, which blinks, with its lashes
      var lid = abPart(lidGeo, lidMat, 0, 0, 0, 0, 0, 0, lg); lid.scale.set(RX * 1.1, RY * 1.1, RZ * 1.25);
      var fold = abPart(new THREE.TorusGeometry(1, 0.13, 8, 30, Math.PI * 0.86), lidMat, 0, 0.002, RZ * 0.15, 0, 0, Math.PI * 0.07, ey); fold.scale.set(RX * 1.06, RY * 1.08, RZ * 1.1);   // a soft, furry upper lid
      var liner = abPart(new THREE.TorusGeometry(1, 0.045, 6, 30, Math.PI * 0.86), lashMat, 0, 0, RZ * 0.38, 0, 0, Math.PI * 0.07, ey); liner.scale.set(RX * 0.97, RY * 0.97, RZ);   // a fine dark edge to it
      [0.18, 0.36, 0.55, 0.75, 0.97, 1.2, 1.45].forEach(function (a, n) {   // a fan of long lashes curling up along the top, longest at the outer corner
        var len = 0.014 - n * 0.0013, lx = s * Math.cos(a) * RX * 1.05, ly = Math.sin(a) * RY * 1.08 + 0.002;
        var lash = abPart(new THREE.ConeGeometry(0.0012, len, 5).translate(0, len / 2, 0), lashMat, lx, ly, RZ * 0.45, 0.55, 0, -Math.atan2(s * Math.cos(a) * 1.3, Math.sin(a) + 0.7), ey);
        lash.castShadow = false;
      });
      // a rosy blush on each cheek, dusted with a few tiny glowing star freckles
      var bl2 = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.034), new THREE.MeshBasicMaterial({ map: moonBlushTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      bl2.position.set(s * 0.067, -0.026, 0.06); bl2.rotation.set(0, s * 0.95, 0); head.add(bl2);
      [[0.0, 0.004], [0.012, -0.004], [-0.009, -0.006]].forEach(function (f) { var fr = abPart(new THREE.SphereGeometry(0.0022, 6, 5), new THREE.MeshBasicMaterial({ color: pal.glow }), 0, 0, 0, 0, 0, 0, head); fr.position.set(s * (0.071 + f[0] * 0.3), -0.022 + f[1], 0.058 + f[0] * 0.8); });
    });
    // leaf-shaped ears held out to the sides, pink and fuzzy inside
    var innerMat = new THREE.MeshStandardMaterial({ color: muzzleCol, roughness: 0.7, emissive: muzzleCol, emissiveIntensity: 0.12 });
    var ears = [];
    [-1, 1].forEach(function (s) {
      var ep = new THREE.Group(); ep.position.set(s * 0.072, 0.035, -0.03); ep.rotation.y = s * 0.3; head.add(ep);
      part(seg, plain, s * 0.054, 0, 0, 0.058, 0.019, 0.034, ep, 0, 0, 0, true);
      part(seg, innerMat, s * 0.056, 0.009, 0.004, 0.046, 0.01, 0.025, ep);
      fluff(s * 0.056, 0.012, 0.004, 0.042, 0.008, 0.022, ep, pal.belly, pal.belly, 0.2, 0.9, 0);   // soft fuzz filling the ear
      if (s < 0) {                                                     // a little gold star charm hanging from its left ear
        var gold = new THREE.MeshStandardMaterial({ color: 0xf6d070, emissive: 0x8a6010, emissiveIntensity: 0.45, metalness: 0.7, roughness: 0.25 });
        abPart(new THREE.TorusGeometry(0.007, 0.0016, 6, 14), gold, s * 0.065, -0.016, 0.01, 0, Math.PI / 2, 0, ep);
        var ch = abPart(moonStarGeo(0.011, 0.002), gold, s * 0.065, -0.032, 0.01, 0, Math.PI / 2, 0, ep); ch.geometry.center();
      }
      ears.push({ g: ep, s: s });
    });
    // a curly tuft on the poll between the horns
    part(seg, plain, 0, 0.075, 0.0, 0.04, 0.025, 0.04, head);
    fluff(0, 0.075, 0.0, 0.042, 0.027, 0.042, head, pal.coat, pal.coat, 0.2, 0.7, 500);
    [[0, 0.082, 0.035, 0.022], [-0.022, 0.078, 0.03, 0.017], [0.022, 0.078, 0.03, 0.017], [-0.012, 0.07, 0.05, 0.015], [0.012, 0.07, 0.05, 0.015], [0, 0.064, 0.058, 0.013]].forEach(function (c, ci) {   // little curls tumbling onto its forehead
      fluff(c[0], c[1], c[2], c[3], c[3] * 0.85, c[3], head, pal.coat, pal.coat, 0.2, 0.75, 110, 0, ci);
    });
    // horns: two small glowing crescent moons, with a ring of fur at each base
    var hornMat = new THREE.MeshStandardMaterial({ color: 0xfffbe8, emissive: pal.glow, emissiveIntensity: 1.0, roughness: 0.3 });
    var hornGlows = [];
    [-1, 1].forEach(function (s) {
      var hg = new THREE.Group(); hg.position.set(s * 0.05, 0.075, -0.015); hg.rotation.set(0, 0, -s * 0.35); head.add(hg);
      var horn = abPart(new THREE.TorusGeometry(0.036, 0.009, 10, 24, Math.PI * 0.95), hornMat, s * 0.036, 0.0, 0, 0, 0, 0, hg); horn.scale.set(s, 1, 1);
      abPart(new THREE.TorusGeometry(0.012, 0.007, 8, 14), plain, 0, 0, 0, Math.PI / 2, 0, 0, hg);
      var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      gl.scale.set(0.14, 0.14, 1); gl.position.set(s * 0.036, 0.025, 0); hg.add(gl); hornGlows.push(gl);
    });
    // the legs: front ones with a forearm, a knee and a slim cannon; back ones with a rounded thigh and a hock that
    // bends backwards; on split hooves that shine like stars, with little dewclaws and a glowing tuft above
    var hoofMat = new THREE.MeshStandardMaterial({ color: 0xfffaf0, emissive: pal.glow, emissiveIntensity: 0.8, roughness: 0.3 });
    var cleft = new THREE.MeshStandardMaterial({ color: 0x8a7a9a, roughness: 0.5 });
    var legs = [], hoofGlows = [];
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (lp) {
      var front = lp[1] > 0, hip = new THREE.Group(); hip.position.set(lp[0] * 0.1, BY - 0.07, front ? 0.19 : -0.2); body.add(hip);
      var kneeY, kneeZ;
      if (front) { part(new THREE.CylinderGeometry(0.032, 0.052, 0.17, 16), coat, 0, -0.065, 0, 1, 1, 1.1, hip, 0, lp[0], 0, true); kneeY = -0.16; kneeZ = 0; }
      else { part(seg, coat, 0, 0.0, -0.01, 0.066, 0.105, 0.088, hip, 0.15, lp[0] * 2, 0, true); part(new THREE.CylinderGeometry(0.028, 0.044, 0.13, 14), plain, 0, -0.11, -0.03, 1, 1, 1, hip, 0.35, 0, 0, true); kneeY = -0.17; kneeZ = -0.055; }
      var knee = new THREE.Group(); knee.position.set(0, kneeY, kneeZ); hip.add(knee);
      part(seg, plain, 0, 0, 0, 0.032, 0.032, 0.032, knee, 0, 0, 0, true);
      var cannon = front ? 0.15 : 0.14, cz = front ? 0 : 0.03;
      part(new THREE.CylinderGeometry(0.022, 0.027, cannon, 14), plain, 0, -cannon / 2, cz / 2, 1, 1, 1, knee, front ? 0 : -0.17, 0, 0, true);
      var fy = -cannon - 0.01;
      part(seg, plain, 0, fy + 0.01, cz, 0.024, 0.022, 0.024, knee);                   // the fetlock
      fluff(0, fy + 0.012, cz, 0.03, 0.022, 0.03, knee, 0xffffff, pal.glow, 0.35, 0.75, 220);   // a glowing tuft of feathering above each hoof
      [-1, 1].forEach(function (s) { abPart(new THREE.CylinderGeometry(0.011, 0.016, 0.034, 10), hoofMat, s * 0.0105, fy - 0.026, cz + 0.006, 0.12, 0, 0, knee).scale.set(1, 1, 1.3); });   // the two halves of the hoof
      abPart(new THREE.BoxGeometry(0.003, 0.03, 0.025), cleft, 0, fy - 0.026, cz + 0.016, 0.12, 0, 0, knee);
      abPart(new THREE.TorusGeometry(0.025, 0.004, 6, 20), hoofMat, 0, fy - 0.01, cz + 0.004, Math.PI / 2 + 0.12, 0, 0, knee).scale.set(1, 1.25, 1);   // a shining band round the top of the hoof
      [-1, 1].forEach(function (s) { abPart(new THREE.SphereGeometry(0.006, 8, 6), hoofMat, s * 0.012, fy + 0.0, cz - 0.022, 0, 0, 0, knee); });   // dewclaws
      var hgl = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonStarTex, color: pal.glow, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      hgl.scale.set(0.08, 0.08, 1); hgl.position.set(0, fy - 0.026, cz + 0.03); knee.add(hgl); hoofGlows.push(hgl);
      legs.push({ hip: hip, knee: knee, ph: lp[0] * lp[1] > 0 ? 0 : Math.PI, back: !front });
    });
    // a small pink udder, with four little teats
    part(seg, muzzleMat, 0, BY - 0.165, -0.15, 0.055, 0.04, 0.05);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { abPart(new THREE.CylinderGeometry(0.006, 0.008, 0.026, 10), muzzleMat, c[0] * 0.022, BY - 0.205, -0.15 + c[1] * 0.022, 0, 0, 0, body); });
    // a long, thin tail hanging down to the hocks, ending in a tuft of starlight
    var tail = new THREE.Group(); tail.position.set(0, BY + 0.13, -0.34); body.add(tail);
    var tc = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0, -0.04, -0.035), V3(0, -0.13, -0.05), V3(0, -0.24, -0.045)]);
    abPart(new THREE.TubeGeometry(tc, 20, 0.008, 6), plain, 0, 0, 0, 0, 0, 0, tail);
    fluff(0, -0.27, -0.045, 0.024, 0.042, 0.024, tail, 0xffffff, pal.glow, 0.5, 0.9, 260);
    var star = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonStarTex, color: pal.glow, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
    star.scale.set(0.1, 0.1, 1); star.position.set(0, -0.28, -0.045); tail.add(star);
    var ribbonMat = new THREE.MeshStandardMaterial({ color: pal.ribbon, roughness: 0.5, emissive: pal.ribbon, emissiveIntensity: 0.15, side: THREE.DoubleSide });
    function bow(parent, x, y, z, rx, sc) {                           // a satin ribbon bow: two puffy loops, a knot and two notched tails
      var b = new THREE.Group(); b.position.set(x, y, z); b.rotation.x = rx; b.scale.setScalar(sc); parent.add(b);
      [-1, 1].forEach(function (s) {
        var lo = abPart(new THREE.TorusGeometry(0.02, 0.0065, 8, 22), ribbonMat, s * 0.022, 0.004, 0, 0, 0, s * 0.25, b); lo.scale.set(1.15, 0.7, 0.55);
        var tl = new THREE.Shape(); tl.moveTo(-0.006, 0); tl.lineTo(0.006, 0); tl.lineTo(0.009, -0.04); tl.lineTo(0.0, -0.033); tl.lineTo(-0.003, -0.042); tl.closePath();
        abPart(new THREE.ShapeGeometry(tl), ribbonMat, s * 0.004, -0.004, 0.003, 0, 0, s * 0.35, b);
      });
      abPart(new THREE.SphereGeometry(0.009, 12, 10), ribbonMat, 0, 0.002, 0.002, 0, 0, 0, b).scale.set(1, 1.1, 0.8);
      abPart(moonStarGeo(0.006, 0.0015), new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: pal.glow, emissiveIntensity: 0.8 }), 0, 0.002, 0.009, 0, 0, 0, b);   // a little star in the middle
      return b;
    }
    bow(tail, 0, -0.205, -0.055, 0, 0.7).rotation.set(0.15, Math.PI, 0);
    // a velvet ribbon collar with a little crescent-moon bell
    var axis = V3(0, Math.cos(NRX), Math.sin(NRX)), down = V3(0, -Math.sin(NRX), Math.cos(NRX));
    var cc = neckC.clone().add(axis.clone().multiplyScalar(-0.03));
    var collar = new THREE.Group(); collar.position.copy(cc); collar.rotation.x = NRX - Math.PI / 2; body.add(collar);
    abPart(new THREE.TorusGeometry(0.104, 0.011, 10, 48), ribbonMat, 0, 0, 0, 0, 0, 0, collar).scale.set(1, 1, 1.25);
    var studMat = new THREE.MeshStandardMaterial({ color: 0xf6d070, emissive: 0x8a6010, emissiveIntensity: 0.5, metalness: 0.7, roughness: 0.25 }), sg1 = moonStarGeo(0.007, 0.0015), zq = new THREE.Vector3(0, 0, 1);
    for (var st = 0; st < 9; st++) {                                   // gold star studs round the collar
      var sa = -Math.PI / 2 + (st - 4) * 0.42; if (st === 4) continue;
      var sd = abPart(sg1, studMat, Math.cos(sa) * 0.116, Math.sin(sa) * 0.116, 0, 0, 0, 0, collar);
      sd.quaternion.setFromUnitVectors(zq, new THREE.Vector3(Math.cos(sa), Math.sin(sa), 0));
    }
    bow(collar, 0, 0.112, 0, -Math.PI / 2 + 0.25, 1);                  // and a big ribbon bow on top of its neck
    collar.children[collar.children.length - 1].rotation.set(-Math.PI / 2 + 0.25, 0, Math.PI);   // (its tails hanging back down the neck)
    [-1, 1].forEach(function (s) { var pc = cc.clone().add(axis.clone().multiplyScalar(s * 0.008)); abPart(new THREE.TorusGeometry(0.105, 0.0022, 6, 40), new THREE.MeshStandardMaterial({ color: 0xf2d080, roughness: 0.3, metalness: 0.6 }), pc.x, pc.y, pc.z, NRX - Math.PI / 2, 0, 0, body); });
    var bp = cc.clone().add(down.clone().multiplyScalar(0.118));
    var bell = new THREE.Group(); bell.position.copy(bp); body.add(bell);
    var brass = new THREE.MeshStandardMaterial({ color: 0xf0c860, emissive: 0x7a5410, emissiveIntensity: 0.35, metalness: 0.55, roughness: 0.28 });
    abPart(new THREE.TorusGeometry(0.007, 0.0022, 6, 12), brass, 0, 0.0, 0, 0, 0, 0, bell);
    abPart(new THREE.SphereGeometry(0.02, 18, 14), brass, 0, -0.024, 0, 0, 0, 0, bell);
    abPart(new THREE.BoxGeometry(0.026, 0.002, 0.006), new THREE.MeshStandardMaterial({ color: 0x3a2a10 }), 0, -0.03, 0.017, 0, 0, 0, bell);
    abPart(moonStarGeo(0.007, 0.0015), new THREE.MeshStandardMaterial({ color: 0xfff6d0, emissive: pal.glow, emissiveIntensity: 0.9 }), 0, -0.018, 0.018, -0.35, 0, 0, bell);   // a star on the front of the bell
    abPart(new THREE.TorusGeometry(0.0205, 0.0012, 6, 24), brass, 0, -0.024, 0, Math.PI / 2, 0, 0, bell);   // its rim
    abPart(new THREE.SphereGeometry(0.004, 8, 6), new THREE.MeshStandardMaterial({ color: 0x5a4020, metalness: 0.4 }), 0, -0.043, 0.004, 0, 0, 0, bell);   // the jingle inside
    var bsp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: 0xfff4d0, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); bsp.scale.set(0.03, 0.03, 1); bsp.position.set(-0.01, -0.015, 0.02); bell.add(bsp);
    // a short, smooth coat: fine hairs lying back along the body, softening its outline
    (function () {
      var list = [];
      for (var i = 0; i < 3000; i++) {
        var bpt = bodyParts[i % bodyParts.length], u = glimR(i * 1.7 + 700) * 2 - 1, th = glimR(i * 2.3 + 700) * Math.PI * 2, rr = Math.sqrt(1 - u * u), nx = rr * Math.cos(th), ny = u, nz = rr * Math.sin(th);
        var px = bpt[0] + nx * bpt[3] * 1.01, py = bpt[1] + ny * bpt[4] * 1.01, pz = bpt[2] + nz * bpt[5] * 1.01, inside = false;
        bodyParts.forEach(function (o) { if (o !== bpt && Math.pow((px - o[0]) / o[3], 2) + Math.pow((py - o[1]) / o[4], 2) + Math.pow((pz - o[2]) / o[5], 2) < 0.92) inside = true; });
        if (!inside && ny > -0.6) list.push([px, py, pz, nx, ny, nz, glimR(i * 5.9)]);
      }
      var im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0012, 0.0003, 1, 3).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, emissive: coatCol, emissiveIntensity: 0.2 }), list.length), hc = new THREE.Color();
      var mx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), pos = new THREE.Vector3();
      list.forEach(function (h, i) {
        dir.set(h[3] * 0.5 + (glimR(i * 3.1) - 0.5) * 0.2, h[4] * 0.5 - 0.15, h[5] * 0.5 - 0.85).normalize();   // lying back toward the tail
        q.setFromUnitVectors(up, dir); sc.set(1, 0.007 + h[6] * 0.008, 1); pos.set(h[0], h[1], h[2]);
        mx.compose(pos, q, sc); im.setMatrixAt(i, mx); im.setColorAt(i, hc.copy(coatCol).lerp(bellyCol, h[6] * 0.5));
      });
      im.castShadow = false; body.add(im);
    })();
    // sparkles drifting up off its starry spots, and a few circling its horns
    var sparks = [];
    for (var sp = 0; sp < 8; sp++) { var sk = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: 0xfff6d8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); sk.scale.set(0.035, 0.035, 1); body.add(sk); sparks.push({ s: sk, t: glimR(sp) * 2, x: 0, y: 0, z: 0 }); }
    var hornSparks = [];
    for (var hs = 0; hs < 4; hs++) { var hk = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: pal.glow, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false })); hk.scale.set(0.028, 0.028, 1); head.add(hk); hornSparks.push({ s: hk, p: hs * Math.PI / 2, side: hs % 2 ? 1 : -1 }); }
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.5, 1.5, 1); glow.position.set(0, 0.55, 0); root.add(glow);
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.42, 0.16, 1); tag.position.set(0, 1.15, 0); tag.renderOrder = 6; root.add(tag);
    return { root: root, body: body, head: head, ears: ears, legs: legs, tail: tail, star: star, coat: coat, bell: bell, sparks: sparks, hornSparks: hornSparks, hornMat: hornMat, hornGlows: hornGlows, hoofMat: hoofMat, hoofGlows: hoofGlows, glow: glow, tagCv: tagCv, tagTex: tagTex, lids: lids, tongue: tongue, bellSpark: bsp };
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
    if (g.pet > 0) { g.pet -= dt; m.head.rotation.set(0.32 + Math.sin(g.pet * 4) * 0.06, Math.sin(g.pet * 5) * 0.15, Math.sin(g.pet * 3) * 0.08); }
    else {
      var graze = Math.max(0, Math.sin(t * 0.21 + g.stall * 2.3) - 0.6) * 2.2;   // now and then it lowers its head to nose at the straw
      m.head.rotation.set(0.3 + graze * 0.5 + Math.sin(t * 0.7 + g.stall) * 0.05 + (moving ? Math.sin(g.hop * 2) * 0.05 : 0), Math.sin(t * 0.4 + g.stall * 2) * 0.3 * (1 - graze * 0.6), Math.sin(t * 0.33 + g.stall) * 0.06);
    }
    m.ears.forEach(function (e, k) {
      var flick = Math.max(0, Math.sin(t * 0.9 + k * 2.3 + g.stall) - 0.94) * 12;
      e.g.rotation.z = e.s * (-0.25 + Math.sin(t * 1.2 + k) * 0.06 + flick * 0.3 + (g.pet > 0 ? 0.35 : 0));
      e.g.rotation.y = e.s * flick * 0.2;
    });
    var bt = (t * 0.23 + g.stall * 0.37) % 1, blink = bt < 0.035 ? Math.sin(bt / 0.035 * Math.PI) : 0;   // it blinks every few seconds
    if (g.pet > 0) blink = 0.75;                                       // and squeezes its eyes happily shut when petted
    m.lids.forEach(function (l) { l.visible = blink > 0.03; l.rotation.x = -0.62 + blink * 1.55; });
    var bl = (t * 0.11 + g.stall * 0.29) % 1, blep = g.pet > 0 ? 1 : (bl < 0.06 ? Math.sin(bl / 0.06 * Math.PI) : 0);   // now and then a little blep
    m.tongue.scale.z = 0.01 + blep * 0.99;
    m.bellSpark.material.opacity = 0.4 + Math.sin(t * 3.3 + g.stall) * 0.4;
    m.tail.rotation.z = Math.sin(t * 1.6 + g.stall) * 0.25 + (g.pet > 0 ? Math.sin(t * 9) * 0.35 : 0);
    m.tail.rotation.x = -0.1 + Math.sin(t * 1.1) * 0.05;
    var pulse = 0.5 + Math.sin(t * 1.5 + g.stall * 1.3) * 0.5;
    m.coat.emissiveIntensity = 0.75 + Math.sin(t * 2.6 + g.stall) * 0.25;           // the stars in its spots twinkle
    m.hornMat.emissiveIntensity = 0.8 + pulse * 0.4 + (g.egg ? 0.4 : 0);
    m.hornGlows.forEach(function (h) { h.material.opacity = 0.35 + pulse * 0.25 + (g.egg ? 0.2 : 0); });
    m.hoofGlows.forEach(function (h, k) { h.material.opacity = 0.35 + Math.sin(t * 2.2 + k * 1.7) * 0.2; });
    m.star.material.opacity = 0.6 + Math.sin(t * 3 + g.stall) * 0.3;
    m.bell.rotation.x = (moving ? Math.sin(g.hop * 2) * 0.35 : 0) + Math.sin(t * 1.3 + g.stall) * 0.05 + (g.pet > 0 ? Math.sin(t * 12) * 0.3 : 0);   // the bell swings as it walks
    m.bell.rotation.z = moving ? Math.sin(g.hop) * 0.2 : 0;
    m.sparks.forEach(function (sp) {                                // sparkles drifting up off its spots
      sp.t += dt * 0.45;
      if (sp.t > 1) { sp.t -= 1 + Math.random() * 1.5; var a = (Math.random() - 0.5) * 2.2; sp.x = Math.sin(a) * 0.165; sp.y = 0.42 + Math.cos(a) * 0.18; sp.z = (Math.random() - 0.5) * 0.5; }
      sp.s.material.opacity = sp.t > 0 ? Math.sin(sp.t * Math.PI) * 0.9 : 0;
      sp.s.position.set(sp.x, sp.y + Math.max(0, sp.t) * 0.3, sp.z);
    });
    m.hornSparks.forEach(function (h) { var a = t * 2 + h.p; h.s.position.set(h.side * 0.09 + Math.cos(a) * 0.03, 0.12 + Math.sin(a * 1.3) * 0.02, -0.015 + Math.sin(a) * 0.03); h.s.material.opacity = 0.45 + Math.sin(a * 2) * 0.3; });
    m.glow.material.opacity = 0.12 + pulse * 0.05;
    if (g.egg) { g.eggMesh.position.set(g.x, 1.0 + Math.sin(t * 2) * 0.04, g.z); g.eggGlow.material.opacity = 0.35 + Math.sin(t * 2 + g.stall) * 0.12; }
  }
  // ---------- Puddlewisps ----------
  // Little magical creatures shaped like a plump pond duck, but not a duck: their feathers are the deep blue of a night
  // pond, rippling with silvery rings like moonlight on water and dusted with stars; they have big shining eyes with a
  // moonlit ring round them, a soft pearly bill, a curl of plume feathers tipped with stars, glowing webbed feet, and
  // little ripples of light spread out round them wherever they stand. Feed one hay and pet it every day, and the next
  // morning there's a Dewdrop Egg in its straw
  var DUCK_COST = 300;
  var DUCK_PALS = [                                                   // midnight blue, twilight violet and deep lagoon teal
    { name: 'Midnight', back: '#1c2c64', mid: '#3c62b4', breast: '#c4d8fa', ripple: '#d8ecff', glow: 0xa8c8ff, bill: 0xf4d68c, feet: 0xc4d4ff, spec: [0x4ad8ff, 0x9a6aff], iris: ['#3a5a9a', '#0e1830'] },
    { name: 'Twilight', back: '#2e2062', mid: '#6a4cb8', breast: '#dccaf8', ripple: '#f2e2ff', glow: 0xd4b4ff, bill: 0xf6cc9c, feet: 0xdcc8ff, spec: [0xff7ad8, 0x7a8aff], iris: ['#5a3a8a', '#1a0e2a'] },
    { name: 'Lagoon', back: '#123a52', mid: '#2a7a94', breast: '#bcece6', ripple: '#dcfff8', glow: 0x9cf0e0, bill: 0xf6de94, feet: 0xb8f0e8, spec: [0x5affc8, 0x4a9aff], iris: ['#2a6a6a', '#0a2222'] }
  ];
  function duckFeatherTex(pal, glowOnly) {                            // its feathers: night-pond blue, scalloped, with silver ripple rings and stars
    return new THREE.CanvasTexture(glimCanvas(1024, 512, function (g, w, h) {
      if (glowOnly) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
      else {
        var gr = g.createLinearGradient(0, 0, 0, h);                  // dark along its back, paling to a moonlit breast underneath
        gr.addColorStop(0, pal.back); gr.addColorStop(0.22, pal.mid); gr.addColorStop(0.46, pal.breast); gr.addColorStop(1, pal.breast);
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
        for (var row = 0; row < 46; row++) for (var col = 0; col < 62; col++) {   // overlapping scalloped feathers, each with a pale edge, a fine shaft and barbs
          var fx = col * 17 + (row % 2) * 8.5 + (glimR(row * 7 + col) - 0.5) * 3, fy = row * 11.5, fr = 9 + glimR(row * 13 + col) * 1.5;
          g.fillStyle = 'rgba(0,0,30,0.07)'; g.beginPath(); g.arc(fx, fy + 2, fr, 0, Math.PI); g.fill();
          g.strokeStyle = 'rgba(255,255,255,' + (0.06 + glimR(row * 41 + col) * 0.08) + ')'; g.lineWidth = 1.3;
          g.beginPath(); g.arc(fx, fy, fr, 0.12, Math.PI - 0.12); g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.09)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(fx, fy - fr * 0.6); g.lineTo(fx, fy + fr * 0.9); g.stroke();
          for (var bb = 0; bb < 4; bb++) { var by2 = fy - fr * 0.3 + bb * fr * 0.3; g.beginPath(); g.moveTo(fx, by2); g.lineTo(fx - fr * 0.55, by2 + fr * 0.35); g.moveTo(fx, by2); g.lineTo(fx + fr * 0.55, by2 + fr * 0.35); g.stroke(); }
        }
        for (var b = 0; b < 14000; b++) { var bx = glimR(b * 1.9 + 40) * w, by = glimR(b * 2.7 + 40) * h; g.strokeStyle = 'rgba(255,255,255,0.05)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - 2.5, by + 4); g.stroke(); }   // fine barbs
      }
      var rc = [[120, 80], [380, 140], [660, 60], [900, 160], [220, 280], [540, 300], [820, 340], [80, 400], [400, 440], [700, 460]];
      rc.forEach(function (c, k) {                                    // ripple rings, like moonlight on a still pond
        [-w, 0, w].forEach(function (off) {
          for (var r = 0; r < 6; r++) {
            var rr = 12 + r * 16 + glimR(k * 7 + r) * 6;
            g.strokeStyle = glowOnly ? 'rgba(200,225,255,' + (0.55 - r * 0.08) + ')' : pal.ripple; g.globalAlpha = glowOnly ? 1 : 0.42 - r * 0.06; g.lineWidth = glowOnly ? 2.4 : 2;
            g.beginPath(); g.ellipse(c[0] + off, c[1], rr * 1.4, rr * 0.55, 0, 0, Math.PI * 2); g.stroke();
            if (!glowOnly) { g.globalAlpha *= 0.4; g.lineWidth = 0.8; g.beginPath(); g.ellipse(c[0] + off, c[1] + 2, rr * 1.4 + 3, rr * 0.55 + 1.5, 0, 0.2, Math.PI - 0.2); g.stroke(); }   // a soft second line under each
          }
          g.globalAlpha = 1;
        });
      });
      for (var st = 0; st < 220; st++) {                              // and a dusting of stars
        var sx = glimR(st * 3.1 + 7) * w, sy = glimR(st * 4.3 + 7) * h * 0.8, sr = 0.8 + glimR(st * 5.9) * 2;
        g.fillStyle = 'rgba(255,255,240,0.9)'; g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
        if (sr > 2.3) { g.fillRect(sx - 0.6, sy - sr * 2.6, 1.2, sr * 5.2); g.fillRect(sx - sr * 2.6, sy - 0.6, sr * 5.2, 1.2); }
      }
    }));
  }
  // single feathers, for the wings: a vane with a pale shaft, fine barbs, a moonlit edge and a star or two
  function duckQuillTex(pal, long, glowOnly) {
    return new THREE.CanvasTexture(glimCanvas(64, long ? 256 : 128, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      if (glowOnly) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
      function vane() {                                               // base at the top, rounded tip at the bottom
        g.beginPath(); g.moveTo(w * 0.5, 0); g.bezierCurveTo(w * 0.85, h * 0.1, w * 0.98, h * 0.55, w * 0.9, h * 0.82); g.quadraticCurveTo(w * 0.7, h, w * 0.45, h * 0.98);
        g.quadraticCurveTo(w * 0.12, h * 0.94, w * 0.08, h * 0.75); g.bezierCurveTo(w * 0.02, h * 0.5, w * 0.15, h * 0.1, w * 0.5, 0); g.closePath();
      }
      vane();
      if (!glowOnly) {
        var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, pal.mid); gr.addColorStop(0.65, pal.back); gr.addColorStop(1, pal.back);
        g.fillStyle = gr; g.fill(); g.save(); g.clip();
        g.strokeStyle = 'rgba(255,255,255,0.13)'; g.lineWidth = 0.8;
        for (var y = 4; y < h; y += 3) { g.beginPath(); g.moveTo(w * 0.5, y); g.lineTo(0, y + w * 0.45); g.moveTo(w * 0.5, y); g.lineTo(w, y + w * 0.45); g.stroke(); }   // barbs
        g.restore();
      }
      g.save(); vane(); g.clip();
      g.strokeStyle = pal.ripple; g.globalAlpha = glowOnly ? 0.9 : 0.75; g.lineWidth = 5; vane(); g.stroke();   // the moonlit edge
      g.globalAlpha = glowOnly ? 0.35 : 0.6; g.lineWidth = 1.6; g.beginPath(); g.moveTo(w * 0.5, 0); g.quadraticCurveTo(w * 0.52, h * 0.5, w * 0.47, h * 0.95); g.stroke();   // the shaft
      g.globalAlpha = 1; g.fillStyle = '#fffbe8';
      for (var k = 0; k < (long ? 3 : 1); k++) { var sx = w * (0.3 + glimR(k * 3 + h) * 0.4), sy = h * (0.35 + glimR(k * 5 + h) * 0.5); g.beginPath(); g.arc(sx, sy, 1.6, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }));
  }
  var duckPuddleTex = new THREE.CanvasTexture(glimCanvas(256, 256, function (g, w, h) {   // the little starlit puddle it stands in
    var pg = g.createRadialGradient(128, 128, 10, 128, 128, 126); pg.addColorStop(0, 'rgba(18,28,70,0.85)'); pg.addColorStop(0.7, 'rgba(30,50,110,0.6)'); pg.addColorStop(0.92, 'rgba(120,160,230,0.35)'); pg.addColorStop(1, 'rgba(120,160,230,0)');
    g.fillStyle = pg; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 70; i++) { var a = glimR(i * 2.1) * Math.PI * 2, r = Math.sqrt(glimR(i * 3.7)) * 100; g.fillStyle = 'rgba(255,255,240,' + (0.4 + glimR(i) * 0.6) + ')'; g.beginPath(); g.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 0.6 + glimR(i * 5.3) * 1.4, 0, Math.PI * 2); g.fill(); }
    g.strokeStyle = 'rgba(220,235,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.arc(128, 128, 112, 3.6, 5.2); g.stroke();   // a gleam on the water
  }));
  var duckDownAlpha = null;
  function duckDownTex() {                                            // fine down: a hair in every pixel, its brightness how long it is (made once, shared)
    if (duckDownAlpha) return duckDownAlpha;
    var cv = glimCanvas(1024, 512, function (g, w, h) {
      var img = g.createImageData(w, h), d = img.data;
      for (var i = 0; i < w * h; i++) { var v = Math.round(Math.pow(glimR(i * 0.731) * glimR(i * 1.913 + 3), 0.55) * 255); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
      g.putImageData(img, 0, 0);
    });
    duckDownAlpha = new THREE.CanvasTexture(cv); duckDownAlpha.minFilter = THREE.LinearFilter; duckDownAlpha.generateMipmaps = false;
    return duckDownAlpha;
  }
  var duckRingTex = new THREE.CanvasTexture(glimCanvas(128, 128, function (g, w, h) {   // a ring of light spreading on the floor
    var rg = g.createRadialGradient(64, 64, 40, 64, 64, 63); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(0.55, 'rgba(255,255,255,0.9)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = rg; g.fillRect(0, 0, w, h);
  }));
  // a Dewdrop Egg: like a drop of pond water at night, pale blue and glassy with a glow inside and tiny stars
  var duckEggTex = new THREE.CanvasTexture(glimCanvas(128, 64, function (g, w, h) {
    var gg = g.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, '#f4fbff'); gg.addColorStop(0.5, '#c4dcff'); gg.addColorStop(1, '#e6f0ff');
    g.fillStyle = gg; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1;
    for (var r = 0; r < 4; r++) { g.beginPath(); g.ellipse(64, 40, 14 + r * 10, 4 + r * 3, 0, 0, Math.PI * 2); g.stroke(); }   // faint ripples round it
    for (var i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(glimR(i * 3.3 + 9) * w, glimR(i * 4.4 + 9) * h, 0.6 + glimR(i) * 1.4, 0, Math.PI * 2); g.fill(); }
  }));
  var duckEggMat = new THREE.MeshStandardMaterial({ map: duckEggTex, emissive: 0x8ab8ff, emissiveIntensity: 0.4, roughness: 0.08, metalness: 0.15 });
  var duckEggIcon = glimCanvas(96, 96, function (g, w, h) {
    var glow = g.createRadialGradient(48, 52, 4, 48, 52, 46); glow.addColorStop(0, 'rgba(170,205,255,0.75)'); glow.addColorStop(1, 'rgba(170,205,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    var eg = g.createRadialGradient(40, 36, 3, 48, 54, 34); eg.addColorStop(0, '#ffffff'); eg.addColorStop(0.45, '#d4e6ff'); eg.addColorStop(0.85, '#9cbcf0'); eg.addColorStop(1, '#7a9ee0');
    g.fillStyle = eg; g.beginPath(); g.ellipse(48, 54, 24, 31, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 2; g.beginPath(); g.ellipse(48, 62, 16, 5, 0, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.ellipse(48, 62, 9, 2.6, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.ellipse(39, 40, 5, 9, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; [[24, 24], [72, 22], [76, 74]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  ITEMS.dewdropEgg = { name: 'Dewdrop Egg', price: 110, icon: '🥚', img: duckEggIcon, fill: 86, info: 'A glassy, softly glowing egg like a drop of pond water at night, laid by a happy Puddlewisp. Feed and pet yours every day for one each morning. Sells for a good price at the shipping bin.' };
  var duckShopIcon = glimCanvas(128, 128, function (g, w, h) {      // a little portrait of one, for the shop
    var glow = g.createRadialGradient(64, 70, 4, 64, 70, 64); glow.addColorStop(0, 'rgba(170,200,255,0.75)'); glow.addColorStop(1, 'rgba(170,200,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(200,225,255,0.7)'; g.lineWidth = 2; [0, 1, 2].forEach(function (r) { g.beginPath(); g.ellipse(64, 112, 30 + r * 14, 6 + r * 3, 0, 0, Math.PI * 2); g.stroke(); });
    var bg = g.createLinearGradient(0, 50, 0, 110); bg.addColorStop(0, '#2a4486'); bg.addColorStop(1, '#9cb8e8');
    g.fillStyle = bg; g.beginPath(); g.ellipse(70, 86, 38, 24, 0, 0, Math.PI * 2); g.fill();    // the body
    g.beginPath(); g.moveTo(104, 80); g.quadraticCurveTo(118, 64, 116, 58); g.quadraticCurveTo(108, 70, 96, 74); g.fill();   // the tail
    g.fillStyle = '#1c2c62'; g.beginPath(); g.ellipse(76, 80, 22, 12, -0.2, 0, Math.PI * 2); g.fill();   // the wing
    g.fillStyle = '#2a4486'; g.beginPath(); g.arc(44, 52, 22, 0, Math.PI * 2); g.fill();          // the head
    g.fillStyle = '#f4d68c'; g.beginPath(); g.ellipse(22, 58, 13, 6, 0.1, 0, Math.PI * 2); g.fill();   // the bill
    g.fillStyle = '#fff'; g.beginPath(); g.arc(42, 48, 8.5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#10142a'; g.beginPath(); g.arc(41, 49, 7, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(38.5, 46, 2.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,150,190,0.5)'; g.beginPath(); g.ellipse(50, 62, 6, 4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#d8ecff'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(48, 31); g.quadraticCurveTo(54, 14, 66, 16); g.stroke();   // the plume
    g.fillStyle = '#fff6c8'; g.beginPath(); for (var k = 0; k < 10; k++) { var a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 2.5 : 6; g[k ? 'lineTo' : 'moveTo'](68 + Math.cos(a) * r, 16 + Math.sin(a) * r); } g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.9)'; [[84, 90], [62, 96], [96, 84], [70, 74]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], 1.4, 0, Math.PI * 2); g.fill(); });
  }).toDataURL();
  // building one
  function duckBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body); abRoom.add(root);
    var featherMap = duckFeatherTex(pal, false), glowMap = duckFeatherTex(pal, true);
    featherMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var feathers = new THREE.MeshStandardMaterial({ map: featherMap, roughness: 0.6, emissive: 0xffffff, emissiveMap: glowMap, emissiveIntensity: 0.6 });
    var down = moonFurMat({ map: featherMap, alphaMap: duckDownTex(), roughness: 1, emissive: 0xffffff, emissiveMap: glowMap, emissiveIntensity: 0.45 });   // a velvety layer of down over its feathers
    var seg = new THREE.SphereGeometry(1, 40, 28);
    function part(geo, mat, x, y, z, sx, sy, sz, parent, rx, ry, rz, downy) {
      var m = abPart(geo, mat, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); m.scale.set(sx, sy, sz);
      if (downy) { var d = abPart(moonShellGeo(geo === seg ? moonSegLo : geo, 10, downy), down, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); d.scale.set(sx, sy, sz); d.castShadow = false; }
      return m;
    }
    // a plump, round body, a full breast and a little tail that tips up at the back
    part(seg, feathers, 0, 0.21, -0.02, 0.145, 0.125, 0.2, body, 0, 0, 0, 0.1);
    part(seg, feathers, 0, 0.215, 0.09, 0.13, 0.13, 0.13, body, 0, 0, 0, 0.12);
    var tail = new THREE.Group(); tail.position.set(0, 0.25, -0.19); body.add(tail);
    part(seg, feathers, 0, 0.01, -0.03, 0.085, 0.05, 0.09, tail, -0.45, 0, 0, 0.1);
    var tipMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.back).lerp(new THREE.Color(pal.mid), 0.5), roughness: 0.5, emissive: pal.glow, emissiveIntensity: 0.15 });
    var curl = new THREE.CatmullRomCurve3([V3(0, 0.03, -0.06), V3(0, 0.07, -0.08), V3(0, 0.095, -0.05), V3(0, 0.08, -0.025), V3(0, 0.062, -0.04)]);
    abPart(new THREE.TubeGeometry(curl, 20, 0.0035, 6), new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.ripple), roughness: 0.5, emissive: pal.glow, emissiveIntensity: 0.5 }), 0, 0, 0, 0, 0, 0, tail);
    var cst = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonStarTex, color: pal.glow, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); cst.scale.set(0.025, 0.025, 1); cst.position.copy(curl.getPoint(1)); tail.add(cst);
    for (var tf = 0; tf < 5; tf++) { var ta = (tf - 2) * 0.28; part(seg, tipMat, Math.sin(ta) * 0.035, 0.04, -0.09, 0.016, 0.006, 0.055, tail, -0.75, ta, 0); }   // tail feathers fanned out
    // the neck and a big round head, with fluffy cheeks
    part(new THREE.CylinderGeometry(0.05, 0.075, 0.12, 20), feathers, 0, 0.3, 0.12, 1, 1, 1, body, 0.35, 0, 0, 0.1);
    var head = new THREE.Group(); head.position.set(0, 0.415, 0.15); head.scale.setScalar(1.2); body.add(head);
    part(seg, feathers, 0, 0, 0, 0.092, 0.088, 0.09, head, 0, 0, 0, 0.14);
    [-1, 1].forEach(function (s) { part(seg, feathers, s * 0.045, -0.03, 0.03, 0.05, 0.045, 0.05, head, 0, 0, 0, 0.2); });   // round, downy cheeks
    // patches of really fluffy down, the Glimmerwings' way: a soft core, shells of hair and loose wisps drooping a little
    function fluff(x, y, z, sx, sy, sz, parent, col, depth, nHairs) {
      var c = new THREE.Color(col), g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
      abPart(moonSegLo, new THREE.MeshStandardMaterial({ color: c.clone().multiplyScalar(0.85), roughness: 1, emissive: c, emissiveIntensity: 0.1 }), 0, 0, 0, 0, 0, 0, g).scale.set(sx * 0.97, sy * 0.97, sz * 0.97);
      var sh = abPart(moonShellGeo(moonSegLo, 18, depth), moonFurMat({ map: glimHairTex, color: c, roughness: 1, emissive: c, emissiveIntensity: 0.18 }), 0, 0, 0, 0, 0, 0, g); sh.scale.set(sx, sy, sz); sh.castShadow = false;
      var im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0005, 0.00012, 1, 3).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, emissive: c, emissiveIntensity: 0.25 }), nHairs), mx = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), dir = new THREE.Vector3(), pos = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
      var rAvg = (sx + sy + sz) / 3, seed = (x * 131 + y * 71 + z * 37) * 10;
      for (var hh = 0; hh < nHairs; hh++) {
        var u = glimR(hh * 1.7 + seed) * 2 - 1, th = glimR(hh * 2.3 + seed) * Math.PI * 2, rr = Math.sqrt(1 - u * u), nx = rr * Math.cos(th), ny = u, nz = rr * Math.sin(th);
        pos.set(nx * sx * 0.98, ny * sy * 0.98, nz * sz * 0.98);
        dir.set(nx / sx + (glimR(hh * 5.1 + seed) - 0.5) * 8, ny / sy + (glimR(hh * 6.3 + seed) - 0.5) * 8 - 1.5, nz / sz + (glimR(hh * 7.7 + seed) - 0.5) * 8).normalize();
        q.setFromUnitVectors(up, dir); sc.set(1, rAvg * depth * (0.55 + glimR(hh * 3.1 + seed) * 0.35), 1);
        mx.compose(pos, q, sc); im.setMatrixAt(hh, mx);
      }
      im.castShadow = false; g.add(im);
      return g;
    }
    fluff(0, 0.2, 0.13, 0.1, 0.09, 0.065, body, pal.breast, 0.45, 700);    // a soft, fluffy chest
    fluff(0, 0.04, -0.06, 0.045, 0.04, 0.035, head, '#' + new THREE.Color(pal.back).lerp(new THREE.Color(pal.mid), 0.45).getHexString(), 0.6, 220);    // a downy tuft at the nape
    [-1, 1].forEach(function (s) { fluff(s * 0.07, -0.045, 0.035, 0.022, 0.018, 0.02, head, pal.breast, 0.7, 90); });   // wisps on its cheeks
    var cres = new THREE.Shape(); cres.absarc(0, 0, 0.016, 0.5, Math.PI * 2 - 0.5, false); cres.absarc(0.008, 0, 0.012, Math.PI * 2 - 0.85, 0.85, true);   // a glowing crescent moon on its brow
    var cm = abPart(new THREE.ShapeGeometry(cres, 16), new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.ripple), emissive: pal.glow, emissiveIntensity: 1.0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 }), 0, 0.064, 0.084, -0.7, 0, Math.PI / 2, head);
    cm.castShadow = false;
    // the bill: soft and pearly, flat and rounded, with a little glowing tip, nostrils and a gentle smile
    var billMat = new THREE.MeshStandardMaterial({ color: pal.bill, roughness: 0.35, emissive: pal.bill, emissiveIntensity: 0.12 });
    var bill = new THREE.Group(); bill.position.set(0, -0.022, 0.08); head.add(bill);
    part(seg, billMat, 0, 0.004, 0.035, 0.044, 0.016, 0.058, bill, -0.08, 0, 0);
    part(seg, billMat, 0, -0.009, 0.028, 0.038, 0.011, 0.05, bill, -0.02, 0, 0);
    part(seg, new THREE.MeshStandardMaterial({ color: 0xfff8ec, emissive: pal.glow, emissiveIntensity: 0.7, roughness: 0.2 }), 0, 0.006, 0.088, 0.016, 0.008, 0.008, bill);   // the pearly tip
    part(seg, billMat, 0, 0.016, 0.03, 0.013, 0.006, 0.05, bill, -0.12, 0, 0);   // the soft ridge along the top
    var lamMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.bill).multiplyScalar(0.8), roughness: 0.5 });
    [-1, 1].forEach(function (s) {
      for (var li = 0; li < 9; li++) { var dz = -0.03 + li * 0.008, lx = s * 0.0435 * Math.sqrt(Math.max(0, 1 - dz * dz / 0.0034)); abPart(new THREE.BoxGeometry(0.0012, 0.004, 0.0012), lamMat, lx, -0.005, 0.035 + dz, 0, 0, 0, bill); }   // the fine comb along its edge
      part(seg, new THREE.MeshStandardMaterial({ color: 0xf0a0b0, roughness: 0.5 }), s * 0.034, -0.004, -0.004, 0.006, 0.004, 0.006, bill);   // a pink gape at the corner
    });
    var nostril = new THREE.MeshStandardMaterial({ color: 0x8a6a4a, roughness: 0.5 });
    [-1, 1].forEach(function (s) { part(seg, nostril, s * 0.012, 0.018, 0.046, 0.004, 0.0025, 0.008, bill); });
    abPart(new THREE.TorusGeometry(0.04, 0.0016, 5, 24, Math.PI * 0.7), new THREE.MeshStandardMaterial({ color: 0x9a7050, roughness: 0.6 }), 0, -0.002, 0.03, Math.PI / 2 - 0.1, 0, Math.PI * 0.15, bill);   // the line of its smile
    // eyes: big, glossy and sparkly, each in a ring of moonlit feathers, with lids that blink
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0610, roughness: 0.05, metalness: 0.2 });
    var irisMat = new THREE.MeshStandardMaterial({ map: moonEyeTex(pal), roughness: 0.15, emissive: 0xffffff, emissiveIntensity: 0 });
    irisMat.emissiveMap = irisMat.map; irisMat.emissiveIntensity = 0.35;
    var corneaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.02, metalness: 0.1, depthWrite: false });
    var irisGeo = new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, 1.05); irisGeo.rotateX(Math.PI / 2);
    (function () { var ps = irisGeo.attributes.position, uv = irisGeo.attributes.uv, k = 0.46 / Math.sin(1.05); for (var i = 0; i < ps.count; i++) uv.setXY(i, 0.5 + ps.getX(i) * k, 0.5 + ps.getY(i) * k); uv.needsUpdate = true; })();
    var ringMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.ripple), roughness: 0.6, emissive: pal.glow, emissiveIntensity: 0.3 });
    var lidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.mid), roughness: 0.8, side: THREE.DoubleSide });
    var lashMat = new THREE.MeshStandardMaterial({ color: 0x141020, roughness: 0.6 }), lids = [];
    var lidGeo = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42);
    [-1, 1].forEach(function (s) {
      var ey = new THREE.Group(); ey.position.set(s * 0.054, 0.02, 0.06); ey.rotation.set(0.05, s * 0.6, 0); ey.scale.setScalar(1.5); head.add(ey);
      var RX = 0.024, RY = 0.025, RZ = 0.016;
      part(seg, eyeMat, 0, 0, 0, RX, RY, RZ, ey);
      var ir = abPart(irisGeo, irisMat, 0, 0, 0, 0, 0, 0, ey); ir.scale.set(RX * 1.01, RY * 1.01, RZ * 1.01);
      var co = abPart(irisGeo, corneaMat, 0, 0, 0, 0, 0, 0, ey); co.scale.set(RX * 1.06, RY * 1.06, RZ * 1.18); co.castShadow = false;
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.008, 0.009, RZ * 1.02, 0.006, 0.007, 0.002, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.001, 0.012, RZ, 0.0023, 0.0023, 0.001, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), 0.008, -0.008, RZ * 0.98, 0.0032, 0.0028, 0.001, ey);
      abPart(new THREE.TorusGeometry(1, 0.05, 6, 32), ringMat, 0, 0, RZ * 0.2, 0, 0, 0, ey).scale.set(RX * 1.12, RY * 1.12, RZ);   // the moonlit eye-ring
      var lg = new THREE.Group(); ey.add(lg); lids.push(lg); lg.visible = false;
      abPart(lidGeo, lidMat, 0, 0, 0, 0, 0, 0, lg).scale.set(RX * 1.15, RY * 1.15, RZ * 1.3);
      [0.25, 0.5, 0.8].forEach(function (a, n) {                       // three little lashes at the outer corner
        var len = 0.009 - n * 0.0015, lash = abPart(new THREE.ConeGeometry(0.0011, len, 5).translate(0, len / 2, 0), lashMat, s * Math.cos(a) * RX * 1.12, Math.sin(a) * RY * 1.12, RZ * 0.3, 0.4, 0, -Math.atan2(s * Math.cos(a) * 1.3, Math.sin(a) + 0.6), ey);
        lash.castShadow = false;
      });
      var bl = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.03), new THREE.MeshBasicMaterial({ map: moonBlushTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      bl.position.set(s * 0.078, -0.036, 0.056); bl.rotation.set(0, s * 0.9, 0); head.add(bl);   // rosy cheeks
    });
    // a curl of plume feathers on top of its head, each tipped with a little glowing star
    var plumeMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.ripple), roughness: 0.5, emissive: pal.glow, emissiveIntensity: 0.5 });
    var plumes = [];
    [[0, 1], [-0.012, 0.8], [0.012, 0.8]].forEach(function (p, k) {
      var pg = new THREE.Group(); pg.position.set(p[0], 0.08, 0.01); pg.rotation.z = p[0] * 12; head.add(pg); plumes.push(pg);
      var L = p[1], curve = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0, 0.03 * L, -0.005), V3(0, 0.06 * L, 0.01), V3(0, 0.075 * L, 0.035 * L), V3(0, 0.065 * L, 0.05 * L)]);
      abPart(new THREE.TubeGeometry(curve, 16, 0.0028, 5), plumeMat, 0, 0, 0, 0, 0, 0, pg);
      for (var b = 0; b < 8; b++) { var pt = curve.getPoint(0.2 + b * 0.1); [-1, 1].forEach(function (side) { abPart(new THREE.ConeGeometry(0.0015, 0.012, 3), plumeMat, pt.x + side * 0.005, pt.y, pt.z, 0, 0, side * 1.2, pg); }); }   // soft barbs
      var tip = curve.getPoint(1), st = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonStarTex, color: pal.glow, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
      st.scale.set(0.028, 0.028, 1); st.position.copy(tip); pg.add(st);
    });
    // folded wings: soft coverts, long primaries reaching back and a shimmering speculum patch that changes colour
    var covTex = duckQuillTex(pal, false, false), covGlow = duckQuillTex(pal, false, true), primTex = duckQuillTex(pal, true, false), primGlow = duckQuillTex(pal, true, true);
    var covMat = new THREE.MeshStandardMaterial({ map: covTex, emissive: 0xffffff, emissiveMap: covGlow, emissiveIntensity: 0.5, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.55 });
    var primMat2 = new THREE.MeshStandardMaterial({ map: primTex, emissive: 0xffffff, emissiveMap: primGlow, emissiveIntensity: 0.5, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5 });
    var specMat = new THREE.MeshStandardMaterial({ map: covTex, color: 0x8899cc, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.2, metalness: 0.4, emissive: pal.spec[0], emissiveIntensity: 0.7 });
    function quillGeo(b, len, s) { return new THREE.PlaneGeometry(b, len).translate(0, -len / 2, 0).rotateX(Math.PI / 2).rotateZ(s * Math.PI / 2); }   // lying on its side, pointing back
    var edgeMat = new THREE.MeshStandardMaterial({ color: 0xf2f6ff, roughness: 0.5, emissive: pal.glow, emissiveIntensity: 0.4 });
    var wings = [];
    [-1, 1].forEach(function (s) {
      var wg = new THREE.Group(); wg.position.set(s * 0.12, 0.27, 0.06); body.add(wg); wings.push({ g: wg, s: s });
      part(seg, feathers, s * 0.012, -0.03, -0.09, 0.035, 0.07, 0.15, wg, 0.12, 0, 0, 0.08);
      var cg = quillGeo(0.026, 0.04, s), sgq = quillGeo(0.022, 0.034, s), pgq = quillGeo(0.03, 0.12, s), tgq = quillGeo(0.03, 0.085, s);
      function onWing(y, z) { var u = 1 - Math.pow((y + 0.03) / 0.07, 2) - Math.pow((z + 0.09) / 0.15, 2); return s * (0.012 + 0.035 * Math.sqrt(Math.max(0, u)) + 0.002); }
      for (var cr = 0; cr < 3; cr++) for (var ci = 0; ci < 5 - cr; ci++) {   // rows of soft covert feathers, overlapping like roof tiles
        var cy = 0.018 - cr * 0.02, cz = 0.035 - ci * 0.033 - cr * 0.014;
        abPart(cg, covMat, onWing(cy, cz) + s * cr * 0.002, cy, cz, -0.12, -s * (0.1 + cr * 0.05), 0, wg).castShadow = false;
      }
      for (var si = 0; si < 4; si++) { var sz2 = -0.04 - si * 0.028; abPart(sgq, specMat, onWing(-0.045, sz2) + s * 0.006, -0.045, sz2, -0.1, -s * 0.18, 0, wg).castShadow = false; }   // the speculum
      [-0.028, -0.066].forEach(function (by) { part(seg, edgeMat, onWing(by, -0.085) + s * 0.006, by, -0.085, 0.004, 0.0035, 0.06, wg, -0.08, -s * 0.15, 0); });   // with a white bar above and below
      for (var pf = 0; pf < 6; pf++) abPart(pgq, primMat2, s * (0.028 - pf * 0.003), -0.012 - pf * 0.007, -0.11 - pf * 0.006, 0.12 + pf * 0.035, -s * (0.04 + pf * 0.035), 0, wg).castShadow = false;   // long primaries, fanned
      [0, 1].forEach(function (k) { abPart(tgq, covMat, s * (0.012 - k * 0.008), 0.035 - k * 0.004, -0.06 - k * 0.02, 0.18, s * 0.12, -s * (0.55 + k * 0.2), wg).castShadow = false; });   // and tertials curving over its back
    });
    // short legs on glowing webbed feet
    var feetMat = new THREE.MeshStandardMaterial({ color: pal.feet, roughness: 0.4, emissive: pal.glow, emissiveIntensity: 0.55, side: THREE.DoubleSide });
    var web = new THREE.Shape(); web.moveTo(0, 0); web.lineTo(-0.028, 0.05); web.quadraticCurveTo(-0.018, 0.045, -0.012, 0.055); web.quadraticCurveTo(-0.004, 0.048, 0, 0.062); web.quadraticCurveTo(0.004, 0.048, 0.012, 0.055); web.quadraticCurveTo(0.018, 0.045, 0.028, 0.05); web.closePath();
    var webGeo = new THREE.ExtrudeGeometry(web, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2 });
    var legs = [], clawMat = new THREE.MeshStandardMaterial({ color: 0xf6f0ff, roughness: 0.3, emissive: pal.glow, emissiveIntensity: 0.3 });
    [-1, 1].forEach(function (s, k) {
      var lg = new THREE.Group(); lg.position.set(s * 0.06, 0.12, 0.02); body.add(lg);
      abPart(new THREE.CylinderGeometry(0.009, 0.011, 0.1, 10), feetMat, 0, -0.05, 0, 0, 0, 0, lg);
      abPart(webGeo, feetMat, 0, -0.105, -0.012, Math.PI / 2, 0, 0, lg);
      [-1, 0, 1].forEach(function (t) {                               // the toes, along the web, each with a little claw
        abPart(new THREE.CylinderGeometry(0.003, 0.004, 0.058, 6), feetMat, t * 0.014, -0.1, 0.014, Math.PI / 2, t * 0.42, 0, lg);
        abPart(new THREE.ConeGeometry(0.0028, 0.009, 6), clawMat, t * 0.014 + Math.sin(t * 0.42) * 0.031, -0.1, 0.014 + Math.cos(t * 0.42) * 0.031, Math.PI / 2, t * 0.42, 0, lg);
      });
      for (var sc2 = 0; sc2 < 4; sc2++) abPart(new THREE.TorusGeometry(0.0102, 0.0014, 5, 14), feetMat, 0, -0.025 - sc2 * 0.018, 0, Math.PI / 2, 0, 0, lg);   // scaly rings down the leg
      legs.push({ g: lg, ph: k * Math.PI });
    });
    // ripples of light spreading out on the floor round it, droplet sparkles drifting up, and a soft glow
    var puddle = new THREE.Mesh(new THREE.CircleGeometry(0.2, 40), new THREE.MeshStandardMaterial({ map: duckPuddleTex, transparent: true, depthWrite: false, roughness: 0.05, metalness: 0.3, emissive: 0xffffff, emissiveMap: duckPuddleTex, emissiveIntensity: 0.25 }));
    puddle.rotation.x = -Math.PI / 2; puddle.position.y = 0.008; puddle.scale.set(1, 0.8, 1); root.add(puddle);
    var ripples = [];
    for (var rp = 0; rp < 3; rp++) {
      var rm = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: duckRingTex, color: pal.glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      rm.rotation.x = -Math.PI / 2; rm.position.y = 0.012; root.add(rm); ripples.push({ m: rm, t: rp / 3 });
    }
    var sparks = [];
    for (var sp = 0; sp < 6; sp++) { var sk = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: new THREE.Color(pal.ripple), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); sk.scale.set(0.035, 0.035, 1); root.add(sk); sparks.push({ s: sk, t: glimR(sp) * 2, x: 0, z: 0 }); }
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.0, 1.0, 1); glow.position.set(0, 0.28, 0); root.add(glow);
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.36, 0.135, 1); tag.position.set(0, 0.78, 0); tag.renderOrder = 6; root.add(tag);
    return { root: root, body: body, head: head, tail: tail, wings: wings, legs: legs, plumes: plumes, lids: lids, feathers: feathers, specMat: specMat, spec: [new THREE.Color(pal.spec[0]), new THREE.Color(pal.spec[1])], ripples: ripples, sparks: sparks, glow: glow, tagCv: tagCv, tagTex: tagTex };
  }
  // its Dewdrop Egg, nestled in the straw, and a bundle of hay in the manger when it's been fed
  function duckBuildExtras(g) {
    var sz = GLIM_STALLS[g.stall];
    var egg = new THREE.Group(); egg.position.set(-3.3, 0.1, sz - 0.6); abRoom.add(egg);
    var nest = abPart(new THREE.TorusGeometry(0.085, 0.035, 8, 20), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), 0, 0.015, 0, Math.PI / 2, 0, 0, egg); nest.scale.set(1, 1, 0.6);
    var e = abPart(new THREE.SphereGeometry(0.058, 24, 16), duckEggMat, 0, 0.07, 0, 0.15, 0, 0.1, egg); e.scale.set(1, 1.28, 1);
    var eg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xa8c8ff, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    eg.scale.set(0.45, 0.45, 1); eg.position.y = 0.07; egg.add(eg);
    g.eggMesh = egg; g.eggGlow = eg;
    var hay = abPart(wbLumpGeo(300 + g.stall, 0.25), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.3, 0.94, sz + 1.0);
    hay.scale.set(0.16, 0.07, 0.16); g.hayMesh = hay;
    g.slate.map = glimSlateTex(g.name, 'Puddlewisp'); g.slate.needsUpdate = true;
  }
  // every frame, for a Puddlewisp: a waddle when it walks, a look about and a little preen now and then, a tail
  // wiggle, blinking, its feathers' ripples shimmering, the wing patch changing colour and rings of light spreading
  // round its feet; when petted it flaps its wings happily and wags its tail
  function duckAnimate(g, dt, t, moving) {
    var m = g.m;
    if (moving) g.hop += dt * 9;
    var wad = moving ? Math.sin(g.hop) : 0;
    m.body.rotation.z = m.body.rotation.z * 0.85 + wad * 0.13 * 0.15;     // the waddle
    m.body.position.y = moving ? Math.abs(Math.sin(g.hop)) * 0.012 : Math.sin(t * 2 + g.stall) * 0.003;
    m.legs.forEach(function (l) { l.g.rotation.x = moving ? Math.sin(g.hop + l.ph) * 0.45 : l.g.rotation.x * 0.85; });
    var happy = g.pet > 0;
    if (happy) g.pet -= dt;
    var preen = Math.max(0, Math.sin(t * 0.27 + g.stall * 2.1) - 0.85) * 6;   // now and then it tucks its bill to preen
    m.head.rotation.set(happy ? -0.15 + Math.sin(t * 9) * 0.06 : 0.15 + preen * 0.5 + (moving ? Math.sin(g.hop * 2) * 0.06 : 0), happy ? Math.sin(t * 6) * 0.25 : Math.sin(t * 0.5 + g.stall) * 0.45 * (1 - preen * 0.5) + preen * 0.6, happy ? Math.sin(t * 5) * 0.12 : 0);
    m.tail.rotation.y = happy ? Math.sin(t * 16) * 0.45 : Math.sin(t * 0.8 + g.stall) * 0.08 + Math.max(0, Math.sin(t * 0.6 + g.stall) - 0.9) * Math.sin(t * 20) * 2;   // a wiggle of the tail
    m.wings.forEach(function (w) { w.g.rotation.z = happy ? w.s * (0.25 + Math.sin(t * 18) * 0.4) : w.g.rotation.z * 0.85; w.g.rotation.y = happy ? -w.s * 0.2 : 0; });   // flapping happily
    m.plumes.forEach(function (p, k) { p.rotation.x = Math.sin(t * 2.4 + k * 1.3) * 0.12 + (moving ? Math.sin(g.hop * 2) * 0.1 : 0); });
    var bt = (t * 0.26 + g.stall * 0.41) % 1, blink = happy ? 0.8 : (bt < 0.035 ? Math.sin(bt / 0.035 * Math.PI) : 0);
    m.lids.forEach(function (l) { l.visible = blink > 0.03; l.rotation.x = -0.62 + blink * 1.55; });
    m.feathers.emissiveIntensity = 0.5 + Math.sin(t * 1.8 + g.stall) * 0.2;      // the ripples in its feathers shimmer
    var sh = 0.5 + Math.sin(t * 1.3 + g.stall) * 0.5;
    m.specMat.emissive.copy(m.spec[0]).lerp(m.spec[1], sh);
    m.ripples.forEach(function (r) {                                // rings of light spreading round its feet
      r.t += dt * 0.35; if (r.t > 1) r.t -= 1;
      var sc = 0.15 + r.t * 0.6; r.m.scale.set(sc, sc, 1); r.m.material.opacity = Math.sin(r.t * Math.PI) * 0.35;
    });
    m.sparks.forEach(function (sp) {
      sp.t += dt * 0.5;
      if (sp.t > 1) { sp.t -= 1 + Math.random() * 1.5; sp.x = (Math.random() - 0.5) * 0.35; sp.z = (Math.random() - 0.5) * 0.4; }
      sp.s.material.opacity = sp.t > 0 ? Math.sin(sp.t * Math.PI) * 0.85 : 0;
      sp.s.position.set(sp.x, 0.2 + Math.max(0, sp.t) * 0.4, sp.z);
    });
    m.glow.material.opacity = 0.16 + sh * 0.06;
    if (g.egg) g.eggGlow.material.opacity = 0.35 + Math.sin(t * 2 + g.stall) * 0.12;
  }




  // ---------- Emberwings ----------
  // Proud, fiery birds a little like a phoenix (shaped something like a peacock, but not a peacock): their feathers
  // are the colours of a sunset and a hearth fire, they wear a crown of little flickering flames, and their long train
  // is made of flame-shaped feathers, each with a glowing ember at its heart. Now and then, and whenever they're
  // petted, they raise the train into a great blazing fan that flickers like a bonfire, with embers drifting up off it.
  // They don't lay eggs: feed one hay and pet it every day for four days in a row, and the next morning it leaves a
  // warm Cinder Quill in its straw. Miss a day and the count starts over
  var EMBER_COST = 450, EMBER_DAYS = 4;
  var EMBER_PALS = [                                                  // sunset orange, deep crimson and white-hot gold
    { name: 'Sunset', back: '#5a1410', mid: '#d0461a', breast: '#ffc46a', base: '#7a1408', vane: '#ff6a1a', tip: '#fff0a0', ring: '#ffb22a', glow: 0xff9a3a, beak: 0xf0c070, leg: 0x8a5a2a, iris: ['#d0701a', '#2a0c04'] },
    { name: 'Crimson', back: '#3a0814', mid: '#b01a2a', breast: '#ff9a62', base: '#4a0610', vane: '#e8282a', tip: '#ffd27a', ring: '#ff7a1a', glow: 0xff5a3a, beak: 0xf4d090, leg: 0x6a3a2a, iris: ['#c0302a', '#280406'] },
    { name: 'Goldflame', back: '#6a3a08', mid: '#e09a1a', breast: '#fff0b0', base: '#8a4a0a', vane: '#ffb21a', tip: '#ffffff', ring: '#ffe06a', glow: 0xffd06a, beak: 0xfff0d0, leg: 0x9a7a3a, iris: ['#e0a020', '#2a1804'] }
  ];
  function emberFlame(g, x, y, w, h) {                               // a flame-shaped path: round at the bottom, wavering up to a point
    g.beginPath(); g.moveTo(x, y + h * 0.5);
    g.bezierCurveTo(x - w * 0.62, y + h * 0.5, x - w * 0.6, y, x - w * 0.22, y - h * 0.18);
    g.bezierCurveTo(x - w * 0.05, y - h * 0.3, x - w * 0.2, y - h * 0.38, x + w * 0.04, y - h * 0.5);
    g.bezierCurveTo(x + w * 0.02, y - h * 0.34, x + w * 0.5, y - h * 0.22, x + w * 0.48, y + h * 0.08);
    g.bezierCurveTo(x + w * 0.6, y + h * 0.4, x + w * 0.3, y + h * 0.5, x, y + h * 0.5);
    g.closePath();
  }
  function emberBodyTex(pal, glowOnly) {                              // its body feathers: small, glossy scales in fire colours, flecked with sparks
    return new THREE.CanvasTexture(glimCanvas(512, 256, function (g, w, h) {
      if (glowOnly) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
      else {
        var gr = g.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, pal.back); gr.addColorStop(0.3, pal.mid); gr.addColorStop(0.55, pal.breast); gr.addColorStop(1, pal.breast);
        g.fillStyle = gr; g.fillRect(0, 0, w, h);
      }
      for (var row = 0; row < 36; row++) for (var col = 0; col < 52; col++) {   // tiny overlapping scale feathers, each edged with a warm glint
        var fx = col * 10 + (row % 2) * 5, fy = row * 7, sh = glimR(row * 53 + col);
        g.strokeStyle = glowOnly ? 'rgba(255,170,90,' + (0.04 + sh * 0.12) + ')' : (sh > 0.5 ? pal.vane : pal.tip); g.globalAlpha = glowOnly ? 1 : 0.2 + sh * 0.18; g.lineWidth = 1.2;
        g.beginPath(); g.arc(fx, fy, 5.5, 0.2, Math.PI - 0.2); g.stroke();
      }
      g.globalAlpha = 1;
      for (var s = 0; s < 80; s++) {                                  // sparks caught in its feathers
        var sx = glimR(s * 3.7 + 21) * w, sy = glimR(s * 5.1 + 21) * h * 0.75, sr = 0.6 + glimR(s * 6.3) * 1.3;
        g.fillStyle = s % 3 ? 'rgba(255,220,120,0.9)' : 'rgba(255,140,60,0.9)'; g.beginPath(); g.arc(sx, sy, sr, 0, Math.PI * 2); g.fill();
      }
    }));
  }
  // one of its train feathers, painted barb by barb: a long shaft with loose, wispy barbs low down, and up top a broad
  // vane whose outline wavers like a tongue of flame; its colours burn from crimson at the edge through orange and
  // gold to a white-hot ember glowing at its heart. (Drawn tip at the top. The glow map is the same feather, shining
  // only where it's hottest)
  function emberFeatherCanvas(pal, glowOnly) {
    var deep = '#' + new THREE.Color(pal.base).multiplyScalar(0.7).getHexString();
    var ramp = emberRamp([[0, pal.base], [0.16, pal.vane], [0.27, pal.ring], [0.33, deep], [0.39, pal.base], [0.47, pal.vane], [0.6, pal.ring], [0.66, deep], [0.71, pal.vane], [0.8, pal.ring], [0.9, pal.tip], [1, '#ffffff']]);   // (rings of colour round the ember, like the eye of a flame)
    var wisp = emberRamp([[0, pal.back], [0.45, pal.base], [0.8, pal.vane], [1, pal.ring]]);
    return glimCanvas(320, 1280, function (g, w, h) {
      if (glowOnly) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
      g.translate(0, h); g.scale(1, -1);                              // (the painter draws base at the top)
      function heat(t, k) { var u = (t - 0.6) / 0.4, d = Math.sqrt(Math.pow((u - 0.4) / 0.62, 2) + Math.pow(k * 0.95, 2)); return Math.max(0, 1 - d); }
      emberPaintFeather(g, w, h, { from: 0.6, seed: 17, sweep: 0.7, step: 0.5, lw: 1.6, split: 0.01, fluffA: 0.85, fluffW: 1.1,
        fluff: function (t) { return 30 + t * 120; },                // (loose, separate filaments low down, tipped with gold)
        edge: function (t) {                                         // (wavering like a flame)
          var u = (t - 0.6) / 0.4; if (u <= 0) return w * 0.05;
          return w * 0.47 * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, u))), 0.65) * (1 - u * 0.3) * (1 + Math.sin(u * 17) * 0.07);
        },
        col: function (t, k, j) {
          j = j || 0;
          if (t < 0.6) { var c = wisp(Math.min(1, t / 0.6 * 0.7 + k * 0.35 + j * 0.06)); return glowOnly ? '#0c0400' : c; }
          var hv = heat(t, k);
          if (!glowOnly) return ramp(hv + j * 0.025);
          var b = Math.pow(hv, 1.6); return 'rgb(' + Math.round(255 * Math.min(1, b * 1.4)) + ',' + Math.round(200 * b) + ',' + Math.round(140 * b * b) + ')';
        },
        shaft: glowOnly ? '#3a2010' : '#ffe2b0', shaftW: 3.2 });
      if (!glowOnly) { var c = new THREE.Color(pal.vane); emberBleed(g, w, h, [c.r * 255, c.g * 255, c.b * 255]); }
    });
  }
  var emberFeatherCache = {};
  function emberFeatherMat(pal) {                                     // (one material per colouring, shared by all its feathers)
    if (emberFeatherCache[pal.name]) return emberFeatherCache[pal.name];
    var map = new THREE.CanvasTexture(emberFeatherCanvas(pal, false)), glowMap = new THREE.CanvasTexture(emberFeatherCanvas(pal, true));
    map.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var mat = new THREE.MeshStandardMaterial({ map: map, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.45, metalness: 0.1, emissive: 0xffffff, emissiveMap: glowMap, emissiveIntensity: 0.7 });
    return (emberFeatherCache[pal.name] = mat);
  }
  // a Cinder Quill: one of its flame feathers, shed in the straw, still warm and glowing like a coal
  var emberQuillIcon = glimCanvas(96, 96, function (g, w, h) {
    var glow = g.createRadialGradient(48, 44, 4, 48, 48, 46); glow.addColorStop(0, 'rgba(255,170,80,0.75)'); glow.addColorStop(1, 'rgba(255,90,40,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    g.save(); g.translate(50, 50); g.rotate(0.55); g.translate(-64 * 0.2, -256 * 0.2 + 6); g.scale(0.2, 0.2);
    g.drawImage(emberFeatherCanvas(EMBER_PALS[0], false), 0, 0);
    g.restore();
    g.fillStyle = '#ffd890'; [[18, 22, 2.2], [78, 18, 1.6], [82, 70, 2]].forEach(function (p) { g.beginPath(); g.arc(p[0], p[1], p[2], 0, Math.PI * 2); g.fill(); });   // a few sparks
  }).toDataURL();
  ITEMS.cinderQuill = { name: 'Cinder Quill', price: 420, icon: '🪶', img: emberQuillIcon, fill: 90, info: 'A long, flame-coloured tail feather that stays warm and glows softly like a coal, left in the straw by a happy Emberwing. Feed and pet yours every day for four days in a row for one. Sells for a very good price at the shipping bin.' };
  var emberShopIcon = glimCanvas(128, 128, function (g, w, h) {      // a little portrait of one, its blazing fan spread, for the shop
    var glow = g.createRadialGradient(64, 60, 4, 64, 60, 64); glow.addColorStop(0, 'rgba(255,170,80,0.7)'); glow.addColorStop(1, 'rgba(255,80,40,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    var pal = EMBER_PALS[0];
    for (var k = 0; k < 13; k++) {                                    // the fan of flame feathers
      var a = -1.35 + k * 2.7 / 12;
      g.save(); g.translate(64, 92); g.rotate(a);
      g.strokeStyle = pal.vane; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -54); g.stroke();
      g.fillStyle = pal.base; emberFlame(g, 0, -64, 20, 30); g.fill();
      g.fillStyle = pal.vane; emberFlame(g, 0, -61, 14, 22); g.fill();
      g.fillStyle = pal.tip; emberFlame(g, 0, -57, 7, 12); g.fill();
      g.restore();
    }
    var bg = g.createLinearGradient(0, 70, 0, 115); bg.addColorStop(0, pal.mid); bg.addColorStop(1, pal.breast);
    g.fillStyle = bg; g.beginPath(); g.ellipse(64, 98, 18, 22, 0, 0, Math.PI * 2); g.fill();     // the body
    g.strokeStyle = pal.mid; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.moveTo(64, 86); g.quadraticCurveTo(58, 66, 66, 52); g.stroke();   // the neck
    g.fillStyle = pal.mid; g.beginPath(); g.arc(66, 48, 10, 0, Math.PI * 2); g.fill();          // the head
    g.fillStyle = '#f0c070'; g.beginPath(); g.moveTo(74, 46); g.lineTo(84, 49); g.lineTo(74, 52); g.fill();   // the beak
    g.fillStyle = '#fff'; g.beginPath(); g.arc(68, 46, 4.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a0c04'; g.beginPath(); g.arc(68.5, 46.5, 3.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(67.4, 45.2, 1.2, 0, Math.PI * 2); g.fill();
    [-0.45, 0, 0.45].forEach(function (a) {                          // its crown of little flames
      g.save(); g.translate(64, 39); g.rotate(a);
      g.fillStyle = pal.vane; emberFlame(g, 0, -8, 7, 14); g.fill(); g.fillStyle = pal.tip; emberFlame(g, 0, -6, 3.5, 7); g.fill();
      g.restore();
    });
  }).toDataURL();
  // building one
  // painting a real-looking feather, barb by barb: a shaft down the middle, and off it hundreds of fine barbs swept
  // toward the tip, each a little longer or shorter than the next so the edge is soft and ragged, with here and there
  // a little split in the vane where the barbs have parted; near the base, loose fluffy down instead. Drawn base at
  // the top, tip at the bottom. o: edge(u, s) the outline's half-width at height u (0 base to 1 tip) on side s, col(t, k) a barb's
  // colour (k: how far out along it), from (where the vane starts), fluff(t) the down's length, sweep, step, seed
  function emberPaintFeather(g, w, h, o) {
    var cx = w / 2, step = o.step || 0.7, skip = [0, 0], sd = o.seed || 0, sweep = o.sweep || 0.6;
    g.lineCap = 'round';
    for (var y = 1; y < h - 1; y += step) {
      var t = y / h;
      [-1, 1].forEach(function (s, si) {
        var r = glimR(y * 13.7 + si * 71 + sd), r2 = glimR(y * 7.3 + si * 11 + sd);
        if (t < o.from) {                                              // fluffy down near the base
          var fl = o.fluff(t) * (0.6 + r2 * 0.6), fa = 0.9 + r * 0.5;
          g.globalAlpha = o.fluffA || 0.45; g.strokeStyle = o.col(t, 0.4, (r - 0.5) * 2); g.lineWidth = o.fluffW || 0.7;
          g.beginPath(); g.moveTo(cx, y); g.bezierCurveTo(cx + s * fl * 0.4, y + fl * 0.1, cx + s * fl * 0.8, y + fl * (0.3 + r * 0.5), cx + s * fl * Math.cos(fa) * 1.1, y + fl * Math.sin(fa)); g.stroke();
          return;
        }
        if (skip[si] > 0) { skip[si]--; return; }
        if (r < (o.split || 0.01)) skip[si] = 2 + Math.floor(r2 * 4);  // a split in the vane
        var a = sweep + (r - 0.5) * 0.12, len = 0;                    // each barb reaches out to the feather's outline (o.edge: its half-width at a height)
        for (var it = 0; it < 4; it++) { var eu = Math.min(1, (y + len * Math.sin(a)) / h); len = o.edge(eu, s) / Math.cos(a); }
        len *= 0.9 + r2 * 0.16;                                        // (a little ragged)
        if (len < 0.8) return;
        var mx = cx + s * len * 0.5 * Math.cos(a * 0.7), my = y + len * 0.5 * Math.sin(a * 0.7), ex = cx + s * len * Math.cos(a), ey = y + len * Math.sin(a);
        g.globalAlpha = 1; g.lineWidth = o.lw || 1.1;
        var j = (glimR(y * 3.1 + si * 5 + sd) - 0.5) * 2;               // (each barb catching the light a little differently)
        g.strokeStyle = o.col(t, 0.25, j); g.beginPath(); g.moveTo(cx, y); g.lineTo(mx, my); g.stroke();
        g.strokeStyle = o.col(t, 0.8, j); g.lineWidth = (o.lw || 1.1) * 0.8; g.beginPath(); g.moveTo(mx, my); g.quadraticCurveTo(cx + s * len * 0.8 * Math.cos(a * 0.85), y + len * 0.8 * Math.sin(a * 0.85), ex, ey); g.stroke();
      });
    }
    g.globalAlpha = 1;
    if (o.shaft) {                                                     // the shaft, thick at the base and fine at the tip
      for (var k = 0; k < 3; k++) { g.strokeStyle = o.shaft; g.lineWidth = (o.shaftW || 2) * (1 - k * 0.3); g.beginPath(); g.moveTo(cx, k * h * 0.3); g.lineTo(cx, (k + 1) * h * 0.3 + (k === 2 ? h * 0.05 : 0)); g.stroke(); }
    }
  }
  function emberBleed(g, w, h, rgb) {                                // fill the see-through pixels round a feather with its own colour, so its edges don't
    var img = g.getImageData(0, 0, w, h), d = img.data;              // pick up a dark fringe when the texture is smoothed
    for (var i = 0; i < d.length; i += 4) if (d[i + 3] === 0) { d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; }
    g.putImageData(img, 0, 0);
  }
  function grey(v) { v = Math.max(0, Math.min(255, Math.round(v))); return 'rgb(' + v + ',' + v + ',' + v + ')'; }
  // small rounded body feathers, in greys so each one can be tinted its own colour: dark at the root, paling to the
  // rounded tip, fluffy at the base. Three patterns, mixed together over its body as on a real bird: plain; with a
  // darker streak down the shaft; and with a dark band near the tip and a pale, glossy fringe
  var emberContourTexes = [0, 1, 2].map(function (pat) {
    var tex = new THREE.CanvasTexture(glimCanvas(128, 192, function (g, w, h) {
      emberPaintFeather(g, w, h, { from: 0.16, fluff: function () { return 26; }, seed: 3 + pat * 40, sweep: 0.62, step: 0.5, lw: 1.2, split: 0.015,
        edge: function (u) { return w * (0.4 - pat * 0.015) * Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.52) / 0.47, 2))); },
        col: function (t, k, j) {
          var v = 130 + t * 105 + k * 22 + (j || 0) * 26;
          if (pat === 1 && k < 0.5 && t > 0.25) v -= 50 * Math.min(1, (t - 0.25) * 4);   // the shaft streak
          if (pat === 2) { if (t > 0.6 && t < 0.8) v -= 42 * Math.sin((t - 0.6) / 0.2 * Math.PI); if (t > 0.84) v += 22; }   // the band and the fringe
          return grey(v);
        }, shaft: pat === 1 ? 'rgb(120,120,120)' : 'rgb(175,175,175)', shaftW: 1.4 });
      emberBleed(g, w, h, [215, 215, 215]);
    }));
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  });
  // a long, narrow, pointed hackle feather for its neck, glossy and paling to the tip
  var emberHackleTex = new THREE.CanvasTexture(glimCanvas(64, 256, function (g, w, h) {
    emberPaintFeather(g, w, h, { from: 0.1, fluff: function () { return 14; }, seed: 9, sweep: 0.85, step: 0.6, lw: 1, split: 0.012,
      edge: function (u) { return w * 0.45 * Math.pow(Math.max(0, Math.sin(Math.PI * u)), 0.7) * (1 - u * 0.25); },
      col: function (t, k, j) { return grey(135 + t * 100 + k * 22 + (j || 0) * 26); }, shaft: 'rgb(190,190,190)', shaftW: 1.1 });
    emberBleed(g, w, h, [215, 215, 215]);
  }));
  emberHackleTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // a curved feather to lay these on: cupped across its width and lifting a little toward its tip
  function emberCurvedPlane(cup, lift) {
    var geo = new THREE.PlaneGeometry(1, 1, 4, 6).translate(0, -0.5, 0), p = geo.attributes.position;
    for (var i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i); p.setZ(i, -cup * x * x + lift * y * y); }
    geo.computeVertexNormals(); return geo;
  }
  function emberRamp(stops) {                                         // a colour ramp, as 64 CSS colours
    var out = [];
    for (var i = 0; i < 64; i++) {
      var h = i / 63, k = 0; while (k < stops.length - 2 && h > stops[k + 1][0]) k++;
      var a = stops[k], b = stops[k + 1], f = Math.max(0, Math.min(1, (h - a[0]) / (b[0] - a[0])));
      out.push('#' + new THREE.Color(a[1]).lerp(new THREE.Color(b[1]), f).getHexString());
    }
    return function (v) { return out[Math.max(0, Math.min(63, Math.round(v * 63)))]; };
  }
  // a little flick of flame, for the marking that sweeps back from each eye
  var emberFlickTex = new THREE.CanvasTexture(glimCanvas(128, 64, function (g, w, h) {
    g.translate(64, 32); g.rotate(Math.PI / 2);                       // (lying on its side, its tip pointing right)
    var gr = g.createLinearGradient(0, 55, 0, -55); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0.45)');
    g.fillStyle = gr; emberFlame(g, 0, 0, 40, 110); g.fill();
  }));
  // a long flight feather for its wings, painted barb by barb: a narrow leading edge and a broad trailing one, dark at
  // the base and burning to flame colours at the tip (its base at the top)
  var emberFlightCache = {};
  function emberFlightMat(pal) {
    if (emberFlightCache[pal.name]) return emberFlightCache[pal.name];
    var ramp = emberRamp([[0, pal.back], [0.45, pal.base], [0.75, pal.vane], [1, pal.ring]]);
    var tex = new THREE.CanvasTexture(glimCanvas(64, 384, function (g, w, h) {
      emberPaintFeather(g, w, h, { from: 0.06, fluff: function () { return 12; }, seed: 29, sweep: 0.9, step: 0.6, lw: 1, split: 0.01,
        edge: function (u, s) { return w * 0.46 * (s < 0 ? 0.5 : 1) * Math.pow(Math.max(0, 1 - Math.pow((u - 0.45) / 0.55, 2)), 0.35); },
        col: function (t, k, j) { return ramp(t * 0.9 + k * 0.1 + (j || 0) * 0.05); }, shaft: '#ffe6c0', shaftW: 1.6 });
      var c = new THREE.Color(pal.vane); emberBleed(g, w, h, [c.r * 255, c.g * 255, c.b * 255]);
    }));
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var mat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.12, emissive: pal.glow, emissiveIntensity: 0.06 });
    return (emberFlightCache[pal.name] = mat);
  }
  function emberBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body); abRoom.add(root);
    var bodyMap = emberBodyTex(pal, false), glowMap = emberBodyTex(pal, true);
    bodyMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var feathers = new THREE.MeshStandardMaterial({ map: bodyMap, roughness: 0.45, metalness: 0.1, emissive: 0xffffff, emissiveMap: glowMap, emissiveIntensity: 0.6 });
    var down = moonFurMat({ map: bodyMap, alphaMap: duckDownTex(), roughness: 1, emissive: 0xffffff, emissiveMap: glowMap, emissiveIntensity: 0.45 });
    var seg = new THREE.SphereGeometry(1, 40, 28);
    function part(geo, mat, x, y, z, sx, sy, sz, parent, rx, ry, rz, downy) {
      var m = abPart(geo, mat, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); m.scale.set(sx, sy, sz);
      if (downy) { var d = abPart(moonShellGeo(moonSegLo, 10, downy), down, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); d.scale.set(sx, sy, sz); d.castShadow = false; }
      return m;
    }
    // layered contour feathers: hundreds of small rounded feathers, each one tinted, laid over its body like shingles
    // so every feather can be seen; all of one group are drawn in a single batch
    var sheenCol = new THREE.Color(pal.ring).multiplyScalar(0.45);    // (a soft, warm sheen and a little gloss, like real feathers catching the light)
    var contourMats = emberContourTexes.map(function (tex) { return new THREE.MeshPhysicalMaterial({ map: tex, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.05, clearcoat: 0.3, clearcoatRoughness: 0.45, sheen: sheenCol, emissive: pal.glow, emissiveIntensity: 0.04 }); });
    var hackleMat = new THREE.MeshPhysicalMaterial({ map: emberHackleTex, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.35, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.3, sheen: sheenCol, emissive: pal.glow, emissiveIntensity: 0.05 });
    var cPlane = emberCurvedPlane(0.3, 0.15), hPlane = emberCurvedPlane(0.3, 0.05);   // (base at the top, hanging down to the tip)
    var cDown = V3(0, -1, 0), cM = new THREE.Matrix4(), cN = new THREE.Vector3(), cT = new THREE.Vector3(), cX = new THREE.Vector3(), cY = new THREE.Vector3(), cZ = new THREE.Vector3();
    var colMid = new THREE.Color(pal.mid), colBreast = new THREE.Color(pal.breast), colBack = new THREE.Color(pal.back), colVane = new THREE.Color(pal.vane), colTip = new THREE.Color(pal.tip);
    function shingles(parent, list, hackles) {                       // list: [x, y, z, normal, flow, width, length, colour]; hackles lie flatter
      var groups = hackles ? [list] : [[], [], []];
      if (!hackles) list.forEach(function (f, i) { groups[Math.floor(glimR(i * 5.3 + list.length * 0.7) * 2.999)].push(f); });   // (a mix of the three patterns)
      groups.forEach(function (grp, gi) {
        if (!grp.length) return;
        var im = new THREE.InstancedMesh(hackles ? hPlane : cPlane, hackles ? hackleMat : contourMats[gi], grp.length); im.castShadow = true;
        grp.forEach(function (f, i) {
          var r1 = glimR(i * 3.7 + gi * 91 + grp.length), r2 = glimR(i * 6.1 + gi * 37 + grp.length);
          cN.copy(f[3]).normalize();
          cT.copy(f[4]).addScaledVector(cN, -f[4].dot(cN)).normalize().addScaledVector(cN, (hackles ? 0.04 : 0.08) + r2 * 0.08).normalize();   // flowing along the surface, its tip lifting a little
          cT.applyAxisAngle(cN, (r1 - 0.5) * 0.3);                    // (each a little askew, as real feathers lie)
          cY.copy(cT).negate(); cZ.copy(cN).addScaledVector(cT, -cN.dot(cT)).normalize(); cX.crossVectors(cY, cZ);
          var sw = f[5] * (0.86 + r1 * 0.28), sl = f[6] * (0.88 + r2 * 0.26);   // (and no two quite the same size)
          cM.makeBasis(cX, cY, cZ).scale(V3(sw, sl, sw)).setPosition(f[0], f[1], f[2]);
          im.setMatrixAt(i, cM); im.setColorAt(i, f[7]);
        });
        parent.add(im);
      });
    }
    function onEgg(c, r, u, v, out) {                                 // a point on an egg shape, and which way is out from it there
      var d = V3(Math.sin(u) * Math.cos(v), Math.sin(v), Math.cos(u) * Math.cos(v));
      var n = V3(d.x / r[0], d.y / r[1], d.z / r[2]).normalize();
      return [c[0] + d.x * r[0] + n.x * out, c[1] + d.y * r[1] + n.y * out, c[2] + d.z * r[2] + n.z * out, n];
    }
    function tint(a, b, k, j) { return a.clone().lerp(b, Math.max(0, Math.min(1, k))).offsetHSL((glimR(j) - 0.5) * 0.03, 0, (glimR(j + 7) - 0.5) * 0.08); }
    var bodyF = [];
    // a proud, puffed-out breast and a sleek body underneath it all
    part(seg, feathers, 0, 0.32, -0.03, 0.1, 0.11, 0.185, body, -0.12, 0, 0, 0.05);
    part(seg, feathers, 0, 0.38, 0.08, 0.09, 0.11, 0.095, body, 0, 0, 0, 0.06);
    for (var br = 0; br < 13; br++) {                                 // the breast: rows of feathers, deep fire at the top paling to gold below
      var bv = 1.0 - br * 0.145, bn = 12 + (br > 1 && br < 10 ? 3 : 0);
      for (var bc = 0; bc < bn; bc++) {
        var bu = -1.4 + (bc + (br % 2) * 0.5) * 2.8 / bn, pt = onEgg([0, 0.38, 0.08], [0.09, 0.11, 0.095], bu, bv, 0.003 + (13 - br) * 0.0004);
        bodyF.push([pt[0], pt[1], pt[2], pt[3], cDown, 0.023 + glimR(br * 5 + bc) * 0.004, 0.035, tint(colMid, colBreast, br / 10 + (glimR(br * 9 + bc) - 0.5) * 0.25, br * 31 + bc)]);
      }
    }
    for (var bk = 0; bk < 11; bk++) {                                 // the back and flanks: longer feathers flowing back toward its tail
      var kv = 1.35 - bk * 0.24, kn = 20;                            // (on down round its belly)
      for (var kc = 0; kc < kn; kc++) {
        var ku = Math.PI + (-0.5 + (kc + (bk % 2) * 0.5) / kn) * Math.PI * 1.55, kp = onEgg([0, 0.32, -0.03], [0.1, 0.11, 0.185], ku, kv, 0.003 + (11 - bk) * 0.0004);
        if (Math.pow(kp[0] / 0.09, 2) + Math.pow((kp[1] - 0.38) / 0.11, 2) + Math.pow((kp[2] - 0.08) / 0.095, 2) < 1) continue;   // (the breast covers this)
        bodyF.push([kp[0], kp[1], kp[2], kp[3], V3(0, -0.45, -1), 0.027 + glimR(bk * 3 + kc) * 0.005, 0.047, tint(colBack, colMid, 0.25 + bk * 0.08 + (glimR(bk * 7 + kc) - 0.5) * 0.3, 900 + bk * 31 + kc)]);
      }
    }
    // a long, graceful neck, smooth and covered in a cape of fine, pointed hackle feathers
    var neck = new THREE.CatmullRomCurve3([V3(0, 0.4, 0.1), V3(0, 0.5, 0.115), V3(0, 0.6, 0.13), V3(0, 0.67, 0.155)]);
    for (var nk = 0; nk <= 14; nk++) { var np = neck.getPoint(nk / 14), nr = 0.056 - nk * 0.0014; part(seg, feathers, np.x, np.y, np.z, nr, nr * 1.05, nr, body, 0, 0, 0, nk % 3 ? 0 : 0.05); }
    var hackF = [];
    for (var hk = 0; hk < 14; hk++) {
      var ht = 0.97 - hk * 0.065, hp = neck.getPoint(ht), hr = 0.056 - ht * 14 * 0.0014 + 0.002;
      for (var ha = 0; ha < 15; ha++) {
        var aa = (ha + (hk % 2) * 0.5) / 15 * Math.PI * 2, hn = V3(Math.sin(aa), 0.1, Math.cos(aa));
        hackF.push([hp.x + Math.sin(aa) * hr, hp.y, hp.z + Math.cos(aa) * hr, hn, cDown, 0.02 + glimR(hk * 7 + ha) * 0.004, 0.05, tint(colMid, colVane, 0.15 + hk * 0.06 + (glimR(hk * 11 + ha) - 0.5) * 0.3, 2000 + hk * 17 + ha)]);
      }
    }
    shingles(body, hackF, true);
    // feathery "trousers" at the tops of its legs
    [-1, 1].forEach(function (s) {
      part(seg, feathers, s * 0.048, 0.25, -0.01, 0.034, 0.05, 0.04, body, 0, 0, s * 0.15, 0.12);
      for (var tr = 0; tr < 4; tr++) for (var tc = 0; tc < 9; tc++) {
        var tp = onEgg([s * 0.048, 0.25, -0.01], [0.034, 0.05, 0.04], s * (0.1 + tc * 0.36), 0.5 - tr * 0.35, 0.003);
        bodyF.push([tp[0], tp[1], tp[2], tp[3], cDown, 0.018, 0.026, tint(colMid, colBreast, 0.35 + tr * 0.2, 3000 + tr * 11 + tc + (s > 0 ? 50 : 0))]);
      }
    });
    shingles(body, bodyF);
    var head = new THREE.Group(); head.position.set(0, 0.7, 0.16); body.add(head);
    part(seg, feathers, 0, 0, 0, 0.045, 0.046, 0.052, head, 0, 0, 0, 0.1);
    part(seg, feathers, 0, -0.008, 0.024, 0.036, 0.034, 0.036, head, 0, 0, 0, 0.12);   // (a fuller face)
    var headF = [];                                                    // tiny feathers all over its head, leaving its face soft and downy
    for (var hr2 = 0; hr2 < 10; hr2++) for (var hc = 0; hc < 22; hc++) {
      var hv2 = 1.4 - hr2 * 0.22, hu = (hc + (hr2 % 2) * 0.5) / 22 * Math.PI * 2 - Math.PI;
      if (Math.abs(hu) < 0.6 && hv2 < 0.55) continue;                  // (leaving room for its beak)
      if (Math.abs(Math.abs(hu) - 0.85) < 0.42 && Math.abs(hv2 - 0.2) < 0.42) continue;   // (and its eyes)
      var hq = onEgg([0, 0, 0], [0.045, 0.046, 0.052], hu, hv2, 0.0015 + (7 - hr2) * 0.0002);
      headF.push([hq[0], hq[1], hq[2], hq[3], V3(0, -0.35, -1), 0.009, 0.012, tint(colMid, colBreast, 0.15 + hr2 * 0.05 + (glimR(hr2 * 13 + hc) - 0.5) * 0.2, 5000 + hr2 * 19 + hc)]);
    }
    shingles(head, headF);
    // a hooked golden beak: the upper part curving down over the lower, a soft cere at its base and little nostrils
    var beakMat = new THREE.MeshStandardMaterial({ color: pal.beak, roughness: 0.28, metalness: 0.35, emissive: pal.beak, emissiveIntensity: 0.15 });
    var beak = new THREE.Group(); beak.position.set(0, -0.006, 0.05); head.add(beak);
    function beakGeo(r, len, hook) {                                  // a smooth cone pointing forward, curving down at the tip
      var geo = new THREE.ConeGeometry(r, len, 20, 8).rotateX(Math.PI / 2).translate(0, 0, len / 2), p = geo.attributes.position;
      for (var i = 0; i < p.count; i++) { var z = p.getZ(i) / len; p.setY(i, p.getY(i) * 0.8 - hook * z * z * z); }
      geo.computeVertexNormals(); return geo;
    }
    abPart(beakGeo(0.0115, 0.04, 0.011), beakMat, 0, 0.002, -0.002, 0, 0, 0, beak);   // the upper beak, hooked
    abPart(beakGeo(0.0085, 0.028, 0.002), beakMat, 0, -0.005, 0.0, 0.12, 0, 0, beak).scale.set(1, 0.6, 1);   // the lower beak
    part(seg, new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.beak).multiplyScalar(0.8), roughness: 0.6 }), 0, 0.006, -0.002, 0.012, 0.007, 0.006, beak);   // the cere
    [-1, 1].forEach(function (s) { part(seg, new THREE.MeshStandardMaterial({ color: 0x3a1a0a, roughness: 0.6 }), s * 0.005, 0.0075, 0.006, 0.0018, 0.0012, 0.003, beak); });
    // big glossy eyes in rings of gold, with lashes and lids that blink; and a flick of flame sweeping back from each
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0604, roughness: 0.05, metalness: 0.2 });
    var irisMat = new THREE.MeshStandardMaterial({ map: moonEyeTex(pal), roughness: 0.15, emissive: 0xffffff, emissiveIntensity: 0.4 });
    irisMat.emissiveMap = irisMat.map;
    var corneaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.02, metalness: 0.1, depthWrite: false });
    var irisGeo = new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, 1.05); irisGeo.rotateX(Math.PI / 2);
    (function () { var ps = irisGeo.attributes.position, uv = irisGeo.attributes.uv, k = 0.46 / Math.sin(1.05); for (var i = 0; i < ps.count; i++) uv.setXY(i, 0.5 + ps.getX(i) * k, 0.5 + ps.getY(i) * k); uv.needsUpdate = true; })();
    var ringMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.ring), roughness: 0.35, metalness: 0.4, emissive: pal.glow, emissiveIntensity: 0.35 });
    var lidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.mid), roughness: 0.8, side: THREE.DoubleSide }), lids = [];
    var lashMat = new THREE.MeshStandardMaterial({ color: 0x1a0804, roughness: 0.6 });
    var lidGeo = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42);
    var flickMat = new THREE.MeshBasicMaterial({ map: emberFlickTex, color: new THREE.Color(pal.ring), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, side: THREE.DoubleSide });
    [-1, 1].forEach(function (s) {
      var ey = new THREE.Group(); ey.position.set(s * 0.033, 0.01, 0.026); ey.rotation.set(0.05, s * 0.7, 0); head.add(ey);
      var RX = 0.017, RY = 0.018, RZ = 0.011;
      part(seg, eyeMat, 0, 0, 0, RX, RY, RZ, ey);
      abPart(irisGeo, irisMat, 0, 0, 0, 0, 0, 0, ey).scale.set(RX * 1.01, RY * 1.01, RZ * 1.01);
      var co = abPart(irisGeo, corneaMat, 0, 0, 0, 0, 0, 0, ey); co.scale.set(RX * 1.06, RY * 1.06, RZ * 1.18); co.castShadow = false;
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.005, 0.006, RZ * 1.02, 0.0042, 0.005, 0.0015, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.0005, 0.0085, RZ, 0.0016, 0.0016, 0.0008, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), 0.005, -0.005, RZ * 0.98, 0.0022, 0.002, 0.001, ey);
      abPart(new THREE.TorusGeometry(1, 0.07, 6, 32), ringMat, 0, 0, RZ * 0.25, 0, 0, 0, ey).scale.set(RX * 1.14, RY * 1.14, RZ);   // the golden eye-ring
      var lg = new THREE.Group(); ey.add(lg); lids.push(lg); lg.visible = false;
      abPart(lidGeo, lidMat, 0, 0, 0, 0, 0, 0, lg).scale.set(RX * 1.15, RY * 1.15, RZ * 1.3);
      [0.3, 0.6, 0.9].forEach(function (a, n) {                       // three lashes at the outer corner
        var len = 0.007 - n * 0.001, lash = abPart(new THREE.ConeGeometry(0.0009, len, 5).translate(0, len / 2, 0), lashMat, s * Math.cos(a) * RX * 1.14, Math.sin(a) * RY * 1.14, RZ * 0.3, 0.4, 0, -Math.atan2(s * Math.cos(a) * 1.3, Math.sin(a) + 0.6), ey);
        lash.castShadow = false;
      });
      var fk = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.022), flickMat);   // the flick of flame behind the eye
      fk.position.set(s * 0.043, 0.012, -0.012); fk.rotation.set(0, s * 1.35, s * 0.25); head.add(fk);
      var bl = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.02), new THREE.MeshBasicMaterial({ map: moonBlushTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      bl.position.set(s * 0.04, -0.022, 0.03); bl.rotation.set(0, s * 0.8, 0); head.add(bl);   // rosy cheeks
    });
    // its crown: seven little flames on top of its head, the middle ones tallest, each one red at the edge, orange
    // within and white-hot at its heart, flickering and dancing, with a soft glow round them
    var flameMats = [new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.base).lerp(new THREE.Color(pal.vane), 0.5) }), new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.ring) }), new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.tip) })];
    var crown = new THREE.Group(); crown.position.set(0, 0.038, -0.012); crown.rotation.x = -0.35; head.add(crown);
    var flameGeo = new THREE.SphereGeometry(1, 16, 12); flameGeo.translate(0, 1, 0);   // (a teardrop: a sphere, drawn up to a point at the top)
    (function () { var p = flameGeo.attributes.position; for (var i = 0; i < p.count; i++) { var y = p.getY(i), k = y > 1 ? 1 - (y - 1) * 0.85 : 1; p.setXYZ(i, p.getX(i) * k, y > 1 ? 1 + (y - 1) * 1.5 : y, p.getZ(i) * k); } flameGeo.computeVertexNormals(); })();
    var flames = [];
    for (var cr = 0; cr < 7; cr++) {
      var ca = (cr - 3) * 0.24, fl = new THREE.Group(); fl.rotation.z = ca; fl.position.set(0, 0, -Math.abs(cr - 3) * 0.003); crown.add(fl);
      var size = 0.011 - Math.abs(cr - 3) * 0.0016;
      var layers = [[1, 1.3, 0.6, 0], [0.68, 0.95, 0.66, 0.0015], [0.36, 0.6, 0.7, 0.003]].map(function (L, n) {
        var fm = new THREE.Mesh(flameGeo, flameMats[n]); fm.position.set(0, 0.004 + n * 0.0008, L[3]); fl.add(fm); return { m: fm, k: L };
      });
      flames.push({ g: fl, layers: layers, s: size, ph: glimR(cr * 13) * 6 });
    }
    var crownGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
    crownGlow.scale.set(0.18, 0.18, 1); crownGlow.position.set(0, 0.07, -0.01); head.add(crownGlow);
    // folded wings: rounded coverts over the shoulder, then rows of long flight feathers, dark at the base and
    // flame-coloured at the tips, lying back along its sides
    var wingMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.back).lerp(new THREE.Color(pal.mid), 0.45), roughness: 0.5, metalness: 0.15, emissive: pal.glow, emissiveIntensity: 0.08 });
    var flightMat = emberFlightMat(pal), flightGeo = new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0);
    var wings = [];
    [-1, 1].forEach(function (s) {
      var wg = new THREE.Group(); wg.position.set(s * 0.088, 0.37, 0.05); body.add(wg); wings.push({ g: wg, s: s });
      part(seg, wingMat, 0, -0.012, -0.075, 0.022, 0.062, 0.12, wg, 0.1, 0, 0);
      var wf = [];
      for (var wr = 0; wr < 6; wr++) for (var wc = 0; wc < 11; wc++) {  // the coverts
        var wp = onEgg([0, -0.012, -0.075], [0.022, 0.062, 0.12], s * (Math.PI / 2) + (wc - 5) * 0.24, 0.85 - wr * 0.3, 0.003 + (6 - wr) * 0.0005);
        if (wp[3].x * s < 0.1) continue;
        wf.push([wp[0], wp[1], wp[2], wp[3], V3(0, -0.6, -1), 0.02, 0.03, tint(colBack, colVane, 0.3 + wr * 0.18 + (glimR(wr * 13 + wc) - 0.5) * 0.25, 4000 + wr * 17 + wc + (s > 0 ? 99 : 0))]);
      }
      shingles(wg, wf);
      for (var fr = 0; fr < 2; fr++) for (var ff = 0; ff < 6; ff++) {  // the flight feathers: secondaries, then the long primaries over them
        var fLen = fr ? 0.17 + ff * 0.012 : 0.12 + ff * 0.006, fW = fr ? 0.026 : 0.03;
        var fm = new THREE.Mesh(flightGeo, flightMat); fm.castShadow = true;
        fm.scale.set(fW, fLen, 1);
        fm.position.set(s * (0.016 + fr * 0.004 + ff * 0.0008), -0.03 - ff * 0.007 - fr * 0.006, -0.03 - ff * 0.012 - fr * 0.03);
        fm.rotation.set(Math.PI / 2 - 0.3 + ff * 0.025 - fr * 0.06, s * (Math.PI / 2 - 0.1), 0);   // (lying flat against its side, tip back)
        wg.add(fm);
      }
    });
    // long, slender bronze legs with a knobbly joint, little scales all the way down, a spur, and clawed toes
    var legMat = new THREE.MeshStandardMaterial({ color: pal.leg, roughness: 0.4, metalness: 0.4, emissive: pal.glow, emissiveIntensity: 0.1 });
    var scaleMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.leg).multiplyScalar(0.75), roughness: 0.5, metalness: 0.4 });
    var clawMat = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.3, metalness: 0.3 });
    var legs = [];
    [-1, 1].forEach(function (s, k) {
      var lg = new THREE.Group(); lg.position.set(s * 0.045, 0.22, 0.0); body.add(lg);
      abPart(new THREE.CylinderGeometry(0.0065, 0.008, 0.22, 10), legMat, 0, -0.11, 0, 0, 0, 0, lg);
      part(seg, legMat, 0, -0.1, 0.001, 0.0095, 0.011, 0.0095, lg);   // the joint
      for (var sc = 0; sc < 12; sc++) abPart(new THREE.TorusGeometry(0.0072, 0.0012, 4, 14), scaleMat, 0, -0.115 - sc * 0.0085, 0, Math.PI / 2 + 0.25, 0, 0, lg);   // the scales
      abPart(new THREE.ConeGeometry(0.0025, 0.012, 6), clawMat, 0, -0.17, -0.008, -Math.PI / 2 - 0.4, 0, 0, lg);   // the spur
      [-1, 0, 1].forEach(function (t) {
        var toe = new THREE.Group(); toe.position.set(0, -0.217, 0); toe.rotation.y = -t * 0.45; lg.add(toe);
        abPart(new THREE.CylinderGeometry(0.0026, 0.0036, 0.042, 6), legMat, 0, 0, 0.021, Math.PI / 2, 0, 0, toe);
        [0.012, 0.024, 0.034].forEach(function (z) { part(seg, scaleMat, 0, 0.0015, z, 0.0034, 0.002, 0.004, toe); });
        abPart(new THREE.ConeGeometry(0.0022, 0.009, 6), clawMat, 0, -0.001, 0.046, Math.PI / 2 + 0.3, 0, 0, toe);
      });
      abPart(new THREE.CylinderGeometry(0.0025, 0.0035, 0.026, 6), legMat, 0, -0.217, -0.013, Math.PI / 2, 0, 0, lg);   // and one toe behind
      abPart(new THREE.ConeGeometry(0.002, 0.007, 6), clawMat, 0, -0.218, -0.028, -Math.PI / 2 - 0.3, 0, 0, lg);
      legs.push({ g: lg, ph: k * Math.PI });
    });
    // the train: four tiers of long flame feathers from the base of its tail, the shortest on top covering the base of
    // the rest. Each feather is gently curved (cupped across, arching back along its length) and no two are quite the
    // same, and each has a resting pose, trailing behind along the floor, and a display pose, raised in a great upright
    // fan; animating blends between the two. Behind the fan, a row of stiff tail feathers props it up, and a puff of
    // pale, fluffy down sits at its base
    var featherMat = emberFeatherMat(pal), up = V3(0, 1, 0), train = [];
    var tailBase = new THREE.Group(); tailBase.position.set(0, 0.34, -0.16); body.add(tailBase);
    function trainGeo(wd, L) {
      var geo = new THREE.PlaneGeometry(wd, L, 6, 20).translate(0, L / 2, 0), p = geo.attributes.position;
      for (var i = 0; i < p.count; i++) { var x = p.getX(i) / wd * 2, y = p.getY(i) / L; p.setZ(i, -x * x * wd * 0.09 - y * y * L * 0.1); }
      geo.computeVertexNormals(); return geo;
    }
    [[21, 0.76, 1.45], [17, 0.64, 1.32], [13, 0.5, 1.12], [9, 0.32, 0.85]].forEach(function (tier, ti) {
      var n = tier[0], L = tier[1], spread = tier[2], geo = trainGeo(0.13 * L / 0.74 + 0.03, L);
      for (var k = 0; k < n; k++) {
        var jr = glimR(ti * 57 + k * 3.3), a = -spread + k * spread * 2 / (n - 1) + (jr - 0.5) * 0.04, alt = k % 2 ? 0.004 : 0;
        var pv = new THREE.Group(); pv.position.set(0, ti * 0.012 + alt, -(3 - ti) * 0.012 - alt); tailBase.add(pv);
        var rest = new THREE.Quaternion().setFromUnitVectors(up, V3(Math.sin(a) * 0.2, -0.42 + ti * 0.06, -1).normalize());
        var show = new THREE.Quaternion().setFromUnitVectors(up, V3(Math.sin(a), Math.cos(a), -0.3 + ti * 0.04).normalize());
        var fm = new THREE.Mesh(geo, featherMat); fm.castShadow = true; fm.scale.setScalar(0.93 + jr * 0.14); fm.rotation.y = (glimR(k * 7.7 + ti) - 0.5) * 0.25; pv.add(fm);
        var ember = null, glint = null;
        if (ti < 2 && (ti === 0 || k % 2 === 0)) {                     // the embers at their hearts glow out when the fan is raised
          ember = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
          ember.scale.set(0.1, 0.1, 1); ember.position.set(0, L * 0.74, 0.01); fm.add(ember);
        }
        if (ti === 0) {                                                // and now and then a glint of light runs off a feather's tip
          glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: new THREE.Color(pal.tip), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
          glint.scale.set(0.05, 0.05, 1); glint.position.set(0, L * 0.97, 0.01); fm.add(glint);
        }
        pv.quaternion.copy(rest);
        train.push({ pv: pv, rest: rest, show: show, ember: ember, glint: glint, ph: glimR(ti * 31 + k) * 6 });
      }
    });
    var propGeo = new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0).rotateZ(Math.PI);   // (a flight feather, turned so its tip points up)
    for (var pr = 0; pr < 13; pr++) {                                 // the stiff tail feathers behind, tucked under the train at rest
      var pa = (pr - 6) * 0.2, ppv = new THREE.Group(); ppv.position.set(0, -0.004, -0.05); tailBase.add(ppv);
      var pm = new THREE.Mesh(propGeo, flightMat); pm.scale.set(0.045, 0.34 - Math.abs(pr - 6) * 0.012, 1); pm.castShadow = true; ppv.add(pm);
      var prest = new THREE.Quaternion().setFromUnitVectors(up, V3(Math.sin(pa) * 0.15, -0.5, -1).normalize());
      var pshow = new THREE.Quaternion().setFromUnitVectors(up, V3(Math.sin(pa) * 0.8, Math.cos(pa), -0.7).normalize());
      ppv.quaternion.copy(prest); train.push({ pv: ppv, rest: prest, show: pshow, ember: null, glint: null, ph: glimR(pr * 13) * 6 });
    }
    var puff = [];                                                     // the puff of pale down at the base of its tail
    for (var pu = 0; pu < 5; pu++) for (var pc = 0; pc < 12; pc++) {
      var pp = onEgg([0, -0.01, -0.02], [0.055, 0.045, 0.06], Math.PI + (pc - 5.5) * 0.28, 0.6 - pu * 0.32, 0.002);
      puff.push([pp[0], pp[1], pp[2], pp[3], V3(0, -0.6, -1), 0.024, 0.034, tint(colBreast, colTip, 0.3 + pu * 0.12, 6000 + pu * 13 + pc)]);
    }
    shingles(tailBase, puff);
    var sparks = [];                                                  // embers drifting up, and a warm glow round it
    for (var sp = 0; sp < 14; sp++) { var sk = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: new THREE.Color(sp % 3 ? pal.ring : pal.tip), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); sk.scale.set(0.035, 0.035, 1); root.add(sk); sparks.push({ s: sk, t: glimR(sp + 50) * 2, x: 0, y: 0, z: 0, dx: 0 }); }
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.3, 1.3, 1); glow.position.set(0, 0.45, -0.1); root.add(glow);
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.38, 0.1425, 1); tag.position.set(0, 1.22, 0); tag.renderOrder = 6; root.add(tag);
    return { root: root, body: body, head: head, flames: flames, crownGlow: crownGlow, wings: wings, legs: legs, lids: lids, train: train, feathers: feathers, featherMat: featherMat, sparks: sparks, glow: glow, tagCv: tagCv, tagTex: tagTex, fan: 0, show: 0, showWait: 8 + Math.random() * 10 };
  }
  // its Cinder Quill, lying on the straw, and a bundle of hay in the manger when it's been fed
  function emberBuildExtras(g) {
    var sz = GLIM_STALLS[g.stall], pal = EMBER_PALS[g.pal % EMBER_PALS.length];
    var quill = new THREE.Group(); quill.position.set(-3.3, 0.1, sz - 0.6); abRoom.add(quill);
    var qf = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.5).translate(0, 0.25, 0), emberFeatherMat(pal));
    qf.rotation.set(-Math.PI / 2 + 0.08, 0, 0.9); qf.position.set(0.12, 0.012, -0.1); qf.castShadow = true; quill.add(qf);
    var qg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    qg.scale.set(0.5, 0.5, 1); qg.position.set(-0.16, 0.06, -0.28); quill.add(qg);   // (glowing round the ember near its tip)
    g.eggMesh = quill; g.eggGlow = qg;
    var hay = abPart(wbLumpGeo(300 + g.stall, 0.25), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.3, 0.94, sz + 1.0);
    hay.scale.set(0.16, 0.07, 0.16); g.hayMesh = hay;
    g.slate.map = glimSlateTex(g.name, 'Emberwing'); g.slate.needsUpdate = true;
  }
  // every frame, for an Emberwing: a proud strut with a bob of the head when it walks, a look about, blinking, its
  // crown of flames flickering and its train trailing behind; now and then it raises its train into a blazing fan and
  // gives it a rattle, the embers in it glowing and sparks drifting up; and when petted it fans out straight away
  var emberQ = new THREE.Quaternion();
  function emberAnimate(g, dt, t, moving) {
    var m = g.m;
    if (moving) g.hop += dt * 7;
    var happy = g.pet > 0;
    if (happy) g.pet -= dt;
    m.showWait -= dt;
    if (m.showWait <= 0 && !moving) { m.show = 4 + Math.random() * 3; m.showWait = 20 + Math.random() * 25; }   // showing off, every so often
    if (m.show > 0) m.show -= dt;
    var target = happy || m.show > 0 ? 1 : 0;
    m.fan += (target - m.fan) * Math.min(1, dt * (target ? 2.2 : 1.5));
    var f = m.fan * m.fan * (3 - 2 * m.fan);                        // (eased)
    var step = moving ? Math.sin(g.hop) : 0;
    m.body.position.y = moving ? Math.abs(step) * 0.008 : Math.sin(t * 1.8 + g.stall) * 0.003;
    m.body.rotation.x = -f * 0.08;                                   // it leans forward a little to hold the fan up
    m.legs.forEach(function (l) { l.g.rotation.x = moving ? Math.sin(g.hop + l.ph) * 0.4 : l.g.rotation.x * 0.85; });
    m.head.position.z = 0.16 + (moving ? Math.sin(g.hop * 2) * 0.025 : 0);   // the head bobs back and forth as it struts
    m.head.rotation.set(happy ? -0.1 + Math.sin(t * 7) * 0.05 : 0.05 + (moving ? 0 : Math.sin(t * 0.37 + g.stall) * 0.12), happy ? Math.sin(t * 4) * 0.3 : Math.sin(t * 0.45 + g.stall) * 0.6, 0);
    m.flames.forEach(function (fl) {                                 // the little flames of its crown flicker
      var fk = 1 + Math.sin(t * 13 + fl.ph) * 0.12 + Math.sin(t * 21 + fl.ph * 2) * 0.08;
      fl.layers.forEach(function (L, n) { var k = 1 + (fk - 1) * (1 + n * 0.5); L.m.scale.set(fl.s * L.k[0] * (2 - k) * 0.95, fl.s * L.k[1] * k, fl.s * L.k[2]); });
      fl.g.rotation.x = Math.sin(t * 9 + fl.ph) * 0.12;
    });
    m.crownGlow.material.opacity = 0.5 + Math.sin(t * 11 + g.stall) * 0.1;
    m.wings.forEach(function (w) { w.g.rotation.z = w.s * f * 0.18 + (happy ? w.s * Math.sin(t * 22) * 0.05 : 0); });
    var bt = (t * 0.24 + g.stall * 0.37) % 1, blink = bt < 0.035 ? Math.sin(bt / 0.035 * Math.PI) : 0;
    m.lids.forEach(function (l) { l.visible = blink > 0.03; l.rotation.x = -0.62 + blink * 1.55; });
    var rattle = f > 0.9 ? Math.max(0, Math.sin(t * 1.3 + g.stall)) : 0;   // now and then, with the fan up, it gives it a rattle
    m.train.forEach(function (tr) {
      emberQ.copy(tr.rest).slerp(tr.show, f); tr.pv.quaternion.copy(emberQ);
      if (f < 0.05) tr.pv.rotateZ(Math.sin(t * 0.9 + tr.ph) * 0.015 + (moving ? Math.sin(g.hop + tr.ph) * 0.03 : 0));   // trailing feathers sway as it walks
      else tr.pv.rotateX(Math.sin(t * 28 + tr.ph) * 0.03 * rattle * f + Math.sin(t * 1.1 + tr.ph) * 0.02 * f);
      if (tr.ember) tr.ember.material.opacity = f * (0.45 + Math.sin(t * 9 + tr.ph) * 0.12 + Math.sin(t * 15 + tr.ph * 2) * 0.08);   // (flickering, like coals)
      if (tr.glint) tr.glint.material.opacity = f * Math.pow(Math.max(0, Math.sin(t * 1.7 + tr.ph * 7)), 12);
    });
    var flick = 0.5 + Math.sin(t * 7 + g.stall) * 0.25 + Math.sin(t * 12.7 + g.stall) * 0.25;
    m.featherMat.emissiveIntensity = 0.55 + f * 0.4 + flick * 0.15;
    m.feathers.emissiveIntensity = 0.5 + flick * 0.15;
    m.sparks.forEach(function (sp) {                                // embers drifting up off its train, more when it's raised
      sp.t += dt * (0.45 + f * 0.6);
      if (sp.t > 1) {
        sp.t -= 1 + Math.random() * (1.4 - f);
        var a = (Math.random() - 0.5) * 2.6, r = 0.3 + Math.random() * 0.45;
        sp.x = f > 0.5 ? Math.sin(a) * r : (Math.random() - 0.5) * 0.3; sp.y = f > 0.5 ? 0.34 + Math.cos(a) * r : 0.08; sp.z = f > 0.5 ? -0.3 : -0.3 - Math.random() * 0.5; sp.dx = (Math.random() - 0.5) * 0.12;
      }
      var tt = Math.max(0, sp.t);
      sp.s.material.opacity = sp.t > 0 ? Math.sin(sp.t * Math.PI) * 0.9 : 0;
      sp.s.position.set(sp.x + sp.dx * tt + Math.sin(t * 6 + sp.y * 20) * 0.01, sp.y + tt * 0.4, sp.z);
    });
    m.glow.material.opacity = 0.16 + f * 0.14 + flick * 0.05;
    m.glow.position.y = 0.4 + f * 0.25;
    if (g.egg) g.eggGlow.material.opacity = 0.35 + Math.sin(t * 2 + g.stall) * 0.12;
  }
  function emberwingAction(g, wx, wz) {                              // collecting its quill, feeding and petting an Emberwing
    if (g.egg) {
      if (!roomFor(['cinderQuill'])) { bagFull(); return; }
      addItem('cinderQuill', 1); g.egg = false; glimRefresh(g); popSound();
      showToast('You picked up a warm Cinder Quill from ' + g.name + '’s straw! 🪶🔥', 2400);
      return;
    }
    var day = Math.min(EMBER_DAYS, g.days + 1);                      // (counting today, once it's fed and petted)
    var news = day >= EMBER_DAYS ? ' A Cinder Quill tomorrow morning!' : ' Day ' + day + ' of ' + EMBER_DAYS + ' toward a Cinder Quill.';
    if (!g.fed) {
      if (!takeItem('hay', 1)) { showToast(g.name + ' is hungry! Buy hay at the counter to feed them 🌾', 2600); return; }
      g.fed = true; glimRefresh(g); popSound(); g.pet = 0.9; g.face = Math.atan2(-3.7 - g.x, GLIM_STALLS[g.stall] + 1.0 - g.z);
      showToast(g.name + ' pecks happily at the hay 🌾' + (g.petted ? news : ' Now give them a pet!'), 2600);
      return;
    }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 3.2;
      g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, 0.8, g.z); popSound();
      showToast(g.name + ' spreads their blazing fan for you 🧡' + news, 2800);
      return;
    }
    g.pet = 2.0; glimHeartBurst(g.x, 0.8, g.z);
    showToast(g.name + ' is fed, petted and happy ✧' + (day >= EMBER_DAYS ? ' A Cinder Quill tomorrow morning!' : ' Day ' + day + ' of ' + EMBER_DAYS + ' done. Come back tomorrow!'), 2400);
  }
  // ---------- Gemwrens ----------
  // Plump little ground birds a little like a quail (round and short-tailed, scurrying about on quick little feet,
  // with a nodding plume on top of the head, but not a quail): their feathers are speckled and scaled like the inside
  // of a geode, glittering here and there with tiny crystals, and the plume curling forward over their brow is tipped
  // with a faceted gem that glows. Feed one hay and pet it every day for four days in a row, and the next morning
  // there's a speckled Geode Egg in its straw, sparkling with crystals inside. Miss a day and the count starts over
  var GEM_COST = 380, GEM_DAYS = 4, GEM_BUMP = 0.012;
  var GEM_PALS = [                                                    // amethyst, rose quartz and citrine
    { name: 'Amethyst', back: '#4a3a66', mid: '#8a6ab8', breast: '#dccdf2', scale: '#2e2048', bib: '#3a2266', white: '#f4eeff', gem: 0xb07aff, glow: 0xc8a0ff, crystal: '#e8d8ff', beak: 0x3a3040, leg: 0xb8a8c8, iris: ['#7a4ab0', '#1a0a2a'] },
    { name: 'Rose Quartz', back: '#6a4050', mid: '#c4809a', breast: '#f8dde4', scale: '#4a2232', bib: '#7a2a4a', white: '#fff2f6', gem: 0xff8ab8, glow: 0xffb4d4, crystal: '#ffe2ee', beak: 0x4a3036, leg: 0xd8b0b8, iris: ['#b04a70', '#2a0a14'] },
    { name: 'Citrine', back: '#5e4626', mid: '#b88a44', breast: '#f6e8c0', scale: '#3a2a14', bib: '#6a4414', white: '#fffaea', gem: 0xffc23a, glow: 0xffdc8a, crystal: '#fff0c8', beak: 0x3a3024, leg: 0xc8a878, iris: ['#c08a20', '#2a1a04'] }
  ];
  function gemDiamond(g, x, y, w, h) {                               // a cut gem, seen from the front: a flat table on top, facets down to a point
    g.beginPath(); g.moveTo(x - w * 0.25, y - h * 0.5); g.lineTo(x + w * 0.25, y - h * 0.5); g.lineTo(x + w * 0.5, y - h * 0.18);
    g.lineTo(x, y + h * 0.5); g.lineTo(x - w * 0.5, y - h * 0.18); g.closePath();
  }
  // painting one of its feathers in fine detail: hundreds of barbs off a tapering shaft, each drawn in short segments
  // so its markings can change along it (o.col(x, y, k, s, j): x and y where on the feather, 0 to 1 from base to tip;
  // k how far out along the barb; s which side; j a little jitter), a glint of light on some barbs, splits in the vane
  // here and there, and loose down at the base. Drawn base at the top, tip at the bottom
  function gemPaintFeather(g, w, h, o) {
    var cx = w / 2, step = o.step || 0.4, N = o.segs || 8, sd = o.seed || 0, sweep = o.sweep || 0.62, skip = [0, 0];
    g.lineCap = 'round';
    for (var y = 1; y < h - 1; y += step) {
      var t = y / h;
      for (var si = 0; si < 2; si++) {
        var s = si ? 1 : -1, r = glimR(y * 13.7 + si * 71 + sd), r2 = glimR(y * 7.3 + si * 11 + sd), j = (glimR(y * 3.1 + si * 5 + sd) - 0.5) * 2;
        if (t < o.from) {                                              // loose, fluffy down near the base
          var fl = o.fluff * (0.6 + r2 * 0.6), fa = 0.9 + r * 0.5;
          g.globalAlpha = 0.5; g.strokeStyle = grey(o.col(0.5 + s * 0.2, t, 0.4, s, j)); g.lineWidth = 0.7;
          g.beginPath(); g.moveTo(cx, y); g.bezierCurveTo(cx + s * fl * 0.4, y + fl * 0.1, cx + s * fl * 0.8, y + fl * (0.3 + r * 0.5), cx + s * fl * Math.cos(fa) * 1.1, y + fl * Math.sin(fa)); g.stroke();
          continue;
        }
        if (skip[si] > 0) { skip[si]--; continue; }
        if (r < (o.split || 0.012)) skip[si] = 2 + Math.floor(r2 * 5);  // a split in the vane
        var a = sweep + (r - 0.5) * 0.1, len = 0;
        for (var it = 0; it < 4; it++) { var eu = Math.min(1, (y + len * Math.sin(a)) / h); len = o.edge(eu, s) / Math.cos(a); }
        len *= 0.92 + r2 * 0.14;
        if (len < 0.8) continue;
        var ex = cx + s * len * Math.cos(a), ey = y + len * Math.sin(a), qx = cx + s * len * 0.55 * Math.cos(a * 0.6), qy = y + len * 0.55 * Math.sin(a * 0.6);   // (each barb curving gently toward the tip)
        g.globalAlpha = 1;
        var px = cx, py = y;
        for (var n = 1; n <= N; n++) {
          var f = n / N, m = 1 - f, nx = m * m * cx + 2 * m * f * qx + f * f * ex, ny = m * m * y + 2 * m * f * qy + f * f * ey;
          g.strokeStyle = grey(o.col(((px + nx) / 2) / w, ((py + ny) / 2) / h, f - 0.5 / N, s, j));
          g.lineWidth = (o.lw || 1.1) * (1 - f * 0.45);
          g.beginPath(); g.moveTo(px, py); g.lineTo(nx, ny); g.stroke();
          px = nx; py = ny;
        }
        if (r2 > 0.62) {                                               // a glint of light catching the barbules
          g.globalAlpha = 0.35; g.strokeStyle = '#ffffff'; g.lineWidth = 0.5;
          g.beginPath(); g.moveTo(cx + s * len * 0.15, y + len * 0.1); g.quadraticCurveTo(qx, qy + 0.4, cx + s * len * 0.6 * Math.cos(a * 0.8), y + len * 0.6 * Math.sin(a * 0.8)); g.stroke();
          g.globalAlpha = 1;
        }
      }
    }
    var sw = o.shaftW || 1.6;                                          // the shaft: tapering, with darker edges and a pale core
    for (var k = 0; k < 2; k++) {
      g.strokeStyle = k ? (o.shaft || '#e8e8e8') : 'rgba(40,40,40,0.5)';
      for (var q = 0; q < 10; q++) { g.lineWidth = sw * (k ? 0.55 : 1) * (1 - q * 0.085); g.beginPath(); g.moveTo(cx, q * h * 0.096); g.lineTo(cx, (q + 1) * h * 0.096); g.stroke(); }
    }
  }
  function gemVerm(x, y) { return Math.sin(x * 170 + y * 61) * Math.sin(y * 97 - x * 43) + Math.sin(x * 61 - y * 140) * 0.5; }   // fine wavy vermiculation, as on a real quail
  // its body feathers, in greys so each one can be tinted its own colour. Four patterns, as on a real quail: scaled,
  // pale with a crisp dark crescent and a fine pale fringe at the tip (its belly); streaked, dark with a white stripe
  // down the shaft, edged in black and ending in a pale spot (its flanks); barred, with wavy dark bars, a pale shaft
  // streak and a buff edge down one side (its back and wings); and plain (its face and breast). All finely vermiculated
  // Each feather is shaded darker toward its base, where it tucks under the row above, so the rows stand out in
  // depth. Each also has a bump map, painted with the very same barbs: every barb a ridge of its own and the shaft
  // raised, so light catches the texture of the vane
  function gemContourCanvas(pat, bump) {
    return glimCanvas(192, 288, function (g, w, h) {
      if (bump) { g.fillStyle = grey(128); g.fillRect(0, 0, w, h); }
      gemPaintFeather(g, w, h, { from: 0.16, fluff: 34, seed: 61 + pat * 40, sweep: 0.62, step: 0.4, lw: 1.3, segs: 9,
        edge: function (u) { return w * 0.4 * Math.sqrt(Math.max(0, 1 - Math.pow((u - 0.52) / 0.47, 2))) * (1 - Math.max(0, u - 0.9) * 1.5); },
        col: function (x, y, k, s, j) {
          if (bump) return 112 + j * 48 + (k < 0.07 ? 40 : 0) - k * 20;
          var vm = gemVerm(x, y) * 12, v;
          if (pat === 0) {                                             // (the crescent follows the feather's rounded tip)
            var e = Math.sqrt(Math.pow((x - 0.5) / 0.4, 2) + Math.pow((y - 0.52) / 0.47, 2));
            v = 200 + y * 30 + vm * 0.6 + j * 10;
            if (y > 0.5) { if (e > 0.7 && e < 0.88) v = 58 + vm; else if (e >= 0.88) v = 234; }
          }
          else if (pat === 1) {
            var wS = y > 0.18 && y < 0.95 ? 0.26 * Math.sin(Math.PI * (y - 0.18) / 0.77) : 0;
            v = 100 + y * 28 + vm + j * 10;
            if (k < wS) v = 246 - k * 40; else if (k < wS + 0.09 && wS > 0.02) v = 55;   // the white stripe, edged in black
            if (y > 0.9 && k < 0.4) v = 228;
          }
          else if (pat === 2) {
            v = 152 + y * 34 + vm + j * 12;
            if (y > 0.3 && Math.sin(y * 24 + k * 1.4 + s * 0.4 + Math.sin(k * 9) * 0.3) > 0.5) v = 62 + vm * 0.5;   // wavy dark bars
            if (y > 0.28 && k < 0.1) v = 214;                                                                       // a pale shaft streak
            if (s > 0 && k > 0.8 && y > 0.25) v = 232;                                                              // a buff edge down one side
          }
          else v = 186 + y * 44 + vm * 0.7 + j * 10;
          var u = Math.max(0, Math.min(1, (y - 0.18) / 0.42));
          v *= 0.6 + 0.4 * u * u * (3 - 2 * u);                       // (shaded toward the base)
          if (k > 0.9 && pat !== 0) v *= 0.9;                          // (and a touch darker at the very edge)
          return v;
        }, shaft: bump ? '#ffffff' : pat === 1 ? '#ffffff' : '#d2d2d2', shaftW: 1.8 });
      if (!bump) emberBleed(g, w, h, [200, 200, 200]);
    });
  }
  var gemContourTexes = [0, 1, 2, 3].map(function (pat) {
    var tex = new THREE.CanvasTexture(gemContourCanvas(pat, false));
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return tex;
  });
  var gemContourBumps = [0, 1, 2, 3].map(function (pat) { return new THREE.CanvasTexture(gemContourCanvas(pat, true)); });
  // the plume: a narrow, teardrop-shaped feather, darkest and glossiest at the tip, curling forward over its brow
  var gemPlumeTex = new THREE.CanvasTexture(glimCanvas(96, 320, function (g, w, h) {
    gemPaintFeather(g, w, h, { from: 0.12, fluff: 12, seed: 77, sweep: 0.8, step: 0.45, lw: 1.1, segs: 7,
      edge: function (u) { return w * 0.45 * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(u, 1.6))), 0.7); },   // (narrow at its base, a teardrop at the top)
      col: function (x, y, k, s, j) { return 118 - y * 60 + k * 16 + gemVerm(x, y) * 5 + j * 10; }, shaft: '#6a6a6a', shaftW: 1.4 });
    emberBleed(g, w, h, [80, 80, 80]);
  }));
  // a flight or tail feather: long and narrow, grey-brown, its broad trailing side notched with buff bars, darker at
  // the very tip, the leading side narrower and plainer
  var gemFlightTex = new THREE.CanvasTexture(glimCanvas(96, 480, function (g, w, h) {
    gemPaintFeather(g, w, h, { from: 0.06, fluff: 14, seed: 91, sweep: 0.85, step: 0.45, lw: 1.1, segs: 7, split: 0.015,
      edge: function (u, s) { return w * 0.46 * (s < 0 ? 0.55 : 1) * Math.pow(Math.max(0, 1 - Math.pow((u - 0.45) / 0.55, 2)), 0.35); },
      col: function (x, y, k, s, j) {
        var v = 150 + y * 28 + gemVerm(x, y) * 10 + j * 12;
        if (s > 0 && k > 0.35 && Math.sin(y * 34 + k * 0.8) > 0.35) v = 222;   // buff notches
        if (y > 0.92) v -= 40;
        return v;
      }, shaft: '#e6e6e6', shaftW: 1.8 });
    emberBleed(g, w, h, [190, 190, 190]);
  }));
  gemFlightTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  // a Geode Egg: a speckled little egg, cracked open on one side to show the glittering crystals inside
  function gemEggTex(pal) {
    return new THREE.CanvasTexture(glimCanvas(256, 128, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fbf6ee'); gr.addColorStop(1, '#ece0cc');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 260; i++) {                                 // speckles and blotches, like a quail's egg
        var x = glimR(i * 2.3 + 400) * w, y = glimR(i * 3.1 + 400) * h, r = 0.8 + Math.pow(glimR(i * 4.7), 3) * 7;
        g.fillStyle = glimR(i * 5.9) > 0.35 ? 'rgba(70,50,40,' + (0.5 + glimR(i) * 0.4) + ')' : 'rgba(140,110,90,0.5)';
        g.beginPath(); g.ellipse(x, y, r * (1 + glimR(i * 6.1)), r, glimR(i * 7.3) * 3, 0, Math.PI * 2); g.fill();
      }
      for (var c = 0; c < 70; c++) { g.fillStyle = pal.crystal; g.globalAlpha = 0.6 + glimR(c) * 0.4; g.fillRect(glimR(c * 3.3 + 9) * w, glimR(c * 4.4 + 9) * h, 1.5, 1.5); }   // crystal flecks
      g.globalAlpha = 1;
    }));
  }
  var gemEggIcon = glimCanvas(96, 96, function (g, w, h) {
    var pal = GEM_PALS[0];
    var glow = g.createRadialGradient(48, 54, 4, 48, 54, 46); glow.addColorStop(0, 'rgba(200,160,255,0.7)'); glow.addColorStop(1, 'rgba(200,160,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    g.save(); g.beginPath(); g.ellipse(48, 54, 23, 30, 0, 0, Math.PI * 2); g.clip();
    var eg = g.createRadialGradient(40, 40, 3, 48, 56, 34); eg.addColorStop(0, '#fffaf2'); eg.addColorStop(1, '#e2d2ba'); g.fillStyle = eg; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 46; i++) { g.fillStyle = 'rgba(70,50,40,0.75)'; g.beginPath(); g.arc(glimR(i * 2.9 + 3) * w, glimR(i * 3.7 + 3) * h, 0.8 + Math.pow(glimR(i * 5.3), 2) * 3, 0, Math.PI * 2); g.fill(); }   // speckles
    g.fillStyle = '#2a1a40'; g.beginPath(); g.moveTo(52, 30); g.lineTo(60, 40); g.lineTo(56, 48); g.lineTo(66, 58); g.lineTo(62, 70); g.lineTo(80, 76); g.lineTo(80, 24); g.closePath(); g.fill();   // the cracked-open side
    [[64, 44, '#d8b8ff'], [70, 56, '#b07aff'], [72, 38, '#f2e6ff'], [68, 66, '#c8a0ff'], [76, 50, '#e8d8ff']].forEach(function (cr) {   // the crystals inside
      g.fillStyle = cr[2]; g.beginPath(); g.moveTo(cr[0], cr[1] - 7); g.lineTo(cr[0] + 4, cr[1]); g.lineTo(cr[0], cr[1] + 6); g.lineTo(cr[0] - 4, cr[1]); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.moveTo(cr[0], cr[1] - 7); g.lineTo(cr[0] + 4, cr[1]); g.lineTo(cr[0], cr[1]); g.closePath(); g.fill();
    });
    g.restore();
    g.strokeStyle = 'rgba(120,90,70,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(48, 54, 23, 30, 0, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff'; [[20, 24], [80, 18], [18, 74]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  ITEMS.geodeEgg = { name: 'Geode Egg', price: 360, icon: '🥚', img: gemEggIcon, fill: 86, info: 'A speckled little egg that has cracked open on one side to show glittering crystals inside, laid by a happy Gemwren. Feed and pet yours every day for four days in a row for one. Sells for a very good price at the shipping bin.' };
  var gemShopIcon = glimCanvas(128, 128, function (g, w, h) {         // a little portrait of one, for the shop
    var pal = GEM_PALS[0];
    var glow = g.createRadialGradient(64, 70, 4, 64, 70, 64); glow.addColorStop(0, 'rgba(200,160,255,0.75)'); glow.addColorStop(1, 'rgba(200,160,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    var bg = g.createLinearGradient(0, 56, 0, 112); bg.addColorStop(0, pal.mid); bg.addColorStop(1, pal.breast);
    g.fillStyle = bg; g.beginPath(); g.ellipse(60, 84, 38, 30, 0, 0, Math.PI * 2); g.fill();          // the round body
    g.fillStyle = pal.back; g.beginPath(); g.ellipse(48, 78, 24, 15, -0.25, 0, Math.PI * 2); g.fill(); // the wing
    g.fillStyle = 'rgba(255,255,255,0.75)'; for (var s = 0; s < 6; s++) { g.beginPath(); g.ellipse(40 + s * 5, 72 + (s % 2) * 6, 2, 3.5, 0, 0, Math.PI * 2); g.fill(); }   // its spots
    g.strokeStyle = pal.scale; g.lineWidth = 1.5; for (var r = 0; r < 3; r++) for (var c = 0; c < 4; c++) { g.beginPath(); g.arc(68 + c * 7 + (r % 2) * 3.5, 92 + r * 6, 3.5, 0.2, Math.PI - 0.2); g.stroke(); }   // the scaled belly
    g.fillStyle = pal.mid; g.beginPath(); g.arc(88, 52, 17, 0, Math.PI * 2); g.fill();               // the head
    g.fillStyle = pal.bib; g.beginPath(); g.moveTo(84, 58); g.quadraticCurveTo(92, 72, 104, 58); g.quadraticCurveTo(98, 54, 84, 58); g.fill();   // the bib,
    g.strokeStyle = pal.white; g.lineWidth = 2; g.beginPath(); g.moveTo(84, 58); g.quadraticCurveTo(92, 74, 105, 57); g.stroke();             // bordered in white
    g.beginPath(); g.moveTo(80, 44); g.quadraticCurveTo(90, 40, 100, 45); g.stroke();                // and a white brow stripe
    g.fillStyle = '#2a2230'; g.beginPath(); g.moveTo(102, 50); g.quadraticCurveTo(110, 51, 104, 56); g.closePath(); g.fill();   // the beak
    g.fillStyle = '#fff'; g.beginPath(); g.arc(94, 50, 4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#1a0a2a'; g.beginPath(); g.arc(94.5, 50.5, 3, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(93.4, 49.2, 1.1, 0, Math.PI * 2); g.fill();
    g.strokeStyle = pal.scale; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(86, 36); g.quadraticCurveTo(88, 20, 100, 18); g.stroke();   // the plume,
    g.fillStyle = '#c8a0ff'; gemDiamond(g, 104, 18, 14, 13); g.fill();                               // tipped with a gem
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.moveTo(100.5, 11.5); g.lineTo(107.5, 11.5); g.lineTo(104, 18); g.closePath(); g.fill();
    g.fillStyle = '#fff'; [[18, 40], [112, 92], [30, 112]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  // building one: a plump, rounded body clad in hundreds of small tinted feathers (scaled on the belly, streaked on
  // the flanks, spotted on the back and wings), with a glittering crystal feather here and there; a small round head
  // with a dark bib edged in white, a white brow stripe and a short stubby beak; a curl of plume feathers tipped with a
  // faceted gem; folded wings; a short tail; and short legs on little clawed feet
  function gemBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body); abRoom.add(root);
    var seg = new THREE.SphereGeometry(1, 40, 28);
    var under = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.mid).multiplyScalar(0.7), roughness: 0.9 });   // (the body under its feathers)
    function part(geo, mat, x, y, z, sx, sy, sz, parent, rx, ry, rz) { var m = abPart(geo, mat, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); m.scale.set(sx, sy, sz); return m; }
    var sheenCol = new THREE.Color(pal.crystal).multiplyScalar(0.35);
    var contourMats = gemContourTexes.map(function (tex, ti) { return new THREE.MeshPhysicalMaterial({ map: tex, bumpMap: gemContourBumps[ti], bumpScale: GEM_BUMP, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.55, metalness: 0.05, clearcoat: 0.25, clearcoatRoughness: 0.5, sheen: sheenCol, emissive: pal.glow, emissiveIntensity: 0.03 }); });
    var crystalMat = new THREE.MeshPhysicalMaterial({ map: gemContourTexes[3], bumpMap: gemContourBumps[3], bumpScale: GEM_BUMP, alphaTest: 0.3, side: THREE.DoubleSide, color: new THREE.Color(pal.gem).lerp(new THREE.Color(pal.crystal), 0.7), roughness: 0.1, metalness: 0.45, clearcoat: 1, clearcoatRoughness: 0.05, emissive: pal.gem, emissiveIntensity: 0.18 });   // (glassy, like a sliver of the gem)
    var cPlane = emberCurvedPlane(0.3, 0.15);
    var cM = new THREE.Matrix4(), cN = new THREE.Vector3(), cT = new THREE.Vector3(), cX = new THREE.Vector3(), cY = new THREE.Vector3(), cZ = new THREE.Vector3();
    var cBack = V3(0, -0.35, -1), cDown = V3(0, -1, 0.15), crystals = [];
    function shingles(parent, list) {                                 // list: [x, y, z, normal, flow, width, length, colour, pattern]; drawn in one batch per pattern
      var groups = [[], [], [], [], []];
      list.forEach(function (f, i) { groups[glimR(i * 7.1 + list.length) < 0.022 && f[8] !== 3 ? 4 : f[8]].push(f); });   // (one in twenty or so is a glittering crystal feather)
      groups.forEach(function (grp, gi) {
        if (!grp.length) return;
        var im = new THREE.InstancedMesh(cPlane, gi === 4 ? crystalMat : contourMats[gi], grp.length); im.castShadow = true;
        grp.forEach(function (f, i) {
          var r1 = glimR(i * 3.7 + gi * 91 + grp.length), r2 = glimR(i * 6.1 + gi * 37 + grp.length);
          cN.copy(f[3]).normalize();
          cT.copy(f[4]).addScaledVector(cN, -f[4].dot(cN)).normalize().addScaledVector(cN, 0.06 + r2 * 0.08).normalize();
          cT.applyAxisAngle(cN, (r1 - 0.5) * 0.3);
          cY.copy(cT).negate(); cZ.copy(cN).addScaledVector(cT, -cN.dot(cT)).normalize(); cX.crossVectors(cY, cZ);
          var sw = f[5] * (0.86 + r1 * 0.28), sl = f[6] * (0.88 + r2 * 0.26);
          cM.makeBasis(cX, cY, cZ).scale(V3(sw, sl, sw)).setPosition(f[0], f[1], f[2]);
          im.setMatrixAt(i, cM); im.setColorAt(i, gi === 4 ? new THREE.Color(1, 1, 1) : f[7]);
          if (gi === 4) crystals.push(V3(f[0], f[1], f[2]).addScaledVector(cN, 0.004).addScaledVector(cY, f[6] * 0.6));   // (a twinkle by each crystal feather)
        });
        parent.add(im);
      });
    }
    function onEgg(c, r, u, v, out) {
      var d = V3(Math.sin(u) * Math.cos(v), Math.sin(v), Math.cos(u) * Math.cos(v));
      var n = V3(d.x / r[0], d.y / r[1], d.z / r[2]).normalize();
      return [c[0] + d.x * r[0] + n.x * out, c[1] + d.y * r[1] + n.y * out, c[2] + d.z * r[2] + n.z * out, n];
    }
    function tint(a, b, k, j) { return a.clone().lerp(b, Math.max(0, Math.min(1, k))).offsetHSL((glimR(j) - 0.5) * 0.03, 0, (glimR(j + 7) - 0.5) * 0.08); }
    var colBack = new THREE.Color(pal.back), colMid = new THREE.Color(pal.mid), colBreast = new THREE.Color(pal.breast), colScale = new THREE.Color(pal.scale), colBib = new THREE.Color(pal.bib), colWhite = new THREE.Color(pal.white);
    var BODY = [0, 0.17, -0.01], BR = [0.115, 0.1, 0.15], BREAST = [0, 0.2, 0.07], RR = [0.1, 0.098, 0.095];
    part(seg, under, BODY[0], BODY[1], BODY[2], BR[0], BR[1], BR[2]);
    part(seg, under, BREAST[0], BREAST[1], BREAST[2], RR[0], RR[1], RR[2]);
    // under the feathers, a layer of soft down, so no bare skin shows between them
    var downMat = moonFurMat({ color: colMid.clone().lerp(colBreast, 0.35), alphaMap: duckDownTex(), roughness: 1 });
    function downy(x, y, z, sx, sy, sz, parent, depth) { var d = abPart(moonShellGeo(moonSegLo, 10, depth), downMat, x, y, z, 0, 0, 0, parent || body); d.scale.set(sx, sy, sz); d.castShadow = false; }
    downy(BODY[0], BODY[1], BODY[2], BR[0], BR[1], BR[2], body, 0.025); downy(BREAST[0], BREAST[1], BREAST[2], RR[0], RR[1], RR[2], body, 0.025);   // (kept just under the feathers)
    var bodyF = [];
    for (var br = 0; br < 26; br++) {                                 // the breast: plain and smooth up top, then scaled lower down (and round the back of it, the mantle)
      var bv = 1.5 - br * 0.108, bn = Math.round(60 * Math.cos(bv) + 12);
      for (var bc = 0; bc < bn; bc++) {
        var bu = -Math.PI + (bc + (br % 2) * 0.5) * Math.PI * 2 / bn, pt = onEgg(BREAST, RR, bu, bv, 0.003 + (26 - br) * 0.0002);
        if (Math.abs(bu) > 1.8) {                                     // (behind: only where it rises above the body, as back feathers)
          if (Math.pow((pt[0] - BODY[0]) / BR[0], 2) + Math.pow((pt[1] - BODY[1]) / BR[1], 2) + Math.pow((pt[2] - BODY[2]) / BR[2], 2) < 1.02) continue;
          bodyF.push([pt[0], pt[1], pt[2], pt[3], cBack, 0.018 + glimR(br * 5 + bc) * 0.004, 0.028, tint(colBack, colMid, 0.2 + (glimR(br * 7 + bc) - 0.5) * 0.3, 800 + br * 71 + bc), 2]);
          continue;
        }
        var scaled = bv < 0.25 + (glimR(br * 3 + bc) - 0.5) * 0.25;
        bodyF.push([pt[0], pt[1], pt[2], pt[3], cDown, 0.016 + glimR(br * 5 + bc) * 0.003, 0.024, scaled ? tint(colBreast, colMid, 0.15 + (glimR(br * 9 + bc) - 0.5) * 0.2, br * 31 + bc) : tint(colMid, colBreast, (1.5 - bv) / 1.4 + (glimR(br * 9 + bc) - 0.5) * 0.25, br * 31 + bc), scaled ? 0 : 3]);
      }
    }
    for (var bk = 0; bk < 25; bk++) {                                 // the back, barred; the flanks, streaked; and the belly, scaled
      var kv = 1.55 - bk * 0.118, kn = Math.round(54 * Math.cos(kv) + 9);   // (all the way round; the breast covers the front)
      for (var kc = 0; kc < kn; kc++) {
        var ku = Math.PI + (-0.5 + (kc + (bk % 2) * 0.5) / kn) * Math.PI * 2, kp = onEgg(BODY, BR, ku, kv, 0.003 + (25 - bk) * 0.0002);
        if (Math.pow((kp[0] - BREAST[0]) / RR[0], 2) + Math.pow((kp[1] - BREAST[1]) / RR[1], 2) + Math.pow((kp[2] - BREAST[2]) / RR[2], 2) < 1 && Math.abs(Math.atan2(kp[0], kp[2] - BREAST[2])) < 1.75) continue;   // (the breast covers this)
        var flank = Math.abs(kp[3].x) > 0.5 && kv < 0.6 && kv > -0.55, belly = kv <= -0.55, j = 900 + bk * 61 + kc;
        var col = flank ? tint(colMid, colBack, 0.35 + (glimR(j) - 0.5) * 0.35, j) : belly ? tint(colBreast, colMid, 0.2 + (glimR(j) - 0.5) * 0.2, j) : tint(colBack, colMid, 0.15 + Math.max(0, 0.9 - kv) * 0.25 + (glimR(j) - 0.5) * 0.3, j);
        bodyF.push([kp[0], kp[1], kp[2], kp[3], cBack, (belly ? 0.016 : 0.019) + glimR(bk * 3 + kc) * 0.004, belly ? 0.025 : 0.031, col, flank ? 1 : belly ? 0 : 2]);
      }
    }
    shingles(body, bodyF);
    // the tail: a short fan of barred feathers, tipped up a little, over a puff of pale, scaled undertail feathers
    var tail = new THREE.Group(); tail.position.set(0, 0.2, -0.15); body.add(tail);
    var tailMat = new THREE.MeshPhysicalMaterial({ map: gemFlightTex, color: colBack.clone().lerp(colMid, 0.3), alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.5, sheen: sheenCol });
    var tailGeo = new THREE.PlaneGeometry(1, 1, 1, 4).translate(0, -0.5, 0);
    for (var tf = 0; tf < 12; tf++) {
      var ta = (tf - 5.5) * 0.11, tm = new THREE.Mesh(tailGeo, tailMat); tm.castShadow = true;
      tm.scale.set(0.022, 0.06 - Math.abs(tf - 5.5) * 0.003, 1); tm.position.set(Math.sin(ta) * 0.012, 0.004 - Math.abs(tf - 5.5) * 0.001, -0.004 - Math.abs(tf - 5.5) * 0.0015);
      tm.quaternion.setFromUnitVectors(V3(0, -1, 0), V3(Math.sin(ta) * 0.9, 0.3, -1).normalize()); tm.rotateY(ta * 0.5); tail.add(tm);
    }
    var tailF = [];
    for (var tu = 0; tu < 3; tu++) for (var tc = 0; tc < 9; tc++) { var tq = onEgg([0, -0.03, 0.01], [0.04, 0.03, 0.035], Math.PI + (tc - 4) * 0.28, -0.2 - tu * 0.35, 0.002); tailF.push([tq[0], tq[1], tq[2], tq[3], V3(0, -0.4, -1), 0.016, 0.024, tint(colBreast, colMid, 0.25 + tu * 0.1, 7100 + tu * 13 + tc), 0]); }
    shingles(tail, tailF);
    // the head: small and round on a short neck, with a dark bib edged in white, a white band over its brow and back
    // past each eye, a dark line from beak to eye, a buff forehead, a darker cap, and a speckled, scaly nape
    var head = new THREE.Group(); head.position.set(0, 0.335, 0.125); body.add(head);   // (held up, so its bib shows)
    part(seg, under, 0, -0.06, -0.01, 0.05, 0.06, 0.05, head);         // (the neck)
    part(seg, under, 0, 0, 0, 0.046, 0.044, 0.05, head);
    downy(0, -0.06, -0.01, 0.05, 0.06, 0.05, head, 0.03); downy(0, 0, 0, 0.046, 0.044, 0.05, head, 0.025);
    var neckF = [];                                                   // feathers round the neck, joining head to body
    for (var nr = 0; nr < 13; nr++) for (var nc = 0; nc < 28; nc++) {
      var nq = onEgg([0, -0.06, -0.01], [0.05, 0.06, 0.05], (nc + (nr % 2) * 0.5) / 28 * Math.PI * 2 - Math.PI, 1.2 - nr * 0.17, 0.002), front = Math.abs(nq[0]) < 0.03 && nq[2] > 0;
      if (Math.pow(nq[0] / 0.046, 2) + Math.pow(nq[1] / 0.044, 2) + Math.pow(nq[2] / 0.05, 2) < 1.05) continue;   // (the head covers this)
      neckF.push([nq[0], nq[1], nq[2], nq[3], V3(0, -1, -0.3), 0.012, 0.018, front ? tint(colMid, colBreast, 0.3 + nr * 0.05, 6600 + nr * 31 + nc) : tint(colBreast, colMid, 0.3, 6600 + nr * 31 + nc), front ? 3 : 0]);
    }
    shingles(head, neckF);
    var headF = [], HR = [0.046, 0.044, 0.05];
    for (var hr = 0; hr < 28; hr++) {
      var hv = 1.5 - hr * 0.1, hn = Math.round(42 * Math.cos(hv) + 8);
      for (var hc = 0; hc < hn; hc++) {
        var hu = (hc + (hr % 2) * 0.5) / hn * Math.PI * 2 - Math.PI, au = Math.abs(hu);
        if (au < 0.22 && hv > -0.12 && hv < 0.18) continue;             // (room for its beak)
        if (Math.abs(au - 0.95) < 0.19 && Math.abs(hv - 0.2) < 0.19) continue;   // (and its eyes)
        var hq = onEgg([0, 0, 0], HR, hu, hv, 0.0012), j2 = 5000 + hr * 61 + hc, col, pat = 3;
        if (au < 1.15 && hv < -0.05 && hv > -1.0) col = au > 0.92 || hv < -0.84 ? colWhite : tint(colBib, colScale, glimR(j2) * 0.3, j2);   // the bib, and its white border
        else if (hv > 0.46 && hv < 0.6 && au > 0.2 && au < 1.95) col = colWhite;                             // the white band over the brow
        else if (hv > 0.04 && hv < 0.32 && au > 0.22 && au < 0.72) col = tint(colBib, colScale, 0.3, j2);   // the dark line from beak to eye
        else if (hv >= 0.2 && hv <= 0.5 && au < 0.34) col = tint(colWhite, colBreast, 0.6, j2);          // the buff forehead
        else if (au > 1.9 && hv < 0.45 && hv > -0.8) { col = tint(colBreast, colMid, 0.2 + glimR(j2) * 0.3, j2); pat = 0; }   // the scaly nape
        else if (hv >= 0.62) col = tint(colBack, colScale, 0.2 + glimR(j2) * 0.3, j2);            // the cap
        else col = tint(colMid, colBack, 0.25 + (glimR(j2) - 0.5) * 0.3, j2);
        headF.push([hq[0], hq[1], hq[2], hq[3], V3(0, -0.4, -1), au < 0.8 && hv > -0.2 ? 0.0095 : 0.0078, au < 0.8 && hv > -0.2 ? 0.012 : 0.0098, col, pat]);   // (a little larger over its face, where the head curves most)
      }
    }
    shingles(head, headF);
    // a short, stout beak: a curved upper half over a smaller lower one, with nostrils, a fine gape line and a few
    // bristles at its base
    var beakMat = new THREE.MeshPhysicalMaterial({ color: pal.beak, roughness: 0.3, metalness: 0.15, clearcoat: 0.6 });
    function stubby(r, len, hook) {
      var g2 = new THREE.ConeGeometry(r, len, 18, 8).rotateX(Math.PI / 2).translate(0, 0, len / 2), bp = g2.attributes.position;
      for (var bi = 0; bi < bp.count; bi++) { var bz = bp.getZ(bi) / len; bp.setY(bi, bp.getY(bi) * 0.85 - hook * bz * bz * bz); }
      g2.computeVertexNormals(); return g2;
    }
    var beak = new THREE.Group(); beak.position.set(0, -0.003, 0.044); beak.rotation.x = 0.12; head.add(beak);
    abPart(stubby(0.0105, 0.024, 0.006), beakMat, 0, 0.002, 0, 0, 0, 0, beak);   // the upper half
    abPart(stubby(0.008, 0.017, 0.001), beakMat, 0, -0.004, 0.001, 0.15, 0, 0, beak).scale.set(1, 0.6, 1);   // the lower half
    var nostril = new THREE.MeshStandardMaterial({ color: 0x0c080c, roughness: 0.6 });
    [-1, 1].forEach(function (s) {
      part(seg, nostril, s * 0.0042, 0.0062, 0.006, 0.0015, 0.0009, 0.0026, beak);
      abPart(new THREE.TorusGeometry(0.009, 0.0005, 4, 10, 1.1), nostril, s * 0.0005, -0.002, 0.004, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2, 0.2, beak);   // the gape
      for (var bb = 0; bb < 3; bb++) { var bst = abPart(new THREE.CylinderGeometry(0.00025, 0.0001, 0.008, 3), nostril, s * (0.008 + bb * 0.001), 0.002 - bb * 0.002, 0.002, 1.3, 0, -s * (0.5 + bb * 0.15), beak); bst.castShadow = false; }   // bristles
    });
    // big glossy eyes with lids that blink
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0610, roughness: 0.05, metalness: 0.2 });
    var irisMat = new THREE.MeshStandardMaterial({ map: moonEyeTex(pal), roughness: 0.15, emissive: 0xffffff, emissiveIntensity: 0.35 });
    irisMat.emissiveMap = irisMat.map;
    var corneaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.02, metalness: 0.1, depthWrite: false });
    var irisGeo = new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, 1.05); irisGeo.rotateX(Math.PI / 2);
    (function () { var ps = irisGeo.attributes.position, uv = irisGeo.attributes.uv, k = 0.46 / Math.sin(1.05); for (var i = 0; i < ps.count; i++) uv.setXY(i, 0.5 + ps.getX(i) * k, 0.5 + ps.getY(i) * k); uv.needsUpdate = true; })();
    var lidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.mid), roughness: 0.8, side: THREE.DoubleSide }), lids = [];
    var lashMat = new THREE.MeshStandardMaterial({ color: 0x140a18, roughness: 0.6 });
    var lidGeo = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42);
    [-1, 1].forEach(function (s) {
      var ey = new THREE.Group(); ey.position.set(s * 0.034, 0.008, 0.028); ey.rotation.set(0.05, s * 0.75, 0); head.add(ey);
      var RX = 0.016, RY = 0.017, RZ = 0.011;
      part(seg, eyeMat, 0, 0, 0, RX, RY, RZ, ey);
      abPart(irisGeo, irisMat, 0, 0, 0, 0, 0, 0, ey).scale.set(RX * 1.01, RY * 1.01, RZ * 1.01);
      var co = abPart(irisGeo, corneaMat, 0, 0, 0, 0, 0, 0, ey); co.scale.set(RX * 1.06, RY * 1.06, RZ * 1.18); co.castShadow = false;
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.005, 0.006, RZ * 1.02, 0.004, 0.0047, 0.0015, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), 0.005, -0.005, RZ * 0.98, 0.002, 0.0018, 0.001, ey);
      abPart(new THREE.TorusGeometry(1, 0.06, 6, 32), new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.white), roughness: 0.5 }), 0, 0, RZ * 0.25, 0, 0, 0, ey).scale.set(RX * 1.04, RY * 1.04, RZ);   // a pale eye-ring
      var lg = new THREE.Group(); ey.add(lg); lids.push(lg); lg.visible = false;
      abPart(lidGeo, lidMat, 0, 0, 0, 0, 0, 0, lg).scale.set(RX * 1.15, RY * 1.15, RZ * 1.3);
      [0.3, 0.6, 0.9].forEach(function (a, n) {
        var len = 0.006 - n * 0.001, lash = abPart(new THREE.ConeGeometry(0.0008, len, 5).translate(0, len / 2, 0), lashMat, s * Math.cos(a) * RX * 1.12, Math.sin(a) * RY * 1.12, RZ * 0.3, 0.4, 0, -Math.atan2(s * Math.cos(a) * 1.3, Math.sin(a) + 0.6), ey);
        lash.castShadow = false;
      });
      var bl = new THREE.Mesh(new THREE.PlaneGeometry(0.026, 0.018), new THREE.MeshBasicMaterial({ map: moonBlushTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      bl.position.set(s * 0.042, -0.016, 0.028); bl.rotation.set(0, s * 0.85, 0); head.add(bl);   // rosy cheeks
    });
    // the plume: a slender stalk springing from its forehead and curling forward, carrying a teardrop of seven small,
    // overlapping feathers that droop over its beak, with a faceted gem glowing at the tip and a sparkle that winks
    var plumeMat = new THREE.MeshPhysicalMaterial({ map: gemPlumeTex, color: colScale.clone().lerp(colBack, 0.3).multiplyScalar(2.2), alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.35, metalness: 0.1, sheen: sheenCol, clearcoat: 0.4 });
    var plume = new THREE.Group(); plume.position.set(0, 0.041, 0.018); head.add(plume);
    var stalk = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0, 0.012, 0.001), V3(0, 0.024, 0.007), V3(0, 0.032, 0.017), V3(0, 0.034, 0.028)]);
    abPart(new THREE.TubeGeometry(stalk, 16, 0.0012, 5), new THREE.MeshStandardMaterial({ color: colScale, roughness: 0.5 }), 0, 0, 0, 0, 0, 0, plume);
    var plumeGeo = new THREE.PlaneGeometry(1, 1, 2, 10).translate(0, 0.5, 0), pp = plumeGeo.attributes.position;
    for (var pi = 0; pi < pp.count; pi++) { var px = pp.getX(pi), py = pp.getY(pi); pp.setZ(pi, -px * px * 0.3 + py * py * 0.25); }   // (cupped, and curling at the tip)
    plumeGeo.computeVertexNormals();
    for (var pf = 0; pf < 7; pf++) {
      var tt = 0.42 + pf * 0.08, ppt = stalk.getPoint(tt), droop = 0.3 + pf * 0.24;
      var pg = new THREE.Group(); pg.position.copy(ppt); plume.add(pg);
      pg.quaternion.setFromUnitVectors(V3(0, 1, 0), V3((pf % 2 ? 1 : -1) * 0.08, Math.cos(droop), Math.sin(droop)).normalize());
      var pm = new THREE.Mesh(plumeGeo, plumeMat); pm.rotation.y = Math.PI / 2 + (pf % 2 ? 0.55 : -0.55); pm.scale.set(0.02 - pf * 0.0009, 0.036 - pf * 0.0016, 0.036); pm.castShadow = true; pg.add(pm);   // (its vane facing sideways, so the teardrop shows from the side)
    }
    var gemMat = new THREE.MeshPhysicalMaterial({ color: pal.gem, roughness: 0.04, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.02, emissive: pal.gem, emissiveIntensity: 0.45, flatShading: true });
    var gemG = new THREE.OctahedronGeometry(1, 0); gemG.scale(0.62, 1, 0.62);
    var gemTip = stalk.getPoint(1).add(V3(0, -0.006, 0.01));
    var gem = new THREE.Mesh(gemG, gemMat); gem.scale.setScalar(0.01); gem.position.copy(gemTip); gem.rotation.set(1.3, 0.4, 0); gem.castShadow = true; plume.add(gem);
    var setting = abPart(new THREE.TorusGeometry(0.0055, 0.0011, 6, 14), new THREE.MeshStandardMaterial({ color: 0xf2d080, metalness: 0.8, roughness: 0.25 }), gemTip.x, gemTip.y + 0.004, gemTip.z - 0.004, 1.0, 0, 0, plume);   // a tiny gold setting holding it
    setting.castShadow = false;
    var gemGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    gemGlow.scale.set(0.08, 0.08, 1); gemGlow.position.copy(gemTip); plume.add(gemGlow);
    var gemSpark = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    gemSpark.scale.set(0.04, 0.04, 1); gemSpark.position.copy(gemTip).add(V3(0.004, 0.004, 0.006)); plume.add(gemSpark);
    // folded wings: a rounded shoulder of small barred coverts in overlapping rows, larger coverts below them, and the
    // long barred flight feathers lying back along its side, their tips crossing over its tail; and long, pale-edged
    // tertials draped over the top
    var wingMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.back), roughness: 0.6 });
    var flightMat = new THREE.MeshPhysicalMaterial({ map: gemFlightTex, color: colBack.clone().lerp(colMid, 0.45), alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.5, sheen: sheenCol });
    var flightGeo = new THREE.PlaneGeometry(1, 1, 1, 4).translate(0, -0.5, 0);
    var wings = [];
    [-1, 1].forEach(function (s) {
      var wg = new THREE.Group(); wg.position.set(s * 0.098, 0.19, 0.02); body.add(wg); wings.push({ g: wg, s: s });
      part(seg, wingMat, 0, 0, -0.06, 0.02, 0.06, 0.1, wg, 0.15, 0, 0);
      downy(0, 0, -0.06, 0.02, 0.06, 0.1, wg, 0.04);
      for (var ff = 0; ff < 13; ff++) {                               // the flight feathers: secondaries first, then the longer primaries
        var prim = ff >= 6, k2 = prim ? ff - 6 : ff, fm = new THREE.Mesh(flightGeo, flightMat); fm.castShadow = true;
        fm.scale.set(prim ? 0.022 : 0.026, prim ? 0.1 + k2 * 0.005 : 0.075 + k2 * 0.004, 1);
        fm.position.set(s * (0.012 + ff * 0.0007), -0.022 - k2 * 0.004 - (prim ? 0.004 : 0), -0.035 - k2 * 0.008 - (prim ? 0.02 : 0));
        fm.rotation.set(Math.PI / 2 - 0.12 + k2 * 0.025 - (prim ? 0.05 : 0), s * (Math.PI / 2 - 0.07), 0); wg.add(fm);
      }
      var wf = [];
      for (var wr = 0; wr < 11; wr++) {                                // coverts, small on the shoulder and larger lower down
        var wn = 14;
        for (var wc = 0; wc < wn; wc++) {
          var wp = onEgg([0, 0, -0.06], [0.02, 0.06, 0.1], s * (Math.PI / 2) + (wc - (wn - 1) / 2) * 0.17 + (wr % 2) * 0.08, 1.0 - wr * 0.19, 0.003 + (11 - wr) * 0.0003);
          if (wp[3].x * s < 0.08) continue;
          var big = wr > 6;
          wf.push([wp[0], wp[1], wp[2], wp[3], V3(0, -0.45, -1), big ? 0.019 : 0.014, big ? 0.03 : 0.02, tint(colBack, colMid, 0.15 + wr * 0.05 + (glimR(wr * 13 + wc) - 0.5) * 0.3, 4000 + wr * 29 + wc + (s > 0 ? 499 : 0)), 2]);
        }
      }
      for (var tt2 = 0; tt2 < 4; tt2++) { var tp2 = onEgg([0, 0, -0.06], [0.02, 0.06, 0.1], s * 0.6 + Math.PI - s * tt2 * 0.12, 0.9, 0.004); wf.push([tp2[0], tp2[1], tp2[2], tp2[3], V3(-s * 0.2, -0.2, -1), 0.026, 0.06, tint(colBack, colScale, 0.3, 4900 + tt2), 2]); }   // tertials
      shingles(wg, wf);
    });
    // short legs, scaled in rings down the front, on little feet with scaled, padded toes and curved claws
    var legMat = new THREE.MeshPhysicalMaterial({ color: pal.leg, roughness: 0.45, metalness: 0.1, clearcoat: 0.3 });
    var scuteMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.leg).multiplyScalar(0.8), roughness: 0.5 });
    var clawMat = new THREE.MeshPhysicalMaterial({ color: 0x2a2026, roughness: 0.25, clearcoat: 0.6 });
    var legs = [];
    [-1, 1].forEach(function (s, k) {
      var lg = new THREE.Group(); lg.position.set(s * 0.04, 0.095, 0.01); body.add(lg);
      abPart(new THREE.CylinderGeometry(0.0055, 0.0065, 0.09, 12), legMat, 0, -0.045, 0, 0, 0, 0, lg);
      for (var sc = 0; sc < 9; sc++) part(seg, scuteMat, 0, -0.03 - sc * 0.0065, 0.0045, 0.0045, 0.0028, 0.0022, lg, -0.2);   // overlapping scutes down the front
      for (var sr = 0; sr < 7; sr++) abPart(new THREE.TorusGeometry(0.0062, 0.0008, 4, 14), scuteMat, 0, -0.035 - sr * 0.008, 0, Math.PI / 2 + 0.2, 0, 0, lg);
      part(seg, legMat, 0, -0.088, 0, 0.0075, 0.005, 0.0075, lg);     // the ball of the foot
      [-1, 0, 1].forEach(function (t) {
        var toe = new THREE.Group(); toe.position.set(0, -0.09, 0); toe.rotation.y = -t * 0.5; lg.add(toe);
        var tl = t ? 0.026 : 0.032;
        abPart(new THREE.CylinderGeometry(0.0021, 0.003, tl, 8), legMat, 0, 0, tl / 2, Math.PI / 2, 0, 0, toe);
        for (var ts = 0; ts < 4; ts++) part(seg, scuteMat, 0, 0.0018, 0.005 + ts * tl * 0.22, 0.0024, 0.0013, 0.003, toe);   // scutes along the top of each toe,
        for (var tp = 0; tp < 3; tp++) part(seg, legMat, 0, -0.0018, 0.007 + tp * tl * 0.3, 0.0025, 0.0016, 0.0035, toe);  // and little pads beneath
        abPart(new THREE.ConeGeometry(0.0018, 0.008, 8).translate(0, 0.004, 0), clawMat, 0, -0.0005, tl, Math.PI / 2 + 0.35, 0, 0, toe);
      });
      abPart(new THREE.CylinderGeometry(0.0018, 0.0026, 0.014, 6), legMat, 0, -0.088, -0.007, -Math.PI / 2 + 0.3, 0, 0, lg);   // and one behind,
      abPart(new THREE.ConeGeometry(0.0014, 0.005, 6), clawMat, 0, -0.091, -0.015, -Math.PI / 2 - 0.2, 0, 0, lg);              // with its claw
      legs.push({ g: lg, ph: k * Math.PI });
    });
    // twinkles on its crystal feathers, sparkles drifting up off it, and a soft glow
    var glints = crystals.slice(0, 18).map(function (p, i) {
      var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: new THREE.Color(pal.crystal), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      gl.scale.set(0.03, 0.03, 1); gl.position.copy(p); body.add(gl); return { s: gl, ph: glimR(i * 9.3) * 6 };
    });
    var sparks = [];
    for (var sp = 0; sp < 8; sp++) { var sk = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: new THREE.Color(sp % 2 ? pal.crystal : '#ffffff'), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); sk.scale.set(0.028, 0.028, 1); root.add(sk); sparks.push({ s: sk, t: glimR(sp + 70) * 2, x: 0, z: 0 }); }
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(0.9, 0.9, 1); glow.position.set(0, 0.22, 0); root.add(glow);
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.36, 0.135, 1); tag.position.set(0, 0.7, 0); tag.renderOrder = 6; root.add(tag);
    return { root: root, body: body, head: head, plume: plume, gem: gem, gemMat: gemMat, gemGlow: gemGlow, gemSpark: gemSpark, tail: tail, wings: wings, legs: legs, lids: lids, glints: glints, sparks: sparks, glow: glow, tagCv: tagCv, tagTex: tagTex, dash: 0, peck: 0, peckWait: 2 + Math.random() * 4 };
  }
  // a Geode Egg: a speckled shell (its base at the origin) with a crack in its side, dark within, and crystals
  // crowding out through it. Used in the nest and in your hand
  function gemEggModel(pal) {
    var egg = new THREE.Group();
    var shell = abPart(new THREE.SphereGeometry(0.045, 24, 16), new THREE.MeshStandardMaterial({ map: gemEggTex(pal), roughness: 0.4 }), 0, 0.055, 0, 0.2, 0, 0.15, egg); shell.scale.set(1, 1.25, 1);
    var crystalMat = new THREE.MeshPhysicalMaterial({ color: pal.gem, roughness: 0.05, metalness: 0.2, clearcoat: 1, emissive: pal.gem, emissiveIntensity: 0.5, flatShading: true });
    var cg = new THREE.OctahedronGeometry(1, 0); cg.scale(0.5, 1, 0.5);
    var hole = abPart(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshStandardMaterial({ color: 0x2a1838, roughness: 0.6 }), 0.037, 0.06, 0.004, 0, 0, 0, egg);
    hole.scale.set(0.01, 0.024, 0.018);
    for (var c = 0; c < 12; c++) {
      var a = -0.5 + (c % 6) * 0.2, cr = abPart(cg, crystalMat, Math.cos(a) * 0.041, 0.044 + Math.floor(c / 6) * 0.014 + glimR(c * 7) * 0.006, Math.sin(a) * 0.028, 0, -a, -Math.PI / 2 + 0.5 - glimR(c * 3) * 1.0, egg);
      cr.scale.setScalar(0.005 + glimR(c * 5) * 0.004);
    }
    return egg;
  }
  // its Geode Egg, nestled in a little nest in the straw, and a bundle of hay in the manger when it's been fed
  function gemBuildExtras(g) {
    var sz = GLIM_STALLS[g.stall], pal = GEM_PALS[g.pal % GEM_PALS.length];
    var egg = new THREE.Group(); egg.position.set(-3.3, 0.1, sz - 0.6); abRoom.add(egg);
    var nest = abPart(new THREE.TorusGeometry(0.07, 0.03, 8, 20), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), 0, 0.013, 0, Math.PI / 2, 0, 0, egg); nest.scale.set(1, 1, 0.6);
    egg.add(gemEggModel(pal));
    var eg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    eg.scale.set(0.38, 0.38, 1); eg.position.y = 0.06; egg.add(eg);
    g.eggMesh = egg; g.eggGlow = eg;
    var hay = abPart(wbLumpGeo(300 + g.stall, 0.25), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.3, 0.94, sz + 1.0);
    hay.scale.set(0.16, 0.07, 0.16); g.hayMesh = hay;
    g.slate.map = glimSlateTex(g.name, 'Gemwren'); g.slate.needsUpdate = true;
  }
  // every frame, for a Gemwren: quick little scurrying steps with its head held steady and its plume nodding; when it
  // stops it pecks at the straw now and then, looks about and blinks; its gem glows and winks and its crystal feathers
  // twinkle; when petted it fluffs itself up round and gives a happy little hop
  function gemAnimate(g, dt, t, moving) {
    var m = g.m;
    if (moving) g.hop += dt * 22;                                     // (tiny, fast steps)
    var happy = g.pet > 0;
    if (happy) g.pet -= dt;
    m.peckWait -= dt;
    if (m.peckWait <= 0 && !moving && !happy) { m.peck = 1.2; m.peckWait = 3 + Math.random() * 6; }
    if (m.peck > 0) m.peck -= dt;
    var peck = m.peck > 0 ? Math.max(0, Math.sin(m.peck * Math.PI * 3.3)) : 0;
    var fluff = happy ? 1 + Math.min(1, g.pet) * 0.09 : 1 + Math.sin(t * 2.4 + g.stall) * 0.012;   // fluffing up round when petted
    m.body.scale.set(fluff, fluff * (happy ? 0.98 : 1), fluff);
    m.body.position.y = moving ? Math.abs(Math.sin(g.hop)) * 0.006 : happy ? Math.max(0, Math.sin(t * 9)) * 0.03 * Math.min(1, g.pet) : 0;
    m.body.rotation.x = moving ? 0.12 : peck * 0.35;                  // leaning forward as it runs, or down to peck
    m.legs.forEach(function (l) { l.g.rotation.x = moving ? Math.sin(g.hop + l.ph) * 0.55 : l.g.rotation.x * 0.8; });
    m.head.rotation.set(happy ? -0.15 + Math.sin(t * 8) * 0.06 : peck * 0.7 - (moving ? 0.12 : 0), happy ? Math.sin(t * 5) * 0.25 : moving ? 0 : Math.round(Math.sin(t * 0.6 + g.stall) * 2) * 0.3, 0);   // (it looks about in quick little turns)
    m.plume.rotation.x = Math.sin(t * 3 + g.stall) * 0.06 + (moving ? Math.sin(g.hop * 0.5) * 0.18 : 0) + (happy ? Math.sin(t * 12) * 0.15 : 0) + peck * 0.2;   // the plume nods
    m.tail.rotation.x = (moving ? 0.15 : 0) + Math.max(0, Math.sin(t * 0.9 + g.stall) - 0.92) * Math.sin(t * 30) * 2;   // a flick of the tail now and then
    m.wings.forEach(function (w) { w.g.rotation.z = happy ? w.s * (0.1 + Math.max(0, Math.sin(t * 20)) * 0.25) : w.g.rotation.z * 0.85; });
    var bt = (t * 0.27 + g.stall * 0.37) % 1, blink = happy ? 0.7 : (bt < 0.035 ? Math.sin(bt / 0.035 * Math.PI) : 0);
    m.lids.forEach(function (l) { l.visible = blink > 0.03; l.rotation.x = -0.62 + blink * 1.55; });
    var pulse = 0.5 + Math.sin(t * 1.6 + g.stall) * 0.5;
    m.gemMat.emissiveIntensity = 0.35 + pulse * 0.35 + (g.egg ? 0.2 : 0);
    m.gemGlow.material.opacity = 0.35 + pulse * 0.3;
    m.gem.rotation.y += dt * 0.6;                                     // (catching the light as it turns)
    m.gemSpark.material.opacity = Math.pow(Math.max(0, Math.sin(t * 1.3 + g.stall * 2)), 14);
    m.glints.forEach(function (gl) { gl.s.material.opacity = Math.pow(Math.max(0, Math.sin(t * 0.9 + gl.ph * 3)), 18) * 0.9; });
    m.sparks.forEach(function (sp) {
      sp.t += dt * (happy ? 0.9 : 0.4);
      if (sp.t > 1) { sp.t -= 1 + Math.random() * 2; sp.x = (Math.random() - 0.5) * 0.3; sp.z = (Math.random() - 0.5) * 0.35; }
      sp.s.material.opacity = sp.t > 0 ? Math.sin(sp.t * Math.PI) * 0.85 : 0;
      sp.s.position.set(sp.x, 0.15 + Math.max(0, sp.t) * 0.35, sp.z);
    });
    m.glow.material.opacity = 0.14 + pulse * 0.06;
    if (g.egg) g.eggGlow.material.opacity = 0.35 + Math.sin(t * 2 + g.stall) * 0.12;
  }
  function gemwrenAction(g, wx, wz) {                                // collecting its egg, feeding and petting a Gemwren
    if (g.egg) {
      if (!roomFor(['geodeEgg'])) { bagFull(); return; }
      addItem('geodeEgg', 1); g.egg = false; glimRefresh(g); popSound();
      showToast('You collected a sparkling Geode Egg from ' + g.name + '! 🥚💎', 2400);
      return;
    }
    var day = Math.min(GEM_DAYS, g.days + 1);                        // (counting today, once it's fed and petted)
    var news = day >= GEM_DAYS ? ' A Geode Egg tomorrow morning!' : ' Day ' + day + ' of ' + GEM_DAYS + ' toward a Geode Egg.';
    if (!g.fed) {
      if (!takeItem('hay', 1)) { showToast(g.name + ' is hungry! Buy hay at the counter to feed them 🌾', 2600); return; }
      g.fed = true; glimRefresh(g); popSound(); g.pet = 0.9; g.face = Math.atan2(-3.7 - g.x, GLIM_STALLS[g.stall] + 1.0 - g.z);
      showToast(g.name + ' pecks busily at the hay 🌾' + (g.petted ? news : ' Now give them a pet!'), 2600);
      return;
    }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 1.8;
      g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, 0.45, g.z); popSound();
      showToast(g.name + ' fluffs up round and chirps happily 💜' + news, 2800);
      return;
    }
    g.pet = 1.2; glimHeartBurst(g.x, 0.45, g.z);
    showToast(g.name + ' is fed, petted and happy ✧' + (day >= GEM_DAYS ? ' A Geode Egg tomorrow morning!' : ' Day ' + day + ' of ' + GEM_DAYS + ' done. Come back tomorrow!'), 2400);
  }
  // ---------- Auroraram ----------
  // Sweet little creatures shaped a little like a kid goat (but not a goat): round and soft, with a big head, big
  // sparkly eyes and floppy ears, in a thick coat of real fur the deep blue of a winter night, rippling all over
  // with the shifting greens, blues and violets of the northern lights; spiralling horns of clear ice; a fluffy pale
  // bib, a snowflake charm on a ribbon collar, and glowing hooves. Feed one hay and pet it every day for two days in
  // a row, and the next morning you can milk it (with a Milk Pail) for a bottle of Aurora Milk. Miss a day and the
  // count starts over
  var AURORA_COST = 520, AURORA_DAYS = 2;
  var AURORA_PALS = [                                                 // a night-blue coat, a violet one and a frost-silver one, each with its own lights
    { name: 'Borealis', coat: '#141e46', coat2: '#22346c', belly: '#2e3e7a', nose: 0x7a80b8, lights: [0x3affa8, 0x3ac8ff, 0xa86aff], glow: 0x7affd0, horn: 0xd8f6ff, hornGlow: 0x6ae8ff, hoof: 0xcfe8ff, iris: ['#2ae0a0', '#0a2a40'] },
    { name: 'Twilight', coat: '#22163e', coat2: '#3a2866', belly: '#4a3478', nose: 0x9a80b8, lights: [0xff6ad8, 0xa86aff, 0x5ab0ff], glow: 0xe0a0ff, horn: 0xf0e2ff, hornGlow: 0xc89aff, hoof: 0xe8d8ff, iris: ['#c06aff', '#200a3a'] },
    { name: 'Frost', coat: '#aab8dc', coat2: '#d6e0f4', belly: '#e8eefa', nose: 0xb0a8c8, lights: [0x5affc0, 0x7ad8ff, 0xffa8e8], glow: 0xb0ffe8, horn: 0xffffff, hornGlow: 0x9ae8ff, hoof: 0xf0f8ff, iris: ['#3ab0d0', '#0a2030'] }
  ];
  // the lights: a shader added to its materials, so bands of colour drift slowly across its coat and horns, each part
  // glowing where it sits in the bands (and, on its long hairs, brightest toward the tips)
  var auroraClock = { value: 0 };
  function auroraLights(mat, pal, gain, byTip) {
    var prev = mat.onBeforeCompile, cols = pal.lights.map(function (c) { return new THREE.Color(c); });
    mat.onBeforeCompile = function (sh) {
      if (prev) prev(sh);
      sh.uniforms.uAurT = auroraClock; sh.uniforms.uAurA = { value: cols[0] }; sh.uniforms.uAurB = { value: cols[1] }; sh.uniforms.uAurC = { value: cols[2] }; sh.uniforms.uAurGain = { value: gain };
      sh.vertexShader = 'varying vec3 vAurW;\nvarying float vAurTip;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vAurTip = ' + (byTip ? 'clamp(-position.y, 0.0, 1.0)' : '1.0') + ';\n  vec4 aurW = vec4(transformed, 1.0);\n  #ifdef USE_INSTANCING\n  aurW = instanceMatrix * aurW;\n  #endif\n  vAurW = (modelMatrix * aurW).xyz;');
      sh.fragmentShader = 'uniform float uAurT, uAurGain; uniform vec3 uAurA, uAurB, uAurC; varying vec3 vAurW; varying float vAurTip;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', [
        '#include <emissivemap_fragment>',
        '  float aurA = sin(vAurW.x * 7.0 + vAurW.z * 5.0 + vAurW.y * 3.0 + uAurT * 0.7) * 0.5 + 0.5;',
        '  float aurB = sin(vAurW.z * 11.0 - vAurW.x * 4.0 + vAurW.y * 6.0 - uAurT * 1.1) * 0.5 + 0.5;',
        '  float aurC = pow(sin(vAurW.x * 3.0 + vAurW.z * 9.0 + uAurT * 0.45) * 0.5 + 0.5, 3.0);',   // (curtains that brighten and fade)
        '  vec3 aur = mix(mix(uAurA, uAurB, aurA), uAurC, aurB * aurB) * (0.35 + aurC);',
        '  aur *= vAurTip * vAurTip;',   // (on its long hairs, brightest toward the tips)
        '  totalEmissiveRadiance += aur * uAurGain;'].join('\n'));
    };
    mat.customProgramCacheKey = function () { return 'aurora' + (byTip ? 1 : 0) + (prev ? 'fur' : ''); };   // (so each kind gets its own shader)
    return mat;
  }
  // the coat under its long hair: silky night with fine flowing strands, a few faint stars
  function auroraCoatTex(pal) {
    return new THREE.CanvasTexture(glimCanvas(512, 256, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, pal.coat); gr.addColorStop(0.6, pal.coat2); gr.addColorStop(1, pal.belly);
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 2600; i++) {                                // long silky strands flowing down
        var x = glimR(i * 1.37 + 300) * w, y = glimR(i * 2.11 + 300) * h, l = 12 + glimR(i * 3.7) * 30;
        g.strokeStyle = glimR(i * 5.3) > 0.5 ? 'rgba(255,255,255,' + (0.04 + glimR(i) * 0.07) + ')' : 'rgba(0,0,20,' + (0.05 + glimR(i) * 0.08) + ')';
        g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 3, y + l * 0.5, x + 1, y + l); g.stroke();
      }
      for (var s = 0; s < 60; s++) { g.fillStyle = 'rgba(255,255,240,' + (0.3 + glimR(s * 7.1) * 0.5) + ')'; g.beginPath(); g.arc(glimR(s * 3.3 + 50) * w, glimR(s * 4.9 + 50) * h * 0.7, 0.6 + glimR(s) * 1.1, 0, Math.PI * 2); g.fill(); }
    }));
  }
  function auroraEyeTex(pal) {                                        // a goat's eye, but cute: a wide, soft-cornered pupil in an iris full of northern lights
    return new THREE.CanvasTexture(glimCanvas(256, 256, function (g, w, h) {
      g.fillStyle = '#06040c'; g.fillRect(0, 0, w, h);
      var ig = g.createRadialGradient(128, 140, 10, 128, 128, 100); ig.addColorStop(0, pal.iris[0]); ig.addColorStop(0.75, pal.iris[0]); ig.addColorStop(0.92, pal.iris[1]); ig.addColorStop(1, '#03020a');
      g.fillStyle = ig; g.beginPath(); g.arc(128, 128, 100, 0, Math.PI * 2); g.fill();
      ['rgba(120,255,200,0.35)', 'rgba(120,200,255,0.3)', 'rgba(200,140,255,0.3)'].forEach(function (c, k) {   // wavy bands of light across the iris
        g.strokeStyle = c; g.lineWidth = 10; g.beginPath();
        for (var x = 30; x <= 226; x += 6) { var y = 80 + k * 34 + Math.sin(x * 0.05 + k * 2) * 10; if (x === 30) g.moveTo(x, y); else g.lineTo(x, y); }
        g.stroke();
      });
      for (var r = 0; r < 70; r++) { var a = r / 70 * Math.PI * 2; g.strokeStyle = 'rgba(255,255,255,' + (0.05 + glimR(r * 3.1) * 0.1) + ')'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(128 + Math.cos(a) * 40, 128 + Math.sin(a) * 40); g.lineTo(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); g.stroke(); }
      g.fillStyle = '#05030a'; g.beginPath(); g.moveTo(78, 112); g.quadraticCurveTo(128, 100, 178, 112); g.quadraticCurveTo(190, 128, 178, 144); g.quadraticCurveTo(128, 156, 78, 144); g.quadraticCurveTo(66, 128, 78, 112); g.fill();   // the wide pupil
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.stroke();
      g.fillStyle = 'rgba(255,255,240,0.95)'; g.beginPath();            // a tiny star low in the iris
      for (var k2 = 0; k2 < 10; k2++) { var sa = -Math.PI / 2 + k2 * Math.PI / 5, sr = k2 % 2 ? 3 : 8; g[k2 ? 'lineTo' : 'moveTo'](152 + Math.cos(sa) * sr, 182 + Math.sin(sa) * sr); }
      g.closePath(); g.fill();
    }));
  }
  // Aurora Milk: pale, silky milk with the lights shimmering in it
  var auroraMilkIcon = glimCanvas(96, 96, function (g, w, h) {
    var glow = g.createRadialGradient(48, 56, 4, 48, 56, 46); glow.addColorStop(0, 'rgba(140,255,210,0.6)'); glow.addColorStop(1, 'rgba(140,200,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    function bottle() { g.beginPath(); g.moveTo(40, 12); g.lineTo(56, 12); g.lineTo(56, 28); g.quadraticCurveTo(70, 34, 70, 48); g.lineTo(70, 82); g.quadraticCurveTo(70, 88, 64, 88); g.lineTo(32, 88); g.quadraticCurveTo(26, 88, 26, 82); g.lineTo(26, 48); g.quadraticCurveTo(26, 34, 40, 28); g.closePath(); }
    g.fillStyle = 'rgba(230,245,255,0.5)'; bottle(); g.fill();
    var mg = g.createLinearGradient(26, 46, 70, 88); mg.addColorStop(0, '#f4fffb'); mg.addColorStop(0.35, '#c8fff0'); mg.addColorStop(0.65, '#d8e8ff'); mg.addColorStop(1, '#ecd8ff');
    g.fillStyle = mg; g.beginPath(); g.moveTo(27, 46); g.lineTo(69, 46); g.lineTo(69, 82); g.quadraticCurveTo(69, 87, 64, 87); g.lineTo(32, 87); g.quadraticCurveTo(27, 87, 27, 82); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(90,220,180,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(28, 62); g.bezierCurveTo(40, 54, 54, 70, 68, 58); g.stroke();   // a ribbon of light in the milk
    g.strokeStyle = 'rgba(170,120,255,0.6)'; g.beginPath(); g.moveTo(28, 74); g.bezierCurveTo(42, 66, 54, 80, 68, 70); g.stroke();
    g.strokeStyle = 'rgba(120,150,200,0.9)'; g.lineWidth = 2.5; bottle(); g.stroke();
    g.fillStyle = '#7ad8c8'; g.fillRect(38, 6, 20, 9);                // the stopper
    g.fillStyle = '#fff'; [[16, 30], [80, 40], [78, 78]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  ITEMS.auroraMilk = { name: 'Aurora Milk', price: 260, icon: '🥛', img: auroraMilkIcon, fill: 88, info: 'Silky milk with the northern lights shimmering in it, from a happy Auroraram. Feed and pet yours every day for two days in a row, then milk it the next morning with a Milk Pail. Sells for a very good price at the shipping bin.' };
  ITEMS.milkPail.info = 'For milking your Mooncalves and Auroraram. Keep it in your bag; it never wears out.';
  var auroraShopIcon = glimCanvas(128, 128, function (g, w, h) {      // a little portrait of one, for the shop
    var pal = AURORA_PALS[0];
    var sky = g.createRadialGradient(64, 60, 4, 64, 64, 64); sky.addColorStop(0, 'rgba(120,255,210,0.55)'); sky.addColorStop(1, 'rgba(120,180,255,0)'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    function furry(cx, cy, rx, ry, c1, c2) {                         // a soft, furry oval: a gradient, then fine hairs round its edge
      var gr = g.createLinearGradient(cx - rx, cy, cx + rx, cy); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
      g.fillStyle = gr; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = c2; g.lineWidth = 1;
      for (var k = 0; k < 90; k++) { var a = k / 90 * Math.PI * 2, x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 3, y + Math.sin(a) * 3); g.stroke(); }
    }
    g.fillStyle = '#2a4a8a'; [[40, 92], [54, 94], [76, 94], [88, 92]].forEach(function (p) { g.fillRect(p[0] - 4, p[1], 8, 22); });   // little legs
    g.fillStyle = '#cfe8ff'; [[40, 114], [54, 116], [76, 116], [88, 114]].forEach(function (p) { g.fillRect(p[0] - 4, p[1], 8, 4); });
    furry(62, 82, 34, 22, '#5a3ab8', '#2ab8a0');                    // the round body, the lights across it
    furry(84, 82, 12, 14, '#c8d4f4', '#e8eefa');                    // its fluffy pale bib
    furry(92, 48, 22, 21, '#2a4a9a', '#3a68b8');                    // the big round head
    g.fillStyle = '#d8e4f8'; g.beginPath(); g.ellipse(106, 58, 10, 8, 0, 0, Math.PI * 2); g.fill();   // pale muzzle
    g.fillStyle = '#7a80b8'; g.beginPath(); g.ellipse(113, 56, 4, 3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffc8d8'; g.beginPath(); g.ellipse(72, 46, 10, 5, -0.4, 0, Math.PI * 2); g.fill();   // the floppy ear
    g.strokeStyle = '#d8f6ff'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(88, 30); g.bezierCurveTo(76, 8, 60, 22, 70, 34); g.stroke();   // the ice horn
    g.fillStyle = '#06040c'; g.beginPath(); g.arc(97, 44, 8, 0, Math.PI * 2); g.fill();   // the big eye
    g.fillStyle = '#2ae0a0'; g.beginPath(); g.arc(98, 45, 6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#05030a'; g.fillRect(94, 44, 8, 3);
    g.fillStyle = '#fff'; g.beginPath(); g.arc(95, 41, 2.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,140,170,0.6)'; g.beginPath(); g.ellipse(100, 58, 5, 3, 0, 0, Math.PI * 2); g.fill();   // a rosy cheek
    g.fillStyle = '#fff'; [[14, 30], [40, 18], [116, 96]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  // building one: a round little body on chubby legs, all in soft fur, with a fluffy pale bib; a big round head with
  // a pale muzzle, big sparkly eyes, rosy cheeks, floppy ears, a forelock and a wee beard; spiralling horns of clear,
  // faceted ice; a ribbon collar with a snowflake charm; glowing split hooves; a short upturned tail; and the
  // northern lights drifting across all of it
  function auroraBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body); abRoom.add(root);
    var coatMap = auroraCoatTex(pal); coatMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var coatCol = new THREE.Color(pal.coat), coat2Col = new THREE.Color(pal.coat2), bellyCol = new THREE.Color(pal.belly);
    var coat = auroraLights(new THREE.MeshStandardMaterial({ map: coatMap, roughness: 0.55, metalness: 0.05 }), pal, 0.3, false);
    var plain = auroraLights(new THREE.MeshStandardMaterial({ color: coat2Col, roughness: 0.6 }), pal, 0.15, false);
    // its fur: real hairs, thousands to the inch. Layers of shells over each part, and in every layer a hair is drawn
    // wherever one grows from the skin below (each hair a little thinner toward its tip and its own length, darker at
    // the root where its neighbours shade it, a little lighter or darker than the next); the layers are combed over
    // the way the coat lies, so the hairs lean back along the body rather than standing on end
    var FUR_D = 620;                                                  // (hairs per metre along the skin)
    function furMat(col, gain, dens) {
      var m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.95 });
      m.onBeforeCompile = function (sh) {
        sh.uniforms.uFurD = { value: dens || FUR_D };
        sh.vertexShader = 'attribute float shellT;\nattribute vec3 furRoot;\nvarying float vShellT;\nvarying vec3 vFurRoot;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vShellT = shellT; vFurRoot = furRoot;');
        sh.fragmentShader = 'uniform float uFurD;\nvarying float vShellT;\nvarying vec3 vFurRoot;\nvec3 furHash(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }\n' + sh.fragmentShader.replace('#include <alphatest_fragment>', [
          '  vec3 fq = vFurRoot * uFurD, fb = floor(fq - 0.5), fR = vec3(0.0); float fBest = 9.0;',
          '  for (int i = 0; i < 2; i++) for (int j = 0; j < 2; j++) for (int k = 0; k < 2; k++) {',   // (the nearest hair root)
          '    vec3 fc = fb + vec3(float(i), float(j), float(k)), rr = furHash(fc); float fd = length(fq - fc - 0.2 - rr * 0.6);',
          '    if (fd < fBest) { fBest = fd; fR = rr; } }',
          '  float fLen = 0.5 + 0.5 * fR.x;',
          '  if (vShellT > 0.1 && (vShellT > fLen || fBest > 0.56 * (1.0 - vShellT / fLen * 0.8))) discard;',   // (the dense undercoat, then each hair, tapering)
          '  diffuseColor.rgb *= mix(0.5, 1.12, smoothstep(0.0, 1.0, vShellT / fLen)) * (0.8 + 0.35 * fR.y);'].join('\n'));
      };
      auroraLights(m, pal, gain, false);
      m.customProgramCacheKey = function () { return 'aurorafur'; };
      return m;
    }
    var shellMat = furMat(coat2Col.clone().multiplyScalar(1.35), 0.32), headFur = furMat(coat2Col.clone().multiplyScalar(1.35), 0.32, FUR_D * 1.45);
    var paleCol = bellyCol.clone().lerp(new THREE.Color(0xffffff), 0.55), paleFur = furMat(paleCol, 0.18), paleHead = furMat(paleCol, 0.18, FUR_D * 1.45);
    var paleMat = auroraLights(new THREE.MeshStandardMaterial({ color: paleCol.clone().multiplyScalar(0.8), roughness: 0.8 }), pal, 0.1, false);
    var seg = new THREE.SphereGeometry(1, 40, 28);
    function part(geo, mat, x, y, z, sx, sy, sz, parent, rx, ry, rz) { var m = abPart(geo, mat, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); m.scale.set(sx, sy, sz); return m; }
    // the fur shells over a part: sc is how the part is stretched, len how long its hair is, flow which way it lies
    function furShell(geo, n, len, sc, flow) {
      var pa = geo.attributes.position.array, na = geo.attributes.normal.array, cnt = geo.attributes.position.count;
      var ia = geo.index ? geo.index.array : null, ic = ia ? ia.length : cnt, fl = V3(flow[0], flow[1], flow[2]).normalize();
      var P2 = new Float32Array(cnt * n * 3), N2 = new Float32Array(cnt * n * 3), R2 = new Float32Array(cnt * n * 3), T2 = new Float32Array(cnt * n), I2 = new Uint32Array(ic * n);
      var p = new THREE.Vector3(), nn = new THREE.Vector3(), tg = new THREE.Vector3();
      for (var v = 0; v < cnt; v++) {
        p.set(pa[v * 3] * sc[0], pa[v * 3 + 1] * sc[1], pa[v * 3 + 2] * sc[2]);
        nn.set(na[v * 3] / sc[0], na[v * 3 + 1] / sc[1], na[v * 3 + 2] / sc[2]).normalize();
        tg.copy(fl).addScaledVector(nn, -fl.dot(nn));                 // (the way the hair is combed, along the skin)
        for (var k = 0; k < n; k++) {
          var f = (k + 1) / n, o = (k * cnt + v) * 3, out = len * f, lean = len * f * f * 2.1;   // (each hair curving over as it grows)
          P2[o] = p.x + nn.x * out + tg.x * lean; P2[o + 1] = p.y + nn.y * out + tg.y * lean; P2[o + 2] = p.z + nn.z * out + tg.z * lean;
          N2[o] = nn.x; N2[o + 1] = nn.y; N2[o + 2] = nn.z; R2[o] = p.x; R2[o + 1] = p.y; R2[o + 2] = p.z;
          T2[k * cnt + v] = 0.04 + (k / (n - 1)) * 0.96;
        }
      }
      for (var k2 = 0; k2 < n; k2++) for (var q = 0; q < ic; q++) I2[k2 * ic + q] = (ia ? ia[q] : q) + k2 * cnt;
      var g2 = new THREE.BufferGeometry();
      g2.setAttribute('position', new THREE.BufferAttribute(P2, 3)); g2.setAttribute('normal', new THREE.BufferAttribute(N2, 3));
      g2.setAttribute('furRoot', new THREE.BufferAttribute(R2, 3)); g2.setAttribute('shellT', new THREE.BufferAttribute(T2, 1)); g2.setIndex(new THREE.BufferAttribute(I2, 1));
      return g2;
    }
    function silky(x, y, z, sx, sy, sz, parent, len, rx, mat, flow) {
      var sh = abPart(furShell(seg, 20, len, [sx, sy, sz], flow || [0, -0.25, -1]), mat || shellMat, x, y, z, rx || 0, 0, 0, parent || body); sh.castShadow = false; return sh;
    }
    function plush(geo, len, flow, mat) { return furShell(geo, 18, len, [1, 1, 1], flow); }
    // its long hair: thousands of fine strands, each hanging from where it grows and swinging out a little, dark at the
    // root and pale toward the tip, where the lights glow brightest; drawn in batches (body, neck, beard, legs, tail)
    // its hair is drawn in soft locks: each lock a gently waving ribbon painted with dozens of fine strands, gathered at
    // the root, parting and fading toward the tips (so the coat looks soft and silky rather than wiry), dark at the
    // root and pale at the tip; long locks are two ribbons crossed, so they look full from every side
    var lockTex = new THREE.CanvasTexture(glimCanvas(96, 384, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      for (var n = 0; n < 70; n++) {
        var x0 = w / 2 + (glimR(n * 2.3 + 1) - 0.5) * w * 0.5, x1 = w / 2 + (glimR(n * 3.1 + 2) - 0.5) * w * 0.95, end = h * (0.72 + glimR(n * 4.7) * 0.27), ph = glimR(n * 5.3) * 6, edge = Math.abs(x1 - w / 2) / (w / 2);
        g.lineWidth = 0.8 + glimR(n * 6.1) * 1.4; g.lineCap = 'round';
        for (var y = 0; y < end; y += 6) {                              // each strand fading out toward its tip, the outer ones softer
          var f0 = y / end, f1 = Math.min(1, (y + 6) / end);
          var ax = x0 + (x1 - x0) * f0 + Math.sin(f0 * 7 + ph) * 3 * f0, bx = x0 + (x1 - x0) * f1 + Math.sin(f1 * 7 + ph) * 3 * f1;
          g.strokeStyle = 'rgba(255,255,255,' + ((1 - Math.pow(f0, 2.2)) * (1 - edge * 0.55) * (0.6 + glimR(n * 7.3) * 0.4)).toFixed(3) + ')';
          g.beginPath(); g.moveTo(ax, y); g.lineTo(bx, Math.min(end, y + 6)); g.stroke();
        }
      }
    }));
    lockTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var lockGeo = (function () {
      var geo = new THREE.PlaneGeometry(1, 1, 2, 10).translate(0, -0.5, 0), p = geo.attributes.position, cols = [];
      for (var i = 0; i < p.count; i++) {
        var f = -p.getY(i), x = p.getX(i);
        p.setZ(i, Math.sin(f * 6.5) * 0.06 * f - x * x * 0.25);         // (a soft wave down its length, cupped a little across)
        cols.push(0.4 + f * 0.6, 0.4 + f * 0.6, 0.4 + f * 0.6);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
      return geo;
    })();
    var strandMat = auroraLights(new THREE.MeshStandardMaterial({ map: lockTex, color: 0xffffff, vertexColors: true, alphaTest: 0.28, side: THREE.DoubleSide, roughness: 0.62, metalness: 0.05 }), pal, 1.05, true);
    var hairGroups = [];
    function strands(parent, list, mat) {                            // list: [x, y, z, dirx, diry, dirz, length, colour]; each a soft lock (two crossed, if long), drawn in one batch
      var n = 0; list.forEach(function (s2) { n += s2[6] > 0.07 ? 2 : 1; });
      var im = new THREE.InstancedMesh(lockGeo, mat || strandMat, n), mx = new THREE.Matrix4(), q = new THREE.Quaternion(), q2 = new THREE.Quaternion(), sc = new THREE.Vector3(), d = new THREE.Vector3(), down = V3(0, -1, 0), pos = new THREE.Vector3(), k = 0;
      list.forEach(function (s2, i) {
        d.set(s2[3], s2[4], s2[5]).normalize(); var len = s2[6], wd = Math.max(0.007, Math.min(0.034, len * 0.24)), tw = glimR(i * 3.7 + list.length) * 6.28;
        for (var c = 0; c < (len > 0.07 ? 2 : 1); c++) {
          q.setFromUnitVectors(down, d); q2.setFromAxisAngle(down, tw + c * 1.4); q.multiply(q2);
          sc.set(wd, len, len); pos.set(s2[0], s2[1], s2[2]); mx.compose(pos, q, sc); im.setMatrixAt(k, mx); im.setColorAt(k, s2[7]); k++;
        }
      });
      im.castShadow = true; parent.add(im); hairGroups.push(im); return im;
    }
    function hairCol(j, k) {                                          // (the strand's own colours dim it toward the root; now and then one catches the light like a star)
      var c = coatCol.clone().lerp(coat2Col, 0.3 + glimR(j) * 0.4).lerp(bellyCol, k || 0).multiplyScalar(2.2);
      return glimR(j * 1.37 + 5) < 0.03 ? c.lerp(new THREE.Color(1.6, 1.6, 1.7), 0.7) : c;
    }
    function onBall(c, r, rx, i, seed) {                              // a random point on a (tilted) egg shape, and which way is out
      var u = glimR(i * 1.91 + seed) * Math.PI * 2, v = Math.asin(glimR(i * 2.73 + seed) * 2 - 1), cv = Math.cos(v);
      var o = V3(Math.sin(u) * cv * r[0], Math.sin(v) * r[1], Math.cos(u) * cv * r[2]), nn = V3(o.x / (r[0] * r[0]), o.y / (r[1] * r[1]), o.z / (r[2] * r[2]));
      if (rx) { o.applyAxisAngle(V3(1, 0, 0), rx); nn.applyAxisAngle(V3(1, 0, 0), rx); }
      return [c[0] + o.x, c[1] + o.y, c[2] + o.z, nn.x, nn.y, nn.z];
    }
    // a sleek, graceful body: a deep chest and shoulders with the withers rising over them, a rounded barrel, a soft
    // belly and strong haunches, all in a short, velvety coat that the lights ripple across
    var BY = 0.4, BODY = [0, BY, -0.01], BR = [0.12, 0.125, 0.2];   // (round and short, like a little kid)
    var shape = [[BODY, BR], [[0, BY, 0.12], [0.11, 0.128, 0.11]], [[0, BY + 0.012, -0.13], [0.116, 0.125, 0.115]], [[0, BY + 0.085, 0.08], [0.05, 0.04, 0.07]], [[0, BY - 0.06, 0.0], [0.096, 0.07, 0.15]]];
    shape.forEach(function (sp2) { part(seg, coat, sp2[0][0], sp2[0][1], sp2[0][2], sp2[1][0], sp2[1][1], sp2[1][2]); });
    shape.forEach(function (sp2, k) { silky(sp2[0][0], sp2[0][1], sp2[0][2], sp2[1][0], sp2[1][1], sp2[1][2], body, k === 3 ? 0.017 : 0.014); });   // a thick, soft coat all over
    var pale = [[0, BY + 0.005, 0.165], [0.078, 0.095, 0.07]];             // a pale, fluffy chest and a pale tummy
    part(seg, paleMat, pale[0][0], pale[0][1], pale[0][2], pale[1][0], pale[1][1], pale[1][2]); silky(pale[0][0], pale[0][1], pale[0][2], pale[1][0], pale[1][1], pale[1][2], body, 0.024, 0, paleFur, [0, -1, 0.15]);   // (its fluffy bib, the fur long and soft)
    part(seg, paleMat, 0, BY - 0.075, 0.0, 0.07, 0.05, 0.13); silky(0, BY - 0.075, 0.0, 0.07, 0.05, 0.13, body, 0.014, 0, paleFur, [0, -0.2, -1]);
    var starMat = new THREE.MeshBasicMaterial({ color: 0xfffbe8, transparent: true, opacity: 0.9, side: THREE.DoubleSide }), starGeo = (function () {   // little stars dappled over its haunches, like a fawn's spots
      var sh = new THREE.Shape(); for (var k = 0; k < 8; k++) { var a = k * Math.PI / 4, r = k % 2 ? 0.35 : 1; sh[k ? 'lineTo' : 'moveTo'](Math.sin(a) * r, Math.cos(a) * r); } return new THREE.ShapeGeometry(sh);
    })();
    for (var st2 = 0, sn = 0; st2 < 400 && sn < 26; st2++) {
      var hs = shape[2], sp4 = onBall(hs[0], hs[1], 0, st2, 8800);
      if (sp4[4] < 0.1 / hs[1][1] || Math.abs(sp4[3]) < 0.3 / hs[1][0]) continue;
      var sn3 = V3(sp4[3], sp4[4], sp4[5]).normalize(), sm = new THREE.Mesh(starGeo, starMat), sr2 = 0.004 + glimR(st2 * 3.3) * 0.004;
      sm.position.set(sp4[0], sp4[1], sp4[2]).addScaledVector(sn3, 0.016); sm.lookAt(sm.position.clone().add(sn3)); sm.rotateZ(glimR(st2) * 3); sm.scale.setScalar(sr2); body.add(sm); sn++;
    }
    // the neck, rising forward
    var neck = new THREE.CatmullRomCurve3([V3(0, BY + 0.02, 0.14), V3(0, BY + 0.1, 0.18), V3(0, BY + 0.17, 0.205)]);   // (short, holding up its big head)
    (function () {                                                    // one smooth neck, tapering up to the head
      var TS = 24, RS = 18, geo = new THREE.TubeGeometry(neck, TS, 1, RS, false), p = geo.attributes.position;
      for (var i = 0; i <= TS; i++) { var t = i / TS, c = neck.getPointAt(t), r = 0.058 - t * 0.01; for (var j = 0; j <= RS; j++) { var k = i * (RS + 1) + j; p.setXYZ(k, c.x + (p.getX(k) - c.x) * r * 0.85, c.y + (p.getY(k) - c.y) * r, c.z + (p.getZ(k) - c.z) * r); } }
      geo.computeVertexNormals(); abPart(geo, plain, 0, 0, 0, 0, 0, 0, body);
      abPart(plush(geo, 0.012, [0, -1, -0.5]), shellMat, 0, 0, 0, 0, 0, 0, body).castShadow = false;   // and the same soft coat on it
    })();
    // a velvet ribbon collar round its neck, with a little bow, and a charm hanging from it: a snowflake of glowing ice
    var cT = 0.28, cP = neck.getPointAt(cT), cTan = neck.getTangentAt(cT), cFront = V3(0, -cTan.z, cTan.y); if (cFront.z < 0) cFront.negate();
    var ribbonMat = new THREE.MeshPhysicalMaterial({ color: pal.lights[1], roughness: 0.55, sheen: new THREE.Color(0xffffff), emissive: pal.lights[1], emissiveIntensity: 0.12 });
    var collar = new THREE.Group(); collar.position.copy(cP); collar.quaternion.setFromUnitVectors(V3(0, 0, 1), cTan); body.add(collar);
    var band = new THREE.Mesh(new THREE.TorusGeometry(1, 0.13, 10, 48), ribbonMat); band.scale.set(0.054, 0.062, 0.054); collar.add(band);
    [-1, 1].forEach(function (s) { var edge = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 48), new THREE.MeshStandardMaterial({ color: 0xf6e6b0, metalness: 0.7, roughness: 0.3 })); edge.position.z = s * 0.0055; edge.scale.set(0.055, 0.063, 0.055); collar.add(edge); });   // gold edging
    var charmAt = cP.clone().addScaledVector(cFront, 0.064), charm = new THREE.Group(); charm.position.copy(charmAt); body.add(charm);
    abPart(new THREE.TorusGeometry(0.005, 0.0013, 6, 14), new THREE.MeshStandardMaterial({ color: 0xf6e6b0, metalness: 0.8, roughness: 0.25 }), 0, 0, 0, 0, Math.PI / 2, 0, charm);   // the little ring it hangs from
    var flakeMat = new THREE.MeshPhysicalMaterial({ color: pal.horn, roughness: 0.05, metalness: 0.1, clearcoat: 1, emissive: pal.hornGlow, emissiveIntensity: 0.7, flatShading: true });
    var flake = new THREE.Group(); flake.position.set(0, -0.026, 0.006); charm.add(flake);
    abPart(new THREE.CylinderGeometry(0.006, 0.006, 0.004, 6), flakeMat, 0, 0, 0, Math.PI / 2, 0, 0, flake);
    for (var fa2 = 0; fa2 < 6; fa2++) {                               // six arms, each with two little branches
      var arm = new THREE.Group(); arm.rotation.z = fa2 * Math.PI / 3; flake.add(arm);
      abPart(new THREE.BoxGeometry(0.0032, 0.021, 0.003), flakeMat, 0, 0.0105, 0, 0, 0, 0, arm);
      [-1, 1].forEach(function (s) { abPart(new THREE.BoxGeometry(0.0024, 0.008, 0.0026), flakeMat, s * 0.003, 0.014, 0, 0, 0, s * -0.8, arm); });
      abPart(new THREE.OctahedronGeometry(0.0026, 0), flakeMat, 0, 0.022, 0, 0, 0, 0, arm);
    }
    var flakeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.hornGlow, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    flakeGlow.scale.set(0.11, 0.11, 1); flakeGlow.position.copy(flake.position); charm.add(flakeGlow);
    var bowAt = cP.clone().addScaledVector(cFront, -0.058).add(V3(0, 0.01, 0)), bowG = new THREE.Group(); bowG.position.copy(bowAt); bowG.lookAt(bowAt.clone().sub(cFront)); body.add(bowG);   // a bow at the back of its neck
    [-1, 1].forEach(function (s) { var lo = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0045, 8, 18), ribbonMat); lo.position.set(s * 0.013, 0, 0); lo.scale.set(1.2, 0.75, 0.5); lo.rotation.z = s * 0.25; bowG.add(lo);
      var tl = new THREE.Shape(); tl.moveTo(-0.004, 0); tl.lineTo(0.004, 0); tl.lineTo(0.006, -0.026); tl.lineTo(0, -0.021); tl.lineTo(-0.002, -0.028); tl.closePath();
      var tm2 = new THREE.Mesh(new THREE.ShapeGeometry(tl), new THREE.MeshPhysicalMaterial({ color: pal.lights[1], roughness: 0.55, side: THREE.DoubleSide })); tm2.position.set(s * 0.003, -0.003, 0.002); tm2.rotation.z = s * 0.35; bowG.add(tm2); });
    var knot = new THREE.Mesh(new THREE.SphereGeometry(0.0065, 12, 10), ribbonMat); knot.scale.set(1, 1.1, 0.8); bowG.add(knot);
    // the head: big and round (for a cute look), a short soft muzzle with a little nose and a smile, big sparkly eyes,
    // fluffy cheeks, soft drooping ears, a forelock and a wee beard
    var head = new THREE.Group(); head.position.set(0, BY + 0.24, 0.235); head.rotation.x = 0.2; head.scale.setScalar(1.45); body.add(head);   // (a big head, for a cute look)
    part(seg, plain, 0, 0.005, -0.005, 0.05, 0.056, 0.062, head);                 // the domed skull
    silky(0, 0.005, -0.005, 0.05, 0.056, 0.062, head, 0.0065, 0, headFur, [0, 0.3, -1]);
    part(seg, plain, 0, -0.02, 0.048, 0.038, 0.04, 0.058, head, 0.3);             // its short, sweet face
    part(seg, paleMat, 0, -0.042, 0.088, 0.029, 0.027, 0.028, head, 0.25);        // the soft, round muzzle, pale like a fawn's
    part(seg, paleMat, 0, -0.058, 0.078, 0.022, 0.014, 0.024, head, 0.2);         // the chin
    var noseMat = new THREE.MeshPhysicalMaterial({ color: pal.nose, roughness: 0.4, clearcoat: 0.3 });
    part(seg, noseMat, 0, -0.036, 0.113, 0.017, 0.012, 0.008, head, 0.25);        // the little nose
    var nostril = new THREE.MeshStandardMaterial({ color: 0x241a34, roughness: 0.5 });
    [-1, 1].forEach(function (s) { part(seg, nostril, s * 0.0075, -0.035, 0.12, 0.0052, 0.0022, 0.003, head, 0.25, s * 0.3, s * 0.9); });   // slanted nostrils
    abPart(new THREE.BoxGeometry(0.001, 0.01, 0.003), nostril, 0, -0.045, 0.116, 0.3, 0, 0, head);
    [-1, 1].forEach(function (s) { abPart(new THREE.TorusGeometry(0.008, 0.0013, 5, 12, Math.PI * 0.85), nostril, s * 0.0075, -0.053, 0.108, 0.6, 0, Math.PI * 1.07, head); });   // a little smile
    silky(0, -0.02, 0.048, 0.038, 0.04, 0.058, head, 0.005, 0.3, headFur, [0, 0.5, -1]);                  // a short, plush coat over its face
    silky(0, -0.042, 0.088, 0.029, 0.027, 0.028, head, 0.0035, 0.25, paleHead, [0, 0.4, -1]);
    silky(0, -0.058, 0.078, 0.022, 0.014, 0.024, head, 0.0045, 0.2, paleHead, [0, -0.5, -1]);
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x06040c, roughness: 0.05, metalness: 0.2 });
    var irisMat = new THREE.MeshStandardMaterial({ map: auroraEyeTex(pal), roughness: 0.15, emissive: 0xffffff, emissiveIntensity: 0.45 }); irisMat.emissiveMap = irisMat.map;
    var corneaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.02, metalness: 0.1, depthWrite: false });
    var irisGeo = new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, 1.05); irisGeo.rotateX(Math.PI / 2);
    (function () { var ps = irisGeo.attributes.position, uv = irisGeo.attributes.uv, k = 0.46 / Math.sin(1.05); for (var i = 0; i < ps.count; i++) uv.setXY(i, 0.5 + ps.getX(i) * k, 0.5 + ps.getY(i) * k); uv.needsUpdate = true; })();
    var lidMat = new THREE.MeshStandardMaterial({ color: coat2Col, roughness: 0.8, side: THREE.DoubleSide }), lashMat = new THREE.MeshStandardMaterial({ color: 0x0a0818, roughness: 0.6 }), lids = [];
    var lidGeo = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42);
    [-1, 1].forEach(function (s) {
      var ey = new THREE.Group(); ey.position.set(s * 0.036, 0.014, 0.038); ey.rotation.set(0.05, s * 0.62, 0); head.add(ey);   // (big, round, and looking forward)
      var RX = 0.026, RY = 0.025, RZ = 0.016;
      part(seg, eyeMat, 0, 0, 0, RX, RY, RZ, ey);
      abPart(irisGeo, irisMat, 0, 0, 0, 0, 0, 0, ey).scale.set(RX * 1.01, RY * 1.01, RZ * 1.01);
      var co = abPart(irisGeo, corneaMat, 0, 0, 0, 0, 0, 0, ey); co.scale.set(RX * 1.06, RY * 1.06, RZ * 1.18); co.castShadow = false;
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.009, 0.01, RZ * 1.02, 0.0075, 0.0075, 0.002, ey);   // big sparkly catchlights
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.002, 0.014, RZ, 0.0028, 0.0028, 0.001, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }), 0.009, -0.009, RZ * 0.98, 0.0038, 0.0032, 0.001, ey);
      var lg = new THREE.Group(); ey.add(lg); lids.push(lg); lg.visible = false;
      abPart(lidGeo, lidMat, 0, 0, 0, 0, 0, 0, lg).scale.set(RX * 1.15, RY * 1.15, RZ * 1.3);
      [0.2, 0.42, 0.65, 0.9, 1.15].forEach(function (a, n) {         // long lashes along the top
        var len = 0.011 - n * 0.0012, lash = abPart(new THREE.ConeGeometry(0.0009, len, 5).translate(0, len / 2, 0), lashMat, s * Math.cos(a) * RX * 1.08, Math.sin(a) * RY * 1.1, RZ * 0.35, 0.5, 0, -Math.atan2(s * Math.cos(a) * 1.3, Math.sin(a) + 0.6), ey);
        lash.castShadow = false;
      });
      var bl = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.026), new THREE.MeshBasicMaterial({ map: moonBlushTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      bl.position.set(s * 0.042, -0.026, 0.058); bl.rotation.set(0, s * 0.9, 0); bl.scale.setScalar(1.15); head.add(bl);
    });
    [-1, 1].forEach(function (s) {                                   // fluffy tufts on its cheeks
      var ct = [];
      for (var c2 = 0; c2 < 70; c2++) { var ca = glimR(c2 * 2.9 + s * 13) * 1.6 - 0.8; ct.push([s * 0.046, -0.03 + Math.sin(ca) * 0.012, 0.012 + Math.cos(ca) * 0.008, s * 1, -0.5 + ca * 0.3, -0.25, 0.018 + glimR(c2 * 3.7 + s) * 0.014, hairCol(c2 + 14000 + s * 99, 0.4).lerp(paleCol, 0.4)]); }
      strands(head, ct);
    });
    var ears = [];
    var innerEar = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.nose).lerp(new THREE.Color(0xffc8d8), 0.55), roughness: 0.75, emissive: 0xff90b0, emissiveIntensity: 0.08 });
    [-1, 1].forEach(function (s) {                                   // soft, floppy ears held out to the sides, pink inside
      var ep = new THREE.Group(); ep.position.set(s * 0.044, 0.016, -0.016); head.add(ep); ears.push({ g: ep, s: s });
      var hang = new THREE.Group(); hang.rotation.set(0.2, s * 0.4, s * 1.0); ep.add(hang);   // (out and drooping a little)
      part(seg, plain, 0, -0.006, 0, 0.011, 0.012, 0.009, hang);                     // its base
      part(seg, plain, 0, -0.036, 0, 0.02, 0.04, 0.008, hang);                       // the ear: a soft, rounded leaf
      silky(0, -0.036, -0.001, 0.02, 0.04, 0.008, hang, 0.0035, 0, headFur, [0, -1, 0]);
      var inner = part(seg, innerEar, 0, -0.035, 0.0072, 0.0145, 0.031, 0.0045, hang); inner.castShadow = false;
      var eh = [];                                                   // a soft fringe round the edge
      for (var e2 = 0; e2 < 70; e2++) { var ea = -Math.PI / 2 + (glimR(e2 * 3.1 + s * 9) - 0.5) * 2.6; eh.push([Math.cos(ea) * 0.02, -0.036 + Math.sin(ea) * 0.04, 0, Math.cos(ea), Math.sin(ea), 0.2, 0.01 + glimR(e2 * 7.7) * 0.008, hairCol(e2 + 9000, 0.2).lerp(paleCol, 0.3)]); }
      strands(hang, eh);
    });
    var beardHair = [], foreHair = [];
    for (var b2 = 0; b2 < 260; b2++) { var bt = glimR(b2 * 2.9 + 600), ba = (glimR(b2 * 3.7 + 600) - 0.5) * 1.6; beardHair.push([Math.sin(ba) * 0.02, -0.06 + bt * 0.01, 0.07 + Math.cos(ba) * 0.02 - bt * 0.05, Math.sin(ba) * 0.15, -1, 0.1, 0.07 + (1 - Math.abs(ba)) * 0.07 + glimR(b2 * 5.1) * 0.03, hairCol(b2 + 9500, 0.1)]); }
    for (var f2 = 0; f2 < 170; f2++) {                               // a soft forelock, each lock growing from the top of its head and falling forward over its brow
      var fu = (glimR(f2 * 2.3 + 700) - 0.5) * 1.5, fv = 0.75 + glimR(f2 * 3.1 + 700) * 0.6, fcv = Math.cos(fv);
      var fo = V3(Math.sin(fu) * fcv * 0.05, Math.sin(fv) * 0.056, Math.cos(fu) * fcv * 0.062), fn = V3(fo.x / 0.0025, fo.y / 0.003136, fo.z / 0.003844).normalize();
      var fdir = V3(Math.sin(fu) * 0.3, -0.35, 1); fdir.addScaledVector(fn, -fdir.dot(fn)).normalize().addScaledVector(fn, 0.3);
      foreHair.push([fo.x * 0.97, 0.005 + fo.y * 0.97, -0.005 + fo.z * 0.97, fdir.x, fdir.y, fdir.z, 0.03 + glimR(f2 * 4.1) * 0.025, hairCol(f2 + 9800, 0.1)]);
    }
    var beard = new THREE.Group(); beard.position.set(0, 0.01, -0.012); beard.scale.setScalar(0.55); head.add(beard); strands(beard, beardHair);   // (just a wee tuft)
    strands(head, foreHair);
    // the horns: spiralling back and round beside the ears, clear faceted ice with ridges round them, glowing within
    var frost = new THREE.CanvasTexture(glimCanvas(512, 64, function (g, w, h) {   // the ice: growth rings along it, feathery frost and tiny trapped bubbles
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
      for (var x = 0; x < w; x++) { var t = x / w, ring = Math.max(0, Math.sin(t * 70)); g.fillStyle = 'rgba(120,170,210,' + (0.08 + ring * 0.22) * (1 - t * 0.6) + ')'; g.fillRect(x, 0, 1, h); }
      g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1;
      for (var f3 = 0; f3 < 60; f3++) {                                // feathery frost, branching as it grows
        var fx = glimR(f3 * 3.1 + 11) * w, fy = glimR(f3 * 4.3 + 11) * h, fa = glimR(f3 * 5.7) * 6.28;
        for (var br = 0; br < 5; br++) { var bl = 5 + glimR(f3 * 7 + br) * 10, ex = fx + Math.cos(fa) * bl, ey = fy + Math.sin(fa) * bl; g.beginPath(); g.moveTo(fx, fy); g.lineTo(ex, ey); g.stroke(); g.beginPath(); g.moveTo((fx + ex) / 2, (fy + ey) / 2); g.lineTo((fx + ex) / 2 + Math.cos(fa + 0.8) * bl * 0.4, (fy + ey) / 2 + Math.sin(fa + 0.8) * bl * 0.4); g.stroke(); fx = ex; fy = ey; fa += (glimR(f3 * 9 + br) - 0.5) * 1.4; }
      }
      for (var bb = 0; bb < 90; bb++) { g.strokeStyle = 'rgba(140,190,230,0.6)'; g.beginPath(); g.arc(glimR(bb * 2.3 + 5) * w, glimR(bb * 3.9 + 5) * h, 0.8 + glimR(bb) * 1.6, 0, Math.PI * 2); g.stroke(); }
    }));
    frost.wrapT = THREE.RepeatWrapping; frost.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var hornMat = new THREE.MeshPhysicalMaterial({ map: frost, emissiveMap: frost, color: pal.horn, roughness: 0.05, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.86, emissive: pal.hornGlow, emissiveIntensity: 0.25, flatShading: true });
    auroraLights(hornMat, pal, 0.35, false);
    var coreMat = new THREE.MeshBasicMaterial({ color: pal.hornGlow, transparent: true, opacity: 0.55, depthWrite: false });
    var hornGlows = [];
    [-1, 1].forEach(function (s) {
      var pts = [];
      for (var hi = 0; hi <= 40; hi++) { var t = hi / 40, a = t * Math.PI * 1.7, R = 0.042 * (1 - 0.4 * t); pts.push(V3(s * (0.022 + t * 0.07), 0.045 + R * Math.sin(a), R * Math.cos(a) - 0.042)); }   // (up, back, and curling down round the ear)
      var curve = new THREE.CatmullRomCurve3(pts), TS = 120, RS = 7;
      function tapered(r0, r1) {
        var geo = new THREE.TubeGeometry(curve, TS, 1, RS, false), p = geo.attributes.position;
        var off = new THREE.Vector3(), tq = new THREE.Quaternion();
        for (var i = 0; i <= TS; i++) {
          var t = i / TS, c = curve.getPointAt(t), r = (r0 + (r1 - r0) * t) * (1 + 0.14 * Math.max(0, Math.sin(t * 70)) * (1 - t));   // (tapering, with ridges of ice round it)
          tq.setFromAxisAngle(curve.getTangentAt(t), t * Math.PI * 3);   // (and twisted, so its facets spiral)
          for (var j = 0; j <= RS; j++) { var k = i * (RS + 1) + j; off.set(p.getX(k) - c.x, p.getY(k) - c.y, p.getZ(k) - c.z).applyQuaternion(tq).multiplyScalar(r); p.setXYZ(k, c.x + off.x, c.y + off.y, c.z + off.z); }
        }
        geo.computeVertexNormals(); return geo;
      }
      var hornM = new THREE.Mesh(tapered(0.012, 0.0015), hornMat); hornM.castShadow = true; hornM.renderOrder = 2; head.add(hornM);
      var core = new THREE.Mesh(tapered(0.0045, 0.0006), coreMat); head.add(core);
      var tip = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: pal.hornGlow, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
      tip.scale.set(0.04, 0.04, 1); tip.position.copy(curve.getPointAt(1)); head.add(tip); hornGlows.push(tip);
      var hg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.hornGlow, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
      hg.scale.set(0.12, 0.12, 1); hg.position.copy(curve.getPointAt(0.45)); head.add(hg); hornGlows.push(hg);
    });
    // long, slender legs: a feathered upper leg, a knee, a fine lower leg with long hair round the fetlock, and glowing
    // split hooves with dewclaws
    var hoofMat = new THREE.MeshPhysicalMaterial({ color: pal.hoof, roughness: 0.2, clearcoat: 1, emissive: pal.glow, emissiveIntensity: 0.4 });
    var cleft = new THREE.MeshStandardMaterial({ color: 0x3a3a5a, roughness: 0.5 });
    var legs = [];
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (lp) {
      var front = lp[1] > 0, hip = new THREE.Group(); hip.position.set(lp[0] * 0.066, BY - 0.06, front ? 0.13 : -0.14); body.add(hip);
      part(seg, coat, lp[0] * 0.006, 0.0, front ? 0.005 : -0.01, 0.038, 0.07, front ? 0.046 : 0.06, hip);   // its shoulder or thigh, tucked into the body
      silky(lp[0] * 0.006, 0.0, front ? 0.005 : -0.01, 0.038, 0.07, front ? 0.046 : 0.06, hip, 0.012, 0, shellMat, [0, -1, -0.3]);
      var upper = new THREE.CylinderGeometry(0.021, 0.03, 0.12, 16, 6); part(upper, plain, 0, -0.06, 0, 1, 1, 1, hip);
      abPart(plush(upper, 0.009, [0, -1, 0]), shellMat, 0, -0.06, 0, 0, 0, 0, hip).castShadow = false;   // (chubby little legs, soft all over)
      var knee = new THREE.Group(); knee.position.set(0, -0.12, front ? 0 : -0.015); hip.add(knee);
      part(seg, plain, 0, 0, 0, 0.02, 0.022, 0.02, knee);
      var cannon = new THREE.CylinderGeometry(0.015, 0.019, 0.18, 14, 8); part(cannon, plain, 0, -0.09, 0, 1, 1, 1, knee);
      abPart(plush(cannon, 0.006, [0, -1, 0]), shellMat, 0, -0.09, 0, 0, 0, 0, knee).castShadow = false;
      part(seg, plain, 0, -0.18, 0, 0.017, 0.015, 0.017, knee);     // the fetlock
      [-1, 1].forEach(function (s) { abPart(new THREE.CylinderGeometry(0.008, 0.012, 0.024, 10), hoofMat, s * 0.0078, -0.198, 0.004, 0.1, 0, 0, knee).scale.set(1, 1, 1.25); });
      abPart(new THREE.BoxGeometry(0.0025, 0.022, 0.02), cleft, 0, -0.198, 0.01, 0.1, 0, 0, knee);
      [-1, 1].forEach(function (s) { abPart(new THREE.SphereGeometry(0.0045, 8, 6), hoofMat, s * 0.009, -0.178, -0.016, 0, 0, 0, knee); });
      var lh = [];
      for (var l2 = 0; l2 < 120; l2++) { var la = glimR(l2 * 3.3 + lp[0] * 5 + lp[1] * 9) * Math.PI * 2; lh.push([Math.sin(la) * 0.018, -0.14 - glimR(l2 * 1.7) * 0.03, Math.cos(la) * 0.018, Math.sin(la) * 0.4, -1, Math.cos(la) * 0.4, 0.045 + glimR(l2 * 5.9) * 0.025, hairCol(l2 + 10000 + lp[0] * 300 + lp[1] * 600, 0.2)]); }
      strands(knee, lh);                                             // long hair round each fetlock
      legs.push({ hip: hip, knee: knee, ph: lp[0] * lp[1] > 0 ? 0 : Math.PI, front: front });
    });
    // a short, upturned tail of silky hair
    var tail = new THREE.Group(); tail.position.set(0, BY + 0.08, -0.215); tail.rotation.x = -0.6; body.add(tail);
    part(seg, plain, 0, 0.02, 0, 0.018, 0.035, 0.018, tail);
    var th = [];
    for (var t3 = 0; t3 < 160; t3++) { var ta = glimR(t3 * 2.7 + 900) * Math.PI * 2; th.push([Math.sin(ta) * 0.01, 0.04, Math.cos(ta) * 0.01, Math.sin(ta) * 0.4, 1, Math.cos(ta) * 0.4 - 0.4, 0.05 + glimR(t3 * 4.3) * 0.04, hairCol(t3 + 12000, 0.3)]); }
    strands(tail, th);
    // motes of light drifting up off its coat, and a soft glow round it
    var sparks = [];
    for (var sk = 0; sk < 12; sk++) { var spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: pal.lights[sk % 3], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); spr.scale.set(0.035, 0.035, 1); root.add(spr); sparks.push({ s: spr, t: glimR(sk + 90) * 2, x: 0, y: 0, z: 0 }); }
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.4, 1.4, 1); glow.position.set(0, 0.5, 0); root.add(glow);
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.42, 0.1575, 1); tag.position.set(0, 1.12, 0); tag.renderOrder = 6; root.add(tag);
    return { root: root, body: body, head: head, ears: ears, beard: beard, charm: charm, flakeMat: flakeMat, flakeGlow: flakeGlow, legs: legs, tail: tail, lids: lids, hair: hairGroups, hornGlows: hornGlows, hornMat: hornMat, hoofMat: hoofMat, sparks: sparks, glow: glow, tagCv: tagCv, tagTex: tagTex, prance: 0 };
  }
  // when it's ready to milk, a shimmering drop of Aurora Milk floats over it
  function auroraBuildExtras(g) {
    var sz = GLIM_STALLS[g.stall], pal = AURORA_PALS[g.pal % AURORA_PALS.length];
    var drop = new THREE.Group(); abRoom.add(drop);
    var ds = new THREE.Sprite(new THREE.SpriteMaterial({ map: moonDropTex, color: 0xd8fff0, transparent: true, depthWrite: false })); ds.scale.set(0.16, 0.16, 1); drop.add(ds);
    var eg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    eg.scale.set(0.42, 0.42, 1); drop.add(eg);
    g.eggMesh = drop; g.eggGlow = eg;
    var hay = abPart(wbLumpGeo(300 + g.stall, 0.25), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.3, 0.94, sz + 1.0);
    hay.scale.set(0.16, 0.07, 0.16); g.hayMesh = hay;
    g.slate.map = glimSlateTex(g.name, 'Auroraram'); g.slate.needsUpdate = true;
  }
  // every frame, for an Auroraram: a light, graceful walk, its long coat swinging; it lifts its head to look about,
  // flicks its ears, wags its little tail and blinks; the lights drift across it; and when petted it gives a happy
  // little prance, front hooves up, its head tossing
  function auroraAnimate(g, dt, t, moving) {
    var m = g.m;
    auroraClock.value = t;
    if (moving) g.hop += dt * 6.5;
    var happy = g.pet > 0;
    if (happy) { g.pet -= dt; m.prance += dt; } else m.prance = 0;
    var pr = happy ? Math.max(0, Math.sin(m.prance * 7)) : 0;        // the prance: a bounce, front legs lifting
    m.legs.forEach(function (l) {
      var sw = moving ? Math.sin(g.hop + l.ph) : 0;
      l.hip.rotation.x = l.hip.rotation.x * 0.8 + (sw * 0.4 + (l.front ? -pr * 0.7 : pr * 0.15)) * 0.2;
      l.knee.rotation.x = l.knee.rotation.x * 0.8 + ((moving ? Math.max(0, Math.sin(g.hop + l.ph + 1.2)) * (l.front ? 0.7 : -0.5) : 0) + (l.front ? pr * 1.1 : 0)) * 0.2;
    });
    m.body.position.y = moving ? Math.abs(Math.sin(g.hop)) * 0.012 : pr * 0.05;
    m.body.rotation.x = -pr * 0.12;
    var look = Math.sin(t * 0.3 + g.stall * 1.7);
    m.head.rotation.set(0.35 + (happy ? -0.25 + Math.sin(m.prance * 7) * 0.12 : Math.max(0, Math.sin(t * 0.19 + g.stall) - 0.7) * 1.4 + (moving ? Math.sin(g.hop * 2) * 0.06 : 0)), look * 0.45 * (happy ? 0.3 : 1), Math.sin(t * 0.41 + g.stall) * 0.06);
    m.ears.forEach(function (e, k) { var flick = Math.max(0, Math.sin(t * 0.8 + k * 2.1 + g.stall) - 0.93) * 14; e.g.rotation.z = e.s * (Math.sin(t * 1.1 + k) * 0.06 + flick * 0.25 + (happy ? 0.3 : 0)); e.g.rotation.x = Math.sin(t * 0.9 + k) * 0.05; });
    m.beard.rotation.x = Math.sin(t * 1.4 + g.stall) * 0.06 + (moving ? Math.sin(g.hop * 2) * 0.08 : 0);
    m.tail.rotation.z = Math.sin(t * (happy ? 18 : 2.2) + g.stall) * (happy ? 0.5 : 0.15);
    var bt = (t * 0.21 + g.stall * 0.33) % 1, blink = happy ? 0.6 : (bt < 0.035 ? Math.sin(bt / 0.035 * Math.PI) : 0);
    m.lids.forEach(function (l) { l.visible = blink > 0.03; l.rotation.x = -0.62 + blink * 1.55; });
    var pulse = 0.5 + Math.sin(t * 1.2 + g.stall) * 0.5;
    m.charm.rotation.x = (moving ? Math.sin(g.hop * 2) * 0.3 : Math.sin(t * 1.3) * 0.06) + pr * 0.4;   // the snowflake charm swings as it moves
    m.charm.rotation.z = moving ? Math.sin(g.hop) * 0.2 : 0;
    m.flakeMat.emissiveIntensity = 0.5 + pulse * 0.4; m.flakeGlow.material.opacity = 0.35 + pulse * 0.3;
    m.hornMat.emissiveIntensity = 0.2 + pulse * 0.2 + (g.egg ? 0.15 : 0);
    m.hornGlows.forEach(function (h, k) { h.material.opacity = (k % 2 ? 0.25 : 0.5) + pulse * 0.25; });
    m.hoofMat.emissiveIntensity = 0.3 + pulse * 0.2;
    m.sparks.forEach(function (sp) {
      sp.t += dt * (happy ? 0.8 : 0.35);
      if (sp.t > 1) { sp.t -= 1 + Math.random() * 1.5; var a = Math.random() * Math.PI * 2; sp.x = Math.sin(a) * 0.14; sp.y = 0.3 + Math.random() * 0.22; sp.z = Math.cos(a) * 0.22; }
      sp.s.material.opacity = sp.t > 0 ? Math.sin(sp.t * Math.PI) * 0.85 : 0;
      sp.s.position.set(sp.x, sp.y + Math.max(0, sp.t) * 0.45, sp.z);
    });
    m.glow.material.opacity = 0.12 + pulse * 0.06;
    if (g.egg) { g.eggMesh.position.set(g.x, 0.98 + Math.sin(t * 2) * 0.04, g.z); g.eggGlow.material.opacity = 0.35 + Math.sin(t * 2 + g.stall) * 0.12; }
  }
  function auroraramAction(g, wx, wz) {                              // milking, feeding and petting an Auroraram
    if (g.egg) {
      if (!bag.some(function (b) { return b && b.id === 'milkPail'; })) { showToast(g.name + ' is ready to milk! You need a Milk Pail: buy one at the counter 🪣', 2800); return; }
      if (!roomFor(['auroraMilk'])) { bagFull(); return; }
      addItem('auroraMilk', 1); g.egg = false; glimRefresh(g); popSound(); g.pet = 1.2;
      showToast('You milked ' + g.name + ' and got a bottle of shimmering Aurora Milk! 🥛✨', 2400);
      return;
    }
    var day = Math.min(AURORA_DAYS, g.days + 1);
    var news = day >= AURORA_DAYS ? ' Aurora Milk tomorrow morning!' : ' Day ' + day + ' of ' + AURORA_DAYS + ' toward Aurora Milk.';
    if (!g.fed) {
      if (!takeItem('hay', 1)) { showToast(g.name + ' is hungry! Buy hay at the counter to feed them 🌾', 2600); return; }
      g.fed = true; glimRefresh(g); popSound(); g.pet = 0.8; g.face = Math.atan2(-3.7 - g.x, GLIM_STALLS[g.stall] + 1.0 - g.z);
      showToast(g.name + ' nibbles the hay daintily 🌾' + (g.petted ? news : ' Now give them a pet!'), 2600);
      return;
    }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 2.0;
      g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, 0.85, g.z); popSound();
      showToast(g.name + ' prances happily, the lights dancing in their coat 💜' + news, 2800);
      return;
    }
    g.pet = 1.4; glimHeartBurst(g.x, 0.85, g.z);
    showToast(g.name + ' is fed, petted and happy ✧' + (day >= AURORA_DAYS ? ' Aurora Milk tomorrow morning!' : ' Day ' + day + ' of ' + AURORA_DAYS + ' done. Come back tomorrow!'), 2400);
  }
  // ---------- Zephyra ----------
  // Little spirits of the gentle west wind, shaped a little like a llama (but not a llama): a round, soft body made
  // of billowing cloud, white on top and blushed underneath with the pinks and golds of sunrise; a big round head
  // with tall rounded ears, huge sparkly eyes, a heart-shaped nose and a glowing sun-gem on its brow; little feathered
  // cloud wings; a silk scarf streaming in the breeze; short legs ending in puffs of cloud, so it floats just above
  // the ground; a curling cloud of a tail; and breezes swirling round it. Feed one hay and pet it every day for four
  // days in a row, and the next morning its cloud is full: shear it (with Shears from the counter) for a bundle of
  // Cloud Wool. Miss a day and the count starts over
  var ZEPHYRA_COST = 560, ZEPHYRA_DAYS = 4, SHEARS_COST = 120;
  var ZEPHYRA_PALS = [                                                // a sunrise one, a cotton-candy one and a silver-lining one
    { name: 'Sunrise', top: 0xfffaf2, low: 0xffb898, gold: 0xffd27a, plush: 0xfff3e6, inner: [0xffb0c0, 0xffd890], nose: 0xff8aa0, iris: ['#ff9a5a', '#7a2a10'], scarf: ['#ff8aa8', '#ffd27a'], gem: 0xffc040, glow: 0xffd8a0 },
    { name: 'Cotton Candy', top: 0xfff6fb, low: 0xffb0d8, gold: 0xb0d8ff, plush: 0xffeef7, inner: [0xff9ec8, 0xb8dcff], nose: 0xff7ab0, iris: ['#c86ad8', '#3a0a40'], scarf: ['#8ac8ff', '#ffb0d8'], gem: 0xff8ad0, glow: 0xffc8e8 },
    { name: 'Silver Lining', top: 0xf6f9ff, low: 0xb8c8e8, gold: 0xffe0a0, plush: 0xeef3fc, inner: [0xe8b8d0, 0xffe4a8], nose: 0xb08ab8, iris: ['#5a9ae8', '#0a1a40'], scarf: ['#ffe08a', '#c8d8ff'], gem: 0xfff0b0, glow: 0xdce8ff }
  ];
  // its soft look: a matte, velvety surface lit from within, so its shadows are soft and its edges glow gently like
  // the sunlit edge of a cloud, with a faint, soft billowing mottle over it (nothing hard or rough anywhere)
  function zSoftMat(opts, fill, rim, mottle) {
    var m = new THREE.MeshStandardMaterial(opts);
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uFill = { value: fill }; sh.uniforms.uRim = { value: rim }; sh.uniforms.uMottle = { value: mottle || 0 };
      sh.vertexShader = 'varying vec3 vZPos;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vZPos = position;');
      sh.fragmentShader = 'uniform float uFill, uRim, uMottle;\nvarying vec3 vZPos;\nfloat zN(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); vec2 o = vec2(0.0, 1.0);\n  #define ZH(q) fract(sin(dot(q, vec3(12.9898, 78.233, 37.719))) * 43758.5453)\n  return mix(mix(mix(ZH(i), ZH(i + o.yxx), f.x), mix(ZH(i + o.xyx), ZH(i + o.yyx), f.x), f.y), mix(mix(ZH(i + o.xxy), ZH(i + o.yxy), f.x), mix(ZH(i + o.xyy), ZH(i + o.yyy), f.x), f.y), f.z); }\n' +
        sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n  float zm = zN(vZPos * 60.0) * 0.55 + zN(vZPos * 140.0) * 0.3 + zN(vZPos * 320.0) * 0.15;\n  diffuseColor.rgb *= 1.0 - uMottle * 0.5 + uMottle * zm;')
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  float zr = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 2.2);\n  totalEmissiveRadiance += diffuseColor.rgb * (uFill + uRim * zr);');
    };
    m.customProgramCacheKey = function () { return 'zephyrasoft' + (opts.vertexColors ? 'v' : '') + (opts.map ? 'm' : '') + (opts.bumpMap ? 'b' : ''); };
    return m;
  }
  // its fur and its fleece: layers of shells over each part, and in every layer a hair drawn wherever one grows
  // from the skin below, each its own length, thinning to its tip and only a little darker at the root (so it looks
  // soft and silky, never coarse), lit softly from within at the edges like a sunlit cloud. The fleece's hairs are
  // longer, finer and gently crimped
  var ZFUR_D = 640;                                                   // (hairs per metre along the skin)
  function zFurMat(col, dens, crimp, vcol, rootShade, glow) {
    var m = new THREE.MeshStandardMaterial({ color: col, roughness: 0.95, vertexColors: !!vcol });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.uFurD = { value: dens || ZFUR_D }; sh.uniforms.uCrimp = { value: crimp || 0 }; sh.uniforms.uRoot = { value: rootShade || 0.82 }; sh.uniforms.uGlow = { value: glow || 0 };
      sh.vertexShader = 'attribute float shellT;\nattribute vec3 furRoot;\nvarying float vShellT;\nvarying vec3 vFurRoot;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n  vShellT = shellT; vFurRoot = furRoot;');
      sh.fragmentShader = 'uniform float uFurD, uCrimp, uRoot, uGlow;\nvarying float vShellT;\nvarying vec3 vFurRoot;\nvec3 zHash(vec3 p) { p = fract(p * vec3(0.1031, 0.1030, 0.0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }\n' + sh.fragmentShader.replace('#include <alphatest_fragment>', [
        '  vec3 fq = vFurRoot * uFurD + vec3(sin(vShellT * 11.0), cos(vShellT * 9.0), sin(vShellT * 7.0 + 1.0)) * uCrimp, fb = floor(fq - 0.5), fR = vec3(0.0); float fBest = 9.0;',
        '  for (int i = 0; i < 2; i++) for (int j = 0; j < 2; j++) for (int k = 0; k < 2; k++) {',
        '    vec3 fc = fb + vec3(float(i), float(j), float(k)), rr = zHash(fc); float fd = length(fq - fc - 0.2 - rr * 0.6);',
        '    if (fd < fBest) { fBest = fd; fR = rr; } }',
        '  float fLen = 0.55 + 0.45 * fR.x;',
        '  if (vShellT > 0.1 && (vShellT > fLen || fBest > 0.86 * (1.0 - vShellT / fLen * 0.65))) discard;',   // (the hairs close together, so the coat looks smooth and soft)
        '  diffuseColor.rgb *= mix(uRoot, 1.03, smoothstep(0.0, 1.0, vShellT / fLen)) * (0.985 + 0.03 * fR.y);'].join('\n')).replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * uGlow * (0.18 + 0.45 * pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 2.2)) * (0.5 + vShellT);');
    };
    m.customProgramCacheKey = function () { return 'zephyrafur' + (vcol ? 'v' : ''); };
    return m;
  }
  function zFurShell(geo, n, len, sc, flow, comb) {                   // the shells over a shape: sc is how it's stretched, len how long its hair, flow which way it lies
    var pa = geo.attributes.position.array, na = geo.attributes.normal.array, ca = geo.attributes.color ? geo.attributes.color.array : null, cnt = geo.attributes.position.count;
    var ia = geo.index ? geo.index.array : null, ic = ia ? ia.length : cnt, fl = V3(flow[0], flow[1], flow[2]).normalize(), cb = comb === undefined ? 2.2 : comb;   // (combed flat, so it lies smooth)
    var P2 = new Float32Array(cnt * n * 3), N2 = new Float32Array(cnt * n * 3), R2 = new Float32Array(cnt * n * 3), T2 = new Float32Array(cnt * n), I2 = new Uint32Array(ic * n), C2 = ca ? new Float32Array(cnt * n * 3) : null;
    var p = new THREE.Vector3(), nn = new THREE.Vector3(), tg = new THREE.Vector3();
    for (var v = 0; v < cnt; v++) {
      p.set(pa[v * 3] * sc[0], pa[v * 3 + 1] * sc[1], pa[v * 3 + 2] * sc[2]);
      nn.set(na[v * 3] / sc[0], na[v * 3 + 1] / sc[1], na[v * 3 + 2] / sc[2]).normalize();
      tg.copy(fl).addScaledVector(nn, -fl.dot(nn));
      for (var k = 0; k < n; k++) {
        var f = (k + 1) / n, o = (k * cnt + v) * 3, out = len * f, lean = len * f * f * cb;
        P2[o] = p.x + nn.x * out + tg.x * lean; P2[o + 1] = p.y + nn.y * out + tg.y * lean; P2[o + 2] = p.z + nn.z * out + tg.z * lean;
        N2[o] = nn.x; N2[o + 1] = nn.y; N2[o + 2] = nn.z; R2[o] = p.x; R2[o + 1] = p.y; R2[o + 2] = p.z;
        if (C2) { C2[o] = ca[v * 3]; C2[o + 1] = ca[v * 3 + 1]; C2[o + 2] = ca[v * 3 + 2]; }
        T2[k * cnt + v] = 0.04 + (k / (n - 1)) * 0.96;
      }
    }
    for (var k2 = 0; k2 < n; k2++) for (var q = 0; q < ic; q++) I2[k2 * ic + q] = (ia ? ia[q] : q) + k2 * cnt;
    var g2 = new THREE.BufferGeometry();
    g2.setAttribute('position', new THREE.BufferAttribute(P2, 3)); g2.setAttribute('normal', new THREE.BufferAttribute(N2, 3));
    g2.setAttribute('furRoot', new THREE.BufferAttribute(R2, 3)); g2.setAttribute('shellT', new THREE.BufferAttribute(T2, 1)); g2.setIndex(new THREE.BufferAttribute(I2, 1));
    if (C2) g2.setAttribute('color', new THREE.BufferAttribute(C2, 3));
    return g2;
  }
  var zPuffGeo = new THREE.SphereGeometry(1, 18, 13);
  // a cloud: puffs merged into one shape, each coloured by where it sits (white on top, blushed with sunrise
  // underneath, now and then touched with gold)
  function zCloud(puffs, pal) {
    var P = [], N = [], C = [], I = [], base = 0, top = new THREE.Color(pal.top), low = new THREE.Color(pal.low), gold = new THREE.Color(pal.gold), c = new THREE.Color();
    var pa = zPuffGeo.attributes.position.array, na = zPuffGeo.attributes.normal.array, ia = zPuffGeo.index.array, cnt = zPuffGeo.attributes.position.count;
    puffs.forEach(function (pf, k) {                                 // pf: [x, y, z, r, shade (0 = top, 1 = underneath)]
      c.copy(top).lerp(low, Math.min(1, pf[4])); if (glimR(k * 3.7 + 40) < 0.1) c.lerp(gold, 0.35);
      for (var v = 0; v < cnt; v++) {
        P.push(pf[0] + pa[v * 3] * pf[3], pf[1] + pa[v * 3 + 1] * pf[3] * 0.94, pf[2] + pa[v * 3 + 2] * pf[3]);
        N.push(na[v * 3], na[v * 3 + 1], na[v * 3 + 2]);
        var under = Math.max(0, -na[v * 3 + 1]) * 0.35, rim = Math.max(0, na[v * 3 + 1]) * 0.04;   // (blushing softer underneath each puff, brightest on top)
        C.push(Math.min(1, c.r * (1 - under * 0.2) + rim) * (1 - under * 0.12), Math.min(1, c.g * (1 - under * 0.35) + rim) * (1 - under * 0.12), Math.min(1, c.b * (1 - under * 0.3) + rim) * (1 - under * 0.12));
      }
      for (var q = 0; q < ia.length; q++) I.push(ia[q] + base);
      base += cnt;
    });
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); geo.setIndex(I);
    return geo;
  }
  // a cumulus: over each big puff, smaller puffs billow out, so its outline has all the soft lumps of a real cloud.
  // c is the middle of the cloud (the smaller puffs grow outward from it)
  function zBillow(puffs, c, n, seed) {
    var out = puffs.slice(), d = new THREE.Vector3(), j = new THREE.Vector3();
    puffs.forEach(function (p, k) {
      d.set(p[0] - c[0], p[1] - c[1], p[2] - c[2]); if (d.lengthSq() < 1e-6) return; d.normalize();
      for (var i = 0; i < n; i++) {
        var r1 = glimR(seed + k * 7.3 + i * 2.1), r2 = glimR(seed + k * 3.9 + i * 5.7), r3 = glimR(seed + k * 1.7 + i * 8.3);
        j.set(r1 - 0.5, r2 - 0.5, r3 - 0.5).multiplyScalar(1.6).add(d).normalize();
        out.push([p[0] + j.x * p[3] * 0.75, p[1] + j.y * p[3] * 0.75, p[2] + j.z * p[3] * 0.75, p[3] * 0.55 * (0.8 + r1 * 0.4), Math.max(0, Math.min(1, p[4] - j.y * 0.15))]);
      }
    });
    return out;
  }
  var zWoolMat = null;
  function zCloudMesh(puffs, pal, len) {                              // a cloud of fleece: its soft body, and the fine wool over it
    var geo = zCloud(puffs, pal), g = new THREE.Group(), m = new THREE.Mesh(geo, zSoftMat({ vertexColors: true, roughness: 1, color: 0xf2eeea }, 0.3, 0.5, 0.15)); m.castShadow = true; g.add(m);
    if (!zWoolMat) zWoolMat = zFurMat(new THREE.Color(1.12, 1.12, 1.12), 1500, 0, true, 0.95, 0.75);   // (a coat of soft, silky fur, smooth and fine)
    g.add(new THREE.Mesh(zFurShell(geo, 16, (len || 0.02) * 0.55, [1, 1, 1], [0, -0.45, -1], 2.2), zWoolMat));   // (combed back along its body, lying smooth)
    return g;
  }
  // a bundle of Cloud Wool: a soft little cloud, blushed with sunrise, tied with a golden ribbon
  var cloudWoolIcon = glimCanvas(96, 96, function (g, w, h) {
    var glow = g.createRadialGradient(48, 52, 4, 48, 52, 46); glow.addColorStop(0, 'rgba(255,220,170,0.7)'); glow.addColorStop(1, 'rgba(255,200,220,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    [[30, 58, 18], [48, 46, 22], [66, 56, 18], [40, 66, 16], [58, 68, 16]].forEach(function (p, k) {
      var pg = g.createRadialGradient(p[0] - 5, p[1] - 7, 2, p[0], p[1], p[2]); pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.6, '#fff4ec'); pg.addColorStop(1, k > 2 ? '#ffc4b0' : '#ffe0d0');
      g.fillStyle = pg; g.beginPath(); g.arc(p[0], p[1], p[2], 0, Math.PI * 2); g.fill();
    });
    g.strokeStyle = '#ffb03a'; g.lineWidth = 3; g.beginPath(); g.moveTo(46, 30); g.bezierCurveTo(52, 50, 44, 70, 50, 84); g.stroke();   // a golden ribbon tying it
    g.fillStyle = '#ff6a8a'; g.beginPath(); g.ellipse(42, 32, 6, 3.5, 0.4, 0, Math.PI * 2); g.ellipse(52, 31, 6, 3.5, -0.4, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; [[16, 28], [80, 36], [80, 78]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  ITEMS.cloudWool = { name: 'Cloud Wool', price: 380, icon: '☁️', img: cloudWoolIcon, fill: 88, info: 'A bundle of wool as soft and light as a cloud, blushed with the colours of sunrise, from a happy Zephyra. Feed and pet yours every day for four days in a row, then shear it the next morning with Shears. Sells for a very good price at the shipping bin.' };
  var shearsIcon = glimCanvas(96, 96, function (g, w, h) {           // a pair of little shears: bright steel blades, rosy loop handles
    g.save(); g.translate(48, 50);
    [-1, 1].forEach(function (s) {
      g.save(); g.rotate(s * 0.22);
      var bg = g.createLinearGradient(-6, -40, 6, -40); bg.addColorStop(0, '#9aa4b0'); bg.addColorStop(0.5, '#f4f8fc'); bg.addColorStop(1, '#a8b0bc');
      g.fillStyle = bg; g.beginPath(); g.moveTo(0, 2); g.lineTo(s * 7, -6); g.quadraticCurveTo(s * 5, -30, 0, -42); g.quadraticCurveTo(-s * 2, -24, -s * 1, 2); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(60,70,80,0.6)'; g.lineWidth = 1; g.stroke();
      g.strokeStyle = '#ff7a9a'; g.lineWidth = 6; g.beginPath(); g.ellipse(s * 10, 18, 8, 11, s * 0.3, 0, Math.PI * 2); g.stroke();
      g.restore();
    });
    g.fillStyle = '#ffd56a'; g.beginPath(); g.arc(0, 2, 4, 0, Math.PI * 2); g.fill();   // the pivot
    g.restore();
  }).toDataURL();
  ITEMS.shears = { name: 'Shears', icon: '✂️', img: shearsIcon, fill: 86, info: 'For shearing your Zephyras when their cloud is full. Keep them in your bag; they never wear out.' };
  var zephyraShopIcon = glimCanvas(128, 128, function (g, w, h) {    // a little portrait of one, for the shop
    var sky = g.createRadialGradient(64, 64, 4, 64, 64, 64); sky.addColorStop(0, 'rgba(255,220,180,0.8)'); sky.addColorStop(1, 'rgba(255,190,220,0)'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    function puff(x, y, r, col) { var pg = g.createRadialGradient(x - r * 0.3, y - r * 0.4, 1, x, y, r); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, col); g.fillStyle = pg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    [[40, 110], [56, 112], [74, 112], [88, 110]].forEach(function (p) { g.fillStyle = '#fff3e6'; g.fillRect(p[0] - 4, p[1] - 16, 8, 14); puff(p[0], p[1], 6, '#ffd0c0'); });   // little legs on cloud puffs
    [[26, 60, 12], [16, 50, 8], [12, 38, 6]].forEach(function (p) { puff(p[0], p[1], p[2], '#ffe0d0'); });   // the curling tail
    g.fillStyle = 'rgba(255,255,255,0.9)'; [0, 1, 2].forEach(function (k) { g.save(); g.translate(56, 70); g.rotate(-2.2 + k * 0.35); g.beginPath(); g.ellipse(0, -22, 7, 20, 0, 0, Math.PI * 2); g.fill(); g.restore(); });   // a little wing
    [[36, 86, 15, '#ffc8a8'], [58, 90, 16, '#ffc8a8'], [80, 88, 14, '#ffc8a8'], [34, 74, 15, '#fff0e4'], [54, 72, 18, '#fff4ea'], [74, 74, 17, '#fff4ea'], [90, 80, 12, '#ffe8d8']].forEach(function (p) { puff(p[0], p[1], p[2], p[3]); });   // the cloud of a body
    g.fillStyle = '#fff3e6'; g.fillRect(84, 44, 14, 30);               // the neck
    g.strokeStyle = '#ff8aa8'; g.lineWidth = 6; g.beginPath(); g.moveTo(82, 60); g.lineTo(100, 60); g.stroke(); g.beginPath(); g.moveTo(84, 60); g.quadraticCurveTo(74, 66, 66, 62); g.stroke();   // the scarf
    puff(94, 34, 21, '#fff0e4');                                        // the big round head
    [-1, 1].forEach(function (s) { g.fillStyle = '#fff3e6'; g.beginPath(); g.ellipse(94 + s * 11, 10, 5, 12, s * 0.2, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffb0c0'; g.beginPath(); g.ellipse(94 + s * 11, 11, 2.5, 8, s * 0.2, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#fff6ee'; g.beginPath(); g.ellipse(104, 42, 11, 9, 0, 0, Math.PI * 2); g.fill();   // the snout
    g.fillStyle = '#ff8aa0'; g.beginPath(); g.arc(108, 38, 2.4, 0, Math.PI * 2); g.arc(111, 38, 2.4, 0, Math.PI * 2); g.fill(); g.beginPath(); g.moveTo(106, 39); g.lineTo(113, 39); g.lineTo(109.5, 43); g.fill();   // heart nose
    g.fillStyle = '#2a1008'; g.beginPath(); g.ellipse(95, 32, 6, 7, 0, 0, Math.PI * 2); g.fill();   // the big eye
    g.fillStyle = '#ff9a5a'; g.beginPath(); g.ellipse(95.5, 33.5, 4.5, 5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2a1008'; g.beginPath(); g.arc(95.5, 33.5, 2.8, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(93.5, 30, 2, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,140,170,0.55)'; g.beginPath(); g.ellipse(100, 44, 4, 2.5, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffc040'; g.beginPath(); g.moveTo(90, 16); g.lineTo(93, 20); g.lineTo(90, 24); g.lineTo(87, 20); g.closePath(); g.fill();   // the sun-gem
    g.fillStyle = '#fff'; [[14, 92], [40, 18], [118, 100]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  function zephyraEyeTex(pal) {                                       // a huge, sparkly eye: a warm iris glowing from below round a big round pupil
    return new THREE.CanvasTexture(glimCanvas(256, 256, function (g, w, h) {
      g.fillStyle = '#06040a'; g.fillRect(0, 0, w, h);
      var ig = g.createRadialGradient(128, 170, 10, 128, 128, 100); ig.addColorStop(0, pal.iris[0]); ig.addColorStop(0.6, pal.iris[0]); ig.addColorStop(0.95, pal.iris[1]); ig.addColorStop(1, '#030206');
      g.fillStyle = ig; g.beginPath(); g.arc(128, 128, 100, 0, Math.PI * 2); g.fill();
      for (var r = 0; r < 90; r++) { var a = r / 90 * Math.PI * 2; g.strokeStyle = 'rgba(255,240,200,' + (0.06 + glimR(r * 3.1 + 7) * 0.14) + ')'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(128 + Math.cos(a) * 54, 128 + Math.sin(a) * 54); g.lineTo(128 + Math.cos(a) * (80 + glimR(r) * 14), 128 + Math.sin(a) * (80 + glimR(r) * 14)); g.stroke(); }
      var lg = g.createRadialGradient(128, 200, 4, 128, 200, 70); lg.addColorStop(0, 'rgba(255,240,180,0.7)'); lg.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = lg; g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#040208'; g.beginPath(); g.arc(128, 124, 52, 0, Math.PI * 2); g.fill();   // the big round pupil
      g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath();            // a tiny sun low in the iris
      for (var k2 = 0; k2 < 16; k2++) { var sa = k2 * Math.PI / 8, sr = k2 % 2 ? 4 : 9; g[k2 ? 'lineTo' : 'moveTo'](128 + Math.cos(sa) * sr, 196 + Math.sin(sa) * sr); }
      g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.6)'; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.stroke();
    }));
  }
  var zCloudTex = new THREE.CanvasTexture(glimCanvas(96, 64, function (g, w, h) {   // a soft little cloud
    [[30, 38, 16], [48, 30, 20], [66, 38, 15], [44, 42, 14]].forEach(function (p) { var cg = g.createRadialGradient(p[0], p[1], 2, p[0], p[1], p[2]); cg.addColorStop(0, 'rgba(255,255,255,0.95)'); cg.addColorStop(0.7, 'rgba(255,255,255,0.7)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.fillRect(0, 0, w, h); });
  }));
  var zRainbowTex = new THREE.CanvasTexture(glimCanvas(256, 128, function (g, w, h) {   // a little rainbow arc with cloud puffs at its feet
    ['#ff7a8a', '#ffb05a', '#ffe46a', '#7ae0a0', '#7ab8ff', '#b890ff'].forEach(function (c, k) { g.strokeStyle = c; g.globalAlpha = 0.85; g.lineWidth = 9; g.beginPath(); g.arc(128, 124, 100 - k * 9, Math.PI, 0); g.stroke(); });
    g.globalAlpha = 1;
    [[36, 116], [220, 116]].forEach(function (p) { [[0, 0, 16], [-14, 4, 11], [14, 4, 11]].forEach(function (q) { var cg = g.createRadialGradient(p[0] + q[0], p[1] + q[1], 2, p[0] + q[0], p[1] + q[1], q[2]); cg.addColorStop(0, '#ffffff'); cg.addColorStop(0.75, 'rgba(255,255,255,0.9)'); cg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = cg; g.fillRect(0, 0, w, h); }); });
  }));
  var zBreezeTex = new THREE.CanvasTexture(glimCanvas(256, 16, function (g, w, h) {   // a breeze: a thin streak of light, fading at both ends
    var gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.8)'); gr.addColorStop(0.75, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var vg = g.createLinearGradient(0, 0, 0, h); vg.addColorStop(0, 'rgba(0,0,0,1)'); vg.addColorStop(0.5, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = vg; g.fillRect(0, 0, w, h);
  }));
  // a real feather, painted fine: a tapering shaft, and hundreds of barbs sweeping out from it toward the tip, each
  // a little different, with the faint gaps between them; the outer vane narrower than the inner one; the vane
  // soft-edged with a few little splits where the barbs have parted; a fluffy tuft of down at the base, a little
  // shadowed where the next feather covers it; white fading to sunrise at the tip, edged in gold. Painted twice: once
  // in colour, once as a height map so each barb and the shaft catch the light. kind: 0 a flight feather (long, the
  // tip a little pointed), 1 a covert (round-tipped)
  function zFeatherTex(pal, kind) {
    var round = kind === 1, W = 256, H = round ? 320 : 1024, cv = document.createElement('canvas'), bv = document.createElement('canvas');
    cv.width = bv.width = W; cv.height = bv.height = H;
    var g = cv.getContext('2d'), b = bv.getContext('2d');
    var top = new THREE.Color(pal.top), low = new THREE.Color(pal.low), gold = new THREE.Color(pal.gold);
    b.fillStyle = '#000'; b.fillRect(0, 0, W, H);
    function col(f, a, k, dim) { var c = top.clone().lerp(low, Math.pow(Math.max(0, f - 0.3) / 0.7, 1.4) * 0.9); if (f > 0.88) c.lerp(gold, (f - 0.88) / 0.12 * 0.55); c.multiplyScalar((0.93 + glimR(k) * 0.09) * (dim || 1)); return 'rgba(' + Math.round(Math.min(1, c.r) * 255) + ',' + Math.round(Math.min(1, c.g) * 255) + ',' + Math.round(Math.min(1, c.b) * 255) + ',' + a + ')'; }
    var base = H * (round ? 0.16 : 0.08), tipY = 6, L = H - base - tipY;
    function halfW(f, side) {                                         // how wide the vane is at f (0 at its base, 1 at its tip), on one side
      var wMax = W * (round ? 0.47 : 0.45) * (side > 0 ? 1 : (round ? 0.85 : 0.5));   // (the outer vane narrower)
      var tipShape = round ? Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, f - 0.5) / 0.5, 2))) : Math.pow(Math.max(0, 1 - Math.max(0, f - 0.62) / 0.38), 0.65) * (1 - Math.max(0, f - 0.85) * (side < 0 ? 1.8 : 1.1));
      return wMax * Math.min(1, f / 0.06 + 0.35) * tipShape;
    }
    var step = round ? 1.2 : 1.35;
    for (var k0 = 0; k0 < 2; k0++) {                                  // first the vane itself, solid, so no light shows through between the barbs
      var sd0 = k0 ? 1 : -1, grd = g.createLinearGradient(0, H - base, 0, tipY);
      [0, 0.3, 0.6, 0.85, 1].forEach(function (f) { grd.addColorStop(f, col(f, 1, 5, 0.97)); });
      g.fillStyle = grd; g.beginPath(); g.moveTo(W / 2, H - base);
      for (var y1 = 0; y1 <= L; y1 += 4) { var hw1 = halfW(y1 / L, sd0); g.lineTo(W / 2 + sd0 * hw1, H - base - y1 - hw1 * (round ? 0.38 : 0.6)); }
      g.lineTo(W / 2, tipY); g.closePath(); g.fill();
    }
    for (var k = 0; k < 2; k++) {
      var side = k ? 1 : -1;
      for (var y = 0; y < L; y += step) {
        var f = y / L, hw = halfW(f, side), n = Math.round(y / step), split = glimR(Math.floor(y / 11) * 3.1 + side * 7) < 0.09 ? 0.78 : 1;   // (a few places where the barbs have parted)
        if (hw < 1) continue;
        var y0 = H - base - y, sweep = hw * (round ? 0.38 : 0.6), shade = n % 3 === 0 ? 0.96 : 1, cover = round ? 1 : (f < 0.35 ? 0.88 + f * 0.34 : 1);   // (every third barb in shadow, the faint gaps between them; the covered base a little darker)
        g.strokeStyle = col(f, 0.95, y * 1.7 + side, shade * cover); g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(W / 2, y0); g.quadraticCurveTo(W / 2 + side * hw * 0.55, y0 - sweep * 0.32, W / 2 + side * hw * split, y0 - sweep); g.stroke();
        b.strokeStyle = 'rgba(255,255,255,' + (n % 3 === 0 ? 0.35 : 0.8) + ')'; b.lineWidth = 1.1;
        b.beginPath(); b.moveTo(W / 2, y0); b.quadraticCurveTo(W / 2 + side * hw * 0.55, y0 - sweep * 0.32, W / 2 + side * hw * split, y0 - sweep); b.stroke();
        if (n % 4 === 1) { g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(W / 2 + side * 3, y0 - 1.2); g.quadraticCurveTo(W / 2 + side * hw * 0.5, y0 - sweep * 0.36, W / 2 + side * hw * 0.92 * split, y0 - sweep - 1); g.stroke(); }   // (the sheen along a barb)
      }
    }
    for (var e = 0; e < L; e += 2) {                                  // a thin golden edge round the tip
      var f2 = e / L; if (f2 < (round ? 0.62 : 0.75)) continue;
      [-1, 1].forEach(function (sd) { var hw2 = halfW(f2, sd), y2 = H - base - e, sw = hw2 * (round ? 0.38 : 0.6); g.fillStyle = 'rgba(255,212,120,' + (0.6 * (f2 - 0.6) / 0.4) + ')'; g.beginPath(); g.arc(W / 2 + sd * hw2, y2 - sw, 1.8, 0, Math.PI * 2); g.fill(); });
    }
    for (var d = 0; d < 90; d++) {                                    // fluffy down at the base
      var dy = H - glimR(d) * base * 1.4, ds = glimR(d * 3.1) > 0.5 ? 1 : -1, dl = 12 + glimR(d * 5) * W * 0.3;
      g.strokeStyle = col(0.1, 0.6, d, 0.95); g.lineWidth = 0.9; g.beginPath(); g.moveTo(W / 2, dy); g.bezierCurveTo(W / 2 + ds * dl * 0.4, dy - 8, W / 2 + ds * dl * 0.8, dy + (glimR(d * 7) - 0.5) * 16, W / 2 + ds * dl, dy - 12 + glimR(d * 9) * 10); g.stroke();
    }
    var sg = g.createLinearGradient(0, H, 0, tipY); sg.addColorStop(0, 'rgba(255,252,246,1)'); sg.addColorStop(0.7, 'rgba(255,240,222,0.95)'); sg.addColorStop(1, 'rgba(255,226,200,0.7)');
    g.fillStyle = sg; g.beginPath(); g.moveTo(W / 2 - 3.5, H); g.lineTo(W / 2 + 3.5, H); g.lineTo(W / 2 + 0.6, tipY + 4); g.lineTo(W / 2 - 0.6, tipY + 4); g.closePath(); g.fill();   // the shaft, tapering
    g.strokeStyle = 'rgba(190,150,130,0.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(W / 2 + 2, H); g.lineTo(W / 2 + 0.4, tipY + 6); g.stroke();   // (its shadowed side)
    g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(W / 2 - 1.6, H); g.lineTo(W / 2 - 0.3, tipY + 6); g.stroke();   // (and its shine)
    b.fillStyle = '#fff'; b.beginPath(); b.moveTo(W / 2 - 3.5, H); b.lineTo(W / 2 + 3.5, H); b.lineTo(W / 2 + 0.6, tipY + 4); b.lineTo(W / 2 - 0.6, tipY + 4); b.closePath(); b.fill();
    var map = new THREE.CanvasTexture(cv), bump = new THREE.CanvasTexture(bv);
    map.anisotropy = bump.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return { map: map, bump: bump };
  }
  function zBandTex(pal) {                                            // the silk band round its neck: shading into each other, golden swirls embroidered along it
    var tx = new THREE.CanvasTexture(glimCanvas(512, 64, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, pal.scarf[0]); gr.addColorStop(0.5, pal.scarf[1]); gr.addColorStop(1, pal.scarf[0]); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var x = 0; x < w; x += 2) { g.fillStyle = 'rgba(255,255,255,' + (0.03 + glimR(x) * 0.04) + ')'; g.fillRect(x, 0, 1, h); }   // (the fine weave of the silk)
      g.strokeStyle = 'rgba(255,236,170,0.95)'; g.lineWidth = 2;
      for (var c = 24; c < w; c += 64) { g.beginPath(); for (var a = 0; a < 9.5; a += 0.2) { var r = 1.5 + a * 1.4; g.lineTo(c + Math.cos(a) * r, h / 2 + Math.sin(a) * r); } g.stroke(); }
      g.strokeStyle = 'rgba(255,240,200,0.6)'; [6, h - 6].forEach(function (y) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); });
    }));
    tx.wrapS = THREE.RepeatWrapping; tx.repeat.set(2, 1); return tx;
  }
  function zScarfTex(pal) {                                           // a silk scarf: two colours fading into each other, golden swirls of wind embroidered along it, a fringe at the end
    return new THREE.CanvasTexture(glimCanvas(64, 512, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, pal.scarf[0]); gr.addColorStop(1, pal.scarf[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h - 40);
      g.strokeStyle = 'rgba(255,236,170,0.95)'; g.lineWidth = 2.5;
      for (var y = 40; y < h - 60; y += 64) { g.beginPath(); for (var a = 0; a < 9.5; a += 0.2) { var r = 2 + a * 1.6; g.lineTo(32 + Math.cos(a) * r, y + Math.sin(a) * r); } g.stroke(); }
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 2; [6, w - 6].forEach(function (x) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h - 40); g.stroke(); });
      for (var f = 0; f < 16; f++) { g.strokeStyle = f % 2 ? pal.scarf[1] : '#fff0c0'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(3 + f * 3.9, h - 42); g.lineTo(2 + f * 3.9 + Math.sin(f) * 2, h - 4); g.stroke(); }   // the fringe
    }));
  }
  // building one: a soft cloud of a body on short legs with cloud-puff feet; a short neck in a streaming silk scarf;
  // a big round head with tall ears, a sun-gem, huge eyes and a heart-shaped nose; little feathered cloud wings; a
  // curling cloud tail; breezes swirling round it
  function zephyraBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body); abRoom.add(root);
    var seg = new THREE.SphereGeometry(1, 40, 28);
    var plush = zSoftMat({ color: new THREE.Color(pal.plush).multiplyScalar(0.92), roughness: 0.95 }, 0.22, 0.5, 0.12);   // (the skin under its fur)
    var furCol = new THREE.Color(pal.plush).multiplyScalar(1.12), fur = zFurMat(furCol, ZFUR_D * 2.1, 0, false, 0.95, 0.65), headFur = zFurMat(furCol, ZFUR_D * 3.2, 0, false, 0.95, 0.65);   // (fine, short and silky)
    function part(geo, mat, x, y, z, sx, sy, sz, parent, rx, ry, rz) { var m = abPart(geo, mat, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); m.scale.set(sx, sy, sz); return m; }
    function furred(geo, fmat, x, y, z, sc, parent, len, flow, rx, ry, rz) { var m = abPart(zFurShell(geo, 14, len, sc, flow), fmat, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); m.castShadow = false; return m; }
    function ball(x, y, z, sx, sy, sz, parent, len, flow, rx, fmat) { part(seg, plush, x, y, z, sx, sy, sz, parent, rx); return furred(seg, fmat || headFur, x, y, z, [sx, sy, sz], parent, len, flow, rx); }
    function cloud(puffs, parent, x, y, z, len) { var g2 = new THREE.Group(); g2.position.set(x || 0, y || 0, z || 0); (parent || body).add(g2); g2.add(zCloudMesh(puffs, pal, len)); return g2; }
    // the body: a cumulus cloud, all one soft shape: big billows, each covered in smaller billows, and those in smaller
    // ones still, all melted smoothly together (soft dips between them, never creases), billowing up over its back and
    // flatter underneath, like a real summer cloud; warm cream on top where the light catches it, softly shadowed in
    // the hollows between the billows, blushed with sunrise underneath; and all in a short, dense, plush coat
    var BY = 0.37;
    var fleece = new THREE.Group(); fleece.position.set(0, BY, 0); body.add(fleece);
    (function () {
      var core = [0, -0.012, 0, 0.13, 0.105, 0.16], big = [], med = [], small = [];
      [[0, 0.075, 0.075, 0.08], [0, 0.1, -0.02, 0.09], [0, 0.078, -0.115, 0.075], [0.08, 0.04, 0.065, 0.068], [-0.08, 0.04, 0.065, 0.068], [0.085, 0.045, -0.075, 0.068], [-0.085, 0.045, -0.075, 0.068],
       [0.105, -0.025, -0.005, 0.06], [-0.105, -0.025, -0.005, 0.06], [0, 0.012, 0.14, 0.07], [0, 0.015, -0.152, 0.07]].forEach(function (q) { big.push(q); });
      var dir = new THREE.Vector3(), jit = new THREE.Vector3();
      function sprout(src, out, n, rs, seed) {                        // smaller billows swelling out over each billow (more on top, few underneath)
        src.forEach(function (b, k) {
          dir.set(b[0] - core[0], b[1] - core[1] + 0.05, b[2] - core[2]).normalize();
          for (var i = 0; i < n; i++) {
            jit.set(glimR(seed + k * 7.3 + i * 2.1) - 0.5, glimR(seed + k * 3.9 + i * 5.7) - 0.3, glimR(seed + k * 1.7 + i * 8.3) - 0.5).multiplyScalar(2.2).add(dir).normalize();
            if (jit.y < -0.45) continue;
            out.push([b[0] + jit.x * b[3] * 0.86, b[1] + jit.y * b[3] * 0.86, b[2] + jit.z * b[3] * 0.86, b[3] * rs * (0.8 + glimR(seed + k * 9.1 + i) * 0.4)]);
          }
        });
      }
      sprout(big, med, 9, 0.5, 100); sprout(med, small, 3, 0.5, 400);
      function smin(a, b, k) { var h = Math.max(0, Math.min(1, 0.5 + 0.5 * (b - a) / k)); return b + (a - b) * h - k * h * (1 - h); }
      function cone(list) { list.forEach(function (b) { var l = Math.hypot(b[0], b[1], b[2]); b.push(b[0] / l, b[1] / l, b[2] / l, Math.cos(Math.min(Math.PI, Math.asin(Math.min(1, (b[3] + 0.03) / l)) + 0.05))); }); }   // (which way each billow lies from the middle, and how wide it looks from there)
      cone(med); cone(small);
      function near(list, n) { return list.filter(function (b) { return n.x * b[4] + n.y * b[5] + n.z * b[6] > b[7]; }); }   // (just the billows this way out from the middle)
      var medN = med, smallN = small;
      function grp(list, x, y, z, k) { var d = 1e9; for (var i = 0; i < list.length; i++) { var b = list[i], db = Math.sqrt((x - b[0]) * (x - b[0]) + (y - b[1]) * (y - b[1]) + (z - b[2]) * (z - b[2])) - b[3]; d = d > 1e8 ? db : smin(d, db, k); } return d; }
      function sdfBig(x, y, z) {
        var ex = (x - core[0]) / core[3], ey = (y - core[1]) / core[4], ez = (z - core[2]) / core[5];
        var d = (Math.sqrt(ex * ex + ey * ey + ez * ez) - 1) * core[4];
        return Math.max(smin(d, grp(big, x, y, z, 0.05), 0.05), -(y + 0.095) * 0.6);   // (its base softly flattened)
      }
      function sdf(x, y, z) { return Math.max(smin(smin(sdfBig(x, y, z), grp(medN, x, y, z, 0.012), 0.016), grp(smallN, x, y, z, 0.006), 0.008), -(y + 0.095) * 0.6); }
      function reach(f, n) { var lo = 0.04, hi = 0.36; for (var it = 0; it < 20; it++) { var mid = (lo + hi) / 2; if (f(n.x * mid, n.y * mid, n.z * mid) < 0) lo = mid; else hi = mid; } return lo; }
      var geo = new THREE.SphereGeometry(1, 220, 140), p = geo.attributes.position, cols = [], n = new THREE.Vector3();
      var cream = new THREE.Color(pal.top).lerp(new THREE.Color(0xfff0d8), 0.35), low = new THREE.Color(pal.low), c = new THREE.Color();
      for (var i = 0; i < p.count; i++) {
        n.set(p.getX(i), p.getY(i), p.getZ(i)).normalize();
        medN = near(med, n); smallN = near(small, n);
        var r = reach(sdf, n), rb = reach(sdfBig, n), h = Math.max(0, r - rb);   // (how far this spot swells out of the big shape: the hollows between billows stay shadowed)
        p.setXYZ(i, n.x * r, n.y * r, n.z * r);
        c.copy(cream).lerp(low, Math.max(0, Math.min(1, 0.4 - n.y * 0.85)));
        var lit = 0.7 + 0.34 * Math.pow(Math.min(1, h / 0.028), 0.7);   // (deeper in the hollows, brightest on the rounded tops)
        cols.push(c.r * lit, c.g * lit, c.b * (lit * 0.97 + 0.03));
      }
      geo.computeVertexNormals();
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      var skin = new THREE.Mesh(geo, zSoftMat({ vertexColors: true, roughness: 1, color: 0xf2eeea }, 0.34, 0.55, 0.06)); skin.castShadow = true; fleece.add(skin);
      var plushMat = zFurMat(new THREE.Color(1.1, 1.1, 1.1), 2000, 0, true, 0.96, 0.8);   // (a short, dense, soft pile, like plush)
      fleece.add(new THREE.Mesh(zFurShell(geo, 14, 0.0075, [1, 1, 1], [0, -0.3, -1], 0.5), plushMat));
    })();
    // the neck: short and plush, rising from a ruff of cloud
    var neck = new THREE.CatmullRomCurve3([V3(0, BY + 0.02, 0.12), V3(0, BY + 0.14, 0.165), V3(0, BY + 0.24, 0.18)]);
    (function () {
      var TS = 24, RS = 24, geo = new THREE.TubeGeometry(neck, TS, 1, RS, false), p = geo.attributes.position;
      for (var i = 0; i <= TS; i++) { var t = i / TS, c = neck.getPointAt(t), r = 0.064 - t * 0.016; for (var j = 0; j <= RS; j++) { var k = i * (RS + 1) + j; p.setXYZ(k, c.x + (p.getX(k) - c.x) * r * 0.92, c.y + (p.getY(k) - c.y) * r, c.z + (p.getZ(k) - c.z) * r); } }
      geo.computeVertexNormals(); abPart(geo, plush, 0, 0, 0, 0, 0, 0, body).castShadow = true;
      furred(geo, fur, 0, 0, 0, [1, 1, 1], body, 0.0045, [0, -1, -0.3]);
    })();
    function plumeTube(pts, r0, r1, parent, len, flow) {             // a smooth, tapering curl of fur (a tail, a topknot)
      var crv = new THREE.CatmullRomCurve3(pts), TS = 48, RS = 18, geo = new THREE.TubeGeometry(crv, TS, 1, RS, false), p = geo.attributes.position;
      for (var i = 0; i <= TS; i++) { var t = i / TS, c = crv.getPointAt(t), r = (r0 + (r1 - r0) * t) * Math.sqrt(Math.sin(Math.min(1, t * 6 + 0.25) * Math.PI / 2)); for (var j = 0; j <= RS; j++) { var k = i * (RS + 1) + j; p.setXYZ(k, c.x + (p.getX(k) - c.x) * r, c.y + (p.getY(k) - c.y) * r, c.z + (p.getZ(k) - c.z) * r); } }
      geo.computeVertexNormals();
      abPart(geo, plush, 0, 0, 0, 0, 0, 0, parent).castShadow = true;
      furred(geo, fur, 0, 0, 0, [1, 1, 1], parent, len, flow);
      var capP = crv.getPointAt(0), cap = part(seg, plush, capP.x, capP.y, capP.z, r0 * 0.5, r0 * 0.5, r0 * 0.5, parent);   // (its root rounded off)
      return geo;
    }
    ball(0, BY + 0.045, 0.15, 0.1, 0.1, 0.085, body, 0.01, [0, -1, 0.2], 0, fur);   // a soft, full chest where its neck meets its body
    // the scarf: a band of silk round its neck, its two ends streaming out behind in the breeze
    var scarfTex = zScarfTex(pal), scarfMat = zSoftMat({ map: scarfTex, color: 0xffffff, roughness: 0.45, side: THREE.DoubleSide, transparent: true, alphaTest: 0.2 }, 0.32, 0.5, 0);
    var sT = 0.55, sP = neck.getPointAt(sT), sTan = neck.getTangentAt(sT);
    var collar = new THREE.Group(); collar.position.copy(sP); collar.quaternion.setFromUnitVectors(V3(0, 0, 1), sTan); body.add(collar);
    var bandTex = zBandTex(pal), bandMat = zSoftMat({ map: bandTex, color: 0xffffff, roughness: 0.4, metalness: 0.05, side: THREE.DoubleSide }, 0.32, 0.6, 0);   // (silk, bright with a soft sheen at its edges)
    var bandCurve = new THREE.CatmullRomCurve3((function () { var pts = []; for (var a = 0; a < 48; a++) { var an = a / 48 * Math.PI * 2, r = 1 + Math.sin(an * 7) * 0.035; pts.push(V3(Math.cos(an) * 0.056 * r, Math.sin(an) * 0.06 * r, Math.sin(an * 5) * 0.004)); } return pts; })(), true);
    var bandGeo = new THREE.TubeGeometry(bandCurve, 96, 0.011, 10, true); bandGeo.scale(1, 1, 1.9);   // (a soft, wide band of silk, gathered into folds)
    var band = new THREE.Mesh(bandGeo, bandMat); band.castShadow = true; collar.add(band);
    var knot = new THREE.Group(); knot.position.copy(sP).add(V3(0.044, -0.008, -0.032)); body.add(knot);   // a soft knot on one side, with folds in it
    [[0, 0, 0, 0.016, 0.018, 0.013], [0.005, 0.009, 0.004, 0.011, 0.01, 0.01], [-0.004, -0.009, 0.003, 0.011, 0.011, 0.01]].forEach(function (k) { part(new THREE.SphereGeometry(1, 20, 16), bandMat, k[0], k[1], k[2], k[3], k[4], k[5], knot, 0.3, 0, 0.4).castShadow = true; });
    var tails = [];
    [0, 1].forEach(function (k) {
      var geo = new THREE.PlaneGeometry(0.036 - k * 0.004, 0.26 - k * 0.05, 4, 36).translate(0, -(0.13 - k * 0.025), 0), m = new THREE.Mesh(geo, scarfMat);
      m.position.copy(knot.position); m.castShadow = true; body.add(m);
      var base = geo.attributes.position.array.slice();
      tails.push({ m: m, base: base, len: 0.26 - k * 0.05, ph: k * 1.3 });
    });
    // the head: big and round, a short soft snout with a heart-shaped nose, huge sparkly eyes, tall ears
    var head = new THREE.Group(); head.position.copy(neck.getPointAt(1)).add(V3(0, 0.05, 0.02)); head.rotation.x = 0.1; head.scale.setScalar(1.55); body.add(head);
    ball(0, 0, 0, 0.05, 0.047, 0.05, head, 0.0024, [0, 0.3, -1]);                         // the round head
    ball(0, -0.022, 0.042, 0.032, 0.027, 0.035, head, 0.0017, [0, 0.4, -1], 0.15);      // the short, soft snout (its fur shorter and finer)
    ball(0, -0.03, 0.055, 0.026, 0.02, 0.026, head, 0.0017, [0, -0.5, -1], 0.1);        // and its chin
    [-1, 1].forEach(function (s) { ball(s * 0.03, -0.017, 0.02, 0.022, 0.02, 0.022, head, 0.0032, [s, -0.5, -0.6]); });   // round, fluffy cheeks
    var noseMat = zSoftMat({ color: pal.nose, roughness: 0.55 }, 0.12, 0.25, 0.5);   // (soft and velvety, faintly pebbled like a real nose)
    [-1, 1].forEach(function (s) { part(seg, noseMat, s * 0.0052, -0.009, 0.0752, 0.0066, 0.006, 0.0045, head, 0.3); });   // a heart-shaped nose: two round lobes...
    abPart(new THREE.ConeGeometry(0.0082, 0.01, 20), noseMat, 0, -0.015, 0.0745, Math.PI + 0.3, 0, 0, head).scale.set(1.15, 1, 0.55);   // ...and a point
    var nostrilMat = new THREE.MeshStandardMaterial({ color: 0x5a2a34, roughness: 0.6 });
    [-1, 1].forEach(function (s) { part(seg, nostrilMat, s * 0.0058, -0.0115, 0.079, 0.0022, 0.0011, 0.0012, head, 0.3, 0, s * 0.5); });   // two little nostrils
    part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }), -0.004, -0.006, 0.0795, 0.0022, 0.0012, 0.0008, head, 0.3);   // (a soft shine on it)
    var mouthMat = new THREE.MeshStandardMaterial({ color: 0x8a5060, roughness: 0.6 });
    abPart(new THREE.CylinderGeometry(0.0007, 0.0007, 0.008, 6), mouthMat, 0, -0.021, 0.0735, 0.3, 0, 0, head);   // the little line down from its nose
    [-1, 1].forEach(function (s) { abPart(new THREE.TorusGeometry(0.0055, 0.0007, 5, 12, Math.PI * 0.8), mouthMat, s * 0.0052, -0.026, 0.071, 0.45, 0, Math.PI * 1.1 + s * 0.0, head).rotation.z = Math.PI + 0.3 * -s; });   // a little smiling 'w'
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x06040a, roughness: 0.05, metalness: 0.2 });
    var irisMat = new THREE.MeshStandardMaterial({ map: zephyraEyeTex(pal), roughness: 0.12, emissive: 0xffffff, emissiveIntensity: 0.3 }); irisMat.emissiveMap = irisMat.map;
    var corneaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.02, metalness: 0.1, depthWrite: false });
    var irisGeo = new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, 1.05); irisGeo.rotateX(Math.PI / 2);
    (function () { var ps = irisGeo.attributes.position, uv = irisGeo.attributes.uv, k = 0.46 / Math.sin(1.05); for (var i = 0; i < ps.count; i++) uv.setXY(i, 0.5 + ps.getX(i) * k, 0.5 + ps.getY(i) * k); uv.needsUpdate = true; })();
    var lidMat = zSoftMat({ color: pal.plush, roughness: 0.95, side: THREE.DoubleSide }, 0.22, 0.4, 0), lashMat = new THREE.MeshStandardMaterial({ color: 0x2a1418, roughness: 0.6 }), lids = [];
    var lidGeo = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42);
    [-1, 1].forEach(function (s) {
      var ey = new THREE.Group(); ey.position.set(s * 0.027, 0.006, 0.037); ey.rotation.set(0.04, s * 0.55, 0); head.add(ey);
      var RX = 0.019, RY = 0.021, RZ = 0.012;
      part(seg, eyeMat, 0, 0, 0, RX, RY, RZ, ey);
      abPart(irisGeo, irisMat, 0, 0, 0, 0, 0, 0, ey).scale.set(RX * 1.01, RY * 1.01, RZ * 1.01);
      var co = abPart(irisGeo, corneaMat, 0, 0, 0, 0, 0, 0, ey); co.scale.set(RX * 1.06, RY * 1.06, RZ * 1.18); co.castShadow = false;
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.0065, 0.009, RZ * 1.02, 0.0058, 0.0062, 0.0015, ey);   // big sparkly catchlights
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.0005, 0.013, RZ, 0.0022, 0.0022, 0.001, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }), 0.0068, -0.008, RZ * 0.98, 0.0032, 0.0028, 0.001, ey);
      var lg = new THREE.Group(); ey.add(lg); lids.push(lg); lg.visible = false;
      abPart(lidGeo, lidMat, 0, 0, 0, 0, 0, 0, lg).scale.set(RX * 1.15, RY * 1.15, RZ * 1.3);
      [0.25, 0.5, 0.78].forEach(function (a, n) {                    // three little curled lashes at the outer corner
        var len = 0.009 - n * 0.0012, lash = abPart(new THREE.ConeGeometry(0.0009, len, 5).translate(0, len / 2, 0), lashMat, s * Math.cos(a) * RX * 1.05, Math.sin(a) * RY * 1.05, RZ * 0.35, 0.4, 0, -s * (1.2 - a), ey);
        lash.castShadow = false;
      });
      var bl = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.02), new THREE.MeshBasicMaterial({ map: moonBlushTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      bl.position.set(s * 0.033, -0.018, 0.04); bl.rotation.set(0, s * 0.75, 0); head.add(bl);
    });
    // tall, rounded ears standing up, soft outside and glowing pink to gold inside
    function earGeo(w, hgt, d, inner) {
      var geo = new THREE.SphereGeometry(1, 24, 18), p = geo.attributes.position, cols = [], a = new THREE.Color(pal.inner[0]), b = new THREE.Color(pal.inner[1]), c = new THREE.Color();
      for (var i = 0; i < p.count; i++) {
        var y = p.getY(i), x = p.getX(i) * w * (1 - Math.max(0, y) * 0.25), z = p.getZ(i) * d;
        if (inner) { c.copy(a).lerp(b, (y + 1) / 2); cols.push(c.r, c.g, c.b); }
        p.setXYZ(i, x, (y + 1) * hgt, z + (z > 0 ? -Math.pow(Math.abs(x) / w, 2) * d * -0.6 - d * 0.6 : 0));   // (cupped in front)
      }
      if (inner) geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
      geo.computeVertexNormals(); return geo;
    }
    var innerMat = zSoftMat({ vertexColors: true, roughness: 0.8, color: 0xffffff }, 0.3, 0.3, 0);
    var ears = [];
    [-1, 1].forEach(function (s) {
      var ep = new THREE.Group(); ep.position.set(s * 0.028, 0.035, -0.008); head.add(ep); ears.push({ g: ep, s: s });
      var tilt = new THREE.Group(); tilt.rotation.set(-0.1, s * 0.2, -s * 0.28); ep.add(tilt);
      var eg = earGeo(0.013, 0.034, 0.0075, false); abPart(eg, plush, 0, 0, 0, 0, 0, 0, tilt).castShadow = true;
      furred(eg, headFur, 0, 0, 0, [1, 1, 1], tilt, 0.002, [0, 1, 0]);
      abPart(earGeo(0.0085, 0.028, 0.003, true), innerMat, 0, 0.005, 0.0052, 0, 0, 0, tilt);
    });
    // a soft curl of cloud on top of its head, curling forward like a little wave
    var cpts = []; for (var ci = 0; ci <= 8; ci++) { var ct = ci / 8, ca = ct * Math.PI * 1.3; cpts.push(V3(0, 0.04 + Math.sin(ca) * 0.024 * (1 - ct * 0.3), 0.003 - Math.cos(ca) * 0.024 * (1 - ct * 0.3))); }
    plumeTube(cpts, 0.015, 0.005, head, 0.004, [0, 0, 1]);          // (a soft curl of fur on top of its head, like a little wave)
    // a sun-gem on its brow: a little faceted stone glowing gold, with a sparkle
    var gemMat = new THREE.MeshPhysicalMaterial({ color: pal.gem, roughness: 0.05, metalness: 0.2, clearcoat: 1, emissive: pal.gem, emissiveIntensity: 0.6, flatShading: true });
    var gemSet = new THREE.Group(); gemSet.position.set(0, 0.028, 0.046); gemSet.rotation.x = -0.75; head.add(gemSet);
    var gem = new THREE.Mesh(new THREE.CylinderGeometry(0.0034, 0.0046, 0.0028, 8, 1).translate(0, 0.0014, 0), gemMat); gem.rotation.x = Math.PI / 2; gemSet.add(gem);   // (a little cut stone: a flat table, sloping facets)
    var pav = new THREE.Mesh(new THREE.ConeGeometry(0.0046, 0.004, 8), gemMat); pav.rotation.x = -Math.PI / 2; pav.position.z = -0.002; gemSet.add(pav);
    var goldMat = new THREE.MeshStandardMaterial({ color: 0xffe2a0, metalness: 0.85, roughness: 0.22 });
    var bezel = new THREE.Mesh(new THREE.TorusGeometry(0.0048, 0.0006, 6, 24), goldMat); gemSet.add(bezel);
    for (var pr = 0; pr < 8; pr++) { var pa2 = pr / 8 * Math.PI * 2, ray = new THREE.Mesh(new THREE.ConeGeometry(0.0007, pr % 2 ? 0.0035 : 0.0055, 4), goldMat); ray.position.set(Math.cos(pa2) * (pr % 2 ? 0.0066 : 0.0075), Math.sin(pa2) * (pr % 2 ? 0.0066 : 0.0075), -0.0004); ray.rotation.z = pa2 - Math.PI / 2; gemSet.add(ray); }   // (set in a tiny golden sun)
    var gemSpark = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: pal.gem, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); gemSpark.scale.set(0.03, 0.03, 1); gemSpark.position.set(0, 0.03, 0.052); head.add(gemSpark);
    // big wings, built like a bird's: a curved arm and hand along the leading edge; long primaries fanned from the hand
    // with little gaps between their tips, secondaries along the arm and tertials by the body; four rows of coverts
    // shingled over their bases (greater, median, lesser and tiny marginals along the edge, each row smaller and
    // rounder); a little alula at the wrist; soft scapulars over its shoulder; and a soft furred leading edge. Each
    // feather a little different in tint, length and twist, cupped across and curving along its length; every barb
    // and shaft catching the light. Drawn in batches, a row at a time
    var ft = zFeatherTex(pal, 0), ct = zFeatherTex(pal, 1);
    var flightMat = zSoftMat({ map: ft.map, bumpMap: ft.bump, bumpScale: 0.12, color: 0xffffff, roughness: 0.75, side: THREE.DoubleSide, alphaTest: 0.4 }, 0.38, 0.45, 0);
    var covertMat = zSoftMat({ map: ct.map, bumpMap: ct.bump, bumpScale: 0.1, color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide, alphaTest: 0.4 }, 0.4, 0.45, 0);
    var featherGeo = (function () {
      var geo = new THREE.PlaneGeometry(1, 1, 8, 20).translate(0, 0.5, 0), p = geo.attributes.position;
      for (var i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i); p.setZ(i, -x * x * 0.28 + y * y * 0.1 + x * y * 0.05); }   // (cupped across, curving along, a slight twist)
      geo.computeVertexNormals(); return geo;
    })();
    var wings = [];
    [-1, 1].forEach(function (s) {
      var wg = new THREE.Group(); wg.position.set(s * 0.1, BY + 0.075, 0.07); body.add(wg); wings.push({ g: wg, s: s });   // (rooted in the fleece over its shoulders)
      var arm = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(s * 0.025, 0.05, -0.02), V3(s * 0.04, 0.1, -0.07), V3(s * 0.036, 0.135, -0.15), V3(s * 0.022, 0.15, -0.23)]);   // (swept back along its back)   // shoulder, elbow, wrist, hand, tip
      var out = V3(s, 0.45, 0.1).normalize(), rows = [],   // (tilted to follow the curve of its back)
          q = new THREE.Quaternion();
      function addRow(n, u0, u1, lenF, wid, lift, mat, tint, shadow, dirF, back) {   // n feathers along the arm from u0 to u1, lifted out over the rows beneath
        var im = new THREE.InstancedMesh(featherGeo, mat, n), mx = new THREE.Matrix4(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), c = new THREE.Color();
        for (var i = 0; i < n; i++) {
          var u = u0 + (u1 - u0) * (n > 1 ? i / (n - 1) : 0), p = arm.getPointAt(u), len = lenF(u) * (0.94 + glimR(i * 2.3 + n * 7) * 0.1);
          Y.copy(dirF(u)).normalize();
          q.setFromAxisAngle(out, (glimR(i * 4.1 + n) - 0.5) * 0.08); Y.applyQuaternion(q);   // (each a little askew)
          Z.copy(out).addScaledVector(Y, -out.dot(Y)).normalize(); X.crossVectors(Y, Z).normalize();
          q.setFromAxisAngle(Y, (glimR(i * 6.7 + n) - 0.5) * 0.25); X.applyQuaternion(q); Z.applyQuaternion(q);   // (and twisted a touch)
          mx.makeBasis(X, Y, Z).scale(V3(wid * (0.9 + glimR(i * 3.1 + n) * 0.2), len, len));
          var lf = lift + i * 0.0005;
          mx.setPosition(p.x + out.x * lf - Y.x * (back || 0), p.y - 0.004 - Y.y * (back || 0), p.z + out.z * lf - Y.z * (back || 0));
          im.setMatrixAt(i, mx); c.setRGB(1, 1, 1).multiplyScalar(tint * (0.94 + glimR(i * 5.7 + n * 3) * 0.1)); im.setColorAt(i, c);
        }
        im.castShadow = !!shadow; wg.add(im); rows.push(im); return im;
      }
      function sweep(a, b) { return function (u) { return V3(0, a + (b - a) * u, -1); }; }
      addRow(12, 0.6, 1, function (u) { return 0.2 + 0.08 * Math.sin((u - 0.6) / 0.4 * Math.PI * 0.75); }, 0.05, 0, flightMat, 1, true, function (u) { return V3(0, -0.05 + (u - 0.6) * 2.4, -1); });   // the primaries, fanned from the hand
      addRow(14, 0.06, 0.6, function (u) { return 0.15 + u * 0.06; }, 0.052, 0.0015, flightMat, 1, true, sweep(-0.45, 0.15));   // the secondaries, along the arm
      addRow(4, 0, 0.1, function () { return 0.12; }, 0.05, 0.003, flightMat, 1.02, true, sweep(-0.75, -0.6));   // the tertials, by its body
      addRow(24, 0.04, 0.98, function (u) { return 0.075 + u * 0.035; }, 0.045, 0.005, covertMat, 1.02, true, sweep(-0.35, 0.95), 0.004);   // the greater coverts
      addRow(22, 0.05, 0.94, function (u) { return 0.046 + u * 0.012; }, 0.036, 0.009, covertMat, 1.03, false, sweep(-0.3, 0.9), 0.004);   // the median coverts
      addRow(20, 0.06, 0.9, function () { return 0.03; }, 0.028, 0.013, covertMat, 1.04, false, sweep(-0.25, 0.85), 0.006);   // the lesser coverts
      addRow(26, 0.04, 0.88, function () { return 0.017; }, 0.018, 0.017, covertMat, 1.06, false, sweep(-0.2, 0.8), 0.008);   // and tiny marginals along the edge
      var alula = new THREE.InstancedMesh(featherGeo, covertMat, 4), mx2 = new THREE.Matrix4(), wr = arm.getPointAt(0.55);   // the alula: little feathers at the wrist
      for (var a = 0; a < 4; a++) { mx2.makeRotationFromEuler(new THREE.Euler(-1.75 + a * 0.15, s * Math.PI / 2, 0, 'XYZ')).scale(V3(0.022, 0.05 - a * 0.007, 0.05)); mx2.setPosition(wr.x + s * (0.02 + a * 0.0015), wr.y + 0.004, wr.z + 0.004); alula.setMatrixAt(a, mx2); alula.setColorAt(a, new THREE.Color(1.04, 1.04, 1.04)); }
      wg.add(alula);
      var scap = new THREE.InstancedMesh(featherGeo, covertMat, 8);   // scapulars: soft feathers lying back over its shoulder
      for (var sc = 0; sc < 8; sc++) { mx2.makeRotationFromEuler(new THREE.Euler(-1.75 + sc * 0.04, s * (Math.PI / 2 - 0.2), 0, 'XYZ')).scale(V3(0.035, 0.07 + sc * 0.005, 0.07)); mx2.setPosition(s * (-0.016 + sc * 0.002), 0.01 + sc * 0.005, 0.008 - sc * 0.006); scap.setMatrixAt(sc, mx2); scap.setColorAt(sc, new THREE.Color(1, 1, 1).multiplyScalar(0.98 + glimR(sc * 2.3) * 0.06)); }   // (each tinted, like the rows: they share their material)
      wg.add(scap);
      var edgeGeo = new THREE.TubeGeometry(arm, 48, 1, 14, false), ep = edgeGeo.attributes.position;   // the leading edge, soft and furred, slimming toward the tip
      for (var ti = 0; ti <= 48; ti++) { var tu = ti / 48, cpt = arm.getPointAt(tu), r = 0.014 - tu * 0.009; for (var tj = 0; tj <= 14; tj++) { var tk = ti * 15 + tj; ep.setXYZ(tk, cpt.x + (ep.getX(tk) - cpt.x) * r, cpt.y + (ep.getY(tk) - cpt.y) * r, cpt.z + (ep.getZ(tk) - cpt.z) * r); } }
      edgeGeo.computeVertexNormals();
      abPart(edgeGeo, plush, 0, 0, 0, 0, 0, 0, wg).castShadow = true;
      furred(edgeGeo, fur, 0, 0, 0, [1, 1, 1], wg, 0.004, [0, -0.3, -1]);
      ball(-s * 0.012, -0.004, -0.01, 0.045, 0.034, 0.07, wg, 0.008, [0, -0.3, -1], 0, fur);   // (a soft, smooth swell of its shoulder where each wing grows, so they blend in)
      wings[wings.length - 1].rows = rows;
    });
    // short, plush legs, each ending in a puff of cloud instead of a hoof, with a gold band round the ankle
    var bandMat = new THREE.MeshStandardMaterial({ color: 0xffe0a0, metalness: 0.75, roughness: 0.25, emissive: pal.gold, emissiveIntensity: 0.15 });
    var legs = [];
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (lp) {
      var front = lp[1] > 0, hip = new THREE.Group(); hip.position.set(lp[0] * 0.068, BY - 0.05, front ? 0.1 : -0.1); body.add(hip);
      var lg = new THREE.CylinderGeometry(0.018, 0.025, 0.18, 20, 8); part(lg, plush, 0, -0.09, 0, 1, 1, 1, hip).castShadow = true;
      furred(lg, fur, 0, -0.09, 0, [1, 1, 1], hip, 0.0035, [0, -1, 0]);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.0185, 0.0028, 8, 24), bandMat); ring.rotation.x = Math.PI / 2; ring.position.y = -0.155; hip.add(ring);
      var foot = new THREE.Group(); foot.position.set(0, -0.185, 0); hip.add(foot);
      ball(0, 0.006, 0.004, 0.027, 0.02, 0.029, foot, 0.008, [0, -1, 0.3], 0, fur);   // its round, soft cloud-puff foot
      legs.push({ hip: hip, ph: lp[0] * lp[1] > 0 ? 0 : Math.PI, front: front });
    });
    // a long, curling tail of cloud
    var tail = new THREE.Group(); tail.position.set(0, BY + 0.05, -0.21); body.add(tail);
    var tpts = []; for (var ti = 0; ti <= 8; ti++) { var tt = ti / 8, ta = tt * Math.PI * 1.35; tpts.push(V3(0, Math.sin(ta) * 0.085 * (1 - tt * 0.3), -0.01 - (1 - Math.cos(ta)) * 0.05 * (1 - tt * 0.2))); }
    plumeTube(tpts, 0.03, 0.009, tail, 0.012, [0, 0, 1]);           // (one smooth, fluffy plume, curling up over its back)
    // breezes swirling round it: thin streaks of light circling slowly
    var breezes = [];
    for (var bz = 0; bz < 3; bz++) {
      var pts = []; for (var bp = 0; bp <= 30; bp++) { var ba = bp / 30 * Math.PI * 1.3; pts.push(V3(Math.sin(ba) * 0.3, Math.sin(ba * 2 + bz) * 0.03 + bp * 0.002, Math.cos(ba) * 0.34)); }
      var bm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.0035, 4, false), new THREE.MeshBasicMaterial({ map: zBreezeTex, color: bz === 1 ? pal.low : 0xffffff, transparent: true, opacity: 0.55, depthWrite: false }));
      var bg = new THREE.Group(); bg.position.y = BY - 0.05 + bz * 0.12; bg.rotation.set((bz - 1) * 0.25, bz * 2.1, 0); bg.add(bm); root.add(bg); breezes.push({ g: bg, sp: 0.5 + bz * 0.18 });
    }
    // little clouds drifting off it, puffs under its feet, and a soft warm glow round it
    var wisps = [];
    for (var wk = 0; wk < 8; wk++) { var ws = new THREE.Sprite(new THREE.SpriteMaterial({ map: zCloudTex, color: wk % 3 ? 0xffffff : pal.low, transparent: true, opacity: 0, depthWrite: false })); ws.scale.set(0.09, 0.06, 1); root.add(ws); wisps.push({ s: ws, t: glimR(wk + 50) * 2, x: 0, y: 0, z: 0 }); }
    var under = new THREE.Sprite(new THREE.SpriteMaterial({ map: zCloudTex, color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false })); under.scale.set(0.5, 0.18, 1); under.position.set(0, 0.06, 0); root.add(under);
    var rainbow = new THREE.Sprite(new THREE.SpriteMaterial({ map: zRainbowTex, transparent: true, opacity: 0, depthWrite: false })); rainbow.scale.set(0.6, 0.3, 1); rainbow.position.set(0, 1.0, 0); root.add(rainbow);   // (a little rainbow, when it's happy)
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(1.3, 1.3, 1); glow.position.set(0, 0.5, 0); root.add(glow);
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.42, 0.1575, 1); tag.position.set(0, 1.2, 0); tag.renderOrder = 6; root.add(tag);
    return { root: root, body: body, head: head, ears: ears, wings: wings, legs: legs, tail: tail, tails: tails, lids: lids, fleece: fleece, breezes: breezes, wisps: wisps, under: under, rainbow: rainbow, gemMat: gemMat, gemSpark: gemSpark, glow: glow, tagCv: tagCv, tagTex: tagTex, hum: 0, wool: 0.9 };
  }
  // when its cloud is full and ready to shear, a little golden cloud floats over it
  function zephyraBuildExtras(g) {
    var sz = GLIM_STALLS[g.stall], pal = ZEPHYRA_PALS[g.pal % ZEPHYRA_PALS.length];
    var puff = new THREE.Group(); abRoom.add(puff);
    var cs = new THREE.Sprite(new THREE.SpriteMaterial({ map: zCloudTex, color: 0xfff2e0, transparent: true, depthWrite: false })); cs.scale.set(0.2, 0.135, 1); puff.add(cs);
    var eg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    eg.scale.set(0.45, 0.45, 1); puff.add(eg);
    g.eggMesh = puff; g.eggGlow = eg;
    var hay = abPart(wbLumpGeo(300 + g.stall, 0.25), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.3, 0.94, sz + 1.0);
    hay.scale.set(0.16, 0.07, 0.16); g.hayMesh = hay;
    g.slate.map = glimSlateTex(g.name, 'Zephyra'); g.slate.needsUpdate = true;
  }
  // every frame, for a Zephyra: it floats, bobbing gently, paddling its little legs as it drifts along; its wings
  // flutter, its scarf streams and ripples, its tail curls and sways, the breezes circle it; it looks about, flicks
  // its ears and blinks; its cloud grows fuller each day it's cared for; and when petted it bounces happily, wings
  // fluttering fast, under a little rainbow
  function zephyraAnimate(g, dt, t, moving) {
    var m = g.m;
    if (moving) g.hop += dt * 5;
    var happy = g.pet > 0;
    if (happy) { g.pet -= dt; m.hum += dt; } else m.hum = 0;
    var bounce = happy ? Math.abs(Math.sin(m.hum * 5)) * 0.05 : 0;
    m.root.position.y = 0.035 + Math.sin(t * 1.4 + g.stall) * 0.015 + bounce;   // (floating just above the ground)
    m.legs.forEach(function (l) { l.hip.rotation.x = l.hip.rotation.x * 0.85 + (moving ? Math.sin(g.hop + l.ph) * 0.35 : Math.sin(t * 1.4 + l.ph) * 0.06) * 0.15; });
    m.body.rotation.x = moving ? 0.05 : 0; m.body.rotation.z = Math.sin(t * 0.9 + g.stall) * 0.02;
    var look = Math.sin(t * 0.27 + g.stall * 1.9);
    m.head.rotation.set(0.1 + (happy ? -0.15 + Math.sin(m.hum * 5) * 0.08 : Math.max(0, Math.sin(t * 0.17 + g.stall) - 0.75) * 1.0), look * 0.5 * (happy ? 0.2 : 1), happy ? Math.sin(m.hum * 2.5) * 0.18 : Math.sin(t * 0.37 + g.stall) * 0.06);
    m.ears.forEach(function (e, k) { var flick = Math.max(0, Math.sin(t * 0.7 + k * 2.4 + g.stall) - 0.92) * 12; e.g.rotation.z = e.s * (-Math.sin(t * 1.1 + k) * 0.05 - flick * 0.2 - (happy ? 0.25 : 0)); e.g.rotation.x = Math.sin(t * 0.8 + k) * 0.05; });
    var flap = happy ? Math.sin(m.hum * 18) : Math.sin(t * 2.2 + g.stall) * 0.5 + (moving ? Math.sin(g.hop * 2) * 0.5 : 0);
    m.wings.forEach(function (w) { w.g.rotation.set(happy ? -0.15 : 0, happy ? -w.s * 0.25 : 0, w.s * (0.02 + flap * 0.28)); });   // (held a little open, opening wider and fluttering when happy)
    m.tail.rotation.set(Math.sin(t * 1.2 + g.stall) * 0.08, Math.sin(t * 0.9 + g.stall) * 0.25 + (happy ? Math.sin(m.hum * 9) * 0.3 : 0), 0);
    m.tails.forEach(function (sc) {                                   // the scarf ends rippling in the breeze
      var p = sc.m.geometry.attributes.position, b = sc.base;
      for (var i = 0; i < p.count; i++) {
        var f = -b[i * 3 + 1] / sc.len;                                 // (0 at the knot, 1 at the fringe)
        var across = b[i * 3] / 0.018;                                // (and twisting a little, the silk curling at its edges)
        p.setXYZ(i, b[i * 3] + Math.sin(t * 3.2 + f * 6 + sc.ph) * 0.012 * f + f * 0.015 + across * across * 0.002, b[i * 3 + 1] * (0.75 - (moving ? 0.25 : 0)), -f * sc.len * (0.5 + (moving ? 0.3 : 0)) + Math.sin(t * 2.4 + f * 5 + sc.ph) * 0.01 * f);
      }
      p.needsUpdate = true;
    });
    m.breezes.forEach(function (b) { b.g.rotation.y += dt * b.sp * (happy ? 3 : 1); });
    var bt = (t * 0.19 + g.stall * 0.41) % 1, blink = happy ? 0.7 : (bt < 0.035 ? Math.sin(bt / 0.035 * Math.PI) : 0);
    m.lids.forEach(function (l) { l.visible = blink > 0.03; l.rotation.x = -0.62 + blink * 1.55; });
    var full = g.egg ? 1.06 : 0.9 + Math.min(ZEPHYRA_DAYS, g.days) * 0.03;   // (its cloud grows fuller day by day, and is trimmed back when sheared)
    m.wool += (full - m.wool) * Math.min(1, dt * 2);
    m.fleece.scale.setScalar(m.wool);
    var pulse = 0.5 + Math.sin(t * 1.3 + g.stall) * 0.5;
    m.gemMat.emissiveIntensity = 0.45 + pulse * 0.35; m.gemSpark.material.opacity = 0.25 + pulse * 0.35; m.gemSpark.material.rotation = t * 0.5;
    m.under.material.opacity = 0.35 + Math.sin(t * 1.4 + g.stall) * 0.08;
    m.wisps.forEach(function (w) {                                    // little clouds drifting up and back off it
      w.t += dt * (happy ? 0.6 : 0.25);
      if (w.t > 1) { w.t -= 1 + Math.random() * 2; w.x = (Math.random() - 0.5) * 0.3; w.y = 0.4 + Math.random() * 0.12; w.z = -0.1 - Math.random() * 0.15; }
      w.s.material.opacity = w.t > 0 ? Math.sin(w.t * Math.PI) * 0.6 : 0;
      w.s.position.set(w.x, w.y + Math.max(0, w.t) * 0.3, w.z - Math.max(0, w.t) * 0.15);
      w.s.scale.set(0.07 + w.t * 0.06, 0.047 + w.t * 0.04, 1);
    });
    m.rainbow.material.opacity += ((happy ? 0.85 : 0) - m.rainbow.material.opacity) * Math.min(1, dt * 3);
    m.glow.material.opacity = 0.13 + pulse * 0.05;
    if (g.egg) { g.eggMesh.position.set(g.x, 1.02 + Math.sin(t * 2) * 0.04, g.z); g.eggGlow.material.opacity = 0.4 + Math.sin(t * 2 + g.stall) * 0.12; }
  }
  function zephyraAction(g, wx, wz) {                                // shearing, feeding and petting a Zephyra
    if (g.egg) {
      if (!bag.some(function (b) { return b && b.id === 'shears'; })) { showToast(g.name + '\'s cloud is full and ready to shear! You need Shears: buy them at the counter ✂️', 2800); return; }
      if (!roomFor(['cloudWool'])) { bagFull(); return; }
      addItem('cloudWool', 1); g.egg = false; g.days = 0; glimRefresh(g); popSound(); g.pet = 1.4;
      showToast('You sheared ' + g.name + ' and got a soft bundle of Cloud Wool! ☁️✨', 2400);
      return;
    }
    var day = Math.min(ZEPHYRA_DAYS, g.days + 1);
    var news = day >= ZEPHYRA_DAYS ? ' Their cloud will be ready to shear tomorrow morning!' : ' Day ' + day + ' of ' + ZEPHYRA_DAYS + ' toward Cloud Wool.';
    if (!g.fed) {
      if (!takeItem('hay', 1)) { showToast(g.name + ' is hungry! Buy hay at the counter to feed them 🌾', 2600); return; }
      g.fed = true; glimRefresh(g); popSound(); g.pet = 0.8; g.face = Math.atan2(-3.7 - g.x, GLIM_STALLS[g.stall] + 1.0 - g.z);
      showToast(g.name + ' nibbles the hay happily 🌾' + (g.petted ? news : ' Now give them a pet!'), 2600);
      return;
    }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 2.2;
      g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, 0.85, g.z); popSound();
      showToast(g.name + ' bounces happily, wings fluttering, a little rainbow over them 💜' + news, 2800);
      return;
    }
    g.pet = 1.4; glimHeartBurst(g.x, 0.85, g.z);
    showToast(g.name + ' is fed, petted and happy ✧' + (day >= ZEPHYRA_DAYS ? ' Cloud ready to shear tomorrow morning!' : ' Day ' + day + ' of ' + ZEPHYRA_DAYS + ' done. Come back tomorrow!'), 2400);
  }
  // ---------- Lunapaw ----------
  // Little spirits of the moonlit night, shaped a bit like a raccoon kit (but not a raccoon): a big round head on a
  // small, chubby body, in soft moon-white fur that deepens over its back into a starry night sky, tiny stars
  // twinkling in it; a night-sky mask across its eyes, shimmering with a faint nebula and glowing stars; huge
  // galaxy eyes; tall pointed ears tipped with starlight; a glowing crescent moon on its brow; a big curling tail
  // banded with glowing stars, a little moon shining at its tip; and a tiny moon of its own, orbiting round it. Feed
  // one hay and pet it every day for two days in a row, and the next morning it leaves you a Moonpearl it found in
  // the night. Miss a day and the count starts over. When petted it sits up and rubs its little paws together
  var LUNA_COST = 480, LUNA_DAYS = 2;
  var LUNA_PALS = [                                                   // a moonbeam one, a starlight one and an eclipse one
    { name: 'Moonbeam', fur: 0xeceeff, belly: 0xffffff, night: 0x2c2c78, mask: 0x23235e, nebula: 0x8a5ad8, ring: 0x2c2c78, paw: 0x34347a, rim: 0xffffff, inner: 0xd8b8ff, nose: 0xffa8c8, star: 0xfff4c8, glow: 0xb8b0ff, iris: ['#7a6aff', '#1a1060'] },
    { name: 'Starlight', fur: 0xe4f2ff, belly: 0xffffff, night: 0x1a2a5e, mask: 0x14204e, nebula: 0x3aa8d8, ring: 0x1a2a5e, paw: 0x22346a, rim: 0xffffff, inner: 0xa8d8ff, nose: 0xffb8c8, star: 0xffe08a, glow: 0x9ad8ff, iris: ['#3ab0ff', '#0a2050'] },
    { name: 'Eclipse', fur: 0xfff0e2, belly: 0xffffff, night: 0x5a2a5a, mask: 0x4a1e4e, nebula: 0xff8a6a, ring: 0x5a2a5a, paw: 0x5a2e5e, rim: 0xffffff, inner: 0xffc8b0, nose: 0xff9aa8, star: 0xffd8a0, glow: 0xffb8a0, iris: ['#ff8a5a', '#4a1020'] }
  ];
  // a Moonpearl: a round, glowing pearl with a soft sheen of moonlight across it
  var moonpearlIcon = glimCanvas(96, 96, function (g, w, h) {
    var glow = g.createRadialGradient(48, 50, 4, 48, 50, 46); glow.addColorStop(0, 'rgba(190,210,255,0.7)'); glow.addColorStop(1, 'rgba(190,210,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    var pg = g.createRadialGradient(40, 40, 3, 48, 50, 27); pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.45, '#f0ecff'); pg.addColorStop(0.8, '#d4d4f2'); pg.addColorStop(1, '#a8acd8');
    g.fillStyle = pg; g.beginPath(); g.arc(48, 50, 26, 0, Math.PI * 2); g.fill();
    var sh = g.createLinearGradient(26, 60, 70, 40); sh.addColorStop(0, 'rgba(255,200,230,0)'); sh.addColorStop(0.5, 'rgba(255,200,240,0.35)'); sh.addColorStop(0.7, 'rgba(180,230,255,0.35)'); sh.addColorStop(1, 'rgba(180,230,255,0)');
    g.fillStyle = sh; g.beginPath(); g.arc(48, 50, 26, 0, Math.PI * 2); g.fill();   // (a rainbow sheen, like real nacre)
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(39, 39, 7, 4.5, -0.6, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff'; [[16, 26], [80, 30], [78, 80]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  ITEMS.moonpearl = { name: 'Moonpearl', price: 240, icon: '⚪', img: moonpearlIcon, fill: 88, info: 'A round pearl that glows softly with moonlight, found in the night by a happy Lunapaw. Feed and pet yours every day for two days in a row, and it leaves one for you the next morning. Sells for a very good price at the shipping bin.' };
  var lunaShopIcon = glimCanvas(128, 128, function (g, w, h) {       // a little portrait of one, for the shop
    var sky = g.createRadialGradient(64, 64, 4, 64, 64, 64); sky.addColorStop(0, 'rgba(180,170,255,0.65)'); sky.addColorStop(1, 'rgba(180,170,255,0)'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    for (var k = 0; k < 8; k++) { g.strokeStyle = k % 2 ? '#eceeff' : '#2c2c78'; g.lineWidth = 11; g.lineCap = 'round'; g.beginPath(); g.arc(34, 62, 30, -2.2 + k * 0.38, -1.84 + k * 0.38); g.stroke(); }   // the curling, star-banded tail
    g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(30, 30, 5, 0, Math.PI * 2); g.fill();   // the little moon at its tip
    g.fillStyle = '#eceeff'; g.beginPath(); g.ellipse(60, 92, 26, 19, 0, 0, Math.PI * 2); g.fill();   // the round body, night over its back
    g.fillStyle = '#2c2c78'; g.beginPath(); g.ellipse(56, 82, 20, 8, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = '#34347a'; [[46, 110], [60, 112], [76, 110]].forEach(function (p) { g.beginPath(); g.ellipse(p[0], p[1], 7, 5, 0, 0, Math.PI * 2); g.fill(); });   // night-coloured socks
    [-1, 1].forEach(function (s) { g.fillStyle = '#eceeff'; g.beginPath(); g.moveTo(84 + s * 6, 34); g.lineTo(84 + s * 15, 6); g.lineTo(84 + s * 20, 34); g.closePath(); g.fill(); g.fillStyle = '#2c2c78'; g.beginPath(); g.moveTo(84 + s * 12, 16); g.lineTo(84 + s * 15, 6); g.lineTo(84 + s * 17, 16); g.closePath(); g.fill(); g.fillStyle = '#fff4c8'; g.fillRect(84 + s * 15 - 1, 3, 2, 6); g.fillRect(84 + s * 15 - 3, 5, 6, 2); });   // tall ears tipped with starlight
    g.fillStyle = '#eceeff'; g.beginPath(); g.arc(84, 52, 24, 0, Math.PI * 2); g.fill();   // the big round head
    g.fillStyle = '#23235e'; g.beginPath(); g.ellipse(84, 52, 23, 9, 0, 0, Math.PI * 2); g.fill();   // the night-sky mask...
    g.fillStyle = '#fff4c8'; [[66, 50], [100, 54], [72, 56], [96, 47], [84, 58]].forEach(function (p) { g.fillRect(p[0], p[1], 1.6, 1.6); });   // ...full of stars
    [-1, 1].forEach(function (s) { g.fillStyle = '#05040a'; g.beginPath(); g.arc(84 + s * 10, 51, 7.5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#7a6aff'; g.beginPath(); g.arc(84 + s * 10, 52, 5.5, 0, Math.PI * 2); g.fill(); g.fillStyle = '#05040a'; g.beginPath(); g.arc(84 + s * 10, 51.5, 3.4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(84 + s * 10 - 2.5, 48.5, 2.2, 0, Math.PI * 2); g.fill(); });   // huge galaxy eyes
    g.fillStyle = '#ffa8c8'; g.beginPath(); g.ellipse(84, 64, 4, 3, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,140,180,0.5)'; [-1, 1].forEach(function (s) { g.beginPath(); g.ellipse(84 + s * 16, 62, 4, 2.5, 0, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#ffe8a0'; g.beginPath(); g.arc(84, 36, 4, 0.6, Math.PI * 2 - 0.6); g.arc(86, 35, 3, Math.PI * 2 - 1, 1, true); g.fill();   // the crescent moon on its brow
    g.fillStyle = '#fff8e8'; g.beginPath(); g.arc(112, 30, 5, 0, Math.PI * 2); g.fill();   // its tiny orbiting moon
    g.fillStyle = '#fff'; [[14, 100], [40, 14], [116, 100]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  function lunaEyeTex(pal) {                                          // a huge galaxy eye: a deep iris swirling with nebula and stars round a big pupil
    return new THREE.CanvasTexture(glimCanvas(256, 256, function (g, w, h) {
      g.fillStyle = '#05040a'; g.fillRect(0, 0, w, h);
      var ig = g.createRadialGradient(128, 170, 8, 128, 128, 100); ig.addColorStop(0, pal.iris[0]); ig.addColorStop(0.65, pal.iris[0]); ig.addColorStop(0.95, pal.iris[1]); ig.addColorStop(1, '#030206');
      g.fillStyle = ig; g.beginPath(); g.arc(128, 128, 100, 0, Math.PI * 2); g.fill();
      for (var sw = 0; sw < 3; sw++) { g.strokeStyle = ['rgba(255,180,240,0.25)', 'rgba(160,220,255,0.25)', 'rgba(255,240,200,0.2)'][sw]; g.lineWidth = 9; g.beginPath(); g.arc(128, 128, 70 + sw * 9, sw * 2.1, sw * 2.1 + 2.6); g.stroke(); }   // (swirls of nebula)
      for (var st = 0; st < 40; st++) { var a = glimR(st * 3.1) * Math.PI * 2, r = 58 + glimR(st * 5.3) * 38; g.fillStyle = 'rgba(255,255,240,' + (0.4 + glimR(st) * 0.6) + ')'; g.beginPath(); g.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 0.8 + glimR(st * 7) * 1.6, 0, Math.PI * 2); g.fill(); }   // (and stars)
      g.fillStyle = '#030206'; g.beginPath(); g.arc(128, 124, 56, 0, Math.PI * 2); g.fill();   // the big pupil
      g.fillStyle = 'rgba(255,245,210,0.9)'; g.beginPath(); g.arc(150, 168, 12, 0.6, Math.PI * 2 - 0.6); g.arc(156, 164, 10, Math.PI * 2 - 1.1, 1.1, true); g.fill();   // a little crescent moon shining low in it
    }));
  }
  // building one: a chubby body; a round head with a bandit's mask; big eyes; a bushy ringed tail; little hands
  function lunaBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(); root.add(body); abRoom.add(root);
    var seg = new THREE.SphereGeometry(1, 40, 28);
    var furCol = new THREE.Color(pal.fur), bellyCol = new THREE.Color(pal.belly), maskCol = new THREE.Color(pal.mask), rimCol = new THREE.Color(pal.rim), pawCol = new THREE.Color(pal.paw), nightCol = new THREE.Color(pal.night), nebCol = new THREE.Color(pal.nebula), starCol = new THREE.Color(pal.star);
    var skinV = zSoftMat({ vertexColors: true, roughness: 0.95, color: 0xe8e8ec }, 0.18, 0.35, 0);   // (the skin under the fur, coloured like it)
    var furV = zFurMat(new THREE.Color(1.08, 1.08, 1.08), 2300, 0, true, 0.95, 0.6), headFurV = zFurMat(new THREE.Color(1.08, 1.08, 1.08), 3000, 0, true, 0.95, 0.6);   // (a short, dense, soft pile, like a plush toy)
    function part(geo, mat, x, y, z, sx, sy, sz, parent, rx, ry, rz) { var m = abPart(geo, mat, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); m.scale.set(sx, sy, sz); return m; }
    function coat(geo, fmat, parent, len, flow, comb, x, y, z) {      // a shape and its fur
      var sk = abPart(geo, skinV, x || 0, y || 0, z || 0, 0, 0, 0, parent); sk.castShadow = true;
      var f = abPart(zFurShell(geo, 16, len, [1, 1, 1], flow, comb === undefined ? 0.7 : comb), fmat, x || 0, y || 0, z || 0, 0, 0, 0, parent); f.castShadow = false;
      return sk;
    }
    function shaped(seg2, fn) {                                       // a sphere reshaped and coloured: fn(n, pos, col) for each point
      var geo = new THREE.SphereGeometry(1, seg2[0], seg2[1]), p = geo.attributes.position, cols = [], n = new THREE.Vector3(), q = new THREE.Vector3(), c = new THREE.Color();
      for (var i = 0; i < p.count; i++) { n.set(p.getX(i), p.getY(i), p.getZ(i)).normalize(); q.copy(n); fn(n, q, c); p.setXYZ(i, q.x, q.y, q.z); cols.push(c.r, c.g, c.b); }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals(); return geo;
    }
    function ss(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
    // the body: chubby and pear-shaped (round at the rear), silver on top, pale underneath; it can sit up, pivoting
    // at its hips
    var BY = 0.165, torso = new THREE.Group(); torso.position.set(0, BY, -0.07); body.add(torso);
    var tb = new THREE.Group(); tb.position.set(0, 0, 0.07); torso.add(tb);
    function sm(a, b, k) { var h = Math.max(0, Math.min(1, 0.5 + 0.5 * (b - a) / k)); return b + (a - b) * h - k * h * (1 - h); }
    function ell(x, y, z, cx, cy, cz, rx, ry, rz) { var ex = (x - cx) / rx, ey = (y - cy) / ry, ez = (z - cz) / rz; return (Math.sqrt(ex * ex + ey * ey + ez * ez) - 1) * Math.min(rx, ry, rz); }
    function plushBody(x, y, z) {                                     // a small, round, stuffed body: chubby haunches, a full chest and a round tummy, all melted softly together
      var d = ell(x, y, z, 0, 0, 0, 0.07, 0.066, 0.098);
      d = sm(d, ell(x, y, z, 0.045, -0.018, -0.05, 0.048, 0.05, 0.052), 0.03); d = sm(d, ell(x, y, z, -0.045, -0.018, -0.05, 0.048, 0.05, 0.052), 0.03);   // (haunches)
      d = sm(d, ell(x, y, z, 0, 0.008, 0.058, 0.056, 0.058, 0.05), 0.03);   // (chest)
      d = sm(d, ell(x, y, z, 0, -0.028, 0.0, 0.062, 0.045, 0.08), 0.03);    // (tummy)
      return Math.max(d, -(y + 0.07) * 0.7);
    }
    var backPts = [];
    var bodyGeo = shaped([72, 48], function (n, q, c) {
      var lo = 0.02, hi = 0.2;                                         // (out from the middle to the edge of its soft, stuffed shape)
      for (var it = 0; it < 22; it++) { var mid = (lo + hi) / 2; if (plushBody(n.x * mid, n.y * mid, n.z * mid) < 0) lo = mid; else hi = mid; }
      q.copy(n).multiplyScalar(lo);
      c.copy(furCol).lerp(bellyCol, ss(0.1, -0.55, n.y) * (0.6 + Math.max(0, n.z) * 0.4));
      var sky = ss(0.15, 0.75, n.y + Math.sin(n.z * 5 + n.x * 3) * 0.08);   // (deepening into a starry night over its back, its edge softly wavering)
      c.lerp(nightCol, sky * 0.92).lerp(nebCol, sky * Math.max(0, Math.sin(n.z * 4 - n.x * 6)) * 0.22);
      if (sky > 0.75 && glimR(q.x * 731 + q.y * 977 + q.z * 313) < 0.02) backPts.push(q.clone(), n.clone());   // (somewhere for a star)
    });
    coat(bodyGeo, furV, tb, 0.008, [0, -0.25, -1]);
    var chestG = shaped([32, 24], function (n, q, c) { q.set(n.x * 0.036, n.y * 0.03, n.z * 0.02); c.copy(bellyCol); });
    coat(chestG, furV, tb, 0.011, [0, -1, 0.3], 1.2, 0, 0.03, 0.098);   // a fluffy white tuft on its chest
    // the head: round, with full cheeks and a pointed little muzzle; a dark mask across its eyes, white brows above
    // and a white muzzle below, a dark stripe down its nose
    var head = new THREE.Group(); head.position.set(0, 0.085, 0.1); head.rotation.x = 0.1; head.scale.setScalar(1.3); tb.add(head);   // (a big round head, for a cute look)
    var maskPts = [];
    var headGeo = shaped([96, 72], function (n, q, c) {
      var fwd = Math.max(0, n.z), cheek = Math.exp(-Math.pow(n.y + 0.2, 2) / 0.08) * (1 - fwd * 0.6);
      var x = n.x * 0.058 * (1 + cheek * 0.3) * (1 - Math.pow(fwd, 2) * 0.42), y = n.y * 0.054 * (1 - Math.pow(fwd, 2) * 0.28), z = n.z * 0.055 + Math.pow(fwd, 3) * 0.026;   // (round, with a short little muzzle)
      y -= Math.pow(fwd, 3) * 0.01;
      q.set(x, y, z);
      var lat = Math.asin(Math.max(-1, Math.min(1, n.y))), lon = Math.atan2(n.x, n.z), al = Math.abs(lon);
      c.copy(furCol);
      var mask = ss(-0.3, -0.12, lat) * ss(0.42, 0.26, lat) * ss(0.08, 0.22, al) * ss(1.55, 1.2, al);   // (the bandit's mask, across its eyes and out over its cheeks)
      var brow = ss(0.3, 0.42, lat) * ss(0.72, 0.55, lat) * ss(1.1, 0.85, al) * ss(0.02, 0.12, al);
      var muzzle = ss(-0.08, -0.22, lat) * ss(1.0, 0.7, al) + ss(0.55, 0.85, fwd) * ss(0.1, -0.15, lat) * 0.8;
      var stripe = ss(0.16, 0.06, al) * ss(-0.1, 0.05, lat) * ss(0.75, 0.55, lat) * ss(0.3, 0.6, fwd);
      var neb = 0.5 + 0.5 * Math.sin(lon * 7 + lat * 9) * Math.sin(lon * 3 - lat * 5);   // (a faint nebula shimmering in the mask)
      c.lerp(rimCol, Math.min(1, brow + muzzle) * 0.92).lerp(maskCol.clone().lerp(nebCol, neb * 0.35), Math.min(1, mask + stripe * 0.4) * 0.95);
      if (mask > 0.7 && glimR(q.x * 913 + q.y * 377 + q.z * 151) < 0.03) maskPts.push(V3(x, y, z), n.clone());   // (somewhere for a star)
    });
    coat(headGeo, headFurV, head, 0.0045, [0, 0.25, -1]);
    [-1, 1].forEach(function (s) {                                    // fluffy cheek ruffs sweeping back
      var cg = shaped([32, 24], function (n, q, c) { q.set(n.x * 0.022, n.y * 0.02, n.z * 0.03); c.copy(rimCol).lerp(furCol, 0.25 + Math.max(0, n.y) * 0.4); });
      coat(cg, headFurV, head, 0.011, [s, -0.6, -1], 2.2, s * 0.052, -0.02, -0.004);
    });
    var starMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.star).multiplyScalar(1.3) }), starGeo = new THREE.OctahedronGeometry(0.0026, 0);
    for (var mp = 0; mp + 1 < maskPts.length && mp < 80; mp += 2) { var st = new THREE.Mesh(starGeo, starMat); st.position.copy(maskPts[mp]).addScaledVector(maskPts[mp + 1], 0.0048); st.scale.set(1, 1, 0.4); st.lookAt(st.position.clone().add(maskPts[mp + 1])); head.add(st); }   // tiny stars glowing in its mask
    for (var bp = 0; bp + 1 < backPts.length && bp < 70; bp += 2) { var bs = new THREE.Mesh(starGeo, starMat); bs.position.copy(backPts[bp]).addScaledVector(backPts[bp + 1], 0.009); bs.scale.setScalar(0.7 + glimR(bp) * 0.8); tb.add(bs); }   // stars twinkling in the night over its back
    var moonMat = new THREE.MeshBasicMaterial({ color: 0xfff0b8, side: THREE.DoubleSide });   // a glowing crescent moon on its brow
    var cres = new THREE.Shape(); cres.absarc(0, 0, 0.011, 0.5, Math.PI * 2 - 0.5, false); cres.absarc(0.0055, 0.0014, 0.0088, Math.PI * 2 - 0.95, 0.95, true);
    var moonMark = new THREE.Mesh(new THREE.ShapeGeometry(cres, 16), moonMat); moonMark.position.set(0, 0.047, 0.044); moonMark.rotation.set(-0.75, 0, Math.PI / 2 + 0.4); head.add(moonMark);
    var moonGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xfff0b8, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); moonGlow.scale.set(0.05, 0.05, 1); moonGlow.position.set(0, 0.045, 0.045); head.add(moonGlow);
    // big shining eyes
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x05040a, roughness: 0.05, metalness: 0.2 });
    var irisMat = new THREE.MeshStandardMaterial({ map: lunaEyeTex(pal), roughness: 0.1, emissive: 0xffffff, emissiveIntensity: 0.25 }); irisMat.emissiveMap = irisMat.map;
    var corneaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, roughness: 0.02, metalness: 0.1, depthWrite: false });
    var irisGeo = new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, 1.05); irisGeo.rotateX(Math.PI / 2);
    (function () { var ps = irisGeo.attributes.position, uv = irisGeo.attributes.uv, k = 0.46 / Math.sin(1.05); for (var i = 0; i < ps.count; i++) uv.setXY(i, 0.5 + ps.getX(i) * k, 0.5 + ps.getY(i) * k); uv.needsUpdate = true; })();
    var lidMat = new THREE.MeshStandardMaterial({ color: pal.mask, roughness: 0.85, side: THREE.DoubleSide }), lids = [];
    var lidGeo = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42);
    [-1, 1].forEach(function (s) {
      var ey = new THREE.Group(); ey.position.set(s * 0.026, 0.012, 0.056); ey.rotation.set(0.02, s * 0.45, 0); head.add(ey);
      var RX = 0.019, RY = 0.02, RZ = 0.012;   // (huge and round)
      part(seg, eyeMat, 0, 0, 0, RX, RY, RZ, ey);
      abPart(irisGeo, irisMat, 0, 0, 0, 0, 0, 0, ey).scale.set(RX * 1.01, RY * 1.01, RZ * 1.01);
      var co = abPart(irisGeo, corneaMat, 0, 0, 0, 0, 0, 0, ey); co.scale.set(RX * 1.06, RY * 1.06, RZ * 1.18); co.castShadow = false;
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.0055, 0.0075, RZ * 1.02, 0.005, 0.0052, 0.0014, ey);   // catchlights
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.0005, 0.0105, RZ, 0.0019, 0.0019, 0.001, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }), 0.0058, -0.0068, RZ * 0.98, 0.0026, 0.0022, 0.001, ey);
      var lg = new THREE.Group(); ey.add(lg); lids.push(lg); lg.visible = false;
      abPart(lidGeo, lidMat, 0, 0, 0, 0, 0, 0, lg).scale.set(RX * 1.15, RY * 1.15, RZ * 1.3);
      var bl = new THREE.Mesh(new THREE.PlaneGeometry(0.026, 0.016), new THREE.MeshBasicMaterial({ map: moonBlushTex, transparent: true, opacity: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
      bl.position.set(s * 0.04, -0.018, 0.052); bl.rotation.set(0, s * 0.7, 0); head.add(bl);
      [[0.035, -0.012, 0.056], [0.043, -0.02, 0.05], [0.036, -0.026, 0.056]].forEach(function (f) { var fr = new THREE.Mesh(new THREE.OctahedronGeometry(0.0018, 0), new THREE.MeshBasicMaterial({ color: pal.star })); fr.position.set(s * f[0], f[1], f[2]); head.add(fr); });   // (star freckles on its cheeks)
    });
    // a shiny black nose on the tip of its muzzle, a little mouth, and whiskers
    var noseMat = new THREE.MeshPhysicalMaterial({ color: pal.nose, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.2, emissive: pal.nose, emissiveIntensity: 0.12 });   // (a little pink nose)
    var nose = part(seg, noseMat, 0, -0.01, 0.083, 0.0085, 0.006, 0.006, head, 0.2);
        part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }), -0.0025, -0.007, 0.0885, 0.0024, 0.0014, 0.001, head, 0.2);   // (a shine on it)
    var mouthMat = new THREE.MeshStandardMaterial({ color: 0x2a2028, roughness: 0.6 });
    abPart(new THREE.CylinderGeometry(0.0006, 0.0006, 0.006, 6), mouthMat, 0, -0.019, 0.083, 0.2, 0, 0, head);
    [-1, 1].forEach(function (s) { abPart(new THREE.TorusGeometry(0.0045, 0.0006, 5, 12, Math.PI * 0.8), mouthMat, s * 0.0043, -0.0225, 0.081, 0.4, 0, Math.PI + 0.3 * -s, head); });
    var whiskers = new THREE.Group(); head.add(whiskers);
    // rounded ears, silver with soft white rims, dark inside
    var ears = [];
    [-1, 1].forEach(function (s) {
      var ep = new THREE.Group(); ep.position.set(s * 0.032, 0.04, -0.008); ep.rotation.set(-0.12, s * 0.12, -s * 0.3); head.add(ep); ears.push({ g: ep, s: s });
      var eg = shaped([28, 24], function (n, q, c) { var y = n.y, w = 0.02 * Math.pow(1 - (y + 1) / 2, 0.75) + 0.0015; q.set(n.x * w, (y + 1) * 0.032, n.z * 0.0065 - (n.z > 0 ? (1 - Math.abs(n.x)) * 0.004 : 0)); c.copy(furCol).lerp(nightCol, ss(0.2, 0.75, y) * 0.9).lerp(starCol, ss(0.75, 0.95, y)); });   // (tall and pointed, deepening to night and tipped with starlight)
      coat(eg, headFurV, ep, 0.0045, [0, 1, 0]);
      var innerG = shaped([24, 18], function (n, q, c) { var y = n.y, w = 0.012 * Math.pow(1 - (y + 1) / 2, 0.8) + 0.001; q.set(n.x * w, (y + 1) * 0.024, n.z * 0.0025); c.copy(new THREE.Color(pal.inner)).lerp(rimCol, ss(-0.2, 0.9, y) * 0.5); });
      abPart(innerG, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, emissive: pal.inner, emissiveIntensity: 0.15 }), 0, 0.006, 0.0042, 0, 0, 0, ep);   // the soft inside of the ear
      var tipS = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: pal.star, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); tipS.scale.set(0.03, 0.03, 1); tipS.position.set(0, 0.066, 0); ep.add(tipS); ears[ears.length - 1].tip = tipS;   // (a twinkle of starlight at its tip)
    });
    // short legs in dark 'gloves', the front paws little hands with five fingers, the back paws with soft pads
    var gloveMat = zFurMat(pawCol.clone().multiplyScalar(1.15), 2000, 0, false, 0.9, 0.3), gloveSkin = new THREE.MeshStandardMaterial({ color: pawCol, roughness: 0.9 });
    var padMat = new THREE.MeshStandardMaterial({ color: 0x4a3a40, roughness: 0.75 });
    var legs = [];
    function limb(prof, colAt) {                                      // a soft, rounded plush limb, turned from a profile [radius, y], coloured down its length
      var pts = prof.map(function (q) { return new THREE.Vector2(q[0], q[1]); }), geo = new THREE.LatheGeometry(pts, 28), p = geo.attributes.position, cols = [], c = new THREE.Color();
      for (var i = 0; i < p.count; i++) { colAt(p.getY(i), c); cols.push(c.r, c.g, c.b); }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals(); return geo;
    }
    var beanMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.nose).lerp(new THREE.Color(0xffffff), 0.25), roughness: 0.55, emissive: pal.nose, emissiveIntensity: 0.1 });
    function leg(parent, x, y, z, front, s) {
      var hip = new THREE.Group(); hip.position.set(x, y, z); parent.add(hip);
      var upper = limb([[0.0005, 0.022], [0.015, 0.02], [0.025, 0.008], [0.029, -0.01], [0.027, -0.035], [0.0235, -0.058], [0.0005, -0.063]], function (y2, c) { c.copy(furCol).lerp(bellyCol, 0.15); });
      coat(upper, furV, hip, 0.008, [0, -1, 0]);                       // the soft, chubby top of the leg, tucked into its body
      var knee = new THREE.Group(); knee.position.set(0, -0.052, front ? 0.002 : -0.004); hip.add(knee);
      var lower = limb([[0.0005, 0.008], [0.0225, 0.004], [0.022, -0.025], [0.0235, -0.048], [0.026, -0.058], [0.0235, -0.066], [0.0005, -0.069]], function (y2, c) { c.copy(furCol).lerp(pawCol, ss(-0.012, -0.03, y2)); });   // (fading into a little night-coloured sock)
      coat(lower, furV, knee, 0.006, [0, -1, 0]);
      var paw = new THREE.Group(); paw.position.set(0, -0.069, 0.002); knee.add(paw);
      part(seg, beanMat, 0, 0.0006, 0.001, 0.012, 0.0018, 0.0105, paw);   // its palm pad...
      for (var fi = 0; fi < 4; fi++) { var fa = (fi - 1.5) * 0.55; part(seg, beanMat, Math.sin(fa) * 0.0165, 0.0012, 0.007 + Math.cos(fa) * 0.0098, 0.0046, 0.0016, 0.0046, paw); }   // ...and four little toe beans
      for (var tk = 0; tk < 3; tk++) { abPart(new THREE.BoxGeometry(0.0008, 0.006, 0.0012), new THREE.MeshStandardMaterial({ color: new THREE.Color(pal.paw).multiplyScalar(0.6), roughness: 0.9 }), (tk - 1) * 0.009, 0.006, 0.0235 - Math.abs(tk - 1) * 0.0022, -0.35, 0, 0, paw); }   // (and soft little dents between its toes)
      legs.push({ hip: hip, knee: knee, paw: paw, front: front, s: s, ph: (front ? 0 : Math.PI) + (s > 0 ? Math.PI : 0) });
    }
    [-1, 1].forEach(function (s) { leg(tb, s * 0.048, -0.03, 0.075, true, s); leg(body, s * 0.052, BY - 0.03, -0.075, false, s); });   // (the front legs ride with its body when it sits up; the back legs stay planted)
    // a big, bushy tail curling up behind, ringed with bands of night that glow faintly like moonlight
    var tail = new THREE.Group(); tail.position.set(0, BY + 0.01, -0.13); body.add(tail);
    var tCurve = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0, 0.03, -0.08), V3(0, 0.1, -0.14), V3(0, 0.19, -0.15), V3(0, 0.26, -0.11), V3(0, 0.29, -0.05), V3(0, 0.28, 0.0)]);   // (a big curl, like a crescent moon)
    var ringGlows = [];
    (function () {
      var TS = 80, RS = 22, geo = new THREE.TubeGeometry(tCurve, TS, 1, RS, false), p = geo.attributes.position, cols = [], c = new THREE.Color(), ringC = new THREE.Color(pal.ring);
      for (var i = 0; i <= TS; i++) {
        var t = i / TS, cp = tCurve.getPointAt(t), r = (0.026 + Math.sin(Math.min(1, t * 1.3) * Math.PI) * 0.024) * Math.sqrt(Math.min(1, t * 8 + 0.3)) * (t > 0.85 ? 1 - (t - 0.85) * 4 : 1);   // (bushy, fullest in the middle, rounded at the tip)
        var band = 0.5 + 0.5 * Math.cos(t * Math.PI * 12), dark = ss(0.35, 0.65, band) * ss(0.05, 0.12, t);   // (six rings of night)
        c.copy(furCol).lerp(ringC.clone().lerp(nebCol, 0.25), dark); if (t > 0.9) c.copy(ringC);
        for (var j = 0; j <= RS; j++) { var k = i * (RS + 1) + j; p.setXYZ(k, cp.x + (p.getX(k) - cp.x) * r, cp.y + (p.getY(k) - cp.y) * r, cp.z + (p.getZ(k) - cp.z) * r); cols.push(c.r, c.g, c.b); }
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals();
      coat(geo, furV, tail, 0.016, [0, 0, -1], 1.8);
      for (var rg = 0; rg < 6; rg++) {                                 // each band of night glowing, with stars in it
        var rt = (rg + 0.5) / 6, gs = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }));
        gs.scale.set(0.11, 0.11, 1); gs.position.copy(tCurve.getPointAt(rt)); tail.add(gs); ringGlows.push(gs);
        for (var rs = 0; rs < 5; rs++) { var ra = glimR(rg * 7.1 + rs) * Math.PI * 2, rp = tCurve.getPointAt(Math.min(0.98, rt + (glimR(rs * 3.3 + rg) - 0.5) * 0.04)), rr = 0.045; var ts = new THREE.Mesh(starGeo, starMat); ts.position.set(rp.x + Math.cos(ra) * rr, rp.y + Math.sin(ra) * rr * 0.8, rp.z + Math.sin(ra) * rr * 0.6); tail.add(ts); }
      }
      var tipP = tCurve.getPointAt(1), tipMoon = new THREE.Mesh(new THREE.SphereGeometry(0.013, 20, 16), new THREE.MeshBasicMaterial({ color: 0xfff4d0 }));   // a little moon shining at its tip
      tipMoon.position.copy(tipP).add(V3(0, 0.008, 0.014)); tail.add(tipMoon);
      var tmg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xfff0c0, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); tmg.scale.set(0.1, 0.1, 1); tmg.position.copy(tipMoon.position); tail.add(tmg); ringGlows.push(tmg);
    })();
    // a tiny moon of its own, orbiting round it with a faint trail of light
    var orbit = new THREE.Group(); orbit.position.set(0, 0.36, 0); root.add(orbit);
    var moonTex = new THREE.CanvasTexture(glimCanvas(64, 64, function (g, w, h) { g.fillStyle = '#fff8e8'; g.fillRect(0, 0, w, h); for (var cr = 0; cr < 14; cr++) { g.fillStyle = 'rgba(200,190,170,' + (0.25 + glimR(cr) * 0.3) + ')'; g.beginPath(); g.arc(glimR(cr * 3.1) * w, glimR(cr * 5.3) * h, 2 + glimR(cr * 7) * 6, 0, Math.PI * 2); g.fill(); } }));   // (with soft craters)
    var miniMoon = new THREE.Mesh(new THREE.SphereGeometry(0.016, 24, 18), new THREE.MeshStandardMaterial({ map: moonTex, emissive: 0xfff4e0, emissiveIntensity: 0.6, emissiveMap: moonTex, roughness: 0.9 })); miniMoon.position.set(0.17, 0, 0); orbit.add(miniMoon);
    var mmg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xfff0c8, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); mmg.scale.set(0.09, 0.09, 1); miniMoon.add(mmg);
    var trail = []; for (var tr = 0; tr < 6; tr++) { var tsp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: pal.star, transparent: true, opacity: 0.5 - tr * 0.07, blending: THREE.AdditiveBlending, depthWrite: false })); tsp.scale.setScalar(0.022 - tr * 0.002); var ta = -(tr + 1) * 0.2; tsp.position.set(Math.cos(ta) * 0.17, 0, Math.sin(ta) * 0.17); orbit.add(tsp); trail.push(tsp); }
    // motes of moonlight drifting up off it, and a soft glow round it
    var sparks = [];
    for (var sk = 0; sk < 8; sk++) { var spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: sk % 2 ? pal.star : pal.glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); spr.scale.set(0.03, 0.03, 1); root.add(spr); sparks.push({ s: spr, t: glimR(sk + 70) * 2, x: 0, y: 0, z: 0 }); }
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.14, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(0.9, 0.9, 1); glow.position.set(0, 0.25, 0); root.add(glow);
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.42, 0.1575, 1); tag.position.set(0, 0.7, 0); tag.renderOrder = 6; root.add(tag);
    return { orbit: orbit, root: root, body: body, torso: torso, head: head, ears: ears, legs: legs, tail: tail, lids: lids, nose: nose, whiskers: whiskers, ringGlows: ringGlows, moonGlow: moonGlow, sparks: sparks, glow: glow, tagCv: tagCv, tagTex: tagTex, sit: 0, rub: 0 };
  }
  // when it has found a Moonpearl, the pearl glows in the straw beside it
  function lunaBuildExtras(g) {
    var sz = GLIM_STALLS[g.stall], pal = LUNA_PALS[g.pal % LUNA_PALS.length];
    var pearl = new THREE.Group(); abRoom.add(pearl);
    var pm = new THREE.Mesh(new THREE.SphereGeometry(0.03, 28, 20), new THREE.MeshPhysicalMaterial({ color: 0xf2eeff, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, emissive: pal.glow, emissiveIntensity: 0.25 })); pm.position.y = 0.03; pm.castShadow = true; pearl.add(pm);
    var eg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    eg.scale.set(0.3, 0.3, 1); eg.position.y = 0.03; pearl.add(eg);
    pearl.position.set(-3.45, 0, sz - 0.5);
    g.eggMesh = pearl; g.eggGlow = eg;
    var hay = abPart(wbLumpGeo(300 + g.stall, 0.25), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.3, 0.94, sz + 1.0);
    hay.scale.set(0.16, 0.07, 0.16); g.hayMesh = hay;
    g.slate.map = glimSlateTex(g.name, 'Lunapaw'); g.slate.needsUpdate = true;
  }
  // every frame, for a Lunapaw: a busy little trot, tail swaying; it sniffs about (its nose and whiskers twitching),
  // flicks its ears and blinks; the stars in its mask and the rings of its tail glow; and when petted it sits up on
  // its hind legs and rubs its little hands together happily
  function lunaAnimate(g, dt, t, moving) {
    var m = g.m;
    if (moving) g.hop += dt * 11;
    var happy = g.pet > 0;
    if (happy) g.pet -= dt;
    m.sit += ((happy ? 1 : 0) - m.sit) * Math.min(1, dt * 5);
    m.rub += dt * 14;
    m.torso.rotation.x = -m.sit * 0.95 + (moving ? Math.sin(g.hop * 2) * 0.03 : 0);   // (sitting up, pivoting at its hips)
    m.legs.forEach(function (l) {
      var sw = moving ? Math.sin(g.hop + l.ph) : 0;
      if (l.front) {
        l.hip.rotation.x = sw * 0.5 * (1 - m.sit) + m.sit * -0.4;
        l.hip.rotation.z = m.sit * l.s * (0.35 + Math.sin(m.rub) * 0.12);   // (its hands held together in front, rubbing)
        l.knee.rotation.x = (moving ? Math.max(0, Math.sin(g.hop + l.ph + 1.2)) * 0.8 : 0) * (1 - m.sit) - m.sit * 1.1;
      } else {
        l.hip.rotation.x = sw * 0.5 * (1 - m.sit) + m.sit * 0.5;
        l.knee.rotation.x = (moving ? Math.max(0, Math.sin(g.hop + l.ph + 1.2)) * -0.7 : 0) * (1 - m.sit) - m.sit * 0.5;
        l.paw.rotation.x = m.sit * 0.0;
      }
    });
    m.body.position.y = 0.06 + (moving ? Math.abs(Math.sin(g.hop)) * 0.008 : 0);   // (standing up on top of the straw)
    var look = Math.sin(t * 0.33 + g.stall * 1.7), sniff = Math.max(0, Math.sin(t * 0.5 + g.stall) - 0.6);
    m.head.rotation.set(0.1 + m.sit * 0.8 + sniff * 0.4 + (moving ? Math.sin(g.hop * 2) * 0.04 : 0), look * 0.55 * (1 - m.sit * 0.6), Math.sin(t * 0.41 + g.stall) * 0.08 + (happy ? Math.sin(m.rub * 0.3) * 0.12 : 0));
    var tw = 1 + Math.max(0, Math.sin(t * 11)) * (sniff > 0 || happy ? 0.12 : 0.03);   // (its nose twitching as it sniffs)
    m.nose.scale.set(0.0105 * tw, 0.0075 * tw, 0.0075);
    m.whiskers.rotation.x = Math.sin(t * 11) * (sniff > 0 ? 0.06 : 0.015);
    m.ears.forEach(function (e, k) { var flick = Math.max(0, Math.sin(t * 0.9 + k * 2.4 + g.stall) - 0.93) * 12; e.g.rotation.z = -e.s * (0.38 + flick * 0.15 + (happy ? 0.15 : 0)); });
    m.tail.rotation.set(Math.sin(t * 1.3 + g.stall) * 0.06 - m.sit * 0.2, Math.sin(t * (happy ? 6 : 1.4) + g.stall) * (happy ? 0.35 : 0.22) + (moving ? Math.sin(g.hop) * 0.15 : 0), 0);
    var bt = (t * 0.23 + g.stall * 0.37) % 1, blink = happy ? 0.55 : (bt < 0.035 ? Math.sin(bt / 0.035 * Math.PI) : 0);
    m.lids.forEach(function (l) { l.visible = blink > 0.03; l.rotation.x = -0.62 + blink * 1.55; });
    var pulse = 0.5 + Math.sin(t * 1.2 + g.stall) * 0.5;
    m.ringGlows.forEach(function (r, k) { r.material.opacity = 0.14 + (0.5 + Math.sin(t * 1.5 + k * 0.9) * 0.5) * 0.14; });
    m.moonGlow.material.opacity = 0.35 + pulse * 0.3;
    m.orbit.rotation.y = t * (happy ? 2.2 : 0.7); m.orbit.position.y = 0.36 + Math.sin(t * 1.1 + g.stall) * 0.02 + m.sit * 0.06;   // (its little moon circling round it, faster when it's happy)
    m.ears.forEach(function (e, k) { e.tip.material.opacity = 0.5 + Math.max(0, Math.sin(t * 2.3 + k * 1.7 + g.stall)) * 0.5; e.tip.material.rotation = t * 0.6; });
    m.sparks.forEach(function (sp) {
      sp.t += dt * (happy ? 0.7 : 0.3);
      if (sp.t > 1) { sp.t -= 1 + Math.random() * 1.5; var a = Math.random() * Math.PI * 2; sp.x = Math.sin(a) * 0.12; sp.y = 0.15 + Math.random() * 0.12; sp.z = Math.cos(a) * 0.15 - 0.08; }
      sp.s.material.opacity = sp.t > 0 ? Math.sin(sp.t * Math.PI) * 0.8 : 0;
      sp.s.position.set(sp.x, sp.y + Math.max(0, sp.t) * 0.3, sp.z);
    });
    m.glow.material.opacity = 0.1 + pulse * 0.05;
    if (g.egg) g.eggGlow.material.opacity = 0.35 + Math.sin(t * 2 + g.stall) * 0.15;
  }
  function lunapawAction(g, wx, wz) {                                // collecting its pearl, feeding and petting a Lunapaw
    if (g.egg) {
      if (!roomFor(['moonpearl'])) { bagFull(); return; }
      addItem('moonpearl', 1); g.egg = false; glimRefresh(g); popSound(); g.pet = 1.4;
      showToast(g.name + ' proudly gives you the Moonpearl they found in the night! ⚪✨', 2400);
      return;
    }
    var day = Math.min(LUNA_DAYS, g.days + 1);
    var news = day >= LUNA_DAYS ? ' A Moonpearl tomorrow morning!' : ' Day ' + day + ' of ' + LUNA_DAYS + ' toward a Moonpearl.';
    if (!g.fed) {
      if (!takeItem('hay', 1)) { showToast(g.name + ' is hungry! Buy hay at the counter to feed them 🌾', 2600); return; }
      g.fed = true; glimRefresh(g); popSound(); g.pet = 0.8; g.face = Math.atan2(-3.7 - g.x, GLIM_STALLS[g.stall] + 1.0 - g.z);
      showToast(g.name + ' washes the hay in their little hands, then munches it 🌾' + (g.petted ? news : ' Now give them a pet!'), 2600);
      return;
    }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 2.4;
      g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, 0.45, g.z); popSound();
      showToast(g.name + ' sits up and rubs their little hands together happily 💜' + news, 2800);
      return;
    }
    g.pet = 1.6; glimHeartBurst(g.x, 0.45, g.z);
    showToast(g.name + ' is fed, petted and happy ✧' + (day >= LUNA_DAYS ? ' A Moonpearl tomorrow morning!' : ' Day ' + day + ' of ' + LUNA_DAYS + ' done. Come back tomorrow!'), 2400);
  }
  // ---------- Holding what your animals give you ----------
  // Select one of their products in your hotbar and you hold it up in your hand, like the seeds and the hay: a
  // glowing egg resting in your palm, a bottle of milk by its middle, a quill by its shaft
  function holdGlow(col, size, y) {
    var s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: col, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending, depthWrite: false }));
    s2.scale.set(size, size, 1); s2.position.y = y; return s2;
  }
  function holdEgg(mat, glow) {                                     // an egg standing in your palm
    var g = new THREE.Group(), e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 16), mat);
    e.scale.set(1, 1.28, 1); e.position.y = 0.064; e.castShadow = true; g.add(e);
    g.add(holdGlow(glow, 0.32, 0.064));
    return g;
  }
  function holdBottle(milk, glow, cork, ribbon) {                   // a glass bottle of milk, with a cork and a ribbon round its neck
    var g = new THREE.Group(), pts = [], mpts = [];
    [[0.001, 0], [0.042, 0], [0.047, 0.008], [0.048, 0.1], [0.04, 0.125], [0.02, 0.148], [0.017, 0.17], [0.021, 0.176], [0.02, 0.182]].forEach(function (q) { pts.push(new THREE.Vector2(q[0], q[1])); });
    [[0.001, 0.004], [0.042, 0.004], [0.044, 0.012], [0.044, 0.098], [0.001, 0.098]].forEach(function (q) { mpts.push(new THREE.Vector2(q[0], q[1])); });
    var m = new THREE.Mesh(new THREE.LatheGeometry(mpts, 24), new THREE.MeshStandardMaterial({ color: milk, roughness: 0.25, emissive: milk, emissiveIntensity: 0.35 }));
    g.add(m);
    var glass = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), new THREE.MeshPhysicalMaterial({ color: 0xeef4ff, roughness: 0.04, metalness: 0.05, clearcoat: 1, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false }));
    glass.renderOrder = 2; g.add(glass);
    var c = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.016, 0.026, 14), new THREE.MeshStandardMaterial({ color: cork, roughness: 0.85 })); c.position.y = 0.188; g.add(c);
    var r = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.0045, 6, 18), new THREE.MeshStandardMaterial({ color: ribbon, roughness: 0.5 })); r.rotation.x = Math.PI / 2; r.position.y = 0.156; g.add(r);
    var bow = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), r.material); bow.position.set(0, 0.156, 0.022); bow.scale.set(1.6, 0.9, 0.7); g.add(bow);
    var shine = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.07), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false })); shine.position.set(-0.026, 0.06, 0.04); shine.rotation.y = -0.5; g.add(shine);
    g.add(holdGlow(glow, 0.36, 0.08));
    g.traverse(function (o) { if (o.isMesh && o !== glass && o !== shine) o.castShadow = true; });
    return g;
  }
  var HOLD_PRODUCTS = {
    glimmerEgg: function () { return holdEgg(glimEggMat, 0xd8b8ff); },
    dewdropEgg: function () { return holdEgg(duckEggMat, 0xa8c8ff); },
    geodeEgg: function () { var g = gemEggModel(GEM_PALS[0]); g.scale.setScalar(1.15); g.add(holdGlow(GEM_PALS[0].glow, 0.3, 0.06)); return g; },
    moonmilk: function () { return holdBottle(0xf2f0ff, 0xdce4ff, 0xb8a0e8, 0x8a6ad8); },
    auroraMilk: function () { return holdBottle(0xe8fff6, 0x8affd8, 0x7ad8c8, 0x5a8aff); },
    cinderQuill: function () {                                       // held by its shaft, the flame end up
      var g = new THREE.Group(), q = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.33).translate(0, 0.165, 0), emberFeatherMat(EMBER_PALS[0]));
      q.rotation.set(0, 1.1, -0.12); q.castShadow = true; g.add(q);   // (turned so its face shows)
      g.add(holdGlow(EMBER_PALS[0].glow, 0.4, 0.26));
      return g;
    },
    cloudWool: function () {                                         // a soft little cloud of wool, tied with a ribbon
      var pal = ZEPHYRA_PALS[0], g = new THREE.Group();
      g.add(zCloudMesh(zBillow([[0, 0.05, 0, 0.042, 0.1], [-0.035, 0.035, 0.01, 0.03, 0.5], [0.035, 0.035, -0.008, 0.03, 0.5], [0.004, 0.03, 0.034, 0.03, 0.7], [-0.006, 0.032, -0.034, 0.028, 0.7], [0.01, 0.082, 0.006, 0.026, 0], [0, 0.018, 0, 0.034, 1]], [0, 0.045, 0], 1, 1500), pal, 0.012));
      var rb = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.005, 6, 28), new THREE.MeshStandardMaterial({ color: 0xffb03a, roughness: 0.5, emissive: 0xffb03a, emissiveIntensity: 0.15 })); rb.rotation.x = Math.PI / 2 - 0.25; rb.position.y = 0.05; g.add(rb);
      g.add(holdGlow(pal.glow, 0.36, 0.05));
      return g;
    },
    moonpearl: function () {                                         // a glowing pearl resting in your palm
      var pal = LUNA_PALS[0], g = new THREE.Group(), pm = new THREE.Mesh(new THREE.SphereGeometry(0.042, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xf2eeff, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, emissive: pal.glow, emissiveIntensity: 0.25 }));
      pm.position.y = 0.042; pm.castShadow = true; g.add(pm); g.add(holdGlow(pal.glow, 0.32, 0.042));
      return g;
    },
    shears: function () {                                            // a pair of shears held by their rosy handles, blades up
      var g = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: 0xe8eef4, roughness: 0.22, metalness: 0.85 }), grip = new THREE.MeshStandardMaterial({ color: 0xff7a9a, roughness: 0.55 });
      [-1, 1].forEach(function (s) {
        var half = new THREE.Group(); half.rotation.z = s * 0.14; g.add(half);
        var bl = new THREE.Shape(); bl.moveTo(0, 0); bl.lineTo(s * 0.016, 0.02); bl.quadraticCurveTo(s * 0.012, 0.11, 0, 0.15); bl.quadraticCurveTo(-s * 0.003, 0.08, -s * 0.002, 0); bl.closePath();
        var bm = new THREE.Mesh(new THREE.ExtrudeGeometry(bl, { depth: 0.003, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001, bevelSegments: 1 }), steel); bm.position.set(0, 0.06, s * 0.002); bm.castShadow = true; half.add(bm);
        var ring = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.0055, 8, 20), grip); ring.position.set(s * 0.02, 0.025, 0); ring.scale.set(0.9, 1.2, 1); ring.castShadow = true; half.add(ring);
        var shank = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.03, 6), steel); shank.position.set(s * 0.01, 0.05, 0); shank.rotation.z = s * 0.4; half.add(shank);
      });
      var pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.012, 10), new THREE.MeshStandardMaterial({ color: 0xffd56a, metalness: 0.8, roughness: 0.3 })); pivot.rotation.x = Math.PI / 2; pivot.position.y = 0.064; g.add(pivot);
      return g;
    }
  };
  var basePickupModel = pickupModel;
  pickupModel = function (item) {
    var make = HOLD_PRODUCTS[item];
    if (!make) return basePickupModel(item);
    var up = new THREE.Group(); up.rotation.x = 1.05; up.position.y = 0.04;   // (undoes the arm's angle, so it stands up in your palm)
    var m = make(); m.scale.multiplyScalar(0.9); up.add(m);
    return up;
  };
  function glimDrawTag(g) {
    var c = g.m.tagCv.getContext('2d'), w = 256, h = 96;
    c.clearRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.88)'; c.beginPath(); c.moveTo(24, 6); c.lineTo(w - 24, 6); c.quadraticCurveTo(w - 4, 6, w - 4, 26); c.lineTo(w - 4, h - 26); c.quadraticCurveTo(w - 4, h - 6, w - 24, h - 6); c.lineTo(24, h - 6); c.quadraticCurveTo(4, h - 6, 4, h - 26); c.lineTo(4, 26); c.quadraticCurveTo(4, 6, 24, 6); c.fill();
    c.strokeStyle = '#c8a8f0'; c.lineWidth = 3; c.stroke();
    var ember = g.kind === 'ember' || g.kind === 'gem' || g.kind === 'aurora' || g.kind === 'zephyra' || g.kind === 'luna';   // (the ones that count days in a row)
    c.fillStyle = '#5a3d9a'; c.font = 'bold ' + (ember ? 26 : 30) + 'px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(g.name, w / 2, ember ? 26 : 34);
    if (ember) {                                                       // its four days toward a quill or an egg: a little flame (or gem) lit for each day it's been looked after
      var need = g.kind === 'aurora' ? AURORA_DAYS : g.kind === 'zephyra' ? ZEPHYRA_DAYS : g.kind === 'luna' ? LUNA_DAYS : 4, done = Math.min(need, g.days + (g.fed && g.petted ? 1 : 0));
      for (var p = 0; p < need; p++) {
        if (g.kind === 'aurora') { c.fillStyle = g.egg || p < done ? ['#3ad8a0', '#7a6aff'][p % 2] : '#d8d0e0'; c.beginPath(); c.moveTo(w / 2 + (p - 0.5) * 22, 41); c.bezierCurveTo(w / 2 + (p - 0.5) * 22 + 8, 50, w / 2 + (p - 0.5) * 22 + 6, 57, w / 2 + (p - 0.5) * 22, 57); c.bezierCurveTo(w / 2 + (p - 0.5) * 22 - 6, 57, w / 2 + (p - 0.5) * 22 - 8, 50, w / 2 + (p - 0.5) * 22, 41); }   // (a drop of milk for each day)
        else if (g.kind === 'luna') { var lx = w / 2 + (p - 0.5) * 22; c.fillStyle = g.egg || p < done ? ['#a8c8ff', '#ffe8a0'][p % 2] : '#d8d0e0'; c.beginPath(); c.arc(lx, 49, 8, 0.7, Math.PI * 2 - 0.7); c.arc(lx + 4, 47, 6.5, Math.PI * 2 - 1.15, 1.15, true); c.closePath(); }   // (a little crescent moon for each day)
        else if (g.kind === 'zephyra') { var zx = w / 2 + (p - 1.5) * 20; c.fillStyle = g.egg || p < done ? ['#ffb8a0', '#ffd56a'][p % 2] : '#d8d0e0'; c.beginPath(); [[-5, 52, 5], [1, 47, 6.5], [6, 52, 5], [0, 53, 5]].forEach(function (q) { c.moveTo(zx + q[0] + q[2], q[1]); c.arc(zx + q[0], q[1], q[2], 0, Math.PI * 2); }); }   // (a little cloud for each day)
        else if (g.kind === 'gem') { c.fillStyle = g.egg || p < done ? '#a86aff' : '#d8d0e0'; gemDiamond(c, w / 2 + (p - 1.5) * 18, 49, 13, 12); }
        else { c.fillStyle = g.egg || p < done ? '#ff7a2a' : '#d8d0e0'; emberFlame(c, w / 2 + (p - 1.5) * 18, 49, 11, 15); }
        c.fill();
      }
    }
    function hay(x, y, on) { c.fillStyle = on ? '#e0b040' : '#cfc8d8'; for (var i = -3; i <= 3; i++) { c.save(); c.translate(x + i * 2, y); c.rotate(i * 0.12); c.fillRect(-1.5, -12, 3, 24); c.restore(); } c.fillStyle = on ? '#a86a2a' : '#b8b0c4'; c.fillRect(x - 9, y - 2, 18, 4); }
    function heart(x, y, on) { c.fillStyle = on ? '#ff6aa8' : '#cfc8d8'; c.beginPath(); c.moveTo(x, y + 10); c.bezierCurveTo(x - 14, y, x - 12, y - 11, x - 5, y - 11); c.bezierCurveTo(x - 2, y - 11, x, y - 8, x, y - 6); c.bezierCurveTo(x, y - 8, x + 2, y - 11, x + 5, y - 11); c.bezierCurveTo(x + 12, y - 11, x + 14, y, x, y + 10); c.fill(); }
    hay(w / 2 - 34, ember ? 74 : 68, g.fed); heart(w / 2 + 34, ember ? 74 : 68, g.petted);
    c.fillStyle = g.fed ? '#3a8a4a' : '#a898b8'; c.font = 'bold 16px Fredoka, sans-serif'; c.fillText(g.fed ? '✓' : '•', w / 2 - 14, ember ? 76 : 70);
    c.fillStyle = g.petted ? '#3a8a4a' : '#a898b8'; c.fillText(g.petted ? '✓' : '•', w / 2 + 54, ember ? 76 : 70);
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
  function glimAdd(d) {                                              // d: { kind ('glim', 'moon', 'duck', 'ember' or 'gem'), name, stall, pal, fed, petted, egg, days (an Emberwing's or Gemwren's days in a row) }
    var g = { kind: d.kind === 'moon' || d.kind === 'duck' || d.kind === 'ember' || d.kind === 'gem' || d.kind === 'aurora' || d.kind === 'zephyra' || d.kind === 'luna' ? d.kind : 'glim', name: d.name, stall: d.stall, pal: d.pal, fed: !!d.fed, petted: !!d.petted, egg: !!d.egg, days: d.days || 0 };
    g.m = g.kind === 'moon' ? moonBuild(MOON_PALS[g.pal % MOON_PALS.length]) : g.kind === 'duck' ? duckBuild(DUCK_PALS[g.pal % DUCK_PALS.length]) : g.kind === 'ember' ? emberBuild(EMBER_PALS[g.pal % EMBER_PALS.length]) : g.kind === 'gem' ? gemBuild(GEM_PALS[g.pal % GEM_PALS.length]) : g.kind === 'aurora' ? auroraBuild(AURORA_PALS[g.pal % AURORA_PALS.length]) : g.kind === 'zephyra' ? zephyraBuild(ZEPHYRA_PALS[g.pal % ZEPHYRA_PALS.length]) : g.kind === 'luna' ? lunaBuild(LUNA_PALS[g.pal % LUNA_PALS.length]) : glimBuild(GLIM_PALS[g.pal % GLIM_PALS.length]);
    g.slate = abStallSlates[g.stall];
    var sz = GLIM_STALLS[g.stall];
    g.x = g.kind === 'moon' || g.kind === 'aurora' || g.kind === 'zephyra' ? -3.1 : -3.0; g.z = sz - 0.2; g.tx = g.x; g.tz = g.z; g.face = Math.PI / 2; g.wait = 1 + glimR(g.stall) * 2; g.hop = 0; g.pet = 0; g.flut = glimR(g.stall * 7) * 6;
    if (g.kind === 'moon') moonBuildExtras(g); else if (g.kind === 'duck') duckBuildExtras(g); else if (g.kind === 'ember') emberBuildExtras(g); else if (g.kind === 'gem') gemBuildExtras(g); else if (g.kind === 'aurora') auroraBuildExtras(g); else if (g.kind === 'zephyra') zephyraBuildExtras(g); else if (g.kind === 'luna') lunaBuildExtras(g); else glimBuildExtras(g);
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
      var laid = [], milk = [], dew = [], quill = [], geode = [], missed = [], missedGem = [], missedMilk = [], wool = [], missedWool = [], pearl = [], missedPearl = [], gap = state.day - glimDay;
      if (state.day > glimDay) glimmers.forEach(function (g) {
        if (g.kind === 'ember' || g.kind === 'gem' || g.kind === 'aurora' || g.kind === 'zephyra' || g.kind === 'luna') {   // an Emberwing, Gemwren, Auroraram, Zephyra or Lunapaw counts the days in a row it's been fed and petted
          var gem = g.kind === 'gem', aur = g.kind === 'aurora', zep = g.kind === 'zephyra', lun = g.kind === 'luna', need = gem ? GEM_DAYS : aur ? AURORA_DAYS : zep ? ZEPHYRA_DAYS : lun ? LUNA_DAYS : EMBER_DAYS;
          if (g.fed && g.petted && gap === 1) g.days = Math.min(need, g.days + 1);
          else { if (g.days) (gem ? missedGem : aur ? missedMilk : zep ? missedWool : lun ? missedPearl : missed).push(g.name); g.days = 0; }
          if (g.days >= need && !g.egg) { g.egg = true; g.days = 0; (gem ? geode : aur ? milk : zep ? wool : lun ? pearl : quill).push(g.name); }
        } else if (g.fed && g.petted && !g.egg) { g.egg = true; (g.kind === 'moon' ? milk : g.kind === 'duck' ? dew : laid).push(g.name); }
        g.fed = false; g.petted = false; glimRefresh(g);
      });
      glimDay = state.day;
      var news = [];
      if (laid.length) news.push(laid.join(' and ') + (laid.length > 1 ? ' each laid' : ' laid') + ' a Glimmer Egg');
      if (dew.length) news.push(dew.join(' and ') + (dew.length > 1 ? ' each laid' : ' laid') + ' a Dewdrop Egg');
      if (milk.length) news.push(milk.join(' and ') + (milk.length > 1 ? ' are' : ' is') + ' ready to milk');
      if (quill.length) news.push(quill.join(' and ') + (quill.length > 1 ? ' each left' : ' left') + ' a Cinder Quill');
      if (wool.length) news.push(wool.join(' and ') + (wool.length > 1 ? ' have clouds' : ' has a cloud') + ' ready to shear');
      if (pearl.length) news.push(pearl.join(' and ') + (pearl.length > 1 ? ' each found' : ' found') + ' a Moonpearl');
      if (geode.length) news.push(geode.join(' and ') + (geode.length > 1 ? ' each laid' : ' laid') + ' a Geode Egg');
      if (missedGem.length) news.push(missedGem.join(' and ') + ' missed a day of care, so ' + (missedGem.length > 1 ? 'their egg counts start' : 'their egg count starts') + ' over');
      if (missedMilk.length) news.push(missedMilk.join(' and ') + ' missed a day of care, so ' + (missedMilk.length > 1 ? 'their milk counts start' : 'their milk count starts') + ' over');
      if (missedWool.length) news.push(missedWool.join(' and ') + ' missed a day of care, so ' + (missedWool.length > 1 ? 'their wool counts start' : 'their wool count starts') + ' over');
      if (missedPearl.length) news.push(missedPearl.join(' and ') + ' missed a day of care, so ' + (missedPearl.length > 1 ? 'their pearl counts start' : 'their pearl count starts') + ' over');
      if (missed.length) news.push(missed.join(' and ') + ' missed a day of care, so ' + (missed.length > 1 ? 'their quill counts start' : 'their quill count starts') + ' over');
      if (news.length) setTimeout(function () { showToast('✧ ' + news.join(', and ') + '! Visit them at Fluff & Feather.', 3600); }, 4200);
    }
    if (!inBarn) return;
    var t = state.time;
    glimmers.forEach(function (g) {
      var sz = GLIM_STALLS[g.stall], m = g.m;
      g.wait -= dt;
      var moon = g.kind === 'moon', duck = g.kind === 'duck', ember = g.kind === 'ember', gem = g.kind === 'gem', aur = g.kind === 'aurora', zep = g.kind === 'zephyra', lun = g.kind === 'luna';
      if (g.wait <= 0 && g.pet <= 0) {
        if (lun) { g.tx = -3.45 + Math.random() * 0.7; g.tz = sz - 0.8 + Math.random() * 1.1; g.wait = 2 + Math.random() * 4; }   // (a busy little explorer)
        else if (zep) { g.tx = -3.35 + Math.random() * 0.5; g.tz = sz - 0.6 + Math.random() * 0.8; g.wait = 5 + Math.random() * 6; }
        else if (aur) { g.tx = -3.35 + Math.random() * 0.5; g.tz = sz - 0.55 + Math.random() * 0.75; g.wait = 4 + Math.random() * 6; }
        else if (gem) { g.tx = -3.5 + Math.random() * 0.85; g.tz = sz - 0.9 + Math.random() * 1.3; g.wait = 1.5 + Math.random() * 4; }   // (quick little dashes, then a pause)
        else if (ember) { g.tx = -3.3 + Math.random() * 0.45; g.tz = sz - 0.6 + Math.random() * 0.9; g.wait = (m.show > 0 ? 6 : 4) + Math.random() * 6; }
        else if (duck) { g.tx = -3.45 + Math.random() * 0.65; g.tz = sz - 0.8 + Math.random() * 1.1; g.wait = 3 + Math.random() * 5; }
        else if (moon) { g.tx = -3.35 + Math.random() * 0.5; g.tz = sz - 0.55 + Math.random() * 0.75; g.wait = 4 + Math.random() * 6; }   // (bigger, so it ambles about less)
        else { g.tx = -3.5 + Math.random() * 0.85; g.tz = sz - 0.9 + Math.random() * 1.3; g.wait = 2.5 + Math.random() * 4; }
      }
      var dx = g.tx - g.x, dz = g.tz - g.z, d = Math.hypot(dx, dz), moving = d > 0.03 && g.pet <= 0 && !(ember && m.show > 0);   // (an Emberwing stands still to show off its fan)
      if (moving) { var stp = Math.min(d, dt * (moon ? 0.16 : duck ? 0.22 : ember ? 0.18 : gem ? 0.5 : aur ? 0.2 : zep ? 0.2 : lun ? 0.32 : 0.35)); g.x += dx / d * stp; g.z += dz / d * stp; g.face = Math.atan2(dx, dz); if (!moon && !duck && !ember && !gem && !aur && !zep && !lun) g.hop += dt * 9; }
      else if (!moon && !duck && !ember && !gem && !aur && !zep && !lun) g.hop = 0;
      var cur = m.root.rotation.y, diff = Math.atan2(Math.sin(g.face - cur), Math.cos(g.face - cur));
      m.root.rotation.y = cur + diff * Math.min(1, dt * (moon ? 2 : duck ? 4 : ember ? 2.5 : gem ? 8 : aur ? 2.5 : zep ? 2 : lun ? 5 : 5));
      if (lun) { m.root.position.set(g.x, 0, g.z); lunaAnimate(g, dt, t, moving); return; }
      if (zep) { m.root.position.set(g.x, 0, g.z); zephyraAnimate(g, dt, t, moving); return; }
      if (aur) { m.root.position.set(g.x, 0, g.z); auroraAnimate(g, dt, t, moving); return; }
      if (gem) { m.root.position.set(g.x, 0, g.z); gemAnimate(g, dt, t, moving); return; }
      if (ember) { m.root.position.set(g.x, 0, g.z); emberAnimate(g, dt, t, moving); return; }
      if (duck) { m.root.position.set(g.x, 0, g.z); duckAnimate(g, dt, t, moving); return; }
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
    if (g.kind === 'duck') { puddlewispAction(g, wx, wz); return; }
    if (g.kind === 'ember') { emberwingAction(g, wx, wz); return; }
    if (g.kind === 'gem') { gemwrenAction(g, wx, wz); return; }
    if (g.kind === 'aurora') { auroraramAction(g, wx, wz); return; }
    if (g.kind === 'zephyra') { zephyraAction(g, wx, wz); return; }
    if (g.kind === 'luna') { lunapawAction(g, wx, wz); return; }
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
  function puddlewispAction(g, wx, wz) {                             // collecting its egg, feeding and petting a Puddlewisp
    if (g.egg) {
      if (!roomFor(['dewdropEgg'])) { bagFull(); return; }
      addItem('dewdropEgg', 1); g.egg = false; glimRefresh(g); popSound();
      showToast('You collected a Dewdrop Egg from ' + g.name + '! \ud83d\udca7\u2727', 2200);
      return;
    }
    if (!g.fed) {
      if (!takeItem('hay', 1)) { showToast(g.name + ' is hungry! Buy hay at the counter to feed them \ud83c\udf3e', 2600); return; }
      g.fed = true; glimRefresh(g); popSound(); g.pet = 0.9; g.face = Math.atan2(-3.7 - g.x, GLIM_STALLS[g.stall] + 1.0 - g.z);
      showToast(g.name + ' nibbles the hay with happy little quacks \ud83c\udf3e' + (g.petted ? ' An egg tomorrow morning!' : ' Now give them a pet!'), 2400);
      return;
    }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 1.6;
      g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, 0.6, g.z); popSound();
      showToast(g.name + ' ruffles their starry feathers and flaps happily \ud83d\udc9c An egg tomorrow morning!', 2400);
      return;
    }
    g.pet = 1.0; glimHeartBurst(g.x, 0.6, g.z);
    showToast(g.name + ' is fed, petted and happy \u2727 Come back tomorrow!', 2000);
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
    if (g && !barnShopOpen) txt = g.egg ? (g.kind === 'moon' || g.kind === 'aurora' ? '🥛 Milk ' + g.name : g.kind === 'zephyra' ? '✂️ Shear ' + g.name : g.kind === 'luna' ? '⚪ Take the Moonpearl' : g.kind === 'ember' ? '🪶 Pick up quill' : '🥚 Collect egg') : !g.fed ? '🌾 Feed ' + g.name : !g.petted ? '💜 Pet ' + g.name : '✧ ' + g.name;
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
    glimNameBox.querySelector('.glim-title').textContent = '✧ Name your ' + (kind === 'moon' ? 'Mooncalf' : kind === 'duck' ? 'Puddlewisp' : kind === 'ember' ? 'Emberwing' : kind === 'gem' ? 'Gemwren' : kind === 'aurora' ? 'Auroraram' : kind === 'zephyra' ? 'Zephyra' : kind === 'luna' ? 'Lunapaw' : 'Glimmerwing');
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
    showToast('✧ ' + name + ' has moved into stall ' + (g.stall + 1) + '! Feed them hay and pet them every day, and ' + (g.kind === 'moon' ? 'you can milk them each morning (with a Milk Pail).' : g.kind === 'duck' ? 'they\'ll lay a Dewdrop Egg each morning.' : g.kind === 'ember' ? 'after every four days in a row they\'ll leave you a Cinder Quill.' : g.kind === 'gem' ? 'after every four days in a row they\'ll lay a Geode Egg.' : g.kind === 'aurora' ? 'after every two days in a row you can milk them for Aurora Milk (with a Milk Pail).' : g.kind === 'zephyra' ? 'after every four days in a row you can shear them for Cloud Wool (with Shears).' : g.kind === 'luna' ? 'after every two days in a row they\'ll find you a Moonpearl.' : 'they\'ll lay a Glimmer Egg each morning.'), 4200);
    if (typeof renderBarnShop === 'function') renderBarnShop();
  }
  function adoptGlimmerwing(kind) {                                  // kind: 'glim' (a Glimmerwing) or 'moon' (a Mooncalf)
    var stall = glimFreeStall(), cost = kind === 'moon' ? MOON_COST : kind === 'duck' ? DUCK_COST : kind === 'ember' ? EMBER_COST : kind === 'gem' ? GEM_COST : kind === 'aurora' ? AURORA_COST : kind === 'zephyra' ? ZEPHYRA_COST : kind === 'luna' ? LUNA_COST : GLIM_COST;
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
    [['Glimmerwings \u00b7 250 \u2605', 'lay glowing Glimmer Eggs', 'rgba(214,190,255,A)'], ['Puddlewisps \u00b7 300 \u2605', 'lay glassy Dewdrop Eggs', 'rgba(170,215,255,A)'],
      ['Gemwrens \u00b7 380 \u2605', 'lay a Geode Egg every 4 days', 'rgba(220,180,255,A)'], ['Emberwings \u00b7 450 \u2605', 'leave a Cinder Quill every 4 days', 'rgba(255,170,110,A)'], ['Lunapaws \u00b7 480 \u2605', 'find a Moonpearl every 2 days', 'rgba(190,210,255,A)'],
      ['Auroraram \u00b7 520 \u2605', 'give Aurora Milk every 2 days', 'rgba(140,255,210,A)'], ['Zephyras \u00b7 560 \u2605', 'give Cloud Wool every 4 days', 'rgba(255,200,170,A)'], ['Mooncalves \u00b7 600 \u2605', 'give shimmering Moonmilk', 'rgba(190,215,255,A)']].forEach(function (an, k) {
      chalk(an[0], w / 2 + 80, 110 + k * 36, 21, an[2], false);
      chalk(an[1], w / 2 + 80, 127 + k * 36, 13, 'rgba(240,240,230,A)', true);
    });
    chalk('feed with hay & pet every day!', w / 2 + 80, 408, 21, 'rgba(255,214,120,A)', true);
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
    [[46, 400], [w - 50, 60], [w - 60, 410], [40, 60]].forEach(function (p) {
      g.strokeStyle = 'rgba(255,214,120,0.7)'; g.beginPath();
      for (var k = 0; k < 5; k++) { var a = -Math.PI / 2 + k * Math.PI * 4 / 5; g[k ? 'lineTo' : 'moveTo'](p[0] + Math.cos(a) * 12, p[1] + Math.sin(a) * 12); }
      g.closePath(); g.stroke();
    });
    abChalkTex.needsUpdate = true;
  })();
  // saving and loading
  function glimmerSaveData() { return { day: glimDay, list: glimmers.map(function (g) { return { kind: g.kind, name: g.name, stall: g.stall, pal: g.pal, fed: g.fed, petted: g.petted, egg: g.egg, days: g.days }; }) }; }
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
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic duck-pic"></div><div class="shop-text"><b>Puddlewisp</b><span>A plump little pond creature with night-blue feathers that ripple like moonlight on water, big shining eyes, star-tipped plumes and glowing webbed feet. Feed it hay and pet it every day, and it lays a Dewdrop Egg each morning. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + DUCK_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="duck-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic gem-pic"></div><div class="shop-text"><b>Gemwren</b><span>A plump little ground bird with feathers speckled like the inside of a geode, glittering crystal feathers, a dark bib edged in white and a nodding plume tipped with a glowing gem. Feed it hay and pet it every day for four days in a row, and the next morning it lays a Geode Egg that sparkles with crystals inside. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + GEM_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="gem-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic ember-pic"></div><div class="shop-text"><b>Emberwing</b><span>A proud, fiery bird with sunset-coloured feathers, a crown of little flickering flames and a long train of flame-shaped feathers that it raises into a blazing fan. Feed it hay and pet it every day for four days in a row, and the next morning it leaves a warm Cinder Quill in its straw. Miss a day and the count starts over. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + EMBER_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="ember-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic luna-pic"></div><div class="shop-text"><b>Lunapaw</b><span>A little plush spirit of the moonlit night, in soft moon-white fur that deepens into a starry sky over its back, with a night-sky mask full of glowing stars, huge galaxy eyes, tall ears tipped with starlight, a crescent moon on its brow, a big curling tail banded with stars and a tiny moon of its own orbiting round it. Feed it hay and pet it every day for two days in a row, and the next morning it leaves you a Moonpearl it found in the night. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + LUNA_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="luna-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic aurora-pic"></div><div class="shop-text"><b>Auroraram</b><span>A graceful creature with a long, silky night-blue coat that ripples with the colours of the northern lights, spiralling horns of clear ice, a silky beard and glowing hooves. Feed it hay and pet it every day for two days in a row, and the next morning you can milk it for Aurora Milk (you\'ll need a Milk Pail). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + AURORA_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="aurora-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic zephyra-pic"></div><div class="shop-text"><b>Zephyra</b><span>A little spirit of the gentle west wind, made of soft, billowing cloud blushed with the pinks and golds of sunrise, with tall ears, huge sparkly eyes, a glowing sun-gem, little feathered wings and a silk scarf streaming in the breeze. It floats just above the ground on cloud-puff feet. Feed it hay and pet it every day for four days in a row, and the next morning you can shear its cloud for Cloud Wool (you\'ll need Shears). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + ZEPHYRA_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="zephyra-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic moon-pic"></div><div class="shop-text"><b>Mooncalf</b><span>A gentle creature with a pearly coat whose spots are patches of starry night sky, crescent-moon horns and star-bright hooves. Feed it hay and pet it every day, and the next morning you can milk it for Moonmilk. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + MOON_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="moon-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic pail-pic"></div><div class="shop-text"><b>Milk Pail</b><span>You need one to milk your Mooncalves and Auroraram. It never wears out.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + PAIL_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="pail-buy">Buy</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic shears-pic"></div><div class="shop-text"><b>Shears</b><span>You need them to shear your Zephyras when their cloud is full. They never wear out.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + SHEARS_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="shears-buy">Buy</button></div>' +
    '<p class="ship-hint glim-stalls" style="margin:8px 2px 0"></p>' +
    '<p class="ship-total">You have <img class="coin-icon" alt=""> <b>0</b></p>';
  canvas.parentNode.appendChild(barnShopBox);
  barnShopBox.querySelector('.shop-pic').appendChild(itemPicture('hay'));
  var glimPic = document.createElement('img'); glimPic.src = glimShopIcon; glimPic.alt = ''; glimPic.style.width = '96%'; glimPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.glim-pic').appendChild(glimPic);
  var glimAdoptBtn = barnShopBox.querySelector('.glim-adopt'), glimStallsNote = barnShopBox.querySelector('.glim-stalls');
  glimAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('glim'); });
  var duckPic = document.createElement('img'); duckPic.src = duckShopIcon; duckPic.alt = ''; duckPic.style.width = '96%'; duckPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.duck-pic').appendChild(duckPic);
  var duckAdoptBtn = barnShopBox.querySelector('.duck-adopt');
  duckAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('duck'); });
  var emberPic = document.createElement('img'); emberPic.src = emberShopIcon; emberPic.alt = ''; emberPic.style.width = '96%'; emberPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.ember-pic').appendChild(emberPic);
  var emberAdoptBtn = barnShopBox.querySelector('.ember-adopt');
  var gemPic = document.createElement('img'); gemPic.src = gemShopIcon; gemPic.alt = ''; gemPic.style.width = '96%'; gemPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.gem-pic').appendChild(gemPic);
  var gemAdoptBtn = barnShopBox.querySelector('.gem-adopt');
  var auroraPic = document.createElement('img'); auroraPic.src = auroraShopIcon; auroraPic.alt = ''; auroraPic.style.width = '96%'; auroraPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.aurora-pic').appendChild(auroraPic);
  var auroraAdoptBtn = barnShopBox.querySelector('.aurora-adopt');
  auroraAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('aurora'); });
  var zephyraPic = document.createElement('img'); zephyraPic.src = zephyraShopIcon; zephyraPic.alt = ''; zephyraPic.style.width = '96%'; zephyraPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.zephyra-pic').appendChild(zephyraPic);
  var zephyraAdoptBtn = barnShopBox.querySelector('.zephyra-adopt');
  zephyraAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('zephyra'); });
  var lunaPic = document.createElement('img'); lunaPic.src = lunaShopIcon; lunaPic.alt = ''; lunaPic.style.width = '96%'; lunaPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.luna-pic').appendChild(lunaPic);
  var lunaAdoptBtn = barnShopBox.querySelector('.luna-adopt');
  lunaAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('luna'); });
  gemAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('gem'); });
  emberAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('ember'); });
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
  barnShopBox.querySelector('.shears-pic').appendChild(itemPicture('shears'));
  var shearsBtn = barnShopBox.querySelector('.shears-buy');
  function hasShears() { return bag.some(function (b) { return b && b.id === 'shears'; }); }
  shearsBtn.addEventListener('click', function () {
    if (hasShears()) { showToast('You already have Shears', 1800); return; }
    if (state.coins < SHEARS_COST) { showToast('Not enough Star Coins', 1800); return; }
    if (!roomFor(['shears'])) { bagFull(); return; }
    addItem('shears', 1); state.coins -= SHEARS_COST; showCoins(true); coinSound(3);
    showToast('Bought a pair of Shears ✂️', 1800); renderBarnShop();
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
    duckAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + DUCK_COST;
    duckAdoptBtn.disabled = full || state.coins < DUCK_COST;
    emberAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + EMBER_COST;
    emberAdoptBtn.disabled = full || state.coins < EMBER_COST;
    gemAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + GEM_COST;
    gemAdoptBtn.disabled = full || state.coins < GEM_COST;
    auroraAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + AURORA_COST;
    auroraAdoptBtn.disabled = full || state.coins < AURORA_COST;
    zephyraAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + ZEPHYRA_COST;
    zephyraAdoptBtn.disabled = full || state.coins < ZEPHYRA_COST;
    lunaAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + LUNA_COST;
    lunaAdoptBtn.disabled = full || state.coins < LUNA_COST;
    moonAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + MOON_COST;
    moonAdoptBtn.disabled = full || state.coins < MOON_COST;
    var gotPail = hasPail();
    pailBtn.innerHTML = gotPail ? 'You have one ✓' : 'Buy · <img class="coin-icon" alt=""> ' + PAIL_COST;
    pailBtn.disabled = gotPail || state.coins < PAIL_COST;
    var gotShears = hasShears();
    shearsBtn.innerHTML = gotShears ? 'You have them ✓' : 'Buy · <img class="coin-icon" alt=""> ' + SHEARS_COST;
    shearsBtn.disabled = gotShears || state.coins < SHEARS_COST;
    glimStallsNote.textContent = glimmers.length ? 'Your animals: ' + glimmers.map(function (g) { return g.name + (g.kind === 'moon' ? ' (Mooncalf)' : g.kind === 'duck' ? ' (Puddlewisp)' : g.kind === 'ember' ? ' (Emberwing)' : g.kind === 'gem' ? ' (Gemwren)' : g.kind === 'aurora' ? ' (Auroraram)' : g.kind === 'zephyra' ? ' (Zephyra)' : g.kind === 'luna' ? ' (Lunapaw)' : ' (Glimmerwing)'); }).join(', ') + ' · ' + glimmers.length + ' of 3 stalls' : 'There are 3 empty stalls waiting for your animals.';
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
      var isTool = bag[i].id === 'axe' || bag[i].id === 'pickaxe' || bag[i].id === 'trimmers' || bag[i].id === 'hoe' || bag[i].id === 'milkPail' || bag[i].id === 'shears'; // tools don't show a count
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
  function placeMenus() {                                            // on a narrow screen, keep the open menu clear of the row of buttons under it
    var b = document.body;
    if (!b.classList.contains('full') || b.classList.contains('menu-side') || !b.classList.contains('menu-open') || !ctlBox) return;
    var r = ctlBox.getBoundingClientRect(), tb = document.querySelector('.topbar');
    b.style.setProperty('--menu-bottom', Math.round(window.innerHeight - r.top + 8) + 'px');
    b.style.setProperty('--menu-top', Math.round((tb ? tb.getBoundingClientRect().bottom : 50) + 8) + 'px');   // (below the stats, which can wrap onto two lines)
  }
  window.addEventListener('resize', function () { setTimeout(function () { layoutMenus(); placeMenus(); }, 60); });
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
    if (document.body.classList.contains('menu-open') !== menuUp) { document.body.classList.toggle('menu-open', menuUp); placeMenus(); }
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
