// Everdawn, part 3 of 3 (see the note at the top of script.js). The game grew past what two files can hold under
// CodePen's 1 MB limit, so it now carries on here, and this file joins all three parts back together and starts it

EVERDAWN_PARTS.push(function (THREE) {
  // ---------- Iridelle ----------
  // Little tide-spirits from the moonlit shallows, with just a whisper of the crab about them: a wide, domed shell of
  // living opal, scalloped at its rim, set with tiny pearls and traced with glowing runes; a garden of crystals, coral
  // and swaying anemones growing on its back; big, shining eyes on slender stalks; two delicate pincers of crystal,
  // each cradling a glowing orb like a lantern; six slender, jointed legs of pearl with lights at their joints, on
  // which it scuttles sideways; and veils of iridescent light trailing behind it. Bubbles drift up from its crystals,
  // a pearl circles over it, and wherever it stands, tidepool ripples spread softly round it. Feed one hay and pet it
  // every day for six days in a row, and the next morning it has left you a Tidelight Pearl in its shell. Miss a day
  // and the count starts over
  var CRB_COST = 740, CRB_DAYS = 6;
  var CRB_PALS = [                                                    // a moonpearl one, a coral one and a deep-sea one
    { name: 'Moonpearl', shell: 0xe6deff, rim: 0xa898ec, under: 0xfff6fc, leg: 0xf2e8ff, crystal: 0xc0ecff, glow: 0x9ae0ff, glow2: 0xd8a8ff, veil: [0x9ae0ff, 0xd8a8ff, 0xffb8e0], iris: ['#5aa8e0', '#081830'] },
    { name: 'Coral Dawn', shell: 0xffdcd4, rim: 0xff90aa, under: 0xfff6f0, leg: 0xffeae2, crystal: 0xffd0ec, glow: 0xffa8c4, glow2: 0xffd890, veil: [0xffa0c0, 0xffd890, 0xff8ab0], iris: ['#e07a8a', '#2a0810'] },
    { name: 'Abyss', shell: 0xb0ccff, rim: 0x5868dc, under: 0xeaf2ff, leg: 0xd4e0ff, crystal: 0xa8fff0, glow: 0x7affe0, glow2: 0xa08aff, veil: [0x7affe0, 0xa08aff, 0x8ab8ff], iris: ['#3ad0c0', '#04201c'] }
  ];
  function crbCss(hex, a) { var c = new THREE.Color(hex); return 'rgba(' + Math.round(c.r * 255) + ',' + Math.round(c.g * 255) + ',' + Math.round(c.b * 255) + ',' + (a === undefined ? 1 : a) + ')'; }
  // a Seaglass Heart: a heart of frosted sea glass, worn smooth by the tide, with a soft light glowing at its core.
  // (Iridelles used to leave these; they leave Tidelight Pearls now, but any hearts you already have still keep and sell)
  function crbHeartShape(s) {
    var sh = new THREE.Shape(); sh.moveTo(0, -0.03 * s);
    sh.bezierCurveTo(0.012 * s, -0.018 * s, 0.032 * s, -0.004 * s, 0.03 * s, 0.012 * s); sh.bezierCurveTo(0.028 * s, 0.028 * s, 0.006 * s, 0.03 * s, 0, 0.016 * s);
    sh.bezierCurveTo(-0.006 * s, 0.03 * s, -0.028 * s, 0.028 * s, -0.03 * s, 0.012 * s); sh.bezierCurveTo(-0.032 * s, -0.004 * s, -0.012 * s, -0.018 * s, 0, -0.03 * s);
    return sh;
  }
  function crbHeartModel(pal) {
    var g = new THREE.Group();
    var geo = new THREE.ExtrudeGeometry(crbHeartShape(1), { depth: 0.012, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.006, bevelSegments: 6, curveSegments: 24 }); geo.center();
    var glass = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: new THREE.Color(pal.crystal).lerp(new THREE.Color(0xffffff), 0.2), roughness: 0.38, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.5, transparent: true, opacity: 0.82, emissive: pal.glow, emissiveIntensity: 0.25 }));   // (frosted, as tide-worn glass is)
    glass.castShadow = true; g.add(glass);
    var core = new THREE.Mesh(new THREE.ExtrudeGeometry(crbHeartShape(0.45), { depth: 0.006, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 3, curveSegments: 16 }).center(), new THREE.MeshBasicMaterial({ color: new THREE.Color(pal.glow).lerp(new THREE.Color(0xffffff), 0.5) })); g.add(core);   // (its glowing core)
    var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false })); gl.scale.set(0.14, 0.14, 1); g.add(gl);
    return g;
  }
  var crbHeartIcon = glimCanvas(96, 96, function (g, w, h) {
    var glow = g.createRadialGradient(48, 50, 4, 48, 50, 46); glow.addColorStop(0, 'rgba(160,230,255,0.7)'); glow.addColorStop(1, 'rgba(200,160,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    function heart(s) { g.beginPath(); g.moveTo(48, 50 + 30 * s); g.bezierCurveTo(48 + 12 * s, 50 + 18 * s, 48 + 32 * s, 50 + 4 * s, 48 + 30 * s, 50 - 12 * s); g.bezierCurveTo(48 + 28 * s, 50 - 28 * s, 48 + 6 * s, 50 - 30 * s, 48, 50 - 16 * s); g.bezierCurveTo(48 - 6 * s, 50 - 30 * s, 48 - 28 * s, 50 - 28 * s, 48 - 30 * s, 50 - 12 * s); g.bezierCurveTo(48 - 32 * s, 50 + 4 * s, 48 - 12 * s, 50 + 18 * s, 48, 50 + 30 * s); g.closePath(); }
    var hg = g.createLinearGradient(20, 20, 76, 80); hg.addColorStop(0, '#e8f8ff'); hg.addColorStop(0.5, '#b8e4ff'); hg.addColorStop(1, '#c8b0ff'); g.fillStyle = hg; heart(1); g.fill();
    var cg = g.createRadialGradient(48, 46, 1, 48, 48, 14); cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, 'rgba(200,240,255,0)'); g.fillStyle = cg; heart(0.5); g.fill();   // (a light at its core)
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(36, 34, 7, 4, -0.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(120,140,220,0.6)'; g.lineWidth = 1.5; heart(1); g.stroke();
    g.fillStyle = '#fff'; [[14, 22], [82, 20], [80, 82]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  ITEMS.seaglassHeart = { name: 'Seaglass Heart', price: 350, icon: '💎', img: crbHeartIcon, fill: 88, info: 'A heart of frosted sea glass, worn smooth by the tide, with a soft light glowing at its core, left by a happy Iridelle. Sells for a very good price at the shipping bin.' };
  // a Tidelight Pearl: big, round and lustrous, shimmering with every colour of the sea as it turns, with a soft
  // light glowing deep inside it like the moon seen through water
  function crbPearlModel(pal) {
    var g = new THREE.Group();
    var pearl = new THREE.Mesh(new THREE.SphereGeometry(0.026, 40, 30), ostIri(new THREE.MeshPhysicalMaterial({ color: new THREE.Color(pal.shell).lerp(new THREE.Color(0xffffff), 0.45), roughness: 0.12, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05, sheen: new THREE.Color(pal.glow), emissive: new THREE.Color(pal.glow).lerp(new THREE.Color(0xffffff), 0.5), emissiveIntensity: 0.08 }), 0.9));   // (its lustre: every colour shifting over it as it turns)
    pearl.castShadow = true; g.add(pearl);
    var inner = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: new THREE.Color(pal.glow).lerp(new THREE.Color(0xffffff), 0.4), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); inner.scale.set(0.045, 0.045, 1); inner.material.opacity = 0.3; g.add(inner);   // (the light inside it)
    var gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })); gl.scale.set(0.14, 0.14, 1); g.add(gl);
    var sparks = []; for (var k = 0; k < 4; k++) { var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: k % 2 ? pal.glow : pal.glow2, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(0.018, 0.018, 1); g.add(sp); sparks.push(sp); }
    g.userData.sparks = sparks; g.userData.pearl = pearl;
    return g;
  }
  var crbPearlIcon = glimCanvas(96, 96, function (g, w, h) {
    var glow = g.createRadialGradient(48, 50, 4, 48, 50, 46); glow.addColorStop(0, 'rgba(170,230,255,0.7)'); glow.addColorStop(1, 'rgba(210,170,255,0)'); g.fillStyle = glow; g.fillRect(0, 0, w, h);
    var pg = g.createRadialGradient(40, 40, 2, 48, 50, 28); pg.addColorStop(0, '#ffffff'); pg.addColorStop(0.45, '#f2ecff'); pg.addColorStop(0.8, '#d4dcf4'); pg.addColorStop(1, '#a8b0d8'); g.fillStyle = pg; g.beginPath(); g.arc(48, 50, 26, 0, Math.PI * 2); g.fill();
    g.save(); g.beginPath(); g.arc(48, 50, 26, 0, Math.PI * 2); g.clip();
    [['rgba(255,170,220,0.35)', 34, 64, 16], ['rgba(140,230,255,0.35)', 64, 40, 16], ['rgba(200,170,255,0.3)', 62, 66, 14]].forEach(function (b) { var r = g.createRadialGradient(b[1], b[2], 1, b[1], b[2], b[3]); r.addColorStop(0, b[0]); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });   // (its shifting lustre)
    g.restore();
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(38, 38, 7, 4.5, -0.7, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(130,130,190,0.5)'; g.lineWidth = 1.2; g.beginPath(); g.arc(48, 50, 26, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#fff'; [[14, 22], [82, 20], [80, 82]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  ITEMS.tidelightPearl = { name: 'Tidelight Pearl', price: 720, icon: '⚪', img: crbPearlIcon, fill: 88, info: 'A big, flawless pearl, shimmering with every colour of the sea as it turns, with a soft light glowing deep inside it like the moon seen through water, left by a happy Iridelle. Feed and pet yours every day for six days in a row for one. Sells for an excellent price at the shipping bin.' };
  var crbShopIcon = glimCanvas(128, 128, function (g, w, h) {         // a little portrait of one, for the shop
    var sky = g.createRadialGradient(64, 70, 4, 64, 70, 64); sky.addColorStop(0, 'rgba(170,230,255,0.75)'); sky.addColorStop(1, 'rgba(200,170,255,0)'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(160,220,255,0.6)'; g.lineWidth = 1.5; [0, 1].forEach(function (k) { g.beginPath(); g.ellipse(64, 108, 40 + k * 14, 7 + k * 3, 0, 0, Math.PI * 2); g.stroke(); });   // (tidepool ripples)
    g.strokeStyle = '#f2e8ff'; g.lineWidth = 3; g.lineCap = 'round';
    [[-1, 30], [-1, 40], [-1, 50], [1, 30], [1, 40], [1, 50]].forEach(function (l) { var x0 = 64 + l[0] * 26, x1 = 64 + l[0] * (l[1] + 6), x2 = 64 + l[0] * (l[1] + 14); g.beginPath(); g.moveTo(x0, 78); g.lineTo(x1, 66); g.lineTo(x2, 104); g.stroke(); g.fillStyle = '#9ae0ff'; g.beginPath(); g.arc(x1, 66, 2, 0, Math.PI * 2); g.fill(); });   // (slender legs)
    var sg = g.createRadialGradient(56, 64, 4, 64, 74, 40); sg.addColorStop(0, '#fbf8ff'); sg.addColorStop(0.6, '#e2d6ff'); sg.addColorStop(1, '#a898ec'); g.fillStyle = sg; g.beginPath(); g.ellipse(64, 76, 36, 20, 0, Math.PI, 0); g.quadraticCurveTo(100, 86, 64, 88); g.quadraticCurveTo(28, 86, 28, 76); g.fill();   // (its domed opal shell)
    g.strokeStyle = 'rgba(120,210,255,0.9)'; g.lineWidth = 1.2; g.beginPath(); g.arc(64, 72, 7, 0, Math.PI * 2); g.stroke(); [-0.9, -0.3, 0.3, 0.9].forEach(function (a) { g.beginPath(); g.moveTo(64 + Math.sin(a) * 9, 72 - Math.cos(a) * 5); g.lineTo(64 + Math.sin(a) * 24, 74 - Math.cos(a) * 12); g.stroke(); });   // (glowing runes)
    [[52, 50, 5, 18, '#c0ecff'], [62, 44, 6, 24, '#d8f4ff'], [72, 50, 5, 16, '#d8a8ff']].forEach(function (c) { g.fillStyle = c[4]; g.beginPath(); g.moveTo(c[0] - c[2], c[1] + c[3] * 0.4); g.lineTo(c[0] - c[2], c[1] - c[3] * 0.2); g.lineTo(c[0], c[1] - c[3] * 0.5); g.lineTo(c[0] + c[2], c[1] - c[3] * 0.2); g.lineTo(c[0] + c[2], c[1] + c[3] * 0.4); g.closePath(); g.fill(); });   // (its crystal garden)
    [-1, 1].forEach(function (s) {
      g.strokeStyle = '#f2e8ff'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(64 + s * 10, 62); g.lineTo(64 + s * 12, 46); g.stroke();   // (eye stalks)
      g.fillStyle = '#fff'; g.beginPath(); g.arc(64 + s * 12, 44, 6, 0, Math.PI * 2); g.fill(); g.fillStyle = '#183058'; g.beginPath(); g.arc(64 + s * 12, 45, 4, 0, Math.PI * 2); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(64 + s * 11, 43.5, 1.4, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#f2e8ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(64 + s * 30, 80); g.lineTo(64 + s * 44, 70); g.stroke();   // (an arm)
      g.fillStyle = 'rgba(200,240,255,0.85)'; g.beginPath(); g.ellipse(64 + s * 48, 64, 7, 9, s * 0.4, 0, Math.PI * 2); g.fill();   // (a crystal pincer,
      var og = g.createRadialGradient(64 + s * 48, 62, 0, 64 + s * 48, 62, 8); og.addColorStop(0, '#ffffff'); og.addColorStop(1, 'rgba(216,168,255,0)'); g.fillStyle = og; g.beginPath(); g.arc(64 + s * 48, 62, 8, 0, Math.PI * 2); g.fill();   // holding a glowing orb)
    });
    g.fillStyle = 'rgba(220,240,255,0.5)'; [[30, 30, 4], [96, 24, 3], [100, 44, 2.5]].forEach(function (b) { g.beginPath(); g.arc(b[0], b[1], b[2], 0, Math.PI * 2); g.fill(); });   // (bubbles)
    g.fillStyle = '#fff'; [[16, 54], [112, 96], [20, 100]].forEach(function (p) { g.fillRect(p[0] - 1, p[1] - 5, 2, 10); g.fillRect(p[0] - 5, p[1] - 1, 10, 2); });
  }).toDataURL();
  // the fine detail of its shell and limbs, painted once and shared. Its shell: fine growth lines laid down ring by
  // ring as it grew, faint grooves radiating from its crown, bands of nacre catching the light, and tiny granules,
  // thicker toward the rim. Its limbs: fine rings round each segment, flecks of nacre, and a darker band at each joint
  var crbShellTex = null, crbLimbTex = null;
  function crbTextures() {
    if (crbShellTex) return;
    crbShellTex = new THREE.CanvasTexture(glimCanvas(1024, 512, function (g, w, h) {
      g.fillStyle = '#ececec'; g.fillRect(0, 0, w, h);
      function wrapped(fn) { [-w, 0, w].forEach(fn); }
      for (var b = 0; b < 26; b++) { var y = h * 0.04 + Math.pow(b / 26, 0.8) * h * 0.5, a = 0.05 + glimR(b * 3.1) * 0.06; g.fillStyle = 'rgba(255,255,255,' + a + ')'; g.fillRect(0, y, w, 3 + glimR(b) * 8); }   // (bands of nacre)
      g.lineWidth = 1;
      for (var r = 0; r < 70; r++) {                                 // (growth lines, closer together toward the rim)
        var y0 = h * 0.03 + Math.pow(r / 70, 0.7) * h * 0.55, wob = 1 + glimR(r * 7.3) * 2.5, ph = glimR(r * 2.9) * 6;
        g.strokeStyle = r % 4 ? 'rgba(150,150,150,0.16)' : 'rgba(120,120,120,0.3)';
        g.beginPath(); for (var x = 0; x <= w; x += 8) { var yy = y0 + Math.sin(x / w * Math.PI * 18 + ph) * wob; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke();
      }
      for (var gr = 0; gr < 36; gr++) { var gx = (gr + glimR(gr * 1.7) * 0.6) / 36 * w; g.strokeStyle = 'rgba(140,140,140,0.08)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(gx, h * 0.05); g.lineTo(gx + (glimR(gr) - 0.5) * 10, h * 0.62); g.stroke(); }   // (faint radial grooves)
      for (var i = 0; i < 2600; i++) {                                // (tiny granules, each lit from above)
        var px = glimR(i * 3.7 + 11) * w, py = h * (0.1 + Math.pow(glimR(i * 5.9 + 11), 0.55) * 0.55), rr = 0.8 + glimR(i * 2.3) * (py / h) * 3;
        wrapped(function (ox) { g.fillStyle = 'rgba(120,120,120,0.35)'; g.beginPath(); g.arc(px + ox, py + rr * 0.4, rr, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(px + ox - rr * 0.2, py - rr * 0.2, rr * 0.75, 0, Math.PI * 2); g.fill(); });
      }
    }));
    crbShellTex.wrapS = THREE.RepeatWrapping; crbShellTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    crbLimbTex = new THREE.CanvasTexture(glimCanvas(512, 64, function (g, w, h) {
      g.fillStyle = '#eeeeee'; g.fillRect(0, 0, w, h);
      for (var x = 0; x < w; x += 6 + glimR(x) * 5) { g.fillStyle = 'rgba(140,140,140,' + (0.12 + glimR(x * 1.3) * 0.18) + ')'; g.fillRect(x, 0, 1.2, h); }   // (fine rings round it)
      [[0, 22], [w - 22, 22]].forEach(function (b) { var gg = g.createLinearGradient(b[0], 0, b[0] + b[1], 0); gg.addColorStop(b[0] ? 0 : 1, 'rgba(120,110,130,0)'); gg.addColorStop(b[0] ? 1 : 0, 'rgba(120,110,130,0.45)'); g.fillStyle = gg; g.fillRect(b[0], 0, b[1], h); });   // (darker at each joint)
      for (var i = 0; i < 400; i++) { g.fillStyle = glimR(i) > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(150,150,160,0.3)'; g.fillRect(glimR(i * 3.3) * w, glimR(i * 4.9) * h, 1.5, 1.5); }   // (flecks of nacre)
    }));
    crbLimbTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  }
  // building one: an opal shell with its runes and pearls; a soft, pale underside; a garden of crystals, coral and
  // anemones; eyes on stalks; crystal pincers holding glowing orbs; six slender legs; trailing veils; bubbles, a
  // circling pearl and tidepool ripples
  function crbBuild(pal) {
    var root = new THREE.Group(), body = new THREE.Group(), yawG = new THREE.Group(); root.add(yawG); yawG.add(body); abRoom.add(root);
    var seg = new THREE.SphereGeometry(1, 32, 24);
    var shellCol = new THREE.Color(pal.shell), rimCol = new THREE.Color(pal.rim), underCol = new THREE.Color(pal.under), legCol = new THREE.Color(pal.leg), glowCol = new THREE.Color(pal.glow), glow2Col = new THREE.Color(pal.glow2);
    function part(geo, mat, x, y, z, sx, sy, sz, parent, rx, ry, rz) { var m = abPart(geo, mat, x, y, z, rx || 0, ry || 0, rz || 0, parent || body); m.scale.set(sx, sy, sz); return m; }
    function ss(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
    function sm(a, b, k) { var h = Math.max(0, Math.min(1, 0.5 + 0.5 * (b - a) / k)); return b + (a - b) * h - k * h * (1 - h); }
    function ell(x, y, z, cx, cy, cz, rx, ry, rz) { var ex = (x - cx) / rx, ey = (y - cy) / ry, ez = (z - cz) / rz; return (Math.sqrt(ex * ex + ey * ey + ez * ez) - 1) * Math.min(rx, ry, rz); }
    function sdfShape(fn, seg2, rMax, colFn) {
      var geo = new THREE.SphereGeometry(1, seg2[0], seg2[1]), p = geo.attributes.position, cols = [], n = new THREE.Vector3(), q = new THREE.Vector3(), c = new THREE.Color();
      for (var i = 0; i < p.count; i++) {
        n.set(p.getX(i), p.getY(i), p.getZ(i)).normalize(); var lo = 0.0005, hi = rMax;
        for (var it = 0; it < 24; it++) { var mid = (lo + hi) / 2; if (fn(n.x * mid, n.y * mid, n.z * mid) < 0) lo = mid; else hi = mid; }
        q.copy(n).multiplyScalar(lo); p.setXYZ(i, q.x, q.y, q.z); colFn(n, q, c); cols.push(c.r, c.g, c.b);
      }
      geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals(); return geo;
    }
    function taper(curve, segs, radial, rFn) {                       // a tube along a curve, its radius at each point from rFn(t)
      var g = new THREE.TubeGeometry(curve, segs, 1, radial, false), p = g.attributes.position;
      for (var k = 0; k <= segs; k++) { var t = k / segs, cc = curve.getPointAt(t), r = rFn(t); for (var j = 0; j <= radial; j++) { var q = k * (radial + 1) + j; p.setXYZ(q, cc.x + (p.getX(q) - cc.x) * r, cc.y + (p.getY(q) - cc.y) * r, cc.z + (p.getZ(q) - cc.z) * r); } }
      g.computeVertexNormals(); return g;
    }
    function soft(parent, pos, col, size, op) { var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(size, size, 1); sp.position.copy(pos); parent.add(sp); return sp; }
    function spark(parent, pos, col, size, op) { var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glimSparkTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(size, size, 1); sp.position.copy(pos); parent.add(sp); return sp; }
    var limbMat = ostIri(new THREE.MeshPhysicalMaterial({ color: legCol, map: crbLimbTex, bumpMap: crbLimbTex, bumpScale: 0.0005, roughness: 0.36, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.3, emissive: legCol.clone().lerp(glowCol, 0.4), emissiveIntensity: 0.18 }), 0.55);   // (its limbs, finely ringed and flecked with nacre)
    var hairMat = new THREE.MeshStandardMaterial({ color: legCol.clone().lerp(rimCol, 0.3), roughness: 0.7 });
    var pearlMat = ostIri(new THREE.MeshPhysicalMaterial({ color: legCol, roughness: 0.32, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.25, emissive: legCol.clone().lerp(glowCol, 0.4), emissiveIntensity: 0.2 }), 0.55);   // (pearly, shimmering with every colour as it turns)
    crbTextures();
    var shellMat = ostIri(new THREE.MeshPhysicalMaterial({ vertexColors: true, map: crbShellTex, bumpMap: crbShellTex, bumpScale: 0.0012, roughness: 0.34, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.2, emissive: pal.glow, emissiveIntensity: 0.14 }), 0.9);   // (glowing softly from within)
    var beadMat = ostIri(new THREE.MeshPhysicalMaterial({ color: 0xfffaff, roughness: 0.18, clearcoat: 1, emissive: underCol, emissiveIntensity: 0.35 }), 0.8);   // (living opal)
    var crystalMat = new THREE.MeshPhysicalMaterial({ color: pal.crystal, roughness: 0.04, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.72, emissive: pal.glow, emissiveIntensity: 0.4, flatShading: true });
    var lightMat = new THREE.MeshBasicMaterial({ color: glowCol.clone().lerp(new THREE.Color(0xffffff), 0.45), transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
    // the shell: a wide dome of living opal, scalloped round its rim, its colour deepening toward the edge
    var BY = 0.075, torso = new THREE.Group(); torso.position.set(0, BY, 0); body.add(torso);
    function shellSdf(x, y, z) {
      var a = Math.atan2(z, x), k = 1 + 0.026 * Math.sin(a * 9) * ss(0.02, -0.01, y);   // (gently scalloped round its rim)
      var d = ell(x / k, y, z / k, 0, 0, 0, 0.108, 0.058, 0.084);
      d = sm(d, ell(x, y, z, 0, 0.012, 0.025, 0.07, 0.05, 0.055), 0.03);   // (a gentle rise toward the front)
      return Math.max(d, -(y + 0.016));                                   // (open underneath, where its soft body is)
    }
    var shellGeo = sdfShape(shellSdf, [120, 80], 0.2, function (n, q, c) { var a = Math.atan2(q.z, q.x); var f1 = 0.5 + 0.5 * Math.sin(q.x * 70 + Math.sin(q.z * 55) * 2.2), f2 = 0.5 + 0.5 * Math.sin(q.z * 64 - Math.sin(q.x * 48) * 2.4 + 1.3); c.copy(shellCol).lerp(glowCol, ss(0.6, 1, f1) * 0.45).lerp(glow2Col, ss(0.62, 1, f2) * 0.45).lerp(rimCol, ss(0.55, 0.05, n.y) * 0.75).multiplyScalar(0.96 + 0.05 * Math.sin(a * 18 + q.y * 90) * ss(0.2, 0.7, n.y)); });   // (with faint ridges radiating from its crown)
    abPart(shellGeo, shellMat, 0, 0, 0, 0, 0, 0, torso).castShadow = true;
    var under = sdfShape(function (x, y, z) { return ell(x, y, z, 0, -0.02, 0.0, 0.09, 0.03, 0.07); }, [60, 40], 0.12, function (n, q, c) { c.copy(underCol).lerp(legCol, 0.3); });
    var underMat = zSoftMat({ vertexColors: true, roughness: 0.55, color: 0xffffff, map: crbLimbTex }, 0.08, 0.2, 0.15);
    abPart(under, underMat, 0, 0, 0, 0, 0, 0, torso).castShadow = true;   // (its soft, pale underside)
    var plateMat = ostIri(new THREE.MeshPhysicalMaterial({ color: underCol.clone().lerp(legCol, 0.4), roughness: 0.4, clearcoat: 0.6, map: crbLimbTex }), 0.4);
    for (var pl = 0; pl < 5; pl++) part(seg, plateMat, 0, -0.046 + pl * 0.0006, 0.03 - pl * 0.015, 0.05 - Math.abs(pl - 1.5) * 0.007, 0.0035, 0.0085, torso);   // (the jointed plates across its belly)
    [-1, 1].forEach(function (s) {                                   // (its little mouthparts, folded like two doors beneath its smile, fringed with fine hairs)
      var mp = part(seg, plateMat, s * 0.0068, -0.026, 0.062, 0.0062, 0.0095, 0.0022, torso, -0.35, 0, s * 0.08);
      for (var hh = 0; hh < 7; hh++) part(new THREE.CylinderGeometry(0.00025, 0.0001, 0.005, 3).translate(0, -0.0025, 0), hairMat, s * (0.0035 + hh * 0.0011), -0.0345, 0.0645, 1, 1, 1, torso, 0.3, 0, s * 0.2);
    });
    var sRay = new THREE.Raycaster(), sMesh = new THREE.Mesh(shellGeo, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); sMesh.updateMatrixWorld(true);
    var shellDetail = function () {
      // a rolled lip all round the rim of its shell, and small rounded teeth along its front edge, as a real crab has
      var lipMat = ostIri(new THREE.MeshPhysicalMaterial({ color: rimCol.clone().lerp(shellCol, 0.35), map: crbLimbTex, roughness: 0.3, clearcoat: 0.8, emissive: pal.glow, emissiveIntensity: 0.1 }), 0.7), lip = [];
      for (var k = 0; k <= 96; k++) lip.push(onShell(k / 96 * Math.PI * 2, -0.12, -0.001));
      abPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lip, true), 192, 0.0022, 8, true), lipMat, 0, 0, 0, 0, 0, 0, torso).castShadow = true;
      for (var tk = 0; tk < 14; tk++) {
        var az = (tk % 7 / 6 - 0.5) * 1.3 + (tk < 7 ? -1 : 1) * 0.72; if (Math.abs(az) < 0.5) continue;
        var tp = onShell(az, -0.06, -0.0005), tooth = part(seg, lipMat, tp.x, tp.y, tp.z, 0.0036, 0.0026, 0.0024, torso); tooth.rotation.y = az + Math.PI / 2; tooth.castShadow = true;   // (rounded, like little knuckles)
      }
      // the grooves dividing the regions of its shell, like the faint "H" on a crab's back
      var grooveMat = new THREE.MeshStandardMaterial({ color: rimCol.clone().multiplyScalar(0.7), roughness: 0.5, transparent: true, opacity: 0.55 });
      [-1, 1].forEach(function (s) { var gp = []; for (var k = 0; k <= 16; k++) { var t = k / 16; gp.push(onShell(s * (0.35 + Math.sin(t * Math.PI) * 0.25), 1.1 - t * 0.85, 0.0003)); } abPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(gp), 32, 0.0007, 5, false), grooveMat, 0, 0, 0, 0, 0, 0, torso); });
      var cg = []; for (var k2 = 0; k2 <= 16; k2++) cg.push(onShell(-0.45 + k2 / 16 * 0.9, 0.62 + Math.sin(k2 / 16 * Math.PI) * 0.08, 0.0003)); abPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cg), 32, 0.0007, 5, false), grooveMat, 0, 0, 0, 0, 0, 0, torso);
      // a few tiny barnacles and a spiral seashell that have settled toward the back of its shell
      var barnMat = zSoftMat({ roughness: 0.75, color: shellCol.clone().lerp(new THREE.Color(0xf4ecdc), 0.6), map: crbLimbTex }, 0.06, 0.15, 0.3);
      [[2.6, 0.5, 0.0042], [3.0, 0.32, 0.0034], [3.5, 0.45, 0.0038], [2.85, 0.2, 0.0028]].forEach(function (bp) {
        var p0 = onShell(bp[0], bp[1], -0.0008), nrm = p0.clone().normalize(), bg = new THREE.Group(); bg.position.copy(p0); bg.lookAt(p0.clone().add(nrm)); bg.rotateX(Math.PI / 2); torso.add(bg);
        var cone = new THREE.CylinderGeometry(bp[2] * 0.55, bp[2], bp[2] * 1.1, 6, 1, true), cp = cone.attributes.position; for (var i = 0; i < cp.count; i++) { var a = Math.atan2(cp.getZ(i), cp.getX(i)); var f = 1 + 0.12 * Math.sin(a * 6); cp.setX(i, cp.getX(i) * f); cp.setZ(i, cp.getZ(i) * f); } cone.computeVertexNormals();   // (ridged plates round a little crater)
        abPart(cone, barnMat, 0, bp[2] * 0.55, 0, 0, 0, 0, bg).castShadow = true; part(seg, new THREE.MeshStandardMaterial({ color: rimCol.clone().lerp(shellCol, 0.3), roughness: 0.8 }), 0, bp[2] * 0.95, 0, bp[2] * 0.45, bp[2] * 0.12, bp[2] * 0.45, bg);
      });
      var spiral = new THREE.Group(), sp0 = onShell(3.3, 0.7, 0.0); spiral.position.copy(sp0); spiral.rotation.set(0.4, 1.2, -0.6); torso.add(spiral);
      var spPts = []; for (var k3 = 0; k3 <= 40; k3++) { var t3 = k3 / 40, a3 = t3 * Math.PI * 5; spPts.push(V3(Math.cos(a3) * 0.006 * (1 - t3 * 0.8), t3 * 0.012, Math.sin(a3) * 0.006 * (1 - t3 * 0.8))); }
      abPart(taper(new THREE.CatmullRomCurve3(spPts), 80, 8, function (t) { return 0.0034 * (1 - t * 0.8) + 0.0003; }), ostIri(new THREE.MeshPhysicalMaterial({ color: glow2Col.clone().lerp(new THREE.Color(0xfff4ec), 0.55), roughness: 0.3, clearcoat: 1 }), 0.6), 0, 0, 0, 0, 0, 0, spiral).castShadow = true;   // (a tiny spiral seashell)
    };
    function onShell(az, el, lift) { var d = V3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)); sRay.set(V3(0, 0, 0), d); var h = sRay.intersectObject(sMesh)[0]; return h ? h.point.clone().addScaledVector(h.face.normal.clone().normalize(), lift) : d.multiplyScalar(0.06); }
    shellDetail();
    // glowing runes on its shell: a ring round its crown, with lines of light running out from it and curling at their ends
    var runeLights = [];
    function lightLine(pts, r) { var m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 3, r, 5, false), lightMat); m.renderOrder = 2; torso.add(m); }
    var ring = []; for (var rk = 0; rk <= 40; rk++) ring.push(onShell(rk / 40 * Math.PI * 2, 1.05, 0.0012)); lightLine(ring, 0.0011);
    for (var ln = 0; ln < 8; ln++) {
      var az0 = ln / 8 * Math.PI * 2 + 0.2, pts = [];
      for (var lk = 0; lk <= 18; lk++) { var lt = lk / 18; pts.push(onShell(az0 + Math.sin(lt * 4) * 0.12, 1.02 - lt * 0.75, 0.0012)); }
      for (var ck = 1; ck <= 12; ck++) { var ct = ck / 12, ca = az0 + 0.12 * Math.sin(4) + (ln % 2 ? 1 : -1) * ct * 0.35; pts.push(onShell(ca, 0.27 + Math.sin(ct * Math.PI * 1.6) * 0.1, 0.0012)); }   // (curling at its end)
      lightLine(pts, 0.0011); runeLights.push(spark(torso, pts[18], ln % 2 ? pal.glow : pal.glow2, 0.022, 0.8));
    }
    // tiny pearls set in a ring round the rim of its shell, and a few scattered over it
    var pearlGeo = new THREE.SphereGeometry(1, 14, 10), pearls = new THREE.InstancedMesh(pearlGeo, beadMat, 46), po = new THREE.Object3D(), pc = 0;
    for (var pk = 0; pk < 36; pk++) { po.position.copy(onShell(pk / 36 * Math.PI * 2, 0.08, 0.0015)); po.scale.setScalar(0.0032 + (pk % 2) * 0.0008); po.updateMatrix(); pearls.setMatrixAt(pc++, po.matrix); }
    for (var pq = 0; pq < 10; pq++) { po.position.copy(onShell(glimR(pq * 3.3) * Math.PI * 2, 0.4 + glimR(pq * 5.1) * 0.5, 0.0015)); po.scale.setScalar(0.0025 + glimR(pq) * 0.0015); po.updateMatrix(); pearls.setMatrixAt(pc++, po.matrix); }
    pearls.count = pc; pearls.instanceMatrix.needsUpdate = true; pearls.castShadow = true; torso.add(pearls);
    // a little garden growing on its back: tall crystals, branching coral with glowing tips, and soft anemones
    var garden = new THREE.Group(); garden.position.copy(onShell(0, Math.PI / 2, -0.003)); torso.add(garden);
    var crystals = [], cGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1), tGeo = new THREE.ConeGeometry(1, 0.5, 6, 1); cGeo.translate(0, 0.5, 0); tGeo.translate(0, 1.25, 0);
    [[0, 0, 0.0085, 0.07, 0, 0], [0.018, -0.008, 0.006, 0.048, 0.25, -0.2], [-0.016, 0.006, 0.0065, 0.052, -0.28, 0.15], [0.006, 0.02, 0.005, 0.038, 0.1, 0.35], [-0.008, -0.02, 0.0045, 0.032, -0.15, -0.35], [0.026, 0.014, 0.004, 0.028, 0.45, 0.2]].forEach(function (c, k) {
      var cg = new THREE.Group(); cg.position.set(c[0], 0, c[1]); cg.rotation.set(c[5], 0, -c[4]); garden.add(cg);
      part(cGeo, crystalMat, 0, 0, 0, c[2], c[3] * 0.8, c[2], cg); part(tGeo, crystalMat, 0, 0, 0, c[2], c[3] * 0.8, c[2], cg).position.y = 0;   // (a six-sided crystal with a pointed tip)
      crystals.push({ g: soft(cg, V3(0, c[3] * 0.55, 0), k % 2 ? pal.glow2 : pal.glow, c[3] * 1.4, 0.35), ph: k * 1.3 });
    });
    var coralMat = zSoftMat({ roughness: 0.6, color: glow2Col.clone().lerp(new THREE.Color(0xffffff), 0.3) }, 0.15, 0.3, 0.2), coralTips = [];
    [[-0.03, -0.012, -0.4], [0.03, -0.02, 0.5], [-0.004, -0.034, 0.05]].forEach(function (cb, k) {   // (branching coral)
      var cg = new THREE.Group(); cg.position.set(cb[0], -0.002, cb[1]); cg.rotation.z = cb[2]; garden.add(cg);
      [[0, 0.032, 0, 0], [0.012, 0.024, 0.4, 0.45], [-0.01, 0.022, -0.5, 0.55], [0.004, 0.018, 0.2, 0.7]].forEach(function (br) {
        var base = V3(0, 0.032 * br[3], 0), tip = V3(br[0], 0.032 * br[3] + br[1], br[0] * 0.3), cv = new THREE.QuadraticBezierCurve3(base, base.clone().lerp(tip, 0.5).add(V3(br[2] * 0.004, 0, 0)), tip);
        abPart(taper(cv, 10, 6, function (t) { return 0.0028 * (1 - t * 0.55); }), coralMat, 0, 0, 0, 0, 0, 0, cg);
        var tp = part(seg, new THREE.MeshBasicMaterial({ color: glow2Col.clone().lerp(new THREE.Color(0xffffff), 0.4) }), tip.x, tip.y, tip.z, 0.0024, 0.0024, 0.0024, cg); coralTips.push(tp);
      });
    });
    var anemones = [];
    [[0.036, 0.016], [-0.034, 0.02]].forEach(function (an, k) {   // (soft anemones, their tentacles swaying, tipped with light)
      var ag = new THREE.Group(); ag.position.set(an[0], -0.004, an[1]); garden.add(ag); part(seg, coralMat, 0, 0, 0, 0.007, 0.004, 0.007, ag);
      for (var t = 0; t < 14; t++) { var a = t / 14 * Math.PI * 2, tg = new THREE.Group(); tg.position.set(Math.cos(a) * 0.004, 0.002, Math.sin(a) * 0.004); tg.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); ag.add(tg); var len = 0.014 + glimR(t * 3.1 + k) * 0.006; abPart(taper(new THREE.LineCurve3(V3(0, 0, 0), V3(0, len, 0)), 6, 5, function (u) { return 0.0011 * (1 - u * 0.6); }), coralMat, 0, 0, 0, 0, 0, 0, tg); part(seg, lightMat, 0, len, 0, 0.0013, 0.0013, 0.0013, tg); anemones.push({ g: tg, rx: tg.rotation.x, rz: tg.rotation.z, ph: a + k }); }
    });
    // eyes on slender stalks, big and shining
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x050402, roughness: 0.05, metalness: 0.2 }), irisMat = new THREE.MeshStandardMaterial({ map: tortEyeTex(pal), roughness: 0.1, emissive: 0xffffff, emissiveIntensity: 0.12 }); irisMat.emissiveMap = irisMat.map;
    var corneaMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.02, metalness: 0.1, depthWrite: false });
    var irisGeo = new THREE.SphereGeometry(1, 36, 14, 0, Math.PI * 2, 0, 1.05); irisGeo.rotateX(Math.PI / 2);
    (function () { var ps = irisGeo.attributes.position, uv = irisGeo.attributes.uv, k = 0.46 / Math.sin(1.05); for (var i = 0; i < ps.count; i++) uv.setXY(i, 0.5 + ps.getX(i) * k, 0.5 + ps.getY(i) * k); uv.needsUpdate = true; })();
    var lidMat = new THREE.MeshPhysicalMaterial({ color: pal.shell, roughness: 0.3, clearcoat: 0.6, side: THREE.DoubleSide }), lidGeo = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), lids = [], stalks = [];
    [-1, 1].forEach(function (s) {
      var sp = new THREE.Group(); sp.position.copy(onShell(s * 0.42, 0.55, -0.002)); torso.add(sp);
      var sc = new THREE.QuadraticBezierCurve3(V3(0, 0, 0), V3(s * 0.002, 0.012, 0.004), V3(s * 0.006, 0.024, 0.006));
      abPart(taper(sc, 14, 8, function (t) { return 0.0055 - t * 0.0015; }), limbMat, 0, 0, 0, 0, 0, 0, sp).castShadow = true;
      [0.3, 0.6].forEach(function (t) { var b = new THREE.Mesh(new THREE.TorusGeometry(0.0048, 0.0008, 6, 20), lightMat); b.position.copy(sc.getPoint(t)); b.rotation.x = Math.PI / 2; sp.add(b); });   // (little rings of light round each stalk)
      var ey = new THREE.Group(); ey.position.set(s * 0.006, 0.04, 0.008); ey.lookAt(V3(s * 0.006 + s * 0.25, 0.04 + 0.1, 1.008)); sp.add(ey);
      var R = 0.0165; part(seg, pearlMat, 0, 0, -0.004, R * 1.05, R * 1.05, R * 1.05, ey);   // (a pearly cup round each eye)
      part(seg, eyeMat, 0, 0, 0, R, R, R * 0.9, ey); abPart(irisGeo, irisMat, 0, 0, 0, 0, 0, 0, ey).scale.set(R * 1.01, R * 1.01, R * 0.91);
      var co = abPart(irisGeo, corneaMat, 0, 0, 0, 0, 0, 0, ey); co.scale.set(R * 1.06, R * 1.06, R * 1.05); co.castShadow = false;
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff }), -0.0035, 0.004, R * 0.92, 0.0022, 0.0024, 0.0008, ey);
      part(seg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }), 0.003, -0.0035, R * 0.9, 0.0011, 0.0009, 0.0006, ey);
      var lg = new THREE.Group(); ey.add(lg); lids.push(lg); lg.visible = false; abPart(lidGeo, lidMat, 0, 0, 0, 0, 0, 0, lg).scale.set(R * 1.12, R * 1.12, R * 1.12);
      stalks.push({ g: sp, s: s });
    });
    var smile = []; for (var mi = 0; mi <= 12; mi++) { var mt = mi / 12 - 0.5; smile.push(V3(mt * 0.022, -0.017 - Math.cos(mt * Math.PI) * 0.003 + 0.003, 0.071 - mt * mt * 0.02)); }
    torso.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(smile), 20, 0.0008, 5, false), new THREE.MeshStandardMaterial({ color: rimCol.clone().multiplyScalar(0.5), roughness: 0.6 })));   // (a small, contented smile)
    // its arms: slender and pearly, ending in delicate pincers of crystal that cradle a glowing orb
    var arms = [];
    [-1, 1].forEach(function (s) {
      var arm = new THREE.Group(); arm.position.set(s * 0.066, -0.008, 0.052); arm.rotation.y = -s * 0.35; arm.scale.setScalar(1.4); torso.add(arm);
      var a1 = new THREE.QuadraticBezierCurve3(V3(0, 0, 0), V3(s * 0.02, 0.012, 0.012), V3(s * 0.03, 0.016, 0.034));
      abPart(taper(a1, 14, 8, function (t) { return 0.0058 - t * 0.0012; }), limbMat, 0, 0, 0, 0, 0, 0, arm).castShadow = true;
      var wrist = new THREE.Group(); wrist.position.copy(a1.getPoint(1)); arm.add(wrist);
      var j = new THREE.Mesh(new THREE.TorusGeometry(0.005, 0.0011, 6, 20), lightMat); j.rotation.x = Math.PI / 2; wrist.add(j);
      var a2 = new THREE.QuadraticBezierCurve3(V3(0, 0, 0), V3(0, 0.004, 0.01), V3(-s * 0.002, 0.004, 0.022));
      abPart(taper(a2, 10, 8, function (t) { return 0.0048 + t * 0.002; }), limbMat, 0, 0, 0, 0, 0, 0, wrist).castShadow = true;
      var hand = new THREE.Group(); hand.position.copy(a2.getPoint(1)); wrist.add(hand);
      var palm = sdfShape(function (x, y, z) { var d = ell(x, y, z, 0, 0, 0.008, 0.009, 0.0075, 0.012); for (var b = 0; b < 9; b++) d = sm(d, ell(x, y, z, Math.sin(b * 2.4) * 0.007, 0.0045 + Math.cos(b * 2.4) * 0.002, 0.002 + b * 0.0016, 0.0014, 0.0014, 0.0014), 0.0012); return d; }, [48, 36], 0.03, function (n, q, c) { c.copy(legCol).lerp(rimCol, ss(0.2, -0.8, n.y) * 0.3).lerp(glowCol, ss(0.6, 1, n.y) * 0.15); });   // (the palm of its pincer, knobbled with little tubercles along the top)
      abPart(palm, ostIri(new THREE.MeshPhysicalMaterial({ vertexColors: true, map: crbLimbTex, roughness: 0.32, clearcoat: 0.8, emissive: pal.glow, emissiveIntensity: 0.12 }), 0.6), 0, 0, 0, 0, 0, 0, hand).castShadow = true;
      var fixedF = new THREE.CatmullRomCurve3([V3(0, -0.003, 0.016), V3(0, -0.006, 0.028), V3(0, -0.003, 0.04), V3(0, 0.002, 0.046)]);
      abPart(taper(fixedF, 16, 8, function (t) { return 0.0042 * Math.pow(1 - t, 0.6) + 0.0004; }), crystalMat, 0, 0, 0, 0, 0, 0, hand);
      var dact = new THREE.Group(); dact.position.set(0, 0.004, 0.014); hand.add(dact);
      var movF = new THREE.CatmullRomCurve3([V3(0, 0, 0), V3(0, 0.006, 0.012), V3(0, 0.004, 0.026), V3(0, -0.002, 0.032)]);
      abPart(taper(movF, 16, 8, function (t) { return 0.0042 * Math.pow(1 - t, 0.6) + 0.0004; }), crystalMat, 0, 0, 0, 0, 0, 0, dact);   // (the finger that opens and closes)
      var toothGeo = new THREE.ConeGeometry(0.0011, 0.0028, 5).translate(0, 0.0014, 0);
      [[fixedF, hand, 1], [movF, dact, -1]].forEach(function (f) { for (var tt = 0; tt < 6; tt++) { var u = 0.2 + tt * 0.11, tp = f[0].getPoint(u), tm = new THREE.Mesh(toothGeo, crystalMat); tm.position.copy(tp).add(V3(0, f[2] * (0.0042 * Math.pow(1 - u, 0.6) + 0.0004) * 0.75, 0)); tm.rotation.x = f[2] > 0 ? 0 : Math.PI; tm.scale.setScalar(1 - u * 0.5); f[1].add(tm); } });   // (rows of little teeth along the inside of its fingers, where they meet)
      for (var hr = 0; hr < 10; hr++) { var ha = hr / 10 * Math.PI * 2, hm = new THREE.Mesh(new THREE.CylinderGeometry(0.0002, 0.00008, 0.0045, 3).translate(0, 0.00225, 0), hairMat); hm.position.set(Math.cos(ha) * 0.0058, Math.sin(ha) * 0.0048, 0.017); hm.rotation.set(Math.PI / 2 - 0.5, 0, ha - Math.PI / 2); hand.add(hm); }   // (a fringe of fine hairs where its fingers begin)
      var orb = part(seg, new THREE.MeshBasicMaterial({ color: glow2Col.clone().lerp(new THREE.Color(0xffffff), 0.55) }), 0, 0.0005, 0.031, 0.0085, 0.0085, 0.0085, hand);
      arms.push({ g: arm, wrist: wrist, dact: dact, orb: orb, og: soft(hand, orb.position, pal.glow2, 0.05, 0.5), os: spark(hand, orb.position, 0xffffff, 0.03, 0.6), s: s });
    });
    // six slender, jointed legs of pearl, three to a side, mostly hidden beneath its shell, with a ring of light at each knee and a glowing tip
    var legs = [];
    [-1, 1].forEach(function (s) {
      [0.03, -0.012, -0.052].forEach(function (lz, k) {
        var hip = new THREE.Group(); hip.position.set(s * 0.06, -0.012, lz); hip.rotation.y = -s * (0.25 - k * 0.25); torso.add(hip);
        var up = new THREE.Group(); hip.add(up);
        function segm(parent, a, b, r0, r1, flat) {                  // one segment of a leg, from a to b, a little flattened, swelling slightly in the middle, with a knob at its end
          var cv = new THREE.LineCurve3(a, b), m = abPart(taper(cv, 14, 10, function (t) { return (r0 + (r1 - r0) * t) * (1 + 0.12 * Math.sin(t * Math.PI)); }), limbMat, 0, 0, 0, 0, 0, 0, parent); m.castShadow = true;
          if (flat) { m.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-a.x, -a.y, -a.z)); m.position.copy(a); }
          part(seg, limbMat, b.x, b.y, b.z, r1 * 1.12, r1 * 1.12, r1 * 1.12, parent); return cv;
        }
        part(seg, limbMat, 0, 0, 0, 0.0052, 0.0046, 0.0052, up);   // (the joint where it meets its body)
        segm(up, V3(0, 0, 0), V3(s * 0.009, 0.002, 0), 0.0046, 0.0043);   // (a short first segment)
        segm(up, V3(s * 0.009, 0.002, 0), V3(s * 0.032, 0.008, 0), 0.0043, 0.0036);   // (the long thigh)
        var knee = new THREE.Group(); knee.position.set(s * 0.032, 0.008, 0); up.add(knee);
        var kr = new THREE.Mesh(new THREE.TorusGeometry(0.0043, 0.0009, 6, 20), lightMat); kr.rotation.y = Math.PI / 2; knee.add(kr);
        segm(knee, V3(0, 0, 0), V3(s * 0.008, -0.012, 0), 0.0034, 0.003);   // (a short knee segment)
        var pr = segm(knee, V3(s * 0.008, -0.012, 0), V3(s * 0.016, -0.042, 0), 0.003, 0.0024);   // (the shin)
        for (var st = 0; st < 9; st++) { var sp2 = pr.getPoint(0.1 + st * 0.1), hm = new THREE.Mesh(new THREE.CylinderGeometry(0.00022, 0.00008, 0.0042, 3).translate(0, 0.0021, 0), hairMat); hm.position.copy(sp2).add(V3(-s * 0.0022, 0, (st % 2 ? 1 : -1) * 0.0012)); hm.rotation.z = s * (1.9 + (st % 3) * 0.15); knee.add(hm); }   // (a row of fine bristles down the back of its shin)
        var dc = new THREE.QuadraticBezierCurve3(V3(s * 0.016, -0.042, 0), V3(s * 0.02, -0.056, 0), V3(s * 0.02, -0.069, 0));
        abPart(taper(dc, 16, 8, function (t) { return 0.0024 * Math.pow(1 - t, 0.75) + 0.0004; }), limbMat, 0, 0, 0, 0, 0, 0, knee).castShadow = true;   // (the last segment, curving to a fine point)
        var tip = part(seg, lightMat, s * 0.02, -0.069, 0, 0.0014, 0.0014, 0.0014, knee);
        legs.push({ up: up, knee: knee, ph: (k + (s > 0 ? 0.5 : 0)) * Math.PI * 0.66, tip: tip });
      });
    });
    // veils of iridescent light trailing behind it from the back of its shell, rippling like the fins of a sea-dragon
    var veilTex = new THREE.CanvasTexture(glimCanvas(64, 256, function (g, w, h) {
      var lg2 = g.createLinearGradient(0, 0, 0, h); pal.veil.forEach(function (c, k) { lg2.addColorStop(k / (pal.veil.length - 1), crbCss(c)); }); g.fillStyle = lg2; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 1; for (var k = 0; k < 7; k++) { g.beginPath(); g.moveTo(w * (0.15 + k * 0.12), 0); g.lineTo(w * (0.15 + k * 0.12) + (k - 3) * 2, h); g.stroke(); }   // (fine rays through it, as in a fin)
      g.globalCompositeOperation = 'destination-in'; var fx = g.createLinearGradient(0, 0, w, 0); fx.addColorStop(0, 'rgba(0,0,0,0)'); fx.addColorStop(0.5, 'rgba(0,0,0,1)'); fx.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = fx; g.fillRect(0, 0, w, h);
      var fy = g.createLinearGradient(0, 0, 0, h); fy.addColorStop(0, 'rgba(0,0,0,0.9)'); fy.addColorStop(0.75, 'rgba(0,0,0,0.6)'); fy.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = fy; g.fillRect(0, 0, w, h);
    }));
    var veils = [];
    [[-0.04, 0.35, 0, 0], [0, 0, 2.1, 0], [0.04, -0.35, 4.2, 0], [0.22, 0.9, 1.0, 1], [-0.22, -0.9, 3.1, 1]].forEach(function (vb) {
      var vg = new THREE.PlaneGeometry(vb[3] ? 0.07 : 0.09, 0.19, 2, 30); vg.translate(0, -0.095, 0);
      var vm = new THREE.Mesh(vg, new THREE.MeshBasicMaterial({ map: veilTex, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
      vm.position.copy(onShell(Math.PI + vb[0] * 6, 0.1, 0.0)); vm.rotation.set(vb[3] ? -1.5 : -1.38, vb[1], 0); vm.renderOrder = 3; torso.add(vm);
      veils.push({ m: vm, base: Float32Array.from(vg.attributes.position.array), ph: vb[2] });
    });
    // bubbles drifting up from its crystals, shimmering like soap; a pearl circling slowly over it; and tidepool
    // ripples spreading softly round it on the straw
    var bubMat = filmMat(pal.glow, 1.0), bubbles = [];
    for (var bb = 0; bb < 10; bb++) { var bm = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), bubMat); bm.renderOrder = 4; root.add(bm); bubbles.push({ m: bm, t: glimR(bb * 3.7), x: (glimR(bb * 5.3) - 0.5) * 0.08, z: (glimR(bb * 7.1) - 0.5) * 0.06, r: 0.004 + glimR(bb * 2.3) * 0.006 }); }
    var orbit = new THREE.Group(); root.add(orbit);
    var moonPearl = part(new THREE.SphereGeometry(1, 24, 16), pearlMat, 0, 0, 0, 0.011, 0.011, 0.011, orbit), mpGlow = soft(orbit, V3(0, 0, 0), pal.glow, 0.09, 0.5);
    var ripples = []; for (var rp = 0; rp < 3; rp++) { var rm = new THREE.Mesh(new THREE.RingGeometry(0.965, 1, 64), new THREE.MeshBasicMaterial({ color: pal.glow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); rm.rotation.x = -Math.PI / 2; rm.position.y = 0.09; root.add(rm); ripples.push({ m: rm, t: rp / 3 }); }
    var motes = []; for (var mo = 0; mo < 10; mo++) motes.push({ s: spark(root, V3(0, 0, 0), mo % 2 ? pal.glow : pal.glow2, 0.016, 0), t: glimR(mo * 3.7), a: glimR(mo * 5.3) * Math.PI * 2, r: 0.08 + glimR(mo * 7.9) * 0.12 });
    var glow = soft(root, V3(0, 0.25, 0), pal.glow, 0.9, 0.03);
    var pool = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), new THREE.MeshBasicMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.086, 0); root.add(pool);   // (a soft pool of sea-light beneath it)
    var tagCv = glimCanvas(256, 96, function () {}), tagTex = new THREE.CanvasTexture(tagCv);
    var tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, transparent: true, depthWrite: false }));
    tag.scale.set(0.42, 0.1575, 1); tag.position.set(0, 0.56, 0); tag.renderOrder = 6; root.add(tag);
    return { root: root, yaw: yawG, body: body, torso: torso, garden: garden, crystals: crystals, crystalMat: crystalMat, coralTips: coralTips, anemones: anemones, runeLights: runeLights, lightMat: lightMat, stalks: stalks, lids: lids, arms: arms, legs: legs, veils: veils, bubbles: bubbles, orbit: orbit, mpGlow: mpGlow, ripples: ripples, motes: motes, glow: glow, tagCv: tagCv, tagTex: tagTex, wig: 0, yawNow: 0 };
  }
  // its Tidelight Pearl, resting in an open scallop shell in the straw, and a bundle of hay in the manger when it's been fed
  function crbBuildExtras(g) {
    var sz = GLIM_STALLS[g.stall], pal = CRB_PALS[g.pal % CRB_PALS.length];
    var egg = new THREE.Group(); egg.position.set(-3.3, 0.1, sz - 0.62); abRoom.add(egg);
    var sg = new THREE.SphereGeometry(0.06, 36, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), sp = sg.attributes.position;
    for (var i = 0; i < sp.count; i++) { var x = sp.getX(i), z = sp.getZ(i), a = Math.atan2(z, x), k = 1 + 0.06 * Math.abs(Math.sin(a * 7)); sp.setXYZ(i, x * k, sp.getY(i) * 0.45, z * k); }   // (a fluted scallop shell)
    sg.computeVertexNormals();
    var shell = new THREE.Mesh(sg, ostIri(new THREE.MeshPhysicalMaterial({ color: new THREE.Color(pal.shell).lerp(new THREE.Color(pal.rim), 0.35), map: crbShellTex, roughness: 0.3, clearcoat: 1, side: THREE.DoubleSide }), 0.4)); shell.position.y = 0.03; shell.castShadow = true; egg.add(shell);   // (an open shell, finely ridged)
    var heart = crbPearlModel(pal); heart.position.y = 0.056; egg.add(heart);
    var eg = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: pal.glow, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
    eg.scale.set(0.4, 0.4, 1); eg.position.y = 0.06; egg.add(eg);
    g.eggMesh = egg; g.eggGlow = eg; g.eggHeart = heart;
    var hay = abPart(wbLumpGeo(300 + g.stall, 0.25), new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), -AB_W / 2 + 0.3, 0.94, sz + 1.0);
    hay.scale.set(0.16, 0.07, 0.16); g.hayMesh = hay;
    g.slate.map = glimSlateTex(g.name, 'Iridelle'); g.slate.needsUpdate = true;
  }
  // every frame, for a Iridelle: it scuttles sideways on its six slender legs, then turns to face you; its eye stalks
  // sway and look about and its eyes blink; it opens and closes its crystal pincers, its orbs and crystals pulse with
  // light, its anemones sway and its veils ripple; bubbles drift up, its pearl circles, and ripples spread round it.
  // When petted it raises its pincers and waves them happily, bobbing up and down, and everything shines brighter
  function crbAnimate(g, dt, t, moving) {
    var m = g.m;
    if (moving) g.hop += dt * 9;
    var happy = g.pet > 0, shine = happy ? 1 : 0;
    if (happy) { g.pet -= dt; m.wig += dt; } else m.wig = 0;
    m.yawNow += ((moving ? Math.PI / 2 : 0) - m.yawNow) * Math.min(1, dt * 5); m.yaw.rotation.y = m.yawNow;   // (turning to scuttle sideways, as a crab does)
    m.legs.forEach(function (l) { var w = moving ? Math.sin(g.hop + l.ph) : happy ? Math.sin(m.wig * 9 + l.ph) * 0.3 : Math.sin(t * 0.8 + l.ph) * 0.05; l.up.rotation.z = l.up.rotation.z * 0.7 + (Math.max(0, w) * 0.35) * 0.3; l.up.rotation.y = l.up.rotation.y * 0.7 + (moving ? Math.cos(g.hop + l.ph) * 0.25 : 0) * 0.3; });   // (lifting and swinging in a ripple from front to back)
    m.body.position.y = 0.075 + (moving ? Math.abs(Math.sin(g.hop * 2)) * 0.004 : happy ? Math.abs(Math.sin(m.wig * 8)) * 0.018 : Math.sin(t * 1.3 + g.stall) * 0.0015);
    m.torso.rotation.z = moving ? Math.sin(g.hop) * 0.03 : happy ? Math.sin(m.wig * 4) * 0.06 : 0;
    m.stalks.forEach(function (s, k) { s.g.rotation.x = Math.sin(t * 0.9 + k * 2 + g.stall) * 0.12 + (happy ? -0.15 : 0); s.g.rotation.z = Math.sin(t * 0.6 + k * 1.7 + g.stall) * 0.15 + (happy ? Math.sin(m.wig * 10 + k) * 0.2 : 0); });   // (each eye looking about on its own)
    var bt = (t * 0.22 + g.stall * 0.31) % 1, blink = happy ? 0.6 : (bt < 0.04 ? Math.sin(bt / 0.04 * Math.PI) : 0);
    m.lids.forEach(function (l) { l.visible = blink > 0.03; l.rotation.x = -0.62 + blink * 1.55; });
    m.arms.forEach(function (a, k) {
      var raise = happy ? Math.min(1, m.wig * 3) : 0;
      a.g.rotation.x = a.g.rotation.x * 0.85 + (-raise * 0.9 + Math.sin(t * 0.7 + k * 2) * 0.05) * 0.15; a.g.rotation.z = a.g.rotation.z * 0.85 + (a.s * raise * (0.3 + Math.sin(m.wig * 9 + k * 3) * 0.25)) * 0.15;   // (raising its pincers and waving them)
      a.dact.rotation.x = -(happy ? 0.3 + Math.max(0, Math.sin(m.wig * 12 + k)) * 0.35 : Math.max(0, Math.sin(t * 0.5 + k * 2.4 + g.stall) - 0.7) * 1.4);   // (opening and closing its crystal pincers now and then)
      var p = 0.5 + 0.5 * Math.sin(t * 1.6 + k * 1.5 + g.stall); a.og.material.opacity = 0.3 + p * 0.25 + shine * 0.25; a.os.material.opacity = 0.3 + p * 0.5; a.orb.scale.setScalar(0.0085 * (0.92 + p * 0.12));
    });
    m.crystalMat.emissiveIntensity = 0.35 + (0.5 + 0.5 * Math.sin(t * 1.1 + g.stall)) * 0.2 + shine * 0.35;
    m.crystals.forEach(function (c) { c.g.material.opacity = 0.25 + Math.pow(0.5 + 0.5 * Math.sin(t * 1.4 + c.ph), 2) * 0.3 + shine * 0.2; });
    m.anemones.forEach(function (a) { a.g.rotation.x = a.rx + Math.sin(t * 1.8 + a.ph) * 0.18; a.g.rotation.z = a.rz + Math.cos(t * 1.5 + a.ph) * 0.18; });   // (its anemones sway as if in a gentle current)
    m.lightMat.opacity = 0.6 + Math.sin(t * 1.2 + g.stall) * 0.2 + shine * 0.2;
    m.runeLights.forEach(function (r, k) { r.material.opacity = 0.3 + Math.pow(0.5 + 0.5 * Math.sin(t * 2 + k * 0.8), 4) * 0.6; });   // (light running round its runes)
    m.veils.forEach(function (v) { var pa = v.m.geometry.attributes.position, b = v.base; for (var i = 0; i < pa.count; i++) { var y = b[i * 3 + 1], f = -y / 0.19; pa.setXYZ(i, b[i * 3] + Math.sin(t * 2 + y * 30 + v.ph) * 0.012 * f, y, b[i * 3 + 2] + Math.cos(t * 1.6 + y * 24 + v.ph) * 0.02 * f); } pa.needsUpdate = true; v.m.material.opacity = 0.5 + Math.sin(t * 0.9 + v.ph) * 0.1 + shine * 0.15; });
    m.bubbles.forEach(function (b) { b.t += dt * (happy ? 0.4 : 0.16); if (b.t > 1) { b.t -= 1; b.x = (Math.random() - 0.5) * 0.08; b.z = (Math.random() - 0.5) * 0.06; } b.m.position.set(b.x + Math.sin(b.t * 9 + b.r * 300) * 0.008, 0.22 + b.t * 0.4, b.z); b.m.scale.setScalar(b.r * (b.t < 0.1 ? b.t * 10 : 1)); b.m.visible = b.t < 0.97; });   // (rising and wobbling, then gone)
    var oa = t * 0.6 + g.stall; m.orbit.position.set(Math.cos(oa) * 0.13, 0.36 + Math.sin(t * 1.3) * 0.015, Math.sin(oa) * 0.13); m.mpGlow.material.opacity = 0.4 + Math.sin(t * 2) * 0.1 + shine * 0.2;
    m.ripples.forEach(function (r) { r.t += dt * 0.25; if (r.t > 1) r.t -= 1; var s = 0.08 + r.t * 0.3; r.m.scale.set(s, s, 1); r.m.material.opacity = Math.sin(r.t * Math.PI) * (0.09 + shine * 0.08); });   // (tidepool ripples spreading out round it)
    m.motes.forEach(function (o) { o.t += dt * (happy ? 0.35 : 0.13); if (o.t > 1) { o.t = 0; o.a = Math.random() * Math.PI * 2; } o.s.position.set(Math.cos(o.a + o.t * 2) * o.r, 0.15 + o.t * 0.45, Math.sin(o.a + o.t * 2) * o.r); o.s.material.opacity = Math.sin(o.t * Math.PI) * 0.6; });
    m.glow.material.opacity = 0.03 + Math.sin(t + g.stall) * 0.01 + shine * 0.02;
    if (g.egg) { g.eggGlow.material.opacity = 0.16 + Math.sin(t * 2 + g.stall) * 0.06; g.eggHeart.userData.pearl.rotation.y = t * 0.5; g.eggHeart.userData.sparks.forEach(function (sp, k) { var a = t * 0.9 + k * Math.PI / 2; sp.position.set(Math.cos(a) * 0.04, Math.sin(t * 1.3 + k) * 0.015, Math.sin(a) * 0.04); sp.material.opacity = 0.3 + Math.pow(0.5 + 0.5 * Math.sin(t * 3 + k * 1.7), 3) * 0.6; }); }   // (little sparkles circling it)
  }
  function iridelleAction(g, wx, wz) {                               // taking its Tidelight Pearl, feeding and petting a Iridelle
    if (g.egg) {
      if (!roomFor(['tidelightPearl'])) { bagFull(); return; }
      addItem('tidelightPearl', 1); g.egg = false; glimRefresh(g); popSound(); g.pet = 1.2;
      showToast('You took a shimmering Tidelight Pearl from ' + g.name + '\'s shell! ⚪🌊', 2400);
      return;
    }
    var day = Math.min(CRB_DAYS, g.days + 1);                        // (counting today, once it's fed and petted)
    var news = day >= CRB_DAYS ? ' A Tidelight Pearl tomorrow morning!' : ' Day ' + day + ' of ' + CRB_DAYS + ' toward a Tidelight Pearl.';
    if (!g.fed) {
      if (!takeItem('hay', 1)) { showToast(g.name + ' is hungry! Buy hay at the counter to feed them 🌾', 2600); return; }
      g.fed = true; glimRefresh(g); popSound(); g.pet = 0.8; g.face = Math.atan2(-3.7 - g.x, GLIM_STALLS[g.stall] + 1.0 - g.z);
      showToast(g.name + ' nibbles the hay daintily with its crystal pincers 🌾' + (g.petted ? news : ' Now give them a pet!'), 2600);
      return;
    }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 2.4;
      g.face = Math.atan2(player.position.x - wx, player.position.z - wz);
      glimHeartBurst(g.x, 0.4, g.z); popSound();
      showToast(g.name + ' waves its glowing pincers happily and blows a stream of bubbles 💜' + news, 2800);
      return;
    }
    g.pet = 1.4; glimHeartBurst(g.x, 0.4, g.z);
    showToast(g.name + ' is fed, petted and happy ✧' + (day >= CRB_DAYS ? ' A Tidelight Pearl tomorrow morning!' : ' Day ' + day + ' of ' + CRB_DAYS + ' done. Come back tomorrow!'), 2400);
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
    lotusMilk: function () { return holdBottle(0xffeef6, 0xffc8e4, 0x5ac890, 0xffa8d0); },
    glimmerkelp: function () { return axoKelpBundle(AXO_PALS[0]); },   // (a bundle of glowing kelp, tied with a ribbon)
    starbloom: function () { return tortBloomModel(TORT_PALS[0]); },   // (a Starbloom held by its stem)
    nebulaMilk: function () { return holdBottle(0xf2ecff, 0xc8b8ff, 0xffd27a, 0x7a6aff); },
    seaglassHeart: function () { var g = crbHeartModel(CRB_PALS[0]); g.position.y = 0.05; return g; },   // (a Seaglass Heart, glowing in your palm)
    tidelightPearl: function () { var g = crbPearlModel(CRB_PALS[0]); g.position.y = 0.03; return g; },   // (a Tidelight Pearl, resting in your palm)
    dawnshellEgg: function () { var g = ostEggModel(); g.scale.setScalar(0.85); g.add(holdGlow(OST_PALS[0].glow, 0.34, 0.07)); return g; },
    sunscale: function () { var g = lizScaleModel(LIZ_PALS[0]); g.position.y = 0.05; g.rotation.set(0.3, 0.4, -0.2); return g; },   // (a Sunscale resting on your palm)
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
    prismsilk: function () {                                         // a soft skein of rainbow wool, tied with a ribbon
      var g = new THREE.Group();
      g.add(zCloudMesh(zBillow([[0, 0.05, 0, 0.042, 0.1], [-0.035, 0.035, 0.01, 0.03, 0.5], [0.035, 0.035, -0.008, 0.03, 0.5], [0.004, 0.03, 0.034, 0.03, 0.7], [-0.006, 0.032, -0.034, 0.028, 0.7], [0.01, 0.082, 0.006, 0.026, 0], [0, 0.018, 0, 0.034, 1]], [0, 0.045, 0], 1, 1600), { top: 0xffd8f0, low: 0xb8d8ff, gold: 0xfff0a0 }, 0.012));
      var rb = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.005, 6, 28), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.4 })); rb.rotation.x = Math.PI / 2 - 0.25; rb.position.y = 0.05; g.add(rb);
      g.add(holdGlow(0xfff0ff, 0.36, 0.05));
      return g;
    },
    pearlBubble: function () {                                       // a shimmering bubble with a pearl inside, resting on your palm
      var pal = BUBBLE_PALS[0], g = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 32, 24), filmMat(pal.glow, 1.2)); b.position.y = 0.052; b.renderOrder = 4; g.add(b);
      var pr = new THREE.Mesh(new THREE.SphereGeometry(0.016, 24, 18), new THREE.MeshPhysicalMaterial({ color: 0xf6f0ff, roughness: 0.12, clearcoat: 1, emissive: pal.glow, emissiveIntensity: 0.2 })); pr.position.y = 0.05; g.add(pr);
      g.add(holdGlow(pal.glow, 0.3, 0.05));
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
    var ember = g.kind === 'ember' || g.kind === 'gem' || g.kind === 'aurora' || g.kind === 'zephyra' || g.kind === 'luna' || g.kind === 'bubble' || g.kind === 'prism' || g.kind === 'lotus' || g.kind === 'axo' || g.kind === 'liz' || g.kind === 'tort' || g.kind === 'bison' || g.kind === 'ostrich' || g.kind === 'crab';   // (the ones that count days in a row)
    c.fillStyle = '#5a3d9a'; c.font = 'bold ' + (ember ? 26 : 30) + 'px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(g.name, w / 2, ember ? 26 : 34);
    if (ember) {                                                       // its four days toward a quill or an egg: a little flame (or gem) lit for each day it's been looked after
      var need = g.kind === 'aurora' ? AURORA_DAYS : g.kind === 'zephyra' ? ZEPHYRA_DAYS : g.kind === 'luna' ? LUNA_DAYS : g.kind === 'bubble' ? BUBBLE_DAYS : g.kind === 'prism' ? PRISM_DAYS : g.kind === 'lotus' ? LOTUS_DAYS : g.kind === 'axo' ? AXO_DAYS : g.kind === 'liz' ? LIZ_DAYS : g.kind === 'tort' ? TORT_DAYS : g.kind === 'bison' ? BIS_DAYS : g.kind === 'ostrich' ? OST_DAYS : g.kind === 'crab' ? CRB_DAYS : 4, done = Math.min(need, g.days + (g.fed && g.petted ? 1 : 0));
      for (var p = 0; p < need; p++) {
        if (g.kind === 'aurora') { c.fillStyle = g.egg || p < done ? ['#3ad8a0', '#7a6aff'][p % 2] : '#d8d0e0'; c.beginPath(); c.moveTo(w / 2 + (p - 0.5) * 22, 41); c.bezierCurveTo(w / 2 + (p - 0.5) * 22 + 8, 50, w / 2 + (p - 0.5) * 22 + 6, 57, w / 2 + (p - 0.5) * 22, 57); c.bezierCurveTo(w / 2 + (p - 0.5) * 22 - 6, 57, w / 2 + (p - 0.5) * 22 - 8, 50, w / 2 + (p - 0.5) * 22, 41); }   // (a drop of milk for each day)
        else if (g.kind === 'lotus') { var lx2 = w / 2 + (p - 0.5) * 22; c.fillStyle = g.egg || p < done ? ['#ff9ac8', '#b8a0e8'][p % 2] : '#d8d0e0'; c.beginPath(); for (var lk = 0; lk < 5; lk++) { var la2 = -Math.PI / 2 + (lk - 2) * 0.5; c.ellipse(lx2 + Math.cos(la2) * 4, 51 + Math.sin(la2) * 4, 3, 6.5, la2 + Math.PI / 2, 0, Math.PI * 2); } }   // (a little lotus for each day)
        else if (g.kind === 'axo') { var ax = w / 2 + (p - 1) * 22; c.fillStyle = g.egg || p < done ? ['#ff7aa8', '#b0a4ff', '#ffc8e4'][p % 3] : '#d8d0e0'; c.beginPath(); [-0.6, 0, 0.6].forEach(function (fa) { c.ellipse(ax + Math.sin(fa) * 5, 51 - Math.cos(fa) * 5, 2.4, 6.5, fa, 0, Math.PI * 2); }); }   // (a little sprig of kelp for each day)
        else if (g.kind === 'liz') { var lzx = w / 2 + (p - 0.5) * 22; c.fillStyle = g.egg || p < done ? ['#ffb040', '#ff7a4a'][p % 2] : '#d8d0e0'; c.beginPath(); c.moveTo(lzx, 41); c.bezierCurveTo(lzx + 8, 43, lzx + 8, 53, lzx, 58); c.bezierCurveTo(lzx - 8, 53, lzx - 8, 43, lzx, 41); }   // (a little Sunscale for each day)
        else if (g.kind === 'bison') { var bx2 = w / 2 + (p - 1) * 22; c.fillStyle = g.egg || p < done ? ['#c8b8ff', '#9ad0ff', '#ffb0e0'][p % 3] : '#d8d0e0'; c.beginPath(); for (var bk2 = 0; bk2 < 10; bk2++) { var ba2 = bk2 / 10 * Math.PI * 2, br2 = bk2 % 2 ? 2.6 : 6.4; c[bk2 ? 'lineTo' : 'moveTo'](bx2 + Math.sin(ba2) * br2, 50 - Math.cos(ba2) * br2); } c.closePath(); }   // (a little star for each day)
        else if (g.kind === 'crab') { var cx2 = w / 2 + (p - 2.5) * 19; c.fillStyle = g.egg || p < done ? ['#9ae0ff', '#d8a8ff', '#ffa8c8'][p % 3] : '#d8d0e0'; c.beginPath(); c.arc(cx2, 50, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.arc(cx2 - 2.2, 47.8, 2.2, 0, Math.PI * 2); }   // (a little pearl for each of its six days)
        else if (g.kind === 'ostrich') { var ox2 = w / 2 + (p - 1) * 22; c.fillStyle = g.egg || p < done ? ['#ffb0c8', '#ffd27a', '#f2a8c4'][p % 3] : '#d8d0e0'; c.beginPath(); c.ellipse(ox2, 50, 6, 8, 0, 0, Math.PI * 2); }   // (a little egg for each day)
        else if (g.kind === 'tort') { var tx2 = w / 2 + (p - 1) * 22; c.fillStyle = g.egg || p < done ? ['#ff9ac8', '#9ae0b0', '#c8b0ff'][p % 3] : '#d8d0e0'; c.beginPath(); for (var tk2 = 0; tk2 < 5; tk2++) { var ta2 = tk2 / 5 * Math.PI * 2; c.moveTo(tx2 + Math.sin(ta2) * 4 + 3, 50 - Math.cos(ta2) * 4); c.arc(tx2 + Math.sin(ta2) * 4, 50 - Math.cos(ta2) * 4, 3.2, 0, Math.PI * 2); } }   // (a little flower for each day)
        else if (g.kind === 'prism') { var px = w / 2 + (p - 0.5) * 22; c.fillStyle = g.egg || p < done ? ['#ff8ab8', '#8ab8ff'][p % 2] : '#d8d0e0'; c.beginPath(); c.moveTo(px, 41); c.lineTo(px + 7, 49); c.lineTo(px, 57); c.lineTo(px - 7, 49); c.closePath(); }   // (a little prism for each day)
        else if (g.kind === 'bubble') { var bx = w / 2 + (p - 1) * 22; c.strokeStyle = g.egg || p < done ? ['#3ac8c0', '#8a7aff', '#ff8aa0'][p % 3] : '#d8d0e0'; c.lineWidth = 3; c.beginPath(); c.arc(bx, 50, 7.5, 0, Math.PI * 2); c.stroke(); c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(bx - 2.5, 47.5, 1.8, 0, Math.PI * 2); }   // (a little bubble for each day)
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
    var g = { kind: d.kind === 'moon' || d.kind === 'duck' || d.kind === 'ember' || d.kind === 'gem' || d.kind === 'aurora' || d.kind === 'zephyra' || d.kind === 'luna' || d.kind === 'bubble' || d.kind === 'prism' || d.kind === 'lotus' || d.kind === 'axo' || d.kind === 'liz' || d.kind === 'tort' || d.kind === 'bison' || d.kind === 'ostrich' || d.kind === 'crab' ? d.kind : 'glim', name: d.name, stall: d.stall, pal: d.pal, fed: !!d.fed, petted: !!d.petted, egg: !!d.egg, days: d.days || 0 };
    g.m = g.kind === 'moon' ? moonBuild(MOON_PALS[g.pal % MOON_PALS.length]) : g.kind === 'duck' ? duckBuild(DUCK_PALS[g.pal % DUCK_PALS.length]) : g.kind === 'ember' ? emberBuild(EMBER_PALS[g.pal % EMBER_PALS.length]) : g.kind === 'gem' ? gemBuild(GEM_PALS[g.pal % GEM_PALS.length]) : g.kind === 'aurora' ? auroraBuild(AURORA_PALS[g.pal % AURORA_PALS.length]) : g.kind === 'zephyra' ? zephyraBuild(ZEPHYRA_PALS[g.pal % ZEPHYRA_PALS.length]) : g.kind === 'luna' ? lunaBuild(LUNA_PALS[g.pal % LUNA_PALS.length]) : g.kind === 'bubble' ? bubbleBuild(BUBBLE_PALS[g.pal % BUBBLE_PALS.length]) : g.kind === 'prism' ? prismBuild(PRISM_PALS[g.pal % PRISM_PALS.length]) : g.kind === 'lotus' ? lotusBuild(LOTUS_PALS[g.pal % LOTUS_PALS.length]) : g.kind === 'axo' ? axoBuild(AXO_PALS[g.pal % AXO_PALS.length]) : g.kind === 'liz' ? lizBuild(LIZ_PALS[g.pal % LIZ_PALS.length]) : g.kind === 'tort' ? tortBuild(TORT_PALS[g.pal % TORT_PALS.length]) : g.kind === 'bison' ? bisBuild(BIS_PALS[g.pal % BIS_PALS.length]) : g.kind === 'ostrich' ? ostBuild(OST_PALS[g.pal % OST_PALS.length]) : g.kind === 'crab' ? crbBuild(CRB_PALS[g.pal % CRB_PALS.length]) : glimBuild(GLIM_PALS[g.pal % GLIM_PALS.length]);
    g.slate = abStallSlates[g.stall];
    var sz = GLIM_STALLS[g.stall];
    g.x = g.kind === 'moon' || g.kind === 'aurora' || g.kind === 'zephyra' || g.kind === 'lotus' ? -3.1 : -3.0; g.z = sz - 0.2; g.tx = g.x; g.tz = g.z; g.face = Math.PI / 2; g.wait = 1 + glimR(g.stall) * 2; g.hop = 0; g.pet = 0; g.flut = glimR(g.stall * 7) * 6;
    if (g.kind === 'moon') moonBuildExtras(g); else if (g.kind === 'duck') duckBuildExtras(g); else if (g.kind === 'ember') emberBuildExtras(g); else if (g.kind === 'gem') gemBuildExtras(g); else if (g.kind === 'aurora') auroraBuildExtras(g); else if (g.kind === 'zephyra') zephyraBuildExtras(g); else if (g.kind === 'luna') lunaBuildExtras(g); else if (g.kind === 'bubble') bubbleBuildExtras(g); else if (g.kind === 'prism') prismBuildExtras(g); else if (g.kind === 'lotus') lotusBuildExtras(g); else if (g.kind === 'axo') axoBuildExtras(g); else if (g.kind === 'liz') lizBuildExtras(g); else if (g.kind === 'tort') tortBuildExtras(g); else if (g.kind === 'bison') bisBuildExtras(g); else if (g.kind === 'ostrich') ostBuildExtras(g); else if (g.kind === 'crab') crbBuildExtras(g); else glimBuildExtras(g);
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
      var laid = [], milk = [], dew = [], quill = [], geode = [], missed = [], missedGem = [], missedMilk = [], wool = [], missedWool = [], pearl = [], missedPearl = [], pbub = [], missedBub = [], pwool = [], missedPw = [], frond = [], missedFrond = [], sscale = [], missedScale = [], sbloom = [], missedBloom = [], dawn = [], missedDawn = [], hearts = [], missedHeart = [], gap = state.day - glimDay;
      if (state.day > glimDay) glimmers.forEach(function (g) {
        if (g.kind === 'ember' || g.kind === 'gem' || g.kind === 'aurora' || g.kind === 'zephyra' || g.kind === 'luna' || g.kind === 'bubble' || g.kind === 'prism' || g.kind === 'lotus' || g.kind === 'axo' || g.kind === 'liz' || g.kind === 'tort' || g.kind === 'bison' || g.kind === 'ostrich' || g.kind === 'crab') {   // an Emberwing, Gemwren, Auroraram, Zephyra, Lunastra, Sirenna, Prismara, Nymphalia or Veilaris counts the days in a row it's been fed and petted
          var gem = g.kind === 'gem', aur = g.kind === 'aurora', zep = g.kind === 'zephyra', lun = g.kind === 'luna', bub = g.kind === 'bubble', pri = g.kind === 'prism', lot = g.kind === 'lotus', axo = g.kind === 'axo', liz = g.kind === 'liz', tort = g.kind === 'tort', bis = g.kind === 'bison', ost = g.kind === 'ostrich', crb = g.kind === 'crab', need = crb ? CRB_DAYS : ost ? OST_DAYS : bis ? BIS_DAYS : tort ? TORT_DAYS : liz ? LIZ_DAYS : axo ? AXO_DAYS : gem ? GEM_DAYS : aur ? AURORA_DAYS : zep ? ZEPHYRA_DAYS : lun ? LUNA_DAYS : bub ? BUBBLE_DAYS : pri ? PRISM_DAYS : lot ? LOTUS_DAYS : EMBER_DAYS;
          if (g.fed && g.petted && gap === 1) g.days = Math.min(need, g.days + 1);
          else { if (g.days) (crb ? missedHeart : ost ? missedDawn : tort ? missedBloom : liz ? missedScale : axo ? missedFrond : gem ? missedGem : aur || lot || bis ? missedMilk : zep ? missedWool : lun ? missedPearl : bub ? missedBub : pri ? missedPw : missed).push(g.name); g.days = 0; }
          if (g.days >= need && !g.egg) { g.egg = true; g.days = 0; (crb ? hearts : ost ? dawn : tort ? sbloom : liz ? sscale : axo ? frond : gem ? geode : aur || lot || bis ? milk : zep ? wool : lun ? pearl : bub ? pbub : pri ? pwool : quill).push(g.name); }
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
      if (pbub.length) news.push(pbub.join(' and ') + (pbub.length > 1 ? ' each blew' : ' blew') + ' a Wishbubble');
      if (pwool.length) news.push(pwool.join(' and ') + (pwool.length > 1 ? ' have fleeces' : ' has a fleece') + ' ready to shear');
      if (sbloom.length) news.push(sbloom.join(' and ') + (sbloom.length > 1 ? ' each have' : ' has') + ' a Starbloom in bloom');
      if (sscale.length) news.push(sscale.join(' and ') + (sscale.length > 1 ? ' each shed' : ' shed') + ' a Sunscale');
      if (frond.length) news.push(frond.join(' and ') + (frond.length > 1 ? ' have Glimmerkelp' : ' has Glimmerkelp') + ' ready to shear');
      if (hearts.length) news.push(hearts.join(' and ') + (hearts.length > 1 ? ' each left' : ' left') + ' a Tidelight Pearl');
      if (dawn.length) news.push(dawn.join(' and ') + (dawn.length > 1 ? ' each laid' : ' laid') + ' a Dawnshell Egg');
      if (geode.length) news.push(geode.join(' and ') + (geode.length > 1 ? ' each laid' : ' laid') + ' a Geode Egg');
      if (missedHeart.length) news.push(missedHeart.join(' and ') + ' missed a day of care, so ' + (missedHeart.length > 1 ? 'their pearl counts start' : 'their pearl count starts') + ' over');
      if (missedDawn.length) news.push(missedDawn.join(' and ') + ' missed a day of care, so ' + (missedDawn.length > 1 ? 'their egg counts start' : 'their egg count starts') + ' over');
      if (missedGem.length) news.push(missedGem.join(' and ') + ' missed a day of care, so ' + (missedGem.length > 1 ? 'their egg counts start' : 'their egg count starts') + ' over');
      if (missedMilk.length) news.push(missedMilk.join(' and ') + ' missed a day of care, so ' + (missedMilk.length > 1 ? 'their milk counts start' : 'their milk count starts') + ' over');
      if (missedWool.length) news.push(missedWool.join(' and ') + ' missed a day of care, so ' + (missedWool.length > 1 ? 'their wool counts start' : 'their wool count starts') + ' over');
      if (missedPearl.length) news.push(missedPearl.join(' and ') + ' missed a day of care, so ' + (missedPearl.length > 1 ? 'their pearl counts start' : 'their pearl count starts') + ' over');
      if (missedBub.length) news.push(missedBub.join(' and ') + ' missed a day of care, so ' + (missedBub.length > 1 ? 'their bubble counts start' : 'their bubble count starts') + ' over');
      if (missedPw.length) news.push(missedPw.join(' and ') + ' missed a day of care, so ' + (missedPw.length > 1 ? 'their wool counts start' : 'their wool count starts') + ' over');
      if (missedBloom.length) news.push(missedBloom.join(' and ') + ' missed a day of care, so ' + (missedBloom.length > 1 ? 'their flower counts start' : 'their flower count starts') + ' over');
      if (missedScale.length) news.push(missedScale.join(' and ') + ' missed a day of care, so ' + (missedScale.length > 1 ? 'their scale counts start' : 'their scale count starts') + ' over');
      if (missedFrond.length) news.push(missedFrond.join(' and ') + ' missed a day of care, so ' + (missedFrond.length > 1 ? 'their kelp counts start' : 'their kelp count starts') + ' over');
      if (missed.length) news.push(missed.join(' and ') + ' missed a day of care, so ' + (missed.length > 1 ? 'their quill counts start' : 'their quill count starts') + ' over');
      if (news.length) setTimeout(function () { showToast('✧ ' + news.join(', and ') + '! Visit them at Fluff & Feather.', 3600); }, 4200);
    }
    if (!inBarn) return;
    var t = state.time;
    glimmers.forEach(function (g) {
      var sz = GLIM_STALLS[g.stall], m = g.m;
      g.wait -= dt;
      var moon = g.kind === 'moon', duck = g.kind === 'duck', ember = g.kind === 'ember', gem = g.kind === 'gem', aur = g.kind === 'aurora', zep = g.kind === 'zephyra', lun = g.kind === 'luna', bub = g.kind === 'bubble', pri = g.kind === 'prism', lot = g.kind === 'lotus', axo = g.kind === 'axo', liz = g.kind === 'liz', tort = g.kind === 'tort', bis = g.kind === 'bison', ost = g.kind === 'ostrich', crb = g.kind === 'crab';
      if (g.wait <= 0 && g.pet <= 0) {
        if (crb) { g.tx = -3.45 + Math.random() * 0.7; g.tz = sz - 0.8 + Math.random() * 1.1; g.wait = 2.5 + Math.random() * 5; }   // (scuttling about, then pausing to look round)
        else if (ost) { g.tx = -3.4 + Math.random() * 0.6; g.tz = sz - 0.7 + Math.random() * 0.95; g.wait = 3 + Math.random() * 6; }   // (strolling about gracefully)
        else if (bis) { g.tx = -3.35 + Math.random() * 0.45; g.tz = sz - 0.55 + Math.random() * 0.7; g.wait = 6 + Math.random() * 9; }   // (a big, calm grazer)
        else if (tort) { g.tx = -3.35 + Math.random() * 0.5; g.tz = sz - 0.6 + Math.random() * 0.8; g.wait = 6 + Math.random() * 8; }   // (slow and unhurried)
        else if (liz) { g.tx = -3.45 + Math.random() * 0.7; g.tz = sz - 0.8 + Math.random() * 1.1; g.wait = 3 + Math.random() * 6; }   // (scurrying, then basking a while)
        else if (axo) { g.tx = -3.4 + Math.random() * 0.6; g.tz = sz - 0.7 + Math.random() * 1.0; g.wait = 3 + Math.random() * 5; }   // (a curious little wanderer)
        else if (lot) { g.tx = -3.35 + Math.random() * 0.5; g.tz = sz - 0.55 + Math.random() * 0.75; g.wait = 5 + Math.random() * 7; }   // (slow and unhurried)
        else if (pri) { g.tx = -3.4 + Math.random() * 0.6; g.tz = sz - 0.7 + Math.random() * 1.0; g.wait = 3 + Math.random() * 5; }
        else if (bub) { g.tx = -3.45 + Math.random() * 0.7; g.tz = sz - 0.8 + Math.random() * 1.1; g.wait = 2.5 + Math.random() * 4; }
        else if (lun) { g.tx = -3.45 + Math.random() * 0.7; g.tz = sz - 0.8 + Math.random() * 1.1; g.wait = 2 + Math.random() * 4; }   // (a busy little explorer)
        else if (zep) { g.tx = -3.35 + Math.random() * 0.5; g.tz = sz - 0.6 + Math.random() * 0.8; g.wait = 5 + Math.random() * 6; }
        else if (aur) { g.tx = -3.35 + Math.random() * 0.5; g.tz = sz - 0.55 + Math.random() * 0.75; g.wait = 4 + Math.random() * 6; }
        else if (gem) { g.tx = -3.5 + Math.random() * 0.85; g.tz = sz - 0.9 + Math.random() * 1.3; g.wait = 1.5 + Math.random() * 4; }   // (quick little dashes, then a pause)
        else if (ember) { g.tx = -3.3 + Math.random() * 0.45; g.tz = sz - 0.6 + Math.random() * 0.9; g.wait = (m.show > 0 ? 6 : 4) + Math.random() * 6; }
        else if (duck) { g.tx = -3.45 + Math.random() * 0.65; g.tz = sz - 0.8 + Math.random() * 1.1; g.wait = 3 + Math.random() * 5; }
        else if (moon) { g.tx = -3.35 + Math.random() * 0.5; g.tz = sz - 0.55 + Math.random() * 0.75; g.wait = 4 + Math.random() * 6; }   // (bigger, so it ambles about less)
        else { g.tx = -3.5 + Math.random() * 0.85; g.tz = sz - 0.9 + Math.random() * 1.3; g.wait = 2.5 + Math.random() * 4; }
      }
      var dx = g.tx - g.x, dz = g.tz - g.z, d = Math.hypot(dx, dz), moving = d > 0.03 && g.pet <= 0 && !(ember && m.show > 0);   // (an Emberwing stands still to show off its fan)
      if (moving) { var stp = Math.min(d, dt * (moon ? 0.16 : duck ? 0.22 : ember ? 0.18 : gem ? 0.5 : aur ? 0.2 : zep ? 0.2 : lun ? 0.32 : bub ? 0.28 : pri ? 0.26 : lot ? 0.15 : axo ? 0.18 : liz ? 0.3 : tort ? 0.1 : bis ? 0.12 : ost ? 0.24 : crb ? 0.26 : 0.35)); g.x += dx / d * stp; g.z += dz / d * stp; g.face = Math.atan2(dx, dz); if (!moon && !duck && !ember && !gem && !aur && !zep && !lun && !bub && !pri && !lot) g.hop += dt * 9; }
      else if (!moon && !duck && !ember && !gem && !aur && !zep && !lun && !bub && !pri && !lot && !axo && !liz && !tort && !bis && !ost && !crb) g.hop = 0;
      var cur = m.root.rotation.y, diff = Math.atan2(Math.sin(g.face - cur), Math.cos(g.face - cur));
      m.root.rotation.y = cur + diff * Math.min(1, dt * (moon ? 2 : duck ? 4 : ember ? 2.5 : gem ? 8 : aur ? 2.5 : zep ? 2 : lun ? 5 : 5));
      if (bis) { m.root.position.set(g.x, 0, g.z); bisAnimate(g, dt, t, moving); return; }
      if (ost) { m.root.position.set(g.x, 0, g.z); ostAnimate(g, dt, t, moving); return; }
      if (crb) { m.root.position.set(g.x, 0, g.z); crbAnimate(g, dt, t, moving); return; }
      if (tort) { m.root.position.set(g.x, 0, g.z); tortAnimate(g, dt, t, moving); return; }
      if (liz) { m.root.position.set(g.x, 0, g.z); lizAnimate(g, dt, t, moving); return; }
      if (axo) { m.root.position.set(g.x, 0, g.z); axoAnimate(g, dt, t, moving); return; }
      if (lot) { m.root.position.set(g.x, 0, g.z); lotusAnimate(g, dt, t, moving); return; }
      if (pri) { m.root.position.set(g.x, 0, g.z); prismAnimate(g, dt, t, moving); return; }
      if (bub) { m.root.position.set(g.x, 0, g.z); bubbleAnimate(g, dt, t, moving); return; }
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
    if (g.kind === 'luna') { lunastraAction(g, wx, wz); return; }
    if (g.kind === 'bubble') { sirennaAction(g, wx, wz); return; }
    if (g.kind === 'prism') { prismaraAction(g, wx, wz); return; }
    if (g.kind === 'lotus') { lotaraAction(g, wx, wz); return; }
    if (g.kind === 'axo') { axoriaAction(g, wx, wz); return; }
    if (g.kind === 'liz') { solarithAction(g, wx, wz); return; }
    if (g.kind === 'bison') { nocturraAction(g, wx, wz); return; }
    if (g.kind === 'ostrich') { celestaraAction(g, wx, wz); return; }
    if (g.kind === 'crab') { iridelleAction(g, wx, wz); return; }
    if (g.kind === 'tort') { grovellaAction(g, wx, wz); return; }
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
    if (g && !barnShopOpen) txt = g.egg ? (g.kind === 'moon' || g.kind === 'aurora' || g.kind === 'lotus' || g.kind === 'bison' ? '🥛 Milk ' + g.name : g.kind === 'zephyra' || g.kind === 'prism' || g.kind === 'axo' ? '✂️ Shear ' + g.name : g.kind === 'luna' ? '⚪ Take the Moonpearl' : g.kind === 'bubble' ? '🫧 Take the Wishbubble' : g.kind === 'liz' ? '☀️ Take the Sunscale' : g.kind === 'tort' ? '🌸 Pick the Starbloom' : g.kind === 'crab' ? '⚪ Take the Tidelight Pearl' : g.kind === 'ember' ? '🪶 Pick up quill' : '🥚 Collect egg') : !g.fed ? '🌾 Feed ' + g.name : !g.petted ? '💜 Pet ' + g.name : '✧ ' + g.name;
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
    glimNameBox.querySelector('.glim-title').textContent = '✧ Name your ' + (kind === 'moon' ? 'Mooncalf' : kind === 'duck' ? 'Puddlewisp' : kind === 'ember' ? 'Emberwing' : kind === 'gem' ? 'Gemwren' : kind === 'aurora' ? 'Auroraram' : kind === 'zephyra' ? 'Zephyra' : kind === 'luna' ? 'Lunastra' : kind === 'bubble' ? 'Sirenna' : kind === 'prism' ? 'Prismara' : kind === 'lotus' ? 'Nymphalia' : kind === 'axo' ? 'Veilaris' : kind === 'liz' ? 'Lumora' : kind === 'tort' ? 'Amarys' : kind === 'bison' ? 'Nyxalia' : kind === 'ostrich' ? 'Celestara' : kind === 'crab' ? 'Iridelle' : 'Glimmerwing');
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
    showToast('✧ ' + name + ' has moved into stall ' + (g.stall + 1) + '! Feed them hay and pet them every day, and ' + (g.kind === 'moon' ? 'you can milk them each morning (with a Milk Pail).' : g.kind === 'duck' ? 'they\'ll lay a Dewdrop Egg each morning.' : g.kind === 'ember' ? 'after every four days in a row they\'ll leave you a Cinder Quill.' : g.kind === 'gem' ? 'after every four days in a row they\'ll lay a Geode Egg.' : g.kind === 'aurora' ? 'after every two days in a row you can milk them for Aurora Milk (with a Milk Pail).' : g.kind === 'zephyra' ? 'after every four days in a row you can shear them for Cloud Wool (with Shears).' : g.kind === 'luna' ? 'after every two days in a row they\'ll find you a Moonpearl.' : g.kind === 'bubble' ? 'after every three days in a row they\'ll blow you a Wishbubble.' : g.kind === 'prism' ? 'after every two days in a row you can shear them for Prismsilk (with Shears).' : g.kind === 'lotus' ? 'after every two days in a row you can milk them for Moonlily Milk (with a Milk Pail).' : g.kind === 'axo' ? 'after every three days in a row you can shear them for Glimmerkelp (with Shears).' : g.kind === 'liz' ? 'after every two days in a row they\'ll shed a Sunscale for you.' : g.kind === 'tort' ? 'after every three days in a row a Starbloom will open in their garden for you to pick.' : g.kind === 'bison' ? 'after every three days in a row you can milk them for Opaline Milk (with a Milk Pail).' : g.kind === 'ostrich' ? 'after every three days in a row they\'ll lay a Dawnshell Egg.' : g.kind === 'crab' ? 'after every six days in a row they\'ll leave you a Tidelight Pearl.' : 'they\'ll lay a Glimmer Egg each morning.'), 4200);
    if (typeof renderBarnShop === 'function') renderBarnShop();
  }
  function adoptGlimmerwing(kind) {                                  // kind: 'glim' (a Glimmerwing) or 'moon' (a Mooncalf)
    var stall = glimFreeStall(), cost = kind === 'moon' ? MOON_COST : kind === 'duck' ? DUCK_COST : kind === 'ember' ? EMBER_COST : kind === 'gem' ? GEM_COST : kind === 'aurora' ? AURORA_COST : kind === 'zephyra' ? ZEPHYRA_COST : kind === 'luna' ? LUNA_COST : kind === 'bubble' ? BUBBLE_COST : kind === 'prism' ? PRISM_COST : kind === 'lotus' ? LOTUS_COST : kind === 'axo' ? AXO_COST : kind === 'liz' ? LIZ_COST : kind === 'tort' ? TORT_COST : kind === 'bison' ? BIS_COST : kind === 'ostrich' ? OST_COST : kind === 'crab' ? CRB_COST : GLIM_COST;
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
    [['Glimmerwings \u00b7 600 \u2605', 'lay glowing Glimmer Eggs', 'rgba(214,190,255,A)'], ['Puddlewisps \u00b7 1,000 \u2605', 'lay glassy Dewdrop Eggs', 'rgba(170,215,255,A)'],
      ['Gemwrens \u00b7 5,000 \u2605', 'lay a Geode Egg every 4 days', 'rgba(220,180,255,A)'], ['Emberwings \u00b7 15,000 \u2605', 'leave a Cinder Quill every 4 days', 'rgba(255,170,110,A)'], ['Lunastras \u00b7 30,000 \u2605', 'find a Moonpearl every 2 days', 'rgba(190,210,255,A)'], ['Sirennas \u00b7 10,000 \u2605', 'blow a Wishbubble every 3 days', 'rgba(150,240,230,A)'], ['Prismaras \u00b7 2,500 \u2605', 'give Prismsilk every 2 days', 'rgba(255,200,240,A)'], ['Nymphalias \u00b7 13,000 \u2605', 'give Moonlily Milk every 2 days', 'rgba(220,190,255,A)'],
      ['Auroraram \u00b7 8,000 \u2605', 'give Aurora Milk every 2 days', 'rgba(140,255,210,A)'], ['Zephyras \u00b7 25,000 \u2605', 'give Cloud Wool every 4 days', 'rgba(255,200,170,A)'], ['Mooncalves \u00b7 2,000 \u2605', 'give shimmering Moonmilk', 'rgba(190,215,255,A)'], ['Veilaris \u00b7 18,000 \u2605', 'give Glimmerkelp every 3 days', 'rgba(255,190,220,A)'], ['Lumoras \u00b7 8,000 \u2605', 'shed a Sunscale every 2 days', 'rgba(255,200,130,A)'], ['Amarys \u00b7 10,000 \u2605', 'grow a Starbloom every 3 days', 'rgba(170,240,200,A)'], ['Nyxalias \u00b7 32,000 \u2605', 'give Opaline Milk every 3 days', 'rgba(200,190,255,A)'], ['Celestaras \u00b7 28,000 \u2605', 'lay a Dawnshell Egg every 3 days', 'rgba(255,190,210,A)'], ['Iridelles \u00b7 740 \u2605', 'leave a Tidelight Pearl every 6 days', 'rgba(160,230,255,A)']].forEach(function (an, k) {
      chalk(an[0], w / 2 + 80, 98 + k * 17.6, 12, an[2], false);
      chalk(an[1], w / 2 + 80, 107 + k * 17.6, 7.5, 'rgba(240,240,230,A)', true);
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
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + GLIM_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="glim-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic duck-pic"></div><div class="shop-text"><b>Puddlewisp</b><span>A plump little pond creature with night-blue feathers that ripple like moonlight on water, big shining eyes, star-tipped plumes and glowing webbed feet. Feed it hay and pet it every day, and it lays a Dewdrop Egg each morning. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + DUCK_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="duck-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic gem-pic"></div><div class="shop-text"><b>Gemwren</b><span>A plump little ground bird with feathers speckled like the inside of a geode, glittering crystal feathers, a dark bib edged in white and a nodding plume tipped with a glowing gem. Feed it hay and pet it every day for four days in a row, and the next morning it lays a Geode Egg that sparkles with crystals inside. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + GEM_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="gem-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic ember-pic"></div><div class="shop-text"><b>Emberwing</b><span>A proud, fiery bird with sunset-coloured feathers, a crown of little flickering flames and a long train of flame-shaped feathers that it raises into a blazing fan. Feed it hay and pet it every day for four days in a row, and the next morning it leaves a warm Cinder Quill in its straw. Miss a day and the count starts over. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + EMBER_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="ember-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic luna-pic"></div><div class="shop-text"><b>Lunastra</b><span>A little plush spirit of the moonlit night, in soft moon-white fur that deepens into a starry sky over its back, with a night-sky mask full of glowing stars, huge galaxy eyes, tall ears tipped with starlight, a crescent moon on its brow, a big curling tail banded with stars and a tiny moon of its own orbiting round it. Feed it hay and pet it every day for two days in a row, and the next morning it leaves you a Moonpearl it found in the night. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + LUNA_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="luna-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic bubble-pic"></div><div class="shop-text"><b>Sirenna</b><span>A chubby little sea spirit in soft seafoam fur dappled with bubble spots, with a coral snout, huge ocean eyes, floppy ears of shimmering fin, a scallop shell tucked behind one ear, pearly hooves and a corkscrew tail tipped with coral. Bubbles always drift up off it. Feed it hay and pet it every day for three days in a row, and the next morning it blows you a Wishbubble. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + BUBBLE_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="bubble-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic aurora-pic"></div><div class="shop-text"><b>Auroraram</b><span>A graceful creature with a long, silky night-blue coat that ripples with the colours of the northern lights, spiralling horns of clear ice, a silky beard and glowing hooves. Feed it hay and pet it every day for two days in a row, and the next morning you can milk it for Aurora Milk (you\'ll need a Milk Pail). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + AURORA_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="aurora-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic prism-pic"></div><div class="shop-text"><b>Prismara</b><span>A gentle creature of rainbow light, with a round body of curly fleece that shimmers through every colour of the rainbow, a soft pale face with big gentle eyes, floppy ears, a curly topknot, little spiralling horns of clear crystal and crystal hooves. Feed it hay and pet it every day for two days in a row, and the next morning you can shear it for Prismsilk (you\'ll need Shears). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + PRISM_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="prism-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic zephyra-pic"></div><div class="shop-text"><b>Zephyra</b><span>A little spirit of the gentle west wind, made of soft, billowing cloud blushed with the pinks and golds of sunrise, with tall ears, huge sparkly eyes, a glowing sun-gem, little feathered wings and a silk scarf streaming in the breeze. It floats just above the ground on cloud-puff feet. Feed it hay and pet it every day for four days in a row, and the next morning you can shear its cloud for Cloud Wool (you\'ll need Shears). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + ZEPHYRA_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="zephyra-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic lotus-pic"></div><div class="shop-text"><b>Nymphalia</b><span>A big, gentle creature of the lily pond, with a round body of soft lilac plush dappled with glowing pond-light spots, lotus flowers blooming on lily pads along its back, a wide soft muzzle, big sweet eyes and tiny wiggly ears. Feed it hay and pet it every day for two days in a row, and the next morning you can milk it for Moonlily Milk (you\'ll need a Milk Pail). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + LOTUS_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="lotus-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic axo-pic"></div><div class="shop-text"><b>Veilaris</b><span>A little water spirit of the moonlit spring, with a soft round body of rosy plush held up on slender legs, glowing star-freckles and a constellation over its back, big shining eyes, a moonstone on its brow, long finned ears, branching antlers of glowing coral, a mane of flowing ribbons of light, two pairs of wings of light and a long tail trailing veils of light. Feed it hay and pet it every day for three days in a row, and the next morning you can shear the glowing Glimmerkelp that has grown on its back (you\'ll need Shears). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + AXO_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="axo-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic liz-pic"></div><div class="shop-text"><b>Lumora</b><span>A little sun-drake that loves to bask, in soft, velvety scales banded with chevrons and glowing sun-spots, with big golden gecko eyes, swept-back horns of clear citrine, a sunrise frill of glowing petals round its neck, crystal spines down its back, gliding membranes of light along its sides and a long tail curled round a glowing sun-gem. Feed it hay and pet it every day for two days in a row, and the next morning it sheds a Sunscale for you. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + LIZ_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="liz-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic tort-pic"></div><div class="shop-text"><b>Amarys</b><span>A gentle, slow little wanderer in soft plush, carrying a whole tiny garden on its back: a high shell like polished opal rimmed in gold, topped with soft moss, glowing mushrooms, tiny flowers, a cluster of crystals and a little tree hung with glowing fruit, with fireflies drifting over it. It has big shining eyes and two leafy sprouts on its head. Feed it hay and pet it every day for three days in a row, and the next morning a Starbloom opens in its garden for you to pick. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + TORT_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="tort-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic bis-pic"></div><div class="shop-text"><b>Nyxalia</b><span>A big, gentle grazer made of the night sky, in deep soft plush. A shaggy starry mane drifts over its hump like a slow cloud, twinkling with tiny stars, and faint constellations shimmer along its flanks. It has a pair of moonstone horns banded in gold, feathered fetlocks and pearly cloven hooves. Feed it hay and pet it every day for three days in a row, and the next morning you can milk it for glittering Opaline Milk (bring a Milk Pail). It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + BIS_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="bis-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic ost-pic"></div><div class="shop-text"><b>Celestara</b><span>A graceful dawn-bird in soft plumage blushing with the colours of sunrise, traced with glowing golden filigree. It has a long, swan-like neck, big gentle eyes lined in gold, a slender pearly beak, a crest of glassy plumes tipped with little lights and a halo of turning runes floating behind its head. Its wings are layered with feathers edged in light, and its long, sweeping train shines with eye-spots and crystals and trails ribbons of aurora, while little crystals drift round it. Feed it hay and pet it every day for three days in a row, and the next morning it lays a Dawnshell Egg for you. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + OST_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="ost-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic crb-pic"></div><div class="shop-text"><b>Iridelle</b><span>A little tide-spirit from the moonlit shallows, with a wide, domed shell of living opal set with tiny pearls and traced with glowing runes, and a garden of crystals, coral and swaying anemones growing on its back. It has big shining eyes on slender stalks, delicate crystal pincers that each cradle a glowing orb, six slender legs of pearl on which it scuttles sideways, and veils of iridescent light trailing behind it. Bubbles drift up from it, a pearl circles over it, and tidepool ripples spread wherever it stands. Feed it hay and pet it every day for six days in a row, and the next morning it leaves you a shimmering Tidelight Pearl. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + CRB_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="crb-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic moon-pic"></div><div class="shop-text"><b>Mooncalf</b><span>A gentle creature with a pearly coat whose spots are patches of starry night sky, crescent-moon horns and star-bright hooves. Feed it hay and pet it every day, and the next morning you can milk it for Moonmilk. It lives in a stall here.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + MOON_COST.toLocaleString('en-US') + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="moon-adopt">Adopt</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic pail-pic"></div><div class="shop-text"><b>Milk Pail</b><span>You need one to milk your Mooncalves, Auroraram and Nymphalias. It never wears out.</span>' +
    '<span class="shop-price"><img class="coin-icon" alt=""> ' + PAIL_COST + '</span></div></div>' +
    '<div class="shop-buy"><button type="button" class="pail-buy">Buy</button></div>' +
    '<div class="shop-item" style="margin-top:16px"><div class="slot shop-pic shears-pic"></div><div class="shop-text"><b>Shears</b><span>You need them to shear your Zephyras and Prismaras when their wool is ready, and the Glimmerkelp off your Veilaris. They never wear out.</span>' +
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
  var bubblePic = document.createElement('img'); bubblePic.src = bubbleShopIcon; bubblePic.alt = ''; bubblePic.style.width = '96%'; bubblePic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.bubble-pic').appendChild(bubblePic);
  var bubbleAdoptBtn = barnShopBox.querySelector('.bubble-adopt');
  bubbleAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('bubble'); });
  var prismPic = document.createElement('img'); prismPic.src = prismShopIcon; prismPic.alt = ''; prismPic.style.width = '96%'; prismPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.prism-pic').appendChild(prismPic);
  var prismAdoptBtn = barnShopBox.querySelector('.prism-adopt');
  prismAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('prism'); });
  var lotusPic = document.createElement('img'); lotusPic.src = lotusShopIcon; lotusPic.alt = ''; lotusPic.style.width = '96%'; lotusPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.lotus-pic').appendChild(lotusPic);
  var lotusAdoptBtn = barnShopBox.querySelector('.lotus-adopt');
  lotusAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('lotus'); });
  var axoPic = document.createElement('img'); axoPic.src = axoShopIcon; axoPic.alt = ''; axoPic.style.width = '96%'; axoPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.axo-pic').appendChild(axoPic);
  var axoAdoptBtn = barnShopBox.querySelector('.axo-adopt');
  axoAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('axo'); });
  var lizPic = document.createElement('img'); lizPic.src = lizShopIcon; lizPic.alt = ''; lizPic.style.width = '96%'; lizPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.liz-pic').appendChild(lizPic);
  var lizAdoptBtn = barnShopBox.querySelector('.liz-adopt');
  lizAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('liz'); });
  var tortPic = document.createElement('img'); tortPic.src = tortShopIcon; tortPic.alt = ''; tortPic.style.width = '96%'; tortPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.tort-pic').appendChild(tortPic);
  var tortAdoptBtn = barnShopBox.querySelector('.tort-adopt');
  tortAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('tort'); });
  var bisPic = document.createElement('img'); bisPic.src = bisShopIcon; bisPic.alt = ''; bisPic.style.width = '96%'; bisPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.bis-pic').appendChild(bisPic);
  var bisAdoptBtn = barnShopBox.querySelector('.bis-adopt');
  bisAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('bison'); });
  var ostPic = document.createElement('img'); ostPic.src = ostShopIcon; ostPic.alt = ''; ostPic.style.width = '96%'; ostPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.ost-pic').appendChild(ostPic);
  var ostAdoptBtn = barnShopBox.querySelector('.ost-adopt');
  ostAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('ostrich'); });
  var crbPic = document.createElement('img'); crbPic.src = crbShopIcon; crbPic.alt = ''; crbPic.style.width = '96%'; crbPic.style.pointerEvents = 'none';
  barnShopBox.querySelector('.crb-pic').appendChild(crbPic);
  var crbAdoptBtn = barnShopBox.querySelector('.crb-adopt');
  crbAdoptBtn.addEventListener('click', function () { adoptGlimmerwing('crab'); });
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
    glimAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + GLIM_COST.toLocaleString('en-US');
    glimAdoptBtn.disabled = full || state.coins < GLIM_COST;
    duckAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + DUCK_COST.toLocaleString('en-US');
    duckAdoptBtn.disabled = full || state.coins < DUCK_COST;
    emberAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + EMBER_COST.toLocaleString('en-US');
    emberAdoptBtn.disabled = full || state.coins < EMBER_COST;
    gemAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + GEM_COST.toLocaleString('en-US');
    gemAdoptBtn.disabled = full || state.coins < GEM_COST;
    auroraAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + AURORA_COST.toLocaleString('en-US');
    auroraAdoptBtn.disabled = full || state.coins < AURORA_COST;
    zephyraAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + ZEPHYRA_COST.toLocaleString('en-US');
    zephyraAdoptBtn.disabled = full || state.coins < ZEPHYRA_COST;
    lunaAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + LUNA_COST.toLocaleString('en-US');
    lunaAdoptBtn.disabled = full || state.coins < LUNA_COST;
    bubbleAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + BUBBLE_COST.toLocaleString('en-US');
    bubbleAdoptBtn.disabled = full || state.coins < BUBBLE_COST;
    prismAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + PRISM_COST.toLocaleString('en-US');
    prismAdoptBtn.disabled = full || state.coins < PRISM_COST;
    lotusAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + LOTUS_COST.toLocaleString('en-US');
    lotusAdoptBtn.disabled = full || state.coins < LOTUS_COST;
    axoAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + AXO_COST.toLocaleString('en-US');
    axoAdoptBtn.disabled = full || state.coins < AXO_COST;
    lizAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + LIZ_COST.toLocaleString('en-US');
    lizAdoptBtn.disabled = full || state.coins < LIZ_COST;
    tortAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + TORT_COST.toLocaleString('en-US');
    tortAdoptBtn.disabled = full || state.coins < TORT_COST;
    bisAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + BIS_COST.toLocaleString('en-US');
    bisAdoptBtn.disabled = full || state.coins < BIS_COST;
    ostAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + OST_COST.toLocaleString('en-US');
    ostAdoptBtn.disabled = full || state.coins < OST_COST;
    crbAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + CRB_COST.toLocaleString('en-US');
    crbAdoptBtn.disabled = full || state.coins < CRB_COST;
    moonAdoptBtn.innerHTML = full ? 'All stalls are full' : 'Adopt · <img class="coin-icon" alt=""> ' + MOON_COST.toLocaleString('en-US');
    moonAdoptBtn.disabled = full || state.coins < MOON_COST;
    var gotPail = hasPail();
    pailBtn.innerHTML = gotPail ? 'You have one ✓' : 'Buy · <img class="coin-icon" alt=""> ' + PAIL_COST;
    pailBtn.disabled = gotPail || state.coins < PAIL_COST;
    var gotShears = hasShears();
    shearsBtn.innerHTML = gotShears ? 'You have them ✓' : 'Buy · <img class="coin-icon" alt=""> ' + SHEARS_COST;
    shearsBtn.disabled = gotShears || state.coins < SHEARS_COST;
    glimStallsNote.textContent = glimmers.length ? 'Your animals: ' + glimmers.map(function (g) { return g.name + (g.kind === 'moon' ? ' (Mooncalf)' : g.kind === 'duck' ? ' (Puddlewisp)' : g.kind === 'ember' ? ' (Emberwing)' : g.kind === 'gem' ? ' (Gemwren)' : g.kind === 'aurora' ? ' (Auroraram)' : g.kind === 'zephyra' ? ' (Zephyra)' : g.kind === 'luna' ? ' (Lunastra)' : g.kind === 'bubble' ? ' (Sirenna)' : g.kind === 'prism' ? ' (Prismara)' : g.kind === 'lotus' ? ' (Nymphalia)' : g.kind === 'axo' ? ' (Veilaris)' : g.kind === 'liz' ? ' (Lumora)' : g.kind === 'tort' ? ' (Amarys)' : g.kind === 'bison' ? ' (Nyxalia)' : g.kind === 'ostrich' ? ' (Celestara)' : g.kind === 'crab' ? ' (Iridelle)' : ' (Glimmerwing)'); }).join(', ') + ' · ' + glimmers.length + ' of 3 stalls' : 'There are 3 empty stalls waiting for your animals.';
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

  // ---------- Dressing up the shop menus ----------
  // Every thing for sale goes on its own card (its picture, name, description and price, with its buttons beneath);
  // long descriptions fold to three lines with a "Read more" to open them; and at Fluff & Feather the supplies (hay,
  // the Milk Pail and the Shears) come first, under their own heading, then the animals under theirs
  function shopCards(box) {
    Array.prototype.slice.call(box.querySelectorAll('.shop-item')).forEach(function (it) {
      var card = document.createElement('div'); card.className = 'shop-card';
      it.parentNode.insertBefore(card, it); card.appendChild(it);
      var buy = card.nextElementSibling; if (buy && buy.classList.contains('shop-buy')) card.appendChild(buy);
      var desc = it.querySelector('.shop-text > span:not(.shop-price)');
      if (desc) {
        desc.classList.add('shop-desc');
        if (desc.textContent.length > 150) {
          card.classList.add('clamp');
          var more = document.createElement('button'); more.type = 'button'; more.className = 'shop-more'; more.textContent = 'Read more ▾';
          desc.parentNode.insertBefore(more, desc.nextSibling);
          more.addEventListener('click', function (e) { e.stopPropagation(); var open = card.classList.toggle('clamp'); more.textContent = open ? 'Read more ▾' : 'Show less ▴'; });
        }
      }
    });
  }
  function shopHeading(text) { var h = document.createElement('div'); h.className = 'shop-section'; h.textContent = text; return h; }
  shopCards(shopBox); shopCards(barnShopBox);
  (function () {
    var cards = barnShopBox.querySelectorAll('.shop-card'), hay = cards[0], after = hay;
    [barnShopBox.querySelector('.pail-buy'), barnShopBox.querySelector('.shears-buy')].forEach(function (b) { var c = b && b.closest('.shop-card'); if (c) { after.parentNode.insertBefore(c, after.nextSibling); after = c; } });
    hay.parentNode.insertBefore(shopHeading('Feed & supplies'), hay);
    after.parentNode.insertBefore(shopHeading('Magical creatures'), after.nextSibling);
  })();
  shopBox.querySelector('.shop-card').parentNode.insertBefore(shopHeading('Seeds'), shopBox.querySelector('.shop-card'));

  // ---------- The shops, laid out like the shipping bin ----------
  // Two panels side by side: on the left, everything for sale as a grid of little tiles (its picture, name and price,
  // greyed out when you can't buy it), grouped under headings; on the right, a warm crate-coloured panel showing the
  // tile you've picked, with its full description and its buy buttons. On a narrow screen the panels stack
  function shopCatalogue(box) {
    var cards = Array.prototype.slice.call(box.querySelectorAll('.shop-card')); if (!cards.length) return function () {};
    var first = box.querySelector('.shop-section') || cards[0];
    var cols = document.createElement('div'); cols.className = 'ship-cols shop-cols';
    var left = document.createElement('div'), right = document.createElement('div'); left.className = 'shop-list'; right.className = 'shop-detail';
    left.innerHTML = '<h4>For sale</h4>'; right.innerHTML = '<h4>Take a look</h4>';
    var grid = document.createElement('div'); grid.className = 'shop-tiles'; left.appendChild(grid);
    first.parentNode.insertBefore(cols, first); cols.appendChild(left); cols.appendChild(right);
    var tiles = [];
    function pick(k, scroll) {
      tiles.forEach(function (t, j) { t.el.classList.toggle('sel', j === k); t.card.classList.toggle('on', j === k); });
      right.scrollTop = 0;
      if (scroll && window.innerWidth <= 560) right.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    Array.prototype.slice.call(box.querySelectorAll('.shop-section, .shop-card')).forEach(function (el) {
      if (el.classList.contains('shop-section')) { grid.appendChild(el); return; }   // (the headings sit across the grid)
      right.appendChild(el);
      var t = document.createElement('button'); t.type = 'button'; t.className = 'shop-tile';
      var pic = el.querySelector('.shop-pic').firstElementChild, name = el.querySelector('.shop-text b'), price = el.querySelector('.shop-price');
      var tp = document.createElement('span'); tp.className = 'shop-tile-pic'; if (pic) tp.appendChild(pic.cloneNode(true)); t.appendChild(tp);
      var tn = document.createElement('span'); tn.className = 'shop-tile-name'; tn.textContent = name ? name.textContent : ''; t.appendChild(tn);
      var tc = document.createElement('span'); tc.className = 'shop-tile-price'; tc.innerHTML = price ? price.innerHTML : ''; t.appendChild(tc);
      var k = tiles.length; t.addEventListener('click', function (e) { e.stopPropagation(); pick(k, true); });
      grid.appendChild(t); tiles.push({ el: t, card: el });
    });
    pick(0);
    return function () {                                              // (after each re-render: grey out what you can't buy)
      tiles.forEach(function (t) { var bs = t.card.querySelectorAll('.shop-buy button'), can = false; for (var i = 0; i < bs.length; i++) if (!bs[i].disabled) can = true; t.el.classList.toggle('cant', !can); });
      paintCoinIcons(box);
    };
  }
  var shopTilesSync = shopCatalogue(shopBox), barnTilesSync = shopCatalogue(barnShopBox);
  var shopBaseRender = renderShop, barnBaseRender = renderBarnShop;
  renderShop = function () { shopBaseRender(); shopTilesSync(); };
  renderBarnShop = function () { barnBaseRender(); barnTilesSync(); };
  shopBox.classList.add('shop-wide'); barnShopBox.classList.add('shop-wide');

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

  // ---------- You: a witch in black, from your own picture ----------
  // She's your picture itself, cut out from its black background and standing in the world, always turning to face
  // you (like a paper cut-out, the way some storybook games do it). Below it, her long skirt, the rest of her right
  // arm and her hand are drawn in the same style and colours, and there's a matching back view for when she walks
  // away from you, and a blink, with her own lid colours. Dark mist curls round her
  var wl = (function () {
    for (var i = 0; i < 7; i++) body.children[i].visible = false;     // (the old simple robe, head, hat and eyes)
    M.skin.color.set(0xeed6c4); M.robe.color.set(0x2a2430);            // (your tool arm: a pale hand in a dark sleeve)
    var W = 600, Hh = 1450, S = 1.5, OFF = 3000, SKIN = '#eecdb4', SKINK = 'rgba(96,54,42,0.85)', seed = 1;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function P(g, pts, close) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) { var p = pts[i]; if (p.length === 4) g.quadraticCurveTo(p[0], p[1], p[2], p[3]); else if (p.length === 6) g.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]); else g.lineTo(p[0], p[1]); } if (close) g.closePath(); }
    function line(g, pts) { g.beginPath(); pts.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); }
    function soft(g, x, y, rx, ry, col, a) { g.save(); g.translate(x, y); g.scale(rx, ry); var gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); gr.addColorStop(0, 'rgba(' + col + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + col + ',0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, Math.PI * 2); g.fill(); g.restore(); }
    // paint a shape softly blurred, like an airbrush (drawn off to one side, with only its blurred shadow brought back)
    function blurred(g, blur, col, draw) { g.save(); g.shadowColor = col; g.shadowBlur = blur * S; g.shadowOffsetX = OFF * S; g.translate(-OFF, 0); g.fillStyle = g.strokeStyle = '#000'; g.lineCap = g.lineJoin = 'round'; draw(g); g.restore(); }
    // a smooth curve through points, and a tapering tube along one (for arms, fingers and the like)
    function spline(pts, per) {
      var out = [];
      for (var i = 0; i < pts.length - 1; i++) {
        var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
        for (var k = 0; k < per; k++) { var t = k / per, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(function (d) { return 0.5 * (2 * p1[d] + (p2[d] - p0[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (3 * p1[d] - p0[d] - 3 * p2[d] + p3[d]) * t3); })); }
      }
      out.push(pts[pts.length - 1].slice()); return out;
    }
    function tube(pts, ws, per) {
      var c = spline(pts, per || 8), n = c.length, L = [], R = [];
      for (var i = 0; i < n; i++) {
        var a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, f = i / (n - 1) * (ws.length - 1), j = Math.min(ws.length - 2, Math.floor(f)), w = (ws[j] + (ws[j + 1] - ws[j]) * (f - j)) / 2;
        L.push([c[i][0] - dy / l * w, c[i][1] + dx / l * w]); R.push([c[i][0] + dy / l * w, c[i][1] - dx / l * w]);
      }
      return { c: c, L: L, R: R };
    }
    function tubePath(g, T) { g.beginPath(); T.L.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); for (var i = T.R.length - 1; i >= 0; i--) g.lineTo(T.R[i][0], T.R[i][1]); g.closePath(); }
    function inset(T, side, f) { return T.c.map(function (p, i) { var e = T[side][i]; return [p[0] + (e[0] - p[0]) * f, p[1] + (e[1] - p[1]) * f]; }); }
    // skin, softly rounded: light on the side toward the light (her upper left), shade on the other
    function skinTube(g, T, light, inked) {
      tubePath(g, T); g.fillStyle = SKIN; g.fill();
      g.save(); tubePath(g, T); g.clip();
      blurred(g, 7, 'rgba(176,112,90,0.6)', function (g) { g.lineWidth = 7; line(g, inset(T, 'R', 1.05)); g.stroke(); });
      blurred(g, 4, 'rgba(176,124,110,0.35)', function (g) { g.lineWidth = 3; line(g, inset(T, 'L', 1.02)); g.stroke(); });
      blurred(g, 5, 'rgba(255,246,238,' + (light || 0.6) + ')', function (g) { g.lineWidth = 3.5; line(g, inset(T, 'L', 0.4)); g.stroke(); });
      g.restore();
      if (inked) { line(g, T.L); g.strokeStyle = SKINK; g.lineWidth = 1; g.stroke(); line(g, T.R); g.stroke(); }   // (a fine line along each side, as in your picture)
    }
    function nail(g, T) { var n = T.c.length, a = T.c[n - 4], b = T.c[n - 1], w = Math.hypot(T.L[n - 1][0] - T.R[n - 1][0], T.L[n - 1][1] - T.R[n - 1][1]) * 0.5 + 0.6, ang = Math.atan2(b[1] - a[1], b[0] - a[0]); g.save(); g.translate(b[0], b[1]); g.rotate(ang); g.fillStyle = '#0d0b10'; g.beginPath(); g.moveTo(-8, -w); g.quadraticCurveTo(4, -w, 6.5, 0); g.quadraticCurveTo(4, w, -8, w); g.closePath(); g.fill(); g.fillStyle = 'rgba(190,190,215,0.6)'; g.beginPath(); g.ellipse(-3.5, -w * 0.35, 2.4, 0.6, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    function finger(g, pts, w0, w1) { var T = tube(pts, [w0, (w0 + w1) / 2, w1], 6); skinTube(g, T, 0.5, true); g.save(); tubePath(g, T); g.clip(); [0.42, 0.72].forEach(function (f) { var i = Math.round(f * (T.c.length - 1)); blurred(g, 1.5, 'rgba(150,100,90,0.45)', function (g) { g.lineWidth = 0.9; line(g, [T.L[i], T.R[i]]); g.stroke(); }); }); g.restore(); nail(g, T); }
    // her hair, drawn strand by strand: each lock runs between two edges, and every strand inside it follows the same
    // tight, crimped waves, catching a cool blue-grey sheen where each wave turns toward the light, with fine dark
    // lines drawn along its edges and through it, as in your picture
    function hairLock(g, o, inn, sp) {
      var per = sp.per || 24, total = (o.length - 1) * per;
      function path(u, jit, ampMul) {
        var c = spline(o.map(function (p, i) { var q = inn[i]; return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]; }), per), ph = [];
        for (var k = 0; k < c.length; k++) { var t = k / total, r = Math.min(1, Math.max(0, (t - sp.from) / 0.15)), a = 2 * Math.PI * sp.waves * t + sp.ph + u * (sp.skew || 2.6) + jit; c[k][0] += Math.sin(a) * sp.amp * r * ampMul; ph.push(a); }
        return { c: c, ph: ph };
      }
      var A = path(0, 0, 1), B = path(1, 0, 1), cut = Math.round(total * 0.9);
      function sil(g) { g.beginPath(); for (var k = 0; k <= cut; k++) k ? g.lineTo(A.c[k][0], A.c[k][1]) : g.moveTo(A.c[0][0], A.c[0][1]); for (k = cut; k >= 0; k--) g.lineTo(B.c[k][0], B.c[k][1]); g.closePath(); }
      if (sp.shadow) { g.save(); g.globalCompositeOperation = 'source-atop'; blurred(g, 9, 'rgba(0,0,0,' + sp.shadow + ')', function (g) { g.translate(3, 6); sil(g); g.fill(); }); g.restore(); }   // (the soft shadow it casts)
      sil(g); g.fillStyle = '#0b0b10'; g.fill();
      var lv = []; for (var i = 0; i < 17; i++) lv.push([]);
      for (var s = 0; s < sp.n * 1.4; s++) {
        var u = rnd(), dark = rnd() < 0.36, sn = rnd() * 0.3, edge = Math.min(u, 1 - u), st = path(u, (rnd() - 0.5) * 1.1, 1 + (u < 0.05 ? rnd() * 0.7 : 0) + (rnd() - 0.5) * 0.2), ox = (rnd() - 0.5) * 1.6, end = Math.round(total * (0.84 + rnd() * 0.16)), cur = -1, pl = null;
        for (var k = 0; k < end; k++) {
          var t = k / total, wv = Math.pow(0.5 + 0.5 * Math.cos(st.ph[k] - (sp.la || 0.8)), 5) * Math.min(1, Math.max(0.35, (t - sp.from) / 0.15 + 0.35)),
            sh = sp.sheen ? Math.exp(-Math.pow((t - sp.sheen[0]) / sp.sheen[1], 2)) * sp.sheen[2] : 0,
            vol = 0.4 + 0.6 * Math.sin(Math.PI * Math.min(0.95, Math.max(0.05, u))),
            L = dark ? 0 : Math.min(16, Math.floor(((wv * 0.75 + sh * 0.7) * vol * (sp.light || 1) + sn) * 16));
          if (L !== cur) { pl = [[st.c[k][0] + ox, st.c[k][1]]]; lv[L].push(pl); cur = L; }
          pl.push([st.c[k + 1][0] + ox, st.c[k + 1][1]]);
        }
      }
      g.lineCap = g.lineJoin = 'round';
      lv.forEach(function (pls, L) {
        var f = Math.pow(L / 16, 1.2); g.strokeStyle = 'rgba(' + Math.round(10 + f * 84) + ',' + Math.round(10 + f * 94) + ',' + Math.round(15 + f * 122) + ',' + (0.5 + f * 0.35) + ')'; g.lineWidth = L < 5 ? 1 : 0.7;
        g.beginPath(); pls.forEach(function (pl) { pl.forEach(function (p, i) { i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); }); }); g.stroke();
      });
      g.strokeStyle = 'rgba(4,4,8,0.9)'; g.lineWidth = 1.3;            // (the linework: along its edges, and a few lines through it)
      [A, B].forEach(function (E) { g.beginPath(); for (var k = 0; k <= cut; k++) k ? g.lineTo(E.c[k][0], E.c[k][1]) : g.moveTo(E.c[0][0], E.c[0][1]); g.stroke(); });
      g.lineWidth = 1;
      for (var q = 0; q < (sp.inkN || 4); q++) { var iu = 0.15 + rnd() * 0.7, I = path(iu, 0, 1), i0 = Math.round(total * (0.1 + rnd() * 0.3)), i1 = Math.round(total * (0.6 + rnd() * 0.3)); g.beginPath(); for (var k2 = i0; k2 <= i1; k2++) k2 > i0 ? g.lineTo(I.c[k2][0], I.c[k2][1]) : g.moveTo(I.c[k2][0], I.c[k2][1]); g.stroke(); }
    }
    var CRIMP = { per: 44, amp: 6, waves: 15, from: 0.32, skew: 1.6, sheen: [0.1, 0.06, 0.6], la: 0.8 };
    function crimp(o) { var r = {}; for (var k in CRIMP) r[k] = CRIMP[k]; for (k in o) r[k] = o[k]; return r; }
    function ink(g, w, a) { g.strokeStyle = 'rgba(16,12,18,' + (a || 0.92) + ')'; g.lineWidth = w || 1.4; g.lineCap = g.lineJoin = 'round'; g.stroke(); }
    function MX(pts) { return pts.map(function (p) { return [600 - p[0], p[1]]; }); }   // (mirrored, left to right)
    // ---- below and behind your picture: what it doesn't show, drawn to match it ----
    // her skirt, falling from her waist to the ground in soft folds, the same dark grey as her dress
    var HEM = [50], TOPX = [176]; seed = 5; (function () { var ws = [], sum = 0; for (var i = 0; i < 10; i++) { ws.push(0.6 + rnd() * 0.8); sum += ws[i]; } for (i = 0; i < 10; i++) { HEM.push(HEM[i] + ws[i] / sum * 500); TOPX.push(176 + (i + 1) * 24.6 + (i < 9 ? (rnd() - 0.5) * 8 : 0)); } })();
    function skirtPath(g) {
      g.beginPath(); g.moveTo(166, 640); g.lineTo(432, 640); g.bezierCurveTo(446, 760, 490, 1100, 550, 1420);
      for (var i = 10; i > 0; i--) { var x0 = HEM[i], x1 = HEM[i - 1]; g.quadraticCurveTo((x0 + x1) / 2, 1432 + (x0 - x1) * 0.25, x1, 1420); }
      g.bezierCurveTo(110, 1100, 152, 760, 166, 640); g.closePath();
    }
    function drawSkirt(g) {
      var sg = g.createLinearGradient(50, 0, 550, 0); sg.addColorStop(0, '#2a2c31'); sg.addColorStop(0.5, '#222429'); sg.addColorStop(1, '#17181c');
      skirtPath(g); g.fillStyle = sg; g.fill();
      g.save(); skirtPath(g); g.clip();
      for (var i = 0; i <= 10; i++) {                                     // (the shadow between each fold, with a fine line down some)
        var tx = TOPX[i], bx = HEM[i], bend = (i % 3 - 1) * 14;
        blurred(g, 14, 'rgba(0,0,0,0.45)', function (g) { g.lineWidth = 10; g.beginPath(); g.moveTo(tx, 700); g.quadraticCurveTo((tx + bx) / 2 + 6 + bend, 1060, bx, 1440); g.stroke(); });
        if (i % 2 && i < 10) { g.beginPath(); g.moveTo(tx + (bx - tx) * 0.2, 800); g.quadraticCurveTo((tx + bx) / 2 + 6 + bend, 1080, bx, 1426); ink(g, 1.2, 0.6); }
      }
      for (var j = 0; j < 10; j++) {                                      // (and soft light along each fold)
        var tx2 = (TOPX[j] + TOPX[j + 1]) / 2, bx2 = (HEM[j] + HEM[j + 1]) / 2, lf = (1 - j / 11) * (0.6 + (HEM[j + 1] - HEM[j]) / 80), bend2 = (j % 3 - 1) * 12;
        blurred(g, 16, 'rgba(84,86,96,' + (0.1 + lf * 0.14) + ')', function (g) { g.lineWidth = (HEM[j + 1] - HEM[j]) * 0.3; g.beginPath(); g.moveTo(tx2, 720); g.quadraticCurveTo((tx2 + bx2) / 2 + 4 + bend2, 1060, bx2, 1440); g.stroke(); });
      }
      g.restore();
      skirtPath(g); ink(g, 1.8);
    }
    function finishFront(g) {
      drawSkirt(g);
      // the rest of her right sleeve below your picture, gathered into a black cuff, and her hand
      var SL = tube([[466, 676], [468, 736], [470, 790]], [62, 58, 44], 8);
      tubePath(g, SL); var sg = g.createLinearGradient(436, 0, 500, 0); sg.addColorStop(0, '#2c2627'); sg.addColorStop(0.45, '#463d3a'); sg.addColorStop(1, '#2a2425'); g.fillStyle = sg; g.fill();
      line(g, SL.L); ink(g, 1.6); line(g, SL.R); ink(g, 1.6);
      g.save(); g.translate(470, 792); g.beginPath(); g.moveTo(-22, -12); g.lineTo(22, -12); g.quadraticCurveTo(18, 4, 16, 14); g.lineTo(-16, 14); g.quadraticCurveTo(-18, 4, -22, -12); g.closePath(); g.fillStyle = '#1b1c20'; g.fill(); ink(g, 1.5); g.restore();
      g.save(); g.translate(38, 102); handDown(g); g.restore();
    }
    function bat(g, x, y, s, r) {                                       // (a little black bat)
      g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); g.fillStyle = '#0a090c'; g.beginPath(); g.moveTo(0, -4);
      g.quadraticCurveTo(-6, -8, -14, -6); g.quadraticCurveTo(-11, -2, -12, 3); g.quadraticCurveTo(-8, 0, -6, 4); g.quadraticCurveTo(-3, 2, 0, 6);
      g.quadraticCurveTo(3, 2, 6, 4); g.quadraticCurveTo(8, 0, 12, 3); g.quadraticCurveTo(11, -2, 14, -6); g.quadraticCurveTo(6, -8, 0, -4); g.fill();
      g.beginPath(); g.moveTo(-2, -4); g.lineTo(-2.5, -8); g.lineTo(-0.5, -5); g.lineTo(0.5, -5); g.lineTo(2.5, -8); g.lineTo(2, -4); g.fill(); g.restore();
    }
    function drawArm(g, pts, batAt) {
      var T = tube(pts, [40, 38, 32, 28, 24], 10); skinTube(g, T, 0.55);
      var SL = tube(pts, [62, 76, 80, 72, 42], 10);                      // (the full sheer sleeve over it)
      sheer(g, function () { tubePath(g, SL); }, 0.62);
      g.save(); tubePath(g, SL); g.clip();
      blurred(g, 7, 'rgba(0,0,0,0.6)', function (g) { g.lineWidth = 7; line(g, SL.R); g.stroke(); line(g, SL.L); g.stroke(); });   // (denser where it turns away)
      blurred(g, 6, 'rgba(150,130,128,0.25)', function (g) { g.lineWidth = 5; line(g, inset(SL, 'L', 0.55)); g.stroke(); });
      for (var f = 0; f < 5; f++) { var i0 = Math.round((SL.c.length - 1) * (0.14 + f * 0.16)), i1 = Math.min(SL.c.length - 1, i0 + 5); line(g, [inset(SL, f % 2 ? 'L' : 'R', 0.5 + f * 0.08)[i0], inset(SL, f % 2 ? 'L' : 'R', 0.3)[i1]]); ink(g, 1, 0.45); }   // (soft folds)
      if (batAt) bat(g, batAt[0], batAt[1], 1.3, batAt[2]);
      g.restore();
      tubePath(g, SL); ink(g, 1.5);
      var n = SL.c.length, a = SL.c[n - 4], b = SL.c[n - 1], ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      g.save(); g.translate(b[0], b[1]); g.rotate(ang);                  // (a black cuff, gathered at her wrist)
      g.beginPath(); g.moveTo(-20, -20); g.lineTo(4, -15); g.quadraticCurveTo(8, 0, 4, 15); g.lineTo(-20, 20); g.quadraticCurveTo(-24, 0, -20, -20); g.closePath();
      g.fillStyle = '#121116'; g.fill(); ink(g, 1.4);
      g.strokeStyle = 'rgba(150,146,164,0.45)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(-16, -16); g.lineTo(-16, 16); g.stroke(); g.restore();
    }
    function handDown(g) {                                              // (her right hand, relaxed, fingers a little curled)
      var palm = tube(MX([[168, 700], [170, 728], [171, 752]]), [24, 30, 30], 6); skinTube(g, palm, 0.55, true);
      finger(g, MX([[182, 746], [185, 770], [184, 790]]), 7, 5.5);
      finger(g, MX([[175, 750], [177, 780], [175, 804]]), 7.8, 6);
      finger(g, MX([[167, 752], [167, 784], [163, 810]]), 8, 6);
      finger(g, MX([[159, 748], [156, 776], [154, 800], [158, 806]]), 7.8, 6);
      finger(g, MX([[160, 712], [151, 734], [151, 756]]), 10, 7.5);        // (her thumb)
    }
    function torsoPath(g) { P(g, [[272, 288], [250, 306, 214, 312, 188, 322], [166, 330, 152, 350, 154, 378], [158, 404, 176, 416, 198, 420], [402, 420], [424, 416, 442, 404, 446, 378], [448, 350, 434, 330, 412, 322], [386, 312, 350, 306, 328, 288]], true); }
    function sheer(g, path, a) { path(); g.fillStyle = 'rgba(30,22,24,' + a + ')'; g.fill(); }
    function drawTorso(g, back) {
      torsoPath(g); g.fillStyle = SKIN; g.fill();
      g.save(); torsoPath(g); g.clip();
      blurred(g, 4, 'rgba(176,112,90,0.5)', function (g) { g.lineWidth = 3; P(g, [[284, 320], [250, 324, 226, 328]]); g.stroke(); P(g, [[316, 320], [350, 324, 374, 328]]); g.stroke(); });   // (her collarbones)
      blurred(g, 14, 'rgba(160,100,80,0.5)', function (g) { g.lineWidth = 14; P(g, [[300, 330], [300, 420]]); g.stroke(); });
      g.restore();
      sheer(g, function () { torsoPath(g); }, 0.6);
      g.save(); torsoPath(g); g.clip(); blurred(g, 16, 'rgba(0,0,0,0.55)', function (g) { g.lineWidth = 18; torsoPath(g); g.stroke(); }); g.restore();
      torsoPath(g); ink(g, 1.5);
      if (back) { P(g, [[300, 312], [300, 420]]); ink(g, 1.5); return; }
      [[[300, 316], [300, 426]], [[288, 314], [252, 394]], [[312, 314], [348, 394]], [[280, 310], [244, 326, 206, 332]], [[320, 310], [356, 326, 394, 332]]].forEach(function (l) { P(g, l); ink(g, 1.5, 0.85); });   // (its seams: down the middle, two to her bust, and out to her shoulders)
    }
    // her neck and high, split collar
    function neckPath(g) { P(g, [[276, 210], [278, 258, 274, 286, 268, 300], [332, 300], [326, 286, 322, 258, 324, 210]], true); }
    function drawNeck(g) {
      neckPath(g); g.fillStyle = SKIN; g.fill();
      g.save(); neckPath(g); g.clip();
      blurred(g, 12, 'rgba(150,90,70,0.75)', function (g) { g.beginPath(); g.ellipse(300, 238, 40, 22, 0, 0, Math.PI * 2); g.fill(); });   // (the shadow under her jaw)
      blurred(g, 8, 'rgba(176,112,90,0.5)', function (g) { g.lineWidth = 8; line(g, [[324, 214], [328, 300]]); g.stroke(); });
      g.restore();
      P(g, [[277, 236], [278, 262, 274, 286, 270, 296]]); g.strokeStyle = SKINK; g.lineWidth = 1.2; g.stroke(); P(g, [[323, 236], [322, 262, 326, 286, 330, 296]]); g.stroke();
    }
    function flap(g, s) { P(g, [[300 - s * 31, 256], [300 - s * 16, 262, 300 - s * 6, 262], [300 - s * 1, 304], [300 - s * 1, 318], [300 - s * 20, 318, 300 - s * 36, 312], [300 - s * 34, 284, 300 - s * 31, 256]], true); }
    function drawCollar(g, back) {
      blurred(g, 6, 'rgba(0,0,0,0.5)', function (g) { g.translate(0, 5); flap(g, 1); g.fill(); flap(g, -1); g.fill(); });
      [1, -1].forEach(function (s) {
        flap(g, s); var cg = g.createLinearGradient(300 - s * 36, 0, 300, 0); cg.addColorStop(0, '#0c0b0e'); cg.addColorStop(0.5, '#25232b'); cg.addColorStop(1, '#151419'); g.fillStyle = cg; g.fill();
        g.save(); flap(g, s); g.clip(); blurred(g, 4, 'rgba(140,136,156,0.35)', function (g) { g.lineWidth = 3; P(g, [[300 - s * 28, 262], [300 - s * 16, 266, 300 - s * 7, 266]]); g.stroke(); }); g.restore();
        flap(g, s); ink(g, 1.4);
        if (!back) { P(g, [[300 - s * 27, 296], [300 - s * 14, 300, 300 - s * 4, 300]]); ink(g, 1, 0.6); }   // (a fine seam across it)
      });
    }
    function sheet(paint) { var c = document.createElement('canvas'); c.width = W * S; c.height = Hh * S; var g = c.getContext('2d', { willReadFrequently: true }); g.scale(S, S); paint(g, c); return c; }
    // from behind: her dress, sleeves and the great cloud of crimped black hair, placed to match your picture
    function backCol2(f) { var d = f - 0.5, a = Math.abs(d); return [[300 + d * 30, 30 + a * 10], [300 + d * 156, 80 + a * 30], [300 + d * 182, 176], [300 + d * 214, 290], [300 + d * 330, 420], [300 + d * 400, 540], [300 + d * 388, 640 - a * 60]]; }
    function drawBack(g) {
      drawSkirt(g);
      drawArm(g, [[176, 380], [92, 462], [34, 556], [78, 622], [136, 654]]);
      drawArm(g, [[424, 380], [454, 470], [466, 580], [468, 690], [470, 790]]); g.save(); g.translate(38, 102); handDown(g); g.restore();
      g.save(); g.translate(0, 40); drawTorso(g, true); g.restore();
      function bb(g) { P(g, [[198, 450], [402, 450], [396, 520, 374, 600, 370, 650], [300, 664], [230, 650], [226, 600, 204, 520, 198, 450]], true); }
      bb(g); g.fillStyle = '#222429'; g.fill(); g.save(); bb(g); g.clip(); soft(g, 250, 520, 50, 80, '90,92,104', 0.25); blurred(g, 14, 'rgba(0,0,0,0.6)', function (g) { g.lineWidth = 16; bb(g); g.stroke(); }); g.restore(); bb(g); ink(g, 1.6);
      g.save(); g.translate(0, 40); drawNeck(g); drawCollar(g, true); g.restore();
      seed = 37;
      P(g, [[300, 30], [372, 30, 388, 130, 388, 230], [212, 230], [212, 130, 228, 30, 300, 30]], true); g.fillStyle = '#0b0b10'; g.fill();
      [0, 6, 1, 5, 2, 4, 3].forEach(function (i, k) { hairLock(g, backCol2(i / 7 - 0.03), backCol2((i + 1) / 7 + 0.03), crimp({ n: 330, per: 30, ph: i * 1.7, waves: 6 + ((i * 5) % 3), amp: 10, skew: 2.4, from: 0.28, light: 0.75, shadow: k ? 0.5 : 0 })); });
    }
    // her blink: your picture, with her eyes gently closed (the colours are taken from her own lids and cheeks)
    function closeEyes(g) {
      [[254.5, 175, 20, -1], [339, 174, 19, 1]].forEach(function (e) {
        var cx = e[0], cy = e[1], hw = e[2] + 2, s = e[3], ix = cx - s * hw, ox = cx + s * hw;
        function px(pts) { var c = [0, 0, 0]; pts.forEach(function (p) { var d = g.getImageData(Math.round(p[0] * S), Math.round(p[1] * S), 1, 1).data; for (var k = 0; k < 3; k++) c[k] += d[k] / pts.length; }); return c; }
        function rgb(c) { return 'rgb(' + c.map(Math.round).join(',') + ')'; }
        var b0 = px([[cx + s * 4, cy + 24], [cx - s * 4, cy + 26], [cx, cy + 22]]), t0 = px([[cx - 6, cy - 14], [cx, cy - 15], [cx + 6, cy - 14]]), top = rgb(t0.map(function (v, k) { return v * 0.55 + b0[k] * 0.45; })), bot = rgb(b0);
        var gr = g.createLinearGradient(0, cy - 12, 0, cy + 11); gr.addColorStop(0, top); gr.addColorStop(0.45, bot); gr.addColorStop(1, bot);
        g.beginPath(); g.moveTo(ix - s * 2, cy + 1); g.bezierCurveTo(cx - s * hw * 0.5, cy - 14, cx + s * hw * 0.6, cy - 15, ox + s * 2, cy - 3); g.bezierCurveTo(cx + s * hw * 0.6, cy + 16, cx - s * hw * 0.5, cy + 16, ix - s * 2, cy + 1); g.closePath(); g.fillStyle = gr; g.fill();
        g.beginPath(); g.moveTo(ix, cy + 3); g.bezierCurveTo(cx - s * hw * 0.4, cy + 12, cx + s * hw * 0.5, cy + 11, ox, cy + 1); g.quadraticCurveTo(ox + s * 5, cy - 3, ox + s * 9, cy - 7); ink(g, 2.6, 1);   // (her closed lids, lined in black with their little wing)
        for (var k = 0; k < 5; k++) { var u = 0.35 + k * 0.14, x = ix + (ox - ix) * u, y = cy + 3 + Math.sin(u * Math.PI) * 6.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 1.5, y + 3.5); ink(g, 1, 0.9); }
      });
    }
    var PIC = new Image(), front = sheet(finishFront), blink = sheet(finishFront), back = sheet(drawBack), cvs = [front, blink, back];
    var texs = cvs.map(function (c) { var t = new THREE.CanvasTexture(c); t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; });
    PIC.onload = function () {                                          // (your picture, standing on the skirt and arm drawn below it)
      [front, blink].forEach(function (c, i) { var g = c.getContext('2d'); g.drawImage(PIC, 1, 22.4, PIC.width / S, PIC.height / S); if (i) closeEyes(g); texs[i].needsUpdate = true; });
    };
    PIC.src = 'data:image/webp;base64,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';
    var HT = 1.52, mat = new THREE.MeshLambertMaterial({ map: texs[0], alphaTest: 0.4, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: texs[0], emissiveIntensity: 0.45 });   // (lit by the world, with a little glow of its own so she's always clear)
    var card = new THREE.Mesh(new THREE.PlaneGeometry(HT * W / Hh, HT), mat); card.position.y = HT / 2 - 0.01; card.castShadow = true;
    card.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: texs[0], alphaTest: 0.4 });
    var spin = new THREE.Group(); body.add(spin); spin.add(card);
    var mistTex = radialAlphaTex([[0, 0.7], [0.4, 0.35], [1, 0]]), mist = [];
    for (var mk = 0; mk < 16; mk++) { var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTex, color: mk % 3 ? 0x6a7088 : 0x9aa0b8, transparent: true, opacity: 0, depthWrite: false })); body.add(sp); mist.push({ s: sp, t: glimR(mk * 3.1), a: glimR(mk * 5.7) * Math.PI * 2, r: 0.18 + glimR(mk * 2.3) * 0.12, size: 0.16 + glimR(mk * 4.1) * 0.14 }); }
    axeArm.children[0].visible = axeArm.children[1].visible = false;   // (the old 3D sleeve and hand: your tools are held in her drawn hand instead)
    return { cvs: cvs, texs: texs, mat: mat, card: card, spin: spin, mist: mist, view: 0, handAt: new THREE.Vector3(), HT: HT, W: W, Hh: Hh, HX: 470, HY: 873 };
  })();
  // every frame: she turns to face you, showing her back when she walks away; she sways and bobs a little as she
  // walks, blinks now and then, and dark mist curls round her
  function witchLook(dt, moving) {
    var t = state.time, cam = Math.atan2(camera.position.x - player.position.x, camera.position.z - player.position.z);
    wl.spin.rotation.y = cam - player.rotation.y - body.rotation.y;    // (always square to you)
    var rel = Math.atan2(Math.sin(cam - player.rotation.y), Math.cos(cam - player.rotation.y)), back = Math.abs(rel) > Math.PI * 0.62;
    var bt = (t * 0.23) % 1, view = back ? 2 : bt < 0.02 ? 1 : 0;
    if (view !== wl.view) { wl.view = view; wl.mat.map = wl.mat.emissiveMap = wl.card.customDepthMaterial.map = wl.texs[view]; wl.mat.needsUpdate = true; wl.card.customDepthMaterial.needsUpdate = true; }
    wl.card.rotation.z = moving ? Math.sin(t * 11) * 0.025 : Math.sin(t * 0.9) * 0.006;   // (a gentle sway)
    wl.card.scale.x = (rel < -0.25 && !back ? -1 : 1) * (moving ? 1 : 1);   // (turned to face the way she's walking)
    wl.card.updateMatrixWorld(true); wl.handAt.set((wl.HX - wl.W / 2) * wl.HT / wl.Hh, (wl.Hh / 2 - wl.HY) * wl.HT / wl.Hh + 0.34, 0.03); wl.card.localToWorld(wl.handAt); body.worldToLocal(wl.handAt); axeArm.position.copy(wl.handAt);   // (your tool, held in her right hand)
    wl.mist.forEach(function (m) { m.t += dt * 0.06; if (m.t > 1) m.t -= 1; var a = m.a + t * 0.15; m.s.position.set(Math.cos(a) * m.r, 0.06 + m.t * 0.7, Math.sin(a) * m.r * 0.8); var sz = m.size * (0.7 + m.t * 0.8); m.s.scale.set(sz, sz, 1); m.s.material.opacity = Math.sin(m.t * Math.PI) * 0.22; });
  }


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
    witchLook(dt, moving);
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

  // Full screen: the game fills the whole screen. On computers and Android it also asks the browser for its own full
  // screen, which hides the browser bars. On an iPad or iPhone it never does: there, Safari (which every iPad browser
  // is built on) turns the keyboard off in its full screen, silently dropping every letter and number key (only the
  // arrows, space and a few others get through), so I, T, E, Q, F and 1-4 would stop working. So on those the game
  // just fills the whole browser window instead, and the keyboard keeps working
  var btnFull = document.getElementById('btnFull');
  var appleTouch = /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);   // (an iPad says it's a Mac, but has a touch screen)
  function realFullscreen() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function setFullScreen(on) {
    document.body.classList.toggle('full', on);
    btnFull.innerHTML = on ? '✕ Exit full screen <kbd>F</kbd>' : '⛶ Full screen <kbd>F</kbd>';
    var root = document.documentElement;
    try {
      if (on && !realFullscreen() && !appleTouch) {
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
// Join the three parts back into one game (so they share the same variables, just as if they were one file) and run it
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
