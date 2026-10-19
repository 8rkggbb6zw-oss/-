// Everdawn, part 4 of 4 (see the note at the top of script.js). script3.js grew past CodePen's 1 MB limit too, so the
// game carries on here, and this file joins all four parts back together and starts it

EVERDAWN_PARTS.push(function (THREE) {
  // ---------- Your barn: Oak & Ember's second building ----------
  // For 3,000 Star Coins, Oak & Ember builds you a big red gambrel barn, placed with the same grid of your farm as the
  // coop (it takes 8 × 7 tiles). Every animal that isn't a coop bird lives here now, never at Fluff & Feather: up to
  // four, one to a stall. Inside, its four stalls are laid out just like Fluff & Feather's (only turned to run along
  // the back wall), so every animal behaves exactly as it always has; down the middle of the barn is a feeding bench
  // with eight spots for hay, and each hungry animal walks out of its stall to eat a bundle by itself
  var FBARN_STALL0 = 7, FBARN_CAP = 4;
  var FBARN_KINDS = ['moon', 'aurora', 'zephyra', 'luna', 'bubble', 'prism', 'lotus', 'axo', 'liz', 'tort', 'bison', 'crab'];
  var FBARN_NAMES = { moon: 'Mooncalf', aurora: 'Auroraram', zephyra: 'Zephyra', luna: 'Lunastra', bubble: 'Sirenna', prism: 'Prismara', lotus: 'Nymphalia', axo: 'Veilaris', liz: 'Lumora', tort: 'Amarys', bison: 'Nyxalia', crab: 'Iridelle' };
  var FBARN_FC = 8, FBARN_FR = 7, FBARN_BW = 9.4, FBARN_BD = 7.2, FBARN_WALL = 3.0, FBARN_OFF = 0.7;   // tiles it takes; its walls' width, depth and height; how far back of its patch it sits
  var FBARN_DZ = 4 - FBARN_BD / 2;                                     // (the stalls' frame: Fluff & Feather's stalls, turned a quarter so they run along the back wall)
  for (var fbs = 0; fbs < FBARN_CAP; fbs++) GLIM_STALLS[FBARN_STALL0 + fbs] = -3.3 + fbs * 2.2;
  var FBARN_SLOT_X = []; for (var fbx = 0; fbx < 8; fbx++) FBARN_SLOT_X.push(-2.45 + fbx * 0.7);
  var fbarn = { built: false, c: 0, r: 0, fx: 0, fz: 0, x: 0, z: 0, fy: 0, hay: [false, false, false, false, false, false, false, false], res: [], grass: [], solids: [], tp: null, start: 0, stage: -1 };
  var fbarnDoor = { x: 1e6, z: 1e6 }, fbarnGroup = null, fbarnGlows = [], inFbarn = false;
  var FBARN_SPEC = { title: '🐮 Where should your barn go?', hint: 'Tap your farm to choose a spot. The barn takes 8 × 7 tiles, with its big doors facing south (down the map) to start.' + PLACE_HINT_END, fc: FBARN_FC, fr: FBARN_FR, bw: FBARN_BW, bd: FBARN_BD, off: FBARN_OFF, door: 3.0, roof: 'rgba(100,96,92,0.88)', doorCol: '#b84a3c', emoji: '🐮', ridgeZ: true, cost: FBARN_COST,
    built: function () { return fbarn.built; }, build: function (c, r, rot) { fbarn.hay = [false, false, false, false, false, false, false, false]; fbarn.res = []; fbarnPlace(c, r, farmDay(), rot); fbarnHayShow(); },
    done: function () { return '🐮 Oak & Ember have started building your barn! It takes two days: it\'ll be finished on the morning of ' + seasonDay(fbarn.start + SITE_DAYS) + '.'; } };
  function fbarnFront(d) { var f = bOff(fbarn, 0, FBARN_BD / 2 + d); return { x: fbarn.x + f.x, z: fbarn.z + f.z }; }
  function fbarnCovers(x, z, r) { return fbarn.built && Math.abs(x - fbarn.fx) < bFC(fbarn, FBARN_FC, FBARN_FR) * TILE / 2 + r && Math.abs(z - fbarn.fz) < bFR(fbarn, FBARN_FC, FBARN_FR) * TILE / 2 + r; }
  var fbarnBaseSoilNear = soilNear;                                    // (nothing grows back under the barn either)
  soilNear = function (x, z, r) { return fbarnBaseSoilNear(x, z, r) || fbarnCovers(x, z, r); };
  function fbarnFreeStall() { for (var s = FBARN_STALL0; s < FBARN_STALL0 + FBARN_CAP; s++) if (!glimmers.some(function (g) { return g.stall === s; })) return s; return -1; }
  function fbarnAnimals() { return glimmers.filter(function (g) { return g.stall >= FBARN_STALL0; }); }
  function fbarnKindCost(kind) { return { moon: MOON_COST, aurora: AURORA_COST, zephyra: ZEPHYRA_COST, luna: LUNA_COST, bubble: BUBBLE_COST, prism: PRISM_COST, lotus: LOTUS_COST, axo: AXO_COST, liz: LIZ_COST, tort: TORT_COST, bison: BIS_COST, crab: CRB_COST }[kind]; }
  function fbarnToRoom(x, z) { return [-z, x + FBARN_DZ]; }            // (from the stalls' frame to the barn's room, and back)
  function fbarnToFrame(x, z) { return [z - FBARN_DZ, -x]; }
  function glimHome(g) { return g.stall >= FBARN_STALL0 ? 2 : g.stall >= COOP_STALL0 ? 1 : 0; }   // 0: a stall at Fluff & Feather, 1: your coop, 2: your barn

  // ===== what it's made of =====
  var FBG = [[-4.7, 0], [4.7, 0], [4.7, 3.0], [2.9, 4.5], [0, 5.35], [-2.9, 4.5], [-4.7, 3.0]];   // (the outline of its gambrel end walls)
  function fbarnTop(x) { var a = Math.abs(x); return a > 2.9 ? 3.0 + (4.7 - a) / 1.8 * 1.5 : 4.5 + (2.9 - a) / 2.9 * 0.85; }
  function fbarnWall(parent, pts, holes, door, mat, x, z, ry) {        // (one wall: boards in any outline, with holes for windows and a notch for a door)
    var s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    if (door) { s.lineTo(door[0], 0); s.lineTo(door[0], door[2]); s.lineTo(door[1], door[2]); s.lineTo(door[1], 0); }
    for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    holes.forEach(function (o) { var p = new THREE.Path(); p.moveTo(o[0], o[2]); p.lineTo(o[1], o[2]); p.lineTo(o[1], o[3]); p.lineTo(o[0], o[3]); p.closePath(); s.holes.push(p); });
    var geo = new THREE.ExtrudeGeometry(s, { depth: 0.14, bevelEnabled: false }); geo.translate(0, 0, -0.07);
    var m = new THREE.Mesh(geo, mat); m.position.set(x, 0, z); m.rotation.y = ry; m.castShadow = m.receiveShadow = true; parent.add(m); return m;
  }
  var fbmRed = new THREE.MeshStandardMaterial({ map: coopBoardTex, color: 0xb84a3c, roughness: 0.85 });
  var fbmRedDark = new THREE.MeshStandardMaterial({ color: 0x9a3a30, roughness: 0.8 });
  var fbmDoor = new THREE.MeshStandardMaterial({ map: coopBoardTex, color: 0xa84236, roughness: 0.8 });
  var fbmBoardIn = new THREE.MeshStandardMaterial({ map: coopBoardTex, color: 0xd8b48a, roughness: 0.85 });
  var fbmShake = new THREE.MeshStandardMaterial({ map: coopShakeTex, roughness: 0.9 });
  var fbmWater = new THREE.MeshStandardMaterial({ color: 0x6a9ab0, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.85 });
  var fbmChurn = new THREE.MeshStandardMaterial({ color: 0xc8ced4, metalness: 0.65, roughness: 0.3 });
  var fbQuiltTex = cpTex(256, 256, function (g, w, h) {               // (a barn quilt: a painted eight-pointed star, block by block)
    g.fillStyle = '#fbf3e4'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ffffff'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14);
    var cx = w / 2, cy = h / 2, cols = ['#e889b0', '#b89ae8', '#f2c25a', '#8cc8a8'];
    for (var k = 0; k < 8; k++) { var a = k / 8 * Math.PI * 2; g.fillStyle = cols[k % 4]; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * 104, cy + Math.sin(a) * 104); g.lineTo(cx + Math.cos(a + Math.PI / 8) * 54, cy + Math.sin(a + Math.PI / 8) * 54); g.closePath(); g.fill(); g.fillStyle = cols[(k + 2) % 4]; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a + Math.PI / 8) * 54, cy + Math.sin(a + Math.PI / 8) * 54); g.lineTo(cx + Math.cos(a + Math.PI / 4) * 104, cy + Math.sin(a + Math.PI / 4) * 104); g.closePath(); g.fill(); }
    g.fillStyle = '#fbf3e4'; g.beginPath(); g.arc(cx, cy, 20, 0, Math.PI * 2); g.fill(); g.fillStyle = '#e889b0'; g.beginPath(); g.arc(cx, cy, 11, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(120,80,60,0.25)'; g.lineWidth = 1; for (var q = 1; q < 4; q++) { g.beginPath(); g.moveTo(q * w / 4, 14); g.lineTo(q * w / 4, h - 14); g.stroke(); g.beginPath(); g.moveTo(14, q * h / 4); g.lineTo(w - 14, q * h / 4); g.stroke(); }
  });
  var fbFloorTex = cpTex(512, 512, function (g, w, h) {               // (wide floorboards, worn pale down the middle)
    var n = 7, ph = h / n;
    for (var i = 0; i < n; i++) {
      var b = 128 + Math.random() * 34; g.fillStyle = 'rgb(' + Math.round(b) + ',' + Math.round(b * 0.74) + ',' + Math.round(b * 0.48) + ')'; g.fillRect(0, i * ph, w, ph);
      for (var s = 0; s < 50; s++) { var y = i * ph + Math.random() * ph; g.strokeStyle = 'rgba(70,45,25,' + (0.08 + Math.random() * 0.15) + ')'; g.lineWidth = 0.8 + Math.random(); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * 0.3, y + (Math.random() - 0.5) * 6, w * 0.6, y + (Math.random() - 0.5) * 6, w, y); g.stroke(); }
      g.fillStyle = 'rgba(40,25,12,0.6)'; g.fillRect(0, i * ph, w, 2); var j = Math.random() * w; g.fillRect(j, i * ph, 2, ph);
      g.fillStyle = 'rgba(30,20,10,0.6)'; [j - 7, j + 7].forEach(function (nx) { g.beginPath(); g.arc(nx, i * ph + ph * 0.3, 2, 0, Math.PI * 2); g.arc(nx, i * ph + ph * 0.7, 2, 0, Math.PI * 2); g.fill(); });
    }
    var wear = g.createLinearGradient(0, 0, 0, h); wear.addColorStop(0, 'rgba(255,240,210,0)'); wear.addColorStop(0.5, 'rgba(255,240,210,0.12)'); wear.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = wear; g.fillRect(0, 0, w, h);
  }, [3, 2.5]);
  function fbarnShakeRoof(G, A, B, len, list, s, row0) {               // (one slope of the roof: boards from A up to B, covered in rows of shakes)
    var ux = B[0] - A[0], uy = B[1] - A[1], L = Math.hypot(ux, uy); ux /= L; uy /= L;
    var nx = s > 0 ? uy : -uy, ny = s > 0 ? -ux : ux, ang = Math.atan2(uy, ux);
    cpPart(new THREE.BoxGeometry(L, 0.08, len), new THREE.MeshStandardMaterial({ color: 0x4a3a30, roughness: 0.9 }), (A[0] + B[0]) / 2 + nx * 0.05, (A[1] + B[1]) / 2 + ny * 0.05, 0, 0, 0, ang, G);
    for (var r = 0, d = 0.02; d < L - 0.08; d += 0.19, r++) {
      var off = 0.105 + (r % 2) * 0.005, cx = A[0] + ux * (d + 0.15) + nx * off, cy = A[1] + uy * (d + 0.15) + ny * off;
      for (var z = -len / 2 + ((r + row0) % 2 ? 0.12 : 0), k = 0; z < len / 2 - 0.02; k++) {
        var sw = 0.17 + isle2Hash(r * 37 + k * 3.1 + s * 5 + row0) * 0.16, zw = Math.min(sw, len / 2 - z), tone = 0.62 + isle2Hash(r * 11 + k * 5.7 + s * 3 + row0) * 0.38, odd = isle2Hash(r * 7 + k * 13 + row0) < 0.1;
        var c = odd ? new THREE.Color(0.52, 0.42, 0.34).multiplyScalar(tone + 0.1) : new THREE.Color(0.44, 0.42, 0.41).multiplyScalar(tone);
        list.push([cx, cy, z + zw / 2, 0, 0, ang, 0.32, 0.022, zw - 0.014, c.getHex()]);
        z += zw;
      }
    }
    return { ux: ux, uy: uy, nx: nx, ny: ny, L: L, ang: ang };
  }
  function fbarnWindow(G, x, y, z, ry, w, h, box) {                    // (a barn window from outside: six panes in a white frame, a sill, and maybe a flower box)
    var g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; G.add(g);
    cpPart(new THREE.PlaneGeometry(w, h), cpmGlowWin, 0, 0, 0, 0, 0, 0, g).castShadow = false;
    [[0, h / 2 + 0.06, w + 0.3, 0.12], [w / 2 + 0.06, 0, 0.12, h + 0.02], [-w / 2 - 0.06, 0, 0.12, h + 0.02], [w / 2 + 0.17, h / 2 + 0.11, 0.08, 0.04], [-w / 2 - 0.17, h / 2 + 0.11, 0.08, 0.04]].forEach(function (f) { cpPart(new THREE.BoxGeometry(f[2], f[3], 0.07), cpmCream, f[0], f[1], 0.02, 0, 0, 0, g); });
    cpPart(new THREE.BoxGeometry(0.035, h, 0.04), cpmCream, 0, 0, 0.02, 0, 0, 0, g); [-h / 6, h / 6].forEach(function (yy) { cpPart(new THREE.BoxGeometry(w, 0.03, 0.04), cpmCream, 0, yy, 0.02, 0, 0, 0, g); });
    cpPart(new THREE.BoxGeometry(w + 0.34, 0.06, 0.16), cpmCream, 0, -h / 2 - 0.06, 0.06, 0, 0, 0, g);
    if (box) cpFlowerBox(g, w, -h / 2 - 0.24, 0.16);
    return g;
  }
  function fbarnGooseneck(G, x, y, z, glows) {                          // (a gooseneck barn lamp: a curved arm out from the wall and an enamel shade)
    var g = new THREE.Group(); g.position.set(x, y, z); G.add(g);
    var arm = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.15, 0), new THREE.Vector3(0, 0.12, 0.05), new THREE.Vector3(0, 0.24, 0.25), new THREE.Vector3(0, 0.18, 0.45), new THREE.Vector3(0, 0.08, 0.5)]);
    cpPart(new THREE.TubeGeometry(arm, 20, 0.018, 6), fbmRedDark, 0, 0, 0, 0, 0, 0, g); cpPart(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 12), fbmRedDark, 0, -0.15, 0.0, Math.PI / 2, 0, 0, g);
    cpPart(new THREE.CylinderGeometry(0.04, 0.2, 0.14, 18, 1, true), new THREE.MeshStandardMaterial({ color: 0x3a5a48, roughness: 0.4, metalness: 0.4, side: THREE.DoubleSide }), 0, 0.02, 0.5, 0, 0, 0, g);
    var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe0a0 })); bulb.position.set(0, -0.03, 0.5); g.add(bulb);
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: 0xffc070, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.set(1.1, 1.1, 1); halo.position.set(0, -0.05, 0.5); g.add(halo);
    glows.push({ f: bulb, h: halo, p: Math.random() * 9 });
    return g;
  }
  function fbarnChurn(parent, x, y, z) {                                // (a tall milk churn)
    var pts = [[0.001, 0], [0.16, 0], [0.17, 0.02], [0.17, 0.42], [0.13, 0.5], [0.09, 0.56], [0.09, 0.62], [0.11, 0.64], [0.001, 0.66]].map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    var g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
    cpPart(new THREE.LatheGeometry(pts, 22), fbmChurn, 0, 0, 0, 0, 0, 0, g);
    [0.08, 0.38].forEach(function (yy) { cpPart(new THREE.TorusGeometry(0.172, 0.012, 6, 24), fbmChurn, 0, yy, 0, Math.PI / 2, 0, 0, g); });
    [-1, 1].forEach(function (s) { cpPart(new THREE.TorusGeometry(0.05, 0.01, 5, 12, Math.PI), cpmIron, s * 0.15, 0.5, 0, 0, Math.PI / 2, s * 0.6, g); });
    return g;
  }

  // ===== outside: built where you choose =====
  var FB_FRH = [[-3.75, -2.75, 1.2, 2.1], [2.75, 3.75, 1.2, 2.1], [-0.7, 0.7, 3.35, 4.45]], FB_DOOR = [-1.45, 1.45, 2.75];
  var FB_BKH = [[-2.6, -1.6, 1.2, 2.1], [1.6, 2.6, 1.2, 2.1], [-0.45, 0.45, 3.5, 4.2]];
  var FB_SH = [[-2.65, -1.75, 1.2, 2.1], [-0.45, 0.45, 1.2, 2.1], [1.75, 2.65, 1.2, 2.1]];
  var FB_SIDE = [[-FBARN_BD / 2 - 0.07, 0], [FBARN_BD / 2 + 0.07, 0], [FBARN_BD / 2 + 0.07, FBARN_WALL], [-FBARN_BD / 2 - 0.07, FBARN_WALL]];
  function fbarnBuildOutside() {
    var G = new THREE.Group(), W2 = FBARN_BW / 2, D2 = FBARN_BD / 2, H = FBARN_WALL; fbarnGlows = [];
    G.position.set(fbarn.x, fbarn.fy, fbarn.z); G.rotation.y = bRot(fbarn);
    function gy(lx, lz) { return bGround(fbarn, lx, lz) - fbarn.fy; }
    var minG = 99; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) minG = Math.min(minG, gy(gx * (W2 + 0.3), gz * (D2 + 0.3)));
    var fh = -minG + 0.35;
    // (a footing of rough fieldstones)
    cpPart(new THREE.BoxGeometry(FBARN_BW + 0.18, fh, FBARN_BD + 0.18), new THREE.MeshStandardMaterial({ color: 0x6e6a62, roughness: 1 }), 0, -fh / 2 - 0.02, 0, 0, 0, 0, G);
    var stones = [], n = 0;
    [[0, D2 + 0.12, FBARN_BW + 0.34, 0], [0, -D2 - 0.12, FBARN_BW + 0.34, 0], [W2 + 0.12, 0, FBARN_BD + 0.34, Math.PI / 2], [-W2 - 0.12, 0, FBARN_BD + 0.34, Math.PI / 2]].forEach(function (sd) {
      for (var row = 0, y = -0.12; y > -fh - 0.05; y -= 0.2, row++) for (var u = -sd[2] / 2 + (row % 2) * 0.19; u < sd[2] / 2; n++) {
        var sw = 0.26 + isle2Hash(n * 1.7 + 9) * 0.22, k = 0.4 + isle2Hash(n * 2.3 + 1) * 0.22, c = new THREE.Color().setRGB(k * 1.02, k * 0.97, k * 0.88), along = Math.min(u + sw / 2, sd[2] / 2 - 0.05);
        stones.push([sd[0] + (sd[3] ? 0 : along), y + (isle2Hash(n) - 0.5) * 0.02, sd[1] + (sd[3] ? along : 0), (isle2Hash(n * 3) - 0.5) * 0.08, sd[3] + (isle2Hash(n * 5) - 0.5) * 0.06, (isle2Hash(n * 7) - 0.5) * 0.08, sw - 0.025, 0.17 + isle2Hash(n * 9) * 0.04, 0.11 + isle2Hash(n * 11) * 0.06, c.getHex()]);
        u += sw;
      }
    });
    coopInst(G, new THREE.DodecahedronGeometry(0.5, 1), cpmFootStone, stones, true);
    // (the walls: barn-red boards with battens over the joins, gambrel ends front and back)
    fbarnWall(G, FBG, FB_FRH, FB_DOOR, fbmRed, 0, D2, 0);
    fbarnWall(G, FBG, FB_BKH, null, fbmRed, 0, -D2, Math.PI);
    fbarnWall(G, FB_SIDE, FB_SH, null, fbmRed, -W2, 0, -Math.PI / 2);
    fbarnWall(G, FB_SIDE, FB_SH, null, fbmRed, W2, 0, Math.PI / 2);
    coopStrips(G, FBARN_BW, 0, FB_FRH.concat([[1.6, 2.9, 3.3, 4.5]]), FB_DOOR, 0, D2, 0, 0.45, 0.07, 0.03, 0.085, fbmRedDark, 0.16, fbarnTop);
    coopStrips(G, FBARN_BW, 0, FB_BKH, null, 0, -D2, Math.PI, 0.45, 0.07, 0.03, 0.085, fbmRedDark, 0.16, fbarnTop);
    coopStrips(G, FBARN_BD, 0, FB_SH.concat([[2.6, 3.4, 0.1, 1.3]]), null, -W2, 0, -Math.PI / 2, 0.45, 0.07, 0.03, 0.085, fbmRedDark, 0.16, H - 0.06);
    coopStrips(G, FBARN_BD, 0, FB_SH, null, W2, 0, Math.PI / 2, 0.45, 0.07, 0.03, 0.085, fbmRedDark, 0.16, H - 0.06);
    [[0, D2 + 0.074, FBARN_BW, 0], [0, -D2 - 0.074, FBARN_BW, Math.PI], [-W2 - 0.074, 0, FBARN_BD + 0.1, -Math.PI / 2], [W2 + 0.074, 0, FBARN_BD + 0.1, Math.PI / 2]].forEach(function (b) { var gm = cpPart(new THREE.PlaneGeometry(b[2], 0.55), cpmGrime, b[0], 0.275, b[1], 0, b[3], 0, G); gm.castShadow = false; gm.receiveShadow = false; gm.renderOrder = 1; });
    // (crisp white trim: corner boards, a skirting board, boards under the eaves, and along the gambrel edges)
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cpPart(new THREE.BoxGeometry(0.2, H, 0.2), cpmCream, c[0] * (W2 + 0.05), H / 2, c[1] * (D2 + 0.05), 0, 0, 0, G); });
    [[0, D2 + 0.085, FBARN_BW, 0], [0, -D2 - 0.085, FBARN_BW, 0], [W2 + 0.085, 0, FBARN_BD, Math.PI / 2], [-W2 - 0.085, 0, FBARN_BD, Math.PI / 2]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], 0.16, 0.03), cpmCream, b[0], 0.08, b[1], 0, b[3], 0, G); });
    [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.05, 0.16, FBARN_BD + 0.2), cpmCream, s * (W2 + 0.09), H - 0.08, 0, 0, 0, 0, G); });
    [-1, 1].forEach(function (f) { for (var i = 2; i < 6; i++) { var a = FBG[i], b = FBG[i + 1]; var L = Math.hypot(b[0] - a[0], b[1] - a[1]); cpPart(new THREE.BoxGeometry(L + 0.06, 0.16, 0.04), cpmCream, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.08, f * (D2 + 0.095), 0, 0, Math.atan2(b[1] - a[1], b[0] - a[0]), G); } });
    // (the gambrel roof: steep lower slopes and shallow upper ones, all in weathered grey shakes, with a ridge cap and copper gutters)
    var len = FBARN_BD + 0.8, shakes = [], segs = [];
    [-1, 1].forEach(function (s) {
      var lo = fbarnShakeRoof(G, [s * (4.7 + 0.5 * 0.77), 3.0 - 0.5 * 0.64], [s * 2.86, 4.53], len, shakes, s, 0);
      var hi = fbarnShakeRoof(G, [s * 2.9, 4.5], [s * 0.02, 5.39], len, shakes, s, 1);
      segs.push(lo, hi);
      [-1, 1].forEach(function (f) {                                   // (white bargeboards along the roof's edges, front and back)
        [[[s * 5.08, 2.68], [s * 2.86, 4.53]], [[s * 2.9, 4.5], [0, 5.39]]].forEach(function (e) { var L = Math.hypot(e[1][0] - e[0][0], e[1][1] - e[0][1]); cpPart(new THREE.BoxGeometry(L, 0.22, 0.06), cpmCream, (e[0][0] + e[1][0]) / 2, (e[0][1] + e[1][1]) / 2 - 0.02, f * (len / 2 + 0.01), 0, 0, Math.atan2(e[1][1] - e[0][1], e[1][0] - e[0][0]), G); });
      });
      cpPart(new THREE.CylinderGeometry(0.075, 0.075, len - 0.1, 14, 1, true, -Math.PI / 2, Math.PI), cpmCopper, s * 5.13, 2.6, 0, Math.PI / 2, 0, 0, G);   // (a gutter along each eave)
      for (var rt = -D2; rt <= D2 + 0.01; rt += 0.6) cpPart(new THREE.BoxGeometry(0.42, 0.11, 0.07), new THREE.MeshStandardMaterial({ color: 0xf2ece0, roughness: 0.8 }), s * (W2 + 0.2), H - 0.12, rt, 0, 0, s * -0.69, G);   // (rafter tails)
    });
    coopInst(G, COOP_BOX, fbmShake, shakes, true);
    [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.24, 0.04, len + 0.04), new THREE.MeshStandardMaterial({ color: 0x3e3430, roughness: 0.85 }), s * 0.1, 5.5, 0, 0, 0, -s * 0.3, G); });
    // (a downpipe from the gutter into a rain barrel at the front corner)
    var bY = gy(4.85, D2 + 0.45);
    cpPart(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 10), cpmCopper, 5.02, 2.38, D2 + 0.4, 0, 0, 0.5, G);
    cpPart(new THREE.CylinderGeometry(0.04, 0.04, 2.2 - (bY + 0.82), 10), cpmCopper, 4.92, (2.2 + bY + 0.82) / 2, D2 + 0.45, 0, 0, 0, G);
    coopBarrel(G, 4.85, bY, D2 + 0.45, 0.28, 0.82, true);
    // (a big cupola on the ridge with louvred sides, and a crescent moon and star turning on the weathervane)
    var CU = new THREE.Group(); CU.position.set(0, 5.2, 0); G.add(CU);
    cpPart(new THREE.BoxGeometry(1.1, 0.7, 1.1), fbmRed, 0, 0.35, 0, 0, 0, 0, CU);
    [[0, 0.555], [0, -0.555], [0.555, 0], [-0.555, 0]].forEach(function (f) {
      var FG = new THREE.Group(); FG.position.set(f[0], 0.78, f[1]); FG.rotation.y = Math.atan2(f[0], f[1]); CU.add(FG);
      cpPart(new THREE.PlaneGeometry(0.8, 0.5), cpmDark, 0, 0, 0, 0, 0, 0, FG).castShadow = false;
      for (var l = 0; l < 6; l++) cpPart(new THREE.BoxGeometry(0.8, 0.06, 0.014), cpmCream, 0, -0.2 + l * 0.08, 0.025, -0.6, 0, 0, FG);
      cpPart(new THREE.BoxGeometry(0.92, 0.07, 0.04), cpmCream, 0, -0.29, 0.02, 0, 0, 0, FG); cpPart(new THREE.BoxGeometry(0.92, 0.07, 0.04), cpmCream, 0, 0.29, 0.02, 0, 0, 0, FG);
    });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cpPart(new THREE.BoxGeometry(0.1, 0.62, 0.1), cpmCream, c[0] * 0.52, 0.78, c[1] * 0.52, 0, 0, 0, CU); });
    cpPart(new THREE.BoxGeometry(1.26, 0.07, 1.26), cpmCream, 0, 1.1, 0, 0, 0, 0, CU);
    cpPart(new THREE.ConeGeometry(0.98, 0.7, 4, 1), new THREE.MeshStandardMaterial({ color: 0x55504c, roughness: 0.85 }), 0, 1.48, 0, 0, Math.PI / 4, 0, CU);
    cpPart(new THREE.SphereGeometry(0.06, 12, 8), cpmCopper, 0, 1.86, 0, 0, 0, 0, CU);
    var WV = new THREE.Group(); WV.position.set(0, 1.88, 0); CU.add(WV);
    cpPart(new THREE.CylinderGeometry(0.016, 0.02, 0.7, 8), cpmIron, 0, 0.35, 0, 0, 0, 0, WV);
    cpPart(new THREE.BoxGeometry(0.44, 0.014, 0.014), cpmIron, 0, 0.26, 0, 0, 0, 0, WV); cpPart(new THREE.BoxGeometry(0.014, 0.014, 0.44), cpmIron, 0, 0.26, 0, 0, 0, 0, WV);
    var spin = new THREE.Group(); spin.position.y = 0.66; WV.add(spin); G.userData.vane = spin;
    cpPart(new THREE.BoxGeometry(0.7, 0.02, 0.02), cpmIron, 0, 0, 0, 0, 0, 0, spin); cpPart(new THREE.ConeGeometry(0.045, 0.12, 6), cpmIron, 0.38, 0, 0, 0, 0, -Math.PI / 2, spin);
    var moon = new THREE.Shape(); moon.absarc(0, 0, 0.17, Math.PI * 0.3, Math.PI * 1.7, false); moon.absarc(0.08, 0, 0.13, Math.PI * 1.62, Math.PI * 0.38, true);
    var mg = new THREE.ExtrudeGeometry(moon, { depth: 0.016, bevelEnabled: false }); mg.translate(0, 0, -0.008); cpPart(mg, cpmCopper, -0.12, 0.2, 0, 0, 0, 0, spin);
    var star = new THREE.Shape(); for (var sp = 0; sp < 10; sp++) { var sa = sp / 10 * Math.PI * 2 - Math.PI / 2, sr = sp % 2 ? 0.035 : 0.085; if (sp) star.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr); else star.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr); } star.closePath();
    var sg2 = new THREE.ExtrudeGeometry(star, { depth: 0.016, bevelEnabled: false }); sg2.translate(0, 0, -0.008); cpPart(sg2, cpmCopper, 0.14, 0.24, 0, 0, 0, 0, spin);
    // (the big sliding doors: red boards with white frames and crossbucks, hung on rollers from an iron track)
    [-1, 1].forEach(function (s) {
      var D = new THREE.Group(); D.position.set(s * 0.74, 0, D2 + 0.1); G.add(D);
      for (var b = 0; b < 7; b++) cpPart(new THREE.BoxGeometry(0.2, 2.78, 0.05), fbmDoor, -0.615 + b * 0.205, 1.4, 0, 0, 0, 0, D);
      [[0, 2.72, 1.5, 0.13], [0, 0.07, 1.5, 0.13], [-0.69, 1.4, 0.12, 2.78], [0.69, 1.4, 0.12, 2.78], [0, 1.38, 1.5, 0.11]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], b[3], 0.04), cpmCream, b[0], b[1], 0.045, 0, 0, 0, D); });
      [[0.725, 1.18], [2.05, 1.2]].forEach(function (pn) { [1, -1].forEach(function (d) { cpPart(new THREE.BoxGeometry(0.09, Math.hypot(1.26, pn[1]) - 0.08, 0.035), cpmCream, 0, pn[0], 0.05, 0, 0, d * Math.atan2(1.26, pn[1]), D); }); });
      cpPart(new THREE.BoxGeometry(0.035, 0.42, 0.035), cpmIron, -s * 0.52, 1.35, 0.11, 0, 0, 0, D); [1.18, 1.52].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.03, 0.03, 0.08), cpmIron, -s * 0.52, y, 0.07, 0, 0, 0, D); });
      [-0.45, 0.45].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.06, 0.26, 0.02), cpmIron, x, 2.85, 0.04, 0, 0, 0, D); cpPart(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), cpmIron, x, 2.98, 0.07, Math.PI / 2, 0, 0, D); });
    });
    cpPart(new THREE.BoxGeometry(6.2, 0.08, 0.05), cpmIron, 0, 2.98, D2 + 0.14, 0, 0, 0, G);
    [-3.1, 3.1].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.06, 0.12, 0.08), cpmIron, x, 2.98, D2 + 0.16, 0, 0, 0, G); });
    cpPart(new THREE.BoxGeometry(6.4, 0.14, 0.22), cpmCream, 0, 3.12, D2 + 0.13, 0, 0, 0, G);
    // (the hayloft door above, hay poking out under it, a hay hood with a pulley beam, and a rope with a hook)
    var LD = new THREE.Group(); LD.position.set(0, 3.9, D2 + 0.09); G.add(LD);
    for (var lb = 0; lb < 6; lb++) cpPart(new THREE.BoxGeometry(0.225, 1.08, 0.05), fbmDoor, -0.5625 + lb * 0.225, 0, 0, 0, 0, 0, LD);
    [[0, 0.5, 1.4, 0.1], [0, -0.5, 1.4, 0.1], [-0.65, 0, 0.1, 1.08], [0.65, 0, 0.1, 1.08]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], b[3], 0.04), cpmCream, b[0], b[1], 0.04, 0, 0, 0, LD); });
    [1, -1].forEach(function (d) { cpPart(new THREE.BoxGeometry(0.08, 1.12, 0.03), cpmCream, 0, 0, 0.045, 0, 0, d * Math.atan2(1.2, 0.9), LD); });
    var strawM = new THREE.MeshStandardMaterial({ map: haySideTex, roughness: 1 }), wisps = [];
    for (var hw = 0; hw < 60; hw++) { var c2 = new THREE.Color().setHSL(0.11, 0.55, 0.5 + isle2Hash(hw * 3.3) * 0.25); wisps.push([(isle2Hash(hw) - 0.5) * 1.2, -0.56 + isle2Hash(hw * 2.1) * 0.03, 0.06 + isle2Hash(hw * 5) * 0.06, 0, Math.PI / 2 + (isle2Hash(hw * 7) - 0.5) * 1.2, Math.PI / 2 + 0.6 + isle2Hash(hw * 9) * 0.5, 1, 0.08 + isle2Hash(hw * 11) * 0.1, 1, c2.getHex()]); }
    coopInst(LD, new THREE.CylinderGeometry(0.004, 0.004, 1, 3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), wisps, true);
    cpPart(new THREE.BoxGeometry(0.16, 0.16, 1.25), new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.8 }), 0, 4.85, D2 + 0.55, 0, 0, 0, G);
    [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.62, 0.05, 1.32), new THREE.MeshStandardMaterial({ color: 0x55504c, roughness: 0.85 }), s * 0.26, 5.07, D2 + 0.58, 0, 0, -s * 0.55, G); });
    cpPart(new THREE.TorusGeometry(0.08, 0.02, 8, 18), cpmIron, 0, 4.72, D2 + 1.08, 0, Math.PI / 2, 0, G);
    cpPart(new THREE.CylinderGeometry(0.008, 0.008, 1.3, 5), new THREE.MeshStandardMaterial({ color: 0xc8a878, roughness: 0.9 }), 0.075, 4.05, D2 + 1.08, 0, 0, 0, G);
    cpPart(new THREE.TorusGeometry(0.05, 0.01, 6, 14, Math.PI * 1.4), cpmIron, 0.075, 3.36, D2 + 1.08, 0, 0, Math.PI * 0.8, G);
    // (a barn quilt hung diamond-wise on the gable, and two gooseneck lamps over the doors)
    cpPart(new THREE.BoxGeometry(0.84, 0.84, 0.04), cpmCream, 2.25, 3.9, D2 + 0.095, 0, 0, Math.PI / 4, G);
    cpPart(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshStandardMaterial({ map: fbQuiltTex, roughness: 0.8 }), 2.25, 3.9, D2 + 0.118, 0, 0, Math.PI / 4, G).castShadow = false;
    fbarnGooseneck(G, -1.85, 3.3, D2 + 0.09, fbarnGlows); fbarnGooseneck(G, 1.85, 3.3, D2 + 0.09, fbarnGlows);
    // (white-trimmed windows: flower boxes on the front ones)
    fbarnWindow(G, -3.25, 1.65, D2 + 0.08, 0, 1.0, 0.9, true); fbarnWindow(G, 3.25, 1.65, D2 + 0.08, 0, 1.0, 0.9, true);
    fbarnWindow(G, -2.1, 1.65, -D2 - 0.08, Math.PI, 1.0, 0.9, false); fbarnWindow(G, 2.1, 1.65, -D2 - 0.08, Math.PI, 1.0, 0.9, false); fbarnWindow(G, 0, 3.85, -D2 - 0.08, Math.PI, 0.9, 0.7, false);
    [-2.2, 0, 2.2].forEach(function (z) { fbarnWindow(G, -W2 - 0.08, 1.65, z, -Math.PI / 2, 0.9, 0.9, true); fbarnWindow(G, W2 + 0.08, 1.65, z, Math.PI / 2, 0.9, 0.9, true); });
    // (a wide plank ramp up to the doors, with side boards and cleats)
    var gyR = gy(0, D2 + 1.25), rl = Math.hypot(1.25, gyR), ra = Math.atan2(-gyR, 1.25);
    var RP = new THREE.Group(); RP.position.set(0, gyR / 2 - 0.02, D2 + 0.12 + 0.625); RP.rotation.x = ra; G.add(RP);
    for (var rb = 0; rb < 13; rb++) cpPart(new THREE.BoxGeometry(0.245, 0.07, rl), cpmPlank, -1.47 + rb * 0.245, 0, 0, 0, 0, 0, RP);
    for (var cl = -rl / 2 + 0.18; cl < rl / 2; cl += 0.24) cpPart(new THREE.BoxGeometry(2.9, 0.025, 0.04), cpmPlankDark, 0, 0.045, cl, 0, 0, 0, RP);
    [-1.66, 1.66].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.08, 0.14, rl), cpmPlankDark, x, 0.02, 0, 0, 0, 0, RP); });
    // (hay bales stacked by the doors with a pitchfork in them, a wooden water trough, milk churns, and a wagon wheel)
    [[-3.45, 0, 0], [-2.5, 0, 0.1], [-3.0, 1, -0.05]].forEach(function (hb) { var bale = pickupModel('hay'); bale.scale.setScalar(3.1); bale.position.set(hb[0], gy(hb[0], D2 + 0.8) + 0.265 + hb[1] * 0.53, D2 + 0.8); bale.rotation.y = hb[2]; bale.traverse(function (o) { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); G.add(bale); });
    var PF = new THREE.Group(); PF.position.set(-2.8, gy(-2.8, D2 + 0.8) + 0.9, D2 + 0.8); PF.rotation.set(0.15, 0.4, -0.35); G.add(PF);
    cpPart(new THREE.CylinderGeometry(0.016, 0.018, 1.3, 8), cpmBarrel, 0, 0.65, 0, 0, 0, 0, PF); cpPart(new THREE.BoxGeometry(0.16, 0.02, 0.02), cpmIron, 0, 0.0, 0, 0, 0, 0, PF);
    [-0.07, 0, 0.07].forEach(function (x) { cpPart(new THREE.CylinderGeometry(0.006, 0.003, 0.26, 5), cpmIron, x, -0.13, 0, 0, 0, 0, PF); });
    var TR = new THREE.Group(); TR.position.set(2.75, gy(2.75, D2 + 0.85), D2 + 0.85); G.add(TR);
    [[0, 0.06, 0, 1.4, 0.05, 0.5], [0, 0.3, 0.23, 1.4, 0.45, 0.05], [0, 0.3, -0.23, 1.4, 0.45, 0.05], [0.68, 0.3, 0, 0.05, 0.45, 0.5], [-0.68, 0.3, 0, 0.05, 0.45, 0.5]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[3], b[4], b[5]), cpmPlank, b[0], b[1], b[2], 0, 0, 0, TR); });
    [-0.55, 0.55].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.06, 0.48, 0.56), cpmIron, x, 0.3, 0, 0, 0, 0, TR).scale.set(1, 1, 1.02); });
    cpPart(new THREE.PlaneGeometry(1.3, 0.42), fbmWater, 0, 0.44, 0, -Math.PI / 2, 0, 0, TR).castShadow = false;
    fbarnChurn(G, 3.9, gy(3.9, D2 + 0.55), D2 + 0.55); fbarnChurn(G, 4.2, gy(4.2, D2 + 1.05), D2 + 1.05).rotation.y = 0.8;
    var WH = new THREE.Group(); WH.position.set(-W2 - 0.14, gy(-W2 - 0.14, 2.9) + 0.52, 2.9); WH.rotation.set(0, Math.PI / 2, 0.06); G.add(WH);
    cpPart(new THREE.TorusGeometry(0.48, 0.04, 6, 32), new THREE.MeshStandardMaterial({ color: 0x7a5236, roughness: 0.8 }), 0, 0, 0, 0, 0, 0, WH); cpPart(new THREE.TorusGeometry(0.5, 0.015, 5, 32), cpmIron, 0, 0, 0, 0, 0, 0, WH);
    cpPart(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 14), new THREE.MeshStandardMaterial({ color: 0x6a4630 }), 0, 0, 0, Math.PI / 2, 0, 0, WH);
    for (var sk = 0; sk < 12; sk++) cpPart(new THREE.CylinderGeometry(0.018, 0.024, 0.4, 6), new THREE.MeshStandardMaterial({ color: 0x8a5e3e, roughness: 0.8 }), Math.cos(sk / 12 * Math.PI * 2) * 0.27, Math.sin(sk / 12 * Math.PI * 2) * 0.27, 0, 0, 0, sk / 12 * Math.PI * 2 - Math.PI / 2, WH);
    // (flowers along the foot of the walls)
    var bed = [];
    [-2.6, -1.9, -1.2, -0.5, 0.2, 0.9, 1.6, 2.3].forEach(function (z) { bed.push([W2 + 0.26, gy(W2 + 0.26, z), z]); if (z < 2.0) bed.push([-W2 - 0.26, gy(-W2 - 0.26, z), z]); });
    [-1.9, 1.95].forEach(function (x) { bed.push([x, gy(x, D2 + 0.28), D2 + 0.28]); });
    coopFlowers(G, bed, 23);
    scene.add(G);
    return G;
  }
  function updateFbarnOutside(t, night) {
    if (!fbarnGroup || !fbarnGroup.userData.vane) return;   // (not while it's still a building site)
    fbarnGlows.forEach(function (L) { var fl = 1 + Math.sin(t * 9 + L.p) * 0.04; L.h.material.opacity = (0.15 + night * 0.7) * fl; L.f.material.color.setHSL(0.11, 1, 0.6 + night * 0.25); });
    fbarnGroup.userData.vane.rotation.y = Math.sin(t * 0.18 + 1) * 1.0 + Math.sin(t * 0.55) * 0.25;
  }

  // ===== inside =====
  var fbarnScene = new THREE.Scene(); fbarnScene.background = new THREE.Color(0x1c1410);
  var FBI_X = 1000, FBI_Z = 1000, FBI_EXIT_Z = FBARN_BD / 2 - 0.6;
  var fbarnRoom = new THREE.Group(); fbarnRoom.position.set(FBI_X, 0, FBI_Z); fbarnScene.add(fbarnRoom);
  var fbarnPen = new THREE.Group(); fbarnPen.position.set(0, 0, FBARN_DZ); fbarnPen.rotation.y = -Math.PI / 2; fbarnRoom.add(fbarnPen);   // (where the animals live, in Fluff & Feather's stall layout)
  fbarnScene.add(new THREE.HemisphereLight(0xfff0d8, 0x6a5440, 0.55));
  var fbSun = new THREE.DirectionalLight(0xffe6c0, 0.5); fbSun.position.set(FBI_X - 5, 9, FBI_Z + 6); fbSun.target.position.set(FBI_X, 0, FBI_Z); fbSun.castShadow = true; fbSun.shadow.mapSize.set(1024, 1024);
  fbSun.shadow.camera.left = -7; fbSun.shadow.camera.right = 7; fbSun.shadow.camera.top = 6; fbSun.shadow.camera.bottom = -6; fbSun.shadow.bias = -0.0006; fbarnScene.add(fbSun); fbarnScene.add(fbSun.target);
  var fbLamps = [[0, 2.6, 1.2], [0, 2.4, -2.6]].map(function (p) { var l = new THREE.PointLight(0xffc888, 0.55, 11); l.position.set(FBI_X + p[0], p[1], FBI_Z + p[2]); fbarnScene.add(l); return l; });
  var fbarnSolids = [], fbarnInGlows = [], fbarnWalls = [], fbarnHayMeshes = [], fbarnShafts = [], fbarnMotes = null;
  for (var fsl = FBARN_STALL0; fsl < FBARN_STALL0 + FBARN_CAP; fsl++) abStallSlates[fsl] = new THREE.MeshStandardMaterial({ map: abSlateTex, roughness: 0.95 });   // (a name slate over each stall)
  (function (R) {
    var W2 = FBARN_BW / 2, D2 = FBARN_BD / 2, H = FBARN_WALL;
    function put(geo, m, x, y, z, rx, ry, rz, p) { return cpPart(geo, m, x, y, z, rx, ry, rz, p || R); }
    var mWood = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xc89c6c, roughness: 0.8 }), mOld = new THREE.MeshStandardMaterial({ color: 0x7a5a3c, roughness: 0.85 });
    var mStud = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xb88a5c, roughness: 0.85 }), mPost = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0x9a6e48, roughness: 0.8 });
    // (wide floorboards, and deep straw in the stalls)
    put(new THREE.PlaneGeometry(FBARN_BW, FBARN_BD), new THREE.MeshStandardMaterial({ map: fbFloorTex, roughness: 0.9 }), 0, 0.001, 0, -Math.PI / 2, 0, 0).castShadow = false;
    put(new THREE.PlaneGeometry(FBARN_BW - 0.15, 1.62), new THREE.MeshStandardMaterial({ map: coopStrawTex, roughness: 1 }), 0, 0.004, -D2 + 0.83, -Math.PI / 2, 0, 0).castShadow = false;
    // (the four walls, each stepping aside when it's between you and the camera, with the real island through their windows)
    function wall(pts, holes, door, x, z, ry, n, d) { var g = new THREE.Group(); R.add(g); fbarnWall(g, pts, holes, door, fbmBoardIn, x, z, ry); fbarnWalls.push({ g: g, n: new THREE.Vector3(n[0], 0, n[1]), d: d }); return g; }
    var wB = wall(FBG, FB_BKH, null, 0, -D2, 0, [0, -1], D2), wF = wall(FBG, FB_FRH, FB_DOOR, 0, D2, Math.PI, [0, 1], D2);
    var wL = wall(FB_SIDE, FB_SH, null, -W2, 0, Math.PI / 2, [-1, 0], W2), wR = wall(FB_SIDE, FB_SH, null, W2, 0, -Math.PI / 2, [1, 0], W2);
    coopInWindow(wB, -2.1, 1.65, -D2 + 0.08, 0, 1.0, 0.9); coopInWindow(wB, 2.1, 1.65, -D2 + 0.08, 0, 1.0, 0.9); coopInWindow(wB, 0, 3.85, -D2 + 0.08, 0, 0.9, 0.7);
    coopInWindow(wF, -3.25, 1.65, D2 - 0.08, Math.PI, 1.0, 0.9); coopInWindow(wF, 3.25, 1.65, D2 - 0.08, Math.PI, 1.0, 0.9);
    [-2.2, 0, 2.2].forEach(function (z) { coopInWindow(wL, -W2 + 0.08, 1.65, z, Math.PI / 2, 0.9, 0.9); coopInWindow(wR, W2 - 0.08, 1.65, z, -Math.PI / 2, 0.9, 0.9); });
    [-0.74, 0.74].forEach(function (x) {                               // (the big doors and the loft door, shut, from inside)
      put(new THREE.BoxGeometry(1.46, 2.76, 0.05), fbmDoor, x, 1.4, D2 - 0.02, 0, 0, 0, wF);
      [[1.38, 0.12], [2.66, 0.1], [0.12, 0.1]].forEach(function (b) { put(new THREE.BoxGeometry(1.4, b[1], 0.04), mOld, x, b[0], D2 - 0.07, 0, 0, 0, wF); });
      [1, -1].forEach(function (d) { put(new THREE.BoxGeometry(0.08, 1.7, 0.035), mOld, x, 0.74, D2 - 0.075, 0, 0, d * 0.83, wF); });
    });
    put(new THREE.BoxGeometry(1.4, 1.1, 0.05), fbmDoor, 0, 3.9, D2 - 0.02, 0, 0, 0, wF);
    // (the timber frame showing inside: studs, plates, and rafters up the gambrel ends)
    coopStrips(wB, FBARN_BW, 0, FB_BKH, null, 0, -D2, 0, 1.0, 0.08, 0.09, 0.11, mStud, 0, fbarnTop);
    coopStrips(wF, FBARN_BW, 0, FB_FRH, FB_DOOR, 0, D2, Math.PI, 1.0, 0.08, 0.09, 0.11, mStud, 0, fbarnTop);
    coopStrips(wL, FBARN_BD, 0, FB_SH, null, -W2, 0, Math.PI / 2, 1.0, 0.08, 0.09, 0.11, mStud, 0, H - 0.06);
    coopStrips(wR, FBARN_BD, 0, FB_SH, null, W2, 0, -Math.PI / 2, 1.0, 0.08, 0.09, 0.11, mStud, 0, H - 0.06);
    [[wB, -D2 + 0.12], [wF, D2 - 0.12]].forEach(function (w) {
      put(new THREE.BoxGeometry(FBARN_BW - 0.1, 0.1, 0.1), mStud, 0, H - 0.05, w[1], 0, 0, 0, w[0]);
      for (var i = 2; i < 6; i++) { var a = FBG[i], b = FBG[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); put(new THREE.BoxGeometry(L, 0.12, 0.1), mStud, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.08, w[1], 0, 0, Math.atan2(b[1] - a[1], b[0] - a[0]), w[0]); }
    });
    [[wL, -W2 + 0.12], [wR, W2 - 0.12]].forEach(function (w) { put(new THREE.BoxGeometry(0.1, 0.1, FBARN_BD - 0.1), mStud, w[1], H - 0.05, 0, 0, 0, 0, w[0]); });
    // (the four stalls along the back wall: plank partitions topped with iron bars, stout posts, a header beam with each one's name slate, a hay rack, a bucket and a horseshoe)
    var bars = [];
    [2.2, 0, -2.2].forEach(function (x) {
      put(new THREE.BoxGeometry(0.07, 1.25, 1.62), mWood, x, 0.625, -D2 + 0.85);
      put(new THREE.BoxGeometry(0.11, 0.07, 1.66), mPost, x, 1.28, -D2 + 0.85);
      for (var b = 0; b < 12; b++) bars.push([x, 1.68, -D2 + 0.18 + b * 0.13, 0, 0, 0, 1, 0.78, 1]);
      put(new THREE.BoxGeometry(0.08, 0.06, 1.66), cpmIron, x, 2.08, -D2 + 0.85);
      for (var sz = -D2 + 0.3; sz < -D2 + 1.7; sz += 0.35) fbarnSolids.push([x, sz, 0.2]);
    });
    coopInst(R, new THREE.CylinderGeometry(0.011, 0.011, 1, 6), cpmIron, bars);
    [-4.62, 2.2, 0, -2.2, 4.62].forEach(function (x) { put(new THREE.BoxGeometry(0.16, 2.15, 0.16), mPost, x, 1.075, -D2 + 1.67); });
    put(new THREE.BoxGeometry(FBARN_BW - 0.1, 0.18, 0.16), mPost, 0, 2.22, -D2 + 1.67);
    [3.3, 1.1, -1.1, -3.3].forEach(function (x, k) {
      [-0.82, 0.82].forEach(function (e) { put(new THREE.BoxGeometry(0.4, 1.15, 0.06), mWood, x + e, 0.575, -D2 + 1.67); put(new THREE.BoxGeometry(0.44, 0.06, 0.1), mPost, x + e, 1.18, -D2 + 1.67); fbarnSolids.push([x + e, -D2 + 1.67, 0.22]); });
      put(new THREE.BoxGeometry(0.56, 0.32, 0.03), mOld, x, 2.0, -D2 + 1.76);
      put(new THREE.PlaneGeometry(0.5, 0.25), abStallSlates[FBARN_STALL0 + k], x, 2.0, -D2 + 1.776).castShadow = false;
      var BK = new THREE.Group(); BK.position.set(x + 0.6, 0.95, -D2 + 0.22); R.add(BK);   // (a water bucket on a hook)
      put(new THREE.CylinderGeometry(0.13, 0.1, 0.24, 16, 1, true), cpmSteel, 0, 0, 0, 0, 0, 0, BK); put(new THREE.CircleGeometry(0.1, 14), cpmSteel, 0, -0.12, 0, -Math.PI / 2, 0, 0, BK);
      put(new THREE.CircleGeometry(0.12, 16), fbmWater, 0, 0.08, 0, -Math.PI / 2, 0, 0, BK).castShadow = false; put(new THREE.TorusGeometry(0.125, 0.006, 5, 18, Math.PI), cpmIron, 0, 0.12, 0, 0, 0, 0, BK);
      put(new THREE.TorusGeometry(0.075, 0.015, 6, 18, Math.PI * 1.3), cpmIron, x - 0.35, 2.05, -D2 + 0.1, 0, 0, Math.PI * 0.85);   // (a horseshoe for luck)
    });
    // (the feeding bench down the middle: eight spots for hay with little dividers, number tags, and iron brackets)
    var FB3 = new THREE.Group(); R.add(FB3);
    put(new THREE.BoxGeometry(5.8, 0.07, 0.56), mWood, 0, 0.5, 0, 0, 0, 0, FB3);
    [-0.28, 0.28].forEach(function (z) { put(new THREE.BoxGeometry(5.8, 0.12, 0.03), mOld, 0, 0.56, z, 0, 0, 0, FB3); });
    [-2.85, -0.95, 0.95, 2.85].forEach(function (x) { [-0.22, 0.22].forEach(function (z) { put(new THREE.BoxGeometry(0.07, 0.48, 0.07), mPost, x, 0.24, z, 0, 0, 0, FB3); put(new THREE.BoxGeometry(0.09, 0.012, 0.09), cpmIron, x, 0.465, z, 0, 0, 0, FB3); }); });
    put(new THREE.BoxGeometry(5.7, 0.04, 0.48), mOld, 0, 0.12, 0, 0, 0, 0, FB3);
    for (var dv = 1; dv < 8; dv++) put(new THREE.BoxGeometry(0.02, 0.09, 0.54), mOld, -2.8 + dv * 0.7, 0.58, 0, 0, 0, 0, FB3);
    FBARN_SLOT_X.forEach(function (x, i) {
      var hb2 = pickupModel('hay'); hb2.position.set(x, 0.62, 0); hb2.rotation.y = (Math.random() - 0.5) * 0.15; hb2.traverse(function (o) { if (o.isMesh) o.castShadow = true; }); hb2.visible = false; FB3.add(hb2); fbarnHayMeshes.push(hb2);
      var numTex = cpTex(64, 64, function (g) { g.fillStyle = '#d8b480'; g.beginPath(); g.arc(32, 32, 31, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#7a5230'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#5a3a20'; g.font = '600 36px Fredoka, Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(i + 1), 32, 34); });
      put(new THREE.CircleGeometry(0.045, 18), new THREE.MeshStandardMaterial({ map: numTex, roughness: 0.8 }), x, 0.555, 0.3, 0, 0, 0, FB3).castShadow = false;
    });
    for (var bsx = -2.4; bsx <= 2.41; bsx += 0.8) fbarnSolids.push([bsx, 0, 0.36]);
    // (hay bales stacked in the front corner, with a ladder leaning by them and a pitchfork)
    [[-4.05, 0, 2.95, 0], [-3.1, 0, 2.95, 0.04], [-2.15, 0, 2.95, -0.03], [-3.6, 1, 2.95, 0.05], [-2.65, 1, 2.95, -0.04], [-3.12, 2, 2.95, 0.02], [-4.05, 0, 2.3, Math.PI / 2]].forEach(function (b) { var bale = pickupModel('hay'); bale.scale.setScalar(3.2); bale.position.set(b[0], 0.27 + b[1] * 0.545, b[2]); bale.rotation.y = b[3]; bale.traverse(function (o) { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); R.add(bale); });
    fbarnSolids.push([-3.6, 2.95, 0.75], [-2.3, 2.95, 0.5], [-4.05, 2.25, 0.45]);
    var LA = new THREE.Group(); LA.position.set(-4.04, 0, -1.1); LA.rotation.z = 0.2; R.add(LA); fbarnSolids.push([-4.15, -1.1, 0.3]);   // (feet out in the barn, top resting on the wall between two windows)
    [-0.22, 0.22].forEach(function (z) { put(new THREE.BoxGeometry(0.06, 2.6, 0.06), mPost, 0, 1.3, z, 0, 0, 0, LA); });
    for (var lr = 0; lr < 8; lr++) put(new THREE.CylinderGeometry(0.02, 0.02, 0.44, 6), mWood, 0, 0.25 + lr * 0.32, 0, Math.PI / 2, 0, 0, LA);
    var PF = new THREE.Group(); PF.position.set(-1.75, 0, 3.2); PF.rotation.set(-0.15, 0.3, 0.12); R.add(PF);
    put(new THREE.CylinderGeometry(0.016, 0.018, 1.35, 8), mWood, 0, 0.68, 0, 0, 0, 0, PF); put(new THREE.BoxGeometry(0.16, 0.02, 0.02), cpmIron, 0, 1.36, 0, 0, 0, 0, PF);
    [-0.07, 0, 0.07].forEach(function (x) { put(new THREE.CylinderGeometry(0.006, 0.003, 0.26, 5), cpmIron, x, 1.49, 0, 0, 0, 0, PF); });
    // (in the other front corner: a grain bin with its scoop, milk churns, a milking stool and pail, and feed sacks)
    var GB = new THREE.Group(); GB.position.set(3.75, 0, 3.15); R.add(GB);
    put(new THREE.BoxGeometry(1.3, 0.72, 0.62), mWood, 0, 0.36, 0, 0, 0, 0, GB); put(new THREE.BoxGeometry(1.36, 0.06, 0.68), mPost, 0, 0.75, 0, 0, 0, -0.04, GB);
    [-0.4, 0.4].forEach(function (x) { put(new THREE.BoxGeometry(0.14, 0.02, 0.08), cpmIron, x, 0.77, -0.3, 0, 0, 0, GB); });
    [[0, 0.36, 0.315, 1.3, 0.08], [-0.62, 0.36, 0.315, 0.06, 0.72], [0.62, 0.36, 0.315, 0.06, 0.72]].forEach(function (b) { put(new THREE.BoxGeometry(b[3], b[4], 0.02), mPost, b[0], b[1], b[2], 0, 0, 0, GB); });
    var stencil = cpTex(128, 32, function (g, w, h) { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(250,244,230,0.85)'; g.font = 'bold 24px Georgia, serif'; g.textAlign = 'center'; g.fillText('GRAIN', w / 2, 24); });
    put(new THREE.PlaneGeometry(0.62, 0.155), new THREE.MeshStandardMaterial({ map: stencil, transparent: true, roughness: 0.9 }), 0, 0.42, 0.33, 0, 0, 0, GB).castShadow = false;
    put(new THREE.CylinderGeometry(0.06, 0.05, 0.1, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xb8c0c8, metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide }), 0.3, 0.83, 0.05, 0, 0, Math.PI / 2 - 0.2, GB);
    fbarnSolids.push([3.75, 3.15, 0.7]);
    fbarnChurn(R, 2.55, 0, 3.2); fbarnChurn(R, 2.95, 0, 3.4).rotation.y = 1.2; fbarnSolids.push([2.75, 3.3, 0.35]);
    var ST = new THREE.Group(); ST.position.set(2.35, 0, 2.35); R.add(ST);
    put(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 16), mWood, 0, 0.32, 0, 0, 0, 0, ST);
    [0, 2.1, 4.2].forEach(function (a) { put(new THREE.CylinderGeometry(0.018, 0.022, 0.34, 6), mPost, Math.cos(a) * 0.11, 0.16, Math.sin(a) * 0.11, Math.sin(a) * 0.2, 0, -Math.cos(a) * 0.2, ST); });
    put(new THREE.CylinderGeometry(0.14, 0.11, 0.26, 16, 1, true), cpmSteel, 0.38, 0.13, 0.1, 0, 0, 0, ST); put(new THREE.CircleGeometry(0.12, 14), new THREE.MeshStandardMaterial({ color: 0xfaf6ee, roughness: 0.3 }), 0.38, 0.2, 0.1, -Math.PI / 2, 0, 0, ST);
    fbarnSolids.push([2.5, 2.4, 0.35]);
    [[4.25, 2.3, 0.5, 0], [4.3, 1.75, -0.4, 1]].forEach(function (sk) { if (!barnSackProtos[sk[3]]) return; var sg = barnSackProtos[sk[3]].clone(); sg.position.set(sk[0], 0, sk[1]); sg.rotation.set(0, sk[2], 0); sg.scale.setScalar(0.9); R.add(sg); });
    fbarnSolids.push([4.25, 2.0, 0.45]);
    // (tack on the left wall: halters, lead ropes and brushes on a peg rail, and a shelf of tins)
    put(new THREE.BoxGeometry(0.05, 0.1, 1.2), mPost, -W2 + 0.16, 1.85, 1.1);
    [0.65, 0.95, 1.25, 1.55].forEach(function (z, k) {
      put(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 6), mWood, -W2 + 0.24, 1.85, z, 0, 0, Math.PI / 2);
      if (k % 2) put(new THREE.TorusGeometry(0.11, 0.025, 6, 18), new THREE.MeshStandardMaterial({ color: k === 1 ? 0xc06a3a : 0x5a7a9a, roughness: 0.8 }), -W2 + 0.26, 1.66, z, 0, Math.PI / 2, 0).scale.set(1, 1.6, 1);
      else { put(new THREE.TorusGeometry(0.12, 0.02, 6, 20), new THREE.MeshStandardMaterial({ color: k ? 0xd84a6a : 0x8a5a3a, roughness: 0.8 }), -W2 + 0.26, 1.7, z, 0, Math.PI / 2, 0).scale.set(1, 1.4, 1); put(new THREE.BoxGeometry(0.03, 0.1, 0.24), cpmBrass, -W2 + 0.27, 1.52, z, 0, 0, 0); }
    });
    put(new THREE.BoxGeometry(0.22, 0.035, 1.1), mWood, -W2 + 0.2, 1.25, 1.1);
    [[0.7, 0xa04a3a], [0.92, 0x4a6a8a], [1.14, 0xc8a050], [1.38, 0x6a8a5a]].forEach(function (b) { put(new THREE.BoxGeometry(0.12, 0.06, 0.18), new THREE.MeshStandardMaterial({ color: b[1], roughness: 0.7 }), -W2 + 0.2, 1.3, b[0], 0, 0.2, 0); put(new THREE.BoxGeometry(0.1, 0.04, 0.16), new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 1 }), -W2 + 0.2, 1.35, b[0], 0, 0.2, 0); });
    // (a chalkboard of the day's chores on the right wall)
    var chores = cpTex(256, 192, function (g, w, h) {
      g.fillStyle = '#2c3a34'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(230,240,235,0.06)'; for (var k = 0; k < 40; k++) g.fillRect(Math.random() * w, Math.random() * h, 34, 2);
      g.fillStyle = '#f4f0e6'; g.font = 'italic 600 28px Georgia, serif'; g.textAlign = 'center'; g.fillText('Barn chores', w / 2, 34);
      g.textAlign = 'left'; g.font = '20px Georgia, serif'; ['Fill the bench', 'Pet everyone', 'Milk & shear', 'Fresh straw'].forEach(function (t2, k) { g.strokeStyle = '#f4f0e6'; g.lineWidth = 2; g.strokeRect(26, 56 + k * 32, 16, 16); if (k < 2) { g.strokeStyle = '#f6b8cc'; g.beginPath(); g.moveTo(28, 64 + k * 32); g.lineTo(34, 70 + k * 32); g.lineTo(46, 52 + k * 32); g.stroke(); } g.fillStyle = '#f4f0e6'; g.fillText(t2, 54, 70 + k * 32); });
    });
    put(new THREE.BoxGeometry(0.04, 0.78, 1.04), mOld, W2 - 0.15, 1.75, 1.1); put(new THREE.PlaneGeometry(0.96, 0.72), new THREE.MeshStandardMaterial({ map: chores, roughness: 0.95 }), W2 - 0.175, 1.75, 1.1, 0, -Math.PI / 2, 0).castShadow = false;
    // (lanterns on the stall posts and by the doors, and bunting along the header beam)
    [-4.62, -2.2, 0, 2.2, 4.62].forEach(function (x) { cpLantern(R, x, 1.9, -D2 + 1.86, fbarnInGlows); put(new THREE.BoxGeometry(0.04, 0.2, 0.04), cpmIron, x, 2.1, -D2 + 1.8); });   // (on the posts between the stalls, clear of the name slates)
    [-2.0, 2.0].forEach(function (x) { cpLantern(R, x, 2.3, D2 - 0.3, fbarnInGlows); put(new THREE.BoxGeometry(0.04, 0.04, 0.2), cpmIron, x, 2.45, D2 - 0.2); });
    var flagCols = [0xf4a6c8, 0xfff0c8, 0xb8e0c8, 0xc8b8f0, 0xffc8a0, 0xa8d4f0], tri = new THREE.Shape(); tri.moveTo(-0.06, 0); tri.lineTo(0.06, 0); tri.lineTo(0, -0.14); tri.closePath();
    var tg = new THREE.ShapeGeometry(tri), bpts = []; for (var k2 = 0; k2 <= 24; k2++) { var f = k2 / 24; bpts.push(new THREE.Vector3(-4.5 + 9 * f, 2.12 - Math.sin(f * Math.PI * 4) * 0.06 - 0.02, -D2 + 1.77)); }
    put(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bpts), 60, 0.004, 4), new THREE.MeshStandardMaterial({ color: 0xf0e6d8 }), 0, 0, 0).castShadow = false;
    for (var bf = 1; bf < 50; bf++) { var f2 = bf / 50; if (Math.abs((-4.5 + 9 * f2) - Math.round((-4.5 + 9 * f2) / 2.2) * 2.2) < 0.32) continue; put(tg, new THREE.MeshStandardMaterial({ color: flagCols[bf % flagCols.length], side: THREE.DoubleSide, roughness: 0.9 }), -4.5 + 9 * f2, 2.1 - Math.sin(f2 * Math.PI * 4) * 0.06 - 0.02, -D2 + 1.775).castShadow = false; }
    // (loose straw everywhere, thickest in the stalls, and a few feathers of ... well, straw)
    var strands = [];
    for (var i = 0; i < 4200; i++) {
      var inStall = i % 2 === 0, x = -W2 + 0.08 + Math.random() * (FBARN_BW - 0.16), z = inStall ? -D2 + 0.08 + Math.random() * 1.55 : -D2 + 1.7 + Math.random() * (FBARN_BD - 1.8);
      if (!inStall && Math.random() < 0.55) continue;
      var c = new THREE.Color().setHSL(0.1 + Math.random() * 0.03, 0.5 + Math.random() * 0.25, 0.48 + Math.random() * 0.28);
      strands.push([x, 0.006 + (inStall ? Math.random() * 0.03 : 0), z, 0, Math.random() * Math.PI * 2, Math.PI / 2 + (Math.random() - 0.5) * 0.25, 1, 0.05 + Math.random() * 0.13, 1, c.getHex()]);
    }
    coopInst(R, new THREE.CylinderGeometry(0.0028, 0.0028, 1, 3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), strands, true).castShadow = false;
    // (sunbeams slanting in through the side windows, with dust drifting in them)
    var beamTex = cpTex(64, 128, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); var gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.2, 'rgba(0,0,0,0)'); gx.addColorStop(0.8, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)'); g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h); });
    var motePts = [];
    [[-W2 + 0.09, 1.65, 0, Math.PI / 2], [-W2 + 0.09, 1.65, 2.2, Math.PI / 2], [-3.25, 1.65, D2 - 0.09, Math.PI], [3.25, 1.65, D2 - 0.09, Math.PI]].forEach(function (b) {
      var g = new THREE.Group(); g.position.set(b[0], b[1], b[2]); g.rotation.y = b[3]; R.add(g);
      var phi = 0.6, L = 2.7, bm = new THREE.MeshBasicMaterial({ map: beamTex, color: 0xfff0c8, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      var pl = new THREE.Mesh(new THREE.PlaneGeometry(0.95, L), bm); pl.position.set(0, -Math.sin(phi) * L / 2 + 0.35, Math.cos(phi) * L / 2); pl.rotation.x = phi - Math.PI / 2; g.add(pl); fbarnShafts.push(bm);
      g.updateMatrixWorld(true);
      for (var m = 0; m < 22; m++) { var fq = Math.random(), p = new THREE.Vector3((Math.random() - 0.5) * 0.65, 0.35 - Math.sin(phi) * L * fq, Math.cos(phi) * L * fq + (Math.random() - 0.5) * 0.2); g.localToWorld(p); R.worldToLocal(p); motePts.push(p.x, p.y, p.z); }
    });
    var mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.Float32BufferAttribute(motePts, 3));
    fbarnMotes = new THREE.Points(mg, new THREE.PointsMaterial({ map: dawnGlowTex, color: 0xfff4d8, size: 0.05, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
    fbarnMotes.userData.base = motePts.slice(); R.add(fbarnMotes);
  })(fbarnRoom);
  function fbarnHayShow() { fbarnHayMeshes.forEach(function (m, i) { m.visible = fbarn.hay[i]; }); }
  var fbLook = new THREE.Vector3();
  function updateFbarnInside(t) {
    fbLook.set(camera.position.x - FBI_X, 0, camera.position.z - FBI_Z);
    fbarnWalls.forEach(function (W) { W.g.visible = fbLook.dot(W.n) < W.d - 0.6; });
    var hr = state.minutes / 60, nt = hr < 5.5 ? 1 : hr < 7 ? (7 - hr) / 1.5 : hr < 18.5 ? 0 : hr < 20 ? (hr - 18.5) / 1.5 : 1;
    fbSun.intensity = 0.5 * (1 - nt); fbLamps.forEach(function (l, i) { l.intensity = (0.5 + nt * 0.3) * (1 + Math.sin(t * 10 + i) * 0.04); });
    fbarnInGlows.forEach(function (L) { var f = 1 + Math.sin(t * 11 + L.p) * 0.1; L.f.scale.set(f, 1.5 * f, f); L.h.material.opacity = 0.5 * f; });
    fbarnShafts.forEach(function (m, i) { m.opacity = (1 - nt) * (0.1 + Math.sin(t * 0.4 + i) * 0.025); });
    var mp = fbarnMotes.geometry.attributes.position, mb = fbarnMotes.userData.base;
    for (var k = 0; k < mp.count; k++) mp.setXYZ(k, mb[k * 3] + Math.sin(t * 0.3 + k * 1.7) * 0.06, mb[k * 3 + 1] + Math.sin(t * 0.22 + k * 2.3) * 0.08, mb[k * 3 + 2] + Math.cos(t * 0.27 + k) * 0.06);
    mp.needsUpdate = true; fbarnMotes.material.opacity = (1 - nt) * 0.75;
  }
  function drawFbarnView() {                                           // (the windows look out on the real farm)
    renderer.getDrawingBufferSize(shopViewSize);
    if (shopViewTarget.width !== shopViewSize.x || shopViewTarget.height !== shopViewSize.y) shopViewTarget.setSize(shopViewSize.x, shopViewSize.y);
    siWindowMask.uniforms.uSize.value.copy(shopViewSize);
    shopViewMap.makeTranslation(fbarn.x, fbarn.fy, fbarn.z).multiply(shopViewTmp.makeRotationY(bRot(fbarn))).multiply(shopViewTmp.makeTranslation(-FBI_X, 0, -FBI_Z));
    shopViewCam.projectionMatrix.copy(camera.projectionMatrix); shopViewCam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    shopViewCam.matrix.multiplyMatrices(shopViewMap, camera.matrixWorld);
    shopViewCam.updateMatrixWorld(true);
    if (fbarnGroup) fbarnGroup.visible = false;
    renderer.setRenderTarget(shopViewTarget); renderer.render(scene, shopViewCam); renderer.setRenderTarget(null);
    if (fbarnGroup) fbarnGroup.visible = true;
  }
  function fbarnDoorUse(goIn) {                                        // through the barn's doors, in or out
    if (doorBusy) return;
    doorBusy = true; doorArmed = false; walkTarget = null; doorSound(); fadeBox.style.opacity = 1;
    setTimeout(function () {
      if (goIn) {
        indoors = true; inShop = inClinic = inBarn = inCarp = inCoop = false; inFbarn = true;
        fbarnScene.add(player); player.position.set(FBI_X, 0, FBI_Z + FBI_EXIT_Z - 1.0); facing = Math.PI;
        outsideCam = { dist: cam.dist, pitch: cam.pitch, yaw: cam.yaw }; cam.dist = 9.5; cam.pitch = 0.88; cam.yaw = 0;
      } else {
        indoors = false; inFbarn = false; scene.add(player);
        var o = fbarnFront(1.9); player.position.set(o.x, 0, o.z); facing = bRot(fbarn);
        if (outsideCam) { cam.dist = outsideCam.dist; cam.pitch = outsideCam.pitch; cam.yaw = outsideCam.yaw; }
      }
      cam.target.set(player.position.x, 0.8, player.position.z);
      fadeBox.style.opacity = 0;
      setTimeout(function () { doorBusy = false; }, 380);
    }, 380);
  }

  // ===== building it, and taking it down (when a save without one is loaded) =====
  function fbarnPlace(c0, r0, start, rot) {
    fbarnRemove();
    fbarn.built = true; fbarn.c = c0; fbarn.r = r0; fbarn.start = start; fbarn.stage = siteStage(fbarn); fbarn.rot = rot || 0;   // (start: the farm day Oak & Ember started building it; rot: which way it faces)
    var FC = bFC(fbarn, FBARN_FC, FBARN_FR), FR = bFR(fbarn, FBARN_FC, FBARN_FR);
    fbarn.fx = FARM_X + (c0 + FC / 2) * TILE; fbarn.fz = FARM_Z + (r0 + FR / 2) * TILE;
    var back = bOff(fbarn, 0, -FBARN_OFF); fbarn.x = fbarn.fx + back.x; fbarn.z = fbarn.fz + back.z;
    var top = -9; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) top = Math.max(top, bGround(fbarn, gx * FBARN_BW / 2, gz * FBARN_BD / 2));
    fbarn.fy = top + 0.22;
    var HX = FC * TILE / 2, HZ = FR * TILE / 2;
    allScenery.forEach(function (t) { var u = t.userData; if (u.gone || u.state === 'standing') return; if (Math.abs(u.solid.x - fbarn.fx) < HX + u.solidR && Math.abs(u.solid.z - fbarn.fz) < HZ + u.solidR) setSceneryCut(t, u.state === 'regrowing' ? u.felledAt : gameMinutes()); });
    mineable.forEach(function (r) { if (r.gone || r.state === 'whole') return; if (Math.abs(r.solid.x - fbarn.fx) < HX + r.solidR && Math.abs(r.solid.z - fbarn.fz) < HZ + r.solidR) setRockBroken(r, r.state === 'regrowing' ? r.brokeAt : gameMinutes()); });
    for (var c = c0; c < c0 + FC; c++) for (var r = r0; r < r0 + FR; r++) { var ft = { x: FARM_X + (c + 0.5) * TILE, z: FARM_Z + (r + 0.5) * TILE }; coverGrass(ft); fbarn.grass.push(ft); }
    var sl = [[-3.6, 2.85, 0.6], [3.6, 2.85, 0.6], [-3.45, 3.6 + 0.8, 0.6], [2.75, 3.6 + 0.85, 0.75], [4.05, 3.6 + 0.8, 0.45]];
    for (var sx = -3.5; sx <= 3.51; sx += 1.4) for (var sz = -2.4; sz <= 2.41; sz += 1.6) sl.push([sx, sz, 1.15]);
    [-1, 1].forEach(function (s) { [-2.9, 0, 2.9].forEach(function (z) { sl.push([s * 4.1, z, 0.7]); }); });
    sl.forEach(function (s) { var w = bOff(fbarn, s[0], s[1]), sd = { x: fbarn.x + w.x, z: fbarn.z + w.z, r: s[2] }; solids.push(sd); fbarn.solids.push(sd); });
    fbarnDoor = fbarn.stage < SITE_DAYS ? { x: 1e6, z: 1e6 } : fbarnFront(0.15);   // (no way in until it's finished)
    fbarnGroup = fbarn.stage < SITE_DAYS ? siteBuild('fbarn', fbarn.stage) : fbarnBuildOutside();
    if (!fbarn.tp) fbarn.tp = { name: 'Your Barn', icon: '🐮', spot: function () { var f = fbarnFront(2.6); return { x: f.x, z: f.z, face: bRot(fbarn) + Math.PI, view: bRot(fbarn) }; } };
    if (TELEPORTS.indexOf(fbarn.tp) < 0) TELEPORTS.push(fbarn.tp);
    flushDirty();
  }
  function fbarnRemove() {
    if (!fbarn.built) return;
    if (fbarnGroup) { scene.remove(fbarnGroup); fbarnGroup = null; }
    fbarn.solids.forEach(function (sd) { var i = solids.indexOf(sd); if (i >= 0) solids.splice(i, 1); }); fbarn.solids = [];
    fbarn.grass.forEach(uncoverGrass); fbarn.grass = [];
    var ti = TELEPORTS.indexOf(fbarn.tp); if (ti >= 0) TELEPORTS.splice(ti, 1);
    fbarn.built = false; fbarnDoor = { x: 1e6, z: 1e6 };
  }
  function fbarnSaveData() { return fbarn.built ? { c: fbarn.c, r: fbarn.r, rot: fbarn.rot || 0, hay: fbarn.hay.slice(), start: fbarn.start } : null; }
  function fbarnLoadData(d) {
    fbarnRemove();
    fbarn.hay = [false, false, false, false, false, false, false, false]; fbarn.res = [];
    if (d) { fbarnPlace(d.c, d.r, d.start === undefined ? -99 : d.start, d.rot || 0); if (d.hay) d.hay.forEach(function (h, i) { if (i < 8) fbarn.hay[i] = !!h; }); }
    fbarnAnimals().forEach(function (g) { g.eatSlot = null; });
    fbarnHayShow();
  }
  // (animals still in Fluff & Feather's stalls from before move to the coop or the barn as soon as there's room)
  function homeMigrate(quiet) {
    var moved = [];
    glimmers.slice().forEach(function (g) {
      if (g.stall >= COOP_STALL0) return;
      var to = COOP_KINDS.indexOf(g.kind) >= 0 ? (siteReady(coop) ? coopFreeStall() : -1) : (siteReady(fbarn) ? fbarnFreeStall() : -1);
      if (to < 0) return;
      [g.m.root, g.eggMesh, g.hayMesh].forEach(function (o) { if (o && o.parent) o.parent.remove(o); }); g.slate.map = abSlateTex; g.slate.needsUpdate = true;
      glimmers.splice(glimmers.indexOf(g), 1);
      glimAdd({ kind: g.kind, name: g.name, stall: to, pal: g.pal, fed: g.fed, petted: g.petted, egg: g.egg, days: g.days });
      moved.push(g.name);
    });
    if (moved.length && !quiet) setTimeout(function () { showToast('✧ ' + moved.join(' and ') + (moved.length > 1 ? ' have' : ' has') + ' moved out of Fluff & Feather into their new home on your farm!', 4200); }, 5400);
  }

  // ===== the animals that live in it =====
  function fbarnMoveIn(g, added) {                                     // (called as one is adopted or loaded: everything built for it moves from the barn room into your barn's stalls)
    added.forEach(function (o) { if (o !== g.hayMesh) fbarnPen.add(o); });
    if (g.hayMesh.parent) g.hayMesh.parent.remove(g.hayMesh);
    g.eatSlot = null; g.eatT = 0;
  }
  function fbarnEat(g) {
    var i = g.eatSlot; fbarn.hay[i] = false; fbarn.res[i] = null; g.eatSlot = null; g.eatT = 0; g.routeTo = null;
    g.fed = true; glimRefresh(g); fbarnHayShow();
    if (inFbarn) { popSound(); petSound(g, 'eat', fbarnNear(g)); g.wait = 0.4; }
  }
  function fbarnNear(g) { var r = fbarnToRoom(g.x, g.z), d = Math.hypot(player.position.x - FBI_X - r[0], player.position.z - FBI_Z - r[1]); return Math.max(0.25, Math.min(1, 2.2 / (d + 0.8))); }   // (softer the further it is from you)
  function updateFbarnFeeding(dt) {                                    // a hungry animal walks out of its stall to the nearest bundle on the bench, and eats it
    fbarnAnimals().forEach(function (g) {
      if (inFbarn && (g.kind === 'moon' || g.kind === 'aurora' || g.kind === 'zephyra' || g.kind === 'luna' || g.kind === 'bubble')) {   // (a Mooncalf, an Auroraram, a Zephyra, a Lunastra or a Sirenna makes its sounds now and then, and less at night)
        if (g.chirpT === undefined) g.chirpT = 4 + Math.random() * 10;
        g.chirpT -= dt;
        if (g.chirpT <= 0) { var hr = state.minutes / 60, night = hr >= 20 || hr < 6; g.chirpT = (night ? 35 : 12) + Math.random() * (night ? 40 : 18); petSound(g, 'chirp', fbarnNear(g) * (night ? 0.5 : 1)); }
      }
      if (g.fed) { if (g.eatSlot !== null && g.eatSlot !== undefined) { fbarn.res[g.eatSlot] = null; g.eatSlot = null; g.routeTo = null; } return; }
      if (g.eatSlot === null || g.eatSlot === undefined) {
        var rx = fbarnToRoom(g.x, g.z)[0], best = -1, bd = 1e9;
        for (var i = 0; i < 8; i++) if (fbarn.hay[i] && !fbarn.res[i]) { var d = Math.abs(FBARN_SLOT_X[i] - rx); if (d < bd) { bd = d; best = i; } }
        if (best < 0) return;
        g.eatSlot = best; fbarn.res[best] = g; g.eatT = 0;
      }
      if (!inFbarn) { fbarnEat(g); return; }
      var big = g.kind === 'bison' || g.kind === 'lotus' || g.kind === 'moon' || g.kind === 'aurora', spot = fbarnToFrame(FBARN_SLOT_X[g.eatSlot], big ? -0.75 : -0.5);
      if (g.routeTo !== 'eat' + g.eatSlot) { fbarnGo(g, [FBARN_SLOT_X[g.eatSlot], big ? -0.75 : -0.5], 0); g.routeTo = 'eat' + g.eatSlot; }   // (round the end of the bench if it's on the other side)
      g.wait = 1;
      if (Math.hypot(g.x - spot[0], g.z - spot[1]) < 0.06) { g.face = Math.PI / 2; g.eatT += dt; if (g.eatT > 2.6) fbarnEat(g); }
    });
  }
  // (wandering all over the barn: out of its stall into the aisle behind the feeding bench, round either end of the
  // bench to the open floor by the big doors, and home to its own stall again, where they all go to sleep at night.
  // Points here are in the barn's room: x across it, z from the stalls at the back (-) to the doors at the front (+))
  function fbarnZone(p) { return p[1] < -1.75 ? 'stall' : p[1] < 0 ? 'aisle' : 'front'; }
  function fbarnRoute(a, b) {                                          // (the corners to walk through from a to b, ending at b)
    var pts = [], za = fbarnZone(a), zb = fbarnZone(b);
    if (za === 'stall' && zb === 'stall' && Math.abs(a[0] - b[0]) < 1) return [b];   // (just pottering about its own stall)
    if (za === 'stall') { a = [a[0], -1.1]; pts.push(a); za = 'aisle'; }               // (out through the stall's opening)
    var b2 = zb === 'stall' ? [b[0], -1.1] : b, zb2 = zb === 'stall' ? 'aisle' : zb;
    if (za !== zb2) { var sx = a[0] + b2[0] >= 0 ? 3.55 : -3.55; if (za === 'aisle') pts.push([sx, -0.9], [sx, 0.9]); else pts.push([sx, 0.9], [sx, -0.9]); }   // (round the nearer end of the bench)
    if (zb === 'stall') pts.push(b2);
    pts.push(b);
    return pts;
  }
  function fbarnGo(g, to, rest) {
    var pts = fbarnRoute(fbarnToRoom(g.x, g.z), to).map(function (p) { return fbarnToFrame(p[0], p[1]); });
    var first = pts.shift(); g.tx = first[0]; g.tz = first[1]; g.route = pts; g.restT = rest || 0; g.routeTo = null;
  }
  function fbarnRouteTick(g) {
    var left = Math.hypot(g.tx - g.x, g.tz - g.z);
    if (left < 0.05 && g.route && g.route.length) { var nx = g.route.shift(); g.tx = nx[0]; g.tz = nx[1]; left = 1; }
    if (left > 0.05) g.wait = Math.max(g.wait, 0.3 + (g.restT || 0));  // (no new idea where to go until it gets there, then a rest)
  }
  function fbarnWander(g) {
    if (g.eatSlot !== null && g.eatSlot !== undefined) { g.wait = 0.5; return; }
    var home = -GLIM_STALLS[g.stall], hr = state.minutes / 60, night = hr >= 20 || hr < 6, r = Math.random();
    var slow = g.kind === 'tort' || g.kind === 'bison' || g.kind === 'lotus' || g.kind === 'moon', to;
    if (night || r < 0.2) to = [home + (Math.random() - 0.5) * 0.6, -2.35 - Math.random() * 0.6];   // (home to its own stall, and to sleep there at night)
    else if (r < 0.6) to = [-3.9 + Math.random() * 7.3, -1.3 + Math.random() * 0.5];            // (somewhere along the aisle behind the bench)
    else to = [-1.5 + Math.random() * 3.4, 0.8 + Math.random() * 1.15];                          // (out on the open floor by the big doors)
    fbarnGo(g, to, ((slow ? 6 : 3) + Math.random() * (slow ? 8 : 6)) * (night ? 2 : 1));
    g.wait = 0.3 + g.restT;
  }
  var FBARN_ACT = { moon: mooncalfAction, aurora: auroraramAction, zephyra: zephyraAction, luna: lunastraAction, bubble: sirennaAction, prism: prismaraAction, lotus: lotaraAction, axo: axoriaAction, liz: solarithAction, tort: grovellaAction, bison: nocturraAction, crab: iridelleAction };
  function fbarnCare(g) {                                              // milking, shearing, collecting, and petting (it feeds itself at the bench)
    var pf = fbarnToFrame(player.position.x - FBI_X, player.position.z - FBI_Z);
    var wx = player.position.x - (pf[0] - g.x), wz = player.position.z - (pf[1] - g.z);   // (so it turns to face you in its own stall frame)
    if (g.egg || g.fed) { FBARN_ACT[g.kind](g, wx, wz); return; }
    if (!g.petted) {
      g.petted = true; glimRefresh(g); g.pet = 1.4; g.face = Math.atan2(pf[0] - g.x, pf[1] - g.z);
      glimHeartBurst(g.x, g.kind === 'bison' || g.kind === 'lotus' ? 1.3 : 0.85, g.z); popSound(); petSound(g, 'pet');
      showToast(g.name + ' loves the attention 💜 Put hay on the feeding bench so they can eat too!', 2600); return;
    }
    petSound(g, 'hungry'); showToast(g.name + ' is hungry! Put hay on the feeding bench 🌾', 2400);
  }
  function fbarnBenchAction() {
    var i = fbarn.hay.indexOf(false);
    if (i < 0) { showToast('The feeding bench is full: all 8 spots have hay 🌾', 2200); return; }
    if (!takeItem('hay', 1)) { showToast('You need hay to put on the bench. Take it from the hopper' + (siloReady() ? ' (' + silo.hay + ' in your silo)' : '') + ', buy it at Fluff & Feather, or trim bushes for it 🌾', 3000); return; }
    fbarn.hay[i] = true; fbarnHayShow(); popSound();
    showToast('You put a bundle of hay on the feeding bench (' + fbarn.hay.filter(Boolean).length + '/8) 🌾', 1800);
  }
  function fbarnTarget() {                                             // what Interact would do in here: the bench, or one of your animals
    if (!inFbarn || glimNaming || siloHopperHere()) return null;     // (by the hopper, Interact takes hay out of it instead)
    var lx = player.position.x - FBI_X, lz = player.position.z - FBI_Z, best = null, bd = 1.3;
    fbarnAnimals().forEach(function (g) { var p = fbarnToRoom(g.x, g.z), d = Math.hypot(lx - p[0], lz - p[1]); if (d < bd) { bd = d; best = g; } });
    var atBench = Math.abs(lx) < 3.1 && lz > 0.25 && lz < 1.25;
    if (best && bd < 0.9 && (best.egg || !atBench)) return best;
    return atBench ? 'bench' : best;
  }
  var fbarnBtn = document.createElement('button');
  fbarnBtn.type = 'button'; fbarnBtn.className = 'sleep-btn ship-btn';
  canvas.parentNode.appendChild(fbarnBtn);
  fbarnBtn.addEventListener('click', function () { var tg = fbarnTarget(); if (tg === 'bench') fbarnBenchAction(); else if (tg) fbarnCare(tg); focusGame(); });
  var fbarnBtnText = '';
  function updateFbarnButton() {
    var tg = fbarnTarget(), txt = '';
    if (tg === 'bench') txt = '🌾 Put hay on the bench (' + fbarn.hay.filter(Boolean).length + '/8)';
    else if (tg) txt = tg.egg ? (tg.kind === 'moon' || tg.kind === 'aurora' || tg.kind === 'lotus' || tg.kind === 'bison' ? '🥛 Milk ' + tg.name : tg.kind === 'zephyra' || tg.kind === 'prism' || tg.kind === 'axo' ? '✂️ Shear ' + tg.name : tg.kind === 'luna' ? '⚪ Take the Moonpearl' : tg.kind === 'bubble' ? '🫧 Take the Wishbubble' : tg.kind === 'liz' ? '☀️ Take the Sunscale' : tg.kind === 'tort' ? '🌸 Pick the Starbloom' : '⚪ Take the Tidelight Pearl') : !tg.petted ? '💜 Pet ' + tg.name : !tg.fed ? '🌾 ' + tg.name + ' is hungry' : '✧ ' + tg.name;
    if (txt !== fbarnBtnText) { fbarnBtnText = txt; if (txt) fbarnBtn.innerHTML = txt.replace(/&/g, '&amp;').replace(/</g, '&lt;') + ' <kbd>E</kbd>'; }
    var show = !!txt;
    if (fbarnBtn.classList.contains('show') !== show) fbarnBtn.classList.toggle('show', show);
  }

  // ===== adopting at Fluff & Feather: every animal that isn't a coop bird lives in your barn =====
  var fbarnBaseAdopt = adoptGlimmerwing;
  adoptGlimmerwing = function (kind) {
    if (FBARN_KINDS.indexOf(kind) < 0) return fbarnBaseAdopt(kind);
    if (!fbarn.built) { showToast('A ' + FBARN_NAMES[kind] + ' lives in a barn: build one at Oak & Ember first 🐮', 2800); return; }
    if (!siteReady(fbarn)) { showToast('Your barn is still being built: it\'ll be ready on the morning of ' + seasonDay(fbarn.start + SITE_DAYS) + ' 🪚', 2800); return; }
    var fs2 = fbarnFreeStall(), cost = fbarnKindCost(kind);
    if (fs2 < 0) { showToast('Your barn is full: it has room for 4', 2200); return; }
    if (state.coins < cost) { showToast('Not enough Star Coins', 1800); return; }
    state.coins -= cost; showCoins(true); coinSound(5); closeBarnShop(); glimStartNaming(fs2, kind);
  };
  var FBARN_BTNS = [[moonAdoptBtn, MOON_COST], [auroraAdoptBtn, AURORA_COST], [zephyraAdoptBtn, ZEPHYRA_COST], [lunaAdoptBtn, LUNA_COST], [bubbleAdoptBtn, BUBBLE_COST], [prismAdoptBtn, PRISM_COST], [lotusAdoptBtn, LOTUS_COST], [axoAdoptBtn, AXO_COST], [lizAdoptBtn, LIZ_COST], [tortAdoptBtn, TORT_COST], [bisAdoptBtn, BIS_COST], [crbAdoptBtn, CRB_COST]];
  var FBARN_NOTES = [];
  FBARN_BTNS.forEach(function (b) {                                    // (their cards at Fluff & Feather say where they live)
    var card = b[0].closest('.shop-card'); if (!card) return;
    homeCardText(card, 'barn');
    var note = document.createElement('p'); note.className = 'ship-hint'; note.style.cssText = 'margin:6px 2px 8px;font-weight:600;color:#a84a3c'; note.textContent = '🐮 ' + homeNoteText(fbarn, 'barn');
    card.insertBefore(note, card.querySelector('.shop-buy')); FBARN_NOTES.push(note);
  });
  var fbarnBarnRender = renderBarnShop;
  renderBarnShop = function () {
    fbarnBarnRender();
    var free = siteReady(fbarn) && fbarnFreeStall() >= 0;
    FBARN_BTNS.forEach(function (b) { b[0].innerHTML = !fbarn.built ? '🐮 Needs a barn' : !siteReady(fbarn) ? '🪚 Barn being built' : !free ? 'Your barn is full' : 'Adopt · <img class="coin-icon" alt=""> ' + b[1].toLocaleString('en-US'); b[0].disabled = !free || state.coins < b[1]; });
    var bn = '🐮 ' + homeNoteText(fbarn, 'barn'); FBARN_NOTES.forEach(function (n) { if (n.textContent !== bn) n.textContent = bn; });
    barnTilesSync();
  };

  // ===== on the world map, and every frame =====
  function fbarnDrawOnMap(g, K, label) {                               // (its grey gambrel roof with the ridge down the middle, the cupola, and its red doors)
    var pc = mapXY(fbarn.x, fbarn.z), p = [0, 0], hw = FBARN_BW / 2 * K + 6, hd = FBARN_BD / 2 * K + 6;
    g.save(); g.translate(pc[0], pc[1]); g.rotate(-bRot(fbarn));         // (turned the way it faces)
    g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(p[0] - hw + 8, p[1] - hd + 10, hw * 2, hd * 2);
    g.fillStyle = '#5a5654'; g.fillRect(p[0] - hw, p[1] - hd, hw, hd * 2); g.fillStyle = '#6e6a66'; g.fillRect(p[0], p[1] - hd, hw, hd * 2);
    g.fillStyle = '#7c7874'; g.fillRect(p[0] - hw * 0.62, p[1] - hd, hw * 0.62, hd * 2); g.fillStyle = '#8a8682'; g.fillRect(p[0], p[1] - hd, hw * 0.62, hd * 2);
    g.fillStyle = '#3e3430'; g.fillRect(p[0] - 2, p[1] - hd, 4, hd * 2);
    g.fillStyle = '#b84a3c'; g.fillRect(p[0] - 9, p[1] - 9, 18, 18); g.fillStyle = '#f6efe2'; g.fillRect(p[0] - 9, p[1] - 9, 18, 3);
    g.fillStyle = '#b84a3c'; g.fillRect(p[0] - 1.5 * K, p[1] + hd, 3 * K, 6); g.fillStyle = '#f6efe2'; g.fillRect(p[0] - 1, p[1] + hd, 2, 6);
    g.restore();
    label(siteReady(fbarn) ? 'Barn' : 'Barn (being built)', fbarn.x, fbarn.z, hd + 30);
  }
  var fbarnBaseInteract = interact;
  interact = function () {
    if (inFbarn && !glimNaming && !coopPlacing) { var tg = fbarnTarget(); if (tg) { if (tg === 'bench') fbarnBenchAction(); else fbarnCare(tg); return; } }
    return fbarnBaseInteract.apply(this, arguments);
  };
  function updateFbarn(dt, night) {
    if (inFbarn && player.parent !== fbarnScene) inFbarn = false;      // (carried home or teleported away from inside)
    updateFbarnButton();
    if (!fbarn.built) return;
    siteTick('fbarn');
    updateFbarnFeeding(dt);
    if (inFbarn) updateFbarnInside(state.time); else updateFbarnOutside(state.time, night);
  }
  function fbarnShopIcon() {                                           // (a little picture of the barn, for Oak & Ember's menu)
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(64, 114, 58, 8, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#8a8478'; g.fillRect(14, 104, 100, 7);
    var wg = g.createLinearGradient(0, 40, 0, 104); wg.addColorStop(0, '#c4544a'); wg.addColorStop(1, '#a8443a'); g.fillStyle = wg;
    g.beginPath(); g.moveTo(16, 104); g.lineTo(16, 64); g.lineTo(34, 40); g.lineTo(64, 28); g.lineTo(94, 40); g.lineTo(112, 64); g.lineTo(112, 104); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(80,20,15,0.35)'; g.lineWidth = 0.8; for (var b = 20; b < 110; b += 5) { g.beginPath(); g.moveTo(b, 104); g.lineTo(b, 40); g.stroke(); }
    g.fillStyle = 'rgba(70,40,20,0.2)'; g.fillRect(16, 96, 96, 8);
    g.strokeStyle = '#4e4a48'; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(10, 68); g.lineTo(33, 37); g.lineTo(64, 24); g.lineTo(95, 37); g.lineTo(118, 68); g.stroke();
    g.strokeStyle = '#f6efe2'; g.lineWidth = 2; g.beginPath(); g.moveTo(14, 66); g.lineTo(34, 40); g.lineTo(64, 28); g.lineTo(94, 40); g.lineTo(114, 66); g.stroke();
    g.fillStyle = '#c4544a'; g.fillRect(58, 14, 12, 12); g.fillStyle = '#f6efe2'; g.fillRect(60, 17, 8, 7); g.fillStyle = '#2a1c12'; for (var l = 0; l < 3; l++) g.fillRect(60, 18 + l * 2.2, 8, 1);
    g.fillStyle = '#55504c'; g.beginPath(); g.moveTo(55, 15); g.lineTo(64, 7); g.lineTo(73, 15); g.closePath(); g.fill();
    g.fillStyle = '#c08050'; g.beginPath(); g.arc(64, 3, 2.2, Math.PI * 0.3, Math.PI * 1.7); g.fill();
    [[46, 70], [65, 70]].forEach(function (d) { g.fillStyle = '#a84236'; g.fillRect(d[0], d[1], 17, 34); g.strokeStyle = '#f6efe2'; g.lineWidth = 1.6; g.strokeRect(d[0] + 0.8, d[1] + 0.8, 15.4, 32.4); g.beginPath(); g.moveTo(d[0] + 1, d[1] + 1); g.lineTo(d[0] + 16, d[1] + 17); g.moveTo(d[0] + 16, d[1] + 1); g.lineTo(d[0] + 1, d[1] + 17); g.moveTo(d[0] + 1, d[1] + 17); g.lineTo(d[0] + 16, d[1] + 33); g.moveTo(d[0] + 16, d[1] + 17); g.lineTo(d[0] + 1, d[1] + 33); g.stroke(); });
    g.fillStyle = '#3a3634'; g.fillRect(40, 68, 48, 2);
    g.fillStyle = '#a84236'; g.fillRect(57, 46, 14, 14); g.strokeStyle = '#f6efe2'; g.lineWidth = 1.4; g.strokeRect(57, 46, 14, 14); g.beginPath(); g.moveTo(57, 46); g.lineTo(71, 60); g.moveTo(71, 46); g.lineTo(57, 60); g.stroke();
    g.fillStyle = '#e8d070'; g.fillRect(58, 58, 12, 2);
    [[24, 76], [93, 76]].forEach(function (w) { g.fillStyle = '#ffe2a8'; g.fillRect(w[0], w[1], 11, 11); g.strokeStyle = '#f6efe2'; g.lineWidth = 1.6; g.strokeRect(w[0], w[1], 11, 11); g.beginPath(); g.moveTo(w[0] + 5.5, w[1]); g.lineTo(w[0] + 5.5, w[1] + 11); g.moveTo(w[0], w[1] + 5.5); g.lineTo(w[0] + 11, w[1] + 5.5); g.stroke(); g.fillStyle = '#7a5236'; g.fillRect(w[0] - 1, w[1] + 12, 13, 3); ['#f4a6c8', '#fff2e0', '#c8a8f0'].forEach(function (col, k) { g.fillStyle = col; g.beginPath(); g.arc(w[0] + 2 + k * 3.6, w[1] + 11.5, 1.5, 0, Math.PI * 2); g.fill(); }); });
    g.save(); g.translate(84, 54); g.rotate(Math.PI / 4); g.fillStyle = '#fbf3e4'; g.fillRect(-5, -5, 10, 10); g.fillStyle = '#e889b0'; g.fillRect(-3, -3, 6, 6); g.restore();
    g.fillStyle = '#e0c060'; g.fillRect(18, 98, 14, 8); g.fillRect(21, 92, 10, 7); g.fillStyle = '#b8343a'; g.fillRect(18, 101, 14, 1.2);
    g.fillStyle = '#c8ced4'; g.fillRect(100, 95, 7, 11); g.fillRect(101, 92, 5, 3);
    return c.toDataURL();
  }

  // ---------- Your mill: Oak & Ember's third building ----------
  // For 2,000 Star Coins, Oak & Ember builds you a windmill, placed with the same grid of your farm (it takes 4 × 4
  // tiles). It takes two days to build: right away a building site goes up on its spot (a stone footing, a timber
  // frame, scaffolding and stacks of lumber), by the next morning the lower half is boarded and its gallery is on,
  // and on the second morning it's finished, its sails turning in the breeze. It has no use just yet
  var MILL_FC = 4, MILL_FR = 4, MILL_DAYS = 2, MILL_R = 1.6, MILL_TOP = 6.4;   // tiles it takes; the days it takes to build; its tower's radius at the bottom, and its height
  var mill = { built: false, c: 0, r: 0, x: 0, z: 0, fy: 0, start: 0, stage: -1, grass: [], solids: [], tp: null };
  var millGroup = null, millSails = null, millFan = null, millGlows = [];
  function millCovers(x, z, r) { return mill.built && Math.abs(x - mill.x) < MILL_FC * TILE / 2 + r && Math.abs(z - mill.z) < MILL_FR * TILE / 2 + r; }
  var millBaseSoilNear = soilNear;                                     // (nothing grows back under the mill either)
  soilNear = function (x, z, r) { return millBaseSoilNear(x, z, r) || millCovers(x, z, r); };
  function millStage() { return !mill.built ? -1 : Math.min(MILL_DAYS, farmDay() - mill.start); }   // 0: just started, 1: half built, 2: finished
  var MILL_SPEC = { title: '🌾 Where should your mill go?', hint: 'Tap your farm to choose a spot. The mill takes 4 × 4 tiles, with its door facing south (down the map) to start.' + PLACE_HINT_END, fc: MILL_FC, fr: MILL_FR, bw: 3.6, bd: 3.6, off: 0, door: 0.9, roof: 'rgba(240,232,214,0.9)', doorCol: '#7a5236', emoji: '🌾', cost: MILL_COST,
    built: function () { return mill.built; }, build: function (c, r, rot) { millPlace(c, r, farmDay(), rot); },
    done: function () { return '🌾 Oak & Ember have started building your mill! It takes two days: it\'ll be finished on the morning of ' + seasonDay(mill.start + MILL_DAYS) + '.'; } };

  // ===== what it's made of =====
  var millBoardTex = cpTex(256, 256, function (g, w, h) {             // (white weatherboards, overlapping, each with a shadow under its edge)
    var n = 8, ph = h / n;
    for (var i = 0; i < n; i++) {
      var l = 232 + Math.random() * 16; g.fillStyle = 'rgb(' + Math.round(l) + ',' + Math.round(l * 0.97) + ',' + Math.round(l * 0.9) + ')'; g.fillRect(0, i * ph, w, ph);
      var sh = g.createLinearGradient(0, i * ph + ph - 7, 0, i * ph + ph); sh.addColorStop(0, 'rgba(90,70,50,0)'); sh.addColorStop(1, 'rgba(90,70,50,0.4)'); g.fillStyle = sh; g.fillRect(0, i * ph + ph - 7, w, 7);
      for (var s = 0; s < 14; s++) { var y = i * ph + 3 + Math.random() * (ph - 10); g.strokeStyle = 'rgba(150,120,90,' + (0.05 + Math.random() * 0.08) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (Math.random() - 0.5) * 3); g.stroke(); }
    }
  }, [6, 5]);
  var millStoneTex = cpTex(256, 128, function (g, w, h) {             // (rough fieldstone, mortared)
    g.fillStyle = '#8a857c'; g.fillRect(0, 0, w, h);
    for (var r = 0, y = 0; y < h; r++) { var rh = 14 + Math.random() * 8; for (var x = -(r % 2) * 14; x < w;) { var sw = 22 + Math.random() * 20, k = 140 + Math.random() * 50;
      g.fillStyle = 'rgb(' + Math.round(k) + ',' + Math.round(k * 0.97) + ',' + Math.round(k * 0.9) + ')'; g.beginPath(); g.ellipse(x + sw / 2, y + rh / 2, sw / 2 - 1.5, rh / 2 - 1.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.ellipse(x + sw / 2 - 3, y + rh / 2 - 3, sw / 4, rh / 5, 0, 0, Math.PI * 2); g.fill(); x += sw; } y += rh; }
  }, [5, 1]);
  var mlmBoard = new THREE.MeshStandardMaterial({ map: millBoardTex, roughness: 0.85 });
  var mlmStone = new THREE.MeshStandardMaterial({ map: millStoneTex, bumpMap: millStoneTex, bumpScale: 0.03, roughness: 0.95 });
  var mlmWood = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xb08a62, roughness: 0.85 });
  var mlmFrame = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xd8b48a, roughness: 0.85 });
  var mlmDark = new THREE.MeshStandardMaterial({ color: 0x4a3626, roughness: 0.8 });
  var mlmCloth = new THREE.MeshStandardMaterial({ color: 0xf2e8d4, roughness: 0.95, side: THREE.DoubleSide });
  var mlmCap = new THREE.MeshStandardMaterial({ color: 0x5a6a5e, roughness: 0.75 });
  var millSignTex = cpTex(512, 160, function (g, w, h) {
    g.fillStyle = '#7a5236'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4e6c8'; g.fillRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#5a3a20'; g.textAlign = 'center'; g.font = '600 50px Fredoka, Georgia, serif'; g.fillText('Your mill is coming!', w / 2, 70);
    g.font = '28px Fredoka, Georgia, serif'; g.fillText('🪚 Built by Oak & Ember · ready in two days', w / 2, 120);
  });
  function millRing(r, y) {                                            // (a point on an octagon of radius r, for a corner k)
    return function (k) { var a = (k + 0.5) / 8 * Math.PI * 2; return [Math.sin(a) * r, y, Math.cos(a) * r]; };
  }
  function millBeam(G, a, b, s, m) {                                   // (a square beam from point a to point b)
    var d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length(), o = new THREE.Mesh(new THREE.BoxGeometry(s, L, s), m);
    o.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); o.castShadow = o.receiveShadow = true; G.add(o); return o;
  }
  function millTowerRadius(y) { return MILL_R - (MILL_R - 1.0) * (y - 1.6) / (MILL_TOP - 1.6); }

  // ===== building it: a building site, then half built, then finished =====
  function millBuildModel(stage) {
    var G = new THREE.Group(); G.position.set(mill.x, mill.fy, mill.z); G.rotation.y = bRot(mill); millGlows = []; millSails = null; millFan = null;
    function gy(lx, lz) { return bGround(mill, lx, lz) - mill.fy; }
    var minG = 99; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) minG = Math.min(minG, gy(gx * 2, gz * 2));
    // (the stone base: two storeys of fieldstone, an octagon, with an arched door and little windows)
    var baseH = 1.6;
    cpPart(new THREE.CylinderGeometry(1.95, 2.05, baseH - minG + 0.1, 8), mlmStone, 0, (baseH + minG - 0.1) / 2, 0, 0, Math.PI / 8, 0, G);
    cpPart(new THREE.CylinderGeometry(2.0, 2.0, 0.1, 8), mlmDark, 0, baseH, 0, 0, Math.PI / 8, 0, G);
    if (stage === 0) cpPart(new THREE.PlaneGeometry(0.84, 1.2), cpmDark, 0, 0.6, 1.87, 0, 0, 0, G).castShadow = false;   // (the doorway, not hung yet)
    if (stage > 0) {
      var arch = new THREE.Shape(); arch.moveTo(-0.42, 0); arch.lineTo(0.42, 0); arch.lineTo(0.42, 0.95); arch.absarc(0, 0.95, 0.42, 0, Math.PI, false); arch.closePath();
      var ag = new THREE.ExtrudeGeometry(arch, { depth: 0.06, bevelEnabled: false });
      cpPart(ag, new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0x9a6e48, roughness: 0.8 }), 0, 0, 1.9, 0, 0, 0, G);
      var archF = new THREE.Shape(); archF.moveTo(-0.55, 0); archF.lineTo(0.55, 0); archF.lineTo(0.55, 0.95); archF.absarc(0, 0.95, 0.55, 0, Math.PI, false); archF.closePath();
      var hole = new THREE.Path(); hole.moveTo(-0.42, 0); hole.lineTo(0.42, 0); hole.lineTo(0.42, 0.95); hole.absarc(0, 0.95, 0.42, 0, Math.PI, false); hole.closePath(); archF.holes.push(hole);
      cpPart(new THREE.ExtrudeGeometry(archF, { depth: 0.1, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0xc8c0b0, roughness: 0.9 }), 0, 0, 1.86, 0, 0, 0, G);
      [0.25, 0.75].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.5, 0.04, 0.012), cpmIron, -0.12, y, 1.97, 0, 0, 0, G); });
      cpPart(new THREE.TorusGeometry(0.05, 0.01, 6, 14), cpmIron, 0.28, 0.55, 1.98, 0, 0, 0, G);
      [-1, 1].forEach(function (s) { var a = s * Math.PI / 2, wg = new THREE.Group(); wg.position.set(Math.sin(a) * 1.93, 1.0, Math.cos(a) * 1.93); wg.rotation.y = a; G.add(wg); cpPart(new THREE.PlaneGeometry(0.36, 0.44), cpmGlowWin, 0, 0, 0.05, 0, 0, 0, wg).castShadow = false; [[0, 0.25, 0.5, 0.07], [0, -0.25, 0.56, 0.08], [0.21, 0, 0.07, 0.5], [-0.21, 0, 0.07, 0.5], [0, 0, 0.36, 0.03], [0, 0, 0.03, 0.44]].forEach(function (f) { cpPart(new THREE.BoxGeometry(f[2], f[3], 0.06), cpmCream, f[0], f[1], 0.07, 0, 0, 0, wg); }); cpFlowerBox(wg, 0.4, -0.36, 0.12); });
      for (var st = 0; st < 3; st++) cpPart(new THREE.BoxGeometry(1.2 - st * 0.1, 0.12, 0.3), mlmStone, 0, gy(0, 2.2 + 0.3 * (2 - st)) + 0.06 + st * 0.12 - 0.12, 2.0 + 0.3 * (2 - st) - 0.2, 0, 0, 0, G);
    }
    var topY = stage === 0 ? 0 : stage === 1 ? 3.9 : MILL_TOP;            // (how high the boarding reaches)
    // (the smock tower: an octagon tapering up, boarded white with corner posts)
    if (stage > 0) {
      var tb = new THREE.CylinderGeometry(millTowerRadius(topY), MILL_R, topY - 1.6, 8, 1, true); tb.translate(0, (topY - 1.6) / 2 + 1.6, 0);
      cpPart(tb, mlmBoard, 0, 0, 0, 0, Math.PI / 8, 0, G).material.side = THREE.DoubleSide;
      [2.4, 3.7, 5.0].forEach(function (y, k) { if (y + 0.4 > topY) return; var r = millTowerRadius(y); [0, 3, 6].forEach(function (f) { var a = (f + k * 2) / 8 * Math.PI * 2 + Math.PI / 8 - Math.PI / 8, wg = new THREE.Group(); wg.position.set(Math.sin(a) * (r * Math.cos(Math.PI / 8) + 0.02), y, Math.cos(a) * (r * Math.cos(Math.PI / 8) + 0.02)); wg.rotation.y = a; G.add(wg); cpPart(new THREE.PlaneGeometry(0.3, 0.38), cpmGlowWin, 0, 0, 0.01, -0.12, 0, 0, wg).castShadow = false; [[0, 0.22, 0.42, 0.06], [0, -0.22, 0.46, 0.07], [0.18, 0, 0.06, 0.44], [-0.18, 0, 0.06, 0.44]].forEach(function (fr) { cpPart(new THREE.BoxGeometry(fr[2], fr[3], 0.05), mlmDark, fr[0], fr[1], 0.03, -0.12, 0, 0, wg); }); }); });
    }
    var frameTop = stage === 2 ? MILL_TOP : MILL_TOP;                  // (the frame is up from the first day)
    for (var k = 0; k < 8; k++) { var a0 = millRing(MILL_R + 0.02, 1.6)(k), a1 = millRing(millTowerRadius(frameTop) + 0.02, frameTop)(k); millBeam(G, a0, a1, stage === 0 ? 0.13 : 0.1, stage === 2 ? cpmCream : mlmFrame); }
    if (stage < 2) [2.6, 3.6, 4.6, 5.6, 6.35].forEach(function (y) { var r = millTowerRadius(y) + 0.03; for (var k2 = 0; k2 < 8; k2++) millBeam(G, millRing(r, y)(k2), millRing(r, y)(k2 + 1), 0.09, mlmFrame); });
    if (stage === 0) [1.0].forEach(function () { for (var k3 = 0; k3 < 8; k3++) millBeam(G, millRing(MILL_R + 0.02, 1.6)(k3), millRing(MILL_R + 0.02, 1.6)(k3 + 1), 0.12, mlmFrame); });
    // (the gallery: a wooden stage all round at the top of the stone base, with a railing)
    if (stage > 0) {
      var gal = new THREE.CylinderGeometry(2.45, 2.45, 0.08, 8); cpPart(gal, mlmWood, 0, 1.68, 0, 0, Math.PI / 8, 0, G);
      for (var b = 0; b < 8; b++) {
        var p0 = millRing(2.38, 1.72)(b), p1 = millRing(2.38, 1.72)(b + 1);
        millBeam(G, p0, [p0[0], 2.55, p0[2]], 0.07, mlmDark);
        millBeam(G, [p0[0], 2.55, p0[2]], [p1[0], 2.55, p1[2]], 0.07, mlmDark); millBeam(G, [p0[0], 2.12, p0[2]], [p1[0], 2.12, p1[2]], 0.05, mlmDark);
        for (var sp = 1; sp < 5; sp++) { var f = sp / 5; millBeam(G, [p0[0] + (p1[0] - p0[0]) * f, 1.72, p0[2] + (p1[2] - p0[2]) * f], [p0[0] + (p1[0] - p0[0]) * f, 2.12, p0[2] + (p1[2] - p0[2]) * f], 0.03, mlmDark); }
        millBeam(G, millRing(2.0, 1.2)(b), millRing(2.4, 1.64)(b), 0.07, mlmDark);   // (brackets under it)
      }
    }
    // (finished: the cap with its ridge, the windshaft, four lattice sails with canvas, and the fantail that turns it into the wind)
    if (stage === 2) {
      var CAP = new THREE.Group(); CAP.position.y = MILL_TOP; G.add(CAP);
      cpPart(new THREE.CylinderGeometry(1.12, 1.12, 0.14, 16), mlmDark, 0, 0.07, 0, 0, 0, 0, CAP);
      var capG = new THREE.SphereGeometry(1.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2); capG.scale(1, 0.85, 1.25);
      cpPart(capG, mlmCap, 0, 0.12, 0, 0, 0, 0, CAP);
      for (var rb = 0; rb < 9; rb++) { var ra = -Math.PI / 2 + rb / 8 * Math.PI; var ribPts = []; for (var q = 0; q <= 12; q++) { var t = q / 12 * Math.PI / 2; ribPts.push(new THREE.Vector3(Math.cos(t) * Math.sin(ra) * 1.16, 0.12 + Math.sin(t) * 0.98, Math.cos(t) * Math.cos(ra) * 1.44)); } cpPart(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ribPts), 16, 0.025, 5), cpmCream, 0, 0, 0, 0, 0, 0, CAP); }
      cpPart(new THREE.SphereGeometry(0.1, 12, 8), cpmCopper, 0, 1.12, 0, 0, 0, 0, CAP); cpPart(new THREE.ConeGeometry(0.05, 0.3, 8), cpmCopper, 0, 1.3, 0, 0, 0, 0, CAP);
      cpPart(new THREE.CylinderGeometry(0.16, 0.18, 1.0, 12), mlmDark, 0, 0.55, 1.2, Math.PI / 2 - 0.12, 0, 0, CAP);   // (the windshaft, tilted up a little)
      var SL = new THREE.Group(); SL.position.set(0, 0.6, 1.72); SL.rotation.x = -0.12; CAP.add(SL); millSails = new THREE.Group(); SL.add(millSails);
      cpPart(new THREE.CylinderGeometry(0.28, 0.28, 0.3, 14), mlmDark, 0, 0, 0, Math.PI / 2, 0, 0, millSails); cpPart(new THREE.SphereGeometry(0.16, 12, 8), cpmCopper, 0, 0, 0.18, 0, 0, 0, millSails);
      for (var sl = 0; sl < 4; sl++) {
        var S = new THREE.Group(); S.rotation.z = sl * Math.PI / 2 + Math.PI / 4; millSails.add(S);
        cpPart(new THREE.BoxGeometry(0.13, 4.3, 0.12), mlmWood, 0, 2.15, 0.05, 0, 0, 0, S);   // (the whip)
        for (var bar = 0; bar < 15; bar++) cpPart(new THREE.BoxGeometry(0.75, 0.035, 0.04), mlmDark, 0.38, 0.75 + bar * 0.24, 0.07, 0, 0, 0, S);
        [0.06, 0.74].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.04, 3.4, 0.05), mlmDark, x, 2.45, 0.07, 0, 0, 0, S); });
        var cloth = new THREE.PlaneGeometry(0.66, 3.3, 2, 12), cp2 = cloth.attributes.position; for (var v = 0; v < cp2.count; v++) cp2.setZ(v, Math.sin((cp2.getX(v) + 0.33) / 0.66 * Math.PI) * 0.05);
        cloth.computeVertexNormals(); cpPart(cloth, mlmCloth, 0.4, 2.45, 0.1, 0, 0, 0, S).castShadow = true;
        [1.2, 2.4, 3.6].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.74, 0.015, 0.015), new THREE.MeshStandardMaterial({ color: 0xc8a878 }), 0.4, y, 0.14, 0, 0, 0, S); });   // (reefing ropes)
      }
      var FT = new THREE.Group(); FT.position.set(0, 0.35, -1.25); CAP.add(FT);   // (the fantail on its frame at the back)
      millBeam(FT, [0, 0, 0], [0, 0.3, -0.9], 0.06, mlmDark); millBeam(FT, [-0.3, -0.1, 0], [0, 0.3, -0.9], 0.05, mlmDark); millBeam(FT, [0.3, -0.1, 0], [0, 0.3, -0.9], 0.05, mlmDark);
      millFan = new THREE.Group(); millFan.position.set(0, 0.45, -0.92); millFan.rotation.y = Math.PI / 2; FT.add(millFan);
      for (var fb = 0; fb < 6; fb++) { var bl = new THREE.Group(); bl.rotation.x = fb / 6 * Math.PI * 2; millFan.add(bl); cpPart(new THREE.BoxGeometry(0.03, 0.42, 0.12), cpmCream, 0, 0.24, 0, 0, 0.5, 0, bl); }
      cpPart(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), mlmDark, 0, 0, 0, 0, 0, Math.PI / 2, millFan);
      cpLantern(G, 0.62, 1.25, 2.12, millGlows); cpPart(new THREE.BoxGeometry(0.04, 0.04, 0.2), cpmIron, 0.62, 1.42, 2.02, 0, 0, 0, G);
      // (sacks of flour by the door, a barrel, and flowers)
      [[-1.4, 2.0, 0.4, 0], [-1.75, 1.6, -0.3, 1]].forEach(function (sk) { if (!barnSackProtos[sk[3]]) return; var sg = barnSackProtos[sk[3]].clone(); sg.position.set(sk[0], gy(sk[0], sk[1]), sk[1]); sg.rotation.set(0, sk[2], 0); sg.scale.setScalar(0.85); G.add(sg); });
      coopBarrel(G, 1.55, gy(1.55, 1.75), 1.75, 0.26, 0.74, false);
      coopFlowers(G, [[-0.9, gy(-0.9, 2.15), 2.15], [0.95, gy(0.95, 2.15), 2.15], [-2.1, gy(-2.1, 0.2), 0.2], [2.1, gy(2.1, 0.2), 0.2], [-1.2, gy(-1.2, -1.8), -1.8], [1.2, gy(1.2, -1.8), -1.8]], 77);
    } else {
      // (the building site: scaffolding up two sides with ladders, stacks of lumber, a sawhorse, stones, and Oak & Ember's sign)
      var hgt = stage === 0 ? 4.4 : 6.6;
      [[-1, 1], [1, 1]].forEach(function (sd) {
        var cx = sd[0] * 1.55, cz = 2.15;
        [[cx - 0.6, cz], [cx + 0.6, cz], [cx - 0.6, cz - 1.05], [cx + 0.6, cz - 1.05]].forEach(function (p) { cpPart(new THREE.CylinderGeometry(0.035, 0.035, hgt - minG, 6), mlmFrame, p[0], (hgt + minG) / 2, p[1], 0, 0, 0, G); });
        for (var lv = 1.2; lv < hgt; lv += 1.1) { cpPart(new THREE.BoxGeometry(1.3, 0.04, 0.32), mlmWood, cx, lv, cz - 0.15, 0, 0, 0, G); cpPart(new THREE.CylinderGeometry(0.025, 0.025, 1.25, 6), mlmFrame, cx, lv + 0.45, cz, 0, 0, Math.PI / 2, G); }
        millBeam(G, [cx - 0.6, 0.3, cz], [cx + 0.6, Math.min(hgt - 0.3, 2.6), cz], 0.04, mlmFrame);
      });
      var LD = new THREE.Group(); LD.position.set(2.15, 0, 2.3); LD.rotation.set(0.0, 0.3, -0.25); G.add(LD);
      [-0.2, 0.2].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.05, 3.2, 0.05), mlmFrame, x, 1.6, 0, 0, 0, 0, LD); }); for (var lr = 0; lr < 10; lr++) cpPart(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 5), mlmWood, 0, 0.25 + lr * 0.3, 0, 0, 0, Math.PI / 2, LD);
      [[-2.05, -1.9, 0.3], [2.0, -1.85, -0.4]].forEach(function (lp, li) { for (var pl = 0; pl < 7; pl++) cpPart(new THREE.BoxGeometry(1.6, 0.06, 0.2), [mlmWood, mlmFrame][(pl + li) % 2], lp[0] + (pl % 2) * 0.05, gy(lp[0], lp[1]) + 0.05 + Math.floor(pl / 3) * 0.06, lp[1] + (pl % 3) * 0.21 - 0.21, 0, lp[2], 0, G); });
      var SH = new THREE.Group(); SH.position.set(-2.1, gy(-2.1, 0.9), 0.9); SH.rotation.y = 0.5; G.add(SH);
      cpPart(new THREE.BoxGeometry(1.0, 0.1, 0.12), mlmWood, 0, 0.62, 0, 0, 0, 0, SH); [-0.4, 0.4].forEach(function (x) { [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.06, 0.7, 0.06), mlmWood, x, 0.32, s * 0.14, s * 0.35, 0, 0, SH); }); });
      cpPart(new THREE.BoxGeometry(0.5, 0.05, 0.16), mlmFrame, 0.1, 0.7, 0, 0, 0.2, 0, SH);
      for (var sn = 0; sn < 9; sn++) cpPart(new THREE.DodecahedronGeometry(0.16 + isle2Hash(sn) * 0.08, 0), cpmFootStone, 2.1 + (isle2Hash(sn * 3) - 0.5) * 0.6, gy(2.1, 0.6) + 0.12 + (sn > 5 ? 0.18 : 0), 0.6 + (isle2Hash(sn * 5) - 0.5) * 0.6, sn, sn * 2, 0, G).material = new THREE.MeshStandardMaterial({ color: 0x9a948a, roughness: 0.95 });
      var SG = new THREE.Group(); SG.position.set(0, gy(0, 2.45), 2.45); G.add(SG);
      [-0.55, 0.55].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.07, 1.1, 0.07), mlmWood, x, 0.55, -0.02, 0, 0, 0, SG); });
      cpPart(new THREE.BoxGeometry(1.3, 0.44, 0.04), mlmWood, 0, 0.85, 0, 0, 0, 0, SG);
      cpPart(new THREE.PlaneGeometry(1.24, 0.39), new THREE.MeshStandardMaterial({ map: millSignTex, roughness: 0.8 }), 0, 0.85, 0.022, 0, 0, 0, SG).castShadow = false;
    }
    scene.add(G);
    return G;
  }
  function millPlace(c0, r0, start, rot) {
    millRemove();
    mill.built = true; mill.c = c0; mill.r = r0; mill.start = start; mill.rot = rot || 0;
    mill.x = FARM_X + (c0 + MILL_FC / 2) * TILE; mill.z = FARM_Z + (r0 + MILL_FR / 2) * TILE;
    var top = -9; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) top = Math.max(top, groundHeight(mill.x + gx * 2, mill.z + gz * 2));
    mill.fy = top + 0.05;
    var HX = MILL_FC * TILE / 2, HZ = MILL_FR * TILE / 2;
    allScenery.forEach(function (t) { var u = t.userData; if (u.gone || u.state === 'standing') return; if (Math.abs(u.solid.x - mill.x) < HX + u.solidR && Math.abs(u.solid.z - mill.z) < HZ + u.solidR) setSceneryCut(t, u.state === 'regrowing' ? u.felledAt : gameMinutes()); });
    mineable.forEach(function (r) { if (r.gone || r.state === 'whole') return; if (Math.abs(r.solid.x - mill.x) < HX + r.solidR && Math.abs(r.solid.z - mill.z) < HZ + r.solidR) setRockBroken(r, r.state === 'regrowing' ? r.brokeAt : gameMinutes()); });
    for (var c = c0; c < c0 + MILL_FC; c++) for (var r = r0; r < r0 + MILL_FR; r++) { var ft = { x: FARM_X + (c + 0.5) * TILE, z: FARM_Z + (r + 0.5) * TILE }; coverGrass(ft); mill.grass.push(ft); }
    [[0, 0, 2.45], [-2.05, -1.9, 0.5], [2.0, -1.85, 0.5]].forEach(function (s) { var w = bOff(mill, s[0], s[1]), sd = { x: mill.x + w.x, z: mill.z + w.z, r: s[2] }; solids.push(sd); mill.solids.push(sd); });
    mill.stage = millStage(); millGroup = millBuildModel(mill.stage);
    if (!mill.tp) mill.tp = { name: 'Your Mill', icon: '🌾', spot: function () { var f = bOff(mill, 0, 3.6); return { x: mill.x + f.x, z: mill.z + f.z, face: bRot(mill) + Math.PI, view: bRot(mill) }; } };
    if (TELEPORTS.indexOf(mill.tp) < 0) TELEPORTS.push(mill.tp);
    flushDirty();
  }
  function millRemove() {
    if (!mill.built) return;
    if (millGroup) { scene.remove(millGroup); millGroup = null; }
    mill.solids.forEach(function (sd) { var i = solids.indexOf(sd); if (i >= 0) solids.splice(i, 1); }); mill.solids = [];
    mill.grass.forEach(uncoverGrass); mill.grass = [];
    var ti = TELEPORTS.indexOf(mill.tp); if (ti >= 0) TELEPORTS.splice(ti, 1);
    mill.built = false; mill.stage = -1;
  }
  function millSaveData() { return mill.built ? { c: mill.c, r: mill.r, rot: mill.rot || 0, start: mill.start } : null; }
  function millLoadData(d) { millRemove(); if (d) millPlace(d.c, d.r, d.start, d.rot || 0); }
  function millDrawOnMap(g, K, label) {                                // (on the world map: its octagon, and its sails, once it's finished)
    var pc = mapXY(mill.x, mill.z), p = [0, 0], r = 2.4 * K;
    g.save(); g.translate(pc[0], pc[1]); g.rotate(-bRot(mill));           // (turned the way it faces)
    g.beginPath(); for (var k = 0; k < 8; k++) { var a = (k + 0.5) / 8 * Math.PI * 2; g.lineTo(p[0] + Math.sin(a) * r, p[1] + Math.cos(a) * r); } g.closePath(); g.fillStyle = mill.stage === 2 ? '#e8e0cc' : '#c8a878'; g.fill(); g.strokeStyle = '#7a5236'; g.lineWidth = 2; g.stroke();
    g.beginPath(); g.arc(p[0], p[1], 1.1 * K, 0, Math.PI * 2); g.fillStyle = mill.stage === 2 ? '#5a6a5e' : '#a07850'; g.fill();
    if (mill.stage === 2) { g.strokeStyle = '#4a3626'; g.lineWidth = 5; [[-1, -1], [1, 1], [-1, 1], [1, -1]].forEach(function (d) { g.beginPath(); g.moveTo(p[0], p[1] + 1.5 * K); g.lineTo(p[0] + d[0] * 3 * K, p[1] + 1.5 * K + d[1] * 0.4 * K); g.stroke(); }); }
    g.restore();
    label(mill.stage === 2 ? 'Mill' : 'Mill (being built)', mill.x, mill.z, 2.4 * K + 28);
  }
  function updateMill(dt, night) {
    if (!mill.built) return;
    var st = millStage();
    if (st !== mill.stage) {                                            // (a new morning: Oak & Ember have got further)
      var was = mill.stage; mill.stage = st;
      if (millGroup) scene.remove(millGroup); millGroup = millBuildModel(st);
      if (was >= 0) setTimeout(function () { showToast(st === 2 ? '🌾 Your mill is finished! Oak & Ember have put the last of its sails up.' : '🪚 Oak & Ember worked on your mill all day: it\'s half built! One more day to go.', 4200); }, 6400);
    }
    if (millSails) millSails.rotation.z -= dt * 0.55;
    if (millFan) millFan.rotation.x += dt * 1.1;
    millGlows.forEach(function (L) { var fl = 1 + Math.sin(state.time * 11 + L.p) * 0.1; L.f.scale.set(fl, 1.5 * fl, fl); L.h.material.opacity = (0.25 + night * 0.5) * fl; });
  }
  function millShopIcon() {                                            // (a little picture of the mill, for Oak & Ember's menu)
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(64, 116, 40, 7, 0, 0, Math.PI * 2); g.fill();
    var sg = g.createLinearGradient(0, 86, 0, 116); sg.addColorStop(0, '#a8a296'); sg.addColorStop(1, '#888276'); g.fillStyle = sg; g.fillRect(40, 86, 48, 30);
    g.fillStyle = 'rgba(255,255,255,0.2)'; for (var s = 0; s < 12; s++) g.fillRect(42 + (s % 4) * 12 + (Math.floor(s / 4) % 2) * 5, 89 + Math.floor(s / 4) * 9, 9, 6);
    g.fillStyle = '#7a5236'; g.beginPath(); g.moveTo(58, 116); g.lineTo(58, 102); g.arc(64, 102, 6, Math.PI, 0); g.lineTo(70, 116); g.closePath(); g.fill();
    g.fillStyle = '#5a3a26'; g.fillRect(30, 84, 68, 4); for (var r = 32; r < 98; r += 6) g.fillRect(r, 78, 1.6, 7); g.fillRect(30, 77, 68, 2);
    var tg = g.createLinearGradient(44, 0, 84, 0); tg.addColorStop(0, '#e8e0cc'); tg.addColorStop(0.5, '#fbf6ea'); tg.addColorStop(1, '#dcd2bc'); g.fillStyle = tg;
    g.beginPath(); g.moveTo(44, 84); g.lineTo(52, 34); g.lineTo(76, 34); g.lineTo(84, 84); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(120,100,80,0.3)'; g.lineWidth = 0.7; for (var b = 38; b < 84; b += 4) { var w = 12 + (b - 34) / 50 * 8; g.beginPath(); g.moveTo(64 - w, b); g.lineTo(64 + w, b); g.stroke(); }
    g.fillStyle = '#ffe2a8'; g.fillRect(60, 52, 8, 9); g.strokeStyle = '#4a3626'; g.lineWidth = 1.2; g.strokeRect(60, 52, 8, 9);
    g.fillStyle = '#5a6a5e'; g.beginPath(); g.ellipse(64, 34, 15, 9, 0, Math.PI, 0); g.fill(); g.fillStyle = '#c08050'; g.beginPath(); g.arc(64, 24, 2, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(64, 36); g.rotate(0.3);
    for (var sl = 0; sl < 4; sl++) { g.save(); g.rotate(sl * Math.PI / 2); g.fillStyle = '#7a5236'; g.fillRect(-1.2, 0, 2.4, 34); g.fillStyle = '#f2e8d4'; g.fillRect(1.2, 8, 9, 25); g.strokeStyle = '#4a3626'; g.lineWidth = 0.7; g.strokeRect(1.2, 8, 9, 25); for (var bb = 11; bb < 33; bb += 4) { g.beginPath(); g.moveTo(1.2, bb); g.lineTo(10.2, bb); g.stroke(); } g.restore(); }
    g.fillStyle = '#4a3626'; g.beginPath(); g.arc(0, 0, 3.4, 0, Math.PI * 2); g.fill(); g.restore();
    [[38, 112, '#f4a6c8'], [44, 113, '#fff2e0'], [86, 112, '#c8a8f0'], [91, 113, '#ffb08a']].forEach(function (f) { g.fillStyle = '#5f9a48'; g.beginPath(); g.arc(f[0], f[1] + 1, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = f[2]; g.beginPath(); g.arc(f[0], f[1] - 1, 1.6, 0, Math.PI * 2); g.fill(); });
    return c.toDataURL();
  }

  // ---------- Your silo: Oak & Ember's fourth building ----------
  // For 2,500 Star Coins, Oak & Ember builds you a tall red stave silo with a silver dome, placed with the same grid
  // of your farm (it takes 3 × 3 tiles). It takes two days to build. It holds hay and nothing else, 300 bundles at
  // most: walk up to it with hay in your bag and press Interact to pour it in through the chute. A glass strip up its
  // front shows how full it is. The hay comes back out through hoppers, one in your coop by the door and one on the
  // right-hand wall of your barn: each press of Interact at a hopper drops a bundle into your bag, ready for the bench
  var SILO_FC = 3, SILO_FR = 3, SILO_DAYS = 2, SILO_R = 1.3, SILO_H = 5.2, SILO_CAP = 300;   // tiles it takes; days to build; its radius and the height of its walls; the most hay it holds
  var silo = { built: false, c: 0, r: 0, x: 0, z: 0, fy: 0, start: 0, stage: -1, hay: 0, grass: [], solids: [] };
  var siloGroup = null, siloGauge = null, siloTuft = null, siloGlows = [], siloHopperTufts = [];
  function siloCovers(x, z, r) { return silo.built && Math.abs(x - silo.x) < SILO_FC * TILE / 2 + r && Math.abs(z - silo.z) < SILO_FR * TILE / 2 + r; }
  var siloBaseSoilNear = soilNear;                                     // (nothing grows back under the silo either)
  soilNear = function (x, z, r) { return siloBaseSoilNear(x, z, r) || siloCovers(x, z, r); };
  function siloStage() { return !silo.built ? -1 : Math.min(SILO_DAYS, farmDay() - silo.start); }   // 0: just started, 1: half built, 2: finished
  function siloReady() { return silo.built && silo.stage >= SILO_DAYS; }
  var SILO_SPEC = { title: '🌾 Where should your silo go?', hint: 'Tap your farm to choose a spot. The silo takes 3 × 3 tiles, with its hay chute facing south (down the map) to start.' + PLACE_HINT_END, fc: SILO_FC, fr: SILO_FR, bw: 2.7, bd: 2.7, off: 0, door: 0.7, roof: 'rgba(200,206,214,0.92)', doorCol: '#8a6040', emoji: '🌾', cost: SILO_COST,
    built: function () { return silo.built; }, build: function (c, r, rot) { silo.hay = 0; siloPlace(c, r, farmDay(), rot); },
    done: function () { return '🌾 Oak & Ember have started building your silo! It takes two days: it\'ll be finished on the morning of ' + seasonDay(silo.start + SILO_DAYS) + '.'; } };

  // ===== what it's made of =====
  var siloStaveTex = cpTex(256, 256, function (g, w, h) {             // (red-painted staves standing side by side, each with its own grain and a pale seam)
    var n = 16, sw = w / n;
    for (var i = 0; i < n; i++) {
      var k = 0.9 + Math.random() * 0.14; g.fillStyle = 'rgb(' + Math.round(184 * k) + ',' + Math.round(74 * k) + ',' + Math.round(60 * k) + ')'; g.fillRect(i * sw, 0, sw, h);
      for (var s = 0; s < 6; s++) { var x = i * sw + 2 + Math.random() * (sw - 4); g.strokeStyle = 'rgba(90,30,20,' + (0.08 + Math.random() * 0.1) + ')'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 2, h * 0.3, x - 2, h * 0.7, x + 1, h); g.stroke(); }
      g.fillStyle = 'rgba(60,20,14,0.45)'; g.fillRect(i * sw, 0, 1.5, h); g.fillStyle = 'rgba(255,220,200,0.12)'; g.fillRect(i * sw + 1.5, 0, 1.5, h);
      for (var p = 0; p < 3; p++) { g.fillStyle = 'rgba(240,226,206,' + (0.05 + Math.random() * 0.08) + ')'; g.fillRect(i * sw + Math.random() * sw, Math.random() * h, 2 + Math.random() * 4, 6 + Math.random() * 20); }   // (weathered paint)
    }
  }, [6, 3]);
  var smStave = new THREE.MeshStandardMaterial({ map: siloStaveTex, roughness: 0.82 });
  var smStaveIn = new THREE.MeshStandardMaterial({ map: siloStaveTex, color: 0x9a7060, roughness: 0.9, side: THREE.BackSide });
  var smDome = new THREE.MeshStandardMaterial({ color: 0xc4cad2, metalness: 0.65, roughness: 0.32 });
  var smRib = new THREE.MeshStandardMaterial({ color: 0x9aa2ac, metalness: 0.7, roughness: 0.3 });
  var smHoop = new THREE.MeshStandardMaterial({ color: 0x3a3634, metalness: 0.55, roughness: 0.45 });
  var smHay = new THREE.MeshStandardMaterial({ map: haySideTex, color: 0xf0d080, roughness: 1 });
  var smGlass = new THREE.MeshStandardMaterial({ color: 0xcfe6f0, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.32, depthWrite: false });
  var smConcrete = new THREE.MeshStandardMaterial({ color: 0xb8b2a6, roughness: 0.95 });
  var siloCountCv = document.createElement('canvas'); siloCountCv.width = 256; siloCountCv.height = 128;
  var siloCountTex = new THREE.CanvasTexture(siloCountCv), siloCountShown = -1;
  function siloDrawCount() {                                           // (the little plaque on the silo and on each hopper: how much hay is in your silo)
    if (siloCountShown === silo.hay) return; siloCountShown = silo.hay;
    var g = siloCountCv.getContext('2d'), w = 256, h = 128;
    g.fillStyle = '#6a4630'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4e6c8'; g.fillRect(7, 7, w - 14, h - 14);
    g.strokeStyle = 'rgba(122,82,54,0.5)'; g.lineWidth = 2; g.strokeRect(13, 13, w - 26, h - 26);
    g.fillStyle = '#5a3a20'; g.textAlign = 'center'; g.font = '600 30px Fredoka, Georgia, serif'; g.fillText('🌾 Silo hay', w / 2, 50);
    g.font = '600 40px Fredoka, Georgia, serif'; g.fillStyle = silo.hay >= SILO_CAP ? '#2f8a4e' : silo.hay ? '#5a3a20' : '#a04a3a'; g.fillText(silo.hay + ' / ' + SILO_CAP, w / 2, 98);
    siloCountTex.needsUpdate = true;
  }

  // ===== building it: a building site, then half built, then finished =====
  function siloBuildModel(stage) {
    var G = new THREE.Group(); G.position.set(silo.x, silo.fy, silo.z); G.rotation.y = bRot(silo); siloGlows = []; siloGauge = null; siloTuft = null;
    var R = SILO_R;
    function gy(lx, lz) { return bGround(silo, lx, lz) - silo.fy; }
    function on(a, r, y) { return [Math.sin(a) * r, y, Math.cos(a) * r]; }   // (a point round the silo, at angle a from the front)
    var minG = 99; for (var k = 0; k < 12; k++) { var a0 = k / 12 * Math.PI * 2; minG = Math.min(minG, gy(Math.sin(a0) * (R + 0.4), Math.cos(a0) * (R + 0.4))); }
    var fh = -minG + 0.12;
    cpPart(new THREE.CylinderGeometry(R + 0.42, R + 0.46, fh, 40), smConcrete, 0, -fh / 2 + 0.06, 0, 0, 0, 0, G);   // (a round concrete pad it all stands on)
    var wallTop = stage === 0 ? 0.55 : stage === 1 ? 2.9 : SILO_H;
    // (a fieldstone base, then the red staves above it, open at the top until the dome goes on)
    cpPart(new THREE.CylinderGeometry(R + 0.1, R + 0.14, 0.86, 40), mlmStone, 0, 0.49, 0, 0, 0, 0, G);
    cpPart(new THREE.TorusGeometry(R + 0.1, 0.035, 6, 48), smConcrete, 0, 0.92, 0, Math.PI / 2, 0, 0, G);
    if (wallTop > 1) {
      var body = new THREE.CylinderGeometry(R, R, wallTop - 0.9, 48, 1, true);
      cpPart(body, smStave, 0, 0.9 + (wallTop - 0.9) / 2, 0, 0, 0, 0, G); cpPart(body, smStaveIn, 0, 0.9 + (wallTop - 0.9) / 2, 0, 0, 0, 0, G);
      for (var hy = 1.4; hy < wallTop - 0.15; hy += 0.62) {            // (iron hoops round it, each drawn tight with a pair of lugs)
        cpPart(new THREE.TorusGeometry(R + 0.014, 0.022, 6, 64), smHoop, 0, hy, 0, Math.PI / 2, 0, 0, G);
        var la = 2.2 + (hy * 1.7) % 1.2, lp = on(la, R + 0.05, hy);
        cpPart(new THREE.BoxGeometry(0.07, 0.09, 0.06), smHoop, lp[0], lp[1], lp[2], 0, la, 0, G);
        cpPart(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), cpmBrass, lp[0], lp[1], lp[2], 0, la, Math.PI / 2, G);
      }
      cpPart(new THREE.TorusGeometry(R + 0.02, 0.04, 6, 64), mlmDark, 0, wallTop - 0.02, 0, Math.PI / 2, 0, 0, G);   // (a dark rim along the top)
    }
    if (stage === 2) {
      // (the silver dome, with ribs down it, a ring round its foot, and a little vent with a cap on top)
      var D = new THREE.Group(); D.position.y = SILO_H; D.scale.y = 0.72; G.add(D);
      cpPart(new THREE.SphereGeometry(R + 0.07, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), smDome, 0, 0, 0, 0, 0, 0, D);
      for (var rb = 0; rb < 16; rb++) cpPart(new THREE.TorusGeometry(R + 0.08, 0.016, 4, 24, Math.PI / 2), smRib, 0, 0, 0, 0, rb / 16 * Math.PI * 2, 0, D);
      cpPart(new THREE.TorusGeometry(R + 0.09, 0.05, 8, 64), smRib, 0, SILO_H + 0.02, 0, Math.PI / 2, 0, 0, G);
      var vy = SILO_H + (R + 0.07) * 0.72;
      cpPart(new THREE.CylinderGeometry(0.16, 0.2, 0.3, 16), smDome, 0, vy + 0.1, 0, 0, 0, 0, G);
      cpPart(new THREE.ConeGeometry(0.3, 0.2, 16), smRib, 0, vy + 0.36, 0, 0, 0, 0, G);
      cpPart(new THREE.SphereGeometry(0.06, 12, 8), cpmBrass, 0, vy + 0.5, 0, 0, 0, 0, G);
      [0, 1, 2, 3].forEach(function (q) { var a = q * Math.PI / 2 + 0.4; cpPart(new THREE.BoxGeometry(0.03, 0.12, 0.03), smHoop, Math.sin(a) * 0.17, vy + 0.29, Math.cos(a) * 0.17, 0, 0, 0, G); });
      // (a tiny weathervane: a hay bundle on an arrow)
      var WV = new THREE.Group(); WV.position.set(0, vy + 0.55, 0); WV.rotation.y = 0.7; G.add(WV);
      cpPart(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 6), smHoop, 0, 0.25, 0, 0, 0, 0, WV);
      cpPart(new THREE.BoxGeometry(0.42, 0.012, 0.012), smHoop, 0, 0.4, 0, 0, 0, 0, WV); cpPart(new THREE.ConeGeometry(0.03, 0.08, 4), smHoop, 0.23, 0.4, 0, 0, 0, -Math.PI / 2, WV);
      cpPart(new THREE.BoxGeometry(0.06, 0.08, 0.008), smHoop, -0.2, 0.4, 0, 0, 0, 0, WV);
      var vb = pickupModel('hay'); vb.scale.setScalar(0.55); vb.position.set(0, 0.46, 0); WV.add(vb);
      // (a ladder up its side to the dome, with a safety cage round the top half)
      var la2 = -2.35, LD = new THREE.Group(); var lp2 = on(la2, R + 0.12, 0); LD.position.set(lp2[0], 0, lp2[2]); LD.rotation.y = la2; G.add(LD);
      var ltop = SILO_H + 0.5;
      [-0.18, 0.18].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.035, ltop - 0.6, 0.035), smHoop, x, 0.6 + (ltop - 0.6) / 2, 0, 0, 0, 0, LD); cpPart(new THREE.BoxGeometry(0.03, 0.03, 0.12), smHoop, x, 1.0, -0.06, 0, 0, 0, LD); cpPart(new THREE.BoxGeometry(0.03, 0.03, 0.12), smHoop, x, ltop - 0.6, -0.06, 0, 0, 0, LD); });
      for (var rg = 0.9; rg < ltop - 0.1; rg += 0.3) cpPart(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), smHoop, 0, rg, 0, 0, 0, Math.PI / 2, LD);
      for (var cg = 2.4; cg < ltop; cg += 0.55) cpPart(new THREE.TorusGeometry(0.28, 0.012, 4, 16, Math.PI), smHoop, 0, cg, 0, Math.PI / 2, 0, 0, LD);
      [-0.26, 0, 0.26].forEach(function (x) { var zz = Math.sqrt(Math.max(0, 0.0784 - x * x)); cpPart(new THREE.BoxGeometry(0.014, ltop - 2.4, 0.014), smHoop, x, 2.4 + (ltop - 2.4) / 2, zz, 0, 0, 0, LD); });
      // (the fill gauge: a glass strip up the front, with the hay inside rising and falling as you fill it and use it)
      var ga = -0.42, GG = new THREE.Group(); var gp = on(ga, R + 0.005, 0); GG.position.set(gp[0], 0, gp[2]); GG.rotation.y = ga; G.add(GG);
      cpPart(new THREE.BoxGeometry(0.22, 3.5, 0.03), mlmDark, 0, 1.1 + 1.75, -0.005, 0, 0, 0, GG);
      siloGauge = cpPart(new THREE.BoxGeometry(0.16, 1, 0.02), smHay, 0, 1.15, 0.012, 0, 0, 0, GG); siloGauge.castShadow = false;
      cpPart(new THREE.PlaneGeometry(0.16, 3.4), smGlass, 0, 1.15 + 1.7, 0.026, 0, 0, 0, GG).castShadow = false;
      [[0, 0.06, 0.26, 0.05], [3.4, 0.06, 0.26, 0.05], [1.7, 0.03, 0.06, 0.02], [0.85, 0.02, 0.04, 0.02], [2.55, 0.02, 0.04, 0.02]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], b[1], b[3]), b[1] > 0.04 ? mlmDark : cpmBrass, 0.1, 1.15 + b[0], 0.03, 0, 0, 0, GG); });
      // (the hay chute at the front: a hatch in the staves and a wooden trough sloping up to it, with a bundle waiting in it when there's hay inside)
      var CH = new THREE.Group(); var cp2 = on(0, R, 0); CH.position.set(cp2[0], 0, cp2[2]); G.add(CH);
      cpPart(new THREE.BoxGeometry(0.66, 0.74, 0.1), mlmWood, 0, 1.38, -0.005, 0, 0, 0, CH);
      [[0, 1.77, 0.76, 0.06], [0, 0.99, 0.76, 0.06], [-0.36, 1.38, 0.06, 0.84], [0.36, 1.38, 0.06, 0.84]].forEach(function (b) { cpPart(new THREE.BoxGeometry(b[2], b[3], 0.06), mlmDark, b[0], b[1], 0.04, 0, 0, 0, CH); });
      [1.15, 1.6].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.3, 0.04, 0.02), smHoop, -0.18, y, 0.06, 0, 0, 0, CH); });
      cpPart(new THREE.BoxGeometry(0.05, 0.05, 0.05), cpmBrass, 0.24, 1.38, 0.07, 0, 0, 0, CH);
      var TR = new THREE.Group(); TR.position.set(0, 1.0, 0.1); TR.rotation.x = 0.42; CH.add(TR);
      cpPart(new THREE.BoxGeometry(0.62, 0.04, 0.72), mlmWood, 0, 0, 0.36, 0, 0, 0, TR);
      [-0.31, 0.31].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.04, 0.18, 0.72), mlmFrame, x, 0.08, 0.36, 0, 0, 0, TR); });
      cpPart(new THREE.BoxGeometry(0.62, 0.14, 0.04), mlmFrame, 0, 0.06, 0.72, 0, 0, 0, TR);
      siloTuft = pickupModel('hay'); siloTuft.scale.setScalar(1.6); siloTuft.position.set(0, 0.12, 0.42); siloTuft.rotation.y = Math.PI / 2; TR.add(siloTuft);
      [-0.24, 0.24].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.05, 0.66, 0.05), mlmDark, x, 0.39, 0.76, 0, 0, 0, CH); });   // (and legs under its outer end)
      // (the plaque over the chute, saying how much hay is in it, and a lantern to see it by at night)
      cpPart(new THREE.BoxGeometry(0.86, 0.46, 0.16), mlmDark, 0, 2.25, -0.03, 0, 0, 0, CH);
      cpPart(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshStandardMaterial({ map: siloCountTex, roughness: 0.8 }), 0, 2.25, 0.055, 0, 0, 0, CH).castShadow = false;
      var lnp = on(0.5, R + 0.22, 0); cpLantern(G, lnp[0], 2.2, lnp[2], siloGlows); var lbp = on(0.5, R + 0.08, 0); cpPart(new THREE.BoxGeometry(0.04, 0.04, 0.2), smHoop, lbp[0], 2.42, lbp[2], 0, 0.5, 0, G);
      // (the pipe that carries the hay underground to your coop and barn, leaving from its side and going down into the ground)
      var pa = 1.75, PP = new THREE.Group(); var pp = on(pa, R, 0); PP.position.set(pp[0], 0, pp[2]); PP.rotation.y = pa; G.add(PP);
      cpPart(new THREE.CylinderGeometry(0.09, 0.09, 0.42, 16), cpmSteel, 0, 1.15, 0.2, Math.PI / 2, 0, 0, PP);
      cpPart(new THREE.SphereGeometry(0.1, 16, 10), cpmSteel, 0, 1.15, 0.42, 0, 0, 0, PP);
      var pgy = gy(pp[0] + Math.sin(pa) * 0.42, pp[2] + Math.cos(pa) * 0.42);
      cpPart(new THREE.CylinderGeometry(0.09, 0.09, 1.15 - pgy + 0.1, 16), cpmSteel, 0, (1.15 + pgy - 0.1) / 2, 0.42, 0, 0, 0, PP);
      [0.25, 0.75].forEach(function (y) { cpPart(new THREE.TorusGeometry(0.1, 0.018, 6, 20), smRib, 0, pgy + y, 0.42, Math.PI / 2, 0, 0, PP); });
      cpPart(new THREE.CylinderGeometry(0.2, 0.24, 0.12, 18), smConcrete, 0, pgy + 0.04, 0.42, 0, 0, 0, PP);
      cpPart(new THREE.TorusGeometry(0.1, 0.02, 6, 20), smRib, 0, 1.15, 0.03, 0, 0, 0, PP);
      // (a hay bale and a pitchfork by its foot, and flowers round the pad)
      var bl = pickupModel('hay'); bl.scale.setScalar(3.1); var bp = on(0.95, R + 0.62, 0); bl.position.set(bp[0], gy(bp[0], bp[2]) + 0.26, bp[2]); bl.rotation.y = 0.95 + Math.PI / 2; bl.traverse(function (o) { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); G.add(bl);
      var PF = new THREE.Group(); var pfp = on(-0.75, R + 0.25, 0); PF.position.set(pfp[0], gy(pfp[0], pfp[2]), pfp[2]); PF.rotation.set(0.28, -0.75, 0.05); G.add(PF);
      cpPart(new THREE.CylinderGeometry(0.016, 0.018, 1.35, 8), mlmWood, 0, 0.68, 0, 0, 0, 0, PF); cpPart(new THREE.BoxGeometry(0.16, 0.02, 0.02), smHoop, 0, 1.36, 0, 0, 0, 0, PF);
      [-0.07, 0, 0.07].forEach(function (x) { cpPart(new THREE.CylinderGeometry(0.006, 0.003, 0.26, 5), smHoop, x, 1.49, 0, 0, 0, 0, PF); });
      var fl = []; [-1.25, -1.0, 0.55, 1.3, 2.55, 3.0, 3.6].forEach(function (a) { var fp = on(a, R + 0.36, 0); fl.push([fp[0], gy(fp[0], fp[2]), fp[2]]); }); coopFlowers(G, fl, 131);
    } else {
      // (still being built: scaffolding round it, with planks at each level and a ladder, lumber and Oak & Ember's sign)
      var top = stage === 0 ? 2.4 : 4.2, SR = R + 0.5, posts = [];
      for (var p = 0; p < 8; p++) { var pa2 = (p + 0.5) / 8 * Math.PI * 2, pq = on(pa2, SR, 0); posts.push(pq); cpPart(new THREE.CylinderGeometry(0.035, 0.035, top - gy(pq[0], pq[2]), 6), mlmFrame, pq[0], (top + gy(pq[0], pq[2])) / 2, pq[2], 0, 0, 0, G); }
      for (var lv = 1.1; lv < top - 0.2; lv += 1.05) posts.forEach(function (q, k) {
        var q2 = posts[(k + 1) % 8], m = [(q[0] + q2[0]) / 2, (q[2] + q2[2]) / 2], len = Math.hypot(q2[0] - q[0], q2[2] - q[2]), ang = Math.atan2(q2[0] - q[0], q2[2] - q[2]);
        cpPart(new THREE.BoxGeometry(0.4, 0.04, len), mlmWood, m[0] * 0.93, lv, m[1] * 0.93, 0, ang, 0, G);
        millBeam(G, [q[0], lv + 0.45, q[2]], [q2[0], lv + 0.45, q2[2]], 0.04, mlmFrame);
      });
      if (stage === 0) {                                              // (day one: a ring of staves standing ready, and hoops waiting)
        for (var st = 0; st < 10; st++) { var sa = 2.6 + st * 0.11; var sp = on(sa, R + 0.95, 0); cpPart(new THREE.BoxGeometry(0.14, 2.2, 0.04), smStave, sp[0], gy(sp[0], sp[2]) + 1.05, sp[2], -0.1, sa, 0.05 * (st % 3 - 1), G); }
        for (var hp = 0; hp < 3; hp++) { var hq = on(-2.0, R + 0.95, 0); cpPart(new THREE.TorusGeometry(0.45, 0.02, 6, 28), smHoop, hq[0], gy(hq[0], hq[2]) + 0.03 + hp * 0.04, hq[2], Math.PI / 2, 0, 0, G); }
      }
      var LD2 = new THREE.Group(); var lq = on(0.4, SR + 0.35, 0); LD2.position.set(lq[0], gy(lq[0], lq[2]), lq[2]); LD2.rotation.set(-0.25, 0.4, 0); G.add(LD2);
      [-0.2, 0.2].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.05, top + 0.3, 0.05), mlmFrame, x, (top + 0.3) / 2, 0, 0, 0, 0, LD2); }); for (var lr = 0; lr < Math.floor(top / 0.3); lr++) cpPart(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 5), mlmWood, 0, 0.25 + lr * 0.3, 0, 0, 0, Math.PI / 2, LD2);
      var lz = on(-0.6, R + 1.05, 0);
      for (var pl = 0; pl < 9; pl++) cpPart(new THREE.BoxGeometry(1.4, 0.06, 0.2), [mlmWood, mlmFrame][pl % 2], lz[0] + (pl % 2) * 0.05, gy(lz[0], lz[2]) + 0.05 + Math.floor(pl / 3) * 0.06, lz[2] + (pl % 3) * 0.21 - 0.21, 0, -0.6, 0, G);
      var bq = on(1.0, R + 0.95, 0); coopBarrel(G, bq[0], gy(bq[0], bq[2]), bq[2], 0.16, 0.36, false);
      var SG = new THREE.Group(); var sq = on(0.05, R + 1.15, 0); SG.position.set(sq[0], gy(sq[0], sq[2]), sq[2]); G.add(SG);
      [-0.55, 0.55].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.07, 1.1, 0.07), mlmWood, x, 0.55, -0.02, 0, 0, 0, SG); });
      cpPart(new THREE.BoxGeometry(1.3, 0.44, 0.04), mlmWood, 0, 0.85, 0, 0, 0, 0, SG);
      cpPart(new THREE.PlaneGeometry(1.24, 0.39), new THREE.MeshStandardMaterial({ map: siteSignTex('silo'), roughness: 0.8 }), 0, 0.85, 0.022, 0, 0, 0, SG).castShadow = false;
    }
    scene.add(G);
    return G;
  }
  function siloShowHay() {                                             // (the gauge, the plaques, and the bundles waiting in the chute and the hoppers)
    siloDrawCount();
    if (siloGauge) { var f = Math.max(0.004, silo.hay / SILO_CAP) * 3.36; siloGauge.scale.y = f; siloGauge.position.y = 1.17 + f / 2; }
    if (siloTuft) siloTuft.visible = silo.hay > 0;
    siloHopperTufts.forEach(function (t) { t.visible = siloReady() && silo.hay > 0; });
  }
  function siloPlace(c0, r0, start, rot) {
    siloRemove();
    silo.built = true; silo.c = c0; silo.r = r0; silo.start = start; silo.rot = rot || 0;
    silo.x = FARM_X + (c0 + SILO_FC / 2) * TILE; silo.z = FARM_Z + (r0 + SILO_FR / 2) * TILE;
    var top = -9; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) top = Math.max(top, groundHeight(silo.x + gx * 1.4, silo.z + gz * 1.4));
    silo.fy = top + 0.05;
    var HX = SILO_FC * TILE / 2, HZ = SILO_FR * TILE / 2;
    allScenery.forEach(function (t) { var u = t.userData; if (u.gone || u.state === 'standing') return; if (Math.abs(u.solid.x - silo.x) < HX + u.solidR && Math.abs(u.solid.z - silo.z) < HZ + u.solidR) setSceneryCut(t, u.state === 'regrowing' ? u.felledAt : gameMinutes()); });
    mineable.forEach(function (r) { if (r.gone || r.state === 'whole') return; if (Math.abs(r.solid.x - silo.x) < HX + r.solidR && Math.abs(r.solid.z - silo.z) < HZ + r.solidR) setRockBroken(r, r.state === 'regrowing' ? r.brokeAt : gameMinutes()); });
    for (var c = c0; c < c0 + SILO_FC; c++) for (var r = r0; r < r0 + SILO_FR; r++) { var ft = { x: FARM_X + (c + 0.5) * TILE, z: FARM_Z + (r + 0.5) * TILE }; coverGrass(ft); silo.grass.push(ft); }
    var sd = { x: silo.x, z: silo.z, r: SILO_R + 0.22 }; solids.push(sd); silo.solids.push(sd);
    silo.stage = siloStage(); siloGroup = siloBuildModel(silo.stage); siloShowHay();
    flushDirty();
  }
  function siloRemove() {
    if (!silo.built) return;
    if (siloGroup) { scene.remove(siloGroup); siloGroup = null; } siloGauge = siloTuft = null;
    silo.solids.forEach(function (sd) { var i = solids.indexOf(sd); if (i >= 0) solids.splice(i, 1); }); silo.solids = [];
    silo.grass.forEach(uncoverGrass); silo.grass = [];
    silo.built = false; silo.stage = -1;
  }
  function siloSaveData() { return silo.built ? { c: silo.c, r: silo.r, rot: silo.rot || 0, start: silo.start, hay: silo.hay } : null; }
  function siloLoadData(d) { siloRemove(); silo.hay = 0; if (d) { silo.hay = Math.max(0, Math.min(SILO_CAP, d.hay | 0)); siloPlace(d.c, d.r, d.start === undefined ? -99 : d.start, d.rot || 0); } siloShowHay(); }

  // ===== filling it, and taking hay out at the hoppers =====
  function siloNear() { return silo.built && !indoors && !flying && dist(player.position.x, player.position.z, silo.x, silo.z) < SILO_R + 1.35; }
  function siloFill() {
    if (!siloReady()) { showToast('Your silo is still being built: it\'ll be ready on the morning of ' + seasonDay(silo.start + SILO_DAYS) + ' 🪚', 2600); return; }
    if (silo.hay >= SILO_CAP) { showToast('Your silo is full: it holds ' + SILO_CAP + ' hay 🌾', 2200); return; }
    var have = bagCount('hay');
    if (!have) { showToast('Your silo only takes hay, and you don\'t have any. Buy it at Fluff & Feather, or trim bushes for it 🌾 (' + silo.hay + '/' + SILO_CAP + ')', 3200); return; }
    var n = Math.min(have, SILO_CAP - silo.hay);
    if (!takeItem('hay', n)) return;
    silo.hay += n; siloShowHay(); popSound();
    showToast('🌾 You poured ' + n + ' hay into your silo (' + silo.hay + '/' + SILO_CAP + ')' + (n < have ? ': it\'s full now, so you kept the other ' + (have - n) : ''), 3000);
  }
  function siloHopperTake() {                                          // (a bundle of hay from your silo, through the hopper)
    if (!silo.built) { showToast('This hopper gives you hay from a silo, but you don\'t have one yet: Oak & Ember can build you one 🌾', 3000); return; }
    if (!siloReady()) { showToast('Your silo is still being built: hay will come out here from the morning of ' + seasonDay(silo.start + SILO_DAYS) + ' 🪚', 2800); return; }
    if (silo.hay <= 0) { showToast('Your silo is empty: put hay in it through its chute, outside 🌾', 2600); return; }
    if (!addItem('hay', 1)) { bagFull(); return; }
    silo.hay--; siloShowHay(); popSound();
    showToast('🌾 A bundle of hay drops out of the hopper (' + silo.hay + ' left in your silo)', 1800);
  }
  function siloAtHopper(hop, room) {                                   // (standing in front of a hopper)
    var lx = player.position.x - room[0], lz = player.position.z - room[1];
    return Math.hypot(lx - hop[0], lz - hop[1]) < 1.0;
  }
  function siloHopperHere() { return !glimNaming && ((inCoop && siloAtHopper(SILO_HOP_COOP, [COI_X, COI_Z])) || (inFbarn && siloAtHopper(SILO_HOP_FBARN, [FBI_X, FBI_Z]))); }
  function siloAction() {                                              // (Interact by a hopper, or by your silo: true if it did something)
    if (coopPlacing || carpShopOpen) return false;
    if (siloHopperHere()) { siloHopperTake(); return true; }
    if (siloNear() && siloReady()) { siloFill(); return true; }
    return false;
  }
  var siloBtn = document.createElement('button');
  siloBtn.type = 'button'; siloBtn.className = 'sleep-btn ship-btn';
  canvas.parentNode.appendChild(siloBtn);
  siloBtn.addEventListener('click', function () { siloAction(); focusGame(); });
  var siloBtnText = '';
  function updateSiloButton() {
    var txt = coopPlacing ? '' : siloHopperHere() ? '🌾 Take hay from the hopper (' + (siloReady() ? silo.hay + ' in your silo' : silo.built ? 'silo being built' : 'no silo yet') + ')' : siloNear() && siloReady() ? '🌾 Put hay in the silo (' + silo.hay + '/' + SILO_CAP + ')' : '';
    if (txt !== siloBtnText) { siloBtnText = txt; if (txt) siloBtn.innerHTML = txt + ' <kbd>E</kbd>'; }
    var show = !!txt;
    if (siloBtn.classList.contains('show') !== show) siloBtn.classList.toggle('show', show);
  }
  // (the hoppers: a wooden cabinet with a steel funnel on top, fed by a pipe coming down the wall, a crank on its side,
  // a little tray at the front where the hay drops out, and a plaque saying how much is left in your silo)
  var SILO_HOP_COOP = [0.95, 1.7], SILO_HOP_FBARN = [4.22, -1.1];   // (in the barn: far enough off the wall for its funnel, between two windows)
  function siloHopper(R, x, z, ry, pipeTop, sol, reach) {
    reach = reach || 0.22;                                             // (how far back the pipe's elbow runs, into the wall)
    var H = new THREE.Group(); H.position.set(x, 0, z); H.rotation.y = ry; R.add(H);
    var mW = new THREE.MeshStandardMaterial({ map: cpPlankTex, color: 0xc89c6c, roughness: 0.8 }), mO = new THREE.MeshStandardMaterial({ color: 0x7a5a3c, roughness: 0.85 });
    [[-0.27, -0.19], [0.27, -0.19], [-0.27, 0.19], [0.27, 0.19]].forEach(function (l) { cpPart(new THREE.BoxGeometry(0.07, 0.78, 0.07), mO, l[0], 0.39, l[1], 0, 0, 0, H); });
    cpPart(new THREE.BoxGeometry(0.6, 0.5, 0.44), mW, 0, 0.5, 0, 0, 0, 0, H);
    [0.26, 0.74].forEach(function (y) { cpPart(new THREE.BoxGeometry(0.64, 0.05, 0.48), mO, 0, y, 0, 0, 0, 0, H); });
    cpPart(new THREE.CylinderGeometry(0.47, 0.25, 0.3, 4, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide }), 0, 0.92, 0, 0, Math.PI / 4, 0, H);
    cpPart(new THREE.BoxGeometry(0.68, 0.03, 0.03), cpmIron, 0, 1.07, 0.24, 0, 0, 0, H); cpPart(new THREE.BoxGeometry(0.68, 0.03, 0.03), cpmIron, 0, 1.07, -0.24, 0, 0, 0, H);
    cpPart(new THREE.CylinderGeometry(0.06, 0.06, pipeTop - 0.95, 14), cpmSteel, 0, (pipeTop + 0.95) / 2, -0.05, 0, 0, 0, H);   // (the pipe from your silo)
    for (var fy = 1.3; fy < pipeTop - 0.1; fy += 0.7) cpPart(new THREE.TorusGeometry(0.066, 0.014, 6, 16), cpmIron, 0, fy, -0.05, Math.PI / 2, 0, 0, H);
    cpPart(new THREE.SphereGeometry(0.065, 12, 8), cpmSteel, 0, pipeTop, -0.05, 0, 0, 0, H);
    cpPart(new THREE.CylinderGeometry(0.06, 0.06, reach, 14), cpmSteel, 0, pipeTop, -0.05 - reach / 2, Math.PI / 2, 0, 0, H);
    cpPart(new THREE.BoxGeometry(0.16, 0.04, reach - 0.12), cpmIron, 0, pipeTop - 0.5, -0.11 - reach / 2 + 0.06, 0, 0, 0, H);
    var TR = new THREE.Group(); TR.position.set(0, 0.3, 0.22); TR.rotation.x = 0.3; H.add(TR);   // (the tray at the front, where a bundle waits)
    cpPart(new THREE.BoxGeometry(0.4, 0.03, 0.26), mO, 0, 0, 0.12, 0, 0, 0, TR);
    [-0.2, 0.2].forEach(function (xx) { cpPart(new THREE.BoxGeometry(0.03, 0.08, 0.26), mO, xx, 0.04, 0.12, 0, 0, 0, TR); });
    var tuft = pickupModel('hay'); tuft.scale.setScalar(0.9); tuft.position.set(0, 0.07, 0.12); tuft.rotation.y = Math.PI / 2 + 0.1; TR.add(tuft); siloHopperTufts.push(tuft);
    cpPart(new THREE.BoxGeometry(0.34, 0.12, 0.03), mO, 0, 0.36, 0.215, 0, 0, 0, H);           // (the little door the hay drops through)
    var CR = new THREE.Group(); CR.position.set(0.31, 0.58, 0); H.add(CR);                    // (the crank on its side)
    cpPart(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14), cpmIron, 0.01, 0, 0, 0, 0, Math.PI / 2, CR);
    cpPart(new THREE.BoxGeometry(0.02, 0.2, 0.03), cpmIron, 0.03, -0.08, 0, 0, 0, 0, CR);
    cpPart(new THREE.CylinderGeometry(0.018, 0.018, 0.08, 8), cpmBrass, 0.07, -0.17, 0, 0, 0, Math.PI / 2, CR);
    cpPart(new THREE.BoxGeometry(0.34, 0.18, 0.012), mO, 0, 0.56, 0.227, 0, 0, 0, H);         // (the plaque: how much hay your silo has)
    cpPart(new THREE.PlaneGeometry(0.31, 0.155), new THREE.MeshStandardMaterial({ map: siloCountTex, roughness: 0.8 }), 0, 0.56, 0.234, 0, 0, 0, H).castShadow = false;
    sol.push([x, z, 0.36]);
    return H;
  }
  siloHopper(coopRoom, SILO_HOP_COOP[0], SILO_HOP_COOP[1], Math.PI, COOP_WALL - 0.08, coopSolids);
  siloHopper(fbarnRoom, SILO_HOP_FBARN[0], SILO_HOP_FBARN[1], -Math.PI / 2, FBARN_WALL - 0.1, fbarnSolids, 0.42);
  siloDrawCount(); siloShowHay();

  // ===== on Oak & Ember's menu, on the world map, and every frame =====
  function siloShopIcon() {                                            // (a little picture of the silo, for Oak & Ember's menu)
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'); g.scale(2, 2);
    g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); g.ellipse(64, 118, 36, 6, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#b8b2a6'; g.beginPath(); g.ellipse(64, 114, 33, 6, 0, 0, Math.PI * 2); g.fill();
    var sg = g.createLinearGradient(40, 0, 88, 0); sg.addColorStop(0, '#8a857c'); sg.addColorStop(0.5, '#aaa498'); sg.addColorStop(1, '#7a756c'); g.fillStyle = sg; g.fillRect(41, 98, 46, 15);
    g.fillStyle = 'rgba(255,255,255,0.18)'; for (var s = 0; s < 8; s++) g.fillRect(43 + (s % 4) * 11 + Math.floor(s / 4) * 5, 100 + Math.floor(s / 4) * 6, 8, 4);
    var bg = g.createLinearGradient(42, 0, 86, 0); bg.addColorStop(0, '#8a3428'); bg.addColorStop(0.45, '#c8564a'); bg.addColorStop(1, '#7a2e24'); g.fillStyle = bg; g.fillRect(42, 32, 44, 67);
    g.strokeStyle = 'rgba(70,20,14,0.35)'; g.lineWidth = 0.8; for (var x = 45; x < 86; x += 3.4) { g.beginPath(); g.moveTo(x, 32); g.lineTo(x, 99); g.stroke(); }
    g.strokeStyle = '#3a3634'; g.lineWidth = 1.6; for (var y = 42; y < 98; y += 9) { g.beginPath(); g.moveTo(42, y); g.lineTo(86, y); g.stroke(); }
    var dg = g.createLinearGradient(42, 0, 86, 0); dg.addColorStop(0, '#9aa2ac'); dg.addColorStop(0.45, '#eef2f6'); dg.addColorStop(1, '#8a929c'); g.fillStyle = dg;
    g.beginPath(); g.ellipse(64, 33, 23, 16, 0, Math.PI, 0); g.fill(); g.strokeStyle = 'rgba(80,90,100,0.5)'; g.lineWidth = 0.7; [-14, -7, 0, 7, 14].forEach(function (d) { g.beginPath(); g.moveTo(64 + d * 1.55, 33); g.quadraticCurveTo(64 + d * 1.1, 22, 64, 17); g.stroke(); });
    g.fillStyle = '#9aa2ac'; g.fillRect(41, 31, 46, 3); g.fillStyle = '#c4cad2'; g.fillRect(60, 11, 8, 6); g.fillStyle = '#8a929c'; g.beginPath(); g.moveTo(56, 12); g.lineTo(64, 6); g.lineTo(72, 12); g.closePath(); g.fill();
    g.fillStyle = '#3a2a1e'; g.fillRect(55.5, 46, 4, 50); g.fillStyle = '#f0d080'; g.fillRect(56.3, 74, 2.4, 21.5); g.fillStyle = 'rgba(220,240,255,0.35)'; g.fillRect(56.3, 47, 2.4, 48);   // (the gauge, about half full)
    g.fillStyle = '#7a5236'; g.fillRect(64, 81, 13, 14); g.strokeStyle = '#3a2a1e'; g.lineWidth = 1; g.strokeRect(64, 81, 13, 14);
    g.fillStyle = '#b08a62'; g.beginPath(); g.moveTo(63, 95); g.lineTo(78, 95); g.lineTo(82, 108); g.lineTo(59, 108); g.closePath(); g.fill(); g.fillStyle = '#e8c870'; g.fillRect(64, 99, 13, 5);
    g.fillStyle = '#f4e6c8'; g.fillRect(62, 68, 17, 9); g.strokeStyle = '#4a3626'; g.strokeRect(62, 68, 17, 9);
    g.strokeStyle = '#3a3634'; g.lineWidth = 1.2; [37, 39.5].forEach(function (x) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, 100); g.stroke(); }); for (var r2 = 44; r2 < 100; r2 += 5) { g.beginPath(); g.moveTo(37, r2); g.lineTo(39.5, r2); g.stroke(); }
    g.fillStyle = '#c9ced6'; g.fillRect(86, 86, 9, 5); g.fillRect(91, 86, 4, 28);
    [[30, 112, '#f4a6c8'], [36, 114, '#fff2e0'], [96, 113, '#c8a8f0'], [101, 112, '#ffb08a']].forEach(function (f) { g.fillStyle = '#5f9a48'; g.beginPath(); g.arc(f[0], f[1] + 1, 3, 0, Math.PI * 2); g.fill(); g.fillStyle = f[2]; g.beginPath(); g.arc(f[0], f[1] - 1, 1.6, 0, Math.PI * 2); g.fill(); });
    return c.toDataURL();
  }
  function siloDrawOnMap(g, K, label) {                                // (on the world map: its round silver dome, seen from above)
    var pc = mapXY(silo.x, silo.z), p = [0, 0], r = (SILO_R + 0.1) * K;
    g.save(); g.translate(pc[0], pc[1]); g.rotate(-bRot(silo));           // (turned the way it faces)
    g.beginPath(); g.arc(p[0] + 5, p[1] + 7, r, 0, Math.PI * 2); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fill();
    g.beginPath(); g.arc(p[0], p[1], r, 0, Math.PI * 2); var dg = g.createRadialGradient(p[0] - r * 0.3, p[1] - r * 0.3, 2, p[0], p[1], r); dg.addColorStop(0, siloReady() ? '#f2f5f8' : '#e0c090'); dg.addColorStop(1, siloReady() ? '#8a929c' : '#a07850'); g.fillStyle = dg; g.fill();
    g.strokeStyle = siloReady() ? '#b8564a' : '#7a5236'; g.lineWidth = 3; g.stroke();
    if (siloReady()) { g.strokeStyle = 'rgba(80,90,100,0.4)'; g.lineWidth = 1.2; for (var k = 0; k < 8; k++) { var a = k / 8 * Math.PI * 2; g.beginPath(); g.moveTo(p[0] + Math.cos(a) * 3, p[1] + Math.sin(a) * 3); g.lineTo(p[0] + Math.cos(a) * r, p[1] + Math.sin(a) * r); g.stroke(); } }
    g.fillStyle = '#8a6040'; g.fillRect(p[0] - 0.35 * K, p[1] + r, 0.7 * K, 0.7 * K);
    g.restore();
    label(siloReady() ? 'Silo · ' + silo.hay + '/' + SILO_CAP + ' hay' : 'Silo (being built)', silo.x, silo.z, r + 26);
  }
  var siloBaseInteract = interact;
  interact = function () {
    if (siloAction()) return;
    return siloBaseInteract.apply(this, arguments);
  };
  function updateSilo(dt, night) {
    updateSiloButton();
    if (!silo.built) return;
    var st = siloStage();
    if (st !== silo.stage) {                                            // (a new morning: Oak & Ember have got further)
      var was = silo.stage; silo.stage = st;
      if (siloGroup) scene.remove(siloGroup); siloGroup = siloBuildModel(st); siloShowHay();
      if (was >= 0) setTimeout(function () { showToast(st === SILO_DAYS ? '🌾 Your silo is finished! Pour hay in through its chute, and take it out at the hoppers in your coop and barn.' : '🪚 Oak & Ember worked on your silo all day: it\'s half built! One more day to go.', 4600); }, 8200);
    }
    siloGlows.forEach(function (L) { var fl = 1 + Math.sin(state.time * 11 + L.p) * 0.1; L.f.scale.set(fl, 1.5 * fl, fl); L.h.material.opacity = (0.25 + night * 0.5) * fl; });
  }

  // ---------- Building sites: the coop and the barn take two days to build too ----------
  // Like the mill: the day you buy one, a building site goes up on its spot (a stone footing and floorboards, a bare
  // timber frame with its roof skeleton, scaffolding, lumber and Oak & Ember's sign); by the next morning its walls
  // are up; and on the second morning it's finished. You can't go in, or adopt animals into it, until then
  var SITE_DAYS = 2, siteSigns = {};
  function siteStage(o) { return Math.min(SITE_DAYS, farmDay() - o.start); }   // 0: just started, 1: walls up, 2: finished
  function siteSignTex(name) {
    if (!siteSigns[name]) siteSigns[name] = cpTex(512, 160, function (g, w, h) {
      g.fillStyle = '#7a5236'; g.fillRect(0, 0, w, h); g.fillStyle = '#f4e6c8'; g.fillRect(8, 8, w - 16, h - 16);
      g.fillStyle = '#5a3a20'; g.textAlign = 'center'; g.font = '600 48px Fredoka, Georgia, serif'; g.fillText('Your ' + name + ' is coming!', w / 2, 70);
      g.font = '28px Fredoka, Georgia, serif'; g.fillText('🪚 Built by Oak & Ember · ready in two days', w / 2, 120);
    });
    return siteSigns[name];
  }
  function siteBuild(kind, stage) {                                    // (the building site for your coop or barn, as far as it's got)
    var coopK = kind === 'coop', o = coopK ? coop : fbarn, W = coopK ? COOP_BW : FBARN_BW, D = coopK ? COOP_BD : FBARN_BD, H = coopK ? COOP_WALL : FBARN_WALL, apron = coopK ? 0.95 : 1.6;
    var G = new THREE.Group(); G.position.set(o.x, o.fy, o.z); G.rotation.y = bRot(o);
    function gy(lx, lz) { return bGround(o, lx, lz) - o.fy; }
    var minG = 99; for (var gx = -1; gx <= 1; gx++) for (var gz = -1; gz <= 1; gz++) minG = Math.min(minG, gy(gx * (W / 2 + 0.3), gz * (D / 2 + 0.3)));
    var fh = -minG + 0.3;
    cpPart(new THREE.BoxGeometry(W + 0.2, fh, D + 0.2), mlmStone, 0, -fh / 2, 0, 0, 0, 0, G);   // (the footing, and the floor laid on it)
    for (var fb = -W / 2 + 0.15; fb < W / 2; fb += 0.3) cpPart(new THREE.BoxGeometry(0.28, 0.05, D), [mlmWood, mlmFrame][Math.round((fb + W) / 0.3) % 2], fb, 0.025, 0, 0, 0, 0, G);
    if (stage >= 1) {                                                  // (day two: the walls are up)
      if (coopK) {
        coopWall(G, COOP_BW, H, 0, [[-2.15, -1.15, 1.02, 1.78], [1.15, 2.15, 1.02, 1.78]], [-0.52, 0.52, 1.92], cpmBoard, 0, D / 2, 0);
        coopWall(G, COOP_BW, H, 0, [[-1.8, -1.0, 1.2, 1.8], [1.0, 1.8, 1.2, 1.8]], null, cpmBoard, 0, -D / 2, Math.PI);
        coopWall(G, COOP_BD + 0.12, H, COOP_PEAK, [[-0.5, 0.5, 1.02, 1.78]], null, cpmBoard, -W / 2, 0, -Math.PI / 2);
        coopWall(G, COOP_BD + 0.12, H, COOP_PEAK, [], null, cpmBoard, W / 2, 0, Math.PI / 2);
      } else {
        fbarnWall(G, FBG, FB_FRH, FB_DOOR, fbmRed, 0, D / 2, 0); fbarnWall(G, FBG, FB_BKH, null, fbmRed, 0, -D / 2, Math.PI);
        fbarnWall(G, FB_SIDE, FB_SH, null, fbmRed, -W / 2, 0, -Math.PI / 2); fbarnWall(G, FB_SIDE, FB_SH, null, fbmRed, W / 2, 0, Math.PI / 2);
      }
    } else {                                                           // (day one: just the timber frame)
      var posts = [];
      for (var px = -W / 2; px <= W / 2 + 0.01; px += W / Math.round(W / 0.9)) posts.push([px, -D / 2], [px, D / 2]);
      for (var pz = -D / 2 + D / Math.round(D / 0.9); pz < D / 2 - 0.01; pz += D / Math.round(D / 0.9)) posts.push([-W / 2, pz], [W / 2, pz]);
      posts.forEach(function (p) { millBeam(G, [p[0], 0, p[1]], [p[0], H, p[1]], 0.1, mlmFrame); });
      [[-W / 2, -D / 2, W / 2, -D / 2], [-W / 2, D / 2, W / 2, D / 2], [-W / 2, -D / 2, -W / 2, D / 2], [W / 2, -D / 2, W / 2, D / 2]].forEach(function (e) {
        [0.08, H].forEach(function (y) { millBeam(G, [e[0], y, e[1]], [e[2], y, e[3]], 0.11, mlmFrame); });
        millBeam(G, [e[0], 0.3, e[1]], [e[2], H - 0.3, e[3]], 0.07, mlmWood);   // (a brace across each side)
      });
    }
    // (the roof's skeleton: rafters along its length, a ridge beam, and purlins, with no roof on yet)
    var prof = coopK ? [[-D / 2 - 0.3, H - 0.2], [0, H + COOP_PEAK], [D / 2 + 0.3, H - 0.2]] : [[-5.0, 2.75], [-2.9, 4.5], [0, 5.35], [2.9, 4.5], [5.0, 2.75]];
    var L = coopK ? W + 0.3 : D + 0.4, n = Math.round(L / 0.75);
    function at(p, q) { return coopK ? [p, q[1], q[0]] : [q[0], q[1], p]; }
    for (var i = 0; i <= n; i++) { var p = -L / 2 + i * L / n; for (var k = 0; k < prof.length - 1; k++) millBeam(G, at(p, prof[k]), at(p, prof[k + 1]), 0.08, mlmFrame); }
    prof.forEach(function (q, k) { if (k === 0 || k === prof.length - 1) return; millBeam(G, at(-L / 2, q), at(L / 2, q), 0.1, mlmFrame); });
    prof.slice(0, -1).forEach(function (q, k) { var m = [(q[0] + prof[k + 1][0]) / 2, (q[1] + prof[k + 1][1]) / 2]; millBeam(G, at(-L / 2, m), at(L / 2, m), 0.06, mlmWood); });
    // (scaffolding along the front, with a ladder, planks at each level and a rail)
    var sz = D / 2 + 0.38, top = coopK ? H + 0.6 : H + 1.6;
    for (var sx = -W / 2 + 0.3; sx <= W / 2 - 0.29; sx += (W - 0.6) / Math.round((W - 0.6) / 1.4)) [sz - 0.25, sz + 0.25].forEach(function (z) { cpPart(new THREE.CylinderGeometry(0.035, 0.035, top - gy(sx, z), 6), mlmFrame, sx, (top + gy(sx, z)) / 2, z, 0, 0, 0, G); });
    for (var lv = 1.0; lv < top - 0.2; lv += 1.05) { cpPart(new THREE.BoxGeometry(W - 0.4, 0.04, 0.42), mlmWood, 0, lv, sz, 0, 0, 0, G); cpPart(new THREE.CylinderGeometry(0.022, 0.022, W - 0.5, 6), mlmFrame, 0, lv + 0.45, sz + 0.24, 0, 0, Math.PI / 2, G); }
    var LD = new THREE.Group(); LD.position.set(W / 2 - 0.5, gy(W / 2 - 0.5, sz + 0.55), sz + 0.55); LD.rotation.set(-0.25, 0, 0); G.add(LD);
    [-0.2, 0.2].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.05, top + 0.3, 0.05), mlmFrame, x, (top + 0.3) / 2, 0, 0, 0, 0, LD); }); for (var lr = 0; lr < Math.floor(top / 0.3); lr++) cpPart(new THREE.CylinderGeometry(0.018, 0.018, 0.4, 5), mlmWood, 0, 0.25 + lr * 0.3, 0, 0, 0, Math.PI / 2, LD);
    // (stacks of lumber, a sawhorse with a plank on it, a keg of nails, and Oak & Ember's sign)
    var lx = -W / 2 + 1.0, lz = D / 2 + apron * 0.62;
    for (var pl = 0; pl < 9; pl++) cpPart(new THREE.BoxGeometry(1.7, 0.06, 0.2), [mlmWood, mlmFrame][pl % 2], lx + (pl % 2) * 0.05, gy(lx, lz) + 0.05 + Math.floor(pl / 3) * 0.06, lz + (pl % 3) * 0.21 - 0.21, 0, 0.1, 0, G);
    var SH = new THREE.Group(); SH.position.set(-0.6, gy(-0.6, D / 2 + apron * 0.7), D / 2 + apron * 0.7); SH.rotation.y = 0.3; G.add(SH);
    cpPart(new THREE.BoxGeometry(1.0, 0.1, 0.12), mlmWood, 0, 0.62, 0, 0, 0, 0, SH); [-0.4, 0.4].forEach(function (x) { [-1, 1].forEach(function (s) { cpPart(new THREE.BoxGeometry(0.06, 0.7, 0.06), mlmWood, x, 0.32, s * 0.14, s * 0.35, 0, 0, SH); }); });
    cpPart(new THREE.BoxGeometry(1.4, 0.05, 0.2), mlmFrame, 0.2, 0.7, 0, 0, 0.1, 0, SH);
    coopBarrel(G, 0.55, gy(0.55, D / 2 + apron * 0.75), D / 2 + apron * 0.75, 0.16, 0.36, false);
    var SG = new THREE.Group(); SG.position.set(W / 2 - 1.1, gy(W / 2 - 1.1, D / 2 + apron * 0.8), D / 2 + apron * 0.8); SG.rotation.y = -0.15; G.add(SG);
    [-0.55, 0.55].forEach(function (x) { cpPart(new THREE.BoxGeometry(0.07, 1.1, 0.07), mlmWood, x, 0.55, -0.02, 0, 0, 0, SG); });
    cpPart(new THREE.BoxGeometry(1.3, 0.44, 0.04), mlmWood, 0, 0.85, 0, 0, 0, 0, SG);
    cpPart(new THREE.PlaneGeometry(1.24, 0.39), new THREE.MeshStandardMaterial({ map: siteSignTex(coopK ? 'coop' : 'barn'), roughness: 0.8 }), 0, 0.85, 0.022, 0, 0, 0, SG).castShadow = false;
    scene.add(G);
    return G;
  }
  function siteTick(kind) {                                            // (each morning Oak & Ember get further; on the second, it's finished)
    var coopK = kind === 'coop', o = coopK ? coop : fbarn, st = siteStage(o);
    if (st === o.stage) return;
    var was = o.stage; o.stage = st;
    if (coopK) { if (coopGroup) scene.remove(coopGroup); coopGroup = st < SITE_DAYS ? siteBuild('coop', st) : coopBuildOutside(); if (st === SITE_DAYS) coopDoor = coopFront(0.12); }
    else { if (fbarnGroup) scene.remove(fbarnGroup); fbarnGroup = st < SITE_DAYS ? siteBuild('fbarn', st) : fbarnBuildOutside(); if (st === SITE_DAYS) fbarnDoor = fbarnFront(0.15); }
    if (was < 0) return;
    if (st === SITE_DAYS) homeMigrate(false);
    var nm = coopK ? 'coop' : 'barn';
    setTimeout(function () { showToast(st === SITE_DAYS ? (coopK ? '🐔' : '🐮') + ' Your ' + nm + ' is finished! You can go in, and adopt animals for it at Fluff & Feather.' : '🪚 Oak & Ember worked on your ' + nm + ' all day: its walls are up! One more day to go.', 4600); }, coopK ? 7000 : 7600);
  }
  function siteReady(o) { return o.built && o.stage >= SITE_DAYS; }

  // ---------- Sitting in the rowboat ----------
  // Walk to the end of the dock and press Interact to climb into the little rowboat tied there: she sits on its front
  // seat facing the stern, legs stretched out in front of her and hands in her lap, bobbing and rocking with the boat on
  // the water. Press Interact again (or try to walk, fly or teleport) to climb back out onto the dock
  var inBoat = false, BOAT_SEAT = new THREE.Vector3(0.3 * BOAT_L / 2, hullRise(0.3) - 0.07 + 0.018, 0), boatSeatW = new THREE.Vector3(), boatFwd = new THREE.Vector3();
  function boatWorldPos() { boat.updateWorldMatrix(true, false); return boat.localToWorld(boatSeatW.set(0, 0, 0)); }
  function boatNear() {
    if (inBoat || indoors || flying || flyH > 0 || teleporting || sleeping) return false;
    var b = boatWorldPos();
    return onDock(player.position.x, player.position.z) && dist(player.position.x, player.position.z, b.x, b.z) < 2.6;
  }
  function boatSeat() {                                                // (where her hips go, and which way she faces: back toward the stern)
    boat.updateWorldMatrix(true, false);
    var p = boat.localToWorld(boatSeatW.copy(BOAT_SEAT));
    boatFwd.set(1, 0, 0).transformDirection(boat.matrixWorld);
    return { x: p.x, y: p.y, z: p.z, face: Math.atan2(-boatFwd.x, -boatFwd.z) };
  }
  function boatClimbIn() {
    inBoat = true; walkTarget = null; keys = {};
    var s = boatSeat(); facing = s.face; popSound();
    burst(s.x, s.y - 0.1, s.z, 0xbfe6ff, 12, 1.2, 1.4, -2);               // (a little splash as the boat dips)
    showToast('🛶 You climb into the rowboat and settle on its seat. Press Interact to climb back out.', 3200);
  }
  function boatClimbOut(quiet) {
    if (!inBoat) return;
    inBoat = false;
    var p = dock.localToWorld(new THREE.Vector3(DOCK_LEN - 0.7, 0, 0.35));
    player.position.set(p.x, DOCK_Y, p.z); body.position.set(0, 0, 0); body.rotation.set(0, 0, 0);
    if (!quiet) popSound();
  }
  var boatBaseUpdatePlayer = updatePlayer;
  updatePlayer = function (dt) {
    if (inBoat && (indoors || teleporting || sleeping || player.parent !== scene)) inBoat = false;   // (carried home, or whisked away some other way)
    if (!inBoat) return boatBaseUpdatePlayer(dt);
    var tryWalk = keys.KeyW || keys.KeyA || keys.KeyS || keys.KeyD || keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight || walkTarget;
    if (tryWalk) { walkTarget = null; boatClimbOut(); return boatBaseUpdatePlayer(dt); }   // (walking off: she steps back onto the dock)
    var s = boatSeat();
    facing = s.face; player.rotation.y = facing;
    player.position.set(s.x, s.y - 0.36, s.z);                          // (her hips on the seat)
    body.position.set(0, 0, 0);
    body.rotation.set(boat.rotation.x * 1.2, 0, boat.rotation.z * 1.2);  // (rocking with the boat)
    hatStar.rotation.y += dt * 2;
    witchLook(dt, false);
    var w = wl, t = state.time;                                        // (sitting: legs stretched out in front, hands resting in her lap, broom laid down)
    w.legs[0].rotation.set(-1.42, 0, 0.1); w.legs[1].rotation.set(-1.42, 0, -0.1); w.legs[0].userData.shin.rotation.x = w.legs[1].userData.shin.rotation.x = 0; w.chibi.rotation.set(0, 0, 0);   // (straight-legged)
    w.armL.rotation.x = -0.55; w.armR.rotation.x = -0.55;
    w.chibi.position.y = 0; w.broom.visible = false;
    w.head.rotation.z = Math.sin(t * 0.6) * 0.05;                       // (looking about, enjoying the water)
  };
  var boatBaseToggleFlying = toggleFlying;
  toggleFlying = function () { if (inBoat) boatClimbOut(); return boatBaseToggleFlying.apply(this, arguments); };
  var boatBaseTeleport = teleportTo;
  teleportTo = function () { if (inBoat) boatClimbOut(true); return boatBaseTeleport.apply(this, arguments); };
  var boatBaseInteract = interact;
  interact = function () {
    if (inBoat) { boatClimbOut(); return; }
    if (boatNear() && !coopPlacing) { boatClimbIn(); return; }
    return boatBaseInteract.apply(this, arguments);
  };
  var boatBtn = document.createElement('button');
  boatBtn.type = 'button'; boatBtn.className = 'sleep-btn ship-btn';
  canvas.parentNode.appendChild(boatBtn);
  boatBtn.addEventListener('click', function () { if (inBoat) boatClimbOut(); else if (boatNear()) boatClimbIn(); focusGame(); });
  var boatBtnText = '';
  function updateBoatButton() {
    var txt = inBoat ? '🛶 Climb out of the boat' : boatNear() ? '🛶 Sit in the boat' : '';
    if (txt !== boatBtnText) { boatBtnText = txt; if (txt) boatBtn.innerHTML = txt + ' <kbd>E</kbd>'; }
    var show = !!txt;
    if (boatBtn.classList.contains('show') !== show) boatBtn.classList.toggle('show', show);
  }

  // ---------- Flying on her broom ----------
  // B (or the Fly button) hops on and off her broom; only outdoors. Once up she flies a little faster than she walks,
  // anywhere over the island, the lake and just out over the sea; Space climbs higher and Shift drops lower. Landing
  // needs dry ground beneath her, and she lands by herself if she goes through a door, gets carried home or teleports inside
  var flying = false, flyH = 0, flyGoal = 0, flySpeed = 0, flyTrail = 0, FLY_SPEED = SPEED * 1.6, FLY_MIN = 1.2, FLY_MAX = 9, FLY_START = 3.5;
  function toggleFlying() {
    if (teleporting || sleeping) return;
    if (!flying) {
      if (indoors) { showToast('You can only fly outdoors', 1800); return; }
      flying = true; flyGoal = FLY_START; walkTarget = null; spellSound();
      burst(player.position.x, player.position.y + 0.3, player.position.z, 0xffd6f5, 14, 1.4, 1.2, -1.5);
    } else if (flyGoal > 0) {
      if (inLake(player.position.x, player.position.z) || !walkable(player.position.x, player.position.z)) { showToast('Find dry land to land on', 1800); return; }
      flyGoal = 0;                                                     // (floating gently down; she steps off once she touches the ground)
    }
  }
  function flyArea(x, z) {                                            // (anywhere within a short way of land)
    if (walkable(x, z) || inLake(x, z)) return true;
    for (var a = 0; a < 8; a++) if (walkable(x + Math.cos(a * Math.PI / 4) * 5, z + Math.sin(a * Math.PI / 4) * 5)) return true;
    return false;
  }
  window.addEventListener('keydown', function (e) { if (e.code === 'KeyB' && !e.repeat) toggleFlying(); });
  window.addEventListener('keydown', function (e) { if (flying && (e.code === 'ShiftLeft' || e.code === 'ShiftRight')) keys.FlyDown = true; });
  window.addEventListener('keyup', function (e) { if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') keys.FlyDown = false; });
  // ---------- Going in through a door ----------
  // Outside, walking up to a door no longer takes you in: stand by it and press E (or tap Interact) to go in. Inside,
  // walking out through the doorway still takes you back out
  var doorNear = null, doorHinted = null, doorWasIn = false, DOOR_REACH = 1.3;
  var DOOR_NAMES = { house: 'the farmhouse', shop: 'the seed shop', clinic: 'the clinic', barn: 'Fluff & Feather', carp: 'Oak & Ember', coop: 'your coop', fbarn: 'your barn' };
  updateDoors = function () {
    var px = player.position.x, pz = player.position.z;
    if (!indoors) {                                                    // (outside: just notice which door she's standing by)
      var near = [['house', dist(px, pz, OUT_DOOR_X, OUT_DOOR_Z)], ['shop', dist(px, pz, shopDoor.x, shopDoor.z)], ['clinic', dist(px, pz, clinicDoor.x, clinicDoor.z)], ['barn', dist(px, pz, barnDoor.x, barnDoor.z)], ['carp', dist(px, pz, carpDoor.x, carpDoor.z)], ['coop', dist(px, pz, coopDoor.x, coopDoor.z)], ['fbarn', dist(px, pz, fbarnDoor.x, fbarnDoor.z) - 0.6]]
        .filter(function (n) { return n[1] < DOOR_REACH; }).sort(function (a, b) { return a[1] - b[1]; })[0];
      doorNear = near ? near[0] : null;
      if (doorWasIn) { doorHinted = doorNear; doorWasIn = false; }   // (no hint for the door she's just come out of)
      if (doorNear && doorNear !== doorHinted && !doorBusy) showToast('Press E or tap Interact to go into ' + DOOR_NAMES[doorNear], 2000);
      doorHinted = doorNear; doorArmed = true;
      return;
    }
    doorWasIn = true; doorNear = doorHinted = null;                                      // (inside: walking out through the doorway takes her out, as before)
    var dShop = inShop ? dist(px, pz, SIN_X, SIN_Z + SIN_EXIT_Z) : 99, dClinic = inClinic ? dist(px, pz, CIN_X, CIN_Z + CIN_EXIT_Z) : 99, dBarn = inBarn ? dist(px, pz, AB_X, AB_Z + AB_EXIT_Z) : 99;
    if (inFbarn) { if (!doorArmed) { if (dist(px, pz, FBI_X, FBI_Z + FBI_EXIT_Z) > 0.85) doorArmed = true; return; } if (Math.abs(px - FBI_X) < 1.2 && pz > FBI_Z + FBI_EXIT_Z - 0.1) fbarnDoorUse(false); return; }   // (out of the barn)
    if (inCoop) { if (!doorArmed) { if (dist(px, pz, COI_X, COI_Z + COI_EXIT_Z) > 0.85) doorArmed = true; return; } if (dist(px, pz, COI_X, COI_Z + COI_EXIT_Z) < 0.5) coopDoorUse(false); return; }   // (out of the coop)
    if (inCarp) { if (!doorArmed) { if (dist(px, pz, CPI_X, CPI_Z + CPI_EXIT_Z) > 0.85) doorArmed = true; return; } if (dist(px, pz, CPI_X, CPI_Z + CPI_EXIT_Z) < 0.5) carpDoorUse(false); return; }   // (out of Oak & Ember)
    var d = inShop || inClinic || inBarn ? 99 : dist(px, pz, IN_X, IN_Z + EXIT_Z);
    if (!doorArmed) { if (Math.min(d, dShop, dClinic, dBarn) > 0.85) doorArmed = true; return; }   // (stepping away from the door she came in by first)
    if (d < 0.5) useDoor(false);
    else if (dShop < 0.5) useDoor(false, true);
    else if (dClinic < 0.5) useDoor(false, 'clinic');
    else if (dBarn < 0.5) useDoor(false, 'barn');
  };
  var interactOnFoot = interact;
  interact = function () {                                             // (Space climbs while she's flying; she has to land before she can work the land)
    if (flying) { if (!keys.Space) showToast('Land your broom first (B)', 1500); return; }
    if (!indoors && doorNear && !doorBusy && !binOpen && !shopOpen && !barnShopOpen) {   // (by a door: in she goes)
      var which = doorNear; doorNear = null; walkTarget = null;
      if (which === 'carp') carpDoorUse(true); else if (which === 'coop') coopDoorUse(true); else if (which === 'fbarn') fbarnDoorUse(true); else useDoor(true, which === 'shop' ? true : which === 'house' ? undefined : which);
      return;
    }
    return interactOnFoot.apply(this, arguments);
  };
  (function () {                                                       // (a Fly button beside the others, for tapping)
    var row = document.querySelector('.controls'); if (!row) return;
    var b = document.createElement('button'); b.id = 'btnFly'; b.type = 'button'; b.innerHTML = '🧹 Fly <kbd>B</kbd>';
    row.insertBefore(b, row.children[2] || null);
    b.addEventListener('click', function () { toggleFlying(); focusGame(); });
    var help = document.querySelector('.help'); if (help) help.insertAdjacentHTML('beforeend', ' · <b>B</b> hops on your broom (outdoors): <b>Space</b> flies higher, <b>Shift</b> lower');
  })();
  function updateFlying(dt) {
    if (!flying) return;
    if (indoors) { flying = false; flyH = flyGoal = 0; return; }       // (carried home, or through a door: off the broom)
    if (flyGoal > 0) flyGoal = THREE.MathUtils.clamp(flyGoal + ((keys.Space ? 1 : 0) - (keys.FlyDown ? 1 : 0)) * 3 * dt, FLY_MIN, FLY_MAX);
    flyH += (flyGoal - flyH) * Math.min(1, dt * 2.2);
    if (flyGoal === 0 && flyH < 0.04) { flying = false; flyH = 0; burst(player.position.x, player.position.y + 0.2, player.position.z, 0xffd6f5, 10, 1.2, 0.6, -2); return; }
    flyTrail -= dt;
    if (flyTrail <= 0) {                                               // (a little trail of sparkles off the end of her bristles)
      flyTrail = 0.07;
      burst(player.position.x - Math.sin(facing) * 0.55, player.position.y + 0.4, player.position.z - Math.cos(facing) * 0.55, [0xffd6f5, 0xfff2a8, 0xc8b8ff][Math.floor(Math.random() * 3)], 2, 0.35, 0.15, -0.4);
    }
  }
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
      player.position.x += mx * (flying ? FLY_SPEED : SPEED) * dt;
      player.position.z += mz * (flying ? FLY_SPEED : SPEED) * dt;

      if (flying) {                                                    // (in the air: over the land, the lake and just out over the sea, brushing past only what's tall enough to reach her)
        if (!flyArea(player.position.x, player.position.z)) {
          if (flyArea(player.position.x, beforeZ)) player.position.z = beforeZ;
          else if (flyArea(beforeX, player.position.z)) player.position.x = beforeX;
          else { player.position.x = beforeX; player.position.z = beforeZ; }
        }
        if (flyH < 2.2) solids.forEach(function (o) {
          if (o.young) return;                                        // (still small after being cut down: you go right over it)
          var dx = player.position.x - o.x, dz = player.position.z - o.z, d = Math.hypot(dx, dz), min = o.r + 0.35;
          if (d < min && d > 0.0001) { player.position.x = o.x + dx / d * min; player.position.z = o.z + dz / d * min; }
        });
      } else if (indoors) { // inside the farmhouse or the seed shop: stay between the walls and bump into the furniture
        var rx0 = inFbarn ? FBI_X : inCoop ? COI_X : inCarp ? CPI_X : inBarn ? AB_X : inClinic ? CIN_X : inShop ? SIN_X : IN_X, rz0 = inFbarn ? FBI_Z : inCoop ? COI_Z : inCarp ? CPI_Z : inBarn ? AB_Z : inClinic ? CIN_Z : inShop ? SIN_Z : IN_Z;
        var hw = (inFbarn ? FBARN_BW : inCoop ? COOP_BW : inCarp ? CPI_W : inBarn ? AB_W : inClinic ? CIN_W : inShop ? SIN_W : ROOM_W) / 2 - 0.45, hd = (inFbarn ? FBARN_BD : inCoop ? COOP_BD : inCarp ? CPI_D : inBarn ? AB_D : inClinic ? CIN_D : inShop ? SIN_D : ROOM_D) / 2 - 0.45;
        player.position.x = Math.max(rx0 - hw, Math.min(rx0 + hw, player.position.x));
        player.position.z = Math.max(rz0 - hd, Math.min(rz0 + hd, player.position.z));
        (inFbarn ? fbarnSolids : inCoop ? coopSolids : inCarp ? carpSolids : inBarn ? abSolids : inClinic ? ciSolids : inShop ? shopInSolids : inSolids).forEach(function (o) {
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
        if (o.young) return;                                          // (still small after being cut down: you go right over it)
        var dx = player.position.x - o.x, dz = player.position.z - o.z;
        var d = Math.hypot(dx, dz), min = o.r + 0.35;
        if (d < min && d > 0.0001) {
          player.position.x = o.x + dx / d * min;
          player.position.z = o.z + dz / d * min;
        }
      });
      }
      // No walking on water: slide along the shore instead
      if (!indoors && !flying && inLake(player.position.x, player.position.z)) {
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
    updateFlying(dt);
    flySpeed += ((flying && moving ? 1 : 0) - flySpeed) * Math.min(1, dt * 3);
    if (flying || flyH > 0) {
      player.position.y = Math.max(footY, WATER_Y) + flyH;
      body.position.y = Math.sin(state.time * 2.2) * 0.05;
      body.rotation.z = (typeof turn === 'number' ? -THREE.MathUtils.clamp(turn, -0.6, 0.6) * 0.5 : 0) * 0.6 + body.rotation.z * 0.4;   // (leaning into her turns)
      body.rotation.x = -flySpeed * 0.12;                              // (and a little forward as she picks up speed)
    } else {
      body.rotation.x = 0;
    body.position.y *= 0.8; body.rotation.z *= 0.8;                    // (her walk does its own rising and swaying now: see witchLook)
    }
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
    markYoungScenery();       // and until they're halfway grown back, you can walk right over them
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
    if (tileHighlightOff) tile = null;                                 // ("Tile Highlight While Moving" in Settings: Enabled marks the tile in front of you wherever you go, Disabled shows no marker at all)
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
    camGoal.set(player.position.x, 0.8 + flyH, player.position.z);
    cam.target.lerp(camGoal, calmMotion ? 1 : 1 - Math.exp(-dt * 6));   // ("Enable Excessive Animations" set to No: the camera stays right with you, never trailing or swooping)
    var d = camClear(dt);                                              // (outdoors, it comes in in front of a wall or roof rather than going through it)
    var flat = Math.cos(cam.pitch) * d;
    camera.position.set(
      cam.target.x + Math.sin(cam.yaw) * flat,
      cam.target.y + Math.sin(cam.pitch) * d,
      cam.target.z + Math.cos(cam.yaw) * flat
    );
    camera.lookAt(cam.target);
  }
  // Outdoors, the camera never ends up inside a building looking at its hollow insides: if it would, it slides in to
  // just in front of the wall it went through, and once it's clear again it eases back out. (It's inside when there's
  // a wall between you and it and a roof right over it.) Looking over a building from the far side stays as it is
  var camMats = [], camRay = new THREE.Raycaster(), camDir = new THREE.Vector3(), camFrom = new THREE.Vector3(), camUp = new THREE.Vector3(0, 1, 0), camWalls = [], camWallsAt = -1, camDistNow = null, camSize = new THREE.Vector3();
  function camWallList() {                                             // (the big pieces of every building outside: walls, roofs, logs; not the little props, rails or glass)
    var list = [];
    [house, shopGroup, clinicGroup, barnGroup, carpGroup, coopGroup, fbarnGroup, millGroup, siloGroup].forEach(function (g) {
      if (!g || !g.parent) return;
      g.updateMatrixWorld(true);
      g.traverse(function (o) {
        if (!o.isMesh || !o.geometry) return;
        var m = Array.isArray(o.material) ? o.material[0] : o.material;
        if (!m || m.depthWrite === false && m.blending === THREE.AdditiveBlending) return;   // (not glows; glass and doors count, so it can't slip in through a window)
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        o.getWorldScale(camSize); var bb = o.geometry.boundingBox;
        var e = [(bb.max.x - bb.min.x) * Math.abs(camSize.x), (bb.max.y - bb.min.y) * Math.abs(camSize.y), (bb.max.z - bb.min.z) * Math.abs(camSize.z)].sort(function (p, q) { return q - p; });
        if (e[1] >= 0.3) list.push(o);                                 // (at least as wide as a log both ways)
      });
    });
    var houseMats = Object.keys(houseByMat).map(function (k) { return houseByMat[k].mat; });   // (the farmhouse's still parts were joined into a few meshes of their own)
    scene.children.forEach(function (o) { if (o.isMesh && houseMats.indexOf(o.material) >= 0) list.push(o); });
    camMats = [];                                                      // (every material they use, so the camera's checks can see both sides of a wall or roof)
    list.forEach(function (o) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (camMats.indexOf(m) < 0) camMats.push(m); }); });
    return list;
  }
  var camHid = false;
  function camHideMe(on) { if (on === camHid) return; camHid = on; player.visible = !on; }
  function camFirstHit(from, dir, far) {
    camRay.set(from, dir); camRay.near = 0.05; camRay.far = far;
    var sides = camMats.map(function (m) { var sd = m.side; m.side = THREE.DoubleSide; return sd; });   // (from inside, a wall or roof is only drawn from its outside, so check both faces)
    var hits = camRay.intersectObjects(camWalls, false);
    camMats.forEach(function (m, i) { m.side = sides[i]; });
    for (var i = 0; i < hits.length; i++) if (hits[i].object.visible && hits[i].object.parent && hits[i].object.parent.visible !== false) return hits[i].distance;
    return -1;
  }
  function camClear(dt) {
    var want = cam.dist, fit = want;
    if (indoors) { camDistNow = want; camHideMe(false); return want; }
    if (camWallsAt < 0 || state.time - camWallsAt > 2 || state.time < camWallsAt) { camWalls = camWallList(); camWallsAt = state.time; }
    camDir.set(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch));
    var out = camFirstHit(cam.target, camDir, want);                   // (the first wall or roof on the way out to the camera...)
    if (out > 0) {
      camFrom.copy(cam.target).addScaledVector(camDir, want);
      if (camFirstHit(camFrom, camUp, 12) > 0) fit = Math.max(0.25, out - 0.2);   // (...and if there's a roof right over the camera, it's inside: bring it in front of that wall, however close that is)
    }
    if (camDistNow === null || fit < camDistNow) camDistNow = fit;       // (straight in, so it's never seen poking through)
    else camDistNow += (fit - camDistNow) * (1 - Math.exp(-dt * 4));   // (and gently back out)
    camHideMe(camDistNow < 0.75);                                      // (right up against a wall, the camera is almost in her hat: she steps out of view for a moment)
    return camDistNow;
  }

  // ---------- Saving and loading ----------
  // Your game is kept in this browser (localStorage): your bag, the time and day, mana, harvests,
  // the garden, which trees, bushes and rocks are cut down and when, and where you're standing
  var SAVE_KEY = 'everdawn-save-1';                                    // (slot 1: the save slot you pick on the title screen changes this)
  function saveGame(quiet) {
    var px = player.position.x, pz = player.position.z;
    if (indoors) { px = OUT_DOOR_X; pz = OUT_DOOR_Z + 1.0; }          // saved inside the house? you'll load in at the front door
    if (inShop) { var so = shopFront(2.0); px = so.x; pz = so.z; }    // saved inside the shop? you'll load in outside its door
    if (inClinic) { var co = clinicFront(2.3); px = co.x; pz = co.z; } // and the same for the clinic
    if (inBarn) { var bo = animalFront(1.6); px = bo.x; pz = bo.z; }  // and Fluff & Feather
    if (inCarp) { var cpo = carpFront(1.8); px = cpo.x; pz = cpo.z; } // and Oak & Ember
    if (inCoop) { var coo = coopFront(1.8); px = coo.x; pz = coo.z; } // and your coop
    if (inFbarn) { var fbo = fbarnFront(2.0); px = fbo.x; pz = fbo.z; } // and your barn
    var data = {
      v: 1, savedAt: Date.now(), name: saveName,                      // (the name you gave this save)
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
      glimmers: glimmerSaveData(),                                    // your Glimmerwings
      coop: coopSaveData(),                                           // your coop: where it stands, and the hay on its bench
      fbarn: fbarnSaveData(),                                         // and the same for your barn
      mill: millSaveData(),                                           // your mill: where it is, and the day Oak & Ember started on it
      silo: siloSaveData()                                            // your silo: where it is, when Oak & Ember started on it, and how much hay is in it
    };
    var before = null; try { before = localStorage.getItem(SAVE_KEY); } catch (err) {}   // (what was in the slot until now, in case it's a day to keep as a backup)
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      keepBackup(before, data.state.day);
      if (!quiet) showToast('Game saved ✦');
    } catch (err) {
      showToast('Could not save here (this browser blocks saving)', 3000);
    }
  }
  // Day backups: when you save on a new day, the last save from the day before is kept as a backup of that slot (the
  // three most recent days are kept). With "Show Backup" set to Yes in Settings, the title screen lets you go back to
  // one of them. Backups are always kept, so turning it on later still finds them
  var BACKUPS_KEPT = 3;
  function keepBackup(raw, today) {
    var old = null; try { old = JSON.parse(raw); } catch (err) {}
    if (!old || old.v !== 1 || !old.state || !(old.state.day < today)) return;
    var key = SAVE_KEY + '-backups', list = [];
    try { list = JSON.parse(localStorage.getItem(key)) || []; } catch (err) {}
    list = [old].concat(list.filter(function (b) { return b && b.state && b.state.day !== old.state.day; })).slice(0, BACKUPS_KEPT);
    while (list.length) { try { localStorage.setItem(key, JSON.stringify(list)); return; } catch (err) { list.pop(); } }   // (short of room? keep fewer)
  }
  function clearTile(tile) {
    if (tile.crop) { scene.remove(tile.crop); tile.crop = null; }
    if (tile.drop) { scene.remove(tile.drop); tile.drop = null; }
    if (tile.soil) { scene.remove(tile.soil); tile.soil = null; uncoverGrass(tile); }
    var ti = tilling.indexOf(tile);
    if (ti >= 0) tilling.splice(ti, 1);
    tile.wet = false; tile.stage = 0; tile.growth = 0;
  }
  rwGlassMat.map = siGlassTex; rwGlassMat.needsUpdate = true;         // (Fluff & Feather's round window gets its glass now that the glass is made)
  // ---------- The seasons ----------
  // The year has four seasons of 28 days each: Spring, Summer, Fall and Winter, and then it's Spring again. The day
  // counter says the day of the week, which season it is and how far into it you are ("Monday · Spring, Day 1" up to
  // "Sunday · Spring, Day 28", then "Monday · Summer, Day 1"), and the morning a new season starts, a message says so
  var SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'], SEASON_DAYS = 28;
  var SEASON_NEWS = ['🌸 Spring has arrived! Blossoms and fresh green shoots everywhere.', '☀ Summer has arrived! Long, warm, golden days.', '🍂 Fall has arrived! Crisp air and leaves of red and gold.', '❄ Winter has arrived! Frosty mornings and cozy evenings.'];
  function seasonOf(day) { return Math.floor((day - 1) / SEASON_DAYS) % SEASONS.length; }   // (0: Spring, 1: Summer, 2: Fall, 3: Winter)
  function seasonDayNum(day) { return (day - 1) % SEASON_DAYS + 1; }  // (1 to 28)
  function seasonDay(day) { return SEASONS[seasonOf(day)] + ', Day ' + seasonDayNum(day); }   // ("Spring, Day 1")
  var WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];   // (every season is four whole weeks, so each one starts on a Monday)
  function weekdayOf(day) { return WEEKDAYS[(day - 1) % 7]; }
  function fullDay(day) { return weekdayOf(day) + ', ' + seasonDay(day); }   // ("Monday, Spring, Day 1")
  var seasonLastDay = state.day, seasonNewsDue = false;
  updateClock = function (dt) {
    state.minutes += dt * GAME_MINUTES_PER_SECOND;
    if (state.minutes >= 24 * 60) { state.minutes -= 24 * 60; state.day += 1; }
    var text = clockText(state.minutes);
    if (ui.clock.textContent !== text) ui.clock.textContent = text;
    var dayText = weekdayOf(state.day) + ' \u00b7 ' + seasonDay(state.day);   // ("Monday · Spring, Day 1")
    if (ui.day.textContent !== dayText) ui.day.textContent = dayText;
    if (state.day !== seasonLastDay) {                                 // (a new day: by the clock, or by sleeping, but not by loading a save)
      if (state.day === seasonLastDay + 1 && seasonDayNum(state.day) === 1) seasonNewsDue = true;
      seasonLastDay = state.day;
    }
    if (seasonNewsDue && !sleeping && state.minutes >= 6 * 60) {       // (said in the morning, once you're up)
      seasonNewsDue = false;
      var sn = SEASON_NEWS[seasonOf(state.day)];
      setTimeout(function () { showToast(sn + ' ' + fullDay(state.day) + '.', 4600); }, 3000);
    }
  };
  (function () {                                                      // (on a phone, the coins, time, mana and stamina wrap onto two lines instead of running off the edge)
    var st = document.createElement('style'); st.textContent = '@media (max-width: 640px) { .stats { flex-wrap: wrap !important; row-gap: 6px; } }'; document.head.appendChild(st);
  })();
  var seasonBaseToast = showToast;                                    // (the good-morning messages say the season too: "☀ Spring, Day 2")
  showToast = function (message, ms) {
    if (typeof message === 'string') message = message.replace(/☀ Day (\d+)/, function (m, n) { return '☀ ' + fullDay(+n); });
    return seasonBaseToast.call(this, message, ms);
  };

  // ---------- Spring on the island ----------
  // While it's Spring, the island looks it: many of the broadleaf trees (and some of the bushes) are covered in pink,
  // white and rose blossom, patches of tulips and daffodils come up in the meadows, and on fine days a few loose
  // petals drift down through the air around you. The blossom moves with its tree, so it falls with a chopped tree,
  // grows back with it, and shudders with it when you swing your axe. Out of Spring it's all tucked away
  function springHash(n) { var v = Math.sin(n * 78.233 + 1.7) * 43758.5453; return v - Math.floor(v); }
  function springNow() { return seasonOf(state.day) === 0; }
  // ===== blossom on the trees =====
  var springBlossomTex = (function () {                                // (a little spray of blossom, white so each card can be tinted: open five-petalled
    var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d');   //  flowers with notched petals, pink veins and stamens, plump buds, and a few new leaves)
    function leaf(x, y, a, L) { g.save(); g.translate(x, y); g.rotate(a); var gr = g.createLinearGradient(0, 0, L, 0); gr.addColorStop(0, '#6aa848'); gr.addColorStop(1, '#9ad070'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.5, -L * 0.32, L, 0); g.quadraticCurveTo(L * 0.5, L * 0.32, 0, 0); g.fill(); g.strokeStyle = 'rgba(60,110,40,0.6)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(L * 0.9, 0); g.stroke(); g.restore(); }
    function bud(x, y, a, r) { g.save(); g.translate(x, y); g.rotate(a); var gr = g.createRadialGradient(-r * 0.3, -r * 0.4, 1, 0, 0, r * 1.3); gr.addColorStop(0, '#fff4f8'); gr.addColorStop(1, '#e89ab8'); g.fillStyle = gr; g.beginPath(); g.ellipse(0, -r * 0.3, r * 0.75, r * 1.05, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#6a9a48'; g.beginPath(); g.moveTo(-r * 0.7, r * 0.3); g.quadraticCurveTo(0, r * 1.4, r * 0.7, r * 0.3); g.quadraticCurveTo(0, r * 0.7, -r * 0.7, r * 0.3); g.fill(); g.restore(); }
    function flower(cx, cy, r, a0) {
      for (var p = 0; p < 5; p++) {
        var a = a0 + p / 5 * Math.PI * 2; g.save(); g.translate(cx, cy); g.rotate(a);
        var gr = g.createLinearGradient(0, 0, r, 0); gr.addColorStop(0, '#f0b8cc'); gr.addColorStop(0.35, '#fff2f6'); gr.addColorStop(1, '#ffffff');
        g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0);
        g.bezierCurveTo(r * 0.3, -r * 0.55, r * 0.95, -r * 0.5, r, -r * 0.12); g.lineTo(r * 0.86, 0); g.lineTo(r, r * 0.12);   // (the little notch at its tip)
        g.bezierCurveTo(r * 0.95, r * 0.5, r * 0.3, r * 0.55, 0, 0); g.fill();
        g.strokeStyle = 'rgba(214,120,150,0.35)'; g.lineWidth = 0.8; [-0.18, 0, 0.18].forEach(function (v) { g.beginPath(); g.moveTo(r * 0.12, 0); g.quadraticCurveTo(r * 0.5, v * r * 0.6, r * 0.8, v * r * 1.1); g.stroke(); });
        g.restore();
      }
      g.fillStyle = '#c8d870'; g.beginPath(); g.arc(cx, cy, r * 0.16, 0, Math.PI * 2); g.fill();
      for (var s = 0; s < 12; s++) { var sa = s / 12 * Math.PI * 2 + a0, sl = r * (0.36 + (s % 3) * 0.06); g.strokeStyle = 'rgba(220,150,170,0.9)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(sa) * sl, cy + Math.sin(sa) * sl); g.stroke(); g.fillStyle = '#f2b830'; g.beginPath(); g.arc(cx + Math.cos(sa) * sl, cy + Math.sin(sa) * sl, 1.5, 0, Math.PI * 2); g.fill(); }
    }
    for (var l = 0; l < 4; l++) leaf(40 + springHash(l * 4.1) * 170, 40 + springHash(l * 6.3) * 170, springHash(l * 2.2) * 6.28, 30 + springHash(l) * 16);
    for (var b = 0; b < 5; b++) bud(30 + springHash(b * 8.3 + 1) * 196, 30 + springHash(b * 3.9 + 2) * 196, springHash(b * 1.7) * 6.28, 7 + springHash(b * 5.5) * 4);
    for (var f = 0; f < 8; f++) flower(44 + springHash(f * 3.1) * 168, 44 + springHash(f * 7.7) * 168, 20 + springHash(f * 5.3) * 12, springHash(f) * 6.28);
    var t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  })();
  var springBlossoms = foliageBatch(new THREE.PlaneGeometry(1, 1), springBlossomTex, 16000);
  var springBlossomM = new THREE.Matrix4();
  scene.add(springBlossoms);
  (function () {
    var m = new THREE.Matrix4(), rot = new THREE.Matrix4(), sc = new THREE.Matrix4(), off = new THREE.Matrix4(), cur = new THREE.Matrix4(), inv = new THREE.Matrix4(), p = new THREE.Vector3(), mid = new THREE.Vector3(), col = new THREE.Color();
    var TINTS = [[1, 0.72, 0.84], [1, 0.8, 0.9], [1, 0.62, 0.78], [1, 0.95, 0.97], [1, 0.76, 0.88]];
    allScenery.forEach(function (t, ti) {
      var u = t.userData, tree = choppable.indexOf(t) >= 0;
      if (u.gone || (tree && !u.leafy) || !u.leaves || !u.leafOrig) return;
      if (springHash(ti * 1.37) > (tree ? 0.62 : 0.4)) return;          // (not every tree blossoms)
      var tint = TINTS[Math.floor(springHash(ti * 2.9) * TINTS.length)], start = springBlossoms.count, orig = [];
      u.leaves.forEach(function (L, n) {
        if (L.batch !== leafBatch || !L.count) return;
        var o = u.leafOrig[n]; mid.set(0, 0, 0);
        for (var i = 0; i < L.count; i++) { p.set(o[i * 16 + 12], o[i * 16 + 13], o[i * 16 + 14]); mid.add(p); }
        mid.multiplyScalar(1 / L.count);
        for (var j = 0; j < L.count; j++) {
          if (springHash(ti * 31 + n * 7 + j * 1.91) > 0.75 || springBlossoms.count >= springBlossoms.instanceMatrix.count) continue;
          m.fromArray(o, j * 16); p.set(o[j * 16 + 12], o[j * 16 + 13], o[j * 16 + 14]).sub(mid);
          if (p.y < -0.25 * (u.size || 1)) continue;                    // (blossom on the outside and the top of the canopy, not underneath)
          p.normalize().multiplyScalar(0.1 * (u.size || 1));
          m.premultiply(off.makeTranslation(p.x, p.y + 0.03, p.z)).multiply(rot.makeRotationZ(springHash(j * 5.1) * 6.28)).multiply(sc.makeScale(0.9, 0.9, 0.9));
          orig.push.apply(orig, m.toArray());
          var k = 0.92 + springHash(j * 2.3) * 0.12; col.setRGB(tint[0] * k, tint[1] * k, tint[2] * k);
          springBlossoms.setMatrixAt(springBlossoms.count, m); springBlossoms.setColorAt(springBlossoms.count, col); springBlossoms.count++;
        }
      });
      var count = springBlossoms.count - start; if (!count) return;
      u.blossoms = { start: start, count: count, orig: orig };
      // (if the tree is already cut down or growing back, its blossom starts out the same way)
      var L0 = u.leaves[0];
      if (L0 && L0.count) { cur.fromArray(L0.batch.instanceMatrix.array, L0.start * 16); inv.fromArray(u.leafOrig[0], 0).invert(); springBlossomMove(u, cur.multiply(inv)); }
    });
    springBlossoms.instanceMatrix.needsUpdate = true; if (springBlossoms.instanceColor) springBlossoms.instanceColor.needsUpdate = true;
  })();
  function springBlossomMove(u, M) {
    var B = u.blossoms, arr = springBlossoms.instanceMatrix.array, m = springBlossomM;
    for (var i = 0; i < B.count; i++) { m.fromArray(B.orig, i * 16).premultiply(M); m.toArray(arr, (B.start + i) * 16); }
    markDirty(springBlossoms.instanceMatrix, B.start * 16, B.count * 16);
  }
  var springBaseTreeTransform = setTreeTransform;                     // (the blossom goes wherever its tree goes)
  setTreeTransform = function (t, M, which) {
    springBaseTreeTransform(t, M, which);
    if (which !== 'ground' && t.userData.blossoms) springBlossomMove(t.userData, M);
  };
  // ===== tulips and daffodils in the meadows =====
  var SPRING_FLOWERS = [], SPRING_CLUMPS = [], springFlowerMesh = [], springFlowerShown = null;
  (function () {
    // (each patch is one kind: tulips in red, pink, white, purple or orange; daffodils in yellow or cream with a deeper trumpet; or low crocuses)
    var KINDS = [
      { kind: 'tulip', cols: [0xe8404e, 0xf05a6a], h: 0.34 }, { kind: 'tulip', cols: [0xff8fb0, 0xffb4cc], h: 0.34 }, { kind: 'tulip', cols: [0xfff2f6, 0xffe0ea], h: 0.34 },
      { kind: 'tulip', cols: [0xa070e0, 0xb48af0], h: 0.34 }, { kind: 'tulip', cols: [0xff9a4a, 0xffb060], h: 0.34 },
      { kind: 'daff', cols: [0xffe46a, 0xf6d24a], trumpet: 0xf09a20, h: 0.36 }, { kind: 'daff', cols: [0xfff6d8, 0xfff0c0], trumpet: 0xf6c030, h: 0.36 },
      { kind: 'crocus', cols: [0x9a6ad8, 0xb890f0, 0xfff4fa, 0xf8d050], h: 0.1 }
    ];
    for (var c = 0, tries = 0; c < 80 && tries < 5000; tries++) {
      var cx = -ISLAND + 3 + springHash(tries * 3.7 + 11) * (ISLAND * 2 - 6), cz = -ISLAND + 3 + springHash(tries * 5.3 + 7) * (ISLAND * 2 - 6);
      if (!springFlowerSpot(cx, cz, 1.0)) continue;
      c++; SPRING_CLUMPS.push({ x: cx, z: cz, y: groundHeight(cx, cz) });
      var K = KINDS[Math.floor(springHash(c * 9.1) * KINDS.length)], n = (K.kind === 'crocus' ? 9 : 6) + Math.floor(springHash(c * 4.4) * 7);
      for (var f = 0; f < n; f++) {
        var a = springHash(c * 17 + f * 3.3) * 6.28, r = 0.12 + springHash(c * 13 + f * 1.7) * (K.kind === 'crocus' ? 0.45 : 0.55), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
        if (!springFlowerSpot(x, z, 0.3)) continue;
        SPRING_FLOWERS.push({ x: x, z: z, y: groundHeight(x, z), kind: K.kind, h: K.h + springHash(c * 7 + f) * K.h * 0.4, rot: springHash(c * 3 + f * 5) * 6.28, tilt: (springHash(c + f * 11) - 0.5) * 0.25,
          col: K.cols[Math.floor(springHash(c * 2 + f * 1.3) * K.cols.length)], trumpet: K.trumpet, open: springHash(c * 5 + f * 2.1) });
      }
    }
    // (a stem; and a long strap leaf that arches outward and narrows to its tip)
    var stemGeo = new THREE.CylinderGeometry(0.009, 0.013, 1, 6); stemGeo.translate(0, 0.5, 0);
    var leafGeo = new THREE.PlaneGeometry(0.05, 0.3, 1, 8), lp = leafGeo.attributes.position;
    for (var v = 0; v < lp.count; v++) { var ly = lp.getY(v) + 0.15, t = ly / 0.3; lp.setXYZ(v, lp.getX(v) * (1 - t * 0.75), ly * (1 - t * 0.25), t * t * 0.11); }
    leafGeo.computeVertexNormals();
    // (a tulip: an inner and an outer ring of three curved petals, making a deep cup)
    var tulipParts = [];
    for (var pp = 0; pp < 6; pp++) {
      var inner = pp % 2, pr = inner ? 0.041 : 0.045, pg = new THREE.SphereGeometry(pr, 8, 8, pp / 6 * Math.PI * 2 - 0.62, 1.24, Math.PI * 0.3, Math.PI * 0.7);
      pg.scale(1, 1.45, 1); pg.translate(0, pr * 1.45, 0); tulipParts.push(pg);
    }
    var tulipGeo = mergeSimple(tulipParts);
    // (a daffodil: six pointed petals in a star, cupped forward a little, round a ruffled trumpet)
    var petal = new THREE.Shape(); petal.moveTo(0, 0); petal.quadraticCurveTo(0.017, 0.022, 0, 0.056); petal.quadraticCurveTo(-0.017, 0.022, 0, 0);
    var daffParts = [];
    for (var dp = 0; dp < 6; dp++) { var sg = new THREE.ShapeGeometry(petal, 6); sg.rotateX(-0.3); sg.rotateZ(dp / 6 * Math.PI * 2 + (dp % 2) * 0.08); daffParts.push(sg); }
    var daffGeo = mergeSimple(daffParts);
    var trumpetGeo = new THREE.LatheGeometry([[0.008, 0], [0.013, 0.012], [0.015, 0.03], [0.02, 0.042], [0.024, 0.046]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 18);
    var tp = trumpetGeo.attributes.position;
    for (var w = 0; w < tp.count; w++) if (tp.getY(w) > 0.044) { var ang = Math.atan2(tp.getZ(w), tp.getX(w)), rr = 1 + Math.sin(ang * 9) * 0.14; tp.setX(w, tp.getX(w) * rr); tp.setZ(w, tp.getZ(w) * rr); }   // (its frilly rim)
    trumpetGeo.rotateX(Math.PI / 2); trumpetGeo.computeVertexNormals();
    var mStem = new THREE.MeshStandardMaterial({ color: 0x5aa04a, roughness: 0.75, side: THREE.DoubleSide }), mLeaf = new THREE.MeshStandardMaterial({ color: 0x4f9440, roughness: 0.7, side: THREE.DoubleSide });
    var mHead = new THREE.MeshStandardMaterial({ roughness: 0.5, side: THREE.DoubleSide });
    function only(k) { return SPRING_FLOWERS.filter(function (f) { return f.kind === k; }); }
    var daffs = only('daff');
    springFlowerMesh = [
      { geo: stemGeo, m: mStem, list: SPRING_FLOWERS, part: 'stem' },
      { geo: leafGeo, m: mLeaf, list: SPRING_FLOWERS, part: 'leaf', side: 0 }, { geo: leafGeo, m: mLeaf, list: SPRING_FLOWERS, part: 'leaf', side: 1 },
      { geo: tulipGeo, m: mHead, list: only('tulip'), part: 'tulip' }, { geo: tulipGeo, m: mHead, list: only('crocus'), part: 'crocus' },
      { geo: daffGeo, m: mHead, list: daffs, part: 'daff' }, { geo: trumpetGeo, m: mHead, list: daffs, part: 'trumpet' }
    ].map(function (F) {
      F.im = new THREE.InstancedMesh(F.geo, F.m, Math.max(1, F.list.length)); F.im.castShadow = true; F.im.frustumCulled = false; scene.add(F.im);
      var col = new THREE.Color();
      F.list.forEach(function (f, i) { var k = 0.92 + f.open * 0.16; F.im.setColorAt(i, F.part === 'stem' || F.part === 'leaf' ? col.setRGB(k, k, k) : col.set(F.part === 'trumpet' ? f.trumpet : f.col)); });
      return F;
    });
  })();
  function mergeUV(geos) {                                             // (the same, keeping each shape's texture coordinates, for petals with a painted face)
    var out = mergeSimple(geos), uv = [];
    geos.forEach(function (g) { var u = g.attributes.uv; for (var i = 0; i < g.attributes.position.count; i++) uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0); });
    out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); return out;
  }
  function mergeSimple(geos) {                                         // (a handful of little shapes joined into one)
    var pos = [], nor = [], idx = [], off = 0;
    geos.forEach(function (g) { var p = g.attributes.position, nn = g.attributes.normal; for (var i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(nn.getX(i), nn.getY(i), nn.getZ(i)); } if (g.index) for (var k = 0; k < g.index.count; k++) idx.push(g.index.getX(k) + off); else for (var q = 0; q < p.count; q++) idx.push(q + off); off += p.count; });
    var out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setIndex(idx); return out;
  }
  function springFlowerSpot(x, z, pad) {                               // (open meadow: not on a path, your fields or yard, a building, the lake or under a tree or rock)
    if (!onIsland(x, z) || inLake(x, z) || onDock(x, z) || underDock(x, z) || groundHeight(x, z) < 0) return false;
    if (pathDist(x, z) < PATH_W + 0.6 || stonePathDist(x, z) < 1.2 || inHouseYard(x, z) || dist(x, z, HOUSE_X, HOUSE_Z) < 7 || dist(x, z, TREE_X, TREE_Z) < TREE_ZONE + 2) return false;
    if (Math.abs(x - (FARM_X + COLS * TILE / 2)) < COLS * TILE / 2 + 1.5 && Math.abs(z - (FARM_Z + ROWS * TILE / 2)) < ROWS * TILE / 2 + 1.5) return false;
    for (var i = 0; i < solids.length; i++) { var sd = solids[i]; if (sd.r > 0 && Math.abs(sd.x - x) < sd.r + pad && Math.abs(sd.z - z) < sd.r + pad && dist(x, z, sd.x, sd.z) < sd.r + pad) return false; }
    return true;
  }
  function springFlowerOK(f) {                                         // (still there? not dug up into soil, built over, or under a tree that's grown back)
    var t = tileMap[tileKey(Math.floor((f.x - FARM_X) / TILE), Math.floor((f.z - FARM_Z) / TILE))];
    if (t && t.soil) return false;
    return !(coopCovers(f.x, f.z, 0.3) || fbarnCovers(f.x, f.z, 0.3) || millCovers(f.x, f.z, 0.3) || siloCovers(f.x, f.z, 0.3));
  }
  var springFlowerM = new THREE.Matrix4(), springFlowerQ = new THREE.Quaternion(), springFlowerE = new THREE.Euler(), springFlowerV = new THREE.Vector3(), springFlowerS = new THREE.Vector3(), springFlowerT = -99, springWasOn = null;
  function springFlowersPlace(show) {
    var key = SPRING_FLOWERS.map(function (f) { return show && springFlowerOK(f) ? 1 : 0; }).join('');
    if (key === springFlowerShown) return; springFlowerShown = key;
    springFlowerMesh.forEach(function (F) {
      F.list.forEach(function (f, i) {
        var k = key[SPRING_FLOWERS.indexOf(f)] === '1' ? 1 : 0;
        springFlowerE.set(f.tilt, f.rot, f.tilt * 0.6); springFlowerQ.setFromEuler(springFlowerE);   // (each stem leans a little its own way)
        springFlowerV.set(f.x, f.y, f.z);
        if (F.part === 'stem') springFlowerS.set(k, f.h * k, k);
        else if (F.part === 'leaf') {                                    // (two leaves from the base, arching out on either side)
          var big = f.kind === 'crocus' ? 0.55 : 1.1 + f.open * 0.3; springFlowerS.setScalar(k * big);
          springFlowerE.set(0.12 + f.open * 0.2, f.rot + 1.3 + F.side * Math.PI + (f.open - 0.5) * 0.6, 0, 'YXZ'); springFlowerQ.setFromEuler(springFlowerE);
        } else {                                                         // (the flower on top of its stem: tulips and crocuses upright, daffodils nodding outward)
          springFlowerV.set(0, f.h, 0).applyQuaternion(springFlowerQ).add(springFlowerS.set(f.x, f.y, f.z));
          springFlowerS.setScalar(k * (F.part === 'tulip' ? 1.7 + f.open * 0.3 : F.part === 'crocus' ? 1.25 : 2.0));
          if (F.part === 'daff' || F.part === 'trumpet') { springFlowerE.set(-0.35, f.rot, 0); springFlowerQ.setFromEuler(springFlowerE); }
          if (F.part === 'crocus') { springFlowerE.set(f.tilt, f.rot, 0); springFlowerQ.setFromEuler(springFlowerE); springFlowerS.y *= 1.25; }
        }
        springFlowerM.compose(springFlowerV, springFlowerQ, springFlowerS); F.im.setMatrixAt(i, springFlowerM);
      });
      F.im.instanceMatrix.needsUpdate = true; if (F.im.instanceColor) F.im.instanceColor.needsUpdate = true;
    });
  }
  // ===== petals drifting down =====
  var springPetals = (function () {
    var N = 150, pos = new Float32Array(N * 3), seeds = [];
    for (var i = 0; i < N; i++) seeds.push({ x: (springHash(i * 3.3) - 0.5) * 28, y: springHash(i * 5.7) * 9, z: (springHash(i * 7.1) - 0.5) * 28, s: 0.25 + springHash(i * 2.2) * 0.35, w: springHash(i * 9.9) * 6.28 });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var c = document.createElement('canvas'); c.width = c.height = 32; var x = c.getContext('2d');
    x.fillStyle = '#ffd6e4'; x.beginPath(); x.ellipse(16, 16, 11, 6, 0.6, 0, Math.PI * 2); x.fill(); x.fillStyle = 'rgba(255,255,255,0.7)'; x.beginPath(); x.ellipse(13, 14, 5, 2.5, 0.6, 0, Math.PI * 2); x.fill();
    var pts = new THREE.Points(g, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size: 0.15, transparent: true, alphaTest: 0.3, depthWrite: false }));
    pts.frustumCulled = false; pts.userData.seeds = seeds; scene.add(pts); return pts;
  })();
  function springPetalsMove(dt) {
    var a = springPetals.geometry.attributes.position, S = springPetals.userData.seeds, cx = cam.target.x, cz = cam.target.z, t = state.time;
    S.forEach(function (s, i) {
      s.y -= dt * s.s; s.x += dt * (0.25 + Math.sin(t * 0.7 + s.w) * 0.3); s.z += dt * Math.cos(t * 0.5 + s.w) * 0.2;
      var wx = cx + ((s.x % 28) + 42) % 28 - 14, wz = cz + ((s.z % 28) + 42) % 28 - 14, gy = groundHeight(wx, wz);
      if (s.y < Math.max(gy, WATER_Y) + 0.05) { s.y = gy + 7 + springHash(i + t) * 3; }   // (a petal that reaches the ground is gone; a new one starts up high)
      a.setXYZ(i, wx + Math.sin(t * 2 + s.w) * 0.15, s.y, wz);
    });
    a.needsUpdate = true;
  }
  // ===== butterflies over the flowers =====
  var springButterflies = (function () {
    var SPECIES = [['#fbfaf4', '#4a4a4a', '#e8e4d8'], ['#f6e46a', '#c8a020', '#f0d850'], ['#fbfaf4', '#f08a2a', '#e8e0d0'], ['#8ab8f0', '#3a5aa8', '#b8d4f8'], ['#f4a6c8', '#b85a88', '#f8c8dc']];
    function wingTex(sp, lower) {                                      // (a wing, with darker tips and veins, and a spot)
      var c = document.createElement('canvas'); c.width = c.height = 64; var g = c.getContext('2d');
      g.fillStyle = sp[0]; g.beginPath();
      if (lower) { g.moveTo(2, 4); g.bezierCurveTo(30, 0, 56, 18, 46, 44); g.bezierCurveTo(36, 62, 10, 52, 2, 30); }
      else { g.moveTo(2, 58); g.bezierCurveTo(10, 20, 40, 0, 62, 8); g.bezierCurveTo(60, 34, 40, 56, 2, 60); }
      g.closePath(); g.fill(); g.save(); g.clip();
      g.fillStyle = sp[1]; if (lower) { g.beginPath(); g.arc(40, 40, 10, 0, 6.28); g.fill(); } else { g.beginPath(); g.ellipse(56, 12, 14, 9, 0.5, 0, 6.28); g.fill(); g.fillStyle = sp[0]; g.beginPath(); g.arc(52, 16, 3, 0, 6.28); g.fill(); }
      g.strokeStyle = 'rgba(60,50,40,0.35)'; g.lineWidth = 1; for (var v = 0; v < 5; v++) { g.beginPath(); g.moveTo(3, lower ? 6 : 56); g.lineTo(lower ? 20 + v * 8 : 30 + v * 7, lower ? 20 + v * 7 : 6 + v * 9); g.stroke(); }
      g.fillStyle = sp[1]; g.beginPath(); g.arc(lower ? 24 : 34, lower ? 26 : 28, 3.4, 0, 6.28); g.fill();
      g.restore(); g.strokeStyle = 'rgba(60,50,40,0.5)'; g.lineWidth = 1.5; g.stroke();
      var t = new THREE.CanvasTexture(c); return t;
    }
    var mBody = new THREE.MeshStandardMaterial({ color: 0x3a3028, roughness: 0.7 });
    var list = [];
    for (var b = 0; b < 12; b++) {
      var sp = SPECIES[b % SPECIES.length], G = new THREE.Group(), mats = [false, true].map(function (lower) { return new THREE.MeshStandardMaterial({ map: wingTex(sp, lower), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 }); });
      var body = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.06, 6), mBody); body.rotation.x = Math.PI / 2; G.add(body);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.008, 8, 6), mBody); head.position.z = 0.032; G.add(head);
      [-1, 1].forEach(function (s) { var an = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, 0.04, 3), mBody); an.position.set(s * 0.008, 0.012, 0.048); an.rotation.set(0.9, 0, -s * 0.3); G.add(an); });
      var wings = [-1, 1].map(function (s) {                          // (each side: a hinge at the body, with the fore and hind wing on it)
        var hinge = new THREE.Group(); hinge.scale.x = s; G.add(hinge);
        var up = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.07), mats[0]); up.rotation.x = -Math.PI / 2; up.position.set(0.035, 0, 0.012); hinge.add(up);
        var lo = new THREE.Mesh(new THREE.PlaneGeometry(0.055, 0.055), mats[1]); lo.rotation.x = -Math.PI / 2; lo.position.set(0.027, -0.001, -0.022); hinge.add(lo);
        return hinge;
      });
      G.scale.setScalar(2.4); G.visible = false; scene.add(G);   // (a little bigger than life, so you can see them)
      list.push({ g: G, wings: wings, clump: null, ph: springHash(b * 3.1) * 6.28, sp: 0.7 + springHash(b * 1.9) * 0.6, x: 0, y: 0, z: 0 });
    }
    return list;
  })();
  function springButterfliesMove(dt, on) {
    var px = player.position.x, pz = player.position.z, t = state.time;
    springButterflies.forEach(function (B, i) {
      if (B.g.visible !== on) B.g.visible = on;
      if (!on) { B.clump = null; return; }
      var patches = summerNow() ? SUMMER_CLUMPS : SPRING_CLUMPS;          // (in Summer they visit the summer flowers)
      if (!B.clump || patches.indexOf(B.clump) < 0 || dist(B.clump.x, B.clump.z, px, pz) > 26) {   // (each one keeps to a flower patch near you, moving on to another as you go)
        var near = patches.filter(function (c) { return dist(c.x, c.z, px, pz) < 18; });
        if (!near.length) { B.g.visible = false; return; }
        B.clump = near[Math.floor(springHash(i * 7.7 + Math.floor(t / 20)) * near.length) % near.length];
        B.x = B.clump.x; B.z = B.clump.z; B.y = B.clump.y + 0.6;
      }
      var c = B.clump, a = t * 0.45 * B.sp + B.ph;                      // (a lazy, looping wander over its patch, dipping toward the flowers now and then)
      var nx = c.x + Math.sin(a) * 1.3 + Math.sin(a * 2.3) * 0.5, nz = c.z + Math.cos(a * 0.8) * 1.2 + Math.cos(a * 1.9) * 0.4, ny = c.y + 0.55 + Math.sin(a * 1.6) * 0.3 + Math.sin(t * 7 + B.ph) * 0.04;
      var dx = nx - B.x, dz = nz - B.z;
      B.x = nx; B.y = ny; B.z = nz; B.g.position.set(nx, ny, nz);
      if (Math.abs(dx) + Math.abs(dz) > 1e-5) B.g.rotation.y = Math.atan2(dx, dz);
      var flap = Math.sin(t * 18 * B.sp + B.ph) * 0.9 + 0.35;              // (wings beating)
      B.wings[0].rotation.z = flap; B.wings[1].rotation.z = flap;
    });
  }
  // ===== every frame =====
  function updateSpring(dt) {
    var on = springNow();
    if (springBlossoms.visible !== on) springBlossoms.visible = on;
    if (on !== springWasOn || state.time - springFlowerT > 2) { springWasOn = on; springFlowerT = state.time; springFlowersPlace(on); }   // (and every couple of seconds, in case one's been dug up or built over)
    var hr = state.minutes / 60, petals = on && !indoors && hr > 6 && hr < 19.5;
    if (springPetals.visible !== petals) springPetals.visible = petals;
    if (petals) springPetalsMove(dt);
    springButterfliesMove(dt, (on || summerNow()) && !indoors && hr > 6 && hr < 19.5);   // (butterflies through Spring and Summer)
  }


  // ---------- Summer on the island ----------
  // While it's Summer: the broadleaf trees and bushes are a deep, rich green, and the trees that blossomed in Spring
  // are hung with ripe red and orange fruit (which falls with a chopped tree and grows back with it, like the blossom).
  // Tall sunflowers, red poppies, oxeye daisies and bushes of lavender fill the meadows, the butterflies stay on for
  // the summer flowers, and on warm evenings fireflies blink over the grass
  function summerNow() { return seasonOf(state.day) === 1; }
  // ===== a deeper green =====
  var SUMMER_LEAF = new THREE.Color(0.58, 0.8, 0.46), PLAIN_LEAF = new THREE.Color(1, 1, 1);
  // ===== fruit on the trees that blossomed =====
  var summerFruitGeo = new THREE.LatheGeometry([[0, -0.052], [0.022, -0.058], [0.05, -0.04], [0.066, -0.005], [0.064, 0.028], [0.046, 0.05], [0.02, 0.052], [0.006, 0.04], [0, 0.036]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 16);   // (an apple: round, with a dimple at the top and a smaller one underneath)
  summerFruitGeo.computeVertexNormals();
  var summerStalkGeo = new THREE.CylinderGeometry(0.004, 0.006, 0.06, 5); summerStalkGeo.translate(0, 0.064, 0); summerStalkGeo.rotateZ(0.2);
  var summerLeafGeo = (function () { var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.quadraticCurveTo(0.03, 0.02, 0.07, 0); sh.quadraticCurveTo(0.03, -0.02, 0, 0); var g = new THREE.ShapeGeometry(sh, 5); g.rotateX(-1.1); g.rotateY(0.6); g.translate(-0.01, 0.085, 0); return g; })();
  var summerFruitLeaves = new THREE.InstancedMesh(summerLeafGeo, new THREE.MeshStandardMaterial({ color: 0x4a8a34, roughness: 0.7, side: THREE.DoubleSide }), 3000);
  var summerFruit = new THREE.InstancedMesh(summerFruitGeo, new THREE.MeshStandardMaterial({ roughness: 0.35 }), 3000);
  var summerStalks = new THREE.InstancedMesh(summerStalkGeo, new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.8 }), 3000);
  summerFruit.castShadow = true; summerFruit.setColorAt(0, new THREE.Color(1, 1, 1)); summerFruit.count = summerStalks.count = summerFruitLeaves.count = 0; scene.add(summerFruitLeaves);   // (making room for each fruit's colour first)
  scene.add(summerFruit); scene.add(summerStalks);
  var summerFruitM = new THREE.Matrix4();
  (function () {
    var m = new THREE.Matrix4(), cur = new THREE.Matrix4(), inv = new THREE.Matrix4(), col = new THREE.Color(), p = new THREE.Vector3();
    var FRUIT = [[0xd8302c, 0xe84838], [0xf08a2a, 0xf6a040], [0xc81e3a, 0xe03c50], [0xe8c040, 0xb8d050]];   // (red apples, apricots, cherries, golden plums)
    allScenery.forEach(function (t, ti) {
      var u = t.userData; if (!u.blossoms || choppable.indexOf(t) < 0) return;
      var B = u.blossoms, pal = FRUIT[Math.floor(springHash(ti * 4.7) * FRUIT.length)], start = summerFruit.count, orig = [];
      for (var i = 0; i < B.count; i += 3) {
        if (summerFruit.count >= 3000) break;
        p.set(B.orig[i * 16 + 12], B.orig[i * 16 + 13] - 0.12, B.orig[i * 16 + 14]);   // (hanging just under the leaves)
        var s = (0.85 + springHash(ti + i * 1.3) * 0.35) * Math.max(0.8, Math.min(1.3, u.size || 1));
        m.makeRotationY(springHash(i * 2.1) * 6.28).scale(p.clone().set(s, s, s)).setPosition(p);
        orig.push.apply(orig, m.toArray());
        col.set(pal[i % 2]).multiplyScalar(0.9 + springHash(i * 7.3) * 0.2);
        summerFruit.setMatrixAt(summerFruit.count, m); summerStalks.setMatrixAt(summerFruit.count, m); summerFruitLeaves.setMatrixAt(summerFruit.count, m); summerFruit.setColorAt(summerFruit.count, col);
        summerFruit.count++;
      }
      summerStalks.count = summerFruitLeaves.count = summerFruit.count;
      var count = summerFruit.count - start; if (!count) return;
      u.fruits = { start: start, count: count, orig: orig };
      var L0 = u.leaves[0]; if (L0 && L0.count) { cur.fromArray(L0.batch.instanceMatrix.array, L0.start * 16); inv.fromArray(u.leafOrig[0], 0).invert(); summerFruitMove(u, cur.multiply(inv)); }
    });
    summerFruit.instanceMatrix.needsUpdate = summerStalks.instanceMatrix.needsUpdate = summerFruitLeaves.instanceMatrix.needsUpdate = true; if (summerFruit.instanceColor) summerFruit.instanceColor.needsUpdate = true;
  })();
  function summerFruitMove(u, M) {
    var F = u.fruits, a1 = summerFruit.instanceMatrix.array, a2 = summerStalks.instanceMatrix.array, a3 = summerFruitLeaves.instanceMatrix.array, m = summerFruitM;
    for (var i = 0; i < F.count; i++) { m.fromArray(F.orig, i * 16).premultiply(M); m.toArray(a1, (F.start + i) * 16); m.toArray(a2, (F.start + i) * 16); m.toArray(a3, (F.start + i) * 16); }
    markDirty(summerFruit.instanceMatrix, F.start * 16, F.count * 16); markDirty(summerStalks.instanceMatrix, F.start * 16, F.count * 16); markDirty(summerFruitLeaves.instanceMatrix, F.start * 16, F.count * 16);
  }
  var summerBaseTreeTransform = setTreeTransform;                     // (the fruit goes wherever its tree goes, like the blossom)
  setTreeTransform = function (t, M, which) {
    summerBaseTreeTransform(t, M, which);
    if (which !== 'ground' && t.userData.fruits) summerFruitMove(t.userData, M);
  };
  // ===== sunflowers, poppies, daisies and lavender =====
  var SUMMER_FLOWERS = [], SUMMER_LEAVES = [], SUMMER_CLUMPS = [], summerFlowerMesh = [], summerFlowerShown = null, summerFlowerT = -99, summerWasOn = null;
  (function () {
    var KINDS = ['sun', 'sun', 'poppy', 'poppy', 'daisy', 'daisy', 'lav'], sunPatches = [];
    for (var c = 0, tries = 0; c < 75 && tries < 5000; tries++) {
      var cx = -ISLAND + 3 + springHash(tries * 4.9 + 301) * (ISLAND * 2 - 6), cz = -ISLAND + 3 + springHash(tries * 6.1 + 77) * (ISLAND * 2 - 6);
      if (!springFlowerSpot(cx, cz, 1.0)) continue;
      c++; SUMMER_CLUMPS.push({ x: cx, z: cz, y: groundHeight(cx, cz) });
      var kind = KINDS[Math.floor(springHash(c * 3.3 + 50) * KINDS.length)];
      if (kind === 'sun' && sunPatches.some(function (q) { return dist(q[0], q[1], cx, cz) < 8; })) kind = springHash(c * 1.9) < 0.5 ? 'poppy' : 'daisy';   // (sunflower patches keep well apart)
      if (kind === 'sun') sunPatches.push([cx, cz]);
      var n = kind === 'sun' ? 3 + Math.floor(springHash(c * 2.7) * 4) : kind === 'lav' ? 2 + Math.floor(springHash(c * 2.7) * 2) : 8 + Math.floor(springHash(c * 2.7) * 8);
      for (var f = 0; f < n; f++) {
        var a = springHash(c * 19 + f * 3.7) * 6.28, r = (kind === 'sun' ? 0.45 : kind === 'lav' ? 0.35 : 0.12) + springHash(c * 11 + f * 1.9) * (kind === 'sun' ? 1.1 : 0.55), x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r;
        if (!springFlowerSpot(x, z, kind === 'sun' ? 0.45 : 0.3)) continue;
        if (kind === 'sun' && SUMMER_FLOWERS.some(function (o) { return o.kind === 'sun' && dist(o.x, o.z, x, z) < 0.85; })) continue;   // (each sunflower with room round it)
        if (kind === 'lav') {                                            // (a lavender bush: a dome of slender stems, each with a purple spike)
          for (var st = 0; st < 16; st++) { var la = st / 16 * 6.28 + springHash(st + f * 9) * 0.4, lt = 0.15 + springHash(st * 3 + f) * 0.4;
            SUMMER_FLOWERS.push({ x: x, z: z, y: groundHeight(x, z), kind: 'lav', h: 0.38 + springHash(st * 7 + f) * 0.16, rot: la, tilt: lt, v: springHash(st * 5.5 + c) }); }
          continue;
        }
        var fl = { x: x, z: z, y: groundHeight(x, z), kind: kind, h: kind === 'sun' ? 1.15 + springHash(c * 5 + f) * 0.5 : kind === 'poppy' ? 0.36 + springHash(c * 5 + f) * 0.16 : 0.3 + springHash(c * 5 + f) * 0.14,
          rot: kind === 'sun' ? (springHash(c + f * 3) - 0.5) * 0.9 : springHash(c * 3 + f * 5) * 6.28, tilt: (springHash(c + f * 11) - 0.5) * (kind === 'sun' ? 0.12 : 0.3), v: springHash(c * 9 + f * 2.2) };
        SUMMER_FLOWERS.push(fl);
        if (kind === 'sun') for (var lv = 0; lv < 5; lv++) SUMMER_LEAVES.push({ f: fl, at: 0.2 + lv * 0.14, a: lv * 2.4 + fl.v * 6.28, s: 1.6 - lv * 0.2 });   // (big leaves up its stem)
      }
    }
    var stemGeo = new THREE.CylinderGeometry(0.009, 0.013, 1, 6); stemGeo.translate(0, 0.5, 0);
    var thickGeo = new THREE.CylinderGeometry(0.018, 0.026, 1, 8); thickGeo.translate(0, 0.5, 0);
    // (a sunflower leaf: broad and heart-shaped, drooping from its stalk)
    var sl = new THREE.Shape(); sl.moveTo(0, 0); sl.bezierCurveTo(0.06, 0.07, 0.2, 0.08, 0.26, 0); sl.bezierCurveTo(0.2, -0.08, 0.06, -0.07, 0, 0);
    var sLeafGeo = new THREE.ShapeGeometry(sl, 8), slp = sLeafGeo.attributes.position;
    for (var v = 0; v < slp.count; v++) { var lx = slp.getX(v); slp.setZ(v, -lx * lx * 1.6); }
    sLeafGeo.rotateX(-Math.PI / 2); sLeafGeo.computeVertexNormals();
    // (a sunflower head: a domed brown disc of seeds, and two rings of long golden petals; it faces +z)
    var seedTex = cpTex(128, 128, function (g, w, h) {
      var gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, '#5a3818'); gr.addColorStop(0.7, '#3a220e'); gr.addColorStop(1, '#6a4a1a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var s = 0; s < 1100; s++) { var a = s * 2.39996, r = Math.sqrt(s) * 1.85, sz = 0.8 + r / 64 * 1.3; if (r > 62) break; g.fillStyle = r > 52 ? (s % 2 ? '#e8a020' : '#c88018') : s % 3 ? '#7a4e1c' : '#2a180a'; g.beginPath(); g.ellipse(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, sz, sz * 0.75, a, 0, Math.PI * 2); g.fill(); }   // (seeds in their golden spiral, and a ring of tiny florets round the edge)
    });
    // (the seed disc: a gently domed face covered in seeds in their golden spiral; and a rim behind it)
    var discGeo = new THREE.CircleGeometry(0.12, 48), dgp = discGeo.attributes.position;
    for (var dv = 0; dv < dgp.count; dv++) { var dr = Math.hypot(dgp.getX(dv), dgp.getY(dv)) / 0.12; dgp.setZ(dv, 0.026 * (1 - dr * dr)); }
    discGeo.computeVertexNormals();
    // (the petals: broad and pointed, folded down the middle and curling back at the tips, in two overlapping rings)
    function sunPetal(len, wid) {
      var g = new THREE.PlaneGeometry(1, 1, 4, 8), gp = g.attributes.position;
      for (var i = 0; i < gp.count; i++) {
        var u = gp.getX(i) + 0.5, t = gp.getY(i) + 0.5, w = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.7) * (1 - t * 0.35);
        var x = (u - 0.5) * wid * w, y = t * len;
        gp.setXYZ(i, x, y, Math.abs(x) * 0.35 - t * t * len * 0.28);
      }
      g.computeVertexNormals(); return g;
    }
    var sunPetals = [];
    for (var pr2 = 0; pr2 < 2; pr2++) for (var pj = 0; pj < 22; pj++) {
      var pg2 = sunPetal(0.13 + springHash(pj * 3.3 + pr2) * 0.025, 0.05); pg2.translate(0, 0.105, 0); pg2.rotateX(-0.18 - pr2 * 0.18);
      pg2.rotateZ((pj + pr2 * 0.5) / 22 * Math.PI * 2 + (springHash(pj * 7.1) - 0.5) * 0.08); pg2.translate(0, 0, -0.004 - pr2 * 0.01); sunPetals.push(pg2);
    }
    var rimGeo = new THREE.TorusGeometry(0.118, 0.012, 6, 40);
    var sunPetalGeo = mergeSimple(sunPetals);
    var bract = new THREE.Shape(); bract.moveTo(0, 0); bract.quadraticCurveTo(0.02, 0.04, 0, 0.075); bract.quadraticCurveTo(-0.02, 0.04, 0, 0);
    var bracts = []; for (var bi = 0; bi < 14; bi++) { var bg = new THREE.ShapeGeometry(bract, 3); bg.translate(0, 0.07, 0); bg.rotateX(-0.6); bg.rotateZ(bi / 14 * Math.PI * 2 + 0.11); bg.translate(0, 0, -0.03); bracts.push(bg); }
    var bractGeo = mergeSimple(bracts);
    // (a poppy: two outer and two inner petals, broad, cupped and crinkled like tissue, each with a dark blotch at its base
    // and fine veins; in the middle a green seed pod with its ridged crown, ringed by dark stamens. Some are still nodding buds)
    var poppyTex = cpTex(128, 128, function (g, w, h) {
      g.fillStyle = '#fff4f0'; g.fillRect(0, 0, w, h);
      for (var v = 0; v < 26; v++) { var a = -1.25 + v / 25 * 2.5; g.strokeStyle = 'rgba(150,40,40,0.16)'; g.lineWidth = 1; g.beginPath(); g.moveTo(w / 2, h); g.quadraticCurveTo(w / 2 + Math.sin(a) * w * 0.3, h * 0.55, w / 2 + Math.sin(a) * w * 0.62, 0); g.stroke(); }
      var bl = g.createRadialGradient(w / 2, h - 4, 2, w / 2, h - 4, 30); bl.addColorStop(0, 'rgba(20,10,16,1)'); bl.addColorStop(0.7, 'rgba(30,14,20,0.95)'); bl.addColorStop(1, 'rgba(30,14,20,0)');
      g.fillStyle = bl; g.beginPath(); g.ellipse(w / 2, h - 4, 26, 24, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; g.beginPath(); g.ellipse(w / 2, h - 4, 27, 25, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
    });
    function poppyPetal(len, wid, lean, seed) {
      var g = new THREE.PlaneGeometry(1, 1, 7, 7), gp = g.attributes.position;
      for (var i = 0; i < gp.count; i++) {
        var u = gp.getX(i) + 0.5, t = gp.getY(i) + 0.5, w = Math.pow(Math.sin(Math.PI * (0.12 + 0.86 * t)), 0.55), x = (u - 0.5) * wid * w;
        gp.setXYZ(i, x, t * len, -Math.pow(x / wid, 2) * wid * 0.9 + Math.sin(u * 13 + t * 7 + seed) * 0.0025 * t);   // (cupped inward, crinkled toward the edge)
      }
      g.rotateX(lean); g.computeVertexNormals(); return g;
    }
    var poppyParts = [];
    for (var pp = 0; pp < 4; pp++) { var ppg = pp % 2 ? poppyPetal(0.048, 0.07, 0.5, pp) : poppyPetal(0.056, 0.082, 0.82, pp); ppg.translate(0, 0.002 + (pp % 2) * 0.003, 0); ppg.rotateY(pp / 4 * Math.PI * 2 + (pp % 2) * 0.35); poppyParts.push(ppg); }
    var poppyGeo = mergeUV(poppyParts);
    var poppyPodGeo = new THREE.LatheGeometry([[0, 0], [0.008, 0.002], [0.012, 0.012], [0.011, 0.022], [0.014, 0.026], [0.008, 0.029], [0, 0.03]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 12);
    var stamParts = [];
    for (var sm = 0; sm < 28; sm++) { var sa = sm / 28 * Math.PI * 2, st = new THREE.CylinderGeometry(0.0008, 0.0008, 0.016, 3); st.translate(0, 0.008, 0); st.rotateZ(0.5 + (sm % 3) * 0.12); st.rotateY(sa); st.translate(Math.cos(sa) * 0.012, 0.006, -Math.sin(sa) * 0.012); stamParts.push(st);
      var an = new THREE.SphereGeometry(0.0022, 4, 3); an.translate(Math.cos(sa) * (0.012 + 0.008), 0.02, -Math.sin(sa) * (0.012 + 0.008)); stamParts.push(an); }
    for (var ray = 0; ray < 9; ray++) { var rb = new THREE.BoxGeometry(0.0022, 0.0015, 0.012); rb.translate(0, 0.0305, 0.006); rb.rotateY(ray / 9 * Math.PI * 2); stamParts.push(rb); }   // (the dark rays on the pod's crown)
    var poppyStamGeo = mergeSimple(stamParts);
    var poppyBudGeo = new THREE.SphereGeometry(0.018, 10, 8); poppyBudGeo.scale(0.85, 1.35, 0.85); poppyBudGeo.translate(0, -0.022, 0);
    // (an oxeye daisy: slim, notched white petals with fine grooves, drooping a little at the tips; a domed golden centre packed
    // with tiny florets; and a ring of green bracts underneath)
    var daisyTex = cpTex(64, 128, function (g, w, h) {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); var gr = g.createLinearGradient(0, h, 0, h * 0.7); gr.addColorStop(0, 'rgba(240,220,120,0.5)'); gr.addColorStop(1, 'rgba(240,220,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var v = 1; v < 5; v++) { g.strokeStyle = 'rgba(180,180,190,0.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(v / 5 * w, h); g.lineTo(v / 5 * w + (v - 2.5) * 2, 0); g.stroke(); }
    });
    function daisyPetal(len, wid) {
      var g = new THREE.PlaneGeometry(1, 1, 2, 6), gp = g.attributes.position;
      for (var i = 0; i < gp.count; i++) {
        var u = gp.getX(i) + 0.5, t = gp.getY(i) + 0.5, w = Math.pow(Math.sin(Math.PI * (0.18 + 0.8 * t)), 0.4);
        gp.setXYZ(i, (u - 0.5) * wid * w, t * len - (t > 0.99 && Math.abs(u - 0.5) < 0.1 ? 0.004 : 0), -t * t * 0.012);   // (a notch at the tip, and drooping)
      }
      g.rotateX(-Math.PI / 2); g.computeVertexNormals(); return g;
    }
    var daisyParts = []; for (var di = 0; di < 22; di++) { var dg = daisyPetal(0.05 + springHash(di * 2.7) * 0.008, 0.013); dg.translate(0, 0.002, -0.013); dg.rotateY(di / 22 * Math.PI * 2 + springHash(di) * 0.06); daisyParts.push(dg); }
    var daisyGeo = mergeUV(daisyParts);
    var floretTex = cpTex(128, 128, function (g, w, h) {
      g.fillStyle = '#e8a818'; g.fillRect(0, 0, w, h);
      for (var s = 0; s < 500; s++) { var a = s * 2.39996, r = Math.sqrt(s) * 2.8; if (r > 64) break; g.fillStyle = r < 14 ? '#c89a20' : s % 2 ? '#f6c830' : '#d89818'; g.beginPath(); g.arc(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 1.8, 0, Math.PI * 2); g.fill(); }
    });
    var daisyMidGeo = new THREE.CircleGeometry(0.016, 24), dmp = daisyMidGeo.attributes.position;
    for (var dm = 0; dm < dmp.count; dm++) { var drr = Math.hypot(dmp.getX(dm), dmp.getY(dm)) / 0.016; dmp.setZ(dm, 0.008 * (1 - drr * drr)); }
    daisyMidGeo.rotateX(-Math.PI / 2); daisyMidGeo.translate(0, 0.002, 0); daisyMidGeo.computeVertexNormals();
    var dBr = new THREE.Shape(); dBr.moveTo(-0.004, 0); dBr.lineTo(0.004, 0); dBr.lineTo(0, 0.016); dBr.closePath();
    var dBracts = []; for (var db = 0; db < 12; db++) { var dbg = new THREE.ShapeGeometry(dBr, 1); dbg.rotateX(-Math.PI / 2 - 0.6); dbg.rotateY(db / 12 * Math.PI * 2); dbg.translate(0, -0.003, 0); dBracts.push(dbg); }
    var daisyBractGeo = mergeSimple(dBracts);
    // (a lavender spike: whorls of tiny florets up the top of its stem, deeper purple below and paler at the tip; and narrow
    // silvery leaves at the foot of the bush)
    function lavWhorls(from, to) {
      var parts = [];
      for (var lw = from; lw < to; lw++) for (var fl = 0; fl < 6; fl++) {
        var fa = fl / 6 * Math.PI * 2 + lw * 0.6, fr = 0.0078 * (1 - lw * 0.05), lg = new THREE.SphereGeometry(fr, 5, 3); lg.scale(0.8, 1.3, 0.8); lg.rotateZ(0.5); lg.rotateY(fa);
        lg.translate(Math.cos(fa) * 0.006 * (1 - lw * 0.05), lw * 0.016 + (lw % 2) * 0.004, -Math.sin(fa) * 0.006 * (1 - lw * 0.05)); parts.push(lg);
      }
      return mergeSimple(parts);
    }
    var lavGeo = lavWhorls(0, 6), lavTopGeo = lavWhorls(6, 9);
    var lavStemGeo = new THREE.CylinderGeometry(0.0035, 0.005, 1, 5); lavStemGeo.translate(0, 0.5, 0);
    var lavLeafGeo = new THREE.PlaneGeometry(0.008, 0.14, 1, 4), llp = lavLeafGeo.attributes.position;
    for (var ll = 0; ll < llp.count; ll++) { var lt2 = (llp.getY(ll) + 0.07) / 0.14; llp.setXYZ(ll, llp.getX(ll) * (1 - lt2 * 0.6), lt2 * 0.14, lt2 * lt2 * 0.03); }
    lavLeafGeo.computeVertexNormals();
    var mStem = new THREE.MeshStandardMaterial({ color: 0x5a9a44, roughness: 0.75, side: THREE.DoubleSide }), mSunLeaf = new THREE.MeshStandardMaterial({ color: 0x4a8a38, roughness: 0.7, side: THREE.DoubleSide });
    var mHead = new THREE.MeshStandardMaterial({ roughness: 0.5, side: THREE.DoubleSide }), mDisc = new THREE.MeshStandardMaterial({ map: seedTex, roughness: 0.9 });
    var mPoppy = new THREE.MeshStandardMaterial({ map: poppyTex, roughness: 0.55, side: THREE.DoubleSide }), mDaisy = new THREE.MeshStandardMaterial({ map: daisyTex, roughness: 0.6, side: THREE.DoubleSide });
    var mFloret = new THREE.MeshStandardMaterial({ map: floretTex, roughness: 0.8 }), mLavLeaf = new THREE.MeshStandardMaterial({ color: 0x8aa684, roughness: 0.8, side: THREE.DoubleSide });
    function only(k) { return SUMMER_FLOWERS.filter(function (f) { return f.kind === k; }); }
    var suns = only('sun'), poppies = only('poppy'), poppyOpen = poppies.filter(function (f) { return f.v <= 0.8; }), poppyBuds = poppies.filter(function (f) { return f.v > 0.8; }), daisies = only('daisy'), lav = only('lav'), thin = SUMMER_FLOWERS.filter(function (f) { return f.kind !== 'sun' && f.kind !== 'lav'; });
    summerFlowerMesh = [
      { geo: thickGeo, m: mStem, list: suns, part: 'stem' }, { geo: stemGeo, m: mStem, list: thin, part: 'stem' },
      { geo: sLeafGeo, m: mSunLeaf, list: SUMMER_LEAVES, part: 'sunleaf' },
      { geo: discGeo, m: mDisc, list: suns, part: 'disc' }, { geo: rimGeo, m: mHead, list: suns, part: 'rim', col: function () { return 0x6a4a1c; } }, { geo: bractGeo, m: mSunLeaf, list: suns, part: 'bracts' }, { geo: sunPetalGeo, m: mHead, list: suns, part: 'sunpetals', col: function (f) { return f.v < 0.7 ? 0xf6c428 : 0xf0a020; } },
      { geo: poppyGeo, m: mPoppy, list: poppyOpen, part: 'poppy', col: function (f) { return f.v < 0.55 ? 0xe8281c : f.v < 0.7 ? 0xf0402a : 0xf26a3a; } },
      { geo: poppyPodGeo, m: mHead, list: poppyOpen, part: 'poppypod', col: function () { return 0x8aa86a; } }, { geo: poppyStamGeo, m: mHead, list: poppyOpen, part: 'poppystam', col: function () { return 0x2a1e26; } },
      { geo: poppyBudGeo, m: mStem, list: poppyBuds, part: 'poppybud' },
      { geo: daisyGeo, m: mDaisy, list: daisies, part: 'daisy' }, { geo: daisyMidGeo, m: mFloret, list: daisies, part: 'daisymid' }, { geo: daisyBractGeo, m: mSunLeaf, list: daisies, part: 'daisybract' },
      { geo: lavGeo, m: mHead, list: lav, part: 'lav', col: function (f) { return f.v < 0.5 ? 0x6e4cb8 : f.v < 0.85 ? 0x7a58c4 : 0x6444a8; } },
      { geo: lavTopGeo, m: mHead, list: lav, part: 'lavtop', col: function (f) { return f.v < 0.5 ? 0xa48ae6 : 0xb49cf0; } },
      { geo: lavLeafGeo, m: mLavLeaf, list: lav, part: 'lavleaf' }, { geo: lavStemGeo, m: mLavLeaf, list: lav, part: 'stem' }
    ].map(function (F) {
      F.im = new THREE.InstancedMesh(F.geo, F.m, Math.max(1, F.list.length)); F.im.castShadow = true; F.im.frustumCulled = false; scene.add(F.im);
      if (F.col) { var col = new THREE.Color(); F.list.forEach(function (f, i) { F.im.setColorAt(i, col.set(F.col(f))); }); }
      return F;
    });
  })();
  var sfM = new THREE.Matrix4(), sfQ = new THREE.Quaternion(), sfE = new THREE.Euler(), sfV = new THREE.Vector3(), sfS = new THREE.Vector3(), sfB = new THREE.Vector3();
  function summerFlowersPlace(show) {
    var key = SUMMER_FLOWERS.map(function (f) { return show && springFlowerOK(f) ? 1 : 0; }).join('');
    if (key === summerFlowerShown) return; summerFlowerShown = key;
    summerFlowerMesh.forEach(function (F) {
      F.list.forEach(function (rec, i) {
        var f = rec.f || rec, k = key[SUMMER_FLOWERS.indexOf(f)] === '1' ? 1 : 0;
        if (f.kind === 'lav') sfE.set(f.tilt, f.rot, 0, 'YXZ'); else sfE.set(f.tilt, f.rot, f.tilt * 0.6);   // (each stem leans its own way; lavender fans out)
        sfQ.setFromEuler(sfE); sfB.set(f.x, f.y, f.z);
        if (F.part === 'stem') { sfV.copy(sfB); sfS.set(k, f.h * k, k); }
        else if (F.part === 'sunleaf') { sfV.set(0, f.h * rec.at, 0).applyQuaternion(sfQ).add(sfB); sfE.set(0, rec.a, -0.35); sfQ.setFromEuler(sfE); sfS.setScalar(k * rec.s); }
        else {
          sfV.set(0, f.h, 0).applyQuaternion(sfQ).add(sfB);
          if (F.part === 'disc' || F.part === 'sunpetals' || F.part === 'bracts' || F.part === 'rim') { sfE.set(0.12, f.rot, 0); sfQ.setFromEuler(sfE); sfS.setScalar(k * (0.9 + f.v * 0.3)); }   // (sunflowers turn their faces toward the sun)
          else if (F.part === 'lav' || F.part === 'lavtop') { sfV.set(0, f.h - 0.13, 0).applyQuaternion(sfQ).add(sfB); sfS.setScalar(k * 1.15); }
          else if (F.part === 'lavleaf') { sfV.copy(sfB); sfE.set(0.75 + f.v * 0.5, f.rot + 0.4, 0, 'YXZ'); sfQ.setFromEuler(sfE); sfS.setScalar(k * (0.8 + f.v * 0.4)); }   // (narrow leaves splaying out at its foot)
          else if (F.part === 'poppybud') { sfE.set(f.tilt + 0.95, f.rot, 0); sfQ.setFromEuler(sfE); sfS.setScalar(k * 1.5); }   // (a bud nodding on its hooked stem)
          else sfS.setScalar(k * (F.part.indexOf('poppy') === 0 ? 1.5 : 1.6));
        }
        sfM.compose(sfV, sfQ, sfS); F.im.setMatrixAt(i, sfM);
      });
      F.im.instanceMatrix.needsUpdate = true; if (F.im.instanceColor) F.im.instanceColor.needsUpdate = true;
    });
  }
  // ===== fireflies on summer evenings =====
  var summerFireflies = (function () {
    var N = 140, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), seeds = [];
    for (var i = 0; i < N; i++) seeds.push({ x: (springHash(i * 4.3 + 9) - 0.5) * 30, z: (springHash(i * 6.1 + 3) - 0.5) * 30, h: 0.3 + springHash(i * 2.9) * 1.4, w: springHash(i * 8.8) * 6.28, b: 0.6 + springHash(i * 1.1) * 0.9 });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var pts = new THREE.Points(g, new THREE.PointsMaterial({ map: dawnGlowTex, size: 0.34, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    var halo = new THREE.Points(g, new THREE.PointsMaterial({ map: dawnGlowTex, size: 1.1, vertexColors: true, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));   // (and a soft glow round each one)
    halo.frustumCulled = false; pts.add(halo);
    pts.frustumCulled = false; pts.visible = false; pts.userData.seeds = seeds; scene.add(pts); return pts;
  })();
  function summerFirefliesMove(night) {
    var a = summerFireflies.geometry.attributes.position, c = summerFireflies.geometry.attributes.color, S = summerFireflies.userData.seeds, cx = cam.target.x, cz = cam.target.z, t = state.time;
    S.forEach(function (s, i) {
      var x = cx + (((s.x + Math.sin(t * 0.13 + s.w) * 2) % 30) + 45) % 30 - 15, z = cz + (((s.z + Math.cos(t * 0.11 + s.w) * 2) % 30) + 45) % 30 - 15;
      var y = Math.max(groundHeight(x, z), WATER_Y) + s.h + Math.sin(t * 0.9 + s.w) * 0.25;
      a.setXYZ(i, x, y, z);
      var glow = Math.max(0, Math.sin(t * s.b + s.w * 3)) * night; glow = glow * glow;   // (each one blinks slowly on and off)
      c.setXYZ(i, Math.min(1, glow * 1.2), Math.min(1, glow * 1.4), glow * 0.45);
    });
    a.needsUpdate = c.needsUpdate = true;
  }
  // ===== long, bright summer days: a deep blue sky, warm golden sunshine, and lusher grass =====
  var SUMMER_SKY = new THREE.Color(0x3f9ef0), SUMMER_SUN = new THREE.Color(0xffd890), SUMMER_GRASS = new THREE.Color(0.78, 0.94, 0.66), SUMMER_GROUND = new THREE.Color(0.88, 0.98, 0.8), summerPlain = new THREE.Color(1, 1, 1);
  var summerBaseSky = updateSky;
  updateSky = function () {
    var night = summerBaseSky.apply(this, arguments);
    if (summerNow()) {
      var day = Math.max(0, 1 - night * 1.6);                           // (strongest at midday, fading out toward dusk)
      scene.background.lerp(SUMMER_SKY, 0.55 * day); scene.fog.color.copy(scene.background);
      sun.color.lerp(SUMMER_SUN, 0.45 * day); sun.intensity *= 1 + 0.3 * day; hemi.intensity *= 1 + 0.12 * day;
    }
    return night;
  };
  // ===== dragonflies darting over the pond =====
  var summerDragonflies = (function () {
    var list = [], mBody = [0x2a8ad0, 0x30b0a0, 0xd04a30, 0x7a50c0].map(function (c) { return new THREE.MeshStandardMaterial({ color: c, metalness: 0.5, roughness: 0.3 }); });
    var mWing = new THREE.MeshStandardMaterial({ color: 0xdff2ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, roughness: 0.1, metalness: 0.3, depthWrite: false });
    for (var i = 0; i < 6; i++) {
      var G = new THREE.Group();
      var tail = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.004, 0.16, 6), mBody[i % 4]); tail.rotation.x = Math.PI / 2; tail.position.z = -0.08; G.add(tail);
      var thorax = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), mBody[i % 4]); thorax.scale.set(1, 1, 1.5); G.add(thorax);
      [-1, 1].forEach(function (s) { var eye = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), mBody[i % 4]); eye.position.set(s * 0.011, 0.004, 0.028); G.add(eye); });
      var wings = [];
      [0.006, -0.02].forEach(function (z, r) { [-1, 1].forEach(function (s) { var w = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.026), mWing); w.position.set(s * 0.068, 0.006, z); w.rotation.x = -Math.PI / 2; G.add(w); wings.push({ m: w, s: s, r: r }); }); });
      G.scale.setScalar(2.6); G.visible = false; scene.add(G);
      list.push({ g: G, wings: wings, ph: springHash(i * 5.3 + 2) * 6.28, sp: 0.6 + springHash(i * 2.7) * 0.6, dart: 0 });
    }
    return list;
  })();
  function summerDragonfliesMove(on) {
    var t = state.time;
    summerDragonflies.forEach(function (D, i) {
      if (D.g.visible !== on) D.g.visible = on;
      if (!on) return;
      var a = t * 0.35 * D.sp + D.ph, r = LAKE_R * (0.35 + 0.35 * Math.sin(a * 0.7 + i));   // (zipping about over the water, hovering, then darting off again)
      var hover = Math.sin(t * 0.8 + D.ph) > 0.3 ? 0.15 : 1, x = LAKE_X + Math.cos(a * hover) * r, z = LAKE_Z + Math.sin(a * 1.3 * hover) * r * 0.8, y = WATER_Y + 0.35 + Math.sin(t * 1.7 + i) * 0.15;
      var dx = x - D.g.position.x, dz = z - D.g.position.z;
      D.g.position.set(x, y, z); if (Math.abs(dx) + Math.abs(dz) > 1e-4) D.g.rotation.y = Math.atan2(dx, dz);
      D.wings.forEach(function (w) { w.m.rotation.y = w.s * Math.sin(t * 60 + w.r * 1.5 + D.ph) * 0.35; });   // (wings a blur)
    });
  }
  // ===== big fluffy summer clouds, drifting slowly across the blue =====
  var summerClouds = (function () {
    function cloudTex(seed) {                                          // (heaped, sunlit puffs, bright on top and soft grey-blue underneath)
      var c = document.createElement('canvas'); c.width = 512; c.height = 256; var g = c.getContext('2d');
      var puffs = [];
      for (var i = 0; i < 26; i++) { var u = springHash(seed * 13 + i * 1.7), v = springHash(seed * 7 + i * 2.9); puffs.push([90 + u * 330, 150 - Math.sin(u * Math.PI) * (40 + v * 60) + v * 20, 34 + springHash(seed + i * 3.1) * 46]); }
      puffs.sort(function (a, b) { return b[1] - a[1]; });
      puffs.forEach(function (p) {
        var gr = g.createRadialGradient(p[0] - p[2] * 0.25, p[1] - p[2] * 0.35, p[2] * 0.1, p[0], p[1], p[2]);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.55, 'rgba(250,252,255,0.95)'); gr.addColorStop(0.85, 'rgba(214,226,242,0.75)'); gr.addColorStop(1, 'rgba(200,214,236,0)');
        g.fillStyle = gr; g.beginPath(); g.arc(p[0], p[1], p[2], 0, Math.PI * 2); g.fill();
      });
      var base = g.createLinearGradient(0, 150, 0, 210); base.addColorStop(0, 'rgba(190,206,230,0)'); base.addColorStop(1, 'rgba(255,255,255,0)');
      var t = new THREE.CanvasTexture(c); return t;
    }
    var list = [];
    for (var i = 0; i < 9; i++) {
      var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudTex(i + 1), fog: false, depthWrite: false, transparent: true, opacity: 0.95 }));
      var w = 34 + springHash(i * 2.3) * 30; s.scale.set(w, w * 0.5, 1); s.renderOrder = -1; s.visible = false; scene.add(s);
      list.push({ s: s, a: i / 9 * Math.PI * 2 + springHash(i) * 0.5, r: 90 + springHash(i * 5.1) * 60, y: 32 + springHash(i * 3.3) * 22 });
    }
    return list;
  })();
  function summerCloudsMove(on) {
    var t = state.time, cx = camera.position.x, cz = camera.position.z;
    summerClouds.forEach(function (C) {
      if (C.s.visible !== on) C.s.visible = on;
      if (!on) return;
      var a = C.a + t * 0.004; C.s.position.set(cx + Math.cos(a) * C.r, C.y, cz + Math.sin(a) * C.r);
    });
  }
  // ===== bees busy over the sunflowers and the lavender =====
  var summerBees = (function () {                                      // (honeybees and fat, furry bumblebees, each with its fuzzy thorax, banded abdomen, big
    //                                                                     dark eyes, elbowed antennae, six legs with pollen on the back pair, and four veined wings)
    function bandTex(cols, bands) {                                    // (stripes running round the abdomen, softened with fine hairs)
      return cpTex(64, 128, function (g, w, h) {
        bands.forEach(function (b, i) { g.fillStyle = cols[b]; g.fillRect(0, i / bands.length * h, w, h / bands.length + 1); });
        for (var k = 0; k < 900; k++) { var x = springHash(k * 1.3) * w, y = springHash(k * 2.7) * h; g.strokeStyle = 'rgba(' + (springHash(k) < 0.5 ? '255,240,200' : '30,20,10') + ',0.25)'; g.lineWidth = 0.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 1.5, y + 3); g.stroke(); }
      });
    }
    function furTex(base, tip) {                                       // (a dense coat of hair, for the thorax)
      return cpTex(64, 64, function (g, w, h) { g.fillStyle = base; g.fillRect(0, 0, w, h); for (var k = 0; k < 700; k++) { var x = springHash(k * 3.1 + 1) * w, y = springHash(k * 1.9 + 2) * h; g.strokeStyle = springHash(k * 7) < 0.6 ? tip : 'rgba(40,25,10,0.5)'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (springHash(k) - 0.5) * 3, y + 2.5); g.stroke(); } });
    }
    var hairTex = cpTex(64, 64, function (g, w, h) { g.clearRect(0, 0, w, h); for (var k = 0; k < 500; k++) { var x = springHash(k * 5.3) * w, y = springHash(k * 6.1) * h; g.strokeStyle = 'rgba(255,236,190,0.55)'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (springHash(k * 2) - 0.5) * 2, y + 3); g.stroke(); } });
    var wingTex = cpTex(128, 64, function (g, w, h) {                  // (clear wing with dark veins and a faint rainbow sheen)
      g.clearRect(0, 0, w, h); var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, 'rgba(220,240,255,0.55)'); gr.addColorStop(0.5, 'rgba(240,220,255,0.4)'); gr.addColorStop(1, 'rgba(220,255,236,0.5)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(60,45,30,0.85)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(0, 18); g.lineTo(w * 0.95, 14); g.moveTo(4, 40); g.quadraticCurveTo(w * 0.4, 30, w * 0.7, 22); g.moveTo(w * 0.3, 18); g.lineTo(w * 0.36, 42); g.moveTo(w * 0.52, 16); g.lineTo(w * 0.6, 36); g.lineTo(w * 0.8, 34); g.lineTo(w * 0.72, 17); g.stroke();
    });
    var KINDS = [
      { name: 'honey', band: bandTex(['#e8a830', '#3a2412', '#c88a20'], [0, 1, 2, 1, 0, 1, 2, 1, 1]), fur: furTex('#b88a40', 'rgba(255,220,150,0.7)'), size: 1, fat: 1 },
      { name: 'bumble', band: bandTex(['#f2c838', '#1e1612', '#fbf6ea'], [1, 0, 0, 1, 1, 1, 2, 2, 2]), fur: furTex('#e8c040', 'rgba(255,240,170,0.8)'), size: 1.25, fat: 1.25, thoraxBand: true }
    ];
    var mDark = new THREE.MeshStandardMaterial({ color: 0x1e1612, roughness: 0.55 }), mEye = new THREE.MeshStandardMaterial({ color: 0x120e10, roughness: 0.15, metalness: 0.3 });
    var mLeg = new THREE.MeshStandardMaterial({ color: 0x2a1e14, roughness: 0.7 }), mPollen = new THREE.MeshStandardMaterial({ color: 0xf0a020, roughness: 0.9 });
    var mWing = new THREE.MeshStandardMaterial({ map: wingTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.15, metalness: 0.2 });
    var mHair = new THREE.MeshStandardMaterial({ map: hairTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 1 });
    var abdGeo = new THREE.LatheGeometry([[0.0, -0.034], [0.006, -0.032], [0.013, -0.024], [0.016, -0.012], [0.016, 0.0], [0.013, 0.008], [0.008, 0.012], [0, 0.013]].map(function (q) { return new THREE.Vector2(q[0], q[1]); }), 14);
    abdGeo.rotateX(Math.PI / 2);                                       // (the abdomen lies along the body, its tip at the back)
    var foreWing = (function () { var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(0.012, 0.008, 0.035, 0.01, 0.045, 0.002); sh.bezierCurveTo(0.04, -0.008, 0.015, -0.008, 0, 0); var g = new THREE.ShapeGeometry(sh, 8), uv = g.attributes.uv, p = g.attributes.position; for (var i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 0.045, (p.getY(i) + 0.01) / 0.02); g.rotateX(-Math.PI / 2); return g; })();
    var hindWing = foreWing.clone(); hindWing.scale(0.68, 1, 0.7);
    var list = [];
    for (var i = 0; i < 10; i++) {
      var K = KINDS[i % 3 === 2 ? 1 : 0], G = new THREE.Group();
      var mBand = new THREE.MeshStandardMaterial({ map: K.band, roughness: 0.75 }), mFur = new THREE.MeshStandardMaterial({ map: K.fur, roughness: 1 });
      var abd = new THREE.Mesh(abdGeo, mBand); abd.position.z = -0.012; abd.scale.set(K.fat, K.fat, 1); G.add(abd);
      var abdHair = new THREE.Mesh(abdGeo, mHair); abdHair.position.z = -0.012; abdHair.scale.set(K.fat * 1.12, K.fat * 1.12, 1.06); G.add(abdHair);
      var sting = new THREE.Mesh(new THREE.ConeGeometry(0.0018, 0.006, 4), mDark); sting.rotation.x = -Math.PI / 2; sting.position.z = -0.048; G.add(sting);
      var thorax = new THREE.Mesh(new THREE.SphereGeometry(0.012 * K.fat, 12, 10), mFur); thorax.position.z = 0.012; G.add(thorax);
      var thHair = new THREE.Mesh(new THREE.SphereGeometry(0.014 * K.fat, 12, 10), mHair); thHair.position.z = 0.012; G.add(thHair);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.0085, 10, 8), mDark); head.scale.set(1.15, 1, 0.85); head.position.set(0, -0.001, 0.027); G.add(head);
      [-1, 1].forEach(function (s) {
        var eye = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 8, 6), mEye); eye.scale.set(0.7, 1.3, 0.9); eye.position.set(s * 0.0072, 0.001, 0.028); G.add(eye);   // (big glossy compound eyes)
        var a1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0007, 0.0007, 0.01, 4), mDark); a1.position.set(s * 0.003, 0.007, 0.032); a1.rotation.set(0.5, 0, -s * 0.3); G.add(a1);   // (antennae, bent at the elbow)
        var a2 = new THREE.Mesh(new THREE.CylinderGeometry(0.0007, 0.0006, 0.011, 4), mDark); a2.position.set(s * 0.006, 0.0105, 0.039); a2.rotation.set(1.3, 0, -s * 0.2); G.add(a2);
        var mand = new THREE.Mesh(new THREE.BoxGeometry(0.0018, 0.0012, 0.004), mDark); mand.position.set(s * 0.002, -0.007, 0.033); mand.rotation.y = s * 0.4; G.add(mand);
        for (var l = 0; l < 3; l++) {                                    // (six legs, folded under, the back pair carrying pollen)
          var leg = new THREE.Group(); leg.position.set(s * 0.008, -0.008, 0.02 - l * 0.009); leg.rotation.set(0.35 * (l - 1), 0, s * 0.9); G.add(leg);
          var up = new THREE.Mesh(new THREE.CylinderGeometry(0.0009, 0.0008, 0.012, 4), mLeg); up.position.y = -0.006; leg.add(up);
          var low = new THREE.Mesh(new THREE.CylinderGeometry(0.0008, 0.0006, 0.013, 4), mLeg); low.position.set(0, -0.012, 0.004); low.rotation.x = -0.9; leg.add(low);
          if (l === 2) { var pol = new THREE.Mesh(new THREE.SphereGeometry(0.0032, 8, 6), mPollen); pol.position.set(0, -0.011, 0.002); leg.add(pol); }
        }
      });
      var wings = [-1, 1].map(function (s) {                          // (each side: a hinge on the thorax, with the fore and hind wing on it)
        var hinge = new THREE.Group(); hinge.position.set(s * 0.006, 0.011 * K.fat, 0.014); hinge.scale.x = s; G.add(hinge);
        var fw = new THREE.Mesh(foreWing, mWing); fw.rotation.y = -0.35; hinge.add(fw);
        var hw = new THREE.Mesh(hindWing, mWing); hw.position.z = -0.006; hw.rotation.y = -0.6; hinge.add(hw);
        return hinge;
      });
      G.scale.setScalar(1.45 * K.size); G.visible = false; scene.add(G);
      list.push({ g: G, wings: wings, ph: springHash(i * 3.7 + 9) * 6.28, sp: 0.8 + springHash(i * 1.3) * 0.5, f: null });
    }
    return list;
  })();
  function summerBeesMove(on) {
    var t = state.time, px = player.position.x, pz = player.position.z;
    summerBees.forEach(function (B, i) {
      if (B.g.visible !== on) B.g.visible = on;
      if (!on) { B.f = null; return; }
      if (!B.f || dist(B.f.x, B.f.z, px, pz) > 22 || Math.sin(t * 0.07 + B.ph) > 0.97) {   // (to a flower near you, and off to another now and then)
        var near = SUMMER_FLOWERS.filter(function (f) { return (f.kind === 'sun' || f.kind === 'lav') && dist(f.x, f.z, px, pz) < 16; });
        if (!near.length) { B.g.visible = false; return; }
        B.f = near[Math.floor(springHash(i * 5.9 + Math.floor(t / 9)) * near.length) % near.length];
      }
      var f = B.f, a = t * 2.2 * B.sp + B.ph, top = f.y + f.h + (f.kind === 'sun' ? 0.05 : -0.05), landed = Math.sin(t * 0.45 * B.sp + B.ph) > 0.45;
      if (landed) {                                                    // (settled on the flower a moment: on a sunflower's face, or the top of a lavender spike)
        var fx = f.kind === 'sun' ? Math.sin(f.rot) * 0.05 : 0, fz = f.kind === 'sun' ? Math.cos(f.rot) * 0.05 : 0;
        B.g.position.set(f.x + fx + Math.sin(i * 2.1) * 0.04, f.y + f.h + (f.kind === 'sun' ? 0.02 + Math.cos(i * 1.7) * 0.04 : 0.03), f.z + fz);
        B.g.rotation.set(f.kind === 'sun' ? -0.9 : 0, f.kind === 'sun' ? f.rot + Math.PI : B.ph, 0);
        B.wings.forEach(function (w, k) { w.rotation.z = (k ? -1 : 1) * (0.08 + Math.max(0, Math.sin(t * 9 + B.ph)) * 0.15); });   // (wings folded, with a flick now and then)
        return;
      }
      var x = f.x + Math.sin(a) * 0.28 + Math.sin(a * 3.1) * 0.06, z = f.z + Math.cos(a * 0.8) * 0.28, y = top + 0.12 + Math.sin(a * 2.3) * 0.1;
      B.g.position.set(x, y, z); B.g.rotation.set(Math.sin(a * 2.3) * 0.15, a + Math.PI / 2, 0);
      B.wings.forEach(function (w, k) { w.rotation.z = (k ? -1 : 1) * (0.25 + Math.sin(t * 70 + B.ph) * 0.55); });   // (a blur of beating wings)
    });
  }
  // ===== dandelion clocks in the grass, and more water lilies opening on the pond =====
  var summerClocks = (function () {                                    // (dandelions: fluffy seed clocks and golden flowers, each with a rosette of toothed leaves)
    var pts = [];
    for (var c = 0, tries = 0; c < 50 && tries < 3000; tries++) {
      var x = -ISLAND + 3 + springHash(tries * 2.9 + 501) * (ISLAND * 2 - 6), z = -ISLAND + 3 + springHash(tries * 3.7 + 211) * (ISLAND * 2 - 6);
      if (!springFlowerSpot(x, z, 0.6)) continue; c++;
      for (var k = 0; k < 4; k++) {
        var xx = x + (springHash(c * 5 + k) - 0.5) * 0.8, zz = z + (springHash(c * 7 + k) - 0.5) * 0.8;
        if (springFlowerSpot(xx, zz, 0.3)) pts.push({ x: xx, z: zz, y: groundHeight(xx, zz), h: 0.24 + springHash(c + k * 3) * 0.14, tilt: (springHash(c * 2 + k) - 0.5) * 0.3, rot: springHash(c * 3 + k) * 6.28, clock: springHash(c * 9 + k * 2) < 0.6 });
      }
    }
    // (the clock: a soft, see-through ball of fine white seed fluff, with a paler core)
    var fluffTex = cpTex(512, 256, function (g, w, h) {
      g.clearRect(0, 0, w, h);
      for (var i = 0; i < 900; i++) {
        var x = springHash(i * 1.7 + 3) * w, y = 8 + springHash(i * 2.3 + 5) * (h - 16), r = 6 + springHash(i * 3.1) * 5;
        g.strokeStyle = 'rgba(255,255,255,' + (0.75 + springHash(i) * 0.25) + ')'; g.lineWidth = 1.5;
        for (var ray = 0; ray < 9; ray++) { var a = ray / 9 * Math.PI * 2 + i; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); g.stroke(); }   // (each seed's little parachute, seen end on)
        g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(x, y, 0.9, 0, Math.PI * 2); g.fill();
      }
    });
    var outer = new THREE.SphereGeometry(0.05, 20, 14), inner = new THREE.SphereGeometry(0.04, 16, 12), knob = new THREE.SphereGeometry(0.006, 8, 6);
    // (the flower: a shaggy golden pompom of strap-shaped florets in three rings, with green bracts curling back underneath)
    var fl = new THREE.Shape(); fl.moveTo(-0.003, 0); fl.lineTo(0.003, 0); fl.lineTo(0.004, 0.026); fl.lineTo(0.0015, 0.029); fl.lineTo(0, 0.027); fl.lineTo(-0.0015, 0.029); fl.lineTo(-0.004, 0.026); fl.closePath();
    var flParts = [];
    [[30, 0.12, 1], [26, 0.55, 0.92], [20, 0.98, 0.78], [12, 1.4, 0.56]].forEach(function (ring, ri) { for (var i = 0; i < ring[0]; i++) { var g = new THREE.ShapeGeometry(fl, 2); g.scale(ring[2], ring[2], 1); g.rotateX(-Math.PI / 2 + ring[1]); g.rotateY(i / ring[0] * Math.PI * 2 + ri * 0.4); g.translate(0, ri * 0.004, 0); flParts.push(g); } });
    var flowerGeo = mergeSimple(flParts);
    var bracts = []; for (var bi = 0; bi < 10; bi++) { var bg = new THREE.ShapeGeometry(fl, 2); bg.scale(0.9, 0.8, 1); bg.rotateX(Math.PI / 2 + 0.5); bg.rotateY(bi / 10 * Math.PI * 2); bracts.push(bg); }
    var bractGeo = mergeSimple(bracts);
    // (a rosette leaf: long, with deep backward-pointing teeth, rising from the ground at a slant)
    var lf = new THREE.Shape(); lf.moveTo(0, -0.008);
    [[0.012, 0.03], [0.006, 0.04], [0.02, 0.075], [0.009, 0.085], [0.024, 0.12], [0.01, 0.13], [0.018, 0.16], [0, 0.19]].forEach(function (q) { lf.lineTo(q[0], q[1]); });
    [[-0.018, 0.16], [-0.01, 0.13], [-0.024, 0.12], [-0.009, 0.085], [-0.02, 0.075], [-0.006, 0.04], [-0.012, 0.03], [0, -0.008]].forEach(function (q) { lf.lineTo(q[0], q[1]); });
    var leafGeo = new THREE.ShapeGeometry(lf, 1); leafGeo.rotateX(-Math.PI / 2 + 0.45);
    var stem = new THREE.CylinderGeometry(0.0035, 0.005, 1, 5); stem.translate(0, 0.5, 0);
    var mStem = new THREE.MeshStandardMaterial({ color: 0x7aa85a, roughness: 0.8 }), mLeaf = new THREE.MeshStandardMaterial({ color: 0x4e8a3a, roughness: 0.75, side: THREE.DoubleSide });
    var mFluff = new THREE.MeshStandardMaterial({ map: fluffTex, transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.8, emissive: 0x9a9a96, emissiveMap: fluffTex });
    var mCore = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x6a6a66, transparent: true, opacity: 0.62, depthWrite: false, roughness: 0.9 });
    var mKnob = new THREE.MeshStandardMaterial({ color: 0x8a7050, roughness: 0.9 }), mGold = new THREE.MeshStandardMaterial({ color: 0xf6c020, roughness: 0.6, side: THREE.DoubleSide });
    var clocks = pts.filter(function (p) { return p.clock; }), blooms = pts.filter(function (p) { return !p.clock; });
    var parts = [
      { geo: stem, m: mStem, list: pts, at: 'stem' }, { geo: leafGeo, m: mLeaf, list: pts, at: 'leaves' },
      { geo: knob, m: mKnob, list: clocks, at: 'head' }, { geo: inner, m: mCore, list: clocks, at: 'head' }, { geo: outer, m: mFluff, list: clocks, at: 'head' },
      { geo: flowerGeo, m: mGold, list: blooms, at: 'head', big: 1.35 }, { geo: bractGeo, m: mLeaf, list: blooms, at: 'head' }
    ];
    var ims = [], m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
    parts.forEach(function (P) {
      var n = P.at === 'leaves' ? P.list.length * 5 : P.list.length, im = new THREE.InstancedMesh(P.geo, P.m, Math.max(1, n)), k = 0;
      P.list.forEach(function (p) {
        e.set(p.tilt, p.rot, 0); q.setFromEuler(e);
        if (P.at === 'stem') { v.set(p.x, p.y, p.z); m.compose(v, q, s.set(1, p.h, 1)); im.setMatrixAt(k++, m); }
        else if (P.at === 'leaves') for (var l = 0; l < 5; l++) { e.set(0, p.rot + l * 1.26 + springHash(l + p.x) * 0.3, 0); q.setFromEuler(e); v.set(p.x, p.y + 0.01, p.z); var ls = 0.85 + springHash(l * 3 + p.z) * 0.4; m.compose(v, q, s.set(ls, ls, ls)); im.setMatrixAt(k++, m); }
        else { var hs = 1.3 * (P.big || 1); v.set(0, p.h, 0).applyQuaternion(q).add(s.set(p.x, p.y, p.z)); m.compose(v, q, s.set(hs, hs, hs)); im.setMatrixAt(k++, m); }
      });
      im.castShadow = P.m !== mFluff && P.m !== mCore; im.frustumCulled = false; im.visible = false; scene.add(im); ims.push(im);
    });
    return { ims: ims, pts: pts };
  })();
  var summerLilies = (function () {                                    // (lilies opening on pads that had none)
    var out = [];
    lilyPads.forEach(function (pad, i) {
      if (springHash(i * 3.3 + 70) > 0.45) return;
      if (lilyFlowers.some(function (f) { return dist(f.position.x, f.position.z, pad.position.x, pad.position.z) < 0.5; })) return;
      var f = waterLily(pad.position.x + 0.05, pad.position.z - 0.04, springHash(i * 1.7) < 0.55); f.visible = false; lilyFlowers.push(f); out.push(f);
    });
    return out;
  })();
  // ===== every frame =====
  function updateSummer(dt) {
    var on = summerNow();
    leafBatch.material.color.copy(on ? SUMMER_LEAF : PLAIN_LEAF);
    grassMat.color.copy(on ? SUMMER_GRASS : summerPlain); terrain.material.color.copy(on ? SUMMER_GROUND : summerPlain);
    var dhr = state.minutes / 60; summerDragonfliesMove(on && !indoors && dhr > 7 && dhr < 19);
    summerCloudsMove(on && !indoors); summerBeesMove(on && !indoors && dhr > 7 && dhr < 19);
    if (summerClocks.ims[0].visible !== on) { summerClocks.ims.forEach(function (im) { im.visible = on; }); summerLilies.forEach(function (f) { f.visible = on; }); }
    if (summerFruit.visible !== on) { summerFruit.visible = on; summerStalks.visible = on; summerFruitLeaves.visible = on; }
    if (on !== summerWasOn || state.time - summerFlowerT > 2) { summerWasOn = on; summerFlowerT = state.time; summerFlowersPlace(on); }
    var hr = state.minutes / 60, dusk = hr >= 19 ? Math.min(1, (hr - 19) / 1.2) : hr < 4.5 ? 1 : hr < 5.5 ? 5.5 - hr : 0, flies = on && !indoors && dusk > 0;
    if (summerFireflies.visible !== flies) summerFireflies.visible = flies;
    if (flies) summerFirefliesMove(dusk);
  }

  // ---------- Fall on the island ----------
  // While it's Fall: the broadleaf trees and bushes turn crimson, orange, gold and russet (the pines stay green), the
  // light goes warm and golden, the grass dries toward straw, leaves come tumbling down around you, pumpkin
  // patches ripen in the meadows among their big leaves and curling vines, and clusters
  // of red-and-white toadstools and brown mushrooms come up at the feet of the trees
  function fallNow() { return seasonOf(state.day) === 2; }
  // ===== autumn colours on the trees =====
  var fallLeafTex = paintTexture(256, 256, function (g) {             // (the same round clumps of leaves as the green ones, in autumn colours)
    for (var i = 0; i < 320; i++) {
      var a = Math.random() * Math.PI * 2, r = Math.pow(Math.random(), 0.65) * 108, x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r * 0.92;
      var len = 14 + Math.random() * 14, ang = Math.random() * Math.PI * 2, sunny = Math.max(0, Math.min(1, 0.55 - ((x - 128) + (y - 128)) / 300));
      g.save(); g.translate(x, y); g.rotate(ang);
      var hue = [8, 18, 28, 38, 46][Math.floor(Math.random() * 5)] + Math.random() * 8;
      g.fillStyle = 'hsl(' + hue + ',' + (70 + Math.random() * 20) + '%,' + (34 + sunny * 24 + Math.random() * 10) + '%)';
      g.beginPath(); g.ellipse(0, 0, len / 2, len * 0.26, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(70,30,10,0.22)'; g.lineWidth = 1; g.stroke();
      g.strokeStyle = 'rgba(255,230,170,' + (0.15 + sunny * 0.3) + ')'; g.beginPath(); g.moveTo(-len / 2, 0); g.lineTo(len / 2, 0); g.stroke();
      g.restore();
    }
  });
  var fallGreenTex = leafBatch.material.map, fallLeafOrig = leafBatch.instanceColor ? leafBatch.instanceColor.array.slice() : null, fallLeafCols = null, fallShown = null;
  (function () {                                                       // (each tree its own autumn colour: scarlet maples, orange, gold, russet, and the odd one still turning)
    if (!fallLeafOrig) return;
    fallLeafCols = fallLeafOrig.slice();
    var TINTS = [[1.1, 0.5, 0.42], [1.08, 0.72, 0.5], [1.05, 0.95, 0.55], [0.9, 0.62, 0.46], [1.0, 0.82, 0.5], [0.85, 1.0, 0.6]];
    allScenery.forEach(function (t, ti) {
      var u = t.userData; if (!u.leaves) return;
      var tint = TINTS[Math.floor(springHash(ti * 3.9 + 5) * TINTS.length)];
      u.leaves.forEach(function (L) {
        if (L.batch !== leafBatch) return;
        for (var i = L.start; i < L.start + L.count; i++) {
          var shade = fallLeafOrig[i * 3 + 1], k = shade * (0.95 + springHash(i * 1.3) * 0.2), mix = springHash(i * 0.77) < 0.12 ? 0.85 : 1;   // (a few cards a shade apart)
          fallLeafCols[i * 3] = tint[0] * k * mix; fallLeafCols[i * 3 + 1] = tint[1] * k; fallLeafCols[i * 3 + 2] = tint[2] * k * (2 - mix);
        }
      });
    });
  })();
  // ===== dry leaves: maple, oak and birch, each with its veins and a few freckles, for the falling leaves =====
  var fallVeinTex = cpTex(128, 128, function (g, w, h) {
    var gr = g.createRadialGradient(64, 70, 10, 64, 64, 80); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.75, '#f2ece2'); gr.addColorStop(1, '#a89880'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(90,60,30,0.55)'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(64, 128); g.lineTo(64, 4); g.stroke();   // (the midrib)
    g.lineWidth = 1.3; [[-1, 0.9], [1, 0.9], [-1, 0.55], [1, 0.55], [-1, 0.3], [1, 0.3]].forEach(function (v) { g.beginPath(); g.moveTo(64, 128 * v[1]); g.quadraticCurveTo(64 + v[0] * 26, 128 * v[1] - 22, 64 + v[0] * 56, 128 * v[1] - 40); g.stroke(); });
    g.lineWidth = 0.6; for (var k = 0; k < 40; k++) { var y = 20 + springHash(k * 3.1) * 100, sd = springHash(k) < 0.5 ? -1 : 1; g.beginPath(); g.moveTo(64 + sd * 6, y); g.lineTo(64 + sd * (14 + springHash(k * 7) * 24), y - 10); g.stroke(); }
    for (var s = 0; s < 22; s++) { g.fillStyle = 'rgba(70,40,15,' + (0.15 + springHash(s * 5.1) * 0.25) + ')'; g.beginPath(); g.arc(springHash(s * 2.3) * w, springHash(s * 4.7) * h, 1 + springHash(s) * 2.6, 0, Math.PI * 2); g.fill(); }   // (freckles of age)
  });
  function fallLeafShape(P, curl) {
    var sh = new THREE.Shape(); P.forEach(function (q, i) { if (i) sh.lineTo(q[0], q[1]); else sh.moveTo(q[0], q[1]); }); sh.closePath();
    var g = new THREE.ShapeGeometry(sh, 3), gp = g.attributes.position, uv = g.attributes.uv;
    for (var i = 0; i < gp.count; i++) { uv.setXY(i, gp.getX(i) + 0.5, gp.getY(i) + 0.5); gp.setZ(i, gp.getX(i) * gp.getX(i) * curl - gp.getY(i) * 0.06 + Math.sin(gp.getY(i) * 9) * 0.01); }   // (curled and a little wavy, as dry leaves are)
    g.computeVertexNormals(); g.scale(0.12, 0.12, 0.12); return g;
  }
  var fallLeafGeos = [
    fallLeafShape([[0, -0.5], [0.05, -0.2], [0.32, -0.28], [0.26, -0.1], [0.5, 0.05], [0.34, 0.1], [0.4, 0.32], [0.18, 0.22], [0.14, 0.5], [0, 0.32], [-0.14, 0.5], [-0.18, 0.22], [-0.4, 0.32], [-0.34, 0.1], [-0.5, 0.05], [-0.26, -0.1], [-0.32, -0.28], [-0.05, -0.2]], 0.3),   // (maple)
    fallLeafShape([[0, -0.5], [0.08, -0.35], [0.2, -0.3], [0.14, -0.15], [0.28, -0.08], [0.2, 0.06], [0.32, 0.16], [0.2, 0.28], [0.26, 0.4], [0.1, 0.45], [0, 0.5], [-0.1, 0.45], [-0.26, 0.4], [-0.2, 0.28], [-0.32, 0.16], [-0.2, 0.06], [-0.28, -0.08], [-0.14, -0.15], [-0.2, -0.3], [-0.08, -0.35]], 0.4),   // (oak, with its rounded lobes)
    fallLeafShape([[0, -0.5], [0.12, -0.32], [0.26, -0.1], [0.3, 0.1], [0.22, 0.3], [0.08, 0.46], [0, 0.5], [-0.08, 0.46], [-0.22, 0.3], [-0.3, 0.1], [-0.26, -0.1], [-0.12, -0.32]], 0.5)   // (birch: small, oval and pointed)
  ];
  var fallLeafGeo = fallLeafGeos[0];
  var fallLeafMat = new THREE.MeshStandardMaterial({ map: fallVeinTex, roughness: 0.8, side: THREE.DoubleSide });
  var FALL_COLS = [0xd8401c, 0xe86a1c, 0xf0a020, 0xe8c040, 0xb8541c, 0x9a3a1a, 0xc8781c];
  // ===== leaves tumbling down around you =====
  var fallDrift = fallLeafGeos.map(function (geo, gi) {
    var N = 40, im = new THREE.InstancedMesh(geo, fallLeafMat, N), seeds = [], col = new THREE.Color();
    for (var i = 0; i < N; i++) { var j = i * 3 + gi; seeds.push({ x: (springHash(j * 3.1 + 40) - 0.5) * 26, y: springHash(j * 5.3 + 40) * 9, z: (springHash(j * 7.7 + 40) - 0.5) * 26, s: 0.35 + springHash(j * 2.9) * 0.4, w: springHash(j * 9.1) * 6.28, spin: 1 + springHash(j * 4.4) * 2.5 }); im.setColorAt(i, col.set(FALL_COLS[j % FALL_COLS.length])); }
    im.frustumCulled = false; im.visible = false; im.castShadow = true; scene.add(im); im.userData.seeds = seeds; return im;
  });
  var fdM = new THREE.Matrix4(), fdQ = new THREE.Quaternion(), fdE = new THREE.Euler(), fdV = new THREE.Vector3(), fdS = new THREE.Vector3(1, 1, 1);
  function fallDriftMove(dt) {
    var cx = cam.target.x, cz = cam.target.z, t = state.time;
    fallDrift.forEach(function (im) {
      im.userData.seeds.forEach(function (s, i) {
        s.y -= dt * s.s; s.x += dt * (0.35 + Math.sin(t * 0.6 + s.w) * 0.4); s.z += dt * Math.cos(t * 0.45 + s.w) * 0.25;
        var wx = cx + ((s.x % 26) + 39) % 26 - 13, wz = cz + ((s.z % 26) + 39) % 26 - 13, gy = Math.max(groundHeight(wx, wz), WATER_Y);
        if (s.y < gy + 0.05) s.y = gy + 7 + springHash(i + t) * 3;      // (a leaf that lands is gone; a new one starts high up)
        fdV.set(wx + Math.sin(t * 1.3 + s.w) * 0.35, s.y, wz); fdE.set(t * s.spin + s.w, t * 0.7 * s.spin, Math.sin(t * 2 + s.w) * 0.8); fdQ.setFromEuler(fdE);   // (fluttering and spinning as it falls)
        fdM.compose(fdV, fdQ, fdS); im.setMatrixAt(i, fdM);
      });
      im.instanceMatrix.needsUpdate = true;
    });
  }
  // ===== pumpkin patches and mushrooms =====
  var FALL_PUMPKINS = [], FALL_MUSH = [], fallDecorShown = null, fallDecorT = -99, fallWasOn = null, fallMeshes = [];
  var FALL_SHOCKS = [];
  (function () {                                                       // (little groups of pumpkins round the edge of your farm)
    var fx = FARM_X + COLS * TILE / 2, fz = FARM_Z + ROWS * TILE / 2;
    for (var c = 0, tries = 0; c < 7 && tries < 3000; tries++) {
      var a = springHash(tries * 2.7 + 77) * 6.28, d = 6 + springHash(tries * 1.9 + 3) * 9, x = fx + Math.cos(a) * d, z = fz + Math.sin(a) * d;
      if (!springFlowerSpot(x, z, 0.8) || FALL_SHOCKS.some(function (q) { return dist(q.x, q.z, x, z) < 4; })) continue;
      c++; FALL_SHOCKS.push({ x: x, z: z, y: groundHeight(x, z), ry: springHash(c * 3.1) * 6.28, s: 0.9 + springHash(c * 1.7) * 0.25 });
      for (var p = 0; p < 2; p++) { var pa = springHash(c * 5 + p) * 6.28, px = x + Math.cos(pa) * 0.5, pz = z + Math.sin(pa) * 0.5; if (springFlowerSpot(px, pz, 0.2)) FALL_PUMPKINS.push({ x: px, z: pz, y: groundHeight(px, pz), s: 1.3 + springHash(c * 9 + p) * 0.5, sy: 0.8 + springHash(c * 4 + p) * 0.4, rot: springHash(c + p * 7) * 6.28, col: p ? 0xf07818 : 0xe8661a, patch: 'shock' + c + '_' + p, noVine: true }); }
    }
  })();
  (function () {
    // (where: mushrooms by the feet of broadleaf trees, pumpkins out in open meadow)
    choppable.forEach(function (t, ti) {
      var u = t.userData; if (u.gone || !u.leafy) return;
      var a = springHash(ti * 2.3 + 9) * 6.28, d = (u.solidR || 0.4) + 0.75 + springHash(ti * 1.7) * 0.5, x = u.base.x + Math.cos(a) * d, z = u.base.z + Math.sin(a) * d;
      var a2 = a + 2 + springHash(ti) * 1.5, d2 = (u.solidR || 0.4) + 0.35, mx = u.base.x + Math.cos(a2) * d2, mz = u.base.z + Math.sin(a2) * d2;
      if (springHash(ti * 5.7 + 3) < 0.22 && springFlowerSpot(mx, mz, 0.1)) {
        var red = springHash(ti * 8.1) < 0.5, n = 3 + Math.floor(springHash(ti * 2.2) * 4);
        for (var m = 0; m < n; m++) { var ma = springHash(ti * 3 + m * 1.9) * 6.28, mr = springHash(ti * 7 + m) * 0.22; FALL_MUSH.push({ x: mx + Math.cos(ma) * mr, z: mz + Math.sin(ma) * mr, y: groundHeight(mx, mz), red: red, s: 0.6 + springHash(ti + m * 2.7) * 0.7, tilt: (springHash(ti + m * 5.1) - 0.5) * 0.35, rot: springHash(m + ti * 1.1) * 6.28, tree: t }); }
      }
    });
    for (var c = 0, tries = 0; c < 16 && tries < 4000; tries++) {
      var cx = -ISLAND + 3 + springHash(tries * 6.7 + 909) * (ISLAND * 2 - 6), cz = -ISLAND + 3 + springHash(tries * 2.1 + 404) * (ISLAND * 2 - 6);
      if (!springFlowerSpot(cx, cz, 1.4)) continue; c++;
      var n2 = 4 + Math.floor(springHash(c * 3.3) * 5), patch = [];
      for (var p = 0; p < n2; p++) {
        var pa = springHash(c * 11 + p * 2.3) * 6.28, pr = 0.3 + springHash(c * 5 + p) * 0.9, px = cx + Math.cos(pa) * pr, pz = cz + Math.sin(pa) * pr;
        if (!springFlowerSpot(px, pz, 0.4) || patch.some(function (q) { return dist(q.x, q.z, px, pz) < 0.6; })) continue;
        var v = springHash(c * 9 + p * 4.1), pk = { x: px, z: pz, y: groundHeight(px, pz), s: 1.25 + springHash(c + p * 3.3) * 1.1, sy: 0.75 + springHash(c * 3 + p * 1.9) * 0.55, rot: springHash(c * 2 + p) * 6.28, col: v < 0.7 ? (v < 0.35 ? 0xf07818 : 0xe8661a) : v < 0.85 ? 0xf0e8d8 : 0xd8a040, patch: c };
        patch.push(pk); FALL_PUMPKINS.push(pk);
      }
    }
    // (a pumpkin: deep ribs, a little squat, with a dimple on top; and its gnarled, curving stem)
    var pg = new THREE.SphereGeometry(0.16, 32, 16), pp = pg.attributes.position;
    for (var i = 0; i < pp.count; i++) {
      var x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i), ang = Math.atan2(z, x), rr = 1 + Math.cos(ang * 10) * 0.07 - Math.pow(Math.max(0, y / 0.16), 6) * 0.25;
      pp.setXYZ(i, x * rr, y * 0.72 - (Math.abs(y) > 0.15 ? Math.sign(y) * 0.02 : 0), z * rr);
    }
    pg.translate(0, 0.11, 0); pg.computeVertexNormals();
    var stemG = new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.2, 0), new THREE.Vector3(0.006, 0.24, 0), new THREE.Vector3(0.02, 0.27, 0.004), new THREE.Vector3(0.04, 0.275, 0.01)]), 8, 0.012, 6, false);
    // (a pumpkin leaf: big, lobed and ruffled, lying out from the vine)
    var lp = [[0, 0], [0.08, 0.04], [0.16, 0.0], [0.15, 0.08], [0.2, 0.12], [0.12, 0.15], [0.1, 0.24], [0.02, 0.17], [-0.06, 0.24], [-0.08, 0.15], [-0.16, 0.12], [-0.11, 0.08], [-0.14, 0.0], [-0.07, 0.04]];
    var lsh = new THREE.Shape(); lp.forEach(function (q, k) { if (k) lsh.lineTo(q[0], q[1]); else lsh.moveTo(q[0], q[1]); }); lsh.closePath();
    var pLeaf = new THREE.ShapeGeometry(lsh, 3), plp = pLeaf.attributes.position;
    for (var j = 0; j < plp.count; j++) plp.setZ(j, Math.sin(plp.getX(j) * 40) * 0.008 + plp.getY(j) * 0.15);
    pLeaf.rotateX(-Math.PI / 2 + 0.25); pLeaf.computeVertexNormals();
    var leafStalk = new THREE.CylinderGeometry(0.005, 0.006, 0.14, 5); leafStalk.translate(0, 0.07, 0); leafStalk.rotateX(0.35);
    // (mushrooms: a stem, and a cap; toadstools red with white flecks, the others brown and velvety, with pale gills beneath)
    var spotTex = cpTex(128, 64, function (g, w, h) { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (var k = 0; k < 40; k++) { var sx = springHash(k * 3.3) * w, sy = springHash(k * 1.7) * h * 0.8; g.fillStyle = '#c8c8c8'; g.beginPath(); g.arc(sx, sy, 2 + springHash(k) * 3, 0, Math.PI * 2); g.fill(); } });
    var redTex = cpTex(128, 64, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#c81e18'); gr.addColorStop(1, '#e85030'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (var k = 0; k < 34; k++) { var sx = springHash(k * 3.3) * w, sy = springHash(k * 1.7) * h * 0.85; g.fillStyle = '#fff8ec'; g.beginPath(); g.ellipse(sx, sy, 2.4 + springHash(k) * 2.4, 1.8 + springHash(k) * 1.6, 0, 0, Math.PI * 2); g.fill(); } });
    var capG = new THREE.SphereGeometry(0.05, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5); capG.scale(1, 0.62, 1); capG.translate(0, 0.07, 0);
    var gillG = new THREE.CircleGeometry(0.049, 16); gillG.rotateX(Math.PI / 2); gillG.translate(0, 0.069, 0);
    var mStemG = new THREE.CylinderGeometry(0.012, 0.016, 0.07, 8); mStemG.translate(0, 0.035, 0);
    var pumpTex = cpTex(256, 128, function (g, w, h) {                // (the ribs: deep grooves and glossy highlights, a few pale freckles, darker round the stem)
      for (var x = 0; x < w; x++) { var r = Math.cos(x / w * Math.PI * 2 * 10), k = 0.62 + 0.38 * Math.pow((r + 1) / 2, 0.6); g.fillStyle = 'rgb(' + Math.round(255 * k) + ',' + Math.round(250 * k) + ',' + Math.round(240 * k) + ')'; g.fillRect(x, 0, 1, h); }
      var top = g.createLinearGradient(0, 0, 0, h * 0.3); top.addColorStop(0, 'rgba(60,40,20,0.45)'); top.addColorStop(1, 'rgba(60,40,20,0)'); g.fillStyle = top; g.fillRect(0, 0, w, h);
      for (var s2 = 0; s2 < 140; s2++) { g.fillStyle = 'rgba(255,240,200,' + (0.2 + springHash(s2) * 0.3) + ')'; g.fillRect(springHash(s2 * 3.7) * w, springHash(s2 * 1.9) * h, 1.5, 3); }
      for (var x2 = 0; x2 < 10; x2++) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect((x2 + 0.02) / 10 * w, h * 0.25, 3, h * 0.5); }
    });
    var tendrilGeo = (function () { var pts = []; for (var q = 0; q < 40; q++) { var a = q * 0.45; pts.push(new THREE.Vector3(Math.cos(a) * 0.03 * (1 - q / 60), 0.01 + q * 0.004, Math.sin(a) * 0.03 * (1 - q / 60) + q * 0.003)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.003, 4, false); })();
    var mPump = new THREE.MeshStandardMaterial({ map: pumpTex, roughness: 0.45 }), mStemP = new THREE.MeshStandardMaterial({ color: 0x6a7a3a, roughness: 0.9 });
    var mPLeaf = new THREE.MeshStandardMaterial({ color: 0x5a8a3a, roughness: 0.8, side: THREE.DoubleSide }), mVine = new THREE.MeshStandardMaterial({ color: 0x6a8a3a, roughness: 0.85 });
    var mRedCap = new THREE.MeshStandardMaterial({ map: redTex, roughness: 0.4 }), mBrownCap = new THREE.MeshStandardMaterial({ color: 0x8a5a30, roughness: 0.85 }), mWhite = new THREE.MeshStandardMaterial({ color: 0xf2ecdc, roughness: 0.8, side: THREE.DoubleSide });
    var reds = FALL_MUSH.filter(function (m) { return m.red; }), browns = FALL_MUSH.filter(function (m) { return !m.red; });
    var pleaves = []; FALL_PUMPKINS.forEach(function (pk, i) { for (var l = 0; l < 3; l++) pleaves.push({ pk: pk, a: pk.rot + l * 2.1 + springHash(i * 3 + l) * 0.8, d: 0.2 + springHash(i + l * 7) * 0.2, s: 2.2 + springHash(i * 5 + l) * 0.9 }); });
    fallMeshes = [
      { geo: pg, m: mPump, list: FALL_PUMPKINS, part: 'pumpkin', col: function (p) { return p.col; } }, { geo: stemG, m: mStemP, list: FALL_PUMPKINS, part: 'pumpkin' },
      { geo: pLeaf, m: mPLeaf, list: pleaves, part: 'pleaf', col: function (l) { return l.d > 0.36 ? 0xc8b048 : l.s > 1.75 ? 0x8aa040 : 0xffffff; } }, { geo: leafStalk, m: mVine, list: pleaves, part: 'pleaf' }, { geo: tendrilGeo, m: mVine, list: pleaves, part: 'pleaf' },
      { geo: mStemG, m: mWhite, list: FALL_MUSH, part: 'mush' }, { geo: gillG, m: mWhite, list: FALL_MUSH, part: 'mush' },
      { geo: capG, m: mRedCap, list: reds, part: 'mush' }, { geo: capG, m: mBrownCap, list: browns, part: 'mush', col: function (m) { return m.s > 1 ? 0x9a6a3a : 0x7a4a26; } },
    ].map(function (F) {
      F.im = new THREE.InstancedMesh(F.geo, F.m, Math.max(1, F.list.length)); F.im.castShadow = F.part !== 'pile'; F.im.receiveShadow = true; F.im.frustumCulled = false; F.im.visible = false; scene.add(F.im);
      if (F.col) { var col = new THREE.Color(); F.list.forEach(function (r, k) { F.im.setColorAt(k, col.set(F.col(r))); }); }
      return F;
    });
    // (the vines: one curling tube through each patch, joining its pumpkins)
    var byPatch = {}; FALL_PUMPKINS.forEach(function (pk) { (byPatch[pk.patch] = byPatch[pk.patch] || []).push(pk); });
    Object.keys(byPatch).forEach(function (k) {
      var ps = byPatch[k]; if (ps.length < 2 || ps[0].noVine) return;
      var pts = []; ps.forEach(function (pk, i) { pts.push(new THREE.Vector3(pk.x, pk.y + 0.03, pk.z)); if (i < ps.length - 1) { var q = ps[i + 1]; pts.push(new THREE.Vector3((pk.x + q.x) / 2 + (springHash(i * 3.3 + +k) - 0.5) * 0.4, Math.max(pk.y, q.y) + 0.03, (pk.z + q.z) / 2 + (springHash(i * 1.1 + +k) - 0.5) * 0.4)); } });
      var vine = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 10, 0.012, 5, false), mVine); vine.castShadow = true; vine.visible = false; scene.add(vine);
      fallMeshes.push({ vine: vine, list: ps });
    });
  })();
  (function () {                                                       // (the finer things of fall: acorns and pinecones, and bracket fungi on the trunks)
    var up = new THREE.Vector3(0, 1, 0);
    function cylBetween(a, b, r0, r1, seg) {                           // (a tapering rod from point a to point b)
      var d = new THREE.Vector3().subVectors(b, a), L = d.length(), g = new THREE.CylinderGeometry(r1, r0, L, seg || 5);
      g.translate(0, L / 2, 0); g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, d.normalize()))); g.translate(a.x, a.y, a.z); return g;
    }
    // (an acorn in its scaly cap; and a pinecone, its scales spiralling round in rings)
    var nutGeo = new THREE.SphereGeometry(0.013, 10, 8); nutGeo.scale(1, 1.35, 1); nutGeo.translate(0, 0.0175, 0);
    var capGeo2 = new THREE.SphereGeometry(0.0145, 10, 5, 0, Math.PI * 2, 0, Math.PI * 0.45); capGeo2.scale(1, 0.75, 1); capGeo2.translate(0, 0.026, 0);
    var cupStalk = new THREE.CylinderGeometry(0.0018, 0.0022, 0.008, 5); cupStalk.translate(0, 0.038, 0);
    var coneParts = [];
    for (var ring = 0; ring < 8; ring++) for (var sc = 0; sc < 7; sc++) {
      var ra = sc / 7 * Math.PI * 2 + ring * 0.45, rr = 0.022 * Math.sin(Math.PI * (0.15 + ring / 8 * 0.8)), sg = new THREE.ConeGeometry(0.009, 0.014, 4);
      sg.rotateZ(-1.2); sg.rotateY(-ra); sg.translate(Math.cos(ra) * rr, ring * 0.009, Math.sin(ra) * rr); coneParts.push(sg);
    }
    var pineconeGeo = mergeSimple(coneParts); pineconeGeo.rotateZ(Math.PI / 2 - 0.2); pineconeGeo.translate(0.03, 0.018, 0);   // (lying on its side)
    // (bracket fungi: three shelves stacked up the bark, each banded in rings of cream, tan and rust)
    var bandTex = cpTex(128, 128, function (g, w, h) { for (var r = 64; r > 0; r -= 5) { var k = (r / 5) % 3; g.fillStyle = k === 0 ? '#d8b078' : k === 1 ? '#b8784a' : '#ece0c4'; g.beginPath(); g.arc(64, 64, r, 0, Math.PI * 2); g.fill(); } });
    var shelves = [];
    [[0, 0.075], [0.07, 0.06], [0.13, 0.048]].forEach(function (sh) { var cg = new THREE.CylinderGeometry(sh[1], sh[1] * 0.92, 0.014, 18, 1, false, 0, Math.PI); var uv = cg.attributes.uv, cp = cg.attributes.position; for (var q = 0; q < cp.count; q++) uv.setXY(q, cp.getX(q) / (2 * sh[1]) + 0.5, cp.getZ(q) / (2 * sh[1]) + 0.5); cg.translate(0, sh[0], 0); shelves.push(cg); });
    var bracketGeo = mergeUV(shelves);
    // (where they go)
    var acorns = [], cones = [], brackets = [];
    choppable.forEach(function (t, ti) {
      var u = t.userData; if (u.gone) return;
      var n = u.leafy ? (springHash(ti * 2.9 + 1) < 0.4 ? 4 : 0) : (springHash(ti * 3.7 + 2) < 0.45 ? 3 : 0);
      for (var k = 0; k < n; k++) {
        var a = springHash(ti * 5 + k * 1.3) * 6.28, d = (u.solidR || 0.4) + 0.25 + springHash(ti + k * 2.1) * 0.6, x = u.base.x + Math.cos(a) * d, z = u.base.z + Math.sin(a) * d;
        if (!springFlowerSpot(x, z, 0.05)) continue;
        (u.leafy ? acorns : cones).push({ x: x, y: groundHeight(x, z), z: z, rx: u.leafy ? 1.4 + (springHash(k + ti) - 0.5) * 0.4 : 0, ry: springHash(k * 7 + ti) * 6.28, rz: 0, s: u.leafy ? 2.6 + springHash(k * 3 + ti) * 0.6 : 1.4 + springHash(k + ti * 3) * 0.6, tree: t });
      }
      if (u.leafy && springHash(ti * 6.1 + 4) < 0.28) {                // (shelves of fungus on the shady side of the trunk)
        var ba = springHash(ti * 8.3) * 6.28, tr = (u.solidR || 0.4) - 0.04, bh = 0.35 + springHash(ti * 2.4) * 0.4;
        brackets.push({ x: u.base.x + Math.cos(ba) * tr, y: u.base.y + bh, z: u.base.z + Math.sin(ba) * tr, rx: 0, ry: Math.atan2(-Math.sin(ba), Math.cos(ba)), rz: 0, s: 1.6 + springHash(ti * 3.3) * 0.6, tree: t, needStanding: true });
      }
    });
    var mNut = new THREE.MeshStandardMaterial({ color: 0xa8743a, roughness: 0.45 }), mCup = new THREE.MeshStandardMaterial({ color: 0x6a4a28, roughness: 0.95 }), mCone = new THREE.MeshStandardMaterial({ color: 0x7a4a26, roughness: 0.9 });
    var mBracket = new THREE.MeshStandardMaterial({ map: bandTex, roughness: 0.85 });
    [{ geo: nutGeo, m: mNut, list: acorns }, { geo: capGeo2, m: mCup, list: acorns }, { geo: cupStalk, m: mCup, list: acorns }, { geo: pineconeGeo, m: mCone, list: cones },
     { geo: bracketGeo, m: mBracket, list: brackets }
    ].forEach(function (F) {
      F.part = 'thing'; F.im = new THREE.InstancedMesh(F.geo, F.m, Math.max(1, F.list.length)); F.im.castShadow = true; F.im.receiveShadow = true; F.im.frustumCulled = false; F.im.visible = false; scene.add(F.im); fallMeshes.push(F);
    });
  })();
  // ===== geese flying south in a V across the sky, now and then =====
  var fallGeese = (function () {
    var list = [], mBody = new THREE.MeshStandardMaterial({ color: 0x6a6258, roughness: 0.8 }), mBlack = new THREE.MeshStandardMaterial({ color: 0x1e1c1a, roughness: 0.7 }), mWhite = new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.7 });
    var wingG = new THREE.PlaneGeometry(0.55, 0.16); wingG.translate(0.275, 0, 0); wingG.rotateX(-Math.PI / 2);
    for (var i = 0; i < 9; i++) {
      var G = new THREE.Group();
      var body = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mBody); body.scale.set(0.8, 0.75, 1.8); G.add(body);
      var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.28, 6), mBlack); neck.rotation.x = Math.PI / 2 - 0.25; neck.position.set(0, 0.04, 0.28); G.add(neck);
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mBlack); head.scale.set(0.9, 0.9, 1.3); head.position.set(0, 0.075, 0.43); G.add(head);
      var chin = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), mWhite); chin.position.set(0, 0.06, 0.42); chin.scale.set(1.05, 0.7, 0.8); G.add(chin);
      var tail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 6), mBlack); tail.rotation.x = -Math.PI / 2; tail.position.z = -0.24; G.add(tail);
      var wings = [-1, 1].map(function (s) { var w = new THREE.Mesh(wingG, mBody); w.scale.x = s; w.position.set(s * 0.05, 0.03, 0.02); G.add(w); return w; });
      var row = Math.ceil(i / 2), side = i === 0 ? 0 : (i % 2 ? -1 : 1);
      G.scale.setScalar(2.4); G.visible = false; scene.add(G);
      list.push({ g: G, wings: wings, off: new THREE.Vector3(side * row * 1.9, (springHash(i) - 0.5) * 0.6, -row * 1.6), ph: springHash(i * 3.1) * 6.28 });
    }
    return list;
  })();
  function fallGeeseMove(on) {
    var t = state.time, cyc = (t % 150) / 150, flying = on && cyc < 0.45, p = cyc / 0.45, cx = camera.position.x, cz = camera.position.z;
    fallGeese.forEach(function (Gs) {
      if (Gs.g.visible !== flying) Gs.g.visible = flying;
      if (!flying) return;
      var lx = 120 - p * 240;                                           // (crossing from east to west, high over the island)
      Gs.g.position.set(cx + lx + Gs.off.z * -1, 30 + Gs.off.y, cz - 55 + Gs.off.x);
      Gs.g.rotation.set(0, -Math.PI / 2, 0);
      var f = Math.sin(t * 5 + Gs.ph) * 0.55; Gs.wings[0].rotation.z = -f; Gs.wings[1].rotation.z = f;
    });
  }
  var fpM = new THREE.Matrix4(), fpQ = new THREE.Quaternion(), fpE = new THREE.Euler(), fpV = new THREE.Vector3(), fpS = new THREE.Vector3();
  var fallHidden = [], fallGM = new THREE.Matrix4(), fallGP = new THREE.Vector3();
  function fallGrassUnder(spots) {                                     // (the grass blades and wildflowers under pumpkins tuck away, and come back after)
    fallHidden.forEach(function (b) {
      var t = tileMap[tileKey(Math.floor((b.p.x - FARM_X) / TILE), Math.floor((b.p.z - FARM_Z) / TILE))];
      if (t && t.soil) { (t.grass = t.grass || []).push({ i: b.i, m: b.m, f: b.f }); return; }   // (dug into soil meanwhile: it stays tucked away with that tile)
      if (b.f) { flowerHeads.setMatrixAt(b.i, b.m); flowerStems.setMatrixAt(b.i, b.m); } else grass.setMatrixAt(b.i, b.m);
    });
    fallHidden = [];
    function hide(mesh, isF) {
      for (var i = 0; i < mesh.count; i++) {
        mesh.getMatrixAt(i, fallGM); if (fallGM.elements[0] === 0 && fallGM.elements[5] === 0) continue;
        fallGP.setFromMatrixPosition(fallGM);
        for (var k = 0; k < spots.length; k++) { var sp = spots[k]; if (Math.abs(fallGP.x - sp[0]) < sp[2] && Math.abs(fallGP.z - sp[1]) < sp[2] && dist(fallGP.x, fallGP.z, sp[0], sp[1]) < sp[2]) {
          fallHidden.push({ i: i, m: fallGM.clone(), f: isF, p: fallGP.clone() }); mesh.setMatrixAt(i, hideM); if (isF) flowerStems.setMatrixAt(i, hideM); break; } }
      }
    }
    if (spots.length) { hide(grass, false); hide(flowerHeads, true); }
    grass.instanceMatrix.needsUpdate = true; flowerHeads.instanceMatrix.needsUpdate = flowerStems.instanceMatrix.needsUpdate = true;
  }
  function fallDecorPlace(show) {
    function ok(r) { var o = r.pile || r.pk || r; if (!show || !springFlowerOK(o)) return false; var t = o.tree; if (o.needStanding) return !!t && t.userData.state === 'standing'; return !t || t.userData.state === 'standing' || t.userData.state === 'regrowing'; }
    var key = fallMeshes.map(function (F) { return F.list.map(function (r) { return ok(r) ? 1 : 0; }).join(''); }).join('|');
    if (key === fallDecorShown) return; fallDecorShown = key;
    var spots = [];
    if (show) {
      FALL_PUMPKINS.forEach(function (pk) { if (ok(pk)) spots.push([pk.x, pk.z, 0.3 * pk.s + 0.1]); });
    }
    fallGrassUnder(spots);
    fallMeshes.forEach(function (F) {
      if (F.vine) { F.vine.visible = show && F.list.every(function (pk) { return springFlowerOK(pk); }); return; }
      F.im.visible = show;
      F.list.forEach(function (r, i) {
        var k = ok(r) ? 1 : 0;
        if (F.part === 'pumpkin') { fpV.set(r.x, r.y, r.z); fpE.set(0, r.rot, 0); fpS.set(k * r.s, k * r.s * (r.sy || 1), k * r.s); }
        else if (F.part === 'pleaf') { var pk = r.pk; fpV.set(pk.x + Math.cos(r.a) * r.d * pk.s, pk.y + 0.005, pk.z + Math.sin(r.a) * r.d * pk.s); fpE.set(0, -r.a + Math.PI / 2, 0); fpS.setScalar(k * r.s); k = ok(pk) ? 1 : 0; fpS.setScalar(k * r.s); }
        else if (F.part === 'mush') { fpV.set(r.x, r.y, r.z); fpE.set(r.tilt, r.rot, 0); fpS.setScalar(k * r.s); }
        else { fpV.set(r.x, r.y, r.z); fpE.set(r.rx || 0, r.ry || 0, r.rz || 0, 'YXZ'); fpS.setScalar(k * r.s); }
        fpQ.setFromEuler(fpE); fpM.compose(fpV, fpQ, fpS); F.im.setMatrixAt(i, fpM);
      });
      F.im.instanceMatrix.needsUpdate = true; if (F.im.instanceColor) F.im.instanceColor.needsUpdate = true;
    });
  }
  // ===== warm, golden autumn light, and drier grass =====
  var FALL_SKY = new THREE.Color(0x9ec2e6), FALL_SUN = new THREE.Color(0xffb468), FALL_GRASS = new THREE.Color(1.0, 0.76, 0.36), FALL_GROUND = new THREE.Color(1.0, 0.84, 0.58), FALL_MIST = new THREE.Color(0xeee0c8), FALL_FOG = [scene.fog.near, scene.fog.far];
  var fallBaseSky = updateSky;
  updateSky = function () {
    var night = fallBaseSky.apply(this, arguments);
    var mist = 0;
    if (fallNow()) {
      var day = Math.max(0, 1 - night * 1.6); scene.background.lerp(FALL_SKY, 0.35 * day); scene.fog.color.copy(scene.background); sun.color.lerp(FALL_SUN, 0.45 * day);
      var hr = state.minutes / 60; mist = hr < 5 || hr > 10 ? 0 : hr < 6 ? hr - 5 : hr < 8 ? 1 : (10 - hr) / 2;   // (a golden morning mist, burning off by mid-morning)
      scene.fog.color.lerp(FALL_MIST, 0.5 * mist);
    }
    scene.fog.near = FALL_FOG[0] - 30 * mist; scene.fog.far = FALL_FOG[1] - 55 * mist;
    return night;
  };
  // ===== every frame =====
  function updateFall(dt) {
    var on = fallNow();
    if (fallShown !== on && fallLeafCols) {                             // (the trees turn, or turn back)
      fallShown = on; leafBatch.material.map = on ? fallLeafTex : fallGreenTex; leafBatch.material.needsUpdate = true;
      leafBatch.instanceColor.array.set(on ? fallLeafCols : fallLeafOrig); leafBatch.instanceColor.needsUpdate = true;
    }
    if (on) { grassMat.color.copy(FALL_GRASS); terrain.material.color.copy(FALL_GROUND); }
    if (on !== fallWasOn || state.time - fallDecorT > 2) { fallWasOn = on; fallDecorT = state.time; fallDecorPlace(on); }
    var hr = state.minutes / 60, drift = on && !indoors && hr > 6 && hr < 19.5;
    fallDrift.forEach(function (im) { if (im.visible !== drift) im.visible = drift; });
    fallGeeseMove(on && !indoors && hr > 7 && hr < 18.5);
    if (drift) fallDriftMove(dt);
  }

  // ---------- Winter on the island ----------
  // While it's Winter: snow lies over the whole island, the broadleaf trees and bushes stand bare with snow along their
  // branches, the pines are heavy with snow, the grass pokes up pale and frosted, snowflakes drift down all day, the
  // light goes cool and silvery, and a few snowmen stand about in their scarves and hats
  function winterNow() { return seasonOf(state.day) === 3; }
  // ===== snow-laden pines =====
  var winterNeedleTex = paintTexture(256, 128, function (g) {          // (pine needles, with snow heaped along the branch and lying over them)
    for (var i = 0; i < 420; i++) {
      var t = Math.random(), x = 6 + t * 240, y = 64 + t * t * 14, reach = (44 - t * 26) * (0.5 + Math.random() * 0.5), side = Math.random() < 0.5 ? -1 : 1;
      g.strokeStyle = 'hsl(' + (140 + Math.random() * 20) + ',' + (24 + Math.random() * 14) + '%,' + (20 + Math.random() * 16) + '%)'; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + 6 + Math.random() * 12, y + side * reach); g.stroke();
    }
    g.strokeStyle = '#4a3828'; g.lineWidth = 3; g.beginPath(); g.moveTo(2, 64); g.quadraticCurveTo(128, 68, 252, 78); g.stroke();
    for (var k = 0; k < 70; k++) {                                     // (soft heaps of snow, thickest along the branch, thinning toward the tips)
      var t2 = Math.random(), x3 = 8 + t2 * 236, y3 = 64 + t2 * t2 * 14 + (Math.random() - 0.5) * (50 - t2 * 30), r = (16 - t2 * 9) * (0.6 + Math.random() * 0.5);
      var gr = g.createRadialGradient(x3 - r * 0.3, y3 - r * 0.3, 1, x3, y3, r); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#eef4fc'); gr.addColorStop(1, 'rgba(200,218,240,0.85)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x3, y3, r, r * 0.75, 0, 0, Math.PI * 2); g.fill();
    }
  });
  var winterSnowOn = { value: 0 };                                    // (snow lying along the tops of the trunks, branches and roots: wherever the bark faces the sky)
  [barkMat, pineBarkMat, rootMat, pineRootMat].forEach(function (m) {
    var before = m.onBeforeCompile;
    m.onBeforeCompile = function (shader) {
      if (before) before.call(this, shader);
      shader.uniforms.uSnowOn = winterSnowOn;
      shader.fragmentShader = 'uniform float uSnowOn;\n' + shader.fragmentShader.replace('#include <normal_fragment_maps>', [
        '#include <normal_fragment_maps>',
        'vec3 snowUp = normalize((vec4(normal, 0.0) * viewMatrix).xyz);',   // (this bit of bark's direction in the world)
        'float snowAmt = smoothstep(0.15, 0.55, snowUp.y) * uSnowOn;',
        'diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.93, 0.96, 1.0), snowAmt);'
      ].join('\n'));
    };
    m.needsUpdate = true;
  });
  // ===== the Dawn Tree in winter: snow lying on its blossom =====
  // The Dawn Tree keeps its pink blossom through Winter; snow just lies on top of it. Each card of blossom near the top
  // of its cluster takes a cap of solid snow over the part of it that faces the sky (the higher up the cluster, the
  // more of the card is covered), with a lumpy edge, and the snow doesn't glow pink. Cards lower down and underneath
  // stay as they are, and the hanging strands are just frosted where they hang from. All Winter the blossom is drawn
  // solid rather than softly see-through at its edges, which against the white snow would make it look washed out.
  // It all goes back to normal when Spring comes
  (function () {
    var nCards = blossomCards.count, up = new Float32Array(blossomCards.instanceMatrix.count), m4 = new THREE.Matrix4(), cp = new THREE.Vector3(), cq = new THREE.Quaternion(), cs = new THREE.Vector3();
    for (var i = 0; i < nCards; i++) {                                 // (how high up its own cluster each card sits: the higher, the more snow)
      blossomCards.getMatrixAt(i, m4); m4.decompose(cp, cq, cs);
      var best = null, bd = 1e9; clumps.forEach(function (c) { var d = cp.distanceTo(c.p); if (d < bd) { bd = d; best = c; } });
      up[i] = best ? (cp.y - best.p.y) / best.r : 0;
    }
    blossomCards.geometry.setAttribute('snowUp', new THREE.InstancedBufferAttribute(up, 1));
    function snowOnBlossom(m, strand) {
      var before = m.onBeforeCompile;
      m.onBeforeCompile = function (shader) {
        if (before) before.call(this, shader);
        shader.uniforms.uSnowOn = winterSnowOn;
        shader.vertexShader = (strand ? '' : 'attribute float snowUp;\n') + 'varying float vSnowUp;\nvarying float vSnowH;\n' + shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n' +
          (strand ? 'vSnowUp = 0.0; vSnowH = 0.0;' : 'vSnowUp = snowUp; vSnowH = ((instanceMatrix * vec4(position, 1.0)).y - instanceMatrix[3].y) / length(instanceMatrix[0].xyz);'));   // (how far up this bit of the card is, in the world)
        shader.fragmentShader = 'uniform float uSnowOn;\nvarying float vSnowUp;\nvarying float vSnowH;\n' + shader.fragmentShader
          .replace('#include <color_fragment>', '#include <color_fragment>\nfloat snowAmt = uSnowOn * ' + (strand
            ? 'smoothstep(0.84, 0.96, vUv.y) * 0.8'
            : 'smoothstep(0.05, 0.35, vSnowUp) * smoothstep(0.0, 0.08, vSnowH * 1.4 + (vSnowUp - 0.6) * 0.7 + 0.06 * sin(vUv.x * 23.0) + 0.04 * sin(vUv.x * 47.0 + 1.7))') +
            ';\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.96, 0.98, 1.0), snowAmt);\nif (uSnowOn > 0.5 && diffuseColor.a > 0.3) diffuseColor.a = 1.0;')   // (in Winter the blossom and its snow are solid, so the white snow on the ground never shows through them)
          .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance *= 1.0 - snowAmt;');
      };
      m.customProgramCacheKey = function () { return strand ? 'dawnStrandSnow' : 'dawnBlossomSnow'; };
      m.needsUpdate = true;
    }
    snowOnBlossom(blossomMat, false); snowOnBlossom(strandMat, true);
  })();
  var winterGreenNeedle = needleBatch.material.map, winterShown = null;
  // ===== a snowy island: the ground and the grass =====
  var winterSnowTex, winterSnowBump;
  (function () {                                                       // (snow: built from layers of soft, seamless noise, so it has gentle drifts with blue shadows
    var N = 512, img, bmp;                                             //  in the hollows, wind ripples, a fine powdery grain and glinting crystals, and never looks tiled)
    function lattice(p, seed) { var v = []; for (var i = 0; i < p * p; i++) v.push(springHash(i * 1.618 + seed * 97.3)); return v; }
    function noise(P, seed) {                                          // (smooth noise that wraps round at the edges, P cells across)
      var L = lattice(P, seed), out = new Float32Array(N * N);
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        var fx = x / N * P, fy = y / N * P, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
        tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty);
        var x1 = (ix + 1) % P, y1 = (iy + 1) % P;
        var a = L[iy * P + ix] + (L[iy * P + x1] - L[iy * P + ix]) * tx, b = L[y1 * P + ix] + (L[y1 * P + x1] - L[y1 * P + ix]) * tx;
        out[y * N + x] = a + (b - a) * ty;
      }
      return out;
    }
    var drift = [noise(3, 1), noise(6, 2), noise(12, 3)], ripple = noise(24, 4), fine = [noise(64, 5), noise(128, 6)];
    var H = new Float32Array(N * N);
    for (var i = 0; i < N * N; i++) {
      var y = Math.floor(i / N), x = i % N;
      var d = drift[0][i] * 0.5 + drift[1][i] * 0.3 + drift[2][i] * 0.2;
      var r = Math.sin((x * 0.9 + y * 0.35) / N * Math.PI * 2 * 18 + ripple[i] * 9) * 0.5 + 0.5;   // (wind ripples, wandering across the drifts)
      H[i] = d * 0.8 + r * 0.06 * (0.4 + d) + fine[0][i] * 0.08 + fine[1][i] * 0.06;
    }
    var cv = document.createElement('canvas'); cv.width = cv.height = N; var g = cv.getContext('2d'); img = g.createImageData(N, N);
    var bc = document.createElement('canvas'); bc.width = bc.height = N; var bg = bc.getContext('2d'); bmp = bg.createImageData(N, N);
    for (var j = 0; j < N * N; j++) {
      var jx = j % N, jy = Math.floor(j / N), hx = H[jy * N + (jx + 1) % N] - H[jy * N + (jx + N - 1) % N], hy = H[((jy + 1) % N) * N + jx] - H[((jy + N - 1) % N) * N + jx];
      var lit = Math.max(-1, Math.min(1, (-hx - hy) * 40));             // (light from up and to the left: slopes facing it bright, the far sides in soft blue shadow)
      var shade = 0.55 + lit * 0.45, hollow = Math.max(0, 0.55 - H[j]) * 0.9;
      var R = 250 - (1 - shade) * 52 - hollow * 46, G2 = 252 - (1 - shade) * 36 - hollow * 30, B = 255 - (1 - shade) * 12 - hollow * 6;
      var grain = (fine[1][j] - 0.5) * 6; R += grain; G2 += grain; B += grain;
      if (springHash(j * 0.731) > 0.9985) { R = G2 = B = 255; }           // (a glinting crystal)
      img.data[j * 4] = Math.max(0, Math.min(255, R)); img.data[j * 4 + 1] = Math.max(0, Math.min(255, G2)); img.data[j * 4 + 2] = Math.max(0, Math.min(255, B)); img.data[j * 4 + 3] = 255;
      var hv = Math.round(H[j] * 255); bmp.data[j * 4] = bmp.data[j * 4 + 1] = bmp.data[j * 4 + 2] = hv; bmp.data[j * 4 + 3] = 255;
    }
    g.putImageData(img, 0, 0); bg.putImageData(bmp, 0, 0);
    winterSnowTex = new THREE.CanvasTexture(cv); winterSnowBump = new THREE.CanvasTexture(bc);
    [winterSnowTex, winterSnowBump].forEach(function (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.08, 0.08); t.anisotropy = 8; });   // (one pattern about 22 m across, so the drifts are big and soft)
  })();
  var winterGround = { map: terrain.material.map, bump: terrain.material.bumpMap, bumpScale: terrain.material.bumpScale, rough: terrain.material.roughness };
  var WINTER_GRASS = new THREE.Color(0.78, 0.72, 0.52), winterBuried = [], winterBM = new THREE.Matrix4(), winterBP = new THREE.Vector3();
  function winterBury(on) {                                            // (most of the grass and all the wildflowers lie buried under the snow; a few dry tufts poke through)
    winterBuried.forEach(function (b) {
      if (b.mesh === grass || b.mesh === flowerHeads) { var t = tileMap[tileKey(Math.floor((b.p.x - FARM_X) / TILE), Math.floor((b.p.z - FARM_Z) / TILE))]; if (t && t.soil) { (t.grass = t.grass || []).push({ i: b.i, m: b.m, f: b.mesh === flowerHeads }); return; } }   // (dug into soil meanwhile: it stays tucked away with that tile)
      b.mesh.setMatrixAt(b.i, b.m); if (b.mesh === flowerHeads) flowerStems.setMatrixAt(b.i, b.m);
    });
    winterBuried = [];
    if (on) [grass, isle2Grass, isle3Grass, flowerHeads].forEach(function (mesh) {
      for (var i = 0; i < mesh.count; i++) {
        if (mesh !== flowerHeads && springHash(i * 0.917 + 3) > 0.82) continue;   // (about one tuft in six stays)
        mesh.getMatrixAt(i, winterBM); if (winterBM.elements[0] === 0 && winterBM.elements[5] === 0) continue;
        winterBuried.push({ mesh: mesh, i: i, m: winterBM.clone(), p: winterBP.setFromMatrixPosition(winterBM).clone() });
        mesh.setMatrixAt(i, hideM); if (mesh === flowerHeads) flowerStems.setMatrixAt(i, hideM);
      }
    });
    [grass, isle2Grass, isle3Grass, flowerHeads, flowerStems].forEach(function (m) { m.instanceMatrix.needsUpdate = true; });
    litterMat.visible = !on;
  }
  // ===== snowflakes =====
  var winterSnow = (function () {
    var N = 900, pos = new Float32Array(N * 3), seeds = [];
    for (var i = 0; i < N; i++) seeds.push({ x: (springHash(i * 3.3 + 7) - 0.5) * 34, y: springHash(i * 5.7 + 7) * 12, z: (springHash(i * 7.1 + 7) - 0.5) * 34, s: 0.5 + springHash(i * 2.2) * 0.6, w: springHash(i * 9.9) * 6.28 });
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var c = document.createElement('canvas'); c.width = c.height = 32; var x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32);
    var pts = new THREE.Points(g, new THREE.PointsMaterial({ map: new THREE.CanvasTexture(c), size: 0.09, transparent: true, depthWrite: false }));
    pts.frustumCulled = false; pts.visible = false; pts.userData.seeds = seeds; scene.add(pts); return pts;
  })();
  function winterSnowMove(dt) {
    var a = winterSnow.geometry.attributes.position, S = winterSnow.userData.seeds, cx = cam.target.x, cz = cam.target.z, t = state.time;
    S.forEach(function (s, i) {
      s.y -= dt * s.s; s.x += dt * Math.sin(t * 0.4 + s.w) * 0.25; s.z += dt * Math.cos(t * 0.3 + s.w) * 0.2;
      var wx = cx + ((s.x % 34) + 51) % 34 - 17, wz = cz + ((s.z % 34) + 51) % 34 - 17, gy = Math.max(groundHeight(wx, wz), WATER_Y);
      if (s.y < gy) s.y = gy + 10 + springHash(i + t) * 2;
      a.setXYZ(i, wx + Math.sin(t * 1.1 + s.w) * 0.2, s.y, wz);
    });
    a.needsUpdate = true;
  }
  // ===== snowmen =====
  var WINTER_MEN = [], winterMenGroup = new THREE.Group(); winterMenGroup.visible = false; scene.add(winterMenGroup);
  (function () {
    var mSnow = new THREE.MeshStandardMaterial({ map: winterSnowTex, color: 0xffffff, roughness: 0.9 }), mCoal = new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.6 });
    var mCarrot = new THREE.MeshStandardMaterial({ color: 0xf08a24, roughness: 0.6 }), mStick = new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.9 }), mHat = new THREE.MeshStandardMaterial({ color: 0x2a2228, roughness: 0.7 });
    var SCARVES = [0xd8302c, 0x3a7ac8, 0x5aa84a, 0x9a5ac8];
    for (var c = 0, tries = 0; c < 4 && tries < 3000; tries++) {
      var x = HOUSE_X - 14 + springHash(tries * 2.9 + 11) * 28, z = HOUSE_Z + 6 + springHash(tries * 4.1 + 3) * 22;
      if (!springFlowerSpot(x, z, 0.8) || WINTER_MEN.some(function (q) { return dist(q.x, q.z, x, z) < 6; })) continue;
      c++; var G = new THREE.Group(), y = groundHeight(x, z); G.position.set(x, y, z); G.rotation.y = Math.atan2(HOUSE_X - x, HOUSE_Z + 12 - z) + Math.PI + (springHash(c) - 0.5) * 0.8; winterMenGroup.add(G); WINTER_MEN.push({ x: x, z: z });
      var mScarf = new THREE.MeshStandardMaterial({ color: SCARVES[c % 4], roughness: 0.9 }), mStripe = new THREE.MeshStandardMaterial({ color: 0xf6f0e4, roughness: 0.9 });
      [[0.34, 0.3], [0.25, 0.84], [0.18, 1.22]].forEach(function (b, k) { var m = cpPart(new THREE.SphereGeometry(b[0], 20, 14), mSnow, 0, b[1], 0, 0, 0, 0, G); m.scale.set(1, k === 0 ? 0.88 : 0.92, 1); });
      cpPart(new THREE.CylinderGeometry(0.36, 0.42, 0.06, 20), mSnow, 0, 0.03, 0, 0, 0, 0, G);   // (packed snow round its foot)
      [-1, 1].forEach(function (s) { cpPart(new THREE.SphereGeometry(0.022, 8, 6), mCoal, s * 0.06, 1.27, 0.16, 0, 0, 0, G); });   // (coal eyes)
      for (var m = 0; m < 5; m++) { var a = -0.55 + m * 0.275; cpPart(new THREE.SphereGeometry(0.013, 6, 4), mCoal, Math.sin(a) * 0.12, 1.16 - Math.cos(a) * 0.035, 0.155, 0, 0, 0, G); }   // (a smile)
      cpPart(new THREE.ConeGeometry(0.03, 0.17, 10), mCarrot, 0, 1.22, 0.25, Math.PI / 2, 0, 0, G);   // (carrot nose)
      [0.95, 0.78, 0.62].forEach(function (yy) { cpPart(new THREE.SphereGeometry(0.03, 8, 6), mCoal, 0, yy, 0.24 - Math.abs(yy - 0.8) * 0.2, 0, 0, 0, G); });   // (buttons)
      [-1, 1].forEach(function (s) {                                   // (stick arms, with little forked twigs at the ends)
        var arm = new THREE.Group(); arm.position.set(s * 0.22, 0.92, 0); arm.rotation.z = s * (0.7 + springHash(c * 3 + s) * 0.4); G.add(arm);
        cpPart(new THREE.CylinderGeometry(0.012, 0.016, 0.5, 6), mStick, 0, 0.25, 0, 0, 0, 0, arm);
        [-0.5, 0.5].forEach(function (f) { cpPart(new THREE.CylinderGeometry(0.006, 0.008, 0.12, 5), mStick, f * 0.04, 0.5, 0, 0, 0, f, arm); });
      });
      cpPart(new THREE.TorusGeometry(0.18, 0.045, 8, 22), mScarf, 0, 1.06, 0, Math.PI / 2, 0, 0, G);   // (a striped scarf, with its tail hanging)
      for (var st = 0; st < 3; st++) cpPart(new THREE.BoxGeometry(0.09, 0.02, 0.025), mStripe, 0.12, 0.92 - st * 0.07, 0.15, 0, 0, 0.1, G);
      cpPart(new THREE.BoxGeometry(0.09, 0.26, 0.025), mScarf, 0.12, 0.88, 0.14, 0, 0, 0.1, G);
      if (c % 2) { cpPart(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 20), mHat, 0, 1.37, 0, 0, 0, 0, G); cpPart(new THREE.CylinderGeometry(0.12, 0.13, 0.2, 18), mHat, 0, 1.47, 0, 0, 0, 0, G); cpPart(new THREE.CylinderGeometry(0.131, 0.131, 0.04, 18), mScarf, 0, 1.4, 0, 0, 0, 0, G); }   // (a top hat with a band)
      else { cpPart(new THREE.SphereGeometry(0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mScarf, 0, 1.3, 0, 0, 0, 0, G); cpPart(new THREE.TorusGeometry(0.165, 0.03, 6, 20), mStripe, 0, 1.31, 0, Math.PI / 2, 0, 0, G); cpPart(new THREE.SphereGeometry(0.055, 10, 8), mStripe, 0, 1.48, 0, 0, 0, 0, G); }   // (or a bobble hat)
    }
  })();
  // ===== snow on the roofs: on everything up high that faces the sky (roofs, chimneys, lamp tops, the tops of big rocks) =====
  var winterRoofSkip = null, winterRoofT = -99;
  var wsBox = new THREE.Box3(), wsV = new THREE.Vector3(), wsM = new THREE.Matrix4(), wsC = new THREE.Vector3();
  function winterSlabOf(size, M) {                                     // (1 if a box of this size, placed by matrix M, lies flat-ish up high)
    var e = M.elements, d = [size.x * Math.hypot(e[0], e[1], e[2]), size.y * Math.hypot(e[4], e[5], e[6]), size.z * Math.hypot(e[8], e[9], e[10])];
    var order = [0, 1, 2].sort(function (a, b) { return d[a] - d[b]; });
    if (!(d[order[0]] < 0.4 * d[order[1]])) return 0;
    var k = order[0] * 4, ay = e[k + 1] / (Math.hypot(e[k], e[k + 1], e[k + 2]) || 1);
    wsBox.getCenter(wsC).applyMatrix4(M);
    return Math.abs(ay) >= 0.5 && wsC.y >= 1.4 ? 1 : 0;              // (walls stand upright, and low things are left alone)
  }
  function winterSlab(o) {                                             // (a roof tile, shingle or roof board lies flat-ish up high: its edges take snow too, so the tiles don't show through)
    var g = o.geometry; if (!g || o.userData.slabDone || !g.attributes.position) return;
    o.userData.slabDone = true; o.updateMatrixWorld(true);
    if (!g.boundingBox) g.computeBoundingBox();
    wsBox.copy(g.boundingBox); var size = wsBox.getSize(new THREE.Vector3());
    if (o.isInstancedMesh) {                                           // (each piece in a batch on its own: shingles and battens can share one box)
      var vals = new Float32Array(o.count), any = 0, im = new THREE.Matrix4();
      for (var i = 0; i < o.count; i++) { o.getMatrixAt(i, im); vals[i] = winterSlabOf(size, wsM.multiplyMatrices(o.matrixWorld, im)); any += vals[i]; }
      if (!any) return;
      o.geometry = g.clone(); o.geometry.setAttribute('snowSlab', new THREE.InstancedBufferAttribute(vals, 1));
      return;
    }
    var slab = winterSlabOf(size, o.matrixWorld);
    if (!slab) return;
    if (g.attributes.snowSlab) return;                                 // (shared with another piece that already decided)
    var arr = new Float32Array(g.attributes.position.count); arr.fill(1);
    g.setAttribute('snowSlab', new THREE.BufferAttribute(arr, 1));
  }
  function winterRoofPatch() {
    if (!winterRoofSkip) {                                             // (not on you, the ground, the grass, the trees' own foliage or the water)
      winterRoofSkip = new Set([terrain.material, grassMat, leafBatch.material, needleBatch.material, litterMat, barkMat, pineBarkMat, rootMat, pineRootMat]);
      player.traverse(function (o) { if (o.material) [].concat(o.material).forEach(function (m) { winterRoofSkip.add(m); }); });
    }
    scene.traverse(function (o) {
      if (!o.isMesh || !o.material) return;
      winterSlab(o);
      [].concat(o.material).forEach(function (m) {
        if (!m || m.userData.snowy || winterRoofSkip.has(m) || m.transparent || !(m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial)) return;
        m.userData.snowy = true;
        var before = m.onBeforeCompile, key = before ? before.toString() : '';
        m.customProgramCacheKey = function () { return key + '|roofsnow'; };
        m.onBeforeCompile = function (shader) {
          if (before) before.call(this, shader);
          shader.uniforms.uSnowOn = winterSnowOn;
          shader.vertexShader = 'varying float vSnowY;\nvarying vec2 vSnowXZ;\nattribute float snowSlab;\nvarying float vSnowSlab;\n' + shader.vertexShader.replace('#include <project_vertex>', [
            '#include <project_vertex>',
            'vec4 snowP = vec4(transformed, 1.0);',
            '#ifdef USE_INSTANCING', 'snowP = instanceMatrix * snowP;', '#endif',
            'vec4 snowW = modelMatrix * snowP; vSnowY = snowW.y; vSnowXZ = snowW.xz; vSnowSlab = snowSlab;'
          ].join('\n'));
          shader.fragmentShader = 'uniform float uSnowOn;\nvarying float vSnowY;\nvarying vec2 vSnowXZ;\nvarying float vSnowSlab;\nfloat snowHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\nfloat snowNoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(snowHash(i), snowHash(i + vec2(1.0, 0.0)), f.x), mix(snowHash(i + vec2(0.0, 1.0)), snowHash(i + vec2(1.0, 1.0)), f.x), f.y); }\n' + shader.fragmentShader.replace('#include <normal_fragment_maps>', [
            '#include <normal_fragment_maps>',
            'vec3 roofUp = normalize((vec4(normal, 0.0) * viewMatrix).xyz);',
            'float snowPatch = snowNoise(vSnowXZ * 1.6) * 0.65 + snowNoise(vSnowXZ * 5.0) * 0.35;',   // (just a little: soft patches here and there, and a light dusting between)
            'float snowUpMin = mix(0.3, -1.5, step(0.5, vSnowSlab));',   // (on roof tiles, every side of them, so no edges show through)
            'float roofSnow = smoothstep(snowUpMin, snowUpMin + 0.3, roofUp.y) * smoothstep(1.3, 1.8, vSnowY) * uSnowOn * smoothstep(0.55, 0.6, snowPatch);',   // (solid patches with a soft edge: no tiles showing through)
            'float snowLump = snowNoise(vSnowXZ * 6.0) * 0.6 + snowNoise(vSnowXZ * 14.0) * 0.3 + snowNoise(vSnowXZ * 30.0) * 0.1;',   // (lumpy: soft mounds lit on top, blue-grey in the dips)
            'float snowLit = snowNoise(vSnowXZ * 6.0 + vec2(0.05, 0.05)) * 0.6 + snowNoise(vSnowXZ * 14.0 + vec2(0.025, 0.025)) * 0.3 + snowNoise(vSnowXZ * 30.0 + vec2(0.01, 0.01)) * 0.1;',
            'float snowShade = clamp(0.7 + (snowLump - snowLit) * 3.0 + (snowLump - 0.5) * 0.5, 0.0, 1.0);',
            'float snowEdge = smoothstep(0.55, 0.62, snowPatch) * (1.0 - smoothstep(0.62, 0.74, snowPatch));',   // (a little blue shadow round the edge of each patch, where it's thin)
            'vec3 snowCol = mix(vec3(0.74, 0.8, 0.9), vec3(0.95, 0.97, 1.0), snowShade) - snowEdge * vec3(0.12, 0.08, 0.02);',
            'diffuseColor.rgb = mix(diffuseColor.rgb, snowCol, roofSnow);',
            'float snowL0 = snowNoise(vSnowXZ * 6.0) * 0.7 + snowNoise(vSnowXZ * 14.0) * 0.3;',   // (the snow's own lumps, tilting its surface so the light picks them out)
            'float snowLx = snowNoise((vSnowXZ + vec2(0.03, 0.0)) * 6.0) * 0.7 + snowNoise((vSnowXZ + vec2(0.03, 0.0)) * 14.0) * 0.3;',
            'float snowLz = snowNoise((vSnowXZ + vec2(0.0, 0.03)) * 6.0) * 0.7 + snowNoise((vSnowXZ + vec2(0.0, 0.03)) * 14.0) * 0.3;',
            'vec3 snowTilt = (viewMatrix * vec4(-(snowLx - snowL0) * 7.0, 0.0, -(snowLz - snowL0) * 7.0, 0.0)).xyz;',
            'vec3 snowUpV = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);',   // (a patch is lit as one smooth blanket, whatever is under it)
            'normal = normalize(mix(normal, snowUpV, roofSnow) + snowTilt * roofSnow);'
          ].join('\n')).replace('#include <dithering_fragment>', '#include <dithering_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, snowCol * 0.97, roofSnow * 0.7);');   // (and kept bright and solid, even in shadow)
        };
        m.needsUpdate = true;
      });
    });
  }
  // ===== cool, silvery winter light =====
  var WINTER_SKY = new THREE.Color(0xc4d6ea), WINTER_SUN = new THREE.Color(0xdde8ff);
  var winterBaseSky = updateSky;
  updateSky = function () {
    var night = winterBaseSky.apply(this, arguments);
    if (winterNow()) { var day = Math.max(0, 1 - night * 1.6); scene.background.lerp(WINTER_SKY, 0.55 * day); scene.fog.color.copy(scene.background); sun.color.lerp(WINTER_SUN, 0.55 * day); hemi.intensity *= 1 + 0.15 * day; }
    return night;
  };
  // ===== every frame =====
  function updateWinter(dt) {
    var on = winterNow();
    if (winterShown !== on) {                                          // (the snow comes, or melts away)
      winterShown = on;
      leafBatch.visible = !on; winterSnowOn.value = on ? 1 : 0;                                         // (the broadleaf trees and bushes lose their leaves; the pines keep theirs)
      needleBatch.material.map = on ? winterNeedleTex : winterGreenNeedle; needleBatch.material.needsUpdate = true;
      terrain.material.map = on ? winterSnowTex : winterGround.map; terrain.material.bumpMap = on ? winterSnowBump : winterGround.bump; terrain.material.bumpScale = on ? 0.06 : winterGround.bumpScale; terrain.material.roughness = on ? 0.82 : winterGround.rough; terrain.material.vertexColors = !on; terrain.material.needsUpdate = true;
      grassMat.vertexColors = !on; grassMat.needsUpdate = true;
      winterBury(on); if (on) { winterRoofPatch(); winterRoofT = state.time; }
      winterMenGroup.visible = on;
    }
    if (on) {
      if (state.time - winterRoofT > 4) { winterRoofT = state.time; winterRoofPatch(); }   // (and on anything built since, like a new coop or barn)
      grassMat.color.copy(WINTER_GRASS); terrain.material.color.setRGB(1, 1, 1);
    }
    var snowing = on && !indoors;
    if (winterSnow.visible !== snowing) winterSnow.visible = snowing;
    if (snowing) winterSnowMove(dt);
  }

  // No lone pink lily buds poking up out of the lake: only the pads and the open flowers stay
  scene.children.filter(function (o) { return o.isMesh && o.geometry === lilyPetalGeo && o.material === lilyPink; }).forEach(function (bud) { scene.remove(bud); });

  // Stamina: hitting exactly 0 is fine, you're just worn out. Only going past it, into the negatives, makes you pass out
  useStamina = function (n) {
    state.stamina -= n;
    if (state.stamina < -1e-6) state.stamina = -(2 + Math.floor(Math.random() * 4));   // (overdo it, and you go a couple of points into the negatives: -2 to -5)
    else if (state.stamina < 1e-6) state.stamina = 0;
    if (state.stamina <= 60 && !tiredWarned) { tiredWarned = true; showToast('You\'re getting tired… eat a moonbloom or head to bed 🌙', 2600); }
  };
  updateStamina = function () {
    if (ui.stamina) ui.stamina.style.width = (Math.max(0, state.stamina) / MAX_STAMINA * 100).toFixed(1) + '%';
    var stText = Math.ceil(state.stamina - 0.001) + ' / ' + MAX_STAMINA;
    if (ui.staminaNum) ui.staminaNum.style.color = state.stamina < 0 ? '#e0304a' : '';   // (shown in red while you're in the negatives)
    if (ui.staminaNum && ui.staminaNum.textContent !== stText) ui.staminaNum.textContent = stText;
    if (state.stamina < 0 && !passingOut && !sleeping) passOut();
    updateBedtime();
  };

  // ---------- Fluff & Feather's own animals, on display ----------
  // One in each of the shop's three stalls, to show you what you could take home: Blossom, a pink Glimmerwing; Marina, a
  // Sirenna; and Starla, a Lunastra. They belong to the shop, so they aren't yours to feed, pet or take home
  var abDisplay = [];
  function abDisplayFree(g) { return !glimmers.some(function (q) { return q.stall === g.stall; }); }   // (an animal of yours still in that stall from long ago comes first)
  [['glim', 'Blossom'], ['bubble', 'Marina'], ['luna', 'Starla']].forEach(function (d, k) {
    var g = glimAdd({ kind: d[0], name: d[1], stall: k, pal: 0 });     // (pal 0: the pink Glimmerwing)
    glimmers.splice(glimmers.indexOf(g), 1); g.display = true; abDisplay.push(g);
    var c = g.m.tagCv.getContext('2d'), w = 256, h = 96;               // (its little sign: its name, and that it's on display)
    c.clearRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.88)'; c.beginPath(); c.moveTo(24, 6); c.lineTo(w - 24, 6); c.quadraticCurveTo(w - 4, 6, w - 4, 26); c.lineTo(w - 4, h - 26); c.quadraticCurveTo(w - 4, h - 6, w - 24, h - 6); c.lineTo(24, h - 6); c.quadraticCurveTo(4, h - 6, 4, h - 26); c.lineTo(4, 26); c.quadraticCurveTo(4, 6, 24, 6); c.fill();
    c.strokeStyle = '#c8a8f0'; c.lineWidth = 3; c.stroke();
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#5a3d9a'; c.font = 'bold 28px Fredoka, sans-serif'; c.fillText(d[1], w / 2, 34);
    c.fillStyle = '#a07ad0'; c.font = 'bold 17px Fredoka, sans-serif'; c.fillText('✧ On display ✧', w / 2, 66);
    g.m.tagTex.needsUpdate = true;
  });

  // The clock's little sky icons, written as codes so they always show properly, however the page is read
  clockText = function (totalMinutes) {
    var hour = Math.floor(totalMinutes / 60), minute = Math.floor((totalMinutes % 60) / 10) * 10;
    var icon = hour >= 5 && hour < 8 ? '\u263C' : hour >= 8 && hour < 17 ? '\u2600' : hour >= 17 && hour < 20 ? '\u263E' : '\u2605';
    if (clock24) return icon + ' ' + twoDigits(hour) + ':' + twoDigits(minute);   // ("Game Time Hour Format" set to 24 Hour: 13:00 rather than 1:00 PM)
    var hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return icon + ' ' + hour12 + ':' + twoDigits(minute) + ' ' + (hour < 12 ? 'AM' : 'PM');
  };
  // A tree, bush or rock you've cut down or broken doesn't get in your way again until it has grown back halfway
  // Past halfway it gets in your way bit by bit as it grows, never all at once, and never while you're standing on it
  function markYoungScenery() {
    function grow(sd, regrowing, k, full) {
      var young = regrowing && k < 0.5;
      if (regrowing && k >= 0.5) sd.r = full * Math.min(1, (k - 0.5) * 2);   // (from nothing at halfway to all of it once it's fully grown)
      if (!young && sd.young && !indoors && !flying && Math.hypot(player.position.x - sd.x, player.position.z - sd.z) < full + 0.45) young = true;   // (you're right there: it waits until you step away)
      sd.young = young;
    }
    allScenery.forEach(function (t) {
      var u = t.userData, at = u.base || t.position;
      if (Math.abs(at.x - u.solid.x) > 0.5 || Math.abs(at.z - u.solid.z) > 0.5) return;   // (only the tree or bush that's really standing on this spot counts)
      grow(u.solid, u.state === 'regrowing', u.shownK, u.solidR);
    });
    mineable.forEach(function (r) { grow(r.solid, r.state === 'regrowing', r.shownK, r.solidR); });
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
    saveName = data.name || '';                                       // (keeping its name for the next save)
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
    coopLoadData(data.coop || null);                                  // your coop (none in older saves)
    fbarnLoadData(data.fbarn || null);                                // your barn (likewise)
    millLoadData(data.mill || null);                                  // and your mill
    siloLoadData(data.silo || null);                                  // and your silo, with its hay
    homeMigrate(true);                                                // (anyone still at Fluff & Feather moves home, if there's room)
    tiles.forEach(function (tile) { if (tile.soil) coverGrass(tile); }); // grass stays tucked under your soil
    flushDirty();
    // and you: back outside if you were in the house, standing where you saved
    if (indoors) {
      indoors = false;
      inShop = false;
      inClinic = false;
      inBarn = false;
      inCarp = inCoop = inFbarn = false;
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
  function saveLoadSafely(what, fn) {                                  // (if saving or loading ever goes wrong, say what happened instead of doing nothing)
    try { fn(); } catch (err) { showToast((what === 'save' ? 'Saving' : 'Loading') + ' went wrong: ' + (err && err.message ? err.message : err) + '.', 9000); if (window.console) console.error(err); }
  }
  document.getElementById('btnSave').addEventListener('click', function () { saveLoadSafely('save', saveGame); focusGame(); });
  document.getElementById('btnLoad').addEventListener('click', function () { saveLoadSafely('load', loadGame); focusGame(); });

  // ---------- The fireplace in the house, in real gray brick ----------
  // The piers, the arch, the hearth and the chimney breast are laid in gray brick: each brick its own shade of gray
  // (some cooler, some warmer, a few dark), with worn, chipped edges and a little speckle, set in pale mortar that sits
  // back from the bricks, so the light catches their edges. The bricks are laid by their real size, so they're the same
  // size on every face, in courses that run level all the way round, each course offset by half a brick
  (function () {
    var BW = 0.22, BH = 0.075, TW = BW * 4, TH = BH * 4;               // (a brick, and one picture of 4 x 4 of them)
    function brickPaint(bump) {
      var cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; var g = cv.getContext('2d'), r, c, k;
      g.fillStyle = bump ? '#202020' : '#b9b6b1'; g.fillRect(0, 0, 512, 256);   // (the mortar)
      if (!bump) for (k = 0; k < 900; k++) { g.fillStyle = 'rgba(' + (Math.random() < 0.5 ? '90,88,86' : '220,218,212') + ',.25)'; g.fillRect(Math.random() * 512, Math.random() * 256, 1.5, 1.5); }
      for (r = 0; r < 4; r++) for (c = -1; c < 5; c++) {
        var x = c * 128 + (r % 2) * 64 + 5, y = r * 64 + 5, w = 118, h = 54, sd = Math.sin(r * 12.9 + c * 78.2) * 43758.5, rr = sd - Math.floor(sd);
        if (bump) { g.fillStyle = '#d8d8d8'; } else {
          var base = 108 + Math.floor(rr * 46) - (rr > 0.9 ? 40 : 0), tint = Math.floor((rr * 7) % 3) - 1;   // (each brick its own gray, a few cooler, a few warmer, now and then a dark one)
          g.fillStyle = 'rgb(' + (base + tint * 5) + ',' + (base + 1) + ',' + (base - tint * 6 + 3) + ')';
        }
        g.beginPath(); g.moveTo(x + 3, y); g.lineTo(x + w - 2, y + 1); g.lineTo(x + w, y + 4); g.lineTo(x + w - 1, y + h - 2); g.lineTo(x + w - 4, y + h); g.lineTo(x + 2, y + h - 1); g.lineTo(x, y + h - 4); g.lineTo(x + 1, y + 3); g.closePath(); g.fill();   // (a brick, its corners a little worn)
        if (bump) continue;
        var gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, 'rgba(255,255,255,.16)'); gr.addColorStop(0.25, 'rgba(255,255,255,0)'); gr.addColorStop(0.8, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.22)'); g.fillStyle = gr; g.fillRect(x, y, w, h);   // (light on its top edge, shade along its bottom)
        for (k = 0; k < 140; k++) { g.fillStyle = 'rgba(' + (Math.random() < 0.55 ? '60,58,58' : '235,233,228') + ',' + (0.15 + Math.random() * 0.25) + ')'; g.fillRect(x + Math.random() * w, y + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 1.5); }   // (speckle in the clay)
        for (k = 0; k < 3; k++) { var ex = x + Math.random() * w, ey = Math.random() < 0.5 ? y : y + h - 3; g.fillStyle = '#9d9a95'; g.beginPath(); g.arc(ex, ey + 1.5, 2 + Math.random() * 3, 0, Math.PI * 2); g.fill(); }   // (little chips out of its edges)
      }
      var t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (!bump && renderer.outputEncoding === THREE.sRGBEncoding) t.encoding = THREE.sRGBEncoding; return t;
    }
    R.stone.map = brickPaint(false); R.stone.bumpMap = brickPaint(true); R.stone.bumpScale = 0.025; R.stone.color.set(0xffffff); R.stone.roughness = 0.92; R.stone.needsUpdate = true;
    var n = new THREE.Vector3(), wp = new THREE.Vector3();
    room.traverse(function (o) {                                       // (lay the bricks by their real size: each face takes them flat on, from wherever it is in the room)
      if (!o.isMesh || o.material !== R.stone) return;
      o.updateMatrixWorld(true); var g = o.geometry, pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv, nm = new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
      for (var i = 0; i < pos.count; i++) {
        wp.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
        var ax = Math.abs(n.x), ay = Math.abs(n.y), az = Math.abs(n.z);
        if (ay > ax && ay > az) uv.setXY(i, wp.x / TW, wp.z / TH);        // (tops and undersides)
        else if (ax > az) uv.setXY(i, wp.z / TW, wp.y / TH);              // (faces turned sideways)
        else uv.setXY(i, wp.x / TW, wp.y / TH);                           // (faces looking into the room)
      }
      uv.needsUpdate = true;
    });
  })();

  // ---------- The farmhouse windows look out on the real island ----------
  // Like the windows at the shops, the two arched windows in your house now show the actual outside instead of a
  // painted twilight sky: each frame while you're home, the island is drawn from the spot outside that matches where
  // you're standing in the room (the room's middle lined up with the middle of the house, its door wall with the
  // house's front), with the house itself left out of the way, and the window panes show that picture. So you see the
  // real time of day and weather, the season, your farm and garden, and the sky going dark at night
  var houseViewMap = new THREE.Matrix4().makeTranslation(HOUSE_X, 0, HOUSE_Z).multiply(new THREE.Matrix4().makeRotationY(HOUSE_TURN)).multiply(new THREE.Matrix4().makeTranslation(-IN_X, 0, -IN_Z));
  var houseJoined = scene.children.filter(function (o) {             // (the house's walls and roof, joined into a few big meshes that sit right in the island)
    if (!o.isMesh || !o.geometry) return false; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); var c = o.geometry.boundingBox.getCenter(new THREE.Vector3());
    return Math.abs(c.x - HOUSE_X) < 6 && Math.abs(c.z - HOUSE_Z) < 5 && Object.keys(houseMats).some(function (k) { return houseMats[k] === o.material; });
  });
  function drawHouseView() {
    renderer.getDrawingBufferSize(shopViewSize);
    if (shopViewTarget.width !== shopViewSize.x || shopViewTarget.height !== shopViewSize.y) shopViewTarget.setSize(shopViewSize.x, shopViewSize.y);
    siWindowMask.uniforms.uSize.value.copy(shopViewSize);
    shopViewCam.projectionMatrix.copy(camera.projectionMatrix); shopViewCam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    shopViewCam.matrix.multiplyMatrices(houseViewMap, camera.matrixWorld);
    shopViewCam.updateMatrixWorld(true);
    house.visible = false; houseJoined.forEach(function (o) { o.visible = false; });   // (you're inside it, so its own outside walls stay out of the way)
    renderer.setRenderTarget(shopViewTarget);
    renderer.render(scene, shopViewCam);
    renderer.setRenderTarget(null);
    house.visible = true; houseJoined.forEach(function (o) { o.visible = true; });
  }
  room.traverse(function (o) { if (o.isMesh && o.material === paneMat) { o.material = siWindowMask; o.castShadow = o.receiveShadow = false; } });   // (the panes show the view)
  // The windows match inside and out: the front of the house has two square windows either side of the door and a round
  // one toward each end, so the room's front wall (the door wall) gets them too, the square ones as arched windows with
  // curtains like the others in here, and the round ones in round frames; and the room's back wall has an arched window,
  // so the back of the house gets one to match. They all look out on the real island
  function houseWindowIn(wall, x) {                                    // (an arched window like the others in the room: frame, glazing bars, deep sill, curtains)
    var wg = new THREE.Group(); wg.position.set(x, 1.85, 0.02); inWalls[wall].g.add(wg);
    var outer = winArch(WIN_W + 0.16, WIN_H + 0.16, ARCH + 0.06); outer.holes.push(winArch(WIN_W, WIN_H, ARCH));
    iPart(new THREE.ExtrudeGeometry(outer, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 }), winFrame, 0, 0, 0, 0, 0, 0, wg);
    iPart(new THREE.ShapeGeometry(winArch(WIN_W, WIN_H, ARCH)), siWindowMask, 0, 0, 0.005, 0, 0, 0, wg).castShadow = false;
    iPart(new THREE.BoxGeometry(0.035, WIN_H + ARCH * 0.3, 0.04), winFrame, 0, 0.04, 0.04, 0, 0, 0, wg);
    [-0.18, 0.18].forEach(function (by) { iPart(new THREE.BoxGeometry(WIN_W, 0.035, 0.04), winFrame, 0, by, 0.04, 0, 0, 0, wg); });
    iPart(new THREE.BoxGeometry(WIN_W + 0.36, 0.06, 0.2), winFrame, 0, -WIN_H / 2 - 0.1, 0.1, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(WIN_W + 0.2, 0.08, 0.05), winFrame, 0, -WIN_H / 2 - 0.16, 0.04, 0, 0, 0, wg);
    var ROD_Y = WIN_H / 2 + ARCH * 0.35 + 0.18, ROD_W = WIN_W + 0.6;
    iPart(new THREE.CylinderGeometry(0.018, 0.018, ROD_W, 8), R.gold, 0, ROD_Y, 0.16, 0, 0, Math.PI / 2, wg);
    [-1, 1].forEach(function (sd) {
      iPart(new THREE.SphereGeometry(0.04, 10, 8), R.gold, sd * ROD_W / 2, ROD_Y, 0.16, 0, 0, 0, wg);
      iPart(new THREE.BoxGeometry(0.03, 0.03, 0.14), R.gold, sd * (ROD_W / 2 - 0.1), ROD_Y, 0.09, 0, 0, 0, wg);
      var CW = 0.34, CH = ROD_Y + WIN_H / 2 + 0.3, cg = new THREE.PlaneGeometry(CW, CH, 16, 24), cp = cg.attributes.position;
      for (var ci = 0; ci < cp.count; ci++) {
        var u = cp.getX(ci) / CW + 0.5, v = 1 - (cp.getY(ci) / CH + 0.5), tie = 0.62, gather = v < tie ? 1 - 0.55 * Math.pow(v / tie, 1.6) : 0.45 + 0.4 * Math.pow((v - tie) / (1 - tie), 0.8);
        cp.setXYZ(ci, (u - 0.5) * CW * gather - sd * (1 - gather) * 0.1, cp.getY(ci), Math.sin(u * Math.PI * 6) * 0.025 * (0.6 + gather * 0.5));
      }
      cg.computeVertexNormals();
      var cx = sd * (WIN_W / 2 + 0.12);
      iPart(cg, curtainMat, cx, ROD_Y - CH / 2, 0.13, 0, 0, 0, wg);
      iPart(new THREE.TorusGeometry(0.06, 0.016, 6, 14), R.gold, cx - sd * 0.08, ROD_Y - CH * 0.62, 0.16, 0, Math.PI / 2, 0, wg);
      for (var rr = 0; rr < 4; rr++) iPart(new THREE.TorusGeometry(0.026, 0.006, 5, 10), R.gold, cx + (rr - 1.5) * 0.08, ROD_Y, 0.16, 0, Math.PI / 2, 0, wg);
    });
    var vg = new THREE.PlaneGeometry(ROD_W - 0.1, 0.2, 30, 3), vp = vg.attributes.position;
    for (var vi = 0; vi < vp.count; vi++) { var vx = vp.getX(vi), vy = vp.getY(vi); vp.setXYZ(vi, vx, vy + (vy < -0.05 ? -0.04 * Math.abs(Math.sin(vx * Math.PI / 0.27)) : 0), Math.sin(vx * 40) * 0.015); }
    vg.computeVertexNormals();
    iPart(vg, curtainMat, 0, ROD_Y - 0.06, 0.18, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(ROD_W - 0.1, 0.025, 0.02), curtainLining, 0, ROD_Y + 0.04, 0.18, 0, 0, 0, wg);
  }
  function houseRoundIn(wall, x) {                                     // (a round window: the view, in a round painted frame with a cross of glazing bars and a little ledge)
    var wg = new THREE.Group(); wg.position.set(x, 1.85, 0.02); inWalls[wall].g.add(wg);
    iPart(new THREE.CircleGeometry(0.34, 24), siWindowMask, 0, 0, 0.005, 0, 0, 0, wg).castShadow = false;
    iPart(new THREE.TorusGeometry(0.37, 0.06, 8, 28), winFrame, 0, 0, 0.03, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(0.035, 0.68, 0.035), winFrame, 0, 0, 0.03, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(0.68, 0.035, 0.035), winFrame, 0, 0, 0.03, 0, 0, 0, wg);
    iPart(new THREE.BoxGeometry(0.62, 0.05, 0.16), winFrame, 0, -0.46, 0.08, 0, 0, 0, wg);
  }
  houseWindowIn('S', -1.55); houseWindowIn('S', 1.55);                // (the front wall: the door wall, seen from inside, so the outside's left is in here on the right)
  houseRoundIn('S', -2.95); houseRoundIn('S', 2.95);
  windowAt(1.05, FOOT_H + 1.35, -FRONT - 0.02, Math.PI);              // (and outside, a window in the back wall where the room's back window is)
  house.add(houseStatic.children[houseStatic.children.length - 1]);  // (the house's other still parts were joined up long ago, so this one goes straight on the house)

  // ---------- Save slots ----------
  // The title screen has five save slots. Picking one decides which slot the Save and Load buttons use (slot 1 is
  // where your game was always saved, so an old save turns up there). A slot with a game in it is loaded the moment
  // the title screen has gone; an empty one starts a new game there and saves it straight away, so it's waiting for
  // you next time. Once you're playing, your game also saves itself whenever you leave or close the page
  var afterTitle = null, slotPicked = false, saveName = '';
  window.everdawnPickSlot = function (n, fresh, name) {
    SAVE_KEY = 'everdawn-save-' + n; slotPicked = true; if (fresh) saveName = name || '';
    try { localStorage.setItem('everdawn-last-slot', String(n)); } catch (err) {}
    afterTitle = function () { saveLoadSafely(fresh ? 'save' : 'load', fresh ? function () { saveGame(true); } : loadGame); };
  };
  function autoSave() { if (slotPicked && !window.EVERDAWN_TITLE) { try { saveGame(true); } catch (err) {} } }
  window.addEventListener('pagehide', autoSave);
  document.addEventListener('visibilitychange', function () { if (document.hidden) autoSave(); });

  // ---------- Camera zoom, set by the "Adjust Camera Zoom" slider in Settings ----------
  // You can't zoom with the mouse wheel or by pinching; instead the slider sets how far the camera sits from you
  // (6 close up to 26 far away), and it's remembered. Inside a building the camera keeps its own distance, and yours
  // comes back when you step outside
  var ZOOM_KEY = 'everdawn-zoom';
  try { var zoomSaved = parseFloat(localStorage.getItem(ZOOM_KEY)); if (zoomSaved >= 6 && zoomSaved <= 26) cam.dist = zoomSaved; } catch (err) {}
  window.everdawnSetZoom = function (d) {
    d = THREE.MathUtils.clamp(d, 6, 26);
    if (indoors) { if (outsideCam) outsideCam.dist = d; } else cam.dist = d;
    try { localStorage.setItem(ZOOM_KEY, String(d)); } catch (err) {}
  };

  // ---------- Movement type, set in Settings: Walk or Jog ----------
  // Walking is your usual pace; jogging is a little quicker (about a third faster), with quicker steps to match.
  // It's remembered. Flying on your broom stays the same either way
  var WALK_SPEED = SPEED, JOG_SPEED = SPEED * 1.35, MOVE_KEY = 'everdawn-move';
  function setMove(type) { SPEED = type === 'jog' ? JOG_SPEED : WALK_SPEED; }
  try { setMove(localStorage.getItem(MOVE_KEY)); } catch (err) {}
  window.everdawnSetMove = function (type) { setMove(type); try { localStorage.setItem(MOVE_KEY, type === 'jog' ? 'jog' : 'walk'); } catch (err) {} };

  // ---------- Game time speed, set by the "Game Time Speed" slider in Settings ----------
  // 50% is the usual pace (every 10 in-game minutes take 11 real seconds); 100% makes time on the island go twice as
  // fast, and everything in between scales smoothly. It's remembered
  var TIME_KEY = 'everdawn-time-speed', BASE_MINUTES_PER_SECOND = GAME_MINUTES_PER_SECOND;
  function setTimeSpeed(pct) { pct = THREE.MathUtils.clamp(pct, 50, 100); GAME_MINUTES_PER_SECOND = BASE_MINUTES_PER_SECOND * pct / 50; }
  try { var timeSaved = parseFloat(localStorage.getItem(TIME_KEY)); if (timeSaved >= 50 && timeSaved <= 100) setTimeSpeed(timeSaved); } catch (err) {}
  window.everdawnSetTimeSpeed = function (pct) { setTimeSpeed(pct); try { localStorage.setItem(TIME_KEY, String(THREE.MathUtils.clamp(pct, 50, 100))); } catch (err) {} };

  // ---------- Quest HUD, set by "Display Quest HUD" in Settings: Show or Hide ----------
  // A little scroll in the top-left corner of the game listing the quests you're on. There are no quests yet, so for
  // now it just says so; later, quests go in the quests list and renderQuestHud() draws them. Show is the usual
  // setting; Hide takes it away completely. It's remembered
  var QUEST_KEY = 'everdawn-quest-hud', quests = [], questShow = true;   // (each quest: { name, step }, where step is a short line on what to do next)
  try { questShow = localStorage.getItem(QUEST_KEY) !== 'hide'; } catch (err) {}
  var questStyle = document.createElement('style');
  questStyle.textContent = '.quest-hud{position:absolute;left:18px;top:18px;z-index:3;max-width:min(240px,42%);padding:8px 12px 9px;border-radius:14px;background:rgba(255,255,255,0.78);' +
    'box-shadow:0 4px 14px rgba(120,80,190,0.3),inset 0 0 0 2px #fff;color:#4a3570;font-size:.85rem;line-height:1.35;pointer-events:none}' +
    '.quest-hud[hidden]{display:none}.quest-hud b{display:block;font-size:.95rem;color:#7b4fd6;margin-bottom:3px}.quest-hud ul{margin:0;padding:0;list-style:none}' +
    '.quest-hud li{margin-top:4px}.quest-hud li span{display:block;font-size:.78rem;opacity:.8}.quest-hud .none{opacity:.7;font-style:italic}';
  document.head.appendChild(questStyle);
  var questHud = document.createElement('div'); questHud.className = 'quest-hud'; questHud.setAttribute('aria-label', 'Quests');
  canvas.parentNode.appendChild(questHud);
  function renderQuestHud() {
    questHud.innerHTML = '<b>📜 Quests</b>' + (quests.length ? '<ul></ul>' : '<div class="none">No quests yet</div>');
    var ul = questHud.querySelector('ul');
    quests.forEach(function (q) { var li = document.createElement('li'); li.textContent = '✦ ' + q.name; if (q.step) { var sp = document.createElement('span'); sp.textContent = q.step; li.appendChild(sp); } ul.appendChild(li); });
    questHud.hidden = !questShow;
  }
  renderQuestHud();
  window.everdawnSetQuestHud = function (show) { questShow = !!show; questHud.hidden = !questShow; try { localStorage.setItem(QUEST_KEY, show ? 'show' : 'hide'); } catch (err) {} };

  // ---------- Typewriter Effect, set in Settings: Disabled or Enabled ----------
  // For what people say when you talk to them. Disabled (the usual way): their words appear all at once. Enabled: they
  // appear a letter at a time, like being typed out. There's no one to talk to yet; when there is, their dialogue is
  // shown with typeText(el, text, done), which follows this setting and hands back a function that finishes the text
  // straight away (for tapping to skip). It's remembered
  var TYPE_KEY = 'everdawn-typewriter', typewriter = false, TYPE_PER_SECOND = 40;
  try { typewriter = localStorage.getItem(TYPE_KEY) === 'on'; } catch (err) {}
  function typeText(el, text, done) {
    var timer = 0, start = Date.now();
    function finish() { clearInterval(timer); el.textContent = text; if (done) { var d = done; done = null; d(); } }
    if (!typewriter) { finish(); return finish; }
    el.textContent = '';
    timer = setInterval(function () {                                   // (letters by the clock, so a busy moment never slows the typing down)
      var shown = Math.floor((Date.now() - start) / 1000 * TYPE_PER_SECOND);
      if (shown >= text.length) finish(); else el.textContent = text.slice(0, shown);
    }, 1000 / TYPE_PER_SECOND);
    return finish;
  }
  window.everdawnSetTypewriter = function (on) { typewriter = !!on; try { localStorage.setItem(TYPE_KEY, on ? 'on' : 'off'); } catch (err) {} };

  // ---------- Tile Highlight While Moving, set in Settings: Disabled or Enabled ----------
  // Enabled (the usual way): the glowing square marker shows the tile in front of you as you move about, on any open
  // ground, so you can see what you'd water, plant or dig. Disabled: there's no marker on the ground at all, for a
  // cleaner screen.
  // It's remembered
  var TILE_HL_KEY = 'everdawn-tile-highlight', tileHighlightOff = false;
  try { tileHighlightOff = localStorage.getItem(TILE_HL_KEY) === 'off'; } catch (err) {}
  cursor.material.depthTest = false; cursor.renderOrder = 5;          // (drawn on top of the grass and bushes, so it never gets lost among them...)
  player.traverse(function (o) {                                       // (...but never over her: she's drawn after it, so she stays in front)
    if (!o.isMesh) return; o.renderOrder = 6;
    [].concat(o.material).forEach(function (m) { if (m && !m.transparent) { m.transparent = true; m.needsUpdate = true; } });
  });
  window.everdawnSetTileHighlight = function (on) { tileHighlightOff = !on; if (!on) cursor.visible = false; try { localStorage.setItem(TILE_HL_KEY, on ? 'on' : 'off'); } catch (err) {} };

  // ---------- Game Time Hour Format, set in Settings: AM/PM or 24 Hour ----------
  // AM/PM (the usual way) shows the clock as 1:00 PM; 24 Hour shows it as 13:00 (and 6:00 AM as 06:00). It changes the
  // clock straight away, and it's remembered
  var CLOCK_KEY = 'everdawn-hour-format', clock24 = false;
  try { clock24 = localStorage.getItem(CLOCK_KEY) === '24'; } catch (err) {}
  ui.clock.textContent = clockText(state.minutes);
  window.everdawnSetHourFormat = function (is24) { clock24 = !!is24; ui.clock.textContent = clockText(state.minutes); try { localStorage.setItem(CLOCK_KEY, is24 ? '24' : '12'); } catch (err) {} };

  // ---------- Combat Mode, set in Settings: Default or Passive ----------
  // Default: a monster comes for you as soon as you step within its detection range. Passive: monsters leave you be
  // when you walk near them, and only turn hostile once you've struck them first. There are no monsters yet; when
  // there are, each one asks monsterWillAttack(m, dist) whether to go for you (dist: how far you are from it), and is
  // marked m.provoked = true when you hit it. It's remembered
  var COMBAT_KEY = 'everdawn-combat-mode', combatPassive = false, MONSTER_DETECT = 6;   // (how close you can get before a monster notices you, unless it has its own m.detect)
  try { combatPassive = localStorage.getItem(COMBAT_KEY) === 'passive'; } catch (err) {}
  function monsterWillAttack(m, dist) { return !!m.provoked || (!combatPassive && dist < (m.detect || MONSTER_DETECT)); }
  window.everdawnSetCombatMode = function (passive) { combatPassive = !!passive; try { localStorage.setItem(COMBAT_KEY, passive ? 'passive' : 'default'); } catch (err) {} };

  // ---------- Enable Jealousy, set in Settings: No or Yes ----------
  // No (the usual way): none of this happens. Yes: romance can cause drama. There are no townsfolk yet; when there are,
  // each dateable one is a romance record like { name, gender, dateable: true, hearts, dating, spouse, lastTalkDay }
  // and the game tells jealousyEvent() what you just did:
  //   'date'      you start dating someone while already dating (or married to) someone else
  //   'chat'      you talk to, or give a gift to, another single dateable townsperson while you're with someone
  //   'gift'      married, you give a gift to a romance candidate of the same gender as your spouse
  //   'tenHeart'  you watch a 10-heart event, once you've seen them for at least four different dateable townsfolk
  // Drama gives the people you're with the "Cold Shoulder": they're upset and won't talk to you for a while (3 days, or
  // 7 for a spouse), their hearts drop back to 8, and hearts 9 and 10 stay locked until you give them a Locket again
  // and re-watch their 10-heart event. A spouse you haven't talked to for a while also gets sad, then starts to
  // question the relationship (spouseMood). It's remembered
  var JEALOUSY_KEY = 'everdawn-jealousy', jealousyOn = false, DRAMA_CHANCE = 0.25, COLD_DAYS = 3, COLD_DAYS_SPOUSE = 7;   // (DRAMA_CHANCE: how likely a chat or gift is to be noticed)
  try { jealousyOn = localStorage.getItem(JEALOUSY_KEY) === 'yes'; } catch (err) {}
  var romance = [], tenHeartSeen = {};                                  // (all the dateable townsfolk, and whose 10-heart events you've watched)
  function partnersOf(except) { return romance.filter(function (r) { return (r.dating || r.spouse) && r !== except; }); }
  function coldShoulder(r) {                                           // (upset: no talking for a while, back down to 8 hearts, 9 and 10 locked)
    r.coldUntil = state.day + (r.spouse ? COLD_DAYS_SPOUSE : COLD_DAYS);
    r.hearts = Math.min(r.hearts || 0, 8); r.heartsLocked = true; r.locketBack = false;
  }
  function jealousyEvent(kind, who) {                                  // (returns the townsfolk who got upset, if any)
    if (!jealousyOn) return [];
    var partners = partnersOf(who), spouse = romance.filter(function (r) { return r.spouse; })[0], drama = false;
    if (kind === 'date') drama = partners.length > 0;
    else if (kind === 'chat') drama = partners.length > 0 && who && who.dateable && !who.dating && !who.spouse && Math.random() < DRAMA_CHANCE;
    else if (kind === 'gift') drama = !!spouse && who && who !== spouse && who.dateable && who.gender === spouse.gender && Math.random() < DRAMA_CHANCE;
    else if (kind === 'tenHeart') { if (who) tenHeartSeen[who.name] = true; drama = Object.keys(tenHeartSeen).length >= 4 && partners.length > 0; }
    if (!drama) return [];
    partners.forEach(coldShoulder);
    return partners;
  }
  function canTalkTo(r) { return !jealousyOn || !(r.coldUntil > state.day); }   // (no talking while they're giving you the cold shoulder)
  function maxHearts(r) { return jealousyOn && r.heartsLocked ? 8 : 10; }
  function locketGiven(r) { if (r.heartsLocked) r.locketBack = true; }   // (a Locket again: then their 10-heart event, re-watched, unlocks hearts 9 and 10)
  function tenHeartRewatched(r) { if (r.heartsLocked && r.locketBack) { r.heartsLocked = false; r.locketBack = false; } }
  function spouseMood(r) {                                             // ('happy', 'sad' after 3 days without a word, 'questioning' after 7)
    if (!jealousyOn || !r.spouse || r.lastTalkDay === undefined) return 'happy';
    var since = state.day - r.lastTalkDay;
    return since >= 7 ? 'questioning' : since >= 3 ? 'sad' : 'happy';
  }
  window.everdawnSetJealousy = function (on) { jealousyOn = !!on; try { localStorage.setItem(JEALOUSY_KEY, on ? 'yes' : 'no'); } catch (err) {} };

  // ---------- Enable Excessive Animations, set in Settings: No or Yes ----------
  // Yes (the usual way): everything moves as it always has. No: the motion that can make some people feel sick is cut
  // out. The camera stays locked on you instead of trailing behind and catching up (so it never sweeps across the
  // island after a teleport or a door), and the title screen and top bar keep still: no floating logo, light sweeps,
  // pulsing glows, twinkling stars or bouncing coin counter. It's remembered
  var MOTION_KEY = 'everdawn-excessive-anim', calmMotion = false;
  try { calmMotion = localStorage.getItem(MOTION_KEY) === 'no'; } catch (err) {}
  document.documentElement.classList.toggle('ev-calm', calmMotion);
  window.everdawnSetExcessiveAnim = function (on) { calmMotion = !on; document.documentElement.classList.toggle('ev-calm', calmMotion); try { localStorage.setItem(MOTION_KEY, on ? 'yes' : 'no'); } catch (err) {} };

  // ---------- Storage Drag & Drop, set in Settings ----------
  // Disabled (the usual way): tap something in your bag and the whole stack goes into the shipping bin's first open
  // spot, and tap it in the bin to take it back out. Enabled: tapping does nothing; you press and hold an item and drag
  // it across into the bin (and drag it from the bin back over your bag to take it out), with a copy of it following
  // your finger and the side you can drop on lighting up. It's remembered
  var STORE_KEY = 'everdawn-storage-drag', storeDrag = false, shipHintEl = shipBox.querySelector('.ship-hint'), shipHintTap = shipHintEl.textContent;
  try { storeDrag = localStorage.getItem(STORE_KEY) === 'on'; } catch (err) {}
  function storeHint() { shipHintEl.textContent = storeDrag ? 'Press and hold something in your bag, then drag it into the bin. Drag it from the bin back over your bag to take it out. Everything in the bin sells at 6 am tomorrow.' : shipHintTap; }
  storeHint();
  window.everdawnSetStorageDrag = function (on) { storeDrag = !!on; storeHint(); try { localStorage.setItem(STORE_KEY, on ? 'on' : 'off'); } catch (err) {} if (!shipBox.hidden) renderShip(); };
  [shipBagGrid, shipBinGrid].forEach(function (grid) {               // (while it's on, a plain tap doesn't move anything)
    grid.addEventListener('click', function (e) { if (storeDrag && e.target !== grid) { e.stopPropagation(); e.preventDefault(); } }, true);
  });
  var storeDragging = null;                                            // { from: 'bag' or 'bin', i, id, x, y, ghost, el }
  function storeIndex(grid, el) { while (el && el.parentNode !== grid) el = el.parentNode; return el ? Array.prototype.indexOf.call(grid.children, el) : -1; }
  function storeOver(x, y, grid) { var r = grid.parentNode.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
  function storeClear() { shipBagGrid.parentNode.classList.remove('store-drop'); shipBinGrid.parentNode.classList.remove('store-drop'); }
  [[shipBagGrid, 'bag'], [shipBinGrid, 'bin']].forEach(function (pair) {
    pair[0].addEventListener('pointerdown', function (e) {
      if (!storeDrag) return;
      var i = storeIndex(pair[0], e.target), el = pair[0].children[i];
      if (i < 0 || !el || el.tagName !== 'BUTTON') return;
      var it = pair[1] === 'bag' ? bag[i] : shipBin[i]; if (!it) return;
      e.preventDefault();
      storeDragging = { from: pair[1], i: i, id: it.id, x: e.clientX, y: e.clientY, ghost: null, el: el };
    });
  });
  window.addEventListener('pointermove', function (e) {
    var d = storeDragging; if (!d) return;
    if (!d.ghost) {
      if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) < 6) return;
      d.ghost = document.createElement('div'); d.ghost.className = 'drag-ghost'; d.ghost.appendChild(itemPicture(d.id)); document.body.appendChild(d.ghost);
      d.el.classList.add('dragging');
    }
    d.ghost.style.left = e.clientX + 'px'; d.ghost.style.top = e.clientY + 'px';
    var target = d.from === 'bag' ? shipBinGrid : shipBagGrid; storeClear();
    if (storeOver(e.clientX, e.clientY, target)) target.parentNode.classList.add('store-drop');
  });
  function storeEnd(e, cancel) {
    var d = storeDragging; if (!d) return; storeDragging = null; storeClear();
    if (d.ghost) document.body.removeChild(d.ghost); d.el.classList.remove('dragging');
    if (cancel || !d.ghost) return;
    if (d.from === 'bag' && storeOver(e.clientX, e.clientY, shipBinGrid)) {
      var it = bag[d.i]; if (it && (isTool(it.id) || !ITEMS[it.id].price)) { showToast('Tools can\'t go in the shipping bin', 1800); return; }
      shipItem(d.i);
    } else if (d.from === 'bin' && storeOver(e.clientX, e.clientY, shipBagGrid)) unshipItem(d.i);
  }
  window.addEventListener('pointerup', function (e) { storeEnd(e, false); });
  window.addEventListener('pointercancel', function (e) { storeEnd(e, true); });
  (function () { var css = document.createElement('style');            // (the side you can drop on lights up, and the slots don't scroll the page while you drag)
    css.textContent = '.ship .ship-cols > div { border-radius: 14px; transition: box-shadow .15s, background .15s; } .ship .ship-cols > div.store-drop { background: rgba(255,210,240,.25); box-shadow: 0 0 0 3px #ffd27a inset; } .ship.store-drag .slot { touch-action: none; }';
    document.head.appendChild(css); })();
  var storeBaseRender = renderShip;
  renderShip = function () { storeBaseRender(); shipBox.classList.toggle('store-drag', storeDrag); };

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
    setTimeout(resize, 50); setTimeout(placeToasts, 150);
  }
  function fullscreenChanged() { if (!realFullscreen() && document.body.classList.contains('full')) setFullScreen(false); } // pressed Esc
  document.addEventListener('fullscreenchange', fullscreenChanged);
  document.addEventListener('webkitfullscreenchange', fullscreenChanged);
  btnFull.addEventListener('click', function () { setFullScreen(!document.body.classList.contains('full')); focusGame(); });
  // In full screen the hotbar sits higher (above the phone's or tablet's home bar), so the messages and the little
  // action buttons (Sit in the boat, Take hay...) are lifted to just above wherever the hotbar really is
  function placeToasts() {
    var toast = document.getElementById('toast'), bar = document.querySelector('.hotbar'), full = document.body.classList.contains('full');
    var acts = document.querySelectorAll('.sleep-btn');
    if (!toast || !bar || !full) { if (toast) toast.style.bottom = ''; for (var i = 0; i < acts.length; i++) acts[i].style.bottom = ''; return; }
    var gap = toast.offsetParent ? toast.offsetParent.getBoundingClientRect().bottom - bar.getBoundingClientRect().top + 10 : 84;
    toast.style.bottom = Math.max(84, Math.round(gap)) + 'px';
    var actGap = Math.max(84, Math.round(gap)) + toast.offsetHeight + 12;
    for (var j = 0; j < acts.length; j++) acts[j].style.bottom = Math.max(130, actGap) + 'px';
  }
  var fsBaseToast = showToast;
  showToast = function () { var r = fsBaseToast.apply(this, arguments); placeToasts(); return r; };
  window.addEventListener('resize', function () { setTimeout(placeToasts, 120); });
  document.addEventListener('fullscreenchange', function () { setTimeout(placeToasts, 120); });
  document.addEventListener('webkitfullscreenchange', function () { setTimeout(placeToasts, 120); });
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

  // ---------- The Dawn Tree's blossoms, more true to life ----------
  // Real cherry blossom: soft white-to-blush flowers with notched petals, deeper pink at their hearts with little
  // stamens, in loose clusters with leaves and gaps between them rather than one solid pink mass; the canopy shaded
  // darker underneath and in its depths and brightest on top where the sun falls, and only a soft glow of its own
  (function () {
    var cv = blossomTex.image, g = cv.getContext('2d'), W = cv.width;
    g.clearRect(0, 0, W, W);
    var CL = []; for (var c = 0; c < 9; c++) { var ca = Math.random() * Math.PI * 2, cr = c === 0 ? 0 : 40 + Math.random() * 52; CL.push([128 + Math.cos(ca) * cr, 128 + Math.sin(ca) * cr * 0.9, 30 + Math.random() * 22]); }   // (loose clusters, with gaps between)
    function inCluster() { var k = CL[Math.floor(Math.random() * CL.length)], a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * k[2]; return [k[0] + Math.cos(a) * r, k[1] + Math.sin(a) * r, k]; }
    for (var l = 0; l < 70; l++) {                                    // (fresh young leaves peeking out among the flowers)
      var lp = inCluster(); g.save(); g.translate(lp[0], lp[1]); g.rotate(Math.random() * 6.28);
      g.fillStyle = 'hsl(' + (80 + Math.random() * 30) + ',' + (30 + Math.random() * 20) + '%,' + (28 + Math.random() * 14) + '%)';
      g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(0, -5, 9, 0); g.quadraticCurveTo(0, 5, -9, 0); g.fill(); g.restore();
    }
    for (var i = 0; i < 260; i++) {                                    // (the flowers, back to front)
      var fp = inCluster(), x = fp[0], y = fp[1], sz = 5.5 + Math.random() * 5, spin = Math.random() * 6.28;
      var edge = Math.hypot(x - fp[2][0], y - fp[2][1]) / fp[2][2], lit = Math.max(0, Math.min(1, 0.6 - ((x - 128) + (y - 128)) / 260 + (1 - edge) * 0.15));
      var hue = 335 + Math.random() * 18, sat = 60 + Math.random() * 30, lo = 70 + lit * 14 + Math.random() * 6;
      for (var k = 0; k < 5; k++) {                                    // (five rounded petals, each with a little notch at its tip, blushing deeper towards the middle)
        var pa = spin + k / 5 * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        g.save(); g.translate(x, y); g.rotate(pa);
        var pg = g.createLinearGradient(0, 0, sz, 0); pg.addColorStop(0, 'hsl(' + hue + ',' + (sat + 15) + '%,' + (lo - 16) + '%)'); pg.addColorStop(0.55, 'hsl(' + hue + ',' + sat + '%,' + lo + '%)'); pg.addColorStop(1, 'hsl(' + hue + ',' + (sat - 15) + '%,' + Math.min(97, lo + 10) + '%)');
        g.fillStyle = pg; g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(sz * 0.3, -sz * 0.5, sz * 0.95, -sz * 0.45, sz, -sz * 0.1); g.lineTo(sz * 0.86, 0); g.lineTo(sz, sz * 0.1); g.bezierCurveTo(sz * 0.95, sz * 0.45, sz * 0.3, sz * 0.5, 0, 0); g.fill();
        g.restore();
      }
      g.fillStyle = 'hsl(' + (340 + Math.random() * 10) + ',60%,' + (42 + lit * 10) + '%)'; g.beginPath(); g.arc(x, y, sz * 0.22, 0, Math.PI * 2); g.fill();   // (its deep pink heart...)
      g.fillStyle = 'rgba(255,236,170,0.9)'; for (var st = 0; st < 5; st++) { var sa = Math.random() * 6.28, sr = sz * (0.25 + Math.random() * 0.15); g.beginPath(); g.arc(x + Math.cos(sa) * sr, y + Math.sin(sa) * sr, 0.9, 0, Math.PI * 2); g.fill(); }   // (...and pale gold stamens)
    }
    blossomTex.needsUpdate = true;
    var sv = strandTex.image, sg = sv.getContext('2d'); sg.clearRect(0, 0, sv.width, sv.height);   // (the hanging strands: soft trailing sprays of pale blossom, thinning towards their tips)
    for (var y = 4; y < 252; y += 5) {
      var f = y / 256, n2 = Math.max(1, Math.round(4 * (1 - f * 0.8)));
      for (var k2 = 0; k2 < n2; k2++) {
        var bx = 32 + (Math.random() - 0.5) * 30 * (1 - f * 0.6), by = y + Math.random() * 4, bs = 5.5 * (1 - f * 0.55) * (0.7 + Math.random() * 0.5);
        for (var pt = 0; pt < 5; pt++) { var pa2 = pt / 5 * Math.PI * 2 + Math.random(); sg.fillStyle = 'hsl(' + (330 + Math.random() * 20) + ',' + (55 + Math.random() * 25) + '%,' + (80 + Math.random() * 10 - f * 6) + '%)'; sg.beginPath(); sg.ellipse(bx + Math.cos(pa2) * bs * 0.5, by + Math.sin(pa2) * bs * 0.5, bs * 0.5, bs * 0.35, pa2, 0, Math.PI * 2); sg.fill(); }
        sg.fillStyle = 'hsl(340,60%,55%)'; sg.beginPath(); sg.arc(bx, by, bs * 0.18, 0, Math.PI * 2); sg.fill();
      }
    }
    strandTex.needsUpdate = true;
    blossomMat.emissive.set(0x5a2a4a); strandMat.emissive.set(0x3a1a30);   // (a soft glow of their own, not a neon one)
    var m4 = new THREE.Matrix4(), pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), col = new THREE.Color();
    for (var n = 0; n < blossomCards.count; n++) {                      // (each card a touch smaller, so light shows between the clusters, and shaded by where it sits in the canopy)
      blossomCards.getMatrixAt(n, m4); m4.decompose(pos, q, sc); sc.multiplyScalar(0.82); m4.compose(pos, q, sc); blossomCards.setMatrixAt(n, m4);
      var best = null, bd = 1e9; clumps.forEach(function (cl) { var d = pos.distanceTo(cl.p); if (d < bd) { bd = d; best = cl; } });
      var up = (pos.y - best.p.y) / best.r, out = bd / best.r, high = (pos.y - 3.5) / 3.5;
      var shade = 0.6 + Math.max(0, Math.min(1, 0.45 + up * 0.5)) * 0.32 + Math.min(1, out) * 0.12 + Math.max(0, Math.min(1, high)) * 0.12 + (Math.random() - 0.5) * 0.06;
      col.setRGB(Math.min(1, shade * 1.04), shade * 0.97, shade); blossomCards.setColorAt(n, col);
    }
    blossomCards.instanceMatrix.needsUpdate = true; if (blossomCards.instanceColor) blossomCards.instanceColor.needsUpdate = true;
  })();

  // Only draw what you can see: every batch of grass, leaves, flowers and stones gets a sphere round all its pieces, and
  // each frame a batch that's off screen, or so far off it's lost in the haze, is skipped. Batches whose pieces move
  // (a tree regrowing, soil being tilled) get their sphere worked out again. Indoors everything stays on, so the
  // windows still show the whole island
  var cullList = [], cullFrustum = new THREE.Frustum(), cullPV = new THREE.Matrix4(), cullM = new THREE.Matrix4(), cullV = new THREE.Vector3(), cullBox = new THREE.Box3(), cullWasIndoors = null;
  function cullMeasure(c) {
    var o = c.o; o.updateWorldMatrix(true, false); cullBox.makeEmpty();   // (with everything it sits in placed first, so a batch inside a group, like the Dawn Tree's blossoms, is measured where it really is)
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

  state.coins = 100000; showCoins(false);                              // a new game starts with 100,000 Star Coins (loading a save gives you the coins you saved with)
  var clock = new THREE.Clock();
  cam.target.set(player.position.x, 0.8, player.position.z);

  function frame() {
    var dt = Math.min(clock.getDelta(), 0.05);
    state.time += dt;
    updateClock(dt);
    var night = updateSky();
    updatePlayer(dt);
    if (!flying) updateDoors();
    updateSleepButton();
    updateStamina();
    updateShipping(dt);
    updateShop(dt);
    updateBarnShop();
    updateGlimmers(dt);
    updateGlimButton();
    updateBridge(state.time, night);
    updateInterior(dt, state.time);
    updateCarpenter(state.time, night);
    updateCoop(dt, night);
    updateFbarn(dt, night);
    updateMill(dt, night);
    updateSilo(dt, night);
    updateBoatButton();
    updateSpring(dt);
    updateSummer(dt);
    updateFall(dt);
    updateWinter(dt);
    updateCrops(dt, night);
    updateWorld(dt, night);
    updateEffects(dt);
    updateCamera(dt);
    updateClinicInterior(state.time);
    cullScene();
    var menuUp = (bagUi.box && !bagUi.box.hidden) || binOpen || shopOpen || barnShopOpen || glimNaming || carpShopOpen || coopPlacing;   // a menu is open: in full screen the button column steps aside, so taps on the menu don't land on the buttons behind it
    if (document.body.classList.contains('menu-open') !== menuUp) { document.body.classList.toggle('menu-open', menuUp); placeMenus(); }
    if (indoors && !inShop && !inClinic && !inBarn && !inCarp && !inCoop && !inFbarn) { camera.updateMatrixWorld(); drawHouseView(); }   // (your own house: its windows look out too)
    if (inShop) { camera.updateMatrixWorld(); drawShopView(); }
    if (inClinic) { camera.updateMatrixWorld(); drawClinicView(); }
    if (inBarn) { camera.updateMatrixWorld(); drawBarnView(); }
    if (inCarp) { camera.updateMatrixWorld(); drawCarpView(); }
    if (inCoop) { camera.updateMatrixWorld(); drawCoopView(); }
    if (inFbarn) { camera.updateMatrixWorld(); drawFbarnView(); }
    renderer.render(indoors ? (inFbarn ? fbarnScene : inCoop ? coopScene : inCarp ? carpScene : inBarn ? abScene : inClinic ? clinicScene : inShop ? shopScene : interiorScene) : scene, camera); // inside the house, the shop or the clinic, only that room is drawn
  }
  // ---------- The title screen, in 3D ----------
  // While the title screen is up, the real you floats in the dawn sky over it: your own witch, her arm raised with a
  // wand of dark wood wound with gold, a pink ribbon and a glowing crystal with a star turning above it, magic pouring
  // off it in sparkles. A ring of runes and soft light turns beneath her feet, and Blossom the Glimmerwing, Marina the
  // Sirenna and Starla the Lunastra float about her, bobbing and turning. When you press Play they all go back where
  // they belong, just as they were
  var title3d = (function () {
    var host = document.getElementById('evTitle'); if (!host || !window.EVERDAWN_TITLE) return null;
    var cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 1.2s ease';
    host.insertBefore(cv, host.querySelector('.ev-ui'));
    var R3 = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
    R3.outputEncoding = renderer.outputEncoding; R3.toneMapping = renderer.toneMapping; R3.toneMappingExposure = renderer.toneMappingExposure; R3.physicallyCorrectLights = renderer.physicallyCorrectLights;
    var TS = new THREE.Scene(), cam3 = new THREE.PerspectiveCamera(28, 1, 0.05, 60);
    var skyTex = new THREE.CanvasTexture(host.querySelector('canvas')); if (renderer.outputEncoding === THREE.sRGBEncoding) skyTex.encoding = THREE.sRGBEncoding;
    TS.background = skyTex;                                            // (the painted dawn sky, behind her)
    TS.add(new THREE.HemisphereLight(0xfff4f8, 0x6a4a9a, 0.38));
    var key = new THREE.DirectionalLight(0xfff6ee, 0.55); key.position.set(2.5, 4, 5); TS.add(key);
    var rim = new THREE.DirectionalLight(0xffb0e0, 0.32); rim.position.set(-4, 2.5, -3); TS.add(rim);
    var fillL = new THREE.PointLight(0xffe0a0, 0.3, 3); TS.add(fillL);   // (the wand's light, falling on her)
    TS.add(new THREE.AmbientLight(0xd8c8f0, 0.08));
    try {                                                              // (a picture of your own Dawn Tree, taken once, for the floating island in the sky)
      var shotCv = document.createElement('canvas'), SR = new THREE.WebGLRenderer({ canvas: shotCv, antialias: true, alpha: true, preserveDrawingBuffer: true });
      SR.outputEncoding = renderer.outputEncoding; SR.toneMapping = renderer.toneMapping; SR.toneMappingExposure = renderer.toneMappingExposure; SR.physicallyCorrectLights = renderer.physicallyCorrectLights; SR.setClearColor(0x000000, 0);
      var shotScene = new THREE.Scene(), treeParent = tree.parent || scene; shotScene.add(tree);
      shotScene.add(new THREE.HemisphereLight(0xfff4f8, 0x6a4a9a, 0.75)); var shotKey = new THREE.DirectionalLight(0xfff0f6, 0.8); shotKey.position.set(TREE_X - 6, 10, TREE_Z + 12); shotScene.add(shotKey); shotScene.add(new THREE.AmbientLight(0xe8d8ff, 0.2));
      tree.updateMatrixWorld(true); var tbox = new THREE.Box3();
      tree.traverse(function (o) { if (o.isMesh && o.geometry) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); tbox.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
      var tc = tbox.getCenter(new THREE.Vector3()), tsz = tbox.getSize(new THREE.Vector3()), tw = Math.max(tsz.x, tsz.z) * 1.45, th = tsz.y * 1.7; tc.y = tbox.min.y + th * 0.5 - tsz.y * 0.05;   // (with room all round for the blossom, which hangs well beyond the branches)
      var SW = 640, SH = Math.round(Math.min(1.6, Math.max(0.5, th / tw * 1.08)) * SW); SR.setPixelRatio(1); SR.setSize(SW, SH, false);
      var scam = new THREE.PerspectiveCamera(24, SW / SH, 0.1, 400), fit = Math.max(th * 0.56 / Math.tan(12 * Math.PI / 180), tw * 0.56 / Math.tan(12 * Math.PI / 180) / (SW / SH));
      scam.position.set(tc.x, tc.y + th * 0.12, tc.z + fit); scam.lookAt(tc); scam.updateMatrixWorld(true);
      SR.render(shotScene, scam);
      var base = new THREE.Vector3(TREE_X, 0, TREE_Z).project(scam);
      window.EVERDAWN_TREE_IMG = { img: shotCv, bx: (base.x + 1) / 2, by: (1 - base.y) / 2, aspect: SH / SW };
      treeParent.add(tree); SR.dispose();
    } catch (err) { if (tree && !tree.parent) scene.add(tree); }
    // (you, borrowed from the island for a moment)
    var saved = { parent: player.parent, pos: player.position.clone(), rot: player.rotation.clone(), vis: player.visible, axe: axeArm.visible, body: body.rotation.clone(), bodyPos: body.position.clone(),
      limbs: [wl.armL, wl.armR, wl.legs[0], wl.legs[1], wl.head, wl.hairBack, wl.tip].map(function (o) { return o.rotation.clone(); }), chibi: wl.chibi.position.clone(), broom: wl.broom.visible, ride: wl.rideBroom.visible };
    var me = new THREE.Group(); TS.add(me); me.add(player);
    player.position.set(0, 0, 0); player.rotation.set(0, 0.18, 0); player.visible = true; body.position.set(0, 0, 0); body.rotation.set(0, 0, 0);
    axeArm.visible = false; wl.armR.visible = true; wl.broom.visible = false; wl.rideBroom.visible = false;   // (floating on her own, held up by the magic ring beneath her)
    wl.mFace.map = wl.mFace.emissiveMap = wl.faces[2]; wl.mFace.needsUpdate = true;   // (eyes closed, smiling with joy)
    saved.broomRot = wl.rideBroom.rotation.clone(); saved.broomPos = wl.rideBroom.position.clone(); wl.rideBroom.rotation.y += Math.PI / 2; wl.rideBroom.position.z += 0.06;
    player.updateMatrixWorld(true); var broomBox = new THREE.Box3().setFromObject(wl.rideBroom);   // (where the broom lies, so Starla can ride on the back of it)
    // (her wand, in her raised right hand)
    var wand = new THREE.Group(); wand.position.set(0, -0.3, 0.02); wl.armR.add(wand);
    var wood = new THREE.MeshToonMaterial({ color: 0x4a2c1a }), gold = new THREE.MeshStandardMaterial({ color: 0xe8b84a, metalness: 0.8, roughness: 0.3, emissive: 0x6a4410, emissiveIntensity: 0.4 });
    var stick = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.013, 0.42, 10), wood); stick.position.y = -0.17; wand.add(stick);
    for (var gw = 0; gw < 9; gw++) { var gr = new THREE.Mesh(new THREE.TorusGeometry(0.0125 - gw * 0.0004, 0.0026, 6, 16), gold); gr.rotation.set(Math.PI / 2 + 0.35, 0, gw * 0.7); gr.position.y = -0.02 - gw * 0.035; wand.add(gr); }
    var grip = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 12), gold); grip.position.y = 0.0; wand.add(grip);
    var crystalMat = new THREE.MeshPhysicalMaterial({ color: 0xc89aff, emissive: 0x8a4ae0, emissiveIntensity: 0.9, roughness: 0.05, metalness: 0.1, clearcoat: 1, transparent: true, opacity: 0.92, flatShading: true });
    var crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.036, 0), crystalMat); crystal.scale.set(1, 1.7, 1); crystal.position.y = -0.42; wand.add(crystal);
    var cup = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.03, 5, 1, true), gold); cup.rotation.x = Math.PI; cup.position.y = -0.38; wand.add(cup);
    var ribMat = new THREE.MeshToonMaterial({ color: 0xff8cc6, side: THREE.DoubleSide }), ribbons = [];
    [-1, 1].forEach(function (sd) { var rb = new THREE.Mesh(new THREE.PlaneGeometry(0.018, 0.13, 1, 6), ribMat); rb.geometry.translate(0, -0.065, 0); rb.position.set(sd * 0.008, -0.33, 0.01); rb.rotation.z = sd * 0.5; wand.add(rb); ribbons.push(rb); });
    var bow = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.005, 6, 12), ribMat); bow.position.set(0, -0.33, 0.012); wand.add(bow);
    var starShape = new THREE.Shape(); for (var sp = 0; sp < 10; sp++) { var sr = sp % 2 ? 0.018 : 0.045, sa = sp / 10 * Math.PI * 2 + Math.PI / 2; if (sp) starShape.lineTo(Math.cos(sa) * sr, Math.sin(sa) * sr); else starShape.moveTo(Math.cos(sa) * sr, Math.sin(sa) * sr); }
    var star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.012, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2 }), new THREE.MeshStandardMaterial({ color: 0xfff0a0, emissive: 0xffc840, emissiveIntensity: 1.2, metalness: 0.4, roughness: 0.3 }));
    star.geometry.center(); star.position.y = -0.52; wand.add(star);
    function glowSprite(col, size, op) { var sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: dawnGlowTex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); sp2.scale.set(size, size, 1); return sp2; }
    var tipGlow = glowSprite(0xffd8a0, 0.5, 0.85); tipGlow.position.y = -0.48; wand.add(tipGlow);
    var tipGlow2 = glowSprite(0xffffff, 0.16, 1); tipGlow2.position.y = -0.52; wand.add(tipGlow2);
    var crysGlow = glowSprite(0xc890ff, 0.2, 0.8); crysGlow.position.y = -0.42; wand.add(crysGlow);
    // (a ring of light and runes under her feet)
    var ring = new THREE.Group(); ring.position.y = -0.06; me.add(ring);
    var ringMat = new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    [[0.42, 0.012], [0.34, 0.007], [0.5, 0.004]].forEach(function (rr) { var m = new THREE.Mesh(new THREE.RingGeometry(rr[0] - rr[1], rr[0] + rr[1], 72), ringMat); m.rotation.x = -Math.PI / 2; ring.add(m); });
    for (var rn = 0; rn < 8; rn++) { var rs = new THREE.Mesh(new THREE.CircleGeometry(0.022, 4), ringMat); rs.rotation.x = -Math.PI / 2; var ra = rn / 8 * Math.PI * 2; rs.position.set(Math.cos(ra) * 0.38, 0, Math.sin(ra) * 0.38); ring.add(rs); }
    var under = glowSprite(0xff9ad8, 1.3, 0.4); under.position.y = 0.05; me.add(under);
    // (a little puff of cloud for Marina to ride)
    var puffMat = new THREE.MeshToonMaterial({ color: 0xfff2fa, emissive: 0xffd0ec, emissiveIntensity: 0.25 });
    function puffCloud(tint) {                                         // (a little puff of cloud for an animal to ride)
      var c = new THREE.Group(); TS.add(c);
      [[0, 0, 0, 0.17], [-0.15, -0.02, 0.02, 0.12], [0.15, -0.02, -0.02, 0.13], [-0.05, 0.05, -0.08, 0.12], [0.07, -0.05, 0.1, 0.11], [-0.24, -0.05, -0.02, 0.08], [0.25, -0.05, 0.03, 0.08]].forEach(function (p) {
        var pf = new THREE.Mesh(new THREE.SphereGeometry(p[3], 20, 14), puffMat); pf.position.set(p[0], p[1] - 0.1, p[2]); pf.scale.y = 0.7; c.add(pf);
      });
      var cg = glowSprite(tint, 0.9, 0.3); cg.position.y = -0.08; c.add(cg); return c;
    }
    var cloudSeat = puffCloud(0x9ae0d0), cloudSeat2 = puffCloud(0xc8b0ff);
    // (your three animals from Fluff & Feather's stalls, borrowed too)
    var pets = [];
    (abDisplay || []).forEach(function (d, k) {
      var r = d.m.root, keep = { r: r, parent: r.parent, pos: r.position.clone(), rot: r.rotation.clone(), scl: r.scale.clone(), vis: r.visible };
      r.visible = true; r.rotation.order = 'YXZ'; r.scale.multiplyScalar(d.kind === 'glim' ? 0.62 : d.kind === 'luna' ? 1.15 : 1.4);
      if (d.kind === 'luna') cloudSeat2.add(r);          // (Starla, on her own little cloud)
      else if (d.kind === 'bubble') cloudSeat.add(r);   // (Marina, on her own little cloud)
      else TS.add(r);
      keep.tags = []; r.traverse(function (o) { if (o.material && o.material.map && o.material.map === d.m.tagTex && o.visible) { o.visible = false; keep.tags.push(o); } });   // (no "On display" signs out here)
      pets.push({ d: d, keep: keep, k: k, glow: (function () { var gs = glowSprite([0xff9ad8, 0x9ae0d0, 0xc8b0ff][k], 0.7, 0.22); TS.add(gs); return gs; })() });
    });
    // (sparkles pouring off the wand)
    var sparks = [], sparkCols = [0xfff0b0, 0xffb0e0, 0xd0b8ff, 0xffffff, 0xa8f0ff];
    for (var sk = 0; sk < 90; sk++) { var s3 = glowSprite(sparkCols[sk % 5], 0.06, 0); s3.userData = { life: 99 }; TS.add(s3); sparks.push(s3); }
    var orbit = []; for (var ob = 0; ob < 18; ob++) { var o3 = glowSprite(sparkCols[ob % 5], 0.05, 0.9); TS.add(o3); orbit.push(o3); }
    var tipW = new THREE.Vector3(), palmW = new THREE.Vector3(), t3 = 0, shown = false;
    function size() { var w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight; R3.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)); R3.setSize(w, h, false); cam3.aspect = w / h; cam3.fov = w / h < 0.8 ? 40 : 28; cam3.updateProjectionMatrix(); }
    size(); window.addEventListener('resize', size);
    function draw(dt) {
      t3 += dt;
      var tall = cam3.aspect < 0.8;
      skyTex.needsUpdate = true;
      cam3.position.set(0, 0.95, tall ? 7 : 6.1); cam3.lookAt(0, tall ? 0.92 : 0.97, 0);
      me.position.set(0, 0.12 + Math.sin(t3 * 1.1) * 0.05, 0);
      wl.chibi.position.y = 0; wl.head.rotation.set(0.05, 0.12, Math.sin(t3 * 0.8) * 0.05);
      wl.armR.rotation.set(-0.55, 0.15, -2.05 + Math.sin(t3 * 1.4) * 0.07);   // (her wand held up and out to the side, mid-spell)
      wl.armL.rotation.set(-0.35, 0, 0.62 + Math.sin(t3 * 1.2) * 0.06);   // (her other hand held out gracefully)
      var swing = Math.sin(t3 * 1.6) * 0.1;                               // (floating like a dancer: one leg kicked up behind her, the other pointed down, fluttering gently)
      wl.legs[0].rotation.set(0.75 + swing, 0, -0.22); wl.legs[1].rotation.set(-0.18 - swing * 0.5, 0, 0.08); wl.legs[0].userData.shin.rotation.x = wl.legs[1].userData.shin.rotation.x = 0; wl.chibi.rotation.set(0, 0, 0);
      wl.hairBack.rotation.x = 0.12 + Math.sin(t3 * 1.5) * 0.05; wl.tip.rotation.z = Math.sin(t3 * 1.7) * 0.06;
      player.rotation.y = 0.12 + Math.sin(t3 * 0.4) * 0.06;               // (turned toward you)
      me.rotation.z = Math.sin(t3 * 0.7) * 0.04; me.rotation.x = Math.sin(t3 * 0.9) * 0.03;   // (gliding, rising and dipping)
      cloudSeat.position.set(0.5, 0.3 + Math.sin(t3 * 1.2 + 2) * 0.04, 0.42); cloudSeat2.position.set(-0.5, 0.2 + Math.sin(t3 * 1.1) * 0.04, 0.45);   // (all bunched up together: Marina and Starla on clouds tucked right against her sides) cloudSeat2.rotation.y = Math.sin(t3 * 0.45 + 1) * 0.15; cloudSeat.rotation.y = Math.sin(t3 * 0.5) * 0.15;
      star.rotation.z += dt * 1.2; star.rotation.y = Math.sin(t3) * 0.4; crystal.rotation.y += dt * 0.8;
      var pulse = 0.75 + Math.sin(t3 * 4) * 0.25; tipGlow.material.opacity = 0.6 + pulse * 0.3; tipGlow.scale.setScalar(0.42 + pulse * 0.14); crysGlow.material.opacity = 0.5 + pulse * 0.3;
      ribbons.forEach(function (rb, k) { rb.rotation.z = (k ? 0.5 : -0.5) + Math.sin(t3 * 3 + k) * 0.25; rb.rotation.x = Math.sin(t3 * 2.4 + k) * 0.3; });
      ring.rotation.y = t3 * 0.4; under.material.opacity = 0.45 + Math.sin(t3 * 2) * 0.1;
      TS.updateMatrixWorld(true); star.getWorldPosition(tipW); fillL.position.copy(tipW); fillL.intensity = 0.22 + pulse * 0.14;
      sparks.forEach(function (sp3) {                                    // (sparkles: born at the star, drifting out and down in curls, fading)
        var u = sp3.userData;
        if (u.life >= u.max || u.life === 99) { if (Math.random() < dt * 14) { u.life = 0; u.max = 1.4 + Math.random() * 1.8; sp3.position.copy(tipW); u.v = new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.2) * 0.35, (Math.random() - 0.3) * 0.4); u.a = Math.random() * 6.28; u.sz = 0.06 + Math.random() * 0.09; } else { sp3.material.opacity = 0; return; } }
        u.life += dt; u.a += dt * 3; u.v.y -= dt * 0.12;
        sp3.position.x += (u.v.x + Math.cos(u.a) * 0.12) * dt; sp3.position.y += u.v.y * dt; sp3.position.z += (u.v.z + Math.sin(u.a) * 0.12) * dt;
        var f = 1 - u.life / u.max; sp3.material.opacity = f * (0.6 + 0.4 * Math.sin(u.life * 18)); sp3.scale.setScalar(u.sz * (0.5 + f));
      });
      orbit.forEach(function (o3, k) {                                   // (a slow halo of sparkles circling her)
        var a = t3 * 0.6 + k / orbit.length * Math.PI * 2;
        o3.position.set(Math.cos(a) * 0.62, 0.55 + Math.sin(a * 2 + k) * 0.18 + me.position.y, Math.sin(a) * 0.62);
        o3.material.opacity = 0.35 + 0.45 * Math.sin(t3 * 3 + k); o3.scale.setScalar(0.035 + 0.02 * Math.sin(t3 * 2 + k));
      });
      pets.forEach(function (p) {                                        // (your animals, floating round her)
        var r = p.d.m.root, k = p.k;
        if (p.d.kind === 'glim') {                                       // (Blossom flutters round the wand)
          var ga = t3 * 1.1; wl.armL.localToWorld(palmW.set(0, -0.3, 0.04));
          r.position.set(palmW.x + 0.06, palmW.y + 0.02 + Math.abs(Math.sin(ga * 2)) * 0.03, palmW.z + 0.16); r.rotation.set(0.1, -0.35 + Math.sin(ga) * 0.25, Math.sin(ga * 2) * 0.12);   // (Blossom bobbing just above her open palm, like she's showing her off)
          var m = p.d.m; if (m.wings) m.wings.forEach(function (w) { if (w.pv) w.pv.rotation.z = w.s * (0.35 + Math.sin(t3 * 22 + (w.up ? 0 : 0.5)) * 0.5); });
        } else if (p.d.kind === 'luna' || p.d.kind === 'bubble') {           // (Starla and Marina on their clouds: just a little life in them)
          try { (p.d.kind === 'luna' ? lunaAnimate : bubbleAnimate)(p.d, dt, t3, false); } catch (err) {}
          if (p.d.kind === 'luna') { r.position.set(0, -0.08, 0); r.rotation.set(-0.3 + Math.sin(t3 * 1.3) * 0.05, 0.55 + Math.sin(t3 * 0.5) * 0.1, 0.06); }   // (Starla snuggled up at her side, gazing up at her)
          else { r.position.set(0, -0.08, 0); r.rotation.set(-0.18 + Math.sin(t3 * 0.9) * 0.04, -0.55 + Math.sin(t3 * 0.6) * 0.1, -0.05); }   // (Marina snuggled up at her other side, looking up at her)
          r.updateMatrixWorld(true); r.getWorldPosition(p.glow.position); p.glow.position.y += 0.08; return;
        } else {
          var side = k === 1 ? 1 : -1;
          r.position.set(side * 0.7, 0.18 + Math.sin(t3 * 1.3 + k * 2) * 0.06 + me.position.y * 0.6, 0.25 + k * 0.05); r.rotation.set(Math.sin(t3 * 0.9 + k) * 0.05, -side * 0.45 + Math.sin(t3 * 0.5 + k) * 0.2, Math.sin(t3 * 1.1 + k) * 0.06);
          try { (p.d.kind === 'luna' ? lunaAnimate : bubbleAnimate)(p.d, dt, t3, false); r.position.set(side * 0.7, 0.18 + Math.sin(t3 * 1.3 + k * 2) * 0.06 + me.position.y * 0.6, 0.25 + k * 0.05); } catch (err) {}
        }
        p.glow.position.copy(r.position); p.glow.position.y += 0.08;
      });
      R3.render(TS, cam3);
      if (!shown) { shown = true; cv.style.opacity = 1; }
    }
    function finish() {                                                  // (Play: everyone goes back where they belong, just as they were)
      window.removeEventListener('resize', size);
      wl.armR.remove(wand);
      if (saved.parent) saved.parent.add(player); else scene.add(player);
      player.position.copy(saved.pos); player.rotation.copy(saved.rot); player.visible = saved.vis; body.rotation.copy(saved.body); body.position.copy(saved.bodyPos);
      [wl.armL, wl.armR, wl.legs[0], wl.legs[1], wl.head, wl.hairBack, wl.tip].forEach(function (o, k) { o.rotation.copy(saved.limbs[k]); });
      wl.mFace.map = wl.mFace.emissiveMap = wl.faces[0]; wl.mFace.needsUpdate = true; wl.blink = false;
      wl.chibi.position.copy(saved.chibi); wl.rideBroom.rotation.copy(saved.broomRot); wl.rideBroom.position.copy(saved.broomPos); axeArm.visible = saved.axe; wl.broom.visible = saved.broom; wl.rideBroom.visible = saved.ride;
      pets.forEach(function (p) { var kp = p.keep; kp.tags.forEach(function (o) { o.visible = true; }); (kp.parent || abRoom).add(kp.r); kp.r.position.copy(kp.pos); kp.r.rotation.copy(kp.rot); kp.r.scale.copy(kp.scl); kp.r.visible = kp.vis; });
      setTimeout(function () { R3.dispose(); if (R3.forceContextLoss) R3.forceContextLoss(); }, 1300);
    }
    return { draw: draw, finish: finish };
  })();
  var everdawnFrame = frame;                                          // (while the title screen is up, the island waits: no time passes and nothing moves)
  var titleFrames = 0;
  frame = function () {
    if (window.EVERDAWN_TITLE) { var tdt = Math.min(clock.getDelta(), 0.05); if (title3d) title3d.draw(tdt); if (titleFrames++ % 40 === 0) renderer.render(scene, camera); return; }   // (the island just ticks over now and then behind it, to get everything warmed up)
    if (title3d) { title3d.finish(); title3d = null; }
    if (afterTitle) { var at = afterTitle; afterTitle = null; at(); }   // (then into the save slot you picked)
    everdawnFrame();
  };
  renderer.setAnimationLoop(frame);

});

// ---------- Starting up ----------
// Join the four parts back into one game (so they share the same variables, just as if they were one file) and run it
function startGame(THREE) {
  if (EVERDAWN_PARTS.length !== 4) { showToast('Part of the game is missing: check that script.js, script2.js, script3.js and script4.js are all there.', 60000); return; }
  var src = EVERDAWN_PARTS.map(function (part) { var t = part.toString(); return t.slice(t.indexOf('{') + 1, t.lastIndexOf('}')); }).join('\n');
  new Function('THREE', src)(THREE);
}

// ---------- The title screen ----------
// While the game loads, a painted dawn sky: deep violet melting into rose and peach toward the bottom, twinkling stars
// and the odd shooting star, ribbons of aurora, a crescent moon, wisps of pink cloud, blossom petals drifting down,
// sparkles rising and fireflies blinking. No land: once the game is built, the real you floats in front of it in 3D
// with your wand and three of your animals (that part is made inside the game, just before it starts). The name shines
// over it all, a vine grows along the bottom as the game loads (with little notes about what's being got ready), and
// when it's done a big glowing Play button pops up
var EVERDAWN_TITLE = true;
var everdawnTitle = (function () {
  // Master Volume, on the Audio page: 0 to 10, starting at 5 (everything as loud as it's always been). Every sound in
  // the game, and the title music, passes through one volume knob on its way to the speakers, so this scales them all:
  // 0 is silent and 10 is twice as loud. It's remembered
  var masterGains = [];
  function volumeNow() { try { var v = parseInt(localStorage.getItem('everdawn-master-volume'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applyVolume(v) { masterGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  // SFX Volume, on the Audio page: 0 to 10, starting at 5. It scales just the sound effects (everything the game plays
  // as you do things and touch things), on top of Master Volume; the music and the ambient sounds aren't touched.
  // It's remembered
  var sfxGains = [];
  function sfxNow() { try { var v = parseInt(localStorage.getItem('everdawn-sfx-volume'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applySfx(v) { sfxGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  // Ambient Volume, on the Audio page: 0 to 10, starting at 5. It scales the background sounds of the island and its
  // weather, on top of Master Volume. There aren't any yet; when there are, each one is marked as ambient before it's
  // sent to the speakers (node.evAmbient = true; node.connect(ctx.destination)) and it follows this. It's remembered
  var ambientGains = [];
  function ambientNow() { try { var v = parseInt(localStorage.getItem('everdawn-ambient-volume'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applyAmbient(v) { ambientGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  // Music Volume, on the Audio page: 0 to 10, starting at 5. It scales all the music and only the music (the title
  // tune now; any music added to the game later is marked as music before it's sent to the speakers, with
  // node.evMusic = true, and follows it too), on top of Master Volume. It's remembered
  var musicGains = [];
  function musicNow() { try { var v = parseInt(localStorage.getItem('everdawn-music-volume'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applyMusic(v) { musicGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  // Pet Sound, on the Audio page: 0 to 10, starting at 5. It scales the noises your farm pets make, on top of Master
  // Volume. They don't make any yet; when they do, each noise is marked as a pet sound before it's sent to the speakers
  // (node.evPet = true; node.connect(ctx.destination)) and it follows this. It's remembered
  var petGains = [];
  function petNow() { try { var v = parseInt(localStorage.getItem('everdawn-pet-sound'), 10); if (v >= 0 && v <= 10) return v; } catch (err) {} return 5; }
  function applyPet(v) { petGains.forEach(function (g) { g.gain.setTargetAtTime(v / 5, g.context.currentTime, 0.02); }); }
  if (window.AudioNode && window.AudioDestinationNode) (function () {   // (anything heading for the speakers goes through the knob instead)
    var plain = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (to) {
      if (to instanceof AudioDestinationNode && !this.evMaster) {
        var ctx = to.context;
        if (!ctx.evMaster) { ctx.evMaster = ctx.createGain(); ctx.evMaster.evMaster = true; ctx.evMaster.gain.value = volumeNow() / 5; plain.call(ctx.evMaster, to); masterGains.push(ctx.evMaster); }
        if (this.evPet) {                                              // (the farm pets' noises go through the Pet Sound knob first)
          if (!ctx.evPetG) { ctx.evPetG = ctx.createGain(); ctx.evPetG.gain.value = petNow() / 5; plain.call(ctx.evPetG, ctx.evMaster); petGains.push(ctx.evPetG); }
          return plain.apply(this, [ctx.evPetG].concat(Array.prototype.slice.call(arguments, 1)));
        }
        if (this.evAmbient) {                                          // (background and weather sounds go through the Ambient knob first)
          if (!ctx.evAmb) { ctx.evAmb = ctx.createGain(); ctx.evAmb.gain.value = ambientNow() / 5; plain.call(ctx.evAmb, ctx.evMaster); ambientGains.push(ctx.evAmb); }
          return plain.apply(this, [ctx.evAmb].concat(Array.prototype.slice.call(arguments, 1)));
        }
        if (ctx.evMusic || this.evMusic) {                             // (music goes through the Music knob first)
          if (!ctx.evMus) { ctx.evMus = ctx.createGain(); ctx.evMus.gain.value = musicNow() / 5; plain.call(ctx.evMus, ctx.evMaster); musicGains.push(ctx.evMus); }
          return plain.apply(this, [ctx.evMus].concat(Array.prototype.slice.call(arguments, 1)));
        }
        if (!ctx.evSfx) { ctx.evSfx = ctx.createGain(); ctx.evSfx.gain.value = sfxNow() / 5; plain.call(ctx.evSfx, ctx.evMaster); sfxGains.push(ctx.evSfx); }   // (sound effects go through the SFX knob first)
        return plain.apply(this, [ctx.evSfx].concat(Array.prototype.slice.call(arguments, 1)));
      }
      return plain.apply(this, arguments);
    };
  })();
  try { document.documentElement.classList.toggle('ev-calm', localStorage.getItem('everdawn-excessive-anim') === 'no'); } catch (err) {}   // ("Enable Excessive Animations": No keeps the title screen still)
  var css = document.createElement('style');
  css.textContent =
    '#evTitle{position:fixed;inset:0;z-index:1000;overflow:hidden;background:#241a4a;font-family:Fredoka,system-ui,sans-serif;color:#fff;transition:opacity 1s ease,transform 1.1s ease;user-select:none;-webkit-user-select:none}' +
    '#evTitle.gone{opacity:0;transform:scale(1.08);pointer-events:none}' +
    '#evTitle canvas{position:absolute;inset:0;width:100%;height:100%;display:block}' +
    '#evTitle .ev-ui{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:clamp(24px,7vh,70px) 16px clamp(22px,6vh,56px);box-sizing:border-box;pointer-events:none}' +
    '#evTitle .ev-name{position:relative;text-align:center;animation:evFloat 6s ease-in-out infinite}' +
    '#evTitle h1{margin:0;font-weight:600;font-size:clamp(48px,11vw,112px);letter-spacing:.02em;line-height:1;background:linear-gradient(180deg,#fff8e0 0%,#ffd88a 35%,#ff9ec8 70%,#c8a0ff 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 18px rgba(255,190,230,.55)) drop-shadow(0 4px 0 rgba(80,40,130,.55))}' +
    '#evTitle .ev-sub{margin-top:10px;font-size:clamp(15px,2.6vw,21px);font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#ffe6f4;text-shadow:0 2px 10px rgba(60,20,110,.8)}' +
    '#evTitle .ev-star{position:absolute;color:#ffe9a8;text-shadow:0 0 12px #ffd27a;animation:evTwinkle 2.4s ease-in-out infinite}' +
    '#evTitle .ev-bottom{display:flex;flex-direction:column;align-items:center;gap:14px;width:min(520px,92vw);pointer-events:auto}' +
    '#evTitle .ev-load{width:100%;transition:opacity .5s,transform .5s}' +
    '#evTitle .ev-load.done{opacity:0;transform:translateY(10px)}' +
    '#evTitle .ev-track{position:relative;height:18px;border-radius:999px;background:rgba(30,16,60,.55);box-shadow:inset 0 2px 6px rgba(0,0,0,.45),0 0 0 2px rgba(255,220,250,.35);overflow:visible}' +
    '#evTitle .ev-fill{position:absolute;left:3px;top:3px;bottom:3px;width:0;border-radius:999px;background:linear-gradient(90deg,#5fbf72,#9be07c 50%,#d6f59a);box-shadow:0 0 12px rgba(160,240,140,.7);overflow:hidden}' +
    '#evTitle .ev-fill::after{content:"";position:absolute;inset:0;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.65) 50%,transparent 70%);background-size:200% 100%;animation:evShine 1.6s linear infinite}' +
    '#evTitle .ev-bud{position:absolute;top:50%;width:26px;height:26px;margin:-13px 0 0 -13px;left:0;font-size:22px;line-height:26px;text-align:center;filter:drop-shadow(0 0 6px #ffb3e6);transition:left .25s linear}' +
    '#evTitle .ev-leaf{position:absolute;top:-7px;width:10px;height:7px;background:#7ed37a;border-radius:10px 0 10px 0;transform-origin:bottom left;opacity:0;transition:opacity .4s,transform .4s;transform:scale(.2) rotate(-20deg)}' +
    '#evTitle .ev-leaf.b{top:auto;bottom:-7px;border-radius:0 10px 0 10px;transform-origin:top left}' +
    '#evTitle .ev-leaf.on{opacity:1;transform:scale(1) rotate(-20deg)}' +
    '#evTitle .ev-status{margin-top:12px;display:flex;justify-content:space-between;gap:12px;font-size:clamp(13px,2.2vw,16px);color:#f6e6ff;text-shadow:0 1px 6px rgba(40,10,80,.9)}' +
    '#evTitle .ev-tip{transition:opacity .4s}' +
    '#evTitle .ev-play{position:relative;display:none;padding:.55em 1.2em;font:600 clamp(16px,3vw,21px) Fredoka,system-ui,sans-serif;letter-spacing:.04em;color:#fff;border:2px solid #ffe2a0;border-radius:999px;cursor:pointer;background:linear-gradient(180deg,#c48cff 0%,#8f5be8 55%,#7442d0 100%);box-shadow:0 6px 0 #4e2b9c,0 10px 30px rgba(120,60,220,.6),0 0 40px rgba(255,170,230,.55),inset 0 2px 0 rgba(255,255,255,.45);text-shadow:0 2px 0 rgba(60,20,120,.6);overflow:hidden;transform:scale(.2);opacity:0;transition:transform .25s}' +
    '#evTitle .ev-play.show{display:block;animation:evPop .7s cubic-bezier(.2,1.6,.4,1) forwards,evPulse 2.6s ease-in-out .8s infinite}' +
    '#evTitle .ev-play::before{content:"";position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg);animation:evSweep 3s ease-in-out 1s infinite}' +
    '#evTitle .ev-play:hover{filter:brightness(1.08)}#evTitle .ev-play:active{transform:translateY(4px) scale(.98)!important;box-shadow:0 2px 0 #4e2b9c,0 6px 20px rgba(120,60,220,.6)}' +
    '#evTitle .ev-play:focus-visible{outline:3px solid #fff;outline-offset:5px}' +
    '#evTitle .ev-hint{display:none;font-size:clamp(13px,2.2vw,15px);color:#f3e2ff;text-shadow:0 1px 6px rgba(40,10,80,.9);opacity:0;animation:evFade 1s ease .6s forwards}' +
    '#evTitle .ev-hint.show{display:block}' +
    '#evTitle .ev-slots{position:absolute;inset:0;z-index:4;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(20,10,45,.42);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}' +
    '#evTitle .ev-slots.open{display:flex;animation:evFade .3s ease forwards}' +
    '#evTitle .ev-scard{width:min(520px,100%);max-height:calc(100% - 8px);overflow:auto;box-sizing:border-box;padding:20px 18px 16px;border-radius:24px;border:2.5px solid #ffe2a0;background:linear-gradient(180deg,rgba(100,64,170,.94),rgba(58,34,112,.96));box-shadow:0 18px 50px rgba(10,0,30,.6),inset 0 2px 0 rgba(255,255,255,.25);color:#fff;font-family:Fredoka,system-ui,sans-serif}' +
    '#evTitle .ev-scard h2{margin:0 0 14px;text-align:center;font-size:clamp(22px,4.5vw,28px);font-weight:600;color:#ffe9b8;text-shadow:0 2px 8px rgba(255,170,230,.5)}' +
    '#evTitle .ev-slot{display:flex;align-items:stretch;gap:8px;margin:0 0 10px}' +
    '#evTitle .ev-sbtn{flex:1;display:flex;align-items:center;gap:12px;min-width:0;padding:10px 14px;text-align:left;font:inherit;color:#fff;border:2px solid rgba(255,220,250,.35);border-radius:16px;cursor:pointer;background:rgba(30,15,65,.55);transition:background .15s,border-color .15s,transform .1s}' +
    '#evTitle .ev-sbtn:hover{background:rgba(120,80,200,.55);border-color:#ffe2a0}#evTitle .ev-sbtn:active{transform:scale(.98)}#evTitle .ev-sbtn:focus-visible,#evTitle .ev-sdel:focus-visible,#evTitle .ev-back:focus-visible{outline:3px solid #fff;outline-offset:3px}' +
    '#evTitle .ev-snum{flex:none;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:600;color:#4e2b9c;background:linear-gradient(180deg,#fff2c8,#ffd27a);box-shadow:0 2px 0 #b8892e}' +
    '#evTitle .ev-sbtn.empty .ev-snum{color:#fff;background:rgba(255,255,255,.12);box-shadow:none;border:2px dashed rgba(255,220,250,.45)}' +
    '#evTitle .ev-stxt{min-width:0;display:flex;flex-direction:column;gap:2px}#evTitle .ev-stxt b{font-size:17px;font-weight:600}#evTitle .ev-stxt span{font-size:14px;color:#f0e2ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#evTitle .ev-stxt i{font-style:normal;font-size:12px;color:#ffd6f0;opacity:.85}#evTitle .ev-last{margin-left:6px;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:600;color:#4e2b9c;background:#ffd27a;vertical-align:2px}' +
    '#evTitle .ev-sdel{flex:none;width:46px;font-size:18px;color:#fff;border:2px solid rgba(255,220,250,.3);border-radius:14px;cursor:pointer;background:rgba(30,15,65,.55)}#evTitle .ev-sdel:hover{background:rgba(200,70,110,.6)}' +
    '#evTitle .ev-sask{flex:1;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 14px;border-radius:16px;border:2px solid #ff9ab8;background:rgba(120,30,70,.55);font-size:16px}' +
    '#evTitle .ev-sask button{padding:.3em .9em;font:600 15px Fredoka,system-ui,sans-serif;color:#fff;border:2px solid rgba(255,255,255,.6);border-radius:999px;cursor:pointer;background:rgba(255,255,255,.12);margin-left:6px}#evTitle .ev-sask .yes{background:#d8507c;border-color:#ffb0c8}' +
    '#evTitle .ev-back{display:block;margin:12px auto 0;padding:.4em 1.8em;font:600 17px Fredoka,system-ui,sans-serif;color:#fff;border:2px solid #ffe2a0;border-radius:999px;cursor:pointer;background:linear-gradient(180deg,rgba(150,110,220,.75),rgba(90,55,160,.8));box-shadow:0 3px 0 #3e2580}' +
    '#evTitle .ev-sname{flex:1;display:flex;flex-direction:column;gap:8px;padding:12px 14px;border-radius:16px;border:2px solid #ffe2a0;background:rgba(60,30,110,.7)}#evTitle .ev-sname label{font-size:17px;font-weight:600;color:#ffe9b8}' +
    '#evTitle .ev-sname input{box-sizing:border-box;width:100%;padding:.5em .8em;font:500 17px Fredoka,system-ui,sans-serif;color:#3a2270;border:2px solid #ffd27a;border-radius:12px;background:#fff8ee;outline:none}#evTitle .ev-sname input:focus{box-shadow:0 0 0 3px rgba(255,158,203,.6)}' +
    '#evTitle .ev-sname span{display:flex;gap:8px;justify-content:flex-end}#evTitle .ev-sname button{padding:.35em 1.2em;font:600 16px Fredoka,system-ui,sans-serif;color:#fff;border:2px solid rgba(255,255,255,.6);border-radius:999px;cursor:pointer;background:rgba(255,255,255,.12)}' +
    '#evTitle .ev-sname .go{background:linear-gradient(180deg,#ff9ecb,#d8609c);border-color:#ffe2a0}#evTitle .ev-sname .go:disabled{opacity:.45;cursor:default}#evTitle .ev-sname button:focus-visible{outline:3px solid #fff;outline-offset:3px}' +
    '#evTitle .ev-sethead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 6px}' +
    '#evTitle .ev-sethead h2{margin:0;flex:1}' +
    '#evTitle .ev-pg{flex:none;width:42px;height:42px;font:600 24px Fredoka,system-ui,sans-serif;line-height:1;color:#fff;border:2px solid #ffe2a0;border-radius:50%;cursor:pointer;background:linear-gradient(180deg,rgba(150,110,220,.75),rgba(90,55,160,.8));box-shadow:0 3px 0 #3e2580}' +
    '#evTitle .ev-pg:disabled{opacity:.3;cursor:default;box-shadow:none}#evTitle .ev-pg:focus-visible{outline:3px solid #fff;outline-offset:3px}' +
    '#evTitle .ev-dots{display:flex;justify-content:center;gap:7px;margin:0 0 12px}#evTitle .ev-dots i{width:8px;height:8px;border-radius:50%;background:rgba(255,220,250,.3)}#evTitle .ev-dots i.on{background:#ffd27a}' +
    '#evTitle .ev-setbody{min-height:clamp(160px,32vh,280px);border-radius:16px;border:2px solid rgba(255,220,250,.25);background:rgba(30,15,65,.45)}#evTitle .ev-bk .ev-sbtn{flex:none}html.ev-bright #game,html.ev-bright #evTitle canvas{filter:brightness(var(--ev-bright,1))}#evTitle .ev-dlg-sample{margin:4px 0 0;padding:10px 14px;border-radius:14px;background:rgba(255,248,238,.95);color:#3a2270;font-size:var(--ev-dialogue-size,17px);font-weight:var(--ev-dialogue-weight,400);line-height:1.4}#evTitle .ev-srow.ev-tog{flex-direction:row;align-items:center;justify-content:space-between;gap:12px}#evTitle .ev-tog .ev-lbl{flex:1;min-width:0}#evTitle .ev-tog .ev-seg{align-self:center;flex:none}@media (max-width:520px){#evTitle .ev-tog .ev-lbl{font-size:16px}#evTitle .ev-tog .ev-seg button{padding:.35em .8em;font-size:14px}}#evTitle .ev-sbak{font-size:20px}#evTitle .ev-sett .ev-scard{display:flex;flex-direction:column;overflow:hidden}#evTitle .ev-sett .ev-scard>*{flex:none}#evTitle .ev-sett .ev-scard>.ev-setbody{flex:0 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain}' +
    '#evTitle .ev-setbody{box-sizing:border-box;padding:14px 16px}#evTitle .ev-srow{display:flex;flex-direction:column;gap:8px;padding:6px 2px 12px;border-bottom:1px solid rgba(255,220,250,.18)}' +
    '#evTitle .ev-lrow{display:flex;align-items:baseline;justify-content:space-between;gap:10px}#evTitle .ev-lrow output{font-size:17px;font-weight:600;color:#ffd6f0;min-width:3.2em;text-align:right}' +
    '#evTitle .ev-srow label,#evTitle .ev-srow .ev-lbl{font-size:18px;font-weight:600;color:#ffe9b8}#evTitle .ev-srow+.ev-srow{padding-top:12px}' +
    '#evTitle .ev-seg{display:inline-flex;align-self:flex-start;border:2px solid #ffe2a0;border-radius:999px;overflow:hidden;background:rgba(30,15,60,.6)}' +
    '#evTitle .ev-seg button{padding:.35em 1.5em;font:600 16px Fredoka,system-ui,sans-serif;color:#f0e2ff;border:0;background:transparent;cursor:pointer}#evTitle .ev-seg button+button{border-left:2px solid rgba(255,226,160,.5)}' +
    '#evTitle .ev-seg button.on{color:#fff;background:linear-gradient(180deg,#ff9ecb,#d8609c)}#evTitle .ev-seg button:focus-visible{outline:3px solid #fff;outline-offset:-3px}' +
    '#evTitle .ev-range{display:flex;align-items:center;gap:10px;font-size:14px;color:#f0e2ff}' +
    '#evTitle .ev-range input{flex:1;min-width:0;height:28px;accent-color:#ff9ecb;cursor:pointer}#evTitle .ev-range input:focus-visible{outline:2px solid #fff;outline-offset:3px;border-radius:6px}' +
    '#evTitle .ev-btns{display:flex;align-items:center;justify-content:center;gap:clamp(10px,2.5vw,18px);flex-wrap:nowrap;width:max-content;max-width:96vw}' +
    '#evTitle .ev-opt{display:none;padding:.55em 1.2em;font:600 clamp(16px,3vw,21px) Fredoka,system-ui,sans-serif;letter-spacing:.04em;color:#fff;border:2px solid rgba(255,226,160,.85);border-radius:999px;cursor:pointer;background:linear-gradient(180deg,rgba(150,110,220,.75),rgba(90,55,160,.8));box-shadow:0 4px 0 #3e2580,0 8px 20px rgba(60,20,120,.45),inset 0 2px 0 rgba(255,255,255,.35);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);opacity:0;animation:evFade .6s ease .3s forwards}' +
    '#evTitle .ev-opt.show{display:inline-block}#evTitle .ev-opt:hover{filter:brightness(1.1)}#evTitle .ev-opt:active{transform:translateY(3px);box-shadow:0 1px 0 #3e2580,0 4px 12px rgba(60,20,120,.45)}#evTitle .ev-opt:focus-visible{outline:3px solid #fff;outline-offset:4px}' +
    '#evTitle .ev-music{position:absolute;top:max(12px,env(safe-area-inset-top));right:12px;z-index:3;padding:.45em .9em;font:500 14px Fredoka,system-ui,sans-serif;color:#fff;background:rgba(40,20,80,.45);border:1.5px solid rgba(255,220,250,.55);border-radius:999px;cursor:pointer;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}' +
    '#evTitle .ev-music:hover{background:rgba(70,40,120,.6)}#evTitle .ev-music:focus-visible{outline:2px solid #fff;outline-offset:3px}' +
    '@keyframes evFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}' +
    '@keyframes evTwinkle{0%,100%{opacity:.35;transform:scale(.7) rotate(0)}50%{opacity:1;transform:scale(1.15) rotate(20deg)}}' +
    '@keyframes evShine{from{background-position:200% 0}to{background-position:-200% 0}}' +
    '@keyframes evPop{to{transform:scale(1);opacity:1}}' +
    '@keyframes evPulse{0%,100%{box-shadow:0 6px 0 #4e2b9c,0 10px 30px rgba(120,60,220,.6),0 0 30px rgba(255,170,230,.45),inset 0 2px 0 rgba(255,255,255,.45)}50%{box-shadow:0 6px 0 #4e2b9c,0 10px 34px rgba(120,60,220,.7),0 0 60px rgba(255,190,240,.85),inset 0 2px 0 rgba(255,255,255,.45)}}' +
    '@keyframes evSweep{0%,60%{left:-60%}100%{left:130%}}' +
    '@keyframes evFade{to{opacity:1}}' +
    '@media (prefers-reduced-motion:reduce){#evTitle *{animation-duration:0s!important;animation-iteration-count:1!important}}' +
    'html.ev-calm #evTitle *,html.ev-calm #evTitle *::before,html.ev-calm #evTitle *::after,html.ev-calm .spark,html.ev-calm .coins{animation-duration:0s!important;animation-iteration-count:1!important}';   // ("Enable Excessive Animations" set to No: all of it keeps still)
  document.head.appendChild(css);
  var root = document.createElement('div'); root.id = 'evTitle';
  root.innerHTML = '<canvas></canvas><div class="ev-ui"><div class="ev-name"><span class="ev-star" style="left:-.9em;top:.1em;font-size:34px">✦</span><span class="ev-star" style="right:-.7em;top:-.3em;font-size:24px;animation-delay:.8s">✧</span><span class="ev-star" style="right:-1.2em;bottom:.4em;font-size:16px;animation-delay:1.5s">✦</span><h1>Everdawn</h1><div class="ev-sub">a cozy, magical farm</div></div>' +
    '<div class="ev-bottom"><div class="ev-load"><div class="ev-track"><div class="ev-fill"></div><div class="ev-bud">🌸</div></div><div class="ev-status"><span class="ev-tip">Opening the gate…</span><span class="ev-pct">0%</span></div></div>' +
    '<div class="ev-btns"><button type="button" class="ev-play">✦ Play ✦</button><button type="button" class="ev-opt"><span aria-hidden="true">⚙</span> Settings</button></div><div class="ev-hint">Press Enter or tap Play</div></div></div>';
  (document.body || document.documentElement).appendChild(root);
  var prevOverflow = document.body ? document.body.style.overflow : ''; if (document.body) document.body.style.overflow = 'hidden';
  var cv = root.querySelector('canvas'), g = cv.getContext('2d'), track = root.querySelector('.ev-track'), fill = root.querySelector('.ev-fill'), bud = root.querySelector('.ev-bud');
  var tipEl = root.querySelector('.ev-tip'), pctEl = root.querySelector('.ev-pct'), playBtn = root.querySelector('.ev-play'), optBtn = root.querySelector('.ev-opt'), hint = root.querySelector('.ev-hint'), load = root.querySelector('.ev-load');
  for (var lf = 0; lf < 9; lf++) { var leaf = document.createElement('i'); leaf.className = 'ev-leaf' + (lf % 2 ? ' b' : ''); leaf.style.left = (8 + lf * 10.5) + '%'; track.appendChild(leaf); }
  var leaves = track.querySelectorAll('.ev-leaf');

  // ----- the painted scene -----
  var W = 0, H = 0, DPR = 1, t0 = performance.now(), last = t0;
  function rnd(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  var moonSpr = null, stars = [], clouds = [], motes = [], flies = [], petals = [], shoot = null;
  var planetSpr = null;
  for (var i = 0; i < 260; i++) stars.push({ x: rnd(i), y: Math.pow(rnd(i + 500), 1.6) * 0.62, r: 0.4 + rnd(i + 900) * 1.4, p: rnd(i + 1300) * 6.28, s: 0.6 + rnd(i + 1700) * 2.2, big: rnd(i + 2100) > 0.96 });
  for (i = 0; i < 9; i++) clouds.push({ x: rnd(i + 40), y: [0.3, 0.42, 0.9][i % 3] + rnd(i + 60) * 0.1, w: 0.14 + rnd(i + 80) * 0.16, sp: 0.004 + rnd(i + 99) * 0.008, layer: i % 3 });
  for (i = 0; i < 70; i++) motes.push({ x: rnd(i + 3000), y: rnd(i + 3100), r: 0.6 + rnd(i + 3200) * 1.8, sp: 0.01 + rnd(i + 3300) * 0.03, p: rnd(i + 3400) * 6.28, hue: [320, 280, 45, 190][i % 4] });
  for (i = 0; i < 26; i++) flies.push({ x: rnd(i + 4000), y: 0.6 + rnd(i + 4100) * 0.38, p: rnd(i + 4200) * 6.28, sp: 0.3 + rnd(i + 4300) * 0.6 });
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); g.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize(); window.addEventListener('resize', resize);
  var glowCache = {};
  function glow(x, y, r, col, a) {                                   // (a soft round glow, from a little picture made once for each colour)
    if (a <= 0.003 || r <= 0) return;
    var key = col, spr = glowCache[key];
    if (!spr) { spr = glowCache[key] = document.createElement('canvas'); spr.width = spr.height = 64; var sg = spr.getContext('2d'), gr = sg.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, col.replace('A', 1)); gr.addColorStop(0.4, col.replace('A', 0.45)); gr.addColorStop(1, col.replace('A', 0)); sg.fillStyle = gr; sg.fillRect(0, 0, 64, 64); }
    g.globalAlpha = Math.min(1, a); g.drawImage(spr, x - r, y - r, r * 2, r * 2); g.globalAlpha = 1;
  }
  function cloud(x, y, w, col) {
    g.fillStyle = col; g.beginPath();
    for (var k = 0; k < 7; k++) { var cx = x + (k / 6 - 0.5) * w, cy = y - Math.sin(k / 6 * Math.PI) * w * 0.16, r = w * (0.12 + Math.sin(k / 6 * Math.PI) * 0.1); g.moveTo(cx + r, cy); g.arc(cx, cy, r, 0, 6.2832); }
    g.rect(x - w / 2, y - w * 0.04, w, w * 0.1); g.fill();
  }
  var TAU = 6.2832;
  function spark4(x, y, r, col) {                                    // (a little four-pointed twinkle)
    g.fillStyle = col; g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
  }
  var isles = {};
  function makeIsle(kind) {                                          // (a little floating island, painted once at double size: 320 wide, its grassy top at y 200, with room above for the tower's weather vane)
    var c = document.createElement('canvas'); c.width = 960; c.height = 1170; var q = c.getContext('2d'); q.scale(3, 3); q.translate(0, 30);
    var k, j, N = 22, pts = [], sd = kind === 'tower' ? 10 : 90, tower = kind === 'tower', TX = 170;
    function R(n) { return rnd(n * 1.37 + sd); }
    function rr(x, y, w, h, r) { q.beginPath(); q.moveTo(x + r, y); q.arcTo(x + w, y, x + w, y + h, r); q.arcTo(x + w, y + h, x, y + h, r); q.arcTo(x, y + h, x, y, r); q.arcTo(x, y, x + w, y, r); q.closePath(); }
    function E(x, y, rx, ry, col, rot) { q.fillStyle = col; q.beginPath(); q.ellipse(x, y, rx, ry, rot || 0, 0, TAU); q.fill(); }
    function leaf(x, y, s, a, col) { q.save(); q.translate(x, y); q.rotate(a); q.fillStyle = col; q.beginPath(); q.moveTo(0, 0); q.quadraticCurveTo(s * 0.6, -s * 0.5, s * 1.2, 0); q.quadraticCurveTo(s * 0.6, s * 0.5, 0, 0); q.fill(); q.restore(); }
    // ----- the rock underneath -----
    for (k = 0; k <= N; k++) { var f = k / N; pts.push([28 + 264 * f + (k && k < N ? (R(k) - 0.5) * 10 : 0), 204 + Math.pow(Math.sin(Math.PI * f), 0.8) * (118 + R(k + 30) * 42) * (k % 2 ? 0.8 : 1)]); }
    function rock() { q.beginPath(); q.moveTo(28, 200); pts.forEach(function (p) { q.lineTo(p[0], p[1]); }); q.lineTo(292, 200); q.closePath(); }
    var rg = q.createLinearGradient(0, 195, 0, 350); rg.addColorStop(0, '#8a68ab'); rg.addColorStop(0.3, '#4c3676'); rg.addColorStop(1, '#1a1034');
    rock(); q.fillStyle = rg; q.fill();
    q.save(); rock(); q.clip();
    if (tower) for (k = 0; k < 16; k++) {                             // (the rock built of great rounded boulders, each lit from the upper left)
      var lbx = 40 + k * 15.5 + (R(k + 3500) - 0.5) * 8, lbf = (lbx - 28) / 264, lbd = Math.pow(Math.sin(Math.PI * Math.max(0.02, Math.min(0.98, lbf))), 0.8) * 120, lby = 210 + lbd * (0.25 + R(k + 3510) * 0.45), lbr = 14 + R(k + 3520) * 12;
      var lbg = q.createRadialGradient(lbx - lbr * 0.4, lby - lbr * 0.45, lbr * 0.1, lbx, lby, lbr); lbg.addColorStop(0, 'rgba(150,118,190,.75)'); lbg.addColorStop(0.5, 'rgba(84,60,124,.6)'); lbg.addColorStop(1, 'rgba(26,16,52,.75)');
      q.fillStyle = lbg; q.beginPath(); q.ellipse(lbx, lby, lbr, lbr * 0.8, (R(k + 3530) - 0.5) * 0.6, 0, TAU); q.fill();
      q.strokeStyle = 'rgba(255,220,250,.16)'; q.lineWidth = 0.8; q.beginPath(); q.ellipse(lbx, lby, lbr * 0.96, lbr * 0.77, (R(k + 3530) - 0.5) * 0.6, Math.PI * 1.05, Math.PI * 1.5); q.stroke();
    }
    for (k = 0; k < N; k++) { var p1 = pts[k], p2 = pts[k + 1], fx = (p1[0] + p2[0]) / 2 + (R(k + 70) - 0.5) * 24, fy = 204 + (Math.max(p1[1], p2[1]) - 204) * (0.3 + R(k + 80) * 0.3);   // (chiseled facets, lit from the left)
      q.fillStyle = k < N * 0.45 ? 'rgba(255,200,240,' + (0.05 + R(k + 60) * 0.1) + ')' : 'rgba(20,8,45,' + (0.1 + R(k + 60) * 0.18) + ')'; q.beginPath(); q.moveTo(p1[0], p1[1]); q.lineTo(p2[0], p2[1]); q.lineTo(fx, fy); q.closePath(); q.fill(); }
    for (k = 0; k < 6; k++) { q.strokeStyle = 'rgba(20,10,40,.35)'; q.lineWidth = 2; q.beginPath(); q.moveTo(20, 222 + k * 20); q.bezierCurveTo(110, 214 + k * 22 + R(k) * 12, 210, 230 + k * 18, 300, 218 + k * 21); q.stroke(); q.strokeStyle = 'rgba(255,220,250,.08)'; q.lineWidth = 1; q.beginPath(); q.moveTo(20, 224 + k * 20); q.bezierCurveTo(110, 216 + k * 22 + R(k) * 12, 210, 232 + k * 18, 300, 220 + k * 21); q.stroke(); }   // (layers of rock)
    for (k = 0; k < 16; k++) { var cx = 38 + k * 16 + R(k + 100) * 8, yy = 206; q.strokeStyle = 'rgba(12,6,30,.28)'; q.lineWidth = 0.5 + R(k + 110) * 0.6; q.beginPath(); q.moveTo(cx, yy); while (yy < 345) { yy += 6 + R(yy + k * 7) * 12; cx += (R(yy * 3 + k) - 0.5) * 7; q.lineTo(cx, yy); } q.stroke(); }   // (cracks)
    for (k = 0; k < 40; k++) { var bx = 34 + R(k + 140) * 252, by = 210 + R(k + 150) * 100, br = 1.5 + R(k + 160) * 3.5; E(bx, by + 0.6, br, br * 0.6, 'rgba(15,6,35,.35)'); E(bx - 0.4, by - 0.4, br * 0.8, br * 0.45, 'rgba(255,225,250,.12)'); }   // (knobbly stones in it)
    for (k = 0; k < 24; k++) { var mx = 34 + R(k + 200) * 252, my = 206 + R(k + 210) * 44 * (1 - Math.abs(mx - 160) / 170); E(mx, my, 3 + R(k + 230) * 6, 1.2 + R(k + 240) * 1.6, 'rgba(84,165,118,' + (0.2 + R(k + 220) * 0.25) + ')'); E(mx - 0.6, my - 0.5, 2 + R(k + 230) * 3, 0.6, 'rgba(170,240,190,.22)'); }   // (moss on the ledges)
    var lg = q.createLinearGradient(30, 0, 290, 0); lg.addColorStop(0, 'rgba(255,190,230,.32)'); lg.addColorStop(0.3, 'rgba(255,190,230,0)'); lg.addColorStop(0.75, 'rgba(120,200,255,0)'); lg.addColorStop(1, 'rgba(140,210,255,.22)'); q.fillStyle = lg; q.fillRect(0, 190, 320, 170);
    if (tower) {
      var cvg = q.createRadialGradient(112, 246, 1, 112, 244, 20); cvg.addColorStop(0, '#05030e'); cvg.addColorStop(1, '#2a1a48');   // (a little cave, with glowing mushrooms in it)
      q.fillStyle = cvg; q.beginPath(); q.moveTo(94, 252); q.quadraticCurveTo(96, 232, 112, 231); q.quadraticCurveTo(128, 232, 130, 252); q.quadraticCurveTo(112, 256, 94, 252); q.fill();
      q.strokeStyle = 'rgba(255,220,250,.25)'; q.lineWidth = 1; q.beginPath(); q.moveTo(94, 252); q.quadraticCurveTo(96, 232, 112, 231); q.stroke();
      [[100, 251, 3.4], [106, 252, 2.2], [119, 251, 2.8], [125, 252, 2], [112, 252.5, 1.6]].forEach(function (m) { var mg2 = q.createRadialGradient(m[0], m[1] - 2, 0, m[0], m[1] - 2, m[2] * 4); mg2.addColorStop(0, 'rgba(120,255,230,.55)'); mg2.addColorStop(1, 'rgba(120,255,230,0)'); q.fillStyle = mg2; q.fillRect(m[0] - m[2] * 4, m[1] - 2 - m[2] * 4, m[2] * 8, m[2] * 8); q.fillStyle = '#d8fff4'; q.fillRect(m[0] - 0.5, m[1] - m[2], 1, m[2]); q.fillStyle = '#7af0e0'; q.beginPath(); q.arc(m[0], m[1] - m[2], m[2] * 0.75, Math.PI, 0); q.fill(); });
      q.save(); q.shadowColor = '#8ee8ff'; q.shadowBlur = 4; q.strokeStyle = 'rgba(175,240,255,.55)'; q.lineWidth = 0.6;   // (old runes carved in the rock, still glowing)
      [[160, 254], [190, 238], [142, 276], [118, 280], [172, 296]].forEach(function (p, i) { q.save(); q.translate(p[0], p[1]); q.scale(0.62, 0.62); q.translate(-p[0], -p[1]); q.beginPath(); q.arc(p[0], p[1], 4.5, 0, TAU); if (i % 3 === 0) { q.moveTo(p[0], p[1] - 4.5); q.lineTo(p[0], p[1] + 4.5); q.moveTo(p[0] - 3, p[1] - 1); q.lineTo(p[0] + 3, p[1] - 1); } else if (i % 3 === 1) { q.moveTo(p[0], p[1] - 3); q.lineTo(p[0] + 2.6, p[1] + 2); q.lineTo(p[0] - 2.6, p[1] + 2); q.closePath(); } else { q.moveTo(p[0] - 2.5, p[1] + 2.5); q.lineTo(p[0], p[1] - 2.5); q.lineTo(p[0] + 2.5, p[1] + 2.5); q.moveTo(p[0] + 0.6, p[1] + 1); q.arc(p[0], p[1] + 1, 0.6, 0, TAU); } q.stroke(); q.restore(); });
      q.restore();
      q.save(); q.shadowColor = '#7ae0ff'; q.shadowBlur = 3; q.strokeStyle = 'rgba(150,230,255,.4)'; q.lineWidth = 0.6;   // (veins of light running through the rock)
      for (k = 0; k < 7; k++) { var vx0 = 50 + k * 34 + R(k + 1300) * 10, vy0 = 214 + R(k + 1310) * 20; q.beginPath(); q.moveTo(vx0, vy0); for (j = 0; j < 6; j++) { vx0 += (R(k * 9 + j + 1320) - 0.5) * 14; vy0 += 6 + R(k * 9 + j + 1330) * 10; q.lineTo(vx0, vy0); } q.stroke(); }
      q.restore();
      var wet = q.createLinearGradient(214, 0, 248, 0); wet.addColorStop(0, 'rgba(10,20,45,0)'); wet.addColorStop(0.5, 'rgba(10,20,45,.55)'); wet.addColorStop(1, 'rgba(10,20,45,0)'); q.fillStyle = wet; q.fillRect(212, 212, 38, 130);   // (rock dark and wet behind the waterfall)
      q.strokeStyle = 'rgba(160,230,255,.18)'; q.lineWidth = 0.5; for (k = 0; k < 6; k++) { q.beginPath(); q.moveTo(220 + k * 4, 216); q.lineTo(221 + k * 4.2, 300); q.stroke(); }
      var ao = q.createLinearGradient(0, 204, 0, 226); ao.addColorStop(0, 'rgba(10,5,25,.6)'); ao.addColorStop(1, 'rgba(10,5,25,0)'); q.fillStyle = ao; q.fillRect(20, 204, 280, 22);   // (deep shade under the turf)
    }
    q.restore();
    rock(); q.strokeStyle = 'rgba(12,6,28,.55)'; q.lineWidth = 1; q.stroke();
    for (k = 0; k < 10; k++) { var ox = 46 + k * 25 + R(k + 300) * 10; q.strokeStyle = 'rgba(92,62,48,.8)'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(ox, 204); q.bezierCurveTo(ox - 4, 214, ox + 5, 220, ox + 1, 226 + R(k + 310) * 16); q.stroke(); }   // (roots poking out)
    for (k = 0; k < 15; k++) {                                        // (vines hanging down, with leaves)
      var vx = 44 + k * 16.5 + R(k + 70) * 8, vl = 30 + R(k + 9) * 55, vb = R(k + 5) * 10 - 5;
      if (tower && vx > 208 && vx < 252) continue;                    // (not where the waterfall goes over)
      q.strokeStyle = 'rgba(70,140,100,.85)'; q.lineWidth = 1.1; q.beginPath(); q.moveTo(vx, 205); q.quadraticCurveTo(vx + vb, 205 + vl * 0.5, vx + vb * 0.4, 205 + vl); q.stroke();
      for (j = 1; j < 7; j++) { var tt = j / 7, lx2 = vx + vb * 2 * tt * (1 - tt) + vb * 0.4 * tt * tt, ly2 = 205 + vl * tt; leaf(lx2, ly2, 3 + R(k * 7 + j) * 1.6, (j % 2 ? 0.6 : 2.5) + R(j + k) * 0.4, ['#4fa070', '#6cc08a', '#3b8058'][(j + k) % 3]); }
      if (k % 4 === 1) E(vx + vb * 0.4, 205 + vl + 2, 1.8, 1.8, '#ffd0ea');
    }
    if (tower) {
      for (k = 0; k < 7; k++) { var sx4 = 76 + k * 3, sy4 = 212 + k * 6; q.fillStyle = 'rgba(15,6,35,.5)'; q.fillRect(sx4 - 5, sy4 + 1.4, 11, 1.8); q.fillStyle = '#b4a8cc'; q.fillRect(sx4 - 5, sy4, 11, 1.9); q.fillStyle = 'rgba(255,255,255,.3)'; q.fillRect(sx4 - 5, sy4, 11, 0.5); }   // (steps cut down the rock to the cave)
      q.strokeStyle = '#8a6a4a'; q.lineWidth = 0.7; for (k = 0; k < 7; k += 2) { q.beginPath(); q.moveTo(71 + k * 3, 212 + k * 6); q.lineTo(71 + k * 3, 206 + k * 6); q.stroke(); }
      q.strokeStyle = 'rgba(220,190,140,.85)'; q.lineWidth = 0.4; q.beginPath(); q.moveTo(71, 206); for (k = 2; k < 7; k += 2) q.quadraticCurveTo(71 + k * 3 - 3, 206 + k * 6 - 3, 71 + k * 3, 206 + k * 6); q.stroke();   // (a rope rail)
      q.strokeStyle = '#2e2438'; q.lineWidth = 0.7; q.beginPath(); q.moveTo(131, 238); q.lineTo(135, 238); q.lineTo(135, 240); q.stroke(); q.fillStyle = '#2e2438'; q.fillRect(133, 240, 4, 0.8); q.fillStyle = '#ffd486'; q.fillRect(133.3, 240.8, 3.4, 4); q.fillStyle = '#2e2438'; q.fillRect(133, 244.8, 4, 0.8);   // (a lantern at the cave)
      [[60, 236, 8], [178, 272, 7], [128, 300, 6], [262, 230, 5]].forEach(function (l) { E(l[0], l[1] + 1.2, l[2], 1.8, 'rgba(10,5,25,.5)'); E(l[0], l[1], l[2], 1.8, '#7a62a0'); E(l[0], l[1] - 0.8, l[2] * 0.9, 1, '#5aa88a');   // (little ledges, with grass and a toadstool)
        q.strokeStyle = '#7ad0a0'; q.lineWidth = 0.5; for (j = 0; j < 4; j++) { q.beginPath(); q.moveTo(l[0] - l[2] * 0.6 + j * l[2] * 0.4, l[1] - 0.8); q.lineTo(l[0] - l[2] * 0.6 + j * l[2] * 0.4 + 0.5, l[1] - 3.5); q.stroke(); }
        q.fillStyle = '#f2e6d8'; q.fillRect(l[0] + l[2] * 0.4 - 0.3, l[1] - 2.6, 0.6, 1.8); E(l[0] + l[2] * 0.4, l[1] - 2.6, 1.6, 1.1, '#ff7aa8'); });
    }
    // ----- the grassy top -----
    E(160, 205.5, 133, 17, '#5c3e34'); for (k = 0; k < 30; k++) { var sa3 = Math.PI * (0.08 + k / 30 * 0.84); E(160 + Math.cos(sa3) * 128, 200 + Math.sin(sa3) * 19.5, 0.9 + R(k + 1700) * 0.8, 0.6, 'rgba(180,170,200,.6)'); }   // (a band of soil, with pebbles in it)
    var gg = q.createLinearGradient(0, 186, 0, 212); gg.addColorStop(0, '#a4e6bc'); gg.addColorStop(1, '#3f8a70'); E(160, 200, 134, 17, gg);
    for (k = 0; k < 22; k++) { q.fillStyle = '#4f9a7c'; q.beginPath(); q.arc(32 + k * 12.2, 206 + R(k + 40) * 3, 5 + R(k + 50) * 3, 0, Math.PI); q.fill(); }   // (grass spilling over the edge)
    if (tower) for (k = 0; k < 120; k++) { var ba = Math.PI * (0.04 + k / 120 * 0.92), bx6 = 160 + Math.cos(ba) * 132, by6 = 200 + Math.sin(ba) * 18.5; if (bx6 > 216 && bx6 < 244) continue; q.strokeStyle = ['#4f9a7c', '#6cc08a', '#3f8a70'][k % 3]; q.lineWidth = 0.6; q.beginPath(); q.moveTo(bx6, by6 - 1); q.quadraticCurveTo(bx6 + (R(k + 3600) - 0.5) * 3, by6 + 1.5, bx6 + (R(k + 3610) - 0.5) * 4, by6 + 2 + R(k + 3620) * 4); q.stroke(); }   // (grass blades hanging over the lip)
    q.strokeStyle = 'rgba(210,255,225,.55)'; q.lineWidth = 1; q.beginPath(); q.ellipse(160, 200, 133, 16, 0, Math.PI * 1.05, Math.PI * 1.95); q.stroke();
    for (k = 0; k < 18; k++) E(40 + R(k + 330) * 240, 190 + R(k + 340) * 18, 6 + R(k + 350) * 8, 1.4, 'rgba(60,130,95,.35)');   // (patches of shade in the grass)
    for (k = 0; k < 110; k++) { var tx = 36 + R(k + 200) * 248, ty = 188 + R(k + 300) * 22; if (Math.pow((tx - 160) / 132, 2) + Math.pow((ty - 200) / 15, 2) > 1) continue; q.strokeStyle = ['rgba(190,255,215,.65)', 'rgba(70,150,105,.8)'][k % 2]; q.lineWidth = 0.8; q.beginPath(); q.moveTo(tx, ty); q.lineTo(tx + (R(k) - 0.5) * 3, ty - 3 - R(k + 1) * 4); q.stroke(); }
    for (k = 0; k < 34; k++) { var fx2 = 44 + R(k + 400) * 232, fy2 = 192 + R(k + 500) * 14; E(fx2, fy2, 1.7, 1.7, ['#ffd2ec', '#fff2b0', '#c8e4ff', '#ff9ccc'][k % 4]); E(fx2, fy2, 0.6, 0.6, '#fff8d8'); }   // (tiny flowers)
    if (tower) {
      // the pond, and the stream that spills off the front edge into the waterfall
      E(226, 202.6, 16, 4.6, '#2c6a8a');
      var pw = q.createLinearGradient(0, 197, 0, 208); pw.addColorStop(0, '#a8ecff'); pw.addColorStop(1, '#3e8cc2'); E(226, 202.2, 14.5, 3.8, pw);
      q.fillStyle = pw; q.beginPath(); q.moveTo(220, 204.5); q.quadraticCurveTo(222, 210, 221.5, 214.6); q.lineTo(238.5, 214.6); q.quadraticCurveTo(236, 210, 233, 204.5); q.closePath(); q.fill();
      q.strokeStyle = 'rgba(255,255,255,.75)'; q.lineWidth = 0.6; [[218, 201, 226, 200.6], [228, 203.6, 234, 203.2], [224, 208, 229, 208.4], [231, 211.5, 235, 212]].forEach(function (l) { q.beginPath(); q.moveTo(l[0], l[1]); q.lineTo(l[2], l[3]); q.stroke(); });
      E(219, 203, 2.8, 1.1, '#4f9a6a'); E(232, 201.4, 2.4, 1, '#5aa874'); E(219.4, 202.4, 1.1, 0.7, '#ffb6d8'); E(219.4, 202.4, 0.4, 0.3, '#fff2b0');   // (lily pads, one in flower)
      for (k = 0; k < 18; k++) { var pa = k / 18 * TAU; if (pa > 0.9 && pa < 2.3) continue; E(226 + Math.cos(pa) * 16.5, 202.6 + Math.sin(pa) * 5, 1.8 + R(k + 600) * 1.2, 1.1 + R(k + 610) * 0.5, ['#b0a6c8', '#8e84aa', '#c8c0dc'][k % 3]); }   // (stones round the pond)
      [[219, 212.5, 2.6], [241, 212, 2.8], [217.5, 208.6, 2], [242.5, 208, 2.2]].forEach(function (s) { E(s[0], s[1] + 0.6, s[2], s[2] * 0.62, 'rgba(10,5,25,.5)'); E(s[0], s[1], s[2], s[2] * 0.6, '#9e94b8'); E(s[0] - 0.6, s[1] - 0.5, s[2] * 0.55, s[2] * 0.22, 'rgba(255,255,255,.45)'); E(s[0] + 0.4, s[1] - s[2] * 0.45, s[2] * 0.5, 0.5, 'rgba(90,168,138,.8)'); });   // (mossy boulders at the lip)
      [[210, 200], [240, 199]].forEach(function (r) { q.strokeStyle = '#4f9a6a'; q.lineWidth = 0.6; for (j = 0; j < 5; j++) { q.beginPath(); q.moveTo(r[0] + j * 0.8, r[1] + 3); q.quadraticCurveTo(r[0] + j * 1.2 - 1, r[1] - 3, r[0] + j * 1.6 - 1.4, r[1] - 6 - j % 2 * 2); q.stroke(); } E(r[0] + 1.2, r[1] - 5.6, 0.7, 1.9, '#7a4a34'); });   // (reeds and cattails)
      // barrels, crates and a bench out on the right, with a lamp post and the string of lights from the balcony
      [[252, 196], [259, 198.5]].forEach(function (b) { E(b[0], b[1] + 0.2, 3.4, 1, 'rgba(20,40,40,.4)'); q.fillStyle = '#8a5a3a'; rr(b[0] - 3, b[1] - 8, 6, 8, 1.4); q.fill(); q.fillStyle = 'rgba(0,0,0,.25)'; q.fillRect(b[0] + 0.8, b[1] - 8, 2.2, 8); q.fillStyle = '#4a4050'; q.fillRect(b[0] - 3.1, b[1] - 6.6, 6.2, 0.7); q.fillRect(b[0] - 3.1, b[1] - 2, 6.2, 0.7); E(b[0], b[1] - 8, 3, 0.8, '#a87a54'); });
      q.fillStyle = '#b08a5a'; q.fillRect(264, 189, 8, 8); q.strokeStyle = '#7a5a3a'; q.lineWidth = 0.5; q.strokeRect(264, 189, 8, 8); q.beginPath(); q.moveTo(264, 189); q.lineTo(272, 197); q.moveTo(272, 189); q.lineTo(264, 197); q.stroke(); q.fillStyle = '#c8a070'; q.fillRect(265.5, 183.5, 5.5, 5.5); q.strokeRect(265.5, 183.5, 5.5, 5.5);   // (crates)
      E(270, 182.6, 2, 1.5, '#e8862e'); q.fillStyle = '#5a7a3a'; q.fillRect(269.7, 180.6, 0.6, 1.2);   // (a pumpkin on top)
      q.fillStyle = '#7a5038'; q.fillRect(248, 205, 13, 1.4); q.fillRect(249, 206.4, 1, 3); q.fillRect(259, 206.4, 1, 3); q.fillRect(248, 200.6, 13, 1); q.fillRect(249, 201.6, 0.8, 3.4); q.fillRect(259.2, 201.6, 0.8, 3.4);   // (a bench by the pond)
      q.strokeStyle = '#2a2040'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(276, 199); q.lineTo(276, 172); q.stroke(); q.lineWidth = 0.8; q.beginPath(); q.moveTo(276, 173); q.quadraticCurveTo(280, 170, 281, 174); q.stroke(); q.fillStyle = '#2a2040'; q.fillRect(278.5, 174, 5, 1); q.fillStyle = '#ffdc8a'; q.fillRect(279, 175, 4, 5); q.fillStyle = '#2a2040'; q.fillRect(278.5, 180, 5, 1);   // (a lamp post)
      q.strokeStyle = 'rgba(40,30,60,.8)'; q.lineWidth = 0.4; q.beginPath(); q.moveTo(TX + 32, 92); q.quadraticCurveTo(TX + 70, 158, 276, 173); q.stroke();   // (string lights)
      for (k = 0; k < 12; k++) { var lt = (k + 0.5) / 12, lx3 = (1 - lt) * (1 - lt) * (TX + 32) + 2 * (1 - lt) * lt * (TX + 70) + lt * lt * 276, ly3 = (1 - lt) * (1 - lt) * 92 + 2 * (1 - lt) * lt * 158 + lt * lt * 173; E(lx3, ly3 + 1, 0.9, 1.2, ['#ffd27a', '#ff9ccc', '#9ae0ff', '#b8ff9a'][k % 4]); }
      for (k = 0; k < 8; k++) { var fa2 = k / 8 * TAU, fx4 = 200 + Math.cos(fa2) * 9, fy4 = 211 + Math.sin(fa2) * 2.6; q.fillStyle = '#e0fff8'; q.fillRect(fx4 - 0.3, fy4 - 1.6, 0.6, 1.6); q.fillStyle = '#7af0e0'; q.beginPath(); q.arc(fx4, fy4 - 1.6, 1.1, Math.PI, 0); q.fill(); }   // (a fairy ring of glowing mushrooms)
      // a wishing well, with a little roof, a crank and a bucket
      var wx2 = 98, wy2 = 210; E(wx2, wy2 + 0.6, 9.4, 2.6, 'rgba(20,40,40,.4)');
      q.fillStyle = '#5e5280'; q.fillRect(wx2 - 8, wy2 - 7, 16, 7); E(wx2, wy2, 8, 2.2, '#5e5280');
      for (j = 0; j < 2; j++) for (k = 0; k < 4; k++) { q.fillStyle = 'hsl(' + (255 + R(j * 4 + k + 1500) * 15) + ',22%,' + Math.round(70 - k * 7 - R(j * 4 + k + 1510) * 6) + '%)'; rr(wx2 - 8 + k * 4 + (j % 2) * 1.4, wy2 - 6.6 + j * 3.4, 3.5, 3, 0.6); q.fill(); }
      E(wx2, wy2 - 7, 8, 2.2, '#b4a8cc'); E(wx2, wy2 - 7, 6.4, 1.5, '#13203e'); E(wx2 - 1.5, wy2 - 7.3, 2, 0.4, 'rgba(150,220,255,.7)');
      q.fillStyle = '#6a4630'; q.fillRect(wx2 - 7.6, wy2 - 21, 1.4, 14); q.fillRect(wx2 + 6.2, wy2 - 21, 1.4, 14);
      q.fillStyle = '#9a3e66'; q.beginPath(); q.moveTo(wx2 - 10.5, wy2 - 19.5); q.lineTo(wx2, wy2 - 27); q.lineTo(wx2 + 10.5, wy2 - 19.5); q.closePath(); q.fill(); q.fillStyle = 'rgba(0,0,0,.25)'; q.beginPath(); q.moveTo(wx2, wy2 - 27); q.lineTo(wx2 + 10.5, wy2 - 19.5); q.lineTo(wx2, wy2 - 19.5); q.closePath(); q.fill();
      q.strokeStyle = 'rgba(40,10,30,.45)'; q.lineWidth = 0.4; for (j = 1; j < 4; j++) { q.beginPath(); q.moveTo(wx2 - 10.5 + j * 2.6, wy2 - 19.5 - j * 1.85); q.lineTo(wx2 + 10.5 - j * 2.6, wy2 - 19.5 - j * 1.85); q.stroke(); }
      q.strokeStyle = '#4a3020'; q.lineWidth = 0.9; q.beginPath(); q.moveTo(wx2 - 6.2, wy2 - 15); q.lineTo(wx2 + 8.6, wy2 - 15); q.lineTo(wx2 + 8.6, wy2 - 12.6); q.stroke();
      q.strokeStyle = '#d8c090'; q.lineWidth = 0.4; q.beginPath(); q.moveTo(wx2, wy2 - 15); q.lineTo(wx2, wy2 - 11.4); q.stroke(); q.fillStyle = '#8a5a3a'; q.beginPath(); q.moveTo(wx2 - 1.8, wy2 - 11.4); q.lineTo(wx2 + 1.8, wy2 - 11.4); q.lineTo(wx2 + 1.4, wy2 - 8.6); q.lineTo(wx2 - 1.4, wy2 - 8.6); q.closePath(); q.fill();
      q.strokeStyle = '#4a7a5a'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(wx2 - 7, wy2 - 21); q.quadraticCurveTo(wx2 - 9, wy2 - 14, wx2 - 7.6, wy2 - 8); q.stroke(); for (j = 0; j < 5; j++) leaf(wx2 - 8 + (j % 2), wy2 - 20 + j * 2.6, 1.8, j % 2 ? 0.4 : 2.7, '#6cc08a');   // (ivy on a post)
      // a signpost
      q.fillStyle = '#6a4630'; q.fillRect(39.4, 186, 1.2, 18); q.fillStyle = '#b08a5a'; q.beginPath(); q.moveTo(41, 187); q.lineTo(51, 187); q.lineTo(53, 189); q.lineTo(51, 191); q.lineTo(41, 191); q.closePath(); q.fill(); q.beginPath(); q.moveTo(39, 192.5); q.lineTo(30, 192.5); q.lineTo(28, 194.5); q.lineTo(30, 196.5); q.lineTo(39, 196.5); q.closePath(); q.fill();
      q.strokeStyle = 'rgba(60,30,20,.7)'; q.lineWidth = 0.4; q.beginPath(); q.moveTo(43, 189); q.lineTo(49, 189); q.moveTo(31, 194.5); q.lineTo(37, 194.5); q.stroke();
      [[150, 212, 1.5], [62, 208, 1.3], [186, 214, 1.2], [118, 211, 1.4], [256, 212, 1.2]].forEach(function (m) { q.fillStyle = '#f2e6d8'; q.fillRect(m[0] - 0.35 * m[2], m[1] - 2 * m[2], 0.7 * m[2], 2 * m[2]); q.fillStyle = '#e04a5a'; q.beginPath(); q.arc(m[0], m[1] - 2 * m[2], 1.6 * m[2], Math.PI, 0); q.fill(); q.fillStyle = '#fff'; q.beginPath(); q.arc(m[0] - 0.6 * m[2], m[1] - 2.7 * m[2], 0.3 * m[2], 0, TAU); q.arc(m[0] + 0.6 * m[2], m[1] - 2.4 * m[2], 0.25 * m[2], 0, TAU); q.fill(); });   // (toadstools)
      // a little picket fence, and a pumpkin patch
      for (k = 0; k < 8; k++) { var fx3 = 48 + k * 7; q.fillStyle = '#e8dcc8'; q.beginPath(); q.moveTo(fx3 - 1.4, 195); q.lineTo(fx3 - 1.4, 187.5); q.lineTo(fx3, 186); q.lineTo(fx3 + 1.4, 187.5); q.lineTo(fx3 + 1.4, 195); q.closePath(); q.fill(); q.fillStyle = 'rgba(80,60,90,.35)'; q.fillRect(fx3 + 0.5, 187.5, 0.9, 7.5); }
      q.fillStyle = '#d8ccb6'; q.fillRect(46, 189, 52, 1.3); q.fillRect(46, 192.5, 52, 1.3);
      for (k = 0; k < 6; k++) { leaf(52 + k * 8, 196.5, 2.4, -2.4, '#6cc08a'); leaf(52 + k * 8, 196.5, 2.4, -0.7, '#4fa070'); }   // (a row of seedlings)
      [[58, 201, 4.6], [72, 203, 3.6], [86, 200.5, 4]].forEach(function (pk) {
        q.strokeStyle = '#4f9a6a'; q.lineWidth = 0.8; q.beginPath(); q.moveTo(pk[0], pk[1] - pk[2] * 0.6); q.bezierCurveTo(pk[0] + 4, pk[1] - 7, pk[0] + 8, pk[1] - 1, pk[0] + 10, pk[1] - 4); q.stroke(); leaf(pk[0] + 5, pk[1] - 4, 3.2, -0.6, '#5fb07a');
        for (j = -1; j <= 1; j++) E(pk[0] + j * pk[2] * 0.42, pk[1], pk[2] * 0.55, pk[2] * 0.68, j ? '#e8862e' : '#f59a3c');
        E(pk[0] - pk[2] * 0.3, pk[1] - pk[2] * 0.3, pk[2] * 0.2, pk[2] * 0.12, 'rgba(255,230,180,.6)'); q.fillStyle = '#5a7a3a'; q.fillRect(pk[0] - 0.5, pk[1] - pk[2] * 0.68 - 1.6, 1, 2);
      });
      // a little apple tree beside the tower: a twisting trunk, layers of leaves lit from the upper left, apples, blossoms, a birdhouse and a lantern
      E(112, 200.4, 17, 2.6, 'rgba(20,50,45,.4)');
      [[-1, 10, 2.2], [1, 9, 2.6], [-1, 6, 3.2], [1, 5, 3.4]].forEach(function (rt) { q.fillStyle = '#5a3c32'; q.beginPath(); q.moveTo(111.5 + rt[0] * 3, 197); q.quadraticCurveTo(111.5 + rt[0] * rt[1] * 0.7, 198.6, 111.5 + rt[0] * rt[1], 199.8 + rt[2] * 0.3); q.quadraticCurveTo(111.5 + rt[0] * rt[1] * 0.4, 200, 111.5, 200.6); q.closePath(); q.fill(); });
      var tb = q.createLinearGradient(103, 0, 120, 0); tb.addColorStop(0, '#9a7660'); tb.addColorStop(0.45, '#6a4a3c'); tb.addColorStop(1, '#3a2620');
      function ltTrunk() { q.beginPath(); q.moveTo(104, 200); q.bezierCurveTo(108.5, 194, 106.5, 181, 108.5, 169); q.bezierCurveTo(110, 160, 106.5, 152, 108.2, 143); q.lineTo(114.4, 142.4); q.bezierCurveTo(113.4, 152, 117, 160, 115.6, 170); q.bezierCurveTo(114.6, 182, 116, 194, 120, 200); q.closePath(); }
      ltTrunk(); q.fillStyle = tb; q.fill(); q.save(); ltTrunk(); q.clip();
      q.lineWidth = 0.4; for (k = 0; k < 6; k++) { q.strokeStyle = k % 3 ? 'rgba(30,18,14,.5)' : 'rgba(255,225,205,.2)'; q.beginPath(); q.moveTo(105 + k * 2.4, 200); q.bezierCurveTo(108 + k * 1.6, 184, 106 + k * 1.6, 160, 109 + k * 1, 142); q.stroke(); }
      E(112.6, 182, 1.2, 1.7, '#2a1a16'); E(106.6, 192, 1.6, 0.8, 'rgba(90,170,110,.7)'); E(108, 186, 1.1, 0.6, 'rgba(90,170,110,.6)');
      var lsh = q.createLinearGradient(0, 142, 0, 156); lsh.addColorStop(0, 'rgba(10,30,20,.6)'); lsh.addColorStop(1, 'rgba(10,30,20,0)'); q.fillStyle = lsh; q.fillRect(100, 140, 22, 18);
      q.restore();
      function twig(x0, y0, cx, cy, x1, y1, w0) { q.lineCap = 'round'; for (var s = 0; s < 8; s++) { var a = s / 8, b = (s + 1) / 8; q.strokeStyle = '#5a3c32'; q.lineWidth = w0 * (1 - a * 0.75); q.beginPath(); q.moveTo((1 - a) * (1 - a) * x0 + 2 * (1 - a) * a * cx + a * a * x1, (1 - a) * (1 - a) * y0 + 2 * (1 - a) * a * cy + a * a * y1); q.lineTo((1 - b) * (1 - b) * x0 + 2 * (1 - b) * b * cx + b * b * x1, (1 - b) * (1 - b) * y0 + 2 * (1 - b) * b * cy + b * b * y1); q.stroke(); } }
      [[110, 148, 100, 142, 93, 130, 2.6], [113, 147, 124, 142, 131, 131, 2.6], [111.5, 145, 109, 134, 112, 118, 2.4], [114.6, 162, 122, 155, 130, 158, 1.8]].forEach(function (b) { twig.apply(null, b); });
      function leafClump(x, y, r, c0, c1, hl) { var lg2 = q.createRadialGradient(x - r * 0.4, y - r * 0.45, r * 0.1, x, y, r); lg2.addColorStop(0, hl); lg2.addColorStop(0.55, c0); lg2.addColorStop(1, c1); q.fillStyle = lg2; q.beginPath(); q.arc(x, y, r, 0, TAU); q.fill(); }
      for (k = 0; k < 16; k++) { var la = R(k + 3000) * TAU, ld = Math.sqrt(R(k + 3100)) * 0.7, lx4 = 109 + Math.cos(la) * ld * 26, ly4 = 129 + Math.sin(la) * ld * 16; leafClump(lx4, ly4, 8 + R(k + 3200) * 4, '#2a5e40', '#143424', '#3b7a52'); }   // (dark, dense heart of the tree)
      var lvs = [];                                                     // (hundreds of real leaves, each with a vein, shaded by where the light falls)
      for (k = 0; k < 560; k++) { var la3 = R(k + 3700) * TAU, ld3 = Math.pow(R(k + 3710), 0.45), dx3 = Math.cos(la3) * ld3, dy3 = Math.sin(la3) * ld3, lit2 = 0.5 + 0.5 * (-dx3 * 0.6 - dy3 * 0.8) * (0.4 + 0.6 * ld3) + (R(k + 3720) - 0.5) * 0.35;
        if (dy3 * 19 + 129 > 147) continue; lvs.push([109 + dx3 * 30, 129 + dy3 * 20, 2.2 + R(k + 3730) * 1.6, la3 + (R(k + 3740) - 0.5) * 1.3 + (dy3 > 0.3 ? 0.5 * Math.cos(la3) : 0), Math.max(0, Math.min(1, lit2)), R(k + 3750) < 0.12]); }
      lvs.sort(function (a, b) { return a[4] - b[4]; });
      lvs.forEach(function (v) { var hue = 150 - v[4] * 40, lum = 16 + v[4] * 44; q.save(); q.translate(v[0], v[1]); q.rotate(v[3]); var s5 = v[2];
        q.fillStyle = v[5] ? 'hsl(' + Math.round(hue + 15) + ',30%,' + Math.round(lum + 14) + '%)' : 'hsl(' + Math.round(hue) + ',' + Math.round(42 + v[4] * 16) + '%,' + Math.round(lum) + '%)';
        q.beginPath(); q.moveTo(0, 0); q.bezierCurveTo(s5 * 0.3, -s5 * 0.48, s5 * 0.85, -s5 * 0.42, s5 * 1.35, 0); q.bezierCurveTo(s5 * 0.85, s5 * 0.42, s5 * 0.3, s5 * 0.48, 0, 0); q.fill();
        q.strokeStyle = 'hsla(' + Math.round(hue - 10) + ',40%,' + Math.round(Math.min(85, lum + 22)) + '%,.7)'; q.lineWidth = 0.14; q.beginPath(); q.moveTo(s5 * 0.08, 0); q.lineTo(s5 * 1.15, 0); q.stroke();
        q.strokeStyle = 'rgba(10,30,20,.25)'; q.lineWidth = 0.1; q.beginPath(); q.moveTo(0, 0); q.bezierCurveTo(s5 * 0.3, s5 * 0.48, s5 * 0.85, s5 * 0.42, s5 * 1.35, 0); q.stroke(); q.restore(); });
      var lrim = q.createRadialGradient(96, 112, 2, 96, 112, 28); lrim.addColorStop(0, 'rgba(240,255,230,.22)'); lrim.addColorStop(1, 'rgba(240,255,230,0)'); q.fillStyle = lrim; q.fillRect(66, 82, 60, 60);
      [[96, 134], [104, 140], [118, 138], [126, 127], [110, 118], [99, 121], [116, 143], [88, 128], [121, 114], [131, 136], [86, 138]].forEach(function (ap, ai) { E(ap[0], ap[1], 1.7, 1.6, ai % 3 ? '#e8485a' : '#ff8a6a'); E(ap[0] - 0.5, ap[1] - 0.5, 0.5, 0.4, 'rgba(255,255,255,.7)'); q.strokeStyle = '#4a3020'; q.lineWidth = 0.3; q.beginPath(); q.moveTo(ap[0], ap[1] - 1.6); q.lineTo(ap[0] + 0.3, ap[1] - 2.4); q.stroke(); });   // (apples)
      for (k = 0; k < 12; k++) { var bx5 = 86 + R(k + 3400) * 46, by5 = 112 + R(k + 3410) * 32; for (j = 0; j < 5; j++) { var fa6 = j / 5 * TAU; E(bx5 + Math.cos(fa6) * 0.7, by5 + Math.sin(fa6) * 0.7, 0.6, 0.6, k % 2 ? '#ffffff' : '#ffd2ec'); } E(bx5, by5, 0.35, 0.35, '#fff2b0'); }   // (blossoms)
      q.fillStyle = '#5ab0a8'; q.fillRect(108.6, 172, 5.4, 5.4); q.fillStyle = 'rgba(0,0,0,.2)'; q.fillRect(112, 172, 2, 5.4); q.fillStyle = '#c0504a'; q.beginPath(); q.moveTo(107.6, 172.4); q.lineTo(111.3, 168.8); q.lineTo(115, 172.4); q.closePath(); q.fill(); E(111.3, 174.4, 1, 1, '#1a1020'); q.fillStyle = '#8a5a3a'; q.fillRect(110.9, 176.2, 0.8, 1.6);   // (a birdhouse on the trunk)
      E(98, 200.6, 1.5, 1.4, '#e8485a'); E(124, 201.4, 1.4, 1.3, '#ff8a6a'); leaf(102, 201, 1.8, 0.4, '#8a6a3a'); leaf(120, 199.6, 1.8, 2.4, '#a07a40');   // (windfalls)
      q.strokeStyle = 'rgba(40,30,50,.8)'; q.lineWidth = 0.5; q.beginPath(); q.moveTo(129, 158); q.lineTo(129, 163); q.stroke();
      q.fillStyle = '#3a2a4a'; q.fillRect(126.5, 163, 5, 1.2); q.fillRect(126.5, 170, 5, 1.2); q.fillStyle = '#ffd486'; q.fillRect(127, 164, 4, 6); q.fillStyle = '#3a2a4a'; q.fillRect(128.6, 164, 0.8, 6);
      // a cauldron bubbling over a little fire
      E(130, 200.6, 4, 1.3, '#ff9a3a'); E(130, 200, 2, 1, '#fff0a0');
      q.strokeStyle = '#2a2236'; q.lineWidth = 1; q.beginPath(); q.moveTo(125.5, 199); q.lineTo(124.5, 202); q.moveTo(134.5, 199); q.lineTo(135.5, 202); q.stroke();
      E(130, 195, 6.5, 5, '#2a2236'); E(128, 193.6, 2.4, 2.2, 'rgba(255,255,255,.12)'); E(130, 190.6, 6.2, 1.7, '#3e3450'); E(130, 190.6, 5, 1.1, '#7af08a'); E(129, 190.3, 1.6, 0.4, '#d8ffd8');
      // ----- the tower -----
      E(TX + 8, 200, 34, 5, 'rgba(20,50,45,.35)');                    // (its shadow on the grass)
      function stones(xa, xb, yb, rows, rh, seed) {                   // (rows of stones, each its own shade, lit from the left)
        for (var row = 0; row < rows; row++) { var y0 = yb - (row + 1) * rh, xs = xa - (row % 2) * 6, st = 0, hw2 = (xb - xa) / 2, mid = (xa + xb) / 2;
          while (xs < xb) { var sw = 8 + R(seed + row * 20 + st) * 7, u = Math.max(-1, Math.min(1, (xs + sw / 2 - mid) / hw2)), L = 82 - (u + 1) * 18 - R(seed + row * 31 + st) * 9;
            q.fillStyle = 'hsl(' + Math.round(255 + R(seed + st + row * 5) * 18) + ',' + Math.round(20 + R(seed + row + st * 3) * 12) + '%,' + Math.round(L) + '%)'; rr(xs + 0.6, y0 + 0.6, sw - 1.2, rh - 1.2, 1.6); q.fill();
            q.fillStyle = 'rgba(255,255,255,' + (0.1 + (1 - u) * 0.06) + ')'; q.fillRect(xs + 1.4, y0 + 1, Math.max(0, sw - 2.8), 0.8); xs += sw; st++; } }
      }
      function shade(xa, xb, ya, yb) { var s2 = q.createLinearGradient(xa, 0, xb, 0); s2.addColorStop(0, 'rgba(255,230,255,.15)'); s2.addColorStop(0.35, 'rgba(255,230,255,0)'); s2.addColorStop(0.7, 'rgba(20,10,50,.1)'); s2.addColorStop(1, 'rgba(20,10,50,.5)'); q.fillStyle = s2; q.fillRect(xa, ya, xb - xa, yb - ya); }
      q.save(); q.beginPath(); q.rect(TX - 17, 60, 34, 42); q.clip(); q.fillStyle = '#4e4272'; q.fillRect(TX - 17, 60, 34, 42); stones(TX - 17, TX + 17, 100, 5, 8, 500); shade(TX - 17, TX + 17, 60, 102); q.restore();   // (the little room up top)
      E(TX, 69, 17, 2.4, 'rgba(20,10,40,.4)');                         // (shadow under the eaves)
      E(TX, 81, 7, 7, '#d4cae4'); var rw = q.createRadialGradient(TX - 1, 79, 0.5, TX, 81, 5.4); rw.addColorStop(0, '#fff6d0'); rw.addColorStop(1, '#ffae50'); E(TX, 81, 5.3, 5.3, rw);   // (a round window, lamplit)
      q.strokeStyle = '#3c3064'; q.lineWidth = 0.8; q.beginPath(); q.moveTo(TX, 75.7); q.lineTo(TX, 86.3); q.moveTo(TX - 5.3, 81); q.lineTo(TX + 5.3, 81); q.stroke(); q.beginPath(); q.arc(TX, 81, 5.3, 0, TAU); q.stroke();
      function body() { q.beginPath(); q.moveTo(TX - 26, 200); q.lineTo(TX - 21, 100); q.lineTo(TX + 21, 100); q.lineTo(TX + 26, 200); q.closePath(); }
      body(); q.fillStyle = '#4e4272'; q.fill(); q.save(); body(); q.clip(); stones(TX - 26, TX + 26, 200, 12, 8.4, 0); shade(TX - 27, TX + 27, 96, 202); q.restore();
      q.save(); body(); q.clip();                                      // (moss and cracks in the old stones)
      for (k = 0; k < 40; k++) E(TX - 26 + R(k + 1600) * 52, 140 + Math.pow(R(k + 1610), 0.6) * 58, 0.8 + R(k + 1620) * 1.8, 0.5 + R(k + 1630) * 0.6, 'rgba(90,170,110,' + (0.35 + R(k + 1640) * 0.35) + ')');
      q.strokeStyle = 'rgba(30,20,50,.55)'; q.lineWidth = 0.4; [[TX + 14, 108], [TX - 18, 128], [TX + 16, 168]].forEach(function (c0) { var cx3 = c0[0], cy3 = c0[1]; q.beginPath(); q.moveTo(cx3, cy3); for (j = 0; j < 5; j++) { cx3 += (R(j + c0[1]) - 0.5) * 4; cy3 += 2 + R(j + c0[0]) * 2; q.lineTo(cx3, cy3); } q.stroke(); });
      q.restore();
      q.fillStyle = '#6a5e92'; q.beginPath(); q.moveTo(TX - 28.5, 200); q.lineTo(TX - 27.5, 192); q.lineTo(TX + 27.5, 192); q.lineTo(TX + 28.5, 200); q.closePath(); q.fill();   // (a plinth of bigger stones)
      q.strokeStyle = 'rgba(30,20,60,.5)'; q.lineWidth = 0.7; for (k = 0; k < 7; k++) { q.beginPath(); q.moveTo(TX - 24 + k * 8, 192); q.lineTo(TX - 24 + k * 8, 200); q.stroke(); } q.fillStyle = 'rgba(255,255,255,.2)'; q.fillRect(TX - 27.5, 192, 55, 0.9);
      // windows, with shutters, sills and flower boxes
      function arch(x, y, w, h) { q.beginPath(); q.moveTo(x - w / 2, y + h / 2); q.lineTo(x - w / 2, y - h / 2 + w / 2); q.arc(x, y - h / 2 + w / 2, w / 2, Math.PI, 0); q.lineTo(x + w / 2, y + h / 2); q.closePath(); }
      function win(x, y, w, h) {
        q.fillStyle = '#3c3064'; q.fillRect(x - w / 2 - 6.5, y - h / 2 + 1, 5, h); q.fillRect(x + w / 2 + 1.5, y - h / 2 + 1, 5, h);
        q.fillStyle = '#5b6fb8'; q.fillRect(x - w / 2 - 6, y - h / 2 + 1.5, 4, h - 1); q.fillRect(x + w / 2 + 2, y - h / 2 + 1.5, 4, h - 1);
        q.strokeStyle = 'rgba(20,20,60,.55)'; q.lineWidth = 0.4; for (j = 0; j < 4; j++) { var ly = y - h / 2 + 3 + j * (h - 3) / 4; q.beginPath(); q.moveTo(x - w / 2 - 6, ly); q.lineTo(x - w / 2 - 2, ly); q.moveTo(x + w / 2 + 2, ly); q.lineTo(x + w / 2 + 6, ly); q.stroke(); }
        q.fillStyle = '#d4cae4'; arch(x, y, w + 3.6, h + 3.6); q.fill();
        var wg2 = q.createLinearGradient(0, y - h / 2, 0, y + h / 2); wg2.addColorStop(0, '#fff2c0'); wg2.addColorStop(1, '#ffb050'); q.fillStyle = wg2; arch(x, y, w, h); q.fill();
        q.strokeStyle = '#3c3064'; q.lineWidth = 0.8; q.beginPath(); q.moveTo(x, y - h / 2); q.lineTo(x, y + h / 2); q.moveTo(x - w / 2, y + 0.5); q.lineTo(x + w / 2, y + 0.5); q.stroke();
        q.fillStyle = '#d4cae4'; q.fillRect(x - w / 2 - 2.5, y + h / 2, w + 5, 1.6);
        q.fillStyle = '#7a4a34'; q.fillRect(x - w / 2 - 1.5, y + h / 2 + 1.6, w + 3, 3); q.fillStyle = 'rgba(0,0,0,.25)'; q.fillRect(x - w / 2 - 1.5, y + h / 2 + 3.8, w + 3, 0.8);
        for (j = 0; j < 6; j++) { leaf(x - w / 2 + j * w / 5, y + h / 2 + 2.4, 2.4, 1.2 + j * 0.3, '#5fb07a'); E(x - w / 2 + j * w / 5, y + h / 2 + 0.8, 1.1, 1.1, ['#ff8cc0', '#fff2b0', '#ffb0d8'][j % 3]); }
      }
      win(TX - 7, 152, 8, 13); win(TX + 8, 124, 7, 12);
      // ivy climbing up the left side
      q.strokeStyle = '#3b6e48'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(TX - 25, 199); q.bezierCurveTo(TX - 18, 175, TX - 26, 150, TX - 14, 128); q.stroke(); q.beginPath(); q.moveTo(TX - 21, 170); q.quadraticCurveTo(TX - 12, 166, TX - 10, 178); q.stroke();
      for (k = 0; k < 46; k++) { var it = R(k + 800), i1 = 1 - it, ix2 = i1 * i1 * i1 * (TX - 25) + 3 * i1 * i1 * it * (TX - 18) + 3 * i1 * it * it * (TX - 26) + it * it * it * (TX - 14), iy2 = i1 * i1 * i1 * 199 + 3 * i1 * i1 * it * 175 + 3 * i1 * it * it * 150 + it * it * it * 128;
        leaf(ix2 + (R(k + 810) - 0.5) * 8, iy2 + (R(k + 820) - 0.5) * 6, 2.6 + R(k + 830) * 1.6, R(k + 840) * TAU, ['#3f8a5a', '#5fb07a', '#2f6e48', '#78c890'][k % 4]); }
      for (k = 0; k < 7; k++) E(TX - 24 + R(k + 850) * 14, 135 + R(k + 860) * 60, 1.2, 1.2, '#ffc0e0');
      // the door: a stone arch, planks, iron straps, a ring, a little window, a step and a mat
      for (k = 0; k < 8; k++) { var da = Math.PI + k / 8 * Math.PI, db = Math.PI + (k + 1) / 8 * Math.PI; q.fillStyle = k % 2 ? '#c8bedc' : '#b4a8cc'; q.beginPath(); q.arc(TX, 185, 12.5, da, db); q.arc(TX, 185, 9, db, da, true); q.closePath(); q.fill(); q.strokeStyle = 'rgba(40,30,70,.5)'; q.lineWidth = 0.5; q.stroke(); }
      q.fillStyle = '#b4a8cc'; q.fillRect(TX - 12.5, 185, 3.5, 14); q.fillRect(TX + 9, 185, 3.5, 14);
      q.fillStyle = '#6a3e2a'; q.beginPath(); q.moveTo(TX - 9, 199); q.lineTo(TX - 9, 185); q.arc(TX, 185, 9, Math.PI, 0); q.lineTo(TX + 9, 199); q.closePath(); q.fill();
      q.strokeStyle = 'rgba(30,15,10,.5)'; q.lineWidth = 0.6; for (k = -2; k <= 2; k++) { q.beginPath(); q.moveTo(TX + k * 3.6, 177 + Math.abs(k) * 1.4); q.lineTo(TX + k * 3.6, 199); q.stroke(); }
      q.fillStyle = '#2e2438'; q.fillRect(TX - 9, 186, 13, 1.4); q.fillRect(TX - 9, 194, 13, 1.4); q.strokeStyle = '#e8c070'; q.lineWidth = 0.8; q.beginPath(); q.arc(TX + 5, 191, 1.6, 0, TAU); q.stroke();
      E(TX - 2, 181.5, 2.2, 1.7, '#ffd486'); q.strokeStyle = '#2e2438'; q.lineWidth = 0.5; q.beginPath(); q.moveTo(TX - 2, 179.8); q.lineTo(TX - 2, 183.2); q.moveTo(TX - 4.2, 181.5); q.lineTo(TX + 0.2, 181.5); q.stroke();
      q.fillStyle = '#d4cae4'; q.fillRect(TX - 12, 199, 24, 2.4); q.fillStyle = 'rgba(0,0,0,.15)'; q.fillRect(TX - 12, 200.8, 24, 0.6);
      E(TX, 203.4, 7, 1.4, '#b04a6a'); E(TX, 203.2, 5.5, 0.9, '#d06a88');
      [[TX + 1, 206.5, 6], [TX - 10, 208, 5.5], [TX - 22, 208.5, 5.5], [TX - 34, 207, 5], [TX - 45, 205.5, 4.6]].forEach(function (s) { E(s[0], s[1], s[2], 1.9, '#a69cc0'); E(s[0] - 0.8, s[1] - 0.5, s[2] * 0.6, 0.8, 'rgba(255,255,255,.35)'); });   // (stepping stones)
      q.strokeStyle = '#2e2438'; q.lineWidth = 0.9; q.beginPath(); q.moveTo(TX + 13, 178); q.lineTo(TX + 17, 178); q.lineTo(TX + 17, 180); q.stroke();   // (a lantern by the door)
      q.fillStyle = '#2e2438'; q.fillRect(TX + 14.6, 180, 4.8, 1); q.fillStyle = '#ffd486'; q.fillRect(TX + 15, 181, 4, 4.6); q.fillStyle = '#2e2438'; q.fillRect(TX + 14.6, 185.6, 4.8, 1); q.fillRect(TX + 16.6, 181, 0.6, 4.6);
      var px = TX - 16, py = 199; q.fillStyle = '#c87650'; q.beginPath(); q.moveTo(px - 3.4, py - 5); q.lineTo(px + 3.4, py - 5); q.lineTo(px + 2.6, py); q.lineTo(px - 2.6, py); q.closePath(); q.fill(); q.fillStyle = '#e09470'; q.fillRect(px - 3.8, py - 5.8, 7.6, 1.4);   // (a potted flower)
      for (j = 0; j < 6; j++) leaf(px, py - 5.5, 3.4, -Math.PI / 2 + (j - 2.5) * 0.45, ['#4fa070', '#6cc08a'][j % 2]); E(px - 2, py - 10, 1.3, 1.3, '#ff8cc0'); E(px + 2.2, py - 9.2, 1.2, 1.2, '#ffb0d8'); E(px, py - 11.4, 1.2, 1.2, '#fff2b0');
      q.strokeStyle = '#8a5a3a'; q.lineWidth = 1.2; q.beginPath(); q.moveTo(TX + 28, 193); q.lineTo(TX + 34, 168); q.stroke();   // (a broom leaning on the wall)
      q.fillStyle = '#d8b060'; q.beginPath(); q.moveTo(TX + 26.2, 193.6); q.lineTo(TX + 29.4, 193); q.lineTo(TX + 31.6, 200); q.lineTo(TX + 23.4, 200); q.closePath(); q.fill(); q.fillStyle = '#a0402a'; q.fillRect(TX + 26, 193, 3.6, 1.4);
      q.strokeStyle = 'rgba(150,110,40,.6)'; q.lineWidth = 0.4; for (j = 0; j < 5; j++) { q.beginPath(); q.moveTo(TX + 27 + j * 0.5, 194.6); q.lineTo(TX + 24.6 + j * 1.6, 200); q.stroke(); }
      // the balcony: corbels, bunting, a railing, a telescope, and a black cat
      q.fillStyle = '#5a4e80'; for (k = -3; k <= 3; k++) { q.beginPath(); q.moveTo(TX + k * 8 - 2.5, 103); q.lineTo(TX + k * 8 + 2.5, 103); q.lineTo(TX + k * 8, 110); q.closePath(); q.fill(); }
      q.strokeStyle = 'rgba(60,40,80,.7)'; q.lineWidth = 0.5; q.beginPath(); q.moveTo(TX - 31, 103.5); q.quadraticCurveTo(TX, 120.5, TX + 31, 103.5); q.stroke();
      for (k = 0; k < 9; k++) { var bt2 = (k + 0.5) / 9, bx2 = TX - 31 + 62 * bt2, by2 = 103.5 + 17 * bt2 * (1 - bt2); q.fillStyle = ['#ff9ccc', '#fff2b0', '#9ae0d0', '#c8b0ff'][k % 4]; q.beginPath(); q.moveTo(bx2 - 2, by2); q.lineTo(bx2 + 2, by2); q.lineTo(bx2, by2 + 4.5); q.closePath(); q.fill(); }
      q.fillStyle = '#b8acd0'; q.fillRect(TX - 32, 99, 64, 4.4); q.fillStyle = 'rgba(255,255,255,.3)'; q.fillRect(TX - 32, 99, 64, 0.9); q.fillStyle = 'rgba(20,10,50,.35)'; q.fillRect(TX + 10, 99, 22, 4.4);
      q.strokeStyle = '#4a3a5a'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(TX + 22, 98.6); q.lineTo(TX + 24, 92); q.lineTo(TX + 26, 98.6); q.stroke();
      q.save(); q.translate(TX + 24, 92); q.rotate(-0.55); var tg2 = q.createLinearGradient(0, -2, 0, 2); tg2.addColorStop(0, '#ffe2a0'); tg2.addColorStop(1, '#b07a30'); q.fillStyle = tg2; q.fillRect(-5, -1.4, 14, 2.8); q.fillRect(9, -1.9, 4, 3.8); q.fillStyle = '#5a3a20'; q.fillRect(2, -1.6, 1, 3.2); q.restore();
      q.fillStyle = '#c8bedc'; for (k = 0; k <= 16; k++) q.fillRect(TX - 31 + k * 3.875 - 0.6, 91, 1.2, 8); q.fillRect(TX - 32, 90, 2.4, 9); q.fillRect(TX + 29.6, 90, 2.4, 9);
      q.fillStyle = '#d4cae4'; q.fillRect(TX - 32.5, 89.6, 65, 2); q.fillStyle = 'rgba(20,10,50,.3)'; q.fillRect(TX + 10, 89.6, 22.5, 9.4);
      E(TX - 24, 86, 3.4, 3.2, '#1e1630'); E(TX - 22.6, 81.6, 2.4, 2.2, '#1e1630'); q.fillStyle = '#1e1630'; q.beginPath(); q.moveTo(TX - 24.8, 80.6); q.lineTo(TX - 24.4, 77.6); q.lineTo(TX - 23, 80); q.moveTo(TX - 22.2, 80); q.lineTo(TX - 20.8, 77.6); q.lineTo(TX - 20.4, 80.6); q.fill();
      q.strokeStyle = '#1e1630'; q.lineWidth = 1; q.beginPath(); q.moveTo(TX - 27, 88.6); q.bezierCurveTo(TX - 31, 92, TX - 30, 96, TX - 27, 97.5); q.stroke(); E(TX - 23.5, 81.4, 0.5, 0.5, '#ffe066'); E(TX - 21.6, 81.4, 0.5, 0.5, '#ffe066');
      [[TX - 30, 99, 16], [TX + 27, 99, 12], [TX - 6, 99, 9]].forEach(function (hv, hi) { q.strokeStyle = '#3b6e48'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(hv[0], hv[1]); q.quadraticCurveTo(hv[0] + 2, hv[1] + hv[2] * 0.6, hv[0] - 1, hv[1] + hv[2]); q.stroke(); for (j = 1; j < 7; j++) leaf(hv[0] + Math.sin(j) * 1.2, hv[1] + hv[2] * j / 7, 2, j % 2 ? 0.5 : 2.6, ['#5fb07a', '#3f8a5a'][j % 2]); E(hv[0] - 1, hv[1] + hv[2] + 1, 1, 1, hi % 2 ? '#fff2b0' : '#ff9ccc'); });   // (vines trailing off the balcony)
      [[TX - 23, 67, 7], [TX + 23, 67, 9], [TX - 14, 68, 4]].forEach(function (hs) { q.strokeStyle = 'rgba(232,200,120,.7)'; q.lineWidth = 0.3; q.beginPath(); q.moveTo(hs[0], hs[1]); q.lineTo(hs[0], hs[1] + hs[2]); q.stroke(); q.fillStyle = '#ffe08a'; q.beginPath(); for (j = 0; j < 10; j++) { var sa2 = j / 10 * TAU - Math.PI / 2, sr2 = j % 2 ? 0.9 : 2.1; q[j ? 'lineTo' : 'moveTo'](hs[0] + Math.cos(sa2) * sr2, hs[1] + hs[2] + 2 + Math.sin(sa2) * sr2); } q.closePath(); q.fill(); });   // (stars hung from the eaves)
      // the roof: a crooked witch's hat of scalloped slates, with a patch, a gold band, a dormer and a chimney
      function roof() { q.beginPath(); q.moveTo(TX - 29, 66); q.quadraticCurveTo(TX - 9, 52, TX - 5, 22); q.quadraticCurveTo(TX - 2, 4, TX + 15, -2); q.quadraticCurveTo(TX + 4, 10, TX + 6, 26); q.quadraticCurveTo(TX + 10, 54, TX + 29, 66); q.quadraticCurveTo(TX, 70, TX - 29, 66); q.closePath(); }
      roof(); q.fillStyle = '#5a30a0'; q.fill(); q.save(); roof(); q.clip();
      for (var sy3 = 70, sr3 = 0; sy3 > -6; sy3 -= 3.6, sr3++) for (var sx3 = TX - 32 + (sr3 % 2) * 2.4; sx3 < TX + 32; sx3 += 4.8) { var sl = (sx3 - TX) / 30; q.fillStyle = 'hsl(' + Math.round(268 + R(sx3 * 3 + sr3) * 14) + ',55%,' + Math.round(52 - sl * 16 - R(sx3 + sr3 * 7) * 8) + '%)'; q.beginPath(); q.arc(sx3, sy3, 2.6, 0, Math.PI); q.fill(); q.strokeStyle = 'rgba(30,10,60,.45)'; q.lineWidth = 0.5; q.stroke(); }
      q.fillStyle = '#4a7ac0'; q.fillRect(TX + 2, 44, 6, 5.5); q.strokeStyle = '#ffe2a0'; q.lineWidth = 0.4; q.setLineDash([0.8, 0.8]); q.strokeRect(TX + 2, 44, 6, 5.5); q.setLineDash([]);
      var rs = q.createLinearGradient(TX - 30, 0, TX + 30, 0); rs.addColorStop(0, 'rgba(255,220,255,.25)'); rs.addColorStop(0.4, 'rgba(255,220,255,0)'); rs.addColorStop(1, 'rgba(15,5,40,.5)'); q.fillStyle = rs; q.fillRect(TX - 32, -6, 64, 78);
      q.restore(); roof(); q.strokeStyle = 'rgba(20,8,45,.6)'; q.lineWidth = 0.7; q.stroke();
      q.strokeStyle = '#ffd88a'; q.lineWidth = 2.6; q.beginPath(); q.moveTo(TX - 25, 63.2); q.quadraticCurveTo(TX, 58, TX + 25, 63.2); q.stroke(); q.strokeStyle = 'rgba(160,100,30,.6)'; q.lineWidth = 0.6; q.stroke();
      E(TX + 0.5, 60.6, 2.2, 2.2, '#ffd88a'); E(TX + 0.5, 60.6, 1, 1, '#c070ff');   // (a buckle with a gem in it)
      q.fillStyle = '#4a2a80'; q.fillRect(TX - 11, 49, 9, 8); q.fillStyle = '#ffd486'; arch(TX - 6.5, 53.4, 5, 6); q.fill(); q.strokeStyle = '#3c3064'; q.lineWidth = 0.5; q.beginPath(); q.moveTo(TX - 6.5, 50.4); q.lineTo(TX - 6.5, 56.4); q.stroke();   // (a dormer window)
      q.fillStyle = '#7a4ad0'; q.beginPath(); q.moveTo(TX - 13, 49.5); q.lineTo(TX - 6.5, 42.5); q.lineTo(TX, 49.5); q.closePath(); q.fill(); q.strokeStyle = '#ffd88a'; q.lineWidth = 0.6; q.beginPath(); q.moveTo(TX - 13, 49.5); q.lineTo(TX - 6.5, 42.5); q.lineTo(TX, 49.5); q.stroke();
      q.fillStyle = '#8a5a4a'; q.fillRect(TX + 10, 36, 6, 16); q.strokeStyle = 'rgba(40,20,20,.5)'; q.lineWidth = 0.4; for (j = 0; j < 5; j++) { q.beginPath(); q.moveTo(TX + 10, 38.5 + j * 3); q.lineTo(TX + 16, 38.5 + j * 3); q.stroke(); q.beginPath(); q.moveTo(TX + 13 + (j % 2) * 1.5 - 0.75, 38.5 + j * 3); q.lineTo(TX + 13 + (j % 2) * 1.5 - 0.75, 41.5 + j * 3); q.stroke(); }   // (a brick chimney)
      q.fillStyle = 'rgba(20,10,30,.35)'; q.fillRect(TX + 14, 36, 2, 16); q.fillStyle = '#5a3a3a'; q.fillRect(TX + 9, 34.4, 8, 2);
      // the weather vane: a gold ball, a rod and a crescent moon
      q.strokeStyle = '#e8c070'; q.lineWidth = 0.8; q.beginPath(); q.moveTo(TX + 15, -2); q.lineTo(TX + 15, -21); q.stroke(); E(TX + 15, -2, 1.7, 1.7, '#ffd88a');
      q.save(); E(TX + 15, -24.5, 3.6, 3.6, '#ffe08a'); q.globalCompositeOperation = 'destination-out'; E(TX + 16.8, -25.6, 3, 3, '#000'); q.restore();
      E(TX + 15, -8, 1, 1, '#ffd88a');
    } else {
      if (kind === 'tree') {
      q.fillStyle = '#5c3e34'; q.beginPath(); q.moveTo(146, 202); q.quadraticCurveTo(156, 160, 152, 120); q.lineTo(168, 120); q.quadraticCurveTo(166, 160, 176, 202); q.closePath(); q.fill();   // (the trunk)
      q.strokeStyle = '#5c3e34'; q.lineCap = 'round'; [[156, 132, 112, 96, 6], [164, 126, 212, 92, 6], [158, 124, 150, 74, 5], [162, 140, 196, 120, 4], [156, 146, 124, 128, 4]].forEach(function (b) { q.lineWidth = b[4]; q.beginPath(); q.moveTo(b[0], b[1]); q.quadraticCurveTo((b[0] + b[2]) / 2, b[1] - 10, b[2], b[3]); q.stroke(); });
      var halo = q.createRadialGradient(160, 92, 10, 160, 92, 110); halo.addColorStop(0, 'rgba(255,190,230,.45)'); halo.addColorStop(1, 'rgba(255,190,230,0)'); q.fillStyle = halo; q.fillRect(40, 0, 240, 200);
      for (k = 0; k < 70; k++) { var a2 = rnd(k + 600) * TAU, d2 = Math.sqrt(rnd(k + 700)), cx2 = 160 + Math.cos(a2) * d2 * 78, cy2 = 90 + Math.sin(a2) * d2 * 46 - (1 - d2) * 6, r2 = 9 + rnd(k + 800) * 10, sh = cy2 < 80 ? 1 : 0;
        var bg2 = q.createRadialGradient(cx2 - r2 * 0.3, cy2 - r2 * 0.4, 1, cx2, cy2, r2); bg2.addColorStop(0, sh ? '#ffe6f4' : '#ffc4e2'); bg2.addColorStop(1, ['#f27ab4', '#e86aa8', '#ff94c8', '#d860a0'][k % 4]); q.fillStyle = bg2; q.beginPath(); q.arc(cx2, cy2, r2, 0, TAU); q.fill(); }
      for (k = 0; k < 30; k++) { q.fillStyle = 'rgba(255,250,255,' + (0.5 + rnd(k + 900) * 0.5) + ')'; q.beginPath(); q.arc(90 + rnd(k + 950) * 140, 52 + rnd(k + 990) * 80, 1.4, 0, TAU); q.fill(); }   // (glints of light in the blossom)
      }
      q.fillStyle = 'rgba(255,170,215,.8)'; for (k = 0; k < 16; k++) { q.beginPath(); q.ellipse(70 + rnd(k + 1100) * 180, 196 + rnd(k + 1200) * 8, 3, 1.5, rnd(k) * 3, 0, TAU); q.fill(); }   // (fallen petals)
      [[94, 190], [228, 192]].forEach(function (m) { q.fillStyle = '#f2e6d8'; q.fillRect(m[0] - 1.5, m[1], 3, 7); q.fillStyle = '#ff7aa8'; q.beginPath(); q.arc(m[0], m[1], 6, Math.PI, 0); q.fill(); q.fillStyle = '#fff'; q.beginPath(); q.arc(m[0] - 2, m[1] - 3, 1, 0, TAU); q.arc(m[0] + 2.5, m[1] - 2, 0.9, 0, TAU); q.fill(); });   // (little toadstools)
    }
    return c;
  }
  var whaleStars = []; for (var ws = 0; ws < 26; ws++) whaleStars.push([-0.42 + rnd(ws + 8000) * 0.86, (rnd(ws + 8100) - 0.5) * 0.14, rnd(ws + 8200) * 6.28]);
  var isPetals = [];
  var SEA = [                                                       // (the cloud sea, back to front: hazy lavender far off, rosy and bright up close)
    { dy: -0.01, r: 0.085, v: 4, hl: '#f6e2f6', mid: '#c9a6dc', sh: '#8f74b4', hlA: '250,236,250', shA: '120,92,160', base: '#9b7cbc', rim: 'rgba(255,240,250,.45)', blur: 2 },
    { dy: 0.06, r: 0.11, v: 8, hl: '#ffe6f2', mid: '#e8b4d4', sh: '#a87cbc', hlA: '255,238,246', shA: '150,104,170', base: '#b688c4', rim: 'rgba(255,236,230,.6)', blur: 1 },
    { dy: 0.13, r: 0.14, v: 13, hl: '#fff6f2', mid: '#f8cadc', sh: '#c48cbc', hlA: '255,250,244', shA: '180,120,176', base: '#d39ac8', rim: 'rgba(255,240,220,.8)', blur: 0 }
  ], seaSpr = {};
  function makeSea(li, W0, rB) {                                     // (one band of billowing cloud, painted once, wide enough to wrap round)
    var sl = SEA[li], h = Math.round(rB * 3.2), S = Math.min(2, window.devicePixelRatio || 1), c = document.createElement('canvas'); c.width = Math.round(W0 * S); c.height = Math.round(h * S);
    var q = c.getContext('2d'); q.scale(S, S); var tops = [], k, j, base = rB * 1.7;
    function R(n) { return rnd(n * 1.91 + li * 131 + 7); }
    if (sl.blur) q.filter = 'blur(' + sl.blur + 'px)';
    var under = q.createLinearGradient(0, base - rB * 0.2, 0, h); under.addColorStop(0, sl.mid); under.addColorStop(1, sl.base); q.fillStyle = under; q.fillRect(0, base, W0, h - base);
    var circ = [], n = Math.ceil(W0 / (rB * 1.25));
    for (k = 0; k < n; k++) {                                         // (each billow a heap of puffs: big ones low, smaller ones piled on top)
      var bx = (k + R(k) * 0.5) * W0 / n, bh = 0.7 + R(k + 40) * 0.6, bw = rB * (0.9 + R(k + 80) * 0.5);
      for (j = 0; j < 14; j++) { var u = R(k * 31 + j), lvl = j < 6 ? 0 : j < 11 ? 1 : 2, px = bx + (u - 0.5) * bw * (lvl === 0 ? 2.2 : lvl === 1 ? 1.4 : 0.8), pr = rB * (lvl === 0 ? 0.55 : lvl === 1 ? 0.42 : 0.3) * (0.75 + R(k * 31 + j + 9) * 0.5), py = base + rB * 0.25 - lvl * rB * 0.42 * bh - R(k * 31 + j + 17) * rB * 0.15; circ.push([px, py, pr]); }
    }
    circ.sort(function (a, b) { return b[1] - a[1]; });               // (lower puffs first, so the ones above sit over them)
    var body = q.createLinearGradient(0, base - rB * 1.4, 0, base + rB * 0.5); body.addColorStop(0, sl.hl); body.addColorStop(0.45, sl.mid); body.addColorStop(1, sl.sh);   // (all the puffs merged into one soft mass)
    q.fillStyle = body; q.beginPath(); circ.forEach(function (cc) { [-W0, 0, W0].forEach(function (wx) { var x = cc[0] + wx; if (x + cc[2] < 0 || x - cc[2] > W0) return; q.moveTo(x + cc[2], cc[1]); q.arc(x, cc[1], cc[2], 0, TAU); }); }); q.fill();
    q.filter = 'none'; q.globalCompositeOperation = 'source-atop';   // (then light and shade painted softly onto it: shade beneath each puff, light on its crown)
    circ.forEach(function (cc) { [-W0, 0, W0].forEach(function (wx) { var x = cc[0] + wx; if (x + cc[2] < 0 || x - cc[2] > W0) return;
      var sg = q.createRadialGradient(x + cc[2] * 0.1, cc[1] + cc[2] * 0.75, 0, x + cc[2] * 0.1, cc[1] + cc[2] * 0.75, cc[2] * 0.95); sg.addColorStop(0, 'rgba(' + sl.shA + ',.42)'); sg.addColorStop(1, 'rgba(' + sl.shA + ',0)'); q.fillStyle = sg; q.fillRect(x - cc[2] * 1.2, cc[1] - cc[2] * 0.3, cc[2] * 2.4, cc[2] * 2.2);
      var hg2 = q.createRadialGradient(x - cc[2] * 0.25, cc[1] - cc[2] * 0.45, 0, x - cc[2] * 0.25, cc[1] - cc[2] * 0.45, cc[2] * 0.85); hg2.addColorStop(0, 'rgba(' + sl.hlA + ',.75)'); hg2.addColorStop(0.6, 'rgba(' + sl.hlA + ',.25)'); hg2.addColorStop(1, 'rgba(' + sl.hlA + ',0)'); q.fillStyle = hg2; q.fillRect(x - cc[2] * 1.2, cc[1] - cc[2] * 1.4, cc[2] * 2.2, cc[2] * 2); }); });
    var warm = q.createLinearGradient(0, 0, 0, base); warm.addColorStop(0, 'rgba(255,214,190,.35)'); warm.addColorStop(1, 'rgba(255,214,190,0)'); q.fillStyle = warm; q.fillRect(0, 0, W0, base);   // (the sunrise warming their tops)
    q.globalCompositeOperation = 'source-over';
    circ.forEach(function (cc, ci) { if (ci % 5 === 0 && cc[1] < base - rB * 0.3 && cc[0] > 0 && cc[0] < W0) tops.push([cc[0] - cc[2] * 0.2, cc[1] - cc[2] * 0.85]); });
    var haze = q.createLinearGradient(0, 0, 0, h); haze.addColorStop(0, 'rgba(255,220,235,0)'); haze.addColorStop(0.7, 'rgba(255,220,235,0)'); haze.addColorStop(1, 'rgba(160,110,180,.35)'); q.fillStyle = haze; q.fillRect(0, 0, W0, h);
    return { c: c, h: h, tops: tops.slice(0, 14) };
  }
  var branchSpr = {};
  function makeBranch(sz, seed) {                                    // (a flowering branch, dark against the sky, thick with blossom)
    var c = document.createElement('canvas'); c.width = Math.round(sz * 1.25 * 2); c.height = sz * 2; var q = c.getContext('2d'); q.scale(2, 2); var W2 = sz * 1.25, H2 = sz, k, j;
    function R(n) { return rnd(n * 2.17 + seed * 97 + 11); }
    var limbs = [[0, H2 * 0.14, W2 * 0.5, H2 * 0.1, W2 * 0.98, H2 * (0.36 + seed * 0.06), sz * 0.05]];
    for (k = 0; k < 5; k++) { var tt = 0.2 + k * 0.15, bx = (1 - tt) * (1 - tt) * limbs[0][0] + 2 * (1 - tt) * tt * limbs[0][2] + tt * tt * limbs[0][4], by = (1 - tt) * (1 - tt) * limbs[0][1] + 2 * (1 - tt) * tt * limbs[0][3] + tt * tt * limbs[0][5], up = k % 2 ? -1 : 1;
      limbs.push([bx, by, bx + W2 * 0.06, by + up * H2 * 0.12, bx + W2 * (0.1 + R(k) * 0.1), by + up * H2 * (0.16 + R(k + 5) * 0.16), sz * 0.022 * (1 - tt * 0.5)]); }
    var pts2 = [];
    limbs.forEach(function (lb, li) { for (var s = 0; s < 14; s++) { var a = s / 14, b = (s + 1) / 14; function pt(u) { return [(1 - u) * (1 - u) * lb[0] + 2 * (1 - u) * u * lb[2] + u * u * lb[4], (1 - u) * (1 - u) * lb[1] + 2 * (1 - u) * u * lb[3] + u * u * lb[5]]; } var p0 = pt(a), p1 = pt(b);
      q.strokeStyle = '#2e1830'; q.lineCap = 'round'; q.lineWidth = lb[6] * (1 - a * 0.75); q.beginPath(); q.moveTo(p0[0], p0[1]); q.lineTo(p1[0], p1[1]); q.stroke();
      q.strokeStyle = 'rgba(160,110,150,.35)'; q.lineWidth = lb[6] * (1 - a * 0.75) * 0.3; q.beginPath(); q.moveTo(p0[0], p0[1] - lb[6] * 0.2); q.lineTo(p1[0], p1[1] - lb[6] * 0.2); q.stroke();
      if (s % (li ? 3 : 2) === 1 && a > 0.12) pts2.push(p1); } });
    pts2.forEach(function (p, pi) { var nfl = 4 + Math.floor(R(pi + 40) * 5), fs = sz * 0.018;   // (clusters of blossom along it)
      for (j = 0; j < nfl; j++) { var fx = p[0] + (R(pi * 9 + j) - 0.5) * sz * 0.07, fy = p[1] + (R(pi * 9 + j + 3) - 0.5) * sz * 0.06, s2 = fs * (0.8 + R(pi * 9 + j + 6) * 0.6), lit = fy < p[1] ? 1 : 0;
        for (var pe = 0; pe < 5; pe++) { var pa = pe / 5 * TAU + R(pi + j) * 2; q.fillStyle = lit ? (j % 3 ? '#ffd2e8' : '#fff0f6') : (j % 3 ? '#f0a0c8' : '#e488b8'); q.beginPath(); q.ellipse(fx + Math.cos(pa) * s2 * 0.55, fy + Math.sin(pa) * s2 * 0.55, s2 * 0.52, s2 * 0.42, pa, 0, TAU); q.fill(); }
        q.fillStyle = '#d0507e'; q.beginPath(); q.arc(fx, fy, s2 * 0.24, 0, TAU); q.fill(); q.fillStyle = '#ffe08a'; q.beginPath(); q.arc(fx, fy, s2 * 0.1, 0, TAU); q.fill(); }
      if (pi % 3 === 0) { q.fillStyle = '#5a8a4a'; q.save(); q.translate(p[0], p[1]); q.rotate(R(pi + 70) * 6); q.beginPath(); q.moveTo(0, 0); q.quadraticCurveTo(fs, -fs * 0.8, fs * 2.4, 0); q.quadraticCurveTo(fs, fs * 0.8, 0, 0); q.fill(); q.restore(); }
    });
    return c;
  }
  function drawScene(now) {                                          // (the dawn sky, with no land in it: you float in front of it in 3D once the game's built)
    var t = (now - t0) / 1000, dt = Math.min(0.05, (now - last) / 1000); last = now;
    var sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#140f36'); sky.addColorStop(0.32, '#2e2268'); sky.addColorStop(0.58, '#6e3f98'); sky.addColorStop(0.78, '#d0789e'); sky.addColorStop(0.92, '#f6b896'); sky.addColorStop(1, '#ffdcb4');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    glow(W * 0.5, H * 1.02, Math.max(W, H) * 0.7, 'rgba(255,206,160,A)', 0.6);   // (the dawn coming up from below)
    glow(W * 0.5, H * 0.55, Math.min(W, H) * 0.55, 'rgba(255,170,230,A)', 0.18); // (a soft pink haze behind where you float)
    for (var a = 0; a < 3; a++) {                                      // (the aurora)
      g.beginPath(); var base = H * (0.12 + a * 0.06);
      for (var x = -20; x <= W + 20; x += 20) { var y = base + Math.sin(x * 0.006 + t * 0.25 + a * 2) * H * 0.04 + Math.sin(x * 0.017 - t * 0.4) * H * 0.012; if (x === -20) g.moveTo(x, y); else g.lineTo(x, y); }
      for (x = W + 20; x >= -20; x -= 20) { y = base + H * 0.11 + Math.sin(x * 0.006 + t * 0.25 + a * 2 + 0.6) * H * 0.04; g.lineTo(x, y); }
      g.closePath(); var ag = g.createLinearGradient(0, base, 0, base + H * 0.13); ag.addColorStop(0, 'rgba(255,255,255,0)'); ag.addColorStop(0.5, ['rgba(120,255,210,.16)', 'rgba(200,140,255,.14)', 'rgba(255,150,220,.12)'][a]); ag.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = ag; g.fill();
    }
    stars.forEach(function (s) {                                       // (the stars, fading toward the dawn)
      var tw = 0.45 + 0.55 * Math.sin(t * s.s + s.p), fade = 1 - s.y / 0.62 * 0.7;
      g.fillStyle = 'rgba(255,248,235,' + (tw * fade) + ')'; g.beginPath(); g.arc(s.x * W, s.y * H, s.r, 0, TAU); g.fill();
      if (s.big) { glow(s.x * W, s.y * H, 10, 'rgba(255,240,220,A)', tw * 0.5 * fade); spark4(s.x * W, s.y * H, 3 + tw * 5, 'rgba(255,245,230,' + (tw * 0.7 * fade) + ')'); }
    });
    if (!shoot && Math.random() < dt * 0.25) shoot = { x: Math.random() * W * 0.7 + W * 0.2, y: Math.random() * H * 0.25, life: 0 };   // (now and then, a shooting star)
    if (shoot) { shoot.life += dt; var sp = shoot.life * 700, sx = shoot.x - sp, sy = shoot.y + sp * 0.35, sa = Math.max(0, 1 - shoot.life / 0.9); var sg = g.createLinearGradient(sx, sy, sx + 120, sy - 42); sg.addColorStop(0, 'rgba(255,255,255,' + sa + ')'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.strokeStyle = sg; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + 120, sy - 42); g.stroke(); if (shoot.life > 0.9) shoot = null; }
    var mx = W * 0.16, my = H * 0.17, mr = Math.min(W, H) * 0.055;       // (the crescent moon)
    glow(mx, my, mr * 4, 'rgba(255,240,210,A)', 0.25);
    if (!moonSpr) {
      moonSpr = document.createElement('canvas'); moonSpr.width = moonSpr.height = 128; var mg = moonSpr.getContext('2d');
      var mgr = mg.createRadialGradient(54, 54, 10, 64, 64, 60); mgr.addColorStop(0, '#fffaf0'); mgr.addColorStop(1, '#ffe6b8'); mg.fillStyle = mgr; mg.beginPath(); mg.arc(64, 64, 58, 0, TAU); mg.fill();
      mg.fillStyle = 'rgba(230,200,170,.35)'; [[40, 80, 7], [52, 42, 5], [30, 58, 4]].forEach(function (c) { mg.beginPath(); mg.arc(c[0], c[1], c[2], 0, TAU); mg.fill(); });
      mg.globalCompositeOperation = 'destination-out'; mg.beginPath(); mg.arc(94, 52, 54, 0, TAU); mg.fill();
    }
    g.drawImage(moonSpr, mx - mr, my - mr, mr * 2, mr * 2);
    clouds.forEach(function (c) {                                      // (soft wisps of cloud drifting by, nearer ones faster)
      c.x = (c.x + c.sp * dt * (0.5 + c.layer * 0.6)) % 1.3;
      cloud((c.x - 0.15) * W, (c.layer === 2 ? 0.88 : c.y) * H, c.w * W * (1 + c.layer * 0.3), ['rgba(255,190,220,.12)', 'rgba(255,205,225,.15)', 'rgba(255,215,230,.22)'][c.layer]);
    });
      g.save(); g.translate(W / 2, H * 0.6); g.rotate(t * 0.012); var RL = Math.max(W, H) * 1.1;   // (rays of dawn light fanning out from behind you all)
      for (var ry = 0; ry < 16; ry++) { g.rotate(TAU / 16); var rg2 = g.createLinearGradient(0, 0, 0, -RL); rg2.addColorStop(0, 'rgba(255,225,205,' + (ry % 2 ? 0.07 : 0.12) + ')'); rg2.addColorStop(1, 'rgba(255,225,205,0)'); g.fillStyle = rg2; g.beginPath(); g.moveTo(0, 0); g.lineTo(-RL * (ry % 3 ? 0.07 : 0.11), -RL); g.lineTo(RL * (ry % 3 ? 0.07 : 0.11), -RL); g.closePath(); g.fill(); }
      g.restore();
    // ----- the magic in the sky -----
    var px0 = W * (W < H ? 0.8 : 0.84), py0 = H * (W < H ? 0.24 : 0.2), pr = Math.min(W, H) * 0.075;   // (a ringed pastel planet)
    if (!planetSpr) {
      planetSpr = document.createElement('canvas'); planetSpr.width = 256; planetSpr.height = 160; var pg = planetSpr.getContext('2d');
      pg.translate(128, 80); pg.rotate(-0.32);
      pg.strokeStyle = 'rgba(255,220,250,.45)'; pg.lineWidth = 7; pg.beginPath(); pg.ellipse(0, 0, 112, 26, 0, Math.PI, TAU); pg.stroke();
      pg.strokeStyle = 'rgba(200,170,255,.35)'; pg.lineWidth = 4; pg.beginPath(); pg.ellipse(0, 0, 96, 21, 0, Math.PI, TAU); pg.stroke();
      var pgr = pg.createRadialGradient(-18, -20, 6, 0, 0, 56); pgr.addColorStop(0, '#ffe2f4'); pgr.addColorStop(0.55, '#d8a6f0'); pgr.addColorStop(1, '#7a58b8');
      pg.fillStyle = pgr; pg.beginPath(); pg.arc(0, 0, 54, 0, TAU); pg.fill();
      pg.save(); pg.clip(); pg.fillStyle = 'rgba(255,255,255,.12)'; [-26, -6, 16, 34].forEach(function (b, k) { pg.fillRect(-60, b, 120, 6 + k * 2); }); pg.restore();
      pg.strokeStyle = 'rgba(255,220,250,.75)'; pg.lineWidth = 7; pg.beginPath(); pg.ellipse(0, 0, 112, 26, 0, 0, Math.PI); pg.stroke();
      pg.strokeStyle = 'rgba(200,170,255,.6)'; pg.lineWidth = 4; pg.beginPath(); pg.ellipse(0, 0, 96, 21, 0, 0, Math.PI); pg.stroke();
    }
    glow(px0, py0, pr * 3.2, 'rgba(220,170,255,A)', 0.3);
    g.globalAlpha = 0.9; g.drawImage(planetSpr, px0 - pr * 2.37, py0 - pr * 1.48 + Math.sin(t * 0.3) * 3, pr * 4.74, pr * 2.96); g.globalAlpha = 1;
    var WL = Math.min(W, H) * (W < H ? 0.5 : 0.36), wx = ((t * 0.011 + 0.35) % 1.5 - 0.25) * W, wy = H * (W < H ? 0.27 : 0.34) + Math.sin(t * 0.25) * H * 0.02;   // (a great whale of starlight, swimming slowly across the sky)
    g.save(); g.translate(wx, wy); g.rotate(Math.sin(t * 0.25 + 1) * 0.04);
    var wg = g.createLinearGradient(0, -WL * 0.12, 0, WL * 0.12); wg.addColorStop(0, 'rgba(160,200,255,.2)'); wg.addColorStop(1, 'rgba(220,170,255,.12)');
    var fl2 = Math.sin(t * 1.1) * 0.35;
    g.fillStyle = wg; g.strokeStyle = 'rgba(220,235,255,.35)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(WL * 0.5, -WL * 0.01); g.bezierCurveTo(WL * 0.46, -WL * 0.12, WL * 0.1, -WL * 0.13, -WL * 0.25, -WL * 0.05); g.quadraticCurveTo(-WL * 0.4, -WL * 0.02, -WL * 0.47, WL * fl2 * 0.05);
    g.quadraticCurveTo(-WL * 0.4, WL * 0.05, -WL * 0.2, WL * 0.07); g.bezierCurveTo(WL * 0.1, WL * 0.15, WL * 0.42, WL * 0.13, WL * 0.5, -WL * 0.01); g.fill(); g.stroke();
    g.save(); g.translate(-WL * 0.47, WL * fl2 * 0.05); g.rotate(fl2 * 0.6); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(-WL * 0.06, -WL * 0.1, -WL * 0.16, -WL * 0.11); g.quadraticCurveTo(-WL * 0.08, -WL * 0.02, 0, 0); g.quadraticCurveTo(-WL * 0.08, WL * 0.02, -WL * 0.16, WL * 0.11); g.quadraticCurveTo(-WL * 0.06, WL * 0.1, 0, 0); g.fill(); g.stroke(); g.restore();   // (the tail flukes)
    g.save(); g.translate(WL * 0.16, WL * 0.08); g.rotate(0.5 + Math.sin(t * 1.1 + 1) * 0.25); g.beginPath(); g.ellipse(-WL * 0.06, 0, WL * 0.08, WL * 0.022, 0, 0, TAU); g.fill(); g.stroke(); g.restore();   // (a flipper)
    g.strokeStyle = 'rgba(220,235,255,.18)'; for (var gv = 0; gv < 4; gv++) { g.beginPath(); g.moveTo(WL * 0.42, WL * (0.04 + gv * 0.018)); g.quadraticCurveTo(WL * 0.2, WL * (0.1 + gv * 0.016), WL * 0.02, WL * (0.07 + gv * 0.012)); g.stroke(); }   // (the grooves of its belly)
    whaleStars.forEach(function (st) { var tw = 0.5 + 0.5 * Math.sin(t * 2 + st[2] * 3); g.fillStyle = 'rgba(255,250,240,' + (0.35 + 0.5 * tw) + ')'; g.beginPath(); g.arc(st[0] * WL, st[1] * WL * (1 - Math.abs(st[0]) * 0.9), 0.8 + tw, 0, TAU); g.fill(); });
    g.strokeStyle = 'rgba(255,250,240,.3)'; g.beginPath(); whaleStars.slice(0, 7).forEach(function (st, k) { g[k ? 'lineTo' : 'moveTo'](st[0] * WL, st[1] * WL * (1 - Math.abs(st[0]) * 0.9)); }); g.stroke();   // (a constellation inside it)
    g.restore();
    glow(wx + WL * 0.36, wy - WL * 0.03, 8, 'rgba(255,255,255,A)', 0.8); g.fillStyle = '#fff'; g.beginPath(); g.arc(wx + WL * 0.36, wy - WL * 0.03, 1.8, 0, TAU); g.fill();   // (its kind eye)
    for (var tr = 0; tr < 10; tr++) { var tf = tr / 10; glow(wx - WL * (0.6 + tf * 0.9), wy + Math.sin(t * 1.3 - tr * 0.7) * WL * 0.05, 6 - tf * 4, 'rgba(210,225,255,A)', 0.6 * (1 - tf)); }   // (a trail of stardust)
    var tall2 = W < H, TX = 170;                                       // (two floating islands, far off: a wizard's tower with its waterfall, and a blossom tree)
    [['tower', tall2 ? 0.25 : 0.16, tall2 ? 0.37 : 0.6, 0, tall2 ? W * 0.5 : Math.min(W * 0.3, H * 0.56)], ['tree', tall2 ? 0.83 : 0.87, tall2 ? 0.44 : 0.56, 2, tall2 ? W * 0.32 : Math.min(W * 0.18, H * 0.34)]].forEach(function (il) {
      var kind2 = il[0] === 'tree' && window.EVERDAWN_TREE_IMG ? 'treebare' : il[0], spr = isles[kind2] || (isles[kind2] = makeIsle(kind2)), sc = il[4] / 320, ix = il[1] * W, iy = il[2] * H + Math.sin(t * 0.5 + il[3]) * 6, d;
      function P(x, y) { return [ix + (x - 160) * sc, iy + (y - 200) * sc]; }
      glow(ix, iy + 40 * sc, 170 * sc, il[0] === 'tree' ? 'rgba(255,160,220,A)' : 'rgba(170,160,255,A)', 0.25);
      if (il[0] === 'tower') {
        var cp = P(TX + 13, 33);                                       // (smoke curling up from the chimney)
        for (d = 0; d < 8; d++) { var sp2 = (t * 0.18 + d / 8) % 1; g.fillStyle = 'rgba(232,222,250,' + (0.32 * (1 - sp2) * Math.min(1, sp2 * 6)) + ')'; g.beginPath(); g.arc(cp[0] + (sp2 * 26 + Math.sin(t + d * 2) * 3 * sp2) * sc, cp[1] - sp2 * 64 * sc, (2.4 + sp2 * 10) * sc, 0, TAU); g.fill(); }
      }
      g.drawImage(spr, ix - 160 * sc, iy - 230 * sc, 320 * sc, 390 * sc);
      if (il[0] === 'tower') {
        [[96, 330, 9, 0], [214, 356, 7, 1.7], [256, 300, 6, 3.1]].forEach(function (fr) {   // (little rocks floating loose beneath it)
          var fp3 = P(fr[0], fr[1] + Math.sin(t * 0.9 + fr[3]) * 5), r3 = fr[2] * sc;
          glow(fp3[0], fp3[1] + r3 * 0.6, r3 * 2.4, 'rgba(200,170,255,A)', 0.25);
          g.fillStyle = '#6c5294'; g.beginPath(); g.moveTo(fp3[0] - r3, fp3[1]); g.lineTo(fp3[0] + r3, fp3[1] - r3 * 0.1); g.lineTo(fp3[0] + r3 * 0.3, fp3[1] + r3 * 1.3); g.lineTo(fp3[0] - r3 * 0.4, fp3[1] + r3 * 0.9); g.closePath(); g.fill();
          g.fillStyle = 'rgba(30,15,60,.45)'; g.beginPath(); g.moveTo(fp3[0] + r3, fp3[1] - r3 * 0.1); g.lineTo(fp3[0] + r3 * 0.3, fp3[1] + r3 * 1.3); g.lineTo(fp3[0] + r3 * 0.1, fp3[1] + r3 * 0.2); g.closePath(); g.fill();
          g.fillStyle = '#5aa88a'; g.beginPath(); g.ellipse(fp3[0], fp3[1] - r3 * 0.05, r3, r3 * 0.25, 0, 0, TAU); g.fill();
        });
        var L0 = P(230, 214), bot = P(233, 480), ws1 = 8.5 * sc, wsb = 26 * sc, wd;   // (the waterfall: over the lip, and away into the clouds below)
        glow(L0[0], (L0[1] + bot[1]) / 2 - 40 * sc, 80 * sc, 'rgba(150,215,255,A)', 0.35);
        function sheet(x0, y0, wa, x1, y1, wb, a0) { var gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(230,250,255,' + a0 + ')'); gr.addColorStop(0.55, 'rgba(165,218,255,' + a0 * 0.8 + ')'); gr.addColorStop(1, 'rgba(165,218,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - wa, y0); g.bezierCurveTo(x0 - wa - sc, y0 + (y1 - y0) * 0.3, x1 - wb, y1 - (y1 - y0) * 0.4, x1 - wb, y1); g.lineTo(x1 + wb, y1); g.bezierCurveTo(x1 + wb, y1 - (y1 - y0) * 0.4, x0 + wa + sc, y0 + (y1 - y0) * 0.3, x0 + wa, y0); g.closePath(); g.fill(); }
        function edges(x0, y0, wa, x1, y1, wb) { g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = Math.max(1, 1.1 * sc); [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(x0 + s * wa * 0.9, y0); g.quadraticCurveTo(x0 + s * (wa + sc), (y0 + y1) / 2, x0 + (x1 - x0) * 0.7 + s * (wa + (wb - wa) * 0.7) * 0.9, y0 + (y1 - y0) * 0.7); g.stroke(); }); }
        function streaks(x0, y0, wa, x1, y1, wb, n, spd, seed) { for (var s = 0; s < n; s++) { var ph = (t * spd + s / n + rnd(s + seed) * 0.5) % 1, x = x0 + (x1 - x0) * ph + (rnd(s + seed + 50) - 0.5) * 1.7 * (wa + (wb - wa) * ph), a = (1 - ph * 0.85) * (0.45 + 0.55 * rnd(s + seed + 90)); g.fillStyle = 'rgba(255,255,255,' + a * 0.9 + ')'; g.fillRect(x - 0.6 * Math.max(1, sc), y0 + (y1 - y0) * ph, 1.2 * Math.max(1, sc), (5 + 16 * ph) * sc); } }
        sheet(L0[0], L0[1], ws1, bot[0], bot[1], wsb, 0.9); edges(L0[0], L0[1], ws1, bot[0], bot[1], wsb); streaks(L0[0], L0[1], ws1, bot[0], bot[1], wsb, 60, 0.5, 9700);
        for (wd = 0; wd < 6; wd++) glow(L0[0] + (wd - 2.5) * 3 * sc, L0[1] + sc, (4 + 2 * Math.sin(t * 6 + wd * 2)) * sc, 'rgba(255,255,255,A)', 0.75);   // (foam where it curls over the lip)
        for (wd = 0; wd < 12; wd++) { var dp2 = (t * 0.7 + wd / 12) % 1, sd3 = wd % 2 ? 1 : -1; g.fillStyle = 'rgba(230,248,255,' + 0.7 * (1 - dp2) + ')'; g.beginPath(); g.arc(L0[0] + sd3 * (ws1 + dp2 * 9 * sc), L0[1] + dp2 * dp2 * 90 * sc, Math.max(0.6, sc), 0, TAU); g.fill(); }   // (droplets breaking off)
        for (wd = 0; wd < 14; wd++) { var sp5 = (t * 0.45 + wd / 14) % 1, sx5 = L0[0] + (bot[0] - L0[0]) * sp5 + (rnd(wd + 9900) - 0.5) * 1.6 * (ws1 * 1.25 + (wsb - ws1 * 1.25) * sp5), tw2 = Math.max(0, Math.sin(t * 9 + wd * 2.3)); spark4(sx5, L0[1] + (bot[1] - L0[1]) * sp5, (1.2 + 2.4 * tw2) * Math.max(1, sc), 'rgba(255,255,255,' + tw2 * (1 - sp5) + ')'); }   // (glints of light in the water)
        var mb = bot[1] - 70 * sc; for (wd = 0; wd < 10; wd++) { var mp = (t * 0.16 + wd / 10) % 1; glow(bot[0] + (wd - 4.5) * 8 * sc + mp * 12 * sc * (wd % 2 ? 1 : -1), mb + 24 * sc - mp * 36 * sc, (18 + mp * 30) * sc, 'rgba(232,244,255,A)', 0.45 * Math.sin(mp * Math.PI)); }   // (mist billowing up from far below)
        g.save(); g.globalAlpha = 0.3 + 0.08 * Math.sin(t * 0.7); g.lineWidth = 2.4 * sc; ['#ff7a8a', '#ffc070', '#fff08a', '#8ef0a0', '#8ac8ff', '#c09aff'].forEach(function (col, ci) { g.strokeStyle = col; g.beginPath(); g.arc(bot[0], mb + 26 * sc, (44 - ci * 2.4) * sc, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); }); g.restore();   // (a rainbow in the spray)
        var pc = P(226, 202.4); for (wd = 0; wd < 3; wd++) { var rp2 = (t * 0.35 + wd / 3) % 1; g.strokeStyle = 'rgba(255,255,255,' + 0.55 * (1 - rp2) + ')'; g.lineWidth = Math.max(0.5, 0.5 * sc); g.beginPath(); g.ellipse(pc[0] + (wd - 1) * 5 * sc, pc[1] + (wd % 2) * sc, (0.6 + rp2 * 5) * sc, (0.2 + rp2 * 1.3) * sc, 0, 0, TAU); g.stroke(); }   // (ripples on the pond)
        for (wd = 0; wd < 5; wd++) { var sp4 = (t * 0.9 + wd / 5) % 1, a1 = P(222 + wd * 3.2, 205 + sp4 * 9); g.fillStyle = 'rgba(255,255,255,' + 0.8 * Math.sin(sp4 * Math.PI) + ')'; g.fillRect(a1[0], a1[1], 2 * sc, 0.6 * sc); }   // (the stream running to the edge)
        for (wd = 0; wd < 12; wd++) { var lt2 = (wd + 0.5) / 12, lp = P((1 - lt2) * (1 - lt2) * (TX + 32) + 2 * (1 - lt2) * lt2 * (TX + 70) + lt2 * lt2 * 276, (1 - lt2) * (1 - lt2) * 92 + 2 * (1 - lt2) * lt2 * 158 + lt2 * lt2 * 173 + 1); glow(lp[0], lp[1], 3.4 * sc, ['rgba(255,210,122,A)', 'rgba(255,156,204,A)', 'rgba(154,224,255,A)', 'rgba(184,255,154,A)'][wd % 4], 0.5 + 0.5 * Math.sin(t * 3 + wd * 1.3)); }   // (the string lights twinkling)
        for (wd = 0; wd < 8; wd++) { var fr2 = P(200 + Math.cos(wd / 8 * TAU) * 9, 209.4 + Math.sin(wd / 8 * TAU) * 2.6); glow(fr2[0], fr2[1], 3 * sc, 'rgba(120,255,230,A)', 0.4 + 0.3 * Math.sin(t * 2 + wd)); }   // (the fairy ring glowing)
        var cvp = P(112, 253), ch = 70 * sc, cg3 = g.createLinearGradient(0, cvp[1], 0, cvp[1] + ch); cg3.addColorStop(0, 'rgba(180,240,255,.55)'); cg3.addColorStop(1, 'rgba(180,240,255,0)'); g.fillStyle = cg3; g.fillRect(cvp[0] - 1.2 * sc, cvp[1], 2.4 * sc, ch);   // (a trickle from the spring in the cave)
        for (d = 0; d < 3; d++) { var tp2 = (t * 0.5 + d / 3) % 1; g.fillStyle = 'rgba(255,255,255,' + 0.7 * (1 - tp2) + ')'; g.fillRect(cvp[0] - 0.5, cvp[1] + tp2 * ch, 1, 5 * sc); }
        var fk = 0.75 + 0.25 * Math.sin(t * 7) * Math.sin(t * 3.3);   // (lamplight in the windows, flickering)
        [[TX - 7, 152, 12], [TX + 8, 124, 11], [TX, 81, 11], [TX - 6.5, 53, 8], [TX + 17, 183, 9], [129, 167, 9], [TX - 2, 181.5, 5], [135, 242.8, 7], [281, 177.5, 9]].forEach(function (w, wi) { var wp = P(w[0], w[1]); glow(wp[0], wp[1], w[2] * sc * 1.6, 'rgba(255,205,120,A)', 0.6 * (wi % 2 ? fk : 1.6 - fk)); });
        var cpot = P(130, 190.6); glow(cpot[0], cpot[1], 10 * sc, 'rgba(120,255,150,A)', 0.55 + 0.15 * Math.sin(t * 5));   // (the cauldron bubbling)
        for (d = 0; d < 4; d++) { var bp = (t * 0.7 + d / 4) % 1; g.strokeStyle = 'rgba(170,255,180,' + (0.8 * (1 - bp)) + ')'; g.lineWidth = 0.8; g.beginPath(); g.arc(cpot[0] + (rnd(d + 9200) - 0.5) * 7 * sc + Math.sin(t * 3 + d) * sc, cpot[1] - bp * 14 * sc, (0.8 + bp * 1.4) * sc, 0, TAU); g.stroke(); }
        var pp2 = P(TX + 15, -15), wv = Math.sin(t * 4); g.fillStyle = '#ff8cc0'; g.beginPath(); g.moveTo(pp2[0], pp2[1]); g.quadraticCurveTo(pp2[0] + 7 * sc, pp2[1] + (wv * 2 - 0.5) * sc, pp2[0] + 14 * sc, pp2[1] + (2.6 + Math.sin(t * 4 - 1.2) * 2) * sc); g.quadraticCurveTo(pp2[0] + 7 * sc, pp2[1] + (5 + wv * 2) * sc, pp2[0], pp2[1] + 5 * sc); g.fill();   // (a pennant on the weather vane)
        for (d = 0; d < 9; d++) { var fa = t * (0.3 + rnd(d + 9300) * 0.3) + d * 0.7, fp = P(160 + Math.cos(fa) * (60 + rnd(d + 9400) * 80), 170 + Math.sin(fa * 1.3) * 40 - rnd(d + 9500) * 40), fo = Math.max(0, Math.sin(t * 2 + d * 1.9)); glow(fp[0], fp[1], 5 * sc, 'rgba(230,255,150,A)', fo * 0.8); }   // (fireflies)
      } else {
        var tp = P(160, 90); glow(tp[0], tp[1], 90 * sc, 'rgba(255,190,235,A)', 0.2 + 0.08 * Math.sin(t * 1.5));
        var DT = window.EVERDAWN_TREE_IMG; if (DT) { var dtw = 330 * sc, dth = dtw * DT.aspect, db = P(160, 201); g.drawImage(DT.img, db[0] - DT.bx * dtw, db[1] - DT.by * dth, dtw, dth); }   // (your very own Dawn Tree)
        if (isPetals.length < 14 && Math.random() < dt * 3) isPetals.push({ x: (Math.random() - 0.5) * 140, y: 100, life: 0, r: Math.random() * 6 });
        isPetals = isPetals.filter(function (pp) { pp.life += dt; pp.x += Math.sin(pp.life * 2 + pp.r) * 12 * dt + 6 * dt; pp.y += 16 * dt; pp.r += dt * 2; var pq = P(160 + pp.x, pp.y); g.fillStyle = 'rgba(255,180,220,' + Math.max(0, 1 - pp.life / 9) + ')'; g.beginPath(); g.ellipse(pq[0], pq[1], 2.4, 1.2, pp.r, 0, TAU); g.fill(); return pp.life < 9; });   // (petals drifting off the tree)
      }
    });
    if (petals.length < 30 && Math.random() < dt * 4) petals.push({ x: Math.random() * W, y: -10, vx: 10 + Math.random() * 25, vy: 18 + Math.random() * 18, r: Math.random() * TAU, life: 0 });   // (blossom petals drifting down)
    petals = petals.filter(function (p) { p.life += dt; p.x += (p.vx + Math.sin(p.life * 2 + p.r) * 22) * dt; p.y += p.vy * dt; p.r += dt * 2; return p.y < H + 10; });
    petals.forEach(function (p) { g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.scale(1, 0.5 + 0.5 * Math.abs(Math.sin(p.life * 3))); g.fillStyle = 'rgba(255,175,215,.85)'; g.beginPath(); g.ellipse(0, 0, 5, 2.6, 0, 0, TAU); g.fill(); g.restore(); });
    motes.forEach(function (m) {                                       // (sparkles rising through the air)
      m.y -= m.sp * dt; if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
      var a = 0.35 + 0.35 * Math.sin(t * 2 + m.p), px = (m.x + Math.sin(t * 0.3 + m.p) * 0.01) * W, py = m.y * H;
      glow(px, py, m.r * 5, 'hsla(' + m.hue + ',100%,80%,A)', a * 0.5); g.fillStyle = 'hsla(' + m.hue + ',100%,92%,' + a + ')'; g.beginPath(); g.arc(px, py, m.r, 0, TAU); g.fill();
    });
    flies.forEach(function (f) {                                       // (and a few fireflies, blinking)
      var fx = (f.x + Math.sin(t * f.sp + f.p) * 0.03) * W, fy = (f.y - 0.1 + Math.cos(t * f.sp * 0.8 + f.p) * 0.02) * H, on = Math.max(0, Math.sin(t * 1.7 + f.p * 3));
      glow(fx, fy, 14, 'rgba(230,255,150,A)', on * 0.55); g.fillStyle = 'rgba(250,255,200,' + on + ')'; g.beginPath(); g.arc(fx, fy, 1.8, 0, TAU); g.fill();
    });
      var seaY = H * (W < H ? 0.8 : 0.79), cu = Math.min(W, H);           // (a sea of clouds far below, lit by the dawn, that everything floats above)
      SEA.forEach(function (sl, li) {
        var yb = seaY + H * sl.dy, rB = cu * sl.r, key = Math.round(W) + 'x' + Math.round(H) + ':' + li, spr = seaSpr[key] || (seaSpr[key] = makeSea(li, W, rB)), off = (t * sl.v) % W, top = yb - rB * 1.7;
        g.drawImage(spr.c, off - W, top, W, spr.h); g.drawImage(spr.c, off, top, W, spr.h);
        g.fillStyle = sl.base; g.fillRect(0, top + spr.h - 1, W, H);
        if (li === SEA.length - 1) spr.tops.forEach(function (tp2, k) { var tw = Math.max(0, Math.sin(t * 1.7 + k * 2.3)); if (tw < 0.2) return; var gx4 = (tp2[0] + off) % W; glow(gx4, top + tp2[1], 10, 'rgba(255,236,200,A)', tw * 0.6); spark4(gx4, top + tp2[1], 2 + tw * 4, 'rgba(255,250,235,' + tw + ')'); });   // (glints of sunrise on the cloud tops)
      });
      glow(W / 2, seaY + H * 0.05, Math.max(W, H) * 0.45, 'rgba(255,225,200,A)', 0.3);
      var bs = Math.min(W, H) * (W < H ? 0.42 : 0.5);                    // (blossom branches reaching in from the top corners, framing the picture)
      [[0, 1, 0], [W, -1, 1]].forEach(function (b) { var key = b[2] + ':' + Math.round(bs); if (!branchSpr[key]) branchSpr[key] = makeBranch(Math.round(bs), b[2]); g.save(); g.translate(b[0], 0); g.scale(b[1], 1); g.rotate(Math.sin(t * 0.6 + b[2] * 2) * 0.012); g.drawImage(branchSpr[key], -bs * 0.05, -bs * 0.08, bs * 1.25, bs); g.restore(); });
    var vg = g.createRadialGradient(W / 2, H * 0.5, Math.min(W, H) * 0.3, W / 2, H * 0.5, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(20,10,40,.45)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);   // (a soft vignette)
  }

  // ----- loading, and the Play button -----
  var shown = 0, target = 0, tipAt = 0, ready = false, alive = true;
  var TIPS = ['Watering the moonblooms…', 'Waking the Glimmerwings…', 'Fluffing the hay…', 'Polishing the stars…', 'Lighting the lanterns…', 'Stirring the cauldron…', 'Shaking out the petals…', 'Tuning the wind chimes…'], tipN = 0;
  function setTip(txt) { tipEl.style.opacity = 0; setTimeout(function () { tipEl.textContent = txt; tipEl.style.opacity = 1; }, 200); }
  function loop(now) {
    if (!alive) return;
    drawScene(now);
    shown += (target - shown) * 0.08; if (target - shown < 0.3) shown = target;
    fill.style.width = 'calc(' + shown + '% - 6px)'; bud.style.left = 'calc(' + shown + '% - ' + shown * 0.06 + 'px)'; pctEl.textContent = Math.round(shown) + '%';
    for (var k = 0; k < leaves.length; k++) leaves[k].classList.toggle('on', shown > 8 + k * 10.5 + 3);
    if (!ready && now - tipAt > 1600) { tipAt = now; setTip(TIPS[tipN++ % TIPS.length]); }
    if (ready && shown >= 99.5 && !playBtn.classList.contains('show')) { load.classList.add('done'); setTimeout(function () { load.style.display = 'none'; playBtn.classList.add('show'); optBtn.classList.add('show'); hint.classList.add('show'); playBtn.focus(); }, 450); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  // ----- the title music: "The Witch's Waltz-Step", a cute, sneaky little tune in D minor -----
  // A music-box celesta sings the tune over bouncy plucked strings (bass on 1 and 3, a pluck of the chord on 2 and 4,
  // like tiptoeing). In the second part a hollow,
  // woody clarinet takes the tune; then the first tune comes back with a glockenspiel
  // doubling it, and a short spooky-cute bridge where a theremin glides and swoops. It all fades away when you press
  // Play. Browsers only allow sound after a tap or a key, so it starts on your first one, and the ♪ button in the
  // corner turns it on or off (and remembers)
  var titleMusic = (function () {
    var KEY = 'everdawn-title-music', want = true; try { want = localStorage.getItem(KEY) !== 'off'; } catch (err) {}
    var ac = null, out = null, verb = null, timer = 0, next = 0, bar = 0, done = false, BPM = 116, SPB = 60 / BPM;
    var CH = { Dm: [38, [50, 53, 57]], Gm: [43, [50, 55, 58]], A7: [45, [49, 55, 57]], Bb: [46, [50, 53, 58]], F: [41, [48, 53, 57]], C: [36, [48, 52, 55]], Eo: [40, [46, 52, 55]] };
    var A = [['Dm', [[0, 74, 0.5], [0.5, 73, 0.5], [1, 74, 1], [2, 69, 1], [3, 65, 1]]], ['Dm', [[0, 67, 0.5], [0.5, 69, 0.5], [1, 70, 1], [2, 69, 2]]], ['Gm', [[0, 70, 0.5], [0.5, 72, 0.5], [1, 74, 1], [2, 70, 1], [3, 67, 1]]], ['A7', [[0, 69, 1], [1, 73, 1], [2, 76, 2]]],
             ['Dm', [[0, 77, 0.5], [0.5, 76, 0.5], [1, 74, 1], [2, 73, 1], [3, 74, 1]]], ['Bb', [[0, 70, 1], [1, 74, 1], [2, 77, 2]]], ['Eo', [[0, 79, 0.5], [0.5, 77, 0.5], [1, 76, 1], [2, 73, 1], [3, 70, 1]]], ['A7', [[0, 69, 1], [1, 73, 0.5], [1.5, 76, 0.5], [2, 74, 2]]]];
    var B = [['F', [[0, 65, 1.5], [1.5, 67, 0.5], [2, 69, 2]]], ['C', [[0, 67, 1], [1, 64, 1], [2, 60, 2]]], ['Dm', [[0, 62, 1.5], [1.5, 65, 0.5], [2, 69, 1], [3, 74, 1]]], ['A7', [[0, 73, 3], [3, 69, 1]]],
             ['Bb', [[0, 70, 1.5], [1.5, 69, 0.5], [2, 67, 1], [3, 65, 1]]], ['Gm', [[0, 67, 1.5], [1.5, 65, 0.5], [2, 62, 2]]], ['Eo', [[0, 64, 1], [1, 67, 1], [2, 70, 1], [3, 73, 1]]], ['A7', [[0, 76, 2], [2, 73, 1], [3, 69, 1]]]];
    var BR = [['Dm', [[0, 74, 2], [2, 77, 2]]], ['Bb', [[0, 74, 4]]], ['Gm', [[0, 70, 2], [2, 73, 2]]], ['A7', [[0, 76, 4]]]];
    var SONG = []; A.forEach(function (b) { SONG.push({ part: 'A', b: b }); }); B.forEach(function (b) { SONG.push({ part: 'B', b: b }); }); A.forEach(function (b) { SONG.push({ part: 'A2', b: b }); }); BR.forEach(function (b) { SONG.push({ part: 'BR', b: b }); });
    function hz(n) { return 440 * Math.pow(2, (n - 69) / 12); }
    function at(t0, beat) { var f = beat - Math.floor(beat); return t0 + (Math.floor(beat) + (Math.abs(f - 0.5) < 0.01 ? 0.6 : f)) * SPB; }   // (lightly swung)
    function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
    function osc(type, f, t, end, dest, detune) { var o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); if (detune) o.detune.value = detune; o.connect(dest); o.start(t); o.stop(end); return o; }
    function voice(gain, wet) { var g = ac.createGain(); g.connect(out); if (wet) { var s = ac.createGain(); s.gain.value = wet; g.connect(s); s.connect(verb); } return g; }
    function celesta(t, n, len, v) { var g = voice(1, 0.45); env(g, t, 0.012, 0.16 * v, 0.9 + len * SPB * 0.5); osc('sine', hz(n), t, t + 2.4, g); var g2 = voice(1, 0.3); env(g2, t, 0.012, 0.035 * v, 0.25); osc('sine', hz(n) * 4, t, t + 0.4, g2); var g3 = voice(1, 0.3); env(g3, t, 0.012, 0.03 * v, 0.5); osc('triangle', hz(n) * 2, t, t + 0.7, g3); }
    function glock(t, n, v) { var g = voice(1, 0.5); env(g, t, 0.01, 0.07 * v, 0.7); osc('sine', hz(n + 12), t, t + 1, g); var g2 = voice(1, 0.4); env(g2, t, 0.01, 0.015 * v, 0.15); osc('sine', hz(n + 12) * 2.76, t, t + 0.25, g2); }
    function pizz(t, n, v) { var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(hz(n) * 6, t); lp.frequency.exponentialRampToValueAtTime(hz(n) * 1.5, t + 0.18); var g = voice(1, 0.18); lp.connect(g); env(g, t, 0.014, 0.2 * v, 0.3); osc('triangle', hz(n), t, t + 0.45, lp); }   // (a soft, round pluck, with no click at the start)
    function clarinet(t, n, len, v) { var e = t + len * SPB * 0.95, lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1300; lp.Q.value = 2; var g = voice(1, 0.35); lp.connect(g);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07 * v, t + 0.06); g.gain.setValueAtTime(0.07 * v, Math.max(t + 0.07, e - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, e + 0.12);
      var o = osc('square', hz(n), t, e + 0.2, lp), vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 5; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(hz(n) * 0.006, t + 0.4); vib.connect(vg); vg.connect(o.frequency); vib.start(t); vib.stop(e + 0.2); }
    function theremin(t, n, len, prev) { var e = t + len * SPB, g = voice(1, 0.6); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + 0.2); g.gain.setValueAtTime(0.06, e - 0.25); g.gain.exponentialRampToValueAtTime(0.0001, e + 0.05);
      var o = ac.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(hz(prev || n), t); o.frequency.exponentialRampToValueAtTime(hz(n), t + 0.28); o.connect(g);
      var vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 6.2; vg.gain.value = hz(n) * 0.014; vib.connect(vg); vg.connect(o.frequency); o.start(t); o.stop(e + 0.1); vib.start(t); vib.stop(e + 0.1); }
    function playBar(t0, s, idx) {
      var ch = CH[s.b[0]], part = s.part, bridge = part === 'BR', last = idx === 7 || (bridge && idx === 27);
      pizz(at(t0, 0), ch[0], 1); if (!bridge) { ch[1].forEach(function (n) { pizz(at(t0, 1), n, 0.42); }); pizz(at(t0, 2), ch[0] + 7, 0.85); ch[1].forEach(function (n) { pizz(at(t0, 3), n, 0.42); }); }   // (oom-pah, on tiptoe)
      else pizz(at(t0, 2), ch[0] + 7, 0.7);
      var prev = null;
      s.b[1].forEach(function (nt) { var t = at(t0, nt[0]);
        if (part === 'A' || part === 'A2') { celesta(t, nt[1], nt[2], 1); if (part === 'A2') glock(t, nt[1], 0.8); }
        else if (part === 'B') clarinet(t, nt[1] - 12 + 12, nt[2], 1);
        else { theremin(t, nt[1], nt[2], prev); prev = nt[1]; } });
    }
    function tick() { if (!ac || done) return; var now = ac.currentTime; if (next < now) next = now + 0.1;
      while (next < now + 0.7) { playBar(next, SONG[bar % SONG.length], bar % SONG.length); next += 4 * SPB; bar++; } }
    function start() {
      if (done || !want) return; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!ac) { ac = new AC(); ac.evMusic = true; out = ac.createGain(); out.gain.value = 0; var comp = ac.createDynamicsCompressor(); out.connect(comp); comp.connect(ac.destination);
        verb = ac.createConvolver(); var len = Math.floor(ac.sampleRate * 2.4), ir = ac.createBuffer(2, len, ac.sampleRate); for (var c = 0; c < 2; c++) { var d = ir.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); } verb.buffer = ir; var vg = ac.createGain(); vg.gain.value = 0.5; verb.connect(vg); vg.connect(comp);
        timer = setInterval(tick, 120); }
      if (ac.state === 'suspended') ac.resume();
      out.gain.cancelScheduledValues(ac.currentTime); out.gain.setValueAtTime(out.gain.value, ac.currentTime); out.gain.linearRampToValueAtTime(0.9, ac.currentTime + 1.2); tick();
    }
    function silence(t) { if (!ac) return; out.gain.cancelScheduledValues(ac.currentTime); out.gain.setValueAtTime(out.gain.value, ac.currentTime); out.gain.linearRampToValueAtTime(0, ac.currentTime + t); }
    function toggle() { if (want && !done && (!ac || ac.state !== 'running')) { start(); return want; }   // (the very first press just starts it)
      want = !want; try { localStorage.setItem(KEY, want ? 'on' : 'off'); } catch (err) {} if (want) start(); else silence(0.5); return want; }
    function stop() { if (done) return; done = true; silence(1.4); setTimeout(function () { clearInterval(timer); if (ac) ac.close(); }, 1700); }
    function first(e) { if (e && e.target && e.target.classList && e.target.classList.contains('ev-music')) return; start(); ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.removeEventListener(ev, first, true); }); }
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, first, true); });
    document.addEventListener('visibilitychange', function () { if (ac && !done) { if (document.hidden) ac.suspend(); else if (want) ac.resume(); } });
    return { toggle: toggle, stop: stop, on: function () { return want; } };
  })();
  var musBtn = document.createElement('button'); musBtn.type = 'button'; musBtn.className = 'ev-music';
  function musLabel() { musBtn.textContent = titleMusic.on() ? '♪ Music: On' : '♪ Music: Off'; musBtn.setAttribute('aria-pressed', titleMusic.on() ? 'true' : 'false'); }
  musLabel(); root.appendChild(musBtn); musBtn.addEventListener('click', function (e) { e.stopPropagation(); titleMusic.toggle(); musLabel(); });
  function play() {
    if (!ready || root.classList.contains('gone')) return;
    titleMusic.stop(); musBtn.style.display = 'none';
    window.EVERDAWN_TITLE = false; EVERDAWN_TITLE = false;
    root.classList.add('gone'); if (document.body) document.body.style.overflow = prevOverflow;
    var game = document.getElementById('game'); if (game) { try { game.focus(); } catch (err) {} }
    setTimeout(function () { alive = false; root.remove(); window.removeEventListener('resize', resize); }, 1200);
  }
  // ----- the save slots: Play opens a list of five; pick one with a game in it to carry on, or an empty one to start anew -----
  var SEAS = ['Spring', 'Summer', 'Fall', 'Winter'], WDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var slots = document.createElement('div'); slots.className = 'ev-slots'; slots.setAttribute('role', 'dialog'); slots.setAttribute('aria-modal', 'true'); slots.setAttribute('aria-label', 'Choose a save slot');
  slots.innerHTML = '<div class="ev-scard"><h2>✦ Choose a Save ✦</h2><div class="ev-slist"></div><button type="button" class="ev-back">Back</button></div>';
  root.appendChild(slots);
  var slist = slots.querySelector('.ev-slist'), btnRow = root.querySelector('.ev-btns');
  function readSlot(n) { try { var d = JSON.parse(localStorage.getItem('everdawn-save-' + n)); return d && d.v === 1 && d.state ? d : null; } catch (err) { return null; } }
  function lastSlot() { try { return parseInt(localStorage.getItem('everdawn-last-slot'), 10) || 0; } catch (err) { return 0; } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slotRow(n) {
    var d = readSlot(n), row = document.createElement('div'); row.className = 'ev-slot';
    if (d) {
      var day = d.state.day || 1, when = WDAYS[(day - 1) % 7] + ' · ' + SEAS[Math.floor((day - 1) / 28) % 4] + ', Day ' + ((day - 1) % 28 + 1);
      var saved = d.savedAt ? 'Saved ' + new Date(d.savedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
      row.innerHTML = '<button type="button" class="ev-sbtn"><span class="ev-snum">' + n + '</span><span class="ev-stxt"><b>' + esc(d.name || when) + (n === lastSlot() ? '<span class="ev-last">Last played</span>' : '') + '</b>' + (d.name ? '<span>' + esc(when) + '</span>' : '') +
        '<span>🪙 ' + (d.state.coins || 0) + ' coins · 🌾 ' + (d.state.harvest || 0) + ' harvested</span>' + (saved ? '<i>' + esc(saved) + '</i>' : '') + '</span></button>' +
        (showBackups() && readBackups(n).length ? '<button type="button" class="ev-sdel ev-sbak" aria-label="Backups of the game in slot ' + n + '" title="Backups">⟲</button>' : '') +
        '<button type="button" class="ev-sdel" aria-label="Delete the game in slot ' + n + '" title="Delete">🗑</button>';
      row.querySelector('.ev-sbtn').addEventListener('click', function () { pickSlot(n, false); });
      var bakBtn = row.querySelector('.ev-sbak'); if (bakBtn) bakBtn.addEventListener('click', function () { backupList(n, row); });
      row.querySelector('.ev-sdel:not(.ev-sbak)').addEventListener('click', function () {   // (asking first: a deleted game can't come back)
        row.innerHTML = '<div class="ev-sask"><span>Delete the game in slot ' + n + '?</span><span><button type="button" class="yes">Delete</button><button type="button" class="no">Keep it</button></span></div>';
        row.querySelector('.yes').addEventListener('click', function () { try { localStorage.removeItem('everdawn-save-' + n); localStorage.removeItem('everdawn-save-' + n + '-backups'); } catch (err) {} var fresh = slotRow(n); slist.replaceChild(fresh, row); fresh.querySelector('.ev-sbtn').focus(); });
        row.querySelector('.no').addEventListener('click', function () { var back = slotRow(n); slist.replaceChild(back, row); back.querySelector('.ev-sbtn').focus(); });
        row.querySelector('.no').focus();
      });
    } else {
      row.innerHTML = '<button type="button" class="ev-sbtn empty"><span class="ev-snum">' + n + '</span><span class="ev-stxt"><b>✦ New Game</b><span>An empty slot</span></span></button>';
      row.querySelector('.ev-sbtn').addEventListener('click', function () { nameSlot(n, row); });
    }
    return row;
  }
  // ----- day backups ("Show Backup" set to Yes in Settings): a ⟲ button on a slot lists the backups of earlier days -----
  function showBackups() { try { return localStorage.getItem('everdawn-show-backup') === 'yes'; } catch (err) { return false; } }
  function readBackups(n) { try { return (JSON.parse(localStorage.getItem('everdawn-save-' + n + '-backups')) || []).filter(function (b) { return b && b.v === 1 && b.state; }); } catch (err) { return []; } }
  function dayName(day) { return WDAYS[(day - 1) % 7] + ' · ' + SEAS[Math.floor((day - 1) / 28) % 4] + ', Day ' + ((day - 1) % 28 + 1); }
  function backupList(n, row) {
    var list = readBackups(n);
    function back() { var fresh = slotRow(n); slist.replaceChild(fresh, row); fresh.querySelector('.ev-sbtn').focus(); }
    row.innerHTML = '<div class="ev-sname ev-bk"><label>Backups of slot ' + n + '</label>' + list.map(function (b, i) {
      var saved = b.savedAt ? 'Saved ' + new Date(b.savedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
      return '<button type="button" class="ev-sbtn" data-i="' + i + '"><span class="ev-stxt"><b>' + esc(dayName(b.state.day || 1)) + '</b><span>🪙 ' + (b.state.coins || 0) + ' coins · 🌾 ' + (b.state.harvest || 0) + ' harvested</span>' + (saved ? '<i>' + esc(saved) + '</i>' : '') + '</span></button>';
    }).join('') + '<span><button type="button" class="no">Back</button></span></div>';
    row.querySelector('.no').addEventListener('click', back);
    Array.prototype.forEach.call(row.querySelectorAll('.ev-bk .ev-sbtn'), function (btn) {
      btn.addEventListener('click', function () {                      // (asking first: it takes the slot back to that day)
        var b = list[+btn.getAttribute('data-i')];
        row.innerHTML = '<div class="ev-sask"><span>Go back to ' + esc(dayName(b.state.day || 1)) + '? Your game now becomes a backup.</span><span><button type="button" class="yes">Restore</button><button type="button" class="no">Cancel</button></span></div>';
        row.querySelector('.no').addEventListener('click', function () { backupList(n, row); });
        row.querySelector('.yes').addEventListener('click', function () {
          var now = readSlot(n), rest = list.filter(function (x) { return x !== b; });
          if (now) rest = [now].concat(rest.filter(function (x) { return x.state.day !== now.state.day; }));
          try { localStorage.setItem('everdawn-save-' + n, JSON.stringify(b)); localStorage.setItem('everdawn-save-' + n + '-backups', JSON.stringify(rest.slice(0, 3))); } catch (err) {}
          pickSlot(n, false);                                           // (and straight into the game, back on that day)
        });
        row.querySelector('.yes').focus();
      });
    });
    var first = row.querySelector('.ev-bk .ev-sbtn'); if (first) first.focus();
  }
  function openSlots() {
    if (!ready || root.classList.contains('gone')) return;
    slist.innerHTML = ''; for (var n = 1; n <= 5; n++) slist.appendChild(slotRow(n));
    slots.classList.add('open'); btnRow.style.visibility = 'hidden'; hint.style.visibility = 'hidden';
    var ls = lastSlot(), first = slist.children[(ls >= 1 && ls <= 5 ? ls : 1) - 1].querySelector('.ev-sbtn'); if (first) first.focus();
  }
  function closeSlots() { slots.classList.remove('open'); btnRow.style.visibility = ''; hint.style.visibility = ''; playBtn.focus(); }
  function pickSlot(n, fresh, name) { if (window.everdawnPickSlot) window.everdawnPickSlot(n, fresh, name); slots.classList.remove('open'); play(); }
  var naming = null;
  function nameSlot(n, row) {                                          // (a new game has to be named before it starts)
    row.innerHTML = '<div class="ev-sname"><label for="evName' + n + '">Name your save</label><input id="evName' + n + '" type="text" maxlength="24" autocomplete="off" spellcheck="false" placeholder="e.g. Moonpetal Farm">' +
      '<span><button type="button" class="go" disabled>Start</button><button type="button" class="no">Cancel</button></span></div>';
    var inp = row.querySelector('input'), go = row.querySelector('.go');
    function cancel() { naming = null; var back = slotRow(n); slist.replaceChild(back, row); back.querySelector('.ev-sbtn').focus(); }
    function start() { var nm = inp.value.replace(/\s+/g, ' ').trim(); if (!nm) { inp.focus(); return; } naming = null; pickSlot(n, true, nm); }
    inp.addEventListener('input', function () { go.disabled = !inp.value.trim(); });
    inp.addEventListener('keydown', function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); start(); } else if (e.key === 'Escape') { e.preventDefault(); cancel(); } });   // (typing a name never reaches the game's own keys)
    go.addEventListener('click', start); row.querySelector('.no').addEventListener('click', cancel);
    naming = cancel; inp.focus();
  }
  slots.querySelector('.ev-back').addEventListener('click', closeSlots);
  slots.addEventListener('click', function (e) { if (e.target === slots) closeSlots(); });
  // ----- the Settings panel: pages you flip through with the arrows (Game, Display, then Audio) -----
  // Brightness, on the Display page: 0 to 12, starting in the middle at 6 (the game as it's always looked). Lower
  // darkens the game, higher brightens it, from half as bright at 0 to half as bright again at 12; the title screen
  // follows along, so you can see the change as you slide it. It's remembered
  function brightNow() { try { var b = parseInt(localStorage.getItem('everdawn-brightness'), 10); if (b >= 0 && b <= 12) return b; } catch (err) {} return 6; }
  function applyBright(b) { document.documentElement.classList.toggle('ev-bright', b !== 6); document.documentElement.style.setProperty('--ev-bright', String(0.5 + b / 12)); }
  applyBright(brightNow());
  // Text Size, on the Display page: how big what the townsfolk say is, from 80% to 150% (100% to start). There's no one
  // to talk to yet; when there is, their dialogue box uses font-size: var(--ev-dialogue-size) and follows this. It's
  // remembered
  function textSizeNow() { try { var t = parseInt(localStorage.getItem('everdawn-text-size'), 10); if (t >= 80 && t <= 150) return t; } catch (err) {} return 100; }
  function applyTextSize(t) { document.documentElement.style.setProperty('--ev-dialogue-size', (17 * t / 100) + 'px'); }
  applyTextSize(textSizeNow());
  // Bold Text, on the Display page: On puts everything the townsfolk say in bold; Off (to start) leaves it as normal
  // text. Their dialogue box uses font-weight: var(--ev-dialogue-weight). It's remembered
  function boldNow() { try { return localStorage.getItem('everdawn-bold-text') === 'on'; } catch (err) { return false; } }
  function applyBold(on) { document.documentElement.style.setProperty('--ev-dialogue-weight', on ? '700' : '400'); }
  applyBold(boldNow());
  function timeNow() { try { var t = parseFloat(localStorage.getItem('everdawn-time-speed')); if (t >= 50 && t <= 100) return t; } catch (err) {} return 50; }
  function zoomNow() { try { var z = parseFloat(localStorage.getItem('everdawn-zoom')); if (z >= 6 && z <= 26) return z; } catch (err) {} return 14; }
  var SET_PAGES = [{ name: 'Game', build: function (body) {                // (Game: how far the camera sits from you, how fast time goes, and more)
    body.innerHTML = '<div class="ev-srow"><div class="ev-lrow"><label for="evZoom">Adjust Camera Zoom</label><output for="evZoom" id="evZoomPct"></output></div><div class="ev-range"><span>0%</span><input type="range" id="evZoom" min="0" max="20" step="0.5"><span>100%</span></div></div>' +
      '<div class="ev-srow"><div class="ev-lrow"><label for="evTime">Game Time Speed</label><output for="evTime" id="evTimePct"></output></div><div class="ev-range"><span>50%</span><input type="range" id="evTime" min="50" max="100" step="5"><span>100%</span></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evMoveL">Movement Type</span><div class="ev-seg" role="group" aria-labelledby="evMoveL"><button type="button" data-m="walk">Walk</button><button type="button" data-m="jog">Jog</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evStoreL">Storage Drag &amp; Drop</span><div class="ev-seg" role="group" aria-labelledby="evStoreL"><button type="button" data-s="off">Disabled</button><button type="button" data-s="on">Enabled</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evQuestL">Display Quest HUD</span><div class="ev-seg" role="group" aria-labelledby="evQuestL"><button type="button" data-q="show">Show</button><button type="button" data-q="hide">Hide</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evTypeL">Typewriter Effect</span><div class="ev-seg" role="group" aria-labelledby="evTypeL"><button type="button" data-t="off">Disabled</button><button type="button" data-t="on">Enabled</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evTileL">Tile Highlight While Moving</span><div class="ev-seg" role="group" aria-labelledby="evTileL"><button type="button" data-h="off">Disabled</button><button type="button" data-h="on">Enabled</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evHourL">Game Time Hour Format</span><div class="ev-seg" role="group" aria-labelledby="evHourL"><button type="button" data-f="12">AM/PM</button><button type="button" data-f="24">24 Hour</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evCombatL">Combat Mode</span><div class="ev-seg" role="group" aria-labelledby="evCombatL"><button type="button" data-c="default">Default</button><button type="button" data-c="passive">Passive</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evBakL">Show Backup</span><div class="ev-seg" role="group" aria-labelledby="evBakL"><button type="button" data-k="no">No</button><button type="button" data-k="yes">Yes</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evJealL">Enable Jealousy</span><div class="ev-seg" role="group" aria-labelledby="evJealL"><button type="button" data-j="no">No</button><button type="button" data-j="yes">Yes</button></div></div>' +
      '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evAnimL">Enable Excessive Animations</span><div class="ev-seg" role="group" aria-labelledby="evAnimL"><button type="button" data-a="no">No</button><button type="button" data-a="yes">Yes</button></div></div>';
    var mv = 'walk'; try { if (localStorage.getItem('everdawn-move') === 'jog') mv = 'jog'; } catch (err) {}
    var segBtns = body.querySelectorAll('.ev-seg button[data-m]');
    function showMove() { for (var b = 0; b < segBtns.length; b++) { var on = segBtns[b].getAttribute('data-m') === mv; segBtns[b].classList.toggle('on', on); segBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb = 0; sb < segBtns.length; sb++) segBtns[sb].addEventListener('click', function () {   // (Movement Type: Walk or Jog)
      mv = this.getAttribute('data-m'); showMove(); try { localStorage.setItem('everdawn-move', mv); } catch (err) {} if (window.everdawnSetMove) window.everdawnSetMove(mv); });
    showMove();
    var sd = 'off'; try { if (localStorage.getItem('everdawn-storage-drag') === 'on') sd = 'on'; } catch (err) {}   // (Storage Drag & Drop: Disabled or Enabled)
    var sdBtns = body.querySelectorAll('.ev-seg button[data-s]');
    function showStore() { for (var b = 0; b < sdBtns.length; b++) { var on = sdBtns[b].getAttribute('data-s') === sd; sdBtns[b].classList.toggle('on', on); sdBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb2 = 0; sb2 < sdBtns.length; sb2++) sdBtns[sb2].addEventListener('click', function () {
      sd = this.getAttribute('data-s'); showStore(); try { localStorage.setItem('everdawn-storage-drag', sd); } catch (err) {} if (window.everdawnSetStorageDrag) window.everdawnSetStorageDrag(sd === 'on'); });
    showStore();
    var qh = 'show'; try { if (localStorage.getItem('everdawn-quest-hud') === 'hide') qh = 'hide'; } catch (err) {}   // (Display Quest HUD: Show or Hide)
    var qhBtns = body.querySelectorAll('.ev-seg button[data-q]');
    function showQuest() { for (var b = 0; b < qhBtns.length; b++) { var on = qhBtns[b].getAttribute('data-q') === qh; qhBtns[b].classList.toggle('on', on); qhBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb3 = 0; sb3 < qhBtns.length; sb3++) qhBtns[sb3].addEventListener('click', function () {
      qh = this.getAttribute('data-q'); showQuest(); try { localStorage.setItem('everdawn-quest-hud', qh); } catch (err) {} if (window.everdawnSetQuestHud) window.everdawnSetQuestHud(qh === 'show'); });
    showQuest();
    var tw = 'off'; try { if (localStorage.getItem('everdawn-typewriter') === 'on') tw = 'on'; } catch (err) {}   // (Typewriter Effect: Disabled or Enabled)
    var twBtns = body.querySelectorAll('.ev-seg button[data-t]');
    function showType() { for (var b = 0; b < twBtns.length; b++) { var on = twBtns[b].getAttribute('data-t') === tw; twBtns[b].classList.toggle('on', on); twBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb4 = 0; sb4 < twBtns.length; sb4++) twBtns[sb4].addEventListener('click', function () {
      tw = this.getAttribute('data-t'); showType(); try { localStorage.setItem('everdawn-typewriter', tw); } catch (err) {} if (window.everdawnSetTypewriter) window.everdawnSetTypewriter(tw === 'on'); });
    showType();
    var th = 'on'; try { if (localStorage.getItem('everdawn-tile-highlight') === 'off') th = 'off'; } catch (err) {}   // (Tile Highlight While Moving: Disabled or Enabled)
    var thBtns = body.querySelectorAll('.ev-seg button[data-h]');
    function showTileHl() { for (var b = 0; b < thBtns.length; b++) { var on = thBtns[b].getAttribute('data-h') === th; thBtns[b].classList.toggle('on', on); thBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb5 = 0; sb5 < thBtns.length; sb5++) thBtns[sb5].addEventListener('click', function () {
      th = this.getAttribute('data-h'); showTileHl(); try { localStorage.setItem('everdawn-tile-highlight', th); } catch (err) {} if (window.everdawnSetTileHighlight) window.everdawnSetTileHighlight(th === 'on'); });
    showTileHl();
    var hf = '12'; try { if (localStorage.getItem('everdawn-hour-format') === '24') hf = '24'; } catch (err) {}   // (Game Time Hour Format: AM/PM or 24 Hour)
    var hfBtns = body.querySelectorAll('.ev-seg button[data-f]');
    function showHourFmt() { for (var b = 0; b < hfBtns.length; b++) { var on = hfBtns[b].getAttribute('data-f') === hf; hfBtns[b].classList.toggle('on', on); hfBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb6 = 0; sb6 < hfBtns.length; sb6++) hfBtns[sb6].addEventListener('click', function () {
      hf = this.getAttribute('data-f'); showHourFmt(); try { localStorage.setItem('everdawn-hour-format', hf); } catch (err) {} if (window.everdawnSetHourFormat) window.everdawnSetHourFormat(hf === '24'); });
    showHourFmt();
    var cm = 'default'; try { if (localStorage.getItem('everdawn-combat-mode') === 'passive') cm = 'passive'; } catch (err) {}   // (Combat Mode: Default or Passive)
    var cmBtns = body.querySelectorAll('.ev-seg button[data-c]');
    function showCombat() { for (var b = 0; b < cmBtns.length; b++) { var on = cmBtns[b].getAttribute('data-c') === cm; cmBtns[b].classList.toggle('on', on); cmBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb7 = 0; sb7 < cmBtns.length; sb7++) cmBtns[sb7].addEventListener('click', function () {
      cm = this.getAttribute('data-c'); showCombat(); try { localStorage.setItem('everdawn-combat-mode', cm); } catch (err) {} if (window.everdawnSetCombatMode) window.everdawnSetCombatMode(cm === 'passive'); });
    showCombat();
    var bk = showBackups() ? 'yes' : 'no';                               // (Show Backup: No or Yes; Yes puts a ⟲ Backups button on save slots that have them)
    var bkBtns = body.querySelectorAll('.ev-seg button[data-k]');
    function showBak() { for (var b = 0; b < bkBtns.length; b++) { var on = bkBtns[b].getAttribute('data-k') === bk; bkBtns[b].classList.toggle('on', on); bkBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb8 = 0; sb8 < bkBtns.length; sb8++) bkBtns[sb8].addEventListener('click', function () {
      bk = this.getAttribute('data-k'); showBak(); try { localStorage.setItem('everdawn-show-backup', bk); } catch (err) {} });
    showBak();
    var jl = 'no'; try { if (localStorage.getItem('everdawn-jealousy') === 'yes') jl = 'yes'; } catch (err) {}   // (Enable Jealousy: No or Yes)
    var jlBtns = body.querySelectorAll('.ev-seg button[data-j]');
    function showJeal() { for (var b = 0; b < jlBtns.length; b++) { var on = jlBtns[b].getAttribute('data-j') === jl; jlBtns[b].classList.toggle('on', on); jlBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb9 = 0; sb9 < jlBtns.length; sb9++) jlBtns[sb9].addEventListener('click', function () {
      jl = this.getAttribute('data-j'); showJeal(); try { localStorage.setItem('everdawn-jealousy', jl); } catch (err) {} if (window.everdawnSetJealousy) window.everdawnSetJealousy(jl === 'yes'); });
    showJeal();
    var an = 'yes'; try { if (localStorage.getItem('everdawn-excessive-anim') === 'no') an = 'no'; } catch (err) {}   // (Enable Excessive Animations: No or Yes)
    var anBtns = body.querySelectorAll('.ev-seg button[data-a]');
    function showAnim() { for (var b = 0; b < anBtns.length; b++) { var on = anBtns[b].getAttribute('data-a') === an; anBtns[b].classList.toggle('on', on); anBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var sb10 = 0; sb10 < anBtns.length; sb10++) anBtns[sb10].addEventListener('click', function () {
      an = this.getAttribute('data-a'); showAnim(); document.documentElement.classList.toggle('ev-calm', an === 'no'); try { localStorage.setItem('everdawn-excessive-anim', an); } catch (err) {} if (window.everdawnSetExcessiveAnim) window.everdawnSetExcessiveAnim(an === 'yes'); });
    showAnim();
    var zi = body.querySelector('#evZoom'), zp = body.querySelector('#evZoomPct'); zi.value = 26 - zoomNow();
    function showPct() { zp.textContent = Math.round(parseFloat(zi.value) * 5) + '%'; } showPct();   // (0% is as far out as it goes, 100% as close in)
    zi.addEventListener('input', function () { showPct(); var d = 26 - parseFloat(zi.value); try { localStorage.setItem('everdawn-zoom', String(d)); } catch (err) {} if (window.everdawnSetZoom) window.everdawnSetZoom(d); });
    var ti = body.querySelector('#evTime'), tp = body.querySelector('#evTimePct'); ti.value = timeNow();   // (Game Time Speed: 50% is the usual pace, 100% twice as fast)
    function showTime() { tp.textContent = Math.round(parseFloat(ti.value)) + '%'; } showTime();
    ti.addEventListener('input', function () { showTime(); var t = parseFloat(ti.value); try { localStorage.setItem('everdawn-time-speed', String(t)); } catch (err) {} if (window.everdawnSetTimeSpeed) window.everdawnSetTimeSpeed(t); });
  } }, { name: 'Display', build: function (body) {                     // (Display: how bright the game looks, and how big and bold the dialogue is)
    body.innerHTML = '<div class="ev-srow"><div class="ev-lrow"><label for="evBright">Brightness</label><output for="evBright" id="evBrightNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evBright" min="0" max="12" step="1"><span>12</span></div></div>';
    var bi = body.querySelector('#evBright'), bn = body.querySelector('#evBrightNum'); bi.value = brightNow();   // (Brightness: 0 to 12, 6 in the middle is the usual look)
    function showBright() { bn.textContent = bi.value; } showBright();
    bi.addEventListener('input', function () { showBright(); try { localStorage.setItem('everdawn-brightness', bi.value); } catch (err) {} applyBright(+bi.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evText">Text Size</label><output for="evText" id="evTextPct"></output></div><div class="ev-range"><span>A</span><input type="range" id="evText" min="80" max="150" step="10"><span style="font-size:20px">A</span></div>' +
      '<p class="ev-dlg-sample">“Good morning! The Dawn Tree is blooming today.”</p></div>');
    var ts = body.querySelector('#evText'), tsp = body.querySelector('#evTextPct'); ts.value = textSizeNow();   // (Text Size: 80% to 150%, with a sample line that changes as you slide)
    function showTextSize() { tsp.textContent = ts.value + '%'; } showTextSize();
    ts.addEventListener('input', function () { showTextSize(); try { localStorage.setItem('everdawn-text-size', ts.value); } catch (err) {} applyTextSize(+ts.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow ev-tog"><span class="ev-lbl" id="evBoldL">Bold Text</span><div class="ev-seg" role="group" aria-labelledby="evBoldL"><button type="button" data-b="on">On</button><button type="button" data-b="off">Off</button></div></div>');
    var bd = boldNow() ? 'on' : 'off', bdBtns = body.querySelectorAll('.ev-seg button[data-b]');   // (Bold Text: On or Off; the sample line above shows it)
    function showBold() { for (var b = 0; b < bdBtns.length; b++) { var on = bdBtns[b].getAttribute('data-b') === bd; bdBtns[b].classList.toggle('on', on); bdBtns[b].setAttribute('aria-pressed', on ? 'true' : 'false'); } }
    for (var bb = 0; bb < bdBtns.length; bb++) bdBtns[bb].addEventListener('click', function () {
      bd = this.getAttribute('data-b'); showBold(); try { localStorage.setItem('everdawn-bold-text', bd); } catch (err) {} applyBold(bd === 'on'); });
    showBold();
  } }, { name: 'Audio', build: function (body) {                       // (Audio: how loud everything is, the sound effects, the background sounds, her footsteps, the music and the pets)
    body.innerHTML = '<div class="ev-srow"><div class="ev-lrow"><label for="evVol">Master Volume</label><output for="evVol" id="evVolNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evVol" min="0" max="10" step="1"><span>10</span></div></div>';
    var vi = body.querySelector('#evVol'), vn = body.querySelector('#evVolNum'); vi.value = volumeNow();   // (Master Volume: 0 to 10, 5 is the usual)
    function showVol() { vn.textContent = vi.value; } showVol();
    vi.addEventListener('input', function () { showVol(); try { localStorage.setItem('everdawn-master-volume', vi.value); } catch (err) {} applyVolume(+vi.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evSfx">SFX Volume</label><output for="evSfx" id="evSfxNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evSfx" min="0" max="10" step="1"><span>10</span></div></div>');
    var si = body.querySelector('#evSfx'), sn = body.querySelector('#evSfxNum'); si.value = sfxNow();   // (SFX Volume: 0 to 10, 5 is the usual)
    function showSfx() { sn.textContent = si.value; } showSfx();
    si.addEventListener('input', function () { showSfx(); try { localStorage.setItem('everdawn-sfx-volume', si.value); } catch (err) {} applySfx(+si.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evAmb">Ambient Volume</label><output for="evAmb" id="evAmbNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evAmb" min="0" max="10" step="1"><span>10</span></div></div>');
    var ai = body.querySelector('#evAmb'), an2 = body.querySelector('#evAmbNum'); ai.value = ambientNow();   // (Ambient Volume: 0 to 10, 5 is the usual)
    function showAmb() { an2.textContent = ai.value; } showAmb();
    ai.addEventListener('input', function () { showAmb(); try { localStorage.setItem('everdawn-ambient-volume', ai.value); } catch (err) {} applyAmbient(+ai.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evFoot">Footsteps Volume</label><output for="evFoot" id="evFootNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evFoot" min="0" max="10" step="1"><span>10</span></div></div>');
    var fi = body.querySelector('#evFoot'), fn2 = body.querySelector('#evFootNum'), fv = 5;   // (Footsteps Volume: 0 to 10, 5 is the usual)
    try { var fs = parseInt(localStorage.getItem('everdawn-footsteps-volume'), 10); if (fs >= 0 && fs <= 10) fv = fs; } catch (err) {}
    fi.value = fv; function showFoot() { fn2.textContent = fi.value; } showFoot();
    fi.addEventListener('input', function () { showFoot(); try { localStorage.setItem('everdawn-footsteps-volume', fi.value); } catch (err) {} if (window.everdawnSetFootsteps) window.everdawnSetFootsteps(+fi.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evMus">Music Volume</label><output for="evMus" id="evMusNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evMus" min="0" max="10" step="1"><span>10</span></div></div>');
    var mi = body.querySelector('#evMus'), mn = body.querySelector('#evMusNum'); mi.value = musicNow();   // (Music Volume: 0 to 10, 5 is the usual)
    function showMus() { mn.textContent = mi.value; } showMus();
    mi.addEventListener('input', function () { showMus(); try { localStorage.setItem('everdawn-music-volume', mi.value); } catch (err) {} applyMusic(+mi.value); });
    body.insertAdjacentHTML('beforeend', '<div class="ev-srow"><div class="ev-lrow"><label for="evPet">Pet Sound</label><output for="evPet" id="evPetNum"></output></div><div class="ev-range"><span>0</span><input type="range" id="evPet" min="0" max="10" step="1"><span>10</span></div></div>');
    var pi = body.querySelector('#evPet'), pn = body.querySelector('#evPetNum'); pi.value = petNow();   // (Pet Sound: 0 to 10, 5 is the usual)
    function showPet() { pn.textContent = pi.value; } showPet();
    pi.addEventListener('input', function () { showPet(); try { localStorage.setItem('everdawn-pet-sound', pi.value); } catch (err) {} applyPet(+pi.value); });
  } }], setPage = 0;
  var sett = document.createElement('div'); sett.className = 'ev-slots ev-sett'; sett.setAttribute('role', 'dialog'); sett.setAttribute('aria-modal', 'true'); sett.setAttribute('aria-label', 'Settings');
  sett.innerHTML = '<div class="ev-scard"><div class="ev-sethead"><button type="button" class="ev-pg prev" aria-label="Previous page">‹</button><h2></h2><button type="button" class="ev-pg next" aria-label="Next page">›</button></div>' +
    '<div class="ev-dots"></div><div class="ev-setbody"></div><button type="button" class="ev-back">Done</button></div>';
  root.appendChild(sett);
  var setTitle = sett.querySelector('h2'), setPrev = sett.querySelector('.prev'), setNext = sett.querySelector('.next'), setDots = sett.querySelector('.ev-dots'), setBody = sett.querySelector('.ev-setbody');
  function showSetPage(i) {
    setPage = Math.max(0, Math.min(SET_PAGES.length - 1, i)); var pg = SET_PAGES[setPage];
    setTitle.textContent = '✦ ' + pg.name + ' ✦'; setBody.innerHTML = ''; if (pg.build) pg.build(setBody);
    setPrev.disabled = setPage === 0; setNext.disabled = setPage === SET_PAGES.length - 1;
    setDots.innerHTML = SET_PAGES.map(function (p, k) { return '<i' + (k === setPage ? ' class="on"' : '') + '></i>'; }).join('');
  }
  function openSettings() { if (!ready || root.classList.contains('gone')) return; showSetPage(setPage); sett.classList.add('open'); btnRow.style.visibility = 'hidden'; hint.style.visibility = 'hidden'; sett.querySelector('.ev-back').focus(); }
  function closeSettings() { sett.classList.remove('open'); btnRow.style.visibility = ''; hint.style.visibility = ''; optBtn.focus(); }
  setPrev.addEventListener('click', function () { showSetPage(setPage - 1); });
  setNext.addEventListener('click', function () { showSetPage(setPage + 1); });
  sett.querySelector('.ev-back').addEventListener('click', closeSettings);
  sett.addEventListener('click', function (e) { if (e.target === sett) closeSettings(); });
  optBtn.addEventListener('click', openSettings);
  playBtn.addEventListener('click', openSlots);
  window.addEventListener('keydown', function (e) {
    if (slots.classList.contains('open')) { if (e.target && e.target.tagName === 'INPUT') return; if (e.code === 'Escape') { e.preventDefault(); if (naming) naming(); else closeSlots(); } return; }
    if (sett.classList.contains('open') && e.target && e.target.type === 'range' && /^Arrow|^Home$|^End$|^Page/.test(e.key)) { e.stopPropagation(); return; }   // (arrow keys on a slider move the slider, and never reach the game behind)
    if (sett.classList.contains('open')) { if (e.code === 'Escape') { e.preventDefault(); closeSettings(); } else if ((e.code === 'ArrowLeft' || e.code === 'ArrowRight') && !(e.target && e.target.type === 'range')) { e.preventDefault(); showSetPage(setPage + (e.code === 'ArrowLeft' ? -1 : 1)); } return; }   // (in Settings: Esc closes it, and the arrow keys flip the pages)   // (in the slot list, Enter just presses whichever slot you're on)
    if (e.target === optBtn) return; if (root.isConnected && ready && (e.code === 'Enter' || e.code === 'Space' || e.code === 'NumpadEnter')) { e.preventDefault(); openSlots(); } }, true);
  return {
    progress: function (p, tip) { target = Math.max(target, p); if (tip) { setTip(tip); tipAt = performance.now(); } },
    ready: function () { ready = true; target = 100; setTip('All ready!'); },
    fail: function (msg) { setTip(msg); pctEl.textContent = ''; }
  };
})();

(function () {
  function build(THREE) {                                              // (let the title screen paint first, then build the island: that takes a moment)
    everdawnTitle.progress(55, 'Building the island…');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      setTimeout(function () {
        try { startGame(THREE); } catch (err) { everdawnTitle.fail('Something went wrong loading the game'); throw err; }
        everdawnTitle.progress(85, 'Opening the gate…');
        setTimeout(everdawnTitle.ready, 600);
      }, 60);
    }); });
  }
  if (window.THREE) { build(window.THREE); return; }
  var creep = setInterval(function () { everdawnTitle.progress(Math.min(45, 4 + (Date.now() - creepAt) / 120)); }, 200), creepAt = Date.now();   // (fetching the 3D engine)
  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = function () { clearInterval(creep); build(window.THREE); };
  s.onerror = function () { clearInterval(creep); everdawnTitle.fail('Could not load the 3D engine. Check your internet connection.'); showToast('Could not load the 3D engine. Check your internet connection.', 60000); };
  document.head.appendChild(s);
})();
