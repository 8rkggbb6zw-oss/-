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
      ['Hens .......... soon', 'Sheep .......... soon', 'Cows .......... soon'].forEach(function (t, k) { g.font = 'italic 9px Georgia, serif'; g.fillText(t, 34, 42 + k * 20); });
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
  var abWispList = [], abBars = [];                                    // (the bars are all drawn in one batch)
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
    abPart(new THREE.PlaneGeometry(0.36, 0.18), new THREE.MeshStandardMaterial({ map: abSlateTex, roughness: 0.95 }), AB_SX + 0.057, 0.62, NZ, 0, Math.PI / 2, 0);
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
