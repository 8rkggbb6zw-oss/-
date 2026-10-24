// Everdawn, part 4 of 4 (see the note at the top of script.js). This file holds you, the player, as a realistic young
// witch; script3.js joins it on after the other parts, so it shares all their variables

EVERDAWN_PARTS.push(function (THREE) {
  // ---------- You: a realistic young witch ----------
  // A young woman with natural, grown-up proportions, in place of the little chibi witch: a softly sculpted face with
  // real eyes (green irises, glossy, with eyelids and lashes that blink), brows, a small nose and rosy lips; long,
  // wavy chestnut hair with a middle part, falling down her back with two locks in front of her shoulders; a felt
  // witch's hat with a gently bent tip, a plum satin band, a brass buckle and an orange rose; a fitted plum-charcoal
  // dress with long sleeves, a cream collar and cuffs, a row of buttons and a leather belt, its skirt to just below her
  // knees, swinging out of the way as she walks; dark tights; and laced leather boots. The chibi witch is still there,
  // unseen: she is what walks, flies, sits in the boat and poses on the title screen, and every joint of this body
  // follows hers, so all of that carries on just as before. Her broom is still the one she rides
  var realYou = (function () {
    var w = wl, chibi = w.chibi, SRGB = renderer.outputEncoding === THREE.sRGBEncoding;
    chibi.traverse(function (o) { if (!o.isMesh) return; for (var p = o; p; p = p.parent) if (p === w.rideBroom) return; o.visible = false; });   // (the chibi witch, hidden, all but her flying broom)
    axeArm.children[0].visible = axeArm.children[1].visible = false;    // (and the tool arm's old sleeve and hand)
    var R = new THREE.Group(); chibi.add(R);
    var HIP = 0.8;                                                      // (how high her hips are)

    // ---- making shapes ----
    function V(x, y, z) { return new THREE.Vector3(x, y, z); }
    function ss(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
    function gs(d) { return Math.exp(-d * d); }
    function tex(wd, ht, paint, rep, colour) {
      var c = document.createElement('canvas'); c.width = wd; c.height = ht; paint(c.getContext('2d'), wd, ht);
      var t = new THREE.CanvasTexture(c); t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
      if (colour !== false && SRGB) t.encoding = THREE.sRGBEncoding;
      return t;
    }
    function specks(g, wd, ht, n, rgb, a0, a1, r0, r1) {
      for (var i = 0; i < n; i++) { g.fillStyle = 'rgba(' + rgb + ',' + (a0 + Math.random() * (a1 - a0)) + ')'; g.beginPath(); g.arc(Math.random() * wd, Math.random() * ht, r0 + Math.random() * (r1 - r0), 0, Math.PI * 2); g.fill(); }
    }
    function cr(a, b, c, d, t) { return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t * t * t); }
    // (a smooth tube through rings, bottom to top, each [height, half-width, half-depth, x offset, z offset], eased
    // between them; shape can move each point, told its angle round (0 at the front), how far up it is (0 to 1) and its ring)
    function loft(keys, segs, steps, shape) {
      keys = keys.map(function (k) { return [k[0], k[1], k[2], k[3] || 0, k[4] || 0]; }).sort(function (p, q) { return p[0] - q[0]; });
      var rings = [];
      for (var k = 0; k < keys.length - 1; k++) for (var s = 0; s < steps; s++) {
        var t = s / steps, a = keys[k - 1] || keys[k], b = keys[k], c = keys[k + 1], d = keys[k + 2] || keys[k + 1], row = [];
        for (var q = 0; q < 5; q++) row.push(cr(a[q], b[q], c[q], d[q], t)); rings.push(row);
      }
      rings.push(keys[keys.length - 1]);
      var n = rings.length, pos = [], uv = [], idx = [];
      for (var j = 0; j < n; j++) for (var i = 0; i <= segs; i++) {
        var r = rings[j], an = i / segs * Math.PI * 2, p = V(r[3] + r[1] * Math.sin(an), r[0], r[4] + r[2] * Math.cos(an));
        if (shape) shape(p, an, j / (n - 1), r); pos.push(p.x, p.y, p.z); uv.push(i / segs, j / (n - 1));
      }
      for (j = 0; j < n - 1; j++) for (var i2 = 0; i2 < segs; i2++) { var A = j * (segs + 1) + i2; idx.push(A, A + 1, A + segs + 2, A, A + segs + 2, A + segs + 1); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
      g.computeVertexNormals(); seam(g, n, segs); g.userData.rings = n; g.userData.segs = segs; return g;
    }
    function seam(g, n, segs) {                                         // (no crease where the tube's two edges meet)
      var nr = g.attributes.normal;
      for (var j = 0; j < n; j++) { var a = j * (segs + 1), b = a + segs, x = nr.getX(a) + nr.getX(b), y = nr.getY(a) + nr.getY(b), z = nr.getZ(a) + nr.getZ(b), l = Math.hypot(x, y, z) || 1; nr.setXYZ(a, x / l, y / l, z / l); nr.setXYZ(b, x / l, y / l, z / l); }
    }
    function mesh(geo, mat, parent, x, y, z) { var m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; if (x !== undefined) m.position.set(x, y, z); (parent || R).add(m); return m; }
    function group(parent, x, y, z) { var g = new THREE.Group(); g.position.set(x || 0, y || 0, z || 0); (parent || R).add(g); return g; }
    function std(o) { return new THREE.MeshStandardMaterial(o); }

    // ---- materials ----
    var skinTex = tex(256, 256, function (g, W, H) { g.fillStyle = '#f2c6a8'; g.fillRect(0, 0, W, H); specks(g, W, H, 1400, '185,112,92', 0.03, 0.08, 0.4, 1.6); specks(g, W, H, 500, '255,226,208', 0.03, 0.07, 0.4, 1.4); }, [2, 2]);
    var mSkin = std({ map: skinTex, roughness: 0.6, emissive: 0xffffff, emissiveMap: skinTex, emissiveIntensity: 0.14 });   // (a warm glow, so she never looks grey)
    var mLid = std({ color: 0xf0c3a5, roughness: 0.62, emissive: 0xf0c3a5, emissiveIntensity: 0.14 });
    var weave = tex(256, 256, function (g, W, H) {
      g.fillStyle = '#808080'; g.fillRect(0, 0, W, H);
      for (var y = 0; y < H; y += 2) { g.fillStyle = 'rgba(0,0,0,' + (0.1 + Math.random() * 0.08) + ')'; g.fillRect(0, y, W, 1); }
      for (var x = 0; x < W; x += 2) { g.fillStyle = 'rgba(255,255,255,' + (0.06 + Math.random() * 0.06) + ')'; g.fillRect(x, 0, 1, H); }
      specks(g, W, H, 300, '0,0,0', 0.05, 0.12, 0.5, 1.5);
    }, [10, 10], false);
    var mDress = std({ color: 0x3b2f40, roughness: 0.86, bumpMap: weave, bumpScale: 0.004 });
    var mSkirt = std({ color: 0x3b2f40, roughness: 0.86, bumpMap: weave, bumpScale: 0.004, side: THREE.DoubleSide });
    var mCream = std({ color: 0xeadfca, roughness: 0.8, bumpMap: weave, bumpScale: 0.003, side: THREE.DoubleSide });
    var leatherTex = tex(256, 256, function (g, W, H) {
      g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); specks(g, W, H, 2200, '0,0,0', 0.05, 0.16, 0.4, 1.3); specks(g, W, H, 900, '255,255,255', 0.04, 0.1, 0.4, 1.2);
      g.strokeStyle = 'rgba(0,0,0,0.18)'; for (var i = 0; i < 40; i++) { var x = Math.random() * W, y = Math.random() * H; g.lineWidth = 0.6 + Math.random(); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y + (Math.random() - 0.5) * 6, x + 20 + Math.random() * 20, y + (Math.random() - 0.5) * 4); g.stroke(); }
    }, [3, 3], false);
    var mBoot = std({ color: 0x4e3324, roughness: 0.55, bumpMap: leatherTex, bumpScale: 0.003 });
    var mSole = std({ color: 0x241812, roughness: 0.8 });
    var mBelt = std({ color: 0x5a3a26, roughness: 0.5, bumpMap: leatherTex, bumpScale: 0.002 });
    var mBrass = std({ color: 0xc9a25a, roughness: 0.32, metalness: 0.85 });
    var mTights = std({ color: 0x3a2b2c, roughness: 0.62, bumpMap: weave, bumpScale: 0.0015 });
    var mButton = std({ color: 0x1e171f, roughness: 0.3, metalness: 0.2 });

    // ---- her body (her dress's bodice) ----
    function bust(p, a, v, r) {                                         // (a soft bust)
      var fy = gs((r[0] - 1.165) / 0.04); if (fy < 0.01) return;
      var d = a > Math.PI ? a - Math.PI * 2 : a;
      [-0.62, 0.62].forEach(function (c) { var fa = gs((d - c) / 0.45); p.z += 0.03 * fy * fa; p.x += 0.007 * fy * fa * Math.sign(c); });
      var back = gs((Math.abs(d) - Math.PI) / 0.9) * gs((r[0] - 1.22) / 0.06); p.z -= 0.004 * back;   // (her shoulder blades, just showing)
    }
    var TORSO = [[0.96, 0.128, 0.09], [1.02, 0.116, 0.083, 0, 0.002], [1.08, 0.121, 0.088, 0, 0.006], [1.14, 0.131, 0.097, 0, 0.01], [1.2, 0.137, 0.097, 0, 0.006],
      [1.25, 0.148, 0.09, 0, -0.002], [1.29, 0.159, 0.082, 0, -0.006], [1.315, 0.15, 0.075, 0, -0.008], [1.34, 0.104, 0.064, 0, -0.008], [1.362, 0.058, 0.052, 0, -0.006]];
    var torsoGeo = loft(TORSO, 48, 5, bust); mesh(torsoGeo, mDress);
    function frontZ(geo, y) {                                           // (how far forward her front is, at this height)
      var p = geo.attributes.position, best = 1, z = 0;
      for (var i = 0; i < p.count; i++) if (Math.abs(p.getX(i)) < 0.004 && p.getZ(i) > 0 && Math.abs(p.getY(i) - y) < best) { best = Math.abs(p.getY(i) - y); z = p.getZ(i); }
      return z;
    }
    [1.285, 1.235, 1.185, 1.13, 1.075].forEach(function (y) { var b = mesh(new THREE.SphereGeometry(0.0065, 12, 8), mButton, R, 0, y, frontZ(torsoGeo, y) + 0.002); b.scale.z = 0.55; });   // (a row of buttons)
    mesh(loft([[1.333, 0.112, 0.085, 0, -0.006], [1.352, 0.088, 0.071, 0, -0.006], [1.372, 0.058, 0.054, 0, -0.006]], 48, 3), mCream);   // (her cream collar...)
    [-1, 1].forEach(function (s) { var tab = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2); tab.scale(0.03, 0.006, 0.022); tab.rotateX(0.55); tab.rotateZ(-s * 0.25); mesh(tab, mCream, R, s * 0.028, 1.336, 0.066); });   // (...with two rounded points at the front)
    mesh(loft([[0.983, 0.125, 0.09, 0, 0.001], [1.03, 0.121, 0.087, 0, 0.002]], 48, 2), mBelt);   // (a leather belt...)
    var buckle = group(R, 0, 1.006, 0.091);                            // (...with a brass buckle)
    [[0, 0.02, 0.036, 0.006], [0, -0.02, 0.036, 0.006], [0.016, 0, 0.006, 0.044], [-0.016, 0, 0.006, 0.044]].forEach(function (p) { mesh(new THREE.BoxGeometry(p[2], p[3], 0.006), mBrass, buckle, p[0], p[1], 0.003); });
    mesh(new THREE.BoxGeometry(0.004, 0.034, 0.004), mBrass, buckle, 0, 0, 0.006);
    mesh(loft([[1.33, 0.056, 0.052, 0, -0.01], [1.39, 0.05, 0.048, 0, -0.008], [1.47, 0.049, 0.05, 0, -0.004]], 32, 4), mSkin);   // (her neck)

    // ---- her skirt: flaring out in soft folds to just below her knees, and moving out of her legs' way as she walks ----
    var SKIRT = [[0.36, 0.3, 0.27, 0, -0.01], [0.46, 0.27, 0.245, 0, -0.008], [0.6, 0.23, 0.205, 0, -0.005], [0.74, 0.19, 0.166, 0, -0.003], [0.88, 0.152, 0.126], [0.97, 0.129, 0.094, 0, 0.001], [1.025, 0.121, 0.087, 0, 0.002]];
    var skirtGeo = loft(SKIRT, 56, 4, function (p, a, v) {
      var k = Math.pow(1 - v, 1.4), f = 1 + 0.055 * k * Math.sin(a * 8 + 0.5) + 0.025 * k * Math.sin(a * 13 + 1.2);
      p.x *= f; p.z = (p.z + 0.01 * (1 - v)) * f - 0.01 * (1 - v);
      if (v === 0) p.y += 0.008 * Math.sin(a * 5 + 0.7);                // (a hem that isn't quite even)
    });
    var skirt = mesh(skirtGeo, mSkirt), skirtRest = skirtGeo.attributes.position.array.slice();

    // ---- her legs, in dark tights, and her laced leather boots ----
    var legs = [], shins = [];
    [1, -1].forEach(function (s) {                                       // (s: 1 her left leg, -1 her right, as with the chibi's legs)
      var leg = group(R, s * 0.085, HIP, 0);
      mesh(loft([[-0.4, 0.042, 0.044, 0, -0.004], [-0.32, 0.05, 0.053, 0, -0.006], [-0.2, 0.062, 0.066, 0, -0.004], [-0.08, 0.071, 0.074], [0.03, 0.07, 0.072]], 28, 4), mTights, leg);
      var shin = group(leg, 0, -0.38, 0);
      mesh(loft([[-0.37, 0.028, 0.03], [-0.33, 0.031, 0.034, 0, -0.002], [-0.24, 0.04, 0.046, 0, -0.008], [-0.15, 0.046, 0.05, 0, -0.008], [-0.06, 0.04, 0.042, 0, -0.004], [0.03, 0.043, 0.045, 0, -0.003]], 28, 4), mTights, shin);
      mesh(loft([[-0.385, 0.035, 0.038], [-0.33, 0.036, 0.04, 0, -0.002], [-0.26, 0.044, 0.05, 0, -0.007], [-0.18, 0.05, 0.056, 0, -0.008], [-0.15, 0.052, 0.058, 0, -0.008]], 32, 4), mBoot, shin);   // (the boot's shaft)
      var cuffT = new THREE.TorusGeometry(0.052, 0.004, 6, 32); cuffT.rotateX(Math.PI / 2); cuffT.scale(1, 1, 1.1); mesh(cuffT, mBoot, shin, 0, -0.152, -0.008);   // (its rolled top edge)
      var foot = loft([[-0.058, 0.026, 0.03], [-0.02, 0.034, 0.04], [0.04, 0.038, 0.031, 0, 0.004], [0.1, 0.036, 0.021, 0, 0.012], [0.14, 0.028, 0.016, 0, 0.016], [0.168, 0.011, 0.01, 0, 0.018]], 32, 4);
      foot.rotateX(Math.PI / 2); mesh(foot, mBoot, shin, 0, -0.383, 0.012);   // (the foot, rounded at the heel and narrowing to a soft point)
      var sole = loft([[-0.062, 0.03, 0.006], [0.04, 0.041, 0.006], [0.17, 0.013, 0.006]], 32, 4); sole.rotateX(Math.PI / 2); mesh(sole, mSole, shin, 0, -0.416, 0.012);
      mesh(new THREE.BoxGeometry(0.048, 0.03, 0.05), mSole, shin, 0, -0.405, -0.03);   // (a low heel)
      for (var l = 0; l < 6; l++) {                                      // (criss-cross laces up the front, with brass eyelets)
        var ly = -0.36 + l * 0.034, lz = 0.04 + l * 0.0025 + (l > 3 ? 0.004 : 0);
        [-1, 1].forEach(function (d) { var lace = new THREE.CylinderGeometry(0.0018, 0.0018, 0.05, 4); lace.rotateZ(Math.PI / 2 + d * 0.45); mesh(lace, mSole, shin, 0, ly + 0.012, lz + 0.002); mesh(new THREE.SphereGeometry(0.0035, 6, 4), mBrass, shin, d * 0.02, ly, lz - 0.004); });
      }
      legs.push(leg); shins.push(shin);
    });

    // ---- her arms: long sleeves with cream cuffs, and her hands ----
    function buildArm(s, L1, L2, curl) {                                // (s: 1 her left arm, -1 her right; the upper arm and forearm lengths; how much her fingers curl)
      var arm = new THREE.Group(), u = L1 / 0.28, f = L2 / 0.25;
      mesh(loft([[-0.29 * u, 0.036, 0.036], [-0.2 * u, 0.04, 0.04], [-0.1 * u, 0.046, 0.044], [-0.02 * u, 0.052, 0.05], [0.035, 0.046, 0.044]], 28, 4), mDress, arm);
      var elbow = group(arm, 0, -L1, 0);
      mesh(loft([[-0.215 * f, 0.029, 0.026], [-0.15 * f, 0.033, 0.03], [-0.07 * f, 0.038, 0.035], [0.01, 0.037, 0.035], [0.04, 0.036, 0.034]], 28, 4), mDress, elbow);
      mesh(loft([[-0.237 * f, 0.031, 0.028], [-0.205 * f, 0.032, 0.029]], 28, 2), mCream, elbow);   // (the cuff)
      mesh(loft([[-L2 - 0.006, 0.021, 0.017], [-0.22 * f, 0.023, 0.019]], 20, 2), mSkin, elbow);   // (her wrist)
      var hand = group(elbow, 0, -L2, 0);
      mesh(loft([[-0.086, 0.011, 0.032], [-0.05, 0.014, 0.038], [-0.012, 0.014, 0.033], [0.008, 0.013, 0.026]], 20, 4), mSkin, hand);   // (her palm, its back to the outside)
      [[0.022, 0.066, 0.0078], [0.0075, 0.074, 0.008], [-0.0075, 0.07, 0.0076], [-0.021, 0.057, 0.0068]].forEach(function (fg) {   // (four slender fingers, gently curled...)
        var fing = group(hand, 0, -0.082, fg[0]); fing.rotation.z = -s * curl; fing.rotation.x = fg[0] * 0.6;
        var r = fg[2], L = fg[1];
        mesh(loft([[-L, 0.0015, 0.0015], [-L + 0.006, r * 0.85, r * 0.8], [-L * 0.5, r * 0.95, r * 0.9], [0.004, r, r * 0.95]], 12, 3), mSkin, fing);
      });
      var th = group(hand, -s * 0.004, -0.03, 0.03); th.rotation.set(0.75, 0, -s * 0.35);   // (...and her thumb)
      mesh(loft([[-0.052, 0.0015, 0.0015], [-0.046, 0.0085, 0.008], [-0.02, 0.01, 0.0095], [0.006, 0.011, 0.01]], 12, 3), mSkin, th);
      arm.userData = { elbow: elbow, hand: hand };
      return arm;
    }
    var armL = buildArm(1, 0.28, 0.25, 0.55), armR = buildArm(-1, 0.28, 0.25, 0.55);
    armL.position.set(0.172, 1.305, -0.006); armR.position.set(-0.172, 1.305, -0.006); R.add(armL); R.add(armR);
    var TOOL = 1.6, toolArm = buildArm(-1, 0.23, 0.205, 1.05);           // (the arm that holds your tools, a little shorter, so they sit in her hand)
    var toolHold = new THREE.Group(); toolHold.scale.setScalar(1 / TOOL); toolHold.add(toolArm); axeArm.add(toolHold);
    axeArm.scale.setScalar(TOOL);                                       // (your tools, grown to suit her)

    // ---- her head: a soft oval face with a gentle jaw, a slim, finely shaped nose and naturally full lips; her eyes,
    // brows and complexion painted on in fine detail, like a portrait ----
    var head = group(R, 0, 1.41, -0.004), HC = V(0, 0.084, 0.008), HR = V(0.075, 0.104, 0.093), LOW = 0.82;   // (LOW: how much shorter her face is below her eyes than her head is above them)
    function skull(x, y, z) {                                           // (a point on her head's shape, from a point on a ball; no features)
      var X = x * HR.x, Y = y * HR.y, Z = z * HR.z;
      if (z < 0) Z *= 1.06;                                             // (fuller at the back)
      if (y < 0) { var t = -y; Y *= LOW; X *= 1 - 0.31 * Math.pow(t, 1.6); Z *= z > 0 ? 1 - 0.15 * t * t : 1 - 0.42 * Math.pow(t, 1.3); }   // (a soft jawline tapering to a gently rounded chin, and into her neck behind)
      if (z > 0.55) Z *= 1 - 0.03 * ss(0.55, 0.9, z);                    // (a gently flatter face)
      return V(X, Y, Z);
    }
    var EYE = [0.0305, 0.002];                                          // (where her eyes are)
    function faceBumps(X, Y) {                                          // (her features: how far forward each spot of her face comes)
      var d = 0;
      [-1, 1].forEach(function (s) {
        var ex = X - s * EYE[0], ey = Y - EYE[1];
        d -= 0.0035 * gs(ex / 0.021) * gs(ey / 0.015);                  // (soft hollows for her eyes...)
        d += 0.0024 * gs(ex / 0.0115) * gs(ey / 0.0075);                // (...with the curve of each eye beneath its lids)
        d += 0.0018 * gs(ex / 0.02) * gs((Y - 0.024) / 0.006);          // (brow bones)
        d += 0.0046 * gs((X - s * 0.045) / 0.019) * gs((Y + 0.019) / 0.015);   // (cheekbones)
        d += 0.0026 * gs((X - s * 0.034) / 0.019) * gs((Y + 0.04) / 0.017);   // (soft cheeks)
        d += 0.0019 * gs((X - s * 0.0085) / 0.0044) * gs((Y + 0.0315) / 0.0045);   // (the wings of her nose)
      });
      var nw = 0.0048 + 0.0024 * ss(0.006, -0.026, Y), nose = 0.0022 * ss(0.02, 0.004, Y) + 0.0082 * ss(0.004, -0.025, Y) * (1 - ss(-0.0275, -0.0355, Y));
      d += nose * gs(X / nw) + 0.0015 * gs(X / 0.0052) * gs((Y + 0.0262) / 0.0044);   // (a slim, straight nose with a softly rounded tip)
      d -= 0.0018 * gs(X / 0.006) * gs((Y + 0.0365) / 0.0032);          // (in under it)
      d += 0.0007 * gs(X / 0.0032) * gs((Y + 0.0415) / 0.0035);         // (the groove above her lip)
      d += 0.0036 * gs(X / 0.016) * gs((Y + 0.0475) / 0.0045);          // (upper lip)
      d += 0.0046 * gs(X / 0.014) * gs((Y + 0.0555) / 0.0052);          // (fuller lower lip)
      d -= 0.0018 * gs(X / 0.016) * gs((Y + 0.0512) / 0.0013);          // (where they meet)
      d -= 0.0012 * gs(X / 0.01) * gs((Y + 0.0635) / 0.0035);           // (the little hollow under her lip)
      d += 0.0034 * gs(X / 0.016) * gs((Y + 0.0725) / 0.0085);          // (her chin)
      return d;
    }
    // (her face's picture is laid on flat from the front, so all of it goes to her face; FX/FY are the part of her face it covers)
    var FX = 0.088, FY0 = -0.098, FY1 = 0.112;
    var headGeo = new THREE.SphereGeometry(1, 112, 84), hp = headGeo.attributes.position, huv = headGeo.attributes.uv;
    for (var q = 0; q < hp.count; q++) {
      var ux = hp.getX(q), uy = hp.getY(q), uz = hp.getZ(q), P = skull(ux, uy, uz);
      if (uz > 0) P.z += faceBumps(P.x, P.y) * ss(0.25, 0.65, uz);
      hp.setXYZ(q, P.x + HC.x, P.y + HC.y, P.z + HC.z);
      huv.setXY(q, Math.min(1, Math.max(0, 0.5 + P.x / (2 * FX))), Math.min(1, Math.max(0, (P.y - FY0) / (FY1 - FY0))));
    }
    headGeo.computeVertexNormals();
    function paintFace(kind) {                                          // (kind: 'open', 'shut' for a blink, or 'beam' for eyes closed with a happy smile)
      return tex(1024, 1280, function (g, W, H) {
        function at(x, y) { return [(0.5 + x / (2 * FX)) * W, (FY1 - y) / (FY1 - FY0) * H]; }
        var PX = W / (2 * FX);                                          // (pixels per metre)
        function path(pts, close) { g.beginPath(); pts.forEach(function (p, i) { var c = at(p[0], p[1]); if (i) g.lineTo(c[0], c[1]); else g.moveTo(c[0], c[1]); }); if (close) g.closePath(); }
        function curve(pts) { g.beginPath(); var c = at(pts[0][0], pts[0][1]); g.moveTo(c[0], c[1]); for (var i = 1; i < pts.length - 1; i++) { var a = at(pts[i][0], pts[i][1]), b = at((pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2); g.quadraticCurveTo(a[0], a[1], b[0], b[1]); } var e = at(pts[pts.length - 1][0], pts[pts.length - 1][1]); g.lineTo(e[0], e[1]); }
        function glow(x, y, r, rgb, a, sy) { var c = at(x, y), R2 = r * PX; g.save(); g.translate(c[0], c[1]); g.scale(1, sy || 1); var gr = g.createRadialGradient(0, 0, 1, 0, 0, R2); gr.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); gr.addColorStop(1, 'rgba(' + rgb + ',0)'); g.fillStyle = gr; g.fillRect(-R2, -R2, R2 * 2, R2 * 2); g.restore(); }
        g.fillStyle = '#f2c6a8'; g.fillRect(0, 0, W, H);                // (warm, peachy skin, very gently mottled)
        specks(g, W, H, 9000, '200,128,104', 0.015, 0.04, 0.6, 2.2); specks(g, W, H, 4000, '255,232,218', 0.02, 0.05, 0.6, 2);
        [-1, 1].forEach(function (s) {                                   // (soft, warm shaping: under her cheekbones, light on her cheeks, a natural flush)
          glow(s * 0.058, -0.035, 0.028, '214,132,110', 0.12, 0.7); glow(s * 0.037, -0.013, 0.016, '255,238,226', 0.32); glow(s * 0.041, -0.025, 0.018, '236,134,128', 0.24, 0.75);
          glow(s * 0.0072, -0.012, 0.0055, '206,132,112', 0.16, 2.2);    // (the sides of her nose)
          var n = at(s * 0.0058, -0.0322); g.fillStyle = 'rgba(132,70,62,0.32)'; g.beginPath(); g.ellipse(n[0], n[1], 0.002 * PX, 0.0009 * PX, s * -0.35, 0, Math.PI * 2); g.fill();   // (nostrils, faintly)
        });
        glow(0, -0.004, 0.0045, '255,240,230', 0.4, 2.5); glow(0.0006, -0.0258, 0.003, '255,242,234', 0.55);   // (light down her nose, and on its tip)
        glow(0, -0.0345, 0.0055, '176,98,86', 0.26, 0.6); glow(0, -0.064, 0.009, '186,112,96', 0.12, 0.6); glow(0, -0.074, 0.011, '255,232,216', 0.2); glow(0, 0.05, 0.03, '255,234,220', 0.2);
        [-1, 1].forEach(function (s) {                                   // (her eyes: almond-shaped, clear and green)
          var cx = s * EYE[0], cy = EYE[1];
          function E(dx, dy) { return [cx + s * dx, cy + dy]; }          // (a point of this eye, dx outward from the nose)
          glow(cx + s * 0.002, cy + 0.009, 0.015, '170,110,104', 0.22, 0.7);   // (soft warm shadow on her lids)
          glow(cx + s * 0.013, cy + 0.002, 0.009, '140,86,80', 0.16);
          g.strokeStyle = 'rgba(160,96,86,0.38)'; g.lineWidth = 0.0007 * PX; g.lineCap = 'round'; curve([E(-0.011, 0.0068), E(-0.003, 0.0118), E(0.0065, 0.0122), E(0.0138, 0.0068)]); g.stroke();   // (the crease of her lid)
          if (kind === 'open') {
            var upper = [E(-0.0135, 0), E(-0.0076, 0.0067), E(0.0018, 0.0084), E(0.0102, 0.0062), E(0.015, 0.0012)], lower = [E(0.015, 0.0012), E(0.0076, -0.0046), E(-0.0022, -0.0055), E(-0.0135, 0)];
            g.save(); curve(upper.concat(lower.slice(1))); g.closePath(); g.clip();   // (the white of her eye...)
            var sc = at(cx, cy), wg = g.createRadialGradient(sc[0], sc[1], 1, sc[0], sc[1], 0.017 * PX); wg.addColorStop(0, '#f8f2ee'); wg.addColorStop(0.75, '#ecdcd6'); wg.addColorStop(1, '#d6b8b0'); g.fillStyle = wg; g.fillRect(sc[0] - 0.02 * PX, sc[1] - 0.02 * PX, 0.04 * PX, 0.04 * PX);
            var ic = at(cx + s * 0.0006, cy + 0.0008), IR = 0.0059 * PX;   // (...her green iris...)
            var ig = g.createRadialGradient(ic[0], ic[1], IR * 0.15, ic[0], ic[1], IR); ig.addColorStop(0, '#a99442'); ig.addColorStop(0.32, '#6f9a48'); ig.addColorStop(0.7, '#477538'); ig.addColorStop(0.9, '#2b4a26'); ig.addColorStop(1, '#15200f');
            g.fillStyle = ig; g.beginPath(); g.arc(ic[0], ic[1], IR, 0, Math.PI * 2); g.fill();
            for (var f = 0; f < 90; f++) { var a = Math.random() * Math.PI * 2; g.strokeStyle = Math.random() < 0.5 ? 'rgba(214,224,150,0.28)' : 'rgba(24,46,20,0.3)'; g.lineWidth = 1; g.beginPath(); g.moveTo(ic[0] + Math.cos(a) * IR * 0.42, ic[1] + Math.sin(a) * IR * 0.42); g.lineTo(ic[0] + Math.cos(a) * IR * (0.8 + Math.random() * 0.15), ic[1] + Math.sin(a) * IR * (0.8 + Math.random() * 0.15)); g.stroke(); }
            g.fillStyle = '#090a08'; g.beginPath(); g.arc(ic[0], ic[1], IR * 0.37, 0, Math.PI * 2); g.fill();   // (...its pupil...)
            var ls = g.createLinearGradient(0, at(0, cy + 0.0085)[1], 0, at(0, cy + 0.0015)[1]); ls.addColorStop(0, 'rgba(58,36,30,0.6)'); ls.addColorStop(1, 'rgba(58,36,30,0)'); g.fillStyle = ls; g.fillRect(sc[0] - 0.02 * PX, sc[1] - 0.0085 * PX, 0.04 * PX, 0.0085 * PX);   // (...in the shadow of her lashes...)
            g.fillStyle = 'rgba(255,255,255,0.92)'; g.beginPath(); g.ellipse(ic[0] - s * IR * 0.3, ic[1] - IR * 0.34, IR * 0.2, IR * 0.16, 0, 0, Math.PI * 2); g.fill();   // (...with the light catching in it)
            g.fillStyle = 'rgba(255,255,255,0.45)'; g.beginPath(); g.arc(ic[0] + s * IR * 0.32, ic[1] + IR * 0.4, IR * 0.08, 0, Math.PI * 2); g.fill();
            g.restore();
            var ip = at(cx - s * 0.0135, cy); g.fillStyle = 'rgba(216,134,132,0.75)'; g.beginPath(); g.ellipse(ip[0] + s * 0.0013 * PX, ip[1], 0.0015 * PX, 0.001 * PX, 0, 0, Math.PI * 2); g.fill();   // (the pink inner corner)
            g.strokeStyle = 'rgba(34,22,20,0.95)'; g.lineCap = 'round'; g.lineJoin = 'round';   // (her upper lash line, a little fuller towards the outer corner)
            g.lineWidth = 0.0007 * PX; curve(upper); g.stroke(); g.lineWidth = 0.0011 * PX; curve(upper.slice(2)); g.stroke();
            for (var lc = 0; lc < 34; lc++) {                              // (fine, natural lashes, curling softly up and out)
              var u = lc / 33, k = Math.floor(u * 3.999), tt = u * 4 - k, A = upper[k], B = upper[k + 1], bx = A[0] + (B[0] - A[0]) * tt, by = A[1] + (B[1] - A[1]) * tt, len = 0.0018 + 0.0018 * Math.sin(u * Math.PI * 0.9 + 0.3);
              var b0 = at(bx, by), t0 = at(bx + s * (0.0006 + u * 0.0016), by + len); g.strokeStyle = 'rgba(30,20,18,' + (0.6 + Math.random() * 0.3) + ')'; g.lineWidth = 0.00028 * PX;
              g.beginPath(); g.moveTo(b0[0], b0[1]); g.quadraticCurveTo(b0[0] + s * 0.0001 * PX, t0[1] + 0.0005 * PX, t0[0], t0[1]); g.stroke();
            }
            g.strokeStyle = 'rgba(96,60,54,0.45)'; g.lineWidth = 0.00045 * PX; curve(lower); g.stroke();   // (a soft lower lash line, with a few fine lashes)
            for (lc = 0; lc < 9; lc++) { var u2 = 0.25 + lc / 12, lb = E(-0.0135 + u2 * 0.0285, -0.0055 * Math.sin(u2 * Math.PI) + 0.0001), lb0 = at(lb[0], lb[1]); g.strokeStyle = 'rgba(70,46,42,0.4)'; g.lineWidth = 0.0002 * PX; g.beginPath(); g.moveTo(lb0[0], lb0[1]); g.lineTo(lb0[0] + s * 0.0004 * PX, lb0[1] + 0.0011 * PX); g.stroke(); }
          } else {                                                          // (closed: her lid smoothly down, lashes resting in a soft curve)
            var lid = kind === 'beam' ? [E(-0.0132, 0.0004), E(-0.004, -0.0024), E(0.0064, -0.0026), E(0.0148, 0.0008)] : [E(-0.0132, 0.0002), E(-0.004, -0.0016), E(0.0064, -0.0018), E(0.0148, 0.0006)];
            g.strokeStyle = 'rgba(34,22,20,0.9)'; g.lineCap = 'round'; g.lineWidth = 0.0008 * PX; curve(lid); g.stroke();
            for (lc = 0; lc < 18; lc++) { var u3 = lc / 17, c3 = lid[1][1] * (1 - u3) + lid[2][1] * u3, lp = E(-0.012 + u3 * 0.026, c3 - 0.0001), l0 = at(lp[0], lp[1]); g.lineWidth = 0.00026 * PX; g.beginPath(); g.moveTo(l0[0], l0[1]); g.lineTo(l0[0] + s * (0.0004 + u3 * 0.0008) * PX, l0[1] + 0.0016 * PX); g.stroke(); }
          }
          for (var hb = 0; hb < 240; hb++) {                               // (her brows: natural and softly full, fine hairs arching gently to a tapered tail)
            var t = Math.random(), bx2 = cx + s * (-0.0165 + t * 0.034), by2 = cy + 0.0165 + 0.0042 * Math.sin(Math.min(1, t * 1.25) * Math.PI * 0.78) - t * 0.0022 + (Math.random() - 0.5) * 0.0028 * (1 - t * 0.7);
            var p0 = at(bx2, by2), p1 = at(bx2 + s * 0.0028, by2 + 0.0011 - t * 0.0022);
            g.strokeStyle = 'rgba(' + Math.round(86 + Math.random() * 28) + ',' + Math.round(56 + Math.random() * 18) + ',40,' + (0.3 + Math.random() * 0.4) * (t < 0.15 ? 0.6 : 1) + ')'; g.lineWidth = (0.00035 + Math.random() * 0.0003) * PX;
            g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
          }
        });
        var up = kind === 'beam' ? 0.0024 : 0.0007;                       // (her lips: naturally rosy and full, with a soft cupid's bow, curving gently up at the corners)
        var ul = [[-0.0185, -0.0516 + up], [-0.011, -0.0478], [-0.004, -0.0451], [0, -0.0461], [0.004, -0.0451], [0.011, -0.0478], [0.0185, -0.0516 + up]];
        var mid = [[0.0185, -0.0516 + up], [0.009, -0.0521], [0, -0.0525], [-0.009, -0.0521], [-0.0185, -0.0516 + up]];
        var ll = [[-0.0185, -0.0516 + up], [-0.011, -0.0565], [0, -0.0598], [0.011, -0.0565], [0.0185, -0.0516 + up]];
        g.fillStyle = '#c4706f'; curve(ul.concat(mid.slice(1))); g.closePath(); g.fill();
        g.fillStyle = '#cf7c7b'; curve(mid.slice().reverse().concat(ll.slice().reverse().slice(1))); g.closePath(); g.fill();
        var lg = g.createLinearGradient(0, at(0, -0.0525)[1], 0, at(0, -0.0598)[1]); lg.addColorStop(0, 'rgba(120,40,46,0.22)'); lg.addColorStop(0.5, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(120,50,50,0.18)'); g.fillStyle = lg; curve(mid.slice().reverse().concat(ll.slice().reverse().slice(1))); g.closePath(); g.fill();
        glow(0.0015, -0.0562, 0.0036, '255,238,236', 0.42); glow(-0.005, -0.0472, 0.002, '255,234,232', 0.28);   // (a soft shine on her lips)
        if (kind === 'beam') { g.fillStyle = '#f6efe8'; curve([[-0.0148, -0.0518 + up * 0.5], [0, -0.0529], [0.0148, -0.0518 + up * 0.5], [0.0095, -0.0544], [0, -0.055], [-0.0095, -0.0544]]); g.closePath(); g.fill(); }   // (smiling: a glimpse of teeth)
        g.strokeStyle = 'rgba(110,44,48,0.85)'; g.lineWidth = 0.0006 * PX; g.lineCap = 'round'; curve(mid.slice().reverse()); g.stroke();
        [-1, 1].forEach(function (s) { glow(s * 0.0192, -0.0514 + up, 0.0018, '146,72,66', 0.35); });   // (the corners of her mouth)
      });
    }
    var faceOpen = paintFace('open'), faceShut = paintFace('shut'), faceBeam = paintFace('beam');
    var mFace = std({ map: faceOpen, roughness: 0.55, emissive: 0xffffff, emissiveMap: faceOpen, emissiveIntensity: 0.14 });
    var headMesh = mesh(headGeo, mFace, head);
    [-1, 1].forEach(function (s) {                                       // (her ears, mostly under her hair)
      var ear = new THREE.SphereGeometry(1, 16, 12); ear.scale(0.008, 0.023, 0.015); var em = mesh(ear, mLid, head, s * 0.068, HC.y - 0.004, HC.z - 0.012); em.rotation.y = s * 0.35;
    });

    // ---- her hair: long, wavy and chestnut, with a middle part ----
    function strandPaint(g, W, H, tips) {
      g.fillStyle = '#5a3824'; g.fillRect(0, 0, W, H);
      for (var i = 0; i < 2600; i++) {
        var x = Math.random() * W, c = Math.random(), wv = 2 + Math.random() * 4, ph = Math.random() * 6;
        g.strokeStyle = c < 0.35 ? 'rgba(38,22,14,' + (0.3 + Math.random() * 0.4) + ')' : c < 0.8 ? 'rgba(122,80,50,' + (0.25 + Math.random() * 0.35) + ')' : 'rgba(176,124,82,' + (0.2 + Math.random() * 0.3) + ')';
        g.lineWidth = 0.8 + Math.random() * 1.8; g.beginPath(); g.moveTo(x, 0);
        for (var y = 0; y <= H; y += 32) g.lineTo(x + Math.sin(y / H * 12 + ph) * wv, y);
        g.stroke();
      }
    }
    var hairTex = tex(512, 1024, function (g, W, H) { strandPaint(g, W, H); }, [3, 1]);
    var hairAlpha = tex(512, 1024, function (g, W, H) {                // (where the hair is: solid down to the ends, which thin out into separate strands)
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.fillRect(0, 0, W, H * 0.7);
      for (var i = 0; i < 900; i++) { var x = Math.random() * W, len = H * (0.72 + Math.pow(Math.random(), 0.7) * 0.27), wd = 1 + Math.random() * 3; g.fillRect(x, H * 0.6, wd, len - H * 0.6); }
    }, [3, 1], false);
    var lockAlpha = tex(256, 1024, function (g, W, H) {                // (a lock's strands: full in the middle, thinning out to wisps at its edges and ends)
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff';
      for (var i = 0; i < 700; i++) { var u = Math.random(), x = u * W, keep = Math.sin(u * Math.PI); if (Math.random() > keep * 1.4) continue; var len = H * (0.6 + keep * 0.35 + Math.random() * 0.08); g.fillRect(x, 0, 1 + Math.random() * 2.5, len); }
    }, [1, 1], false);
    var lockTex = tex(256, 1024, function (g, W, H) { strandPaint(g, W, H); });
    var mLock = std({ map: lockTex, alphaMap: lockAlpha, alphaTest: 0.5, roughness: 0.45, side: THREE.DoubleSide, bumpMap: lockTex, bumpScale: 0.002 });
    var capTex = tex(1024, 512, function (g, W, H) { strandPaint(g, W, H); }, [2, 1]);
    var mHair = std({ map: hairTex, alphaMap: hairAlpha, alphaTest: 0.5, roughness: 0.45, side: THREE.DoubleSide, bumpMap: hairTex, bumpScale: 0.002 });
    var mCap = std({ map: capTex, roughness: 0.45, bumpMap: capTex, bumpScale: 0.002 });
    function hairline(x, y, z) { var ph = Math.abs(Math.atan2(x, z)); return 0.48 - 0.16 * ss(0.15, 0.85, ph) - 0.5 * ss(0.85, 1.75, ph) - 0.26 * ss(1.75, 3, ph); }   // (how far down her hair comes: high at her forehead, over her ears, low at her nape)
    var capGeo = new THREE.SphereGeometry(1, 72, 48), cp = capGeo.attributes.position;
    for (q = 0; q < cp.count; q++) {
      var cx2 = cp.getX(q), cy2 = cp.getY(q), cz2 = cp.getZ(q), P2 = skull(cx2, cy2, cz2), line = hairline(cx2, cy2, cz2);
      var k = 0.94 + 0.13 * ss(line - 0.11, line + 0.03, cy2) + 0.02 * Math.max(0, cy2);   // (inside her head below the hairline, so it doesn't show)
      if (cz2 > 0 && cy2 > 0.6) k -= 0.012 * gs(cx2 / 0.05);             // (her parting)
      cp.setXYZ(q, P2.x * k + HC.x, P2.y * k + HC.y, P2.z * k + HC.z);
    }
    capGeo.computeVertexNormals(); mesh(capGeo, mCap, head);
    // (her long hair: sheets of strands that lie over her head from beneath the hat, then fall, waving, down her back,
    // keeping clear of her shoulders, back and arms; and two locks in front of her shoulders)
    function torsoR(y, dx, dz) {                                        // (how far out her body comes at height y, in direction dx, dz)
      var a = TORSO[0], b = TORSO[TORSO.length - 1];
      for (var i = 0; i < TORSO.length - 1; i++) if (y >= TORSO[i][0] && y <= TORSO[i + 1][0]) { a = TORSO[i]; b = TORSO[i + 1]; }
      if (y < TORSO[0][0]) b = a; if (y > TORSO[TORSO.length - 1][0]) a = b;
      var t = b[0] === a[0] ? 0 : (y - a[0]) / (b[0] - a[0]), rx = a[1] + (b[1] - a[1]) * t, rz = a[2] + (b[2] - a[2]) * t;
      return 1 / Math.sqrt(Math.pow(dx / rx, 2) + Math.pow(dz / rz, 2)) + (dz > 0 ? 0.03 * gs((y - 1.165) / 0.05) : 0);
    }
    function clearR(y, dx, dz, r0, m) {                                 // (out far enough to clear her body, neck and arms, at least r0)
      for (var r = r0; r < 0.45; r += 0.003) {
        var x = dx * r, z = dz * r;
        if (y < 1.47 && r < torsoR(Math.min(y, 1.36), dx, dz) + m) continue;
        if (y > 0.95 && y < 1.37 && (Math.hypot(x - 0.172, z + 0.006) < 0.056 + m || Math.hypot(x + 0.172, z + 0.006) < 0.056 + m)) continue;
        return r;
      }
      return r;
    }
    function hairSheet(phA, phB, cols, layer, drop, gather, toward) {
      var rows = 34, pos = [], uv = [], idx = [], hy = head.position.y;
      for (var c = 0; c <= cols; c++) {
        var s = c / cols, ph = phA + (phB - phA) * s, th0 = 0.85, th1 = 1.9;
        for (var r = 0; r <= rows; r++) {
          var t = r / rows, p;
          if (t < 0.35) {                                                  // (over her head, just above the cap)
            var th = th0 + (th1 - th0) * (t / 0.35), kk = 1.075 + layer;
            p = V(Math.sin(th) * Math.sin(ph) * HR.x * kk, Math.cos(th) * HR.y * kk, -Math.sin(th) * Math.cos(ph) * HR.z * kk * 1.06).add(HC);
          } else {                                                          // (then falling)
            var e = V(Math.sin(th1) * Math.sin(ph) * HR.x * (1.075 + layer), Math.cos(th1) * HR.y * (1.075 + layer), -Math.sin(th1) * Math.cos(ph) * HR.z * (1.075 + layer) * 1.06).add(HC);
            var u2 = (t - 0.35) / 0.65, y = e.y - drop * (1 + 0.06 * Math.sin(ph * 7)) * u2;
            var gp = ph + ((toward || 0) - ph) * gather * ss(0, 0.5, u2), dx = Math.sin(gp), dz = -Math.cos(gp);   // (drawing together a little as it falls)
            var r0 = Math.hypot(e.x, e.z + head.position.z);
            var need = clearR(hy + y, dx, dz, 0.02, 0.016 + layer);
            var rr = Math.max(r0 * (1 - ss(0, 0.4, u2)) + need * ss(0, 0.4, u2), need) + 0.007 * Math.sin((hy + y) * 42 + ph * 5) * ss(0.05, 0.4, u2) + layer * 0.5;
            p = V(dx * rr, y, dz * rr - head.position.z);
          }
          pos.push(p.x, p.y, p.z); uv.push(s, 1 - t);
        }
      }
      for (c = 0; c < cols; c++) for (r = 0; r < rows; r++) { var A = c * (rows + 1) + r; idx.push(A, A + rows + 1, A + 1, A + 1, A + rows + 1, A + rows + 2); }
      var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      return g;
    }
    var hairLong = group(head);
    mesh(hairSheet(-1.5, 1.5, 40, 0, 0.42, 0.42), mHair, hairLong);      // (down her back...)
    mesh(hairSheet(-1.35, 1.35, 40, 0.014, 0.4, 0.4), mHair, hairLong);
    [-1, 1].forEach(function (s) { mesh(hairSheet(s * 1.68, s * 2.1, 16, 0.004, 0.24, 0.7, s * 2.3), mLock, hairLong); mesh(hairSheet(s * 1.58, s * 1.95, 12, 0.011, 0.26, 0.7, s * 2.2), mLock, hairLong); });   // (...and softer locks framing her face, falling in front of her shoulders)   // (...and softer locks framing her face, down to her shoulders)   // (...and a lock in front of each shoulder)

    // ---- her hat: soft felt, with a gently bent tip ----
    var feltTex = tex(256, 256, function (g, W, H) { g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); specks(g, W, H, 3000, '0,0,0', 0.04, 0.12, 0.3, 1.2); specks(g, W, H, 1500, '255,255,255', 0.04, 0.1, 0.3, 1); }, [4, 4], false);
    var mFelt = std({ color: 0x2a2230, roughness: 0.92, bumpMap: feltTex, bumpScale: 0.004, side: THREE.DoubleSide });
    var mBand = std({ color: 0x6b3f78, roughness: 0.35 });
    var hat = group(head, 0, HC.y + 0.052, HC.z - 0.012); hat.rotation.set(-0.16, 0, 0.05);
    var brimPos = [], brimUV = [], brimIdx = [], BS = 72, BR = 12;
    for (var bi = 0; bi <= BR; bi++) for (var bj = 0; bj <= BS; bj++) {
      var br = 0.083 + 0.172 * bi / BR, ba = bj / BS * Math.PI * 2, bt = (br - 0.083) / 0.172;
      brimPos.push(Math.sin(ba) * br, -0.008 * bt + 0.02 * ss(0.75, 1, bt) + 0.008 * Math.sin(ba * 3 + 0.4) * bt * bt, Math.cos(ba) * br * 1.04); brimUV.push(bj / BS * 4, bt);
    }
    for (bi = 0; bi < BR; bi++) for (bj = 0; bj < BS; bj++) { var bA = bi * (BS + 1) + bj; brimIdx.push(bA, bA + 1, bA + BS + 2, bA, bA + BS + 2, bA + BS + 1); }
    var brimGeo = new THREE.BufferGeometry(); brimGeo.setAttribute('position', new THREE.Float32BufferAttribute(brimPos, 3)); brimGeo.setAttribute('uv', new THREE.Float32BufferAttribute(brimUV, 2)); brimGeo.setIndex(brimIdx); brimGeo.computeVertexNormals();
    mesh(brimGeo, mFelt, hat);
    var edge = new THREE.TorusGeometry(0.255, 0.003, 6, 96); edge.rotateX(Math.PI / 2); edge.scale(1, 1, 1.04);
    var ep = edge.attributes.position; for (q = 0; q < ep.count; q++) { var ea = Math.atan2(ep.getX(q), ep.getZ(q)); ep.setY(q, ep.getY(q) - 0.008 + 0.02 + 0.008 * Math.sin(ea * 3 + 0.4)); } edge.computeVertexNormals(); mesh(edge, mFelt, hat);   // (a rolled edge)
    function dents(p, a, v) { var k = 0.06 * Math.sin(a * 3 + v * 5) * Math.sin(v * 9 + a); p.x *= 1 + k * 0.2; p.z *= 1 + k * 0.2; }
    mesh(loft([[0, 0.087, 0.094], [0.05, 0.079, 0.085, 0, -0.002], [0.1, 0.067, 0.071, 0, -0.006], [0.15, 0.053, 0.056, 0, -0.012], [0.19, 0.04, 0.042, 0, -0.018]], 40, 4, dents), mFelt, hat);   // (the crown...)
    var tip = group(hat, 0, 0.19, -0.018); tip.rotation.x = -0.32;
    mesh(loft([[0, 0.04, 0.042], [0.04, 0.029, 0.031, 0, -0.008], [0.08, 0.017, 0.018, 0, -0.026], [0.11, 0.007, 0.008, 0, -0.048], [0.128, 0.001, 0.001, 0, -0.064]], 28, 4, dents), mFelt, tip);   // (...bending back at its tip)
    mesh(loft([[0.006, 0.0885, 0.0955], [0.036, 0.0835, 0.0905, 0, -0.001]], 40, 2), mBand, hat);   // (the satin band...)
    var hb2 = group(hat, 0, 0.021, 0.093);                             // (...its brass buckle...)
    [[0, 0.012, 0.03, 0.004], [0, -0.012, 0.03, 0.004], [0.013, 0, 0.004, 0.028], [-0.013, 0, 0.004, 0.028]].forEach(function (p) { mesh(new THREE.BoxGeometry(p[2], p[3], 0.004), mBrass, hb2, p[0], p[1], 0.002); });
    var rose = group(hat, 0.066, 0.024, 0.062); rose.rotation.y = 0.85; rose.scale.setScalar(1.15);   // (...and an orange rose)
    var mPetal = std({ color: 0xe0782e, roughness: 0.6, side: THREE.DoubleSide }), mPetal2 = std({ color: 0xf09a4a, roughness: 0.6, side: THREE.DoubleSide }), mLeaf = std({ color: 0x2f4a2a, roughness: 0.6, side: THREE.DoubleSide });
    for (var pt = 0; pt < 13; pt++) {
      var pa = pt * 2.4, prr = 0.003 + pt * 0.0018, petal = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI, 0, Math.PI);
      petal.scale(0.008 + pt * 0.0009, 0.0075 + pt * 0.0007, 0.004); petal.rotateX(-0.5 - pt * 0.06); petal.rotateZ(pa); petal.translate(Math.cos(pa) * prr, Math.sin(pa) * prr, 0.009 - pt * 0.0008);
      mesh(petal, pt < 5 ? mPetal2 : mPetal, rose);
    }
    [0.9, 3.0].forEach(function (a) { var lf = new THREE.SphereGeometry(1, 10, 6); lf.scale(0.018, 0.008, 0.002); lf.translate(0.024, 0, -0.004); lf.rotateZ(a); mesh(lf, mLeaf, rose); });

    // ---- every time she's drawn: her joints follow the chibi witch's ----
    var tmp = V(0, 0, 0), tmp2 = V(0, 0, 0), wasShut = null;
    function legAt(k, y) {                                              // (where the middle of this leg is at height y, for the skirt, and how thick it is there)
      var leg = legs[k], hip = leg.position, knee = V(0, -0.38, 0).applyEuler(leg.rotation).add(hip);
      var ankle = V(0, -0.36, 0).applyEuler(shins[k].rotation).applyEuler(leg.rotation).add(knee);
      if (y >= knee.y) { var t = (hip.y - y) / Math.max(0.01, hip.y - knee.y); return [hip.x + (knee.x - hip.x) * t, hip.z + (knee.z - hip.z) * t, 0.072 - 0.025 * t]; }
      var t2 = Math.min(1, (knee.y - y) / Math.max(0.01, knee.y - ankle.y)); return [knee.x + (ankle.x - knee.x) * t2, knee.z + (ankle.z - knee.z) * t2, 0.05];
    }
    function skirtFollow() {
      var p = skirtGeo.attributes.position, a = p.array, rest = skirtRest, legsNow = [];
      for (var i = 0; i < p.count; i++) {
        var x = rest[i * 3], y = rest[i * 3 + 1], z = rest[i * 3 + 2], r0 = Math.hypot(x, z), k = 1;
        if (y < 0.93 && r0 > 0.001) {
          var dx = x / r0, dz = z / r0;
          for (var l = 0; l < 2; l++) {
            var c = legAt(l, y), proj = c[0] * dx + c[1] * dz, perp = Math.abs(c[0] * dz - c[1] * dx), lr = c[2] + 0.016;
            if (perp < lr) { var need = proj + Math.sqrt(lr * lr - perp * perp); if (need > r0 * k) k = need / r0; }
          }
        }
        a[i * 3] = x * k; a[i * 3 + 1] = y; a[i * 3 + 2] = z * k;
      }
      p.needsUpdate = true; skirtGeo.computeVertexNormals();
    }
    function follow() {
      R.position.y = (flying || inBoat) ? 0.37 - HIP : 0;              // (sitting on her broom or in the boat: her hips where the chibi's seat was)
      for (var k = 0; k < 2; k++) { legs[k].rotation.copy(w.legs[k].rotation); shins[k].rotation.x = w.legs[k].userData.shin.rotation.x; }
      [[armL, w.armL], [armR, w.armR]].forEach(function (p) { p[0].rotation.copy(p[1].rotation); p[0].userData.elbow.rotation.x = -(0.12 + 0.4 * Math.max(0, -p[1].rotation.x)); });
      armR.visible = w.armR.visible;
      toolArm.userData.elbow.rotation.x = -0.05;
      head.rotation.copy(w.head.rotation);
      hairLong.rotation.x = Math.max(-0.02, w.hairBack.rotation.x * 0.6);
      tip.rotation.z = w.tip.rotation.z;
      var look = w.mFace.map === w.faces[2] ? faceBeam : w.mFace.map === w.faces[1] ? faceShut : faceOpen;   // (blinking, and smiling with her eyes closed, just as the chibi does)
      if (look !== wasShut) { wasShut = look; mFace.map = mFace.emissiveMap = look; mFace.needsUpdate = true; }
      skirtFollow();
      axeArm.position.set(-0.172, 1.305 + R.position.y + chibi.position.y, -0.006);   // (your tools in her right hand, at her shoulder)
    }
    function handsToChibi() {                                           // (the chibi's hidden hands kept where hers are, for anything held in them, like the title screen's wand)
      [[w.armL, armL], [w.armR, armR]].forEach(function (p) {
        p[1].userData.hand.localToWorld(tmp.set(0, -0.05, 0)); chibi.worldToLocal(tmp);
        p[0].position.copy(tmp).sub(tmp2.set(0, -0.3, 0.02).applyEuler(p[0].rotation));
      });
    }
    R.updateMatrixWorld = function (force) { follow(); THREE.Object3D.prototype.updateMatrixWorld.call(this, force); handsToChibi(); };
    return { root: R, head: head, legs: legs, arms: [armL, armR] };
  })();
});
