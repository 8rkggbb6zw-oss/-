// Everdawn, part 2 of 3 (see the note at the top of script.js)

EVERDAWN_PARTS.push(function (THREE) {
  // the sign over the doors, in the same style as Whimsy & Bloom's and the clinic's: a hand-painted board (a deep
  // forest green here) with raised gilded letters that catch the light, a gold pinstripe border, little gold feather
  // ornaments, in a moulded frame with a gold bead, lit by two brass gooseneck lamps
  function barnSignPaint(g, w, h, metalOnly) {
    if (metalOnly) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
    else {
      var base = g.createLinearGradient(0, 0, 0, h); base.addColorStop(0, '#2c4a36'); base.addColorStop(0.5, '#23402e'); base.addColorStop(1, '#1a3324');
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 300; i++) {                                  // the wood grain showing through the paint
        var gy = isle2Hash(i * 1.7 + 70) * h, lite = isle2Hash(i * 3.1 + 70) > 0.5;
        g.strokeStyle = lite ? 'rgba(140,190,150,' + (0.04 + isle2Hash(i) * 0.06) + ')' : 'rgba(5,20,10,' + (0.08 + isle2Hash(i) * 0.1) + ')';
        g.lineWidth = 0.6 + isle2Hash(i * 5) * 1.6;
        g.beginPath(); var x0 = isle2Hash(i * 2.3 + 70) * w * 0.7; g.moveTo(x0, gy);
        g.bezierCurveTo(x0 + 200, gy + (isle2Hash(i * 7) - 0.5) * 8, x0 + 420, gy - (isle2Hash(i * 9) - 0.5) * 8, x0 + 300 + isle2Hash(i * 11) * 600, gy + (isle2Hash(i * 13) - 0.5) * 5);
        g.stroke();
      }
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, h * 0.5 - 1, w, 2);   // the joint between the two boards
      var vig = g.createLinearGradient(0, 0, 0, h); vig.addColorStop(0, 'rgba(0,0,0,0.3)'); vig.addColorStop(0.18, 'rgba(0,0,0,0)'); vig.addColorStop(0.82, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.38)');
      g.fillStyle = vig; g.fillRect(0, 0, w, h);
    }
    function gold(y0, y1) {
      if (metalOnly) return '#fff';
      var gg = g.createLinearGradient(0, y0, 0, y1);
      gg.addColorStop(0, '#fff5c8'); gg.addColorStop(0.3, '#ecc054'); gg.addColorStop(0.55, '#a87824'); gg.addColorStop(0.78, '#f2d06c'); gg.addColorStop(1, '#7e5814');
      return gg;
    }
    function gild(text, x, y, size, italic, spacing) {                 // letters with a shadow, a dark bevel edge and a gold face
      g.font = (italic ? 'italic ' : '') + 'bold ' + size + 'px Georgia, serif'; g.textBaseline = 'middle';
      var chars = text.split(''), widths = chars.map(function (c) { return g.measureText(c).width + (spacing || 0); });
      var total = widths.reduce(function (a2, b2) { return a2 + b2; }, 0) - (spacing || 0), cx = x - total / 2;
      chars.forEach(function (c, k) {
        if (!metalOnly) { g.save(); g.shadowColor = 'rgba(0,0,0,0.65)'; g.shadowOffsetX = size * 0.04; g.shadowOffsetY = size * 0.06; g.shadowBlur = size * 0.08; g.fillStyle = '#4a3008'; g.fillText(c, cx + 1.5, y + 2); g.restore(); }
        g.fillStyle = gold(y - size * 0.5, y + size * 0.5); g.fillText(c, cx, y);
        if (!metalOnly) { g.strokeStyle = 'rgba(255,248,215,0.5)'; g.lineWidth = 1; g.strokeText(c, cx - 0.6, y - 1); }
        cx += widths[k];
      });
    }
    function rrect(m, r) { g.beginPath(); g.moveTo(m + r, m); g.lineTo(w - m - r, m); g.quadraticCurveTo(w - m, m, w - m, m + r); g.lineTo(w - m, h - m - r); g.quadraticCurveTo(w - m, h - m, w - m - r, h - m); g.lineTo(m + r, h - m); g.quadraticCurveTo(m, h - m, m, h - m - r); g.lineTo(m, m + r); g.quadraticCurveTo(m, m, m + r, m); g.stroke(); }
    g.strokeStyle = metalOnly ? '#fff' : gold(0, h); g.lineWidth = 6; rrect(18, 26);
    g.lineWidth = 2; rrect(32, 18);
    function feather(cx, cy, s, rot) {                                 // a gilded feather
      g.save(); g.translate(cx, cy); g.rotate(rot);
      g.fillStyle = metalOnly ? '#fff' : gold(-s, s);
      g.beginPath(); g.moveTo(0, -s); g.bezierCurveTo(s * 0.45, -s * 0.5, s * 0.4, s * 0.4, 0, s * 0.7); g.bezierCurveTo(-s * 0.4, s * 0.4, -s * 0.45, -s * 0.5, 0, -s); g.fill();
      if (!metalOnly) {
        g.strokeStyle = '#6a4a10'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -s * 0.9); g.lineTo(0, s * 1.1); g.stroke();
        g.lineWidth = 1.5; for (var b = -0.6; b < 0.6; b += 0.16) { g.beginPath(); g.moveTo(0, b * s); g.lineTo(s * 0.3, b * s - s * 0.18); g.moveTo(0, b * s); g.lineTo(-s * 0.3, b * s - s * 0.18); g.stroke(); }
      }
      g.restore();
    }
    feather(150, h / 2 + 4, 80, -0.5); feather(w - 150, h / 2 + 4, 80, 0.5);
    gild('Fluff & Feather', w / 2, h / 2 - 34, 168, true, 2);
    gild('ANIMALS · FEED · SUPPLIES', w / 2, h / 2 + 108, 42, false, 10);
    g.strokeStyle = metalOnly ? '#fff' : '#c99a3a'; g.lineWidth = 3;
    [-1, 1].forEach(function (d) {
      var ex = w / 2 + d * 420;
      g.beginPath(); g.moveTo(ex, h / 2 + 108); g.lineTo(ex + d * 90, h / 2 + 108); g.stroke();
      g.fillStyle = metalOnly ? '#fff' : '#e3b54c'; g.beginPath(); g.moveTo(ex + d * 106, h / 2 + 98); g.lineTo(ex + d * 116, h / 2 + 108); g.lineTo(ex + d * 106, h / 2 + 118); g.lineTo(ex + d * 96, h / 2 + 108); g.closePath(); g.fill();
    });
  }
  var barnSignTex = paintTexture(2048, 360, function (g, w, h) { barnSignPaint(g, w, h, false); });
  var barnSignMetal = paintTexture(2048, 360, function (g, w, h) { barnSignPaint(g, w, h, true); });
  barnSignTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var barnSignMat = new THREE.MeshStandardMaterial({ map: barnSignTex, metalnessMap: barnSignMetal, metalness: 0.35, roughness: 0.4, emissive: 0xe8b54a, emissiveMap: barnSignMetal, emissiveIntensity: 0.25 });   // the gilding catches the light
  var BS_Y = B_FOUND + 2.78, BS_Z = B_FZ + 0.05;
  apPart(new THREE.BoxGeometry(3.35, 0.56, 0.05), new THREE.MeshStandardMaterial({ color: 0x23402e, roughness: 0.5 }), 0, BS_Y, BS_Z + 0.025);
  apPart(new THREE.PlaneGeometry(3.24, 0.5), barnSignMat, 0, BS_Y, BS_Z + 0.052);
  [[0, 0.28, 3.46, 0.06], [0, -0.28, 3.46, 0.06], [-1.7, 0, 0.06, 0.62], [1.7, 0, 0.06, 0.62]].forEach(function (f) {   // the moulded frame with a gold bead
    apPart(new THREE.BoxGeometry(f[2], f[3], 0.07), AM.trim, f[0], BS_Y + f[1], BS_Z + 0.06);
    apPart(new THREE.BoxGeometry(f[2] > 1 ? 3.34 : 0.018, f[3] > 0.1 ? 0.5 : 0.018, 0.02), houseMats.gold, f[0] * 0.985, BS_Y + f[1] * 0.9, BS_Z + 0.09);
  });
  var barnSignLampInner = new THREE.MeshStandardMaterial({ color: 0xfff6e0, emissive: 0xffd9a0, emissiveIntensity: 0.2, side: THREE.BackSide });
  var barnSignGlows = [];
  [-1.15, 1.15].forEach(function (lx) {                                // brass gooseneck lamps lighting the sign
    var y0 = BS_Y + 0.31, z0 = BS_Z + 0.08;
    apPart(new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12), houseMats.gold, lx, y0 + 0.01, z0);
    var neck = new THREE.CatmullRomCurve3([new THREE.Vector3(lx, y0, z0), new THREE.Vector3(lx, y0 + 0.16, z0 + 0.04), new THREE.Vector3(lx, y0 + 0.22, z0 + 0.2), new THREE.Vector3(lx, y0 + 0.15, z0 + 0.36)]);
    apPart(new THREE.TubeGeometry(neck, 14, 0.012, 6), houseMats.gold, 0, 0, 0);
    apPart(new THREE.SphereGeometry(0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), houseMats.gold, lx, y0 + 0.13, z0 + 0.38, 0.75, 0, 0).scale.set(1.3, 0.8, 1);
    var inner = apPart(new THREE.SphereGeometry(0.076, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), barnSignLampInner, lx, y0 + 0.13, z0 + 0.38, 0.75, 0, 0);
    inner.scale.set(1.3, 0.8, 1); inner.castShadow = false;
    var lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    lg.position.set(lx, y0 + 0.06, z0 + 0.34); lg.scale.set(0.6, 0.6, 1); barnGroup.add(lg); barnSignGlows.push(lg);
  });
  // gooseneck lanterns either side of the doors
  var barnLampGlows = [];
  [-1, 1].forEach(function (s) {
    var lx = s * 2.1, ly = B_FOUND + 2.0;
    apPart(new THREE.BoxGeometry(0.1, 0.2, 0.04), AM.iron, lx, ly, B_FZ + 0.03);
    apPart(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), AM.iron, lx, ly + 0.05, B_FZ + 0.18, Math.PI / 2, 0, 0);
    apPart(new THREE.ConeGeometry(0.16, 0.12, 16, 1, true), AM.iron, lx, ly + 0.03, B_FZ + 0.34);
    apPart(new THREE.SphereGeometry(0.05, 10, 8), AM.lamp, lx, ly - 0.02, B_FZ + 0.34);
    var lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc870, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    lg.position.set(lx, ly - 0.05, B_FZ + 0.36); lg.scale.set(1.2, 1.2, 1); barnGroup.add(lg); barnLampGlows.push(lg);
  });
  // windows down each side, with white trim, cross bars, glowing panes and flower boxes
  [-1, 1].forEach(function (s) {
    [-2.6, 0, 2.6].forEach(function (wz) {
      if (s === 1 && wz === 0) return;                                   // (a Dutch door goes here instead)
      var wg = new THREE.Group(); wg.position.set(s * (BW + 0.01), B_FOUND + 1.8, wz); wg.rotation.y = s * Math.PI / 2; barnGroup.add(wg);
      apPart(new THREE.PlaneGeometry(0.9, 0.9), AM.warm, 0, 0, 0.02, 0, 0, 0, wg);
      [[0, 0.5, 1.1, 0.12], [0, -0.5, 1.1, 0.12], [-0.5, 0, 0.12, 0.9], [0.5, 0, 0.12, 0.9], [0, 0, 0.04, 0.9], [0, 0, 0.9, 0.04]].forEach(function (f) { apPart(new THREE.BoxGeometry(f[2], f[3], 0.06), AM.trim, f[0], f[1], 0.04, 0, 0, 0, wg); });
      apPart(new THREE.BoxGeometry(1.0, 0.2, 0.2), AM.darkWood, 0, -0.65, 0.12, 0, 0, 0, wg);
      for (var fl = 0; fl < 8; fl++) apPart(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshStandardMaterial({ color: [0xf2c14e, 0xff8a6a, 0xf7f3ec][fl % 3], roughness: 0.6 }), -0.4 + fl * 0.115, -0.52 + isle2Hash(fl + wz) * 0.05, 0.14 + isle2Hash(fl * 3) * 0.06, 0, 0, 0, wg);
      for (var lf = 0; lf < 10; lf++) apPart(new THREE.IcosahedronGeometry(0.05, 0), new THREE.MeshStandardMaterial({ color: 0x4a8a3a, roughness: 0.8, flatShading: true }), -0.42 + lf * 0.093, -0.56, 0.16 + isle2Hash(lf + wz * 2) * 0.05, 0, 0, 0, wg);
    });
  });
  // props out front: hay bales, feed sacks, a water trough, a milk churn and a wheelbarrow of pumpkins
  // hay bales: straw pressed into a slightly lumpy block, long golden strands along the sides, chopped flakes on the
  // cut ends, two tight loops of baling twine sinking into the straw, and loose wisps sticking out everywhere
  var hayRnd = function (n) { return isle2Hash(n * 1.37 + 4400); };
  var haySideTex = paintTexture(256, 128, function (g, w, h) {         // the long sides: strands of straw lying lengthwise
    g.fillStyle = '#b8903e'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 2600; i++) {
      var x = hayRnd(i) * w, y = hayRnd(i + 0.5) * h, len = 12 + hayRnd(i + 0.25) * 40, a = (hayRnd(i + 0.75) - 0.5) * 0.25, l = 45 + hayRnd(i * 3) * 30;
      g.strokeStyle = 'hsl(' + (40 + hayRnd(i * 5) * 10) + ',' + (45 + hayRnd(i * 7) * 25) + '%,' + l + '%)'; g.lineWidth = 0.8 + hayRnd(i * 9) * 1.4;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
    for (var d = 0; d < 300; d++) { g.fillStyle = 'rgba(70,45,15,' + hayRnd(d * 11) * 0.35 + ')'; g.fillRect(hayRnd(d * 13) * w, hayRnd(d * 17) * h, 3 + hayRnd(d) * 8, 1); }   // shadowy gaps between strands
  });
  var hayEndTex = paintTexture(128, 128, function (g, w, h) {          // the cut ends: packed flakes of chopped stalks
    g.fillStyle = '#a07a32'; g.fillRect(0, 0, w, h);
    for (var f = 0; f < 6; f++) { g.fillStyle = 'rgba(60,35,10,0.35)'; g.fillRect(f * w / 6 + hayRnd(f) * 4, 0, 1.5, h); }   // the flakes the baler packed in
    for (var i = 0; i < 1400; i++) {
      var x = hayRnd(i * 2) * w, y = hayRnd(i * 3) * h, r = 0.8 + hayRnd(i * 4) * 2.2, l = 40 + hayRnd(i * 5) * 35;
      g.fillStyle = 'hsl(' + (38 + hayRnd(i * 6) * 12) + ',55%,' + l + '%)'; g.beginPath(); g.ellipse(x, y, r * 1.6, r, hayRnd(i * 7) * 3, 0, Math.PI * 2); g.fill();
      if (hayRnd(i * 8) > 0.7) { g.fillStyle = 'rgba(50,30,8,0.5)'; g.beginPath(); g.arc(x, y, r * 0.4, 0, Math.PI * 2); g.fill(); }   // hollow stalk ends
    }
  });
  haySideTex.wrapS = haySideTex.wrapT = hayEndTex.wrapS = hayEndTex.wrapT = THREE.RepeatWrapping;
  var haySide = new THREE.MeshStandardMaterial({ map: haySideTex, bumpMap: haySideTex, bumpScale: 0.025, roughness: 1 });
  var hayEnd = new THREE.MeshStandardMaterial({ map: hayEndTex, bumpMap: hayEndTex, bumpScale: 0.03, roughness: 1 });
  var hayTwineMat = new THREE.MeshStandardMaterial({ color: 0xc89a5a, roughness: 0.9 });
  var hayWisps = [], hayWispMat = new THREE.MeshStandardMaterial({ color: 0xd8b060, roughness: 0.9 });
  var HB_L = 0.9, HB_H = 0.42, HB_W = 0.48;
  function haybale(x, y, z, ry) {
    var n = hayBaleCount++;
    var geo = new THREE.BoxGeometry(HB_L, HB_H, HB_W, 14, 6, 8), p = geo.attributes.position;
    for (var v = 0; v < p.count; v++) {                                // round the edges and make it a little lumpy and bulging
      var vx = p.getX(v), vy = p.getY(v), vz = p.getZ(v), ex = Math.abs(vx) / (HB_L / 2), ey = Math.abs(vy) / (HB_H / 2), ez = Math.abs(vz) / (HB_W / 2);
      var edge = Math.max(0, ey + ez - 1.55) + Math.max(0, ex + ey - 1.7) + Math.max(0, ex + ez - 1.7);
      var k = 1 - edge * 0.12, bulge = 1 + (1 - ex * ex) * 0.035;
      var jit = (isle2Hash(vx * 37.1 + vy * 91.7 + vz * 53.3 + n * 7) - 0.5) * 0.018;
      p.setXYZ(v, vx * k + jit, vy * k * bulge + jit * 0.6, vz * k * bulge + jit);
    }
    geo.computeVertexNormals();
    var b = apPart(geo, [hayEnd, hayEnd, haySide, haySide, haySide, haySide], x, y + HB_H / 2, z, 0, ry, 0);
    [-0.22, 0.22].forEach(function (tx) {                               // a loop of twine round it, pressed into the straw
      var loop = [], hy = HB_H / 2 + 0.002, hz = HB_W / 2 + 0.002, r = 0.03;
      for (var a = 0; a <= 32; a++) {
        var t = a / 32 * Math.PI * 2, cx = Math.cos(t), cy = Math.sin(t);
        loop.push(new THREE.Vector3(tx + (isle2Hash(a + n) - 0.5) * 0.006, Math.sign(cy) * Math.min(hy, Math.abs(cy) * (hy + 0.2)) - Math.sign(cy) * (Math.abs(cy) > 0.7 ? 0.004 : 0), Math.sign(cx) * Math.min(hz, Math.abs(cx) * (hz + 0.2))));
      }
      apPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop, true), 64, 0.0055, 5, true), hayTwineMat, 0, 0, 0, 0, 0, 0, b);
    });
    for (var w = 0; w < 70; w++) {                                     // loose wisps poking out of every face
      var face = Math.floor(hayRnd(n * 100 + w) * 6), u = hayRnd(n * 100 + w + 0.3) - 0.5, q = hayRnd(n * 100 + w + 0.6) - 0.5;
      var px = face < 2 ? (face ? -1 : 1) * HB_L / 2 : u * HB_L * 0.95, py = face === 2 ? HB_H / 2 : face === 3 ? -HB_H / 2 + 0.03 : (face < 2 ? u : q) * HB_H * 0.9, pz = face > 3 ? (face === 4 ? 1 : -1) * HB_W / 2 : q * HB_W * 0.9;
      if (face === 3) continue;                                         // (none underneath)
      hayWisps.push({ b: b, p: new THREE.Vector3(px, py, pz), ax: (hayRnd(w * 7 + n) - 0.5) * 2.4, az: (hayRnd(w * 11 + n) - 0.5) * 2.4, ay: hayRnd(w * 13 + n) * 6, len: 0.06 + hayRnd(w * 17 + n) * 0.12 });
    }
    return b;
  }
  var hayBaleCount = 0;
  var barnBaleProto = haybale(-2.6, 0, B_FZ + 0.9, 0.1); haybale(-3.5, 0, B_FZ + 0.7, -0.2); haybale(-3.05, HB_H, B_FZ + 0.8, 0.3);
  (function () {                                                       // all the loose wisps of straw, in one batch
    var im = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0025, 0.0015, 1, 3), hayWispMat, hayWisps.length), m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), pos = new THREE.Vector3(), col = new THREE.Color();
    hayWisps.forEach(function (w, i) {
      w.b.updateMatrix(); barnGroup.updateMatrix();
      e.set(w.ax, w.ay, w.az); q.setFromEuler(e); sc.set(1, w.len, 1);
      pos.copy(w.p).applyMatrix4(w.b.matrix);
      q.premultiply(new THREE.Quaternion().setFromRotationMatrix(w.b.matrix));
      m.compose(pos, q, sc); im.setMatrixAt(i, m);
      im.setColorAt(i, col.setHSL(0.11 + hayRnd(i * 3) * 0.03, 0.55, 0.45 + hayRnd(i * 5) * 0.25));
    });
    im.castShadow = true; barnGroup.add(im);
  })();
  // burlap feed sacks: a coarse woven cloth with a printed label, plump and slumped, their necks gathered and tied
  // with twine, the top one flopped over the others
  var burlapTex = paintTexture(128, 128, function (g, w, h) {
    g.fillStyle = '#c8b088'; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 3) { g.fillStyle = 'rgba(90,65,35,' + (0.18 + isle2Hash(y) * 0.12) + ')'; g.fillRect(0, y, w, 1); }     // the weave: weft
    for (var x = 0; x < w; x += 3) { g.fillStyle = 'rgba(255,240,210,' + (0.1 + isle2Hash(x + 50) * 0.1) + ')'; g.fillRect(x, 0, 1, h); }   // and warp
    for (var i = 0; i < 400; i++) { g.fillStyle = 'rgba(80,55,25,' + isle2Hash(i * 3) * 0.2 + ')'; g.fillRect(isle2Hash(i) * w, isle2Hash(i * 2) * h, 1 + isle2Hash(i * 5) * 3, 1); }   // slubs
  });
  burlapTex.wrapS = burlapTex.wrapT = THREE.RepeatWrapping; burlapTex.repeat.set(3, 3);
  var sackLabels = ['HEN FEED', 'SHEEP MIX', 'OATS'].map(function (t, k) {
    return paintTexture(128, 96, function (g, w, h) {
      g.fillStyle = '#c8b088'; g.fillRect(0, 0, w, h);
      for (var y = 0; y < h; y += 3) { g.fillStyle = 'rgba(90,65,35,0.2)'; g.fillRect(0, y, w, 1); }
      g.strokeStyle = ['#8a2a20', '#2f5a3a', '#2f4a6a'][k]; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20);
      g.fillStyle = g.strokeStyle; g.textAlign = 'center'; g.font = 'bold 19px Georgia, serif'; g.fillText(t, w / 2, 46);
      g.font = 'italic 11px Georgia, serif'; g.fillText('Fluff & Feather', w / 2, 66);
      g.beginPath(); g.moveTo(w / 2, 82); g.bezierCurveTo(w / 2 - 8, 74, w / 2 - 5, 70, w / 2, 74); g.bezierCurveTo(w / 2 + 5, 70, w / 2 + 8, 74, w / 2, 82); g.fill();
    });
  });
  var sackMat = new THREE.MeshStandardMaterial({ map: burlapTex, bumpMap: burlapTex, bumpScale: 0.02, roughness: 1 });
  var sackTwine = new THREE.MeshStandardMaterial({ color: 0x9a7448, roughness: 0.9 });
  var barnSackProtos = [];                                             // (kept so the barn's inside can have the same sacks)
  [[2.5, 0.85, 0.2, 0.24, 0], [2.98, 0.95, -0.3, 0.24, 1], [2.74, 0.82, 0.9, 0.62, 2]].forEach(function (sk) {
    var sg = new THREE.Group(); sg.position.set(sk[0], sk[3] - 0.24, B_FZ + sk[1]); sg.rotation.y = sk[2]; barnGroup.add(sg); barnSackProtos.push(sg);
    if (sk[4] === 2) sg.rotation.z = 1.2;                             // the top sack lies flopped across the others
    var geo = new THREE.SphereGeometry(0.28, 20, 16), gp = geo.attributes.position;
    for (var v = 0; v < gp.count; v++) {                              // a slumped sack: flat bottom, squared shoulders, lumpy sides
      var x = gp.getX(v), y = gp.getY(v), z = gp.getZ(v);
      if (y < -0.2) y = -0.2 - (y + 0.2) * 0.15;
      var sq = 1 + 0.18 * (1 - Math.abs(y) / 0.28);
      x *= sq * 0.85; z *= sq * 0.6;
      var lump = (isle2Hash(x * 41 + y * 73 + z * 29 + sk[4]) - 0.5) * 0.02;
      gp.setXYZ(v, x + lump, y * 1.05 + 0.2, z + lump);
    }
    geo.computeVertexNormals();
    apPart(geo, sackMat, 0, 0, 0, 0, 0, 0, sg);
    apPart(new THREE.PlaneGeometry(0.26, 0.2), new THREE.MeshStandardMaterial({ map: sackLabels[sk[4]], roughness: 1, transparent: true, opacity: 0.95 }), 0, 0.2, 0.172, -0.08, 0, 0, sg);   // the printed label
    apPart(new THREE.CylinderGeometry(0.05, 0.11, 0.1, 12), sackMat, 0, 0.52, 0, 0, 0, 0, sg);       // the gathered neck
    apPart(new THREE.TorusGeometry(0.052, 0.008, 6, 14), sackTwine, 0, 0.55, 0, Math.PI / 2, 0, 0, sg);
    for (var f = 0; f < 6; f++) { var fa = f / 6 * Math.PI * 2; apPart(new THREE.ConeGeometry(0.03, 0.09, 4), sackMat, Math.cos(fa) * 0.04, 0.62, Math.sin(fa) * 0.04, Math.cos(fa) * 0.5, 0, -Math.sin(fa) * 0.5, sg); }   // the frilled top
    apPart(new THREE.CylinderGeometry(0.004, 0.004, 0.1, 4), sackTwine, 0.05, 0.51, 0.03, 0.3, 0, 0.6, sg);   // a twine tail
  });
  var trough = new THREE.Group(); trough.position.set(BW + 1.0, 0, 1.0); trough.rotation.y = Math.PI / 2; barnGroup.add(trough);
  apPart(new THREE.BoxGeometry(1.4, 0.4, 0.5), AM.darkWood, 0, 0.25, 0, 0, 0, 0, trough);
  apPart(new THREE.BoxGeometry(1.3, 0.02, 0.4), new THREE.MeshStandardMaterial({ color: 0x6ab0d8, roughness: 0.05, metalness: 0.2 }), 0, 0.4, 0, 0, 0, 0, trough);
  [-0.55, 0.55].forEach(function (lx) { apPart(new THREE.BoxGeometry(0.08, 0.1, 0.55), AM.iron, lx, 0.05, 0, 0, 0, 0, trough); });
  var churnPts = [[0.001, 0], [0.16, 0], [0.17, 0.05], [0.17, 0.4], [0.1, 0.5], [0.07, 0.55], [0.08, 0.6], [0.001, 0.62]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
  var churnMat = new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.38, metalness: 0.35 });   // an old steel milk churn: bands, side handles, a lid and a few dull patches
  apPart(new THREE.LatheGeometry(churnPts, 28), churnMat, 2.0, 0, B_FZ + 0.6);
  [0.04, 0.2, 0.38].forEach(function (by) { apPart(new THREE.TorusGeometry(0.172, 0.01, 6, 28), churnMat, 2.0, by, B_FZ + 0.6, Math.PI / 2, 0, 0); });
  [-1, 1].forEach(function (s) { apPart(new THREE.TorusGeometry(0.05, 0.01, 6, 14, Math.PI), churnMat, 2.0 + s * 0.17, 0.42, B_FZ + 0.6, 0, s * Math.PI / 2, -Math.PI / 2 * s).rotation.set(0, Math.PI / 2, s > 0 ? -Math.PI / 2 : Math.PI / 2); });
  apPart(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 20), churnMat, 2.0, 0.62, B_FZ + 0.6);
  apPart(new THREE.TorusGeometry(0.035, 0.01, 6, 14, Math.PI), churnMat, 2.0, 0.64, B_FZ + 0.6);
  [[0.11, 0.25, 0.5], [-0.08, 0.12, 2.2]].forEach(function (pt) { apPart(new THREE.CircleGeometry(0.035, 10), new THREE.MeshStandardMaterial({ color: 0x8a7a6a, roughness: 0.9, transparent: true, opacity: 0.6 }), 2.0 + Math.sin(pt[2]) * 0.172, pt[1], B_FZ + 0.6 + Math.cos(pt[2]) * 0.172, 0, pt[2], 0); });   // dull, worn patches
  // ----- more of the farmyard -----
  // lightning rods along the ridge, each with a blue glass ball, joined by a twisted cable
  [-3.2, 0, 3.2].forEach(function (rz, k) {
    if (k === 1) return;                                               // (the cupola's in the middle)
    apPart(new THREE.CylinderGeometry(0.012, 0.016, 0.9, 6), AM.iron, 0, B_TOP + 3.1, rz);
    apPart(new THREE.SphereGeometry(0.07, 14, 10), new THREE.MeshStandardMaterial({ color: 0x5aa0e8, roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.8 }), 0, B_TOP + 3.05, rz);
    apPart(new THREE.ConeGeometry(0.03, 0.12, 6), AM.iron, 0, B_TOP + 3.6, rz);
    [0.12, -0.12].forEach(function (sz) { apPart(new THREE.BoxGeometry(0.02, 0.2, 0.02), AM.iron, 0, B_TOP + 2.75, rz + sz, sz > 0 ? 0.6 : -0.6, 0, 0); });
  });
  apPart(new THREE.CylinderGeometry(0.008, 0.008, BD * 2, 5), AM.iron, 0.05, B_TOP + 2.76, 0, Math.PI / 2, 0, 0);
  // a Dutch door on the right side (top half open, a geranium on its shelf) under a little shingled awning
  var DD = new THREE.Group(); DD.position.set(BW + 0.01, B_FOUND, 0); DD.rotation.y = Math.PI / 2; barnGroup.add(DD);
  apPart(new THREE.BoxGeometry(1.0, 2.0, 0.02), AM.warm, 0, 1.0, 0.0, 0, 0, 0, DD);
  apPart(new THREE.BoxGeometry(1.0, 0.98, 0.06), AM.siding, 0, 0.49, 0.03, 0, 0, 0, DD);                                // the bottom half, shut
  [[0, 0.47, 1.0, 0.1], [0, -0.47, 1.0, 0.1], [-0.45, 0, 0.1, 0.98], [0.45, 0, 0.1, 0.98]].forEach(function (f) { apPart(new THREE.BoxGeometry(f[2], f[3], 0.03), AM.trim, f[0], 0.49 + f[1], 0.07, 0, 0, 0, DD); });
  apPart(new THREE.BoxGeometry(1.15, 0.1, 0.06), AM.trim, 0, 0.49, 0.07, 0, 0, -Math.atan2(0.88, 0.9), DD);
  apPart(new THREE.BoxGeometry(1.1, 0.05, 0.2), AM.wood, 0, 1.0, 0.1, 0, 0, 0, DD);                                  // the shelf on top of it
  apPart(new THREE.CylinderGeometry(0.07, 0.055, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0xc0704a, roughness: 0.85 }), 0.25, 1.085, 0.1, 0, 0, 0, DD);
  for (var gf = 0; gf < 7; gf++) apPart(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshStandardMaterial({ color: gf % 2 ? 0xe0304a : 0x3f7a3a, roughness: 0.6 }), 0.25 + (isle2Hash(gf) - 0.5) * 0.12, 1.17 + isle2Hash(gf * 3) * 0.06, 0.1 + (isle2Hash(gf * 5) - 0.5) * 0.12, 0, 0, 0, DD);
  var dutchTop = new THREE.Group(); dutchTop.position.set(-0.5, 1.5, 0.05); dutchTop.rotation.y = -1.9; DD.add(dutchTop);   // the top half, swung open against the wall
  apPart(new THREE.BoxGeometry(1.0, 0.98, 0.05), AM.siding, 0.5, 0, 0, 0, 0, 0, dutchTop);
  apPart(new THREE.BoxGeometry(0.5, 0.4, 0.02), AM.warm, 0.5, 0.15, 0.03, 0, 0, 0, dutchTop);
  [[-0.5, 0], [0.5, 0]].forEach(function (f) { apPart(new THREE.BoxGeometry(0.2, 0.04, 0.02), AM.iron, 0.12, 0.3 * (f[0] > 0 ? 1 : -1), 0.03, 0, 0, 0, dutchTop); });
  [[-0.6, 1.0, 0.12, 2.1], [0.6, 1.0, 0.12, 2.1], [0, 2.07, 1.32, 0.14]].forEach(function (f) { apPart(new THREE.BoxGeometry(f[2], f[3], 0.08), AM.trim, f[0], f[1], 0.04, 0, 0, 0, DD); });
  var awnShingle = AM.shingle.clone(); awnShingle.map = barnShingleTex.clone(); awnShingle.map.needsUpdate = true; awnShingle.map.repeat.set(1, 0.6); awnShingle.bumpMap = awnShingle.map;
  apPart(new THREE.BoxGeometry(1.6, 0.06, 0.8), awnShingle, 0, 2.35, 0.36, 0.35, 0, 0, DD);
  [-0.7, 0.7].forEach(function (bx) { apPart(new THREE.BoxGeometry(0.06, 0.06, 0.62), AM.darkWood, bx, 2.15, 0.3, -0.62, 0, 0, DD); });
  apPart(new THREE.CylinderGeometry(0.025, 0.025, 0.1, 10), AM.iron, -0.35, 0.75, 0.1, Math.PI / 2, 0, 0, DD);       // the latch knob
  // half-barrel planters of flowers either side of the doors, and a wagon wheel leaning on the wall
  var staveTex = paintTexture(256, 64, function (g, w, h) {           // weathered oak staves, each a slightly different shade
    for (var x = 0; x < w; x += 16) {
      var l = 36 + isle2Hash(x * 0.7 + 3) * 10;
      g.fillStyle = 'hsl(28,40%,' + l + '%)'; g.fillRect(x, 0, 16, h);
      for (var gr = 0; gr < 5; gr++) { g.strokeStyle = 'rgba(40,20,8,0.25)'; g.lineWidth = 1; var gx = x + 2 + isle2Hash(x + gr) * 12; g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx + (isle2Hash(gr + x * 2) - 0.5) * 3, h); g.stroke(); }
      g.fillStyle = 'rgba(20,10,4,0.55)'; g.fillRect(x, 0, 1.5, h);
    }
  });
  staveTex.wrapS = THREE.RepeatWrapping; staveTex.repeat.set(3, 1);
  var staveMat = new THREE.MeshStandardMaterial({ map: staveTex, bumpMap: staveTex, bumpScale: 0.01, roughness: 0.85, side: THREE.DoubleSide });
  var barrelPetal = [0xf6a6c8, 0xffd04a, 0xf7f3ec, 0xc8b4ec].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, side: THREE.DoubleSide }); });
  var barrelLeaf = new THREE.MeshStandardMaterial({ color: 0x3f7a3a, roughness: 0.6, side: THREE.DoubleSide });
  [-1, 1].forEach(function (s) {
    var bx = s * 2.55, bz = B_FZ + 0.45;
    var barrelPts = [[0.26, 0], [0.29, 0.1], [0.3, 0.22], [0.29, 0.34], [0.285, 0.36]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    apPart(new THREE.LatheGeometry(barrelPts, 32), staveMat, bx, 0, bz);
    apPart(new THREE.TorusGeometry(0.285, 0.014, 6, 28), AM.darkWood, bx, 0.36, bz, Math.PI / 2, 0, 0);   // the rim of the staves
    [0.07, 0.29].forEach(function (hy) {                                // iron hoops, with rivets
      apPart(new THREE.CylinderGeometry(0.296, 0.296, 0.035, 32, 1, true), AM.iron, bx, hy, bz);
      for (var r = 0; r < 8; r++) { var ra = r / 8 * Math.PI * 2; apPart(new THREE.SphereGeometry(0.008, 6, 4), AM.iron, bx + Math.cos(ra) * 0.3, hy, bz + Math.sin(ra) * 0.3); }
    });
    apPart(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 24), new THREE.MeshStandardMaterial({ color: 0x4a3222, roughness: 1 }), bx, 0.33, bz);
    for (var fbl = 0; fbl < 18; fbl++) {                               // a mound of leaves, and pansies and daisies with real petals
      var fa = fbl * 2.4, fr = 0.04 + (fbl % 4) * 0.055;
      var lf = apPart(new THREE.SphereGeometry(1, 8, 5), barrelLeaf, bx + Math.cos(fa) * fr, 0.38 + isle2Hash(fbl + s) * 0.08, bz + Math.sin(fa) * fr);
      lf.scale.set(0.07, 0.012, 0.035); lf.rotation.set(isle2Hash(fbl * 3) - 0.5, -fa, 0.3);
    }
    for (var fl = 0; fl < 9; fl++) {
      var fla = fl * 2.4 + s, flr = (fl % 3) * 0.08, fx = bx + Math.cos(fla) * flr, fz = bz + Math.sin(fla) * flr, fy = 0.46 + isle2Hash(fl * 5 + s) * 0.08;
      var fg = new THREE.Group(); fg.position.set(fx, fy, fz); fg.rotation.set(-Math.PI / 2 + (isle2Hash(fl) - 0.5) * 0.6, 0, fla); barnGroup.add(fg);
      var pm = barrelPetal[(fl + (s > 0 ? 1 : 0)) % 4], np = pm === barrelPetal[2] ? 10 : 5;
      for (var pt = 0; pt < np; pt++) { var pa = pt / np * Math.PI * 2; var pe = apPart(new THREE.CircleGeometry(np === 10 ? 0.012 : 0.022, 8), pm, Math.cos(pa) * (np === 10 ? 0.018 : 0.02), Math.sin(pa) * (np === 10 ? 0.018 : 0.02), 0, 0, 0, pa, fg); pe.scale.set(np === 10 ? 1.8 : 1.1, 0.8, 1); pe.castShadow = false; }
      apPart(new THREE.SphereGeometry(0.011, 8, 6), new THREE.MeshStandardMaterial({ color: np === 10 ? 0xf2b63a : 0x4a2a5a }), 0, 0, 0.004, 0, 0, 0, fg);
    }
  });
  var wheel = new THREE.Group(); wheel.position.set(BW + 0.12, 0.62, -3.9); wheel.rotation.set(0, Math.PI / 2, 0.12); barnGroup.add(wheel);
  apPart(new THREE.TorusGeometry(0.6, 0.04, 8, 32), AM.wood, 0, 0, 0, 0, 0, 0, wheel);
  apPart(new THREE.TorusGeometry(0.6, 0.015, 6, 32), AM.iron, 0, 0, 0.02, 0, 0, 0, wheel);
  apPart(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12), AM.darkWood, 0, 0, 0, Math.PI / 2, 0, 0, wheel);
  for (var sp = 0; sp < 10; sp++) apPart(new THREE.CylinderGeometry(0.015, 0.02, 0.55, 6), AM.wood, Math.cos(sp / 10 * Math.PI * 2) * 0.32, Math.sin(sp / 10 * Math.PI * 2) * 0.32, 0, 0, 0, sp / 10 * Math.PI * 2 - Math.PI / 2, wheel);
  // a pitchfork leaning on the bales
  var fork = new THREE.Group(); fork.position.set(-2.2, 0, B_FZ + 1.25); fork.rotation.set(0.3, 0.4, 0.15); barnGroup.add(fork);
  apPart(new THREE.CylinderGeometry(0.018, 0.018, 1.4, 6), AM.wood, 0, 0.7, 0, 0, 0, 0, fork);
  apPart(new THREE.BoxGeometry(0.22, 0.03, 0.03), AM.iron, 0, 1.42, 0, 0, 0, 0, fork);
  [-0.09, -0.03, 0.03, 0.09].forEach(function (tx) { apPart(new THREE.CylinderGeometry(0.008, 0.004, 0.28, 5), AM.iron, tx, 1.56, 0, 0, 0, 0, fork); });
  // a bird house on a post by the path
  var bh = new THREE.Group(); bh.position.set(ANIMAL_HW + 1.6, 0, B_FZ + 2.2); barnGroup.add(bh);
  apPart(new THREE.BoxGeometry(0.07, 1.6, 0.07), AM.wood, 0, 0.8, 0, 0, 0, 0, bh);
  apPart(new THREE.BoxGeometry(0.26, 0.24, 0.24), AM.siding, 0, 1.72, 0, 0, 0, 0, bh);
  [-1, 1].forEach(function (s) { apPart(new THREE.BoxGeometry(0.2, 0.02, 0.32), AM.trim, s * 0.08, 1.88, 0, 0, 0, -s * 0.7, bh); });
  apPart(new THREE.CircleGeometry(0.035, 12), AM.black, 0, 1.74, 0.121, 0, 0, 0, bh);
  apPart(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 5), AM.wood, 0, 1.68, 0.14, Math.PI / 2, 0, 0, bh);
  function updateAnimalShop(t, glow) {                                 // lanterns at night, the weathervane in the breeze, and the animals nibbling and pecking
    AM.lamp.emissiveIntensity = 0.3 + glow * 1.5;
    AM.warm.emissiveIntensity = 0.5 + glow * 0.8;
    for (var i = 0; i < barnLampGlows.length; i++) barnLampGlows[i].material.opacity = glow * 0.8;
    barnSignMat.emissiveIntensity = 0.25 + glow * 0.45;                 // the little lamps make the gold letters shine at night
    barnSignLampInner.emissiveIntensity = 0.2 + glow * 1.2;
    for (var sgl = 0; sgl < barnSignGlows.length; sgl++) barnSignGlows[sgl].material.opacity = glow * 0.75;
    rooster.rotation.y = Math.sin(t * 0.17) * 1.2 + Math.sin(t * 0.43) * 0.3;
  }
  (function () {                                                       // you bump into the barn, the bales and the trough
    var c = Math.cos(ANIMAL_TURN), si = Math.sin(ANIMAL_TURN);
    function solidAt(lx, lz, r) { solids.push({ x: ANIMAL_X + lx * c + lz * si, z: ANIMAL_Z - lx * si + lz * c, r: r }); }
    for (var x = -BW + 0.6; x <= BW - 0.59; x += 1.2) for (var z = -BD + 0.6; z <= BD - 1.1; z += 1.2) solidAt(x, z, 0.9);
    for (var x2 = -BW; x2 <= BW + 0.01; x2 += 0.5) if (Math.abs(x2) > 1.3) solidAt(x2, BD - 0.2, 0.4);   // the front wall, with a gap for the doorway
    solidAt(0, BD - 0.6, 0.35); solidAt(-0.9, BD - 0.45, 0.35); solidAt(0.9, BD - 0.45, 0.35);   // the doorway itself: walk up into it and in you go
    solidAt(-3.0, B_FZ + 0.8, 0.7); solidAt(2.7, B_FZ + 0.9, 0.5); solidAt(2.0, B_FZ + 0.6, 0.25); solidAt(BW + 1.0, 1.0, 0.75);
    solidAt(-2.55, B_FZ + 0.45, 0.32); solidAt(2.55, B_FZ + 0.45, 0.32); solidAt(ANIMAL_HW + 1.6, B_FZ + 2.2, 0.12); solidAt(BW + 0.3, -3.9, 0.35);   // barrels, the bird house, the wheel
  })();

  // ---------- The stone path to Whimsy & Bloom ----------
  // A paved garden walk: weathered flagstones fitted together with moss growing in the joints, laid between kerbs of
  // dressed stone, with lavender, flowers and little glowing mushrooms along both sides, and iron lanterns that light
  // the way at night
  var pathLanternGlows = [];
  var pathLampMat = new THREE.MeshStandardMaterial({ color: 0xfff0c8, emissive: 0xffc870, emissiveIntensity: 0.3, roughness: 0.3 });
  (function () {
    var dummy = new THREE.Object3D(), col = new THREE.Color();
    function H(k) { return isle2Hash(k * 1.37 + 812); }
    // the paving: crazy-paved flagstones worked out pixel by pixel, so the joints stay crisp; it tiles along the path
    var PW = 256, PH = 512, cells = [];
    for (var gy = 0; gy < 8; gy++) for (var gx = 0; gx < 4; gx++) cells.push([(gx + 0.15 + H(gx * 7 + gy * 13) * 0.7) * 64, (gy + 0.15 + H(gx * 11 + gy * 5 + 3) * 0.7) * 64, H(gx * 3 + gy * 17 + 9)]);
    var pave = new Uint8Array(PW * PH * 4), bump = new Uint8Array(PW * PH * 4);
    for (var py = 0; py < PH; py++) for (var px = 0; px < PW; px++) {
      var d1 = 1e9, d2 = 1e9, best = null;
      for (var c = 0; c < cells.length; c++) for (var wy = -1; wy <= 1; wy++) {   // wrap top to bottom so it tiles along the path
        var cx = cells[c][0], cy = cells[c][1] + wy * PH, dx = px - cx, dy = py - cy, dd = dx * dx + dy * dy;
        if (dd < d1) { d2 = d1; d1 = dd; best = cells[c]; } else if (dd < d2) d2 = dd;
      }
      var edge = Math.sqrt(d2) - Math.sqrt(d1), i = (py * PW + px) * 4;
      var grain = isle2Hash(px * 3.1 + py * 7.7) * 14 + Math.sin(px * 0.21 + best[2] * 9) * Math.cos(py * 0.17) * 6;
      var r, g, bl, h;
      if (edge < 3.2) {                                                // the joints: dark soil with moss growing in them
        var mossy = isle2Hash(Math.floor(px / 6) * 5.3 + Math.floor(py / 6) * 2.9) > 0.35;
        r = mossy ? 86 : 74; g = mossy ? 112 : 64; bl = mossy ? 58 : 50; h = 40;
        r += grain * 0.6; g += grain * 0.6; bl += grain * 0.3;
      } else {                                                         // a flagstone: warm grey-cream, each one a slightly different shade
        var shade = 168 + best[2] * 46, bevel = Math.min(1, (edge - 3.2) / 6);
        r = shade + 8 + grain; g = shade + grain; bl = shade - 14 + grain * 0.8;
        r *= 0.82 + bevel * 0.18; g *= 0.82 + bevel * 0.18; bl *= 0.82 + bevel * 0.18;   // edges worn down and a touch darker
        if (isle2Hash(px * 1.7 + py * 2.3) > 0.985) { r -= 40; g -= 36; bl -= 30; }       // little pits and flecks
        h = 150 + bevel * 100;
      }
      pave[i] = Math.max(0, Math.min(255, r)); pave[i + 1] = Math.max(0, Math.min(255, g)); pave[i + 2] = Math.max(0, Math.min(255, bl)); pave[i + 3] = 255;
      bump[i] = bump[i + 1] = bump[i + 2] = Math.max(0, Math.min(255, h + grain)); bump[i + 3] = 255;
    }
    function dataTex(arr) { var t = new THREE.DataTexture(arr, PW, PH, THREE.RGBAFormat); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); t.needsUpdate = true; return t; }
    var paveTex = dataTex(pave), paveBump = dataTex(bump);
    var iron = new THREE.MeshStandardMaterial({ color: 0x24222a, roughness: 0.45, metalness: 0.6 });
    var shroomCap = new THREE.MeshStandardMaterial({ color: 0xd9b8ff, emissive: 0x9a5cff, emissiveIntensity: 0.7, roughness: 0.6 }), shroomStem = new THREE.MeshStandardMaterial({ color: 0xf2ece0 });
    var paveMat = new THREE.MeshStandardMaterial({ map: paveTex, bumpMap: paveBump, bumpScale: 0.03, roughness: 0.88, side: THREE.DoubleSide });
    var paveMat2 = paveMat.clone(); paveMat2.polygonOffset = true; paveMat2.polygonOffsetFactor = -2; paveMat2.polygonOffsetUnits = -2;   // where the two paths meet, the branch lies neatly on top
    function layPath(spLine, other, otherBox, branch) {                 // spLine: this path; other: the path it mustn't plant flowers on
    var pos = [], uv = [], idx = [], run = 0, W = SP_W * 2;
    for (var k = 0; k < spLine.length; k++) {
      var a = spLine[Math.max(0, k - 1)], b = spLine[Math.min(spLine.length - 1, k + 1)];
      var tx = b[0] - a[0], tz = b[1] - a[1], tl = Math.sqrt(tx * tx + tz * tz) || 1, nx = -tz / tl, nz = tx / tl;
      if (k) run += Math.sqrt(Math.pow(spLine[k][0] - spLine[k - 1][0], 2) + Math.pow(spLine[k][1] - spLine[k - 1][1], 2));
      pos.push(spLine[k][0] - nx * SP_W, 0.02, spLine[k][1] - nz * SP_W, spLine[k][0] + nx * SP_W, 0.02, spLine[k][1] + nz * SP_W);
      uv.push(0, run / (W * 2), 1, run / (W * 2));
      if (k) { var q = k * 2; idx.push(q - 2, q, q - 1, q - 1, q, q + 1); }
    }
    var paveGeo = new THREE.BufferGeometry();
    paveGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    paveGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    paveGeo.setIndex(idx); paveGeo.computeVertexNormals();
    var paveMesh = new THREE.Mesh(paveGeo, branch ? paveMat2 : paveMat);
    paveMesh.receiveShadow = true; scene.add(paveMesh);
    // kerbs of dressed stone along both sides, and the plants, mushrooms and lanterns beyond them
    var kerbs = [], blooms = [], lav = [], leaves = [], shrooms = [], lamps = [];
    var gap = 0, row = 0, lampRun = 0, lampSide = 1, walked = 0, end = spLine[spLine.length - 1];
    for (var j = 1; j < spLine.length; j++) {
      var p0 = spLine[j - 1], p1 = spLine[j], sx = p1[0] - p0[0], sz = p1[1] - p0[1], sl = Math.sqrt(sx * sx + sz * sz);
      gap += sl; lampRun += sl; walked += sl;
      var ux = sx / sl, uz = sz / sl, nx2 = -uz, nz2 = ux, turn = Math.atan2(ux, uz);
      var nearShop = dist(p1[0], p1[1], end[0], end[1]) < 1.1, onOther = function (ex2) { return lineDist(other, otherBox, p1[0] + nx2 * ex2, p1[1] + nz2 * ex2) < SP_W + 0.35; };
      if (lampRun > 4.6 && walked > 2.4 && !nearShop && !onOther(lampSide * (SP_W + 0.55))) { lampRun = 0; lamps.push([p1[0] + nx2 * lampSide * (SP_W + 0.55), p1[1] + nz2 * lampSide * (SP_W + 0.55)]); lampSide = -lampSide; }
      if (gap < 0.46) continue;
      gap = 0; row++;
      for (var e = -1; e <= 1; e += 2) {
        if (!nearShop && !onOther(e * (SP_W + 0.07))) kerbs.push([p1[0] + nx2 * e * (SP_W + 0.07), p1[1] + nz2 * e * (SP_W + 0.07), turn, H(row * 19 + e)]);
        if (nearShop || walked < 1.9 || onOther(e * (SP_W + 0.42))) continue;   // keep the ends clear for the steps and the bridge, and the other path clear
        var gx2 = p1[0] + nx2 * e * (SP_W + 0.42), gz2 = p1[1] + nz2 * e * (SP_W + 0.42), kind = H(row * 29 + e);
        for (var lf = 0; lf < 6; lf++) leaves.push([gx2 + (H(row * 31 + lf + e) - 0.5) * 0.42, gz2 + (H(row * 37 + lf - e) - 0.5) * 0.42, 0.07 + H(row + lf) * 0.05, H(row * 41 + lf)]);
        if (kind < 0.45) for (var lv = 0; lv < 6; lv++) lav.push([gx2 + (H(row * 43 + lv + e) - 0.5) * 0.32, gz2 + (H(row * 47 + lv - e) - 0.5) * 0.32, 0.34 + H(row * 53 + lv) * 0.14, (H(row * 59 + lv) - 0.5) * 0.4]);
        else for (var bl2 = 0; bl2 < 5; bl2++) blooms.push([gx2 + (H(row * 61 + bl2 + e) - 0.5) * 0.42, gz2 + (H(row * 67 + bl2 - e) - 0.5) * 0.42, 0.13 + H(row * 71 + bl2) * 0.09, kind < 0.72 ? 0 : (bl2 % 2 ? 1 : 2)]);
        if (H(row * 73 + e) > 0.88) shrooms.push([gx2 + nx2 * e * 0.22, gz2 + nz2 * e * 0.22]);
      }
    }
    function batch(geo, mat, list, put) {
      var im = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach(function (q, i) { var cc = put(q); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); if (cc !== undefined) im.setColorAt(i, col.set(cc)); });
      dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1, 1);
      im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im);
      return im;
    }
    var kerbGeo = new THREE.BoxGeometry(0.12, 0.1, 0.42, 1, 1, 1);
    (function () { var kp = kerbGeo.attributes.position; for (var v = 0; v < kp.count; v++) if (kp.getY(v) > 0) { kp.setX(v, kp.getX(v) * 0.82); kp.setZ(v, kp.getZ(v) * 0.94); } kerbGeo.computeVertexNormals(); })();   // softly bevelled tops
    batch(kerbGeo, new THREE.MeshStandardMaterial({ map: paveTex, roughness: 0.85, color: 0xe8e2d8 }), kerbs, function (q) {
      dummy.position.set(q[0], 0.045, q[1]); dummy.rotation.set(0, q[2] + (q[3] - 0.5) * 0.06, (q[3] - 0.5) * 0.04);
      return new THREE.Color().setHSL(0.09, 0.08, 0.7 + q[3] * 0.14).getHex();
    });
    batch(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, flatShading: true }), leaves, function (q) {
      dummy.position.set(q[0], q[2] * 0.6, q[1]); dummy.rotation.set(q[3] * 3, q[3] * 6, 0); dummy.scale.set(q[2], q[2] * 0.7, q[2]);
      return new THREE.Color().setHSL(0.26 + q[3] * 0.06, 0.45, 0.28 + q[3] * 0.12).getHex();
    });
    batch(new THREE.CylinderGeometry(0.006, 0.008, 1, 4), new THREE.MeshStandardMaterial({ color: 0x5a7a48 }), lav, function (q) {
      dummy.position.set(q[0], q[2] / 2, q[1]); dummy.rotation.set(q[3], 0, -q[3] * 0.7); dummy.scale.set(1, q[2], 1);
    });
    batch(new THREE.CylinderGeometry(0.018, 0.012, 0.14, 6), new THREE.MeshStandardMaterial({ color: 0x9a78dc, roughness: 0.7 }), lav, function (q) {
      dummy.position.set(q[0] + Math.sin(-q[3] * 0.7) * -q[2] * 0.4, q[2] - 0.04, q[1] + Math.sin(q[3]) * q[2] * 0.4); dummy.rotation.set(q[3], 0, -q[3] * 0.7);
    });
    var petalCols = [0xf6a6c8, 0xfaf6ee, 0xffe08a];
    batch(new THREE.CylinderGeometry(0.055, 0.03, 0.02, 7), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), blooms, function (q) {
      dummy.position.set(q[0], q[2], q[1]); dummy.rotation.set((q[2] - 0.17) * 3, q[0] * 5, 0); return petalCols[q[3]];
    });
    batch(new THREE.SphereGeometry(0.018, 6, 4), new THREE.MeshStandardMaterial({ color: 0xe8b84a }), blooms, function (q) { dummy.position.set(q[0], q[2] + 0.012, q[1]); });
    batch(new THREE.CylinderGeometry(0.005, 0.006, 1, 4), new THREE.MeshStandardMaterial({ color: 0x4f7a3e }), blooms, function (q) { dummy.position.set(q[0], q[2] / 2, q[1]); dummy.scale.set(1, q[2], 1); });
    shrooms.forEach(function (m) {
      for (var t = 0; t < 3; t++) {
        var mx = m[0] + Math.cos(t * 2.1) * 0.08, mz = m[1] + Math.sin(t * 2.1) * 0.08, mh = 0.07 + t * 0.025;
        var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, mh, 6), shroomStem); stem.position.set(mx, mh / 2, mz); scene.add(stem);
        var cap = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), shroomCap); cap.position.set(mx, mh, mz); cap.scale.y = 0.7; scene.add(cap);
      }
    });
    // wrought-iron lantern posts that glow warm at night
    lamps.forEach(function (lp) {
      var g = new THREE.Group(); g.position.set(lp[0], 0, lp[1]); scene.add(g);
      function part(geo, mat, x, y, z) { var m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; }
      part(new THREE.CylinderGeometry(0.11, 0.14, 0.12, 8), iron, 0, 0.06, 0);
      part(new THREE.CylinderGeometry(0.025, 0.035, 1.5, 8), iron, 0, 0.84, 0);
      part(new THREE.TorusGeometry(0.04, 0.008, 6, 12), iron, 0, 0.5, 0).rotation.x = Math.PI / 2;
      part(new THREE.CylinderGeometry(0.1, 0.08, 0.03, 8), iron, 0, 1.6, 0);
      part(new THREE.CylinderGeometry(0.075, 0.06, 0.2, 6), pathLampMat, 0, 1.72, 0);
      [0, 1, 2, 3, 4, 5].forEach(function (s2) { var ba = s2 / 6 * Math.PI * 2; part(new THREE.BoxGeometry(0.008, 0.2, 0.008), iron, Math.cos(ba) * 0.075, 1.72, Math.sin(ba) * 0.075); });
      part(new THREE.ConeGeometry(0.12, 0.12, 6), iron, 0, 1.88, 0);
      part(new THREE.SphereGeometry(0.02, 8, 6), iron, 0, 1.96, 0);
      var glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc870, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      glowS.position.set(0, 1.72, 0); glowS.scale.set(1.4, 1.4, 1); g.add(glowS); pathLanternGlows.push(glowS);
      solids.push({ x: lp[0], z: lp[1], r: 0.18 });
    });
    }
    layPath(spLine, cpLine, cpBox, false);                              // to Whimsy & Bloom
    layPath(cpLine, spLine, spBox, true);                               // and to the clinic
    layPath(apLine, spLine, spBox, false);                              // and on the Western Isle, to the animal shop
  })();

  // You bump into the house, the tower and the cauldron
  function houseToWorld(lx, lz) {
    var c = Math.cos(HOUSE_TURN), s = Math.sin(HOUSE_TURN);
    return { x: HOUSE_X + lx * c + lz * s, z: HOUSE_Z - lx * s + lz * c };
  }
  var houseBumps = [[TX, TZ, TR + 0.2], [CX, CZ, 0.55], [BIN_X - 0.3, BIN_Z, 0.5], [BIN_X + 0.3, BIN_Z, 0.5], [-0.95, FRONT + 1.1, 0.12], [0.95, FRONT + 1.1, 0.12]];
  for (var hbx = -2.9; hbx <= 2.95; hbx += 1.45) { houseBumps.push([hbx, -0.85, 1.15], [hbx, 0.85, 1.15]); } // two rows of bumpers fill the house's footprint
  fencePosts.forEach(function (fp) { houseBumps.push([fp[0], fp[1], 0.24]); }); // and you can't walk through the fence
  houseBumps.forEach(function (c) {
    var w = houseToWorld(c[0], c[1]);
    solids.push({ x: w.x, z: w.z, r: c[2] });
  });

  function updateHouse(dt, t, night) {
    var glow = 0.35 + night * 0.9;
    houseMats.glass.emissiveIntensity = glow + Math.sin(t * 7) * 0.03 * night;       // the windows glow warmer at night, with a little flicker
    lanternMat.emissiveIntensity = 0.6 + night * 1.2 + Math.sin(t * 9) * 0.08;
    lanterns.forEach(function (lh, n) { lh.material.opacity = 0.2 + night * 0.55 + Math.sin(t * 9 + n) * 0.04; });
    houseLights.forEach(function (L) {                                                 // the string lights twinkle gently
      var tw = 0.75 + 0.25 * Math.sin(t * 2.2 + L.p);
      L.bulb.material.emissiveIntensity = (0.4 + night * 1.1) * tw;
      L.halo.material.opacity = (0.12 + night * 0.5) * tw;
    });
    brewGlow.material.opacity = 0.06 + night * 0.28 + Math.sin(t * 3) * 0.03;         // a faint glow by day, brighter at night
    brewMat.emissiveIntensity = 0.3 + night * 0.5;
    brew.rotation.z = -t * 0.25;                                                       // the potion slowly swirls
    fireGlow.material.opacity = 0.45 + Math.sin(t * 13) * 0.1 + Math.sin(t * 7.3) * 0.08;
    cauldronFlames.forEach(function (f) {                                              // the flames flicker and dance
      var k = 0.8 + Math.sin(t * 11 + f.p) * 0.18 + Math.sin(t * 17.3 + f.p * 2) * 0.1;
      f.g.scale.set(1, k, 1);
      f.g.rotation.z = Math.sin(t * 6 + f.p) * 0.12;
    });
    bubbles.forEach(function (b) {                                                     // bubbles rise, swell and pop
      b.t += dt * 0.7;
      if (b.t > 1) { b.t -= 1; b.x = (Math.random() - 0.5) * 0.5; b.z = (Math.random() - 0.5) * 0.5; }
      b.m.position.set(CX + b.x, 0.8 + b.t * 0.08, CZ + b.z);
      b.m.scale.setScalar(0.3 + b.t * 0.9);
      b.m.visible = b.t < 0.92;
    });
    brewSteam.forEach(function (w) {                                                   // steam drifts up, grows and fades
      w.t += dt * 0.22;
      if (w.t > 1) w.t -= 1;
      var k = w.t;
      w.s.position.set(CX + Math.sin(k * 4 + w.a) * 0.14, 0.95 + k * 1.2, CZ + Math.cos(k * 3 + w.a) * 0.14);
      w.s.scale.setScalar(0.3 + k * 0.75);
      w.s.material.rotation = w.a + k * w.spin;                       // each wisp slowly turns as it rises
      w.s.material.opacity = Math.min(1, k * 6) * Math.pow(1 - k, 1.4) * 0.6;
    });
    smoke.forEach(function (p) {                                                       // puffs drift up, grow and fade
      p.t += dt * 0.12;
      if (p.t > 1) p.t -= 1;
      var k = p.t;
      p.s.position.set(CHIM_TOP.x + Math.sin(k * 4 + p.rot) * 0.18 + k * k * 1.1, CHIM_TOP.y + 0.1 + k * 2.4, CHIM_TOP.z + Math.cos(k * 3 + p.rot) * 0.12);   // rises, then drifts off on the breeze
      p.s.scale.setScalar(0.35 + k * 1.1);
      p.s.material.rotation = p.rot + k * p.spin;                     // each puff slowly turns as it rises
      p.s.material.opacity = Math.min(1, k * 8) * Math.pow(1 - k, 1.5) * 0.85;
    });
  }

  // ---------- Inside the farmhouse ----------
  // A cosy room of its own, drawn instead of the island while you're inside, so you can't see out.
  // It sits far away from the island (at IN_X, IN_Z) so nothing outside can be reached from in here.
  var interiorScene = new THREE.Scene();
  interiorScene.background = new THREE.Color(0x1c1228);
  var ROOM_W = 9, ROOM_D = 7, ROOM_H = 3.4;
  var indoors = false;
  var room = new THREE.Group();
  room.position.set(IN_X, 0, IN_Z);
  interiorScene.add(room);
  interiorScene.add(new THREE.HemisphereLight(0xffe6cc, 0x4a3050, 0.75));
  var roomLamp = new THREE.PointLight(0xffd6f0, 0.55, 16);           // a soft glow over the whole room
  roomLamp.position.set(IN_X + 0.5, 3.2, IN_Z + 0.5);
  interiorScene.add(roomLamp);
  var fireLight = new THREE.PointLight(0xff9a4a, 1.6, 9, 1.6);       // the fireplace, flickering warm light across the room
  interiorScene.add(fireLight);

  var floorTex = paintTexture(512, 512, function (g, w, h) {          // grey hardwood: long planks in soft driftwood greys, with grain, knots and staggered joints
    var ROWS = 8, rowH = h / ROWS;
    var greys = [[156, 152, 150], [138, 135, 136], [170, 166, 162], [124, 122, 126], [148, 146, 150], [162, 157, 152], [132, 129, 128], [144, 141, 144]];
    for (var r = 0; r < ROWS; r++) {
      var y0 = r * rowH, x = -((r * 173) % 256);                      // each row's joints fall in a different place
      while (x < w) {
        var len = 180 + ((r * 7 + Math.floor(x)) % 5) * 40, c = greys[(r * 3 + Math.floor((x + 512) / 97)) % greys.length];
        var tint = (Math.random() - 0.5) * 14;
        var grd = g.createLinearGradient(x, y0, x + len, y0);          // each plank a touch lighter at one end
        grd.addColorStop(0, 'rgb(' + Math.round(c[0] + tint) + ',' + Math.round(c[1] + tint) + ',' + Math.round(c[2] + tint) + ')');
        grd.addColorStop(1, 'rgb(' + Math.round(c[0] + tint - 10) + ',' + Math.round(c[1] + tint - 10) + ',' + Math.round(c[2] + tint - 8) + ')');
        g.fillStyle = grd; g.fillRect(x, y0, len, rowH);
        for (var gl = 0; gl < 9; gl++) {                               // the wood grain: long wavy lines
          var gy = y0 + 4 + Math.random() * (rowH - 8), amp = 1 + Math.random() * 2.5, ph = Math.random() * 6;
          g.strokeStyle = Math.random() < 0.6 ? 'rgba(70,66,72,0.22)' : 'rgba(235,232,228,0.18)';
          g.lineWidth = 0.6 + Math.random() * 0.9;
          g.beginPath();
          for (var gx = 0; gx <= len; gx += 8) g.lineTo(x + gx, gy + Math.sin(gx / 40 + ph) * amp);
          g.stroke();
        }
        if (Math.random() < 0.35) {                                    // now and then a little knot
          var kx = x + 30 + Math.random() * (len - 60), ky = y0 + rowH * (0.3 + Math.random() * 0.4);
          g.fillStyle = 'rgba(80,74,78,0.45)'; g.beginPath(); g.ellipse(kx, ky, 7, 3.5, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = 'rgba(80,74,78,0.3)'; g.lineWidth = 1; g.beginPath(); g.ellipse(kx, ky, 12, 6, 0, 0, Math.PI * 2); g.stroke();
        }
        g.fillStyle = 'rgba(45,42,48,0.65)'; g.fillRect(x, y0, 2, rowH); // the joint at the end of the plank
        x += len;
      }
      g.fillStyle = 'rgba(40,38,44,0.7)'; g.fillRect(0, y0, w, 2);      // the gap between rows
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, y0 + 2, w, 1); // and a soft bevel highlight
    }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(2, 2);
  var quiltTex = paintTexture(64, 64, function (g, w, h) {            // a patchwork quilt
    var cols = ['#7a58b0', '#b07ad0', '#5b3f8c', '#e49ccf'];
    for (var x = 0; x < 4; x++) for (var y = 0; y < 4; y++) { g.fillStyle = cols[(x + y * 3) % 4]; g.fillRect(x * 16, y * 16, 16, 16); }
    g.strokeStyle = 'rgba(255,240,200,0.6)'; g.setLineDash([2, 2]);
    for (var i = 1; i < 4; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, h); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); }
  });
  var rugTex = paintTexture(1024, 704, function (g, w, h) {           // a celestial rug, edge to edge: deep indigo starry sky, a big crescent moon ringed by the moon's phases
    var GOLD = '#e3b553', CREAM = '#f6ecd8', ROSE = '#d996b4', INK = '#221a3e', SHADE = '#2f2552';
    var cx = w / 2, cy = h / 2;
    var field = g.createRadialGradient(cx, cy, 30, cx, cy, w * 0.62);    // midnight indigo, a little lighter in the middle
    field.addColorStop(0, '#3d3170'); field.addColorStop(1, '#251d47');
    g.fillStyle = field; g.fillRect(0, 0, w, h);
    for (var wy = 0; wy < h; wy += 3) { g.fillStyle = wy % 6 ? 'rgba(230,220,255,0.03)' : 'rgba(0,0,20,0.06)'; g.fillRect(0, wy, w, 1); } // woven rows
    for (var n = 0; n < 4000; n++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(230,220,255,0.05)' : 'rgba(0,0,15,0.07)'; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 3, 1); }
    function star(x, y, r, col, pts) { g.fillStyle = col; g.beginPath(); for (var p = 0; p < pts * 2; p++) { var rr = p % 2 ? r * 0.4 : r, aa = p / (pts * 2) * Math.PI * 2 - Math.PI / 2; g.lineTo(x + Math.cos(aa) * rr, y + Math.sin(aa) * rr); } g.closePath(); g.fill(); }
    // little constellations in the four corners: gold stars joined by fine lines
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (c) {
      var bx = cx - c[0] * (cx - 95), by = cy - c[1] * (cy - 95);
      var pts = [[0, 0], [38, 18], [70, 6], [58, -34], [96, -48]].map(function (q) { return [bx + q[0] * c[0], by + q[1] * c[1]]; });
      g.strokeStyle = 'rgba(246,236,216,0.45)'; g.lineWidth = 1.5;
      g.beginPath(); pts.forEach(function (q, i) { if (i) g.lineTo(q[0], q[1]); else g.moveTo(q[0], q[1]); }); g.stroke();
      pts.forEach(function (q, i) { star(q[0], q[1], i === 2 ? 9 : 6, i % 2 ? CREAM : GOLD, 4); });
    });
    for (var s2 = 0; s2 < 90; s2++) {                                   // a scatter of tiny stars, kept clear of the middle
      var sx = 25 + Math.random() * (w - 50), sy = 25 + Math.random() * (h - 50);
      if (Math.hypot((sx - cx) / 1.55, sy - cy) < 215) continue;
      star(sx, sy, 2 + Math.random() * 3, Math.random() < 0.5 ? 'rgba(246,236,216,0.8)' : GOLD, 4);
    }
    // the middle: a ring of the moon's phases going round, with a big golden crescent cradling a star inside
    g.strokeStyle = 'rgba(227,181,83,0.6)'; g.lineWidth = 2; g.setLineDash([2, 8]);
    g.beginPath(); g.ellipse(cx, cy, 300, 196, 0, 0, Math.PI * 2); g.stroke();
    g.setLineDash([]);
    g.strokeStyle = GOLD; g.lineWidth = 3;
    g.beginPath(); g.ellipse(cx, cy, 150, 150 * 0.98, 0, 0, Math.PI * 2); g.stroke();
    var PH = 8;
    for (var k = 0; k < PH; k++) {                                     // eight phases round the ring: new, crescent, half, gibbous, full and back
      var a = k / PH * Math.PI * 2 - Math.PI / 2, mx = cx + Math.cos(a) * 240, my = cy + Math.sin(a) * 160, mr = 28;
      g.fillStyle = 'rgba(246,236,216,0.12)'; g.beginPath(); g.arc(mx, my, mr * 1.5, 0, Math.PI * 2); g.fill();
      g.fillStyle = SHADE; g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.fill();
      var lit = k / PH, wax = lit <= 0.5, f = Math.cos(lit * Math.PI * 2);    // how much of the face is lit, and from which side
      g.save(); g.beginPath(); g.arc(mx, my, mr, 0, Math.PI * 2); g.clip();
      g.fillStyle = CREAM;
      g.beginPath();
      g.arc(mx, my, mr, -Math.PI / 2, Math.PI / 2, !wax);             // the lit half
      g.ellipse(mx, my, Math.abs(f) * mr, mr, 0, Math.PI / 2, -Math.PI / 2, (f > 0) === wax);
      g.fill();
      g.restore();
      g.strokeStyle = GOLD; g.lineWidth = 2.5; g.beginPath(); g.arc(mx, my, mr + 2, 0, Math.PI * 2); g.stroke();
    }
    var halo = g.createRadialGradient(cx, cy, 20, cx, cy, 140);
    halo.addColorStop(0, 'rgba(255,230,170,0.35)'); halo.addColorStop(1, 'rgba(255,230,170,0)');
    g.fillStyle = halo; g.beginPath(); g.arc(cx, cy, 140, 0, Math.PI * 2); g.fill();
    var moonG = g.createLinearGradient(cx - 100, cy - 100, cx + 60, cy + 100);
    moonG.addColorStop(0, '#f7d98a'); moonG.addColorStop(1, '#d49a34');
    g.fillStyle = moonG; g.beginPath(); g.arc(cx - 10, cy, 100, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#342a62'; g.beginPath(); g.arc(cx + 34, cy - 22, 88, 0, Math.PI * 2); g.fill(); // cut the crescent out
    star(cx + 28, cy - 10, 30, CREAM, 5); star(cx + 28, cy - 10, 12, GOLD, 5);
    star(cx + 78, cy + 52, 10, GOLD, 4); star(cx + 60, cy - 78, 7, CREAM, 4);
  });
  function rMat(color, extra) {
    var o = { color: color, roughness: 0.8 };
    for (var k in extra) o[k] = extra[k];
    return new THREE.MeshStandardMaterial(o);
  }
  var R = {
    floor: rMat(0xffffff, { map: floorTex, roughness: 0.5, metalness: 0.05 }), wall: rMat(0xf2e6d8, { roughness: 0.95 }),
    wood: rMat(0x7a4e32), darkWood: rMat(0x4a3226), stone: rMat(0xffffff, { map: stoneWallTex, roughness: 0.95 }), soot: rMat(0x1a1214),
    cream: rMat(0xf3e6d0), quilt: rMat(0xffffff, { map: quiltTex }), pillow: rMat(0xfff4fa), rug: rMat(0xffffff, { map: rugTex, roughness: 1 }),
    gold: rMat(0xffd36e, { emissive: 0xb07a10, emissiveIntensity: 0.3, metalness: 0.6, roughness: 0.35 }), clay: rMat(0xc8714a),
    leaf: rMat(0x5aa84a),
    curtain: rMat(0xd96aa8), pane: rMat(0x9fb4ff, { emissive: 0x6a7ad8, emissiveIntensity: 0.6 }), door: rMat(0xffffff, { map: plankTex, roughness: 0.7 }),
    candle: rMat(0xfff0d8), iron: rMat(0x24222c, { metalness: 0.5, roughness: 0.45 })
  };
  function iPart(geo, mat, x, y, z, rx, ry, rz, parent) { // one piece of the room (x, z from the middle of the floor)
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || room).add(m);
    return m;
  }
  var inSolids = [];                                                  // furniture you bump into (room positions)
  var NW = -ROOM_D / 2;                                               // the back (north) wall

  // the floor
  iPart(new THREE.PlaneGeometry(ROOM_W, ROOM_D), R.floor, 0, 0, 0, -Math.PI / 2);

  // the walls: plain and soft cream. Each wall is its own group (its local +z points into the room);
  // a wall the camera is behind hides completely, windows and all, so it never blocks the view
  var inWalls = {};
  function makeWall(name, x, z, ry, len) {
    var wgp = new THREE.Group();
    wgp.position.set(x, 0, z); wgp.rotation.y = ry;
    room.add(wgp);
    inWalls[name] = { g: wgp, c: new THREE.Vector3(x, 0, z), n: new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)) };
    iPart(new THREE.PlaneGeometry(len, ROOM_H), R.wall, 0, ROOM_H / 2, 0, 0, 0, 0, wgp);
    return wgp;
  }
  makeWall('N', 0, NW, 0, ROOM_W);
  makeWall('S', 0, -NW, Math.PI, ROOM_W);
  makeWall('W', -ROOM_W / 2, 0, Math.PI / 2, ROOM_D);
  makeWall('E', ROOM_W / 2, 0, -Math.PI / 2, ROOM_D);
  function wallPart(name, geo, mat, x, y, z, rx, ry, rz) { return iPart(geo, mat, x, y, z, rx, ry, rz, inWalls[name].g); }

  // the fireplace on the back wall: a fieldstone surround with an arched opening, a glowing brick firebox,
  // a crackling log fire on iron fire-dogs, a thick wooden mantel on carved brackets, and a chimney breast up to the ceiling
  var FPX = -1.6, FP_D = 0.75, OPEN_W = 1.4, OPEN_H = 0.9;           // its middle, how far it sticks out, and the size of the opening
  var FZ0 = NW, FZF = NW + FP_D;                                      // the back wall and the front face
  [-1, 1].forEach(function (sd) {                                      // the stone piers either side of the opening
    iPart(new THREE.BoxGeometry(0.6, 1.6, FP_D), R.stone, FPX + sd * (OPEN_W / 2 + 0.3), 0.8, FZ0 + FP_D / 2);
  });
  var archShape = new THREE.Shape();                                   // the stonework over the opening, with an arched underside
  archShape.moveTo(-OPEN_W / 2, OPEN_H); archShape.lineTo(-OPEN_W / 2, 1.6); archShape.lineTo(OPEN_W / 2, 1.6); archShape.lineTo(OPEN_W / 2, OPEN_H);
  archShape.bezierCurveTo(OPEN_W / 2, OPEN_H + 0.3, OPEN_W / 4, OPEN_H + 0.38, 0, OPEN_H + 0.38);
  archShape.bezierCurveTo(-OPEN_W / 4, OPEN_H + 0.38, -OPEN_W / 2, OPEN_H + 0.3, -OPEN_W / 2, OPEN_H);
  var archGeo = new THREE.ExtrudeGeometry(archShape, { depth: FP_D, bevelEnabled: false, curveSegments: 12 });
  var auv = archGeo.attributes.uv;
  for (var au = 0; au < auv.count; au++) auv.setXY(au, auv.getX(au) * 0.6, auv.getY(au) * 0.6);
  iPart(archGeo, R.stone, FPX, 0, FZ0);
  // a carved keystone over the arch: a wedge of pale stone
  var key = new THREE.Shape();
  key.moveTo(-0.13, 0); key.lineTo(0.13, 0); key.lineTo(0.18, 0.36); key.lineTo(-0.18, 0.36); key.lineTo(-0.13, 0);
  iPart(new THREE.ExtrudeGeometry(key, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 }), rMat(0xd8d0de, { roughness: 0.85 }), FPX, OPEN_H + 0.22, FZF);
  var brickTex = paintTexture(128, 128, function (g, w, h) {           // sooty bricks inside, glowing hot near the bottom
    g.fillStyle = '#1c0f0c'; g.fillRect(0, 0, w, h);
    for (var r = 0; r < 8; r++) for (var c = -1; c < 5; c++) {
      var bx = c * 32 + (r % 2) * 16, by = r * 16, heat = Math.max(0, (r - 3) / 4);
      g.fillStyle = 'rgb(' + Math.round(60 + heat * 150) + ',' + Math.round(26 + heat * 60) + ',' + Math.round(20 + heat * 10) + ')';
      g.fillRect(bx + 1.5, by + 1.5, 29, 13);
    }
  });
  var brickMat = rMat(0xffffff, { map: brickTex, emissive: 0xff5a1a, emissiveMap: brickTex, emissiveIntensity: 0.6, roughness: 1 });
  iPart(new THREE.PlaneGeometry(OPEN_W, OPEN_H + 0.38), brickMat, FPX, (OPEN_H + 0.38) / 2, FZ0 + 0.06);                 // the back of the firebox
  [-1, 1].forEach(function (sd) { iPart(new THREE.PlaneGeometry(FP_D - 0.06, OPEN_H + 0.38), brickMat, FPX + sd * (OPEN_W / 2 - 0.015), (OPEN_H + 0.38) / 2, FZ0 + 0.06 + (FP_D - 0.06) / 2, 0, -sd * Math.PI / 2, 0); }); // the side walls, just inside the stone so they don't flicker
  iPart(new THREE.PlaneGeometry(OPEN_W, FP_D), R.soot, FPX, 0.13, FZ0 + FP_D / 2, -Math.PI / 2);                         // the sooty floor of the firebox
  iPart(new THREE.BoxGeometry(OPEN_W + 1.6, 0.13, 0.75), R.stone, FPX, 0.065, FZF + 0.3);                               // the raised stone hearth
  iPart(new THREE.BoxGeometry(OPEN_W + 1.66, 0.04, 0.8), rMat(0x8c8494, { roughness: 0.7 }), FPX, 0.135, FZF + 0.3);    // with a smooth slab on top
  // the mantel: a thick dark beam on two carved brackets
  iPart(new THREE.BoxGeometry(OPEN_W + 1.7, 0.18, 0.5), R.darkWood, FPX, 1.7, FZ0 + 0.55);
  iPart(new THREE.BoxGeometry(OPEN_W + 1.6, 0.05, 0.08), R.wood, FPX, 1.6, FZ0 + 0.79);
  var corbel = new THREE.Shape();
  corbel.moveTo(0, 0); corbel.lineTo(0.22, 0); corbel.quadraticCurveTo(0.22, -0.12, 0.1, -0.16); corbel.quadraticCurveTo(0.02, -0.22, 0, -0.32); corbel.lineTo(0, 0);
  [-1, 1].forEach(function (sd) {
    var cb = iPart(new THREE.ExtrudeGeometry(corbel, { depth: 0.12, bevelEnabled: false }), R.darkWood, FPX + sd * (OPEN_W / 2 + 0.55) - 0.06, 1.61, FZF, 0, -Math.PI / 2, 0);
  });
  // the chimney breast, stone all the way up
  iPart(new THREE.BoxGeometry(OPEN_W + 0.9, ROOM_H - 1.79, 0.55), R.stone, FPX, (ROOM_H + 1.79) / 2, FZ0 + 0.275);
  // the fire: iron fire-dogs, three logs, glowing embers, dancing flames and rising sparks
  var FIRE_Z = FZ0 + 0.38;
  [-1, 1].forEach(function (sd) {
    iPart(new THREE.BoxGeometry(0.05, 0.05, 0.5), R.iron, FPX + sd * 0.38, 0.2, FIRE_Z);
    iPart(new THREE.BoxGeometry(0.05, 0.3, 0.05), R.iron, FPX + sd * 0.38, 0.3, FIRE_Z + 0.25);
    iPart(new THREE.SphereGeometry(0.045, 10, 8), R.gold, FPX + sd * 0.38, 0.47, FIRE_Z + 0.25);
  });
  var logBark = rMat(0xffffff, { map: barkTex, roughness: 0.95 }), logEnd = rMat(0xc9a27a, { roughness: 0.9 });
  [[0, 0.27, -0.06, 0.15, 0.09], [-0.05, 0.4, 0.06, -0.3, 0.075], [0.08, 0.37, 0.02, 0.45, 0.07]].forEach(function (lg) {
    var lgm = iPart(new THREE.CylinderGeometry(lg[4], lg[4], 0.95, 10), [logBark, logEnd, logEnd], FPX + lg[0], lg[1], FIRE_Z + lg[2], 0, lg[3], Math.PI / 2);
  });
  var emberMat = rMat(0xff6a20, { emissive: 0xff5010, emissiveIntensity: 1.4 });
  for (var em = 0; em < 14; em++) iPart(new THREE.SphereGeometry(0.03 + Math.random() * 0.025, 6, 5), emberMat, FPX + (Math.random() - 0.5) * 0.8, 0.16, FIRE_Z + (Math.random() - 0.5) * 0.35);
  var emberGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xff6a20, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  emberGlow.position.set(FPX, 0.25, FIRE_Z + 0.1); emberGlow.scale.set(1.3, 0.5, 1); room.add(emberGlow);
  var hearthGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xff9a4a, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  hearthGlow.position.set(FPX, 0.6, FZF + 0.5); hearthGlow.scale.set(2.6, 1.4, 1); room.add(hearthGlow);
  fireLight.position.set(IN_X + FPX, 0.7, IN_Z + FZF + 0.4);
  var flameGeo = new THREE.LatheGeometry([[0, 0], [0.09, 0.06], [0.11, 0.16], [0.08, 0.3], [0.04, 0.42], [0, 0.5]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 10);
  var flameMats = [0xff5a10, 0xff8a20, 0xffc040, 0xfff0a0].map(function (c) { return new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false }); });
  var flames = [];
  [[0, 1.2, 0], [-0.22, 0.95, 0], [0.22, 1.0, 1], [-0.1, 0.8, 2], [0.12, 0.75, 2], [0, 0.55, 3], [-0.3, 0.6, 1], [0.32, 0.55, 1]].forEach(function (f, n) {
    var fm = iPart(flameGeo, flameMats[f[2]], FPX + f[0], 0.3, FIRE_Z + (n % 3 - 1) * 0.06);
    flames.push({ m: fm, base: f[1], p: n * 1.7, x: f[0] });
  });
  [[0, 0.65, 0.9, 0xffb040], [0, 0.5, 0.5, 0xfff0a0]].forEach(function (gl) {                     // soft glows round the flames
    var gs = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: gl[3], transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    gs.position.set(FPX + gl[0], gl[1], FIRE_Z + 0.15); gs.scale.set(gl[2], gl[2] * 1.3, 1); room.add(gs);
  });
  var fireSparks = [];
  for (var sk = 0; sk < 14; sk++) {
    var spk = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc060, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    spk.scale.set(0.05, 0.05, 1); room.add(spk);
    fireSparks.push({ s: spk, t: Math.random(), x: (Math.random() - 0.5) * 0.6, sp: 0.5 + Math.random() * 0.6 });
  }
  // a set of fire tools on the right and a basket of logs on the left
  var TLX = FPX + OPEN_W / 2 + 0.95, TLZ = FZF + 0.25;
  iPart(new THREE.CylinderGeometry(0.13, 0.15, 0.04, 12), R.iron, TLX, 0.02, TLZ);
  iPart(new THREE.CylinderGeometry(0.018, 0.018, 0.85, 6), R.iron, TLX, 0.45, TLZ);
  iPart(new THREE.SphereGeometry(0.04, 8, 6), R.gold, TLX, 0.9, TLZ);
  iPart(new THREE.BoxGeometry(0.22, 0.02, 0.02), R.iron, TLX, 0.8, TLZ);
  [[-0.1, 'poker'], [0.1, 'shovel']].forEach(function (tl) {
    iPart(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 5), R.iron, TLX + tl[0], 0.43, TLZ + 0.02);
    if (tl[1] === 'shovel') iPart(new THREE.BoxGeometry(0.1, 0.12, 0.015), R.iron, TLX + tl[0], 0.08, TLZ + 0.02);
    else iPart(new THREE.ConeGeometry(0.02, 0.1, 5), R.iron, TLX + tl[0], 0.06, TLZ + 0.02, Math.PI, 0, 0);
  });
  var BKX = FPX - OPEN_W / 2 - 1.0, BKZ = FZF + 0.15;
  iPart(new THREE.CylinderGeometry(0.32, 0.27, 0.36, 16, 1, true), rMat(0xb08a52, { roughness: 1, side: THREE.DoubleSide }), BKX, 0.18, BKZ);
  iPart(new THREE.TorusGeometry(0.32, 0.025, 6, 20), rMat(0x8a6a3a), BKX, 0.36, BKZ, Math.PI / 2, 0, 0);
  [[-0.12, 0.38, 0.2], [0.1, 0.4, -0.3], [0, 0.48, 0.6], [0.05, 0.33, 1.2]].forEach(function (bl) {
    iPart(new THREE.CylinderGeometry(0.06, 0.06, 0.62, 8), [logBark, logEnd, logEnd], BKX + bl[0], bl[1], BKZ, 0, bl[2], Math.PI / 2 - 0.25);
  });
  // candles, potions and a glowing crystal ball along the mantel
  var candleGlows = [];
  function candle(x, y, z, hgt) {
    iPart(new THREE.CylinderGeometry(0.05, 0.05, hgt, 8), R.candle, x, y + hgt / 2, z);
    var cg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc060, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
    cg.position.set(x, y + hgt + 0.06, z);
    cg.scale.set(0.22, 0.3, 1);
    room.add(cg);
    candleGlows.push(cg);
  }
  function potion(x, y, z, color, size) { // a round glowing bottle with a cork
    var pm = rMat(color, { emissive: color, emissiveIntensity: 0.55, roughness: 0.15, transparent: true, opacity: 0.85 });
    iPart(new THREE.SphereGeometry(0.11 * size, 12, 10), pm, x, y + 0.11 * size, z);
    iPart(new THREE.CylinderGeometry(0.035 * size, 0.04 * size, 0.1 * size, 8), pm, x, y + 0.25 * size, z);
    iPart(new THREE.CylinderGeometry(0.04 * size, 0.035 * size, 0.05 * size, 8), R.wood, x, y + 0.32 * size, z);
  }
  var MT = 1.79;                                                      // the top of the mantel
  candle(FPX - 1.3, MT, FZ0 + 0.55, 0.32); candle(FPX - 1.12, MT, FZ0 + 0.6, 0.2); candle(FPX + 1.3, MT, FZ0 + 0.55, 0.26);
  potion(FPX - 0.65, MT, FZ0 + 0.55, 0x7dff9a, 1); potion(FPX + 0.75, MT, FZ0 + 0.55, 0xff8fd0, 1.15);
  iPart(new THREE.CylinderGeometry(0.06, 0.09, 0.08, 10), R.gold, FPX + 0.35, MT + 0.04, FZ0 + 0.55);
  var crystal = iPart(new THREE.SphereGeometry(0.11, 16, 12), rMat(0xd8c4ff, { emissive: 0x9a6aff, emissiveIntensity: 0.7, roughness: 0.05, transparent: true, opacity: 0.85 }), FPX + 0.35, MT + 0.19, FZ0 + 0.55);
  inSolids.push([FPX, FZ0 + 0.55, 1.3], [FPX - 1.1, FZF + 0.3, 0.45], [FPX + 1.1, FZF + 0.3, 0.45], [BKX, BKZ, 0.35], [TLX, TLZ, 0.18]);

  // a black four-poster bed in the corner: turned posts with gold finials, a tufted plum velvet headboard
  // with a gold moon, a starry quilted duvet draped over the sides, plump pillows, a throw and sheer drapes
  var BED_W = 1.9, BED_L = 2.5, BX = ROOM_W / 2 - 1.15, HZ = NW + 0.16, FZ = HZ + BED_L + 0.16, MZ = HZ + 0.08 + BED_L / 2;
  var bedWood = rMat(0x15121a, { roughness: 0.4, metalness: 0.15 }), velvet = rMat(0x5a3a78, { roughness: 0.95 });
  var duvetTex = paintTexture(256, 256, function (g, w, h) {        // a midnight quilt stitched in diamonds, a gold star in each
    g.fillStyle = '#2f2758'; g.fillRect(0, 0, w, h);
    var shade = g.createLinearGradient(0, 0, w, h); shade.addColorStop(0, 'rgba(255,255,255,0.05)'); shade.addColorStop(1, 'rgba(0,0,0,0.08)');
    g.fillStyle = shade; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(227,181,83,0.55)'; g.lineWidth = 2; g.setLineDash([5, 4]);
    for (var d = -w; d < w * 2; d += 64) {                            // the diamond stitching
      g.beginPath(); g.moveTo(d, 0); g.lineTo(d + h, h); g.stroke();
      g.beginPath(); g.moveTo(d, h); g.lineTo(d + h, 0); g.stroke();
    }
    g.setLineDash([]);
    for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) {         // a star or a little moon in the middle of each diamond
      var sx = x * 64 + 32, sy = y * 64, alt = (x + y) % 2;
      g.fillStyle = alt ? '#e3b553' : '#f6ecd8';
      if (alt) { g.beginPath(); for (var p = 0; p < 10; p++) { var r = p % 2 ? 3.5 : 9, a = p / 10 * Math.PI * 2 - Math.PI / 2; g.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } g.fill(); }
      else { g.beginPath(); g.arc(sx, sy, 7, 0, Math.PI * 2); g.fill(); g.fillStyle = '#2f2758'; g.beginPath(); g.arc(sx + 3, sy - 2, 6, 0, Math.PI * 2); g.fill(); }
    }
  });
  duvetTex.wrapS = duvetTex.wrapT = THREE.RepeatWrapping;
  var duvetMat = rMat(0xffffff, { map: duvetTex, roughness: 0.9, side: THREE.DoubleSide });
  function softSlab(w, d, h, r, mat, x, y, z) {                        // a box with soft rounded edges (cushions, mattress, pillows)
    var sh = new THREE.Shape(), hw = w / 2 - r, hd = d / 2 - r;
    sh.moveTo(-hw, -d / 2); sh.lineTo(hw, -d / 2); sh.quadraticCurveTo(w / 2, -d / 2, w / 2, -hd);
    sh.lineTo(w / 2, hd); sh.quadraticCurveTo(w / 2, d / 2, hw, d / 2); sh.lineTo(-hw, d / 2);
    sh.quadraticCurveTo(-w / 2, d / 2, -w / 2, hd); sh.lineTo(-w / 2, -hd); sh.quadraticCurveTo(-w / 2, -d / 2, -hw, -d / 2);
    var geo = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.001, h - r * 2), bevelEnabled: true, bevelThickness: r, bevelSize: r * 0.6, bevelSegments: 3, curveSegments: 6 });
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, r, 0);
    return iPart(geo, mat, x, y, z);
  }
  // the frame: side rails, a footboard and four turned posts
  [-1, 1].forEach(function (sd) { iPart(new THREE.BoxGeometry(0.09, 0.22, BED_L + 0.1), bedWood, BX + sd * (BED_W / 2 + 0.02), 0.36, MZ); });
  var postPts = [[0.075, 0], [0.075, 0.12], [0.095, 0.16], [0.06, 0.22], [0.05, 0.5], [0.075, 0.56], [0.05, 0.62], [0.042, 1.3], [0.065, 1.36], [0.042, 1.42], [0.04, 2.3], [0.06, 2.36], [0.045, 2.42], [0.001, 2.42]];
  var postGeo = new THREE.LatheGeometry(postPts.map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 12);
  [[-1, HZ], [1, HZ], [-1, FZ], [1, FZ]].forEach(function (pc) {
    iPart(postGeo, bedWood, BX + pc[0] * (BED_W / 2 + 0.04), 0, pc[1]);
    iPart(new THREE.SphereGeometry(0.07, 12, 10), R.gold, BX + pc[0] * (BED_W / 2 + 0.04), 2.48, pc[1]);   // gold finials
  });
  [HZ, FZ].forEach(function (z) { iPart(new THREE.BoxGeometry(BED_W + 0.1, 0.06, 0.06), bedWood, BX, 2.36, z); });   // the canopy frame
  [-1, 1].forEach(function (sd) { iPart(new THREE.BoxGeometry(0.06, 0.06, FZ - HZ), bedWood, BX + sd * (BED_W / 2 + 0.04), 2.36, (HZ + FZ) / 2); });
  var foot = new THREE.Shape();                                        // a footboard with a gently curved top
  foot.moveTo(-BED_W / 2, 0); foot.lineTo(BED_W / 2, 0); foot.lineTo(BED_W / 2, 0.5); foot.quadraticCurveTo(0, 0.68, -BED_W / 2, 0.5); foot.lineTo(-BED_W / 2, 0);
  iPart(new THREE.ExtrudeGeometry(foot, { depth: 0.06, bevelEnabled: false }), bedWood, BX, 0.28, FZ - 0.03);
  // the headboard: a black arched frame with a tufted plum velvet panel and gold buttons
  function arch(w, hgt, top) { var s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, hgt); s.bezierCurveTo(w / 2, hgt + top * 0.8, w * 0.2, hgt + top, 0, hgt + top); s.bezierCurveTo(-w * 0.2, hgt + top, -w / 2, hgt + top * 0.8, -w / 2, hgt); s.lineTo(-w / 2, 0); return s; }
  iPart(new THREE.ExtrudeGeometry(arch(BED_W, 0.9, 0.45), { depth: 0.08, bevelEnabled: false }), bedWood, BX, 0.4, HZ - 0.06);
  iPart(new THREE.ExtrudeGeometry(arch(BED_W - 0.24, 0.8, 0.36), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3 }), velvet, BX, 0.5, HZ + 0.02);
  for (var tr = 0; tr < 3; tr++) for (var tc = 0; tc < 5 - (tr === 2 ? 2 : 0); tc++) {     // tufting buttons
    var tx = (tc - (tr === 2 ? 1 : 2)) * 0.32, ty = 0.75 + tr * 0.3;
    iPart(new THREE.SphereGeometry(0.025, 8, 6), R.gold, BX + tx, ty, HZ + 0.13);
  }
  // mattress, sheet and the draped duvet
  softSlab(BED_W - 0.04, BED_L, 0.3, 0.06, R.cream, BX, 0.45, MZ);
  var DUV_L = BED_L * 0.72, DROP = 0.3, DUV_Z0 = MZ + BED_L / 2 - DUV_L;  // the duvet covers the bottom of the bed and hangs over the sides and foot
  var dg = new THREE.PlaneGeometry(BED_W + DROP * 2, DUV_L + DROP, 32, 26), dp = dg.attributes.position, half = (BED_W - 0.04) / 2, rr = 0.07;
  function fold(e) { // how a length of cloth past an edge wraps over and hangs: returns [outward, drop]
    if (e <= 0) return [e, 0];
    if (e < rr * Math.PI / 2) { var an = e / rr; return [rr * Math.sin(an), -rr * (1 - Math.cos(an))]; }
    return [rr, -rr - (e - rr * Math.PI / 2)];
  }
  for (var dv = 0; dv < dp.count; dv++) {
    var px = dp.getX(dv), pz = -dp.getY(dv) + (DUV_L + DROP) / 2;     // pz: 0 at the top edge of the duvet, growing toward the foot
    var py = 0, nx = px, nz = pz;
    var es = Math.abs(px) - half, fs = fold(es);
    if (es > 0) { nx = (px > 0 ? 1 : -1) * (half + fs[0]); py += fs[1]; nz += Math.sin(pz * 7 + px) * 0.025 * Math.min(1, es / DROP); }
    var ef = pz - DUV_L, ff = fold(ef);
    if (ef > 0) { nz = DUV_L + ff[0]; py += ff[1]; nx += Math.sin(px * 7) * 0.025 * Math.min(1, ef / DROP); }
    py += 0.035 * Math.sin(Math.min(1, Math.max(0, pz / 0.25)) * Math.PI / 2) * (es < 0 && ef < 0 ? 1 : 0.3); // a soft puffy top
    dp.setXYZ(dv, nx, py, nz);
  }
  dg.computeVertexNormals();
  var duv = dg.attributes.uv;
  for (var du = 0; du < duv.count; du++) duv.setXY(du, duv.getX(du) * 2.6, duv.getY(du) * 3);
  iPart(dg, duvetMat, BX, 0.79, DUV_Z0);
  softSlab(BED_W - 0.02, 0.22, 0.05, 0.02, R.cream, BX, 0.79, DUV_Z0 + 0.06);           // the sheet folded back over the top of the duvet
  // pillows, a little round cushion, and a rose throw across the foot
  [-0.43, 0.43].forEach(function (px) { softSlab(0.78, 0.46, 0.2, 0.09, R.pillow, BX + px, 0.73, HZ + 0.38).rotation.x = -0.25; });
  softSlab(0.6, 0.36, 0.16, 0.07, rMat(0xd9c8f0), BX - 0.15, 0.8, HZ + 0.66).rotation.set(-0.35, 0.12, 0);
  var cushion = iPart(new THREE.SphereGeometry(0.17, 16, 12), rMat(0xd98fb0), BX + 0.32, 0.95, HZ + 0.7);
  cushion.scale.set(1, 1, 0.42); cushion.rotation.x = -0.3;
  softSlab(BED_W + 0.08, 0.5, 0.07, 0.03, rMat(0xd98fb0, { roughness: 1 }), BX, 0.82, FZ - 0.5);
  // sheer lavender drapes gathered at each post
  var sheer = rMat(0xd8c4f0, { transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false });
  [[-1, HZ], [1, HZ], [-1, FZ], [1, FZ]].forEach(function (pc, n) {
    var cg = new THREE.PlaneGeometry(0.5, 2.3, 6, 16), cp = cg.attributes.position;
    for (var ci = 0; ci < cp.count; ci++) {
      var cy = cp.getY(ci) + 1.15, pinch = cy < 1.2 ? 0.35 + 0.65 * Math.abs(cy - 1.2) / 1.2 : 0.35 + 0.65 * (cy - 1.2) / 1.1; // gathered with a tie at the middle
      cp.setXYZ(ci, cp.getX(ci) * pinch, cy, Math.sin(cp.getX(ci) * 18) * 0.03 * pinch);
    }
    cg.computeVertexNormals();
    var drape = iPart(cg, sheer, BX + pc[0] * (BED_W / 2 + 0.04), 0.06, pc[1] + (n < 2 ? 0.12 : -0.12), 0, pc[0] > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
    iPart(new THREE.TorusGeometry(0.07, 0.015, 6, 12), R.gold, BX + pc[0] * (BED_W / 2 + 0.04), 1.26, pc[1] + (n < 2 ? 0.12 : -0.12), Math.PI / 2, 0, 0); // a gold tie-back
  });
  inSolids.push([BX, MZ - 0.7, 1.05], [BX, MZ + 0.5, 1.05]);
  // a little black nightstand beside the bed, with a candle and a potion
  var NSX = BX - BED_W / 2 - 0.5, NSZ = HZ + 0.3;
  iPart(new THREE.BoxGeometry(0.55, 0.55, 0.5), bedWood, NSX, 0.3, NSZ);
  iPart(new THREE.BoxGeometry(0.62, 0.05, 0.56), bedWood, NSX, 0.6, NSZ);
  iPart(new THREE.BoxGeometry(0.42, 0.18, 0.02), rMat(0x26222e, { roughness: 0.6 }), NSX, 0.38, NSZ + 0.26);  // a drawer
  iPart(new THREE.SphereGeometry(0.025, 8, 6), R.gold, NSX, 0.38, NSZ + 0.28);
  candle(NSX - 0.12, 0.625, NSZ, 0.2);
  potion(NSX + 0.13, 0.625, NSZ + 0.02, 0xb98cff, 0.9);
  inSolids.push([NSX, NSZ, 0.38]);

  // a tall black bookshelf on the left wall, open-fronted and empty, with a crown on top and a plinth below
  var SX = -ROOM_W / 2 + 0.28, SZ = -0.5;                             // its middle; it faces into the room (+x)
  var shelfBlack = rMat(0x111014, { roughness: 0.4, metalness: 0.15 }), shelfInside = rMat(0x1e1b24, { roughness: 0.6 });
  iPart(new THREE.BoxGeometry(0.03, 2.36, 1.8), shelfInside, SX - 0.2, 1.3, SZ);                  // the back panel, a shade lighter
  [-1, 1].forEach(function (sd) {
    iPart(new THREE.BoxGeometry(0.46, 2.5, 0.07), shelfBlack, SX, 1.25, SZ + sd * 0.935);         // the two sides
    iPart(new THREE.BoxGeometry(0.03, 2.3, 0.03), shelfInside, SX + 0.235, 1.3, SZ + sd * 0.905); // a fine bead down each front edge
  });
  iPart(new THREE.BoxGeometry(0.5, 0.07, 2.0), shelfBlack, SX, 2.47, SZ);                          // the top
  iPart(new THREE.BoxGeometry(0.56, 0.06, 2.08), shelfBlack, SX + 0.02, 2.54, SZ);                 // a stepped crown
  iPart(new THREE.BoxGeometry(0.6, 0.05, 2.14), shelfBlack, SX + 0.03, 2.6, SZ);
  iPart(new THREE.BoxGeometry(0.52, 0.16, 2.0), shelfBlack, SX + 0.01, 0.08, SZ);                  // the plinth at the bottom
  for (var shelf = 0; shelf < 4; shelf++) {                                                        // four empty shelves, each with a little lip
    var sy = 0.2 + shelf * 0.58;
    iPart(new THREE.BoxGeometry(0.42, 0.04, 1.8), shelfBlack, SX, sy, SZ);
    iPart(new THREE.BoxGeometry(0.03, 0.07, 1.8), shelfBlack, SX + 0.215, sy + 0.01, SZ);
  }
  inSolids.push([SX, SZ - 0.6, 0.5], [SX, SZ, 0.5], [SX, SZ + 0.6, 0.5]);

  // the rug in the middle of the room
  var rugSide = rMat(0x2a2050, { roughness: 1 }), RUG_X = 0.1, RUG_Z = 0.6, RUG_W = 3.9, RUG_D = 2.7; // a rectangular woven rug
  iPart(new THREE.BoxGeometry(RUG_W, 0.03, RUG_D), [rugSide, rugSide, R.rug, rugSide, rugSide, rugSide], RUG_X, 0.015, RUG_Z);
  var fringeMat = rMat(0xf5e9d3, { roughness: 1 }), knotMat = rMat(0xe3b553, { roughness: 0.8 });
  [-1, 1].forEach(function (sd) {                                      // soft cream tassels along both short ends, each tied with a little gold knot
    for (var fr = 0; fr < 14; fr++) {
      var fz = RUG_Z - RUG_D / 2 + 0.12 + fr * (RUG_D - 0.24) / 13, fx = RUG_X + sd * (RUG_W / 2 + 0.03);
      iPart(new THREE.SphereGeometry(0.03, 8, 6), knotMat, fx, 0.02, fz).scale.set(1, 0.6, 1);
      for (var st = -1; st <= 1; st++) {
        iPart(new THREE.BoxGeometry(0.17, 0.01, 0.014), fringeMat, fx + sd * 0.1, 0.008, fz + st * 0.018, 0, st * 0.18 * sd, 0);
      }
    }
  });




  // windows: arched wooden frames with little panes, a deep sill, a twilight sky outside, and pleated pink curtains
  // gathered back with gold tie-backs, hung from a gold rod with ball finials under a ruffled valance
  var skyTex = paintTexture(128, 160, function (g, w, h) {            // the view: a soft dusky sky with a few stars and distant hills
    var sky = g.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#3c3a7a'); sky.addColorStop(0.55, '#8e7ac0'); sky.addColorStop(0.85, '#e8b4c8'); sky.addColorStop(1, '#f6d2b8');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,248,230,0.9)';
    [[18, 14], [52, 30], [96, 18], [76, 52], [30, 60], [110, 70], [64, 10]].forEach(function (st) { g.beginPath(); g.arc(st[0], st[1], 1.3, 0, Math.PI * 2); g.fill(); });
    g.fillStyle = '#5a5a8a';
    g.beginPath(); g.moveTo(0, h); g.lineTo(0, h - 22); g.quadraticCurveTo(40, h - 40, 80, h - 26); g.quadraticCurveTo(110, h - 18, w, h - 30); g.lineTo(w, h); g.fill();
  });
  var paneMat = rMat(0xffffff, { map: skyTex, emissive: 0xffffff, emissiveMap: skyTex, emissiveIntensity: 0.55, roughness: 0.2 });
  var winFrame = rMat(0xf1e6da, { roughness: 0.6 });                  // creamy painted wood
  var curtainMat = rMat(0xe07aae, { roughness: 0.9, side: THREE.DoubleSide });
  var curtainLining = rMat(0xf5c4dc, { roughness: 0.9 });
  var WIN_W = 0.9, WIN_H = 1.05, ARCH = 0.3;
  function winArch(w, h, a) { var s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2 - a); s.quadraticCurveTo(w / 2, h / 2 + a * 0.35, 0, h / 2 + a * 0.35); s.quadraticCurveTo(-w / 2, h / 2 + a * 0.35, -w / 2, h / 2 - a); s.lineTo(-w / 2, -h / 2); return s; }
  [['N', 1.05], ['E', 0.2]].forEach(function (wd) {
    var wg = new THREE.Group(); wg.position.set(wd[1], 1.85, 0.02); inWalls[wd[0]].g.add(wg);
    var outer = winArch(WIN_W + 0.16, WIN_H + 0.16, ARCH + 0.06);
    outer.holes.push(winArch(WIN_W, WIN_H, ARCH));
    iPart(new THREE.ExtrudeGeometry(outer, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 }), winFrame, 0, 0, 0, 0, 0, 0, wg);
    var paneGeo = new THREE.ShapeGeometry(winArch(WIN_W, WIN_H, ARCH)), puv = paneGeo.attributes.uv, pp = paneGeo.attributes.position;
    for (var pv = 0; pv < puv.count; pv++) puv.setXY(pv, pp.getX(pv) / WIN_W + 0.5, (pp.getY(pv) + WIN_H / 2) / (WIN_H + ARCH * 0.35));
    iPart(paneGeo, paneMat, 0, 0, 0.005, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(0.035, WIN_H + ARCH * 0.3, 0.04), winFrame, 0, 0.04, 0.04, 0, 0, 0, wg);                    // the glazing bars
    [-0.18, 0.18].forEach(function (by) { iPart(new THREE.BoxGeometry(WIN_W, 0.035, 0.04), winFrame, 0, by, 0.04, 0, 0, 0, wg); });
    iPart(new THREE.BoxGeometry(WIN_W + 0.36, 0.06, 0.2), winFrame, 0, -WIN_H / 2 - 0.1, 0.1, 0, 0, 0, wg);                  // a deep sill
    iPart(new THREE.BoxGeometry(WIN_W + 0.2, 0.08, 0.05), winFrame, 0, -WIN_H / 2 - 0.16, 0.04, 0, 0, 0, wg);
    var ROD_Y = WIN_H / 2 + ARCH * 0.35 + 0.18, ROD_W = WIN_W + 0.8;
    iPart(new THREE.CylinderGeometry(0.018, 0.018, ROD_W, 8), R.gold, 0, ROD_Y, 0.16, 0, 0, Math.PI / 2, wg);           // the curtain rod
    [-1, 1].forEach(function (sd) {
      iPart(new THREE.SphereGeometry(0.04, 10, 8), R.gold, sd * ROD_W / 2, ROD_Y, 0.16, 0, 0, 0, wg);                    // ball finials
      iPart(new THREE.BoxGeometry(0.03, 0.03, 0.14), R.gold, sd * (ROD_W / 2 - 0.1), ROD_Y, 0.09, 0, 0, 0, wg);           // brackets
      // a pleated curtain: hangs in soft folds from the rod, gathered in at a tie-back, then flares out below
      var CW = 0.42, CH = ROD_Y + WIN_H / 2 + 0.3, cg = new THREE.PlaneGeometry(CW, CH, 16, 24), cp = cg.attributes.position;
      for (var ci = 0; ci < cp.count; ci++) {
        var u = cp.getX(ci) / CW + 0.5, v = 1 - (cp.getY(ci) / CH + 0.5);    // u across, v from the rod (0) down to the hem (1)
        var tie = 0.62, gather = v < tie ? 1 - 0.55 * Math.pow(v / tie, 1.6) : 0.45 + 0.4 * Math.pow((v - tie) / (1 - tie), 0.8);
        var x = (u - 0.5) * CW * gather - sd * (1 - gather) * 0.12;         // pulled toward the outside edge at the tie-back
        var z = Math.sin(u * Math.PI * 6) * 0.025 * (0.6 + gather * 0.5); // the pleats
        cp.setXYZ(ci, x, cp.getY(ci), z);
      }
      cg.computeVertexNormals();
      var cx = sd * (WIN_W / 2 + 0.18);
      iPart(cg, curtainMat, cx, ROD_Y - CH / 2, 0.13, 0, 0, 0, wg);
      iPart(new THREE.TorusGeometry(0.06, 0.016, 6, 14), R.gold, cx - sd * 0.1, ROD_Y - CH * 0.62, 0.16, 0, Math.PI / 2, 0, wg); // gold tie-back
      for (var rr = 0; rr < 4; rr++) iPart(new THREE.TorusGeometry(0.026, 0.006, 5, 10), R.gold, cx + (rr - 1.5) * 0.1, ROD_Y, 0.16, 0, Math.PI / 2, 0, wg); // curtain rings
    });
    var vg = new THREE.PlaneGeometry(ROD_W - 0.1, 0.2, 30, 3), vp = vg.attributes.position;   // a ruffled valance across the top
    for (var vi = 0; vi < vp.count; vi++) {
      var vx = vp.getX(vi), vy = vp.getY(vi), scallop = vy < -0.05 ? -0.04 * Math.abs(Math.sin(vx * Math.PI / 0.27)) : 0;
      vp.setXYZ(vi, vx, vy + scallop, Math.sin(vx * 40) * 0.015);
    }
    vg.computeVertexNormals();
    iPart(vg, curtainMat, 0, ROD_Y - 0.06, 0.18, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(ROD_W - 0.1, 0.025, 0.02), curtainLining, 0, ROD_Y + 0.04, 0.18, 0, 0, 0, wg);
  });

  // twinkly string lights along the top of the walls
  var inLights = [];
  function lightRun(name, len, n) { // a sagging string of lights along the top of one wall
    for (var i = 0; i <= n; i++) {
      var lx = -len / 2 + 0.2 + (len - 0.4) * i / n, ly = ROOM_H - 0.32 - Math.sin((i % 4) / 4 * Math.PI) * 0.12;
      var lm = rMat(i % 2 ? 0xffd27a : 0xff9be0, { emissive: i % 2 ? 0xffb040 : 0xff6fcf, emissiveIntensity: 1 });
      wallPart(name, new THREE.SphereGeometry(0.05, 8, 6), lm, lx, ly, 0.2);
      var lh = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: i % 2 ? 0xffc060 : 0xff8fe0, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      lh.position.set(lx, ly, 0.2); lh.scale.set(0.3, 0.3, 1); inWalls[name].g.add(lh);
      inLights.push({ s: lh, p: i * 1.3 + len });
    }
  }
  lightRun('N', ROOM_W, 18);
  lightRun('W', ROOM_D, 13);
  lightRun('E', ROOM_D, 13);

  // the front door (seen from inside): walk up to it to go back out
  wallPart('S', new THREE.PlaneGeometry(1.1, 1.5), R.door, 0, 0.75, 0.03);
  wallPart('S', new THREE.CircleGeometry(0.55, 18, 0, Math.PI), R.door, 0, 1.5, 0.03);
  wallPart('S', new THREE.TorusGeometry(0.6, 0.07, 6, 18, Math.PI), R.darkWood, 0, 1.5, 0.06);        // a wooden frame round the door
  [-1, 1].forEach(function (sd) { wallPart('S', new THREE.BoxGeometry(0.14, 1.5, 0.1), R.darkWood, sd * 0.62, 0.75, 0.06); });
  wallPart('S', new THREE.SphereGeometry(0.06, 10, 8), R.gold, 0.35, 0.8, 0.08);
  var EXIT_Z = -NW - 0.6;

  var wallLook = new THREE.Vector3();
  function updateInterior(dt, t) {
    if (!indoors || inShop || inClinic || inBarn) return;
    for (var wn in inWalls) { // hide any wall the camera is behind, windows and all, so it never blocks the view
      var W = inWalls[wn];
      wallLook.set(camera.position.x - IN_X - W.c.x, 0, camera.position.z - IN_Z - W.c.z);
      W.g.visible = wallLook.dot(W.n) > 0;
    }
    fireLight.intensity = 1.5 + Math.sin(t * 11) * 0.15 + Math.sin(t * 17.3) * 0.12;
    flames.forEach(function (f) {                                       // flames lick upward and sway
      var k = 1 + Math.sin(t * 9 + f.p) * 0.18 + Math.sin(t * 15.7 + f.p * 2) * 0.1;
      f.m.scale.set(0.9 + Math.sin(t * 6 + f.p) * 0.1, f.base * k, 0.9);
      f.m.rotation.z = Math.sin(t * 5 + f.p) * 0.12;
      f.m.position.x = FPX + f.x + Math.sin(t * 4 + f.p) * 0.02;
    });
    fireSparks.forEach(function (sp) {                                  // sparks drift up the chimney and wink out
      sp.t += dt * sp.sp;
      if (sp.t > 1) { sp.t -= 1; sp.x = (Math.random() - 0.5) * 0.6; }
      sp.s.position.set(FPX + sp.x + Math.sin(sp.t * 9 + sp.sp * 5) * 0.06, 0.45 + sp.t * 0.85, FIRE_Z + 0.1);
      sp.s.material.opacity = (1 - sp.t) * 0.9;
    });
    emberGlow.material.opacity = 0.65 + Math.sin(t * 3.1) * 0.1 + Math.sin(t * 7.7) * 0.06;
    hearthGlow.material.opacity = 0.28 + Math.sin(t * 11) * 0.04;
    crystal.material.emissiveIntensity = 0.6 + Math.sin(t * 1.6) * 0.25;
    candleGlows.forEach(function (c, n) { c.material.opacity = 0.75 + Math.sin(t * 12 + n * 2) * 0.12; });
    inLights.forEach(function (L) { L.s.material.opacity = 0.32 + 0.18 * Math.sin(t * 2 + L.p); });
  }

  // Going in and out: walk up to the front door to go in, and up to it again from inside to come back out
  var fadeBox = document.createElement('div');
  fadeBox.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;background:#120a1c;opacity:0;pointer-events:none;transition:opacity 0.35s;border-radius:inherit;z-index:5;';
  canvas.parentNode.appendChild(fadeBox);
  var doorBusy = false, doorArmed = true, outsideCam = null;
  var OUT_DOOR_X = HOUSE_X, OUT_DOOR_Z = HOUSE_Z + HD / 2 + 0.55;      // standing right in front of the door
  function inRoom(x, z) { return inBarn ? inBarnRoom(x, z) : inClinic ? inClinicRoom(x, z) : inShop ? inShopRoom(x, z) : Math.abs(x - IN_X) < ROOM_W / 2 - 0.35 && Math.abs(z - IN_Z) < ROOM_D / 2 - 0.35; }
  function useDoor(goIn, toShop) {                                   // toShop: true for the seed shop's door, 'clinic' for the clinic's, 'barn' for Fluff & Feather's, or nothing for the farmhouse's
    if (doorBusy) return;
    doorBusy = true;
    doorArmed = false;
    walkTarget = null;
    doorSound();
    fadeBox.style.opacity = 1;
    setTimeout(function () {
      var leftShop = inShop, leftClinic = inClinic, leftBarn = inBarn;
      indoors = goIn;
      inShop = goIn && toShop === true;
      inClinic = goIn && toShop === 'clinic';
      inBarn = goIn && toShop === 'barn';
      if (goIn) {
        if (inBarn) {
          abScene.add(player);
          player.position.set(AB_X, 0, AB_Z + AB_EXIT_Z - 1.0);
        } else if (inClinic) {
          clinicScene.add(player);
          player.position.set(CIN_X, 0, CIN_Z + CIN_EXIT_Z - 1.0);
        } else if (inShop) {
          shopScene.add(player);
          player.position.set(SIN_X, 0, SIN_Z + SIN_EXIT_Z - 1.0);
        } else {
          interiorScene.add(player);
          player.position.set(IN_X, 0, IN_Z + EXIT_Z - 1.0);
        }
        facing = Math.PI;                                           // facing into the room
        outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw };
        cam.dist = inBarn ? 9 : inShop || inClinic ? 8.5 : 7.5; cam.pitch = 0.85; cam.yaw = 0;
      } else {
        scene.add(player);
        if (leftBarn) {
          var bOut = animalFront(1.6);
          player.position.set(bOut.x, 0, bOut.z);
          facing = ANIMAL_TURN;                                     // facing out, down the ramp
        } else if (leftClinic) {
          var cOut = clinicFront(2.3);
          player.position.set(cOut.x, 0, cOut.z);
          facing = CLINIC_TURN;                                     // facing out, away from the clinic
        } else if (leftShop) {
          var out = shopFront(2.0);
          player.position.set(out.x, 0, out.z);
          facing = SHOP_TURN;                                       // facing out, away from the shop
        } else {
          player.position.set(OUT_DOOR_X, 0, OUT_DOOR_Z + 1.0);
          facing = 0;                                               // facing out, away from the door
        }
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
      }
      cam.target.set(player.position.x, 0.8, player.position.z);   // jump the camera straight there
      fadeBox.style.opacity = 0;
      setTimeout(function () { doorBusy = false; }, 380);
    }, 380);
  }
  function updateDoors() {
    var px = player.position.x, pz = player.position.z;
    var dShop = indoors ? (inShop ? dist(px, pz, SIN_X, SIN_Z + SIN_EXIT_Z) : 99) : dist(px, pz, shopDoor.x, shopDoor.z);
    var dClinic = indoors ? (inClinic ? dist(px, pz, CIN_X, CIN_Z + CIN_EXIT_Z) : 99) : dist(px, pz, clinicDoor.x, clinicDoor.z);
    var dBarn = indoors ? (inBarn ? dist(px, pz, AB_X, AB_Z + AB_EXIT_Z) : 99) : dist(px, pz, barnDoor.x, barnDoor.z);
    var d = indoors ? (inShop || inClinic || inBarn ? 99 : dist(px, pz, IN_X, IN_Z + EXIT_Z)) : dist(px, pz, OUT_DOOR_X, OUT_DOOR_Z);
    if (!doorArmed) { if (Math.min(d, dShop, dClinic, dBarn) > 0.85) doorArmed = true; return; }  // you have to step away before a door works again
    if (d < 0.5) useDoor(!indoors);
    else if (dShop < (indoors ? 0.5 : 0.22)) useDoor(!indoors, true);   // outside, you have to climb right up to the shop door
    else if (dClinic < (indoors ? 0.5 : 0.22)) useDoor(!indoors, 'clinic');
    else if (dBarn < (indoors ? 0.5 : 0.25)) useDoor(!indoors, 'barn');
  }
  // Sleeping: stand next to your bed and a Sleep button appears (or press Z). You drift off and wake at 6 am the next morning
  var sleepBtn = document.createElement('button');
  sleepBtn.type = 'button';
  sleepBtn.className = 'sleep-btn';
  sleepBtn.innerHTML = '🌙 Sleep <kbd>Z</kbd>';
  canvas.parentNode.appendChild(sleepBtn);
  var sleeping = false;
  function nearBed() {
    if (!indoors) return false;
    var lx = player.position.x - IN_X - BX, lz = player.position.z - IN_Z - MZ;  // from the middle of the bed
    return Math.abs(lx) < BED_W / 2 + 0.9 && Math.abs(lz) < BED_L / 2 + 0.6;
  }
  function goToSleep() {
    if (sleeping || doorBusy || !nearBed()) return;
    sleeping = true;
    walkTarget = null;
    sleepSound();
    fadeBox.style.transition = 'opacity 0.9s';
    fadeBox.style.opacity = 1;
    showToast('Zzz…', 1600);
    var stayedUpLate = state.minutes < 2 * 60;                         // got to bed between midnight and 2 am?
    setTimeout(function () {
      wakeNextMorning(stayedUpLate);                                   // well rested: full mana and stamina at 6 am (only half if you stayed up late)
      setTimeout(function () {
        fadeBox.style.opacity = 0;
        showToast(stayedUpLate ? 'Good morning… you stayed up late, so you only have half your stamina 🥱 ☀ Day ' + state.day : 'Good morning! ☀ Day ' + state.day, stayedUpLate ? 3400 : 2600);
        setTimeout(function () { fadeBox.style.transition = 'opacity 0.35s'; sleeping = false; }, 900);
      }, 1200);
    }, 1000);
  }
  // ---------- Stamina ----------
  // Swinging tools and watering use stamina. Run out and you collapse, waking up at home the next morning.
  // Sleeping fills it back up, and eating a moonbloom gives you some back (never more than MAX_STAMINA)
  var passingOut = false, tiredWarned = false;
  function useStamina(n) {
    state.stamina -= n;
    if (state.stamina <= 0) state.stamina = -(2 + Math.floor(Math.random() * 4));   // run out and you overdo it, a couple of points into the negatives (-2 to -5)
    if (state.stamina <= 60 && !tiredWarned) { tiredWarned = true; showToast('You\'re getting tired… eat a moonbloom or head to bed 🌙', 2600); }
  }
  function eatBloom() {
    if (state.stamina >= MAX_STAMINA) { showToast('You\'re full of energy already!', 1600); return; }
    if (!takeItem('bloom', 1)) return;
    var gain = 25 + Math.floor(Math.random() * 51);                     // a random 25 to 75
    var before = state.stamina;
    state.stamina = Math.min(MAX_STAMINA, state.stamina + gain);
    if (state.stamina > 60) tiredWarned = false;
    burst(player.position.x, 1.4, player.position.z, 0xffb3e6, 14, 1.5, 1.5, -3);
    popSound();
    showToast('Yum! +' + Math.round(state.stamina - before) + ' stamina 🌸', 1800);
  }
  function wakeNextMorning(halfStamina) {                             // shared by sleeping and collapsing (halfStamina: you stayed up past midnight)
    if (state.minutes >= 6 * 60) state.day += 1;                      // wake at 6 am the next morning
    state.minutes = 6 * 60;                                            // (after midnight, it's 6 am that same morning)
    state.mana = MAX_MANA;
    state.stamina = halfStamina ? MAX_STAMINA / 2 : MAX_STAMINA;
    tiredWarned = false;
    updateClock(0);
  }
  function passOut() {                                                // out of stamina: everything goes dark and you wake up at home
    if (passingOut || sleeping) return;
    passingOut = sleeping = true;
    walkTarget = null; keys = {};
    if (binOpen) closeBin();
    if (shopOpen) closeShop();
    if (barnShopOpen) closeBarnShop();
    toggleBag(false);
    sleepSound();
    showToast('You\'re exhausted… 💫', 1800);
    fadeBox.style.transition = 'opacity 1.2s';
    fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (!indoors) outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw };
      indoors = true; inShop = false; inClinic = false; inBarn = false;  // carried home, next to your bed
      interiorScene.add(player);
      player.position.set(IN_X + BX - BED_W / 2 - 0.55, 0, IN_Z + MZ);
      facing = -Math.PI / 2;
      cam.dist = 7.5; cam.pitch = 0.85; cam.yaw = 0;
      cam.target.set(player.position.x, 0.8, player.position.z);
      doorArmed = false;
      var overdid = Math.max(0, Math.round(-state.stamina));             // how far into the negatives you went
      wakeNextMorning();
      state.stamina = MAX_STAMINA - overdid;                            // and that much is missing from tomorrow's stamina
      setTimeout(function () {
        fadeBox.style.opacity = 0;
        showToast('You collapsed and woke up at home. You overdid it, so you start the day ' + overdid + ' stamina short. ☀ Day ' + state.day, 3600);
        setTimeout(function () { fadeBox.style.transition = 'opacity 0.35s'; sleeping = passingOut = false; }, 1300);
      }, 1500);
    }, 1400);
  }
  // Bedtime: at midnight the clock turns red and chimes. Get to bed by 2 am (you'll wake with half stamina). Still up at
  // 2 am? You pass out, wake up at the clinic at 6 am with half stamina, and the visit costs 500 Star Coins
  var CLINIC_FEE = 500, wasLate = null;
  function lateAlarm() {                                               // a little two-tone alarm: ding-dong, ding-dong
    if (!audioCtx) return;
    [988, 740, 988, 740].forEach(function (fr, i) { bellTone(fr, 0.07, 0.6, i * 0.28); bellTone(fr * 2, 0.02, 0.4, i * 0.28 + 0.01); });
  }
  function updateBedtime() {
    var late = state.minutes < 6 * 60;                                 // from midnight until morning
    if (wasLate !== late) {
      ui.clock.style.color = late ? '#e0304a' : '';
      ui.clock.style.fontWeight = late ? '700' : '';
      if (late && wasLate === false && !sleeping) { lateAlarm(); showToast('It\'s midnight! 🌙 Get to bed by 2 am…', 3000); }
      wasLate = late;
    }
    if (state.minutes >= 2 * 60 && state.minutes < 6 * 60 && !sleeping && !passingOut) collapseToClinic();
  }
  function collapseToClinic() {                                        // up too late: you pass out and wake up at the clinic
    passingOut = sleeping = true;
    walkTarget = null; keys = {};
    if (binOpen) closeBin();
    if (shopOpen) closeShop();
    if (barnShopOpen) closeBarnShop();
    toggleBag(false);
    sleepSound();
    showToast('It\'s 2 am… you can\'t keep your eyes open 💫', 1800);
    fadeBox.style.transition = 'opacity 1.2s';
    fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (!indoors) outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw };
      indoors = true; inShop = false; inClinic = true; inBarn = false;   // carried to the clinic, beside the exam table
      clinicScene.add(player);
      player.position.set(CIN_X + 2.0, 0, CIN_Z - 1.1);
      facing = Math.PI;
      cam.dist = 8.5; cam.pitch = 0.85; cam.yaw = 0;
      cam.target.set(player.position.x, 0.8, player.position.z);
      doorArmed = false;
      var paid = Math.min(CLINIC_FEE, state.coins);                    // the visit costs 500 Star Coins (or all you have, if you have less)
      state.coins -= paid;
      showCoins(true);
      wakeNextMorning(true);
      setTimeout(function () {
        fadeBox.style.opacity = 0;
        showToast('You passed out and woke up at Everdawn Clinic. The visit cost ' + paid + ' Star Coins, and you only have half your stamina. ☀ Day ' + state.day, 4200);
        setTimeout(function () { fadeBox.style.transition = 'opacity 0.35s'; sleeping = passingOut = false; }, 1300);
      }, 1500);
    }, 1400);
  }
  function updateStamina() {
    if (ui.stamina) ui.stamina.style.width = (Math.max(0, state.stamina) / MAX_STAMINA * 100).toFixed(1) + '%';
    var stText = Math.ceil(state.stamina - 0.001) + ' / ' + MAX_STAMINA;
    if (ui.staminaNum) ui.staminaNum.style.color = state.stamina < 0 ? '#e0304a' : '';   // shown in red while you're in the negatives
    if (ui.staminaNum && ui.staminaNum.textContent !== stText) ui.staminaNum.textContent = stText;
    if (state.stamina <= 0 && !passingOut && !sleeping) passOut();
    updateBedtime();
  }
  sleepBtn.addEventListener('click', function () { goToSleep(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'KeyZ') goToSleep(); });
  function updateSleepButton() {
    var show = nearBed() && !sleeping;
    if (sleepBtn.classList.contains('show') !== show) sleepBtn.classList.toggle('show', show);
  }


  // ---------- Chopping trees ----------
  var CHOPS_TO_FELL = 10, WOOD_PER_TREE = 15;
  var REGROW_DAYS = 75;   // in-game days for a felled tree to grow all the way back
  var SPROUT_DAYS = 1;    // the spot stays empty this long before a little sapling sprouts
  function gameMinutes() { return (state.day - 1) * 24 * 60 + state.minutes; } // in-game minutes since Day 1 began
  var FALL_MATS = [barkMat, pineBarkMat, pineCoreMat]; // trunks and branches fall; roots and soil stay
  // Ranges of the big shared buffers that changed this frame, sent to the graphics card in one go
  var dirtyRanges = [];
  function markDirty(attr, start, count) {
    for (var i = 0; i < dirtyRanges.length; i++) {
      var d = dirtyRanges[i];
      if (d.attr === attr) { d.lo = Math.min(d.lo, start); d.hi = Math.max(d.hi, start + count); return; }
    }
    dirtyRanges.push({ attr: attr, lo: start, hi: start + count });
  }
  function flushDirty() {
    dirtyRanges.forEach(function (d) {
      d.attr.updateRange.offset = d.lo;
      d.attr.updateRange.count = d.hi - d.lo;
      d.attr.needsUpdate = true;
    });
    dirtyRanges = [];
  }
  // Remember every tree's (and bush's) own trunk, branches and leaves inside the shared batches
  choppable.concat(trimmable).forEach(function (t) {
    var u = t.userData;
    u.base = t.position.clone();
    u.hits = 0;
    u.state = 'standing';
    u.solidR = u.solid.r;
    u.parts = [];
    (u.pieces || []).forEach(function (pc) {
      var falls = FALL_MATS.indexOf(pc.entry.mat) >= 0; // trunk and branches fall; roots and soil vanish with the tree
      var pos = pc.entry.mesh.geometry.attributes.position, vs = pc.geo.userData.vStart, vc = pc.geo.attributes.position.count;
      u.parts.push({
        falls: falls, flat: pc.entry.mat === litterMat, mesh: pc.entry.mesh, vStart: vs, vCount: vc, // flat: the leaf pile on the ground
        iStart: pc.geo.userData.iStart, iCount: pc.geo.index ? pc.geo.index.count : vc,
        orig: pos.array.slice(vs * 3, (vs + vc) * 3)
      });
    });
    u.pieces = null;
    u.leafOrig = u.leaves.map(function (L) { return L.batch.instanceMatrix.array.slice(L.start * 16, (L.start + L.count) * 16); });
  });

  // Moves a whole tree by matrix M (worked out around its base): used to grow, shrink and shudder it
  var growM = new THREE.Matrix4(), chopM = new THREE.Matrix4(), chopM2 = new THREE.Matrix4();
  // which: 'fall' moves only the trunk, branches and leaves; 'ground' only the roots and soil patch; nothing = all
  function setTreeTransform(t, M, which) {
    var u = t.userData, e = M.elements;
    u.parts.forEach(function (pt) {
      if (which === 'fall' && !pt.falls) return;
      if (which === 'ground' && pt.falls) return;
      if (which === 'tilt' && pt.flat) return; // the leaf pile stays flat on the ground while the tree shudders
      var attr = pt.mesh.geometry.attributes.position, arr = attr.array, o = pt.orig, s0 = pt.vStart * 3;
      for (var i = 0; i < o.length; i += 3) {
        var x = o[i], y = o[i + 1], z = o[i + 2];
        arr[s0 + i] = e[0] * x + e[4] * y + e[8] * z + e[12];
        arr[s0 + i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
        arr[s0 + i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
      }
      markDirty(attr, s0, o.length);
    });
    if (which === 'ground') return;
    growM.copy(M);
    u.leaves.forEach(function (L, n) {
      if (!L.count) return;
      var o = u.leafOrig[n], arr = L.batch.instanceMatrix.array;
      for (var i = 0; i < L.count; i++) {
        chopM.fromArray(o, i * 16).premultiply(growM);
        chopM.toArray(arr, (L.start + i) * 16);
      }
      markDirty(L.batch.instanceMatrix, L.start * 16, L.count * 16);
    });
  }
  // Shrinks a tree toward its base (k = 0 hides it, k = 1 is full size): used when it's felled and as it regrows
  var treeM = new THREE.Matrix4(), treeM2 = new THREE.Matrix4();
  function setTreeGrowth(t, k, which) {
    var b = t.userData.base;
    treeM.makeTranslation(b.x, b.y, b.z).multiply(treeM2.makeScale(k, k, k)).multiply(new THREE.Matrix4().makeTranslation(-b.x, -b.y, -b.z));
    setTreeTransform(t, treeM, which);
  }
  // Tilts a tree a little around its base, toward direction (dx, dz): used to make it shudder when hit
  var tiltQ = new THREE.Quaternion(), tiltAxis = new THREE.Vector3();
  function setTreeTilt(t, angle, dx, dz) {
    var b = t.userData.base;
    tiltAxis.set(dz, 0, -dx).normalize();
    treeM.makeTranslation(b.x, b.y, b.z).multiply(treeM2.makeRotationFromQuaternion(tiltQ.setFromAxisAngle(tiltAxis, angle)))
      .multiply(new THREE.Matrix4().makeTranslation(-b.x, -b.y, -b.z));
    setTreeTransform(t, treeM, 'tilt');
  }

  // A copy of the tree that can tip over on its own, pivoting just above the stump
  function makeFallingTree(t) {
    var u = t.userData, b = u.base, grp = new THREE.Group();
    grp.position.set(b.x, b.y + u.stumpH, b.z);
    u.parts.forEach(function (pt) {
      if (!pt.falls) return;
      var src = pt.mesh.geometry, g = new THREE.BufferGeometry(), vs = pt.vStart, vc = pt.vCount, i;
      var pos = new Float32Array(vc * 3);
      for (i = 0; i < vc; i++) {
        pos[i * 3] = pt.orig[i * 3] - b.x;
        pos[i * 3 + 1] = pt.orig[i * 3 + 1] - b.y - u.stumpH;
        pos[i * 3 + 2] = pt.orig[i * 3 + 2] - b.z;
      }
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.BufferAttribute(src.attributes.normal.array.slice(vs * 3, (vs + vc) * 3), 3));
      g.setAttribute('uv', new THREE.BufferAttribute(src.attributes.uv.array.slice(vs * 2, (vs + vc) * 2), 2));
      if (src.attributes.color) g.setAttribute('color', new THREE.BufferAttribute(src.attributes.color.array.slice(vs * 3, (vs + vc) * 3), 3));
      var idx = new Uint32Array(pt.iCount);
      for (i = 0; i < pt.iCount; i++) idx[i] = src.index.array[pt.iStart + i] - vs;
      g.setIndex(new THREE.BufferAttribute(idx, 1));
      var m = new THREE.Mesh(g, pt.mesh.material);
      m.castShadow = true;
      grp.add(m);
    });
    chopM2.makeTranslation(-b.x, -b.y - u.stumpH, -b.z);
    u.leaves.forEach(function (L, n) {
      if (!L.count) return;
      var im = new THREE.InstancedMesh(L.batch.geometry, L.batch.material, L.count), c = new THREE.Color();
      im.customDepthMaterial = L.batch.customDepthMaterial;
      im.castShadow = true;
      im.frustumCulled = false;
      for (var i = 0; i < L.count; i++) {
        chopM.fromArray(u.leafOrig[n], i * 16).premultiply(chopM2);
        im.setMatrixAt(i, chopM);
        c.fromArray(L.batch.instanceColor.array, (L.start + i) * 3);
        im.setColorAt(i, c);
      }
      grp.add(im);
    });
    scene.add(grp);
    return grp;
  }

  // Tree stumps: bark round the side, rings on top
  var ringCanvas = document.createElement('canvas');
  ringCanvas.width = ringCanvas.height = 128;
  (function (g) {
    g.fillStyle = '#d8b98a';
    g.fillRect(0, 0, 128, 128);
    for (var r = 6; r < 64; r += 4 + Math.random() * 3) {
      g.strokeStyle = 'rgba(140,96,58,' + (0.3 + Math.random() * 0.3) + ')';
      g.lineWidth = 1 + Math.random();
      g.beginPath(); g.arc(64, 64, r, 0, Math.PI * 2); g.stroke();
    }
    g.fillStyle = '#a77a4c';
    g.beginPath(); g.arc(64, 64, 4, 0, Math.PI * 2); g.fill();
  })(ringCanvas.getContext('2d'));
  var stumpTopMat = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(ringCanvas), roughness: 0.9 });
  function makeStump(t) {
    var u = t.userData, s = u.size;
    var geo = u.leafy ? new THREE.CylinderGeometry(0.3 * s, 0.42 * s, u.stumpH, 14) : new THREE.CylinderGeometry(0.22 * s, 0.26 * s, u.stumpH, 12);
    var m = new THREE.Mesh(geo, [u.leafy ? barkMat : pineBarkMat, stumpTopMat, barkMat]);
    m.position.set(u.base.x, u.base.y + u.stumpH / 2, u.base.z);
    m.castShadow = m.receiveShadow = true;
    scene.add(m);
    return m;
  }

  // The nearest standing tree you're close enough to chop
  function treeInReach() {
    var best = null, bestD = 99;
    choppable.forEach(function (t) {
      var u = t.userData;
      if (u.state !== 'standing') return;
      var d = dist(player.position.x, player.position.z, u.base.x, u.base.z);
      if (d < u.solid.r + 1.1 && d < bestD) { best = t; bestD = d; }
    });
    return best;
  }

  var SWING_TIME = 0.6, IMPACT = 0.27; // seconds: a whole swing, and when the axe bites into the trunk
  var swingT = 9, swingTree = null, swingRock = null; // time since the last swing started, and what it's aimed at
  // ---------- Tilling soil with the hoe ----------
  var TILL_FIND_CHANCE = 0.15; // each time you till, a 15% chance of digging something up
  var TILL_FINDS = ['stone', 'fiber', 'sap', 'acorn', 'pinecone', 'coal', 'hay', 'wood'];
  var swingTile = null, tilling = [];
  function tillTile(tile) {
    if (swingT < SWING_TIME) return; // still mid-swing
    swingT = 0;
    useStamina(STAMINA_COST.hoe);
    swingTile = tile;
    facing = Math.atan2(tile.x - player.position.x, tile.z - player.position.z);
  }
  // The hoe bites into the ground: the turf flips over into a mound of soil with furrows
  function hoeHits(tile) {
    if (tile.soil) return;
    tile = keepTile(tile);
    coverGrass(tile);
    buildSoil(tile, true);                    // three furrows, raised one after another
    tile.soil.scale.set(0.6, 0.05, 0.6);
    tile.tillT = 0;
    tilling.push(tile);
    tillSound();
    burst(tile.x, 0.2, tile.z, 0x8a5a36, 16, 2.6, 2.2, -8); // clods of earth
    burst(tile.x, 0.2, tile.z, 0x6aa84f, 8, 2, 1.8, -7);    // bits of turf
    if (Math.random() < TILL_FIND_CHANCE) { // dug something up!
      var find = TILL_FINDS[Math.floor(Math.random() * TILL_FINDS.length)];
      dropPickup(find, 1, tile.x + (Math.random() - 0.5) * 0.4, tile.z + (Math.random() - 0.5) * 0.4, 0.12, 0.35);
      findSound();
      burst(tile.x, 0.4, tile.z, 0xfff1a8, 10, 2, 2, -3);
    }
  }
  function updateTilling(dt) {
    for (var i = tilling.length - 1; i >= 0; i--) {
      var tile = tilling[i];
      tile.tillT += dt;
      var t = tile.tillT;
      // the soil heaves up with a little bounce, then settles
      var k = Math.min(1, t / 0.3);
      var bounce = k < 1 ? 1 - Math.pow(1 - k, 3) : 1 + Math.sin(Math.min(1, (t - 0.3) / 0.3) * Math.PI) * 0.12 * Math.max(0, 1 - (t - 0.3) / 0.3);
      tile.soil.scale.set(0.6 + 0.4 * Math.min(1, k * 1.4), Math.max(0.05, bounce), 0.6 + 0.4 * Math.min(1, k * 1.4));
      tile.ridges.forEach(function (ridge, n) { // furrows rise one by one
        var rk = Math.max(0, Math.min(1, (t - 0.15 - n * 0.1) / 0.2));
        ridge.scale.y = Math.max(0.001, rk * (rk < 1 ? 1.2 : 1));
      });
      if (t > 0.7) { tile.soil.scale.set(1, 1, 1); tilling.splice(i, 1); }
    }
  }

  // ---------- Trimming bushes ----------
  var SNIPS_TO_TRIM = 10, HAY_CHANCE = 0.5, swingBush = null;
  var allScenery = null; // every tree and bush, filled in once everything is set up
  function bushInReach() {
    var best = null, bestD = 99;
    trimmable.forEach(function (b) {
      var u = b.userData;
      if (u.state !== 'standing') return;
      var d = dist(player.position.x, player.position.z, u.base.x, u.base.z);
      if (d < u.solidR + 1.0 && d < bestD) { best = b; bestD = d; }
    });
    return best;
  }
  function trimBush(b) {
    if (swingT < SWING_TIME) return; // still mid-swing
    swingT = 0;
    useStamina(STAMINA_COST.trimmers);
    swingBush = b;
    facing = Math.atan2(b.userData.base.x - player.position.x, b.userData.base.z - player.position.z);
  }
  // The trimmers snip: leaves fly, the bush shudders, and on the tenth snip it's trimmed away
  function snipHits(b) {
    var u = b.userData;
    if (u.state !== 'standing') return;
    u.hits++;
    snipSound();
    burst(u.base.x, u.base.y + 0.5 * u.size, u.base.z, 0x6aa84f, 12, 2.4, 1.6, -5); // snipped leaves
    burst(u.base.x, u.base.y + 0.5 * u.size, u.base.z, 0x9bd06a, 5, 1.8, 1.2, -3);
    if (u.hits < SNIPS_TO_TRIM) { u.shudderT = 0; return; }
    rustleSound();
    u.state = 'shrinking';
    u.shrinkT = 0;
    u.shudderT = undefined;
    burst(u.base.x, u.base.y + 0.4 * u.size, u.base.z, 0x6aa84f, 30, 3.5, 2, -4);
    var span = 0.8 * u.size;
    sparklePoof(new THREE.Vector3(u.base.x - span, u.base.y, u.base.z), new THREE.Vector3(u.base.x + span, u.base.y, u.base.z), 150);
    var fibers = Math.max(2, Math.min(5, Math.round(1 + u.size * 2.5)));
    for (var i = 0; i < fibers; i++) {
      var a = Math.random() * Math.PI * 2, d = 0.4 + Math.random() * 0.8;
      dropPickup('fiber', 1, u.base.x + Math.cos(a) * d, u.base.z + Math.sin(a) * d, u.base.y, 0.2 + i * 0.06);
    }
    if (Math.random() < HAY_CHANCE) {
      var ha = Math.random() * Math.PI * 2;
      dropPickup('hay', 1, u.base.x + Math.cos(ha) * 0.8, u.base.z + Math.sin(ha) * 0.8, u.base.y, 0.55);
    }
  }

  function chopTree(t) {
    if (swingT < SWING_TIME) return; // still mid-swing
    swingT = 0;
    useStamina(STAMINA_COST.axe);
    swingTree = t;
    var u = t.userData;
    facing = Math.atan2(u.base.x - player.position.x, u.base.z - player.position.z); // turn to face the tree
  }
  // The axe lands: chips fly, the tree shudders, and on the tenth hit it falls
  function axeHits(t) {
    var u = t.userData;
    if (u.state !== 'standing') return;
    u.hits++;
    chopSound();
    var hx = u.base.x - Math.sin(facing) * 0.3, hz = u.base.z - Math.cos(facing) * 0.3;
    burst(hx, 0.7, hz, 0xd2a86e, 12, 2.6, 1.8, -7);                // wood chips
    burst(u.base.x, 2.6 * u.size, u.base.z, 0x6aa84f, 6, 1.6, 0.2, -1.2); // a few leaves shaken loose
    if (u.hits < CHOPS_TO_FELL) {
      u.shudderT = 0;
      return;
    }
    // Timber! Swap the standing tree for a copy that tips over, away from you
    creakSound();
    u.state = 'falling';
    u.fallT = 0;
    u.landed = false;
    u.poofed = false;
    u.stumpH = (u.leafy ? 0.38 : 0.32) * u.size;
    var away = new THREE.Vector3(u.base.x - player.position.x, 0, u.base.z - player.position.z);
    if (away.lengthSq() < 0.0001) away.set(1, 0, 0);
    away.normalize();
    u.fallDir = away;
    u.fallAxis = new THREE.Vector3(0, 1, 0).cross(away).normalize();
    u.proxy = makeFallingTree(t);
    setTreeGrowth(t, 0, 'fall'); // the standing trunk and leaves are swapped for the falling copy; roots stay for now
    u.stump = makeStump(t);
    u.solid.r = 0.35 * u.size; // only the stump is in the way now
  }

  // ---------- Wooden logs you walk into to collect ----------
  // A felled tree leaves logs floating where it fell, glowing softly like pickups
  var LOGS_PER_TREE = 7; // the tree's 15 wood is split between them
  var logBarkTex = barkTex.clone();
  logBarkTex.needsUpdate = true;
  logBarkTex.repeat.set(2, 1);
  var logGeo = new THREE.CylinderGeometry(0.13, 0.14, 1.15, 14);
  logGeo.rotateZ(Math.PI / 2); // lying on its side
  var logMats = [new THREE.MeshStandardMaterial({ map: logBarkTex, color: 0x9a6a48, roughness: 0.9 }), stumpTopMat, stumpTopMat];
  var logs = [];
  function dropLogs(u, len) {
    var midX = u.base.x + u.fallDir.x * len * 0.45, midZ = u.base.z + u.fallDir.z * len * 0.45;
    var sideX = -u.fallDir.z, sideZ = u.fallDir.x;
    for (var i = 0; i < LOGS_PER_TREE; i++) {
      var a = (Math.random() - 0.5) * 2.8, c = (i % 4 - 1.5) * 0.55 + (Math.random() - 0.5) * 0.25; // spread out loosely
      var x = midX + u.fallDir.x * a + sideX * c, z = midZ + u.fallDir.z * a + sideZ * c;
      var share = Math.floor(WOOD_PER_TREE / LOGS_PER_TREE) + (i < WOOD_PER_TREE % LOGS_PER_TREE ? 1 : 0);
      dropPickup('wood', share, x, z, u.base.y, i * 0.06);
    }
    // and the extras: 3 drops of sap, plus an acorn (leafy trees) or a pinecone (pines)
    var extras = ['sap', 'sap', 'sap', u.leafy ? 'acorn' : 'pinecone'];
    extras.forEach(function (item, n) {
      var ang = Math.random() * Math.PI * 2, r = 0.5 + Math.random() * 1.1;
      dropPickup(item, 1, midX + Math.cos(ang) * r, midZ + Math.sin(ang) * r, u.base.y, 0.45 + n * 0.08);
    });
  }

  // 3D models for things you can pick up
  var sapMat = new THREE.MeshStandardMaterial({ color: 0xf0a030, emissive: 0xd07a10, emissiveIntensity: 0.35, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.72 });
  var sapCoreMat = new THREE.MeshStandardMaterial({ color: 0xffc04a, emissive: 0xffa020, emissiveIntensity: 0.9, roughness: 0.3 }); // glowing honey centre
  var sapDripGeo = new THREE.SphereGeometry(0.028, 12, 8);
  sapDripGeo.scale(1, 1.4, 1);
  var sapShineGeo = new THREE.SphereGeometry(0.018, 10, 8);
  sapShineGeo.scale(0.7, 1.4, 0.4);
  var sapShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  var sapGeo = new THREE.SphereGeometry(0.11, 16, 12);
  (function () { // pull the top of the ball up into a droplet point
    var pp = sapGeo.attributes.position;
    for (var i = 0; i < pp.count; i++) {
      var y = pp.getY(i);
      if (y > 0) { var k = y / 0.11; pp.setXYZ(i, pp.getX(i) * (1 - k * 0.75), y + k * k * 0.12, pp.getZ(i) * (1 - k * 0.75)); }
    }
    sapGeo.computeVertexNormals();
  })();
  var nutMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.3, metalness: 0.05 }); // glossy, coloured by height
  var capMat = new THREE.MeshStandardMaterial({ color: 0x5e4026, roughness: 0.95 });
  var capScaleMat = new THREE.MeshStandardMaterial({ color: 0x8e6a42, roughness: 0.9 });
  var capScaleTipMat = new THREE.MeshStandardMaterial({ color: 0x9e7a4e, roughness: 0.85 }); // sun-bleached scale tips
  var coneMat = new THREE.MeshStandardMaterial({ color: 0x3a1e0c, roughness: 0.95 });                      // the dark core between the scales
  var coneScaleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.75 }); // scales: dark at the base, pale at the tip
  function pickupModel(item) {
    var g = new THREE.Group(), m;
    if (item === 'wood') {
      m = new THREE.Mesh(logGeo, logMats);
      m.rotation.order = 'YXZ';
      m.rotation.x = Math.random() * Math.PI;  // roll, so the bark looks different on each
      m.rotation.z = 0.12;                      // a slight tilt, like a floating pickup
      g.add(m);
    } else if (item === 'sap') { // a glossy drop of amber: see-through shell, glowing honey centre, a little drip
      g.add(new THREE.Mesh(sapGeo, sapMat));
      var core = new THREE.Mesh(sapGeo, sapCoreMat);
      core.scale.setScalar(0.62);
      core.position.y = -0.012;
      g.add(core);
      var drip = new THREE.Mesh(sapDripGeo, sapMat);    // a small drip hanging off the bottom
      drip.position.set(0.03, -0.115, 0.01);
      g.add(drip);
      var shine1 = new THREE.Mesh(sapShineGeo, sapShineMat);
      shine1.position.set(-0.04, 0.03, 0.075);
      g.add(shine1);
      var shine2 = new THREE.Mesh(sapShineGeo, sapShineMat);
      shine2.scale.setScalar(0.45);
      shine2.position.set(0.035, -0.04, 0.085);
      g.add(shine2);
      var sapGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffb040, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
      sapGlow.scale.set(0.42, 0.42, 1);
      g.add(sapGlow);
    } else if (item === 'acorn') { // a plump glossy acorn with a scaly cap and a little curved stem
      var nutPts = [];
      for (var ai = 0; ai <= 24; ai++) {
        var at = ai / 24;                       // 0 = the pointed tip, 1 = up under the cap
        var ar = at < 0.75 ? 0.1 * Math.pow(Math.sin((at / 0.75) * Math.PI / 2), 0.8) : 0.1 * Math.cos(((at - 0.75) / 0.25) * 0.8);
        nutPts.push(new THREE.Vector2(Math.max(0.0005, ar), -0.17 + at * 0.24));
      }
      var nutGeo = new THREE.LatheGeometry(nutPts, 24);
      nutGeo.computeVertexNormals();
      var nutCols = [], nutPos = nutGeo.attributes.position, nutC = new THREE.Color();
      var nutLow = new THREE.Color(0x7a3c1a), nutMid = new THREE.Color(0xc27a36), nutTop = new THREE.Color(0xe8be7a), nutBand = new THREE.Color(0xf3dfae);
      for (var ni = 0; ni < nutPos.count; ni++) {
        var nh = (nutPos.getY(ni) + 0.17) / 0.24; // deep red-brown at the tip, warm in the middle, pale gold by the cap
        if (nh < 0.55) nutC.copy(nutLow).lerp(nutMid, Math.pow(nh / 0.55, 0.6));
        else nutC.copy(nutMid).lerp(nutTop, (nh - 0.55) / 0.45);
        if (nh > 0.82) nutC.lerp(nutBand, (nh - 0.82) / 0.18);   // a creamy band just under the cap
        var nAng = Math.atan2(nutPos.getZ(ni), nutPos.getX(ni));
        var streak = 1 - 0.12 * Math.pow(Math.sin(nAng * 7 + nh * 1.5), 2) * Math.sin(nh * Math.PI); // faint darker grain lines down the sides
        nutCols.push(nutC.r * streak, nutC.g * streak, nutC.b * streak);
      }
      nutGeo.setAttribute('color', new THREE.Float32BufferAttribute(nutCols, 3));
      g.add(new THREE.Mesh(nutGeo, nutMat));
      var tip = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.03, 8), capMat); // the little dark point
      tip.rotation.x = Math.PI;
      tip.position.y = -0.175;
      g.add(tip);
      var nutShine = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), seedShineMat);
      nutShine.scale.set(0.7, 1.8, 0.4);
      nutShine.position.set(-0.045, -0.04, 0.083);
      nutShine.rotation.z = -0.25;
      g.add(nutShine);
      var nutShine2 = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), seedShineMat); // a second, smaller glint
      nutShine2.position.set(-0.028, -0.105, 0.064);
      g.add(nutShine2);
      var cap = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), capMat);
      cap.scale.set(0.108, 0.06, 0.108);        // a low dome that sits over the top of the nut
      cap.position.y = 0.035;
      g.add(cap);
      var lip = new THREE.Mesh(new THREE.TorusGeometry(0.104, 0.013, 8, 28), capMat); // the thick overhanging rim
      lip.rotation.x = Math.PI / 2;
      lip.position.y = 0.036;
      g.add(lip);
      var scaleGeo = new THREE.SphereGeometry(0.022, 7, 5);
      for (var sr = 0; sr < 5; sr++) {          // rings of overlapping woody scales, smaller toward the top
        var phi = 1.48 - sr * 0.28, ring = 18 - sr * 3;
        for (var sk = 0; sk < ring; sk++) {
          var sa = (sk / ring) * Math.PI * 2 + sr * 0.4;
          var nx = Math.sin(phi) * Math.cos(sa), ny = Math.cos(phi), nz = Math.sin(phi) * Math.sin(sa);
          var bump = new THREE.Mesh(scaleGeo, (sk + sr) % 3 === 0 ? capScaleTipMat : (sk % 2 ? capScaleMat : capMat));
          bump.position.set(nx * 0.112, 0.035 + ny * 0.064, nz * 0.112);
          bump.lookAt(bump.position.x + nx, bump.position.y + ny + 0.4, bump.position.z + nz);
          var jit = 0.9 + ((sk * 7 + sr * 3) % 5) * 0.05; // slightly uneven, like real scales
          bump.scale.set((1 - sr * 0.13) * jit * 0.85, (1.15 - sr * 0.13) * jit * 0.85, 0.4);
          g.add(bump);
        }
      }
      var stemCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, 0.15, 0), new THREE.Vector3(0.035, 0.17, 0));
      var stem = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 8, 0.011, 6), capMat); // a short stem with a gentle bend
      g.add(stem);
      var stemEnd = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 5), capScaleMat);
      stemEnd.position.set(0.035, 0.17, 0);
      stemEnd.scale.set(0.6, 1, 1);             // the snapped-off end shows the paler wood inside
      g.add(stemEnd);
      for (var si = 0; si < 2; si++) {          // little growth rings on the stem
        var knot = new THREE.Mesh(new THREE.TorusGeometry(0.011, 0.003, 5, 10), capScaleMat);
        var sp = stemCurve.getPoint(0.35 + si * 0.35), sd = stemCurve.getTangent(0.35 + si * 0.35);
        knot.position.copy(sp);
        knot.lookAt(sp.x + sd.x, sp.y + sd.y, sp.z + sd.z);
        g.add(knot);
      }
    } else if (item === 'fiber') { // a tied bundle of long grassy strands, flared at both ends, with twine round the middle
      var FIB_COLS = [0x2f7a2c, 0x3f8f36, 0x56a845, 0x6dbd52, 0x86cf62, 0x4a9a3c, 0xa2d872, 0x5fb04a];
      var fibC = new THREE.Color();
      for (var fi = 0; fi < 26; fi++) {
        var fa = fi * 2.39996, fdx = Math.cos(fa), fdz = Math.sin(fa);   // which way round the bundle this strand sits
        var rw = 0.002 + (fi % 4) * 0.004, rt = 0.035 + (fi % 5) * 0.009, rb = 0.028 + (fi % 3) * 0.008;
        var yt = 0.17 + (fi % 4) * 0.012, yb = -0.16 - (fi % 2) * 0.01;
        var fGeo = new THREE.PlaneGeometry(1, 1, 1, 14);
        var fp = fGeo.attributes.position, fCols = [];
        fibC.setHex(FIB_COLS[(fi * 3) % FIB_COLS.length]);
        for (var fv = 0; fv < fp.count; fv++) {
          var t = fp.getY(fv) + 0.5, u = 1 - t;   // 0 = the cut bottom, 1 = the pointed top
          var cr = u * u * rb + 2 * u * t * rw + t * t * rt;      // out from the middle: flared ends, pinched waist
          var cyy = u * u * yb + t * t * yt;
          var fw = 0.008 * (0.6 + 0.4 * Math.sin(Math.PI * t)) * (t > 0.7 ? Math.pow((1 - t) / 0.3, 0.7) : 1);
          var side = fp.getX(fv) * 2 * fw;
          fp.setXYZ(fv, fdx * cr - fdz * side, cyy, fdz * cr + fdx * side);
          var shade = 0.7 + 0.45 * t;             // darker low down, brighter toward the tips
          fCols.push(fibC.r * shade, fibC.g * shade, fibC.b * shade);
        }
        fGeo.setAttribute('color', new THREE.Float32BufferAttribute(fCols, 3));
        fGeo.computeVertexNormals();
        g.add(new THREE.Mesh(fGeo, fiberMat));
      }
      for (var tw = 0; tw < 3; tw++) {            // three turns of twine round the waist
        var turn = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.0085, 6, 18), twineMat);
        turn.rotation.x = Math.PI / 2 + (tw - 1) * 0.12;
        turn.position.y = (tw - 1) * 0.011;
        g.add(turn);
      }
      var knot = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), twineMat);
      knot.position.set(0.034, 0, 0.012);
      g.add(knot);
      [[0.05, -0.04, 0.02], [0.06, -0.01, -0.01]].forEach(function (end) { // the two loose ends of the twine
        var endCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0.036, 0, 0.012), new THREE.Vector3(0.05, 0, end[2] + 0.01), new THREE.Vector3(end[0], end[1], end[2]));
        g.add(new THREE.Mesh(new THREE.TubeGeometry(endCurve, 6, 0.004, 5), twineMat));
      });
    } else if (item === 'hay') { // a little tied hay bale: straw on every side, two twine bands, fuzzy loose straws
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.17, 0.19), [hayEndMat, hayEndMat, hayMat, hayMat, hayMat, hayMat]));
      [-0.075, 0.075].forEach(function (bx) {   // the twine bands, pulled tight round the bale
        var hb = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.176, 0.196), bandMat);
        hb.position.x = bx;
        g.add(hb);
      });
      var strawGeo = new THREE.CylinderGeometry(0.0025, 0.0035, 1, 4);
      for (var hs = 0; hs < 46; hs++) {         // loose straws sticking out of the surface all over
        var hf = hs % 6, hu = Math.random() - 0.5, hv = Math.random() - 0.5, hp = new THREE.Vector3(), hn = new THREE.Vector3();
        if (hf < 2) { hp.set(hf ? 0.15 : -0.15, hu * 0.17, hv * 0.19); hn.set(hf ? 1 : -1, 0, 0); }
        else if (hf < 4) { hp.set(hu * 0.3, hf === 2 ? 0.085 : -0.085, hv * 0.19); hn.set(0, hf === 2 ? 1 : -1, 0); }
        else { hp.set(hu * 0.3, hv * 0.17, hf === 4 ? 0.095 : -0.095); hn.set(0, 0, hf === 4 ? 1 : -1); }
        var hlen = 0.025 + Math.random() * 0.05;
        var straw = new THREE.Mesh(strawGeo, hs % 3 ? hayStrawMat : hayStrawPaleMat);
        hn.x += (Math.random() - 0.5) * 1.2; hn.y += (Math.random() - 0.5) * 1.2; hn.z += (Math.random() - 0.5) * 1.2; hn.normalize();
        straw.scale.set(1, hlen, 1);
        straw.position.copy(hp).addScaledVector(hn, hlen * 0.35);
        straw.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), hn);
        g.add(straw);
      }
    } else if (item === 'seed') { // three plump pearly seeds, each with a glowing gold crescent moon
      var SEEDS = [[0, 0.03, -0.01, 1, 0], [-0.06, -0.005, 0.015, 0.88, 0.45], [0.06, -0.005, 0.015, 0.88, -0.45]];
      SEEDS.forEach(function (sd) {
        var one = new THREE.Group();
        one.position.set(sd[0], sd[1], sd[2]);
        one.rotation.z = sd[4];                 // tilted outward, like a little bouquet
        one.scale.setScalar(sd[3]);
        one.add(new THREE.Mesh(seedGeo, seedMat));
        var moon = new THREE.Mesh(seedMoonGeo, seedMoonMat);
        moon.position.set(0, 0.0, 0.047);
        moon.rotation.z = 0.7;                  // the crescent's horns point up and to the side
        one.add(moon);
        var shine = new THREE.Mesh(seedShineGeo, seedShineMat);
        shine.position.set(-0.022, 0.03, 0.035);
        one.add(shine);
        g.add(one);
      });
      var seedGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xb98cff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
      seedGlow.scale.set(0.38, 0.38, 1);
      g.add(seedGlow);
      [[0.09, 0.09], [-0.1, 0.06], [0.03, 0.13]].forEach(function (tw) { // tiny gold twinkles
        var t = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffe680, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
        t.scale.set(0.05, 0.05, 1);
        t.position.set(tw[0], tw[1], 0.02);
        g.add(t);
      });
    } else if (item === 'bloom') { // a glowing moonbloom: two rings of cupped petals, a golden heart with a crescent moon, a leafy stem
      var bloomPetal = function (len, wide, cup, inner, outer) { // one spoon-shaped petal pointing out along +x, fading to a pale tip
        var pg = new THREE.PlaneGeometry(1, 1, 4, 10), pp = pg.attributes.position, pc = [], cIn = new THREE.Color(inner), cOut = new THREE.Color(outer), cc = new THREE.Color();
        for (var v = 0; v < pp.count; v++) {
          var t = pp.getY(v) + 0.5, across = pp.getX(v) * 2;  // t: 0 at the heart, 1 at the tip
          var w = wide * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.6)), 0.55);  // broad and rounded, with a soft point
          var z = across * w;
          pp.setXYZ(v, t * len, cup * t * t + z * z * 2.2, z); // curves up toward the tip, edges lift into a cup
          cc.copy(cIn).lerp(cOut, Math.pow(t, 1.3));
          cc.lerp(cOut, Math.abs(across) * 0.25 * t);         // paler edges
          pc.push(cc.r, cc.g, cc.b);
        }
        pg.setAttribute('color', new THREE.Float32BufferAttribute(pc, 3));
        pg.computeVertexNormals();
        return pg;
      };
      var head = new THREE.Group();
      head.rotation.x = 0.3;                    // the flower nods forward a little
      var backPetal = bloomPetal(0.11, 0.048, 0.03, 0xb47cff, 0xf3e3ff), frontPetal = bloomPetal(0.095, 0.044, 0.04, 0xff6fcf, 0xffe6f6);
      for (var pi = 0; pi < 12; pi++) {
        var back = pi < 6, pet = new THREE.Mesh(back ? backPetal : frontPetal, bloomPetalMat);
        pet.rotation.y = (pi % 6) / 6 * Math.PI * 2 + (back ? Math.PI / 6 : 0);
        pet.rotation.z = back ? 0.12 : 0.34;    // back petals open wide, front ones stand up more
        pet.position.y = back ? -0.004 : 0.004;
        head.add(pet);
      }
      var heart = new THREE.Mesh(new THREE.SphereGeometry(0.026, 14, 10), M.center); // the glowing golden heart
      heart.scale.set(1, 0.6, 1);
      heart.position.y = 0.014;
      head.add(heart);
      for (var si = 0; si < 9; si++) {          // a ring of little golden stamens
        var sa = si / 9 * Math.PI * 2;
        var stamen = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 6, 4), bloomStamenMat);
        stamen.position.set(Math.cos(sa) * 0.03, 0.026, Math.sin(sa) * 0.03);
        head.add(stamen);
      }
      var bloomMoon = new THREE.Mesh(seedMoonGeo, seedMoonMat); // the crescent moon resting on the heart
      bloomMoon.scale.setScalar(0.95);
      bloomMoon.position.set(0, 0.034, 0.004);
      bloomMoon.rotation.set(-1.0, 0, 0.7);
      head.add(bloomMoon);
      g.add(head);
      var bloomStemCurve = new THREE.CubicBezierCurve3(new THREE.Vector3(0, -0.19, 0), new THREE.Vector3(0.02, -0.13, 0), new THREE.Vector3(-0.018, -0.06, 0), new THREE.Vector3(0, -0.005, 0));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(bloomStemCurve, 12, 0.009, 6), M.stem)); // a slender, gently curving stem
      var sepals = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.leaf); // the little green cup under the flower
      sepals.position.y = 0.006;
      g.add(sepals);
      var bloomLeaf = new THREE.Mesh(bloomPetal(0.07, 0.022, 0.025, 0x4f9a48, 0x8ad87a), bloomLeafMat); // one leaf off the stem
      bloomLeaf.position.set(0.006, -0.1, 0);
      bloomLeaf.rotation.set(0, -0.4, 0.5);
      g.add(bloomLeaf);
      var bloomGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xff9be0, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
      bloomGlow.scale.set(0.38, 0.38, 1);
      bloomGlow.position.y = 0.02;
      g.add(bloomGlow);
      [[0.13, 0.08], [-0.13, 0.03], [0.05, 0.15]].forEach(function (tw) { // tiny gold twinkles
        var t = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffe680, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
        t.scale.set(0.035, 0.035, 1);
        t.position.set(tw[0], tw[1], 0.02);
        g.add(t);
      });
    } else if (item === 'petal') { // a Dawn Petal: a cupped cherry-blossom petal with a notched tip, deep pink at the base fading to pearl, fine veins and a dewdrop
      var PCOLS = 12, PROWS = 18, PLEN = 0.25, PWIDE = 0.075;
      var petalSpot = function (u, v) {           // u: -1..1 across the petal, v: 0 at the base to 1 at the tip
        var w = PWIDE * Math.pow(Math.sin(Math.PI / 2 * Math.min(1, (v + 0.04) / 0.78)), 0.8);
        var len = PLEN - 0.045 * (1 - Math.sqrt(1 - u * u)) - 0.016 * Math.exp(-(u / 0.13) * (u / 0.13)); // rounded shoulders and a notch at the tip
        var x = u * w, y = -PLEN / 2 + v * len;
        var z = 5 * x * x - 1.4 * Math.pow(Math.max(0, y - 0.02), 2) + 0.4 * (y + PLEN / 2) * x; // cupped across, the tip curling back, a little twist
        return [x, y, z];
      };
      var pPos = [], pCol = [], pIdx = [];
      var pBase = new THREE.Color(0xff4fb4), pMid = new THREE.Color(0xff9ad8), pTip = new THREE.Color(0xfff0f8), pc = new THREE.Color();
      for (var pr = 0; pr <= PROWS; pr++) {
        for (var pq = 0; pq <= PCOLS; pq++) {
          var pu = pq / PCOLS * 2 - 1, pv = pr / PROWS, spot = petalSpot(pu, pv);
          pPos.push(spot[0], spot[1], spot[2]);
          if (pv < 0.45) pc.copy(pBase).lerp(pMid, pv / 0.45); else pc.copy(pMid).lerp(pTip, (pv - 0.45) / 0.55);
          pc.lerp(pTip, Math.abs(pu) * 0.25 * pv);              // the edges are a touch paler
          pCol.push(pc.r, pc.g, pc.b);
        }
      }
      for (pr = 0; pr < PROWS; pr++) {
        for (pq = 0; pq < PCOLS; pq++) {
          var pa = pr * (PCOLS + 1) + pq, pb = pa + PCOLS + 1;
          pIdx.push(pa, pb, pa + 1, pa + 1, pb, pb + 1);
        }
      }
      var petalGeo2 = new THREE.BufferGeometry();
      petalGeo2.setAttribute('position', new THREE.Float32BufferAttribute(pPos, 3));
      petalGeo2.setAttribute('color', new THREE.Float32BufferAttribute(pCol, 3));
      petalGeo2.setIndex(pIdx);
      petalGeo2.computeVertexNormals();
      var dawnPetal = new THREE.Mesh(petalGeo2, new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0xff5cc0, emissiveIntensity: 0.35, roughness: 0.35, side: THREE.DoubleSide }));
      var petalBody = new THREE.Group();           // the petal, its veins and dewdrop, tilted together
      petalBody.rotation.z = 0.12;
      g.add(petalBody);
      petalBody.add(dawnPetal);
      var veinMat = new THREE.LineBasicMaterial({ color: 0xe0559f, transparent: true, opacity: 0.55 });
      [-0.55, -0.28, 0, 0.28, 0.55].forEach(function (vu) {      // fine veins fanning out from the base, on both faces
        [-0.0015, 0.0015].forEach(function (side) {
          var vp = [];
          for (var vs = 0; vs <= 10; vs++) {
            var vv = vs / 10 * (vu === 0 ? 0.74 : 0.64), at = petalSpot(vu * Math.min(1, vv * 1.4), vv);
            vp.push(new THREE.Vector3(at[0], at[1], at[2] + side));
          }
          petalBody.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(vp), veinMat));
        });
      });
      var dewSpot = petalSpot(-0.3, 0.55);
      var dew = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffd6f0, emissiveIntensity: 0.3, roughness: 0.05, transparent: true, opacity: 0.6 }));
      dew.scale.set(1, 1, 0.6);
      dew.position.set(dewSpot[0], dewSpot[1], dewSpot[2] + 0.007);
      petalBody.add(dew);
      var dewShine = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffffff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
      dewShine.scale.set(0.018, 0.018, 1);
      dewShine.position.set(dewSpot[0] - 0.004, dewSpot[1] + 0.005, dewSpot[2] + 0.02);
      petalBody.add(dewShine);
      var petalGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xff8fd8, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
      petalGlow.scale.set(0.36, 0.36, 1);
      g.add(petalGlow);
      [[0.1, 0.1], [-0.1, -0.04], [0.07, -0.11]].forEach(function (tw) { // tiny gold twinkles
        var t = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffe680, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
        t.scale.set(0.03, 0.03, 1);
        t.position.set(tw[0], tw[1], 0.02);
        g.add(t);
      });
    } else if (item === 'stone') {
      m = new THREE.Mesh(boulderGeos[2], stoneMat);
      m.scale.set(0.15, 0.12, 0.13);
      g.add(m);
    } else if (item === 'coal') { // a glossy faceted lump of coal with a couple of small chips and glints of shine
      m = new THREE.Mesh(coalGeo, coalMat);
      m.rotation.set(0.4, 0.3, 0.2);
      g.add(m);
      [[0.1, -0.06, 0.05, 0.32], [-0.09, -0.07, 0.06, 0.24]].forEach(function (ch) { // little chips broken off the lump
        var chip = new THREE.Mesh(coalGeo, coalMat);
        chip.position.set(ch[0], ch[1], ch[2]);
        chip.scale.setScalar(ch[3]);
        chip.rotation.set(ch[0] * 20, ch[1] * 30, ch[2] * 10);
        g.add(chip);
      });
      [[-0.04, 0.07, 0.11, 0.07], [0.06, 0.02, 0.13, 0.05], [-0.08, -0.01, 0.11, 0.04], [0.03, 0.09, 0.06, 0.035]].forEach(function (gl) { // sparkly glints on the facets
        var glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xdfe8ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
        glint.position.set(gl[0], gl[1], gl[2]);
        glint.scale.set(gl[3], gl[3], 1);
        g.add(glint);
      });
    } else if (item === 'pinecone') { // a woody cone: pointed scales spiralling round a dark core, pale worn tips, a little stem
      var CONE_TOP = 0.14, CONE_BOT = -0.15;
      var coneW = function (y) {                // an egg shape: rounded top, widest just above the middle, blunt point at the bottom
        var t = Math.min(1, Math.max(0, (CONE_TOP - y) / (CONE_TOP - CONE_BOT)));
        return 0.072 * Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(t, 0.8))), 0.65);
      };
      var corePts = [];
      for (var ci = 0; ci <= 16; ci++) {
        var cy = CONE_BOT + (ci / 16) * (CONE_TOP - CONE_BOT);
        corePts.push(new THREE.Vector2(Math.max(0.002, coneW(cy) * 0.8), cy));
      }
      g.add(new THREE.Mesh(new THREE.LatheGeometry(corePts, 14), coneMat));
      // one scale: a flat, pointed woody plate whose tip sticks out (+z), with a ridge down the middle
      var scaleGeo = new THREE.SphereGeometry(1, 8, 6);
      var sp = scaleGeo.attributes.position, scCols = [], scC = new THREE.Color();
      var scBase = new THREE.Color(0x3e200c), scMid = new THREE.Color(0x7e4420), scTip = new THREE.Color(0xb47a46), scEdge = new THREE.Color(0xf0c890), scUmbo = new THREE.Color(0x3a1e0c);
      for (var vi = 0; vi < sp.count; vi++) {
        var vx = sp.getX(vi), vy = sp.getY(vi), vz = sp.getZ(vi);
        var out = (vz + 1) / 2;                 // 0 = tucked into the core, 1 = the open tip
        vx *= 1 - out * out * 0.7;              // narrows to a point at the tip
        var top = vy > 0;
        vy = vy * (top ? (1 - Math.abs(vx) * 0.6) * (1 + out * 0.9) : 0.6); // a raised ridge, and a chunky knob at the tip
        vy += out * out * out * 0.9;            // the tip curls up a little
        sp.setXYZ(vi, vx * 0.032, vy * 0.011, vz * 0.034);
        if (out < 0.55) scC.copy(scBase).lerp(scMid, out / 0.55); else scC.copy(scMid).lerp(scTip, (out - 0.55) / 0.45);
        if (top && out > 0.62 && out < 0.78) scC.lerp(scEdge, 0.55); // a pale worn band across the knob
        if (top && out > 0.8 && Math.abs(vx) < 0.22) scC.copy(scUmbo); // the little dark point in the middle of the knob
        if (!top) scC.multiplyScalar(0.55);     // darker underneath
        scCols.push(scC.r, scC.g, scC.b);
      }
      scaleGeo.setAttribute('color', new THREE.Float32BufferAttribute(scCols, 3));
      scaleGeo.computeVertexNormals();
      var NSCALES = 96;
      for (var r = 0; r < NSCALES; r++) {       // a golden-angle spiral, like a real pinecone
        var f = r / (NSCALES - 1), y = CONE_BOT + 0.02 + f * (CONE_TOP - CONE_BOT - 0.05);
        var rad = coneW(y) * 0.85, a = r * 2.39996;
        var ox = Math.cos(a), oz = Math.sin(a);
        var sc = new THREE.Mesh(scaleGeo, coneScaleMat);
        sc.position.set(ox * rad, y, oz * rad);
        var droop = 0.55 + (1 - f) * 0.35;      // scales point out and down, more open toward the bottom
        sc.lookAt(sc.position.x + ox, y - droop, sc.position.z + oz);
        var size = 0.45 + (coneW(y) / 0.072) * 0.5;
        sc.scale.set(size, size, size * (0.9 + (r % 3) * 0.06)); // slightly uneven lengths
        sc.position.x += ox * 0.012 * size; sc.position.z += oz * 0.012 * size;
        g.add(sc);
      }
      var coneStemCurve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, CONE_TOP - 0.02, 0), new THREE.Vector3(0, CONE_TOP + 0.03, 0), new THREE.Vector3(0.025, CONE_TOP + 0.05, 0));
      g.add(new THREE.Mesh(new THREE.TubeGeometry(coneStemCurve, 8, 0.012, 6), capMat)); // a short bent woody stem
      var coneStemEnd = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 5), capScaleMat);
      coneStemEnd.position.set(0.025, CONE_TOP + 0.05, 0);
      coneStemEnd.scale.set(0.6, 1, 1);
      g.add(coneStemEnd);
      [[0.6, 0.05, 1.1], [2.4, -0.04, 0.8]].forEach(function (sd) { // a couple of tiny glossy drops of sap
        var drop = new THREE.Mesh(sapGeo, sapMat);
        var dr = coneW(sd[1]) + 0.022;
        drop.position.set(Math.cos(sd[0]) * dr, sd[1], Math.sin(sd[0]) * dr);
        drop.scale.setScalar(0.11 * sd[2]);
        g.add(drop);
      });
    }
    g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  var fiberMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.7, side: THREE.DoubleSide }); // grassy strands, coloured per strand
  var seedMat = new THREE.MeshStandardMaterial({ color: 0xe2d2ff, emissive: 0x7a58d0, emissiveIntensity: 0.4, roughness: 0.15, metalness: 0.15 }); // glossy pearly lavender
  // a plump teardrop: round at the bottom, softly pointed (not sharp) at the top
  var seedGeo = (function () {
    var pts = [];
    for (var i = 0; i <= 16; i++) {
      var t = i / 16, y = -0.05 + t * 0.13;
      var r = t < 0.45 ? Math.sin((t / 0.45) * Math.PI / 2) * 0.05 : 0.05 * Math.pow(Math.cos(((t - 0.45) / 0.55) * Math.PI / 2), 0.9);
      pts.push(new THREE.Vector2(Math.max(0.0005, r), y));
    }
    var g = new THREE.LatheGeometry(pts, 20);
    g.computeVertexNormals();
    return g;
  })();
  var seedMoonGeo = new THREE.TorusGeometry(0.02, 0.0065, 8, 18, Math.PI * 1.25); // an open ring = a crescent moon
  var seedMoonMat = new THREE.MeshStandardMaterial({ color: 0xffe08a, emissive: 0xffc94d, emissiveIntensity: 0.7, roughness: 0.4 });
  var seedShineGeo = new THREE.SphereGeometry(0.01, 8, 6);
  seedShineGeo.scale(0.8, 1.6, 0.5);
  var bloomPetalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, emissive: 0xff6fcf, emissiveIntensity: 0.2, roughness: 0.45, side: THREE.DoubleSide });
  var bloomLeafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.6, side: THREE.DoubleSide });
  var bloomStamenMat = new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffc94d, emissiveIntensity: 0.8, roughness: 0.4 });
  var seedShineMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  var petalMat = new THREE.MeshStandardMaterial({ color: 0xff9be0, emissive: 0xff6fcf, emissiveIntensity: 0.45, roughness: 0.4, side: THREE.DoubleSide });
  var twineMat = new THREE.MeshStandardMaterial({ color: 0xc99a5a, roughness: 0.9 });
  // straw textures for the hay bale: long golden strands on the sides, cut ends on the two ends
  function hayCanvas(ends) {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var x = c.getContext('2d');
    x.fillStyle = ends ? '#d6a848' : '#efca5e';
    x.fillRect(0, 0, 128, 128);
    var cols = ends ? ['#7a5418', '#f2d68a', '#a87a28', '#e0b450'] : ['#fff0b0', '#c99a32', '#f2d070', '#a87824', '#e8c058'];
    x.lineCap = 'round';
    for (var i = 0; i < (ends ? 260 : 420); i++) {
      var px = Math.random() * 128, py = Math.random() * 128;
      x.strokeStyle = x.fillStyle = cols[i % cols.length];
      if (ends) { x.beginPath(); x.arc(px, py, 1 + Math.random() * 1.6, 0, Math.PI * 2); x.fill(); }
      else { var l = 10 + Math.random() * 28; x.lineWidth = 1 + Math.random() * 1.6; x.beginPath(); x.moveTo(px, py); x.lineTo(px + l, py + (Math.random() - 0.5) * 4); x.stroke(); }
    }
    var t = new THREE.CanvasTexture(c);
    return t;
  }
  var hayMat = new THREE.MeshStandardMaterial({ map: hayCanvas(false), roughness: 0.95 });
  var hayEndMat = new THREE.MeshStandardMaterial({ map: hayCanvas(true), roughness: 0.95 });
  var hayStrawMat = new THREE.MeshStandardMaterial({ color: 0xe0b450, roughness: 0.9 });
  var hayStrawPaleMat = new THREE.MeshStandardMaterial({ color: 0xf6dc8a, roughness: 0.9 });
  var bandMat = new THREE.MeshStandardMaterial({ color: 0xb0402e, roughness: 0.8 });
  // a chunk of coal broken off a seam: big flat cleaved faces with softly rounded edges, dark and glossy
  var coalGeo = (function () {
    var cg = new THREE.IcosahedronGeometry(0.13, 4), cp = cg.attributes.position, v = new THREE.Vector3(), cols = [], cc = new THREE.Color();
    var CUTS = [[0.1, 1, 0.15, 0.62], [0.9, 0.3, 0.4, 0.66], [-0.8, 0.5, 0.3, 0.7], [0.2, -0.3, 1, 0.68], [-0.3, 0.2, -1, 0.7],
                [0.6, -0.9, -0.3, 0.6], [-0.7, -0.6, 0.4, 0.66], [0.5, 0.6, -0.7, 0.68], [-0.4, 0.7, 0.7, 0.72], [0.7, -0.1, 0.8, 0.74]];
    var planes = CUTS.map(function (c) { return { n: new THREE.Vector3(c[0], c[1], c[2]).normalize(), d: c[3] }; });
    for (var i = 0; i < cp.count; i++) {
      v.fromBufferAttribute(cp, i).normalize();
      for (var pi = 0; pi < planes.length; pi++) { // slice the ball flat wherever it pokes past a cleave plane
        var over = v.dot(planes[pi].n) - planes[pi].d;
        if (over > 0) v.addScaledVector(planes[pi].n, -over);
      }
      v.multiplyScalar(0.13 / 0.72);
      cp.setXYZ(i, v.x * 1.1, v.y * 0.85, v.z);
      var tone = 0.32 + 0.03 * Math.sin(v.x * 40 + v.y * 25) + 0.02 * Math.sin(v.z * 55 - v.y * 30); // faint natural variation, no patches
      cc.setRGB(tone, tone, tone * 1.15);
      cols.push(cc.r, cc.g, cc.b);
    }
    // smooth the shading: every copy of the same corner shares one averaged normal, so no flat triangles show
    cg.computeVertexNormals();
    var nAcc = {}, nrm = cg.attributes.normal, key;
    for (i = 0; i < cp.count; i++) {
      key = Math.round(cp.getX(i) * 1e4) + ',' + Math.round(cp.getY(i) * 1e4) + ',' + Math.round(cp.getZ(i) * 1e4);
      if (!nAcc[key]) nAcc[key] = new THREE.Vector3();
      nAcc[key].x += nrm.getX(i); nAcc[key].y += nrm.getY(i); nAcc[key].z += nrm.getZ(i);
    }
    for (i = 0; i < cp.count; i++) {
      key = Math.round(cp.getX(i) * 1e4) + ',' + Math.round(cp.getY(i) * 1e4) + ',' + Math.round(cp.getZ(i) * 1e4);
      v.copy(nAcc[key]).normalize();
      nrm.setXYZ(i, v.x, v.y, v.z);
    }
    cg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return cg;
  })();
  var coalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.3, metalness: 0 }); // glossy, so each flat face catches the light differently
  var PICKUP_GLOW = { fiber: 0xd8ffb0, hay: 0xffe6a0, wood: 0xffe6a8, sap: 0xffc060, acorn: 0xffe6a8, pinecone: 0xffe6a8, stone: 0xe6eeff, coal: 0xffb070 };
  // Puts a floating, glowing pickup on the ground: walk into it to collect
  function dropPickup(item, amount, x, z, groundY, delay) {
    var holder = new THREE.Group(); // floats and spins
    holder.position.set(x, groundY + 1.0 + Math.random() * 0.4, z);
    holder.rotation.y = Math.random() * Math.PI * 2;
    holder.add(pickupModel(item));
    var big = item === 'wood';
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: PICKUP_GLOW[item], transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    glow.scale.set(big ? 1.5 : 0.8, big ? 1.5 : 0.8, 1);
    holder.add(glow);
    scene.add(holder);
    var shadow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    if (big) shadow.scale.set(1.4, 0.6, 1); else shadow.scale.set(0.45, 0.45, 1);
    shadow.position.set(x, groundY + 0.03, z);
    scene.add(shadow);
    logs.push({ mesh: holder, glow: glow, shadow: shadow, x: x, z: z, ground: groundY, t: -delay, p: Math.random() * 6.28,
      item: item, amount: amount, hover: big ? FLOAT_H : FLOAT_H + 0.08 });
  }
  // Picking things up: the message keeps a running count while you're collecting (+3 Sap, not +1 Sap three times),
  // listing each kind you've picked up; it starts fresh once you've stopped for a moment
  var tally = [], tallyAt = 0;
  function pickupTally(item, amount) {
    var now = Date.now();
    if (now - tallyAt > 2600) tally = [];
    tallyAt = now;
    var found = null;
    tally.forEach(function (t) { if (t.item === item) found = t; });
    if (found) found.n += amount; else tally.push({ item: item, n: amount });
    showToast(tally.map(function (t) { return '+' + t.n + ' ' + ITEMS[t.item].name + ' ' + ITEMS[t.item].icon; }).join('  ·  '), 2600);
  }
  var FLOAT_H = 0.32;     // how high the logs hover
  var PICKUP_RANGE = 1.4; // how close you need to be to pick things up
  function updateLogs(dt) {
    for (var i = logs.length - 1; i >= 0; i--) {
      var L = logs[i];
      L.t += dt;
      var on = L.t >= 0;
      L.mesh.visible = L.shadow.visible = on;
      if (!on) continue;
      // pops out of the sparkles, then settles into a gentle hover, bobbing and slowly turning
      var hoverY = L.ground + L.hover + Math.sin(L.t * 2.4 + L.p) * 0.05;
      var settle = Math.min(1, L.t / 0.6);
      L.mesh.position.y += (hoverY - L.mesh.position.y) * Math.min(1, dt * (2 + settle * 6));
      L.mesh.rotation.y += dt * 0.8;
      L.glow.material.opacity = 0.3 + Math.sin(L.t * 3 + L.p) * 0.12;
      var sh = 1 - (L.mesh.position.y - L.ground - L.hover) * 0.5; // the shadow grows as the log comes down
      L.shadow.material.opacity = 0.2 * Math.max(0.2, Math.min(1, sh));
      if (L.t > 0.5 && dist(player.position.x, player.position.z, L.x, L.z) < PICKUP_RANGE) { // walked into it: collect
        if (!addItem(L.item, L.amount)) { bagFull(); continue; }  // no room: it stays where it is
        popSound();
        pickupTally(L.item, L.amount);
        burst(L.x, L.mesh.position.y + 0.2, L.z, 0xfff1a8, 10, 2, 1.5, -2);
        scene.remove(L.mesh);
        L.mesh.traverse(function (o) { // free one-off shapes; shared ones stay
          if (o.isMesh && o.geometry !== logGeo && o.geometry !== sapGeo && o.geometry !== coalGeo && o.geometry !== seedMoonGeo && o.geometry !== seedShineGeo && o.geometry !== seedGeo && o.geometry !== sapDripGeo && o.geometry !== sapShineGeo && boulderGeos.indexOf(o.geometry) < 0) o.geometry.dispose();
        });
        scene.remove(L.shadow);
        L.glow.material.dispose();
        L.shadow.geometry.dispose();
        L.shadow.material.dispose();
        logs.splice(i, 1);
      }
    }
  }

  // A little "pop" sound, made on the fly (no sound files needed)
  var audioCtx = null;
  function wakeAudio() { // phones only allow sound after you've touched the screen or pressed a key
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && AC) audioCtx = new AC();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  window.addEventListener('pointerdown', wakeAudio);
  window.addEventListener('keydown', wakeAudio);
  window.addEventListener('touchstart', wakeAudio);
  function popSound() {
    if (!audioCtx) return;
    var now = audioCtx.currentTime;
    var osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620 + Math.random() * 120, now);         // a quick upward bloop
    osc.frequency.exponentialRampToValueAtTime(1300, now + 0.07);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Tree-chopping sounds, also made on the fly
  var noiseBuf = null;
  function hissBurst(dur, filterType, freq, q, vol, attack, decay, when) { // a burst of filtered hiss: the basis of thocks, crashes and rustles
    if (!noiseBuf) {
      noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate, audioCtx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var t0 = audioCtx.currentTime + (when || 0);
    var src = audioCtx.createBufferSource(), f = audioCtx.createBiquadFilter(), gain = audioCtx.createGain();
    src.buffer = noiseBuf;
    f.type = filterType; f.frequency.value = freq; f.Q.value = q;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + decay);
    src.connect(f); f.connect(gain); gain.connect(audioCtx.destination);
    src.start(t0, Math.random() * 0.5);
    src.stop(t0 + dur);
  }
  function slideTone(type, f0, f1, vol, dur, when) { // a pitch that slides from f0 to f1
    var t0 = audioCtx.currentTime + (when || 0);
    var osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }
  function chopSound() { // a woody "thock" as the axe bites in
    if (!audioCtx) return;
    var p = 0.9 + Math.random() * 0.2;
    slideTone('sine', 230 * p, 105 * p, 0.55, 0.11);            // the deep knock of the trunk
    slideTone('triangle', 520 * p, 300 * p, 0.18, 0.05);        // the hollow ring of the wood
    hissBurst(0.12, 'bandpass', 1500 * p, 1.4, 0.4, 0.002, 0.07); // the crack of the blade and chips flying
  }
  function creakSound() { // the trunk groans as the tree starts to tip
    if (!audioCtx) return;
    var t0 = audioCtx.currentTime;
    var osc = audioCtx.createOscillator(), wob = audioCtx.createOscillator(), wobAmt = audioCtx.createGain();
    var f = audioCtx.createBiquadFilter(), gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, t0);
    osc.frequency.linearRampToValueAtTime(60, t0 + 1.3);
    wob.frequency.value = 13; wobAmt.gain.value = 9;          // a ratchety wobble, like wood fibres giving way
    wob.connect(wobAmt); wobAmt.connect(osc.frequency);
    f.type = 'lowpass'; f.frequency.value = 700; f.Q.value = 4;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.4);
    osc.connect(f); f.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t0); wob.start(t0);
    osc.stop(t0 + 1.45); wob.stop(t0 + 1.45);
  }
  function crashSound() { // the tree hits the ground: a heavy thud, a rumble and a rustle of leaves
    if (!audioCtx) return;
    slideTone('sine', 90, 38, 0.7, 0.45);
    hissBurst(0.8, 'lowpass', 320, 0.7, 0.6, 0.01, 0.6);
    hissBurst(0.7, 'highpass', 2600, 0.5, 0.18, 0.03, 0.5, 0.04);
    slideTone('sine', 70, 40, 0.3, 0.25, 0.16);                // a smaller bounce
  }
  // Mining sounds: a bright metal-on-stone "tink" for each swing, a clattering rumble when the rock breaks
  function bellTone(freq, vol, decay, when) { // one bell-like partial that rings and fades
    var t0 = audioCtx.currentTime + (when || 0);
    var osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + decay + 0.02);
  }
  function clinkSound() { // the pickaxe strikes stone
    if (!audioCtx) return;
    var p = 0.92 + Math.random() * 0.16;
    bellTone(1870 * p, 0.16, 0.32);                                // the pick's metal ringing, with uneven overtones like real metal
    bellTone(2790 * p, 0.09, 0.22);
    bellTone(4310 * p, 0.05, 0.14);
    hissBurst(0.06, 'bandpass', 3800 * p, 1.2, 0.35, 0.001, 0.03); // the sharp click of the strike
    slideTone('sine', 170 * p, 95 * p, 0.32, 0.07);            // the dull knock of solid rock
    hissBurst(0.16, 'highpass', 1800, 0.6, 0.12, 0.004, 0.11, 0.015); // grit and chips skittering away
  }
  function crumbleSound() { // the rock cracks apart and the rubble tumbles down
    if (!audioCtx) return;
    hissBurst(0.15, 'bandpass', 2400, 0.8, 0.5, 0.001, 0.08);    // the crack
    slideTone('sine', 110, 45, 0.6, 0.4, 0.02);                  // a heavy thump
    hissBurst(0.7, 'lowpass', 500, 0.7, 0.4, 0.02, 0.5, 0.03);   // the rumble
    for (var i = 0; i < 9; i++) {                                // stones clattering, quieter as they settle
      var when = 0.06 + i * 0.05 + Math.random() * 0.04;
      hissBurst(0.08, 'bandpass', 700 + Math.random() * 1800, 2.5, 0.28 * (1 - i / 11), 0.002, 0.05, when);
      slideTone('sine', 240 + Math.random() * 200, 140, 0.12 * (1 - i / 11), 0.05, when);
    }
  }
  // Trimming sounds: a crisp "snip-snick" of the shears with a rustle of leaves, and a big leafy whoosh when the bush is cleared
  function snipSound() {
    if (!audioCtx) return;
    var p = 0.92 + Math.random() * 0.16;
    hissBurst(0.09, 'highpass', 5200 * p, 0.8, 0.22, 0.003, 0.05);      // the blades sliding past each other
    bellTone(3300 * p, 0.07, 0.06, 0.04);                             // the little metal click as they close
    bellTone(4700 * p, 0.04, 0.04, 0.045);
    hissBurst(0.05, 'bandpass', 2600 * p, 3, 0.25, 0.001, 0.025, 0.045); // the snip itself
    hissBurst(0.3, 'bandpass', 3200, 0.9, 0.16, 0.02, 0.2, 0.05);     // leaves rustling as they fall
  }
  function rustleSound() {
    if (!audioCtx) return;
    for (var i = 0; i < 7; i++) {                                     // waves of rustling leaves, fading away
      hissBurst(0.25, 'bandpass', 2400 + Math.random() * 2000, 0.8, 0.22 * (1 - i / 9), 0.03, 0.17, i * 0.08 + Math.random() * 0.03);
    }
    hissBurst(0.6, 'lowpass', 900, 0.5, 0.18, 0.05, 0.45);            // the soft whoosh of the branches collapsing
    slideTone('sine', 120, 70, 0.18, 0.25, 0.05);                     // a gentle bump as it settles
  }
  // Spell sounds: a sparkly magical shimmer when you cast, and a soft chime as the sparkles land on each crop
  function spellSound() {
    if (!audioCtx) return;
    var t0 = audioCtx.currentTime;
    var src = audioCtx.createBufferSource(), f = audioCtx.createBiquadFilter(), gain = audioCtx.createGain(); // a whoosh that sweeps upward
    if (!noiseBuf) hissBurst(0.01, 'lowpass', 100, 1, 0.0002, 0.001, 0.002);  // makes sure the hiss is ready
    src.buffer = noiseBuf;
    f.type = 'bandpass'; f.Q.value = 2.5;
    f.frequency.setValueAtTime(500, t0);
    f.frequency.exponentialRampToValueAtTime(3500, t0 + 0.6);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.75);
    src.connect(f); f.connect(gain); gain.connect(audioCtx.destination);
    src.start(t0, Math.random() * 0.3);
    src.stop(t0 + 0.8);
    [523.25, 526.5].forEach(function (fr) {                       // a warm, slightly wavy glow underneath
      var osc = audioCtx.createOscillator(), g = audioCtx.createGain();
      osc.type = 'sine'; osc.frequency.value = fr;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.07, t0 + 0.3);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.5);
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(t0); osc.stop(t0 + 1.55);
    });
    [1046.5, 1318.5, 1568, 2093, 2637, 3136].forEach(function (fr, i) { // a rising, twinkly run of bell notes
      bellTone(fr, 0.09, 0.7, 0.05 + i * 0.065);
      bellTone(fr * 2.01, 0.025, 0.4, 0.05 + i * 0.065);          // a faint glassy overtone on each
    });
    for (var i = 0; i < 7; i++) {                                 // little random sparkles fizzing around you
      bellTone(3200 + Math.random() * 3200, 0.03, 0.18, 0.35 + Math.random() * 0.9);
    }
  }
  function landChime(when) { // sparkles settling onto a crop
    if (!audioCtx) return;
    var notes = [1568, 1760, 2093, 2349];
    var fr = notes[Math.floor(Math.random() * notes.length)];
    bellTone(fr, 0.05, 0.5, when);
    bellTone(fr * 1.5, 0.025, 0.35, when + 0.03);
  }
  // Mana sounds: soft twinkles that climb higher as the Dawn Tree fills your mana, and a bright chord when it's full
  var MANA_NOTES = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093, 2349.3, 2637, 3136, 3520]; // a happy five-note scale, two octaves
  var manaChimeT = 0;
  function manaFillSound(fullness, dt) {
    if (!audioCtx) return;
    manaChimeT -= dt;
    if (manaChimeT > 0) return;
    manaChimeT = 0.16;                                              // one twinkle every so often while it fills
    var fr = MANA_NOTES[Math.min(MANA_NOTES.length - 1, Math.floor(fullness * MANA_NOTES.length))];
    bellTone(fr, 0.04, 0.4);
    bellTone(fr * 2.01, 0.012, 0.25, 0.01);                         // a glassy shimmer on top
  }
  function manaFullSound() {
    if (!audioCtx) return;
    [2093, 2637, 3136, 4186].forEach(function (fr, i) {             // a quick sparkling chord, rolled upward
      bellTone(fr, 0.06, 0.9, i * 0.05);
      bellTone(fr * 1.005, 0.03, 0.9, i * 0.05 + 0.01);             // slightly detuned twin, for a soft chorus shimmer
    });
    for (var i = 0; i < 5; i++) bellTone(4000 + Math.random() * 2500, 0.02, 0.2, 0.25 + Math.random() * 0.5); // a few glints
  }
  // Garden sounds: a crunchy dig for tilling, a soft pat and a cheerful bloop for planting, a splash and drips for watering
  function tillSound() {
    if (!audioCtx) return;
    var p = 0.9 + Math.random() * 0.2;
    slideTone('sine', 130 * p, 65 * p, 0.4, 0.12);                   // the hoe thunks into the ground
    hissBurst(0.25, 'lowpass', 700 * p, 0.8, 0.45, 0.004, 0.16);      // a crunchy scoop of earth
    hissBurst(0.15, 'bandpass', 1300 * p, 1.5, 0.18, 0.01, 0.09, 0.03); // the blade scraping through soil
    for (var i = 0; i < 4; i++) {                                     // clods pattering back down
      hissBurst(0.06, 'bandpass', 500 + Math.random() * 600, 2, 0.14, 0.002, 0.04, 0.16 + i * 0.06 + Math.random() * 0.03);
    }
  }
  function findSound() { // you dug something up!
    if (!audioCtx) return;
    bellTone(1568, 0.07, 0.4, 0.3);
    bellTone(2093, 0.07, 0.5, 0.38);
    bellTone(3136, 0.03, 0.4, 0.38);
  }
  function plantSound() {
    if (!audioCtx) return;
    hissBurst(0.1, 'lowpass', 600, 0.7, 0.3, 0.003, 0.06);           // patting the soil down over the seed
    hissBurst(0.1, 'lowpass', 500, 0.7, 0.22, 0.003, 0.06, 0.11);
    slideTone('sine', 420, 760, 0.16, 0.12, 0.2);                     // a cheerful little bloop as it settles in
    bellTone(1760, 0.035, 0.35, 0.3);                                 // and a tiny magic twinkle
  }
  function waterSound() {
    if (!audioCtx) return;
    var t0 = audioCtx.currentTime;
    if (!noiseBuf) hissBurst(0.01, 'lowpass', 100, 1, 0.0002, 0.001, 0.002);  // makes sure the hiss is ready
    var src = audioCtx.createBufferSource(), f = audioCtx.createBiquadFilter(), gain = audioCtx.createGain(); // a soft pouring splash
    src.buffer = noiseBuf;
    f.type = 'bandpass'; f.Q.value = 0.9;
    f.frequency.setValueAtTime(1200, t0);
    f.frequency.linearRampToValueAtTime(2200, t0 + 0.5);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.22, t0 + 0.05);
    gain.gain.setValueAtTime(0.2, t0 + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    src.connect(f); f.connect(gain); gain.connect(audioCtx.destination);
    src.start(t0, Math.random() * 0.3);
    src.stop(t0 + 0.75);
    for (var i = 0; i < 6; i++) {                                     // droplets plinking into the soil
      var when = 0.08 + i * 0.09 + Math.random() * 0.05, fr = 700 + Math.random() * 500;
      slideTone('sine', fr, fr * 2.2, 0.08 * (1 - i / 8), 0.06, when);
    }
  }  function sleepSound() { // a soft, sleepy lullaby: three gentle falling notes
    if (!audioCtx) return;
    [784, 659.3, 523.3].forEach(function (fr, i) { bellTone(fr, 0.06, 1.1, i * 0.35); bellTone(fr * 2, 0.015, 0.7, i * 0.35 + 0.01); });
  }
  function doorSound() { // the front door creaks open and bumps shut
    if (!audioCtx) return;
    var t0 = audioCtx.currentTime;
    var osc = audioCtx.createOscillator(), wob = audioCtx.createOscillator(), wobAmt = audioCtx.createGain();
    var f = audioCtx.createBiquadFilter(), gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t0);
    osc.frequency.linearRampToValueAtTime(420, t0 + 0.35);         // a little rising creak
    wob.frequency.value = 22; wobAmt.gain.value = 18;
    wob.connect(wobAmt); wobAmt.connect(osc.frequency);
    f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 3;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
    osc.connect(f); f.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t0); wob.start(t0);
    osc.stop(t0 + 0.42); wob.stop(t0 + 0.42);
    slideTone('sine', 140, 70, 0.35, 0.12, 0.42);                    // and a soft wooden bump as it closes
    hissBurst(0.08, 'lowpass', 800, 0.7, 0.2, 0.003, 0.05, 0.42);
    bellTone(2093, 0.025, 0.4, 0.46);                                // with a tiny magic chime
  }






  // ---------- Mining rocks ----------
  var HITS_TO_BREAK = 10, COAL_CHANCE = 0.4;
  var mineable = [], rockS = new THREE.Vector3(), rockP = new THREE.Vector3(), rockQ = new THREE.Quaternion();
  rockBatches.forEach(function (rb) {
    rb.list.forEach(function (m4, n) {
      m4.decompose(rockP, rockQ, rockS);
      if (rockP.y < WATER_Y - 0.05) return; // rocks on the lake bed stay put
      var solid = null;
      for (var i = 0; i < solids.length; i++) {
        if (Math.abs(solids[i].x - rockP.x) < 0.001 && Math.abs(solids[i].z - rockP.z) < 0.001) { solid = solids[i]; break; }
      }
      mineable.push({
        mesh: rb.mesh, index: n, orig: m4.clone(), x: rockP.x, z: rockP.z, y: rockP.y,
        size: rockS.x, solid: solid || { x: rockP.x, z: rockP.z, r: 0 }, solidR: solid ? solid.r : 0,
        hits: 0, state: 'whole'
      });
    });
  });
  allScenery = choppable.concat(trimmable);
  function rockInReach() {
    var best = null, bestD = 99;
    mineable.forEach(function (r) {
      if (r.state !== 'whole') return;
      var d = dist(player.position.x, player.position.z, r.x, r.z);
      if (d < r.size * 0.75 + 1.0 && d < bestD) { best = r; bestD = d; }
    });
    return best;
  }
  function mineRock(r) {
    if (swingT < SWING_TIME) return; // still mid-swing
    swingT = 0;
    useStamina(STAMINA_COST.pickaxe);
    swingRock = r;
    facing = Math.atan2(r.x - player.position.x, r.z - player.position.z); // turn to face the rock
  }
  // Puts a rock's instance back with a size (k) and a little offset (for shaking)
  var rockM = new THREE.Matrix4(), rockScaleM = new THREE.Matrix4();
  function setRock(r, k, ox, oz) {
    rockM.copy(r.orig).multiply(rockScaleM.makeScale(k, k, k));
    rockM.elements[12] += ox || 0;
    rockM.elements[14] += oz || 0;
    r.mesh.setMatrixAt(r.index, rockM);
    r.mesh.instanceMatrix.needsUpdate = true;
  }
  // The pickaxe lands: chips fly, the rock shakes, and on the tenth hit it crumbles
  function pickHits(r) {
    if (r.state !== 'whole') return;
    r.hits++;
    clinkSound();
    var hx = r.x - Math.sin(facing) * r.size * 0.5, hz = r.z - Math.cos(facing) * r.size * 0.5;
    burst(hx, r.y + r.size * 0.4, hz, 0xa9a49a, 12, 2.6, 2, -8);  // stone chips
    burst(hx, r.y + r.size * 0.4, hz, 0xfff1c4, 4, 2, 1.5, -4);   // a few sparks
    if (r.hits < HITS_TO_BREAK) { r.shakeT = 0; return; }
    // Crumble! The rock bursts into rubble and sparkles, leaving stone (and maybe coal) behind
    crumbleSound();
    r.state = 'crumbling';
    r.crumbleT = 0;
    burst(r.x, r.y + r.size * 0.3, r.z, 0x8f8c86, 30, 4 * Math.max(0.6, r.size), 2.5, -9);
    var span = 0.9 * Math.max(0.5, r.size);
    sparklePoof(new THREE.Vector3(r.x - span, r.y, r.z), new THREE.Vector3(r.x + span, r.y, r.z), 160);
    var stones = Math.max(2, Math.min(6, Math.round(r.size * 4)));
    for (var i = 0; i < stones; i++) {
      var a = Math.random() * Math.PI * 2, d = 0.3 + Math.random() * (0.6 + r.size * 0.5);
      dropPickup('stone', 1, r.x + Math.cos(a) * d, r.z + Math.sin(a) * d, groundHeight(r.x, r.z), 0.2 + i * 0.06);
    }
    if (Math.random() < COAL_CHANCE) {
      var ca = Math.random() * Math.PI * 2;
      dropPickup('coal', 1, r.x + Math.cos(ca) * 0.7, r.z + Math.sin(ca) * 0.7, groundHeight(r.x, r.z), 0.6);
    }
  }
  function updateRocks(dt) {
    mineable.forEach(function (r) {
      if (r.state === 'whole' && r.shakeT !== undefined) { // a quick shake after each hit
        r.shakeT += dt;
        var sh = r.shakeT < 0.3 ? Math.sin(r.shakeT * 60) * 0.035 * Math.exp(-r.shakeT * 9) : 0;
        setRock(r, 1, sh * Math.cos(facing), -sh * Math.sin(facing));
        if (r.shakeT >= 0.3) r.shakeT = undefined;
      } else if (r.state === 'crumbling') { // shrinks away into the rubble
        r.crumbleT += dt;
        var k = Math.max(0, 1 - r.crumbleT / 0.35);
        setRock(r, k, (Math.random() - 0.5) * 0.05 * k, (Math.random() - 0.5) * 0.05 * k);
        if (k === 0) {
          r.solid.r = 0;
          showHiddenGrass(r.solid, true); // grass grows where the rock was
          r.state = 'regrowing';
          r.brokeAt = gameMinutes();
          r.shownK = -1;
          r.grassHidden = false;
        }
      } else if (r.state === 'regrowing') { // the rock slowly rises back out of the ground over many days
        var days = (gameMinutes() - r.brokeAt) / (24 * 60);
        if (days < SPROUT_DAYS) return;
        if (r.shownK < 0 && soilNear(r.solid.x, r.solid.z, r.solidR)) { r.brokeAt = gameMinutes() - SPROUT_DAYS * 24 * 60; return; } // farmed over: it can't come back
        var g = Math.min(1, (days - SPROUT_DAYS) / (REGROW_DAYS - SPROUT_DAYS));
        var rk = 0.08 + 0.92 * g;
        if (g >= 1 || rk - r.shownK > 0.004) {
          setRock(r, rk);
          r.shownK = rk;
          r.solid.r = r.solidR * rk;
        }
        if (rk > 0.35 && !r.grassHidden) { showHiddenGrass(r.solid, false); r.grassHidden = true; }
        if (g >= 1) { r.state = 'whole'; r.hits = 0; r.solid.r = r.solidR; }
      }
    });
  }

  var fallQ = new THREE.Quaternion();
  function updateTrees(dt) {
    updateLogs(dt);
    var before = swingT;
    swingT += dt;
    // holding the action button (or E / Space) keeps the axe swinging
    if ((actionHeld || keys['KeyE'] || keys['Space']) && swingT >= SWING_TIME) {
      if (heldItem() === 'axe') { var holdTree = treeInReach(); if (holdTree) chopTree(holdTree); }
      if (heldItem() === 'pickaxe') { var holdRock = rockInReach(); if (holdRock) mineRock(holdRock); }
      if (heldItem() === 'trimmers') { var holdBush = bushInReach(); if (holdBush) trimBush(holdBush); }
      if (heldItem() === 'hoe') { var holdTile = targetTile(); if (holdTile && !holdTile.soil) tillTile(holdTile); }
    }
    if (swingTree && before < IMPACT && swingT >= IMPACT) { axeHits(swingTree); swingTree = null; }
    if (swingRock && before < IMPACT && swingT >= IMPACT) { pickHits(swingRock); swingRock = null; }
    updateRocks(dt);
    if (swingBush && before < IMPACT && swingT >= IMPACT) { snipHits(swingBush); swingBush = null; }
    if (swingTile && before < IMPACT && swingT >= IMPACT) { hoeHits(swingTile); swingTile = null; }
    updateTilling(dt);
    allScenery.forEach(function (t) {
      var u = t.userData;
      if (u.state === 'standing' && u.shudderT !== undefined) { // a quick shudder after each hit
        u.shudderT += dt;
        var sh = u.shudderT < 0.45 ? Math.sin(u.shudderT * 38) * 0.035 * Math.exp(-u.shudderT * 7) : 0;
        setTreeTilt(t, sh, Math.sin(facing), Math.cos(facing));
        if (u.shudderT >= 0.45) u.shudderT = undefined;
      }
      if (u.state === 'shrinking') { // a trimmed bush shrinks away into its sparkles
        u.shrinkT += dt;
        var sk = Math.max(0, 1 - u.shrinkT / 0.4);
        setTreeGrowth(t, sk);
        if (sk === 0) {
          u.solid.r = 0;
          showHiddenGrass(u.solid, true);
          u.state = 'regrowing';
          u.felledAt = gameMinutes();
          u.shownK = -1;
          u.grassHidden = false;
        }
      } else if (u.state === 'falling') {
        u.fallT += dt;
        var FALL = 1.6, flat = Math.PI / 2 - 0.05, angle;
        if (u.fallT < FALL) angle = Math.pow(u.fallT / FALL, 2.4) * flat; // slow at first, then faster and faster
        else {
          var tb = u.fallT - FALL;                                          // a little bounce as it lands
          angle = flat - 0.1 * Math.exp(-tb * 5) * Math.abs(Math.sin(tb * 12));
          if (!u.landed) {
            u.landed = true;
            crashSound();
            var reach = (u.leafy ? 2.6 : 2.4) * u.size;
            var tx = u.base.x + u.fallDir.x * reach, tz = u.base.z + u.fallDir.z * reach;
            burst(tx, 0.4, tz, 0x6aa84f, 22, 4, 1.5, -4);   // leaves fly
            burst(tx, 0.2, tz, 0xb59a70, 14, 3, 0.8, -3);   // dust
          }
        }
        u.proxy.quaternion.copy(fallQ.setFromAxisAngle(u.fallAxis, angle));
        if (u.fallT > FALL + 1.8) { // the fallen tree turns into a poof of sparkles and is gone
          if (!u.poofed) {
            u.poofed = true;
            var len = (u.leafy ? 3.6 : 3.4) * u.size;
            sparklePoof(new THREE.Vector3(u.base.x, u.base.y + 0.2, u.base.z),
              new THREE.Vector3(u.base.x + u.fallDir.x * len, u.base.y + 0.2, u.base.z + u.fallDir.z * len), 240);
            dropLogs(u, len);  // logs tumble out of the sparkles, ready to pick up
            var rr = 1.1 * u.size, sx = -u.fallDir.z * rr, sz = u.fallDir.x * rr; // and a poof over the stump and roots
            sparklePoof(new THREE.Vector3(u.base.x - sx, u.base.y + 0.1, u.base.z - sz),
              new THREE.Vector3(u.base.x + sx, u.base.y + 0.1, u.base.z + sz), 110);
          }
          var k = Math.max(0, 1 - (u.fallT - FALL - 1.8) / 0.5);
          u.proxy.scale.setScalar(k);
          setTreeGrowth(t, k, 'ground');                  // roots and the leafy soil patch shrink away
          if (u.stump) u.stump.scale.set(k, k, k);        // and so does the stump
          if (k === 0) {
            scene.remove(u.proxy);
            u.proxy.traverse(function (o) { if (o.isMesh && !o.isInstancedMesh) o.geometry.dispose(); });
            u.proxy = null;
            setTreeGrowth(t, 0);   // the roots and soil patch go too
            scene.remove(u.stump); // and the stump
            u.stump.geometry.dispose();
            u.stump = null;
            u.solid.r = 0;
            showHiddenGrass(u.solid, true);   // plain grass grows where the tree stood
            u.state = 'regrowing';
            u.felledAt = gameMinutes();
            u.shownK = -1;
          }
        }
      } else if (u.state === 'regrowing') { // a new tree grows back slowly over many in-game days
        var days = (gameMinutes() - u.felledAt) / (24 * 60);
        if (days < SPROUT_DAYS) return;
        if (u.shownK < 0 && soilNear(u.solid.x, u.solid.z, u.solidR)) { u.felledAt = gameMinutes() - SPROUT_DAYS * 24 * 60; return; } // farmed over: it can't grow back
        var g = Math.min(1, (days - SPROUT_DAYS) / (REGROW_DAYS - SPROUT_DAYS));
        var k = 0.06 + 0.94 * g;
        if (g >= 1 || k - u.shownK > 0.004) { // only redraw when it has visibly grown, to keep the game fast
          setTreeGrowth(t, k);
          u.shownK = k;
          u.solid.r = u.solidR * k;
        }
        if (k > 0.35 && !u.grassHidden) { showHiddenGrass(u.solid, false); u.grassHidden = true; } // the trunk takes its spot again
        if (g >= 1) { u.state = 'standing'; u.hits = 0; u.solid.r = u.solidR; u.grassHidden = false; }
      }
    });
    // Your arm and axe, and the swing: wind up over your shoulder, chop down hard, recoil, settle
    var held = heldItem();
    var holding = held === 'axe' || held === 'pickaxe' || held === 'trimmers' || held === 'hoe'; // a tool
    axeArm.visible = !!held;   // your arm shows whenever you're holding anything
    toolHandle.visible = holding && held !== 'trimmers'; // the trimmers have their own short handle
    if (held !== heldShown) {  // swap the material in your hand
      heldItemGrp.traverse(function (o) { // free the old item's one-off shapes
        if (o.isMesh && o.geometry !== logGeo && o.geometry !== sapGeo && o.geometry !== coalGeo && o.geometry !== seedMoonGeo && o.geometry !== seedShineGeo && o.geometry !== seedGeo && o.geometry !== sapDripGeo && o.geometry !== sapShineGeo && boulderGeos.indexOf(o.geometry) < 0) o.geometry.dispose();
      });
      while (heldItemGrp.children.length) heldItemGrp.remove(heldItemGrp.children[0]);
      if (held && !holding) {
        var model = pickupModel(held);
        model.scale.setScalar(held === 'wood' ? 0.6 : 1.1);
        if (held === 'seed' || held === 'sap' || held === 'acorn' || held === 'pinecone' || held === 'fiber' || held === 'hay' || held === 'coal') { // these sit upright in your hand
          var palm = new THREE.Group();
          palm.rotation.x = 1.05;               // undoes the arm's angle, so they stand up
          palm.position.y = 0.04;
          model.scale.setScalar(0.95);
          model.position.y = held === 'acorn' ? 0.19 : held === 'pinecone' ? 0.2 : held === 'fiber' ? 0.13 : held === 'hay' ? 0.08 : held === 'coal' ? 0.08 : 0.06; // pointed tips rest in the palm; fiber is held below its twine
          if (held === 'fiber') model.rotation.z = -0.45; // the bundle leans out a little, like it does in the bag
          if (held === 'hay') { model.scale.setScalar(0.75); model.rotation.y = 0.5; } // a smaller bale, turned so you see its side and end
          if (held === 'coal') model.scale.setScalar(0.8); // a lump that fits in your palm
          palm.add(model);
          heldItemGrp.add(palm);
        } else if (held === 'petal') { // pinched at its narrow base, standing up with its cupped face turned out
          var petalUp = new THREE.Group();
          petalUp.rotation.x = 1.05;            // undoes the arm's angle, so the petal points up
          petalUp.position.y = 0.06;
          model.position.y = 0.13;              // the base of the petal is at the hand
          model.rotation.y = -0.6;
          petalUp.add(model);
          heldItemGrp.add(petalUp);
        } else if (held === 'bloom') { // held by the bottom of its stem, with the flower standing up
          var upright = new THREE.Group();
          upright.rotation.x = 1.05;            // undoes the arm's angle, so the flower points up
          upright.position.y = 0.08;            // the stem sits in your hand
          model.position.y = 0.19 * 1.1;        // the bottom of the stem is at the hand
          upright.add(model);
          heldItemGrp.add(upright);
        } else {
          heldItemGrp.add(model);
        }
      }
      heldShown = held;
    }
    axeHeadGrp.visible = heldItem() === 'axe';
    pickHeadGrp.visible = heldItem() === 'pickaxe';
    trimHeadGrp.visible = heldItem() === 'trimmers';
    hoeHeadGrp.visible = heldItem() === 'hoe';
    // the trimmer blades open as you wind up and snap shut as they hit
    var open = swingT < IMPACT ? Math.min(1, swingT / 0.15) : Math.max(0, 1 - (swingT - IMPACT) / 0.05);
    if (swingT >= SWING_TIME) open = 0.3;
    trimBladeA.rotation.x = 0.05 + open * 0.35;
    trimBladeB.rotation.x = -0.05 - open * 0.35;
    var REST = 5.23, UP = 2.35, HIT = 4.75;            // arm angles: carrying, raised up behind you, striking forward over the top
    var armX = REST, armZ = 0, armY = 0, twist = 0, lean = 0, squash = 0, sw = swingT;
    function easeOut(k) { return 1 - (1 - k) * (1 - k); }
    function easeIn(k) { return k * k * k; }
    if (held === 'trimmers' && sw < SWING_TIME) {     // trimmers sweep sideways across the hedge
      var FWD = 4.62, OUT = -1.0, ACROSS = 0.75;       // arm held out in front; how far out to the side, and across
      if (sw < 0.18) {                                  // wind up: swing the trimmers out to your side, blades opening
        var tw = easeOut(sw / 0.18);
        armX = REST + (FWD - REST) * tw; armY = OUT * tw; twist = -0.35 * tw;
      } else if (sw < IMPACT) {                         // sweep across in front, snapping shut
        var tc = easeIn((sw - 0.18) / (IMPACT - 0.18));
        armX = FWD; armY = OUT + (ACROSS - OUT) * tc; twist = -0.35 + 0.65 * tc; lean = 0.08 * tc;
      } else if (sw < 0.36) {                           // a little follow-through
        var tj = (sw - IMPACT) / (0.36 - IMPACT);
        armX = FWD; armY = ACROSS + 0.12 * Math.sin(tj * Math.PI); twist = 0.3; lean = 0.08; squash = 0.5 * Math.sin(tj * Math.PI);
      } else {                                          // settle back
        var tr = easeOut((sw - 0.36) / (SWING_TIME - 0.36));
        armX = FWD + (REST - FWD) * tr; armY = ACROSS * (1 - tr); twist = 0.3 * (1 - tr); lean = 0.08 * (1 - tr);
      }
    } else if (holding && sw < SWING_TIME) {
      if (sw < 0.17) {                                  // wind up: raise the axe back over your shoulder, twisting away
        var w = easeOut(sw / 0.17);
        armX = REST + (UP - REST) * w; armZ = -0.45 * w; twist = -0.42 * w; lean = -0.1 * w;
      } else if (sw < 0.2) {                            // a tiny pause at the top
        armX = UP; armZ = -0.45; twist = -0.42; lean = -0.1;
      } else if (sw < IMPACT) {                         // chop: swing down hard into the trunk
        var c = easeIn((sw - 0.2) / (IMPACT - 0.2));
        armX = UP + (HIT - UP) * c; armZ = -0.45 + 0.7 * c; twist = -0.42 + 0.72 * c; lean = -0.1 + 0.32 * c;
      } else if (sw < 0.36) {                           // the jolt of the hit
        var j = (sw - IMPACT) / (0.36 - IMPACT);
        armX = HIT - 0.2 * Math.sin(j * Math.PI); armZ = 0.25; twist = 0.3; lean = 0.22; squash = Math.sin(j * Math.PI);
      } else {                                          // settle back
        var r = easeOut((sw - 0.36) / (SWING_TIME - 0.36));
        armX = HIT + (REST - HIT) * r; armZ = 0.25 * (1 - r); twist = 0.3 * (1 - r); lean = 0.22 * (1 - r);
      }
    }
    axeArm.rotation.x = armX;
    axeArm.rotation.z = armZ;
    axeArm.rotation.y = armY;   // turns the arm sideways (used by the trimmers' sweep)
    body.rotation.y = twist;
    body.rotation.x = lean;
    body.scale.set(1 + squash * 0.05, 1 - squash * 0.08, 1 + squash * 0.05);
    flushDirty();
  }

  // Trees, bushes and rocks that happen to stand on the path (or where the shipping bin sits) are cleared away for good
  var binSpot = houseToWorld(BIN_X, BIN_Z);
  allScenery.forEach(function (t) {
    var u = t.userData;
    var onBin = dist(u.solid.x, u.solid.z, binSpot.x, binSpot.z) < 1.6 + u.solidR * (trimmable.indexOf(t) >= 0 ? 1.6 : 0.8); // bushes spread wider than their trunk
    if (!onBin && !nearBridgeLanding(u.solid.x, u.solid.z, u.solidR) && pathDist(u.solid.x, u.solid.z) > PATH_W + 0.35 + u.solidR * 0.7) return;
    u.gone = true; u.state = 'gone'; u.solid.r = 0;
    setTreeGrowth(t, 0);
  });
  mineable.forEach(function (r) {
    if (dist(r.x, r.z, binSpot.x, binSpot.z) > 1.4 + r.size && !nearBridgeLanding(r.x, r.z, r.size) && pathDist(r.x, r.z) > PATH_W + 0.3 + r.size * 0.6) return;
    r.gone = true; r.state = 'gone'; r.solid.r = 0;
    setRock(r, 0);
  });
  // Hide grass blades that would poke up through rocks, trunks and bushes
  var hideM = new THREE.Matrix4().makeScale(0, 0, 0), bladeM = new THREE.Matrix4(), bladeP = new THREE.Vector3();
  for (var gb = 0; gb < grass.count; gb++) {
    grass.getMatrixAt(gb, bladeM);
    bladeP.setFromMatrixPosition(bladeM);
    if (pathDist(bladeP.x, bladeP.z) < PATH_W + 0.1) { grass.setMatrixAt(gb, hideM); continue; } // bare dirt on the paths
    for (var sg = 0; sg < solids.length; sg++) {
      var gdx = bladeP.x - solids[sg].x, gdz = bladeP.z - solids[sg].z, gr2 = solids[sg].r;
      if (gdx * gdx + gdz * gdz < gr2 * gr2) {
        (solids[sg].grass = solids[sg].grass || []).push({ i: gb, m: bladeM.clone() }); // remembered, so it can grow back
        grass.setMatrixAt(gb, hideM);
        break;
      }
    }
  }
  grass.instanceMatrix.needsUpdate = true;
  for (var fl = 0; fl < flowerHeads.count; fl++) { // same for the wildflowers
    flowerHeads.getMatrixAt(fl, bladeM);
    bladeP.setFromMatrixPosition(bladeM);
    if (pathDist(bladeP.x, bladeP.z) < PATH_W + 0.2) { flowerHeads.setMatrixAt(fl, hideM); flowerStems.setMatrixAt(fl, hideM); continue; } // none on the path
    for (var sf = 0; sf < solids.length; sf++) {
      if (dist(bladeP.x, bladeP.z, solids[sf].x, solids[sf].z) < solids[sf].r + 0.1) {
        (solids[sf].flowers = solids[sf].flowers || []).push({ i: fl, m: bladeM.clone() });
        flowerHeads.setMatrixAt(fl, hideM);
        flowerStems.setMatrixAt(fl, hideM);
        break;
      }
    }
  }
  flowerHeads.instanceMatrix.needsUpdate = flowerStems.instanceMatrix.needsUpdate = true;
  // Brings back (show = true) or hides again the grass and flowers that were under a tree's trunk
  function showHiddenGrass(solid, show) {
    (solid.grass || []).forEach(function (b) { grass.setMatrixAt(b.i, show ? b.m : hideM); });
    (solid.flowers || []).forEach(function (f) {
      flowerHeads.setMatrixAt(f.i, show ? f.m : hideM);
      flowerStems.setMatrixAt(f.i, show ? f.m : hideM);
    });
    grass.instanceMatrix.needsUpdate = true;
    flowerHeads.instanceMatrix.needsUpdate = flowerStems.instanceMatrix.needsUpdate = true;
  }
  // Batches of grass, leaves, flowers and rocks are spread all over, so always draw them
  // (three.js would otherwise skip a whole batch when the middle of the island is off screen)
  scene.traverse(function (o) { if (o.isInstancedMesh) o.frustumCulled = false; });
  seed = seedBeforeForest;

  // ---------- Sparkles round the Dawn Tree ----------
  function makePoints(count, color, size) {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: color, size: size, transparent: true, depthWrite: false }));
    scene.add(pts);
    return pts;
  }
  var sparkles = makePoints(40, 0xfff1a8, 0.16);
  sparkles.position.set(TREE_X, 0, TREE_Z);

  // ---------- Fireflies at night ----------
  // Each firefly has a soft glowing halo and a bright little centre, and blinks at its own pace
  var flyGlowTex = radialAlphaTex([[0, 1], [0.2, 0.6], [0.5, 0.15], [1, 0]]);
  var FLY_COUNT = 180;
  function fireflyLayer(size) {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(FLY_COUNT * 3), 3));
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(FLY_COUNT * 3), 3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({
      map: flyGlowTex, size: size, vertexColors: true, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    pts.frustumCulled = false;
    scene.add(pts);
    return pts;
  }
  var fireflies = fireflyLayer(1.2);      // soft glowing halo
  var fireflyCores = fireflyLayer(0.26);  // bright little centre
  // mostly yellow-green and gold, with a few magical pink and blue ones
  var FLY_TINTS = [0xd9ff6e, 0xeaff8a, 0xffe27a, 0xc6ff5e, 0xffb3f0, 0x9fe6ff].map(function (c) { return new THREE.Color(c); });
  var flyHome = [];
  for (var f = 0; f < 60; f++) {
    var fa = rand() * Math.PI * 2, fr = rand() * WALK_R;
    flyHome.push({ x: Math.cos(fa) * fr, z: Math.sin(fa) * fr, y: 0.5 + rand() * 2.5, p: rand() * 10 });
  }
  while (flyHome.length < FLY_COUNT) { // more fireflies across the outer land
    var ofh = outerSpot(2);
    if (ofh) flyHome.push({ x: ofh.x, z: ofh.z, y: 0.5 + outerRand() * 2.5, p: outerRand() * 10 });
  }

  // ---------- Garden tiles and crops ----------
  // The whole island is farm land: it's split into a grid of tiles (lined up with the starting garden), and a tile
  // is only remembered once you till it. Anywhere open can be tilled, including where a tree, rock or bush used to be.
  var tiles = [], tileMap = {}, spareTile = null;
  function tileKey(c, r) { return c + ',' + r; }
  function makeTile(c, r) {
    return { c: c, r: r, x: FARM_X + (c + 0.5) * TILE, z: FARM_Z + (r + 0.5) * TILE, soil: null, crop: null, drop: null, stage: 0, growth: 0, wet: false };
  }
  function keepTile(tile) {                                   // a tile you've tilled is remembered from now on
    var key = tileKey(tile.c, tile.r);
    if (tileMap[key]) return tileMap[key];
    tileMap[key] = tile;
    tiles.push(tile);
    return tile;
  }
  function inHouseYard(x, z) {                                // inside the farmhouse's picket fence
    var dx = x - HOUSE_X, dz = z - HOUSE_Z, c = Math.cos(HOUSE_TURN), s = Math.sin(HOUSE_TURN);
    var lx = dx * c - dz * s, lz = dx * s + dz * c;
    return lx > FENCE_L - 0.7 && lx < FENCE_R + 0.7 && lz > FENCE_B - 0.7 && lz < FENCE_F + 0.7;
  }
  function canFarm(x, z) {                                    // is this tile's spot open ground you could till?
    if (onIsle2(x, z, -2)) return false;                       // never on the new island: that's for the town square
    if (nearBridgeLanding(x, z, 0)) return false;              // or where the bridge lands
    if (onBridge(x, z) || (Math.abs(x - BRIDGE_X) < BRIDGE_W / 2 + TILE && z > BRIDGE_Z0 - 2 && z < BRIDGE_Z1 + 2)) return false; // or on the bridge itself
    var h = TILE / 2;
    var corners = [[x - h, z - h], [x + h, z - h], [x - h, z + h], [x + h, z + h], [x, z]];
    for (var k = 0; k < corners.length; k++) {
      var cx = corners[k][0], cz = corners[k][1];
      if (!onIsland(cx, cz) || onDock(cx, cz) || groundHeight(cx, cz) < -0.02) return false; // not in the lake, on the dock or off the edge
    }
    if (dist(x, z, TREE_X, TREE_Z) < TREE_ZONE + 1.2) return false;   // the Dawn Tree's glade stays as it is
    if (inHouseYard(x, z)) return false;                               // and so does the farmhouse yard
    for (var i = 0; i < solids.length; i++) {                         // nothing standing in the way: trees, rocks, bushes, fence posts...
      var sd = solids[i];
      if (sd.r > 0 && dist(x, z, sd.x, sd.z) < sd.r + TILE * 0.65) return false;
    }
    return true;
  }
  function tileAt(x, z) {
    if (indoors) return null;
    var c = Math.floor((x - FARM_X) / TILE), r = Math.floor((z - FARM_Z) / TILE);
    var known = tileMap[tileKey(c, r)];
    if (known) return known;
    if (!spareTile || spareTile.c !== c || spareTile.r !== r) spareTile = makeTile(c, r); // a fresh, untilled tile
    return canFarm(spareTile.x, spareTile.z) ? spareTile : null;
  }
  function tileByKey(c, r) { return tileMap[tileKey(c, r)] || keepTile(makeTile(c, r)); }
  function soilNear(x, z, r) {                                // is there tilled soil over this spot? (then nothing grows back here)
    for (var i = 0; i < tiles.length; i++) {
      var t = tiles[i];
      if (t.soil && Math.abs(t.x - x) < r + TILE / 2 && Math.abs(t.z - z) < r + TILE / 2) return true;
    }
    return false;
  }
  function coverGrass(tile) {                                 // tuck away the grass and wildflowers under a tilled tile
    var h = TILE * 0.5, m = new THREE.Matrix4(), p = new THREE.Vector3();
    tile.grass = [];
    for (var gi = 0; gi < grass.count; gi++) {
      grass.getMatrixAt(gi, m);
      if (m.elements[0] === 0 && m.elements[5] === 0) continue;       // already hidden
      p.setFromMatrixPosition(m);
      if (Math.abs(p.x - tile.x) < h && Math.abs(p.z - tile.z) < h) { tile.grass.push({ i: gi, m: m.clone(), f: false }); grass.setMatrixAt(gi, hideM); }
    }
    for (var fi = 0; fi < flowerHeads.count; fi++) {
      flowerHeads.getMatrixAt(fi, m);
      if (m.elements[0] === 0 && m.elements[5] === 0) continue;
      p.setFromMatrixPosition(m);
      if (Math.abs(p.x - tile.x) < h && Math.abs(p.z - tile.z) < h) { tile.grass.push({ i: fi, m: m.clone(), f: true }); flowerHeads.setMatrixAt(fi, hideM); flowerStems.setMatrixAt(fi, hideM); }
    }
    grass.instanceMatrix.needsUpdate = true;
    flowerHeads.instanceMatrix.needsUpdate = flowerStems.instanceMatrix.needsUpdate = true;
  }
  function uncoverGrass(tile) {                               // and bring it back if the soil goes
    (tile.grass || []).forEach(function (b) {
      if (b.f) { flowerHeads.setMatrixAt(b.i, b.m); flowerStems.setMatrixAt(b.i, b.m); } else grass.setMatrixAt(b.i, b.m);
    });
    tile.grass = [];
    grass.instanceMatrix.needsUpdate = true;
    flowerHeads.instanceMatrix.needsUpdate = flowerStems.instanceMatrix.needsUpdate = true;
  }

  // ---- Tilled soil: a soft mound of crumbly earth with three lumpy furrows and a few pebbles ----
  function soilHash(n) { var v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); }
  var soilTex = paintTexture(128, 128, function (g, w, h) {
    g.fillStyle = '#8c5d3c'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 900; i++) {                                   // crumbly grains, darker and lighter
      var gx = soilHash(i * 3.1) * w, gy = soilHash(i * 7.3) * h, gr = 0.6 + soilHash(i * 1.7) * 1.6, light = soilHash(i * 5.9);
      g.fillStyle = light < 0.5 ? 'rgba(60,34,18,' + (0.25 + light * 0.5) + ')' : 'rgba(190,140,100,' + ((light - 0.5) * 0.6) + ')';
      g.beginPath(); g.arc(gx, gy, gr, 0, Math.PI * 2); g.fill();
    }
    for (var c = 0; c < 40; c++) {                                    // little clods with a lit top and a shadow underneath
      var cx = soilHash(c * 9.7) * w, cy = soilHash(c * 4.3) * h, cr = 2 + soilHash(c * 2.2) * 3;
      g.fillStyle = 'rgba(50,28,14,0.45)'; g.beginPath(); g.ellipse(cx + 0.8, cy + 1.2, cr, cr * 0.75, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#9a6a46'; g.beginPath(); g.ellipse(cx, cy, cr, cr * 0.75, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(220,170,120,0.35)'; g.beginPath(); g.ellipse(cx - cr * 0.3, cy - cr * 0.3, cr * 0.45, cr * 0.3, 0, 0, Math.PI * 2); g.fill();
    }
    for (var s2 = 0; s2 < 14; s2++) {                                 // tiny grey stones
      g.fillStyle = soilHash(s2 * 6.6) < 0.5 ? '#a8a29a' : '#7f786f';
      g.beginPath(); g.arc(soilHash(s2 * 8.8) * w, soilHash(s2 * 3.9) * h, 1 + soilHash(s2) * 1.2, 0, Math.PI * 2); g.fill();
    }
  });
  M.soilDry = new THREE.MeshStandardMaterial({ map: soilTex, vertexColors: true, roughness: 0.97 });
  M.soilWet = new THREE.MeshStandardMaterial({ map: soilTex, vertexColors: true, color: 0x7a5c50, roughness: 0.45, metalness: 0.05 }); // dark and glistening
  var SOIL_W = TILE * 0.94, SOIL_H = 0.1;
  var soilGeo = (function () {                                        // a mound with a flat-ish top and soft rounded edges that sink into the grass
    var g = new THREE.PlaneGeometry(SOIL_W, SOIL_W, 14, 14);
    g.rotateX(-Math.PI / 2);
    var p = g.attributes.position, cols = [], half = SOIL_W / 2;
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), z = p.getZ(i);
      var e = Math.min(half - Math.abs(x), half - Math.abs(z)) / 0.16; // how far in from the edge
      var k = Math.min(1, Math.max(0, e)); k = k * k * (3 - 2 * k);
      var lump = (Math.sin(x * 23 + z * 7) + Math.sin(z * 19 - x * 11)) * 0.006;
      p.setY(i, (SOIL_H + lump) * k);
      var shade = 0.62 + 0.38 * k + lump * 4;                          // darker and damper at the edges
      cols.push(shade, shade * 0.97, shade * 0.95);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  })();
  var ridgeGeo = (function () {                                       // a lumpy furrow with rounded ends, lying across the plot
    var len = TILE * 0.8, g = new THREE.CylinderGeometry(0.1, 0.1, len, 12, 12, false, 0, Math.PI);
    var p = g.attributes.position, cols = [];
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = y / (len / 2);
      var taper = Math.sqrt(Math.max(0, 1 - Math.pow(Math.abs(t), 5)));
      var wob = 1 + 0.14 * Math.sin(y * 31 + Math.atan2(z, x) * 3) + 0.08 * Math.sin(y * 57);
      p.setXYZ(i, x * taper * wob, y, z * taper * wob);
      var sh = 0.72 + 0.28 * Math.max(0, x / 0.1);                    // the tops of the furrows catch the light
      cols.push(sh, sh * 0.97, sh * 0.95);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.rotateZ(Math.PI / 2);                                           // lying across the plot, its rounded back up
    g.computeVertexNormals();
    return g;
  })();
  var pebbleGeo = new THREE.DodecahedronGeometry(0.035, 0);
  var pebbleMats = [new THREE.MeshStandardMaterial({ color: 0xa9a39b, roughness: 0.8 }), new THREE.MeshStandardMaterial({ color: 0x7d766e, roughness: 0.85 })];
  function buildSoil(tile, rising) {                                  // the soil, furrows and pebbles for one tilled tile
    var seedN = tile.c * 31.7 + tile.r * 17.3;
    tile.soil = place(new THREE.Mesh(soilGeo, M.soilDry), tile.x, 0.005, tile.z);
    tile.soil.rotation.y = soilHash(seedN) < 0.5 ? 0 : Math.PI;       // so neighbouring tiles don't look identical
    tile.soil.receiveShadow = true;
    tile.ridges = [];
    for (var r = 0; r < 3; r++) {
      var ridge = place(new THREE.Mesh(ridgeGeo, M.soilDry), (soilHash(seedN + r) - 0.5) * 0.06, SOIL_H - 0.03, (r - 1) * TILE * 0.29, tile.soil);
      ridge.rotation.y = (soilHash(seedN + r * 3) - 0.5) * 0.06;
      if (rising) ridge.scale.set(1, 0.001, 1);
      tile.ridges.push(ridge);
    }
    var count = 2 + Math.floor(soilHash(seedN + 9) * 3);
    for (var pb = 0; pb < count; pb++) {
      var peb = place(new THREE.Mesh(pebbleGeo, pebbleMats[pb % 2]), (soilHash(seedN + pb * 5.1) - 0.5) * SOIL_W * 0.75, SOIL_H + 0.03, (soilHash(seedN + pb * 7.7) - 0.5) * SOIL_W * 0.75, tile.soil);
      peb.userData.pebble = true;
      peb.rotation.set(pb, pb * 2, 0);
      peb.scale.set(1, 0.6, 0.8 + soilHash(seedN + pb) * 0.5);
    }
  }
  var stemGeo = new THREE.CylinderGeometry(0.035, 0.05, 1, 6);
  stemGeo.translate(0, 0.5, 0);
  var ballGeo = new THREE.SphereGeometry(0.1, 10, 8);
  var dropGeo = new THREE.SphereGeometry(0.08, 10, 8);

  // ---- Moonbloom crops: four detailed growth stages ----
  // a shaped blade (leaf or petal) along +x, curving up at the tip and cupped at the edges, shaded from base to tip
  function bladeGeo(len, wide, cup, edgeLift, inner, outer, vein) {
    var g = new THREE.PlaneGeometry(1, 1, 4, 10), p = g.attributes.position, cols = [], cIn = new THREE.Color(inner), cOut = new THREE.Color(outer), c = new THREE.Color();
    for (var i = 0; i < p.count; i++) {
      var t = p.getY(i) + 0.5, across = p.getX(i) * 2;               // t: 0 at the base, 1 at the tip
      var w = wide * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.6);
      var z = across * w;
      p.setXYZ(i, t * len, cup * t * t + z * z * edgeLift, z);
      c.copy(cIn).lerp(cOut, Math.pow(t, 1.2));
      if (vein && Math.abs(across) < 0.2) c.multiplyScalar(0.8);    // a darker vein down the middle
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  }
  var cropLeafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.7, side: THREE.DoubleSide });
  var cropPetalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, emissive: 0xff6fcf, emissiveIntensity: 0.3, roughness: 0.45, side: THREE.DoubleSide });
  var cropStemMat = new THREE.MeshStandardMaterial({ color: 0x5aa84a, roughness: 0.75 });
  var cropStamenMat = new THREE.MeshStandardMaterial({ color: 0xffe9a8, emissive: 0xffc94d, emissiveIntensity: 0.8, roughness: 0.4 });
  var cropGlowMat = new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xff9be0, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false });
  var seedLeafGeo = bladeGeo(0.09, 0.05, 0.015, 1.5, 0x7ed37a, 0xa8e890, false);       // the two round baby leaves of a sprout
  var cropLeafGeo = bladeGeo(0.26, 0.09, 0.05, 2.2, 0x3f8a3c, 0x8ad87a, true);          // proper pointed leaves
  var cropBackPetal = bladeGeo(0.17, 0.075, 0.05, 2.4, 0xb47cff, 0xf3e3ff, false);     // the flower: lavender back petals...
  var cropFrontPetal = bladeGeo(0.14, 0.068, 0.07, 2.4, 0xff6fcf, 0xffe6f6, false);    // ...and pink front ones
  var sepalGeo = bladeGeo(0.09, 0.03, 0.06, 2, 0x4f9a48, 0x7ec86a, false);             // the little green cup round a bud
  var cropBudGeo = (function () {                                      // a closed teardrop bud, lavender at the base, pink at the tip
    var pts = [];
    for (var i = 0; i <= 12; i++) { var t = i / 12; pts.push(new THREE.Vector2(Math.max(0.001, 0.07 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.8)), t * 0.2)); }
    var g = new THREE.LatheGeometry(pts, 14), p = g.attributes.position, cols = [], a = new THREE.Color(0xc89cf8), b = new THREE.Color(0xff8fd8), c = new THREE.Color();
    for (var j = 0; j < p.count; j++) {
      var ang = Math.atan2(p.getZ(j), p.getX(j)), tw = p.getY(j) / 0.2;
      c.copy(a).lerp(b, tw); c.multiplyScalar(0.9 + 0.1 * Math.cos(ang * 5 + tw * 3)); // faint twisted petal seams
      cols.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    g.computeVertexNormals();
    return g;
  })();
  var cropStemGeo = new THREE.CylinderGeometry(0.012, 0.018, 1, 6);
  cropStemGeo.translate(0, 0.5, 0);
  function leafPair(parent, y, size, turn, droop) {                    // two leaves opposite each other on the stem
    [0, Math.PI].forEach(function (side) {
      var lf = new THREE.Mesh(cropLeafGeo, cropLeafMat);
      lf.position.y = y; lf.rotation.set(0, turn + side, droop); lf.scale.setScalar(size);
      parent.add(lf);
    });
  }
  function makeCrop(tile) {
    var crop = new THREE.Group(), stages = [];
    // 0: a sprout: two round seed leaves on a tiny stem, with the pearly seed shell still poking out of the soil
    var s0 = new THREE.Group();
    var st0 = new THREE.Mesh(cropStemGeo, cropStemMat); st0.scale.set(0.8, 0.1, 0.8); st0.rotation.z = 0.12; s0.add(st0);
    [0, Math.PI].forEach(function (side) { var sl = new THREE.Mesh(seedLeafGeo, cropLeafMat); sl.position.set(-0.012, 0.1, 0); sl.rotation.set(0, side, 0.35); s0.add(sl); });
    var shell = new THREE.Mesh(seedGeo, seedMat); shell.position.set(0.06, 0.005, 0.03); shell.rotation.set(1.2, 0, 0.5); shell.scale.setScalar(0.6); s0.add(shell);
    var tw0 = new THREE.Sprite(cropGlowMat); tw0.position.y = 0.12; tw0.scale.set(0.15, 0.15, 1); s0.add(tw0);
    stages.push(s0);
    // 1: a young plant: a slim stem with two pairs of leaves and a little curled tip
    var s1 = new THREE.Group();
    var st1 = new THREE.Mesh(cropStemGeo, cropStemMat); st1.scale.set(1, 0.28, 1); s1.add(st1);
    leafPair(s1, 0.08, 0.75, 0, 0.25); leafPair(s1, 0.17, 0.6, Math.PI / 2, 0.45);
    [0, Math.PI].forEach(function (side) { var tl = new THREE.Mesh(seedLeafGeo, cropLeafMat); tl.position.y = 0.27; tl.rotation.set(0, side + 0.8, 1.0); tl.scale.setScalar(0.7); s1.add(tl); });
    stages.push(s1);
    // 2: budding: taller, three pairs of leaves, and a closed pink bud in a green cup, glowing softly
    var s2 = new THREE.Group();
    var st2 = new THREE.Mesh(cropStemGeo, cropStemMat); st2.scale.set(1.1, 0.5, 1.1); s2.add(st2);
    leafPair(s2, 0.08, 1, 0, 0.15); leafPair(s2, 0.2, 0.85, Math.PI / 2, 0.3); leafPair(s2, 0.32, 0.65, Math.PI / 4, 0.55);
    var bud = new THREE.Mesh(cropBudGeo, cropPetalMat); bud.position.y = 0.49; s2.add(bud);
    for (var sp = 0; sp < 5; sp++) { var se = new THREE.Mesh(sepalGeo, cropLeafMat); se.position.y = 0.5; se.rotation.set(0, sp / 5 * Math.PI * 2, 1.1); s2.add(se); }
    var g2 = new THREE.Sprite(cropGlowMat); g2.position.y = 0.6; g2.scale.set(0.35, 0.35, 1); s2.add(g2);
    stages.push(s2);
    // 3: in bloom: two rings of cupped petals, a golden heart with stamens and a crescent moon, and a soft glow
    var s3 = new THREE.Group();
    var st3 = new THREE.Mesh(cropStemGeo, cropStemMat); st3.scale.set(1.2, 0.62, 1.2); s3.add(st3);
    leafPair(s3, 0.08, 1.1, 0, 0.1); leafPair(s3, 0.22, 0.95, Math.PI / 2, 0.25); leafPair(s3, 0.36, 0.75, Math.PI / 4, 0.45);
    var head = new THREE.Group(); head.position.y = 0.62; head.rotation.x = 0.25; head.scale.setScalar(1.3); s3.add(head);
    for (var pi = 0; pi < 12; pi++) {
      var back = pi < 6, pet = new THREE.Mesh(back ? cropBackPetal : cropFrontPetal, cropPetalMat);
      pet.rotation.set(0, (pi % 6) / 6 * Math.PI * 2 + (back ? Math.PI / 6 : 0), back ? 0.12 : 0.36);
      pet.position.y = back ? -0.006 : 0.006;
      head.add(pet);
    }
    var heart = new THREE.Mesh(ballGeo, M.center); heart.scale.set(0.38, 0.22, 0.38); heart.position.y = 0.02; head.add(heart);
    for (var sm = 0; sm < 9; sm++) {
      var sa = sm / 9 * Math.PI * 2, stamen = new THREE.Mesh(ballGeo, cropStamenMat);
      stamen.scale.setScalar(0.08); stamen.position.set(Math.cos(sa) * 0.045, 0.04, Math.sin(sa) * 0.045); head.add(stamen);
    }
    var moon = new THREE.Mesh(seedMoonGeo, seedMoonMat); moon.scale.setScalar(1.4); moon.position.set(0, 0.055, 0.005); moon.rotation.set(-1.0, 0, 0.7); head.add(moon);
    var g3 = new THREE.Sprite(cropGlowMat); g3.position.y = 0.66; g3.scale.set(0.6, 0.6, 1); s3.add(g3);
    stages.push(s3);
    stages.forEach(function (sg) { sg.traverse(function (o) { if (o.isMesh) { o.castShadow = true; } }); crop.add(sg); });
    [s1, s2, s3].forEach(function (sg, n) {                         // a little rosette of leaves at the base, fuller as it grows
      for (var r = 0; r < 4 + n; r++) { var rl = new THREE.Mesh(cropLeafGeo, cropLeafMat); rl.position.y = 0.01; rl.rotation.set(0, r / (4 + n) * Math.PI * 2 + 0.4, -0.15); rl.scale.setScalar(0.7 + n * 0.12); sg.add(rl); }
    });
    crop.scale.setScalar(1.35);                                        // a good size in the garden bed
    crop.userData = { stages: stages };
    crop.position.set(tile.x, 0.12, tile.z);
    crop.rotation.y = Math.random() * Math.PI * 2;
    scene.add(crop);
    return crop;
  }

  function showStage(tile) {
    tile.crop.userData.stages.forEach(function (sg, i) { sg.visible = i === tile.stage; });
  }

  function farmDay() { return state.day - (state.minutes < 6 * 60 ? 1 : 0); } // a farm day runs from 6 am to 6 am
  function setWet(tile, wet) {
    tile.wet = wet;
    if (wet) tile.wetDay = farmDay();           // watered soil stays wet until 6 am tomorrow
    if (tile.soil) tile.soil.traverse(function (o) { if (o.isMesh && !o.userData.pebble) o.material = wet ? M.soilWet : M.soilDry; }); // (the pebbles stay pebbles)
  }

  // ---------- The mage (you!) ----------
  var player = new THREE.Group();
  var body = new THREE.Group();
  player.add(body);
  place(new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.4, 0.75, 16), M.robe), 0, 0.375, 0, body);
  place(new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), M.skin), 0, 0.98, 0, body);
  place(new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.04, 24), M.hat), 0, 1.16, 0, body);
  place(new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.65, 20), M.hat), 0, 1.48, -0.04, body).rotation.x = -0.18;
  var hatStar = place(new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), M.star), 0, 1.42, 0.22, body);
  var eyeGeo = new THREE.SphereGeometry(0.04, 8, 6);
  place(new THREE.Mesh(eyeGeo, M.eye), -0.1, 1.0, 0.24, body);
  place(new THREE.Mesh(eyeGeo, M.eye), 0.1, 1.0, 0.24, body);
  // Your arm holding the axe, shown while the axe is selected in the hotbar. It swings from the shoulder;
  // the arm and the axe handle point straight down from the shoulder before any rotation
  var axeArm = new THREE.Group();
  axeArm.rotation.order = 'YXZ'; // so turning sideways (y) swings the whole arm round, wherever it's pointing
  axeArm.position.set(-0.27, 0.68, 0.02);
  body.add(axeArm);
  var sleeve = new THREE.CylinderGeometry(0.075, 0.09, 0.32, 10);
  sleeve.translate(0, -0.16, 0);
  place(new THREE.Mesh(sleeve, M.robe), 0, 0, 0, axeArm);
  place(new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), M.skin), 0, -0.34, 0, axeArm);  // hand
  var handleGeo = new THREE.CylinderGeometry(0.024, 0.03, 0.62, 8);
  handleGeo.translate(0, -0.31, 0);
  var toolHandle = place(new THREE.Mesh(handleGeo, new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.8 })), 0, -0.3, 0, axeArm);
  // whatever material you've selected is held in your hand
  var heldItemGrp = new THREE.Group(), heldShown = null;
  heldItemGrp.position.set(0, -0.44, 0.02);
  axeArm.add(heldItemGrp);
  var axeMetal = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.7, roughness: 0.35 });
  var axeHeadGrp = new THREE.Group(), pickHeadGrp = new THREE.Group(), trimHeadGrp = new THREE.Group();
  axeArm.add(axeHeadGrp);
  axeArm.add(pickHeadGrp);
  axeArm.add(trimHeadGrp);
  // hoe: a flat blade set at a right angle to the handle
  var hoeHeadGrp = new THREE.Group();
  axeArm.add(hoeHeadGrp);
  // a chunky blade, widening toward a sharp edge: blue steel near the handle, polished silver at the edge
  function hoeBladeGeometry() {
    var sh = new THREE.Shape(), L = 0.21;
    sh.moveTo(-0.06, 0); sh.lineTo(0.06, 0);
    sh.lineTo(0.1, L * 0.9); sh.quadraticCurveTo(0.102, L, 0.09, L);
    sh.lineTo(-0.09, L); sh.quadraticCurveTo(-0.102, L, -0.1, L * 0.9);
    sh.closePath();
    var depth = 0.036;
    var g = new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2, curveSegments: 8 });
    var p = g.attributes.position, col = [];
    for (var i = 0; i < p.count; i++) {
      var y = p.getY(i), z = p.getZ(i) - depth / 2;
      p.setZ(i, z * (y > L * 0.7 ? Math.max(0.2, 1 - (y - L * 0.7) / (L * 0.32)) : 1)); // thins to a sharp edge
      var k = Math.min(1, Math.max(0, (y - L * 0.62) / (L * 0.2)));                      // blue → silver
      col.push(0.55 + 0.42 * k, 0.68 + 0.3 * k, 0.98 + 0.02 * k);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.rotateX(-Math.PI / 2); // lies flat, reaching forward from the handle
    g.computeVertexNormals();
    return g;
  }
  var hoeSteel = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.3, roughness: 0.3, emissive: 0x1a2438, vertexColors: true });
  place(new THREE.Mesh(hoeBladeGeometry(), hoeSteel), 0, -0.86, -0.025, hoeHeadGrp);
  var hoeSlot = place(new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshStandardMaterial({ color: 0x4a5370, roughness: 0.6 })), 0, -0.845, -0.1, hoeHeadGrp);
  hoeSlot.scale.set(0.035, 0.006, 0.011); // the oval slot on top of the blade
  // blue socket gripping the handle, a silver collar, and a round wooden cap on the end
  place(new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.09, 0.075), new THREE.MeshStandardMaterial({ color: 0x5f86d4, metalness: 0.3, roughness: 0.35, emissive: 0x101c38 })), 0, -0.86, 0, hoeHeadGrp);
  var hoeCollar = place(new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.011, 8, 16), new THREE.MeshStandardMaterial({ color: 0xe6ebf2, metalness: 0.5, roughness: 0.25 })), 0, -0.915, 0, hoeHeadGrp);
  hoeCollar.rotation.x = Math.PI / 2;
  place(new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.04, 0.035, 16), new THREE.MeshStandardMaterial({ color: 0xc98a4e, roughness: 0.7 })), 0, -0.945, 0, hoeHeadGrp); // wooden cap
  // leather grip wrapped round the handle where you hold it
  place(new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.16, 12), new THREE.MeshStandardMaterial({ color: 0x4a2c1a, roughness: 0.9 })), 0, -0.42, 0, hoeHeadGrp);
  for (var hw = 0; hw < 4; hw++) {
    var hwrap = place(new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.007, 6, 14), new THREE.MeshStandardMaterial({ color: 0x7a4c30, roughness: 0.85 })), 0, -0.36 - hw * 0.04, 0, hoeHeadGrp);
    hwrap.rotation.x = Math.PI / 2 + 0.35;
  }
  // hedge trimmers: two long blades that pivot open and closed at a bolt
  // a wide blade: straight back, wavy cutting edge, sharp point; thins to a bright edge
  function trimBladeGeometry(side) {
    var sh = new THREE.Shape(), L = 0.44;
    sh.moveTo(-0.03, 0.02);                              // back of the blade, near the pivot
    sh.lineTo(-0.032, -L * 0.62);
    sh.quadraticCurveTo(-0.025, -L * 0.9, 0.012, -L);    // the back sweeps in to a sharp point
    sh.lineTo(0.03, -L * 0.72);                          // a keen straight edge off the point
    for (var k = 1; k <= 6; k++) {                       // then a wavy cutting edge back toward the pivot
      var y = -L * 0.72 + k * (L * 0.72 / 6);
      sh.quadraticCurveTo(0.03 + (k % 2 ? 0.012 : -0.003), y - L * 0.06, 0.03, y);
    }
    sh.lineTo(0.03, 0.02);
    sh.closePath();
    var depth = 0.016;
    var g = new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 1, curveSegments: 10 });
    var p = g.attributes.position, col = [];
    for (var i = 0; i < p.count; i++) {
      var w = p.getX(i), z = p.getZ(i) - depth / 2;
      var thin = w > 0 ? Math.max(0.15, 1 - w / 0.038) : 1;   // thins toward the cutting edge
      p.setZ(i, z * thin);
      var shine = w > 0.018 ? 1.18 : 0.8 + (p.getY(i) < -0.3 ? 0.1 : 0);
      col.push(shine, shine, shine * 1.04);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.rotateY(-Math.PI / 2);                              // the blade's width now runs front to back
    if (side < 0) g.scale(1, 1, -1);                      // the other blade is a mirror image, edges facing each other
    g.computeVertexNormals();
    return g;
  }
  var trimSteel = new THREE.MeshStandardMaterial({ color: 0xdfe5ec, metalness: 0.3, roughness: 0.3, emissive: 0x2a3038, vertexColors: true, side: THREE.DoubleSide });
  var trimBladeA = new THREE.Group(), trimBladeB = new THREE.Group();
  [trimBladeA, trimBladeB].forEach(function (blade, n) {
    blade.position.set(n ? -0.012 : 0.012, -0.6, 0);
    place(new THREE.Mesh(trimBladeGeometry(n ? -1 : 1), trimSteel), 0, 0, 0, blade);
    trimHeadGrp.add(blade);
  });
  // shiny gold pivot bolt with a dark rim
  var trimBolt = place(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.065, 16), new THREE.MeshStandardMaterial({ color: 0xe8b24a, metalness: 0.6, roughness: 0.3, emissive: 0x3a2808 })), 0, -0.6, 0, trimHeadGrp);
  trimBolt.rotation.z = Math.PI / 2;
  var trimRim = place(new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.006, 6, 16), new THREE.MeshStandardMaterial({ color: 0x7a5a12, roughness: 0.5 })), 0, -0.6, 0, trimHeadGrp);
  trimRim.rotation.y = Math.PI / 2;
  // two handles, one on each blade: they go back from the bolt to your hand and open and close with the blades
  var trimWood = new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.8 });
  var trimGripMat = new THREE.MeshStandardMaterial({ color: 0xd8463a, roughness: 0.6 });
  var trimRidgeMat = new THREE.MeshStandardMaterial({ color: 0x9e2a22, roughness: 0.6 });
  var trimHandleGeo = new THREE.CylinderGeometry(0.016, 0.02, 0.27, 8);
  trimHandleGeo.translate(0, 0.135, 0);
  var trimGripGeo = new THREE.CylinderGeometry(0.026, 0.022, 0.13, 10);
  [trimBladeA, trimBladeB].forEach(function (blade, n) {
    var arm = new THREE.Group();                   // a handle, splayed a little away from the other one
    arm.rotation.x = (n ? -1 : 1) * 0.12;
    blade.add(arm);
    place(new THREE.Mesh(trimHandleGeo, trimWood), 0, 0, 0, arm);
    place(new THREE.Mesh(trimGripGeo, trimGripMat), 0, 0.2, 0, arm);  // red rubber grip at the end
    for (var rr = 0; rr < 3; rr++) {
      var ridge = place(new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.005, 6, 12), trimRidgeMat), 0, 0.16 + rr * 0.04, 0, arm);
      ridge.rotation.x = Math.PI / 2;
    }
    place(new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), new THREE.MeshStandardMaterial({ color: 0x2e2e34, roughness: 0.8 })), 0, 0.06, (n ? -1 : 1) * 0.01, arm); // rubber bumper
  });
  // Axe head: a flared steel blade with a curved edge, thinning to a sharp, bright edge
  function axeHeadGeometry() {
    var sh = new THREE.Shape();
    sh.moveTo(-0.05, 0.045);
    sh.lineTo(0.03, 0.045);
    sh.quadraticCurveTo(0.1, 0.06, 0.17, 0.11);     // top of the blade sweeping up
    sh.quadraticCurveTo(0.245, 0, 0.17, -0.11);     // the curved cutting edge
    sh.quadraticCurveTo(0.1, -0.06, 0.03, -0.045);  // the beard curving back
    sh.lineTo(-0.05, -0.045);
    sh.closePath();
    var depth = 0.04;
    var g = new THREE.ExtrudeGeometry(sh, { depth: depth, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2, curveSegments: 16 });
    var p = g.attributes.position, col = [];
    for (var i = 0; i < p.count; i++) {
      var x = p.getX(i), z = p.getZ(i) - depth / 2;
      var thin = x > 0.04 ? Math.max(0.12, 1 - (x - 0.04) / 0.17) : 1;  // the blade gets thinner toward its edge
      p.setZ(i, z * thin);
      var shine = x < 0.02 ? 0.55 : x > 0.15 ? 1.15 : 0.82;               // dark poll, steel cheek, bright edge
      col.push(shine, shine, shine * 1.04);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    g.rotateY(Math.PI / 2); // the blade points forward from the handle
    return g;
  }
  var axeSteel = new THREE.MeshStandardMaterial({ color: 0xdfe5ec, metalness: 0.3, roughness: 0.32, emissive: 0x2a3038, vertexColors: true }); // bright polished steel
  place(new THREE.Mesh(axeHeadGeometry(), axeSteel), 0, -0.86, 0, axeHeadGrp);
  // the wooden wedge showing through the top of the head, and a dark collar round the handle
  place(new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.11, 10), new THREE.MeshStandardMaterial({ color: 0x3a4048, metalness: 0.6, roughness: 0.5 })), 0, -0.86, 0, axeHeadGrp);
  // leather grip wrapped round the handle where you hold it
  var gripMat = new THREE.MeshStandardMaterial({ color: 0x4a2c1a, roughness: 0.9 });
  place(new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.16, 12), gripMat), 0, -0.42, 0, axeHeadGrp);
  for (var gw = 0; gw < 4; gw++) {
    var wrap = place(new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.007, 6, 14), new THREE.MeshStandardMaterial({ color: 0x7a4c30, roughness: 0.85 })), 0, -0.36 - gw * 0.04, 0, axeHeadGrp);
    wrap.rotation.x = Math.PI / 2 + 0.35; // wound on a slant
  }
  // pickaxe head: a curved metal bar with a point at each end
  // one smooth arc of steel, thickest in the middle and tapering to a sharp point at each end
  function pickHeadGeometry() {
    var SEG = 32, RAD = 8, pos = [], col = [], idx = [];
    for (var i = 0; i <= SEG; i++) {
      var u = i / SEG * 2 - 1, au = Math.abs(u);
      var cz = u * 0.27, cy = 0.085 * u * u;                    // the arc: tips curve back toward the grip
      var tz = 0.27, ty = 0.17 * u, tl = Math.sqrt(tz * tz + ty * ty);
      tz /= tl; ty /= tl;                                       // direction along the arc
      var ny = tz, nz = -ty;                                    // pointing out of the curve
      var r = 0.05 * Math.pow(1 - au, 0.6) + 0.0015;            // chunky middle, long sharp tips
      for (var j = 0; j <= RAD; j++) {
        var a = (j / RAD) * Math.PI * 2 + Math.PI / 8, ca = Math.cos(a), sa = Math.sin(a); // eight crisp facets
        pos.push(sa * r * 0.75, cy + ca * r * ny, cz + ca * r * nz); // a little flattened side to side
        var shine = 0.62 + au * 0.55 + (ca > 0.3 ? 0.22 : ca < -0.3 ? -0.1 : 0); // bright tips and top edge, darker underneath
        col.push(shine, shine, shine * 1.04);
      }
    }
    for (var k = 0; k < SEG; k++) {
      for (var m = 0; m < RAD; m++) {
        var p0 = k * (RAD + 1) + m, p1 = p0 + RAD + 1;
        idx.push(p0, p1, p0 + 1, p1, p1 + 1, p0 + 1);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }
  var pickSteel = new THREE.MeshStandardMaterial({ color: 0xdfe5ec, metalness: 0.35, roughness: 0.3, emissive: 0x2a3038, vertexColors: true, flatShading: true, side: THREE.DoubleSide });
  place(new THREE.Mesh(pickHeadGeometry(), pickSteel), 0, -0.9, 0, pickHeadGrp);
  // the dark metal socket where the head meets the handle
  place(new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.12, 0.1), new THREE.MeshStandardMaterial({ color: 0x3a4048, metalness: 0.6, roughness: 0.5 })), 0, -0.88, 0, pickHeadGrp);
  var brass = new THREE.MeshStandardMaterial({ color: 0xd9a441, metalness: 0.6, roughness: 0.35, emissive: 0x3a2808 });
  [-0.815, -0.945].forEach(function (by) { // brass bands above and below the socket
    place(new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.018, 0.11), brass), 0, by, 0, pickHeadGrp);
  });
  [-1, 1].forEach(function (sd) { // a rivet on each side
    var rivet = place(new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), brass), sd * 0.044, -0.88, 0, pickHeadGrp);
    rivet.scale.set(0.6, 1, 1);
  });
  // leather grip wrapped round the handle where you hold it
  var pickGripMat = new THREE.MeshStandardMaterial({ color: 0x4a2c1a, roughness: 0.9 });
  place(new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.16, 12), pickGripMat), 0, -0.42, 0, pickHeadGrp);
  for (var pw = 0; pw < 4; pw++) {
    var pwrap = place(new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.007, 6, 14), new THREE.MeshStandardMaterial({ color: 0x7a4c30, roughness: 0.85 })), 0, -0.36 - pw * 0.04, 0, pickHeadGrp);
    pwrap.rotation.x = Math.PI / 2 + 0.35; // wound on a slant
  }
  axeArm.visible = false;
  player.position.set(OUT_DOOR_X, 0, OUT_DOOR_Z + 0.9);   // you start on the farmhouse's front porch
  scene.add(player);
  var facing = 0; // looking out from the porch
  var walkTarget = null;

  var cursor = new THREE.Mesh(new THREE.RingGeometry(TILE * 0.56, TILE * 0.66, 4, 1),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false }));
  cursor.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
  cursor.position.y = 0.14;
  scene.add(cursor);

  // ---------- Particles and ripples ----------
  var particles = [], waves = [];
  var dotGeo = new THREE.SphereGeometry(0.06, 6, 5);
  var waveGeo = new THREE.RingGeometry(0.85, 1, 48);

  function burst(x, y, z, color, count, speed, up, gravity) {
    for (var i = 0; i < count; i++) {
      var m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: color, transparent: true, depthWrite: false }));
      m.position.set(x, y, z);
      var life = 0.6 + Math.random() * 0.6;
      particles.push({
        mesh: m, life: life, max: life, gravity: gravity,
        vel: new THREE.Vector3((Math.random() - 0.5) * speed, up * (0.3 + Math.random()), (Math.random() - 0.5) * speed)
      });
      scene.add(m);
    }
  }

  function ripple(x, z, color, maxSize, life) {
    var m = new THREE.Mesh(waveGeo, new THREE.MeshBasicMaterial({ color: color, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, Math.max(groundHeight(x, z), WATER_Y) + 0.03, z);
    scene.add(m);
    waves.push({ mesh: m, life: life, max: life, size: maxSize });
  }

  // Spell sparkles: they gather and float up around you, drift through the air to each crop
  // the spell touches, then spiral down onto it and twinkle out
  var SPELL_SPARKS = 900;
  var spellGeo = new THREE.BufferGeometry();
  spellGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPELL_SPARKS * 3), 3));
  spellGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(SPELL_SPARKS * 3), 3));
  var spellPoints = new THREE.Points(spellGeo, new THREE.PointsMaterial({
    map: dawnGlowTex, size: 0.42, vertexColors: true, transparent: true,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  spellPoints.frustumCulled = false; // the sparkles fly all over, so always draw them
  scene.add(spellPoints);
  var spellTints = [new THREE.Color(0xffe08a), new THREE.Color(0xff9be0), new THREE.Color(0xc9a0ff), new THREE.Color(0xffffff)];
  var sparks = [];
  for (var spi = 0; spi < SPELL_SPARKS; spi++) sparks.push({ on: false });
  function freeSpark() {
    for (var i = 0; i < sparks.length; i++) if (!sparks[i].on) return sparks[i];
    return null;
  }
  // target: {x, z} of a crop, or null to just shimmer up around you
  function launchSparks(target, count, delay) {
    for (var i = 0; i < count; i++) {
      var sk = freeSpark();
      if (!sk) return;
      var a = Math.random() * Math.PI * 2, r = 0.3 + Math.random() * 0.4;
      sk.on = true;
      sk.poof = false;
      sk.age = -(delay + Math.random() * 0.35);   // waits a moment so they leave in a stream, not all at once
      sk.start = new THREE.Vector3(player.position.x + Math.cos(a) * r, 0.5 + Math.random() * 0.6, player.position.z + Math.sin(a) * r);
      sk.lift = 0.7 + Math.random() * 0.5;       // how high they float up before setting off
      sk.rise = 0.45 + Math.random() * 0.2;
      sk.tint = spellTints[Math.floor(Math.random() * spellTints.length)];
      sk.twinkle = 4 + Math.random() * 5;
      sk.p = Math.random() * 6.28;
      sk.target = target;
      if (target) {
        sk.end = new THREE.Vector3(target.x + (Math.random() - 0.5) * 0.3, 1.3 + Math.random() * 0.3, target.z + (Math.random() - 0.5) * 0.3);
        sk.travel = 0.9 + Math.random() * 0.4;
        sk.settle = 0.8 + Math.random() * 0.3;
        sk.arc = 1.6 + Math.random() * 1.2;      // how high the arc through the air goes
        sk.spin = (Math.random() < 0.5 ? -1 : 1) * (3 + Math.random() * 3);
      } else {
        sk.travel = 0; sk.settle = 1.2 + Math.random() * 0.6;
      }
    }
  }
  // A poof of sparkles bursting out along a line (from a to b), drifting up and twinkling out
  var poofFlashes = [];
  function sparklePoof(a, b, count) {
    for (var i = 0; i < count; i++) {
      var sk = freeSpark();
      if (!sk) break;
      var f = Math.random();
      sk.on = true;
      sk.poof = true;
      sk.age = -Math.random() * 0.15;
      sk.start = new THREE.Vector3().lerpVectors(a, b, f);
      sk.start.y += Math.random() * 1.2;
      var ang = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 2.2;
      sk.vel = new THREE.Vector3(Math.cos(ang) * sp, 0.6 + Math.random() * 1.8, Math.sin(ang) * sp);
      sk.life = 1.2 + Math.random() * 1.1;
      sk.tint = spellTints[Math.floor(Math.random() * spellTints.length)];
      sk.twinkle = 5 + Math.random() * 6;
      sk.p = Math.random() * 6.28;
    }
    // and a big soft flash of light in the middle
    var flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffd6f4, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    flash.position.lerpVectors(a, b, 0.5);
    flash.position.y += 0.8;
    scene.add(flash);
    poofFlashes.push({ sprite: flash, t: 0 });
  }
  var sparkMid = new THREE.Vector3(), sparkUp = new THREE.Vector3(), sparkPos = new THREE.Vector3();
  function updateSpellSparks(dt, time) {
    for (var fi = poofFlashes.length - 1; fi >= 0; fi--) { // the poof's flash grows and fades
      var fl = poofFlashes[fi];
      fl.t += dt;
      var fk = fl.t / 0.7;
      fl.sprite.scale.setScalar(1.5 + fk * 4);
      fl.sprite.material.opacity = Math.max(0, 0.55 * (1 - fk));
      if (fk >= 1) { scene.remove(fl.sprite); fl.sprite.material.dispose(); poofFlashes.splice(fi, 1); }
    }
    var pos = spellGeo.attributes.position, col = spellGeo.attributes.color;
    for (var i = 0; i < sparks.length; i++) {
      var sk = sparks[i], bright = 0;
      if (sk.on) {
        sk.age += dt;
        var t = sk.age;
        if (sk.poof) { // a poof sparkle: bursts outward, slows down, floats up and fades
          if (t > sk.life) { sk.on = false; }
          else {
            var tt = Math.max(0, t), spread = (1 - Math.exp(-tt * 2.5)) / 2.5;
            sparkPos.copy(sk.start).addScaledVector(sk.vel, spread);
            sparkPos.y += tt * 0.6;
            bright = t < 0 ? 0 : Math.pow(1 - t / sk.life, 1.1) * 2.4;
          }
        } else if (t < 0) {
          bright = 0;
          sparkPos.copy(sk.start);
        } else if (t < sk.rise) { // 1. float up around you, swirling a little
          var k = t / sk.rise, ease = 1 - (1 - k) * (1 - k);
          sparkUp.copy(sk.start).y += sk.lift * ease;
          sparkPos.copy(sparkUp);
          sparkPos.x += Math.sin(time * 3 + sk.p) * 0.08;
          sparkPos.z += Math.cos(time * 3 + sk.p) * 0.08;
          bright = k;
        } else if (t < sk.rise + sk.travel) { // 2. drift in an arc through the air to the crop
          var f = (t - sk.rise) / sk.travel, e = f * f * (3 - 2 * f);
          sparkUp.copy(sk.start).y += sk.lift;
          sparkMid.copy(sparkUp).lerp(sk.end, 0.5).y += sk.arc;
          sparkPos.copy(sparkUp).multiplyScalar((1 - e) * (1 - e))
            .addScaledVector(sparkMid, 2 * (1 - e) * e)
            .addScaledVector(sk.end, e * e);
          sparkPos.x += Math.sin(time * 4 + sk.p) * 0.06;
          bright = 1;
        } else if (t < sk.rise + sk.travel + sk.settle) { // 3. spiral down onto the crop (or drift up and fade near you)
          var g = (t - sk.rise - sk.travel) / sk.settle;
          if (sk.target) {
            var ang = sk.p + g * sk.spin, rad = 0.4 * (1 - g) + 0.05;
            sparkPos.set(sk.target.x + Math.cos(ang) * rad, sk.end.y - g * (sk.end.y - 0.35), sk.target.z + Math.sin(ang) * rad);
          } else {
            sparkUp.copy(sk.start).y += sk.lift + g * 0.8;
            sparkPos.copy(sparkUp);
            sparkPos.x += Math.sin(time * 2 + sk.p) * 0.15 * g;
            sparkPos.z += Math.cos(time * 2 + sk.p) * 0.15 * g;
          }
          bright = 1 - g * g;
        } else {
          sk.on = false;
        }
        bright *= 1.1 + 0.6 * Math.max(0, Math.sin(time * sk.twinkle + sk.p)); // twinkle
      }
      if (sk.on) {
        pos.setXYZ(i, sparkPos.x, sparkPos.y, sparkPos.z);
        col.setXYZ(i, sk.tint.r * bright, sk.tint.g * bright, sk.tint.b * bright);
      } else {
        col.setXYZ(i, 0, 0, 0);
      }
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
  }

  // ---------- Clock ----------
  function twoDigits(n) { return n < 10 ? '0' + n : String(n); }

  function clockText(totalMinutes) {
    var hour = Math.floor(totalMinutes / 60);
    var minute = Math.floor((totalMinutes % 60) / 10) * 10; // ticks every 10 minutes
    var icon = hour >= 5 && hour < 8 ? '☼' : hour >= 8 && hour < 17 ? '☀' : hour >= 17 && hour < 20 ? '☾' : '★';
    var hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return icon + ' ' + hour12 + ':' + twoDigits(minute) + ' ' + (hour < 12 ? 'AM' : 'PM');
  }

  function updateClock(dt) {
    state.minutes += dt * GAME_MINUTES_PER_SECOND;
    if (state.minutes >= 24 * 60) {
      state.minutes -= 24 * 60;
      state.day += 1;
    }
    var text = clockText(state.minutes);
    if (ui.clock.textContent !== text) ui.clock.textContent = text;
    var dayText = 'Day ' + state.day;
    if (ui.day.textContent !== dayText) ui.day.textContent = dayText;
  }

  // Sky through the day: [hour, sky colour, sun colour, sun strength, ambient strength, how "night" it is]
  var SKY = [
    [0, 0x232259, 0x8fa0ff, 0.2, 0.3, 1],
    [5, 0x3a3473, 0x9fa8ff, 0.25, 0.32, 1],
    [6.5, 0xffc6a8, 0xffb98a, 0.8, 0.6, 0],
    [9, 0x9fd8ff, 0xfff4e0, 1.15, 0.75, 0],
    [16.5, 0x9fd8ff, 0xfff4e0, 1.1, 0.75, 0],
    [18.5, 0xf3a6d0, 0xff9a7a, 0.7, 0.55, 0.3],
    [20, 0x2b2a5e, 0x8fa0ff, 0.25, 0.3, 1],
    [24, 0x232259, 0x8fa0ff, 0.2, 0.3, 1]
  ].map(function (k) {
    return { h: k[0], sky: new THREE.Color(k[1]), sun: new THREE.Color(k[2]), sunI: k[3], hemiI: k[4], night: k[5] };
  });

  function updateSky() {
    var hour = state.minutes / 60, i = 0;
    while (i < SKY.length - 2 && hour > SKY[i + 1].h) i++;
    var a = SKY[i], b = SKY[i + 1];
    var t = THREE.MathUtils.smoothstep(hour, a.h, b.h);
    scene.background.copy(a.sky).lerp(b.sky, t);
    scene.fog.color.copy(scene.background);
    sun.color.copy(a.sun).lerp(b.sun, t);
    sun.intensity = a.sunI + (b.sunI - a.sunI) * t;
    hemi.intensity = a.hemiI + (b.hemiI - a.hemiI) * t;
    var angle = (hour / 24) * Math.PI * 2;
    sun.position.set(player.position.x + Math.sin(angle) * 14, 14, player.position.z + 9);
    sun.target.position.copy(player.position);
    return a.night + (b.night - a.night) * t;
  }

  // ---------- Actions ----------
  function targetTile() {
    var fx = player.position.x + Math.sin(facing) * 0.95;
    var fz = player.position.z + Math.cos(facing) * 0.95;
    return tileAt(fx, fz) || tileAt(player.position.x, player.position.z);
  }

  function interact() {
    if (binOpen) { if (!menuJustOpened()) closeBin(); return; }
    if (nearBin()) { openBin(); return; }                         // next to the shipping bin: open it
    if (shopOpen) { if (!menuJustOpened()) closeShop(); return; }
    if (nearShop()) { openShop(); return; }                       // at the seed shop's door: open the shop
    if (barnShopOpen) { if (!menuJustOpened()) closeBarnShop(); return; }
    if (atBarnCounter()) { openBarnShop(); return; }              // at Fluff & Feather's counter: see the animals for sale
    var nearTree = treeInReach();
    if (nearTree && heldItem() === 'axe') { chopTree(nearTree); return; }
    var nearRock = heldItem() === 'pickaxe' ? rockInReach() : null;
    if (nearRock) { mineRock(nearRock); return; }
    var nearBush = heldItem() === 'trimmers' ? bushInReach() : null;
    if (nearBush) { trimBush(nearBush); return; }
    var tile = targetTile();
    if (heldItem() === 'bloom' && !(tile && tile.crop && tile.stage === 3)) { eatBloom(); return; }   // holding a moonbloom: eat it (unless there's one to pick)
    if (!tile) {
      if (nearTree) return;
      if (state.inTreeZone && state.petalDay !== state.day) {
        if (!addItem('petal', 1)) { bagFull(); return; }
        state.petalDay = state.day;
        burst(TREE_X, 2.5, TREE_Z, 0xffb3f0, 18, 2, 1, -2);
        popSound();
        showToast('+1 Dawn Petal 🌺');
      }
      return;
    }
    if (!tile.soil) {
      if (heldItem() === 'hoe') tillTile(tile); // you need the hoe to till
    } else if (!tile.crop) {
      if (heldItem() !== 'seed' || !takeItem('seed', 1)) return; // you plant the seeds you're holding
      tile.crop = makeCrop(tile);
      tile.stage = 0;
      tile.growth = 0;
      showStage(tile);
      tile.drop = place(new THREE.Mesh(dropGeo, M.drop), tile.x, 1, tile.z);
      burst(tile.x, 0.3, tile.z, 0x7ed37a, 8, 1.2, 1.4, -4);
      plantSound();
    } else if (tile.stage === 3) {
      if (!roomFor(['bloom'])) { bagFull(); return; }    // no room: the flower waits in the soil until you make some
      scene.remove(tile.crop);
      scene.remove(tile.drop);
      tile.crop = null;
      setWet(tile, false);
      state.harvest += 1;
      addItem('bloom', 1);
      burst(tile.x, 0.8, tile.z, 0xffb3e6, 22, 3, 3, -4);
      popSound();
      showToast('+1 Moonbloom 🌸');
    } else if (!tile.wet) {
      setWet(tile, true);
      burst(tile.x, 1.2, tile.z, 0x7cc7ff, 14, 1, 0.5, -6);
      waterSound();
      useStamina(STAMINA_COST.water);
    }
  }

  function castSpell() {
    if (indoors || state.mana < SPELL_COST) return; // spells are for the garden, not the living room
    state.mana -= SPELL_COST;
    spellSound();
    var watered = 0;
    tiles.forEach(function (t) {
      if (t.crop && t.stage < 3 && !t.wet) {
        setWet(t, true);
        launchSparks(t, 16, watered * 0.12); // sparkles float over and settle onto this crop
        if (watered < 10) landChime(watered * 0.12 + 1.75); // a soft chime as they land (not too many at once)
        watered += 1;
      }
    });
    if (!watered) launchSparks(null, 30, 0); // nothing to water: the sparkles just shimmer up around you
  }

  // ---------- Bag (inventory) ----------
  var ITEMS = {
    seed: { name: 'Moonbloom Seed', price: 5, icon: '🌱', img: iconSeed(), info: 'Plant one in tilled garden soil and water it every day. After 4 watered days it blooms. Buy more at Whimsy & Bloom, the seed shop on the new island.' },
    bloom: { name: 'Moonbloom', price: 60, icon: '🌸', img: iconBloom(), info: 'A glowing flower grown in your garden. Select it and press Interact to eat it for stamina.' },
    petal: { name: 'Dawn Petal', price: 40, icon: '🌺', img: iconPetal(), fill: 92, info: 'A shimmering petal from the Dawn Tree. It gives you one each day.' },
    axe: { name: 'Axe', icon: '🪓', img: iconAxe(), fill: 94, info: 'Select it in your hotbar, then press Interact next to a tree. Ten chops fell a tree.' },
    wood: { name: 'Wood', price: 2, icon: '🪵', info: 'Chopped from trees. Every tree drops logs worth 15 wood; walk into them to pick them up.' },
    pickaxe: { name: 'Pickaxe', icon: '⛏️', img: iconPickaxe(), fill: 80, info: 'Select it in your hotbar, then press Interact next to a rock. Ten hits break a rock.' },
    hoe: { name: 'Hoe', icon: '🪏', img: iconHoe(), fill: 95, info: 'Select it in your hotbar, then press Interact on garden soil to till it. Sometimes you dig something up!' },
    trimmers: { name: 'Hedge Trimmers', icon: '✂️', img: iconTrimmers(), fill: 93, info: 'Select them in your hotbar, then press Interact next to a bush. Ten snips trim a bush.' },
    fiber: { name: 'Fiber', price: 3, icon: '🌿', img: iconFiber(), fill: 92, info: 'Tough green strands trimmed from bushes.' },
    hay: { name: 'Hay', price: 4, icon: '🌾', img: iconHay(), fill: 92, info: 'Bushes have a 50% chance of dropping a bundle of hay.' },
    stone: { name: 'Stone', price: 2, icon: '🪨', info: 'Broken from rocks. Bigger rocks give more.' },
    coal: { name: 'Coal', price: 8, icon: '⚫', img: iconCoal(), info: 'Rocks have a 40% chance of dropping a lump of coal.' },
    sap: { name: 'Sap', price: 6, icon: '🍯', img: iconSap(), info: 'Sticky golden sap. Every tree drops 3.' },
    acorn: { name: 'Acorn', price: 4, icon: '🌰', img: iconAcorn(), fill: 92, info: 'Dropped by leafy trees.' },
    pinecone: { name: 'Pinecone', price: 4, icon: '🌲', img: iconPinecone(), fill: 92, info: 'Dropped by pine trees.' }
  };
  // Little drawn pictures for items that don't have a good emoji
  function iconCanvas(draw) {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    draw(c.getContext('2d'));
    return c.toDataURL();
  }
  function iconCoin() {                                        // a Star Coin: a pearly moonstone coin with a lavender rim, a glowing gold star and sparkles
    return iconCanvas(function (g) {
      function star(cx, cy, r1, r2) {
        g.beginPath();
        for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
        g.closePath();
      }
      g.shadowColor = 'rgba(70,40,120,0.4)'; g.shadowBlur = 3; g.shadowOffsetY = 2;
      var rim = g.createLinearGradient(8, 6, 56, 58);                  // the silvery-lavender rim
      rim.addColorStop(0, '#ffffff'); rim.addColorStop(0.5, '#c9b8ee'); rim.addColorStop(1, '#7a62b8');
      g.fillStyle = rim;
      g.beginPath(); g.arc(32, 32, 29, 0, Math.PI * 2); g.fill();
      g.shadowColor = 'transparent';
      var pearl = g.createLinearGradient(12, 12, 52, 52);              // the shimmery moonstone face
      pearl.addColorStop(0, '#fdf6ff'); pearl.addColorStop(0.35, '#e2d4ff'); pearl.addColorStop(0.6, '#cfe8ff'); pearl.addColorStop(0.8, '#ffd9f0'); pearl.addColorStop(1, '#bba4ec');
      g.fillStyle = pearl;
      g.beginPath(); g.arc(32, 32, 23, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(110,80,180,0.5)'; g.lineWidth = 1.2;
      g.beginPath(); g.arc(32, 32, 23, 0, Math.PI * 2); g.stroke();
      var halo = g.createRadialGradient(32, 32, 1, 32, 32, 15);        // the star glows
      halo.addColorStop(0, 'rgba(255,215,110,0.75)'); halo.addColorStop(1, 'rgba(255,215,110,0)');
      g.fillStyle = halo; g.beginPath(); g.arc(32, 32, 15, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(90,60,150,0.45)'; star(32.8, 33.6, 14, 6); g.fill();   // its shadow, so it looks raised
      var gold = g.createLinearGradient(20, 18, 44, 46);
      gold.addColorStop(0, '#fffbe0'); gold.addColorStop(1, '#f2ac22');
      g.fillStyle = gold; star(32, 32.5, 14, 6); g.fill();
      [[14, 32, 2.2], [50, 30, 1.8], [32, 12, 1.6], [33, 52, 1.6]].forEach(function (d) { // four white sparkles round the star
        var x = d[0], y = d[1], q = d[2] * 2;
        g.fillStyle = '#ffffff';
        g.beginPath(); g.moveTo(x, y - q); g.lineTo(x + q * 0.3, y); g.lineTo(x, y + q); g.lineTo(x - q * 0.3, y); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(x - q, y); g.lineTo(x, y + q * 0.3); g.lineTo(x + q, y); g.lineTo(x, y - q * 0.3); g.closePath(); g.fill();
      });
      g.fillStyle = 'rgba(255,255,255,0.8)';                           // a glint of shine
      g.beginPath(); g.ellipse(20, 19, 6, 2.2, -0.7, 0, Math.PI * 2); g.fill();
    });
  }
  function iconSap() {
    return iconCanvas(function (g) {
      var grad = g.createRadialGradient(26, 36, 2, 32, 40, 22);
      grad.addColorStop(0, '#ffe7a0'); grad.addColorStop(0.5, '#f0a63a'); grad.addColorStop(1, '#b8640f');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(32, 6);
      g.bezierCurveTo(40, 22, 52, 30, 52, 42);
      g.bezierCurveTo(52, 54, 42, 60, 32, 60);
      g.bezierCurveTo(22, 60, 12, 54, 12, 42);
      g.bezierCurveTo(12, 30, 24, 22, 32, 6);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.7)';
      g.beginPath(); g.ellipse(24, 38, 4, 7, -0.4, 0, Math.PI * 2); g.fill();
    });
  }
  function iconSeed() {
    return iconCanvas(function (g) {
      // a soft magical glow behind the seeds
      var halo = g.createRadialGradient(32, 36, 2, 32, 36, 30);
      halo.addColorStop(0, 'rgba(190,150,255,0.7)');
      halo.addColorStop(1, 'rgba(200,170,255,0)');
      g.fillStyle = halo;
      g.fillRect(0, 0, 64, 64);
      // three pearly teardrop seeds, each with a little crescent moon
      function seed(x, y, size, tilt) {
        g.save();
        g.translate(x, y);
        g.rotate(tilt);
        var grad = g.createRadialGradient(-size * 0.3, -size * 0.2, 1, 0, 0, size * 1.3);
        grad.addColorStop(0, '#fbf6ff');
        grad.addColorStop(0.45, '#c9b0f2');
        grad.addColorStop(1, '#7a5cc4');
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(0, -size * 1.25);
        g.bezierCurveTo(size * 0.9, -size * 0.4, size * 0.95, size * 0.75, 0, size);
        g.bezierCurveTo(-size * 0.95, size * 0.75, -size * 0.9, -size * 0.4, 0, -size * 1.25);
        g.fill();
        g.strokeStyle = 'rgba(90,60,160,0.45)';
        g.lineWidth = 1;
        g.stroke();
        // crescent moon: a gold circle with a bite taken out
        g.fillStyle = '#ffe08a';
        g.beginPath(); g.arc(size * 0.05, size * 0.15, size * 0.38, 0, Math.PI * 2); g.fill();
        g.globalCompositeOperation = 'destination-out';
        g.beginPath(); g.arc(size * 0.22, size * 0.02, size * 0.33, 0, Math.PI * 2); g.fill();
        g.globalCompositeOperation = 'source-over';
        // pearly shine
        g.fillStyle = 'rgba(255,255,255,0.8)';
        g.beginPath(); g.ellipse(-size * 0.35, -size * 0.45, size * 0.14, size * 0.3, 0.4, 0, Math.PI * 2); g.fill();
        g.restore();
      }
      seed(19, 42, 13, -0.5);
      seed(45, 43, 13, 0.45);
      seed(32, 24, 14, 0.05);
      // tiny sparkles
      function sparkle(x, y, r) {
        g.fillStyle = '#ffe680';
        g.beginPath();
        g.moveTo(x, y - r); g.lineTo(x + r * 0.25, y - r * 0.25); g.lineTo(x + r, y); g.lineTo(x + r * 0.25, y + r * 0.25);
        g.lineTo(x, y + r); g.lineTo(x - r * 0.25, y + r * 0.25); g.lineTo(x - r, y); g.lineTo(x - r * 0.25, y - r * 0.25);
        g.closePath();
        g.fill();
      }
      sparkle(53, 13, 6);
      sparkle(10, 18, 4);
      sparkle(57, 57, 3.5);
    });
  }
  function iconBloom() {
    return iconCanvas(function (g) {
      // a soft pink glow behind the flower
      var halo = g.createRadialGradient(32, 28, 2, 32, 28, 30);
      halo.addColorStop(0, 'rgba(255,160,230,0.65)');
      halo.addColorStop(1, 'rgba(255,160,230,0)');
      g.fillStyle = halo;
      g.fillRect(0, 0, 64, 64);
      // stem and a leaf
      g.strokeStyle = '#4f9a48';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(32, 34); g.quadraticCurveTo(30, 48, 34, 60); g.stroke();
      g.fillStyle = '#6cc35f';
      g.beginPath(); g.moveTo(32, 50); g.quadraticCurveTo(42, 42, 48, 46); g.quadraticCurveTo(42, 54, 32, 50); g.fill();
      // two rings of petals: back ones lavender, front ones pink, each fading to white at the tip
      function petals(count, len, wide, spin, inner, outer) {
        for (var i = 0; i < count; i++) {
          g.save();
          g.translate(32, 27);
          g.rotate(spin + (i / count) * Math.PI * 2);
          var grad = g.createLinearGradient(0, 0, 0, -len);
          grad.addColorStop(0, inner);
          grad.addColorStop(1, outer);
          g.fillStyle = grad;
          g.beginPath();
          g.moveTo(0, 0);
          g.bezierCurveTo(wide, -len * 0.35, wide * 0.8, -len * 0.9, 0, -len);
          g.bezierCurveTo(-wide * 0.8, -len * 0.9, -wide, -len * 0.35, 0, 0);
          g.fill();
          g.strokeStyle = 'rgba(180,70,150,0.35)';
          g.lineWidth = 0.8;
          g.stroke();
          g.restore();
        }
      }
      petals(6, 21, 9, Math.PI / 6, '#c58cff', '#f3e3ff');
      petals(6, 18, 8.5, 0, '#ff7fd1', '#ffe6f6');
      // golden glowing centre with a little crescent moon
      var core = g.createRadialGradient(30, 25, 1, 32, 27, 8);
      core.addColorStop(0, '#fff8d0');
      core.addColorStop(1, '#ffc94d');
      g.fillStyle = core;
      g.beginPath(); g.arc(32, 27, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f0a020';
      g.beginPath(); g.arc(32, 27, 4, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffe9a8';
      g.beginPath(); g.arc(33.6, 25.8, 3.4, 0, Math.PI * 2); g.fill();
      // sparkles
      function sparkle(x, y, r) {
        g.fillStyle = '#fff3a0';
        g.beginPath();
        g.moveTo(x, y - r); g.lineTo(x + r * 0.25, y - r * 0.25); g.lineTo(x + r, y); g.lineTo(x + r * 0.25, y + r * 0.25);
        g.lineTo(x, y + r); g.lineTo(x - r * 0.25, y + r * 0.25); g.lineTo(x - r, y); g.lineTo(x - r * 0.25, y - r * 0.25);
        g.closePath();
        g.fill();
      }
      sparkle(54, 10, 5);
      sparkle(9, 44, 3.5);
      sparkle(56, 36, 3);
    });
  }
  function iconPetal() {
    return iconCanvas(function (g) {
      // a warm sunrise glow behind the petal: gold in the middle fading to rose
      var halo = g.createRadialGradient(32, 30, 2, 32, 32, 31);
      halo.addColorStop(0, 'rgba(255,214,150,0.75)');
      halo.addColorStop(0.5, 'rgba(255,160,205,0.4)');
      halo.addColorStop(1, 'rgba(255,160,205,0)');
      g.fillStyle = halo;
      g.fillRect(0, 0, 64, 64);
      // soft rays of dawn light fanning out behind it
      g.save();
      g.translate(32, 32);
      for (var r = 0; r < 12; r++) {
        g.rotate(Math.PI / 6);
        var ray = g.createLinearGradient(0, 0, 0, -30);
        ray.addColorStop(0, 'rgba(255,222,140,0.75)');
        ray.addColorStop(1, 'rgba(255,236,170,0)');
        g.fillStyle = ray;
        g.beginPath(); g.moveTo(-2.4, 0); g.lineTo(0, -31); g.lineTo(2.4, 0); g.fill();
      }
      g.restore();
      g.save();
      g.translate(32, 34);
      g.rotate(-0.5);
      // the petal: a slim base swelling to a wide rounded top with a soft dip in the middle
      function petalPath() {
        g.beginPath();
        g.moveTo(0, 25);
        g.bezierCurveTo(9, 20, 17, 7, 17, -7);
        g.bezierCurveTo(17, -19, 11, -25, 5, -24);
        g.bezierCurveTo(2.5, -24, 1, -22.8, 0, -22);
        g.bezierCurveTo(-1, -22.8, -2.5, -24, -5, -24);
        g.bezierCurveTo(-11, -25, -17, -19, -17, -7);
        g.bezierCurveTo(-17, 7, -9, 20, 0, 25);
        g.closePath();
      }
      g.shadowColor = 'rgba(170,60,120,0.45)';
      g.shadowBlur = 4;
      g.shadowOffsetY = 2;
      // colours of the sunrise: deep rose at the base, pink, then peach and a golden glow at the top
      var body = g.createLinearGradient(0, 25, 0, -24);
      body.addColorStop(0, '#d92a7c');
      body.addColorStop(0.35, '#ff62ae');
      body.addColorStop(0.7, '#ff9fa6');
      body.addColorStop(1, '#ffd27e');
      g.fillStyle = body;
      petalPath();
      g.fill();
      g.shadowColor = 'transparent';
      g.save();
      petalPath();
      g.clip();
      // a pearly inner light in the upper middle
      var pearl = g.createRadialGradient(-3, -9, 1, -2, -6, 15);
      pearl.addColorStop(0, 'rgba(255,255,245,0.55)');
      pearl.addColorStop(1, 'rgba(255,255,245,0)');
      g.fillStyle = pearl;
      g.fillRect(-20, -28, 40, 56);
      // the right edge curls back into shadow
      var curl = g.createLinearGradient(6, 0, 18, 0);
      curl.addColorStop(0, 'rgba(190,40,120,0)');
      curl.addColorStop(1, 'rgba(190,40,120,0.35)');
      g.fillStyle = curl;
      g.fillRect(-20, -28, 40, 56);
      // fine golden veins fanning up from the base
      g.strokeStyle = 'rgba(255,240,190,0.75)';
      g.lineWidth = 0.8;
      g.lineCap = 'round';
      [-10, -5, 0, 5, 10].forEach(function (vx) {
        g.beginPath();
        g.moveTo(0, 22);
        g.quadraticCurveTo(vx * 0.3, 6, vx, -15 + Math.abs(vx) * 0.4);
        g.stroke();
      });
      g.restore();
      // a bright golden rim along the top edge, like the first light catching it
      g.save();
      petalPath();
      g.clip();
      g.strokeStyle = 'rgba(255,248,210,0.9)';
      g.lineWidth = 2.5;
      petalPath();
      g.stroke();
      g.restore();
      g.strokeStyle = 'rgba(200,60,130,0.55)';
      g.lineWidth = 1;
      petalPath();
      g.stroke();
      // a tiny golden sun charm glowing at the base
      var sun = g.createRadialGradient(0, 20, 0.5, 0, 20, 3.6);
      sun.addColorStop(0, '#fffbe0');
      sun.addColorStop(0.5, '#ffd76a');
      sun.addColorStop(1, 'rgba(255,190,80,0)');
      g.fillStyle = sun;
      g.beginPath(); g.arc(0, 20, 3.6, 0, Math.PI * 2); g.fill();
      g.restore();
      // sparkles
      function sparkle(x, y, r, c) {
        g.fillStyle = c;
        g.beginPath();
        g.moveTo(x, y - r); g.lineTo(x + r * 0.25, y - r * 0.25); g.lineTo(x + r, y); g.lineTo(x + r * 0.25, y + r * 0.25);
        g.lineTo(x, y + r); g.lineTo(x - r * 0.25, y + r * 0.25); g.lineTo(x - r, y); g.lineTo(x - r * 0.25, y - r * 0.25);
        g.closePath();
        g.fill();
      }
      sparkle(51, 10, 5, '#fff6b0');
      sparkle(12, 50, 3.5, '#ffe0f2');
      sparkle(54, 46, 3, '#fff6b0');
      sparkle(13, 14, 2.5, '#ffffff');
    });
  }
  function iconAxe() {
    return iconCanvas(function (g) {
      // drawn sideways along the handle, then tilted, so the handle runs corner to corner
      g.translate(23.2, 31);   // centred and scaled so the axe fills the whole picture
      g.scale(0.98, 0.98);
      g.rotate(Math.PI / 6);
      g.shadowColor = 'rgba(60,30,90,0.35)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 2;
      // handle: dark outline, warm polished wood, a light streak of grain
      function handlePath() {
        g.beginPath();
        g.moveTo(-3.2, -26); g.lineTo(3.2, -26);
        g.quadraticCurveTo(4.6, 2, 3.4, 27); g.quadraticCurveTo(0, 31, -3.4, 27);
        g.quadraticCurveTo(-4.6, 2, -3.2, -26);
        g.closePath();
      }
      handlePath();
      g.fillStyle = '#5a3418';
      g.fill();
      g.shadowColor = 'transparent';
      g.save();
      g.scale(0.72, 0.97);
      handlePath();
      var wood = g.createLinearGradient(-4, 0, 4, 0);
      wood.addColorStop(0, '#8a5328'); wood.addColorStop(0.45, '#c98a4e'); wood.addColorStop(1, '#8a5328');
      g.fillStyle = wood;
      g.fill();
      g.restore();
      g.strokeStyle = 'rgba(255,236,200,0.6)';
      g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(-0.8, -18); g.quadraticCurveTo(0.6, 4, -0.2, 22); g.stroke();
      // leather grip with criss-cross wraps
      g.fillStyle = '#4a2c1a';
      g.fillRect(-4.2, 12, 8.4, 13);
      g.strokeStyle = '#7a4c30';
      g.lineWidth = 1.4;
      for (var w = 0; w < 4; w++) { g.beginPath(); g.moveTo(-4.2, 13 + w * 3.2); g.lineTo(4.2, 15.5 + w * 3.2); g.stroke(); }
      // steel head: a back poll and a flaring blade with a curved cutting edge
      g.shadowColor = 'rgba(40,40,60,0.4)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 1.5;
      g.beginPath();
      g.moveTo(-8, -28); g.lineTo(4, -28);              // top of the poll
      g.quadraticCurveTo(12, -31, 19, -36);              // top of the blade sweeping up
      g.quadraticCurveTo(27, -24, 21, -8);               // the curved cutting edge
      g.quadraticCurveTo(12, -13, 4, -14);               // the "beard" curving back underneath
      g.lineTo(-8, -14);
      g.closePath();
      var steel = g.createLinearGradient(-8, -34, 22, -10);
      steel.addColorStop(0, '#8f98a3'); steel.addColorStop(0.45, '#dfe5eb'); steel.addColorStop(1, '#9aa3ad');
      g.fillStyle = steel;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = '#3d444c';
      g.lineWidth = 1.6;
      g.stroke();
      // the bright polished edge band
      g.beginPath();
      g.moveTo(17.5, -33.5); g.quadraticCurveTo(24.5, -24, 19.5, -10.5);
      g.strokeStyle = '#ffffff';
      g.lineWidth = 2.6;
      g.stroke();
      // a darker poll at the back, with a wedge where the handle goes through
      g.fillStyle = '#5d656e';
      g.fillRect(-8, -28, 6, 14);
      g.fillStyle = '#2e343a';
      g.fillRect(-3, -26, 6, 10);
      g.fillStyle = '#c98a4e';
      g.fillRect(-1.6, -25, 3.2, 8);
      // a sparkle on the blade
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(11, -29); g.lineTo(12, -26); g.lineTo(15, -25); g.lineTo(12, -24); g.lineTo(11, -21);
      g.lineTo(10, -24); g.lineTo(7, -25); g.lineTo(10, -26); g.closePath();
      g.fill();
    });
  }
  function iconPickaxe() {
    return iconCanvas(function (g) {
      // drawn upright along the handle, then tilted, so the handle runs corner to corner
      g.translate(27.1, 35);   // centred and scaled so the pickaxe fills the whole picture
      g.scale(0.98, 0.98);
      g.rotate(Math.PI / 4);   // handle toward the bottom-left corner
      g.shadowColor = 'rgba(60,30,90,0.35)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 2;
      // handle: dark outline, warm polished wood, a light streak of grain
      function handlePath() {
        g.beginPath();
        g.moveTo(-3.2, -24); g.lineTo(3.2, -24);
        g.quadraticCurveTo(4.4, 2, 3.4, 28); g.quadraticCurveTo(0, 32, -3.4, 28);
        g.quadraticCurveTo(-4.4, 2, -3.2, -24);
        g.closePath();
      }
      handlePath();
      g.fillStyle = '#5a3418';
      g.fill();
      g.shadowColor = 'transparent';
      g.save();
      g.scale(0.72, 0.97);
      handlePath();
      var wood = g.createLinearGradient(-4, 0, 4, 0);
      wood.addColorStop(0, '#8a5328'); wood.addColorStop(0.45, '#c98a4e'); wood.addColorStop(1, '#8a5328');
      g.fillStyle = wood;
      g.fill();
      g.restore();
      g.strokeStyle = 'rgba(255,236,200,0.6)';
      g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(-0.8, -14); g.quadraticCurveTo(0.6, 6, -0.2, 22); g.stroke();
      // leather grip with slanted wraps
      g.fillStyle = '#4a2c1a';
      g.fillRect(-4.2, 14, 8.4, 13);
      g.strokeStyle = '#7a4c30';
      g.lineWidth = 1.4;
      for (var w = 0; w < 4; w++) { g.beginPath(); g.moveTo(-4.2, 15 + w * 3.2); g.lineTo(4.2, 17.5 + w * 3.2); g.stroke(); }
      // steel head: a curved bar tapering to a sharp point on each side
      g.shadowColor = 'rgba(40,40,60,0.4)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 1.5;
      g.beginPath();
      g.moveTo(-30, -14);                                  // left point
      g.quadraticCurveTo(-18, -27, 0, -30);                // top curve
      g.quadraticCurveTo(18, -27, 30, -14);                // to the right point
      g.quadraticCurveTo(17, -20, 0, -21);                 // underside curve
      g.quadraticCurveTo(-17, -20, -30, -14);
      g.closePath();
      var steel = g.createLinearGradient(0, -31, 0, -18);
      steel.addColorStop(0, '#eef2f6'); steel.addColorStop(0.5, '#b3bcc6'); steel.addColorStop(1, '#78818b');
      g.fillStyle = steel;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = '#3d444c';
      g.lineWidth = 1.6;
      g.stroke();
      // a bright polished line along the top
      g.strokeStyle = '#ffffff';
      g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(-24, -20); g.quadraticCurveTo(0, -31, 24, -20); g.stroke();
      // the socket where the handle goes through
      g.fillStyle = '#4b535c';
      g.fillRect(-5.5, -31, 11, 12);
      g.strokeStyle = '#2e343a';
      g.lineWidth = 1.2;
      g.strokeRect(-5.5, -31, 11, 12);
      g.fillStyle = '#c98a4e';
      g.fillRect(-2, -30, 4, 3);
      // a sparkle on the head
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(15, -29); g.lineTo(16, -26); g.lineTo(19, -25); g.lineTo(16, -24); g.lineTo(15, -21);
      g.lineTo(14, -24); g.lineTo(11, -25); g.lineTo(14, -26); g.closePath();
      g.fill();
    });
  }
  function iconTrimmers() {
    return iconCanvas(function (g) {
      g.translate(29.2, 32.9); // centred and scaled so the trimmers fill the picture
      g.scale(0.92, 0.92);
      g.rotate(Math.PI / 4);   // tilted, handles toward the bottom-left corner
      // one half: a wide steel blade above the pivot and a curved wooden handle below, drawn pointing up, then tilted
      function half(tilt, flip) {
        g.save();
        g.rotate(tilt);
        g.scale(flip, 1);
        // curved wooden handle with a dark outline
        g.shadowColor = 'rgba(60,30,90,0.35)';
        g.shadowBlur = 3;
        g.shadowOffsetY = 2;
        g.beginPath();
        g.moveTo(-3.6, 3); g.lineTo(3.6, 3);
        g.quadraticCurveTo(5.5, 14, 3.4, 27); g.quadraticCurveTo(-0.4, 31, -3.8, 27);
        g.quadraticCurveTo(-2, 14, -3.6, 3);
        g.closePath();
        g.fillStyle = '#5a3418';
        g.fill();
        g.shadowColor = 'transparent';
        g.beginPath();
        g.moveTo(-2.2, 4); g.lineTo(2.2, 4);
        g.quadraticCurveTo(4, 14, 2.2, 25); g.quadraticCurveTo(-0.4, 27.5, -2.6, 25);
        g.quadraticCurveTo(-0.9, 14, -2.2, 4);
        g.closePath();
        var wood = g.createLinearGradient(-3, 0, 4, 0);
        wood.addColorStop(0, '#8a5328'); wood.addColorStop(0.45, '#d29452'); wood.addColorStop(1, '#8a5328');
        g.fillStyle = wood;
        g.fill();
        // red rubber grip with ridges
        g.beginPath();
        g.moveTo(-3.4, 15); g.lineTo(4.4, 15);
        g.quadraticCurveTo(4.6, 22, 3.6, 27); g.quadraticCurveTo(-0.4, 31.5, -4, 27);
        g.quadraticCurveTo(-3, 21, -3.4, 15);
        g.closePath();
        var grip = g.createLinearGradient(-4, 0, 5, 0);
        grip.addColorStop(0, '#9e2a22'); grip.addColorStop(0.45, '#e0503f'); grip.addColorStop(1, '#9e2a22');
        g.fillStyle = grip;
        g.fill();
        g.strokeStyle = 'rgba(90,20,15,0.6)';
        g.lineWidth = 1;
        for (var r = 0; r < 3; r++) { g.beginPath(); g.moveTo(-3.4, 18 + r * 3); g.lineTo(4.4, 18 + r * 3); g.stroke(); }
        // a little rubber bumper where the handles meet
        g.fillStyle = '#2e2e34';
        g.beginPath(); g.ellipse(2.8, 7, 1.8, 2.2, 0, 0, Math.PI * 2); g.fill();
        // wide steel blade: straight back, wavy cutting edge on the inside, rounded tip
        g.shadowColor = 'rgba(40,40,60,0.4)';
        g.shadowBlur = 2;
        g.shadowOffsetY = 1;
        g.beginPath();
        g.moveTo(-4.2, 3);
        g.lineTo(-4.4, -20);
        g.quadraticCurveTo(-3.2, -30, 2.6, -38);             // the back sweeps in to a sharp point
        g.lineTo(4.2, -24);                                   // a straight, keen edge off the point
        var edgeX = 4.2;
        for (var k = 1; k <= 6; k++) {                        // then the wavy cutting edge, down the inside
          var y = -24 + k * 4;
          g.quadraticCurveTo(edgeX + (k % 2 ? 1.6 : -0.4), y - 2, edgeX, y);
        }
        g.lineTo(4.2, 3);
        g.closePath();
        var steel = g.createLinearGradient(-4.4, 0, 4.4, 0);
        steel.addColorStop(0, '#848d98'); steel.addColorStop(0.5, '#eef2f6'); steel.addColorStop(1, '#a3acb6');
        g.fillStyle = steel;
        g.fill();
        g.shadowColor = 'transparent';
        g.strokeStyle = '#3d444c';
        g.lineWidth = 1.3;
        g.stroke();
        g.strokeStyle = '#ffffff';                            // bright bevel along the cutting edge
        g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(2.8, 1); g.lineTo(2.8, -23); g.lineTo(2.2, -35); g.stroke(); // bright right up to the point
        g.strokeStyle = 'rgba(70,80,90,0.45)';                // a groove down the middle of the blade
        g.lineWidth = 0.9;
        g.beginPath(); g.moveTo(-1.2, 0); g.lineTo(-1.2, -22); g.lineTo(0.4, -30); g.stroke();
        g.restore();
      }
      half(-0.3, 1);
      half(0.3, -1);
      // gold pivot bolt where the blades cross
      g.fillStyle = '#7a5a12';
      g.beginPath(); g.arc(0, 3, 5, 0, Math.PI * 2); g.fill();
      var bolt = g.createRadialGradient(-1.2, 1.8, 0.5, 0, 3, 4.6);
      bolt.addColorStop(0, '#fff6d0'); bolt.addColorStop(1, '#d9a441');
      g.fillStyle = bolt;
      g.beginPath(); g.arc(0, 3, 3.9, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#8a6418';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(-2, 3); g.lineTo(2, 3); g.stroke(); // a screw slot
      // tiny glints right at the sharp points
      [[-0.3, 1], [0.3, -1]].forEach(function (b) {
        g.save();
        g.rotate(b[0]);
        g.scale(b[1], 1);
        g.fillStyle = '#ffffff';
        g.beginPath(); g.arc(2.4, -35.5, 1.1, 0, Math.PI * 2); g.fill();
        g.restore();
      });
      // a sparkle on a blade
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(-9, -21); g.lineTo(-8, -18); g.lineTo(-5, -17); g.lineTo(-8, -16); g.lineTo(-9, -13);
      g.lineTo(-10, -16); g.lineTo(-13, -17); g.lineTo(-10, -18); g.closePath();
      g.fill();
    });
  }
  function iconHoe() {
    return iconCanvas(function (g) {
      g.lineJoin = 'round';
      g.lineCap = 'round';
      function handle() { g.beginPath(); g.moveTo(22, 56); g.lineTo(44, 16); }
      function blade() {
        g.beginPath();
        g.moveTo(6, 25); g.lineTo(31, 11.5); g.lineTo(45, 17.5); g.lineTo(46, 29); g.lineTo(21, 40.5);
        g.closePath();
      }
      function socket() { g.beginPath(); g.moveTo(40, 15); g.lineTo(49, 19); g.lineTo(47, 29); g.lineTo(39, 26); g.closePath(); }
      // polished wooden handle: dark edge, warm wood shading across it, a light streak of grain
      g.shadowColor = 'rgba(60,30,90,0.35)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 2;
      g.strokeStyle = '#5a3418';
      g.lineWidth = 8.4;
      handle(); g.stroke();
      g.shadowColor = 'transparent';
      var wood = g.createLinearGradient(33 - 3.2 * 0.876, 36 - 3.2 * 0.482, 33 + 3.2 * 0.876, 36 + 3.2 * 0.482);
      wood.addColorStop(0, '#8a5328'); wood.addColorStop(0.45, '#c98a4e'); wood.addColorStop(1, '#8a5328');
      g.strokeStyle = wood;
      g.lineWidth = 6;
      handle(); g.stroke();
      g.strokeStyle = 'rgba(255,236,200,0.6)';
      g.lineWidth = 0.9;
      g.beginPath(); g.moveTo(23.4, 50); g.lineTo(40, 20); g.stroke();
      // leather grip with slanted wraps at the bottom
      g.strokeStyle = '#4a2c1a';
      g.lineWidth = 7.4;
      g.beginPath(); g.moveTo(22.4, 55.2); g.lineTo(27, 46.8); g.stroke();
      g.strokeStyle = '#7a4c30';
      g.lineWidth = 1.3;
      for (var w = 0; w < 3; w++) {
        var cx = 23 + w * 1.6, cy = 54 - w * 2.9;
        g.beginPath(); g.moveTo(cx - 3.3, cy - 1.2); g.lineTo(cx + 3.3, cy + 1.2); g.stroke();
      }
      // the blade: a chunky steel slab, pale on top fading to blue underneath, with a crisp thin edge and soft shadow
      g.shadowColor = 'rgba(40,40,60,0.4)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 1.5;
      blade();
      var steel = g.createLinearGradient(20, 13, 31, 38);
      steel.addColorStop(0, '#dfe4ec'); steel.addColorStop(0.42, '#a3aec8'); steel.addColorStop(0.62, '#7f9cd6'); steel.addColorStop(1, '#5274c0');
      g.fillStyle = steel;
      g.fill();
      g.shadowColor = 'transparent';
      g.save(); blade(); g.clip();
      g.fillStyle = 'rgba(70,80,110,0.22)';               // the slightly darker top face
      g.beginPath(); g.moveTo(14, 21); g.lineTo(31, 11.5); g.lineTo(45, 17.5); g.lineTo(29, 26); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.55)';             // a shine streak along the middle
      g.beginPath(); g.ellipse(30, 25.5, 11, 1.8, -0.45, 0, Math.PI * 2); g.fill();
      // the polished silver cutting edge at the far end
      g.beginPath(); g.moveTo(4, 24); g.lineTo(13, 19.5); g.lineTo(25, 41); g.lineTo(16, 44); g.closePath();
      var edge = g.createLinearGradient(6, 24, 22, 40);
      edge.addColorStop(0, '#f4f7fa'); edge.addColorStop(0.5, '#c3ccd8'); edge.addColorStop(1, '#eef2f6');
      g.fillStyle = edge;
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.95)';
      g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(9, 24.5); g.lineTo(18, 38.5); g.stroke();
      g.restore();
      blade();
      g.strokeStyle = '#3d444c';
      g.lineWidth = 1.5;
      g.stroke();
      g.strokeStyle = '#ffffff';                          // the bright sharpened edge itself
      g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(7, 25.4); g.lineTo(20.6, 39.6); g.stroke();
      // the oval slot near the top of the blade
      g.fillStyle = '#5f6a86';
      g.beginPath(); g.ellipse(32.5, 18.5, 4.6, 1.6, -0.42, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#e8ecf2';
      g.lineWidth = 0.9;
      g.stroke();
      // blue socket gripping the handle
      socket();
      var sock = g.createLinearGradient(40, 15, 48, 28);
      sock.addColorStop(0, '#a6c2f2'); sock.addColorStop(1, '#4a6fc0');
      g.fillStyle = sock;
      g.fill();
      g.strokeStyle = '#34446a';
      g.lineWidth = 1.3;
      g.stroke();
      // a silver collar ring, and the round wooden cap on the end of the handle
      g.fillStyle = '#7b8594';
      g.beginPath(); g.ellipse(44, 15, 5.8, 3.2, -0.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#eef2f7';
      g.beginPath(); g.ellipse(43.8, 14.7, 4.9, 2.4, -0.6, 0, Math.PI * 2); g.fill();
      g.shadowColor = 'rgba(60,30,90,0.3)';
      g.shadowBlur = 2;
      g.shadowOffsetY = 1;
      g.fillStyle = '#5a3418';
      g.beginPath(); g.ellipse(47.5, 9.5, 6.2, 4.6, -0.6, 0, Math.PI * 2); g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = '#a8693a';
      g.beginPath(); g.ellipse(47.5, 9.5, 5.3, 3.7, -0.6, 0, Math.PI * 2); g.fill();
      var top = g.createRadialGradient(46.6, 8.2, 0.5, 47.8, 9, 5);
      top.addColorStop(0, '#e8b07a'); top.addColorStop(1, '#c98a4e');
      g.fillStyle = top;
      g.beginPath(); g.ellipse(47.8, 9, 4.5, 3, -0.6, 0, Math.PI * 2); g.fill();
      // a sparkle on the blade
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(37, 21); g.lineTo(38, 24); g.lineTo(41, 25); g.lineTo(38, 26); g.lineTo(37, 29);
      g.lineTo(36, 26); g.lineTo(33, 25); g.lineTo(36, 24); g.closePath();
      g.fill();
    });
  }
  function iconFiber() {
    return iconCanvas(function (g) {
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.translate(31.1, 32.9);                               // centred and sized to fill the slot
      g.scale(0.924, 0.924);
      g.rotate(0.62);                                         // lying on a slant, like the other items
      // one long grassy strand: a tapered blade that runs from the bottom, through the tied waist, to the top
      function strand(bx, by, tx, ty, wx, wide, col, light) {
        var L = [], R = [], N = 18;
        for (var i = 0; i <= N; i++) {
          var t = i / N, u = 1 - t;
          var x = u * u * bx + 2 * u * t * wx + t * t * tx, y = u * u * by + 2 * u * t * 0 + t * t * ty;
          var dx = 2 * u * (wx - bx) + 2 * t * (tx - wx), dy = 2 * u * (0 - by) + 2 * t * (ty - 0);
          var len = Math.sqrt(dx * dx + dy * dy), w = wide * (0.6 + 0.4 * Math.sin(Math.PI * t)) * (t > 0.7 ? Math.pow((1 - t) / 0.3, 0.7) : 1); // cut flat at the bottom, a fine point at the top
          L.push([x - dy / len * w, y + dx / len * w]);
          R.push([x + dy / len * w, y - dx / len * w]);
        }
        g.beginPath();
        g.moveTo(bx, by + 1);
        for (i = 0; i <= N; i++) g.lineTo(L[i][0], L[i][1]);
        g.lineTo(tx, ty - 1.5);                               // pointed tip
        for (i = N; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
        g.closePath();
        g.fillStyle = col;
        g.fill();
        g.strokeStyle = 'rgba(20,60,20,0.6)';
        g.lineWidth = 0.6;
        g.stroke();
        g.strokeStyle = 'rgba(230,255,190,' + light + ')';     // a pale shine down the middle of the blade
        g.lineWidth = 0.7;
        g.beginPath();
        for (i = 2; i <= N - 2; i++) {
          var p = [(L[i][0] * 0.65 + R[i][0] * 0.35), (L[i][1] * 0.65 + R[i][1] * 0.35)];
          if (i === 2) g.moveTo(p[0], p[1]); else g.lineTo(p[0], p[1]);
        }
        g.stroke();
      }
      g.shadowColor = 'rgba(60,30,90,0.35)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 2;
      g.fillStyle = '#2e6a2a';                                // a dark mass behind, so the bundle reads as full
      g.beginPath();
      g.moveTo(-13, -30); g.quadraticCurveTo(0, -2, 13, -30); g.lineTo(12, 30); g.quadraticCurveTo(0, 2, -12, 30); g.closePath();
      g.fill();
      g.shadowColor = 'transparent';
      var COLS = ['#2f7a2c', '#3f8f36', '#56a845', '#6dbd52', '#86cf62', '#4a9a3c', '#a2d872', '#5fb04a'];
      var order = [0, 18, 4, 14, 9, 2, 16, 6, 12, 1, 17, 5, 11, 8, 3, 15, 7, 13, 10];  // back strands first, front ones last
      for (var o = 0; o < order.length; o++) {
        var k = order[o], u = k / 18 * 2 - 1;
        var depth = o / (order.length - 1);
        strand(u * 12 + ((k * 5) % 3 - 1), 30 - Math.abs(u) * 3 + (k % 2), u * 18 + ((k * 7) % 3 - 1) * 1.5, -32 + Math.abs(u) * 6 + (k % 4) * 1.5,
               u * 3.5, 1.35 + (k % 3) * 0.25, COLS[(k * 3) % COLS.length], (0.25 + depth * 0.4).toFixed(2));
      }
      // two loose wisps that have worked free of the bundle
      g.strokeStyle = '#6dbd52'; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(5, -4); g.bezierCurveTo(14, -10, 20, -6, 21, -15); g.stroke();
      g.strokeStyle = '#4a9a3c';
      g.beginPath(); g.moveTo(-5, 5); g.bezierCurveTo(-14, 9, -19, 6, -21, 14); g.stroke();
      // the twine wrapped round the middle, with a knot and two loose ends
      g.shadowColor = 'rgba(30,20,10,0.4)';
      g.shadowBlur = 2;
      g.shadowOffsetY = 1;
      g.beginPath();
      g.moveTo(-7.5, -4.5); g.quadraticCurveTo(0, -2.8, 7.5, -4.5); g.lineTo(7.5, 4.5); g.quadraticCurveTo(0, 6.2, -7.5, 4.5); g.closePath();
      var tw = g.createLinearGradient(-8, 0, 8, 0);
      tw.addColorStop(0, '#a87a42'); tw.addColorStop(0.35, '#e8c088'); tw.addColorStop(1, '#8a5e2e');
      g.fillStyle = tw;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = 'rgba(90,56,22,0.9)'; g.lineWidth = 0.7;
      g.stroke();
      for (var w = -6; w <= 6; w += 2.4) {                   // the twisted turns of the twine
        g.beginPath(); g.moveTo(w - 1.4, -3.6 - Math.abs(w) * -0.12); g.lineTo(w + 1.4, 4.8); g.stroke();
      }
      g.strokeStyle = 'rgba(255,240,210,0.6)'; g.lineWidth = 0.7;
      g.beginPath(); g.moveTo(-6, -2.2); g.quadraticCurveTo(0, -0.8, 6, -2.2); g.stroke();
      g.fillStyle = '#c4945a';                                // the knot
      g.beginPath(); g.ellipse(8.2, 0.5, 2.6, 2.2, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(90,56,22,0.9)'; g.stroke();
      g.strokeStyle = '#b8884e'; g.lineWidth = 1.5;           // the loose ends
      g.beginPath(); g.moveTo(9.5, 1.5); g.quadraticCurveTo(13, 4, 12, 9); g.stroke();
      g.beginPath(); g.moveTo(10, 0); g.quadraticCurveTo(14.5, 0, 16, 4); g.stroke();
    });
  }
  function iconHay() {
    return iconCanvas(function (g) {
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.translate(3.23, 3.23);                                // centred and sized to fill the slot
      g.scale(0.871, 0.871);
      var seedN = 7;
      function rnd() { seedN = (seedN * 16807) % 2147483647; return seedN / 2147483647; } // the same straw every time
      // a little hay bale seen from above and to the side: O is the bottom front corner
      var O = [26, 56], LX = [34, -12], EX = [-22, -10], UP = [0, -24];
      function pt(a, b, c) { return [O[0] + LX[0] * a + EX[0] * b + UP[0] * c, O[1] + LX[1] * a + EX[1] * b + UP[1] * c]; }
      function face(p) { g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (var i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.closePath(); }
      var top = [pt(0, 0, 1), pt(1, 0, 1), pt(1, 1, 1), pt(0, 1, 1)];
      var side = [pt(0, 0, 0), pt(1, 0, 0), pt(1, 0, 1), pt(0, 0, 1)];
      var end = [pt(0, 0, 0), pt(0, 1, 0), pt(0, 1, 1), pt(0, 0, 1)];
      // straw lying along the bale: lots of short golden strokes, clipped to a face
      function straws(f, map, n, cols) {
        g.save(); face(f); g.clip();
        for (var i = 0; i < n; i++) {
          var s = rnd() * 1.2 - 0.1, t = rnd(), l = 0.12 + rnd() * 0.22, j = (rnd() - 0.5) * 0.06;
          var p0 = map(s, t), p1 = map(s + l, t + j);
          g.strokeStyle = cols[i % cols.length];
          g.lineWidth = 0.8 + rnd() * 0.7;
          g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
        }
        g.restore();
      }
      g.shadowColor = 'rgba(60,30,90,0.35)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 2;
      face([pt(0, 0, 0), pt(1, 0, 0), pt(1, 0, 1), pt(1, 1, 1), pt(0, 1, 1), pt(0, 1, 0)]);
      g.fillStyle = '#c99a32';
      g.fill();
      g.shadowColor = 'transparent';
      // the top: brightest, catching the sun
      face(top);
      var tg = g.createLinearGradient(top[3][0], top[3][1], top[1][0], top[1][1]);
      tg.addColorStop(0, '#fbe79a'); tg.addColorStop(1, '#ecc860');
      g.fillStyle = tg; g.fill();
      straws(top, function (a, b) { return pt(a, b, 1); }, 70, ['#fff2b8', '#e8be52', '#d9a83e', '#f7dc80', '#c8952e']);
      // the long side: warm gold, a little shaded
      face(side);
      var sg = g.createLinearGradient(0, side[3][1], 0, side[0][1]);
      sg.addColorStop(0, '#e9c25a'); sg.addColorStop(1, '#b8862a');
      g.fillStyle = sg; g.fill();
      straws(side, function (a, b) { return pt(a, 0, b); }, 80, ['#f4d878', '#c99a32', '#a87824', '#e6bb52', '#8f6418']);
      // the cut end: darker, showing the ends of the straws
      face(end);
      var eg = g.createLinearGradient(end[1][0], 0, end[0][0], 0);
      eg.addColorStop(0, '#b88a2c'); eg.addColorStop(1, '#d6a844');
      g.fillStyle = eg; g.fill();
      g.save(); face(end); g.clip();
      for (var d = 0; d < 55; d++) {
        var q = pt(0, rnd(), rnd());
        g.fillStyle = d % 3 ? 'rgba(110,72,18,0.55)' : 'rgba(255,236,170,0.7)';
        g.beginPath(); g.ellipse(q[0], q[1], 0.9 + rnd() * 0.5, 0.7, 0, 0, Math.PI * 2); g.fill();
      }
      g.restore();
      // two twine bands wrapped round the bale
      [0.27, 0.73].forEach(function (a) {
        var band = [pt(a, 0, 0), pt(a, 0, 1), pt(a, 1, 1)];
        g.strokeStyle = 'rgba(110,70,15,0.45)'; g.lineWidth = 5.5;   // the straw bulges either side of the tight band
        g.beginPath(); g.moveTo(band[0][0], band[0][1]); g.lineTo(band[1][0], band[1][1]); g.lineTo(band[2][0], band[2][1]); g.stroke();
        g.strokeStyle = '#6e2e18'; g.lineWidth = 3.4;
        g.beginPath(); g.moveTo(band[0][0], band[0][1]); g.lineTo(band[1][0], band[1][1]); g.lineTo(band[2][0], band[2][1]); g.stroke();
        g.strokeStyle = '#b4502e'; g.lineWidth = 2.2;
        g.beginPath(); g.moveTo(band[0][0], band[0][1]); g.lineTo(band[1][0], band[1][1]); g.lineTo(band[2][0], band[2][1]); g.stroke();
        g.strokeStyle = 'rgba(255,200,160,0.6)'; g.lineWidth = 0.7;
        g.beginPath(); g.moveTo(band[0][0] - 0.6, band[0][1]); g.lineTo(band[1][0] - 0.6, band[1][1] + 0.3); g.lineTo(band[2][0], band[2][1] + 0.6); g.stroke();
      });
      // crisp edges
      g.strokeStyle = 'rgba(110,70,15,0.85)'; g.lineWidth = 0.9;
      face([pt(0, 0, 0), pt(1, 0, 0), pt(1, 0, 1), pt(1, 1, 1), pt(0, 1, 1), pt(0, 1, 0)]); g.stroke();
      g.strokeStyle = 'rgba(255,240,190,0.6)'; g.lineWidth = 0.8;
      g.beginPath(); var e0 = pt(0, 0, 1), e1 = pt(1, 0, 1), e2 = pt(0, 1, 1); g.moveTo(e2[0], e2[1]); g.lineTo(e0[0], e0[1]); g.lineTo(e1[0], e1[1]); g.stroke();
      // fuzzy edges: short straws sticking out all round the outline, so it looks soft rather than boxy
      [[[0, 1, 1], [0, 0, 1], -1], [[0, 0, 1], [1, 0, 1], -1], [[1, 0, 1], [1, 1, 1], -1], [[1, 1, 1], [0, 1, 1], -1], [[0, 1, 1], [0, 1, 0], -1], [[1, 0, 0], [1, 0, 1], 1], [[0, 0, 0], [1, 0, 0], 1], [[0, 0, 0], [0, 1, 0], 1]].forEach(function (ed, ei) {
        var a0 = pt(ed[0][0], ed[0][1], ed[0][2]), a1 = pt(ed[1][0], ed[1][1], ed[1][2]);
        var ex = a1[0] - a0[0], ey = a1[1] - a0[1], el = Math.sqrt(ex * ex + ey * ey);
        var nx = ey / el, ny = -ex / el;        // which way is outward from this edge
        var cx = (a0[0] + a1[0]) / 2 - 32, cy = (a0[1] + a1[1]) / 2 - 33;
        if (nx * cx + ny * cy < 0) { nx = -nx; ny = -ny; }
        for (var f = 0; f < 9; f++) {
          var t = rnd(), L = 1.5 + rnd() * 2.5, tw = (rnd() - 0.5) * 0.9;
          var bx = a0[0] + ex * t, by = a0[1] + ey * t;
          g.strokeStyle = f % 3 ? '#e2b44a' : '#f7dc80'; g.lineWidth = 0.9;
          g.beginPath(); g.moveTo(bx - nx * 1.2, by - ny * 1.2); g.lineTo(bx + (nx + ex / el * tw) * L, by + (ny + ey / el * tw) * L); g.stroke();
        }
      });
      // a few longer loose straws poking out of the edges
      [[0.15, 0, 1, -3, -5], [0.5, 1, 1, 1, -6], [0.88, 0, 1, 5, -4], [0, 0.6, 0.5, -6, 1], [0, 0.2, 0.15, -5, 4], [1, 0, 0.6, 6, 1]].forEach(function (s, i) {
        var p = pt(s[0], s[1], s[2]);
        g.strokeStyle = i % 2 ? '#f2d070' : '#d9a83e'; g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo(p[0] + s[3] * 0.6, p[1] + s[4] * 0.3, p[0] + s[3], p[1] + s[4]); g.stroke();
      });
    });
  }
  function iconCoal() {
    return iconCanvas(function (g) {
      // a chunky lump made of flat facets, lit from the top left
      var P = { a: [12, 36], b: [20, 17], c: [38, 9], d: [54, 22], e: [55, 42], f: [40, 56], h: [20, 53], m: [33, 30], n: [42, 40], o: [26, 41] };
      function facet(pts, color) {
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(P[pts[0]][0], P[pts[0]][1]);
        for (var i = 1; i < pts.length; i++) g.lineTo(P[pts[i]][0], P[pts[i]][1]);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(120,120,140,0.35)'; // faint shiny edges between facets
        g.lineWidth = 1;
        g.stroke();
      }
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 4;
      g.shadowOffsetY = 2;
      facet(['a', 'b', 'c', 'd', 'e', 'f', 'h'], '#1c1c22');
      g.shadowColor = 'transparent';
      facet(['b', 'c', 'm'], '#5a5a68');   // brightest, facing the light
      facet(['c', 'd', 'm'], '#454552');
      facet(['a', 'b', 'm', 'o'], '#3c3c48');
      facet(['d', 'e', 'n', 'm'], '#2c2c36');
      facet(['m', 'n', 'o'], '#34343f');
      facet(['o', 'n', 'f', 'h'], '#202028');
      facet(['a', 'o', 'h'], '#26262e');
      facet(['n', 'e', 'f'], '#18181e');
      // fine sparkly grain, like real coal (drawn only on top of the lump)
      g.globalCompositeOperation = 'source-atop';
      for (var i = 0; i < 70; i++) {
        var gx = 14 + Math.random() * 40, gy = 12 + Math.random() * 42;
        g.fillStyle = 'rgba(200,205,230,' + (0.15 + Math.random() * 0.35) + ')';
        g.fillRect(gx, gy, 1, 1);
      }
      g.globalCompositeOperation = 'source-over';
      // little star-shaped glints of shine
      function glint(x, y, r) {
        g.fillStyle = 'rgba(255,255,255,0.95)';
        g.beginPath();
        g.moveTo(x, y - r); g.lineTo(x + r * 0.28, y - r * 0.28); g.lineTo(x + r, y); g.lineTo(x + r * 0.28, y + r * 0.28);
        g.lineTo(x, y + r); g.lineTo(x - r * 0.28, y + r * 0.28); g.lineTo(x - r, y); g.lineTo(x - r * 0.28, y - r * 0.28);
        g.closePath();
        g.fill();
      }
      glint(30, 19, 5);
      glint(46, 27, 3);
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(22, 19); g.lineTo(36, 12); g.stroke(); // a bright top edge
    });
  }
  function iconAcorn() {
    return iconCanvas(function (g) {
      g.lineJoin = 'round';
      g.lineCap = 'round';
      // the nut: plump and glossy, warm brown, with a little pointed tip
      function nutPath() {
        g.beginPath();
        g.moveTo(13.5, 31);
        g.bezierCurveTo(12.5, 46, 24, 56.5, 31, 59.5);
        g.bezierCurveTo(38, 56.5, 49.5, 46, 48.5, 31);
        g.closePath();
      }
      g.shadowColor = 'rgba(60,30,90,0.35)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 2;
      nutPath();
      var nut = g.createRadialGradient(24, 38, 1.5, 31, 43, 21);
      nut.addColorStop(0, '#f6c07a'); nut.addColorStop(0.45, '#d08a44'); nut.addColorStop(0.8, '#9c5a26'); nut.addColorStop(1, '#7a421a');
      g.fillStyle = nut;
      g.fill();
      g.shadowColor = 'transparent';
      g.save(); nutPath(); g.clip();
      var under = g.createLinearGradient(0, 31, 0, 40);      // the cap's soft shadow on the nut
      under.addColorStop(0, 'rgba(60,30,10,0.55)'); under.addColorStop(1, 'rgba(60,30,10,0)');
      g.fillStyle = under;
      g.fillRect(10, 31, 42, 9);
      g.strokeStyle = 'rgba(120,64,25,0.35)';                // faint lengthwise stripes
      g.lineWidth = 1;
      [[22, 25.5], [31, 31], [40, 36.5]].forEach(function (st) {
        g.beginPath(); g.moveTo(st[0], 34); g.quadraticCurveTo(st[1], 48, 31, 58); g.stroke();
      });
      g.restore();
      nutPath();
      g.strokeStyle = '#5a3418';
      g.lineWidth = 1.5;
      g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.6)';                 // glossy shine, and a smaller second glint
      g.beginPath(); g.ellipse(21.5, 41, 2.4, 6.4, 0.3, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.45)';
      g.beginPath(); g.ellipse(25.5, 51, 1.1, 1.8, 0.4, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5a3418';                                // the little pointed tip
      g.beginPath(); g.moveTo(29.5, 58.6); g.lineTo(31, 62.6); g.lineTo(32.5, 58.6); g.closePath(); g.fill();
      // the cap: rows of overlapping little scales, with a rim that overhangs the nut
      function capPath() {
        g.beginPath();
        g.moveTo(9.5, 31.5);
        g.bezierCurveTo(9.5, 14.5, 52.5, 14.5, 52.5, 31.5);
        g.quadraticCurveTo(52.5, 35.5, 47.5, 35.5);
        g.quadraticCurveTo(31, 38.5, 14.5, 35.5);
        g.quadraticCurveTo(9.5, 35.5, 9.5, 31.5);
        g.closePath();
      }
      g.shadowColor = 'rgba(40,20,10,0.45)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 1.5;
      capPath();
      var cap = g.createLinearGradient(0, 17, 0, 37);
      cap.addColorStop(0, '#a88058'); cap.addColorStop(1, '#5a3d24');
      g.fillStyle = cap;
      g.fill();
      g.shadowColor = 'transparent';
      g.save(); capPath(); g.clip();
      for (var row = 0; row < 6; row++) {                    // little rounded scales, each row shifted
        var y = 18 + row * 3.4, shade = 0.85 - row * 0.07;
        for (var x = 8 + (row % 2) * 2.6; x < 55; x += 5.2) {
          g.fillStyle = 'rgba(' + Math.round(150 * shade) + ',' + Math.round(108 * shade) + ',' + Math.round(70 * shade) + ',1)';
          g.beginPath(); g.ellipse(x, y, 2.6, 2.1, 0, 0, Math.PI * 2); g.fill();
          g.strokeStyle = 'rgba(55,34,18,0.7)';
          g.lineWidth = 0.8;
          g.beginPath(); g.arc(x, y - 0.4, 2.5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); // the shadowed lower edge
          g.fillStyle = 'rgba(255,235,200,0.35)';
          g.beginPath(); g.ellipse(x - 0.6, y - 0.9, 1.1, 0.6, 0, 0, Math.PI * 2); g.fill(); // a light tip
        }
      }
      g.fillStyle = 'rgba(255,230,190,0.25)';                // light catching the top of the cap
      g.beginPath(); g.ellipse(25, 21, 10, 3.4, -0.15, 0, Math.PI * 2); g.fill();
      g.restore();
      capPath();
      g.strokeStyle = '#3e2a18';
      g.lineWidth = 1.5;
      g.stroke();
      g.strokeStyle = 'rgba(255,225,180,0.55)';              // a highlight along the rim
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(14, 34.4); g.quadraticCurveTo(31, 37.2, 48, 34.4); g.stroke();
      // the curved stem
      g.strokeStyle = '#3e2a18';
      g.lineWidth = 4.4;
      g.beginPath(); g.moveTo(31, 19.5); g.quadraticCurveTo(30.5, 10.5, 36, 6); g.stroke();
      g.strokeStyle = '#86603a';
      g.lineWidth = 2.3;
      g.beginPath(); g.moveTo(31, 19.5); g.quadraticCurveTo(30.5, 10.5, 36, 6); g.stroke();
      g.strokeStyle = 'rgba(255,230,190,0.5)';
      g.lineWidth = 0.8;
      g.beginPath(); g.moveTo(30.4, 17.5); g.quadraticCurveTo(30.2, 11, 34.6, 6.8); g.stroke();
    });
  }
  function iconPinecone() {
    return iconCanvas(function (g) {
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.translate(33, 33.9);                                 // centred and sized to fill the slot
      g.scale(0.953, 0.953);
      g.rotate(-0.38);                                        // tipped over a little, like it just fell
      var TOP = -27, BOT = 27;
      function halfW(y) {                                     // an egg shape: rounded top, widest just above the middle, blunt point at the bottom
        var t = (y - TOP) / (BOT - TOP);
        return 15.5 * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.65);
      }
      // the woody stem
      g.strokeStyle = '#4a2a12'; g.lineWidth = 3.6;
      g.beginPath(); g.moveTo(0, TOP + 4); g.quadraticCurveTo(-1, TOP - 3, 3.5, TOP - 6); g.stroke();
      g.strokeStyle = '#9a6a3a'; g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(-0.6, TOP + 2); g.quadraticCurveTo(-1.4, TOP - 2.6, 3, TOP - 5.4); g.stroke();
      // the dark core that shows between the scales, with a soft drop shadow
      g.shadowColor = 'rgba(60,30,90,0.4)';
      g.shadowBlur = 3.5;
      g.shadowOffsetY = 2;
      g.beginPath();
      for (var y = TOP; y <= BOT; y += 1) g.lineTo(halfW(y) * 0.92, y);
      for (y = BOT; y >= TOP; y -= 1) g.lineTo(-halfW(y) * 0.92, y);
      g.closePath();
      g.fillStyle = '#3a1e0c';
      g.fill();
      g.shadowColor = 'transparent';
      // one woody scale: narrow where it tucks in, broad and pointed at its open tip
      function scale(x, y, w, h, tilt, light) {
        g.save();
        g.translate(x, y);
        g.rotate(tilt);
        g.beginPath();
        g.moveTo(-w * 0.28, -h * 0.5);
        g.bezierCurveTo(-w * 0.62, -h * 0.05, -w * 0.58, h * 0.3, -w * 0.12, h * 0.46);
        g.lineTo(0, h * 0.56);
        g.lineTo(w * 0.12, h * 0.46);
        g.bezierCurveTo(w * 0.58, h * 0.3, w * 0.62, -h * 0.05, w * 0.28, -h * 0.5);
        g.closePath();
        var sg = g.createLinearGradient(0, -h * 0.5, 0, h * 0.55);
        sg.addColorStop(0, 'rgb(' + Math.round(70 * light) + ',' + Math.round(36 * light) + ',' + Math.round(14 * light) + ')');
        sg.addColorStop(0.45, 'rgb(' + Math.round(150 * light) + ',' + Math.round(86 * light) + ',' + Math.round(40 * light) + ')');
        sg.addColorStop(1, 'rgb(' + Math.round(222 * light) + ',' + Math.round(152 * light) + ',' + Math.round(86 * light) + ')');
        g.fillStyle = sg;
        g.fill();
        g.strokeStyle = 'rgba(36,16,6,0.85)';
        g.lineWidth = 0.8;
        g.stroke();
        if (w > 5) {
          g.fillStyle = 'rgba(250,215,160,' + (0.55 * light).toFixed(2) + ')'; // the pale worn tip
          g.beginPath(); g.moveTo(-w * 0.16, h * 0.3); g.lineTo(0, h * 0.5); g.lineTo(w * 0.16, h * 0.3); g.lineTo(0, h * 0.2); g.closePath(); g.fill();
          g.strokeStyle = 'rgba(255,236,200,0.5)';             // a sunlit left edge
          g.lineWidth = 0.7;
          g.beginPath(); g.moveTo(-w * 0.42, -h * 0.05); g.quadraticCurveTo(-w * 0.44, h * 0.25, -w * 0.12, h * 0.42); g.stroke();
          g.strokeStyle = 'rgba(50,24,8,0.55)';                // the ridge down the middle
          g.beginPath(); g.moveTo(0, -h * 0.25); g.lineTo(0, h * 0.2); g.stroke();
        }
        g.restore();
      }
      // rows from the bottom up, each row tucked under the one above; scales around the sides flare outward
      for (var row = 10; row >= 0; row--) {
        var ry = TOP + 3 + row * 4.8, hw = halfW(ry + 2), n = row < 2 ? 3 : 5;
        for (var k = 0; k <= n; k++) {
          var a = -Math.PI / 2 + ((k + (row % 2) * 0.5) / n) * Math.PI;
          if (a > Math.PI / 2 + 0.01) continue;
          var face = Math.cos(a), side = Math.sin(a);
          var light = 0.62 + 0.42 * Math.max(0, Math.cos(a + 0.6));   // lit from the upper left
          var w = Math.max(3, hw * 0.75 * (0.4 + 0.6 * face) + 2);
          scale(side * hw * 0.88, ry + 1.5 * (1 - face), w, 7.5 + hw * 0.12, -side * 0.85, light);
        }
      }
    });
  }
  var BAG_SLOTS = 12;
  // The bag has 12 fixed slots; an empty slot is null, so items stay wherever you put them
  var bag = [{ id: 'seed', count: 6 }, { id: 'axe', count: 1 }, { id: 'pickaxe', count: 1 }, { id: 'trimmers', count: 1 }, { id: 'hoe', count: 1 }];
  while (bag.length < BAG_SLOTS) bag.push(null);
  var bagUi = {
    box: document.getElementById('inventory'),
    grid: document.getElementById('invGrid'),
    info: document.getElementById('invInfo'),
    open: document.getElementById('btnBag'),
    close: document.getElementById('btnCloseBag')
  };
  var selectedSlot = -1;
  var ROW_SIZE = 4, hotRow = 0; // the hotbar shows one row of the bag at a time
  var hotUi = { slots: document.getElementById('hotbarSlots'), row: document.getElementById('btnRow') };

  function heldItem() { return bag[selectedSlot] ? bag[selectedSlot].id : null; } // what's selected in the hotbar
  function bagCount(id) {
    for (var i = 0; i < BAG_SLOTS; i++) if (bag[i] && bag[i].id === id) return bag[i].count;
    return 0;
  }
  // Adds items to the bag: onto a stack you already have, or into the first empty slot.
  // Returns false if the bag is full
  function addItem(id, n) {
    var i;
    for (i = 0; i < BAG_SLOTS; i++) {
      if (bag[i] && bag[i].id === id) { bag[i].count += n; renderBag(); return true; }
    }
    for (i = 0; i < BAG_SLOTS; i++) {
      if (!bag[i]) { bag[i] = { id: id, count: n }; renderBag(); return true; }
    }
    return false;
  }
  // Is there room in the bag for all of these kinds of item? (each one either joins a stack or needs an empty slot)
  function roomFor(ids) {
    var empty = 0, need = 0, i;
    for (i = 0; i < BAG_SLOTS; i++) if (!bag[i]) empty++;
    ids.forEach(function (id) { if (!bagCount(id)) need++; });
    return need <= empty;
  }
  // The bag is full: a message and a soft "uh-oh" (not over and over while you stand next to something)
  var bagFullAt = -99;
  function bagFull() {
    if (state.time - bagFullAt < 2.5) return;
    bagFullAt = state.time;
    showToast('🎒 Inventory full!', 1800);
    if (!audioCtx) return;
    bellTone(659, 0.09, 0.35, 0);       // two soft notes, the second lower
    bellTone(523, 0.09, 0.5, 0.14);
    bellTone(1046, 0.025, 0.25, 0);
  }
  // Takes items out of the bag; returns false if you don't have enough
  function takeItem(id, n) {
    for (var i = 0; i < BAG_SLOTS; i++) {
      if (bag[i] && bag[i].id === id && bag[i].count >= n) {
        bag[i].count -= n;
        if (bag[i].count === 0) { // that slot is now empty
          bag[i] = null;
          if (selectedSlot === i) selectedSlot = -1;
        }
        renderBag();
        return true;
      }
    }
    return false;
  }
  function describeSlot() {
    var it = bag[selectedSlot];
    bagUi.info.textContent = it ? ITEMS[it.id].icon + ' ' + ITEMS[it.id].name + ' × ' + it.count + ' — ' + ITEMS[it.id].info
      + (ITEMS[it.id].price && !isTool(it.id) ? ' Sells for ' + ITEMS[it.id].price + ' Star Coins in the shipping bin.' : '')
      : 'Tap an item to see what it is.';
    updateTrashRow();
  }
  // Delete buttons under the item's description, for getting rid of something straight away (never your tools)
  var trashRow = null, trashOne = null, trashAll = null, trashArmed = false;
  function updateTrashRow() {
    if (!trashRow) return;                                       // (the bag can be drawn before the buttons are made)
    var it = bag[selectedSlot];
    trashArmed = false;
    trashRow.hidden = !it || isTool(it.id);
    if (trashRow.hidden) return;
    trashOne.textContent = '🗑 Delete 1';
    trashAll.textContent = '🗑 Delete all ' + it.count;
    trashAll.classList.remove('armed');
    trashAll.hidden = it.count < 2;
  }
  function trashSelected(all) {
    var it = bag[selectedSlot];
    if (!it || isTool(it.id)) return;
    if (all && !trashArmed) {                                    // deleting a whole stack needs a second tap, just in case
      trashArmed = true;
      trashAll.textContent = 'Tap again to delete all ' + it.count;
      trashAll.classList.add('armed');
      return;
    }
    var n = all ? it.count : 1, name = ITEMS[it.id].name;
    takeItem(it.id, n);
    if (audioCtx) hissBurst(0.18, 'bandpass', 900, 0.8, 0.12, 0.005, 0.15); // a soft poof
    showToast('Deleted ' + n + ' ' + name, 1600);
  }

  // ---------- Star Coins: the island's money. Sell things from your bag to earn them ----------
  var coinUi = document.createElement('div');                  // the coin counter in the top bar, next to the clock
  coinUi.className = 'stat coins';
  coinUi.title = 'Star Coins';
  coinUi.innerHTML = '<img class="coin-icon" alt=""> <b id="coins">0</b>';
  var statsBar = document.querySelector('.stats');
  if (statsBar) {
    statsBar.insertBefore(coinUi, statsBar.firstChild);
    statsBar.style.flexWrap = 'nowrap';                        // coins, clock and mana all stay on one row
  }
  var coinCount = coinUi.querySelector('b');
  function showCoins(bump) {
    coinCount.textContent = state.coins;
    if (bump) { coinUi.classList.remove('bump'); void coinUi.offsetWidth; coinUi.classList.add('bump'); } // a little hop when you earn some
  }
  function isTool(id) { return id === 'axe' || id === 'pickaxe' || id === 'trimmers' || id === 'hoe'; }
  trashRow = document.createElement('div');
  trashRow.className = 'trash-row';
  trashRow.innerHTML = '<button type="button" class="trash-btn"></button><button type="button" class="trash-btn"></button>';
  if (bagUi.box) bagUi.box.appendChild(trashRow);
  trashOne = trashRow.children[0]; trashAll = trashRow.children[1];
  trashOne.addEventListener('click', function () { trashSelected(false); });
  trashAll.addEventListener('click', function () { trashSelected(true); });
  updateTrashRow();
  function coinSound(n) {                                       // a bright jingle of coins: more coins, a longer jingle
    if (!audioCtx) return;
    var clinks = Math.min(6, 1 + Math.floor(n / 3));
    for (var c = 0; c < clinks; c++) {
      var w = c * 0.07;
      bellTone(2637 + (c % 2) * 500, 0.06, 0.25, w);
      bellTone(3951 + (c % 3) * 300, 0.03, 0.18, w + 0.01);
    }
    bellTone(1568, 0.05, 0.6, clinks * 0.07);
    bellTone(2349, 0.04, 0.7, clinks * 0.07 + 0.02);
  }
  var coinPicture = null;
  function paintCoinIcons(root) {                               // every coin picture uses the same drawn coin
    if (!coinPicture) coinPicture = iconCoin();
    var imgs = root.querySelectorAll('img.coin-icon');
    for (var ci = 0; ci < imgs.length; ci++) {
      imgs[ci].src = coinPicture;
      imgs[ci].style.width = imgs[ci].style.height = '1.15em';   // a small coin, the same height as the writing beside it
      imgs[ci].style.verticalAlign = '-0.22em';
    }
  }
  paintCoinIcons(coinUi);
  showCoins(false);

  // ---------- The shipping bin: put things in to sell them. They sell at 6 am the next morning ----------
  var shipBin = [];                                             // what's in the bin: [{ id, count }], as many kinds as you like
  var lastFarmDay = null;                                       // so we notice when 6 am comes round
  var binOpen = false, menuOpenedAt = 0;                         // when a menu last opened, so a double tap can't snap it shut
  function menuJustOpened() { return Date.now() - menuOpenedAt < 600; }
  var binWorld = houseToWorld(BIN_X, BIN_Z);
  function nearBin(range) { return !indoors && dist(player.position.x, player.position.z, binWorld.x, binWorld.z) < (range || 1.9); }
  var shipBtn = document.createElement('button');               // pops up when you're next to the bin
  shipBtn.type = 'button';
  shipBtn.className = 'sleep-btn ship-btn';
  shipBtn.innerHTML = '📦 Shipping Bin <kbd>E</kbd>';
  canvas.parentNode.appendChild(shipBtn);
  var shipBox = document.createElement('div');                  // the bin screen: your bag on one side, the bin on the other
  shipBox.className = 'inventory ship';
  shipBox.hidden = true;
  shipBox.innerHTML = '<div class="inv-head"><b>📦 Shipping Bin</b><button type="button" class="inv-close" aria-label="Close the shipping bin">✕</button></div>' +
    '<p class="ship-hint">Tap something in your bag to put it in the bin, or tap it in the bin to take it back out. Everything in the bin sells at 6 am tomorrow.</p>' +
    '<div class="ship-cols"><div><h4>Your bag</h4><div class="inv-grid ship-bag"></div></div>' +
    '<div><h4>In the bin</h4><div class="ship-bin"></div></div></div>' +
    '<p class="ship-total">Sells at 6 am for <img class="coin-icon" alt=""> <b>0</b></p>';
  canvas.parentNode.appendChild(shipBox);
  paintCoinIcons(shipBox);
  var shipBagGrid = shipBox.querySelector('.ship-bag'), shipBinGrid = shipBox.querySelector('.ship-bin'), shipTotal = shipBox.querySelector('.ship-total b');
  shipBox.querySelector('.inv-close').addEventListener('click', function () { closeBin(); focusGame(); });
  function binValue() {
    var total = 0;
    shipBin.forEach(function (st) { total += ITEMS[st.id].price * st.count; });
    return total;
  }
  function shipSlot(id, count, locked) {                        // one square showing an item and how many
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot' + (locked ? ' locked' : '');
    b.appendChild(itemPicture(id));
    if (!isTool(id)) { var c = document.createElement('span'); c.className = 'count'; c.textContent = count; b.appendChild(c); } // tools don't show a count
    b.title = ITEMS[id].name + (locked ? ' (tools can\'t be shipped)' : '');
    return b;
  }
  function renderShip() {
    if (shipBox.hidden) return;
    shipBagGrid.innerHTML = '';
    bag.forEach(function (it, i) {
      if (!it) { var e = document.createElement('div'); e.className = 'slot empty'; shipBagGrid.appendChild(e); return; }
      var locked = isTool(it.id) || !ITEMS[it.id].price;
      var b = shipSlot(it.id, it.count, locked);
      b.addEventListener('click', function () {
        if (locked) { showToast('Tools can\'t go in the shipping bin', 1800); return; }
        shipItem(i);
      });
      shipBagGrid.appendChild(b);
    });
    shipBinGrid.innerHTML = '';
    if (!shipBin.length) shipBinGrid.innerHTML = '<p class="ship-empty">The bin is empty.</p>';
    shipBin.forEach(function (st, n) {
      var b = shipSlot(st.id, st.count, false);
      b.addEventListener('click', function () { unshipItem(n); });
      shipBinGrid.appendChild(b);
    });
    shipTotal.textContent = binValue();
  }
  function shipItem(i) {                                        // the whole stack from that bag slot goes in the bin
    var it = bag[i];
    if (!it || isTool(it.id) || !ITEMS[it.id].price) return;
    var found = null;
    shipBin.forEach(function (st) { if (st.id === it.id) found = st; });
    if (found) found.count += it.count; else shipBin.push({ id: it.id, count: it.count });
    bag[i] = null;
    if (selectedSlot === i) selectedSlot = -1;
    renderBag();
    renderShip();
    binThunk();
  }
  function unshipItem(n) {                                      // take a stack back out of the bin, if your bag has room
    var st = shipBin[n];
    if (!st) return;
    if (!addItem(st.id, st.count)) { bagFull(); return; }
    shipBin.splice(n, 1);
    renderShip();
    popSound();
  }
  function binThunk() {                                         // a soft wooden thunk as things drop into the crate
    if (!audioCtx) return;
    hissBurst(0.12, 'lowpass', 500, 0.6, 0.25, 0.002, 0.08);
    slideTone('triangle', 180, 90, 0.25, 0.12);
  }
  function openBin() {
    if (binOpen) return;
    toggleBag(false);
    binOpen = true;
    menuOpenedAt = Date.now();
    walkTarget = null;
    shipBox.hidden = false;
    renderShip();
  }
  function closeBin() {
    binOpen = false;
    shipBox.hidden = true;
  }
  shipBtn.addEventListener('click', function () { openBin(); focusGame(); });
  window.addEventListener('keydown', function (e) { if (e.code === 'Escape' && binOpen) closeBin(); });
  function payOutBin() {                                        // 6 am: everything in the bin is sold
    var total = binValue();
    if (!total) return;
    shipBin = [];
    state.coins += total;
    showCoins(true);
    coinSound(20);
    showToast('☀ Your shipping bin sold for ' + total + ' Star Coins!', 3600);
    renderShip();
  }
  function updateShipping(dt) {
    var fd = farmDay();
    if (lastFarmDay === null) lastFarmDay = fd;
    if (fd !== lastFarmDay) { lastFarmDay = fd; payOutBin(); }  // a new morning has come
    var near = nearBin();
    if (binOpen && !nearBin(3.2)) closeBin();                    // it stays open until you really walk away
    var show = near && !binOpen;
    if (shipBtn.classList.contains('show') !== show) shipBtn.classList.toggle('show', show);
    var lidTarget = binOpen ? -1.2 : 0;                          // the lid swings open while you use it
    binLid.rotation.x += (lidTarget - binLid.rotation.x) * Math.min(1, dt * 8);
  }
  // ---------- Inside Whimsy & Bloom ----------
  // Its own room, drawn instead of the island while you're inside, just like the farmhouse: a bright white boutique with a
  // dark wood plank floor and white marble hexagon tiles spilling round the counter, black metal shelves of glass lanterns,
  // seed jars, bottles and packets, a white marble counter with a black top under brass dome lamps (stand at the counter
  // to buy seeds), a black steel-grid window over a green back cabinet, white ceiling rails with trailing vines, a big
  // window with a glass table of orchids, and spinner racks of seed packets. Walk back to the door to leave
  var shopScene = new THREE.Scene();
  shopScene.background = new THREE.Color(0x1c1228);
  var SIN_X = 200, SIN_Z = 1000, SIN_W = 11, SIN_D = 8, SIN_H = 3.8;   // where the room is built, far from everything, and its size
  var inShop = false;
  var shopRoom = new THREE.Group();
  shopRoom.position.set(SIN_X, 0, SIN_Z);
  shopScene.add(shopRoom);
  var shopInHemi = new THREE.HemisphereLight(0xfffaf2, 0x8c8070, 0.62);
  shopScene.add(shopInHemi);
  var shopInSun = new THREE.DirectionalLight(0xfff0dc, 0.55);       // daylight slanting in through the big window, casting soft shadows
  shopInSun.position.set(SIN_X - 7, 8, SIN_Z + 3);
  shopInSun.target.position.set(SIN_X + 1, 0, SIN_Z - 0.5);
  shopInSun.castShadow = true;
  shopInSun.shadow.mapSize.set(2048, 2048);
  shopInSun.shadow.camera.left = -8; shopInSun.shadow.camera.right = 8; shopInSun.shadow.camera.top = 7; shopInSun.shadow.camera.bottom = -7;
  shopInSun.shadow.camera.near = 1; shopInSun.shadow.camera.far = 25;
  shopInSun.shadow.bias = -0.0006; shopInSun.shadow.normalBias = 0.02;
  shopScene.add(shopInSun); shopScene.add(shopInSun.target);
  var shopInLamp = new THREE.PointLight(0xffe2b8, 0.45, 9);           // warm light under the brass lamps
  shopInLamp.position.set(SIN_X + 2.4, 2.3, SIN_Z - 1.4);
  shopScene.add(shopInLamp);
  var shopInLamp2 = new THREE.PointLight(0xfff4e6, 0.5, 14);          // soft daylight across the room
  shopInLamp2.position.set(SIN_X - 2.5, 3.4, SIN_Z + 0.5);
  shopScene.add(shopInLamp2);
  function siPart(geo, mat, x, y, z, rx, ry, rz, parent) {            // one piece of the shop room (x, z from the middle of the floor)
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.set(rx || 0, ry || 0, rz || 0);
    m.castShadow = !mat.transparent && !mat.emissiveMap;               // glass and windows let the light through
    m.receiveShadow = true;
    (parent || shopRoom).add(m);
    return m;
  }
  var shopInSolids = [];                                              // things you bump into (room positions: x, z, radius)
  var CNT_X = 2.4, CNT_Z = -1.6, CNT_W = 3.0;                         // the counter: middle, and length

  // the floor: dark oak planks, with white marble hexagon tiles spilling out round the counter
  var SI_PPM = 186;                                                   // canvas pixels per metre of floor
  var siFloorTex = paintTexture(2048, 1490, function (g, w, h) {
    var PW = 0.2 * SI_PPM;
    for (var r = 0; r * PW < h; r++) {                                 // long planks with grain and staggered joints
      var x = -isle2Hash(r * 3.7) * 300;
      while (x < w) {
        var len = (1.2 + isle2Hash(r * 11 + x) * 1.0) * SI_PPM, l = 27 + isle2Hash(r * 5 + x * 0.3) * 10;
        g.fillStyle = 'hsl(' + (24 + isle2Hash(x + r) * 6) + ',38%,' + l + '%)';
        g.fillRect(x + 1, r * PW + 1, len - 2, PW - 2);
        g.strokeStyle = 'rgba(40,22,12,0.25)'; g.lineWidth = 1;
        for (var k = 0; k < 5; k++) {
          var gy = r * PW + 4 + k * (PW - 8) / 4;
          g.beginPath(); g.moveTo(x + 2, gy); g.bezierCurveTo(x + len * 0.3, gy + 2, x + len * 0.6, gy - 2, x + len - 2, gy + (isle2Hash(k + r) - 0.5) * 3); g.stroke();
        }
        g.fillStyle = 'rgba(255,240,220,0.05)'; g.fillRect(x + 1, r * PW + 2, len - 2, 3);
        x += len;
      }
    }
  });
  siFloorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var siMarbleTex = paintTexture(256, 128, function (g, w, h) {       // white marble with soft grey veins
    g.fillStyle = '#f3f2ef'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(140,140,148,0.3)'; g.lineWidth = 1.2;
    for (var v = 0; v < 9; v++) {
      g.beginPath(); var x = isle2Hash(v * 3) * w; g.moveTo(x, 0);
      for (var y = 0; y <= h; y += 8) { x += (isle2Hash(v * 11 + y) - 0.45) * 14; g.lineTo(x, y); }
      g.stroke();
    }
    g.strokeStyle = 'rgba(200,200,205,0.6)'; g.lineWidth = 2;          // tiles laid in a herringbone
    for (var hx = -h; hx < w + h; hx += 32) { g.beginPath(); g.moveTo(hx, 0); g.lineTo(hx + h / 2, h / 2); g.lineTo(hx, h); g.stroke(); }
  });
  function siViewPaint(g, w, h, seedN) {                              // a sunny garden seen through the glass: sky, clouds, hills, trees, a fence and flower beds
    var k = seedN || 0, H = function (n) { return isle2Hash(n + k * 17.3); };
    var sky = g.createLinearGradient(0, 0, 0, h * 0.6); sky.addColorStop(0, '#7fbfea'); sky.addColorStop(0.7, '#cfe9f8'); sky.addColorStop(1, '#eef7fb');
    g.fillStyle = sky; g.fillRect(0, 0, w, h);
    for (var c = 0; c < 4; c++) {                                      // soft clouds
      var cx = H(c * 3.1) * w, cy = h * (0.08 + H(c * 5.7) * 0.2), cw = w * (0.12 + H(c * 2.3) * 0.1);
      for (var p = 0; p < 7; p++) {
        var px = cx + (H(c * 11 + p) - 0.5) * cw, py = cy + (H(c * 13 + p) - 0.5) * cw * 0.25, pr = cw * (0.18 + H(c * 7 + p) * 0.16);
        var cg = g.createRadialGradient(px, py, 0, px, py, pr); cg.addColorStop(0, 'rgba(255,255,255,0.9)'); cg.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = cg; g.fillRect(px - pr, py - pr, pr * 2, pr * 2);
      }
    }
    [['#b9d6c2', 0.5, 0.06], ['#9cc59a', 0.56, 0.05], ['#86b876', 0.62, 0.04]].forEach(function (hl, n) {   // hills, paler in the distance
      g.fillStyle = hl[0]; g.beginPath(); g.moveTo(0, h);
      for (var x = 0; x <= w; x += w / 40) g.lineTo(x, h * hl[1] - Math.sin(x / w * 5 + n * 2 + k) * h * hl[2] - Math.sin(x / w * 13 + n) * h * 0.012);
      g.lineTo(w, h); g.closePath(); g.fill();
    });
    function tree(x, base, size) {                                     // a round tree: trunk, then lots of leafy blobs, lit from the top left
      g.fillStyle = '#6a4a32'; g.fillRect(x - size * 0.07, base - size * 0.9, size * 0.14, size * 0.9);
      g.fillStyle = 'rgba(40,60,30,0.35)'; g.beginPath(); g.ellipse(x, base, size * 0.55, size * 0.08, 0, 0, Math.PI * 2); g.fill();
      for (var b = 0; b < 26; b++) {
        var a2 = H(x + b * 1.7) * Math.PI * 2, d = Math.sqrt(H(x + b * 2.9)) * size * 0.55, bx = x + Math.cos(a2) * d, by = base - size * 1.25 + Math.sin(a2) * d * 0.85, br = size * (0.16 + H(x + b) * 0.12);
        var lit = (bx < x ? 0.12 : 0) + (by < base - size * 1.25 ? 0.1 : 0);
        g.fillStyle = 'hsl(' + (100 + H(b + x) * 20) + ',38%,' + (30 + lit * 100 + H(x * 3 + b) * 8) + '%)';
        g.beginPath(); g.arc(bx, by, br, 0, Math.PI * 2); g.fill();
      }
    }
    for (var t = 0; t < 4; t++) tree(w * (0.08 + t * 0.28 + (H(t * 9.1) - 0.5) * 0.1), h * (0.62 + H(t * 4.3) * 0.04), h * (0.16 + H(t * 6.1) * 0.08));
    var lawn = g.createLinearGradient(0, h * 0.64, 0, h); lawn.addColorStop(0, '#8cc070'); lawn.addColorStop(1, '#5f9a4a');
    g.fillStyle = lawn; g.fillRect(0, h * 0.68, w, h);
    g.strokeStyle = 'rgba(40,80,30,0.35)'; g.lineWidth = 1;
    for (var gr = 0; gr < 300; gr++) { var gx = H(gr * 1.9) * w, gy = h * 0.7 + H(gr * 2.7) * h * 0.3; g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + (H(gr) - 0.5) * 3, gy - 3 - H(gr * 5) * 4); g.stroke(); }
    var fy = h * 0.73;                                                  // a white picket fence
    g.fillStyle = '#f4f1ea'; g.fillRect(0, fy - h * 0.05, w, h * 0.012); g.fillRect(0, fy - h * 0.02, w, h * 0.012);
    for (var f = 0; f < w; f += w / 28) {
      g.fillStyle = '#f7f4ee'; g.beginPath(); g.moveTo(f, fy); g.lineTo(f, fy - h * 0.07); g.lineTo(f + w / 70, fy - h * 0.085); g.lineTo(f + w / 35, fy - h * 0.07); g.lineTo(f + w / 35, fy); g.fill();
      g.fillStyle = 'rgba(120,120,110,0.3)'; g.fillRect(f + w / 45, fy - h * 0.07, w / 120, h * 0.07);
    }
    for (var i = 0; i < 160; i++) {                                     // flower beds in front of the fence
      var fx = H(i * 1.3) * w, fy2 = fy + 2 + H(i * 2.9) * h * 0.2, fr = 1.5 + H(i) * 2.5 * (fy2 / h);
      g.fillStyle = 'rgba(50,90,40,0.8)'; g.beginPath(); g.arc(fx, fy2 + fr, fr * 1.4, 0, Math.PI * 2); g.fill();
      g.fillStyle = ['#f7b8d8', '#fff1b8', '#c9b3ef', '#ffffff', '#f49ab8'][i % 5]; g.beginPath(); g.arc(fx, fy2, fr, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,220,100,0.9)'; g.beginPath(); g.arc(fx, fy2, fr * 0.35, 0, Math.PI * 2); g.fill();
    }
  }
  var siViewTex = paintTexture(1024, 700, function (g, w, h) { siViewPaint(g, w, h, 1); });
  var siFrontViewTex = paintTexture(640, 400, function (g, w, h) { siViewPaint(g, w, h, 2); });
  var siDoorViewTex = paintTexture(256, 336, function (g, w, h) { siViewPaint(g, w, h, 3); });
  var siGlassTex = alphaTex(128, 128, function (u, v) {               // reflections on the glass, see-through everywhere else
    return stopsAt((u + v) / 2, [[0.15, 0], [0.26, 0.22], [0.31, 0.04], [0.38, 0.14], [0.46, 0], [0.7, 0], [0.76, 0.1], [0.82, 0]]);
  });
  var siPaneMat = new THREE.MeshStandardMaterial({ map: siGlassTex, transparent: true, roughness: 0.05, metalness: 0.3, depthWrite: false });
  var siTintMat = new THREE.MeshStandardMaterial({ color: 0xcfe2ea, transparent: true, opacity: 0.08, roughness: 0.05, metalness: 0.4, depthWrite: false });
  var siCasing = new THREE.MeshStandardMaterial({ color: 0xf6f4ef, roughness: 0.55 });
  var siPlum = new THREE.MeshStandardMaterial({ color: 0x43304f, roughness: 0.5 });
  function siWindow(wall, cx, cy, ww, wh, viewMat, opts) {            // a framed window: the view, the glass, glazing bars, a deep casing and a sill
    var o = opts || {}, bar = o.barMat || siCasing, z = o.z || 0, bw = o.barW || 0.035, colH = o.colH || wh;
    if (viewMat) siWallPart(wall, new THREE.PlaneGeometry(ww, wh), viewMat, cx, cy, z + 0.01);
    else siWallPart(wall, new THREE.PlaneGeometry(ww, wh), siTintMat, cx, cy, z + 0.02).renderOrder = 2;   // a faint tint in the real glass
    siWallPart(wall, new THREE.PlaneGeometry(ww, wh), siPaneMat, cx, cy, z + 0.06).renderOrder = 3;
    (o.cols || []).forEach(function (fx) { siWallPart(wall, new THREE.BoxGeometry(bw, colH, 0.04), bar, cx - ww / 2 + fx * ww, cy - wh / 2 + colH / 2, z + 0.03); });
    (o.rows || []).forEach(function (fy) { siWallPart(wall, new THREE.BoxGeometry(ww, bw, 0.04), bar, cx, cy - wh / 2 + fy * wh, z + 0.03); });
    (o.topCols || []).forEach(function (fx) { var th = wh - colH; siWallPart(wall, new THREE.BoxGeometry(bw * 0.8, th, 0.035), bar, cx - ww / 2 + fx * ww, cy + wh / 2 - th / 2, z + 0.03); });
    var sash = o.sashMat || bar, sw = 0.06;                             // the sash frame round the glass
    [[0, wh / 2 - sw / 2, ww, sw], [0, -wh / 2 + sw / 2, ww, sw], [-ww / 2 + sw / 2, 0, sw, wh], [ww / 2 - sw / 2, 0, sw, wh]].forEach(function (f) { siWallPart(wall, new THREE.BoxGeometry(f[2], f[3], 0.05), sash, cx + f[0], cy + f[1], z + 0.035); });
    if (o.noCasing) return;
    if (o.rows && o.rows.length) {                                      // a brass sash lock on the meeting rail, and two little lifting handles
      var ly = cy - wh / 2 + o.rows[0] * wh;
      siWallPart(wall, new THREE.BoxGeometry(0.1, 0.025, 0.03), SI.brass, cx, ly + 0.02, z + 0.07);
      siWallPart(wall, new THREE.CylinderGeometry(0.014, 0.014, 0.05, 10), SI.brass, cx + 0.03, ly + 0.045, z + 0.075, 0, 0, Math.PI / 2);
      [-0.25, 0.25].forEach(function (hx) { siWallPart(wall, new THREE.TorusGeometry(0.025, 0.006, 6, 12, Math.PI), SI.brass, cx + hx * ww, cy - wh / 2 + 0.09, z + 0.07, 0, 0, Math.PI); });
    }
    var cw = 0.12, d = 0.14;                                            // the casing: a deep frame with a raised moulding round its outer edge
    [[0, wh / 2 + cw / 2, ww + cw * 2, cw, 0, 1], [-ww / 2 - cw / 2, 0, cw, wh, -1, 0], [ww / 2 + cw / 2, 0, cw, wh, 1, 0]].forEach(function (f) {
      siWallPart(wall, new THREE.BoxGeometry(f[2], f[3], d), siCasing, cx + f[0], cy + f[1], d / 2);
      siWallPart(wall, new THREE.BoxGeometry(f[5] ? f[2] + 0.02 : 0.03, f[5] ? 0.03 : f[3], 0.03), siCasing, cx + f[0] + f[4] * cw / 2, cy + f[1] + f[5] * cw / 2, d + 0.01);
    });
    siWallPart(wall, new THREE.BoxGeometry(ww + cw * 2 + 0.12, 0.05, 0.26), siCasing, cx, cy - wh / 2 - 0.025, 0.13);   // the sill
    siWallPart(wall, new THREE.BoxGeometry(ww + cw * 2, 0.1, 0.03), siCasing, cx, cy - wh / 2 - 0.1, 0.015);             // the apron under it
    if (o.keystone) siWallPart(wall, new THREE.BoxGeometry(0.16, 0.2, d + 0.03), siCasing, cx, cy + wh / 2 + cw / 2, d / 2 + 0.015);
  }

  // materials
  var SI = {
    floor: new THREE.MeshStandardMaterial({ map: siFloorTex, roughness: 0.55, metalness: 0.02 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xf6f4f0, roughness: 0.95 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf8f7f4, roughness: 0.6 }),
    black: new THREE.MeshStandardMaterial({ color: 0x1f1f22, roughness: 0.45, metalness: 0.55 }),
    green: new THREE.MeshStandardMaterial({ color: 0x24392f, roughness: 0.5 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.7 }),
    marble: new THREE.MeshStandardMaterial({ map: siMarbleTex, roughness: 0.25, metalness: 0.03 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xd4a84e, emissive: 0x5a3e0c, emissiveIntensity: 0.2, metalness: 0.8, roughness: 0.28 }),
    clay: new THREE.MeshStandardMaterial({ color: 0xb8673f, roughness: 0.85 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x3f6e3a, roughness: 0.8, flatShading: true }),
    glass: new THREE.MeshStandardMaterial({ color: 0xeef7ff, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.3, depthWrite: false }),
    amber: new THREE.MeshStandardMaterial({ color: 0x8a4a1c, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 }),
    seeds: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x4a2a80, emissiveIntensity: 0.35, roughness: 0.6 }),
    glowSeed: new THREE.MeshStandardMaterial({ color: 0xd9b8ff, emissive: 0xa45cff, emissiveIntensity: 0.9 }),
    card: new THREE.MeshStandardMaterial({ color: 0xc9a27a, roughness: 0.9 }),
    view: new THREE.MeshStandardMaterial({ map: siFrontViewTex, emissive: 0xffffff, emissiveMap: siFrontViewTex, emissiveIntensity: 0.6, roughness: 0.2 }),
    doorView: new THREE.MeshStandardMaterial({ map: siDoorViewTex, emissive: 0xffffff, emissiveMap: siDoorViewTex, emissiveIntensity: 0.6, roughness: 0.2 }),
    bigView: new THREE.MeshStandardMaterial({ map: siViewTex, emissive: 0xffffff, emissiveMap: siViewTex, emissiveIntensity: 0.65, roughness: 0.2 }),
    orchid: new THREE.MeshStandardMaterial({ color: 0xd63fae, roughness: 0.6 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x3a5ca8, roughness: 0.4 }),
    pinkWire: new THREE.MeshStandardMaterial({ color: 0xe8b4bc, roughness: 0.5, metalness: 0.4 })
  };
  siPart(new THREE.PlaneGeometry(SIN_W, SIN_D), SI.floor, 0, 0, 0, -Math.PI / 2);
  // white marble hexagon tiles spilling round the counter: each tile is its own little shape sitting in grey grout,
  // so the grout lines stay crisp from any distance instead of blurring away
  var siTileTex = paintTexture(256, 256, function (g, w, h) {
    g.fillStyle = '#e9e7e2'; g.fillRect(0, 0, w, h);
    for (var c = 0; c < 30; c++) {                                     // soft cloudy patches
      var cg = g.createRadialGradient(isle2Hash(c) * w, isle2Hash(c * 2.7) * h, 2, isle2Hash(c) * w, isle2Hash(c * 2.7) * h, 20 + isle2Hash(c * 5) * 40);
      cg.addColorStop(0, 'rgba(200,198,194,0.35)'); cg.addColorStop(1, 'rgba(200,198,194,0)');
      g.fillStyle = cg; g.fillRect(0, 0, w, h);
    }
    for (var v = 0; v < 10; v++) {                                     // grey veins
      g.strokeStyle = 'rgba(110,110,118,' + (0.25 + isle2Hash(v * 3) * 0.3) + ')'; g.lineWidth = 0.8 + isle2Hash(v) * 1.4;
      var x = isle2Hash(v * 9) * w, y = 0;
      g.beginPath(); g.moveTo(x, y);
      while (y < h) { x += (isle2Hash(v * 13 + y) - 0.5) * 22; y += 10; g.lineTo(x, y); }
      g.stroke();
    }
  });
  siTileTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  var SI_HEX_R = 0.17, SI_HEX_W = Math.sqrt(3) * SI_HEX_R;
  function siTiled(fx, fz, n) {                                       // the ragged patch round the counter and out toward the door
    var a = Math.pow((fx - 2.6) / 3.1, 2) + Math.pow((fz + 1.2) / 2.3, 2);
    var b = Math.pow((fx - 1.2) / 1.5, 2) + Math.pow((fz - 1.0) / 1.2, 2);
    var c = Math.pow((fx - 3.6) / 1.6, 2) + Math.pow((fz - 1.4) / 1.1, 2);
    return Math.min(a, b, c) < 1 + (isle2Hash(n) - 0.5) * 0.7;
  }
  var siTilePos = [], siTileUv = [], siTileCol = [], siGroutPos = [], siHexN = 0;
  function siHex(list, cx, cz, r, y, uvs, cols, ou, ov, shade) {
    for (var v = 0; v < 6; v++) {
      var a0 = Math.PI / 6 + v * Math.PI / 3, a1 = a0 + Math.PI / 3;
      list.push(cx, y, cz, cx + Math.cos(a1) * r, y, cz + Math.sin(a1) * r, cx + Math.cos(a0) * r, y, cz + Math.sin(a0) * r);   // wound to face up
      if (uvs) uvs.push(ou, ov, ou + Math.cos(a1) * 0.13, ov - Math.sin(a1) * 0.13, ou + Math.cos(a0) * 0.13, ov - Math.sin(a0) * 0.13);
      if (cols) for (var k = 0; k < 3; k++) cols.push(shade, shade, shade * 0.995);
    }
  }
  for (var siRow = 0; siRow * 1.5 * SI_HEX_R < 8.4; siRow++) for (var siCol2 = 0; siCol2 * SI_HEX_W < 11.4; siCol2++) {
    siHexN++;
    var shx = siCol2 * SI_HEX_W + (siRow % 2 ? SI_HEX_W / 2 : 0) - 5.5, shz = siRow * 1.5 * SI_HEX_R - 4;
    if (!siTiled(shx, shz, siHexN * 1.31) || Math.abs(shx) > SIN_W / 2 - 0.05 || Math.abs(shz) > SIN_D / 2 - 0.05) continue;
    siHex(siGroutPos, shx, shz, SI_HEX_R * 1.02, 0.006, null, null);
    siHex(siTilePos, shx, shz, SI_HEX_R * 0.93, 0.012, siTileUv, siTileCol, 0.17 + isle2Hash(siHexN * 3.3) * 0.66, 0.17 + isle2Hash(siHexN * 7.1) * 0.66, 0.93 + isle2Hash(siHexN * 2.2) * 0.07);
  }
  function siFlat(pos, uv, col) {
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    var nrm = []; for (var i = 0; i < pos.length; i += 3) nrm.push(0, 1, 0);
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    if (uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (col) geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return geo;
  }
  siPart(siFlat(siGroutPos), new THREE.MeshStandardMaterial({ color: 0x9a968e, roughness: 1 }), 0, 0, 0).castShadow = false;
  siPart(siFlat(siTilePos, siTileUv, siTileCol), new THREE.MeshStandardMaterial({ map: siTileTex, vertexColors: true, color: 0xf2f0ec, roughness: 0.62 }), 0, 0, 0).castShadow = false;

  // the walls: plain bright white, with a white skirting board. Each wall is its own group (its local +z points into the room)
  var siPlasterTex = paintTexture(128, 256, function (g, w, h) {
    g.fillStyle = '#f5f3ef'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 1600; i++) { g.fillStyle = 'rgba(' + (isle2Hash(i) > 0.5 ? '255,255,255' : '150,140,130') + ',' + (isle2Hash(i * 1.7) * 0.06) + ')'; g.fillRect(isle2Hash(i * 2.3) * w, isle2Hash(i * 3.1) * h, 2, 2); }
    var shade = g.createLinearGradient(0, 0, 0, h);                    // a little darker up by the ceiling and down by the floor
    shade.addColorStop(0, 'rgba(90,80,70,0.14)'); shade.addColorStop(0.18, 'rgba(90,80,70,0)'); shade.addColorStop(0.85, 'rgba(90,80,70,0)'); shade.addColorStop(1, 'rgba(90,80,70,0.12)');
    g.fillStyle = shade; g.fillRect(0, 0, w, h);
  });
  var shopInWalls = {};
  // Like the farmhouse, the shop is a room of its own with darkness all round it: the garden outside is only drawn
  // where you look through a window. Each window opening marks its glass on the screen (the stencil), and the
  // garden only draws inside those marks, so you never see it past the walls
  // The windows look out on the real island: each frame (while you're inside) the island is drawn from the spot outside
  // that matches where you're standing in the shop, into a hidden picture, and the window openings show that picture
  var shopViewTarget = new THREE.WebGLRenderTarget(4, 4);
  var shopViewSize = new THREE.Vector2();
  var siWindowMask = new THREE.ShaderMaterial({
    uniforms: { tView: { value: shopViewTarget.texture }, uSize: { value: new THREE.Vector2(4, 4) } },
    vertexShader: 'void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform sampler2D tView; uniform vec2 uSize; void main() { gl_FragColor = texture2D(tView, gl_FragCoord.xy / uSize); }'
  });
  var shopViewCam = new THREE.PerspectiveCamera();
  shopViewCam.matrixAutoUpdate = false;
  var shopViewMap = new THREE.Matrix4(), shopViewTmp = new THREE.Matrix4();
  function drawShopView() {                                           // called just before the shop room is drawn
    renderer.getDrawingBufferSize(shopViewSize);
    if (shopViewTarget.width !== shopViewSize.x || shopViewTarget.height !== shopViewSize.y) shopViewTarget.setSize(shopViewSize.x, shopViewSize.y);
    siWindowMask.uniforms.uSize.value.copy(shopViewSize);
    // the room's walls line up with the shop's outside walls: its side wall with the shop's side, its front wall with the shopfront
    shopViewMap.makeTranslation(SHOP_X, 0, SHOP_Z).multiply(shopViewTmp.makeRotationY(SHOP_TURN)).multiply(shopViewTmp.makeTranslation(SIN_W / 2 - SHOP_HW - SIN_X, 0, SHOP_HD - SIN_D / 2 - SIN_Z));
    shopViewCam.projectionMatrix.copy(camera.projectionMatrix); shopViewCam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    shopViewCam.matrix.multiplyMatrices(shopViewMap, camera.matrixWorld);
    shopViewCam.updateMatrixWorld(true);
    shopGroup.visible = false;                                        // you're inside it, so don't draw the shop's own outside walls in the way
    renderer.setRenderTarget(shopViewTarget);
    renderer.render(scene, shopViewCam);
    renderer.setRenderTarget(null);
    shopGroup.visible = true;
  }
  var SI_HOLES = {                                                     // window openings cut right through the walls: middle x, middle y, width, height
    W: [[-0.3, 1.95, 3.4, 2.3]],
    S: [[-2.425, 1.525, 2.95, 1.85], [2.425, 1.525, 2.95, 1.85]]
  };
  function siWall(name, x, z, ry, len) {
    var wgp = new THREE.Group();
    wgp.position.set(x, 0, z); wgp.rotation.y = ry;
    shopRoom.add(wgp);
    shopInWalls[name] = { g: wgp, c: new THREE.Vector3(x, 0, z), n: new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)) };
    var wallTex = siPlasterTex.clone(); wallTex.needsUpdate = true; wallTex.wrapS = THREE.RepeatWrapping; wallTex.repeat.set(1 / 1.5, 1 / SIN_H);
    var wallShape = new THREE.Shape(); wallShape.moveTo(-len / 2, 0); wallShape.lineTo(len / 2, 0); wallShape.lineTo(len / 2, SIN_H); wallShape.lineTo(-len / 2, SIN_H); wallShape.lineTo(-len / 2, 0);
    var plasterMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.95 });
    (SI_HOLES[name] || []).forEach(function (hl) {
      var hp = new THREE.Path(); hp.moveTo(hl[0] - hl[2] / 2, hl[1] - hl[3] / 2); hp.lineTo(hl[0] - hl[2] / 2, hl[1] + hl[3] / 2); hp.lineTo(hl[0] + hl[2] / 2, hl[1] + hl[3] / 2); hp.lineTo(hl[0] + hl[2] / 2, hl[1] - hl[3] / 2); hp.lineTo(hl[0] - hl[2] / 2, hl[1] - hl[3] / 2);
      wallShape.holes.push(hp);
      var mask = siPart(new THREE.PlaneGeometry(hl[2], hl[3]), siWindowMask, hl[0], hl[1], -0.005, 0, 0, 0, wgp);   // the view outside, in the window opening
      mask.castShadow = false; mask.receiveShadow = false;
      var WT = 0.32;                                                   // the thickness of the wall, seen in the sides of the opening
      [[0, hl[3] / 2, hl[2], 0.02], [0, -hl[3] / 2, hl[2], 0.02], [-hl[2] / 2, 0, 0.02, hl[3]], [hl[2] / 2, 0, 0.02, hl[3]]].forEach(function (rv) {
        siPart(new THREE.BoxGeometry(rv[2], rv[3], WT), plasterMat, hl[0] + rv[0], hl[1] + rv[1], -WT / 2, 0, 0, 0, wgp).castShadow = false;
      });
    });
    siPart(new THREE.ShapeGeometry(wallShape), plasterMat, 0, 0, 0, 0, 0, 0, wgp).castShadow = false;
    siPart(new THREE.BoxGeometry(len, 0.12, 0.03), SI.white, 0, 0.06, 0.015, 0, 0, 0, wgp);
    return wgp;
  }
  var SNW = -SIN_D / 2;
  siPart(new THREE.PlaneGeometry(SIN_W, SIN_D), new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.95 }), 0, SIN_H, 0, Math.PI / 2).castShadow = false;   // the ceiling: it faces down, so it's only seen from inside and never blocks the camera above
  siWall('N', 0, SNW, 0, SIN_W);
  siWall('S', 0, -SNW, Math.PI, SIN_W);
  siWall('W', -SIN_W / 2, 0, Math.PI / 2, SIN_D);
  siWall('E', SIN_W / 2, 0, -Math.PI / 2, SIN_D);
  function siWallPart(name, geo, mat, x, y, z, rx, ry, rz) { return siPart(geo, mat, x, y, z, rx, ry, rz, shopInWalls[name].g); }

  // a big picture window on the left wall, with a glass-topped iron table of orchids under it
  siWindow('W', -0.3, 1.95, 3.4, 2.3, null, { cols: [1 / 3, 2 / 3], rows: [0.78], topCols: [1 / 6, 0.5, 5 / 6], colH: 2.3 * 0.78, barW: 0.05, keystone: true });
  // linen curtains on a brass rod, tied back either side of the window
  siWallPart('W', new THREE.CylinderGeometry(0.018, 0.018, 4.4, 10), SI.brass, -0.3, 3.4, 0.24, 0, 0, Math.PI / 2);
  [-1, 1].forEach(function (s2) {
    siWallPart('W', new THREE.SphereGeometry(0.04, 12, 8), SI.brass, -0.3 + s2 * 2.22, 3.4, 0.24);
    siWallPart('W', new THREE.CylinderGeometry(0.012, 0.012, 0.22, 6), SI.brass, -0.3 + s2 * 2.05, 3.4, 0.12, Math.PI / 2, 0, 0);
    var cur = new THREE.PlaneGeometry(0.55, 2.75, 14, 20), cpos = cur.attributes.position;
    for (var cv = 0; cv < cpos.count; cv++) {                           // soft pleats, gathered in toward the tie-back
      var cxv = cpos.getX(cv), cyv = cpos.getY(cv), pinch = 1 - 0.55 * Math.exp(-Math.pow((cyv + 0.25) / 0.35, 2));
      cpos.setX(cv, cxv * pinch + s2 * 0.12 * (1 - pinch)); cpos.setZ(cv, Math.sin(cxv * 34) * 0.035 * pinch);
    }
    cur.computeVertexNormals();
    siWallPart('W', cur, new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 0.95, side: THREE.DoubleSide }), -0.3 + s2 * 1.95, 2.0, 0.22);
    siWallPart('W', new THREE.TorusGeometry(0.1, 0.012, 6, 16), SI.brass, -0.3 + s2 * 1.95, 1.75, 0.26);
  });
  var TBL_X = -SIN_W / 2 + 0.55;
  siPart(new THREE.BoxGeometry(0.75, 0.03, 2.2), SI.glass, TBL_X, 0.82, 0.3);
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) {           // curly iron legs
    var lx = TBL_X + c[0] * 0.32, lz = 0.3 + c[1] * 1.0;
    siPart(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 6), SI.black, lx, 0.4, lz);
    siPart(new THREE.TorusGeometry(0.08, 0.012, 6, 14, Math.PI * 1.5), SI.black, lx, 0.62, lz - c[1] * 0.08, 0, Math.PI / 2, 0);
  });
  siPart(new THREE.BoxGeometry(0.66, 0.015, 2.0), SI.black, TBL_X, 0.25, 0.3);
  var siOrchidLeaf = new THREE.MeshStandardMaterial({ color: 0x2f5a2c, roughness: 0.45 });
  var siPetal = new THREE.MeshStandardMaterial({ color: 0xc8399a, roughness: 0.55, side: THREE.DoubleSide });
  var siPetalLight = new THREE.MeshStandardMaterial({ color: 0xe07ac0, roughness: 0.55, side: THREE.DoubleSide });
  function siOrchid(x, z, y, s) {                                     // a white-and-blue pot of magenta orchids on arching stems
    siPart(new THREE.CylinderGeometry(0.11 * s, 0.09 * s, 0.18 * s, 16), SI.white, x, y + 0.09 * s, z);
    siPart(new THREE.TorusGeometry(0.105 * s, 0.012 * s, 6, 16), SI.blue, x, y + 0.12 * s, z, Math.PI / 2, 0, 0);
    siPart(new THREE.CylinderGeometry(0.1 * s, 0.1 * s, 0.01, 14), new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 }), x, y + 0.175 * s, z);
    for (var lf = 0; lf < 4; lf++) {                                   // broad glossy leaves fanning out of the pot
      var la = lf * 1.7 + x;
      siPart(new THREE.SphereGeometry(0.1 * s, 12, 6), siOrchidLeaf, x + Math.cos(la) * 0.08 * s, y + 0.2 * s, z + Math.sin(la) * 0.08 * s, 0, -la, 0.25).scale.set(1.1, 0.12, 0.45);
    }
    for (var st = 0; st < 2; st++) {
      var sa = st * 2.6 + x * 3, sh = (0.42 + st * 0.12) * s, bx = x + Math.cos(sa) * 0.02, bz = z + Math.sin(sa) * 0.02, y0 = y + 0.18 * s;
      siPart(new THREE.CylinderGeometry(0.005, 0.006, sh, 5), SI.leaf, bx, y0 + sh / 2, bz);
      for (var fl = 0; fl < 6; fl++) {                                 // the spray arches over and the flowers hang along it
        var k = fl / 5, ax = bx + Math.cos(sa) * k * 0.2 * s, az = bz + Math.sin(sa) * k * 0.2 * s, ay = y0 + sh + Math.sin(k * Math.PI * 0.8) * 0.06 * s - k * k * 0.12 * s;
        siPart(new THREE.CylinderGeometry(0.004, 0.004, 0.05 * s, 4), SI.leaf, ax, ay, az, 0, -sa, Math.PI / 2 - 0.3);
        var fg = new THREE.Group(); fg.position.set(ax, ay - 0.02 * s, az); fg.rotation.set(0, -sa + Math.PI / 2, 0.2); shopRoom.add(fg);
        for (var pt = 0; pt < 5; pt++) {
          var pa = pt / 5 * Math.PI * 2;
          siPart(new THREE.CircleGeometry(0.022 * s, 10), pt % 2 ? siPetalLight : siPetal, Math.cos(pa) * 0.018 * s, Math.sin(pa) * 0.018 * s, 0, 0, 0, pa, fg).scale.set(1.3, 0.9, 1);
        }
        siPart(new THREE.SphereGeometry(0.008 * s, 6, 4), SI.white, 0, 0, 0.004, 0, 0, 0, fg);
      }
    }
  }
  siOrchid(TBL_X, -0.5, 0.835, 1.3); siOrchid(TBL_X, 0.25, 0.835, 1.1); siOrchid(TBL_X - 0.1, 1.0, 0.835, 1.2);
  siPart(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 12), SI.glass, TBL_X + 0.18, 0.935, 1.15);
  for (var siTz = -0.6; siTz <= 1.2; siTz += 0.9) shopInSolids.push([TBL_X, siTz, 0.5]);

  // painted labels and packets for everything on the shelves and stands
  var SI_PACKETS = [                                                   // name, background, flower, accent
    ['Moonbloom', '#f6d9e2', '#e98ab6', '#7a3f6e'], ['Starbell', '#ece4f6', '#a98ad8', '#4f3a7a'],
    ['Dawn Poppy', '#f8ead6', '#f0965a', '#7a4320'], ['Glowcress', '#e2efdc', '#8cc76a', '#2f5a2a'], ['Mistlily', '#f4f2ec', '#c9c3e6', '#5a5470']
  ];
  var siPacketMats = SI_PACKETS.map(function (pk, n) {
    var tex = paintTexture(128, 176, function (g, w, h) {
      g.fillStyle = pk[1]; g.fillRect(0, 0, w, h);
      for (var i = 0; i < 300; i++) { g.fillStyle = 'rgba(120,90,60,' + isle2Hash(i * 3 + n) * 0.06 + ')'; g.fillRect(isle2Hash(i + n * 7) * w, isle2Hash(i * 2.3 + n) * h, 1, 1); }   // paper fibres
      g.fillStyle = pk[3]; g.fillRect(0, 0, w, 14);                     // the crimped top
      g.fillStyle = 'rgba(255,255,255,0.35)'; for (var c = 0; c < w; c += 4) g.fillRect(c, 2, 2, 10);
      g.strokeStyle = pk[3]; g.lineWidth = 1.5; g.strokeRect(8, 22, w - 16, 104);   // the picture frame
      var sky = g.createLinearGradient(0, 22, 0, 126); sky.addColorStop(0, '#ffffff'); sky.addColorStop(1, pk[1]);
      g.fillStyle = sky; g.fillRect(9, 23, w - 18, 102);
      g.strokeStyle = '#5a8a48'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 124); g.quadraticCurveTo(w / 2 - 6, 90, w / 2, 66); g.stroke();
      g.fillStyle = '#6aa055';
      [[-1, 104], [1, 92]].forEach(function (lf) { g.beginPath(); g.ellipse(w / 2 + lf[0] * 13, lf[1], 13, 5, lf[0] * -0.5, 0, Math.PI * 2); g.fill(); });
      for (var pt = 0; pt < 7; pt++) {                                   // the flower, in soft watercolour
        var a = pt / 7 * Math.PI * 2, px = w / 2 + Math.cos(a) * 15, py = 58 + Math.sin(a) * 15;
        var pg = g.createRadialGradient(px, py, 1, px, py, 14); pg.addColorStop(0, pk[2]); pg.addColorStop(1, 'rgba(255,255,255,0.2)');
        g.fillStyle = pg; g.beginPath(); g.ellipse(px, py, 14, 9, a, 0, Math.PI * 2); g.fill();
      }
      g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(w / 2, 58, 6, 0, Math.PI * 2); g.fill();
      g.fillStyle = pk[3]; g.textAlign = 'center';
      g.font = 'bold 17px Georgia, serif'; g.fillText(pk[0], w / 2, 146);
      g.font = 'italic 10px Georgia, serif'; g.fillText('Whimsy & Bloom', w / 2, 160);
      g.fillStyle = pk[3]; g.fillRect(14, 166, w - 28, 2);
    });
    return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 });
  });
  var siJarLabelTex = paintTexture(256, 48, function (g, w, h) {       // a kraft paper label wrapped round each jar
    g.fillStyle = '#d2b48a'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 400; i++) { g.fillStyle = 'rgba(90,60,30,' + isle2Hash(i) * 0.12 + ')'; g.fillRect(isle2Hash(i * 1.7) * w, isle2Hash(i * 2.9) * h, 1.5, 1); }
    g.fillStyle = '#3a2a1e'; g.textAlign = 'center'; g.font = 'italic bold 20px Georgia, serif';
    g.fillText('Moon Seeds', w * 0.25, 30); g.fillText('Moon Seeds', w * 0.75, 30);
    g.fillRect(0, 4, w, 1.5); g.fillRect(0, h - 6, w, 1.5);
  });
  var siSeedTex = paintTexture(128, 128, function (g, w, h) {          // seeds piled up inside the jars
    g.fillStyle = '#f2ece4'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 700; i++) {
      var sx = isle2Hash(i * 1.3) * w, sy = isle2Hash(i * 2.1) * h, sr = 1.5 + isle2Hash(i) * 2;
      g.fillStyle = isle2Hash(i * 5.5) > 0.6 ? 'rgba(70,50,40,0.55)' : 'rgba(255,255,255,0.7)';
      g.beginPath(); g.ellipse(sx, sy, sr, sr * 0.6, isle2Hash(i * 3) * 3, 0, Math.PI * 2); g.fill();
    }
  });
  siSeedTex.wrapS = siSeedTex.wrapT = THREE.RepeatWrapping;
  var siTonicTex = paintTexture(256, 64, function (g, w, h) {          // the label on the tonic bottles
    g.fillStyle = '#f5f0e6'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#7a5a3a'; g.lineWidth = 1.5; g.strokeRect(6, 6, w / 2 - 12, h - 12); g.strokeRect(w / 2 + 6, 6, w / 2 - 12, h - 12);
    g.fillStyle = '#3a2a1e'; g.textAlign = 'center';
    g.font = 'bold 15px Georgia, serif'; g.fillText('BLOOM', w / 4, 28); g.fillText('BLOOM', w * 0.75, 28);
    g.font = 'italic 12px Georgia, serif'; g.fillText('tonic', w / 4, 46); g.fillText('tonic', w * 0.75, 46);
  });
  var siWickerTex = paintTexture(128, 64, function (g, w, h) {          // a woven basket
    g.fillStyle = '#9a7448'; g.fillRect(0, 0, w, h);
    for (var r = 0; r < 8; r++) for (var c = 0; c < 16; c++) {
      var odd = (r + c) % 2, x = c * 8, y = r * 8;
      var wg = g.createLinearGradient(x, y, odd ? x + 8 : x, odd ? y : y + 8); wg.addColorStop(0, '#7a5530'); wg.addColorStop(0.5, '#d2a870'); wg.addColorStop(1, '#7a5530');
      g.fillStyle = wg; g.fillRect(x + 0.5, y + 0.5, 7, 7);
    }
  });
  siWickerTex.wrapS = siWickerTex.wrapT = THREE.RepeatWrapping;
  // two tall black metal shelving units on the back wall
  var SHELF_Z = SNW + 0.26, SHELF_YS = [0.35, 0.95, 1.55, 2.15, 2.75];
  var siJars = [], siFills = [], siLids = [], siJarLabels = [], siBottles = [], siNecks = [], siBulbs2 = [], siTonicLabels = [], siPacketSets = SI_PACKETS.map(function () { return []; }), siBaskets = [], siLanternLights = [];
  [-4.6, -2.95].forEach(function (x0, u) {
    var UW = 1.6;
    [0, UW].forEach(function (dx) { [-0.21, 0.21].forEach(function (dz) { siPart(new THREE.BoxGeometry(0.04, 2.95, 0.04), SI.black, x0 + dx, 1.475, SHELF_Z + dz); }); });
    SHELF_YS.forEach(function (y, k) {
      siPart(new THREE.BoxGeometry(UW, 0.035, 0.44), SI.black, x0 + UW / 2, y - 0.018, SHELF_Z);
      for (var i = 0; i < 7; i++) {
        var x = x0 + 0.13 + i * 0.225, hv = isle2Hash(u * 50 + k * 9 + i);
        if (k === 4) {
          if (i % 2) continue;                                         // glass lanterns with brass frames and lit candles along the top shelf
          var lx = x + 0.1;
          siPart(new THREE.BoxGeometry(0.16, 0.25, 0.16), SI.glass, lx, y + 0.145, SHELF_Z);
          [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) { siPart(new THREE.BoxGeometry(0.012, 0.26, 0.012), SI.brass, lx + c[0] * 0.08, y + 0.145, SHELF_Z + c[1] * 0.08); });
          siPart(new THREE.BoxGeometry(0.18, 0.025, 0.18), SI.brass, lx, y + 0.013, SHELF_Z);
          siPart(new THREE.BoxGeometry(0.18, 0.015, 0.18), SI.brass, lx, y + 0.275, SHELF_Z);
          siPart(new THREE.ConeGeometry(0.125, 0.09, 4), SI.brass, lx, y + 0.33, SHELF_Z, 0, Math.PI / 4, 0);
          siPart(new THREE.SphereGeometry(0.014, 8, 6), SI.brass, lx, y + 0.38, SHELF_Z);
          siPart(new THREE.TorusGeometry(0.03, 0.007, 6, 14), SI.brass, lx, y + 0.415, SHELF_Z);
          siPart(new THREE.CylinderGeometry(0.028, 0.03, 0.09, 12), new THREE.MeshStandardMaterial({ color: 0xf6f0e2, roughness: 0.6 }), lx, y + 0.07, SHELF_Z);   // the candle
          siPart(new THREE.CylinderGeometry(0.002, 0.002, 0.015, 4), SI.black, lx, y + 0.122, SHELF_Z);
          var flame = siPart(new THREE.SphereGeometry(0.011, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd27a }), lx, y + 0.14, SHELF_Z);
          flame.scale.set(1, 1.9, 1);
          var fg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffb860, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
          fg.position.set(lx, y + 0.14, SHELF_Z); fg.scale.set(0.2, 0.24, 1); shopRoom.add(fg);
          siLanternLights.push({ f: flame, g: fg, p: hv * 6 });
        } else if (k === 3) {
          var jh = 0.16 + hv * 0.1;                                    // glass jars of seeds
          siJars.push([x, y + jh / 2, SHELF_Z, 1, jh / 0.2, 1, 0, 0, 0]);
          siFills.push([x, y + jh * 0.3, SHELF_Z, 1, jh * 0.55 / 0.12, 1, hv, 0, hv * 6]);
          siLids.push([x, y + jh + 0.01, SHELF_Z, 1, 1, 1, 0, 0, 0]);
          siJarLabels.push([x, y + jh * 0.5, SHELF_Z, 1, 1, 1, hv, 0, -0.3 + hv * 0.6]);
        } else if (k === 2) {
          siBottles.push([x, y, SHELF_Z, 1, 1, 1, hv, 0, 0]);         // little dropper bottles of plant tonic
          siNecks.push([x, y + 0.245, SHELF_Z, 1, 1, 1, 0, 0, 0]);
          siBulbs2.push([x, y + 0.29, SHELF_Z, 1, 1.5, 1, 0, 0, 0]);
          siTonicLabels.push([x, y + 0.095, SHELF_Z, 1, 1, 1, 0, 0, -0.3 + hv * 0.6]);
        } else if (k === 1) {
          siPacketSets[Math.floor(hv * SI_PACKETS.length)].push([x, y + 0.11, SHELF_Z + 0.06, 1, 1, 1, hv, -0.15, 0]);   // seed packets, leaning back in rows
          siPacketSets[Math.floor(isle2Hash(hv * 9) * SI_PACKETS.length)].push([x + 0.04, y + 0.105, SHELF_Z - 0.02, 1, 0.95, 1, 0, -0.12, 0]);
          siPacketSets[Math.floor(isle2Hash(hv * 13) * SI_PACKETS.length)].push([x + 0.08, y + 0.1, SHELF_Z - 0.1, 1, 0.9, 1, 0, -0.1, 0]);
        } else if (i % 3 === 0) {
          siBaskets.push([x + 0.2, y, SHELF_Z, hv, u * 3 + i]);
        }
      }
    });
    shopInSolids.push([x0 + 0.4, SHELF_Z, 0.45], [x0 + 1.2, SHELF_Z, 0.45]);
  });
  var siDummy = new THREE.Object3D(), siCol = new THREE.Color();
  function siInstances(geo, mat, list, colorOf) {
    var im = new THREE.InstancedMesh(geo, mat, Math.max(1, list.length));
    im.count = list.length;
    list.forEach(function (q, i) {
      siDummy.position.set(q[0], q[1], q[2]);
      siDummy.scale.set(q[3], q[4], q[5]);                           // each entry: x, y, z, scale x, y, z, a random 0-1, tilt, turn
      siDummy.rotation.set(q[7], q[8], 0);
      siDummy.updateMatrix(); im.setMatrixAt(i, siDummy.matrix);
      if (colorOf) im.setColorAt(i, colorOf(q, siCol));
    });
    im.castShadow = !mat.transparent; im.receiveShadow = true;
    shopRoom.add(im);
    return im;
  }
  siInstances(new THREE.CylinderGeometry(0.075, 0.075, 0.2, 12), SI.glass, siJars);
  siInstances(new THREE.CylinderGeometry(0.065, 0.065, 0.12, 14), new THREE.MeshStandardMaterial({ map: siSeedTex, emissive: 0x4a2a80, emissiveIntensity: 0.25, roughness: 0.8 }), siFills, function (q, c) { return c.set([0xd9b8ff, 0xffc2dc, 0xffe6a8, 0xc9f0d0][Math.floor(q[6] * 4)]); });
  siInstances(new THREE.CylinderGeometry(0.08, 0.08, 0.025, 16), SI.brass, siLids);
  siInstances(new THREE.CylinderGeometry(0.077, 0.077, 0.06, 18, 1, true), new THREE.MeshStandardMaterial({ map: siJarLabelTex, roughness: 0.9 }), siJarLabels);
  var siBottleGeo = new THREE.LatheGeometry([[0, 0], [0.045, 0], [0.05, 0.01], [0.05, 0.15], [0.046, 0.175], [0.03, 0.2], [0.018, 0.215], [0.018, 0.24], [0, 0.24]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 16);
  siInstances(siBottleGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.12, metalness: 0.25 }), siBottles, function (q, c) { return c.set([0x6a3416, 0x2e4a2e, 0x2e3a5a, 0x4a2a50][Math.floor(q[6] * 4)]); });
  siInstances(new THREE.CylinderGeometry(0.0515, 0.0515, 0.075, 18, 1, true), new THREE.MeshStandardMaterial({ map: siTonicTex, roughness: 0.85 }), siTonicLabels);
  siInstances(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 12), SI.black, siNecks);
  siInstances(new THREE.SphereGeometry(0.018, 10, 8), new THREE.MeshStandardMaterial({ color: 0x1e1e20, roughness: 0.45 }), siBulbs2);
  siPacketSets.forEach(function (list, n) { siInstances(new THREE.BoxGeometry(0.15, 0.2, 0.012), siPacketMats[n], list); });
  var siWicker = new THREE.MeshStandardMaterial({ map: siWickerTex, roughness: 0.95, side: THREE.DoubleSide });
  var siLinen = new THREE.MeshStandardMaterial({ color: 0xe9e2d4, roughness: 0.95 });
});
